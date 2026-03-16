import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const azureNodes = [
  { id: 'app',      label: 'Your Application',      type: 'agent',    x: 60,  y: 150 },
  { id: 'svc',      label: 'Azure AI Agent Service', type: 'llm',      x: 240, y: 150 },
  { id: 'thread',   label: 'Thread (history)',        type: 'store',    x: 420, y: 80  },
  { id: 'tools',    label: 'Built-in Tools',          type: 'tool',     x: 420, y: 150 },
  { id: 'func',     label: 'Azure Functions',         type: 'tool',     x: 420, y: 220 },
  { id: 'storage',  label: 'Azure Blob / AI Search',  type: 'store',    x: 620, y: 80  },
  { id: 'bing',     label: 'Bing Search',             type: 'external', x: 620, y: 150 },
  { id: 'logic',    label: 'Custom Logic',            type: 'external', x: 620, y: 220 },
]

const azureEdges = [
  { from: 'app',   to: 'svc',     label: 'SDK'         },
  { from: 'svc',   to: 'thread',  label: 'persist'     },
  { from: 'svc',   to: 'tools',   label: 'auto-call'   },
  { from: 'svc',   to: 'func',    label: 'function call' },
  { from: 'tools', to: 'storage', label: 'RAG / files' },
  { from: 'tools', to: 'bing',    label: 'search'      },
  { from: 'func',  to: 'logic',   label: 'execute'     },
]

export default function AzureAiAgentService() {
  return (
    <article className="prose-content">
      <h2>Azure AI Agent Service</h2>
      <p>
        <strong>Azure AI Agent Service</strong> (generally available since early 2025)
        is Microsoft's fully managed platform for building and running production AI agents.
        It is compatible with the OpenAI Assistants API v2, so code written against
        OpenAI's SDK works with minimal changes. Agents run on Azure models (GPT-4o,
        Phi-4) or bring-your-own models from the Azure AI model catalogue, including
        Claude via Azure AI Foundry.
      </p>

      <ConceptBlock term="Azure AI Agent Service">
        <p>
          The service manages the agent lifecycle — thread storage, tool execution, and
          the run loop — as a fully managed cloud service. You define an agent's
          instructions and tools once; the service handles retry logic, auto-scaling,
          and Azure Monitor integration. Supported built-in tools include{' '}
          <strong>file search</strong> (RAG over uploaded documents),{' '}
          <strong>code interpreter</strong> (sandboxed Python), and{' '}
          <strong>Bing grounding</strong> (live web search).
        </p>
      </ConceptBlock>

      <ArchitectureDiagram nodes={azureNodes} edges={azureEdges} title="Azure AI Agent Service Architecture" />

      <h2>Installation & Auth</h2>

      <SDKExample
        title="Setup"
        tabs={{
          bash: `pip install azure-ai-projects azure-identity

# Set environment variables
export AZURE_AI_PROJECT_ENDPOINT="https://<your-hub>.services.ai.azure.com/api/projects/<project-id>"
export AZURE_CLIENT_ID="..."
export AZURE_CLIENT_SECRET="..."
export AZURE_TENANT_ID="..."`,
        }}
      />

      <h2>Creating Your First Agent</h2>

      <SDKExample
        title="Create and run an agent"
        tabs={{
          python: `import os, time
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import MessageRole, RunStatus
from azure.identity import DefaultAzureCredential

client = AIProjectClient(
    endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    credential=DefaultAzureCredential(),
)

# ── Create an agent ──────────────────────────────────────────────────────
agent = client.agents.create_agent(
    model="gpt-4o",          # or "claude-3-7-sonnet" via AI Foundry
    name="support-agent",
    instructions="You are a helpful customer support agent for Acme Corp.",
)
print(f"Agent: {agent.id}")

# ── Create a conversation thread ──────────────────────────────────────────
thread = client.agents.create_thread()

# ── Add a user message ────────────────────────────────────────────────────
client.agents.create_message(
    thread_id=thread.id,
    role=MessageRole.USER,
    content="My order #12345 hasn't arrived yet. Can you help?",
)

# ── Run the agent ─────────────────────────────────────────────────────────
run = client.agents.create_and_process_run(
    thread_id=thread.id, agent_id=agent.id
)

# ── Read the response ─────────────────────────────────────────────────────
if run.status == RunStatus.COMPLETED:
    messages = client.agents.list_messages(thread_id=thread.id)
    for msg in messages:
        if msg.role == MessageRole.ASSISTANT:
            for part in msg.content:
                if hasattr(part, "text"):
                    print(part.text.value)
            break

# Clean up
client.agents.delete_agent(agent.id)`,
          typescript: `import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const client = new AIProjectClient(
  process.env.AZURE_AI_PROJECT_ENDPOINT!,
  new DefaultAzureCredential()
);

// Create agent
const agent = await client.agents.createAgent("gpt-4o", {
  name: "support-agent",
  instructions: "You are a helpful customer support agent for Acme Corp.",
});

// Create thread + message
const thread = await client.agents.createThread();
await client.agents.createMessage(thread.id, {
  role: "user",
  content: "My order #12345 hasn't arrived yet. Can you help?",
});

// Run and wait for completion
const run = await client.agents.createAndProcessRun(thread.id, agent.id);

// Read response
if (run.status === "completed") {
  const messages = await client.agents.listMessages(thread.id);
  for (const msg of messages.data) {
    if (msg.role === "assistant") {
      for (const part of msg.content) {
        if (part.type === "text") console.log(part.text.value);
      }
      break;
    }
  }
}

await client.agents.deleteAgent(agent.id);`,
        }}
      />

      <h2>File Search (RAG)</h2>

      <SDKExample
        title="Agent with document search over uploaded files"
        tabs={{
          python: `from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import FileSearchTool, MessageRole
from azure.identity import DefaultAzureCredential
import os

client = AIProjectClient(
    endpoint=os.environ["AZURE_AI_PROJECT_ENDPOINT"],
    credential=DefaultAzureCredential(),
)

# Upload a document
with open("product_manual.pdf", "rb") as f:
    uploaded = client.agents.upload_file_and_poll(f, purpose="assistants")

# Create a vector store from the file
vector_store = client.agents.create_vector_store_and_poll(
    file_ids=[uploaded.id],
    name="product-docs",
)

# Create an agent with file search
agent = client.agents.create_agent(
    model="gpt-4o",
    name="docs-agent",
    instructions="Answer questions using the product documentation.",
    tools=[FileSearchTool()],
    tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
)

thread = client.agents.create_thread()
client.agents.create_message(
    thread_id=thread.id,
    role=MessageRole.USER,
    content="How do I reset the device to factory settings?",
)
run = client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)

messages = client.agents.list_messages(thread_id=thread.id)
for m in messages:
    if m.role == MessageRole.ASSISTANT:
        for part in m.content:
            if hasattr(part, "text"):
                print(part.text.value)
                # Annotations contain citation references
                for ann in part.text.annotations:
                    print(f"  Source: {ann.text}")
        break`,
        }}
      />

      <h2>Code Interpreter</h2>

      <SDKExample
        title="Agent with sandboxed Python execution"
        tabs={{
          python: `from azure.ai.projects.models import CodeInterpreterTool

agent = client.agents.create_agent(
    model="gpt-4o",
    name="data-analyst",
    instructions="Analyse data and produce charts when asked.",
    tools=[CodeInterpreterTool()],
)

# Upload a CSV
with open("sales_2024.csv", "rb") as f:
    csv_file = client.agents.upload_file_and_poll(f, purpose="assistants")

thread = client.agents.create_thread(
    tool_resources={"code_interpreter": {"file_ids": [csv_file.id]}}
)
client.agents.create_message(
    thread_id=thread.id,
    role=MessageRole.USER,
    content="Plot monthly revenue as a bar chart and return the image.",
)
run = client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)

# Retrieve generated image
messages = client.agents.list_messages(thread_id=thread.id)
for m in messages:
    if m.role == MessageRole.ASSISTANT:
        for part in m.content:
            if hasattr(part, "image_file"):
                file_id = part.image_file.file_id
                image = client.agents.get_file_content(file_id)
                with open("chart.png", "wb") as f:
                    f.write(image)
                print("Chart saved to chart.png")`,
        }}
      />

      <h2>Function Calling (Custom Tools)</h2>

      <SDKExample
        title="Custom function tools with Azure agents"
        tabs={{
          python: `from azure.ai.projects.models import FunctionTool, ToolSet
import json

def get_order_status(order_id: str) -> str:
    """Look up order status from the order management system."""
    # In production: query your OMS database/API
    orders = {
        "12345": {"status": "shipped", "eta": "2025-03-18"},
        "99999": {"status": "processing"},
    }
    return json.dumps(orders.get(order_id, {"error": "order not found"}))

# Define tool schema
order_fn = FunctionTool(functions={get_order_status})
toolset = ToolSet()
toolset.add(order_fn)

agent = client.agents.create_agent(
    model="gpt-4o",
    name="order-agent",
    instructions="Help customers track their orders.",
    toolset=toolset,
)

thread = client.agents.create_thread()
client.agents.create_message(
    thread_id=thread.id, role=MessageRole.USER,
    content="What is the status of order 12345?"
)

# create_and_process_run handles the tool-call loop automatically
run = client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)

messages = client.agents.list_messages(thread_id=thread.id)
for m in messages:
    if m.role == MessageRole.ASSISTANT:
        for p in m.content:
            if hasattr(p, "text"):
                print(p.text.value)
        break`,
        }}
      />

      <h2>Semantic Kernel Integration</h2>
      <p>
        <strong>Semantic Kernel</strong> is Microsoft's open-source orchestration SDK
        that provides agent abstractions, memory, plugins, and process (workflow) support.
        It integrates natively with Azure AI Agent Service for enterprise deployments.
      </p>

      <SDKExample
        title="Semantic Kernel agent with Azure AI"
        tabs={{
          python: `from semantic_kernel import Kernel
from semantic_kernel.agents.azure_ai import AzureAIAgent, AzureAIAgentSettings
from semantic_kernel.functions import kernel_function

# Define a plugin (SK's equivalent of tools)
class OrderPlugin:
    @kernel_function(description="Get the status of an order by ID.")
    def get_status(self, order_id: str) -> str:
        return f"Order {order_id}: shipped, ETA 2025-03-18"

kernel = Kernel()
kernel.add_plugin(OrderPlugin(), plugin_name="orders")

agent_def = AzureAIAgentSettings(
    ai_model_id="gpt-4o",
    name="sk-order-agent",
    instructions="Help customers with order enquiries.",
)

async with AzureAIAgent.create(kernel=kernel, arguments=agent_def) as agent:
    thread = None
    async for response in agent.invoke(
        messages="Where is my order 12345?",
        thread=thread,
    ):
        if response.content:
            print(response.content)
        thread = response.thread`,
          bash: `pip install semantic-kernel[azure]`,
        }}
      />

      <BestPracticeBlock title="Azure AI Agent Service Best Practices">
        <ul>
          <li>Use <code>create_and_process_run</code> for simple flows; use <code>create_run</code> + polling for fine-grained control and streaming.</li>
          <li>Delete threads when done to avoid storage cost accumulation — they persist indefinitely by default.</li>
          <li>Set <code>truncation_strategy</code> on runs to control context-window usage in long conversations.</li>
          <li>Use <strong>Managed Identity</strong> (<code>DefaultAzureCredential</code>) instead of API keys in production.</li>
          <li>Enable <strong>Azure Monitor</strong> diagnostics on your AI Foundry hub for run-level tracing.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock>
        Azure AI Agent Service is part of <strong>Azure AI Foundry</strong>. The Python SDK
        is <code>azure-ai-projects</code>; the TypeScript SDK is <code>@azure/ai-projects</code>.
        Semantic Kernel (<code>semantic-kernel</code>) adds higher-level orchestration,
        process (workflow), and memory abstractions on top.
      </NoteBlock>
    </article>
  )
}
