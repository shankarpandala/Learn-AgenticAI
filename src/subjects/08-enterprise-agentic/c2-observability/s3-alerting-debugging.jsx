import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function AlertingDebugging() {
  return (
    <article className="prose-content">
      <h2>Alerting and Debugging Agent Systems</h2>
      <p>
        Agent failures are often silent: an agent completes without throwing an exception
        but produces a wrong answer, loops excessively, or quietly exceeds token budgets.
        Effective alerting requires defining agent-specific failure signals, and debugging
        requires tools that let you replay agent runs step-by-step against recorded inputs.
      </p>

      <ArchitectureDiagram
        title="Alert Pipeline for Agent Systems"
        width={700}
        height={240}
        nodes={[
          { id: 'metrics', label: 'Metrics +\nLogs', type: 'store', x: 80, y: 120 },
          { id: 'rules', label: 'Alert\nRules', type: 'tool', x: 260, y: 120 },
          { id: 'pagerduty', label: 'PagerDuty /\nOpsGenie', type: 'external', x: 460, y: 60 },
          { id: 'slack', label: 'Slack\nChannel', type: 'external', x: 460, y: 120 },
          { id: 'ticket', label: 'Issue\nTracker', type: 'external', x: 460, y: 190 },
        ]}
        edges={[
          { from: 'metrics', to: 'rules' },
          { from: 'rules', to: 'pagerduty', label: 'P1/P2' },
          { from: 'rules', to: 'slack', label: 'P3' },
          { from: 'rules', to: 'ticket', label: 'P4' },
        ]}
      />

      <h2>What to Alert On</h2>

      <ConceptBlock term="Agent-Specific Alert Signals">
        <p>
          Standard SLO alerts (error rate, latency) are necessary but not sufficient for
          agents. Additional alert signals specific to agents: run step count exceeding a
          threshold (runaway agent), tool error rate spike by tool name, context window
          utilisation above 90% (approaching truncation), cost per hour exceeding budget,
          and unexpected model finish reason (e.g. <code>max_tokens</code> when the agent
          should be finishing on <code>end_turn</code>).
        </p>
      </ConceptBlock>

      <SDKExample
        title="Defining Agent Alert Rules (Prometheus / Alertmanager)"
        tabs={{
          python: `# alert_rules.py — Generate Prometheus alert rules as code
# Apply with: kubectl apply -f generated_alerts.yaml

ALERT_RULES = [
    {
        "alert": "AgentHighErrorRate",
        "expr": 'rate(agent_run_errors_total[5m]) / rate(agent_run_total[5m]) > 0.05',
        "for": "2m",
        "labels": {"severity": "critical"},
        "annotations": {
            "summary": "Agent error rate above 5%",
            "description": "Agent {{ $labels.agent_version }} error rate is {{ $value | humanizePercentage }}",
            "runbook_url": "https://wiki.internal/runbooks/agent-errors",
        },
    },
    {
        "alert": "AgentRunawayLoop",
        "expr": 'histogram_quantile(0.95, agent_steps_per_run_bucket) > 15',
        "for": "5m",
        "labels": {"severity": "warning"},
        "annotations": {
            "summary": "Agent p95 step count exceeds 15",
            "description": "Agents may be looping excessively — check for tool failures causing retries",
        },
    },
    {
        "alert": "AgentHighLatency",
        "expr": 'histogram_quantile(0.95, agent_run_duration_ms_bucket) > 60000',
        "for": "3m",
        "labels": {"severity": "warning"},
        "annotations": {
            "summary": "Agent p95 latency above 60 seconds",
        },
    },
    {
        "alert": "AgentTokenBudgetExceeded",
        "expr": 'rate(agent_tokens_total[1h]) * 3600 > 10000000',
        "for": "10m",
        "labels": {"severity": "warning"},
        "annotations": {
            "summary": "Agent token consumption rate exceeds 10M tokens/hour",
        },
    },
    {
        "alert": "AgentToolHighErrorRate",
        "expr": 'rate(agent_tool_errors_total[5m]) by (tool_name) > 0.1',
        "for": "2m",
        "labels": {"severity": "warning"},
        "annotations": {
            "summary": "Tool {{ $labels.tool_name }} error rate above 10%",
            "description": "Check tool health and downstream dependency status",
        },
    },
]`,
        }}
      />

      <h2>Debugging Agent Runs</h2>

      <ConceptBlock term="Step-by-Step Replay">
        <p>
          The most effective agent debugging technique is replay: store every agent run as
          an immutable event log (messages, tool calls, tool results, model responses),
          then replay the run locally against a snapshot of the same tool state. This
          lets you reproduce a production failure deterministically on your laptop, add
          print statements, and iterate on fixes without triggering real tool side-effects.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Recording and Replaying Agent Runs"
        tabs={{
          python: `import anthropic
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from dataclasses import dataclass, field, asdict

@dataclass
class AgentRunRecord:
    """Immutable record of a complete agent run for replay and debugging."""
    run_id: str
    started_at: str
    agent_version: str
    initial_messages: list
    events: list = field(default_factory=list)
    final_response: str = ""
    error: str = ""

    def record_llm_call(self, request_messages: list, response: dict):
        self.events.append({
            "type": "llm_call",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request": {"messages": request_messages},
            "response": response,
        })

    def record_tool_call(self, tool_name: str, tool_input: dict, result: dict):
        self.events.append({
            "type": "tool_call",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tool_name": tool_name,
            "input": tool_input,
            "result": result,
        })

    def save(self, directory: str = "/tmp/agent-runs"):
        Path(directory).mkdir(parents=True, exist_ok=True)
        path = f"{directory}/{self.run_id}.json"
        with open(path, "w") as f:
            json.dump(asdict(self), f, indent=2)
        return path

    @classmethod
    def load(cls, path: str) -> "AgentRunRecord":
        with open(path) as f:
            return cls(**json.load(f))

# --- Recording agent ---
client = anthropic.Anthropic()

def run_agent_with_recording(
    user_message: str, agent_version: str = "v1.5.0"
) -> tuple[str, AgentRunRecord]:
    record = AgentRunRecord(
        run_id=str(uuid.uuid4()),
        started_at=datetime.now(timezone.utc).isoformat(),
        agent_version=agent_version,
        initial_messages=[{"role": "user", "content": user_message}],
    )
    messages = list(record.initial_messages)

    try:
        while True:
            response = client.messages.create(
                model="claude-opus-4-5", max_tokens=2048, messages=messages,
            )
            response_dict = {
                "stop_reason": response.stop_reason,
                "model": response.model,
                "usage": {"input": response.usage.input_tokens, "output": response.usage.output_tokens},
                "content": [{"type": b.type, **{
                    "text": b.text if hasattr(b, "text") else None,
                    "id": b.id if hasattr(b, "id") else None,
                    "name": b.name if hasattr(b, "name") else None,
                    "input": b.input if hasattr(b, "input") else None,
                }} for b in response.content],
            }
            record.record_llm_call(messages, response_dict)

            if response.stop_reason == "end_turn":
                final = next(b.text for b in response.content if hasattr(b, "text"))
                record.final_response = final
                return final, record

    except Exception as e:
        record.error = str(e)
        path = record.save()
        print(f"Run failed. Record saved to {path}")
        raise

# --- Replay for debugging ---
def replay_agent_run(record: AgentRunRecord) -> None:
    """Step through a recorded run event by event for debugging."""
    print(f"Replaying run {record.run_id} (version={record.agent_version})")
    print(f"Initial message: {record.initial_messages[0]['content'][:200]}")
    print()

    for i, event in enumerate(record.events):
        print(f"--- Event {i + 1}: {event['type']} ---")
        if event["type"] == "llm_call":
            resp = event["response"]
            print(f"  stop_reason: {resp['stop_reason']}")
            print(f"  tokens: input={resp['usage']['input']} output={resp['usage']['output']}")
            for block in resp["content"]:
                if block["type"] == "text":
                    print(f"  text: {block['text'][:200]}")
                elif block["type"] == "tool_use":
                    print(f"  tool_use: {block['name']} input={block['input']}")
        elif event["type"] == "tool_call":
            print(f"  tool: {event['tool_name']}")
            print(f"  input: {event['input']}")
            print(f"  result: {str(event['result'])[:200]}")
        print()

    print(f"Final response: {record.final_response[:300]}")
    if record.error:
        print(f"ERROR: {record.error}")`,
        }}
      />

      <h2>Debugging with Extended Thinking</h2>

      <PatternBlock
        name="Thinking Traces for Debugging"
        category="Debugging"
        whenToUse="When an agent produces a wrong answer and you cannot determine from tool calls and final output why the model reached that conclusion."
      >
        <p>
          Enable extended thinking during debug sessions to expose the model's internal
          reasoning chain. Thinking blocks reveal which facts the model attended to,
          which tool results it misinterpreted, and where logical errors occurred — without
          needing to guess from the final output alone. Disable thinking in production
          unless the reasoning overhead is justified by task complexity.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Reproduce Failures Deterministically">
        <p>
          Always use temperature=0 when replaying a failed agent run during debugging.
          Most LLM bugs are deterministic at temperature 0 — the same input reliably
          produces the same output. If the bug only reproduces at higher temperatures,
          it indicates a robustness issue: the agent relies on probabilistic behaviour
          rather than reliable reasoning. Fix the underlying prompt or tool design rather
          than tuning temperature.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Noise in Alert Fatigue">
        <p>
          Alert on signals that require human action, not every anomaly. An agent with a
          5% tool error rate may be behaving correctly if it handles those errors gracefully.
          Alert on the <em>impact</em>: user-facing error rate, SLO burn rate, or cost
          overruns. Alert rules that fire constantly are ignored — and ignored alerts miss
          the real incidents.
        </p>
      </NoteBlock>
    </article>
  )
}
