import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function DataMinimization() {
  return (
    <article className="prose-content">
      <h2>Data Minimisation for AI Agents</h2>
      <p>
        Data minimisation — collecting and processing only the personal data strictly necessary
        for a specified purpose — is a foundational principle of privacy law (GDPR Article 5(1)(c),
        CCPA) and sound security practice. For AI agents, data minimisation has a dual benefit:
        it reduces regulatory risk by limiting the volume of personal data processed, and it
        reduces security risk by shrinking the attack surface. An agent that never receives a
        user's date of birth cannot leak it. This section covers how to apply data minimisation
        at the input, context, and retention layers of an agent system.
      </p>

      <h2>Input Minimisation</h2>

      <ConceptBlock term="Purpose-Limited Data Collection">
        <p>
          Before passing data to an agent, ask: does the agent need this field to perform its
          task? A meeting scheduling agent needs calendar availability but not the user's salary.
          A document summariser needs the document text but not the document's metadata author
          fields. Strip unnecessary fields from structured data before they reach the agent's
          context window. This is especially important for database query results: never pass
          entire rows when only specific columns are needed.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Field-Level Minimisation Before Agent Processing"
        tabs={{
          python: `import anthropic
from typing import Any

client = anthropic.Anthropic()

# --- Field allowlists per task type ---

TASK_FIELD_ALLOWLISTS: dict[str, set[str]] = {
    "order_status_inquiry": {
        "order_id", "status", "estimated_delivery", "tracking_number", "items_summary"
    },
    "invoice_generation": {
        "order_id", "items", "quantities", "prices", "tax_rate", "customer_name", "billing_address"
    },
    "shipping_support": {
        "order_id", "status", "tracking_number", "carrier", "shipping_address", "estimated_delivery"
    },
}

# Fields that should NEVER be passed to any agent
ALWAYS_EXCLUDED_FIELDS = {
    "ssn", "credit_card_number", "cvv", "bank_account_number",
    "password_hash", "raw_password", "date_of_birth",
    "full_payment_history",  # Not needed for individual queries
}

def minimise_customer_record(
    record: dict[str, Any],
    task_type: str,
) -> dict[str, Any]:
    """
    Return only the fields required for the specified task.
    Always excludes sensitive fields regardless of task.
    """
    allowed = TASK_FIELD_ALLOWLISTS.get(task_type, set())

    minimised = {
        k: v for k, v in record.items()
        if k in allowed and k not in ALWAYS_EXCLUDED_FIELDS
    }

    return minimised

def run_order_agent(
    raw_customer_record: dict[str, Any],
    raw_order_record: dict[str, Any],
    user_query: str,
) -> str:
    """Process an order query with minimised data."""
    # Only pass fields needed for this task
    customer_data = minimise_customer_record(raw_customer_record, "order_status_inquiry")
    order_data = minimise_customer_record(raw_order_record, "order_status_inquiry")

    context = f"Customer: {customer_data}\\nOrder: {order_data}"

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="You are an order support agent. Answer questions about orders using the provided data only.",
        messages=[
            {"role": "user", "content": f"Data: {context}\\n\\nQuestion: {user_query}"}
        ],
    )
    return response.content[0].text

# Example: raw record has 30+ fields, agent receives only 5
raw_order = {
    "order_id": "ORD-789",
    "customer_id": "CUST-456",     # Will be excluded (not in allowlist)
    "customer_email": "user@example.com",  # Will be excluded
    "status": "shipped",
    "tracking_number": "1Z999AA1234567890",
    "estimated_delivery": "2025-04-01",
    "items_summary": "2x Blue T-Shirt, 1x Jeans",
    "payment_method": "Visa ending 4242",  # Will be excluded
    "full_address": "123 Main St, Anytown",  # Will be excluded
}

minimised = minimise_customer_record(raw_order, "order_status_inquiry")
print(minimised)
# {'order_id': 'ORD-789', 'status': 'shipped', 'tracking_number': ..., ...}`,
          typescript: `import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const TASK_FIELD_ALLOWLISTS: Record<string, Set<string>> = {
  order_status_inquiry: new Set(['order_id', 'status', 'estimated_delivery', 'tracking_number', 'items_summary']),
  invoice_generation: new Set(['order_id', 'items', 'quantities', 'prices', 'customer_name', 'billing_address']),
}

const ALWAYS_EXCLUDED = new Set([
  'ssn', 'credit_card_number', 'cvv', 'bank_account_number',
  'password_hash', 'date_of_birth',
])

function minimiseRecord(
  record: Record<string, unknown>,
  taskType: string
): Record<string, unknown> {
  const allowed = TASK_FIELD_ALLOWLISTS[taskType] ?? new Set()
  return Object.fromEntries(
    Object.entries(record).filter(([k]) => allowed.has(k) && !ALWAYS_EXCLUDED.has(k))
  )
}

async function runOrderAgent(
  rawOrder: Record<string, unknown>,
  userQuery: string
): Promise<string> {
  const orderData = minimiseRecord(rawOrder, 'order_status_inquiry')

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    system: 'You are an order support agent. Use the provided order data to answer questions.',
    messages: [{ role: 'user', content: Order: \${JSON.stringify(orderData)}\\n\\nQuestion: \${userQuery} }],
  })
  return (response.content[0] as Anthropic.TextBlock).text
}`,
        }}
      />

      <h2>Context Window Minimisation</h2>

      <ConceptBlock term="Temporal Scope of Context">
        <p>
          Agent conversation histories grow over time and accumulate personal data with each
          turn. Apply temporal minimisation to context: only include conversation turns relevant
          to the current task rather than the full history. For long-running sessions, summarise
          older turns (replacing detailed personal data with high-level summaries) and discard
          the originals from the context window. This also reduces token costs.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Context Summarisation to Minimise PII in History"
        tabs={{
          python: `import anthropic
import re

client = anthropic.Anthropic()

def summarise_conversation_turn(turn: dict) -> str:
    """
    Summarise a conversation turn, replacing specific PII with generalisations.
    Returns a compact summary safe to retain in long-term context.
    """
    content = turn.get("content", "")
    if isinstance(content, list):
        content = " ".join(
            block.get("text", "") for block in content if isinstance(block, dict)
        )

    # Replace specific PII with category labels
    content = re.sub(
        r"[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
        "[customer email]", content
    )
    content = re.sub(r"ORD-[A-Z0-9]+", "[order ID]", content)
    content = re.sub(r"\\b[A-Z]{2}[0-9]{9}[A-Z]{2}\\b", "[tracking number]", content)  # UPS format

    # Truncate to summary length
    if len(content) > 200:
        content = content[:197] + "..."

    return f"{turn['role']}: {content}"

def build_minimised_context(
    full_history: list[dict],
    keep_recent_turns: int = 4,
) -> list[dict]:
    """
    Build a minimised context window:
    - Keep the last N turns verbatim (most relevant)
    - Replace older turns with a compact summary
    """
    if len(full_history) <= keep_recent_turns:
        return full_history

    older = full_history[:-keep_recent_turns]
    recent = full_history[-keep_recent_turns:]

    # Summarise older turns
    summary_lines = [summarise_conversation_turn(t) for t in older]
    summary = "Previous conversation summary:\\n" + "\\n".join(summary_lines)

    return [
        {"role": "user", "content": summary},
        {"role": "assistant", "content": "Understood, I have the previous context."},
        *recent,
    ]`,
        }}
      />

      <h2>Retention Policies</h2>

      <SDKExample
        title="Automated Data Retention Enforcement"
        tabs={{
          python: `from datetime import datetime, timedelta
import logging

logger = logging.getLogger("retention")

RETENTION_POLICIES = {
    "conversation_logs": timedelta(days=90),      # 90 days
    "tool_call_traces": timedelta(days=30),       # 30 days
    "pii_containing_outputs": timedelta(days=7),  # 7 days
    "anonymised_analytics": timedelta(days=365),  # 1 year
    "audit_logs": timedelta(days=2555),           # 7 years (legal obligation)
}

def should_delete(record_created_at: datetime, category: str) -> bool:
    """Check if a record has exceeded its retention period."""
    policy = RETENTION_POLICIES.get(category)
    if policy is None:
        raise ValueError(f"No retention policy defined for category: {category}")
    cutoff = datetime.utcnow() - policy
    return record_created_at < cutoff

def run_retention_purge(data_store, category: str) -> dict:
    """
    Delete records that have exceeded their retention period.
    In production, run as a scheduled job (daily cron / Cloud Scheduler).
    """
    cutoff = datetime.utcnow() - RETENTION_POLICIES[category]
    deleted_count = data_store.delete_older_than(category=category, cutoff=cutoff)
    logger.info(
        "Retention purge: category=%s, cutoff=%s, deleted=%d",
        category, cutoff.isoformat(), deleted_count,
    )
    return {"category": category, "cutoff": cutoff.isoformat(), "deleted": deleted_count}`,
        }}
      />

      <WarningBlock title="Vector Database Embeddings Also Contain Personal Data">
        <p>
          Embeddings in vector databases are derived from source documents that may contain
          personal data. Even though embeddings are not directly human-readable, they encode
          source content and can be inverted with sufficient effort. Apply the same retention
          policies and deletion rights to vector embeddings as to the source documents, and
          implement the ability to delete embeddings by user ID or document ID in response to
          erasure requests.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Classify Data Before It Enters the Agent Pipeline">
        <p>
          Assign a data classification label (public, internal, confidential, restricted) and
          a PII category (no PII, pseudonymous, personal data, sensitive personal data) to every
          data source before connecting it to an agent. These labels drive minimisation rules,
          retention policies, access controls, and the level of LLM API encryption required.
          Build classification into your data onboarding process so that every new data source
          is labelled before agents can access it.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Less Data in Context = Better Performance and Lower Cost">
        <p>
          Data minimisation is not only a privacy and compliance measure — it is also a
          performance and cost optimisation. Shorter context windows mean faster responses,
          lower token costs, and less distraction for the model. Many agents perform better
          with a focused, minimal context than with an enormous window of loosely relevant
          history. Privacy and performance align here.
        </p>
      </NoteBlock>
    </article>
  )
}
