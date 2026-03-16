import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function ModelGarden() {
  return (
    <article className="prose-content">
      <h2>Vertex AI Model Garden</h2>
      <p>
        Vertex AI Model Garden is Google Cloud's curated catalog of foundation models —
        first-party (Gemini, Gemma), third-party (Llama, Mistral, Claude, Falcon), and
        open-source models. Each model can be deployed to a managed Vertex AI endpoint,
        fine-tuned with your data, and integrated into Vertex AI Pipelines for MLOps.
        Model Garden eliminates the infrastructure work of serving large models: you get
        autoscaling, load balancing, monitoring, and logging out of the box.
      </p>

      <ArchitectureDiagram
        title="Vertex AI Model Garden Deployment Flow"
        width={700}
        height={280}
        nodes={[
          { id: 'garden', label: 'Model Garden\nCatalog', type: 'store', x: 80, y: 140 },
          { id: 'registry', label: 'Vertex AI\nModel Registry', type: 'store', x: 260, y: 140 },
          { id: 'finetune', label: 'Fine-Tuning\nJob', type: 'agent', x: 260, y: 240 },
          { id: 'endpoint', label: 'Managed\nEndpoint', type: 'agent', x: 450, y: 140 },
          { id: 'serverless', label: 'Serverless\nEndpoint', type: 'agent', x: 450, y: 240 },
          { id: 'app', label: 'Application', type: 'external', x: 620, y: 190 },
        ]}
        edges={[
          { from: 'garden', to: 'registry', label: 'deploy' },
          { from: 'garden', to: 'finetune', label: 'fine-tune' },
          { from: 'finetune', to: 'registry', label: 'register' },
          { from: 'registry', to: 'endpoint', label: 'dedicated' },
          { from: 'registry', to: 'serverless', label: 'serverless' },
          { from: 'endpoint', to: 'app' },
          { from: 'serverless', to: 'app' },
        ]}
      />

      <h2>Available Models</h2>

      <ConceptBlock term="First-Party and Partner Models">
        <p>
          Model Garden includes Google's own <strong>Gemma 2</strong> family (2B, 9B, 27B
          parameter open weights), which are optimized for on-device and on-premises deployment
          with commercial use licenses. From Meta, <strong>Llama 3.1</strong> (8B, 70B, 405B)
          and <strong>Llama 3.2</strong> (1B, 3B, 11B multimodal, 90B multimodal) are available.
          <strong>Mistral Large 2</strong> and <strong>Mistral Nemo</strong> (12B, Apache 2.0
          licensed) provide strong European-origin multilingual capabilities. Anthropic's{' '}
          <strong>Claude 3.5 Sonnet</strong> and <strong>Claude 3 Haiku</strong> are available
          as managed third-party models. <strong>CodeLlama</strong> (7B, 13B, 34B) and{' '}
          <strong>Falcon 180B</strong> round out the catalog for specialized use cases.
        </p>
      </ConceptBlock>

      <h2>Deployment Options</h2>

      <h3>Dedicated Endpoints</h3>
      <p>
        Dedicated endpoints provision exclusive compute (A100 or H100 GPUs) for your model.
        You control the machine type, accelerator count, min/max replicas, and autoscaling
        policy. Dedicated endpoints guarantee throughput and are billed by uptime regardless
        of usage — ideal for high-volume, latency-sensitive production workloads.
      </p>

      <h3>Serverless (On-Demand) Endpoints</h3>
      <p>
        Serverless endpoints share compute infrastructure across customers. You pay per token
        with no uptime commitment — there is no idle cost. Cold starts add 5–30 seconds of
        latency for the first request after inactivity. Serverless is the right choice for
        development, testing, low-volume production, and batch processing workloads.
      </p>

      <SDKExample
        title="Deploying and Calling a Model from Model Garden"
        tabs={{
          python: `import vertexai
from vertexai.preview.language_models import TextGenerationModel
from google.cloud.aiplatform import Model, Endpoint
from google.cloud import aiplatform

vertexai.init(project="my-gcp-project", location="us-central1")
aiplatform.init(project="my-gcp-project", location="us-central1")

# ---- Option 1: Deploy Llama 3.1 8B to a dedicated endpoint ----

# Get the pre-built model artifact from Model Garden
# Model Garden model IDs follow the format: publishers/{org}/models/{name}
model = aiplatform.Model(
    model_name="projects/my-gcp-project/locations/us-central1/models/llama-3-1-8b-instruct"
)

# Deploy to a dedicated endpoint (takes 5–15 minutes)
endpoint = model.deploy(
    deployed_model_display_name="llama-31-8b-prod",
    machine_type="g2-standard-12",     # 1x NVIDIA L4 GPU
    accelerator_type="NVIDIA_L4",
    accelerator_count=1,
    min_replica_count=1,
    max_replica_count=3,               # Autoscale up to 3 replicas
    traffic_percentage=100,
)

print(f"Endpoint deployed: {endpoint.resource_name}")

# ---- Option 2: Use Llama 3.1 via Serverless (Model Garden API) ----
from vertexai.generative_models import GenerativeModel

# Serverless Llama via the OpenAI-compatible endpoint
# Note: use google.auth for auth, not an API key
import google.auth
import google.auth.transport.requests
from openai import OpenAI

credentials, project = google.auth.default()
credentials.refresh(google.auth.transport.requests.Request())

openai_client = OpenAI(
    base_url=f"https://us-central1-aiplatform.googleapis.com/v1beta1/projects/{project}/locations/us-central1/endpoints/openapi",
    api_key=credentials.token,
)

response = openai_client.chat.completions.create(
    model="meta/llama-3.1-405b-instruct-maas",
    messages=[
        {"role": "system", "content": "You are a helpful coding assistant."},
        {"role": "user", "content": "Write a Python function to implement binary search."},
    ],
    max_tokens=1024,
    temperature=0.1,
)
print(response.choices[0].message.content)

# ---- Option 3: Call an already-deployed dedicated endpoint ----
endpoint = aiplatform.Endpoint("projects/my-gcp-project/locations/us-central1/endpoints/1234567890")

instances = [{
    "prompt": "<|begin_of_text|><|start_header_id|>user<|end_header_id|>\\n\\nExplain RAG in one paragraph.<|eot_id|><|start_header_id|>assistant<|end_header_id|>\\n\\n",
    "max_tokens": 512,
    "temperature": 0.3,
}]

response = endpoint.predict(instances=instances)
print(response.predictions[0])`,
        }}
      />

      <h2>Fine-Tuning on Vertex AI</h2>

      <h3>Supervised Fine-Tuning (SFT)</h3>
      <p>
        Supervised fine-tuning adapts a model to a specific task or domain using labeled
        examples in JSONL format. Vertex AI manages the training infrastructure, handles
        checkpointing, and registers the fine-tuned model in your model registry.
      </p>

      <CodeBlock language="python" filename="vertex_sft.py">
{`from vertexai.preview.tuning import sft
import vertexai

vertexai.init(project="my-gcp-project", location="us-central1")

# Training data in JSONL format on GCS
# Each line: {"input_text": "...", "output_text": "..."}
# Or for chat: {"messages": [{"role": "user", "content": "..."}, {"role": "model", "content": "..."}]}

# Supervised fine-tuning on Gemini 1.5 Flash
tuning_job = sft.train(
    source_model="gemini-1.5-flash-002",
    train_dataset="gs://my-bucket/training_data.jsonl",
    validation_dataset="gs://my-bucket/validation_data.jsonl",
    epochs=3,
    learning_rate_multiplier=1.0,
    tuned_model_display_name="gemini-flash-finetuned-v1",
    # Adapter config (PEFT LoRA)
    adapter_size="ADAPTER_SIZE_FOUR",  # LoRA rank 4
)

# Poll until completion
tuning_job.wait()
print(f"Fine-tuned model: {tuning_job.tuned_model_name}")
print(f"Endpoint: {tuning_job.tuned_model_endpoint_name}")

# Use the fine-tuned model
from vertexai.generative_models import GenerativeModel
model = GenerativeModel(tuning_job.tuned_model_endpoint_name)
response = model.generate_content("Your domain-specific prompt here")
print(response.text)`}
      </CodeBlock>

      <h3>LoRA Fine-Tuning for Open Models</h3>
      <CodeBlock language="python" filename="vertex_lora.py">
{`# LoRA fine-tuning for open models (Llama, Mistral, Gemma) via Vertex AI custom training
from google.cloud import aiplatform

aiplatform.init(project="my-gcp-project", location="us-central1")

# Use a pre-built training container from Vertex AI
job = aiplatform.CustomContainerTrainingJob(
    display_name="llama-lora-finetune",
    container_uri="us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.2-2:latest",
    command=["python", "train_lora.py"],
    model_serving_container_image_uri=(
        "us-docker.pkg.dev/vertex-ai/prediction/pytorch-gpu.2-2:latest"
    ),
)

model = job.run(
    args=[
        "--base_model=meta-llama/Llama-3.1-8B-Instruct",
        "--train_data=gs://my-bucket/train.jsonl",
        "--output_dir=/gcs/my-bucket/lora-output",
        "--lora_r=16",
        "--lora_alpha=32",
        "--num_train_epochs=3",
        "--per_device_train_batch_size=4",
        "--gradient_checkpointing=true",
    ],
    replica_count=1,
    machine_type="a2-highgpu-1g",
    accelerator_type="NVIDIA_TESLA_A100",
    accelerator_count=1,
    base_output_dir="gs://my-bucket/lora-output",
)
print(f"Training job: {job.resource_name}")`}
      </CodeBlock>

      <h2>Model Evaluation</h2>

      <CodeBlock language="python" filename="vertex_model_eval.py">
{`from vertexai.preview.evaluation import EvalTask
import pandas as pd

# Compare base model vs fine-tuned model
eval_dataset = pd.DataFrame({
    "prompt": [
        "Classify this support ticket: 'My payment failed with error code 402'",
        "Classify this support ticket: 'App crashes when I try to export to PDF'",
        "Classify this support ticket: 'I need to update my billing address'",
    ],
    "reference": ["billing", "bug", "account"],
})

# Evaluate base model
base_eval = EvalTask(
    dataset=eval_dataset,
    metrics=["exact_match", "rouge_1", "bleu"],
)
base_results = base_eval.evaluate(model="gemini-1.5-flash-002")

# Evaluate fine-tuned model
ft_eval = EvalTask(
    dataset=eval_dataset,
    metrics=["exact_match", "rouge_1", "bleu"],
)
ft_results = ft_eval.evaluate(model=tuning_job.tuned_model_endpoint_name)

print("Base model:", base_results.summary_metrics)
print("Fine-tuned:", ft_results.summary_metrics)`}
      </CodeBlock>

      <h2>Pricing Comparison</h2>

      <CodeBlock language="text" filename="pricing_comparison.txt">
{`Deployment Mode | Model           | Input ($/1M tokens) | Output ($/1M tokens) | Notes
----------------|-----------------|---------------------|----------------------|-------
Serverless      | Llama 3.1 8B    | $0.20               | $0.20                | Shared GPU, cold starts
Serverless      | Llama 3.1 70B   | $0.90               | $0.90                | Shared GPU
Serverless      | Mistral Nemo    | $0.30               | $0.30                | 12B, Apache 2.0
Serverless      | Mistral Large 2 | $2.00               | $6.00                | 123B
Dedicated       | Llama 3.1 8B    | ~$0.05              | ~$0.05               | g2-standard-12, estimated at 1M/hr throughput
Dedicated       | Llama 3.1 70B   | ~$0.40              | ~$0.40               | a2-highgpu-4g, 4x A100
Vertex AI (API) | Gemini 2.0 Flash| $0.075              | $0.30                | No deployment cost
Vertex AI (API) | Gemini 1.5 Pro  | $1.25 (<128K ctx)   | $5.00                | $2.50 / $10.00 for >128K

Rule of thumb: Dedicated endpoints break even vs serverless at ~2M tokens/day for 8B models.
Use serverless for dev/test and low-volume. Use dedicated for >1M tokens/day or strict SLA.`}
      </CodeBlock>

      <PatternBlock
        name="Model Garden for Private Model Deployment"
        category="MLOps"
        whenToUse="When regulations prohibit sending data to third-party model APIs (e.g., PHI in healthcare, classified government data) but you need LLM capabilities — deploy an open model like Llama 3.1 or Gemma 2 to a dedicated endpoint in your VPC."
      >
        <p>
          Deploy to a Vertex AI endpoint inside a VPC Service Control perimeter to ensure
          no data leaves your GCP organization boundary. Use private IP endpoints and
          VPC-SC policies to prevent exfiltration. Combine with CMEK encryption for the
          model artifacts. This approach gives you full LLM capability within a compliance
          boundary that third-party APIs (OpenAI, Anthropic direct) cannot match.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Vertex AI Pipelines for MLOps">
        <p>Use Vertex AI Pipelines (Kubeflow Pipelines v2) to automate the full model
        lifecycle: data preprocessing → fine-tuning → evaluation → conditional deployment
        (only promote if eval metrics exceed threshold). Store pipeline artifacts in
        Vertex AI Artifact Registry for lineage tracking. Schedule pipelines on a cron
        trigger to continuously fine-tune on new data. This gives you reproducible,
        auditable model improvement cycles without manual intervention.</p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Model License Compliance">
        <p>
          Llama models require accepting Meta's Community License Agreement before
          deployment — this is enforced in the Model Garden UI. Llama 3.1 allows commercial
          use for most companies but has restrictions for products with over 700M monthly
          active users. Gemma 2 uses a permissive license that allows commercial use,
          modification, and distribution. Always verify the specific model's license
          before deploying to production.
        </p>
      </NoteBlock>
    </article>
  )
}
