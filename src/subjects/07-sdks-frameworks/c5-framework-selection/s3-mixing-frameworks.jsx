import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'

export default function MixingFrameworks() {
  return (
    <article className="prose-content">
      <h2>Mixing Frameworks</h2>
      <p>
        Production AI systems rarely use a single framework for everything. Different
        frameworks excel at different layers: orchestration, retrieval, prompt optimization,
        observability. Understanding interoperability patterns lets you pick the best tool
        for each layer without locking into a monolithic choice.
      </p>

      <ConceptBlock term="Framework Interoperability">
        <p>
          Most LLM frameworks converge on common interfaces: LangChain's
          <code>BaseChatModel</code>, LlamaIndex's <code>LLM</code> base class, and
          the raw Anthropic/OpenAI API all speak the same token-in/token-out language.
          Interoperability happens at three layers: <strong>LLM clients</strong> (shared
          model access), <strong>data formats</strong> (LangChain Documents ↔ LlamaIndex
          Nodes), and <strong>tool protocols</strong> (function calling schema).
        </p>
      </ConceptBlock>

      <h2>LangGraph + LlamaIndex: Orchestration + Retrieval</h2>
      <p>
        The most common combination: use LangGraph for stateful agent orchestration
        (loops, conditionals, human-in-the-loop) while delegating retrieval entirely to
        LlamaIndex query engines, which handle indexing, chunking, and ranking.
      </p>

      <SDKExample
        title="LangGraph Agent Using LlamaIndex Retrieval"
        tabs={{
          python: `from typing import TypedDict, List
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage

# LlamaIndex retrieval setup
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.anthropic import Anthropic as LlamaAnthropic
from llama_index.embeddings.openai import OpenAIEmbedding

# Configure LlamaIndex
Settings.llm = LlamaAnthropic(model="claude-opus-4-6")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

docs = SimpleDirectoryReader("./knowledge_base").load_data()
index = VectorStoreIndex.from_documents(docs)

# LlamaIndex query engine — this is what LangGraph will call
retriever_engine = index.as_query_engine(
    similarity_top_k=6,
    response_mode="no_text",  # Return nodes only, not synthesized answer
)

# LangGraph state and nodes
class AgentState(TypedDict):
    question: str
    context: List[str]
    answer: str
    needs_retrieval: bool

# LangChain LLM for orchestration
orchestrator_llm = ChatAnthropic(model="claude-opus-4-6", temperature=0)

def classify_query(state: AgentState) -> dict:
    """Decide if retrieval is needed or if the LLM can answer directly."""
    response = orchestrator_llm.invoke([
        HumanMessage(content=(
            f"Does answering this question require looking up specific documents? "
            f"Answer with just 'yes' or 'no'.\\n\\nQuestion: {state['question']}"
        ))
    ])
    needs = "yes" in response.content.lower()
    return {"needs_retrieval": needs}

def retrieve_with_llamaindex(state: AgentState) -> dict:
    """Use LlamaIndex to retrieve relevant context."""
    # LlamaIndex handles all retrieval complexity
    result = retriever_engine.query(state["question"])

    context = [node.get_content() for node in result.source_nodes]
    return {"context": context}

def generate_answer(state: AgentState) -> dict:
    """Generate final answer with or without retrieved context."""
    if state.get("context"):
        context_str = "\\n\\n".join(state["context"])
        prompt = (
            f"Answer based on this context:\\n{context_str}\\n\\n"
            f"Question: {state['question']}"
        )
    else:
        prompt = state["question"]

    response = orchestrator_llm.invoke([HumanMessage(content=prompt)])
    return {"answer": response.content}

def should_retrieve(state: AgentState) -> str:
    return "retrieve" if state["needs_retrieval"] else "generate"

# Build LangGraph workflow
graph = StateGraph(AgentState)
graph.add_node("classify", classify_query)
graph.add_node("retrieve", retrieve_with_llamaindex)
graph.add_node("generate", generate_answer)

graph.add_edge(START, "classify")
graph.add_conditional_edges("classify", should_retrieve, {
    "retrieve": "retrieve",
    "generate": "generate",
})
graph.add_edge("retrieve", "generate")
graph.add_edge("generate", END)

app = graph.compile()

result = app.invoke({"question": "What chunking strategy works best for code files?"})
print(result["answer"])`,
        }}
      />

      <h2>DSPy + LangChain: Optimized Prompts in a Chain</h2>
      <p>
        DSPy can optimize individual prompt steps that are then wrapped in a LangChain
        runnable. This lets you use LangChain's ecosystem (streaming, tracing, deployment)
        while benefiting from DSPy's automatic prompt optimization.
      </p>

      <SDKExample
        title="DSPy-Optimized Step Inside a LangChain Pipeline"
        tabs={{
          python: `import dspy
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_anthropic import ChatAnthropic

# 1. Build and optimize a DSPy module
dspy.configure(lm=dspy.LM("anthropic/claude-opus-4-6", api_key="..."))

class ExtractKeyFacts(dspy.Signature):
    """Extract factual claims from text, one per line."""
    text: str = dspy.InputField()
    facts: list[str] = dspy.OutputField(desc="List of factual claims found in the text")

class FactExtractor(dspy.Module):
    def __init__(self):
        self.extract = dspy.ChainOfThought(ExtractKeyFacts)

    def forward(self, text: str) -> list[str]:
        return self.extract(text=text).facts

# Assume we've already optimized this module
fact_extractor = FactExtractor()
# fact_extractor.load("optimized_fact_extractor.json")  # Load compiled version

# 2. Wrap DSPy module as a LangChain runnable
def dspy_extract_facts(inputs: dict) -> dict:
    facts = fact_extractor(text=inputs["text"])
    return {"text": inputs["text"], "facts": facts}

# 3. Build LangChain pipeline using the DSPy step
langchain_llm = ChatAnthropic(model="claude-opus-4-6")

pipeline = (
    RunnablePassthrough()
    | RunnableLambda(dspy_extract_facts)
    | RunnableLambda(lambda x: {
        "prompt": f"Summarize these facts:\\n" + "\\n".join(f"- {f}" for f in x["facts"])
    })
    | RunnableLambda(lambda x: langchain_llm.invoke(x["prompt"]))
    | StrOutputParser()
)

result = pipeline.invoke({"text": "Large language models have achieved..."})
print(result)`,
        }}
      />

      <h2>When to Go Framework-Free</h2>
      <p>
        Sometimes the right answer is no framework at all. The Anthropic SDK (or OpenAI SDK)
        provides everything you need for many use cases, with zero abstraction overhead.
      </p>

      <SDKExample
        title="Framework-Free: Direct SDK for Simple Pipelines"
        tabs={{
          python: `import anthropic
from typing import TypedDict

client = anthropic.Anthropic()

class RAGResult(TypedDict):
    answer: str
    sources: list[str]

def simple_rag(
    question: str,
    retrieve_fn,  # Your own retrieval logic — no framework needed
    model: str = "claude-opus-4-6",
) -> RAGResult:
    """
    A minimal RAG implementation with zero framework dependencies.
    Often all you need for straightforward use cases.
    """
    # Retrieve context using your preferred method
    docs = retrieve_fn(question, top_k=5)
    context = "\\n\\n".join(d["content"] for d in docs)
    sources = [d["source"] for d in docs]

    # Single LLM call — no framework overhead
    response = client.messages.create(
        model=model,
        max_tokens=2048,
        system="Answer questions based on provided context. Cite sources.",
        messages=[{
            "role": "user",
            "content": f"Context:\\n{context}\\n\\nQuestion: {question}"
        }],
    )

    return {
        "answer": response.content[0].text,
        "sources": sources,
    }

# Usage
result = simple_rag(
    question="What is the optimal chunk size for RAG?",
    retrieve_fn=my_vector_store.search,
)
print(result["answer"])`,
          typescript: `import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface RAGResult {
  answer: string
  sources: string[]
}

async function simpleRAG(
  question: string,
  retrieveFn: (q: string, topK: number) => Promise<Array<{ content: string; source: string }>>,
  model = 'claude-opus-4-6',
): Promise<RAGResult> {
  const docs = await retrieveFn(question, 5)
  const context = docs.map(d => d.content).join('\\n\\n')
  const sources = docs.map(d => d.source)

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: 'Answer questions based on provided context. Cite sources.',
    messages: [{
      role: 'user',
      content: Context:\\n\${context}\\n\\nQuestion: \${question},
    }],
  })

  const text = response.content[0]
  return {
    answer: text.type === 'text' ? text.text : '',
    sources,
  }
}`,
        }}
      />

      <h2>Minimal Footprint Architecture</h2>

      <SDKExample
        title="Selective Framework Use: Only What You Need"
        tabs={{
          python: `# Principle: use frameworks only for the layer where they add clear value
# Example: LlamaIndex for indexing only, raw SDK for generation

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.retrievers import VectorIndexRetriever
import anthropic

# LlamaIndex for what it does best: indexing and retrieval
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.llm = None  # Explicitly disable LlamaIndex LLM — we'll use Anthropic SDK directly

docs = SimpleDirectoryReader("./docs").load_data()
index = VectorStoreIndex.from_documents(docs)

retriever = VectorIndexRetriever(index=index, similarity_top_k=5)

# Anthropic SDK for what it does best: generation
anthropic_client = anthropic.Anthropic()

def answer_question(question: str) -> str:
    # LlamaIndex handles retrieval
    nodes = retriever.retrieve(question)
    context = "\\n\\n".join(n.get_content() for n in nodes)

    # Anthropic SDK handles generation — full control, no abstractions
    message = anthropic_client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        system="Answer based on the provided context only.",
        messages=[{"role": "user", "content": f"Context:\\n{context}\\n\\nQ: {question}"}],
    )
    return message.content[0].text

print(answer_question("What are the best practices for RAG chunking?"))`,
        }}
      />

      <PatternBlock
        name="Layer-Based Framework Assignment"
        category="Architecture"
        whenToUse="Multi-component systems where different layers have different requirements. Prevents any single framework's weaknesses from affecting the whole system."
      >
        <p>
          Assign frameworks to layers: <strong>indexing/retrieval</strong> (LlamaIndex or
          Haystack), <strong>orchestration/agents</strong> (LangGraph or custom), <strong>prompt
          optimization</strong> (DSPy, offline), <strong>observability</strong> (LangSmith or
          OpenTelemetry). Each layer can be replaced independently. Define clear interfaces
          between layers using Python protocols or TypeScript interfaces.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Define Your Own Interfaces at Layer Boundaries">
        <p>At every point where one framework hands off to another, define your own typed
        interface in your codebase — not a framework type. For example, define
        <code>RetrievedDocument(content: str, source: str, score: float)</code> as your
        internal type, and convert LlamaIndex <code>NodeWithScore</code> or LangChain
        <code>Document</code> objects at the boundary. This prevents framework types from
        leaking across your codebase and makes swapping implementations straightforward.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Monitor Dependency Footprint">
        <p>Each framework adds transitive dependencies. LangChain pulls in 50+ packages;
        LlamaIndex is similar. In constrained environments (Lambda functions, edge deployments,
        Docker images), audit your dependency tree with <code>pip show langchain | grep Requires</code>
        or <code>pipdeptree</code>. Consider whether the framework adds enough value to
        justify the footprint, or whether a targeted library (e.g., <code>chromadb</code>
        directly, <code>tiktoken</code> directly) is sufficient.</p>
      </NoteBlock>
    </article>
  )
}
