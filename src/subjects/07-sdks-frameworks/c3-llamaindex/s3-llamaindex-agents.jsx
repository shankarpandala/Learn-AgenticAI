import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function LlamaIndexAgents() {
  return (
    <article className="prose-content">
      <h2>LlamaIndex Agents</h2>
      <p>
        LlamaIndex provides a high-level agent abstraction that integrates naturally with its
        index and query engine ecosystem. Agents can use query engines as tools, enabling
        retrieval-augmented reasoning with the same simple API as function-based tools.
      </p>

      <ConceptBlock term="LlamaIndex Agent">
        <p>
          A LlamaIndex <strong>AgentRunner</strong> wraps an LLM with a set of tools and executes
          a reasoning loop: the LLM selects a tool, the AgentRunner executes it, and the result
          is fed back into the next reasoning step. LlamaIndex supports <strong>ReAct</strong>
          (reasoning + acting, text-based) and <strong>OpenAI-tools</strong> (structured function
          calling) agent types.
        </p>
      </ConceptBlock>

      <h2>Function Tools</h2>
      <p>
        The simplest way to define tools is via <code>FunctionTool.from_defaults()</code>, which
        wraps any Python function. The docstring and type annotations become the tool description
        and schema.
      </p>

      <SDKExample
        title="Creating Function Tools"
        tabs={{
          python: `from llama_index.core.tools import FunctionTool, QueryEngineTool
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.anthropic import Anthropic
import math
import json

Settings.llm = Anthropic(model="claude-opus-4-6")

# Function tool: any Python callable with a good docstring
def search_arxiv(query: str, max_results: int = 5) -> str:
    """Search arXiv for research papers matching the query.
    Returns a JSON list of papers with title, authors, and abstract.

    Args:
        query: Search query (e.g., 'retrieval augmented generation').
        max_results: Maximum number of papers to return (1-20).
    """
    # In production, call the arXiv API
    results = [
        {
            "title": f"Paper about {query} #{i}",
            "authors": ["Smith, J.", "Jones, M."],
            "abstract": f"We present a new approach to {query}...",
            "year": 2024,
        }
        for i in range(max_results)
    ]
    return json.dumps(results)

def calculate(expression: str) -> str:
    """Safely evaluate a mathematical expression.
    Supports basic arithmetic, sqrt, and trigonometry.

    Args:
        expression: A Python math expression string (e.g., 'sqrt(144) + 2**10').
    """
    safe_env = {k: getattr(math, k) for k in dir(math) if not k.startswith("_")}
    safe_env["__builtins__"] = {}
    try:
        result = eval(expression, safe_env)  # noqa: S307
        return str(result)
    except Exception as e:
        return f"Error: {e}"

arxiv_tool = FunctionTool.from_defaults(fn=search_arxiv)
calc_tool = FunctionTool.from_defaults(fn=calculate)

print(arxiv_tool.metadata.name)         # "search_arxiv"
print(arxiv_tool.metadata.description)  # From docstring`,
        }}
      />

      <h2>Query Engine as a Tool</h2>
      <p>
        A <code>QueryEngineTool</code> wraps any LlamaIndex query engine as an agent tool. This
        lets the agent perform RAG retrieval as one of its reasoning steps — a powerful pattern
        for knowledge-intensive tasks.
      </p>

      <SDKExample
        title="Query Engine Tools"
        tabs={{
          python: `from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# Build two separate indexes for different document collections
tech_docs = SimpleDirectoryReader("./docs/technical").load_data()
policy_docs = SimpleDirectoryReader("./docs/policies").load_data()

tech_index = VectorStoreIndex.from_documents(tech_docs)
policy_index = VectorStoreIndex.from_documents(policy_docs)

# Wrap each as a query engine tool
tech_tool = QueryEngineTool(
    query_engine=tech_index.as_query_engine(similarity_top_k=5),
    metadata=ToolMetadata(
        name="technical_docs",
        description=(
            "Search technical documentation for implementation details, API references, "
            "architecture diagrams, and code examples. Use for 'how to' questions."
        ),
    ),
)

policy_tool = QueryEngineTool(
    query_engine=policy_index.as_query_engine(similarity_top_k=3),
    metadata=ToolMetadata(
        name="policy_docs",
        description=(
            "Search company policies and compliance documentation. Use for questions about "
            "allowed practices, approval processes, and regulatory requirements."
        ),
    ),
)

tools = [tech_tool, policy_tool, arxiv_tool, calc_tool]`,
        }}
      />

      <h2>ReAct Agent</h2>
      <p>
        The ReAct agent uses a text-based reasoning format (Thought → Action → Observation) that
        works with any LLM, including models without native function calling.
      </p>

      <SDKExample
        title="ReAct Agent"
        tabs={{
          python: `from llama_index.core.agent import ReActAgent
from llama_index.llms.anthropic import Anthropic

llm = Anthropic(model="claude-opus-4-6")

agent = ReActAgent.from_tools(
    tools=tools,
    llm=llm,
    verbose=True,          # Print reasoning steps
    max_iterations=15,
    context="""You are a research assistant that helps engineers understand
technical topics by searching documentation and recent papers.""",
)

# Single query
response = agent.query(
    "What does our technical documentation say about chunking strategies, "
    "and are there any recent arXiv papers on improving RAG chunking?"
)
print(response.response)

# Chat mode for multi-turn conversation
response1 = agent.chat("What is the recommended chunk size in our docs?")
print(response1.response)

response2 = agent.chat("And what does the latest research say about optimal chunk sizes?")
print(response2.response)  # Agent remembers context`,
        }}
      />

      <h2>Function Calling Agent (OpenAI-tools style)</h2>
      <p>
        For LLMs with native function/tool calling, the <code>OpenAIAgent</code>
        (which also works with Anthropic via LiteLLM or the OpenAI-compatible interface) uses
        structured tool call formats for more reliable tool selection.
      </p>

      <SDKExample
        title="Function Calling Agent"
        tabs={{
          python: `from llama_index.agent.openai import OpenAIAgent
from llama_index.llms.openai import OpenAI

# OpenAIAgent uses structured function calling
llm = OpenAI(model="gpt-4o", temperature=0)

agent = OpenAIAgent.from_tools(
    tools=tools,
    llm=llm,
    verbose=True,
    system_prompt="""You are a research assistant. Use the available tools to
answer questions thoroughly. Always cite which tool provided each piece of information.""",
)

response = agent.chat("What chunking strategies does our docs recommend?")
print(response.response)

# Streaming with function calling agent
response_stream = agent.stream_chat("Summarise the key RAG papers from the last year.")
for token in response_stream.response_gen:
    print(token, end="", flush=True)`,
        }}
      />

      <h2>Custom Agent Worker</h2>
      <p>
        For full control over the agent loop, implement a custom <code>CustomSimpleAgentWorker</code>
        that defines how the agent reasons and when to stop.
      </p>

      <SDKExample
        title="Custom Agent Worker"
        tabs={{
          python: `from llama_index.core.agent import CustomSimpleAgentWorker, Task, AgentChatResponse
from llama_index.core.tools import BaseTool
from typing import Any

class VerifyAndAnswerAgentWorker(CustomSimpleAgentWorker):
    """Agent that verifies retrieved facts before answering."""

    def _run_step(self, step, task: Task, **kwargs: Any):
        # Access current task state
        state = task.extra_state

        if state.get("step") == "retrieve":
            # Step 1: Retrieve from knowledge base
            retrieval_result = self._tools_dict["technical_docs"].call(task.input)
            state["context"] = retrieval_result.content
            state["step"] = "verify"
            return self._get_task_step_response(
                agent_response=AgentChatResponse(response="Retrieved context, verifying..."),
                step=step,
                is_done=False,
            )

        elif state.get("step") == "verify":
            # Step 2: Verify the retrieved information
            verify_prompt = (
                f"Is this context relevant and accurate for the question: '{task.input}'?\n"
                f"Context: {state['context']}\nAnswer yes or no with explanation."
            )
            verification = self._llm.complete(verify_prompt)
            state["verified"] = "yes" in verification.text.lower()
            state["step"] = "answer"
            return self._get_task_step_response(
                agent_response=AgentChatResponse(response="Verification complete."),
                step=step,
                is_done=False,
            )

        else:
            # Step 3: Generate final answer
            if state.get("verified"):
                answer_prompt = f"Context: {state['context']}\\n\\nQuestion: {task.input}"
                answer = self._llm.complete(answer_prompt)
            else:
                answer = self._llm.complete(task.input)  # Fallback to LLM knowledge
            return self._get_task_step_response(
                agent_response=AgentChatResponse(response=answer.text),
                step=step,
                is_done=True,
            )

    def _initialize_state(self, task: Task, **kwargs: Any) -> dict:
        return {"step": "retrieve"}

    def _finalize_task(self, task: Task, **kwargs: Any) -> None:
        pass`,
        }}
      />

      <PatternBlock
        name="Multi-Document Agent"
        category="RAG Agents"
        whenToUse="When you have many document collections and want the agent to decide which collections to query, rather than querying all of them on every request."
      >
        <p>
          Build one <code>QueryEngineTool</code> per document collection, each with a distinct
          description. The agent uses the tool descriptions to decide which collections are
          relevant to each query. This is more efficient than a single large index and gives
          the agent explicit control over retrieval scope.
        </p>
      </PatternBlock>

      <WarningBlock title="ReAct vs Function Calling Agent Choice">
        <p>ReAct agents produce verbose reasoning text that counts against your token budget and
        can be slow. Function calling agents are faster and more reliable for tool selection but
        require an LLM with native function calling support. For Claude, prefer the function
        calling agent via LiteLLM or the Anthropic-specific implementation, as ReAct with
        Claude's verbose reasoning can be 3-5x more expensive per step.</p>
      </WarningBlock>

      <BestPracticeBlock title="Limit Tools Per Agent Step">
        <p>Every tool's schema and description is included in the prompt on every agent step.
        With 20+ tools, this consumes thousands of tokens per iteration. For large tool sets,
        use a two-level architecture: a router agent with coarse-grained tools that delegate
        to specialised sub-agents, each with a small focused toolset. This reduces per-step
        token cost and improves tool selection accuracy.</p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Agent State Persistence">
        <p>LlamaIndex agents are stateless between <code>agent.query()</code> calls unless
        you use <code>agent.chat()</code> which maintains an internal
        <code>ChatMemoryBuffer</code>. For production applications requiring session
        persistence across server restarts, serialise the chat history to a database and
        initialise the agent with <code>chat_history</code> on each new request.</p>
      </NoteBlock>
    </article>
  )
}
