import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function FeedbackLoops() {
  return (
    <article className="prose-content">
      <h2>Feedback Loops</h2>
      <p>
        A feedback loop connects user experience back to agent improvement. Without deliberate
        feedback collection, the only signal you receive is aggregate metrics (latency, cost,
        retention) — which are too noisy and delayed to diagnose specific agent failures. Explicit
        and implicit feedback mechanisms close the loop at the individual interaction level,
        enabling data-driven decisions about prompt changes, fine-tuning, and tool updates.
      </p>

      <ConceptBlock term="Feedback Loop">
        <p>
          A feedback loop is the pipeline from user interaction to agent improvement. It has four
          stages: <strong>collection</strong> (capturing signals from users or systems),
          <strong>storage</strong> (persisting structured feedback with interaction context),
          <strong>analysis</strong> (identifying patterns in low-quality interactions), and
          <strong>action</strong> (updating prompts, fine-tuning data, or tool logic based on
          findings). Completing all four stages — not just collecting data — is what makes a
          feedback loop valuable.
        </p>
      </ConceptBlock>

      <h2>Explicit Feedback: Thumbs Up / Down</h2>
      <p>
        Thumbs up/down buttons after each agent response are the simplest explicit feedback
        mechanism. They have low user friction, produce clean binary labels, and accumulate
        quickly. The key implementation detail is capturing the full conversation context
        alongside the rating — not just the final message — so you can diagnose the root cause
        of negative feedback.
      </p>

      <h2>Implicit Feedback Signals</h2>
      <p>
        Most users do not click rating buttons. Implicit signals inferred from user behaviour
        often provide more coverage than explicit ratings:
      </p>
      <ul>
        <li><strong>Follow-up clarification requests:</strong> "Can you be more specific?" or "That's not what I meant" indicate agent misunderstanding</li>
        <li><strong>Session abandonment:</strong> user leaves immediately after agent response — a strong negative signal</li>
        <li><strong>Response regeneration:</strong> user clicks "try again" or "regenerate"</li>
        <li><strong>Copy-paste rate:</strong> users copying agent output suggests it was useful</li>
        <li><strong>Downstream task completion:</strong> did the user successfully accomplish their goal after the agent interaction?</li>
      </ul>

      <SDKExample
        title="Feedback Collection and Storage Pipeline"
        tabs={{
          python: `import anthropic
import json
import sqlite3
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path

# ---- Feedback Data Model ----

class FeedbackSignal(str, Enum):
    THUMBS_UP = "thumbs_up"
    THUMBS_DOWN = "thumbs_down"
    REGENERATE = "regenerate"
    ABANDON = "abandon"
    COPY = "copy"
    CLARIFICATION = "clarification"

@dataclass
class InteractionRecord:
    interaction_id: str
    session_id: str
    user_input: str
    agent_output: str
    model: str
    tool_calls: list[dict]
    latency_ms: float
    timestamp: str
    feedback: FeedbackSignal | None = None
    feedback_comment: str | None = None
    feedback_timestamp: str | None = None

# ---- Storage ----

class FeedbackStore:
    def __init__(self, db_path: str = "./feedback.db"):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._create_tables()

    def _create_tables(self) -> None:
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS interactions (
                interaction_id TEXT PRIMARY KEY,
                session_id     TEXT NOT NULL,
                user_input     TEXT NOT NULL,
                agent_output   TEXT NOT NULL,
                model          TEXT,
                tool_calls     TEXT,   -- JSON
                latency_ms     REAL,
                timestamp      TEXT,
                feedback       TEXT,
                feedback_comment TEXT,
                feedback_timestamp TEXT
            )
        """)
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_session ON interactions (session_id)"
        )
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_feedback ON interactions (feedback)"
        )
        self.conn.commit()

    def save_interaction(self, record: InteractionRecord) -> None:
        self.conn.execute(
            """INSERT OR REPLACE INTO interactions VALUES
               (?,?,?,?,?,?,?,?,?,?,?)""",
            (
                record.interaction_id,
                record.session_id,
                record.user_input,
                record.agent_output,
                record.model,
                json.dumps(record.tool_calls),
                record.latency_ms,
                record.timestamp,
                record.feedback.value if record.feedback else None,
                record.feedback_comment,
                record.feedback_timestamp,
            ),
        )
        self.conn.commit()

    def record_feedback(
        self,
        interaction_id: str,
        signal: FeedbackSignal,
        comment: str | None = None,
    ) -> None:
        self.conn.execute(
            """UPDATE interactions
               SET feedback=?, feedback_comment=?, feedback_timestamp=?
               WHERE interaction_id=?""",
            (
                signal.value,
                comment,
                datetime.now(timezone.utc).isoformat(),
                interaction_id,
            ),
        )
        self.conn.commit()

    def get_negative_examples(self, limit: int = 100) -> list[dict]:
        """Retrieve thumbs-down interactions for analysis and fine-tuning."""
        cursor = self.conn.execute(
            """SELECT interaction_id, user_input, agent_output, feedback_comment
               FROM interactions
               WHERE feedback IN ('thumbs_down', 'regenerate', 'clarification')
               ORDER BY timestamp DESC
               LIMIT ?""",
            (limit,),
        )
        return [
            {"id": row[0], "input": row[1], "output": row[2], "comment": row[3]}
            for row in cursor.fetchall()
        ]

    def get_feedback_stats(self) -> dict:
        cursor = self.conn.execute(
            """SELECT
                   feedback,
                   COUNT(*) as count,
                   ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pct
               FROM interactions
               WHERE feedback IS NOT NULL
               GROUP BY feedback"""
        )
        return {row[0]: {"count": row[1], "pct": row[2]} for row in cursor.fetchall()}

# ---- Agent with Feedback Integration ----

store = FeedbackStore()

async def run_agent_with_feedback(
    user_input: str,
    session_id: str,
) -> tuple[str, str]:
    """Returns (agent_output, interaction_id) so the caller can record feedback."""
    import time
    client = anthropic.AsyncAnthropic()
    interaction_id = str(uuid.uuid4())
    start = time.time()

    response = await client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{"role": "user", "content": user_input}],
    )
    output = response.content[0].text
    latency_ms = (time.time() - start) * 1000

    record = InteractionRecord(
        interaction_id=interaction_id,
        session_id=session_id,
        user_input=user_input,
        agent_output=output,
        model="claude-3-5-sonnet-20241022",
        tool_calls=[],
        latency_ms=latency_ms,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    store.save_interaction(record)
    return output, interaction_id

# ---- Convert Negative Feedback to Fine-Tuning Data ----

async def generate_corrected_outputs(
    negative_examples: list[dict],
    correction_model: str = "claude-3-5-sonnet-20241022",
) -> list[dict]:
    """Use a capable model to generate improved responses for thumbs-down examples."""
    client = anthropic.AsyncAnthropic()
    fine_tuning_data = []

    for example in negative_examples:
        prompt = f"""The following user query received a thumbs-down rating.
User feedback: {example.get('comment', 'No comment provided')}

User query: {example['input']}
Previous (rejected) response: {example['output']}

Write an improved response that addresses the feedback. Be concise and helpful."""

        response = await client.messages.create(
            model=correction_model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        improved = response.content[0].text

        fine_tuning_data.append({
            "messages": [
                {"role": "user", "content": example["input"]},
                {"role": "assistant", "content": improved},
            ],
            "source_interaction_id": example["id"],
        })

    return fine_tuning_data

# Example usage
import asyncio

async def main():
    output, iid = await run_agent_with_feedback(
        "Explain async/await in Python",
        session_id="session_abc123",
    )
    print(f"Response: {output[:100]}...")

    # User clicks thumbs down
    store.record_feedback(
        iid,
        FeedbackSignal.THUMBS_DOWN,
        comment="Too long, needs a simple example",
    )

    stats = store.get_feedback_stats()
    print(f"Feedback stats: {stats}")

asyncio.run(main())`,
        }}
      />

      <PatternBlock
        name="Implicit Signal Detection from Follow-Up Messages"
        category="Feedback Collection"
        whenToUse="When you want feedback coverage beyond the small fraction of users who click rating buttons — detecting quality issues from natural conversation patterns."
      >
        <p>
          Analyse the first follow-up message after each agent response for clarification
          patterns: phrases like "that's not what I meant", "can you be more specific",
          "you misunderstood", or "try again" are strong negative implicit signals. Use a fast
          classifier (keyword matching or a small LLM) to tag these automatically as negative
          examples. This gives you 5–10x more labelled data than explicit ratings alone with
          no additional UI changes.
        </p>
      </PatternBlock>

      <WarningBlock title="Feedback Bias: Only Engaged Users Rate">
        <p>
          Explicit thumbs up/down ratings are heavily biased toward engaged users. Users who
          had a catastrophically bad experience often abandon immediately without rating;
          highly satisfied users over-represent positive ratings. Treat explicit ratings as one
          signal among several, not as ground truth. Weight implicit abandonment signals
          (session end within 10 seconds of response) as negative labels even without explicit
          ratings to counteract survivor bias in your feedback dataset.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Close the Loop: Show Users Their Feedback Had Impact">
        <p>
          Feedback collection rates improve dramatically when users believe their input matters.
          Periodically communicate improvements driven by user feedback: "Based on your feedback,
          we've improved responses for X type of question." This creates a virtuous cycle — users
          who feel heard provide more feedback, which drives more improvements, which creates more
          trust. Even a simple changelog entry ("Improved code explanation responses based on user
          feedback") increases ongoing participation.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Feedback as Fine-Tuning Signal">
        <p>
          Negative feedback interactions — especially those with written comments — are the
          highest-quality fine-tuning data you can collect. They represent real user needs that
          your current agent fails to serve. The workflow is: collect negative examples, generate
          improved responses using a capable frontier model as a "teacher", review a sample for
          quality, then use the (input, improved_output) pairs as fine-tuning data. This
          human-in-the-loop correction loop consistently outperforms synthetic data generation
          for domain-specific improvement.
        </p>
      </NoteBlock>
    </article>
  )
}
