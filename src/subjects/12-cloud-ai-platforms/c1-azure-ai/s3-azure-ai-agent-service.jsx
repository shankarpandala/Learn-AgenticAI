import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function AzureAIAgentService() {
  return (
    <article className="prose-content">
      <h2>Azure AI Agent Service</h2>
      <p>
        Azure AI Agent Service is a fully managed runtime for deploying AI agents in production.
        It handles persistent thread storage, tool execution, file ingestion, vector store
        management, and streaming — so you write agent logic, not infrastructure. The API
        is compatible with OpenAI's Assistants API v2, meaning code written for OpenAI
        Assistants can be migrated to Azure AI Agent Service with minimal changes, while
        gaining Azure's security and compliance posture.
      </p>

      <ConceptBlock term="Core Primitives">
        <p>
          <strong>Agent</strong>: A configured LLM instance with a system prompt, model
          assignment, and set of enabled tools. Created once, reused across many conversations.
          <strong>Thread</strong>: A persistent conversation session. Threads store the full
          message history and are durable — users can resume conversations days later.
          <strong>Message</strong>: A turn in the thread, from either the user or assistant.
          Messages can contain text, file attachments, and image content.
          <strong>Run</strong>: An execution of the agent against a thread. A run processes
          pending user messages, invokes tools as needed, and produces assistant messages.
          <strong>Vector Store</strong>: A managed embedding store for file search RAG,
          backed by Azure AI Search.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Azure AI Agent Service Request Flow"
        width={700}
        height={320}
        nodes={[
          { id: 'client', label: 'Client App', type: 'external', x: 70, y: 160 },
          { id: 'agent', label: 'Agent\n(system prompt + tools)', type: 'agent', x: 220, y: 160 },
          { id: 'thread', label: 'Thread\n(message history)', type: 'store', x: 390, y: 100 },
          { id: 'llm', label: 'Azure OpenAI\nGPT-4o / o1', type: 'llm', x: 560, y: 160 },
          { id: 'code', label: 'Code Interpreter\n(sandbox)', type: 'tool', x: 390, y: 200 },
          { id: 'filesearch', label: 'File Search\n(vector store)', type: 'store', x: 390, y: 290 },
          { id: 'bing', label: 'Bing Grounding\n(web search)', type: 'tool', x: 220, y: 290 },
          { id: 'fn', label: 'Function Calling\n(your APIs)', type: 'tool', x: 560, y: 290 },
        ]}
        edges={[
          { from: 'client', to: 'agent', label: 'create run' },
          { from: 'agent', to: 'thread', label: 'read/write' },
          { from: 'agent', to: 'llm', label: 'inference' },
          { from: 'llm', to: 'code', label: 'tool call' },
          { from: 'llm', to: 'filesearch', label: 'tool call' },
          { from: 'llm', to: 'fn', label: 'tool call' },
          { from: 'agent', to: 'bing', label: 'grounding' },
        ]}
      />

      <h2>Creating Agents and Managing Threads</h2>

      <SDKExample
        title="Agent Setup with File Search and Code Interpreter"
        tabs={{
          python: `# pip install azure-ai-projects azure-identity
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import (
    FileSearchTool,
    CodeInterpreterTool,
    FilePurpose,
    VectorStore,
    VectorStoreFile,
    MessageAttachment,
)
from azure.identity import DefaultAzureCredential
import time

# --- Initialize the client ---
project_client = AIProjectClient.from_connection_string(
    conn_str="eastus.api.azureml.ms;my-subscription-id;my-rg;my-project",
    credential=DefaultAzureCredential(),
)

# Use as context manager for proper cleanup
with project_client:
    agents = project_client.agents

    # --- Upload files to the vector store for RAG ---
    with open("product_docs.pdf", "rb") as f:
        uploaded_file = agents.upload_file_and_poll(
            file=f,
            purpose=FilePurpose.AGENTS,  # vs AGENTS_OUTPUT for code interpreter results
        )
    print(f"Uploaded file: {uploaded_file.id}")

    # Create a vector store and add the file
    vector_store = agents.create_vector_store_and_poll(
        file_ids=[uploaded_file.id],
        name="product-docs-store",
    )
    print(f"Vector store ready: {vector_store.id}, status: {vector_store.status}")

    # --- Create the agent ---
    agent = agents.create_agent(
        model="gpt-4o",  # deployment name
        name="product-support-agent",
        instructions="""You are a product support specialist. Use file search to answer
questions based on the product documentation. When users ask for data analysis
or calculations, use the code interpreter. Always cite your sources.""",
        tools=[
            FileSearchTool(vector_store_ids=[vector_store.id]).definitions[0],
            CodeInterpreterTool().definitions[0],
        ],
        tool_resources={
            "file_search": {"vector_store_ids": [vector_store.id]},
            "code_interpreter": {"file_ids": []},
        },
        temperature=0.2,
        top_p=0.95,
    )
    print(f"Agent created: {agent.id}")

    # --- Create a thread (one per user session) ---
    thread = agents.create_thread()
    print(f"Thread: {thread.id}")

    # --- Add a user message ---
    message = agents.create_message(
        thread_id=thread.id,
        role="user",
        content="What are the main features of our Pro tier? Also, calculate the annual cost if monthly is $49.",
    )

    # --- Create and poll a run ---
    run = agents.create_and_process_run(
        thread_id=thread.id,
        assistant_id=agent.id,
    )
    print(f"Run status: {run.status}")

    if run.status == "failed":
        print(f"Run failed: {run.last_error}")
    elif run.status == "completed":
        # Retrieve the assistant's response
        messages = agents.list_messages(thread_id=thread.id)
        # Messages are in reverse-chronological order
        last_message = messages.data[0]
        for content_block in last_message.content:
            if content_block.type == "text":
                print(content_block.text.value)
                # Print citations from file search
                for annotation in content_block.text.annotations:
                    if annotation.type == "file_citation":
                        print(f"  [Source: {annotation.file_citation.file_id}]")`,
        }}
      />

      <h2>Streaming Runs</h2>
      <p>
        Polling runs with <code>create_and_process_run</code> is simple but adds latency.
        For user-facing applications, stream run events to display the response token by token
        and react to tool calls in real time.
      </p>

      <CodeBlock language="python" filename="streaming_agent_run.py">
{`from azure.ai.projects.models import (
    AgentStreamEvent,
    RunStepDeltaChunk,
    ThreadMessageDelta,
    MessageDeltaChunk,
    RunStep,
    ThreadRun,
)

# Stream a run
with agents.create_stream(
    thread_id=thread.id,
    assistant_id=agent.id,
) as stream:
    for event_type, event_data, func_return in stream:

        if isinstance(event_data, MessageDeltaChunk):
            # Incremental text content
            for delta in event_data.delta.content or []:
                if delta.type == "text" and delta.text:
                    print(delta.text.value, end="", flush=True)

        elif isinstance(event_data, RunStep):
            # Tool invocation steps
            if event_data.type == "tool_calls":
                for tool_call in event_data.step_details.tool_calls or []:
                    if tool_call.type == "file_search":
                        print(f"\\n[Searching files...]")
                    elif tool_call.type == "code_interpreter":
                        print(f"\\n[Running code: {tool_call.code_interpreter.input[:100]}...]")

        elif isinstance(event_data, ThreadRun):
            if event_data.status == "requires_action":
                # Function calling requires_action — handle tool calls
                tool_outputs = []
                for tc in event_data.required_action.submit_tool_outputs.tool_calls:
                    import json
                    args = json.loads(tc.function.arguments)
                    if tc.function.name == "get_pricing":
                        result = {"monthly": 49, "annual": 588, "annual_discounted": 529}
                    else:
                        result = {"error": "unknown function"}
                    tool_outputs.append({
                        "tool_call_id": tc.id,
                        "output": json.dumps(result),
                    })
                # Submit tool outputs and continue streaming
                stream.submit_tool_outputs(tool_outputs=tool_outputs)`}
      </CodeBlock>

      <h2>Function Calling with Custom Tools</h2>

      <CodeBlock language="python" filename="function_calling_agent.py">
{`import json
from azure.ai.projects.models import FunctionTool

# Define Python functions that the agent can call
def get_customer_account(customer_id: str) -> str:
    """Retrieve customer account details by ID."""
    # Real implementation queries your CRM/database
    return json.dumps({
        "id": customer_id,
        "name": "Acme Corp",
        "tier": "enterprise",
        "open_tickets": 3,
        "mrr": 4200,
    })

def create_support_ticket(
    customer_id: str,
    subject: str,
    priority: str,
    description: str
) -> str:
    """Create a new support ticket."""
    ticket_id = f"TKT-{hash(subject) % 100000:05d}"
    return json.dumps({"ticket_id": ticket_id, "status": "created", "priority": priority})

# Register functions with FunctionTool — it extracts schema from type hints + docstrings
user_functions = {get_customer_account, create_support_ticket}
function_tool = FunctionTool(functions=user_functions)

agent = agents.create_agent(
    model="gpt-4o",
    name="crm-agent",
    instructions="You are a CRM assistant. Use tools to look up customer data and create tickets.",
    tools=function_tool.definitions,
)

# When the agent calls a function, the run enters "requires_action" state
# The create_and_process_run helper handles this automatically if you pass a toolset
from azure.ai.projects.models import ToolSet

toolset = ToolSet()
toolset.add(function_tool)

run = agents.create_and_process_run(
    thread_id=thread.id,
    assistant_id=agent.id,
    toolset=toolset,  # SDK will auto-execute functions and submit results
)

# For manual control (e.g., adding approval gates):
while run.status == "requires_action":
    tool_calls = run.required_action.submit_tool_outputs.tool_calls
    outputs = []
    for tc in tool_calls:
        args = json.loads(tc.function.arguments)
        # Look up and call the right function
        fn_map = {
            "get_customer_account": get_customer_account,
            "create_support_ticket": create_support_ticket,
        }
        result = fn_map[tc.function.name](**args)
        outputs.append({"tool_call_id": tc.id, "output": result})

    run = agents.submit_tool_outputs_and_poll(
        thread_id=thread.id,
        run_id=run.id,
        tool_outputs=outputs,
    )`}
      </CodeBlock>

      <h2>Vector Store Management</h2>

      <ConceptBlock term="Vector Store Lifecycle">
        <p>
          Vector stores in Azure AI Agent Service are persistent, named collections of embedded
          file content. Files are chunked automatically (1024 tokens with 20-token overlap by
          default, configurable). Vector stores support <strong>expiration policies</strong> to
          automatically clean up stores unused for N days. A single file search tool can
          reference up to 5 vector stores, enabling multi-corpus search across different
          document collections (e.g., separate stores for product docs vs. legal policies).
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="vector_store_management.py">
{`# Batch file upload with status polling
from azure.ai.projects.models import VectorStoreDataSource, VectorStoreDataSourceAssetType

# Upload multiple files and poll until all are processed
file_ids = []
for filename in ["manual_v1.pdf", "manual_v2.pdf", "faq.docx"]:
    with open(filename, "rb") as f:
        file_obj = agents.upload_file_and_poll(file=f, purpose=FilePurpose.AGENTS)
        file_ids.append(file_obj.id)

# Create vector store with chunking configuration
vector_store = agents.create_vector_store_and_poll(
    file_ids=file_ids,
    name="product-manuals",
    expires_after={"anchor": "last_active_at", "days": 30},  # auto-cleanup
    chunking_strategy={
        "type": "static",
        "static": {
            "max_chunk_size_tokens": 800,   # smaller chunks = more precise retrieval
            "chunk_overlap_tokens": 100,
        }
    },
)

# Add more files to an existing store
new_file = agents.upload_file_and_poll(file=open("addendum.pdf", "rb"), purpose=FilePurpose.AGENTS)
agents.create_vector_store_file_and_poll(
    vector_store_id=vector_store.id,
    file_id=new_file.id,
)

# List and manage stores
stores = agents.list_vector_stores()
for store in stores.data:
    print(f"{store.name}: {store.file_counts.completed} files, status={store.status}")

# Cleanup
agents.delete_vector_store(vector_store.id)`}
      </CodeBlock>

      <PatternBlock
        name="Multi-Tenant Thread Isolation"
        category="Production Architecture"
        whenToUse="SaaS applications where different customers must have isolated conversation histories with no cross-contamination of data or context."
      >
        <p>
          Create one thread per user session and store the <code>thread_id</code> mapped to
          your user ID in your database. Never reuse threads across users. For multi-session
          users (returning after days), decide whether to create a new thread (clean context)
          or resume the existing one (continuity). Agent definitions are shared across tenants
          — only threads are per-user. Use vector stores scoped to each tenant's documents
          and pass the appropriate <code>vector_store_id</code> at agent creation or thread
          attachment time.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Run Cost and Latency Optimization">
        <p>
          Each run incurs token costs for the full thread history (all messages since thread
          creation). For long-running threads, implement a <strong>context window management
          strategy</strong>: periodically summarize the thread into a single system message and
          create a new thread with that summary as context. Set <code>max_prompt_tokens</code>
          and <code>max_completion_tokens</code> on runs to cap costs. Use
          <code>truncation_strategy</code> with <code>type="last_messages"</code> to
          automatically drop old messages when the thread exceeds the context window.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Bing Grounding Tool">
        <p>
          The Bing Grounding tool gives agents access to real-time web search. Unlike file search
          (which queries your documents), Bing grounding returns live web results. Enable it by
          adding a <code>BingGroundingTool</code> with your Bing Search resource connection name.
          Grounded responses include citations with URLs. This tool is subject to Bing's terms of
          service and requires a separate Bing Search resource in Azure.
        </p>
      </NoteBlock>

      <NoteBlock type="warning" title="Code Interpreter Sandbox Limitations">
        <p>
          The code interpreter runs Python in an isolated sandbox with no internet access and
          a 120-second execution timeout. Available libraries include pandas, numpy, matplotlib,
          scipy, and sklearn — but not arbitrary pip-installable packages. Files written to
          the sandbox are accessible via the run's output file IDs and must be downloaded
          explicitly. The sandbox state resets between runs; do not rely on it for persistent
          computation.
        </p>
      </NoteBlock>
    </article>
  )
}
