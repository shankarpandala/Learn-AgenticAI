import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ParallelAgents() {
  return (
    <article className="prose-content">
      <h2>Parallel Agent Execution</h2>

      <p>
        Parallel agent execution is the strategy of running multiple agent tasks simultaneously
        rather than sequentially. When a task decomposes into independent subtasks — where
        the output of one subtask does not influence the execution of another — running those
        subtasks in parallel can dramatically reduce the wall-clock time to produce a final
        result. A research task that would take 60 seconds with five sequential web searches
        can complete in 15 seconds when those searches run concurrently.
      </p>

      <ConceptBlock term="Fork-Join Pattern">
        The fork-join pattern is the core mechanism for parallel agent execution. At a "fork"
        point, a single execution thread splits into multiple parallel threads, each running
        an independent agent or subtask. At a "join" point, all parallel threads synchronize:
        execution does not continue past the join until all forked threads have completed
        (or been marked as failed or timed out). The joined results are then processed as
        a unified set.
      </ConceptBlock>

      <h2>Independence Requirements</h2>

      <p>
        Parallel execution only produces correct results if the parallel tasks are genuinely
        independent. Two tasks are independent if:
      </p>
      <ul>
        <li>Neither task's output is required as input by the other</li>
        <li>Neither task modifies shared state that the other reads</li>
        <li>Neither task's cost or latency affects the other's execution</li>
      </ul>
      <p>
        If tasks have data dependencies, they must be sequenced. If they have state
        dependencies (both writing to the same database record), concurrent execution requires
        careful synchronization or serialization. Incorrectly parallelizing dependent tasks
        produces non-deterministic, hard-to-debug failures.
      </p>

      <h2>Implementing Fork-Join in Python and TypeScript</h2>

      <SDKExample
        title="Fork-Join Parallel Agent Execution"
        tabs={{
          python: `import asyncio
import json
import time
from anthropic import Anthropic

client = Anthropic()

# ---------------------------------------------------------------------------
# Worker coroutine — runs a single agent task asynchronously
# ---------------------------------------------------------------------------

async def run_agent_task(task_id: str, system_prompt: str, user_prompt: str) -> dict:
    """Run a single agent task asynchronously. Returns a result dict with metadata."""
    start = time.time()
    try:
        # Run synchronous Anthropic SDK call in a thread pool
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.messages.create(
                model="claude-opus-4-6",
                max_tokens=512,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
        )
        text = next((b.text for b in response.content if hasattr(b, "text")), "")
        return {
            "task_id": task_id,
            "status": "success",
            "output": text,
            "duration_ms": int((time.time() - start) * 1000),
            "tokens": response.usage.input_tokens + response.usage.output_tokens,
        }
    except Exception as e:
        return {
            "task_id": task_id,
            "status": "failed",
            "error": str(e),
            "duration_ms": int((time.time() - start) * 1000),
            "tokens": 0,
        }

# ---------------------------------------------------------------------------
# Fork-join orchestrator
# ---------------------------------------------------------------------------

async def fork_join(tasks: list[dict], max_concurrency: int = 5) -> list[dict]:
    """
    Fork multiple agent tasks, run them concurrently (up to max_concurrency),
    and join (wait for all) before returning results.
    """
    semaphore = asyncio.Semaphore(max_concurrency)

    async def run_with_semaphore(task: dict) -> dict:
        async with semaphore:
            return await run_agent_task(
                task_id=task["task_id"],
                system_prompt=task["system_prompt"],
                user_prompt=task["user_prompt"],
            )

    # FORK: start all tasks concurrently
    coroutines = [run_with_semaphore(task) for task in tasks]

    # JOIN: wait for all to complete (use return_exceptions=True to handle individual failures)
    results = await asyncio.gather(*coroutines, return_exceptions=False)
    return list(results)

# ---------------------------------------------------------------------------
# Example: parallel topic research
# ---------------------------------------------------------------------------

RESEARCHER_SYSTEM = """You are a concise research assistant. Answer the given question
in 2-3 sentences with key facts. Be direct and specific."""

async def parallel_research(main_topic: str, subtopics: list[str]) -> str:
    """Research multiple subtopics in parallel, then synthesize into a final answer."""
    # FORK: create tasks for all subtopics
    tasks = [
        {
            "task_id": f"research_{i}",
            "system_prompt": RESEARCHER_SYSTEM,
            "user_prompt": f"What are the key facts about '{subtopic}' as it relates to {main_topic}?"
        }
        for i, subtopic in enumerate(subtopics)
    ]

    print(f"Forking {len(tasks)} research tasks...")
    start = time.time()

    # JOIN: collect all results
    results = await fork_join(tasks, max_concurrency=3)
    elapsed = time.time() - start

    successful = [r for r in results if r["status"] == "success"]
    failed = [r for r in results if r["status"] == "failed"]
    total_tokens = sum(r.get("tokens", 0) for r in results)

    print(f"Join complete: {len(successful)}/{len(tasks)} succeeded in {elapsed:.1f}s, {total_tokens} tokens")

    if failed:
        print(f"Failed tasks: {[r['task_id'] for r in failed]}")

    if not successful:
        return "All research tasks failed."

    # Synthesis step: combine all research into a unified answer
    research_combined = "\\n\\n".join(
        f"[{subtopics[int(r['task_id'].split('_')[1])]}]\\n{r['output']}"
        for r in successful
    )

    synthesis_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system="You are a synthesis specialist. Combine research findings into a coherent, well-structured answer.",
        messages=[{
            "role": "user",
            "content": f"Topic: {main_topic}\\n\\nResearch findings:\\n{research_combined}\\n\\nSynthesize into a comprehensive answer."
        }],
    )
    return next((b.text for b in synthesis_response.content if hasattr(b, "text")), "")


async def main():
    result = await parallel_research(
        main_topic="machine learning model deployment",
        subtopics=[
            "containerization with Docker",
            "model serving frameworks",
            "API gateway patterns",
            "monitoring and observability",
            "A/B testing and canary deployments",
        ]
    )
    print("\\n=== SYNTHESIZED RESULT ===")
    print(result)

asyncio.run(main())`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// ---------------------------------------------------------------------------
// Worker function — runs a single agent task
// ---------------------------------------------------------------------------

interface TaskSpec {
  taskId: string;
  systemPrompt: string;
  userPrompt: string;
}

interface TaskResult {
  taskId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  durationMs: number;
  tokens: number;
}

async function runAgentTask(spec: TaskSpec): Promise<TaskResult> {
  const start = Date.now();
  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6", max_tokens: 512, system: spec.systemPrompt,
      messages: [{ role: "user", content: spec.userPrompt }],
    });
    const text = response.content.find((b) => b.type === "text");
    return {
      taskId: spec.taskId, status: "success",
      output: text && "text" in text ? text.text : "",
      durationMs: Date.now() - start,
      tokens: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (err) {
    return { taskId: spec.taskId, status: "failed", error: String(err), durationMs: Date.now() - start, tokens: 0 };
  }
}

// ---------------------------------------------------------------------------
// Fork-join with concurrency limiting
// ---------------------------------------------------------------------------

async function forkJoin(tasks: TaskSpec[], maxConcurrency = 5): Promise<TaskResult[]> {
  // Process in batches to limit concurrency
  const results: TaskResult[] = [];
  for (let i = 0; i < tasks.length; i += maxConcurrency) {
    const batch = tasks.slice(i, i + maxConcurrency);
    const batchResults = await Promise.all(batch.map(runAgentTask));
    results.push(...batchResults);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Parallel research example
// ---------------------------------------------------------------------------

const RESEARCHER_SYSTEM = You are a concise research assistant. Answer in 2-3 sentences
with key facts. Be direct and specific.;

async function parallelResearch(mainTopic: string, subtopics: string[]): Promise<string> {
  const tasks: TaskSpec[] = subtopics.map((subtopic, i) => ({
    taskId: research_\${i},
    systemPrompt: RESEARCHER_SYSTEM,
    userPrompt: What are the key facts about '\${subtopic}' as it relates to \${mainTopic}?,
  }));

  console.log(Forking \${tasks.length} research tasks...);
  const start = Date.now();

  // FORK + JOIN
  const results = await forkJoin(tasks, 3);
  const elapsed = (Date.now() - start) / 1000;

  const successful = results.filter((r) => r.status === "success");
  const failed = results.filter((r) => r.status === "failed");
  const totalTokens = results.reduce((sum, r) => sum + r.tokens, 0);
  console.log(Join complete: \${successful.length}/\${tasks.length} succeeded in \${elapsed.toFixed(1)}s, \${totalTokens} tokens);
  if (failed.length > 0) console.log("Failed:", failed.map((r) => r.taskId));

  if (successful.length === 0) return "All research tasks failed.";

  const researchCombined = successful
    .map((r) => [\${subtopics[parseInt(r.taskId.split("_")[1])]}]\\n\${r.output})
    .join("\\n\\n");

  const synthResponse = await client.messages.create({
    model: "claude-opus-4-6", max_tokens: 1024,
    system: "You are a synthesis specialist. Combine research findings into a coherent answer.",
    messages: [{ role: "user", content: Topic: \${mainTopic}\\n\\nFindings:\\n\${researchCombined}\\n\\nSynthesize a comprehensive answer. }],
  });
  const text = synthResponse.content.find((b) => b.type === "text");
  return text && "text" in text ? text.text : "";
}

parallelResearch("machine learning model deployment", [
  "containerization with Docker",
  "model serving frameworks",
  "API gateway patterns",
  "monitoring and observability",
  "A/B testing and canary deployments",
]).then((result) => {
  console.log("\\n=== SYNTHESIZED RESULT ===");
  console.log(result);
});`
        }}
      />

      <h2>Synchronization Strategies</h2>

      <h3>Wait-for-All (barrier synchronization)</h3>
      <p>
        The simplest join strategy: wait for every parallel task to complete before proceeding.
        This guarantees the synthesizer receives all results but means the total time is
        bounded by the slowest task. If one task takes much longer than others, all workers
        sit idle waiting. Use asyncio.gather in Python or Promise.all in TypeScript.
      </p>

      <h3>Wait-for-First-N</h3>
      <p>
        If N results are sufficient (you don't need all of them), proceed as soon as N tasks
        complete. This bounds latency by the Nth-fastest task rather than the slowest.
        Useful for redundant search tasks where any 3 of 5 results are sufficient.
        In Python, use asyncio.wait with return_when=FIRST_N_COMPLETED.
      </p>

      <h3>Progressive Synthesis</h3>
      <p>
        Begin synthesis as each result arrives rather than waiting for all results. A streaming
        synthesis agent can incorporate each new result into the evolving answer, producing
        a partial result that improves continuously as more parallel tasks complete. This is
        more complex to implement but provides better user experience for long-running
        parallel tasks.
      </p>

      <PatternBlock
        name="Bounded Parallelism with Semaphore"
        category="Parallel Execution"
        description="Always limit concurrent LLM API calls with a semaphore or concurrency limiter. Unbounded parallelism triggers rate limits, produces cascading failures, and makes cost unpredictable. A concurrency limit of 3–10 concurrent agent calls is appropriate for most use cases. Monitor your API rate limit headers and set the limit conservatively — hitting rate limits is more disruptive than slightly lower parallelism."
        when={[
          "Any fan-out with more than 3 parallel tasks",
          "Systems with many concurrent users each running parallel agent tasks",
          "High-volume batch processing with parallel agent execution"
        ]}
        avoid={[
          "asyncio.gather or Promise.all on unbounded lists of tasks",
          "Per-user parallelism without a global concurrency cap",
          "Treating rate limit errors as permanent failures rather than retriable backpressure"
        ]}
      />

      <BestPracticeBlock title="Collect partial results when parallel tasks fail">
        When one or more parallel tasks fail, do not abort the entire fork-join. Collect
        results from successful tasks, mark failed tasks explicitly, and proceed to synthesis
        with whatever is available. The synthesizer can acknowledge missing components in
        the final output. A partial result that clearly indicates what is missing is more
        useful than a complete failure with no output.
      </BestPracticeBlock>

      <WarningBlock title="Parallel writes to shared state cause race conditions">
        If parallel agents write to the same external resource — a database, a file, a shared
        document — race conditions can produce corrupted state. Before parallelizing agents
        that write to shared state, design a consistency strategy: partition the write space
        so agents never write to overlapping sections, use optimistic locking with retries,
        or collect writes centrally and apply them serially after all agents complete.
      </WarningBlock>

      <NoteBlock title="Parallel overhead is real for small task counts">
        Parallelism has overhead: spawning async tasks, managing a semaphore, and running
        a join step all take time. For 2–3 tasks that each complete in under a second, the
        overhead may exceed the latency benefit of parallelism. Measure before assuming
        parallel is always faster than sequential for small task counts.
      </NoteBlock>
    </article>
  )
}
