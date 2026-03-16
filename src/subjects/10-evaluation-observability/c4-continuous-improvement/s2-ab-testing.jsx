import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function AbTestingAgents() {
  return (
    <article className="prose-content">
      <h2>A/B Testing Agents</h2>
      <p>
        A/B testing for agents answers the question: "Does this change actually improve outcomes
        for users?" — as opposed to just improving offline eval metrics. It involves routing
        production traffic between a control version and one or more treatment versions,
        collecting outcome metrics, and using statistical tests to determine whether observed
        differences are real or due to chance. A/B testing is the gold standard for validating
        prompt changes, model upgrades, and agent architecture decisions.
      </p>

      <ConceptBlock term="Agent A/B Test">
        <p>
          An agent A/B test splits incoming requests between a control (current production agent)
          and a treatment (new agent version). Each user request is deterministically assigned to
          a variant using a hash of a stable user or session ID, ensuring consistent experiences
          within a session. Outcome metrics — task completion rate, user satisfaction signals,
          latency, cost — are collected for each variant. Statistical significance testing
          determines whether observed differences are reliable before rolling out the treatment.
        </p>
      </ConceptBlock>

      <h2>What to A/B Test</h2>
      <ul>
        <li><strong>Prompt changes:</strong> system prompt rewrites, few-shot example updates, instruction additions</li>
        <li><strong>Model upgrades:</strong> moving from one model version to a newer or cheaper alternative</li>
        <li><strong>Tool configurations:</strong> different search parameters, retrieval strategies, or context window sizes</li>
        <li><strong>Agent architectures:</strong> single-agent vs multi-agent, different orchestration patterns</li>
        <li><strong>Safety configurations:</strong> different refusal thresholds or content policies</li>
      </ul>

      <SDKExample
        title="A/B Testing Infrastructure for Agents"
        tabs={{
          python: `import hashlib
import json
import sqlite3
import time
import anthropic
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Callable

# ---- Variant Assignment ----

@dataclass
class Variant:
    name: str           # "control" or "treatment_v2"
    weight: float       # 0.0 - 1.0; weights must sum to 1.0
    config: dict        # model, system_prompt, tools, etc.

class VariantAssigner:
    """Deterministic, session-consistent variant assignment via hashing."""

    def __init__(self, variants: list[Variant], experiment_id: str):
        assert abs(sum(v.weight for v in variants) - 1.0) < 1e-9, "Weights must sum to 1.0"
        self.variants = variants
        self.experiment_id = experiment_id

    def assign(self, session_id: str) -> Variant:
        """Deterministically assign a session to a variant."""
        hash_input = f"{self.experiment_id}:{session_id}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        bucket = (hash_value % 10000) / 10000  # 0.0 to 0.9999

        cumulative = 0.0
        for variant in self.variants:
            cumulative += variant.weight
            if bucket < cumulative:
                return variant
        return self.variants[-1]  # fallback

# ---- Experiment Tracking ----

class ExperimentTracker:
    def __init__(self, db_path: str = "./experiments.db"):
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._create_tables()

    def _create_tables(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS experiment_events (
                event_id       TEXT PRIMARY KEY,
                experiment_id  TEXT NOT NULL,
                session_id     TEXT NOT NULL,
                variant        TEXT NOT NULL,
                event_type     TEXT NOT NULL,   -- "assignment", "outcome"
                metric_name    TEXT,
                metric_value   REAL,
                metadata       TEXT,            -- JSON
                timestamp      TEXT NOT NULL
            )
        """)
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_exp ON experiment_events (experiment_id, variant)"
        )
        self.conn.commit()

    def record_assignment(
        self,
        experiment_id: str,
        session_id: str,
        variant: str,
    ) -> None:
        import uuid
        self.conn.execute(
            "INSERT INTO experiment_events VALUES (?,?,?,?,?,?,?,?,?)",
            (
                str(uuid.uuid4()), experiment_id, session_id, variant,
                "assignment", None, None, None,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        self.conn.commit()

    def record_outcome(
        self,
        experiment_id: str,
        session_id: str,
        variant: str,
        metric_name: str,
        metric_value: float,
        metadata: dict | None = None,
    ) -> None:
        import uuid
        self.conn.execute(
            "INSERT INTO experiment_events VALUES (?,?,?,?,?,?,?,?,?)",
            (
                str(uuid.uuid4()), experiment_id, session_id, variant,
                "outcome", metric_name, metric_value,
                json.dumps(metadata) if metadata else None,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        self.conn.commit()

    def get_metric_by_variant(
        self,
        experiment_id: str,
        metric_name: str,
    ) -> dict[str, list[float]]:
        cursor = self.conn.execute(
            """SELECT variant, metric_value
               FROM experiment_events
               WHERE experiment_id=? AND metric_name=? AND event_type='outcome'""",
            (experiment_id, metric_name),
        )
        result: dict[str, list[float]] = {}
        for variant, value in cursor.fetchall():
            result.setdefault(variant, []).append(value)
        return result

# ---- Statistical Significance ----

from scipy import stats as scipy_stats
import statistics

def check_significance(
    control_values: list[float],
    treatment_values: list[float],
    alpha: float = 0.05,
) -> dict:
    """Welch's t-test for comparing two agent variants."""
    if len(control_values) < 30 or len(treatment_values) < 30:
        return {"significant": False, "reason": "insufficient_samples", "n_control": len(control_values), "n_treatment": len(treatment_values)}

    control_mean = statistics.mean(control_values)
    treatment_mean = statistics.mean(treatment_values)
    _, p_value = scipy_stats.ttest_ind(control_values, treatment_values)
    lift = (treatment_mean - control_mean) / control_mean if control_mean != 0 else 0

    return {
        "significant": p_value < alpha,
        "p_value": round(p_value, 4),
        "control_mean": round(control_mean, 4),
        "treatment_mean": round(treatment_mean, 4),
        "lift_pct": round(lift * 100, 2),
        "n_control": len(control_values),
        "n_treatment": len(treatment_values),
        "recommendation": "ship" if (p_value < alpha and lift > 0) else
                         "rollback" if (p_value < alpha and lift < 0) else
                         "continue_experiment",
    }

# ---- Experiment Runner ----

tracker = ExperimentTracker()

EXPERIMENT_ID = "claude_3_7_upgrade_v1"

control_variant = Variant(
    name="control",
    weight=0.5,
    config={"model": "claude-3-5-sonnet-20241022", "max_tokens": 1024},
)
treatment_variant = Variant(
    name="treatment",
    weight=0.5,
    config={"model": "claude-3-7-sonnet-20250219", "max_tokens": 1024},
)

assigner = VariantAssigner([control_variant, treatment_variant], EXPERIMENT_ID)

async def run_ab_agent(user_input: str, session_id: str) -> dict:
    variant = assigner.assign(session_id)
    tracker.record_assignment(EXPERIMENT_ID, session_id, variant.name)

    client = anthropic.AsyncAnthropic()
    start = time.time()
    response = await client.messages.create(
        model=variant.config["model"],
        max_tokens=variant.config["max_tokens"],
        messages=[{"role": "user", "content": user_input}],
    )
    latency_ms = (time.time() - start) * 1000
    output = response.content[0].text

    # Record latency metric immediately
    tracker.record_outcome(
        EXPERIMENT_ID, session_id, variant.name, "latency_ms", latency_ms
    )
    # Record cost metric
    cost = (response.usage.input_tokens * 3 + response.usage.output_tokens * 15) / 1e6
    tracker.record_outcome(
        EXPERIMENT_ID, session_id, variant.name, "cost_usd", cost
    )

    return {"output": output, "variant": variant.name, "session_id": session_id}

def record_user_satisfaction(session_id: str, variant: str, thumbs_up: bool) -> None:
    tracker.record_outcome(
        EXPERIMENT_ID, session_id, variant,
        "thumbs_up_rate", 1.0 if thumbs_up else 0.0,
    )

def analyze_experiment() -> dict:
    results = {}
    for metric in ["latency_ms", "cost_usd", "thumbs_up_rate"]:
        by_variant = tracker.get_metric_by_variant(EXPERIMENT_ID, metric)
        if "control" in by_variant and "treatment" in by_variant:
            results[metric] = check_significance(
                by_variant["control"],
                by_variant["treatment"],
            )
    return results`,
        }}
      />

      <PatternBlock
        name="Feature Flags for Agent Variants"
        category="Deployment"
        whenToUse="When you want to control A/B traffic splits and rollouts without deploying new code — enabling real-time adjustments based on experiment results."
      >
        <p>
          Implement agent variant selection through a feature flag system (LaunchDarkly,
          Unleash, or a simple database-backed flag store). Feature flags let you adjust
          traffic splits, pause experiments, and roll back treatments instantly from a dashboard
          without a code deploy. This is critical when a treatment shows negative results — you
          need to stop the experiment immediately, not wait for a deployment cycle.
        </p>
      </PatternBlock>

      <WarningBlock title="Network Effects Violate Independence Assumption">
        <p>
          Classical A/B testing assumes each user's outcome is independent of others. For
          agents in collaborative settings (shared workspaces, multi-user systems), this
          assumption breaks: user A's agent output affects user B's experience. Use cluster
          randomisation (assign entire teams or organisations to the same variant) rather than
          individual user assignment to avoid contamination between control and treatment groups.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Pre-Register Metrics Before Running the Experiment">
        <p>
          Decide your primary success metric and minimum detectable effect <em>before</em>
          starting the experiment, not after looking at the data. Post-hoc metric selection
          leads to p-hacking: with enough metrics, something will appear significant by chance.
          Document: primary metric (e.g. task completion rate), minimum detectable effect (e.g.
          +5%), significance threshold (alpha=0.05), minimum sample size per variant (calculated
          via power analysis), and experiment duration. Commit to shipping if primary metric
          improves, even if secondary metrics are mixed.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Minimum Sample Size Calculation">
        <p>
          For a binary metric (thumbs up/down) with baseline rate p=0.70, detecting a +5%
          absolute lift at 80% power and alpha=0.05 requires approximately 1,200 sessions per
          variant. For a continuous metric (latency), use a two-sample t-test power calculation.
          Under-powered experiments produce unreliable results — do not run A/B tests with fewer
          than 100 sessions per variant, and be cautious with fewer than 500. Use a power
          calculator (scipy.stats, or online tools) to determine the right sample size before
          starting the experiment.
        </p>
      </NoteBlock>
    </article>
  )
}
