import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function MessagesApi() {
  return (
    <article className="prose-content">
      <h2>Messages API</h2>
      <p>
        The Messages API is the single endpoint that powers all Claude interactions.
        Understanding its request structure — roles, content blocks, streaming events,
        prompt caching, and vision inputs — is essential for building reliable production systems.
      </p>

      <ConceptBlock term="Messages API">
        <p>
          The Anthropic Messages API (<code>POST /v1/messages</code>) accepts a list of messages
          with alternating <strong>user</strong> and <strong>assistant</strong> roles, an optional
          system prompt, and returns a response with one or more <strong>content blocks</strong>.
          Every Claude capability — text, tool use, vision, caching — flows through this single API.
        </p>
      </ConceptBlock>

      <h2>Roles and Turn Structure</h2>
      <p>
        The <code>messages</code> array must alternate strictly between <code>user</code> and
        <code>assistant</code> roles. The first message must be from the user, and you cannot
        have two consecutive messages from the same role.
      </p>

      <SDKExample
        title="Roles and Multi-Turn Structure"
        tabs={{
          python: `import anthropic

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
print(response.content[0].text)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

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
console.log(response.content[0].type === 'text' ? response.content[0].text : '');`,
        }}
      />

      <h2>Content Blocks</h2>
      <p>
        Both user messages and assistant responses can contain multiple <strong>content blocks</strong>.
        This allows a single message to mix text, images, tool calls, and tool results.
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Block Type</th>
              <th className="px-4 py-3 text-left font-semibold">Direction</th>
              <th className="px-4 py-3 text-left font-semibold">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['text', 'Both', 'Plain or markdown text content'],
              ['image', 'User only', 'Image input (base64 or URL)'],
              ['tool_use', 'Assistant', 'Claude requests a tool call'],
              ['tool_result', 'User only', 'Result of a tool call returned to Claude'],
              ['document', 'User only', 'PDF or text document (with caching)'],
            ].map(([type, direction, purpose]) => (
              <tr key={type}>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{type}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{direction}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Vision Inputs</h2>
      <p>
        Claude can process images passed as base64-encoded data or as public URLs. Images count
        toward the context window based on their pixel dimensions.
      </p>

      <SDKExample
        title="Vision: Sending Images to Claude"
        tabs={{
          python: `import anthropic
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
)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';
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
console.log(response.content[0].type === 'text' ? response.content[0].text : '');`,
        }}
      />

      <h2>Streaming</h2>
      <p>
        Streaming returns tokens as they are generated via server-sent events (SSE). The SDK
        provides both a low-level event iterator and a higher-level <code>stream</code> helper
        that accumulates the full message for you.
      </p>

      <SDKExample
        title="Streaming Response Events"
        tabs={{
          python: `import anthropic

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
            print("\\n[Stream complete]")`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

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
}`,
        }}
      />

      <h2>Prompt Caching</h2>
      <p>
        Prompt caching lets you mark large, stable portions of your context for reuse across
        requests. Cached tokens cost ~10% of normal input tokens and reduce latency for repeated
        prefixes by up to 85%.
      </p>

      <SDKExample
        title="Prompt Caching with cache_control"
        tabs={{
          python: `import anthropic

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
print(f"Cache creation tokens: {response2.usage.cache_creation_input_tokens}")`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';
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
console.log(Cache read: \${r2.usage.cache_read_input_tokens ?? 0} tokens);`,
        }}
      />

      <NoteBlock type="info" title="Cache TTL and Minimum Size">
        <p>Cached prompts have a 5-minute TTL that resets on each cache hit. To be eligible for
        caching, a content block must be at least 1,024 tokens (for Claude Haiku) or 2,048 tokens
        (for Sonnet/Opus). You can have up to four cache breakpoints per request.</p>
      </NoteBlock>

      <h2>Stop Reasons</h2>
      <p>
        The <code>stop_reason</code> field tells you why Claude stopped generating. Always check
        it — especially in agentic loops.
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">stop_reason</th>
              <th className="px-4 py-3 text-left font-semibold">Meaning</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['end_turn', 'Claude finished naturally', 'Use the response'],
              ['max_tokens', 'Hit the max_tokens limit', 'Increase limit or continue'],
              ['tool_use', 'Claude wants to call a tool', 'Execute tool and send result'],
              ['stop_sequence', 'Hit a custom stop sequence', 'Process partial response'],
            ].map(([reason, meaning, action]) => (
              <tr key={reason}>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{reason}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{meaning}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <WarningBlock title="Always Handle max_tokens Stop Reason">
        <p>If <code>stop_reason</code> is <code>max_tokens</code>, the response is truncated.
        For structured outputs (JSON, code), truncation produces invalid output. Either
        increase <code>max_tokens</code>, or detect this condition and re-prompt with the partial
        response appended to continue generation.</p>
      </WarningBlock>

      <BestPracticeBlock title="Use Structured Content Blocks Over String Concatenation">
        <p>When sending mixed content (text + images, or multi-part instructions), always use
        the content block array format rather than concatenating strings. This gives Claude
        clearer semantic boundaries between content types, improves accuracy, and makes your
        code easier to maintain as content types evolve.</p>
      </BestPracticeBlock>

      <SecurityCallout title="Image Input Validation" severity="medium">
        <p>Never pass user-supplied image URLs directly to the API without validation. A malicious
        URL could leak your API requests to a third-party server via SSRF. For user-uploaded
        images, download them server-side and pass as base64 data, or host them on your own
        CDN and validate the URL origin.</p>
      </SecurityCallout>
    </article>
  )
}
