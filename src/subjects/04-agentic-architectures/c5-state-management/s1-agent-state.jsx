import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function AgentState() {
  return (
    <article className="prose-content">
      <h2>Agent State Management</h2>

      <p>
        State management is one of the most underappreciated aspects of agent system design.
        An agent's behavior at any point in its execution depends entirely on its state: the
        conversation history, accumulated tool results, intermediate conclusions, and external
        resources it has accessed. Getting state management right — defining what state exists,
        how it is structured, how it persists, and how it can be recovered — determines whether
        an agent system is reliable enough for production.
      </p>

      <ConceptBlock term="Agent State">
        Agent state is the complete set of information that determines how an agent will
        behave at any given moment. In LLM-based agents, state consists primarily of the
        conversation history (in-context state), plus any external state the agent has
        written to or read from during its execution. Complete agent state must be
        sufficient to reproduce the agent's execution from any point — to "replay" or
        "resume" it after an interruption.
      </ConceptBlock>

      <h2>Anatomy of Agent State</h2>

      <h3>In-Context State: The Conversation History</h3>
      <p>
        The most fundamental form of agent state is the messages array — the accumulated
        conversation history that is passed to the LLM on every API call. This includes:
        the original user request, the system prompt, all assistant responses (including
        reasoning text), all tool call inputs, and all tool call results. The messages
        array is the agent's working memory: everything it has done and observed during
        the current task.
      </p>
      <p>
        In-context state is ephemeral: when the process ends, the messages array disappears.
        Persisting agent state requires serializing the messages array to durable storage
        at regular checkpoints.
      </p>

      <h3>External State</h3>
      <p>
        As the agent executes, it may create or modify external state: writing files, making
        database records, sending emails, updating documents. This external state is part of
        the agent's effect on the world, but it is not stored in the messages array. Managing
        external state requires tracking what the agent has done to external systems, whether
        those operations are reversible, and how to handle failures that leave external state
        partially modified.
      </p>

      <h3>Ephemeral Computation State</h3>
      <p>
        Some state is neither in the conversation history nor in an external store — it exists
        only in the program's memory during execution. Computed indexes, caches, parsed data
        structures. This state must be either derivable from the conversation history (so it
        can be recomputed if needed) or explicitly serialized at checkpoints.
      </p>

      <h2>Defining a State Schema</h2>

      <p>
        For anything beyond a single-turn agent, defining an explicit state schema pays
        dividends. A schema specifies what fields exist in the agent's state, what types they
        are, what invariants they must satisfy, and which fields are required vs. optional.
        This makes state transitions explicit, makes state serialization/deserialization
        reliable, and makes it possible to validate that a loaded state is internally
        consistent before resuming execution.
      </p>

      <SDKExample
        title="Typed Agent State with Checkpointing"
        tabs={{
          python: `import json
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# State schema
# ---------------------------------------------------------------------------

@dataclass
class ToolCall:
    tool_name: str
    inputs: dict
    result: str
    timestamp: float

@dataclass
class AgentState:
    """Complete agent state that can be checkpointed and resumed."""
    task_id: str
    original_task: str
    messages: list[dict] = field(default_factory=list)
    tool_calls: list[ToolCall] = field(default_factory=list)
    step_count: int = 0
    status: str = "running"          # running | completed | failed | paused
    final_answer: str | None = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    schema_version: str = "1.0"      # For forward compatibility

    def to_json(self) -> str:
        """Serialize state to JSON for persistence."""
        data = asdict(self)
        return json.dumps(data, indent=2)

    @classmethod
    def from_json(cls, json_str: str) -> "AgentState":
        """Deserialize state from JSON."""
        data = json.loads(json_str)
        # Convert tool_calls dicts back to ToolCall objects
        data["tool_calls"] = [ToolCall(**tc) for tc in data.get("tool_calls", [])]
        # Remove schema_version before passing to __init__ if newer
        data.pop("schema_version", None)
        return cls(**data, schema_version="1.0")

    def mark_updated(self):
        self.updated_at = time.time()
        self.step_count += 1

# ---------------------------------------------------------------------------
# Checkpoint manager
# ---------------------------------------------------------------------------

class CheckpointManager:
    """Saves and loads agent state checkpoints to disk."""

    def __init__(self, checkpoint_dir: str = "/tmp/agent_checkpoints"):
        self.dir = Path(checkpoint_dir)
        self.dir.mkdir(parents=True, exist_ok=True)

    def save(self, state: AgentState) -> str:
        """Save a checkpoint. Returns the checkpoint file path."""
        path = self.dir / f"{state.task_id}_step{state.step_count:04d}.json"
        path.write_text(state.to_json())
        # Also write "latest" pointer for easy resumption
        latest = self.dir / f"{state.task_id}_latest.json"
        latest.write_text(state.to_json())
        return str(path)

    def load_latest(self, task_id: str) -> AgentState | None:
        """Load the latest checkpoint for a task."""
        latest = self.dir / f"{task_id}_latest.json"
        if not latest.exists():
            return None
        return AgentState.from_json(latest.read_text())

    def list_checkpoints(self, task_id: str) -> list[str]:
        """List all checkpoint files for a task."""
        return sorted(str(p) for p in self.dir.glob(f"{task_id}_step*.json"))

checkpointer = CheckpointManager()

# ---------------------------------------------------------------------------
# Stateful agent loop with checkpointing
# ---------------------------------------------------------------------------

TOOLS = [
    {
        "name": "search",
        "description": "Search for information on a topic.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"]
        }
    }
]

def fake_search(query: str) -> str:
    return f"Search results for '{query}': [key fact 1, key fact 2, key fact 3]"

def run_with_checkpointing(state: AgentState, max_steps: int = 10) -> AgentState:
    """Run an agent loop, checkpointing state after every step."""

    # Initialize messages if this is a fresh state
    if not state.messages:
        state.messages = [{"role": "user", "content": state.original_task}]

    while state.step_count < max_steps and state.status == "running":
        try:
            response = client.messages.create(
                model="claude-opus-4-6",
                max_tokens=512,
                tools=TOOLS,
                messages=state.messages,
            )
        except Exception as e:
            state.status = "failed"
            print(f"API error at step {state.step_count}: {e}")
            checkpointer.save(state)
            return state

        state.messages.append({"role": "assistant", "content": [b.model_dump() for b in response.content]})
        state.mark_updated()

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    state.final_answer = block.text
                    state.status = "completed"
                    break

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = fake_search(block.input.get("query", ""))
                state.tool_calls.append(ToolCall(
                    tool_name=block.name,
                    inputs=block.input,
                    result=result,
                    timestamp=time.time(),
                ))
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })

        if tool_results:
            state.messages.append({"role": "user", "content": tool_results})

        # Checkpoint after every step
        checkpoint_path = checkpointer.save(state)
        print(f"  Step {state.step_count}: checkpointed to {checkpoint_path}")

        if state.status == "completed":
            break

    if state.status == "running":
        state.status = "failed"
        checkpointer.save(state)

    return state

# ---------------------------------------------------------------------------
# Example: start a task, then resume it
# ---------------------------------------------------------------------------

import uuid

# Start a new task
task_id = f"task_{uuid.uuid4().hex[:8]}"
initial_state = AgentState(
    task_id=task_id,
    original_task="What are the three main cloud providers and what are their primary strengths?"
)

print(f"Starting task {task_id}...")
final_state = run_with_checkpointing(initial_state)
print(f"Status: {final_state.status}")
print(f"Steps: {final_state.step_count}")
print(f"Tool calls: {len(final_state.tool_calls)}")
if final_state.final_answer:
    print(f"Answer: {final_state.final_answer[:200]}...")

# Demonstrate checkpoint recovery
loaded_state = checkpointer.load_latest(task_id)
if loaded_state:
    print(f"\\nLoaded checkpoint: step {loaded_state.step_count}, status {loaded_state.status}")`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// State schema
// ---------------------------------------------------------------------------

interface ToolCallRecord {
  toolName: string;
  inputs: Record<string, unknown>;
  result: string;
  timestamp: number;
}

interface AgentState {
  taskId: string;
  originalTask: string;
  messages: Anthropic.MessageParam[];
  toolCalls: ToolCallRecord[];
  stepCount: number;
  status: "running" | "completed" | "failed" | "paused";
  finalAnswer?: string;
  createdAt: number;
  updatedAt: number;
  schemaVersion: string;
}

function createState(taskId: string, task: string): AgentState {
  const now = Date.now();
  return { taskId, originalTask: task, messages: [], toolCalls: [], stepCount: 0, status: "running", createdAt: now, updatedAt: now, schemaVersion: "1.0" };
}

// ---------------------------------------------------------------------------
// Checkpoint manager
// ---------------------------------------------------------------------------

class CheckpointManager {
  private dir: string;
  constructor(dir = "/tmp/agent_checkpoints") {
    this.dir = dir;
    fs.mkdirSync(dir, { recursive: true });
  }

  save(state: AgentState): string {
    const p = path.join(this.dir, \${state.taskId}_step\${String(state.stepCount).padStart(4, "0")}.json);
    const latest = path.join(this.dir, \${state.taskId}_latest.json);
    const data = JSON.stringify(state, null, 2);
    fs.writeFileSync(p, data);
    fs.writeFileSync(latest, data);
    return p;
  }

  loadLatest(taskId: string): AgentState | null {
    const latest = path.join(this.dir, \${taskId}_latest.json);
    if (!fs.existsSync(latest)) return null;
    return JSON.parse(fs.readFileSync(latest, "utf-8")) as AgentState;
  }
}

const checkpointer = new CheckpointManager();

// ---------------------------------------------------------------------------
// Stateful agent loop
// ---------------------------------------------------------------------------

const tools: Anthropic.Tool[] = [{
  name: "search",
  description: "Search for information.",
  input_schema: { type: "object" as const, properties: { query: { type: "string" } }, required: ["query"] },
}];

function fakeSearch(query: string): string {
  return Results for '\${query}': [key fact 1, key fact 2, key fact 3];
}

async function runWithCheckpointing(state: AgentState, maxSteps = 10): Promise<AgentState> {
  if (state.messages.length === 0) {
    state.messages = [{ role: "user", content: state.originalTask }];
  }

  while (state.stepCount < maxSteps && state.status === "running") {
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, tools, messages: state.messages });
    } catch (err) {
      state.status = "failed";
      checkpointer.save(state);
      return state;
    }

    state.messages.push({ role: "assistant", content: response.content });
    state.stepCount++;
    state.updatedAt = Date.now();

    if (response.stop_reason === "end_turn") {
      const text = response.content.find((b) => b.type === "text");
      if (text && "text" in text) { state.finalAnswer = text.text; state.status = "completed"; }
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inp = block.input as { query: string };
        const result = fakeSearch(inp.query);
        state.toolCalls.push({ toolName: block.name, inputs: block.input as Record<string, unknown>, result, timestamp: Date.now() });
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
    }
    if (toolResults.length > 0) state.messages.push({ role: "user", content: toolResults });

    const cp = checkpointer.save(state);
    console.log(  Step \${state.stepCount}: checkpointed to \${cp});
    if (state.status === "completed") break;
  }

  if (state.status === "running") { state.status = "failed"; checkpointer.save(state); }
  return state;
}

async function main() {
  const taskId = task_\${Math.random().toString(36).slice(2, 10)};
  const state = createState(taskId, "What are the three main cloud providers and their primary strengths?");
  console.log(Starting task \${taskId}...);
  const final = await runWithCheckpointing(state);
  console.log(Status: \${final.status}, Steps: \${final.stepCount}, Tool calls: \${final.toolCalls.length});
  if (final.finalAnswer) console.log(Answer: \${final.finalAnswer.slice(0, 200)}...);

  const loaded = checkpointer.loadLatest(taskId);
  if (loaded) console.log(\\nLoaded checkpoint: step \${loaded.stepCount}, status \${loaded.status});
}

main();`
        }}
      />

      <h2>Checkpointing Strategies</h2>

      <h3>After Every Step</h3>
      <p>
        Checkpoint after every agent loop iteration. Maximum recovery granularity — if the
        process dies after step 7, you can resume from step 7. Higher write overhead but
        acceptable for most workloads. This is the recommended default.
      </p>

      <h3>At Phase Boundaries</h3>
      <p>
        Checkpoint only when the agent completes a major phase of work — after research is
        complete, after planning is done, after a draft is produced. Lower write overhead,
        but if a failure occurs mid-phase, work since the last checkpoint must be repeated.
        Appropriate for agents where each step is fast but phases are natural boundaries.
      </p>

      <PatternBlock
        name="Append-Only State"
        category="State Design"
        description="Design agent state as an append-only log: new information is always added, never overwritten. The conversation history is naturally append-only — new messages are appended, not edited. Tool call records should follow the same pattern. This makes state serialization simpler (you can always replay from the beginning), makes debugging easier (you can inspect the full history of what happened), and avoids a class of bugs where a state update overwrites information needed for recovery."
        when={[
          "Designing the initial state schema for any agent system",
          "Building systems that require auditability of agent actions",
          "Long-running agents where recovery from mid-task failures is important"
        ]}
        avoid={[
          "Mutable state fields that are overwritten rather than versioned",
          "Deleting intermediate state to save storage — keep everything",
          "In-place modification of the messages array"
        ]}
      />

      <BestPracticeBlock title="Include a schema version in every state object">
        As your agent evolves, the state schema will change. Always include a schema version
        field in your state objects. When loading a checkpoint, check the schema version and
        apply any necessary migrations before proceeding. Without versioning, you cannot safely
        load old checkpoints after a schema change — you will silently interpret old fields
        incorrectly.
      </BestPracticeBlock>

      <WarningBlock title="Conversation history is not fully portable across model versions">
        The messages array format depends on the model's expected input format. If you upgrade
        the model version and the message format changes, old checkpoints may not deserialize
        correctly. Test checkpoint loading whenever you upgrade the model version your agent
        uses.
      </WarningBlock>

      <NoteBlock title="State size grows with step count">
        Every tool call appends inputs and outputs to the messages array. A 20-step agent
        with verbose tool results can accumulate megabytes of state. Monitor state size and
        implement summarization for long-running agents to prevent state from growing without
        bound. Summarized state is smaller but loses detail — balance the trade-off based
        on your recovery requirements.
      </NoteBlock>
    </article>
  )
}
