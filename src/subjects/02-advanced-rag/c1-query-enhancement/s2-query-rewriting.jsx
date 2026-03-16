import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

export default function QueryRewriting() {
  return (
    <div className="lesson-content">
      <h2>Query Rewriting</h2>

      <p>
        Users rarely phrase their questions the way documents are written. A question like "how do
        I fix the login bug?" maps poorly to a document titled "Authentication Error Resolution
        Guide." Query rewriting transforms the user's original question into one or more search
        queries that are better aligned with the vocabulary and structure of the document corpus.
        It is one of the highest-leverage improvements available for a mature RAG system.
      </p>

      <ConceptBlock
        title="Query Rewriting"
        definition="Query rewriting uses a language model to transform or expand the user's original query before retrieval. The rewritten query — or set of queries — is better aligned with how information is phrased in the knowledge base, covering synonyms, related terms, alternative phrasings, and decomposed sub-questions that together address the user's intent."
      />

      <h2>Multi-Query Retrieval</h2>

      <p>
        Instead of searching with a single query, generate 3–5 alternative phrasings of the same
        question and retrieve for all of them. Merge the result sets and deduplicate. This
        broadens coverage and reduces the chance that an unusual phrasing causes a relevant
        document to be missed.
      </p>

      <SDKExample
        title="Multi-Query Retrieval"
        tabs={{
          python: `import anthropic
from langchain_community.vectorstores import Chroma
from langchain_voyageai import VoyageAIEmbeddings

client = anthropic.Anthropic()

MULTI_QUERY_PROMPT = """Generate {n} different search queries that would retrieve documents
relevant to answering this question. Each query should take a different angle.
Return ONLY the queries, one per line, no numbering or explanation.

Question: {question}"""

def generate_multiple_queries(question: str, n: int = 4) -> list[str]:
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=256,
        temperature=0.4,
        messages=[{
            "role": "user",
            "content": MULTI_QUERY_PROMPT.format(n=n, question=question)
        }]
    )
    queries = [q.strip() for q in response.content[0].text.strip().split("\\n") if q.strip()]
    return queries[:n]  # Safety cap

def multi_query_retrieve(question: str, vectorstore, top_k: int = 3) -> list[str]:
    """Retrieve using multiple query variants, deduplicated."""
    queries = generate_multiple_queries(question)
    queries.append(question)  # Always include the original

    seen_ids = set()
    all_chunks = []

    for query in queries:
        results = vectorstore.similarity_search(query, k=top_k)
        for doc in results:
            doc_id = doc.metadata.get("id") or doc.page_content[:64]
            if doc_id not in seen_ids:
                seen_ids.add(doc_id)
                all_chunks.append(doc.page_content)

    return all_chunks

# Example
embeddings = VoyageAIEmbeddings(model="voyage-3")
# vectorstore = Chroma(embedding_function=embeddings, persist_directory="./chroma_db")

question = "What are the performance implications of using async in Python?"
queries = generate_multiple_queries(question)
for i, q in enumerate(queries, 1):
    print(f"{i}. {q}")`,
        }}
      />

      <h2>Step-Back Prompting</h2>

      <p>
        Step-back prompting asks the model to identify the underlying principle or more general
        concept behind a specific question. Instead of searching for the specific case, you first
        retrieve general background knowledge, then use that alongside any specific results to
        generate the answer. This is particularly effective for reasoning questions where context
        about the broader domain helps.
      </p>

      <SDKExample
        title="Step-Back Prompting for Query Expansion"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

STEP_BACK_PROMPT = """Given this specific question, generate a more general "step-back" question
that retrieves background knowledge needed to answer the original question.

Original: {question}
Step-back question (more general concept/principle):"""

def step_back_query(question: str) -> tuple[str, str]:
    """Return (original_question, step_back_question) pair."""
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=128,
        temperature=0.2,
        messages=[{"role": "user", "content": STEP_BACK_PROMPT.format(question=question)}]
    )
    step_back = response.content[0].text.strip()
    return question, step_back

def step_back_retrieve(question: str, vectorstore) -> list[str]:
    """Retrieve with both the specific question and its step-back generalisation."""
    original, generalised = step_back_query(question)

    specific_docs = vectorstore.similarity_search(original, k=3)
    general_docs = vectorstore.similarity_search(generalised, k=2)

    # Deduplicate and combine
    seen = set()
    combined = []
    for doc in specific_docs + general_docs:
        key = doc.page_content[:64]
        if key not in seen:
            seen.add(key)
            combined.append(doc.page_content)

    return combined

# Example step-backs
examples = [
    "Why does my transformer model overfit with a small dataset?",
    "How do I tune the ef parameter in HNSW for my use case?",
    "Why is cosine similarity returning 0.3 for clearly related sentences?",
]
for q in examples:
    original, step_back = step_back_query(q)
    print(f"Original:  {original}")
    print(f"Step-back: {step_back}")
    print()`,
        }}
      />

      <h2>Query Decomposition</h2>

      <p>
        Complex questions that require multiple pieces of information should be decomposed into
        atomic sub-questions, each retrievable independently. The sub-question answers are then
        synthesised into the final answer. This is the basis of the sub-question query engine in
        LlamaIndex.
      </p>

      <SDKExample
        title="Query Decomposition"
        tabs={{
          python: `import anthropic
import json

client = anthropic.Anthropic()

DECOMPOSE_PROMPT = """Decompose this complex question into 2-4 simpler sub-questions
that can each be answered independently from a document corpus.
Return a JSON array of sub-question strings.

Question: {question}
Sub-questions (JSON array):"""

def decompose_query(question: str) -> list[str]:
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=256,
        temperature=0.1,
        messages=[{"role": "user", "content": DECOMPOSE_PROMPT.format(question=question)}]
    )
    raw = response.content[0].text.strip()
    try:
        sub_questions = json.loads(raw)
        return sub_questions if isinstance(sub_questions, list) else [question]
    except json.JSONDecodeError:
        return [question]  # Fallback to original

def decomposed_rag(question: str, vectorstore, llm_client) -> str:
    """Answer a complex question by decomposing it and retrieving for each sub-question."""
    sub_questions = decompose_query(question)
    print(f"Decomposed into {len(sub_questions)} sub-questions:")
    for i, q in enumerate(sub_questions, 1):
        print(f"  {i}. {q}")

    # Retrieve for each sub-question
    all_context = []
    for sq in sub_questions:
        docs = vectorstore.similarity_search(sq, k=2)
        all_context.extend([d.page_content for d in docs])

    # Deduplicate context
    seen = set()
    unique_context = []
    for chunk in all_context:
        key = chunk[:64]
        if key not in seen:
            seen.add(key)
            unique_context.append(chunk)

    # Generate final answer from combined context
    context_str = "\\n\\n---\\n\\n".join(unique_context)
    response = llm_client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        temperature=0.1,
        system="Answer the question using the provided context. Synthesise information from all relevant parts.",
        messages=[{"role": "user", "content": f"Context:\\n{context_str}\\n\\nQuestion: {question}"}]
    )
    return response.content[0].text

# Test decomposition
q = "How does HNSW differ from IVF indexing in terms of memory usage and query performance?"
sub_qs = decompose_query(q)
print(sub_qs)`,
        }}
      />

      <BestPracticeBlock title="Profile Before Optimising Query Rewriting">
        <p>
          Query rewriting adds latency (an extra LLM call) and cost. Before implementing it,
          profile where your RAG pipeline fails: if low retrieval recall is the bottleneck,
          multi-query or step-back rewriting may help. If retrieval is already high quality and
          the problem is in generation, rewriting will not help. Use your golden dataset's
          retrieval recall metric to make this decision empirically.
        </p>
      </BestPracticeBlock>

      <NoteBlock
        title="Caching rewritten queries"
        content="For production systems, cache rewritten queries by the hash of the original question. Query rewriting is deterministic at low temperature — the same question will produce the same rewrites. Caching eliminates the extra LLM call for repeated questions, reducing both latency and cost. A simple in-memory dict or Redis TTL cache is sufficient for most deployments."
      />
    </div>
  );
}
