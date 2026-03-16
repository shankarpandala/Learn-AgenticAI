import{j as e}from"./vendor-Cs56uELc.js";import{C as s,a as t,S as o,B as n,N as r}from"./subject-01-rag-fundamentals-By1Px9YG.js";import"./subject-06-coding-agents-BcJu108D.js";import"./subject-03-agent-foundations-TuSBeYGc.js";function d(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Accessing Models via Cloud Providers"}),e.jsx("p",{children:"Rather than managing raw API keys to individual model providers, enterprises typically access foundation models through their cloud provider's managed service. This provides a single identity plane (IAM), network isolation (VPC endpoints), compliance certifications, SLA guarantees, and consolidated billing — all critical requirements for production systems."}),e.jsx(s,{term:"Cloud Model Catalog",children:e.jsx("p",{children:"A cloud model catalog is a curated collection of foundation models — both proprietary (GPT-4o on Azure, Gemini on Vertex) and third-party open/closed models (Llama, Mistral, Command R+ on all three) — accessible through a single managed API endpoint with unified authentication, monitoring, and compliance controls. The key advantage: one deployment configuration gives you access to dozens of models without managing multiple vendor relationships."})}),e.jsx("h2",{children:"Azure OpenAI Service: Model Access"}),e.jsxs("p",{children:["Azure OpenAI provides OpenAI's models as an Azure-native managed service. Models require explicit ",e.jsx("strong",{children:"deployment"})," (you create a named deployment of a model version) before use. This differs from OpenAI directly where you call model names directly."]}),e.jsx("h3",{children:"Available Models (as of early 2026)"}),e.jsx(t,{language:"text",filename:"azure-openai-models.txt",children:`Chat/Completion Models:
  gpt-4o           (2024-08-06) — flagship, 128K context, JSON mode, vision
  gpt-4o-mini      (2024-07-18) — fast/cheap, 128K context, good for classification
  o1               (2024-12-17) — reasoning model, slower, better for complex tasks
  o1-mini          (2024-09-12) — faster reasoning, lower cost
  o3-mini          (2025-01-31) — latest reasoning model

Embedding Models:
  text-embedding-3-large  — 3072 dims (reducible), best quality
  text-embedding-3-small  — 1536 dims, faster/cheaper

Deployment Types:
  Standard     — shared capacity, soft quota limits, pay-per-token
  Global Standard — routes to lowest-latency region automatically
  PTU (Provisioned Throughput) — dedicated capacity, predictable latency
  PTU-Managed  — Microsoft manages PTU scaling`}),e.jsx(o,{title:"Azure OpenAI — DefaultAzureCredential + Tool Use",tabs:{python:`from openai import AzureOpenAI
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
import json

# Preferred: Use managed identity — no key rotation, full audit trail
token_provider = get_bearer_token_provider(
    DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default"
)

client = AzureOpenAI(
    azure_endpoint="https://<your-service>.openai.azure.com",
    azure_ad_token_provider=token_provider,
    api_version="2024-10-21"
)

# Define tools (function calling)
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_product_info",
            "description": "Get information about a product by SKU",
            "parameters": {
                "type": "object",
                "properties": {
                    "sku": {"type": "string", "description": "Product SKU"},
                    "include_pricing": {"type": "boolean"}
                },
                "required": ["sku"]
            }
        }
    }
]

def chat_with_tools(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    response = client.chat.completions.create(
        model="gpt-4o",        # Your deployment name
        messages=messages,
        tools=tools,
        tool_choice="auto",
        temperature=0,
        response_format={"type": "json_object"}  # Structured output
    )

    msg = response.choices[0].message

    if msg.tool_calls:
        # Process tool call
        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            result = {"name": "Widget Pro", "price": 29.99}  # Mock tool

            messages.append(msg)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result)
            })

        # Continue conversation with tool results
        final = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        return final.choices[0].message.content

    return msg.content`}}),e.jsx("h2",{children:"Amazon Bedrock: Converse API"}),e.jsxs("p",{children:["Amazon Bedrock's ",e.jsx("strong",{children:"Converse API"})," is the recommended unified interface for all Bedrock models. Unlike the older ",e.jsx("code",{children:"invoke_model"})," API (which requires model-specific request/response schemas), Converse provides a single consistent API for tool use, streaming, and conversation history — making it easy to switch models."]}),e.jsx("h3",{children:"Available Models (Model IDs)"}),e.jsx(t,{language:"text",filename:"bedrock-model-ids.txt",children:`Anthropic Claude:
  anthropic.claude-3-5-sonnet-20241022-v2:0   — best coding & analysis
  anthropic.claude-3-5-haiku-20241022-v1:0    — fastest Claude, low cost
  anthropic.claude-3-opus-20240229-v1:0        — most capable Claude 3

Meta Llama:
  meta.llama3-1-70b-instruct-v1:0             — strong open model, 128K ctx
  meta.llama3-1-8b-instruct-v1:0              — fastest Llama, cheap

Mistral:
  mistral.mistral-large-2402-v1:0             — best Mistral, 32K ctx
  mistral.mistral-small-2402-v1:0             — fast & cheap

Amazon Nova:
  amazon.nova-pro-v1:0                         — multimodal, 300K ctx
  amazon.nova-lite-v1:0                        — balanced speed/cost
  amazon.nova-micro-v1:0                       — ultra-fast text-only

Embeddings:
  amazon.titan-embed-text-v2:0                 — 256/512/1024 dims
  cohere.embed-english-v3                      — 1024 dims`}),e.jsx(o,{title:"Amazon Bedrock — Converse API with Tool Use",tabs:{python:`import boto3
import json

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

tools = [
    {
        "toolSpec": {
            "name": "get_weather",
            "description": "Get current weather for a city",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string"},
                        "units": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                    },
                    "required": ["city"]
                }
            }
        }
    }
]

def chat_with_tools(user_message: str, model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0") -> str:
    messages = [{"role": "user", "content": [{"text": user_message}]}]

    response = bedrock.converse(
        modelId=model_id,
        messages=messages,
        toolConfig={"tools": tools},
        inferenceConfig={"maxTokens": 1024, "temperature": 0}
    )

    output = response["output"]["message"]
    stop_reason = response["stopReason"]

    if stop_reason == "tool_use":
        messages.append(output)
        tool_results = []

        for block in output["content"]:
            if block.get("toolUse"):
                tool = block["toolUse"]
                # Execute tool
                result = {"temperature": 22, "condition": "sunny"}
                tool_results.append({
                    "toolResult": {
                        "toolUseId": tool["toolUseId"],
                        "content": [{"json": result}]
                    }
                })

        messages.append({"role": "user", "content": tool_results})
        final = bedrock.converse(modelId=model_id, messages=messages)
        return final["output"]["message"]["content"][0]["text"]

    return output["content"][0]["text"]

# Streaming with Converse Stream
def stream_chat(message: str) -> None:
    response = bedrock.converse_stream(
        modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
        messages=[{"role": "user", "content": [{"text": message}]}],
        inferenceConfig={"maxTokens": 1024}
    )
    for event in response["stream"]:
        if "contentBlockDelta" in event:
            print(event["contentBlockDelta"]["delta"]["text"], end="", flush=True)`}}),e.jsx("h2",{children:"Google Vertex AI: Model Access"}),e.jsx("p",{children:"Vertex AI provides access to Google's Gemini models plus third-party models via Model Garden. Unlike Azure OpenAI (deployment-based), Vertex AI uses model version strings directly. Authentication uses Google's Application Default Credentials (ADC)."}),e.jsx(o,{title:"Vertex AI — GenerativeModel with Function Calling",tabs:{python:`import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    FunctionDeclaration,
    Tool,
    Content,
    Part,
)

vertexai.init(project="my-project", location="us-central1")

# Define tools
get_product = FunctionDeclaration(
    name="get_product",
    description="Look up product details by ID",
    parameters={
        "type": "object",
        "properties": {
            "product_id": {"type": "string"},
            "fields": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Fields to return: name, price, availability"
            }
        },
        "required": ["product_id"]
    }
)

tools = Tool(function_declarations=[get_product])

model = GenerativeModel(
    "gemini-2.0-flash-001",
    tools=[tools],
    system_instruction="You are a helpful product assistant."
)

def chat_with_tools(user_message: str) -> str:
    chat = model.start_chat()
    response = chat.send_message(user_message)

    candidate = response.candidates[0]
    if candidate.finish_reason.name == "STOP":
        return response.text

    # Handle function calls
    for part in candidate.content.parts:
        if part.function_call:
            fc = part.function_call
            # Execute function
            result = {"name": "Widget Pro", "price": 29.99}

            # Return function response
            function_response = chat.send_message(
                Part.from_function_response(
                    name=fc.name,
                    response={"content": result}
                )
            )
            return function_response.text

    return response.text

# Context caching for long documents (Gemini 1.5 Pro / Flash)
from vertexai.generative_models import CachedContent
import datetime

def create_cached_context(long_document: str) -> str:
    """Cache a large document to avoid re-processing in every request."""
    cached = CachedContent.create(
        model_name="gemini-1.5-pro-002",
        contents=[Content.from_uri("gs://my-bucket/large-doc.pdf", "application/pdf")],
        ttl=datetime.timedelta(hours=1),
        system_instruction="You are analyzing this technical document."
    )
    return cached.name  # Use this in subsequent GenerativeModel calls`}}),e.jsx("h2",{children:"Deployment Options Comparison"}),e.jsx(t,{language:"text",filename:"cloud-model-deployment-comparison.txt",children:`┌──────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│ Dimension        │ Azure OpenAI         │ Amazon Bedrock       │ Vertex AI           │
├──────────────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│ Auth method      │ Managed identity     │ IAM roles           │ Workload identity   │
│ Network          │ Private endpoint     │ VPC endpoint        │ VPC Service Controls│
│ Quota model      │ Deployment TPM       │ On-demand / PTU     │ Requests per minute │
│ Dedicated cap.   │ PTU                  │ Provisioned T/P     │ Dedicated endpoints │
│ Data residency   │ 17+ regions          │ 15+ regions         │ 20+ regions         │
│ SOC2/HIPAA/GDPR  │ Yes (all)           │ Yes (all)           │ Yes (all)           │
│ FedRAMP          │ Yes (Gov cloud)      │ Yes (Gov cloud)     │ Yes (Gov cloud)     │
│ Model switch     │ New deployment       │ Change model ID     │ Change model string │
│ Rate limit info  │ Azure Monitor        │ CloudWatch          │ Cloud Monitoring    │
│ Cost tracking    │ Azure Cost Mgmt      │ Cost Explorer       │ Cloud Billing       │
└──────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘`}),e.jsx(n,{title:"Use Managed Identity / Workload Identity Everywhere",children:e.jsx("p",{children:"Never use static API keys for cloud model access in production. All three clouds support keyless authentication: Azure Managed Identity, AWS IAM Roles for EC2/ECS/Lambda, and GCP Workload Identity Federation. These rotate automatically, produce audit logs of every API call, and allow fine-grained permission scoping (e.g., read-only access to specific deployments). Static keys are a single point of compromise and don't appear in audit trails."})}),e.jsx(r,{type:"tip",title:"Cross-Region Inference for Availability",children:e.jsx("p",{children:"All three clouds offer automatic cross-region routing when your primary region is capacity-constrained: Azure's Global Standard deployments, AWS Bedrock's Cross-Region Inference Profiles, and Vertex AI's multi-region endpoints. Enable these for production workloads to avoid availability dips during regional capacity events."})})]})}export{d as default};
