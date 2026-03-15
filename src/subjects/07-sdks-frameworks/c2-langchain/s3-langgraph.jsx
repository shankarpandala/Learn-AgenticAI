import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function LangGraph() {
  return (
    <article className="prose-content">
      <h2>LangGraph: State Machines for Agents</h2>
      <p>
        LangGraph is LangChain's framework for building stateful, multi-step agent workflows
        as directed graphs. Unlike simple chain-of-thought loops, LangGraph lets you define
        complex conditional flows, cycles, human-in-the-loop interrupts, and persistent state —
        all the primitives needed for production agents.
      </p>

      <ConceptBlock term="LangGraph StateGraph">
        <p>
          A LangGraph <strong>StateGraph</strong> is a directed graph where nodes are Python
          functions (agent steps) and edges define the flow between steps. The graph maintains
          a typed <strong>State</strong> object that flows between nodes, accumulating results.
          Conditional edges allow dynamic routing based on the current state.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="LangGraph RAG Agent Architecture"
        width={640}
        height={300}
        nodes={[
          { id: 'start', label: 'User Query', type: 'external', x: 80, y: 150 },
          { id: 'retrieve', label: 'Retrieve', type: 'tool', x: 220, y: 150 },
          { id: 'grade', label: 'Grade Docs', type: 'agent', x: 360, y: 150 },
          { id: 'generate', label: 'Generate', type: 'llm', x: 500, y: 100 },
          { id: 'rewrite', label: 'Rewrite Query', type: 'agent', x: 500, y: 200 },
          { id: 'answer', label: 'Final Answer', type: 'external', x: 600, y: 150 },
        ]}
        edges={[
          { from: 'start', to: 'retrieve' },
          { from: 'retrieve', to: 'grade' },
          { from: 'grade', to: 'generate', label: 'relevant' },
          { from: 'grade', to: 'rewrite', label: 'not relevant' },
          { from: 'rewrite', to: 'retrieve', label: 'retry' },
          { from: 'generate', to: 'answer' },
        ]}
      />

      <h2>Core Concepts</h2>

      <h3>State</h3>
      <p>
        State is a TypedDict (Python) that flows through the graph. All nodes read from and write
        to this shared state. LangGraph supports both <strong>total state replacement</strong> and
        <strong>reducer functions</strong> (e.g., append to a list).
      </p>

      <h3>Nodes</h3>
      <p>
        Nodes are Python functions that take the current state and return an update dict.
        They can call LLMs, run tools, query databases, or execute any Python code.
      </p>

      <h3>Edges</h3>
      <p>
        Edges connect nodes. <strong>Normal edges</strong> always go from A to B.
        <strong>Conditional edges</strong> use a function to decide the next node based on state.
        <code>START</code> and <code>END</code> are special entry/exit nodes.
      </p>

      <h2>Building a CRAG Agent with LangGraph</h2>
      <p>
        The following example implements Corrective RAG (CRAG) — an agent that retrieves
        documents, grades their relevance, and either generates an answer or rewrites the
        query and retries.
      </p>

      <SDKExample
        title="CRAG Agent with LangGraph"
        tabs={{
          python: `from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain.schema import Document
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
import operator

# 1. Define State
class GraphState(TypedDict):
    question: str
    generation: str
    documents: List[Document]
    retries: int

# 2. Initialize LLM and retriever
llm = ChatAnthropic(model="claude-opus-4-6", temperature=0)
retriever = Chroma(...).as_retriever(search_kwargs={"k": 4})

# 3. Define nodes

def retrieve(state: GraphState) -> dict:
    """Retrieve documents from vector store."""
    docs = retriever.invoke(state["question"])
    return {"documents": docs, "question": state["question"]}

def grade_documents(state: GraphState) -> dict:
    """Grade retrieved documents for relevance."""
    grader_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a relevance grader. Given a question and document, "
                   "answer 'yes' if the document is relevant, 'no' otherwise."),
        ("human", "Question: {question}\\n\\nDocument: {document}")
    ])
    grader = grader_prompt | llm

    filtered_docs = []
    for doc in state["documents"]:
        result = grader.invoke({
            "question": state["question"],
            "document": doc.page_content
        })
        if "yes" in result.content.lower():
            filtered_docs.append(doc)

    return {"documents": filtered_docs}

def generate(state: GraphState) -> dict:
    """Generate answer from relevant documents."""
    gen_prompt = ChatPromptTemplate.from_messages([
        ("system", "Answer the question based on the context. Be concise and accurate."),
        ("human", "Context:\\n{context}\\n\\nQuestion: {question}")
    ])
    chain = gen_prompt | llm

    context = "\\n\\n".join(d.page_content for d in state["documents"])
    result = chain.invoke({"context": context, "question": state["question"]})

    return {"generation": result.content}

def rewrite_query(state: GraphState) -> dict:
    """Rewrite the query for better retrieval."""
    rewrite_prompt = ChatPromptTemplate.from_messages([
        ("system", "Rewrite this question to be clearer and more specific for retrieval."),
        ("human", "{question}")
    ])
    chain = rewrite_prompt | llm
    result = chain.invoke({"question": state["question"]})

    return {
        "question": result.content,
        "retries": state.get("retries", 0) + 1
    }

# 4. Define conditional routing
def decide_to_generate(state: GraphState) -> str:
    """Route: generate if docs are relevant, else rewrite."""
    if state.get("retries", 0) >= 2:
        return "generate"  # Force generation after 2 retries
    if len(state["documents"]) > 0:
        return "generate"
    return "rewrite_query"

# 5. Build the graph
workflow = StateGraph(GraphState)

workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("generate", generate)
workflow.add_node("rewrite_query", rewrite_query)

workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "generate": "generate",
        "rewrite_query": "rewrite_query"
    }
)
workflow.add_edge("rewrite_query", "retrieve")  # Loop back
workflow.add_edge("generate", END)

app = workflow.compile()

# 6. Run the agent
result = app.invoke({"question": "What is the best chunking strategy for RAG?", "retries": 0})
print(result["generation"])`,
        }}
      />

      <h2>Checkpointing & Persistence</h2>
      <p>
        LangGraph's checkpointing system saves graph state after each node, enabling:
        pause/resume, human-in-the-loop approval gates, and fault tolerance.
      </p>

      <CodeBlock language="python" filename="langgraph_checkpointing.py">
{`from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph

# SQLite checkpointer (use PostgreSQL in production)
memory = SqliteSaver.from_conn_string(":memory:")
# Production: memory = PostgresSaver.from_conn_string(DATABASE_URL)

app = workflow.compile(checkpointer=memory)

# Run with a thread_id for resumption
config = {"configurable": {"thread_id": "session-abc-123"}}
result = app.invoke({"question": "..."}, config=config)

# Later, resume the same thread (state is preserved)
result = app.invoke({"question": "Follow-up question"}, config=config)

# Human-in-the-loop: interrupt before a node
from langgraph.graph import interrupt_before

app = workflow.compile(
    checkpointer=memory,
    interrupt_before=["generate"]  # Pause before generating
)

# The graph pauses here — you can inspect state
state = app.get_state(config)
print("About to generate with:", state.values["documents"])

# Approve and continue
app.invoke(None, config=config)  # Resume from checkpoint`}
      </CodeBlock>

      <PatternBlock
        name="Supervisor Pattern with LangGraph"
        category="Multi-Agent"
        whenToUse="When you have multiple specialized worker agents that need to be coordinated by a central router that decides which agent handles each subtask."
      >
        <p>
          The supervisor pattern uses a LLM router as a special node that decides which worker
          agent to call next. Workers report back to the supervisor after each step.
          The supervisor sees all worker outputs and decides when the task is complete.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="State Schema Design">
        <p>Design your state schema before writing any nodes. Use Annotated types with reducer
        functions for lists (e.g., <code>Annotated[list, operator.add]</code> to append rather
        than replace). Keep state flat and serializable — LangGraph needs to checkpoint it.
        Avoid storing large objects like embeddings directly in state; use IDs and look them up.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="LangGraph vs. LangChain Agents">
        <p>Use LangGraph when you need: cycles/loops, multiple conditional paths, persistent state
        across sessions, or human-in-the-loop interrupts. Use simple LangChain AgentExecutor
        for straightforward ReAct loops without complex branching. LangGraph has more boilerplate
        but gives you full control over agent flow.</p>
      </NoteBlock>
    </article>
  )
}
