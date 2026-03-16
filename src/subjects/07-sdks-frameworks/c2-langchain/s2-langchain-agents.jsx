import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function LangChainAgents() {
  return (
    <article className="prose-content">
      <h2>LangChain Agents</h2>
      <p>
        LangChain agents are reasoning loops where an LLM decides which tools to call, in what
        order, to answer a user's query. LangChain supports two primary agent types:
        ReAct (reasoning + acting) and OpenAI-tools-style agents that use structured function
        calling.
      </p>

      <ConceptBlock term="LangChain Agent">
        <p>
          A LangChain agent wraps an LLM with a set of tools. On each step, the LLM observes
          the current state (question + previous tool outputs), decides on an action (tool call
          or final answer), and the agent executor runs the action and feeds the result back.
          This loop continues until the LLM produces a final answer.
        </p>
      </ConceptBlock>

      <h2>Defining Custom Tools</h2>
      <p>
        Tools can be created from plain Python functions using the <code>@tool</code> decorator,
        or as <code>StructuredTool</code> objects for more control. The docstring becomes the
        tool's description — write it clearly.
      </p>

      <SDKExample
        title="Creating Custom Tools"
        tabs={{
          python: `from langchain_core.tools import tool, StructuredTool
from langchain_community.tools import DuckDuckGoSearchRun
from pydantic import BaseModel, Field
import httpx

# Simple tool from function — docstring is the description
@tool
def get_stock_price(ticker: str) -> str:
    """Get the current stock price for a given ticker symbol (e.g. AAPL, GOOG).
    Returns the price in USD as a string, or an error message."""
    try:
        # In production, use a real financial API
        return f"{ticker}: $142.30 USD (mock)"
    except Exception as e:
        return f"Error fetching price for {ticker}: {str(e)}"

@tool
def calculate_compound_interest(
    principal: float,
    rate: float,
    years: int,
    compounds_per_year: int = 12,
) -> str:
    """Calculate compound interest.

    Args:
        principal: Initial investment amount in dollars.
        rate: Annual interest rate as a decimal (e.g. 0.05 for 5%).
        years: Number of years.
        compounds_per_year: How many times interest compounds per year (default 12).

    Returns:
        Final amount and total interest earned.
    """
    amount = principal * (1 + rate / compounds_per_year) ** (compounds_per_year * years)
    interest = amount - principal
    return f"Final amount: $\{amount:,.2f\} | Interest earned: $\{interest:,.2f\}"

# Structured tool with Pydantic schema for complex inputs
class SearchInput(BaseModel):
    query: str = Field(description="Search query")
    num_results: int = Field(default=5, description="Number of results (1-10)")

def search_web(query: str, num_results: int = 5) -> str:
    """Search the web using DuckDuckGo."""
    search = DuckDuckGoSearchRun()
    return search.run(query)

web_search_tool = StructuredTool.from_function(
    func=search_web,
    name="web_search",
    description="Search the web for current information. Use for recent events, prices, or facts.",
    args_schema=SearchInput,
    return_direct=False,  # Feed result back to LLM (not directly to user)
)

tools = [get_stock_price, calculate_compound_interest, web_search_tool]`,
          typescript: `import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Tool from function with Zod schema
const getStockPrice = tool(
  async ({ ticker }) => {
    // In production, call a real financial API
    return \${ticker}: $142.30 USD (mock);
  },
  {
    name: 'get_stock_price',
    description: 'Get the current stock price for a given ticker symbol (e.g. AAPL, GOOG).',
    schema: z.object({
      ticker: z.string().describe('Stock ticker symbol'),
    }),
  },
);

const calculateCompoundInterest = tool(
  async ({ principal, rate, years, compoundsPerYear = 12 }) => {
    const amount = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);
    const interest = amount - principal;
    return Final amount: $\${amount.toFixed(2)} | Interest earned: $\${interest.toFixed(2)};
  },
  {
    name: 'calculate_compound_interest',
    description: 'Calculate compound interest given principal, rate, and years.',
    schema: z.object({
      principal: z.number().describe('Initial investment in dollars'),
      rate: z.number().describe('Annual interest rate as decimal (e.g. 0.05 for 5%)'),
      years: z.number().int().describe('Number of years'),
      compoundsPerYear: z.number().int().default(12),
    }),
  },
);

const tools = [getStockPrice, calculateCompoundInterest];`,
        }}
      />

      <h2>Creating a Tool-Calling Agent</h2>
      <p>
        The modern way to build LangChain agents uses <code>create_tool_calling_agent</code>
        (works with any model that supports structured tool calling) combined with
        <code>AgentExecutor</code>.
      </p>

      <SDKExample
        title="Tool-Calling Agent with AgentExecutor"
        tabs={{
          python: `from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor

llm = ChatAnthropic(model="claude-opus-4-6", temperature=0)

# Agent prompt must include agent_scratchpad
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful financial assistant. You have access to tools to look up
stock prices and calculate interest. Always show your work and be precise with numbers."""),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Create agent (LCEL chain: prompt | llm_with_tools | output_parser)
agent = create_tool_calling_agent(llm, tools, prompt)

# AgentExecutor handles the loop
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,         # Print each step
    max_iterations=10,    # Prevent infinite loops
    handle_parsing_errors=True,  # Retry on malformed tool calls
    return_intermediate_steps=True,  # Include tool call history in output
)

# Run the agent
result = executor.invoke({
    "input": "If I invest $10,000 in AAPL today and it grows at 8% annually for 10 years, what will I have?",
    "chat_history": [],
})

print(result["output"])

# Access intermediate steps (tool calls and results)
for step in result["intermediate_steps"]:
    action, observation = step
    print(f"Tool: {action.tool} | Input: {action.tool_input}")
    print(f"Result: {observation}\\n")`,
          typescript: `import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';

const llm = new ChatAnthropic({ model: 'claude-opus-4-6', temperature: 0 });

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful financial assistant with access to stock and calculation tools.'],
  new MessagesPlaceholder({ variableName: 'chat_history', optional: true }),
  ['human', '{input}'],
  new MessagesPlaceholder('agent_scratchpad'),
]);

const agent = await createToolCallingAgent({ llm, tools, prompt });

const executor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
  maxIterations: 10,
  handleParsingErrors: true,
  returnIntermediateSteps: true,
});

const result = await executor.invoke({
  input: 'What is the stock price of AAPL and how much will $10,000 grow at 8% over 10 years?',
  chat_history: [],
});

console.log(result.output);`,
        }}
      />

      <h2>Callbacks</h2>
      <p>
        Callbacks let you hook into the agent's execution lifecycle for logging, streaming
        updates to a UI, or custom monitoring.
      </p>

      <SDKExample
        title="Custom Callbacks"
        tabs={{
          python: `from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.agents import AgentAction, AgentFinish
from typing import Any, Union

class VerboseAgentCallback(BaseCallbackHandler):
    """Log each agent step to the console with timestamps."""

    def on_agent_action(self, action: AgentAction, **kwargs: Any) -> None:
        print(f"[TOOL CALL] {action.tool}({action.tool_input})")

    def on_agent_finish(self, finish: AgentFinish, **kwargs: Any) -> None:
        print(f"[FINAL] {finish.return_values['output'][:100]}...")

    def on_tool_end(self, output: str, **kwargs: Any) -> None:
        print(f"[TOOL RESULT] {output[:200]}")

    def on_tool_error(self, error: Union[Exception, KeyboardInterrupt], **kwargs: Any) -> None:
        print(f"[TOOL ERROR] {error}")

    def on_llm_start(self, serialized: dict, prompts: list, **kwargs: Any) -> None:
        print(f"[LLM] Sending request to {serialized.get('name', 'unknown')}")

# Attach callbacks to executor
callback = VerboseAgentCallback()

result = executor.invoke(
    {"input": "What is Apple's stock price?", "chat_history": []},
    config={"callbacks": [callback]},
)`,
        }}
      />

      <h2>Memory and Conversation History</h2>
      <p>
        Agents can maintain conversation history across turns. The cleanest approach with LCEL
        agents is to manage history externally and pass it via the <code>chat_history</code>
        variable.
      </p>

      <SDKExample
        title="Stateful Multi-Turn Agent"
        tabs={{
          python: `from langchain_core.messages import HumanMessage, AIMessage
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-opus-4-6")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant with access to financial tools."),
    MessagesPlaceholder("chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),
])
agent = create_tool_calling_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=False)

chat_history = []

def chat(user_input: str) -> str:
    result = executor.invoke({
        "input": user_input,
        "chat_history": chat_history,
    })
    chat_history.append(HumanMessage(content=user_input))
    chat_history.append(AIMessage(content=result["output"]))
    return result["output"]

# Multi-turn conversation
print(chat("What is Apple's stock price?"))
print(chat("If I bought 100 shares at that price, how much would I spend?"))
print(chat("And if it grows 10% annually for 5 years, what would it be worth?"))`,
        }}
      />

      <PatternBlock
        name="Prebuilt Agent Tools"
        category="Productivity"
        whenToUse="For common tools like web search, calculators, Wikipedia, code execution, and file I/O. LangChain Community provides 100+ prebuilt tools — use them instead of reimplementing."
      >
        <p>
          <code>langchain-community</code> provides tools like <code>DuckDuckGoSearchRun</code>,
          <code>WikipediaQueryRun</code>, <code>PythonREPLTool</code>, <code>SQLDatabaseTool</code>,
          and many more. Always check the community package before building a tool from scratch.
        </p>
      </PatternBlock>

      <WarningBlock title="AgentExecutor max_iterations">
        <p>Always set <code>max_iterations</code> on AgentExecutor. Without it, a confused agent
        can loop indefinitely, consuming tokens and money. For production, 10–15 iterations is
        usually sufficient; increase only for genuinely complex multi-step tasks. Also set
        <code>max_execution_time</code> as a wall-clock timeout.</p>
      </WarningBlock>

      <BestPracticeBlock title="Migrate to LangGraph for Complex Agents">
        <p>AgentExecutor is straightforward for simple ReAct loops but becomes limiting when you
        need conditional branching, parallel tool execution, human-in-the-loop pauses, or
        multi-agent coordination. For these patterns, migrate to LangGraph — it gives you full
        control over the execution flow while keeping LCEL-compatible components.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Structured Output Tools">
        <p>For tools that return complex objects, use Pydantic models as the return type annotation.
        LangChain will serialise the object to JSON automatically, and Claude can parse the
        structure reliably. Avoid returning unstructured strings for anything beyond simple scalar
        values.</p>
      </NoteBlock>
    </article>
  )
}
