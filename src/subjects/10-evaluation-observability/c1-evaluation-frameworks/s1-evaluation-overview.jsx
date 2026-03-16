import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function EvaluationOverview() {
  return (
    <article className="prose-content">
      <h2>Evaluation Overview</h2>
      <p>
        Evaluating agentic AI systems is fundamentally different from evaluating classical software.
        Agents produce open-ended outputs, take multi-step actions, and interact with external
        services — making deterministic pass/fail tests insufficient. A robust evaluation strategy
        combines automated metrics for speed and scale, human evaluation for ground truth, and
        LLM-as-judge for nuanced quality assessment at production volume.
      </p>

      <ConceptBlock term="Agent Evaluation">
        <p>
          Agent evaluation measures the quality of an agent's outputs, decisions, and trajectories
          across three dimensions: <strong>correctness</strong> (did it produce the right answer?),
          <strong>efficiency</strong> (did it take a reasonable path to get there?), and
          <strong>safety</strong> (did it avoid harmful or unwanted actions?). Each dimension
          requires different measurement approaches and often different datasets.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Agent Evaluation Landscape"
        width={700}
        height={300}
        nodes={[
          { id: 'agent', label: 'Agent Under\nEvaluation', type: 'agent', x: 140, y: 150 },
          { id: 'auto', label: 'Automated\nMetrics', type: 'tool', x: 360, y: 60 },
          { id: 'human', label: 'Human\nEvaluation', type: 'external', x: 360, y: 150 },
          { id: 'llmjudge', label: 'LLM-as-Judge', type: 'llm', x: 360, y: 240 },
          { id: 'report', label: 'Eval Report\n& Dashboard', type: 'store', x: 570, y: 150 },
        ]}
        edges={[
          { from: 'agent', to: 'auto', label: 'outputs' },
          { from: 'agent', to: 'human', label: 'samples' },
          { from: 'agent', to: 'llmjudge', label: 'outputs' },
          { from: 'auto', to: 'report' },
          { from: 'human', to: 'report' },
          { from: 'llmjudge', to: 'report' },
        ]}
      />

      <h2>The Three Evaluation Paradigms</h2>

      <h3>1. Automated Metrics</h3>
      <p>
        Automated metrics compute scores deterministically from agent outputs and reference answers.
        They are fast, cheap, reproducible, and easy to integrate into CI/CD pipelines. Common
        metrics include exact match, F1 score over extracted tokens, BLEU/ROUGE for text
        similarity, tool call accuracy (did the agent invoke the right tools?), and trajectory
        length (how many steps did it take?).
      </p>

      <h3>2. Human Evaluation</h3>
      <p>
        Human evaluators are the gold standard for subjective quality dimensions: helpfulness,
        tone, factual accuracy on niche topics, and appropriateness of refusals. Human eval is
        expensive and slow but essential for calibrating automated metrics and catching systematic
        failures that automation misses. Structured rating rubrics and inter-annotator agreement
        metrics (Cohen's kappa) are critical for consistent human eval.
      </p>

      <h3>3. LLM-as-Judge</h3>
      <p>
        A powerful LLM acts as a scalable evaluator, scoring agent outputs against a rubric.
        LLM-as-judge bridges the gap: it's faster and cheaper than human eval, yet captures
        nuance that automated metrics miss. It works best with explicit scoring rubrics, chain-of-
        thought reasoning, and calibration against human labels.
      </p>

      <PatternBlock
        name="Eval Pyramid"
        category="Evaluation Strategy"
        whenToUse="When designing a comprehensive evaluation system for agents that need both fast CI feedback and deep quality assessment."
      >
        <p>
          Structure evaluation like a testing pyramid: many cheap automated metric checks at the
          base (run on every commit), a middle layer of LLM-as-judge evaluations (run on every
          release candidate), and a small number of expensive human evaluations at the top (run
          weekly or on major model/prompt changes). Each layer catches different failure modes.
        </p>
      </PatternBlock>

      <h2>Key Evaluation Metrics for Agents</h2>

      <SDKExample
        title="Evaluation Metrics — Core Implementations"
        tabs={{
          python: `from dataclasses import dataclass
from typing import Any
import re

@dataclass
class AgentTrace:
    input: str
    output: str
    tool_calls: list[dict]
    reference_output: str | None = None
    reference_tool_calls: list[dict] | None = None

# --- Automated Metrics ---

def exact_match(trace: AgentTrace) -> float:
    """Binary score: 1.0 if output exactly matches reference."""
    if trace.reference_output is None:
        raise ValueError("exact_match requires reference_output")
    return 1.0 if trace.output.strip() == trace.reference_output.strip() else 0.0

def token_f1(trace: AgentTrace) -> float:
    """Token-level F1 between output and reference (common for QA tasks)."""
    def tokenize(text: str) -> set[str]:
        return set(re.findall(r'\\b\\w+\\b', text.lower()))

    pred_tokens = tokenize(trace.output)
    ref_tokens = tokenize(trace.reference_output or "")
    if not pred_tokens or not ref_tokens:
        return 0.0
    common = pred_tokens & ref_tokens
    precision = len(common) / len(pred_tokens)
    recall = len(common) / len(ref_tokens)
    if precision + recall == 0:
        return 0.0
    return 2 * precision * recall / (precision + recall)

def tool_call_accuracy(trace: AgentTrace) -> float:
    """Fraction of expected tool calls that were made (in any order)."""
    if not trace.reference_tool_calls:
        return 1.0
    ref_names = {tc["name"] for tc in trace.reference_tool_calls}
    pred_names = {tc.get("name", tc.get("function", {}).get("name", ""))
                  for tc in trace.tool_calls}
    if not ref_names:
        return 1.0
    return len(ref_names & pred_names) / len(ref_names)

def trajectory_length_penalty(trace: AgentTrace, max_steps: int = 10) -> float:
    """Score penalizing unnecessarily long trajectories (1.0 = optimal)."""
    steps = len(trace.tool_calls)
    if steps <= max_steps:
        return 1.0
    return max(0.0, 1.0 - (steps - max_steps) / max_steps)

# --- Running an evaluation suite ---

def run_eval_suite(traces: list[AgentTrace]) -> dict[str, float]:
    results = {
        "exact_match": [],
        "token_f1": [],
        "tool_call_accuracy": [],
        "trajectory_penalty": [],
    }
    for trace in traces:
        if trace.reference_output:
            results["exact_match"].append(exact_match(trace))
            results["token_f1"].append(token_f1(trace))
        results["tool_call_accuracy"].append(tool_call_accuracy(trace))
        results["trajectory_penalty"].append(trajectory_length_penalty(trace))

    return {
        metric: sum(scores) / len(scores)
        for metric, scores in results.items()
        if scores
    }

# Example usage
traces = [
    AgentTrace(
        input="What is the capital of France?",
        output="The capital of France is Paris.",
        tool_calls=[],
        reference_output="The capital of France is Paris.",
    ),
    AgentTrace(
        input="Search for recent AI papers and summarize",
        output="Here are three recent papers: ...",
        tool_calls=[
            {"name": "web_search", "args": {"query": "recent AI papers 2025"}},
            {"name": "summarize", "args": {"text": "..."}},
        ],
        reference_tool_calls=[
            {"name": "web_search"},
            {"name": "summarize"},
        ],
        reference_output=None,
    ),
]

scores = run_eval_suite(traces)
print(scores)
# {'exact_match': 1.0, 'token_f1': 1.0, 'tool_call_accuracy': 1.0, 'trajectory_penalty': 1.0}`,
          typescript: `interface AgentTrace {
  input: string;
  output: string;
  toolCalls: Array<{ name?: string; function?: { name: string } }>;
  referenceOutput?: string;
  referenceToolCalls?: Array<{ name: string }>;
}

// --- Automated Metrics ---

function exactMatch(trace: AgentTrace): number {
  if (trace.referenceOutput === undefined) {
    throw new Error("exactMatch requires referenceOutput");
  }
  return trace.output.trim() === trace.referenceOutput.trim() ? 1.0 : 0.0;
}

function tokenF1(trace: AgentTrace): number {
  const tokenize = (text: string): Set<string> =>
    new Set(text.toLowerCase().match(/\b\w+\b/g) ?? []);

  const predTokens = tokenize(trace.output);
  const refTokens = tokenize(trace.referenceOutput ?? "");
  if (!predTokens.size || !refTokens.size) return 0.0;

  const common = new Set([...predTokens].filter((t) => refTokens.has(t)));
  const precision = common.size / predTokens.size;
  const recall = common.size / refTokens.size;
  if (precision + recall === 0) return 0.0;
  return (2 * precision * recall) / (precision + recall);
}

function toolCallAccuracy(trace: AgentTrace): number {
  if (!trace.referenceToolCalls?.length) return 1.0;
  const refNames = new Set(trace.referenceToolCalls.map((tc) => tc.name));
  const predNames = new Set(
    trace.toolCalls.map((tc) => tc.name ?? tc.function?.name ?? "")
  );
  return [...refNames].filter((n) => predNames.has(n)).length / refNames.size;
}

function trajectoryLengthPenalty(
  trace: AgentTrace,
  maxSteps = 10
): number {
  const steps = trace.toolCalls.length;
  if (steps <= maxSteps) return 1.0;
  return Math.max(0.0, 1.0 - (steps - maxSteps) / maxSteps);
}

// --- Running an evaluation suite ---

interface EvalResults {
  exactMatch?: number;
  tokenF1?: number;
  toolCallAccuracy: number;
  trajectoryPenalty: number;
}

function runEvalSuite(traces: AgentTrace[]): EvalResults {
  const buckets: Record<string, number[]> = {
    exactMatch: [],
    tokenF1: [],
    toolCallAccuracy: [],
    trajectoryPenalty: [],
  };

  for (const trace of traces) {
    if (trace.referenceOutput !== undefined) {
      buckets.exactMatch.push(exactMatch(trace));
      buckets.tokenF1.push(tokenF1(trace));
    }
    buckets.toolCallAccuracy.push(toolCallAccuracy(trace));
    buckets.trajectoryPenalty.push(trajectoryLengthPenalty(trace));
  }

  return Object.fromEntries(
    Object.entries(buckets)
      .filter(([, scores]) => scores.length > 0)
      .map(([k, scores]) => [k, scores.reduce((a, b) => a + b, 0) / scores.length])
  ) as EvalResults;
}`,
        }}
      />

      <BestPracticeBlock title="Always Report Metric Distributions, Not Just Averages">
        <p>
          A mean exact match of 0.85 hides the fact that 15% of queries fail completely. Report
          the full distribution (p50, p90, p99) and track failure mode breakdowns by query category.
          A single catastrophic failure on an edge case matters more than marginal improvements
          on easy queries. Set hard minimum thresholds on safety-critical metrics, not just averages.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Evaluation is a Product, Not a One-Off">
        <p>
          The most common mistake is running evaluation once before launch and never again.
          Evaluation must be continuous: every model update, prompt change, or tool modification
          should trigger a re-evaluation against the same held-out dataset. Treat your evaluation
          suite as a first-class engineering artifact with version control, code review, and
          dedicated ownership.
        </p>
      </NoteBlock>
    </article>
  )
}
