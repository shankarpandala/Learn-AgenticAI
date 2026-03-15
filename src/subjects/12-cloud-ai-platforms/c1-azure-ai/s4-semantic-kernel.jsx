import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function SemanticKernel() {
  return (
    <article className="prose-content">
      <h2>Semantic Kernel</h2>
      <p>
        Semantic Kernel (SK) is Microsoft's open-source SDK for orchestrating LLM-powered
        applications. Available in Python, C#, and Java, it provides a composable architecture
        around a central <strong>Kernel</strong> object that wires together AI services,
        plugins (tools), memory, and planners. Unlike LangChain's chain-centric model or
        LangGraph's explicit state machines, Semantic Kernel leans toward plugin-based function
        composition with automatic LLM-driven orchestration via its auto function calling
        capability.
      </p>

      <ConceptBlock term="Kernel Architecture">
        <p>
          The <strong>Kernel</strong> is the dependency injection container and orchestration
          hub. It holds references to: <strong>AI services</strong> (chat completion, text
          embedding, text generation), <strong>plugins</strong> (collections of callable
          functions), <strong>filters</strong> (middleware for function invocation, prompt
          rendering, and auto function calling), and <strong>memory</strong> (vector store
          connectors). You construct a Kernel, register services and plugins, then invoke
          functions or run chat loops — the Kernel handles routing tool calls between the
          LLM and your registered functions automatically.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Semantic Kernel Architecture"
        width={700}
        height={340}
        nodes={[
          { id: 'user', label: 'User', type: 'external', x: 70, y: 170 },
          { id: 'kernel', label: 'Kernel\n(orchestrator)', type: 'agent', x: 230, y: 170 },
          { id: 'llm', label: 'Azure OpenAI\nChat Service', type: 'llm', x: 420, y: 80 },
          { id: 'embed', label: 'Embedding\nService', type: 'llm', x: 420, y: 160 },
          { id: 'plugins', label: 'Plugins\n(native + semantic)', type: 'tool', x: 420, y: 240 },
          { id: 'memory', label: 'Vector Memory\n(AI Search)', type: 'store', x: 600, y: 200 },
          { id: 'filters', label: 'Filters\n(middleware)', type: 'tool', x: 230, y: 290 },
          { id: 'planner', label: 'Planner\n(auto / Handlebars)', type: 'agent', x: 600, y: 100 },
        ]}
        edges={[
          { from: 'user', to: 'kernel' },
          { from: 'kernel', to: 'llm', label: 'chat' },
          { from: 'kernel', to: 'embed' },
          { from: 'kernel', to: 'plugins', label: 'invoke' },
          { from: 'kernel', to: 'filters' },
          { from: 'embed', to: 'memory' },
          { from: 'llm', to: 'planner' },
          { from: 'plugins', to: 'memory', label: 'search' },
        ]}
      />

      <h2>Kernel Setup and Service Registration</h2>

      <CodeBlock language="python" filename="kernel_setup.py">
{`# pip install semantic-kernel azure-identity

import asyncio
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion, AzureTextEmbedding
from semantic_kernel.connectors.ai.open_ai.settings.azure_open_ai_settings import (
    AzureOpenAISettings,
)
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from semantic_kernel.connectors.ai.function_choice_behavior import FunctionChoiceBehavior
from semantic_kernel.connectors.ai.open_ai.prompt_execution_settings.azure_chat_prompt_execution_settings import (
    AzureChatPromptExecutionSettings,
)

# Build the kernel
kernel = Kernel()

# Register Azure OpenAI chat service using managed identity
credential = DefaultAzureCredential()
token_provider = get_bearer_token_provider(
    credential, "https://cognitiveservices.azure.com/.default"
)

chat_service = AzureChatCompletion(
    service_id="azure-gpt4o",          # internal name for multi-service scenarios
    deployment_name="gpt-4o",
    endpoint="https://my-resource.openai.azure.com/",
    ad_token_provider=token_provider,
    api_version="2024-12-01-preview",
)
kernel.add_service(chat_service)

# Register embedding service (for vector memory)
embed_service = AzureTextEmbedding(
    service_id="azure-embeddings",
    deployment_name="text-embedding-3-large",
    endpoint="https://my-resource.openai.azure.com/",
    ad_token_provider=token_provider,
)
kernel.add_service(embed_service)

# Execution settings with auto function calling enabled
settings = AzureChatPromptExecutionSettings(
    service_id="azure-gpt4o",
    temperature=0.1,
    max_tokens=2048,
    function_choice_behavior=FunctionChoiceBehavior.Auto(
        filters={"included_plugins": ["WeatherPlugin", "CalendarPlugin"]}
        # Empty filters = all registered plugins available
    ),
)`}
      </CodeBlock>

      <h2>Plugins: Native and Semantic Functions</h2>

      <ConceptBlock term="Plugin Types">
        <p>
          Semantic Kernel has two function types within plugins. <strong>Native functions</strong>
          are decorated Python methods — the LLM can call them directly with arguments extracted
          from natural language. Decorators on parameters provide the schema descriptions
          that the LLM uses to understand how to call the function.
          <strong>Semantic/Prompt functions</strong> are parameterized prompt templates that
          themselves call an LLM — they are functions whose implementation is an LLM call.
          This lets you compose LLM calls as first-class building blocks that other LLM calls
          can invoke, enabling nested reasoning chains.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Plugin Creation: Native Functions + Auto Function Calling"
        tabs={{
          python: `from semantic_kernel.functions import kernel_function
from semantic_kernel.functions.kernel_parameter_metadata import KernelParameterMetadata
from typing import Annotated
import httpx
import json

# --- Native Function Plugin ---
class WeatherPlugin:
    """Plugin for getting weather information."""

    @kernel_function(
        name="get_current_weather",
        description="Get the current weather conditions for a specific city",
    )
    async def get_current_weather(
        self,
        city: Annotated[str, "The city name, e.g. 'Seattle' or 'London'"],
        units: Annotated[str, "Temperature units: 'celsius' or 'fahrenheit'"] = "celsius",
    ) -> Annotated[str, "JSON string with temperature, conditions, and humidity"]:
        # Real implementation calls a weather API
        return json.dumps({
            "city": city,
            "temperature": 18,
            "units": units,
            "conditions": "partly cloudy",
            "humidity": 72,
            "wind_speed_kmh": 15,
        })

    @kernel_function(
        name="get_forecast",
        description="Get a 5-day weather forecast for a city",
    )
    async def get_forecast(
        self,
        city: Annotated[str, "The city name"],
        days: Annotated[int, "Number of days to forecast, 1-7"] = 5,
    ) -> str:
        return json.dumps({
            "city": city,
            "forecast": [
                {"day": i+1, "high": 20-i, "low": 12-i, "conditions": "sunny"}
                for i in range(days)
            ]
        })

# --- Semantic/Prompt Function Plugin ---
# These are LLM-backed functions composed inline
from semantic_kernel.prompt_template import PromptTemplateConfig

weather_summary_fn = kernel.add_function(
    plugin_name="WeatherPlugin",
    function_name="summarize_conditions",
    description="Generate a natural language summary of weather data for travelers",
    prompt="""Given this weather data, write a concise 2-sentence summary
for a traveler deciding what to pack:

Weather data: {{$weather_json}}
Destination: {{$destination}}
Trip type: {{$trip_type}}

Summary:""",
    template_format="semantic-kernel",
)

# Register the native plugin
kernel.add_plugin(WeatherPlugin(), plugin_name="WeatherPlugin")

# --- Auto Function Calling Chat Loop ---
from semantic_kernel.contents import ChatHistory
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion

async def chat_with_tools():
    chat_history = ChatHistory()
    chat_history.add_system_message(
        "You are a helpful travel assistant. Use the weather tools to give accurate, "
        "current weather information. Always check the weather before making packing recommendations."
    )

    chat_service = kernel.get_service("azure-gpt4o")

    settings = AzureChatPromptExecutionSettings(
        service_id="azure-gpt4o",
        temperature=0.2,
        function_choice_behavior=FunctionChoiceBehavior.Auto(),
    )

    user_message = "I'm traveling to Tokyo next week. What should I pack?"
    chat_history.add_user_message(user_message)
    print(f"User: {user_message}")

    # The model will automatically call get_current_weather("Tokyo") and
    # get_forecast("Tokyo") as needed — no explicit tool dispatch code required
    response = await chat_service.get_chat_message_content(
        chat_history=chat_history,
        settings=settings,
        kernel=kernel,  # Kernel provides the function registry
    )

    print(f"Assistant: {response.content}")
    # Function calls are recorded in the chat history automatically
    print(f"Tool calls made: {[m.role for m in chat_history.messages]}")

asyncio.run(chat_with_tools())`,
        }}
      />

      <h2>Planners</h2>

      <ConceptBlock term="Planner Types">
        <p>
          Planners decompose a high-level goal into a sequence of function calls.
          <strong>Auto Function Calling Planner</strong> (default): The LLM itself decides
          which functions to call next, iterating until the goal is achieved — this is the
          recommended approach as of SK v1.x. <strong>Handlebars Planner</strong>: Generates
          a static Handlebars template (a plan) upfront, then executes it — deterministic
          execution, good for auditing. <strong>Sequential Planner</strong>: Deprecated in
          favor of auto function calling. Use Handlebars when you need an inspectable,
          serializable plan; use Auto for dynamic tasks where the steps aren't predictable.
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="handlebars_planner.py">
{`from semantic_kernel.planners.handlebars_planner import HandlebarsPlanner, HandlebarsPlannerOptions

planner = HandlebarsPlanner(
    kernel,
    options=HandlebarsPlannerOptions(
        allow_loops=True,
        max_tokens_in_context=4000,
        excluded_plugins=["_global_functions_"],  # exclude built-ins
    )
)

# Generate a plan (one LLM call to produce the Handlebars template)
goal = """
Research the current weather in 3 cities (Paris, Tokyo, Sydney),
then create a comparison table and recommend the best city to visit in December.
"""

plan = await planner.create_plan(goal)
print("Generated plan:")
print(plan.template)
# Output is a Handlebars template like:
# {{set "paris_weather" (WeatherPlugin-get_current_weather city="Paris")}}
# {{set "tokyo_weather" (WeatherPlugin-get_current_weather city="Tokyo")}}
# {{set "sydney_weather" (WeatherPlugin-get_current_weather city="Sydney")}}
# {{ReportPlugin-create_comparison_table data1=paris_weather data2=tokyo_weather data3=sydney_weather}}

# Execute the generated plan
result = await plan.invoke(kernel)
print(f"Plan result: {result}")

# Plans are serializable — store and reuse
plan_json = plan.to_json()
# Later: restored_plan = HandlebarsPlan.from_json(plan_json, kernel)`}
      </CodeBlock>

      <h2>Vector Memory with Azure AI Search</h2>

      <CodeBlock language="python" filename="vector_memory.py">
{`from semantic_kernel.connectors.memory.azure_ai_search import AzureAISearchCollection
from semantic_kernel.data import (
    VectorStoreRecordCollection,
    VectorStoreRecordDefinition,
    VectorStoreRecordField,
    VectorStoreRecordVectorField,
    VectorStoreTextSearch,
    vectorstoremodel,
)
from dataclasses import dataclass, field
from typing import Annotated

# Define a typed record model
@vectorstoremodel
@dataclass
class DocumentRecord:
    id: Annotated[str, VectorStoreRecordField(is_key=True)]
    content: Annotated[str, VectorStoreRecordField(is_full_text_searchable=True)]
    title: Annotated[str, VectorStoreRecordField(is_filterable=True)]
    source_url: Annotated[str, VectorStoreRecordField()]
    content_vector: Annotated[
        list[float] | None,
        VectorStoreRecordVectorField(
            dimensions=1536,
            distance_function="cosine_distance",
            index_kind="hnsw",
            embedding_property_name="content",  # auto-embed this field
        )
    ] = field(default=None)

# Connect to Azure AI Search
collection = AzureAISearchCollection(
    collection_name="product-documents",
    data_model_type=DocumentRecord,
    search_endpoint="https://my-search.search.windows.net",
    api_key="...",  # or use DefaultAzureCredential
)

# Create the collection (index)
await collection.create_collection_if_not_exists()

# Upsert records — vectors are computed automatically from content field
records = [
    DocumentRecord(
        id="doc-001",
        content="Azure AI Agent Service supports persistent threads with full message history.",
        title="Azure AI Agent Service Overview",
        source_url="https://docs.microsoft.com/azure/ai-agent-service",
    ),
    DocumentRecord(
        id="doc-002",
        content="Semantic Kernel plugins expose native Python functions as LLM-callable tools.",
        title="Semantic Kernel Plugins",
        source_url="https://learn.microsoft.com/semantic-kernel/plugins",
    ),
]

# The embedding service registered in the kernel auto-vectorizes content
await collection.upsert_batch(records, kernel=kernel)

# Hybrid vector + text search
from semantic_kernel.data import VectorSearchOptions

search_results = await collection.hybrid_search(
    query="how do agents maintain conversation history",
    options=VectorSearchOptions(
        top=5,
        include_vectors=False,
        filter="title eq 'Azure AI Agent Service Overview'",
    ),
    kernel=kernel,
)

async for result in search_results.results:
    print(f"Score: {result.score:.3f} | {result.record.title}")
    print(f"  {result.record.content[:120]}...")

# Use collection as a text search plugin in the kernel
text_search = VectorStoreTextSearch.from_vector_text_search(collection)
kernel.add_plugin(
    text_search.create_search_plugin(
        plugin_name="DocumentSearch",
        description="Search the product documentation knowledge base",
    )
)`}
      </CodeBlock>

      <h2>Multi-Agent Patterns</h2>

      <ConceptBlock term="Agent Chat (AgentGroupChat)">
        <p>
          Semantic Kernel's <code>AgentGroupChat</code> enables multi-agent conversations where
          multiple specialized agents interact in a shared chat. A
          <strong>SelectionStrategy</strong> determines which agent speaks next (round-robin,
          or LLM-based selection), and a <strong>TerminationStrategy</strong> decides when
          the conversation is complete (keyword detection, LLM judge, max turn count).
          Each agent in the group has its own system prompt and plugin set.
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="multi_agent_group_chat.py">
{`from semantic_kernel.agents import ChatCompletionAgent, AgentGroupChat
from semantic_kernel.agents.strategies import (
    KernelFunctionSelectionStrategy,
    KernelFunctionTerminationStrategy,
)
from semantic_kernel.functions import KernelFunctionFromPrompt

# Create specialized agents (each uses the same kernel but different personas)
researcher = ChatCompletionAgent(
    service_id="azure-gpt4o",
    kernel=kernel,
    name="Researcher",
    instructions="""You are a research analyst. Your role is to gather and present factual
information. Use available search tools to find relevant data. Always cite sources.
Be concise and focus on facts.""",
    execution_settings=AzureChatPromptExecutionSettings(
        service_id="azure-gpt4o",
        function_choice_behavior=FunctionChoiceBehavior.Auto(
            filters={"included_plugins": ["DocumentSearch", "WebSearch"]}
        ),
    ),
)

critic = ChatCompletionAgent(
    service_id="azure-gpt4o",
    kernel=kernel,
    name="Critic",
    instructions="""You are a critical reviewer. Your role is to identify weaknesses,
gaps, and potential issues in the researcher's findings. Ask probing questions
and flag unsupported claims. Be constructive but thorough.""",
)

synthesizer = ChatCompletionAgent(
    service_id="azure-gpt4o",
    kernel=kernel,
    name="Synthesizer",
    instructions="""You are a synthesis expert. When the research and critique are complete,
combine the insights into a final coherent recommendation. Respond with 'FINAL ANSWER:'
prefix when you have a complete synthesis.""",
)

# LLM-based agent selection strategy
selection_fn = KernelFunctionFromPrompt(
    function_name="select_next_agent",
    prompt="""Given this conversation history, select the most appropriate next speaker.
Return only the agent name, no explanation.

Agents:
- Researcher: gathers information, answers questions with data
- Critic: identifies problems, challenges assumptions (speaks after Researcher)
- Synthesizer: creates final recommendations (speaks last, after 2+ exchanges)

History:
{{$history}}

Next speaker:""",
)

# Termination when synthesizer produces final answer
termination_fn = KernelFunctionFromPrompt(
    function_name="check_termination",
    prompt="""Does this message contain 'FINAL ANSWER:'? Reply only 'yes' or 'no'.

Message: {{$lastmessage}}""",
)

group_chat = AgentGroupChat(
    agents=[researcher, critic, synthesizer],
    selection_strategy=KernelFunctionSelectionStrategy(
        function=selection_fn,
        kernel=kernel,
        result_parser=lambda r: str(r.value[0]),
        agent_variable_name="agents",
        history_variable_name="history",
    ),
    termination_strategy=KernelFunctionTerminationStrategy(
        agents=[synthesizer],       # Only check termination on synthesizer's messages
        function=termination_fn,
        kernel=kernel,
        result_parser=lambda r: "yes" in str(r.value[0]).lower(),
        history_variable_name="lastmessage",
        maximum_iterations=12,      # Hard limit to prevent infinite loops
    ),
)

# Start the multi-agent conversation
await group_chat.add_chat_message(
    message="Analyze the trade-offs between Azure AI Agent Service and a custom LangGraph agent for a production customer support bot."
)

async for message in group_chat.invoke():
    print(f"[{message.name}]: {message.content}\\n")`}
      </CodeBlock>

      <PatternBlock
        name="Plugin-per-Domain Architecture"
        category="Modularity"
        whenToUse="When building enterprise agents that need access to many different backend systems. Each business domain (CRM, ERP, HR, finance) gets its own plugin with typed, well-documented functions."
      >
        <p>
          Define one plugin class per domain with 3–8 focused functions each. Keep function
          descriptions precise — the LLM uses them to decide when and how to call the function.
          Vague descriptions lead to incorrect tool selection. Register only the plugins relevant
          to the current agent persona using the <code>filters</code> parameter in
          <code>FunctionChoiceBehavior.Auto()</code>. This reduces the tool selection token
          overhead and improves routing accuracy.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Filters for Observability and Safety">
        <p>
          Semantic Kernel's filter system is the right place to add cross-cutting concerns.
          Implement a <strong>FunctionInvocationFilter</strong> to log every tool call with
          its arguments and result — this gives you complete agent execution traces without
          modifying plugin code. Add a <strong>PromptRenderFilter</strong> to inspect the
          final rendered prompt before it is sent to the LLM, enabling prompt injection
          detection. Add an <strong>AutoFunctionInvocationFilter</strong> to intercept
          LLM-requested tool calls before execution, allowing human-in-the-loop approval
          for high-risk operations (e.g., write operations to production databases).
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="SK vs. LangGraph: When to Choose Each">
        <p>
          Choose Semantic Kernel when: you are in the Microsoft/.NET ecosystem, you want
          tight Azure OpenAI integration with managed identity out of the box, your agent
          logic fits the plugin/function-calling model, or you need C# support. Choose
          LangGraph when: you need explicit control over agent flow with conditional branching
          and cycles, you require durable checkpointing with PostgreSQL/Redis backends, or
          you are building complex multi-step workflows where the execution graph must be
          auditable. Both support multi-agent patterns, but LangGraph gives more precise
          control over state transitions at the cost of more boilerplate.
        </p>
      </NoteBlock>

      <NoteBlock type="info" title="Process Framework (SK v1.x)">
        <p>
          Semantic Kernel 1.x introduces the <strong>Process Framework</strong> — a structured
          way to define long-running business processes as stateful event-driven graphs,
          similar to LangGraph's StateGraph but with a strongly-typed event/step model.
          Steps communicate via typed events, and processes can be paused and resumed with
          Azure Durable Functions as the backend. This is the recommended path for complex
          multi-step business process automation in the Microsoft stack.
        </p>
      </NoteBlock>
    </article>
  )
}
