import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function AnthropicSdkBasics() {
  return (
    <article className="prose-content">
      <h2>Anthropic SDK Basics</h2>
      <p>
        The Anthropic SDK is your primary interface for building applications with Claude.
        Available in Python and TypeScript/JavaScript, it provides a clean abstraction over
        the Messages API, handles authentication, retry logic, and response parsing.
      </p>

      <ConceptBlock term="Anthropic SDK">
        <p>
          The official Anthropic client library that provides typed interfaces for all Claude API
          features including message creation, streaming, tool use, vision, and token counting.
          It handles authentication, rate limit retries with exponential backoff, and
          connection management automatically.
        </p>
      </ConceptBlock>

      <h2>Installation</h2>

      <SDKExample
        title="Installing the Anthropic SDK"
        tabs={{
          bash: `# Python
pip install anthropic

# TypeScript / JavaScript
npm install @anthropic-ai/sdk`,
        }}
      />

      <SecurityCallout title="API Key Security" severity="high">
        <p>Never hardcode your API key in source code or commit it to version control.
        Use environment variables (<code>ANTHROPIC_API_KEY</code>) or a secrets manager.
        The SDK automatically reads <code>ANTHROPIC_API_KEY</code> from the environment if
        you don't pass it explicitly.</p>
      </SecurityCallout>

      <h2>Basic Client Setup</h2>

      <SDKExample
        title="Creating an Anthropic Client"
        tabs={{
          python: `import anthropic
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
)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

// Auto-reads ANTHROPIC_API_KEY from environment
const client = new Anthropic();

// With explicit settings
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
  timeout: 60 * 1000,  // milliseconds
});`,
        }}
      />

      <h2>Your First Message</h2>

      <SDKExample
        title="Simple Message Creation"
        tabs={{
          python: `import anthropic

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
print(f"Stop reason: {message.stop_reason}")`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

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

console.log(Tokens used: \${message.usage.input_tokens} in, \${message.usage.output_tokens} out);`,
        }}
      />

      <h2>System Prompts</h2>
      <p>
        System prompts set the context, persona, and constraints for Claude before any user
        interaction. They're crucial for building reliable agents.
      </p>

      <SDKExample
        title="Using System Prompts"
        tabs={{
          python: `import anthropic

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
            "content": f"Review this code:\n\n{code_to_review}"
        }
    ]
)

print(message.content[0].text)`,
          typescript: `const message = await client.messages.create({
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
});`,
        }}
      />

      <h2>Multi-Turn Conversations</h2>
      <p>
        Claude is stateless — it doesn't remember previous conversations. You must send the
        full conversation history with each request. The SDK makes this straightforward.
      </p>

      <SDKExample
        title="Multi-Turn Conversation"
        tabs={{
          python: `import anthropic
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
print(f"Claude: {assistant_reply}")`,
        }}
      />

      <h2>Streaming Responses</h2>
      <p>
        For long responses, streaming significantly improves perceived latency. The SDK supports
        streaming with both raw events and a higher-level stream helper.
      </p>

      <SDKExample
        title="Streaming Responses"
        tabs={{
          python: `import anthropic

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
    print(f"\\n\\nTotal tokens: {final_message.usage.input_tokens + final_message.usage.output_tokens}")`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

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
console.log(\\nTotal tokens: \${finalMessage.usage.input_tokens + finalMessage.usage.output_tokens});`,
        }}
      />

      <h2>Available Claude Models</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Model ID</th>
              <th className="px-4 py-3 text-left font-semibold">Best For</th>
              <th className="px-4 py-3 text-left font-semibold">Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['claude-opus-4-6', 'Most capable: complex reasoning, coding, analysis', '200K'],
              ['claude-sonnet-4-6', 'Balanced: speed + intelligence for most tasks', '200K'],
              ['claude-haiku-4-5-20251001', 'Fastest, most cost-effective: simple tasks', '200K'],
            ].map(([model, best, ctx]) => (
              <tr key={model}>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{model}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{best}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ctx} tokens</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BestPracticeBlock title="Use claude-opus-4-6 for Development, Route in Production">
        <p>During development and evaluation, use claude-opus-4-6 to establish baseline quality.
        Once you understand the task complexity distribution, route simpler tasks to
        claude-haiku-4-5-20251001 or claude-sonnet-4-6 in production to reduce costs by 80-95%
        without sacrificing quality where it matters.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Rate Limits and Retries">
        <p>The SDK automatically retries rate limit errors (429) and server errors (5xx) with
        exponential backoff. Set <code>max_retries=5</code> for production workloads.
        Monitor <code>X-RateLimit-*</code> headers (accessible via raw HTTP) to understand
        your usage patterns and avoid hitting limits.</p>
      </NoteBlock>
    </article>
  )
}
