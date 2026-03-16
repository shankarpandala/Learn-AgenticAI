import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function OpenTelemetryAgents() {
  return (
    <article className="prose-content">
      <h2>OpenTelemetry for Agents</h2>
      <p>
        OpenTelemetry (OTel) is the industry-standard observability framework for distributed
        systems, and it maps naturally to agentic architectures. Each agent reasoning step becomes
        a span, LLM calls become child spans with token and latency attributes, tool executions
        carry structured metadata, and the full multi-turn conversation becomes a trace.
        OTel-instrumented agents integrate seamlessly with any OTLP-compatible backend: Jaeger,
        Zipkin, Grafana Tempo, Honeycomb, Datadog, or New Relic.
      </p>

      <ConceptBlock term="OpenTelemetry Trace for Agents">
        <p>
          An OTel trace for an agent run consists of a root span (the full agent invocation),
          child spans for each reasoning step, and leaf spans for LLM calls and tool executions.
          Span attributes carry structured data: prompt token counts, model name, tool input/output,
          latency, and error details. Span events record discrete occurrences (tool call decision,
          retry) within a span's lifetime. This structure enables root-cause analysis of latency,
          cost, and errors across the agent's execution graph.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="OpenTelemetry Trace — Agent Execution Tree"
        width={700}
        height={280}
        nodes={[
          { id: 'root', label: 'agent.run\n(root span)', type: 'agent', x: 100, y: 140 },
          { id: 'step1', label: 'agent.step[0]\n(llm_call)', type: 'tool', x: 300, y: 80 },
          { id: 'step2', label: 'agent.step[1]\n(tool_call)', type: 'tool', x: 300, y: 200 },
          { id: 'llm', label: 'llm.complete\n(Claude)', type: 'llm', x: 500, y: 80 },
          { id: 'tool', label: 'tool.web_search\n(external)', type: 'tool', x: 500, y: 200 },
          { id: 'backend', label: 'OTLP Backend\n(Honeycomb / Tempo)', type: 'store', x: 650, y: 140 },
        ]}
        edges={[
          { from: 'root', to: 'step1' },
          { from: 'root', to: 'step2' },
          { from: 'step1', to: 'llm' },
          { from: 'step2', to: 'tool' },
          { from: 'llm', to: 'backend', label: 'export' },
          { from: 'tool', to: 'backend', label: 'export' },
        ]}
      />

      <h2>Semantic Conventions for LLM Spans</h2>
      <p>
        The OpenTelemetry GenAI semantic conventions define standard attribute names for LLM
        spans. Using standard names enables cross-vendor dashboards and alerts without custom
        parsing: <code>gen_ai.system</code>, <code>gen_ai.request.model</code>,
        <code>gen_ai.usage.input_tokens</code>, <code>gen_ai.usage.output_tokens</code>,
        <code>gen_ai.response.finish_reason</code>.
      </p>

      <SDKExample
        title="OpenTelemetry Instrumentation for Agent Runs"
        tabs={{
          python: `from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
import anthropic
import time
import functools

# ---- OTel Setup ----

def setup_tracing(service_name: str, otlp_endpoint: str = "http://localhost:4317") -> trace.Tracer:
    resource = Resource.create({"service.name": service_name, "service.version": "1.0.0"})
    provider = TracerProvider(resource=resource)
    exporter = OTLPSpanExporter(endpoint=otlp_endpoint, insecure=True)
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    return trace.get_tracer(service_name)

tracer = setup_tracing("research-agent")

# ---- Instrumented LLM Call ----

def traced_llm_call(
    client: anthropic.Anthropic,
    model: str,
    messages: list[dict],
    tools: list[dict] | None = None,
    **kwargs,
) -> anthropic.types.Message:
    with tracer.start_as_current_span("llm.complete") as span:
        span.set_attribute("gen_ai.system", "anthropic")
        span.set_attribute("gen_ai.request.model", model)
        span.set_attribute("gen_ai.request.max_tokens", kwargs.get("max_tokens", 1024))
        span.set_attribute("agent.message_count", len(messages))

        start = time.time()
        try:
            response = client.messages.create(
                model=model,
                messages=messages,
                tools=tools or [],
                **kwargs,
            )
            latency_ms = (time.time() - start) * 1000

            # GenAI semantic conventions
            span.set_attribute("gen_ai.usage.input_tokens", response.usage.input_tokens)
            span.set_attribute("gen_ai.usage.output_tokens", response.usage.output_tokens)
            span.set_attribute("gen_ai.response.finish_reason", response.stop_reason)
            span.set_attribute("llm.latency_ms", latency_ms)

            # Tool call metadata
            tool_calls = [b for b in response.content if b.type == "tool_use"]
            if tool_calls:
                span.set_attribute("agent.tool_calls_requested", len(tool_calls))
                span.set_attribute(
                    "agent.tool_names",
                    ",".join(tc.name for tc in tool_calls),
                )
            return response

        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.StatusCode.ERROR, str(e))
            raise

# ---- Instrumented Tool Call ----

def traced_tool_call(tool_name: str):
    """Decorator to add OTel spans to tool functions."""
    def decorator(fn):
        @functools.wraps(fn)
        async def wrapper(*args, **kwargs):
            with tracer.start_as_current_span(f"tool.{tool_name}") as span:
                span.set_attribute("tool.name", tool_name)
                span.set_attribute("tool.input", str(kwargs or args))
                start = time.time()
                try:
                    result = await fn(*args, **kwargs)
                    span.set_attribute("tool.latency_ms", (time.time() - start) * 1000)
                    span.set_attribute("tool.result_length", len(str(result)))
                    return result
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(trace.StatusCode.ERROR, str(e))
                    raise
        return wrapper
    return decorator

# ---- Fully Instrumented Agent Loop ----

@traced_tool_call("web_search")
async def web_search(query: str) -> str:
    # Real implementation
    return f"Search results for: {query}"

async def run_agent(user_input: str, session_id: str) -> str:
    client = anthropic.Anthropic()
    messages = [{"role": "user", "content": user_input}]

    with tracer.start_as_current_span("agent.run") as root_span:
        root_span.set_attribute("agent.session_id", session_id)
        root_span.set_attribute("agent.input", user_input[:500])  # truncate for safety
        root_span.set_attribute("agent.model", "claude-3-5-sonnet-20241022")

        step = 0
        while step < 10:
            with tracer.start_as_current_span(f"agent.step") as step_span:
                step_span.set_attribute("agent.step_number", step)

                response = traced_llm_call(
                    client=client,
                    model="claude-3-5-sonnet-20241022",
                    messages=messages,
                    max_tokens=2048,
                )

                if response.stop_reason == "end_turn":
                    output = next(
                        (b.text for b in response.content if hasattr(b, "text")), ""
                    )
                    root_span.set_attribute("agent.output", output[:500])
                    root_span.set_attribute("agent.total_steps", step + 1)
                    return output

                tool_uses = [b for b in response.content if b.type == "tool_use"]
                tool_results = []
                for tool_use in tool_uses:
                    if tool_use.name == "web_search":
                        result = await web_search(query=tool_use.input["query"])
                    else:
                        result = f"Unknown tool: {tool_use.name}"
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": result,
                    })

                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})
                step += 1

        root_span.set_attribute("agent.error", "max_steps_exceeded")
        raise TimeoutError("Agent exceeded max steps")`,
          typescript: `import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { Resource } from "@opentelemetry/resources";
import { trace, SpanStatusCode, context } from "@opentelemetry/api";
import Anthropic from "@anthropic-ai/sdk";

// ---- OTel Setup ----

const sdk = new NodeSDK({
  resource: new Resource({
    "service.name": "research-agent",
    "service.version": "1.0.0",
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4317",
  }),
});

sdk.start();
const tracer = trace.getTracer("research-agent");

// ---- Instrumented LLM Call ----

async function tracedLlmCall(params: {
  client: Anthropic;
  model: string;
  messages: Anthropic.MessageParam[];
  tools?: Anthropic.Tool[];
  maxTokens?: number;
}): Promise<Anthropic.Message> {
  return tracer.startActiveSpan("llm.complete", async (span) => {
    span.setAttribute("gen_ai.system", "anthropic");
    span.setAttribute("gen_ai.request.model", params.model);
    span.setAttribute("gen_ai.request.max_tokens", params.maxTokens ?? 1024);
    span.setAttribute("agent.message_count", params.messages.length);

    const start = Date.now();
    try {
      const response = await params.client.messages.create({
        model: params.model,
        messages: params.messages,
        tools: params.tools ?? [],
        max_tokens: params.maxTokens ?? 1024,
      });

      span.setAttribute("gen_ai.usage.input_tokens", response.usage.input_tokens);
      span.setAttribute("gen_ai.usage.output_tokens", response.usage.output_tokens);
      span.setAttribute("gen_ai.response.finish_reason", response.stop_reason ?? "");
      span.setAttribute("llm.latency_ms", Date.now() - start);

      const toolCalls = response.content.filter((b) => b.type === "tool_use");
      if (toolCalls.length > 0) {
        span.setAttribute("agent.tool_calls_requested", toolCalls.length);
        span.setAttribute(
          "agent.tool_names",
          toolCalls
            .map((b) => (b as Anthropic.ToolUseBlock).name)
            .join(",")
        );
      }
      span.end();
      return response;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      span.end();
      throw err;
    }
  });
}

// ---- Instrumented Tool Call ----

function withToolSpan<T>(
  toolName: string,
  fn: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(tool.\${toolName}, async (span) => {
    span.setAttribute("tool.name", toolName);
    const start = Date.now();
    try {
      const result = await fn();
      span.setAttribute("tool.latency_ms", Date.now() - start);
      span.end();
      return result;
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
      span.end();
      throw err;
    }
  });
}

// ---- Fully Instrumented Agent Run ----

async function runAgent(userInput: string, sessionId: string): Promise<string> {
  const client = new Anthropic();

  return tracer.startActiveSpan("agent.run", async (rootSpan) => {
    rootSpan.setAttribute("agent.session_id", sessionId);
    rootSpan.setAttribute("agent.input", userInput.slice(0, 500));
    rootSpan.setAttribute("agent.model", "claude-3-5-sonnet-20241022");

    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: userInput },
    ];

    for (let step = 0; step < 10; step++) {
      const response = await tracer.startActiveSpan("agent.step", async (stepSpan) => {
        stepSpan.setAttribute("agent.step_number", step);
        const r = await tracedLlmCall({
          client,
          model: "claude-3-5-sonnet-20241022",
          messages,
          maxTokens: 2048,
        });
        stepSpan.end();
        return r;
      });

      if (response.stop_reason === "end_turn") {
        const output = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
        rootSpan.setAttribute("agent.output", output.slice(0, 500));
        rootSpan.setAttribute("agent.total_steps", step + 1);
        rootSpan.end();
        return output;
      }

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const result = await withToolSpan(block.name, async () => {
          return Result for \${block.name};
        });
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    }

    rootSpan.setAttribute("agent.error", "max_steps_exceeded");
    rootSpan.end();
    throw new Error("Agent exceeded max steps");
  });
}`,
        }}
      />

      <PatternBlock
        name="Baggage Propagation for Multi-Agent Traces"
        category="Distributed Tracing"
        whenToUse="When an orchestrator agent delegates to sub-agents or microservices, and you need a single trace spanning all components."
      >
        <p>
          Use OTel baggage and W3C trace context headers to propagate the parent trace ID across
          HTTP calls from orchestrator to sub-agents. Each sub-agent reads the incoming trace
          context, creates child spans under the parent, and exports them to the same backend.
          The result is a single waterfall trace showing the complete execution path across all
          agents and services.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Redact Sensitive Data from Span Attributes">
        <p>
          Span attributes are exported to observability backends that may be accessed by
          operations teams. Never store full prompts, personal data (PII), or secrets as span
          attributes. Store token counts, model names, latency, error types, and truncated
          summaries. Use a custom span processor to strip or hash sensitive fields before export.
          Define a clear data classification policy for what can appear in traces.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="OpenTelemetry GenAI Semantic Conventions">
        <p>
          The OTel GenAI semantic conventions (<code>gen_ai.*</code> namespace) are stabilising
          in 2025 and define standard attribute names for LLM spans across providers. Using
          these standard names means your dashboards and alerts work without modification when
          you switch from one LLM provider to another. Check the
          OpenTelemetry specification repository for the latest stable attribute list before
          implementing your own conventions.
        </p>
      </NoteBlock>
    </article>
  )
}
