import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function ModelRouting() {
  return (
    <article className="prose-content">
      <h2>Model Routing for Cost Optimisation</h2>
      <p>
        Not every agent task requires the most capable (and expensive) model. A task
        classification router can direct simple queries to fast, cheap models (Haiku,
        GPT-4o mini) while reserving complex reasoning tasks for frontier models (Opus,
        GPT-4o). With a well-tuned router, 60–80% of production traffic can be served by
        cheaper models, cutting total token cost by 40–70%.
      </p>

      <ArchitectureDiagram
        title="Model Routing Architecture"
        width={700}
        height={260}
        nodes={[
          { id: 'input', label: 'User\nQuery', type: 'external', x: 60, y: 130 },
          { id: 'router', label: 'Task\nClassifier', type: 'tool', x: 240, y: 130 },
          { id: 'simple', label: 'claude-haiku\n($)', type: 'llm', x: 460, y: 60 },
          { id: 'medium', label: 'claude-sonnet\n($$)', type: 'llm', x: 460, y: 130 },
          { id: 'complex', label: 'claude-opus\n($$$)', type: 'llm', x: 460, y: 200 },
          { id: 'output', label: 'Response', type: 'external', x: 640, y: 130 },
        ]}
        edges={[
          { from: 'input', to: 'router' },
          { from: 'router', to: 'simple', label: 'simple' },
          { from: 'router', to: 'medium', label: 'medium' },
          { from: 'router', to: 'complex', label: 'complex' },
          { from: 'simple', to: 'output' },
          { from: 'medium', to: 'output' },
          { from: 'complex', to: 'output' },
        ]}
      />

      <h2>Task Complexity Classification</h2>

      <ConceptBlock term="LLM-Based Task Router">
        <p>
          A lightweight classifier (itself an LLM call on a cheap, fast model) reads the
          user request and assigns a complexity tier: simple (factual lookup, short answer),
          medium (multi-step reasoning, tool use), or complex (deep analysis, code generation,
          long-form writing). The router adds minimal latency (50–100ms) but enables
          significant cost savings on the routed task.
        </p>
      </ConceptBlock>

      <SDKExample
        title="LLM Task Classifier for Model Routing"
        tabs={{
          python: `import anthropic
import json
from enum import Enum
from dataclasses import dataclass

client = anthropic.Anthropic()

class TaskTier(Enum):
    SIMPLE = "simple"     # Factual, short answer → Haiku
    MEDIUM = "medium"     # Multi-step, tool use → Sonnet
    COMPLEX = "complex"   # Deep analysis, code → Opus

@dataclass
class ModelRoute:
    tier: TaskTier
    model: str
    max_tokens: int
    cost_per_million_input: float  # USD

ROUTES = {
    TaskTier.SIMPLE: ModelRoute(TaskTier.SIMPLE, "claude-haiku-4-5", 1024, 0.80),
    TaskTier.MEDIUM: ModelRoute(TaskTier.MEDIUM, "claude-sonnet-4-5", 4096, 3.00),
    TaskTier.COMPLEX: ModelRoute(TaskTier.COMPLEX, "claude-opus-4-5", 8192, 15.00),
}

ROUTER_SYSTEM = """You are a task complexity classifier. Given a user query,
classify it as exactly one of: simple, medium, or complex.

simple: factual lookups, greetings, yes/no questions, simple definitions
medium: multi-step tasks, tasks requiring tool use, comparisons, summaries
complex: deep analysis, code generation, long writing, research, reasoning

Respond with JSON only: {"tier": "simple"|"medium"|"complex", "reason": "..."}"""

def classify_task(user_message: str) -> TaskTier:
    """Use a cheap, fast model to classify the task complexity."""
    response = client.messages.create(
        model="claude-haiku-4-5",  # Always use cheapest model for routing
        max_tokens=100,
        system=ROUTER_SYSTEM,
        messages=[{"role": "user", "content": user_message[:500]}],
    )
    raw = response.content[0].text.strip()
    # Strip markdown if present
    if raw.startswith(""):
        raw = raw.split("\\n", 1)[-1].rsplit("", 1)[0].strip()
    try:
        data = json.loads(raw)
        return TaskTier(data["tier"])
    except (json.JSONDecodeError, KeyError, ValueError):
        return TaskTier.MEDIUM  # Default to medium on parse failure

def run_with_routing(user_message: str, tools: list = None) -> dict:
    tier = classify_task(user_message)
    route = ROUTES[tier]

    kwargs = {
        "model": route.model,
        "max_tokens": route.max_tokens,
        "messages": [{"role": "user", "content": user_message}],
    }
    if tools and tier != TaskTier.SIMPLE:
        kwargs["tools"] = tools  # Don't offer tools to simple tier

    response = client.messages.create(**kwargs)
    total_tokens = response.usage.input_tokens + response.usage.output_tokens
    cost_usd = (response.usage.input_tokens / 1_000_000) * route.cost_per_million_input

    return {
        "response": next(b.text for b in response.content if hasattr(b, "text")),
        "tier": tier.value,
        "model": route.model,
        "tokens": total_tokens,
        "approx_cost_usd": round(cost_usd, 6),
    }`,
        }}
      />

      <h2>Cost Threshold Routing</h2>

      <ConceptBlock term="Cost-Based Cascade">
        <p>
          A cascade attempts the cheapest model first. If the response confidence is below
          a threshold (measured by self-rating or a separate evaluator), escalate to the
          next tier. This is most effective when the majority of queries are answerable
          by cheaper models and only edge cases need expensive models.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Cascade Routing: Cheap-First with Confidence Check"
        tabs={{
          python: `import anthropic
import json

client = anthropic.Anthropic()

CONFIDENCE_SYSTEM = """You answer questions and rate your own confidence.
Always respond with JSON:
{
  "answer": "<your answer>",
  "confidence": 0.0 to 1.0,
  "needs_escalation": true|false
}

Set needs_escalation=true if:
- The question requires very deep expertise
- You are uncertain about key facts
- The task requires complex multi-step reasoning you may not complete accurately"""

CASCADE_MODELS = [
    ("claude-haiku-4-5", 1024),
    ("claude-sonnet-4-5", 4096),
    ("claude-opus-4-5", 8192),
]

def run_with_cascade(user_message: str, confidence_threshold: float = 0.85) -> dict:
    """Try cheapest model first; escalate if confidence is low."""
    attempts = []

    for model, max_tokens in CASCADE_MODELS:
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=CONFIDENCE_SYSTEM,
            messages=[{"role": "user", "content": user_message}],
        )
        raw = response.content[0].text.strip()

        try:
            if raw.startswith(""):
                raw = raw.split("\\n", 1)[-1].rsplit("", 1)[0].strip()
            data = json.loads(raw)
            answer = data.get("answer", raw)
            confidence = float(data.get("confidence", 0.5))
            needs_escalation = bool(data.get("needs_escalation", False))
        except (json.JSONDecodeError, ValueError):
            answer = raw
            confidence = 0.5
            needs_escalation = True

        attempts.append({
            "model": model,
            "tokens": response.usage.input_tokens + response.usage.output_tokens,
            "confidence": confidence,
        })

        if confidence >= confidence_threshold and not needs_escalation:
            return {
                "response": answer,
                "final_model": model,
                "escalations": len(attempts) - 1,
                "attempts": attempts,
            }

    # Reached most capable model — return its answer regardless
    return {
        "response": answer,
        "final_model": CASCADE_MODELS[-1][0],
        "escalations": len(CASCADE_MODELS) - 1,
        "attempts": attempts,
    }`,
        }}
      />

      <PatternBlock
        name="Rule-Based Routing"
        category="Cost Optimization"
        whenToUse="When you can determine the appropriate model from metadata alone (user tier, task type, input length) without needing a classifier LLM call."
      >
        <p>
          Use deterministic rules for routing where possible: premium users get Opus, free
          users get Haiku; inputs over 10,000 tokens go to a long-context model; real-time
          chat goes to the fastest model; background analysis goes to the most capable.
          Rule-based routing adds zero latency and zero cost compared to LLM-based classifiers.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="A/B Test Routing Decisions">
        <p>
          Routing errors are hard to detect without measurement. Run A/B tests where a sample
          of traffic routed to cheaper models is also run in shadow mode on the more expensive
          model, and compare outputs using an LLM-as-judge evaluator. This gives you ground
          truth on whether your routing classifier is under-routing complex tasks to simple models.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use Model Families Wisely">
        <p>
          Claude Haiku, Sonnet, and Opus are optimised for the same instruction-following
          format. Routing between them requires no prompt changes — just swap the model ID.
          When routing between model families (e.g. Claude to GPT-4o), test prompt compatibility
          carefully: instruction following and tool call formats may behave differently across
          providers.
        </p>
      </NoteBlock>
    </article>
  )
}
