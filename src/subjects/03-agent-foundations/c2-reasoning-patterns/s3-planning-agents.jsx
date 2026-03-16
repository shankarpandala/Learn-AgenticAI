import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import PatternBlock from '../../../components/content/PatternBlock.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx';

const planningPython = `from anthropic import Anthropic
import json

client = Anthropic()

# ── Phase 1: Planning ─────────────────────────────────────────────────────────

PLANNER_SYSTEM = """You are a planning agent. Given a high-level goal, produce a
structured execution plan as a JSON object with this schema:

{
  "goal": "restate the goal clearly",
  "steps": [
    {
      "id": "step_1",
      "description": "what to do",
      "tool": "tool name to use",
      "depends_on": []       // list of step IDs this step requires first
    }
  ],
  "success_criteria": "how we know the goal is achieved"
}

Think carefully about dependencies. Steps that can run in parallel should have
independent depends_on lists. Output ONLY valid JSON, no additional text."""

def create_plan(goal: str) -> dict:
    """Ask the planner to decompose the goal into an executable step list."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        system=PLANNER_SYSTEM,
        messages=[{"role": "user", "content": f"Goal: {goal}"}]
    )
    raw = response.content[0].text.strip()
    # Strip markdown fences if present
    if raw.startswith(""):
        raw = raw.split("\\n", 1)[1].rsplit("", 1)[0]
    return json.loads(raw)

# ── Phase 2: Execution ────────────────────────────────────────────────────────

EXECUTOR_SYSTEM = """You are an execution agent. You will be given:
- A specific step to execute
- Results from any prerequisite steps
- A set of tools

Execute the step using the appropriate tool and return a brief summary of
what you did and what you found."""

tools = [
    {
        "name": "web_search",
        "description": "Search the web for current information on a topic.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a named file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "filename": {"type": "string"},
                "content": {"type": "string"}
            },
            "required": ["filename", "content"]
        }
    },
    {
        "name": "summarize",
        "description": "Summarize a body of text into a concise paragraph.",
        "input_schema": {
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Text to summarize"}
            },
            "required": ["text"]
        }
    }
]

def execute_tool(name: str, inputs: dict) -> str:
    """Simulated tool implementations."""
    if name == "web_search":
        return f"[Simulated search results for: {inputs['query']}] Found 3 relevant articles."
    if name == "write_file":
        return f"Written {len(inputs['content'])} chars to {inputs['filename']}"
    if name == "summarize":
        return f"Summary: {inputs['text'][:80]}..."
    return "Unknown tool"

def execute_step(step: dict, prior_results: dict) -> str:
    """Run a single plan step using the executor agent."""
    context = f"Step to execute: {step['description']}\\n"
    if step["depends_on"]:
        context += "Results from prerequisite steps:\\n"
        for dep_id in step["depends_on"]:
            context += f"  {dep_id}: {prior_results.get(dep_id, 'not available')}\\n"

    messages = [{"role": "user", "content": context}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=EXECUTOR_SYSTEM,
            tools=tools,
            messages=messages
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Step complete."

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })
        if tool_results:
            messages.append({"role": "user", "content": tool_results})

# ── Plan-then-Act orchestrator ────────────────────────────────────────────────

def plan_then_act(goal: str) -> dict:
    """
    Two-phase planning agent:
      Phase 1 — Planner creates a structured step list
      Phase 2 — Executor runs each step in dependency order
    """
    print("=== PLANNING PHASE ===")
    plan = create_plan(goal)
    print(json.dumps(plan, indent=2))

    print("\\n=== EXECUTION PHASE ===")
    results = {}
    # Simple topological sort: process steps whose dependencies are all done
    completed = set()
    steps_left = {s["id"]: s for s in plan["steps"]}

    while steps_left:
        ready = [
            s for s in steps_left.values()
            if all(dep in completed for dep in s["depends_on"])
        ]
        if not ready:
            print("ERROR: Deadlock detected in plan dependencies")
            break

        for step in ready:
            print(f"\\nExecuting: {step['id']} — {step['description']}")
            results[step["id"]] = execute_step(step, results)
            print(f"Result: {results[step['id']]}")
            completed.add(step["id"])
            del steps_left[step["id"]]

    return {"plan": plan, "results": results}

# Run the planning agent
output = plan_then_act(
    "Research the current state of open-source LLM fine-tuning frameworks "
    "and write a brief comparison report."
)`;

const planningTypeScript = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface PlanStep {
  id: string;
  description: string;
  tool: string;
  depends_on: string[];
}

interface Plan {
  goal: string;
  steps: PlanStep[];
  success_criteria: string;
}

const PLANNER_SYSTEM = You are a planning agent. Given a high-level goal, produce a
structured execution plan as a JSON object with this schema:

{
  "goal": "restate the goal clearly",
  "steps": [
    {
      "id": "step_1",
      "description": "what to do",
      "tool": "tool name to use",
      "depends_on": []
    }
  ],
  "success_criteria": "how we know the goal is achieved"
}

Output ONLY valid JSON, no additional text.;

async function createPlan(goal: string): Promise<Plan> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: PLANNER_SYSTEM,
    messages: [{ role: "user", content: Goal: \${goal} }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  let raw = textBlock && "text" in textBlock ? textBlock.text.trim() : "{}";
  if (raw.startsWith("")) raw = raw.split("\\n").slice(1).join("\\n").replace(/$/, "");
  return JSON.parse(raw) as Plan;
}

const tools: Anthropic.Tool[] = [
  {
    name: "web_search",
    description: "Search the web for current information.",
    input_schema: {
      type: "object" as const,
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "write_file",
    description: "Write content to a named file.",
    input_schema: {
      type: "object" as const,
      properties: { filename: { type: "string" }, content: { type: "string" } },
      required: ["filename", "content"],
    },
  },
];

function executeTool(name: string, inputs: Record<string, string>): string {
  if (name === "web_search") return [Simulated results for: \${inputs.query}];
  if (name === "write_file") return Written to \${inputs.filename};
  return "Unknown tool";
}

async function executeStep(step: PlanStep, priorResults: Record<string, string>): Promise<string> {
  let context = Step: \${step.description}\\n;
  if (step.depends_on.length > 0) {
    context += "Prior results:\\n";
    for (const dep of step.depends_on) {
      context +=   \${dep}: \${priorResults[dep] ?? "unavailable"}\\n;
    }
  }

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: context }];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const tb = response.content.find((b) => b.type === "text");
      return tb && "text" in tb ? tb.text : "Done.";
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: executeTool(block.name, block.input as Record<string, string>),
        });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
  }
}

async function planThenAct(goal: string) {
  const plan = await createPlan(goal);
  console.log("Plan:", JSON.stringify(plan, null, 2));

  const results: Record<string, string> = {};
  const completed = new Set<string>();
  const stepsLeft = new Map(plan.steps.map((s) => [s.id, s]));

  while (stepsLeft.size > 0) {
    const ready = [...stepsLeft.values()].filter((s) =>
      s.depends_on.every((d) => completed.has(d))
    );
    if (ready.length === 0) { console.error("Deadlock!"); break; }

    for (const step of ready) {
      console.log(Executing \${step.id}: \${step.description});
      results[step.id] = await executeStep(step, results);
      completed.add(step.id);
      stepsLeft.delete(step.id);
    }
  }

  return { plan, results };
}

planThenAct(
  "Research open-source LLM fine-tuning frameworks and write a comparison report."
).then(console.log);`;

export default function PlanningAgents() {
  return (
    <article className="prose-content">
      <h2>Planning Agents</h2>

      <p>
        Reactive agents — those that decide their next action purely from their current observation
        — work well for tasks where each step naturally follows from the previous result. But for
        complex, multi-phase tasks where different sub-goals may be pursued in different orders
        or in parallel, a planning layer significantly improves efficiency and reliability. Planning
        agents separate the thinking about what to do from the doing of it, enabling structured
        task decomposition, explicit dependency management, and better error recovery.
      </p>

      <ConceptBlock
        term="Planning Agent"
        tag="Architecture Pattern"
      >
        A planning agent separates task execution into two phases: a planning phase in which the
        model produces a structured representation of the steps required to achieve a goal
        (including dependencies and expected tool usage), and an execution phase in which those
        steps are carried out in the correct order. This separation allows the agent to reason
        globally about the task before acting locally on individual steps.
      </ConceptBlock>

      <h2>Planning Approaches</h2>

      <h3>Task Decomposition</h3>
      <p>
        The most common planning approach: given a high-level goal, the planner recursively breaks
        it into smaller, more concrete sub-tasks until each sub-task maps to a single tool call
        or a small number of steps. The decomposition can be flat (a linear list of steps) or
        hierarchical (a tree where each node can itself be decomposed further). Flat decomposition
        is simpler to implement and debug; hierarchical decomposition handles more complex tasks
        where some steps are themselves multi-step processes.
      </p>

      <h3>Goal-Based Planning</h3>
      <p>
        Rather than specifying the steps, goal-based planning specifies the desired end state and
        lets the agent reason backward to determine what steps are needed. This approach is more
        flexible — the agent can find novel paths to the goal — but requires the model to have
        a strong world model and may produce unexpected paths on unusual goals. It works best
        for well-constrained domains where the model has good intuitions about what actions lead
        to what states.
      </p>

      <h3>Plan-then-Act</h3>
      <p>
        Plan-then-act is the most commonly implemented pattern in production agents. In a first
        LLM call the model produces a complete structured plan. In subsequent calls, a separate
        executor processes each step. Separating planner from executor allows you to validate
        the plan before executing it, inject human review at the planning stage, and use a
        lighter-weight model for execution steps once the plan is established.
      </p>

      <ArchitectureDiagram
        title="Plan-Then-Act Architecture"
        nodes={[
          { id: "user", label: "User Goal", type: "external", x: 50, y: 150 },
          { id: "planner", label: "Planner LLM", type: "llm", x: 250, y: 150 },
          { id: "plan", label: "Structured Plan", type: "store", x: 450, y: 150 },
          { id: "executor", label: "Executor Agent", type: "agent", x: 650, y: 100 },
          { id: "tools", label: "Tools", type: "tool", x: 850, y: 100 },
          { id: "results", label: "Step Results", type: "store", x: 650, y: 220 },
        ]}
        edges={[
          { from: "user", to: "planner", label: "goal" },
          { from: "planner", to: "plan", label: "produces" },
          { from: "plan", to: "executor", label: "steps" },
          { from: "executor", to: "tools", label: "invokes" },
          { from: "tools", to: "results", label: "returns" },
          { from: "results", to: "executor", label: "feeds next step" },
        ]}
      />

      <h2>Structured Plan Representation</h2>

      <p>
        The plan must be in a format that the execution layer can process programmatically.
        JSON is the standard choice. A minimal plan schema should include: a unique identifier
        and description for each step; the tool or agent responsible for executing the step;
        a list of step IDs that must complete before this step can begin (dependencies); and
        optionally expected outputs or success criteria. This structure supports both sequential
        and parallel execution strategies.
      </p>

      <PatternBlock
        name="Plan-then-Act"
        category="Planning"
        whenToUse="Tasks that require more than 5–6 steps, tasks where some steps can run in parallel, tasks where plan validation or human review is required before execution begins, and tasks where the execution model is different (smaller, cheaper) from the planning model."
      >
        Separate the planning LLM call from the execution loop. The planner produces a complete
        structured step list with dependency annotations. The executor processes steps in
        topological order, running independent steps in parallel. This yields faster execution,
        cleaner error handling, and the ability to review or modify the plan before any
        irreversible actions are taken.
      </PatternBlock>

      <h2>Handling Plan Failures</h2>

      <p>
        Plans are predictions about how the world will behave. Real execution frequently diverges
        from the plan. A step may fail because a required resource is unavailable, a tool returns
        an unexpected result, or a dependency step produced output that makes a subsequent step
        unnecessary or impossible. Robust planning agents handle failures in two ways.
      </p>

      <h3>Step-Level Recovery</h3>
      <p>
        When a step fails, the executor can attempt a retry, substitute an alternative tool, or
        mark the step as failed and continue with steps that do not depend on it. The executor
        should record the failure and its cause in the results so that downstream steps can
        adapt their behavior.
      </p>

      <h3>Plan Revision</h3>
      <p>
        For significant deviations, the executor can invoke the planner again with the current
        results and the failure information, producing a revised plan that adapts to the new
        situation. This re-planning adds latency and cost but is essential for tasks where
        the initial plan is truly invalidated by what was discovered during execution.
      </p>

      <NoteBlock
        type="note"
        title="Plans are hypotheses, not contracts"
      >
        Treat every generated plan as a hypothesis about how to achieve the goal given current
        information. Build your execution layer to handle partial plan completion gracefully.
        Log which steps succeeded and which failed, and surface this information to users rather
        than reporting a binary success/failure.
      </NoteBlock>

      <h2>Implementation: Plan-then-Act Agent</h2>

      <p>
        The example below implements a two-phase planning agent. The first phase uses a planner
        system prompt to generate a JSON step list with dependency annotations. The second phase
        uses a topological sort to execute steps in the correct order, passing prior results
        to each dependent step.
      </p>

      <SDKExample
        title="Plan-then-Act Agent with Dependency Tracking"
        tabs={{
          python: planningPython,
          typescript: planningTypeScript,
        }}
      />

      <BestPracticeBlock
        title="Validate plans before execution"
      >
        Before handing a generated plan to the executor, validate its structure: check that
        all dependency references point to real step IDs, verify that there are no circular
        dependencies, and confirm that the plan does not contain steps that call non-existent
        tools. These are mechanical checks that can catch LLM generation errors before they
        cause runtime failures in the middle of a task.
      </BestPracticeBlock>

      <h2>Planning with Multiple Agents</h2>

      <p>
        In more sophisticated architectures, the planner and executor are separate specialized
        agents rather than separate prompts to the same model. The planner agent is optimized
        for broad reasoning and structured output. Multiple executor agents may run in parallel,
        each handling a different class of tools or sub-domain. This separation of concerns
        is the foundation of the orchestrator-worker architecture covered in later sections.
      </p>

      <h3>When to Keep Planning Simple</h3>
      <p>
        Planning adds overhead: an additional LLM call before execution begins, JSON parsing,
        topological sort logic, and plan validation. For tasks with three or fewer steps where
        the sequence is mostly predictable, a reactive loop without explicit planning is simpler,
        faster, and nearly as reliable. Reserve explicit planning for tasks where the number
        of steps is uncertain, where parallelism offers meaningful speed gains, or where the
        ability to review the plan before execution is a product requirement.
      </p>
    </article>
  );
}
