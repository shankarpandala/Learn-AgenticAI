import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function RegressionTesting() {
  return (
    <article className="prose-content">
      <h2>Regression Testing</h2>
      <p>
        Regression testing for agents detects quality degradation when something changes: a model
        is updated, a prompt is modified, a tool implementation is refactored, or an external API
        changes its response format. Without regression tests, these changes silently degrade
        agent performance in production — often noticed only through user complaints or business
        metrics, days after the fact.
      </p>

      <ConceptBlock term="Agent Regression Test">
        <p>
          An agent regression test compares current agent performance against a known-good
          baseline on a fixed evaluation dataset. The test fails if any metric drops below a
          defined threshold (e.g., exact match drops from 0.92 to 0.85) or if performance on a
          specific category degrades beyond an acceptable margin. Unlike unit tests, regression
          tests are statistical — they measure distributions, not individual outcomes.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Regression Testing Pipeline"
        width={700}
        height={280}
        nodes={[
          { id: 'change', label: 'Code / Model\nChange', type: 'external', x: 80, y: 140 },
          { id: 'ci', label: 'CI Pipeline', type: 'agent', x: 240, y: 140 },
          { id: 'dataset', label: 'Baseline\nEval Dataset', type: 'store', x: 420, y: 60 },
          { id: 'agent', label: 'Agent\n(new version)', type: 'agent', x: 420, y: 140 },
          { id: 'baseline', label: 'Baseline\nScores DB', type: 'store', x: 420, y: 220 },
          { id: 'compare', label: 'Compare &\nAlert', type: 'tool', x: 590, y: 140 },
        ]}
        edges={[
          { from: 'change', to: 'ci', label: 'triggers' },
          { from: 'ci', to: 'agent', label: 'runs eval' },
          { from: 'dataset', to: 'agent', label: 'inputs' },
          { from: 'agent', to: 'compare', label: 'new scores' },
          { from: 'baseline', to: 'compare', label: 'baseline scores' },
        ]}
      />

      <h2>What Triggers Regressions</h2>
      <ul>
        <li><strong>Model updates:</strong> Provider silently updates a model version, changing calibration, instruction-following, or tool call behaviour</li>
        <li><strong>Prompt changes:</strong> A seemingly minor edit to system prompt wording changes agent reasoning or output format</li>
        <li><strong>Tool refactoring:</strong> A tool returns slightly different field names or data structures, breaking downstream parsing</li>
        <li><strong>External API changes:</strong> A third-party API the agent relies on changes its response schema</li>
        <li><strong>Context window changes:</strong> Retrieval returns more documents, crowding out instruction-following sections of the prompt</li>
      </ul>

      <SDKExample
        title="Regression Testing — Baseline Tracking and Threshold Alerts"
        tabs={{
          python: `import json
import statistics
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Callable

@dataclass
class EvalRun:
    run_id: str
    commit_sha: str
    model: str
    timestamp: str
    scores: dict[str, float]       # metric_name -> score
    per_category: dict[str, dict[str, float]]  # category -> metric -> score

@dataclass
class RegressionResult:
    passed: bool
    regressions: list[dict]   # List of {metric, baseline, current, delta}
    improvements: list[dict]

class RegressionTracker:
    def __init__(self, baseline_path: Path):
        self.baseline_path = baseline_path
        self.baseline_path.mkdir(parents=True, exist_ok=True)

    def save_run(self, run: EvalRun) -> None:
        run_file = self.baseline_path / f"{run.run_id}.json"
        with open(run_file, "w") as f:
            json.dump(asdict(run), f, indent=2)

    def load_baseline(self, baseline_run_id: str) -> EvalRun:
        baseline_file = self.baseline_path / f"{baseline_run_id}.json"
        with open(baseline_file) as f:
            return EvalRun(**json.load(f))

    def compare(
        self,
        current: EvalRun,
        baseline: EvalRun,
        thresholds: dict[str, float],  # metric -> max allowed drop
    ) -> RegressionResult:
        regressions = []
        improvements = []

        for metric, threshold in thresholds.items():
            baseline_score = baseline.scores.get(metric)
            current_score = current.scores.get(metric)
            if baseline_score is None or current_score is None:
                continue

            delta = current_score - baseline_score
            entry = {
                "metric": metric,
                "baseline": baseline_score,
                "current": current_score,
                "delta": delta,
            }
            if delta < -threshold:
                regressions.append(entry)
            elif delta > 0.02:  # meaningful improvement threshold
                improvements.append(entry)

        return RegressionResult(
            passed=len(regressions) == 0,
            regressions=regressions,
            improvements=improvements,
        )

def print_regression_report(result: RegressionResult) -> None:
    status = "PASSED" if result.passed else "FAILED"
    print(f"\\nRegression Check: {status}")
    print("=" * 50)

    if result.regressions:
        print("\\nREGRESSIONS DETECTED:")
        for r in result.regressions:
            print(
                f"  {r['metric']}: {r['baseline']:.3f} → {r['current']:.3f} "
                f"(Δ {r['delta']:+.3f})"
            )

    if result.improvements:
        print("\\nIMPROVEMENTS:")
        for imp in result.improvements:
            print(
                f"  {imp['metric']}: {imp['baseline']:.3f} → {imp['current']:.3f} "
                f"(Δ {imp['delta']:+.3f})"
            )

# ---- Running a regression check in CI ----

import subprocess
import os

def get_current_commit() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"],
        capture_output=True, text=True
    )
    return result.stdout.strip()

async def run_regression_check(
    eval_fn: Callable,      # Your evaluation function
    dataset_path: Path,
    baseline_run_id: str,
    model: str = "claude-3-5-sonnet-20241022",
) -> RegressionResult:
    # Run evaluation with current code
    scores = await eval_fn(dataset_path=dataset_path, model=model)

    current_run = EvalRun(
        run_id=f"run_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        commit_sha=get_current_commit(),
        model=model,
        timestamp=datetime.utcnow().isoformat(),
        scores=scores["overall"],
        per_category=scores["by_category"],
    )

    tracker = RegressionTracker(Path("./eval-baselines"))
    tracker.save_run(current_run)
    baseline = tracker.load_baseline(baseline_run_id)

    # Define acceptable regression thresholds
    thresholds = {
        "exact_match": 0.03,       # Allow up to 3% drop
        "token_f1": 0.05,          # Allow up to 5% drop
        "tool_call_accuracy": 0.02, # Allow up to 2% drop — more sensitive
        "trajectory_penalty": 0.10, # Allow up to 10% drop
    }

    result = tracker.compare(current_run, baseline, thresholds)
    print_regression_report(result)

    if not result.passed:
        raise SystemExit(1)  # Fail CI

    return result

# Statistical significance test for noisy metrics
from scipy import stats

def is_statistically_significant_regression(
    baseline_scores: list[float],
    current_scores: list[float],
    alpha: float = 0.05,
) -> bool:
    """Welch's t-test: returns True if the drop is statistically significant."""
    if statistics.mean(current_scores) >= statistics.mean(baseline_scores):
        return False  # Not a regression
    _, p_value = stats.ttest_ind(baseline_scores, current_scores)
    return p_value < alpha`,
          typescript: `import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";

interface EvalRun {
  runId: string;
  commitSha: string;
  model: string;
  timestamp: string;
  scores: Record<string, number>;
  perCategory: Record<string, Record<string, number>>;
}

interface RegressionEntry {
  metric: string;
  baseline: number;
  current: number;
  delta: number;
}

interface RegressionResult {
  passed: boolean;
  regressions: RegressionEntry[];
  improvements: RegressionEntry[];
}

class RegressionTracker {
  constructor(private baselinePath: string) {
    mkdirSync(baselinePath, { recursive: true });
  }

  saveRun(run: EvalRun): void {
    writeFileSync(
      join(this.baselinePath, \${run.runId}.json),
      JSON.stringify(run, null, 2)
    );
  }

  loadBaseline(baselineRunId: string): EvalRun {
    const content = readFileSync(
      join(this.baselinePath, \${baselineRunId}.json),
      "utf-8"
    );
    return JSON.parse(content) as EvalRun;
  }

  compare(
    current: EvalRun,
    baseline: EvalRun,
    thresholds: Record<string, number>
  ): RegressionResult {
    const regressions: RegressionEntry[] = [];
    const improvements: RegressionEntry[] = [];

    for (const [metric, threshold] of Object.entries(thresholds)) {
      const baselineScore = baseline.scores[metric];
      const currentScore = current.scores[metric];
      if (baselineScore === undefined || currentScore === undefined) continue;

      const delta = currentScore - baselineScore;
      const entry = { metric, baseline: baselineScore, current: currentScore, delta };

      if (delta < -threshold) {
        regressions.push(entry);
      } else if (delta > 0.02) {
        improvements.push(entry);
      }
    }

    return { passed: regressions.length === 0, regressions, improvements };
  }
}

function printRegressionReport(result: RegressionResult): void {
  const status = result.passed ? "PASSED" : "FAILED";
  console.log(\\nRegression Check: \${status});
  console.log("=".repeat(50));

  if (result.regressions.length > 0) {
    console.log("\\nREGRESSIONS DETECTED:");
    for (const r of result.regressions) {
      console.log(
          \${r.metric}: \${r.baseline.toFixed(3)} → \${r.current.toFixed(3)} (Δ \${r.delta >= 0 ? "+" : ""}\${r.delta.toFixed(3)})
      );
    }
  }

  if (result.improvements.length > 0) {
    console.log("\\nIMPROVEMENTS:");
    for (const imp of result.improvements) {
      console.log(
          \${imp.metric}: \${imp.baseline.toFixed(3)} → \${imp.current.toFixed(3)} (Δ +\${imp.delta.toFixed(3)})
      );
    }
  }
}

function getCurrentCommit(): string {
  return execSync("git rev-parse --short HEAD").toString().trim();
}

async function runRegressionCheck(params: {
  evalFn: (datasetPath: string, model: string) => Promise<{
    overall: Record<string, number>;
    byCategory: Record<string, Record<string, number>>;
  }>;
  datasetPath: string;
  baselineRunId: string;
  model?: string;
}): Promise<RegressionResult> {
  const model = params.model ?? "claude-3-5-sonnet-20241022";
  const scores = await params.evalFn(params.datasetPath, model);

  const now = new Date();
  const currentRun: EvalRun = {
    runId: run_\${now.toISOString().replace(/[:.]/g, "_")},
    commitSha: getCurrentCommit(),
    model,
    timestamp: now.toISOString(),
    scores: scores.overall,
    perCategory: scores.byCategory,
  };

  const tracker = new RegressionTracker("./eval-baselines");
  tracker.saveRun(currentRun);
  const baseline = tracker.loadBaseline(params.baselineRunId);

  const thresholds: Record<string, number> = {
    exactMatch: 0.03,
    tokenF1: 0.05,
    toolCallAccuracy: 0.02,
    trajectoryPenalty: 0.10,
  };

  const result = tracker.compare(currentRun, baseline, thresholds);
  printRegressionReport(result);

  if (!result.passed) {
    process.exit(1);
  }
  return result;
}`,
        }}
      />

      <PatternBlock
        name="Canary Regression Check"
        category="Deployment Safety"
        whenToUse="Before rolling out a model update or significant prompt change to 100% of production traffic, validate on a representative sample."
      >
        <p>
          Route 5–10% of production traffic to the new agent version for 24–48 hours. Compare
          key metrics (task completion rate, tool error rate, user satisfaction signals) between
          canary and control. If no regressions are detected, increase rollout to 50%, then 100%.
          This catches real-world regressions that synthetic eval datasets miss, particularly for
          long-tail queries.
        </p>
      </PatternBlock>

      <WarningBlock title="Beware of Metric Gaming Over Time">
        <p>
          When regression tests gate deployments, there is pressure (conscious or not) to tune
          agents specifically for the eval dataset rather than for genuine quality. Symptoms
          include: eval scores steadily improving while user satisfaction stagnates, agents that
          perform well on known eval queries but poorly on new query types, and eval datasets
          that are never refreshed. Refresh eval datasets regularly and audit for dataset
          contamination in fine-tuning pipelines.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Set Category-Level Thresholds, Not Just Overall">
        <p>
          An overall metric can mask regressions in critical categories. A 0.5% overall drop in
          exact match might be acceptable — but a 15% drop in the "safety refusals" category is
          not. Define per-category regression thresholds that reflect business criticality.
          Safety and compliance categories should have near-zero tolerance; cosmetic output
          quality categories can have looser thresholds.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Statistical Significance for Noisy Metrics">
        <p>
          LLM outputs have inherent variance — the same input can produce slightly different
          outputs across runs. Before raising a regression alert, confirm the drop is statistically
          significant (Welch's t-test, p &lt; 0.05) rather than sampling noise. This requires
          running eval with a fixed random seed or multiple samples, and accumulating enough
          examples per category to have statistical power. A dataset with only 10 examples per
          category will produce noisy, unreliable regression signals.
        </p>
      </NoteBlock>
    </article>
  )
}
