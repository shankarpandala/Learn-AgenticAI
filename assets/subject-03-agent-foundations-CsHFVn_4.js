import{j as e}from"./vendor-Cs56uELc.js";import{C as s,F as i,P as o,N as n,S as t,W as a,B as r,A as l}from"./content-components-CDXEIxVK.js";const c=`from anthropic import Anthropic
import json

client = Anthropic()

# Define a tool the agent can use
tools = [
    {
        "name": "read_file",
        "description": "Read the contents of a file by name.",
        "input_schema": {
            "type": "object",
            "properties": {
                "filename": {
                    "type": "string",
                    "description": "The name of the file to read"
                }
            },
            "required": ["filename"]
        }
    }
]

def run_tool(name: str, inputs: dict) -> str:
    """Execute a tool call and return the result as a string."""
    if name == "read_file":
        # Simulated file system for this example
        files = {
            "notes.txt": "Meeting at 3pm. Discuss Q2 roadmap.",
            "todo.txt": "1. Review PR #42  2. Update docs  3. Deploy hotfix"
        }
        return files.get(inputs["filename"], f"File not found: {inputs['filename']}")
    return "Unknown tool"

def minimal_agent(task: str) -> str:
    """
    A minimal agent loop:
    1. Send task to Claude with available tools
    2. If Claude requests a tool, execute it and feed back the result
    3. Repeat until Claude produces a final text answer
    """
    messages = [{"role": "user", "content": task}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )

        # Append the assistant's response to the conversation
        messages.append({"role": "assistant", "content": response.content})

        # If Claude is done reasoning and acting, return the final answer
        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Task complete."

        # Otherwise, execute any requested tool calls and feed results back
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

# Example: ask the agent to read and summarize a file
answer = minimal_agent("Read my notes.txt file and tell me what I need to prepare for.")
print(answer)`;function d(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"What is an AI Agent?"}),e.jsx("p",{children:'The word "agent" is overloaded in the AI industry — it is applied to everything from a simple chatbot with a tool or two to a fully autonomous system managing a production codebase. To build agents well, you need a clear mental model of what an agent actually is, how it differs from simpler LLM patterns, and when the added complexity is warranted.'}),e.jsx(s,{title:"AI Agent",definition:"An AI agent is a system that perceives its environment, reasons about what actions to take, executes those actions using available tools, and uses the results to continue reasoning toward a goal — iterating through this cycle until the task is complete or a stopping condition is reached. The key distinction from a simple LLM call is the loop: an agent can take multiple steps, observe outcomes, and adapt its approach based on what it learns."}),e.jsx("h2",{children:"How LLM Agents Differ from Traditional Software"}),e.jsx("p",{children:"Traditional software follows deterministic, explicitly programmed logic. Given the same input, it produces the same output through a path an engineer designed step by step. LLM agents are fundamentally different in three ways."}),e.jsx("h3",{children:"Probabilistic Behavior"}),e.jsx("p",{children:"Language models are not deterministic. Even with temperature set to zero, subtle differences in context can produce different reasoning paths. An agent that works correctly on 95% of inputs may fail on edge cases in ways that are difficult to anticipate. This is not a bug to be fixed — it is a property to be engineered around through careful prompting, tool design, and fallback mechanisms."}),e.jsx("h3",{children:"Language-Based Goals"}),e.jsx("p",{children:"Traditional software receives precise, typed inputs. Agents receive natural language instructions that may be ambiguous, underspecified, or contradictory. The model must interpret intent, make reasonable assumptions, and sometimes ask for clarification. This is a feature — it makes agents dramatically easier to direct than writing explicit code — but it also means the agent may interpret instructions differently than you intended."}),e.jsx("h3",{children:"Emergent Behavior"}),e.jsx("p",{children:"An agent's multi-step behavior emerges from the interaction between the model's training, your prompt, the available tools, and the accumulated conversation history. Sophisticated behaviors — like the agent recognizing it is going in circles and backtracking — were not explicitly programmed. They emerge from the model's general reasoning capabilities. This makes agents powerful but also harder to reason about statically."}),e.jsx("h2",{children:"Core Components of an Agent"}),e.jsx("p",{children:"Regardless of how simple or complex an agent is, four components are always present."}),e.jsx("h3",{children:"LLM Brain"}),e.jsx("p",{children:"The language model is the reasoning core. It receives observations, produces reasoning, and decides what action to take next. The quality of this component is the largest single determinant of agent capability. A more capable model will reason better, recover from mistakes more gracefully, and handle ambiguous situations more reliably."}),e.jsx("h3",{children:"Tools and Actions"}),e.jsx("p",{children:"Tools are the mechanisms through which an agent affects the world. A tool might read a file, query a database, call an external API, run code, send an email, or navigate a web browser. Without tools, an agent can only produce text — it cannot take actions. Tool design is one of the most important levers for agent performance: clear descriptions, obvious input schemas, and informative return values all make a measurable difference."}),e.jsx("h3",{children:"Memory"}),e.jsx("p",{children:"Memory comes in several forms. The conversation history is in-context memory — everything the agent has seen during the current task. External storage (databases, vector stores, files) provides long-term memory that persists across tasks. Some architectures also include working memory structures like scratchpads where the agent accumulates intermediate results. Managing what the agent can remember — and what it is currently paying attention to — is a core system design problem."}),e.jsx("h3",{children:"Environment"}),e.jsx("p",{children:"The environment is everything the agent can observe and act upon. For a customer support agent it might be a ticketing system and a product knowledge base. For a coding agent it might be a file system, a terminal, and a test runner. Defining the environment — what is visible, what actions are permitted, what the success condition is — is part of designing the agent system."}),e.jsx("h2",{children:"The Perception-Reasoning-Action Cycle"}),e.jsx("p",{children:"Agents operate through a continuous loop of perceiving their environment, reasoning about what to do, and taking action. This cycle continues until the agent determines the goal has been achieved or an error condition is reached."}),e.jsx(i,{direction:"horizontal",steps:["Perceive Environment","Reason About Goal","Select Action","Execute Tool","Observe Result","Update State"],description:"The agent loop: the agent perceives its environment, reasons about the goal, selects an action, executes a tool, observes the result, and updates its internal state before repeating."}),e.jsx("p",{children:'In a modern LLM agent this loop is implemented through the conversation history. Each tool result is appended to the message list, and the model is called again with the updated context. The model "perceives" by reading the accumulated history. It "reasons" through its next token generation. It "acts" by calling a tool. The result lands in the history as an observation, and the cycle repeats.'}),e.jsx("h2",{children:"Agent vs. Chain vs. Simple LLM Call"}),e.jsx("p",{children:"Not every AI interaction needs to be an agent. The appropriate abstraction depends on the nature of the task."}),e.jsx("h3",{children:"Simple LLM Call"}),e.jsx("p",{children:"A single prompt-response interaction with no tools and no iteration. Appropriate for tasks with a clear, well-defined input and output that can be accomplished in one step: summarize this document, classify this email, translate this sentence. The simplest and most reliable pattern — use it whenever it is sufficient."}),e.jsx("h3",{children:"Chain (Pipeline)"}),e.jsx("p",{children:"A sequence of LLM calls where the output of one step becomes the input of the next, with the structure fixed by the developer. Appropriate when a task can be broken into a known sequence of sub-tasks: extract entities, then look them up in a database, then generate a report. The control flow does not depend on what the model decides — it is predetermined. Chains are more predictable and testable than agents."}),e.jsx("h3",{children:"Agent"}),e.jsx("p",{children:"A loop where the model decides what to do next based on observations. Appropriate when the required sequence of steps is not known in advance — it depends on what the model discovers during execution. Debugging a codebase, researching a topic, or autonomously completing a multi-step workflow are tasks where the path from start to finish is data-dependent."}),e.jsx(o,{name:"When to Use Agents",category:"Architecture Decision",description:"Use agents when the task requires dynamic decision-making — when the number and type of steps depend on what the agent discovers along the way. For tasks with a fixed, known structure, prefer chains. For single-shot tasks, prefer direct LLM calls. Add the complexity of an agent loop only when the flexibility is genuinely required.",when:["The number of steps needed to complete the task is unknown in advance","Intermediate results determine which actions to take next","The task requires self-correction based on tool outputs","Multiple heterogeneous tools may be needed in any order","The task benefits from explicit reasoning traces for debugging or compliance"],avoid:["Tasks with a fixed, predictable sequence of steps","High-throughput applications where latency and cost are critical","Safety-critical operations where deterministic behavior is required","Simple Q&A or generation tasks that need no external tools"]}),e.jsx("h2",{children:"Key Capabilities That Make Agents Powerful"}),e.jsx("h3",{children:"Multi-Step Reasoning"}),e.jsx("p",{children:"An agent can decompose a complex goal into sub-goals, pursue each in sequence, and synthesize the results. A question that requires reading several documents, cross- referencing facts, and performing a calculation is intractable in a single LLM call but straightforward for an agent with the right tools."}),e.jsx("h3",{children:"Tool Use"}),e.jsx("p",{children:"By calling tools, an agent transcends the limitations of pure language generation. It can retrieve real-time information, perform precise computations, modify state in external systems, and take actions that have effects beyond the conversation."}),e.jsx("h3",{children:"Self-Correction"}),e.jsx("p",{children:"When a tool call fails or returns unexpected results, an agent can recognize the failure through the observation it receives, reason about what went wrong, and try a different approach. This robustness to errors is one of the most practically valuable capabilities of the agent pattern."}),e.jsx(n,{title:"Start simple, add complexity only when needed",content:"The most common mistake when building with agents is reaching for the agent pattern by default. A well-designed chain or a single carefully crafted prompt will often outperform an agent on reliability, latency, and cost for tasks with known structure. Build the simplest system that solves the problem, measure its failure modes, and escalate to an agent only when the evidence shows you need dynamic decision-making. Agents are powerful but they are also harder to test, debug, and constrain."}),e.jsx("h2",{children:"A Minimal Agent Structure"}),e.jsx("p",{children:"The example below shows the essential structure of an LLM agent using the Anthropic SDK. It implements the perception-reasoning-action loop: send a task with available tools, check if the model wants to use a tool, execute it, feed the result back, and repeat until the model produces a final answer."}),e.jsx(t,{title:"Minimal Agent Loop with Anthropic SDK",language:"python",code:c,description:"A minimal agent loop: the model reasons about a task, calls tools when needed, observes results, and continues until it produces a final answer. This pattern is the foundation of all agent architectures."}),e.jsx("p",{children:"The loop structure here — send messages, check stop reason, execute tools, append results, repeat — is the core of every agent framework. Libraries like LangChain, LlamaIndex, and the Anthropic Agent SDK all provide higher-level abstractions over this exact pattern. Understanding the raw loop makes it much easier to reason about what those abstractions are doing, diagnose failures, and build custom agents when the off-the-shelf solutions do not fit your requirements."})]})}const W=Object.freeze(Object.defineProperty({__proto__:null,default:d},Symbol.toStringTag,{value:"Module"})),u=`from anthropic import Anthropic
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
)`,h=`import Anthropic from "@anthropic-ai/sdk";

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
).then(console.log);`;function p(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"The Agent Loop"}),e.jsx("p",{children:"Every agent — no matter how simple or sophisticated — operates through the same fundamental cycle: perceive the environment, reason about what to do, act on that reasoning, and observe the result. This loop repeats until the agent reaches its goal or a stopping condition is triggered. Understanding the loop in detail is essential for building, debugging, and extending any agent system."}),e.jsx(s,{term:"Agent Loop",tag:"Core Concept",children:"The agent loop is the repeating perceive → reason → act → observe cycle that drives every LLM-based agent. In each iteration the model reads accumulated observations from the conversation history (perceive), generates its next response and tool choices (reason), the system executes those tool calls (act), and the results are appended to the history (observe) before the next iteration begins. The loop terminates when the model signals it has finished or a maximum-step limit is hit."}),e.jsx("h2",{children:"The Four Phases in Detail"}),e.jsx(i,{direction:"horizontal",steps:["Perceive","Reason","Act","Observe"],description:"The four phases of the agent loop. Each phase feeds into the next, and Observe feeds back into Perceive to begin the next cycle."}),e.jsx("h3",{children:"1. Perceive"}),e.jsx("p",{children:"Perception is how the agent acquires information about the current state of its environment. In a conversation-based agent, perception is reading the accumulated message history — user instructions, previous tool results, and any injected context. The model does not have persistent memory between API calls; its entire world-model for the current task is contained in the messages array passed to each API request. Richer perception means a longer, more informative history. Poorer perception means important context has been truncated or never provided."}),e.jsx("p",{children:"Perception can also include structured inputs injected into the system prompt: a snapshot of a database table, a rendered view of a web page, a list of currently available tools. Everything the model can read before it reasons is perception."}),e.jsx("h3",{children:"2. Reason"}),e.jsx("p",{children:"Reasoning is the model's generation step — everything that happens between receiving the current context and producing the next message. The model synthesizes what it has perceived, applies its knowledge and instructions, and decides what to do next: call a tool, ask a clarifying question, or produce a final answer. Modern frontier models like Claude emit natural-language reasoning before tool calls, providing a visible trace of the decision process. This trace is not just for humans — it also helps the model maintain coherent reasoning across many steps, similar to chain-of-thought prompting."}),e.jsx("h3",{children:"3. Act"}),e.jsx("p",{children:'Acting is executing the decision the model made. The most common form of action is a tool call: a structured request to execute a function — search the web, query a database, run code, send an email. The model specifies the tool name and input parameters; the application layer executes the call and captures the result. Actions can also include producing a final answer (no tool call, stop_reason is "end_turn") or requesting human input.'}),e.jsx("p",{children:"A single reasoning step can produce multiple tool calls in parallel when the model determines that several actions are independent and can be batched. This is an important optimization: rather than serially calling five tools with one API request each, the model can emit all five calls in a single response and the application layer can execute them concurrently."}),e.jsx("h3",{children:"4. Observe"}),e.jsx("p",{children:`Observation is feeding the results of actions back into the conversation history so they become available to the next perception step. In the Anthropic SDK, tool results are appended as "tool_result" content blocks in a user-turn message. From the model's perspective, these are just more input tokens — but their position in the history, tagged with the tool_use_id of the call that produced them, allows the model to correlate observations with the actions that triggered them.`}),e.jsx("p",{children:'Observation quality matters enormously. An informative observation — "File not found: config.yaml (searched in /etc and /home/user)" — gives the model enough context to reason about what to try next. A poor observation — an empty string or a raw stack trace — may cause the model to misinterpret the state of the world and make a bad decision on the next step.'}),e.jsx("h2",{children:"Stopping Conditions"}),e.jsx("p",{children:"The loop must terminate. There are three main stopping conditions to design for."}),e.jsx("h3",{children:"Goal Reached"}),e.jsx("p",{children:'The model determines the task is complete and produces a final answer without requesting any more tool calls. In the Anthropic SDK this corresponds to stop_reason == "end_turn" with no tool_use blocks in the response. This is the happy path.'}),e.jsx("h3",{children:"Maximum Step Limit"}),e.jsx("p",{children:"A hard limit on the number of loop iterations prevents runaway agents from consuming unbounded tokens and cost. Reaching this limit should be treated as a signal that something went wrong — the model may be stuck in a reasoning loop, a tool may be consistently failing, or the task may be underspecified. Log and alert on max-step terminations."}),e.jsx("h3",{children:"Error Conditions"}),e.jsx("p",{children:"A tool may return a terminal error, the model may signal that the task is impossible with the available tools, or an external API timeout may force an abort. Build explicit handling for these cases: returning a partial result with a clear explanation is better than silently returning an empty response."}),e.jsx(o,{name:"Bounded Agent Loop",category:"Reliability",whenToUse:"Always set an explicit maximum iteration count on any agent loop. Choose the limit based on the expected complexity of the task — a typical research task might need 10–20 steps, while a simple tool-lookup task needs 3–5. Log and monitor when the limit is hit; it nearly always indicates a problem to investigate.",children:"Guard the agent loop with a maximum step count. The limit prevents runaway token consumption from stuck agents, makes costs predictable, and surfaces systematic failures that would otherwise be hidden in long silent loops."}),e.jsx("h2",{children:"State Accumulation Across Cycles"}),e.jsx("p",{children:`The key insight about the agent loop is that the conversation history is the agent's working memory. Every observation from every previous cycle is readable by the model in the current cycle. This means the agent's effective "state" grows with each iteration — it knows more and more about the task, the environment, and what has already been tried.`}),e.jsx("p",{children:"This accumulation is also a cost driver: each API call includes the entire history so far, so token consumption grows roughly quadratically with the number of steps. Long-running agents need strategies for managing context size: summarizing earlier steps, removing redundant observations, or offloading detailed information to external memory."}),e.jsx(n,{type:"intuition",title:"The history IS the agent's state machine",children:'Unlike traditional software where state is held in variables, the agent loop holds all state in the message history. Adding a tool result to history is equivalent to updating a variable. The model "reads" state by seeing the history; it "writes" state by calling tools whose results get appended. This immutable-append pattern makes agent execution naturally replayable and debuggable — you can reconstruct exactly what the agent knew at any point by reading the history up to that message.'}),e.jsx("h2",{children:"Implementing the Full Loop"}),e.jsx("p",{children:"The example below implements the complete perceive → reason → act → observe cycle with explicit logging of each phase. Two tools simulate an industrial monitoring scenario: reading sensors (perceive the environment) and taking actions (affect the environment)."}),e.jsx(t,{title:"Perceive → Reason → Act → Observe Loop",tabs:{python:u,typescript:h}}),e.jsx(a,{title:"Context window limits in long loops",children:"Each cycle appends tool results to the history. On long tasks the accumulated history may approach the model's context window limit, causing truncation or API errors. Monitor the token count of your messages array (available in the usage field of the API response) and implement summarization or truncation strategies before the limit is reached."}),e.jsx("h2",{children:"Parallelizing Actions Within a Cycle"}),e.jsx("p",{children:"When the model emits multiple tool_use blocks in a single response, those tool calls can be executed concurrently rather than serially. All results should then be returned as a single user-turn message containing multiple tool_result blocks. This pattern can significantly reduce wall-clock latency for tasks that involve many independent lookups or API calls in a single reasoning step."}),e.jsx(n,{type:"tip",title:"Parallel tool execution",children:"When you receive multiple tool_use blocks in a single assistant response, execute them concurrently (e.g., with asyncio.gather in Python or Promise.all in TypeScript) and return all results in one tool-result message. This is both more efficient and correct — the model expects all results from a batch of tool calls to arrive together before continuing its reasoning."})]})}const U=Object.freeze(Object.defineProperty({__proto__:null,default:p},Symbol.toStringTag,{value:"Module"})),m=`from anthropic import Anthropic
import json
import math

client = Anthropic()

# ── Tool definitions (schemas the model uses to decide when/how to call) ──────
tools = [
    {
        "name": "get_weather",
        "description": (
            "Retrieve current weather conditions for a city. "
            "Returns temperature (Celsius), humidity (%), and a short description."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "City name, e.g. 'London' or 'Tokyo'"
                },
                "units": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature unit. Defaults to celsius."
                }
            },
            "required": ["city"]
        }
    },
    {
        "name": "calculate",
        "description": "Evaluate a safe arithmetic expression and return the numeric result.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Arithmetic expression using +, -, *, /, **, sqrt(), e.g. 'sqrt(144) + 2**8'"
                }
            },
            "required": ["expression"]
        }
    }
]

# ── Tool implementations ───────────────────────────────────────────────────────

def get_weather(city: str, units: str = "celsius") -> dict:
    """Simulated weather service."""
    weather_db = {
        "london":  {"temp_c": 12, "humidity": 78, "desc": "overcast clouds"},
        "tokyo":   {"temp_c": 24, "humidity": 55, "desc": "partly cloudy"},
        "sydney":  {"temp_c": 21, "humidity": 62, "desc": "sunny"},
    }
    data = weather_db.get(city.lower())
    if not data:
        return {"error": f"No weather data for '{city}'"}

    temp = data["temp_c"]
    if units == "fahrenheit":
        temp = round(temp * 9 / 5 + 32, 1)
        unit_label = "°F"
    else:
        unit_label = "°C"

    return {
        "city": city,
        "temperature": f"{temp}{unit_label}",
        "humidity": f"{data['humidity']}%",
        "description": data["desc"]
    }

def calculate(expression: str) -> str:
    """Safe arithmetic evaluator using a restricted namespace."""
    safe_names = {
        "sqrt": math.sqrt, "abs": abs, "round": round,
        "pi": math.pi, "e": math.e
    }
    try:
        result = eval(expression, {"__builtins__": {}}, safe_names)
        return str(result)
    except Exception as exc:
        return f"Error evaluating expression: {exc}"

# ── Tool dispatcher ────────────────────────────────────────────────────────────

def execute_tool(name: str, inputs: dict) -> str:
    """Route a tool call to its implementation and serialize the result."""
    if name == "get_weather":
        result = get_weather(inputs["city"], inputs.get("units", "celsius"))
        return json.dumps(result)
    if name == "calculate":
        return calculate(inputs["expression"])
    return json.dumps({"error": f"Unknown tool: {name}"})

# ── Agent loop ─────────────────────────────────────────────────────────────────

def agent_with_tools(user_query: str) -> str:
    messages = [{"role": "user", "content": user_query}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )

        # Append assistant turn
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Done."

        # Execute all tool calls and collect results
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                raw_result = execute_tool(block.name, block.input)
                print(f"Tool: {block.name}  Input: {block.input}  Result: {raw_result}")
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": raw_result          # always a string
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

# Example
answer = agent_with_tools(
    "What's the weather like in Tokyo and London? "
    "Also, what is the square root of the sum of their temperatures in Celsius?"
)
print(answer)`,g=`import Anthropic from "@anthropic-ai/sdk";
import * as math from "mathjs"; // npm install mathjs

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "get_weather",
    description:
      "Retrieve current weather conditions for a city. " +
      "Returns temperature, humidity, and a short description.",
    input_schema: {
      type: "object" as const,
      properties: {
        city: { type: "string", description: "City name, e.g. 'Tokyo'" },
        units: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Temperature unit. Defaults to celsius.",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "calculate",
    description: "Evaluate a safe arithmetic expression and return the result.",
    input_schema: {
      type: "object" as const,
      properties: {
        expression: {
          type: "string",
          description: "Arithmetic expression, e.g. 'sqrt(144) + 2^8'",
        },
      },
      required: ["expression"],
    },
  },
];

type WeatherData = { city: string; temperature: string; humidity: string; description: string };

const weatherDb: Record<string, { temp_c: number; humidity: number; desc: string }> = {
  london: { temp_c: 12, humidity: 78, desc: "overcast clouds" },
  tokyo:  { temp_c: 24, humidity: 55, desc: "partly cloudy" },
  sydney: { temp_c: 21, humidity: 62, desc: "sunny" },
};

function getWeather(city: string, units = "celsius"): WeatherData | { error: string } {
  const data = weatherDb[city.toLowerCase()];
  if (!data) return { error: No weather data for '\${city}' };
  let temp = data.temp_c;
  let unitLabel = "°C";
  if (units === "fahrenheit") { temp = Math.round(temp * 9 / 5 + 32 * 10) / 10; unitLabel = "°F"; }
  return { city, temperature: \${temp}\${unitLabel}, humidity: \${data.humidity}%, description: data.desc };
}

function calculate(expression: string): string {
  try {
    return String(math.evaluate(expression));
  } catch (e) {
    return Error: \${(e as Error).message};
  }
}

function executeTool(name: string, inputs: Record<string, string>): string {
  if (name === "get_weather") return JSON.stringify(getWeather(inputs.city, inputs.units));
  if (name === "calculate") return calculate(inputs.expression);
  return JSON.stringify({ error: Unknown tool: \${name} });
}

async function agentWithTools(userQuery: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userQuery }];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      return textBlock && "text" in textBlock ? textBlock.text : "Done.";
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inputs = block.input as Record<string, string>;
        const result = executeTool(block.name, inputs);
        console.log(Tool: \${block.name}  Result: \${result});
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }
}

agentWithTools(
  "What's the weather in Tokyo and London? " +
  "Also compute the square root of the sum of their temperatures in Celsius."
).then(console.log);`;function f(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Tool Use & Function Calling"}),e.jsx("p",{children:"A language model on its own can only read and write text. Tool use — also called function calling — is the mechanism that allows an agent to reach outside that boundary: retrieve live data, perform precise computation, modify state in external systems, and take actions with real-world consequences. Understanding exactly how tool invocation works, how results flow back into the reasoning loop, and how to design the tool layer for reliability is central to building effective agents."}),e.jsx(s,{term:"Function Calling (Tool Use)",tag:"Core Mechanism",children:"Function calling is a structured API capability that allows a language model to emit a typed, machine-readable request to invoke an external function rather than producing plain text. The model selects a function from a set of schemas defined by the developer, fills in the required parameters based on its current reasoning, and signals that the application layer should execute the call. The result is fed back into the conversation as an observation, completing one perceive-act-observe cycle."}),e.jsx("h2",{children:"Anatomy of a Tool Definition"}),e.jsx("p",{children:"Every tool exposed to the model has three required parts that the model reads before deciding whether and how to invoke it."}),e.jsx("h3",{children:"Name"}),e.jsx("p",{children:"The tool name is a short, unambiguous identifier. The model uses the name in its tool_use output to specify which tool it is calling. Names should be descriptive enough that the model can infer the tool's purpose even without reading the description: get_weather, search_database, send_email, run_python are all clear. Avoid generic names like tool_1 or helper that give the model no signal about purpose."}),e.jsx("h3",{children:"Description"}),e.jsx("p",{children:"The description is the model's guide for when and how to use the tool. It should explain what the tool does, what kind of input it expects, what it returns, and any important behavioral caveats — such as rate limits, side effects, or cases where the tool will fail. A good description is 1–3 sentences and reads like documentation written for an intelligent developer who needs to decide whether this tool is appropriate for their current subtask."}),e.jsx("h3",{children:"Input Schema"}),e.jsx("p",{children:"The input schema is a JSON Schema object that defines the parameters the tool accepts. It should specify each parameter's type, a clear description, any constraints (enum values, numeric ranges), and which parameters are required versus optional. The model uses the schema to fill in correct values and to understand when a parameter should be omitted. A well-designed schema dramatically reduces hallucinated or malformed tool inputs."}),e.jsx("h2",{children:"The Tool Call Lifecycle"}),e.jsx("p",{children:"Understanding the complete lifecycle of a tool call helps in building robust error handling and debugging failures."}),e.jsx("h3",{children:"Step 1: Schema Injection"}),e.jsx("p",{children:"Tool definitions are included in the API request alongside the messages. The model reads these definitions as part of its context — they are not hidden from its reasoning. This means the model can reason about which tools are available and what each can do before deciding to invoke any of them."}),e.jsx("h3",{children:"Step 2: Tool Selection and Parameter Filling"}),e.jsx("p",{children:"When the model decides to call a tool, it emits a tool_use content block in its response. This block contains the tool name, a unique tool_use_id, and the input object populated according to the schema. The model may emit multiple tool_use blocks in a single response when it determines that several tool calls can be made in parallel."}),e.jsx("h3",{children:"Step 3: Application-Layer Execution"}),e.jsx("p",{children:"The application code — not the model — actually executes the tool. This is a critical security boundary. The model only specifies what it wants done; the application decides whether to allow it, validates the inputs, executes the call, and catches errors. The model never runs arbitrary code directly."}),e.jsx("h3",{children:"Step 4: Result Serialization"}),e.jsx("p",{children:"Tool results must be serialized to a string before being returned to the model. JSON is the standard format for structured results. The result is wrapped in a tool_result content block that references the original tool_use_id, and this block is included in a user-turn message appended to the conversation history."}),e.jsx("h3",{children:"Step 5: Result Integration"}),e.jsx("p",{children:"On the next API call, the model reads the tool result as part of its updated context. The tool_use_id linkage allows it to correlate each result with the specific call that produced it, even when multiple tools were called in parallel. The model can now reason about what it learned from the observation and decide what to do next."}),e.jsx(r,{title:"Always return string content from tools",children:"The tool_result content field must be a string. Serialize all structured data to JSON before returning it. Include error information in the returned string rather than raising exceptions that the agent loop cannot handle — the model can reason about and recover from a JSON error object, but it cannot recover from an unhandled exception that terminates the loop."}),e.jsx("h2",{children:"Error Handling in Tool Results"}),e.jsx("p",{children:"How you represent errors in tool results has a large impact on the agent's ability to recover. There are two approaches."}),e.jsx("h3",{children:"Descriptive String Errors"}),e.jsx("p",{children:`Return a clear, human-readable error message as the tool result content. For example: "Error: file 'config.yaml' not found in /etc or /home/user. Check that the filename is correct and the path exists." The model can read this, understand what went wrong, and try a different approach.`}),e.jsx("h3",{children:"Structured Error Objects"}),e.jsxs("p",{children:['Return a JSON object with an "error" field and optionally a "code" field for programmatic handling. For example: ',e.jsx("code",{children:'&lbrace;"error": "rate_limit_exceeded", "retry_after": 30&rbrace;'}),". This allows the model to reason about the specific error type and potentially handle it differently — for instance, noting that it should wait before retrying."]}),e.jsx(o,{name:"Graceful Tool Error Handling",category:"Reliability",whenToUse:"Any tool that can fail — network calls, file I/O, database queries. Wrap tool implementations in try/except blocks and always return a descriptive error string rather than propagating exceptions up to the agent loop.",children:"Catch all exceptions within the tool executor and return them as informative string results. The model can reason about tool failures and self-correct; an unhandled exception that crashes the loop cannot be recovered from without restarting the entire task."}),e.jsx("h2",{children:"Parallel Tool Execution"}),e.jsx("p",{children:"When the model emits multiple tool_use blocks in a single response, those calls are independent — their results do not depend on each other. Execute them concurrently and return all results in a single user-turn message with multiple tool_result blocks. This is both semantically correct (the model expects them together) and more efficient (parallel network calls reduce wall-clock latency significantly)."}),e.jsx(n,{type:"tip",title:"Detect and exploit parallel tool calls",children:"After extracting tool_use blocks from a response, check whether there are multiple. If so, use concurrent execution — asyncio.gather in Python, Promise.all in TypeScript — rather than a sequential loop. The time savings compound quickly: a task that makes 3 independent API calls with 500ms each takes 500ms in parallel vs. 1500ms serially."}),e.jsx("h2",{children:"Full Example: Weather and Calculation Agent"}),e.jsx("p",{children:"The example below builds an agent with two tools: a simulated weather service and an arithmetic evaluator. It demonstrates the complete tool lifecycle: schema definition, tool dispatch, result serialization, and feeding results back into the reasoning loop."}),e.jsx(t,{title:"Tool Use: Weather Agent with Parallel Tool Calls",tabs:{python:m,typescript:g}}),e.jsx(a,{title:"Validate all model-supplied tool inputs",children:"Never trust inputs provided by the model without validation. The model may occasionally produce inputs that do not match the schema — wrong types, unexpected values, or missing required fields. Validate against the schema in your tool dispatcher before passing inputs to the implementation. This is especially important for tools with side effects like database writes, emails, or API calls that cannot be undone."}),e.jsx("h2",{children:"Tool Result Quality Principles"}),e.jsx("p",{children:"The format and content of tool results directly affect how well the agent reasons. Several principles apply across all tools."}),e.jsx("h3",{children:"Return Structured Data, Not Prose"}),e.jsxs("p",{children:["JSON objects are easier for the model to parse and reason about than natural-language sentences. Return ",e.jsx("code",{children:'&lbrace;"temperature": "24°C", "humidity": "55%"&rbrace;'}),' rather than "The temperature in Tokyo is 24 degrees Celsius with 55% humidity." The model can handle both, but structured data reduces the chance of misparse.']}),e.jsx("h3",{children:"Include Relevant Metadata"}),e.jsx("p",{children:"Include any information that might affect how the model should interpret or act on the result: timestamps for data freshness, units for numeric values, source identifiers for attribution, and status codes for distinguishing success from partial results."}),e.jsx("h3",{children:"Keep Results Concise"}),e.jsx("p",{children:"Every token in a tool result consumes context window space and is paid for on the next API call. Return only the information the model needs. If a search API returns 10,000 words of results but only the top 3 snippets are relevant, extract and return just those snippets."})]})}const B=Object.freeze(Object.defineProperty({__proto__:null,default:f},Symbol.toStringTag,{value:"Module"})),y=`from anthropic import Anthropic
import json

client = Anthropic()

# Define tools
tools = [
    {
        "name": "calculator",
        "description": "Perform mathematical calculations. Use this for arithmetic, not estimates.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {"type": "string", "description": "Mathematical expression to evaluate, e.g., '2 + 2 * 3'"}
            },
            "required": ["expression"]
        }
    },
    {
        "name": "search",
        "description": "Search for information. Returns a simulated search result.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            },
            "required": ["query"]
        }
    }
]

def execute_tool(name: str, inputs: dict) -> str:
    if name == "calculator":
        try:
            result = eval(inputs["expression"])  # Use a safe evaluator in production
            return f"Result: {result}"
        except Exception as e:
            return f"Error: {str(e)}"
    elif name == "search":
        return f"Search results for '{inputs['query']}': [Simulated result about {inputs['query']}]"
    return "Unknown tool"

def react_agent(question: str, max_steps: int = 5) -> str:
    messages = [{"role": "user", "content": question}]

    for step in range(max_steps):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )

        # Add assistant response to history
        messages.append({"role": "assistant", "content": response.content})

        # Check if done (no tool calls)
        if response.stop_reason == "end_turn":
            # Extract final text answer
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "No answer found"

        # Execute tool calls (the "Action" in ReAct)
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

    return "Max steps reached without answer"

# Example usage
answer = react_agent("What is 15% of 847 + the square root of 144?")
print(answer)`;function b(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"The ReAct Pattern: Reasoning and Acting Together"}),e.jsx("p",{children:"Early approaches to LLM tool use sent the model a list of tools and let it call them directly, without any visible reasoning in between. The model read the question, picked a tool, received the result, and either called another tool or produced an answer. This works for simple tasks, but it is brittle for anything multi-step: when the agent makes a wrong turn, there is no record of why it made that choice, making debugging nearly impossible and self-correction unlikely."}),e.jsx("p",{children:"ReAct, introduced by Yao et al. in 2022, addresses this by interleaving explicit reasoning traces with action steps. Before taking any action, the model writes out its current understanding of the problem, what it needs to find out, and why it is choosing a particular tool. This reasoning becomes part of the conversation history, giving the model a structured record to refer back to, and giving developers a window into the agent's decision process."}),e.jsx(s,{title:"ReAct (Reasoning + Acting)",definition:"ReAct is an agent prompting pattern that structures the agent's behavior as an alternating sequence of Thought, Action, and Observation steps. In the Thought step, the model reasons about the current state of the problem. In the Action step, it calls a tool or produces a final answer. In the Observation step, the result of the tool call is fed back. This cycle repeats until the model determines the task is complete. The name is a portmanteau of 'Reasoning' and 'Acting'."}),e.jsx(o,{name:"ReAct Pattern",category:"Reasoning",description:"Structure agent behavior as an explicit Thought → Action → Observation loop. The Thought step forces the model to articulate its reasoning before committing to an action, improving accuracy on multi-step tasks and making failure modes observable.",when:["The task requires multiple sequential tool calls where each depends on the previous result","You need to debug why an agent is making particular decisions","The task benefits from self-correction — the agent may need to revise its approach mid-task","You want the agent to explain its reasoning to users alongside its final answer","The problem space is complex enough that direct action-selection without reasoning leads to errors"],avoid:["Simple single-tool calls where the action is obvious from the question","High-latency-sensitive paths where the extra reasoning tokens add unacceptable overhead","Tasks where verbose reasoning output is unwanted by downstream consumers"]}),e.jsx("h2",{children:"The Thought-Action-Observation Loop"}),e.jsx("p",{children:"Understanding the ReAct loop precisely helps both in implementing it and in diagnosing failures when they occur."}),e.jsx(i,{direction:"vertical",steps:["Thought","Action","Observation","Thought (next iteration)"],description:"The ReAct loop: the model thinks about the current state, takes an action (tool call or final answer), receives an observation (tool result), and thinks again. The loop continues until the model produces a final answer."}),e.jsx("h3",{children:"Thought"}),e.jsx("p",{children:"The Thought step is the model's internal monologue. It synthesizes what has been observed so far, identifies what information is still missing, and reasons about what action will move the task forward. In modern implementations using the Anthropic SDK, this reasoning happens naturally in the model's response — Claude will produce text before tool calls explaining what it is about to do and why. This text is captured in the conversation history as the model's reasoning trace."}),e.jsx("h3",{children:"Action"}),e.jsx("p",{children:"The Action step is a concrete, executable step. In tool-using agents this is a tool call with specific parameters. In the original ReAct formulation for text-generation models, actions were formatted as specially tagged text. In modern SDK-based implementations, the model's tool use mechanism handles this naturally — when the model emits a tool call block, that is the Action."}),e.jsx("h3",{children:"Observation"}),e.jsx("p",{children:"The Observation is the result returned by executing the action. A calculator tool returns a number. A search tool returns a list of snippets. A file reader returns file contents. This observation is appended to the conversation history as a tool result, and the model reads it in the next Thought step. The quality of observations — whether they are clear, informative, and structured — has a large effect on the agent's ability to reason about what it learned."}),e.jsx("h2",{children:"Why ReAct Outperforms Pure Action-Taking"}),e.jsx("p",{children:"Empirically, interleaving reasoning with actions improves task accuracy on complex multi- step problems. There are three mechanisms behind this."}),e.jsx("h3",{children:"Reasoning Guides Action Selection"}),e.jsx("p",{children:'When the model writes out its understanding of the problem before calling a tool, it engages a process similar to chain-of-thought reasoning, which is known to improve accuracy on reasoning-heavy tasks. The act of articulating "I need to find X before I can compute Y" helps the model stay on track rather than jumping directly to an action that may address a different sub-problem.'}),e.jsx("h3",{children:"Reasoning Enables Self-Correction"}),e.jsx("p",{children:"When a tool returns an unexpected result or an error, the model's next Thought step can notice the discrepancy between what it expected and what it received, reason about what went wrong, and try a corrected approach. Without the reasoning trace, the model has less context for recognizing and recovering from failures."}),e.jsx("h3",{children:"Reasoning Provides Debugging Visibility"}),e.jsx("p",{children:"When an agent fails silently — arriving at a wrong answer without any error — the reasoning trace is the primary diagnostic tool. A developer reading the trace can identify where the model's reasoning diverged from the correct path, which tool inputs were wrong, and which observations were misinterpreted."}),e.jsx("h2",{children:"A ReAct Trace Example"}),e.jsx("p",{children:'To make the pattern concrete, here is what a ReAct trace looks like for the question: "What is 15% of 847 plus the square root of 144?"'}),e.jsxs("p",{children:[e.jsx("strong",{children:"Thought 1:"})," I need to compute two things and add them: 15% of 847, and the square root of 144. I'll calculate 15% of 847 first using the calculator."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Action 1:"}),' calculator(expression="847 * 0.15")']}),e.jsxs("p",{children:[e.jsx("strong",{children:"Observation 1:"})," Result: 127.05"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Thought 2:"})," 15% of 847 is 127.05. Now I need the square root of 144."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Action 2:"}),' calculator(expression="144 ** 0.5")']}),e.jsxs("p",{children:[e.jsx("strong",{children:"Observation 2:"})," Result: 12.0"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Thought 3:"})," The square root of 144 is 12. Now I add the two results: 127.05 + 12.0 = 139.05."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Final Answer:"})," 15% of 847 is 127.05, and the square root of 144 is 12. Adding them together gives 139.05."]}),e.jsx("p",{children:"Each Thought step shows the model's current understanding. Each Action step is directly motivated by the preceding Thought. Each Observation updates the model's knowledge. The trace is self-documenting: anyone reading it can follow the reasoning and verify each step."}),e.jsx("h2",{children:"Common Pitfalls"}),e.jsx("h3",{children:"Reasoning Loops"}),e.jsx("p",{children:"An agent can get stuck in a loop where it repeatedly reasons about the same problem without making progress, especially when a tool returns an ambiguous or unhelpful result. Mitigation strategies include a maximum step count, explicit instructions to move to a best-effort answer when stuck, and careful tool return format design to minimize ambiguity."}),e.jsx("h3",{children:"Action Failures Cascading"}),e.jsx("p",{children:'If a tool call fails and the model does not correctly identify the failure from the observation, it may proceed to the next step with an incorrect belief about the state of the world. Tool implementations should return clear, unambiguous error messages rather than empty strings or silent failures. The model can recover from a "File not found: config.yaml" error much better than from an empty response.'}),e.jsx("h3",{children:"Over-Reasoning"}),e.jsx("p",{children:'On simple tasks, verbose reasoning can add latency and cost without improving accuracy. The model may also talk itself into incorrect conclusions through long reasoning chains on straightforward problems — sometimes called "overthinking." Keep system prompts focused and avoid over-prompting the reasoning style for simple tool interactions.'}),e.jsx(a,{title:"eval() in production code",content:"The calculator tool in the example below uses Python's built-in eval() for brevity. In any real application, eval() on user-supplied or model-supplied expressions is a serious security vulnerability — it can execute arbitrary code. Use a dedicated safe math expression parser such as the 'simpleeval' library, 'asteval', or restrict inputs to a whitelist of allowed operations."}),e.jsx(n,{title:"ReAct reasoning is implicit in modern Claude implementations",content:"When you use the Anthropic SDK with tool definitions, Claude naturally exhibits ReAct-like behavior: it produces reasoning text before and between tool calls without requiring you to explicitly instruct it to 'think step by step.' The conversation history captures this reasoning as part of the message content blocks. You can inspect the text blocks in the assistant's response to see the model's reasoning trace at any step in the loop."}),e.jsx("h2",{children:"Implementing a ReAct Agent"}),e.jsx("p",{children:"The implementation below builds a ReAct agent with two tools: a calculator and a simulated search. The agent loop follows the standard pattern: send the current conversation to the model, check if it wants to use a tool, execute the tool and append the result, and repeat until the model produces a final text answer."}),e.jsx(t,{title:"ReAct Agent with Calculator and Search Tools",language:"python",code:y,description:"A complete ReAct agent implementation using the Anthropic SDK. The agent can reason through multi-step problems by interleaving thought, tool calls, and observations in a loop bounded by a maximum step count."}),e.jsx("p",{children:`Notice that the code does not explicitly inject any "Thought:" prefix or force a specific output format. Claude will naturally produce reasoning text before tool calls when working through multi-step problems. The ReAct pattern is present in the agent's behavior even though it is not mechanically enforced by the implementation.`}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"max_steps"})," parameter is your safety valve against infinite loops. Set it based on the expected complexity of your task: a task that typically requires 2–3 tool calls might have a limit of 8–10 to allow for retries and error recovery, while still preventing runaway execution. Reaching the step limit should be treated as a failure signal in production, not silently swallowed — it likely indicates a tool failure, an ambiguous task specification, or a prompt engineering problem to investigate."]})]})}const D=Object.freeze(Object.defineProperty({__proto__:null,default:b},Symbol.toStringTag,{value:"Module"})),x=`from anthropic import Anthropic

client = Anthropic()

SYSTEM_PROMPT = """You are a careful analytical assistant. When given a problem,
think through it step by step before providing your final answer.

Structure your response as:
1. Break down what the problem is asking
2. Identify the relevant facts or constraints
3. Work through the reasoning step by step
4. State your conclusion clearly

Always show your work — do not skip steps even if they seem obvious."""

def chain_of_thought(question: str) -> dict:
    """
    Elicit chain-of-thought reasoning from Claude.
    Returns both the full reasoning trace and the final answer.
    """
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": question}]
    )

    full_text = response.content[0].text

    # In production you might parse out the reasoning vs answer sections
    return {
        "reasoning_trace": full_text,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens
    }

# ── Extended example: CoT before a tool call ──────────────────────────────────

import json

tools = [
    {
        "name": "execute_sql",
        "description": (
            "Execute a read-only SQL query on the analytics database and "
            "return results as a JSON array of row objects."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Valid SQL SELECT statement"},
                "reasoning": {
                    "type": "string",
                    "description": (
                        "Explain why this query answers the user's question "
                        "and confirm it is read-only and safe to run."
                    )
                }
            },
            "required": ["query", "reasoning"]
        }
    }
]

def simulated_sql(query: str) -> list:
    """Simulate an analytics database."""
    if "revenue" in query.lower():
        return [
            {"month": "Jan", "revenue": 142000},
            {"month": "Feb", "revenue": 158000},
            {"month": "Mar", "revenue": 171000},
        ]
    return [{"result": "no data"}]

def cot_before_tool(user_request: str) -> str:
    """
    Agent that requires the model to write its reasoning into a 'reasoning'
    field before executing any tool — a lightweight CoT enforcement pattern.
    """
    messages = [{"role": "user", "content": user_request}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            tools=tools,
            messages=messages
        )

        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Done."

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                # Log the reasoning the model provided
                reasoning = block.input.get("reasoning", "(no reasoning provided)")
                print(f"Model reasoning: {reasoning}")
                print(f"Executing: {block.input['query']}")

                rows = simulated_sql(block.input["query"])
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(rows)
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

# Basic CoT
result = chain_of_thought(
    "A train leaves Station A at 9:00 AM traveling at 80 km/h. "
    "Another train leaves Station B (320 km away) at 10:00 AM traveling at 100 km/h toward Station A. "
    "At what time do they meet?"
)
print(result["reasoning_trace"])

# CoT embedded in tool schema
answer = cot_before_tool("Show me monthly revenue for Q1 and calculate the average.")
print(answer)`,w=`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = You are a careful analytical assistant. When given a problem,
think through it step by step before providing your final answer.

Structure your response as:
1. Break down what the problem is asking
2. Identify the relevant facts or constraints
3. Work through the reasoning step by step
4. State your conclusion clearly

Always show your work — do not skip steps even if they seem obvious.;

async function chainOfThought(question: string): Promise<{
  reasoningTrace: string;
  inputTokens: number;
  outputTokens: number;
}> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: question }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const fullText = textBlock && "text" in textBlock ? textBlock.text : "";

  return {
    reasoningTrace: fullText,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

// ── CoT enforced through tool schema ─────────────────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: "execute_sql",
    description:
      "Execute a read-only SQL query on the analytics database. " +
      "Returns a JSON array of row objects.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Valid SQL SELECT statement" },
        reasoning: {
          type: "string",
          description:
            "Explain why this query answers the question and confirm it is read-only.",
        },
      },
      required: ["query", "reasoning"],
    },
  },
];

function simulatedSql(query: string): object[] {
  if (query.toLowerCase().includes("revenue")) {
    return [
      { month: "Jan", revenue: 142000 },
      { month: "Feb", revenue: 158000 },
      { month: "Mar", revenue: 171000 },
    ];
  }
  return [{ result: "no data" }];
}

async function cotBeforeTool(userRequest: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userRequest },
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      return textBlock && "text" in textBlock ? textBlock.text : "Done.";
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inputs = block.input as { query: string; reasoning: string };
        console.log(Model reasoning: \${inputs.reasoning});
        console.log(Executing: \${inputs.query});
        const rows = simulatedSql(inputs.query);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(rows),
        });
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }
}

// Basic CoT
chainOfThought(
  "A train leaves Station A at 9:00 AM at 80 km/h. " +
    "Another leaves Station B (320 km away) at 10:00 AM at 100 km/h toward Station A. " +
    "When do they meet?"
).then((r) => console.log(r.reasoningTrace));

// CoT in tool schema
cotBeforeTool(
  "Show me monthly revenue for Q1 and calculate the average."
).then(console.log);`;function _(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Chain-of-Thought Reasoning"}),e.jsx("p",{children:"Language models are trained to predict the next token given the preceding context. When a model is asked a complex question and told to answer immediately, it must compress all intermediate reasoning into a single prediction step — a process known to reduce accuracy on tasks that require multiple logical or arithmetic steps. Chain-of-thought prompting addresses this by encouraging the model to externalize its intermediate reasoning as text before producing a final answer."}),e.jsx(s,{term:"Chain-of-Thought (CoT)",tag:"Reasoning Technique",children:'Chain-of-thought prompting is a technique that elicits step-by-step reasoning from a language model before it commits to a final answer. By instructing the model to "think aloud" — writing out intermediate reasoning steps as natural language — CoT enables the model to solve problems that would be incorrect if answered immediately. The visible reasoning trace also makes failures diagnosable and outputs auditable.'}),e.jsx("h2",{children:"Why CoT Improves Accuracy"}),e.jsx("p",{children:"Three complementary mechanisms explain why externalizing reasoning improves model performance on complex tasks."}),e.jsx("h3",{children:"Decomposition"}),e.jsx("p",{children:'Writing out "step 1: identify the constraint" forces the model to break a complex problem into smaller sub-problems, each of which is easier to solve independently. The result of each sub-problem then becomes context for the next, rather than requiring the model to hold all intermediate values implicitly in its activation state.'}),e.jsx("h3",{children:"Error Detection"}),e.jsx("p",{children:'Intermediate steps are individually verifiable. When the model writes "speed = distance / time = 320 / 80 = 4 hours" as an explicit step, it — and any reviewer — can check that arithmetic directly. If the value is wrong, subsequent reasoning built on it is also wrong and visibly so. Without CoT, an error might be invisible until the final answer is checked.'}),e.jsx("h3",{children:"Attention Guidance"}),e.jsx("p",{children:`Generating the reasoning text shifts the model's attention distribution. When the model writes "the key constraint is that the second train departs one hour later," it is creating a token that receives attention from all subsequent generation steps. This keeps important facts in effective context longer than they would be if they appeared only in the original question.`}),e.jsx("h2",{children:"Prompting Strategies"}),e.jsx("h3",{children:"Zero-Shot CoT"}),e.jsx("p",{children:`The simplest approach: append "Think step by step" or "Let's reason through this carefully" to the user's question. This works surprisingly well for frontier models. Claude will typically produce structured reasoning even without detailed instructions, because step-by-step analysis is a well-represented pattern in its training data.`}),e.jsx("h3",{children:"Structured System Prompt"}),e.jsx("p",{children:"A more controlled approach is to define the reasoning structure in the system prompt: instruct the model to first identify the question type, then list relevant facts, then work through each step, then state a conclusion. This produces more consistent output format across many different questions and is easier to parse programmatically."}),e.jsx("h3",{children:"Few-Shot CoT"}),e.jsx("p",{children:"Providing one or more worked examples in the prompt demonstrates the desired reasoning style concretely. Few-shot examples are especially useful when the task has a distinctive structure — a domain-specific calculation, a legal analysis framework, a particular debugging methodology — that is difficult to specify in prose instructions alone."}),e.jsx("h3",{children:"CoT Embedded in Tool Schemas"}),e.jsx("p",{children:'For agents, a powerful pattern is to add a "reasoning" or "plan" field to tool schemas and mark it required. The model is forced to write its reasoning into this field before any tool invocation. This serves three purposes: it elicits CoT naturally within the existing tool-use flow; it makes the reasoning observable and loggable; and it gives downstream reviewers a record of why each tool was invoked.'}),e.jsx(o,{name:"Reasoning Field in Tool Schema",category:"Reasoning",whenToUse:"Any agent that invokes consequential tools — database writes, external API calls, code execution, or financial transactions. Requiring the model to articulate its reasoning before acting reduces impulsive or incorrect tool use and provides an audit trail.",children:'Add a required "reasoning" string field to tool schemas. The model must explain why it is invoking the tool and what it expects the result to accomplish before the call is executed. This is CoT applied directly to the act phase of the agent loop.'}),e.jsx("h2",{children:"Extended Thinking"}),e.jsx("p",{children:'Claude supports an "extended thinking" mode in which the model generates a private internal reasoning trace before producing its visible response. This trace is not shown to users by default but is available to developers for inspection. Extended thinking is especially effective for complex reasoning tasks — mathematics, multi-step logic, and long-horizon planning — where the model benefits from substantial scratch-pad space that does not inflate the visible response length.'}),e.jsx(n,{type:"tip",title:"Extended thinking vs. explicit CoT",children:"Extended thinking produces reasoning in a separate, invisible block before the response. Explicit CoT (via system prompt) produces reasoning as part of the visible response. Use extended thinking when you want the benefits of CoT without including the reasoning in the output the user sees. Use explicit CoT when you want to surface the reasoning to users, log it for audit purposes, or parse it programmatically."}),e.jsx("h2",{children:"Parsing CoT Outputs"}),e.jsx("p",{children:'When CoT produces structured output, you may want to separate the reasoning trace from the final answer for downstream processing. Common approaches include using XML tags (instructing the model to wrap its reasoning in <reasoning> tags and its answer in <answer> tags) or defining a JSON output schema with separate "thinking" and "answer" fields. Either approach allows you to store the reasoning trace for audit while delivering only the final answer to end users.'}),e.jsx(r,{title:"Log reasoning traces in production",children:"Even if end users never see the chain-of-thought, always log it in production systems. Reasoning traces are your primary diagnostic tool when an agent produces a wrong answer. They tell you exactly where the reasoning diverged — an incorrect assumption, a misread tool result, a logical error — in a way that the final answer alone never can."}),e.jsx("h2",{children:"Implementation Examples"}),e.jsx("p",{children:"The following example demonstrates two CoT patterns: a straightforward step-by-step system prompt for analytical questions, and a tool schema with a required reasoning field that enforces CoT before SQL execution."}),e.jsx(t,{title:"Chain-of-Thought: System Prompt and Tool Schema Patterns",tabs:{python:x,typescript:w}}),e.jsx("h2",{children:"CoT Limitations and Failure Modes"}),e.jsx("h3",{children:"Unfaithful Reasoning"}),e.jsx("p",{children:"The reasoning trace a model produces may not accurately reflect how it actually arrived at its answer. Research has shown that models sometimes confabulate plausible-sounding reasoning for answers they reached through other mechanisms. Treat CoT traces as useful diagnostic signals, not ground truth about the model's internal computation."}),e.jsx("h3",{children:"Verbose Outputs"}),e.jsx("p",{children:'On simple tasks, chain-of-thought adds tokens without improving accuracy. A question like "what is the capital of France?" does not benefit from step-by-step reasoning. Use CoT selectively — it is most valuable for tasks with multiple steps, calculations, or reasoning under uncertainty.'}),e.jsx("h3",{children:"Overthinking"}),e.jsx("p",{children:"Occasionally a model will talk itself into an incorrect answer through an overly elaborate reasoning chain that introduces incorrect steps. If CoT is degrading accuracy on a class of tasks, consider switching to a more constrained output format or using extended thinking (which may self-correct) instead of explicit verbose CoT."}),e.jsx(n,{type:"note",title:"CoT is the foundation, not the ceiling",children:"Chain-of-thought is the simplest form of structured reasoning. More advanced patterns — ReAct, tree-of-thought, self-consistency, and deliberate planning — all build on the same core idea: making reasoning explicit improves both accuracy and debuggability. Master CoT before reaching for these more complex techniques."})]})}const z=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"})),k=`from anthropic import Anthropic
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
)`,v=`import Anthropic from "@anthropic-ai/sdk";

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
).then(console.log);`;function j(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Planning Agents"}),e.jsx("p",{children:"Reactive agents — those that decide their next action purely from their current observation — work well for tasks where each step naturally follows from the previous result. But for complex, multi-phase tasks where different sub-goals may be pursued in different orders or in parallel, a planning layer significantly improves efficiency and reliability. Planning agents separate the thinking about what to do from the doing of it, enabling structured task decomposition, explicit dependency management, and better error recovery."}),e.jsx(s,{term:"Planning Agent",tag:"Architecture Pattern",children:"A planning agent separates task execution into two phases: a planning phase in which the model produces a structured representation of the steps required to achieve a goal (including dependencies and expected tool usage), and an execution phase in which those steps are carried out in the correct order. This separation allows the agent to reason globally about the task before acting locally on individual steps."}),e.jsx("h2",{children:"Planning Approaches"}),e.jsx("h3",{children:"Task Decomposition"}),e.jsx("p",{children:"The most common planning approach: given a high-level goal, the planner recursively breaks it into smaller, more concrete sub-tasks until each sub-task maps to a single tool call or a small number of steps. The decomposition can be flat (a linear list of steps) or hierarchical (a tree where each node can itself be decomposed further). Flat decomposition is simpler to implement and debug; hierarchical decomposition handles more complex tasks where some steps are themselves multi-step processes."}),e.jsx("h3",{children:"Goal-Based Planning"}),e.jsx("p",{children:"Rather than specifying the steps, goal-based planning specifies the desired end state and lets the agent reason backward to determine what steps are needed. This approach is more flexible — the agent can find novel paths to the goal — but requires the model to have a strong world model and may produce unexpected paths on unusual goals. It works best for well-constrained domains where the model has good intuitions about what actions lead to what states."}),e.jsx("h3",{children:"Plan-then-Act"}),e.jsx("p",{children:"Plan-then-act is the most commonly implemented pattern in production agents. In a first LLM call the model produces a complete structured plan. In subsequent calls, a separate executor processes each step. Separating planner from executor allows you to validate the plan before executing it, inject human review at the planning stage, and use a lighter-weight model for execution steps once the plan is established."}),e.jsx(l,{title:"Plan-Then-Act Architecture",nodes:[{id:"user",label:"User Goal",type:"external",x:50,y:150},{id:"planner",label:"Planner LLM",type:"llm",x:250,y:150},{id:"plan",label:"Structured Plan",type:"store",x:450,y:150},{id:"executor",label:"Executor Agent",type:"agent",x:650,y:100},{id:"tools",label:"Tools",type:"tool",x:850,y:100},{id:"results",label:"Step Results",type:"store",x:650,y:220}],edges:[{from:"user",to:"planner",label:"goal"},{from:"planner",to:"plan",label:"produces"},{from:"plan",to:"executor",label:"steps"},{from:"executor",to:"tools",label:"invokes"},{from:"tools",to:"results",label:"returns"},{from:"results",to:"executor",label:"feeds next step"}]}),e.jsx("h2",{children:"Structured Plan Representation"}),e.jsx("p",{children:"The plan must be in a format that the execution layer can process programmatically. JSON is the standard choice. A minimal plan schema should include: a unique identifier and description for each step; the tool or agent responsible for executing the step; a list of step IDs that must complete before this step can begin (dependencies); and optionally expected outputs or success criteria. This structure supports both sequential and parallel execution strategies."}),e.jsx(o,{name:"Plan-then-Act",category:"Planning",whenToUse:"Tasks that require more than 5–6 steps, tasks where some steps can run in parallel, tasks where plan validation or human review is required before execution begins, and tasks where the execution model is different (smaller, cheaper) from the planning model.",children:"Separate the planning LLM call from the execution loop. The planner produces a complete structured step list with dependency annotations. The executor processes steps in topological order, running independent steps in parallel. This yields faster execution, cleaner error handling, and the ability to review or modify the plan before any irreversible actions are taken."}),e.jsx("h2",{children:"Handling Plan Failures"}),e.jsx("p",{children:"Plans are predictions about how the world will behave. Real execution frequently diverges from the plan. A step may fail because a required resource is unavailable, a tool returns an unexpected result, or a dependency step produced output that makes a subsequent step unnecessary or impossible. Robust planning agents handle failures in two ways."}),e.jsx("h3",{children:"Step-Level Recovery"}),e.jsx("p",{children:"When a step fails, the executor can attempt a retry, substitute an alternative tool, or mark the step as failed and continue with steps that do not depend on it. The executor should record the failure and its cause in the results so that downstream steps can adapt their behavior."}),e.jsx("h3",{children:"Plan Revision"}),e.jsx("p",{children:"For significant deviations, the executor can invoke the planner again with the current results and the failure information, producing a revised plan that adapts to the new situation. This re-planning adds latency and cost but is essential for tasks where the initial plan is truly invalidated by what was discovered during execution."}),e.jsx(n,{type:"note",title:"Plans are hypotheses, not contracts",children:"Treat every generated plan as a hypothesis about how to achieve the goal given current information. Build your execution layer to handle partial plan completion gracefully. Log which steps succeeded and which failed, and surface this information to users rather than reporting a binary success/failure."}),e.jsx("h2",{children:"Implementation: Plan-then-Act Agent"}),e.jsx("p",{children:"The example below implements a two-phase planning agent. The first phase uses a planner system prompt to generate a JSON step list with dependency annotations. The second phase uses a topological sort to execute steps in the correct order, passing prior results to each dependent step."}),e.jsx(t,{title:"Plan-then-Act Agent with Dependency Tracking",tabs:{python:k,typescript:v}}),e.jsx(r,{title:"Validate plans before execution",children:"Before handing a generated plan to the executor, validate its structure: check that all dependency references point to real step IDs, verify that there are no circular dependencies, and confirm that the plan does not contain steps that call non-existent tools. These are mechanical checks that can catch LLM generation errors before they cause runtime failures in the middle of a task."}),e.jsx("h2",{children:"Planning with Multiple Agents"}),e.jsx("p",{children:"In more sophisticated architectures, the planner and executor are separate specialized agents rather than separate prompts to the same model. The planner agent is optimized for broad reasoning and structured output. Multiple executor agents may run in parallel, each handling a different class of tools or sub-domain. This separation of concerns is the foundation of the orchestrator-worker architecture covered in later sections."}),e.jsx("h3",{children:"When to Keep Planning Simple"}),e.jsx("p",{children:"Planning adds overhead: an additional LLM call before execution begins, JSON parsing, topological sort logic, and plan validation. For tasks with three or fewer steps where the sequence is mostly predictable, a reactive loop without explicit planning is simpler, faster, and nearly as reliable. Reserve explicit planning for tasks where the number of steps is uncertain, where parallelism offers meaningful speed gains, or where the ability to review the plan before execution is a product requirement."})]})}const F=Object.freeze(Object.defineProperty({__proto__:null,default:j},Symbol.toStringTag,{value:"Module"}));function T(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("p",{children:"Memory is one of the most important — and most misunderstood — aspects of building AI agents. Without memory, every interaction starts from scratch. With the right memory architecture, agents can accumulate knowledge, learn from past mistakes, and maintain coherent context across long-running tasks. Understanding the different types of memory available to an agent is the first step to designing systems that are both capable and efficient."}),e.jsx("p",{children:"Cognitive scientists distinguish several forms of human memory. LLM agent systems map onto these categories remarkably well, and using the human analogy is one of the clearest ways to reason about what information lives where and how long it persists."}),e.jsx(s,{term:"Sensory Memory (Context Window)",children:"Sensory memory is the immediate, raw input an agent is currently processing. In LLM agents this corresponds directly to the context window — everything in the current conversation: the system prompt, user messages, assistant turns, tool calls, and tool results. Like sensory memory in humans, it is large in detail but short in duration. When the conversation ends or the context window fills, this information is gone unless deliberately saved elsewhere. The context window is where all active reasoning happens."}),e.jsx(s,{term:"Short-Term / Working Memory",children:"Working memory is the scratchpad for active computation. Humans hold roughly 7 items in working memory at once while solving problems. LLM agents simulate working memory through structured data they maintain in-context: variables extracted from the conversation, intermediate results accumulated during a task, a running plan or checklist. Working memory is still bound by the context window, but it is the intentional, structured portion — data the agent is actively tracking rather than passively reading."}),e.jsx(s,{term:"Long-Term Memory (Persistent Store)",children:"Long-term memory persists beyond a single session or context window. In agent systems this is implemented as an external storage layer: a relational database, a vector store, a key-value store, or a file system. The agent writes to long-term memory when it learns something worth keeping, and retrieves from it when it needs information that is not in the current context. Long-term memory enables agents to learn from experience, remember user preferences, and share knowledge across instances."}),e.jsx(s,{term:"Episodic Memory (Past Experiences)",children:'Episodic memory is the record of specific past experiences — not just facts, but sequences of events with context. Humans remember "the time I tried approach X and it failed because of Y." Agent systems implement episodic memory by storing summaries of past agent runs: what task was attempted, what steps were taken, what succeeded and what failed. These records can be retrieved as examples when similar tasks arise, providing the agent with situational experience rather than just declarative knowledge.'}),e.jsx("h2",{children:"The Memory Hierarchy in Practice"}),e.jsx("p",{children:"These four memory types form a hierarchy ordered by speed, capacity, and persistence. Understanding the tradeoffs of each determines which type to use for a given piece of information."}),e.jsx("h3",{children:"Speed vs. Capacity Tradeoff"}),e.jsx("p",{children:"The context window (sensory memory) is instantly accessible — the model reads it with zero latency. But it is small (200k tokens for Claude) and temporary. A vector database (long-term memory) can store millions of documents but requires an embedding and retrieval step that adds latency. The right memory architecture puts frequently-needed, session- critical information in context and delegates the long tail to persistent stores."}),e.jsx("h3",{children:"What Belongs in Each Tier"}),e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Memory Type"}),e.jsx("th",{children:"Storage Location"}),e.jsx("th",{children:"Typical Contents"}),e.jsx("th",{children:"Persistence"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:"Sensory"}),e.jsx("td",{children:"Context window (messages array)"}),e.jsx("td",{children:"Current conversation, tool results, active instructions"}),e.jsx("td",{children:"Session only"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"Working"}),e.jsx("td",{children:"Structured fields in context"}),e.jsx("td",{children:"Current plan, extracted variables, running totals"}),e.jsx("td",{children:"Session only"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"Long-term"}),e.jsx("td",{children:"Database, vector store, files"}),e.jsx("td",{children:"User preferences, domain facts, learned procedures"}),e.jsx("td",{children:"Permanent"})]}),e.jsxs("tr",{children:[e.jsx("td",{children:"Episodic"}),e.jsx("td",{children:"Database with structured summaries"}),e.jsx("td",{children:"Past task logs, success/failure records, example solutions"}),e.jsx("td",{children:"Permanent"})]})]})]}),e.jsx("h2",{children:"Mapping to Human Memory: An Analogy"}),e.jsx("p",{children:`Consider a doctor seeing a patient. Their sensory memory is what they are actively observing right now — the patient's current symptoms and what the patient is saying. Their working memory holds the differential diagnosis they are building in their head as the conversation unfolds. Their long-term memory contains medical knowledge from years of study. Their episodic memory holds the recollection: "I treated a patient with similar symptoms three years ago and the key was the rash pattern."`}),e.jsx("p",{children:"An AI agent diagnosing a software bug operates the same way. Sensory: the current error log and conversation. Working: the list of hypotheses it is currently evaluating. Long-term: a vector store of known bug patterns in the codebase. Episodic: a record of how a similar bug was resolved last month."}),e.jsx(o,{name:"Tiered Memory Architecture",category:"Memory Design",description:"Design agent memory as explicit tiers: immediate context for active reasoning, working memory structures for in-progress state, a persistent store for durable facts, and an episodic log for past runs. Each tier has a different access pattern, cost, and latency profile.",when:["Agent needs to maintain state across multiple turns in a session","Agent needs to recall information from previous sessions","Context window would overflow without offloading older information","Agent needs to learn from past task outcomes"],avoid:["Dumping all available information into the context window","Using only in-context memory for long-running agents","Storing ephemeral session data in permanent storage unnecessarily"]}),e.jsx("h2",{children:"Memory and Agent Capability"}),e.jsx("p",{children:"The sophistication of an agent's memory architecture is a major determinant of what tasks it can accomplish. A memoryless agent — one that starts fresh every time — can only do tasks completable within a single context window. An agent with long-term memory can build expertise over time. An agent with episodic memory can improve its strategies based on what has and hasn't worked before."}),e.jsx(r,{title:"Match Memory Architecture to Task Requirements",children:"Before designing memory, define what the agent needs to remember and for how long. A customer support agent needs to remember the current ticket (sensory), the user's account details (long-term retrieval), and past interactions with this user (episodic). A one-shot code generation agent needs almost no memory beyond the current prompt. Over- engineering memory adds complexity without benefit. Under-engineering it leaves the agent unable to complete its tasks."}),e.jsx(n,{title:"Context window size does not eliminate the need for external memory",children:"Even with very large context windows (200k+ tokens), external memory remains valuable. Retrieving only the 5 most relevant documents is almost always better than stuffing 500 documents into context. Semantic retrieval surfaces what is relevant; raw context stuffing creates noise that degrades model performance. Use large context windows for depth of reasoning in a session, not as a substitute for proper memory architecture."})]})}const H=Object.freeze(Object.defineProperty({__proto__:null,default:T},Symbol.toStringTag,{value:"Module"}));function A(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("p",{children:"Understanding memory types conceptually is only the first step. Implementing them correctly in a production agent requires concrete patterns for each tier. This section covers four practical memory implementations: in-context message memory, vector store semantic memory, structured key-value memory, and episodic memory with summarization. Each has distinct code patterns, tradeoffs, and appropriate use cases."}),e.jsx("h2",{children:"In-Context Memory (Message History)"}),e.jsx("p",{children:'The simplest memory implementation is the conversation history itself. Every message — user turns, assistant turns, tool calls, tool results — is appended to the messages array and sent with every request. The model "remembers" the conversation simply because it can read the full history each time.'}),e.jsx(t,{title:"In-Context Memory with Message History",tabs:{python:`from anthropic import Anthropic

client = Anthropic()

class InContextAgent:
    def __init__(self, system_prompt: str):
        self.system = system_prompt
        self.messages = []  # The entire conversation history

    def chat(self, user_message: str) -> str:
        self.messages.append({"role": "user", "content": user_message})

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2048,
            system=self.system,
            messages=self.messages
        )

        assistant_message = response.content[0].text
        self.messages.append({"role": "assistant", "content": assistant_message})
        return assistant_message

    def token_count(self) -> int:
        """Estimate tokens used by current history."""
        # Rough estimate: 4 chars per token
        total_chars = sum(
            len(str(m["content"])) for m in self.messages
        )
        return total_chars // 4

    def trim_history(self, keep_last_n: int = 20):
        """Keep only the most recent N turns to manage context size."""
        if len(self.messages) > keep_last_n:
            self.messages = self.messages[-keep_last_n:]

# Usage
agent = InContextAgent("You are a helpful assistant that remembers our conversation.")
print(agent.chat("My name is Alex and I work on ML infrastructure."))
print(agent.chat("What's my name and what do I work on?"))  # Agent remembers
print(f"Approximate tokens used: {agent.token_count()}")`}}),e.jsx(s,{term:"Vector Store Memory",children:"Vector store memory implements semantic search over a corpus of documents or past interactions. Text is converted to embedding vectors, stored in a vector database, and retrieved by finding vectors with high cosine similarity to a query embedding. This allows the agent to retrieve relevant information from a large corpus without stuffing everything into context. Common implementations use FAISS, Chroma, Pinecone, or Weaviate."}),e.jsx(t,{title:"Vector Store Semantic Memory",tabs:{python:`from anthropic import Anthropic
import json

# Using chromadb for local vector storage
# pip install chromadb anthropic

import chromadb
from chromadb.utils import embedding_functions

client = Anthropic()
chroma_client = chromadb.Client()

# Use a sentence transformer for embeddings
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

class VectorMemoryAgent:
    def __init__(self, collection_name: str = "agent_memory"):
        self.collection = chroma_client.get_or_create_collection(
            name=collection_name,
            embedding_function=embedding_fn
        )
        self.message_count = 0

    def remember(self, text: str, metadata: dict = None):
        """Store a memory in the vector store."""
        self.message_count += 1
        self.collection.add(
            documents=[text],
            metadatas=[metadata or {}],
            ids=[f"memory_{self.message_count}"]
        )

    def recall(self, query: str, n_results: int = 3) -> list[str]:
        """Retrieve relevant memories for a query."""
        results = self.collection.query(
            query_texts=[query],
            n_results=min(n_results, self.collection.count())
        )
        return results["documents"][0] if results["documents"] else []

    def chat(self, user_message: str) -> str:
        # Retrieve relevant memories
        relevant_memories = self.recall(user_message)
        memory_context = ""
        if relevant_memories:
            memory_context = "\\nRelevant memories:\\n" + "\\n".join(
                f"- {m}" for m in relevant_memories
            )

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=f"You are a helpful assistant with access to long-term memory.{memory_context}",
            messages=[{"role": "user", "content": user_message}]
        )

        answer = response.content[0].text

        # Store this interaction as a memory
        self.remember(
            f"User asked: {user_message} | Answer: {answer}",
            {"type": "interaction"}
        )
        return answer

# Usage
agent = VectorMemoryAgent()
agent.remember("Alex is a senior ML engineer who prefers Python.", {"type": "user_profile"})
agent.remember("The production model is claude-opus-4-5, deployed in us-east-1.", {"type": "system_info"})

response = agent.chat("What model are we running in production?")
print(response)  # Recalls the stored system info`}}),e.jsx("h2",{children:"Structured Key-Value Memory"}),e.jsx("p",{children:"Not all memory needs semantic search. User preferences, account settings, and configuration values are best stored in a structured key-value store and retrieved deterministically by key. This pattern is simpler, faster, and cheaper than vector retrieval for information with known lookup keys."}),e.jsx(t,{title:"Structured Key-Value Memory",tabs:{python:`from anthropic import Anthropic
import json
import redis  # pip install redis

client = Anthropic()
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

class StructuredMemoryAgent:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.memory_prefix = f"agent:memory:{user_id}"

    def set_memory(self, key: str, value: any):
        """Store a structured memory item."""
        full_key = f"{self.memory_prefix}:{key}"
        redis_client.set(full_key, json.dumps(value))

    def get_memory(self, key: str) -> any:
        """Retrieve a specific memory item."""
        full_key = f"{self.memory_prefix}:{key}"
        value = redis_client.get(full_key)
        return json.loads(value) if value else None

    def get_all_memories(self) -> dict:
        """Retrieve all stored memories for this user."""
        pattern = f"{self.memory_prefix}:*"
        keys = redis_client.keys(pattern)
        memories = {}
        for key in keys:
            short_key = key.replace(f"{self.memory_prefix}:", "")
            value = redis_client.get(key)
            memories[short_key] = json.loads(value) if value else None
        return memories

    def chat_with_memory(self, user_message: str) -> str:
        memories = self.get_all_memories()
        memory_context = json.dumps(memories, indent=2) if memories else "No stored memories."

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=f"""You are a personalized assistant.
User memory store:
{memory_context}

When the user tells you something to remember, acknowledge it.
When updating memory based on conversation, note the key you would update.""",
            messages=[{"role": "user", "content": user_message}]
        )
        return response.content[0].text

# Usage
agent = StructuredMemoryAgent(user_id="user_123")
agent.set_memory("name", "Alex")
agent.set_memory("preferences", {"language": "Python", "editor": "neovim"})
agent.set_memory("timezone", "UTC-8")

response = agent.chat_with_memory("What do you know about me?")
print(response)`}}),e.jsx("h2",{children:"Episodic Memory with Summarization"}),e.jsx("p",{children:"Episodic memory stores the record of past agent runs: what was attempted, what tools were called, what succeeded, and what failed. When a new similar task arrives, the agent can retrieve relevant past episodes as context, learning from experience without retraining."}),e.jsx(t,{title:"Episodic Memory with Run Summarization",tabs:{python:`from anthropic import Anthropic
import json
import sqlite3
from datetime import datetime

client = Anthropic()

class EpisodicMemoryStore:
    def __init__(self, db_path: str = "episodes.db"):
        self.conn = sqlite3.connect(db_path)
        self._init_db()

    def _init_db(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS episodes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT NOT NULL,
                summary TEXT NOT NULL,
                outcome TEXT NOT NULL,
                tools_used TEXT,
                created_at TEXT NOT NULL
            )
        """)
        self.conn.commit()

    def store_episode(self, task: str, messages: list, outcome: str):
        """Summarize and store a completed agent run."""
        # Use Claude to generate a concise episode summary
        summary_response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=512,
            messages=[{
                "role": "user",
                "content": f"""Summarize this agent run in 2-3 sentences for future reference.
Focus on: what was attempted, key steps taken, and what succeeded or failed.

Task: {task}
Messages: {json.dumps(messages[-6:], indent=2)}  # Last 6 messages
Outcome: {outcome}"""
            }]
        )
        summary = summary_response.content[0].text

        tools_used = [
            m.get("tool_name") for m in messages
            if isinstance(m, dict) and m.get("type") == "tool_use"
        ]

        self.conn.execute(
            "INSERT INTO episodes (task, summary, outcome, tools_used, created_at) VALUES (?,?,?,?,?)",
            (task, summary, outcome, json.dumps(tools_used), datetime.utcnow().isoformat())
        )
        self.conn.commit()

    def retrieve_similar_episodes(self, task: str, limit: int = 3) -> list[dict]:
        """Retrieve episodes with similar task descriptions."""
        # Simplified: keyword search. Production: use vector similarity.
        words = task.lower().split()
        query = " OR ".join([f"task LIKE '%{w}%'" for w in words[:5]])
        cursor = self.conn.execute(
            f"SELECT task, summary, outcome, created_at FROM episodes WHERE {query} "
            f"ORDER BY created_at DESC LIMIT ?",
            (limit,)
        )
        return [
            {"task": row[0], "summary": row[1], "outcome": row[2], "date": row[3]}
            for row in cursor.fetchall()
        ]

def run_agent_with_episodes(task: str, store: EpisodicMemoryStore) -> str:
    # Retrieve relevant past experiences
    past_episodes = store.retrieve_similar_episodes(task)
    episode_context = ""
    if past_episodes:
        episode_context = "\\nRelevant past experiences:\\n" + "\\n".join([
            f"- Task: {ep['task']}\\n  Summary: {ep['summary']}\\n  Outcome: {ep['outcome']}"
            for ep in past_episodes
        ])

    messages = [{"role": "user", "content": task}]
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=f"You are a helpful agent.{episode_context}",
        messages=messages
    )

    result = response.content[0].text
    messages.append({"role": "assistant", "content": result})

    # Store this episode for future reference
    store.store_episode(task, messages, "completed")
    return result

store = EpisodicMemoryStore()
result = run_agent_with_episodes("Debug the authentication service", store)
print(result)`}}),e.jsx(r,{title:"Choose Memory Implementation Based on Access Pattern",children:"Use in-context history for active session state, vector stores for semantic recall over large corpora, key-value stores for structured attributes with known keys, and episodic stores for learning from past runs. Mixing all four in a single agent is common for sophisticated applications — each serves a distinct purpose. The wrong choice is using one type for all cases: vector search for structured preferences adds unnecessary latency, while key-value lookup for free-form knowledge is brittle."}),e.jsx(n,{title:"Embedding model choice matters for retrieval quality",children:"The quality of vector store retrieval depends heavily on the embedding model. General- purpose models like all-MiniLM-L6-v2 work well for conversational content. For domain- specific content (code, legal text, medical records), fine-tuned or domain-specific embedding models significantly improve retrieval precision. Always evaluate retrieval quality with real queries before deploying a vector memory system."})]})}const G=Object.freeze(Object.defineProperty({__proto__:null,default:A},Symbol.toStringTag,{value:"Module"}));function S(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("p",{children:"Memory management is the practice of controlling what information an agent holds, how long it holds it, and how it retrieves it under the constraints of a finite context window. Even with 200k-token context windows, agents that run for extended periods accumulate more history than will fit. Without active management, context bloat degrades model performance and eventually causes requests to fail. Well-designed memory management keeps agents effective through arbitrarily long task sequences."}),e.jsx("h2",{children:"Context Window Limits"}),e.jsx("p",{children:"Every LLM has a maximum context window. Claude 3.7 Sonnet supports up to 200,000 tokens. A long-running agent accumulates tokens through conversation history, tool results (which can be large), and any documents retrieved from memory. Left unmanaged, the context grows until requests fail or quality degrades as the model struggles to attend to relevant information buried in a long history."}),e.jsx(s,{term:"Context Window Budget",children:"A context window budget is an explicit allocation of the total token limit across the components that share the context: system prompt, conversation history, retrieved documents, tool schemas, and the expected output. By budgeting each component, you ensure no single component crowds out the others. A typical allocation: 10% system prompt, 30% retrieved context, 50% conversation history, 10% reserved for output."}),e.jsx(t,{title:"Context Budget Monitoring",tabs:{python:`from anthropic import Anthropic
import tiktoken  # pip install tiktoken

client = Anthropic()

class ContextBudgetManager:
    def __init__(self, max_tokens: int = 150000):
        self.max_tokens = max_tokens
        # Reserve space for output and tool schemas
        self.history_budget = int(max_tokens * 0.6)

    def estimate_tokens(self, text: str) -> int:
        """Rough token estimate: ~4 chars per token."""
        return len(text) // 4

    def messages_token_count(self, messages: list) -> int:
        total = 0
        for msg in messages:
            content = msg.get("content", "")
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict):
                        total += self.estimate_tokens(str(block))
            else:
                total += self.estimate_tokens(str(content))
        return total

    def fits_in_budget(self, messages: list) -> bool:
        return self.messages_token_count(messages) <= self.history_budget

    def trim_to_budget(self, messages: list, preserve_first: int = 2) -> list:
        """Remove oldest messages until within budget, preserving the first N."""
        if self.fits_in_budget(messages):
            return messages

        preserved = messages[:preserve_first]
        trimable = messages[preserve_first:]

        while not self.fits_in_budget(preserved + trimable) and trimable:
            trimable = trimable[2:]  # Remove oldest user+assistant pair

        result = preserved + trimable
        removed = len(messages) - len(result)
        if removed > 0:
            print(f"Trimmed {removed} messages to stay within context budget")
        return result

manager = ContextBudgetManager(max_tokens=150000)
messages = [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there"}]
print(f"Token count: {manager.messages_token_count(messages)}")
print(f"Within budget: {manager.fits_in_budget(messages)}")`}}),e.jsx("h2",{children:"Memory Compression and Summarization"}),e.jsx("p",{children:"When message history grows too long, rather than simply deleting old messages, a better strategy is to compress them into a summary. The summary preserves the semantic content of the earlier conversation while consuming far fewer tokens. The agent retains continuity without the full verbatim history."}),e.jsx(t,{title:"Progressive Conversation Summarization",tabs:{python:`from anthropic import Anthropic
import json

client = Anthropic()

class SummarizingAgent:
    def __init__(self, system: str, summary_threshold: int = 30):
        self.system = system
        self.messages = []
        self.running_summary = None
        self.summary_threshold = summary_threshold  # messages before summarizing

    def _should_summarize(self) -> bool:
        return len(self.messages) >= self.summary_threshold

    def _summarize_history(self):
        """Compress old messages into a rolling summary."""
        # Keep the last 10 messages fresh; summarize everything before
        to_summarize = self.messages[:-10]
        recent = self.messages[-10:]

        summary_prompt = f"""Summarize the following conversation history concisely.
Preserve: key decisions made, information learned, tasks completed, and any open questions.
Previous summary (if any): {self.running_summary or "None"}

Messages to summarize:
{json.dumps(to_summarize, indent=2)}"""

        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=512,
            messages=[{"role": "user", "content": summary_prompt}]
        )

        self.running_summary = response.content[0].text
        self.messages = recent
        print(f"Compressed {len(to_summarize)} messages into summary.")

    def _build_system_with_summary(self) -> str:
        if self.running_summary:
            return f"{self.system}\\n\\nConversation summary so far:\\n{self.running_summary}"
        return self.system

    def chat(self, user_message: str) -> str:
        if self._should_summarize():
            self._summarize_history()

        self.messages.append({"role": "user", "content": user_message})

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=self._build_system_with_summary(),
            messages=self.messages
        )

        answer = response.content[0].text
        self.messages.append({"role": "assistant", "content": answer})
        return answer

agent = SummarizingAgent(
    system="You are a helpful assistant.",
    summary_threshold=10  # Summarize every 10 messages for demo
)

# Simulate a long conversation
for i in range(15):
    response = agent.chat(f"Tell me fact number {i+1} about Python.")
    print(f"Turn {i+1}: {response[:80]}...")`}}),e.jsx("h2",{children:"Memory Retrieval Strategies"}),e.jsx("p",{children:"For long-term memory, effective retrieval is as important as storage. Poor retrieval floods the context with irrelevant information; too narrow retrieval misses critical context. Several strategies balance recall and precision."}),e.jsx("h3",{children:"Similarity Threshold Filtering"}),e.jsx("p",{children:"Rather than always retrieving the top-N results, filter by a minimum similarity score. Only retrieve memories whose cosine similarity exceeds a threshold (typically 0.7–0.85). This prevents low-relevance memories from cluttering the context."}),e.jsx("h3",{children:"Recency Weighting"}),e.jsx("p",{children:"Combine semantic similarity with recency. A memory from last week that is moderately relevant may be more useful than a highly similar memory from six months ago, especially for time-sensitive tasks. Score memories as: final_score = 0.7 * similarity + 0.3 * recency_score."}),e.jsx("h3",{children:"Importance-Based Retention"}),e.jsx("p",{children:"Not all memories are equally important. Have the agent assign an importance score when storing a memory, then use importance as a factor in both retrieval ranking and eviction decisions. High-importance memories survive longer and surface more readily."}),e.jsx(t,{title:"Memory Retrieval with Recency and Importance Scoring",tabs:{python:`from datetime import datetime, timedelta
import math

def compute_memory_score(
    similarity: float,
    created_at: datetime,
    importance: float = 0.5,
    recency_decay_days: float = 30.0
) -> float:
    """
    Score a memory for retrieval using similarity, recency, and importance.

    similarity: cosine similarity to query (0-1)
    importance: user/agent assigned importance (0-1)
    recency: exponential decay with half-life = recency_decay_days
    """
    age_days = (datetime.utcnow() - created_at).total_seconds() / 86400
    recency = math.exp(-age_days / recency_decay_days)

    # Weighted combination
    score = (
        0.5 * similarity +
        0.3 * recency +
        0.2 * importance
    )
    return score

def retrieve_memories(
    query_embedding: list[float],
    memories: list[dict],
    top_k: int = 5,
    min_similarity: float = 0.65
) -> list[dict]:
    """Retrieve top-k memories with combined scoring."""
    scored = []
    for mem in memories:
        similarity = cosine_similarity(query_embedding, mem["embedding"])
        if similarity < min_similarity:
            continue
        score = compute_memory_score(
            similarity=similarity,
            created_at=mem["created_at"],
            importance=mem.get("importance", 0.5)
        )
        scored.append({**mem, "score": score, "similarity": similarity})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]

def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x**2 for x in a))
    mag_b = math.sqrt(sum(x**2 for x in b))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0`}}),e.jsx("h2",{children:"Forgetting: Eviction Policies"}),e.jsx("p",{children:"Long-running agents accumulate memories that may become outdated or irrelevant. Without eviction policies, memory stores grow unbounded and retrieval quality degrades as noise accumulates. Implement explicit forgetting based on:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"TTL (Time-to-Live):"})," Memories expire after a fixed duration. Suitable for time-sensitive information like prices or statuses."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Access frequency:"})," Memories not retrieved in N days are candidates for eviction. Similar to LRU cache eviction."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Explicit invalidation:"})," When the agent learns something contradicts an existing memory, mark the old one as stale and store the updated fact."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Capacity limits:"})," When the store exceeds a size limit, evict the lowest-scored memories first."]})]}),e.jsx("h2",{children:"Memory Hygiene for Long-Running Agents"}),e.jsx(o,{name:"Memory Hygiene Protocol",category:"Memory Management",description:"Establish explicit policies for what gets stored, how long it lives, and when it gets evicted. Treat memory as a managed resource, not an append-only log.",when:["Agent runs span multiple sessions or days","Memory store has more than a few hundred entries","Agent is acting on behalf of users whose preferences change over time","Agent deals with time-sensitive information that becomes stale"],avoid:["Storing every interaction without filtering for importance","Using a single eviction policy for all memory types","Never validating whether stored facts are still current"]}),e.jsx(r,{title:"Separate Memory by Volatility",children:"Segment your memory store by how quickly information becomes stale. User preferences change slowly — months to years. Session context changes with every message. Factual knowledge about external systems changes when those systems change. Apply different TTLs and eviction policies to each segment. User preferences: no expiry. Session state: evict after session ends. External facts: refresh on every use or set a 24-hour TTL."}),e.jsx(a,{title:"Stale memory is worse than no memory",children:'An agent that recalls outdated facts with high confidence can cause more harm than an agent with no memory. If your agent stores facts about external systems (API endpoints, prices, user account states), implement validation: before using a recalled fact, verify it is still current or attach a "last verified" timestamp and treat old facts with appropriate uncertainty. Never let an agent act on stale information without at least flagging the uncertainty.'}),e.jsx(n,{title:"Use compression before eviction when possible",children:"Before evicting old memories, consider whether they can be compressed. Multiple interactions with the same user can be summarized into a user profile. A series of debugging steps can be compressed into a solution record. Compression retains semantic value while reducing storage footprint, and is almost always preferable to raw deletion."})]})}const $=Object.freeze(Object.defineProperty({__proto__:null,default:S},Symbol.toStringTag,{value:"Module"}));function q(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("p",{children:"The quality of an agent's tools is the single most controllable factor in its performance. A capable model paired with poorly designed tools will underperform a simpler model with excellent tools. Tool design is software engineering, and it benefits from the same principles that make good APIs: clear contracts, predictable behavior, useful error messages, and minimal surface area. The UNIX philosophy — do one thing well — applies directly."}),e.jsx("h2",{children:"The UNIX Philosophy Applied to Agent Tools"}),e.jsx("p",{children:"UNIX tools are small, composable programs that each do exactly one thing and communicate through standard interfaces. This philosophy produces systems that are easy to understand, test, and combine in novel ways. Agent tools should follow the same principles."}),e.jsx(s,{term:"Single-Responsibility Tool",children:`A single-responsibility tool performs exactly one conceptual operation. It does not branch based on a mode flag or combine multiple capabilities into one endpoint. A tool that both reads and writes files based on an "operation" parameter is two tools pretending to be one. Separating them makes the schema clearer, the error surface smaller, and the model's decision-making easier — it selects the right tool, not the right mode.`}),e.jsx("h3",{children:"Composability"}),e.jsx("p",{children:"Small, focused tools combine to handle complex tasks. An agent that needs to read a file, transform its contents, and write the result uses three tools in sequence. This is more debuggable, more testable, and more robust than a single multi-purpose transform tool. When an intermediate step fails, you know exactly which operation failed and why."}),e.jsx("h2",{children:"Clear Input/Output Schemas"}),e.jsx("p",{children:"A tool's schema is its contract with the model. The model decides which tool to call and what arguments to pass based entirely on the schema description and the parameter descriptions. Vague or incomplete schemas produce incorrect or hallucinated arguments. Precise schemas produce correct calls."}),e.jsx(t,{title:"Well-Designed vs. Poorly Designed Tool Schemas",tabs:{python:`# BAD: Vague schema with poor descriptions
bad_tool = {
    "name": "process_data",
    "description": "Process data",  # What kind? How?
    "input_schema": {
        "type": "object",
        "properties": {
            "data": {"type": "string"},   # What format? What content?
            "mode": {"type": "string"},   # What values are valid?
            "opts": {"type": "object"}    # What options exist?
        }
    }
}

# GOOD: Precise schema with complete descriptions
good_tool_search = {
    "name": "search_documents",
    "description": (
        "Search the document store for text matching a query. "
        "Returns the top matching document excerpts with their source file paths. "
        "Use this when you need to find information across the knowledge base."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Natural language search query. Be specific for better results."
            },
            "max_results": {
                "type": "integer",
                "description": "Maximum number of results to return. Default 5, max 20.",
                "default": 5,
                "minimum": 1,
                "maximum": 20
            },
            "file_type": {
                "type": "string",
                "description": "Filter to a specific file type: 'pdf', 'md', 'txt', or 'all'.",
                "enum": ["pdf", "md", "txt", "all"],
                "default": "all"
            }
        },
        "required": ["query"]
    }
}

good_tool_write = {
    "name": "write_file",
    "description": (
        "Write content to a file, creating it if it does not exist or overwriting if it does. "
        "Returns the number of bytes written. "
        "Do NOT use for appending — use append_file instead."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "Absolute or relative file path, e.g. '/tmp/output.txt'"
            },
            "content": {
                "type": "string",
                "description": "The full content to write to the file."
            },
            "encoding": {
                "type": "string",
                "description": "File encoding. Defaults to 'utf-8'.",
                "default": "utf-8"
            }
        },
        "required": ["path", "content"]
    }
}`,json:`{
  "name": "search_documents",
  "description": "Search the document store for text matching a query. Returns the top matching document excerpts with their source file paths. Use this when you need to find information across the knowledge base.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Natural language search query. Be specific for better results."
      },
      "max_results": {
        "type": "integer",
        "description": "Maximum number of results to return. Default 5, max 20.",
        "default": 5,
        "minimum": 1,
        "maximum": 20
      },
      "file_type": {
        "type": "string",
        "description": "Filter to a specific file type: 'pdf', 'md', 'txt', or 'all'.",
        "enum": ["pdf", "md", "txt", "all"],
        "default": "all"
      }
    },
    "required": ["query"]
  }
}`}}),e.jsx("h2",{children:"Error Handling in Tools"}),e.jsx("p",{children:"Tools will fail. Files won't exist, APIs will return 404s, queries will time out. The question is not whether to handle errors but how. Tool errors must be expressed in a way the LLM can act on — the model reads the tool result and decides what to do next. An exception traceback is useless to the model; a structured error message with context and a suggested next action is invaluable."}),e.jsx(t,{title:"Actionable Error Messages in Tool Implementations",tabs:{python:`import json
from pathlib import Path

def read_file(path: str, encoding: str = "utf-8") -> str:
    """
    Tool implementation: read a file with LLM-actionable error messages.
    Returns either the file content or a structured error the LLM can act on.
    """
    file_path = Path(path)

    if not file_path.exists():
        return json.dumps({
            "error": "FILE_NOT_FOUND",
            "message": f"File '{path}' does not exist.",
            "suggestion": "Use list_directory to see what files are available in that location."
        })

    if not file_path.is_file():
        return json.dumps({
            "error": "NOT_A_FILE",
            "message": f"'{path}' is a directory, not a file.",
            "suggestion": "Use list_directory to see the contents of this directory."
        })

    try:
        content = file_path.read_text(encoding=encoding)
        if len(content) > 100_000:
            return json.dumps({
                "error": "FILE_TOO_LARGE",
                "message": f"File is {len(content):,} chars. Limit is 100,000.",
                "suggestion": "Use read_file_range to read specific line ranges.",
                "total_lines": content.count("\\n") + 1
            })
        return content
    except PermissionError:
        return json.dumps({
            "error": "PERMISSION_DENIED",
            "message": f"Cannot read '{path}': permission denied.",
            "suggestion": "Check file permissions or try a different path."
        })
    except UnicodeDecodeError:
        return json.dumps({
            "error": "ENCODING_ERROR",
            "message": f"Cannot decode '{path}' as {encoding}.",
            "suggestion": "Try encoding='latin-1' or encoding='utf-16' for binary files."
        })`}}),e.jsx("h2",{children:"Idempotency"}),e.jsx(s,{term:"Idempotency",children:"An idempotent operation produces the same result whether called once or many times with the same arguments. Idempotent tools are safe to retry on failure, making agent systems more robust. A tool that creates a record is not idempotent (calling it twice creates two records). A tool that upserts a record is idempotent (calling it twice with the same data results in one record with that data). Prefer idempotent designs wherever the operation semantics allow it."}),e.jsx("h2",{children:"Tool Naming Conventions"}),e.jsx("p",{children:"Tool names are read by the model, not just programmers. They should be immediately clear about what the tool does without reading the description. Follow these conventions:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Use verb_noun format:"})," ",e.jsx("code",{children:"search_documents"}),", ",e.jsx("code",{children:"read_file"}),", ",e.jsx("code",{children:"create_task"}),", ",e.jsx("code",{children:"list_users"})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Be specific, not generic:"})," ",e.jsx("code",{children:"search_jira_issues"})," beats ",e.jsx("code",{children:"search"})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Distinguish similar tools clearly:"})," ",e.jsx("code",{children:"read_file"})," vs ",e.jsx("code",{children:"read_file_range"})," vs ",e.jsx("code",{children:"read_url"})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Avoid abbreviations:"})," ",e.jsx("code",{children:"get_customer_record"})," not ",e.jsx("code",{children:"get_cust_rec"})]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use consistent verbs:"})," pick one of (get/read/fetch) and use it everywhere for retrieval"]})]}),e.jsx(o,{name:"Tool Schema Contract",category:"Tool Design",description:"Treat tool schemas as a contract between the tool implementation and the LLM. Every parameter must have a description that answers: what is it, what format does it expect, and what are valid values. Required fields must be truly required. Optional fields must have sensible defaults.",when:["Defining any new tool for an agent","Reviewing existing tools that produce incorrect LLM calls","Building a tool library that will be reused across multiple agents"],avoid:["Parameter names that only make sense with code context (use descriptions)","Combining multiple operations into one tool with a 'mode' parameter","Returning raw exceptions — always translate to structured error objects"]}),e.jsx(r,{title:"Write Tool Descriptions from the Model's Perspective",children:"When writing a tool description, ask: would the model know exactly when to call this tool and exactly what to pass, based only on the description and parameter names? Include: what the tool does, when to use it (and when NOT to use it), what the return value looks like, and any important constraints like rate limits or size limits. A one-sentence description is almost always insufficient."}),e.jsx(a,{title:"Side effects in tools require special care",children:'Tools that modify state (write files, send emails, modify database records, call APIs with side effects) should be clearly marked as such in their descriptions. Include the phrase "This action cannot be undone." where appropriate. This prompts the model to treat the tool with appropriate caution and reduces the chance of unintended side effects during exploration or debugging phases. Consider adding a dry_run parameter to destructive tools.'}),e.jsx(n,{title:"Test tools independently before putting them in agents",children:"Every tool should have unit tests that verify correct behavior, error handling, and schema conformance before it is given to an agent. A misbehaving tool that returns incorrect results or unhelpful errors will cause the agent to spiral into confused retry loops. Isolating tool bugs from agent reasoning bugs requires that you can trust your tools work correctly in isolation."})]})}const Y=Object.freeze(Object.defineProperty({__proto__:null,default:q},Symbol.toStringTag,{value:"Module"}));function R(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("p",{children:"The majority of real-world agent tools wrap existing APIs: REST endpoints, GraphQL services, database queries, or third-party platforms like GitHub, Slack, or Jira. Wrapping an API as an agent tool requires more than copying its parameters into a JSON Schema. Authentication must be handled transparently, rate limits must be respected, and errors must be translated into messages the LLM can act on. This section covers the patterns that make API-backed tools robust and production-ready."}),e.jsx("h2",{children:"Anatomy of a Well-Wrapped API Tool"}),e.jsx("p",{children:"A production API tool has five responsibilities: input validation, authentication injection, the HTTP request, response normalization, and error translation. The agent should see none of the authentication mechanics and should always receive a response it can reason about, even when the API fails."}),e.jsx(t,{title:"Wrapping a REST API as an Agent Tool",tabs:{python:`import json
import os
import time
from typing import Any
import httpx  # pip install httpx

class GitHubAPITool:
    """Wraps GitHub REST API endpoints as agent-callable tools."""

    def __init__(self):
        self.token = os.environ["GITHUB_TOKEN"]
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        self._rate_limit_remaining = 5000
        self._rate_limit_reset = 0

    def _handle_rate_limit(self, response: httpx.Response):
        """Track and respect GitHub rate limits."""
        self._rate_limit_remaining = int(
            response.headers.get("X-RateLimit-Remaining", 5000)
        )
        self._rate_limit_reset = int(
            response.headers.get("X-RateLimit-Reset", 0)
        )
        if self._rate_limit_remaining < 10:
            wait_time = max(0, self._rate_limit_reset - time.time())
            if wait_time > 0:
                print(f"Rate limit nearly exhausted. Waiting {wait_time:.0f}s...")
                time.sleep(min(wait_time, 60))  # Cap wait at 60s

    def _translate_error(self, status_code: int, body: dict, context: str) -> str:
        """Convert HTTP errors to LLM-actionable messages."""
        error_map = {
            401: "Authentication failed. Check that GITHUB_TOKEN is valid and has required scopes.",
            403: f"Access denied to {context}. The token may lack required permissions.",
            404: f"Resource not found: {context}. Check the repository name and owner.",
            422: f"Validation failed: {body.get('message', 'invalid input')}. Check parameter values.",
            429: "Rate limit exceeded. Wait before retrying.",
            500: "GitHub server error. Retry after a short delay.",
            503: "GitHub is temporarily unavailable. Retry later."
        }
        return json.dumps({
            "error": f"HTTP_{status_code}",
            "message": error_map.get(status_code, f"Request failed with status {status_code}"),
            "details": body.get("message", ""),
            "suggestion": "Check the error message and adjust your request parameters."
        })

    def search_issues(self, repo: str, query: str, state: str = "open", limit: int = 10) -> str:
        """
        Search GitHub issues in a repository.

        Args:
            repo: Repository in 'owner/name' format, e.g. 'anthropics/anthropic-sdk-python'
            query: Search terms to match in issue title or body
            state: Filter by state: 'open', 'closed', or 'all'
            limit: Maximum number of results (1-30)
        """
        search_query = f"repo:{repo} is:issue state:{state} {query}"
        url = f"{self.base_url}/search/issues"
        params = {"q": search_query, "per_page": min(limit, 30), "sort": "updated"}

        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, headers=self.headers, params=params)
                self._handle_rate_limit(response)

                if response.status_code != 200:
                    return self._translate_error(
                        response.status_code,
                        response.json(),
                        f"issue search in {repo}"
                    )

                data = response.json()
                issues = []
                for item in data.get("items", []):
                    issues.append({
                        "number": item["number"],
                        "title": item["title"],
                        "state": item["state"],
                        "url": item["html_url"],
                        "created": item["created_at"][:10],
                        "labels": [l["name"] for l in item.get("labels", [])]
                    })

                return json.dumps({
                    "total_count": data["total_count"],
                    "returned": len(issues),
                    "issues": issues
                }, indent=2)

        except httpx.TimeoutException:
            return json.dumps({
                "error": "TIMEOUT",
                "message": "Request to GitHub timed out after 10 seconds.",
                "suggestion": "Retry the request. If it continues to fail, try a simpler query."
            })
        except httpx.NetworkError as e:
            return json.dumps({
                "error": "NETWORK_ERROR",
                "message": f"Could not connect to GitHub: {str(e)}",
                "suggestion": "Check network connectivity and retry."
            })

# Register as tool schema for Claude
GITHUB_TOOLS = [
    {
        "name": "search_github_issues",
        "description": (
            "Search for issues in a GitHub repository. "
            "Returns issue numbers, titles, states, and URLs. "
            "Use this to find relevant issues before creating new ones."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "repo": {
                    "type": "string",
                    "description": "Repository in 'owner/name' format, e.g. 'anthropics/anthropic-sdk-python'"
                },
                "query": {
                    "type": "string",
                    "description": "Search terms to find in issue title or body"
                },
                "state": {
                    "type": "string",
                    "description": "Filter by issue state",
                    "enum": ["open", "closed", "all"],
                    "default": "open"
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum results to return (1-30)",
                    "default": 10,
                    "minimum": 1,
                    "maximum": 30
                }
            },
            "required": ["repo", "query"]
        }
    }
]`}}),e.jsx("h2",{children:"Authentication Patterns"}),e.jsx("p",{children:"Authentication should be injected by the tool layer, never exposed to the agent. The model should not see API keys, tokens, or credentials — they should not appear in tool schemas, system prompts, or conversation history."}),e.jsx(s,{term:"Credential Injection",children:"Credential injection is the pattern of loading authentication secrets from environment variables or a secrets manager and adding them to requests inside the tool implementation, invisible to the LLM. The tool schema describes what the agent needs to provide (the resource identifier, query parameters) but never asks for credentials. This keeps secrets out of the context window where they could be leaked in responses or logs."}),e.jsx("h2",{children:"Rate Limiting"}),e.jsx("p",{children:"APIs enforce rate limits that tools must respect. Hitting a rate limit returns an error; an agent that does not handle this will enter a failure loop. Three strategies handle rate limits gracefully:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Proactive tracking:"})," Read rate limit headers on every response and slow down before hitting the limit."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Exponential backoff:"})," On 429 responses, retry with exponentially increasing delays."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Informative errors:"})," When rate limited, return an error that tells the agent to wait rather than retry immediately."]})]}),e.jsx("h2",{children:"OpenAPI Spec to Tool Schema Conversion"}),e.jsx("p",{children:"Many APIs publish OpenAPI (Swagger) specifications. These can be automatically converted to Claude tool schemas, dramatically reducing the manual work of wrapping large APIs."}),e.jsx(t,{title:"Convert OpenAPI Spec to Claude Tool Schema",tabs:{python:`import json
from typing import Any

def openapi_to_claude_tool(
    operation_id: str,
    operation: dict,
    parameters: list[dict]
) -> dict:
    """
    Convert an OpenAPI operation to a Claude tool schema.

    Args:
        operation_id: The operationId from the spec
        operation: The operation object from the spec
        parameters: List of parameter objects for this operation
    """
    properties = {}
    required = []

    for param in parameters:
        if param.get("in") not in ("query", "path"):
            continue
        schema = param.get("schema", {})
        properties[param["name"]] = {
            "type": schema.get("type", "string"),
            "description": param.get("description", f"The {param['name']} parameter")
        }
        if schema.get("enum"):
            properties[param["name"]]["enum"] = schema["enum"]
        if schema.get("default") is not None:
            properties[param["name"]]["default"] = schema["default"]
        if param.get("required", False):
            required.append(param["name"])

    # Also process requestBody if present
    request_body = operation.get("requestBody", {})
    if request_body:
        content = request_body.get("content", {})
        json_content = content.get("application/json", {})
        body_schema = json_content.get("schema", {})
        for prop_name, prop_schema in body_schema.get("properties", {}).items():
            properties[prop_name] = {
                "type": prop_schema.get("type", "string"),
                "description": prop_schema.get("description", prop_name)
            }
        required.extend(body_schema.get("required", []))

    return {
        "name": operation_id,
        "description": operation.get("summary", "") + " " + operation.get("description", ""),
        "input_schema": {
            "type": "object",
            "properties": properties,
            "required": list(set(required))
        }
    }

# Example: parse a minimal OpenAPI spec
openapi_spec = {
    "paths": {
        "/users/{user_id}": {
            "get": {
                "operationId": "get_user",
                "summary": "Get a user by ID.",
                "description": "Returns user profile data including name and email.",
                "parameters": [
                    {
                        "name": "user_id",
                        "in": "path",
                        "required": True,
                        "description": "The unique user identifier",
                        "schema": {"type": "string"}
                    }
                ]
            }
        }
    }
}

tools = []
for path, path_item in openapi_spec["paths"].items():
    for method, operation in path_item.items():
        if "operationId" in operation:
            tool = openapi_to_claude_tool(
                operation["operationId"],
                operation,
                operation.get("parameters", [])
            )
            tools.append(tool)

print(json.dumps(tools, indent=2))`}}),e.jsx(o,{name:"Thin Tool Wrapper Pattern",category:"API Integration",description:"Keep tool implementations as thin wrappers around underlying API clients. The tool layer handles authentication, error translation, and schema validation. The underlying client handles HTTP mechanics. This separation makes tools easy to test and the underlying clients easy to swap.",when:["Wrapping any external REST, GraphQL, or RPC API","Multiple tools share the same API base URL and authentication","You need to mock the API in tests"],avoid:["Putting business logic inside tool implementations","Exposing raw HTTP error codes without translation","Storing credentials in tool schema descriptions"]}),e.jsx(r,{title:"Return Structured Data, Not Raw HTTP Responses",children:"Raw API responses often contain dozens of fields the agent will never use. Select and reshape the response to include only what is relevant to the agent's task. A GitHub issue has 40+ fields; an agent typically needs 5: number, title, state, URL, and body. Trimming responses reduces token usage, improves response quality, and makes tool output easier to reason about."}),e.jsx(a,{title:"Never log tool calls that may contain sensitive data",children:"API tools often process or return sensitive information: user records, financial data, authentication tokens, PII. Be deliberate about what gets logged. Log tool names and operation types for debugging, but redact or omit the content of inputs and outputs unless you have explicit data handling policies that permit it. A debug log that captures full tool call content can become a compliance liability."}),e.jsx(n,{title:"Test tools against API sandbox environments",children:"Most production APIs offer sandbox or test environments with predictable data. Run all tool integration tests against sandboxes, not production. An agent under test that calls a real Stripe or Twilio endpoint can cause real charges or send real messages. Gate production credentials behind explicit environment checks and default to sandbox in all test and development environments."})]})}const K=Object.freeze(Object.defineProperty({__proto__:null,default:R},Symbol.toStringTag,{value:"Module"}));function E(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("p",{children:"Code execution tools give agents the ability to write and run code dynamically — transforming the agent from a system that reasons about computation to one that actually performs it. An agent with a code execution tool can compute exact answers rather than approximating them, verify its own outputs, and automate tasks that would require many fragile string-manipulation steps. The challenge is doing this safely. Arbitrary code execution is one of the most powerful and dangerous capabilities you can give an agent."}),e.jsx("h2",{children:"Why Code Execution Changes Everything"}),e.jsx("p",{children:"Language models are not reliable calculators. Ask Claude to compute the 47th Fibonacci number and it may hallucinate. Give it a Python execution tool and it will write code, run it, and return the exact answer. The same applies to data analysis, string parsing, file transformation, API request formatting, and hundreds of other tasks that require precise computation rather than approximate reasoning."}),e.jsx(s,{term:"Sandboxed Code Execution",children:"Sandboxed code execution runs agent-generated code in an isolated environment with restricted access to the host system. The sandbox prevents the executed code from reading arbitrary files, making network requests, spawning processes, or consuming unbounded resources. Without sandboxing, a code execution tool is effectively a remote code execution vulnerability — the model (or a prompt injection attack) could run arbitrary commands on your infrastructure."}),e.jsx("h2",{children:"Python subprocess: The Naive Approach"}),e.jsx("p",{children:"The simplest implementation uses Python's subprocess module to run code in a child process. This approach is easy to implement and works for trusted code, but provides limited isolation. Use it only for internal tools where you trust the code source."}),e.jsx(t,{title:"Basic Code Execution with subprocess",tabs:{python:`import subprocess
import json
import tempfile
import os
from pathlib import Path

def execute_python(code: str, timeout: int = 10, max_output_bytes: int = 50_000) -> str:
    """
    Execute Python code in a subprocess with timeout and output limits.
    Returns structured output the LLM can reason about.

    WARNING: This does NOT provide strong sandboxing. Use only for trusted code.
    """
    # Write code to a temp file to avoid shell injection
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.py', delete=False, dir='/tmp'
    ) as f:
        f.write(code)
        temp_path = f.name

    try:
        result = subprocess.run(
            ["python3", temp_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            # Restrict environment variables available to subprocess
            env={
                "PATH": "/usr/bin:/usr/local/bin",
                "PYTHONPATH": "",
                "HOME": "/tmp"
            }
        )

        stdout = result.stdout
        stderr = result.stderr

        # Enforce output size limits
        if len(stdout) > max_output_bytes:
            stdout = stdout[:max_output_bytes] + f"\\n[OUTPUT TRUNCATED: {len(result.stdout)} total bytes]"

        return json.dumps({
            "success": result.returncode == 0,
            "stdout": stdout,
            "stderr": stderr[:2000] if stderr else "",
            "return_code": result.returncode
        })

    except subprocess.TimeoutExpired:
        return json.dumps({
            "error": "TIMEOUT",
            "message": f"Code execution exceeded {timeout} second timeout.",
            "suggestion": "Optimize the code or break it into smaller steps."
        })
    except Exception as e:
        return json.dumps({
            "error": "EXECUTION_ERROR",
            "message": str(e)
        })
    finally:
        Path(temp_path).unlink(missing_ok=True)

# Tool schema
PYTHON_EXEC_TOOL = {
    "name": "execute_python",
    "description": (
        "Execute Python code and return the output. "
        "Use for calculations, data transformations, file parsing, or any task requiring "
        "precise computation. stdout is captured and returned. "
        "Execution is limited to 10 seconds. "
        "Available libraries: standard library + numpy, pandas, requests."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "Python code to execute. Use print() to produce output."
            }
        },
        "required": ["code"]
    }
}`}}),e.jsx("h2",{children:"E2B: Cloud Sandboxed Execution"}),e.jsx("p",{children:"E2B (e2b.dev) provides cloud-hosted, fully sandboxed code execution environments. Each execution runs in an isolated microVM with no access to your infrastructure. This is the recommended approach for production agents that run untrusted or model-generated code."}),e.jsx(t,{title:"Sandboxed Code Execution with E2B",tabs:{python:`# pip install e2b-code-interpreter anthropic
import json
import os
from e2b_code_interpreter import Sandbox
from anthropic import Anthropic

client = Anthropic()

def execute_python_e2b(code: str, sandbox_id: str = None) -> str:
    """
    Execute code in an E2B cloud sandbox.
    Each sandbox is a fully isolated microVM — safe for model-generated code.
    """
    try:
        # Reuse sandbox across multiple calls for efficiency
        with Sandbox(api_key=os.environ["E2B_API_KEY"]) as sandbox:
            execution = sandbox.run_code(code)

            output_parts = []
            for log in execution.logs.stdout:
                output_parts.append(log)

            error_parts = []
            for log in execution.logs.stderr:
                error_parts.append(log)

            return json.dumps({
                "success": not execution.error,
                "output": "\\n".join(output_parts),
                "error": execution.error.value if execution.error else None,
                "stderr": "\\n".join(error_parts)
            })

    except Exception as e:
        return json.dumps({
            "error": "SANDBOX_ERROR",
            "message": f"Failed to execute in sandbox: {str(e)}"
        })

def run_code_agent(task: str) -> str:
    """Agent that uses E2B for safe code execution."""
    tools = [
        {
            "name": "execute_python",
            "description": (
                "Execute Python code in a secure sandbox. "
                "The sandbox has Python 3.11, numpy, pandas, matplotlib, and scikit-learn. "
                "Use print() to show output. Files written persist for the session."
            ),
            "input_schema": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Python code to run. Use print() for output."
                    }
                },
                "required": ["code"]
            }
        }
    ]

    messages = [{"role": "user", "content": task}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=4096,
            tools=tools,
            messages=messages
        )

        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Done."

        tool_results = []
        for block in response.content:
            if block.type == "tool_use" and block.name == "execute_python":
                result = execute_python_e2b(block.input["code"])
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

# Example usage
result = run_code_agent(
    "Calculate the first 20 prime numbers and show their sum."
)
print(result)`}}),e.jsx("h2",{children:"Docker-Based Execution"}),e.jsx("p",{children:"For self-hosted sandboxing, Docker containers provide strong isolation without relying on a third-party service. Each code execution runs in a fresh container that is destroyed after completion."}),e.jsx(t,{title:"Docker-Based Code Execution",tabs:{python:`import docker  # pip install docker
import json
import tempfile
import os

def execute_in_docker(
    code: str,
    image: str = "python:3.11-slim",
    timeout: int = 15,
    memory_limit: str = "128m",
    cpu_period: int = 100000,
    cpu_quota: int = 50000  # 50% of one CPU
) -> str:
    """
    Execute Python code in an isolated Docker container.
    Container is destroyed after execution.
    """
    docker_client = docker.from_env()

    # Write code to a temp file to mount into the container
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.py', delete=False, dir='/tmp'
    ) as f:
        f.write(code)
        code_path = f.name

    container = None
    try:
        container = docker_client.containers.run(
            image=image,
            command=["python3", "/code/script.py"],
            volumes={code_path: {"bind": "/code/script.py", "mode": "ro"}},
            # Security constraints
            mem_limit=memory_limit,
            cpu_period=cpu_period,
            cpu_quota=cpu_quota,
            network_disabled=True,      # No network access
            read_only=True,             # Read-only filesystem
            user="nobody",              # Non-root user
            security_opt=["no-new-privileges"],
            # Run in detached mode for timeout control
            detach=True,
            remove=False,               # We'll remove manually
            stdout=True,
            stderr=True
        )

        # Wait for completion with timeout
        exit_code = container.wait(timeout=timeout)["StatusCode"]
        logs = container.logs(stdout=True, stderr=True).decode("utf-8")

        return json.dumps({
            "success": exit_code == 0,
            "output": logs[:50000],  # Limit output size
            "exit_code": exit_code
        })

    except docker.errors.ContainerError as e:
        return json.dumps({
            "error": "CONTAINER_ERROR",
            "message": str(e),
            "output": e.stderr.decode("utf-8") if e.stderr else ""
        })
    except Exception as e:
        return json.dumps({
            "error": "DOCKER_ERROR",
            "message": str(e),
            "suggestion": "Check that Docker is running and the image is available."
        })
    finally:
        if container:
            try:
                container.remove(force=True)
            except Exception:
                pass
        try:
            os.unlink(code_path)
        except Exception:
            pass`}}),e.jsx("h2",{children:"Output Capturing and Size Limits"}),e.jsx("p",{children:"Agent-generated code can produce very large outputs: printing a DataFrame, dumping a JSON file, or logging debug information. Without size limits, large outputs flood the context window and degrade performance. Always cap output and communicate the truncation to the model."}),e.jsx(o,{name:"Output Normalization",category:"Code Execution",description:"Always normalize execution output before returning it to the agent. Truncate large outputs with a clear message, separate stdout from stderr, and include the exit code. The model uses all of this to determine whether the code succeeded and what to do next.",when:["Any code execution tool that captures stdout/stderr","Tools that run external processes","Tools that read potentially large file contents"],avoid:["Returning raw exception tracebacks without parsing","Allowing unbounded output that can overflow the context window","Silently truncating output without telling the model"]}),e.jsx(r,{title:"Pre-install libraries in the execution environment",children:"Agents frequently want to use libraries like numpy, pandas, or requests. If these require installation at runtime, each code execution gains significant latency and may fail due to network restrictions in the sandbox. Pre-build a Docker image or E2B sandbox template with the libraries your agent is likely to need. Document the available libraries in the tool description so the model knows what it can use without trying to install anything."}),e.jsx(a,{title:"Never execute code with access to production credentials",children:"Code execution sandboxes must not have access to production databases, API keys, or internal services. An adversarial prompt or a hallucinated code path could exfiltrate secrets or corrupt data. Mount only the minimum data the agent needs, use read-only mounts where possible, and disable network access unless the task explicitly requires it. Treat agent-generated code as untrusted input, always."}),e.jsx(n,{title:"Persistent sessions improve performance for iterative tasks",children:"For agents that write and refine code iteratively — debugging, data exploration — persistent execution sessions (keeping the same sandbox alive across multiple tool calls) dramatically improve performance. Variables, imported libraries, and created files persist between calls. E2B supports persistent sandboxes; Docker requires explicit volume management. The tradeoff is that state from earlier calls can affect later ones unexpectedly."})]})}const V=Object.freeze(Object.defineProperty({__proto__:null,default:E},Symbol.toStringTag,{value:"Module"})),P=`import json
import time
from anthropic import Anthropic
from dataclasses import dataclass, field

client = Anthropic()

@dataclass
class BenchmarkTask:
    task_id: str
    prompt: str
    expected_keywords: list[str]   # Minimal grading: correct answer contains these
    max_steps: int = 10

@dataclass
class BenchmarkResult:
    task_id: str
    success: bool
    steps_taken: int
    wall_time_s: float
    input_tokens: int
    output_tokens: int
    final_answer: str

# ── Minimal agent for benchmark evaluation ────────────────────────────────────

tools = [
    {
        "name": "python_eval",
        "description": "Evaluate a Python expression and return the result.",
        "input_schema": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Python expression to evaluate"}
            },
            "required": ["code"]
        }
    },
    {
        "name": "lookup",
        "description": "Look up a fact from a simulated knowledge base.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Fact to look up"}
            },
            "required": ["query"]
        }
    }
]

KNOWLEDGE_BASE = {
    "webArena": "WebArena is a benchmark for autonomous web agents with 812 tasks across 5 websites.",
    "swe-bench": "SWE-bench evaluates agents on real GitHub issues from Python repositories.",
    "hotpotqa": "HotpotQA requires multi-hop reasoning across 2 Wikipedia documents.",
    "agentbench": "AgentBench covers 8 environments including OS, DB, web browsing, and games.",
}

def run_tool(name: str, inputs: dict) -> str:
    if name == "python_eval":
        try:
            import math
            result = eval(inputs["code"], {"__builtins__": {}}, {"math": math, "abs": abs, "round": round})
            return str(result)
        except Exception as e:
            return f"Error: {e}"
    if name == "lookup":
        for key, val in KNOWLEDGE_BASE.items():
            if key.lower() in inputs["query"].lower():
                return val
        return "No entry found."
    return "Unknown tool"

def run_benchmark_task(task: BenchmarkTask) -> BenchmarkResult:
    """Run a single benchmark task and measure performance."""
    messages = [{"role": "user", "content": task.prompt}]
    total_input = 0
    total_output = 0
    steps = 0
    start = time.perf_counter()

    while steps < task.max_steps:
        steps += 1
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )
        total_input += response.usage.input_tokens
        total_output += response.usage.output_tokens
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            answer = next((b.text for b in response.content if hasattr(b, "text")), "")
            success = all(kw.lower() in answer.lower() for kw in task.expected_keywords)
            elapsed = time.perf_counter() - start
            return BenchmarkResult(
                task_id=task.task_id,
                success=success,
                steps_taken=steps,
                wall_time_s=round(elapsed, 2),
                input_tokens=total_input,
                output_tokens=total_output,
                final_answer=answer[:200]
            )

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)
                tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})
        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    elapsed = time.perf_counter() - start
    return BenchmarkResult(
        task_id=task.task_id, success=False, steps_taken=steps,
        wall_time_s=round(elapsed, 2), input_tokens=total_input,
        output_tokens=total_output, final_answer="MAX_STEPS_EXCEEDED"
    )

def run_benchmark_suite(tasks: list[BenchmarkTask]) -> dict:
    """Run a suite of tasks and aggregate metrics."""
    results = [run_benchmark_task(t) for t in tasks]
    successes = [r for r in results if r.success]

    return {
        "total_tasks": len(results),
        "successes": len(successes),
        "success_rate": round(len(successes) / len(results), 3),
        "avg_steps": round(sum(r.steps_taken for r in results) / len(results), 1),
        "avg_wall_time_s": round(sum(r.wall_time_s for r in results) / len(results), 2),
        "total_input_tokens": sum(r.input_tokens for r in results),
        "total_output_tokens": sum(r.output_tokens for r in results),
        "results": [vars(r) for r in results]
    }

# ── Example benchmark suite ───────────────────────────────────────────────────

tasks = [
    BenchmarkTask(
        task_id="math_001",
        prompt="What is the cube root of 27000 plus 5 factorial?",
        expected_keywords=["150"]
    ),
    BenchmarkTask(
        task_id="info_001",
        prompt="What is SWE-bench and what does it evaluate?",
        expected_keywords=["GitHub", "Python"]
    ),
    BenchmarkTask(
        task_id="multistep_001",
        prompt="Calculate 2 to the power of 10, then subtract 24. What benchmark covers 8 environments?",
        expected_keywords=["1000", "AgentBench"]
    ),
]

report = run_benchmark_suite(tasks)
print(json.dumps(report, indent=2))`;function C(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Agent Benchmarks"}),e.jsx("p",{children:"Measuring agent capability is harder than measuring standard machine learning model performance. Classification accuracy on a fixed test set is straightforward. Agent evaluation requires assessing whether an agent can complete open-ended tasks in dynamic environments, use tools correctly, recover from errors, and produce the right final output after an arbitrary number of steps. A set of standard benchmarks has emerged to make these measurements comparable across systems."}),e.jsx(s,{term:"Agent Benchmark",tag:"Evaluation",children:"An agent benchmark is a standardized evaluation suite that measures an agent's ability to complete tasks in a defined environment. Benchmarks specify tasks (what the agent must accomplish), environments (what tools and information are available), evaluation criteria (how success is judged), and metrics (quantitative scores for comparison). Standard benchmarks enable reproducible, comparable evaluation across different agent architectures and models."}),e.jsx("h2",{children:"Major Agent Benchmarks"}),e.jsx("h3",{children:"WebArena"}),e.jsx("p",{children:'WebArena evaluates agents on real web-browsing tasks across five websites: an e-commerce store (OneStopShop), a forum (Reddit), a code repository (GitLab), a map application (OpenStreetMap), and a collaborative editing platform (Wikipedia). The benchmark contains 812 tasks ranging from "find the price of this product" to "create a pull request that fixes this bug." Tasks are evaluated functionally — the correct state must be reached, not just the correct text produced. State-of-the-art agents achieve roughly 10–35% success rates on WebArena, illustrating how hard real-world web tasks remain.'}),e.jsx("h3",{children:"SWE-bench"}),e.jsx("p",{children:"SWE-bench (Software Engineering benchmark) evaluates agents on real GitHub issues from popular Python repositories. Each task presents the agent with a failing test case and the full codebase; the agent must identify the bug and produce a patch that makes the tests pass. SWE-bench is notable for testing practical software engineering capability and for its strict, automated evaluation — a patch either passes the tests or it does not. The SWE-bench Verified subset contains 500 tasks that are confirmed solvable by humans and is widely used for model comparison."}),e.jsx("h3",{children:"HotpotQA"}),e.jsx("p",{children:`HotpotQA is a multi-hop question-answering benchmark requiring an agent to reason across two or more Wikipedia documents to answer a question. For example: "What nationality is the director of the film that won the Palme d'Or in 1994?" requires finding the 1994 Palme d'Or winner, then finding the director's nationality. HotpotQA tests multi-step information retrieval and synthesis — capabilities directly relevant to research and analysis agents.`}),e.jsx("h3",{children:"AgentBench"}),e.jsx("p",{children:"AgentBench is a comprehensive benchmark covering eight diverse environments: an operating system (bash), a relational database (MySQL), a knowledge graph, a web browsing environment, web shopping, a lateral thinking puzzle, and two game environments (Alfworld and Mind2Web). The breadth of AgentBench makes it useful for evaluating generalist agents that must handle heterogeneous task types."}),e.jsx("h3",{children:"GAIA"}),e.jsx("p",{children:"GAIA (General AI Assistant benchmark) evaluates agents on real-world questions that require a combination of web search, file analysis, multi-step reasoning, and tool use. GAIA questions are written to be unambiguous to humans but require using multiple tools and reasoning steps. The benchmark has three difficulty levels, with the hardest requiring agents to orchestrate many tools over many steps."}),e.jsx("h3",{children:"τ-bench (tau-bench)"}),e.jsx("p",{children:"τ-bench focuses on tool-use-heavy tasks where the agent must interact with a simulated environment through a realistic set of APIs. It emphasizes measuring whether agents use tools correctly and efficiently, not just whether they reach the right final answer. This makes it particularly useful for evaluating the tool-use quality of production agents."}),e.jsx(n,{type:"note",title:"Benchmark scores are not product metrics",children:"Standard benchmark scores measure capability on standardized tasks in controlled environments. They are a useful proxy for relative model and agent quality, but they do not directly predict performance on your specific task distribution, with your specific tools, in your production environment. Always evaluate on your own task distribution before drawing conclusions from benchmark scores."}),e.jsx("h2",{children:"Benchmark Evaluation Criteria"}),e.jsx("h3",{children:"Functional Correctness"}),e.jsx("p",{children:"The most common evaluation criterion: did the agent achieve the desired end state? For coding benchmarks, this means tests pass. For web benchmarks, this means the correct page state was reached. Functional correctness ignores how the agent got there — an agent that takes 20 steps when 3 suffice can still score 100% on correctness."}),e.jsx("h3",{children:"Efficiency"}),e.jsx("p",{children:"Some benchmarks also measure how many steps or tokens were consumed. An agent that solves tasks correctly but uses 10x more steps or tokens than necessary is less useful in production where latency and cost matter. Efficiency metrics complement correctness to provide a fuller picture of agent quality."}),e.jsx("h3",{children:"Exact Match vs. Semantic Match"}),e.jsx("p",{children:"Simple benchmarks use exact string matching for evaluation; more sophisticated ones use semantic similarity, LLM-based grading, or functional state checking. The evaluation method significantly affects apparent performance — a model that gives a correct but slightly differently phrased answer will score 0% on exact match and near 100% on semantic match."}),e.jsx(o,{name:"Internal Benchmark Suite",category:"Evaluation",whenToUse:"Any production agent system. Build a task suite representative of your actual use cases, with automated success criteria, and run it on every model update or major prompt change. Standard benchmarks tell you how your agent compares to the field; your internal suite tells you whether it is regressing.",children:"Maintain an internal benchmark suite derived from real production tasks. Track success rate, average steps, and token cost over time. Run it as part of your CI/CD pipeline. Standard benchmarks are research tools; your internal suite is your regression test."}),e.jsx("h2",{children:"Building an Internal Benchmark Runner"}),e.jsx("p",{children:"The example below implements a lightweight benchmark runner that measures success rate, step count, wall-clock time, and token consumption across a suite of tasks. This is the core pattern for internal evaluation infrastructure."}),e.jsx(t,{title:"Agent Benchmark Runner",tabs:{python:P}}),e.jsx(r,{title:"Measure leading indicators, not just final scores",children:"Track intermediate metrics alongside final success rates: average steps taken per task, rate of tool call errors, rate of hitting the maximum step limit, and token cost per successful task completion. These leading indicators reveal systematic problems — a model that is getting stuck in loops, calling the wrong tools, or producing invalid tool inputs — before they manifest as declining success rates."})]})}const J=Object.freeze(Object.defineProperty({__proto__:null,default:C},Symbol.toStringTag,{value:"Module"})),M=`from anthropic import Anthropic
import json
from dataclasses import dataclass, field

client = Anthropic()

# ── Data structures for trajectory recording ──────────────────────────────────

@dataclass
class TrajectoryStep:
    step_num: int
    reasoning: str          # Text the model produced before the tool call
    tool_name: str | None
    tool_input: dict | None
    tool_result: str | None
    was_helpful: bool | None = None   # Set by evaluator

@dataclass
class Trajectory:
    task_id: str
    goal: str
    steps: list[TrajectoryStep] = field(default_factory=list)
    final_answer: str = ""
    succeeded: bool = False

# ── Agent that records its trajectory ─────────────────────────────────────────

TOOLS = [
    {
        "name": "search",
        "description": "Search for information on a topic.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "calculator",
        "description": "Evaluate an arithmetic expression.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {"type": "string"}
            },
            "required": ["expression"]
        }
    }
]

def run_tool(name, inputs):
    if name == "search":
        return f"Results for '{inputs['query']}': [simulated relevant data]"
    if name == "calculator":
        try:
            return str(eval(inputs["expression"], {"__builtins__": {}}))
        except Exception as e:
            return f"Error: {e}"
    return "Unknown tool"

def run_with_trajectory(goal: str, task_id: str = "task_001", max_steps=10) -> Trajectory:
    """Run agent and record full trajectory for evaluation."""
    traj = Trajectory(task_id=task_id, goal=goal)
    messages = [{"role": "user", "content": goal}]
    step_num = 0

    while step_num < max_steps:
        step_num += 1
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages
        )
        messages.append({"role": "assistant", "content": response.content})

        # Extract reasoning text (produced before tool calls)
        reasoning_parts = [b.text for b in response.content if hasattr(b, "text")]
        reasoning = " ".join(reasoning_parts)

        if response.stop_reason == "end_turn":
            final = reasoning or "No text output."
            traj.final_answer = final
            traj.succeeded = True  # Would check against expected answer in real eval
            traj.steps.append(TrajectoryStep(
                step_num=step_num, reasoning=reasoning,
                tool_name=None, tool_input=None, tool_result=None
            ))
            break

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)
                traj.steps.append(TrajectoryStep(
                    step_num=step_num,
                    reasoning=reasoning,
                    tool_name=block.name,
                    tool_input=block.input,
                    tool_result=result
                ))
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    return traj

# ── LLM-based trajectory evaluator ────────────────────────────────────────────

EVALUATOR_SYSTEM = """You are an impartial agent trajectory evaluator.
You will receive a task goal and a recorded sequence of agent actions.
Evaluate each step and the overall trajectory.

Return a JSON object:
{
  "step_evaluations": [
    {
      "step_num": <int>,
      "appropriate": <bool>,    // Was this action appropriate for the goal?
      "efficient": <bool>,      // Did it make meaningful progress?
      "issue": "<string or null>"  // Describe any problem
    }
  ],
  "overall": {
    "coherent": <bool>,         // Did the agent maintain a coherent strategy?
    "minimal_steps": <bool>,    // Could it have been done in fewer steps?
    "safe": <bool>,             // Were all actions safe and reversible?
    "quality_score": <float>    // 0.0 to 1.0
  },
  "summary": "<one sentence assessment>"
}"""

def evaluate_trajectory(traj: Trajectory) -> dict:
    """Use LLM to evaluate the quality of an agent trajectory."""
    steps_text = ""
    for s in traj.steps:
        if s.tool_name:
            steps_text += f"Step {s.step_num}: [{s.tool_name}({json.dumps(s.tool_input)})]\\n"
            steps_text += f"  Reasoning: {s.reasoning[:150]}...\\n"
            steps_text += f"  Result: {s.tool_result}\\n\\n"
        else:
            steps_text += f"Step {s.step_num}: [FINAL ANSWER] {s.reasoning[:200]}\\n"

    prompt = f"""Task Goal: {traj.goal}

Agent Trajectory:
{steps_text}

Final Answer: {traj.final_answer[:200]}
Success: {traj.succeeded}

Evaluate this trajectory."""

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=EVALUATOR_SYSTEM,
        messages=[{"role": "user", "content": prompt}]
    )
    raw = response.content[0].text.strip()
    if raw.startswith(""):
        raw = raw.split("\\n", 1)[1].rsplit("", 1)[0]
    try:
        return json.loads(raw)
    except Exception:
        return {"error": "Parse failed", "raw": raw}

# ── Demo ──────────────────────────────────────────────────────────────────────

traj = run_with_trajectory(
    "What is the square root of 144 multiplied by the number of planets in the solar system?",
    task_id="math_planets_001"
)
evaluation = evaluate_trajectory(traj)
print("Trajectory Evaluation:")
print(json.dumps(evaluation, indent=2))`;function I(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Trajectory Evaluation"}),e.jsx("p",{children:"Final-answer evaluation — checking whether an agent produced the right output — is necessary but not sufficient for understanding agent quality. Two agents can both produce the correct final answer while exhibiting radically different behavior along the way: one takes three efficient, correct steps; the other takes twelve steps, makes several wrong tool calls, corrects itself twice, and arrives at the right answer by accident. These agents are not equally good. Trajectory evaluation assesses the quality of the agent's entire action sequence, not just its endpoint."}),e.jsx(s,{term:"Trajectory Evaluation",tag:"Evaluation Technique",children:"Trajectory evaluation is the assessment of the quality, efficiency, and safety of an agent's complete action sequence — the series of observations, reasoning steps, tool calls, and observations that lead from the initial task to the final answer. It distinguishes between agents that reach correct answers through sound reasoning and those that arrive there through inefficient or accidental paths."}),e.jsx("h2",{children:"Why Trajectory Quality Matters"}),e.jsx("h3",{children:"Cost and Latency"}),e.jsx("p",{children:"An agent that takes 15 steps where 4 would suffice incurs 3–4x the token cost and wall-clock latency. At scale, this difference is economically significant. Trajectory evaluation reveals whether an agent is systematically over-stepping — a pattern that final-answer metrics completely miss."}),e.jsx("h3",{children:"Safety"}),e.jsx("p",{children:"An agent that calls a write-capable tool when a read-only tool would have been sufficient, or one that queries external services unnecessarily, may still reach the right answer while violating least-privilege principles. Trajectory evaluation catches unsafe or unnecessarily broad action selection that final-answer evaluation ignores."}),e.jsx("h3",{children:"Diagnosability"}),e.jsx("p",{children:"When an agent fails, the trajectory is the diagnostic record. Understanding why an agent failed — wrong tool selected, misinterpreted observation, reasoning loop — requires examining the full sequence of steps. Without systematic trajectory logging and evaluation, failure analysis is guesswork."}),e.jsx("h3",{children:"Behavioral Consistency"}),e.jsx("p",{children:"Correct answers with incoherent reasoning are fragile. An agent that happens to produce the right answer while exhibiting confused or contradictory reasoning across its steps will likely fail on related tasks. Trajectory coherence is a leading indicator of robustness to distribution shift."}),e.jsx("h2",{children:"Trajectory Evaluation Dimensions"}),e.jsx("h3",{children:"Appropriateness"}),e.jsx("p",{children:"Was each action the right choice given the current state and goal? An appropriate action makes progress toward the goal using the correct tool for the situation. Inappropriate actions include calling a web search tool when the answer is already in the context, selecting a delete operation when a read would suffice, or calling a tool with incorrect parameters."}),e.jsx("h3",{children:"Efficiency"}),e.jsx("p",{children:"Did the agent reach the goal with a minimal number of steps? Efficiency measures the ratio of necessary steps to actual steps taken. An efficiency score of 1.0 means every step was necessary; lower scores indicate redundancy. Common inefficiencies include searching for the same information twice, taking exploratory actions that could have been avoided with better upfront reasoning, and making multiple corrective attempts at the same failing tool call."}),e.jsx("h3",{children:"Coherence"}),e.jsx("p",{children:"Does the agent maintain a consistent strategy across its reasoning steps? A coherent agent has a clear mental model of what it has done and what remains. Incoherence manifests as the agent pursuing contradictory approaches simultaneously, losing track of what it already knows, or repeatedly re-examining the same evidence without updating its beliefs."}),e.jsx("h3",{children:"Safety"}),e.jsx("p",{children:"Were all actions reversible or at minimum justified? Did the agent avoid calling tools with side effects when read-only alternatives existed? Did it stay within the scope defined by the task rather than making unauthorized changes to the environment?"}),e.jsx(o,{name:"LLM-as-Evaluator for Trajectories",category:"Evaluation",whenToUse:"When manual review of hundreds or thousands of trajectories is impractical. Use a capable LLM with a structured evaluation rubric to score each trajectory across dimensions like appropriateness, efficiency, coherence, and safety. Validate the LLM evaluator's judgments against human labels on a calibration set.",children:"Use a separate LLM call with a structured evaluation system prompt to score agent trajectories. This scales to large evaluation sets while producing interpretable per-step and overall scores. The evaluator model should be at least as capable as the agent model it is judging."}),e.jsx("h2",{children:"Recording Trajectories"}),e.jsx("p",{children:"Trajectory evaluation requires that trajectories are recorded. This means logging each step of the agent loop: the reasoning text the model produced, the tool that was called and with what inputs, and the result that was returned. At minimum, trajectories should be stored in a format that supports per-step inspection and filtering."}),e.jsx(n,{type:"tip",title:"Log trajectories in production from day one",children:"Add trajectory logging to your agent loop before deploying to production, not after problems arise. Retroactive logging requires re-running failed tasks; proactive logging gives you a complete record of every agent run to analyze when issues emerge. Store the full messages array at each step — it is your ground truth for reconstruction."}),e.jsx("h2",{children:"Implementation: Record and Evaluate Trajectories"}),e.jsx("p",{children:"The example below shows how to instrument an agent loop to record complete trajectories, and then use a separate LLM evaluator to score each trajectory across the key quality dimensions."}),e.jsx(t,{title:"Trajectory Recording and LLM-Based Evaluation",tabs:{python:M}}),e.jsx(a,{title:"LLM evaluators can be inconsistent",children:"LLM-based trajectory evaluation, while scalable, is itself subject to variance. The same trajectory may receive different scores on repeated evaluation runs. Mitigate this by using low temperature settings for the evaluator, providing few-shot examples in the evaluator prompt, and computing scores over multiple runs for high-stakes decisions. Always calibrate against human judgments before trusting LLM evaluator scores in automated pipelines."}),e.jsx("h2",{children:"Aggregate Trajectory Metrics"}),e.jsx("p",{children:"Individual trajectory evaluations are useful for debugging; aggregate metrics across many trajectories reveal systematic patterns. Key aggregate metrics to track include: average steps per task (broken down by task type), step efficiency ratio, rate of inappropriate tool calls, rate of safety violations, and coherence score distribution. Track these metrics over time as you update the agent's prompt, tools, or underlying model."}),e.jsx(r,{title:"Compare trajectories across model versions",children:"When updating the agent's model, system prompt, or tools, run your evaluation suite on both the old and new configuration and compare trajectory metrics side by side. A new model version may improve final-answer accuracy while degrading efficiency or increasing unsafe action rates. Only trajectory-level comparison reveals these regressions."})]})}const X=Object.freeze(Object.defineProperty({__proto__:null,default:I},Symbol.toStringTag,{value:"Module"}));function L(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Cost and Reliability Metrics for Agents"}),e.jsx("p",{children:"Capability metrics — can the agent complete the task? — get most of the attention, but production agents live or die on cost and reliability. A research prototype that completes 80% of tasks but costs $5 per run and fails unpredictably cannot be deployed at scale. Building economically viable, reliably operating agents requires measuring the right metrics, setting targets before deployment, and continuously monitoring against those targets in production."}),e.jsx(s,{term:"Agent Cost Model",children:"The cost of running an agent is primarily driven by token consumption across all API calls in a trajectory. Input tokens cost less than output tokens, but agents with long context windows accumulate large input costs as the conversation history grows. Secondary costs include tool execution (external API calls, compute for code execution), infrastructure (storage, networking), and human review time for tasks requiring oversight. A complete cost model accounts for all of these."}),e.jsx("h2",{children:"Token Usage Metrics"}),e.jsx("p",{children:"Token consumption is the dominant cost driver for LLM agents. Measuring it accurately requires tracking both prompt tokens (input) and completion tokens (output) across every API call in a trajectory, not just the final call. Tools that return large results, long system prompts, and accumulated conversation history all contribute to prompt token costs."}),e.jsx("h3",{children:"Key Token Metrics to Track"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Total tokens per task:"})," Sum of input + output tokens across all agent steps for a completed task. This is your primary cost-per-task driver."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Tokens per step:"})," Average tokens consumed at each agent loop iteration. Spikes indicate abnormally large tool results or unnecessarily verbose reasoning."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Input/output ratio:"})," The ratio of input tokens to output tokens. An increasing ratio over time may indicate context window bloat from accumulated history."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Step count distribution:"})," How many steps does the agent take per task? A bimodal distribution — many simple tasks and some very long tasks — indicates a subpopulation of hard cases that may warrant special handling."]})]}),e.jsx(t,{title:"Tracking Token Usage and Cost Across Agent Runs",tabs:{python:`import json
from dataclasses import dataclass, field
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Cost configuration (update when pricing changes)
# ---------------------------------------------------------------------------

# Prices per million tokens (claude-opus-4-6 pricing as example)
PRICE_PER_M_INPUT_TOKENS = 15.00   # USD
PRICE_PER_M_OUTPUT_TOKENS = 75.00  # USD

def tokens_to_usd(input_tokens: int, output_tokens: int) -> float:
    return (
        input_tokens / 1_000_000 * PRICE_PER_M_INPUT_TOKENS
        + output_tokens / 1_000_000 * PRICE_PER_M_OUTPUT_TOKENS
    )

# ---------------------------------------------------------------------------
# Metrics accumulator
# ---------------------------------------------------------------------------

@dataclass
class AgentRunMetrics:
    task: str
    steps: int = 0
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    tool_calls: int = 0
    errors: int = 0
    success: bool | None = None
    per_step: list[dict] = field(default_factory=list)

    @property
    def total_tokens(self) -> int:
        return self.total_input_tokens + self.total_output_tokens

    @property
    def cost_usd(self) -> float:
        return tokens_to_usd(self.total_input_tokens, self.total_output_tokens)

    def record_step(self, step: int, input_tokens: int, output_tokens: int, tool_calls_this_step: int):
        self.steps = step
        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens
        self.tool_calls += tool_calls_this_step
        self.per_step.append({
            "step": step,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "tool_calls": tool_calls_this_step,
            "running_cost": self.cost_usd,
        })

    def summary(self) -> dict:
        return {
            "task": self.task[:80],
            "success": self.success,
            "steps": self.steps,
            "tool_calls": self.tool_calls,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_tokens": self.total_tokens,
            "cost_usd": round(self.cost_usd, 6),
            "errors": self.errors,
            "avg_tokens_per_step": round(self.total_tokens / max(self.steps, 1)),
        }

# ---------------------------------------------------------------------------
# Agent with instrumented loop
# ---------------------------------------------------------------------------

TOOLS = [
    {
        "name": "web_search",
        "description": "Search the web for current information on a topic.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Search query"}},
            "required": ["query"]
        }
    }
]

def fake_web_search(query: str) -> str:
    """Simulated tool — replace with real implementation."""
    return f"Search results for '{query}': [simulated results for demonstration]"

def run_instrumented_agent(task: str, max_steps: int = 10) -> AgentRunMetrics:
    """Agent loop that records detailed token usage metrics at every step."""
    metrics = AgentRunMetrics(task=task)
    messages = [{"role": "user", "content": task}]

    for step in range(1, max_steps + 1):
        try:
            response = client.messages.create(
                model="claude-opus-4-6",
                max_tokens=1024,
                tools=TOOLS,
                messages=messages,
            )
        except Exception as e:
            metrics.errors += 1
            print(f"Step {step} API error: {e}")
            break

        # Count tool calls this step
        tool_calls_this_step = sum(1 for b in response.content if b.type == "tool_use")

        # Record usage (available in response.usage)
        metrics.record_step(
            step=step,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            tool_calls_this_step=tool_calls_this_step,
        )

        messages.append({"role": "assistant", "content": response.content})

        # Budget guard: stop if this run is getting expensive
        if metrics.cost_usd > 0.50:
            print(f"Cost budget exceeded at step {step}: \${metrics.cost_usd:.4f}")
            metrics.success = False
            break

        if response.stop_reason == "end_turn":
            metrics.success = True
            break

        # Execute tools
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                if block.name == "web_search":
                    result = fake_web_search(**block.input)
                else:
                    result = json.dumps({"error": "unknown tool"})
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })
        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    return metrics


# Run a task and inspect metrics
metrics = run_instrumented_agent(
    "What are the top 3 Python web frameworks by GitHub stars?"
)
print(json.dumps(metrics.summary(), indent=2))
print(f"\\nPer-step breakdown:")
for s in metrics.per_step:
    print(f"  Step {s['step']}: {s['input_tokens']}in + {s['output_tokens']}out "
          f"= {s['input_tokens']+s['output_tokens']} tokens, "
          f"running cost \${s['running_cost']:.5f}")`,typescript:`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Prices per million tokens
const PRICE_PER_M_INPUT = 15.0;
const PRICE_PER_M_OUTPUT = 75.0;

function tokensToCost(input: number, output: number): number {
  return (input / 1_000_000) * PRICE_PER_M_INPUT + (output / 1_000_000) * PRICE_PER_M_OUTPUT;
}

interface StepMetric {
  step: number;
  inputTokens: number;
  outputTokens: number;
  toolCalls: number;
  runningCost: number;
}

class AgentRunMetrics {
  task: string;
  steps = 0;
  totalInputTokens = 0;
  totalOutputTokens = 0;
  toolCalls = 0;
  errors = 0;
  success: boolean | null = null;
  perStep: StepMetric[] = [];

  constructor(task: string) { this.task = task; }

  get totalTokens() { return this.totalInputTokens + this.totalOutputTokens; }
  get costUsd() { return tokensToCost(this.totalInputTokens, this.totalOutputTokens); }

  recordStep(step: number, input: number, output: number, calls: number) {
    this.steps = step;
    this.totalInputTokens += input;
    this.totalOutputTokens += output;
    this.toolCalls += calls;
    this.perStep.push({ step, inputTokens: input, outputTokens: output, toolCalls: calls, runningCost: this.costUsd });
  }

  summary() {
    return {
      task: this.task.slice(0, 80),
      success: this.success,
      steps: this.steps,
      toolCalls: this.toolCalls,
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalTokens: this.totalTokens,
      costUsd: Math.round(this.costUsd * 1_000_000) / 1_000_000,
      errors: this.errors,
      avgTokensPerStep: Math.round(this.totalTokens / Math.max(this.steps, 1)),
    };
  }
}

const tools: Anthropic.Tool[] = [{
  name: "web_search",
  description: "Search the web for current information.",
  input_schema: {
    type: "object" as const,
    properties: { query: { type: "string", description: "Search query" } },
    required: ["query"],
  },
}];

function fakeWebSearch(query: string): string {
  return Search results for '\${query}': [simulated results];
}

async function runInstrumentedAgent(task: string, maxSteps = 10): Promise<AgentRunMetrics> {
  const metrics = new AgentRunMetrics(task);
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];

  for (let step = 1; step <= maxSteps; step++) {
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({ model: "claude-opus-4-6", max_tokens: 1024, tools, messages });
    } catch (err) {
      metrics.errors++;
      console.error(Step \${step} error:, err);
      break;
    }

    const toolCallCount = response.content.filter((b) => b.type === "tool_use").length;
    metrics.recordStep(step, response.usage.input_tokens, response.usage.output_tokens, toolCallCount);
    messages.push({ role: "assistant", content: response.content });

    if (metrics.costUsd > 0.5) {
      console.log(Cost budget exceeded at step \${step}: $\${metrics.costUsd.toFixed(4)});
      metrics.success = false;
      break;
    }

    if (response.stop_reason === "end_turn") { metrics.success = true; break; }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inp = block.input as { query: string };
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: fakeWebSearch(inp.query) });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
  }
  return metrics;
}

async function main() {
  const metrics = await runInstrumentedAgent("What are the top 3 Python web frameworks by GitHub stars?");
  console.log(JSON.stringify(metrics.summary(), null, 2));
  console.log("\\nPer-step breakdown:");
  for (const s of metrics.perStep) {
    console.log(  Step \${s.step}: \${s.inputTokens}in + \${s.outputTokens}out = \${s.inputTokens + s.outputTokens} tokens, $\${s.runningCost.toFixed(5)});
  }
}

main();`}}),e.jsx("h2",{children:"Latency Metrics"}),e.jsx("p",{children:"Agent latency is the wall-clock time from when a user submits a task to when the agent delivers a final result. It compounds across steps: each step adds LLM inference time, network round-trip time, and tool execution time. For a 10-step agent, a 2-second LLM call per step plus 500ms of tool execution means 25 seconds of minimum latency — before accounting for variation in tool response times."}),e.jsx("h3",{children:"Latency Components"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Time to first token (TTFT):"})," Latency until the model begins responding. Relevant for streaming agents where users see reasoning as it is generated."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Step latency:"})," Time per agent loop iteration. This is the primary lever for overall task latency."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Tool execution latency:"})," Time spent waiting for tool results. External API calls, database queries, and code execution all contribute. Can often be parallelized."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Total task latency:"})," End-to-end time from task submission to final answer. The metric users actually experience."]})]}),e.jsx("h2",{children:"Failure Rate Metrics"}),e.jsx("p",{children:"Agents fail in several distinct ways, each requiring different remediation. Tracking failure rates by category reveals which types of failures are most common and most impactful."}),e.jsx("h3",{children:"Failure Categories"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Task failure:"})," The agent completed without error but produced an incorrect or incomplete answer. Measured by accuracy evaluation against ground truth."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Max-step termination:"})," The agent hit the iteration limit without completing the task. Almost always indicates a reasoning or tool loop issue."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Tool error rate:"})," The fraction of tool calls that return error responses rather than valid results. A high rate indicates flaky tools or incorrect argument construction."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"API error rate:"})," Failures due to LLM API timeouts, rate limits, or server errors. Should be near zero in production with proper retry logic."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Budget exhaustion:"})," The agent exceeded its token or cost budget. Indicates tasks that are more complex than anticipated or runaway loops."]})]}),e.jsx(o,{name:"Cost Budget Guard",category:"Reliability",description:"Implement a per-task cost budget that terminates the agent if cumulative spend exceeds a threshold. Calculate running cost after each step using the token counts in the API response. Return a partial result with a clear explanation when the budget is exceeded. This prevents runaway tasks from consuming unexpected costs and is a critical production safety mechanism.",when:["Any agent deployed in production with real API costs","Agents that may encounter unexpectedly complex tasks","Multi-tenant systems where per-user cost control is required"],avoid:["Setting the budget so low that legitimate tasks are frequently truncated","Terminating without returning a partial result and explanation","Using step count alone without considering variable per-step costs"]}),e.jsx("h2",{children:"Setting Cost and Reliability SLOs"}),e.jsx("p",{children:"Service Level Objectives (SLOs) for agents should be defined before deployment and monitored continuously in production. Typical targets depend heavily on the use case, but common benchmarks include:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Task success rate:"})," The percentage of tasks completed correctly. Target depends on stakes — 95% may be acceptable for low-stakes research tasks, 99.9%+ required for financial operations."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"p95 latency:"})," The 95th percentile of task completion time. Mean latency is misleading because agent latency distributions have long tails driven by complex tasks."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"p95 cost per task:"})," The 95th percentile of per-task cost. Like latency, cost distributions have long tails that the mean obscures."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Max-step termination rate:"})," Should be below 1–2% in a healthy agent. Higher rates indicate systematic issues with task coverage or tool reliability."]})]}),e.jsx(r,{title:"Track the 95th percentile, not the mean",children:"Agent costs and latencies are not normally distributed. A small fraction of tasks — the hardest, most ambiguous, or most tool-intensive — consume dramatically more tokens and time than typical tasks. Mean metrics look fine right up until a complex task triggers a runaway loop. Track the 95th and 99th percentiles of both cost and latency, set budget guards accordingly, and investigate outliers proactively."}),e.jsx("h2",{children:"Caching for Cost Reduction"}),e.jsx("p",{children:"Prompt caching dramatically reduces the cost of repeated agent invocations that share a common prefix — typically the system prompt and static tool definitions. If your system prompt and tool schemas are 2,000 tokens and you run 10,000 agent tasks per day, prompt caching eliminates 20 million input tokens of cost daily. Most LLM providers offer prompt caching for repeated prefixes longer than a few hundred tokens."}),e.jsx(a,{title:"Cached token prices differ from standard prices",children:"When using prompt caching, cache write requests cost more per token than standard requests to prime the cache. Cache read requests cost less. Your cost model must account for both the cache hit rate and the different pricing. On high-volume deployments where the same system prompt is reused frequently, caching typically reduces costs by 60–80% on the cached portions, but the savings only materialize if your implementation correctly structures requests to maximize cache hits."}),e.jsx(n,{title:"Cost and quality trade-offs are real",children:"Cheaper, faster models cost less per token but may require more steps to complete the same task, partially offsetting the per-token savings. More capable models often complete tasks in fewer steps with lower failure rates. Benchmark your specific task distribution across model tiers before assuming a cheaper model reduces total cost — the relationship between model capability, step count, and final task success rate is non-linear and workload-dependent."})]})}const Q=Object.freeze(Object.defineProperty({__proto__:null,default:L},Symbol.toStringTag,{value:"Module"}));export{U as a,B as b,D as c,z as d,F as e,H as f,G as g,$ as h,Y as i,K as j,V as k,J as l,X as m,Q as n,W as s};
