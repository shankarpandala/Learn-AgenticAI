import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const ragWithAgentsPython = `from anthropic import Anthropic
from typing import TypedDict, Annotated
import json
import operator

client = Anthropic()

# ---- State and Tools ----

class RAGState(TypedDict):
    question: str
    retrieved_chunks: list[dict]
    search_queries: list[str]
    answer: str
    iteration: int
    finished: bool

TOOLS = [
    {
        "name": "vector_search",
        "description": "Search the knowledge base for relevant document chunks.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "top_k": {"type": "integer", "default": 5},
            },
            "required": ["query"],
        },
    },
    {
        "name": "generate_final_answer",
        "description": "Generate the final answer when you have sufficient context. Call this when ready to respond.",
        "input_schema": {
            "type": "object",
            "properties": {
                "answer": {"type": "string", "description": "The final synthesised answer with citations"},
            },
            "required": ["answer"],
        },
    },
]

# ---- Simulated Vector Search ----

def vector_search(query: str, top_k: int = 5) -> list[dict]:
    # In production: embed query and search your vector store
    return [
        {"id": f"doc_{i}", "text": f"Result {i} for: {query}", "source": f"source_{i}", "score": 0.9 - i*0.05}
        for i in range(min(top_k, 3))
    ]

# ---- LangGraph-style Agent Nodes ----

def retrieve_node(state: RAGState) -> RAGState:
    """
    Retrieval node: the agent plans and executes retrieval using tools.
    Runs until the agent decides it has enough context or calls generate_final_answer.
    """
    messages = [
        {
            "role": "user",
            "content": (
                f"Question: {state['question']}\\n\\n"
                f"{'Previously retrieved chunks: ' + json.dumps(state['retrieved_chunks'][:3]) if state['retrieved_chunks'] else 'No chunks retrieved yet.'}"
                f"\\n\\nPlan your retrieval and search for the information you need. "
                f"When you have enough information, call generate_final_answer."
            )
        }
    ]

    system = (
        "You are a research agent. Use vector_search to find relevant information. "
        "Search with different queries to get comprehensive coverage. "
        "When you have enough context, call generate_final_answer with your synthesised response."
    )

    new_chunks = list(state["retrieved_chunks"])
    final_answer = ""

    for _ in range(4):  # max sub-iterations per node
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=system,
            tools=TOOLS,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            break

        messages.append({"role": "assistant", "content": response.content})
        tool_results = []

        for block in response.content:
            if block.type == "tool_use":
                if block.name == "vector_search":
                    results = vector_search(block.input["query"], block.input.get("top_k", 5))
                    new_chunks.extend(results)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps({"results": results}),
                    })
                elif block.name == "generate_final_answer":
                    final_answer = block.input["answer"]
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": '{"status": "answer_recorded"}',
                    })

        messages.append({"role": "user", "content": tool_results})

        if final_answer:
            break

    return {
        **state,
        "retrieved_chunks": new_chunks,
        "answer": final_answer,
        "finished": bool(final_answer),
        "iteration": state["iteration"] + 1,
    }

def grade_node(state: RAGState) -> RAGState:
    """
    Grading node: evaluate whether the answer is complete and grounded.
    If not, mark as not finished to trigger another retrieval iteration.
    """
    if not state["answer"]:
        return {**state, "finished": False}

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=128,
        system='Evaluate answer quality. Return JSON: {"complete": true|false, "grounded": true|false}',
        messages=[{
            "role": "user",
            "content": (
                f"Question: {state['question']}\\n\\n"
                f"Answer: {state['answer']}\\n\\n"
                "Is this answer complete and grounded in the retrieved chunks?"
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    evaluation = json.loads(raw)

    is_done = evaluation.get("complete") and evaluation.get("grounded")
    return {**state, "finished": is_done or state["iteration"] >= 3}

def run_agentic_rag_graph(question: str) -> dict:
    """Run the agentic RAG workflow as a simple state machine."""
    state: RAGState = {
        "question": question,
        "retrieved_chunks": [],
        "search_queries": [],
        "answer": "",
        "iteration": 0,
        "finished": False,
    }

    while not state["finished"] and state["iteration"] < 3:
        state = retrieve_node(state)
        state = grade_node(state)
        print(f"Iteration {state['iteration']}: finished={state['finished']}, "
              f"chunks={len(state['retrieved_chunks'])}")

    return {"question": question, "answer": state["answer"], "iterations": state["iteration"]}

# Example
result = run_agentic_rag_graph("What are the key differences between HNSW and IVF indexing?")
print(result["answer"])`;

export default function RagWithAgents() {
  return (
    <div className="lesson-content">
      <h2>RAG with Agents</h2>

      <p>
        The previous sections introduced agentic RAG concepts and tool design. This section
        shows how to wire a complete RAG pipeline into a production agent loop using
        LangGraph-style state machines or custom orchestration. The result is a system
        where retrieval, grading, and generation are discrete, composable nodes that can
        be tested, monitored, and extended independently.
      </p>

      <ConceptBlock
        term="RAG Agent Graph"
        definition="A RAG agent graph is a directed workflow where each node performs a specific step in the retrieval-augmented generation process: query planning, retrieval, document grading, answer generation, and quality evaluation. Edges between nodes can be conditional — the workflow routes to different nodes based on the output of each step. This structure makes complex agentic RAG pipelines explicit, debuggable, and composable."
      />

      <h2>The Node Architecture</h2>

      <h3>Retrieval Node</h3>
      <p>
        The retrieval node is an agent loop in itself: the LLM uses retrieval tools to
        gather information, reformulating queries as needed, until it decides it has enough
        context. It terminates by calling a special <code>generate_final_answer</code> tool
        (or equivalent signal), passing the synthesised answer forward to the next node.
        This design makes retrieval self-contained and testable.
      </p>

      <h3>Grade Node</h3>
      <p>
        The grade node evaluates the answer produced by the retrieval node. It checks whether
        the answer is complete (addresses all aspects of the question) and grounded (supported
        by retrieved context). If the answer fails the grade, the workflow loops back to
        the retrieval node for another iteration with the question and previous answer in
        context. This implements automatic quality control.
      </p>

      <h3>Generate Node</h3>
      <p>
        In some architectures, generation is separated from retrieval: the retrieval node
        only gathers context, and a separate generation node synthesises the final answer.
        This separation allows different models to be used for retrieval planning (cheaper,
        faster) and final answer generation (highest quality). It also allows the generation
        step to be retried without repeating retrieval.
      </p>

      <h2>Implementing with LangGraph</h2>

      <p>
        LangGraph is a library for building multi-agent workflows as state graphs. A RAG
        agent graph in LangGraph defines:
      </p>
      <ul>
        <li><strong>State</strong>: A typed dict containing the question, retrieved chunks, search history, answer, and quality flags.</li>
        <li><strong>Nodes</strong>: Python functions that take and return state.</li>
        <li><strong>Edges</strong>: Connections between nodes, including conditional edges that route based on state values.</li>
        <li><strong>Entry and exit points</strong>: Where the workflow starts and what constitutes a terminal state.</li>
      </ul>
      <p>
        The code below implements the same architecture without the LangGraph dependency
        — using a simple state dict and a while loop — to show the underlying logic clearly.
        In production, LangGraph provides streaming, persistence, and multi-agent
        orchestration built-in.
      </p>

      <h2>Custom Orchestration Patterns</h2>

      <p>
        Not every team needs LangGraph. For simpler agentic RAG patterns, a standard
        while-loop with the Claude tool-use API is entirely sufficient:
      </p>
      <ul>
        <li>Maintain a messages list that grows with each tool call and result.</li>
        <li>Check <code>response.stop_reason</code> — if "tool_use", execute tools and continue; if "end_turn", extract the final answer.</li>
        <li>Track state (retrieved chunks, queries issued, iteration count) in a local dict.</li>
        <li>Apply a hard iteration cap and a quality evaluation step after each cycle.</li>
      </ul>

      <NoteBlock
        type="tip"
        title="Add streaming for better user experience"
        children="The agentic RAG loop can take 5–30 seconds for complex queries with multiple retrieval steps. Stream intermediate status updates to the user: 'Searching knowledge base...', 'Found 3 relevant documents, searching for more...', 'Generating answer...'. Claude's streaming API supports streaming content blocks including tool calls, allowing you to detect when tools are being called and show progress messages before the final answer arrives."
      />

      <BestPracticeBlock title="Implement a feedback loop from failed grades to retrieval">
        When the grade node determines that an answer is incomplete or ungrounded, the
        workflow loops back to retrieval. Make the grade node's failure reason explicit
        in the state — "answer missing information about X" or "claim Y is not supported
        by retrieved context" — and include this feedback in the next retrieval node's
        system prompt. This targeted feedback dramatically improves the retrieval node's
        ability to fill the specific gap on the second attempt.
      </BestPracticeBlock>

      <h2>Complete Agentic RAG with State Machine</h2>

      <SDKExample
        title="RAG Pipeline Wired into an Agent Loop"
        tabs={{ python: ragWithAgentsPython }}
      />

      <p>
        The implementation combines a retrieval agent node (which uses tools to gather
        context until it generates an answer) with a grading node (which evaluates
        completeness and groundedness). The <code>run_agentic_rag_graph</code> function
        runs the state machine until the grade passes or the iteration limit is reached.
        This pattern scales from a simple two-node graph to a complex multi-agent workflow
        by adding more specialised nodes — a planner node, a fact-checker node, a
        citation formatter node — as your requirements evolve.
      </p>
    </div>
  );
}
