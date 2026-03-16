import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function LlamaIndexWorkflows() {
  return (
    <article className="prose-content">
      <h2>LlamaIndex Workflows</h2>
      <p>
        LlamaIndex Workflows provide an event-driven, step-based abstraction for building complex
        agentic pipelines. Unlike agent loops, Workflows give you fine-grained control over
        execution order, branching, parallelism, and state — making them ideal for production
        multi-step AI pipelines.
      </p>

      <ConceptBlock term="LlamaIndex Workflow">
        <p>
          A <strong>Workflow</strong> is a class where each method decorated with
          <code>@step</code> is a unit of execution. Steps communicate via typed
          <strong>Events</strong> — a step declares which event types it consumes and emits.
          The workflow engine routes events to the appropriate steps automatically,
          enabling both sequential and parallel execution patterns.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="LlamaIndex Workflow Event Flow"
        width={680}
        height={260}
        nodes={[
          { id: 'start', label: 'StartEvent', type: 'external', x: 60, y: 130 },
          { id: 'retrieve', label: 'retrieve()\nstep', type: 'tool', x: 200, y: 130 },
          { id: 'grade', label: 'grade()\nstep', type: 'agent', x: 360, y: 130 },
          { id: 'generate', label: 'generate()\nstep', type: 'llm', x: 520, y: 80 },
          { id: 'rewrite', label: 'rewrite()\nstep', type: 'agent', x: 520, y: 200 },
          { id: 'stop', label: 'StopEvent', type: 'external', x: 640, y: 130 },
        ]}
        edges={[
          { from: 'start', to: 'retrieve', label: 'StartEvent' },
          { from: 'retrieve', to: 'grade', label: 'RetrieveEvent' },
          { from: 'grade', to: 'generate', label: 'RelevantDocsEvent' },
          { from: 'grade', to: 'rewrite', label: 'IrrelevantDocsEvent' },
          { from: 'rewrite', to: 'retrieve', label: 'RetryEvent' },
          { from: 'generate', to: 'stop', label: 'StopEvent' },
        ]}
      />

      <h2>Events and Steps</h2>
      <p>
        Events are Pydantic models that carry data between steps. The type system ensures
        steps only receive the events they're designed to handle.
      </p>

      <SDKExample
        title="Defining Events and a Basic Workflow"
        tabs={{
          python: `from llama_index.core.workflow import (
    Workflow,
    step,
    Event,
    StartEvent,
    StopEvent,
    Context,
)
from llama_index.llms.anthropic import Anthropic
from pydantic import Field

# Define custom events to carry data between steps
class QueryEvent(Event):
    query: str

class RetrievedDocsEvent(Event):
    query: str
    documents: list[str]
    scores: list[float]

class GradedDocsEvent(Event):
    query: str
    relevant_docs: list[str]

class RewriteEvent(Event):
    original_query: str
    rewrite_reason: str

# Simple linear workflow
class BasicRAGWorkflow(Workflow):
    """A simple retrieve-grade-generate workflow."""

    @step
    async def retrieve(self, ctx: Context, ev: StartEvent) -> RetrievedDocsEvent:
        """Retrieve documents for the query."""
        query = ev.get("query", "")

        # In production, query your vector store here
        docs = [f"Document about {query} #{i}" for i in range(5)]
        scores = [0.95 - i * 0.05 for i in range(5)]

        return RetrievedDocsEvent(query=query, documents=docs, scores=scores)

    @step
    async def grade(self, ctx: Context, ev: RetrievedDocsEvent) -> GradedDocsEvent:
        """Grade retrieved documents for relevance."""
        llm = Anthropic(model="claude-opus-4-6")

        relevant = []
        for doc, score in zip(ev.documents, ev.scores):
            if score >= 0.75:  # Simple score threshold
                relevant.append(doc)

        return GradedDocsEvent(query=ev.query, relevant_docs=relevant)

    @step
    async def generate(self, ctx: Context, ev: GradedDocsEvent) -> StopEvent:
        """Generate the final answer."""
        llm = Anthropic(model="claude-opus-4-6")

        context = "\\n".join(ev.relevant_docs)
        prompt = f"Context:\\n{context}\\n\\nQuestion: {ev.query}\\nAnswer:"

        response = await llm.acomplete(prompt)
        return StopEvent(result=response.text)

# Run the workflow
import asyncio

async def main():
    workflow = BasicRAGWorkflow(timeout=60, verbose=True)
    result = await workflow.run(query="What is HNSW indexing?")
    print(result)

asyncio.run(main())`,
        }}
      />

      <h2>Branching and Loops</h2>
      <p>
        Workflows can branch conditionally and loop back by emitting different event types.
        A step can emit different event classes based on its logic.
      </p>

      <SDKExample
        title="Conditional Branching and Retry Loops"
        tabs={{
          python: `from llama_index.core.workflow import (
    Workflow, step, Event, StartEvent, StopEvent, Context
)
from llama_index.llms.anthropic import Anthropic
from typing import Union

class RelevantDocsEvent(Event):
    query: str
    documents: list[str]

class IrrelevantDocsEvent(Event):
    query: str
    reason: str
    attempt: int

class CRAGWorkflow(Workflow):
    """Corrective RAG: retrieve, grade, rewrite if needed."""

    MAX_RETRIES = 3

    @step
    async def retrieve(
        self,
        ctx: Context,
        ev: Union[StartEvent, IrrelevantDocsEvent],
    ) -> Union[RelevantDocsEvent, IrrelevantDocsEvent]:
        """Retrieve documents. Handles both first query and rewrites."""
        if isinstance(ev, StartEvent):
            query = ev.get("query", "")
            attempt = 0
        else:
            query = ev.query  # Rewritten query
            attempt = ev.attempt

        # Simulate retrieval
        docs = [f"Doc for '{query}' attempt {attempt}"]
        has_relevant = attempt >= 1  # Simulate relevance after rewrite

        if has_relevant:
            return RelevantDocsEvent(query=query, documents=docs)
        elif attempt < self.MAX_RETRIES:
            return IrrelevantDocsEvent(
                query=query,
                reason="No relevant documents found",
                attempt=attempt + 1,
            )
        else:
            # Max retries: force generation with what we have
            return RelevantDocsEvent(query=query, documents=docs)

    @step
    async def rewrite_query(
        self, ctx: Context, ev: IrrelevantDocsEvent
    ) -> IrrelevantDocsEvent:
        """Rewrite the query to improve retrieval."""
        llm = Anthropic(model="claude-opus-4-6")
        response = await llm.acomplete(
            f"Rewrite this search query to be more specific: {ev.query}"
        )
        return IrrelevantDocsEvent(
            query=response.text.strip(),
            reason=ev.reason,
            attempt=ev.attempt,
        )

    @step
    async def generate(
        self, ctx: Context, ev: RelevantDocsEvent
    ) -> StopEvent:
        """Generate answer from relevant documents."""
        llm = Anthropic(model="claude-opus-4-6")
        context = "\\n".join(ev.documents)
        response = await llm.acomplete(
            f"Answer based on context:\\n{context}\\n\\nQuestion: {ev.query}"
        )
        return StopEvent(result=response.text)

import asyncio
workflow = CRAGWorkflow(timeout=120, verbose=True)
result = asyncio.run(workflow.run(query="What is the best chunking strategy for code?"))
print(result)`,
        }}
      />

      <h2>Parallel Steps</h2>
      <p>
        Multiple steps can run in parallel when they consume different event types emitted
        simultaneously. Use <code>ctx.collect_events()</code> to gather results from parallel
        branches before proceeding.
      </p>

      <SDKExample
        title="Parallel Execution"
        tabs={{
          python: `from llama_index.core.workflow import (
    Workflow, step, Event, StartEvent, StopEvent, Context
)
from typing import Optional

class SearchEvent(Event):
    source: str  # "vector" or "keyword"
    results: list[str]

class ParallelSearchWorkflow(Workflow):
    """Run vector and keyword search in parallel, then fuse results."""

    @step
    async def dispatch(self, ctx: Context, ev: StartEvent) -> None:
        """Emit multiple events to trigger parallel execution."""
        query = ev.get("query", "")
        await ctx.set("query", query)

        # Dispatch both searches simultaneously
        ctx.send_event(SearchEvent(source="vector", results=[]))
        ctx.send_event(SearchEvent(source="keyword", results=[]))

    @step
    async def vector_search(self, ctx: Context, ev: SearchEvent) -> SearchEvent:
        """Semantic vector search."""
        if ev.source != "vector":
            return  # Ignore keyword events
        query = await ctx.get("query")
        results = [f"Vector result for {query} #{i}" for i in range(3)]
        return SearchEvent(source="vector", results=results)

    @step
    async def keyword_search(self, ctx: Context, ev: SearchEvent) -> SearchEvent:
        """BM25 keyword search."""
        if ev.source != "keyword":
            return  # Ignore vector events
        query = await ctx.get("query")
        results = [f"Keyword result for {query} #{i}" for i in range(3)]
        return SearchEvent(source="keyword", results=results)

    @step
    async def fuse_and_generate(
        self, ctx: Context, ev: SearchEvent
    ) -> Optional[StopEvent]:
        """Wait for both searches, then generate answer."""
        # Collect both events before proceeding
        events = ctx.collect_events(ev, [SearchEvent, SearchEvent])
        if events is None:
            return None  # Still waiting for the second event

        all_results = []
        for search_event in events:
            all_results.extend(search_event.results)

        query = await ctx.get("query")
        from llama_index.llms.anthropic import Anthropic
        llm = Anthropic(model="claude-opus-4-6")
        context = "\\n".join(all_results)
        response = await llm.acomplete(f"Context:\\n{context}\\n\\nQuestion: {query}")
        return StopEvent(result=response.text)

import asyncio
wf = ParallelSearchWorkflow(timeout=60, verbose=True)
result = asyncio.run(wf.run(query="What is hybrid search?"))
print(result)`,
        }}
      />

      <h2>Workflow Context and State</h2>
      <p>
        The <code>Context</code> object provides shared mutable state across all steps in a
        workflow run. Use it to store intermediate results, configuration, and counters.
      </p>

      <SDKExample
        title="Using Workflow Context"
        tabs={{
          python: `from llama_index.core.workflow import Workflow, step, Context, StartEvent, StopEvent

class StatefulWorkflow(Workflow):

    @step
    async def step_one(self, ctx: Context, ev: StartEvent) -> StopEvent:
        # Store values in context (available to all subsequent steps)
        await ctx.set("query", ev.get("query"))
        await ctx.set("attempt_count", 0)
        await ctx.set("retrieved_docs", [])

        # Retrieve the stored value
        query = await ctx.get("query")

        # Increment a counter
        count = await ctx.get("attempt_count", default=0)
        await ctx.set("attempt_count", count + 1)

        return StopEvent(result=f"Processed: {query}")

# Workflows can also be checkpointed for long-running tasks
# and resumed after interruption — useful for human-in-the-loop
from llama_index.core.workflow.checkpointer import WorkflowCheckpointer

checkpointer = WorkflowCheckpointer(workflow=StatefulWorkflow())
# run_id = await checkpointer.arun(query="...") — saves state after each step
# result = await checkpointer.aresume(run_id)   — resumes from last checkpoint`,
        }}
      />

      <PatternBlock
        name="Human-in-the-Loop Workflow"
        category="Approval Gates"
        whenToUse="When a workflow step requires human review before proceeding — e.g., approving a generated document, validating extracted data, or authorising a write operation."
      >
        <p>
          Use <code>ctx.wait_for_event(HumanApprovalEvent)</code> to pause a workflow step
          until an external event arrives. This enables approval gates, content moderation
          checkpoints, and human review flows without blocking the server thread.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Keep Steps Small and Single-Purpose">
        <p>Each step should do one thing: retrieve, grade, generate, transform, or validate.
        This makes the workflow easy to debug (each step's input/output is logged separately),
        reuse (swap the retrieval step without changing generation), and test (unit test each
        step in isolation with mock events). Large monolithic steps defeat the purpose of
        the Workflow abstraction.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Visualising Workflows">
        <p>LlamaIndex can generate a Mermaid diagram of your Workflow's event graph with
        <code>workflow.draw(filename="workflow.png")</code> (requires <code>pyvis</code>).
        Use this to validate the flow and share with stakeholders who aren't reading code.
        The diagram is generated from the step type annotations, so keeping them accurate
        also keeps the diagram accurate.</p>
      </NoteBlock>
    </article>
  )
}
