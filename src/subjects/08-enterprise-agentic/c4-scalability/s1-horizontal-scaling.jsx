import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function HorizontalScaling() {
  return (
    <article className="prose-content">
      <h2>Horizontal Scaling for Agent Workloads</h2>
      <p>
        Agent workloads are long-running, IO-bound, and highly concurrent — ideal candidates
        for horizontal scaling. Because each agent run is primarily blocked on LLM API latency
        (seconds per call), a single server can handle many concurrent agent runs with
        async I/O. For higher throughput, scale horizontally with a message queue distributing
        work across a pool of stateless agent workers.
      </p>

      <ArchitectureDiagram
        title="Queue-Based Horizontal Agent Scaling"
        width={700}
        height={260}
        nodes={[
          { id: 'api', label: 'HTTP\nAPI', type: 'external', x: 60, y: 130 },
          { id: 'queue', label: 'Message\nQueue\n(SQS/RabbitMQ)', type: 'store', x: 250, y: 130 },
          { id: 'w1', label: 'Worker 1', type: 'agent', x: 460, y: 60 },
          { id: 'w2', label: 'Worker 2', type: 'agent', x: 460, y: 130 },
          { id: 'w3', label: 'Worker 3', type: 'agent', x: 460, y: 200 },
          { id: 'state', label: 'Shared\nState Store', type: 'store', x: 640, y: 130 },
        ]}
        edges={[
          { from: 'api', to: 'queue', label: 'enqueue' },
          { from: 'queue', to: 'w1' },
          { from: 'queue', to: 'w2' },
          { from: 'queue', to: 'w3' },
          { from: 'w1', to: 'state' },
          { from: 'w2', to: 'state' },
          { from: 'w3', to: 'state' },
        ]}
      />

      <h2>Stateless Agent Design</h2>

      <ConceptBlock term="Stateless Workers">
        <p>
          For horizontal scaling to work, each agent worker must be stateless: any worker
          should be able to pick up any job from the queue and run it to completion. All
          persistent state — conversation history, token counters, partial results — must
          live in an external store (Redis, DynamoDB) keyed by session ID, never in
          worker memory.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Async Agent Worker with Queue Consumption"
        tabs={{
          python: `import asyncio
import anthropic
import json
import logging
import os
import signal
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# --- Job schema ---
@dataclass
class AgentJob:
    job_id: str
    session_id: str
    user_message: str
    callback_url: str = ""  # Where to POST the result

# --- Simulated queue (replace with SQS/RabbitMQ client) ---
class SimpleQueue:
    def __init__(self):
        self._queue: asyncio.Queue = asyncio.Queue()

    async def enqueue(self, job: AgentJob):
        await self._queue.put(job)

    async def dequeue(self, timeout: float = 5.0) -> AgentJob | None:
        try:
            return await asyncio.wait_for(self._queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            return None

queue = SimpleQueue()
client = anthropic.AsyncAnthropic()

# --- Stateless agent runner ---
async def run_agent(job: AgentJob) -> str:
    """
    Stateless: reads and writes state from external store.
    Any worker can execute any job.
    """
    messages = [{"role": "user", "content": job.user_message}]

    while True:
        response = await client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2048,
            messages=messages,
        )
        if response.stop_reason == "end_turn":
            return next(b.text for b in response.content if hasattr(b, "text"))
        # Handle tool calls ...
        messages.append({"role": "assistant", "content": response.content})

# --- Worker process ---
async def worker(worker_id: int, concurrency: int = 10):
    """
    A single worker runs multiple agent jobs concurrently using asyncio.
    Scale horizontally by running multiple worker processes.
    """
    semaphore = asyncio.Semaphore(concurrency)
    active_tasks: set[asyncio.Task] = set()
    shutdown = asyncio.Event()

    def _handle_shutdown(sig, frame):
        logger.info("Worker %d: shutdown signal received", worker_id)
        shutdown.set()

    signal.signal(signal.SIGTERM, _handle_shutdown)
    signal.signal(signal.SIGINT, _handle_shutdown)

    logger.info("Worker %d started (concurrency=%d)", worker_id, concurrency)

    while not shutdown.is_set() or active_tasks:
        if not shutdown.is_set():
            job = await queue.dequeue(timeout=1.0)
            if job:
                async with semaphore:
                    task = asyncio.create_task(_handle_job(job, worker_id))
                    active_tasks.add(task)
                    task.add_done_callback(active_tasks.discard)

        # Yield control to allow active tasks to progress
        await asyncio.sleep(0)

    # Wait for in-flight jobs to complete (graceful shutdown)
    if active_tasks:
        logger.info("Worker %d: waiting for %d active jobs", worker_id, len(active_tasks))
        await asyncio.gather(*active_tasks, return_exceptions=True)

    logger.info("Worker %d: shutdown complete", worker_id)

async def _handle_job(job: AgentJob, worker_id: int):
    logger.info("Worker %d: starting job %s", worker_id, job.job_id)
    try:
        result = await run_agent(job)
        logger.info("Worker %d: completed job %s", worker_id, job.job_id)
        # Store result, post to callback_url, etc.
    except Exception as e:
        logger.error("Worker %d: job %s failed: %s", worker_id, job.job_id, e)

if __name__ == "__main__":
    worker_id = int(os.environ.get("WORKER_ID", "0"))
    concurrency = int(os.environ.get("WORKER_CONCURRENCY", "10"))
    asyncio.run(worker(worker_id, concurrency))`,
        }}
      />

      <h2>Concurrency Model: Async vs. Threads</h2>

      <ConceptBlock term="Async I/O for LLM-Bound Workloads">
        <p>
          Agent runs are overwhelmingly IO-bound: most time is spent waiting for LLM API
          responses (1–30 seconds per call). Async I/O (asyncio + aiohttp) allows a single
          Python process to run hundreds of concurrent agent tasks without thread overhead.
          Use one async worker process per CPU core, with per-worker concurrency of 20–100
          depending on downstream tool latency.
        </p>
      </ConceptBlock>

      <PatternBlock
        name="Worker Autoscaling"
        category="Scalability"
        whenToUse="When agent job volume is bursty — high during business hours, near zero overnight — and you want to scale compute costs proportionally with demand."
      >
        <p>
          Use queue depth as the autoscaling signal. Configure your container orchestrator
          (Kubernetes HPA with KEDA, AWS ECS Service Auto Scaling, or Cloud Run min/max
          instances) to add workers when queue depth exceeds a threshold and remove them
          when the queue is drained. Because workers are stateless, scaling in/out is safe
          and instant.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Set Job Visibility Timeouts Conservatively">
        <p>
          In SQS and similar queues, a message is hidden from other workers for a "visibility
          timeout" while being processed. Set this to at least 2× your p99 agent run duration
          (e.g. if p99 is 120 seconds, set visibility timeout to 300 seconds). If a worker
          crashes mid-job, the message becomes visible again and is retried. If the timeout
          is too short, the same job runs twice — causing duplicate side-effects.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Separate Sync and Async Agent APIs">
        <p>
          Expose two endpoints: a synchronous endpoint for short agent runs (under 10 seconds)
          that blocks until complete, and an asynchronous job endpoint for long-running agents
          that returns a job ID immediately and lets the client poll for results. Most users
          expect fast responses for simple queries; only complex multi-step tasks benefit from
          the async pattern.
        </p>
      </NoteBlock>
    </article>
  )
}
