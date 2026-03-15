import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import PatternBlock from '../../../components/content/PatternBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import FlowDiagram from '../../../components/viz/FlowDiagram.jsx';

const agentCode = `from anthropic import Anthropic
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
print(answer)`;

export default function WhatIsAnAgent() {
  return (
    <div className="lesson-content">
      <h2>What is an AI Agent?</h2>

      <p>
        The word "agent" is overloaded in the AI industry — it is applied to everything from a
        simple chatbot with a tool or two to a fully autonomous system managing a production
        codebase. To build agents well, you need a clear mental model of what an agent actually
        is, how it differs from simpler LLM patterns, and when the added complexity is warranted.
      </p>

      <ConceptBlock
        title="AI Agent"
        definition="An AI agent is a system that perceives its environment, reasons about what actions to take, executes those actions using available tools, and uses the results to continue reasoning toward a goal — iterating through this cycle until the task is complete or a stopping condition is reached. The key distinction from a simple LLM call is the loop: an agent can take multiple steps, observe outcomes, and adapt its approach based on what it learns."
      />

      <h2>How LLM Agents Differ from Traditional Software</h2>

      <p>
        Traditional software follows deterministic, explicitly programmed logic. Given the same
        input, it produces the same output through a path an engineer designed step by step. LLM
        agents are fundamentally different in three ways.
      </p>

      <h3>Probabilistic Behavior</h3>
      <p>
        Language models are not deterministic. Even with temperature set to zero, subtle differences
        in context can produce different reasoning paths. An agent that works correctly on 95% of
        inputs may fail on edge cases in ways that are difficult to anticipate. This is not a bug
        to be fixed — it is a property to be engineered around through careful prompting, tool
        design, and fallback mechanisms.
      </p>

      <h3>Language-Based Goals</h3>
      <p>
        Traditional software receives precise, typed inputs. Agents receive natural language
        instructions that may be ambiguous, underspecified, or contradictory. The model must
        interpret intent, make reasonable assumptions, and sometimes ask for clarification. This
        is a feature — it makes agents dramatically easier to direct than writing explicit code —
        but it also means the agent may interpret instructions differently than you intended.
      </p>

      <h3>Emergent Behavior</h3>
      <p>
        An agent's multi-step behavior emerges from the interaction between the model's training,
        your prompt, the available tools, and the accumulated conversation history. Sophisticated
        behaviors — like the agent recognizing it is going in circles and backtracking — were not
        explicitly programmed. They emerge from the model's general reasoning capabilities. This
        makes agents powerful but also harder to reason about statically.
      </p>

      <h2>Core Components of an Agent</h2>

      <p>
        Regardless of how simple or complex an agent is, four components are always present.
      </p>

      <h3>LLM Brain</h3>
      <p>
        The language model is the reasoning core. It receives observations, produces reasoning, and
        decides what action to take next. The quality of this component is the largest single
        determinant of agent capability. A more capable model will reason better, recover from
        mistakes more gracefully, and handle ambiguous situations more reliably.
      </p>

      <h3>Tools and Actions</h3>
      <p>
        Tools are the mechanisms through which an agent affects the world. A tool might read a
        file, query a database, call an external API, run code, send an email, or navigate a web
        browser. Without tools, an agent can only produce text — it cannot take actions. Tool
        design is one of the most important levers for agent performance: clear descriptions,
        obvious input schemas, and informative return values all make a measurable difference.
      </p>

      <h3>Memory</h3>
      <p>
        Memory comes in several forms. The conversation history is in-context memory — everything
        the agent has seen during the current task. External storage (databases, vector stores,
        files) provides long-term memory that persists across tasks. Some architectures also
        include working memory structures like scratchpads where the agent accumulates intermediate
        results. Managing what the agent can remember — and what it is currently paying attention
        to — is a core system design problem.
      </p>

      <h3>Environment</h3>
      <p>
        The environment is everything the agent can observe and act upon. For a customer support
        agent it might be a ticketing system and a product knowledge base. For a coding agent it
        might be a file system, a terminal, and a test runner. Defining the environment — what is
        visible, what actions are permitted, what the success condition is — is part of designing
        the agent system.
      </p>

      <h2>The Perception-Reasoning-Action Cycle</h2>

      <p>
        Agents operate through a continuous loop of perceiving their environment, reasoning about
        what to do, and taking action. This cycle continues until the agent determines the goal has
        been achieved or an error condition is reached.
      </p>

      <FlowDiagram
        direction="horizontal"
        steps={["Perceive Environment", "Reason About Goal", "Select Action", "Execute Tool", "Observe Result", "Update State"]}
        description="The agent loop: the agent perceives its environment, reasons about the goal, selects an action, executes a tool, observes the result, and updates its internal state before repeating."
      />

      <p>
        In a modern LLM agent this loop is implemented through the conversation history. Each tool
        result is appended to the message list, and the model is called again with the updated
        context. The model "perceives" by reading the accumulated history. It "reasons" through
        its next token generation. It "acts" by calling a tool. The result lands in the history
        as an observation, and the cycle repeats.
      </p>

      <h2>Agent vs. Chain vs. Simple LLM Call</h2>

      <p>
        Not every AI interaction needs to be an agent. The appropriate abstraction depends on the
        nature of the task.
      </p>

      <h3>Simple LLM Call</h3>
      <p>
        A single prompt-response interaction with no tools and no iteration. Appropriate for tasks
        with a clear, well-defined input and output that can be accomplished in one step: summarize
        this document, classify this email, translate this sentence. The simplest and most reliable
        pattern — use it whenever it is sufficient.
      </p>

      <h3>Chain (Pipeline)</h3>
      <p>
        A sequence of LLM calls where the output of one step becomes the input of the next, with
        the structure fixed by the developer. Appropriate when a task can be broken into a known
        sequence of sub-tasks: extract entities, then look them up in a database, then generate a
        report. The control flow does not depend on what the model decides — it is predetermined.
        Chains are more predictable and testable than agents.
      </p>

      <h3>Agent</h3>
      <p>
        A loop where the model decides what to do next based on observations. Appropriate when the
        required sequence of steps is not known in advance — it depends on what the model discovers
        during execution. Debugging a codebase, researching a topic, or autonomously completing a
        multi-step workflow are tasks where the path from start to finish is data-dependent.
      </p>

      <PatternBlock
        name="When to Use Agents"
        category="Architecture Decision"
        description="Use agents when the task requires dynamic decision-making — when the number and type of steps depend on what the agent discovers along the way. For tasks with a fixed, known structure, prefer chains. For single-shot tasks, prefer direct LLM calls. Add the complexity of an agent loop only when the flexibility is genuinely required."
        when={[
          "The number of steps needed to complete the task is unknown in advance",
          "Intermediate results determine which actions to take next",
          "The task requires self-correction based on tool outputs",
          "Multiple heterogeneous tools may be needed in any order",
          "The task benefits from explicit reasoning traces for debugging or compliance"
        ]}
        avoid={[
          "Tasks with a fixed, predictable sequence of steps",
          "High-throughput applications where latency and cost are critical",
          "Safety-critical operations where deterministic behavior is required",
          "Simple Q&A or generation tasks that need no external tools"
        ]}
      />

      <h2>Key Capabilities That Make Agents Powerful</h2>

      <h3>Multi-Step Reasoning</h3>
      <p>
        An agent can decompose a complex goal into sub-goals, pursue each in sequence, and
        synthesize the results. A question that requires reading several documents, cross-
        referencing facts, and performing a calculation is intractable in a single LLM call but
        straightforward for an agent with the right tools.
      </p>

      <h3>Tool Use</h3>
      <p>
        By calling tools, an agent transcends the limitations of pure language generation. It can
        retrieve real-time information, perform precise computations, modify state in external
        systems, and take actions that have effects beyond the conversation.
      </p>

      <h3>Self-Correction</h3>
      <p>
        When a tool call fails or returns unexpected results, an agent can recognize the failure
        through the observation it receives, reason about what went wrong, and try a different
        approach. This robustness to errors is one of the most practically valuable capabilities
        of the agent pattern.
      </p>

      <NoteBlock
        title="Start simple, add complexity only when needed"
        content="The most common mistake when building with agents is reaching for the agent pattern by default. A well-designed chain or a single carefully crafted prompt will often outperform an agent on reliability, latency, and cost for tasks with known structure. Build the simplest system that solves the problem, measure its failure modes, and escalate to an agent only when the evidence shows you need dynamic decision-making. Agents are powerful but they are also harder to test, debug, and constrain."
      />

      <h2>A Minimal Agent Structure</h2>

      <p>
        The example below shows the essential structure of an LLM agent using the Anthropic SDK.
        It implements the perception-reasoning-action loop: send a task with available tools, check
        if the model wants to use a tool, execute it, feed the result back, and repeat until the
        model produces a final answer.
      </p>

      <SDKExample
        title="Minimal Agent Loop with Anthropic SDK"
        language="python"
        code={agentCode}
        description="A minimal agent loop: the model reasons about a task, calls tools when needed, observes results, and continues until it produces a final answer. This pattern is the foundation of all agent architectures."
      />

      <p>
        The loop structure here — send messages, check stop reason, execute tools, append results,
        repeat — is the core of every agent framework. Libraries like LangChain, LlamaIndex, and
        the Anthropic Agent SDK all provide higher-level abstractions over this exact pattern.
        Understanding the raw loop makes it much easier to reason about what those abstractions
        are doing, diagnose failures, and build custom agents when the off-the-shelf solutions
        do not fit your requirements.
      </p>
    </div>
  );
}
