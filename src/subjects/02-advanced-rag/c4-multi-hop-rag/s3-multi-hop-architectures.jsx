import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const irCOTPython = `import json
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
    return [{"text": doc} for doc in res["documents"][0]]

def ircot(
    question: str,
    collection_name: str,
    max_steps: int = 4,
) -> dict:
    """
    IRCoT: Interleaved Retrieval with Chain-of-Thought.

    The model generates reasoning steps one at a time. After each step,
    if it identifies a knowledge gap, it retrieves relevant documents
    and continues reasoning with the enriched context.
    """
    reasoning_chain = []
    all_retrieved_docs = []

    # Initial retrieval
    initial_chunks = retrieve(question, collection_name, k=3)
    all_retrieved_docs.extend(initial_chunks)

    for step in range(1, max_steps + 1):
        # Build context from accumulated documents and reasoning
        doc_context = "\\n\\n".join(f"[{i+1}] {c['text']}" for i, c in enumerate(all_retrieved_docs[:6]))
        reasoning_so_far = "\\n".join(f"Step {i+1}: {r['thought']}" for i, r in enumerate(reasoning_chain))

        prompt = f"""Question: {question}

Retrieved documents:
{doc_context}

{"Previous reasoning:" + chr(10) + reasoning_so_far if reasoning_so_far else ""}

Generate the next reasoning step. If you need more information, identify what to search for.
Return JSON: {{
  "thought": "reasoning step text",
  "needs_retrieval": true|false,
  "search_query": "query string if needs_retrieval is true" or null,
  "final_answer": "answer string if this is the last step" or null
}}"""

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=256,
            system="You reason step-by-step over retrieved documents. Return JSON.",
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip().strip("json").strip("")
        step_result = json.loads(raw)

        thought = step_result.get("thought", "")
        reasoning_chain.append({"step": step, "thought": thought})
        print(f"Step {step}: {thought[:80]}...")

        # If model has a final answer, stop
        if step_result.get("final_answer"):
            return {
                "question": question,
                "reasoning_chain": reasoning_chain,
                "answer": step_result["final_answer"],
                "steps": step,
            }

        # If model needs retrieval, retrieve and continue
        if step_result.get("needs_retrieval") and step_result.get("search_query"):
            new_chunks = retrieve(step_result["search_query"], collection_name, k=3)
            all_retrieved_docs.extend(new_chunks)
            print(f"  → Retrieved {len(new_chunks)} new docs for: {step_result['search_query']}")

    # Fallback: generate final answer with all accumulated context
    doc_context = "\\n\\n".join(f"[{i+1}] {c['text']}" for i, c in enumerate(all_retrieved_docs[:8]))
    reasoning_so_far = "\\n".join(f"Step {i+1}: {r['thought']}" for i, r in enumerate(reasoning_chain))

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="Synthesise a final answer from the reasoning chain and documents.",
        messages=[{"role": "user", "content": f"Question: {question}\\n\\nReasoning:\\n{reasoning_so_far}\\n\\nDocuments:\\n{doc_context}\\n\\nFinal answer:"}],
    )
    return {
        "question": question,
        "reasoning_chain": reasoning_chain,
        "answer": response.content[0].text,
        "steps": max_steps,
    }`;

export default function MultiHopArchitectures() {
  return (
    <div className="lesson-content">
      <h2>Multi-Hop Architectures</h2>

      <p>
        The previous sections covered the concepts of multi-hop reasoning and GraphRAG.
        This section surveys specific architectural patterns — IRCoT, FLARE, and ReAct-RAG
        — that provide principled frameworks for implementing multi-step retrieval and
        reasoning. Each pattern makes different trade-offs between complexity, latency,
        and reasoning depth.
      </p>

      <ConceptBlock
        term="IRCoT (Interleaved Retrieval with Chain-of-Thought)"
        definition="IRCoT interleaves chain-of-thought reasoning steps with retrieval operations. The model generates reasoning steps one at a time, and after each step, the system checks whether the model identified a knowledge gap. If so, a targeted retrieval is performed, and the model continues reasoning with the new documents in context. This interleaving allows retrieval to be guided by the model's own emerging understanding of what it needs."
      />

      <h2>IRCoT — Interleaved Retrieval with Chain-of-Thought</h2>

      <p>
        In standard RAG, retrieval happens once at the start. In IRCoT, retrieval and
        reasoning alternate: reason → identify gap → retrieve → reason again. The key
        insight is that chain-of-thought reasoning naturally surfaces what information
        is missing — "I know X, but I need to know Y to answer the question" — which
        makes an excellent retrieval query.
      </p>
      <p>
        IRCoT is particularly effective for questions that require connecting facts across
        multiple documents, because the model's intermediate reasoning provides precise,
        contextualised retrieval queries rather than using the original question repeatedly.
        Each retrieval query is conditioned on what the model has already reasoned about.
      </p>

      <h2>FLARE — Forward-Looking Active Retrieval</h2>

      <p>
        FLARE (Forward-Looking Active REtrieval augmented generation) takes a different
        approach: the model generates its response token by token and triggers retrieval
        when it is about to generate low-confidence tokens. When the model would generate
        a token that might be uncertain (measured by low probability mass on the top tokens),
        it pauses, formulates a retrieval query based on the upcoming content it was about
        to generate, retrieves relevant documents, and then regenerates that portion of its
        response with the retrieved context.
      </p>
      <p>
        FLARE requires access to the model's token probabilities (log-probs), which is
        available from many model APIs. It is best suited for long-form generation tasks
        where different portions of the response require different factual knowledge.
      </p>

      <h2>ReAct-RAG (Reasoning + Acting)</h2>

      <p>
        ReAct combines the ReAct (Reasoning + Acting) agent framework with RAG. The model
        explicitly alternates between Thought (reasoning), Action (retrieval or other tool
        call), and Observation (processing the result). This structure makes the reasoning
        process fully transparent and debuggable because each step is explicitly labelled.
      </p>
      <p>
        ReAct-RAG is the most general of these architectures — the "action" can be a vector
        search, a graph query, a web search, or any other tool. It is the foundation for
        Agentic RAG systems where retrieval is one of many tools an agent can use.
      </p>

      <h2>Comparing the Architectures</h2>

      <p>
        All three architectures interleave reasoning and retrieval, but differ in how
        retrieval is triggered and how reasoning is structured:
      </p>
      <ul>
        <li>
          <strong>IRCoT</strong>: Model-driven. The model's reasoning chain determines
          when and what to retrieve. Most natural for chain-of-thought capable models.
        </li>
        <li>
          <strong>FLARE</strong>: Probability-driven. Low token confidence triggers
          retrieval. Requires log-prob access. Best for factual long-form generation.
        </li>
        <li>
          <strong>ReAct-RAG</strong>: Tool-driven. Retrieval is an explicit action in a
          structured thought/action/observation loop. Most transparent and extensible.
        </li>
      </ul>

      <NoteBlock
        type="note"
        title="IRCoT is the most practical starting point"
        children="FLARE requires log-prob access (not available in all model APIs) and is complex to implement. ReAct-RAG requires building a full agent loop. IRCoT is the most straightforward to implement with standard chat completion APIs — it is essentially prompted chain-of-thought with retrieval calls inserted when the model signals it needs more information. Start with IRCoT for multi-hop retrieval and graduate to ReAct or a full agent framework if you need more flexibility."
      />

      <BestPracticeBlock title="Cap the maximum number of retrieval steps">
        All iterative multi-hop architectures need a hard cap on the number of retrieval
        steps. Without a cap, a confused model can loop indefinitely, retrieving documents
        that never satisfy its stated knowledge gaps. Set a maximum of 3–5 steps for most
        use cases. After reaching the cap, generate the best answer possible from the
        accumulated context rather than failing. Log queries that hit the cap — they
        indicate either unusually complex questions or retrieval quality issues.
      </BestPracticeBlock>

      <h2>IRCoT Implementation</h2>

      <SDKExample
        title="IRCoT: Interleaved Retrieval with Chain-of-Thought"
        tabs={{ python: irCOTPython }}
      />

      <p>
        The IRCoT implementation generates reasoning steps one at a time, triggering
        retrieval when the model identifies a knowledge gap and provides a search query.
        Each new retrieval adds to the accumulated context, which is included in subsequent
        reasoning steps. The process terminates when the model produces a final answer or
        the maximum step count is reached. This architecture naturally produces an
        interpretable reasoning trace that shows exactly how the model navigated from
        question to answer across multiple retrieval steps.
      </p>
    </div>
  );
}
