import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const adaptiveRagPython = `import json
from anthropic import Anthropic
import voyageai
import chromadb

client = Anthropic()
voyage = voyageai.Client()
chroma = chromadb.PersistentClient(path="./vector_store")

def classify_query_complexity(query: str) -> dict:
    """
    Classify the query into one of three complexity levels:
    - simple: factual, single-hop, answerable from parametric memory
    - moderate: requires one retrieval step
    - complex: requires multi-step or iterative retrieval
    """
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=128,
        system='Classify query complexity. Return JSON: {"complexity": "simple"|"moderate"|"complex", "reasoning": "..."}',
        messages=[{
            "role": "user",
            "content": (
                f"Query: {query}\\n\\n"
                "Classify this query:\\n"
                "- simple: common knowledge, no retrieval needed\\n"
                "- moderate: needs one retrieval step from a knowledge base\\n"
                "- complex: needs multiple retrieval steps or cross-document synthesis"
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw)

def retrieve(query: str, collection_name: str, k: int = 5) -> list[dict]:
    result = voyage.embed([query], model="voyage-3")
    collection = chroma.get_collection(collection_name)
    res = collection.query(query_embeddings=[result.embeddings[0]], n_results=k)
    return [{"text": doc, "source": meta.get("source", "")}
            for doc, meta in zip(res["documents"][0], res["metadatas"][0])]

def single_step_rag(query: str, collection_name: str) -> str:
    """Standard single-step retrieval + generation."""
    chunks = retrieve(query, collection_name, k=5)
    context = "\\n\\n".join(f"[{i+1}] {c['text']}" for i, c in enumerate(chunks))
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="Answer using ONLY the provided context. Cite [1], [2], etc.",
        messages=[{"role": "user", "content": f"Context:\\n{context}\\n\\nQ: {query}"}],
    )
    return response.content[0].text

def iterative_rag(
    query: str,
    collection_name: str,
    max_iterations: int = 3,
) -> str:
    """
    Iterative retrieval: generate intermediate answer, identify knowledge gaps,
    retrieve for gaps, repeat until answer is complete.
    """
    all_chunks = []
    current_query = query

    for iteration in range(1, max_iterations + 1):
        new_chunks = retrieve(current_query, collection_name, k=3)
        all_chunks.extend(new_chunks)

        context = "\\n\\n".join(
            f"[{i+1}] {c['text']}" for i, c in enumerate(all_chunks[:8])
        )

        # Ask model if it has enough information or needs more
        check_response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=256,
            system='Return JSON: {"complete": true|false, "follow_up_query": "..." or null, "partial_answer": "..."}',
            messages=[{
                "role": "user",
                "content": (
                    f"Context so far:\\n{context}\\n\\n"
                    f"Original question: {query}\\n\\n"
                    "Do you have enough information to fully answer this question? "
                    "If not, what follow-up query would get the missing information?"
                )
            }],
        )
        raw = check_response.content[0].text.strip().strip("json").strip("")
        status = json.loads(raw)
        print(f"Iteration {iteration}: complete={status['complete']}")

        if status["complete"] or not status.get("follow_up_query"):
            break
        current_query = status["follow_up_query"]

    # Final generation
    final_context = "\\n\\n".join(
        f"[{i+1}] {c['text']}" for i, c in enumerate(all_chunks[:8])
    )
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=768,
        system="Synthesise a complete answer using all provided context. Cite [1], [2], etc.",
        messages=[{"role": "user", "content": f"Context:\\n{final_context}\\n\\nQuestion: {query}"}],
    )
    return response.content[0].text

def adaptive_rag(query: str, collection_name: str) -> dict:
    """
    Adaptive RAG: route to the appropriate retrieval strategy based on query complexity.
    """
    classification = classify_query_complexity(query)
    complexity = classification["complexity"]
    print(f"Query complexity: {complexity} — {classification['reasoning']}")

    if complexity == "simple":
        # Direct generation, no retrieval
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=256,
            messages=[{"role": "user", "content": query}],
        )
        answer = response.content[0].text
        strategy = "no_retrieval"

    elif complexity == "moderate":
        answer = single_step_rag(query, collection_name)
        strategy = "single_step"

    else:  # complex
        answer = iterative_rag(query, collection_name, max_iterations=3)
        strategy = "iterative"

    return {"answer": answer, "strategy": strategy, "complexity": complexity}

# Example
# result = adaptive_rag("What is 2+2?", "docs")           # → no_retrieval
# result = adaptive_rag("What is RAG?", "docs")            # → single_step
# result = adaptive_rag("Compare all RAG variants", "docs") # → iterative`;

export default function AdaptiveRAG() {
  return (
    <div className="lesson-content">
      <h2>Adaptive RAG</h2>

      <p>
        A one-size-fits-all retrieval strategy is inefficient. Simple factual queries
        ("What does API stand for?") do not need retrieval at all. Moderate queries need
        one retrieval step. Complex multi-part questions need iterative retrieval across
        multiple documents. Adaptive RAG routes each query to the retrieval strategy
        appropriate for its complexity, optimising for both quality and cost.
      </p>

      <ConceptBlock
        term="Adaptive RAG"
        definition="Adaptive RAG is a meta-framework that dynamically selects the retrieval strategy for each incoming query based on a query complexity classification. Simple queries skip retrieval and go directly to generation from parametric knowledge. Moderate queries use single-step standard RAG. Complex queries invoke iterative or multi-hop retrieval. The classifier routes queries to the right strategy, reducing unnecessary retrieval for simple queries and enabling thorough retrieval for complex ones."
      />

      <h2>The Three Retrieval Strategies</h2>

      <h3>Strategy 1 — No Retrieval (Parametric Generation)</h3>
      <p>
        Many queries are answerable from the model's training knowledge without any
        retrieval: common definitions, well-known facts, simple conversational responses,
        arithmetic. For these, retrieval adds latency and cost without improving quality.
        Adaptive RAG skips retrieval entirely for this class of queries.
      </p>

      <h3>Strategy 2 — Single-Step RAG</h3>
      <p>
        Most domain-specific queries about the knowledge base need exactly one retrieval
        step: embed the query, retrieve top-k chunks, generate an answer. This is the
        standard RAG pipeline. It handles the majority of production queries efficiently.
      </p>

      <h3>Strategy 3 — Iterative RAG</h3>
      <p>
        Complex questions — those requiring synthesis across multiple documents, multi-hop
        reasoning, or answers that depend on first answering sub-questions — need iterative
        retrieval. The model retrieves, generates a partial answer, identifies what is still
        missing, formulates a follow-up query, retrieves again, and repeats until it has
        enough information. This is slower and more expensive but produces significantly
        better answers for genuinely complex queries.
      </p>

      <h2>Query Complexity Classification</h2>

      <p>
        The adaptive routing decision is made by a query classifier that runs before
        retrieval. This classifier can be implemented as:
      </p>
      <ul>
        <li>
          <strong>Prompted LLM</strong>: Ask a fast model (Claude Haiku) to classify the
          query into simple/moderate/complex. Accurate but adds ~100ms latency.
        </li>
        <li>
          <strong>Fine-tuned classifier</strong>: Train a small text classifier on labelled
          query examples. Near-zero latency and lower cost per query. Requires a labelled
          dataset.
        </li>
        <li>
          <strong>Rule-based heuristics</strong>: Word count (short queries → no retrieval),
          presence of comparison words ("compare", "contrast", "versus" → iterative),
          question words ("what is" → single-step). Fast but brittle.
        </li>
      </ul>

      <h2>Benefits and Trade-offs</h2>

      <p>
        The primary benefit of Adaptive RAG is cost efficiency. A production system might
        find that 30% of queries are simple (skip retrieval), 60% are moderate (single-step),
        and only 10% are complex (iterative). Adaptive routing reduces embedding and vector
        search costs by 30% and eliminates 90% of expensive iterative retrieval overhead
        compared to always using iterative RAG.
      </p>
      <p>
        The trade-off is the classification step itself. Misclassifying a moderate query
        as simple produces a lower-quality answer. Misclassifying a simple query as complex
        wastes resources. Tune the classifier conservatively: when in doubt, classify
        upward (simple → moderate, moderate → complex) to preserve quality at the cost of
        slightly higher resource usage.
      </p>

      <NoteBlock
        type="tip"
        title="Use query logs to calibrate the classifier"
        children="After deploying adaptive RAG, log the complexity classification alongside user satisfaction signals (thumbs up/down, session continuation). Queries classified as 'simple' that received negative feedback are likely misclassified moderates — add them as training examples for the classifier. Over time, your classifier improves specifically for your query distribution."
      />

      <BestPracticeBlock title="Instrument each strategy separately in your metrics">
        Track quality metrics (faithfulness, answer relevancy) and performance metrics
        (latency, cost) separately for each routing path. If the no-retrieval path has low
        faithfulness, your classifier is routing too many queries there. If iterative is
        rarely used, consider whether complex queries are being misclassified as moderate.
        Separate instrumentation makes routing quality visible and improvable.
      </BestPracticeBlock>

      <h2>Adaptive RAG Implementation</h2>

      <SDKExample
        title="Adaptive RAG with Query Complexity Routing"
        tabs={{ python: adaptiveRagPython }}
      />

      <p>
        The implementation routes queries through three strategies based on a prompted
        complexity classifier. The iterative strategy uses a follow-up query loop, asking
        the model whether its accumulated context is sufficient and generating a refined
        query for missing information. The examples in the comments illustrate how the three
        routing paths handle qualitatively different queries — from trivial arithmetic to
        complex comparative analysis.
      </p>
    </div>
  );
}
