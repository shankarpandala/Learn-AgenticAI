import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function AzureOpenAIService() {
  return (
    <article className="prose-content">
      <h2>Azure OpenAI Service</h2>
      <p>
        Azure OpenAI Service gives you access to OpenAI's models — including GPT-4o, o1, o3-mini,
        and text-embedding-3 — through Azure's enterprise infrastructure. This means private
        networking, managed identity authentication, compliance certifications (SOC 2, ISO 27001,
        HIPAA), regional data residency, and built-in content filtering. For production AI
        workloads, Azure OpenAI is the standard choice when operating within the Microsoft ecosystem.
      </p>

      <ConceptBlock term="Deployment Types">
        <p>
          Azure OpenAI separates <strong>model versions</strong> from <strong>deployments</strong>.
          You create a deployment by assigning a model version to a named endpoint within your
          resource. Three deployment types exist: <strong>Standard</strong> (pay-per-token, shared
          compute, auto-scales), <strong>Provisioned Throughput Units (PTU)</strong> (reserved
          compute for consistent low-latency at high volume), and <strong>Global Standard</strong>
          (Microsoft routes traffic across regions for higher throughput). PTU deployments are
          priced per hour regardless of utilization — they make sense only above roughly 40K
          TPM sustained load.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Azure OpenAI Deployment Architecture"
        width={700}
        height={320}
        nodes={[
          { id: 'app', label: 'Application', type: 'external', x: 70, y: 160 },
          { id: 'apim', label: 'API Management\n(rate limit, auth)', type: 'tool', x: 220, y: 160 },
          { id: 'aoai', label: 'Azure OpenAI\nResource', type: 'agent', x: 390, y: 160 },
          { id: 'std', label: 'Standard\nDeployment', type: 'llm', x: 560, y: 80 },
          { id: 'ptu', label: 'PTU\nDeployment', type: 'llm', x: 560, y: 160 },
          { id: 'global', label: 'Global Standard\nDeployment', type: 'llm', x: 560, y: 240 },
          { id: 'vnet', label: 'Private Endpoint\n(VNet)', type: 'store', x: 220, y: 270 },
          { id: 'mi', label: 'Managed Identity\n(no keys)', type: 'store', x: 390, y: 270 },
        ]}
        edges={[
          { from: 'app', to: 'apim' },
          { from: 'apim', to: 'aoai' },
          { from: 'aoai', to: 'std' },
          { from: 'aoai', to: 'ptu' },
          { from: 'aoai', to: 'global' },
          { from: 'vnet', to: 'aoai', label: 'private' },
          { from: 'mi', to: 'aoai', label: 'auth' },
        ]}
      />

      <h2>Authentication: Managed Identity over API Keys</h2>
      <p>
        Azure OpenAI supports both API key and Entra ID (formerly Azure AD) authentication.
        In production, always use <code>DefaultAzureCredential</code> from the
        <code>azure-identity</code> package. This credential chain automatically picks up
        the right identity: Managed Identity in Azure-hosted workloads, developer credentials
        locally, and service principals in CI/CD — all without storing secrets.
      </p>

      <CodeBlock language="python" filename="auth_setup.py">
{`from openai import AzureOpenAI
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
# on the Azure OpenAI resource in the Azure portal or via Bicep`}
      </CodeBlock>

      <h2>Core API Patterns</h2>

      <SDKExample
        title="Chat Completions: Streaming + Tool Calling"
        tabs={{
          python: `import json
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
        print(f"\\n\\nTokens: {chunk.usage.prompt_tokens} in, {chunk.usage.completion_tokens} out")`,
        }}
      />

      <h2>Embeddings and Bring Your Own Data</h2>

      <CodeBlock language="python" filename="embeddings_and_byod.py">
{`import numpy as np
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
        print(f"  Source: {citation['title']} — {citation['url']}")`}
      </CodeBlock>

      <h2>Content Filtering and Responsible AI</h2>

      <ConceptBlock term="Content Filter Layers">
        <p>
          Azure OpenAI applies content filters at both input (prompt) and output (completion) levels.
          Filters operate across four harm categories — <strong>hate</strong>,
          <strong>sexual</strong>, <strong>violence</strong>, and <strong>self-harm</strong> — each
          with configurable thresholds (low, medium, high). Additional filters cover
          <strong>jailbreak / prompt injection</strong> detection,
          <strong>protected material</strong> (copyright), and
          <strong>groundedness</strong> for grounded completion responses. Custom filter policies
          can be applied per deployment.
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="content_filter_handling.py">
{`from openai import AzureOpenAI, BadRequestError

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
        print(e.body)`}
      </CodeBlock>

      <PatternBlock
        name="PTU + Standard Spillover"
        category="Capacity Management"
        whenToUse="When you have a baseline predictable load that justifies PTU reservations but also experience traffic spikes. Route primary traffic to PTU deployments and overflow to Standard when PTU returns 429s."
      >
        <p>
          Deploy a load balancer (Azure API Management or a custom retry wrapper) in front of
          multiple deployments. Primary deployment is PTU (low latency, consistent throughput).
          On HTTP 429 (capacity exceeded), route to a Standard deployment in the same or a
          different region. Use exponential backoff with jitter. APIM has a built-in
          <code>retry</code> policy that can handle this transparently.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Quota Management and Cost Control">
        <p>
          Azure OpenAI quota is assigned at the subscription + region level, then distributed
          across deployments. Set <strong>per-deployment TPM limits</strong> explicitly — do not
          let a single deployment consume all quota. Use <strong>Azure Monitor</strong> metrics
          (<code>TokensPerMinuteUsagePercentage</code>, <code>RequestsPerMinuteUsagePercentage</code>)
          with alerts at 80% to detect quota pressure early. For cost attribution in
          multi-tenant systems, tag requests with <code>user</code> field in the API payload
          and export usage logs to Log Analytics.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="API Version Pinning">
        <p>
          Azure OpenAI API versions are date-stamped (e.g., <code>2024-12-01-preview</code>).
          Preview versions may have breaking changes. Pin to a specific GA version in production
          (e.g., <code>2024-08-01-preview</code> became GA as <code>2024-10-21</code>). Preview
          versions are required for features like o1 structured outputs, real-time audio, and
          the latest tool-calling improvements. Maintain a tested upgrade path before bumping
          versions.
        </p>
      </NoteBlock>

      <NoteBlock type="tip" title="Private Endpoint vs. VNet Integration">
        <p>
          Private endpoints bind the Azure OpenAI resource to a private IP in your VNet,
          preventing all public internet access. This is the correct choice for regulated
          industries. VNet integration (without private endpoints) still allows public access
          but adds network-level controls. Combine private endpoints with
          <strong>Private DNS Zones</strong> so that <code>*.openai.azure.com</code> resolves
          to the private IP within your VNet.
        </p>
      </NoteBlock>
    </article>
  )
}
