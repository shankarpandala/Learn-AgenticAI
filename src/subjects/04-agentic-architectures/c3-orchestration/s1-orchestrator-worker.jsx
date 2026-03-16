import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function OrchestratorWorker() {
  return (
    <article className="prose-content">
      <h2>The Orchestrator-Worker Pattern</h2>

      <p>
        The orchestrator-worker pattern is the most widely used multi-agent architecture in
        production systems. A central orchestrator agent decomposes a high-level task into
        subtasks, delegates each subtask to a specialized worker agent, collects the results,
        and synthesizes them into a final answer. The orchestrator does not execute tasks
        directly — it reasons about task decomposition, delegation, and synthesis. Workers
        do not make high-level decisions — they receive clear, well-scoped instructions
        and execute them.
      </p>

      <ConceptBlock term="Orchestrator-Worker Pattern">
        In the orchestrator-worker pattern, an orchestrator agent receives a user task,
        breaks it into subtasks with clear specifications, dispatches each subtask to
        an appropriate worker agent, monitors completion, handles failures, and aggregates
        worker results into a final deliverable. Workers are typically specialized agents
        with specific tools and system prompts optimized for their task type. The orchestrator
        holds the complete task context; workers receive only the context needed for their
        specific subtask.
      </ConceptBlock>

      <h2>Orchestrator Responsibilities</h2>

      <h3>Task Decomposition</h3>
      <p>
        The orchestrator must analyze the user's goal and determine: what subtasks are required,
        what dependencies exist between them, which workers should handle each subtask, and
        what information each worker needs. Good decomposition produces subtasks that are
        independently executable, clearly scoped, and together sufficient to accomplish the
        goal. Poor decomposition produces subtasks that overlap, have unclear boundaries,
        or require workers to make decisions above their capability.
      </p>

      <h3>Context Scoping</h3>
      <p>
        The orchestrator holds the full task context but should not pass all of it to every
        worker. Each worker receives only the context required for its specific subtask.
        This keeps worker context windows focused, prevents workers from making decisions
        outside their scope, and reduces token costs. The orchestrator is the only agent
        that holds the complete picture.
      </p>

      <h3>Result Aggregation</h3>
      <p>
        Once workers have completed their subtasks, the orchestrator must combine their
        results into a coherent final output. This may be as simple as concatenating
        summaries or as complex as identifying and resolving contradictions between worker
        outputs, deciding which worker's answer to use when they disagree, or synthesizing
        complementary results into a unified analysis.
      </p>

      <h3>Error Handling and Retry</h3>
      <p>
        When a worker fails, the orchestrator decides how to respond: retry with the same
        worker, reassign to a different worker, proceed with partial results, or abort the
        task. These decisions require judgment about the importance of the failed subtask
        and the availability of alternatives. The orchestrator should have explicit policies
        for common failure modes rather than requiring the LLM to make these decisions
        ad-hoc.
      </p>

      <SDKExample
        title="Orchestrator-Worker with Specialized Workers and Result Aggregation"
        tabs={{
          python: `import asyncio
import json
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Specialized worker agents
# ---------------------------------------------------------------------------

RESEARCH_WORKER_SYSTEM = """You are a research specialist. Your only job is to gather
factual information on the topic you are given. Be thorough, accurate, and cite key facts.
Return structured JSON: {"findings": ["fact1", "fact2"], "sources_consulted": ["source1"]}"""

ANALYSIS_WORKER_SYSTEM = """You are an analytical specialist. Your job is to analyze
information and identify patterns, implications, and trade-offs.
Return structured JSON: {"key_insights": ["insight1"], "risks": ["risk1"], "opportunities": ["opp1"]}"""

WRITING_WORKER_SYSTEM = """You are a writing specialist. Your job is to take structured
findings and analysis and produce clear, professional written content.
Return the written content as plain text — no JSON wrapper."""

async def run_worker(system_prompt: str, task_prompt: str) -> str:
    """Run a single specialized worker agent asynchronously."""
    response = await asyncio.get_event_loop().run_in_executor(
        None,
        lambda: client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": task_prompt}],
        )
    )
    return next((b.text for b in response.content if hasattr(b, "text")), "")

# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

ORCHESTRATOR_SYSTEM = """You are a task orchestrator. Given a user request, you coordinate
specialized workers to complete it. You decompose tasks, delegate to workers, and synthesize results.
You think strategically about what information is needed and how to best present the final answer."""

async def orchestrate(user_request: str) -> str:
    """Orchestrate multiple specialized workers to complete a research and writing task."""

    # Phase 1: Let the orchestrator plan the approach
    orchestrator_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system=ORCHESTRATOR_SYSTEM,
        messages=[{
            "role": "user",
            "content": f"""Plan how to address this request using your three workers:
- Research Worker: gathers facts and information
- Analysis Worker: identifies patterns, insights, risks
- Writing Worker: produces the final deliverable

Request: {user_request}

Respond with JSON: {{"research_task": "what to research", "analysis_task": "what to analyze", "topic": "main topic"}}"""
        }],
    )
    plan_text = next((b.text for b in orchestrator_response.content if hasattr(b, "text")), "{}")
    try:
        start = plan_text.find("{")
        end = plan_text.rfind("}") + 1
        plan = json.loads(plan_text[start:end])
    except Exception:
        plan = {"research_task": user_request, "analysis_task": user_request, "topic": user_request}

    print(f"Orchestrator plan: researching '{plan.get('research_task', '')[:50]}...'")

    # Phase 2: Run research and analysis workers in parallel (fan-out)
    research_task_prompt = f"Research task: {plan.get('research_task', user_request)}"
    analysis_task_prompt = f"Analysis task: {plan.get('analysis_task', user_request)}"

    research_result, analysis_result = await asyncio.gather(
        run_worker(RESEARCH_WORKER_SYSTEM, research_task_prompt),
        run_worker(ANALYSIS_WORKER_SYSTEM, analysis_task_prompt),
    )
    print(f"Workers complete: {len(research_result)} chars research, {len(analysis_result)} chars analysis")

    # Phase 3: Writing worker synthesizes into final output (fan-in)
    writing_prompt = f"""Original request: {user_request}

Research findings:
{research_result}

Analysis:
{analysis_result}

Write a comprehensive, well-structured response that directly addresses the original request.
Incorporate key facts from the research and insights from the analysis."""

    final_output = await run_worker(WRITING_WORKER_SYSTEM, writing_prompt)
    print(f"Writing worker complete: {len(final_output)} chars")

    return final_output


async def main():
    result = await orchestrate(
        "Provide a strategic overview of transformer neural network architecture: "
        "how it works, why it became dominant, and what its limitations are."
    )
    print("\\n=== FINAL OUTPUT ===")
    print(result)

asyncio.run(main())`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Specialized worker system prompts
// ---------------------------------------------------------------------------

const RESEARCH_SYSTEM = You are a research specialist. Gather factual information on your topic.
Return JSON: {"findings":["fact1","fact2"],"sources_consulted":["source1"]};

const ANALYSIS_SYSTEM = You are an analytical specialist. Analyze information for patterns and implications.
Return JSON: {"key_insights":["insight1"],"risks":["risk1"],"opportunities":["opp1"]};

const WRITING_SYSTEM = You are a writing specialist. Take structured findings and produce clear professional content.
Return plain text — no JSON wrapper.;

async function runWorker(system: string, taskPrompt: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 1024, system,
    messages: [{ role: "user", content: taskPrompt }],
  });
  const text = response.content.find((b) => b.type === "text");
  return text && "text" in text ? text.text : "";
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

const ORCHESTRATOR_SYSTEM = You are a task orchestrator. Decompose user requests into subtasks
for specialized workers, then synthesize their results.;

async function orchestrate(userRequest: string): Promise<string> {
  // Phase 1: Planning
  const planResponse = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 512, system: ORCHESTRATOR_SYSTEM,
    messages: [{
      role: "user",
      content: Plan how to handle this with Research, Analysis, and Writing workers.
Request: \${userRequest}
Return JSON: {"research_task":"...","analysis_task":"...","topic":"..."},
    }],
  });
  const planText = planResponse.content.find((b) => b.type === "text");
  const rawPlan = planText && "text" in planText ? planText.text : "{}";
  let plan: { research_task?: string; analysis_task?: string } = {};
  try {
    const start = rawPlan.indexOf("{");
    const end = rawPlan.lastIndexOf("}") + 1;
    plan = JSON.parse(rawPlan.slice(start, end));
  } catch { /* use empty plan */ }

  console.log(Orchestrator plan: researching '\${(plan.research_task ?? "").slice(0, 50)}...');

  // Phase 2: Parallel worker execution (fan-out)
  const [researchResult, analysisResult] = await Promise.all([
    runWorker(RESEARCH_SYSTEM, Research task: \${plan.research_task ?? userRequest}),
    runWorker(ANALYSIS_SYSTEM, Analysis task: \${plan.analysis_task ?? userRequest}),
  ]);
  console.log(Workers complete: \${researchResult.length} chars research, \${analysisResult.length} chars analysis);

  // Phase 3: Synthesis (fan-in)
  const writingPrompt = Original request: \${userRequest}

Research findings:
\${researchResult}

Analysis:
\${analysisResult}

Write a comprehensive response directly addressing the original request.;

  const finalOutput = await runWorker(WRITING_SYSTEM, writingPrompt);
  console.log(Writing worker complete: \${finalOutput.length} chars);
  return finalOutput;
}

orchestrate(
  "Provide a strategic overview of transformer neural network architecture: " +
  "how it works, why it became dominant, and what its limitations are."
).then((result) => {
  console.log("\\n=== FINAL OUTPUT ===");
  console.log(result);
});`
        }}
      />

      <h2>Worker Design Principles</h2>

      <h3>Single Responsibility</h3>
      <p>
        Each worker agent should have one clearly defined responsibility: research, analysis,
        code generation, quality review, or writing. Mixing responsibilities in a single worker
        makes it harder to optimize the worker's system prompt, harder to replace or upgrade
        individual workers, and harder to diagnose which worker caused a failure.
      </p>

      <h3>Structured Output</h3>
      <p>
        Workers should return structured output — JSON with defined fields — rather than
        free-form prose, wherever possible. The orchestrator needs to parse and act on worker
        outputs programmatically. Structured outputs make this reliable. The final synthesis
        step that produces human-readable output can be a dedicated writing worker that
        accepts structured inputs and produces prose.
      </p>

      <h3>Self-Contained Tasks</h3>
      <p>
        Each worker task should be self-contained: the worker should be able to complete
        its subtask with only the context it receives, without needing to ask the orchestrator
        for clarification or additional information. If a worker frequently needs follow-up
        information from the orchestrator, the task decomposition or context scoping needs
        improvement.
      </p>

      <PatternBlock
        name="Thin Orchestrator, Thick Workers"
        category="Orchestration Design"
        description="Put as little intelligence as possible in the orchestrator. The orchestrator should handle task decomposition and routing, but the actual work happens in workers. An orchestrator that tries to do too much reasoning itself becomes a bottleneck and a single point of complexity. Workers that are richly specialized perform better because they can be optimized independently."
        when={[
          "Building a new orchestrator-worker system from scratch",
          "Refactoring an orchestrator that has accumulated too many responsibilities",
          "Designing systems that need to scale by adding more specialized workers"
        ]}
        avoid={[
          "Orchestrators that do substantive reasoning about domain content",
          "Workers that make meta-level decisions about task routing",
          "Orchestrators with domain-specific knowledge that belongs in worker prompts"
        ]}
      />

      <BestPracticeBlock title="Test workers in isolation before integrating">
        Each worker agent should be tested independently with representative inputs before
        being integrated into the orchestration system. Unit testing workers in isolation
        allows you to measure their accuracy, identify failure modes, and tune their prompts
        without the complexity of the full multi-agent system. Integration bugs and worker
        bugs are much easier to diagnose separately.
      </BestPracticeBlock>

      <WarningBlock title="Long orchestrator context windows increase cost and error rate">
        As the orchestrator's task progresses, its context accumulates worker results,
        intermediate decisions, and error states. Long orchestrator contexts are expensive
        and increase the chance of the orchestrator losing track of earlier decisions.
        Summarize completed subtask results before appending them to the orchestrator's
        history to keep context manageable.
      </WarningBlock>

      <NoteBlock title="The orchestrator does not need to be the most capable model">
        It is tempting to use the most capable model for the orchestrator. But if the task
        decomposition is well-defined, a smaller, faster model may orchestrate just as well
        at lower cost. The orchestrator's job is routing and synthesis, not deep domain
        reasoning. Reserve the most capable models for workers that perform the hardest
        subtasks.
      </NoteBlock>
    </article>
  )
}
