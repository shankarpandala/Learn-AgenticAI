import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const toolUseRetrievalPython = `from anthropic import Anthropic
import json
import voyageai
import chromadb

client = Anthropic()
voyage = voyageai.Client()
chroma = chromadb.PersistentClient(path="./vector_store")

# ---- Precision-Crafted Retrieval Tools ----

RETRIEVAL_TOOLS = [
    {
        "name": "semantic_search",
        "description": (
            "Search the knowledge base using semantic similarity. "
            "Best for conceptual questions, topic exploration, and when exact keywords may not appear in documents. "
            "Returns ranked document chunks with source citations."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "A clear, specific search query describing the information you need",
                },
                "source_filter": {
                    "type": "string",
                    "description": "Optional: filter results to documents from a specific source (e.g. 'finance', 'hr', 'product')",
                },
                "top_k": {
                    "type": "integer",
                    "description": "Number of results (1-10). Default 5. Use fewer for precision, more for broad coverage.",
                    "minimum": 1,
                    "maximum": 10,
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "keyword_search",
        "description": (
            "Search using exact keyword matching (BM25). "
            "Best for product names, error codes, version numbers, IDs, or any query requiring exact term matching. "
            "Complements semantic_search for technical queries."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "keywords": {
                    "type": "string",
                    "description": "Space-separated keywords or short phrase to search for",
                },
                "top_k": {"type": "integer", "description": "Number of results (default 5)", "minimum": 1, "maximum": 10},
            },
            "required": ["keywords"],
        },
    },
    {
        "name": "fetch_document",
        "description": (
            "Retrieve the full text of a specific document by its ID. "
            "Use when semantic_search returns a relevant chunk and you need more context from the same document."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "document_id": {
                    "type": "string",
                    "description": "The document ID from a previous search result",
                },
            },
            "required": ["document_id"],
        },
    },
    {
        "name": "list_sources",
        "description": "List all available document sources/categories in the knowledge base. Use this first to understand what data is available.",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
]

# ---- Tool Handler Implementations ----

def handle_semantic_search(query: str, source_filter: str = None, top_k: int = 5) -> dict:
    result = voyage.embed([query], model="voyage-3")
    query_vec = result.embeddings[0]

    try:
        collection = chroma.get_collection("knowledge_base")
    except Exception:
        return {"error": "Knowledge base not found. Please initialise the vector store."}

    where = {"source": source_filter} if source_filter else None
    res = collection.query(
        query_embeddings=[query_vec],
        n_results=top_k,
        where=where,
    )

    results = [
        {
            "id": id_,
            "text": doc,
            "source": meta.get("source", "unknown"),
            "relevance_score": round(1 - dist, 3),
        }
        for id_, doc, meta, dist in zip(
            res["ids"][0], res["documents"][0], res["metadatas"][0], res["distances"][0]
        )
    ]
    return {"query": query, "results": results, "total": len(results)}

def handle_list_sources() -> dict:
    try:
        collection = chroma.get_collection("knowledge_base")
        # Sample metadata to get unique sources
        sample = collection.get(limit=1000, include=["metadatas"])
        sources = list(set(m.get("source", "unknown") for m in sample["metadatas"]))
        return {"available_sources": sorted(sources)}
    except Exception:
        return {"available_sources": [], "note": "Knowledge base not initialised"}

def dispatch_tool(tool_name: str, tool_input: dict) -> str:
    if tool_name == "semantic_search":
        result = handle_semantic_search(
            query=tool_input["query"],
            source_filter=tool_input.get("source_filter"),
            top_k=tool_input.get("top_k", 5),
        )
    elif tool_name == "keyword_search":
        # Simplified BM25 — replace with real BM25 implementation
        result = {"results": [], "note": "BM25 stub — implement with rank_bm25"}
    elif tool_name == "fetch_document":
        result = {"id": tool_input["document_id"], "full_text": "Full document text here..."}
    elif tool_name == "list_sources":
        result = handle_list_sources()
    else:
        result = {"error": f"Unknown tool: {tool_name}"}
    return json.dumps(result)

# ---- Agentic Retrieval Loop ----

def run_retrieval_agent(question: str) -> str:
    messages = [{"role": "user", "content": question}]
    system = (
        "You are a precise research assistant. Use the provided retrieval tools systematically "
        "to find information. Start by listing sources if you are unsure where to look. "
        "Use semantic_search for conceptual queries and keyword_search for technical terms. "
        "Fetch full documents when you need more context beyond a retrieved chunk. "
        "Synthesise a complete, cited answer once you have sufficient information."
    )

    for _ in range(8):  # max 8 iterations
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=system,
            tools=RETRIEVAL_TOOLS,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            return next((b.text for b in response.content if hasattr(b, "text")), "")

        messages.append({"role": "assistant", "content": response.content})
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = dispatch_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })
        messages.append({"role": "user", "content": tool_results})

    return "Research complete. Generating best available answer."`;

export default function ToolUseRetrieval() {
  return (
    <div className="lesson-content">
      <h2>Tool-Use in Retrieval</h2>

      <p>
        The quality of an agentic RAG system is largely determined by the quality of its
        retrieval tools. A vaguely described tool leads to imprecise tool calls; an
        overly broad tool forces the agent to retrieve more than it needs. Designing
        narrow, well-specified retrieval tools with clear descriptions is the highest-
        leverage engineering decision in agentic RAG.
      </p>

      <ConceptBlock
        term="Retrieval Tool"
        definition="In agentic RAG, a retrieval tool is a callable function exposed to the LLM agent with a schema that specifies its name, description, and input parameters. The agent reads the tool description to decide when to use it and what inputs to provide. Precision-crafted retrieval tools with clear descriptions, explicit use-case guidance, and well-defined parameters enable agents to issue targeted, effective retrieval calls rather than generic broad searches."
      />

      <h2>Tool Design Principles</h2>

      <h3>Single Responsibility</h3>
      <p>
        Each tool should do one thing well. Separate semantic search, keyword search, and
        document fetch into distinct tools rather than combining them into one "search"
        tool. The agent selects the right specialised tool for each step rather than
        guessing which search modality a combined tool will use.
      </p>

      <h3>Explicit Use-Case Guidance in Descriptions</h3>
      <p>
        The tool description is how the LLM agent decides when to use it. Include:
      </p>
      <ul>
        <li>What type of queries this tool excels at.</li>
        <li>When to prefer this tool over alternatives.</li>
        <li>What format the results are in.</li>
        <li>Any limitations (e.g., "does not search web content").</li>
      </ul>

      <h3>Granular Input Parameters</h3>
      <p>
        Break search inputs into specific parameters: separate query string from metadata
        filters, explicit top_k with documented constraints, optional parameters with
        clear defaults. Granular inputs give the agent precise control and produce more
        targeted retrieval calls than a single broad "query" parameter.
      </p>

      <h3>Structured Return Values</h3>
      <p>
        Return results as structured JSON with consistent field names: id, text, source,
        relevance_score. Consistent structure lets the agent reliably parse and reason
        about results across multiple tool calls. Include document IDs so the agent can
        fetch full documents when it needs more context from a partial chunk.
      </p>

      <h2>The list_sources Tool Pattern</h2>

      <p>
        A particularly useful tool for knowledge bases with multiple data domains is a
        <code>list_sources</code> tool that returns all available document categories. An
        agent querying "What does the HR policy say about remote work?" can first call
        <code>list_sources</code> to confirm there is an "hr" source, then issue a targeted
        <code>semantic_search</code> with <code>source_filter: "hr"</code>. Without this
        discovery step, the agent may search across all sources and receive results from
        finance or product documents that happen to mention "remote."
      </p>

      <h2>Parallel Tool Calls</h2>

      <p>
        Claude can issue multiple tool calls in a single response turn when the calls are
        independent. For a query that requires both semantic and keyword retrieval, the
        agent can call both tools simultaneously rather than sequentially. This halves the
        latency of the retrieval step. Design your tools to be stateless so they can safely
        run in parallel.
      </p>

      <NoteBlock
        type="tip"
        title="Log tool call sequences to understand agent behaviour"
        children="In production, log the full sequence of tool calls an agent makes for each query: tool name, input parameters, result size, and timestamps. Analysing these logs reveals which tools are used most, which queries trigger many retrieval iterations, and where the agent's search strategy breaks down. This data is invaluable for improving tool descriptions and identifying retrieval gaps in your knowledge base."
      />

      <BestPracticeBlock title="Test each tool in isolation before testing the full agent">
        Before testing the agentic RAG loop end-to-end, test each retrieval tool
        individually: verify that semantic_search returns relevant results for representative
        queries, that keyword_search finds exact technical terms, and that fetch_document
        returns complete document text. Tool-level testing catches configuration issues
        (wrong collection names, missing metadata fields) that are much harder to diagnose
        inside a multi-step agent loop.
      </BestPracticeBlock>

      <h2>Precision-Crafted Retrieval Tools in Practice</h2>

      <SDKExample
        title="Precision-Crafted Retrieval Tools for Agents"
        tabs={{ python: toolUseRetrievalPython }}
      />

      <p>
        The example above defines four tools with explicit, differentiated descriptions:
        semantic search (with source filter and top_k parameters), keyword search (for
        exact terms), document fetch (for full context), and source listing (for discovery).
        The tool descriptions guide the agent to choose the right tool for each information
        need. The <code>run_retrieval_agent</code> function implements the standard tool-
        use loop and dispatches each tool call to its specific handler.
      </p>
    </div>
  );
}
