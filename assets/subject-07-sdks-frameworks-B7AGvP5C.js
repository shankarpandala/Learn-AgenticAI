import{j as e}from"./vendor-Cs56uELc.js";import{C as r,S as t,b as p,B as s,N as o,W as m,P as i,A as c,a as l}from"./content-components-CDXEIxVK.js";function g(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Anthropic SDK Basics"}),e.jsx("p",{children:"The Anthropic SDK is your primary interface for building applications with Claude. Available in Python and TypeScript/JavaScript, it provides a clean abstraction over the Messages API, handles authentication, retry logic, and response parsing."}),e.jsx(r,{term:"Anthropic SDK",children:e.jsx("p",{children:"The official Anthropic client library that provides typed interfaces for all Claude API features including message creation, streaming, tool use, vision, and token counting. It handles authentication, rate limit retries with exponential backoff, and connection management automatically."})}),e.jsx("h2",{children:"Installation"}),e.jsx(t,{title:"Installing the Anthropic SDK",tabs:{bash:`# Python
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

console.log(Tokens used: \${message.usage.input_tokens} in, \${message.usage.output_tokens} out);`}}),e.jsx("h2",{children:"System Prompts"}),e.jsx("p",{children:"System prompts set the context, persona, and constraints for Claude before any user interaction. They're crucial for building reliable agents."}),e.jsx(t,{title:"Using System Prompts",tabs:{python:`import anthropic

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
  system: You are an expert Python code reviewer specializing in security.

When reviewing code:
1. Identify security vulnerabilities (OWASP Top 10)
2. Check for input validation issues
3. Look for SQL injection, XSS, and authentication flaws
4. Suggest specific fixes with code examples,
  messages: [
    {
      role: 'user',
      content: Review this code:\\n\\n\${codeToReview},
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
console.log(\\nTotal tokens: \${finalMessage.usage.input_tokens + finalMessage.usage.output_tokens});`}}),e.jsx("h2",{children:"Available Claude Models"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Model ID"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Best For"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Context"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["claude-opus-4-6","Most capable: complex reasoning, coding, analysis","200K"],["claude-sonnet-4-6","Balanced: speed + intelligence for most tasks","200K"],["claude-haiku-4-5-20251001","Fastest, most cost-effective: simple tasks","200K"]].map(([a,n,d])=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300",children:a}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:n}),e.jsxs("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:[d," tokens"]})]},a))})]})}),e.jsx(s,{title:"Use claude-opus-4-6 for Development, Route in Production",children:e.jsx("p",{children:"During development and evaluation, use claude-opus-4-6 to establish baseline quality. Once you understand the task complexity distribution, route simpler tasks to claude-haiku-4-5-20251001 or claude-sonnet-4-6 in production to reduce costs by 80-95% without sacrificing quality where it matters."})}),e.jsx(o,{type:"tip",title:"Rate Limits and Retries",children:e.jsxs("p",{children:["The SDK automatically retries rate limit errors (429) and server errors (5xx) with exponential backoff. Set ",e.jsx("code",{children:"max_retries=5"})," for production workloads. Monitor ",e.jsx("code",{children:"X-RateLimit-*"})," headers (accessible via raw HTTP) to understand your usage patterns and avoid hitting limits."]})})]})}const oe=Object.freeze(Object.defineProperty({__proto__:null,default:g},Symbol.toStringTag,{value:"Module"}));function f(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Messages API"}),e.jsx("p",{children:"The Messages API is the single endpoint that powers all Claude interactions. Understanding its request structure — roles, content blocks, streaming events, prompt caching, and vision inputs — is essential for building reliable production systems."}),e.jsx(r,{term:"Messages API",children:e.jsxs("p",{children:["The Anthropic Messages API (",e.jsx("code",{children:"POST /v1/messages"}),") accepts a list of messages with alternating ",e.jsx("strong",{children:"user"})," and ",e.jsx("strong",{children:"assistant"})," roles, an optional system prompt, and returns a response with one or more ",e.jsx("strong",{children:"content blocks"}),". Every Claude capability — text, tool use, vision, caching — flows through this single API."]})}),e.jsx("h2",{children:"Roles and Turn Structure"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"messages"})," array must alternate strictly between ",e.jsx("code",{children:"user"})," and",e.jsx("code",{children:"assistant"})," roles. The first message must be from the user, and you cannot have two consecutive messages from the same role."]}),e.jsx(t,{title:"Roles and Multi-Turn Structure",tabs:{python:`import anthropic

client = anthropic.Anthropic()

# Correct alternating structure
messages = [
    {"role": "user", "content": "What is prompt caching?"},
    {"role": "assistant", "content": "Prompt caching stores reusable context..."},
    {"role": "user", "content": "How does it reduce costs?"},
]

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=messages,
)
print(response.content[0].text)`,typescript:`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const messages: Anthropic.MessageParam[] = [
  { role: 'user', content: 'What is prompt caching?' },
  { role: 'assistant', content: 'Prompt caching stores reusable context...' },
  { role: 'user', content: 'How does it reduce costs?' },
];

const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  messages,
});
console.log(response.content[0].type === 'text' ? response.content[0].text : '');`}}),e.jsx("h2",{children:"Content Blocks"}),e.jsxs("p",{children:["Both user messages and assistant responses can contain multiple ",e.jsx("strong",{children:"content blocks"}),". This allows a single message to mix text, images, tool calls, and tool results."]}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Block Type"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Direction"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Purpose"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["text","Both","Plain or markdown text content"],["image","User only","Image input (base64 or URL)"],["tool_use","Assistant","Claude requests a tool call"],["tool_result","User only","Result of a tool call returned to Claude"],["document","User only","PDF or text document (with caching)"]].map(([a,n,d])=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300",children:a}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:n}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:d})]},a))})]})}),e.jsx("h2",{children:"Vision Inputs"}),e.jsx("p",{children:"Claude can process images passed as base64-encoded data or as public URLs. Images count toward the context window based on their pixel dimensions."}),e.jsx(t,{title:"Vision: Sending Images to Claude",tabs:{python:`import anthropic
import base64
from pathlib import Path

client = anthropic.Anthropic()

# Option 1: Base64-encoded local image
image_data = base64.standard_b64encode(
    Path("diagram.png").read_bytes()
).decode("utf-8")

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": "Describe the architecture in this diagram.",
                },
            ],
        }
    ],
)
print(response.content[0].text)

# Option 2: URL (public image, no authentication)
response2 = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=512,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "url",
                        "url": "https://example.com/chart.png",
                    },
                },
                {"type": "text", "text": "Summarize the data shown."},
            ],
        }
    ],
)`,typescript:`import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const client = new Anthropic();

// Base64-encoded local image
const imageData = fs.readFileSync('diagram.png').toString('base64');

const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: imageData,
          },
        },
        {
          type: 'text',
          text: 'Describe the architecture in this diagram.',
        },
      ],
    },
  ],
});
console.log(response.content[0].type === 'text' ? response.content[0].text : '');`}}),e.jsx("h2",{children:"Streaming"}),e.jsxs("p",{children:["Streaming returns tokens as they are generated via server-sent events (SSE). The SDK provides both a low-level event iterator and a higher-level ",e.jsx("code",{children:"stream"})," helper that accumulates the full message for you."]}),e.jsx(t,{title:"Streaming Response Events",tabs:{python:`import anthropic

client = anthropic.Anthropic()

# High-level stream helper — recommended
with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=2048,
    messages=[{"role": "user", "content": "Explain vector quantization step by step."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
    final = stream.get_final_message()
    print(f"\\nStop reason: {final.stop_reason}")
    print(f"Usage: {final.usage.input_tokens} in / {final.usage.output_tokens} out")

# Low-level raw event access
with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=512,
    messages=[{"role": "user", "content": "Hello"}],
) as stream:
    for event in stream:
        if event.type == "content_block_delta":
            if event.delta.type == "text_delta":
                print(event.delta.text, end="", flush=True)
        elif event.type == "message_stop":
            print("\\n[Stream complete]")`,typescript:`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// High-level stream helper
const stream = await client.messages.stream({
  model: 'claude-opus-4-6',
  max_tokens: 2048,
  messages: [{ role: 'user', content: 'Explain vector quantization step by step.' }],
});

for await (const text of stream.textStream) {
  process.stdout.write(text);
}

const final = await stream.getFinalMessage();
console.log(\\nStop: \${final.stop_reason});
console.log(Tokens: \${final.usage.input_tokens} in / \${final.usage.output_tokens} out);

// Low-level: raw SSE events
const rawStream = await client.messages.stream({
  model: 'claude-opus-4-6',
  max_tokens: 512,
  messages: [{ role: 'user', content: 'Hello' }],
});
for await (const event of rawStream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    process.stdout.write(event.delta.text);
  }
}`}}),e.jsx("h2",{children:"Prompt Caching"}),e.jsx("p",{children:"Prompt caching lets you mark large, stable portions of your context for reuse across requests. Cached tokens cost ~10% of normal input tokens and reduce latency for repeated prefixes by up to 85%."}),e.jsx(t,{title:"Prompt Caching with cache_control",tabs:{python:`import anthropic

client = anthropic.Anthropic()

# Load a large document once
with open("legal_corpus.txt") as f:
    legal_text = f.read()

# Mark the stable document for caching
# The cache breakpoint applies to everything up to and including this block
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are a legal expert. Answer questions about the following document.",
        },
        {
            "type": "text",
            "text": legal_text,
            "cache_control": {"type": "ephemeral"},  # Cache this block
        },
    ],
    messages=[
        {"role": "user", "content": "What are the indemnification clauses?"}
    ],
)
print(response.content[0].text)

# Subsequent requests reuse the cache — much faster and cheaper
response2 = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are a legal expert. Answer questions about the following document.",
        },
        {
            "type": "text",
            "text": legal_text,
            "cache_control": {"type": "ephemeral"},
        },
    ],
    messages=[
        {"role": "user", "content": "Summarise the liability limitations."}
    ],
)
# Check cache usage
print(f"Cache read tokens: {response2.usage.cache_read_input_tokens}")
print(f"Cache creation tokens: {response2.usage.cache_creation_input_tokens}")`,typescript:`import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const client = new Anthropic();
const legalText = fs.readFileSync('legal_corpus.txt', 'utf-8');

const makeRequest = (question: string) =>
  client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: 'You are a legal expert. Answer questions about the following document.',
      },
      {
        type: 'text',
        text: legalText,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [{ role: 'user', content: question }],
  });

const r1 = await makeRequest('What are the indemnification clauses?');
console.log(r1.content[0].type === 'text' ? r1.content[0].text : '');

const r2 = await makeRequest('Summarise the liability limitations.');
console.log(Cache read: \${r2.usage.cache_read_input_tokens ?? 0} tokens);`}}),e.jsx(o,{type:"info",title:"Cache TTL and Minimum Size",children:e.jsx("p",{children:"Cached prompts have a 5-minute TTL that resets on each cache hit. To be eligible for caching, a content block must be at least 1,024 tokens (for Claude Haiku) or 2,048 tokens (for Sonnet/Opus). You can have up to four cache breakpoints per request."})}),e.jsx("h2",{children:"Stop Reasons"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"stop_reason"})," field tells you why Claude stopped generating. Always check it — especially in agentic loops."]}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"stop_reason"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Meaning"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Action"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["end_turn","Claude finished naturally","Use the response"],["max_tokens","Hit the max_tokens limit","Increase limit or continue"],["tool_use","Claude wants to call a tool","Execute tool and send result"],["stop_sequence","Hit a custom stop sequence","Process partial response"]].map(([a,n,d])=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300",children:a}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:n}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:d})]},a))})]})}),e.jsx(m,{title:"Always Handle max_tokens Stop Reason",children:e.jsxs("p",{children:["If ",e.jsx("code",{children:"stop_reason"})," is ",e.jsx("code",{children:"max_tokens"}),", the response is truncated. For structured outputs (JSON, code), truncation produces invalid output. Either increase ",e.jsx("code",{children:"max_tokens"}),", or detect this condition and re-prompt with the partial response appended to continue generation."]})}),e.jsx(s,{title:"Use Structured Content Blocks Over String Concatenation",children:e.jsx("p",{children:"When sending mixed content (text + images, or multi-part instructions), always use the content block array format rather than concatenating strings. This gives Claude clearer semantic boundaries between content types, improves accuracy, and makes your code easier to maintain as content types evolve."})}),e.jsx(p,{title:"Image Input Validation",severity:"medium",children:e.jsx("p",{children:"Never pass user-supplied image URLs directly to the API without validation. A malicious URL could leak your API requests to a third-party server via SSRF. For user-uploaded images, download them server-side and pass as base64 data, or host them on your own CDN and validate the URL origin."})})]})}const ae=Object.freeze(Object.defineProperty({__proto__:null,default:f},Symbol.toStringTag,{value:"Module"}));function y(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Tool Use API"}),e.jsx("p",{children:"Tool use (also called function calling) allows Claude to request execution of external functions — searching databases, calling APIs, running code — then incorporate the results into its final response. This is the foundation of agentic behaviour."}),e.jsx(r,{term:"Tool Use",children:e.jsxs("p",{children:["When Claude decides a tool is needed, it returns a ",e.jsx("code",{children:"tool_use"})," content block containing the tool name and a JSON argument object. Your code executes the tool and returns the result as a ",e.jsx("code",{children:"tool_result"})," block in the next user message. The loop continues until Claude responds with ",e.jsx("code",{children:'stop_reason: "end_turn"'}),"."]})}),e.jsx("h2",{children:"Defining Tools"}),e.jsx("p",{children:"Tools are defined as JSON Schema objects specifying the name, description, and input parameters. Write clear descriptions — Claude uses them to decide when and how to call each tool."}),e.jsx(t,{title:"Defining Tools",tabs:{python:`import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "search_documents",
        "description": (
            "Search the internal knowledge base for documents matching a query. "
            "Use this when the user asks about company policies, procedures, or history."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query string.",
                },
                "top_k": {
                    "type": "integer",
                    "description": "Maximum number of results to return (1-10). Default 5.",
                    "default": 5,
                },
                "filter_date_after": {
                    "type": "string",
                    "format": "date",
                    "description": "Only return documents created after this date (YYYY-MM-DD).",
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. 'London'"},
                "units": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "default": "celsius",
                },
            },
            "required": ["city"],
        },
    },
]

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[
        {"role": "user", "content": "What's the weather in Tokyo right now?"}
    ],
)
print(response.stop_reason)   # "tool_use"
print(response.content)       # includes tool_use block`,typescript:`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'search_documents',
    description:
      'Search the internal knowledge base for documents matching a query. ' +
      'Use this when the user asks about company policies, procedures, or history.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query string.' },
        top_k: {
          type: 'integer',
          description: 'Maximum number of results to return (1-10). Default 5.',
          default: 5,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_weather',
    description: 'Get the current weather for a city.',
    input_schema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: "City name, e.g. 'London'" },
        units: { type: 'string', enum: ['celsius', 'fahrenheit'], default: 'celsius' },
      },
      required: ['city'],
    },
  },
];

const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  tools,
  messages: [{ role: 'user', content: "What's the weather in Tokyo right now?" }],
});
console.log(response.stop_reason); // "tool_use"`}}),e.jsx("h2",{children:"The Tool Use Loop"}),e.jsxs("p",{children:["A complete agentic tool-use loop requires: (1) sending the initial request, (2) detecting",e.jsx("code",{children:"tool_use"})," blocks, (3) executing the tools, (4) sending results back, and (5) repeating until ",e.jsx("code",{children:"end_turn"}),"."]}),e.jsx(t,{title:"Full Tool Use Loop",tabs:{python:`import anthropic
import json
from typing import Any

client = anthropic.Anthropic()

# Simulated tool implementations
def search_documents(query: str, top_k: int = 5, **_) -> list[dict]:
    """Mock: search a vector store."""
    return [
        {"title": f"Doc about {query}", "snippet": f"Relevant content for {query}...", "score": 0.95}
    ]

def get_weather(city: str, units: str = "celsius") -> dict:
    """Mock: call a weather API."""
    return {"city": city, "temperature": 22, "units": units, "condition": "sunny"}

TOOL_REGISTRY: dict[str, Any] = {
    "search_documents": search_documents,
    "get_weather": get_weather,
}

def run_tool(name: str, inputs: dict) -> str:
    """Dispatch a tool call and return JSON result."""
    if name not in TOOL_REGISTRY:
        return json.dumps({"error": f"Unknown tool: {name}"})
    try:
        result = TOOL_REGISTRY[name](**inputs)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"error": str(e)})

def agent_loop(user_message: str, tools: list, max_iterations: int = 10) -> str:
    """Run the tool-use loop until end_turn."""
    messages = [{"role": "user", "content": user_message}]

    for iteration in range(max_iterations):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )

        # Append assistant response to history
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            # Extract final text response
            for block in response.content:
                if block.type == "text":
                    return block.text
            return ""

        if response.stop_reason == "tool_use":
            # Execute all requested tool calls
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    print(f"[Tool] Calling {block.name} with {block.input}")
                    result_str = run_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result_str,
                    })

            # Send all tool results in a single user message
            messages.append({"role": "user", "content": tool_results})
        else:
            # Unexpected stop reason
            break

    return "Max iterations reached"

# Define tools (same as above)
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "units": {"type": "string", "enum": ["celsius", "fahrenheit"]},
            },
            "required": ["city"],
        },
    }
]

answer = agent_loop("What's the weather in Paris and Berlin?", tools)
print(answer)`,typescript:`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Simulated tool implementations
const toolRegistry: Record<string, (args: Record<string, unknown>) => unknown> = {
  get_weather: ({ city, units = 'celsius' }) => ({
    city,
    temperature: 22,
    units,
    condition: 'sunny',
  }),
  search_documents: ({ query, top_k = 5 }) => [
    { title: Doc about \${query}, score: 0.95 },
  ],
};

function runTool(name: string, input: Record<string, unknown>): string {
  const fn = toolRegistry[name];
  if (!fn) return JSON.stringify({ error: Unknown tool: \${name} });
  try {
    return JSON.stringify(fn(input));
  } catch (e) {
    return JSON.stringify({ error: String(e) });
  }
}

async function agentLoop(
  userMessage: string,
  tools: Anthropic.Tool[],
  maxIterations = 10,
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  for (let i = 0; i < maxIterations; i++) {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      tools,
      messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text');
      return textBlock && textBlock.type === 'text' ? textBlock.text : '';
    }

    if (response.stop_reason === 'tool_use') {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          console.log([Tool] Calling \${block.name});
          const result = runTool(block.name, block.input as Record<string, unknown>);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }
      }
      messages.push({ role: 'user', content: toolResults });
    }
  }
  return 'Max iterations reached';
}

const tools: Anthropic.Tool[] = [
  {
    name: 'get_weather',
    description: 'Get the current weather for a city.',
    input_schema: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        units: { type: 'string', enum: ['celsius', 'fahrenheit'] },
      },
      required: ['city'],
    },
  },
];

const answer = await agentLoop("What's the weather in Paris and Berlin?", tools);
console.log(answer);`}}),e.jsx("h2",{children:"Tool Choice"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"tool_choice"})," parameter controls whether Claude must use a tool, may use one, or cannot use any."]}),e.jsx(t,{title:"Controlling Tool Choice",tabs:{python:`import anthropic

client = anthropic.Anthropic()

# Default: Claude decides whether to use tools
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    tool_choice={"type": "auto"},  # Default
    messages=[{"role": "user", "content": "Hello!"}],
)

# Force Claude to call a specific tool
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    tool_choice={"type": "tool", "name": "get_weather"},
    messages=[{"role": "user", "content": "Tell me about Paris."}],
)

# Force Claude to call at least one tool (but choose which)
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    tool_choice={"type": "any"},
    messages=[{"role": "user", "content": "I need information about Tokyo."}],
)`,typescript:`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Force a specific tool
const forced = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  tools,
  tool_choice: { type: 'tool', name: 'get_weather' },
  messages: [{ role: 'user', content: 'Tell me about Paris.' }],
});

// Force at least one tool (Claude picks which)
const anyTool = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  tools,
  tool_choice: { type: 'any' },
  messages: [{ role: 'user', content: 'I need information about Tokyo.' }],
});`}}),e.jsx(i,{name:"Parallel Tool Calls",category:"Efficiency",whenToUse:"When the user query requires independent data from multiple sources. Claude may return multiple tool_use blocks in a single response. Execute them in parallel to minimise latency.",children:e.jsxs("p",{children:["Claude can request multiple tool calls in a single response when the calls are independent. Your loop should collect all ",e.jsx("code",{children:"tool_use"})," blocks from the response, execute them concurrently, and return all results in a single user message."]})}),e.jsx(m,{title:"Validate Tool Inputs Before Execution",children:e.jsxs("p",{children:["Claude's tool inputs are model-generated and could be malformed. Always validate inputs against the expected schema before executing, especially for destructive operations (deletions, writes, API calls with side effects). Use Pydantic or Zod for schema validation and return a descriptive error in the ",e.jsx("code",{children:"tool_result"})," if validation fails — Claude will self-correct on the next turn."]})}),e.jsx(s,{title:"Write Precise Tool Descriptions",children:e.jsx("p",{children:"Tool descriptions are the primary signal Claude uses to select and invoke tools correctly. Include: what the tool does, when to use it (and when NOT to), what each parameter means, and example values. Vague descriptions cause hallucinated arguments or wrong tool selection. Treat tool descriptions like API documentation for a junior developer."})}),e.jsx(o,{type:"tip",title:"Token Efficiency with Tool Schemas",children:e.jsx("p",{children:"Tool schemas count toward your input tokens on every request. For agents with many tools, this adds up quickly. Consider: grouping related tools into fewer tools with an action parameter, using a router agent that only passes relevant tools to sub-agents, or dynamically selecting a subset of tools based on the current task context."})})]})}const ie=Object.freeze(Object.defineProperty({__proto__:null,default:y},Symbol.toStringTag,{value:"Module"})),x=[{id:"app",label:"Your Application",type:"agent",x:60,y:150},{id:"sdk",label:"Claude Agent SDK",type:"llm",x:230,y:150},{id:"session",label:"Session Manager",type:"agent",x:400,y:80},{id:"tools",label:"Tool Executor",type:"tool",x:400,y:150},{id:"memory",label:"Memory / Context",type:"store",x:400,y:220},{id:"api",label:"Anthropic Messages API",type:"external",x:580,y:150}],_=[{from:"app",to:"sdk",label:"run(task)"},{from:"sdk",to:"session",label:"manage"},{from:"sdk",to:"tools",label:"dispatch"},{from:"sdk",to:"memory",label:"read/write"},{from:"sdk",to:"api",label:"messages"},{from:"api",to:"sdk",label:"response"},{from:"tools",to:"sdk",label:"result"}];function v(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Claude Agent SDK"}),e.jsx("p",{children:"The Claude Agent SDK (part of the Anthropic Agent SDK / Claude Code SDK) provides higher-level abstractions on top of the raw Messages API. Instead of manually managing the tool-call loop, building context windows, and handling retries, the SDK handles the agentic loop for you so you can focus on defining tools and tasks."}),e.jsx(r,{term:"Agentic Loop",children:e.jsxs("p",{children:["The agentic loop is the cycle: ",e.jsx("strong",{children:"send message → receive response → if tool_use block present, execute tool → append result → repeat"})," until the model returns a final ",e.jsx("code",{children:"end_turn"})," stop reason. The Agent SDK encapsulates this loop, including streaming, error handling, and context-window management."]})}),e.jsx(c,{nodes:x,edges:_,title:"Claude Agent SDK Architecture"}),e.jsx("h2",{children:"Installation"}),e.jsx(t,{title:"Install the SDK",tabs:{bash:`# Python (Claude Agent SDK ships inside the anthropic package)
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
      return Error: file not found: \${input.path};
    }
  }
  return Unknown tool: \${name};
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
console.log("\\nStop reason:", final.stop_reason);`}}),e.jsx(i,{name:"Tool-Result Injection Pattern",children:e.jsxs("p",{children:["Always include tool results in the same ",e.jsx("code",{children:"user"})," turn that follows the assistant's ",e.jsx("code",{children:"tool_use"})," blocks. Each ",e.jsx("code",{children:"tool_result"})," must reference the exact ",e.jsx("code",{children:"tool_use_id"})," from the model's response. Missing or mismatched IDs cause ",e.jsx("code",{children:"400"})," validation errors."]})}),e.jsx(s,{title:"Agent SDK Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Set ",e.jsx("code",{children:"max_tokens"})," high enough (≥ 4 096) for tool-heavy tasks; the model stops mid-loop if it runs out."]}),e.jsxs("li",{children:["Add a ",e.jsx("strong",{children:"loop counter"})," (e.g. max 20 iterations) to prevent runaway agents."]}),e.jsxs("li",{children:["Catch ",e.jsx("code",{children:"anthropic.APIStatusError"})," for rate-limit (429) and server (500+) errors; implement exponential back-off."]}),e.jsx("li",{children:"Log every message turn to a structured store for observability and replay."}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:'tool_choice: {"type": "auto"}'})," in most cases; switch to ",e.jsx("code",{children:'"any"'})," only when you need to force a tool call."]})]})}),e.jsxs(o,{children:["The ",e.jsx("strong",{children:"Claude Code SDK"})," (",e.jsx("code",{children:"@anthropic-ai/claude-code"}),") and the ",e.jsx("strong",{children:"Anthropic Messages SDK"})," (",e.jsx("code",{children:"@anthropic-ai/sdk"}),") are complementary, not competing. Use the Messages SDK when you build your own tool executor. Use the Claude Code SDK when you want Claude Code's full tool suite (file editing, bash, MCP) in a headless subprocess."]})]})}const le=Object.freeze(Object.defineProperty({__proto__:null,default:v},Symbol.toStringTag,{value:"Module"}));function b(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LangChain Overview"}),e.jsx("p",{children:"LangChain is the most widely adopted framework for building LLM-powered applications. It provides a composable set of abstractions — LLMs, prompts, chains, retrievers, memory, and agents — plus the LangChain Expression Language (LCEL) for wiring them together declaratively."}),e.jsx(r,{term:"LangChain Expression Language (LCEL)",children:e.jsxs("p",{children:["LCEL is LangChain's pipe-based composition system. Components implement a common",e.jsx("strong",{children:"Runnable"})," interface (",e.jsx("code",{children:"invoke"}),", ",e.jsx("code",{children:"stream"}),",",e.jsx("code",{children:"batch"}),", ",e.jsx("code",{children:"ainvoke"}),"), and the ",e.jsx("code",{children:"|"})," operator chains them together. This enables lazy evaluation, automatic parallelism, streaming, and transparent tracing throughout the pipeline."]})}),e.jsx(c,{title:"LangChain Component Ecosystem",width:700,height:280,nodes:[{id:"prompt",label:"Prompt Template",type:"agent",x:80,y:80},{id:"llm",label:"LLM / ChatModel",type:"llm",x:260,y:80},{id:"parser",label:"Output Parser",type:"agent",x:440,y:80},{id:"retriever",label:"Retriever",type:"tool",x:80,y:200},{id:"memory",label:"Memory",type:"agent",x:260,y:200},{id:"chain",label:"Chain / LCEL",type:"external",x:440,y:200},{id:"agent",label:"Agent / LangGraph",type:"llm",x:620,y:140}],edges:[{from:"prompt",to:"llm"},{from:"llm",to:"parser"},{from:"retriever",to:"chain"},{from:"memory",to:"chain"},{from:"parser",to:"chain"},{from:"chain",to:"agent"}]}),e.jsx("h2",{children:"Core Abstractions"}),e.jsx("h3",{children:"Chat Models"}),e.jsxs("p",{children:["LangChain wraps LLM provider APIs into a unified ",e.jsx("code",{children:"BaseChatModel"})," interface. Swap providers by changing a single import — the rest of your chain stays the same."]}),e.jsx(t,{title:"Chat Models: Provider-Agnostic Interface",tabs:{python:`from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Anthropic Claude
claude = ChatAnthropic(model="claude-opus-4-6", temperature=0)

# OpenAI GPT-4o (same interface!)
gpt = ChatOpenAI(model="gpt-4o", temperature=0)

messages = [
    SystemMessage(content="You are a concise technical writer."),
    HumanMessage(content="Explain embeddings in two sentences."),
]

# Both use the same invoke() call
claude_response = claude.invoke(messages)
gpt_response = gpt.invoke(messages)

print(claude_response.content)
print(gpt_response.content)

# Async and streaming work identically
async for chunk in claude.astream(messages):
    print(chunk.content, end="", flush=True)`,typescript:`import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const claude = new ChatAnthropic({ model: 'claude-opus-4-6', temperature: 0 });
const gpt = new ChatOpenAI({ model: 'gpt-4o', temperature: 0 });

const messages = [
  new SystemMessage('You are a concise technical writer.'),
  new HumanMessage('Explain embeddings in two sentences.'),
];

// Same interface across providers
const claudeResponse = await claude.invoke(messages);
const gptResponse = await gpt.invoke(messages);

console.log(claudeResponse.content);

// Streaming
for await (const chunk of await claude.stream(messages)) {
  process.stdout.write(chunk.content as string);
}`}}),e.jsx("h3",{children:"Prompt Templates"}),e.jsx("p",{children:"Prompt templates separate the prompt structure from its variables, enabling reuse, versioning, and testing."}),e.jsx(t,{title:"Prompt Templates",tabs:{python:`from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Simple template with variables
summarize_prompt = ChatPromptTemplate.from_messages([
    ("system", "Summarise the following {document_type} in {num_sentences} sentences."),
    ("human", "{document}"),
])

# Format for inspection
formatted = summarize_prompt.format_messages(
    document_type="research paper",
    num_sentences=3,
    document="LLMs have revolutionised NLP by...",
)

# Template with chat history placeholder
chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])`,typescript:`import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

const summarizePrompt = ChatPromptTemplate.fromMessages([
  ['system', 'Summarise the following {document_type} in {num_sentences} sentences.'],
  ['human', '{document}'],
]);

const chatPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant.'],
  new MessagesPlaceholder('history'),
  ['human', '{input}'],
]);`}}),e.jsx("h3",{children:"LCEL Chains"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"|"})," operator composes Runnables into pipelines. Each component's output becomes the next component's input."]}),e.jsx(t,{title:"Building Chains with LCEL",tabs:{python:`from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

# Basic text chain: prompt | model | parser
llm = ChatAnthropic(model="claude-opus-4-6")

text_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant."),
        ("human", "{question}"),
    ])
    | llm
    | StrOutputParser()
)

result = text_chain.invoke({"question": "What is RAG?"})
print(result)  # Plain string

# Structured output chain with Pydantic
class Summary(BaseModel):
    headline: str = Field(description="One-sentence headline")
    key_points: list[str] = Field(description="3-5 bullet points")
    sentiment: str = Field(description="positive, neutral, or negative")

json_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "Analyse the text and return JSON matching the schema."),
        ("human", "{text}"),
    ])
    | llm.with_structured_output(Summary)
)

summary = json_chain.invoke({"text": "LangChain has grown rapidly..."})
print(summary.headline)
print(summary.key_points)

# Parallel chains with RunnableParallel
from langchain_core.runnables import RunnableParallel

parallel_chain = RunnableParallel(
    summary=text_chain,
    translation=ChatPromptTemplate.from_template("Translate to French: {question}") | llm | StrOutputParser(),
)
results = parallel_chain.invoke({"question": "Explain embeddings."})
print(results["summary"])
print(results["translation"])`,typescript:`import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableParallel } from '@langchain/core/runnables';

const llm = new ChatAnthropic({ model: 'claude-opus-4-6' });

// Basic LCEL chain
const textChain = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant.'],
  ['human', '{question}'],
])
  .pipe(llm)
  .pipe(new StringOutputParser());

const result = await textChain.invoke({ question: 'What is RAG?' });
console.log(result);

// Structured output
const structuredChain = ChatPromptTemplate.fromMessages([
  ['system', 'Extract key information as JSON.'],
  ['human', '{text}'],
]).pipe(llm.withStructuredOutput({
  name: 'summary',
  description: 'Structured summary',
  parameters: {
    type: 'object',
    properties: {
      headline: { type: 'string' },
      key_points: { type: 'array', items: { type: 'string' } },
    },
    required: ['headline', 'key_points'],
  },
}));

const summary = await structuredChain.invoke({ text: 'LangChain is a framework...' });
console.log(summary);`}}),e.jsx("h2",{children:"Output Parsers"}),e.jsx("p",{children:"Output parsers transform raw LLM text into structured Python/TypeScript objects. LangChain provides parsers for strings, JSON, Pydantic models, lists, and more."}),e.jsx(t,{title:"Output Parsers",tabs:{python:`from langchain_core.output_parsers import (
    StrOutputParser,
    JsonOutputParser,
    CommaSeparatedListOutputParser,
    PydanticOutputParser,
)
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import PromptTemplate

llm = ChatAnthropic(model="claude-opus-4-6")

# Comma-separated list
list_parser = CommaSeparatedListOutputParser()
list_chain = (
    PromptTemplate.from_template(
        "List the top 5 Python web frameworks.\\n{format_instructions}",
        partial_variables={"format_instructions": list_parser.get_format_instructions()},
    )
    | llm
    | list_parser
)
frameworks = list_chain.invoke({})
print(frameworks)  # ['Django', 'Flask', 'FastAPI', 'Tornado', 'Starlette']

# Pydantic parser for complex structured output
class Product(BaseModel):
    name: str = Field(description="Product name")
    price: float = Field(description="Price in USD")
    features: list[str] = Field(description="Key features")

pydantic_parser = PydanticOutputParser(pydantic_object=Product)
product_chain = (
    PromptTemplate.from_template(
        "Describe a fictional AI coding assistant product.\\n{format_instructions}",
        partial_variables={"format_instructions": pydantic_parser.get_format_instructions()},
    )
    | llm
    | pydantic_parser
)
product = product_chain.invoke({})
print(f"{product.name}: \${product.price}")`}}),e.jsx("h2",{children:"Runnables and the Runnable Interface"}),e.jsx("p",{children:"Every LCEL component implements the Runnable interface, which provides consistent methods for synchronous, asynchronous, streaming, and batch execution."}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Method"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Description"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["invoke(input)","Single synchronous call"],["ainvoke(input)","Single async call (awaitable)"],["stream(input)","Synchronous streaming generator"],["astream(input)","Async streaming generator"],["batch(inputs)","Process multiple inputs in parallel"],["abatch(inputs)","Async batch processing"]].map(([a,n])=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300",children:a}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:n})]},a))})]})}),e.jsx(s,{title:"Prefer LCEL Over Legacy Chains",children:e.jsxs("p",{children:["LangChain's older ",e.jsx("code",{children:"LLMChain"}),", ",e.jsx("code",{children:"SequentialChain"}),", and similar classes are deprecated in favour of LCEL. LCEL chains are more composable, support streaming natively, work with LangSmith tracing automatically, and have better async support. When starting new projects, always use the LCEL pipe syntax."]})}),e.jsx(o,{type:"tip",title:"Use .with_config() for Metadata",children:e.jsxs("p",{children:["Add tags, metadata, and run names to any Runnable with",e.jsx("code",{children:'.with_config(tags=["rag", "v2"], run_name="summarise-step")'}),". These appear in LangSmith traces and make debugging production pipelines much easier."]})})]})}const ce=Object.freeze(Object.defineProperty({__proto__:null,default:b},Symbol.toStringTag,{value:"Module"}));function w(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LangChain Agents"}),e.jsx("p",{children:"LangChain agents are reasoning loops where an LLM decides which tools to call, in what order, to answer a user's query. LangChain supports two primary agent types: ReAct (reasoning + acting) and OpenAI-tools-style agents that use structured function calling."}),e.jsx(r,{term:"LangChain Agent",children:e.jsx("p",{children:"A LangChain agent wraps an LLM with a set of tools. On each step, the LLM observes the current state (question + previous tool outputs), decides on an action (tool call or final answer), and the agent executor runs the action and feeds the result back. This loop continues until the LLM produces a final answer."})}),e.jsx("h2",{children:"Defining Custom Tools"}),e.jsxs("p",{children:["Tools can be created from plain Python functions using the ",e.jsx("code",{children:"@tool"})," decorator, or as ",e.jsx("code",{children:"StructuredTool"})," objects for more control. The docstring becomes the tool's description — write it clearly."]}),e.jsx(t,{title:"Creating Custom Tools",tabs:{python:`from langchain_core.tools import tool, StructuredTool
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
    return f"Final amount: \${amount:,.2f} | Interest earned: \${interest:,.2f}"

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

tools = [get_stock_price, calculate_compound_interest, web_search_tool]`,typescript:`import { tool } from '@langchain/core/tools';
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

const tools = [getStockPrice, calculateCompoundInterest];`}}),e.jsx("h2",{children:"Creating a Tool-Calling Agent"}),e.jsxs("p",{children:["The modern way to build LangChain agents uses ",e.jsx("code",{children:"create_tool_calling_agent"}),"(works with any model that supports structured tool calling) combined with",e.jsx("code",{children:"AgentExecutor"}),"."]}),e.jsx(t,{title:"Tool-Calling Agent with AgentExecutor",tabs:{python:`from langchain_anthropic import ChatAnthropic
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
    print(f"Result: {observation}\\n")`,typescript:`import { ChatAnthropic } from '@langchain/anthropic';
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

console.log(result.output);`}}),e.jsx("h2",{children:"Callbacks"}),e.jsx("p",{children:"Callbacks let you hook into the agent's execution lifecycle for logging, streaming updates to a UI, or custom monitoring."}),e.jsx(t,{title:"Custom Callbacks",tabs:{python:`from langchain_core.callbacks import BaseCallbackHandler
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
)`}}),e.jsx("h2",{children:"Memory and Conversation History"}),e.jsxs("p",{children:["Agents can maintain conversation history across turns. The cleanest approach with LCEL agents is to manage history externally and pass it via the ",e.jsx("code",{children:"chat_history"}),"variable."]}),e.jsx(t,{title:"Stateful Multi-Turn Agent",tabs:{python:`from langchain_core.messages import HumanMessage, AIMessage
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
print(chat("And if it grows 10% annually for 5 years, what would it be worth?"))`}}),e.jsx(i,{name:"Prebuilt Agent Tools",category:"Productivity",whenToUse:"For common tools like web search, calculators, Wikipedia, code execution, and file I/O. LangChain Community provides 100+ prebuilt tools — use them instead of reimplementing.",children:e.jsxs("p",{children:[e.jsx("code",{children:"langchain-community"})," provides tools like ",e.jsx("code",{children:"DuckDuckGoSearchRun"}),",",e.jsx("code",{children:"WikipediaQueryRun"}),", ",e.jsx("code",{children:"PythonREPLTool"}),", ",e.jsx("code",{children:"SQLDatabaseTool"}),", and many more. Always check the community package before building a tool from scratch."]})}),e.jsx(m,{title:"AgentExecutor max_iterations",children:e.jsxs("p",{children:["Always set ",e.jsx("code",{children:"max_iterations"})," on AgentExecutor. Without it, a confused agent can loop indefinitely, consuming tokens and money. For production, 10–15 iterations is usually sufficient; increase only for genuinely complex multi-step tasks. Also set",e.jsx("code",{children:"max_execution_time"})," as a wall-clock timeout."]})}),e.jsx(s,{title:"Migrate to LangGraph for Complex Agents",children:e.jsx("p",{children:"AgentExecutor is straightforward for simple ReAct loops but becomes limiting when you need conditional branching, parallel tool execution, human-in-the-loop pauses, or multi-agent coordination. For these patterns, migrate to LangGraph — it gives you full control over the execution flow while keeping LCEL-compatible components."})}),e.jsx(o,{type:"tip",title:"Structured Output Tools",children:e.jsx("p",{children:"For tools that return complex objects, use Pydantic models as the return type annotation. LangChain will serialise the object to JSON automatically, and Claude can parse the structure reliably. Avoid returning unstructured strings for anything beyond simple scalar values."})})]})}const de=Object.freeze(Object.defineProperty({__proto__:null,default:w},Symbol.toStringTag,{value:"Module"}));function A(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LangGraph: State Machines for Agents"}),e.jsx("p",{children:"LangGraph is LangChain's framework for building stateful, multi-step agent workflows as directed graphs. Unlike simple chain-of-thought loops, LangGraph lets you define complex conditional flows, cycles, human-in-the-loop interrupts, and persistent state — all the primitives needed for production agents."}),e.jsx(r,{term:"LangGraph StateGraph",children:e.jsxs("p",{children:["A LangGraph ",e.jsx("strong",{children:"StateGraph"})," is a directed graph where nodes are Python functions (agent steps) and edges define the flow between steps. The graph maintains a typed ",e.jsx("strong",{children:"State"})," object that flows between nodes, accumulating results. Conditional edges allow dynamic routing based on the current state."]})}),e.jsx(c,{title:"LangGraph RAG Agent Architecture",width:640,height:300,nodes:[{id:"start",label:"User Query",type:"external",x:80,y:150},{id:"retrieve",label:"Retrieve",type:"tool",x:220,y:150},{id:"grade",label:"Grade Docs",type:"agent",x:360,y:150},{id:"generate",label:"Generate",type:"llm",x:500,y:100},{id:"rewrite",label:"Rewrite Query",type:"agent",x:500,y:200},{id:"answer",label:"Final Answer",type:"external",x:600,y:150}],edges:[{from:"start",to:"retrieve"},{from:"retrieve",to:"grade"},{from:"grade",to:"generate",label:"relevant"},{from:"grade",to:"rewrite",label:"not relevant"},{from:"rewrite",to:"retrieve",label:"retry"},{from:"generate",to:"answer"}]}),e.jsx("h2",{children:"Core Concepts"}),e.jsx("h3",{children:"State"}),e.jsxs("p",{children:["State is a TypedDict (Python) that flows through the graph. All nodes read from and write to this shared state. LangGraph supports both ",e.jsx("strong",{children:"total state replacement"})," and",e.jsx("strong",{children:"reducer functions"})," (e.g., append to a list)."]}),e.jsx("h3",{children:"Nodes"}),e.jsx("p",{children:"Nodes are Python functions that take the current state and return an update dict. They can call LLMs, run tools, query databases, or execute any Python code."}),e.jsx("h3",{children:"Edges"}),e.jsxs("p",{children:["Edges connect nodes. ",e.jsx("strong",{children:"Normal edges"})," always go from A to B.",e.jsx("strong",{children:"Conditional edges"})," use a function to decide the next node based on state.",e.jsx("code",{children:"START"})," and ",e.jsx("code",{children:"END"})," are special entry/exit nodes."]}),e.jsx("h2",{children:"Building a CRAG Agent with LangGraph"}),e.jsx("p",{children:"The following example implements Corrective RAG (CRAG) — an agent that retrieves documents, grades their relevance, and either generates an answer or rewrites the query and retries."}),e.jsx(t,{title:"CRAG Agent with LangGraph",tabs:{python:`from typing import TypedDict, Annotated, List
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
print(result["generation"])`}}),e.jsx("h2",{children:"Checkpointing & Persistence"}),e.jsx("p",{children:"LangGraph's checkpointing system saves graph state after each node, enabling: pause/resume, human-in-the-loop approval gates, and fault tolerance."}),e.jsx(l,{language:"python",filename:"langgraph_checkpointing.py",children:`from langgraph.checkpoint.sqlite import SqliteSaver
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
app.invoke(None, config=config)  # Resume from checkpoint`}),e.jsx(i,{name:"Supervisor Pattern with LangGraph",category:"Multi-Agent",whenToUse:"When you have multiple specialized worker agents that need to be coordinated by a central router that decides which agent handles each subtask.",children:e.jsx("p",{children:"The supervisor pattern uses a LLM router as a special node that decides which worker agent to call next. Workers report back to the supervisor after each step. The supervisor sees all worker outputs and decides when the task is complete."})}),e.jsx(s,{title:"State Schema Design",children:e.jsxs("p",{children:["Design your state schema before writing any nodes. Use Annotated types with reducer functions for lists (e.g., ",e.jsx("code",{children:"Annotated[list, operator.add]"})," to append rather than replace). Keep state flat and serializable — LangGraph needs to checkpoint it. Avoid storing large objects like embeddings directly in state; use IDs and look them up."]})}),e.jsx(o,{type:"tip",title:"LangGraph vs. LangChain Agents",children:e.jsx("p",{children:"Use LangGraph when you need: cycles/loops, multiple conditional paths, persistent state across sessions, or human-in-the-loop interrupts. Use simple LangChain AgentExecutor for straightforward ReAct loops without complex branching. LangGraph has more boilerplate but gives you full control over agent flow."})})]})}const pe=Object.freeze(Object.defineProperty({__proto__:null,default:A},Symbol.toStringTag,{value:"Module"}));function k(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LangSmith"}),e.jsx("p",{children:"LangSmith is LangChain's observability, evaluation, and prompt-management platform. It provides tracing for every LLM call and chain step, a dataset/evaluation harness for systematic testing, and a prompt hub for versioning prompts across environments."}),e.jsx(r,{term:"LangSmith Tracing",children:e.jsx("p",{children:"LangSmith tracing captures the full execution tree of every LangChain and LangGraph run — inputs, outputs, latency, token usage, and errors — at every level of nesting. Traces are sent asynchronously via background threads so they add no observable latency to your application."})}),e.jsx("h2",{children:"Setup and Configuration"}),e.jsx(p,{title:"API Key Management",severity:"medium",children:e.jsxs("p",{children:["Set ",e.jsx("code",{children:"LANGCHAIN_API_KEY"})," via environment variable, never in source code. LangSmith supports project-level API keys — create separate keys for dev, staging, and production environments so you can rotate them independently."]})}),e.jsx(t,{title:"Enabling LangSmith Tracing",tabs:{python:`import os

# Configure via environment variables (before importing langchain)
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-api-key"
os.environ["LANGCHAIN_PROJECT"] = "my-rag-app"   # Project name for grouping

# That's it — all LangChain/LangGraph code now auto-traces
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatAnthropic(model="claude-opus-4-6")
chain = (
    ChatPromptTemplate.from_template("Explain {topic} in one paragraph.")
    | llm
    | StrOutputParser()
)

# This call is automatically traced to LangSmith
result = chain.invoke({"topic": "vector databases"})
print(result)`,typescript:`// Set environment variables before running
// LANGCHAIN_TRACING_V2=true
// LANGCHAIN_API_KEY=your-key
// LANGCHAIN_PROJECT=my-rag-app

import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Auto-tracing is enabled via env vars — no code changes needed
const llm = new ChatAnthropic({ model: 'claude-opus-4-6' });

const chain = ChatPromptTemplate.fromTemplate('Explain {topic} in one paragraph.')
  .pipe(llm)
  .pipe(new StringOutputParser());

// Automatically traced
const result = await chain.invoke({ topic: 'vector databases' });
console.log(result);`}}),e.jsx("h2",{children:"Custom Tracing with @traceable"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"@traceable"})," decorator traces any Python function — not just LangChain components. Use it to wrap custom retrieval logic, preprocessing steps, or entire pipeline entry points."]}),e.jsx(t,{title:"Tracing Custom Functions",tabs:{python:`from langsmith import traceable
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json

llm = ChatAnthropic(model="claude-opus-4-6")

@traceable(name="retrieve-documents", tags=["retrieval"])
def retrieve_documents(query: str, top_k: int = 5) -> list[dict]:
    """Simulates retrieval from a vector store."""
    # In production, this would call your actual vector store
    return [
        {"content": f"Document {i} about {query}", "score": 0.9 - i * 0.05}
        for i in range(top_k)
    ]

@traceable(name="format-context", tags=["preprocessing"])
def format_context(docs: list[dict]) -> str:
    """Format retrieved documents into a context string."""
    return "\\n\\n".join(
        f"[{i+1}] {doc['content']} (score: {doc['score']:.2f})"
        for i, doc in enumerate(docs)
    )

@traceable(name="rag-pipeline", run_type="chain", tags=["rag", "v2"])
def rag_answer(question: str) -> str:
    """Full RAG pipeline — retrieval + generation."""
    docs = retrieve_documents(question, top_k=4)
    context = format_context(docs)

    chain = (
        ChatPromptTemplate.from_messages([
            ("system", "Answer based only on the context provided."),
            ("human", "Context:\\n{context}\\n\\nQuestion: {question}"),
        ])
        | llm
        | StrOutputParser()
    )

    return chain.invoke({"context": context, "question": question})

answer = rag_answer("What is HNSW indexing?")
print(answer)
# Full trace visible in LangSmith, showing all nested steps`}}),e.jsx("h2",{children:"Datasets and Evaluation"}),e.jsx("p",{children:"LangSmith datasets store input/output examples for systematic evaluation. You can create datasets from hand-crafted examples or by pulling from production traces."}),e.jsx(t,{title:"Creating Datasets and Running Evaluations",tabs:{python:`from langsmith import Client
from langsmith.evaluation import evaluate, LangChainStringEvaluator

client = Client()

# 1. Create a dataset
dataset_name = "rag-qa-v1"
dataset = client.create_dataset(
    dataset_name=dataset_name,
    description="QA pairs for RAG pipeline evaluation",
)

# 2. Add examples (question + expected answer)
examples = [
    {
        "inputs": {"question": "What is the capital of France?"},
        "outputs": {"answer": "Paris"},
    },
    {
        "inputs": {"question": "Who invented the transformer architecture?"},
        "outputs": {"answer": "Vaswani et al. at Google Brain in 2017"},
    },
    {
        "inputs": {"question": "What does RAG stand for?"},
        "outputs": {"answer": "Retrieval-Augmented Generation"},
    },
]
client.create_examples(
    inputs=[e["inputs"] for e in examples],
    outputs=[e["outputs"] for e in examples],
    dataset_id=dataset.id,
)

# 3. Define the function to evaluate
def my_rag_app(inputs: dict) -> dict:
    answer = rag_answer(inputs["question"])
    return {"answer": answer}

# 4. Run evaluation with built-in evaluators
results = evaluate(
    my_rag_app,
    data=dataset_name,
    evaluators=[
        LangChainStringEvaluator("cot_qa"),         # Chain-of-thought QA correctness
        LangChainStringEvaluator("labeled_criteria",  # Custom criterion
            config={
                "criteria": "conciseness",
                "llm": ChatAnthropic(model="claude-opus-4-6"),
            }
        ),
    ],
    experiment_prefix="rag-v2",
    metadata={"version": "2.0", "retriever": "chroma"},
)

print(f"Experiment URL: {results.experiment_url}")
print(f"Mean correctness: {results.to_pandas()['cot_qa'].mean():.2f}")`}}),e.jsx("h2",{children:"Prompt Hub"}),e.jsx("p",{children:"LangSmith Prompt Hub stores, versions, and serves prompts. Pull the latest prompt at runtime to update prompts without redeploying your application."}),e.jsx(t,{title:"Prompt Hub: Push and Pull Prompts",tabs:{python:`from langsmith import Client
from langchain import hub
from langchain_core.prompts import ChatPromptTemplate

client = Client()

# Push a prompt to the hub
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful assistant. Answer the question based only on the
provided context. If the context doesn't contain the answer, say 'I don't know'.

Context:
{context}"""),
    ("human", "{question}"),
])

# Push (creates a new version automatically)
url = client.push_prompt("rag-assistant-v1", object=rag_prompt)
print(f"Pushed to: {url}")

# Pull the latest version at runtime
prompt = hub.pull("your-org/rag-assistant-v1")

# Pull a specific commit (for reproducibility)
prompt_pinned = hub.pull("your-org/rag-assistant-v1:abc12345")

# Use like any ChatPromptTemplate
chain = prompt | llm | StrOutputParser()
result = chain.invoke({"context": "...", "question": "What is RAG?"})`}}),e.jsx("h2",{children:"Online Evaluation"}),e.jsx("p",{children:"LangSmith can automatically evaluate production runs using online evaluators — LLM judges that score every trace or a sample of traces as they arrive."}),e.jsx(t,{title:"Setting Up Online Evaluators",tabs:{python:`from langsmith import Client
from langsmith.schemas import RunRuleConfig

client = Client()

# Configure an online evaluator for the project
# (Can also be done via the LangSmith UI)
evaluator_config = RunRuleConfig(
    display_name="Conciseness Check",
    evaluator_type="llm",
    llm_as_judge_config={
        "prompt_template": """Evaluate whether the following response is concise.
Score 1 if concise, 0 if verbose.

Response: {output}

Score:""",
        "model": "claude-opus-4-6",
        "score_key": "conciseness",
    },
    sampling_rate=0.1,  # Evaluate 10% of production runs
)
# Configure via client.create_run_rule(project_name="my-rag-app", config=evaluator_config)
# (API may vary by LangSmith version — check latest docs)`}}),e.jsx(s,{title:"Tag Runs for Easy Filtering",children:e.jsxs("p",{children:["Use consistent tags and metadata on all runs: environment (",e.jsx("code",{children:"prod"}),",",e.jsx("code",{children:"staging"}),"), version numbers, user cohorts, and feature flags. LangSmith's filtering and dashboard features become vastly more useful when you can slice traces by these dimensions. Add tags via ",e.jsx("code",{children:'.with_config(tags=["prod", "v2.1"])'}),"or in ",e.jsx("code",{children:"@traceable"})," decorator arguments."]})}),e.jsx(o,{type:"tip",title:"Tracing Non-LangChain Code",children:e.jsxs("p",{children:["LangSmith's ",e.jsx("code",{children:"@traceable"})," decorator works with any Python function, including direct Anthropic SDK calls, database queries, and custom logic. You don't need to use LangChain components to benefit from LangSmith observability — it's a general-purpose LLM observability tool."]})})]})}const me=Object.freeze(Object.defineProperty({__proto__:null,default:k},Symbol.toStringTag,{value:"Module"}));function j(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LlamaIndex Overview"}),e.jsx("p",{children:"LlamaIndex (formerly GPT Index) is a data framework for LLM applications focused on ingesting, structuring, and querying private or domain-specific data. Where LangChain is a general-purpose orchestration framework, LlamaIndex excels at the full data pipeline: loading, chunking, embedding, indexing, and retrieval."}),e.jsx(r,{term:"LlamaIndex",children:e.jsxs("p",{children:["LlamaIndex provides a ",e.jsx("strong",{children:"data ingestion pipeline"})," (loaders for 100+ data sources), ",e.jsx("strong",{children:"index types"})," (vector, summary, tree, keyword),",e.jsx("strong",{children:"retrieval abstractions"})," (query engines, retrievers, postprocessors), and ",e.jsx("strong",{children:"agent workflows"})," that compose these components into production RAG and agentic applications."]})}),e.jsx(c,{title:"LlamaIndex Data Pipeline",width:680,height:260,nodes:[{id:"source",label:"Data Sources",type:"external",x:60,y:130},{id:"loader",label:"Data Loaders",type:"tool",x:190,y:130},{id:"transform",label:`Transformations
(Chunking)`,type:"agent",x:330,y:130},{id:"embed",label:"Embeddings",type:"llm",x:460,y:80},{id:"index",label:"Index",type:"agent",x:580,y:130},{id:"query",label:"Query Engine",type:"external",x:460,y:200}],edges:[{from:"source",to:"loader"},{from:"loader",to:"transform"},{from:"transform",to:"embed"},{from:"embed",to:"index"},{from:"index",to:"query"}]}),e.jsx("h2",{children:"Core Concepts"}),e.jsx("h3",{children:"Documents and Nodes"}),e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Document"})," is the raw loaded data unit — a PDF page, a web page, a database row. A ",e.jsx("strong",{children:"Node"})," is a chunk of a Document after splitting, with metadata and relationships preserved (prev/next node, source document)."]}),e.jsx("h3",{children:"Index Types"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Index Type"}),e.jsx("th",{className:"px-4 py-3 text-left font-semibold",children:"Best For"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["VectorStoreIndex","Semantic similarity search — the most common for RAG"],["SummaryIndex","Summarising a set of documents (e.g., meeting notes)"],["TreeIndex","Hierarchical summarisation and multi-step reasoning"],["KeywordTableIndex","Exact keyword-based retrieval (BM25-style)"],["KnowledgeGraphIndex","Graph-based reasoning over entity relationships"]].map(([a,n])=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300",children:a}),e.jsx("td",{className:"px-4 py-3 text-gray-600 dark:text-gray-400",children:n})]},a))})]})}),e.jsx("h2",{children:"Installation and Setup"}),e.jsx(t,{title:"Installing LlamaIndex",tabs:{bash:`# Core package
pip install llama-index

# LLM integrations
pip install llama-index-llms-anthropic
pip install llama-index-llms-openai

# Embedding integrations
pip install llama-index-embeddings-openai
pip install llama-index-embeddings-huggingface

# Vector store integrations
pip install llama-index-vector-stores-chroma
pip install llama-index-vector-stores-pinecone

# Document loaders
pip install llama-index-readers-file          # PDF, DOCX, etc.
pip install llama-index-readers-web           # Web pages
pip install llama-index-readers-database      # SQL databases`}}),e.jsx(t,{title:"Global Settings and LLM Configuration",tabs:{python:`from llama_index.core import Settings
from llama_index.llms.anthropic import Anthropic
from llama_index.embeddings.openai import OpenAIEmbedding

# Configure globally — all components inherit these settings
Settings.llm = Anthropic(model="claude-opus-4-6", max_tokens=2048)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.chunk_size = 512           # Tokens per chunk
Settings.chunk_overlap = 64         # Overlap between chunks

# Or use local embeddings (no API key needed)
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")`,typescript:`import { Settings } from 'llamaindex';
import { Anthropic } from '@llamaindex/anthropic';
import { OpenAIEmbedding } from 'llamaindex';

Settings.llm = new Anthropic({ model: 'claude-opus-4-6' });
Settings.embedModel = new OpenAIEmbedding({ model: 'text-embedding-3-small' });
Settings.chunkSize = 512;
Settings.chunkOverlap = 64;`}}),e.jsx("h2",{children:"Loading Data"}),e.jsxs("p",{children:["LlamaIndex provides ",e.jsx("strong",{children:"SimpleDirectoryReader"})," for loading files and specialised readers for web, databases, Notion, Slack, and many other sources."]}),e.jsx(t,{title:"Loading Documents",tabs:{python:`from llama_index.core import SimpleDirectoryReader, Document

# Load all files from a directory (PDF, DOCX, TXT, MD, etc.)
documents = SimpleDirectoryReader("./data/docs").load_data()
print(f"Loaded {len(documents)} documents")

# Load a specific file type
pdf_reader = SimpleDirectoryReader(
    input_files=["report.pdf", "appendix.pdf"],
    filename_as_id=True,          # Use filename as doc ID for upserts
)
pdf_docs = pdf_reader.load_data()

# Manually create documents (useful for database rows)
custom_docs = [
    Document(
        text="LlamaIndex supports 100+ data sources.",
        metadata={
            "source": "docs",
            "author": "LlamaIndex Team",
            "date": "2024-01-15",
        },
        id_="doc-001",
    ),
    Document(
        text="VectorStoreIndex is the most common index for RAG.",
        metadata={"source": "docs", "category": "indexing"},
        id_="doc-002",
    ),
]

# Web reader
from llama_index.readers.web import SimpleWebPageReader
web_docs = SimpleWebPageReader(html_to_text=True).load_data([
    "https://docs.llamaindex.ai/en/stable/",
])`}}),e.jsx("h2",{children:"Transformations and Node Parsing"}),e.jsxs("p",{children:["The ",e.jsx("strong",{children:"IngestionPipeline"})," applies a sequence of transformations to documents: splitting, metadata extraction, and embedding. Transformations are cached automatically."]}),e.jsx(t,{title:"Ingestion Pipeline with Transformations",tabs:{python:`from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter, SemanticSplitterNodeParser
from llama_index.core.extractors import TitleExtractor, QuestionsAnsweredExtractor
from llama_index.core import VectorStoreIndex
from llama_index.embeddings.openai import OpenAIEmbedding

embed_model = OpenAIEmbedding(model="text-embedding-3-small")

pipeline = IngestionPipeline(
    transformations=[
        # Split into chunks
        SentenceSplitter(chunk_size=512, chunk_overlap=64),

        # Automatically extract metadata (LLM-powered)
        TitleExtractor(nodes=5),  # Extract title from first 5 nodes
        QuestionsAnsweredExtractor(questions=3),  # Generate 3 QA pairs per node

        # Embed — must be last
        embed_model,
    ],
    # Optional: cache to disk to avoid re-processing
    # docstore=SimpleDocumentStore(),
)

nodes = pipeline.run(documents=documents)
print(f"Created {len(nodes)} nodes")
print(nodes[0].metadata)  # Shows extracted metadata

# Build index from pre-processed nodes
index = VectorStoreIndex(nodes)`}}),e.jsx(s,{title:"Use IngestionPipeline with a Docstore for Incremental Updates",children:e.jsxs("p",{children:["By attaching a ",e.jsx("code",{children:"docstore"})," to your ",e.jsx("code",{children:"IngestionPipeline"}),", LlamaIndex will skip documents it has already processed. This makes incremental ingestion efficient — only new or changed documents are re-chunked and re-embedded. Use",e.jsx("code",{children:"SimpleDocumentStore"})," for local development and ",e.jsx("code",{children:"RedisDocumentStore"}),"or ",e.jsx("code",{children:"MongoDocumentStore"})," for production."]})}),e.jsx(o,{type:"tip",title:"SemanticSplitter vs SentenceSplitter",children:e.jsxs("p",{children:["The default ",e.jsx("code",{children:"SentenceSplitter"})," splits by token count, which can break paragraphs mid-thought. ",e.jsx("code",{children:"SemanticSplitterNodeParser"})," uses embedding similarity to find natural topic boundaries, producing better chunks for retrieval — at the cost of one embedding API call per sentence. Use semantic splitting for high-quality RAG on dense technical documents."]})})]})}const ue=Object.freeze(Object.defineProperty({__proto__:null,default:j},Symbol.toStringTag,{value:"Module"}));function S(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LlamaIndex RAG"}),e.jsx("p",{children:"LlamaIndex is purpose-built for RAG. It provides production-ready abstractions for every stage of the pipeline: document loading, chunking, embedding, vector storage, retrieval, re-ranking, and generation. This guide covers building a full production RAG system."}),e.jsx(r,{term:"Query Engine",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"QueryEngine"})," in LlamaIndex is the end-to-end RAG pipeline abstraction. It combines a ",e.jsx("strong",{children:"Retriever"})," (finds relevant nodes) with a",e.jsx("strong",{children:"ResponseSynthesizer"})," (generates the final answer from retrieved context). Query engines can be chained, routed, and nested for complex multi-index RAG."]})}),e.jsx(c,{title:"LlamaIndex RAG Pipeline",width:700,height:260,nodes:[{id:"query",label:"User Query",type:"external",x:60,y:130},{id:"retriever",label:"Retriever",type:"tool",x:200,y:80},{id:"rerank",label:"Reranker",type:"agent",x:360,y:80},{id:"postproc",label:"Postprocessors",type:"agent",x:360,y:200},{id:"synth",label:`Response
Synthesizer`,type:"llm",x:530,y:130},{id:"answer",label:"Final Answer",type:"external",x:650,y:130}],edges:[{from:"query",to:"retriever"},{from:"retriever",to:"rerank",label:"top-k nodes"},{from:"retriever",to:"postproc"},{from:"rerank",to:"synth"},{from:"postproc",to:"synth"},{from:"synth",to:"answer"}]}),e.jsx("h2",{children:"Building a VectorStoreIndex"}),e.jsx(t,{title:"In-Memory and Persistent Vector Index",tabs:{python:`from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
    Settings,
)
from llama_index.llms.anthropic import Anthropic
from llama_index.embeddings.openai import OpenAIEmbedding
import os

# Configure
Settings.llm = Anthropic(model="claude-opus-4-6")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

# Option 1: In-memory index (development)
documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents, show_progress=True)

# Persist to disk
index.storage_context.persist(persist_dir="./storage")

# Option 2: Load from disk (production startup)
if os.path.exists("./storage"):
    storage_context = StorageContext.from_defaults(persist_dir="./storage")
    index = load_index_from_storage(storage_context)
else:
    documents = SimpleDirectoryReader("./data").load_data()
    index = VectorStoreIndex.from_documents(documents, show_progress=True)
    index.storage_context.persist(persist_dir="./storage")

# Option 3: Use a production vector store (Chroma)
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection("rag_docs")
vector_store = ChromaVectorStore(chroma_collection=collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

index = VectorStoreIndex.from_documents(
    documents,
    storage_context=storage_context,
    show_progress=True,
)`}}),e.jsx("h2",{children:"Query Engines"}),e.jsx(t,{title:"Building and Configuring a Query Engine",tabs:{python:`from llama_index.core import VectorStoreIndex
from llama_index.core.postprocessor import (
    SimilarityPostprocessor,
    MetadataReplacementPostProcessor,
    LLMRerank,
)
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.response_synthesizers import get_response_synthesizer, ResponseMode

# Basic query engine — default settings
query_engine = index.as_query_engine(similarity_top_k=5)
response = query_engine.query("What are the main benefits of RAG?")
print(response.response)

# Access source nodes (which documents were used)
for node in response.source_nodes:
    print(f"Score: {node.score:.3f} | {node.node.get_content()[:100]}...")

# Custom query engine with fine-grained control
retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=10,  # Retrieve more, then re-rank
)

# Post-processors filter and re-rank retrieved nodes
postprocessors = [
    SimilarityPostprocessor(similarity_cutoff=0.7),  # Filter low-score nodes
    LLMRerank(                                         # LLM-based re-ranking
        choice_batch_size=5,
        top_n=3,                                       # Keep top 3 after re-rank
    ),
]

# Response synthesizer controls how the answer is generated
response_synthesizer = get_response_synthesizer(
    response_mode=ResponseMode.REFINE,  # Iteratively refine answer over chunks
    # Other modes: COMPACT, SIMPLE_SUMMARIZE, TREE_SUMMARIZE, GENERATION
)

custom_engine = RetrieverQueryEngine(
    retriever=retriever,
    node_postprocessors=postprocessors,
    response_synthesizer=response_synthesizer,
)

response = custom_engine.query("How does HNSW indexing work?")
print(response.response)`}}),e.jsx("h2",{children:"Hybrid Search"}),e.jsx("p",{children:"Hybrid search combines vector (semantic) and keyword (BM25) retrieval for better recall. LlamaIndex supports hybrid search natively with compatible vector stores."}),e.jsx(t,{title:"Hybrid Retrieval",tabs:{python:`from llama_index.core import VectorStoreIndex
from llama_index.core.retrievers import (
    VectorIndexRetriever,
    BM25Retriever,
)
from llama_index.core.retrievers.fusion_retriever import QueryFusionRetriever
from llama_index.core.query_engine import RetrieverQueryEngine

# Build both retrievers from the same index
vector_retriever = VectorIndexRetriever(index=index, similarity_top_k=5)
bm25_retriever = BM25Retriever.from_defaults(index=index, similarity_top_k=5)

# Fuse results with reciprocal rank fusion (RRF)
fusion_retriever = QueryFusionRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    similarity_top_k=5,
    num_queries=4,           # Generate 4 query variants for better recall
    mode="reciprocal_rerank",
    use_async=True,
    verbose=True,
)

query_engine = RetrieverQueryEngine.from_args(fusion_retriever)
response = query_engine.query("What is the difference between BM25 and cosine similarity?")
print(response.response)`}}),e.jsx("h2",{children:"Streaming Responses"}),e.jsx(t,{title:"Streaming Query Engine",tabs:{python:`from llama_index.core import VectorStoreIndex, Settings
from llama_index.llms.anthropic import Anthropic

Settings.llm = Anthropic(model="claude-opus-4-6")

index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(streaming=True)

# Streaming query
streaming_response = query_engine.query(
    "Explain the main components of a production RAG system."
)

# Print tokens as they arrive
for text in streaming_response.response_gen:
    print(text, end="", flush=True)
print()  # Newline after stream

# Access source nodes even in streaming mode
for node in streaming_response.source_nodes:
    print(f"Source: {node.node.metadata.get('file_name', 'unknown')}")`}}),e.jsx("h2",{children:"Chat Engine"}),e.jsxs("p",{children:["The ",e.jsx("strong",{children:"ChatEngine"})," wraps a query engine with conversation memory, enabling multi-turn RAG conversations."]}),e.jsx(t,{title:"Multi-Turn RAG Chat",tabs:{python:`from llama_index.core import VectorStoreIndex
from llama_index.core.memory import ChatMemoryBuffer

index = VectorStoreIndex.from_documents(documents)

# CondenseQuestionChatEngine: rewrites follow-up questions to be self-contained
chat_engine = index.as_chat_engine(
    chat_mode="condense_question",
    memory=ChatMemoryBuffer.from_defaults(token_limit=4096),
    verbose=True,
)

# Multi-turn conversation
response1 = chat_engine.chat("What is RAG?")
print(f"Claude: {response1.response}")

response2 = chat_engine.chat("What are its main limitations?")
print(f"Claude: {response2.response}")  # Understands "its" refers to RAG

response3 = chat_engine.chat("How can I mitigate those?")
print(f"Claude: {response3.response}")

# Reset conversation history
chat_engine.reset()`}}),e.jsx(i,{name:"Sentence Window Retrieval",category:"Retrieval Quality",whenToUse:"When your documents have dense information and you want to retrieve precise sentences but include surrounding context for generation. Improves answer accuracy without bloating retrieval recall.",children:e.jsxs("p",{children:["Store individual sentences as nodes but include a window of surrounding sentences as metadata. Retrieve by sentence (fine-grained), then replace with the window (rich context) for generation. LlamaIndex's",e.jsx("code",{children:"SentenceWindowNodeParser"})," and ",e.jsx("code",{children:"MetadataReplacementPostProcessor"}),"implement this automatically."]})}),e.jsx(t,{title:"Sentence Window RAG",tabs:{python:`from llama_index.core.node_parser import SentenceWindowNodeParser
from llama_index.core.postprocessor import MetadataReplacementPostProcessor
from llama_index.core import VectorStoreIndex
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import VectorIndexRetriever

# Parse: index sentences but store a window of context in metadata
node_parser = SentenceWindowNodeParser.from_defaults(
    window_size=3,          # Include 3 sentences before and after
    window_metadata_key="window",
    original_text_metadata_key="original_text",
)
nodes = node_parser.get_nodes_from_documents(documents)
index = VectorStoreIndex(nodes)

# At query time: retrieve sentences, replace with windows for generation
postprocessor = MetadataReplacementPostProcessor(
    target_metadata_key="window"
)
retriever = VectorIndexRetriever(index=index, similarity_top_k=5)
query_engine = RetrieverQueryEngine(
    retriever=retriever,
    node_postprocessors=[postprocessor],
)

response = query_engine.query("What are the trade-offs of hierarchical chunking?")
print(response.response)`}}),e.jsx(s,{title:"Persist Embeddings, Not Just the Index",children:e.jsxs("p",{children:["When building production RAG systems, always persist both the vector store (embeddings) and the document store (original text and metadata) separately. This lets you update documents incrementally without re-embedding the entire corpus, and regenerate the index if you change embedding models without losing the original documents. Use LlamaIndex's ",e.jsx("code",{children:"DocstoreStrategy"})," in the",e.jsx("code",{children:"IngestionPipeline"})," for automatic deduplication."]})}),e.jsx(o,{type:"tip",title:"Measure Retrieval and Generation Separately",children:e.jsxs("p",{children:["RAG failures come from two places: bad retrieval (the right document wasn't fetched) and bad generation (the document was fetched but the answer is wrong). Measure these independently. LlamaIndex's ",e.jsx("code",{children:"RetrieverEvaluator"})," measures hit rate and MRR for retrieval; ",e.jsx("code",{children:"FaithfulnessEvaluator"})," and",e.jsx("code",{children:"RelevancyEvaluator"})," measure generation quality. Fix retrieval first — the LLM can't synthesise an answer from missing context."]})})]})}const he=Object.freeze(Object.defineProperty({__proto__:null,default:S},Symbol.toStringTag,{value:"Module"}));function C(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LlamaIndex Agents"}),e.jsx("p",{children:"LlamaIndex provides a high-level agent abstraction that integrates naturally with its index and query engine ecosystem. Agents can use query engines as tools, enabling retrieval-augmented reasoning with the same simple API as function-based tools."}),e.jsx(r,{term:"LlamaIndex Agent",children:e.jsxs("p",{children:["A LlamaIndex ",e.jsx("strong",{children:"AgentRunner"})," wraps an LLM with a set of tools and executes a reasoning loop: the LLM selects a tool, the AgentRunner executes it, and the result is fed back into the next reasoning step. LlamaIndex supports ",e.jsx("strong",{children:"ReAct"}),"(reasoning + acting, text-based) and ",e.jsx("strong",{children:"OpenAI-tools"})," (structured function calling) agent types."]})}),e.jsx("h2",{children:"Function Tools"}),e.jsxs("p",{children:["The simplest way to define tools is via ",e.jsx("code",{children:"FunctionTool.from_defaults()"}),", which wraps any Python function. The docstring and type annotations become the tool description and schema."]}),e.jsx(t,{title:"Creating Function Tools",tabs:{python:`from llama_index.core.tools import FunctionTool, QueryEngineTool
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
print(arxiv_tool.metadata.description)  # From docstring`}}),e.jsx("h2",{children:"Query Engine as a Tool"}),e.jsxs("p",{children:["A ",e.jsx("code",{children:"QueryEngineTool"})," wraps any LlamaIndex query engine as an agent tool. This lets the agent perform RAG retrieval as one of its reasoning steps — a powerful pattern for knowledge-intensive tasks."]}),e.jsx(t,{title:"Query Engine Tools",tabs:{python:`from llama_index.core.tools import QueryEngineTool, ToolMetadata
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

tools = [tech_tool, policy_tool, arxiv_tool, calc_tool]`}}),e.jsx("h2",{children:"ReAct Agent"}),e.jsx("p",{children:"The ReAct agent uses a text-based reasoning format (Thought → Action → Observation) that works with any LLM, including models without native function calling."}),e.jsx(t,{title:"ReAct Agent",tabs:{python:`from llama_index.core.agent import ReActAgent
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
print(response2.response)  # Agent remembers context`}}),e.jsx("h2",{children:"Function Calling Agent (OpenAI-tools style)"}),e.jsxs("p",{children:["For LLMs with native function/tool calling, the ",e.jsx("code",{children:"OpenAIAgent"}),"(which also works with Anthropic via LiteLLM or the OpenAI-compatible interface) uses structured tool call formats for more reliable tool selection."]}),e.jsx(t,{title:"Function Calling Agent",tabs:{python:`from llama_index.agent.openai import OpenAIAgent
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
    print(token, end="", flush=True)`}}),e.jsx("h2",{children:"Custom Agent Worker"}),e.jsxs("p",{children:["For full control over the agent loop, implement a custom ",e.jsx("code",{children:"CustomSimpleAgentWorker"}),"that defines how the agent reasons and when to stop."]}),e.jsx(t,{title:"Custom Agent Worker",tabs:{python:`from llama_index.core.agent import CustomSimpleAgentWorker, Task, AgentChatResponse
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
                f"Is this context relevant and accurate for the question: '{task.input}'?
"
                f"Context: {state['context']}
Answer yes or no with explanation."
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
        pass`}}),e.jsx(i,{name:"Multi-Document Agent",category:"RAG Agents",whenToUse:"When you have many document collections and want the agent to decide which collections to query, rather than querying all of them on every request.",children:e.jsxs("p",{children:["Build one ",e.jsx("code",{children:"QueryEngineTool"})," per document collection, each with a distinct description. The agent uses the tool descriptions to decide which collections are relevant to each query. This is more efficient than a single large index and gives the agent explicit control over retrieval scope."]})}),e.jsx(m,{title:"ReAct vs Function Calling Agent Choice",children:e.jsx("p",{children:"ReAct agents produce verbose reasoning text that counts against your token budget and can be slow. Function calling agents are faster and more reliable for tool selection but require an LLM with native function calling support. For Claude, prefer the function calling agent via LiteLLM or the Anthropic-specific implementation, as ReAct with Claude's verbose reasoning can be 3-5x more expensive per step."})}),e.jsx(s,{title:"Limit Tools Per Agent Step",children:e.jsx("p",{children:"Every tool's schema and description is included in the prompt on every agent step. With 20+ tools, this consumes thousands of tokens per iteration. For large tool sets, use a two-level architecture: a router agent with coarse-grained tools that delegate to specialised sub-agents, each with a small focused toolset. This reduces per-step token cost and improves tool selection accuracy."})}),e.jsx(o,{type:"info",title:"Agent State Persistence",children:e.jsxs("p",{children:["LlamaIndex agents are stateless between ",e.jsx("code",{children:"agent.query()"})," calls unless you use ",e.jsx("code",{children:"agent.chat()"})," which maintains an internal",e.jsx("code",{children:"ChatMemoryBuffer"}),". For production applications requiring session persistence across server restarts, serialise the chat history to a database and initialise the agent with ",e.jsx("code",{children:"chat_history"})," on each new request."]})})]})}const ge=Object.freeze(Object.defineProperty({__proto__:null,default:C},Symbol.toStringTag,{value:"Module"}));function T(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LlamaIndex Workflows"}),e.jsx("p",{children:"LlamaIndex Workflows provide an event-driven, step-based abstraction for building complex agentic pipelines. Unlike agent loops, Workflows give you fine-grained control over execution order, branching, parallelism, and state — making them ideal for production multi-step AI pipelines."}),e.jsx(r,{term:"LlamaIndex Workflow",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Workflow"})," is a class where each method decorated with",e.jsx("code",{children:"@step"})," is a unit of execution. Steps communicate via typed",e.jsx("strong",{children:"Events"})," — a step declares which event types it consumes and emits. The workflow engine routes events to the appropriate steps automatically, enabling both sequential and parallel execution patterns."]})}),e.jsx(c,{title:"LlamaIndex Workflow Event Flow",width:680,height:260,nodes:[{id:"start",label:"StartEvent",type:"external",x:60,y:130},{id:"retrieve",label:`retrieve()
step`,type:"tool",x:200,y:130},{id:"grade",label:`grade()
step`,type:"agent",x:360,y:130},{id:"generate",label:`generate()
step`,type:"llm",x:520,y:80},{id:"rewrite",label:`rewrite()
step`,type:"agent",x:520,y:200},{id:"stop",label:"StopEvent",type:"external",x:640,y:130}],edges:[{from:"start",to:"retrieve",label:"StartEvent"},{from:"retrieve",to:"grade",label:"RetrieveEvent"},{from:"grade",to:"generate",label:"RelevantDocsEvent"},{from:"grade",to:"rewrite",label:"IrrelevantDocsEvent"},{from:"rewrite",to:"retrieve",label:"RetryEvent"},{from:"generate",to:"stop",label:"StopEvent"}]}),e.jsx("h2",{children:"Events and Steps"}),e.jsx("p",{children:"Events are Pydantic models that carry data between steps. The type system ensures steps only receive the events they're designed to handle."}),e.jsx(t,{title:"Defining Events and a Basic Workflow",tabs:{python:`from llama_index.core.workflow import (
    Workflow,
    step,
    Event,
    StartEvent,
    StopEvent,
    Context,
)
from llama_index.llms.anthropic import Anthropic
from pydantic import Field

# Define custom events to carry data between steps
class QueryEvent(Event):
    query: str

class RetrievedDocsEvent(Event):
    query: str
    documents: list[str]
    scores: list[float]

class GradedDocsEvent(Event):
    query: str
    relevant_docs: list[str]

class RewriteEvent(Event):
    original_query: str
    rewrite_reason: str

# Simple linear workflow
class BasicRAGWorkflow(Workflow):
    """A simple retrieve-grade-generate workflow."""

    @step
    async def retrieve(self, ctx: Context, ev: StartEvent) -> RetrievedDocsEvent:
        """Retrieve documents for the query."""
        query = ev.get("query", "")

        # In production, query your vector store here
        docs = [f"Document about {query} #{i}" for i in range(5)]
        scores = [0.95 - i * 0.05 for i in range(5)]

        return RetrievedDocsEvent(query=query, documents=docs, scores=scores)

    @step
    async def grade(self, ctx: Context, ev: RetrievedDocsEvent) -> GradedDocsEvent:
        """Grade retrieved documents for relevance."""
        llm = Anthropic(model="claude-opus-4-6")

        relevant = []
        for doc, score in zip(ev.documents, ev.scores):
            if score >= 0.75:  # Simple score threshold
                relevant.append(doc)

        return GradedDocsEvent(query=ev.query, relevant_docs=relevant)

    @step
    async def generate(self, ctx: Context, ev: GradedDocsEvent) -> StopEvent:
        """Generate the final answer."""
        llm = Anthropic(model="claude-opus-4-6")

        context = "\\n".join(ev.relevant_docs)
        prompt = f"Context:\\n{context}\\n\\nQuestion: {ev.query}\\nAnswer:"

        response = await llm.acomplete(prompt)
        return StopEvent(result=response.text)

# Run the workflow
import asyncio

async def main():
    workflow = BasicRAGWorkflow(timeout=60, verbose=True)
    result = await workflow.run(query="What is HNSW indexing?")
    print(result)

asyncio.run(main())`}}),e.jsx("h2",{children:"Branching and Loops"}),e.jsx("p",{children:"Workflows can branch conditionally and loop back by emitting different event types. A step can emit different event classes based on its logic."}),e.jsx(t,{title:"Conditional Branching and Retry Loops",tabs:{python:`from llama_index.core.workflow import (
    Workflow, step, Event, StartEvent, StopEvent, Context
)
from llama_index.llms.anthropic import Anthropic
from typing import Union

class RelevantDocsEvent(Event):
    query: str
    documents: list[str]

class IrrelevantDocsEvent(Event):
    query: str
    reason: str
    attempt: int

class CRAGWorkflow(Workflow):
    """Corrective RAG: retrieve, grade, rewrite if needed."""

    MAX_RETRIES = 3

    @step
    async def retrieve(
        self,
        ctx: Context,
        ev: Union[StartEvent, IrrelevantDocsEvent],
    ) -> Union[RelevantDocsEvent, IrrelevantDocsEvent]:
        """Retrieve documents. Handles both first query and rewrites."""
        if isinstance(ev, StartEvent):
            query = ev.get("query", "")
            attempt = 0
        else:
            query = ev.query  # Rewritten query
            attempt = ev.attempt

        # Simulate retrieval
        docs = [f"Doc for '{query}' attempt {attempt}"]
        has_relevant = attempt >= 1  # Simulate relevance after rewrite

        if has_relevant:
            return RelevantDocsEvent(query=query, documents=docs)
        elif attempt < self.MAX_RETRIES:
            return IrrelevantDocsEvent(
                query=query,
                reason="No relevant documents found",
                attempt=attempt + 1,
            )
        else:
            # Max retries: force generation with what we have
            return RelevantDocsEvent(query=query, documents=docs)

    @step
    async def rewrite_query(
        self, ctx: Context, ev: IrrelevantDocsEvent
    ) -> IrrelevantDocsEvent:
        """Rewrite the query to improve retrieval."""
        llm = Anthropic(model="claude-opus-4-6")
        response = await llm.acomplete(
            f"Rewrite this search query to be more specific: {ev.query}"
        )
        return IrrelevantDocsEvent(
            query=response.text.strip(),
            reason=ev.reason,
            attempt=ev.attempt,
        )

    @step
    async def generate(
        self, ctx: Context, ev: RelevantDocsEvent
    ) -> StopEvent:
        """Generate answer from relevant documents."""
        llm = Anthropic(model="claude-opus-4-6")
        context = "\\n".join(ev.documents)
        response = await llm.acomplete(
            f"Answer based on context:\\n{context}\\n\\nQuestion: {ev.query}"
        )
        return StopEvent(result=response.text)

import asyncio
workflow = CRAGWorkflow(timeout=120, verbose=True)
result = asyncio.run(workflow.run(query="What is the best chunking strategy for code?"))
print(result)`}}),e.jsx("h2",{children:"Parallel Steps"}),e.jsxs("p",{children:["Multiple steps can run in parallel when they consume different event types emitted simultaneously. Use ",e.jsx("code",{children:"ctx.collect_events()"})," to gather results from parallel branches before proceeding."]}),e.jsx(t,{title:"Parallel Execution",tabs:{python:`from llama_index.core.workflow import (
    Workflow, step, Event, StartEvent, StopEvent, Context
)
from typing import Optional

class SearchEvent(Event):
    source: str  # "vector" or "keyword"
    results: list[str]

class ParallelSearchWorkflow(Workflow):
    """Run vector and keyword search in parallel, then fuse results."""

    @step
    async def dispatch(self, ctx: Context, ev: StartEvent) -> None:
        """Emit multiple events to trigger parallel execution."""
        query = ev.get("query", "")
        await ctx.set("query", query)

        # Dispatch both searches simultaneously
        ctx.send_event(SearchEvent(source="vector", results=[]))
        ctx.send_event(SearchEvent(source="keyword", results=[]))

    @step
    async def vector_search(self, ctx: Context, ev: SearchEvent) -> SearchEvent:
        """Semantic vector search."""
        if ev.source != "vector":
            return  # Ignore keyword events
        query = await ctx.get("query")
        results = [f"Vector result for {query} #{i}" for i in range(3)]
        return SearchEvent(source="vector", results=results)

    @step
    async def keyword_search(self, ctx: Context, ev: SearchEvent) -> SearchEvent:
        """BM25 keyword search."""
        if ev.source != "keyword":
            return  # Ignore vector events
        query = await ctx.get("query")
        results = [f"Keyword result for {query} #{i}" for i in range(3)]
        return SearchEvent(source="keyword", results=results)

    @step
    async def fuse_and_generate(
        self, ctx: Context, ev: SearchEvent
    ) -> Optional[StopEvent]:
        """Wait for both searches, then generate answer."""
        # Collect both events before proceeding
        events = ctx.collect_events(ev, [SearchEvent, SearchEvent])
        if events is None:
            return None  # Still waiting for the second event

        all_results = []
        for search_event in events:
            all_results.extend(search_event.results)

        query = await ctx.get("query")
        from llama_index.llms.anthropic import Anthropic
        llm = Anthropic(model="claude-opus-4-6")
        context = "\\n".join(all_results)
        response = await llm.acomplete(f"Context:\\n{context}\\n\\nQuestion: {query}")
        return StopEvent(result=response.text)

import asyncio
wf = ParallelSearchWorkflow(timeout=60, verbose=True)
result = asyncio.run(wf.run(query="What is hybrid search?"))
print(result)`}}),e.jsx("h2",{children:"Workflow Context and State"}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"Context"})," object provides shared mutable state across all steps in a workflow run. Use it to store intermediate results, configuration, and counters."]}),e.jsx(t,{title:"Using Workflow Context",tabs:{python:`from llama_index.core.workflow import Workflow, step, Context, StartEvent, StopEvent

class StatefulWorkflow(Workflow):

    @step
    async def step_one(self, ctx: Context, ev: StartEvent) -> StopEvent:
        # Store values in context (available to all subsequent steps)
        await ctx.set("query", ev.get("query"))
        await ctx.set("attempt_count", 0)
        await ctx.set("retrieved_docs", [])

        # Retrieve the stored value
        query = await ctx.get("query")

        # Increment a counter
        count = await ctx.get("attempt_count", default=0)
        await ctx.set("attempt_count", count + 1)

        return StopEvent(result=f"Processed: {query}")

# Workflows can also be checkpointed for long-running tasks
# and resumed after interruption — useful for human-in-the-loop
from llama_index.core.workflow.checkpointer import WorkflowCheckpointer

checkpointer = WorkflowCheckpointer(workflow=StatefulWorkflow())
# run_id = await checkpointer.arun(query="...") — saves state after each step
# result = await checkpointer.aresume(run_id)   — resumes from last checkpoint`}}),e.jsx(i,{name:"Human-in-the-Loop Workflow",category:"Approval Gates",whenToUse:"When a workflow step requires human review before proceeding — e.g., approving a generated document, validating extracted data, or authorising a write operation.",children:e.jsxs("p",{children:["Use ",e.jsx("code",{children:"ctx.wait_for_event(HumanApprovalEvent)"})," to pause a workflow step until an external event arrives. This enables approval gates, content moderation checkpoints, and human review flows without blocking the server thread."]})}),e.jsx(s,{title:"Keep Steps Small and Single-Purpose",children:e.jsx("p",{children:"Each step should do one thing: retrieve, grade, generate, transform, or validate. This makes the workflow easy to debug (each step's input/output is logged separately), reuse (swap the retrieval step without changing generation), and test (unit test each step in isolation with mock events). Large monolithic steps defeat the purpose of the Workflow abstraction."})}),e.jsx(o,{type:"tip",title:"Visualising Workflows",children:e.jsxs("p",{children:["LlamaIndex can generate a Mermaid diagram of your Workflow's event graph with",e.jsx("code",{children:'workflow.draw(filename="workflow.png")'})," (requires ",e.jsx("code",{children:"pyvis"}),"). Use this to validate the flow and share with stakeholders who aren't reading code. The diagram is generated from the step type annotations, so keeping them accurate also keeps the diagram accurate."]})})]})}const fe=Object.freeze(Object.defineProperty({__proto__:null,default:T},Symbol.toStringTag,{value:"Module"})),I=[{id:"host",label:`MCP Host
(Claude Desktop / app)`,type:"agent",x:60,y:150},{id:"client",label:"MCP Client",type:"agent",x:240,y:150},{id:"srv1",label:"Filesystem Server",type:"tool",x:440,y:60},{id:"srv2",label:"Database Server",type:"tool",x:440,y:150},{id:"srv3",label:"Web Search Server",type:"tool",x:440,y:240},{id:"ext1",label:"Local Files",type:"store",x:640,y:60},{id:"ext2",label:"PostgreSQL",type:"store",x:640,y:150},{id:"ext3",label:"Search API",type:"external",x:640,y:240}],P=[{from:"host",to:"client",label:"embed"},{from:"client",to:"srv1",label:"JSON-RPC 2.0"},{from:"client",to:"srv2",label:"JSON-RPC 2.0"},{from:"client",to:"srv3",label:"JSON-RPC 2.0"},{from:"srv1",to:"ext1",label:"read/write"},{from:"srv2",to:"ext2",label:"query"},{from:"srv3",to:"ext3",label:"HTTP"}];function L(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Model Context Protocol (MCP) — Deep Dive"}),e.jsxs("p",{children:["The ",e.jsx("strong",{children:"Model Context Protocol (MCP)"})," is an open standard introduced by Anthropic in November 2024. It defines how AI models (hosts) communicate with external capability providers (servers) over a structured JSON-RPC 2.0 channel. MCP replaces ad-hoc, per-integration tool definitions with a universal plug-and-play interface — build a server once, use it with any MCP-compatible host."]}),e.jsx(r,{term:"Model Context Protocol (MCP)",children:e.jsxs("p",{children:["MCP is a client–server protocol where the ",e.jsx("strong",{children:"host"})," (e.g. Claude Desktop, a custom app) embeds an MCP ",e.jsx("strong",{children:"client"})," that connects to one or more MCP ",e.jsx("strong",{children:"servers"}),". Each server exposes a set of"," ",e.jsx("em",{children:"tools"}),", ",e.jsx("em",{children:"resources"}),", and ",e.jsx("em",{children:"prompts"}),". Communication uses JSON-RPC 2.0 over stdio, HTTP+SSE, or WebSockets."]})}),e.jsx(c,{nodes:I,edges:P,title:"MCP Host ↔ Client ↔ Servers"}),e.jsx("h2",{children:"Core Primitives"}),e.jsx("h3",{children:"Tools"}),e.jsx("p",{children:"Tools are callable functions the model can invoke. Each tool has a name, description, and JSON Schema input definition — identical to the Anthropic tool-use format. The server executes the function and returns a result."}),e.jsx("h3",{children:"Resources"}),e.jsxs("p",{children:["Resources are read-only data the model can request by URI (e.g."," ",e.jsx("code",{children:"file:///etc/config.yaml"})," or ",e.jsx("code",{children:"db://orders/2024-01"}),"). Unlike tools, resource reads don't execute code; they return structured content that gets injected into the model's context."]}),e.jsx("h3",{children:"Prompts"}),e.jsx("p",{children:`Servers can expose reusable prompt templates with parameters. The host renders the template and injects it as a system or user message — useful for standardised task bootstrapping (e.g. a "code-review" prompt that always follows your team's checklist).`}),e.jsx("h2",{children:"Building an MCP Server"}),e.jsx(t,{title:"Minimal MCP server (Python)",tabs:{python:`from mcp.server.fastmcp import FastMCP
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
    const res = await fetch(https://wttr.in/\${city}?format=3);
    return { content: [{ type: "text", text: await res.text() }] };
  }
);

server.resource(
  "weather-forecast",
  "weather://{city}/forecast",
  async (uri) => {
    const city = uri.pathname.replace("/", "").split("/")[0];
    const res = await fetch(https://wttr.in/\${city}?format=j1);
    const data = await res.json();
    const text = data.weather
      .slice(0, 3)
      .map(
        (d: any, i: number) =>
          Day \${i + 1}: max \${d.maxtempC}°C / min \${d.mintempC}°C
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
}`}}),e.jsx(p,{title:"MCP Server Trust",severity:"high",children:e.jsx("p",{children:"MCP servers run with the permissions of the host process. A malicious or compromised server can read files, exfiltrate data, or execute arbitrary commands. Only install MCP servers from trusted sources. For remote servers, use authentication tokens and TLS. Review every server's tool definitions before enabling it in production."})}),e.jsx(i,{name:"Registry Pattern",children:e.jsx("p",{children:"Maintain an internal MCP server registry (a JSON file or database) that lists approved servers, their endpoints, and the tools they expose. Gate server registration with a code-review process, just like you would for any third-party dependency."})}),e.jsx(s,{title:"MCP Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Prefix tool names with the server name (e.g. ",e.jsx("code",{children:"weather__get_forecast"}),") to avoid collisions when connecting multiple servers."]}),e.jsx("li",{children:"Return structured JSON from tools rather than plain text — it's easier for Claude to parse and extract fields."}),e.jsxs("li",{children:["Implement ",e.jsx("code",{children:"list_changed"})," notifications so hosts can refresh tool lists without restarting."]}),e.jsxs("li",{children:["Version your server (",e.jsx("code",{children:"version"})," field in ",e.jsx("code",{children:"ServerInfo"}),") and document breaking changes."]}),e.jsxs("li",{children:["Use the ",e.jsx("code",{children:"mcp dev"})," CLI inspector during development to test tool calls interactively."]})]})}),e.jsxs(o,{children:["MCP is already supported by Claude Desktop, Claude Code, Cursor, Zed, Sourcegraph Cody, and many other hosts. The official server registry at"," ",e.jsx("strong",{children:"github.com/modelcontextprotocol/servers"})," contains reference implementations for filesystem, Git, GitHub, databases, browser automation, and more."]})]})}const ye=Object.freeze(Object.defineProperty({__proto__:null,default:L},Symbol.toStringTag,{value:"Module"}));function R(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Building Production MCP Servers"}),e.jsx("p",{children:"A production MCP server goes beyond a simple script — it needs authentication, error handling, observability, and clean tool design. This section covers patterns for building servers you can confidently deploy in an enterprise environment."}),e.jsx("h2",{children:"Project Structure"}),e.jsx(t,{title:"Recommended project layout",tabs:{bash:`my-mcp-server/
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
        content: [{ type: "text", text: Database error: \${err} }],
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

CMD ["python", "-m", "src.server"]`}}),e.jsx(p,{title:"Least-Privilege Tool Design",severity:"medium",children:e.jsx("p",{children:'Each tool should do exactly one thing and require the minimum permissions to do it. Avoid generic "run any shell command" tools in production. If you must expose shell access, use an allowlist of permitted commands and validate inputs with a strict schema.'})}),e.jsx(s,{title:"Production Checklist",children:e.jsxs("ul",{children:[e.jsx("li",{children:"Validate all tool inputs with Pydantic / Zod schemas before execution."}),e.jsxs("li",{children:["Return ",e.jsx("code",{children:"isError: true"})," on tool failures so the model knows to handle the error rather than treating it as data."]}),e.jsx("li",{children:"Emit structured logs (JSON) for every tool invocation: tool name, inputs hash, duration, success/error."}),e.jsx("li",{children:"Rate-limit tool calls per client token to prevent abuse."}),e.jsx("li",{children:"Publish your server to a private MCP registry so teams can discover and reuse it."})]})}),e.jsxs(o,{children:["The ",e.jsx("strong",{children:"MCP Inspector"})," (",e.jsx("code",{children:"npx @modelcontextprotocol/inspector"}),") is an interactive browser-based UI for exploring, calling, and debugging any MCP server. It's the fastest way to verify your server behaves correctly before integrating it with a host."]})]})}const xe=Object.freeze(Object.defineProperty({__proto__:null,default:R},Symbol.toStringTag,{value:"Module"})),M=[{id:"client",label:`Client Agent
(Orchestrator)`,type:"agent",x:60,y:150},{id:"cardA",label:`Agent Card A
(discovery)`,type:"store",x:240,y:60},{id:"cardB",label:`Agent Card B
(discovery)`,type:"store",x:240,y:240},{id:"agentA",label:`Remote Agent A
(Data Analysis)`,type:"llm",x:460,y:60},{id:"agentB",label:`Remote Agent B
(Code Gen)`,type:"llm",x:460,y:240},{id:"taskA",label:"Task / Artifact",type:"tool",x:640,y:60},{id:"taskB",label:"Task / Artifact",type:"tool",x:640,y:240}],E=[{from:"client",to:"cardA",label:"fetch card"},{from:"client",to:"cardB",label:"fetch card"},{from:"cardA",to:"agentA",label:"describes"},{from:"cardB",to:"agentB",label:"describes"},{from:"client",to:"agentA",label:"send task"},{from:"client",to:"agentB",label:"send task"},{from:"agentA",to:"taskA",label:"produces"},{from:"agentB",to:"taskB",label:"produces"},{from:"agentA",to:"client",label:"result/stream"},{from:"agentB",to:"client",label:"result/stream"}];function D(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Agent-to-Agent (A2A) Protocol"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Agent-to-Agent (A2A)"})," is an open protocol announced by Google in April 2025 and co-developed with 50+ technology partners. It defines how independent AI agents — potentially built on different frameworks and running at different vendors — discover each other, delegate tasks, exchange structured artifacts, and coordinate long-running workflows. Think of A2A as the HTTP of the multi-agent web."]}),e.jsx(r,{term:"Agent-to-Agent (A2A) Protocol",children:e.jsxs("p",{children:["A2A is a JSON/HTTP-based protocol with three core mechanisms:"," ",e.jsx("strong",{children:"Agent Cards"})," for discovery and capability advertisement,"," ",e.jsx("strong",{children:"Tasks"})," for delegating units of work with structured inputs and outputs, and ",e.jsx("strong",{children:"Streaming"})," (SSE) for long-running task progress. It is designed to be complementary to MCP: MCP connects agents to tools and data sources; A2A connects agents to other agents."]})}),e.jsx(c,{nodes:M,edges:E,title:"A2A Multi-Agent Topology"}),e.jsx("h2",{children:"Core Concepts"}),e.jsx("h3",{children:"Agent Card"}),e.jsxs("p",{children:["An ",e.jsx("strong",{children:"Agent Card"})," is a JSON document (served at"," ",e.jsx("code",{children:"/.well-known/agent.json"}),") that describes an agent's identity, capabilities, supported input/output modalities, authentication requirements, and endpoint URL. Client agents fetch cards to decide whether to delegate a task to a remote agent."]}),e.jsx(t,{title:"Example Agent Card",tabs:{json:`{
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
╚══════════════════╩════════════════════════════╩════════════════════════════╝`}}),e.jsx(s,{title:"A2A Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"deterministic task IDs"})," (e.g. ",e.jsx("code",{children:"sha256(request_content)"}),") so you can safely retry without creating duplicate tasks."]}),e.jsxs("li",{children:["Always check ",e.jsx("code",{children:"capabilities.streaming"})," in the Agent Card before subscribing to SSE — fall back to polling if not supported."]}),e.jsxs("li",{children:["Implement ",e.jsx("strong",{children:"task cancellation"})," (",e.jsx("code",{children:"tasks/cancel"}),") in your orchestrator for timeout handling and user interruption."]}),e.jsx("li",{children:"Cache Agent Cards with a short TTL (5–15 minutes) to avoid hammering discovery endpoints."}),e.jsx("li",{children:"Validate remote agents' Agent Cards against a whitelist before delegating sensitive tasks."})]})}),e.jsxs(o,{children:["The A2A Python and TypeScript SDKs are available at"," ",e.jsx("strong",{children:"github.com/google/A2A"}),". The spec and reference implementations are maintained by Google and the A2A community. As of mid-2025, AWS, Microsoft, SAP, and Salesforce have announced A2A support in their agent platforms."]})]})}const _e=Object.freeze(Object.defineProperty({__proto__:null,default:D},Symbol.toStringTag,{value:"Module"}));function q(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Implementing A2A Agents"}),e.jsx("p",{children:"This section walks through building a complete A2A-compatible agent server and an orchestrator that delegates tasks to it, using the official Python and TypeScript SDKs from the A2A open-source project."}),e.jsx("h2",{children:"Installing the A2A SDK"}),e.jsx(t,{title:"A2A SDK setup",tabs:{bash:`# Python A2A SDK (from the google/A2A repo)
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
# }`}}),e.jsx(p,{title:"Inter-Agent Trust",severity:"high",children:e.jsx("p",{children:"When your orchestrator delegates to remote agents, validate their Agent Cards against an allowlist of trusted domains. Use mutual TLS or signed tokens to authenticate both sides. Never delegate tasks containing credentials, PII, or proprietary data to agents you don't control. Always set task timeouts and implement cancellation."})}),e.jsx(i,{name:"Idempotent Task IDs",children:e.jsxs("p",{children:["Generate task IDs deterministically from the task content (e.g."," ",e.jsx("code",{children:"sha256(agent_url + task_payload)"}),"). This lets you safely retry failed requests without accidentally creating duplicate tasks on the remote agent."]})}),e.jsx(s,{title:"A2A Implementation Checklist",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Serve your Agent Card at ",e.jsx("code",{children:"/.well-known/agent.json"})," with correct CORS headers."]}),e.jsxs("li",{children:["Implement ",e.jsx("code",{children:"tasks/cancel"})," — orchestrators rely on it for timeouts."]}),e.jsxs("li",{children:["Validate ",e.jsx("code",{children:"Authorization"})," headers on every request to your agent server."]}),e.jsxs("li",{children:["Return ",e.jsx("code",{children:"TaskState.failed"})," with a descriptive error message rather than returning HTTP 500."]}),e.jsxs("li",{children:["Test with the A2A Inspector CLI: ",e.jsx("code",{children:"npx @google/a2a-inspector http://localhost:9000"}),"."]})]})})]})}const ve=Object.freeze(Object.defineProperty({__proto__:null,default:q},Symbol.toStringTag,{value:"Module"}));function N(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"CrewAI"}),e.jsxs("p",{children:['CrewAI is a multi-agent orchestration framework that models collaboration as a "crew" of specialized AI agents working together on tasks. It provides high-level abstractions — ',e.jsx("code",{children:"Crew"}),", ",e.jsx("code",{children:"Agent"}),", ",e.jsx("code",{children:"Task"})," — that map naturally to how human teams divide and conquer complex problems."]}),e.jsx(r,{term:"Crew",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Crew"})," is the top-level orchestrator that manages a group of agents and a list of tasks. It handles agent assignment, task sequencing, and inter-agent communication. Crews can run in ",e.jsx("code",{children:"sequential"})," process (one task at a time) or ",e.jsx("code",{children:"hierarchical"})," process (a manager agent delegates to workers)."]})}),e.jsx(r,{term:"Agent",children:e.jsxs("p",{children:["An ",e.jsx("strong",{children:"Agent"})," is a specialized role with a defined goal, backstory, and set of tools. The role and backstory act as a system prompt that shapes the agent's behavior. Agents can delegate tasks to each other when using hierarchical process."]})}),e.jsx(r,{term:"Task",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Task"})," is a specific piece of work assigned to an agent. It includes a description, expected output format, and optionally an output file path or Pydantic model for structured output. Tasks can depend on the output of previous tasks via",e.jsx("code",{children:"context"}),"."]})}),e.jsx("h2",{children:"Installation and Setup"}),e.jsx(t,{title:"Installing CrewAI",tabs:{python:`# Install CrewAI with all tools
pip install crewai crewai-tools

# Or minimal install
pip install crewai`}}),e.jsx("h2",{children:"Research + Writing Crew"}),e.jsx("p",{children:"The following example builds a two-agent crew: a researcher that gathers information and a writer that produces a polished report. Tasks flow sequentially with the writer receiving the researcher's output as context."}),e.jsx(t,{title:"Research and Writing Crew",tabs:{python:`from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, WebsiteSearchTool
from langchain_anthropic import ChatAnthropic
import os

os.environ["ANTHROPIC_API_KEY"] = "your-key"
os.environ["SERPER_API_KEY"] = "your-serper-key"

# Initialize LLM
llm = ChatAnthropic(model="claude-opus-4-6", temperature=0.1)

# Initialize tools
search_tool = SerperDevTool()
web_tool = WebsiteSearchTool()

# Define Agents
researcher = Agent(
    role="Senior AI Research Analyst",
    goal=(
        "Uncover cutting-edge developments in AI and machine learning, "
        "gathering accurate, up-to-date information from reliable sources."
    ),
    backstory=(
        "You are an expert researcher with 10 years of experience in AI/ML. "
        "You have a talent for finding credible sources, synthesizing complex "
        "technical information, and identifying key trends. You always verify "
        "claims with multiple sources."
    ),
    tools=[search_tool, web_tool],
    llm=llm,
    verbose=True,
    allow_delegation=False,
    max_iter=5,  # Max reasoning iterations per task
)

writer = Agent(
    role="Technical Content Writer",
    goal=(
        "Create clear, engaging technical content that makes complex AI topics "
        "accessible to a broad technical audience."
    ),
    backstory=(
        "You are a skilled technical writer who transforms dense research findings "
        "into compelling narratives. You excel at structure, clarity, and making "
        "complex topics approachable without sacrificing accuracy."
    ),
    tools=[],  # Writer only needs research output, no external tools
    llm=llm,
    verbose=True,
    allow_delegation=False,
)

# Define Tasks
research_task = Task(
    description=(
        "Research the current state of {topic}. Focus on: "
        "1) Key recent developments (last 6 months), "
        "2) Leading frameworks and tools, "
        "3) Real-world production use cases, "
        "4) Open challenges and limitations. "
        "Collect specific facts, statistics, and examples."
    ),
    expected_output=(
        "A comprehensive research report with sections for: recent developments, "
        "key frameworks, production use cases, and challenges. "
        "Include specific citations and data points."
    ),
    agent=researcher,
    output_file="research_notes.md",
)

writing_task = Task(
    description=(
        "Using the research provided, write a 800-word technical blog post about {topic}. "
        "The post should: have a compelling title, clear introduction, 3-4 substantive "
        "sections with headers, practical takeaways, and a conclusion. "
        "Tone: authoritative but accessible."
    ),
    expected_output=(
        "A polished, publication-ready blog post in Markdown format with "
        "proper headers, clear structure, and actionable insights."
    ),
    agent=writer,
    context=[research_task],  # Writer receives researcher's output
    output_file="blog_post.md",
)

# Assemble the Crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,  # Tasks run in order
    verbose=True,
    memory=True,          # Enable short-term and long-term memory
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"}
    },
)

# Kick it off
result = crew.kickoff(inputs={"topic": "agentic AI frameworks in 2025"})
print(result.raw)
print(f"\\nToken usage: {result.token_usage}")`}}),e.jsx("h2",{children:"Hierarchical Process"}),e.jsx("p",{children:"In hierarchical mode, CrewAI automatically creates a manager agent (using a more powerful LLM) that plans, delegates tasks to worker agents, and validates results. This is suitable for complex, open-ended tasks where dynamic task assignment is needed."}),e.jsx(t,{title:"Hierarchical Crew with Manager",tabs:{python:`from crewai import Agent, Task, Crew, Process
from langchain_anthropic import ChatAnthropic

# Worker agents
analyst = Agent(
    role="Data Analyst",
    goal="Analyze data and extract insights",
    backstory="Expert in statistical analysis and data visualization.",
    llm=ChatAnthropic(model="claude-sonnet-4-6"),
)

developer = Agent(
    role="Software Engineer",
    goal="Write and review code",
    backstory="Senior engineer specializing in Python and data pipelines.",
    llm=ChatAnthropic(model="claude-sonnet-4-6"),
)

# Hierarchical crew — manager is auto-created
crew = Crew(
    agents=[analyst, developer],
    tasks=[complex_task],
    process=Process.hierarchical,
    manager_llm=ChatAnthropic(model="claude-opus-4-6"),  # Smarter manager
    verbose=True,
)

result = crew.kickoff()`}}),e.jsx(i,{name:"Research + Write Crew",category:"Multi-Agent",whenToUse:"Content generation pipelines where research quality directly feeds writing quality. The sequential dependency ensures the writer always has verified, structured data to work from.",children:e.jsxs("p",{children:["Assign a dedicated researcher agent with web search tools and a writer agent with no external tools. Chain them with ",e.jsx("code",{children:"context=[research_task]"})," so the writer receives the full research output. Use ",e.jsx("code",{children:"output_file"})," on the research task to persist findings for auditing."]})}),e.jsx(s,{title:"Craft Detailed Agent Backstories",children:e.jsxs("p",{children:["The ",e.jsx("code",{children:"backstory"}),' field functions as a system prompt for that agent. Be specific about expertise level, work style, and constraints. An agent with backstory "You always verify claims with multiple sources before reporting" will behave measurably differently than one without this instruction. Test backstories by running single-agent tasks before assembling a full crew.']})}),e.jsx(o,{type:"tip",title:"Memory and Caching",children:e.jsxs("p",{children:["Enable ",e.jsx("code",{children:"memory=True"})," on your Crew to give agents short-term memory (within a run) and long-term memory (across runs via a vector store). This is especially valuable for crews that run repeatedly on similar topics. Set",e.jsx("code",{children:"cache=True"})," on individual tools to avoid redundant API calls when the same tool is called with identical arguments."]})})]})}const be=Object.freeze(Object.defineProperty({__proto__:null,default:N},Symbol.toStringTag,{value:"Module"}));function O(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"AutoGen"}),e.jsx("p",{children:"Microsoft AutoGen is a framework for building multi-agent AI systems through conversational patterns. Agents communicate by sending messages to each other, enabling complex workflows like code generation with automated execution, debate between agents with opposing views, and orchestrated multi-step problem solving."}),e.jsx(r,{term:"AssistantAgent",children:e.jsxs("p",{children:[e.jsx("strong",{children:"AssistantAgent"})," is an LLM-backed agent designed to respond to messages, generate code, and provide analysis. It does not execute code itself — it proposes solutions that other agents (like ",e.jsx("code",{children:"UserProxyAgent"}),") execute. Multiple AssistantAgents can specialize in different domains and collaborate."]})}),e.jsx(r,{term:"UserProxyAgent",children:e.jsxs("p",{children:[e.jsx("strong",{children:"UserProxyAgent"}),' represents the "human" in the loop. It can execute code automatically (configurable), request human input at defined points, and manage the conversation termination condition. In fully automated pipelines, it runs code in a sandboxed Docker container and feeds results back to the assistant.']})}),e.jsx(r,{term:"GroupChat",children:e.jsxs("p",{children:[e.jsx("strong",{children:"GroupChat"})," enables more than two agents to collaborate in a shared conversation. A ",e.jsx("code",{children:"GroupChatManager"})," (backed by an LLM) selects the next speaker based on the conversation history. This supports patterns like a manager delegating to specialists or agents debating a problem."]})}),e.jsx("h2",{children:"Installation"}),e.jsx(t,{title:"Installing AutoGen 0.4",tabs:{python:`# AutoGen 0.4 (agentchat package)
pip install pyautogen

# With code execution support (Docker recommended)
pip install pyautogen[docker]

# Or with local execution (less secure)
pip install pyautogen`}}),e.jsx("h2",{children:"Basic Two-Agent Conversation"}),e.jsx(t,{title:"AssistantAgent + UserProxyAgent",tabs:{python:`import autogen

# AutoGen 0.4 configuration
config_list = [
    {
        "model": "claude-opus-4-6",
        "api_key": "your-anthropic-key",
        "api_type": "anthropic",
    }
]

llm_config = {
    "config_list": config_list,
    "temperature": 0,
    "timeout": 120,
    "cache_seed": 42,  # Set to None to disable caching
}

# Assistant: LLM-backed, writes code and provides solutions
assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message=(
        "You are a helpful AI assistant specializing in data analysis and Python. "
        "When writing code, always include error handling and comments. "
        "After the user executes code, analyze the output and suggest next steps."
    ),
)

# UserProxy: executes code, represents human feedback
user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",     # "NEVER", "TERMINATE", or "ALWAYS"
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("TERMINATE"),
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False,  # Set True for production (sandboxed execution)
        "timeout": 60,
    },
)

# Start the conversation — UserProxy sends the initial message
user_proxy.initiate_chat(
    assistant,
    message=(
        "Analyze the CSV file at 'data/sales.csv'. "
        "Calculate monthly revenue trends and plot a line chart. "
        "Save the chart to 'output/revenue_trend.png'."
    ),
)`}}),e.jsx("h2",{children:"GroupChat: Multi-Agent Collaboration"}),e.jsxs("p",{children:["GroupChat enables structured conversations between three or more agents. The",e.jsx("code",{children:"GroupChatManager"})," uses an LLM to select the next speaker, creating dynamic delegation patterns."]}),e.jsx(t,{title:"GroupChat with Specialized Agents",tabs:{python:`import autogen

config_list = [{"model": "claude-opus-4-6", "api_type": "anthropic", "api_key": "..."}]
llm_config = {"config_list": config_list, "temperature": 0}

# Specialized agents
planner = autogen.AssistantAgent(
    name="Planner",
    system_message=(
        "You are a project planner. Break down complex tasks into clear steps. "
        "Assign each step to either the Coder or the Reviewer. "
        "Say 'TERMINATE' when all tasks are complete and verified."
    ),
    llm_config=llm_config,
)

coder = autogen.AssistantAgent(
    name="Coder",
    system_message=(
        "You are an expert Python developer. Write clean, tested code. "
        "Always follow PEP 8 and include type hints. "
        "Reply with just the code block when asked to implement something."
    ),
    llm_config=llm_config,
)

reviewer = autogen.AssistantAgent(
    name="Reviewer",
    system_message=(
        "You are a senior code reviewer. Check code for: bugs, security issues, "
        "performance problems, and best practice violations. "
        "Provide specific, actionable feedback."
    ),
    llm_config=llm_config,
)

user_proxy = autogen.UserProxyAgent(
    name="User",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=15,
    code_execution_config={"work_dir": "output", "use_docker": False},
    is_termination_msg=lambda x: "TERMINATE" in x.get("content", ""),
)

# Set up GroupChat
groupchat = autogen.GroupChat(
    agents=[user_proxy, planner, coder, reviewer],
    messages=[],
    max_round=20,
    speaker_selection_method="auto",  # LLM picks next speaker
    allow_repeat_speaker=False,
)

manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config,
)

# Kick off the group conversation
user_proxy.initiate_chat(
    manager,
    message=(
        "Build a Python web scraper that: extracts article titles and dates "
        "from a news site, stores results in SQLite, and runs on a schedule. "
        "Include unit tests."
    ),
)`}}),e.jsx("h2",{children:"Nested Chat Patterns"}),e.jsx("p",{children:`AutoGen supports nested chats where an agent's reply is itself generated by a sub-conversation between agents. This enables "inner monologue" patterns where a specialist consultation happens transparently before the main agent responds.`}),e.jsx(t,{title:"Nested Chat for Expert Consultation",tabs:{python:`import autogen

# Main conversation agents
assistant = autogen.AssistantAgent("assistant", llm_config=llm_config)
user_proxy = autogen.UserProxyAgent(
    "user",
    human_input_mode="NEVER",
    code_execution_config=False,
)

# Expert agents for nested consultation
security_expert = autogen.AssistantAgent(
    "security_expert",
    system_message="You are a cybersecurity expert. Review code for vulnerabilities.",
    llm_config=llm_config,
)
perf_expert = autogen.AssistantAgent(
    "perf_expert",
    system_message="You are a performance engineer. Identify bottlenecks.",
    llm_config=llm_config,
)

# Register nested reply: before assistant responds, consult experts
assistant.register_nested_chats(
    [
        {
            "recipient": security_expert,
            "message": lambda recipient, messages, sender, config: (
                f"Review this code for security issues:\\n{messages[-1]['content']}"
            ),
            "summary_method": "last_msg",
            "max_turns": 2,
        },
        {
            "recipient": perf_expert,
            "message": lambda recipient, messages, sender, config: (
                f"Review this code for performance issues:\\n{messages[-1]['content']}"
            ),
            "summary_method": "last_msg",
            "max_turns": 2,
        },
    ],
    trigger=user_proxy,  # Only trigger when user_proxy sends a message
)

user_proxy.initiate_chat(
    assistant,
    message="Write a function to process 10M records from a CSV file.",
)`}}),e.jsx(i,{name:"Code Generation with Automated Testing",category:"Multi-Agent",whenToUse:"When you need to generate and verify code automatically. The UserProxyAgent executes code in a sandbox and feeds results back, creating a feedback loop that catches bugs before delivery.",children:e.jsxs("p",{children:["Configure ",e.jsx("code",{children:"UserProxyAgent"})," with ",e.jsx("code",{children:'human_input_mode="NEVER"'}),"and ",e.jsx("code",{children:"use_docker=True"})," for safe automated code execution. Set",e.jsx("code",{children:"is_termination_msg"}),' to detect when the assistant indicates success (e.g., "all tests pass" or "TERMINATE"). Limit ',e.jsx("code",{children:"max_consecutive_auto_reply"}),"to prevent runaway execution loops."]})}),e.jsx(s,{title:"Use Docker for Code Execution in Production",children:e.jsxs("p",{children:["Always use ",e.jsx("code",{children:"use_docker=True"})," when running code generated by LLMs in production environments. The Docker sandbox prevents generated code from accessing the host filesystem, network, or system resources. Configure the Docker image to include only the dependencies your agents need — this also serves as documentation of your execution environment."]})}),e.jsx(o,{type:"warning",title:"AutoGen Version Fragmentation",children:e.jsxs("p",{children:["AutoGen has gone through significant API changes. Version 0.2.x uses",e.jsx("code",{children:"pyautogen"}),". Version 0.4 introduced a complete rewrite with",e.jsx("code",{children:"autogen-agentchat"})," and ",e.jsx("code",{children:"autogen-core"})," packages. Pin your version in ",e.jsx("code",{children:"requirements.txt"})," and check the migration guide when upgrading. The examples above target the 0.2.x API which remains widely deployed."]})})]})}const we=Object.freeze(Object.defineProperty({__proto__:null,default:O},Symbol.toStringTag,{value:"Module"}));function G(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Haystack"}),e.jsxs("p",{children:["Haystack (by deepset) is a production-ready LLM framework built around the concept of composable ",e.jsx("strong",{children:"Pipelines"}),". Each pipeline is a directed acyclic graph of",e.jsx("strong",{children:"Components"})," — modular, typed building blocks for document processing, retrieval, generation, and ranking. Haystack emphasizes testability, observability, and deployment readiness."]}),e.jsx(r,{term:"Pipeline",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Pipeline"})," in Haystack is a directed graph connecting components via typed input/output connections. Components declare their input and output types; Haystack validates connections at build time and routes data between components at run time. Pipelines can branch (fan-out) and merge (fan-in) for parallel execution."]})}),e.jsx(r,{term:"Component",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Component"})," is a Python class decorated with ",e.jsx("code",{children:"@component"}),"that implements a ",e.jsx("code",{children:"run()"})," method. Components are stateless and reusable. Haystack ships with components for: document loaders, embedders, vector store retrievers, rerankers, generators, and output parsers. Custom components follow the same interface."]})}),e.jsx("h2",{children:"Installation"}),e.jsx(t,{title:"Installing Haystack 2.x",tabs:{python:`# Core Haystack 2.x
pip install haystack-ai

# With Anthropic integration
pip install haystack-ai anthropic-haystack

# With common document processors
pip install haystack-ai trafilatura pypdf sentence-transformers`}}),e.jsx("h2",{children:"RAG Pipeline with Haystack"}),e.jsx(t,{title:"Full RAG Pipeline",tabs:{python:`from haystack import Pipeline, Document
from haystack.components.builders import PromptBuilder
from haystack.components.generators import AnthropicGenerator
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.embedders import (
    SentenceTransformersDocumentEmbedder,
    SentenceTransformersTextEmbedder,
)
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.components.rankers import MetaFieldRanker

# 1. Set up Document Store and index documents
document_store = InMemoryDocumentStore()

# Prepare documents
docs = [
    Document(
        content="RAG combines retrieval with generation for grounded responses.",
        meta={"source": "rag_paper.pdf", "page": 1},
    ),
    Document(
        content="Vector databases store embeddings for semantic similarity search.",
        meta={"source": "vector_db_guide.pdf", "page": 3},
    ),
    Document(
        content="LlamaIndex and LangChain both support RAG pipeline construction.",
        meta={"source": "framework_comparison.pdf", "page": 7},
    ),
]

# Indexing pipeline: embed and store documents
indexing_pipeline = Pipeline()
indexing_pipeline.add_component(
    "embedder",
    SentenceTransformersDocumentEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
)
indexing_pipeline.add_component("writer", DocumentWriter(document_store=document_store))
indexing_pipeline.connect("embedder", "writer")

indexing_pipeline.run({"embedder": {"documents": docs}})

# 2. RAG query pipeline
rag_template = """
Answer the question based ONLY on the given context.
If the context doesn't contain the answer, say "I don't know."

Context:
{% for doc in documents %}
  - {{ doc.content }}
{% endfor %}

Question: {{ question }}
Answer:
"""

rag_pipeline = Pipeline()

# Add components
rag_pipeline.add_component(
    "query_embedder",
    SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
)
rag_pipeline.add_component(
    "retriever",
    InMemoryEmbeddingRetriever(document_store=document_store, top_k=5)
)
rag_pipeline.add_component(
    "ranker",
    MetaFieldRanker(meta_field="source")  # Optional: rerank by metadata
)
rag_pipeline.add_component("prompt_builder", PromptBuilder(template=rag_template))
rag_pipeline.add_component(
    "llm",
    AnthropicGenerator(model="claude-opus-4-6", api_key=Secret.from_env_var("ANTHROPIC_API_KEY"))
)

# Connect components: data flows through the graph
rag_pipeline.connect("query_embedder.embedding", "retriever.query_embedding")
rag_pipeline.connect("retriever.documents", "ranker.documents")
rag_pipeline.connect("ranker.documents", "prompt_builder.documents")
rag_pipeline.connect("prompt_builder.prompt", "llm.prompt")

# 3. Run the pipeline
result = rag_pipeline.run({
    "query_embedder": {"text": "What is RAG?"},
    "prompt_builder": {"question": "What is RAG?"},
})

print(result["llm"]["replies"][0])`}}),e.jsx("h2",{children:"Async Support and Streaming"}),e.jsx(t,{title:"Async Pipeline Execution",tabs:{python:`from haystack import AsyncPipeline
from haystack.components.generators import AnthropicGenerator
from haystack.components.builders import PromptBuilder

# AsyncPipeline runs components concurrently when possible
async_pipeline = AsyncPipeline()
async_pipeline.add_component("prompt_builder", PromptBuilder(template="Answer: {{ question }}"))
async_pipeline.add_component(
    "llm",
    AnthropicGenerator(model="claude-opus-4-6", streaming_callback=print_streaming_chunk)
)
async_pipeline.connect("prompt_builder.prompt", "llm.prompt")

import asyncio

async def run_rag(question: str):
    result = await async_pipeline.run_async({
        "prompt_builder": {"question": question}
    })
    return result["llm"]["replies"][0]

# Run multiple queries in parallel
questions = [
    "What is RAG?",
    "How do vector databases work?",
    "Compare LangChain and LlamaIndex.",
]

answers = asyncio.run(asyncio.gather(*[run_rag(q) for q in questions]))
for q, a in zip(questions, answers):
    print(f"Q: {q}\\nA: {a}\\n")`}}),e.jsx("h2",{children:"Custom Components"}),e.jsx(t,{title:"Building a Custom Haystack Component",tabs:{python:`from haystack import component
from haystack.core.component.types import Variadic
from typing import List, Optional

@component
class KeywordFilter:
    """
    Filters documents by required or excluded keywords.
    Custom components must implement run() with typed I/O.
    """
    def __init__(self, required_keywords: List[str] = None, exclude_keywords: List[str] = None):
        self.required_keywords = required_keywords or []
        self.exclude_keywords = exclude_keywords or []

    @component.output_types(documents=List[Document], filtered_count=int)
    def run(self, documents: List[Document]) -> dict:
        """
        Filter documents by keywords.

        Args:
            documents: Input documents to filter.

        Returns:
            documents: Filtered list of documents.
            filtered_count: Number of documents removed.
        """
        original_count = len(documents)
        filtered = []

        for doc in documents:
            content_lower = doc.content.lower()

            # Check required keywords (ALL must be present)
            if self.required_keywords:
                if not all(kw.lower() in content_lower for kw in self.required_keywords):
                    continue

            # Check excluded keywords (NONE must be present)
            if any(kw.lower() in content_lower for kw in self.exclude_keywords):
                continue

            filtered.append(doc)

        return {
            "documents": filtered,
            "filtered_count": original_count - len(filtered)
        }

# Use in a pipeline
pipeline = Pipeline()
pipeline.add_component("retriever", InMemoryEmbeddingRetriever(document_store=store, top_k=10))
pipeline.add_component(
    "filter",
    KeywordFilter(required_keywords=["production"], exclude_keywords=["deprecated"])
)
pipeline.add_component("prompt_builder", PromptBuilder(template=template))
pipeline.add_component("llm", AnthropicGenerator(model="claude-opus-4-6"))

pipeline.connect("retriever.documents", "filter.documents")
pipeline.connect("filter.documents", "prompt_builder.documents")
pipeline.connect("prompt_builder.prompt", "llm.prompt")`}}),e.jsx(i,{name:"Hybrid Retrieval Pipeline",category:"RAG",whenToUse:"Production RAG where recall matters. Combines sparse (BM25) and dense (embedding) retrieval, then reranks with a cross-encoder for precision. Higher latency but significantly better retrieval quality.",children:e.jsxs("p",{children:["Run ",e.jsx("code",{children:"BM25Retriever"})," and ",e.jsx("code",{children:"EmbeddingRetriever"})," in parallel branches, merge their document lists with a ",e.jsx("code",{children:"DocumentJoiner"})," component (reciprocal rank fusion), then pass through a ",e.jsx("code",{children:"SentenceTransformersDiversityRanker"}),"for final reranking. Haystack's pipeline fan-out/fan-in handles the parallel branches automatically."]})}),e.jsx(s,{title:"Serialize Pipelines for Deployment",children:e.jsxs("p",{children:["Haystack pipelines can be serialized to YAML for version control and deployment configuration: ",e.jsx("code",{children:"pipeline.dump()"})," / ",e.jsx("code",{children:"Pipeline.load()"}),". Store pipeline definitions in your repository alongside code, enabling reproducible deployments and easy A/B testing of different pipeline configurations without code changes. Use environment variables for all secrets and model names."]})}),e.jsx(o,{type:"tip",title:"Haystack vs LangChain",children:e.jsx("p",{children:"Haystack excels at production RAG pipelines with strong typing, built-in validation, and serialization. LangChain has a larger ecosystem of integrations and more flexible agent patterns. Choose Haystack when: you need pipeline serialization, strict type safety, or deepset's enterprise support. Choose LangChain when: you need the widest tool/model integration options or LangGraph for complex agent workflows."})})]})}const Ae=Object.freeze(Object.defineProperty({__proto__:null,default:G},Symbol.toStringTag,{value:"Module"}));function z(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"DSPy"}),e.jsxs("p",{children:["DSPy (Declarative Self-improving Python) is a framework for ",e.jsx("em",{children:"programming"}),"— not prompting — LLMs. Instead of manually crafting prompts, you define the",e.jsx("strong",{children:"signatures"})," (inputs and outputs) and ",e.jsx("strong",{children:"modules"}),"(reasoning strategies), then use ",e.jsx("strong",{children:"optimizers"})," to automatically discover effective prompts or fine-tune weights for your task."]}),e.jsx(r,{term:"Signature",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Signature"})," defines the input/output contract for an LLM call. It specifies field names with type annotations and docstrings that DSPy uses to construct prompts. Signatures decouple ",e.jsx("em",{children:"what you want"})," from ",e.jsx("em",{children:"how the LLM is instructed to do it"})," — the optimizer fills in the latter."]})}),e.jsx(r,{term:"Module",children:e.jsxs("p",{children:["A ",e.jsx("strong",{children:"Module"})," is a composable building block that implements a reasoning strategy. ",e.jsx("code",{children:"Predict"})," does a direct LLM call. ",e.jsx("code",{children:"ChainOfThought"}),"elicits step-by-step reasoning. ",e.jsx("code",{children:"ReAct"})," implements tool-augmented reasoning. Modules are composable — you build complex programs by combining them."]})}),e.jsx(r,{term:"Optimizer (Teleprompter)",children:e.jsxs("p",{children:["An ",e.jsx("strong",{children:"Optimizer"})," automatically improves your DSPy program by searching for better prompts or few-shot examples. ",e.jsx("code",{children:"BootstrapFewShot"})," generates training demonstrations from your examples. ",e.jsx("code",{children:"MIPRO"})," (Multi-prompt Instruction PRoposal Optimizer) uses Bayesian optimization to find optimal instructions across all modules in your program."]})}),e.jsx("h2",{children:"Installation and Setup"}),e.jsx(t,{title:"Installing DSPy",tabs:{python:`pip install dspy

# Configure the LLM
import dspy

# Use Claude via LiteLLM integration
lm = dspy.LM("anthropic/claude-opus-4-6", api_key="your-key", max_tokens=4096)
dspy.configure(lm=lm)

# Or use OpenAI
lm = dspy.LM("openai/gpt-4o", api_key="your-openai-key")
dspy.configure(lm=lm)`}}),e.jsx("h2",{children:"Signatures and Predict"}),e.jsx(t,{title:"Defining Signatures and Using Predict",tabs:{python:`import dspy

dspy.configure(lm=dspy.LM("anthropic/claude-opus-4-6", api_key="..."))

# Inline signature: "input_field -> output_field"
classify = dspy.Predict("text -> sentiment: str, confidence: float")
result = classify(text="This product is absolutely fantastic!")
print(result.sentiment)   # "positive"
print(result.confidence)  # 0.98

# Class-based signature with field descriptions
class SummarizeWithKeypoints(dspy.Signature):
    """Summarize the document and extract the most important points."""

    document: str = dspy.InputField(desc="The document to summarize")
    audience: str = dspy.InputField(desc="Target audience: technical or general")
    summary: str = dspy.OutputField(desc="A 2-3 sentence summary")
    key_points: list[str] = dspy.OutputField(desc="3-5 bullet points of key takeaways")

summarize = dspy.Predict(SummarizeWithKeypoints)

result = summarize(
    document="Large language models have transformed NLP...",
    audience="technical"
)
print(result.summary)
print(result.key_points)`}}),e.jsx("h2",{children:"ChainOfThought and ReAct Modules"}),e.jsx(t,{title:"ChainOfThought and Tool-Augmented ReAct",tabs:{python:`import dspy

# ChainOfThought: adds "Let's think step by step" reasoning
class MathReasoner(dspy.Signature):
    """Solve the math problem step by step."""
    problem: str = dspy.InputField()
    answer: float = dspy.OutputField()

cot = dspy.ChainOfThought(MathReasoner)
result = cot(problem="If a train travels at 60 mph for 2.5 hours, how far does it go?")
print(result.reasoning)  # Chain of thought
print(result.answer)     # 150.0

# ReAct: tool-augmented reasoning
def search_web(query: str) -> str:
    """Search the web for information about the query."""
    # In production, call a real search API
    return f"Search results for: {query}"

def calculator(expression: str) -> str:
    """Evaluate a mathematical expression."""
    import ast
    result = eval(compile(ast.parse(expression, mode='eval'), '<str>', 'eval'))
    return str(result)

class ResearchQuestion(dspy.Signature):
    """Answer the question using available tools to find and compute information."""
    question: str = dspy.InputField()
    answer: str = dspy.OutputField(desc="Comprehensive answer with sources")

react_agent = dspy.ReAct(
    ResearchQuestion,
    tools=[search_web, calculator],
    max_iters=5,
)

result = react_agent(
    question="What is the GDP of France divided by the population of Germany?"
)
print(result.answer)`}}),e.jsx("h2",{children:"Building a RAG Module"}),e.jsx(t,{title:"DSPy RAG Program",tabs:{python:`import dspy
from dspy.retrieve import ChromadbRM  # or any retriever

# Configure LLM and retriever
lm = dspy.LM("anthropic/claude-opus-4-6", api_key="...")
retriever = ChromadbRM(
    collection_name="my_docs",
    persist_directory="./chroma_db",
    k=5,
)
dspy.configure(lm=lm, rm=retriever)

# Define the RAG signature
class GenerateAnswer(dspy.Signature):
    """Answer the question based on the retrieved context. Be factual and cite sources."""
    context: list[str] = dspy.InputField(desc="Relevant passages from the knowledge base")
    question: str = dspy.InputField()
    answer: str = dspy.OutputField(desc="Detailed answer grounded in the context")

# Build the RAG module
class RAG(dspy.Module):
    def __init__(self, num_passages: int = 5):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=num_passages)
        self.generate = dspy.ChainOfThought(GenerateAnswer)

    def forward(self, question: str) -> dspy.Prediction:
        passages = self.retrieve(question).passages
        prediction = self.generate(context=passages, question=question)
        return dspy.Prediction(answer=prediction.answer, context=passages)

rag = RAG(num_passages=5)
result = rag(question="What are the trade-offs between BM25 and dense retrieval?")
print(result.answer)`}}),e.jsx("h2",{children:"Optimizing with BootstrapFewShot"}),e.jsx(t,{title:"Automatic Prompt Optimization",tabs:{python:`import dspy
from dspy.evaluate import Evaluate
from dspy.teleprompt import BootstrapFewShot, MIPROv2

# Prepare training and validation examples
trainset = [
    dspy.Example(question="What is RAG?", answer="RAG combines retrieval with generation...").with_inputs("question"),
    dspy.Example(question="How does BM25 work?", answer="BM25 is a probabilistic ranking function...").with_inputs("question"),
    # ... more examples
]

devset = [
    dspy.Example(question="Compare RAG and fine-tuning.", answer="...").with_inputs("question"),
    # ... more examples
]

# Define evaluation metric
def answer_quality(example, prediction, trace=None) -> bool:
    """Returns True if the predicted answer is correct/relevant."""
    # Use an LLM judge or exact match depending on your task
    judge = dspy.Predict("question, predicted_answer, gold_answer -> is_correct: bool")
    result = judge(
        question=example.question,
        predicted_answer=prediction.answer,
        gold_answer=example.answer,
    )
    return result.is_correct

# Optimize with BootstrapFewShot (fast, good baseline)
optimizer = BootstrapFewShot(
    metric=answer_quality,
    max_bootstrapped_demos=4,  # Few-shot examples to add to prompt
    max_labeled_demos=4,
    max_rounds=2,
)

rag = RAG(num_passages=5)
optimized_rag = optimizer.compile(rag, trainset=trainset)

# Evaluate on dev set
evaluator = Evaluate(devset=devset, num_threads=4, display_progress=True)
score = evaluator(optimized_rag, metric=answer_quality)
print(f"Optimized RAG accuracy: {score:.1%}")

# Save and reload optimized program
optimized_rag.save("optimized_rag.json")
loaded_rag = RAG().load("optimized_rag.json")

# Advanced: MIPRO optimizer (better results, slower)
mipro_optimizer = MIPROv2(
    metric=answer_quality,
    auto="medium",  # "light", "medium", or "heavy" optimization budget
)
mipro_rag = mipro_optimizer.compile(
    rag,
    trainset=trainset,
    eval_kwargs={"num_threads": 4, "display_progress": True},
)`}}),e.jsx(i,{name:"Compiled DSPy Programs for Production",category:"Prompt Engineering",whenToUse:"When you have labeled examples and want to systematically improve prompt quality without manual prompt engineering. DSPy optimization typically improves accuracy by 10-40% over hand-written prompts.",children:e.jsxs("p",{children:["Train your DSPy program on a small labeled set (20-100 examples), optimize with",e.jsx("code",{children:"BootstrapFewShot"})," as a baseline, then evaluate on a held-out test set. Save the compiled program JSON and load it in production. Re-optimize when you update the underlying model or add new task examples."]})}),e.jsx(s,{title:"Start with Signatures, Add Optimization Later",children:e.jsxs("p",{children:["Build your DSPy program with simple ",e.jsx("code",{children:"Predict"})," modules first and verify the structure works. Only then run optimizers — they require labeled examples and compute time. Use ",e.jsx("code",{children:"ChainOfThought"})," as a drop-in upgrade for",e.jsx("code",{children:"Predict"})," on reasoning-heavy steps. Reserve ",e.jsx("code",{children:"MIPROv2"})," for your most critical modules where the optimization cost is justified."]})}),e.jsx(o,{type:"tip",title:"DSPy vs. Manual Prompt Engineering",children:e.jsx("p",{children:"DSPy is most valuable when: (1) you have evaluation metrics and labeled examples, (2) you switch models frequently (compiled programs adapt automatically), or (3) your prompt is complex with multiple steps. For simple, stable one-shot tasks, manual prompting is often faster. DSPy shines for agentic pipelines with many modules where manual optimization of each prompt is impractical."})})]})}const ke=Object.freeze(Object.defineProperty({__proto__:null,default:z},Symbol.toStringTag,{value:"Module"})),F=[{id:"runner",label:"ADK Runner",type:"agent",x:60,y:150},{id:"agent",label:"Root Agent",type:"llm",x:230,y:150},{id:"sub1",label:`Sub-Agent
(Research)`,type:"llm",x:420,y:80},{id:"sub2",label:`Sub-Agent
(Writing)`,type:"llm",x:420,y:220},{id:"tool1",label:"Google Search",type:"tool",x:600,y:60},{id:"tool2",label:"Code Exec",type:"tool",x:600,y:140},{id:"tool3",label:"Custom Tool",type:"tool",x:600,y:220},{id:"session",label:"Session / Memory",type:"store",x:230,y:280}],B=[{from:"runner",to:"agent",label:"run()"},{from:"agent",to:"sub1",label:"delegate"},{from:"agent",to:"sub2",label:"delegate"},{from:"sub1",to:"tool1",label:"call"},{from:"sub1",to:"tool2",label:"call"},{from:"sub2",to:"tool3",label:"call"},{from:"agent",to:"session",label:"state"},{from:"runner",to:"session",label:"persist"}];function U(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Google Agent Development Kit (ADK)"}),e.jsxs("p",{children:["The ",e.jsx("strong",{children:"Google Agent Development Kit (ADK)"})," is an open-source Python framework (Apache 2.0) released in April 2025. It is optimised for Gemini models but model-agnostic — you can plug in OpenAI, Anthropic, or any LiteLLM-compatible model. ADK makes it straightforward to build ",e.jsx("strong",{children:"multi-agent pipelines"})," ","with built-in session management, streaming, tool execution, evaluation, and deployment to Google Cloud Agent Engine."]}),e.jsx(r,{term:"Google ADK",children:e.jsxs("p",{children:["ADK structures agentic applications around three primitives:"," ",e.jsx("strong",{children:"Agents"})," (LLM-powered decision makers),"," ",e.jsx("strong",{children:"Tools"})," (Python functions, other agents, MCP servers), and"," ",e.jsx("strong",{children:"Runners"})," (the execution engine that manages sessions and the tool-call loop). Agents can be composed into hierarchies — a root agent orchestrates specialised sub-agents, each with their own tools."]})}),e.jsx(c,{nodes:F,edges:B,title:"Google ADK Multi-Agent Architecture"}),e.jsx("h2",{children:"Installation"}),e.jsx(t,{title:"Install ADK",tabs:{bash:`pip install google-adk

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
# - Evaluate agent responses`}}),e.jsx(s,{title:"Google ADK Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Set ",e.jsx("code",{children:"output_schema"})," (a Pydantic model) on agents that produce structured data — it enforces JSON output via constrained generation."]}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"SequentialAgent"})," or ",e.jsx("code",{children:"ParallelAgent"})," for deterministic pipelines instead of relying on LLM routing."]}),e.jsxs("li",{children:["Always pass ",e.jsx("code",{children:"app_name"})," and ",e.jsx("code",{children:"user_id"})," consistently — they key the session store."]}),e.jsxs("li",{children:["Enable ",e.jsx("code",{children:"enable_tracing=True"})," in production for Cloud Trace visibility."]}),e.jsxs("li",{children:["Pin your ADK version in ",e.jsx("code",{children:"requirements.txt"})," — the SDK is evolving rapidly."]})]})}),e.jsxs(o,{children:["ADK is available at ",e.jsx("strong",{children:"github.com/google/adk-python"})," and documented at ",e.jsx("strong",{children:"google.github.io/adk-docs"}),". The framework supports Gemini (native), LiteLLM (for any model), and Anthropic Claude directly via the LiteLLM adapter."]})]})}const je=Object.freeze(Object.defineProperty({__proto__:null,default:U},Symbol.toStringTag,{value:"Module"})),W=[{id:"app",label:"Your Application",type:"agent",x:60,y:150},{id:"svc",label:"Azure AI Agent Service",type:"llm",x:240,y:150},{id:"thread",label:"Thread (history)",type:"store",x:420,y:80},{id:"tools",label:"Built-in Tools",type:"tool",x:420,y:150},{id:"func",label:"Azure Functions",type:"tool",x:420,y:220},{id:"storage",label:"Azure Blob / AI Search",type:"store",x:620,y:80},{id:"bing",label:"Bing Search",type:"external",x:620,y:150},{id:"logic",label:"Custom Logic",type:"external",x:620,y:220}],K=[{from:"app",to:"svc",label:"SDK"},{from:"svc",to:"thread",label:"persist"},{from:"svc",to:"tools",label:"auto-call"},{from:"svc",to:"func",label:"function call"},{from:"tools",to:"storage",label:"RAG / files"},{from:"tools",to:"bing",label:"search"},{from:"func",to:"logic",label:"execute"}];function H(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Azure AI Agent Service"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Azure AI Agent Service"})," (generally available since early 2025) is Microsoft's fully managed platform for building and running production AI agents. It is compatible with the OpenAI Assistants API v2, so code written against OpenAI's SDK works with minimal changes. Agents run on Azure models (GPT-4o, Phi-4) or bring-your-own models from the Azure AI model catalogue, including Claude via Azure AI Foundry."]}),e.jsx(r,{term:"Azure AI Agent Service",children:e.jsxs("p",{children:["The service manages the agent lifecycle — thread storage, tool execution, and the run loop — as a fully managed cloud service. You define an agent's instructions and tools once; the service handles retry logic, auto-scaling, and Azure Monitor integration. Supported built-in tools include"," ",e.jsx("strong",{children:"file search"})," (RAG over uploaded documents),"," ",e.jsx("strong",{children:"code interpreter"})," (sandboxed Python), and"," ",e.jsx("strong",{children:"Bing grounding"})," (live web search)."]})}),e.jsx(c,{nodes:W,edges:K,title:"Azure AI Agent Service Architecture"}),e.jsx("h2",{children:"Installation & Auth"}),e.jsx(t,{title:"Setup",tabs:{bash:`pip install azure-ai-projects azure-identity

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
        thread = response.thread`,bash:"pip install semantic-kernel[azure]"}}),e.jsx(s,{title:"Azure AI Agent Service Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:["Use ",e.jsx("code",{children:"create_and_process_run"})," for simple flows; use ",e.jsx("code",{children:"create_run"})," + polling for fine-grained control and streaming."]}),e.jsx("li",{children:"Delete threads when done to avoid storage cost accumulation — they persist indefinitely by default."}),e.jsxs("li",{children:["Set ",e.jsx("code",{children:"truncation_strategy"})," on runs to control context-window usage in long conversations."]}),e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"Managed Identity"})," (",e.jsx("code",{children:"DefaultAzureCredential"}),") instead of API keys in production."]}),e.jsxs("li",{children:["Enable ",e.jsx("strong",{children:"Azure Monitor"})," diagnostics on your AI Foundry hub for run-level tracing."]})]})}),e.jsxs(o,{children:["Azure AI Agent Service is part of ",e.jsx("strong",{children:"Azure AI Foundry"}),". The Python SDK is ",e.jsx("code",{children:"azure-ai-projects"}),"; the TypeScript SDK is ",e.jsx("code",{children:"@azure/ai-projects"}),". Semantic Kernel (",e.jsx("code",{children:"semantic-kernel"}),") adds higher-level orchestration, process (workflow), and memory abstractions on top."]})]})}const Se=Object.freeze(Object.defineProperty({__proto__:null,default:H},Symbol.toStringTag,{value:"Module"})),V=[{id:"app",label:"Python App",type:"agent",x:60,y:150},{id:"agent",label:"Strands Agent",type:"llm",x:230,y:150},{id:"model",label:`Bedrock Model
(Claude / Nova)`,type:"llm",x:420,y:60},{id:"tools",label:"Tool Registry",type:"tool",x:420,y:150},{id:"memory",label:"Memory Store",type:"store",x:420,y:240},{id:"aws",label:`AWS Services
(S3, Lambda…)`,type:"external",x:620,y:150}],Y=[{from:"app",to:"agent",label:"agent()"},{from:"agent",to:"model",label:"converse"},{from:"agent",to:"tools",label:"dispatch"},{from:"agent",to:"memory",label:"read/write"},{from:"tools",to:"aws",label:"call"},{from:"model",to:"agent",label:"response"}];function Q(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"AWS Agent Frameworks"}),e.jsxs("p",{children:["AWS offers two complementary approaches to building AI agents:"," ",e.jsx("strong",{children:"Amazon Strands Agents SDK"})," — a lightweight open-source Python framework for code-first agent development — and"," ",e.jsx("strong",{children:"Amazon Bedrock Agents"})," — a fully managed service that handles orchestration, RAG, and action groups without writing a loop yourself."]}),e.jsx("h2",{children:"Amazon Strands Agents SDK"}),e.jsx(r,{term:"Amazon Strands Agents SDK",children:e.jsxs("p",{children:["Strands (open-sourced by AWS in May 2025) takes a model-driven approach: define tools as Python functions decorated with ",e.jsx("code",{children:"@tool"}),", pass them to an"," ",e.jsx("code",{children:"Agent"}),", and call the agent like a function. Strands drives the agentic loop via Bedrock's ",e.jsx("code",{children:"converse"})," API, supports streaming, multi-agent orchestration, and integrates with MCP servers natively. It works with any Bedrock-hosted model (Claude, Nova, Llama, Mistral, etc.)."]})}),e.jsx(c,{nodes:V,edges:Y,title:"Strands Agent Architecture"}),e.jsx("h2",{children:"Strands — Installation & First Agent"}),e.jsx(t,{title:"Install and run a Strands agent",tabs:{bash:`pip install strands-agents strands-agents-tools

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
╚════════════════════════╩═══════════════════════╩════════════════════════╝`}}),e.jsx(s,{title:"AWS Agent Best Practices",children:e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Strands:"})," use ",e.jsx("code",{children:"@tool"})," with detailed docstrings — they become the tool descriptions Claude uses for routing decisions."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Strands:"})," set ",e.jsx("code",{children:"max_parallel_tools"})," on the agent to control concurrency when multiple tools can run simultaneously."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Bedrock Agents:"})," always version your agent aliases — never point production traffic at the ",e.jsx("code",{children:"DRAFT"})," alias."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Bedrock Agents:"})," enable ",e.jsx("strong",{children:"CloudWatch logging"})," and ",e.jsx("strong",{children:"session metadata"})," for audit compliance."]}),e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"IAM roles with least privilege"})," for both Strands (Bedrock API calls) and Lambda action groups."]})]})}),e.jsxs(o,{children:["Amazon Strands Agents SDK is available at"," ",e.jsx("strong",{children:"github.com/strands-agents/sdk-python"})," and documented at"," ",e.jsx("strong",{children:"strandsagents.com"}),". Amazon Bedrock Agents is documented in the"," ",e.jsx("strong",{children:"AWS Bedrock developer guide"}),". Both support Claude models via Amazon Bedrock's cross-region inference profiles."]})]})}const Ce=Object.freeze(Object.defineProperty({__proto__:null,default:Q},Symbol.toStringTag,{value:"Module"}));function J(){const a=[{name:"LangChain",primaryUse:"General-purpose LLM orchestration, chains, agents",strengths:"Largest ecosystem, widest integrations (200+ LLMs, tools)",weaknesses:"Abstraction overhead, rapid API changes, verbose for simple tasks",ragSupport:"Yes (LCEL, vectorstores)",agentSupport:"Yes (AgentExecutor, LangGraph)",multiAgent:"Via LangGraph",maturity:"High",license:"MIT",pythonTs:"Both"},{name:"LlamaIndex",primaryUse:"RAG, document indexing, knowledge retrieval",strengths:"Best-in-class RAG primitives, index types, query engines",weaknesses:"Less flexible for non-RAG workflows",ragSupport:"Excellent (native focus)",agentSupport:"Yes (ReActAgent, FunctionCalling)",multiAgent:"Via Workflows",maturity:"High",license:"MIT",pythonTs:"Both"},{name:"CrewAI",primaryUse:"Role-based multi-agent crews",strengths:"Intuitive crew/agent/task model, built-in memory, easy setup",weaknesses:"Less control over low-level agent behavior",ragSupport:"Via tools",agentSupport:"Yes (core focus)",multiAgent:"Excellent (native)",maturity:"Medium",license:"MIT",pythonTs:"Python"},{name:"AutoGen",primaryUse:"Conversational multi-agent systems, code generation",strengths:"Strong code execution, nested chats, research-backed patterns",weaknesses:"Version fragmentation, complex setup for production",ragSupport:"Via custom agents",agentSupport:"Yes (AssistantAgent)",multiAgent:"Excellent (GroupChat)",maturity:"Medium",license:"CC BY 4.0 / MIT",pythonTs:"Python (.NET beta)"},{name:"Haystack",primaryUse:"Production RAG pipelines, document QA",strengths:"Type-safe pipelines, serialization, enterprise support (deepset)",weaknesses:"Smaller community vs LangChain, more verbose component setup",ragSupport:"Excellent (native focus)",agentSupport:"Limited",multiAgent:"No",maturity:"High",license:"Apache 2.0",pythonTs:"Python"},{name:"DSPy",primaryUse:"Systematic prompt optimization, compiled LLM programs",strengths:"Automatic prompt optimization, model-agnostic, research-backed",weaknesses:"Requires labeled data, smaller ecosystem, steep learning curve",ragSupport:"Via Retrieve module",agentSupport:"Via ReAct module",multiAgent:"No",maturity:"Medium",license:"MIT",pythonTs:"Python"}];return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Framework Comparison"}),e.jsx("p",{children:"Choosing the right LLM framework depends heavily on your use case, team expertise, and production requirements. This comparison covers the six major frameworks across the dimensions that matter most for production applications."}),e.jsx("h2",{children:"Feature Matrix"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Framework"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Primary Use"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"RAG"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Agents"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Multi-Agent"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Maturity"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"License"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Languages"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:a.map(n=>e.jsxs("tr",{className:"hover:bg-gray-50 dark:hover:bg-gray-800/50",children:[e.jsx("td",{className:"px-3 py-3 font-semibold text-gray-900 dark:text-gray-100",children:n.name}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:n.primaryUse}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:n.ragSupport}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:n.agentSupport}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:n.multiAgent}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:n.maturity}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono",children:n.license}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:n.pythonTs})]},n.name))})]})}),e.jsx("h2",{children:"Strengths and Weaknesses"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Framework"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Key Strengths"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Key Weaknesses"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:a.map(n=>e.jsxs("tr",{className:"hover:bg-gray-50 dark:hover:bg-gray-800/50",children:[e.jsx("td",{className:"px-3 py-3 font-semibold text-gray-900 dark:text-gray-100",children:n.name}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:n.strengths}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:n.weaknesses})]},n.name))})]})}),e.jsx("h2",{children:"Community and Ecosystem (as of 2025)"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Framework"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"GitHub Stars"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"npm/PyPI Downloads"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Commercial Support"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["LangChain","~95K","Very High","LangChain Inc. (LangSmith)"],["LlamaIndex","~40K","High","LlamaIndex Inc. (LlamaCloud)"],["CrewAI","~25K","Medium","CrewAI Inc."],["AutoGen","~35K","Medium","Microsoft (open source)"],["Haystack","~20K","Medium","deepset (enterprise tier)"],["DSPy","~20K","Medium","Stanford / community"]].map(([n,d,u,h])=>e.jsxs("tr",{className:"hover:bg-gray-50 dark:hover:bg-gray-800/50",children:[e.jsx("td",{className:"px-3 py-3 font-semibold",children:n}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400",children:d}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400",children:u}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400",children:h})]},n))})]})}),e.jsx(s,{title:"Evaluate Frameworks Against Your Specific Use Case",children:e.jsx("p",{children:`The "best" framework depends entirely on your use case. Run a proof-of-concept with your actual data and workload — not a toy example — before committing to a framework. Key metrics to evaluate: time-to-working-prototype, performance on your task (not benchmarks), debuggability when something goes wrong, and your team's ability to maintain it long-term.`})}),e.jsx(o,{type:"tip",title:"Frameworks Are Not Mutually Exclusive",children:e.jsx("p",{children:'Many production systems combine frameworks. A common pattern: LangGraph for agent orchestration + LlamaIndex for retrieval + DSPy for optimized prompts. Each framework can be used for what it does best. See the "Mixing Frameworks" section for interoperability patterns and guidance on when this makes sense.'})})]})}const Te=Object.freeze(Object.defineProperty({__proto__:null,default:J},Symbol.toStringTag,{value:"Module"}));function $(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Framework Selection Criteria"}),e.jsx("p",{children:"Selecting an LLM framework is an architectural decision with long-term consequences. A poor choice leads to fighting abstractions, performance ceilings, and painful migrations. This guide provides a structured decision framework based on use case type, team context, and production requirements."}),e.jsx("h2",{children:"Step 1: Identify Your Primary Use Case"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Use Case"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"First Choice"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Alternative"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Rationale"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["Document Q&A / RAG","LlamaIndex","Haystack","Native RAG primitives, best-in-class index types"],["Complex agent workflows","LangGraph","Custom + Anthropic SDK","State machines, cycles, human-in-the-loop"],["Multi-agent collaboration","CrewAI","AutoGen","Role-based crews, easy setup, memory built-in"],["Code generation & execution","AutoGen","LangGraph","Native code execution sandbox, conversational loops"],["Production RAG pipeline","Haystack","LlamaIndex","Type safety, serialization, enterprise support"],["Prompt optimization","DSPy","None (unique)","Only framework with systematic prompt compilation"],["Simple chatbot / chain","LangChain LCEL","Anthropic SDK directly","Widest model support, streaming built-in"],["TypeScript/Node.js first","LangChain.js","Vercel AI SDK","Best TS ecosystem coverage"]].map(([a,n,d,u])=>e.jsxs("tr",{className:"hover:bg-gray-50 dark:hover:bg-gray-800/50",children:[e.jsx("td",{className:"px-3 py-3 font-medium text-gray-900 dark:text-gray-100",children:a}),e.jsx("td",{className:"px-3 py-3 font-semibold text-blue-600 dark:text-blue-400",children:n}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400",children:d}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:u})]},a))})]})}),e.jsx("h2",{children:"Decision Tree"}),e.jsx(r,{term:"Question 1: Do you need multi-agent orchestration?",children:e.jsxs("p",{children:[e.jsx("strong",{children:"Yes, role-based crews (researcher + writer + reviewer):"})," Use CrewAI. It models agent collaboration naturally and handles task dependencies.",e.jsx("br",{}),e.jsx("strong",{children:"Yes, conversational code-gen with execution:"})," Use AutoGen. Its UserProxyAgent + code execution loop is unmatched for this pattern.",e.jsx("br",{}),e.jsx("strong",{children:"Yes, complex graph-based workflows with cycles/loops:"})," Use LangGraph. Gives you full state machine control.",e.jsx("br",{}),e.jsx("strong",{children:"No:"})," Continue to Question 2."]})}),e.jsx(r,{term:"Question 2: Is retrieval over documents your primary capability?",children:e.jsxs("p",{children:[e.jsx("strong",{children:"Yes, and I need maximum RAG quality:"})," Use LlamaIndex. Best index types, query engines, and retrieval primitives.",e.jsx("br",{}),e.jsx("strong",{children:"Yes, and I need production serialization + type safety:"})," Use Haystack. Pipeline YAML serialization and strongly typed component I/O.",e.jsx("br",{}),e.jsx("strong",{children:"No:"})," Continue to Question 3."]})}),e.jsx(r,{term:"Question 3: Do you need systematic prompt optimization?",children:e.jsxs("p",{children:[e.jsx("strong",{children:"Yes, and I have labeled evaluation data:"})," Use DSPy. Compile prompts automatically using your examples and metric.",e.jsx("br",{}),e.jsx("strong",{children:"No:"})," Continue to Question 4."]})}),e.jsx(r,{term:"Question 4: What is your team's primary language?",children:e.jsxs("p",{children:[e.jsx("strong",{children:"TypeScript/JavaScript first:"})," Use LangChain.js or Vercel AI SDK. Only LangChain has full parity across Python and TypeScript.",e.jsx("br",{}),e.jsx("strong",{children:"Python:"})," Consider LangChain for breadth, or go framework-free with the Anthropic SDK directly for simpler use cases."]})}),e.jsx("h2",{children:"Production Requirements Checklist"}),e.jsx(t,{title:"Framework Evaluation Scorecard",tabs:{python:`# Use this as a decision matrix — score 1-5 for your needs
evaluation_criteria = {
    "observability": {
        "question": "Do you need built-in tracing and debugging?",
        "langchain": 5,      # LangSmith is excellent
        "llamaindex": 4,     # Built-in callbacks, LlamaCloud tracing
        "crewai": 3,         # Basic logging
        "autogen": 3,        # Console logging
        "haystack": 4,       # Haystack tracing + OpenTelemetry
        "dspy": 3,           # MLflow integration
    },
    "streaming": {
        "question": "Do you need real-time streaming output?",
        "langchain": 5,      # Excellent LCEL streaming
        "llamaindex": 4,     # Streaming query engines
        "crewai": 2,         # Limited
        "autogen": 2,        # Limited
        "haystack": 4,       # Async streaming generators
        "dspy": 2,           # Limited streaming
    },
    "evaluation": {
        "question": "Do you need built-in evaluation frameworks?",
        "langchain": 5,      # LangSmith datasets + evals
        "llamaindex": 4,     # LlamaIndex evals library
        "crewai": 2,         # Manual
        "autogen": 2,        # Manual
        "haystack": 4,       # Haystack evaluation pipelines
        "dspy": 5,           # Core feature: metric-driven optimization
    },
    "vendor_lock_in": {
        "question": "How important is avoiding vendor lock-in?",
        "langchain": 4,      # Abstraction over many providers
        "llamaindex": 4,     # Multi-provider support
        "crewai": 3,         # LangChain-based, some lock-in
        "autogen": 4,        # Model-agnostic
        "haystack": 5,       # Fully open, self-hostable
        "dspy": 5,           # Model-agnostic, compile to any LLM
    },
    "deployment_simplicity": {
        "question": "How important is simple production deployment?",
        "langchain": 3,      # LangServe helps, complex deps
        "llamaindex": 3,     # Straightforward but index management needed
        "crewai": 4,         # Simple kickoff() interface
        "autogen": 2,        # Docker setup needed for code execution
        "haystack": 5,       # Serializable pipelines, REST API built-in
        "dspy": 4,           # Load compiled JSON, simple inference
    },
}

def score_framework(framework: str, weights: dict) -> float:
    """Score a framework based on weighted criteria."""
    total = sum(
        evaluation_criteria[criterion][framework] * weight
        for criterion, weight in weights.items()
        if criterion in evaluation_criteria
    )
    max_score = sum(5 * w for w in weights.values())
    return total / max_score

# Example: production RAG application weights
rag_weights = {
    "observability": 0.25,
    "streaming": 0.20,
    "evaluation": 0.25,
    "vendor_lock_in": 0.15,
    "deployment_simplicity": 0.15,
}

for fw in ["langchain", "llamaindex", "haystack", "dspy"]:
    score = score_framework(fw, rag_weights)
    print(f"{fw:12}: {score:.0%}")
# llamaindex  : 84%
# haystack    : 90%
# langchain   : 82%
# dspy        : 70%`}}),e.jsx("h2",{children:"Team Expertise Considerations"}),e.jsx("div",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{className:"bg-gray-50 dark:bg-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Team Background"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Recommended Framework"}),e.jsx("th",{className:"px-3 py-3 text-left font-semibold",children:"Learning Curve"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-100 dark:divide-gray-800",children:[["ML/Research background","DSPy","Medium — familiar concepts, new paradigm"],["Backend / SWE background","Haystack or LangChain","Low — familiar patterns (pipelines, APIs)"],["Data engineering background","LlamaIndex","Low — data pipeline concepts transfer well"],["No LLM framework experience","LangChain or CrewAI","Medium — large community, many tutorials"],["Node.js / TypeScript team","LangChain.js or Vercel AI SDK","Low — native TypeScript support"]].map(([a,n,d])=>e.jsxs("tr",{className:"hover:bg-gray-50 dark:hover:bg-gray-800/50",children:[e.jsx("td",{className:"px-3 py-3 text-gray-900 dark:text-gray-100",children:a}),e.jsx("td",{className:"px-3 py-3 font-semibold text-blue-600 dark:text-blue-400",children:n}),e.jsx("td",{className:"px-3 py-3 text-gray-600 dark:text-gray-400 text-xs",children:d})]},a))})]})}),e.jsx(i,{name:"Thin Wrapper Strategy",category:"Architecture",whenToUse:"When long-term maintainability and framework flexibility matter more than speed of initial development. Wrapping framework calls prevents deep coupling and makes migration feasible.",children:e.jsxs("p",{children:["Wrap all framework calls behind your own interfaces. Define a",e.jsx("code",{children:"Retriever"})," protocol, a ",e.jsx("code",{children:"LLMClient"})," protocol, and a ",e.jsx("code",{children:"Pipeline"})," interface in your codebase. Framework code lives only in adapter implementations. This adds a day of upfront work but makes it possible to swap frameworks without touching application logic."]})}),e.jsx(s,{title:"Prototype Before Committing",children:e.jsx("p",{children:"Before committing to a framework, build a working prototype of your hardest use case — not a hello-world tutorial. The prototype should use your real data, hit the API endpoints you'll call in production, and handle error cases. A day spent prototyping can save weeks of migration later. Document what was easy, what required workarounds, and what was impossible."})}),e.jsx(o,{type:"warning",title:"Framework Stability Varies Significantly",children:e.jsxs("p",{children:["As of 2025, LangChain has a history of breaking changes between minor versions. LlamaIndex has stabilized since 0.10. CrewAI is newer and still evolving rapidly. Haystack 2.x is stable with a clear migration path. Always pin exact versions in production (",e.jsx("code",{children:"requirements.txt"})," or ",e.jsx("code",{children:"poetry.lock"}),") and have a documented upgrade process before updating dependencies."]})})]})}const Ie=Object.freeze(Object.defineProperty({__proto__:null,default:$},Symbol.toStringTag,{value:"Module"}));function Z(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Mixing Frameworks"}),e.jsx("p",{children:"Production AI systems rarely use a single framework for everything. Different frameworks excel at different layers: orchestration, retrieval, prompt optimization, observability. Understanding interoperability patterns lets you pick the best tool for each layer without locking into a monolithic choice."}),e.jsx(r,{term:"Framework Interoperability",children:e.jsxs("p",{children:["Most LLM frameworks converge on common interfaces: LangChain's",e.jsx("code",{children:"BaseChatModel"}),", LlamaIndex's ",e.jsx("code",{children:"LLM"})," base class, and the raw Anthropic/OpenAI API all speak the same token-in/token-out language. Interoperability happens at three layers: ",e.jsx("strong",{children:"LLM clients"})," (shared model access), ",e.jsx("strong",{children:"data formats"})," (LangChain Documents ↔ LlamaIndex Nodes), and ",e.jsx("strong",{children:"tool protocols"})," (function calling schema)."]})}),e.jsx("h2",{children:"LangGraph + LlamaIndex: Orchestration + Retrieval"}),e.jsx("p",{children:"The most common combination: use LangGraph for stateful agent orchestration (loops, conditionals, human-in-the-loop) while delegating retrieval entirely to LlamaIndex query engines, which handle indexing, chunking, and ranking."}),e.jsx(t,{title:"LangGraph Agent Using LlamaIndex Retrieval",tabs:{python:`from typing import TypedDict, List
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage

# LlamaIndex retrieval setup
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.anthropic import Anthropic as LlamaAnthropic
from llama_index.embeddings.openai import OpenAIEmbedding

# Configure LlamaIndex
Settings.llm = LlamaAnthropic(model="claude-opus-4-6")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

docs = SimpleDirectoryReader("./knowledge_base").load_data()
index = VectorStoreIndex.from_documents(docs)

# LlamaIndex query engine — this is what LangGraph will call
retriever_engine = index.as_query_engine(
    similarity_top_k=6,
    response_mode="no_text",  # Return nodes only, not synthesized answer
)

# LangGraph state and nodes
class AgentState(TypedDict):
    question: str
    context: List[str]
    answer: str
    needs_retrieval: bool

# LangChain LLM for orchestration
orchestrator_llm = ChatAnthropic(model="claude-opus-4-6", temperature=0)

def classify_query(state: AgentState) -> dict:
    """Decide if retrieval is needed or if the LLM can answer directly."""
    response = orchestrator_llm.invoke([
        HumanMessage(content=(
            f"Does answering this question require looking up specific documents? "
            f"Answer with just 'yes' or 'no'.\\n\\nQuestion: {state['question']}"
        ))
    ])
    needs = "yes" in response.content.lower()
    return {"needs_retrieval": needs}

def retrieve_with_llamaindex(state: AgentState) -> dict:
    """Use LlamaIndex to retrieve relevant context."""
    # LlamaIndex handles all retrieval complexity
    result = retriever_engine.query(state["question"])

    context = [node.get_content() for node in result.source_nodes]
    return {"context": context}

def generate_answer(state: AgentState) -> dict:
    """Generate final answer with or without retrieved context."""
    if state.get("context"):
        context_str = "\\n\\n".join(state["context"])
        prompt = (
            f"Answer based on this context:\\n{context_str}\\n\\n"
            f"Question: {state['question']}"
        )
    else:
        prompt = state["question"]

    response = orchestrator_llm.invoke([HumanMessage(content=prompt)])
    return {"answer": response.content}

def should_retrieve(state: AgentState) -> str:
    return "retrieve" if state["needs_retrieval"] else "generate"

# Build LangGraph workflow
graph = StateGraph(AgentState)
graph.add_node("classify", classify_query)
graph.add_node("retrieve", retrieve_with_llamaindex)
graph.add_node("generate", generate_answer)

graph.add_edge(START, "classify")
graph.add_conditional_edges("classify", should_retrieve, {
    "retrieve": "retrieve",
    "generate": "generate",
})
graph.add_edge("retrieve", "generate")
graph.add_edge("generate", END)

app = graph.compile()

result = app.invoke({"question": "What chunking strategy works best for code files?"})
print(result["answer"])`}}),e.jsx("h2",{children:"DSPy + LangChain: Optimized Prompts in a Chain"}),e.jsx("p",{children:"DSPy can optimize individual prompt steps that are then wrapped in a LangChain runnable. This lets you use LangChain's ecosystem (streaming, tracing, deployment) while benefiting from DSPy's automatic prompt optimization."}),e.jsx(t,{title:"DSPy-Optimized Step Inside a LangChain Pipeline",tabs:{python:`import dspy
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_anthropic import ChatAnthropic

# 1. Build and optimize a DSPy module
dspy.configure(lm=dspy.LM("anthropic/claude-opus-4-6", api_key="..."))

class ExtractKeyFacts(dspy.Signature):
    """Extract factual claims from text, one per line."""
    text: str = dspy.InputField()
    facts: list[str] = dspy.OutputField(desc="List of factual claims found in the text")

class FactExtractor(dspy.Module):
    def __init__(self):
        self.extract = dspy.ChainOfThought(ExtractKeyFacts)

    def forward(self, text: str) -> list[str]:
        return self.extract(text=text).facts

# Assume we've already optimized this module
fact_extractor = FactExtractor()
# fact_extractor.load("optimized_fact_extractor.json")  # Load compiled version

# 2. Wrap DSPy module as a LangChain runnable
def dspy_extract_facts(inputs: dict) -> dict:
    facts = fact_extractor(text=inputs["text"])
    return {"text": inputs["text"], "facts": facts}

# 3. Build LangChain pipeline using the DSPy step
langchain_llm = ChatAnthropic(model="claude-opus-4-6")

pipeline = (
    RunnablePassthrough()
    | RunnableLambda(dspy_extract_facts)
    | RunnableLambda(lambda x: {
        "prompt": f"Summarize these facts:\\n" + "\\n".join(f"- {f}" for f in x["facts"])
    })
    | RunnableLambda(lambda x: langchain_llm.invoke(x["prompt"]))
    | StrOutputParser()
)

result = pipeline.invoke({"text": "Large language models have achieved..."})
print(result)`}}),e.jsx("h2",{children:"When to Go Framework-Free"}),e.jsx("p",{children:"Sometimes the right answer is no framework at all. The Anthropic SDK (or OpenAI SDK) provides everything you need for many use cases, with zero abstraction overhead."}),e.jsx(t,{title:"Framework-Free: Direct SDK for Simple Pipelines",tabs:{python:`import anthropic
from typing import TypedDict

client = anthropic.Anthropic()

class RAGResult(TypedDict):
    answer: str
    sources: list[str]

def simple_rag(
    question: str,
    retrieve_fn,  # Your own retrieval logic — no framework needed
    model: str = "claude-opus-4-6",
) -> RAGResult:
    """
    A minimal RAG implementation with zero framework dependencies.
    Often all you need for straightforward use cases.
    """
    # Retrieve context using your preferred method
    docs = retrieve_fn(question, top_k=5)
    context = "\\n\\n".join(d["content"] for d in docs)
    sources = [d["source"] for d in docs]

    # Single LLM call — no framework overhead
    response = client.messages.create(
        model=model,
        max_tokens=2048,
        system="Answer questions based on provided context. Cite sources.",
        messages=[{
            "role": "user",
            "content": f"Context:\\n{context}\\n\\nQuestion: {question}"
        }],
    )

    return {
        "answer": response.content[0].text,
        "sources": sources,
    }

# Usage
result = simple_rag(
    question="What is the optimal chunk size for RAG?",
    retrieve_fn=my_vector_store.search,
)
print(result["answer"])`,typescript:`import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface RAGResult {
  answer: string
  sources: string[]
}

async function simpleRAG(
  question: string,
  retrieveFn: (q: string, topK: number) => Promise<Array<{ content: string; source: string }>>,
  model = 'claude-opus-4-6',
): Promise<RAGResult> {
  const docs = await retrieveFn(question, 5)
  const context = docs.map(d => d.content).join('\\n\\n')
  const sources = docs.map(d => d.source)

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: 'Answer questions based on provided context. Cite sources.',
    messages: [{
      role: 'user',
      content: Context:\\n\${context}\\n\\nQuestion: \${question},
    }],
  })

  const text = response.content[0]
  return {
    answer: text.type === 'text' ? text.text : '',
    sources,
  }
}`}}),e.jsx("h2",{children:"Minimal Footprint Architecture"}),e.jsx(t,{title:"Selective Framework Use: Only What You Need",tabs:{python:`# Principle: use frameworks only for the layer where they add clear value
# Example: LlamaIndex for indexing only, raw SDK for generation

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.retrievers import VectorIndexRetriever
import anthropic

# LlamaIndex for what it does best: indexing and retrieval
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.llm = None  # Explicitly disable LlamaIndex LLM — we'll use Anthropic SDK directly

docs = SimpleDirectoryReader("./docs").load_data()
index = VectorStoreIndex.from_documents(docs)

retriever = VectorIndexRetriever(index=index, similarity_top_k=5)

# Anthropic SDK for what it does best: generation
anthropic_client = anthropic.Anthropic()

def answer_question(question: str) -> str:
    # LlamaIndex handles retrieval
    nodes = retriever.retrieve(question)
    context = "\\n\\n".join(n.get_content() for n in nodes)

    # Anthropic SDK handles generation — full control, no abstractions
    message = anthropic_client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        system="Answer based on the provided context only.",
        messages=[{"role": "user", "content": f"Context:\\n{context}\\n\\nQ: {question}"}],
    )
    return message.content[0].text

print(answer_question("What are the best practices for RAG chunking?"))`}}),e.jsx(i,{name:"Layer-Based Framework Assignment",category:"Architecture",whenToUse:"Multi-component systems where different layers have different requirements. Prevents any single framework's weaknesses from affecting the whole system.",children:e.jsxs("p",{children:["Assign frameworks to layers: ",e.jsx("strong",{children:"indexing/retrieval"})," (LlamaIndex or Haystack), ",e.jsx("strong",{children:"orchestration/agents"})," (LangGraph or custom), ",e.jsx("strong",{children:"prompt optimization"})," (DSPy, offline), ",e.jsx("strong",{children:"observability"})," (LangSmith or OpenTelemetry). Each layer can be replaced independently. Define clear interfaces between layers using Python protocols or TypeScript interfaces."]})}),e.jsx(s,{title:"Define Your Own Interfaces at Layer Boundaries",children:e.jsxs("p",{children:["At every point where one framework hands off to another, define your own typed interface in your codebase — not a framework type. For example, define",e.jsx("code",{children:"RetrievedDocument(content: str, source: str, score: float)"})," as your internal type, and convert LlamaIndex ",e.jsx("code",{children:"NodeWithScore"})," or LangChain",e.jsx("code",{children:"Document"})," objects at the boundary. This prevents framework types from leaking across your codebase and makes swapping implementations straightforward."]})}),e.jsx(o,{type:"tip",title:"Monitor Dependency Footprint",children:e.jsxs("p",{children:["Each framework adds transitive dependencies. LangChain pulls in 50+ packages; LlamaIndex is similar. In constrained environments (Lambda functions, edge deployments, Docker images), audit your dependency tree with ",e.jsx("code",{children:"pip show langchain | grep Requires"}),"or ",e.jsx("code",{children:"pipdeptree"}),". Consider whether the framework adds enough value to justify the footprint, or whether a targeted library (e.g., ",e.jsx("code",{children:"chromadb"}),"directly, ",e.jsx("code",{children:"tiktoken"})," directly) is sufficient."]})})]})}const Pe=Object.freeze(Object.defineProperty({__proto__:null,default:Z},Symbol.toStringTag,{value:"Module"}));function X(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Azure AI SDK for Python"}),e.jsxs("p",{children:["Microsoft provides two primary Python SDKs for AI on Azure: the ",e.jsx("strong",{children:"openai"})," package with Azure configuration (for Azure OpenAI Service), and the ",e.jsx("strong",{children:"azure-ai-inference"}),"package (for Azure AI Foundry model catalog — Phi, Llama, Mistral, etc. with a unified API). Both use Azure Identity for keyless authentication via managed identity."]}),e.jsx(r,{term:"Azure AI Inference SDK",children:e.jsxs("p",{children:["The ",e.jsx("code",{children:"azure-ai-inference"})," SDK provides a unified client for all models deployed to Azure AI Foundry endpoints — regardless of whether they're OpenAI models, Phi-3, Llama 3, Mistral, or Command R+. It uses the same request/response schema as OpenAI's chat completions API but works with any provider-agnostic endpoint. This makes it easy to switch models without changing application code."]})}),e.jsx("h2",{children:"Installation"}),e.jsx(l,{language:"bash",filename:"install.sh",children:`# Azure OpenAI (uses the openai package with Azure config)
pip install openai azure-identity

# Azure AI Inference SDK (model catalog / Foundry endpoints)
pip install azure-ai-inference azure-identity

# Azure AI Search (for RAG retrieval)
pip install azure-search-documents azure-identity

# Azure AI Agent Service
pip install azure-ai-projects azure-identity`}),e.jsx("h2",{children:"Authentication: DefaultAzureCredential"}),e.jsxs("p",{children:[e.jsx("code",{children:"DefaultAzureCredential"})," automatically picks the right authentication method based on the environment: Managed Identity in production (Azure VMs, App Service, AKS), Azure CLI locally during development, environment variables in CI/CD. This eliminates the need to manage API keys."]}),e.jsx(l,{language:"python",filename:"auth_setup.py",children:`from azure.identity import DefaultAzureCredential, get_bearer_token_provider
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
    project_client.agents.delete_agent(agent.id)`}}),e.jsx("h2",{children:"Azure AI Search Integration"}),e.jsx(l,{language:"python",filename:"azure_search_rag.py",children:`from azure.search.documents import SearchClient
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
index_client.create_or_update_index(index)`}),e.jsx(s,{title:"Use azure-ai-inference for Model Portability",children:e.jsxs("p",{children:["Prefer the ",e.jsx("code",{children:"azure-ai-inference"})," SDK over hardcoding OpenAI-specific API calls when targeting Azure AI Foundry. It works identically across GPT-4o, Phi-4, Llama 3.1, and Mistral Large — letting you A/B test models by changing a single ",e.jsx("code",{children:"model="}),"parameter. For OpenAI-specific features (DALL-E, Whisper, Assistants), use the",e.jsx("code",{children:"openai"})," package with Azure configuration."]})}),e.jsx(o,{type:"warning",title:"API Version Pinning",children:e.jsxs("p",{children:["Azure OpenAI's ",e.jsx("code",{children:"api_version"})," parameter is mandatory and new features (like structured outputs, o1 reasoning effort, etc.) are only available in specific versions. Always pin to a specific API version (e.g., ",e.jsx("code",{children:"2024-10-21"}),") and test upgrades explicitly. Breaking changes can occur between versions."]})})]})}const Le=Object.freeze(Object.defineProperty({__proto__:null,default:X},Symbol.toStringTag,{value:"Module"}));function ee(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"AWS SDK for Amazon Bedrock"}),e.jsxs("p",{children:["Amazon Bedrock is accessed through ",e.jsx("strong",{children:"boto3"})," — AWS's Python SDK. Bedrock exposes three main service clients: ",e.jsx("code",{children:"bedrock"})," (management),",e.jsx("code",{children:"bedrock-runtime"})," (model invocation), and ",e.jsx("code",{children:"bedrock-agent-runtime"}),"(agent invocation and knowledge base retrieval). The Converse API in bedrock-runtime is the recommended interface for all chat-style interactions."]}),e.jsx(r,{term:"Converse API",children:e.jsxs("p",{children:["The Converse API is Bedrock's unified, model-agnostic chat interface. Unlike the older",e.jsx("code",{children:"invoke_model"})," API (which requires model-specific JSON payloads), Converse uses a consistent request schema across all supported models — Claude, Llama, Mistral, Nova, and others. It natively supports tool use, conversation history, streaming, and system prompts without per-model format juggling."]})}),e.jsx("h2",{children:"Installation and Configuration"}),e.jsx(l,{language:"bash",filename:"install.sh",children:`# boto3 is the AWS SDK for Python
pip install boto3

# For async/streaming in async frameworks
pip install aioboto3  # Async boto3

# AWS CLI for credential configuration
pip install awscli
aws configure  # Sets up ~/.aws/credentials and ~/.aws/config`}),e.jsx(l,{language:"python",filename:"bedrock_client_setup.py",children:`import boto3

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
    }`}}),e.jsx("h2",{children:"Working with Model Responses and Token Usage"}),e.jsx(l,{language:"python",filename:"bedrock_usage_tracking.py",children:`import boto3
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
    return response["output"]["message"]["content"][0]["text"]`}),e.jsx(s,{title:"Use IAM Roles, Not Access Keys",children:e.jsxs("p",{children:["Never hardcode AWS access keys. In AWS (EC2, ECS, Lambda, EKS), use IAM roles with the principle of least privilege: grant only ",e.jsx("code",{children:"bedrock:InvokeModel"})," on specific model ARNs. Locally, use ",e.jsx("code",{children:"aws sso login"})," or named profiles. Enable CloudTrail to audit every model invocation — you'll get the model ID, input token count, and requester identity for compliance and cost allocation."]})}),e.jsx(o,{type:"tip",title:"Converse vs. invoke_model",children:e.jsxs("p",{children:["Prefer the Converse API for all new development — it handles tool use, multi-turn conversation, and streaming with a single consistent API across all models. Use ",e.jsx("code",{children:"invoke_model"})," only for models not yet supported by Converse (check AWS docs for current support list) or when you need model-specific features not exposed via Converse."]})})]})}const Re=Object.freeze(Object.defineProperty({__proto__:null,default:ee},Symbol.toStringTag,{value:"Module"}));function te(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"Google Cloud AI Platform SDK (Vertex AI)"}),e.jsxs("p",{children:["Google provides the ",e.jsx("strong",{children:"google-cloud-aiplatform"})," Python SDK for Vertex AI, which includes Gemini models, embeddings, fine-tuning, and all Vertex AI services. For Gemini specifically, you can also use the ",e.jsx("strong",{children:"google-generativeai"}),"package (Gemini API / Google AI Studio), but Vertex AI is required for enterprise features: VPC isolation, private endpoints, regional data processing, and compliance."]}),e.jsxs(r,{term:"Vertex AI vs. Gemini API",children:[e.jsxs("p",{children:[e.jsxs("strong",{children:["Vertex AI SDK (",e.jsx("code",{children:"google-cloud-aiplatform"}),"):"]})," Enterprise, GCP-native, uses Application Default Credentials, supports all GCP security controls, SLA-backed, models deployed in your GCP project's region.",e.jsx("br",{}),e.jsxs("strong",{children:["Gemini API (",e.jsx("code",{children:"google-generativeai"}),"):"]})," Consumer-grade, uses API keys, simpler setup, no VPC/IAM, designed for prototyping and non-enterprise use."]}),e.jsx("p",{children:"For production enterprise agents, always use Vertex AI."})]}),e.jsx("h2",{children:"Installation and Authentication"}),e.jsx(l,{language:"bash",filename:"install.sh",children:`# Vertex AI SDK
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
    return response.text`}}),e.jsx("h2",{children:"Embeddings and Grounding"}),e.jsx(l,{language:"python",filename:"vertex_embeddings_grounding.py",children:`from vertexai.language_models import TextEmbeddingModel, TextEmbeddingInput
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
    return response.text`}),e.jsx(s,{title:"Use Workload Identity Federation in Production",children:e.jsxs("p",{children:["On GKE and Cloud Run, configure Workload Identity Federation so that pods/services automatically receive a GCP service account identity — no key files, no secrets to manage. Bind the service account to only the IAM roles needed: ",e.jsx("code",{children:"roles/aiplatform.user"}),"for model inference, ",e.jsx("code",{children:"roles/storage.objectViewer"})," for reading documents. Avoid ",e.jsx("code",{children:"roles/owner"})," or ",e.jsx("code",{children:"roles/editor"})," for any Vertex AI workload."]})}),e.jsx(o,{type:"tip",title:"Regional Endpoints for Lower Latency",children:e.jsxs("p",{children:["Always initialize Vertex AI with a region close to your users:",e.jsx("code",{children:'vertexai.init(project=PROJECT, location="europe-west1")'})," for European users,",e.jsx("code",{children:'"asia-northeast1"'})," for Japan, etc. Using ",e.jsx("code",{children:"us-central1"})," for global users adds unnecessary latency. Vertex AI models are available in most major regions."]})})]})}const Me=Object.freeze(Object.defineProperty({__proto__:null,default:te},Symbol.toStringTag,{value:"Module"}));function re(){return e.jsxs("article",{className:"prose-content",children:[e.jsx("h2",{children:"LiteLLM: Unified LLM Interface"}),e.jsx("p",{children:"LiteLLM provides a single OpenAI-compatible API that routes to 100+ LLM providers — Azure OpenAI, Amazon Bedrock, Google Vertex AI, Anthropic, Cohere, Mistral, and more. It's the primary abstraction layer for multi-cloud AI architectures, enabling model switching, cost-optimized routing, and automatic fallback without changing application code."}),e.jsx(r,{term:"LiteLLM",children:e.jsxs("p",{children:["LiteLLM translates OpenAI-format requests into each provider's native API format, normalizes responses back to OpenAI format, and exposes a consistent Python SDK and optional proxy server. The model is identified by a prefixed string:",e.jsx("code",{children:"azure/gpt-4o"}),", ",e.jsx("code",{children:"bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0"}),",",e.jsx("code",{children:"vertex_ai/gemini-2.0-flash-001"}),"."]})}),e.jsx(c,{title:"LiteLLM Proxy — Multi-Cloud Routing",width:700,height:280,nodes:[{id:"app",label:"Your Application",type:"external",x:80,y:140},{id:"proxy",label:"LiteLLM Proxy",type:"agent",x:260,y:140},{id:"azure",label:"Azure OpenAI",type:"llm",x:480,y:60},{id:"bedrock",label:"AWS Bedrock",type:"llm",x:480,y:140},{id:"vertex",label:"Vertex AI",type:"llm",x:480,y:220},{id:"metrics",label:"Cost + Metrics",type:"store",x:640,y:140}],edges:[{from:"app",to:"proxy",label:"OpenAI format"},{from:"proxy",to:"azure",label:"primary"},{from:"proxy",to:"bedrock",label:"fallback"},{from:"proxy",to:"vertex",label:"fallback"},{from:"proxy",to:"metrics"}]}),e.jsx("h2",{children:"Installation and Basic Usage"}),e.jsx(l,{language:"bash",filename:"install.sh",children:`pip install litellm

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
    }`}}),e.jsx("h2",{children:"LiteLLM Proxy Server"}),e.jsxs("p",{children:["The LiteLLM proxy exposes an OpenAI-compatible HTTP server. Any application using the OpenAI SDK can route through LiteLLM proxy by changing the ",e.jsx("code",{children:"base_url"}),"— enabling centralized rate limiting, cost tracking, and model governance without modifying individual applications."]}),e.jsx(l,{language:"yaml",filename:"litellm_config.yaml",children:`model_list:
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
  store_model_in_db: true`}),e.jsx(l,{language:"bash",filename:"run_proxy.sh",children:`# Start the proxy server
litellm --config litellm_config.yaml --port 4000

# Any OpenAI-compatible client can now use it:
# export OPENAI_API_BASE="http://localhost:4000"
# export OPENAI_API_KEY="sk-your-master-key"
# Then use the normal openai SDK - it routes through LiteLLM`}),e.jsx(s,{title:"Use LiteLLM Router for Enterprise Resilience",children:e.jsxs("p",{children:["For production multi-cloud setups, use LiteLLM Router (not raw ",e.jsx("code",{children:"litellm.completion"}),") to get automatic load balancing across deployments, TPM/RPM-aware routing, and cascading fallbacks. Configure at least one cross-provider fallback (e.g., Azure GPT-4o → Bedrock Claude) to handle provider-wide outages. Monitor cost per model via the built-in Prometheus exporter to catch unexpected cost spikes early."]})}),e.jsx(o,{type:"info",title:"LiteLLM vs. Provider SDKs",children:e.jsx("p",{children:"LiteLLM adds a thin abstraction layer that's invaluable for multi-cloud setups and A/B testing models. However, for provider-specific features (Azure Assistants API, Bedrock Agents, Vertex AI grounding with Google Search), you'll still need the native SDKs. A common pattern: LiteLLM for standard completions and embeddings, native SDKs for managed services (agents, knowledge bases, guardrails)."})})]})}const Ee=Object.freeze(Object.defineProperty({__proto__:null,default:re},Symbol.toStringTag,{value:"Module"}));export{Le as A,Re as B,Me as C,Ee as D,ae as a,ie as b,le as c,ce as d,de as e,pe as f,me as g,ue as h,he as i,ge as j,fe as k,ye as l,xe as m,_e as n,ve as o,be as p,we as q,Ae as r,oe as s,ke as t,je as u,Se as v,Ce as w,Te as x,Ie as y,Pe as z};
