import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function MonolithicAgents() {
  return (
    <article className="prose-content">
      <h2>Monolithic Agent Design</h2>

      <p>
        A monolithic agent is a single LLM instance with a single system prompt, a set of
        tools, and one conversation loop responsible for completing the entire task. All
        reasoning, planning, tool selection, and answer synthesis happen within that one
        context window. The term "monolithic" does not imply poor design — it simply means
        that no coordination overhead, no inter-agent messaging, and no orchestration layer
        is involved. For a wide range of tasks, this is exactly the right architecture.
      </p>

      <ConceptBlock term="Monolithic Agent">
        A monolithic agent is a single-model, single-loop system that receives a task, has
        access to a defined set of tools, and operates through repeated perceive-reason-act
        cycles until it produces a final answer. All state is maintained in the conversation
        history. There is no external orchestrator, no sub-agents, and no distributed
        coordination. The entire reasoning process is visible in one conversation trace.
      </ConceptBlock>

      <h2>What Makes Monolithic Agents Appealing</h2>

      <h3>Simplicity</h3>
      <p>
        A monolithic agent can be implemented in under 50 lines of code. There is one API
        endpoint to call, one conversation history to manage, one system prompt to tune,
        and one set of tools to maintain. Debugging is straightforward: you read the
        conversation transcript from top to bottom and find the step where reasoning went
        wrong. There is no distributed state to reconcile, no message-passing protocol to
        debug, and no orchestration logic to maintain.
      </p>

      <h3>Coherent Context</h3>
      <p>
        Because all reasoning happens in a single context window, the agent always has access
        to everything it has learned during the current task. It can refer back to tool results
        from step 3 when reasoning at step 15 without any explicit memory retrieval. In
        multi-agent systems, sharing context between agents requires explicit serialization
        and passing of information — information can be lost or distorted in translation.
        The monolithic agent avoids this entirely.
      </p>

      <h3>Natural Coherence</h3>
      <p>
        A single model maintains a coherent reasoning style, consistent terminology, and a
        unified understanding of the task throughout its trajectory. When multiple agents
        collaborate, subtle inconsistencies can emerge between their individual interpretations
        of the task. The monolithic agent never needs to reconcile divergent conclusions from
        different agents.
      </p>

      <h2>Limitations</h2>

      <h3>Context Window Constraints</h3>
      <p>
        The most fundamental limitation is the context window. A monolithic agent can only
        reason about what fits in its current context. For tasks that require processing
        large amounts of data — hundreds of documents, a large codebase, months of log files —
        a single context window will not be sufficient. Techniques like RAG and summarization
        help, but they introduce their own complexity and loss of information.
      </p>

      <h3>No Parallelism</h3>
      <p>
        A monolithic agent executes sequentially. Even if multiple independent subtasks could
        theoretically be solved in parallel, they must queue behind each other in the single
        loop. For time-sensitive applications where five independent web searches could run
        concurrently, the monolithic agent performs all five in sequence.
      </p>

      <h3>Single Point of Failure</h3>
      <p>
        If the model produces a flawed sub-plan early in a long trajectory, all subsequent
        steps are built on that flawed foundation. There is no independent agent to notice
        the error and raise an objection. Some of this can be mitigated with explicit
        self-reflection steps, but it remains a structural limitation.
      </p>

      <SDKExample
        title="Complete Monolithic Agent with Tools"
        tabs={{
          python: `import json
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
print(result)`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

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
).then(console.log);`
        }}
      />

      <h2>When Monolithic Agents Are the Right Choice</h2>

      <p>
        The monolithic pattern excels for tasks with well-bounded scope — where the information
        needed to complete the task fits comfortably in context, where sequential reasoning is
        natural, and where the overhead of coordinating multiple agents would exceed any benefit.
        Most agent use cases in early development benefit from starting monolithic, measuring
        where the single-agent approach fails, and only then introducing additional agents to
        address specific bottlenecks.
      </p>

      <PatternBlock
        name="Start Monolithic, Add Agents Surgically"
        category="Architecture Decision"
        description="Build the simplest possible monolithic agent first. Measure its failure modes: does it run out of context? Does it need parallel tool execution? Does it struggle with tasks requiring multiple specialized capabilities? Add architectural complexity only where measurement shows clear necessity. An unnecessary multi-agent system is more expensive, harder to debug, and less reliable than a well-designed monolithic one."
        when={[
          "Tasks where all needed information fits in the context window",
          "Sequential tasks where each step clearly depends on the previous",
          "Prototyping and early-stage development",
          "Tasks with a narrow, well-defined tool set"
        ]}
        avoid={[
          "Tasks requiring processing of large data sets that exceed context limits",
          "Tasks naturally parallelizable into independent workstreams",
          "Long-running tasks (hours) where a single context window becomes expensive"
        ]}
      />

      <BestPracticeBlock title="Keep the system prompt focused">
        Monolithic agents with broad system prompts that try to cover every possible behavior
        tend to perform worse than agents with tightly scoped prompts designed for a specific
        task category. A customer support agent should have a customer support system prompt.
        A coding agent should have a coding-focused prompt. If your agent needs to handle
        radically different task types, consider a router that dispatches to specialized
        monolithic agents rather than one generalist agent that tries to do everything.
      </BestPracticeBlock>

      <WarningBlock title="Tool count affects performance">
        Providing an agent with dozens of tools degrades performance. The model must read all
        tool descriptions on every call, consuming input tokens, and must reason about which
        tool is most appropriate from a large menu. Studies show that performance degrades
        measurably beyond 10–15 tools. For monolithic agents with many available capabilities,
        implement dynamic tool selection — pre-filter the tool list to the most relevant subset
        for the current task before passing it to the model.
      </WarningBlock>

      <NoteBlock title="Monolithic does not mean simple">
        A monolithic agent can be sophisticated. It can use chain-of-thought reasoning, follow
        complex multi-step plans, use many tools in sequence, recover from errors, and produce
        high-quality synthesized outputs. The "monolithic" label refers only to its architectural
        structure — one model, one loop — not to the complexity of its behavior or the quality
        of its outputs.
      </NoteBlock>
    </article>
  )
}
