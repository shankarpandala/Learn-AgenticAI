import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import PatternBlock from '../../../components/content/PatternBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import WarningBlock from '../../../components/content/WarningBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import FlowDiagram from '../../../components/viz/FlowDiagram.jsx';

const reactCode = `from anthropic import Anthropic
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
print(answer)`;

export default function ReActPattern() {
  return (
    <div className="lesson-content">
      <h2>The ReAct Pattern: Reasoning and Acting Together</h2>

      <p>
        Early approaches to LLM tool use sent the model a list of tools and let it call them
        directly, without any visible reasoning in between. The model read the question, picked a
        tool, received the result, and either called another tool or produced an answer. This works
        for simple tasks, but it is brittle for anything multi-step: when the agent makes a wrong
        turn, there is no record of why it made that choice, making debugging nearly impossible and
        self-correction unlikely.
      </p>

      <p>
        ReAct, introduced by Yao et al. in 2022, addresses this by interleaving explicit reasoning
        traces with action steps. Before taking any action, the model writes out its current
        understanding of the problem, what it needs to find out, and why it is choosing a
        particular tool. This reasoning becomes part of the conversation history, giving the model
        a structured record to refer back to, and giving developers a window into the agent's
        decision process.
      </p>

      <ConceptBlock
        title="ReAct (Reasoning + Acting)"
        definition="ReAct is an agent prompting pattern that structures the agent's behavior as an alternating sequence of Thought, Action, and Observation steps. In the Thought step, the model reasons about the current state of the problem. In the Action step, it calls a tool or produces a final answer. In the Observation step, the result of the tool call is fed back. This cycle repeats until the model determines the task is complete. The name is a portmanteau of 'Reasoning' and 'Acting'."
      />

      <PatternBlock
        name="ReAct Pattern"
        category="Reasoning"
        description="Structure agent behavior as an explicit Thought → Action → Observation loop. The Thought step forces the model to articulate its reasoning before committing to an action, improving accuracy on multi-step tasks and making failure modes observable."
        when={[
          "The task requires multiple sequential tool calls where each depends on the previous result",
          "You need to debug why an agent is making particular decisions",
          "The task benefits from self-correction — the agent may need to revise its approach mid-task",
          "You want the agent to explain its reasoning to users alongside its final answer",
          "The problem space is complex enough that direct action-selection without reasoning leads to errors"
        ]}
        avoid={[
          "Simple single-tool calls where the action is obvious from the question",
          "High-latency-sensitive paths where the extra reasoning tokens add unacceptable overhead",
          "Tasks where verbose reasoning output is unwanted by downstream consumers"
        ]}
      />

      <h2>The Thought-Action-Observation Loop</h2>

      <p>
        Understanding the ReAct loop precisely helps both in implementing it and in diagnosing
        failures when they occur.
      </p>

      <FlowDiagram
        direction="vertical"
        steps={["Thought", "Action", "Observation", "Thought (next iteration)"]}
        description="The ReAct loop: the model thinks about the current state, takes an action (tool call or final answer), receives an observation (tool result), and thinks again. The loop continues until the model produces a final answer."
      />

      <h3>Thought</h3>
      <p>
        The Thought step is the model's internal monologue. It synthesizes what has been observed
        so far, identifies what information is still missing, and reasons about what action will
        move the task forward. In modern implementations using the Anthropic SDK, this reasoning
        happens naturally in the model's response — Claude will produce text before tool calls
        explaining what it is about to do and why. This text is captured in the conversation
        history as the model's reasoning trace.
      </p>

      <h3>Action</h3>
      <p>
        The Action step is a concrete, executable step. In tool-using agents this is a tool call
        with specific parameters. In the original ReAct formulation for text-generation models,
        actions were formatted as specially tagged text. In modern SDK-based implementations, the
        model's tool use mechanism handles this naturally — when the model emits a tool call block,
        that is the Action.
      </p>

      <h3>Observation</h3>
      <p>
        The Observation is the result returned by executing the action. A calculator tool returns
        a number. A search tool returns a list of snippets. A file reader returns file contents.
        This observation is appended to the conversation history as a tool result, and the model
        reads it in the next Thought step. The quality of observations — whether they are clear,
        informative, and structured — has a large effect on the agent's ability to reason about
        what it learned.
      </p>

      <h2>Why ReAct Outperforms Pure Action-Taking</h2>

      <p>
        Empirically, interleaving reasoning with actions improves task accuracy on complex multi-
        step problems. There are three mechanisms behind this.
      </p>

      <h3>Reasoning Guides Action Selection</h3>
      <p>
        When the model writes out its understanding of the problem before calling a tool, it
        engages a process similar to chain-of-thought reasoning, which is known to improve
        accuracy on reasoning-heavy tasks. The act of articulating "I need to find X before I
        can compute Y" helps the model stay on track rather than jumping directly to an action
        that may address a different sub-problem.
      </p>

      <h3>Reasoning Enables Self-Correction</h3>
      <p>
        When a tool returns an unexpected result or an error, the model's next Thought step can
        notice the discrepancy between what it expected and what it received, reason about what
        went wrong, and try a corrected approach. Without the reasoning trace, the model has less
        context for recognizing and recovering from failures.
      </p>

      <h3>Reasoning Provides Debugging Visibility</h3>
      <p>
        When an agent fails silently — arriving at a wrong answer without any error — the reasoning
        trace is the primary diagnostic tool. A developer reading the trace can identify where the
        model's reasoning diverged from the correct path, which tool inputs were wrong, and which
        observations were misinterpreted.
      </p>

      <h2>A ReAct Trace Example</h2>

      <p>
        To make the pattern concrete, here is what a ReAct trace looks like for the question:
        "What is 15% of 847 plus the square root of 144?"
      </p>

      <p>
        <strong>Thought 1:</strong> I need to compute two things and add them: 15% of 847, and
        the square root of 144. I'll calculate 15% of 847 first using the calculator.
      </p>
      <p>
        <strong>Action 1:</strong> calculator(expression="847 * 0.15")
      </p>
      <p>
        <strong>Observation 1:</strong> Result: 127.05
      </p>
      <p>
        <strong>Thought 2:</strong> 15% of 847 is 127.05. Now I need the square root of 144.
      </p>
      <p>
        <strong>Action 2:</strong> calculator(expression="144 ** 0.5")
      </p>
      <p>
        <strong>Observation 2:</strong> Result: 12.0
      </p>
      <p>
        <strong>Thought 3:</strong> The square root of 144 is 12. Now I add the two results:
        127.05 + 12.0 = 139.05.
      </p>
      <p>
        <strong>Final Answer:</strong> 15% of 847 is 127.05, and the square root of 144 is 12.
        Adding them together gives 139.05.
      </p>

      <p>
        Each Thought step shows the model's current understanding. Each Action step is directly
        motivated by the preceding Thought. Each Observation updates the model's knowledge. The
        trace is self-documenting: anyone reading it can follow the reasoning and verify each step.
      </p>

      <h2>Common Pitfalls</h2>

      <h3>Reasoning Loops</h3>
      <p>
        An agent can get stuck in a loop where it repeatedly reasons about the same problem without
        making progress, especially when a tool returns an ambiguous or unhelpful result. Mitigation
        strategies include a maximum step count, explicit instructions to move to a best-effort
        answer when stuck, and careful tool return format design to minimize ambiguity.
      </p>

      <h3>Action Failures Cascading</h3>
      <p>
        If a tool call fails and the model does not correctly identify the failure from the
        observation, it may proceed to the next step with an incorrect belief about the state of
        the world. Tool implementations should return clear, unambiguous error messages rather than
        empty strings or silent failures. The model can recover from a "File not found: config.yaml"
        error much better than from an empty response.
      </p>

      <h3>Over-Reasoning</h3>
      <p>
        On simple tasks, verbose reasoning can add latency and cost without improving accuracy.
        The model may also talk itself into incorrect conclusions through long reasoning chains on
        straightforward problems — sometimes called "overthinking." Keep system prompts focused and
        avoid over-prompting the reasoning style for simple tool interactions.
      </p>

      <WarningBlock
        title="eval() in production code"
        content="The calculator tool in the example below uses Python's built-in eval() for brevity. In any real application, eval() on user-supplied or model-supplied expressions is a serious security vulnerability — it can execute arbitrary code. Use a dedicated safe math expression parser such as the 'simpleeval' library, 'asteval', or restrict inputs to a whitelist of allowed operations."
      />

      <NoteBlock
        title="ReAct reasoning is implicit in modern Claude implementations"
        content="When you use the Anthropic SDK with tool definitions, Claude naturally exhibits ReAct-like behavior: it produces reasoning text before and between tool calls without requiring you to explicitly instruct it to 'think step by step.' The conversation history captures this reasoning as part of the message content blocks. You can inspect the text blocks in the assistant's response to see the model's reasoning trace at any step in the loop."
      />

      <h2>Implementing a ReAct Agent</h2>

      <p>
        The implementation below builds a ReAct agent with two tools: a calculator and a simulated
        search. The agent loop follows the standard pattern: send the current conversation to the
        model, check if it wants to use a tool, execute the tool and append the result, and repeat
        until the model produces a final text answer.
      </p>

      <SDKExample
        title="ReAct Agent with Calculator and Search Tools"
        language="python"
        code={reactCode}
        description="A complete ReAct agent implementation using the Anthropic SDK. The agent can reason through multi-step problems by interleaving thought, tool calls, and observations in a loop bounded by a maximum step count."
      />

      <p>
        Notice that the code does not explicitly inject any "Thought:" prefix or force a specific
        output format. Claude will naturally produce reasoning text before tool calls when working
        through multi-step problems. The ReAct pattern is present in the agent's behavior even
        though it is not mechanically enforced by the implementation.
      </p>

      <p>
        The <code>max_steps</code> parameter is your safety valve against infinite loops. Set it
        based on the expected complexity of your task: a task that typically requires 2–3 tool
        calls might have a limit of 8–10 to allow for retries and error recovery, while still
        preventing runaway execution. Reaching the step limit should be treated as a failure signal
        in production, not silently swallowed — it likely indicates a tool failure, an ambiguous
        task specification, or a prompt engineering problem to investigate.
      </p>
    </div>
  );
}
