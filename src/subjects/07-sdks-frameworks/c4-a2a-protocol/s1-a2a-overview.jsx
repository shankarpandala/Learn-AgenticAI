import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const a2aNodes = [
  { id: 'client',  label: 'Client Agent\n(Orchestrator)',    type: 'agent',    x: 60,  y: 150 },
  { id: 'cardA',   label: 'Agent Card A\n(discovery)',       type: 'store',    x: 240, y: 60  },
  { id: 'cardB',   label: 'Agent Card B\n(discovery)',       type: 'store',    x: 240, y: 240 },
  { id: 'agentA',  label: 'Remote Agent A\n(Data Analysis)', type: 'llm',      x: 460, y: 60  },
  { id: 'agentB',  label: 'Remote Agent B\n(Code Gen)',      type: 'llm',      x: 460, y: 240 },
  { id: 'taskA',   label: 'Task / Artifact',                 type: 'tool',     x: 640, y: 60  },
  { id: 'taskB',   label: 'Task / Artifact',                 type: 'tool',     x: 640, y: 240 },
]

const a2aEdges = [
  { from: 'client', to: 'cardA',  label: 'fetch card'    },
  { from: 'client', to: 'cardB',  label: 'fetch card'    },
  { from: 'cardA',  to: 'agentA', label: 'describes'     },
  { from: 'cardB',  to: 'agentB', label: 'describes'     },
  { from: 'client', to: 'agentA', label: 'send task'     },
  { from: 'client', to: 'agentB', label: 'send task'     },
  { from: 'agentA', to: 'taskA',  label: 'produces'      },
  { from: 'agentB', to: 'taskB',  label: 'produces'      },
  { from: 'agentA', to: 'client', label: 'result/stream' },
  { from: 'agentB', to: 'client', label: 'result/stream' },
]

export default function A2aOverview() {
  return (
    <article className="prose-content">
      <h2>Agent-to-Agent (A2A) Protocol</h2>
      <p>
        <strong>Agent-to-Agent (A2A)</strong> is an open protocol announced by Google in
        April 2025 and co-developed with 50+ technology partners. It defines how
        independent AI agents — potentially built on different frameworks and running at
        different vendors — discover each other, delegate tasks, exchange structured
        artifacts, and coordinate long-running workflows. Think of A2A as the HTTP of the
        multi-agent web.
      </p>

      <ConceptBlock term="Agent-to-Agent (A2A) Protocol">
        <p>
          A2A is a JSON/HTTP-based protocol with three core mechanisms:{' '}
          <strong>Agent Cards</strong> for discovery and capability advertisement,{' '}
          <strong>Tasks</strong> for delegating units of work with structured inputs and
          outputs, and <strong>Streaming</strong> (SSE) for long-running task progress.
          It is designed to be complementary to MCP: MCP connects agents to tools and
          data sources; A2A connects agents to other agents.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram nodes={a2aNodes} edges={a2aEdges} title="A2A Multi-Agent Topology" />

      <h2>Core Concepts</h2>

      <h3>Agent Card</h3>
      <p>
        An <strong>Agent Card</strong> is a JSON document (served at{' '}
        <code>/.well-known/agent.json</code>) that describes an agent's identity,
        capabilities, supported input/output modalities, authentication requirements,
        and endpoint URL. Client agents fetch cards to decide whether to delegate a
        task to a remote agent.
      </p>

      <SDKExample
        title="Example Agent Card"
        tabs={{
          json: `{
  "name": "Data Analysis Agent",
  "description": "Analyses CSV/JSON datasets, produces charts and statistical summaries.",
  "url": "https://data-agent.example.com/a2a",
  "version": "1.2.0",
  "provider": {
    "organization": "Acme AI",
    "url": "https://acme.ai"
  },
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": false
  },
  "authentication": {
    "schemes": ["Bearer"]
  },
  "defaultInputModes": ["application/json", "text/plain"],
  "defaultOutputModes": ["application/json", "image/png"],
  "skills": [
    {
      "id": "csv-summary",
      "name": "CSV Summary",
      "description": "Compute descriptive statistics for a CSV file.",
      "tags": ["statistics", "data", "csv"],
      "examples": ["Summarise sales.csv", "What are the top 10 rows by revenue?"]
    },
    {
      "id": "time-series-chart",
      "name": "Time Series Chart",
      "description": "Generate a line chart from time-series data.",
      "tags": ["visualization", "chart"],
      "inputModes": ["application/json"],
      "outputModes": ["image/png"]
    }
  ]
}`,
        }}
      />

      <h3>Tasks</h3>
      <p>
        A <strong>Task</strong> is the fundamental unit of work in A2A. A client agent
        sends a <code>tasks/send</code> request with a unique task ID, a message
        (with parts — text, files, data), and optional metadata. The remote agent
        processes it and returns the result as an artifact.
      </p>

      <SDKExample
        title="A2A task lifecycle (HTTP)"
        tabs={{
          bash: `# 1. Discover the agent
curl https://data-agent.example.com/.well-known/agent.json

# 2. Send a task
curl -X POST https://data-agent.example.com/a2a \\
  -H "Authorization: Bearer $AGENT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tasks/send",
    "params": {
      "id": "task-abc-123",
      "message": {
        "role": "user",
        "parts": [
          {"type": "text", "text": "Summarise the attached CSV."},
          {"type": "file", "file": {"mimeType": "text/csv", "data": "<base64>"}}
        ]
      }
    }
  }'

# 3. Poll for status (or use streaming)
curl -X POST https://data-agent.example.com/a2a \\
  -H "Authorization: Bearer $AGENT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tasks/get",
    "params": {"id": "task-abc-123"}
  }'`,
          python: `import httpx, json, uuid

AGENT_URL = "https://data-agent.example.com/a2a"
HEADERS   = {"Authorization": "Bearer my-token", "Content-Type": "application/json"}

task_id = str(uuid.uuid4())

# Send a task
send_payload = {
    "jsonrpc": "2.0", "id": 1, "method": "tasks/send",
    "params": {
        "id": task_id,
        "message": {
            "role": "user",
            "parts": [{"type": "text", "text": "What are the top 5 products by revenue?"}]
        }
    }
}
with httpx.Client() as client:
    resp = client.post(AGENT_URL, json=send_payload, headers=HEADERS)
    result = resp.json()
    print("Status:", result["result"]["status"]["state"])

    # Poll until done
    import time
    while result["result"]["status"]["state"] not in ("completed", "failed", "canceled"):
        time.sleep(1)
        get_payload = {"jsonrpc": "2.0", "id": 2, "method": "tasks/get",
                       "params": {"id": task_id}}
        resp = client.post(AGENT_URL, json=get_payload, headers=HEADERS)
        result = resp.json()

    task = result["result"]
    if task["status"]["state"] == "completed":
        for artifact in task.get("artifacts", []):
            for part in artifact.get("parts", []):
                if part["type"] == "text":
                    print(part["text"])`,
        }}
      />

      <h3>Streaming with SSE</h3>
      <p>
        For long-running tasks, use <code>tasks/sendSubscribe</code> to receive
        incremental updates via Server-Sent Events as the remote agent streams its output.
      </p>

      <SDKExample
        title="Streaming task subscription"
        tabs={{
          python: `import httpx, json, uuid

AGENT_URL = "https://data-agent.example.com/a2a"
HEADERS   = {"Authorization": "Bearer my-token", "Content-Type": "application/json"}

task_id = str(uuid.uuid4())
payload = {
    "jsonrpc": "2.0", "id": 1, "method": "tasks/sendSubscribe",
    "params": {
        "id": task_id,
        "message": {
            "role": "user",
            "parts": [{"type": "text", "text": "Generate a 1-page market analysis report."}]
        }
    }
}

with httpx.Client(timeout=None) as client:
    with client.stream("POST", AGENT_URL, json=payload, headers=HEADERS) as resp:
        for line in resp.iter_lines():
            if line.startswith("data:"):
                event = json.loads(line[5:].strip())
                # Each event is a TaskStatusUpdateEvent or TaskArtifactUpdateEvent
                if "status" in event:
                    print(f"[{event['status']['state']}]", end="", flush=True)
                if "artifact" in event:
                    for part in event["artifact"].get("parts", []):
                        if part["type"] == "text":
                            print(part["text"], end="", flush=True)`,
          typescript: `async function streamTask(prompt: string): Promise<void> {
  const taskId = crypto.randomUUID();
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "tasks/sendSubscribe",
    params: {
      id: taskId,
      message: {
        role: "user",
        parts: [{ type: "text", text: prompt }],
      },
    },
  };

  const response = await fetch("https://data-agent.example.com/a2a", {
    method: "POST",
    headers: {
      Authorization: "Bearer my-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split("\\n")) {
      if (line.startsWith("data:")) {
        const event = JSON.parse(line.slice(5).trim());
        if (event.artifact) {
          for (const part of event.artifact.parts ?? []) {
            if (part.type === "text") process.stdout.write(part.text);
          }
        }
      }
    }
  }
}

await streamTask("Generate a 1-page market analysis report.");`,
        }}
      />

      <h2>A2A vs MCP — Choosing the Right Protocol</h2>

      <PatternBlock name="A2A + MCP Together">
        <p>
          A2A and MCP are designed to work together. An orchestrator agent uses{' '}
          <strong>A2A to delegate tasks to specialised remote agents</strong>. Each
          remote agent uses <strong>MCP to access its tools and data sources</strong>
          (databases, APIs, file systems). The two protocols operate at different layers:
          A2A is agent-to-agent communication; MCP is agent-to-tool communication.
        </p>
      </PatternBlock>

      <SDKExample
        title="A2A vs MCP at a glance"
        tabs={{
          text: `╔══════════════════╦════════════════════════════╦════════════════════════════╗
║ Dimension        ║ MCP                        ║ A2A                        ║
╠══════════════════╬════════════════════════════╬════════════════════════════╣
║ Purpose          ║ Connect agent to tools     ║ Connect agents to agents   ║
║ Initiated by     ║ Agent (client)             ║ Agent (client)             ║
║ Remote entity    ║ Tool / data server         ║ Another AI agent           ║
║ Transport        ║ stdio, HTTP+SSE, WebSocket ║ HTTP+SSE (JSON-RPC 2.0)   ║
║ Discovery        ║ None built-in              ║ Agent Cards (.well-known)  ║
║ Modalities       ║ Tools, Resources, Prompts  ║ Tasks, Artifacts, Streams  ║
║ Auth             ║ Per-server                 ║ Bearer / OAuth2            ║
║ State            ║ Stateless per call         ║ Stateful task lifecycle    ║
║ Typical use      ║ DB query, file read, API   ║ Delegate to expert agent   ║
╚══════════════════╩════════════════════════════╩════════════════════════════╝`,
        }}
      />

      <BestPracticeBlock title="A2A Best Practices">
        <ul>
          <li>Use <strong>deterministic task IDs</strong> (e.g. <code>sha256(request_content)</code>) so you can safely retry without creating duplicate tasks.</li>
          <li>Always check <code>capabilities.streaming</code> in the Agent Card before subscribing to SSE — fall back to polling if not supported.</li>
          <li>Implement <strong>task cancellation</strong> (<code>tasks/cancel</code>) in your orchestrator for timeout handling and user interruption.</li>
          <li>Cache Agent Cards with a short TTL (5–15 minutes) to avoid hammering discovery endpoints.</li>
          <li>Validate remote agents' Agent Cards against a whitelist before delegating sensitive tasks.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock>
        The A2A Python and TypeScript SDKs are available at{' '}
        <strong>github.com/google/A2A</strong>. The spec and reference implementations
        are maintained by Google and the A2A community. As of mid-2025, AWS, Microsoft,
        SAP, and Salesforce have announced A2A support in their agent platforms.
      </NoteBlock>
    </article>
  )
}
