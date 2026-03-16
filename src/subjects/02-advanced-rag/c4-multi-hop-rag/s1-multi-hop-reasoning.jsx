import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const multiHopPython = `import json
from anthropic import Anthropic
import voyageai
import chromadb

client = Anthropic()
voyage = voyageai.Client()
chroma = chromadb.PersistentClient(path="./vector_store")

def retrieve(query: str, collection_name: str, k: int = 3) -> list[dict]:
    result = voyage.embed([query], model="voyage-3")
    collection = chroma.get_collection(collection_name)
    res = collection.query(query_embeddings=[result.embeddings[0]], n_results=k)
    return [{"text": doc, "source": meta.get("source", "")}
            for doc, meta in zip(res["documents"][0], res["metadatas"][0])]

def decompose_question(question: str) -> list[str]:
    """Decompose a multi-hop question into ordered sub-questions."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=256,
        system='Decompose questions. Return JSON: {"subquestions": ["q1", "q2", ...]}',
        messages=[{
            "role": "user",
            "content": (
                f"Decompose this multi-hop question into 2-4 simpler sub-questions "
                f"that must be answered in order.\\n\\nQuestion: {question}"
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw).get("subquestions", [question])

def answer_subquestion(
    subquestion: str,
    context_so_far: str,
    chunks: list[dict],
) -> str:
    """Answer a sub-question given accumulated context."""
    chunk_context = "\\n\\n".join(f"[{i+1}] {c['text']}" for i, c in enumerate(chunks))
    full_context = f"{context_so_far}\\n\\n---Retrieved---\\n\\n{chunk_context}" if context_so_far else chunk_context

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=256,
        system="Answer the sub-question using the provided context. Be concise.",
        messages=[{
            "role": "user",
            "content": f"Context:\\n{full_context}\\n\\nSub-question: {subquestion}"
        }],
    )
    return response.content[0].text.strip()

def multi_hop_rag(question: str, collection_name: str) -> dict:
    """
    Multi-hop RAG: decompose question, retrieve and answer each hop in sequence,
    then synthesise the final answer.
    """
    # 1. Decompose
    subquestions = decompose_question(question)
    print(f"Multi-hop chain ({len(subquestions)} hops):")
    for i, sq in enumerate(subquestions, 1):
        print(f"  Hop {i}: {sq}")

    # 2. Answer each hop sequentially, passing intermediate answers forward
    accumulated_context = ""
    hop_answers = []

    for i, subq in enumerate(subquestions, 1):
        # Use intermediate answers to refine the retrieval query for the next hop
        retrieval_query = subq
        if hop_answers:
            retrieval_query = f"{subq} (context: {' '.join(hop_answers[-2:])})"

        chunks = retrieve(retrieval_query, collection_name, k=3)
        hop_answer = answer_subquestion(subq, accumulated_context, chunks)
        hop_answers.append(hop_answer)
        accumulated_context += f"\\nHop {i} ({subq}): {hop_answer}"
        print(f"  Hop {i} answer: {hop_answer[:80]}...")

    # 3. Final synthesis
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="Synthesise a final answer from the step-by-step reasoning chain.",
        messages=[{
            "role": "user",
            "content": (
                f"Original question: {question}\\n\\n"
                f"Reasoning chain:\\n{accumulated_context}\\n\\n"
                "Provide a complete, synthesised final answer."
            )
        }],
    )

    return {
        "question": question,
        "subquestions": subquestions,
        "hop_answers": hop_answers,
        "final_answer": response.content[0].text,
    }

# Example
# result = multi_hop_rag(
#     "Who founded the company that makes the model used in the most popular RAG framework?",
#     "tech_docs",
# )`;

export default function MultiHopReasoning() {
  return (
    <div className="lesson-content">
      <h2>Multi-Hop Reasoning</h2>

      <p>
        Many real-world questions cannot be answered from a single document. "What is the
        capital of the country that invented the printing press?" requires first knowing
        which country invented the printing press (Germany), then knowing Germany's capital
        (Berlin). Each "hop" retrieves information that enables the next retrieval step.
        Multi-hop RAG chains retrieval operations to answer questions that require connecting
        facts across multiple documents.
      </p>

      <ConceptBlock
        term="Multi-Hop Retrieval"
        definition="Multi-hop retrieval is a RAG strategy where answering a question requires multiple sequential retrieval steps, each building on the results of the previous one. The answer to an intermediate sub-question becomes context for the next retrieval query, forming a chain of reasoning steps that eventually assembles enough information to answer the original question."
      />

      <h2>When Multi-Hop Retrieval Is Needed</h2>

      <p>
        A query requires multi-hop reasoning when:
      </p>
      <ul>
        <li>
          The question contains bridging entities — "the company that makes X" requires
          first finding what company makes X, then retrieving information about that company.
        </li>
        <li>
          Comparison questions — "Which is faster: A or B?" requires separate retrievals
          for A's performance and B's performance.
        </li>
        <li>
          Temporal reasoning — "What happened after event X?" requires first retrieving
          when event X occurred, then retrieving events in that time period.
        </li>
        <li>
          Hierarchical questions — "What does the parent company of X do?" requires
          identifying the parent company, then retrieving information about it.
        </li>
      </ul>

      <h2>The Multi-Hop Chain</h2>

      <p>
        A multi-hop pipeline follows this pattern:
      </p>
      <ol>
        <li>
          <strong>Decompose</strong>: Break the original question into an ordered sequence
          of sub-questions. Each sub-question should be answerable independently, and its
          answer should enable the next sub-question.
        </li>
        <li>
          <strong>Retrieve for Hop 1</strong>: Use the first sub-question as the retrieval
          query. Get the top-k relevant chunks.
        </li>
        <li>
          <strong>Answer Hop 1</strong>: Generate an intermediate answer for the first
          sub-question. This answer becomes a "bridge entity" — a piece of information
          needed for the next hop.
        </li>
        <li>
          <strong>Refine query for Hop 2</strong>: Incorporate the Hop 1 answer into the
          Hop 2 retrieval query. "What is the revenue of [company identified in Hop 1]?"
        </li>
        <li>
          <strong>Repeat</strong> until all hops are complete, then synthesise a final
          answer from all accumulated intermediate answers.
        </li>
      </ol>

      <h2>Challenges in Multi-Hop RAG</h2>

      <h3>Error Propagation</h3>
      <p>
        A wrong intermediate answer at Hop 1 propagates incorrectness into Hop 2 and beyond.
        The final answer can only be as good as the weakest hop. Grading intermediate
        answers for confidence and triggering fallbacks when confidence is low helps
        mitigate this.
      </p>

      <h3>Chain Length</h3>
      <p>
        Each additional hop adds latency (a retrieval + generation cycle) and cost. Most
        real-world multi-hop questions require 2–4 hops. Beyond 4 hops, error propagation
        and latency make the approach impractical — consider graph-based retrieval (GraphRAG)
        for deeper chains.
      </p>

      <h3>Sub-question Decomposition Quality</h3>
      <p>
        The decomposition step is the most brittle. If the sub-questions do not correctly
        capture the reasoning chain, subsequent hops retrieve irrelevant information. Use
        few-shot examples in the decomposition prompt to show the LLM how to decompose
        questions in your domain.
      </p>

      <NoteBlock
        type="tip"
        title="Log the full reasoning chain for debugging"
        children="Multi-hop pipelines are hard to debug because errors can occur at any hop. Log the sub-questions, retrieved chunks per hop, and intermediate answers for every request. When the final answer is wrong, trace back through the log to find which hop failed — whether it was a bad decomposition, a failed retrieval, or a wrong intermediate answer. This tracing capability is essential for improving multi-hop pipeline quality."
      />

      <BestPracticeBlock title="Validate bridge entities before the next hop">
        After answering a hop, check whether the intermediate answer is specific enough
        to use as a retrieval query for the next hop. If Hop 1 answers "I don't know" or
        produces a vague response, the next hop's retrieval will fail. Add an intermediate
        validation step: if the hop answer is insufficiently specific (e.g., fails to name
        an entity), trigger a fallback (broader retrieval or abstention) rather than
        proceeding with a bad bridge entity.
      </BestPracticeBlock>

      <h2>Multi-Hop RAG in Practice</h2>

      <SDKExample
        title="Multi-Hop RAG Pipeline"
        tabs={{ python: multiHopPython }}
      />

      <p>
        The implementation decomposes the question into sub-questions, answers each hop
        sequentially using the accumulated context from previous hops, and synthesises
        a final answer from the full reasoning chain. The key detail is that each hop's
        retrieval query is enriched with context from previous hop answers — this is what
        enables the chain to navigate across documents rather than retrieving the same
        documents repeatedly.
      </p>
    </div>
  );
}
