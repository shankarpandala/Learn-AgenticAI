import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function AmazonBedrock() {
  return (
    <article className="prose-content">
      <h2>Amazon Bedrock: Unified Foundation Model Service</h2>
      <p>
        Amazon Bedrock is a fully managed service that provides access to high-performance
        foundation models from Amazon and third-party providers through a single, unified API.
        You never manage model infrastructure — Bedrock handles provisioning, scaling, and
        availability. Models are accessed via the AWS SDK (boto3), and all calls stay within
        the AWS network, making Bedrock suitable for enterprise workloads with strict data
        residency and compliance requirements.
      </p>

      <ConceptBlock term="Foundation Model Catalog">
        <p>
          Bedrock hosts models from multiple providers under a single API surface. Each model
          has a unique <strong>model ID</strong> used in API calls. Model availability varies
          by AWS region; cross-region inference profiles allow automatic failover and load
          balancing across regions. Key models include:
        </p>
        <ul>
          <li><strong>Claude 3.5 Sonnet v2</strong> — <code>anthropic.claude-3-5-sonnet-20241022-v2:0</code> — Anthropic's most capable and cost-effective model for complex reasoning</li>
          <li><strong>Llama 3.1 70B Instruct</strong> — <code>meta.llama3-1-70b-instruct-v1:0</code> — Meta's open-weight model for instruction following</li>
          <li><strong>Mistral Large</strong> — <code>mistral.mistral-large-2402-v1:0</code> — Mistral's flagship model for multilingual tasks</li>
          <li><strong>Amazon Nova Pro</strong> — <code>amazon.nova-pro-v1:0</code> — Amazon's multimodal model optimized for cost/performance</li>
          <li><strong>Titan Embeddings v2</strong> — <code>amazon.titan-embed-text-v2:0</code> — Amazon's text embedding model, 1024 dimensions</li>
        </ul>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Amazon Bedrock: Unified Model Access Layer"
        width={680}
        height={320}
        nodes={[
          { id: 'app', label: 'Your Application', type: 'external', x: 80, y: 160 },
          { id: 'bedrock', label: 'Amazon Bedrock\n(Converse API)', type: 'agent', x: 260, y: 160 },
          { id: 'guardrails', label: 'Guardrails', type: 'tool', x: 260, y: 60 },
          { id: 'anthropic', label: 'Anthropic\nClaude', type: 'llm', x: 460, y: 80 },
          { id: 'meta', label: 'Meta\nLlama', type: 'llm', x: 460, y: 160 },
          { id: 'amazon', label: 'Amazon\nNova/Titan', type: 'llm', x: 460, y: 240 },
          { id: 'mistral', label: 'Mistral', type: 'llm', x: 600, y: 120 },
          { id: 'logs', label: 'CloudWatch\nLogs', type: 'store', x: 600, y: 240 },
        ]}
        edges={[
          { from: 'app', to: 'bedrock', label: 'boto3' },
          { from: 'bedrock', to: 'guardrails', label: 'filter' },
          { from: 'bedrock', to: 'anthropic' },
          { from: 'bedrock', to: 'meta' },
          { from: 'bedrock', to: 'amazon' },
          { from: 'anthropic', to: 'mistral' },
          { from: 'bedrock', to: 'logs', label: 'audit' },
        ]}
      />

      <h2>The Converse API</h2>
      <p>
        The <strong>Converse API</strong> is Bedrock's unified multi-turn conversation interface.
        Unlike the older <code>InvokeModel</code> API (which required model-specific request/response
        schemas), Converse provides a single normalized interface for messages, tool use, and
        streaming that works across all supported models. This is the recommended API for all
        new Bedrock integrations.
      </p>

      <ConceptBlock term="Converse API vs InvokeModel">
        <p>
          <code>InvokeModel</code> requires you to serialize/deserialize model-specific JSON bodies —
          Claude uses <code>anthropic_version</code>, Llama uses its own prompt format, etc.
          <code>Converse</code> abstracts all of this: you send a standard <code>messages</code>
          array and receive a standard <code>output.message</code>. Tool use (function calling)
          is also normalized — you define tools once and Bedrock handles the model-specific
          formatting. Switching models requires only changing the <code>modelId</code>.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Amazon Bedrock: Basic Invoke and Converse API"
        tabs={{
          python: `import boto3
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
    # -> {"city": "Seattle"}`,
        }}
      />

      <h2>Streaming with ConverseStream</h2>
      <p>
        For real-time response delivery, use <code>converse_stream</code>. Bedrock returns
        an event stream that you iterate over. The stream emits <code>contentBlockDelta</code>
        events for text chunks, <code>messageStart</code>/<code>messageStop</code> bookends,
        and <code>metadata</code> for token usage.
      </p>

      <CodeBlock language="python" filename="bedrock_streaming.py">
{`import boto3

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
        print(f"Tokens — in: {usage.get('inputTokens')}, out: {usage.get('outputTokens')}")`}
      </CodeBlock>

      <h2>Throughput Modes</h2>

      <ConceptBlock term="On-Demand vs Provisioned Throughput">
        <p>
          Bedrock offers two throughput modes. <strong>On-demand</strong> is pay-per-token with
          no commitment — ideal for development and variable workloads. Each request competes
          for shared capacity; you may encounter throttling (HTTP 429) at high concurrency.
          <strong>Provisioned throughput</strong> (also called Model Units, or MUs) reserves
          dedicated model capacity for 1-month or 6-month terms. One MU for Claude 3.5 Sonnet
          guarantees a specific tokens-per-minute rate. Use provisioned throughput for latency-sensitive
          production applications with predictable traffic.
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="bedrock_provisioned.py">
{`import boto3

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
)`}
      </CodeBlock>

      <h2>Cross-Region Inference Profiles</h2>
      <p>
        Cross-region inference profiles are special model IDs prefixed with a geographic
        identifier (<code>us.</code>, <code>eu.</code>). When you use a cross-region profile,
        Bedrock automatically routes your request to the region with available capacity,
        providing higher throughput limits and automatic failover.
      </p>

      <CodeBlock language="python" filename="cross_region_inference.py">
{`# Cross-region profile: Bedrock routes across us-east-1, us-west-2, etc.
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
print(response["ResponseMetadata"]["HTTPHeaders"].get("x-amzn-bedrock-invocation-region"))`}
      </CodeBlock>

      <PatternBlock
        name="Model Abstraction with Converse API"
        category="Portability"
        whenToUse="When you need to switch between models (A/B testing, cost optimization, model upgrades) without rewriting application code."
      >
        <p>
          Build your application against the Converse API with <code>modelId</code> as a
          configuration parameter. Because Converse normalizes request/response schemas, you
          can switch from Claude to Nova Pro to Llama by changing a single string. This also
          enables model routing strategies: route complex tasks to Claude, simple tasks to
          Nova Lite for cost savings, and use cross-region profiles for high-throughput workloads.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Exponential Backoff for Throttling">
        <p>
          On-demand Bedrock calls will return <code>ThrottlingException</code> under high load.
          Always wrap Bedrock calls with retry logic using exponential backoff. The AWS SDK's
          built-in retry config handles this: set <code>retries=&#123;'max_attempts': 5, 'mode': 'adaptive'&#125;</code>
          in your boto3 config. For provisioned throughput, throttling should not occur under
          normal load — if it does, you need more Model Units.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Data Privacy and Model Training">
        <p>
          By default, Amazon Bedrock does not use your prompts or responses to train foundation
          models. Data is encrypted in transit (TLS) and at rest. You can enable VPC endpoints
          to keep all traffic private within your AWS network. For regulated industries, Bedrock
          supports AWS PrivateLink, AWS CloudTrail audit logging, and AWS Macie for data governance.
        </p>
      </NoteBlock>

      <NoteBlock type="tip" title="Embedding Models for RAG">
        <p>
          For RAG pipelines, <code>amazon.titan-embed-text-v2:0</code> produces 1024-dimensional
          embeddings and supports dimensions reduction (256, 512) for storage optimization.
          Call it via <code>invoke_model</code> with <code>&#123;"inputText": "...", "dimensions": 1024, "normalize": true&#125;</code>.
          The normalized flag ensures cosine similarity works correctly. Titan Embeddings v2
          supports up to 8192 input tokens.
        </p>
      </NoteBlock>
    </article>
  )
}
