import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function AzureAIFoundry() {
  return (
    <article className="prose-content">
      <h2>Azure AI Foundry</h2>
      <p>
        Azure AI Foundry (rebranded from Azure AI Studio in late 2024) is Microsoft's unified
        platform for the complete AI application lifecycle: explore the model catalog, fine-tune
        models, build and evaluate prompt flows, deploy endpoints, and monitor in production.
        It is organized around <strong>Hubs</strong> (shared infrastructure and governance) and
        <strong>Projects</strong> (isolated workspaces per team or application). All projects
        within a Hub share the same connected resources: Azure OpenAI, Azure AI Search, storage,
        and key vault.
      </p>

      <ConceptBlock term="Hub and Project Architecture">
        <p>
          A <strong>Hub</strong> is the top-level resource that owns the shared infrastructure —
          compute clusters, network configuration, managed identity, and connections to external
          services. <strong>Projects</strong> are scoped workspaces within a Hub that contain
          prompt flows, evaluations, deployments, and experiment tracking. This separation lets
          platform teams manage security and cost centrally while product teams iterate freely
          within their projects.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Azure AI Foundry Platform Architecture"
        width={700}
        height={340}
        nodes={[
          { id: 'dev', label: 'Developer', type: 'external', x: 70, y: 170 },
          { id: 'hub', label: 'AI Foundry Hub\n(governance)', type: 'agent', x: 220, y: 170 },
          { id: 'proj', label: 'Project\n(workspace)', type: 'agent', x: 390, y: 170 },
          { id: 'catalog', label: 'Model Catalog\n(250+ models)', type: 'llm', x: 560, y: 80 },
          { id: 'pf', label: 'Prompt Flow\n(pipelines)', type: 'tool', x: 560, y: 160 },
          { id: 'eval', label: 'AI Evaluations\n(quality + safety)', type: 'tool', x: 560, y: 240 },
          { id: 'aoai', label: 'Azure OpenAI', type: 'llm', x: 220, y: 290 },
          { id: 'search', label: 'AI Search', type: 'store', x: 390, y: 290 },
        ]}
        edges={[
          { from: 'dev', to: 'hub' },
          { from: 'hub', to: 'proj' },
          { from: 'proj', to: 'catalog' },
          { from: 'proj', to: 'pf' },
          { from: 'proj', to: 'eval' },
          { from: 'hub', to: 'aoai', label: 'connection' },
          { from: 'hub', to: 'search', label: 'connection' },
        ]}
      />

      <h2>Model Catalog</h2>
      <p>
        The model catalog aggregates models from Microsoft Research, OpenAI, Meta, Mistral AI,
        Cohere, and the broader open-source ecosystem. Models are organized into collections
        and can be deployed as <strong>serverless API endpoints</strong> (pay-per-token, no
        infrastructure) or to <strong>managed compute</strong> (dedicated VMs with GPU, required
        for fine-tuned models and very large open-weight models).
      </p>

      <ConceptBlock term="Key Model Families in the Catalog">
        <p>
          <strong>Phi-4</strong> (3.8B): Microsoft's state-of-the-art small language model,
          outperforming much larger models on reasoning benchmarks. Ideal for edge deployment
          and cost-sensitive workloads. <strong>Llama 3.3 70B</strong>: Meta's open-weight model
          with strong instruction-following; available as serverless API. <strong>Mistral
          Large 2</strong>: 123B parameter model strong at multilingual tasks and function
          calling. <strong>Command R+</strong> (Cohere): Optimized for RAG with 128K context
          and native tool use. <strong>Cohere Embed v3</strong>: Domain-specialized embeddings
          with compression support. Each model page in the catalog shows benchmark comparisons,
          pricing, and a built-in playground.
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="model_catalog_inference.py">
{`# Serverless API endpoints use the Azure AI Inference SDK
# pip install azure-ai-inference azure-identity

from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage, AssistantMessage
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential

# --- Serverless endpoint (Meta Llama, Mistral, Cohere, etc.) ---
# Endpoint URL is found on the model's deployment page in AI Foundry
client = ChatCompletionsClient(
    endpoint="https://my-project.eastus.models.ai.azure.com",
    credential=AzureKeyCredential("..."),  # or DefaultAzureCredential()
)

response = client.complete(
    model="Llama-3.3-70B-Instruct",  # Some endpoints serve one model; others accept model param
    messages=[
        SystemMessage(content="You are a precise technical assistant."),
        UserMessage(content="What is the key architectural difference between Phi-4 and Llama 3.3?"),
    ],
    temperature=0.3,
    max_tokens=512,
    top_p=0.95,
)

print(response.choices[0].message.content)
print(f"Model: {response.model}")
print(f"Usage: {response.usage.prompt_tokens} prompt, {response.usage.completion_tokens} completion")

# --- Streaming from a catalog model ---
stream = client.complete(
    model="Llama-3.3-70B-Instruct",
    messages=[UserMessage(content="Explain mixture-of-experts architecture.")],
    stream=True,
)

for update in stream:
    if update.choices and update.choices[0].delta.content:
        print(update.choices[0].delta.content, end="", flush=True)

# --- Embeddings (Cohere Embed v3 via serverless) ---
from azure.ai.inference import EmbeddingsClient

embed_client = EmbeddingsClient(
    endpoint="https://my-project.eastus.models.ai.azure.com",
    credential=AzureKeyCredential("..."),
)

embed_response = embed_client.embed(
    model="cohere-embed-v3-english",
    input=["Azure AI Foundry simplifies model deployment", "LLM evaluation is critical"],
    input_type="search_document",  # or "search_query" for query-side embeddings
    encoding_format="float",
)

vectors = [item.embedding for item in embed_response.data]
print(f"Embedding dimension: {len(vectors[0])}")`}
      </CodeBlock>

      <h2>Prompt Flow</h2>
      <p>
        Prompt Flow is a visual DAG-based development tool for building LLM application pipelines.
        Each node in the flow is a Python function, an LLM call, or a built-in tool (like
        Azure AI Search or Bing Search). Flows can be developed locally with the VS Code
        extension and deployed as streaming REST endpoints in AI Foundry.
      </p>

      <SDKExample
        title="Prompt Flow: Python SDK for Flow Execution and Evaluation"
        tabs={{
          python: `# pip install promptflow promptflow-azure
from promptflow.client import PFClient
from promptflow.azure import PFClient as AzurePFClient
from azure.identity import DefaultAzureCredential

# --- Local flow execution ---
pf = PFClient()

# Run a flow against a dataset (JSONL file)
run = pf.run(
    flow="./my_rag_flow",           # directory with flow.dag.yaml
    data="./eval_dataset.jsonl",    # {"question": "...", "ground_truth": "..."}
    column_mapping={
        "question": "\$\{data.question\}",
        "context": "\$\{data.context\}",
    },
    stream=True,
)

# Get outputs as a DataFrame
outputs_df = pf.get_details(run)
print(outputs_df[["question", "answer", "context"]].head())

# --- Azure execution (scale on managed compute) ---
ml_client_credential = DefaultAzureCredential()
azure_pf = AzurePFClient.from_config(credential=ml_client_credential)

azure_run = azure_pf.run(
    flow="./my_rag_flow",
    data="./eval_dataset.jsonl",
    runtime="automatic",            # serverless compute
    column_mapping={"question": "\$\{data.question\}"},
    display_name="rag-eval-2024-12",
    tags={"experiment": "chunking-strategy-v2"},
)

azure_pf.stream(azure_run)  # Stream logs

# --- Built-in evaluators ---
from promptflow.evals.evaluators import (
    GroundednessEvaluator,
    RelevanceEvaluator,
    CoherenceEvaluator,
    FluencyEvaluator,
    SimilarityEvaluator,
)

# Each evaluator uses a GPT-4 judge by default
model_config = {
    "azure_endpoint": "https://my-resource.openai.azure.com/",
    "api_key": "...",
    "azure_deployment": "gpt-4o",
    "api_version": "2024-12-01-preview",
}

groundedness_eval = GroundednessEvaluator(model_config=model_config)
relevance_eval = RelevanceEvaluator(model_config=model_config)

# Evaluate a single response
result = groundedness_eval(
    question="What is Azure PTU pricing?",
    context="PTU stands for Provisioned Throughput Units...",
    answer="PTU is a reserved capacity model priced per hour.",
)
print(f"Groundedness score: {result['groundedness']}/5")
print(f"Reasoning: {result['groundedness_reason']}")

# Batch evaluation against a run
eval_run = azure_pf.run(
    flow="promptflow/evals/groundedness",
    data="./eval_dataset.jsonl",
    run=azure_run,  # evaluate outputs of a previous run
    column_mapping={
        "question": "\$\{data.question\}",
        "context": "\$\{data.context\}",
        "answer": "\$\{run.outputs.answer\}",
    },
)
print(azure_pf.get_metrics(eval_run))`,
        }}
      />

      <h2>AI Evaluations: Quality and Safety</h2>

      <ConceptBlock term="Evaluation Metric Definitions">
        <p>
          <strong>Groundedness</strong> (1–5): Is the response factually supported by the
          provided context? Critical for RAG systems to detect hallucination.
          <strong>Relevance</strong> (1–5): Does the response address the user's question?
          <strong>Coherence</strong> (1–5): Is the response logically consistent and well-structured?
          <strong>Fluency</strong> (1–5): Is the language natural and grammatically correct?
          <strong>Similarity</strong> (1–5): Semantic similarity to a ground-truth reference.
          <strong>F1 / BLEU / ROUGE</strong>: Token-overlap metrics, useful for extraction tasks.
          Safety evaluations cover violence, hate speech, sexual content, self-harm, and
          jailbreak detection — each scored with severity levels (very_low through high).
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="safety_evaluation.py">
{`# Safety evaluations require Azure AI Project connection
from promptflow.evals.evaluators import (
    ViolenceEvaluator,
    HateUnfairnessEvaluator,
    SexualEvaluator,
    SelfHarmEvaluator,
    IndirectAttackEvaluator,    # Prompt injection / XPIA
    ProtectedMaterialEvaluator, # Copyright detection
)
from promptflow.evals.evaluate import evaluate

azure_ai_project = {
    "subscription_id": "...",
    "resource_group_name": "my-rg",
    "project_name": "my-foundry-project",
}

model_config = {
    "azure_endpoint": "https://my-resource.openai.azure.com/",
    "api_key": "...",
    "azure_deployment": "gpt-4o",
    "api_version": "2024-12-01-preview",
}

# Run all evaluators in batch against a dataset
results = evaluate(
    data="./model_outputs.jsonl",  # {"question": "...", "answer": "...", "context": "..."}
    evaluators={
        "groundedness": GroundednessEvaluator(model_config),
        "relevance": RelevanceEvaluator(model_config),
        "violence": ViolenceEvaluator(azure_ai_project=azure_ai_project),
        "hate": HateUnfairnessEvaluator(azure_ai_project=azure_ai_project),
        "indirect_attack": IndirectAttackEvaluator(azure_ai_project=azure_ai_project),
    },
    evaluator_config={
        "groundedness": {"column_mapping": {
            "question": "\$\{data.question\}",
            "context": "\$\{data.context\}",
            "answer": "\$\{data.answer\}",
        }},
        "violence": {"column_mapping": {
            "question": "\$\{data.question\}",
            "answer": "\$\{data.answer\}",
        }},
    },
    azure_ai_project=azure_ai_project,  # Upload results to AI Foundry portal
    output_path="./eval_results.json",
)

print("Aggregate metrics:")
for metric, value in results["metrics"].items():
    print(f"  {metric}: {value:.2f}")`}
      </CodeBlock>

      <PatternBlock
        name="Evaluation-Driven Development"
        category="MLOps"
        whenToUse="When iterating on prompts, RAG configurations, or model selection. Run evaluations as part of your CI/CD pipeline to catch quality regressions before deployment."
      >
        <p>
          Maintain a curated evaluation dataset (100–500 question/context/ground-truth triples)
          that covers your use case's edge cases. Run evaluations against this dataset whenever
          you change the system prompt, chunking strategy, retrieval top-k, or model version.
          Gate deployments on minimum thresholds: e.g., groundedness &gt;= 3.5, relevance
          &gt;= 3.5, violence_defect_rate &lt;= 0.01. Store evaluation runs in AI Foundry for
          trend analysis over time.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Model Selection from the Catalog">
        <p>
          Do not default to the largest available model. Use the AI Foundry model benchmarks
          page to compare models on MMLU, HumanEval, and domain-specific benchmarks. Run
          your own evaluation dataset against 2–3 candidate models using the same evaluators
          before committing to a model. Phi-4 at 3.8B often matches GPT-4o on narrow,
          well-defined tasks at a fraction of the cost. Use serverless endpoints for
          prototyping — no infrastructure commitment until you have evidence of the right model.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Tracing and Observability">
        <p>
          AI Foundry includes built-in tracing for prompt flows. Every LLM call, tool call,
          and function execution is captured with input/output and latency. Traces are
          queryable in the portal and can be exported to Azure Monitor. For custom code
          outside Prompt Flow, instrument with the <code>azure-ai-inference</code> SDK's
          tracing support, which emits OpenTelemetry spans compatible with AI Foundry's
          trace viewer.
        </p>
      </NoteBlock>

      <NoteBlock type="warning" title="Serverless Endpoint Regional Availability">
        <p>
          Not all catalog models are available as serverless endpoints in all regions. Llama,
          Mistral, and Cohere models through the serverless marketplace may require your
          AI Foundry Hub to be in a specific region (e.g., East US, West US 3). Check the
          model card's "Deploy" tab for supported regions before architecting cross-region
          solutions.
        </p>
      </NoteBlock>
    </article>
  )
}
