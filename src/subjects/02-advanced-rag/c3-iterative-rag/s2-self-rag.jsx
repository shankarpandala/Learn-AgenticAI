import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const selfRagPython = `import json
from anthropic import Anthropic
import voyageai
import chromadb

client = Anthropic()
voyage = voyageai.Client()
chroma = chromadb.PersistentClient(path="./vector_store")

def retrieve(query: str, collection_name: str, k: int = 5) -> list[dict]:
    result = voyage.embed([query], model="voyage-3")
    collection = chroma.get_collection(collection_name)
    res = collection.query(query_embeddings=[result.embeddings[0]], n_results=k)
    return [
        {"text": doc, "source": meta.get("source", "")}
        for doc, meta in zip(res["documents"][0], res["metadatas"][0])
    ]

# ---- Self-RAG Special Tokens (simulated via prompting) ----

def decide_retrieval_needed(query: str) -> bool:
    """
    ISREL: Should we retrieve external documents for this query?
    Returns True if retrieval is needed.
    """
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=64,
        system='Decide if retrieval is needed. Return JSON: {"retrieve": true | false, "reason": "..."}',
        messages=[{
            "role": "user",
            "content": (
                f"Query: {query}\\n\\n"
                "Does this query require retrieving external documents to answer accurately? "
                "Answer false for simple factual questions, math, or conversational queries."
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw).get("retrieve", True)

def grade_relevance(query: str, document: str) -> bool:
    """
    ISREL: Is the retrieved document relevant to the query?
    """
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=64,
        system='Grade relevance. Return JSON: {"relevant": true | false}',
        messages=[{
            "role": "user",
            "content": f"Query: {query}\\n\\nDocument: {document[:400]}\\n\\nIs this document relevant?"
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw).get("relevant", False)

def generate_with_retrieval(query: str, chunks: list[dict]) -> str:
    """Generate answer grounded in retrieved context."""
    context = "\\n\\n".join(
        f"[{i+1}] {c['text']}" for i, c in enumerate(chunks)
    )
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="Answer using ONLY the provided context. Cite [1], [2], etc.",
        messages=[{
            "role": "user",
            "content": f"Context:\\n{context}\\n\\nQuestion: {query}"
        }],
    )
    return response.content[0].text

def generate_without_retrieval(query: str) -> str:
    """Generate answer from parametric knowledge when retrieval is not needed."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="Answer the question directly and accurately.",
        messages=[{"role": "user", "content": query}],
    )
    return response.content[0].text

def critique_answer(query: str, answer: str, context: str) -> dict:
    """
    ISSUP + ISUSE: Is the answer supported by context? Is it useful?
    """
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=128,
        system='Critique the answer. Return JSON: {"supported": true|false, "useful": true|false, "issue": "..."}',
        messages=[{
            "role": "user",
            "content": (
                f"Question: {query}\\n\\n"
                f"Context:\\n{context[:800]}\\n\\n"
                f"Answer: {answer}\\n\\n"
                "Is this answer fully supported by the context and useful to the user?"
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw)

def self_rag(query: str, collection_name: str, max_retries: int = 2) -> dict:
    """
    Simulated Self-RAG pipeline using prompted special-token decisions.
    """
    # 1. Decide if retrieval is needed
    needs_retrieval = decide_retrieval_needed(query)
    print(f"Retrieval needed: {needs_retrieval}")

    if not needs_retrieval:
        answer = generate_without_retrieval(query)
        return {"answer": answer, "mode": "no_retrieval", "attempts": 1}

    # 2. Retrieve and filter for relevance
    chunks = retrieve(query, collection_name, k=5)
    relevant_chunks = [c for c in chunks if grade_relevance(query, c["text"])]
    print(f"Relevant chunks: {len(relevant_chunks)}/{len(chunks)}")

    if not relevant_chunks:
        answer = generate_without_retrieval(query)
        return {"answer": answer, "mode": "retrieval_failed", "attempts": 1}

    # 3. Generate and critique
    for attempt in range(1, max_retries + 2):
        answer = generate_with_retrieval(query, relevant_chunks)
        context = " ".join(c["text"] for c in relevant_chunks)
        critique = critique_answer(query, answer, context)

        print(f"Attempt {attempt}: supported={critique['supported']}, useful={critique['useful']}")

        if critique["supported"] and critique["useful"]:
            return {"answer": answer, "mode": "retrieval_grounded", "attempts": attempt}

        if attempt <= max_retries:
            print(f"Retrying — issue: {critique.get('issue', 'unknown')}")

    return {"answer": answer, "mode": "best_effort", "attempts": max_retries + 1}`;

export default function SelfRAG() {
  return (
    <div className="lesson-content">
      <h2>Self-RAG</h2>

      <p>
        Standard and corrective RAG always retrieve documents for every query, even when
        retrieval is unnecessary or harmful. Self-RAG introduces a more sophisticated
        approach: the model itself decides whether to retrieve, evaluates the retrieved
        documents, and critiques its own generated response — all through special tokens
        inserted into the generation process. The result is a system that retrieves
        adaptively rather than unconditionally.
      </p>

      <ConceptBlock
        term="Self-RAG"
        definition="Self-RAG is a framework where a language model is fine-tuned to generate special reflection tokens alongside its output. These tokens encode four decisions: whether to retrieve (Retrieve), whether each retrieved document is relevant (ISREL), whether the generated response is supported by the retrieved documents (ISSUP), and whether the response is useful to the user (ISUSE). The model uses these tokens to control its own retrieval and to select the best among multiple generated responses."
      />

      <h2>The Four Reflection Tokens</h2>

      <h3>Retrieve — Should I retrieve?</h3>
      <p>
        Not every query benefits from retrieval. Simple arithmetic, common knowledge, and
        conversational responses do not need documents. The Retrieve token lets the model
        decide per-query whether to invoke the retrieval system. This reduces unnecessary
        retrieval overhead and avoids cases where retrieved documents confuse rather than
        help.
      </p>

      <h3>ISREL — Is this document relevant?</h3>
      <p>
        For each retrieved document, the model generates an ISREL token assessing whether
        the document contains information relevant to the query. Irrelevant documents are
        filtered out before generation, preventing noise from entering the context.
      </p>

      <h3>ISSUP — Is my answer supported?</h3>
      <p>
        After generating a response segment grounded in a specific document, the model
        generates an ISSUP token assessing whether the generated text is actually supported
        by that document. This is a self-consistency check against hallucination — the model
        flags when it has generated content beyond what the document supports.
      </p>

      <h3>ISUSE — Is this response useful?</h3>
      <p>
        The model also generates an ISUSE token rating the overall usefulness of its
        response. When multiple response candidates are generated (one per relevant
        document), ISUSE scores are used to select the best one.
      </p>

      <h2>Fine-Tuning vs. Prompted Self-RAG</h2>

      <p>
        The original Self-RAG paper trains a custom model to generate reflection tokens as
        part of its output — the tokens are built into the model's vocabulary via supervised
        fine-tuning on data where a teacher model annotated when retrieval was needed and
        which responses were grounded. This requires a fine-tuning dataset and training run.
      </p>
      <p>
        For teams without fine-tuning resources, the reflection token decisions can be
        approximated with prompted LLM calls — separate API calls that ask the model to
        make each decision. This is slower and more expensive than fine-tuned token
        generation but requires no training and works with any capable base model. The
        code example below implements this prompted approach.
      </p>

      <h2>Self-RAG vs. CRAG</h2>

      <p>
        Both Self-RAG and CRAG add document quality evaluation and retrieval fallbacks.
        The key differences are:
      </p>
      <ul>
        <li>
          Self-RAG operates at the token/segment level — the model generates a piece of
          its response, then reflects on whether it needs retrieval for the next piece.
          CRAG operates at the query level — retrieve, then grade all documents at once.
        </li>
        <li>
          Self-RAG can interleave retrieval with generation, retrieving different documents
          for different parts of a long response. CRAG performs a single retrieval at the
          start.
        </li>
        <li>
          Self-RAG's full power requires a fine-tuned model. CRAG works well with prompted
          approaches using standard models.
        </li>
      </ul>

      <NoteBlock
        type="historical"
        title="Self-RAG paper"
        children='Self-RAG was introduced in "Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection" (Asai et al., 2023). The fine-tuned Llama 2 variant achieved strong performance on knowledge-intensive tasks while generating fewer hallucinated facts than standard RAG. The paper is notable for demonstrating that a model can be taught meta-cognitive skills (knowing when it knows, knowing when it needs help) through careful fine-tuning.'
      />

      <BestPracticeBlock title="Start with prompted Self-RAG before committing to fine-tuning">
        Implementing prompted Self-RAG (using LLM calls for each reflection decision) lets
        you validate the architecture's benefit on your use case before investing in fine-
        tuning. If the prompted version improves faithfulness and reduces unnecessary
        retrievals by more than 20%, the investment in fine-tuning a custom model is likely
        justified. If the gains are marginal, CRAG or standard RAG with a good threshold
        may be sufficient.
      </BestPracticeBlock>

      <h2>Simulated Self-RAG with Prompting</h2>

      <SDKExample
        title="Self-RAG Pipeline via Prompted Reflection"
        tabs={{ python: selfRagPython }}
      />

      <p>
        The implementation above approximates Self-RAG's four reflection token decisions
        with separate prompted LLM calls. The pipeline decides whether retrieval is needed,
        grades document relevance, generates the answer, and critiques it for support and
        usefulness — retrying if the critique fails. While not as efficient as a fine-tuned
        model generating tokens inline, this approach captures the core Self-RAG logic and
        is a practical starting point for teams using frontier models via API.
      </p>
    </div>
  );
}
