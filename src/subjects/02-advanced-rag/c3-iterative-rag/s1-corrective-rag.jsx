import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const cragPython = `import json
from anthropic import Anthropic
import voyageai
import httpx

client = Anthropic()
voyage = voyageai.Client()

# ---- Step 1: Retrieve and grade documents ----

def retrieve_chunks(query: str, collection, k: int = 5) -> list[dict]:
    result = voyage.embed([query], model="voyage-3")
    query_vec = result.embeddings[0]
    res = collection.query(query_embeddings=[query_vec], n_results=k)
    return [
        {"text": doc, "source": meta.get("source", ""), "score": 1 - dist}
        for doc, meta, dist in zip(
            res["documents"][0], res["metadatas"][0], res["distances"][0]
        )
    ]

def grade_document(query: str, document: str) -> str:
    """
    Grade a retrieved document for relevance.
    Returns 'relevant', 'partially_relevant', or 'irrelevant'.
    """
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=64,
        system='Grade document relevance. Return JSON: {"grade": "relevant" | "partially_relevant" | "irrelevant"}',
        messages=[{
            "role": "user",
            "content": (
                f"Question: {query}\\n\\n"
                f"Document: {document[:500]}\\n\\n"
                "Does this document contain information to answer the question?"
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw).get("grade", "irrelevant")

def web_search_fallback(query: str) -> list[dict]:
    """
    Fallback to web search when retrieval quality is low.
    In production, use Brave Search API, Tavily, or SerpAPI.
    """
    # Simplified stub — replace with real search API
    return [
        {
            "text": f"[Web search result for: {query}] — integrate real search API here.",
            "source": "web_search",
        }
    ]

# ---- Step 2: CRAG decision logic ----

def corrective_rag(query: str, collection) -> str:
    # 1. Retrieve initial documents
    chunks = retrieve_chunks(query, collection, k=5)

    # 2. Grade each retrieved document
    grades = []
    for chunk in chunks:
        grade = grade_document(query, chunk["text"])
        grades.append((chunk, grade))
        print(f"Grade: {grade} | {chunk['text'][:60]}...")

    # 3. Classify overall retrieval quality
    relevant = [c for c, g in grades if g == "relevant"]
    partially = [c for c, g in grades if g == "partially_relevant"]
    irrelevant_count = sum(1 for _, g in grades if g == "irrelevant")

    if len(relevant) >= 2:
        # Good retrieval: use relevant chunks directly
        action = "USE_RETRIEVED"
        final_chunks = relevant
    elif len(relevant) + len(partially) > 0 and irrelevant_count < 3:
        # Partial retrieval: use what we have + supplement with web search
        action = "USE_WITH_SUPPLEMENT"
        web_results = web_search_fallback(query)
        final_chunks = relevant + partially + web_results
    else:
        # Poor retrieval: fall back entirely to web search
        action = "FALLBACK_TO_WEB"
        final_chunks = web_search_fallback(query)

    print(f"\\nCRAG Action: {action}")

    # 4. Generate answer
    context = "\\n\\n".join(
        f"[{i+1}] Source: {c.get('source', 'unknown')}\\n{c['text']}"
        for i, c in enumerate(final_chunks[:5])
    )
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="Answer using only the provided context. Cite [1], [2], etc.",
        messages=[{
            "role": "user",
            "content": f"Context:\\n{context}\\n\\nQuestion: {query}"
        }],
    )
    return response.content[0].text

# Usage: corrective_rag("What is RAG?", collection)`;

export default function CorrectiveRAG() {
  return (
    <div className="lesson-content">
      <h2>Corrective RAG (CRAG)</h2>

      <p>
        Standard RAG passes retrieved documents to the LLM regardless of whether those
        documents are actually relevant. If retrieval fails — because the query is outside
        the knowledge base, because embeddings mismatch the document vocabulary, or because
        the corpus simply does not contain the answer — the LLM receives garbage context
        and either hallucinates or returns a confused response. Corrective RAG addresses
        this by grading retrieved documents before generation and taking a corrective action
        when quality is low.
      </p>

      <ConceptBlock
        term="Corrective RAG (CRAG)"
        definition="CRAG is an iterative RAG pattern that introduces a document grading step after retrieval. Each retrieved document is assessed for relevance to the query (relevant, partially relevant, or irrelevant). Based on the overall quality of retrieved documents, CRAG takes one of three actions: use the retrieved documents as-is, supplement them with a web search, or fall back entirely to live web search when retrieval quality is poor."
      />

      <h2>The Three CRAG Actions</h2>

      <h3>CORRECT — Use Retrieved Documents</h3>
      <p>
        When the majority of retrieved documents are graded as relevant, retrieval succeeded
        and the standard pipeline continues. The graded documents are passed to the LLM
        for generation. Optionally, irrelevant documents are filtered out before generation
        to reduce noise.
      </p>

      <h3>AMBIGUOUS — Supplement with Web Search</h3>
      <p>
        When retrieved documents are partially relevant — some contain useful information
        but not enough — CRAG supplements the local retrieval with a web search. The combined
        context (local documents + web results) gives the LLM more complete information.
        This action is appropriate when the knowledge base partially covers the topic but
        is outdated or incomplete.
      </p>

      <h3>INCORRECT — Full Web Search Fallback</h3>
      <p>
        When retrieved documents are consistently irrelevant, local retrieval has failed
        entirely. CRAG falls back to live web search using a search API (Brave Search,
        Tavily, SerpAPI) and uses the web results as the generation context. This handles
        queries about recent events, niche topics not in the knowledge base, or completely
        off-topic queries.
      </p>

      <h2>Document Grading with an LLM</h2>

      <p>
        The grading step uses an LLM to assess each retrieved document. This is essentially
        a binary or three-class classification: does this document contain information
        relevant to answering the query? A small, fast model (Claude Haiku) is suitable
        for this step because the classification task is simpler than generation.
      </p>
      <p>
        Grading adds n LLM calls (one per retrieved document) before generation. To minimise
        latency, run all grading calls in parallel. With 5 retrieved chunks and parallel
        grading, the latency overhead is approximately one Haiku call (~100ms) rather than
        5 sequential calls.
      </p>

      <h2>Knowledge Refinement</h2>

      <p>
        When documents are partially relevant, CRAG also applies a knowledge refinement
        step: strips irrelevant sentences from partially relevant documents before using
        them. This is the same extraction technique as contextual compression, applied
        specifically to documents that passed the grading threshold but contain noise.
      </p>

      <NoteBlock
        type="note"
        title="Web search integration options"
        children="For the web search fallback, Tavily is the most widely used option in RAG systems — it provides a clean JSON API designed for LLM integration, handles JavaScript-rendered pages, and returns relevant snippets rather than raw HTML. Brave Search API is a privacy-respecting alternative with good coverage. SerpAPI provides Google results. Budget for roughly $0.001–0.01 per search query depending on the provider and volume."
      />

      <BestPracticeBlock title="Grade documents in parallel to minimise latency">
        Grading 5 documents sequentially adds ~500ms to each query. Run all grading calls
        concurrently using asyncio.gather (Python) or Promise.all (TypeScript). The total
        latency overhead becomes ~100ms (one parallel batch) rather than ~500ms. This is
        the single most important optimisation for making CRAG acceptable in interactive
        applications.
      </BestPracticeBlock>

      <h2>Corrective RAG Implementation</h2>

      <SDKExample
        title="Corrective RAG with Document Grading"
        tabs={{ python: cragPython }}
      />

      <p>
        The implementation grades each retrieved document with Claude, classifies the overall
        retrieval quality into one of three action categories, and takes the appropriate
        corrective action before generation. The web search fallback is a stub — replace it
        with a real search API call in production. The decision logic is straightforward to
        extend: you can add more nuanced thresholds or additional actions based on your
        specific knowledge base characteristics and query distribution.
      </p>
    </div>
  );
}
