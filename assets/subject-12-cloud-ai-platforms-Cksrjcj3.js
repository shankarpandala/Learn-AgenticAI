import{j as e}from"./vendor-Cs56uELc.js";import{C as n,A as a,a as t,S as r,P as s,B as i,N as o}from"./content-components-CDXEIxVK.js";function l(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Azure OpenAI Service"}),e.jsx("p",{children:"Azure OpenAI Service gives you access to OpenAI's models — including GPT-4o, o1, o3-mini, and text-embedding-3 — through Azure's enterprise infrastructure. This means private networking, managed identity authentication, compliance certifications (SOC 2, ISO 27001, HIPAA), regional data residency, and built-in content filtering. For production AI workloads, Azure OpenAI is the standard choice when operating within the Microsoft ecosystem."}),e.jsx(n,{term:"Deployment Types",children:e.jsxs("p",{children:["Azure OpenAI separates ",e.jsx("strong",{children:"model versions"})," from ",e.jsx("strong",{children:"deployments"}),". You create a deployment by assigning a model version to a named endpoint within your resource. Three deployment types exist: ",e.jsx("strong",{children:"Standard"})," (pay-per-token, shared compute, auto-scales), ",e.jsx("strong",{children:"Provisioned Throughput Units (PTU)"})," (reserved compute for consistent low-latency at high volume), and ",e.jsx("strong",{children:"Global Standard"}),"(Microsoft routes traffic across regions for higher throughput). PTU deployments are priced per hour regardless of utilization — they make sense only above roughly 40K TPM sustained load."]})}),e.jsx(a,{title:"Azure OpenAI Deployment Architecture",width:700,height:320,nodes:[{id:"app",label:"Application",type:"external",x:70,y:160},{id:"apim",label:`API Management
(rate limit, auth)`,type:"tool",x:220,y:160},{id:"aoai",label:`Azure OpenAI
Resource`,type:"agent",x:390,y:160},{id:"std",label:`Standard
Deployment`,type:"llm",x:560,y:80},{id:"ptu",label:`PTU
Deployment`,type:"llm",x:560,y:160},{id:"global",label:`Global Standard
Deployment`,type:"llm",x:560,y:240},{id:"vnet",label:`Private Endpoint
(VNet)`,type:"store",x:220,y:270},{id:"mi",label:`Managed Identity
(no keys)`,type:"store",x:390,y:270}],edges:[{from:"app",to:"apim"},{from:"apim",to:"aoai"},{from:"aoai",to:"std"},{from:"aoai",to:"ptu"},{from:"aoai",to:"global"},{from:"vnet",to:"aoai",label:"private"},{from:"mi",to:"aoai",label:"auth"}]}),e.jsx("h2",{children:"Authentication: Managed Identity over API Keys"}),e.jsxs("p",{children:["Azure OpenAI supports both API key and Entra ID (formerly Azure AD) authentication. In production, always use ",e.jsx("code",{children:"DefaultAzureCredential"})," from the",e.jsx("code",{children:"azure-identity"})," package. This credential chain automatically picks up the right identity: Managed Identity in Azure-hosted workloads, developer credentials locally, and service principals in CI/CD — all without storing secrets."]}),e.jsx(t,{language:"python",filename:"auth_setup.py",children:`from openai import AzureOpenAI
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

# DefaultAzureCredential tries in order:
# 1. Environment variables (AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_CLIENT_SECRET)
# 2. Workload Identity (AKS pods with federated credentials)
# 3. Managed Identity (Azure VMs, App Service, Container Apps)
# 4. Azure CLI credentials (local development)
# 5. Visual Studio / VS Code credentials

credential = DefaultAzureCredential()

token_provider = get_bearer_token_provider(
    credential,
    "https://cognitiveservices.azure.com/.default"
)

client = AzureOpenAI(
    azure_endpoint="https://my-resource.openai.azure.com/",
    azure_ad_token_provider=token_provider,
    api_version="2024-12-01-preview",
    # No api_key= — identity-based auth only
)

# Grant the identity "Cognitive Services OpenAI User" RBAC role
# on the Azure OpenAI resource in the Azure portal or via Bicep`}),e.jsx("h2",{children:"Core API Patterns"}),e.jsx(r,{title:"Chat Completions: Streaming + Tool Calling",tabs:{python:`import json
from openai import AzureOpenAI
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

credential = DefaultAzureCredential()
token_provider = get_bearer_token_provider(
    credential, "https://cognitiveservices.azure.com/.default"
)

client = AzureOpenAI(
    azure_endpoint="https://my-resource.openai.azure.com/",
    azure_ad_token_provider=token_provider,
    api_version="2024-12-01-preview",
)

# --- Tool definition ---
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_order_status",
            "description": "Retrieve the current status of a customer order",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The unique order identifier"
                    },
                    "include_tracking": {
                        "type": "boolean",
                        "description": "Whether to include carrier tracking info"
                    }
                },
                "required": ["order_id"]
            }
        }
    }
]

def get_order_status(order_id: str, include_tracking: bool = False) -> dict:
    # Real implementation would query your order database
    return {
        "order_id": order_id,
        "status": "shipped",
        "estimated_delivery": "2024-12-20",
        "tracking_number": "UPS1234567890" if include_tracking else None
    }

# --- Agentic loop with tool calling ---
messages = [
    {"role": "system", "content": "You are a customer support agent. Use tools to answer accurately."},
    {"role": "user", "content": "What's the status of my order ORD-98765? Include tracking info."}
]

while True:
    response = client.chat.completions.create(
        model="gpt-4o",          # deployment name, not model name
        messages=messages,
        tools=tools,
        tool_choice="auto",
        temperature=0,
        max_tokens=1024,
    )

    message = response.choices[0].message
    messages.append(message)

    if response.choices[0].finish_reason == "tool_calls":
        # Execute each requested tool call
        for tool_call in message.tool_calls:
            args = json.loads(tool_call.function.arguments)
            if tool_call.function.name == "get_order_status":
                result = get_order_status(**args)
            else:
                result = {"error": f"Unknown tool: {tool_call.function.name}"}

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result)
            })
        # Loop continues — model will now generate final answer
    else:
        # finish_reason == "stop" — we have the final answer
        print(message.content)
        break

# --- Streaming response ---
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain Azure PTU pricing briefly."}],
    stream=True,
    stream_options={"include_usage": True},  # Get token counts even with streaming
)

for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
    if chunk.usage:  # Final chunk contains usage stats
        print(f"\\n\\nTokens: {chunk.usage.prompt_tokens} in, {chunk.usage.completion_tokens} out")`}}),e.jsx("h2",{children:"Embeddings and Bring Your Own Data"}),e.jsx(t,{language:"python",filename:"embeddings_and_byod.py",children:`import numpy as np
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint="https://my-resource.openai.azure.com/",
    api_key="...",  # or use DefaultAzureCredential
    api_version="2024-12-01-preview",
)

# --- Embeddings with text-embedding-3-large ---
def embed_texts(texts: list[str], dimensions: int = 1536) -> list[list[float]]:
    """
    text-embedding-3-large supports matryoshka representation:
    you can reduce dimensions (256, 512, 1024, 1536, 3072) with minimal
    quality loss using the 'dimensions' parameter.
    """
    response = client.embeddings.create(
        model="text-embedding-3-large",   # deployment name
        input=texts,
        dimensions=dimensions,            # reduce for storage savings
    )
    return [item.embedding for item in response.data]

# Cosine similarity
def cosine_similarity(a: list[float], b: list[float]) -> float:
    a_np, b_np = np.array(a), np.array(b)
    return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))

# --- Bring Your Own Data (Azure AI Search integration) ---
# Adds grounded retrieval directly in the API call — no RAG code needed
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What is our refund policy for digital products?"}],
    extra_body={
        "data_sources": [
            {
                "type": "azure_search",
                "parameters": {
                    "endpoint": "https://my-search.search.windows.net",
                    "index_name": "product-policies",
                    "authentication": {
                        "type": "system_assigned_managed_identity"
                    },
                    "query_type": "vector_semantic_hybrid",
                    "semantic_configuration": "my-semantic-config",
                    "embedding_dependency": {
                        "type": "deployment_name",
                        "deployment_name": "text-embedding-3-large"
                    },
                    "top_n_documents": 5,
                    "strictness": 3,  # 1-5: how strictly to filter off-topic responses
                    "in_scope": True, # Refuse if answer not in documents
                }
            }
        ]
    }
)

# Citations are in the response
message = response.choices[0].message
print(message.content)
if hasattr(message, 'context') and message.context:
    for citation in message.context.get('citations', []):
        print(f"  Source: {citation['title']} — {citation['url']}")`}),e.jsx("h2",{children:"Content Filtering and Responsible AI"}),e.jsx(n,{term:"Content Filter Layers",children:e.jsxs("p",{children:["Azure OpenAI applies content filters at both input (prompt) and output (completion) levels. Filters operate across four harm categories — ",e.jsx("strong",{children:"hate"}),",",e.jsx("strong",{children:"sexual"}),", ",e.jsx("strong",{children:"violence"}),", and ",e.jsx("strong",{children:"self-harm"})," — each with configurable thresholds (low, medium, high). Additional filters cover",e.jsx("strong",{children:"jailbreak / prompt injection"})," detection,",e.jsx("strong",{children:"protected material"})," (copyright), and",e.jsx("strong",{children:"groundedness"})," for grounded completion responses. Custom filter policies can be applied per deployment."]})}),e.jsx(t,{language:"python",filename:"content_filter_handling.py",children:`from openai import AzureOpenAI, BadRequestError

client = AzureOpenAI(
    azure_endpoint="https://my-resource.openai.azure.com/",
    api_key="...",
    api_version="2024-12-01-preview",
)

try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": user_input}],
    )
    content = response.choices[0].message.content

    # Check if output was filtered (finish_reason == "content_filter")
    if response.choices[0].finish_reason == "content_filter":
        print("Response was truncated by content filter")
        # Inspect which categories triggered
        filter_result = response.choices[0].content_filter_results
        for category, result in filter_result.items():
            if result.get('filtered'):
                print(f"  Filtered: {category} (severity: {result['severity']})")

except BadRequestError as e:
    # Prompt itself was filtered — e.innererror has details
    if e.code == "content_filter":
        print("Prompt was blocked by content filter")
        # e.body contains content_filter_result with per-category details
        print(e.body)`}),e.jsx(s,{name:"PTU + Standard Spillover",category:"Capacity Management",whenToUse:"When you have a baseline predictable load that justifies PTU reservations but also experience traffic spikes. Route primary traffic to PTU deployments and overflow to Standard when PTU returns 429s.",children:e.jsxs("p",{children:["Deploy a load balancer (Azure API Management or a custom retry wrapper) in front of multiple deployments. Primary deployment is PTU (low latency, consistent throughput). On HTTP 429 (capacity exceeded), route to a Standard deployment in the same or a different region. Use exponential backoff with jitter. APIM has a built-in",e.jsx("code",{children:"retry"})," policy that can handle this transparently."]})}),e.jsx(i,{title:"Quota Management and Cost Control",children:e.jsxs("p",{children:["Azure OpenAI quota is assigned at the subscription + region level, then distributed across deployments. Set ",e.jsx("strong",{children:"per-deployment TPM limits"})," explicitly — do not let a single deployment consume all quota. Use ",e.jsx("strong",{children:"Azure Monitor"})," metrics (",e.jsx("code",{children:"TokensPerMinuteUsagePercentage"}),", ",e.jsx("code",{children:"RequestsPerMinuteUsagePercentage"}),") with alerts at 80% to detect quota pressure early. For cost attribution in multi-tenant systems, tag requests with ",e.jsx("code",{children:"user"})," field in the API payload and export usage logs to Log Analytics."]})}),e.jsx(o,{type:"warning",title:"API Version Pinning",children:e.jsxs("p",{children:["Azure OpenAI API versions are date-stamped (e.g., ",e.jsx("code",{children:"2024-12-01-preview"}),"). Preview versions may have breaking changes. Pin to a specific GA version in production (e.g., ",e.jsx("code",{children:"2024-08-01-preview"})," became GA as ",e.jsx("code",{children:"2024-10-21"}),"). Preview versions are required for features like o1 structured outputs, real-time audio, and the latest tool-calling improvements. Maintain a tested upgrade path before bumping versions."]})}),e.jsx(o,{type:"tip",title:"Private Endpoint vs. VNet Integration",children:e.jsxs("p",{children:["Private endpoints bind the Azure OpenAI resource to a private IP in your VNet, preventing all public internet access. This is the correct choice for regulated industries. VNet integration (without private endpoints) still allows public access but adds network-level controls. Combine private endpoints with",e.jsx("strong",{children:"Private DNS Zones"})," so that ",e.jsx("code",{children:"*.openai.azure.com"})," resolves to the private IP within your VNet."]})})]})}const j=Object.freeze(Object.defineProperty({__proto__:null,default:l},Symbol.toStringTag,{value:"Module"}));function c(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Azure AI Foundry"}),e.jsxs("p",{children:["Azure AI Foundry (rebranded from Azure AI Studio in late 2024) is Microsoft's unified platform for the complete AI application lifecycle: explore the model catalog, fine-tune models, build and evaluate prompt flows, deploy endpoints, and monitor in production. It is organized around ",e.jsx("strong",{children:"Hubs"})," (shared infrastructure and governance) and",e.jsx("strong",{children:"Projects"})," (isolated workspaces per team or application). All projects within a Hub share the same connected resources: Azure OpenAI, Azure AI Search, storage, and key vault."]}),e.jsx(n,{term:"Hub and Project Architecture",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Hub"})," is the top-level resource that owns the shared infrastructure — compute clusters, network configuration, managed identity, and connections to external services. ",e.jsx("strong",{children:"Projects"})," are scoped workspaces within a Hub that contain prompt flows, evaluations, deployments, and experiment tracking. This separation lets platform teams manage security and cost centrally while product teams iterate freely within their projects."]})}),e.jsx(a,{title:"Azure AI Foundry Platform Architecture",width:700,height:340,nodes:[{id:"dev",label:"Developer",type:"external",x:70,y:170},{id:"hub",label:`AI Foundry Hub
(governance)`,type:"agent",x:220,y:170},{id:"proj",label:`Project
(workspace)`,type:"agent",x:390,y:170},{id:"catalog",label:`Model Catalog
(250+ models)`,type:"llm",x:560,y:80},{id:"pf",label:`Prompt Flow
(pipelines)`,type:"tool",x:560,y:160},{id:"eval",label:`AI Evaluations
(quality + safety)`,type:"tool",x:560,y:240},{id:"aoai",label:"Azure OpenAI",type:"llm",x:220,y:290},{id:"search",label:"AI Search",type:"store",x:390,y:290}],edges:[{from:"dev",to:"hub"},{from:"hub",to:"proj"},{from:"proj",to:"catalog"},{from:"proj",to:"pf"},{from:"proj",to:"eval"},{from:"hub",to:"aoai",label:"connection"},{from:"hub",to:"search",label:"connection"}]}),e.jsx("h2",{children:"Model Catalog"}),e.jsxs("p",{children:["The model catalog aggregates models from Microsoft Research, OpenAI, Meta, Mistral AI, Cohere, and the broader open-source ecosystem. Models are organized into collections and can be deployed as ",e.jsx("strong",{children:"serverless API endpoints"})," (pay-per-token, no infrastructure) or to ",e.jsx("strong",{children:"managed compute"})," (dedicated VMs with GPU, required for fine-tuned models and very large open-weight models)."]}),e.jsx(n,{term:"Key Model Families in the Catalog",children:e.jsxs("p",{children:[e.jsx("strong",{children:"Phi-4"})," (3.8B): Microsoft's state-of-the-art small language model, outperforming much larger models on reasoning benchmarks. Ideal for edge deployment and cost-sensitive workloads. ",e.jsx("strong",{children:"Llama 3.3 70B"}),": Meta's open-weight model with strong instruction-following; available as serverless API. ",e.jsx("strong",{children:"Mistral Large 2"}),": 123B parameter model strong at multilingual tasks and function calling. ",e.jsx("strong",{children:"Command R+"})," (Cohere): Optimized for RAG with 128K context and native tool use. ",e.jsx("strong",{children:"Cohere Embed v3"}),": Domain-specialized embeddings with compression support. Each model page in the catalog shows benchmark comparisons, pricing, and a built-in playground."]})}),e.jsx(t,{language:"python",filename:"model_catalog_inference.py",children:`# Serverless API endpoints use the Azure AI Inference SDK
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
print(f"Embedding dimension: {len(vectors[0])}")`}),e.jsx("h2",{children:"Prompt Flow"}),e.jsx("p",{children:"Prompt Flow is a visual DAG-based development tool for building LLM application pipelines. Each node in the flow is a Python function, an LLM call, or a built-in tool (like Azure AI Search or Bing Search). Flows can be developed locally with the VS Code extension and deployed as streaming REST endpoints in AI Foundry."}),e.jsx(r,{title:"Prompt Flow: Python SDK for Flow Execution and Evaluation",tabs:{python:`# pip install promptflow promptflow-azure
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
        "question": "\${data.question}",
        "context": "\${data.context}",
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
    column_mapping={"question": "\${data.question}"},
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
        "question": "\${data.question}",
        "context": "\${data.context}",
        "answer": "\${run.outputs.answer}",
    },
)
print(azure_pf.get_metrics(eval_run))`}}),e.jsx("h2",{children:"AI Evaluations: Quality and Safety"}),e.jsx(n,{term:"Evaluation Metric Definitions",children:e.jsxs("p",{children:[e.jsx("strong",{children:"Groundedness"})," (1–5): Is the response factually supported by the provided context? Critical for RAG systems to detect hallucination.",e.jsx("strong",{children:"Relevance"})," (1–5): Does the response address the user's question?",e.jsx("strong",{children:"Coherence"})," (1–5): Is the response logically consistent and well-structured?",e.jsx("strong",{children:"Fluency"})," (1–5): Is the language natural and grammatically correct?",e.jsx("strong",{children:"Similarity"})," (1–5): Semantic similarity to a ground-truth reference.",e.jsx("strong",{children:"F1 / BLEU / ROUGE"}),": Token-overlap metrics, useful for extraction tasks. Safety evaluations cover violence, hate speech, sexual content, self-harm, and jailbreak detection — each scored with severity levels (very_low through high)."]})}),e.jsx(t,{language:"python",filename:"safety_evaluation.py",children:`# Safety evaluations require Azure AI Project connection
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
            "question": "\${data.question}",
            "context": "\${data.context}",
            "answer": "\${data.answer}",
        }},
        "violence": {"column_mapping": {
            "question": "\${data.question}",
            "answer": "\${data.answer}",
        }},
    },
    azure_ai_project=azure_ai_project,  # Upload results to AI Foundry portal
    output_path="./eval_results.json",
)

print("Aggregate metrics:")
for metric, value in results["metrics"].items():
    print(f"  {metric}: {value:.2f}")`}),e.jsx(s,{name:"Evaluation-Driven Development",category:"MLOps",whenToUse:"When iterating on prompts, RAG configurations, or model selection. Run evaluations as part of your CI/CD pipeline to catch quality regressions before deployment.",children:e.jsx("p",{children:"Maintain a curated evaluation dataset (100–500 question/context/ground-truth triples) that covers your use case's edge cases. Run evaluations against this dataset whenever you change the system prompt, chunking strategy, retrieval top-k, or model version. Gate deployments on minimum thresholds: e.g., groundedness >= 3.5, relevance >= 3.5, violence_defect_rate <= 0.01. Store evaluation runs in AI Foundry for trend analysis over time."})}),e.jsx(i,{title:"Model Selection from the Catalog",children:e.jsx("p",{children:"Do not default to the largest available model. Use the AI Foundry model benchmarks page to compare models on MMLU, HumanEval, and domain-specific benchmarks. Run your own evaluation dataset against 2–3 candidate models using the same evaluators before committing to a model. Phi-4 at 3.8B often matches GPT-4o on narrow, well-defined tasks at a fraction of the cost. Use serverless endpoints for prototyping — no infrastructure commitment until you have evidence of the right model."})}),e.jsx(o,{type:"info",title:"Tracing and Observability",children:e.jsxs("p",{children:["AI Foundry includes built-in tracing for prompt flows. Every LLM call, tool call, and function execution is captured with input/output and latency. Traces are queryable in the portal and can be exported to Azure Monitor. For custom code outside Prompt Flow, instrument with the ",e.jsx("code",{children:"azure-ai-inference"})," SDK's tracing support, which emits OpenTelemetry spans compatible with AI Foundry's trace viewer."]})}),e.jsx(o,{type:"warning",title:"Serverless Endpoint Regional Availability",children:e.jsx("p",{children:`Not all catalog models are available as serverless endpoints in all regions. Llama, Mistral, and Cohere models through the serverless marketplace may require your AI Foundry Hub to be in a specific region (e.g., East US, West US 3). Check the model card's "Deploy" tab for supported regions before architecting cross-region solutions.`})})]})}const S=Object.freeze(Object.defineProperty({__proto__:null,default:c},Symbol.toStringTag,{value:"Module"}));function d(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Azure AI Agent Service"}),e.jsx("p",{children:"Azure AI Agent Service is a fully managed runtime for deploying AI agents in production. It handles persistent thread storage, tool execution, file ingestion, vector store management, and streaming — so you write agent logic, not infrastructure. The API is compatible with OpenAI's Assistants API v2, meaning code written for OpenAI Assistants can be migrated to Azure AI Agent Service with minimal changes, while gaining Azure's security and compliance posture."}),e.jsx(n,{term:"Core Primitives",children:e.jsxs("p",{children:[e.jsx("strong",{children:"Agent"}),": A configured LLM instance with a system prompt, model assignment, and set of enabled tools. Created once, reused across many conversations.",e.jsx("strong",{children:"Thread"}),": A persistent conversation session. Threads store the full message history and are durable — users can resume conversations days later.",e.jsx("strong",{children:"Message"}),": A turn in the thread, from either the user or assistant. Messages can contain text, file attachments, and image content.",e.jsx("strong",{children:"Run"}),": An execution of the agent against a thread. A run processes pending user messages, invokes tools as needed, and produces assistant messages.",e.jsx("strong",{children:"Vector Store"}),": A managed embedding store for file search RAG, backed by Azure AI Search."]})}),e.jsx(a,{title:"Azure AI Agent Service Request Flow",width:700,height:320,nodes:[{id:"client",label:"Client App",type:"external",x:70,y:160},{id:"agent",label:`Agent
(system prompt + tools)`,type:"agent",x:220,y:160},{id:"thread",label:`Thread
(message history)`,type:"store",x:390,y:100},{id:"llm",label:`Azure OpenAI
GPT-4o / o1`,type:"llm",x:560,y:160},{id:"code",label:`Code Interpreter
(sandbox)`,type:"tool",x:390,y:200},{id:"filesearch",label:`File Search
(vector store)`,type:"store",x:390,y:290},{id:"bing",label:`Bing Grounding
(web search)`,type:"tool",x:220,y:290},{id:"fn",label:`Function Calling
(your APIs)`,type:"tool",x:560,y:290}],edges:[{from:"client",to:"agent",label:"create run"},{from:"agent",to:"thread",label:"read/write"},{from:"agent",to:"llm",label:"inference"},{from:"llm",to:"code",label:"tool call"},{from:"llm",to:"filesearch",label:"tool call"},{from:"llm",to:"fn",label:"tool call"},{from:"agent",to:"bing",label:"grounding"}]}),e.jsx("h2",{children:"Creating Agents and Managing Threads"}),e.jsx(r,{title:"Agent Setup with File Search and Code Interpreter",tabs:{python:`# pip install azure-ai-projects azure-identity
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    FileSearchTool,
    CodeInterpreterTool,
    FilePurpose,
    VectorStore,
    VectorStoreFile,
    MessageAttachment,
)
from azure.identity import DefaultAzureCredential
import time

# --- Initialize the client ---
project_client = AIProjectClient.from_connection_string(
    conn_str="eastus.api.azureml.ms;my-subscription-id;my-rg;my-project",
    credential=DefaultAzureCredential(),
)

# Use as context manager for proper cleanup
with project_client:
    agents = project_client.agents

    # --- Upload files to the vector store for RAG ---
    with open("product_docs.pdf", "rb") as f:
        uploaded_file = agents.upload_file_and_poll(
            file=f,
            purpose=FilePurpose.AGENTS,  # vs AGENTS_OUTPUT for code interpreter results
        )
    print(f"Uploaded file: {uploaded_file.id}")

    # Create a vector store and add the file
    vector_store = agents.create_vector_store_and_poll(
        file_ids=[uploaded_file.id],
        name="product-docs-store",
    )
    print(f"Vector store ready: {vector_store.id}, status: {vector_store.status}")

    # --- Create the agent ---
    agent = agents.create_agent(
        model="gpt-4o",  # deployment name
        name="product-support-agent",
        instructions="""You are a product support specialist. Use file search to answer
questions based on the product documentation. When users ask for data analysis
or calculations, use the code interpreter. Always cite your sources.""",
        tools=[
            FileSearchTool(vector_store_ids=[vector_store.id]).definitions[0],
            CodeInterpreterTool().definitions[0],
        ],
        tool_resources={
            "file_search": {"vector_store_ids": [vector_store.id]},
            "code_interpreter": {"file_ids": []},
        },
        temperature=0.2,
        top_p=0.95,
    )
    print(f"Agent created: {agent.id}")

    # --- Create a thread (one per user session) ---
    thread = agents.create_thread()
    print(f"Thread: {thread.id}")

    # --- Add a user message ---
    message = agents.create_message(
        thread_id=thread.id,
        role="user",
        content="What are the main features of our Pro tier? Also, calculate the annual cost if monthly is $49.",
    )

    # --- Create and poll a run ---
    run = agents.create_and_process_run(
        thread_id=thread.id,
        assistant_id=agent.id,
    )
    print(f"Run status: {run.status}")

    if run.status == "failed":
        print(f"Run failed: {run.last_error}")
    elif run.status == "completed":
        # Retrieve the assistant's response
        messages = agents.list_messages(thread_id=thread.id)
        # Messages are in reverse-chronological order
        last_message = messages.data[0]
        for content_block in last_message.content:
            if content_block.type == "text":
                print(content_block.text.value)
                # Print citations from file search
                for annotation in content_block.text.annotations:
                    if annotation.type == "file_citation":
                        print(f"  [Source: {annotation.file_citation.file_id}]")`}}),e.jsx("h2",{children:"Streaming Runs"}),e.jsxs("p",{children:["Polling runs with ",e.jsx("code",{children:"create_and_process_run"})," is simple but adds latency. For user-facing applications, stream run events to display the response token by token and react to tool calls in real time."]}),e.jsx(t,{language:"python",filename:"streaming_agent_run.py",children:`from azure.ai.projects.models import (
    AgentStreamEvent,
    RunStepDeltaChunk,
    ThreadMessageDelta,
    MessageDeltaChunk,
    RunStep,
    ThreadRun,
)

# Stream a run
with agents.create_stream(
    thread_id=thread.id,
    assistant_id=agent.id,
) as stream:
    for event_type, event_data, func_return in stream:

        if isinstance(event_data, MessageDeltaChunk):
            # Incremental text content
            for delta in event_data.delta.content or []:
                if delta.type == "text" and delta.text:
                    print(delta.text.value, end="", flush=True)

        elif isinstance(event_data, RunStep):
            # Tool invocation steps
            if event_data.type == "tool_calls":
                for tool_call in event_data.step_details.tool_calls or []:
                    if tool_call.type == "file_search":
                        print(f"\\n[Searching files...]")
                    elif tool_call.type == "code_interpreter":
                        print(f"\\n[Running code: {tool_call.code_interpreter.input[:100]}...]")

        elif isinstance(event_data, ThreadRun):
            if event_data.status == "requires_action":
                # Function calling requires_action — handle tool calls
                tool_outputs = []
                for tc in event_data.required_action.submit_tool_outputs.tool_calls:
                    import json
                    args = json.loads(tc.function.arguments)
                    if tc.function.name == "get_pricing":
                        result = {"monthly": 49, "annual": 588, "annual_discounted": 529}
                    else:
                        result = {"error": "unknown function"}
                    tool_outputs.append({
                        "tool_call_id": tc.id,
                        "output": json.dumps(result),
                    })
                # Submit tool outputs and continue streaming
                stream.submit_tool_outputs(tool_outputs=tool_outputs)`}),e.jsx("h2",{children:"Function Calling with Custom Tools"}),e.jsx(t,{language:"python",filename:"function_calling_agent.py",children:`import json
from azure.ai.projects.models import FunctionTool

# Define Python functions that the agent can call
def get_customer_account(customer_id: str) -> str:
    """Retrieve customer account details by ID."""
    # Real implementation queries your CRM/database
    return json.dumps({
        "id": customer_id,
        "name": "Acme Corp",
        "tier": "enterprise",
        "open_tickets": 3,
        "mrr": 4200,
    })

def create_support_ticket(
    customer_id: str,
    subject: str,
    priority: str,
    description: str
) -> str:
    """Create a new support ticket."""
    ticket_id = f"TKT-{hash(subject) % 100000:05d}"
    return json.dumps({"ticket_id": ticket_id, "status": "created", "priority": priority})

# Register functions with FunctionTool — it extracts schema from type hints + docstrings
user_functions = {get_customer_account, create_support_ticket}
function_tool = FunctionTool(functions=user_functions)

agent = agents.create_agent(
    model="gpt-4o",
    name="crm-agent",
    instructions="You are a CRM assistant. Use tools to look up customer data and create tickets.",
    tools=function_tool.definitions,
)

# When the agent calls a function, the run enters "requires_action" state
# The create_and_process_run helper handles this automatically if you pass a toolset
from azure.ai.projects.models import ToolSet

toolset = ToolSet()
toolset.add(function_tool)

run = agents.create_and_process_run(
    thread_id=thread.id,
    assistant_id=agent.id,
    toolset=toolset,  # SDK will auto-execute functions and submit results
)

# For manual control (e.g., adding approval gates):
while run.status == "requires_action":
    tool_calls = run.required_action.submit_tool_outputs.tool_calls
    outputs = []
    for tc in tool_calls:
        args = json.loads(tc.function.arguments)
        # Look up and call the right function
        fn_map = {
            "get_customer_account": get_customer_account,
            "create_support_ticket": create_support_ticket,
        }
        result = fn_map[tc.function.name](**args)
        outputs.append({"tool_call_id": tc.id, "output": result})

    run = agents.submit_tool_outputs_and_poll(
        thread_id=thread.id,
        run_id=run.id,
        tool_outputs=outputs,
    )`}),e.jsx("h2",{children:"Vector Store Management"}),e.jsx(n,{term:"Vector Store Lifecycle",children:e.jsxs("p",{children:["Vector stores in Azure AI Agent Service are persistent, named collections of embedded file content. Files are chunked automatically (1024 tokens with 20-token overlap by default, configurable). Vector stores support ",e.jsx("strong",{children:"expiration policies"})," to automatically clean up stores unused for N days. A single file search tool can reference up to 5 vector stores, enabling multi-corpus search across different document collections (e.g., separate stores for product docs vs. legal policies)."]})}),e.jsx(t,{language:"python",filename:"vector_store_management.py",children:`# Batch file upload with status polling
from azure.ai.projects.models import VectorStoreDataSource, VectorStoreDataSourceAssetType

# Upload multiple files and poll until all are processed
file_ids = []
for filename in ["manual_v1.pdf", "manual_v2.pdf", "faq.docx"]:
    with open(filename, "rb") as f:
        file_obj = agents.upload_file_and_poll(file=f, purpose=FilePurpose.AGENTS)
        file_ids.append(file_obj.id)

# Create vector store with chunking configuration
vector_store = agents.create_vector_store_and_poll(
    file_ids=file_ids,
    name="product-manuals",
    expires_after={"anchor": "last_active_at", "days": 30},  # auto-cleanup
    chunking_strategy={
        "type": "static",
        "static": {
            "max_chunk_size_tokens": 800,   # smaller chunks = more precise retrieval
            "chunk_overlap_tokens": 100,
        }
    },
)

# Add more files to an existing store
new_file = agents.upload_file_and_poll(file=open("addendum.pdf", "rb"), purpose=FilePurpose.AGENTS)
agents.create_vector_store_file_and_poll(
    vector_store_id=vector_store.id,
    file_id=new_file.id,
)

# List and manage stores
stores = agents.list_vector_stores()
for store in stores.data:
    print(f"{store.name}: {store.file_counts.completed} files, status={store.status}")

# Cleanup
agents.delete_vector_store(vector_store.id)`}),e.jsx(s,{name:"Multi-Tenant Thread Isolation",category:"Production Architecture",whenToUse:"SaaS applications where different customers must have isolated conversation histories with no cross-contamination of data or context.",children:e.jsxs("p",{children:["Create one thread per user session and store the ",e.jsx("code",{children:"thread_id"})," mapped to your user ID in your database. Never reuse threads across users. For multi-session users (returning after days), decide whether to create a new thread (clean context) or resume the existing one (continuity). Agent definitions are shared across tenants — only threads are per-user. Use vector stores scoped to each tenant's documents and pass the appropriate ",e.jsx("code",{children:"vector_store_id"})," at agent creation or thread attachment time."]})}),e.jsx(i,{title:"Run Cost and Latency Optimization",children:e.jsxs("p",{children:["Each run incurs token costs for the full thread history (all messages since thread creation). For long-running threads, implement a ",e.jsx("strong",{children:"context window management strategy"}),": periodically summarize the thread into a single system message and create a new thread with that summary as context. Set ",e.jsx("code",{children:"max_prompt_tokens"}),"and ",e.jsx("code",{children:"max_completion_tokens"})," on runs to cap costs. Use",e.jsx("code",{children:"truncation_strategy"})," with ",e.jsx("code",{children:'type="last_messages"'})," to automatically drop old messages when the thread exceeds the context window."]})}),e.jsx(o,{type:"info",title:"Bing Grounding Tool",children:e.jsxs("p",{children:["The Bing Grounding tool gives agents access to real-time web search. Unlike file search (which queries your documents), Bing grounding returns live web results. Enable it by adding a ",e.jsx("code",{children:"BingGroundingTool"})," with your Bing Search resource connection name. Grounded responses include citations with URLs. This tool is subject to Bing's terms of service and requires a separate Bing Search resource in Azure."]})}),e.jsx(o,{type:"warning",title:"Code Interpreter Sandbox Limitations",children:e.jsx("p",{children:"The code interpreter runs Python in an isolated sandbox with no internet access and a 120-second execution timeout. Available libraries include pandas, numpy, matplotlib, scipy, and sklearn — but not arbitrary pip-installable packages. Files written to the sandbox are accessible via the run's output file IDs and must be downloaded explicitly. The sandbox state resets between runs; do not rely on it for persistent computation."})})]})}const I=Object.freeze(Object.defineProperty({__proto__:null,default:d},Symbol.toStringTag,{value:"Module"}));function u(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Semantic Kernel"}),e.jsxs("p",{children:["Semantic Kernel (SK) is Microsoft's open-source SDK for orchestrating LLM-powered applications. Available in Python, C#, and Java, it provides a composable architecture around a central ",e.jsx("strong",{children:"Kernel"})," object that wires together AI services, plugins (tools), memory, and planners. Unlike LangChain's chain-centric model or LangGraph's explicit state machines, Semantic Kernel leans toward plugin-based function composition with automatic LLM-driven orchestration via its auto function calling capability."]}),e.jsx(n,{term:"Kernel Architecture",children:e.jsxs("p",{children:["The ",e.jsx("strong",{children:"Kernel"})," is the dependency injection container and orchestration hub. It holds references to: ",e.jsx("strong",{children:"AI services"})," (chat completion, text embedding, text generation), ",e.jsx("strong",{children:"plugins"})," (collections of callable functions), ",e.jsx("strong",{children:"filters"})," (middleware for function invocation, prompt rendering, and auto function calling), and ",e.jsx("strong",{children:"memory"})," (vector store connectors). You construct a Kernel, register services and plugins, then invoke functions or run chat loops — the Kernel handles routing tool calls between the LLM and your registered functions automatically."]})}),e.jsx(a,{title:"Semantic Kernel Architecture",width:700,height:340,nodes:[{id:"user",label:"User",type:"external",x:70,y:170},{id:"kernel",label:`Kernel
(orchestrator)`,type:"agent",x:230,y:170},{id:"llm",label:`Azure OpenAI
Chat Service`,type:"llm",x:420,y:80},{id:"embed",label:`Embedding
Service`,type:"llm",x:420,y:160},{id:"plugins",label:`Plugins
(native + semantic)`,type:"tool",x:420,y:240},{id:"memory",label:`Vector Memory
(AI Search)`,type:"store",x:600,y:200},{id:"filters",label:`Filters
(middleware)`,type:"tool",x:230,y:290},{id:"planner",label:`Planner
(auto / Handlebars)`,type:"agent",x:600,y:100}],edges:[{from:"user",to:"kernel"},{from:"kernel",to:"llm",label:"chat"},{from:"kernel",to:"embed"},{from:"kernel",to:"plugins",label:"invoke"},{from:"kernel",to:"filters"},{from:"embed",to:"memory"},{from:"llm",to:"planner"},{from:"plugins",to:"memory",label:"search"}]}),e.jsx("h2",{children:"Kernel Setup and Service Registration"}),e.jsx(t,{language:"python",filename:"kernel_setup.py",children:`# pip install semantic-kernel azure-identity

import asyncio
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion, AzureTextEmbedding
from semantic_kernel.connectors.ai.open_ai.settings.azure_open_ai_settings import (
    AzureOpenAISettings,
)
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from semantic_kernel.connectors.ai.function_choice_behavior import FunctionChoiceBehavior
from semantic_kernel.connectors.ai.open_ai.prompt_execution_settings.azure_chat_prompt_execution_settings import (
    AzureChatPromptExecutionSettings,
)

# Build the kernel
kernel = Kernel()

# Register Azure OpenAI chat service using managed identity
credential = DefaultAzureCredential()
token_provider = get_bearer_token_provider(
    credential, "https://cognitiveservices.azure.com/.default"
)

chat_service = AzureChatCompletion(
    service_id="azure-gpt4o",          # internal name for multi-service scenarios
    deployment_name="gpt-4o",
    endpoint="https://my-resource.openai.azure.com/",
    ad_token_provider=token_provider,
    api_version="2024-12-01-preview",
)
kernel.add_service(chat_service)

# Register embedding service (for vector memory)
embed_service = AzureTextEmbedding(
    service_id="azure-embeddings",
    deployment_name="text-embedding-3-large",
    endpoint="https://my-resource.openai.azure.com/",
    ad_token_provider=token_provider,
)
kernel.add_service(embed_service)

# Execution settings with auto function calling enabled
settings = AzureChatPromptExecutionSettings(
    service_id="azure-gpt4o",
    temperature=0.1,
    max_tokens=2048,
    function_choice_behavior=FunctionChoiceBehavior.Auto(
        filters={"included_plugins": ["WeatherPlugin", "CalendarPlugin"]}
        # Empty filters = all registered plugins available
    ),
)`}),e.jsx("h2",{children:"Plugins: Native and Semantic Functions"}),e.jsx(n,{term:"Plugin Types",children:e.jsxs("p",{children:["Semantic Kernel has two function types within plugins. ",e.jsx("strong",{children:"Native functions"}),"are decorated Python methods — the LLM can call them directly with arguments extracted from natural language. Decorators on parameters provide the schema descriptions that the LLM uses to understand how to call the function.",e.jsx("strong",{children:"Semantic/Prompt functions"})," are parameterized prompt templates that themselves call an LLM — they are functions whose implementation is an LLM call. This lets you compose LLM calls as first-class building blocks that other LLM calls can invoke, enabling nested reasoning chains."]})}),e.jsx(r,{title:"Plugin Creation: Native Functions + Auto Function Calling",tabs:{python:`from semantic_kernel.functions import kernel_function
from semantic_kernel.functions.kernel_parameter_metadata import KernelParameterMetadata
from typing import Annotated
import httpx
import json

# --- Native Function Plugin ---
class WeatherPlugin:
    """Plugin for getting weather information."""

    @kernel_function(
        name="get_current_weather",
        description="Get the current weather conditions for a specific city",
    )
    async def get_current_weather(
        self,
        city: Annotated[str, "The city name, e.g. 'Seattle' or 'London'"],
        units: Annotated[str, "Temperature units: 'celsius' or 'fahrenheit'"] = "celsius",
    ) -> Annotated[str, "JSON string with temperature, conditions, and humidity"]:
        # Real implementation calls a weather API
        return json.dumps({
            "city": city,
            "temperature": 18,
            "units": units,
            "conditions": "partly cloudy",
            "humidity": 72,
            "wind_speed_kmh": 15,
        })

    @kernel_function(
        name="get_forecast",
        description="Get a 5-day weather forecast for a city",
    )
    async def get_forecast(
        self,
        city: Annotated[str, "The city name"],
        days: Annotated[int, "Number of days to forecast, 1-7"] = 5,
    ) -> str:
        return json.dumps({
            "city": city,
            "forecast": [
                {"day": i+1, "high": 20-i, "low": 12-i, "conditions": "sunny"}
                for i in range(days)
            ]
        })

# --- Semantic/Prompt Function Plugin ---
# These are LLM-backed functions composed inline
from semantic_kernel.prompt_template import PromptTemplateConfig

weather_summary_fn = kernel.add_function(
    plugin_name="WeatherPlugin",
    function_name="summarize_conditions",
    description="Generate a natural language summary of weather data for travelers",
    prompt="""Given this weather data, write a concise 2-sentence summary
for a traveler deciding what to pack:

Weather data: {{$weather_json}}
Destination: {{$destination}}
Trip type: {{$trip_type}}

Summary:""",
    template_format="semantic-kernel",
)

# Register the native plugin
kernel.add_plugin(WeatherPlugin(), plugin_name="WeatherPlugin")

# --- Auto Function Calling Chat Loop ---
from semantic_kernel.contents import ChatHistory
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion

async def chat_with_tools():
    chat_history = ChatHistory()
    chat_history.add_system_message(
        "You are a helpful travel assistant. Use the weather tools to give accurate, "
        "current weather information. Always check the weather before making packing recommendations."
    )

    chat_service = kernel.get_service("azure-gpt4o")

    settings = AzureChatPromptExecutionSettings(
        service_id="azure-gpt4o",
        temperature=0.2,
        function_choice_behavior=FunctionChoiceBehavior.Auto(),
    )

    user_message = "I'm traveling to Tokyo next week. What should I pack?"
    chat_history.add_user_message(user_message)
    print(f"User: {user_message}")

    # The model will automatically call get_current_weather("Tokyo") and
    # get_forecast("Tokyo") as needed — no explicit tool dispatch code required
    response = await chat_service.get_chat_message_content(
        chat_history=chat_history,
        settings=settings,
        kernel=kernel,  # Kernel provides the function registry
    )

    print(f"Assistant: {response.content}")
    # Function calls are recorded in the chat history automatically
    print(f"Tool calls made: {[m.role for m in chat_history.messages]}")

asyncio.run(chat_with_tools())`}}),e.jsx("h2",{children:"Planners"}),e.jsx(n,{term:"Planner Types",children:e.jsxs("p",{children:["Planners decompose a high-level goal into a sequence of function calls.",e.jsx("strong",{children:"Auto Function Calling Planner"})," (default): The LLM itself decides which functions to call next, iterating until the goal is achieved — this is the recommended approach as of SK v1.x. ",e.jsx("strong",{children:"Handlebars Planner"}),": Generates a static Handlebars template (a plan) upfront, then executes it — deterministic execution, good for auditing. ",e.jsx("strong",{children:"Sequential Planner"}),": Deprecated in favor of auto function calling. Use Handlebars when you need an inspectable, serializable plan; use Auto for dynamic tasks where the steps aren't predictable."]})}),e.jsx(t,{language:"python",filename:"handlebars_planner.py",children:`from semantic_kernel.planners.handlebars_planner import HandlebarsPlanner, HandlebarsPlannerOptions

planner = HandlebarsPlanner(
    kernel,
    options=HandlebarsPlannerOptions(
        allow_loops=True,
        max_tokens_in_context=4000,
        excluded_plugins=["_global_functions_"],  # exclude built-ins
    )
)

# Generate a plan (one LLM call to produce the Handlebars template)
goal = """
Research the current weather in 3 cities (Paris, Tokyo, Sydney),
then create a comparison table and recommend the best city to visit in December.
"""

plan = await planner.create_plan(goal)
print("Generated plan:")
print(plan.template)
# Output is a Handlebars template like:
# {{set "paris_weather" (WeatherPlugin-get_current_weather city="Paris")}}
# {{set "tokyo_weather" (WeatherPlugin-get_current_weather city="Tokyo")}}
# {{set "sydney_weather" (WeatherPlugin-get_current_weather city="Sydney")}}
# {{ReportPlugin-create_comparison_table data1=paris_weather data2=tokyo_weather data3=sydney_weather}}

# Execute the generated plan
result = await plan.invoke(kernel)
print(f"Plan result: {result}")

# Plans are serializable — store and reuse
plan_json = plan.to_json()
# Later: restored_plan = HandlebarsPlan.from_json(plan_json, kernel)`}),e.jsx("h2",{children:"Vector Memory with Azure AI Search"}),e.jsx(t,{language:"python",filename:"vector_memory.py",children:`from semantic_kernel.connectors.memory.azure_ai_search import AzureAISearchCollection
from semantic_kernel.data import (
    VectorStoreRecordCollection,
    VectorStoreRecordDefinition,
    VectorStoreRecordField,
    VectorStoreRecordVectorField,
    VectorStoreTextSearch,
    vectorstoremodel,
)
from dataclasses import dataclass, field
from typing import Annotated

# Define a typed record model
@vectorstoremodel
@dataclass
class DocumentRecord:
    id: Annotated[str, VectorStoreRecordField(is_key=True)]
    content: Annotated[str, VectorStoreRecordField(is_full_text_searchable=True)]
    title: Annotated[str, VectorStoreRecordField(is_filterable=True)]
    source_url: Annotated[str, VectorStoreRecordField()]
    content_vector: Annotated[
        list[float] | None,
        VectorStoreRecordVectorField(
            dimensions=1536,
            distance_function="cosine_distance",
            index_kind="hnsw",
            embedding_property_name="content",  # auto-embed this field
        )
    ] = field(default=None)

# Connect to Azure AI Search
collection = AzureAISearchCollection(
    collection_name="product-documents",
    data_model_type=DocumentRecord,
    search_endpoint="https://my-search.search.windows.net",
    api_key="...",  # or use DefaultAzureCredential
)

# Create the collection (index)
await collection.create_collection_if_not_exists()

# Upsert records — vectors are computed automatically from content field
records = [
    DocumentRecord(
        id="doc-001",
        content="Azure AI Agent Service supports persistent threads with full message history.",
        title="Azure AI Agent Service Overview",
        source_url="https://docs.microsoft.com/azure/ai-agent-service",
    ),
    DocumentRecord(
        id="doc-002",
        content="Semantic Kernel plugins expose native Python functions as LLM-callable tools.",
        title="Semantic Kernel Plugins",
        source_url="https://learn.microsoft.com/semantic-kernel/plugins",
    ),
]

# The embedding service registered in the kernel auto-vectorizes content
await collection.upsert_batch(records, kernel=kernel)

# Hybrid vector + text search
from semantic_kernel.data import VectorSearchOptions

search_results = await collection.hybrid_search(
    query="how do agents maintain conversation history",
    options=VectorSearchOptions(
        top=5,
        include_vectors=False,
        filter="title eq 'Azure AI Agent Service Overview'",
    ),
    kernel=kernel,
)

async for result in search_results.results:
    print(f"Score: {result.score:.3f} | {result.record.title}")
    print(f"  {result.record.content[:120]}...")

# Use collection as a text search plugin in the kernel
text_search = VectorStoreTextSearch.from_vector_text_search(collection)
kernel.add_plugin(
    text_search.create_search_plugin(
        plugin_name="DocumentSearch",
        description="Search the product documentation knowledge base",
    )
)`}),e.jsx("h2",{children:"Multi-Agent Patterns"}),e.jsx(n,{term:"Agent Chat (AgentGroupChat)",children:e.jsxs("p",{children:["Semantic Kernel's ",e.jsx("code",{children:"AgentGroupChat"})," enables multi-agent conversations where multiple specialized agents interact in a shared chat. A",e.jsx("strong",{children:"SelectionStrategy"})," determines which agent speaks next (round-robin, or LLM-based selection), and a ",e.jsx("strong",{children:"TerminationStrategy"})," decides when the conversation is complete (keyword detection, LLM judge, max turn count). Each agent in the group has its own system prompt and plugin set."]})}),e.jsx(t,{language:"python",filename:"multi_agent_group_chat.py",children:`from semantic_kernel.agents import ChatCompletionAgent, AgentGroupChat
from semantic_kernel.agents.strategies import (
    KernelFunctionSelectionStrategy,
    KernelFunctionTerminationStrategy,
)
from semantic_kernel.functions import KernelFunctionFromPrompt

# Create specialized agents (each uses the same kernel but different personas)
researcher = ChatCompletionAgent(
    service_id="azure-gpt4o",
    kernel=kernel,
    name="Researcher",
    instructions="""You are a research analyst. Your role is to gather and present factual
information. Use available search tools to find relevant data. Always cite sources.
Be concise and focus on facts.""",
    execution_settings=AzureChatPromptExecutionSettings(
        service_id="azure-gpt4o",
        function_choice_behavior=FunctionChoiceBehavior.Auto(
            filters={"included_plugins": ["DocumentSearch", "WebSearch"]}
        ),
    ),
)

critic = ChatCompletionAgent(
    service_id="azure-gpt4o",
    kernel=kernel,
    name="Critic",
    instructions="""You are a critical reviewer. Your role is to identify weaknesses,
gaps, and potential issues in the researcher's findings. Ask probing questions
and flag unsupported claims. Be constructive but thorough.""",
)

synthesizer = ChatCompletionAgent(
    service_id="azure-gpt4o",
    kernel=kernel,
    name="Synthesizer",
    instructions="""You are a synthesis expert. When the research and critique are complete,
combine the insights into a final coherent recommendation. Respond with 'FINAL ANSWER:'
prefix when you have a complete synthesis.""",
)

# LLM-based agent selection strategy
selection_fn = KernelFunctionFromPrompt(
    function_name="select_next_agent",
    prompt="""Given this conversation history, select the most appropriate next speaker.
Return only the agent name, no explanation.

Agents:
- Researcher: gathers information, answers questions with data
- Critic: identifies problems, challenges assumptions (speaks after Researcher)
- Synthesizer: creates final recommendations (speaks last, after 2+ exchanges)

History:
{{$history}}

Next speaker:""",
)

# Termination when synthesizer produces final answer
termination_fn = KernelFunctionFromPrompt(
    function_name="check_termination",
    prompt="""Does this message contain 'FINAL ANSWER:'? Reply only 'yes' or 'no'.

Message: {{$lastmessage}}""",
)

group_chat = AgentGroupChat(
    agents=[researcher, critic, synthesizer],
    selection_strategy=KernelFunctionSelectionStrategy(
        function=selection_fn,
        kernel=kernel,
        result_parser=lambda r: str(r.value[0]),
        agent_variable_name="agents",
        history_variable_name="history",
    ),
    termination_strategy=KernelFunctionTerminationStrategy(
        agents=[synthesizer],       # Only check termination on synthesizer's messages
        function=termination_fn,
        kernel=kernel,
        result_parser=lambda r: "yes" in str(r.value[0]).lower(),
        history_variable_name="lastmessage",
        maximum_iterations=12,      # Hard limit to prevent infinite loops
    ),
)

# Start the multi-agent conversation
await group_chat.add_chat_message(
    message="Analyze the trade-offs between Azure AI Agent Service and a custom LangGraph agent for a production customer support bot."
)

async for message in group_chat.invoke():
    print(f"[{message.name}]: {message.content}\\n")`}),e.jsx(s,{name:"Plugin-per-Domain Architecture",category:"Modularity",whenToUse:"When building enterprise agents that need access to many different backend systems. Each business domain (CRM, ERP, HR, finance) gets its own plugin with typed, well-documented functions.",children:e.jsxs("p",{children:["Define one plugin class per domain with 3–8 focused functions each. Keep function descriptions precise — the LLM uses them to decide when and how to call the function. Vague descriptions lead to incorrect tool selection. Register only the plugins relevant to the current agent persona using the ",e.jsx("code",{children:"filters"})," parameter in",e.jsx("code",{children:"FunctionChoiceBehavior.Auto()"}),". This reduces the tool selection token overhead and improves routing accuracy."]})}),e.jsx(i,{title:"Filters for Observability and Safety",children:e.jsxs("p",{children:["Semantic Kernel's filter system is the right place to add cross-cutting concerns. Implement a ",e.jsx("strong",{children:"FunctionInvocationFilter"})," to log every tool call with its arguments and result — this gives you complete agent execution traces without modifying plugin code. Add a ",e.jsx("strong",{children:"PromptRenderFilter"})," to inspect the final rendered prompt before it is sent to the LLM, enabling prompt injection detection. Add an ",e.jsx("strong",{children:"AutoFunctionInvocationFilter"})," to intercept LLM-requested tool calls before execution, allowing human-in-the-loop approval for high-risk operations (e.g., write operations to production databases)."]})}),e.jsx(o,{type:"tip",title:"SK vs. LangGraph: When to Choose Each",children:e.jsx("p",{children:"Choose Semantic Kernel when: you are in the Microsoft/.NET ecosystem, you want tight Azure OpenAI integration with managed identity out of the box, your agent logic fits the plugin/function-calling model, or you need C# support. Choose LangGraph when: you need explicit control over agent flow with conditional branching and cycles, you require durable checkpointing with PostgreSQL/Redis backends, or you are building complex multi-step workflows where the execution graph must be auditable. Both support multi-agent patterns, but LangGraph gives more precise control over state transitions at the cost of more boilerplate."})}),e.jsx(o,{type:"info",title:"Process Framework (SK v1.x)",children:e.jsxs("p",{children:["Semantic Kernel 1.x introduces the ",e.jsx("strong",{children:"Process Framework"})," — a structured way to define long-running business processes as stateful event-driven graphs, similar to LangGraph's StateGraph but with a strongly-typed event/step model. Steps communicate via typed events, and processes can be paused and resumed with Azure Durable Functions as the backend. This is the recommended path for complex multi-step business process automation in the Microsoft stack."]})})]})}const C=Object.freeze(Object.defineProperty({__proto__:null,default:u},Symbol.toStringTag,{value:"Module"}));function p(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Amazon Bedrock: Unified Foundation Model Service"}),e.jsx("p",{children:"Amazon Bedrock is a fully managed service that provides access to high-performance foundation models from Amazon and third-party providers through a single, unified API. You never manage model infrastructure — Bedrock handles provisioning, scaling, and availability. Models are accessed via the AWS SDK (boto3), and all calls stay within the AWS network, making Bedrock suitable for enterprise workloads with strict data residency and compliance requirements."}),e.jsxs(n,{term:"Foundation Model Catalog",children:[e.jsxs("p",{children:["Bedrock hosts models from multiple providers under a single API surface. Each model has a unique ",e.jsx("strong",{children:"model ID"})," used in API calls. Model availability varies by AWS region; cross-region inference profiles allow automatic failover and load balancing across regions. Key models include:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Claude 3.5 Sonnet v2"})," — ",e.jsx("code",{children:"anthropic.claude-3-5-sonnet-20241022-v2:0"})," — Anthropic's most capable and cost-effective model for complex reasoning"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Llama 3.1 70B Instruct"})," — ",e.jsx("code",{children:"meta.llama3-1-70b-instruct-v1:0"})," — Meta's open-weight model for instruction following"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Mistral Large"})," — ",e.jsx("code",{children:"mistral.mistral-large-2402-v1:0"})," — Mistral's flagship model for multilingual tasks"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Amazon Nova Pro"})," — ",e.jsx("code",{children:"amazon.nova-pro-v1:0"})," — Amazon's multimodal model optimized for cost/performance"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Titan Embeddings v2"})," — ",e.jsx("code",{children:"amazon.titan-embed-text-v2:0"})," — Amazon's text embedding model, 1024 dimensions"]})]})]}),e.jsx(a,{title:"Amazon Bedrock: Unified Model Access Layer",width:680,height:320,nodes:[{id:"app",label:"Your Application",type:"external",x:80,y:160},{id:"bedrock",label:`Amazon Bedrock
(Converse API)`,type:"agent",x:260,y:160},{id:"guardrails",label:"Guardrails",type:"tool",x:260,y:60},{id:"anthropic",label:`Anthropic
Claude`,type:"llm",x:460,y:80},{id:"meta",label:`Meta
Llama`,type:"llm",x:460,y:160},{id:"amazon",label:`Amazon
Nova/Titan`,type:"llm",x:460,y:240},{id:"mistral",label:"Mistral",type:"llm",x:600,y:120},{id:"logs",label:`CloudWatch
Logs`,type:"store",x:600,y:240}],edges:[{from:"app",to:"bedrock",label:"boto3"},{from:"bedrock",to:"guardrails",label:"filter"},{from:"bedrock",to:"anthropic"},{from:"bedrock",to:"meta"},{from:"bedrock",to:"amazon"},{from:"anthropic",to:"mistral"},{from:"bedrock",to:"logs",label:"audit"}]}),e.jsx("h2",{children:"The Converse API"}),e.jsxs("p",{children:["The ",e.jsx("strong",{children:"Converse API"})," is Bedrock's unified multi-turn conversation interface. Unlike the older ",e.jsx("code",{children:"InvokeModel"})," API (which required model-specific request/response schemas), Converse provides a single normalized interface for messages, tool use, and streaming that works across all supported models. This is the recommended API for all new Bedrock integrations."]}),e.jsx(n,{term:"Converse API vs InvokeModel",children:e.jsxs("p",{children:[e.jsx("code",{children:"InvokeModel"})," requires you to serialize/deserialize model-specific JSON bodies — Claude uses ",e.jsx("code",{children:"anthropic_version"}),", Llama uses its own prompt format, etc.",e.jsx("code",{children:"Converse"})," abstracts all of this: you send a standard ",e.jsx("code",{children:"messages"}),"array and receive a standard ",e.jsx("code",{children:"output.message"}),". Tool use (function calling) is also normalized — you define tools once and Bedrock handles the model-specific formatting. Switching models requires only changing the ",e.jsx("code",{children:"modelId"}),"."]})}),e.jsx(r,{title:"Amazon Bedrock: Basic Invoke and Converse API",tabs:{python:`import boto3
import json

# Initialize the Bedrock Runtime client
bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1"
)

# ── Option 1: InvokeModel (model-specific, legacy) ────────────────────────
body = json.dumps({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "What is Amazon Bedrock?"}]
})

response = bedrock.invoke_model(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    body=body,
    contentType="application/json",
    accept="application/json"
)

result = json.loads(response["body"].read())
print(result["content"][0]["text"])


# ── Option 2: Converse API (unified, recommended) ─────────────────────────
response = bedrock.converse(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {"role": "user", "content": [{"text": "What is Amazon Bedrock?"}]}
    ],
    system=[{"text": "You are a helpful AWS expert."}],
    inferenceConfig={
        "maxTokens": 1024,
        "temperature": 0.0,
        "topP": 0.9
    }
)

text = response["output"]["message"]["content"][0]["text"]
print(text)
print("Stop reason:", response["stopReason"])
print("Input tokens:", response["usage"]["inputTokens"])
print("Output tokens:", response["usage"]["outputTokens"])


# ── Converse with Tool Use (Function Calling) ─────────────────────────────
tools = [
    {
        "toolSpec": {
            "name": "get_weather",
            "description": "Get the current weather for a city.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string", "description": "City name"},
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                    },
                    "required": ["city"]
                }
            }
        }
    }
]

response = bedrock.converse(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {"role": "user", "content": [{"text": "What is the weather in Seattle?"}]}
    ],
    toolConfig={"tools": tools}
)

# Check if model wants to call a tool
if response["stopReason"] == "tool_use":
    tool_use = next(
        b for b in response["output"]["message"]["content"]
        if "toolUse" in b
    )
    print("Tool call:", tool_use["toolUse"]["name"])
    print("Input:", tool_use["toolUse"]["input"])
    # -> {"city": "Seattle"}`}}),e.jsx("h2",{children:"Streaming with ConverseStream"}),e.jsxs("p",{children:["For real-time response delivery, use ",e.jsx("code",{children:"converse_stream"}),". Bedrock returns an event stream that you iterate over. The stream emits ",e.jsx("code",{children:"contentBlockDelta"}),"events for text chunks, ",e.jsx("code",{children:"messageStart"}),"/",e.jsx("code",{children:"messageStop"})," bookends, and ",e.jsx("code",{children:"metadata"})," for token usage."]}),e.jsx(t,{language:"python",filename:"bedrock_streaming.py",children:`import boto3

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

response = bedrock.converse_stream(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {"role": "user", "content": [{"text": "Explain RAG in 3 paragraphs."}]}
    ],
    inferenceConfig={"maxTokens": 1024, "temperature": 0.0}
)

# Stream the response token-by-token
stream = response["stream"]
full_text = ""

for event in stream:
    if "contentBlockDelta" in event:
        delta = event["contentBlockDelta"]["delta"]
        if "text" in delta:
            chunk = delta["text"]
            full_text += chunk
            print(chunk, end="", flush=True)

    elif "messageStop" in event:
        print()  # newline
        stop_reason = event["messageStop"]["stopReason"]
        print(f"\\nStop reason: {stop_reason}")

    elif "metadata" in event:
        usage = event["metadata"].get("usage", {})
        print(f"Tokens — in: {usage.get('inputTokens')}, out: {usage.get('outputTokens')}")`}),e.jsx("h2",{children:"Throughput Modes"}),e.jsx(n,{term:"On-Demand vs Provisioned Throughput",children:e.jsxs("p",{children:["Bedrock offers two throughput modes. ",e.jsx("strong",{children:"On-demand"})," is pay-per-token with no commitment — ideal for development and variable workloads. Each request competes for shared capacity; you may encounter throttling (HTTP 429) at high concurrency.",e.jsx("strong",{children:"Provisioned throughput"})," (also called Model Units, or MUs) reserves dedicated model capacity for 1-month or 6-month terms. One MU for Claude 3.5 Sonnet guarantees a specific tokens-per-minute rate. Use provisioned throughput for latency-sensitive production applications with predictable traffic."]})}),e.jsx(t,{language:"python",filename:"bedrock_provisioned.py",children:`import boto3

bedrock_mgmt = boto3.client("bedrock", region_name="us-east-1")

# Create a provisioned throughput commitment
response = bedrock_mgmt.create_provisioned_model_throughput(
    modelUnits=1,
    provisionedModelName="my-claude-prod",
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    commitmentDuration="OneMonth"  # or "SixMonths"
)

provisioned_arn = response["provisionedModelArn"]
print("Provisioned ARN:", provisioned_arn)

# Use provisioned model in Converse API (use the ARN as modelId)
bedrock_rt = boto3.client("bedrock-runtime", region_name="us-east-1")

response = bedrock_rt.converse(
    modelId=provisioned_arn,  # ARN instead of model ID string
    messages=[{"role": "user", "content": [{"text": "Hello"}]}],
    inferenceConfig={"maxTokens": 512}
)`}),e.jsx("h2",{children:"Cross-Region Inference Profiles"}),e.jsxs("p",{children:["Cross-region inference profiles are special model IDs prefixed with a geographic identifier (",e.jsx("code",{children:"us."}),", ",e.jsx("code",{children:"eu."}),"). When you use a cross-region profile, Bedrock automatically routes your request to the region with available capacity, providing higher throughput limits and automatic failover."]}),e.jsx(t,{language:"python",filename:"cross_region_inference.py",children:`# Cross-region profile: Bedrock routes across us-east-1, us-west-2, etc.
# No code change needed beyond using the cross-region model ID

response = bedrock.converse(
    # Cross-region inference profile ID (note the "us." prefix)
    modelId="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {"role": "user", "content": [{"text": "What are the benefits of RAG?"}]}
    ],
    inferenceConfig={"maxTokens": 1024}
)

# The response includes which region actually served the request
print(response["ResponseMetadata"]["HTTPHeaders"].get("x-amzn-bedrock-invocation-region"))`}),e.jsx(s,{name:"Model Abstraction with Converse API",category:"Portability",whenToUse:"When you need to switch between models (A/B testing, cost optimization, model upgrades) without rewriting application code.",children:e.jsxs("p",{children:["Build your application against the Converse API with ",e.jsx("code",{children:"modelId"})," as a configuration parameter. Because Converse normalizes request/response schemas, you can switch from Claude to Nova Pro to Llama by changing a single string. This also enables model routing strategies: route complex tasks to Claude, simple tasks to Nova Lite for cost savings, and use cross-region profiles for high-throughput workloads."]})}),e.jsx(i,{title:"Exponential Backoff for Throttling",children:e.jsxs("p",{children:["On-demand Bedrock calls will return ",e.jsx("code",{children:"ThrottlingException"})," under high load. Always wrap Bedrock calls with retry logic using exponential backoff. The AWS SDK's built-in retry config handles this: set ",e.jsx("code",{children:"retries={'max_attempts': 5, 'mode': 'adaptive'}"}),"in your boto3 config. For provisioned throughput, throttling should not occur under normal load — if it does, you need more Model Units."]})}),e.jsx(o,{type:"info",title:"Data Privacy and Model Training",children:e.jsx("p",{children:"By default, Amazon Bedrock does not use your prompts or responses to train foundation models. Data is encrypted in transit (TLS) and at rest. You can enable VPC endpoints to keep all traffic private within your AWS network. For regulated industries, Bedrock supports AWS PrivateLink, AWS CloudTrail audit logging, and AWS Macie for data governance."})}),e.jsx(o,{type:"tip",title:"Embedding Models for RAG",children:e.jsxs("p",{children:["For RAG pipelines, ",e.jsx("code",{children:"amazon.titan-embed-text-v2:0"})," produces 1024-dimensional embeddings and supports dimensions reduction (256, 512) for storage optimization. Call it via ",e.jsx("code",{children:"invoke_model"})," with ",e.jsx("code",{children:'{"inputText": "...", "dimensions": 1024, "normalize": true}'}),". The normalized flag ensures cosine similarity works correctly. Titan Embeddings v2 supports up to 8192 input tokens."]})})]})}const P=Object.freeze(Object.defineProperty({__proto__:null,default:p},Symbol.toStringTag,{value:"Module"}));function m(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Amazon Bedrock Agents: Fully Managed Agentic AI"}),e.jsx("p",{children:"Amazon Bedrock Agents is a fully managed service for building and deploying autonomous AI agents. Unlike custom agent loops you build with LangGraph or the Agents SDK, Bedrock Agents handles the orchestration loop, memory, action execution, and observability infrastructure — you declare tools and knowledge bases, and the service handles the rest. Agents use a ReAct-style reasoning loop internally but expose a simple invocation API to your application."}),e.jsx(a,{title:"Bedrock Agents: Request Flow",width:700,height:340,nodes:[{id:"user",label:"User / App",type:"external",x:70,y:170},{id:"agent",label:`Bedrock Agent
(Orchestrator)`,type:"agent",x:240,y:170},{id:"llm",label:`Foundation Model
(Claude / Nova)`,type:"llm",x:240,y:60},{id:"ag",label:`Action Groups
(Lambda + OpenAPI)`,type:"tool",x:430,y:90},{id:"kb",label:`Knowledge Base
(RAG)`,type:"store",x:430,y:170},{id:"mem",label:"Session Memory",type:"store",x:430,y:260},{id:"lambda",label:`Lambda
Functions`,type:"tool",x:600,y:90},{id:"os",label:`OpenSearch /
Aurora pgvector`,type:"store",x:600,y:200}],edges:[{from:"user",to:"agent",label:"invoke"},{from:"agent",to:"llm",label:"reason"},{from:"llm",to:"agent",label:"action"},{from:"agent",to:"ag",label:"tool call"},{from:"agent",to:"kb",label:"retrieve"},{from:"agent",to:"mem",label:"read/write"},{from:"ag",to:"lambda"},{from:"kb",to:"os"},{from:"agent",to:"user",label:"response"}]}),e.jsx("h2",{children:"Action Groups"}),e.jsxs(n,{term:"Action Groups",children:[e.jsxs("p",{children:["An ",e.jsx("strong",{children:"action group"})," is a collection of API operations that an agent can call. Each action group is backed by a Lambda function and described by an",e.jsx("strong",{children:"OpenAPI schema"})," (JSON or YAML). The agent uses the schema to understand what operations are available, what parameters they require, and when to call them. When the agent decides to invoke an action, Bedrock calls your Lambda with a structured payload including the action name, API path, and extracted parameters."]}),e.jsxs("p",{children:["Alternatively, action groups can use ",e.jsx("strong",{children:"function definitions"})," (simpler than full OpenAPI) — a list of functions with name, description, and parameters. For built-in capabilities like code execution, Bedrock provides the",e.jsx("code",{children:"AMAZON.CodeInterpreter"})," built-in action type."]})]}),e.jsx(r,{title:"Creating a Bedrock Agent with Action Groups",tabs:{python:`import boto3
import json

bedrock_agent = boto3.client("bedrock-agent", region_name="us-east-1")

# ── Step 1: Create the Agent ──────────────────────────────────────────────
create_response = bedrock_agent.create_agent(
    agentName="customer-support-agent",
    agentResourceRoleArn="arn:aws:iam::123456789:role/BedrockAgentRole",
    foundationModel="anthropic.claude-3-5-sonnet-20241022-v2:0",
    description="Handles customer support queries with access to order and ticket systems.",
    instruction="""You are a helpful customer support agent for an e-commerce platform.
You have access to tools to look up orders, check inventory, and create support tickets.
Always verify order details before taking any action. Be concise and professional.""",
    idleSessionTTLInSeconds=1800,
)

agent_id = create_response["agent"]["agentId"]
print("Agent ID:", agent_id)


# ── Step 2: Create an Action Group with OpenAPI Schema ────────────────────
openapi_schema = {
    "openapi": "3.0.0",
    "info": {"title": "Order Management API", "version": "1.0.0"},
    "paths": {
        "/get-order": {
            "get": {
                "operationId": "getOrder",
                "description": "Retrieve order details by order ID",
                "parameters": [
                    {
                        "name": "orderId",
                        "in": "query",
                        "required": True,
                        "schema": {"type": "string"},
                        "description": "The unique order identifier"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Order details",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "orderId": {"type": "string"},
                                        "status": {"type": "string"},
                                        "items": {"type": "array"}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/create-ticket": {
            "post": {
                "operationId": "createSupportTicket",
                "description": "Create a customer support ticket",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["customerId", "issue"],
                                "properties": {
                                    "customerId": {"type": "string"},
                                    "issue": {"type": "string"},
                                    "priority": {
                                        "type": "string",
                                        "enum": ["low", "medium", "high"]
                                    }
                                }
                            }
                        }
                    }
                },
                "responses": {"200": {"description": "Ticket created"}}
            }
        }
    }
}

bedrock_agent.create_agent_action_group(
    agentId=agent_id,
    agentVersion="DRAFT",
    actionGroupName="order-management",
    description="Tools for managing orders and support tickets",
    actionGroupExecutor={
        "lambda": "arn:aws:lambda:us-east-1:123456789:function:order-management-handler"
    },
    apiSchema={
        "payload": json.dumps(openapi_schema)
    },
    actionGroupState="ENABLED"
)

# ── Step 3: Prepare and create an alias ──────────────────────────────────
bedrock_agent.prepare_agent(agentId=agent_id)

# Wait for preparation to complete (in production, poll with get_agent)
import time
time.sleep(10)

alias_response = bedrock_agent.create_agent_alias(
    agentId=agent_id,
    agentAliasName="production-v1",
    description="Production alias for customer support agent"
)

alias_id = alias_response["agentAlias"]["agentAliasId"]
print("Alias ID:", alias_id)`}}),e.jsx("h2",{children:"Invoking Agents"}),e.jsxs("p",{children:["Agents are invoked via the ",e.jsx("code",{children:"bedrock-agent-runtime"})," client (separate from the management client). Each invocation requires a ",e.jsx("code",{children:"sessionId"})," to maintain conversational context. The agent response streams back as an event stream containing the final answer and optional trace events showing the agent's reasoning."]}),e.jsx(t,{language:"python",filename:"invoke_bedrock_agent.py",children:`import boto3
import uuid

# Runtime client for invoking agents
bedrock_agent_rt = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

agent_id = "ABCDEF1234"
alias_id = "TSTALIASID"
session_id = str(uuid.uuid4())  # Maintain this across turns for multi-turn conversations

response = bedrock_agent_rt.invoke_agent(
    agentId=agent_id,
    agentAliasId=alias_id,
    sessionId=session_id,
    inputText="What is the status of order ORD-98765?",
    enableTrace=True,  # Include reasoning trace in response
    sessionState={
        # Inject session-level context variables accessible in the agent prompt
        "sessionAttributes": {
            "customerId": "CUST-12345",
            "tier": "premium"
        }
    }
)

# The response is an event stream — iterate to get chunks
completion = ""
for event in response["completion"]:
    if "chunk" in event:
        chunk_bytes = event["chunk"]["bytes"]
        completion += chunk_bytes.decode("utf-8")

    elif "trace" in event:
        trace = event["trace"]["trace"]
        # Trace contains orchestrationTrace, preProcessingTrace, postProcessingTrace
        if "orchestrationTrace" in trace:
            orch = trace["orchestrationTrace"]
            if "rationale" in orch:
                print("Reasoning:", orch["rationale"]["text"])
            if "invocationInput" in orch:
                inv = orch["invocationInput"]
                if "actionGroupInvocationInput" in inv:
                    action = inv["actionGroupInvocationInput"]
                    print(f"Calling action: {action['actionGroupName']}/{action['apiPath']}")

print("\\nFinal response:", completion)`}),e.jsx("h2",{children:"Knowledge Bases"}),e.jsx(n,{term:"Bedrock Knowledge Bases",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Knowledge Base"})," is a managed RAG pipeline. You point it at an S3 bucket containing your documents (PDF, TXT, HTML, Markdown, Word), and Bedrock automatically chunks, embeds, and indexes the content. The index is stored in either",e.jsx("strong",{children:"OpenSearch Serverless"})," (default), ",e.jsx("strong",{children:"Aurora PostgreSQL with pgvector"}),", or ",e.jsx("strong",{children:"Pinecone / MongoDB Atlas"}),". When an agent queries the knowledge base, Bedrock handles the embedding of the query, vector search, and passage retrieval — returning grounded context to the agent."]})}),e.jsx(t,{language:"python",filename:"bedrock_knowledge_base.py",children:`import boto3

bedrock_agent = boto3.client("bedrock-agent", region_name="us-east-1")

# Create a Knowledge Base backed by OpenSearch Serverless
kb_response = bedrock_agent.create_knowledge_base(
    name="product-documentation-kb",
    description="Product manuals and FAQs for customer support",
    roleArn="arn:aws:iam::123456789:role/BedrockKBRole",
    knowledgeBaseConfiguration={
        "type": "VECTOR",
        "vectorKnowledgeBaseConfiguration": {
            "embeddingModelArn": (
                "arn:aws:bedrock:us-east-1::foundation-model/"
                "amazon.titan-embed-text-v2:0"
            )
        }
    },
    storageConfiguration={
        "type": "OPENSEARCH_SERVERLESS",
        "opensearchServerlessConfiguration": {
            "collectionArn": "arn:aws:aoss:us-east-1:123456789:collection/my-kb-collection",
            "vectorIndexName": "bedrock-kb-index",
            "fieldMapping": {
                "vectorField": "bedrock-knowledge-base-default-vector",
                "textField": "AMAZON_BEDROCK_TEXT_CHUNK",
                "metadataField": "AMAZON_BEDROCK_METADATA"
            }
        }
    }
)

kb_id = kb_response["knowledgeBase"]["knowledgeBaseId"]

# Add an S3 data source
bedrock_agent.create_data_source(
    knowledgeBaseId=kb_id,
    name="product-docs-s3",
    dataSourceConfiguration={
        "type": "S3",
        "s3Configuration": {
            "bucketArn": "arn:aws:s3:::my-product-docs-bucket",
            "inclusionPrefixes": ["manuals/", "faqs/"]
        }
    },
    vectorIngestionConfiguration={
        "chunkingConfiguration": {
            "chunkingStrategy": "HIERARCHICAL",
            "hierarchicalChunkingConfiguration": {
                "levelConfigurations": [
                    {"maxTokens": 1500},  # Parent chunk
                    {"maxTokens": 300}    # Child chunk
                ],
                "overlapTokens": 60
            }
        }
    }
)

# Associate KB with an agent
bedrock_agent.associate_agent_knowledge_base(
    agentId="ABCDEF1234",
    agentVersion="DRAFT",
    knowledgeBaseId=kb_id,
    description="Use this to answer questions about product documentation",
    knowledgeBaseState="ENABLED"
)

# Direct KB retrieval (without an agent)
bedrock_agent_rt = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

retrieve_response = bedrock_agent_rt.retrieve(
    knowledgeBaseId=kb_id,
    retrievalQuery={"text": "How do I reset my device to factory settings?"},
    retrievalConfiguration={
        "vectorSearchConfiguration": {
            "numberOfResults": 5,
            "overrideSearchType": "HYBRID"  # Semantic + keyword
        }
    }
)

for result in retrieve_response["retrievalResults"]:
    print(f"Score: {result['score']:.3f}")
    print(f"Content: {result['content']['text'][:200]}")
    print(f"Source: {result['location']['s3Location']['uri']}")
    print()`}),e.jsx("h2",{children:"Agent Aliases and Versioning"}),e.jsxs("p",{children:["Agent ",e.jsx("strong",{children:"versions"})," are immutable snapshots of an agent configuration.",e.jsx("strong",{children:"Aliases"})," are pointers to specific versions, enabling blue/green deployments: you can gradually shift traffic from v1 to v2 by updating the alias, with instant rollback by reverting the pointer. Your application always calls the alias ID — the underlying version can change without code changes."]}),e.jsx("h2",{children:"Multi-Agent Collaboration"}),e.jsx(n,{term:"Supervisor and Sub-Agents",children:e.jsxs("p",{children:["Bedrock supports ",e.jsx("strong",{children:"multi-agent collaboration"})," where a ",e.jsx("em",{children:"supervisor agent"}),"orchestrates multiple ",e.jsx("em",{children:"sub-agents"}),", each specialized for a domain. The supervisor receives the user's task, decomposes it, and delegates subtasks to sub-agents via a built-in collaboration action group. Sub-agents can themselves have action groups and knowledge bases. Results are aggregated by the supervisor into a final response. This pattern scales well for complex enterprise workflows (e.g., a supervisor routing between a billing agent, a technical support agent, and a returns agent)."]})}),e.jsx(s,{name:"Inline Agents for Dynamic Configurations",category:"Flexibility",whenToUse:"When agent configuration (instructions, tools, knowledge bases) must be determined at runtime per-request — e.g., personalizing the agent per tenant or injecting dynamic context.",children:e.jsxs("p",{children:[e.jsx("strong",{children:"Inline agents"})," are created and invoked in a single API call without pre-creating agent resources. You pass the full configuration (model, instructions, action groups, knowledge base IDs) directly in the ",e.jsx("code",{children:"invoke_inline_agent"}),"call. This is ideal for multi-tenant applications where each customer has different permissions or tool sets, or for testing configurations without managing agent versions. Inline agents do not support aliases or session memory across calls."]})}),e.jsx(t,{language:"python",filename:"inline_agent.py",children:`import boto3
import uuid

bedrock_agent_rt = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

response = bedrock_agent_rt.invoke_inline_agent(
    sessionId=str(uuid.uuid4()),
    foundationModel="anthropic.claude-3-5-sonnet-20241022-v2:0",
    instruction="You are a data analyst. Answer questions about sales data concisely.",
    inputText="What were the top 3 products by revenue last quarter?",
    actionGroups=[
        {
            "actionGroupName": "database-query",
            "actionGroupExecutor": {
                "lambda": "arn:aws:lambda:us-east-1:123456789:function:query-db"
            },
            "functionSchema": {
                "functions": [
                    {
                        "name": "run_sql_query",
                        "description": "Execute a read-only SQL query against the sales database",
                        "parameters": {
                            "query": {
                                "type": "string",
                                "description": "SQL SELECT query to execute",
                                "required": True
                            }
                        }
                    }
                ]
            }
        }
    ],
    knowledgeBaseConfigurations=[
        {
            "knowledgeBaseId": "KB12345678",
            "retrievalConfiguration": {
                "vectorSearchConfiguration": {"numberOfResults": 3}
            }
        }
    ]
)

for event in response["completion"]:
    if "chunk" in event:
        print(event["chunk"]["bytes"].decode())`}),e.jsx(i,{title:"Agent Instructions Are Critical",children:e.jsxs("p",{children:["The ",e.jsx("code",{children:"instruction"})," field is the system prompt for your agent — it directly determines agent behavior, tool selection accuracy, and response quality. Write instructions that define the agent's persona, enumerate its available tools and when to use them, specify response format requirements, and describe escalation behavior. Include few-shot examples of correct tool selection in the instructions. Instructions can be up to 4000 characters. Test with diverse inputs before deploying to production."]})}),e.jsx(o,{type:"warning",title:"Lambda Timeout for Action Groups",children:e.jsx("p",{children:"Bedrock Agents has a hard timeout of 60 seconds per agent invocation step. If your Lambda action handler takes longer (e.g., complex database queries, external API calls), the agent will time out and return an error. For long-running operations, implement an async pattern: the Lambda starts a job and returns a job ID; a separate polling action checks the job status. Alternatively, pre-compute and cache frequently needed data to keep Lambda execution under 30 seconds."})}),e.jsx(o,{type:"tip",title:"Using enableTrace for Debugging",children:e.jsxs("p",{children:["Always enable ",e.jsx("code",{children:"enableTrace=True"})," during development. The trace events show the agent's full reasoning chain: pre-processing (input classification), orchestration steps (which tools were considered and why), tool invocation inputs and outputs, and post-processing (response formatting). This is essential for diagnosing why an agent called the wrong tool or produced an unexpected response. In production, disable tracing to reduce latency and cost."]})})]})}const T=Object.freeze(Object.defineProperty({__proto__:null,default:m},Symbol.toStringTag,{value:"Module"}));function h(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Amazon Bedrock Guardrails: Responsible AI Moderation"}),e.jsxs("p",{children:["Amazon Bedrock Guardrails is a configurable content moderation and safety layer that sits between your application and any foundation model. Unlike model-specific safety features (which vary across providers), Guardrails provides a ",e.jsx("strong",{children:"consistent, auditable, and configurable"})," safety policy that applies uniformly across all models — Claude, Llama, Nova, Mistral, and others. Guardrails can be applied to input (what users send), output (what the model returns), or both simultaneously."]}),e.jsx(a,{title:"Bedrock Guardrails in the Inference Pipeline",width:700,height:280,nodes:[{id:"user",label:"User Input",type:"external",x:70,y:140},{id:"input_guard",label:`Input
Guardrail`,type:"tool",x:210,y:140},{id:"model",label:`Foundation
Model`,type:"llm",x:380,y:140},{id:"output_guard",label:`Output
Guardrail`,type:"tool",x:540,y:140},{id:"app",label:"Application",type:"external",x:650,y:140},{id:"blocked",label:`Blocked
Response`,type:"store",x:210,y:60},{id:"redacted",label:`PII
Redacted`,type:"store",x:540,y:60},{id:"audit",label:`CloudWatch
Audit Log`,type:"store",x:380,y:240}],edges:[{from:"user",to:"input_guard",label:"raw input"},{from:"input_guard",to:"blocked",label:"if violation"},{from:"input_guard",to:"model",label:"pass / redact"},{from:"model",to:"output_guard",label:"raw output"},{from:"output_guard",to:"redacted",label:"if PII found"},{from:"output_guard",to:"app",label:"safe output"},{from:"input_guard",to:"audit"},{from:"output_guard",to:"audit"}]}),e.jsx("h2",{children:"Guardrail Policy Types"}),e.jsxs(n,{term:"Content Filters",children:[e.jsxs("p",{children:["Content filters evaluate text for six harmful categories, each with an independently configurable threshold (",e.jsx("strong",{children:"NONE, LOW, MEDIUM, HIGH"}),"). Higher thresholds are more permissive (less likely to block); lower thresholds are stricter. Categories:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"HATE"})," — Content denigrating people based on protected characteristics"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"INSULTS"})," — Bullying, demeaning, or derogatory language"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SEXUAL"})," — Explicit sexual content"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"VIOLENCE"})," — Graphic violence, threats, or glorification of harm"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"MISCONDUCT"})," — Criminal activity instructions, fraud, cyberattacks"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"PROMPT_ATTACK"})," — Jailbreak attempts and prompt injection"]})]}),e.jsxs("p",{children:["Each category has separate ",e.jsx("code",{children:"inputStrength"})," (for user input) and",e.jsx("code",{children:"outputStrength"})," (for model output) settings, allowing asymmetric policies — for example, aggressively blocking prompt attacks on input but being more permissive on output for a creative writing application."]})]}),e.jsx(n,{term:"Denied Topics",children:e.jsxs("p",{children:["Denied topics let you block discussion of specific subjects regardless of how they are phrased. You define each topic with a natural language ",e.jsx("strong",{children:"definition"})," (up to 200 characters) that describes what to block. Bedrock uses semantic matching — not keyword matching — so paraphrased requests are still caught. Examples: blocking competitors' product comparisons, preventing legal advice, restricting discussion of internal pricing strategies."]})}),e.jsxs(n,{term:"PII Redaction",children:[e.jsxs("p",{children:["Guardrails can detect and either ",e.jsx("strong",{children:"BLOCK"})," (reject the request) or",e.jsx("strong",{children:"ANONYMIZE"})," (replace with a placeholder like ",e.jsx("code",{children:"[NAME]"}),") 13 types of personally identifiable information:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"NAME"}),", ",e.jsx("code",{children:"EMAIL"}),", ",e.jsx("code",{children:"PHONE"}),", ",e.jsx("code",{children:"US_SSN"})]}),e.jsxs("li",{children:[e.jsx("code",{children:"ADDRESS"}),", ",e.jsx("code",{children:"AGE"}),", ",e.jsx("code",{children:"USERNAME"}),", ",e.jsx("code",{children:"PASSWORD"})]}),e.jsxs("li",{children:[e.jsx("code",{children:"DRIVER_ID"}),", ",e.jsx("code",{children:"CREDIT_DEBIT_NUMBER"}),", ",e.jsx("code",{children:"CREDIT_DEBIT_CVV"})]}),e.jsxs("li",{children:[e.jsx("code",{children:"US_PASSPORT_NUMBER"}),", ",e.jsx("code",{children:"IP_ADDRESS"}),", ",e.jsx("code",{children:"URL"})]})]}),e.jsx("p",{children:"PII detection can be applied to input (preventing users from leaking credentials to the model), output (ensuring the model doesn't regurgitate PII from its training data), or both."})]}),e.jsx(n,{term:"Grounding Check (Hallucination Detection)",children:e.jsxs("p",{children:["The ",e.jsx("strong",{children:"grounding check"})," compares model output against a provided",e.jsx("em",{children:"grounding source"})," (retrieved documents, a knowledge base, or reference text). It computes a grounding score from 0 to 1 and blocks responses below a configurable threshold. This is the primary mechanism for detecting RAG hallucinations — cases where the model generates claims not supported by the retrieved context. A typical threshold is 0.7; scores below that trigger a block action."]})}),e.jsx(r,{title:"Creating and Configuring a Bedrock Guardrail",tabs:{python:`import boto3

bedrock = boto3.client("bedrock", region_name="us-east-1")

# Create a comprehensive guardrail
response = bedrock.create_guardrail(
    name="production-safety-guardrail",
    description="Content moderation for customer-facing AI assistant",

    # Content filters with asymmetric thresholds
    contentPolicyConfig={
        "filtersConfig": [
            {"type": "HATE",          "inputStrength": "HIGH",   "outputStrength": "HIGH"},
            {"type": "INSULTS",       "inputStrength": "MEDIUM", "outputStrength": "MEDIUM"},
            {"type": "SEXUAL",        "inputStrength": "HIGH",   "outputStrength": "HIGH"},
            {"type": "VIOLENCE",      "inputStrength": "MEDIUM", "outputStrength": "MEDIUM"},
            {"type": "MISCONDUCT",    "inputStrength": "HIGH",   "outputStrength": "HIGH"},
            {"type": "PROMPT_ATTACK", "inputStrength": "HIGH",   "outputStrength": "NONE"},
        ]
    },

    # Block specific topics
    topicPolicyConfig={
        "topicsConfig": [
            {
                "name": "competitor-comparison",
                "definition": "Questions asking to compare our products with competitors or recommend competitor products",
                "examples": [
                    "Is your product better than CompetitorX?",
                    "Why should I choose you over CompetitorY?"
                ],
                "type": "DENY"
            },
            {
                "name": "legal-advice",
                "definition": "Requests for specific legal advice, legal opinions, or interpretation of laws",
                "examples": ["Am I liable if...", "Is this contract enforceable?"],
                "type": "DENY"
            }
        ]
    },

    # PII redaction on both input and output
    sensitiveInformationPolicyConfig={
        "piiEntitiesConfig": [
            {"type": "NAME",                 "action": "ANONYMIZE"},
            {"type": "EMAIL",                "action": "ANONYMIZE"},
            {"type": "PHONE",                "action": "ANONYMIZE"},
            {"type": "US_SSN",               "action": "BLOCK"},
            {"type": "CREDIT_DEBIT_NUMBER",  "action": "BLOCK"},
            {"type": "PASSWORD",             "action": "BLOCK"},
            {"type": "USERNAME",             "action": "ANONYMIZE"},
            {"type": "ADDRESS",              "action": "ANONYMIZE"},
            {"type": "AGE",                  "action": "ANONYMIZE"},
            {"type": "IP_ADDRESS",           "action": "ANONYMIZE"},
        ],
        # Custom regex patterns (e.g., internal employee IDs)
        "regexesConfig": [
            {
                "name": "employee-id",
                "description": "Internal employee ID format EMP-XXXXXX",
                "pattern": "EMP-[0-9]{6}",
                "action": "ANONYMIZE"
            }
        ]
    },

    # Word-level filters
    wordPolicyConfig={
        "wordsConfig": [
            {"text": "competitor_product_name"},
            {"text": "internal_codename"},
        ],
        # Managed lists: AWS provides a profanity word list
        "managedWordListsConfig": [
            {"type": "PROFANITY"}
        ]
    },

    # Grounding check for RAG hallucination detection
    contextualGroundingPolicyConfig={
        "filtersConfig": [
            {
                "type": "GROUNDING",
                "threshold": 0.7  # Block if grounding score < 0.7
            },
            {
                "type": "RELEVANCE",
                "threshold": 0.5  # Block if response is off-topic
            }
        ]
    },

    # Messages shown when guardrail blocks
    blockedInputMessaging="I'm sorry, I can't process that request. Please rephrase your question.",
    blockedOutputsMessaging="I'm unable to provide that information. Please contact support for assistance.",

    # KMS encryption for guardrail config
    kmsKeyId="arn:aws:kms:us-east-1:123456789:key/mrk-abc123"
)

guardrail_id = response["guardrailId"]
guardrail_version = response["version"]
print(f"Guardrail created: {guardrail_id} v{guardrail_version}")

# Create an immutable published version
version_response = bedrock.create_guardrail_version(
    guardrailIdentifier=guardrail_id,
    description="Production release 2024-01"
)
print("Published version:", version_response["version"])`}}),e.jsx("h2",{children:"Applying Guardrails to Model Calls"}),e.jsxs("p",{children:["Guardrails integrate directly into the Converse and InvokeModel APIs by adding",e.jsx("code",{children:"guardrailConfig"})," to the request. For the grounding check, you additionally pass a ",e.jsx("code",{children:"grounding source"})," as a special content block in the conversation."]}),e.jsx(t,{language:"python",filename:"apply_guardrail_converse.py",children:`import boto3

bedrock_rt = boto3.client("bedrock-runtime", region_name="us-east-1")

GUARDRAIL_ID = "abcdef123456"
GUARDRAIL_VERSION = "1"  # Use "DRAFT" for testing

# ── Basic guardrail application via Converse ──────────────────────────────
response = bedrock_rt.converse(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {"role": "user", "content": [{"text": "How do I pick a lock?"}]}
    ],
    guardrailConfig={
        "guardrailIdentifier": GUARDRAIL_ID,
        "guardrailVersion": GUARDRAIL_VERSION,
        "trace": "enabled"  # Include guardrail assessment in response
    },
    inferenceConfig={"maxTokens": 1024}
)

# Check if guardrail intervened
if response.get("stopReason") == "guardrail_intervened":
    assessments = response.get("trace", {}).get("guardrail", {})
    input_assessment = assessments.get("inputAssessment", {})
    output_assessments = assessments.get("outputAssessments", {})
    print("Guardrail blocked the request")
    print("Assessment:", input_assessment)
else:
    print(response["output"]["message"]["content"][0]["text"])


# ── Grounding check with RAG context ─────────────────────────────────────
retrieved_context = """
Product warranty covers manufacturing defects for 2 years from purchase date.
Physical damage, water damage, and unauthorized modifications are not covered.
To file a warranty claim, contact support@company.com with your proof of purchase.
"""

response = bedrock_rt.converse(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[
        {
            "role": "user",
            "content": [
                # Grounding source: the retrieved context
                {
                    "guardContent": {
                        "text": {
                            "text": retrieved_context,
                            "qualifiers": ["grounding_source"]
                        }
                    }
                },
                # The actual user question
                {"text": "Does my warranty cover water damage?"}
            ]
        }
    ],
    guardrailConfig={
        "guardrailIdentifier": GUARDRAIL_ID,
        "guardrailVersion": GUARDRAIL_VERSION,
        "trace": "enabled"
    },
    inferenceConfig={"maxTokens": 512}
)

# If the model says "yes, water damage is covered" (hallucination),
# the grounding check will block it since the context says otherwise.
print(response["output"]["message"]["content"][0]["text"])`}),e.jsx("h2",{children:"Standalone ApplyGuardrail API"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"apply_guardrail"})," API lets you check text against a guardrail",e.jsx("em",{children:"without invoking a model"}),". This is useful for pre-screening user input in pipelines where the model call happens elsewhere (e.g., a non-Bedrock model, a RAG retrieval step, or validating agent tool outputs)."]}),e.jsx(t,{language:"python",filename:"apply_guardrail_standalone.py",children:`import boto3

bedrock_rt = boto3.client("bedrock-runtime", region_name="us-east-1")

# Screen text without calling a model
response = bedrock_rt.apply_guardrail(
    guardrailIdentifier="abcdef123456",
    guardrailVersion="1",
    source="INPUT",  # or "OUTPUT"
    content=[
        {
            "text": {
                "text": "My SSN is 123-45-6789 and my email is john@example.com",
                "qualifiers": []
            }
        }
    ]
)

print("Action:", response["action"])  # GUARDRAIL_INTERVENED or NONE

if response["action"] == "GUARDRAIL_INTERVENED":
    # Get the outputs (PII redacted version)
    for output in response["outputs"]:
        print("Redacted text:", output["text"])

    # Inspect which assessments triggered
    for assessment in response["assessments"]:
        if "sensitiveInformationPolicy" in assessment:
            pii_groups = assessment["sensitiveInformationPolicy"].get("piiEntities", [])
            for entity in pii_groups:
                print(f"PII found: {entity['type']} (action: {entity['action']})")`}),e.jsx(s,{name:"Defense-in-Depth with Guardrails",category:"Security",whenToUse:"For any customer-facing AI application where content safety, regulatory compliance, or data privacy are requirements.",children:e.jsxs("p",{children:["Layer guardrails with model-level safety features: use Claude's built-in safety as the first line of defense, then add a Bedrock Guardrail for consistent cross-model policy enforcement. Apply guardrails on ",e.jsx("em",{children:"both"})," input and output — input guards catch prompt injection and jailbreaks before they reach the model; output guards catch model-generated PII, hallucinations, or policy violations. Log all guardrail assessments to CloudWatch for compliance audit trails."]})}),e.jsx(i,{title:"Versioning Guardrails Like Code",children:e.jsxs("p",{children:["Always work in ",e.jsx("code",{children:"DRAFT"})," mode during development, then publish a numbered version for production deployment. Your Converse calls should reference the published version number (e.g., ",e.jsx("code",{children:'"1"'}),"), not ",e.jsx("code",{children:'"DRAFT"'}),". This ensures guardrail policy changes don't silently affect production. Maintain guardrail configuration as Infrastructure as Code (CloudFormation or Terraform) alongside your application code so policy changes go through the same review process as code changes."]})}),e.jsx(o,{type:"warning",title:"Grounding Threshold Calibration",children:e.jsx("p",{children:"Setting the grounding threshold too high (e.g., 0.9) causes excessive false positives — legitimate correct answers get blocked because they naturally paraphrase the source. Start at 0.5 during development and increase gradually while measuring false positive rates. Evaluate against a test set of known-correct and known-hallucinated responses before setting the production threshold. The grounding score is sensitive to response length — short factual answers tend to score lower than longer explanations."})}),e.jsx(o,{type:"info",title:"Guardrails Cost Model",children:e.jsx("p",{children:"Guardrails are billed per-policy-unit processed. Each text unit is 1000 characters. Content filters, denied topics, and word filters are charged per text unit on input and output. PII detection has a separate per-text-unit rate. The grounding check (which runs a semantic similarity model) is more expensive. For high-volume applications, benchmark guardrail costs alongside model inference costs — on some workloads, guardrail processing can add 15-30% to inference cost."})})]})}const D=Object.freeze(Object.defineProperty({__proto__:null,default:h},Symbol.toStringTag,{value:"Module"}));function g(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Amazon Q Developer: AI-Powered Coding Assistant"}),e.jsxs("p",{children:["Amazon Q Developer is an AI coding assistant built on Amazon Bedrock, purpose-built for software development tasks. Beyond inline code completion (which it shares with GitHub Copilot), Q Developer has ",e.jsx("strong",{children:"agentic capabilities"})," — it can take a natural language task description, plan a multi-file implementation, write code across your codebase, run tests, iterate on failures, and create a pull request. It integrates into IDE plugins (VS Code, JetBrains, Visual Studio), the AWS Console, and the CLI."]}),e.jsx(a,{title:"Amazon Q Developer: Agentic Task Flow (/dev)",width:700,height:300,nodes:[{id:"dev",label:`Developer
(/dev prompt)`,type:"external",x:70,y:150},{id:"plan",label:`Planning
Agent`,type:"agent",x:210,y:150},{id:"codebase",label:`Codebase
Context`,type:"store",x:210,y:60},{id:"impl",label:`Implementation
Agent`,type:"agent",x:380,y:150},{id:"files",label:`File Read/
Write Tools`,type:"tool",x:380,y:60},{id:"test",label:`Test
Runner`,type:"tool",x:520,y:100},{id:"pr",label:`Pull Request
/ Diff`,type:"store",x:620,y:150},{id:"review",label:`Developer
Review`,type:"external",x:620,y:240}],edges:[{from:"dev",to:"plan",label:"requirements"},{from:"codebase",to:"plan",label:"context"},{from:"plan",to:"impl",label:"task plan"},{from:"impl",to:"files",label:"read/write"},{from:"impl",to:"test",label:"run tests"},{from:"test",to:"impl",label:"failures"},{from:"impl",to:"pr",label:"diff"},{from:"pr",to:"review",label:"approve/reject"}]}),e.jsx("h2",{children:"Agentic Capabilities"}),e.jsxs(n,{term:"/dev — Multi-File Feature Implementation",children:[e.jsxs("p",{children:["The ",e.jsx("code",{children:"/dev"})," command is Q Developer's most powerful agentic feature. You provide a natural language description of a feature or change, and Q Developer:"]}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Indexes your workspace"})," — reads relevant files to understand context, existing patterns, and conventions"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Creates a plan"})," — proposes which files to create/modify and what changes to make (you can review and edit the plan before proceeding)"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Implements the changes"})," — writes code across multiple files following your codebase's style"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Runs tests"})," — executes your test suite and iterates on failures autonomously"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Presents a diff"})," — shows all changes before applying them, and can create a Git commit or PR"]})]}),e.jsx("p",{children:"The agentic loop runs autonomously but with human checkpoints at the plan approval stage and diff review stage, following a human-in-the-loop pattern that prevents fully unsupervised code changes."})]}),e.jsxs(n,{term:"/review — Inline Code Review",children:[e.jsxs("p",{children:["The ",e.jsx("code",{children:"/review"})," command performs an automated code review of staged changes, a specific file, or a pull request. It produces inline comments categorized by:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Security"})," — SQL injection, hardcoded secrets, insecure deserialization, SSRF vulnerabilities"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Quality"})," — null pointer risks, resource leaks, incorrect error handling, dead code"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Performance"})," — N+1 queries, unnecessary allocations, blocking calls in async contexts"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Maintainability"})," — overly complex functions, missing documentation, unclear naming"]})]}),e.jsx("p",{children:"Unlike static analysis tools that match patterns, Q Developer's review uses semantic understanding — it can identify logic bugs that don't match any specific lint rule."})]}),e.jsx(n,{term:"Security Scanning",children:e.jsxs("p",{children:["Q Developer's security scanning (formerly CodeGuru Security) runs over 350 detectors across 15 programming languages. Detectors cover OWASP Top 10 and CWE categories including: injection flaws (SQL, command, LDAP), cryptographic weaknesses (hardcoded keys, weak algorithms), secrets detection (API keys, credentials in code), and infrastructure-as-code misconfigurations (open S3 buckets, overly permissive IAM). Scans can be triggered from the IDE, CLI, or integrated into CI/CD pipelines via the",e.jsx("code",{children:"aws codewhisperer"})," CLI or ",e.jsx("code",{children:"aws q"})," CLI."]})}),e.jsx("h2",{children:"IDE Integration and Inline Completions"}),e.jsxs("p",{children:["Q Developer provides real-time inline code completions in VS Code, JetBrains IDEs (IntelliJ, PyCharm, GoLand, etc.), Visual Studio, and AWS Cloud9. Completions are context-aware — the model receives the current file, open tabs, and project structure. The ",e.jsx("strong",{children:"Free Tier"})," provides unlimited single-line completions and 50 chat interactions per month. The ",e.jsx("strong",{children:"Pro Tier"})," (per-user subscription) removes limits and adds organizational features like customization on internal codebases."]}),e.jsx(r,{title:"Amazon Q Developer CLI and /dev Workflow",tabs:{python:`# Amazon Q Developer CLI commands
# Install: https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html

# ── CLI: Start a chat session ─────────────────────────────────────────────
# $ q chat
# > /dev Add a rate limiting middleware to the Express API that limits
#         each IP to 100 requests per minute using Redis for state storage.
#
# Q Developer response flow:
# 1. "I'll analyze your codebase to understand the current middleware setup..."
#    [reads: src/app.js, src/middleware/, package.json]
# 2. "Here's my plan:
#    - Create src/middleware/rateLimiter.js (new file)
#    - Modify src/app.js to register the middleware
#    - Add redis dependency to package.json
#    - Create tests/middleware/rateLimiter.test.js
#    Does this plan look correct? [Yes/Edit/Cancel]"
# 3. [After approval] Generates all files and runs: npm test
# 4. "Tests passed. Here is the diff: [shows changes]
#    Apply changes? [Yes/No]"

# ── CLI: Security scan ────────────────────────────────────────────────────
# $ q scan
# Scanning project... (runs 350+ detectors)
# Found 3 issues:
#   HIGH   src/auth.py:42  Hardcoded AWS credentials detected
#   MEDIUM src/db.py:17    SQL query constructed with string formatting (injection risk)
#   LOW    src/config.py:8 Weak hashing algorithm (MD5) used for password storage


# ── Python SDK: Using Q Developer via boto3 (QDeveloper API) ──────────────
# Amazon Q Developer exposes programmatic access via the qbusiness and
# codewhisperer APIs for enterprise workflows.

import boto3

# Q Developer code generation via Bedrock (underlying model access)
# For custom tooling, you can invoke the same models Q uses directly

bedrock_rt = boto3.client("bedrock-runtime", region_name="us-east-1")

# Q Developer uses Claude under the hood - you can replicate its prompting pattern
system_prompt = """You are an expert software engineer. When given a code task:
1. First analyze the existing code context provided
2. Write clean, idiomatic code following the existing patterns
3. Include appropriate error handling
4. Add docstrings and type hints
5. Consider edge cases"""

# Simulate a /dev task via direct API
code_context = """
# existing_code/src/api/users.py
from flask import Blueprint, request, jsonify
from .models import User
from .auth import require_auth

users_bp = Blueprint('users', __name__)

@users_bp.route('/users/<int:user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())
"""

task = "Add a PATCH endpoint to update user profile fields (name, bio, avatar_url). Include input validation and return 400 for invalid fields."

response = bedrock_rt.converse(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    system=[{"text": system_prompt}],
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "text": f"Existing code:\\n\\n{code_context}\\n\\nTask: {task}"
                }
            ]
        }
    ],
    inferenceConfig={"maxTokens": 2048, "temperature": 0.0}
)

generated_code = response["output"]["message"]["content"][0]["text"]
print(generated_code)`}}),e.jsx("h2",{children:"Java Upgrade Transformations"}),e.jsxs(n,{term:"Automated Language Upgrades",children:[e.jsxs("p",{children:["Q Developer's ",e.jsx("strong",{children:"transformation"})," feature automates large-scale code migrations that would take weeks manually. Currently supported transformations:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Java 8/11 → Java 17/21"})," — Updates deprecated APIs, migrates to Records and Sealed Classes where appropriate, updates Maven/Gradle configs, resolves breaking changes in newer JDK releases"]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Spring Boot 2.x → 3.x"})," — Migrates javax.* to jakarta.* namespaces, updates Spring Security config, resolves deprecated bean configurations"]}),e.jsxs("li",{children:[e.jsx("strong",{children:".NET Framework → .NET 8"})," — Windows-specific APIs to cross-platform equivalents, updated dependency injection patterns"]})]}),e.jsx("p",{children:"The transformation runs as a batch job: Q Developer reads your entire codebase, builds a dependency graph, applies changes incrementally, compiles after each change, and generates a comprehensive pull request with migration notes."})]}),e.jsx(t,{language:"python",filename:"q_transformation_cli.py",children:`# Java transformation via Q Developer CLI
# $ q transform --language java --source-version 11 --target-version 17

# What happens internally:
# 1. Q Developer uploads your Maven/Gradle project to a secure build environment
# 2. Runs the current test suite to establish a baseline
# 3. Applies transformations in dependency order:
#    - Updates pom.xml/build.gradle with new Java version
#    - Replaces deprecated javax.* with jakarta.* (for Spring Boot 3.x)
#    - Migrates anonymous inner classes to lambdas where safe
#    - Updates Mockito/JUnit 4 patterns to JUnit 5
#    - Fixes compilation errors from removed APIs (e.g., Date.getYear())
# 4. Runs test suite after each batch of changes
# 5. If tests fail, attempts automated fix or flags for manual review
# 6. Creates a PR with:
#    - Summary of all changes
#    - Files changed (diff)
#    - Test results before/after
#    - Manual action items for changes it couldn't automate

# Programmatic access to transformation status
import boto3

codewhisperer = boto3.client("codewhisperer", region_name="us-east-1")

# Start a transformation job
job = codewhisperer.start_transformation_job(
    workspaceState={
        "uploadId": "upload-id-from-prior-zip-upload",
        "programmingLanguage": {"languageName": "java"},
        "compilationUnits": []
    },
    transformationSpec={
        "transformationType": "LANGUAGE_UPGRADE",
        "source": {"language": {"name": "JAVA_11"}},
        "target": {"language": {"name": "JAVA_17"}}
    }
)

job_id = job["transformationJobId"]

# Poll for completion
import time
while True:
    status = codewhisperer.get_transformation_job(transformationJobId=job_id)
    state = status["transformationJob"]["status"]
    print(f"Job status: {state}")

    if state in ("COMPLETED", "FAILED", "STOPPED"):
        break
    time.sleep(30)

if state == "COMPLETED":
    # Download the transformed artifact
    plan = codewhisperer.get_transformation_plan(transformationJobId=job_id)
    for step in plan["transformationPlan"]["transformationSteps"]:
        print(f"Step: {step['name']} — {step['description']}")`}),e.jsx("h2",{children:"/test and /doc Commands"}),e.jsx(t,{language:"python",filename:"q_test_doc_commands.py",children:`# /test — Unit test generation
# In IDE chat panel or CLI:
# > /test generate tests for src/payment/processor.py

# Q Developer will:
# 1. Read the target file and understand all functions/classes
# 2. Identify testable units (pure functions, class methods)
# 3. Detect existing test patterns (pytest vs unittest, fixture style)
# 4. Generate tests covering:
#    - Happy path (valid inputs)
#    - Edge cases (empty inputs, boundary values)
#    - Error cases (invalid inputs, exception paths)
#    - Mock setup for external dependencies (database, HTTP calls)
# 5. Place tests in the correct test directory following project conventions

# Example generated test skeleton for a payment processor:
"""
import pytest
from unittest.mock import Mock, patch
from src.payment.processor import PaymentProcessor, PaymentError

@pytest.fixture
def processor():
    return PaymentProcessor(api_key="test-key-123")

class TestChargeCard:
    def test_successful_charge(self, processor):
        with patch("src.payment.processor.stripe.charge.create") as mock_charge:
            mock_charge.return_value = Mock(id="ch_123", status="succeeded")
            result = processor.charge_card(amount=1000, currency="usd", token="tok_visa")
            assert result.charge_id == "ch_123"
            assert result.success is True

    def test_declined_card_raises_payment_error(self, processor):
        with patch("src.payment.processor.stripe.charge.create") as mock_charge:
            mock_charge.side_effect = stripe.error.CardError(
                message="Your card was declined.",
                param="number",
                code="card_declined"
            )
            with pytest.raises(PaymentError, match="card_declined"):
                processor.charge_card(amount=1000, currency="usd", token="tok_declined")

    def test_zero_amount_raises_value_error(self, processor):
        with pytest.raises(ValueError, match="Amount must be positive"):
            processor.charge_card(amount=0, currency="usd", token="tok_visa")
"""

# /doc — Documentation generation
# > /doc generate for src/api/

# Q Developer generates:
# - Module-level docstrings explaining purpose
# - Function/method docstrings with Args, Returns, Raises sections
# - README.md for the module (if requested)
# - OpenAPI/Swagger annotations for Flask/FastAPI endpoints`}),e.jsx("h2",{children:"Q Developer Agent SDK"}),e.jsxs("p",{children:["For enterprise customization, Q Developer exposes an ",e.jsx("strong",{children:"Agent SDK"})," that lets you build custom Q Developer plugins — tools that appear natively in the Q chat interface. Custom tools can query internal systems (Jira, Confluence, internal APIs) and return structured responses that Q incorporates into its answers."]}),e.jsx(t,{language:"python",filename:"q_custom_plugin.py",children:`# Q Developer custom plugin (Lambda-backed tool)
# Plugins extend Q's knowledge with internal data sources

import json

def lambda_handler(event, context):
    """
    Q Developer calls this Lambda when it decides to use the plugin.
    The event contains the user's query parameters.
    """
    action = event.get("actionName")
    parameters = event.get("parameters", {})

    if action == "get_internal_ticket":
        ticket_id = parameters.get("ticketId", {}).get("value")
        # Query internal Jira/ServiceNow
        ticket = fetch_ticket_from_jira(ticket_id)
        return {
            "actionName": action,
            "actionParameters": parameters,
            "responseBody": {
                "application/json": {
                    "body": json.dumps({
                        "ticketId": ticket_id,
                        "title": ticket["summary"],
                        "status": ticket["status"],
                        "assignee": ticket["assignee"],
                        "description": ticket["description"][:500]
                    })
                }
            }
        }

    elif action == "search_runbooks":
        query = parameters.get("query", {}).get("value")
        results = search_confluence(query, space="RUNBOOKS")
        return {
            "actionName": action,
            "actionParameters": parameters,
            "responseBody": {
                "application/json": {
                    "body": json.dumps({
                        "results": [
                            {"title": r["title"], "url": r["url"], "excerpt": r["excerpt"]}
                            for r in results[:3]
                        ]
                    })
                }
            }
        }


def fetch_ticket_from_jira(ticket_id):
    # Placeholder: real implementation queries Jira REST API
    return {"summary": "...", "status": "In Progress", "assignee": "...", "description": "..."}


def search_confluence(query, space):
    # Placeholder: real implementation queries Confluence REST API
    return []`}),e.jsx(s,{name:"Q Developer in CI/CD Pipelines",category:"Automation",whenToUse:"When you want automated security scanning, code review, and test generation integrated into your pull request workflow without manual IDE usage.",children:e.jsxs("p",{children:["Integrate Q Developer into GitHub Actions or AWS CodePipeline to automatically: run security scans on every PR (",e.jsx("code",{children:"q scan --output sarif"})," produces SARIF for GitHub Security tab integration), generate unit tests for new functions lacking coverage, and post review comments on PRs. This shifts security and quality checks left without requiring developers to run them manually. The ",e.jsx("code",{children:"amazonq"}),"GitHub Action handles authentication via OIDC and posts findings as PR annotations."]})}),e.jsx(i,{title:"Providing Good Context for /dev Tasks",children:e.jsxs("p",{children:["The quality of ",e.jsx("code",{children:"/dev"}),' output is proportional to the quality of your task description. Include: the specific feature or behavior you want, acceptance criteria (what does "done" look like), constraints (must be backwards compatible, must not change the public API, use existing Logger pattern), and pointers to relevant existing files. Q Developer performs better with specific, scoped tasks ("add rate limiting to the /api/search endpoint") than vague ones ("improve performance"). For large features, break them into multiple sequential /dev tasks.']})}),e.jsx(o,{type:"tip",title:"Customization on Internal Codebases",children:e.jsxs("p",{children:["Q Developer Pro supports ",e.jsx("strong",{children:"customization"}),": you can fine-tune the completion model on your internal codebase (up to 10GB of code). Customized Q Developer learns your internal library APIs, naming conventions, and architectural patterns — dramatically improving completion relevance for internal frameworks not in the model's training data. Customization uses AWS PrivateLink; your code never leaves your AWS account."]})}),e.jsx(o,{type:"info",title:"Q Developer vs GitHub Copilot",children:e.jsxs("p",{children:["Q Developer and GitHub Copilot have similar inline completion quality. Q Developer differentiates on: deeper AWS service integration (it knows CloudFormation, CDK, and boto3 APIs intimately), the agentic ",e.jsx("code",{children:"/dev"})," command (Copilot Workspace is the comparable feature), built-in security scanning (requires separate GitHub Advanced Security for Copilot), and the Java/Spring transformation feature. For AWS-heavy shops, Q Developer's native understanding of AWS services and IAM patterns provides a practical advantage."]})})]})}const M=Object.freeze(Object.defineProperty({__proto__:null,default:g},Symbol.toStringTag,{value:"Module"}));function f(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Vertex AI + Gemini: Google's Foundation Models on GCP"}),e.jsx("p",{children:"Vertex AI is Google Cloud's unified ML platform, and Gemini is Google's flagship family of multimodal foundation models. Together they provide a fully managed, enterprise-ready environment for building AI applications — with built-in grounding, function calling, safety settings, and a massive 1 million token context window."}),e.jsx(n,{term:"Gemini Model Family",children:e.jsxs("p",{children:["Google offers three primary Gemini tiers for different workloads. ",e.jsx("strong",{children:"Gemini 2.0 Flash"})," ","(",e.jsx("code",{children:"gemini-2.0-flash-001"}),") is optimized for low latency and high throughput, making it the default choice for agentic loops and interactive applications."," ",e.jsx("strong",{children:"Gemini 1.5 Pro"})," (",e.jsx("code",{children:"gemini-1.5-pro-002"}),") delivers the highest intelligence with a true 1M token context window — enough to process entire codebases, hour-long videos, or thousands of documents in a single call."," ",e.jsx("strong",{children:"Gemini 1.5 Flash"})," sits between them: faster and cheaper than Pro, more capable than standard Flash. All models support multimodal inputs: text, images, video, audio, and PDF documents natively."]})}),e.jsx(a,{title:"Vertex AI Gemini Architecture",width:680,height:300,nodes:[{id:"client",label:"Application",type:"external",x:70,y:150},{id:"vertex",label:`Vertex AI
Endpoint`,type:"agent",x:220,y:150},{id:"gemini",label:`Gemini Model
(Flash / Pro)`,type:"llm",x:400,y:80},{id:"grounding",label:`Google Search
Grounding`,type:"store",x:400,y:180},{id:"tools",label:`Function
Calling / Tools`,type:"tool",x:400,y:260},{id:"response",label:`Grounded
Response`,type:"external",x:580,y:150}],edges:[{from:"client",to:"vertex",label:"request"},{from:"vertex",to:"gemini"},{from:"vertex",to:"grounding"},{from:"vertex",to:"tools"},{from:"gemini",to:"response"},{from:"grounding",to:"response"},{from:"tools",to:"response"}]}),e.jsx("h2",{children:"Core Capabilities"}),e.jsx("h3",{children:"1 Million Token Context Window"}),e.jsx("p",{children:"Gemini 1.5 Pro's context window is genuinely transformative for agentic workloads. You can pass an entire codebase, a full legal contract corpus, or 90 minutes of video as context and ask questions over it without any retrieval step. This changes the RAG equation: for document sets under ~750K tokens, in-context retrieval can outperform vector search on precision while dramatically simplifying the pipeline."}),e.jsx("h3",{children:"Multimodal Inputs"}),e.jsxs("p",{children:["Every Gemini model accepts interleaved content: text, images (JPEG, PNG, WebP, HEIC), video (MP4, MOV, AVI up to 1 hour), audio (WAV, MP3, FLAC), and PDF documents. Inputs are passed as ",e.jsx("code",{children:"Part"})," objects inside a ",e.jsx("code",{children:"Content"})," message. For large files, use Cloud Storage URIs rather than inline base64 encoding."]}),e.jsx("h3",{children:"Grounding with Google Search"}),e.jsxs("p",{children:["Grounding connects Gemini's responses to live web data via Google Search. When enabled, the model automatically retrieves relevant web pages and cites them in its response — dramatically reducing hallucinations on factual queries. Grounding is configured via",e.jsx("code",{children:"tools=[Tool(google_search_retrieval=GoogleSearchRetrieval())]"}),"."]}),e.jsx("h2",{children:"SDK: google-cloud-aiplatform"}),e.jsxs("p",{children:["The canonical SDK for Vertex AI is ",e.jsx("code",{children:"google-cloud-aiplatform"}),". It provides the ",e.jsx("code",{children:"GenerativeModel"})," class that wraps Gemini models with Vertex AI's enterprise features (IAM, audit logging, VPC, regional endpoints)."]}),e.jsx(o,{type:"info",title:"Vertex AI SDK vs. google.generativeai",children:e.jsxs("p",{children:["There are two Python SDKs for Gemini. ",e.jsx("code",{children:"google.generativeai"})," (the Gemini API SDK) uses an API key and targets the Google AI Studio endpoint — suitable for prototyping and consumer applications. ",e.jsx("code",{children:"google-cloud-aiplatform"})," (the Vertex AI SDK) uses GCP service account credentials and routes through Vertex AI — required for enterprise features: data residency, VPC Service Controls, CMEK encryption, Cloud Audit Logs, and committed use discounts. Use Vertex AI for any production GCP deployment."]})}),e.jsx(r,{title:"Gemini on Vertex AI — Core Usage",tabs:{python:`import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    GenerationConfig,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
    Part,
    Tool,
    FunctionDeclaration,
    GoogleSearchRetrieval,
)

# Initialize Vertex AI — reads ADC credentials automatically
vertexai.init(project="my-gcp-project", location="us-central1")

# 1. Basic text generation
model = GenerativeModel("gemini-2.0-flash-001")
response = model.generate_content("Explain chain-of-thought prompting in 3 sentences.")
print(response.text)

# 2. System instructions + generation config
model = GenerativeModel(
    "gemini-1.5-pro-002",
    system_instruction=[
        "You are a senior software architect. Be concise and use examples.",
        "Always recommend production-ready patterns."
    ]
)

generation_config = GenerationConfig(
    temperature=0.2,
    top_p=0.8,
    max_output_tokens=2048,
    response_mime_type="application/json",  # Force JSON output
)

response = model.generate_content(
    "List the top 3 patterns for building resilient microservices.",
    generation_config=generation_config,
)

# 3. Multimodal: image + text
with open("architecture_diagram.png", "rb") as f:
    image_bytes = f.read()

image_part = Part.from_data(data=image_bytes, mime_type="image/png")
# Or from Cloud Storage: Part.from_uri("gs://bucket/image.png", mime_type="image/png")

response = model.generate_content([
    image_part,
    "Analyze this architecture diagram. Identify any single points of failure."
])

# 4. Safety settings — reduce blocking for technical content
safety_settings = [
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=HarmBlockThreshold.BLOCK_ONLY_HIGH,
    ),
]

response = model.generate_content(
    "How does SQL injection work? (security research context)",
    safety_settings=safety_settings,
)

# 5. Grounding with Google Search
grounded_model = GenerativeModel(
    "gemini-2.0-flash-001",
    tools=[Tool(google_search_retrieval=GoogleSearchRetrieval())]
)

response = grounded_model.generate_content(
    "What is the current Vertex AI pricing for Gemini 1.5 Pro?"
)
# response.candidates[0].grounding_metadata contains cited sources
for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
    print(f"Source: {chunk.web.uri}")
print(response.text)`}}),e.jsx("h2",{children:"Streaming Responses"}),e.jsxs("p",{children:["For interactive applications, stream tokens as they are generated. Vertex AI supports server-sent events via the ",e.jsx("code",{children:"stream=True"})," parameter."]}),e.jsx(t,{language:"python",filename:"gemini_streaming.py",children:`import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(project="my-gcp-project", location="us-central1")
model = GenerativeModel("gemini-2.0-flash-001")

# Streaming generation
for chunk in model.generate_content("Write a haiku about distributed systems.", stream=True):
    print(chunk.text, end="", flush=True)
print()  # newline after stream

# Async streaming (for FastAPI / asyncio applications)
import asyncio

async def stream_response(prompt: str):
    responses = model.generate_content_async(prompt, stream=True)
    async for chunk in await responses:
        yield chunk.text

# Multi-turn conversation with streaming
chat = model.start_chat()
for chunk in chat.send_message("What is Vertex AI?", stream=True):
    print(chunk.text, end="", flush=True)
print()

# Continue the conversation (history is maintained automatically)
for chunk in chat.send_message("How does it compare to SageMaker?", stream=True):
    print(chunk.text, end="", flush=True)`}),e.jsx("h2",{children:"Function Calling"}),e.jsxs("p",{children:["Gemini supports parallel function calling — it can request multiple tool calls in a single response. Define tools via ",e.jsx("code",{children:"FunctionDeclaration"})," with JSON Schema parameter definitions."]}),e.jsx(t,{language:"python",filename:"gemini_function_calling.py",children:`from vertexai.generative_models import (
    GenerativeModel, Tool, FunctionDeclaration, Part
)

# Define function schemas
get_weather = FunctionDeclaration(
    name="get_weather",
    description="Get current weather for a city",
    parameters={
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name"},
            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
        },
        "required": ["city"],
    },
)

search_flights = FunctionDeclaration(
    name="search_flights",
    description="Search for available flights between two cities",
    parameters={
        "type": "object",
        "properties": {
            "origin": {"type": "string"},
            "destination": {"type": "string"},
            "date": {"type": "string", "description": "ISO 8601 date"},
        },
        "required": ["origin", "destination", "date"],
    },
)

tools = Tool(function_declarations=[get_weather, search_flights])
model = GenerativeModel("gemini-2.0-flash-001", tools=[tools])

# Agentic loop
chat = model.start_chat()
response = chat.send_message(
    "I'm flying from NYC to London on 2025-03-20. What's the weather like there?"
)

# Handle parallel function calls
while response.candidates[0].finish_reason.name == "STOP" is False:
    tool_calls = response.candidates[0].content.parts
    tool_responses = []

    for part in tool_calls:
        if part.function_call:
            fn_name = part.function_call.name
            fn_args = dict(part.function_call.args)

            # Execute the actual function
            if fn_name == "get_weather":
                result = {"temp": 12, "condition": "cloudy", "city": fn_args["city"]}
            elif fn_name == "search_flights":
                result = {"flights": [{"airline": "BA", "price": 450}]}
            else:
                result = {"error": "Unknown function"}

            tool_responses.append(
                Part.from_function_response(name=fn_name, response=result)
            )

    response = chat.send_message(tool_responses)

print(response.text)`}),e.jsx(s,{name:"Grounded Generation with Citation Tracking",category:"RAG / Grounding",whenToUse:"When answering factual questions where accuracy is critical and hallucinations would be costly — legal, medical, financial, or technical documentation queries.",children:e.jsx("p",{children:"Use Vertex AI's native Google Search grounding instead of building a custom RAG pipeline for general knowledge queries. The model automatically decides when to search, retrieves relevant content, and generates a grounded response with inline citations. For private data, combine grounding with Vertex AI Search data stores (covered in the Agent Builder section)."})}),e.jsx(i,{title:"Context Window Strategy",children:e.jsxs("p",{children:["For Gemini 1.5 Pro, prefer in-context loading over vector retrieval when your document set fits within 500K tokens. This eliminates retrieval errors and gives the model full access to all content. For larger corpora, use Vertex AI Search for managed chunking and retrieval. Always pass PDFs as ",e.jsx("code",{children:"Part.from_uri"})," with a GCS URI rather than extracting text — Gemini's native PDF parsing preserves tables, charts, and layout that text extraction loses."]})}),e.jsx(i,{title:"Authentication and Regional Endpoints",children:e.jsxs("p",{children:["Use Application Default Credentials (ADC) via ",e.jsx("code",{children:"gcloud auth application-default login"}),"in development and Workload Identity Federation in production — never hardcode service account keys. Deploy to the same region as your data to minimize latency and satisfy data residency requirements. Use ",e.jsx("code",{children:"us-central1"})," for the broadest model availability, ",e.jsx("code",{children:"europe-west4"})," for EU data residency."]})}),e.jsx(o,{type:"warning",title:"Token Counting Before Long-Context Calls",children:e.jsxs("p",{children:["Always call ",e.jsx("code",{children:"model.count_tokens(contents)"})," before submitting requests with large documents. Gemini 1.5 Pro's 1M token limit is per-request, and exceeding it raises an error. Token counting is free and fast — use it as a guard before every long-context call. A 100-page PDF is roughly 50K–80K tokens depending on density."]})})]})}const E=Object.freeze(Object.defineProperty({__proto__:null,default:f},Symbol.toStringTag,{value:"Module"}));function y(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Vertex AI Agent Builder"}),e.jsx("p",{children:"Vertex AI Agent Builder is Google Cloud's managed platform for building production agents without writing orchestration code. It combines Dialogflow CX's battle-tested conversation management with Gemini's LLM capabilities, wrapping both in a unified console, API, and evaluation framework. You can build three types of agents: Playbooks (LLM-driven, instruction-following), Flows (deterministic, graph-based), or hybrid agents that combine both."}),e.jsx(a,{title:"Vertex AI Agent Builder Components",width:720,height:320,nodes:[{id:"user",label:"End User",type:"external",x:60,y:160},{id:"agent",label:`Agent
(Playbook/Flow)`,type:"agent",x:220,y:160},{id:"datastore",label:`Data Store
(RAG)`,type:"store",x:420,y:80},{id:"tools",label:`Tools
(OpenAPI/Functions)`,type:"tool",x:420,y:160},{id:"gemini",label:`Gemini
LLM`,type:"llm",x:420,y:240},{id:"eval",label:`Evaluation
Framework`,type:"tool",x:600,y:100},{id:"deploy",label:`Deployment
(API/Messenger)`,type:"external",x:600,y:220}],edges:[{from:"user",to:"agent",label:"query"},{from:"agent",to:"datastore",label:"RAG lookup"},{from:"agent",to:"tools",label:"function call"},{from:"agent",to:"gemini",label:"generation"},{from:"gemini",to:"agent",label:"response"},{from:"agent",to:"deploy"},{from:"agent",to:"eval",label:"metrics"}]}),e.jsx("h2",{children:"Core Concepts"}),e.jsx(n,{term:"Data Stores",children:e.jsx("p",{children:"Data stores are the RAG layer of Agent Builder. They ingest documents from multiple sources — Cloud Storage (PDF, HTML, TXT, DOCX), BigQuery tables, websites (crawled on a schedule), or third-party connectors (Salesforce, SharePoint, Confluence, Jira). Agent Builder handles chunking, embedding, and indexing automatically. Each data store can be attached to an agent as a grounding tool, so the agent retrieves relevant chunks before generating a response. Data stores support metadata filtering and access control lists (ACL-aware search) for enterprise scenarios."})}),e.jsx(n,{term:"Playbooks",children:e.jsx("p",{children:"Playbooks are LLM-based agents defined entirely by natural language instructions and examples. You write a goal statement, a set of step-by-step instructions, and few-shot input/output examples. Gemini interprets these instructions at runtime to decide which tools to call and how to respond. Playbooks are the right choice for open-ended conversational agents where you can't enumerate every possible user path. They support sub-playbooks for modular design — a router playbook can hand off to specialist sub-playbooks for billing, technical support, or HR queries."})}),e.jsx(n,{term:"Flows (Dialogflow CX)",children:e.jsx("p",{children:"Flows use Dialogflow CX's deterministic state machine: pages, routes, fulfillments, and parameters. Every transition is explicit and auditable — nothing is left to LLM interpretation. Flows are ideal for compliance-critical paths (e.g., account cancellation that must follow a specific disclosure script) or high-volume, narrow intents where latency and predictability matter more than flexibility. Flows can call Playbooks for sub-tasks that require open-ended reasoning."})}),e.jsx("h2",{children:"Data Store: Creating and Querying"}),e.jsx(r,{title:"Data Store Setup and Query (google-cloud-discoveryengine)",tabs:{python:`from google.cloud import discoveryengine_v1 as discoveryengine
from google.api_core.client_options import ClientOptions

PROJECT_ID = "my-gcp-project"
LOCATION = "us"         # Data stores are global or us/eu
DATA_STORE_ID = "my-docs-store"

# Client with correct endpoint for global/US location
client_options = ClientOptions(
    api_endpoint=f"{LOCATION}-discoveryengine.googleapis.com"
)
client = discoveryengine.SearchServiceClient(client_options=client_options)

# Build the serving config resource name
serving_config = (
    f"projects/{PROJECT_ID}/locations/{LOCATION}"
    f"/collections/default_collection"
    f"/dataStores/{DATA_STORE_ID}"
    f"/servingConfigs/default_config"
)

# 1. Search the data store (semantic + keyword hybrid)
request = discoveryengine.SearchRequest(
    serving_config=serving_config,
    query="What is the refund policy for enterprise contracts?",
    page_size=5,
    content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
        snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
            return_snippet=True,
            max_snippet_count=3,
        ),
        summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
            summary_result_count=3,
            include_citations=True,
            model_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec.ModelSpec(
                version="stable"
            ),
        ),
    ),
)

response = client.search(request)

# The summary contains a grounded answer with citations
print("Summary:", response.summary.summary_text)
for result in response.results:
    doc = result.document
    print(f"  Doc: {doc.name}, Score: {result.model_scores}")

# 2. Import documents from Cloud Storage
import_client = discoveryengine.DocumentServiceClient(client_options=client_options)
parent = (
    f"projects/{PROJECT_ID}/locations/{LOCATION}"
    f"/collections/default_collection/dataStores/{DATA_STORE_ID}/branches/default_branch"
)

operation = import_client.import_documents(
    request=discoveryengine.ImportDocumentsRequest(
        parent=parent,
        gcs_source=discoveryengine.GcsSource(
            input_uris=["gs://my-bucket/docs/**"],
            data_schema="content",  # "content" for unstructured, "custom" for JSON
        ),
        reconciliation_mode=discoveryengine.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL,
    )
)

# Wait for import to complete
print("Waiting for import:", operation.operation.name)
result = operation.result(timeout=300)
print(f"Import complete: {result.error_samples}")`}}),e.jsx("h2",{children:"Playbook Agent: Python SDK"}),e.jsxs("p",{children:["The Dialogflow CX SDK (",e.jsx("code",{children:"google-cloud-dialogflow-cx"}),") is used to interact with deployed Agent Builder agents programmatically — sending messages, managing sessions, and streaming responses."]}),e.jsx(t,{language:"python",filename:"agent_builder_playbook.py",children:`from google.cloud.dialogflowcx_v3 import SessionsClient, QueryInput, TextInput
from google.api_core.client_options import ClientOptions
import uuid

PROJECT_ID = "my-gcp-project"
LOCATION = "us-central1"
AGENT_ID = "my-agent-id"   # From Agent Builder console

client_options = ClientOptions(
    api_endpoint=f"{LOCATION}-dialogflow.googleapis.com"
)
client = SessionsClient(client_options=client_options)

# Each conversation gets a unique session ID
session_id = str(uuid.uuid4())
session_path = client.session_path(PROJECT_ID, LOCATION, AGENT_ID, session_id)

def chat(user_message: str) -> str:
    """Send a message and get a response from the agent."""
    request = {
        "session": session_path,
        "query_input": QueryInput(
            text=TextInput(text=user_message),
            language_code="en",
        ),
    }
    response = client.detect_intent(request=request)
    query_result = response.query_result

    # Extract text response
    for message in query_result.response_messages:
        if hasattr(message, "text") and message.text.text:
            return message.text.text[0]
    return ""

# Streaming detect intent (lower time-to-first-token)
def stream_chat(user_message: str):
    """Stream response tokens from the agent."""
    requests = [
        {
            "session": session_path,
            "query_input": QueryInput(
                text=TextInput(text=user_message),
                language_code="en",
            ),
        }
    ]
    for response in client.streaming_detect_intent(iter(requests)):
        if response.detect_intent_response:
            for msg in response.detect_intent_response.query_result.response_messages:
                if hasattr(msg, "text") and msg.text.text:
                    yield msg.text.text[0]

# Example conversation
print(chat("What is your refund policy?"))
print(chat("Can I get a refund on a 2-year contract?"))

for token in stream_chat("Summarize our conversation"):
    print(token, end="", flush=True)`}),e.jsx("h2",{children:"Tools: OpenAPI Spec Integration"}),e.jsx("p",{children:"Agent Builder tools connect the agent to external APIs using OpenAPI 3.0 specs. When the agent decides to call an external system, it constructs the API request automatically from the spec and your provided auth configuration."}),e.jsx(t,{language:"yaml",filename:"weather_tool_spec.yaml",children:`openapi: "3.0.0"
info:
  title: Weather API
  version: "1.0"
servers:
  - url: https://api.weather.example.com
paths:
  /current:
    get:
      operationId: getCurrentWeather
      summary: Get current weather for a location
      parameters:
        - name: city
          in: query
          required: true
          schema:
            type: string
          description: City name or lat,lon
        - name: units
          in: query
          schema:
            type: string
            enum: [metric, imperial]
            default: metric
      responses:
        "200":
          description: Current weather data
          content:
            application/json:
              schema:
                type: object
                properties:
                  temperature: {type: number}
                  condition: {type: string}
                  humidity: {type: number}`}),e.jsx("h2",{children:"Evaluation Framework"}),e.jsx("p",{children:"Agent Builder's evaluation framework measures agent quality automatically using Gemini as an evaluator. Key metrics include tool call accuracy (did the agent call the right tool?), trajectory evaluation (did it follow the correct sequence of steps?), and response quality (helpfulness, groundedness, safety)."}),e.jsx(t,{language:"python",filename:"agent_evaluation.py",children:`from vertexai.preview.evaluation import EvalTask
from vertexai.preview.generative_models import GenerativeModel
import pandas as pd

# Evaluation dataset: input queries with expected tool calls / responses
eval_dataset = pd.DataFrame({
    "prompt": [
        "What is the weather in London?",
        "Book a flight from NYC to Paris on March 20",
        "What is our refund policy?",
    ],
    "reference": [
        "The weather in London is 12°C and cloudy.",
        "I found flights from NYC to Paris on March 20 starting at $450.",
        "Our refund policy allows returns within 30 days.",
    ],
    # Expected tool calls for trajectory evaluation
    "expected_tool_calls": [
        ["getCurrentWeather"],
        ["searchFlights"],
        [],  # Should use data store, not a tool
    ],
})

# Define evaluation metrics
metrics = [
    "coherence",
    "groundedness",
    "tool_call_valid",       # Checks if tool calls match expected
    "trajectory_exact_match", # Full trajectory must match
]

eval_task = EvalTask(
    dataset=eval_dataset,
    metrics=metrics,
    experiment="agent-eval-v1",
)

# Run evaluation against the deployed agent
eval_result = eval_task.evaluate(
    model=GenerativeModel("gemini-1.5-pro-002"),
)

print(eval_result.summary_metrics)
# Output: {'coherence/mean': 4.2, 'groundedness/mean': 0.91, ...}
eval_result.metrics_table.to_csv("eval_results.csv", index=False)`}),e.jsx(s,{name:"Hybrid Playbook + Flow Agent",category:"Agent Architecture",whenToUse:"When you need flexibility for open-ended queries but deterministic control for compliance-critical paths — e.g., a support agent where most questions are handled by a Playbook but account deletion follows a mandatory script.",children:e.jsx("p",{children:"Design the top-level agent as a Playbook that routes to either sub-Playbooks or Flows based on intent. The Playbook handles free-form queries with LLM reasoning, while critical regulated actions (e.g., cancellations, PII collection) use Flows with explicit page transitions and fulfillments. This gives you the best of both: natural conversation for most paths, and ironclad auditability where it matters."})}),e.jsx(i,{title:"Data Store Chunking Strategy",children:e.jsxs("p",{children:["Agent Builder's default chunking (512 tokens with 50-token overlap) works for most documents. For technical documentation with code blocks, override the chunk size to 1024 tokens to avoid splitting examples. For FAQ documents, consider structured import with one chunk per Q&A pair — use the custom JSON schema import format with explicit ",e.jsx("code",{children:"id"}),", ",e.jsx("code",{children:"content"}),", and ",e.jsx("code",{children:"metadata"}),"fields to give the retriever cleaner signal."]})}),e.jsx(o,{type:"tip",title:"Dialogflow Messenger for Quick Deployment",children:e.jsx("p",{children:"Agent Builder includes Dialogflow Messenger — a pre-built web chat widget that can be embedded with two lines of HTML. It handles session management, rich responses (cards, chips, carousels), and supports custom CSS theming. For production deployments, combine it with Identity Platform for authenticated sessions and Cloud Armor for DDoS protection on the underlying API endpoint."})})]})}const z=Object.freeze(Object.defineProperty({__proto__:null,default:y},Symbol.toStringTag,{value:"Module"}));function _(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Google Agent Development Kit (ADK)"}),e.jsx("p",{children:"Google's Agent Development Kit (ADK) is an open-source Python framework for building multi-agent systems on top of Gemini. Unlike Agent Builder (which is a managed, no-code-first platform), ADK is a code-first framework that gives developers full control over agent logic, composition patterns, and deployment. It ships with a set of composable agent types, built-in tools, a local dev server, and a managed runtime called Agent Engine for production deployment on Vertex AI."}),e.jsx(a,{title:"ADK Agent Hierarchy and Execution",width:720,height:320,nodes:[{id:"runner",label:"Runner",type:"agent",x:80,y:160},{id:"session",label:`Session /
Artifacts`,type:"store",x:220,y:260},{id:"root",label:`Root Agent
(LlmAgent)`,type:"agent",x:220,y:120},{id:"subA",label:`Sequential
Agent`,type:"agent",x:400,y:60},{id:"subB",label:`Parallel
Agent`,type:"agent",x:400,y:160},{id:"subC",label:`Loop
Agent`,type:"agent",x:400,y:260},{id:"llm",label:`Gemini
LLM`,type:"llm",x:580,y:100},{id:"tools",label:`Tools
(search, code)`,type:"tool",x:580,y:220}],edges:[{from:"runner",to:"root",label:"invoke"},{from:"runner",to:"session"},{from:"root",to:"subA"},{from:"root",to:"subB"},{from:"root",to:"subC"},{from:"subA",to:"llm"},{from:"subB",to:"tools"},{from:"subC",to:"llm"}]}),e.jsx("h2",{children:"Core Concepts"}),e.jsx(n,{term:"Agent Types",children:e.jsxs("p",{children:["ADK provides four composable agent types. ",e.jsx("strong",{children:"LlmAgent"})," is the standard LLM-driven agent — given a model, system prompt, and tools, it reasons and acts in a ReAct loop until done. ",e.jsx("strong",{children:"SequentialAgent"})," runs a list of sub-agents in order, passing outputs through as context — ideal for pipelines (e.g., research → outline → draft → review). ",e.jsx("strong",{children:"ParallelAgent"})," runs sub-agents concurrently and merges their outputs — ideal for fan-out tasks (e.g., search multiple sources simultaneously). ",e.jsx("strong",{children:"LoopAgent"})," repeatedly runs a sub-agent until a termination condition is met — ideal for iterative refinement or polling."]})}),e.jsx(n,{term:"Runner and Session",children:e.jsxs("p",{children:["The ",e.jsx("strong",{children:"Runner"})," is the execution engine: it takes an agent and a session, invokes the agent with a user message, and returns an async generator of events (LLM calls, tool calls, responses). The ",e.jsx("strong",{children:"Session"})," stores conversation history and state between turns. ADK supports in-memory sessions for development and Vertex AI-backed persistent sessions for production. ",e.jsx("strong",{children:"Artifacts"})," are binary outputs (images, files, audio) that agents can produce and attach to sessions."]})}),e.jsx("h2",{children:"Building a Basic LlmAgent"}),e.jsx(r,{title:"LlmAgent with Tools",tabs:{python:`from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool, google_search, code_execution
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
import asyncio

# 1. Define custom tools as plain Python functions
def get_stock_price(ticker: str) -> dict:
    """Get current stock price for a ticker symbol.

    Args:
        ticker: Stock ticker symbol (e.g., 'GOOGL', 'MSFT')

    Returns:
        dict with price, change, and market_cap fields
    """
    # In production, call a real financial API
    mock_prices = {"GOOGL": 175.42, "MSFT": 420.10, "AAPL": 228.87}
    price = mock_prices.get(ticker.upper(), 100.0)
    return {
        "ticker": ticker.upper(),
        "price": price,
        "change_pct": 1.2,
        "market_cap_billions": price * 6.5,
    }

def calculate_portfolio_value(holdings: list[dict]) -> dict:
    """Calculate total portfolio value given a list of holdings.

    Args:
        holdings: List of dicts with 'ticker' and 'shares' keys

    Returns:
        dict with total_value and breakdown
    """
    total = 0.0
    breakdown = []
    for h in holdings:
        info = get_stock_price(h["ticker"])
        value = info["price"] * h["shares"]
        total += value
        breakdown.append({"ticker": h["ticker"], "shares": h["shares"], "value": value})
    return {"total_value": total, "breakdown": breakdown}

# 2. Create the agent
agent = LlmAgent(
    name="financial_analyst",
    model="gemini-2.0-flash-001",
    description="A financial analyst that can research stocks and analyze portfolios.",
    instruction="""You are a professional financial analyst. When asked about stocks or
    portfolios, always use the available tools to get current data. Present numbers
    with 2 decimal places and include % change. Be concise and factual.""",
    tools=[
        FunctionTool(get_stock_price),
        FunctionTool(calculate_portfolio_value),
        google_search,          # Built-in Google Search tool
        code_execution,         # Built-in Python code execution sandbox
    ],
)

# 3. Set up session and runner
session_service = InMemorySessionService()
runner = Runner(agent=agent, session_service=session_service, app_name="finance_app")

# 4. Async invocation (ADK is async-first)
async def main():
    session = await session_service.create_session(
        app_name="finance_app",
        user_id="user_123",
    )

    async for event in runner.run_async(
        user_id="user_123",
        session_id=session.id,
        new_message="What is my portfolio worth if I have 10 GOOGL and 5 MSFT shares?",
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)
        elif event.get_function_calls():
            for call in event.get_function_calls():
                print(f"  [Tool call] {call.name}({dict(call.args)})")

asyncio.run(main())`}}),e.jsx("h2",{children:"Agent Composition Patterns"}),e.jsx("h3",{children:"Sequential Pipeline"}),e.jsx(t,{language:"python",filename:"adk_sequential.py",children:`from google.adk.agents import LlmAgent, SequentialAgent

# Define specialized agents for each pipeline stage
researcher = LlmAgent(
    name="researcher",
    model="gemini-2.0-flash-001",
    instruction="Research the given topic. Output a bullet-point list of key facts.",
    tools=[google_search],
)

outliner = LlmAgent(
    name="outliner",
    model="gemini-2.0-flash-001",
    instruction="""Given the research notes in context, create a structured outline
    for a technical blog post. Include H2 sections and key points for each.""",
)

writer = LlmAgent(
    name="writer",
    model="gemini-1.5-pro-002",  # Use Pro for higher quality writing
    instruction="""Given the outline in context, write a complete, engaging technical
    blog post. Use concrete examples and code snippets where appropriate.""",
)

editor = LlmAgent(
    name="editor",
    model="gemini-2.0-flash-001",
    instruction="""Review the draft and improve: fix grammar, enhance clarity,
    ensure technical accuracy, and add a compelling introduction.""",
)

# SequentialAgent passes outputs as context to subsequent agents
content_pipeline = SequentialAgent(
    name="content_pipeline",
    sub_agents=[researcher, outliner, writer, editor],
)

# Each agent sees all previous outputs in its context window`}),e.jsx("h3",{children:"Parallel Fan-Out"}),e.jsx(t,{language:"python",filename:"adk_parallel.py",children:`from google.adk.agents import LlmAgent, ParallelAgent

# Three specialized research agents running simultaneously
tech_researcher = LlmAgent(
    name="tech_researcher",
    model="gemini-2.0-flash-001",
    instruction="Research technical implementation details and architecture.",
    tools=[google_search],
)

market_researcher = LlmAgent(
    name="market_researcher",
    model="gemini-2.0-flash-001",
    instruction="Research market trends, adoption, and competitive landscape.",
    tools=[google_search],
)

risk_analyst = LlmAgent(
    name="risk_analyst",
    model="gemini-2.0-flash-001",
    instruction="Identify risks, limitations, and failure modes.",
)

# ParallelAgent runs all sub-agents concurrently
# All outputs are merged and available to subsequent agents
parallel_research = ParallelAgent(
    name="parallel_research",
    sub_agents=[tech_researcher, market_researcher, risk_analyst],
)

# Combine with a synthesizer in a sequential pipeline
synthesizer = LlmAgent(
    name="synthesizer",
    model="gemini-1.5-pro-002",
    instruction="Synthesize the parallel research findings into a unified report.",
)

from google.adk.agents import SequentialAgent
full_pipeline = SequentialAgent(
    name="research_pipeline",
    sub_agents=[parallel_research, synthesizer],
)`}),e.jsx("h3",{children:"Loop Agent with Termination Condition"}),e.jsx(t,{language:"python",filename:"adk_loop.py",children:`from google.adk.agents import LlmAgent, LoopAgent

# Agent that improves code iteratively
code_reviewer = LlmAgent(
    name="code_reviewer",
    model="gemini-2.0-flash-001",
    tools=[code_execution],
    instruction="""Review the code in context. If there are issues, fix them and
    output the improved code. If the code is correct and all tests pass, output
    exactly: DONE
    Always run the code to verify it works before saying DONE.""",
)

# LoopAgent repeats until the sub-agent outputs the termination signal
# or until max_iterations is reached
iterative_coder = LoopAgent(
    name="iterative_coder",
    sub_agent=code_reviewer,
    max_iterations=5,
    # Stop condition: sub-agent output contains "DONE"
    stop_condition=lambda event: (
        event.is_final_response() and
        "DONE" in (event.content.parts[0].text if event.content.parts else "")
    ),
)`}),e.jsx("h2",{children:"Deploying to Agent Engine"}),e.jsx("p",{children:"Agent Engine is Vertex AI's managed runtime for ADK agents. It handles scaling, session persistence, logging, monitoring, and model routing — you deploy an agent as a managed resource and call it via REST API or SDK."}),e.jsx(t,{language:"python",filename:"adk_agent_engine.py",children:`import vertexai
from vertexai.preview import reasoning_engines

vertexai.init(project="my-gcp-project", location="us-central1",
              staging_bucket="gs://my-staging-bucket")

# Wrap ADK agent for Agent Engine deployment
class MyAgentApp:
    """Wrapper class for Agent Engine deployment."""

    def set_up(self):
        """Called once at container startup."""
        from google.adk.agents import LlmAgent
        from google.adk.tools import google_search, FunctionTool
        from google.adk.runners import Runner
        from google.adk.sessions import InMemorySessionService

        self.agent = LlmAgent(
            name="production_agent",
            model="gemini-2.0-flash-001",
            instruction="You are a helpful assistant with web search capabilities.",
            tools=[google_search],
        )
        self.session_service = InMemorySessionService()
        self.runner = Runner(
            agent=self.agent,
            session_service=self.session_service,
            app_name="production_agent",
        )

    def query(self, user_id: str, session_id: str, message: str) -> str:
        """Synchronous wrapper for Agent Engine."""
        import asyncio

        async def _run():
            result = ""
            async for event in self.runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=message,
            ):
                if event.is_final_response() and event.content.parts:
                    result = event.content.parts[0].text
            return result

        return asyncio.get_event_loop().run_until_complete(_run())

# Deploy to Agent Engine
remote_agent = reasoning_engines.ReasoningEngine.create(
    MyAgentApp(),
    requirements=["google-adk>=0.1.0", "google-cloud-aiplatform"],
    display_name="Production ADK Agent",
    description="ADK agent with Google Search",
)

print(f"Deployed agent resource name: {remote_agent.resource_name}")

# Query the deployed agent
result = remote_agent.query(
    user_id="user_123",
    session_id="session_456",
    message="What are the latest developments in AI agents?",
)
print(result)`}),e.jsx("h2",{children:"Evaluation with ADK Eval Framework"}),e.jsx(t,{language:"python",filename:"adk_eval.py",children:`from google.adk.evaluation import AgentEvaluator, EvalDataset

# Define evaluation dataset
eval_dataset = EvalDataset(
    cases=[
        {
            "query": "What is the capital of France?",
            "expected_response": "Paris",
            "expected_tool_calls": [],  # Should not need tools
        },
        {
            "query": "What is the current price of GOOGL stock?",
            "expected_response": None,  # Dynamic — just check tool was called
            "expected_tool_calls": ["get_stock_price"],
        },
        {
            "query": "Search for recent news about AI agents",
            "expected_response": None,
            "expected_tool_calls": ["google_search"],
        },
    ]
)

evaluator = AgentEvaluator(
    agent=agent,
    session_service=session_service,
    metrics=["tool_call_accuracy", "response_groundedness", "latency_p50"],
)

results = evaluator.evaluate(eval_dataset)
print(results.summary())
# tool_call_accuracy: 0.95
# response_groundedness: 0.88
# latency_p50_ms: 1240`}),e.jsx(s,{name:"Root Agent with Specialist Sub-Agents",category:"Multi-Agent",whenToUse:"When you have a broad-scope application where different query types require fundamentally different capabilities — e.g., a company assistant that handles HR queries, IT support, finance questions, and project management separately.",children:e.jsx("p",{children:"Build a root LlmAgent whose only job is classification and routing. It receives the user query, identifies the domain, and delegates to a specialist LlmAgent (which may itself use Sequential or Parallel sub-agents). The root agent's instruction should focus entirely on routing criteria — avoid giving it domain-specific knowledge that belongs in the specialist agents."})}),e.jsx(i,{title:"Tool Function Design",children:e.jsxs("p",{children:["ADK uses function signatures and docstrings to generate tool schemas automatically. Write comprehensive docstrings with Args and Returns sections — these become the tool descriptions that guide the LLM's tool selection. Use specific type hints (e.g., ",e.jsx("code",{children:"list[dict]"})," rather than ",e.jsx("code",{children:"Any"}),") so the LLM knows exactly what input to construct. Keep tools narrowly scoped: one function per external operation, with no side-effects buried in helper calls."]})}),e.jsx(o,{type:"tip",title:"Local Development Server",children:e.jsxs("p",{children:["ADK ships with ",e.jsx("code",{children:"adk web"})," — a local dev server that provides a web UI for testing your agents interactively. Run ",e.jsx("code",{children:"adk web ."})," from your project directory to start a chat interface, trace tool calls, inspect session state, and replay conversations. This is dramatically faster than deploying to Agent Engine for each iteration during development."]})})]})}const L=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"}));function v(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Vertex AI Model Garden"}),e.jsx("p",{children:"Vertex AI Model Garden is Google Cloud's curated catalog of foundation models — first-party (Gemini, Gemma), third-party (Llama, Mistral, Claude, Falcon), and open-source models. Each model can be deployed to a managed Vertex AI endpoint, fine-tuned with your data, and integrated into Vertex AI Pipelines for MLOps. Model Garden eliminates the infrastructure work of serving large models: you get autoscaling, load balancing, monitoring, and logging out of the box."}),e.jsx(a,{title:"Vertex AI Model Garden Deployment Flow",width:700,height:280,nodes:[{id:"garden",label:`Model Garden
Catalog`,type:"store",x:80,y:140},{id:"registry",label:`Vertex AI
Model Registry`,type:"store",x:260,y:140},{id:"finetune",label:`Fine-Tuning
Job`,type:"agent",x:260,y:240},{id:"endpoint",label:`Managed
Endpoint`,type:"agent",x:450,y:140},{id:"serverless",label:`Serverless
Endpoint`,type:"agent",x:450,y:240},{id:"app",label:"Application",type:"external",x:620,y:190}],edges:[{from:"garden",to:"registry",label:"deploy"},{from:"garden",to:"finetune",label:"fine-tune"},{from:"finetune",to:"registry",label:"register"},{from:"registry",to:"endpoint",label:"dedicated"},{from:"registry",to:"serverless",label:"serverless"},{from:"endpoint",to:"app"},{from:"serverless",to:"app"}]}),e.jsx("h2",{children:"Available Models"}),e.jsx(n,{term:"First-Party and Partner Models",children:e.jsxs("p",{children:["Model Garden includes Google's own ",e.jsx("strong",{children:"Gemma 2"})," family (2B, 9B, 27B parameter open weights), which are optimized for on-device and on-premises deployment with commercial use licenses. From Meta, ",e.jsx("strong",{children:"Llama 3.1"})," (8B, 70B, 405B) and ",e.jsx("strong",{children:"Llama 3.2"})," (1B, 3B, 11B multimodal, 90B multimodal) are available.",e.jsx("strong",{children:"Mistral Large 2"})," and ",e.jsx("strong",{children:"Mistral Nemo"})," (12B, Apache 2.0 licensed) provide strong European-origin multilingual capabilities. Anthropic's"," ",e.jsx("strong",{children:"Claude 3.5 Sonnet"})," and ",e.jsx("strong",{children:"Claude 3 Haiku"})," are available as managed third-party models. ",e.jsx("strong",{children:"CodeLlama"})," (7B, 13B, 34B) and"," ",e.jsx("strong",{children:"Falcon 180B"})," round out the catalog for specialized use cases."]})}),e.jsx("h2",{children:"Deployment Options"}),e.jsx("h3",{children:"Dedicated Endpoints"}),e.jsx("p",{children:"Dedicated endpoints provision exclusive compute (A100 or H100 GPUs) for your model. You control the machine type, accelerator count, min/max replicas, and autoscaling policy. Dedicated endpoints guarantee throughput and are billed by uptime regardless of usage — ideal for high-volume, latency-sensitive production workloads."}),e.jsx("h3",{children:"Serverless (On-Demand) Endpoints"}),e.jsx("p",{children:"Serverless endpoints share compute infrastructure across customers. You pay per token with no uptime commitment — there is no idle cost. Cold starts add 5–30 seconds of latency for the first request after inactivity. Serverless is the right choice for development, testing, low-volume production, and batch processing workloads."}),e.jsx(r,{title:"Deploying and Calling a Model from Model Garden",tabs:{python:`import vertexai
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
print(response.predictions[0])`}}),e.jsx("h2",{children:"Fine-Tuning on Vertex AI"}),e.jsx("h3",{children:"Supervised Fine-Tuning (SFT)"}),e.jsx("p",{children:"Supervised fine-tuning adapts a model to a specific task or domain using labeled examples in JSONL format. Vertex AI manages the training infrastructure, handles checkpointing, and registers the fine-tuned model in your model registry."}),e.jsx(t,{language:"python",filename:"vertex_sft.py",children:`from vertexai.preview.tuning import sft
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
print(response.text)`}),e.jsx("h3",{children:"LoRA Fine-Tuning for Open Models"}),e.jsx(t,{language:"python",filename:"vertex_lora.py",children:`# LoRA fine-tuning for open models (Llama, Mistral, Gemma) via Vertex AI custom training
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
print(f"Training job: {job.resource_name}")`}),e.jsx("h2",{children:"Model Evaluation"}),e.jsx(t,{language:"python",filename:"vertex_model_eval.py",children:`from vertexai.preview.evaluation import EvalTask
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
print("Fine-tuned:", ft_results.summary_metrics)`}),e.jsx("h2",{children:"Pricing Comparison"}),e.jsx(t,{language:"text",filename:"pricing_comparison.txt",children:`Deployment Mode | Model           | Input ($/1M tokens) | Output ($/1M tokens) | Notes
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
Use serverless for dev/test and low-volume. Use dedicated for >1M tokens/day or strict SLA.`}),e.jsx(s,{name:"Model Garden for Private Model Deployment",category:"MLOps",whenToUse:"When regulations prohibit sending data to third-party model APIs (e.g., PHI in healthcare, classified government data) but you need LLM capabilities — deploy an open model like Llama 3.1 or Gemma 2 to a dedicated endpoint in your VPC.",children:e.jsx("p",{children:"Deploy to a Vertex AI endpoint inside a VPC Service Control perimeter to ensure no data leaves your GCP organization boundary. Use private IP endpoints and VPC-SC policies to prevent exfiltration. Combine with CMEK encryption for the model artifacts. This approach gives you full LLM capability within a compliance boundary that third-party APIs (OpenAI, Anthropic direct) cannot match."})}),e.jsx(i,{title:"Vertex AI Pipelines for MLOps",children:e.jsx("p",{children:"Use Vertex AI Pipelines (Kubeflow Pipelines v2) to automate the full model lifecycle: data preprocessing → fine-tuning → evaluation → conditional deployment (only promote if eval metrics exceed threshold). Store pipeline artifacts in Vertex AI Artifact Registry for lineage tracking. Schedule pipelines on a cron trigger to continuously fine-tune on new data. This gives you reproducible, auditable model improvement cycles without manual intervention."})}),e.jsx(o,{type:"warning",title:"Model License Compliance",children:e.jsx("p",{children:"Llama models require accepting Meta's Community License Agreement before deployment — this is enforced in the Model Garden UI. Llama 3.1 allows commercial use for most companies but has restrictions for products with over 700M monthly active users. Gemma 2 uses a permissive license that allows commercial use, modification, and distribution. Always verify the specific model's license before deploying to production."})})]})}const R=Object.freeze(Object.defineProperty({__proto__:null,default:v},Symbol.toStringTag,{value:"Module"}));function x(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Choosing Cloud Models: A Decision Framework"}),e.jsx("p",{children:"Picking the right managed model is not just about benchmark scores — it is an engineering decision that spans cost, latency, compliance, context window requirements, multimodal capability, and operational maturity. This section provides a structured framework for evaluating Azure OpenAI, Amazon Bedrock, and Vertex AI models against your specific workload requirements."}),e.jsx("h2",{children:"Comparison Matrix"}),e.jsx(t,{language:"text",filename:"model_comparison_matrix.txt",children:`DIMENSION              | Azure OpenAI GPT-4o     | Bedrock Claude 3.5 Sonnet | Vertex Gemini 1.5 Pro
-----------------------|-------------------------|---------------------------|----------------------
Model version          | gpt-4o (2024-11-20)     | claude-3-5-sonnet-20241022| gemini-1.5-pro-002
Input cost / 1M tokens | $2.50                   | $3.00                     | $1.25 (≤128K ctx)
Output cost / 1M tokens| $10.00                  | $15.00                    | $5.00 (≤128K ctx)
Context window         | 128K tokens             | 200K tokens               | 1,000K tokens (1M)
Max output tokens      | 16,384                  | 8,192                     | 8,192
Multimodal (image)     | Yes                     | Yes                       | Yes
Multimodal (video)     | No                      | No                        | Yes (1 hour)
Multimodal (audio)     | Yes (Whisper + TTS)     | No                        | Yes
Multimodal (PDF native)| No (extract text first) | No (extract text first)   | Yes (native)
Function / tool use    | Yes (parallel)          | Yes (parallel)            | Yes (parallel)
JSON mode              | Yes (response_format)   | Yes (tool_choice forced)  | Yes (mime_type)
Structured outputs     | Yes (JSON Schema strict)| Yes (via tool)            | Yes (response schema)
Streaming              | Yes (SSE)               | Yes (SSE)                 | Yes (SSE)
Batch API              | Yes (async batch)       | Yes (Batch Inference)     | Yes (batch prediction)
Fine-tuning            | Yes (GPT-4o mini only)  | No (prompt engineering)   | Yes (SFT + LoRA)
Embeddings             | Yes (text-embedding-3)  | Yes (Titan Embed, Cohere) | Yes (text-embedding-004)
Data residency         | 17 Azure regions        | 15 AWS regions            | 10 GCP regions
EU data residency      | Yes (EU regions)        | Yes (EU regions)          | Yes (europe-west)
HIPAA eligible         | Yes (BAA available)     | Yes (HIPAA workloads)     | Yes (BAA available)
SOC 2 Type II          | Yes                     | Yes                       | Yes
FedRAMP                | Yes (Gov cloud)         | Yes (GovCloud)            | Yes (Assured Workloads)
PCI DSS                | Yes                     | Yes                       | Yes
VPC / Private endpoint | Yes (Private Endpoints) | Yes (VPC endpoints)       | Yes (VPC-SC + PSC)
CMEK encryption        | Yes                     | Yes (KMS)                 | Yes (CMEK)
Uptime SLA             | 99.9%                   | 99.9%                     | 99.9%
Rate limits (default)  | 30K TPM (adjustable)    | 80K TPM per account       | 60K TPM (adjustable)
Provisioned throughput | Yes (PTU - fixed tokens)| Yes (reserved capacity)   | Yes (committed use)
On-demand pricing      | Yes                     | Yes                       | Yes
Grounding / web search | No (use Bing plugin)    | No (use agents)           | Yes (native)
Code interpreter       | Yes (Assistants API)    | No (use tool)             | Yes (code execution)`}),e.jsx("h2",{children:"Decision Flowchart"}),e.jsx(a,{title:"Model Selection Decision Flow",width:720,height:360,nodes:[{id:"start",label:`Workload
Requirement`,type:"external",x:80,y:180},{id:"regulated",label:`Regulated
Industry?`,type:"agent",x:220,y:180},{id:"azure_hipaa",label:`Azure OpenAI
(HIPAA/FedRAMP)`,type:"llm",x:400,y:80},{id:"bedrock_hipaa",label:`Bedrock Claude
(AWS-native infra)`,type:"llm",x:400,y:160},{id:"cost",label:`Cost
Sensitive?`,type:"agent",x:400,y:260},{id:"gemini_flash",label:`Gemini 2.0 Flash
or Llama 3.1 8B`,type:"llm",x:580,y:200},{id:"task",label:`Task
Type?`,type:"agent",x:580,y:300},{id:"coding",label:`Claude 3.5 Sonnet
(Bedrock)`,type:"llm",x:720,y:200},{id:"longctx",label:`Gemini 1.5 Pro
(Vertex)`,type:"llm",x:720,y:300}],edges:[{from:"start",to:"regulated"},{from:"regulated",to:"azure_hipaa",label:"Yes + Azure"},{from:"regulated",to:"bedrock_hipaa",label:"Yes + AWS"},{from:"regulated",to:"cost",label:"No"},{from:"cost",to:"gemini_flash",label:"Yes"},{from:"cost",to:"task",label:"No"},{from:"task",to:"coding",label:"Coding/Analysis"},{from:"task",to:"longctx",label:"Long Context/Video"}]}),e.jsx("h2",{children:"Decision Logic by Use Case"}),e.jsx(n,{term:"Regulated Industry Workloads",children:e.jsx("p",{children:"For HIPAA, FedRAMP, PCI DSS, or GDPR-regulated workloads, the cloud choice is often determined by where your existing compliance infrastructure lives. If your data is in Azure and you have an existing Azure BAA, use Azure OpenAI — data stays within the same compliance boundary. If your workload runs in AWS and you use AWS GovCloud or have AWS HIPAA-eligible architecture, Bedrock eliminates the need for an additional compliance vendor assessment. Vertex AI with VPC Service Controls provides the strongest data exfiltration prevention, making it preferred for scenarios requiring tight organizational policy enforcement."})}),e.jsx(n,{term:"Cost-Sensitive Workloads",children:e.jsx("p",{children:"For high-volume, cost-sensitive workloads, Gemini 2.0 Flash at $0.075/$0.30 per million input/output tokens is the most economical managed option for general tasks. For even lower cost, deploy Llama 3.1 8B via a serverless endpoint on Model Garden ($0.20/$0.20) or Bedrock ($0.30/$0.60 for Llama 3.1 8B Instruct). The break-even point where provisioned throughput (PTU on Azure, reserved capacity on Bedrock) beats on-demand pricing is approximately 40–60% utilization of your provisioned throughput block — below that, on-demand is cheaper."})}),e.jsx("h2",{children:"Pricing Models Deep Dive"}),e.jsx(t,{language:"python",filename:"pricing_calculator.py",children:`# Cost estimation for different deployment configurations
from dataclasses import dataclass

@dataclass
class ModelPricing:
    name: str
    input_per_million: float
    output_per_million: float
    context_window: int

models = {
    "azure_gpt4o": ModelPricing("Azure GPT-4o", 2.50, 10.00, 128_000),
    "azure_gpt4o_mini": ModelPricing("Azure GPT-4o Mini", 0.15, 0.60, 128_000),
    "bedrock_claude35_sonnet": ModelPricing("Bedrock Claude 3.5 Sonnet", 3.00, 15.00, 200_000),
    "bedrock_claude3_haiku": ModelPricing("Bedrock Claude 3 Haiku", 0.25, 1.25, 200_000),
    "vertex_gemini15_pro": ModelPricing("Vertex Gemini 1.5 Pro", 1.25, 5.00, 1_000_000),
    "vertex_gemini20_flash": ModelPricing("Vertex Gemini 2.0 Flash", 0.075, 0.30, 1_048_576),
    "vertex_llama31_8b": ModelPricing("Vertex Llama 3.1 8B (serverless)", 0.20, 0.20, 128_000),
}

def estimate_monthly_cost(
    model_key: str,
    daily_requests: int,
    avg_input_tokens: int,
    avg_output_tokens: int,
) -> dict:
    model = models[model_key]
    monthly_input = daily_requests * 30 * avg_input_tokens / 1_000_000
    monthly_output = daily_requests * 30 * avg_output_tokens / 1_000_000
    input_cost = monthly_input * model.input_per_million
    output_cost = monthly_output * model.output_per_million
    total = input_cost + output_cost
    return {
        "model": model.name,
        "monthly_input_cost": f"\${input_cost:.2f}",
        "monthly_output_cost": f"\${output_cost:.2f}",
        "total_monthly": f"\${total:.2f}",
        "cost_per_request": f"\${total / (daily_requests * 30):.4f}",
    }

# Example: RAG chatbot with 5K requests/day, 2K input / 500 output tokens
for key in models:
    result = estimate_monthly_cost(key, 5000, 2000, 500)
    print(f"{result['model']}: {result['total_monthly']}/mo ({result['cost_per_request']}/req}")

# Output comparison:
# Azure GPT-4o:             $3,200/mo ($0.0213/req)
# Azure GPT-4o Mini:        $195/mo   ($0.0013/req)
# Bedrock Claude 3.5 Sonnet:$4,063/mo ($0.0271/req)
# Bedrock Claude 3 Haiku:   $338/mo   ($0.0023/req)
# Vertex Gemini 1.5 Pro:    $1,575/mo ($0.0105/req)
# Vertex Gemini 2.0 Flash:  $203/mo   ($0.0014/req)
# Vertex Llama 3.1 8B:      $723/mo   ($0.0048/req)`}),e.jsx("h2",{children:"Context Window Optimization"}),e.jsx(r,{title:"Context Window Strategies",tabs:{python:`# Strategy 1: Dynamic context selection based on query complexity
import tiktoken  # For token counting (works for OpenAI models)
# For Gemini: use vertexai GenerativeModel.count_tokens()

def adaptive_context_strategy(
    query: str,
    documents: list[str],
    model: str = "gemini-1.5-pro",
) -> list[str]:
    """Select documents to include based on available context window."""
    context_limits = {
        "gpt-4o": 128_000,
        "claude-3-5-sonnet": 200_000,
        "gemini-1.5-pro": 1_000_000,
        "gemini-2.0-flash": 1_048_576,
    }
    limit = context_limits.get(model, 128_000)
    # Reserve 20% for output and system prompt
    available = int(limit * 0.75)

    selected = []
    total_tokens = len(query.split()) * 1.3  # Rough estimate

    for doc in sorted(documents, key=lambda d: relevance_score(query, d), reverse=True):
        doc_tokens = len(doc.split()) * 1.3
        if total_tokens + doc_tokens <= available:
            selected.append(doc)
            total_tokens += doc_tokens
        else:
            # For Gemini 1.5 Pro with 1M context, we can fit much more
            if model.startswith("gemini") and len(selected) < 50:
                continue  # Try more docs
            break

    return selected

# Strategy 2: Sliding window for very long documents
def sliding_window_chunks(text: str, window_size: int = 50_000, overlap: int = 5_000):
    """Split text into overlapping chunks for models with smaller context windows."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + window_size, len(words))
        chunks.append(" ".join(words[start:end]))
        start += window_size - overlap
    return chunks

# Strategy 3: For Gemini 1.5 Pro — just pass everything
def gemini_full_context(documents: list[str], query: str) -> str:
    import vertexai
    from vertexai.generative_models import GenerativeModel

    vertexai.init(project="my-project", location="us-central1")
    model = GenerativeModel("gemini-1.5-pro-002")

    # Count tokens first
    full_context = "\\n\\n---\\n\\n".join(documents)
    token_count = model.count_tokens(full_context)
    print(f"Total tokens: {token_count.total_tokens}")

    if token_count.total_tokens > 900_000:
        print("Warning: approaching 1M limit, truncating oldest documents")
        documents = documents[-int(len(documents) * 0.8):]
        full_context = "\\n\\n---\\n\\n".join(documents)

    response = model.generate_content(f"{full_context}\\n\\nQuery: {query}")
    return response.text`}}),e.jsx(s,{name:"Tiered Model Strategy",category:"Cost Optimization",whenToUse:"When your application handles queries of varying complexity — route simple queries to fast, cheap models and complex reasoning tasks to premium models to minimize cost while maintaining quality.",children:e.jsx("p",{children:"Implement a classifier (can be a cheap model like Gemini 2.0 Flash or even a keyword heuristic) that routes queries to different tiers: Tier 1 (simple lookups, FAQ) → Gemini Flash or Claude Haiku; Tier 2 (analysis, summarization) → GPT-4o Mini or Gemini 1.5 Flash; Tier 3 (complex reasoning, code generation) → GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5 Pro. Typical savings of 60–80% vs. always using the premium model."})}),e.jsx(i,{title:"Provisioned Throughput vs. On-Demand",children:e.jsx("p",{children:"Azure PTU (Provisioned Throughput Units) reserves model capacity for a fixed monthly price. One PTU for GPT-4o handles approximately 2,500 TPM. At list price, PTUs break even vs. on-demand at roughly 45% utilization. Before committing to PTUs, run on-demand for 2–4 weeks to measure actual utilization patterns. Use Azure Monitor to track PTU utilization and set up alerts if it drops below 30% (signal to downsize) or spikes above 90% (signal to add capacity or enable on-demand overflow)."})}),e.jsx(o,{type:"tip",title:"Model Version Pinning",children:e.jsxs("p",{children:["Always pin to specific model versions in production (e.g., ",e.jsx("code",{children:"gpt-4o-2024-11-20"}),",",e.jsx("code",{children:"claude-3-5-sonnet-20241022"}),", ",e.jsx("code",{children:"gemini-1.5-pro-002"}),") rather than floating aliases like ",e.jsx("code",{children:"gpt-4o-latest"}),". Cloud providers silently update model aliases, which can change output format, reasoning patterns, and benchmark performance. Pin versions, run your eval suite before upgrading, and use blue/green deployment for model version rollouts."]})}),e.jsx(o,{type:"warning",title:"Cross-Region Failover and Data Residency Conflicts",children:e.jsx("p",{children:`Automatic cross-region failover (e.g., Azure OpenAI's "global" deployment tier) may violate data residency requirements by routing requests to a different geographic region during outages. For GDPR or data sovereignty requirements, always use regional deployments and handle failover at the application layer — fail to a second deployment in the same region or a different cloud provider in the same jurisdiction, not across borders.`})})]})}const G=Object.freeze(Object.defineProperty({__proto__:null,default:x},Symbol.toStringTag,{value:"Module"}));function b(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Multi-Cloud Agent Architecture"}),e.jsx("p",{children:"Building agents that work across Azure, AWS, and GCP requires an abstraction layer that normalizes the differences in authentication, request format, streaming protocols, and error handling across providers. LiteLLM is the de facto standard for this — it provides a unified OpenAI-compatible interface to 100+ LLM providers, handles provider-specific quirks internally, and adds production capabilities like cost tracking, rate limit handling, fallback routing, and load balancing."}),e.jsx(a,{title:"LiteLLM Proxy: Multi-Cloud Request Flow",width:740,height:320,nodes:[{id:"client",label:"Agent / App",type:"external",x:70,y:160},{id:"proxy",label:`LiteLLM Proxy
(Router)`,type:"agent",x:240,y:160},{id:"lb",label:`Load Balancer
/ Fallback`,type:"agent",x:240,y:280},{id:"azure",label:`Azure OpenAI
GPT-4o`,type:"llm",x:450,y:80},{id:"bedrock",label:`AWS Bedrock
Claude 3.5`,type:"llm",x:450,y:180},{id:"vertex",label:`Vertex AI
Gemini Flash`,type:"llm",x:450,y:280},{id:"tracker",label:`Cost Tracker
/ Logging`,type:"store",x:620,y:160}],edges:[{from:"client",to:"proxy",label:"OpenAI format"},{from:"proxy",to:"lb"},{from:"proxy",to:"azure",label:"primary"},{from:"lb",to:"bedrock",label:"fallback 1"},{from:"lb",to:"vertex",label:"fallback 2"},{from:"azure",to:"tracker"},{from:"bedrock",to:"tracker"},{from:"vertex",to:"tracker"}]}),e.jsx("h2",{children:"LiteLLM: Direct SDK Usage"}),e.jsx(n,{term:"LiteLLM Provider Prefixes",children:e.jsxs("p",{children:["LiteLLM uses a simple prefix convention to route to different providers. Prefixless or ",e.jsx("code",{children:"openai/"})," prefixed models go to OpenAI directly. ",e.jsx("code",{children:"azure/"}),"routes to Azure OpenAI using the configured deployment name. ",e.jsx("code",{children:"bedrock/"}),"routes to AWS Bedrock using boto3 credentials. ",e.jsx("code",{children:"vertex_ai/"})," routes to Vertex AI using GCP Application Default Credentials. ",e.jsx("code",{children:"ollama/"})," routes to a local Ollama instance. The model string after the prefix is the provider-specific model identifier — no code change is needed to switch providers, only the model string."]})}),e.jsx(r,{title:"LiteLLM Basic Multi-Cloud Usage",tabs:{python:`import litellm
from litellm import completion
import os

# Set credentials via environment variables
# Azure: AZURE_API_KEY, AZURE_API_BASE, AZURE_API_VERSION
# AWS: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION_NAME
# GCP: GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON)
# Or use: vertexai=True with VERTEXAI_PROJECT and VERTEXAI_LOCATION

# 1. Call Azure OpenAI (GPT-4o)
response = completion(
    model="azure/my-gpt4o-deployment",   # "my-gpt4o-deployment" is your Azure deployment name
    messages=[{"role": "user", "content": "Explain distributed consensus in 2 sentences."}],
    temperature=0.2,
    max_tokens=256,
)
print("Azure:", response.choices[0].message.content)
print("Cost:", response._hidden_params["response_cost"])

# 2. Call AWS Bedrock (Claude 3.5 Sonnet)
response = completion(
    model="bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[{"role": "user", "content": "Explain distributed consensus in 2 sentences."}],
    temperature=0.2,
    max_tokens=256,
)
print("Bedrock:", response.choices[0].message.content)

# 3. Call Vertex AI (Gemini 2.0 Flash)
response = completion(
    model="vertex_ai/gemini-2.0-flash-001",
    messages=[{"role": "user", "content": "Explain distributed consensus in 2 sentences."}],
    temperature=0.2,
    max_tokens=256,
    vertex_project="my-gcp-project",
    vertex_location="us-central1",
)
print("Vertex:", response.choices[0].message.content)

# 4. Unified interface — same code, any provider
def ask_llm(provider: str, query: str) -> str:
    model_map = {
        "azure": "azure/gpt4o-prod",
        "bedrock": "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
        "vertex": "vertex_ai/gemini-2.0-flash-001",
        "openai": "gpt-4o",
    }
    response = completion(
        model=model_map[provider],
        messages=[{"role": "user", "content": query}],
    )
    return response.choices[0].message.content

# 5. Streaming works identically across providers
for chunk in completion(
    model="bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[{"role": "user", "content": "Write a poem about cloud computing."}],
    stream=True,
):
    print(chunk.choices[0].delta.content or "", end="", flush=True)`}}),e.jsx("h2",{children:"LiteLLM Proxy Server"}),e.jsxs("p",{children:["The LiteLLM proxy runs as a standalone server that exposes an OpenAI-compatible REST API. Your applications call ",e.jsx("code",{children:"http://localhost:4000/v1/chat/completions"}),"using the standard OpenAI SDK — and the proxy handles routing, auth, rate limiting, cost tracking, and fallbacks transparently."]}),e.jsx(t,{language:"yaml",filename:"litellm_config.yaml",children:`# litellm_config.yaml — proxy server configuration
model_list:
  # Primary: Azure OpenAI GPT-4o
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt4o-eastus
      api_base: https://my-company.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY
      api_version: "2024-10-21"
      rpm: 30000           # Rate limit: requests per minute
      tpm: 500000          # Rate limit: tokens per minute

  # Secondary: Bedrock Claude 3.5 Sonnet (fallback)
  - model_name: gpt-4o    # Same model_name — LiteLLM treats these as one pool
    litellm_params:
      model: bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0
      aws_region_name: us-east-1
      rpm: 50000

  # Tertiary: Vertex AI Gemini (second fallback)
  - model_name: gpt-4o
    litellm_params:
      model: vertex_ai/gemini-2.0-flash-001
      vertex_project: my-gcp-project
      vertex_location: us-central1
      rpm: 60000

  # Separate model for cost-sensitive tasks
  - model_name: fast-cheap
    litellm_params:
      model: vertex_ai/gemini-2.0-flash-001
      vertex_project: my-gcp-project
      vertex_location: us-central1

  # Embedding model
  - model_name: text-embedding-3-small
    litellm_params:
      model: azure/text-embedding-3-small
      api_base: https://my-company.openai.azure.com/
      api_key: os.environ/AZURE_API_KEY

router_settings:
  # Routing strategy: least-busy, latency-based, cost-based, simple-shuffle
  routing_strategy: latency-based-routing
  # Track latency metrics for routing decisions
  latency_tracking: true
  # Number of retries before trying fallback
  num_retries: 2
  # Timeout per request before retrying
  timeout: 30
  # Fallback: if gpt-4o fails entirely, try fast-cheap
  fallbacks:
    - gpt-4o: ["fast-cheap"]

litellm_settings:
  # Global settings
  success_callback: ["langfuse"]   # Cost + trace logging
  failure_callback: ["slack"]      # Alert on failures
  cache: true
  cache_params:
    type: redis
    host: localhost
    port: 6379
    ttl: 3600   # Cache responses for 1 hour

general_settings:
  master_key: sk-my-proxy-key    # Clients use this key
  database_url: os.environ/DATABASE_URL  # PostgreSQL for spend tracking
  spend_logs_url: os.environ/DATABASE_URL`}),e.jsx(t,{language:"bash",filename:"start_proxy.sh",children:`# Install and start the proxy
pip install 'litellm[proxy]'

# Start with config
litellm --config litellm_config.yaml --port 4000 --num_workers 4

# Or with Docker (recommended for production)
docker run -d \\
  -v $(pwd)/litellm_config.yaml:/app/config.yaml \\
  -p 4000:4000 \\
  -e AZURE_API_KEY=$AZURE_API_KEY \\
  -e DATABASE_URL=$DATABASE_URL \\
  ghcr.io/berriai/litellm:main \\
  --config /app/config.yaml --port 4000`}),e.jsx("h2",{children:"Calling the Proxy with Standard OpenAI SDK"}),e.jsx(t,{language:"python",filename:"use_litellm_proxy.py",children:`from openai import OpenAI

# Point OpenAI SDK at LiteLLM proxy — works with any OpenAI-compatible client
client = OpenAI(
    base_url="http://localhost:4000/v1",
    api_key="sk-my-proxy-key",
)

# Transparent multi-cloud: routes to Azure primary, falls back to Bedrock, then Vertex
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain chaos engineering."}],
    temperature=0.3,
)
print(response.choices[0].message.content)

# Cost-optimized route explicitly
response = client.chat.completions.create(
    model="fast-cheap",  # Routes to Gemini Flash directly
    messages=[{"role": "user", "content": "Classify this text: 'my app is broken'"}],
)

# Embeddings also work through the proxy
embeddings = client.embeddings.create(
    model="text-embedding-3-small",
    input=["This is the text to embed", "Another document"],
)
print(embeddings.data[0].embedding[:5])`}),e.jsx("h2",{children:"Failover and Load Balancing Patterns"}),e.jsx(r,{title:"Programmatic Failover with LiteLLM Router",tabs:{python:`from litellm import Router

# Configure the router programmatically (no YAML needed)
router = Router(
    model_list=[
        {
            "model_name": "gpt-4o",
            "litellm_params": {
                "model": "azure/gpt4o-eastus",
                "api_base": "https://my-company.openai.azure.com/",
                "api_key": "...",
                "rpm": 30000,
                "tpm": 500000,
            },
            "model_info": {"id": "azure-primary"},
        },
        {
            "model_name": "gpt-4o",
            "litellm_params": {
                "model": "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
                "aws_region_name": "us-east-1",
                "rpm": 50000,
            },
            "model_info": {"id": "bedrock-fallback"},
        },
        {
            "model_name": "gpt-4o",
            "litellm_params": {
                "model": "vertex_ai/gemini-2.0-flash-001",
                "vertex_project": "my-gcp-project",
                "vertex_location": "us-central1",
                "rpm": 60000,
            },
            "model_info": {"id": "vertex-fallback"},
        },
    ],
    routing_strategy="least-busy",
    fallbacks=[{"gpt-4o": ["gpt-4o"]}],  # Self-fallback cycles through all providers
    num_retries=3,
    timeout=30.0,
    retry_after=5,
    # Cost-based routing: prefer lowest cost model that meets SLA
    # routing_strategy="cost-based-routing",
    # latency SLA in seconds — only use models that can respond within this
    # latency_based_routing_threshold=2.0,
)

# Async router call (recommended for production)
import asyncio

async def call_with_failover(query: str) -> str:
    response = await router.acompletion(
        model="gpt-4o",
        messages=[{"role": "user", "content": query}],
        temperature=0.2,
        max_tokens=1024,
    )
    # Check which provider was actually used
    provider_used = response._hidden_params.get("custom_llm_provider", "unknown")
    cost = response._hidden_params.get("response_cost", 0)
    print(f"Provider: {provider_used}, Cost: \${cost:.6f}")
    return response.choices[0].message.content

# Cost tracking across providers
router.set_cache(cache=None)  # Disable cache for cost tracking demo
async def track_daily_spend():
    spend_per_provider = {}
    for _ in range(100):
        response = await router.acompletion(
            model="gpt-4o",
            messages=[{"role": "user", "content": "Test message"}],
        )
        provider = response._hidden_params.get("custom_llm_provider")
        cost = response._hidden_params.get("response_cost", 0)
        spend_per_provider[provider] = spend_per_provider.get(provider, 0) + cost

    for provider, spend in spend_per_provider.items():
        print(f"{provider}: \${spend:.4f}")

asyncio.run(track_daily_spend())`}}),e.jsx(s,{name:"Cost-Aware Routing with Budget Guards",category:"Cost Management",whenToUse:"When you want to automatically downgrade to cheaper models as you approach budget thresholds — e.g., use Claude 3.5 Sonnet for the first $500/day of spend, then switch to Claude 3 Haiku for the remainder.",children:e.jsxs("p",{children:["Implement a middleware layer that tracks running costs against daily/monthly budgets. When spend crosses a threshold, the middleware changes the model string before forwarding to LiteLLM. Combine this with LiteLLM's built-in budget limiting (",e.jsx("code",{children:"max_budget"})," per API key in the proxy) for defense in depth. Log all model routing decisions for cost attribution and chargeback reporting."]})}),e.jsx(i,{title:"Vendor Lock-In Mitigation",children:e.jsx("p",{children:"Keep provider-specific logic (auth setup, credential refresh, region configuration) in a separate configuration layer, never mixed into your business logic. Use LiteLLM's OpenAI-compatible interface as your only point of contact with LLMs. Maintain an eval suite that runs against all supported providers — this detects behavioral differences between models early, before they affect production. When adopting provider-specific features (e.g., Azure Assistants API, Bedrock Agents, Vertex Agent Builder), wrap them in an interface so they can be swapped without changing calling code."})}),e.jsx(o,{type:"info",title:"LiteLLM Proxy in Production",children:e.jsxs("p",{children:["Run the LiteLLM proxy as a Kubernetes deployment with at least 3 replicas and a PostgreSQL backend for spend tracking. Use Redis for response caching and rate limit coordination across replicas. Set resource limits (CPU: 1 core, Memory: 2Gi per replica) — the proxy is mostly I/O bound and does not need large allocations. Enable the ",e.jsx("code",{children:"/health"})," endpoint and configure liveness/readiness probes to automatically restart unhealthy replicas."]})}),e.jsx(o,{type:"warning",title:"Response Format Differences",children:e.jsxs("p",{children:["While LiteLLM normalizes the response schema, there are subtle behavioral differences between providers that your application must handle: Claude returns stop reasons as ",e.jsx("code",{children:"end_turn"})," vs OpenAI's ",e.jsx("code",{children:"stop"}),"; Gemini may return multiple candidates while others return one; tool call argument formats differ in edge cases with nested objects. Always test your agent's tool parsing logic against all target providers, not just the primary."]})})]})}const O=Object.freeze(Object.defineProperty({__proto__:null,default:b},Symbol.toStringTag,{value:"Module"}));function A(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Cloud-Native RAG: Managed Solutions Across Clouds"}),e.jsx("p",{children:"Every major cloud provider now offers a fully managed RAG pipeline that integrates their document ingestion, vector search, and LLM generation services. Building on these managed solutions dramatically reduces operational overhead compared to self-hosted stacks (Weaviate/Qdrant + custom chunking code + embedding pipelines). This section compares the three leading managed RAG platforms: Azure AI Search, Amazon Bedrock Knowledge Bases, and Vertex AI Search."}),e.jsx(a,{title:"Managed RAG Platforms Side-by-Side",width:760,height:300,nodes:[{id:"azure_src",label:`Azure Blob /
SharePoint`,type:"store",x:80,y:80},{id:"azure_idx",label:`Azure AI
Search Index`,type:"store",x:260,y:80},{id:"azure_llm",label:`Azure OpenAI
GPT-4o`,type:"llm",x:440,y:80},{id:"aws_src",label:"S3 Bucket",type:"store",x:80,y:180},{id:"aws_kb",label:`Bedrock
Knowledge Base`,type:"store",x:260,y:180},{id:"aws_llm",label:`Bedrock
Claude 3.5`,type:"llm",x:440,y:180},{id:"gcp_src",label:`GCS / BigQuery
/ Web`,type:"store",x:80,y:280},{id:"gcp_idx",label:`Vertex AI
Search Store`,type:"store",x:260,y:280},{id:"gcp_llm",label:`Vertex AI
Gemini`,type:"llm",x:440,y:280},{id:"app",label:"Application",type:"external",x:640,y:180}],edges:[{from:"azure_src",to:"azure_idx",label:"index"},{from:"azure_idx",to:"azure_llm",label:"retrieve"},{from:"azure_llm",to:"app"},{from:"aws_src",to:"aws_kb",label:"sync"},{from:"aws_kb",to:"aws_llm",label:"retrieve"},{from:"aws_llm",to:"app"},{from:"gcp_src",to:"gcp_idx",label:"ingest"},{from:"gcp_idx",to:"gcp_llm",label:"ground"},{from:"gcp_llm",to:"app"}]}),e.jsx("h2",{children:"Azure AI Search + Azure OpenAI"}),e.jsx(n,{term:"Azure AI Search",children:e.jsxs("p",{children:["Azure AI Search (formerly Cognitive Search) is a fully managed search service that supports vector search (HNSW), keyword search (BM25/TF-IDF), and hybrid search that combines both. Its ",e.jsx("strong",{children:"integrated vectorization"})," pipeline automatically chunks, embeds, and indexes documents using Azure OpenAI embeddings — no custom ETL code required. ",e.jsx("strong",{children:"Semantic ranking"})," adds a reranking layer that uses language model comprehension to re-order results by relevance beyond keyword matching. AI enrichment skills can extract entities, key phrases, translate text, and perform OCR during indexing."]})}),e.jsx(r,{title:"Azure AI Search: Index Creation and RAG Query",tabs:{python:`from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex, SimpleField, SearchFieldDataType,
    SearchableField, SearchField, VectorSearch,
    HnswAlgorithmConfiguration, VectorSearchProfile,
    SemanticConfiguration, SemanticSearch, SemanticPrioritizedFields,
    SemanticField,
)
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from azure.core.credentials import AzureKeyCredential
from openai import AzureOpenAI
import os

SEARCH_ENDPOINT = "https://my-search.search.windows.net"
SEARCH_KEY = os.environ["AZURE_SEARCH_KEY"]
INDEX_NAME = "my-rag-index"
AZURE_OAI_ENDPOINT = "https://my-company.openai.azure.com/"
AZURE_OAI_KEY = os.environ["AZURE_OAI_KEY"]

# 1. Create the index with vector field
index_client = SearchIndexClient(SEARCH_ENDPOINT, AzureKeyCredential(SEARCH_KEY))

fields = [
    SimpleField(name="id", type=SearchFieldDataType.String, key=True),
    SearchableField(name="content", type=SearchFieldDataType.String),
    SearchableField(name="title", type=SearchFieldDataType.String),
    SimpleField(name="source", type=SearchFieldDataType.String, filterable=True),
    SimpleField(name="category", type=SearchFieldDataType.String, filterable=True),
    # Vector field for embeddings (text-embedding-3-small = 1536 dims)
    SearchField(
        name="content_vector",
        type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
        searchable=True,
        vector_search_dimensions=1536,
        vector_search_profile_name="my-vector-profile",
    ),
]

vector_search = VectorSearch(
    algorithms=[HnswAlgorithmConfiguration(name="my-hnsw", parameters={"m": 4, "ef_construction": 400})],
    profiles=[VectorSearchProfile(name="my-vector-profile", algorithm_configuration_name="my-hnsw")],
)

semantic_config = SemanticConfiguration(
    name="my-semantic-config",
    prioritized_fields=SemanticPrioritizedFields(
        content_fields=[SemanticField(field_name="content")],
        title_field=SemanticField(field_name="title"),
    ),
)

index = SearchIndex(
    name=INDEX_NAME,
    fields=fields,
    vector_search=vector_search,
    semantic_search=SemanticSearch(configurations=[semantic_config]),
)
index_client.create_or_update_index(index)
print(f"Index '{INDEX_NAME}' created.")

# 2. Embed and upload documents
oai_client = AzureOpenAI(azure_endpoint=AZURE_OAI_ENDPOINT, api_key=AZURE_OAI_KEY, api_version="2024-02-01")

def embed(text: str) -> list[float]:
    return oai_client.embeddings.create(
        model="text-embedding-3-small", input=text
    ).data[0].embedding

documents = [
    {"id": "1", "title": "Refund Policy", "content": "Our refund policy allows returns within 30 days...", "source": "policy.pdf", "category": "billing"},
    {"id": "2", "title": "API Rate Limits", "content": "The API is rate limited to 1000 requests per minute...", "source": "api-docs.pdf", "category": "technical"},
]

for doc in documents:
    doc["content_vector"] = embed(doc["content"])

search_client = SearchClient(SEARCH_ENDPOINT, INDEX_NAME, AzureKeyCredential(SEARCH_KEY))
search_client.upload_documents(documents)

# 3. Hybrid search + semantic reranking
def rag_query(query: str, category_filter: str = None) -> str:
    query_vector = embed(query)

    # Build filter expression
    filter_expr = f"category eq '{category_filter}'" if category_filter else None

    results = search_client.search(
        search_text=query,                # BM25 keyword search
        vector_queries=[VectorizedQuery(  # HNSW vector search
            vector=query_vector,
            k_nearest_neighbors=5,
            fields="content_vector",
        )],
        filter=filter_expr,
        query_type="semantic",            # Re-rank with semantic model
        semantic_configuration_name="my-semantic-config",
        query_answer="extractive",        # Extract exact answer spans
        query_answer_count=3,
        top=5,
        select=["id", "title", "content", "source"],
    )

    # Extract top results
    context_parts = []
    for result in results:
        context_parts.append(f"[{result['source']}] {result['content']}")

    context = "\\n\\n".join(context_parts)

    # Generate answer with Azure OpenAI
    gpt_response = oai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Answer using only the provided context. Cite sources."},
            {"role": "user", "content": f"Context:\\n{context}\\n\\nQuestion: {query}"},
        ],
        temperature=0.1,
    )
    return gpt_response.choices[0].message.content

print(rag_query("What is the refund policy?", category_filter="billing"))`}}),e.jsx("h2",{children:"Amazon Bedrock Knowledge Bases"}),e.jsx(n,{term:"Bedrock Knowledge Bases",children:e.jsxs("p",{children:["Bedrock Knowledge Bases is Amazon's fully managed RAG service. It ingests documents from S3, automatically chunks them (fixed size, semantic, or hierarchical chunking), embeds them using Titan Embeddings or Cohere Embed, and stores vectors in either OpenSearch Serverless, Aurora PostgreSQL (pgvector), Pinecone, MongoDB Atlas, or Redis Enterprise. Retrieval uses hybrid search, and the results are passed directly to any Bedrock foundation model for generation — all in a single API call to",e.jsx("code",{children:"retrieve_and_generate"}),"."]})}),e.jsx(t,{language:"python",filename:"bedrock_knowledge_base.py",children:`import boto3
import json

bedrock_agent = boto3.client("bedrock-agent", region_name="us-east-1")
bedrock_agent_runtime = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

KNOWLEDGE_BASE_ID = "ABCDE12345"  # From Bedrock console or Terraform
MODEL_ARN = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"

# 1. Retrieve (without generation) for custom post-processing
def retrieve_only(query: str, num_results: int = 5) -> list[dict]:
    """Retrieve relevant chunks without calling the LLM."""
    response = bedrock_agent_runtime.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": num_results,
                "overrideSearchType": "HYBRID",  # HYBRID | SEMANTIC | KEYWORD
                "filter": {
                    # Metadata filtering: only return docs from specific source
                    "equals": {"key": "department", "value": "engineering"}
                },
            }
        },
    )
    chunks = []
    for result in response["retrievalResults"]:
        chunks.append({
            "content": result["content"]["text"],
            "source": result["location"]["s3Location"]["uri"],
            "score": result["score"],
            "metadata": result.get("metadata", {}),
        })
    return chunks

# 2. Retrieve and generate in one API call
def rag_query(query: str, session_id: str = None) -> dict:
    """Full RAG: retrieve + generate with Claude 3.5 Sonnet."""
    params = {
        "knowledgeBaseId": KNOWLEDGE_BASE_ID,
        "input": {"text": query},
        "retrieveAndGenerateConfiguration": {
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                "modelArn": MODEL_ARN,
                "retrievalConfiguration": {
                    "vectorSearchConfiguration": {
                        "numberOfResults": 5,
                        "overrideSearchType": "HYBRID",
                    }
                },
                "generationConfiguration": {
                    "promptTemplate": {
                        "textPromptTemplate": (
                            "You are a helpful assistant. Answer the question using only "
                            "the provided search results. Cite sources using [1], [2], etc.\\n\\n"
                            "$search_results$\\n\\nQuestion: $query$"
                        )
                    },
                    "inferenceConfig": {
                        "textInferenceConfig": {
                            "temperature": 0.1,
                            "maxTokens": 1024,
                        }
                    },
                },
            },
        },
    }

    # Include session ID for multi-turn conversation
    if session_id:
        params["sessionId"] = session_id

    response = bedrock_agent_runtime.retrieve_and_generate(**params)

    return {
        "answer": response["output"]["text"],
        "session_id": response.get("sessionId"),
        "citations": [
            {
                "text": ref["content"]["text"],
                "source": ref["location"]["s3Location"]["uri"],
            }
            for citation in response.get("citations", [])
            for ref in citation.get("retrievedReferences", [])
        ],
    }

# 3. Trigger a sync job (after uploading new docs to S3)
def sync_knowledge_base(data_source_id: str):
    response = bedrock_agent.start_ingestion_job(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        dataSourceId=data_source_id,
    )
    job_id = response["ingestionJob"]["ingestionJobId"]
    print(f"Sync job started: {job_id}")
    return job_id

result = rag_query("What are our API rate limits?")
print(result["answer"])
for i, citation in enumerate(result["citations"], 1):
    print(f"[{i}] {citation['source']}")`}),e.jsx("h2",{children:"Vertex AI Search (Grounding Data Stores)"}),e.jsx(n,{term:"Vertex AI Search",children:e.jsxs("p",{children:["Vertex AI Search (part of Agent Builder) provides enterprise-grade search and RAG over structured and unstructured data. It uniquely supports website crawling with configurable depth and scheduling, BigQuery table search, and ACL-aware results that respect the user's permissions from Google Workspace. The",e.jsx("strong",{children:"answer generation"})," mode combines retrieval with Gemini to produce cited summaries. Vertex AI Search also integrates directly with Gemini's grounding API — when you enable data store grounding on a model, Gemini decides when to search and automatically includes results in the response."]})}),e.jsx(t,{language:"python",filename:"vertex_ai_search_rag.py",children:`from google.cloud import discoveryengine_v1alpha as discoveryengine
from google.api_core.client_options import ClientOptions
import vertexai
from vertexai.generative_models import GenerativeModel, Tool, Retrieval, VertexAISearch

PROJECT_ID = "my-gcp-project"
LOCATION = "global"
DATA_STORE_ID = "my-enterprise-docs"

# ---- Option 1: Direct search with answer generation ----
client_options = ClientOptions(api_endpoint="discoveryengine.googleapis.com")
search_client = discoveryengine.SearchServiceClient(client_options=client_options)

serving_config = (
    f"projects/{PROJECT_ID}/locations/{LOCATION}"
    f"/collections/default_collection"
    f"/dataStores/{DATA_STORE_ID}/servingConfigs/default_config"
)

request = discoveryengine.SearchRequest(
    serving_config=serving_config,
    query="What is our disaster recovery RTO?",
    page_size=10,
    content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
        summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
            summary_result_count=5,
            include_citations=True,
            ignore_adversarial_query=True,
            ignore_non_summary_seeking_query=False,
            model_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec.ModelSpec(
                version="preview"
            ),
        ),
        snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
            return_snippet=True,
        ),
        extractive_content_spec=discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
            max_extractive_answer_count=3,
            max_extractive_segment_count=5,
        ),
    ),
    # Filter by document metadata
    filter='category: ANY("runbooks", "sre-docs")',
    # Boost recent documents
    boost_spec=discoveryengine.SearchRequest.BoostSpec(
        condition_boost_specs=[
            discoveryengine.SearchRequest.BoostSpec.ConditionBoostSpec(
                condition='freshness("update_time", 30d)',
                boost=0.5,
            )
        ]
    ),
)

response = search_client.search(request)
print("AI Summary:", response.summary.summary_text)
for result in response.results:
    print(f"  - {result.document.name}: score {result.model_scores}")

# ---- Option 2: Gemini with Vertex AI Search grounding (integrated) ----
vertexai.init(project=PROJECT_ID, location="us-central1")

model = GenerativeModel(
    "gemini-1.5-pro-002",
    tools=[
        Tool.from_retrieval(
            retrieval=Retrieval(
                source=VertexAISearch(
                    datastore=f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATA_STORE_ID}"
                )
            )
        )
    ],
)

response = model.generate_content(
    "What are our SLA commitments to enterprise customers and what is our uptime guarantee?"
)
print(response.text)

# Extract grounding metadata
if response.candidates[0].grounding_metadata:
    for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
        if hasattr(chunk, "retrieved_context"):
            print(f"Source: {chunk.retrieved_context.uri}")`}),e.jsx("h2",{children:"Decision Matrix: Managed vs Self-Hosted RAG"}),e.jsx(t,{language:"text",filename:"rag_decision_matrix.txt",children:`DIMENSION              | Azure AI Search     | Bedrock KB           | Vertex AI Search    | Self-Hosted (Qdrant+)
-----------------------|---------------------|----------------------|---------------------|----------------------
Setup complexity       | Low (UI + SDK)      | Low (UI + SDK)       | Low (UI + SDK)      | High (infra + code)
Chunking strategies    | Fixed, semantic     | Fixed, semantic,     | Auto (managed)      | Full control
                       |                     | hierarchical         |                     |
Custom chunking        | Via indexer skills  | Limited              | No                  | Yes (fully custom)
Vector DB options      | HNSW (built-in)     | OpenSearch, Aurora,  | Managed (internal)  | Any (Qdrant, Weaviate,
                       |                     | Pinecone, MongoDB    |                     | Milvus, pgvector)
Hybrid search          | Yes (BM25 + HNSW)   | Yes (semantic +      | Yes                 | Varies by DB
                       |                     | keyword)             |                     |
Reranking              | Yes (semantic rank) | No (cross-encoder    | Yes (built-in)      | Yes (cohere/custom)
                       |                     | via Lambda)          |                     |
Web crawling           | Via custom indexers | No (S3 only)         | Yes (native)        | Manual
BigQuery integration   | No                  | No                   | Yes (native)        | Manual ETL
ACL-aware results      | Partial (security   | No                   | Yes (Google         | Manual implementation
                       | trimming)           |                      | Workspace ACL)      |
Multi-modal (images)   | Via OCR skills      | Via Titan multimodal | Via Gemini          | Manual pipeline
                       |                     | embeddings           |                     |
Latency (p50)          | 100-300ms           | 200-500ms            | 100-400ms           | 10-50ms (local)
Cost at 1M queries/mo  | ~$500-2000          | ~$300-1500           | ~$400-1800          | ~$200-500 (infra only)
Data residency         | All Azure regions   | All AWS regions      | 10 GCP regions      | Any cloud/on-prem
HIPAA compliance       | Yes                 | Yes                  | Yes                 | DIY (you own it)
Max document size      | 16MB                | 50MB per file        | 100MB               | No limit
Supported formats      | PDF, DOCX, HTML,    | PDF, DOCX, TXT,      | PDF, HTML, TXT,     | Any (custom parsers)
                       | TXT, Markdown       | HTML, Markdown, CSV  | DOCX, CSV           |
On-demand ingestion    | Real-time           | Manual sync trigger  | Real-time           | Real-time
Scheduled sync         | Indexer schedules   | EventBridge/cron     | Yes (configurable)  | Manual cron`}),e.jsx(s,{name:"Hybrid Managed + Self-Hosted RAG",category:"Architecture",whenToUse:"When you need managed infrastructure for ingestion (to avoid ETL code) but require custom retrieval logic (e.g., custom reranking, multi-index federation, or latency below 50ms) that managed services cannot provide.",children:e.jsx("p",{children:"Use the cloud provider's managed ingestion pipeline (indexer schedules, skill sets, automatic chunking) to populate a self-hosted vector database like Qdrant or pgvector. This gives you the operational simplicity of managed ingestion with the query flexibility of a self-hosted retrieval layer. Export embeddings from Azure AI Search or Bedrock KB via their respective document export APIs, then re-import into your vector DB. Run the vector DB on the same cloud/region as your application to minimize retrieval latency."})}),e.jsx(i,{title:"Chunk Size Tuning",children:e.jsx("p",{children:"Default chunk sizes (512 tokens for Azure, 300 words for Bedrock, auto for Vertex) work well for general prose. For technical documentation with long code examples, increase chunk size to 1024–2048 tokens to avoid splitting code blocks. For FAQ documents, use a semantic chunker that splits on question boundaries rather than token count. For tables and structured data, consider chunking by row or logical section and storing structured metadata alongside each chunk for filter-based retrieval. Always measure retrieval precision with your actual query distribution — chunk size has more impact on RAG quality than almost any other parameter."})}),e.jsx(o,{type:"tip",title:"Incremental Ingestion with Change Detection",children:e.jsxs("p",{children:["All three managed platforms support incremental ingestion — only processing changed documents. Azure AI Search indexers can detect changes via ETags and",e.jsx("code",{children:"lastModified"})," metadata. Bedrock Knowledge Bases sync only changed S3 objects based on the ETag. Vertex AI Search uses document IDs for upserts. Store a content hash with each document to detect changes at the application layer before triggering a sync, eliminating redundant re-embedding of unchanged content and reducing ingestion costs."]})}),e.jsx(o,{type:"warning",title:"Latency of Managed RAG vs. Direct Vector DB",children:e.jsx("p",{children:"Managed RAG pipelines add 100–400ms of latency compared to a direct vector DB query (10–50ms) because requests traverse additional managed service layers, authentication, and network hops between services. For real-time applications with strict latency SLAs (<200ms end-to-end), benchmark your managed solution carefully. If latency is a concern, use Private Service Connect (GCP), VPC Endpoints (AWS), or Private Endpoints (Azure) to minimize network hops, and deploy your application and search service in the same region."})})]})}const q=Object.freeze(Object.defineProperty({__proto__:null,default:A},Symbol.toStringTag,{value:"Module"}));export{S as a,I as b,C as c,P as d,T as e,D as f,M as g,E as h,z as i,L as j,R as k,G as l,O as m,q as n,j as s};
