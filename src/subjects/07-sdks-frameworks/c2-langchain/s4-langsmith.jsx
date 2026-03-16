import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function LangSmith() {
  return (
    <article className="prose-content">
      <h2>LangSmith</h2>
      <p>
        LangSmith is LangChain's observability, evaluation, and prompt-management platform.
        It provides tracing for every LLM call and chain step, a dataset/evaluation harness for
        systematic testing, and a prompt hub for versioning prompts across environments.
      </p>

      <ConceptBlock term="LangSmith Tracing">
        <p>
          LangSmith tracing captures the full execution tree of every LangChain and LangGraph
          run — inputs, outputs, latency, token usage, and errors — at every level of nesting.
          Traces are sent asynchronously via background threads so they add no observable latency
          to your application.
        </p>
      </ConceptBlock>

      <h2>Setup and Configuration</h2>

      <SecurityCallout title="API Key Management" severity="medium">
        <p>Set <code>LANGCHAIN_API_KEY</code> via environment variable, never in source code.
        LangSmith supports project-level API keys — create separate keys for dev, staging, and
        production environments so you can rotate them independently.</p>
      </SecurityCallout>

      <SDKExample
        title="Enabling LangSmith Tracing"
        tabs={{
          python: `import os

# Configure via environment variables (before importing langchain)
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-api-key"
os.environ["LANGCHAIN_PROJECT"] = "my-rag-app"   # Project name for grouping

# That's it — all LangChain/LangGraph code now auto-traces
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatAnthropic(model="claude-opus-4-6")
chain = (
    ChatPromptTemplate.from_template("Explain {topic} in one paragraph.")
    | llm
    | StrOutputParser()
)

# This call is automatically traced to LangSmith
result = chain.invoke({"topic": "vector databases"})
print(result)`,
          typescript: `// Set environment variables before running
// LANGCHAIN_TRACING_V2=true
// LANGCHAIN_API_KEY=your-key
// LANGCHAIN_PROJECT=my-rag-app

import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Auto-tracing is enabled via env vars — no code changes needed
const llm = new ChatAnthropic({ model: 'claude-opus-4-6' });

const chain = ChatPromptTemplate.fromTemplate('Explain {topic} in one paragraph.')
  .pipe(llm)
  .pipe(new StringOutputParser());

// Automatically traced
const result = await chain.invoke({ topic: 'vector databases' });
console.log(result);`,
        }}
      />

      <h2>Custom Tracing with @traceable</h2>
      <p>
        The <code>@traceable</code> decorator traces any Python function — not just LangChain
        components. Use it to wrap custom retrieval logic, preprocessing steps, or entire
        pipeline entry points.
      </p>

      <SDKExample
        title="Tracing Custom Functions"
        tabs={{
          python: `from langsmith import traceable
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json

llm = ChatAnthropic(model="claude-opus-4-6")

@traceable(name="retrieve-documents", tags=["retrieval"])
def retrieve_documents(query: str, top_k: int = 5) -> list[dict]:
    """Simulates retrieval from a vector store."""
    # In production, this would call your actual vector store
    return [
        {"content": f"Document {i} about {query}", "score": 0.9 - i * 0.05}
        for i in range(top_k)
    ]

@traceable(name="format-context", tags=["preprocessing"])
def format_context(docs: list[dict]) -> str:
    """Format retrieved documents into a context string."""
    return "\\n\\n".join(
        f"[{i+1}] {doc['content']} (score: {doc['score']:.2f})"
        for i, doc in enumerate(docs)
    )

@traceable(name="rag-pipeline", run_type="chain", tags=["rag", "v2"])
def rag_answer(question: str) -> str:
    """Full RAG pipeline — retrieval + generation."""
    docs = retrieve_documents(question, top_k=4)
    context = format_context(docs)

    chain = (
        ChatPromptTemplate.from_messages([
            ("system", "Answer based only on the context provided."),
            ("human", "Context:\\n{context}\\n\\nQuestion: {question}"),
        ])
        | llm
        | StrOutputParser()
    )

    return chain.invoke({"context": context, "question": question})

answer = rag_answer("What is HNSW indexing?")
print(answer)
# Full trace visible in LangSmith, showing all nested steps`,
        }}
      />

      <h2>Datasets and Evaluation</h2>
      <p>
        LangSmith datasets store input/output examples for systematic evaluation. You can create
        datasets from hand-crafted examples or by pulling from production traces.
      </p>

      <SDKExample
        title="Creating Datasets and Running Evaluations"
        tabs={{
          python: `from langsmith import Client
from langsmith.evaluation import evaluate, LangChainStringEvaluator

client = Client()

# 1. Create a dataset
dataset_name = "rag-qa-v1"
dataset = client.create_dataset(
    dataset_name=dataset_name,
    description="QA pairs for RAG pipeline evaluation",
)

# 2. Add examples (question + expected answer)
examples = [
    {
        "inputs": {"question": "What is the capital of France?"},
        "outputs": {"answer": "Paris"},
    },
    {
        "inputs": {"question": "Who invented the transformer architecture?"},
        "outputs": {"answer": "Vaswani et al. at Google Brain in 2017"},
    },
    {
        "inputs": {"question": "What does RAG stand for?"},
        "outputs": {"answer": "Retrieval-Augmented Generation"},
    },
]
client.create_examples(
    inputs=[e["inputs"] for e in examples],
    outputs=[e["outputs"] for e in examples],
    dataset_id=dataset.id,
)

# 3. Define the function to evaluate
def my_rag_app(inputs: dict) -> dict:
    answer = rag_answer(inputs["question"])
    return {"answer": answer}

# 4. Run evaluation with built-in evaluators
results = evaluate(
    my_rag_app,
    data=dataset_name,
    evaluators=[
        LangChainStringEvaluator("cot_qa"),         # Chain-of-thought QA correctness
        LangChainStringEvaluator("labeled_criteria",  # Custom criterion
            config={
                "criteria": "conciseness",
                "llm": ChatAnthropic(model="claude-opus-4-6"),
            }
        ),
    ],
    experiment_prefix="rag-v2",
    metadata={"version": "2.0", "retriever": "chroma"},
)

print(f"Experiment URL: {results.experiment_url}")
print(f"Mean correctness: {results.to_pandas()['cot_qa'].mean():.2f}")`,
        }}
      />

      <h2>Prompt Hub</h2>
      <p>
        LangSmith Prompt Hub stores, versions, and serves prompts. Pull the latest prompt at
        runtime to update prompts without redeploying your application.
      </p>

      <SDKExample
        title="Prompt Hub: Push and Pull Prompts"
        tabs={{
          python: `from langsmith import Client
from langchain import hub
from langchain_core.prompts import ChatPromptTemplate

client = Client()

# Push a prompt to the hub
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful assistant. Answer the question based only on the
provided context. If the context doesn't contain the answer, say 'I don't know'.

Context:
{context}"""),
    ("human", "{question}"),
])

# Push (creates a new version automatically)
url = client.push_prompt("rag-assistant-v1", object=rag_prompt)
print(f"Pushed to: {url}")

# Pull the latest version at runtime
prompt = hub.pull("your-org/rag-assistant-v1")

# Pull a specific commit (for reproducibility)
prompt_pinned = hub.pull("your-org/rag-assistant-v1:abc12345")

# Use like any ChatPromptTemplate
chain = prompt | llm | StrOutputParser()
result = chain.invoke({"context": "...", "question": "What is RAG?"})`,
        }}
      />

      <h2>Online Evaluation</h2>
      <p>
        LangSmith can automatically evaluate production runs using online evaluators — LLM judges
        that score every trace or a sample of traces as they arrive.
      </p>

      <SDKExample
        title="Setting Up Online Evaluators"
        tabs={{
          python: `from langsmith import Client
from langsmith.schemas import RunRuleConfig

client = Client()

# Configure an online evaluator for the project
# (Can also be done via the LangSmith UI)
evaluator_config = RunRuleConfig(
    display_name="Conciseness Check",
    evaluator_type="llm",
    llm_as_judge_config={
        "prompt_template": """Evaluate whether the following response is concise.
Score 1 if concise, 0 if verbose.

Response: {output}

Score:""",
        "model": "claude-opus-4-6",
        "score_key": "conciseness",
    },
    sampling_rate=0.1,  # Evaluate 10% of production runs
)
# Configure via client.create_run_rule(project_name="my-rag-app", config=evaluator_config)
# (API may vary by LangSmith version — check latest docs)`,
        }}
      />

      <BestPracticeBlock title="Tag Runs for Easy Filtering">
        <p>Use consistent tags and metadata on all runs: environment (<code>prod</code>,
        <code>staging</code>), version numbers, user cohorts, and feature flags. LangSmith's
        filtering and dashboard features become vastly more useful when you can slice traces
        by these dimensions. Add tags via <code>.with_config(tags=["prod", "v2.1"])</code>
        or in <code>@traceable</code> decorator arguments.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Tracing Non-LangChain Code">
        <p>LangSmith's <code>@traceable</code> decorator works with any Python function, including
        direct Anthropic SDK calls, database queries, and custom logic. You don't need to use
        LangChain components to benefit from LangSmith observability — it's a general-purpose
        LLM observability tool.</p>
      </NoteBlock>
    </article>
  )
}
