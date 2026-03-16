import{j as e}from"./vendor-Cs56uELc.js";import{C as s,F as a,N as i,S as r}from"./subject-01-rag-fundamentals-Bt5DHJor.js";function l({name:t,category:n,children:c,whenToUse:o}){return e.jsxs("div",{className:"my-6 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-purple-50/40 px-5 py-4 dark:border-violet-800/50 dark:from-violet-950/30 dark:to-purple-950/20",children:[e.jsxs("div",{className:"mb-2 flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:"text-violet-500 dark:text-violet-400 shrink-0 mt-0.5","aria-hidden":"true",children:[e.jsx("rect",{x:"3",y:"3",width:"7",height:"7"}),e.jsx("rect",{x:"14",y:"3",width:"7",height:"7"}),e.jsx("rect",{x:"14",y:"14",width:"7",height:"7"}),e.jsx("rect",{x:"3",y:"14",width:"7",height:"7"})]}),e.jsx("span",{className:"text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400",children:"Pattern"})]}),n&&e.jsx("span",{className:"rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",children:n})]}),t&&e.jsx("h3",{className:"mb-2 text-base font-bold text-gray-900 dark:text-gray-100",children:t}),e.jsx("div",{className:"text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0",children:c}),o&&e.jsxs("div",{className:"mt-3 border-t border-violet-200/60 pt-3 dark:border-violet-800/40",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-1",children:"When to use"}),e.jsx("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:o})]})]})}const h=`from anthropic import Anthropic
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
print(answer)`;function d(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"What is an AI Agent?"}),e.jsx("p",{children:'The word "agent" is overloaded in the AI industry — it is applied to everything from a simple chatbot with a tool or two to a fully autonomous system managing a production codebase. To build agents well, you need a clear mental model of what an agent actually is, how it differs from simpler LLM patterns, and when the added complexity is warranted.'}),e.jsx(s,{title:"AI Agent",definition:"An AI agent is a system that perceives its environment, reasons about what actions to take, executes those actions using available tools, and uses the results to continue reasoning toward a goal — iterating through this cycle until the task is complete or a stopping condition is reached. The key distinction from a simple LLM call is the loop: an agent can take multiple steps, observe outcomes, and adapt its approach based on what it learns."}),e.jsx("h2",{children:"How LLM Agents Differ from Traditional Software"}),e.jsx("p",{children:"Traditional software follows deterministic, explicitly programmed logic. Given the same input, it produces the same output through a path an engineer designed step by step. LLM agents are fundamentally different in three ways."}),e.jsx("h3",{children:"Probabilistic Behavior"}),e.jsx("p",{children:"Language models are not deterministic. Even with temperature set to zero, subtle differences in context can produce different reasoning paths. An agent that works correctly on 95% of inputs may fail on edge cases in ways that are difficult to anticipate. This is not a bug to be fixed — it is a property to be engineered around through careful prompting, tool design, and fallback mechanisms."}),e.jsx("h3",{children:"Language-Based Goals"}),e.jsx("p",{children:"Traditional software receives precise, typed inputs. Agents receive natural language instructions that may be ambiguous, underspecified, or contradictory. The model must interpret intent, make reasonable assumptions, and sometimes ask for clarification. This is a feature — it makes agents dramatically easier to direct than writing explicit code — but it also means the agent may interpret instructions differently than you intended."}),e.jsx("h3",{children:"Emergent Behavior"}),e.jsx("p",{children:"An agent's multi-step behavior emerges from the interaction between the model's training, your prompt, the available tools, and the accumulated conversation history. Sophisticated behaviors — like the agent recognizing it is going in circles and backtracking — were not explicitly programmed. They emerge from the model's general reasoning capabilities. This makes agents powerful but also harder to reason about statically."}),e.jsx("h2",{children:"Core Components of an Agent"}),e.jsx("p",{children:"Regardless of how simple or complex an agent is, four components are always present."}),e.jsx("h3",{children:"LLM Brain"}),e.jsx("p",{children:"The language model is the reasoning core. It receives observations, produces reasoning, and decides what action to take next. The quality of this component is the largest single determinant of agent capability. A more capable model will reason better, recover from mistakes more gracefully, and handle ambiguous situations more reliably."}),e.jsx("h3",{children:"Tools and Actions"}),e.jsx("p",{children:"Tools are the mechanisms through which an agent affects the world. A tool might read a file, query a database, call an external API, run code, send an email, or navigate a web browser. Without tools, an agent can only produce text — it cannot take actions. Tool design is one of the most important levers for agent performance: clear descriptions, obvious input schemas, and informative return values all make a measurable difference."}),e.jsx("h3",{children:"Memory"}),e.jsx("p",{children:"Memory comes in several forms. The conversation history is in-context memory — everything the agent has seen during the current task. External storage (databases, vector stores, files) provides long-term memory that persists across tasks. Some architectures also include working memory structures like scratchpads where the agent accumulates intermediate results. Managing what the agent can remember — and what it is currently paying attention to — is a core system design problem."}),e.jsx("h3",{children:"Environment"}),e.jsx("p",{children:"The environment is everything the agent can observe and act upon. For a customer support agent it might be a ticketing system and a product knowledge base. For a coding agent it might be a file system, a terminal, and a test runner. Defining the environment — what is visible, what actions are permitted, what the success condition is — is part of designing the agent system."}),e.jsx("h2",{children:"The Perception-Reasoning-Action Cycle"}),e.jsx("p",{children:"Agents operate through a continuous loop of perceiving their environment, reasoning about what to do, and taking action. This cycle continues until the agent determines the goal has been achieved or an error condition is reached."}),e.jsx(a,{direction:"horizontal",steps:["Perceive Environment","Reason About Goal","Select Action","Execute Tool","Observe Result","Update State"],description:"The agent loop: the agent perceives its environment, reasons about the goal, selects an action, executes a tool, observes the result, and updates its internal state before repeating."}),e.jsx("p",{children:'In a modern LLM agent this loop is implemented through the conversation history. Each tool result is appended to the message list, and the model is called again with the updated context. The model "perceives" by reading the accumulated history. It "reasons" through its next token generation. It "acts" by calling a tool. The result lands in the history as an observation, and the cycle repeats.'}),e.jsx("h2",{children:"Agent vs. Chain vs. Simple LLM Call"}),e.jsx("p",{children:"Not every AI interaction needs to be an agent. The appropriate abstraction depends on the nature of the task."}),e.jsx("h3",{children:"Simple LLM Call"}),e.jsx("p",{children:"A single prompt-response interaction with no tools and no iteration. Appropriate for tasks with a clear, well-defined input and output that can be accomplished in one step: summarize this document, classify this email, translate this sentence. The simplest and most reliable pattern — use it whenever it is sufficient."}),e.jsx("h3",{children:"Chain (Pipeline)"}),e.jsx("p",{children:"A sequence of LLM calls where the output of one step becomes the input of the next, with the structure fixed by the developer. Appropriate when a task can be broken into a known sequence of sub-tasks: extract entities, then look them up in a database, then generate a report. The control flow does not depend on what the model decides — it is predetermined. Chains are more predictable and testable than agents."}),e.jsx("h3",{children:"Agent"}),e.jsx("p",{children:"A loop where the model decides what to do next based on observations. Appropriate when the required sequence of steps is not known in advance — it depends on what the model discovers during execution. Debugging a codebase, researching a topic, or autonomously completing a multi-step workflow are tasks where the path from start to finish is data-dependent."}),e.jsx(l,{name:"When to Use Agents",category:"Architecture Decision",description:"Use agents when the task requires dynamic decision-making — when the number and type of steps depend on what the agent discovers along the way. For tasks with a fixed, known structure, prefer chains. For single-shot tasks, prefer direct LLM calls. Add the complexity of an agent loop only when the flexibility is genuinely required.",when:["The number of steps needed to complete the task is unknown in advance","Intermediate results determine which actions to take next","The task requires self-correction based on tool outputs","Multiple heterogeneous tools may be needed in any order","The task benefits from explicit reasoning traces for debugging or compliance"],avoid:["Tasks with a fixed, predictable sequence of steps","High-throughput applications where latency and cost are critical","Safety-critical operations where deterministic behavior is required","Simple Q&A or generation tasks that need no external tools"]}),e.jsx("h2",{children:"Key Capabilities That Make Agents Powerful"}),e.jsx("h3",{children:"Multi-Step Reasoning"}),e.jsx("p",{children:"An agent can decompose a complex goal into sub-goals, pursue each in sequence, and synthesize the results. A question that requires reading several documents, cross- referencing facts, and performing a calculation is intractable in a single LLM call but straightforward for an agent with the right tools."}),e.jsx("h3",{children:"Tool Use"}),e.jsx("p",{children:"By calling tools, an agent transcends the limitations of pure language generation. It can retrieve real-time information, perform precise computations, modify state in external systems, and take actions that have effects beyond the conversation."}),e.jsx("h3",{children:"Self-Correction"}),e.jsx("p",{children:"When a tool call fails or returns unexpected results, an agent can recognize the failure through the observation it receives, reason about what went wrong, and try a different approach. This robustness to errors is one of the most practically valuable capabilities of the agent pattern."}),e.jsx(i,{title:"Start simple, add complexity only when needed",content:"The most common mistake when building with agents is reaching for the agent pattern by default. A well-designed chain or a single carefully crafted prompt will often outperform an agent on reliability, latency, and cost for tasks with known structure. Build the simplest system that solves the problem, measure its failure modes, and escalate to an agent only when the evidence shows you need dynamic decision-making. Agents are powerful but they are also harder to test, debug, and constrain."}),e.jsx("h2",{children:"A Minimal Agent Structure"}),e.jsx("p",{children:"The example below shows the essential structure of an LLM agent using the Anthropic SDK. It implements the perception-reasoning-action loop: send a task with available tools, check if the model wants to use a tool, execute it, feed the result back, and repeat until the model produces a final answer."}),e.jsx(r,{title:"Minimal Agent Loop with Anthropic SDK",language:"python",code:h,description:"A minimal agent loop: the model reasons about a task, calls tools when needed, observes results, and continues until it produces a final answer. This pattern is the foundation of all agent architectures."}),e.jsx("p",{children:"The loop structure here — send messages, check stop reason, execute tools, append results, repeat — is the core of every agent framework. Libraries like LangChain, LlamaIndex, and the Anthropic Agent SDK all provide higher-level abstractions over this exact pattern. Understanding the raw loop makes it much easier to reason about what those abstractions are doing, diagnose failures, and build custom agents when the off-the-shelf solutions do not fit your requirements."})]})}const x=Object.freeze(Object.defineProperty({__proto__:null,default:d},Symbol.toStringTag,{value:"Module"}));function u({title:t="Warning",children:n}){return e.jsxs("aside",{className:"my-6 rounded-xl border border-red-200 bg-red-50/60 px-5 py-4 dark:border-red-800/50 dark:bg-red-950/30",role:"alert",children:[e.jsxs("div",{className:"mb-2 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400",children:[e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),e.jsx("span",{className:"text-red-700 dark:text-red-300",children:t})]}),e.jsx("div",{className:"text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0",children:n})]})}const p=`from anthropic import Anthropic
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
print(answer)`;function m(){return e.jsxs("div",{className:"lesson-content",children:[e.jsx("h2",{children:"The ReAct Pattern: Reasoning and Acting Together"}),e.jsx("p",{children:"Early approaches to LLM tool use sent the model a list of tools and let it call them directly, without any visible reasoning in between. The model read the question, picked a tool, received the result, and either called another tool or produced an answer. This works for simple tasks, but it is brittle for anything multi-step: when the agent makes a wrong turn, there is no record of why it made that choice, making debugging nearly impossible and self-correction unlikely."}),e.jsx("p",{children:"ReAct, introduced by Yao et al. in 2022, addresses this by interleaving explicit reasoning traces with action steps. Before taking any action, the model writes out its current understanding of the problem, what it needs to find out, and why it is choosing a particular tool. This reasoning becomes part of the conversation history, giving the model a structured record to refer back to, and giving developers a window into the agent's decision process."}),e.jsx(s,{title:"ReAct (Reasoning + Acting)",definition:"ReAct is an agent prompting pattern that structures the agent's behavior as an alternating sequence of Thought, Action, and Observation steps. In the Thought step, the model reasons about the current state of the problem. In the Action step, it calls a tool or produces a final answer. In the Observation step, the result of the tool call is fed back. This cycle repeats until the model determines the task is complete. The name is a portmanteau of 'Reasoning' and 'Acting'."}),e.jsx(l,{name:"ReAct Pattern",category:"Reasoning",description:"Structure agent behavior as an explicit Thought → Action → Observation loop. The Thought step forces the model to articulate its reasoning before committing to an action, improving accuracy on multi-step tasks and making failure modes observable.",when:["The task requires multiple sequential tool calls where each depends on the previous result","You need to debug why an agent is making particular decisions","The task benefits from self-correction — the agent may need to revise its approach mid-task","You want the agent to explain its reasoning to users alongside its final answer","The problem space is complex enough that direct action-selection without reasoning leads to errors"],avoid:["Simple single-tool calls where the action is obvious from the question","High-latency-sensitive paths where the extra reasoning tokens add unacceptable overhead","Tasks where verbose reasoning output is unwanted by downstream consumers"]}),e.jsx("h2",{children:"The Thought-Action-Observation Loop"}),e.jsx("p",{children:"Understanding the ReAct loop precisely helps both in implementing it and in diagnosing failures when they occur."}),e.jsx(a,{direction:"vertical",steps:["Thought","Action","Observation","Thought (next iteration)"],description:"The ReAct loop: the model thinks about the current state, takes an action (tool call or final answer), receives an observation (tool result), and thinks again. The loop continues until the model produces a final answer."}),e.jsx("h3",{children:"Thought"}),e.jsx("p",{children:"The Thought step is the model's internal monologue. It synthesizes what has been observed so far, identifies what information is still missing, and reasons about what action will move the task forward. In modern implementations using the Anthropic SDK, this reasoning happens naturally in the model's response — Claude will produce text before tool calls explaining what it is about to do and why. This text is captured in the conversation history as the model's reasoning trace."}),e.jsx("h3",{children:"Action"}),e.jsx("p",{children:"The Action step is a concrete, executable step. In tool-using agents this is a tool call with specific parameters. In the original ReAct formulation for text-generation models, actions were formatted as specially tagged text. In modern SDK-based implementations, the model's tool use mechanism handles this naturally — when the model emits a tool call block, that is the Action."}),e.jsx("h3",{children:"Observation"}),e.jsx("p",{children:"The Observation is the result returned by executing the action. A calculator tool returns a number. A search tool returns a list of snippets. A file reader returns file contents. This observation is appended to the conversation history as a tool result, and the model reads it in the next Thought step. The quality of observations — whether they are clear, informative, and structured — has a large effect on the agent's ability to reason about what it learned."}),e.jsx("h2",{children:"Why ReAct Outperforms Pure Action-Taking"}),e.jsx("p",{children:"Empirically, interleaving reasoning with actions improves task accuracy on complex multi- step problems. There are three mechanisms behind this."}),e.jsx("h3",{children:"Reasoning Guides Action Selection"}),e.jsx("p",{children:'When the model writes out its understanding of the problem before calling a tool, it engages a process similar to chain-of-thought reasoning, which is known to improve accuracy on reasoning-heavy tasks. The act of articulating "I need to find X before I can compute Y" helps the model stay on track rather than jumping directly to an action that may address a different sub-problem.'}),e.jsx("h3",{children:"Reasoning Enables Self-Correction"}),e.jsx("p",{children:"When a tool returns an unexpected result or an error, the model's next Thought step can notice the discrepancy between what it expected and what it received, reason about what went wrong, and try a corrected approach. Without the reasoning trace, the model has less context for recognizing and recovering from failures."}),e.jsx("h3",{children:"Reasoning Provides Debugging Visibility"}),e.jsx("p",{children:"When an agent fails silently — arriving at a wrong answer without any error — the reasoning trace is the primary diagnostic tool. A developer reading the trace can identify where the model's reasoning diverged from the correct path, which tool inputs were wrong, and which observations were misinterpreted."}),e.jsx("h2",{children:"A ReAct Trace Example"}),e.jsx("p",{children:'To make the pattern concrete, here is what a ReAct trace looks like for the question: "What is 15% of 847 plus the square root of 144?"'}),e.jsxs("p",{children:[e.jsx("strong",{children:"Thought 1:"})," I need to compute two things and add them: 15% of 847, and the square root of 144. I'll calculate 15% of 847 first using the calculator."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Action 1:"}),' calculator(expression="847 * 0.15")']}),e.jsxs("p",{children:[e.jsx("strong",{children:"Observation 1:"})," Result: 127.05"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Thought 2:"})," 15% of 847 is 127.05. Now I need the square root of 144."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Action 2:"}),' calculator(expression="144 ** 0.5")']}),e.jsxs("p",{children:[e.jsx("strong",{children:"Observation 2:"})," Result: 12.0"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Thought 3:"})," The square root of 144 is 12. Now I add the two results: 127.05 + 12.0 = 139.05."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Final Answer:"})," 15% of 847 is 127.05, and the square root of 144 is 12. Adding them together gives 139.05."]}),e.jsx("p",{children:"Each Thought step shows the model's current understanding. Each Action step is directly motivated by the preceding Thought. Each Observation updates the model's knowledge. The trace is self-documenting: anyone reading it can follow the reasoning and verify each step."}),e.jsx("h2",{children:"Common Pitfalls"}),e.jsx("h3",{children:"Reasoning Loops"}),e.jsx("p",{children:"An agent can get stuck in a loop where it repeatedly reasons about the same problem without making progress, especially when a tool returns an ambiguous or unhelpful result. Mitigation strategies include a maximum step count, explicit instructions to move to a best-effort answer when stuck, and careful tool return format design to minimize ambiguity."}),e.jsx("h3",{children:"Action Failures Cascading"}),e.jsx("p",{children:'If a tool call fails and the model does not correctly identify the failure from the observation, it may proceed to the next step with an incorrect belief about the state of the world. Tool implementations should return clear, unambiguous error messages rather than empty strings or silent failures. The model can recover from a "File not found: config.yaml" error much better than from an empty response.'}),e.jsx("h3",{children:"Over-Reasoning"}),e.jsx("p",{children:'On simple tasks, verbose reasoning can add latency and cost without improving accuracy. The model may also talk itself into incorrect conclusions through long reasoning chains on straightforward problems — sometimes called "overthinking." Keep system prompts focused and avoid over-prompting the reasoning style for simple tool interactions.'}),e.jsx(u,{title:"eval() in production code",content:"The calculator tool in the example below uses Python's built-in eval() for brevity. In any real application, eval() on user-supplied or model-supplied expressions is a serious security vulnerability — it can execute arbitrary code. Use a dedicated safe math expression parser such as the 'simpleeval' library, 'asteval', or restrict inputs to a whitelist of allowed operations."}),e.jsx(i,{title:"ReAct reasoning is implicit in modern Claude implementations",content:"When you use the Anthropic SDK with tool definitions, Claude naturally exhibits ReAct-like behavior: it produces reasoning text before and between tool calls without requiring you to explicitly instruct it to 'think step by step.' The conversation history captures this reasoning as part of the message content blocks. You can inspect the text blocks in the assistant's response to see the model's reasoning trace at any step in the loop."}),e.jsx("h2",{children:"Implementing a ReAct Agent"}),e.jsx("p",{children:"The implementation below builds a ReAct agent with two tools: a calculator and a simulated search. The agent loop follows the standard pattern: send the current conversation to the model, check if it wants to use a tool, execute the tool and append the result, and repeat until the model produces a final text answer."}),e.jsx(r,{title:"ReAct Agent with Calculator and Search Tools",language:"python",code:p,description:"A complete ReAct agent implementation using the Anthropic SDK. The agent can reason through multi-step problems by interleaving thought, tool calls, and observations in a loop bounded by a maximum step count."}),e.jsx("p",{children:`Notice that the code does not explicitly inject any "Thought:" prefix or force a specific output format. Claude will naturally produce reasoning text before tool calls when working through multi-step problems. The ReAct pattern is present in the agent's behavior even though it is not mechanically enforced by the implementation.`}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"max_steps"})," parameter is your safety valve against infinite loops. Set it based on the expected complexity of your task: a task that typically requires 2–3 tool calls might have a limit of 8–10 to allow for retries and error recovery, while still preventing runaway execution. Reaching the step limit should be treated as a failure signal in production, not silently swallowed — it likely indicates a tool failure, an ambiguous task specification, or a prompt engineering problem to investigate."]})]})}const b=Object.freeze(Object.defineProperty({__proto__:null,default:m},Symbol.toStringTag,{value:"Module"}));export{l as P,u as W,b as a,x as s};
