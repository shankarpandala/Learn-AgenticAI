import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

export default function HybridSearch() {
  return (
    <div className="lesson-content">
      <h2>Hybrid Search</h2>

      <p>
        Dense vector search excels at semantic similarity — it finds documents that mean the same
        thing even when they use different words. Sparse keyword search (BM25) excels at exact
        matches — it reliably finds documents containing specific product names, error codes,
        technical terms, or acronyms that embedding models may not handle well. Hybrid search
        combines both signals to capture the benefits of each.
      </p>

      <ConceptBlock
        title="Hybrid Search"
        definition="Hybrid search combines dense vector retrieval (embedding-based semantic search) with sparse keyword retrieval (BM25 or TF-IDF) to retrieve documents. Results from both systems are merged using a rank fusion algorithm — typically Reciprocal Rank Fusion — to produce a final ranked list that captures both semantic relevance and exact keyword matches."
      />

      <h2>Why Hybrid Outperforms Either Alone</h2>

      <p>
        Dense-only retrieval misses: exact product codes (SKU-7829), specific error messages
        ("ECONNREFUSED"), proper nouns that are rare in training data, and technical abbreviations.
        Sparse-only retrieval misses: paraphrases, synonyms, and conceptually related content that
        uses different vocabulary. Hybrid catches both classes of queries.
      </p>

      <p>
        Empirically, hybrid search consistently improves retrieval recall@5 by 5–15% over either
        method alone across diverse corpora. The improvement is largest for corpora that mix
        natural language prose with technical identifiers — a common pattern in enterprise
        knowledge bases.
      </p>

      <SDKExample
        title="Hybrid Search with BM25 + Dense Vectors"
        tabs={{
          python: `from rank_bm25 import BM25Okapi
import voyageai
import numpy as np
from collections import defaultdict

voyage_client = voyageai.Client()

class HybridRetriever:
    def __init__(self, documents: list[dict]):
        """
        documents: list of {"id": str, "content": str}
        """
        self.documents = documents
        self.doc_ids = [d["id"] for d in documents]
        self.contents = [d["content"] for d in documents]

        # Build BM25 index
        tokenized = [doc.lower().split() for doc in self.contents]
        self.bm25 = BM25Okapi(tokenized)

        # Build dense index (embed all documents)
        result = voyage_client.embed(self.contents, model="voyage-3")
        self.dense_vectors = np.array(result.embeddings)

    def dense_search(self, query: str, top_k: int = 20) -> list[tuple[str, int]]:
        """Returns (doc_id, rank) pairs sorted by cosine similarity."""
        result = voyage_client.embed([query], model="voyage-3")
        query_vec = np.array(result.embeddings[0])

        # Cosine similarity (vectors assumed normalised)
        scores = self.dense_vectors @ query_vec
        ranked_indices = np.argsort(scores)[::-1][:top_k]
        return [(self.doc_ids[i], rank + 1) for rank, i in enumerate(ranked_indices)]

    def sparse_search(self, query: str, top_k: int = 20) -> list[tuple[str, int]]:
        """Returns (doc_id, rank) pairs sorted by BM25 score."""
        tokenized_query = query.lower().split()
        scores = self.bm25.get_scores(tokenized_query)
        ranked_indices = np.argsort(scores)[::-1][:top_k]
        return [(self.doc_ids[i], rank + 1) for rank, i in enumerate(ranked_indices)]

    def hybrid_search(
        self,
        query: str,
        top_k: int = 5,
        rrf_k: int = 60,
        dense_weight: float = 0.7,
        sparse_weight: float = 0.3,
    ) -> list[dict]:
        """Combine dense and sparse with weighted RRF."""
        dense_results = self.dense_search(query, top_k=20)
        sparse_results = self.sparse_search(query, top_k=20)

        scores: dict[str, float] = defaultdict(float)
        for doc_id, rank in dense_results:
            scores[doc_id] += dense_weight * (1.0 / (rrf_k + rank))
        for doc_id, rank in sparse_results:
            scores[doc_id] += sparse_weight * (1.0 / (rrf_k + rank))

        sorted_ids = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        id_to_content = {d["id"]: d["content"] for d in self.documents}

        return [
            {"id": doc_id, "score": score, "content": id_to_content[doc_id]}
            for doc_id, score in sorted_ids[:top_k]
            if doc_id in id_to_content
        ]

# Usage
docs = [
    {"id": "d1", "content": "PostgreSQL connection pooling with PgBouncer improves throughput."},
    {"id": "d2", "content": "Database performance tuning for high-traffic web applications."},
    {"id": "d3", "content": "Error ECONNREFUSED when connecting to PostgreSQL on port 5432."},
]
retriever = HybridRetriever(docs)
results = retriever.hybrid_search("ECONNREFUSED postgres connection error")
for r in results:
    print(f"{r['id']} ({r['score']:.4f}): {r['content'][:60]}")`,
        }}
      />

      <h2>Hybrid Search with Weaviate</h2>

      <p>
        Weaviate supports hybrid search natively, combining BM25 and vector search with a single
        API call. The <code>alpha</code> parameter controls the blend: 0 = pure BM25, 1 = pure
        vector, 0.5 = equal weight. This is the simplest path to production hybrid search if you
        are already using Weaviate.
      </p>

      <SDKExample
        title="Weaviate Native Hybrid Search"
        tabs={{
          python: `import weaviate
import weaviate.classes as wvc

client = weaviate.connect_to_local()  # or connect_to_weaviate_cloud(...)

# Create collection with hybrid search support
if not client.collections.exists("Documents"):
    client.collections.create(
        name="Documents",
        vectorizer_config=wvc.config.Configure.Vectorizer.text2vec_voyageai(
            model="voyage-3",
        ),
        properties=[
            wvc.config.Property(name="content", data_type=wvc.config.DataType.TEXT),
            wvc.config.Property(name="source", data_type=wvc.config.DataType.TEXT),
        ]
    )

collection = client.collections.get("Documents")

def hybrid_search_weaviate(
    query: str,
    alpha: float = 0.75,  # 0=BM25 only, 1=vector only
    limit: int = 5,
) -> list[dict]:
    """
    alpha=0.75 gives 75% weight to vector search, 25% to BM25.
    Good default for most RAG applications.
    """
    results = collection.query.hybrid(
        query=query,
        alpha=alpha,
        limit=limit,
        return_metadata=wvc.query.MetadataQuery(score=True, explain_score=True),
    )
    return [
        {
            "content": obj.properties["content"],
            "source": obj.properties["source"],
            "score": obj.metadata.score,
        }
        for obj in results.objects
    ]

# Query with mixed semantic + keyword needs
results = hybrid_search_weaviate(
    "authentication error ECONNREFUSED service account",
    alpha=0.6,  # Slightly more weight to keyword match for this error-code query
)
for r in results:
    print(f"Score: {r['score']:.4f} | {r['content'][:80]}")

client.close()`,
        }}
      />

      <BestPracticeBlock title="Tune the Dense/Sparse Balance for Your Query Distribution">
        <p>
          The optimal alpha (dense/sparse blend) depends on your query distribution. Corpora with
          many exact-match queries (error codes, product IDs, names) benefit from higher sparse
          weight (alpha 0.5–0.6). Corpora dominated by natural language conceptual questions
          benefit from higher dense weight (alpha 0.7–0.8). Evaluate both extremes and the midpoint
          on your golden dataset's retrieval recall to find the sweet spot.
        </p>
      </BestPracticeBlock>

      <NoteBlock
        title="BM25 requires tokenisation consistency"
        content="BM25 is sensitive to tokenisation: if you tokenise documents differently at index time vs. query time (e.g., lowercasing, stemming, stopword removal), recall will drop. Use the same tokeniser for both. Most production hybrid search implementations handle this automatically, but when building BM25 from scratch (e.g., rank-bm25 library), ensure your query tokenisation pipeline exactly matches the indexing pipeline."
      />
    </div>
  );
}
