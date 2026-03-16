import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function SupervisorPattern() {
  return (
    <article className="prose-content">
      <h2>The Supervisor Pattern</h2>

      <p>
        The supervisor pattern is a multi-agent architecture where a central supervisor agent
        controls a pool of specialized worker agents by dynamically routing tasks based on
        the current state of the conversation and the available worker capabilities. Unlike
        a fixed pipeline where the sequence of agents is predetermined, the supervisor
        decides at each step which agent to invoke next based on what has happened so far.
        This makes the supervisor pattern particularly powerful for open-ended tasks where
        the sequence of operations cannot be determined in advance.
      </p>

      <ConceptBlock term="Supervisor Pattern">
        In the supervisor pattern, a supervisor agent holds the overall task context and
        a routing table of available worker agents. At each step, the supervisor examines
        the current task state and selects which worker to call next, what to pass to it,
        and how to incorporate its result. Workers are called one at a time (or in small
        parallel groups) rather than in a fixed pipeline. The supervisor continues routing
        until it determines the task is complete.
      </ConceptBlock>

      <h2>Supervisor vs. Orchestrator</h2>

      <p>
        The supervisor and orchestrator patterns are related but distinct. An orchestrator
        typically generates a complete plan upfront and executes it, delegating known subtasks
        to known workers in a predetermined structure. A supervisor operates reactively:
        it examines the current state, decides the next single step, executes it, and
        re-evaluates. This makes the supervisor more adaptive but also more expensive
        (it makes an LLM call at every routing decision) and harder to parallelize.
      </p>

      <p>
        Use the orchestrator pattern when you can decompose the full task structure upfront.
        Use the supervisor pattern when the required sequence of operations depends heavily
        on intermediate results and cannot be predetermined.
      </p>

      <h2>Implementing a Supervisor with Tool-Based Routing</h2>

      <p>
        A clean implementation gives the supervisor a set of "worker tools" — tools whose
        names correspond to worker agent identifiers. When the supervisor calls the
        "web_researcher" tool, it invokes the web researcher worker agent. This leverages
        the model's built-in tool-use mechanism for routing decisions, producing explicit
        reasoning about which worker to call and clear logging of routing decisions.
      </p>

      <SDKExample
        title="Supervisor Agent with Dynamic Worker Routing"
        tabs={{
          python: `import json
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
print(result)`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

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
});`
        }}
      />

      <h2>Task Routing Strategies</h2>

      <p>
        The supervisor's routing decisions can be implemented in several ways:
      </p>

      <ul>
        <li><strong>LLM-based routing (shown above):</strong> The supervisor model itself decides which worker to call at each step. Most flexible, but every routing decision consumes tokens.</li>
        <li><strong>Rule-based routing:</strong> Explicit if-else logic maps task state to worker selection. Fast, predictable, but requires anticipating all routing scenarios at design time.</li>
        <li><strong>Intent classification:</strong> A lightweight classifier examines the task and emits a structured routing instruction that a deterministic dispatcher executes. Balances flexibility and cost.</li>
      </ul>

      <PatternBlock
        name="Supervisor with Explicit Routing State"
        category="Supervisor Design"
        description="Maintain a structured routing state that the supervisor updates at each step — tracking which workers have been called, what they produced, and what still needs to be done. Pass this state explicitly to the supervisor on each call rather than relying on it to reconstruct state from the full conversation history. Explicit state makes routing decisions more reliable and makes the supervisor's progress auditable."
        when={[
          "Long-running tasks where the supervisor needs to track multi-step progress",
          "Tasks where the same worker may be called multiple times with different inputs",
          "Systems where you need to interrupt and resume supervisor execution"
        ]}
        avoid={[
          "Supervisors that must read the entire conversation history to determine routing",
          "Implicit state that is encoded only in natural language without structured fields",
          "Supervisors that cannot explain their routing decisions"
        ]}
      />

      <BestPracticeBlock title="Limit the supervisor's tool set to available workers">
        Only include tools in the supervisor's tool list that correspond to actually available
        workers. An unused tool in the tool list consumes tokens on every supervisor API call
        and may confuse the supervisor about what capabilities are available. If workers
        are conditionally available (e.g., only when certain data has been gathered), manage
        this by dynamically adjusting the tool list rather than including all tools all the time.
      </BestPracticeBlock>

      <WarningBlock title="Supervisors can get stuck in routing loops">
        A supervisor that repeatedly calls the same worker with slightly different inputs
        and receives unsatisfying results may loop indefinitely. Detect this by tracking
        which workers have been called with similar inputs and returning a signal to the
        supervisor when it appears to be looping. Include explicit instructions in the
        supervisor's system prompt: "If a worker has been called three times without
        satisfactory results, synthesize what you have and explain what could not be completed."
      </WarningBlock>

      <NoteBlock title="The supervisor pattern maps naturally to LangGraph">
        The supervisor pattern is the canonical use case for LangGraph, which provides a
        state machine implementation optimized for this architecture. LangGraph lets you
        define agents as graph nodes, routing logic as edges, and shared state as the graph
        state that is passed between nodes. If you are building supervisor-pattern systems
        in Python, LangGraph reduces the boilerplate and adds built-in features for
        checkpointing and human-in-the-loop interruptions.
      </NoteBlock>
    </article>
  )
}
