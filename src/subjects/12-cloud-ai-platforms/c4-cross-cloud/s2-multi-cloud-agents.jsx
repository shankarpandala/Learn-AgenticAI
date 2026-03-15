import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function MultiCloudAgents() {
  return (
    <article className="prose-content">
      <h2>Multi-Cloud Agent Architecture</h2>
      <p>
        Building agents that work across Azure, AWS, and GCP requires an abstraction layer
        that normalizes the differences in authentication, request format, streaming protocols,
        and error handling across providers. LiteLLM is the de facto standard for this —
        it provides a unified OpenAI-compatible interface to 100+ LLM providers, handles
        provider-specific quirks internally, and adds production capabilities like cost
        tracking, rate limit handling, fallback routing, and load balancing.
      </p>

      <ArchitectureDiagram
        title="LiteLLM Proxy: Multi-Cloud Request Flow"
        width={740}
        height={320}
        nodes={[
          { id: 'client', label: 'Agent / App', type: 'external', x: 70, y: 160 },
          { id: 'proxy', label: 'LiteLLM Proxy\n(Router)', type: 'agent', x: 240, y: 160 },
          { id: 'lb', label: 'Load Balancer\n/ Fallback', type: 'agent', x: 240, y: 280 },
          { id: 'azure', label: 'Azure OpenAI\nGPT-4o', type: 'llm', x: 450, y: 80 },
          { id: 'bedrock', label: 'AWS Bedrock\nClaude 3.5', type: 'llm', x: 450, y: 180 },
          { id: 'vertex', label: 'Vertex AI\nGemini Flash', type: 'llm', x: 450, y: 280 },
          { id: 'tracker', label: 'Cost Tracker\n/ Logging', type: 'store', x: 620, y: 160 },
        ]}
        edges={[
          { from: 'client', to: 'proxy', label: 'OpenAI format' },
          { from: 'proxy', to: 'lb' },
          { from: 'proxy', to: 'azure', label: 'primary' },
          { from: 'lb', to: 'bedrock', label: 'fallback 1' },
          { from: 'lb', to: 'vertex', label: 'fallback 2' },
          { from: 'azure', to: 'tracker' },
          { from: 'bedrock', to: 'tracker' },
          { from: 'vertex', to: 'tracker' },
        ]}
      />

      <h2>LiteLLM: Direct SDK Usage</h2>

      <ConceptBlock term="LiteLLM Provider Prefixes">
        <p>
          LiteLLM uses a simple prefix convention to route to different providers. Prefixless
          or <code>openai/</code> prefixed models go to OpenAI directly. <code>azure/</code>
          routes to Azure OpenAI using the configured deployment name. <code>bedrock/</code>
          routes to AWS Bedrock using boto3 credentials. <code>vertex_ai/</code> routes to
          Vertex AI using GCP Application Default Credentials. <code>ollama/</code> routes
          to a local Ollama instance. The model string after the prefix is the provider-specific
          model identifier — no code change is needed to switch providers, only the model string.
        </p>
      </ConceptBlock>

      <SDKExample
        title="LiteLLM Basic Multi-Cloud Usage"
        tabs={{
          python: `import litellm
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
    print(chunk.choices[0].delta.content or "", end="", flush=True)`,
        }}
      />

      <h2>LiteLLM Proxy Server</h2>
      <p>
        The LiteLLM proxy runs as a standalone server that exposes an OpenAI-compatible
        REST API. Your applications call <code>http://localhost:4000/v1/chat/completions</code>
        using the standard OpenAI SDK — and the proxy handles routing, auth, rate limiting,
        cost tracking, and fallbacks transparently.
      </p>

      <CodeBlock language="yaml" filename="litellm_config.yaml">
{`# litellm_config.yaml — proxy server configuration
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
  spend_logs_url: os.environ/DATABASE_URL`}
      </CodeBlock>

      <CodeBlock language="bash" filename="start_proxy.sh">
{`# Install and start the proxy
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
  --config /app/config.yaml --port 4000`}
      </CodeBlock>

      <h2>Calling the Proxy with Standard OpenAI SDK</h2>

      <CodeBlock language="python" filename="use_litellm_proxy.py">
{`from openai import OpenAI

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
print(embeddings.data[0].embedding[:5])`}
      </CodeBlock>

      <h2>Failover and Load Balancing Patterns</h2>

      <SDKExample
        title="Programmatic Failover with LiteLLM Router"
        tabs={{
          python: `from litellm import Router

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

asyncio.run(track_daily_spend())`,
        }}
      />

      <PatternBlock
        name="Cost-Aware Routing with Budget Guards"
        category="Cost Management"
        whenToUse="When you want to automatically downgrade to cheaper models as you approach budget thresholds — e.g., use Claude 3.5 Sonnet for the first $500/day of spend, then switch to Claude 3 Haiku for the remainder."
      >
        <p>
          Implement a middleware layer that tracks running costs against daily/monthly budgets.
          When spend crosses a threshold, the middleware changes the model string before
          forwarding to LiteLLM. Combine this with LiteLLM's built-in budget limiting
          (<code>max_budget</code> per API key in the proxy) for defense in depth. Log
          all model routing decisions for cost attribution and chargeback reporting.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Vendor Lock-In Mitigation">
        <p>
          Keep provider-specific logic (auth setup, credential refresh, region configuration)
          in a separate configuration layer, never mixed into your business logic. Use
          LiteLLM's OpenAI-compatible interface as your only point of contact with LLMs.
          Maintain an eval suite that runs against all supported providers — this detects
          behavioral differences between models early, before they affect production.
          When adopting provider-specific features (e.g., Azure Assistants API, Bedrock
          Agents, Vertex Agent Builder), wrap them in an interface so they can be swapped
          without changing calling code.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="LiteLLM Proxy in Production">
        <p>
          Run the LiteLLM proxy as a Kubernetes deployment with at least 3 replicas and a
          PostgreSQL backend for spend tracking. Use Redis for response caching and rate
          limit coordination across replicas. Set resource limits (CPU: 1 core, Memory: 2Gi
          per replica) — the proxy is mostly I/O bound and does not need large allocations.
          Enable the <code>/health</code> endpoint and configure liveness/readiness probes
          to automatically restart unhealthy replicas.
        </p>
      </NoteBlock>

      <NoteBlock type="warning" title="Response Format Differences">
        <p>
          While LiteLLM normalizes the response schema, there are subtle behavioral
          differences between providers that your application must handle: Claude returns
          stop reasons as <code>end_turn</code> vs OpenAI's <code>stop</code>; Gemini
          may return multiple candidates while others return one; tool call argument
          formats differ in edge cases with nested objects. Always test your agent's
          tool parsing logic against all target providers, not just the primary.
        </p>
      </NoteBlock>
    </article>
  )
}
