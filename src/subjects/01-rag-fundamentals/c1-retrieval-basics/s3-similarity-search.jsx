import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const similaritySearchPython = `import numpy as np
import voyageai

voyage_client = voyageai.Client()

def embed_texts(texts: list[str]) -> list[list[float]]:
    result = voyage_client.embed(texts, model="voyage-3")
    return result.embeddings

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a_arr, b_arr = np.array(a), np.array(b)
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr)))

def top_k_search(query: str, documents: list[str], k: int = 3) -> list[dict]:
    """Brute-force nearest-neighbour search over a small corpus."""
    all_texts = [query] + documents
    embeddings = embed_texts(all_texts)
    query_vec = embeddings[0]
    doc_vecs = embeddings[1:]

    scored = [
        {"document": doc, "score": cosine_similarity(query_vec, vec)}
        for doc, vec in zip(documents, doc_vecs)
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:k]

# Example corpus
corpus = [
    "HNSW is a graph-based approximate nearest-neighbour algorithm.",
    "Cosine similarity measures the angle between two vectors.",
    "BM25 is a sparse retrieval method based on term frequency.",
    "Vector databases store and index high-dimensional embeddings.",
    "Python is a general-purpose programming language.",
]

results = top_k_search("How does vector similarity search work?", corpus, k=3)
for r in results:
    print(f"Score: {r['score']:.4f} | {r['document']}")`;

const similaritySearchTS = `import Anthropic from "@anthropic-ai/sdk";

// For TypeScript, we use OpenAI embeddings as an example
// In production, use Voyage AI or another provider
import OpenAI from "openai";

const openai = new OpenAI();

async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map((item) => item.embedding);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

async function topKSearch(
  query: string,
  documents: string[],
  k: number = 3
): Promise<Array<{ document: string; score: number }>> {
  const allEmbeddings = await embedTexts([query, ...documents]);
  const queryVec = allEmbeddings[0];
  const docVecs = allEmbeddings.slice(1);

  const scored = documents.map((doc, i) => ({
    document: doc,
    score: cosineSimilarity(queryVec, docVecs[i]),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

// Example usage
const corpus = [
  "HNSW is a graph-based approximate nearest-neighbour algorithm.",
  "Cosine similarity measures the angle between two vectors.",
  "BM25 is a sparse retrieval method based on term frequency.",
  "Vector databases store and index high-dimensional embeddings.",
  "Python is a general-purpose programming language.",
];

topKSearch("How does vector similarity search work?", corpus, 3).then(
  (results) => {
    results.forEach((r) =>
      console.log(Score: \${r.score.toFixed(4)} | \${r.document})
    );
  }
);`;

export default function SimilaritySearch() {
  return (
    <div className="lesson-content">
      <h2>Similarity Search</h2>

      <p>
        Once documents are embedded as vectors and a query has been embedded the same way,
        the retrieval problem reduces to a single question: which stored vectors are closest
        to the query vector? This is the nearest-neighbour problem, and solving it efficiently
        at scale is the core technical challenge of the retrieval step in RAG.
      </p>

      <ConceptBlock
        term="Nearest-Neighbour Search"
        definition="Nearest-neighbour (NN) search finds the k vectors in a collection that are most similar to a query vector, as measured by a distance or similarity metric. In RAG, k is typically 3–10, and the metric is almost always cosine similarity or dot product. Exact NN search compares the query against every stored vector; approximate NN (ANN) search trades a small accuracy loss for dramatically faster lookup."
      />

      <h2>Distance and Similarity Metrics</h2>

      <p>
        The choice of metric must match the way your embedding model was trained. Using the
        wrong metric produces meaningless rankings.
      </p>

      <h3>Cosine Similarity</h3>
      <p>
        Cosine similarity measures the cosine of the angle between two vectors. Its value
        ranges from -1 (opposite directions) to 1 (identical direction), with 0 indicating
        orthogonality. It is scale-invariant: two vectors pointing in the same direction
        receive a score of 1 regardless of their magnitudes. This makes it robust for text,
        where the raw length of a passage should not inflate its relevance score.
      </p>
      <p>
        The formula is: <code>cosine(A, B) = (A · B) / (‖A‖ × ‖B‖)</code>. Most embedding
        models are trained with contrastive objectives that reward high cosine similarity for
        related pairs, so cosine similarity is the natural choice.
      </p>

      <h3>Dot Product</h3>
      <p>
        The dot product of two vectors is the sum of their element-wise products. When
        vectors are L2-normalized (unit length), dot product and cosine similarity are
        mathematically equivalent. Many vector databases normalize vectors on insert and
        then use dot product internally because it is faster to compute in hardware-optimized
        matrix operations (BLAS routines, GPU GEMM kernels).
      </p>

      <h3>Euclidean Distance (L2)</h3>
      <p>
        L2 distance measures the straight-line distance between two points in high-dimensional
        space. It is sensitive to vector magnitude, which can cause longer documents (which
        often have larger-magnitude vectors) to appear less similar than they semantically are.
        Use it only when your embedding model was explicitly trained with an L2 objective.
      </p>

      <h2>Exact vs. Approximate Search</h2>

      <h3>Exact (Brute-Force) Search</h3>
      <p>
        Exact search computes the similarity between the query vector and every vector in the
        index, then returns the true top-k. It is perfectly accurate but scales as O(n × d)
        where n is the number of vectors and d is dimensionality. For corpora up to roughly
        100,000 vectors, exact search is often fast enough — a brute-force scan of 50,000
        1024-dimensional float32 vectors takes well under a second on a single CPU with NumPy.
        For millions of vectors, you need approximate methods.
      </p>

      <h3>Approximate Nearest-Neighbour (ANN)</h3>
      <p>
        ANN algorithms trade a small probability of returning a slightly sub-optimal result
        for dramatically faster lookup — often 10–100× faster than exact search at scale.
        The most widely deployed ANN algorithm in production RAG systems is HNSW (Hierarchical
        Navigable Small World), which structures vectors as a multi-layer navigable graph and
        achieves sub-millisecond query times on million-vector corpora. IVF (Inverted File
        Index) is another common approach, partitioning the vector space into clusters and
        restricting search to nearby clusters. Both are covered in detail in the Indexing
        Strategies section.
      </p>

      <NoteBlock
        type="intuition"
        title="When does approximate search matter?"
        children="For a typical enterprise RAG system with tens of thousands of document chunks, exact brute-force search is perfectly adequate and eliminates the complexity of ANN index management. Only reach for HNSW or IVF when your corpus exceeds roughly 500,000 vectors or when query latency requirements are tight (under 50ms P99). Most teams over-engineer this step early — start exact, measure, then optimize."
      />

      <h2>The Retrieval Pipeline in Practice</h2>

      <p>
        At query time, similarity search is just one step in a short sequence:
      </p>

      <ol>
        <li>Embed the user's query using the same model used to index documents.</li>
        <li>Issue a top-k query to the vector store, specifying k (e.g., 5–10).</li>
        <li>Receive the k most similar chunk IDs along with their similarity scores.</li>
        <li>Fetch the chunk text from storage (some vector DBs return text inline).</li>
        <li>Optionally rerank the results using a cross-encoder for higher precision.</li>
        <li>Assemble the top results into the context block for the LLM prompt.</li>
      </ol>

      <h2>Score Thresholds and Relevance Filtering</h2>

      <p>
        The raw similarity score from a nearest-neighbour search is always relative — it tells
        you which chunks are most similar to the query, but not whether any of them are actually
        relevant. A query about quantum physics asked against a cooking-recipes database will
        still return a top-k result, just with low scores.
      </p>
      <p>
        Setting a minimum score threshold (for example, only returning chunks with cosine
        similarity above 0.75) prevents the LLM from receiving irrelevant context. The right
        threshold varies by embedding model and corpus — calibrate it empirically by examining
        score distributions on a sample of queries with known relevant and irrelevant documents.
      </p>

      <BestPracticeBlock title="Always filter by a minimum similarity score">
        Never pass all top-k results to the LLM unconditionally. Add a score threshold so that
        queries with no genuinely relevant content return an empty context (allowing the LLM
        to say "I don't know") rather than a misleading low-quality context that encourages
        hallucination. Start with 0.70 cosine similarity as a baseline and adjust based on
        your evaluation results.
      </BestPracticeBlock>

      <h2>Implementing Brute-Force Similarity Search</h2>

      <p>
        The example below implements top-k similarity search directly with NumPy and the
        Voyage AI embedding API. This is suitable for corpora up to ~100,000 chunks and
        is the simplest possible implementation — useful for prototyping before introducing
        a vector database.
      </p>

      <SDKExample
        title="Top-K Similarity Search"
        tabs={{
          python: similaritySearchPython,
          typescript: similaritySearchTS,
        }}
      />

      <p>
        In production, you would replace this brute-force loop with a vector database query.
        The interface is nearly identical — you pass a query vector and receive ranked results
        — but the database handles efficient indexing so that even millions of vectors are
        searched in milliseconds.
      </p>
    </div>
  );
}
