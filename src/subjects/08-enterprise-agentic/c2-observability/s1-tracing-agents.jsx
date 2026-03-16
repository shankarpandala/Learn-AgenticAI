import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function TracingAgents() {
  return (
    <article className="prose-content">
      <h2>Tracing Agents with OpenTelemetry</h2>
      <p>
        Distributed tracing is the primary observability tool for understanding multi-step
        agent behaviour. Every LLM call, tool invocation, and sub-agent delegation becomes
        a span in a trace. When an agent produces the wrong answer or takes too long, traces
        let you pinpoint exactly which step failed, which tool returned unexpected data, and
        how long each model call contributed to total latency.
      </p>

      <ArchitectureDiagram
        title="OpenTelemetry Trace Structure for an Agent Run"
        width={700}
        height={260}
        nodes={[
          { id: 'root', label: 'agent.run\n[root span]', type: 'agent', x: 80, y: 130 },
          { id: 'llm1', label: 'llm.call #1\n[child span]', type: 'llm', x: 280, y: 60 },
          { id: 'tool1', label: 'tool.search\n[child span]', type: 'tool', x: 280, y: 130 },
          { id: 'llm2', label: 'llm.call #2\n[child span]', type: 'llm', x: 280, y: 200 },
          { id: 'collector', label: 'OTel\nCollector', type: 'store', x: 500, y: 130 },
          { id: 'backend', label: 'Jaeger /\nHoneycomb', type: 'external', x: 650, y: 130 },
        ]}
        edges={[
          { from: 'root', to: 'llm1' },
          { from: 'root', to: 'tool1' },
          { from: 'root', to: 'llm2' },
          { from: 'llm1', to: 'collector' },
          { from: 'tool1', to: 'collector' },
          { from: 'llm2', to: 'collector' },
          { from: 'collector', to: 'backend' },
        ]}
      />

      <h2>OpenTelemetry Basics</h2>

      <ConceptBlock term="Spans and Traces">
        <p>
          A <strong>trace</strong> is a complete record of one agent run from user input to
          final response. It is composed of <strong>spans</strong> — individual timed
          operations (one per LLM call, one per tool call). Each span carries attributes
          (model name, token counts, tool name, input/output summaries) and is linked to
          its parent span by a trace ID. Spans from different services (e.g. agent server
          and a tool microservice) can be stitched together into one trace via context
          propagation headers.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Instrumenting an Agent Loop with OpenTelemetry"
        tabs={{
          python: `import anthropic
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.trace import StatusCode

# --- Setup ---
provider = TracerProvider()
exporter = OTLPSpanExporter(endpoint="http://otel-collector:4317")
provider.add_span_processor(BatchSpanProcessor(exporter))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("agent-service", "1.0.0")

client = anthropic.Anthropic()

# --- Instrumented agent loop ---
def run_agent(user_message: str, session_id: str) -> str:
    with tracer.start_as_current_span("agent.run") as root_span:
        root_span.set_attribute("session.id", session_id)
        root_span.set_attribute("user.message.length", len(user_message))

        messages = [{"role": "user", "content": user_message}]
        step = 0

        try:
            while True:
                step += 1
                with tracer.start_as_current_span(f"llm.call") as llm_span:
                    llm_span.set_attribute("llm.step", step)
                    llm_span.set_attribute("llm.model", "claude-opus-4-5")
                    llm_span.set_attribute("llm.messages_count", len(messages))

                    response = client.messages.create(
                        model="claude-opus-4-5",
                        max_tokens=2048,
                        tools=get_tools(),
                        messages=messages,
                    )

                    llm_span.set_attribute("llm.input_tokens", response.usage.input_tokens)
                    llm_span.set_attribute("llm.output_tokens", response.usage.output_tokens)
                    llm_span.set_attribute("llm.stop_reason", response.stop_reason)

                if response.stop_reason == "end_turn":
                    final_text = next(
                        b.text for b in response.content if hasattr(b, "text")
                    )
                    root_span.set_attribute("agent.steps_taken", step)
                    root_span.set_attribute("agent.outcome", "success")
                    return final_text

                if response.stop_reason == "tool_use":
                    messages.append({"role": "assistant", "content": response.content})
                    tool_results = []
                    for block in response.content:
                        if block.type == "tool_use":
                            with tracer.start_as_current_span("tool.call") as tool_span:
                                tool_span.set_attribute("tool.name", block.name)
                                tool_span.set_attribute(
                                    "tool.input_keys", list(block.input.keys())
                                )
                                result = execute_tool(block.name, block.input)
                                tool_span.set_attribute(
                                    "tool.success", "error" not in str(result).lower()
                                )
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": str(result),
                            })
                    messages.append({"role": "user", "content": tool_results})

        except Exception as e:
            root_span.set_status(StatusCode.ERROR, str(e))
            root_span.record_exception(e)
            raise

def get_tools():
    return []

def execute_tool(name: str, input_data: dict) -> dict:
    return {"result": f"executed {name}"}`,
        }}
      />

      <h2>LLM-Specific Span Attributes</h2>

      <ConceptBlock term="Semantic Conventions for LLM Spans">
        <p>
          The OpenTelemetry community has proposed semantic conventions for LLM spans
          (the <code>gen_ai.*</code> namespace). Following these conventions ensures your
          traces work with LLM-aware observability backends (Langtrace, Arize, Honeycomb
          AI). Key attributes include token counts, model name, prompt and completion
          content (with truncation for large payloads), and finish reason.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Standard gen_ai.* Span Attributes"
        tabs={{
          python: `from opentelemetry import trace
from opentelemetry.trace import Span
import anthropic
import json

tracer = trace.get_tracer("agent-service")

def traced_llm_call(
    messages: list,
    model: str = "claude-opus-4-5",
    max_tokens: int = 2048,
    system: str = None,
) -> anthropic.types.Message:
    client = anthropic.Anthropic()

    with tracer.start_as_current_span("gen_ai.completion") as span:
        # Standard gen_ai semantic conventions
        span.set_attribute("gen_ai.system", "anthropic")
        span.set_attribute("gen_ai.request.model", model)
        span.set_attribute("gen_ai.request.max_tokens", max_tokens)

        # Capture prompt (truncated for large payloads)
        prompt_summary = json.dumps(messages)[:1000]
        span.set_attribute("gen_ai.prompt", prompt_summary)

        kwargs = {"model": model, "max_tokens": max_tokens, "messages": messages}
        if system:
            kwargs["system"] = system
            span.set_attribute("gen_ai.request.system_prompt_length", len(system))

        response = client.messages.create(**kwargs)

        # Response attributes
        span.set_attribute("gen_ai.response.model", response.model)
        span.set_attribute("gen_ai.usage.prompt_tokens", response.usage.input_tokens)
        span.set_attribute("gen_ai.usage.completion_tokens", response.usage.output_tokens)
        span.set_attribute("gen_ai.response.finish_reasons", [response.stop_reason])

        # Completion content (truncated)
        completion_text = next(
            (b.text for b in response.content if hasattr(b, "text")), ""
        )
        span.set_attribute("gen_ai.completion", completion_text[:1000])

        return response`,
        }}
      />

      <h2>Trace Context Propagation</h2>

      <PatternBlock
        name="Trace Context Propagation"
        category="Observability"
        whenToUse="When agent tool calls invoke downstream microservices, cloud functions, or external APIs, and you want a single end-to-end trace across all services."
      >
        <p>
          Pass the W3C <code>traceparent</code> header when calling tool backends so that
          their spans are automatically attached to the same trace. This lets you see the
          complete picture: agent LLM calls, tool HTTP calls, and downstream service work
          all in one waterfall view.
        </p>
      </PatternBlock>

      <SDKExample
        title="Propagating Trace Context to Tool HTTP Calls"
        tabs={{
          python: `import httpx
from opentelemetry import trace, propagate
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentation

# Auto-instrument httpx to inject traceparent headers
HTTPXClientInstrumentation().instrument()

tracer = trace.get_tracer("agent-service")

def call_orders_tool(order_id: str) -> dict:
    """HTTP tool call — trace context is auto-propagated by httpx instrumentation."""
    with tracer.start_as_current_span("tool.get_order") as span:
        span.set_attribute("tool.order_id", order_id)

        # httpx instrumentation automatically injects traceparent header
        with httpx.Client() as http:
            response = http.get(
                f"https://orders-service.internal/orders/{order_id}"
            )
            response.raise_for_status()
            data = response.json()
            span.set_attribute("tool.order_status", data.get("status", "unknown"))
            return data

# Manual propagation (when httpx instrumentation is not available)
def call_orders_tool_manual(order_id: str) -> dict:
    headers = {}
    # Inject current span context into headers
    propagate.inject(headers)  # Adds traceparent + tracestate

    with httpx.Client() as http:
        response = http.get(
            f"https://orders-service.internal/orders/{order_id}",
            headers=headers,
        )
        return response.json()`,
        }}
      />

      <BestPracticeBlock title="Separate Trace Data from Sensitive Content">
        <p>
          Trace backends (Jaeger, Honeycomb, Datadog) may have weaker access controls than
          your production database. Do not write raw user messages or model responses to
          span attributes if they may contain PII, PHI, or confidential business data.
          Instead, store a truncated summary or a hash, and write the full content to an
          encrypted log store. Include a reference ID so the two stores can be joined when
          debugging requires the full content.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use Sampling for High-Volume Agents">
        <p>
          Tracing every agent run at 100% may be too expensive at scale. Use head-based
          sampling (e.g. 10% of all runs) plus tail-based sampling (100% of runs that
          produce an error or exceed a latency threshold). This gives you full visibility
          into anomalies without the cost of tracing every successful fast run.
        </p>
      </NoteBlock>
    </article>
  )
}
