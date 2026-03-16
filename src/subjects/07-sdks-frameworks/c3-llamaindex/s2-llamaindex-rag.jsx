import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function LlamaIndexRag() {
  return (
    <article className="prose-content">
      <h2>LlamaIndex RAG</h2>
      <p>
        LlamaIndex is purpose-built for RAG. It provides production-ready abstractions for every
        stage of the pipeline: document loading, chunking, embedding, vector storage, retrieval,
        re-ranking, and generation. This guide covers building a full production RAG system.
      </p>

      <ConceptBlock term="Query Engine">
        <p>
          A <strong>QueryEngine</strong> in LlamaIndex is the end-to-end RAG pipeline abstraction.
          It combines a <strong>Retriever</strong> (finds relevant nodes) with a
          <strong>ResponseSynthesizer</strong> (generates the final answer from retrieved context).
          Query engines can be chained, routed, and nested for complex multi-index RAG.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="LlamaIndex RAG Pipeline"
        width={700}
        height={260}
        nodes={[
          { id: 'query', label: 'User Query', type: 'external', x: 60, y: 130 },
          { id: 'retriever', label: 'Retriever', type: 'tool', x: 200, y: 80 },
          { id: 'rerank', label: 'Reranker', type: 'agent', x: 360, y: 80 },
          { id: 'postproc', label: 'Postprocessors', type: 'agent', x: 360, y: 200 },
          { id: 'synth', label: 'Response\nSynthesizer', type: 'llm', x: 530, y: 130 },
          { id: 'answer', label: 'Final Answer', type: 'external', x: 650, y: 130 },
        ]}
        edges={[
          { from: 'query', to: 'retriever' },
          { from: 'retriever', to: 'rerank', label: 'top-k nodes' },
          { from: 'retriever', to: 'postproc' },
          { from: 'rerank', to: 'synth' },
          { from: 'postproc', to: 'synth' },
          { from: 'synth', to: 'answer' },
        ]}
      />

      <h2>Building a VectorStoreIndex</h2>

      <SDKExample
        title="In-Memory and Persistent Vector Index"
        tabs={{
          python: `from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
    Settings,
)
from llama_index.llms.anthropic import Anthropic
from llama_index.embeddings.openai import OpenAIEmbedding
import os

# Configure
Settings.llm = Anthropic(model="claude-opus-4-6")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# Option 1: In-memory index (development)
documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents, show_progress=True)

# Persist to disk
index.storage_context.persist(persist_dir="./storage")

# Option 2: Load from disk (production startup)
if os.path.exists("./storage"):
    storage_context = StorageContext.from_defaults(persist_dir="./storage")
    index = load_index_from_storage(storage_context)
else:
    documents = SimpleDirectoryReader("./data").load_data()
    index = VectorStoreIndex.from_documents(documents, show_progress=True)
    index.storage_context.persist(persist_dir="./storage")

# Option 3: Use a production vector store (Chroma)
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection("rag_docs")
vector_store = ChromaVectorStore(chroma_collection=collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

index = VectorStoreIndex.from_documents(
    documents,
    storage_context=storage_context,
    show_progress=True,
)`,
        }}
      />

      <h2>Query Engines</h2>

      <SDKExample
        title="Building and Configuring a Query Engine"
        tabs={{
          python: `from llama_index.core import VectorStoreIndex
from llama_index.core.postprocessor import (
    SimilarityPostprocessor,
    MetadataReplacementPostProcessor,
    LLMRerank,
)
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.response_synthesizers import get_response_synthesizer, ResponseMode

# Basic query engine — default settings
query_engine = index.as_query_engine(similarity_top_k=5)
response = query_engine.query("What are the main benefits of RAG?")
print(response.response)

# Access source nodes (which documents were used)
for node in response.source_nodes:
    print(f"Score: {node.score:.3f} | {node.node.get_content()[:100]}...")

# Custom query engine with fine-grained control
retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=10,  # Retrieve more, then re-rank
)

# Post-processors filter and re-rank retrieved nodes
postprocessors = [
    SimilarityPostprocessor(similarity_cutoff=0.7),  # Filter low-score nodes
    LLMRerank(                                         # LLM-based re-ranking
        choice_batch_size=5,
        top_n=3,                                       # Keep top 3 after re-rank
    ),
]

# Response synthesizer controls how the answer is generated
response_synthesizer = get_response_synthesizer(
    response_mode=ResponseMode.REFINE,  # Iteratively refine answer over chunks
    # Other modes: COMPACT, SIMPLE_SUMMARIZE, TREE_SUMMARIZE, GENERATION
)

custom_engine = RetrieverQueryEngine(
    retriever=retriever,
    node_postprocessors=postprocessors,
    response_synthesizer=response_synthesizer,
)

response = custom_engine.query("How does HNSW indexing work?")
print(response.response)`,
        }}
      />

      <h2>Hybrid Search</h2>
      <p>
        Hybrid search combines vector (semantic) and keyword (BM25) retrieval for better recall.
        LlamaIndex supports hybrid search natively with compatible vector stores.
      </p>

      <SDKExample
        title="Hybrid Retrieval"
        tabs={{
          python: `from llama_index.core import VectorStoreIndex
from llama_index.core.retrievers import (
    VectorIndexRetriever,
    BM25Retriever,
)
from llama_index.core.retrievers.fusion_retriever import QueryFusionRetriever
from llama_index.core.query_engine import RetrieverQueryEngine

# Build both retrievers from the same index
vector_retriever = VectorIndexRetriever(index=index, similarity_top_k=5)
bm25_retriever = BM25Retriever.from_defaults(index=index, similarity_top_k=5)

# Fuse results with reciprocal rank fusion (RRF)
fusion_retriever = QueryFusionRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    similarity_top_k=5,
    num_queries=4,           # Generate 4 query variants for better recall
    mode="reciprocal_rerank",
    use_async=True,
    verbose=True,
)

query_engine = RetrieverQueryEngine.from_args(fusion_retriever)
response = query_engine.query("What is the difference between BM25 and cosine similarity?")
print(response.response)`,
        }}
      />

      <h2>Streaming Responses</h2>

      <SDKExample
        title="Streaming Query Engine"
        tabs={{
          python: `from llama_index.core import VectorStoreIndex, Settings
from llama_index.llms.anthropic import Anthropic

Settings.llm = Anthropic(model="claude-opus-4-6")

index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(streaming=True)

# Streaming query
streaming_response = query_engine.query(
    "Explain the main components of a production RAG system."
)

# Print tokens as they arrive
for text in streaming_response.response_gen:
    print(text, end="", flush=True)
print()  # Newline after stream

# Access source nodes even in streaming mode
for node in streaming_response.source_nodes:
    print(f"Source: {node.node.metadata.get('file_name', 'unknown')}")`,
        }}
      />

      <h2>Chat Engine</h2>
      <p>
        The <strong>ChatEngine</strong> wraps a query engine with conversation memory, enabling
        multi-turn RAG conversations.
      </p>

      <SDKExample
        title="Multi-Turn RAG Chat"
        tabs={{
          python: `from llama_index.core import VectorStoreIndex
from llama_index.core.memory import ChatMemoryBuffer

index = VectorStoreIndex.from_documents(documents)

# CondenseQuestionChatEngine: rewrites follow-up questions to be self-contained
chat_engine = index.as_chat_engine(
    chat_mode="condense_question",
    memory=ChatMemoryBuffer.from_defaults(token_limit=4096),
    verbose=True,
)

# Multi-turn conversation
response1 = chat_engine.chat("What is RAG?")
print(f"Claude: {response1.response}")

response2 = chat_engine.chat("What are its main limitations?")
print(f"Claude: {response2.response}")  # Understands "its" refers to RAG

response3 = chat_engine.chat("How can I mitigate those?")
print(f"Claude: {response3.response}")

# Reset conversation history
chat_engine.reset()`,
        }}
      />

      <PatternBlock
        name="Sentence Window Retrieval"
        category="Retrieval Quality"
        whenToUse="When your documents have dense information and you want to retrieve precise sentences but include surrounding context for generation. Improves answer accuracy without bloating retrieval recall."
      >
        <p>
          Store individual sentences as nodes but include a window of surrounding sentences
          as metadata. Retrieve by sentence (fine-grained), then replace with the window
          (rich context) for generation. LlamaIndex's
          <code>SentenceWindowNodeParser</code> and <code>MetadataReplacementPostProcessor</code>
          implement this automatically.
        </p>
      </PatternBlock>

      <SDKExample
        title="Sentence Window RAG"
        tabs={{
          python: `from llama_index.core.node_parser import SentenceWindowNodeParser
from llama_index.core.postprocessor import MetadataReplacementPostProcessor
from llama_index.core import VectorStoreIndex
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import VectorIndexRetriever

# Parse: index sentences but store a window of context in metadata
node_parser = SentenceWindowNodeParser.from_defaults(
    window_size=3,          # Include 3 sentences before and after
    window_metadata_key="window",
    original_text_metadata_key="original_text",
)
nodes = node_parser.get_nodes_from_documents(documents)
index = VectorStoreIndex(nodes)

# At query time: retrieve sentences, replace with windows for generation
postprocessor = MetadataReplacementPostProcessor(
    target_metadata_key="window"
)
retriever = VectorIndexRetriever(index=index, similarity_top_k=5)
query_engine = RetrieverQueryEngine(
    retriever=retriever,
    node_postprocessors=[postprocessor],
)

response = query_engine.query("What are the trade-offs of hierarchical chunking?")
print(response.response)`,
        }}
      />

      <BestPracticeBlock title="Persist Embeddings, Not Just the Index">
        <p>When building production RAG systems, always persist both the vector store
        (embeddings) and the document store (original text and metadata) separately. This lets
        you update documents incrementally without re-embedding the entire corpus, and
        regenerate the index if you change embedding models without losing the original
        documents. Use LlamaIndex's <code>DocstoreStrategy</code> in the
        <code>IngestionPipeline</code> for automatic deduplication.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Measure Retrieval and Generation Separately">
        <p>RAG failures come from two places: bad retrieval (the right document wasn't fetched)
        and bad generation (the document was fetched but the answer is wrong). Measure these
        independently. LlamaIndex's <code>RetrieverEvaluator</code> measures hit rate and
        MRR for retrieval; <code>FaithfulnessEvaluator</code> and
        <code>RelevancyEvaluator</code> measure generation quality. Fix retrieval first —
        the LLM can't synthesise an answer from missing context.</p>
      </NoteBlock>
    </article>
  )
}
