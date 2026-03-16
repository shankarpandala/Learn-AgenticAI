import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function MultiAgentOverview() {
  return (
    <article className="prose-content">
      <h2>Multi-Agent Systems Overview</h2>

      <p>
        Multi-agent systems coordinate multiple LLM-based agents to accomplish tasks that
        are difficult or impossible for a single agent. The fundamental insight is that
        complex problems can often be decomposed into subtasks where different agents work
        on different pieces concurrently, check each other's work independently, or bring
        specialized capabilities to bear on specific parts of the problem. Multi-agent
        systems trade increased architectural complexity for increased capability, parallelism,
        and specialization.
      </p>

      <ConceptBlock term="Multi-Agent System">
        A multi-agent system is an architecture in which two or more LLM-based agents
        communicate, coordinate, and collaborate to accomplish a shared goal. Agents may
        operate in parallel or sequence, may have specialized roles or identical capabilities,
        and may coordinate through shared state, direct message passing, or an orchestrating
        controller. The key property distinguishing multi-agent from single-agent is that
        no single agent holds complete information about the task — it is distributed across
        the system.
      </ConceptBlock>

      <h2>Why Multiple Agents?</h2>

      <h3>Overcoming Context Window Limits</h3>
      <p>
        The most fundamental driver of multi-agent architectures is context. Even frontier
        models with 200K+ token context windows cannot hold arbitrarily large tasks. A
        codebase analysis task that requires reading 500 files, a research task that requires
        processing 1,000 papers, or a data processing pipeline that works on a dataset too
        large for context — these tasks require distributing work across multiple agents, each
        handling a portion of the data.
      </p>

      <h3>Parallel Execution</h3>
      <p>
        Independent subtasks that would execute serially in a single agent can execute in
        parallel across multiple agents. A research agent that needs to gather information
        from five different sources can complete five times faster if each agent handles
        one source simultaneously. For latency-sensitive workflows, this parallelism is
        often the primary motivation for multi-agent design.
      </p>

      <h3>Specialization</h3>
      <p>
        Different agents can be optimized for different subtasks: a retrieval agent tuned
        for search, a coding agent with a code-focused system prompt and code execution tools,
        a writing agent optimized for synthesis and style. Specialization allows each agent
        to perform its subtask more reliably than a generalist agent attempting all tasks
        within a single prompt. In systems with many distinct capability requirements,
        specialization provides cleaner interfaces and easier maintenance.
      </p>

      <h3>Independent Verification</h3>
      <p>
        Having one agent produce output and another independently verify it catches errors
        that would be invisible to self-review. Research has shown that LLMs are better
        at catching errors in other models' outputs than in their own — they are not anchored
        to the same reasoning path. Independent verification adds quality and safety at the
        cost of additional compute.
      </p>

      <h2>Coordination Challenges</h2>

      <h3>Communication Overhead</h3>
      <p>
        Every handoff between agents requires serializing the output of one agent into a
        form that the next agent can understand. Information is inevitably compressed or
        reformatted, and the receiving agent must correctly interpret the sender's output.
        This introduces error surface that does not exist in single-agent systems. Designing
        clear, well-structured inter-agent communication is one of the most important
        engineering problems in multi-agent system design.
      </p>

      <h3>State Consistency</h3>
      <p>
        When multiple agents operate on shared state — a shared document, a shared database,
        a shared plan — concurrent modifications can produce inconsistencies. Unlike traditional
        concurrent programming where locking and transactions provide consistency guarantees,
        LLM agents are not naturally transaction-aware. Building reliable shared state in
        multi-agent systems requires explicit consistency protocols.
      </p>

      <h3>Error Propagation</h3>
      <p>
        An error made by one agent can propagate and compound through subsequent agents.
        An orchestrator that misinterprets a subtask may give incorrect instructions to
        multiple workers. A worker agent that produces a subtly wrong result may corrupt
        the state that other agents depend on. Multi-agent systems require more robust error
        detection and recovery than single-agent systems because the blast radius of a
        single failure is larger.
      </p>

      <h3>Debugging Complexity</h3>
      <p>
        When a multi-agent system produces a wrong result, identifying the root cause
        requires examining the conversations of every agent that participated in the task.
        A bug in the system may manifest as a wrong final output with the root cause buried
        in an intermediate agent's conversation from 10 steps earlier. Good observability
        tooling — tracing every agent call in a unified view — is not optional in multi-agent
        production systems.
      </p>

      <SDKExample
        title="Simple Two-Agent System: Worker + Verifier"
        tabs={{
          python: `import json
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Worker agent: produces a draft answer
# ---------------------------------------------------------------------------

WORKER_SYSTEM = """You are a research analyst. Given a question, use your tools to
research the topic thoroughly and produce a detailed, factual answer.
Structure your answer clearly with key findings highlighted."""

WORKER_TOOLS = [
    {
        "name": "search",
        "description": "Search for information on a topic.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Search query"}},
            "required": ["query"]
        }
    }
]

def fake_search(query: str) -> str:
    return json.dumps({"results": [{"passage": f"Comprehensive information about: {query}. Key facts: [1] Important detail A. [2] Important detail B. [3] Important detail C.", "source": "knowledge_base"}]})

def run_worker(question: str) -> str:
    """Worker agent: research and draft an answer."""
    messages = [{"role": "user", "content": f"Research and answer this question: {question}"}]
    for _ in range(5):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=WORKER_SYSTEM,
            tools=WORKER_TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason == "end_turn":
            return next((b.text for b in response.content if hasattr(b, "text")), "")
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = fake_search(block.input["query"])
                tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})
        if tool_results:
            messages.append({"role": "user", "content": tool_results})
    return "Research incomplete."

# ---------------------------------------------------------------------------
# Verifier agent: critiques and improves the draft
# ---------------------------------------------------------------------------

VERIFIER_SYSTEM = """You are a critical fact-checker and editor. Given a question and a
draft answer, evaluate:
1. Factual accuracy — flag any claims that seem uncertain or incorrect
2. Completeness — identify important aspects of the question not addressed
3. Clarity — note any confusing or poorly structured sections

Return a JSON object with:
- "verdict": "pass" | "needs_revision"
- "issues": list of specific problems found (empty if verdict is "pass")
- "revised_answer": improved version if verdict is "needs_revision", null otherwise"""

def run_verifier(question: str, draft: str) -> dict:
    """Verifier agent: critique and optionally revise the draft."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        system=VERIFIER_SYSTEM,
        messages=[{
            "role": "user",
            "content": f"Question: {question}\\n\\nDraft answer:\\n{draft}\\n\\nEvaluate and return JSON."
        }],
    )
    text = next((b.text for b in response.content if hasattr(b, "text")), "{}")
    try:
        # Extract JSON from the response
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end]) if start >= 0 else {"verdict": "pass", "issues": []}
    except json.JSONDecodeError:
        return {"verdict": "pass", "issues": [], "note": "Could not parse verifier response"}

# ---------------------------------------------------------------------------
# Orchestrator: run worker then verifier
# ---------------------------------------------------------------------------

def run_two_agent_pipeline(question: str) -> str:
    """Orchestrate a worker-verifier pipeline."""
    print("Step 1: Worker agent researching...")
    draft = run_worker(question)
    print(f"Draft produced ({len(draft)} chars)")

    print("Step 2: Verifier agent reviewing...")
    verdict = run_verifier(question, draft)
    print(f"Verdict: {verdict.get('verdict')} | Issues: {len(verdict.get('issues', []))}")

    if verdict.get("verdict") == "needs_revision" and verdict.get("revised_answer"):
        print("Using revised answer from verifier.")
        return verdict["revised_answer"]
    return draft

result = run_two_agent_pipeline("What are the main differences between supervised and unsupervised learning?")
print("\\nFinal answer:")
print(result)`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Worker agent
// ---------------------------------------------------------------------------

const WORKER_SYSTEM = You are a research analyst. Research the given question thoroughly
and produce a detailed, factual answer with key findings highlighted.;

const workerTools: Anthropic.Tool[] = [{
  name: "search",
  description: "Search for information on a topic.",
  input_schema: { type: "object" as const, properties: { query: { type: "string", description: "Search query" } }, required: ["query"] },
}];

function fakeSearch(query: string): string {
  return JSON.stringify({ results: [{ passage: Information about: \${query}. Key facts: [1] Detail A. [2] Detail B., source: "kb" }] });
}

async function runWorker(question: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: Research and answer: \${question} }];
  for (let i = 0; i < 5; i++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6", max_tokens: 1024, system: WORKER_SYSTEM, tools: workerTools, messages,
    });
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason === "end_turn") {
      const text = response.content.find((b) => b.type === "text");
      return text && "text" in text ? text.text : "";
    }
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inp = block.input as { query: string };
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: fakeSearch(inp.query) });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
  }
  return "Research incomplete.";
}

// ---------------------------------------------------------------------------
// Verifier agent
// ---------------------------------------------------------------------------

const VERIFIER_SYSTEM = You are a critical fact-checker. Given a question and draft answer, return JSON:
{"verdict":"pass"|"needs_revision","issues":["..."],"revised_answer":"..." or null};

async function runVerifier(question: string, draft: string): Promise<{ verdict: string; issues: string[]; revised_answer?: string }> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: VERIFIER_SYSTEM,
    messages: [{ role: "user", content: Question: \${question}\\n\\nDraft:\\n\${draft}\\n\\nReturn JSON. }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  const text = textBlock && "text" in textBlock ? textBlock.text : "{}";
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    return JSON.parse(text.slice(start, end));
  } catch { return { verdict: "pass", issues: [] }; }
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

async function runTwoAgentPipeline(question: string): Promise<string> {
  console.log("Step 1: Worker agent researching...");
  const draft = await runWorker(question);
  console.log(Draft produced (\${draft.length} chars));

  console.log("Step 2: Verifier agent reviewing...");
  const verdict = await runVerifier(question, draft);
  console.log(Verdict: \${verdict.verdict} | Issues: \${verdict.issues.length});

  return verdict.verdict === "needs_revision" && verdict.revised_answer ? verdict.revised_answer : draft;
}

runTwoAgentPipeline("What are the main differences between supervised and unsupervised learning?")
  .then((result) => { console.log("\\nFinal answer:\\n" + result); });`
        }}
      />

      <h2>Communication Topologies</h2>

      <p>
        Multi-agent systems can be organized with different communication structures:
      </p>

      <ul>
        <li><strong>Hub-and-spoke (orchestrator-worker):</strong> A central orchestrator communicates with worker agents. Workers do not communicate with each other. Simple, debuggable, but the orchestrator becomes a bottleneck.</li>
        <li><strong>Pipeline:</strong> Agents are arranged in a sequence where each agent's output becomes the next agent's input. Natural for data transformation tasks. Failures propagate downstream.</li>
        <li><strong>Peer-to-peer:</strong> Agents can communicate with any other agent. Most flexible, most complex. Requires careful design to avoid cycles and deadlocks.</li>
        <li><strong>Blackboard:</strong> Agents share a common knowledge store (the "blackboard") that they read from and write to. Coordination happens through shared state rather than direct messaging.</li>
      </ul>

      <PatternBlock
        name="Start with Hub-and-Spoke"
        category="Multi-Agent Architecture"
        description="When building your first multi-agent system, start with a hub-and-spoke topology. A single orchestrator coordinates a set of worker agents with no direct worker-to-worker communication. This topology is the simplest to implement, debug, and reason about. Only introduce more complex topologies when the hub-and-spoke design demonstrably cannot meet your requirements."
        when={[
          "Building the first iteration of any multi-agent system",
          "Tasks that naturally decompose into independent parallel workstreams",
          "Systems where clear accountability for failures is required"
        ]}
        avoid={[
          "Peer-to-peer communication unless you have explicit requirements that need it",
          "Agent-to-agent communication that bypasses logging and observability",
          "Communication protocols that lose information from one agent to the next"
        ]}
      />

      <BestPracticeBlock title="Design for observability from the start">
        Multi-agent systems are significantly harder to debug than single-agent systems.
        Before writing agent logic, implement tracing that records every agent invocation,
        every message exchanged, and every tool call across all agents, with a unified trace
        ID that links all activity for a single user task. This tracing infrastructure pays
        dividends immediately when the first production failure occurs.
      </BestPracticeBlock>

      <WarningBlock title="Complexity compounds with agent count">
        Adding a third agent to a two-agent system does not add 50% more complexity —
        it multiplies it. The number of possible interaction patterns grows combinatorially.
        Keep your agent count as low as possible. Three well-designed agents are almost
        always preferable to seven narrowly specialized ones.
      </WarningBlock>

      <NoteBlock title="Multi-agent systems are not inherently more reliable">
        A common misconception is that having multiple agents produces more reliable results
        because errors are caught by other agents. In practice, multi-agent systems often have
        higher failure rates than equivalent single-agent systems, because coordination failures
        are added on top of individual agent failures. Multi-agent reliability requires
        deliberate design, not just adding agents.
      </NoteBlock>
    </article>
  )
}
