import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function GoogleADK() {
  return (
    <article className="prose-content">
      <h2>Google Agent Development Kit (ADK)</h2>
      <p>
        Google's Agent Development Kit (ADK) is an open-source Python framework for building
        multi-agent systems on top of Gemini. Unlike Agent Builder (which is a managed,
        no-code-first platform), ADK is a code-first framework that gives developers full
        control over agent logic, composition patterns, and deployment. It ships with a set
        of composable agent types, built-in tools, a local dev server, and a managed runtime
        called Agent Engine for production deployment on Vertex AI.
      </p>

      <ArchitectureDiagram
        title="ADK Agent Hierarchy and Execution"
        width={720}
        height={320}
        nodes={[
          { id: 'runner', label: 'Runner', type: 'agent', x: 80, y: 160 },
          { id: 'session', label: 'Session /\nArtifacts', type: 'store', x: 220, y: 260 },
          { id: 'root', label: 'Root Agent\n(LlmAgent)', type: 'agent', x: 220, y: 120 },
          { id: 'subA', label: 'Sequential\nAgent', type: 'agent', x: 400, y: 60 },
          { id: 'subB', label: 'Parallel\nAgent', type: 'agent', x: 400, y: 160 },
          { id: 'subC', label: 'Loop\nAgent', type: 'agent', x: 400, y: 260 },
          { id: 'llm', label: 'Gemini\nLLM', type: 'llm', x: 580, y: 100 },
          { id: 'tools', label: 'Tools\n(search, code)', type: 'tool', x: 580, y: 220 },
        ]}
        edges={[
          { from: 'runner', to: 'root', label: 'invoke' },
          { from: 'runner', to: 'session' },
          { from: 'root', to: 'subA' },
          { from: 'root', to: 'subB' },
          { from: 'root', to: 'subC' },
          { from: 'subA', to: 'llm' },
          { from: 'subB', to: 'tools' },
          { from: 'subC', to: 'llm' },
        ]}
      />

      <h2>Core Concepts</h2>

      <ConceptBlock term="Agent Types">
        <p>
          ADK provides four composable agent types. <strong>LlmAgent</strong> is the standard
          LLM-driven agent — given a model, system prompt, and tools, it reasons and acts in a
          ReAct loop until done. <strong>SequentialAgent</strong> runs a list of sub-agents
          in order, passing outputs through as context — ideal for pipelines (e.g., research →
          outline → draft → review). <strong>ParallelAgent</strong> runs sub-agents concurrently
          and merges their outputs — ideal for fan-out tasks (e.g., search multiple sources
          simultaneously). <strong>LoopAgent</strong> repeatedly runs a sub-agent until a
          termination condition is met — ideal for iterative refinement or polling.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Runner and Session">
        <p>
          The <strong>Runner</strong> is the execution engine: it takes an agent and a session,
          invokes the agent with a user message, and returns an async generator of events
          (LLM calls, tool calls, responses). The <strong>Session</strong> stores conversation
          history and state between turns. ADK supports in-memory sessions for development and
          Vertex AI-backed persistent sessions for production. <strong>Artifacts</strong> are
          binary outputs (images, files, audio) that agents can produce and attach to sessions.
        </p>
      </ConceptBlock>

      <h2>Building a Basic LlmAgent</h2>

      <SDKExample
        title="LlmAgent with Tools"
        tabs={{
          python: `from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool, google_search, code_execution
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
import asyncio

# 1. Define custom tools as plain Python functions
def get_stock_price(ticker: str) -> dict:
    """Get current stock price for a ticker symbol.

    Args:
        ticker: Stock ticker symbol (e.g., 'GOOGL', 'MSFT')

    Returns:
        dict with price, change, and market_cap fields
    """
    # In production, call a real financial API
    mock_prices = {"GOOGL": 175.42, "MSFT": 420.10, "AAPL": 228.87}
    price = mock_prices.get(ticker.upper(), 100.0)
    return {
        "ticker": ticker.upper(),
        "price": price,
        "change_pct": 1.2,
        "market_cap_billions": price * 6.5,
    }

def calculate_portfolio_value(holdings: list[dict]) -> dict:
    """Calculate total portfolio value given a list of holdings.

    Args:
        holdings: List of dicts with 'ticker' and 'shares' keys

    Returns:
        dict with total_value and breakdown
    """
    total = 0.0
    breakdown = []
    for h in holdings:
        info = get_stock_price(h["ticker"])
        value = info["price"] * h["shares"]
        total += value
        breakdown.append({"ticker": h["ticker"], "shares": h["shares"], "value": value})
    return {"total_value": total, "breakdown": breakdown}

# 2. Create the agent
agent = LlmAgent(
    name="financial_analyst",
    model="gemini-2.0-flash-001",
    description="A financial analyst that can research stocks and analyze portfolios.",
    instruction="""You are a professional financial analyst. When asked about stocks or
    portfolios, always use the available tools to get current data. Present numbers
    with 2 decimal places and include % change. Be concise and factual.""",
    tools=[
        FunctionTool(get_stock_price),
        FunctionTool(calculate_portfolio_value),
        google_search,          # Built-in Google Search tool
        code_execution,         # Built-in Python code execution sandbox
    ],
)

# 3. Set up session and runner
session_service = InMemorySessionService()
runner = Runner(agent=agent, session_service=session_service, app_name="finance_app")

# 4. Async invocation (ADK is async-first)
async def main():
    session = await session_service.create_session(
        app_name="finance_app",
        user_id="user_123",
    )

    async for event in runner.run_async(
        user_id="user_123",
        session_id=session.id,
        new_message="What is my portfolio worth if I have 10 GOOGL and 5 MSFT shares?",
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)
        elif event.get_function_calls():
            for call in event.get_function_calls():
                print(f"  [Tool call] {call.name}({dict(call.args)})")

asyncio.run(main())`,
        }}
      />

      <h2>Agent Composition Patterns</h2>

      <h3>Sequential Pipeline</h3>
      <CodeBlock language="python" filename="adk_sequential.py">
{`from google.adk.agents import LlmAgent, SequentialAgent

# Define specialized agents for each pipeline stage
researcher = LlmAgent(
    name="researcher",
    model="gemini-2.0-flash-001",
    instruction="Research the given topic. Output a bullet-point list of key facts.",
    tools=[google_search],
)

outliner = LlmAgent(
    name="outliner",
    model="gemini-2.0-flash-001",
    instruction="""Given the research notes in context, create a structured outline
    for a technical blog post. Include H2 sections and key points for each.""",
)

writer = LlmAgent(
    name="writer",
    model="gemini-1.5-pro-002",  # Use Pro for higher quality writing
    instruction="""Given the outline in context, write a complete, engaging technical
    blog post. Use concrete examples and code snippets where appropriate.""",
)

editor = LlmAgent(
    name="editor",
    model="gemini-2.0-flash-001",
    instruction="""Review the draft and improve: fix grammar, enhance clarity,
    ensure technical accuracy, and add a compelling introduction.""",
)

# SequentialAgent passes outputs as context to subsequent agents
content_pipeline = SequentialAgent(
    name="content_pipeline",
    sub_agents=[researcher, outliner, writer, editor],
)

# Each agent sees all previous outputs in its context window`}
      </CodeBlock>

      <h3>Parallel Fan-Out</h3>
      <CodeBlock language="python" filename="adk_parallel.py">
{`from google.adk.agents import LlmAgent, ParallelAgent

# Three specialized research agents running simultaneously
tech_researcher = LlmAgent(
    name="tech_researcher",
    model="gemini-2.0-flash-001",
    instruction="Research technical implementation details and architecture.",
    tools=[google_search],
)

market_researcher = LlmAgent(
    name="market_researcher",
    model="gemini-2.0-flash-001",
    instruction="Research market trends, adoption, and competitive landscape.",
    tools=[google_search],
)

risk_analyst = LlmAgent(
    name="risk_analyst",
    model="gemini-2.0-flash-001",
    instruction="Identify risks, limitations, and failure modes.",
)

# ParallelAgent runs all sub-agents concurrently
# All outputs are merged and available to subsequent agents
parallel_research = ParallelAgent(
    name="parallel_research",
    sub_agents=[tech_researcher, market_researcher, risk_analyst],
)

# Combine with a synthesizer in a sequential pipeline
synthesizer = LlmAgent(
    name="synthesizer",
    model="gemini-1.5-pro-002",
    instruction="Synthesize the parallel research findings into a unified report.",
)

from google.adk.agents import SequentialAgent
full_pipeline = SequentialAgent(
    name="research_pipeline",
    sub_agents=[parallel_research, synthesizer],
)`}
      </CodeBlock>

      <h3>Loop Agent with Termination Condition</h3>
      <CodeBlock language="python" filename="adk_loop.py">
{`from google.adk.agents import LlmAgent, LoopAgent

# Agent that improves code iteratively
code_reviewer = LlmAgent(
    name="code_reviewer",
    model="gemini-2.0-flash-001",
    tools=[code_execution],
    instruction="""Review the code in context. If there are issues, fix them and
    output the improved code. If the code is correct and all tests pass, output
    exactly: DONE
    Always run the code to verify it works before saying DONE.""",
)

# LoopAgent repeats until the sub-agent outputs the termination signal
# or until max_iterations is reached
iterative_coder = LoopAgent(
    name="iterative_coder",
    sub_agent=code_reviewer,
    max_iterations=5,
    # Stop condition: sub-agent output contains "DONE"
    stop_condition=lambda event: (
        event.is_final_response() and
        "DONE" in (event.content.parts[0].text if event.content.parts else "")
    ),
)`}
      </CodeBlock>

      <h2>Deploying to Agent Engine</h2>
      <p>
        Agent Engine is Vertex AI's managed runtime for ADK agents. It handles scaling,
        session persistence, logging, monitoring, and model routing — you deploy an agent
        as a managed resource and call it via REST API or SDK.
      </p>

      <CodeBlock language="python" filename="adk_agent_engine.py">
{`import vertexai
from vertexai.preview import reasoning_engines

vertexai.init(project="my-gcp-project", location="us-central1",
              staging_bucket="gs://my-staging-bucket")

# Wrap ADK agent for Agent Engine deployment
class MyAgentApp:
    """Wrapper class for Agent Engine deployment."""

    def set_up(self):
        """Called once at container startup."""
        from google.adk.agents import LlmAgent
        from google.adk.tools import google_search, FunctionTool
        from google.adk.runners import Runner
        from google.adk.sessions import InMemorySessionService

        self.agent = LlmAgent(
            name="production_agent",
            model="gemini-2.0-flash-001",
            instruction="You are a helpful assistant with web search capabilities.",
            tools=[google_search],
        )
        self.session_service = InMemorySessionService()
        self.runner = Runner(
            agent=self.agent,
            session_service=self.session_service,
            app_name="production_agent",
        )

    def query(self, user_id: str, session_id: str, message: str) -> str:
        """Synchronous wrapper for Agent Engine."""
        import asyncio

        async def _run():
            result = ""
            async for event in self.runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=message,
            ):
                if event.is_final_response() and event.content.parts:
                    result = event.content.parts[0].text
            return result

        return asyncio.get_event_loop().run_until_complete(_run())

# Deploy to Agent Engine
remote_agent = reasoning_engines.ReasoningEngine.create(
    MyAgentApp(),
    requirements=["google-adk>=0.1.0", "google-cloud-aiplatform"],
    display_name="Production ADK Agent",
    description="ADK agent with Google Search",
)

print(f"Deployed agent resource name: {remote_agent.resource_name}")

# Query the deployed agent
result = remote_agent.query(
    user_id="user_123",
    session_id="session_456",
    message="What are the latest developments in AI agents?",
)
print(result)`}
      </CodeBlock>

      <h2>Evaluation with ADK Eval Framework</h2>

      <CodeBlock language="python" filename="adk_eval.py">
{`from google.adk.evaluation import AgentEvaluator, EvalDataset

# Define evaluation dataset
eval_dataset = EvalDataset(
    cases=[
        {
            "query": "What is the capital of France?",
            "expected_response": "Paris",
            "expected_tool_calls": [],  # Should not need tools
        },
        {
            "query": "What is the current price of GOOGL stock?",
            "expected_response": None,  # Dynamic — just check tool was called
            "expected_tool_calls": ["get_stock_price"],
        },
        {
            "query": "Search for recent news about AI agents",
            "expected_response": None,
            "expected_tool_calls": ["google_search"],
        },
    ]
)

evaluator = AgentEvaluator(
    agent=agent,
    session_service=session_service,
    metrics=["tool_call_accuracy", "response_groundedness", "latency_p50"],
)

results = evaluator.evaluate(eval_dataset)
print(results.summary())
# tool_call_accuracy: 0.95
# response_groundedness: 0.88
# latency_p50_ms: 1240`}
      </CodeBlock>

      <PatternBlock
        name="Root Agent with Specialist Sub-Agents"
        category="Multi-Agent"
        whenToUse="When you have a broad-scope application where different query types require fundamentally different capabilities — e.g., a company assistant that handles HR queries, IT support, finance questions, and project management separately."
      >
        <p>
          Build a root LlmAgent whose only job is classification and routing. It receives
          the user query, identifies the domain, and delegates to a specialist LlmAgent
          (which may itself use Sequential or Parallel sub-agents). The root agent's
          instruction should focus entirely on routing criteria — avoid giving it
          domain-specific knowledge that belongs in the specialist agents.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Tool Function Design">
        <p>ADK uses function signatures and docstrings to generate tool schemas automatically.
        Write comprehensive docstrings with Args and Returns sections — these become the
        tool descriptions that guide the LLM's tool selection. Use specific type hints
        (e.g., <code>list[dict]</code> rather than <code>Any</code>) so the LLM knows
        exactly what input to construct. Keep tools narrowly scoped: one function per
        external operation, with no side-effects buried in helper calls.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Local Development Server">
        <p>
          ADK ships with <code>adk web</code> — a local dev server that provides a web UI
          for testing your agents interactively. Run <code>adk web .</code> from your project
          directory to start a chat interface, trace tool calls, inspect session state, and
          replay conversations. This is dramatically faster than deploying to Agent Engine
          for each iteration during development.
        </p>
      </NoteBlock>
    </article>
  )
}
