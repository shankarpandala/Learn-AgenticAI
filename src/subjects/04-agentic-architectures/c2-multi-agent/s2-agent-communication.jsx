import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function AgentCommunication() {
  return (
    <article className="prose-content">
      <h2>Inter-Agent Communication Patterns</h2>

      <p>
        In a multi-agent system, how agents communicate with each other is as important as
        what each individual agent does. Poor communication design — messages that lose critical
        context, protocols that are ambiguous, handoffs that drop state — will cause failures
        regardless of how capable the individual agents are. This section covers the core
        communication patterns, their trade-offs, and the implementation details that determine
        whether a multi-agent system works reliably in production.
      </p>

      <ConceptBlock term="Agent Communication Protocol">
        An agent communication protocol defines how one agent sends information to another:
        the message format, the delivery mechanism, the expected response structure, and the
        error handling behavior. A well-designed protocol minimizes information loss at
        boundaries, is unambiguous about what the receiving agent should do, and includes
        enough context for the receiver to act without needing to ask follow-up questions.
      </ConceptBlock>

      <h2>Message Passing</h2>

      <p>
        Message passing is the most common inter-agent communication pattern: one agent
        produces a message, it is delivered to another agent's input, and that agent processes
        it and may produce its own output message. The key design decisions are message format
        and what context to include.
      </p>

      <h3>Structured vs. Free-Text Messages</h3>
      <p>
        Free-text messages between agents are natural — one agent just writes a summary and
        passes it to the next. But free-text messages are ambiguous. A recipient agent must
        parse the text to understand what it is being asked to do, and parsing errors compound.
        Structured messages with explicit fields for task description, context, constraints,
        and expected output format reduce ambiguity significantly and make inter-agent
        communication more reliable.
      </p>

      <SDKExample
        title="Structured Inter-Agent Message Passing"
        tabs={{
          python: `import json
from dataclasses import dataclass, field
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Structured message types
# ---------------------------------------------------------------------------

@dataclass
class TaskMessage:
    """A structured message from an orchestrator to a worker agent."""
    task_id: str
    task_type: str          # e.g., "research", "summarize", "code_review"
    instruction: str        # What the agent should do
    context: dict           # Background information the agent needs
    constraints: list[str]  # Rules the agent must follow
    output_format: str      # Describes what the response should look like

    def to_prompt(self) -> str:
        """Convert to a structured prompt for the worker agent."""
        parts = [
            f"TASK ID: {self.task_id}",
            f"TASK TYPE: {self.task_type}",
            f"INSTRUCTION: {self.instruction}",
        ]
        if self.context:
            parts.append(f"CONTEXT: {json.dumps(self.context, indent=2)}")
        if self.constraints:
            parts.append("CONSTRAINTS:")
            for c in self.constraints:
                parts.append(f"  - {c}")
        parts.append(f"OUTPUT FORMAT: {self.output_format}")
        return "\\n".join(parts)

@dataclass
class ResultMessage:
    """A structured result from a worker agent back to the orchestrator."""
    task_id: str
    status: str             # "success" | "partial" | "failed"
    output: str             # The agent's result
    confidence: str         # "high" | "medium" | "low"
    caveats: list[str]      # Important limitations or uncertainties
    next_steps: list[str]   # What the orchestrator should do next

# ---------------------------------------------------------------------------
# Worker agent
# ---------------------------------------------------------------------------

WORKER_SYSTEM = """You are a specialist worker agent. You receive structured task messages
and return structured result messages. Always respond with a JSON object matching the
ResultMessage format:
{
  "task_id": "<same as input>",
  "status": "success" | "partial" | "failed",
  "output": "<your result>",
  "confidence": "high" | "medium" | "low",
  "caveats": ["<caveat1>", "<caveat2>"],
  "next_steps": ["<suggestion1>", "<suggestion2>"]
}"""

def run_worker_agent(task: TaskMessage) -> ResultMessage:
    """Run a worker agent with a structured task message."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=WORKER_SYSTEM,
        messages=[{"role": "user", "content": task.to_prompt()}],
    )
    text = next((b.text for b in response.content if hasattr(b, "text")), "{}")
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        data = json.loads(text[start:end])
        return ResultMessage(
            task_id=data.get("task_id", task.task_id),
            status=data.get("status", "failed"),
            output=data.get("output", ""),
            confidence=data.get("confidence", "low"),
            caveats=data.get("caveats", []),
            next_steps=data.get("next_steps", []),
        )
    except Exception as e:
        return ResultMessage(
            task_id=task.task_id,
            status="failed",
            output=text,
            confidence="low",
            caveats=[f"Failed to parse structured response: {e}"],
            next_steps=["Retry with clearer output format instruction"],
        )

# ---------------------------------------------------------------------------
# Orchestrator: distributes tasks and collects results
# ---------------------------------------------------------------------------

def orchestrate(user_request: str) -> str:
    """Break a request into structured tasks, distribute to workers, aggregate results."""
    # Task 1: Research background
    research_task = TaskMessage(
        task_id="task_001",
        task_type="research",
        instruction="Research the key facts and concepts relevant to answering the user's question.",
        context={"user_question": user_request},
        constraints=["Focus on factual accuracy", "Cite confidence levels for key claims"],
        output_format="A structured summary of findings with confidence levels for each claim.",
    )

    # Task 2: Draft answer (will receive research output as context)
    print("Running research worker...")
    research_result = run_worker_agent(research_task)
    print(f"Research: status={research_result.status}, confidence={research_result.confidence}")

    synthesis_task = TaskMessage(
        task_id="task_002",
        task_type="synthesize",
        instruction="Using the research findings, compose a clear, direct answer to the user's question.",
        context={
            "user_question": user_request,
            "research_findings": research_result.output,
            "research_caveats": research_result.caveats,
        },
        constraints=[
            "Address the user's question directly",
            "Acknowledge uncertainty where the research confidence is low",
            "Keep the answer concise and readable",
        ],
        output_format="A 2-4 paragraph direct answer to the user's question.",
    )

    print("Running synthesis worker...")
    synthesis_result = run_worker_agent(synthesis_task)
    print(f"Synthesis: status={synthesis_result.status}, confidence={synthesis_result.confidence}")

    if synthesis_result.status == "failed":
        return f"Unable to complete task: {synthesis_result.caveats}"
    return synthesis_result.output

answer = orchestrate("What are the practical trade-offs between SQL and NoSQL databases?")
print("\\nFinal answer:")
print(answer)`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

interface TaskMessage {
  taskId: string;
  taskType: string;
  instruction: string;
  context: Record<string, unknown>;
  constraints: string[];
  outputFormat: string;
}

interface ResultMessage {
  taskId: string;
  status: "success" | "partial" | "failed";
  output: string;
  confidence: "high" | "medium" | "low";
  caveats: string[];
  nextSteps: string[];
}

function taskToPrompt(task: TaskMessage): string {
  const parts = [
    TASK ID: \${task.taskId},
    TASK TYPE: \${task.taskType},
    INSTRUCTION: \${task.instruction},
    CONTEXT: \${JSON.stringify(task.context, null, 2)},
  ];
  if (task.constraints.length > 0) {
    parts.push("CONSTRAINTS:", ...task.constraints.map((c) =>   - \${c}));
  }
  parts.push(OUTPUT FORMAT: \${task.outputFormat});
  return parts.join("\\n");
}

// ---------------------------------------------------------------------------
// Worker agent
// ---------------------------------------------------------------------------

const WORKER_SYSTEM = You are a specialist worker agent. Return a JSON ResultMessage:
{"task_id":"...","status":"success"|"partial"|"failed","output":"...","confidence":"high"|"medium"|"low","caveats":[],"next_steps":[]};

async function runWorkerAgent(task: TaskMessage): Promise<ResultMessage> {
  const response = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 1024, system: WORKER_SYSTEM,
    messages: [{ role: "user", content: taskToPrompt(task) }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  const text = textBlock && "text" in textBlock ? textBlock.text : "{}";
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    const data = JSON.parse(text.slice(start, end));
    return {
      taskId: data.task_id ?? task.taskId,
      status: data.status ?? "failed",
      output: data.output ?? "",
      confidence: data.confidence ?? "low",
      caveats: data.caveats ?? [],
      nextSteps: data.next_steps ?? [],
    };
  } catch (e) {
    return { taskId: task.taskId, status: "failed", output: text, confidence: "low", caveats: [String(e)], nextSteps: [] };
  }
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

async function orchestrate(userRequest: string): Promise<string> {
  const researchTask: TaskMessage = {
    taskId: "task_001", taskType: "research",
    instruction: "Research key facts relevant to answering the user's question.",
    context: { user_question: userRequest },
    constraints: ["Focus on factual accuracy", "Note confidence levels"],
    outputFormat: "Structured summary with confidence levels.",
  };

  console.log("Running research worker...");
  const researchResult = await runWorkerAgent(researchTask);
  console.log(Research: status=\${researchResult.status}, confidence=\${researchResult.confidence});

  const synthesisTask: TaskMessage = {
    taskId: "task_002", taskType: "synthesize",
    instruction: "Using the research findings, compose a clear answer to the user's question.",
    context: { user_question: userRequest, research_findings: researchResult.output, caveats: researchResult.caveats },
    constraints: ["Address the question directly", "Acknowledge uncertainty", "Be concise"],
    outputFormat: "A 2-4 paragraph direct answer.",
  };

  console.log("Running synthesis worker...");
  const synthesisResult = await runWorkerAgent(synthesisTask);
  console.log(Synthesis: status=\${synthesisResult.status}, confidence=\${synthesisResult.confidence});

  return synthesisResult.status === "failed" ? Task failed: \${synthesisResult.caveats.join(", ")} : synthesisResult.output;
}

orchestrate("What are the practical trade-offs between SQL and NoSQL databases?")
  .then((answer) => { console.log("\\nFinal answer:\\n" + answer); });`
        }}
      />

      <h2>Shared State Communication</h2>

      <p>
        Instead of passing messages between agents, shared state architectures give all agents
        access to a common data store — a document, a database record, a key-value store — that
        they read from and write to. Agents communicate implicitly by modifying shared state
        that other agents observe. This pattern works well for collaborative document editing,
        planning and re-planning scenarios, and any task where the "current state" is more
        important than the sequence of messages that produced it.
      </p>

      <p>
        The main challenge with shared state is consistency: if two agents write to the same
        location simultaneously, one may overwrite the other's work. Solutions include
        optimistic locking (agents check a version number before writing), section ownership
        (each agent owns a distinct portion of the shared document), and event sourcing
        (agents append to a log rather than overwriting).
      </p>

      <h2>Context Propagation</h2>

      <p>
        When work passes between agents, how much context to include is a critical decision.
        Too little context and the receiving agent lacks the information it needs to do its
        job well. Too much context and the receiving agent's context window is consumed by
        background that may not be relevant to its specific subtask.
      </p>

      <p>
        The principle is to pass the minimum context required for the receiving agent to
        complete its task correctly. This usually includes: the original user goal, the
        specific subtask being delegated, the outputs of any previous steps that are directly
        relevant, and any constraints that apply to the delegated work. It does not include
        the full conversation history of the delegating agent unless specifically needed.
      </p>

      <PatternBlock
        name="Canonical Context Object"
        category="Communication Design"
        description="Define a canonical context object that is passed between agents. This object contains the fields that any agent needs to understand its role: the original user request, the current task, relevant prior results, and active constraints. Agents add their outputs to the context object, which the orchestrator passes to subsequent agents. This makes inter-agent communication explicit and auditable."
        when={[
          "Building any multi-agent pipeline where work flows through multiple agents",
          "Systems where debugging requires understanding what each agent knew when it acted",
          "Pipelines where context must be selectively expanded as more information is gathered"
        ]}
        avoid={[
          "Passing the full conversation history of one agent to another",
          "Using unstructured free-text for task delegation between agents",
          "Dropping intermediate results when passing context to downstream agents"
        ]}
      />

      <BestPracticeBlock title="Version your inter-agent message schema">
        As your multi-agent system evolves, the schema of messages between agents will change.
        Include a schema version in every inter-agent message. This allows you to evolve the
        schema without breaking existing agents, run old and new agent versions in parallel
        during migration, and clearly identify mismatches when a message from an old agent
        reaches a new agent or vice versa.
      </BestPracticeBlock>

      <WarningBlock title="Beware of context explosion">
        It is tempting to include more and more context in inter-agent messages to prevent
        agents from missing information. This leads to context explosion: each agent passes
        its full context to the next, which includes the previous agent's full context,
        which grows quadratically. Set a strict budget for inter-agent message size and
        summarize earlier context rather than passing it verbatim.
      </WarningBlock>

      <NoteBlock title="Log all inter-agent messages">
        Every message exchanged between agents should be logged with timestamp, sender,
        receiver, message ID, and full content. This logging is your primary debugging tool
        when a multi-agent task produces wrong results. Without comprehensive message logs,
        diagnosing failures in production multi-agent systems is extremely difficult.
      </NoteBlock>
    </article>
  )
}
