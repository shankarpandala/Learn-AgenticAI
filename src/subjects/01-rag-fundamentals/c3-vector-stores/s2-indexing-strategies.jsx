import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const hnswPython = `import hnswlib
import numpy as np
import voyageai

voyage_client = voyageai.Client()

def embed(texts: list[str]) -> np.ndarray:
    result = voyage_client.embed(texts, model="voyage-3")
    return np.array(result.embeddings, dtype=np.float32)

# Sample documents
documents = [
    "HNSW builds a multi-layer navigable graph for fast ANN search.",
    "IVF partitions vector space into Voronoi cells for scalable search.",
    "Flat indexing does exact brute-force comparison of all vectors.",
    "Product quantisation compresses vectors to reduce memory usage.",
    "ScaNN is Google's library for scalable approximate nearest neighbours.",
]

# Generate embeddings
embeddings = embed(documents)
dim = embeddings.shape[1]  # typically 1024 for voyage-3

# --- HNSW Index ---
# M: number of connections per layer (higher = better recall, more memory)
# ef_construction: dynamic candidate list size during build (higher = better quality)
index = hnswlib.Index(space="cosine", dim=dim)
index.init_index(max_elements=10000, ef_construction=200, M=16)
index.add_items(embeddings, ids=list(range(len(documents))))

# ef at query time: higher = better recall, slower query
index.set_ef(50)

# Query
query_vec = embed(["How does approximate nearest neighbour search work?"])
labels, distances = index.knn_query(query_vec, k=3)

print("HNSW results:")
for label, dist in zip(labels[0], distances[0]):
    print(f"  [{dist:.4f}] {documents[label]}")

# Save and reload the index (supports incremental updates)
index.save_index("hnsw_index.bin")
loaded_index = hnswlib.Index(space="cosine", dim=dim)
loaded_index.load_index("hnsw_index.bin", max_elements=10000)`;

const faissIVFPython = `import faiss
import numpy as np
import voyageai

voyage_client = voyageai.Client()

def embed_batch(texts: list[str]) -> np.ndarray:
    result = voyage_client.embed(texts, model="voyage-3")
    vecs = np.array(result.embeddings, dtype=np.float32)
    # L2-normalize for cosine similarity via inner product
    faiss.normalize_L2(vecs)
    return vecs

# Generate a synthetic corpus for demonstration
# In production, embed your actual document chunks here
np.random.seed(42)
dim = 1024
n_docs = 10000

# Simulated embeddings (replace with real embed_batch calls)
corpus_vecs = np.random.randn(n_docs, dim).astype(np.float32)
faiss.normalize_L2(corpus_vecs)

# --- IVF Index ---
# nlist: number of Voronoi cells (clusters). Rule of thumb: sqrt(n_docs)
nlist = 100
quantizer = faiss.IndexFlatIP(dim)  # inner product (cosine after normalisation)
index = faiss.IndexIVFFlat(quantizer, dim, nlist, faiss.METRIC_INNER_PRODUCT)

# IVF requires a training phase to learn cluster centroids
index.train(corpus_vecs)
index.add(corpus_vecs)

# nprobe: how many clusters to search at query time
# Higher nprobe = better recall, slower query
index.nprobe = 10

# Query
query = np.random.randn(1, dim).astype(np.float32)
faiss.normalize_L2(query)
distances, indices = index.search(query, k=5)

print(f"IVF top-5 indices: {indices[0]}")
print(f"IVF top-5 scores:  {distances[0]}")

# Write to disk
faiss.write_index(index, "ivf_index.faiss")`;

export default function IndexingStrategies() {
  return (
    <div className="lesson-content">
      <h2>Indexing Strategies</h2>

      <p>
        The gap between a 10,000-vector corpus and a 100-million-vector corpus is not just
        one of scale — it requires fundamentally different index structures. Understanding
        the algorithms that underpin vector database indexes helps you make informed choices
        about the right tool for your scale, configure index parameters intelligently, and
        debug retrieval quality issues at their root.
      </p>

      <ConceptBlock
        term="Approximate Nearest-Neighbour (ANN) Index"
        definition="An ANN index is a data structure that enables fast retrieval of the k most similar vectors to a query without scanning every vector in the database. It achieves sub-linear query time by building a pre-computed structure during an indexing phase, accepting a small probability of missing the exact nearest neighbours in exchange for orders-of-magnitude faster queries. The trade-off between accuracy (recall) and speed is controlled by tunable parameters."
      />

      <h2>Flat (Exact) Search</h2>

      <p>
        The simplest index is no index at all: compute similarity between the query vector
        and every stored vector, then return the top-k. This is perfectly accurate (recall
        of 1.0) but scales as O(n × d) where n is number of vectors and d is dimensionality.
        On a modern CPU, a brute-force scan over 100,000 1024-dimensional float32 vectors
        takes ~50ms — acceptable for small corpora but impractical at millions of vectors.
      </p>
      <p>
        FAISS's <code>IndexFlatIP</code> (inner product) and <code>IndexFlatL2</code> (L2
        distance) implement exact search with BLAS-optimised matrix operations. Use exact
        search during development and evaluation because it gives you a ground-truth baseline
        to compare ANN recall against.
      </p>

      <h2>HNSW — Hierarchical Navigable Small World</h2>

      <p>
        HNSW is the dominant ANN algorithm in production RAG systems and is the default index
        type in Chroma, Qdrant, Weaviate, and pgvector. It builds a multi-layer graph where:
      </p>
      <ul>
        <li>Each vector is a node in the graph.</li>
        <li>Nodes are connected to their nearest neighbours with a fixed number of edges (M).</li>
        <li>Higher layers of the graph are sparse and enable long-range navigation; lower layers are dense for local refinement.</li>
        <li>Search starts at the entry point in the top layer and greedily descends to the query's neighbourhood.</li>
      </ul>
      <p>
        HNSW achieves recall@10 above 0.99 with query latencies under 1ms for million-vector
        corpora. Its key parameters are:
      </p>
      <ul>
        <li>
          <strong>M</strong> (connections per layer, default 16): Higher M improves recall and
          lowers query time but increases memory usage and build time. Values of 16–64 cover
          most production use cases.
        </li>
        <li>
          <strong>ef_construction</strong> (build-time search depth, default 100–200): Higher
          values produce a higher-quality graph at the cost of slower index building. Set it
          to at least 2× M.
        </li>
        <li>
          <strong>ef</strong> (query-time search depth): Controls the recall-latency trade-off
          at query time. Higher ef = better recall, slower query. ef=50 is a common default.
        </li>
      </ul>

      <NoteBlock
        type="intuition"
        title="HNSW memory usage"
        children="HNSW indexes are memory-resident. Each vector requires its raw float32 storage plus graph connectivity overhead — typically 1.5–2× the raw vector size. A 1-million-vector corpus of 1024-dimensional float32 vectors requires ~4GB for raw storage and ~6–8GB total for the HNSW index. Plan your infrastructure memory accordingly."
      />

      <h2>IVF — Inverted File Index</h2>

      <p>
        IVF (Inverted File) partitions the vector space into a fixed number of clusters
        (Voronoi cells) using k-means. At query time, only the nearest few clusters are
        searched, dramatically reducing the number of distance computations.
      </p>
      <p>
        IVF requires a training phase on a representative sample of your corpus to learn
        cluster centroids. Key parameters:
      </p>
      <ul>
        <li>
          <strong>nlist</strong> (number of clusters): A common rule of thumb is sqrt(n) where
          n is the corpus size. More clusters = higher potential precision but each cluster is
          smaller, so nprobe must be higher to maintain recall.
        </li>
        <li>
          <strong>nprobe</strong> (clusters to search at query time): Controls the recall-speed
          trade-off. nprobe=1 is fastest but lowest recall; nprobe=nlist degrades to exact
          search. nprobe of 5–20% of nlist is typical.
        </li>
      </ul>
      <p>
        IVF is more memory-efficient than HNSW for very large corpora (hundreds of millions of
        vectors) because the index structure is smaller. FAISS's <code>IndexIVFFlat</code>
        combines IVF partitioning with exact search within each cluster.
      </p>

      <h2>IVF-PQ — Quantisation for Massive Scale</h2>

      <p>
        For corpora that do not fit in RAM, Product Quantisation (PQ) compresses vectors by
        splitting them into sub-vectors and encoding each with a codebook. <code>IndexIVFPQ</code>
        in FAISS combines IVF partitioning with PQ compression, reducing memory by 8–32×
        at the cost of some recall. This enables billion-scale vector search on commodity
        hardware.
      </p>

      <h2>ScaNN and DiskANN</h2>

      <p>
        <strong>ScaNN</strong> (Google, open-source) applies asymmetric quantisation and
        achieves state-of-the-art recall-speed trade-offs on benchmarks. It is used in Google
        Search and Vertex AI Vector Search.
      </p>
      <p>
        <strong>DiskANN</strong> (Microsoft, open-source) stores the HNSW graph on disk with
        an SSD-optimised access pattern, enabling billion-scale ANN search with a small RAM
        footprint. It is the basis for Azure AI Search's vector capabilities.
      </p>

      <BestPracticeBlock title="Measure recall against exact search before deploying ANN">
        Build a ground-truth evaluation set of 100–500 queries with manually verified relevant
        documents. Run exact flat search and your ANN index, compare the top-10 results, and
        compute recall@10. Tune ef (HNSW) or nprobe (IVF) until recall@10 is above 0.95 for
        your corpus. Never ship an ANN index without measuring its recall — default parameters
        are starting points, not guarantees.
      </BestPracticeBlock>

      <h2>HNSW with hnswlib and IVF with FAISS</h2>

      <SDKExample
        title="HNSW Index with hnswlib"
        tabs={{ python: hnswPython }}
      />

      <SDKExample
        title="IVF Index with FAISS"
        tabs={{ python: faissIVFPython }}
      />

      <p>
        In practice, you rarely interact directly with these index libraries — your vector
        database (Chroma, Qdrant, Pinecone) manages the index for you. But understanding
        the underlying algorithms lets you configure your database's index parameters
        intelligently and interpret recall metrics correctly when tuning your RAG pipeline.
      </p>
    </div>
  );
}
