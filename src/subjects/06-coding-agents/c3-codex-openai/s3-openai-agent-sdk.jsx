import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function OpenAIAgentSDK() {
  return (
    <article className="prose-content">
      <h2>OpenAI Agents SDK</h2>
      <p>
        The OpenAI Agents SDK (released 2025, successor to the Swarm experiment) is a
        production-ready Python framework for building multi-agent systems with OpenAI models.
        It provides first-class primitives for agents, tool definitions, handoffs between
        agents, input/output guardrails, and built-in tracing. Unlike raw API calls, the SDK
        manages the agent loop, tool execution, and agent-to-agent communication automatically.
      </p>

      <ConceptBlock term="Agent">
        <p>
          In the OpenAI Agents SDK, an <code>Agent</code> is a configured LLM with a name,
          instructions, a list of tools, and optionally a list of agents it can hand off to.
          Agents are stateless — all state lives in the conversation messages passed through
          <code> Runner.run()</code>. A single Python file can define a network of cooperating
          agents that each specialize in a different task.
        </p>
      </ConceptBlock>

      <h2>Basic Agent and Tool Definition</h2>

      <SDKExample
        title="Defining an Agent with Tools"
        tabs={{
          python: `from agents import Agent, Runner, function_tool
import subprocess

# Define tools using the @function_tool decorator
@function_tool
def run_python(code: str) -> str:
    """Execute a Python code snippet and return the output."""
    result = subprocess.run(
        ["python", "-c", code],
        capture_output=True,
        text=True,
        timeout=10,
    )
    output = result.stdout
    if result.stderr:
        output += "\\nSTDERR: " + result.stderr
    return output or "(no output)"

@function_tool
def read_file(path: str) -> str:
    """Read the contents of a file."""
    with open(path) as f:
        return f.read()

@function_tool
def write_file(path: str, content: str) -> str:
    """Write content to a file."""
    with open(path, "w") as f:
        f.write(content)
    return f"Written {len(content)} chars to {path}"

# Create an agent with the tools
coding_agent = Agent(
    name="CodingAgent",
    instructions=(
        "You are a Python coding expert. "
        "When asked to write code, use run_python to verify it works. "
        "If the code has errors, fix them and re-run until it passes."
    ),
    model="gpt-4o",
    tools=[run_python, read_file, write_file],
)

# Run the agent
import asyncio

async def main():
    result = await Runner.run(
        coding_agent,
        "Write a Python function to calculate the nth Fibonacci number recursively "
        "with memoization. Test it for n=10 and n=30.",
    )
    print(result.final_output)

asyncio.run(main())`,
        }}
      />

      <h2>Handoffs Between Agents</h2>
      <p>
        Handoffs let one agent delegate to a specialist. When the orchestrator decides a task
        requires a different agent's expertise, it transfers control — including the full
        conversation context. Handoffs are the SDK's primary mechanism for multi-agent workflows.
      </p>

      <SDKExample
        title="Multi-Agent Handoff Pattern"
        tabs={{
          python: `from agents import Agent, Runner, handoff, function_tool
import subprocess
import asyncio

# Specialist agents
@function_tool
def run_tests(path: str = "tests/") -> str:
    """Run pytest on the specified path."""
    result = subprocess.run(
        ["pytest", path, "-x", "--tb=short", "-q"],
        capture_output=True, text=True, timeout=60
    )
    return result.stdout + result.stderr

@function_tool
def check_types(path: str = "src/") -> str:
    """Run mypy type checking."""
    result = subprocess.run(
        ["mypy", path, "--ignore-missing-imports"],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout + result.stderr

test_agent = Agent(
    name="TestAgent",
    instructions=(
        "You are a test specialist. Run the test suite, analyze failures, "
        "and provide a structured report of what needs to be fixed."
    ),
    model="gpt-4o",
    tools=[run_tests],
)

type_agent = Agent(
    name="TypeCheckAgent",
    instructions=(
        "You are a type safety specialist. Run mypy, analyze type errors, "
        "and suggest specific fixes for each error."
    ),
    model="gpt-4o",
    tools=[check_types],
)

@function_tool
def read_file(path: str) -> str:
    with open(path) as f:
        return f.read()

@function_tool  
def write_file(path: str, content: str) -> str:
    with open(path, "w") as f:
        f.write(content)
    return f"Wrote to {path}"

# Orchestrator with handoffs
orchestrator = Agent(
    name="Orchestrator",
    instructions=(
        "You are a senior developer orchestrating code quality. "
        "First fix the code, then hand off to TestAgent to verify tests pass, "
        "then hand off to TypeCheckAgent to verify type safety. "
        "Only report success when both specialists confirm everything is clean."
    ),
    model="gpt-4o",
    tools=[read_file, write_file],
    handoffs=[
        handoff(test_agent, tool_name_override="run_test_suite"),
        handoff(type_agent, tool_name_override="check_type_safety"),
    ],
)

async def main():
    result = await Runner.run(
        orchestrator,
        "The file src/calculator.py has failing tests and type errors. Fix it.",
    )
    print(result.final_output)
    print(f"Turns taken: {len(result.new_messages)}")

asyncio.run(main())`,
        }}
      />

      <h2>Guardrails</h2>
      <p>
        Guardrails run in parallel with the agent and can short-circuit execution if input or
        output violates rules. Input guardrails check the user's message before the agent
        processes it; output guardrails check the agent's response before it is returned.
      </p>

      <SDKExample
        title="Input and Output Guardrails"
        tabs={{
          python: `from agents import Agent, Runner, input_guardrail, output_guardrail, GuardrailFunctionOutput
from pydantic import BaseModel

class SafetyCheck(BaseModel):
    is_safe: bool
    reason: str

# Input guardrail: reject requests to delete production data
@input_guardrail
async def no_production_delete(ctx, agent, input) -> GuardrailFunctionOutput:
    from agents import Runner, Agent
    
    checker = Agent(
        name="SafetyChecker",
        instructions="Check if this request asks to delete, drop, or truncate production data.",
        model="gpt-4o-mini",
        output_type=SafetyCheck,
    )
    result = await Runner.run(checker, str(input))
    check = result.final_output
    
    return GuardrailFunctionOutput(
        output_info=check,
        tripwire_triggered=not check.is_safe,
    )

# Output guardrail: ensure generated code doesn't contain secrets
@output_guardrail  
async def no_hardcoded_secrets(ctx, agent, output) -> GuardrailFunctionOutput:
    import re
    # Simple check for common secret patterns
    dangerous_patterns = [
        r'password\s*=\s*["\'][^"\']+["\']',
        r'api_key\s*=\s*["\'][^"\']+["\']',
        r'secret\s*=\s*["\'][^"\']+["\']',
    ]
    code_content = str(output)
    found = any(re.search(p, code_content, re.IGNORECASE) for p in dangerous_patterns)
    
    return GuardrailFunctionOutput(
        output_info={"has_secrets": found},
        tripwire_triggered=found,
    )

safe_coding_agent = Agent(
    name="SafeCodingAgent",
    instructions="Write Python code following security best practices.",
    model="gpt-4o",
    input_guardrails=[no_production_delete],
    output_guardrails=[no_hardcoded_secrets],
)

async def main():
    from agents import InputGuardrailTripwireTriggered
    try:
        result = await Runner.run(
            safe_coding_agent,
            "Write a database connection function",
        )
        print(result.final_output)
    except InputGuardrailTripwireTriggered as e:
        print(f"Request blocked by guardrail: {e}")

import asyncio
asyncio.run(main())`,
        }}
      />

      <h2>Tracing</h2>
      <p>
        The SDK has built-in OpenTelemetry-compatible tracing. Every agent run, tool call, and
        handoff is recorded as a span. Traces are sent to OpenAI's platform by default (visible
        in the OpenAI dashboard) and can be exported to any OTLP-compatible backend.
      </p>

      <SDKExample
        title="Tracing Configuration"
        tabs={{
          python: `import asyncio
from agents import Agent, Runner, set_tracing_disabled
from agents.tracing import set_trace_processors
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Option 1: Disable tracing entirely (useful for testing)
set_tracing_disabled(True)

# Option 2: Send to your own OTLP backend (e.g., Jaeger, Honeycomb)
exporter = OTLPSpanExporter(endpoint="http://localhost:4317")
set_trace_processors([BatchSpanProcessor(exporter)])

# Option 3: Custom trace processor for logging
from agents.tracing import TracingProcessor

class LoggingProcessor(TracingProcessor):
    def on_trace_start(self, trace):
        print(f"Trace started: {trace.trace_id}")
    
    def on_span_end(self, span):
        print(f"  Span: {span.span_data.type} — {span.span_data}")

set_trace_processors([LoggingProcessor()])`,
        }}
      />

      <PatternBlock title="Orchestrator-Specialist Multi-Agent Pattern">
        <p>
          The most effective pattern for coding agents using the OpenAI Agents SDK:
        </p>
        <ol>
          <li>Define one <strong>Orchestrator</strong> agent with a broad understanding of the task and access to handoffs.</li>
          <li>Define specialist agents for discrete capabilities: testing, type checking, code review, documentation.</li>
          <li>The orchestrator sequences specialist invocations, synthesizes results, and decides when the overall task is complete.</li>
          <li>Use guardrails at the orchestrator level to enforce global constraints (no production deletes, no hardcoded secrets).</li>
          <li>Use tracing to monitor which specialists are called most often — that reveals where to invest in improving specialist prompts.</li>
        </ol>
      </PatternBlock>

      <BestPracticeBlock title="OpenAI Agents SDK Best Practices">
        <ul>
          <li>Keep agent instructions focused and short — each agent should have one clear specialization.</li>
          <li>Use <code>gpt-4o-mini</code> for guardrail checkers and simple specialists to reduce cost; reserve <code>gpt-4o</code> for the orchestrator and complex reasoning.</li>
          <li>Always add timeouts to tool functions to prevent a hanging tool from blocking the entire agent run.</li>
          <li>Use <code>output_type</code> (Pydantic model) on agents where you need structured output — the SDK handles the schema injection and parsing.</li>
          <li>Test each agent in isolation before wiring up handoffs — this makes debugging much easier.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Swarm vs. Agents SDK">
        <p>
          OpenAI's earlier <em>Swarm</em> library was a lightweight educational demo of
          multi-agent handoffs. The Agents SDK is the production successor: it adds persistence,
          guardrails, tracing, async support, and active maintenance. If you used Swarm, migrate
          to the Agents SDK — the core concepts (agents, handoffs, context variables) map
          directly.
        </p>
      </NoteBlock>
    </article>
  )
}
