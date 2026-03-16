import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const contextManagementPython = `import tiktoken
from anthropic import Anthropic
from dataclasses import dataclass

client = Anthropic()
enc = tiktoken.get_encoding("cl100k_base")

@dataclass
class Chunk:
    text: str
    source: str
    score: float

def count_tokens(text: str) -> int:
    return len(enc.encode(text))

def rank_and_fit_chunks(
    chunks: list[Chunk],
    query: str,
    max_context_tokens: int = 4000,
    min_score: float = 0.70,
) -> list[Chunk]:
    """
    Filter by relevance score, sort by score, then fit as many
    chunks as possible within the token budget.
    """
    # 1. Filter below minimum relevance threshold
    relevant = [c for c in chunks if c.score >= min_score]

    # 2. Sort by score descending (most relevant first)
    relevant.sort(key=lambda c: c.score, reverse=True)

    # 3. Greedily add chunks until we hit the token budget
    selected = []
    token_count = 0
    for chunk in relevant:
        chunk_tokens = count_tokens(chunk.text)
        if token_count + chunk_tokens <= max_context_tokens:
            selected.append(chunk)
            token_count += chunk_tokens
        # Skip chunks that don't fit; keep trying smaller ones
    return selected

def rag_with_context_management(
    query: str,
    retrieved_chunks: list[Chunk],
    max_context_tokens: int = 4000,
    max_output_tokens: int = 1024,
) -> str:
    fitted = rank_and_fit_chunks(retrieved_chunks, query, max_context_tokens)

    if not fitted:
        return "I don't have relevant information to answer this question."

    context_parts = [
        f"[{i+1}] Source: {c.source}\\n{c.text.strip()}"
        for i, c in enumerate(fitted)
    ]
    context = "\\n\\n---\\n\\n".join(context_parts)

    print(f"Using {len(fitted)}/{len(retrieved_chunks)} chunks | "
          f"~{count_tokens(context)} context tokens")

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=max_output_tokens,
        system=(
            "Answer questions using ONLY the provided context. "
            "Cite source numbers [1], [2], etc. "
            "Say 'I don't know' if the context is insufficient."
        ),
        messages=[{
            "role": "user",
            "content": f"CONTEXT:\\n\\n{context}\\n\\n---\\n\\nQUESTION: {query}"
        }],
    )
    return response.content[0].text

# Example
chunks = [
    Chunk("Claude 3.5 Sonnet achieves 92% on SWE-bench, a coding benchmark.", "Anthropic Blog", 0.94),
    Chunk("The model supports a 200K token context window.", "Anthropic Docs", 0.88),
    Chunk("Claude was founded by former OpenAI researchers in 2021.", "Wikipedia", 0.61),  # below threshold
]

answer = rag_with_context_management(
    "What are Claude's key capabilities?",
    chunks,
    max_context_tokens=2000,
)
print(answer)`;

const contextManagementTS = `import Anthropic from "@anthropic-ai/sdk";
import { encoding_for_model } from "tiktoken";

const client = new Anthropic();

interface Chunk {
  text: string;
  source: string;
  score: number;
}

const enc = encoding_for_model("gpt-4"); // cl100k_base, compatible with Claude token counting

function countTokens(text: string): number {
  return enc.encode(text).length;
}

function rankAndFitChunks(
  chunks: Chunk[],
  maxContextTokens: number = 4000,
  minScore: number = 0.70
): Chunk[] {
  // Filter and sort by relevance
  const relevant = chunks
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score);

  // Greedy token-budget packing
  const selected: Chunk[] = [];
  let tokenCount = 0;
  for (const chunk of relevant) {
    const chunkTokens = countTokens(chunk.text);
    if (tokenCount + chunkTokens <= maxContextTokens) {
      selected.push(chunk);
      tokenCount += chunkTokens;
    }
  }
  return selected;
}

async function ragWithContextManagement(
  query: string,
  retrievedChunks: Chunk[],
  maxContextTokens: number = 4000
): Promise<string> {
  const fitted = rankAndFitChunks(retrievedChunks, maxContextTokens);

  if (fitted.length === 0) {
    return "I don't have relevant information to answer this question.";
  }

  const contextParts = fitted.map(
    (c, i) => [\${i + 1}] Source: \${c.source}\\n\${c.text.trim()}
  );
  const context = contextParts.join("\\n\\n---\\n\\n");

  console.log(
    Using \${fitted.length}/\${retrievedChunks.length} chunks | ~\${countTokens(context)} tokens
  );

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system:
      "Answer questions using ONLY the provided context. Cite source numbers [1], [2], etc. Say 'I don't know' if the context is insufficient.",
    messages: [
      {
        role: "user",
        content: CONTEXT:\\n\\n\${context}\\n\\n---\\n\\nQUESTION: \${query},
      },
    ],
  });

  return (response.content[0] as { text: string }).text;
}

// Example
const chunks: Chunk[] = [
  { text: "Claude 3.5 Sonnet achieves 92% on SWE-bench, a coding benchmark.", source: "Anthropic Blog", score: 0.94 },
  { text: "The model supports a 200K token context window.", source: "Anthropic Docs", score: 0.88 },
  { text: "Claude was founded by former OpenAI researchers in 2021.", source: "Wikipedia", score: 0.61 },
];

ragWithContextManagement("What are Claude's key capabilities?", chunks, 2000).then(
  console.log
);`;

export default function ContextManagement() {
  return (
    <div className="lesson-content">
      <h2>Context Management</h2>

      <p>
        Retrieval can return many chunks, but you cannot always send all of them to the LLM.
        Context windows have token limits, and filling them indiscriminately with low-relevance
        text increases noise, raises cost, and can degrade answer quality. Context management
        is the discipline of deciding which retrieved content to include, in what order, and
        within what budget.
      </p>

      <ConceptBlock
        term="Context Window Budget"
        definition="The context window budget is the number of tokens available for retrieved context after accounting for the system prompt, the user query, and the reserved output space. Effective context management maximises the relevance signal within this budget by filtering low-quality chunks, ranking the remainder by relevance, and packing the highest-value chunks up to the token limit."
      />

      <h2>The Context Window Equation</h2>

      <p>
        Every LLM has a maximum context window. For Claude models, this is 200K tokens. The
        tokens in a single API call are consumed by:
      </p>
      <ul>
        <li>The system prompt (typically 100–500 tokens).</li>
        <li>The user's question (typically 10–200 tokens).</li>
        <li>The retrieved context (your budget to manage).</li>
        <li>The model's output (reserve at least max_tokens here).</li>
      </ul>
      <p>
        While 200K is enormous, it is not unlimited, and larger contexts cost more (pricing
        is per input token). More importantly, research consistently shows that LLMs struggle
        with "lost in the middle" — relevant information buried in the middle of a very long
        context is less likely to be correctly utilised than information at the beginning or
        end. Concise, high-relevance context consistently outperforms maximal context stuffing.
      </p>

      <h2>Step 1 — Relevance Score Filtering</h2>

      <p>
        Before you worry about token budgets, filter out chunks that are not genuinely
        relevant. Set a minimum cosine similarity threshold (typically 0.70–0.80) and discard
        anything below it. A chunk with a score of 0.60 is probably tangentially related at
        best and noise at worst. Sending it to the LLM wastes tokens and can confuse the
        model.
      </p>

      <h2>Step 2 — Reranking (Optional but Recommended)</h2>

      <p>
        Embedding similarity scores are a fast first pass, not a precision ranking. A
        cross-encoder reranker reads each chunk alongside the query and produces a
        much more accurate relevance score. Apply reranking to the top-20 embedding
        results, then take the top-5 reranked results. This two-stage pipeline gets
        both speed (ANN retrieval) and precision (cross-encoder reranking). The Reranking
        section of Advanced RAG covers this in depth.
      </p>

      <h2>Step 3 — Token-Budget Packing</h2>

      <p>
        After filtering and optional reranking, count tokens and greedily pack the highest-
        ranked chunks into the available budget. Do not truncate individual chunks unless
        necessary — a truncated chunk can be more misleading than a missing one. If a chunk
        does not fit, skip it and try the next one (some smaller chunks may fit where larger
        ones do not).
      </p>
      <p>
        A typical target is 2,000–4,000 tokens of context for a RAG response. This leaves
        ample room for the system prompt, user query, and a 1,024-token output in even a
        4K-token window, and is a small fraction of Claude's 200K limit, keeping costs
        low.
      </p>

      <h2>Step 4 — Ordering for "Lost in the Middle" Mitigation</h2>

      <p>
        When you have multiple relevant chunks, order matters. Research on the "lost in the
        middle" phenomenon shows that LLMs attend most strongly to context at the beginning
        and end of the input. A practical heuristic: place the single highest-relevance
        chunk first, then lower-relevance chunks in the middle, and the second-highest at
        the end. This maximises the chance the model utilises the most important context.
      </p>

      <NoteBlock
        type="historical"
        title="The 'Lost in the Middle' problem"
        children='A 2023 paper by Liu et al. ("Lost in the Middle: How Language Models Use Long Contexts") demonstrated that multi-document question-answering performance degrades significantly when the relevant document is placed in the middle of the context window rather than at the start or end. This effect is most pronounced for large contexts (>10 documents). The finding motivates deliberate chunk ordering in RAG prompts rather than arbitrary ordering.'
      />

      <h2>Multi-Turn Context Management</h2>

      <p>
        In a conversational RAG application, the prompt grows with each turn as the message
        history accumulates. A conversation with many turns can exhaust the context window
        even before the retrieved chunks are added. Common strategies include:
      </p>
      <ul>
        <li>
          <strong>Summarisation</strong>: Summarise older turns into a compact history block,
          replacing the raw messages. Store the summary as a special system message.
        </li>
        <li>
          <strong>Sliding window</strong>: Keep only the most recent k turns in full detail.
        </li>
        <li>
          <strong>Query-aware retrieval from history</strong>: Treat past conversation turns as
          a retrievable store, retrieving only the past turns most relevant to the current query.
        </li>
      </ul>

      <BestPracticeBlock title="Set explicit token budgets for each prompt component">
        Instrument your RAG pipeline to log the token count breakdown for each component on
        every request: system prompt tokens, history tokens, context tokens, query tokens, and
        output tokens. Alerts on any component exceeding its allocated budget surface
        context window issues before they cause truncation errors or cost spikes.
      </BestPracticeBlock>

      <h2>Context Management in Practice</h2>

      <SDKExample
        title="Relevance Filtering and Token-Budget Packing"
        tabs={{
          python: contextManagementPython,
          typescript: contextManagementTS,
        }}
      />

      <p>
        The code above implements the complete context management pipeline: filter by minimum
        score, sort by relevance, greedily pack within a token budget, and log how many
        chunks were used. The low-scoring chunk (0.61) is dropped before the LLM sees it,
        and the function reports token usage so you can tune the budget for your specific
        model and cost targets.
      </p>
    </div>
  );
}
