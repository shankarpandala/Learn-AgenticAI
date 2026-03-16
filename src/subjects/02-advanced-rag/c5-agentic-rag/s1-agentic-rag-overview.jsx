import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx';

const agenticOverviewPython = `from anthropic import Anthropic
import json

client = Anthropic()

# ---- Tool Definitions for Agentic RAG ----

TOOLS = [
    {
        "name": "search_knowledge_base",
        "description": "Search the internal knowledge base for relevant documents.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query"},
                "filter_source": {"type": "string", "description": "Optional source filter (e.g. 'finance', 'hr')"},
                "top_k": {"type": "integer", "description": "Number of results to return (default 5)"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "search_web",
        "description": "Search the web for current information not in the knowledge base.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The web search query"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "get_document_by_id",
        "description": "Retrieve the full text of a specific document by its ID.",
        "input_schema": {
            "type": "object",
            "properties": {
                "document_id": {"type": "string", "description": "The document ID to retrieve"},
            },
            "required": ["document_id"],
        },
    },
]

# ---- Simulated Tool Handlers ----

def handle_tool_call(tool_name: str, tool_input: dict) -> str:
    """Execute a tool call and return the result as a string."""
    if tool_name == "search_knowledge_base":
        # In production, call your actual vector store
        query = tool_input["query"]
        return json.dumps({
            "results": [
                {"id": "doc_1", "text": f"Relevant result for: {query}", "source": "internal", "score": 0.92},
                {"id": "doc_2", "text": f"Another result for: {query}", "source": "internal", "score": 0.85},
            ]
        })
    elif tool_name == "search_web":
        return json.dumps({"results": [{"text": f"Web result for: {tool_input['query']}", "url": "https://example.com"}]})
    elif tool_name == "get_document_by_id":
        return json.dumps({"id": tool_input["document_id"], "full_text": "Full document content here..."})
    return json.dumps({"error": f"Unknown tool: {tool_name}"})

# ---- Agentic RAG Loop ----

def agentic_rag(user_query: str, max_iterations: int = 5) -> str:
    """
    Agentic RAG: the model uses tools to retrieve information iteratively
    until it has enough context to answer the question.
    """
    messages = [{"role": "user", "content": user_query}]

    system = (
        "You are a research assistant with access to retrieval tools. "
        "Use the tools to find information needed to answer the user's question. "
        "Plan your retrieval strategy, search systematically, and synthesise a "
        "complete answer only after gathering sufficient information. "
        "Cite sources in your final answer."
    )

    for iteration in range(max_iterations):
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=system,
            tools=TOOLS,
            messages=messages,
        )

        print(f"Iteration {iteration + 1}: stop_reason={response.stop_reason}")

        if response.stop_reason == "end_turn":
            # Model is done — extract the text response
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "No text response generated."

        elif response.stop_reason == "tool_use":
            # Process all tool calls in this response
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []

            for block in response.content:
                if block.type == "tool_use":
                    print(f"  Tool: {block.name}({json.dumps(block.input)[:80]})")
                    result = handle_tool_call(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })

            messages.append({"role": "user", "content": tool_results})
        else:
            break

    return "Maximum iterations reached. Best available answer from accumulated context."

# Example
answer = agentic_rag("What are the key differences between HNSW and IVF indexing?")
print(answer)`;

export default function AgenticRagOverview() {
  return (
    <div className="lesson-content">
      <h2>Agentic RAG Overview</h2>

      <p>
        Standard RAG follows a fixed pipeline: retrieve then generate. The retrieval step
        is a single, predetermined operation. Agentic RAG replaces this fixed pipeline with
        an autonomous agent that decides when to retrieve, what to search for, which tools
        to use, and when it has gathered enough information. This flexibility enables
        dramatically more sophisticated information gathering than any predefined pipeline.
      </p>

      <ConceptBlock
        term="Agentic RAG"
        definition="Agentic RAG is an approach where a language model acts as an autonomous agent that plans and executes multi-step retrieval strategies using tools. Rather than following a fixed retrieve-then-generate pipeline, the agent decides dynamically how many retrieval steps to perform, which retrieval tools to use, how to refine queries based on intermediate results, and when it has sufficient information to generate a final answer."
      />

      <ArchitectureDiagram
        title="Agentic RAG Architecture"
        nodes={[
          { id: "user", label: "User Query", type: "external", x: 100, y: 200 },
          { id: "agent", label: "LLM Agent", type: "agent", x: 350, y: 200 },
          { id: "kb", label: "Vector Store", type: "store", x: 600, y: 100 },
          { id: "web", label: "Web Search", type: "external", x: 600, y: 200 },
          { id: "graph", label: "Knowledge Graph", type: "store", x: 600, y: 300 },
          { id: "answer", label: "Final Answer", type: "external", x: 850, y: 200 },
        ]}
        edges={[
          { from: "user", to: "agent", label: "query" },
          { from: "agent", to: "kb", label: "search_kb()" },
          { from: "agent", to: "web", label: "search_web()" },
          { from: "agent", to: "graph", label: "graph_query()" },
          { from: "kb", to: "agent", label: "chunks" },
          { from: "web", to: "agent", label: "results" },
          { from: "graph", to: "agent", label: "triples" },
          { from: "agent", to: "answer", label: "synthesised response" },
        ]}
      />

      <h2>How Agentic RAG Differs from Pipeline RAG</h2>

      <h3>Dynamic Tool Selection</h3>
      <p>
        A pipeline RAG system uses the same retrieval method for every query. An agentic
        RAG system can choose between multiple retrieval tools: vector search for semantic
        queries, BM25 for keyword-heavy queries, web search for current information, graph
        queries for relational questions. The agent selects the right tool for each step
        based on the query's characteristics.
      </p>

      <h3>Adaptive Retrieval Depth</h3>
      <p>
        Simple questions terminate after a single retrieval step. Complex questions trigger
        multiple sequential or parallel retrieval steps. The agent decides how much
        information it needs rather than being constrained by a fixed k parameter.
      </p>

      <h3>Self-Directed Query Refinement</h3>
      <p>
        When initial retrieval returns low-quality results, an agent can reformulate its
        query, try a different tool, or broaden/narrow the scope. A pipeline cannot do this
        — if the first retrieval fails, the pipeline continues with bad context.
      </p>

      <h3>Tool Composition</h3>
      <p>
        Agents can compose multiple tools in sequence. A complex research query might
        involve a vector search to find relevant documents, a graph query to expand to
        related entities, and a web search to supplement with current information. The agent
        orchestrates these tools based on the information gaps it identifies.
      </p>

      <h2>The Agentic RAG Loop</h2>

      <p>
        The core loop of any agentic RAG system:
      </p>
      <ol>
        <li>The user query arrives. The agent plans its retrieval strategy.</li>
        <li>The agent calls a retrieval tool with a specific query.</li>
        <li>The tool returns results. The agent reads them and decides what to do next.</li>
        <li>If more information is needed, the agent formulates a follow-up query and calls another tool.</li>
        <li>When the agent has sufficient information, it generates a final synthesised answer.</li>
      </ol>

      <h2>Implementing with Claude's Tool Use</h2>

      <p>
        Claude's native tool use API is ideal for agentic RAG. Define retrieval operations
        as tools with clear names, descriptions, and input schemas. Claude will select which
        tools to use and in what order based on the query, automatically plan multi-step
        retrieval strategies, and synthesise a final answer when it has gathered enough
        information.
      </p>

      <NoteBlock
        type="note"
        title="Agentic RAG is powerful but more expensive"
        children="Each tool call in an agentic loop adds an LLM inference pass and potentially multiple embedding + vector search operations. A simple question might use 1 tool call; a complex research query might use 5–8. At $0.01–0.05 per query for agentic RAG vs. $0.003–0.01 for pipeline RAG, the cost difference is significant at scale. Reserve agentic RAG for queries that genuinely benefit from adaptive retrieval; use pipeline RAG for the majority of straightforward queries."
      />

      <BestPracticeBlock title="Define narrow, well-scoped tools with clear descriptions">
        Tool description quality is the most important factor in agentic RAG performance.
        The LLM selects tools based on their descriptions — vague descriptions lead to poor
        tool selection. Write descriptions that specify exactly what information the tool
        returns, what queries it is best suited for, and what it cannot do. Include examples
        in the description if the tool has non-obvious use cases. A well-described narrow
        tool outperforms a poorly described general tool every time.
      </BestPracticeBlock>

      <h2>Agentic RAG with Claude Tool Use</h2>

      <SDKExample
        title="Agentic RAG with Claude Tool Use API"
        tabs={{ python: agenticOverviewPython }}
      />

      <p>
        The implementation defines three retrieval tools (knowledge base search, web search,
        document fetch) and runs the standard Claude tool-use loop: call the model, process
        tool calls, return results, repeat until the model stops calling tools and generates
        a final answer. The agent autonomously decides which tools to use and in what order
        — you provide the tools and the loop; the model provides the strategy.
      </p>
    </div>
  );
}
