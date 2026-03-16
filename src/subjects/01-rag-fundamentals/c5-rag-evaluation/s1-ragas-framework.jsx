import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const ragasPython = `from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# RAGAS expects a dataset with these four columns:
# - question: the user query
# - answer: the generated answer from your RAG pipeline
# - contexts: list of retrieved document chunks (list of strings)
# - ground_truth: the reference answer (only needed for context_recall)

eval_data = {
    "question": [
        "What is the capital of France?",
        "How does RAG reduce hallucination?",
        "What temperature should I use for factual RAG tasks?",
    ],
    "answer": [
        "The capital of France is Paris.",
        "RAG reduces hallucination by grounding LLM responses in retrieved documents, "
        "preventing the model from relying on potentially inaccurate parametric memory.",
        "For factual RAG tasks, a temperature between 0.0 and 0.3 is recommended "
        "to maximise answer consistency.",
    ],
    "contexts": [
        ["Paris is the capital and most populous city of France."],
        [
            "RAG grounds responses in external documents, reducing hallucination.",
            "The model generates answers based only on provided context."
        ],
        ["Production RAG systems typically use temperature 0 to 0.3 for factual Q&A."],
    ],
    "ground_truth": [
        "Paris",
        "RAG reduces hallucination by grounding answers in retrieved source documents.",
        "Temperature between 0.0 and 0.3 is recommended for factual tasks.",
    ],
}

dataset = Dataset.from_dict(eval_data)

# Run RAGAS evaluation — uses an LLM internally (defaults to OpenAI GPT-4)
# To use a custom LLM, pass llm= parameter
results = evaluate(
    dataset,
    metrics=[
        faithfulness,         # are claims in the answer supported by context?
        answer_relevancy,     # does the answer address the question?
        context_precision,    # are retrieved chunks relevant to the question?
        context_recall,       # does the context cover the ground truth?
    ],
)

print(results)
# Output: {'faithfulness': 0.97, 'answer_relevancy': 0.95, ...}

# Convert to pandas for analysis
df = results.to_pandas()
print(df[["question", "faithfulness", "answer_relevancy"]].to_string())`;

export default function RagasFramework() {
  return (
    <div className="lesson-content">
      <h2>RAGAS Framework</h2>

      <p>
        Building a RAG pipeline is relatively straightforward; knowing whether it is working
        well is harder. Traditional NLP metrics like BLEU or ROUGE require ground-truth
        reference answers for every evaluation query, which is expensive to produce at scale.
        RAGAS (Retrieval-Augmented Generation Assessment) is an open-source evaluation
        framework that solves this by using LLMs as automatic judges — enabling evaluation
        without hand-written reference answers for most metrics.
      </p>

      <ConceptBlock
        term="RAGAS"
        definition="RAGAS is an evaluation framework for RAG pipelines that measures four core dimensions: faithfulness (are the model's claims supported by retrieved context?), answer relevancy (does the response address the question?), context precision (are the retrieved chunks relevant?), and context recall (does the retrieved context contain enough information to answer?). RAGAS uses LLM-based scoring for most metrics, making it practical to run without labelling ground-truth answers at scale."
      />

      <h2>Why LLM-Based Evaluation?</h2>

      <p>
        Traditional reference-based metrics measure lexical overlap between a generated
        answer and a reference answer. This approach has two fundamental problems for RAG:
      </p>
      <ol>
        <li>
          It requires a reference answer for every query. Producing high-quality reference
          answers for a knowledge base with thousands of possible questions is a major
          labelling effort.
        </li>
        <li>
          Lexical overlap is a poor proxy for semantic correctness. An answer can be
          completely correct while using different words from the reference, and can be
          factually wrong while matching the reference's phrasing.
        </li>
      </ol>
      <p>
        RAGAS replaces lexical overlap with LLM judgment. The evaluating LLM reads the
        question, the answer, and the context, and produces a score based on semantic
        understanding rather than string matching. This is far more aligned with how humans
        would judge RAG quality.
      </p>

      <h2>The Four Core RAGAS Metrics</h2>

      <h3>Faithfulness</h3>
      <p>
        Faithfulness measures whether every claim in the generated answer is supported by
        the retrieved context. RAGAS breaks the answer into individual claims, then asks an
        LLM to verify each claim against the context documents. The score is the fraction
        of claims that are fully supported. A score of 1.0 means every claim has a source;
        a lower score indicates hallucination.
      </p>
      <p>
        Faithfulness does not require a ground-truth answer — only the question, the answer,
        and the retrieved context. This makes it the most actionable metric for detecting
        hallucination in production.
      </p>

      <h3>Answer Relevancy</h3>
      <p>
        Answer relevancy measures how well the generated answer addresses the actual question.
        RAGAS generates several hypothetical questions that the answer could have been
        responding to, then measures how similar those reverse-engineered questions are to
        the original query using embedding similarity. A complete, focused answer scores
        close to 1.0; an evasive or off-topic answer scores lower.
      </p>

      <h3>Context Precision</h3>
      <p>
        Context precision measures the signal-to-noise ratio in the retrieved context: what
        fraction of retrieved chunks are actually relevant to answering the question? High
        context precision means your retrieval system is not returning junk. A score of 0.5
        means half of what you're sending to the LLM is irrelevant — a retrieval quality
        problem, not a generation quality problem.
      </p>

      <h3>Context Recall</h3>
      <p>
        Context recall measures whether the retrieved context contains all the information
        needed to answer the question correctly. It requires a ground-truth answer to compare
        against: RAGAS checks whether each sentence of the ground truth can be attributed to
        a retrieved chunk. Low context recall means your retrieval is missing relevant
        documents — a sign that you need more data, better chunking, or improved retrieval
        parameters.
      </p>

      <h2>The RAGAS Evaluation Loop</h2>

      <p>
        A typical evaluation workflow:
      </p>
      <ol>
        <li>
          Sample 50–200 queries representative of your production distribution. For context
          recall, also write reference answers.
        </li>
        <li>
          Run each query through your full RAG pipeline, recording the question, generated
          answer, and retrieved context chunks.
        </li>
        <li>
          Assemble the results into a RAGAS dataset and run <code>evaluate()</code>.
        </li>
        <li>
          Analyse per-query scores to identify failure patterns: low faithfulness =
          hallucination; low context precision = noisy retrieval; low context recall =
          missing documents.
        </li>
        <li>
          Fix the identified issue and re-run the evaluation to confirm improvement.
        </li>
      </ol>

      <NoteBlock
        type="note"
        title="RAGAS uses an LLM for evaluation — which one?"
        children="By default, RAGAS uses OpenAI GPT-4 as its evaluating LLM. This adds cost (typically $0.01–0.10 per query evaluated) and a dependency on the OpenAI API. RAGAS supports custom LLM wrappers, so you can substitute any model including Claude via LangChain's Anthropic integration. For cost-sensitive evaluations, GPT-3.5-Turbo or a local model like Llama 3 is adequate for most metrics except faithfulness, which benefits from a stronger judge."
      />

      <BestPracticeBlock title="Evaluate on a stratified query sample">
        Do not evaluate only on easy, well-formed queries. Deliberately include edge cases:
        queries where the answer is not in the knowledge base, ambiguous queries, multi-hop
        questions, and queries that require synthesising multiple documents. Your overall
        metric scores are less important than understanding failure modes on these hard cases.
        A pipeline with 0.92 average faithfulness but 0.50 faithfulness on "not in KB"
        queries will produce hallucinated answers for a significant fraction of real users.
      </BestPracticeBlock>

      <h2>Running RAGAS Evaluation</h2>

      <SDKExample
        title="RAGAS Evaluation Pipeline"
        tabs={{ python: ragasPython }}
      />

      <p>
        The example above runs all four core RAGAS metrics on three example queries.
        The <code>evaluate()</code> function returns a <code>Result</code> object with
        aggregate scores and per-query breakdowns accessible via <code>to_pandas()</code>.
        In a real evaluation pipeline, you would collect the dataset by running your full
        RAG pipeline on each evaluation query and recording the outputs, then pass the
        collected data to RAGAS.
      </p>
    </div>
  );
}
