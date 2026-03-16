import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function ReliabilityPatterns() {
  return (
    <article className="prose-content">
      <h2>Reliability Patterns for Production Agents</h2>
      <p>
        Production agent systems face a unique set of reliability challenges: LLM APIs have
        higher latency and lower SLAs than traditional services, tool calls can fail silently,
        and multi-step agent loops amplify individual failure rates. Applying proven reliability
        engineering patterns — circuit breakers, retries with backoff, timeouts, and graceful
        degradation — is essential before any agent handles real user traffic.
      </p>

      <ArchitectureDiagram
        title="Reliability Layers in an Agent System"
        width={700}
        height={260}
        nodes={[
          { id: 'client', label: 'Client', type: 'external', x: 60, y: 130 },
          { id: 'circuit', label: 'Circuit\nBreaker', type: 'tool', x: 220, y: 130 },
          { id: 'agent', label: 'Agent\nLoop', type: 'agent', x: 390, y: 130 },
          { id: 'llm', label: 'LLM API', type: 'llm', x: 570, y: 60 },
          { id: 'tools', label: 'Tools', type: 'tool', x: 570, y: 200 },
          { id: 'fallback', label: 'Fallback\nResponse', type: 'store', x: 220, y: 230 },
        ]}
        edges={[
          { from: 'client', to: 'circuit' },
          { from: 'circuit', to: 'agent', label: 'closed' },
          { from: 'circuit', to: 'fallback', label: 'open' },
          { from: 'agent', to: 'llm' },
          { from: 'agent', to: 'tools' },
        ]}
      />

      <h2>Retry with Exponential Backoff</h2>

      <ConceptBlock term="Exponential Backoff with Jitter">
        <p>
          When an LLM API or tool call fails with a transient error (rate limit, 503, timeout),
          retrying immediately usually fails again. Exponential backoff waits longer between
          each retry attempt. Adding random jitter prevents a thundering herd when many agent
          instances retry simultaneously after a shared outage.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Retry with Exponential Backoff"
        tabs={{
          python: `import anthropic
import time
import random
import logging
from typing import Any

logger = logging.getLogger(__name__)

def with_retry(
    fn,
    max_attempts: int = 4,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    retryable_codes: set[int] = {429, 500, 502, 503, 504},
) -> Any:
    """Call fn with exponential backoff retry on transient failures."""
    last_error = None
    for attempt in range(max_attempts):
        try:
            return fn()
        except anthropic.APIStatusError as e:
            if e.status_code not in retryable_codes:
                raise  # Don't retry 4xx (except 429)
            last_error = e
        except anthropic.APIConnectionError as e:
            last_error = e
        except anthropic.APITimeoutError as e:
            last_error = e

        if attempt == max_attempts - 1:
            break

        # Exponential backoff with full jitter
        delay = min(base_delay * (2 ** attempt), max_delay)
        jitter = random.uniform(0, delay)
        logger.warning(
            "Attempt %d failed (%s). Retrying in %.1fs",
            attempt + 1, last_error, jitter
        )
        time.sleep(jitter)

    raise last_error

# Usage
client = anthropic.Anthropic()

def call_llm(prompt: str) -> str:
    def _call():
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text

    return with_retry(_call, max_attempts=4, base_delay=1.0)`,
        }}
      />

      <h2>Circuit Breaker</h2>

      <ConceptBlock term="Circuit Breaker Pattern">
        <p>
          A circuit breaker wraps calls to a dependency (LLM API, external tool) and tracks
          failures. When the failure rate exceeds a threshold, the circuit "opens" and
          immediately rejects requests without attempting the call — allowing the downstream
          service time to recover. After a timeout, the circuit moves to "half-open" and
          allows a single probe request. If it succeeds, the circuit closes again.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Circuit Breaker for LLM API Calls"
        tabs={{
          python: `import time
import threading
from enum import Enum
from dataclasses import dataclass, field

class CircuitState(Enum):
    CLOSED = "closed"       # Normal operation
    OPEN = "open"           # Failing — reject all requests
    HALF_OPEN = "half_open" # Testing — allow one request

@dataclass
class CircuitBreaker:
    failure_threshold: int = 5       # Open after this many failures
    recovery_timeout: float = 60.0   # Seconds before attempting half-open
    success_threshold: int = 2       # Successes needed to close from half-open

    _state: CircuitState = field(default=CircuitState.CLOSED, init=False)
    _failures: int = field(default=0, init=False)
    _successes: int = field(default=0, init=False)
    _opened_at: float = field(default=0.0, init=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False)

    def call(self, fn):
        with self._lock:
            if self._state == CircuitState.OPEN:
                if time.time() - self._opened_at >= self.recovery_timeout:
                    self._state = CircuitState.HALF_OPEN
                    self._successes = 0
                else:
                    raise RuntimeError("Circuit OPEN — request rejected")

        try:
            result = fn()
            with self._lock:
                self._on_success()
            return result
        except Exception as e:
            with self._lock:
                self._on_failure()
            raise

    def _on_success(self):
        if self._state == CircuitState.HALF_OPEN:
            self._successes += 1
            if self._successes >= self.success_threshold:
                self._state = CircuitState.CLOSED
                self._failures = 0
        elif self._state == CircuitState.CLOSED:
            self._failures = 0  # Reset on success

    def _on_failure(self):
        self._failures += 1
        if self._failures >= self.failure_threshold:
            self._state = CircuitState.OPEN
            self._opened_at = time.time()

# Usage
import anthropic

client = anthropic.Anthropic()
llm_circuit = CircuitBreaker(failure_threshold=5, recovery_timeout=60)

def resilient_llm_call(prompt: str) -> str:
    try:
        return llm_circuit.call(lambda: client.messages.create(
            model="claude-opus-4-5",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}]
        ).content[0].text)
    except RuntimeError:
        return "Service temporarily unavailable. Please try again shortly."`,
        }}
      />

      <h2>Timeouts</h2>

      <ConceptBlock term="Per-Step and Total Run Timeouts">
        <p>
          Agents can stall indefinitely if an LLM takes too long to respond or a tool hangs.
          Apply two levels of timeout: a per-step timeout for each LLM call or tool invocation,
          and a total run timeout for the entire agent loop. Total timeouts prevent runaway
          agents from consuming resources for minutes or hours.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Timeout Management for Agent Loops"
        tabs={{
          python: `import asyncio
import anthropic
from typing import Any

client = anthropic.AsyncAnthropic()

async def call_with_timeout(
    coro,
    timeout: float,
    step_name: str = "step"
) -> Any:
    """Run a coroutine with a hard timeout."""
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        raise TimeoutError(f"Agent {step_name} exceeded {timeout}s timeout")

async def agent_loop_with_timeouts(
    user_message: str,
    per_step_timeout: float = 30.0,
    total_timeout: float = 300.0,
) -> str:
    """Run agent loop with both per-step and total timeouts."""
    messages = [{"role": "user", "content": user_message}]

    async def _run():
        for step in range(20):  # Max 20 iterations
            response = await call_with_timeout(
                client.messages.create(
                    model="claude-opus-4-5",
                    max_tokens=4096,
                    tools=[],  # Add real tools here
                    messages=messages,
                ),
                timeout=per_step_timeout,
                step_name=f"llm-call-step-{step}",
            )

            if response.stop_reason == "end_turn":
                return response.content[0].text

            # Handle tool use here ...
            messages.append({"role": "assistant", "content": response.content})

        return "Agent reached maximum iteration limit."

    try:
        return await call_with_timeout(_run(), timeout=total_timeout, step_name="total-run")
    except TimeoutError as e:
        return f"Agent timed out: {e}"`,
        }}
      />

      <h2>Graceful Degradation</h2>

      <PatternBlock
        name="Graceful Degradation"
        category="Reliability"
        whenToUse="When an agent relies on optional capabilities (web search, database lookup, code execution) and the system should remain useful even when those capabilities are unavailable."
      >
        <p>
          Design agents to fall back to reduced-capability responses when non-critical tools
          fail. A customer support agent that cannot reach the orders database should still
          answer general questions rather than failing completely. Categorise tools as
          essential (failure means abort) vs. optional (failure means degrade gracefully).
        </p>
      </PatternBlock>

      <SDKExample
        title="Graceful Degradation with Tool Fallbacks"
        tabs={{
          python: `import anthropic
import logging

logger = logging.getLogger(__name__)
client = anthropic.Anthropic()

# --- Tool implementations ---
def fetch_order_status(order_id: str) -> dict:
    """Fetch from orders DB — may fail."""
    # Simulated DB call
    raise ConnectionError("Orders DB unavailable")

def fetch_order_status_cached(order_id: str) -> dict | None:
    """Try a read-through cache first."""
    # Simulated cache hit
    return None  # Cache miss in this example

def execute_tool(tool_name: str, tool_input: dict) -> dict:
    """Execute a tool with graceful degradation."""
    if tool_name == "get_order_status":
        order_id = tool_input["order_id"]

        # Try cache first
        cached = fetch_order_status_cached(order_id)
        if cached:
            return {"status": "ok", "source": "cache", **cached}

        # Try live DB
        try:
            live = fetch_order_status(order_id)
            return {"status": "ok", "source": "live", **live}
        except Exception as e:
            logger.warning("Orders DB failed for %s: %s", order_id, e)
            # Degrade: inform agent so it can communicate limitation
            return {
                "status": "unavailable",
                "message": "Order status is temporarily unavailable. "
                           "The customer should check back in a few minutes."
            }

    return {"error": f"Unknown tool: {tool_name}"}

tools = [
    {
        "name": "get_order_status",
        "description": "Get the current status of an order by order ID.",
        "input_schema": {
            "type": "object",
            "properties": {"order_id": {"type": "string"}},
            "required": ["order_id"],
        },
    }
]

def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            tools=tools,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            return next(
                b.text for b in response.content if hasattr(b, "text")
            )

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(result),
                    })
            messages.append({"role": "user", "content": tool_results})`,
        }}
      />

      <BestPracticeBlock title="Test Failure Modes, Not Just Happy Paths">
        <p>
          Run dedicated chaos tests against your agent: inject 429 rate-limit errors, simulate
          tool timeouts, corrupt tool responses, and exhaust the maximum iteration count.
          Verify that the agent produces a coherent degraded response rather than crashing,
          hanging, or exposing internal errors to the user. Use pytest with monkeypatching or
          a dedicated chaos engineering framework like Chaos Monkey for this purpose.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Combine Patterns for Defence in Depth">
        <p>
          In production, layer all four patterns: timeouts prevent hangs, retries recover from
          transient errors, circuit breakers protect downstream services from cascading failures,
          and graceful degradation ensures the user always gets a response. Each pattern handles
          a different failure mode; together they cover the reliability surface of a production agent.
        </p>
      </NoteBlock>
    </article>
  )
}
