import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';
import WarningBlock from '../../../components/content/WarningBlock.jsx';

export default function EndToEndTesting() {
  return (
    <div className="lesson-content">
      <h2>End-to-End Testing for RAG</h2>

      <p>
        Automated metrics like RAGAS scores are valuable, but they do not replace the discipline
        of building a structured test suite. End-to-end RAG testing means specifying expected
        behaviour, running the full pipeline against it, and catching regressions before they reach
        production. Without tests, every change to chunking strategy, embedding model, prompt, or
        retrieval parameters is a gamble.
      </p>

      <ConceptBlock
        title="Golden Dataset"
        definition="A golden dataset is a curated collection of (question, expected answer, source documents) triples that represents the range of queries your RAG system must handle correctly. It is the ground truth against which all automated evaluation runs. A good golden dataset is small enough to maintain manually but diverse enough to catch real failure modes."
      />

      <h2>Building a Golden Dataset</h2>

      <p>
        Start with 50–100 question-answer pairs covering: common queries, edge cases, questions
        the system should refuse to answer, questions requiring multi-document synthesis, and
        questions with answers that have changed over time. For each pair, record the exact source
        chunks that should be retrieved and the key facts that must appear in the answer.
      </p>

      <SDKExample
        title="Golden Dataset Structure and Creation"
        tabs={{
          python: `import json
from dataclasses import dataclass, asdict
from pathlib import Path

@dataclass
class GoldenSample:
    id: str
    question: str
    expected_answer_contains: list[str]   # Key facts that must be present
    expected_source_ids: list[str]        # Document IDs that should be retrieved
    should_abstain: bool = False          # True if the system should say "I don't know"
    category: str = "factual"            # factual | synthesis | abstain | edge_case

# Build your golden dataset
GOLDEN_DATASET = [
    GoldenSample(
        id="Q001",
        question="What is the refund window for digital products?",
        expected_answer_contains=["14 days", "digital"],
        expected_source_ids=["policy-doc-v3"],
        category="factual",
    ),
    GoldenSample(
        id="Q002",
        question="Compare the performance of Model A vs Model B on classification tasks.",
        expected_answer_contains=["accuracy", "F1"],
        expected_source_ids=["benchmark-2024", "model-a-docs", "model-b-docs"],
        category="synthesis",
    ),
    GoldenSample(
        id="Q003",
        question="What is the weather like on Mars today?",
        expected_answer_contains=[],
        expected_source_ids=[],
        should_abstain=True,
        category="abstain",
    ),
]

# Save to JSON for use in CI
dataset_path = Path("tests/golden_dataset.json")
dataset_path.parent.mkdir(exist_ok=True)
with open(dataset_path, "w") as f:
    json.dump([asdict(s) for s in GOLDEN_DATASET], f, indent=2)

print(f"Saved {len(GOLDEN_DATASET)} golden samples to {dataset_path}")`,
        }}
      />

      <h2>Pytest Test Suite for RAG</h2>

      <p>
        Structure your tests with pytest so they run in CI. Each test loads the golden dataset,
        runs the full RAG pipeline, and asserts on specific measurable properties: retrieval
        recall, answer completeness, abstention behaviour, and response latency.
      </p>

      <SDKExample
        title="Pytest RAG Test Suite"
        tabs={{
          python: `import pytest
import time
import json
from pathlib import Path

# Assume these are your actual RAG pipeline functions
from your_rag_pipeline import retrieve_chunks, generate_answer

GOLDEN_PATH = Path("tests/golden_dataset.json")

@pytest.fixture(scope="session")
def golden_dataset():
    with open(GOLDEN_PATH) as f:
        return json.load(f)

@pytest.fixture(scope="session")
def rag_results(golden_dataset):
    """Run the full pipeline once and cache results for all tests."""
    results = {}
    for sample in golden_dataset:
        start = time.time()
        chunks = retrieve_chunks(sample["question"], top_k=5)
        answer = generate_answer(sample["question"], chunks)
        latency = time.time() - start
        results[sample["id"]] = {
            "answer": answer,
            "retrieved_ids": [c["source_id"] for c in chunks],
            "latency": latency,
        }
    return results


class TestRetrieval:
    def test_retrieval_recall(self, golden_dataset, rag_results):
        """Every expected source document must appear in the top-5 retrieved chunks."""
        failures = []
        for sample in golden_dataset:
            if not sample["expected_source_ids"]:
                continue
            retrieved = set(rag_results[sample["id"]]["retrieved_ids"])
            expected = set(sample["expected_source_ids"])
            missing = expected - retrieved
            if missing:
                failures.append(f"{sample['id']}: missing sources {missing}")
        assert not failures, "Retrieval recall failures:\\n" + "\\n".join(failures)

    def test_retrieval_latency(self, golden_dataset, rag_results):
        """End-to-end latency must be under 3 seconds for all queries."""
        slow = [
            f"{s['id']}: {rag_results[s['id']]['latency']:.2f}s"
            for s in golden_dataset
            if rag_results[s["id"]]["latency"] > 3.0
        ]
        assert not slow, "Slow queries (>3s):\\n" + "\\n".join(slow)


class TestGeneration:
    def test_answer_contains_key_facts(self, golden_dataset, rag_results):
        """Answer must mention all key facts specified in the golden sample."""
        failures = []
        for sample in golden_dataset:
            if sample["should_abstain"]:
                continue
            answer = rag_results[sample["id"]]["answer"].lower()
            for fact in sample["expected_answer_contains"]:
                if fact.lower() not in answer:
                    failures.append(f"{sample['id']}: missing '{fact}'")
        assert not failures, "Missing key facts:\\n" + "\\n".join(failures)

    def test_abstention_on_out_of_scope(self, golden_dataset, rag_results):
        """System must abstain (not hallucinate) for out-of-scope questions."""
        abstain_phrases = ["don't know", "cannot find", "not in", "no information"]
        failures = []
        for sample in golden_dataset:
            if not sample["should_abstain"]:
                continue
            answer = rag_results[sample["id"]]["answer"].lower()
            if not any(phrase in answer for phrase in abstain_phrases):
                failures.append(f"{sample['id']}: expected abstention but got: {answer[:100]}")
        assert not failures, "Unexpected answers (should have abstained):\\n" + "\\n".join(failures)`,
        }}
      />

      <h2>Regression Testing Strategy</h2>

      <p>
        RAG pipelines have many moving parts — embedding models, chunk sizes, vector DB parameters,
        prompt wording, LLM version. Any change can degrade performance on previously passing
        cases. Track evaluation metrics over time by storing test run results with a timestamp and
        the pipeline configuration hash.
      </p>

      <SDKExample
        title="Regression Tracking"
        tabs={{
          python: `import json
import hashlib
import datetime
from pathlib import Path

def compute_config_hash(config: dict) -> str:
    """Deterministic hash of pipeline configuration for change tracking."""
    config_str = json.dumps(config, sort_keys=True)
    return hashlib.sha256(config_str.encode()).hexdigest()[:12]

def save_eval_run(metrics: dict, config: dict, results_dir: str = "tests/eval_runs"):
    Path(results_dir).mkdir(parents=True, exist_ok=True)
    config_hash = compute_config_hash(config)
    timestamp = datetime.datetime.utcnow().isoformat()
    run_record = {
        "timestamp": timestamp,
        "config_hash": config_hash,
        "config": config,
        "metrics": metrics,
    }
    filename = f"{results_dir}/{timestamp[:10]}_{config_hash}.json"
    with open(filename, "w") as f:
        json.dump(run_record, f, indent=2)
    return filename

def check_for_regression(
    current_metrics: dict,
    baseline_path: str,
    tolerance: float = 0.05,
) -> list[str]:
    """Return list of metric regressions exceeding tolerance."""
    with open(baseline_path) as f:
        baseline = json.load(f)["metrics"]

    regressions = []
    for metric, value in current_metrics.items():
        if metric not in baseline:
            continue
        drop = baseline[metric] - value
        if drop > tolerance:
            regressions.append(
                f"{metric}: {baseline[metric]:.3f} -> {value:.3f} (drop: {drop:.3f})"
            )
    return regressions

# Example usage in CI
PIPELINE_CONFIG = {
    "embedding_model": "voyage-3",
    "chunk_size": 512,
    "chunk_overlap": 50,
    "top_k": 5,
    "llm_model": "claude-opus-4-5",
    "temperature": 0.1,
}

current_metrics = {
    "retrieval_recall_at_5": 0.87,
    "answer_completeness": 0.82,
    "abstention_accuracy": 0.95,
    "faithfulness": 0.91,
}

filename = save_eval_run(current_metrics, PIPELINE_CONFIG)
print(f"Run saved to {filename}")`,
        }}
      />

      <h2>CI/CD Integration</h2>

      <p>
        RAG quality gates belong in your CI pipeline alongside unit tests and linting. The key
        challenge is cost and speed: running the full golden dataset through the LLM on every
        PR is expensive. Use a tiered strategy: fast retrieval-only tests on every commit, full
        end-to-end evaluation on merges to main.
      </p>

      <SDKExample
        title="GitHub Actions Workflow for RAG Evaluation"
        tabs={{
          yaml: `name: RAG Quality Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
  VOYAGE_API_KEY: \${{ secrets.VOYAGE_API_KEY }}

jobs:
  retrieval-tests:
    # Fast: runs on every PR — no LLM calls, only embedding + vector search
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - run: pytest tests/test_retrieval.py -v --timeout=60

  full-rag-eval:
    # Full evaluation: only runs on merge to main to save API costs
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - name: Run full test suite
        run: pytest tests/ -v --timeout=300
      - name: Check for regressions vs baseline
        run: python scripts/check_regression.py
      - name: Upload eval results
        uses: actions/upload-artifact@v4
        with:
          name: eval-results
          path: tests/eval_runs/`,
        }}
      />

      <BestPracticeBlock title="Keep the Golden Dataset Small and Curated">
        <p>
          Resist the temptation to auto-generate hundreds of test cases. A carefully curated set
          of 50–100 questions that cover your actual failure modes is more valuable than a
          machine-generated set of 1000. Each golden sample should be reviewed by a domain expert,
          cover a distinct scenario, and have clearly verifiable expected outputs. Review and update
          the dataset quarterly as you discover new failure modes in production.
        </p>
      </BestPracticeBlock>

      <WarningBlock title="LLM-Generated Test Cases Are Circular">
        <p>
          Generating golden answers with the same LLM you are testing creates a circular evaluation
          loop — the model will tend to regenerate similar outputs and any systematic error will
          not be caught. Write expected answers manually or have domain experts review
          LLM-generated drafts before including them in the golden dataset.
        </p>
      </WarningBlock>

      <NoteBlock
        title="Minimum viable test suite"
        content="If you are starting from zero, implement these three tests first: (1) retrieval recall — are the right documents retrieved? (2) abstention — does the system say 'I don't know' when it should? (3) latency — does the pipeline complete within your SLA? These three tests catch the majority of production failures and take under a day to implement."
      />
    </div>
  );
}
