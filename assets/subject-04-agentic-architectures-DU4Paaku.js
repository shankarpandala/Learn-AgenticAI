import{j as e}from"./vendor-Cs56uELc.js";import{C as t,S as i,P as s,B as n,W as r,N as a}from"./content-components-CDXEIxVK.js";function o(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Monolithic Agent Design"}),e.jsx("p",{children:'A monolithic agent is a single LLM instance with a single system prompt, a set of tools, and one conversation loop responsible for completing the entire task. All reasoning, planning, tool selection, and answer synthesis happen within that one context window. The term "monolithic" does not imply poor design — it simply means that no coordination overhead, no inter-agent messaging, and no orchestration layer is involved. For a wide range of tasks, this is exactly the right architecture.'}),e.jsx(t,{term:"Monolithic Agent",children:"A monolithic agent is a single-model, single-loop system that receives a task, has access to a defined set of tools, and operates through repeated perceive-reason-act cycles until it produces a final answer. All state is maintained in the conversation history. There is no external orchestrator, no sub-agents, and no distributed coordination. The entire reasoning process is visible in one conversation trace."}),e.jsx("h2",{children:"What Makes Monolithic Agents Appealing"}),e.jsx("h3",{children:"Simplicity"}),e.jsx("p",{children:"A monolithic agent can be implemented in under 50 lines of code. There is one API endpoint to call, one conversation history to manage, one system prompt to tune, and one set of tools to maintain. Debugging is straightforward: you read the conversation transcript from top to bottom and find the step where reasoning went wrong. There is no distributed state to reconcile, no message-passing protocol to debug, and no orchestration logic to maintain."}),e.jsx("h3",{children:"Coherent Context"}),e.jsx("p",{children:"Because all reasoning happens in a single context window, the agent always has access to everything it has learned during the current task. It can refer back to tool results from step 3 when reasoning at step 15 without any explicit memory retrieval. In multi-agent systems, sharing context between agents requires explicit serialization and passing of information — information can be lost or distorted in translation. The monolithic agent avoids this entirely."}),e.jsx("h3",{children:"Natural Coherence"}),e.jsx("p",{children:"A single model maintains a coherent reasoning style, consistent terminology, and a unified understanding of the task throughout its trajectory. When multiple agents collaborate, subtle inconsistencies can emerge between their individual interpretations of the task. The monolithic agent never needs to reconcile divergent conclusions from different agents."}),e.jsx("h2",{children:"Limitations"}),e.jsx("h3",{children:"Context Window Constraints"}),e.jsx("p",{children:"The most fundamental limitation is the context window. A monolithic agent can only reason about what fits in its current context. For tasks that require processing large amounts of data — hundreds of documents, a large codebase, months of log files — a single context window will not be sufficient. Techniques like RAG and summarization help, but they introduce their own complexity and loss of information."}),e.jsx("h3",{children:"No Parallelism"}),e.jsx("p",{children:"A monolithic agent executes sequentially. Even if multiple independent subtasks could theoretically be solved in parallel, they must queue behind each other in the single loop. For time-sensitive applications where five independent web searches could run concurrently, the monolithic agent performs all five in sequence."}),e.jsx("h3",{children:"Single Point of Failure"}),e.jsx("p",{children:"If the model produces a flawed sub-plan early in a long trajectory, all subsequent steps are built on that flawed foundation. There is no independent agent to notice the error and raise an objection. Some of this can be mitigated with explicit self-reflection steps, but it remains a structural limitation."}),e.jsx(i,{title:"Complete Monolithic Agent with Tools",tabs:{python:`import json
import httpx
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

def search_web(query: str) -> str:
    """Simulated web search — replace with real search API."""
    # In production: call Brave Search, SerpAPI, Tavily, etc.
    return json.dumps({
        "results": [
            {"title": f"Result 1 for: {query}", "snippet": "Detailed information about the topic..."},
            {"title": f"Result 2 for: {query}", "snippet": "Additional relevant details..."},
        ]
    })

def calculate(expression: str) -> str:
    """Safely evaluate a mathematical expression."""
    try:
        # Only allow safe arithmetic — no builtins, no imports
        allowed = set("0123456789.+-*/() ")
        if not all(c in allowed for c in expression):
            return json.dumps({"error": "Only arithmetic expressions are allowed."})
        result = eval(expression, {"__builtins__": {}}, {})  # noqa: S307
        return json.dumps({"result": result, "expression": expression})
    except Exception as e:
        return json.dumps({"error": str(e)})

def read_document(doc_id: str) -> str:
    """Retrieve a document from the knowledge base."""
    docs = {
        "q4-report": "Q4 2024 Revenue: $4.2M (+18% YoY). Top products: Widget A ($1.8M), Widget B ($1.1M).",
        "team-roster": "Engineering: Alice (backend), Bob (frontend), Carol (infra). Total: 12 FTEs.",
    }
    content = docs.get(doc_id)
    if content is None:
        return json.dumps({"error": f"Document '{doc_id}' not found.", "available": list(docs.keys())})
    return json.dumps({"doc_id": doc_id, "content": content})

# ---------------------------------------------------------------------------
# Tool dispatch and schemas
# ---------------------------------------------------------------------------

TOOLS = [
    {
        "name": "search_web",
        "description": "Search the web for current information. Use for recent events, facts, and data not in your training. Returns a list of results with titles and snippets.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Search query. Be specific."}},
            "required": ["query"]
        }
    },
    {
        "name": "calculate",
        "description": "Evaluate a mathematical expression and return the result. Use for precise arithmetic. Input must be a pure arithmetic expression like '42 * 1.18 + 100'.",
        "input_schema": {
            "type": "object",
            "properties": {"expression": {"type": "string", "description": "Arithmetic expression to evaluate."}},
            "required": ["expression"]
        }
    },
    {
        "name": "read_document",
        "description": "Read a document from the internal knowledge base by its ID. Use when you need internal company data. Returns the full document content.",
        "input_schema": {
            "type": "object",
            "properties": {"doc_id": {"type": "string", "description": "Document ID, e.g. 'q4-report'"}},
            "required": ["doc_id"]
        }
    },
]

def dispatch(name: str, inputs: dict) -> str:
    if name == "search_web":
        return search_web(**inputs)
    if name == "calculate":
        return calculate(**inputs)
    if name == "read_document":
        return read_document(**inputs)
    return json.dumps({"error": f"Unknown tool: {name}"})

SYSTEM_PROMPT = """You are a research and analysis assistant with access to web search,
a calculator, and an internal document store. When answering questions:
1. Use tools to gather accurate, current information rather than relying on memory.
2. Always verify numerical claims with the calculator.
3. Check internal documents before searching the web for company-specific information.
4. Provide a clear, well-structured final answer after gathering all needed information."""

# ---------------------------------------------------------------------------
# Monolithic agent loop
# ---------------------------------------------------------------------------

def run_monolithic_agent(task: str, max_steps: int = 15) -> str:
    """Single-model agent loop. All reasoning in one context window."""
    messages = [{"role": "user", "content": task}]

    for step in range(1, max_steps + 1):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            return next((b.text for b in response.content if hasattr(b, "text")), "Task complete.")

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = dispatch(block.name, block.input)
                print(f"  [{step}] {block.name}({block.input}) -> {result[:80]}...")
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })
        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    return "Max steps reached without completing the task."


result = run_monolithic_agent(
    "Review our Q4 report and calculate what our revenue would be if it grew at the same "
    "18% rate for another two years. Also search for the current market rate for SaaS companies "
    "at this revenue level."
)
print(result)`,typescript:`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

function searchWeb(query: string): string {
  return JSON.stringify({
    results: [
      { title: Result 1 for: \${query}, snippet: "Detailed information about the topic..." },
      { title: Result 2 for: \${query}, snippet: "Additional relevant details..." },
    ],
  });
}

function calculate(expression: string): string {
  try {
    const allowed = /^[0-9.+\\-*/() ]+$/;
    if (!allowed.test(expression)) return JSON.stringify({ error: "Only arithmetic allowed." });
    // eslint-disable-next-line no-eval
    const result = eval(expression) as number;
    return JSON.stringify({ result, expression });
  } catch (e) {
    return JSON.stringify({ error: String(e) });
  }
}

function readDocument(docId: string): string {
  const docs: Record<string, string> = {
    "q4-report": "Q4 2024 Revenue: $4.2M (+18% YoY). Top products: Widget A ($1.8M), Widget B ($1.1M).",
    "team-roster": "Engineering: Alice (backend), Bob (frontend), Carol (infra). Total: 12 FTEs.",
  };
  const content = docs[docId];
  if (!content) return JSON.stringify({ error: Document '\${docId}' not found., available: Object.keys(docs) });
  return JSON.stringify({ docId, content });
}

// ---------------------------------------------------------------------------
// Tool schemas
// ---------------------------------------------------------------------------

const tools: Anthropic.Tool[] = [
  {
    name: "search_web",
    description: "Search the web for current information. Returns a list of results with titles and snippets.",
    input_schema: { type: "object" as const, properties: { query: { type: "string", description: "Search query." } }, required: ["query"] },
  },
  {
    name: "calculate",
    description: "Evaluate a mathematical expression. Input must be pure arithmetic like '42 * 1.18'.",
    input_schema: { type: "object" as const, properties: { expression: { type: "string", description: "Arithmetic expression." } }, required: ["expression"] },
  },
  {
    name: "read_document",
    description: "Read a document from the internal knowledge base by its ID.",
    input_schema: { type: "object" as const, properties: { doc_id: { type: "string", description: "Document ID." } }, required: ["doc_id"] },
  },
];

function dispatch(name: string, inputs: Record<string, string>): string {
  if (name === "search_web") return searchWeb(inputs.query);
  if (name === "calculate") return calculate(inputs.expression);
  if (name === "read_document") return readDocument(inputs.doc_id);
  return JSON.stringify({ error: Unknown tool: \${name} });
}

const SYSTEM_PROMPT = You are a research and analysis assistant with access to web search,
a calculator, and an internal document store. Use tools to gather accurate information,
verify numbers with the calculator, and provide well-structured answers.;

// ---------------------------------------------------------------------------
// Monolithic agent loop
// ---------------------------------------------------------------------------

async function runMonolithicAgent(task: string, maxSteps = 15): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];

  for (let step = 1; step <= maxSteps; step++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6", max_tokens: 2048, system: SYSTEM_PROMPT, tools, messages,
    });
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const text = response.content.find((b) => b.type === "text");
      return text && "text" in text ? text.text : "Task complete.";
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const result = dispatch(block.name, block.input as Record<string, string>);
        console.log(  [\${step}] \${block.name} -> \${result.slice(0, 80)}...);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
  }
  return "Max steps reached.";
}

runMonolithicAgent(
  "Review our Q4 report and calculate what our revenue would be if it grew at the same " +
  "18% rate for another two years. Also search for the current market rate for SaaS companies " +
  "at this revenue level."
).then(console.log);`}}),e.jsx("h2",{children:"When Monolithic Agents Are the Right Choice"}),e.jsx("p",{children:"The monolithic pattern excels for tasks with well-bounded scope — where the information needed to complete the task fits comfortably in context, where sequential reasoning is natural, and where the overhead of coordinating multiple agents would exceed any benefit. Most agent use cases in early development benefit from starting monolithic, measuring where the single-agent approach fails, and only then introducing additional agents to address specific bottlenecks."}),e.jsx(s,{name:"Start Monolithic, Add Agents Surgically",category:"Architecture Decision",description:"Build the simplest possible monolithic agent first. Measure its failure modes: does it run out of context? Does it need parallel tool execution? Does it struggle with tasks requiring multiple specialized capabilities? Add architectural complexity only where measurement shows clear necessity. An unnecessary multi-agent system is more expensive, harder to debug, and less reliable than a well-designed monolithic one.",when:["Tasks where all needed information fits in the context window","Sequential tasks where each step clearly depends on the previous","Prototyping and early-stage development","Tasks with a narrow, well-defined tool set"],avoid:["Tasks requiring processing of large data sets that exceed context limits","Tasks naturally parallelizable into independent workstreams","Long-running tasks (hours) where a single context window becomes expensive"]}),e.jsx(n,{title:"Keep the system prompt focused",children:"Monolithic agents with broad system prompts that try to cover every possible behavior tend to perform worse than agents with tightly scoped prompts designed for a specific task category. A customer support agent should have a customer support system prompt. A coding agent should have a coding-focused prompt. If your agent needs to handle radically different task types, consider a router that dispatches to specialized monolithic agents rather than one generalist agent that tries to do everything."}),e.jsx(r,{title:"Tool count affects performance",children:"Providing an agent with dozens of tools degrades performance. The model must read all tool descriptions on every call, consuming input tokens, and must reason about which tool is most appropriate from a large menu. Studies show that performance degrades measurably beyond 10–15 tools. For monolithic agents with many available capabilities, implement dynamic tool selection — pre-filter the tool list to the most relevant subset for the current task before passing it to the model."}),e.jsx(a,{title:"Monolithic does not mean simple",children:'A monolithic agent can be sophisticated. It can use chain-of-thought reasoning, follow complex multi-step plans, use many tools in sequence, recover from errors, and produce high-quality synthesized outputs. The "monolithic" label refers only to its architectural structure — one model, one loop — not to the complexity of its behavior or the quality of its outputs.'})]})}const S=Object.freeze(Object.defineProperty({__proto__:null,default:o},Symbol.toStringTag,{value:"Module"}));function l(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Common Single-Agent Patterns"}),e.jsx("p",{children:"Within the broad category of single-agent systems, several distinct reasoning patterns have emerged as reliable building blocks. Each pattern structures how the agent approaches problems, generates plans, and recovers from errors. Understanding these patterns enables you to choose the right reasoning structure for each task, implement it reliably, and diagnose failures when behavior deviates from expectations."}),e.jsx("h2",{children:"ReAct: Reasoning and Acting"}),e.jsx(t,{term:"ReAct Pattern",children:`ReAct (Reasoning and Acting) interleaves explicit reasoning steps with tool actions. Before each action, the agent generates a "Thought" explaining its reasoning and what it plans to do. After the action, it generates an "Observation" noting what it learned. This explicit reasoning trace improves performance on complex tasks and makes the agent's decision process transparent and debuggable.`}),e.jsx("p",{children:'The ReAct pattern was originally formalized for prompting models to produce thoughts before actions. Modern frontier models like Claude produce this reasoning naturally when given tools — the reasoning text that appears before tool calls in a response is effectively the "Thought" step, and the tool result is the "Observation." Structured ReAct prompting can reinforce this behavior on models that do not do it naturally.'}),e.jsx(i,{title:"ReAct Pattern with Explicit Thought-Action-Observation Structure",tabs:{python:`from anthropic import Anthropic
import json

client = Anthropic()

REACT_SYSTEM_PROMPT = """You are a research agent that uses the ReAct (Reasoning + Acting) framework.

For each step, structure your response as:
Thought: [Your reasoning about what to do next and why]
Action: [The tool you will call — this is done via the tool_use mechanism]

After each tool result, you will see:
Observation: [The tool's response]

Continue until you have enough information to provide a complete answer.
Then produce your final response as a clear, direct answer without Thought/Action prefixes."""

TOOLS = [
    {
        "name": "search",
        "description": "Search for information on a topic. Returns relevant text passages.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "lookup",
        "description": "Look up a specific entity (person, company, concept) for factual details.",
        "input_schema": {
            "type": "object",
            "properties": {
                "entity": {"type": "string", "description": "The entity to look up"}
            },
            "required": ["entity"]
        }
    }
]

KNOWLEDGE_BASE = {
    "transformer architecture": "Transformers use self-attention mechanisms. Introduced by Vaswani et al. in 'Attention Is All You Need' (2017). Key components: multi-head attention, positional encoding, feed-forward layers.",
    "BERT": "Bidirectional Encoder Representations from Transformers. Developed by Google in 2018. Pre-trained on masked language modeling and next sentence prediction.",
    "GPT": "Generative Pre-trained Transformer. Developed by OpenAI. Uses causal (left-to-right) language modeling. GPT-1 (2018), GPT-2 (2019), GPT-3 (2020), GPT-4 (2023).",
}

def fake_search(query: str) -> str:
    for key, value in KNOWLEDGE_BASE.items():
        if any(word.lower() in key for word in query.lower().split()):
            return json.dumps({"results": [{"passage": value, "relevance": 0.95}]})
    return json.dumps({"results": [], "message": "No results found. Try a different query."})

def fake_lookup(entity: str) -> str:
    entity_lower = entity.lower()
    for key, value in KNOWLEDGE_BASE.items():
        if entity_lower in key:
            return json.dumps({"entity": entity, "summary": value})
    return json.dumps({"entity": entity, "summary": "Entity not found in knowledge base."})

def dispatch(name: str, inputs: dict) -> str:
    if name == "search": return fake_search(inputs["query"])
    if name == "lookup": return fake_lookup(inputs["entity"])
    return json.dumps({"error": f"Unknown tool: {name}"})

def run_react_agent(question: str, max_steps: int = 8) -> str:
    messages = [{"role": "user", "content": question}]
    for _ in range(max_steps):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=REACT_SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason == "end_turn":
            return next((b.text for b in response.content if hasattr(b, "text")), "Done.")
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = dispatch(block.name, block.input)
                # Label tool results as "Observation" to reinforce the ReAct structure
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": f"Observation: {result}",
                })
        if tool_results:
            messages.append({"role": "user", "content": tool_results})
    return "Max steps reached."

answer = run_react_agent("How does BERT differ from GPT in terms of training approach?")
print(answer)`,typescript:`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const REACT_SYSTEM_PROMPT = You are a research agent using the ReAct framework.
Structure responses as: Thought: [reasoning] then use the appropriate tool.
After tool results, continue reasoning until you can give a direct final answer.;

const tools: Anthropic.Tool[] = [
  {
    name: "search",
    description: "Search for information on a topic.",
    input_schema: { type: "object" as const, properties: { query: { type: "string", description: "Search query" } }, required: ["query"] },
  },
  {
    name: "lookup",
    description: "Look up a specific entity for factual details.",
    input_schema: { type: "object" as const, properties: { entity: { type: "string", description: "Entity to look up" } }, required: ["entity"] },
  },
];

const KB: Record<string, string> = {
  "transformer architecture": "Transformers use self-attention. Introduced by Vaswani et al. 2017.",
  bert: "Bidirectional Encoder Representations from Transformers. Google 2018. Masked language modeling.",
  gpt: "Generative Pre-trained Transformer. OpenAI. Causal language modeling. GPT-1 through GPT-4.",
};

function fakeSearch(query: string): string {
  const key = Object.keys(KB).find((k) => query.toLowerCase().includes(k));
  return key ? JSON.stringify({ results: [{ passage: KB[key], relevance: 0.95 }] }) : JSON.stringify({ results: [] });
}

function fakeLookup(entity: string): string {
  const key = Object.keys(KB).find((k) => entity.toLowerCase().includes(k));
  return key ? JSON.stringify({ entity, summary: KB[key] }) : JSON.stringify({ entity, summary: "Not found." });
}

async function runReactAgent(question: string, maxSteps = 8): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: question }];
  for (let i = 0; i < maxSteps; i++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6", max_tokens: 1024, system: REACT_SYSTEM_PROMPT, tools, messages,
    });
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason === "end_turn") {
      const text = response.content.find((b) => b.type === "text");
      return text && "text" in text ? text.text : "Done.";
    }
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inp = block.input as { query?: string; entity?: string };
        const result = block.name === "search" ? fakeSearch(inp.query!) : fakeLookup(inp.entity!);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: Observation: \${result} });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
  }
  return "Max steps reached.";
}

runReactAgent("How does BERT differ from GPT in terms of training approach?").then(console.log);`}}),e.jsx("h2",{children:"Plan-and-Execute"}),e.jsx(t,{term:"Plan-and-Execute Pattern",children:"Plan-and-Execute separates the planning phase from the execution phase. In the planning step, the agent generates a complete, explicit plan of action — a numbered list of steps to accomplish the goal. In the execution phase, it works through each step in order, using tools and updating the plan if new information requires adjustment. This makes long-horizon reasoning more reliable by forcing upfront decomposition of complex tasks."}),e.jsx("p",{children:"The key advantage of Plan-and-Execute over pure ReAct is that explicit planning reduces goal drift on long tasks. When an agent generates a plan before acting, it has a stable reference to check its progress against. A pure ReAct agent can sometimes lose track of the original goal after many tool calls. The tradeoff is that the initial plan may be suboptimal or become outdated as the agent learns more during execution."}),e.jsx("h2",{children:"Reflexion"}),e.jsx(t,{term:"Reflexion Pattern",children:"Reflexion is a pattern where the agent explicitly reflects on its own performance after attempting a task. If the task fails or produces a poor result, the agent generates a verbal critique of what went wrong and what it should do differently, then retries the task using this self-critique as additional context. This enables the agent to improve its approach across multiple attempts without changing model weights."}),e.jsx("p",{children:"Reflexion is particularly valuable for tasks with verifiable outcomes — running code that either passes tests or doesn't, answering factual questions that can be checked against ground truth. When the outcome can be objectively evaluated, the reflection is grounded in concrete feedback rather than speculation. For subjective tasks, the reflection is less reliable because the agent is evaluating its own output without external ground truth."}),e.jsx("h2",{children:"LATS: Language Agent Tree Search"}),e.jsx("p",{children:"LATS (Language Agent Tree Search) applies Monte Carlo Tree Search concepts to language agents. Instead of committing to a single trajectory, LATS explores multiple possible action sequences from each state, uses a value function (often LLM-based) to score partial trajectories, and focuses exploration on the most promising branches. This dramatically improves performance on tasks where the correct path is not obvious upfront but requires exploration and backtracking."}),e.jsx("p",{children:"LATS is expensive — it calls the LLM many more times than a linear agent — but it achieves state-of-the-art performance on tasks like complex coding challenges, mathematical reasoning, and multi-step planning problems. It is best suited for tasks where correctness matters more than cost, where there is a clear scoring function for intermediate states, and where the search space is not so large that even tree search cannot find the solution."}),e.jsx(s,{name:"Choose the Pattern to Match the Task Structure",category:"Single-Agent Design",description:"Use ReAct for exploratory tasks where you do not know the steps in advance. Use Plan-and-Execute for tasks with a known structure that can be decomposed upfront. Use Reflexion when you have a verifiable success criterion and want the agent to improve through iteration. Use LATS for complex problems where the optimal path requires exploration and backtracking.",when:["ReAct: open-ended research, debugging, tasks with unknown step count","Plan-and-Execute: data pipelines, report generation, tasks with known structure","Reflexion: coding, theorem proving, tasks with checkable success conditions","LATS: competitions, highly complex single tasks where quality trumps cost"],avoid:["LATS for latency-sensitive applications — it makes many parallel LLM calls","Plan-and-Execute when the task is truly open-ended and plans will be rapidly invalidated","Reflexion without a reliable evaluation mechanism — it relies on accurate self-assessment"]}),e.jsx(n,{title:"Make the reasoning pattern explicit in the system prompt",children:"Frontier models can follow any of these patterns, but they perform more reliably when the system prompt explicitly instructs them to use a specific pattern. Tell the model to generate a step-by-step plan before executing, or to produce a reflection after each failed attempt. Explicit instructions reduce variance and make the agent's behavior more predictable across different task inputs."}),e.jsx(a,{title:"Patterns compose and can be mixed",children:"These patterns are not mutually exclusive. A Plan-and-Execute agent can use Reflexion when a step fails. A ReAct agent can switch to explicit planning mid-trajectory when it realizes the task is more complex than initially appeared. The labels are useful for communication and design, but the actual agent behavior can mix elements of multiple patterns as the situation demands."})]})}const j=Object.freeze(Object.defineProperty({__proto__:null,default:l},Symbol.toStringTag,{value:"Module"}));function c(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"When to Use Single-Agent vs. Multi-Agent Systems"}),e.jsx("p",{children:'Multi-agent architectures are compelling on paper: specialized agents, parallel execution, independent verification, virtually unlimited scale. In practice, they introduce coordination overhead, debugging complexity, and failure modes that simply do not exist in single-agent systems. The right question is not "could this benefit from multiple agents?" but "does the measurable benefit of multiple agents outweigh the measurable cost of additional complexity?" That question has a clear answer for many common use cases.'}),e.jsx(t,{term:"Architectural Decision Framework",children:"Choose a single-agent architecture when the task fits within a reasonable context window, requires sequential reasoning, and does not have clearly independent parallel workstreams. Choose multi-agent when the task is genuinely parallelizable, requires more context than fits in one window, benefits from multiple independent perspectives, or requires specialized capabilities that conflict with each other in a single prompt."}),e.jsx("h2",{children:"The Case for Single-Agent: Underappreciated Advantages"}),e.jsx("h3",{children:"No Coordination Tax"}),e.jsx("p",{children:"Every multi-agent system pays a coordination tax: the cost and latency of serializing work assignments, deserializing results, resolving disagreements between agents, and managing shared state. For tasks that complete in 5–15 steps, this tax can exceed the actual work being done. A monolithic agent has zero coordination overhead — it just reasons and acts."}),e.jsx("h3",{children:"No Information Loss at Boundaries"}),e.jsx("p",{children:'When work passes between agents, information is inevitably compressed or lost. An orchestrator that summarizes "sub-task A is complete" may omit nuances that a worker agent would have used. A single-agent system never has this problem — all discovered information remains in context, accessible to every subsequent reasoning step. This is particularly important for tasks where subtle details matter.'}),e.jsx("h3",{children:"Failure Isolation"}),e.jsx("p",{children:"When a single-agent system fails, you have one conversation trace to analyze. When a multi-agent system fails, the failure may originate in any agent, at any step, and may manifest as a subtle miscommunication rather than an obvious error. Debugging multi-agent failures is significantly harder."}),e.jsx("h3",{children:"Coherent Style and Reasoning"}),e.jsx("p",{children:"A single agent maintains consistent style, vocabulary, and reasoning approach throughout a task. Multi-agent systems can produce outputs that are internally inconsistent when different agents used different assumptions or stylistic conventions. Synthesizing their outputs into a coherent whole requires an additional reconciliation step that itself may introduce errors."}),e.jsx("h2",{children:"Decision Criteria: When to Escalate to Multi-Agent"}),e.jsx("h3",{children:"Context Window Exhaustion"}),e.jsx("p",{children:"The clearest signal that a monolithic agent is insufficient is running out of context. If the task genuinely requires more information than fits in the model's context window — not because of bloated system prompts or verbose tool results, but because the task intrinsically requires that much data — then multiple agents with partitioned contexts may be necessary. Before concluding this, first try: summarizing tool results, filtering to relevant fields, and using external memory stores accessed via search tools."}),e.jsx("h3",{children:"True Parallelism"}),e.jsx("p",{children:`If a task naturally decomposes into independent subtasks that have no data dependencies between them, and completing those subtasks in parallel would provide meaningful latency reduction, multi-agent parallelism is justified. The key word is "independent" — if subtask B needs the output of subtask A, parallelism doesn't help and you're just adding orchestration overhead. A single agent parallelizing its tool calls (by emitting multiple tool_use blocks in one response) handles many cases that seem to require multiple agents.`}),e.jsx("h3",{children:"Conflicting Specialization Requirements"}),e.jsx("p",{children:'Sometimes a task requires behaviors that actively conflict within a single system prompt. A code reviewer that must be extremely critical and a code writer that must be creative and try unconventional approaches may perform better as separate agents with different instructions than as a single agent trying to do both. This is relatively rare — most "specialization" benefits can be achieved through careful prompting in a single agent.'}),e.jsx("h3",{children:"Independent Verification"}),e.jsx("p",{children:"For high-stakes tasks, having a second independent agent verify the first agent's output can catch errors that the first agent would not catch reviewing its own work. This works because the verification agent is not anchored to the original agent's reasoning chain. The benefit is real, but so is the cost: two API calls instead of one, plus orchestration logic. Quantify both before assuming it is worth it."}),e.jsx("h2",{children:"A Decision Framework"}),e.jsx("p",{children:'Work through these questions in order. Stop at the first "yes" that indicates you need a more complex architecture.'}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Does the task fit in one context window?"})," If yes, start with a single agent. If no, consider whether better tool design (returning less verbose results, using search instead of loading everything) can make it fit before reaching for multiple agents."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Are there genuinely independent parallel subtasks?"})," If the task is naturally sequential, stay with a single agent. If it is genuinely parallel, first try emitting multiple tool calls in a single agent step before adding separate agents."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Are there conflicting behavioral requirements?"})," If a single prompt can serve all requirements without internal contradiction, stay single-agent. Most apparent conflicts can be resolved with careful prompting."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Is independent verification required for safety or quality?"}),"If yes, a two-agent writer-reviewer pattern may be justified. If the stakes are lower, self-reflection in a single agent may be sufficient."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Does the task require different models for different subtasks?"}),"If you need a vision model for one part and a code model for another, you need multiple agents by necessity."]})]}),e.jsx(s,{name:"Complexity Budget",category:"Architecture Decision",description:"Every additional agent in a system costs: development time, debugging time, operational overhead, and latency. Set a complexity budget before designing: how much additional complexity is the task's requirements worth? A task that completes reliably with a monolithic agent in 95% of cases is better served by improving that 5% than by rewriting the system as a multi-agent pipeline.",when:["Designing a new agent system from scratch","Deciding whether to migrate a working single-agent system to multi-agent","Evaluating multi-agent frameworks against simpler alternatives"],avoid:["Defaulting to multi-agent because it sounds more sophisticated","Adding agents to solve problems that better prompting or tool design would fix","Assuming more agents always means better quality"]}),e.jsx("h2",{children:"Complexity Thresholds"}),e.jsx("p",{children:"These are rough thresholds based on common production experience. They are starting points, not rigid rules — your specific task distribution and model capabilities will shift them."}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Under 50 expected steps per task:"})," Almost always start with a single agent."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Under 50,000 tokens of accumulated context per task:"})," Single agent context management strategies (summarization, retrieval) are usually sufficient."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Under 3 clearly independent workstreams:"})," Consider whether a single agent with parallel tool calls is sufficient before introducing agent coordination."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Under 5 distinct specialized capabilities needed:"})," A single carefully designed prompt can usually handle this. Beyond 5, specialization benefits of separate agents start to outweigh coordination costs."]})]}),e.jsx(n,{title:"Benchmark the single-agent baseline before adding agents",children:"Before designing a multi-agent system, build and benchmark a single-agent baseline. Know its failure rate, average cost, and latency. The multi-agent system must demonstrably improve at least one of these metrics without catastrophically worsening another. If the multi-agent system has higher failure rate, higher cost, and higher latency than the monolithic baseline, you have paid the coordination tax without receiving the benefit."}),e.jsx(r,{title:"Multi-agent systems amplify prompt injection risks",children:"When agents communicate, an adversarial result in one agent's tool output can inject instructions that the next agent follows. A single-agent system has one entry point for this attack. A multi-agent system has as many entry points as there are inter-agent message exchanges. The expanded attack surface is a real production security consideration, not a theoretical concern."}),e.jsx(a,{title:"The best architecture is the simplest one that meets requirements",children:"Production systems that have been running for years tend to be simpler than their initial designs. Teams discover that most of the complexity they anticipated needing was not necessary in practice. Apply the same lesson proactively: start simple, measure real failure modes, and add complexity only where data shows it is needed. An agent system you can debug at 3am is more valuable than an elegant architecture you cannot reason about under pressure."})]})}const T=Object.freeze(Object.defineProperty({__proto__:null,default:c},Symbol.toStringTag,{value:"Module"}));function u(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Multi-Agent Systems Overview"}),e.jsx("p",{children:"Multi-agent systems coordinate multiple LLM-based agents to accomplish tasks that are difficult or impossible for a single agent. The fundamental insight is that complex problems can often be decomposed into subtasks where different agents work on different pieces concurrently, check each other's work independently, or bring specialized capabilities to bear on specific parts of the problem. Multi-agent systems trade increased architectural complexity for increased capability, parallelism, and specialization."}),e.jsx(t,{term:"Multi-Agent System",children:"A multi-agent system is an architecture in which two or more LLM-based agents communicate, coordinate, and collaborate to accomplish a shared goal. Agents may operate in parallel or sequence, may have specialized roles or identical capabilities, and may coordinate through shared state, direct message passing, or an orchestrating controller. The key property distinguishing multi-agent from single-agent is that no single agent holds complete information about the task — it is distributed across the system."}),e.jsx("h2",{children:"Why Multiple Agents?"}),e.jsx("h3",{children:"Overcoming Context Window Limits"}),e.jsx("p",{children:"The most fundamental driver of multi-agent architectures is context. Even frontier models with 200K+ token context windows cannot hold arbitrarily large tasks. A codebase analysis task that requires reading 500 files, a research task that requires processing 1,000 papers, or a data processing pipeline that works on a dataset too large for context — these tasks require distributing work across multiple agents, each handling a portion of the data."}),e.jsx("h3",{children:"Parallel Execution"}),e.jsx("p",{children:"Independent subtasks that would execute serially in a single agent can execute in parallel across multiple agents. A research agent that needs to gather information from five different sources can complete five times faster if each agent handles one source simultaneously. For latency-sensitive workflows, this parallelism is often the primary motivation for multi-agent design."}),e.jsx("h3",{children:"Specialization"}),e.jsx("p",{children:"Different agents can be optimized for different subtasks: a retrieval agent tuned for search, a coding agent with a code-focused system prompt and code execution tools, a writing agent optimized for synthesis and style. Specialization allows each agent to perform its subtask more reliably than a generalist agent attempting all tasks within a single prompt. In systems with many distinct capability requirements, specialization provides cleaner interfaces and easier maintenance."}),e.jsx("h3",{children:"Independent Verification"}),e.jsx("p",{children:"Having one agent produce output and another independently verify it catches errors that would be invisible to self-review. Research has shown that LLMs are better at catching errors in other models' outputs than in their own — they are not anchored to the same reasoning path. Independent verification adds quality and safety at the cost of additional compute."}),e.jsx("h2",{children:"Coordination Challenges"}),e.jsx("h3",{children:"Communication Overhead"}),e.jsx("p",{children:"Every handoff between agents requires serializing the output of one agent into a form that the next agent can understand. Information is inevitably compressed or reformatted, and the receiving agent must correctly interpret the sender's output. This introduces error surface that does not exist in single-agent systems. Designing clear, well-structured inter-agent communication is one of the most important engineering problems in multi-agent system design."}),e.jsx("h3",{children:"State Consistency"}),e.jsx("p",{children:"When multiple agents operate on shared state — a shared document, a shared database, a shared plan — concurrent modifications can produce inconsistencies. Unlike traditional concurrent programming where locking and transactions provide consistency guarantees, LLM agents are not naturally transaction-aware. Building reliable shared state in multi-agent systems requires explicit consistency protocols."}),e.jsx("h3",{children:"Error Propagation"}),e.jsx("p",{children:"An error made by one agent can propagate and compound through subsequent agents. An orchestrator that misinterprets a subtask may give incorrect instructions to multiple workers. A worker agent that produces a subtly wrong result may corrupt the state that other agents depend on. Multi-agent systems require more robust error detection and recovery than single-agent systems because the blast radius of a single failure is larger."}),e.jsx("h3",{children:"Debugging Complexity"}),e.jsx("p",{children:"When a multi-agent system produces a wrong result, identifying the root cause requires examining the conversations of every agent that participated in the task. A bug in the system may manifest as a wrong final output with the root cause buried in an intermediate agent's conversation from 10 steps earlier. Good observability tooling — tracing every agent call in a unified view — is not optional in multi-agent production systems."}),e.jsx(i,{title:"Simple Two-Agent System: Worker + Verifier",tabs:{python:`import json
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Worker agent: produces a draft answer
# ---------------------------------------------------------------------------

WORKER_SYSTEM = """You are a research analyst. Given a question, use your tools to
research the topic thoroughly and produce a detailed, factual answer.
Structure your answer clearly with key findings highlighted."""

WORKER_TOOLS = [
    {
        "name": "search",
        "description": "Search for information on a topic.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Search query"}},
            "required": ["query"]
        }
    }
]

def fake_search(query: str) -> str:
    return json.dumps({"results": [{"passage": f"Comprehensive information about: {query}. Key facts: [1] Important detail A. [2] Important detail B. [3] Important detail C.", "source": "knowledge_base"}]})

def run_worker(question: str) -> str:
    """Worker agent: research and draft an answer."""
    messages = [{"role": "user", "content": f"Research and answer this question: {question}"}]
    for _ in range(5):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=WORKER_SYSTEM,
            tools=WORKER_TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason == "end_turn":
            return next((b.text for b in response.content if hasattr(b, "text")), "")
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = fake_search(block.input["query"])
                tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})
        if tool_results:
            messages.append({"role": "user", "content": tool_results})
    return "Research incomplete."

# ---------------------------------------------------------------------------
# Verifier agent: critiques and improves the draft
# ---------------------------------------------------------------------------

VERIFIER_SYSTEM = """You are a critical fact-checker and editor. Given a question and a
draft answer, evaluate:
1. Factual accuracy — flag any claims that seem uncertain or incorrect
2. Completeness — identify important aspects of the question not addressed
3. Clarity — note any confusing or poorly structured sections

Return a JSON object with:
- "verdict": "pass" | "needs_revision"
- "issues": list of specific problems found (empty if verdict is "pass")
- "revised_answer": improved version if verdict is "needs_revision", null otherwise"""

def run_verifier(question: str, draft: str) -> dict:
    """Verifier agent: critique and optionally revise the draft."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        system=VERIFIER_SYSTEM,
        messages=[{
            "role": "user",
            "content": f"Question: {question}\\n\\nDraft answer:\\n{draft}\\n\\nEvaluate and return JSON."
        }],
    )
    text = next((b.text for b in response.content if hasattr(b, "text")), "{}")
    try:
        # Extract JSON from the response
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end]) if start >= 0 else {"verdict": "pass", "issues": []}
    except json.JSONDecodeError:
        return {"verdict": "pass", "issues": [], "note": "Could not parse verifier response"}

# ---------------------------------------------------------------------------
# Orchestrator: run worker then verifier
# ---------------------------------------------------------------------------

def run_two_agent_pipeline(question: str) -> str:
    """Orchestrate a worker-verifier pipeline."""
    print("Step 1: Worker agent researching...")
    draft = run_worker(question)
    print(f"Draft produced ({len(draft)} chars)")

    print("Step 2: Verifier agent reviewing...")
    verdict = run_verifier(question, draft)
    print(f"Verdict: {verdict.get('verdict')} | Issues: {len(verdict.get('issues', []))}")

    if verdict.get("verdict") == "needs_revision" and verdict.get("revised_answer"):
        print("Using revised answer from verifier.")
        return verdict["revised_answer"]
    return draft

result = run_two_agent_pipeline("What are the main differences between supervised and unsupervised learning?")
print("\\nFinal answer:")
print(result)`,typescript:`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Worker agent
// ---------------------------------------------------------------------------

const WORKER_SYSTEM = You are a research analyst. Research the given question thoroughly
and produce a detailed, factual answer with key findings highlighted.;

const workerTools: Anthropic.Tool[] = [{
  name: "search",
  description: "Search for information on a topic.",
  input_schema: { type: "object" as const, properties: { query: { type: "string", description: "Search query" } }, required: ["query"] },
}];

function fakeSearch(query: string): string {
  return JSON.stringify({ results: [{ passage: Information about: \${query}. Key facts: [1] Detail A. [2] Detail B., source: "kb" }] });
}

async function runWorker(question: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: Research and answer: \${question} }];
  for (let i = 0; i < 5; i++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6", max_tokens: 1024, system: WORKER_SYSTEM, tools: workerTools, messages,
    });
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason === "end_turn") {
      const text = response.content.find((b) => b.type === "text");
      return text && "text" in text ? text.text : "";
    }
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inp = block.input as { query: string };
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: fakeSearch(inp.query) });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
  }
  return "Research incomplete.";
}

// ---------------------------------------------------------------------------
// Verifier agent
// ---------------------------------------------------------------------------

const VERIFIER_SYSTEM = You are a critical fact-checker. Given a question and draft answer, return JSON:
{"verdict":"pass"|"needs_revision","issues":["..."],"revised_answer":"..." or null};

async function runVerifier(question: string, draft: string): Promise<{ verdict: string; issues: string[]; revised_answer?: string }> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: VERIFIER_SYSTEM,
    messages: [{ role: "user", content: Question: \${question}\\n\\nDraft:\\n\${draft}\\n\\nReturn JSON. }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  const text = textBlock && "text" in textBlock ? textBlock.text : "{}";
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    return JSON.parse(text.slice(start, end));
  } catch { return { verdict: "pass", issues: [] }; }
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

async function runTwoAgentPipeline(question: string): Promise<string> {
  console.log("Step 1: Worker agent researching...");
  const draft = await runWorker(question);
  console.log(Draft produced (\${draft.length} chars));

  console.log("Step 2: Verifier agent reviewing...");
  const verdict = await runVerifier(question, draft);
  console.log(Verdict: \${verdict.verdict} | Issues: \${verdict.issues.length});

  return verdict.verdict === "needs_revision" && verdict.revised_answer ? verdict.revised_answer : draft;
}

runTwoAgentPipeline("What are the main differences between supervised and unsupervised learning?")
  .then((result) => { console.log("\\nFinal answer:\\n" + result); });`}}),e.jsx("h2",{children:"Communication Topologies"}),e.jsx("p",{children:"Multi-agent systems can be organized with different communication structures:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Hub-and-spoke (orchestrator-worker):"})," A central orchestrator communicates with worker agents. Workers do not communicate with each other. Simple, debuggable, but the orchestrator becomes a bottleneck."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Pipeline:"})," Agents are arranged in a sequence where each agent's output becomes the next agent's input. Natural for data transformation tasks. Failures propagate downstream."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Peer-to-peer:"})," Agents can communicate with any other agent. Most flexible, most complex. Requires careful design to avoid cycles and deadlocks."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Blackboard:"}),' Agents share a common knowledge store (the "blackboard") that they read from and write to. Coordination happens through shared state rather than direct messaging.']})]}),e.jsx(s,{name:"Start with Hub-and-Spoke",category:"Multi-Agent Architecture",description:"When building your first multi-agent system, start with a hub-and-spoke topology. A single orchestrator coordinates a set of worker agents with no direct worker-to-worker communication. This topology is the simplest to implement, debug, and reason about. Only introduce more complex topologies when the hub-and-spoke design demonstrably cannot meet your requirements.",when:["Building the first iteration of any multi-agent system","Tasks that naturally decompose into independent parallel workstreams","Systems where clear accountability for failures is required"],avoid:["Peer-to-peer communication unless you have explicit requirements that need it","Agent-to-agent communication that bypasses logging and observability","Communication protocols that lose information from one agent to the next"]}),e.jsx(n,{title:"Design for observability from the start",children:"Multi-agent systems are significantly harder to debug than single-agent systems. Before writing agent logic, implement tracing that records every agent invocation, every message exchanged, and every tool call across all agents, with a unified trace ID that links all activity for a single user task. This tracing infrastructure pays dividends immediately when the first production failure occurs."}),e.jsx(r,{title:"Complexity compounds with agent count",children:"Adding a third agent to a two-agent system does not add 50% more complexity — it multiplies it. The number of possible interaction patterns grows combinatorially. Keep your agent count as low as possible. Three well-designed agents are almost always preferable to seven narrowly specialized ones."}),e.jsx(a,{title:"Multi-agent systems are not inherently more reliable",children:"A common misconception is that having multiple agents produces more reliable results because errors are caught by other agents. In practice, multi-agent systems often have higher failure rates than equivalent single-agent systems, because coordination failures are added on top of individual agent failures. Multi-agent reliability requires deliberate design, not just adding agents."})]})}const A=Object.freeze(Object.defineProperty({__proto__:null,default:u},Symbol.toStringTag,{value:"Module"}));function d(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Inter-Agent Communication Patterns"}),e.jsx("p",{children:"In a multi-agent system, how agents communicate with each other is as important as what each individual agent does. Poor communication design — messages that lose critical context, protocols that are ambiguous, handoffs that drop state — will cause failures regardless of how capable the individual agents are. This section covers the core communication patterns, their trade-offs, and the implementation details that determine whether a multi-agent system works reliably in production."}),e.jsx(t,{term:"Agent Communication Protocol",children:"An agent communication protocol defines how one agent sends information to another: the message format, the delivery mechanism, the expected response structure, and the error handling behavior. A well-designed protocol minimizes information loss at boundaries, is unambiguous about what the receiving agent should do, and includes enough context for the receiver to act without needing to ask follow-up questions."}),e.jsx("h2",{children:"Message Passing"}),e.jsx("p",{children:"Message passing is the most common inter-agent communication pattern: one agent produces a message, it is delivered to another agent's input, and that agent processes it and may produce its own output message. The key design decisions are message format and what context to include."}),e.jsx("h3",{children:"Structured vs. Free-Text Messages"}),e.jsx("p",{children:"Free-text messages between agents are natural — one agent just writes a summary and passes it to the next. But free-text messages are ambiguous. A recipient agent must parse the text to understand what it is being asked to do, and parsing errors compound. Structured messages with explicit fields for task description, context, constraints, and expected output format reduce ambiguity significantly and make inter-agent communication more reliable."}),e.jsx(i,{title:"Structured Inter-Agent Message Passing",tabs:{python:`import json
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
print(answer)`,typescript:`import Anthropic from "@anthropic-ai/sdk";

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
  .then((answer) => { console.log("\\nFinal answer:\\n" + answer); });`}}),e.jsx("h2",{children:"Shared State Communication"}),e.jsx("p",{children:'Instead of passing messages between agents, shared state architectures give all agents access to a common data store — a document, a database record, a key-value store — that they read from and write to. Agents communicate implicitly by modifying shared state that other agents observe. This pattern works well for collaborative document editing, planning and re-planning scenarios, and any task where the "current state" is more important than the sequence of messages that produced it.'}),e.jsx("p",{children:"The main challenge with shared state is consistency: if two agents write to the same location simultaneously, one may overwrite the other's work. Solutions include optimistic locking (agents check a version number before writing), section ownership (each agent owns a distinct portion of the shared document), and event sourcing (agents append to a log rather than overwriting)."}),e.jsx("h2",{children:"Context Propagation"}),e.jsx("p",{children:"When work passes between agents, how much context to include is a critical decision. Too little context and the receiving agent lacks the information it needs to do its job well. Too much context and the receiving agent's context window is consumed by background that may not be relevant to its specific subtask."}),e.jsx("p",{children:"The principle is to pass the minimum context required for the receiving agent to complete its task correctly. This usually includes: the original user goal, the specific subtask being delegated, the outputs of any previous steps that are directly relevant, and any constraints that apply to the delegated work. It does not include the full conversation history of the delegating agent unless specifically needed."}),e.jsx(s,{name:"Canonical Context Object",category:"Communication Design",description:"Define a canonical context object that is passed between agents. This object contains the fields that any agent needs to understand its role: the original user request, the current task, relevant prior results, and active constraints. Agents add their outputs to the context object, which the orchestrator passes to subsequent agents. This makes inter-agent communication explicit and auditable.",when:["Building any multi-agent pipeline where work flows through multiple agents","Systems where debugging requires understanding what each agent knew when it acted","Pipelines where context must be selectively expanded as more information is gathered"],avoid:["Passing the full conversation history of one agent to another","Using unstructured free-text for task delegation between agents","Dropping intermediate results when passing context to downstream agents"]}),e.jsx(n,{title:"Version your inter-agent message schema",children:"As your multi-agent system evolves, the schema of messages between agents will change. Include a schema version in every inter-agent message. This allows you to evolve the schema without breaking existing agents, run old and new agent versions in parallel during migration, and clearly identify mismatches when a message from an old agent reaches a new agent or vice versa."}),e.jsx(r,{title:"Beware of context explosion",children:"It is tempting to include more and more context in inter-agent messages to prevent agents from missing information. This leads to context explosion: each agent passes its full context to the next, which includes the previous agent's full context, which grows quadratically. Set a strict budget for inter-agent message size and summarize earlier context rather than passing it verbatim."}),e.jsx(a,{title:"Log all inter-agent messages",children:"Every message exchanged between agents should be logged with timestamp, sender, receiver, message ID, and full content. This logging is your primary debugging tool when a multi-agent task produces wrong results. Without comprehensive message logs, diagnosing failures in production multi-agent systems is extremely difficult."})]})}const R=Object.freeze(Object.defineProperty({__proto__:null,default:d},Symbol.toStringTag,{value:"Module"}));function h(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Coordination Patterns in Multi-Agent Systems"}),e.jsx("p",{children:"When multiple agents must work together toward a shared goal, how they coordinate their efforts determines whether the system is efficient, correct, and robust. Different coordination patterns make different trade-offs between simplicity, throughput, fairness, and resilience. Choosing the right pattern for your use case is as important as choosing the right model or writing the right prompt."}),e.jsx("h2",{children:"Sequential Pipeline"}),e.jsx(t,{term:"Sequential Pipeline Pattern",children:"In a sequential pipeline, agents are arranged in a fixed order where each agent processes the output of the previous agent before passing its own output to the next. The coordination is entirely deterministic: agent A always runs before agent B, which always runs before agent C. This is the simplest coordination pattern and the right starting point for tasks with a natural sequential structure."}),e.jsx("p",{children:"Sequential pipelines excel when each stage clearly depends on the output of the previous stage. A document processing pipeline might have stages for extraction, cleaning, enrichment, and summarization — each stage logically follows from the last. The failure mode is simple: if any stage fails, the pipeline halts at that stage. Recovery is straightforward: restart from the failed stage."}),e.jsx("p",{children:"The limitation of sequential pipelines is that they are slow — all stages must complete before the final result is available, and there is no parallelism regardless of whether intermediate stages are actually interdependent. For latency-sensitive applications with large data volumes, the sequential pipeline's simplicity comes at a significant performance cost."}),e.jsx("h2",{children:"Fan-Out / Fan-In (Parallel Coordination)"}),e.jsx(t,{term:"Fan-Out / Fan-In",children:"Fan-out / fan-in divides a task into independent subtasks, distributes them to multiple agents for parallel execution (fan-out), then collects and aggregates all results once they are complete (fan-in). This pattern is ideal for tasks that can be cleanly partitioned: analyze 10 documents in parallel, then synthesize the individual analyses into a unified report."}),e.jsx("p",{children:"The key requirement for fan-out / fan-in is that the subtasks must be genuinely independent — no subtask should depend on the output of another subtask at the same level. If there are dependencies, those subtasks must be sequenced rather than parallelized. The aggregation step (fan-in) must also handle the case where some subtasks fail: decide whether to proceed with partial results or retry failed tasks before aggregating."}),e.jsx("p",{children:"Implementation requires an async execution layer. In Python, use asyncio.gather or a ThreadPoolExecutor to run multiple agent calls concurrently. In TypeScript, use Promise.all or Promise.allSettled. The fan-in step typically involves a synthesizing agent that receives all subtask results and produces a unified output."}),e.jsx("h2",{children:"Round-Robin"}),e.jsx(t,{term:"Round-Robin Coordination",children:"Round-robin coordination cycles task assignments through a pool of worker agents in turn, ensuring each agent gets an equal share of tasks. A round-robin coordinator maintains a pointer to the next agent to receive a task, advancing it by one after each assignment. This is appropriate for load-balanced systems where tasks are similar in complexity and the goal is uniform utilization across agents."}),e.jsx("p",{children:"Round-robin is simple to implement but naive: it ignores differences in agent availability and task complexity. A task that takes 30 seconds assigned to a busy agent holds up the queue, while an idle agent sits unused. For high-variance task workloads, work-stealing or dynamic assignment produces better throughput."}),e.jsx("h2",{children:"Voting and Ensemble"}),e.jsx(t,{term:"Voting Coordination",children:'Voting coordination runs the same task on multiple independent agents and selects the final output by majority vote or a weighted combination of responses. This improves reliability and consistency for tasks where individual agents may make different errors. A three-agent system that produces "correct, incorrect, correct" votes correctly on the final answer. Voting is particularly valuable for classification tasks, factual question answering, and decisions where one agent might hallucinate.'}),e.jsx("p",{children:"The cost of voting is multiplicative: N-way voting costs N times as much as a single-agent response and takes as long as the slowest agent. This is justified when correctness is critical and the error reduction from voting is demonstrable. Before committing to multi-agent voting, measure the error reduction empirically on your specific task distribution — for some tasks, a single better-prompted agent outperforms three weakly-prompted agents with majority voting."}),e.jsx("h3",{children:"Vote Aggregation Strategies"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Simple majority:"})," The answer that more than half the agents agree on. Fails when there is no majority."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Plurality:"})," The most common answer, even if not a majority. Works when agents may all produce different answers."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Weighted voting:"})," Agents are weighted by their demonstrated accuracy on similar tasks. Higher-confidence or higher-capability agents have more influence."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"LLM judge:"})," A separate evaluator agent reads all responses and selects or synthesizes the best one. Most flexible but adds an additional LLM call."]})]}),e.jsx("h2",{children:"Bidding / Market-Based Coordination"}),e.jsx(t,{term:"Market-Based Coordination",children:"In market-based coordination, tasks are auctioned to agents that bid based on their estimated capability to complete the task. Agents advertise their specializations, assess incoming tasks, and submit bids. The coordinator assigns each task to the lowest-cost or highest-capability bidder. This pattern enables dynamic specialization: agents self-select for tasks they are best suited to, without requiring the coordinator to know which agent is most appropriate for each task type."}),e.jsx("p",{children:"Market-based coordination is sophisticated and powerful for systems with diverse agent specializations, but it introduces significant complexity: a bidding protocol, capability advertisement, bid evaluation, and assignment logic. It is rarely necessary in practice — a simple routing table that maps task types to appropriate agents achieves similar specialization with far less complexity."}),e.jsx("h2",{children:"Blackboard Pattern"}),e.jsx(t,{term:"Blackboard Pattern",children:'The blackboard pattern uses a shared data store (the "blackboard") that all agents can read from and write to. Agents monitor the blackboard for tasks that match their specializations, claim tasks, produce results, and write them back to the blackboard. Coordination emerges from the shared state rather than from direct agent-to-agent communication. The blackboard acts as both the task queue and the result store.'}),e.jsx("p",{children:'The blackboard pattern is particularly well-suited for tasks where the set of subtasks is not known in advance — it emerges as agents process the task and discover what additional work is needed. A code analysis agent might add "analyze function X" entries to the blackboard as it discovers functions that need review, and other agents claim and complete those entries. The task is complete when the blackboard is empty.'}),e.jsx(s,{name:"Match Pattern to Task Structure",category:"Coordination",description:"Sequential pipelines for tasks with inherent data dependencies between stages. Fan-out/fan-in for tasks with genuinely independent parallel subtasks. Voting for high-stakes decisions where individual agent errors must be caught. Blackboard for tasks where the full set of subtasks is discovered dynamically during execution. Use the simplest pattern that meets your requirements.",when:["Sequential pipeline: document processing, ETL workflows, staged analysis","Fan-out/fan-in: research across multiple sources, parallel data processing","Voting: fact-checking, medical triage, financial decisions","Blackboard: open-ended exploration tasks, dynamic code analysis workflows"],avoid:["Market-based coordination unless you have genuinely diverse, autonomous specialist agents","Voting for generative tasks like writing — the 'average' of three essays is not good","Sequential pipelines for tasks with parallelism potential when latency matters"]}),e.jsx(n,{title:"Implement backpressure for parallel coordination",children:"When using fan-out to distribute many tasks to worker agents, implement backpressure to prevent overwhelming your LLM API rate limits. Use a semaphore or concurrency limiter to cap the number of simultaneously running agent calls. Without backpressure, a large fan-out can trigger rate limiting that causes cascading failures across all parallel workers."}),e.jsx(r,{title:"Deadlocks are possible in bidirectional agent networks",children:"In systems where agents can delegate tasks to each other (not just orchestrator to worker), circular dependencies can cause deadlocks: agent A waits for agent B, which waits for agent C, which waits for agent A. Detect this by implementing request timeouts and cycle detection. The simplest prevention is to enforce a strict hierarchy: orchestrators can call workers, but workers cannot call other workers."}),e.jsx(a,{title:"Most production systems use simple patterns",children:"The research literature on multi-agent coordination covers many sophisticated patterns. Production systems that actually work reliably at scale use almost exclusively sequential pipelines and fan-out/fan-in. The simpler patterns are not unsophisticated — they are the result of hard-won experience that complexity beyond these patterns does not pay for itself in production environments."})]})}const q=Object.freeze(Object.defineProperty({__proto__:null,default:h},Symbol.toStringTag,{value:"Module"}));function p(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"The Orchestrator-Worker Pattern"}),e.jsx("p",{children:"The orchestrator-worker pattern is the most widely used multi-agent architecture in production systems. A central orchestrator agent decomposes a high-level task into subtasks, delegates each subtask to a specialized worker agent, collects the results, and synthesizes them into a final answer. The orchestrator does not execute tasks directly — it reasons about task decomposition, delegation, and synthesis. Workers do not make high-level decisions — they receive clear, well-scoped instructions and execute them."}),e.jsx(t,{term:"Orchestrator-Worker Pattern",children:"In the orchestrator-worker pattern, an orchestrator agent receives a user task, breaks it into subtasks with clear specifications, dispatches each subtask to an appropriate worker agent, monitors completion, handles failures, and aggregates worker results into a final deliverable. Workers are typically specialized agents with specific tools and system prompts optimized for their task type. The orchestrator holds the complete task context; workers receive only the context needed for their specific subtask."}),e.jsx("h2",{children:"Orchestrator Responsibilities"}),e.jsx("h3",{children:"Task Decomposition"}),e.jsx("p",{children:"The orchestrator must analyze the user's goal and determine: what subtasks are required, what dependencies exist between them, which workers should handle each subtask, and what information each worker needs. Good decomposition produces subtasks that are independently executable, clearly scoped, and together sufficient to accomplish the goal. Poor decomposition produces subtasks that overlap, have unclear boundaries, or require workers to make decisions above their capability."}),e.jsx("h3",{children:"Context Scoping"}),e.jsx("p",{children:"The orchestrator holds the full task context but should not pass all of it to every worker. Each worker receives only the context required for its specific subtask. This keeps worker context windows focused, prevents workers from making decisions outside their scope, and reduces token costs. The orchestrator is the only agent that holds the complete picture."}),e.jsx("h3",{children:"Result Aggregation"}),e.jsx("p",{children:"Once workers have completed their subtasks, the orchestrator must combine their results into a coherent final output. This may be as simple as concatenating summaries or as complex as identifying and resolving contradictions between worker outputs, deciding which worker's answer to use when they disagree, or synthesizing complementary results into a unified analysis."}),e.jsx("h3",{children:"Error Handling and Retry"}),e.jsx("p",{children:"When a worker fails, the orchestrator decides how to respond: retry with the same worker, reassign to a different worker, proceed with partial results, or abort the task. These decisions require judgment about the importance of the failed subtask and the availability of alternatives. The orchestrator should have explicit policies for common failure modes rather than requiring the LLM to make these decisions ad-hoc."}),e.jsx(i,{title:"Orchestrator-Worker with Specialized Workers and Result Aggregation",tabs:{python:`import asyncio
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

asyncio.run(main())`,typescript:`import Anthropic from "@anthropic-ai/sdk";

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
});`}}),e.jsx("h2",{children:"Worker Design Principles"}),e.jsx("h3",{children:"Single Responsibility"}),e.jsx("p",{children:"Each worker agent should have one clearly defined responsibility: research, analysis, code generation, quality review, or writing. Mixing responsibilities in a single worker makes it harder to optimize the worker's system prompt, harder to replace or upgrade individual workers, and harder to diagnose which worker caused a failure."}),e.jsx("h3",{children:"Structured Output"}),e.jsx("p",{children:"Workers should return structured output — JSON with defined fields — rather than free-form prose, wherever possible. The orchestrator needs to parse and act on worker outputs programmatically. Structured outputs make this reliable. The final synthesis step that produces human-readable output can be a dedicated writing worker that accepts structured inputs and produces prose."}),e.jsx("h3",{children:"Self-Contained Tasks"}),e.jsx("p",{children:"Each worker task should be self-contained: the worker should be able to complete its subtask with only the context it receives, without needing to ask the orchestrator for clarification or additional information. If a worker frequently needs follow-up information from the orchestrator, the task decomposition or context scoping needs improvement."}),e.jsx(s,{name:"Thin Orchestrator, Thick Workers",category:"Orchestration Design",description:"Put as little intelligence as possible in the orchestrator. The orchestrator should handle task decomposition and routing, but the actual work happens in workers. An orchestrator that tries to do too much reasoning itself becomes a bottleneck and a single point of complexity. Workers that are richly specialized perform better because they can be optimized independently.",when:["Building a new orchestrator-worker system from scratch","Refactoring an orchestrator that has accumulated too many responsibilities","Designing systems that need to scale by adding more specialized workers"],avoid:["Orchestrators that do substantive reasoning about domain content","Workers that make meta-level decisions about task routing","Orchestrators with domain-specific knowledge that belongs in worker prompts"]}),e.jsx(n,{title:"Test workers in isolation before integrating",children:"Each worker agent should be tested independently with representative inputs before being integrated into the orchestration system. Unit testing workers in isolation allows you to measure their accuracy, identify failure modes, and tune their prompts without the complexity of the full multi-agent system. Integration bugs and worker bugs are much easier to diagnose separately."}),e.jsx(r,{title:"Long orchestrator context windows increase cost and error rate",children:"As the orchestrator's task progresses, its context accumulates worker results, intermediate decisions, and error states. Long orchestrator contexts are expensive and increase the chance of the orchestrator losing track of earlier decisions. Summarize completed subtask results before appending them to the orchestrator's history to keep context manageable."}),e.jsx(a,{title:"The orchestrator does not need to be the most capable model",children:"It is tempting to use the most capable model for the orchestrator. But if the task decomposition is well-defined, a smaller, faster model may orchestrate just as well at lower cost. The orchestrator's job is routing and synthesis, not deep domain reasoning. Reserve the most capable models for workers that perform the hardest subtasks."})]})}const E=Object.freeze(Object.defineProperty({__proto__:null,default:p},Symbol.toStringTag,{value:"Module"}));function m(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Hierarchical Agent Systems"}),e.jsx("p",{children:"A hierarchical agent system extends the orchestrator-worker pattern by introducing multiple levels of orchestration. A top-level orchestrator delegates to mid-level orchestrators, which in turn delegate to leaf-level workers. Each level manages a different scope of complexity: the top level handles overall strategy, middle levels handle coordination within major task components, and leaf workers handle atomic execution tasks. This structure enables managing tasks of a scale and complexity that would overwhelm a single orchestration layer."}),e.jsx(t,{term:"Hierarchical Agent System",children:"A hierarchical agent system organizes agents in a tree structure with multiple levels of orchestration. Top-level orchestrators hold the broadest task context and make high-level decomposition decisions. Mid-level orchestrators manage subtask coordination within their scope. Leaf workers execute atomic, well-specified tasks. Information flows downward as task assignments and upward as results. No agent needs to understand the full scope of the task — each level only needs to understand its own layer."}),e.jsx("h2",{children:"When Hierarchical Systems Are Appropriate"}),e.jsx("h3",{children:"Task Scale"}),e.jsx("p",{children:"When a task is too large for a single orchestrator to manage coherently — the full context of all subtasks would overflow its context window — a hierarchical structure distributes the coordination burden. Each orchestrator manages only the subtasks within its scope rather than the full task. A large software project analysis might have a top-level orchestrator managing component analyses, mid-level orchestrators for each component, and leaf workers for individual file analyses."}),e.jsx("h3",{children:"Domain Boundaries"}),e.jsx("p",{children:"When a task crosses clear domain boundaries and each domain requires specialized coordination logic, hierarchical organization naturally maps to those boundaries. A research report task might have one mid-level orchestrator managing technical research (with code analysis workers and paper search workers) and another managing business analysis (with market data workers and competitive analysis workers). The top-level orchestrator coordinates between domains."}),e.jsx("h3",{children:"Reusability"}),e.jsx("p",{children:'Sub-orchestrator agents that manage well-defined subtask categories can be reused across different top-level tasks. A "document analysis orchestrator" that coordinates extraction, summarization, and entity recognition workers can be called by any top-level task that needs to process a document. This modularity is a key advantage of hierarchical over flat multi-agent designs.'}),e.jsx("h2",{children:"Communication Flow in Hierarchies"}),e.jsx("p",{children:"Information in hierarchical agent systems flows in two directions:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Downward (task assignment):"})," Each orchestrator passes task context and instructions to its children. The context is scoped to the child's responsibility — a leaf worker does not receive the full task context, only what is needed for its subtask. This scoping is critical: it keeps worker context focused and prevents workers from making decisions above their level."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Upward (result aggregation):"})," Workers return results to their immediate parent orchestrator. The parent aggregates and summarizes before returning upward. Information is compressed and abstracted at each level: raw data at the leaves, summaries at mid-levels, high-level conclusions at the top. This compression prevents context explosion as results propagate upward."]})]}),e.jsx("h2",{children:"Scope and Responsibility Management"}),e.jsx("p",{children:"A critical design principle for hierarchical systems is that each agent should have a clearly defined scope and should not act outside it. An agent at level 2 should not make decisions that belong to level 1, and should not need information from level 3 to make its decisions. This discipline is what makes hierarchical systems manageable."}),e.jsx("p",{children:'Scope violations manifest as agents that "reach up" to ask for context that should have been provided in their task assignment, or agents that "reach down" to make decisions that should be delegated to sub-agents. When you observe these patterns, it is a signal that the hierarchy is mis-designed: the task assignment was under-specified, or the responsibility boundaries are unclear.'}),e.jsx("h2",{children:"Depth vs. Width Trade-offs"}),e.jsx("h3",{children:"Deep Hierarchies (more levels)"}),e.jsx("p",{children:"More levels allow more granular specialization and smaller scopes per agent. Each agent is simpler and more focused. The downside is latency: every level adds at least one additional round-trip, and in a strictly sequential hierarchy, depth multiplies latency directly. Deep hierarchies also make debugging harder — understanding why the final output is wrong requires tracing through more levels."}),e.jsx("h3",{children:"Wide Hierarchies (more workers per level)"}),e.jsx("p",{children:"More workers per level enables more parallelism but increases the aggregation burden on the orchestrator at that level. An orchestrator managing 20 parallel workers must synthesize 20 results — and its context window must accommodate all 20 results simultaneously. Width is bounded by context window limits, result quality, and the orchestrator's capacity to coherently aggregate many inputs."}),e.jsx("p",{children:"In practice, 2–3 levels with 3–7 workers per level covers most use cases that genuinely require hierarchical organization. Deeper or wider structures should be motivated by specific, measured requirements rather than anticipatory design."}),e.jsx("h2",{children:"Handling Failures Across Levels"}),e.jsx("p",{children:"Failure handling in hierarchical systems must be explicitly designed at each level. When a leaf worker fails, its parent orchestrator must decide: retry, skip the subtask, or escalate the failure. When a mid-level orchestrator fails, the top-level orchestrator must decide whether to retry the entire sub-hierarchy or proceed with partial results. These decisions should be encoded as explicit policies, not left to ad-hoc LLM judgment."}),e.jsx("p",{children:'A common approach is to establish a "partial result policy" at each level: if more than X% of subtasks succeed, the orchestrator synthesizes available results and clearly marks missing components in its output. If fewer than X% succeed, it returns an error to its parent. The parent then applies the same policy. This makes failure handling predictable and auditable.'}),e.jsx(s,{name:"Two-Level Hierarchy as Default",category:"Hierarchical Design",description:"Most tasks that require hierarchical organization can be handled with two levels: a single top-level orchestrator and a set of specialized workers. Before adding a third level, verify with data that a two-level hierarchy genuinely fails to meet your requirements. Third levels add significant complexity and latency overhead that is rarely justified.",when:["Tasks that decompose into two or three major domains, each requiring multiple workers","Systems where sub-orchestrators are reusable modules called from multiple top-level tasks","Workflows with scope too large for a single orchestrator's context window"],avoid:["Adding levels to model organizational hierarchy rather than task hierarchy","Hierarchies deeper than 3 levels without explicit performance justification","Creating mid-level orchestrators that do not genuinely aggregate or route"]}),e.jsx(n,{title:"Give each orchestrator a unique, descriptive name and role",children:'In a hierarchical system, every orchestrator should have a distinct name (e.g., "research-coordinator", "code-analysis-orchestrator") and a clearly documented scope. These names should appear in your logs and traces. When debugging, you need to immediately understand which level of the hierarchy produced a given log entry and what that agent was responsible for. Ambiguous agent naming in hierarchical systems makes debugging exponentially harder.'}),e.jsx(r,{title:"Hierarchical systems have multiplicative latency",children:"In a strictly sequential hierarchy with 3 levels and 3 agents per level, the minimum task latency is the sum of 9 agent calls in series. Each LLM call adds seconds of latency. For interactive applications, the accumulated latency of a deep sequential hierarchy may be unacceptable. Use asynchronous parallel execution wherever possible within each level, and consider whether a shallower architecture with more parallelism at each level can achieve the same results with lower latency."}),e.jsx(a,{title:"Track task IDs across the hierarchy",children:'Every task assignment in a hierarchical system should carry a task ID that links it to the original user request. When a top-level orchestrator creates sub-tasks, those sub-tasks should carry the parent task ID plus a sub-task identifier (e.g., "task_001.research.file_analysis_3"). This allows you to reconstruct the full execution tree from logs when debugging failures, and enables cost attribution by user request rather than by individual API call.'})]})}const M=Object.freeze(Object.defineProperty({__proto__:null,default:m},Symbol.toStringTag,{value:"Module"}));function g(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Parallel Agent Execution"}),e.jsx("p",{children:"Parallel agent execution is the strategy of running multiple agent tasks simultaneously rather than sequentially. When a task decomposes into independent subtasks — where the output of one subtask does not influence the execution of another — running those subtasks in parallel can dramatically reduce the wall-clock time to produce a final result. A research task that would take 60 seconds with five sequential web searches can complete in 15 seconds when those searches run concurrently."}),e.jsx(t,{term:"Fork-Join Pattern",children:'The fork-join pattern is the core mechanism for parallel agent execution. At a "fork" point, a single execution thread splits into multiple parallel threads, each running an independent agent or subtask. At a "join" point, all parallel threads synchronize: execution does not continue past the join until all forked threads have completed (or been marked as failed or timed out). The joined results are then processed as a unified set.'}),e.jsx("h2",{children:"Independence Requirements"}),e.jsx("p",{children:"Parallel execution only produces correct results if the parallel tasks are genuinely independent. Two tasks are independent if:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Neither task's output is required as input by the other"}),e.jsx("li",{children:"Neither task modifies shared state that the other reads"}),e.jsx("li",{children:"Neither task's cost or latency affects the other's execution"})]}),e.jsx("p",{children:"If tasks have data dependencies, they must be sequenced. If they have state dependencies (both writing to the same database record), concurrent execution requires careful synchronization or serialization. Incorrectly parallelizing dependent tasks produces non-deterministic, hard-to-debug failures."}),e.jsx("h2",{children:"Implementing Fork-Join in Python and TypeScript"}),e.jsx(i,{title:"Fork-Join Parallel Agent Execution",tabs:{python:`import asyncio
import json
import time
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Worker coroutine — runs a single agent task asynchronously
# ---------------------------------------------------------------------------

async def run_agent_task(task_id: str, system_prompt: str, user_prompt: str) -> dict:
    """Run a single agent task asynchronously. Returns a result dict with metadata."""
    start = time.time()
    try:
        # Run synchronous Anthropic SDK call in a thread pool
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.messages.create(
                model="claude-opus-4-6",
                max_tokens=512,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
        )
        text = next((b.text for b in response.content if hasattr(b, "text")), "")
        return {
            "task_id": task_id,
            "status": "success",
            "output": text,
            "duration_ms": int((time.time() - start) * 1000),
            "tokens": response.usage.input_tokens + response.usage.output_tokens,
        }
    except Exception as e:
        return {
            "task_id": task_id,
            "status": "failed",
            "error": str(e),
            "duration_ms": int((time.time() - start) * 1000),
            "tokens": 0,
        }

# ---------------------------------------------------------------------------
# Fork-join orchestrator
# ---------------------------------------------------------------------------

async def fork_join(tasks: list[dict], max_concurrency: int = 5) -> list[dict]:
    """
    Fork multiple agent tasks, run them concurrently (up to max_concurrency),
    and join (wait for all) before returning results.
    """
    semaphore = asyncio.Semaphore(max_concurrency)

    async def run_with_semaphore(task: dict) -> dict:
        async with semaphore:
            return await run_agent_task(
                task_id=task["task_id"],
                system_prompt=task["system_prompt"],
                user_prompt=task["user_prompt"],
            )

    # FORK: start all tasks concurrently
    coroutines = [run_with_semaphore(task) for task in tasks]

    # JOIN: wait for all to complete (use return_exceptions=True to handle individual failures)
    results = await asyncio.gather(*coroutines, return_exceptions=False)
    return list(results)

# ---------------------------------------------------------------------------
# Example: parallel topic research
# ---------------------------------------------------------------------------

RESEARCHER_SYSTEM = """You are a concise research assistant. Answer the given question
in 2-3 sentences with key facts. Be direct and specific."""

async def parallel_research(main_topic: str, subtopics: list[str]) -> str:
    """Research multiple subtopics in parallel, then synthesize into a final answer."""
    # FORK: create tasks for all subtopics
    tasks = [
        {
            "task_id": f"research_{i}",
            "system_prompt": RESEARCHER_SYSTEM,
            "user_prompt": f"What are the key facts about '{subtopic}' as it relates to {main_topic}?"
        }
        for i, subtopic in enumerate(subtopics)
    ]

    print(f"Forking {len(tasks)} research tasks...")
    start = time.time()

    # JOIN: collect all results
    results = await fork_join(tasks, max_concurrency=3)
    elapsed = time.time() - start

    successful = [r for r in results if r["status"] == "success"]
    failed = [r for r in results if r["status"] == "failed"]
    total_tokens = sum(r.get("tokens", 0) for r in results)

    print(f"Join complete: {len(successful)}/{len(tasks)} succeeded in {elapsed:.1f}s, {total_tokens} tokens")

    if failed:
        print(f"Failed tasks: {[r['task_id'] for r in failed]}")

    if not successful:
        return "All research tasks failed."

    # Synthesis step: combine all research into a unified answer
    research_combined = "\\n\\n".join(
        f"[{subtopics[int(r['task_id'].split('_')[1])]}]\\n{r['output']}"
        for r in successful
    )

    synthesis_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system="You are a synthesis specialist. Combine research findings into a coherent, well-structured answer.",
        messages=[{
            "role": "user",
            "content": f"Topic: {main_topic}\\n\\nResearch findings:\\n{research_combined}\\n\\nSynthesize into a comprehensive answer."
        }],
    )
    return next((b.text for b in synthesis_response.content if hasattr(b, "text")), "")


async def main():
    result = await parallel_research(
        main_topic="machine learning model deployment",
        subtopics=[
            "containerization with Docker",
            "model serving frameworks",
            "API gateway patterns",
            "monitoring and observability",
            "A/B testing and canary deployments",
        ]
    )
    print("\\n=== SYNTHESIZED RESULT ===")
    print(result)

asyncio.run(main())`,typescript:`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Worker function — runs a single agent task
// ---------------------------------------------------------------------------

interface TaskSpec {
  taskId: string;
  systemPrompt: string;
  userPrompt: string;
}

interface TaskResult {
  taskId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  durationMs: number;
  tokens: number;
}

async function runAgentTask(spec: TaskSpec): Promise<TaskResult> {
  const start = Date.now();
  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6", max_tokens: 512, system: spec.systemPrompt,
      messages: [{ role: "user", content: spec.userPrompt }],
    });
    const text = response.content.find((b) => b.type === "text");
    return {
      taskId: spec.taskId, status: "success",
      output: text && "text" in text ? text.text : "",
      durationMs: Date.now() - start,
      tokens: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (err) {
    return { taskId: spec.taskId, status: "failed", error: String(err), durationMs: Date.now() - start, tokens: 0 };
  }
}

// ---------------------------------------------------------------------------
// Fork-join with concurrency limiting
// ---------------------------------------------------------------------------

async function forkJoin(tasks: TaskSpec[], maxConcurrency = 5): Promise<TaskResult[]> {
  // Process in batches to limit concurrency
  const results: TaskResult[] = [];
  for (let i = 0; i < tasks.length; i += maxConcurrency) {
    const batch = tasks.slice(i, i + maxConcurrency);
    const batchResults = await Promise.all(batch.map(runAgentTask));
    results.push(...batchResults);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Parallel research example
// ---------------------------------------------------------------------------

const RESEARCHER_SYSTEM = You are a concise research assistant. Answer in 2-3 sentences
with key facts. Be direct and specific.;

async function parallelResearch(mainTopic: string, subtopics: string[]): Promise<string> {
  const tasks: TaskSpec[] = subtopics.map((subtopic, i) => ({
    taskId: research_\${i},
    systemPrompt: RESEARCHER_SYSTEM,
    userPrompt: What are the key facts about '\${subtopic}' as it relates to \${mainTopic}?,
  }));

  console.log(Forking \${tasks.length} research tasks...);
  const start = Date.now();

  // FORK + JOIN
  const results = await forkJoin(tasks, 3);
  const elapsed = (Date.now() - start) / 1000;

  const successful = results.filter((r) => r.status === "success");
  const failed = results.filter((r) => r.status === "failed");
  const totalTokens = results.reduce((sum, r) => sum + r.tokens, 0);
  console.log(Join complete: \${successful.length}/\${tasks.length} succeeded in \${elapsed.toFixed(1)}s, \${totalTokens} tokens);
  if (failed.length > 0) console.log("Failed:", failed.map((r) => r.taskId));

  if (successful.length === 0) return "All research tasks failed.";

  const researchCombined = successful
    .map((r) => [\${subtopics[parseInt(r.taskId.split("_")[1])]}]\\n\${r.output})
    .join("\\n\\n");

  const synthResponse = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 1024,
    system: "You are a synthesis specialist. Combine research findings into a coherent answer.",
    messages: [{ role: "user", content: Topic: \${mainTopic}\\n\\nFindings:\\n\${researchCombined}\\n\\nSynthesize a comprehensive answer. }],
  });
  const text = synthResponse.content.find((b) => b.type === "text");
  return text && "text" in text ? text.text : "";
}

parallelResearch("machine learning model deployment", [
  "containerization with Docker",
  "model serving frameworks",
  "API gateway patterns",
  "monitoring and observability",
  "A/B testing and canary deployments",
]).then((result) => {
  console.log("\\n=== SYNTHESIZED RESULT ===");
  console.log(result);
});`}}),e.jsx("h2",{children:"Synchronization Strategies"}),e.jsx("h3",{children:"Wait-for-All (barrier synchronization)"}),e.jsx("p",{children:"The simplest join strategy: wait for every parallel task to complete before proceeding. This guarantees the synthesizer receives all results but means the total time is bounded by the slowest task. If one task takes much longer than others, all workers sit idle waiting. Use asyncio.gather in Python or Promise.all in TypeScript."}),e.jsx("h3",{children:"Wait-for-First-N"}),e.jsx("p",{children:"If N results are sufficient (you don't need all of them), proceed as soon as N tasks complete. This bounds latency by the Nth-fastest task rather than the slowest. Useful for redundant search tasks where any 3 of 5 results are sufficient. In Python, use asyncio.wait with return_when=FIRST_N_COMPLETED."}),e.jsx("h3",{children:"Progressive Synthesis"}),e.jsx("p",{children:"Begin synthesis as each result arrives rather than waiting for all results. A streaming synthesis agent can incorporate each new result into the evolving answer, producing a partial result that improves continuously as more parallel tasks complete. This is more complex to implement but provides better user experience for long-running parallel tasks."}),e.jsx(s,{name:"Bounded Parallelism with Semaphore",category:"Parallel Execution",description:"Always limit concurrent LLM API calls with a semaphore or concurrency limiter. Unbounded parallelism triggers rate limits, produces cascading failures, and makes cost unpredictable. A concurrency limit of 3–10 concurrent agent calls is appropriate for most use cases. Monitor your API rate limit headers and set the limit conservatively — hitting rate limits is more disruptive than slightly lower parallelism.",when:["Any fan-out with more than 3 parallel tasks","Systems with many concurrent users each running parallel agent tasks","High-volume batch processing with parallel agent execution"],avoid:["asyncio.gather or Promise.all on unbounded lists of tasks","Per-user parallelism without a global concurrency cap","Treating rate limit errors as permanent failures rather than retriable backpressure"]}),e.jsx(n,{title:"Collect partial results when parallel tasks fail",children:"When one or more parallel tasks fail, do not abort the entire fork-join. Collect results from successful tasks, mark failed tasks explicitly, and proceed to synthesis with whatever is available. The synthesizer can acknowledge missing components in the final output. A partial result that clearly indicates what is missing is more useful than a complete failure with no output."}),e.jsx(r,{title:"Parallel writes to shared state cause race conditions",children:"If parallel agents write to the same external resource — a database, a file, a shared document — race conditions can produce corrupted state. Before parallelizing agents that write to shared state, design a consistency strategy: partition the write space so agents never write to overlapping sections, use optimistic locking with retries, or collect writes centrally and apply them serially after all agents complete."}),e.jsx(a,{title:"Parallel overhead is real for small task counts",children:"Parallelism has overhead: spawning async tasks, managing a semaphore, and running a join step all take time. For 2–3 tasks that each complete in under a second, the overhead may exceed the latency benefit of parallelism. Measure before assuming parallel is always faster than sequential for small task counts."})]})}const P=Object.freeze(Object.defineProperty({__proto__:null,default:g},Symbol.toStringTag,{value:"Module"}));function f(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Mixture of Agents (MoA)"}),e.jsx("p",{children:"Mixture of Agents is an architecture that combines responses from multiple independent language model instances — potentially using different models, system prompts, or temperatures — into a single, higher-quality output. Inspired by ensemble methods in classical machine learning, MoA exploits the diversity of different agents' outputs to produce answers that are more accurate, comprehensive, and robust than any individual agent could produce alone. The core insight is that different agents make different errors, and combining their outputs reduces the impact of any single agent's mistakes."}),e.jsx(t,{term:"Mixture of Agents (MoA)",children:"Mixture of Agents is an architecture in which multiple independent agent instances each attempt the same task, and an aggregator model synthesizes their outputs into a final response. The constituent agents may differ in model, temperature, system prompt, or random seed. The aggregator is typically a capable model that reads all constituent responses and produces a synthesized answer, resolving contradictions, incorporating the best elements of each response, and filtering out errors."}),e.jsx("h2",{children:"Why MoA Works: Diversity and Error Cancellation"}),e.jsx("p",{children:"The theoretical foundation of ensemble methods is that diverse, independent estimators have uncorrelated errors. When errors are uncorrelated, averaging or selecting among estimates reduces error variance. For language models, this holds imperfectly but meaningfully: different models with different training data and architectures make different factual errors. Different system prompts elicit different reasoning paths. Different temperatures produce different selections at ambiguous points in generation. The errors of one agent are often not the errors of another."}),e.jsx("p",{children:"In practice, MoA with three agents typically outperforms any single constituent agent, and MoA with heterogeneous models (e.g., Claude + GPT-4 + Gemini) outperforms MoA with three instances of the same model. The benefit is largest for tasks with factual uncertainty, where individual agents may hallucinate different false facts that a synthesizer can recognize as inconsistent."}),e.jsx("h2",{children:"MoA Architecture Variants"}),e.jsx("h3",{children:"Parallel MoA (One Round)"}),e.jsx("p",{children:"All constituent agents run in parallel on the same task. Their outputs are collected and passed to an aggregator in a single round. This is the simplest and most common form of MoA. It is efficient (constituent agents run concurrently) and straightforward to implement. The latency is bounded by the slowest constituent agent plus the aggregator."}),e.jsx("h3",{children:"Layered MoA (Multiple Rounds)"}),e.jsx("p",{children:"In layered MoA, there are multiple rounds of generation and synthesis. Round 1 produces N responses. An intermediate aggregator synthesizes them into an improved set of proposals. Round 2 refines further. This iterative approach can improve quality for very complex tasks but multiplies cost and latency with each round."}),e.jsx("h3",{children:"Selective MoA"}),e.jsx("p",{children:"Instead of synthesizing all constituent responses, selective MoA selects the single best response based on quality criteria. An evaluator model scores each response and the highest-scoring response is returned. This is simpler than full synthesis and avoids the risk of the synthesizer introducing errors when combining responses."}),e.jsx(i,{title:"Parallel Mixture of Agents with Synthesis",tabs:{python:`import asyncio
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Constituent agents: same task, different approaches
# ---------------------------------------------------------------------------

CONSTITUENT_CONFIGS = [
    {
        "id": "agent_a",
        "system": "You are a precise, analytical assistant. Be comprehensive and structured. Use bullet points and numbered lists.",
        "temperature": 0.2,  # Note: Anthropic API temperature parameter
    },
    {
        "id": "agent_b",
        "system": "You are a concise expert assistant. Focus on the most important points. Be direct and avoid padding.",
        "temperature": 0.7,
    },
    {
        "id": "agent_c",
        "system": "You are a thoughtful assistant who considers multiple perspectives. Highlight trade-offs and nuances.",
        "temperature": 0.5,
    },
]

SYNTHESIZER_SYSTEM = """You are a synthesis specialist. You will receive multiple responses
to the same question from different assistants. Your job is to:
1. Identify the best, most accurate elements of each response
2. Note where responses agree (this increases confidence in those points)
3. Resolve contradictions by identifying the most reliable claim
4. Produce a single comprehensive, accurate answer that is better than any individual response

Do not mention that you are synthesizing multiple responses. Just provide the best answer."""

async def run_constituent(config: dict, question: str) -> dict:
    """Run one constituent agent asynchronously."""
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: client.messages.create(
            model="claude-opus-4-6",
            max_tokens=512,
            system=config["system"],
            messages=[{"role": "user", "content": question}],
        )
    )
    text = next((b.text for b in response.content if hasattr(b, "text")), "")
    return {"id": config["id"], "response": text, "tokens": response.usage.input_tokens + response.usage.output_tokens}

async def mixture_of_agents(question: str) -> str:
    """Run MoA: parallel constituents followed by synthesis."""

    # Phase 1: Run all constituent agents in parallel (FORK)
    print(f"Running {len(CONSTITUENT_CONFIGS)} constituent agents in parallel...")
    constituent_results = await asyncio.gather(
        *[run_constituent(config, question) for config in CONSTITUENT_CONFIGS]
    )
    total_constituent_tokens = sum(r["tokens"] for r in constituent_results)
    print(f"Constituents complete: {total_constituent_tokens} total tokens")

    # Phase 2: Synthesize (JOIN + aggregate)
    synthesis_prompt = f"Question: {question}\\n\\n"
    for i, result in enumerate(constituent_results, 1):
        synthesis_prompt += f"Response {i}:\\n{result['response']}\\n\\n"
    synthesis_prompt += "Synthesize the best answer from the above responses:"

    synthesis_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=SYNTHESIZER_SYSTEM,
        messages=[{"role": "user", "content": synthesis_prompt}],
    )
    final = next((b.text for b in synthesis_response.content if hasattr(b, "text")), "")
    synthesis_tokens = synthesis_response.usage.input_tokens + synthesis_response.usage.output_tokens
    total_tokens = total_constituent_tokens + synthesis_tokens
    print(f"Synthesis complete: {synthesis_tokens} tokens (total: {total_tokens})")
    return final


async def main():
    question = "What are the most important considerations when choosing between SQL and NoSQL databases for a new application?"
    result = await mixture_of_agents(question)
    print("\\n=== SYNTHESIZED ANSWER ===")
    print(result)

asyncio.run(main())`,typescript:`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Constituent agent configurations
// ---------------------------------------------------------------------------

const CONSTITUENT_CONFIGS = [
  { id: "agent_a", system: "You are a precise, analytical assistant. Be comprehensive and structured." },
  { id: "agent_b", system: "You are a concise expert. Focus on the most important points. Be direct." },
  { id: "agent_c", system: "You are a thoughtful assistant who considers multiple perspectives and trade-offs." },
];

const SYNTHESIZER_SYSTEM = You are a synthesis specialist. You receive multiple responses to the same question.
Identify the best elements of each response, note agreements (which increase confidence),
resolve contradictions, and produce a single comprehensive answer better than any individual response.
Do not mention that you are synthesizing. Just provide the best answer.;

interface ConstituentResult {
  id: string;
  response: string;
  tokens: number;
}

async function runConstituent(config: { id: string; system: string }, question: string): Promise<ConstituentResult> {
  const response = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 512, system: config.system,
    messages: [{ role: "user", content: question }],
  });
  const text = response.content.find((b) => b.type === "text");
  return {
    id: config.id,
    response: text && "text" in text ? text.text : "",
    tokens: response.usage.input_tokens + response.usage.output_tokens,
  };
}

async function mixtureOfAgents(question: string): Promise<string> {
  // Phase 1: All constituents in parallel
  console.log(Running \${CONSTITUENT_CONFIGS.length} constituent agents in parallel...);
  const constituentResults = await Promise.all(
    CONSTITUENT_CONFIGS.map((config) => runConstituent(config, question))
  );
  const totalConstituentTokens = constituentResults.reduce((sum, r) => sum + r.tokens, 0);
  console.log(Constituents complete: \${totalConstituentTokens} total tokens);

  // Phase 2: Synthesize
  let synthesisPrompt = Question: \${question}\\n\\n;
  constituentResults.forEach((result, i) => {
    synthesisPrompt += Response \${i + 1}:\\n\${result.response}\\n\\n;
  });
  synthesisPrompt += "Synthesize the best answer from the above responses:";

  const synthResponse = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 1024, system: SYNTHESIZER_SYSTEM,
    messages: [{ role: "user", content: synthesisPrompt }],
  });
  const synthText = synthResponse.content.find((b) => b.type === "text");
  const final = synthText && "text" in synthText ? synthText.text : "";
  const synthTokens = synthResponse.usage.input_tokens + synthResponse.usage.output_tokens;
  console.log(Synthesis complete: \${synthTokens} tokens (total: \${totalConstituentTokens + synthTokens}));
  return final;
}

const question = "What are the most important considerations when choosing between SQL and NoSQL databases?";
mixtureOfAgents(question).then((result) => {
  console.log("\\n=== SYNTHESIZED ANSWER ===");
  console.log(result);
});`}}),e.jsx("h2",{children:"Agent Voting for Classification Tasks"}),e.jsx("p",{children:"For classification, labeling, and routing tasks where the output is one of a finite set of choices, voting is often more appropriate than synthesis. Each constituent agent produces a label or category, and the label with the most votes is selected. Voting is simpler than synthesis, more interpretable, and avoids the synthesizer potentially introducing errors not present in any individual response."}),e.jsx("p",{children:"Weighted voting assigns different confidence weights to different agents. If agent A historically achieves 95% accuracy on this task type and agent B achieves 80%, agent A's vote should count more. Accumulate accuracy statistics per agent per task category and update weights dynamically."}),e.jsx(s,{name:"MoA for Quality-Critical Outputs",category:"Ensemble Design",description:"Apply Mixture of Agents to tasks where output quality matters more than cost — factual research, medical information, legal analysis, high-stakes code generation. The N-times cost of MoA is justified when a wrong answer has significant consequences and when individual model error rates are measurably high. For routine tasks with acceptable single-model accuracy, MoA is not cost-effective.",when:["High-stakes factual claims where individual models have non-trivial hallucination rates","Tasks where different models have complementary strengths","Classification tasks where majority voting meaningfully reduces error rate","Cases where the cost of errors substantially exceeds the cost of MoA"],avoid:["Routine tasks where a single well-prompted model achieves adequate accuracy","Tasks requiring fast responses where MoA latency is unacceptable","Tasks where all constituent agents have highly correlated errors (same training data, same architecture)"]}),e.jsx(n,{title:"Measure actual error reduction before committing to MoA",children:"MoA's benefit depends on constituent diversity and independence of errors. Before deploying MoA in production, measure the error rate of each constituent agent individually and compare it to the error rate of the synthesized output on a representative evaluation set. If MoA with 3 agents reduces errors by 30%, it may be worth the 3x cost increase. If it reduces errors by 5%, it probably is not."}),e.jsx(r,{title:"MoA multiplies cost and latency",children:"N constituent agents plus a synthesizer makes MoA approximately (N+1) times as expensive per task as a single agent call. At scale, this is significant. Measure the baseline cost, set a concrete quality improvement threshold that justifies the cost, and revisit regularly as model capabilities improve — the baseline single-model quality often catches up to MoA over time as models are updated."}),e.jsx(a,{title:"The synthesizer quality matters as much as constituent quality",children:"A weak synthesizer that introduces errors or fails to identify the best elements of constituent responses can produce an output worse than the best individual constituent. Invest as much effort in the synthesizer's system prompt as in the constituents'. Test the synthesizer independently with known-good and known-bad constituent responses to ensure it correctly identifies and resolves quality differences."})]})}const I=Object.freeze(Object.defineProperty({__proto__:null,default:f},Symbol.toStringTag,{value:"Module"}));function y(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"The Supervisor Pattern"}),e.jsx("p",{children:"The supervisor pattern is a multi-agent architecture where a central supervisor agent controls a pool of specialized worker agents by dynamically routing tasks based on the current state of the conversation and the available worker capabilities. Unlike a fixed pipeline where the sequence of agents is predetermined, the supervisor decides at each step which agent to invoke next based on what has happened so far. This makes the supervisor pattern particularly powerful for open-ended tasks where the sequence of operations cannot be determined in advance."}),e.jsx(t,{term:"Supervisor Pattern",children:"In the supervisor pattern, a supervisor agent holds the overall task context and a routing table of available worker agents. At each step, the supervisor examines the current task state and selects which worker to call next, what to pass to it, and how to incorporate its result. Workers are called one at a time (or in small parallel groups) rather than in a fixed pipeline. The supervisor continues routing until it determines the task is complete."}),e.jsx("h2",{children:"Supervisor vs. Orchestrator"}),e.jsx("p",{children:"The supervisor and orchestrator patterns are related but distinct. An orchestrator typically generates a complete plan upfront and executes it, delegating known subtasks to known workers in a predetermined structure. A supervisor operates reactively: it examines the current state, decides the next single step, executes it, and re-evaluates. This makes the supervisor more adaptive but also more expensive (it makes an LLM call at every routing decision) and harder to parallelize."}),e.jsx("p",{children:"Use the orchestrator pattern when you can decompose the full task structure upfront. Use the supervisor pattern when the required sequence of operations depends heavily on intermediate results and cannot be predetermined."}),e.jsx("h2",{children:"Implementing a Supervisor with Tool-Based Routing"}),e.jsx("p",{children:`A clean implementation gives the supervisor a set of "worker tools" — tools whose names correspond to worker agent identifiers. When the supervisor calls the "web_researcher" tool, it invokes the web researcher worker agent. This leverages the model's built-in tool-use mechanism for routing decisions, producing explicit reasoning about which worker to call and clear logging of routing decisions.`}),e.jsx(i,{title:"Supervisor Agent with Dynamic Worker Routing",tabs:{python:`import json
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Worker agents: specialized for their tasks
# ---------------------------------------------------------------------------

def web_researcher_worker(query: str) -> str:
    """Simulates a web research worker."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system="You are a web research specialist. Provide factual, well-organized information about the given topic.",
        messages=[{"role": "user", "content": f"Research: {query}"}],
    )
    return next((b.text for b in response.content if hasattr(b, "text")), "")

def data_analyst_worker(data: str, analysis_request: str) -> str:
    """Simulates a data analysis worker."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system="You are a data analyst. Analyze the provided data and extract insights, patterns, and key statistics.",
        messages=[{"role": "user", "content": f"Data: {data}\\n\\nAnalysis request: {analysis_request}"}],
    )
    return next((b.text for b in response.content if hasattr(b, "text")), "")

def writer_worker(content: str, writing_request: str) -> str:
    """Simulates a writing specialist worker."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system="You are a professional writer. Produce clear, engaging, well-structured written content.",
        messages=[{"role": "user", "content": f"Source material: {content}\\n\\nWriting task: {writing_request}"}],
    )
    return next((b.text for b in response.content if hasattr(b, "text")), "")

# ---------------------------------------------------------------------------
# Supervisor: routes to workers dynamically
# ---------------------------------------------------------------------------

SUPERVISOR_SYSTEM = """You are a supervisor that coordinates specialized worker agents to complete tasks.
You have access to three workers:

1. web_researcher — for gathering factual information and research
2. data_analyst — for analyzing data, identifying patterns, and extracting insights
3. writer — for producing written content, reports, and summaries

At each step, decide which worker to call next based on what the task needs.
Call workers sequentially, incorporating each result before deciding the next step.
When the task is fully complete, stop using tools and provide the final answer."""

SUPERVISOR_TOOLS = [
    {
        "name": "web_researcher",
        "description": "Research a topic on the web. Returns factual information and key details.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "What to research — be specific"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "data_analyst",
        "description": "Analyze provided data for insights, patterns, and statistics.",
        "input_schema": {
            "type": "object",
            "properties": {
                "data": {"type": "string", "description": "The data to analyze"},
                "analysis_request": {"type": "string", "description": "What analysis to perform"}
            },
            "required": ["data", "analysis_request"]
        }
    },
    {
        "name": "writer",
        "description": "Produce professional written content from source material.",
        "input_schema": {
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "Source material to write from"},
                "writing_request": {"type": "string", "description": "What to write and how"}
            },
            "required": ["content", "writing_request"]
        }
    }
]

def dispatch_worker(name: str, inputs: dict) -> str:
    """Route tool calls to the appropriate worker agent."""
    if name == "web_researcher":
        return web_researcher_worker(inputs["query"])
    if name == "data_analyst":
        return data_analyst_worker(inputs["data"], inputs["analysis_request"])
    if name == "writer":
        return writer_worker(inputs["content"], inputs["writing_request"])
    return json.dumps({"error": f"Unknown worker: {name}"})

def run_supervisor(task: str, max_steps: int = 10) -> str:
    """Run the supervisor agent — it dynamically routes between workers."""
    messages = [{"role": "user", "content": task}]
    step = 0

    while step < max_steps:
        step += 1
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=SUPERVISOR_SYSTEM,
            tools=SUPERVISOR_TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            return next((b.text for b in response.content if hasattr(b, "text")), "Task complete.")

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                print(f"  Supervisor routing to: {block.name}({list(block.input.keys())})")
                result = dispatch_worker(block.name, block.input)
                print(f"  Worker result: {len(result)} chars")
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })
        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    return "Max routing steps reached."

result = run_supervisor(
    "Research the current state of large language model context windows, "
    "analyze the progression from early models to current ones, and write "
    "a professional summary suitable for a technical audience."
)
print("\\n=== FINAL OUTPUT ===")
print(result)`,typescript:`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Worker agents
// ---------------------------------------------------------------------------

async function webResearcherWorker(query: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 512,
    system: "You are a web research specialist. Provide factual, well-organized information.",
    messages: [{ role: "user", content: Research: \${query} }],
  });
  const text = response.content.find((b) => b.type === "text");
  return text && "text" in text ? text.text : "";
}

async function dataAnalystWorker(data: string, analysisRequest: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 512,
    system: "You are a data analyst. Extract insights, patterns, and key statistics from data.",
    messages: [{ role: "user", content: Data: \${data}\\n\\nAnalysis: \${analysisRequest} }],
  });
  const text = response.content.find((b) => b.type === "text");
  return text && "text" in text ? text.text : "";
}

async function writerWorker(content: string, writingRequest: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 1024,
    system: "You are a professional writer. Produce clear, engaging, well-structured content.",
    messages: [{ role: "user", content: Source: \${content}\\n\\nTask: \${writingRequest} }],
  });
  const text = response.content.find((b) => b.type === "text");
  return text && "text" in text ? text.text : "";
}

// ---------------------------------------------------------------------------
// Supervisor
// ---------------------------------------------------------------------------

const SUPERVISOR_SYSTEM = You are a supervisor coordinating specialized workers to complete tasks.
Workers available: web_researcher (research), data_analyst (analysis), writer (writing).
Call workers as needed based on task requirements. When complete, stop and provide the final answer.;

const supervisorTools: Anthropic.Tool[] = [
  {
    name: "web_researcher",
    description: "Research a topic. Returns factual information.",
    input_schema: { type: "object" as const, properties: { query: { type: "string", description: "What to research" } }, required: ["query"] },
  },
  {
    name: "data_analyst",
    description: "Analyze data for insights and patterns.",
    input_schema: { type: "object" as const, properties: { data: { type: "string", description: "Data to analyze" }, analysis_request: { type: "string", description: "Analysis to perform" } }, required: ["data", "analysis_request"] },
  },
  {
    name: "writer",
    description: "Produce professional written content from source material.",
    input_schema: { type: "object" as const, properties: { content: { type: "string", description: "Source material" }, writing_request: { type: "string", description: "What to write" } }, required: ["content", "writing_request"] },
  },
];

async function dispatchWorker(name: string, inputs: Record<string, string>): Promise<string> {
  if (name === "web_researcher") return webResearcherWorker(inputs.query);
  if (name === "data_analyst") return dataAnalystWorker(inputs.data, inputs.analysis_request);
  if (name === "writer") return writerWorker(inputs.content, inputs.writing_request);
  return JSON.stringify({ error: Unknown worker: \${name} });
}

async function runSupervisor(task: string, maxSteps = 10): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];
  for (let step = 0; step < maxSteps; step++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6", max_tokens: 1024, system: SUPERVISOR_SYSTEM,
      tools: supervisorTools, messages,
    });
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason === "end_turn") {
      const text = response.content.find((b) => b.type === "text");
      return text && "text" in text ? text.text : "Task complete.";
    }
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        console.log(  Routing to: \${block.name});
        const result = await dispatchWorker(block.name, block.input as Record<string, string>);
        console.log(  Worker result: \${result.length} chars);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
  }
  return "Max steps reached.";
}

runSupervisor(
  "Research the current state of large language model context windows, " +
  "analyze the progression from early models to current ones, and write " +
  "a professional summary suitable for a technical audience."
).then((result) => {
  console.log("\\n=== FINAL OUTPUT ===");
  console.log(result);
});`}}),e.jsx("h2",{children:"Task Routing Strategies"}),e.jsx("p",{children:"The supervisor's routing decisions can be implemented in several ways:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"LLM-based routing (shown above):"})," The supervisor model itself decides which worker to call at each step. Most flexible, but every routing decision consumes tokens."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Rule-based routing:"})," Explicit if-else logic maps task state to worker selection. Fast, predictable, but requires anticipating all routing scenarios at design time."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Intent classification:"})," A lightweight classifier examines the task and emits a structured routing instruction that a deterministic dispatcher executes. Balances flexibility and cost."]})]}),e.jsx(s,{name:"Supervisor with Explicit Routing State",category:"Supervisor Design",description:"Maintain a structured routing state that the supervisor updates at each step — tracking which workers have been called, what they produced, and what still needs to be done. Pass this state explicitly to the supervisor on each call rather than relying on it to reconstruct state from the full conversation history. Explicit state makes routing decisions more reliable and makes the supervisor's progress auditable.",when:["Long-running tasks where the supervisor needs to track multi-step progress","Tasks where the same worker may be called multiple times with different inputs","Systems where you need to interrupt and resume supervisor execution"],avoid:["Supervisors that must read the entire conversation history to determine routing","Implicit state that is encoded only in natural language without structured fields","Supervisors that cannot explain their routing decisions"]}),e.jsx(n,{title:"Limit the supervisor's tool set to available workers",children:"Only include tools in the supervisor's tool list that correspond to actually available workers. An unused tool in the tool list consumes tokens on every supervisor API call and may confuse the supervisor about what capabilities are available. If workers are conditionally available (e.g., only when certain data has been gathered), manage this by dynamically adjusting the tool list rather than including all tools all the time."}),e.jsx(r,{title:"Supervisors can get stuck in routing loops",children:`A supervisor that repeatedly calls the same worker with slightly different inputs and receives unsatisfying results may loop indefinitely. Detect this by tracking which workers have been called with similar inputs and returning a signal to the supervisor when it appears to be looping. Include explicit instructions in the supervisor's system prompt: "If a worker has been called three times without satisfactory results, synthesize what you have and explain what could not be completed."`}),e.jsx(a,{title:"The supervisor pattern maps naturally to LangGraph",children:"The supervisor pattern is the canonical use case for LangGraph, which provides a state machine implementation optimized for this architecture. LangGraph lets you define agents as graph nodes, routing logic as edges, and shared state as the graph state that is passed between nodes. If you are building supervisor-pattern systems in Python, LangGraph reduces the boilerplate and adds built-in features for checkpointing and human-in-the-loop interruptions."})]})}const O=Object.freeze(Object.defineProperty({__proto__:null,default:y},Symbol.toStringTag,{value:"Module"}));function w(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Agent Debate and Reflection Patterns"}),e.jsx("p",{children:"Agent debate and reflection patterns exploit a fundamental property of language models: they are better at critiquing existing claims than at generating perfect answers from scratch. By structuring reasoning as an adversarial or reflective process — agents challenging each other's claims, or agents reviewing and improving their own outputs — these patterns can produce significantly higher-quality results on tasks where the first attempt is often imperfect."}),e.jsx("h2",{children:"Multi-Agent Debate"}),e.jsx(t,{term:"Multi-Agent Debate",children:"Multi-agent debate involves two or more agents generating competing or complementary responses to a question, then each agent reading the other's response and attempting to refine or challenge it. Through multiple rounds of exchange, agents update their positions, challenge unsupported claims, and build on valid points. A judge agent (or the debate agents themselves) produces a final synthesized conclusion. Research has shown this process improves factual accuracy and reduces confident hallucination."}),e.jsx("h3",{children:"How Debate Improves Quality"}),e.jsx("p",{children:"When a debating agent reads its opponent's response, it is exposed to alternative framings and potentially correct information that it did not produce itself. If agent A makes a factual error, agent B may correctly identify and challenge it. Agent A, forced to defend or revise the claim, often recognizes the error when it is pointed out. This adversarial pressure reduces the confident assertion of incorrect information."}),e.jsx("p",{children:"Debate is particularly effective when debating agents are prompted to be skeptical of claims they cannot verify — rather than simply agreeing with a well-argued position. An agent that capitulates to confident but incorrect arguments undermines the debate's value."}),e.jsx("h2",{children:"Self-Reflection and Self-Critique"}),e.jsx(t,{term:"Reflexion Pattern",children:"Self-reflection involves an agent reviewing its own output, identifying weaknesses or errors, and revising accordingly. The agent that produced the output acts as its own critic. This is less powerful than external critique (because the agent is anchored to its own reasoning), but it is much cheaper and can catch obvious errors, improve structure, and fill in gaps the agent itself recognizes."}),e.jsx("p",{children:'Effective self-reflection requires separating the generation and critique steps. Simply asking a model to "review and improve" its output often produces superficial edits. A better approach asks the model to explicitly evaluate specific dimensions — "Is every factual claim accurate?", "Is there important information missing?" — before revising. The more specific the critique criteria, the more substantive the revisions.'}),e.jsx(i,{title:"Multi-Agent Debate: Two Agents Challenge Each Other",tabs:{python:`from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Debating agents: each is instructed to be rigorous and challenge errors
# ---------------------------------------------------------------------------

AGENT_A_SYSTEM = """You are a rigorous fact-checker participating in an intellectual debate.
When given a question or your opponent's argument:
1. Provide your best answer, clearly reasoning through the evidence
2. If responding to an opponent's argument, explicitly identify any claims you disagree with
   and explain why, with specific counter-evidence or reasoning
3. Be confident but accurate — do not assert claims you cannot support
4. Update your position when the opponent makes a valid point"""

AGENT_B_SYSTEM = """You are a skeptical critical thinker participating in an intellectual debate.
Your approach:
1. Challenge assumptions and ask for evidence behind claims
2. Identify logical gaps and alternative explanations
3. Acknowledge strong arguments but look for weaknesses
4. Build on valid points rather than disagreeing for the sake of it
5. Be rigorous: a good argument you had not considered should change your position"""

JUDGE_SYSTEM = """You are a neutral judge of a structured debate. Review the full exchange
between two agents and produce:
1. The consensus position where both agents agree
2. The remaining points of disagreement
3. A final synthesized answer that incorporates the best-supported claims from both agents
4. Your assessment of which agent's overall position is better supported

Be balanced and evidence-focused."""

def run_debate(question: str, rounds: int = 2) -> dict:
    """Run a multi-round structured debate between two agents."""
    debate_history = []
    agent_a_messages = [{"role": "user", "content": f"Question for debate: {question}\\n\\nProvide your initial answer."}]
    agent_b_messages = [{"role": "user", "content": f"Question for debate: {question}\\n\\nProvide your initial answer."}]

    # Round 0: Both agents give initial answers independently
    print("Round 0: Initial answers...")
    response_a = client.messages.create(
        model="claude-opus-4-6", max_tokens=512, system=AGENT_A_SYSTEM, messages=agent_a_messages
    )
    answer_a = next((b.text for b in response_a.content if hasattr(b, "text")), "")
    debate_history.append({"round": 0, "agent": "A", "content": answer_a})

    response_b = client.messages.create(
        model="claude-opus-4-6", max_tokens=512, system=AGENT_B_SYSTEM, messages=agent_b_messages
    )
    answer_b = next((b.text for b in response_b.content if hasattr(b, "text")), "")
    debate_history.append({"round": 0, "agent": "B", "content": answer_b})

    # Subsequent rounds: each agent responds to the other's most recent argument
    for round_num in range(1, rounds + 1):
        print(f"Round {round_num}: Rebuttals...")
        # Agent A responds to Agent B's last argument
        agent_a_messages.append({"role": "assistant", "content": debate_history[-2]["content"]})
        agent_a_messages.append({"role": "user", "content": f"Agent B argued: {debate_history[-1]['content']}\\n\\nProvide your rebuttal or revision."})

        response_a = client.messages.create(
            model="claude-opus-4-6", max_tokens=512, system=AGENT_A_SYSTEM, messages=agent_a_messages
        )
        new_answer_a = next((b.text for b in response_a.content if hasattr(b, "text")), "")
        debate_history.append({"round": round_num, "agent": "A", "content": new_answer_a})

        # Agent B responds to Agent A's rebuttal
        agent_b_messages.append({"role": "assistant", "content": debate_history[-3]["content"]})
        agent_b_messages.append({"role": "user", "content": f"Agent A argued: {new_answer_a}\\n\\nProvide your rebuttal or revision."})

        response_b = client.messages.create(
            model="claude-opus-4-6", max_tokens=512, system=AGENT_B_SYSTEM, messages=agent_b_messages
        )
        new_answer_b = next((b.text for b in response_b.content if hasattr(b, "text")), "")
        debate_history.append({"round": round_num, "agent": "B", "content": new_answer_b})

    # Judge synthesizes the full debate
    print("Judge synthesizing...")
    full_debate = f"Question: {question}\\n\\n"
    for entry in debate_history:
        full_debate += f"Round {entry['round']} - Agent {entry['agent']}:\\n{entry['content']}\\n\\n"

    judge_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=JUDGE_SYSTEM,
        messages=[{"role": "user", "content": full_debate}],
    )
    judgment = next((b.text for b in judge_response.content if hasattr(b, "text")), "")

    return {
        "question": question,
        "rounds": rounds,
        "debate_history": debate_history,
        "judgment": judgment,
    }


result = run_debate(
    "Is it better to use a monorepo or separate repositories for a microservices architecture?",
    rounds=2,
)
print("\\n=== JUDGE'S SYNTHESIS ===")
print(result["judgment"])`,typescript:`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const AGENT_A_SYSTEM = You are a rigorous fact-checker in an intellectual debate.
Provide your best answer, challenge opponent's unsupported claims with specific counter-evidence,
and update your position when the opponent makes a valid point.;

const AGENT_B_SYSTEM = You are a skeptical critical thinker in a debate.
Challenge assumptions, identify logical gaps, and build on valid points.
A strong argument you hadn't considered should change your position.;

const JUDGE_SYSTEM = You are a neutral debate judge. Review the full exchange and produce:
1. The consensus position
2. Remaining disagreements
3. A synthesized final answer incorporating the best-supported claims from both agents;

interface DebateEntry { round: number; agent: "A" | "B"; content: string; }

async function runDebate(question: string, rounds = 2): Promise<{ judgment: string; history: DebateEntry[] }> {
  const history: DebateEntry[] = [];
  const messagesA: Anthropic.MessageParam[] = [{ role: "user", content: Question: \${question}\\n\\nProvide your initial answer. }];
  const messagesB: Anthropic.MessageParam[] = [{ role: "user", content: Question: \${question}\\n\\nProvide your initial answer. }];

  // Round 0: independent initial answers
  console.log("Round 0: Initial answers...");
  const [resA0, resB0] = await Promise.all([
    client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, system: AGENT_A_SYSTEM, messages: messagesA }),
    client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, system: AGENT_B_SYSTEM, messages: messagesB }),
  ]);
  const getText = (r: Anthropic.Message) => { const t = r.content.find((b) => b.type === "text"); return t && "text" in t ? t.text : ""; };
  history.push({ round: 0, agent: "A", content: getText(resA0) });
  history.push({ round: 0, agent: "B", content: getText(resB0) });

  // Debate rounds
  for (let round = 1; round <= rounds; round++) {
    console.log(Round \${round}: Rebuttals...);
    const lastA = history.filter((h) => h.agent === "A").at(-1)!.content;
    const lastB = history.filter((h) => h.agent === "B").at(-1)!.content;

    messagesA.push({ role: "assistant", content: lastA });
    messagesA.push({ role: "user", content: Agent B argued: \${lastB}\\n\\nProvide your rebuttal or revision. });
    messagesB.push({ role: "assistant", content: lastB });
    messagesB.push({ role: "user", content: Agent A argued: \${lastA}\\n\\nProvide your rebuttal or revision. });

    const [rebA, rebB] = await Promise.all([
      client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, system: AGENT_A_SYSTEM, messages: messagesA }),
      client.messages.create({ model: "claude-opus-4-6", max_tokens: 512, system: AGENT_B_SYSTEM, messages: messagesB }),
    ]);
    history.push({ round, agent: "A", content: getText(rebA) });
    history.push({ round, agent: "B", content: getText(rebB) });
  }

  // Judge
  console.log("Judge synthesizing...");
  let fullDebate = Question: \${question}\\n\\n;
  history.forEach((e) => { fullDebate += Round \${e.round} - Agent \${e.agent}:\\n\${e.content}\\n\\n; });
  const judgeRes = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 1024, system: JUDGE_SYSTEM,
    messages: [{ role: "user", content: fullDebate }],
  });
  return { judgment: getText(judgeRes), history };
}

runDebate("Is it better to use a monorepo or separate repositories for a microservices architecture?", 2)
  .then(({ judgment }) => {
    console.log("\\n=== JUDGE'S SYNTHESIS ===");
    console.log(judgment);
  });`}}),e.jsx("h2",{children:"Self-Critique Loops"}),e.jsx("p",{children:"Self-critique loops implement reflection within a single agent: the agent generates a response, then switches roles to critique that response against specific criteria, then revises based on the critique. This is less powerful than multi-agent debate but significantly cheaper and still produces measurable quality improvements on structured tasks."}),e.jsx("p",{children:'The key to effective self-critique is specificity. A generic "review your answer for quality" produces weak improvements. Specific criteria — "Are all factual claims verifiable?", "Is the explanation accessible to a non-expert?", "Are there edge cases not addressed?" — produce targeted, actionable critiques that lead to substantive revisions.'}),e.jsx(s,{name:"Debate for Controversial, Debate for Verification",category:"Quality Patterns",description:"Use multi-agent debate for questions with genuine uncertainty or legitimate competing perspectives — technology choices, strategic decisions, interpretive questions. Use self-reflection loops for tasks with clear quality criteria — writing, code review, factual summaries. Do not use debate for tasks that have a single correct answer that can be verified deterministically — a calculator is better than a debate for arithmetic.",when:["Decisions with legitimate trade-offs where multiple perspectives improve the outcome","Factual questions where single-model hallucination is a documented problem","Critical documents where catching errors before delivery justifies extra cost"],avoid:["Tasks with clear correct answers that can be verified by tools","Latency-sensitive applications where debate rounds add unacceptable delay","Tasks where all constituent agents have the same training and make the same errors"]}),e.jsx(n,{title:"Prompt agents to be skeptical, not agreeable",children:"The most common failure mode of multi-agent debate is both agents converging to the same answer too quickly — often because one agent made a confident argument and the other simply agreed. Counter this by explicitly instructing debate agents to be skeptical of confident claims they cannot independently verify, and to prefer maintaining uncertainty over agreeing with an unverified assertion."}),e.jsx(r,{title:"Debate can amplify confident errors",children:"If both agents share a misconception from their training data, debate will not surface it — both will confidently argue for the wrong answer. Debate reduces errors from random hallucination but cannot catch systematic errors shared across models trained on similar data. For high-stakes factual claims, supplement debate with tool-based fact verification against authoritative sources."}),e.jsx(a,{title:"Two rounds of debate is usually sufficient",children:"Empirically, most of the quality improvement from multi-agent debate occurs in the first rebuttal round. The second round provides incremental improvement; rounds beyond that typically produce diminishing returns and models may begin to simply agree or repeat themselves. Start with 2 rounds, measure quality improvement, and only extend to more rounds if the data supports it."})]})}const C=Object.freeze(Object.defineProperty({__proto__:null,default:w},Symbol.toStringTag,{value:"Module"}));function k(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Agent State Management"}),e.jsx("p",{children:"State management is one of the most underappreciated aspects of agent system design. An agent's behavior at any point in its execution depends entirely on its state: the conversation history, accumulated tool results, intermediate conclusions, and external resources it has accessed. Getting state management right — defining what state exists, how it is structured, how it persists, and how it can be recovered — determines whether an agent system is reliable enough for production."}),e.jsx(t,{term:"Agent State",children:`Agent state is the complete set of information that determines how an agent will behave at any given moment. In LLM-based agents, state consists primarily of the conversation history (in-context state), plus any external state the agent has written to or read from during its execution. Complete agent state must be sufficient to reproduce the agent's execution from any point — to "replay" or "resume" it after an interruption.`}),e.jsx("h2",{children:"Anatomy of Agent State"}),e.jsx("h3",{children:"In-Context State: The Conversation History"}),e.jsx("p",{children:"The most fundamental form of agent state is the messages array — the accumulated conversation history that is passed to the LLM on every API call. This includes: the original user request, the system prompt, all assistant responses (including reasoning text), all tool call inputs, and all tool call results. The messages array is the agent's working memory: everything it has done and observed during the current task."}),e.jsx("p",{children:"In-context state is ephemeral: when the process ends, the messages array disappears. Persisting agent state requires serializing the messages array to durable storage at regular checkpoints."}),e.jsx("h3",{children:"External State"}),e.jsx("p",{children:"As the agent executes, it may create or modify external state: writing files, making database records, sending emails, updating documents. This external state is part of the agent's effect on the world, but it is not stored in the messages array. Managing external state requires tracking what the agent has done to external systems, whether those operations are reversible, and how to handle failures that leave external state partially modified."}),e.jsx("h3",{children:"Ephemeral Computation State"}),e.jsx("p",{children:"Some state is neither in the conversation history nor in an external store — it exists only in the program's memory during execution. Computed indexes, caches, parsed data structures. This state must be either derivable from the conversation history (so it can be recomputed if needed) or explicitly serialized at checkpoints."}),e.jsx("h2",{children:"Defining a State Schema"}),e.jsx("p",{children:"For anything beyond a single-turn agent, defining an explicit state schema pays dividends. A schema specifies what fields exist in the agent's state, what types they are, what invariants they must satisfy, and which fields are required vs. optional. This makes state transitions explicit, makes state serialization/deserialization reliable, and makes it possible to validate that a loaded state is internally consistent before resuming execution."}),e.jsx(i,{title:"Typed Agent State with Checkpointing",tabs:{python:`import json
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
    print(f"\\nLoaded checkpoint: step {loaded_state.step_count}, status {loaded_state.status}")`,typescript:`import Anthropic from "@anthropic-ai/sdk";
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

main();`}}),e.jsx("h2",{children:"Checkpointing Strategies"}),e.jsx("h3",{children:"After Every Step"}),e.jsx("p",{children:"Checkpoint after every agent loop iteration. Maximum recovery granularity — if the process dies after step 7, you can resume from step 7. Higher write overhead but acceptable for most workloads. This is the recommended default."}),e.jsx("h3",{children:"At Phase Boundaries"}),e.jsx("p",{children:"Checkpoint only when the agent completes a major phase of work — after research is complete, after planning is done, after a draft is produced. Lower write overhead, but if a failure occurs mid-phase, work since the last checkpoint must be repeated. Appropriate for agents where each step is fast but phases are natural boundaries."}),e.jsx(s,{name:"Append-Only State",category:"State Design",description:"Design agent state as an append-only log: new information is always added, never overwritten. The conversation history is naturally append-only — new messages are appended, not edited. Tool call records should follow the same pattern. This makes state serialization simpler (you can always replay from the beginning), makes debugging easier (you can inspect the full history of what happened), and avoids a class of bugs where a state update overwrites information needed for recovery.",when:["Designing the initial state schema for any agent system","Building systems that require auditability of agent actions","Long-running agents where recovery from mid-task failures is important"],avoid:["Mutable state fields that are overwritten rather than versioned","Deleting intermediate state to save storage — keep everything","In-place modification of the messages array"]}),e.jsx(n,{title:"Include a schema version in every state object",children:"As your agent evolves, the state schema will change. Always include a schema version field in your state objects. When loading a checkpoint, check the schema version and apply any necessary migrations before proceeding. Without versioning, you cannot safely load old checkpoints after a schema change — you will silently interpret old fields incorrectly."}),e.jsx(r,{title:"Conversation history is not fully portable across model versions",children:"The messages array format depends on the model's expected input format. If you upgrade the model version and the message format changes, old checkpoints may not deserialize correctly. Test checkpoint loading whenever you upgrade the model version your agent uses."}),e.jsx(a,{title:"State size grows with step count",children:"Every tool call appends inputs and outputs to the messages array. A 20-step agent with verbose tool results can accumulate megabytes of state. Monitor state size and implement summarization for long-running agents to prevent state from growing without bound. Summarized state is smaller but loses detail — balance the trade-off based on your recovery requirements."})]})}const N=Object.freeze(Object.defineProperty({__proto__:null,default:k},Symbol.toStringTag,{value:"Module"}));function b(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Workflow Orchestration for Agent Systems"}),e.jsx("p",{children:"A workflow orchestration framework provides the infrastructure for defining, executing, monitoring, and recovering agent workflows as structured, persistent processes rather than ephemeral scripts. Workflows defined in an orchestration framework survive process restarts, support human-in-the-loop interruptions, provide observability into execution state, and enable complex control flows like conditional branching, parallel execution, and retry logic — without requiring you to implement all of this from scratch."}),e.jsx(t,{term:"Workflow Orchestration",children:"Workflow orchestration is the management of structured, multi-step processes that may involve multiple agents, external services, human approvals, and long wait times. An orchestration framework handles durability (the workflow survives system failures), observability (current state and history are inspectable), scheduling (steps execute at the right time), and coordination (parallel steps synchronize correctly). Orchestration frameworks bring production reliability to agent workflows that pure code implementations lack."}),e.jsx("h2",{children:"LangGraph: State Machine-Based Orchestration"}),e.jsx("p",{children:"LangGraph is a Python library built on LangChain that models agent workflows as directed graphs. Nodes in the graph are functions (or agent calls) that transform the workflow state. Edges are the transitions between nodes, which can be conditional. The framework manages state persistence, provides a checkpointing API, and includes built-in support for human-in-the-loop interruptions."}),e.jsx("h3",{children:"Core Concepts"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"State schema:"})," A typed data structure (typically a TypedDict) that holds all workflow data. Every node reads from and writes to this state."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Nodes:"})," Functions that transform the state. A node might call an LLM, invoke a tool, apply business logic, or request human approval."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Edges:"})," Connections between nodes. Conditional edges allow routing based on state values. Parallel edges allow concurrent node execution."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Checkpointer:"})," A storage backend (SQLite, PostgreSQL, Redis) that persists the state at each node transition, enabling resumption after failures."]})]}),e.jsx("h3",{children:"When LangGraph Is Appropriate"}),e.jsx("p",{children:"LangGraph excels for workflows where: the control flow is complex and involves conditional branching; human-in-the-loop checkpoints are required at specific stages; the workflow may run for minutes to hours; and observability into intermediate state is important. It is particularly well-suited for the supervisor pattern and for workflows where agents need to be interrupted and redirected."}),e.jsx("h2",{children:"Temporal: Durable Execution"}),e.jsx("p",{children:"Temporal is a workflow platform that provides durable execution — code that survives process failures and infrastructure restarts without requiring explicit checkpointing in your code. Temporal automatically checkpoints workflow state and replays it on failures. You write Python or TypeScript code that looks like sequential imperative code; Temporal handles the durability, retries, and distributed execution."}),e.jsx("h3",{children:"Temporal's Key Advantages for Agents"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Automatic durability:"})," You do not write checkpointing code — Temporal handles it transparently."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Activity retries:"})," Tool calls wrapped as Temporal Activities get automatic retry logic with configurable backoff."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Long-running workflows:"})," Temporal workflows can run for days or months, waiting for external signals or timers without holding a server thread."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Signals and queries:"})," External systems can send signals to running workflows (e.g., a human approves an action) and query current state."]})]}),e.jsx("h3",{children:"When Temporal Is Appropriate"}),e.jsx("p",{children:"Temporal is appropriate for mission-critical agent workflows that must not lose state on infrastructure failures, workflows that run for hours or days, and systems where every tool call must be reliably executed exactly once. The setup overhead of Temporal is significant — it requires running a Temporal server — which makes it unsuitable for simple or exploratory workflows."}),e.jsx("h2",{children:"Human-in-the-Loop Patterns"}),e.jsx("p",{children:"Many production agent workflows require human checkpoints: a human must review and approve the agent's proposed action before it executes. Implementing this correctly requires the workflow to pause at the checkpoint, notify the human, wait for approval (potentially for minutes or hours), and then resume from the exact state it was in. This is fundamentally a durability problem — the workflow state must survive the wait."}),e.jsx("h3",{children:"Approval Gate"}),e.jsx("p",{children:"The agent proposes a set of actions, execution pauses, a human reviews the proposals via a UI or notification, approves or rejects each action, and the workflow resumes with the approved actions. This pattern is appropriate when the agent has write access to external systems and the consequences of incorrect actions are significant."}),e.jsx("h3",{children:"Clarification Request"}),e.jsx("p",{children:"The agent encounters ambiguity in its task and requests clarification from the user before proceeding. The workflow pauses, a notification is sent, the user provides clarification, and the workflow resumes with the additional context. This is different from a full restart — the agent retains all work done so far and only needs the additional clarification."}),e.jsx("h3",{children:"Exception Escalation"}),e.jsx("p",{children:"When an agent encounters an error it cannot resolve autonomously — a tool fails consistently, a decision requires domain expertise it lacks, a safety boundary is approached — it escalates to a human operator. The human reviews the situation, provides guidance or corrects the state, and the agent resumes. This requires the agent to clearly describe the problem and the context needed for the human to help."}),e.jsx(s,{name:"Pause-Before-Irreversible",category:"Human-in-the-Loop",description:"Insert a mandatory human approval checkpoint before any irreversible action with significant external consequences: sending emails, deleting records, making financial transactions, deploying code. The cost of a pause is low relative to the cost of an incorrect irreversible action. Use a non-blocking interrupt: the workflow pauses, a notification is sent, and the workflow resumes when approved — rather than synchronously blocking a server thread.",when:["Agents with write access to production databases, email systems, or financial services","Workflows where regulatory compliance requires a human decision record","Early deployment of new agent capabilities where trust is still being established"],avoid:["Requiring approval for every action, including clearly reversible read operations","Synchronous approval waits that block a thread for potentially hours","Approval notifications without enough context for the reviewer to make a good decision"]}),e.jsx("h2",{children:"Deterministic Flows vs. Fully Autonomous Agents"}),e.jsx("p",{children:"Workflow orchestration frameworks like LangGraph and Temporal are most effective when the agent's control flow is partially deterministic — known phases, known checkpoints, known approval requirements — even if the content of each phase is dynamically generated by an LLM. Fully autonomous agents where even the control flow is LLM-determined benefit less from orchestration frameworks and more from robust state management within a custom agent loop."}),e.jsx("p",{children:"In practice, most production agent systems fall on a spectrum: some workflow phases are fully deterministic (always research, then plan, then execute) while others are dynamic (the execution phase's exact steps depend on what research produced). Design the deterministic skeleton in the orchestration framework, and let LLM agents handle the dynamic content generation within each deterministic phase."}),e.jsx(n,{title:"Design workflows to be idempotent",children:"Orchestration frameworks retry failed steps. For this to be safe, agent steps should be idempotent: running a step twice produces the same result as running it once. LLM calls are naturally idempotent (calling with the same input produces equivalent output). Tool calls that modify external state are not naturally idempotent — wrap them with idempotency keys or check-before-act patterns to prevent duplicate effects on retry."}),e.jsx(r,{title:"Workflow frameworks add operational overhead",children:"Running LangGraph with a PostgreSQL checkpointer or deploying a Temporal cluster adds operational complexity. Evaluate whether the reliability benefits justify the overhead for your specific use case. For simple agents that run in under 60 seconds and do not touch irreversible external state, custom checkpointing to a database may be simpler and more maintainable than a full workflow orchestration framework."}),e.jsx(a,{title:"Start with in-process checkpointing before adopting a framework",children:"Before adopting LangGraph or Temporal, implement simple in-process state checkpointing as described in the previous section. This gives you the core recovery capability quickly and helps you understand your workflow's state management requirements. Only migrate to a full orchestration framework once you have hit limitations in the simpler approach — when you need human-in-the-loop interruptions, distributed execution, or workflows that must survive days-long waits."})]})}const z=Object.freeze(Object.defineProperty({__proto__:null,default:b},Symbol.toStringTag,{value:"Module"}));function x(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Long-Running Agents"}),e.jsx("p",{children:"Most agent implementations are designed for tasks that complete in seconds or minutes. Long-running agents operate on a fundamentally different timescale — hours, days, or even longer. A competitive intelligence agent that monitors news and synthesizes weekly reports, a code maintenance agent that works through a backlog of technical debt issues over several days, a research agent that gathers data over weeks — these systems face challenges that short-running agents never encounter: context window limitations accumulate, infrastructure fails, requirements change, and the external world changes around the agent while it works."}),e.jsx(t,{term:"Long-Running Agent",children:"A long-running agent is an agent whose task execution spans hours to days, potentially across multiple process restarts, infrastructure changes, and user interactions. Long-running agents require durable state management, event-driven execution patterns, context window management strategies, and explicit mechanisms for handling the world-state changes that occur during their extended operation."}),e.jsx("h2",{children:"Core Challenges"}),e.jsx("h3",{children:"Context Window Accumulation"}),e.jsx("p",{children:"In a short-running agent, the conversation history stays manageable. In a long-running agent executing hundreds of steps, the accumulated history eventually exceeds the model's context window limit. Without active management, the agent either fails with a context overflow error or produces degraded reasoning as the model starts attending to the most recent tokens at the expense of earlier context."}),e.jsx("p",{children:"The solution is progressive summarization: as the conversation history grows, summarize older segments and replace them with compact summaries. Recent steps stay in full detail because they are most relevant to the current reasoning. Older steps are represented by summaries that capture what was learned without preserving every token."}),e.jsx("h3",{children:"Process Durability"}),e.jsx("p",{children:"A script that runs for three days on a single machine will fail — due to hardware failures, software updates, network timeouts, or out-of-memory conditions. Long-running agents must be designed to fail and restart without losing progress. This requires durable state checkpointing (so work is not lost on restart) and idempotent step execution (so a retried step does not cause duplicate side effects)."}),e.jsx("h3",{children:"Stale Context"}),e.jsx("p",{children:"Information that was accurate when the agent gathered it may become outdated as time passes. A market analysis gathered on day 1 may be stale by day 3. Long-running agents need a strategy for identifying and refreshing stale information — either proactively re-fetching data on a schedule, or reactively re-verifying data when it is used in reasoning."}),e.jsx("h3",{children:"External World Changes"}),e.jsx("p",{children:"The environment the agent is operating on changes while the agent works. Files are modified by other processes, APIs return different results, users update their requirements. Long-running agents must detect when their assumptions about the world have been invalidated and update their plans accordingly."}),e.jsx("h2",{children:"Event-Driven Architecture for Long-Running Agents"}),e.jsx("p",{children:"The most effective pattern for long-running agents is event-driven execution: the agent does not run continuously, but is triggered by events — a scheduled timer, an external notification, a user message, a change in an external system. Between events, the agent is idle, consuming no compute and no API costs. When an event arrives, the agent loads its persisted state, processes the event, updates its state, and returns to idle."}),e.jsx("p",{children:`This pattern decouples the agent's execution from wall-clock time. A "daily research agent" does not need to run continuously for 24 hours — it runs for a few minutes each morning when triggered by a cron event, processes what happened overnight, and saves its updated state.`}),e.jsx(i,{title:"Event-Driven Long-Running Agent",tabs:{python:`import json
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
    print(f"  - {f}")`,typescript:`import Anthropic from "@anthropic-ai/sdk";
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

main();`}}),e.jsx("h2",{children:"Context Compression Strategies"}),e.jsx("h3",{children:"Progressive Summarization"}),e.jsx("p",{children:"Summarize the oldest portion of the conversation history whenever the history exceeds a threshold. Retain full detail for recent messages. The summary captures the substance of what was learned without preserving every token of intermediate reasoning."}),e.jsx("h3",{children:"Semantic Memory Extraction"}),e.jsx("p",{children:'Instead of summarizing, extract structured facts from the history and store them in a separate "findings" list. Each finding is a compact, informative statement. When building the prompt for the next step, include only the most relevant findings rather than the full history. This approach preserves information more faithfully than free-form summarization.'}),e.jsx("h3",{children:"External Memory with Retrieval"}),e.jsx("p",{children:"Store all intermediate findings in a vector store and retrieve relevant findings on each step based on the current task context. This enables effectively unlimited long-term memory at the cost of a retrieval step per agent loop iteration. Best for agents that work on very large knowledge domains over extended periods."}),e.jsx(s,{name:"Event-Driven Idle Agent",category:"Long-Running Agent",description:"Design long-running agents to be idle between work triggers rather than running continuously. Use a scheduler (cron, event queue, webhook) to wake the agent when there is work to do. The agent loads its persisted state, processes the trigger, saves its updated state, and returns to idle. This approach scales to any task duration without requiring persistent server threads, and reduces cost by only consuming compute when there is actual work.",when:["Research or monitoring tasks that operate on daily, weekly, or irregular schedules","Agents that wait for external events (new emails, repository updates, alerts)","Long-horizon tasks that would require days of continuous compute if run synchronously"],avoid:["Continuous polling in a tight loop — use event-driven triggers instead","Stateless agents that restart from scratch on each trigger","Agents that hold database connections or other resources across idle periods"]}),e.jsx(n,{title:"Set explicit TTLs on agent state",children:"Long-running agent state persisted to disk or a database accumulates over time. Set explicit time-to-live (TTL) values on agent state: a research agent's state might be valid for 30 days, after which it should be archived or deleted. Without TTLs, you accumulate stale state indefinitely, and agents may resume from outdated context without realizing it."}),e.jsx(r,{title:"The world changes while your agent runs",children:"An agent that gathers information on day 1 and uses it on day 5 may be working from stale data. Build staleness detection into long-running agents: record when each piece of information was gathered, check data age before using it in reasoning, and re-gather critical data that exceeds your freshness threshold. For time-sensitive domains (financial data, news, API responses), even hour-old data may be stale."}),e.jsx(a,{title:"Test failure recovery, not just happy-path execution",children:"Long-running agents will fail mid-execution. Simulate failures in development by terminating the agent at various points and verifying that it resumes correctly from the most recent checkpoint without duplicate side effects. The most common source of bugs in long-running agents is incorrect state after a failure recovery — the agent resumes but has corrupted or missing state that causes silent reasoning errors."})]})}const W=Object.freeze(Object.defineProperty({__proto__:null,default:x},Symbol.toStringTag,{value:"Module"}));export{j as a,T as b,A as c,R as d,q as e,E as f,M as g,P as h,I as i,O as j,C as k,N as l,z as m,W as n,S as s};
