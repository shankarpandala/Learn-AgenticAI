import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import PatternBlock from '../../../components/content/PatternBlock.jsx';
import WarningBlock from '../../../components/content/WarningBlock.jsx';
import FlowDiagram from '../../../components/viz/FlowDiagram.jsx';

const agentLoopPython = `from anthropic import Anthropic
import json

client = Anthropic()

# Simulated environment tools
tools = [
    {
        "name": "read_sensor",
        "description": "Read a named sensor value from the environment.",
        "input_schema": {
            "type": "object",
            "properties": {
                "sensor_id": {
                    "type": "string",
                    "description": "Identifier of the sensor to read, e.g. 'temperature', 'status'"
                }
            },
            "required": ["sensor_id"]
        }
    },
    {
        "name": "take_action",
        "description": "Execute an action in the environment.",
        "input_schema": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "The action to perform, e.g. 'alert_operator', 'adjust_setting'"
                },
                "payload": {
                    "type": "string",
                    "description": "Additional data for the action"
                }
            },
            "required": ["action"]
        }
    }
]

# Simulated sensor registry
SENSORS = {
    "temperature": "42.7°C — above normal threshold of 40°C",
    "pressure": "1.02 atm — within normal range",
    "status": "DEGRADED — component B reporting intermittent errors"
}

def perceive(sensor_id: str) -> str:
    """Perceive a value from the environment (Perceive step)."""
    return SENSORS.get(sensor_id, f"Unknown sensor: {sensor_id}")

def act(action: str, payload: str = "") -> str:
    """Execute an action in the environment (Act step)."""
    if action == "alert_operator":
        return f"Operator alerted: {payload}"
    if action == "adjust_setting":
        return f"Setting adjusted: {payload}"
    return f"Action '{action}' executed."

def execute_tool(name: str, inputs: dict) -> str:
    """Dispatch tool calls to the correct handler."""
    if name == "read_sensor":
        return perceive(inputs["sensor_id"])
    if name == "take_action":
        return act(inputs["action"], inputs.get("payload", ""))
    return "Unknown tool"

def agent_loop(objective: str, max_cycles: int = 10) -> str:
    """
    Full perceive → reason → act → observe cycle.

    Each iteration:
      1. PERCEIVE  — model reads accumulated observations from history
      2. REASON    — model generates next tokens (its 'thought' + tool choice)
      3. ACT       — we execute the chosen tool
      4. OBSERVE   — result is appended to history for the next cycle
    """
    messages = [{"role": "user", "content": objective}]
    cycle = 0

    while cycle < max_cycles:
        cycle += 1
        print(f"\\n--- Cycle {cycle} ---")

        # REASON: call the model with current history
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )

        # Add assistant turn to history
        messages.append({"role": "assistant", "content": response.content})

        # Check stopping condition
        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    print(f"Final answer: {block.text}")
                    return block.text
            return "Task complete — no final text produced."

        # ACT + OBSERVE: execute each tool call and collect results
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                print(f"  Action: {block.name}({block.input})")
                observation = execute_tool(block.name, block.input)
                print(f"  Observe: {observation}")
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": observation
                })

        if tool_results:
            # OBSERVE: feed results back so next cycle can PERCEIVE them
            messages.append({"role": "user", "content": tool_results})

    return "Max cycles reached."

# Run the agent
result = agent_loop(
    "Check the temperature and status sensors. "
    "If anything is out of range, alert the operator with a summary."
)`;

const agentLoopTypeScript = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "read_sensor",
    description: "Read a named sensor value from the environment.",
    input_schema: {
      type: "object" as const,
      properties: {
        sensor_id: {
          type: "string",
          description: "Identifier of the sensor to read",
        },
      },
      required: ["sensor_id"],
    },
  },
  {
    name: "take_action",
    description: "Execute an action in the environment.",
    input_schema: {
      type: "object" as const,
      properties: {
        action: { type: "string", description: "The action to perform" },
        payload: { type: "string", description: "Additional data" },
      },
      required: ["action"],
    },
  },
];

const SENSORS: Record<string, string> = {
  temperature: "42.7°C — above normal threshold of 40°C",
  pressure: "1.02 atm — within normal range",
  status: "DEGRADED — component B reporting intermittent errors",
};

function perceive(sensorId: string): string {
  return SENSORS[sensorId] ?? Unknown sensor: \${sensorId};
}

function act(action: string, payload = ""): string {
  if (action === "alert_operator") return Operator alerted: \${payload};
  if (action === "adjust_setting") return Setting adjusted: \${payload};
  return Action '\${action}' executed.;
}

function executeTool(name: string, inputs: Record<string, string>): string {
  if (name === "read_sensor") return perceive(inputs.sensor_id);
  if (name === "take_action") return act(inputs.action, inputs.payload ?? "");
  return "Unknown tool";
}

async function agentLoop(objective: string, maxCycles = 10): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: objective },
  ];

  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    console.log(\\n--- Cycle \${cycle} ---);

    // REASON
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      const answer = textBlock && "text" in textBlock ? textBlock.text : "Done.";
      console.log(Final answer: \${answer});
      return answer;
    }

    // ACT + OBSERVE
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inputs = block.input as Record<string, string>;
        console.log(  Action: \${block.name}(\${JSON.stringify(inputs)}));
        const observation = executeTool(block.name, inputs);
        console.log(  Observe: \${observation});
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: observation,
        });
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }

  return "Max cycles reached.";
}

agentLoop(
  "Check the temperature and status sensors. " +
    "If anything is out of range, alert the operator with a summary."
).then(console.log);`;

export default function AgentLoop() {
  return (
    <article className="prose-content">
      <h2>The Agent Loop</h2>

      <p>
        Every agent — no matter how simple or sophisticated — operates through the same fundamental
        cycle: perceive the environment, reason about what to do, act on that reasoning, and observe
        the result. This loop repeats until the agent reaches its goal or a stopping condition
        is triggered. Understanding the loop in detail is essential for building, debugging, and
        extending any agent system.
      </p>

      <ConceptBlock
        term="Agent Loop"
        tag="Core Concept"
      >
        The agent loop is the repeating perceive → reason → act → observe cycle that drives every
        LLM-based agent. In each iteration the model reads accumulated observations from the
        conversation history (perceive), generates its next response and tool choices (reason),
        the system executes those tool calls (act), and the results are appended to the history
        (observe) before the next iteration begins. The loop terminates when the model signals
        it has finished or a maximum-step limit is hit.
      </ConceptBlock>

      <h2>The Four Phases in Detail</h2>

      <FlowDiagram
        direction="horizontal"
        steps={["Perceive", "Reason", "Act", "Observe"]}
        description="The four phases of the agent loop. Each phase feeds into the next, and Observe feeds back into Perceive to begin the next cycle."
      />

      <h3>1. Perceive</h3>
      <p>
        Perception is how the agent acquires information about the current state of its environment.
        In a conversation-based agent, perception is reading the accumulated message history — user
        instructions, previous tool results, and any injected context. The model does not have
        persistent memory between API calls; its entire world-model for the current task is
        contained in the messages array passed to each API request. Richer perception means a
        longer, more informative history. Poorer perception means important context has been
        truncated or never provided.
      </p>
      <p>
        Perception can also include structured inputs injected into the system prompt: a snapshot
        of a database table, a rendered view of a web page, a list of currently available tools.
        Everything the model can read before it reasons is perception.
      </p>

      <h3>2. Reason</h3>
      <p>
        Reasoning is the model's generation step — everything that happens between receiving the
        current context and producing the next message. The model synthesizes what it has perceived,
        applies its knowledge and instructions, and decides what to do next: call a tool, ask a
        clarifying question, or produce a final answer. Modern frontier models like Claude emit
        natural-language reasoning before tool calls, providing a visible trace of the decision
        process. This trace is not just for humans — it also helps the model maintain coherent
        reasoning across many steps, similar to chain-of-thought prompting.
      </p>

      <h3>3. Act</h3>
      <p>
        Acting is executing the decision the model made. The most common form of action is a tool
        call: a structured request to execute a function — search the web, query a database, run
        code, send an email. The model specifies the tool name and input parameters; the application
        layer executes the call and captures the result. Actions can also include producing a final
        answer (no tool call, stop_reason is "end_turn") or requesting human input.
      </p>
      <p>
        A single reasoning step can produce multiple tool calls in parallel when the model
        determines that several actions are independent and can be batched. This is an important
        optimization: rather than serially calling five tools with one API request each, the model
        can emit all five calls in a single response and the application layer can execute them
        concurrently.
      </p>

      <h3>4. Observe</h3>
      <p>
        Observation is feeding the results of actions back into the conversation history so they
        become available to the next perception step. In the Anthropic SDK, tool results are
        appended as "tool_result" content blocks in a user-turn message. From the model's
        perspective, these are just more input tokens — but their position in the history, tagged
        with the tool_use_id of the call that produced them, allows the model to correlate
        observations with the actions that triggered them.
      </p>
      <p>
        Observation quality matters enormously. An informative observation — "File not found:
        config.yaml (searched in /etc and /home/user)" — gives the model enough context to reason
        about what to try next. A poor observation — an empty string or a raw stack trace — may
        cause the model to misinterpret the state of the world and make a bad decision on the
        next step.
      </p>

      <h2>Stopping Conditions</h2>

      <p>
        The loop must terminate. There are three main stopping conditions to design for.
      </p>

      <h3>Goal Reached</h3>
      <p>
        The model determines the task is complete and produces a final answer without requesting
        any more tool calls. In the Anthropic SDK this corresponds to stop_reason == "end_turn"
        with no tool_use blocks in the response. This is the happy path.
      </p>

      <h3>Maximum Step Limit</h3>
      <p>
        A hard limit on the number of loop iterations prevents runaway agents from consuming
        unbounded tokens and cost. Reaching this limit should be treated as a signal that something
        went wrong — the model may be stuck in a reasoning loop, a tool may be consistently
        failing, or the task may be underspecified. Log and alert on max-step terminations.
      </p>

      <h3>Error Conditions</h3>
      <p>
        A tool may return a terminal error, the model may signal that the task is impossible with
        the available tools, or an external API timeout may force an abort. Build explicit handling
        for these cases: returning a partial result with a clear explanation is better than silently
        returning an empty response.
      </p>

      <PatternBlock
        name="Bounded Agent Loop"
        category="Reliability"
        whenToUse="Always set an explicit maximum iteration count on any agent loop. Choose the limit based on the expected complexity of the task — a typical research task might need 10–20 steps, while a simple tool-lookup task needs 3–5. Log and monitor when the limit is hit; it nearly always indicates a problem to investigate."
      >
        Guard the agent loop with a maximum step count. The limit prevents runaway token
        consumption from stuck agents, makes costs predictable, and surfaces systematic failures
        that would otherwise be hidden in long silent loops.
      </PatternBlock>

      <h2>State Accumulation Across Cycles</h2>

      <p>
        The key insight about the agent loop is that the conversation history is the agent's
        working memory. Every observation from every previous cycle is readable by the model in
        the current cycle. This means the agent's effective "state" grows with each iteration —
        it knows more and more about the task, the environment, and what has already been tried.
      </p>
      <p>
        This accumulation is also a cost driver: each API call includes the entire history so far,
        so token consumption grows roughly quadratically with the number of steps. Long-running
        agents need strategies for managing context size: summarizing earlier steps, removing
        redundant observations, or offloading detailed information to external memory.
      </p>

      <NoteBlock
        type="intuition"
        title="The history IS the agent's state machine"
      >
        Unlike traditional software where state is held in variables, the agent loop holds all
        state in the message history. Adding a tool result to history is equivalent to updating
        a variable. The model "reads" state by seeing the history; it "writes" state by calling
        tools whose results get appended. This immutable-append pattern makes agent execution
        naturally replayable and debuggable — you can reconstruct exactly what the agent knew
        at any point by reading the history up to that message.
      </NoteBlock>

      <h2>Implementing the Full Loop</h2>

      <p>
        The example below implements the complete perceive → reason → act → observe cycle with
        explicit logging of each phase. Two tools simulate an industrial monitoring scenario:
        reading sensors (perceive the environment) and taking actions (affect the environment).
      </p>

      <SDKExample
        title="Perceive → Reason → Act → Observe Loop"
        tabs={{
          python: agentLoopPython,
          typescript: agentLoopTypeScript,
        }}
      />

      <WarningBlock
        title="Context window limits in long loops"
      >
        Each cycle appends tool results to the history. On long tasks the accumulated history
        may approach the model's context window limit, causing truncation or API errors. Monitor
        the token count of your messages array (available in the usage field of the API response)
        and implement summarization or truncation strategies before the limit is reached.
      </WarningBlock>

      <h2>Parallelizing Actions Within a Cycle</h2>

      <p>
        When the model emits multiple tool_use blocks in a single response, those tool calls can
        be executed concurrently rather than serially. All results should then be returned as a
        single user-turn message containing multiple tool_result blocks. This pattern can
        significantly reduce wall-clock latency for tasks that involve many independent lookups
        or API calls in a single reasoning step.
      </p>

      <NoteBlock
        type="tip"
        title="Parallel tool execution"
      >
        When you receive multiple tool_use blocks in a single assistant response, execute them
        concurrently (e.g., with asyncio.gather in Python or Promise.all in TypeScript) and
        return all results in one tool-result message. This is both more efficient and correct —
        the model expects all results from a batch of tool calls to arrive together before
        continuing its reasoning.
      </NoteBlock>
    </article>
  );
}
