import{j as e}from"./vendor-Cs56uELc.js";import{C as r,S as t,b as l,B as s,N as n,A as a,P as i,a as o}from"./content-components-Co4HZJZx.js";function u(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Anthropic SDK Basics"}),e.jsx("p",{children:"The Anthropic SDK is your primary interface for building applications with Claude. Available in Python and TypeScript/JavaScript, it provides a clean abstraction over the Messages API, handles authentication, retry logic, and response parsing."}),e.jsx(r,{term:"Anthropic SDK",children:e.jsx("p",{children:"The official Anthropic client library that provides typed interfaces for all Claude API features including message creation, streaming, tool use, vision, and token counting. It handles authentication, rate limit retries with exponential backoff, and connection management automatically."})}),e.jsx("h2",{children:"Installation"}),e.jsx(t,{title:"Installing the Anthropic SDK",tabs:{bash:`# Python
pip install anthropic

# TypeScript / JavaScript
npm install @anthropic-ai/sdk`}}),e.jsx(l,{title:"API Key Security",severity:"high",children:e.jsxs("p",{children:["Never hardcode your API key in source code or commit it to version control. Use environment variables (",e.jsx("code",{children:"ANTHROPIC_API_KEY"}),") or a secrets manager. The SDK automatically reads ",e.jsx("code",{children:"ANTHROPIC_API_KEY"})," from the environment if you don't pass it explicitly."]})}),e.jsx("h2",{children:"Basic Client Setup"}),e.jsx(t,{title:"Creating an Anthropic Client",tabs:{python:`import anthropic
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
console.log(\`\\nTotal tokens: \${finalMessage.usage.input_tokens + finalMessage.usage.output_tokens}\`);`}}),e.jsx("h2",{children:"Available Claude Models"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Model ID"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Best For"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Context"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["claude-opus-4-6","Most capable: complex reasoning, coding, analysis","200K"],["claude-sonnet-4-6","Balanced: speed + intelligence for most tasks","200K"],["claude-haiku-4-5-20251001","Fastest, most cost-effective: simple tasks","200K"]].map(([c,d,p])=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300",children:c}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:d}),e.jsxs("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:[p," tokens"]})]},c))})]})}),e.jsx(s,{title:"Use claude-opus-4-6 for Development, Route in Production",children:e.jsx("p",{children:"During development and evaluation, use claude-opus-4-6 to establish baseline quality. Once you understand the task complexity distribution, route simpler tasks to claude-haiku-4-5-20251001 or claude-sonnet-4-6 in production to reduce costs by 80-95% without sacrificing quality where it matters."})}),e.jsx(n,{type:"tip",title:"Rate Limits and Retries",children:e.jsxs("p",{children:["The SDK automatically retries rate limit errors (429) and server errors (5xx) with exponential backoff. Set ",e.jsx("code",{children:"max_retries=5"})," for production workloads. Monitor ",e.jsx("code",{children:"X-RateLimit-*"})," headers (accessible via raw HTTP) to understand your usage patterns and avoid hitting limits."]})})]})}const B=Object.freeze(Object.defineProperty({__proto__:null,default:u},Symbol.toStringTag,{value:"Module"})),m=[{id:"app",label:"Your Application",type:"agent",x:60,y:150},{id:"sdk",label:"Claude Agent SDK",type:"llm",x:230,y:150},{id:"session",label:"Session Manager",type:"agent",x:400,y:80},{id:"tools",label:"Tool Executor",type:"tool",x:400,y:150},{id:"memory",label:"Memory / Context",type:"store",x:400,y:220},{id:"api",label:"Anthropic Messages API",type:"external",x:580,y:150}],h=[{from:"app",to:"sdk",label:"run(task)"},{from:"sdk",to:"session",label:"manage"},{from:"sdk",to:"tools",label:"dispatch"},{from:"sdk",to:"memory",label:"read/write"},{from:"sdk",to:"api",label:"messages"},{from:"api",to:"sdk",label:"response"},{from:"tools",to:"sdk",label:"result"}];function g(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Claude Agent SDK"}),e.jsx("p",{children:"The Claude Agent SDK (part of the Anthropic Agent SDK / Claude Code SDK) provides higher-level abstractions on top of the raw Messages API. Instead of manually managing the tool-call loop, building context windows, and handling retries, the SDK handles the agentic loop for you so you can focus on defining tools and tasks."}),e.jsx(r,{term:"Agentic Loop",children:e.jsxs("p",{children:["The agentic loop is the cycle: ",e.jsx("strong",{children:"send message → receive response → if tool_use block present, execute tool → append result → repeat"})," until the model returns a final ",e.jsx("code",{children:"end_turn"})," stop reason. The Agent SDK encapsulates this loop, including streaming, error handling, and context-window management."]})}),e.jsx(a,{nodes:m,edges:h,title:"Claude Agent SDK Architecture"}),e.jsx("h2",{children:"Installation"}),e.jsx(t,{title:"Install the SDK",tabs:{bash:`# Python (Claude Agent SDK ships inside the anthropic package)
pip install anthropic

# TypeScript
npm install @anthropic-ai/sdk`}}),e.jsx("h2",{children:"Running an Agent with the SDK"}),e.jsxs("p",{children:["The simplest entry-point is ",e.jsx("code",{children:"client.beta.messages.create"})," with",e.jsx("code",{children:'betas=["computer-use-2024-10-22"]'})," for computer use, or the higher-level agentic helpers introduced in the Claude Code SDK for programmatic sub-agent control."]}),e.jsx(t,{title:"Basic tool-use agentic loop (Python)",tabs:{python:`import anthropic
import json

client = anthropic.Anthropic()

# Define tools
tools = [
    {
        "name": "read_file",
        "description": "Read the contents of a file from disk.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Absolute file path"}
            },
            "required": ["path"],
        },
    },
    {
        "name": "write_file",
        "description": "Write content to a file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path":    {"type": "string"},
                "content": {"type": "string"},
            },
            "required": ["path", "content"],
        },
    },
]

def execute_tool(name: str, inputs: dict) -> str:
    """Dispatch tool calls to real implementations."""
    if name == "read_file":
        try:
            with open(inputs["path"]) as f:
                return f.read()
        except FileNotFoundError:
            return f"Error: file not found: {inputs['path']}"
    elif name == "write_file":
        with open(inputs["path"], "w") as f:
            f.write(inputs["content"])
        return "File written successfully."
    return f"Unknown tool: {name}"

def run_agent(task: str) -> str:
    """Run the agentic loop until end_turn."""
    messages = [{"role": "user", "content": task}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )

        # Append assistant response to context
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            # Extract final text answer
            for block in response.content:
                if block.type == "text":
                    return block.text
            return ""

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })
            messages.append({"role": "user", "content": tool_results})

answer = run_agent("Read /etc/hostname and tell me the machine name.")
print(answer)`,typescript:`import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Read the contents of a file from disk.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Absolute file path" },
      },
      required: ["path"],
    },
  },
];

function executeTool(name: string, input: Record<string, string>): string {
  if (name === "read_file") {
    try {
      return fs.readFileSync(input.path, "utf-8");
    } catch {
      return \`Error: file not found: \${input.path}\`;
    }
  }
  return \`Unknown tool: \${name}\`;
}

async function runAgent(task: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: task },
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = response.content
        .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
        .map((b) => ({
          type: "tool_result" as const,
          tool_use_id: b.id,
          content: executeTool(b.name, b.input as Record<string, string>),
        }));
      messages.push({ role: "user", content: toolResults });
    }
  }
}

runAgent("Read /etc/hostname and tell me the machine name.").then(console.log);`}}),e.jsx("h2",{children:"Claude Code SDK — Programmatic Sub-Agents"}),e.jsxs("p",{children:["The ",e.jsx("strong",{children:"Claude Code SDK"})," lets you spawn Claude Code as a headless sub-agent inside your own programs. This is ideal for coding pipelines where you want Claude to autonomously edit files, run tests, and iterate."]}),e.jsx(t,{title:"Claude Code SDK — headless sub-agent",tabs:{bash:`# Install the Claude Code CLI (also ships the SDK)
npm install -g @anthropic-ai/claude-code`,typescript:`import { query, type SDKMessage } from "@anthropic-ai/claude-code";

async function runCodingAgent(prompt: string, projectDir: string) {
  const messages: SDKMessage[] = [];

  // query() streams messages from a headless Claude Code session
  for await (const message of query({
    prompt,
    options: {
      cwd: projectDir,
      // Limit tools for safety in CI
      allowedTools: ["Read", "Write", "Edit", "Bash"],
    },
  })) {
    messages.push(message);

    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") process.stdout.write(block.text);
      }
    }
  }

  return messages;
}

// Example: fix a failing test
await runCodingAgent(
  "Run the test suite, identify any failures, and fix them.",
  "/home/user/my-project"
);`,python:`# Python wrapper (calls the CLI via subprocess)
import subprocess, json, sys

def run_claude_code(prompt: str, cwd: str) -> list[dict]:
    """Run Claude Code headlessly and collect output messages."""
    result = subprocess.run(
        ["claude", "--print", "--output-format", "stream-json",
         "--allowedTools", "Read,Write,Edit,Bash",
         "--prompt", prompt],
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    messages = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if line:
            try:
                messages.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return messages

msgs = run_claude_code(
    "Add type annotations to all functions in src/utils.py",
    "/home/user/my-project"
)
for m in msgs:
    if m.get("type") == "result":
        print("Final:", m.get("result"))`}}),e.jsx("h2",{children:"Sessions and Multi-Turn Conversations"}),e.jsxs("p",{children:["For long-running agents you want to persist the conversation across invocations. The SDK supports passing a ",e.jsx("code",{children:"session_id"})," (Claude Code SDK) or manually serialising ",e.jsx("code",{children:"messages"})," to a store between runs."]}),e.jsx(t,{title:"Resuming a Claude Code session",tabs:{typescript:`import { query } from "@anthropic-ai/claude-code";

// First turn – no session yet
let sessionId: string | undefined;

for await (const msg of query({ prompt: "Create a React component for a login form." })) {
  if (msg.type === "system" && msg.session_id) {
    sessionId = msg.session_id;   // capture for next turn
  }
}

// Second turn – continue the same session
for await (const msg of query({
  prompt: "Now add form validation with Zod.",
  options: { resume: sessionId },
})) {
  if (msg.type === "assistant") {
    for (const block of msg.message.content) {
      if (block.type === "text") process.stdout.write(block.text);
    }
  }
}`}}),e.jsx("h2",{children:"Streaming Responses"}),e.jsx(t,{title:"Streaming with the Anthropic SDK",tabs:{python:`import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a haiku about agentic AI."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

# Access the final message after streaming completes
final = stream.get_final_message()
print(f"\\nStop reason: {final.stop_reason}")
print(f"Input tokens: {final.usage.input_tokens}")`,typescript:`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const stream = await client.messages.stream({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Write a haiku about agentic AI." }],
});

for await (const chunk of stream) {
  if (
    chunk.type === "content_block_delta" &&
    chunk.delta.type === "text_delta"
  ) {
    process.stdout.write(chunk.delta.text);
  }
}

const final = await stream.finalMessage();
console.log("\\nStop reason:", final.stop_reason);`}}),e.jsx(i,{name:"Tool-Result Injection Pattern",children:e.jsxs("p",{children:["Always include tool results in the same ",e.jsx("code",{children:"user"})," turn that follows the assistant's ",e.jsx("code",{children:"tool_use"})," blocks. Each ",e.jsx("code",{children:"tool_result"})," must reference the exact ",e.jsx("code",{children:"tool_use_id"})," from the model's response. Missing or mismatched IDs cause ",e.jsx("code",{children:"400"})," validation errors."]})}),e.jsx(s,{title:"Agent SDK Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Set ",e.jsx("code",{children:"max_tokens"})," high enough (≥ 4 096) for tool-heavy tasks; the model stops mid-loop if it runs out."]}),e.jsxs("li",{children:["Add a ",e.jsx("strong",{children:"loop counter"})," (e.g. max 20 iterations) to prevent runaway agents."]}),e.jsxs("li",{children:["Catch ",e.jsx("code",{children:"anthropic.APIStatusError"})," for rate-limit (429) and server (500+) errors; implement exponential back-off."]}),e.jsx("li",{children:"Log every message turn to a structured store for observability and replay."}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:'tool_choice: {"type": "auto"}'})," in most cases; switch to ",e.jsx("code",{children:'"any"'})," only when you need to force a tool call."]})]})}),e.jsxs(n,{children:["The ",e.jsx("strong",{children:"Claude Code SDK"})," (",e.jsx("code",{children:"@anthropic-ai/claude-code"}),") and the ",e.jsx("strong",{children:"Anthropic Messages SDK"})," (",e.jsx("code",{children:"@anthropic-ai/sdk"}),") are complementary, not competing. Use the Messages SDK when you build your own tool executor. Use the Claude Code SDK when you want Claude Code's full tool suite (file editing, bash, MCP) in a headless subprocess."]})]})}const K=Object.freeze(Object.defineProperty({__proto__:null,default:g},Symbol.toStringTag,{value:"Module"}));function f(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LangGraph: State Machines for Agents"}),e.jsx("p",{children:"LangGraph is LangChain's framework for building stateful, multi-step agent workflows as directed graphs. Unlike simple chain-of-thought loops, LangGraph lets you define complex conditional flows, cycles, human-in-the-loop interrupts, and persistent state — all the primitives needed for production agents."}),e.jsx(r,{term:"LangGraph StateGraph",children:e.jsxs("p",{children:["A LangGraph ",e.jsx("strong",{children:"StateGraph"})," is a directed graph where nodes are Python functions (agent steps) and edges define the flow between steps. The graph maintains a typed ",e.jsx("strong",{children:"State"})," object that flows between nodes, accumulating results. Conditional edges allow dynamic routing based on the current state."]})}),e.jsx(a,{title:"LangGraph RAG Agent Architecture",width:640,height:300,nodes:[{id:"start",label:"User Query",type:"external",x:80,y:150},{id:"retrieve",label:"Retrieve",type:"tool",x:220,y:150},{id:"grade",label:"Grade Docs",type:"agent",x:360,y:150},{id:"generate",label:"Generate",type:"llm",x:500,y:100},{id:"rewrite",label:"Rewrite Query",type:"agent",x:500,y:200},{id:"answer",label:"Final Answer",type:"external",x:600,y:150}],edges:[{from:"start",to:"retrieve"},{from:"retrieve",to:"grade"},{from:"grade",to:"generate",label:"relevant"},{from:"grade",to:"rewrite",label:"not relevant"},{from:"rewrite",to:"retrieve",label:"retry"},{from:"generate",to:"answer"}]}),e.jsx("h2",{children:"Core Concepts"}),e.jsx("h3",{children:"State"}),e.jsxs("p",{children:["State is a TypedDict (Python) that flows through the graph. All nodes read from and write to this shared state. LangGraph supports both ",e.jsx("strong",{children:"total state replacement"})," and",e.jsx("strong",{children:"reducer functions"})," (e.g., append to a list)."]}),e.jsx("h3",{children:"Nodes"}),e.jsx("p",{children:"Nodes are Python functions that take the current state and return an update dict. They can call LLMs, run tools, query databases, or execute any Python code."}),e.jsx("h3",{children:"Edges"}),e.jsxs("p",{children:["Edges connect nodes. ",e.jsx("strong",{children:"Normal edges"})," always go from A to B.",e.jsx("strong",{children:"Conditional edges"})," use a function to decide the next node based on state.",e.jsx("code",{children:"START"})," and ",e.jsx("code",{children:"END"})," are special entry/exit nodes."]}),e.jsx("h2",{children:"Building a CRAG Agent with LangGraph"}),e.jsx("p",{children:"The following example implements Corrective RAG (CRAG) — an agent that retrieves documents, grades their relevance, and either generates an answer or rewrites the query and retries."}),e.jsx(t,{title:"CRAG Agent with LangGraph",tabs:{python:`from typing import TypedDict, Annotated, List
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
print(result["generation"])`}}),e.jsx("h2",{children:"Checkpointing & Persistence"}),e.jsx("p",{children:"LangGraph's checkpointing system saves graph state after each node, enabling: pause/resume, human-in-the-loop approval gates, and fault tolerance."}),e.jsx(o,{language:"python",filename:"langgraph_checkpointing.py",children:`from langgraph.checkpoint.sqlite import SqliteSaver
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
app.invoke(None, config=config)  # Resume from checkpoint`}),e.jsx(i,{name:"Supervisor Pattern with LangGraph",category:"Multi-Agent",whenToUse:"When you have multiple specialized worker agents that need to be coordinated by a central router that decides which agent handles each subtask.",children:e.jsx("p",{children:"The supervisor pattern uses a LLM router as a special node that decides which worker agent to call next. Workers report back to the supervisor after each step. The supervisor sees all worker outputs and decides when the task is complete."})}),e.jsx(s,{title:"State Schema Design",children:e.jsxs("p",{children:["Design your state schema before writing any nodes. Use Annotated types with reducer functions for lists (e.g., ",e.jsx("code",{children:"Annotated[list, operator.add]"})," to append rather than replace). Keep state flat and serializable — LangGraph needs to checkpoint it. Avoid storing large objects like embeddings directly in state; use IDs and look them up."]})}),e.jsx(n,{type:"tip",title:"LangGraph vs. LangChain Agents",children:e.jsx("p",{children:"Use LangGraph when you need: cycles/loops, multiple conditional paths, persistent state across sessions, or human-in-the-loop interrupts. Use simple LangChain AgentExecutor for straightforward ReAct loops without complex branching. LangGraph has more boilerplate but gives you full control over agent flow."})})]})}const q=Object.freeze(Object.defineProperty({__proto__:null,default:f},Symbol.toStringTag,{value:"Module"})),y=[{id:"host",label:`MCP Host
(Claude Desktop / app)`,type:"agent",x:60,y:150},{id:"client",label:"MCP Client",type:"agent",x:240,y:150},{id:"srv1",label:"Filesystem Server",type:"tool",x:440,y:60},{id:"srv2",label:"Database Server",type:"tool",x:440,y:150},{id:"srv3",label:"Web Search Server",type:"tool",x:440,y:240},{id:"ext1",label:"Local Files",type:"store",x:640,y:60},{id:"ext2",label:"PostgreSQL",type:"store",x:640,y:150},{id:"ext3",label:"Search API",type:"external",x:640,y:240}],_=[{from:"host",to:"client",label:"embed"},{from:"client",to:"srv1",label:"JSON-RPC 2.0"},{from:"client",to:"srv2",label:"JSON-RPC 2.0"},{from:"client",to:"srv3",label:"JSON-RPC 2.0"},{from:"srv1",to:"ext1",label:"read/write"},{from:"srv2",to:"ext2",label:"query"},{from:"srv3",to:"ext3",label:"HTTP"}];function x(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Model Context Protocol (MCP) — Deep Dive"}),e.jsxs("p",{children:["The ",e.jsx("strong",{children:"Model Context Protocol (MCP)"})," is an open standard introduced by Anthropic in November 2024. It defines how AI models (hosts) communicate with external capability providers (servers) over a structured JSON-RPC 2.0 channel. MCP replaces ad-hoc, per-integration tool definitions with a universal plug-and-play interface — build a server once, use it with any MCP-compatible host."]}),e.jsx(r,{term:"Model Context Protocol (MCP)",children:e.jsxs("p",{children:["MCP is a client–server protocol where the ",e.jsx("strong",{children:"host"})," (e.g. Claude Desktop, a custom app) embeds an MCP ",e.jsx("strong",{children:"client"})," that connects to one or more MCP ",e.jsx("strong",{children:"servers"}),". Each server exposes a set of"," ",e.jsx("em",{children:"tools"}),", ",e.jsx("em",{children:"resources"}),", and ",e.jsx("em",{children:"prompts"}),". Communication uses JSON-RPC 2.0 over stdio, HTTP+SSE, or WebSockets."]})}),e.jsx(a,{nodes:y,edges:_,title:"MCP Host ↔ Client ↔ Servers"}),e.jsx("h2",{children:"Core Primitives"}),e.jsx("h3",{children:"Tools"}),e.jsx("p",{children:"Tools are callable functions the model can invoke. Each tool has a name, description, and JSON Schema input definition — identical to the Anthropic tool-use format. The server executes the function and returns a result."}),e.jsx("h3",{children:"Resources"}),e.jsxs("p",{children:["Resources are read-only data the model can request by URI (e.g."," ",e.jsx("code",{children:"file:///etc/config.yaml"})," or ",e.jsx("code",{children:"db://orders/2024-01"}),"). Unlike tools, resource reads don't execute code; they return structured content that gets injected into the model's context."]}),e.jsx("h3",{children:"Prompts"}),e.jsx("p",{children:`Servers can expose reusable prompt templates with parameters. The host renders the template and injects it as a system or user message — useful for standardised task bootstrapping (e.g. a "code-review" prompt that always follows your team's checklist).`}),e.jsx("h2",{children:"Building an MCP Server"}),e.jsx(t,{title:"Minimal MCP server (Python)",tabs:{python:`from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("weather-server")

@mcp.tool()
async def get_weather(city: str) -> str:
    """Return current weather for a city."""
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://wttr.in/{city}?format=3",
            timeout=5,
        )
        return r.text

@mcp.resource("weather://{city}/forecast")
async def weather_forecast(city: str) -> str:
    """3-day forecast resource for a city."""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"https://wttr.in/{city}?format=j1", timeout=5)
        data = r.json()
        days = data["weather"][:3]
        lines = [
            f"Day {i+1}: max {d['maxtempC']}°C / min {d['mintempC']}°C"
            for i, d in enumerate(days)
        ]
        return "\\n".join(lines)

if __name__ == "__main__":
    mcp.run()   # defaults to stdio transport`,typescript:`import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "weather-server", version: "1.0.0" });

server.tool(
  "get_weather",
  "Return current weather for a city.",
  { city: z.string().describe("City name") },
  async ({ city }) => {
    const res = await fetch(\`https://wttr.in/\${city}?format=3\`);
    return { content: [{ type: "text", text: await res.text() }] };
  }
);

server.resource(
  "weather-forecast",
  "weather://{city}/forecast",
  async (uri) => {
    const city = uri.pathname.replace("/", "").split("/")[0];
    const res = await fetch(\`https://wttr.in/\${city}?format=j1\`);
    const data = await res.json();
    const text = data.weather
      .slice(0, 3)
      .map(
        (d: any, i: number) =>
          \`Day \${i + 1}: max \${d.maxtempC}°C / min \${d.mintempC}°C\`
      )
      .join("\\n");
    return { contents: [{ uri: uri.href, text, mimeType: "text/plain" }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);`,bash:`# Install the MCP Python SDK
pip install mcp[cli]

# Run your server
python weather_server.py

# Or use the MCP CLI to develop & inspect
mcp dev weather_server.py`}}),e.jsx("h2",{children:"Connecting an MCP Client"}),e.jsx(t,{title:"MCP client — call tools from Python",tabs:{python:`import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(
        command="python",
        args=["weather_server.py"],
    )
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # List available tools
            tools = await session.list_tools()
            print("Available tools:", [t.name for t in tools.tools])

            # Call a tool
            result = await session.call_tool(
                "get_weather", arguments={"city": "Tokyo"}
            )
            print(result.content[0].text)

asyncio.run(main())`,typescript:`import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "my-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "node",
  args: ["weather-server.js"],
});

await client.connect(transport);

// Discover tools
const { tools } = await client.listTools();
console.log("Tools:", tools.map((t) => t.name));

// Call a tool
const result = await client.callTool({
  name: "get_weather",
  arguments: { city: "Tokyo" },
});
console.log((result.content[0] as { text: string }).text);`}}),e.jsx("h2",{children:"Transports"}),e.jsx(t,{title:"HTTP + SSE transport (remote MCP server)",tabs:{python:`# Server side — expose over HTTP
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("remote-server")

@mcp.tool()
def ping() -> str:
    return "pong"

if __name__ == "__main__":
    mcp.run(transport="sse", host="0.0.0.0", port=8080)`,typescript:`// Client side — connect to remote server
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const client = new Client({ name: "remote-client", version: "1.0.0" });
const transport = new SSEClientTransport(
  new URL("http://my-mcp-server.example.com/sse")
);
await client.connect(transport);`}}),e.jsx("h2",{children:"Using MCP with Claude via the Anthropic SDK"}),e.jsx(t,{title:"Feed MCP tool definitions to Claude",tabs:{python:`import asyncio, anthropic
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def mcp_tools_as_anthropic_tools(session: ClientSession):
    """Convert MCP tool definitions to Anthropic tool format."""
    mcp_tools = await session.list_tools()
    return [
        {
            "name": t.name,
            "description": t.description or "",
            "input_schema": t.inputSchema,
        }
        for t in mcp_tools.tools
    ]

async def main():
    server_params = StdioServerParameters(command="python", args=["weather_server.py"])
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await mcp_tools_as_anthropic_tools(session)

            client = anthropic.Anthropic()
            messages = [{"role": "user", "content": "What's the weather in Paris?"}]

            while True:
                response = client.messages.create(
                    model="claude-opus-4-6",
                    max_tokens=1024,
                    tools=tools,
                    messages=messages,
                )
                messages.append({"role": "assistant", "content": response.content})

                if response.stop_reason == "end_turn":
                    print(response.content[0].text)
                    break

                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        result = await session.call_tool(block.name, block.input)
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result.content[0].text,
                        })
                messages.append({"role": "user", "content": tool_results})

asyncio.run(main())`}}),e.jsx("h2",{children:"claude_desktop_config.json — Adding MCP Servers"}),e.jsx(t,{title:"Registering servers in Claude Desktop",tabs:{bash:`# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%\\Claude\\claude_desktop_config.json
# Linux:   ~/.config/Claude/claude_desktop_config.json`,json:`{
  "mcpServers": {
    "weather": {
      "command": "python",
      "args": ["/path/to/weather_server.py"],
      "env": { "WEATHER_API_KEY": "sk-..." }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/docs"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "postgresql://user:pass@localhost/mydb" }
    }
  }
}`}}),e.jsx(l,{title:"MCP Server Trust",severity:"high",children:e.jsx("p",{children:"MCP servers run with the permissions of the host process. A malicious or compromised server can read files, exfiltrate data, or execute arbitrary commands. Only install MCP servers from trusted sources. For remote servers, use authentication tokens and TLS. Review every server's tool definitions before enabling it in production."})}),e.jsx(i,{name:"Registry Pattern",children:e.jsx("p",{children:"Maintain an internal MCP server registry (a JSON file or database) that lists approved servers, their endpoints, and the tools they expose. Gate server registration with a code-review process, just like you would for any third-party dependency."})}),e.jsx(s,{title:"MCP Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Prefix tool names with the server name (e.g. ",e.jsx("code",{children:"weather__get_forecast"}),") to avoid collisions when connecting multiple servers."]}),e.jsx("li",{children:"Return structured JSON from tools rather than plain text — it's easier for Claude to parse and extract fields."}),e.jsxs("li",{children:["Implement ",e.jsx("code",{children:"list_changed"})," notifications so hosts can refresh tool lists without restarting."]}),e.jsxs("li",{children:["Version your server (",e.jsx("code",{children:"version"})," field in ",e.jsx("code",{children:"ServerInfo"}),") and document breaking changes."]}),e.jsxs("li",{children:["Use the ",e.jsx("code",{children:"mcp dev"})," CLI inspector during development to test tool calls interactively."]})]})}),e.jsxs(n,{children:["MCP is already supported by Claude Desktop, Claude Code, Cursor, Zed, Sourcegraph Cody, and many other hosts. The official server registry at"," ",e.jsx("strong",{children:"github.com/modelcontextprotocol/servers"})," contains reference implementations for filesystem, Git, GitHub, databases, browser automation, and more."]})]})}const U=Object.freeze(Object.defineProperty({__proto__:null,default:x},Symbol.toStringTag,{value:"Module"}));function A(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Building Production MCP Servers"}),e.jsx("p",{children:"A production MCP server goes beyond a simple script — it needs authentication, error handling, observability, and clean tool design. This section covers patterns for building servers you can confidently deploy in an enterprise environment."}),e.jsx("h2",{children:"Project Structure"}),e.jsx(t,{title:"Recommended project layout",tabs:{bash:`my-mcp-server/
├── src/
│   ├── server.py          # FastMCP app entry-point
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── database.py    # DB query tools
│   │   └── documents.py   # Document tools
│   ├── resources/
│   │   └── reports.py     # Resource endpoints
│   └── auth.py            # API key / OAuth helpers
├── tests/
│   └── test_tools.py
├── pyproject.toml
└── Dockerfile`}}),e.jsx("h2",{children:"Authentication"}),e.jsx(t,{title:"Bearer-token auth on HTTP+SSE transport",tabs:{python:`from mcp.server.fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import os

mcp = FastMCP("secure-server")
VALID_TOKENS = set(os.environ["MCP_API_KEYS"].split(","))

class BearerAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer ") or auth[7:] not in VALID_TOKENS:
            return Response("Unauthorized", status_code=401)
        return await call_next(request)

@mcp.tool()
def get_secret_data(key: str) -> str:
    """Retrieve sensitive configuration by key."""
    secrets = {"db_url": "postgresql://...", "api_key": "sk-..."}
    return secrets.get(key, "Not found")

# Wrap in Starlette with auth middleware
sse = SseServerTransport("/messages/")
app = Starlette()
app.add_middleware(BearerAuthMiddleware)
# Mount mcp app...`,typescript:`import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const VALID_TOKENS = new Set(process.env.MCP_API_KEYS?.split(",") ?? []);

const app = express();

// Auth middleware
app.use((req, res, next) => {
  const auth = req.headers["authorization"] ?? "";
  if (!auth.startsWith("Bearer ") || !VALID_TOKENS.has(auth.slice(7))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

const server = new McpServer({ name: "secure-server", version: "1.0.0" });
// ... register tools ...

// Mount SSE transport
const transport = new SSEServerTransport("/messages", res);
app.get("/sse", async (req, res) => {
  await server.connect(transport);
});

app.listen(8080);`}}),e.jsx("h2",{children:"Structured Tool Outputs"}),e.jsx(t,{title:"Return rich structured data",tabs:{python:`from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel

mcp = FastMCP("data-server")

class CustomerRecord(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    mrr_usd: float

@mcp.tool()
async def lookup_customer(customer_id: str) -> list[dict]:
    """Look up a customer by ID and return their profile."""
    # In production: query your database
    record = CustomerRecord(
        id=customer_id,
        name="Acme Corp",
        email="billing@acme.com",
        plan="enterprise",
        mrr_usd=4500.0,
    )
    # Return as a list of content blocks (text + JSON)
    import json
    return [
        {"type": "text",     "text": f"Customer: {record.name}"},
        {"type": "resource", "resource": {
            "uri": f"crm://customers/{customer_id}",
            "text": record.model_dump_json(indent=2),
            "mimeType": "application/json",
        }},
    ]`}}),e.jsx("h2",{children:"Error Handling"}),e.jsx(t,{title:"Graceful error returns",tabs:{python:`from mcp.server.fastmcp import FastMCP
from mcp.types import TextContent

mcp = FastMCP("robust-server")

@mcp.tool()
async def query_database(sql: str) -> list[dict]:
    """Execute a read-only SQL query."""
    import asyncpg, os

    if any(kw in sql.upper() for kw in ("INSERT", "UPDATE", "DELETE", "DROP")):
        return [{"type": "text", "text": "Error: only SELECT queries are allowed."}]

    try:
        conn = await asyncpg.connect(os.environ["DATABASE_URL"])
        rows = await conn.fetch(sql)
        await conn.close()
        import json
        return [{"type": "text", "text": json.dumps([dict(r) for r in rows], default=str)}]
    except asyncpg.PostgresError as e:
        return [{"type": "text", "text": f"Database error: {e}"}]
    except Exception as e:
        return [{"type": "text", "text": f"Unexpected error: {e}"}]`,typescript:`import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "robust-server", version: "1.0.0" });

server.tool(
  "query_database",
  "Execute a read-only SQL query.",
  { sql: z.string() },
  async ({ sql }) => {
    const forbidden = ["INSERT", "UPDATE", "DELETE", "DROP"];
    if (forbidden.some((kw) => sql.toUpperCase().includes(kw))) {
      return {
        content: [{ type: "text", text: "Error: only SELECT queries allowed." }],
        isError: true,
      };
    }
    try {
      // const rows = await db.query(sql);
      const rows: unknown[] = []; // placeholder
      return {
        content: [{ type: "text", text: JSON.stringify(rows) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: \`Database error: \${err}\` }],
        isError: true,
      };
    }
  }
);`}}),e.jsx("h2",{children:"Testing MCP Servers"}),e.jsx(t,{title:"Unit test tools with pytest / jest",tabs:{python:`import pytest
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

@pytest.mark.anyio
async def test_get_weather():
    params = StdioServerParameters(command="python", args=["src/server.py"])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool("get_weather", {"city": "London"})
            assert result.content[0].text != ""
            assert "°C" in result.content[0].text or "°F" in result.content[0].text`,bash:`# Interactive testing with the MCP Inspector
npx @modelcontextprotocol/inspector python src/server.py

# Or with the mcp CLI
mcp dev src/server.py`}}),e.jsx("h2",{children:"Dockerising Your Server"}),e.jsx(t,{title:"Dockerfile for an MCP server",tabs:{bash:`FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir .
COPY src/ src/

# Expose for HTTP+SSE transport
EXPOSE 8080

CMD ["python", "-m", "src.server"]`}}),e.jsx(l,{title:"Least-Privilege Tool Design",severity:"medium",children:e.jsx("p",{children:'Each tool should do exactly one thing and require the minimum permissions to do it. Avoid generic "run any shell command" tools in production. If you must expose shell access, use an allowlist of permitted commands and validate inputs with a strict schema.'})}),e.jsx(s,{title:"Production Checklist",children:e.jsxs("ul",{children:[e.jsx("li",{children:"Validate all tool inputs with Pydantic / Zod schemas before execution."}),e.jsxs("li",{children:["Return ",e.jsx("code",{children:"isError: true"})," on tool failures so the model knows to handle the error rather than treating it as data."]}),e.jsx("li",{children:"Emit structured logs (JSON) for every tool invocation: tool name, inputs hash, duration, success/error."}),e.jsx("li",{children:"Rate-limit tool calls per client token to prevent abuse."}),e.jsx("li",{children:"Publish your server to a private MCP registry so teams can discover and reuse it."})]})}),e.jsxs(n,{children:["The ",e.jsx("strong",{children:"MCP Inspector"})," (",e.jsx("code",{children:"npx @modelcontextprotocol/inspector"}),") is an interactive browser-based UI for exploring, calling, and debugging any MCP server. It's the fastest way to verify your server behaves correctly before integrating it with a host."]})]})}const F=Object.freeze(Object.defineProperty({__proto__:null,default:A},Symbol.toStringTag,{value:"Module"})),v=[{id:"client",label:`Client Agent
(Orchestrator)`,type:"agent",x:60,y:150},{id:"cardA",label:`Agent Card A
(discovery)`,type:"store",x:240,y:60},{id:"cardB",label:`Agent Card B
(discovery)`,type:"store",x:240,y:240},{id:"agentA",label:`Remote Agent A
(Data Analysis)`,type:"llm",x:460,y:60},{id:"agentB",label:`Remote Agent B
(Code Gen)`,type:"llm",x:460,y:240},{id:"taskA",label:"Task / Artifact",type:"tool",x:640,y:60},{id:"taskB",label:"Task / Artifact",type:"tool",x:640,y:240}],b=[{from:"client",to:"cardA",label:"fetch card"},{from:"client",to:"cardB",label:"fetch card"},{from:"cardA",to:"agentA",label:"describes"},{from:"cardB",to:"agentB",label:"describes"},{from:"client",to:"agentA",label:"send task"},{from:"client",to:"agentB",label:"send task"},{from:"agentA",to:"taskA",label:"produces"},{from:"agentB",to:"taskB",label:"produces"},{from:"agentA",to:"client",label:"result/stream"},{from:"agentB",to:"client",label:"result/stream"}];function k(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Agent-to-Agent (A2A) Protocol"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Agent-to-Agent (A2A)"})," is an open protocol announced by Google in April 2025 and co-developed with 50+ technology partners. It defines how independent AI agents — potentially built on different frameworks and running at different vendors — discover each other, delegate tasks, exchange structured artifacts, and coordinate long-running workflows. Think of A2A as the HTTP of the multi-agent web."]}),e.jsx(r,{term:"Agent-to-Agent (A2A) Protocol",children:e.jsxs("p",{children:["A2A is a JSON/HTTP-based protocol with three core mechanisms:"," ",e.jsx("strong",{children:"Agent Cards"})," for discovery and capability advertisement,"," ",e.jsx("strong",{children:"Tasks"})," for delegating units of work with structured inputs and outputs, and ",e.jsx("strong",{children:"Streaming"})," (SSE) for long-running task progress. It is designed to be complementary to MCP: MCP connects agents to tools and data sources; A2A connects agents to other agents."]})}),e.jsx(a,{nodes:v,edges:b,title:"A2A Multi-Agent Topology"}),e.jsx("h2",{children:"Core Concepts"}),e.jsx("h3",{children:"Agent Card"}),e.jsxs("p",{children:["An ",e.jsx("strong",{children:"Agent Card"})," is a JSON document (served at"," ",e.jsx("code",{children:"/.well-known/agent.json"}),") that describes an agent's identity, capabilities, supported input/output modalities, authentication requirements, and endpoint URL. Client agents fetch cards to decide whether to delegate a task to a remote agent."]}),e.jsx(t,{title:"Example Agent Card",tabs:{json:`{
  "name": "Data Analysis Agent",
  "description": "Analyses CSV/JSON datasets, produces charts and statistical summaries.",
  "url": "https://data-agent.example.com/a2a",
  "version": "1.2.0",
  "provider": {
    "organization": "Acme AI",
    "url": "https://acme.ai"
  },
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": false
  },
  "authentication": {
    "schemes": ["Bearer"]
  },
  "defaultInputModes": ["application/json", "text/plain"],
  "defaultOutputModes": ["application/json", "image/png"],
  "skills": [
    {
      "id": "csv-summary",
      "name": "CSV Summary",
      "description": "Compute descriptive statistics for a CSV file.",
      "tags": ["statistics", "data", "csv"],
      "examples": ["Summarise sales.csv", "What are the top 10 rows by revenue?"]
    },
    {
      "id": "time-series-chart",
      "name": "Time Series Chart",
      "description": "Generate a line chart from time-series data.",
      "tags": ["visualization", "chart"],
      "inputModes": ["application/json"],
      "outputModes": ["image/png"]
    }
  ]
}`}}),e.jsx("h3",{children:"Tasks"}),e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Task"})," is the fundamental unit of work in A2A. A client agent sends a ",e.jsx("code",{children:"tasks/send"})," request with a unique task ID, a message (with parts — text, files, data), and optional metadata. The remote agent processes it and returns the result as an artifact."]}),e.jsx(t,{title:"A2A task lifecycle (HTTP)",tabs:{bash:`# 1. Discover the agent
curl https://data-agent.example.com/.well-known/agent.json

# 2. Send a task
curl -X POST https://data-agent.example.com/a2a \\
  -H "Authorization: Bearer $AGENT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tasks/send",
    "params": {
      "id": "task-abc-123",
      "message": {
        "role": "user",
        "parts": [
          {"type": "text", "text": "Summarise the attached CSV."},
          {"type": "file", "file": {"mimeType": "text/csv", "data": "<base64>"}}
        ]
      }
    }
  }'

# 3. Poll for status (or use streaming)
curl -X POST https://data-agent.example.com/a2a \\
  -H "Authorization: Bearer $AGENT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tasks/get",
    "params": {"id": "task-abc-123"}
  }'`,python:`import httpx, json, uuid

AGENT_URL = "https://data-agent.example.com/a2a"
HEADERS   = {"Authorization": "Bearer my-token", "Content-Type": "application/json"}

task_id = str(uuid.uuid4())

# Send a task
send_payload = {
    "jsonrpc": "2.0", "id": 1, "method": "tasks/send",
    "params": {
        "id": task_id,
        "message": {
            "role": "user",
            "parts": [{"type": "text", "text": "What are the top 5 products by revenue?"}]
        }
    }
}
with httpx.Client() as client:
    resp = client.post(AGENT_URL, json=send_payload, headers=HEADERS)
    result = resp.json()
    print("Status:", result["result"]["status"]["state"])

    # Poll until done
    import time
    while result["result"]["status"]["state"] not in ("completed", "failed", "canceled"):
        time.sleep(1)
        get_payload = {"jsonrpc": "2.0", "id": 2, "method": "tasks/get",
                       "params": {"id": task_id}}
        resp = client.post(AGENT_URL, json=get_payload, headers=HEADERS)
        result = resp.json()

    task = result["result"]
    if task["status"]["state"] == "completed":
        for artifact in task.get("artifacts", []):
            for part in artifact.get("parts", []):
                if part["type"] == "text":
                    print(part["text"])`}}),e.jsx("h3",{children:"Streaming with SSE"}),e.jsxs("p",{children:["For long-running tasks, use ",e.jsx("code",{children:"tasks/sendSubscribe"})," to receive incremental updates via Server-Sent Events as the remote agent streams its output."]}),e.jsx(t,{title:"Streaming task subscription",tabs:{python:`import httpx, json, uuid

AGENT_URL = "https://data-agent.example.com/a2a"
HEADERS   = {"Authorization": "Bearer my-token", "Content-Type": "application/json"}

task_id = str(uuid.uuid4())
payload = {
    "jsonrpc": "2.0", "id": 1, "method": "tasks/sendSubscribe",
    "params": {
        "id": task_id,
        "message": {
            "role": "user",
            "parts": [{"type": "text", "text": "Generate a 1-page market analysis report."}]
        }
    }
}

with httpx.Client(timeout=None) as client:
    with client.stream("POST", AGENT_URL, json=payload, headers=HEADERS) as resp:
        for line in resp.iter_lines():
            if line.startswith("data:"):
                event = json.loads(line[5:].strip())
                # Each event is a TaskStatusUpdateEvent or TaskArtifactUpdateEvent
                if "status" in event:
                    print(f"[{event['status']['state']}]", end="", flush=True)
                if "artifact" in event:
                    for part in event["artifact"].get("parts", []):
                        if part["type"] == "text":
                            print(part["text"], end="", flush=True)`,typescript:`async function streamTask(prompt: string): Promise<void> {
  const taskId = crypto.randomUUID();
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "tasks/sendSubscribe",
    params: {
      id: taskId,
      message: {
        role: "user",
        parts: [{ type: "text", text: prompt }],
      },
    },
  };

  const response = await fetch("https://data-agent.example.com/a2a", {
    method: "POST",
    headers: {
      Authorization: "Bearer my-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split("\\n")) {
      if (line.startsWith("data:")) {
        const event = JSON.parse(line.slice(5).trim());
        if (event.artifact) {
          for (const part of event.artifact.parts ?? []) {
            if (part.type === "text") process.stdout.write(part.text);
          }
        }
      }
    }
  }
}

await streamTask("Generate a 1-page market analysis report.");`}}),e.jsx("h2",{children:"A2A vs MCP — Choosing the Right Protocol"}),e.jsx(i,{name:"A2A + MCP Together",children:e.jsxs("p",{children:["A2A and MCP are designed to work together. An orchestrator agent uses"," ",e.jsx("strong",{children:"A2A to delegate tasks to specialised remote agents"}),". Each remote agent uses ",e.jsx("strong",{children:"MCP to access its tools and data sources"}),"(databases, APIs, file systems). The two protocols operate at different layers: A2A is agent-to-agent communication; MCP is agent-to-tool communication."]})}),e.jsx(t,{title:"A2A vs MCP at a glance",tabs:{text:`╔══════════════════╦════════════════════════════╦════════════════════════════╗
║ Dimension        ║ MCP                        ║ A2A                        ║
╠══════════════════╬════════════════════════════╬════════════════════════════╣
║ Purpose          ║ Connect agent to tools     ║ Connect agents to agents   ║
║ Initiated by     ║ Agent (client)             ║ Agent (client)             ║
║ Remote entity    ║ Tool / data server         ║ Another AI agent           ║
║ Transport        ║ stdio, HTTP+SSE, WebSocket ║ HTTP+SSE (JSON-RPC 2.0)   ║
║ Discovery        ║ None built-in              ║ Agent Cards (.well-known)  ║
║ Modalities       ║ Tools, Resources, Prompts  ║ Tasks, Artifacts, Streams  ║
║ Auth             ║ Per-server                 ║ Bearer / OAuth2            ║
║ State            ║ Stateless per call         ║ Stateful task lifecycle    ║
║ Typical use      ║ DB query, file read, API   ║ Delegate to expert agent   ║
╚══════════════════╩════════════════════════════╩════════════════════════════╝`}}),e.jsx(s,{title:"A2A Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"deterministic task IDs"})," (e.g. ",e.jsx("code",{children:"sha256(request_content)"}),") so you can safely retry without creating duplicate tasks."]}),e.jsxs("li",{children:["Always check ",e.jsx("code",{children:"capabilities.streaming"})," in the Agent Card before subscribing to SSE — fall back to polling if not supported."]}),e.jsxs("li",{children:["Implement ",e.jsx("strong",{children:"task cancellation"})," (",e.jsx("code",{children:"tasks/cancel"}),") in your orchestrator for timeout handling and user interruption."]}),e.jsx("li",{children:"Cache Agent Cards with a short TTL (5–15 minutes) to avoid hammering discovery endpoints."}),e.jsx("li",{children:"Validate remote agents' Agent Cards against a whitelist before delegating sensitive tasks."})]})}),e.jsxs(n,{children:["The A2A Python and TypeScript SDKs are available at"," ",e.jsx("strong",{children:"github.com/google/A2A"}),". The spec and reference implementations are maintained by Google and the A2A community. As of mid-2025, AWS, Microsoft, SAP, and Salesforce have announced A2A support in their agent platforms."]})]})}const W=Object.freeze(Object.defineProperty({__proto__:null,default:k},Symbol.toStringTag,{value:"Module"}));function j(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Implementing A2A Agents"}),e.jsx("p",{children:"This section walks through building a complete A2A-compatible agent server and an orchestrator that delegates tasks to it, using the official Python and TypeScript SDKs from the A2A open-source project."}),e.jsx("h2",{children:"Installing the A2A SDK"}),e.jsx(t,{title:"A2A SDK setup",tabs:{bash:`# Python A2A SDK (from the google/A2A repo)
pip install a2a-sdk

# TypeScript A2A SDK
npm install @google/a2a`}}),e.jsx("h2",{children:"Building an A2A Agent Server"}),e.jsx(t,{title:"Complete A2A agent server (Python)",tabs:{python:`import asyncio, uuid
from a2a.server import A2AServer, AgentCard, AgentSkill, AgentCapabilities
from a2a.types import Task, TaskStatus, TaskState, Message, TextPart, Artifact
import anthropic

# ── Agent Card ──────────────────────────────────────────────────────────────
card = AgentCard(
    name="Summarisation Agent",
    description="Summarises text documents using Claude.",
    url="http://localhost:9000",
    version="1.0.0",
    capabilities=AgentCapabilities(streaming=True),
    skills=[
        AgentSkill(
            id="summarise",
            name="Summarise Text",
            description="Produce a concise summary of a document.",
            tags=["summarisation", "nlp"],
            examples=["Summarise this article in 3 bullet points."],
        )
    ],
)

# ── Task Handler ─────────────────────────────────────────────────────────────
claude = anthropic.Anthropic()

async def handle_task(task: Task):
    """Process an incoming A2A task and yield status/artifact updates."""
    # Extract text from the incoming message parts
    user_text = " ".join(
        p.text for p in task.message.parts if isinstance(p, TextPart)
    )

    # Stream Claude's response
    full_text = ""
    with claude.messages.stream(
        model="claude-opus-4-6",
        max_tokens=512,
        messages=[
            {"role": "system", "content": "You are a concise summarisation agent."},
            {"role": "user", "content": f"Summarise the following:\\n\\n{user_text}"},
        ],
    ) as stream:
        for chunk in stream.text_stream:
            full_text += chunk
            # Yield incremental artifact updates
            yield TaskStatus(state=TaskState.working), Artifact(
                parts=[TextPart(text=full_text)], index=0, append=True
            )

    # Final completed status
    yield TaskStatus(state=TaskState.completed), Artifact(
        parts=[TextPart(text=full_text)], index=0, lastChunk=True
    )

# ── Run Server ───────────────────────────────────────────────────────────────
server = A2AServer(agent_card=card, handle_task=handle_task, port=9000)

if __name__ == "__main__":
    asyncio.run(server.start())`}}),e.jsx("h2",{children:"Building an A2A Orchestrator"}),e.jsx(t,{title:"Orchestrator agent that delegates to remote agents",tabs:{python:`import asyncio
from a2a.client import A2AClient

async def orchestrate(documents: list[str]) -> list[str]:
    """Delegate summarisation of each document to the remote A2A agent."""
    async with A2AClient.from_agent_card_url(
        "http://localhost:9000/.well-known/agent.json"
    ) as client:
        summaries = []
        for doc in documents:
            # Stream the task
            full_summary = ""
            async for update in client.send_task_streaming(
                message={"role": "user", "parts": [{"type": "text", "text": doc}]}
            ):
                if update.artifact:
                    for part in update.artifact.parts:
                        if part.type == "text":
                            full_summary = part.text   # replace (append=True means incremental)
            summaries.append(full_summary)
        return summaries

docs = [
    "The Anthropic Model Context Protocol (MCP) ...",
    "Google's Agent-to-Agent (A2A) protocol ...",
]
results = asyncio.run(orchestrate(docs))
for r in results:
    print("---")
    print(r)`,typescript:`import { A2AClient } from "@google/a2a";

async function orchestrate(documents: string[]): Promise<string[]> {
  const client = await A2AClient.fromAgentCardUrl(
    "http://localhost:9000/.well-known/agent.json"
  );

  const summaries: string[] = [];

  for (const doc of documents) {
    let summary = "";
    const stream = client.sendTaskStreaming({
      message: { role: "user", parts: [{ type: "text", text: doc }] },
    });

    for await (const update of stream) {
      if (update.artifact) {
        for (const part of update.artifact.parts ?? []) {
          if (part.type === "text") summary = part.text;
        }
      }
    }
    summaries.push(summary);
  }

  await client.close();
  return summaries;
}

const summaries = await orchestrate([
  "The Anthropic Model Context Protocol (MCP) ...",
  "Google's Agent-to-Agent (A2A) protocol ...",
]);
summaries.forEach((s) => console.log("---\\n" + s));`}}),e.jsx("h2",{children:"Multi-Agent Pipeline with A2A"}),e.jsxs("p",{children:["A common pattern is a ",e.jsx("strong",{children:"pipeline orchestrator"})," that fans out tasks to specialised agents and aggregates results — a research agent, an analysis agent, and a writing agent working in sequence."]}),e.jsx(t,{title:"Fan-out orchestration",tabs:{python:`import asyncio
from a2a.client import A2AClient

AGENTS = {
    "research": "http://research-agent.internal/.well-known/agent.json",
    "analysis": "http://analysis-agent.internal/.well-known/agent.json",
    "writer":   "http://writer-agent.internal/.well-known/agent.json",
}

async def run_pipeline(topic: str) -> str:
    # Step 1: Research (parallel sub-tasks could be added here)
    async with A2AClient.from_agent_card_url(AGENTS["research"]) as client:
        research_result = await client.send_task(
            message={"role": "user", "parts": [{"type": "text",
                "text": f"Research the latest developments in: {topic}"}]}
        )
    research_text = _extract_text(research_result)

    # Step 2: Analysis
    async with A2AClient.from_agent_card_url(AGENTS["analysis"]) as client:
        analysis_result = await client.send_task(
            message={"role": "user", "parts": [{"type": "text",
                "text": f"Analyse this research:\\n{research_text}"}]}
        )
    analysis_text = _extract_text(analysis_result)

    # Step 3: Writing
    async with A2AClient.from_agent_card_url(AGENTS["writer"]) as client:
        final_result = await client.send_task(
            message={"role": "user", "parts": [{"type": "text",
                "text": f"Write a 500-word report based on:\\n{analysis_text}"}]}
        )
    return _extract_text(final_result)

def _extract_text(task) -> str:
    for artifact in (task.artifacts or []):
        for part in artifact.parts:
            if part.type == "text":
                return part.text
    return ""

report = asyncio.run(run_pipeline("quantum computing in 2025"))
print(report)`}}),e.jsx("h2",{children:"Push Notifications"}),e.jsx("p",{children:"For long-running tasks that may take minutes or hours, use A2A's push notification capability. The client registers a webhook; the server POSTs status updates as they occur."}),e.jsx(t,{title:"Push notification subscription",tabs:{python:`from a2a.client import A2AClient, PushNotificationConfig

async def submit_with_webhook(task_text: str):
    async with A2AClient.from_agent_card_url(
        "http://analysis-agent.internal/.well-known/agent.json"
    ) as client:
        task_id = await client.send_task_with_push(
            message={"role": "user", "parts": [{"type": "text", "text": task_text}]},
            push_config=PushNotificationConfig(
                url="https://my-app.example.com/webhooks/a2a",
                token="webhook-secret-abc",
            ),
        )
        print(f"Task submitted: {task_id} — webhook will receive updates.")`,bash:`# Your webhook endpoint receives POSTs like:
# {
#   "id": "task-abc-123",
#   "status": {"state": "completed"},
#   "artifacts": [{"parts": [{"type": "text", "text": "..."}]}]
# }`}}),e.jsx(l,{title:"Inter-Agent Trust",severity:"high",children:e.jsx("p",{children:"When your orchestrator delegates to remote agents, validate their Agent Cards against an allowlist of trusted domains. Use mutual TLS or signed tokens to authenticate both sides. Never delegate tasks containing credentials, PII, or proprietary data to agents you don't control. Always set task timeouts and implement cancellation."})}),e.jsx(i,{name:"Idempotent Task IDs",children:e.jsxs("p",{children:["Generate task IDs deterministically from the task content (e.g."," ",e.jsx("code",{children:"sha256(agent_url + task_payload)"}),"). This lets you safely retry failed requests without accidentally creating duplicate tasks on the remote agent."]})}),e.jsx(s,{title:"A2A Implementation Checklist",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Serve your Agent Card at ",e.jsx("code",{children:"/.well-known/agent.json"})," with correct CORS headers."]}),e.jsxs("li",{children:["Implement ",e.jsx("code",{children:"tasks/cancel"})," — orchestrators rely on it for timeouts."]}),e.jsxs("li",{children:["Validate ",e.jsx("code",{children:"Authorization"})," headers on every request to your agent server."]}),e.jsxs("li",{children:["Return ",e.jsx("code",{children:"TaskState.failed"})," with a descriptive error message rather than returning HTTP 500."]}),e.jsxs("li",{children:["Test with the A2A Inspector CLI: ",e.jsx("code",{children:"npx @google/a2a-inspector http://localhost:9000"}),"."]})]})})]})}const H=Object.freeze(Object.defineProperty({__proto__:null,default:j},Symbol.toStringTag,{value:"Module"})),S=[{id:"runner",label:"ADK Runner",type:"agent",x:60,y:150},{id:"agent",label:"Root Agent",type:"llm",x:230,y:150},{id:"sub1",label:`Sub-Agent
(Research)`,type:"llm",x:420,y:80},{id:"sub2",label:`Sub-Agent
(Writing)`,type:"llm",x:420,y:220},{id:"tool1",label:"Google Search",type:"tool",x:600,y:60},{id:"tool2",label:"Code Exec",type:"tool",x:600,y:140},{id:"tool3",label:"Custom Tool",type:"tool",x:600,y:220},{id:"session",label:"Session / Memory",type:"store",x:230,y:280}],w=[{from:"runner",to:"agent",label:"run()"},{from:"agent",to:"sub1",label:"delegate"},{from:"agent",to:"sub2",label:"delegate"},{from:"sub1",to:"tool1",label:"call"},{from:"sub1",to:"tool2",label:"call"},{from:"sub2",to:"tool3",label:"call"},{from:"agent",to:"session",label:"state"},{from:"runner",to:"session",label:"persist"}];function C(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Google Agent Development Kit (ADK)"}),e.jsxs("p",{children:["The ",e.jsx("strong",{children:"Google Agent Development Kit (ADK)"})," is an open-source Python framework (Apache 2.0) released in April 2025. It is optimised for Gemini models but model-agnostic — you can plug in OpenAI, Anthropic, or any LiteLLM-compatible model. ADK makes it straightforward to build ",e.jsx("strong",{children:"multi-agent pipelines"})," ","with built-in session management, streaming, tool execution, evaluation, and deployment to Google Cloud Agent Engine."]}),e.jsx(r,{term:"Google ADK",children:e.jsxs("p",{children:["ADK structures agentic applications around three primitives:"," ",e.jsx("strong",{children:"Agents"})," (LLM-powered decision makers),"," ",e.jsx("strong",{children:"Tools"})," (Python functions, other agents, MCP servers), and"," ",e.jsx("strong",{children:"Runners"})," (the execution engine that manages sessions and the tool-call loop). Agents can be composed into hierarchies — a root agent orchestrates specialised sub-agents, each with their own tools."]})}),e.jsx(a,{nodes:S,edges:w,title:"Google ADK Multi-Agent Architecture"}),e.jsx("h2",{children:"Installation"}),e.jsx(t,{title:"Install ADK",tabs:{bash:`pip install google-adk

# Optional extras
pip install google-adk[eval]     # evaluation tools
pip install google-adk[vertexai] # Vertex AI / Agent Engine deployment`}}),e.jsx("h2",{children:"Your First ADK Agent"}),e.jsx(t,{title:"Simple ADK agent with a custom tool",tabs:{python:`from google.adk.agents import LlmAgent
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

asyncio.run(main())`}}),e.jsx("h2",{children:"Multi-Agent Systems with ADK"}),e.jsx(t,{title:"Root agent orchestrating sub-agents",tabs:{python:`from google.adk.agents import LlmAgent
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
)`}}),e.jsx("h2",{children:"Built-in Tools"}),e.jsx(t,{title:"ADK built-in tools",tabs:{python:`from google.adk.agents import LlmAgent
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
)`}}),e.jsx("h2",{children:"Session State and Memory"}),e.jsx(t,{title:"Persistent session state",tabs:{python:`from google.adk.agents import LlmAgent
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
)`}}),e.jsx("h2",{children:"Deployment to Vertex AI Agent Engine"}),e.jsx(t,{title:"Deploy to Google Cloud",tabs:{python:`import vertexai
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
print(response)`,bash:`# Or use the ADK CLI
adk deploy cloud_run \\
  --project=my-gcp-project \\
  --region=us-central1 \\
  --agent_module=my_agent \\
  --service_name=my-adk-agent`}}),e.jsx("h2",{children:"ADK Dev UI"}),e.jsx(t,{title:"Local development with ADK web UI",tabs:{bash:`# Start the ADK web UI for interactive testing
adk web

# Or run in API-only mode
adk api_server

# The web UI at http://localhost:8000 lets you:
# - Chat with your agents
# - Inspect event streams (tool calls, sub-agent calls, state)
# - View session history
# - Evaluate agent responses`}}),e.jsx(s,{title:"Google ADK Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Set ",e.jsx("code",{children:"output_schema"})," (a Pydantic model) on agents that produce structured data — it enforces JSON output via constrained generation."]}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"SequentialAgent"})," or ",e.jsx("code",{children:"ParallelAgent"})," for deterministic pipelines instead of relying on LLM routing."]}),e.jsxs("li",{children:["Always pass ",e.jsx("code",{children:"app_name"})," and ",e.jsx("code",{children:"user_id"})," consistently — they key the session store."]}),e.jsxs("li",{children:["Enable ",e.jsx("code",{children:"enable_tracing=True"})," in production for Cloud Trace visibility."]}),e.jsxs("li",{children:["Pin your ADK version in ",e.jsx("code",{children:"requirements.txt"})," — the SDK is evolving rapidly."]})]})}),e.jsxs(n,{children:["ADK is available at ",e.jsx("strong",{children:"github.com/google/adk-python"})," and documented at ",e.jsx("strong",{children:"google.github.io/adk-docs"}),". The framework supports Gemini (native), LiteLLM (for any model), and Anthropic Claude directly via the LiteLLM adapter."]})]})}const V=Object.freeze(Object.defineProperty({__proto__:null,default:C},Symbol.toStringTag,{value:"Module"})),T=[{id:"app",label:"Your Application",type:"agent",x:60,y:150},{id:"svc",label:"Azure AI Agent Service",type:"llm",x:240,y:150},{id:"thread",label:"Thread (history)",type:"store",x:420,y:80},{id:"tools",label:"Built-in Tools",type:"tool",x:420,y:150},{id:"func",label:"Azure Functions",type:"tool",x:420,y:220},{id:"storage",label:"Azure Blob / AI Search",type:"store",x:620,y:80},{id:"bing",label:"Bing Search",type:"external",x:620,y:150},{id:"logic",label:"Custom Logic",type:"external",x:620,y:220}],I=[{from:"app",to:"svc",label:"SDK"},{from:"svc",to:"thread",label:"persist"},{from:"svc",to:"tools",label:"auto-call"},{from:"svc",to:"func",label:"function call"},{from:"tools",to:"storage",label:"RAG / files"},{from:"tools",to:"bing",label:"search"},{from:"func",to:"logic",label:"execute"}];function P(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Azure AI Agent Service"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Azure AI Agent Service"})," (generally available since early 2025) is Microsoft's fully managed platform for building and running production AI agents. It is compatible with the OpenAI Assistants API v2, so code written against OpenAI's SDK works with minimal changes. Agents run on Azure models (GPT-4o, Phi-4) or bring-your-own models from the Azure AI model catalogue, including Claude via Azure AI Foundry."]}),e.jsx(r,{term:"Azure AI Agent Service",children:e.jsxs("p",{children:["The service manages the agent lifecycle — thread storage, tool execution, and the run loop — as a fully managed cloud service. You define an agent's instructions and tools once; the service handles retry logic, auto-scaling, and Azure Monitor integration. Supported built-in tools include"," ",e.jsx("strong",{children:"file search"})," (RAG over uploaded documents),"," ",e.jsx("strong",{children:"code interpreter"})," (sandboxed Python), and"," ",e.jsx("strong",{children:"Bing grounding"})," (live web search)."]})}),e.jsx(a,{nodes:T,edges:I,title:"Azure AI Agent Service Architecture"}),e.jsx("h2",{children:"Installation & Auth"}),e.jsx(t,{title:"Setup",tabs:{bash:`pip install azure-ai-projects azure-identity

# Set environment variables
export AZURE_AI_PROJECT_ENDPOINT="https://<your-hub>.services.ai.azure.com/api/projects/<project-id>"
export AZURE_CLIENT_ID="..."
export AZURE_CLIENT_SECRET="..."
export AZURE_TENANT_ID="..."`}}),e.jsx("h2",{children:"Creating Your First Agent"}),e.jsx(t,{title:"Create and run an agent",tabs:{python:`import os, time
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
client.agents.delete_agent(agent.id)`,typescript:`import { AIProjectClient } from "@azure/ai-projects";
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

await client.agents.deleteAgent(agent.id);`}}),e.jsx("h2",{children:"File Search (RAG)"}),e.jsx(t,{title:"Agent with document search over uploaded files",tabs:{python:`from azure.ai.projects import AIProjectClient
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
        break`}}),e.jsx("h2",{children:"Code Interpreter"}),e.jsx(t,{title:"Agent with sandboxed Python execution",tabs:{python:`from azure.ai.projects.models import CodeInterpreterTool

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
                print("Chart saved to chart.png")`}}),e.jsx("h2",{children:"Function Calling (Custom Tools)"}),e.jsx(t,{title:"Custom function tools with Azure agents",tabs:{python:`from azure.ai.projects.models import FunctionTool, ToolSet
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
        break`}}),e.jsx("h2",{children:"Semantic Kernel Integration"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Semantic Kernel"})," is Microsoft's open-source orchestration SDK that provides agent abstractions, memory, plugins, and process (workflow) support. It integrates natively with Azure AI Agent Service for enterprise deployments."]}),e.jsx(t,{title:"Semantic Kernel agent with Azure AI",tabs:{python:`from semantic_kernel import Kernel
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
        thread = response.thread`,bash:"pip install semantic-kernel[azure]"}}),e.jsx(s,{title:"Azure AI Agent Service Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Use ",e.jsx("code",{children:"create_and_process_run"})," for simple flows; use ",e.jsx("code",{children:"create_run"})," + polling for fine-grained control and streaming."]}),e.jsx("li",{children:"Delete threads when done to avoid storage cost accumulation — they persist indefinitely by default."}),e.jsxs("li",{children:["Set ",e.jsx("code",{children:"truncation_strategy"})," on runs to control context-window usage in long conversations."]}),e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"Managed Identity"})," (",e.jsx("code",{children:"DefaultAzureCredential"}),") instead of API keys in production."]}),e.jsxs("li",{children:["Enable ",e.jsx("strong",{children:"Azure Monitor"})," diagnostics on your AI Foundry hub for run-level tracing."]})]})}),e.jsxs(n,{children:["Azure AI Agent Service is part of ",e.jsx("strong",{children:"Azure AI Foundry"}),". The Python SDK is ",e.jsx("code",{children:"azure-ai-projects"}),"; the TypeScript SDK is ",e.jsx("code",{children:"@azure/ai-projects"}),". Semantic Kernel (",e.jsx("code",{children:"semantic-kernel"}),") adds higher-level orchestration, process (workflow), and memory abstractions on top."]})]})}const Y=Object.freeze(Object.defineProperty({__proto__:null,default:P},Symbol.toStringTag,{value:"Module"})),D=[{id:"app",label:"Python App",type:"agent",x:60,y:150},{id:"agent",label:"Strands Agent",type:"llm",x:230,y:150},{id:"model",label:`Bedrock Model
(Claude / Nova)`,type:"llm",x:420,y:60},{id:"tools",label:"Tool Registry",type:"tool",x:420,y:150},{id:"memory",label:"Memory Store",type:"store",x:420,y:240},{id:"aws",label:`AWS Services
(S3, Lambda…)`,type:"external",x:620,y:150}],M=[{from:"app",to:"agent",label:"agent()"},{from:"agent",to:"model",label:"converse"},{from:"agent",to:"tools",label:"dispatch"},{from:"agent",to:"memory",label:"read/write"},{from:"tools",to:"aws",label:"call"},{from:"model",to:"agent",label:"response"}];function E(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"AWS Agent Frameworks"}),e.jsxs("p",{children:["AWS offers two complementary approaches to building AI agents:"," ",e.jsx("strong",{children:"Amazon Strands Agents SDK"})," — a lightweight open-source Python framework for code-first agent development — and"," ",e.jsx("strong",{children:"Amazon Bedrock Agents"})," — a fully managed service that handles orchestration, RAG, and action groups without writing a loop yourself."]}),e.jsx("h2",{children:"Amazon Strands Agents SDK"}),e.jsx(r,{term:"Amazon Strands Agents SDK",children:e.jsxs("p",{children:["Strands (open-sourced by AWS in May 2025) takes a model-driven approach: define tools as Python functions decorated with ",e.jsx("code",{children:"@tool"}),", pass them to an"," ",e.jsx("code",{children:"Agent"}),", and call the agent like a function. Strands drives the agentic loop via Bedrock's ",e.jsx("code",{children:"converse"})," API, supports streaming, multi-agent orchestration, and integrates with MCP servers natively. It works with any Bedrock-hosted model (Claude, Nova, Llama, Mistral, etc.)."]})}),e.jsx(a,{nodes:D,edges:M,title:"Strands Agent Architecture"}),e.jsx("h2",{children:"Strands — Installation & First Agent"}),e.jsx(t,{title:"Install and run a Strands agent",tabs:{bash:`pip install strands-agents strands-agents-tools

# Configure AWS credentials (or use IAM roles in production)
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1`,python:`from strands import Agent, tool

# ── Define tools ──────────────────────────────────────────────────────────
@tool
def get_weather(city: str) -> str:
    """Return current weather conditions for a city."""
    # In production: call a weather API
    return f"Weather in {city}: 18°C, partly cloudy."

@tool
def create_calendar_event(title: str, date: str, duration_minutes: int) -> str:
    """Create a calendar event and return its ID."""
    import uuid
    event_id = str(uuid.uuid4())[:8]
    return f"Event '{title}' created on {date} ({duration_minutes} min). ID: {event_id}"

# ── Create the agent ──────────────────────────────────────────────────────
agent = Agent(
    model="us.anthropic.claude-opus-4-6-v1:0",  # Bedrock model ID
    tools=[get_weather, create_calendar_event],
    system_prompt="You are a helpful assistant that checks weather and manages calendars.",
)

# ── Run (synchronous) ─────────────────────────────────────────────────────
response = agent("Schedule a picnic in London for tomorrow afternoon if it's not raining.")
print(response)`}}),e.jsx("h2",{children:"Strands — Streaming & Async"}),e.jsx(t,{title:"Streaming responses",tabs:{python:`from strands import Agent
import asyncio

agent = Agent(model="us.anthropic.claude-opus-4-6-v1:0")

# Synchronous streaming
for event in agent.stream_async("Explain quantum entanglement in simple terms."):
    if "data" in event and "text" in event["data"]:
        print(event["data"]["text"], end="", flush=True)

# Async usage
async def run():
    result = await agent.run_async("Write a short poem about AWS.")
    print(result)

asyncio.run(run())`}}),e.jsx("h2",{children:"Strands — Multi-Agent Orchestration"}),e.jsx(t,{title:"Sub-agents as tools",tabs:{python:`from strands import Agent, tool

# ── Specialist agents ─────────────────────────────────────────────────────
research_agent = Agent(
    model="us.anthropic.claude-opus-4-6-v1:0",
    system_prompt="You are a research specialist. Find and summarise information.",
)

code_agent = Agent(
    model="us.anthropic.claude-opus-4-6-v1:0",
    system_prompt="You write clean, well-tested Python code.",
)

# ── Wrap sub-agents as tools for the orchestrator ─────────────────────────
@tool
def research(topic: str) -> str:
    """Research a topic and return a structured summary."""
    return str(research_agent(f"Research: {topic}"))

@tool
def write_code(task_description: str) -> str:
    """Write Python code for the given task."""
    return str(code_agent(task_description))

# ── Orchestrator ──────────────────────────────────────────────────────────
orchestrator = Agent(
    model="us.anthropic.claude-opus-4-6-v1:0",
    tools=[research, write_code],
    system_prompt="Coordinate research and coding to solve complex tasks.",
)

result = orchestrator(
    "Build a Python script that fetches the top 10 Hacker News stories."
)
print(result)`}}),e.jsx("h2",{children:"Strands — MCP Integration"}),e.jsx(t,{title:"Using MCP servers with Strands",tabs:{python:`from strands import Agent
from strands.tools.mcp import MCPClient
from mcp import StdioServerParameters

# Connect to an MCP server (filesystem example)
mcp_client = MCPClient(
    lambda: stdio_client(
        StdioServerParameters(
            command="npx",
            args=["-y", "@modelcontextprotocol/server-filesystem", "/home/user/docs"]
        )
    )
)

with mcp_client:
    agent = Agent(
        model="us.anthropic.claude-opus-4-6-v1:0",
        tools=mcp_client.list_tools_sync(),
    )
    result = agent("List all PDF files in /home/user/docs and summarise the first one.")
    print(result)`}}),e.jsx("h2",{children:"Amazon Bedrock Agents (Managed Service)"}),e.jsx(r,{term:"Amazon Bedrock Agents",children:e.jsxs("p",{children:["Bedrock Agents is a fully managed service where you configure an agent through the AWS Console or API — no orchestration loop to write. You define"," ",e.jsx("strong",{children:"action groups"})," (Lambda functions or OpenAPI schemas),"," ",e.jsx("strong",{children:"knowledge bases"})," (RAG over S3 documents via OpenSearch or Aurora), and ",e.jsx("strong",{children:"guardrails"}),". AWS manages invocation, retries, and audit logging."]})}),e.jsx(t,{title:"Invoke a Bedrock Agent from code",tabs:{python:`import boto3, json

bedrock_runtime = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

response = bedrock_runtime.invoke_agent(
    agentId="ABCD1234EF",       # from AWS Console
    agentAliasId="TSTALIASID",  # use DRAFT during development
    sessionId="user-session-42",
    inputText="What are the key findings from the Q3 earnings report?",
)

# Stream the response
full_response = ""
for event in response["completion"]:
    if "chunk" in event:
        chunk = event["chunk"]["bytes"].decode("utf-8")
        full_response += chunk
        print(chunk, end="", flush=True)

print()  # newline`,typescript:`import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

const command = new InvokeAgentCommand({
  agentId: "ABCD1234EF",
  agentAliasId: "TSTALIASID",
  sessionId: "user-session-42",
  inputText: "What are the key findings from the Q3 earnings report?",
});

const response = await client.send(command);
let fullText = "";

for await (const event of response.completion ?? []) {
  if (event.chunk?.bytes) {
    const chunk = new TextDecoder().decode(event.chunk.bytes);
    fullText += chunk;
    process.stdout.write(chunk);
  }
}
console.log();`}}),e.jsx("h2",{children:"Bedrock Agents — Action Groups"}),e.jsx(t,{title:"Lambda action group for Bedrock Agents",tabs:{python:`# Lambda function that handles tool calls from Bedrock Agents
import json

def lambda_handler(event, context):
    """Bedrock Agents invokes this Lambda for action group calls."""
    action_group = event["actionGroup"]
    function = event["function"]
    parameters = {p["name"]: p["value"] for p in event.get("parameters", [])}

    # Route to the right handler
    if function == "get_order_status":
        order_id = parameters["order_id"]
        # Query your OMS
        result = {"status": "shipped", "eta": "2025-03-18", "carrier": "FedEx"}
        response_body = {"application/json": {"body": json.dumps(result)}}
    elif function == "cancel_order":
        order_id = parameters["order_id"]
        response_body = {"application/json": {"body": json.dumps({"cancelled": True})}}
    else:
        response_body = {"application/json": {"body": json.dumps({"error": "unknown function"})}}

    return {
        "messageVersion": "1.0",
        "response": {
            "actionGroup": action_group,
            "function": function,
            "functionResponse": {"responseBody": response_body},
        },
    }`,json:`// OpenAPI schema for the action group (alternative to Lambda)
{
  "openapi": "3.0.0",
  "info": {"title": "Order API", "version": "1.0.0"},
  "paths": {
    "/orders/{order_id}": {
      "get": {
        "summary": "Get order status",
        "operationId": "get_order_status",
        "parameters": [{
          "name": "order_id",
          "in": "path",
          "required": true,
          "schema": {"type": "string"}
        }],
        "responses": {
          "200": {
            "description": "Order status",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {"type": "string"},
                    "eta": {"type": "string"}
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`}}),e.jsx("h2",{children:"Strands vs Bedrock Agents — When to Use Each"}),e.jsx(t,{title:"Decision guide",tabs:{text:`╔════════════════════════╦═══════════════════════╦════════════════════════╗
║ Factor                 ║ Strands (SDK)         ║ Bedrock Agents (managed)║
╠════════════════════════╬═══════════════════════╬════════════════════════╣
║ Setup effort           ║ Low (pip install)     ║ Medium (console config)║
║ Customisation          ║ Full Python control   ║ Limited to config      ║
║ Multi-agent            ║ Built-in              ║ Via inline agents      ║
║ RAG / knowledge base   ║ DIY (LlamaIndex etc.) ║ Managed (S3 + search)  ║
║ Infra management       ║ Self-hosted           ║ Fully managed by AWS   ║
║ Best for               ║ Code-first devs       ║ Low-ops teams          ║
╚════════════════════════╩═══════════════════════╩════════════════════════╝`}}),e.jsx(s,{title:"AWS Agent Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Strands:"})," use ",e.jsx("code",{children:"@tool"})," with detailed docstrings — they become the tool descriptions Claude uses for routing decisions."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Strands:"})," set ",e.jsx("code",{children:"max_parallel_tools"})," on the agent to control concurrency when multiple tools can run simultaneously."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Bedrock Agents:"})," always version your agent aliases — never point production traffic at the ",e.jsx("code",{children:"DRAFT"})," alias."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Bedrock Agents:"})," enable ",e.jsx("strong",{children:"CloudWatch logging"})," and ",e.jsx("strong",{children:"session metadata"})," for audit compliance."]}),e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"IAM roles with least privilege"})," for both Strands (Bedrock API calls) and Lambda action groups."]})]})}),e.jsxs(n,{children:["Amazon Strands Agents SDK is available at"," ",e.jsx("strong",{children:"github.com/strands-agents/sdk-python"})," and documented at"," ",e.jsx("strong",{children:"strandsagents.com"}),". Amazon Bedrock Agents is documented in the"," ",e.jsx("strong",{children:"AWS Bedrock developer guide"}),". Both support Claude models via Amazon Bedrock's cross-region inference profiles."]})]})}const J=Object.freeze(Object.defineProperty({__proto__:null,default:E},Symbol.toStringTag,{value:"Module"}));function R(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Azure AI SDK for Python"}),e.jsxs("p",{children:["Microsoft provides two primary Python SDKs for AI on Azure: the ",e.jsx("strong",{children:"openai"})," package with Azure configuration (for Azure OpenAI Service), and the ",e.jsx("strong",{children:"azure-ai-inference"}),"package (for Azure AI Foundry model catalog — Phi, Llama, Mistral, etc. with a unified API). Both use Azure Identity for keyless authentication via managed identity."]}),e.jsx(r,{term:"Azure AI Inference SDK",children:e.jsxs("p",{children:["The ",e.jsx("code",{children:"azure-ai-inference"})," SDK provides a unified client for all models deployed to Azure AI Foundry endpoints — regardless of whether they're OpenAI models, Phi-3, Llama 3, Mistral, or Command R+. It uses the same request/response schema as OpenAI's chat completions API but works with any provider-agnostic endpoint. This makes it easy to switch models without changing application code."]})}),e.jsx("h2",{children:"Installation"}),e.jsx(o,{language:"bash",filename:"install.sh",children:`# Azure OpenAI (uses the openai package with Azure config)
pip install openai azure-identity

# Azure AI Inference SDK (model catalog / Foundry endpoints)
pip install azure-ai-inference azure-identity

# Azure AI Search (for RAG retrieval)
pip install azure-search-documents azure-identity

# Azure AI Agent Service
pip install azure-ai-projects azure-identity`}),e.jsx("h2",{children:"Authentication: DefaultAzureCredential"}),e.jsxs("p",{children:[e.jsx("code",{children:"DefaultAzureCredential"})," automatically picks the right authentication method based on the environment: Managed Identity in production (Azure VMs, App Service, AKS), Azure CLI locally during development, environment variables in CI/CD. This eliminates the need to manage API keys."]}),e.jsx(o,{language:"python",filename:"auth_setup.py",children:`from azure.identity import DefaultAzureCredential, get_bearer_token_provider
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
    project_client.agents.delete_agent(agent.id)`}}),e.jsx("h2",{children:"Azure AI Search Integration"}),e.jsx(o,{language:"python",filename:"azure_search_rag.py",children:`from azure.search.documents import SearchClient
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
index_client.create_or_update_index(index)`}),e.jsx(s,{title:"Use azure-ai-inference for Model Portability",children:e.jsxs("p",{children:["Prefer the ",e.jsx("code",{children:"azure-ai-inference"})," SDK over hardcoding OpenAI-specific API calls when targeting Azure AI Foundry. It works identically across GPT-4o, Phi-4, Llama 3.1, and Mistral Large — letting you A/B test models by changing a single ",e.jsx("code",{children:"model="}),"parameter. For OpenAI-specific features (DALL-E, Whisper, Assistants), use the",e.jsx("code",{children:"openai"})," package with Azure configuration."]})}),e.jsx(n,{type:"warning",title:"API Version Pinning",children:e.jsxs("p",{children:["Azure OpenAI's ",e.jsx("code",{children:"api_version"})," parameter is mandatory and new features (like structured outputs, o1 reasoning effort, etc.) are only available in specific versions. Always pin to a specific API version (e.g., ",e.jsx("code",{children:"2024-10-21"}),") and test upgrades explicitly. Breaking changes can occur between versions."]})})]})}const Q=Object.freeze(Object.defineProperty({__proto__:null,default:R},Symbol.toStringTag,{value:"Module"}));function L(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"AWS SDK for Amazon Bedrock"}),e.jsxs("p",{children:["Amazon Bedrock is accessed through ",e.jsx("strong",{children:"boto3"})," — AWS's Python SDK. Bedrock exposes three main service clients: ",e.jsx("code",{children:"bedrock"})," (management),",e.jsx("code",{children:"bedrock-runtime"})," (model invocation), and ",e.jsx("code",{children:"bedrock-agent-runtime"}),"(agent invocation and knowledge base retrieval). The Converse API in bedrock-runtime is the recommended interface for all chat-style interactions."]}),e.jsx(r,{term:"Converse API",children:e.jsxs("p",{children:["The Converse API is Bedrock's unified, model-agnostic chat interface. Unlike the older",e.jsx("code",{children:"invoke_model"})," API (which requires model-specific JSON payloads), Converse uses a consistent request schema across all supported models — Claude, Llama, Mistral, Nova, and others. It natively supports tool use, conversation history, streaming, and system prompts without per-model format juggling."]})}),e.jsx("h2",{children:"Installation and Configuration"}),e.jsx(o,{language:"bash",filename:"install.sh",children:`# boto3 is the AWS SDK for Python
pip install boto3

# For async/streaming in async frameworks
pip install aioboto3  # Async boto3

# AWS CLI for credential configuration
pip install awscli
aws configure  # Sets up ~/.aws/credentials and ~/.aws/config`}),e.jsx(o,{language:"python",filename:"bedrock_client_setup.py",children:`import boto3

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
    }`}}),e.jsx("h2",{children:"Working with Model Responses and Token Usage"}),e.jsx(o,{language:"python",filename:"bedrock_usage_tracking.py",children:`import boto3
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
    return response["output"]["message"]["content"][0]["text"]`}),e.jsx(s,{title:"Use IAM Roles, Not Access Keys",children:e.jsxs("p",{children:["Never hardcode AWS access keys. In AWS (EC2, ECS, Lambda, EKS), use IAM roles with the principle of least privilege: grant only ",e.jsx("code",{children:"bedrock:InvokeModel"})," on specific model ARNs. Locally, use ",e.jsx("code",{children:"aws sso login"})," or named profiles. Enable CloudTrail to audit every model invocation — you'll get the model ID, input token count, and requester identity for compliance and cost allocation."]})}),e.jsx(n,{type:"tip",title:"Converse vs. invoke_model",children:e.jsxs("p",{children:["Prefer the Converse API for all new development — it handles tool use, multi-turn conversation, and streaming with a single consistent API across all models. Use ",e.jsx("code",{children:"invoke_model"})," only for models not yet supported by Converse (check AWS docs for current support list) or when you need model-specific features not exposed via Converse."]})})]})}const Z=Object.freeze(Object.defineProperty({__proto__:null,default:L},Symbol.toStringTag,{value:"Module"}));function z(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Google Cloud AI Platform SDK (Vertex AI)"}),e.jsxs("p",{children:["Google provides the ",e.jsx("strong",{children:"google-cloud-aiplatform"})," Python SDK for Vertex AI, which includes Gemini models, embeddings, fine-tuning, and all Vertex AI services. For Gemini specifically, you can also use the ",e.jsx("strong",{children:"google-generativeai"}),"package (Gemini API / Google AI Studio), but Vertex AI is required for enterprise features: VPC isolation, private endpoints, regional data processing, and compliance."]}),e.jsxs(r,{term:"Vertex AI vs. Gemini API",children:[e.jsxs("p",{children:[e.jsxs("strong",{children:["Vertex AI SDK (",e.jsx("code",{children:"google-cloud-aiplatform"}),"):"]})," Enterprise, GCP-native, uses Application Default Credentials, supports all GCP security controls, SLA-backed, models deployed in your GCP project's region.",e.jsx("br",{}),e.jsxs("strong",{children:["Gemini API (",e.jsx("code",{children:"google-generativeai"}),"):"]})," Consumer-grade, uses API keys, simpler setup, no VPC/IAM, designed for prototyping and non-enterprise use."]}),e.jsx("p",{children:"For production enterprise agents, always use Vertex AI."})]}),e.jsx("h2",{children:"Installation and Authentication"}),e.jsx(o,{language:"bash",filename:"install.sh",children:`# Vertex AI SDK
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
    return response.text`}}),e.jsx("h2",{children:"Embeddings and Grounding"}),e.jsx(o,{language:"python",filename:"vertex_embeddings_grounding.py",children:`from vertexai.language_models import TextEmbeddingModel, TextEmbeddingInput
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
    return response.text`}),e.jsx(s,{title:"Use Workload Identity Federation in Production",children:e.jsxs("p",{children:["On GKE and Cloud Run, configure Workload Identity Federation so that pods/services automatically receive a GCP service account identity — no key files, no secrets to manage. Bind the service account to only the IAM roles needed: ",e.jsx("code",{children:"roles/aiplatform.user"}),"for model inference, ",e.jsx("code",{children:"roles/storage.objectViewer"})," for reading documents. Avoid ",e.jsx("code",{children:"roles/owner"})," or ",e.jsx("code",{children:"roles/editor"})," for any Vertex AI workload."]})}),e.jsx(n,{type:"tip",title:"Regional Endpoints for Lower Latency",children:e.jsxs("p",{children:["Always initialize Vertex AI with a region close to your users:",e.jsx("code",{children:'vertexai.init(project=PROJECT, location="europe-west1")'})," for European users,",e.jsx("code",{children:'"asia-northeast1"'})," for Japan, etc. Using ",e.jsx("code",{children:"us-central1"})," for global users adds unnecessary latency. Vertex AI models are available in most major regions."]})})]})}const $=Object.freeze(Object.defineProperty({__proto__:null,default:z},Symbol.toStringTag,{value:"Module"}));function O(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LiteLLM: Unified LLM Interface"}),e.jsx("p",{children:"LiteLLM provides a single OpenAI-compatible API that routes to 100+ LLM providers — Azure OpenAI, Amazon Bedrock, Google Vertex AI, Anthropic, Cohere, Mistral, and more. It's the primary abstraction layer for multi-cloud AI architectures, enabling model switching, cost-optimized routing, and automatic fallback without changing application code."}),e.jsx(r,{term:"LiteLLM",children:e.jsxs("p",{children:["LiteLLM translates OpenAI-format requests into each provider's native API format, normalizes responses back to OpenAI format, and exposes a consistent Python SDK and optional proxy server. The model is identified by a prefixed string:",e.jsx("code",{children:"azure/gpt-4o"}),", ",e.jsx("code",{children:"bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0"}),",",e.jsx("code",{children:"vertex_ai/gemini-2.0-flash-001"}),"."]})}),e.jsx(a,{title:"LiteLLM Proxy — Multi-Cloud Routing",width:700,height:280,nodes:[{id:"app",label:"Your Application",type:"external",x:80,y:140},{id:"proxy",label:"LiteLLM Proxy",type:"agent",x:260,y:140},{id:"azure",label:"Azure OpenAI",type:"llm",x:480,y:60},{id:"bedrock",label:"AWS Bedrock",type:"llm",x:480,y:140},{id:"vertex",label:"Vertex AI",type:"llm",x:480,y:220},{id:"metrics",label:"Cost + Metrics",type:"store",x:640,y:140}],edges:[{from:"app",to:"proxy",label:"OpenAI format"},{from:"proxy",to:"azure",label:"primary"},{from:"proxy",to:"bedrock",label:"fallback"},{from:"proxy",to:"vertex",label:"fallback"},{from:"proxy",to:"metrics"}]}),e.jsx("h2",{children:"Installation and Basic Usage"}),e.jsx(o,{language:"bash",filename:"install.sh",children:`pip install litellm

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
)`}}),e.jsx("h2",{children:"Fallback and Load Balancing"}),e.jsx(i,{name:"Fallback Routing",category:"Reliability",whenToUse:"When you need high availability across model providers, or when your primary provider is capacity-constrained or has an outage.",children:e.jsx("p",{children:"LiteLLM supports automatic fallback at both the model level (try GPT-4o, fall back to Claude 3.5 Sonnet) and the provider level (try Azure primary region, fall back to Bedrock). Fallbacks are configured declaratively and happen transparently to your code."})}),e.jsx(t,{title:"LiteLLM — Fallbacks, Load Balancing, and Cost Tracking",tabs:{python:`import litellm
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
    }`}}),e.jsx("h2",{children:"LiteLLM Proxy Server"}),e.jsxs("p",{children:["The LiteLLM proxy exposes an OpenAI-compatible HTTP server. Any application using the OpenAI SDK can route through LiteLLM proxy by changing the ",e.jsx("code",{children:"base_url"}),"— enabling centralized rate limiting, cost tracking, and model governance without modifying individual applications."]}),e.jsx(o,{language:"yaml",filename:"litellm_config.yaml",children:`model_list:
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
  store_model_in_db: true`}),e.jsx(o,{language:"bash",filename:"run_proxy.sh",children:`# Start the proxy server
litellm --config litellm_config.yaml --port 4000

# Any OpenAI-compatible client can now use it:
# export OPENAI_API_BASE="http://localhost:4000"
# export OPENAI_API_KEY="sk-your-master-key"
# Then use the normal openai SDK - it routes through LiteLLM`}),e.jsx(s,{title:"Use LiteLLM Router for Enterprise Resilience",children:e.jsxs("p",{children:["For production multi-cloud setups, use LiteLLM Router (not raw ",e.jsx("code",{children:"litellm.completion"}),") to get automatic load balancing across deployments, TPM/RPM-aware routing, and cascading fallbacks. Configure at least one cross-provider fallback (e.g., Azure GPT-4o → Bedrock Claude) to handle provider-wide outages. Monitor cost per model via the built-in Prometheus exporter to catch unexpected cost spikes early."]})}),e.jsx(n,{type:"info",title:"LiteLLM vs. Provider SDKs",children:e.jsx("p",{children:"LiteLLM adds a thin abstraction layer that's invaluable for multi-cloud setups and A/B testing models. However, for provider-specific features (Azure Assistants API, Bedrock Agents, Vertex AI grounding with Google Search), you'll still need the native SDKs. A common pattern: LiteLLM for standard completions and embeddings, native SDKs for managed services (agents, knowledge bases, guardrails)."})})]})}const X=Object.freeze(Object.defineProperty({__proto__:null,default:O},Symbol.toStringTag,{value:"Module"}));export{K as a,q as b,U as c,F as d,W as e,H as f,V as g,Y as h,J as i,Q as j,Z as k,$ as l,X as m,B as s};
