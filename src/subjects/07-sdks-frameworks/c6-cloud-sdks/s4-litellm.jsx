import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function LiteLLM() {
  return (
    <article className="prose-content">
      <h2>LiteLLM: Unified LLM Interface</h2>
      <p>
        LiteLLM provides a single OpenAI-compatible API that routes to 100+ LLM providers —
        Azure OpenAI, Amazon Bedrock, Google Vertex AI, Anthropic, Cohere, Mistral, and more.
        It's the primary abstraction layer for multi-cloud AI architectures, enabling model
        switching, cost-optimized routing, and automatic fallback without changing application code.
      </p>

      <ConceptBlock term="LiteLLM">
        <p>
          LiteLLM translates OpenAI-format requests into each provider's native API format,
          normalizes responses back to OpenAI format, and exposes a consistent Python SDK and
          optional proxy server. The model is identified by a prefixed string:
          <code>azure/gpt-4o</code>, <code>bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0</code>,
          <code>vertex_ai/gemini-2.0-flash-001</code>.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="LiteLLM Proxy — Multi-Cloud Routing"
        width={700}
        height={280}
        nodes={[
          { id: 'app', label: 'Your Application', type: 'external', x: 80, y: 140 },
          { id: 'proxy', label: 'LiteLLM Proxy', type: 'agent', x: 260, y: 140 },
          { id: 'azure', label: 'Azure OpenAI', type: 'llm', x: 480, y: 60 },
          { id: 'bedrock', label: 'AWS Bedrock', type: 'llm', x: 480, y: 140 },
          { id: 'vertex', label: 'Vertex AI', type: 'llm', x: 480, y: 220 },
          { id: 'metrics', label: 'Cost + Metrics', type: 'store', x: 640, y: 140 },
        ]}
        edges={[
          { from: 'app', to: 'proxy', label: 'OpenAI format' },
          { from: 'proxy', to: 'azure', label: 'primary' },
          { from: 'proxy', to: 'bedrock', label: 'fallback' },
          { from: 'proxy', to: 'vertex', label: 'fallback' },
          { from: 'proxy', to: 'metrics' },
        ]}
      />

      <h2>Installation and Basic Usage</h2>

      <CodeBlock language="bash" filename="install.sh">
{`pip install litellm

# With proxy server support
pip install 'litellm[proxy]'`}
      </CodeBlock>

      <SDKExample
        title="LiteLLM — Basic Usage Across All Providers"
        tabs={{
          python: `import litellm
import os

# Set credentials via environment variables
os.environ["AZURE_API_KEY"] = "your-azure-key"
os.environ["AZURE_API_BASE"] = "https://your-service.openai.azure.com"
os.environ["AZURE_API_VERSION"] = "2024-10-21"

os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

os.environ["VERTEXAI_PROJECT"] = "your-project"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# Calling different providers with the SAME API
def complete(model: str, message: str) -> str:
    response = litellm.completion(
        model=model,
        messages=[{"role": "user", "content": message}],
        temperature=0,
        max_tokens=1024,
    )
    return response.choices[0].message.content

# Azure OpenAI
azure_response = complete("azure/gpt-4o", "Explain retrieval-augmented generation")

# Amazon Bedrock (Claude)
bedrock_response = complete(
    "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
    "Explain retrieval-augmented generation"
)

# Vertex AI (Gemini)
vertex_response = complete(
    "vertex_ai/gemini-2.0-flash-001",
    "Explain retrieval-augmented generation"
)

# Streaming — same across all providers
def stream_complete(model: str, message: str) -> None:
    stream = litellm.completion(
        model=model,
        messages=[{"role": "user", "content": message}],
        stream=True
    )
    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            print(content, end="", flush=True)

# Async
import asyncio

async def async_complete(model: str, message: str) -> str:
    response = await litellm.acompletion(
        model=model,
        messages=[{"role": "user", "content": message}]
    )
    return response.choices[0].message.content

# Tool use — same API for all providers
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"}
                },
                "required": ["city"]
            }
        }
    }
]

response = litellm.completion(
    model="bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[{"role": "user", "content": "What's the weather in Seattle?"}],
    tools=tools,
    tool_choice="auto"
)`,
        }}
      />

      <h2>Fallback and Load Balancing</h2>

      <PatternBlock
        name="Fallback Routing"
        category="Reliability"
        whenToUse="When you need high availability across model providers, or when your primary provider is capacity-constrained or has an outage."
      >
        <p>
          LiteLLM supports automatic fallback at both the model level (try GPT-4o, fall back to
          Claude 3.5 Sonnet) and the provider level (try Azure primary region, fall back to
          Bedrock). Fallbacks are configured declaratively and happen transparently to your code.
        </p>
      </PatternBlock>

      <SDKExample
        title="LiteLLM — Fallbacks, Load Balancing, and Cost Tracking"
        tabs={{
          python: `import litellm
from litellm import Router

# Configure a router with multiple model deployments
router = Router(
    model_list=[
        # Primary: Azure GPT-4o (two deployments for load balancing)
        {
            "model_name": "gpt-4o-primary",
            "litellm_params": {
                "model": "azure/gpt-4o",
                "api_base": "https://westus2.openai.azure.com",
                "api_key": "key1",
                "api_version": "2024-10-21",
            },
            "tpm": 100000,  # tokens per minute capacity
            "rpm": 600,     # requests per minute
        },
        {
            "model_name": "gpt-4o-primary",
            "litellm_params": {
                "model": "azure/gpt-4o",
                "api_base": "https://eastus2.openai.azure.com",
                "api_key": "key2",
                "api_version": "2024-10-21",
            },
            "tpm": 100000,
            "rpm": 600,
        },
        # Fallback: Bedrock Claude
        {
            "model_name": "claude-fallback",
            "litellm_params": {
                "model": "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
                "aws_region_name": "us-east-1",
            },
        },
        # Fallback: Vertex AI Gemini
        {
            "model_name": "gemini-fallback",
            "litellm_params": {
                "model": "vertex_ai/gemini-2.0-flash-001",
                "vertex_project": "my-project",
                "vertex_location": "us-central1",
            },
        },
    ],
    # Load balancing strategy
    routing_strategy="least-busy",  # or "usage-based-routing", "latency-based-routing"
    # Fallback order when primary fails
    fallbacks=[
        {"gpt-4o-primary": ["claude-fallback", "gemini-fallback"]}
    ],
    # Retry configuration
    num_retries=3,
    retry_after=10,  # seconds between retries
    # Request timeout
    timeout=30,
    # Cache successful responses
    cache_responses=True,
    redis_url="redis://localhost:6379",
)

async def resilient_complete(message: str) -> str:
    response = await router.acompletion(
        model="gpt-4o-primary",
        messages=[{"role": "user", "content": message}]
    )
    return response.choices[0].message.content

# Cost tracking
litellm.success_callback = ["langfuse", "prometheus"]  # Built-in integrations

def complete_with_cost(model: str, message: str) -> dict:
    response = litellm.completion(
        model=model,
        messages=[{"role": "user", "content": message}]
    )
    cost = litellm.completion_cost(completion_response=response)
    return {
        "content": response.choices[0].message.content,
        "cost_usd": cost,
        "input_tokens": response.usage.prompt_tokens,
        "output_tokens": response.usage.completion_tokens,
        "model": response.model
    }`,
        }}
      />

      <h2>LiteLLM Proxy Server</h2>
      <p>
        The LiteLLM proxy exposes an OpenAI-compatible HTTP server. Any application using
        the OpenAI SDK can route through LiteLLM proxy by changing the <code>base_url</code>
        — enabling centralized rate limiting, cost tracking, and model governance without
        modifying individual applications.
      </p>

      <CodeBlock language="yaml" filename="litellm_config.yaml">
{`model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o
      api_base: https://westus2.openai.azure.com
      api_key: os.environ/AZURE_API_KEY_1
      api_version: "2024-10-21"

  - model_name: claude-3-5-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0
      aws_region_name: us-east-1

  - model_name: gemini-flash
    litellm_params:
      model: vertex_ai/gemini-2.0-flash-001
      vertex_project: my-project
      vertex_location: us-central1

router_settings:
  routing_strategy: usage-based-routing-v2
  num_retries: 2
  timeout: 60
  fallbacks:
    - gpt-4o: ["claude-3-5-sonnet", "gemini-flash"]

litellm_settings:
  success_callback: ["prometheus", "langfuse"]
  failure_callback: ["prometheus", "slack"]
  max_budget: 1000  # USD per month total
  budget_duration: 1mo

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY  # Auth for proxy API
  database_url: os.environ/DATABASE_URL      # PostgreSQL for logging
  store_model_in_db: true`}
      </CodeBlock>

      <CodeBlock language="bash" filename="run_proxy.sh">
{`# Start the proxy server
litellm --config litellm_config.yaml --port 4000

# Any OpenAI-compatible client can now use it:
# export OPENAI_API_BASE="http://localhost:4000"
# export OPENAI_API_KEY="sk-your-master-key"
# Then use the normal openai SDK - it routes through LiteLLM`}
      </CodeBlock>

      <BestPracticeBlock title="Use LiteLLM Router for Enterprise Resilience">
        <p>
          For production multi-cloud setups, use LiteLLM Router (not raw <code>litellm.completion</code>)
          to get automatic load balancing across deployments, TPM/RPM-aware routing, and cascading
          fallbacks. Configure at least one cross-provider fallback (e.g., Azure GPT-4o → Bedrock Claude)
          to handle provider-wide outages. Monitor cost per model via the built-in Prometheus exporter
          to catch unexpected cost spikes early.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="LiteLLM vs. Provider SDKs">
        <p>
          LiteLLM adds a thin abstraction layer that's invaluable for multi-cloud setups and
          A/B testing models. However, for provider-specific features (Azure Assistants API,
          Bedrock Agents, Vertex AI grounding with Google Search), you'll still need the native
          SDKs. A common pattern: LiteLLM for standard completions and embeddings, native SDKs
          for managed services (agents, knowledge bases, guardrails).
        </p>
      </NoteBlock>
    </article>
  )
}
