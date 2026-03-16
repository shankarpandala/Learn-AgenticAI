import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function DebateReflection() {
  return (
    <article className="prose-content">
      <h2>Agent Debate and Reflection Patterns</h2>

      <p>
        Agent debate and reflection patterns exploit a fundamental property of language models:
        they are better at critiquing existing claims than at generating perfect answers from
        scratch. By structuring reasoning as an adversarial or reflective process — agents
        challenging each other's claims, or agents reviewing and improving their own outputs —
        these patterns can produce significantly higher-quality results on tasks where the
        first attempt is often imperfect.
      </p>

      <h2>Multi-Agent Debate</h2>

      <ConceptBlock term="Multi-Agent Debate">
        Multi-agent debate involves two or more agents generating competing or complementary
        responses to a question, then each agent reading the other's response and attempting
        to refine or challenge it. Through multiple rounds of exchange, agents update their
        positions, challenge unsupported claims, and build on valid points. A judge agent
        (or the debate agents themselves) produces a final synthesized conclusion. Research
        has shown this process improves factual accuracy and reduces confident hallucination.
      </ConceptBlock>

      <h3>How Debate Improves Quality</h3>
      <p>
        When a debating agent reads its opponent's response, it is exposed to alternative
        framings and potentially correct information that it did not produce itself. If agent
        A makes a factual error, agent B may correctly identify and challenge it. Agent A,
        forced to defend or revise the claim, often recognizes the error when it is pointed
        out. This adversarial pressure reduces the confident assertion of incorrect information.
      </p>
      <p>
        Debate is particularly effective when debating agents are prompted to be skeptical
        of claims they cannot verify — rather than simply agreeing with a well-argued position.
        An agent that capitulates to confident but incorrect arguments undermines the debate's
        value.
      </p>

      <h2>Self-Reflection and Self-Critique</h2>

      <ConceptBlock term="Reflexion Pattern">
        Self-reflection involves an agent reviewing its own output, identifying weaknesses
        or errors, and revising accordingly. The agent that produced the output acts as its
        own critic. This is less powerful than external critique (because the agent is anchored
        to its own reasoning), but it is much cheaper and can catch obvious errors, improve
        structure, and fill in gaps the agent itself recognizes.
      </ConceptBlock>

      <p>
        Effective self-reflection requires separating the generation and critique steps.
        Simply asking a model to "review and improve" its output often produces superficial
        edits. A better approach asks the model to explicitly evaluate specific dimensions —
        "Is every factual claim accurate?", "Is there important information missing?" —
        before revising. The more specific the critique criteria, the more substantive the
        revisions.
      </p>

      <SDKExample
        title="Multi-Agent Debate: Two Agents Challenge Each Other"
        tabs={{
          python: `from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Debating agents: each is instructed to be rigorous and challenge errors
# ---------------------------------------------------------------------------

AGENT_A_SYSTEM = """You are a rigorous fact-checker participating in an intellectual debate.
When given a question or your opponent's argument:
1. Provide your best answer, clearly reasoning through the evidence
2. If responding to an opponent's argument, explicitly identify any claims you disagree with
   and explain why, with specific counter-evidence or reasoning
3. Be confident but accurate — do not assert claims you cannot support
4. Update your position when the opponent makes a valid point"""

AGENT_B_SYSTEM = """You are a skeptical critical thinker participating in an intellectual debate.
Your approach:
1. Challenge assumptions and ask for evidence behind claims
2. Identify logical gaps and alternative explanations
3. Acknowledge strong arguments but look for weaknesses
4. Build on valid points rather than disagreeing for the sake of it
5. Be rigorous: a good argument you had not considered should change your position"""

JUDGE_SYSTEM = """You are a neutral judge of a structured debate. Review the full exchange
between two agents and produce:
1. The consensus position where both agents agree
2. The remaining points of disagreement
3. A final synthesized answer that incorporates the best-supported claims from both agents
4. Your assessment of which agent's overall position is better supported

Be balanced and evidence-focused."""

def run_debate(question: str, rounds: int = 2) -> dict:
    """Run a multi-round structured debate between two agents."""
    debate_history = []
    agent_a_messages = [{"role": "user", "content": f"Question for debate: {question}\\n\\nProvide your initial answer."}]
    agent_b_messages = [{"role": "user", "content": f"Question for debate: {question}\\n\\nProvide your initial answer."}]

    # Round 0: Both agents give initial answers independently
    print("Round 0: Initial answers...")
    response_a = client.messages.create(
        model="claude-opus-4-6", max_tokens=512, system=AGENT_A_SYSTEM, messages=agent_a_messages
    )
    answer_a = next((b.text for b in response_a.content if hasattr(b, "text")), "")
    debate_history.append({"round": 0, "agent": "A", "content": answer_a})

    response_b = client.messages.create(
        model="claude-opus-4-6", max_tokens=512, system=AGENT_B_SYSTEM, messages=agent_b_messages
    )
    answer_b = next((b.text for b in response_b.content if hasattr(b, "text")), "")
    debate_history.append({"round": 0, "agent": "B", "content": answer_b})

    # Subsequent rounds: each agent responds to the other's most recent argument
    for round_num in range(1, rounds + 1):
        print(f"Round {round_num}: Rebuttals...")
        # Agent A responds to Agent B's last argument
        agent_a_messages.append({"role": "assistant", "content": debate_history[-2]["content"]})
        agent_a_messages.append({"role": "user", "content": f"Agent B argued: {debate_history[-1]['content']}\\n\\nProvide your rebuttal or revision."})

        response_a = client.messages.create(
            model="claude-opus-4-6", max_tokens=512, system=AGENT_A_SYSTEM, messages=agent_a_messages
        )
        new_answer_a = next((b.text for b in response_a.content if hasattr(b, "text")), "")
        debate_history.append({"round": round_num, "agent": "A", "content": new_answer_a})

        # Agent B responds to Agent A's rebuttal
        agent_b_messages.append({"role": "assistant", "content": debate_history[-3]["content"]})
        agent_b_messages.append({"role": "user", "content": f"Agent A argued: {new_answer_a}\\n\\nProvide your rebuttal or revision."})

        response_b = client.messages.create(
            model="claude-opus-4-6", max_tokens=512, system=AGENT_B_SYSTEM, messages=agent_b_messages
        )
        new_answer_b = next((b.text for b in response_b.content if hasattr(b, "text")), "")
        debate_history.append({"round": round_num, "agent": "B", "content": new_answer_b})

    # Judge synthesizes the full debate
    print("Judge synthesizing...")
    full_debate = f"Question: {question}\\n\\n"
    for entry in debate_history:
        full_debate += f"Round {entry['round']} - Agent {entry['agent']}:\\n{entry['content']}\\n\\n"

    judge_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=JUDGE_SYSTEM,
        messages=[{"role": "user", "content": full_debate}],
    )
    judgment = next((b.text for b in judge_response.content if hasattr(b, "text")), "")

    return {
        "question": question,
        "rounds": rounds,
        "debate_history": debate_history,
        "judgment": judgment,
    }


result = run_debate(
    "Is it better to use a monorepo or separate repositories for a microservices architecture?",
    rounds=2,
)
print("\\n=== JUDGE'S SYNTHESIS ===")
print(result["judgment"])`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const AGENT_A_SYSTEM = You are a rigorous fact-checker in an intellectual debate.
Provide your best answer, challenge opponent's unsupported claims with specific counter-evidence,
and update your position when the opponent makes a valid point.;

const AGENT_B_SYSTEM = You are a skeptical critical thinker in a debate.
Challenge assumptions, identify logical gaps, and build on valid points.
A strong argument you hadn't considered should change your position.;

const JUDGE_SYSTEM = You are a neutral debate judge. Review the full exchange and produce:
1. The consensus position
2. Remaining disagreements
3. A synthesized final answer incorporating the best-supported claims from both agents;

interface DebateEntry { round: number; agent: "A" | "B"; content: string; }

async function runDebate(question: string, rounds = 2): Promise<{ judgment: string; history: DebateEntry[] }> {
  const history: DebateEntry[] = [];
  const messagesA: Anthropic.MessageParam[] = [{ role: "user", content: Question: \${question}\\n\\nProvide your initial answer. }];
  const messagesB: Anthropic.MessageParam[] = [{ role: "user", content: Question: \${question}\\n\\nProvide your initial answer. }];

  // Round 0: independent initial answers
  console.log("Round 0: Initial answers...");
  const [resA0, resB0] = await Promise.all([
    client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, system: AGENT_A_SYSTEM, messages: messagesA }),
    client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, system: AGENT_B_SYSTEM, messages: messagesB }),
  ]);
  const getText = (r: Anthropic.Message) => { const t = r.content.find((b) => b.type === "text"); return t && "text" in t ? t.text : ""; };
  history.push({ round: 0, agent: "A", content: getText(resA0) });
  history.push({ round: 0, agent: "B", content: getText(resB0) });

  // Debate rounds
  for (let round = 1; round <= rounds; round++) {
    console.log(Round \${round}: Rebuttals...);
    const lastA = history.filter((h) => h.agent === "A").at(-1)!.content;
    const lastB = history.filter((h) => h.agent === "B").at(-1)!.content;

    messagesA.push({ role: "assistant", content: lastA });
    messagesA.push({ role: "user", content: Agent B argued: \${lastB}\\n\\nProvide your rebuttal or revision. });
    messagesB.push({ role: "assistant", content: lastB });
    messagesB.push({ role: "user", content: Agent A argued: \${lastA}\\n\\nProvide your rebuttal or revision. });

    const [rebA, rebB] = await Promise.all([
      client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, system: AGENT_A_SYSTEM, messages: messagesA }),
      client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, system: AGENT_B_SYSTEM, messages: messagesB }),
    ]);
    history.push({ round, agent: "A", content: getText(rebA) });
    history.push({ round, agent: "B", content: getText(rebB) });
  }

  // Judge
  console.log("Judge synthesizing...");
  let fullDebate = Question: \${question}\\n\\n;
  history.forEach((e) => { fullDebate += Round \${e.round} - Agent \${e.agent}:\\n\${e.content}\\n\\n; });
  const judgeRes = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 1024, system: JUDGE_SYSTEM,
    messages: [{ role: "user", content: fullDebate }],
  });
  return { judgment: getText(judgeRes), history };
}

runDebate("Is it better to use a monorepo or separate repositories for a microservices architecture?", 2)
  .then(({ judgment }) => {
    console.log("\\n=== JUDGE'S SYNTHESIS ===");
    console.log(judgment);
  });`
        }}
      />

      <h2>Self-Critique Loops</h2>

      <p>
        Self-critique loops implement reflection within a single agent: the agent generates
        a response, then switches roles to critique that response against specific criteria,
        then revises based on the critique. This is less powerful than multi-agent debate
        but significantly cheaper and still produces measurable quality improvements on
        structured tasks.
      </p>

      <p>
        The key to effective self-critique is specificity. A generic "review your answer for
        quality" produces weak improvements. Specific criteria — "Are all factual claims
        verifiable?", "Is the explanation accessible to a non-expert?", "Are there edge cases
        not addressed?" — produce targeted, actionable critiques that lead to substantive
        revisions.
      </p>

      <PatternBlock
        name="Debate for Controversial, Debate for Verification"
        category="Quality Patterns"
        description="Use multi-agent debate for questions with genuine uncertainty or legitimate competing perspectives — technology choices, strategic decisions, interpretive questions. Use self-reflection loops for tasks with clear quality criteria — writing, code review, factual summaries. Do not use debate for tasks that have a single correct answer that can be verified deterministically — a calculator is better than a debate for arithmetic."
        when={[
          "Decisions with legitimate trade-offs where multiple perspectives improve the outcome",
          "Factual questions where single-model hallucination is a documented problem",
          "Critical documents where catching errors before delivery justifies extra cost"
        ]}
        avoid={[
          "Tasks with clear correct answers that can be verified by tools",
          "Latency-sensitive applications where debate rounds add unacceptable delay",
          "Tasks where all constituent agents have the same training and make the same errors"
        ]}
      />

      <BestPracticeBlock title="Prompt agents to be skeptical, not agreeable">
        The most common failure mode of multi-agent debate is both agents converging to the
        same answer too quickly — often because one agent made a confident argument and the
        other simply agreed. Counter this by explicitly instructing debate agents to be
        skeptical of confident claims they cannot independently verify, and to prefer
        maintaining uncertainty over agreeing with an unverified assertion.
      </BestPracticeBlock>

      <WarningBlock title="Debate can amplify confident errors">
        If both agents share a misconception from their training data, debate will not surface
        it — both will confidently argue for the wrong answer. Debate reduces errors from
        random hallucination but cannot catch systematic errors shared across models trained
        on similar data. For high-stakes factual claims, supplement debate with tool-based
        fact verification against authoritative sources.
      </WarningBlock>

      <NoteBlock title="Two rounds of debate is usually sufficient">
        Empirically, most of the quality improvement from multi-agent debate occurs in the
        first rebuttal round. The second round provides incremental improvement; rounds beyond
        that typically produce diminishing returns and models may begin to simply agree or
        repeat themselves. Start with 2 rounds, measure quality improvement, and only extend
        to more rounds if the data supports it.
      </NoteBlock>
    </article>
  )
}
