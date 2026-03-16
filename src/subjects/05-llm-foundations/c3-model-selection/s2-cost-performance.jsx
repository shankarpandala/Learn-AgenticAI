import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'

export default function CostPerformance() {
  return (
    <article className="prose-content">
      <h2>Cost &amp; Performance</h2>
      <p>
        LLM API costs scale with token volume. At low request rates costs are negligible, but
        agentic systems that run thousands of tool-use loops per day can incur significant bills.
        Understanding token pricing, caching, batching, and model routing is essential for
        building economically viable production systems.
      </p>

      <ConceptBlock term="Token Pricing">
        <p>
          Most LLM APIs charge separately for input tokens (prompt + context) and output tokens
          (generated response). Output tokens are typically 3–5x more expensive than input tokens
          because generation is auto-regressive and cannot be parallelised as efficiently as
          prompt processing. Costs are quoted per million tokens ($/MTok).
        </p>
      </ConceptBlock>

      <h2>Pricing Reference (March 2025)</h2>
      <p>Prices change frequently — always check provider pricing pages for current rates.</p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold">Input ($/MTok)</th>
              <th className="px-4 py-3 text-left font-semibold">Output ($/MTok)</th>
              <th className="px-4 py-3 text-left font-semibold">Cache Read ($/MTok)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Claude 3.7 Sonnet', '$3.00', '$15.00', '$0.30'],
              ['Claude 3.5 Haiku', '$0.80', '$4.00', '$0.08'],
              ['GPT-4o', '$2.50', '$10.00', '$1.25'],
              ['GPT-4o mini', '$0.15', '$0.60', '$0.075'],
              ['Gemini 1.5 Pro', '$1.25', '$5.00', '$0.3125'],
              ['Gemini 2.0 Flash', '$0.10', '$0.40', '$0.025'],
              ['o3 (high)', '$10.00', '$40.00', 'N/A'],
            ].map(([model, input, output, cache]) => (
              <tr key={model}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{model}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{input}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{output}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{cache}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Cost Estimation</h2>

      <SDKExample
        title="Estimating and Tracking API Costs"
        tabs={{
          python: `import anthropic
from dataclasses import dataclass, field

client = anthropic.Anthropic()

# Token pricing per million tokens (update these when pricing changes)
PRICING = {
    "claude-opus-4-6": {"input": 3.00, "output": 15.00, "cache_read": 0.30, "cache_write": 3.75},
    "claude-sonnet-4-6": {"input": 3.00, "output": 15.00, "cache_read": 0.30, "cache_write": 3.75},
    "claude-haiku-4-5-20251001": {"input": 0.80, "output": 4.00, "cache_read": 0.08, "cache_write": 1.00},
}

@dataclass
class CostTracker:
    model: str
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    total_cache_read_tokens: int = 0
    total_cache_write_tokens: int = 0
    request_count: int = 0

    def record(self, usage) -> None:
        self.total_input_tokens += usage.input_tokens
        self.total_output_tokens += usage.output_tokens
        self.total_cache_read_tokens += getattr(usage, "cache_read_input_tokens", 0)
        self.total_cache_write_tokens += getattr(usage, "cache_creation_input_tokens", 0)
        self.request_count += 1

    def total_cost_usd(self) -> float:
        p = PRICING.get(self.model, {"input": 3.0, "output": 15.0, "cache_read": 0.30, "cache_write": 3.75})
        return (
            self.total_input_tokens * p["input"] / 1_000_000
            + self.total_output_tokens * p["output"] / 1_000_000
            + self.total_cache_read_tokens * p["cache_read"] / 1_000_000
            + self.total_cache_write_tokens * p["cache_write"] / 1_000_000
        )

    def summary(self) -> str:
        return (
            f"Requests: {self.request_count}\\n"
            f"Input tokens: {self.total_input_tokens:,}\\n"
            f"Output tokens: {self.total_output_tokens:,}\\n"
            f"Cache reads: {self.total_cache_read_tokens:,}\\n"
            f"Estimated cost: \${self.total_cost_usd():.4f}"
        )

tracker = CostTracker(model="claude-opus-4-6")

def tracked_create(**kwargs):
    response = client.messages.create(**kwargs)
    tracker.record(response.usage)
    return response

# Use like normal — costs accumulate automatically
response = tracked_create(
    model="claude-opus-4-6",
    max_tokens=512,
    messages=[{"role": "user", "content": "Explain transformer attention."}],
)
print(tracker.summary())`,
        }}
      />

      <h2>Prompt Caching for Cost Reduction</h2>
      <p>
        Prompt caching stores the KV state of a large, stable prefix so subsequent requests
        can reuse it at a 90% discount. This is the single highest-impact cost optimisation
        for workloads that repeatedly inject the same system prompt or large reference document.
      </p>

      <SDKExample
        title="Prompt Caching — Measuring the Savings"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

LARGE_REFERENCE = "..." * 50_000  # ~50K token document

system = [
    {"type": "text", "text": "You are a document analyst."},
    {
        "type": "text",
        "text": LARGE_REFERENCE,
        "cache_control": {"type": "ephemeral"},  # Cache this prefix
    },
]

questions = [
    "What is the main argument in section 3?",
    "List the key recommendations.",
    "What methodology was used?",
    "What are the limitations acknowledged by the authors?",
]

total_input_cost = 0.0
total_cache_savings = 0.0

for q in questions:
    resp = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system=system,
        messages=[{"role": "user", "content": q}],
    )
    usage = resp.usage
    cache_reads = getattr(usage, "cache_read_input_tokens", 0)
    cache_writes = getattr(usage, "cache_creation_input_tokens", 0)

    # Without caching, all input tokens would cost $3.00/MTok
    # With caching, cached reads cost $0.30/MTok (90% less)
    full_price = usage.input_tokens * 3.00 / 1_000_000
    actual_price = (
        (usage.input_tokens - cache_reads) * 3.00 / 1_000_000
        + cache_reads * 0.30 / 1_000_000
        + cache_writes * 3.75 / 1_000_000
    )
    total_input_cost += full_price
    total_cache_savings += full_price - actual_price
    print(f"Q: {q[:40]}... cache_reads={cache_reads}")

print(f"\\nTotal would-be cost: \${total_input_cost:.4f}")
print(f"Savings from caching: \${total_cache_savings:.4f} ({100*total_cache_savings/total_input_cost:.0f}%)")`,
        }}
      />

      <h2>Batch Processing</h2>
      <p>
        Anthropic's Message Batches API allows you to submit up to 10,000 requests at once and
        receive results within 24 hours at a 50% cost discount. This is ideal for offline
        processing workloads: evaluation runs, data enrichment, document classification.
      </p>

      <SDKExample
        title="Message Batches API"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

# Prepare batch requests
documents = ["Doc 1 text...", "Doc 2 text...", "Doc 3 text..."]

batch_requests = [
    {
        "custom_id": f"doc-{i}",
        "params": {
            "model": "claude-opus-4-6",
            "max_tokens": 256,
            "messages": [{
                "role": "user",
                "content": f"Classify the topic of this document in one word:\\n\\n{doc}"
            }]
        }
    }
    for i, doc in enumerate(documents)
]

# Submit the batch (50% cheaper than individual requests)
batch = client.beta.messages.batches.create(requests=batch_requests)
print(f"Batch ID: {batch.id}, Status: {batch.processing_status}")

# Poll for completion (or use a webhook)
import time
while batch.processing_status == "in_progress":
    time.sleep(60)
    batch = client.beta.messages.batches.retrieve(batch.id)

# Retrieve results
results = {}
for result in client.beta.messages.batches.results(batch.id):
    if result.result.type == "succeeded":
        results[result.custom_id] = result.result.message.content[0].text

print(results)`,
        }}
      />

      <PatternBlock
        name="Model Routing"
        category="Cost Optimisation"
        whenToUse="When your workload has a bimodal distribution: many simple requests and fewer complex ones. Routing can cut costs by 60–80%."
      >
        <p>
          Use a cheap, fast model to classify request complexity, then route to the appropriate
          model tier. Simple requests (classification, short extraction) go to a cheap model;
          complex requests (multi-step reasoning, long generation) go to the powerful model.
        </p>
        <SDKExample
          title="Complexity-Based Model Router"
          tabs={{
            python: `import anthropic

client = anthropic.Anthropic()

CHEAP_MODEL = "claude-haiku-4-5-20251001"   # $0.80/$4.00 per MTok
POWERFUL_MODEL = "claude-opus-4-6"           # $3.00/$15.00 per MTok

def classify_complexity(user_message: str) -> str:
    """Returns 'simple' or 'complex'."""
    response = client.messages.create(
        model=CHEAP_MODEL,
        max_tokens=8,
        system=(
            "Classify requests as 'simple' (factual lookup, classification, "
            "short extraction) or 'complex' (reasoning, code generation, "
            "multi-step analysis). Reply with exactly one word."
        ),
        messages=[{"role": "user", "content": user_message}],
    )
    label = response.content[0].text.strip().lower()
    return "complex" if "complex" in label else "simple"

def route(user_message: str) -> str:
    complexity = classify_complexity(user_message)
    model = CHEAP_MODEL if complexity == "simple" else POWERFUL_MODEL
    print(f"Routing to {model} (complexity={complexity})")

    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text

# Simple → cheap model
print(route("What is the capital of France?"))
# Complex → powerful model
print(route("Design a distributed rate limiter with Redis and explain the trade-offs."))`,
          }}
        />
      </PatternBlock>

      <BestPracticeBlock title="Cost Optimisation Checklist">
        <ul>
          <li>Enable prompt caching for any system prompt or reference document larger than 1,024 tokens.</li>
          <li>Use the Batches API for any offline workload — 50% discount with 24-hour turnaround.</li>
          <li>Implement model routing to use cheap models for simple tasks and powerful models only where needed.</li>
          <li>Track input and output tokens per request in your observability stack — identify expensive request patterns.</li>
          <li>Trim unnecessary context from prompts: remove redundant instructions, prune conversation history aggressively.</li>
          <li>Set <code>max_tokens</code> to the minimum sufficient for the task — unused token budget still costs nothing, but overshooting can inflate output length.</li>
          <li>Consider fine-tuned smaller models for narrow, high-volume tasks — a fine-tuned 7B can outperform GPT-4 on specific domains at 100x lower cost.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="The 80/20 Rule for LLM Costs">
        <p>
          In most production systems, 20% of request types account for 80% of token spend.
          Log your token usage per request type for one week, identify the top 3 most expensive
          patterns, and target those specifically: add caching, switch to a cheaper model, or
          reduce context size. This focused approach typically cuts total spend by 40–60%
          without degrading quality on the important paths.
        </p>
      </NoteBlock>
    </article>
  )
}
