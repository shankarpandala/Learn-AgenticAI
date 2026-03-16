import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function LongRunningAgents() {
  return (
    <article className="prose-content">
      <h2>Long-Running Agents</h2>

      <p>
        Most agent implementations are designed for tasks that complete in seconds or minutes.
        Long-running agents operate on a fundamentally different timescale — hours, days,
        or even longer. A competitive intelligence agent that monitors news and synthesizes
        weekly reports, a code maintenance agent that works through a backlog of technical debt
        issues over several days, a research agent that gathers data over weeks — these systems
        face challenges that short-running agents never encounter: context window limitations
        accumulate, infrastructure fails, requirements change, and the external world changes
        around the agent while it works.
      </p>

      <ConceptBlock term="Long-Running Agent">
        A long-running agent is an agent whose task execution spans hours to days, potentially
        across multiple process restarts, infrastructure changes, and user interactions.
        Long-running agents require durable state management, event-driven execution patterns,
        context window management strategies, and explicit mechanisms for handling the
        world-state changes that occur during their extended operation.
      </ConceptBlock>

      <h2>Core Challenges</h2>

      <h3>Context Window Accumulation</h3>
      <p>
        In a short-running agent, the conversation history stays manageable. In a long-running
        agent executing hundreds of steps, the accumulated history eventually exceeds the
        model's context window limit. Without active management, the agent either fails with
        a context overflow error or produces degraded reasoning as the model starts attending
        to the most recent tokens at the expense of earlier context.
      </p>
      <p>
        The solution is progressive summarization: as the conversation history grows, summarize
        older segments and replace them with compact summaries. Recent steps stay in full detail
        because they are most relevant to the current reasoning. Older steps are represented
        by summaries that capture what was learned without preserving every token.
      </p>

      <h3>Process Durability</h3>
      <p>
        A script that runs for three days on a single machine will fail — due to hardware
        failures, software updates, network timeouts, or out-of-memory conditions. Long-running
        agents must be designed to fail and restart without losing progress. This requires
        durable state checkpointing (so work is not lost on restart) and idempotent step
        execution (so a retried step does not cause duplicate side effects).
      </p>

      <h3>Stale Context</h3>
      <p>
        Information that was accurate when the agent gathered it may become outdated as time
        passes. A market analysis gathered on day 1 may be stale by day 3. Long-running agents
        need a strategy for identifying and refreshing stale information — either proactively
        re-fetching data on a schedule, or reactively re-verifying data when it is used in
        reasoning.
      </p>

      <h3>External World Changes</h3>
      <p>
        The environment the agent is operating on changes while the agent works. Files are
        modified by other processes, APIs return different results, users update their
        requirements. Long-running agents must detect when their assumptions about the world
        have been invalidated and update their plans accordingly.
      </p>

      <h2>Event-Driven Architecture for Long-Running Agents</h2>

      <p>
        The most effective pattern for long-running agents is event-driven execution: the
        agent does not run continuously, but is triggered by events — a scheduled timer,
        an external notification, a user message, a change in an external system. Between
        events, the agent is idle, consuming no compute and no API costs. When an event
        arrives, the agent loads its persisted state, processes the event, updates its state,
        and returns to idle.
      </p>

      <p>
        This pattern decouples the agent's execution from wall-clock time. A "daily research
        agent" does not need to run continuously for 24 hours — it runs for a few minutes
        each morning when triggered by a cron event, processes what happened overnight,
        and saves its updated state.
      </p>

      <SDKExample
        title="Event-Driven Long-Running Agent"
        tabs={{
          python: `import json
import time
from dataclasses import dataclass, field
from pathlib import Path
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Persistent state for a long-running agent
# ---------------------------------------------------------------------------

@dataclass
class LongRunningAgentState:
    agent_id: str
    goal: str
    accumulated_findings: list[str] = field(default_factory=list)
    active_questions: list[str] = field(default_factory=list)
    resolved_questions: list[str] = field(default_factory=list)
    recent_messages: list[dict] = field(default_factory=list)  # Last N steps only
    summary: str = ""                   # Summary of older context
    event_log: list[dict] = field(default_factory=list)
    step_count: int = 0
    status: str = "active"             # active | paused | completed
    created_at: float = field(default_factory=time.time)
    last_run_at: float = 0.0
    schema_version: str = "1.0"

    MAX_RECENT_MESSAGES = 20           # Keep last N messages in full

    def save(self, state_dir: str = "/tmp/long_running_agents"):
        Path(state_dir).mkdir(parents=True, exist_ok=True)
        path = Path(state_dir) / f"{self.agent_id}.json"
        path.write_text(json.dumps(self.__dict__, indent=2))

    @classmethod
    def load(cls, agent_id: str, state_dir: str = "/tmp/long_running_agents") -> "LongRunningAgentState | None":
        path = Path(state_dir) / f"{agent_id}.json"
        if not path.exists():
            return None
        data = json.loads(path.read_text())
        data.pop("schema_version", None)
        return cls(**data, schema_version="1.0")

    def build_context_prompt(self) -> str:
        """Build a focused context prompt from accumulated state."""
        sections = [f"GOAL: {self.goal}"]
        if self.summary:
            sections.append(f"PRIOR PROGRESS SUMMARY:\\n{self.summary}")
        if self.accumulated_findings:
            sections.append(f"KEY FINDINGS SO FAR:\\n" + "\\n".join(f"- {f}" for f in self.accumulated_findings[-10:]))
        if self.active_questions:
            sections.append(f"OPEN QUESTIONS TO RESOLVE:\\n" + "\\n".join(f"- {q}" for q in self.active_questions))
        return "\\n\\n".join(sections)

    def summarize_if_needed(self):
        """Compress the message history when it gets too long."""
        if len(self.recent_messages) <= self.MAX_RECENT_MESSAGES:
            return
        # Summarize the oldest half
        to_summarize = self.recent_messages[:self.MAX_RECENT_MESSAGES // 2]
        self.recent_messages = self.recent_messages[self.MAX_RECENT_MESSAGES // 2:]

        summary_text = "\\n".join(
            f"[{m.get('role', 'unknown')}]: {str(m.get('content', ''))[:200]}"
            for m in to_summarize
        )
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=256,
            system="Summarize this agent conversation history in 3-5 bullet points, preserving key findings.",
            messages=[{"role": "user", "content": summary_text}]
        )
        new_summary_text = next((b.text for b in response.content if hasattr(b, "text")), "")
        self.summary = (self.summary + "\\n" + new_summary_text).strip()

# ---------------------------------------------------------------------------
# Event handler: the agent processes one event trigger at a time
# ---------------------------------------------------------------------------

AGENT_SYSTEM = """You are a persistent research agent working on a long-term goal.
You are given:
- Your goal
- A summary of what you have accomplished so far
- Key findings accumulated so far
- Open questions you are still investigating

Based on this context, decide what to do next. You can:
1. Research a specific question using the search tool
2. Record a new finding (output a finding statement)
3. Mark a question as resolved
4. Add new questions to investigate
5. Signal that the goal is complete

Always be efficient — focus on the most important open question or unexplored area."""

AGENT_TOOLS = [
    {
        "name": "search",
        "description": "Search for information relevant to your investigation.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Specific search query"}},
            "required": ["query"]
        }
    },
    {
        "name": "record_finding",
        "description": "Record a key finding. Call this when you have established an important fact.",
        "input_schema": {
            "type": "object",
            "properties": {"finding": {"type": "string", "description": "The finding to record"}},
            "required": ["finding"]
        }
    },
    {
        "name": "mark_goal_complete",
        "description": "Signal that the research goal has been fully achieved.",
        "input_schema": {
            "type": "object",
            "properties": {"summary": {"type": "string", "description": "Final summary of all findings"}},
            "required": ["summary"]
        }
    }
]

def fake_search(query: str) -> str:
    return f"Research results for '{query}': [Finding 1 about {query}. Finding 2 with more detail. Finding 3 with context.]"

def process_event(state: LongRunningAgentState, event: dict) -> LongRunningAgentState:
    """Process one event trigger. Runs the agent for a few steps, then saves state."""
    state.last_run_at = time.time()
    state.event_log.append({"event": event, "timestamp": state.last_run_at})
    print(f"Processing event: {event.get('type', 'unknown')} for agent {state.agent_id}")

    # Build context prompt from accumulated state
    context = state.build_context_prompt()
    event_prompt = f"EVENT: {json.dumps(event)}\\n\\nCurrent state:\\n{context}\\n\\nTake the next action toward your goal."

    # Run 1-3 steps per event to make progress without blocking
    messages = state.recent_messages.copy() if state.recent_messages else []
    messages.append({"role": "user", "content": event_prompt})

    for _ in range(3):  # Max steps per event trigger
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=512,
            system=AGENT_SYSTEM,
            tools=AGENT_TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": [b.model_dump() if hasattr(b, "model_dump") else b for b in response.content]})
        state.step_count += 1

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                if block.name == "search":
                    result = fake_search(block.input["query"])
                elif block.name == "record_finding":
                    finding = block.input["finding"]
                    state.accumulated_findings.append(finding)
                    result = f"Finding recorded: {finding}"
                    print(f"  New finding: {finding}")
                elif block.name == "mark_goal_complete":
                    state.status = "completed"
                    state.summary = block.input["summary"]
                    result = "Goal marked as complete."
                    print("  Agent completed its goal!")
                else:
                    result = "Unknown tool"
                tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

        if response.stop_reason == "end_turn" or state.status == "completed":
            break

    # Update recent messages, compressing if needed
    state.recent_messages = messages[-state.MAX_RECENT_MESSAGES:]
    state.summarize_if_needed()
    state.save()
    return state


# ---------------------------------------------------------------------------
# Simulate event-driven execution over multiple triggers
# ---------------------------------------------------------------------------

# Create or load the agent state
import uuid
agent_id = f"research_{uuid.uuid4().hex[:8]}"
state = LongRunningAgentState(
    agent_id=agent_id,
    goal="Compile a comprehensive overview of transformer architecture innovations from 2020 to 2024",
)
state.active_questions = [
    "What were the major architectural improvements to transformers in 2020-2022?",
    "How did efficient attention mechanisms evolve?",
    "What are the most significant scaling discoveries?",
]
state.save()

# Simulate multiple event triggers (in reality these would be cron jobs or external triggers)
events = [
    {"type": "scheduled_run", "trigger": "daily_cron"},
    {"type": "scheduled_run", "trigger": "daily_cron"},
    {"type": "user_message", "message": "Focus especially on sparse attention methods"},
]

for event in events:
    if state.status != "active":
        break
    state = process_event(state, event)
    print(f"  After event: {len(state.accumulated_findings)} findings, {state.step_count} total steps")

print(f"\\nFinal status: {state.status}")
print(f"Total findings: {len(state.accumulated_findings)}")
for f in state.accumulated_findings:
    print(f"  - {f}")`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Long-running agent state
// ---------------------------------------------------------------------------

interface LongRunningState {
  agentId: string;
  goal: string;
  accumulatedFindings: string[];
  activeQuestions: string[];
  recentMessages: Anthropic.MessageParam[];
  summary: string;
  eventLog: Array<{ event: Record<string, unknown>; timestamp: number }>;
  stepCount: number;
  status: "active" | "paused" | "completed";
  lastRunAt: number;
  schemaVersion: string;
}

const MAX_RECENT = 20;
const STATE_DIR = "/tmp/long_running_agents";

function saveState(state: LongRunningState): void {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(path.join(STATE_DIR, \`\${state.agentId}.json\`), JSON.stringify(state, null, 2));
}

function loadState(agentId: string): LongRunningState | null {
  const p = path.join(STATE_DIR, \`\${agentId}.json\`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8")) as LongRunningState;
}

function buildContextPrompt(state: LongRunningState): string {
  const parts = [\`GOAL: \${state.goal}\`];
  if (state.summary) parts.push(\`PRIOR PROGRESS:\\n\${state.summary}\`);
  if (state.accumulatedFindings.length > 0) {
    parts.push(\`KEY FINDINGS:\\n\${state.accumulatedFindings.slice(-10).map((f) => \`- \${f}\`).join("\\n")}\`);
  }
  if (state.activeQuestions.length > 0) {
    parts.push(\`OPEN QUESTIONS:\\n\${state.activeQuestions.map((q) => \`- \${q}\`).join("\\n")}\`);
  }
  return parts.join("\\n\\n");
}

// ---------------------------------------------------------------------------
// Event processing
// ---------------------------------------------------------------------------

const AGENT_SYSTEM = \`You are a persistent research agent working on a long-term goal.
Given your current state, take the next efficient action: search for information,
record findings, or mark the goal complete when done.\`;

const tools: Anthropic.Tool[] = [
  { name: "search", description: "Search for information.", input_schema: { type: "object" as const, properties: { query: { type: "string" } }, required: ["query"] } },
  { name: "record_finding", description: "Record a key finding.", input_schema: { type: "object" as const, properties: { finding: { type: "string" } }, required: ["finding"] } },
  { name: "mark_goal_complete", description: "Signal the research goal is achieved.", input_schema: { type: "object" as const, properties: { summary: { type: "string" } }, required: ["summary"] } },
];

async function processEvent(state: LongRunningState, event: Record<string, unknown>): Promise<LongRunningState> {
  state.lastRunAt = Date.now();
  state.eventLog.push({ event, timestamp: state.lastRunAt });
  console.log(\`Processing event: \${event.type} for \${state.agentId}\`);

  const context = buildContextPrompt(state);
  const messages: Anthropic.MessageParam[] = [
    ...state.recentMessages,
    { role: "user", content: \`EVENT: \${JSON.stringify(event)}\\n\\n\${context}\\n\\nTake the next action.\` },
  ];

  for (let i = 0; i < 3; i++) {
    const response = await client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, system: AGENT_SYSTEM, tools, messages });
    messages.push({ role: "assistant", content: response.content });
    state.stepCount++;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inp = block.input as Record<string, string>;
        let result = "";
        if (block.name === "search") {
          result = \`Results for '\${inp.query}': [Finding 1, Finding 2, Finding 3]\`;
        } else if (block.name === "record_finding") {
          state.accumulatedFindings.push(inp.finding);
          result = \`Finding recorded.\`;
          console.log(\`  New finding: \${inp.finding}\`);
        } else if (block.name === "mark_goal_complete") {
          state.status = "completed";
          state.summary = inp.summary;
          result = "Goal complete.";
          console.log("  Agent completed its goal!");
        } else { result = "Unknown tool"; }
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
    if (response.stop_reason === "end_turn" || state.status === "completed") break;
  }

  state.recentMessages = messages.slice(-MAX_RECENT) as Anthropic.MessageParam[];
  saveState(state);
  return state;
}

async function main() {
  const agentId = \`research_\${Math.random().toString(36).slice(2, 10)}\`;
  let state: LongRunningState = {
    agentId, goal: "Compile an overview of transformer architecture innovations 2020-2024",
    accumulatedFindings: [], activeQuestions: ["What were major architectural improvements?", "How did efficient attention evolve?"],
    recentMessages: [], summary: "", eventLog: [], stepCount: 0, status: "active", lastRunAt: 0, schemaVersion: "1.0",
  };
  saveState(state);

  const events = [
    { type: "scheduled_run", trigger: "daily_cron" },
    { type: "user_message", message: "Focus on sparse attention methods" },
  ];

  for (const event of events) {
    if (state.status !== "active") break;
    state = await processEvent(state, event);
    console.log(\`  After event: \${state.accumulatedFindings.length} findings, \${state.stepCount} steps\`);
  }

  console.log(\`\\nFinal: \${state.status}, \${state.accumulatedFindings.length} findings\`);
  state.accumulatedFindings.forEach((f) => console.log(\`  - \${f}\`));
}

main();`
        }}
      />

      <h2>Context Compression Strategies</h2>

      <h3>Progressive Summarization</h3>
      <p>
        Summarize the oldest portion of the conversation history whenever the history
        exceeds a threshold. Retain full detail for recent messages. The summary captures
        the substance of what was learned without preserving every token of intermediate
        reasoning.
      </p>

      <h3>Semantic Memory Extraction</h3>
      <p>
        Instead of summarizing, extract structured facts from the history and store them
        in a separate "findings" list. Each finding is a compact, informative statement.
        When building the prompt for the next step, include only the most relevant findings
        rather than the full history. This approach preserves information more faithfully
        than free-form summarization.
      </p>

      <h3>External Memory with Retrieval</h3>
      <p>
        Store all intermediate findings in a vector store and retrieve relevant findings
        on each step based on the current task context. This enables effectively unlimited
        long-term memory at the cost of a retrieval step per agent loop iteration. Best for
        agents that work on very large knowledge domains over extended periods.
      </p>

      <PatternBlock
        name="Event-Driven Idle Agent"
        category="Long-Running Agent"
        description="Design long-running agents to be idle between work triggers rather than running continuously. Use a scheduler (cron, event queue, webhook) to wake the agent when there is work to do. The agent loads its persisted state, processes the trigger, saves its updated state, and returns to idle. This approach scales to any task duration without requiring persistent server threads, and reduces cost by only consuming compute when there is actual work."
        when={[
          "Research or monitoring tasks that operate on daily, weekly, or irregular schedules",
          "Agents that wait for external events (new emails, repository updates, alerts)",
          "Long-horizon tasks that would require days of continuous compute if run synchronously"
        ]}
        avoid={[
          "Continuous polling in a tight loop — use event-driven triggers instead",
          "Stateless agents that restart from scratch on each trigger",
          "Agents that hold database connections or other resources across idle periods"
        ]}
      />

      <BestPracticeBlock title="Set explicit TTLs on agent state">
        Long-running agent state persisted to disk or a database accumulates over time.
        Set explicit time-to-live (TTL) values on agent state: a research agent's state
        might be valid for 30 days, after which it should be archived or deleted. Without
        TTLs, you accumulate stale state indefinitely, and agents may resume from outdated
        context without realizing it.
      </BestPracticeBlock>

      <WarningBlock title="The world changes while your agent runs">
        An agent that gathers information on day 1 and uses it on day 5 may be working
        from stale data. Build staleness detection into long-running agents: record when
        each piece of information was gathered, check data age before using it in reasoning,
        and re-gather critical data that exceeds your freshness threshold. For time-sensitive
        domains (financial data, news, API responses), even hour-old data may be stale.
      </WarningBlock>

      <NoteBlock title="Test failure recovery, not just happy-path execution">
        Long-running agents will fail mid-execution. Simulate failures in development by
        terminating the agent at various points and verifying that it resumes correctly
        from the most recent checkpoint without duplicate side effects. The most common
        source of bugs in long-running agents is incorrect state after a failure recovery —
        the agent resumes but has corrupted or missing state that causes silent reasoning
        errors.
      </NoteBlock>
    </article>
  )
}
