import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function CostReliability() {
  return (
    <article className="prose-content">
      <h2>Cost and Reliability Metrics for Agents</h2>

      <p>
        Capability metrics — can the agent complete the task? — get most of the attention, but
        production agents live or die on cost and reliability. A research prototype that completes
        80% of tasks but costs $5 per run and fails unpredictably cannot be deployed at scale.
        Building economically viable, reliably operating agents requires measuring the right
        metrics, setting targets before deployment, and continuously monitoring against those
        targets in production.
      </p>

      <ConceptBlock term="Agent Cost Model">
        The cost of running an agent is primarily driven by token consumption across all API calls
        in a trajectory. Input tokens cost less than output tokens, but agents with long context
        windows accumulate large input costs as the conversation history grows. Secondary costs
        include tool execution (external API calls, compute for code execution), infrastructure
        (storage, networking), and human review time for tasks requiring oversight. A complete
        cost model accounts for all of these.
      </ConceptBlock>

      <h2>Token Usage Metrics</h2>

      <p>
        Token consumption is the dominant cost driver for LLM agents. Measuring it accurately
        requires tracking both prompt tokens (input) and completion tokens (output) across every
        API call in a trajectory, not just the final call. Tools that return large results, long
        system prompts, and accumulated conversation history all contribute to prompt token costs.
      </p>

      <h3>Key Token Metrics to Track</h3>
      <ul>
        <li><strong>Total tokens per task:</strong> Sum of input + output tokens across all agent steps for a completed task. This is your primary cost-per-task driver.</li>
        <li><strong>Tokens per step:</strong> Average tokens consumed at each agent loop iteration. Spikes indicate abnormally large tool results or unnecessarily verbose reasoning.</li>
        <li><strong>Input/output ratio:</strong> The ratio of input tokens to output tokens. An increasing ratio over time may indicate context window bloat from accumulated history.</li>
        <li><strong>Step count distribution:</strong> How many steps does the agent take per task? A bimodal distribution — many simple tasks and some very long tasks — indicates a subpopulation of hard cases that may warrant special handling.</li>
      </ul>

      <SDKExample
        title="Tracking Token Usage and Cost Across Agent Runs"
        tabs={{
          python: `import json
from dataclasses import dataclass, field
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Cost configuration (update when pricing changes)
# ---------------------------------------------------------------------------

# Prices per million tokens (claude-opus-4-6 pricing as example)
PRICE_PER_M_INPUT_TOKENS = 15.00   # USD
PRICE_PER_M_OUTPUT_TOKENS = 75.00  # USD

def tokens_to_usd(input_tokens: int, output_tokens: int) -> float:
    return (
        input_tokens / 1_000_000 * PRICE_PER_M_INPUT_TOKENS
        + output_tokens / 1_000_000 * PRICE_PER_M_OUTPUT_TOKENS
    )

# ---------------------------------------------------------------------------
# Metrics accumulator
# ---------------------------------------------------------------------------

@dataclass
class AgentRunMetrics:
    task: str
    steps: int = 0
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    tool_calls: int = 0
    errors: int = 0
    success: bool | None = None
    per_step: list[dict] = field(default_factory=list)

    @property
    def total_tokens(self) -> int:
        return self.total_input_tokens + self.total_output_tokens

    @property
    def cost_usd(self) -> float:
        return tokens_to_usd(self.total_input_tokens, self.total_output_tokens)

    def record_step(self, step: int, input_tokens: int, output_tokens: int, tool_calls_this_step: int):
        self.steps = step
        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens
        self.tool_calls += tool_calls_this_step
        self.per_step.append({
            "step": step,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "tool_calls": tool_calls_this_step,
            "running_cost": self.cost_usd,
        })

    def summary(self) -> dict:
        return {
            "task": self.task[:80],
            "success": self.success,
            "steps": self.steps,
            "tool_calls": self.tool_calls,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_tokens": self.total_tokens,
            "cost_usd": round(self.cost_usd, 6),
            "errors": self.errors,
            "avg_tokens_per_step": round(self.total_tokens / max(self.steps, 1)),
        }

# ---------------------------------------------------------------------------
# Agent with instrumented loop
# ---------------------------------------------------------------------------

TOOLS = [
    {
        "name": "web_search",
        "description": "Search the web for current information on a topic.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Search query"}},
            "required": ["query"]
        }
    }
]

def fake_web_search(query: str) -> str:
    """Simulated tool — replace with real implementation."""
    return f"Search results for '{query}': [simulated results for demonstration]"

def run_instrumented_agent(task: str, max_steps: int = 10) -> AgentRunMetrics:
    """Agent loop that records detailed token usage metrics at every step."""
    metrics = AgentRunMetrics(task=task)
    messages = [{"role": "user", "content": task}]

    for step in range(1, max_steps + 1):
        try:
            response = client.messages.create(
                model="claude-opus-4-6",
                max_tokens=1024,
                tools=TOOLS,
                messages=messages,
            )
        except Exception as e:
            metrics.errors += 1
            print(f"Step {step} API error: {e}")
            break

        # Count tool calls this step
        tool_calls_this_step = sum(1 for b in response.content if b.type == "tool_use")

        # Record usage (available in response.usage)
        metrics.record_step(
            step=step,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            tool_calls_this_step=tool_calls_this_step,
        )

        messages.append({"role": "assistant", "content": response.content})

        # Budget guard: stop if this run is getting expensive
        if metrics.cost_usd > 0.50:
            print(f"Cost budget exceeded at step {step}: \${metrics.cost_usd:.4f}")
            metrics.success = False
            break

        if response.stop_reason == "end_turn":
            metrics.success = True
            break

        # Execute tools
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                if block.name == "web_search":
                    result = fake_web_search(**block.input)
                else:
                    result = json.dumps({"error": "unknown tool"})
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })
        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    return metrics


# Run a task and inspect metrics
metrics = run_instrumented_agent(
    "What are the top 3 Python web frameworks by GitHub stars?"
)
print(json.dumps(metrics.summary(), indent=2))
print(f"\\nPer-step breakdown:")
for s in metrics.per_step:
    print(f"  Step {s['step']}: {s['input_tokens']}in + {s['output_tokens']}out "
          f"= {s['input_tokens']+s['output_tokens']} tokens, "
          f"running cost \${s['running_cost']:.5f}")`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Prices per million tokens
const PRICE_PER_M_INPUT = 15.0;
const PRICE_PER_M_OUTPUT = 75.0;

function tokensToCost(input: number, output: number): number {
  return (input / 1_000_000) * PRICE_PER_M_INPUT + (output / 1_000_000) * PRICE_PER_M_OUTPUT;
}

interface StepMetric {
  step: number;
  inputTokens: number;
  outputTokens: number;
  toolCalls: number;
  runningCost: number;
}

class AgentRunMetrics {
  task: string;
  steps = 0;
  totalInputTokens = 0;
  totalOutputTokens = 0;
  toolCalls = 0;
  errors = 0;
  success: boolean | null = null;
  perStep: StepMetric[] = [];

  constructor(task: string) { this.task = task; }

  get totalTokens() { return this.totalInputTokens + this.totalOutputTokens; }
  get costUsd() { return tokensToCost(this.totalInputTokens, this.totalOutputTokens); }

  recordStep(step: number, input: number, output: number, calls: number) {
    this.steps = step;
    this.totalInputTokens += input;
    this.totalOutputTokens += output;
    this.toolCalls += calls;
    this.perStep.push({ step, inputTokens: input, outputTokens: output, toolCalls: calls, runningCost: this.costUsd });
  }

  summary() {
    return {
      task: this.task.slice(0, 80),
      success: this.success,
      steps: this.steps,
      toolCalls: this.toolCalls,
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalTokens: this.totalTokens,
      costUsd: Math.round(this.costUsd * 1_000_000) / 1_000_000,
      errors: this.errors,
      avgTokensPerStep: Math.round(this.totalTokens / Math.max(this.steps, 1)),
    };
  }
}

const tools: Anthropic.Tool[] = [{
  name: "web_search",
  description: "Search the web for current information.",
  input_schema: {
    type: "object" as const,
    properties: { query: { type: "string", description: "Search query" } },
    required: ["query"],
  },
}];

function fakeWebSearch(query: string): string {
  return Search results for '\${query}': [simulated results];
}

async function runInstrumentedAgent(task: string, maxSteps = 10): Promise<AgentRunMetrics> {
  const metrics = new AgentRunMetrics(task);
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: task }];

  for (let step = 1; step <= maxSteps; step++) {
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({ model: "claude-opus-4-6", max_tokens: 1024, tools, messages });
    } catch (err) {
      metrics.errors++;
      console.error(Step \${step} error:, err);
      break;
    }

    const toolCallCount = response.content.filter((b) => b.type === "tool_use").length;
    metrics.recordStep(step, response.usage.input_tokens, response.usage.output_tokens, toolCallCount);
    messages.push({ role: "assistant", content: response.content });

    if (metrics.costUsd > 0.5) {
      console.log(Cost budget exceeded at step \${step}: $\${metrics.costUsd.toFixed(4)});
      metrics.success = false;
      break;
    }

    if (response.stop_reason === "end_turn") { metrics.success = true; break; }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inp = block.input as { query: string };
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: fakeWebSearch(inp.query) });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
  }
  return metrics;
}

async function main() {
  const metrics = await runInstrumentedAgent("What are the top 3 Python web frameworks by GitHub stars?");
  console.log(JSON.stringify(metrics.summary(), null, 2));
  console.log("\\nPer-step breakdown:");
  for (const s of metrics.perStep) {
    console.log(  Step \${s.step}: \${s.inputTokens}in + \${s.outputTokens}out = \${s.inputTokens + s.outputTokens} tokens, $\${s.runningCost.toFixed(5)});
  }
}

main();`
        }}
      />

      <h2>Latency Metrics</h2>

      <p>
        Agent latency is the wall-clock time from when a user submits a task to when the agent
        delivers a final result. It compounds across steps: each step adds LLM inference time,
        network round-trip time, and tool execution time. For a 10-step agent, a 2-second LLM
        call per step plus 500ms of tool execution means 25 seconds of minimum latency — before
        accounting for variation in tool response times.
      </p>

      <h3>Latency Components</h3>
      <ul>
        <li><strong>Time to first token (TTFT):</strong> Latency until the model begins responding. Relevant for streaming agents where users see reasoning as it is generated.</li>
        <li><strong>Step latency:</strong> Time per agent loop iteration. This is the primary lever for overall task latency.</li>
        <li><strong>Tool execution latency:</strong> Time spent waiting for tool results. External API calls, database queries, and code execution all contribute. Can often be parallelized.</li>
        <li><strong>Total task latency:</strong> End-to-end time from task submission to final answer. The metric users actually experience.</li>
      </ul>

      <h2>Failure Rate Metrics</h2>

      <p>
        Agents fail in several distinct ways, each requiring different remediation. Tracking
        failure rates by category reveals which types of failures are most common and most
        impactful.
      </p>

      <h3>Failure Categories</h3>
      <ul>
        <li><strong>Task failure:</strong> The agent completed without error but produced an incorrect or incomplete answer. Measured by accuracy evaluation against ground truth.</li>
        <li><strong>Max-step termination:</strong> The agent hit the iteration limit without completing the task. Almost always indicates a reasoning or tool loop issue.</li>
        <li><strong>Tool error rate:</strong> The fraction of tool calls that return error responses rather than valid results. A high rate indicates flaky tools or incorrect argument construction.</li>
        <li><strong>API error rate:</strong> Failures due to LLM API timeouts, rate limits, or server errors. Should be near zero in production with proper retry logic.</li>
        <li><strong>Budget exhaustion:</strong> The agent exceeded its token or cost budget. Indicates tasks that are more complex than anticipated or runaway loops.</li>
      </ul>

      <PatternBlock
        name="Cost Budget Guard"
        category="Reliability"
        description="Implement a per-task cost budget that terminates the agent if cumulative spend exceeds a threshold. Calculate running cost after each step using the token counts in the API response. Return a partial result with a clear explanation when the budget is exceeded. This prevents runaway tasks from consuming unexpected costs and is a critical production safety mechanism."
        when={[
          "Any agent deployed in production with real API costs",
          "Agents that may encounter unexpectedly complex tasks",
          "Multi-tenant systems where per-user cost control is required"
        ]}
        avoid={[
          "Setting the budget so low that legitimate tasks are frequently truncated",
          "Terminating without returning a partial result and explanation",
          "Using step count alone without considering variable per-step costs"
        ]}
      />

      <h2>Setting Cost and Reliability SLOs</h2>

      <p>
        Service Level Objectives (SLOs) for agents should be defined before deployment and
        monitored continuously in production. Typical targets depend heavily on the use case,
        but common benchmarks include:
      </p>

      <ul>
        <li><strong>Task success rate:</strong> The percentage of tasks completed correctly. Target depends on stakes — 95% may be acceptable for low-stakes research tasks, 99.9%+ required for financial operations.</li>
        <li><strong>p95 latency:</strong> The 95th percentile of task completion time. Mean latency is misleading because agent latency distributions have long tails driven by complex tasks.</li>
        <li><strong>p95 cost per task:</strong> The 95th percentile of per-task cost. Like latency, cost distributions have long tails that the mean obscures.</li>
        <li><strong>Max-step termination rate:</strong> Should be below 1–2% in a healthy agent. Higher rates indicate systematic issues with task coverage or tool reliability.</li>
      </ul>

      <BestPracticeBlock title="Track the 95th percentile, not the mean">
        Agent costs and latencies are not normally distributed. A small fraction of tasks —
        the hardest, most ambiguous, or most tool-intensive — consume dramatically more tokens
        and time than typical tasks. Mean metrics look fine right up until a complex task
        triggers a runaway loop. Track the 95th and 99th percentiles of both cost and latency,
        set budget guards accordingly, and investigate outliers proactively.
      </BestPracticeBlock>

      <h2>Caching for Cost Reduction</h2>

      <p>
        Prompt caching dramatically reduces the cost of repeated agent invocations that share
        a common prefix — typically the system prompt and static tool definitions. If your
        system prompt and tool schemas are 2,000 tokens and you run 10,000 agent tasks per day,
        prompt caching eliminates 20 million input tokens of cost daily. Most LLM providers
        offer prompt caching for repeated prefixes longer than a few hundred tokens.
      </p>

      <WarningBlock title="Cached token prices differ from standard prices">
        When using prompt caching, cache write requests cost more per token than standard
        requests to prime the cache. Cache read requests cost less. Your cost model must account
        for both the cache hit rate and the different pricing. On high-volume deployments where
        the same system prompt is reused frequently, caching typically reduces costs by 60–80%
        on the cached portions, but the savings only materialize if your implementation correctly
        structures requests to maximize cache hits.
      </WarningBlock>

      <NoteBlock title="Cost and quality trade-offs are real">
        Cheaper, faster models cost less per token but may require more steps to complete the
        same task, partially offsetting the per-token savings. More capable models often complete
        tasks in fewer steps with lower failure rates. Benchmark your specific task distribution
        across model tiers before assuming a cheaper model reduces total cost — the relationship
        between model capability, step count, and final task success rate is non-linear and
        workload-dependent.
      </NoteBlock>
    </article>
  )
}
