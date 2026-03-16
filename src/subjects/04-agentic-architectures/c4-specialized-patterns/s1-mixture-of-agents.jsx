import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function MixtureOfAgents() {
  return (
    <article className="prose-content">
      <h2>Mixture of Agents (MoA)</h2>

      <p>
        Mixture of Agents is an architecture that combines responses from multiple independent
        language model instances — potentially using different models, system prompts, or
        temperatures — into a single, higher-quality output. Inspired by ensemble methods
        in classical machine learning, MoA exploits the diversity of different agents' outputs
        to produce answers that are more accurate, comprehensive, and robust than any
        individual agent could produce alone. The core insight is that different agents make
        different errors, and combining their outputs reduces the impact of any single
        agent's mistakes.
      </p>

      <ConceptBlock term="Mixture of Agents (MoA)">
        Mixture of Agents is an architecture in which multiple independent agent instances
        each attempt the same task, and an aggregator model synthesizes their outputs into
        a final response. The constituent agents may differ in model, temperature, system
        prompt, or random seed. The aggregator is typically a capable model that reads all
        constituent responses and produces a synthesized answer, resolving contradictions,
        incorporating the best elements of each response, and filtering out errors.
      </ConceptBlock>

      <h2>Why MoA Works: Diversity and Error Cancellation</h2>

      <p>
        The theoretical foundation of ensemble methods is that diverse, independent estimators
        have uncorrelated errors. When errors are uncorrelated, averaging or selecting among
        estimates reduces error variance. For language models, this holds imperfectly but
        meaningfully: different models with different training data and architectures make
        different factual errors. Different system prompts elicit different reasoning paths.
        Different temperatures produce different selections at ambiguous points in generation.
        The errors of one agent are often not the errors of another.
      </p>

      <p>
        In practice, MoA with three agents typically outperforms any single constituent
        agent, and MoA with heterogeneous models (e.g., Claude + GPT-4 + Gemini) outperforms
        MoA with three instances of the same model. The benefit is largest for tasks with
        factual uncertainty, where individual agents may hallucinate different false facts
        that a synthesizer can recognize as inconsistent.
      </p>

      <h2>MoA Architecture Variants</h2>

      <h3>Parallel MoA (One Round)</h3>
      <p>
        All constituent agents run in parallel on the same task. Their outputs are collected
        and passed to an aggregator in a single round. This is the simplest and most common
        form of MoA. It is efficient (constituent agents run concurrently) and straightforward
        to implement. The latency is bounded by the slowest constituent agent plus the
        aggregator.
      </p>

      <h3>Layered MoA (Multiple Rounds)</h3>
      <p>
        In layered MoA, there are multiple rounds of generation and synthesis. Round 1 produces
        N responses. An intermediate aggregator synthesizes them into an improved set of
        proposals. Round 2 refines further. This iterative approach can improve quality for
        very complex tasks but multiplies cost and latency with each round.
      </p>

      <h3>Selective MoA</h3>
      <p>
        Instead of synthesizing all constituent responses, selective MoA selects the single
        best response based on quality criteria. An evaluator model scores each response and
        the highest-scoring response is returned. This is simpler than full synthesis and
        avoids the risk of the synthesizer introducing errors when combining responses.
      </p>

      <SDKExample
        title="Parallel Mixture of Agents with Synthesis"
        tabs={{
          python: `import asyncio
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Constituent agents: same task, different approaches
# ---------------------------------------------------------------------------

CONSTITUENT_CONFIGS = [
    {
        "id": "agent_a",
        "system": "You are a precise, analytical assistant. Be comprehensive and structured. Use bullet points and numbered lists.",
        "temperature": 0.2,  # Note: Anthropic API temperature parameter
    },
    {
        "id": "agent_b",
        "system": "You are a concise expert assistant. Focus on the most important points. Be direct and avoid padding.",
        "temperature": 0.7,
    },
    {
        "id": "agent_c",
        "system": "You are a thoughtful assistant who considers multiple perspectives. Highlight trade-offs and nuances.",
        "temperature": 0.5,
    },
]

SYNTHESIZER_SYSTEM = """You are a synthesis specialist. You will receive multiple responses
to the same question from different assistants. Your job is to:
1. Identify the best, most accurate elements of each response
2. Note where responses agree (this increases confidence in those points)
3. Resolve contradictions by identifying the most reliable claim
4. Produce a single comprehensive, accurate answer that is better than any individual response

Do not mention that you are synthesizing multiple responses. Just provide the best answer."""

async def run_constituent(config: dict, question: str) -> dict:
    """Run one constituent agent asynchronously."""
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: client.messages.create(
            model="claude-opus-4-6",
            max_tokens=512,
            system=config["system"],
            messages=[{"role": "user", "content": question}],
        )
    )
    text = next((b.text for b in response.content if hasattr(b, "text")), "")
    return {"id": config["id"], "response": text, "tokens": response.usage.input_tokens + response.usage.output_tokens}

async def mixture_of_agents(question: str) -> str:
    """Run MoA: parallel constituents followed by synthesis."""

    # Phase 1: Run all constituent agents in parallel (FORK)
    print(f"Running {len(CONSTITUENT_CONFIGS)} constituent agents in parallel...")
    constituent_results = await asyncio.gather(
        *[run_constituent(config, question) for config in CONSTITUENT_CONFIGS]
    )
    total_constituent_tokens = sum(r["tokens"] for r in constituent_results)
    print(f"Constituents complete: {total_constituent_tokens} total tokens")

    # Phase 2: Synthesize (JOIN + aggregate)
    synthesis_prompt = f"Question: {question}\\n\\n"
    for i, result in enumerate(constituent_results, 1):
        synthesis_prompt += f"Response {i}:\\n{result['response']}\\n\\n"
    synthesis_prompt += "Synthesize the best answer from the above responses:"

    synthesis_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=SYNTHESIZER_SYSTEM,
        messages=[{"role": "user", "content": synthesis_prompt}],
    )
    final = next((b.text for b in synthesis_response.content if hasattr(b, "text")), "")
    synthesis_tokens = synthesis_response.usage.input_tokens + synthesis_response.usage.output_tokens
    total_tokens = total_constituent_tokens + synthesis_tokens
    print(f"Synthesis complete: {synthesis_tokens} tokens (total: {total_tokens})")
    return final


async def main():
    question = "What are the most important considerations when choosing between SQL and NoSQL databases for a new application?"
    result = await mixture_of_agents(question)
    print("\\n=== SYNTHESIZED ANSWER ===")
    print(result)

asyncio.run(main())`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Constituent agent configurations
// ---------------------------------------------------------------------------

const CONSTITUENT_CONFIGS = [
  { id: "agent_a", system: "You are a precise, analytical assistant. Be comprehensive and structured." },
  { id: "agent_b", system: "You are a concise expert. Focus on the most important points. Be direct." },
  { id: "agent_c", system: "You are a thoughtful assistant who considers multiple perspectives and trade-offs." },
];

const SYNTHESIZER_SYSTEM = You are a synthesis specialist. You receive multiple responses to the same question.
Identify the best elements of each response, note agreements (which increase confidence),
resolve contradictions, and produce a single comprehensive answer better than any individual response.
Do not mention that you are synthesizing. Just provide the best answer.;

interface ConstituentResult {
  id: string;
  response: string;
  tokens: number;
}

async function runConstituent(config: { id: string; system: string }, question: string): Promise<ConstituentResult> {
  const response = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 512, system: config.system,
    messages: [{ role: "user", content: question }],
  });
  const text = response.content.find((b) => b.type === "text");
  return {
    id: config.id,
    response: text && "text" in text ? text.text : "",
    tokens: response.usage.input_tokens + response.usage.output_tokens,
  };
}

async function mixtureOfAgents(question: string): Promise<string> {
  // Phase 1: All constituents in parallel
  console.log(Running \${CONSTITUENT_CONFIGS.length} constituent agents in parallel...);
  const constituentResults = await Promise.all(
    CONSTITUENT_CONFIGS.map((config) => runConstituent(config, question))
  );
  const totalConstituentTokens = constituentResults.reduce((sum, r) => sum + r.tokens, 0);
  console.log(Constituents complete: \${totalConstituentTokens} total tokens);

  // Phase 2: Synthesize
  let synthesisPrompt = Question: \${question}\\n\\n;
  constituentResults.forEach((result, i) => {
    synthesisPrompt += Response \${i + 1}:\\n\${result.response}\\n\\n;
  });
  synthesisPrompt += "Synthesize the best answer from the above responses:";

  const synthResponse = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 1024, system: SYNTHESIZER_SYSTEM,
    messages: [{ role: "user", content: synthesisPrompt }],
  });
  const synthText = synthResponse.content.find((b) => b.type === "text");
  const final = synthText && "text" in synthText ? synthText.text : "";
  const synthTokens = synthResponse.usage.input_tokens + synthResponse.usage.output_tokens;
  console.log(Synthesis complete: \${synthTokens} tokens (total: \${totalConstituentTokens + synthTokens}));
  return final;
}

const question = "What are the most important considerations when choosing between SQL and NoSQL databases?";
mixtureOfAgents(question).then((result) => {
  console.log("\\n=== SYNTHESIZED ANSWER ===");
  console.log(result);
});`
        }}
      />

      <h2>Agent Voting for Classification Tasks</h2>

      <p>
        For classification, labeling, and routing tasks where the output is one of a
        finite set of choices, voting is often more appropriate than synthesis. Each
        constituent agent produces a label or category, and the label with the most votes
        is selected. Voting is simpler than synthesis, more interpretable, and avoids the
        synthesizer potentially introducing errors not present in any individual response.
      </p>

      <p>
        Weighted voting assigns different confidence weights to different agents. If agent A
        historically achieves 95% accuracy on this task type and agent B achieves 80%, agent
        A's vote should count more. Accumulate accuracy statistics per agent per task category
        and update weights dynamically.
      </p>

      <PatternBlock
        name="MoA for Quality-Critical Outputs"
        category="Ensemble Design"
        description="Apply Mixture of Agents to tasks where output quality matters more than cost — factual research, medical information, legal analysis, high-stakes code generation. The N-times cost of MoA is justified when a wrong answer has significant consequences and when individual model error rates are measurably high. For routine tasks with acceptable single-model accuracy, MoA is not cost-effective."
        when={[
          "High-stakes factual claims where individual models have non-trivial hallucination rates",
          "Tasks where different models have complementary strengths",
          "Classification tasks where majority voting meaningfully reduces error rate",
          "Cases where the cost of errors substantially exceeds the cost of MoA"
        ]}
        avoid={[
          "Routine tasks where a single well-prompted model achieves adequate accuracy",
          "Tasks requiring fast responses where MoA latency is unacceptable",
          "Tasks where all constituent agents have highly correlated errors (same training data, same architecture)"
        ]}
      />

      <BestPracticeBlock title="Measure actual error reduction before committing to MoA">
        MoA's benefit depends on constituent diversity and independence of errors. Before
        deploying MoA in production, measure the error rate of each constituent agent
        individually and compare it to the error rate of the synthesized output on a
        representative evaluation set. If MoA with 3 agents reduces errors by 30%, it
        may be worth the 3x cost increase. If it reduces errors by 5%, it probably is not.
      </BestPracticeBlock>

      <WarningBlock title="MoA multiplies cost and latency">
        N constituent agents plus a synthesizer makes MoA approximately (N+1) times as
        expensive per task as a single agent call. At scale, this is significant. Measure
        the baseline cost, set a concrete quality improvement threshold that justifies the
        cost, and revisit regularly as model capabilities improve — the baseline single-model
        quality often catches up to MoA over time as models are updated.
      </WarningBlock>

      <NoteBlock title="The synthesizer quality matters as much as constituent quality">
        A weak synthesizer that introduces errors or fails to identify the best elements
        of constituent responses can produce an output worse than the best individual
        constituent. Invest as much effort in the synthesizer's system prompt as in the
        constituents'. Test the synthesizer independently with known-good and known-bad
        constituent responses to ensure it correctly identifies and resolves quality
        differences.
      </NoteBlock>
    </article>
  )
}
