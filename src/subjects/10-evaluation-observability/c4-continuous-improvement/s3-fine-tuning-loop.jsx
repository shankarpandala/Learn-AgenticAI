import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function FineTuningLoop() {
  return (
    <article className="prose-content">
      <h2>Fine-Tuning Loop</h2>
      <p>
        The fine-tuning loop is the process of using production traces, user corrections, and
        evaluation failures to continuously improve smaller, more cost-efficient models for
        specialised agent tasks. Rather than relying exclusively on large frontier models for
        every step, you identify the sub-tasks where a fine-tuned smaller model can match
        frontier performance at a fraction of the cost and latency — then build a systematic
        pipeline to keep that fine-tuned model current with evolving production data.
      </p>

      <ConceptBlock term="Fine-Tuning Loop">
        <p>
          The fine-tuning loop is a closed feedback cycle: production traces are filtered and
          curated into training examples, a smaller base model is fine-tuned on those examples,
          the fine-tuned model is evaluated against a held-out dataset and compared to the
          frontier baseline, and if it meets quality thresholds it is deployed to replace the
          frontier model for that task. The loop repeats as new production data accumulates,
          keeping the fine-tuned model aligned with current user needs.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Fine-Tuning Loop Pipeline"
        width={700}
        height={280}
        nodes={[
          { id: 'prod', label: 'Production\nTraces', type: 'external', x: 80, y: 140 },
          { id: 'curate', label: 'Data Curation\n& Filtering', type: 'tool', x: 240, y: 140 },
          { id: 'train', label: 'Fine-Tuning\nJob', type: 'agent', x: 400, y: 140 },
          { id: 'eval', label: 'Eval vs.\nBaseline', type: 'tool', x: 560, y: 80 },
          { id: 'deploy', label: 'Deploy Fine-\nTuned Model', type: 'store', x: 560, y: 200 },
        ]}
        edges={[
          { from: 'prod', to: 'curate', label: 'filter' },
          { from: 'curate', to: 'train', label: 'training set' },
          { from: 'train', to: 'eval', label: 'candidate model' },
          { from: 'eval', to: 'deploy', label: 'if meets threshold' },
          { from: 'deploy', to: 'prod', label: 'new production data' },
        ]}
      />

      <h2>When Fine-Tuning Makes Sense</h2>
      <ul>
        <li><strong>High-volume, narrow task:</strong> The same 5–10 task types account for 80% of your agent's calls</li>
        <li><strong>Stable format requirements:</strong> The agent must always output in a specific JSON schema or follow a rigid style guide</li>
        <li><strong>Domain-specific knowledge:</strong> Your domain has terminology, acronyms, or conventions a general model handles poorly</li>
        <li><strong>Cost sensitivity:</strong> The task is simple enough for a smaller model but you are currently paying frontier model prices</li>
        <li><strong>Latency sensitivity:</strong> You need sub-second response times that only smaller models can achieve</li>
      </ul>

      <SDKExample
        title="Fine-Tuning Data Pipeline — From Traces to Training Examples"
        tabs={{
          python: `import json
import asyncio
from dataclasses import dataclass
from pathlib import Path
from typing import Literal
import anthropic

@dataclass
class TraceRecord:
    trace_id: str
    user_input: str
    agent_output: str
    tool_calls: list[dict]
    quality_score: float | None  # From LLM-as-judge or human eval
    feedback: Literal["positive", "negative", "correction"] | None
    corrected_output: str | None

# ---- Step 1: Filter high-quality traces ----

def filter_training_candidates(
    traces: list[TraceRecord],
    min_quality_score: float = 0.8,
    include_corrections: bool = True,
) -> list[TraceRecord]:
    """Select traces suitable for fine-tuning."""
    candidates = []
    for trace in traces:
        # Always include user corrections (highest signal)
        if include_corrections and trace.corrected_output:
            candidates.append(trace)
            continue
        # Include positively-rated traces above quality threshold
        if (trace.feedback == "positive" and
                trace.quality_score and
                trace.quality_score >= min_quality_score):
            candidates.append(trace)
    return candidates

# ---- Step 2: Convert to fine-tuning format ----

def to_training_example(trace: TraceRecord, system_prompt: str) -> dict:
    """Convert a trace to OpenAI/Anthropic fine-tuning JSONL format."""
    # Use corrected output if available, otherwise use high-quality original
    target_output = trace.corrected_output or trace.agent_output
    return {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": trace.user_input},
            {"role": "assistant", "content": target_output},
        ]
    }

def export_training_set(
    traces: list[TraceRecord],
    system_prompt: str,
    output_path: Path,
    train_fraction: float = 0.9,
) -> dict:
    """Export filtered traces as train/validation JSONL splits."""
    candidates = filter_training_candidates(traces)
    examples = [to_training_example(t, system_prompt) for t in candidates]

    # Shuffle deterministically
    import random
    random.seed(42)
    random.shuffle(examples)

    split = int(len(examples) * train_fraction)
    train_examples = examples[:split]
    val_examples = examples[split:]

    output_path.mkdir(parents=True, exist_ok=True)
    for split_name, split_data in [("train", train_examples), ("val", val_examples)]:
        file = output_path / f"{split_name}.jsonl"
        with open(file, "w") as f:
            for ex in split_data:
                f.write(json.dumps(ex) + "\\n")

    return {
        "total_examples": len(examples),
        "train": len(train_examples),
        "val": len(val_examples),
        "output_path": str(output_path),
    }

# ---- Step 3: Quality gate — compare fine-tuned vs frontier ----

async def evaluate_model_against_baseline(
    eval_dataset: list[dict],
    fine_tuned_model: str,          # e.g., "ft:claude-haiku:your-org:job-id"
    baseline_model: str = "claude-3-5-sonnet-20241022",
    judge_model: str = "claude-3-5-sonnet-20241022",
) -> dict:
    """LLM-as-judge comparison between fine-tuned and baseline models."""
    client = anthropic.AsyncAnthropic()
    wins = {"fine_tuned": 0, "baseline": 0, "tie": 0}

    async def judge_pair(example: dict) -> str:
        ft_response = await client.messages.create(
            model=fine_tuned_model,
            max_tokens=1024,
            messages=[{"role": "user", "content": example["input"]}],
        )
        base_response = await client.messages.create(
            model=baseline_model,
            max_tokens=1024,
            messages=[{"role": "user", "content": example["input"]}],
        )
        # Randomise order to reduce position bias
        import random
        flip = random.random() > 0.5
        a = ft_response.content[0].text if not flip else base_response.content[0].text
        b = base_response.content[0].text if not flip else ft_response.content[0].text
        a_label = "fine_tuned" if not flip else "baseline"

        judge_prompt = f"""Compare two responses to a user query. Choose the better one.

User query: {example["input"]}

Response A:
{a}

Response B:
{b}

Output JSON only: {{"winner": "A" or "B" or "tie", "reason": "brief explanation"}}"""

        judgment = await client.messages.create(
            model=judge_model,
            max_tokens=256,
            messages=[{"role": "user", "content": judge_prompt}],
        )
        result = json.loads(judgment.content[0].text)
        if result["winner"] == "tie":
            return "tie"
        winner = a_label if result["winner"] == "A" else (
            "baseline" if a_label == "fine_tuned" else "fine_tuned"
        )
        return winner

    # Run evaluations with concurrency limit
    sem = asyncio.Semaphore(5)
    async def limited_judge(ex):
        async with sem:
            return await judge_pair(ex)

    results = await asyncio.gather(*[limited_judge(ex) for ex in eval_dataset])
    for r in results:
        wins[r] += 1

    total = len(results)
    fine_tuned_win_rate = wins["fine_tuned"] / total
    return {
        "fine_tuned_win_rate": fine_tuned_win_rate,
        "baseline_win_rate": wins["baseline"] / total,
        "tie_rate": wins["tie"] / total,
        "total_comparisons": total,
        "passes_threshold": fine_tuned_win_rate >= 0.45,  # Accept if within 5% of baseline
    }

# ---- Step 4: Automate the loop ----

async def run_fine_tuning_loop(
    trace_source_path: Path,
    eval_dataset_path: Path,
    output_dir: Path,
    system_prompt: str,
) -> dict:
    """Orchestrate the full fine-tuning loop."""
    # Load traces (from your tracing system)
    with open(trace_source_path) as f:
        raw_traces = [TraceRecord(**json.loads(line)) for line in f]

    # Export training data
    stats = export_training_set(raw_traces, system_prompt, output_dir / "training-data")
    print(f"Exported {stats['train']} train / {stats['val']} val examples")

    # (Submit fine-tuning job to your provider here)
    # fine_tuned_model = submit_fine_tuning_job(output_dir / "training-data" / "train.jsonl")

    # Load eval dataset
    with open(eval_dataset_path) as f:
        eval_data = [json.loads(line) for line in f]

    # Evaluate (uncomment when fine_tuned_model is available)
    # eval_result = await evaluate_model_against_baseline(eval_data, fine_tuned_model)
    # if eval_result["passes_threshold"]:
    #     deploy_model(fine_tuned_model)
    # return eval_result
    return stats`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";

interface TraceRecord {
  traceId: string;
  userInput: string;
  agentOutput: string;
  toolCalls: unknown[];
  qualityScore: number | null;
  feedback: "positive" | "negative" | "correction" | null;
  correctedOutput: string | null;
}

interface TrainingExample {
  messages: Array<{ role: string; content: string }>;
}

// ---- Step 1: Filter high-quality traces ----

function filterTrainingCandidates(
  traces: TraceRecord[],
  minQualityScore = 0.8,
  includeCorrections = true
): TraceRecord[] {
  return traces.filter((trace) => {
    if (includeCorrections && trace.correctedOutput) return true;
    return (
      trace.feedback === "positive" &&
      trace.qualityScore !== null &&
      trace.qualityScore >= minQualityScore
    );
  });
}

// ---- Step 2: Convert to fine-tuning format ----

function toTrainingExample(trace: TraceRecord, systemPrompt: string): TrainingExample {
  const targetOutput = trace.correctedOutput ?? trace.agentOutput;
  return {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: trace.userInput },
      { role: "assistant", content: targetOutput },
    ],
  };
}

function exportTrainingSet(params: {
  traces: TraceRecord[];
  systemPrompt: string;
  outputDir: string;
  trainFraction?: number;
}): { total: number; train: number; val: number } {
  const { traces, systemPrompt, outputDir, trainFraction = 0.9 } = params;
  const candidates = filterTrainingCandidates(traces);
  const examples = candidates.map((t) => toTrainingExample(t, systemPrompt));

  // Shuffle deterministically
  examples.sort(() => 0.5 - Math.random()); // Use seeded random in production

  const split = Math.floor(examples.length * trainFraction);
  mkdirSync(outputDir, { recursive: true });

  for (const [name, data] of [
    ["train", examples.slice(0, split)],
    ["val", examples.slice(split)],
  ] as const) {
    writeFileSync(
      join(outputDir, \${name}.jsonl),
      data.map((ex) => JSON.stringify(ex)).join("\\n") + "\\n"
    );
  }
  return { total: examples.length, train: split, val: examples.length - split };
}

// ---- Step 3: Quality gate ----

async function evaluateFineTunedModel(params: {
  evalDataset: Array<{ input: string; referenceOutput?: string }>;
  fineTunedModel: string;
  baselineModel?: string;
  judgeModel?: string;
  concurrency?: number;
}): Promise<{
  fineTunedWinRate: number;
  baselineWinRate: number;
  tieRate: number;
  total: number;
  passesThreshold: boolean;
}> {
  const {
    evalDataset,
    fineTunedModel,
    baselineModel = "claude-3-5-sonnet-20241022",
    judgeModel = "claude-3-5-sonnet-20241022",
    concurrency = 5,
  } = params;

  const client = new Anthropic();
  const wins = { fine_tuned: 0, baseline: 0, tie: 0 };

  const chunks: typeof evalDataset[] = [];
  for (let i = 0; i < evalDataset.length; i += concurrency) {
    chunks.push(evalDataset.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const results = await Promise.all(
      chunk.map(async (example) => {
        const [ftResp, baseResp] = await Promise.all([
          client.messages.create({
            model: fineTunedModel,
            max_tokens: 1024,
            messages: [{ role: "user", content: example.input }],
          }),
          client.messages.create({
            model: baselineModel,
            max_tokens: 1024,
            messages: [{ role: "user", content: example.input }],
          }),
        ]);

        const flip = Math.random() > 0.5;
        const ftText = (ftResp.content[0] as { text: string }).text;
        const baseText = (baseResp.content[0] as { text: string }).text;
        const a = flip ? ftText : baseText;
        const b = flip ? baseText : ftText;
        const aLabel = flip ? "fine_tuned" : "baseline";

        const judgment = await client.messages.create({
          model: judgeModel,
          max_tokens: 256,
          messages: [{
            role: "user",
            content: Compare two responses. Output JSON: {"winner": "A"|"B"|"tie"}

User: \${example.input}
A: \${a}
B: \${b},
          }],
        });

        const parsed = JSON.parse((judgment.content[0] as { text: string }).text);
        if (parsed.winner === "tie") return "tie";
        return parsed.winner === "A" ? aLabel : (aLabel === "fine_tuned" ? "baseline" : "fine_tuned");
      })
    );
    for (const r of results) wins[r as keyof typeof wins]++;
  }

  const total = evalDataset.length;
  return {
    fineTunedWinRate: wins.fine_tuned / total,
    baselineWinRate: wins.baseline / total,
    tieRate: wins.tie / total,
    total,
    passesThreshold: wins.fine_tuned / total >= 0.45,
  };
}`,
        }}
      />

      <PatternBlock
        name="Teacher-Student Distillation"
        category="Fine-Tuning"
        whenToUse="When you want to compress a capable frontier model's reasoning into a smaller, faster model for a specific task, without needing large amounts of human-labelled data."
      >
        <p>
          Use a frontier model (the "teacher") to generate high-quality responses for a large
          set of task-representative inputs, then fine-tune a smaller model (the "student") to
          imitate those responses. The student model learns the teacher's output style, format,
          and reasoning patterns for the specific task distribution, often achieving 90%+ of
          teacher performance at 10x lower cost. This is the foundation of most production
          fine-tuning workflows.
        </p>
      </PatternBlock>

      <WarningBlock title="Never Fine-Tune on Eval Data">
        <p>
          The most dangerous mistake in the fine-tuning loop is accidentally including evaluation
          examples in the training set. This produces inflated eval scores that do not reflect
          real-world performance — a form of "eval contamination" that invalidates your quality
          signal. Maintain a strict separation: freeze your eval dataset before any fine-tuning
          begins, store it in a separate registry with access controls, and add automated checks
          that compare training example IDs against eval example IDs before every fine-tuning job.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Version Every Fine-Tuned Model with Its Training Lineage">
        <p>
          For each fine-tuned model, record in a model registry: the base model version, the
          training dataset version and count, the fine-tuning hyperparameters, the eval scores
          at graduation, and the deployment date. This lineage is essential for debugging
          regressions — if a fine-tuned model starts performing poorly, you need to trace back
          to exactly which training examples caused the behaviour. Store this metadata
          alongside the model checkpoint, not just in a doc or ticket.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Start with Format Fine-Tuning, Then Content">
        <p>
          The easiest wins from fine-tuning come from format consistency: teaching a model to
          always output valid JSON, follow a specific response structure, or use your company's
          terminology correctly. These format requirements are deterministic, easy to evaluate
          automatically, and dramatically reduce prompt overhead (you no longer need lengthy
          format instructions in the system prompt). Once format is solid, move to content quality
          fine-tuning using LLM-as-judge evaluation.
        </p>
      </NoteBlock>
    </article>
  )
}
