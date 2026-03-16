import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function CustomTracing() {
  return (
    <article className="prose-content">
      <h2>Custom Tracing</h2>
      <p>
        OpenTelemetry and LangSmith cover most production tracing needs, but sometimes a
        lightweight custom tracing system is the right choice: when deploying in air-gapped
        environments, when you need complete control over the data schema, when OTel overhead
        is unacceptable, or when you are building an internal tool with a specific data model.
        Custom tracing is not reinventing the wheel — it is applying the same core concepts
        (spans, parent-child relationships, structured attributes) with a minimal footprint.
      </p>

      <ConceptBlock term="Custom Trace">
        <p>
          A custom trace is a structured log of an agent's execution: a tree of events with
          parent-child relationships, timestamps, durations, and typed attributes. At its
          simplest, it is a list of JSON objects written to a file or database. The key insight
          is that you need correlation (linking events within a single run), hierarchy (parent
          spans containing children), and searchability (querying by session, error type, model,
          or latency). Everything else is optional.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Custom Tracing Architecture"
        width={700}
        height={240}
        nodes={[
          { id: 'agent', label: 'Agent\nRuntime', type: 'agent', x: 100, y: 120 },
          { id: 'tracer', label: 'Tracer\n(in-process)', type: 'tool', x: 280, y: 120 },
          { id: 'buffer', label: 'In-Memory\nBuffer', type: 'store', x: 450, y: 70 },
          { id: 'sink', label: 'Storage Sink\n(file / DB / S3)', type: 'store', x: 450, y: 170 },
          { id: 'query', label: 'Query /\nDashboard', type: 'external', x: 630, y: 120 },
        ]}
        edges={[
          { from: 'agent', to: 'tracer', label: 'spans' },
          { from: 'tracer', to: 'buffer', label: 'batch' },
          { from: 'buffer', to: 'sink', label: 'flush' },
          { from: 'sink', to: 'query' },
        ]}
      />

      <h2>Custom Tracer Implementation</h2>

      <SDKExample
        title="Lightweight Custom Tracer for Agent Runs"
        tabs={{
          python: `import json
import uuid
import time
import asyncio
import functools
import contextvars
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

# Context variable to track the current span across async boundaries
_current_span_id: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "_current_span_id", default=None
)
_current_trace_id: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "_current_trace_id", default=None
)

@dataclass
class Span:
    trace_id: str
    span_id: str
    parent_id: str | None
    name: str
    kind: str                        # "agent", "llm", "tool", "chain"
    start_time: float
    end_time: float | None = None
    duration_ms: float | None = None
    attributes: dict[str, Any] = field(default_factory=dict)
    events: list[dict] = field(default_factory=list)
    status: str = "ok"              # "ok", "error"
    error: str | None = None

    def add_event(self, name: str, attributes: dict | None = None) -> None:
        self.events.append({
            "name": name,
            "timestamp": time.time(),
            "attributes": attributes or {},
        })

    def finish(self, error: Exception | None = None) -> None:
        self.end_time = time.time()
        self.duration_ms = (self.end_time - self.start_time) * 1000
        if error:
            self.status = "error"
            self.error = str(error)

    def to_dict(self) -> dict:
        return asdict(self)

class Tracer:
    def __init__(self, sink: "TraceSink"):
        self.sink = sink

    def start_span(
        self,
        name: str,
        kind: str = "chain",
        attributes: dict | None = None,
        trace_id: str | None = None,
    ) -> Span:
        tid = trace_id or _current_trace_id.get() or str(uuid.uuid4())
        span = Span(
            trace_id=tid,
            span_id=str(uuid.uuid4()),
            parent_id=_current_span_id.get(),
            name=name,
            kind=kind,
            start_time=time.time(),
            attributes=attributes or {},
        )
        _current_trace_id.set(tid)
        _current_span_id.set(span.span_id)
        return span

    def finish_span(self, span: Span, error: Exception | None = None) -> None:
        span.finish(error)
        self.sink.write(span)

    def trace(self, name: str, kind: str = "chain", **attrs):
        """Decorator for sync and async functions."""
        def decorator(fn: Callable) -> Callable:
            if asyncio.iscoroutinefunction(fn):
                @functools.wraps(fn)
                async def async_wrapper(*args, **kwargs):
                    span = self.start_span(name, kind, attributes=attrs)
                    parent_token = _current_span_id.set(span.span_id)
                    try:
                        result = await fn(*args, **kwargs)
                        self.finish_span(span)
                        return result
                    except Exception as e:
                        self.finish_span(span, error=e)
                        raise
                    finally:
                        _current_span_id.reset(parent_token)
                return async_wrapper
            else:
                @functools.wraps(fn)
                def sync_wrapper(*args, **kwargs):
                    span = self.start_span(name, kind, attributes=attrs)
                    try:
                        result = fn(*args, **kwargs)
                        self.finish_span(span)
                        return result
                    except Exception as e:
                        self.finish_span(span, error=e)
                        raise
                return sync_wrapper
        return decorator

# ---- Trace Sinks ----

class TraceSink:
    def write(self, span: Span) -> None:
        raise NotImplementedError

class JsonLinesSink(TraceSink):
    """Append spans to a JSONL file — simple, grep-able, S3-uploadable."""
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def write(self, span: Span) -> None:
        with open(self.path, "a") as f:
            f.write(json.dumps(span.to_dict()) + "\\n")

class InMemorySink(TraceSink):
    """Collect spans in memory — useful for tests."""
    def __init__(self):
        self.spans: list[Span] = []

    def write(self, span: Span) -> None:
        self.spans.append(span)

    def get_trace(self, trace_id: str) -> list[Span]:
        return [s for s in self.spans if s.trace_id == trace_id]

# ---- Using the Custom Tracer ----

import anthropic

sink = JsonLinesSink(Path("./traces/agent-traces.jsonl"))
tracer = Tracer(sink=sink)

@tracer.trace("llm.complete", kind="llm")
async def call_llm(
    client: anthropic.AsyncAnthropic,
    model: str,
    messages: list[dict],
) -> anthropic.types.Message:
    span = tracer.start_span("llm.complete", kind="llm")
    span.attributes.update({
        "gen_ai.request.model": model,
        "gen_ai.system": "anthropic",
    })
    response = await client.messages.create(
        model=model,
        messages=messages,
        max_tokens=2048,
    )
    span.attributes.update({
        "gen_ai.usage.input_tokens": response.usage.input_tokens,
        "gen_ai.usage.output_tokens": response.usage.output_tokens,
    })
    tracer.finish_span(span)
    return response

# Querying JSONL traces
def query_traces(
    trace_file: Path,
    error_only: bool = False,
    min_duration_ms: float | None = None,
) -> list[dict]:
    results = []
    with open(trace_file) as f:
        for line in f:
            span = json.loads(line)
            if error_only and span.get("status") != "error":
                continue
            if min_duration_ms and (span.get("duration_ms") or 0) < min_duration_ms:
                continue
            results.append(span)
    return results`,
          typescript: `import { randomUUID } from "crypto";
import { appendFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { AsyncLocalStorage } from "async_hooks";

// ---- Core Types ----

interface SpanContext {
  traceId: string;
  spanId: string;
}

interface SpanData {
  traceId: string;
  spanId: string;
  parentId: string | null;
  name: string;
  kind: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  attributes: Record<string, unknown>;
  events: Array<{ name: string; timestamp: number; attributes: Record<string, unknown> }>;
  status: "ok" | "error";
  error?: string;
}

// ---- Async Context Storage ----

const spanStorage = new AsyncLocalStorage<SpanContext>();

// ---- Span ----

class Span {
  data: SpanData;

  constructor(params: {
    traceId: string;
    spanId: string;
    parentId: string | null;
    name: string;
    kind: string;
    attributes?: Record<string, unknown>;
  }) {
    this.data = {
      ...params,
      attributes: params.attributes ?? {},
      events: [],
      startTime: Date.now(),
      status: "ok",
    };
  }

  setAttribute(key: string, value: unknown): void {
    this.data.attributes[key] = value;
  }

  addEvent(name: string, attributes: Record<string, unknown> = {}): void {
    this.data.events.push({ name, timestamp: Date.now(), attributes });
  }

  finish(error?: Error): void {
    this.data.endTime = Date.now();
    this.data.durationMs = this.data.endTime - this.data.startTime;
    if (error) {
      this.data.status = "error";
      this.data.error = error.message;
    }
  }
}

// ---- Tracer ----

class Tracer {
  constructor(private sink: TraceSink) {}

  startSpan(name: string, kind = "chain", attributes?: Record<string, unknown>): Span {
    const ctx = spanStorage.getStore();
    const traceId = ctx?.traceId ?? randomUUID();
    return new Span({
      traceId,
      spanId: randomUUID(),
      parentId: ctx?.spanId ?? null,
      name,
      kind,
      attributes,
    });
  }

  finishSpan(span: Span, error?: Error): void {
    span.finish(error);
    this.sink.write(span.data);
  }

  wrap<T>(
    name: string,
    fn: () => Promise<T>,
    options?: { kind?: string; attributes?: Record<string, unknown> }
  ): Promise<T> {
    const span = this.startSpan(name, options?.kind ?? "chain", options?.attributes);
    const ctx: SpanContext = { traceId: span.data.traceId, spanId: span.data.spanId };
    return spanStorage.run(ctx, async () => {
      try {
        const result = await fn();
        this.finishSpan(span);
        return result;
      } catch (err) {
        this.finishSpan(span, err as Error);
        throw err;
      }
    });
  }
}

// ---- Sinks ----

interface TraceSink {
  write(span: SpanData): void;
}

class JsonLinesSink implements TraceSink {
  constructor(private filePath: string) {
    mkdirSync(dirname(filePath), { recursive: true });
  }

  write(span: SpanData): void {
    appendFileSync(this.filePath, JSON.stringify(span) + "\\n");
  }
}

class InMemorySink implements TraceSink {
  spans: SpanData[] = [];
  write(span: SpanData): void {
    this.spans.push(span);
  }
  getTrace(traceId: string): SpanData[] {
    return this.spans.filter((s) => s.traceId === traceId);
  }
}

// ---- Usage ----

const tracer = new Tracer(new JsonLinesSink("./traces/agent-traces.jsonl"));

async function callLlm(messages: unknown[]): Promise<string> {
  return tracer.wrap("llm.complete", async () => {
    // real LLM call here
    return "LLM response";
  }, { kind: "llm", attributes: { "gen_ai.request.model": "claude-3-5-sonnet-20241022" } });
}`,
        }}
      />

      <PatternBlock
        name="Context-Propagated Trace IDs"
        category="Custom Tracing"
        whenToUse="When building a custom tracer for an async agent, ensuring that child spans automatically inherit parent trace IDs without manual threading of IDs through function signatures."
      >
        <p>
          Use language-native context propagation mechanisms — Python's <code>contextvars</code>
          and Node.js's <code>AsyncLocalStorage</code> — to automatically thread trace and span
          IDs through async call stacks. This is the key technique that makes custom tracing
          ergonomic: you start a root span, and all nested async calls automatically create child
          spans without any explicit ID passing.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Write Spans Asynchronously to Avoid Latency Impact">
        <p>
          Synchronously writing spans to disk or network on every event adds measurable latency
          to the agent's hot path. Buffer spans in memory and flush them in batches on a
          background task — every 100 spans or every 5 seconds, whichever comes first. Include
          a graceful shutdown handler that flushes the buffer on process exit. This reduces
          tracing overhead from O(spans) synchronous I/O operations to O(1) background batches.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Start Simple, Migrate to OTel Later">
        <p>
          A JSONL file with trace data is sufficient for early-stage development and small teams.
          When you need distributed tracing across services, multi-team dashboards, or SLA-based
          alerting, migrate to OpenTelemetry — your span schema maps cleanly to OTel spans, and
          you can replace the custom sink with an OTLP exporter. Do not over-engineer the tracing
          system before you understand what questions you actually need to answer.
        </p>
      </NoteBlock>
    </article>
  )
}
