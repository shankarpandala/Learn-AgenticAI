import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function LlmAsJudge() {
  return (
    <article className="prose-content">
      <h2>LLM-as-Judge</h2>
      <p>
        LLM-as-judge uses a powerful language model to evaluate agent outputs at scale — scoring
        quality dimensions that automated string-matching metrics cannot capture: helpfulness,
        factual accuracy, reasoning quality, and instruction-following. It bridges the gap between
        cheap-but-shallow automated metrics and expensive-but-deep human evaluation.
      </p>

      <ConceptBlock term="LLM-as-Judge">
        <p>
          In the LLM-as-judge pattern, a capable model (often GPT-4o or Claude 3.5 Sonnet) receives
          the evaluation input, the agent's output, an optional reference answer, and a structured
          scoring rubric. It returns a numeric score plus a chain-of-thought critique that explains
          the rating. The judge model is typically different from — and more capable than — the
          model being evaluated.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="LLM-as-Judge Evaluation Pipeline"
        width={700}
        height={260}
        nodes={[
          { id: 'dataset', label: 'Eval Dataset', type: 'store', x: 80, y: 130 },
          { id: 'agent', label: 'Agent Under\nTest', type: 'agent', x: 240, y: 130 },
          { id: 'judge', label: 'Judge LLM\n(GPT-4o / Claude)', type: 'llm', x: 440, y: 130 },
          { id: 'scores', label: 'Score +\nCritique DB', type: 'store', x: 610, y: 130 },
        ]}
        edges={[
          { from: 'dataset', to: 'agent', label: 'input' },
          { from: 'agent', to: 'judge', label: 'output' },
          { from: 'dataset', to: 'judge', label: 'reference' },
          { from: 'judge', to: 'scores', label: 'score + reason' },
        ]}
      />

      <h2>Rubric Design</h2>
      <p>
        The quality of LLM-as-judge evaluations depends almost entirely on rubric design. A good
        rubric is: <strong>specific</strong> (criteria are unambiguous), <strong>independent</strong>
        (each dimension measures one thing), and <strong>anchored</strong> (each score point has
        a concrete behavioural description). Avoid vague criteria like "quality" or "good".
      </p>

      <SDKExample
        title="LLM-as-Judge — Rubric-Based Evaluation"
        tabs={{
          python: `import anthropic
import json
from dataclasses import dataclass

client = anthropic.Anthropic()

@dataclass
class JudgeResult:
    score: int          # 1–5
    critique: str
    dimension: str

HELPFULNESS_RUBRIC = """
You are an expert evaluator. Score the assistant response on HELPFULNESS (1-5).

RUBRIC:
5 - Completely addresses the request, provides actionable and accurate information,
    anticipates follow-up needs.
4 - Addresses the main request with minor gaps; information is accurate and useful.
3 - Partially addresses the request; some useful content but missing key aspects.
2 - Minimally helpful; response is tangentially related or mostly unhelpful.
1 - Does not address the request; incorrect, harmful, or refuses without reason.

OUTPUT FORMAT (JSON only, no other text):
{
  "score": <1-5>,
  "critique": "<2-3 sentences explaining the score with specific evidence>"
}
"""

FACTUAL_ACCURACY_RUBRIC = """
You are an expert evaluator. Score the assistant response on FACTUAL ACCURACY (1-5).

RUBRIC:
5 - All factual claims are verifiably correct; no hallucinations.
4 - Mostly accurate with at most one minor inaccuracy that does not mislead.
3 - Some accurate content but contains at least one notable factual error.
2 - Multiple factual errors that could meaningfully mislead the user.
1 - Primarily false or hallucinated content.

OUTPUT FORMAT (JSON only, no other text):
{
  "score": <1-5>,
  "critique": "<2-3 sentences citing specific correct or incorrect claims>"
}
"""

def judge_response(
    user_input: str,
    agent_output: str,
    rubric: str,
    dimension: str,
    reference_answer: str | None = None,
) -> JudgeResult:
    reference_section = (
        f"\\nREFERENCE ANSWER:\\n{reference_answer}\\n"
        if reference_answer else ""
    )
    prompt = f"""{rubric}

USER INPUT:
{user_input}
{reference_section}
ASSISTANT RESPONSE TO EVALUATE:
{agent_output}

Provide your evaluation as JSON:"""

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )
    result = json.loads(response.content[0].text)
    return JudgeResult(
        score=result["score"],
        critique=result["critique"],
        dimension=dimension,
    )

# Multi-dimensional evaluation
def evaluate_agent_response(
    user_input: str,
    agent_output: str,
    reference_answer: str | None = None,
) -> dict[str, JudgeResult]:
    dimensions = [
        ("helpfulness", HELPFULNESS_RUBRIC),
        ("factual_accuracy", FACTUAL_ACCURACY_RUBRIC),
    ]
    results = {}
    for dimension, rubric in dimensions:
        results[dimension] = judge_response(
            user_input=user_input,
            agent_output=agent_output,
            rubric=rubric,
            dimension=dimension,
            reference_answer=reference_answer,
        )
    return results

# Batch evaluation with rate limiting
import asyncio
from asyncio import Semaphore

async def batch_evaluate(
    examples: list[dict],
    concurrency: int = 5,
) -> list[dict[str, JudgeResult]]:
    sem = Semaphore(concurrency)
    async_client = anthropic.AsyncAnthropic()

    async def evaluate_one(example: dict) -> dict[str, JudgeResult]:
        async with sem:
            # Use async client for parallel evaluation
            return evaluate_agent_response(
                user_input=example["input"],
                agent_output=example["output"],
                reference_answer=example.get("reference"),
            )

    return await asyncio.gather(*[evaluate_one(ex) for ex in examples])

# Example
result = evaluate_agent_response(
    user_input="Explain how transformers work",
    agent_output="Transformers use self-attention to process sequences in parallel...",
    reference_answer="Transformers are neural network architectures that use self-attention...",
)
for dimension, judgment in result.items():
    print(f"{dimension}: {judgment.score}/5 — {judgment.critique}")`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface JudgeResult {
  score: number;   // 1-5
  critique: string;
  dimension: string;
}

const HELPFULNESS_RUBRIC = 
You are an expert evaluator. Score the assistant response on HELPFULNESS (1-5).

RUBRIC:
5 - Completely addresses the request, provides actionable and accurate information,
    anticipates follow-up needs.
4 - Addresses the main request with minor gaps; information is accurate and useful.
3 - Partially addresses the request; some useful content but missing key aspects.
2 - Minimally helpful; response is tangentially related or mostly unhelpful.
1 - Does not address the request; incorrect, harmful, or refuses without reason.

OUTPUT FORMAT (JSON only, no other text):
{
  "score": <1-5>,
  "critique": "<2-3 sentences explaining the score with specific evidence>"
}
;

const FACTUAL_ACCURACY_RUBRIC = 
You are an expert evaluator. Score the assistant response on FACTUAL ACCURACY (1-5).

RUBRIC:
5 - All factual claims are verifiably correct; no hallucinations.
4 - Mostly accurate with at most one minor inaccuracy that does not mislead.
3 - Some accurate content but contains at least one notable factual error.
2 - Multiple factual errors that could meaningfully mislead the user.
1 - Primarily false or hallucinated content.

OUTPUT FORMAT (JSON only, no other text):
{
  "score": <1-5>,
  "critique": "<2-3 sentences citing specific correct or incorrect claims>"
}
;

async function judgeResponse(params: {
  userInput: string;
  agentOutput: string;
  rubric: string;
  dimension: string;
  referenceAnswer?: string;
}): Promise<JudgeResult> {
  const referenceSection = params.referenceAnswer
    ? \\nREFERENCE ANSWER:\\n\${params.referenceAnswer}\\n
    : "";

  const prompt = \${params.rubric}

USER INPUT:
\${params.userInput}
\${referenceSection}
ASSISTANT RESPONSE TO EVALUATE:
\${params.agentOutput}

Provide your evaluation as JSON:;

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as { text: string }).text;
  const result = JSON.parse(text);
  return { ...result, dimension: params.dimension };
}

async function evaluateAgentResponse(params: {
  userInput: string;
  agentOutput: string;
  referenceAnswer?: string;
}): Promise<Record<string, JudgeResult>> {
  const dimensions = [
    { name: "helpfulness", rubric: HELPFULNESS_RUBRIC },
    { name: "factual_accuracy", rubric: FACTUAL_ACCURACY_RUBRIC },
  ];

  const results = await Promise.all(
    dimensions.map((d) =>
      judgeResponse({
        userInput: params.userInput,
        agentOutput: params.agentOutput,
        rubric: d.rubric,
        dimension: d.name,
        referenceAnswer: params.referenceAnswer,
      })
    )
  );

  return Object.fromEntries(results.map((r) => [r.dimension, r]));
}

// Usage
const scores = await evaluateAgentResponse({
  userInput: "Explain how transformers work",
  agentOutput: "Transformers use self-attention to process sequences in parallel...",
  referenceAnswer: "Transformers are neural network architectures using self-attention...",
});

for (const [dimension, judgment] of Object.entries(scores)) {
  console.log(\${dimension}: \${judgment.score}/5 — \${judgment.critique});
}`,
        }}
      />

      <h2>Calibrating Judge Reliability</h2>

      <PatternBlock
        name="Judge Calibration Against Human Labels"
        category="Evaluation Quality"
        whenToUse="Before relying on LLM-as-judge scores in production decisions, validate that the judge correlates with human evaluation on your specific domain and task type."
      >
        <p>
          Calibrate judge reliability by having humans score a sample of 100–200 examples, then
          measuring Pearson correlation and rank correlation (Spearman) between judge scores and
          human scores. A well-calibrated judge achieves r &gt; 0.7 with human raters. If
          correlation is low, refine the rubric with more concrete anchors, add few-shot examples,
          or switch to a more capable judge model.
        </p>
      </PatternBlock>

      <WarningBlock title="Position Bias and Self-Enhancement Bias">
        <p>
          LLM judges exhibit known biases: <strong>position bias</strong> (preferring the first
          option in A/B comparisons), <strong>verbosity bias</strong> (rating longer responses
          higher regardless of quality), and <strong>self-enhancement bias</strong> (a model
          rating its own outputs more favorably). Mitigate by: randomising response order in
          pairwise comparisons, explicitly instructing the judge to ignore length, and using a
          different model family as judge than the one being evaluated.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Use Chain-of-Thought in Your Judge Prompts">
        <p>
          Always require the judge to produce a written critique before or alongside the numeric
          score. This serves two purposes: (1) it improves score accuracy by forcing the judge to
          reason rather than pattern-match to a number; (2) the critique text is invaluable for
          diagnosing systematic failure patterns, debugging prompt changes, and communicating
          evaluation results to non-technical stakeholders.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Reference-Free vs. Reference-Based Judging">
        <p>
          Reference-based judging compares agent output to a gold-standard answer — useful when
          ground truth exists. Reference-free judging evaluates the response on its own merits
          against the rubric — necessary for open-ended tasks (creative writing, brainstorming,
          complex reasoning) where no single correct answer exists. Most production evaluation
          pipelines need both modes: reference-based for factual QA, reference-free for agentic
          reasoning tasks.
        </p>
      </NoteBlock>
    </article>
  )
}
