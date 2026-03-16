import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const adkNodes = [
  { id: 'runner',   label: 'ADK Runner',           type: 'agent',    x: 60,  y: 150 },
  { id: 'agent',    label: 'Root Agent',            type: 'llm',      x: 230, y: 150 },
  { id: 'sub1',     label: 'Sub-Agent\n(Research)', type: 'llm',      x: 420, y: 80  },
  { id: 'sub2',     label: 'Sub-Agent\n(Writing)',  type: 'llm',      x: 420, y: 220 },
  { id: 'tool1',    label: 'Google Search',         type: 'tool',     x: 600, y: 60  },
  { id: 'tool2',    label: 'Code Exec',             type: 'tool',     x: 600, y: 140 },
  { id: 'tool3',    label: 'Custom Tool',           type: 'tool',     x: 600, y: 220 },
  { id: 'session',  label: 'Session / Memory',      type: 'store',    x: 230, y: 280 },
]

const adkEdges = [
  { from: 'runner',  to: 'agent',   label: 'run()'        },
  { from: 'agent',   to: 'sub1',    label: 'delegate'     },
  { from: 'agent',   to: 'sub2',    label: 'delegate'     },
  { from: 'sub1',    to: 'tool1',   label: 'call'         },
  { from: 'sub1',    to: 'tool2',   label: 'call'         },
  { from: 'sub2',    to: 'tool3',   label: 'call'         },
  { from: 'agent',   to: 'session', label: 'state'        },
  { from: 'runner',  to: 'session', label: 'persist'      },
]

export default function GoogleAdk() {
  return (
    <article className="prose-content">
      <h2>Google Agent Development Kit (ADK)</h2>
      <p>
        The <strong>Google Agent Development Kit (ADK)</strong> is an open-source Python
        framework (Apache 2.0) released in April 2025. It is optimised for Gemini models
        but model-agnostic — you can plug in OpenAI, Anthropic, or any LiteLLM-compatible
        model. ADK makes it straightforward to build <strong>multi-agent pipelines</strong>{' '}
        with built-in session management, streaming, tool execution, evaluation, and
        deployment to Google Cloud Agent Engine.
      </p>

      <ConceptBlock term="Google ADK">
        <p>
          ADK structures agentic applications around three primitives:{' '}
          <strong>Agents</strong> (LLM-powered decision makers),{' '}
          <strong>Tools</strong> (Python functions, other agents, MCP servers), and{' '}
          <strong>Runners</strong> (the execution engine that manages sessions and the
          tool-call loop). Agents can be composed into hierarchies — a root agent
          orchestrates specialised sub-agents, each with their own tools.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram nodes={adkNodes} edges={adkEdges} title="Google ADK Multi-Agent Architecture" />

      <h2>Installation</h2>

      <SDKExample
        title="Install ADK"
        tabs={{
          bash: `pip install google-adk

# Optional extras
pip install google-adk[eval]     # evaluation tools
pip install google-adk[vertexai] # Vertex AI / Agent Engine deployment`,
        }}
      />

      <h2>Your First ADK Agent</h2>

      <SDKExample
        title="Simple ADK agent with a custom tool"
        tabs={{
          python: `from google.adk.agents import LlmAgent
from google.adk.tools import tool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.models.lite_llm import LiteLlm  # or use Gemini directly

# ── Define a tool ─────────────────────────────────────────────────────────
@tool
def get_exchange_rate(from_currency: str, to_currency: str) -> dict:
    """Return the current exchange rate between two currencies."""
    # In production: call a real FX API
    rates = {"USD_EUR": 0.92, "EUR_USD": 1.09, "USD_GBP": 0.79}
    key = f"{from_currency}_{to_currency}"
    return {"rate": rates.get(key, "unavailable"), "pair": key}

# ── Define the agent ──────────────────────────────────────────────────────
agent = LlmAgent(
    name="fx_agent",
    model=LiteLlm(model="claude-opus-4-6"),   # swap to "gemini-2.0-flash" for Gemini
    description="Answers currency conversion questions.",
    instruction="You are a helpful currency assistant. Use get_exchange_rate to answer questions.",
    tools=[get_exchange_rate],
)

# ── Run the agent ─────────────────────────────────────────────────────────
session_service = InMemorySessionService()
runner = Runner(agent=agent, app_name="fx_app", session_service=session_service)

import asyncio
from google.genai.types import Content, Part

async def main():
    session = await session_service.create_session(app_name="fx_app", user_id="user-1")
    user_msg = Content(parts=[Part(text="What is 100 USD in EUR?")], role="user")

    async for event in runner.run_async(
        user_id="user-1", session_id=session.id, new_message=user_msg
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)

asyncio.run(main())`,
        }}
      />

      <h2>Multi-Agent Systems with ADK</h2>

      <SDKExample
        title="Root agent orchestrating sub-agents"
        tabs={{
          python: `from google.adk.agents import LlmAgent
from google.adk.tools import tool, agent_tool

# ── Specialist sub-agents ─────────────────────────────────────────────────
research_agent = LlmAgent(
    name="research_agent",
    model="gemini-2.0-flash",
    description="Searches the web and summarises findings on a topic.",
    instruction="Search for information and return a structured summary.",
    tools=["google_search"],  # built-in Google Search tool
)

writer_agent = LlmAgent(
    name="writer_agent",
    model="gemini-2.0-flash",
    description="Writes polished articles from research summaries.",
    instruction="Take research notes and write a clear, engaging article.",
)

# ── Root orchestrator ─────────────────────────────────────────────────────
root_agent = LlmAgent(
    name="orchestrator",
    model="gemini-2.0-flash",
    description="Orchestrates research and writing to produce articles.",
    instruction="""You coordinate two specialist agents:
1. Use research_agent to gather information.
2. Pass the results to writer_agent to produce the final article.""",
    tools=[
        agent_tool.AgentTool(agent=research_agent),
        agent_tool.AgentTool(agent=writer_agent),
    ],
)`,
        }}
      />

      <h2>Built-in Tools</h2>

      <SDKExample
        title="ADK built-in tools"
        tabs={{
          python: `from google.adk.agents import LlmAgent
from google.adk.tools.google_search import GoogleSearchTool
from google.adk.tools.code_execution import BuiltInCodeExecutionTool
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, StdioServerParameters

# Google Search
agent_with_search = LlmAgent(
    name="search_agent",
    model="gemini-2.0-flash",
    tools=[GoogleSearchTool()],
)

# Code execution (sandboxed Python)
agent_with_code = LlmAgent(
    name="code_agent",
    model="gemini-2.0-flash",
    tools=[BuiltInCodeExecutionTool()],
)

# MCP server as ADK tool (ADK natively supports MCP!)
mcp_tools, exit_stack = await MCPToolset.from_server(
    connection_params=StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-filesystem", "/home/user/docs"],
    )
)
agent_with_mcp = LlmAgent(
    name="fs_agent",
    model="gemini-2.0-flash",
    tools=mcp_tools,
)`,
        }}
      />

      <h2>Session State and Memory</h2>

      <SDKExample
        title="Persistent session state"
        tabs={{
          python: `from google.adk.agents import LlmAgent
from google.adk.sessions import DatabaseSessionService  # or InMemorySessionService

# Persist sessions to a database
session_service = DatabaseSessionService(db_url="sqlite:///sessions.db")

# Agents can read/write to the session state
from google.adk.agents.callback_context import CallbackContext

def before_tool_callback(tool, args, context: CallbackContext):
    """Inject session state into tool args if needed."""
    state = context.state
    if "user_prefs" not in state:
        state["user_prefs"] = {"language": "en"}
    return None  # allow tool to proceed

agent = LlmAgent(
    name="stateful_agent",
    model="gemini-2.0-flash",
    before_tool_callback=before_tool_callback,
)`,
        }}
      />

      <h2>Deployment to Vertex AI Agent Engine</h2>

      <SDKExample
        title="Deploy to Google Cloud"
        tabs={{
          python: `import vertexai
from vertexai.preview import reasoning_engines
from google.adk.agents import LlmAgent

vertexai.init(project="my-gcp-project", location="us-central1")

agent = LlmAgent(name="deployed_agent", model="gemini-2.0-flash", ...)

# Wrap in an ADK app for Vertex AI
from google.adk.sessions import VertexAiSessionService
from google.adk.runners import Runner

app = reasoning_engines.AdkApp(
    agent=agent,
    enable_tracing=True,
)

# Deploy
remote_app = reasoning_engines.ReasoningEngine.create(
    app,
    requirements=["google-adk>=0.5.0", "anthropic"],
)
print("Deployed:", remote_app.resource_name)

# Query the deployed agent
response = remote_app.query(user_id="user-1", message="Hello!")
print(response)`,
          bash: `# Or use the ADK CLI
adk deploy cloud_run \\
  --project=my-gcp-project \\
  --region=us-central1 \\
  --agent_module=my_agent \\
  --service_name=my-adk-agent`,
        }}
      />

      <h2>ADK Dev UI</h2>

      <SDKExample
        title="Local development with ADK web UI"
        tabs={{
          bash: `# Start the ADK web UI for interactive testing
adk web

# Or run in API-only mode
adk api_server

# The web UI at http://localhost:8000 lets you:
# - Chat with your agents
# - Inspect event streams (tool calls, sub-agent calls, state)
# - View session history
# - Evaluate agent responses`,
        }}
      />

      <BestPracticeBlock title="Google ADK Best Practices">
        <ul>
          <li>Set <code>output_schema</code> (a Pydantic model) on agents that produce structured data — it enforces JSON output via constrained generation.</li>
          <li>Use <code>SequentialAgent</code> or <code>ParallelAgent</code> for deterministic pipelines instead of relying on LLM routing.</li>
          <li>Always pass <code>app_name</code> and <code>user_id</code> consistently — they key the session store.</li>
          <li>Enable <code>enable_tracing=True</code> in production for Cloud Trace visibility.</li>
          <li>Pin your ADK version in <code>requirements.txt</code> — the SDK is evolving rapidly.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock>
        ADK is available at <strong>github.com/google/adk-python</strong> and
        documented at <strong>google.github.io/adk-docs</strong>. The framework
        supports Gemini (native), LiteLLM (for any model), and Anthropic Claude
        directly via the LiteLLM adapter.
      </NoteBlock>
    </article>
  )
}
