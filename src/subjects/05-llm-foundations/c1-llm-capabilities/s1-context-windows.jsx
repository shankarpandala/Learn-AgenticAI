import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ContextWindows() {
  return (
    <article className="prose-content">
      <h2>Context Windows</h2>
      <p>
        The context window is the maximum amount of text a model can process in a single inference
        call. Every token in your messages array, system prompt, tool definitions, and tool results
        counts against this limit. Understanding context windows is essential for building agents
        that handle long documents, multi-turn conversations, and large codebases.
      </p>

      <ConceptBlock term="Context Window">
        <p>
          A fixed-size buffer, measured in tokens, that holds everything the model can "see" during
          one inference call: the system prompt, all conversation turns, tool schemas, tool call
          results, and any documents you inject. Content outside the window is invisible to the
          model — it has no memory of it unless you explicitly re-include it.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Token">
        <p>
          The atomic unit of text that LLMs process. A token is roughly 3–4 characters or
          0.75 English words on average, though this varies by language and tokenizer. Code and
          non-English text are often tokenized less efficiently. One page of English prose is
          approximately 500–700 tokens.
        </p>
      </ConceptBlock>

      <h2>Context Window Sizes (2025)</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold">Input Context</th>
              <th className="px-4 py-3 text-left font-semibold">Max Output</th>
              <th className="px-4 py-3 text-left font-semibold">Approx. Pages</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Claude 3.5 / 3.7 (Anthropic)', '200K tokens', '8K–64K tokens', '~500 pages'],
              ['GPT-4o (OpenAI)', '128K tokens', '16K tokens', '~320 pages'],
              ['Gemini 1.5 Pro (Google)', '1M tokens', '8K tokens', '~2,500 pages'],
              ['Gemini 2.0 Flash (Google)', '1M tokens', '8K tokens', '~2,500 pages'],
              ['Llama 3.1 405B (Meta)', '128K tokens', '4K tokens', '~320 pages'],
            ].map(([model, ctx, out, pages]) => (
              <tr key={model}>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{model}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{ctx}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{out}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{pages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Counting Tokens Before You Send</h2>
      <p>
        Counting tokens before sending a request lets you check fits, implement routing logic,
        and estimate cost. Both Anthropic and OpenAI expose token-counting endpoints.
      </p>

      <SDKExample
        title="Token Counting"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

# Count tokens without sending a full inference request
response = client.messages.count_tokens(
    model="claude-opus-4-6",
    system="You are a helpful assistant.",
    messages=[
        {"role": "user", "content": "Summarise this document: " + long_document}
    ],
)
print(f"Input tokens: {response.input_tokens}")

# Check if we fit within the context window
MAX_CONTEXT = 200_000
RESERVE_FOR_OUTPUT = 8_000

if response.input_tokens > MAX_CONTEXT - RESERVE_FOR_OUTPUT:
    print("Document too large — applying chunking strategy")
else:
    # Safe to send
    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=RESERVE_FOR_OUTPUT,
        system="You are a helpful assistant.",
        messages=[
            {"role": "user", "content": "Summarise this document: " + long_document}
        ],
    )
    print(message.content[0].text)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const countResponse = await client.messages.countTokens({
  model: 'claude-opus-4-6',
  system: 'You are a helpful assistant.',
  messages: [
    { role: 'user', content: Summarise this document: \${longDocument} },
  ],
});

console.log(Input tokens: \${countResponse.input_tokens});

const MAX_CONTEXT = 200_000;
const RESERVE_FOR_OUTPUT = 8_000;

if (countResponse.input_tokens > MAX_CONTEXT - RESERVE_FOR_OUTPUT) {
  console.log('Document too large — applying chunking strategy');
} else {
  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: RESERVE_FOR_OUTPUT,
    system: 'You are a helpful assistant.',
    messages: [
      { role: 'user', content: Summarise this document: \${longDocument} },
    ],
  });
  console.log(message.content[0].type === 'text' ? message.content[0].text : '');
}`,
        }}
      />

      <h2>Strategies for Long Documents</h2>

      <h3>1. Chunking and Map-Reduce</h3>
      <p>
        Split the document into overlapping chunks that each fit in the context window, process
        each chunk independently, then synthesize the results. The overlap prevents losing
        information that spans chunk boundaries.
      </p>

      <SDKExample
        title="Chunking with Overlap"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

def chunk_text(text: str, chunk_size: int = 80_000, overlap: int = 2_000) -> list[str]:
    """Split text into overlapping chunks measured in characters."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap  # overlap prevents boundary gaps
    return chunks

def summarise_long_document(document: str) -> str:
    chunks = chunk_text(document)
    chunk_summaries = []

    for i, chunk in enumerate(chunks):
        resp = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"Summarise chunk {i+1}/{len(chunks)}:\\n\\n{chunk}"
            }]
        )
        chunk_summaries.append(resp.content[0].text)

    # Reduce: combine chunk summaries into final summary
    combined = "\\n\\n---\\n\\n".join(chunk_summaries)
    final = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": f"These are summaries of consecutive chunks of a long document. "
                       f"Write a single cohesive summary:\\n\\n{combined}"
        }]
    )
    return final.content[0].text`,
        }}
      />

      <h3>2. Retrieval-Augmented Generation (RAG)</h3>
      <p>
        Instead of sending the full document, embed all chunks into a vector store and retrieve
        only the most relevant passages at query time. This keeps the context window small
        regardless of document size and is the standard approach for knowledge bases.
      </p>

      <h3>3. Context Compression</h3>
      <p>
        Ask the model to compress prior conversation turns or large tool results into a shorter
        summary before they are re-injected into the context. This extends the effective reach of
        a fixed context window across many agent steps.
      </p>

      <SDKExample
        title="Context Compression for Long Conversations"
        tabs={{
          python: `import anthropic
from typing import TypedDict

client = anthropic.Anthropic()

class Message(TypedDict):
    role: str
    content: str

def compress_history(messages: list[Message]) -> Message:
    """Compress a list of messages into a single assistant message summary."""
    formatted = "\\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in messages
    )
    resp = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": (
                "Summarise the following conversation history concisely. "
                "Preserve all facts, decisions, and code snippets mentioned.\\n\\n"
                + formatted
            )
        }]
    )
    return {"role": "assistant", "content": "[SUMMARY] " + resp.content[0].text}

# When conversation grows long, compress older turns
TOKEN_THRESHOLD = 150_000

def maybe_compress(messages: list[Message]) -> list[Message]:
    token_count = client.messages.count_tokens(
        model="claude-opus-4-6",
        messages=messages,
    ).input_tokens

    if token_count > TOKEN_THRESHOLD:
        # Keep the last 4 turns verbatim; compress everything before
        to_compress = messages[:-4]
        recent = messages[-4:]
        summary = compress_history(to_compress)
        return [summary] + recent
    return messages`,
        }}
      />

      <h2>Prompt Caching</h2>
      <p>
        Anthropic's prompt caching feature allows you to cache the KV state of large, stable
        context blocks (system prompt, document text, tool definitions) so that subsequent
        requests referencing the same content pay only a cache-read token price rather than
        recomputing the full prefix. Cache writes cost 25% more; reads cost 90% less.
      </p>

      <SDKExample
        title="Prompt Caching with cache_control"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

# Large document loaded once and cached
with open("large_reference.txt") as f:
    reference_text = f.read()

# First request: cache WRITE (slightly more expensive)
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are a document analyst. Answer questions about the provided document.",
        },
        {
            "type": "text",
            "text": reference_text,
            "cache_control": {"type": "ephemeral"},  # Mark for caching
        },
    ],
    messages=[{"role": "user", "content": "What is the main thesis of this document?"}],
)
print(response.usage)  # cache_creation_input_tokens > 0

# Subsequent requests: cache READ (90% cheaper for cached portion)
response2 = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system=[
        {"type": "text", "text": "You are a document analyst. Answer questions about the provided document."},
        {"type": "text", "text": reference_text, "cache_control": {"type": "ephemeral"}},
    ],
    messages=[{"role": "user", "content": "What methodology does the author use?"}],
)
print(response2.usage)  # cache_read_input_tokens > 0`,
        }}
      />

      <WarningBlock title="Context Window ≠ Unlimited Attention">
        <p>
          Large context windows do not mean the model pays equal attention to all tokens.
          Empirically, models attend more strongly to content at the beginning and end of the
          context ("lost in the middle" effect). For critical instructions or constraints, place
          them in the system prompt or repeat them near the end of the user turn.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Context Window Best Practices">
        <ul>
          <li>Always count tokens before sending large payloads to avoid runtime errors.</li>
          <li>Reserve at least 10% of the context for model output (<code>max_tokens</code>).</li>
          <li>Use prompt caching for stable, large prefixes (system prompts, reference docs).</li>
          <li>Prefer RAG over full-document injection when the document exceeds ~50K tokens.</li>
          <li>Place critical instructions at the top of the system prompt, not buried in the middle.</li>
          <li>Compress conversation history aggressively once context exceeds 75% of the window.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Measure Token Efficiency">
        <p>
          Track <code>input_tokens</code> and <code>output_tokens</code> per request in your
          observability stack. High input-to-output ratios often indicate bloated prompts or
          inefficient context management. Reducing average input tokens by 30% can halve
          infrastructure costs for high-volume agents.
        </p>
      </NoteBlock>
    </article>
  )
}
