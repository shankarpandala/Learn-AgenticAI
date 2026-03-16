import{j as e}from"./vendor-1_4fyI-O.js";import{C as n,S as t,B as o,N as s,a as r}from"./subject-01-rag-fundamentals-DGDd0J9G.js";import{S as p,A as i}from"./subject-06-coding-agents-CiiSsf01.js";import{P as l}from"./subject-03-agent-foundations-BlYtBlBv.js";function u(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Anthropic SDK Basics"}),e.jsx("p",{children:"The Anthropic SDK is your primary interface for building applications with Claude. Available in Python and TypeScript/JavaScript, it provides a clean abstraction over the Messages API, handles authentication, retry logic, and response parsing."}),e.jsx(n,{term:"Anthropic SDK",children:e.jsx("p",{children:"The official Anthropic client library that provides typed interfaces for all Claude API features including message creation, streaming, tool use, vision, and token counting. It handles authentication, rate limit retries with exponential backoff, and connection management automatically."})}),e.jsx("h2",{children:"Installation"}),e.jsx(t,{title:"Installing the Anthropic SDK",tabs:{bash:`# Python
pip install anthropic

# TypeScript / JavaScript
npm install @anthropic-ai/sdk`}}),e.jsx(p,{title:"API Key Security",severity:"high",children:e.jsxs("p",{children:["Never hardcode your API key in source code or commit it to version control. Use environment variables (",e.jsx("code",{children:"ANTHROPIC_API_KEY"}),") or a secrets manager. The SDK automatically reads ",e.jsx("code",{children:"ANTHROPIC_API_KEY"})," from the environment if you don't pass it explicitly."]})}),e.jsx("h2",{children:"Basic Client Setup"}),e.jsx(t,{title:"Creating an Anthropic Client",tabs:{python:`import anthropic
import os

# Option 1: Auto-reads ANTHROPIC_API_KEY from environment (recommended)
client = anthropic.Anthropic()

# Option 2: Explicit API key (e.g., from a secrets manager)
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# Option 3: With custom HTTP settings
client = anthropic.Anthropic(
    api_key=os.environ["ANTHROPIC_API_KEY"],
    max_retries=3,           # Default: 2
    timeout=60.0,            # Default: 10 minutes
    default_headers={        # Optional: custom headers
        "X-Custom-Header": "my-app/1.0"
    }
)`,typescript:`import Anthropic from '@anthropic-ai/sdk';

// Auto-reads ANTHROPIC_API_KEY from environment
const client = new Anthropic();

// With explicit settings
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
  timeout: 60 * 1000,  // milliseconds
});`}}),e.jsx("h2",{children:"Your First Message"}),e.jsx(t,{title:"Simple Message Creation",tabs:{python:`import anthropic

client = anthropic.Anthropic()

# Send a message to Claude
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Explain the difference between RAG and fine-tuning in 3 sentences."
        }
    ]
)

# Access the response text
print(message.content[0].text)

# Response metadata
print(f"Model: {message.model}")
print(f"Input tokens: {message.usage.input_tokens}")
print(f"Output tokens: {message.usage.output_tokens}")
print(f"Stop reason: {message.stop_reason}")`,typescript:`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const message = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: 'Explain the difference between RAG and fine-tuning in 3 sentences.',
    },
  ],
});

// Access response
const text = message.content[0];
if (text.type === 'text') {
  console.log(text.text);
}

console.log(\`Tokens used: \${message.usage.input_tokens} in, \${message.usage.output_tokens} out\`);`}}),e.jsx("h2",{children:"System Prompts"}),e.jsx("p",{children:"System prompts set the context, persona, and constraints for Claude before any user interaction. They're crucial for building reliable agents."}),e.jsx(t,{title:"Using System Prompts",tabs:{python:`import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=2048,
    system="""You are an expert Python code reviewer specializing in security.

When reviewing code:
1. Identify security vulnerabilities (OWASP Top 10)
2. Check for input validation issues
3. Look for SQL injection, XSS, and authentication flaws
4. Suggest specific fixes with code examples

Format your response as:
- CRITICAL: [issues that need immediate attention]
- WARNING: [potential issues to address]
- SUGGESTION: [improvements for code quality]
""",
    messages=[
        {
            "role": "user",
            "content": f"Review this code:

{code_to_review}"
        }
    ]
)

print(message.content[0].text)`,typescript:`const message = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 2048,
  system: \`You are an expert Python code reviewer specializing in security.

When reviewing code:
1. Identify security vulnerabilities (OWASP Top 10)
2. Check for input validation issues
3. Look for SQL injection, XSS, and authentication flaws
4. Suggest specific fixes with code examples\`,
  messages: [
    {
      role: 'user',
      content: \`Review this code:\\n\\n\${codeToReview}\`,
    },
  ],
});`}}),e.jsx("h2",{children:"Multi-Turn Conversations"}),e.jsx("p",{children:"Claude is stateless — it doesn't remember previous conversations. You must send the full conversation history with each request. The SDK makes this straightforward."}),e.jsx(t,{title:"Multi-Turn Conversation",tabs:{python:`import anthropic
from typing import TypedDict

client = anthropic.Anthropic()

class Message(TypedDict):
    role: str
    content: str

def chat(messages: list[Message], system: str = "") -> str:
    """Send a conversation and get the next response."""
    kwargs = {
        "model": "claude-opus-4-6",
        "max_tokens": 1024,
        "messages": messages,
    }
    if system:
        kwargs["system"] = system

    response = client.messages.create(**kwargs)
    return response.content[0].text

# Build a conversation
conversation: list[Message] = []

# Turn 1
user_msg = "What are the main components of a RAG system?"
conversation.append({"role": "user", "content": user_msg})
assistant_reply = chat(conversation, system="You are a RAG expert.")
conversation.append({"role": "assistant", "content": assistant_reply})
print(f"Claude: {assistant_reply}\\n")

# Turn 2 - Claude remembers previous context
conversation.append({
    "role": "user",
    "content": "Which of those components is most critical for performance?"
})
assistant_reply = chat(conversation, system="You are a RAG expert.")
conversation.append({"role": "assistant", "content": assistant_reply})
print(f"Claude: {assistant_reply}")`}}),e.jsx("h2",{children:"Streaming Responses"}),e.jsx("p",{children:"For long responses, streaming significantly improves perceived latency. The SDK supports streaming with both raw events and a higher-level stream helper."}),e.jsx(t,{title:"Streaming Responses",tabs:{python:`import anthropic

client = anthropic.Anthropic()

# Streaming with context manager (recommended)
with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=2048,
    messages=[{"role": "user", "content": "Write a detailed explanation of HNSW indexing."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

    # Get final message with usage stats after streaming
    final_message = stream.get_final_message()
    print(f"\\n\\nTotal tokens: {final_message.usage.input_tokens + final_message.usage.output_tokens}")`,typescript:`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const stream = await client.messages.stream({
  model: 'claude-opus-4-6',
  max_tokens: 2048,
  messages: [{ role: 'user', content: 'Write a detailed explanation of HNSW indexing.' }],
});

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
    process.stdout.write(chunk.delta.text);
  }
}

const finalMessage = await stream.getFinalMessage();
console.log(\`\\nTotal tokens: \${finalMessage.usage.input_tokens + finalMessage.usage.output_tokens}\`);`}}),e.jsx("h2",{children:"Available Claude Models"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Model ID"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Best For"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Context"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["claude-opus-4-6","Most capable: complex reasoning, coding, analysis","200K"],["claude-sonnet-4-6","Balanced: speed + intelligence for most tasks","200K"],["claude-haiku-4-5-20251001","Fastest, most cost-effective: simple tasks","200K"]].map(([a,c,d])=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300",children:a}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:c}),e.jsxs("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:[d," tokens"]})]},a))})]})}),e.jsx(o,{title:"Use claude-opus-4-6 for Development, Route in Production",children:e.jsx("p",{children:"During development and evaluation, use claude-opus-4-6 to establish baseline quality. Once you understand the task complexity distribution, route simpler tasks to claude-haiku-4-5-20251001 or claude-sonnet-4-6 in production to reduce costs by 80-95% without sacrificing quality where it matters."})}),e.jsx(s,{type:"tip",title:"Rate Limits and Retries",children:e.jsxs("p",{children:["The SDK automatically retries rate limit errors (429) and server errors (5xx) with exponential backoff. Set ",e.jsx("code",{children:"max_retries=5"})," for production workloads. Monitor ",e.jsx("code",{children:"X-RateLimit-*"})," headers (accessible via raw HTTP) to understand your usage patterns and avoid hitting limits."]})})]})}const k=Object.freeze(Object.defineProperty({__proto__:null,default:u},Symbol.toStringTag,{value:"Module"}));function m(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LangGraph: State Machines for Agents"}),e.jsx("p",{children:"LangGraph is LangChain's framework for building stateful, multi-step agent workflows as directed graphs. Unlike simple chain-of-thought loops, LangGraph lets you define complex conditional flows, cycles, human-in-the-loop interrupts, and persistent state — all the primitives needed for production agents."}),e.jsx(n,{term:"LangGraph StateGraph",children:e.jsxs("p",{children:["A LangGraph ",e.jsx("strong",{children:"StateGraph"})," is a directed graph where nodes are Python functions (agent steps) and edges define the flow between steps. The graph maintains a typed ",e.jsx("strong",{children:"State"})," object that flows between nodes, accumulating results. Conditional edges allow dynamic routing based on the current state."]})}),e.jsx(i,{title:"LangGraph RAG Agent Architecture",width:640,height:300,nodes:[{id:"start",label:"User Query",type:"external",x:80,y:150},{id:"retrieve",label:"Retrieve",type:"tool",x:220,y:150},{id:"grade",label:"Grade Docs",type:"agent",x:360,y:150},{id:"generate",label:"Generate",type:"llm",x:500,y:100},{id:"rewrite",label:"Rewrite Query",type:"agent",x:500,y:200},{id:"answer",label:"Final Answer",type:"external",x:600,y:150}],edges:[{from:"start",to:"retrieve"},{from:"retrieve",to:"grade"},{from:"grade",to:"generate",label:"relevant"},{from:"grade",to:"rewrite",label:"not relevant"},{from:"rewrite",to:"retrieve",label:"retry"},{from:"generate",to:"answer"}]}),e.jsx("h2",{children:"Core Concepts"}),e.jsx("h3",{children:"State"}),e.jsxs("p",{children:["State is a TypedDict (Python) that flows through the graph. All nodes read from and write to this shared state. LangGraph supports both ",e.jsx("strong",{children:"total state replacement"})," and",e.jsx("strong",{children:"reducer functions"})," (e.g., append to a list)."]}),e.jsx("h3",{children:"Nodes"}),e.jsx("p",{children:"Nodes are Python functions that take the current state and return an update dict. They can call LLMs, run tools, query databases, or execute any Python code."}),e.jsx("h3",{children:"Edges"}),e.jsxs("p",{children:["Edges connect nodes. ",e.jsx("strong",{children:"Normal edges"})," always go from A to B.",e.jsx("strong",{children:"Conditional edges"})," use a function to decide the next node based on state.",e.jsx("code",{children:"START"})," and ",e.jsx("code",{children:"END"})," are special entry/exit nodes."]}),e.jsx("h2",{children:"Building a CRAG Agent with LangGraph"}),e.jsx("p",{children:"The following example implements Corrective RAG (CRAG) — an agent that retrieves documents, grades their relevance, and either generates an answer or rewrites the query and retries."}),e.jsx(t,{title:"CRAG Agent with LangGraph",tabs:{python:`from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain.schema import Document
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
import operator

# 1. Define State
class GraphState(TypedDict):
    question: str
    generation: str
    documents: List[Document]
    retries: int

# 2. Initialize LLM and retriever
llm = ChatAnthropic(model="claude-opus-4-6", temperature=0)
retriever = Chroma(...).as_retriever(search_kwargs={"k": 4})

# 3. Define nodes

def retrieve(state: GraphState) -> dict:
    """Retrieve documents from vector store."""
    docs = retriever.invoke(state["question"])
    return {"documents": docs, "question": state["question"]}

def grade_documents(state: GraphState) -> dict:
    """Grade retrieved documents for relevance."""
    grader_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a relevance grader. Given a question and document, "
                   "answer 'yes' if the document is relevant, 'no' otherwise."),
        ("human", "Question: {question}\\n\\nDocument: {document}")
    ])
    grader = grader_prompt | llm

    filtered_docs = []
    for doc in state["documents"]:
        result = grader.invoke({
            "question": state["question"],
            "document": doc.page_content
        })
        if "yes" in result.content.lower():
            filtered_docs.append(doc)

    return {"documents": filtered_docs}

def generate(state: GraphState) -> dict:
    """Generate answer from relevant documents."""
    gen_prompt = ChatPromptTemplate.from_messages([
        ("system", "Answer the question based on the context. Be concise and accurate."),
        ("human", "Context:\\n{context}\\n\\nQuestion: {question}")
    ])
    chain = gen_prompt | llm

    context = "\\n\\n".join(d.page_content for d in state["documents"])
    result = chain.invoke({"context": context, "question": state["question"]})

    return {"generation": result.content}

def rewrite_query(state: GraphState) -> dict:
    """Rewrite the query for better retrieval."""
    rewrite_prompt = ChatPromptTemplate.from_messages([
        ("system", "Rewrite this question to be clearer and more specific for retrieval."),
        ("human", "{question}")
    ])
    chain = rewrite_prompt | llm
    result = chain.invoke({"question": state["question"]})

    return {
        "question": result.content,
        "retries": state.get("retries", 0) + 1
    }

# 4. Define conditional routing
def decide_to_generate(state: GraphState) -> str:
    """Route: generate if docs are relevant, else rewrite."""
    if state.get("retries", 0) >= 2:
        return "generate"  # Force generation after 2 retries
    if len(state["documents"]) > 0:
        return "generate"
    return "rewrite_query"

# 5. Build the graph
workflow = StateGraph(GraphState)

workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("generate", generate)
workflow.add_node("rewrite_query", rewrite_query)

workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges(
    "grade_documents",
    decide_to_generate,
    {
        "generate": "generate",
        "rewrite_query": "rewrite_query"
    }
)
workflow.add_edge("rewrite_query", "retrieve")  # Loop back
workflow.add_edge("generate", END)

app = workflow.compile()

# 6. Run the agent
result = app.invoke({"question": "What is the best chunking strategy for RAG?", "retries": 0})
print(result["generation"])`}}),e.jsx("h2",{children:"Checkpointing & Persistence"}),e.jsx("p",{children:"LangGraph's checkpointing system saves graph state after each node, enabling: pause/resume, human-in-the-loop approval gates, and fault tolerance."}),e.jsx(r,{language:"python",filename:"langgraph_checkpointing.py",children:`from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph

# SQLite checkpointer (use PostgreSQL in production)
memory = SqliteSaver.from_conn_string(":memory:")
# Production: memory = PostgresSaver.from_conn_string(DATABASE_URL)

app = workflow.compile(checkpointer=memory)

# Run with a thread_id for resumption
config = {"configurable": {"thread_id": "session-abc-123"}}
result = app.invoke({"question": "..."}, config=config)

# Later, resume the same thread (state is preserved)
result = app.invoke({"question": "Follow-up question"}, config=config)

# Human-in-the-loop: interrupt before a node
from langgraph.graph import interrupt_before

app = workflow.compile(
    checkpointer=memory,
    interrupt_before=["generate"]  # Pause before generating
)

# The graph pauses here — you can inspect state
state = app.get_state(config)
print("About to generate with:", state.values["documents"])

# Approve and continue
app.invoke(None, config=config)  # Resume from checkpoint`}),e.jsx(l,{name:"Supervisor Pattern with LangGraph",category:"Multi-Agent",whenToUse:"When you have multiple specialized worker agents that need to be coordinated by a central router that decides which agent handles each subtask.",children:e.jsx("p",{children:"The supervisor pattern uses a LLM router as a special node that decides which worker agent to call next. Workers report back to the supervisor after each step. The supervisor sees all worker outputs and decides when the task is complete."})}),e.jsx(o,{title:"State Schema Design",children:e.jsxs("p",{children:["Design your state schema before writing any nodes. Use Annotated types with reducer functions for lists (e.g., ",e.jsx("code",{children:"Annotated[list, operator.add]"})," to append rather than replace). Keep state flat and serializable — LangGraph needs to checkpoint it. Avoid storing large objects like embeddings directly in state; use IDs and look them up."]})}),e.jsx(s,{type:"tip",title:"LangGraph vs. LangChain Agents",children:e.jsx("p",{children:"Use LangGraph when you need: cycles/loops, multiple conditional paths, persistent state across sessions, or human-in-the-loop interrupts. Use simple LangChain AgentExecutor for straightforward ReAct loops without complex branching. LangGraph has more boilerplate but gives you full control over agent flow."})})]})}const b=Object.freeze(Object.defineProperty({__proto__:null,default:m},Symbol.toStringTag,{value:"Module"}));function h(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Azure AI SDK for Python"}),e.jsxs("p",{children:["Microsoft provides two primary Python SDKs for AI on Azure: the ",e.jsx("strong",{children:"openai"})," package with Azure configuration (for Azure OpenAI Service), and the ",e.jsx("strong",{children:"azure-ai-inference"}),"package (for Azure AI Foundry model catalog — Phi, Llama, Mistral, etc. with a unified API). Both use Azure Identity for keyless authentication via managed identity."]}),e.jsx(n,{term:"Azure AI Inference SDK",children:e.jsxs("p",{children:["The ",e.jsx("code",{children:"azure-ai-inference"})," SDK provides a unified client for all models deployed to Azure AI Foundry endpoints — regardless of whether they're OpenAI models, Phi-3, Llama 3, Mistral, or Command R+. It uses the same request/response schema as OpenAI's chat completions API but works with any provider-agnostic endpoint. This makes it easy to switch models without changing application code."]})}),e.jsx("h2",{children:"Installation"}),e.jsx(r,{language:"bash",filename:"install.sh",children:`# Azure OpenAI (uses the openai package with Azure config)
pip install openai azure-identity

# Azure AI Inference SDK (model catalog / Foundry endpoints)
pip install azure-ai-inference azure-identity

# Azure AI Search (for RAG retrieval)
pip install azure-search-documents azure-identity

# Azure AI Agent Service
pip install azure-ai-projects azure-identity`}),e.jsx("h2",{children:"Authentication: DefaultAzureCredential"}),e.jsxs("p",{children:[e.jsx("code",{children:"DefaultAzureCredential"})," automatically picks the right authentication method based on the environment: Managed Identity in production (Azure VMs, App Service, AKS), Azure CLI locally during development, environment variables in CI/CD. This eliminates the need to manage API keys."]}),e.jsx(r,{language:"python",filename:"auth_setup.py",children:`from azure.identity import DefaultAzureCredential, get_bearer_token_provider
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
)`}),e.jsx("h2",{children:"Azure AI Inference SDK: Chat Completions"}),e.jsx(t,{title:"Azure AI Inference — Chat, Streaming, and Tool Use",tabs:{python:`from azure.ai.inference import ChatCompletionsClient
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

    return msg.content`}}),e.jsx("h2",{children:"Azure AI Projects SDK: Agent Service"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"azure-ai-projects"})," SDK provides access to Azure AI Agent Service — Microsoft's managed agent hosting platform. It handles thread management, tool execution, and file search without writing an agent loop."]}),e.jsx(t,{title:"Azure AI Agent Service — Creating and Running an Agent",tabs:{python:`from azure.ai.projects import AIProjectClient
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
    project_client.agents.delete_agent(agent.id)`}}),e.jsx("h2",{children:"Azure AI Search Integration"}),e.jsx(r,{language:"python",filename:"azure_search_rag.py",children:`from azure.search.documents import SearchClient
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
index_client.create_or_update_index(index)`}),e.jsx(o,{title:"Use azure-ai-inference for Model Portability",children:e.jsxs("p",{children:["Prefer the ",e.jsx("code",{children:"azure-ai-inference"})," SDK over hardcoding OpenAI-specific API calls when targeting Azure AI Foundry. It works identically across GPT-4o, Phi-4, Llama 3.1, and Mistral Large — letting you A/B test models by changing a single ",e.jsx("code",{children:"model="}),"parameter. For OpenAI-specific features (DALL-E, Whisper, Assistants), use the",e.jsx("code",{children:"openai"})," package with Azure configuration."]})}),e.jsx(s,{type:"warning",title:"API Version Pinning",children:e.jsxs("p",{children:["Azure OpenAI's ",e.jsx("code",{children:"api_version"})," parameter is mandatory and new features (like structured outputs, o1 reasoning effort, etc.) are only available in specific versions. Always pin to a specific API version (e.g., ",e.jsx("code",{children:"2024-10-21"}),") and test upgrades explicitly. Breaking changes can occur between versions."]})})]})}const S=Object.freeze(Object.defineProperty({__proto__:null,default:h},Symbol.toStringTag,{value:"Module"}));function g(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"AWS SDK for Amazon Bedrock"}),e.jsxs("p",{children:["Amazon Bedrock is accessed through ",e.jsx("strong",{children:"boto3"})," — AWS's Python SDK. Bedrock exposes three main service clients: ",e.jsx("code",{children:"bedrock"})," (management),",e.jsx("code",{children:"bedrock-runtime"})," (model invocation), and ",e.jsx("code",{children:"bedrock-agent-runtime"}),"(agent invocation and knowledge base retrieval). The Converse API in bedrock-runtime is the recommended interface for all chat-style interactions."]}),e.jsx(n,{term:"Converse API",children:e.jsxs("p",{children:["The Converse API is Bedrock's unified, model-agnostic chat interface. Unlike the older",e.jsx("code",{children:"invoke_model"})," API (which requires model-specific JSON payloads), Converse uses a consistent request schema across all supported models — Claude, Llama, Mistral, Nova, and others. It natively supports tool use, conversation history, streaming, and system prompts without per-model format juggling."]})}),e.jsx("h2",{children:"Installation and Configuration"}),e.jsx(r,{language:"bash",filename:"install.sh",children:`# boto3 is the AWS SDK for Python
pip install boto3

# For async/streaming in async frameworks
pip install aioboto3  # Async boto3

# AWS CLI for credential configuration
pip install awscli
aws configure  # Sets up ~/.aws/credentials and ~/.aws/config`}),e.jsx(r,{language:"python",filename:"bedrock_client_setup.py",children:`import boto3

# Option 1: Default credentials (uses ~/.aws/credentials, env vars, or EC2 instance role)
bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")

# Option 2: Explicit profile
session = boto3.Session(profile_name="prod-account")
bedrock_runtime = session.client("bedrock-runtime", region_name="us-west-2")

# Option 3: Assume a role (cross-account access)
sts = boto3.client("sts")
assumed = sts.assume_role(
    RoleArn="arn:aws:iam::123456789:role/BedrockInvokeRole",
    RoleSessionName="my-agent-session"
)
credentials = assumed["Credentials"]
bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1",
    aws_access_key_id=credentials["AccessKeyId"],
    aws_secret_access_key=credentials["SecretAccessKey"],
    aws_session_token=credentials["SessionToken"]
)`}),e.jsx("h2",{children:"Converse API: Core Usage"}),e.jsx(t,{title:"Bedrock Converse API — Chat, Streaming, and Tool Use",tabs:{python:`import boto3
import json

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

# Basic chat with Converse API
def chat(message: str, model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0") -> str:
    response = bedrock.converse(
        modelId=model_id,
        system=[{"text": "You are a helpful AI assistant."}],
        messages=[
            {"role": "user", "content": [{"text": message}]}
        ],
        inferenceConfig={
            "maxTokens": 1024,
            "temperature": 0.7,
            "topP": 0.9,
        }
    )
    return response["output"]["message"]["content"][0]["text"]

# Multi-turn conversation
def multi_turn_chat(messages: list[dict], model_id: str) -> str:
    """messages format: [{"role": "user"|"assistant", "content": "text"}]"""
    formatted = [
        {"role": m["role"], "content": [{"text": m["content"]}]}
        for m in messages
    ]
    response = bedrock.converse(
        modelId=model_id,
        messages=formatted,
        inferenceConfig={"maxTokens": 2048, "temperature": 0}
    )
    return response["output"]["message"]["content"][0]["text"]

# Streaming
def stream_chat(message: str, model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0") -> None:
    response = bedrock.converse_stream(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": message}]}],
        inferenceConfig={"maxTokens": 1024}
    )
    for event in response["stream"]:
        if "contentBlockDelta" in event:
            delta = event["contentBlockDelta"]["delta"]
            if "text" in delta:
                print(delta["text"], end="", flush=True)
        elif "messageStop" in event:
            print()  # Final newline
            print(f"Stop reason: {event['messageStop']['stopReason']}")

# Tool use with Converse API
tools = [
    {
        "toolSpec": {
            "name": "query_database",
            "description": "Execute a SQL query against the analytics database",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "SQL SELECT query"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Max rows to return",
                            "default": 100
                        }
                    },
                    "required": ["query"]
                }
            }
        }
    }
]

def agent_loop(user_message: str, model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0") -> str:
    """Simple agentic loop with tool use."""
    messages = [{"role": "user", "content": [{"text": user_message}]}]

    while True:
        response = bedrock.converse(
            modelId=model_id,
            system=[{"text": "You are a data analyst. Use the query_database tool to answer questions."}],
            messages=messages,
            toolConfig={"tools": tools, "toolChoice": {"auto": {}}},
            inferenceConfig={"maxTokens": 2048, "temperature": 0}
        )

        output_msg = response["output"]["message"]
        messages.append(output_msg)
        stop_reason = response["stopReason"]

        if stop_reason == "end_turn":
            # Extract text response
            for block in output_msg["content"]:
                if "text" in block:
                    return block["text"]
            return "Done"

        elif stop_reason == "tool_use":
            tool_results = []
            for block in output_msg["content"]:
                if "toolUse" in block:
                    tool = block["toolUse"]
                    # Execute the tool
                    result = execute_tool(tool["name"], tool["input"])
                    tool_results.append({
                        "toolResult": {
                            "toolUseId": tool["toolUseId"],
                            "content": [{"json": result}],
                            "status": "success"
                        }
                    })

            messages.append({"role": "user", "content": tool_results})
        else:
            break

    return "Unexpected stop reason"

def execute_tool(name: str, inputs: dict) -> dict:
    """Mock tool execution."""
    if name == "query_database":
        return {"rows": [{"date": "2025-01", "revenue": 1234567}], "count": 1}
    return {"error": "Unknown tool"}`}}),e.jsx("h2",{children:"Bedrock Agent Runtime: Invoking Agents"}),e.jsx(t,{title:"Invoking Bedrock Agents and Knowledge Bases",tabs:{python:`import boto3

bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

AGENT_ID = "ABCDEF1234"
AGENT_ALIAS_ID = "TSTALIASID"  # Use versioned alias in production
KNOWLEDGE_BASE_ID = "KBXYZ5678"

# Invoke a Bedrock Agent (synchronous)
def invoke_agent(user_message: str, session_id: str) -> str:
    """Invoke a Bedrock Agent and collect the full response."""
    response = bedrock_agent.invoke_agent(
        agentId=AGENT_ID,
        agentAliasId=AGENT_ALIAS_ID,
        sessionId=session_id,  # Same session_id continues a conversation
        inputText=user_message,
        enableTrace=True  # Get reasoning traces
    )

    completion = ""
    traces = []

    for event in response["completion"]:
        if "chunk" in event:
            completion += event["chunk"]["bytes"].decode("utf-8")
        elif "trace" in event:
            trace = event["trace"]["trace"]
            if "orchestrationTrace" in trace:
                traces.append(trace["orchestrationTrace"])

    return completion, traces

# Retrieve from Knowledge Base
def retrieve(query: str) -> list[dict]:
    response = bedrock_agent.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "vectorSearchConfiguration": {
                "numberOfResults": 5,
                "overrideSearchType": "HYBRID",
                "filter": {
                    "andAll": [
                        {"equals": {"key": "doc_type", "value": "policy"}},
                        {"greaterThan": {"key": "last_updated", "value": "2024-01-01"}}
                    ]
                }
            }
        }
    )
    return [
        {
            "content": r["content"]["text"],
            "score": r["score"],
            "uri": r["location"].get("s3Location", {}).get("uri", ""),
            "metadata": r.get("metadata", {})
        }
        for r in response["retrievalResults"]
    ]

# RetrieveAndGenerate — full managed RAG
def rag_generate(query: str, session_id: str = None) -> dict:
    request = {
        "input": {"text": query},
        "retrieveAndGenerateConfiguration": {
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                "modelArn": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
                "retrievalConfiguration": {
                    "vectorSearchConfiguration": {"numberOfResults": 5}
                },
                "generationConfiguration": {
                    "inferenceConfig": {
                        "textInferenceConfig": {
                            "maxTokens": 2048,
                            "temperature": 0
                        }
                    }
                }
            }
        }
    }
    if session_id:
        request["sessionId"] = session_id  # Maintains conversation context

    response = bedrock_agent.retrieve_and_generate(**request)
    return {
        "answer": response["output"]["text"],
        "citations": response.get("citations", []),
        "session_id": response.get("sessionId")
    }`}}),e.jsx("h2",{children:"Working with Model Responses and Token Usage"}),e.jsx(r,{language:"python",filename:"bedrock_usage_tracking.py",children:`import boto3
from dataclasses import dataclass
from typing import Optional

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

@dataclass
class BedrockResponse:
    content: str
    input_tokens: int
    output_tokens: int
    stop_reason: str
    latency_ms: Optional[float] = None

def converse_with_usage(
    message: str,
    model_id: str = "anthropic.claude-3-5-sonnet-20241022-v2:0",
    system: str = None
) -> BedrockResponse:
    """Converse with full usage tracking."""
    import time

    kwargs = {
        "modelId": model_id,
        "messages": [{"role": "user", "content": [{"text": message}]}],
        "inferenceConfig": {"maxTokens": 2048, "temperature": 0}
    }
    if system:
        kwargs["system"] = [{"text": system}]

    start = time.perf_counter()
    response = bedrock.converse(**kwargs)
    latency = (time.perf_counter() - start) * 1000

    usage = response.get("usage", {})
    content_blocks = response["output"]["message"]["content"]
    content = "".join(b.get("text", "") for b in content_blocks)

    return BedrockResponse(
        content=content,
        input_tokens=usage.get("inputTokens", 0),
        output_tokens=usage.get("outputTokens", 0),
        stop_reason=response.get("stopReason", ""),
        latency_ms=latency
    )

# Cross-region inference using inference profiles
def converse_cross_region(message: str) -> str:
    """Use cross-region inference profile for higher availability."""
    # Inference profiles automatically route to available regions
    cross_region_model_id = (
        "us.anthropic.claude-3-5-sonnet-20241022-v2:0"  # US cross-region
        # or "eu.anthropic.claude-3-5-sonnet-20241022-v2:0" for EU
    )
    response = bedrock.converse(
        modelId=cross_region_model_id,
        messages=[{"role": "user", "content": [{"text": message}]}],
        inferenceConfig={"maxTokens": 1024}
    )
    return response["output"]["message"]["content"][0]["text"]`}),e.jsx(o,{title:"Use IAM Roles, Not Access Keys",children:e.jsxs("p",{children:["Never hardcode AWS access keys. In AWS (EC2, ECS, Lambda, EKS), use IAM roles with the principle of least privilege: grant only ",e.jsx("code",{children:"bedrock:InvokeModel"})," on specific model ARNs. Locally, use ",e.jsx("code",{children:"aws sso login"})," or named profiles. Enable CloudTrail to audit every model invocation — you'll get the model ID, input token count, and requester identity for compliance and cost allocation."]})}),e.jsx(s,{type:"tip",title:"Converse vs. invoke_model",children:e.jsxs("p",{children:["Prefer the Converse API for all new development — it handles tool use, multi-turn conversation, and streaming with a single consistent API across all models. Use ",e.jsx("code",{children:"invoke_model"})," only for models not yet supported by Converse (check AWS docs for current support list) or when you need model-specific features not exposed via Converse."]})})]})}const w=Object.freeze(Object.defineProperty({__proto__:null,default:g},Symbol.toStringTag,{value:"Module"}));function f(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Google Cloud AI Platform SDK (Vertex AI)"}),e.jsxs("p",{children:["Google provides the ",e.jsx("strong",{children:"google-cloud-aiplatform"})," Python SDK for Vertex AI, which includes Gemini models, embeddings, fine-tuning, and all Vertex AI services. For Gemini specifically, you can also use the ",e.jsx("strong",{children:"google-generativeai"}),"package (Gemini API / Google AI Studio), but Vertex AI is required for enterprise features: VPC isolation, private endpoints, regional data processing, and compliance."]}),e.jsxs(n,{term:"Vertex AI vs. Gemini API",children:[e.jsxs("p",{children:[e.jsxs("strong",{children:["Vertex AI SDK (",e.jsx("code",{children:"google-cloud-aiplatform"}),"):"]})," Enterprise, GCP-native, uses Application Default Credentials, supports all GCP security controls, SLA-backed, models deployed in your GCP project's region.",e.jsx("br",{}),e.jsxs("strong",{children:["Gemini API (",e.jsx("code",{children:"google-generativeai"}),"):"]})," Consumer-grade, uses API keys, simpler setup, no VPC/IAM, designed for prototyping and non-enterprise use."]}),e.jsx("p",{children:"For production enterprise agents, always use Vertex AI."})]}),e.jsx("h2",{children:"Installation and Authentication"}),e.jsx(r,{language:"bash",filename:"install.sh",children:`# Vertex AI SDK
pip install google-cloud-aiplatform

# Application Default Credentials (ADC) setup
# Option 1: Service account key (avoid in production)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/sa-key.json"

# Option 2: gcloud CLI (local development)
gcloud auth application-default login
gcloud config set project your-project-id

# Option 3: Workload Identity (GKE, Cloud Run, Compute Engine - recommended)
# Automatically uses the GCP service account attached to the workload
# No credentials to manage

# Option 4: Impersonate a service account
gcloud auth application-default login \\
  --impersonate-service-account=sa@project.iam.gserviceaccount.com`}),e.jsx("h2",{children:"Gemini with Vertex AI SDK"}),e.jsx(t,{title:"Vertex AI — GenerativeModel: Chat, Streaming, and Tools",tabs:{python:`import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    GenerationConfig,
    SafetySetting,
    HarmCategory,
    HarmBlockThreshold,
    FunctionDeclaration,
    Tool,
    Part,
    Content,
)

# Initialize — must call before using any Vertex AI API
vertexai.init(
    project="your-gcp-project",
    location="us-central1"  # Use region close to your users
)

# Basic chat
def chat(message: str, model: str = "gemini-2.0-flash-001") -> str:
    model_instance = GenerativeModel(
        model,
        system_instruction="You are a helpful enterprise assistant."
    )
    response = model_instance.generate_content(
        message,
        generation_config=GenerationConfig(
            temperature=0.1,
            max_output_tokens=2048,
            response_mime_type="text/plain",  # Or "application/json"
        ),
        safety_settings={
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        }
    )
    return response.text

# Multi-turn chat session
def multi_turn():
    model = GenerativeModel("gemini-2.0-flash-001")
    chat = model.start_chat(history=[
        Content(role="user", parts=[Part.from_text("I'm analyzing Q4 financials")]),
        Content(role="model", parts=[Part.from_text("I'll help you analyze Q4 financials.")])
    ])

    responses = [
        "What was the revenue growth rate?",
        "How does that compare to Q3?",
        "Summarize the key findings."
    ]
    for msg in responses:
        response = chat.send_message(msg)
        print(f"User: {msg}")
        print(f"Model: {response.text}\\n")

# Streaming
def stream_chat(message: str) -> None:
    model = GenerativeModel("gemini-2.0-flash-001")
    stream = model.generate_content(message, stream=True)
    for chunk in stream:
        if chunk.text:
            print(chunk.text, end="", flush=True)

# Function calling
get_order = FunctionDeclaration(
    name="get_order_status",
    description="Get the status of a customer order",
    parameters={
        "type": "object",
        "properties": {
            "order_id": {"type": "string", "description": "Order ID (e.g., ORD-12345)"},
            "include_items": {"type": "boolean", "description": "Include line items"}
        },
        "required": ["order_id"]
    }
)

tools = Tool(function_declarations=[get_order])

def agent_with_tools(user_message: str) -> str:
    model = GenerativeModel(
        "gemini-2.0-flash-001",
        tools=[tools]
    )
    chat = model.start_chat()

    while True:
        response = chat.send_message(user_message if not hasattr(agent_with_tools, '_sent') else None)
        agent_with_tools._sent = True

        candidate = response.candidates[0]

        if candidate.finish_reason.name == "STOP":
            return response.text

        # Check for function calls
        for part in candidate.content.parts:
            if part.function_call:
                fc = part.function_call
                # Execute function
                result = {"status": "shipped", "delivery_date": "2025-03-20"}

                # Send function response back
                response = chat.send_message(
                    Part.from_function_response(
                        name=fc.name,
                        response={"content": result}
                    )
                )
                return response.text

    return "No response"`}}),e.jsx("h2",{children:"Multimodal: Images, Video, and PDFs"}),e.jsx(t,{title:"Vertex AI — Multimodal Inputs",tabs:{python:`import vertexai
from vertexai.generative_models import GenerativeModel, Part
import base64

vertexai.init(project="your-project", location="us-central1")

model = GenerativeModel("gemini-2.0-flash-001")

# Image analysis from GCS
def analyze_image_gcs(gcs_uri: str, question: str) -> str:
    image_part = Part.from_uri(gcs_uri, mime_type="image/jpeg")
    response = model.generate_content([image_part, question])
    return response.text

# Image analysis from bytes
def analyze_image_bytes(image_bytes: bytes, question: str) -> str:
    image_part = Part.from_data(image_bytes, mime_type="image/jpeg")
    response = model.generate_content([image_part, question])
    return response.text

# PDF analysis (up to 1000 pages with Gemini 1.5 Pro)
def analyze_pdf(pdf_gcs_uri: str, question: str) -> str:
    pdf_part = Part.from_uri(pdf_gcs_uri, mime_type="application/pdf")
    # Use gemini-1.5-pro-002 or gemini-2.0-flash-001 for documents
    pro_model = GenerativeModel("gemini-1.5-pro-002")
    response = pro_model.generate_content([
        pdf_part,
        f"Analyze this document and answer: {question}"
    ])
    return response.text

# Video understanding
def analyze_video(video_gcs_uri: str, question: str) -> str:
    video_part = Part.from_uri(video_gcs_uri, mime_type="video/mp4")
    # gemini-1.5-pro handles up to 1 hour of video
    pro_model = GenerativeModel("gemini-1.5-pro-002")
    response = pro_model.generate_content([video_part, question])
    return response.text

# Context caching for long documents (reduce cost on repeated queries)
from vertexai.generative_models import CachedContent
import datetime

def cache_document_for_qa(pdf_gcs_uri: str) -> CachedContent:
    """Cache a document to answer multiple questions cheaply."""
    cached = CachedContent.create(
        model_name="gemini-1.5-pro-002",
        contents=[
            Part.from_uri(pdf_gcs_uri, mime_type="application/pdf")
        ],
        system_instruction="You are an expert document analyst.",
        ttl=datetime.timedelta(hours=4)
    )
    return cached

def qa_with_cache(cached_content: CachedContent, question: str) -> str:
    model = GenerativeModel.from_cached_content(cached_content=cached_content)
    response = model.generate_content(question)
    return response.text`}}),e.jsx("h2",{children:"Embeddings and Grounding"}),e.jsx(r,{language:"python",filename:"vertex_embeddings_grounding.py",children:`from vertexai.language_models import TextEmbeddingModel, TextEmbeddingInput
from vertexai.generative_models import GenerativeModel, Tool, grounding
import vertexai

vertexai.init(project="your-project", location="us-central1")

# Text embeddings
def embed_texts(texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[list[float]]:
    """
    Task types: RETRIEVAL_QUERY, RETRIEVAL_DOCUMENT, SEMANTIC_SIMILARITY,
                CLASSIFICATION, CLUSTERING, QUESTION_ANSWERING, FACT_VERIFICATION
    """
    model = TextEmbeddingModel.from_pretrained("text-embedding-005")

    inputs = [TextEmbeddingInput(text=t, task_type=task_type) for t in texts]
    embeddings = model.get_embeddings(inputs, output_dimensionality=768)  # Up to 768 dims

    return [e.values for e in embeddings]

# Grounding with Google Search (reduces hallucinations on current events)
def search_grounded_generate(query: str) -> str:
    search_tool = Tool.from_google_search_retrieval(
        grounding.GoogleSearchRetrieval(
            dynamic_retrieval_config=grounding.DynamicRetrievalConfig(
                mode=grounding.DynamicRetrievalConfig.Mode.MODE_DYNAMIC,
                dynamic_threshold=0.7  # Only ground when needed
            )
        )
    )

    model = GenerativeModel("gemini-2.0-flash-001", tools=[search_tool])
    response = model.generate_content(query)

    # Grounding metadata shows which search results were used
    if response.candidates[0].grounding_metadata:
        sources = response.candidates[0].grounding_metadata.grounding_chunks
        print(f"Used {len(sources)} search results")

    return response.text

# Vertex AI Search grounding (private data store)
def private_data_grounded_generate(query: str, data_store_id: str) -> str:
    data_store = (
        f"projects/your-project/locations/global/"
        f"collections/default_collection/dataStores/{data_store_id}"
    )
    retrieval_tool = Tool.from_retrieval(
        grounding.Retrieval(grounding.VertexAISearch(datastore=data_store))
    )

    model = GenerativeModel("gemini-2.0-flash-001", tools=[retrieval_tool])
    response = model.generate_content(query)
    return response.text`}),e.jsx(o,{title:"Use Workload Identity Federation in Production",children:e.jsxs("p",{children:["On GKE and Cloud Run, configure Workload Identity Federation so that pods/services automatically receive a GCP service account identity — no key files, no secrets to manage. Bind the service account to only the IAM roles needed: ",e.jsx("code",{children:"roles/aiplatform.user"}),"for model inference, ",e.jsx("code",{children:"roles/storage.objectViewer"})," for reading documents. Avoid ",e.jsx("code",{children:"roles/owner"})," or ",e.jsx("code",{children:"roles/editor"})," for any Vertex AI workload."]})}),e.jsx(s,{type:"tip",title:"Regional Endpoints for Lower Latency",children:e.jsxs("p",{children:["Always initialize Vertex AI with a region close to your users:",e.jsx("code",{children:'vertexai.init(project=PROJECT, location="europe-west1")'})," for European users,",e.jsx("code",{children:'"asia-northeast1"'})," for Japan, etc. Using ",e.jsx("code",{children:"us-central1"})," for global users adds unnecessary latency. Vertex AI models are available in most major regions."]})})]})}const j=Object.freeze(Object.defineProperty({__proto__:null,default:f},Symbol.toStringTag,{value:"Module"}));function _(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LiteLLM: Unified LLM Interface"}),e.jsx("p",{children:"LiteLLM provides a single OpenAI-compatible API that routes to 100+ LLM providers — Azure OpenAI, Amazon Bedrock, Google Vertex AI, Anthropic, Cohere, Mistral, and more. It's the primary abstraction layer for multi-cloud AI architectures, enabling model switching, cost-optimized routing, and automatic fallback without changing application code."}),e.jsx(n,{term:"LiteLLM",children:e.jsxs("p",{children:["LiteLLM translates OpenAI-format requests into each provider's native API format, normalizes responses back to OpenAI format, and exposes a consistent Python SDK and optional proxy server. The model is identified by a prefixed string:",e.jsx("code",{children:"azure/gpt-4o"}),", ",e.jsx("code",{children:"bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0"}),",",e.jsx("code",{children:"vertex_ai/gemini-2.0-flash-001"}),"."]})}),e.jsx(i,{title:"LiteLLM Proxy — Multi-Cloud Routing",width:700,height:280,nodes:[{id:"app",label:"Your Application",type:"external",x:80,y:140},{id:"proxy",label:"LiteLLM Proxy",type:"agent",x:260,y:140},{id:"azure",label:"Azure OpenAI",type:"llm",x:480,y:60},{id:"bedrock",label:"AWS Bedrock",type:"llm",x:480,y:140},{id:"vertex",label:"Vertex AI",type:"llm",x:480,y:220},{id:"metrics",label:"Cost + Metrics",type:"store",x:640,y:140}],edges:[{from:"app",to:"proxy",label:"OpenAI format"},{from:"proxy",to:"azure",label:"primary"},{from:"proxy",to:"bedrock",label:"fallback"},{from:"proxy",to:"vertex",label:"fallback"},{from:"proxy",to:"metrics"}]}),e.jsx("h2",{children:"Installation and Basic Usage"}),e.jsx(r,{language:"bash",filename:"install.sh",children:`pip install litellm

# With proxy server support
pip install 'litellm[proxy]'`}),e.jsx(t,{title:"LiteLLM — Basic Usage Across All Providers",tabs:{python:`import litellm
import os

# Set credentials via environment variables
os.environ["AZURE_API_KEY"] = "your-azure-key"
os.environ["AZURE_API_BASE"] = "https://your-service.openai.azure.com"
os.environ["AZURE_API_VERSION"] = "2024-10-21"

os.environ["AWS_ACCESS_KEY_ID"] = "your-access-key"
os.environ["AWS_SECRET_ACCESS_KEY"] = "your-secret-key"
os.environ["AWS_REGION_NAME"] = "us-east-1"

os.environ["VERTEXAI_PROJECT"] = "your-project"
os.environ["VERTEXAI_LOCATION"] = "us-central1"

# Calling different providers with the SAME API
def complete(model: str, message: str) -> str:
    response = litellm.completion(
        model=model,
        messages=[{"role": "user", "content": message}],
        temperature=0,
        max_tokens=1024,
    )
    return response.choices[0].message.content

# Azure OpenAI
azure_response = complete("azure/gpt-4o", "Explain retrieval-augmented generation")

# Amazon Bedrock (Claude)
bedrock_response = complete(
    "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
    "Explain retrieval-augmented generation"
)

# Vertex AI (Gemini)
vertex_response = complete(
    "vertex_ai/gemini-2.0-flash-001",
    "Explain retrieval-augmented generation"
)

# Streaming — same across all providers
def stream_complete(model: str, message: str) -> None:
    stream = litellm.completion(
        model=model,
        messages=[{"role": "user", "content": message}],
        stream=True
    )
    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            print(content, end="", flush=True)

# Async
import asyncio

async def async_complete(model: str, message: str) -> str:
    response = await litellm.acompletion(
        model=model,
        messages=[{"role": "user", "content": message}]
    )
    return response.choices[0].message.content

# Tool use — same API for all providers
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string"}
                },
                "required": ["city"]
            }
        }
    }
]

response = litellm.completion(
    model="bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
    messages=[{"role": "user", "content": "What's the weather in Seattle?"}],
    tools=tools,
    tool_choice="auto"
)`}}),e.jsx("h2",{children:"Fallback and Load Balancing"}),e.jsx(l,{name:"Fallback Routing",category:"Reliability",whenToUse:"When you need high availability across model providers, or when your primary provider is capacity-constrained or has an outage.",children:e.jsx("p",{children:"LiteLLM supports automatic fallback at both the model level (try GPT-4o, fall back to Claude 3.5 Sonnet) and the provider level (try Azure primary region, fall back to Bedrock). Fallbacks are configured declaratively and happen transparently to your code."})}),e.jsx(t,{title:"LiteLLM — Fallbacks, Load Balancing, and Cost Tracking",tabs:{python:`import litellm
from litellm import Router

# Configure a router with multiple model deployments
router = Router(
    model_list=[
        # Primary: Azure GPT-4o (two deployments for load balancing)
        {
            "model_name": "gpt-4o-primary",
            "litellm_params": {
                "model": "azure/gpt-4o",
                "api_base": "https://westus2.openai.azure.com",
                "api_key": "key1",
                "api_version": "2024-10-21",
            },
            "tpm": 100000,  # tokens per minute capacity
            "rpm": 600,     # requests per minute
        },
        {
            "model_name": "gpt-4o-primary",
            "litellm_params": {
                "model": "azure/gpt-4o",
                "api_base": "https://eastus2.openai.azure.com",
                "api_key": "key2",
                "api_version": "2024-10-21",
            },
            "tpm": 100000,
            "rpm": 600,
        },
        # Fallback: Bedrock Claude
        {
            "model_name": "claude-fallback",
            "litellm_params": {
                "model": "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
                "aws_region_name": "us-east-1",
            },
        },
        # Fallback: Vertex AI Gemini
        {
            "model_name": "gemini-fallback",
            "litellm_params": {
                "model": "vertex_ai/gemini-2.0-flash-001",
                "vertex_project": "my-project",
                "vertex_location": "us-central1",
            },
        },
    ],
    # Load balancing strategy
    routing_strategy="least-busy",  # or "usage-based-routing", "latency-based-routing"
    # Fallback order when primary fails
    fallbacks=[
        {"gpt-4o-primary": ["claude-fallback", "gemini-fallback"]}
    ],
    # Retry configuration
    num_retries=3,
    retry_after=10,  # seconds between retries
    # Request timeout
    timeout=30,
    # Cache successful responses
    cache_responses=True,
    redis_url="redis://localhost:6379",
)

async def resilient_complete(message: str) -> str:
    response = await router.acompletion(
        model="gpt-4o-primary",
        messages=[{"role": "user", "content": message}]
    )
    return response.choices[0].message.content

# Cost tracking
litellm.success_callback = ["langfuse", "prometheus"]  # Built-in integrations

def complete_with_cost(model: str, message: str) -> dict:
    response = litellm.completion(
        model=model,
        messages=[{"role": "user", "content": message}]
    )
    cost = litellm.completion_cost(completion_response=response)
    return {
        "content": response.choices[0].message.content,
        "cost_usd": cost,
        "input_tokens": response.usage.prompt_tokens,
        "output_tokens": response.usage.completion_tokens,
        "model": response.model
    }`}}),e.jsx("h2",{children:"LiteLLM Proxy Server"}),e.jsxs("p",{children:["The LiteLLM proxy exposes an OpenAI-compatible HTTP server. Any application using the OpenAI SDK can route through LiteLLM proxy by changing the ",e.jsx("code",{children:"base_url"}),"— enabling centralized rate limiting, cost tracking, and model governance without modifying individual applications."]}),e.jsx(r,{language:"yaml",filename:"litellm_config.yaml",children:`model_list:
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o
      api_base: https://westus2.openai.azure.com
      api_key: os.environ/AZURE_API_KEY_1
      api_version: "2024-10-21"

  - model_name: claude-3-5-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0
      aws_region_name: us-east-1

  - model_name: gemini-flash
    litellm_params:
      model: vertex_ai/gemini-2.0-flash-001
      vertex_project: my-project
      vertex_location: us-central1

router_settings:
  routing_strategy: usage-based-routing-v2
  num_retries: 2
  timeout: 60
  fallbacks:
    - gpt-4o: ["claude-3-5-sonnet", "gemini-flash"]

litellm_settings:
  success_callback: ["prometheus", "langfuse"]
  failure_callback: ["prometheus", "slack"]
  max_budget: 1000  # USD per month total
  budget_duration: 1mo

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY  # Auth for proxy API
  database_url: os.environ/DATABASE_URL      # PostgreSQL for logging
  store_model_in_db: true`}),e.jsx(r,{language:"bash",filename:"run_proxy.sh",children:`# Start the proxy server
litellm --config litellm_config.yaml --port 4000

# Any OpenAI-compatible client can now use it:
# export OPENAI_API_BASE="http://localhost:4000"
# export OPENAI_API_KEY="sk-your-master-key"
# Then use the normal openai SDK - it routes through LiteLLM`}),e.jsx(o,{title:"Use LiteLLM Router for Enterprise Resilience",children:e.jsxs("p",{children:["For production multi-cloud setups, use LiteLLM Router (not raw ",e.jsx("code",{children:"litellm.completion"}),") to get automatic load balancing across deployments, TPM/RPM-aware routing, and cascading fallbacks. Configure at least one cross-provider fallback (e.g., Azure GPT-4o → Bedrock Claude) to handle provider-wide outages. Monitor cost per model via the built-in Prometheus exporter to catch unexpected cost spikes early."]})}),e.jsx(s,{type:"info",title:"LiteLLM vs. Provider SDKs",children:e.jsx("p",{children:"LiteLLM adds a thin abstraction layer that's invaluable for multi-cloud setups and A/B testing models. However, for provider-specific features (Azure Assistants API, Bedrock Agents, Vertex AI grounding with Google Search), you'll still need the native SDKs. A common pattern: LiteLLM for standard completions and embeddings, native SDKs for managed services (agents, knowledge bases, guardrails)."})})]})}const I=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"}));export{b as a,S as b,w as c,j as d,I as e,k as s};
