import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function AzureAiSdk() {
  return (
    <article className="prose-content">
      <h2>Azure AI SDK for Python</h2>
      <p>
        Microsoft provides two primary Python SDKs for AI on Azure: the <strong>openai</strong> package
        with Azure configuration (for Azure OpenAI Service), and the <strong>azure-ai-inference</strong>
        package (for Azure AI Foundry model catalog — Phi, Llama, Mistral, etc. with a unified API).
        Both use Azure Identity for keyless authentication via managed identity.
      </p>

      <ConceptBlock term="Azure AI Inference SDK">
        <p>
          The <code>azure-ai-inference</code> SDK provides a unified client for all models deployed
          to Azure AI Foundry endpoints — regardless of whether they're OpenAI models, Phi-3, Llama 3,
          Mistral, or Command R+. It uses the same request/response schema as OpenAI's chat completions
          API but works with any provider-agnostic endpoint. This makes it easy to switch models
          without changing application code.
        </p>
      </ConceptBlock>

      <h2>Installation</h2>
      <CodeBlock language="bash" filename="install.sh">
{`# Azure OpenAI (uses the openai package with Azure config)
pip install openai azure-identity

# Azure AI Inference SDK (model catalog / Foundry endpoints)
pip install azure-ai-inference azure-identity

# Azure AI Search (for RAG retrieval)
pip install azure-search-documents azure-identity

# Azure AI Agent Service
pip install azure-ai-projects azure-identity`}
      </CodeBlock>

      <h2>Authentication: DefaultAzureCredential</h2>
      <p>
        <code>DefaultAzureCredential</code> automatically picks the right authentication method
        based on the environment: Managed Identity in production (Azure VMs, App Service, AKS),
        Azure CLI locally during development, environment variables in CI/CD. This eliminates
        the need to manage API keys.
      </p>

      <CodeBlock language="python" filename="auth_setup.py">
{`from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI

# Method 1: Azure OpenAI with Managed Identity (recommended for production)
token_provider = get_bearer_token_provider(
    DefaultAzureCredential(),
    "https://cognitiveservices.azure.com/.default"
)

client = AzureOpenAI(
    azure_endpoint="https://your-service.openai.azure.com",
    azure_ad_token_provider=token_provider,
    api_version="2024-10-21"
)

# Method 2: Azure AI Inference SDK with Managed Identity
from azure.ai.inference import ChatCompletionsClient
from azure.core.credentials import AzureKeyCredential

# For production: use DefaultAzureCredential
inference_client = ChatCompletionsClient(
    endpoint="https://your-endpoint.services.ai.azure.com/models",
    credential=DefaultAzureCredential()
)

# Method 3: API Key (for development/testing only - never in production)
inference_client_dev = ChatCompletionsClient(
    endpoint="https://your-endpoint.services.ai.azure.com/models",
    credential=AzureKeyCredential("your-key-here")
)`}
      </CodeBlock>

      <h2>Azure AI Inference SDK: Chat Completions</h2>

      <SDKExample
        title="Azure AI Inference — Chat, Streaming, and Tool Use"
        tabs={{
          python: `from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import (
    SystemMessage,
    UserMessage,
    AssistantMessage,
    ToolMessage,
    ChatCompletionsToolDefinition,
    FunctionDefinition,
)
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
import json

# Initialize client - works with any model in Azure AI Foundry catalog
client = ChatCompletionsClient(
    endpoint="https://your-hub.services.ai.azure.com/models",
    credential=DefaultAzureCredential(),
    model="Phi-4"  # Or "Meta-Llama-3-1-70B-Instruct", "Mistral-Large", etc.
)

# Basic chat
def chat(query: str) -> str:
    response = client.complete(
        messages=[
            SystemMessage("You are a helpful AI assistant."),
            UserMessage(query)
        ],
        temperature=0.7,
        max_tokens=1024
    )
    return response.choices[0].message.content

# Streaming
def stream_chat(query: str) -> None:
    stream = client.complete(
        messages=[UserMessage(query)],
        stream=True
    )
    for update in stream:
        if update.choices and update.choices[0].delta.content:
            print(update.choices[0].delta.content, end="", flush=True)

# Tool use
search_tool = ChatCompletionsToolDefinition(
    function=FunctionDefinition(
        name="search_knowledge_base",
        description="Search the internal knowledge base for relevant information",
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "top_k": {"type": "integer", "default": 5}
            },
            "required": ["query"]
        }
    )
)

def chat_with_tools(user_message: str) -> str:
    messages = [UserMessage(user_message)]

    response = client.complete(
        messages=messages,
        tools=[search_tool],
        tool_choice="auto",
        model="Phi-4"
    )

    msg = response.choices[0].message

    if msg.tool_calls:
        messages.append(AssistantMessage(tool_calls=msg.tool_calls))

        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            result = {"results": ["doc1 content...", "doc2 content..."]}  # mock

            messages.append(ToolMessage(
                tool_call_id=tc.id,
                content=json.dumps(result)
            ))

        final = client.complete(messages=messages, model="Phi-4")
        return final.choices[0].message.content

    return msg.content`,
        }}
      />

      <h2>Azure AI Projects SDK: Agent Service</h2>
      <p>
        The <code>azure-ai-projects</code> SDK provides access to Azure AI Agent Service —
        Microsoft's managed agent hosting platform. It handles thread management, tool execution,
        and file search without writing an agent loop.
      </p>

      <SDKExample
        title="Azure AI Agent Service — Creating and Running an Agent"
        tabs={{
          python: `from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    CodeInterpreterTool,
    FileSearchTool,
    FunctionTool,
    ToolSet,
)
from azure.identity import DefaultAzureCredential
import time

# Initialize the project client
project_client = AIProjectClient.from_connection_string(
    conn_str="<connection-string-from-azure-portal>",
    credential=DefaultAzureCredential()
)

# Define a custom function tool
def get_stock_price(ticker: str) -> str:
    """Get the current stock price for a ticker symbol."""
    # Real implementation would call a financial API
    prices = {"MSFT": 420.50, "GOOGL": 190.25, "AMZN": 228.75}
    return str(prices.get(ticker.upper(), "Not found"))

# Create an agent with multiple tools
with project_client:
    # Upload a file for file search
    file = project_client.agents.upload_file_and_poll(
        file_path="knowledge_base.pdf",
        purpose="assistants"
    )
    vector_store = project_client.agents.create_vector_store_and_poll(
        file_ids=[file.id],
        name="KB Vector Store"
    )

    # Build toolset
    toolset = ToolSet()
    toolset.add(CodeInterpreterTool())
    toolset.add(FileSearchTool(vector_store_ids=[vector_store.id]))
    toolset.add(FunctionTool(functions=[get_stock_price]))

    # Create agent
    agent = project_client.agents.create_agent(
        model="gpt-4o",
        name="Financial Analyst",
        instructions=(
            "You are a financial analyst. Use file search to retrieve relevant "
            "research reports. Use the stock price tool for real-time quotes. "
            "Use code interpreter to create charts when asked."
        ),
        toolset=toolset
    )

    # Create a thread and run
    thread = project_client.agents.create_thread()
    project_client.agents.create_message(
        thread_id=thread.id,
        role="user",
        content="What is the current price of MSFT and how does it compare to the analyst target in the research report?"
    )

    run = project_client.agents.create_and_process_run(
        thread_id=thread.id,
        agent_id=agent.id
    )

    # Get the response
    messages = project_client.agents.list_messages(thread_id=thread.id)
    for msg in messages:
        if msg.role == "assistant":
            for block in msg.content:
                if hasattr(block, "text"):
                    print(block.text.value)
            break

    # Cleanup
    project_client.agents.delete_agent(agent.id)`,
        }}
      />

      <h2>Azure AI Search Integration</h2>

      <CodeBlock language="python" filename="azure_search_rag.py">
{`from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex, SimpleField, SearchFieldDataType,
    SearchableField, SearchField, VectorSearch,
    HnswAlgorithmConfiguration, VectorSearchProfile,
    SemanticConfiguration, SemanticSearch, SemanticPrioritizedFields,
    SemanticField
)
from azure.core.credentials import AzureKeyCredential

endpoint = "https://your-service.search.windows.net"
credential = AzureKeyCredential("your-key")  # Or DefaultAzureCredential

# Create an index with vector and semantic search
index_client = SearchIndexClient(endpoint=endpoint, credential=credential)

index = SearchIndex(
    name="documents",
    fields=[
        SimpleField(name="id", type=SearchFieldDataType.String, key=True),
        SearchableField(name="title", type=SearchFieldDataType.String),
        SearchableField(name="content", type=SearchFieldDataType.String),
        SimpleField(name="source", type=SearchFieldDataType.String, filterable=True),
        SearchField(
            name="contentVector",
            type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="myHnswProfile"
        )
    ],
    vector_search=VectorSearch(
        algorithms=[HnswAlgorithmConfiguration(name="myHnsw")],
        profiles=[VectorSearchProfile(name="myHnswProfile", algorithm_configuration_name="myHnsw")]
    ),
    semantic_search=SemanticSearch(
        configurations=[
            SemanticConfiguration(
                name="default",
                prioritized_fields=SemanticPrioritizedFields(
                    content_fields=[SemanticField(field_name="content")],
                    title_field=SemanticField(field_name="title")
                )
            )
        ]
    )
)
index_client.create_or_update_index(index)`}
      </CodeBlock>

      <BestPracticeBlock title="Use azure-ai-inference for Model Portability">
        <p>
          Prefer the <code>azure-ai-inference</code> SDK over hardcoding OpenAI-specific API calls
          when targeting Azure AI Foundry. It works identically across GPT-4o, Phi-4, Llama 3.1,
          and Mistral Large — letting you A/B test models by changing a single <code>model=</code>
          parameter. For OpenAI-specific features (DALL-E, Whisper, Assistants), use the
          <code>openai</code> package with Azure configuration.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="API Version Pinning">
        <p>
          Azure OpenAI's <code>api_version</code> parameter is mandatory and new features
          (like structured outputs, o1 reasoning effort, etc.) are only available in specific
          versions. Always pin to a specific API version (e.g., <code>2024-10-21</code>) and
          test upgrades explicitly. Breaking changes can occur between versions.
        </p>
      </NoteBlock>
    </article>
  )
}
