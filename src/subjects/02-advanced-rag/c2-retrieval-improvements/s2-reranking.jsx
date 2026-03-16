import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';
import WarningBlock from '../../../components/content/WarningBlock.jsx';

export default function Reranking() {
  return (
    <div className="lesson-content">
      <h2>Reranking</h2>

      <p>
        Vector similarity search is fast but approximate — it optimises for speed using
        Approximate Nearest Neighbor algorithms, and the query embedding captures only a
        compressed representation of meaning. Reranking is a second pass over the initial
        retrieval results that uses a more powerful but slower model to re-score each
        candidate document against the query, then re-sorts them. This two-stage approach
        combines the scalability of vector search with the accuracy of cross-encoders.
      </p>

      <ConceptBlock
        title="Cross-Encoder Reranking"
        definition="A cross-encoder is a model that takes a (query, document) pair as joint input and outputs a relevance score. Unlike bi-encoders (embedding models) which produce independent query and document vectors, cross-encoders attend to both texts simultaneously, enabling much finer-grained relevance assessment. They are too slow to run over an entire corpus but fast enough to re-score the 20–100 candidates returned by initial retrieval."
      />

      <h2>The Two-Stage Retrieval Pattern</h2>

      <p>
        Stage 1: retrieve a large candidate set (top 20–100) using fast vector search. Stage 2:
        re-score each candidate with a cross-encoder reranker and return the top 5–10 reranked
        results. The first stage prioritises recall (cast a wide net); the second stage prioritises
        precision (pick the best from the net). This pattern consistently outperforms either
        stage alone.
      </p>

      <SDKExample
        title="Cohere Rerank API"
        tabs={{
          python: `import cohere
import voyageai
from qdrant_client import QdrantClient

voyage_client = voyageai.Client()
cohere_client = cohere.Client()
qdrant = QdrantClient(url="http://localhost:6333")

def two_stage_retrieve(
    query: str,
    collection: str,
    initial_k: int = 30,    # Wide first-stage retrieval
    final_k: int = 5,       # Narrow final output after reranking
) -> list[dict]:
    """Two-stage retrieval: vector search + Cohere reranking."""

    # Stage 1: Vector retrieval (fast, recall-oriented)
    result = voyage_client.embed([query], model="voyage-3")
    hits = qdrant.search(
        collection_name=collection,
        query_vector=result.embeddings[0],
        limit=initial_k,
        with_payload=True,
    )
    candidates = [
        {"id": h.id, "content": h.payload.get("content", ""), "vector_score": h.score}
        for h in hits
    ]

    if not candidates:
        return []

    # Stage 2: Cohere reranking (slower, precision-oriented)
    rerank_response = cohere_client.rerank(
        query=query,
        documents=[c["content"] for c in candidates],
        model="rerank-english-v3.0",
        top_n=final_k,
    )

    # Map reranked indices back to candidates
    reranked = []
    for result in rerank_response.results:
        candidate = candidates[result.index]
        reranked.append({
            **candidate,
            "rerank_score": result.relevance_score,
        })

    return reranked

# Usage
results = two_stage_retrieve(
    "How do I configure connection timeout for gRPC clients?",
    collection="tech-docs",
)
for r in results:
    print(f"Rerank: {r['rerank_score']:.3f} | Vector: {r['vector_score']:.3f} | {r['content'][:60]}")`,
        }}
      />

      <h2>Local Cross-Encoder with sentence-transformers</h2>

      <p>
        For privacy-sensitive deployments or to avoid reranking API costs, run a cross-encoder
        locally. The <code>sentence-transformers</code> library provides several pre-trained
        cross-encoders optimised for relevance scoring.
      </p>

      <SDKExample
        title="Local Cross-Encoder Reranking"
        tabs={{
          python: `from sentence_transformers import CrossEncoder
import numpy as np

# Load once at startup — keep in memory
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
# Alternatives:
# "cross-encoder/ms-marco-MiniLM-L-12-v2"   — more accurate, slower
# "BAAI/bge-reranker-v2-m3"                 — multilingual, state-of-the-art

def local_rerank(
    query: str,
    candidates: list[dict],  # Each must have "content" key
    top_k: int = 5,
) -> list[dict]:
    """Rerank candidates using a local cross-encoder."""
    if not candidates:
        return []

    # Cross-encoder expects (query, document) pairs
    pairs = [(query, c["content"]) for c in candidates]
    scores = reranker.predict(pairs)

    # Attach scores and sort
    for candidate, score in zip(candidates, scores):
        candidate["rerank_score"] = float(score)

    return sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)[:top_k]

# Benchmark reranking latency
import time

query = "What is the capital of France?"
candidates = [
    {"content": "Paris is the capital and largest city of France."},
    {"content": "France is a country in Western Europe."},
    {"content": "The Eiffel Tower is located in Paris, France."},
    {"content": "Lyon is the third-largest city in France."},
    {"content": "France's president resides in the Élysée Palace in Paris."},
]

start = time.time()
results = local_rerank(query, candidates, top_k=3)
elapsed = (time.time() - start) * 1000

print(f"Reranking {len(candidates)} candidates took {elapsed:.1f}ms")
for r in results:
    print(f"Score: {r['rerank_score']:.3f} | {r['content'][:60]}")`,
        }}
      />

      <h2>When to Use Reranking</h2>

      <p>
        Reranking is most valuable when: (1) your initial retrieval returns many marginally
        relevant results and you need to identify the truly relevant ones; (2) you are dealing
        with queries that have multiple plausible interpretations and initial retrieval misses
        the intended meaning; (3) your documents have variable length and shorter, highly relevant
        chunks are being outscored by longer, partially relevant ones.
      </p>

      <p>
        Reranking is less valuable when: your initial retrieval already achieves high precision
        at top-5, your queries are short and unambiguous, or latency is a hard constraint
        and you cannot afford the extra 50–200ms.
      </p>

      <BestPracticeBlock title="Measure Reranking Latency in Your Environment">
        <p>
          Reranking latency depends on model size, number of candidates, and document length.
          A cross-encoder on 20 candidates of 256 tokens each typically adds 50–150ms on CPU,
          20–40ms on GPU. The Cohere Rerank API adds a network round-trip (typically 100–300ms).
          Measure in your actual deployment environment and decide whether the precision gain
          justifies the latency cost for your use case. For async or batch RAG pipelines, the
          latency cost is often irrelevant.
        </p>
      </BestPracticeBlock>

      <WarningBlock title="Reranking Does Not Fix Bad Retrieval">
        <p>
          Reranking can only re-order candidates already in the initial retrieval set. If the
          relevant document is not in your top-k initial results, no reranker can recover it.
          Set your initial retrieval k high enough (typically 20–50) to ensure the relevant
          document has a good chance of being included before reranking. If retrieval recall
          at k=50 is below 80%, fix your retrieval before adding a reranker.
        </p>
      </WarningBlock>

      <NoteBlock
        title="ColBERT: an alternative to cross-encoders"
        content="ColBERT (Contextualised Late Interaction over BERT) uses token-level embeddings rather than sentence-level vectors, enabling interaction between every query token and every document token at retrieval time. It is more accurate than bi-encoders and faster than full cross-encoders. The RAGatouille library provides a simple Python interface to ColBERT and is worth evaluating if you need high-accuracy retrieval and can afford a few hundred milliseconds of latency."
      />
    </div>
  );
}
