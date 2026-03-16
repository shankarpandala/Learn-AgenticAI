import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function TokenBudgeting() {
  return (
    <article className="prose-content">
      <h2>Token Budgeting for Agent Systems</h2>
      <p>
        Unconstrained agents can consume thousands of tokens per run across multiple LLM
        calls and tool loops. At scale, uncontrolled token consumption translates directly
        to runaway costs and unexpected API bill spikes. Token budgets apply hard and soft
        limits at the run, user, and deployment levels to keep costs predictable and fair.
      </p>

      <ArchitectureDiagram
        title="Token Budget Enforcement Layers"
        width={700}
        height={240}
        nodes={[
          { id: 'req', label: 'Agent\nRequest', type: 'external', x: 60, y: 120 },
          { id: 'user_budget', label: 'User\nBudget\nCheck', type: 'tool', x: 220, y: 60 },
          { id: 'run_budget', label: 'Per-Run\nBudget\nEnforce', type: 'tool', x: 220, y: 180 },
          { id: 'agent', label: 'Agent\nLoop', type: 'agent', x: 430, y: 120 },
          { id: 'billing', label: 'Billing /\nQuota Store', type: 'store', x: 600, y: 120 },
        ]}
        edges={[
          { from: 'req', to: 'user_budget' },
          { from: 'req', to: 'run_budget' },
          { from: 'user_budget', to: 'agent', label: 'allow' },
          { from: 'run_budget', to: 'agent', label: 'allow' },
          { from: 'agent', to: 'billing' },
        ]}
      />

      <h2>Per-Run Token Budgets</h2>

      <ConceptBlock term="Per-Run Token Budget">
        <p>
          A per-run budget sets a maximum total token spend (input + output) for a single
          agent invocation. The agent loop tracks cumulative token usage across all LLM
          calls within the run. When the budget is approached, the agent is instructed to
          wrap up its current work and return a partial result rather than continuing to
          consume tokens.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Enforcing a Per-Run Token Budget"
        tabs={{
          python: `import anthropic
from dataclasses import dataclass

client = anthropic.Anthropic()

@dataclass
class TokenBudget:
    max_tokens: int
    warn_threshold: float = 0.8    # Warn at 80%
    used: int = 0

    @property
    def remaining(self) -> int:
        return max(0, self.max_tokens - self.used)

    @property
    def is_exhausted(self) -> bool:
        return self.used >= self.max_tokens

    @property
    def is_near_limit(self) -> bool:
        return self.used >= self.max_tokens * self.warn_threshold

    def consume(self, input_tokens: int, output_tokens: int) -> None:
        self.used += input_tokens + output_tokens

WRAP_UP_INSTRUCTION = (
    "\\n\\n[SYSTEM: You are approaching your token budget. "
    "Please wrap up your current reasoning and provide a final answer "
    "based on what you have gathered so far. Do not make additional tool calls.]"
)

def run_agent_with_budget(
    user_message: str,
    max_run_tokens: int = 20_000,
) -> dict:
    budget = TokenBudget(max_tokens=max_run_tokens)
    messages = [{"role": "user", "content": user_message}]
    system = "You are a helpful research assistant."

    while True:
        if budget.is_exhausted:
            return {
                "response": "I ran out of my processing budget before completing. "
                             "Here is what I found so far: " + _extract_partial(messages),
                "tokens_used": budget.used,
                "budget_exhausted": True,
            }

        # Inject wrap-up instruction when near limit
        current_system = system
        if budget.is_near_limit:
            current_system = system + WRAP_UP_INSTRUCTION

        # Limit output tokens to what remains in budget
        max_output = min(2048, budget.remaining // 2)

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=max_output,
            system=current_system,
            messages=messages,
        )

        budget.consume(response.usage.input_tokens, response.usage.output_tokens)

        if response.stop_reason == "end_turn":
            return {
                "response": next(b.text for b in response.content if hasattr(b, "text")),
                "tokens_used": budget.used,
                "budget_exhausted": False,
            }

        # Handle tool calls ...
        messages.append({"role": "assistant", "content": response.content})

def _extract_partial(messages: list) -> str:
    """Extract the last assistant text from messages as a partial result."""
    for msg in reversed(messages):
        if msg.get("role") == "assistant":
            for block in (msg.get("content") or []):
                if hasattr(block, "text"):
                    return block.text[:500]
    return "No partial result available."`,
        }}
      />

      <h2>Per-User and Per-Tenant Budgets</h2>

      <ConceptBlock term="Usage Quotas">
        <p>
          In multi-tenant or multi-user deployments, individual users or tenants should
          have daily/monthly token quotas to prevent one user exhausting the shared budget.
          Store quota state in a fast key-value store (Redis) and check-and-decrement
          atomically before each agent run to avoid race conditions.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Per-User Token Quotas with Redis"
        tabs={{
          python: `import redis
import time
from typing import Optional

r = redis.Redis(host="redis", port=6379, decode_responses=True)

DAILY_USER_QUOTA = 100_000     # tokens per user per day
MONTHLY_TENANT_QUOTA = 5_000_000  # tokens per tenant per month

def _quota_key(entity: str, period: str) -> str:
    if period == "day":
        day = time.strftime("%Y-%m-%d")
        return f"quota:{entity}:day:{day}"
    elif period == "month":
        month = time.strftime("%Y-%m")
        return f"quota:{entity}:month:{month}"
    raise ValueError(f"Unknown period: {period}")

def check_and_reserve_quota(
    user_id: str,
    tenant_id: str,
    estimated_tokens: int = 5_000,
) -> Optional[str]:
    """
    Check quotas before starting a run.
    Returns None if OK, or an error message if quota exceeded.
    """
    user_key = _quota_key(f"user:{user_id}", "day")
    tenant_key = _quota_key(f"tenant:{tenant_id}", "month")

    pipe = r.pipeline()
    pipe.incr(user_key, estimated_tokens)
    pipe.expire(user_key, 86400)  # TTL = 1 day
    pipe.incr(tenant_key, estimated_tokens)
    pipe.expire(tenant_key, 86400 * 31)
    results = pipe.execute()

    user_total = results[0]
    tenant_total = results[2]

    if user_total > DAILY_USER_QUOTA:
        # Roll back the reservation
        r.decrby(user_key, estimated_tokens)
        return f"Daily token quota exceeded ({DAILY_USER_QUOTA:,} tokens/day)"

    if tenant_total > MONTHLY_TENANT_QUOTA:
        r.decrby(user_key, estimated_tokens)
        r.decrby(tenant_key, estimated_tokens)
        return f"Monthly tenant quota exceeded ({MONTHLY_TENANT_QUOTA:,} tokens/month)"

    return None  # All quotas OK

def reconcile_quota(
    user_id: str,
    tenant_id: str,
    estimated_tokens: int,
    actual_tokens: int,
) -> None:
    """Adjust quota after run completes with actual token count."""
    delta = actual_tokens - estimated_tokens
    if delta != 0:
        user_key = _quota_key(f"user:{user_id}", "day")
        tenant_key = _quota_key(f"tenant:{tenant_id}", "month")
        r.incrby(user_key, delta)
        r.incrby(tenant_key, delta)

def get_quota_status(user_id: str, tenant_id: str) -> dict:
    user_key = _quota_key(f"user:{user_id}", "day")
    tenant_key = _quota_key(f"tenant:{tenant_id}", "month")
    user_used = int(r.get(user_key) or 0)
    tenant_used = int(r.get(tenant_key) or 0)
    return {
        "user_used_today": user_used,
        "user_daily_limit": DAILY_USER_QUOTA,
        "user_remaining_today": max(0, DAILY_USER_QUOTA - user_used),
        "tenant_used_this_month": tenant_used,
        "tenant_monthly_limit": MONTHLY_TENANT_QUOTA,
        "tenant_remaining_this_month": max(0, MONTHLY_TENANT_QUOTA - tenant_used),
    }`,
        }}
      />

      <PatternBlock
        name="Soft and Hard Budget Limits"
        category="Cost Control"
        whenToUse="To provide progressive warnings to agents and users before hard-stopping a run, giving the agent a chance to return a partial result rather than abruptly terminating."
      >
        <p>
          Set two thresholds: a soft limit (e.g. 80% of budget) at which the agent is
          instructed to wrap up, and a hard limit (100%) at which the run is terminated.
          This gives the agent a window to complete its current reasoning and return
          something useful to the user, rather than cutting off mid-sentence.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Budget by Use Case, Not Globally">
        <p>
          Different agent use cases have dramatically different token profiles: a simple
          Q&A agent might need 2,000 tokens per run, while a code review agent may need
          50,000. Apply use-case-specific budgets rather than one global limit. Tag each
          agent run with its use case and track cost per use case separately to identify
          which workflows are disproportionately expensive.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use max_tokens to Enforce Output Budgets">
        <p>
          The API-level <code>max_tokens</code> parameter is a hard output limit enforced
          by the model provider. Always set it to a value appropriate for the expected
          output length of your use case. Leaving it at the model maximum (e.g. 8192)
          when your use case only needs 512 tokens wastes money if the model ever produces
          unexpectedly verbose output.
        </p>
      </NoteBlock>
    </article>
  )
}
