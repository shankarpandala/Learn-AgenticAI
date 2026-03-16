import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const faithfulnessPython = `from anthropic import Anthropic
import json

client = Anthropic()

def extract_claims(answer: str) -> list[str]:
    """Use Claude to decompose an answer into atomic factual claims."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        system="You decompose text into atomic factual claims. Return a JSON array of strings.",
        messages=[{
            "role": "user",
            "content": (
                f"Decompose the following answer into a list of atomic factual claims. "
                f"Each claim must be independently verifiable.\\n\\nAnswer: {answer}\\n\\n"
                "Return only a JSON array of strings."
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw)

def check_claim_support(claim: str, context_chunks: list[str]) -> bool:
    """Check whether a single claim is supported by the provided context."""
    context = "\\n\\n".join(f"[{i+1}] {c}" for i, c in enumerate(context_chunks))
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=64,
        system="Answer with JSON: {\"supported\": true} or {\"supported\": false}",
        messages=[{
            "role": "user",
            "content": (
                f"Context:\\n{context}\\n\\n"
                f"Claim: {claim}\\n\\n"
                "Is this claim fully supported by the context above?"
            )
        }],
    )
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw).get("supported", False)

def compute_faithfulness(
    answer: str,
    context_chunks: list[str],
) -> dict:
    claims = extract_claims(answer)
    supported = [check_claim_support(c, context_chunks) for c in claims]
    score = sum(supported) / len(supported) if supported else 0.0
    return {
        "faithfulness_score": round(score, 3),
        "total_claims": len(claims),
        "supported_claims": sum(supported),
        "unsupported": [c for c, s in zip(claims, supported) if not s],
    }

# Example
answer = (
    "RAG reduces hallucination by grounding responses in retrieved documents. "
    "It was invented at Meta in 2020. "  # hallucinated detail — not in context
    "Production systems typically use temperature 0 to 0.3."
)
context = [
    "RAG grounds LLM responses in retrieved documents, reducing hallucination.",
    "Low temperature (0–0.3) is recommended for factual RAG Q&A tasks.",
]

result = compute_faithfulness(answer, context)
print(f"Faithfulness: {result['faithfulness_score']}")
print(f"Unsupported claims: {result['unsupported']}")`;

const relevancePython = `import numpy as np
import voyageai
from anthropic import Anthropic

voyage_client = voyageai.Client()
anthropic_client = Anthropic()

def generate_reverse_questions(answer: str, n: int = 3) -> list[str]:
    """Generate questions that the given answer could have been responding to."""
    response = anthropic_client.messages.create(
        model="claude-opus-4-5",
        max_tokens=256,
        system="Generate hypothetical questions. Return a JSON array of strings.",
        messages=[{
            "role": "user",
            "content": (
                f"Generate {n} different questions that this answer could have been "
                f"responding to. Return as a JSON array.\\n\\nAnswer: {answer}"
            )
        }],
    )
    import json
    raw = response.content[0].text.strip().strip("json").strip("")
    return json.loads(raw)

def compute_answer_relevancy(question: str, answer: str, n: int = 3) -> float:
    """
    Measure answer relevancy: generate reverse questions from the answer,
    embed them and the original question, compute average cosine similarity.
    """
    reverse_questions = generate_reverse_questions(answer, n)
    all_texts = [question] + reverse_questions
    result = voyage_client.embed(all_texts, model="voyage-3")
    embeddings = np.array(result.embeddings)

    query_vec = embeddings[0]
    reverse_vecs = embeddings[1:]

    similarities = [
        float(np.dot(query_vec, rv) / (np.linalg.norm(query_vec) * np.linalg.norm(rv)))
        for rv in reverse_vecs
    ]
    return round(float(np.mean(similarities)), 3)

# Example
question = "What is the purpose of metadata filtering in RAG?"
answer = (
    "Metadata filtering restricts vector similarity search to a relevant subset of documents "
    "by applying conditions on structured fields like source, date, and document type. "
    "This dramatically improves precision by excluding irrelevant documents from consideration."
)

score = compute_answer_relevancy(question, answer)
print(f"Answer Relevancy Score: {score}")`;

export default function FaithfulnessRelevance() {
  return (
    <div className="lesson-content">
      <h2>Faithfulness & Relevance</h2>

      <p>
        The four RAGAS metrics each illuminate a different failure mode. This section dives
        deep into faithfulness and answer relevancy — the two metrics that diagnose the
        generation side of your pipeline — and explains how to implement them, interpret
        their scores, and act on what they reveal.
      </p>

      <ConceptBlock
        term="Faithfulness"
        definition="Faithfulness measures the degree to which a generated answer's factual claims are supported by the retrieved context documents. It is computed by decomposing the answer into atomic claims, then verifying each claim against the context. The score is the fraction of claims that are fully supported: 1.0 means every claim has a source; lower scores indicate hallucination."
      />

      <h2>Why Faithfulness Is the Primary Metric</h2>

      <p>
        In a production RAG system, faithfulness is the single most important metric because
        it directly measures the hallucination rate. A faithfulness score of 0.90 means that
        roughly 10% of claims in your generated answers are not supported by the retrieved
        context — they come from the model's parametric memory, which may be outdated,
        wrong, or fabricated.
      </p>
      <p>
        Faithfulness is also actionable: a low score points to specific unsupported claims,
        which can be traced to either a retrieval failure (the right context was not
        retrieved) or a generation failure (the model ignored the context or added
        information beyond it). This distinction determines the fix.
      </p>

      <h2>How Faithfulness Is Computed</h2>

      <p>
        RAGAS computes faithfulness in two steps:
      </p>
      <ol>
        <li>
          <strong>Claim decomposition</strong>: An LLM reads the generated answer and
          extracts a list of atomic factual claims — the smallest independently verifiable
          statements. "Paris is the capital of France and is home to the Eiffel Tower"
          becomes two claims: "Paris is the capital of France" and "Paris is home to the
          Eiffel Tower."
        </li>
        <li>
          <strong>Entailment verification</strong>: For each claim, an LLM checks whether
          the claim is entailed by the retrieved context. Claims that cannot be found or
          inferred from the context are marked unsupported.
        </li>
      </ol>
      <p>
        <code>faithfulness = supported_claims / total_claims</code>
      </p>

      <h2>Answer Relevancy</h2>

      <ConceptBlock
        term="Answer Relevancy"
        definition="Answer relevancy measures how directly and completely a generated answer responds to the posed question. It is computed by having an LLM generate several hypothetical questions that the answer could plausibly be responding to, embedding those questions and the original question, and computing the average cosine similarity. High similarity means the answer is on-topic and focused; low similarity means the answer is evasive, off-topic, or incomplete."
      />

      <p>
        A model might produce a faithful answer (every claim supported by context) that is
        nonetheless irrelevant — for example, answering a question about pricing by discussing
        the company's history. Answer relevancy catches this. The metric does not require a
        ground-truth reference answer, making it cheap to run at scale.
      </p>

      <h2>Context Precision and Context Recall</h2>

      <p>
        While faithfulness and answer relevancy diagnose the generation step, context
        precision and context recall diagnose the retrieval step:
      </p>
      <ul>
        <li>
          <strong>Context precision</strong> = (relevant chunks retrieved) / (total chunks
          retrieved). Low precision means your retrieval is returning too much noise, diluting
          the context and confusing the model. Fix: raise your similarity score threshold,
          add metadata filters, or use reranking.
        </li>
        <li>
          <strong>Context recall</strong> = (ground-truth claims covered by retrieved context)
          / (total ground-truth claims). Low recall means your retrieval is missing key
          information. Fix: lower your similarity threshold, increase k, improve chunking,
          or add missing documents to the index.
        </li>
      </ul>

      <h2>The Metric Trade-offs</h2>

      <p>
        These four metrics interact in important ways. Increasing k (more chunks retrieved)
        improves recall but hurts precision. Raising the similarity threshold improves
        precision but hurts recall. Context stuffing (many chunks) can paradoxically reduce
        faithfulness if it adds irrelevant context that confuses the model.
      </p>
      <p>
        Optimise for your use case: customer support benefits most from high faithfulness
        (no hallucinated policies); research tools benefit most from high recall (all relevant
        information surfaced); enterprise search benefits from high precision (no irrelevant
        noise).
      </p>

      <NoteBlock
        type="tip"
        title="Per-query analysis reveals more than averages"
        children="An average faithfulness score of 0.85 hides important variance. Export per-query scores and look at the bottom quartile — the 25% of queries with lowest scores. These queries reveal specific failure patterns: questions about entities not well represented in your knowledge base, multi-hop questions that require synthesising across documents, or questions that trigger the model's parametric memory. Fix the systemic issues in these failure patterns to move the overall metric."
      />

      <BestPracticeBlock title="Track metrics over time, not just at launch">
        Run your evaluation suite on every significant pipeline change: new documents added,
        chunking strategy changed, embedding model updated, prompt revised. Plot faithfulness
        and answer relevancy over time. Regressions in these metrics after a deployment
        indicate that a change degraded generation quality even if individual tests passed.
        Treat these metrics like you treat test coverage: required, tracked, and defended.
      </BestPracticeBlock>

      <h2>Implementing Faithfulness and Relevancy Checks</h2>

      <SDKExample
        title="Faithfulness Scoring with Claude"
        tabs={{ python: faithfulnessPython }}
      />

      <SDKExample
        title="Answer Relevancy Scoring with Embeddings"
        tabs={{ python: relevancePython }}
      />

      <p>
        The first example implements faithfulness scoring by decomposing the answer into
        atomic claims and verifying each against the context using Claude. The second
        implements answer relevancy by generating reverse questions from the answer and
        measuring their semantic similarity to the original question. Together, these two
        implementations give you the two most important generation-quality metrics without
        requiring any pre-labelled ground-truth answers.
      </p>
    </div>
  );
}
