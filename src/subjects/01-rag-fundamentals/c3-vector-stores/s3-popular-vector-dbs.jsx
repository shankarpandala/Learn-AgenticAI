import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function PopularVectorDbs() {
  return (
    <article className="prose-content">
      <h2>Popular Vector Databases</h2>
      <p>
        The vector database ecosystem has exploded since 2022. Choosing the right database depends
        on your scale requirements, deployment constraints, query patterns, and team expertise.
        This section provides a practical comparison of the leading solutions.
      </p>

      <ConceptBlock term="Vector Database">
        <p>
          A vector database is a database optimized for storing high-dimensional vectors and
          performing approximate nearest neighbor (ANN) search at scale. Unlike relational databases
          that organize data in tables, vector DBs organize data by semantic similarity — enabling
          you to find the most relevant documents to a query embedding in milliseconds.
        </p>
      </ConceptBlock>

      <h2>Hosted / Cloud Solutions</h2>

      <h3>Pinecone</h3>
      <p>
        <strong>Best for:</strong> Teams that want zero operational overhead and a fully managed,
        production-grade service. Pinecone handles infrastructure, scaling, and replication.
      </p>
      <ul>
        <li>Serverless and pod-based deployment modes</li>
        <li>Metadata filtering with rich query language</li>
        <li>Namespace isolation for multi-tenant applications</li>
        <li>Hybrid search (sparse + dense) with integrated BM25</li>
        <li><strong>Pricing:</strong> Pay per query/storage; serverless mode minimizes idle costs</li>
      </ul>

      <CodeBlock language="python" filename="pinecone_example.py">
{`from pinecone import Pinecone, ServerlessSpec
import os

# Initialize Pinecone
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])

# Create an index (one-time setup)
index_name = "rag-knowledge-base"
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1024,  # Match your embedding model dimensions
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

index = pc.Index(index_name)

# Upsert vectors with metadata
vectors = [
    {
        "id": "doc-001",
        "values": [0.1, 0.2, ...],  # Your embedding vector
        "metadata": {
            "source": "handbook.pdf",
            "page": 42,
            "section": "Security Policies",
            "date": "2024-01-15"
        }
    }
]
index.upsert(vectors=vectors, namespace="policies")

# Query with metadata filter
results = index.query(
    vector=[0.15, 0.22, ...],  # Query embedding
    top_k=5,
    filter={"section": {"$eq": "Security Policies"}},
    namespace="policies",
    include_metadata=True
)

for match in results.matches:
    print(f"Score: {match.score:.3f} | {match.metadata['source']} p.{match.metadata['page']}")`}
      </CodeBlock>

      <h3>Weaviate Cloud</h3>
      <p>
        <strong>Best for:</strong> Teams wanting advanced hybrid search, GraphQL querying, and
        tight integration with multiple embedding providers.
      </p>
      <ul>
        <li>Native vector + BM25 hybrid search with configurable alpha weighting</li>
        <li>Multi-tenancy built-in</li>
        <li>Generative search modules (RAG built into the query)</li>
        <li>Rich GraphQL and gRPC query interface</li>
        <li>Self-hostable (open-source core)</li>
      </ul>

      <h2>Self-Hosted Open Source</h2>

      <h3>Qdrant</h3>
      <p>
        <strong>Best for:</strong> High-performance self-hosted deployments where you need full
        control. Written in Rust for exceptional speed and memory efficiency.
      </p>
      <ul>
        <li>HNSW indexing with excellent recall/speed trade-off</li>
        <li>Payload filtering with complex conditions</li>
        <li>Named vectors: store multiple vector types per document</li>
        <li>Scalar and product quantization for memory reduction</li>
        <li>gRPC API for production throughput</li>
      </ul>

      <CodeBlock language="python" filename="qdrant_example.py">
{`from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
)

# Connect to Qdrant (local Docker or cloud)
client = QdrantClient(url="http://localhost:6333")
# OR: client = QdrantClient(url="https://your-cluster.qdrant.tech", api_key="...")

# Create collection
client.recreate_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
)

# Upload documents
points = [
    PointStruct(
        id=i,
        vector=embedding,
        payload={
            "text": doc_text,
            "source": filename,
            "category": category
        }
    )
    for i, (embedding, doc_text, filename, category) in enumerate(documents)
]
client.upsert(collection_name="knowledge_base", points=points)

# Search with payload filter
results = client.search(
    collection_name="knowledge_base",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[FieldCondition(key="category", match=MatchValue(value="security"))]
    ),
    limit=5,
    with_payload=True
)

for hit in results:
    print(f"Score: {hit.score:.3f} | {hit.payload['source']}")`}
      </CodeBlock>

      <h3>Chroma</h3>
      <p>
        <strong>Best for:</strong> Local development, prototyping, and small-scale deployments.
        The simplest API for getting started with vector search.
      </p>

      <CodeBlock language="python" filename="chroma_example.py">
{`import chromadb
from chromadb.utils import embedding_functions

# Local persistent storage (perfect for development)
client = chromadb.PersistentClient(path="./chroma_db")

# Create collection with auto-embedding
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key="your-openai-api-key",
    model_name="text-embedding-3-small"
)

collection = client.get_or_create_collection(
    name="documents",
    embedding_function=openai_ef
)

# Add documents — Chroma handles embedding automatically
collection.add(
    documents=["RAG improves LLM accuracy", "Agents use tools to act"],
    ids=["doc1", "doc2"],
    metadatas=[{"source": "intro.md"}, {"source": "agents.md"}]
)

# Query — auto-embeds the query text
results = collection.query(
    query_texts=["how do language models retrieve information?"],
    n_results=2
)
print(results["documents"])`}
      </CodeBlock>

      <h3>pgvector (PostgreSQL Extension)</h3>
      <p>
        <strong>Best for:</strong> Teams already running PostgreSQL who want vector search without
        adding a new infrastructure component.
      </p>
      <ul>
        <li>Vectors stored in PostgreSQL columns alongside relational data</li>
        <li>Full SQL query language for complex joins and filters</li>
        <li>HNSW and IVFFlat indexing support</li>
        <li>Transactions, ACID guarantees, and familiar operational model</li>
        <li><strong>Trade-off:</strong> Not as fast as dedicated vector DBs at very high scale</li>
      </ul>

      <CodeBlock language="sql" filename="pgvector_schema.sql">
{`-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Store documents with embeddings
CREATE TABLE documents (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT NOT NULL,
    source      VARCHAR(255),
    category    VARCHAR(100),
    embedding   vector(1536),  -- OpenAI text-embedding-3-small dimensions
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Create HNSW index for fast ANN search
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Semantic search with metadata filter
SELECT
    id,
    content,
    source,
    1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM documents
WHERE category = 'security'
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 5;`}
      </CodeBlock>

      <h2>FAISS (Facebook AI Similarity Search)</h2>
      <p>
        FAISS is a C++ library with Python bindings for extremely fast in-memory vector search.
        It's not a database (no persistence, no metadata, no server) — it's a search index library.
        Use it when you need maximum throughput for in-memory search.
      </p>

      <h2>Selection Guide</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Database</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Best For</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Hosting</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Scale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Pinecone', 'Zero ops, production SaaS', 'Fully managed', 'Billion+ vectors'],
              ['Weaviate', 'Hybrid search, GraphQL', 'Managed or self-hosted', 'Large scale'],
              ['Qdrant', 'High perf, self-hosted', 'Self-hosted / cloud', 'Large scale'],
              ['Chroma', 'Prototyping, local dev', 'Local / server', 'Small-medium'],
              ['pgvector', 'Already use PostgreSQL', 'Self-hosted', 'Medium scale'],
              ['FAISS', 'Max throughput, in-memory', 'In-process library', 'Millions'],
            ].map(([db, best, hosting, scale]) => (
              <tr key={db} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{db}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{best}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{hosting}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{scale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BestPracticeBlock title="Start with Chroma, Graduate to Production DB">
        <p>For new projects: start with Chroma for rapid prototyping. Once you understand your
        data volume, query patterns, and latency requirements, migrate to Pinecone (if you want
        zero ops) or Qdrant (if you want self-hosted performance). The embedding model and
        chunking strategy matter far more than the vector DB choice at early stages.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Metadata Filtering Strategy">
        <p>Design your metadata schema before writing your first document. Metadata filters are
        the primary way to scope retrieval (e.g., filter by date, category, user, or tenant).
        It's much harder to add metadata after ingestion than to plan for it upfront.</p>
      </NoteBlock>
    </article>
  )
}
