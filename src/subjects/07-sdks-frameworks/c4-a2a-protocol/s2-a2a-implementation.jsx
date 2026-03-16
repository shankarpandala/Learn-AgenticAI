import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function A2aImplementation() {
  return (
    <article className="prose-content">
      <h2>Implementing A2A Agents</h2>
      <p>
        This section walks through building a complete A2A-compatible agent server and
        an orchestrator that delegates tasks to it, using the official Python and
        TypeScript SDKs from the A2A open-source project.
      </p>

      <h2>Installing the A2A SDK</h2>

      <SDKExample
        title="A2A SDK setup"
        tabs={{
          bash: `# Python A2A SDK (from the google/A2A repo)
pip install a2a-sdk

# TypeScript A2A SDK
npm install @google/a2a`,
        }}
      />

      <h2>Building an A2A Agent Server</h2>

      <SDKExample
        title="Complete A2A agent server (Python)"
        tabs={{
          python: `import asyncio, uuid
from a2a.server import A2AServer, AgentCard, AgentSkill, AgentCapabilities
from a2a.types import Task, TaskStatus, TaskState, Message, TextPart, Artifact
import anthropic

# ── Agent Card ──────────────────────────────────────────────────────────────
card = AgentCard(
    name="Summarisation Agent",
    description="Summarises text documents using Claude.",
    url="http://localhost:9000",
    version="1.0.0",
    capabilities=AgentCapabilities(streaming=True),
    skills=[
        AgentSkill(
            id="summarise",
            name="Summarise Text",
            description="Produce a concise summary of a document.",
            tags=["summarisation", "nlp"],
            examples=["Summarise this article in 3 bullet points."],
        )
    ],
)

# ── Task Handler ─────────────────────────────────────────────────────────────
claude = anthropic.Anthropic()

async def handle_task(task: Task):
    """Process an incoming A2A task and yield status/artifact updates."""
    # Extract text from the incoming message parts
    user_text = " ".join(
        p.text for p in task.message.parts if isinstance(p, TextPart)
    )

    # Stream Claude's response
    full_text = ""
    with claude.messages.stream(
        model="claude-opus-4-6",
        max_tokens=512,
        messages=[
            {"role": "system", "content": "You are a concise summarisation agent."},
            {"role": "user", "content": f"Summarise the following:\\n\\n{user_text}"},
        ],
    ) as stream:
        for chunk in stream.text_stream:
            full_text += chunk
            # Yield incremental artifact updates
            yield TaskStatus(state=TaskState.working), Artifact(
                parts=[TextPart(text=full_text)], index=0, append=True
            )

    # Final completed status
    yield TaskStatus(state=TaskState.completed), Artifact(
        parts=[TextPart(text=full_text)], index=0, lastChunk=True
    )

# ── Run Server ───────────────────────────────────────────────────────────────
server = A2AServer(agent_card=card, handle_task=handle_task, port=9000)

if __name__ == "__main__":
    asyncio.run(server.start())`,
        }}
      />

      <h2>Building an A2A Orchestrator</h2>

      <SDKExample
        title="Orchestrator agent that delegates to remote agents"
        tabs={{
          python: `import asyncio
from a2a.client import A2AClient

async def orchestrate(documents: list[str]) -> list[str]:
    """Delegate summarisation of each document to the remote A2A agent."""
    async with A2AClient.from_agent_card_url(
        "http://localhost:9000/.well-known/agent.json"
    ) as client:
        summaries = []
        for doc in documents:
            # Stream the task
            full_summary = ""
            async for update in client.send_task_streaming(
                message={"role": "user", "parts": [{"type": "text", "text": doc}]}
            ):
                if update.artifact:
                    for part in update.artifact.parts:
                        if part.type == "text":
                            full_summary = part.text   # replace (append=True means incremental)
            summaries.append(full_summary)
        return summaries

docs = [
    "The Anthropic Model Context Protocol (MCP) ...",
    "Google's Agent-to-Agent (A2A) protocol ...",
]
results = asyncio.run(orchestrate(docs))
for r in results:
    print("---")
    print(r)`,
          typescript: `import { A2AClient } from "@google/a2a";

async function orchestrate(documents: string[]): Promise<string[]> {
  const client = await A2AClient.fromAgentCardUrl(
    "http://localhost:9000/.well-known/agent.json"
  );

  const summaries: string[] = [];

  for (const doc of documents) {
    let summary = "";
    const stream = client.sendTaskStreaming({
      message: { role: "user", parts: [{ type: "text", text: doc }] },
    });

    for await (const update of stream) {
      if (update.artifact) {
        for (const part of update.artifact.parts ?? []) {
          if (part.type === "text") summary = part.text;
        }
      }
    }
    summaries.push(summary);
  }

  await client.close();
  return summaries;
}

const summaries = await orchestrate([
  "The Anthropic Model Context Protocol (MCP) ...",
  "Google's Agent-to-Agent (A2A) protocol ...",
]);
summaries.forEach((s) => console.log("---\\n" + s));`,
        }}
      />

      <h2>Multi-Agent Pipeline with A2A</h2>
      <p>
        A common pattern is a <strong>pipeline orchestrator</strong> that fans out tasks
        to specialised agents and aggregates results — a research agent, an analysis agent,
        and a writing agent working in sequence.
      </p>

      <SDKExample
        title="Fan-out orchestration"
        tabs={{
          python: `import asyncio
from a2a.client import A2AClient

AGENTS = {
    "research": "http://research-agent.internal/.well-known/agent.json",
    "analysis": "http://analysis-agent.internal/.well-known/agent.json",
    "writer":   "http://writer-agent.internal/.well-known/agent.json",
}

async def run_pipeline(topic: str) -> str:
    # Step 1: Research (parallel sub-tasks could be added here)
    async with A2AClient.from_agent_card_url(AGENTS["research"]) as client:
        research_result = await client.send_task(
            message={"role": "user", "parts": [{"type": "text",
                "text": f"Research the latest developments in: {topic}"}]}
        )
    research_text = _extract_text(research_result)

    # Step 2: Analysis
    async with A2AClient.from_agent_card_url(AGENTS["analysis"]) as client:
        analysis_result = await client.send_task(
            message={"role": "user", "parts": [{"type": "text",
                "text": f"Analyse this research:\\n{research_text}"}]}
        )
    analysis_text = _extract_text(analysis_result)

    # Step 3: Writing
    async with A2AClient.from_agent_card_url(AGENTS["writer"]) as client:
        final_result = await client.send_task(
            message={"role": "user", "parts": [{"type": "text",
                "text": f"Write a 500-word report based on:\\n{analysis_text}"}]}
        )
    return _extract_text(final_result)

def _extract_text(task) -> str:
    for artifact in (task.artifacts or []):
        for part in artifact.parts:
            if part.type == "text":
                return part.text
    return ""

report = asyncio.run(run_pipeline("quantum computing in 2025"))
print(report)`,
        }}
      />

      <h2>Push Notifications</h2>
      <p>
        For long-running tasks that may take minutes or hours, use A2A's push notification
        capability. The client registers a webhook; the server POSTs status updates as
        they occur.
      </p>

      <SDKExample
        title="Push notification subscription"
        tabs={{
          python: `from a2a.client import A2AClient, PushNotificationConfig

async def submit_with_webhook(task_text: str):
    async with A2AClient.from_agent_card_url(
        "http://analysis-agent.internal/.well-known/agent.json"
    ) as client:
        task_id = await client.send_task_with_push(
            message={"role": "user", "parts": [{"type": "text", "text": task_text}]},
            push_config=PushNotificationConfig(
                url="https://my-app.example.com/webhooks/a2a",
                token="webhook-secret-abc",
            ),
        )
        print(f"Task submitted: {task_id} — webhook will receive updates.")`,
          bash: `# Your webhook endpoint receives POSTs like:
# {
#   "id": "task-abc-123",
#   "status": {"state": "completed"},
#   "artifacts": [{"parts": [{"type": "text", "text": "..."}]}]
# }`,
        }}
      />

      <SecurityCallout title="Inter-Agent Trust" severity="high">
        <p>
          When your orchestrator delegates to remote agents, validate their Agent Cards
          against an allowlist of trusted domains. Use mutual TLS or signed tokens to
          authenticate both sides. Never delegate tasks containing credentials, PII, or
          proprietary data to agents you don't control. Always set task timeouts and
          implement cancellation.
        </p>
      </SecurityCallout>

      <PatternBlock name="Idempotent Task IDs">
        <p>
          Generate task IDs deterministically from the task content (e.g.{' '}
          <code>sha256(agent_url + task_payload)</code>). This lets you safely retry
          failed requests without accidentally creating duplicate tasks on the remote agent.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="A2A Implementation Checklist">
        <ul>
          <li>Serve your Agent Card at <code>/.well-known/agent.json</code> with correct CORS headers.</li>
          <li>Implement <code>tasks/cancel</code> — orchestrators rely on it for timeouts.</li>
          <li>Validate <code>Authorization</code> headers on every request to your agent server.</li>
          <li>Return <code>TaskState.failed</code> with a descriptive error message rather than returning HTTP 500.</li>
          <li>Test with the A2A Inspector CLI: <code>npx @google/a2a-inspector http://localhost:9000</code>.</li>
        </ul>
      </BestPracticeBlock>
    </article>
  )
}
