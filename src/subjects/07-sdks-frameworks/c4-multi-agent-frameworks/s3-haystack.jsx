import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'

export default function Haystack() {
  return (
    <article className="prose-content">
      <h2>Haystack</h2>
      <p>
        Haystack (by deepset) is a production-ready LLM framework built around the concept of
        composable <strong>Pipelines</strong>. Each pipeline is a directed acyclic graph of
        <strong>Components</strong> — modular, typed building blocks for document processing,
        retrieval, generation, and ranking. Haystack emphasizes testability, observability,
        and deployment readiness.
      </p>

      <ConceptBlock term="Pipeline">
        <p>
          A <strong>Pipeline</strong> in Haystack is a directed graph connecting components
          via typed input/output connections. Components declare their input and output types;
          Haystack validates connections at build time and routes data between components at
          run time. Pipelines can branch (fan-out) and merge (fan-in) for parallel execution.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Component">
        <p>
          A <strong>Component</strong> is a Python class decorated with <code>@component</code>
          that implements a <code>run()</code> method. Components are stateless and reusable.
          Haystack ships with components for: document loaders, embedders, vector store
          retrievers, rerankers, generators, and output parsers. Custom components follow
          the same interface.
        </p>
      </ConceptBlock>

      <h2>Installation</h2>

      <SDKExample
        title="Installing Haystack 2.x"
        tabs={{
          python: `# Core Haystack 2.x
pip install haystack-ai

# With Anthropic integration
pip install haystack-ai anthropic-haystack

# With common document processors
pip install haystack-ai trafilatura pypdf sentence-transformers`,
        }}
      />

      <h2>RAG Pipeline with Haystack</h2>

      <SDKExample
        title="Full RAG Pipeline"
        tabs={{
          python: `from haystack import Pipeline, Document
from haystack.components.builders import PromptBuilder
from haystack.components.generators import AnthropicGenerator
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.embedders import (
    SentenceTransformersDocumentEmbedder,
    SentenceTransformersTextEmbedder,
)
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.components.rankers import MetaFieldRanker

# 1. Set up Document Store and index documents
document_store = InMemoryDocumentStore()

# Prepare documents
docs = [
    Document(
        content="RAG combines retrieval with generation for grounded responses.",
        meta={"source": "rag_paper.pdf", "page": 1},
    ),
    Document(
        content="Vector databases store embeddings for semantic similarity search.",
        meta={"source": "vector_db_guide.pdf", "page": 3},
    ),
    Document(
        content="LlamaIndex and LangChain both support RAG pipeline construction.",
        meta={"source": "framework_comparison.pdf", "page": 7},
    ),
]

# Indexing pipeline: embed and store documents
indexing_pipeline = Pipeline()
indexing_pipeline.add_component(
    "embedder",
    SentenceTransformersDocumentEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
)
indexing_pipeline.add_component("writer", DocumentWriter(document_store=document_store))
indexing_pipeline.connect("embedder", "writer")

indexing_pipeline.run({"embedder": {"documents": docs}})

# 2. RAG query pipeline
rag_template = """
Answer the question based ONLY on the given context.
If the context doesn't contain the answer, say "I don't know."

Context:
{% for doc in documents %}
  - {{ doc.content }}
{% endfor %}

Question: {{ question }}
Answer:
"""

rag_pipeline = Pipeline()

# Add components
rag_pipeline.add_component(
    "query_embedder",
    SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
)
rag_pipeline.add_component(
    "retriever",
    InMemoryEmbeddingRetriever(document_store=document_store, top_k=5)
)
rag_pipeline.add_component(
    "ranker",
    MetaFieldRanker(meta_field="source")  # Optional: rerank by metadata
)
rag_pipeline.add_component("prompt_builder", PromptBuilder(template=rag_template))
rag_pipeline.add_component(
    "llm",
    AnthropicGenerator(model="claude-opus-4-6", api_key=Secret.from_env_var("ANTHROPIC_API_KEY"))
)

# Connect components: data flows through the graph
rag_pipeline.connect("query_embedder.embedding", "retriever.query_embedding")
rag_pipeline.connect("retriever.documents", "ranker.documents")
rag_pipeline.connect("ranker.documents", "prompt_builder.documents")
rag_pipeline.connect("prompt_builder.prompt", "llm.prompt")

# 3. Run the pipeline
result = rag_pipeline.run({
    "query_embedder": {"text": "What is RAG?"},
    "prompt_builder": {"question": "What is RAG?"},
})

print(result["llm"]["replies"][0])`,
        }}
      />

      <h2>Async Support and Streaming</h2>

      <SDKExample
        title="Async Pipeline Execution"
        tabs={{
          python: `from haystack import AsyncPipeline
from haystack.components.generators import AnthropicGenerator
from haystack.components.builders import PromptBuilder

# AsyncPipeline runs components concurrently when possible
async_pipeline = AsyncPipeline()
async_pipeline.add_component("prompt_builder", PromptBuilder(template="Answer: {{ question }}"))
async_pipeline.add_component(
    "llm",
    AnthropicGenerator(model="claude-opus-4-6", streaming_callback=print_streaming_chunk)
)
async_pipeline.connect("prompt_builder.prompt", "llm.prompt")

import asyncio

async def run_rag(question: str):
    result = await async_pipeline.run_async({
        "prompt_builder": {"question": question}
    })
    return result["llm"]["replies"][0]

# Run multiple queries in parallel
questions = [
    "What is RAG?",
    "How do vector databases work?",
    "Compare LangChain and LlamaIndex.",
]

answers = asyncio.run(asyncio.gather(*[run_rag(q) for q in questions]))
for q, a in zip(questions, answers):
    print(f"Q: {q}\\nA: {a}\\n")`,
        }}
      />

      <h2>Custom Components</h2>

      <SDKExample
        title="Building a Custom Haystack Component"
        tabs={{
          python: `from haystack import component
from haystack.core.component.types import Variadic
from typing import List, Optional

@component
class KeywordFilter:
    """
    Filters documents by required or excluded keywords.
    Custom components must implement run() with typed I/O.
    """
    def __init__(self, required_keywords: List[str] = None, exclude_keywords: List[str] = None):
        self.required_keywords = required_keywords or []
        self.exclude_keywords = exclude_keywords or []

    @component.output_types(documents=List[Document], filtered_count=int)
    def run(self, documents: List[Document]) -> dict:
        """
        Filter documents by keywords.

        Args:
            documents: Input documents to filter.

        Returns:
            documents: Filtered list of documents.
            filtered_count: Number of documents removed.
        """
        original_count = len(documents)
        filtered = []

        for doc in documents:
            content_lower = doc.content.lower()

            # Check required keywords (ALL must be present)
            if self.required_keywords:
                if not all(kw.lower() in content_lower for kw in self.required_keywords):
                    continue

            # Check excluded keywords (NONE must be present)
            if any(kw.lower() in content_lower for kw in self.exclude_keywords):
                continue

            filtered.append(doc)

        return {
            "documents": filtered,
            "filtered_count": original_count - len(filtered)
        }

# Use in a pipeline
pipeline = Pipeline()
pipeline.add_component("retriever", InMemoryEmbeddingRetriever(document_store=store, top_k=10))
pipeline.add_component(
    "filter",
    KeywordFilter(required_keywords=["production"], exclude_keywords=["deprecated"])
)
pipeline.add_component("prompt_builder", PromptBuilder(template=template))
pipeline.add_component("llm", AnthropicGenerator(model="claude-opus-4-6"))

pipeline.connect("retriever.documents", "filter.documents")
pipeline.connect("filter.documents", "prompt_builder.documents")
pipeline.connect("prompt_builder.prompt", "llm.prompt")`,
        }}
      />

      <PatternBlock
        name="Hybrid Retrieval Pipeline"
        category="RAG"
        whenToUse="Production RAG where recall matters. Combines sparse (BM25) and dense (embedding) retrieval, then reranks with a cross-encoder for precision. Higher latency but significantly better retrieval quality."
      >
        <p>
          Run <code>BM25Retriever</code> and <code>EmbeddingRetriever</code> in parallel branches,
          merge their document lists with a <code>DocumentJoiner</code> component (reciprocal
          rank fusion), then pass through a <code>SentenceTransformersDiversityRanker</code>
          for final reranking. Haystack's pipeline fan-out/fan-in handles the parallel branches
          automatically.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Serialize Pipelines for Deployment">
        <p>Haystack pipelines can be serialized to YAML for version control and deployment
        configuration: <code>pipeline.dump()</code> / <code>Pipeline.load()</code>.
        Store pipeline definitions in your repository alongside code, enabling reproducible
        deployments and easy A/B testing of different pipeline configurations without
        code changes. Use environment variables for all secrets and model names.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Haystack vs LangChain">
        <p>Haystack excels at production RAG pipelines with strong typing, built-in validation,
        and serialization. LangChain has a larger ecosystem of integrations and more flexible
        agent patterns. Choose Haystack when: you need pipeline serialization, strict type
        safety, or deepset's enterprise support. Choose LangChain when: you need the widest
        tool/model integration options or LangGraph for complex agent workflows.</p>
      </NoteBlock>
    </article>
  )
}
