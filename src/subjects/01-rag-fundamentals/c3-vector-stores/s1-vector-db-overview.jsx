import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx';

const vectorDbPython = `import chromadb
from chromadb.utils import embedding_functions
import voyageai

# Initialize Voyage AI embedding function
voyage_client = voyageai.Client()

# Use ChromaDB as our vector store (runs in-process, no server needed)
client = chromadb.PersistentClient(path="./vector_store")

# Create a collection (analogous to a table in a relational DB)
collection = client.get_or_create_collection(
    name="knowledge_base",
    metadata={"hnsw:space": "cosine"},  # use cosine similarity
)

# Upsert documents — ChromaDB will auto-embed via the embedding function
# or you can supply pre-computed embeddings
documents = [
    "Vector databases store high-dimensional embeddings for fast similarity search.",
    "HNSW is the most widely used approximate nearest-neighbour algorithm.",
    "Pinecone, Weaviate, Qdrant, and Chroma are popular vector database choices.",
    "Metadata filtering combines structured queries with vector similarity search.",
]

collection.upsert(
    ids=["doc_1", "doc_2", "doc_3", "doc_4"],
    documents=documents,
    metadatas=[
        {"topic": "databases", "source": "textbook"},
        {"topic": "algorithms", "source": "paper"},
        {"topic": "databases", "source": "blog"},
        {"topic": "retrieval", "source": "textbook"},
    ],
)

# Query the collection
results = collection.query(
    query_texts=["What algorithms power vector search?"],
    n_results=2,
    where={"topic": "algorithms"},  # metadata pre-filter
)

print("Top results:")
for doc, distance in zip(results["documents"][0], results["distances"][0]):
    print(f"  Distance: {distance:.4f} | {doc}")

# Get collection stats
print(f"\\nTotal vectors in collection: {collection.count()}")`;

const vectorDbTS = `import { ChromaClient } from "chromadb";

async function vectorDatabaseDemo() {
  const client = new ChromaClient();

  // Create or retrieve a collection
  const collection = await client.getOrCreateCollection({
    name: "knowledge_base",
    metadata: { "hnsw:space": "cosine" },
  });

  // Upsert documents with metadata
  await collection.upsert({
    ids: ["doc_1", "doc_2", "doc_3", "doc_4"],
    documents: [
      "Vector databases store high-dimensional embeddings for fast similarity search.",
      "HNSW is the most widely used approximate nearest-neighbour algorithm.",
      "Pinecone, Weaviate, Qdrant, and Chroma are popular vector database choices.",
      "Metadata filtering combines structured queries with vector similarity search.",
    ],
    metadatas: [
      { topic: "databases", source: "textbook" },
      { topic: "algorithms", source: "paper" },
      { topic: "databases", source: "blog" },
      { topic: "retrieval", source: "textbook" },
    ],
  });

  // Query with metadata filter
  const results = await collection.query({
    queryTexts: ["What algorithms power vector search?"],
    nResults: 2,
  });

  console.log("Top results:");
  results.documents[0].forEach((doc, i) => {
    const distance = results.distances?.[0][i];
    console.log(  Distance: \${distance?.toFixed(4)} | \${doc});
  });

  console.log(\\nTotal vectors: \${await collection.count()});
}

vectorDatabaseDemo();`;

export default function VectorDbOverview() {
  return (
    <div className="lesson-content">
      <h2>Vector DB Overview</h2>

      <p>
        Every production RAG system needs a place to store, index, and query embedding vectors
        at scale. A general-purpose relational database can store vectors as columns, but it
        cannot perform fast approximate nearest-neighbour (ANN) search — the query pattern
        that powers retrieval. Vector databases are purpose-built for exactly this workload.
      </p>

      <ConceptBlock
        term="Vector Database"
        definition="A vector database is a data store optimised for storing high-dimensional embedding vectors and executing approximate nearest-neighbour queries against them. Unlike relational databases that organise data in rows and columns and support exact equality lookups, vector databases build specialised index structures (HNSW, IVF, etc.) that enable sub-millisecond semantic search over millions of vectors."
      />

      <h2>How Vector Databases Differ from Traditional Databases</h2>

      <h3>Query Model</h3>
      <p>
        Relational databases answer queries like "find the row where id = 42" or "find all rows
        where status = 'active'". These are exact, predicate-based lookups. Vector databases
        answer queries like "find the 10 vectors most similar to this query vector" — a
        fundamentally different, proximity-based operation that has no direct analogue in SQL.
      </p>

      <h3>Index Structure</h3>
      <p>
        Relational databases use B-tree or hash indexes optimised for equality and range lookups
        on low-dimensional keys. Vector databases use graph-based (HNSW) or partition-based
        (IVF) indexes that support efficient navigation through high-dimensional space, trading
        a small probability of missing the exact nearest neighbour for orders-of-magnitude
        faster queries.
      </p>

      <h3>Hybrid Capability</h3>
      <p>
        Modern vector databases are not purely vector-only. They also support scalar metadata
        fields and compound filter queries, combining ANN vector search with SQL-like predicates.
        This hybrid capability is essential for the metadata filtering patterns covered in the
        previous section.
      </p>

      <ArchitectureDiagram
        title="Vector Database Architecture"
        nodes={[
          { id: "app", label: "Application", type: "external", x: 100, y: 200 },
          { id: "vdb", label: "Vector Database", type: "store", x: 400, y: 200 },
          { id: "idx", label: "ANN Index (HNSW)", type: "store", x: 650, y: 100 },
          { id: "meta", label: "Metadata Store", type: "store", x: 650, y: 300 },
          { id: "embed", label: "Embedding Model", type: "llm", x: 400, y: 50 },
        ]}
        edges={[
          { from: "app", to: "embed", label: "query text" },
          { from: "embed", to: "vdb", label: "query vector" },
          { from: "vdb", to: "idx", label: "ANN search" },
          { from: "vdb", to: "meta", label: "filter" },
          { from: "idx", to: "app", label: "top-k IDs + scores" },
        ]}
      />

      <h2>Major Vector Database Options</h2>

      <h3>Pinecone</h3>
      <p>
        Pinecone is a fully managed, serverless vector database with no infrastructure to
        manage. It scales automatically, supports real-time upserts, and provides a simple
        REST and SDK API. Pinecone is the lowest-friction option for teams that want production-
        ready vector search without operational overhead. Its main trade-off is vendor lock-in
        and per-vector pricing.
      </p>

      <h3>Weaviate</h3>
      <p>
        Weaviate is an open-source vector database with a GraphQL API and built-in support
        for multiple modalities (text, image, audio). It offers tight integration with many
        embedding models via its "modules" system and supports hybrid search (vector + BM25)
        natively. Available as self-hosted or managed cloud.
      </p>

      <h3>Qdrant</h3>
      <p>
        Qdrant is an open-source vector search engine written in Rust, built for high
        performance and low memory usage. It supports advanced filtering with a rich payload
        query language, multiple vector types per record, and sparse vectors for hybrid search.
        Excellent choice for teams running self-hosted infrastructure who need performance
        and flexibility.
      </p>

      <h3>ChromaDB</h3>
      <p>
        Chroma is an open-source, embeddable vector database designed for developer experience.
        It runs in-process (no server required) for development and prototyping, and supports
        a client-server mode for production. Its simple Python and TypeScript SDK makes it the
        fastest way to get a RAG prototype running. For large production workloads, consider
        migrating to Pinecone, Qdrant, or Weaviate.
      </p>

      <h3>pgvector</h3>
      <p>
        pgvector is a PostgreSQL extension that adds a vector column type and ANN index support.
        If you already run PostgreSQL, pgvector lets you store embeddings alongside relational
        data in the same database, eliminating the need for a separate vector store. It
        supports both HNSW and IVF indexes. Performance is excellent for corpora up to a few
        million vectors; at larger scales, dedicated vector databases have an edge.
      </p>

      <h2>When to Use a Vector Database</h2>

      <p>
        Not every RAG system needs a dedicated vector database. For corpora under ~50,000
        chunks, an in-memory NumPy-based brute-force search or ChromaDB in embedded mode is
        often sufficient and simpler to operate. A vector database becomes the right choice
        when:
      </p>

      <ul>
        <li>Your corpus exceeds 100,000 chunks and brute-force search becomes too slow.</li>
        <li>You need low-latency queries (under 100ms) at production scale.</li>
        <li>You require real-time updates (upsert without full rebuild).</li>
        <li>You need metadata filtering with compound conditions.</li>
        <li>Multiple services or teams need to share the same index.</li>
      </ul>

      <NoteBlock
        type="note"
        title="Start with ChromaDB or pgvector"
        children="Unless you are building at scale from day one, start with ChromaDB (zero infrastructure, great DX) or pgvector (if PostgreSQL is already in your stack). Both support the same core API patterns as Pinecone and Qdrant, so migrating later requires only a driver swap. Premature optimisation for a database you may not need yet is a common source of wasted engineering time."
      />

      <BestPracticeBlock title="Namespace or partition by tenant from the start">
        If your application serves multiple tenants or user groups, design namespacing into
        your vector store schema from day one. Chroma uses collections; Pinecone uses
        namespaces; Qdrant uses collections or payload filters. Without isolation, a single
        shared collection will mix tenant data and require expensive post-hoc filtering or
        re-indexing to separate.
      </BestPracticeBlock>

      <h2>Working with a Vector Database</h2>

      <SDKExample
        title="Vector Database Operations with ChromaDB"
        tabs={{
          python: vectorDbPython,
          typescript: vectorDbTS,
        }}
      />

      <p>
        The four core operations shown above — create collection, upsert documents, query
        with filter, count — are the same across all vector databases. The SDK APIs differ
        in naming and structure, but the conceptual model is identical. Mastering this pattern
        in ChromaDB transfers directly to Pinecone, Qdrant, or Weaviate with only a driver
        change.
      </p>
    </div>
  );
}
