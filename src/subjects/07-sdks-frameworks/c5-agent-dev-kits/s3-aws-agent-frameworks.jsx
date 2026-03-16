import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const strandsNodes = [
  { id: 'app',      label: 'Python App',             type: 'agent',    x: 60,  y: 150 },
  { id: 'agent',    label: 'Strands Agent',           type: 'llm',      x: 230, y: 150 },
  { id: 'model',    label: 'Bedrock Model\n(Claude / Nova)', type: 'llm', x: 420, y: 60  },
  { id: 'tools',    label: 'Tool Registry',           type: 'tool',     x: 420, y: 150 },
  { id: 'memory',   label: 'Memory Store',            type: 'store',    x: 420, y: 240 },
  { id: 'aws',      label: 'AWS Services\n(S3, Lambda…)', type: 'external', x: 620, y: 150 },
]

const strandsEdges = [
  { from: 'app',    to: 'agent',  label: 'agent()'    },
  { from: 'agent',  to: 'model',  label: 'converse'   },
  { from: 'agent',  to: 'tools',  label: 'dispatch'   },
  { from: 'agent',  to: 'memory', label: 'read/write' },
  { from: 'tools',  to: 'aws',    label: 'call'       },
  { from: 'model',  to: 'agent',  label: 'response'   },
]

export default function AwsAgentFrameworks() {
  return (
    <article className="prose-content">
      <h2>AWS Agent Frameworks</h2>
      <p>
        AWS offers two complementary approaches to building AI agents:{' '}
        <strong>Amazon Strands Agents SDK</strong> — a lightweight open-source Python
        framework for code-first agent development — and{' '}
        <strong>Amazon Bedrock Agents</strong> — a fully managed service that handles
        orchestration, RAG, and action groups without writing a loop yourself.
      </p>

      <h2>Amazon Strands Agents SDK</h2>

      <ConceptBlock term="Amazon Strands Agents SDK">
        <p>
          Strands (open-sourced by AWS in May 2025) takes a model-driven approach: define
          tools as Python functions decorated with <code>@tool</code>, pass them to an{' '}
          <code>Agent</code>, and call the agent like a function. Strands drives the
          agentic loop via Bedrock's <code>converse</code> API, supports streaming,
          multi-agent orchestration, and integrates with MCP servers natively. It works
          with any Bedrock-hosted model (Claude, Nova, Llama, Mistral, etc.).
        </p>
      </ConceptBlock>

      <ArchitectureDiagram nodes={strandsNodes} edges={strandsEdges} title="Strands Agent Architecture" />

      <h2>Strands — Installation & First Agent</h2>

      <SDKExample
        title="Install and run a Strands agent"
        tabs={{
          bash: `pip install strands-agents strands-agents-tools

# Configure AWS credentials (or use IAM roles in production)
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1`,
          python: `from strands import Agent, tool

# ── Define tools ──────────────────────────────────────────────────────────
@tool
def get_weather(city: str) -> str:
    """Return current weather conditions for a city."""
    # In production: call a weather API
    return f"Weather in {city}: 18°C, partly cloudy."

@tool
def create_calendar_event(title: str, date: str, duration_minutes: int) -> str:
    """Create a calendar event and return its ID."""
    import uuid
    event_id = str(uuid.uuid4())[:8]
    return f"Event '{title}' created on {date} ({duration_minutes} min). ID: {event_id}"

# ── Create the agent ──────────────────────────────────────────────────────
agent = Agent(
    model="us.anthropic.claude-opus-4-6-v1:0",  # Bedrock model ID
    tools=[get_weather, create_calendar_event],
    system_prompt="You are a helpful assistant that checks weather and manages calendars.",
)

# ── Run (synchronous) ─────────────────────────────────────────────────────
response = agent("Schedule a picnic in London for tomorrow afternoon if it's not raining.")
print(response)`,
        }}
      />

      <h2>Strands — Streaming & Async</h2>

      <SDKExample
        title="Streaming responses"
        tabs={{
          python: `from strands import Agent
import asyncio

agent = Agent(model="us.anthropic.claude-opus-4-6-v1:0")

# Synchronous streaming
for event in agent.stream_async("Explain quantum entanglement in simple terms."):
    if "data" in event and "text" in event["data"]:
        print(event["data"]["text"], end="", flush=True)

# Async usage
async def run():
    result = await agent.run_async("Write a short poem about AWS.")
    print(result)

asyncio.run(run())`,
        }}
      />

      <h2>Strands — Multi-Agent Orchestration</h2>

      <SDKExample
        title="Sub-agents as tools"
        tabs={{
          python: `from strands import Agent, tool

# ── Specialist agents ─────────────────────────────────────────────────────
research_agent = Agent(
    model="us.anthropic.claude-opus-4-6-v1:0",
    system_prompt="You are a research specialist. Find and summarise information.",
)

code_agent = Agent(
    model="us.anthropic.claude-opus-4-6-v1:0",
    system_prompt="You write clean, well-tested Python code.",
)

# ── Wrap sub-agents as tools for the orchestrator ─────────────────────────
@tool
def research(topic: str) -> str:
    """Research a topic and return a structured summary."""
    return str(research_agent(f"Research: {topic}"))

@tool
def write_code(task_description: str) -> str:
    """Write Python code for the given task."""
    return str(code_agent(task_description))

# ── Orchestrator ──────────────────────────────────────────────────────────
orchestrator = Agent(
    model="us.anthropic.claude-opus-4-6-v1:0",
    tools=[research, write_code],
    system_prompt="Coordinate research and coding to solve complex tasks.",
)

result = orchestrator(
    "Build a Python script that fetches the top 10 Hacker News stories."
)
print(result)`,
        }}
      />

      <h2>Strands — MCP Integration</h2>

      <SDKExample
        title="Using MCP servers with Strands"
        tabs={{
          python: `from strands import Agent
from strands.tools.mcp import MCPClient
from mcp import StdioServerParameters

# Connect to an MCP server (filesystem example)
mcp_client = MCPClient(
    lambda: stdio_client(
        StdioServerParameters(
            command="npx",
            args=["-y", "@modelcontextprotocol/server-filesystem", "/home/user/docs"]
        )
    )
)

with mcp_client:
    agent = Agent(
        model="us.anthropic.claude-opus-4-6-v1:0",
        tools=mcp_client.list_tools_sync(),
    )
    result = agent("List all PDF files in /home/user/docs and summarise the first one.")
    print(result)`,
        }}
      />

      <h2>Amazon Bedrock Agents (Managed Service)</h2>

      <ConceptBlock term="Amazon Bedrock Agents">
        <p>
          Bedrock Agents is a fully managed service where you configure an agent through
          the AWS Console or API — no orchestration loop to write. You define{' '}
          <strong>action groups</strong> (Lambda functions or OpenAPI schemas),{' '}
          <strong>knowledge bases</strong> (RAG over S3 documents via OpenSearch or Aurora),
          and <strong>guardrails</strong>. AWS manages invocation, retries, and audit logging.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Invoke a Bedrock Agent from code"
        tabs={{
          python: `import boto3, json

bedrock_runtime = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

response = bedrock_runtime.invoke_agent(
    agentId="ABCD1234EF",       # from AWS Console
    agentAliasId="TSTALIASID",  # use DRAFT during development
    sessionId="user-session-42",
    inputText="What are the key findings from the Q3 earnings report?",
)

# Stream the response
full_response = ""
for event in response["completion"]:
    if "chunk" in event:
        chunk = event["chunk"]["bytes"].decode("utf-8")
        full_response += chunk
        print(chunk, end="", flush=True)

print()  # newline`,
          typescript: `import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

const command = new InvokeAgentCommand({
  agentId: "ABCD1234EF",
  agentAliasId: "TSTALIASID",
  sessionId: "user-session-42",
  inputText: "What are the key findings from the Q3 earnings report?",
});

const response = await client.send(command);
let fullText = "";

for await (const event of response.completion ?? []) {
  if (event.chunk?.bytes) {
    const chunk = new TextDecoder().decode(event.chunk.bytes);
    fullText += chunk;
    process.stdout.write(chunk);
  }
}
console.log();`,
        }}
      />

      <h2>Bedrock Agents — Action Groups</h2>

      <SDKExample
        title="Lambda action group for Bedrock Agents"
        tabs={{
          python: `# Lambda function that handles tool calls from Bedrock Agents
import json

def lambda_handler(event, context):
    """Bedrock Agents invokes this Lambda for action group calls."""
    action_group = event["actionGroup"]
    function = event["function"]
    parameters = {p["name"]: p["value"] for p in event.get("parameters", [])}

    # Route to the right handler
    if function == "get_order_status":
        order_id = parameters["order_id"]
        # Query your OMS
        result = {"status": "shipped", "eta": "2025-03-18", "carrier": "FedEx"}
        response_body = {"application/json": {"body": json.dumps(result)}}
    elif function == "cancel_order":
        order_id = parameters["order_id"]
        response_body = {"application/json": {"body": json.dumps({"cancelled": True})}}
    else:
        response_body = {"application/json": {"body": json.dumps({"error": "unknown function"})}}

    return {
        "messageVersion": "1.0",
        "response": {
            "actionGroup": action_group,
            "function": function,
            "functionResponse": {"responseBody": response_body},
        },
    }`,
          json: `// OpenAPI schema for the action group (alternative to Lambda)
{
  "openapi": "3.0.0",
  "info": {"title": "Order API", "version": "1.0.0"},
  "paths": {
    "/orders/{order_id}": {
      "get": {
        "summary": "Get order status",
        "operationId": "get_order_status",
        "parameters": [{
          "name": "order_id",
          "in": "path",
          "required": true,
          "schema": {"type": "string"}
        }],
        "responses": {
          "200": {
            "description": "Order status",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {"type": "string"},
                    "eta": {"type": "string"}
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`,
        }}
      />

      <h2>Strands vs Bedrock Agents — When to Use Each</h2>

      <SDKExample
        title="Decision guide"
        tabs={{
          text: `╔════════════════════════╦═══════════════════════╦════════════════════════╗
║ Factor                 ║ Strands (SDK)         ║ Bedrock Agents (managed)║
╠════════════════════════╬═══════════════════════╬════════════════════════╣
║ Setup effort           ║ Low (pip install)     ║ Medium (console config)║
║ Customisation          ║ Full Python control   ║ Limited to config      ║
║ Multi-agent            ║ Built-in              ║ Via inline agents      ║
║ RAG / knowledge base   ║ DIY (LlamaIndex etc.) ║ Managed (S3 + search)  ║
║ Infra management       ║ Self-hosted           ║ Fully managed by AWS   ║
║ Best for               ║ Code-first devs       ║ Low-ops teams          ║
╚════════════════════════╩═══════════════════════╩════════════════════════╝`,
        }}
      />

      <BestPracticeBlock title="AWS Agent Best Practices">
        <ul>
          <li><strong>Strands:</strong> use <code>@tool</code> with detailed docstrings — they become the tool descriptions Claude uses for routing decisions.</li>
          <li><strong>Strands:</strong> set <code>max_parallel_tools</code> on the agent to control concurrency when multiple tools can run simultaneously.</li>
          <li><strong>Bedrock Agents:</strong> always version your agent aliases — never point production traffic at the <code>DRAFT</code> alias.</li>
          <li><strong>Bedrock Agents:</strong> enable <strong>CloudWatch logging</strong> and <strong>session metadata</strong> for audit compliance.</li>
          <li>Use <strong>IAM roles with least privilege</strong> for both Strands (Bedrock API calls) and Lambda action groups.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock>
        Amazon Strands Agents SDK is available at{' '}
        <strong>github.com/strands-agents/sdk-python</strong> and documented at{' '}
        <strong>strandsagents.com</strong>. Amazon Bedrock Agents is documented in the{' '}
        <strong>AWS Bedrock developer guide</strong>. Both support Claude models via
        Amazon Bedrock's cross-region inference profiles.
      </NoteBlock>
    </article>
  )
}
