import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function LoggingMonitoring() {
  return (
    <article className="prose-content">
      <h2>Logging and Monitoring Agent Systems</h2>
      <p>
        Structured logs and metrics are the operational backbone of production agent systems.
        Unlike traces (which record individual runs), logs and metrics aggregate across all
        runs to surface trends: rising error rates, token cost spikes, slow tools, and
        anomalous step counts that indicate runaway agents.
      </p>

      <ArchitectureDiagram
        title="Logging and Metrics Pipeline"
        width={700}
        height={240}
        nodes={[
          { id: 'agent', label: 'Agent\nService', type: 'agent', x: 80, y: 120 },
          { id: 'logs', label: 'Structured\nLogs (JSON)', type: 'store', x: 280, y: 60 },
          { id: 'metrics', label: 'Metrics\n(StatsD/OTEL)', type: 'store', x: 280, y: 180 },
          { id: 'loki', label: 'Loki /\nCloudWatch', type: 'external', x: 480, y: 60 },
          { id: 'prom', label: 'Prometheus /\nDatadog', type: 'external', x: 480, y: 180 },
          { id: 'grafana', label: 'Grafana\nDashboard', type: 'tool', x: 640, y: 120 },
        ]}
        edges={[
          { from: 'agent', to: 'logs' },
          { from: 'agent', to: 'metrics' },
          { from: 'logs', to: 'loki' },
          { from: 'metrics', to: 'prom' },
          { from: 'loki', to: 'grafana' },
          { from: 'prom', to: 'grafana' },
        ]}
      />

      <h2>Structured Logging</h2>

      <ConceptBlock term="Structured JSON Logging">
        <p>
          Structured logs emit JSON objects instead of free-form strings. Every log line
          carries consistent fields — timestamp, level, session ID, agent version, step
          number, token counts — that can be queried, filtered, and aggregated in log
          management systems (Loki, CloudWatch Logs Insights, Datadog Logs). Unstructured
          log lines are nearly impossible to query at scale.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Structured Logging for Agent Events"
        tabs={{
          python: `import logging
import json
import time
import uuid
from dataclasses import dataclass, asdict
from typing import Any

# --- Structured JSON log formatter ---
class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # Merge extra fields from record
        for key, value in record.__dict__.items():
            if key not in {
                "msg", "args", "levelname", "levelno", "pathname", "filename",
                "module", "exc_info", "exc_text", "stack_info", "lineno",
                "funcName", "created", "msecs", "relativeCreated", "thread",
                "threadName", "processName", "process", "name", "message",
            }:
                log_data[key] = value
        return json.dumps(log_data)

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger("agent")
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# --- Agent event log helpers ---
@dataclass
class AgentRunEvent:
    event: str
    session_id: str
    agent_version: str
    step: int = 0
    model: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    tool_name: str = ""
    latency_ms: float = 0.0
    error: str = ""
    extra: dict = None

    def log(self, level: str = "info"):
        data = {k: v for k, v in asdict(self).items() if v or v == 0}
        if self.extra:
            data.update(self.extra)
        getattr(logger, level)(self.event, extra=data)

# --- Usage in agent loop ---
import anthropic

client = anthropic.Anthropic()

def run_agent(user_message: str) -> str:
    session_id = str(uuid.uuid4())
    version = "v1.5.0"
    messages = [{"role": "user", "content": user_message}]

    AgentRunEvent(
        event="agent.run.started",
        session_id=session_id,
        agent_version=version,
        extra={"message_length": len(user_message)},
    ).log()

    run_start = time.monotonic()
    step = 0

    try:
        while True:
            step += 1
            step_start = time.monotonic()

            response = client.messages.create(
                model="claude-opus-4-5",
                max_tokens=2048,
                messages=messages,
            )

            step_latency = (time.monotonic() - step_start) * 1000
            AgentRunEvent(
                event="agent.llm.call",
                session_id=session_id,
                agent_version=version,
                step=step,
                model=response.model,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
                latency_ms=round(step_latency, 2),
            ).log()

            if response.stop_reason == "end_turn":
                total_latency = (time.monotonic() - run_start) * 1000
                AgentRunEvent(
                    event="agent.run.completed",
                    session_id=session_id,
                    agent_version=version,
                    step=step,
                    latency_ms=round(total_latency, 2),
                ).log()
                return next(b.text for b in response.content if hasattr(b, "text"))

    except Exception as e:
        AgentRunEvent(
            event="agent.run.error",
            session_id=session_id,
            agent_version=version,
            step=step,
            error=str(e),
        ).log("error")
        raise`,
        }}
      />

      <h2>Key Metrics to Collect</h2>

      <ConceptBlock term="Agent Metrics Taxonomy">
        <p>
          Agent systems require metrics beyond standard web service signals. In addition
          to latency and error rate, track: token consumption (cost proxy), steps per run
          (runaway agent indicator), tool call success rates by tool name, context window
          utilisation (proximity to limits), and model-specific finish reasons (unexpected
          <code>max_tokens</code> stops indicate truncated responses).
        </p>
      </ConceptBlock>

      <SDKExample
        title="Metrics Collection with OpenTelemetry Metrics API"
        tabs={{
          python: `from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

# --- Setup ---
reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint="http://otel-collector:4317"),
    export_interval_millis=15000,
)
provider = MeterProvider(metric_readers=[reader])
metrics.set_meter_provider(provider)
meter = metrics.get_meter("agent-service", "1.0.0")

# --- Define instruments ---
run_duration = meter.create_histogram(
    "agent.run.duration_ms",
    description="End-to-end agent run duration in milliseconds",
    unit="ms",
)
run_counter = meter.create_counter(
    "agent.run.total",
    description="Total number of agent runs",
)
error_counter = meter.create_counter(
    "agent.run.errors",
    description="Total number of agent run errors",
)
token_counter = meter.create_counter(
    "agent.tokens.total",
    description="Total tokens consumed (input + output)",
)
steps_histogram = meter.create_histogram(
    "agent.steps.per_run",
    description="Number of LLM call steps per agent run",
)
tool_duration = meter.create_histogram(
    "agent.tool.duration_ms",
    description="Tool execution duration in milliseconds",
    unit="ms",
)
tool_errors = meter.create_counter(
    "agent.tool.errors",
    description="Tool execution errors by tool name",
)

# --- Usage ---
import time
import anthropic

client = anthropic.Anthropic()

def run_agent_with_metrics(user_message: str, agent_version: str = "v1.5.0") -> str:
    attrs = {"agent.version": agent_version, "model": "claude-opus-4-5"}
    run_counter.add(1, attrs)

    messages = [{"role": "user", "content": user_message}]
    total_input_tokens = 0
    total_output_tokens = 0
    steps = 0
    start = time.monotonic()

    try:
        while True:
            steps += 1
            response = client.messages.create(
                model="claude-opus-4-5", max_tokens=2048, messages=messages,
            )
            total_input_tokens += response.usage.input_tokens
            total_output_tokens += response.usage.output_tokens

            if response.stop_reason == "end_turn":
                duration = (time.monotonic() - start) * 1000
                run_duration.record(duration, attrs)
                steps_histogram.record(steps, attrs)
                token_counter.add(
                    total_input_tokens,
                    {**attrs, "token.type": "input"},
                )
                token_counter.add(
                    total_output_tokens,
                    {**attrs, "token.type": "output"},
                )
                return next(b.text for b in response.content if hasattr(b, "text"))

    except Exception as e:
        error_counter.add(1, {**attrs, "error.type": type(e).__name__})
        raise`,
        }}
      />

      <h2>Dashboard Design</h2>

      <PatternBlock
        name="Four Golden Signals Dashboard"
        category="Monitoring"
        whenToUse="As the primary operational dashboard for an agent service, covering the four signals that matter most for production health."
      >
        <p>
          Adapt Google SRE's four golden signals for agents: (1) <strong>Latency</strong> —
          p50/p95/p99 end-to-end run duration; (2) <strong>Traffic</strong> — runs per minute
          and tokens per minute; (3) <strong>Errors</strong> — error rate by error category;
          (4) <strong>Saturation</strong> — context window utilisation and queue depth.
          Add a fifth panel: <strong>Cost</strong> — total tokens × model price per token.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Instrument Every Tool Independently">
        <p>
          Aggregate tool metrics hide individual tool problems. Instrument each tool with its
          own latency histogram and error counter, tagged with the tool name. A slow or
          unreliable tool (e.g. a flaky third-party API) will immediately show up in the
          per-tool error rate panel, while aggregate metrics might mask it in the noise of
          successful tool calls.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Log Token Costs, Not Just Counts">
        <p>
          Token counts are hard to reason about in budgets. Multiply input and output tokens
          by the model's per-token price and emit a <code>cost_usd</code> metric. This lets
          your finance and product teams track AI spend directly in dashboards alongside
          user-facing metrics, and enables per-tenant cost attribution for SaaS billing.
        </p>
      </NoteBlock>
    </article>
  )
}
