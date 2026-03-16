import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function RateLimiting() {
  return (
    <article className="prose-content">
      <h2>Rate Limiting for Agent Systems</h2>
      <p>
        Agent systems interact with two types of rate limits: the API provider's limits
        (requests per minute, tokens per minute) and your own application-level limits
        (requests per user, per tenant). Staying within provider limits requires client-side
        throttling and intelligent backoff. Enforcing application limits protects against
        abuse and ensures fair resource distribution across users.
      </p>

      <ArchitectureDiagram
        title="Rate Limiting Architecture"
        width={700}
        height={260}
        nodes={[
          { id: 'user', label: 'User\nRequests', type: 'external', x: 60, y: 130 },
          { id: 'app_rl', label: 'App-Level\nRate Limiter', type: 'tool', x: 240, y: 130 },
          { id: 'agent', label: 'Agent\nService', type: 'agent', x: 420, y: 130 },
          { id: 'client_rl', label: 'Client-Side\nThrottler', type: 'tool', x: 580, y: 60 },
          { id: 'api', label: 'LLM\nAPI', type: 'llm', x: 660, y: 130 },
        ]}
        edges={[
          { from: 'user', to: 'app_rl' },
          { from: 'app_rl', to: 'agent', label: 'allow' },
          { from: 'agent', to: 'client_rl' },
          { from: 'client_rl', to: 'api' },
        ]}
      />

      <h2>Client-Side Throttling</h2>

      <ConceptBlock term="Token Bucket Rate Limiter">
        <p>
          A token bucket limiter maintains a bucket of tokens that refills at a fixed rate.
          Each LLM API call consumes tokens proportional to its estimated cost (requests or
          actual tokens). When the bucket is empty, calls are queued until tokens are
          available. This smooths out bursts and prevents 429 rate limit errors from the
          provider.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Token Bucket Client-Side Throttler"
        tabs={{
          python: `import asyncio
import time
import anthropic
from dataclasses import dataclass, field

@dataclass
class TokenBucketThrottler:
    """
    Token bucket for rate limiting LLM API calls.
    capacity: maximum tokens in bucket
    refill_rate: tokens added per second
    """
    capacity: float
    refill_rate: float  # tokens per second
    _tokens: float = field(init=False)
    _last_refill: float = field(init=False)
    _lock: asyncio.Lock = field(default_factory=asyncio.Lock, init=False)

    def __post_init__(self):
        self._tokens = self.capacity
        self._last_refill = time.monotonic()

    async def acquire(self, cost: float = 1.0) -> None:
        """Wait until cost tokens are available, then consume them."""
        async with self._lock:
            while True:
                # Refill bucket
                now = time.monotonic()
                elapsed = now - self._last_refill
                self._tokens = min(
                    self.capacity,
                    self._tokens + elapsed * self.refill_rate
                )
                self._last_refill = now

                if self._tokens >= cost:
                    self._tokens -= cost
                    return

                # Calculate wait time until cost tokens are available
                wait = (cost - self._tokens) / self.refill_rate
            # Release lock while waiting, re-acquire to check again
        await asyncio.sleep(wait)

# Configure for Anthropic API limits
# Example: 4000 RPM = ~66 RPS → refill_rate=66, capacity=200 (burst)
rpm_throttler = TokenBucketThrottler(capacity=200, refill_rate=66.0)

# Token-based throttler: 100K TPM → ~1667 tokens/sec
tpm_throttler = TokenBucketThrottler(capacity=10_000, refill_rate=1667.0)

client = anthropic.AsyncAnthropic()

async def throttled_llm_call(messages: list, estimated_tokens: int = 2000) -> str:
    """Call LLM API respecting both RPM and TPM limits."""
    # Acquire both request and token slots
    await asyncio.gather(
        rpm_throttler.acquire(cost=1),
        tpm_throttler.acquire(cost=estimated_tokens),
    )

    response = await client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=messages,
    )
    return response.content[0].text

# --- High-throughput batch processing ---
async def process_batch(items: list[str], max_concurrent: int = 50) -> list[str]:
    """Process a batch of items with throttling."""
    semaphore = asyncio.Semaphore(max_concurrent)

    async def process_one(item: str) -> str:
        async with semaphore:
            return await throttled_llm_call(
                [{"role": "user", "content": item}]
            )

    return await asyncio.gather(*[process_one(item) for item in items])`,
        }}
      />

      <h2>Handling 429 Rate Limit Responses</h2>

      <ConceptBlock term="Retry-After Header Handling">
        <p>
          When a 429 response is received, the Anthropic API includes a
          <code>retry-after</code> header indicating how many seconds to wait before
          retrying. Always honour this header — retrying immediately will result in
          another 429. The Anthropic Python SDK handles this automatically when
          <code>max_retries</code> is set.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Respecting Retry-After Headers"
        tabs={{
          python: `import anthropic
import time
import logging

logger = logging.getLogger(__name__)

# The SDK handles 429 retry-after automatically when max_retries is set
client = anthropic.Anthropic(
    max_retries=4,   # Built-in exponential backoff with retry-after
    timeout=60.0,
)

# --- Manual retry-after handling for custom control ---
def call_with_retry_after(messages: list, max_attempts: int = 5) -> str:
    for attempt in range(max_attempts):
        try:
            response = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=1024,
                messages=messages,
            )
            return response.content[0].text
        except anthropic.RateLimitError as e:
            if attempt == max_attempts - 1:
                raise

            # Extract retry-after from response headers
            retry_after = 10.0  # default
            if hasattr(e, "response") and e.response:
                retry_after_header = e.response.headers.get("retry-after")
                if retry_after_header:
                    try:
                        retry_after = float(retry_after_header)
                    except ValueError:
                        pass

            logger.warning(
                "Rate limited on attempt %d/%d. Waiting %.1fs",
                attempt + 1, max_attempts, retry_after
            )
            time.sleep(retry_after)
        except anthropic.APIStatusError as e:
            if e.status_code in (500, 502, 503, 529):
                wait = 2 ** attempt
                logger.warning("Server error %d, retrying in %ds", e.status_code, wait)
                time.sleep(wait)
            else:
                raise

    raise RuntimeError(f"Failed after {max_attempts} attempts")`,
        }}
      />

      <h2>Application-Level Rate Limiting</h2>

      <PatternBlock
        name="Sliding Window Rate Limiter"
        category="Scalability"
        whenToUse="When enforcing per-user or per-tenant rate limits to prevent any single actor from consuming disproportionate API quota."
      >
        <p>
          A sliding window rate limiter in Redis tracks request counts in a rolling time
          window per user. Unlike fixed windows (which allow burst at window boundaries),
          a sliding window smoothly distributes allowed requests across time.
        </p>
      </PatternBlock>

      <SDKExample
        title="Per-User Rate Limiting with Redis Sliding Window"
        tabs={{
          python: `import redis
import time

r = redis.Redis(host="redis", port=6379, decode_responses=True)

def is_rate_limited(
    user_id: str,
    max_requests: int = 20,
    window_seconds: int = 60,
) -> tuple[bool, dict]:
    """
    Sliding window rate limiter.
    Returns (is_limited, info_dict).
    """
    key = f"ratelimit:user:{user_id}"
    now = time.time()
    window_start = now - window_seconds

    pipe = r.pipeline()
    # Remove requests outside the window
    pipe.zremrangebyscore(key, 0, window_start)
    # Count requests in window
    pipe.zcard(key)
    # Add current request timestamp
    pipe.zadd(key, {str(now): now})
    # Set key TTL
    pipe.expire(key, window_seconds + 1)
    results = pipe.execute()

    current_count = results[1]  # Count before adding current request

    if current_count >= max_requests:
        # Find oldest request in window to calculate reset time
        oldest = r.zrange(key, 0, 0, withscores=True)
        reset_at = (oldest[0][1] + window_seconds) if oldest else now + window_seconds

        return True, {
            "limited": True,
            "limit": max_requests,
            "remaining": 0,
            "reset_at": reset_at,
            "retry_after": max(0, reset_at - now),
        }

    return False, {
        "limited": False,
        "limit": max_requests,
        "remaining": max_requests - current_count - 1,
        "reset_at": now + window_seconds,
        "retry_after": 0,
    }

# Middleware usage
def handle_agent_request(user_id: str, user_message: str) -> dict:
    limited, rate_info = is_rate_limited(user_id, max_requests=20, window_seconds=60)
    if limited:
        return {
            "error": "rate_limited",
            "message": f"Too many requests. Please wait {rate_info['retry_after']:.0f} seconds.",
            "retry_after": rate_info["retry_after"],
        }
    # Proceed with agent run
    return {"response": "...", "rate_info": rate_info}`,
        }}
      />

      <BestPracticeBlock title="Expose Rate Limit Headers to Clients">
        <p>
          Include <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, and
          <code>X-RateLimit-Reset</code> headers in every response. Well-behaved clients
          can use these headers to proactively throttle themselves rather than waiting for
          429 responses. This reduces unnecessary requests to your backend and provides
          a better developer experience for API consumers.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Separate Quotas for Sync and Async APIs">
        <p>
          Synchronous (blocking) API calls compete for connection pool capacity. Asynchronous
          (job queue) requests do not. Apply stricter rate limits to synchronous endpoints —
          a user making 50 concurrent blocking requests holds 50 threads. The same 50 jobs
          submitted to a queue are processed at the workers' pace without resource contention.
        </p>
      </NoteBlock>
    </article>
  )
}
