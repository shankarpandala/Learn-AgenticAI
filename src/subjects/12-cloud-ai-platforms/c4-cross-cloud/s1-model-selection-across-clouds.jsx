import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function ModelSelectionAcrossClouds() {
  return (
    <article className="prose-content">
      <h2>Choosing Cloud Models: A Decision Framework</h2>
      <p>
        Picking the right managed model is not just about benchmark scores — it is an
        engineering decision that spans cost, latency, compliance, context window requirements,
        multimodal capability, and operational maturity. This section provides a structured
        framework for evaluating Azure OpenAI, Amazon Bedrock, and Vertex AI models against
        your specific workload requirements.
      </p>

      <h2>Comparison Matrix</h2>

      <CodeBlock language="text" filename="model_comparison_matrix.txt">
{`DIMENSION              | Azure OpenAI GPT-4o     | Bedrock Claude 3.5 Sonnet | Vertex Gemini 1.5 Pro
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
Code interpreter       | Yes (Assistants API)    | No (use tool)             | Yes (code execution)`}
      </CodeBlock>

      <h2>Decision Flowchart</h2>

      <ArchitectureDiagram
        title="Model Selection Decision Flow"
        width={720}
        height={360}
        nodes={[
          { id: 'start', label: 'Workload\nRequirement', type: 'external', x: 80, y: 180 },
          { id: 'regulated', label: 'Regulated\nIndustry?', type: 'agent', x: 220, y: 180 },
          { id: 'azure_hipaa', label: 'Azure OpenAI\n(HIPAA/FedRAMP)', type: 'llm', x: 400, y: 80 },
          { id: 'bedrock_hipaa', label: 'Bedrock Claude\n(AWS-native infra)', type: 'llm', x: 400, y: 160 },
          { id: 'cost', label: 'Cost\nSensitive?', type: 'agent', x: 400, y: 260 },
          { id: 'gemini_flash', label: 'Gemini 2.0 Flash\nor Llama 3.1 8B', type: 'llm', x: 580, y: 200 },
          { id: 'task', label: 'Task\nType?', type: 'agent', x: 580, y: 300 },
          { id: 'coding', label: 'Claude 3.5 Sonnet\n(Bedrock)', type: 'llm', x: 720, y: 200 },
          { id: 'longctx', label: 'Gemini 1.5 Pro\n(Vertex)', type: 'llm', x: 720, y: 300 },
        ]}
        edges={[
          { from: 'start', to: 'regulated' },
          { from: 'regulated', to: 'azure_hipaa', label: 'Yes + Azure' },
          { from: 'regulated', to: 'bedrock_hipaa', label: 'Yes + AWS' },
          { from: 'regulated', to: 'cost', label: 'No' },
          { from: 'cost', to: 'gemini_flash', label: 'Yes' },
          { from: 'cost', to: 'task', label: 'No' },
          { from: 'task', to: 'coding', label: 'Coding/Analysis' },
          { from: 'task', to: 'longctx', label: 'Long Context/Video' },
        ]}
      />

      <h2>Decision Logic by Use Case</h2>

      <ConceptBlock term="Regulated Industry Workloads">
        <p>
          For HIPAA, FedRAMP, PCI DSS, or GDPR-regulated workloads, the cloud choice is
          often determined by where your existing compliance infrastructure lives. If your
          data is in Azure and you have an existing Azure BAA, use Azure OpenAI — data
          stays within the same compliance boundary. If your workload runs in AWS and you
          use AWS GovCloud or have AWS HIPAA-eligible architecture, Bedrock eliminates the
          need for an additional compliance vendor assessment. Vertex AI with VPC Service
          Controls provides the strongest data exfiltration prevention, making it preferred
          for scenarios requiring tight organizational policy enforcement.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Cost-Sensitive Workloads">
        <p>
          For high-volume, cost-sensitive workloads, Gemini 2.0 Flash at $0.075/$0.30 per
          million input/output tokens is the most economical managed option for general
          tasks. For even lower cost, deploy Llama 3.1 8B via a serverless endpoint on
          Model Garden ($0.20/$0.20) or Bedrock ($0.30/$0.60 for Llama 3.1 8B Instruct).
          The break-even point where provisioned throughput (PTU on Azure, reserved
          capacity on Bedrock) beats on-demand pricing is approximately 40–60% utilization
          of your provisioned throughput block — below that, on-demand is cheaper.
        </p>
      </ConceptBlock>

      <h2>Pricing Models Deep Dive</h2>

      <CodeBlock language="python" filename="pricing_calculator.py">
{`# Cost estimation for different deployment configurations
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
# Vertex Llama 3.1 8B:      $723/mo   ($0.0048/req)`}
      </CodeBlock>

      <h2>Context Window Optimization</h2>

      <SDKExample
        title="Context Window Strategies"
        tabs={{
          python: `# Strategy 1: Dynamic context selection based on query complexity
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
    return response.text`,
        }}
      />

      <PatternBlock
        name="Tiered Model Strategy"
        category="Cost Optimization"
        whenToUse="When your application handles queries of varying complexity — route simple queries to fast, cheap models and complex reasoning tasks to premium models to minimize cost while maintaining quality."
      >
        <p>
          Implement a classifier (can be a cheap model like Gemini 2.0 Flash or even a
          keyword heuristic) that routes queries to different tiers: Tier 1 (simple
          lookups, FAQ) → Gemini Flash or Claude Haiku; Tier 2 (analysis, summarization)
          → GPT-4o Mini or Gemini 1.5 Flash; Tier 3 (complex reasoning, code generation)
          → GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5 Pro. Typical savings of 60–80%
          vs. always using the premium model.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Provisioned Throughput vs. On-Demand">
        <p>Azure PTU (Provisioned Throughput Units) reserves model capacity for a fixed
        monthly price. One PTU for GPT-4o handles approximately 2,500 TPM. At list price,
        PTUs break even vs. on-demand at roughly 45% utilization. Before committing to PTUs,
        run on-demand for 2–4 weeks to measure actual utilization patterns. Use Azure Monitor
        to track PTU utilization and set up alerts if it drops below 30% (signal to downsize)
        or spikes above 90% (signal to add capacity or enable on-demand overflow).</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Model Version Pinning">
        <p>
          Always pin to specific model versions in production (e.g., <code>gpt-4o-2024-11-20</code>,
          <code>claude-3-5-sonnet-20241022</code>, <code>gemini-1.5-pro-002</code>) rather
          than floating aliases like <code>gpt-4o-latest</code>. Cloud providers silently
          update model aliases, which can change output format, reasoning patterns, and
          benchmark performance. Pin versions, run your eval suite before upgrading, and
          use blue/green deployment for model version rollouts.
        </p>
      </NoteBlock>

      <NoteBlock type="warning" title="Cross-Region Failover and Data Residency Conflicts">
        <p>
          Automatic cross-region failover (e.g., Azure OpenAI's "global" deployment tier)
          may violate data residency requirements by routing requests to a different
          geographic region during outages. For GDPR or data sovereignty requirements,
          always use regional deployments and handle failover at the application layer —
          fail to a second deployment in the same region or a different cloud provider
          in the same jurisdiction, not across borders.
        </p>
      </NoteBlock>
    </article>
  )
}
