import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

export default function RAGFusion() {
  return (
    <div className="lesson-content">
      <h2>RAG Fusion</h2>

      <p>
        RAG Fusion extends multi-query retrieval with a principled algorithm for combining ranked
        result lists from multiple queries: Reciprocal Rank Fusion (RRF). Rather than simply
        concatenating and deduplicating results, RRF assigns a score to each document based on its
        rank in each individual result list, then sorts all documents by their fused score. Documents
        that consistently appear near the top across multiple queries receive the highest fused rank.
      </p>

      <ConceptBlock
        title="Reciprocal Rank Fusion (RRF)"
        definition="RRF is a rank aggregation algorithm that combines multiple ranked lists into a single fused ranking. Each document receives a score of 1/(k + rank) for each list it appears in, where k is a smoothing constant (typically 60). Final scores are summed across all lists. Documents that appear consistently at the top across multiple ranked lists accumulate high scores, making RRF robust to any single retrieval producing a poor ranking."
      />

      <h2>RAG Fusion Flow</h2>

      <p>
        The RAG Fusion pipeline has four stages: (1) generate multiple query variants from the
        original question, (2) retrieve the top-k documents for each query independently, (3) apply
        RRF to fuse the ranked lists into a single ranking, (4) pass the top-n fused results as
        context to the generator.
      </p>

      <SDKExample
        title="RRF Algorithm Implementation"
        tabs={{
          python: `from collections import defaultdict
from typing import Any

def reciprocal_rank_fusion(
    ranked_lists: list[list[tuple[str, Any]]],  # List of (doc_id, doc_content) lists
    k: int = 60,
) -> list[tuple[str, float, Any]]:
    """
    Fuse multiple ranked document lists using Reciprocal Rank Fusion.

    Args:
        ranked_lists: Each inner list is a ranked result set [(doc_id, content), ...]
                      ordered from most to least relevant.
        k: Smoothing constant. Higher k reduces the impact of top ranks.
           k=60 is the canonical value from the original RRF paper.

    Returns:
        List of (doc_id, rrf_score, content) sorted by descending RRF score.
    """
    scores: dict[str, float] = defaultdict(float)
    content_map: dict[str, Any] = {}

    for ranked_list in ranked_lists:
        for rank, (doc_id, content) in enumerate(ranked_list, start=1):
            scores[doc_id] += 1.0 / (k + rank)
            content_map[doc_id] = content  # Last write wins (content is same)

    fused = [
        (doc_id, score, content_map[doc_id])
        for doc_id, score in sorted(scores.items(), key=lambda x: x[1], reverse=True)
    ]
    return fused


# Example: three retrieval runs returning different orderings
list_a = [("doc1", "content1"), ("doc3", "content3"), ("doc2", "content2")]
list_b = [("doc2", "content2"), ("doc1", "content1"), ("doc5", "content5")]
list_c = [("doc1", "content1"), ("doc4", "content4"), ("doc2", "content2")]

fused = reciprocal_rank_fusion([list_a, list_b, list_c])
for doc_id, score, _ in fused:
    print(f"{doc_id}: RRF score = {score:.4f}")
# doc1 appears in all three lists at top positions → highest score
# doc2 appears in all three but lower → second
# doc3, doc4, doc5 appear once → lower scores`,
        }}
      />

      <h2>Full RAG Fusion Pipeline</h2>

      <SDKExample
        title="Complete RAG Fusion Pipeline"
        tabs={{
          python: `import anthropic
import voyageai
from qdrant_client import QdrantClient
from collections import defaultdict

anthropic_client = anthropic.Anthropic()
voyage_client = voyageai.Client()
qdrant = QdrantClient(url="http://localhost:6333")

QUERY_GEN_PROMPT = """Generate {n} search queries to retrieve documents for answering:
"{question}"

Write each query on a new line. Vary phrasing, perspective, and specificity.
Include the original question as one of them."""

def generate_queries(question: str, n: int = 4) -> list[str]:
    response = anthropic_client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=200,
        temperature=0.5,
        messages=[{
            "role": "user",
            "content": QUERY_GEN_PROMPT.format(n=n, question=question)
        }]
    )
    queries = [q.strip() for q in response.content[0].text.strip().split("\\n") if q.strip()]
    return queries[:n]

def retrieve_for_query(query: str, collection: str, top_k: int = 10) -> list[tuple[str, dict]]:
    """Retrieve top_k documents for a single query. Returns (doc_id, payload) pairs."""
    result = voyage_client.embed([query], model="voyage-3")
    hits = qdrant.search(
        collection_name=collection,
        query_vector=result.embeddings[0],
        limit=top_k,
        with_payload=True,
    )
    return [(hit.id, hit.payload) for hit in hits]

def rag_fusion(
    question: str,
    collection: str,
    num_queries: int = 4,
    top_k_per_query: int = 10,
    final_top_n: int = 5,
    rrf_k: int = 60,
) -> list[dict]:
    """Full RAG Fusion: multi-query retrieval + RRF reranking."""
    queries = generate_queries(question, n=num_queries)

    # Retrieve ranked lists for each query
    ranked_lists = []
    for q in queries:
        ranked_list = retrieve_for_query(q, collection, top_k=top_k_per_query)
        ranked_lists.append(ranked_list)

    # Apply RRF
    scores: dict[str, float] = defaultdict(float)
    payloads: dict[str, dict] = {}
    for ranked_list in ranked_lists:
        for rank, (doc_id, payload) in enumerate(ranked_list, start=1):
            scores[doc_id] += 1.0 / (rrf_k + rank)
            payloads[doc_id] = payload

    # Sort by fused score and return top N
    sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [
        {"id": doc_id, "rrf_score": score, "content": payloads[doc_id].get("content", "")}
        for doc_id, score in sorted_docs[:final_top_n]
    ]

# Usage
results = rag_fusion(
    "How do I configure connection pooling in PostgreSQL for a high-traffic application?",
    collection="tech-docs",
)
for r in results:
    print(f"Score: {r['rrf_score']:.4f} | {r['content'][:80]}...")`,
        }}
      />

      <h2>Tuning the RRF k Parameter</h2>

      <p>
        The constant <code>k=60</code> comes from the original 2009 RRF paper and works well in
        most settings. Lower values of k increase the relative weight of top-ranked results —
        a document ranked 1st receives a much higher score than one ranked 2nd. Higher values
        flatten the distribution, giving more equal weight across ranks. For RAG with high-quality
        vector retrieval, k=60 is a good default. For sparse retrieval or BM25 where rank 1 is
        not always reliable, slightly higher k (80–100) may give better results.
      </p>

      <BestPracticeBlock title="RAG Fusion Adds Latency — Parallelize Retrieval">
        <p>
          RAG Fusion runs multiple retrieval queries. If done sequentially, this multiplies your
          retrieval latency by the number of queries. Use <code>asyncio.gather</code> or a thread
          pool to fire all retrieval requests in parallel. Since vector database queries are
          I/O-bound, parallel execution brings the total retrieval latency close to a single
          query's latency, regardless of how many queries you generate.
        </p>
      </BestPracticeBlock>

      <NoteBlock
        title="RRF vs. score-based fusion"
        content="RRF uses rank positions rather than raw similarity scores. This makes it robust to score distribution differences between retrieval runs — you don't need to calibrate or normalise scores. It also degrades gracefully when one retrieval system is lower quality: a document must rank well across multiple lists to score highly, so one bad retrieval run does not dominate the final ranking."
      />
    </div>
  );
}
