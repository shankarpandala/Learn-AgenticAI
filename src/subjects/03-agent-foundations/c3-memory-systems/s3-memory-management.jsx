import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'

export default function MemoryManagement() {
  return (
    <article className="prose-content">
      <p>
        Memory management is the practice of controlling what information an agent holds, how
        long it holds it, and how it retrieves it under the constraints of a finite context
        window. Even with 200k-token context windows, agents that run for extended periods
        accumulate more history than will fit. Without active management, context bloat degrades
        model performance and eventually causes requests to fail. Well-designed memory management
        keeps agents effective through arbitrarily long task sequences.
      </p>

      <h2>Context Window Limits</h2>

      <p>
        Every LLM has a maximum context window. Claude 3.7 Sonnet supports up to 200,000 tokens.
        A long-running agent accumulates tokens through conversation history, tool results (which
        can be large), and any documents retrieved from memory. Left unmanaged, the context grows
        until requests fail or quality degrades as the model struggles to attend to relevant
        information buried in a long history.
      </p>

      <ConceptBlock term="Context Window Budget">
        A context window budget is an explicit allocation of the total token limit across the
        components that share the context: system prompt, conversation history, retrieved
        documents, tool schemas, and the expected output. By budgeting each component, you ensure
        no single component crowds out the others. A typical allocation: 10% system prompt,
        30% retrieved context, 50% conversation history, 10% reserved for output.
      </ConceptBlock>

      <SDKExample
        title="Context Budget Monitoring"
        tabs={{
          python: `from anthropic import Anthropic
import tiktoken  # pip install tiktoken

client = Anthropic()

class ContextBudgetManager:
    def __init__(self, max_tokens: int = 150000):
        self.max_tokens = max_tokens
        # Reserve space for output and tool schemas
        self.history_budget = int(max_tokens * 0.6)

    def estimate_tokens(self, text: str) -> int:
        """Rough token estimate: ~4 chars per token."""
        return len(text) // 4

    def messages_token_count(self, messages: list) -> int:
        total = 0
        for msg in messages:
            content = msg.get("content", "")
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict):
                        total += self.estimate_tokens(str(block))
            else:
                total += self.estimate_tokens(str(content))
        return total

    def fits_in_budget(self, messages: list) -> bool:
        return self.messages_token_count(messages) <= self.history_budget

    def trim_to_budget(self, messages: list, preserve_first: int = 2) -> list:
        """Remove oldest messages until within budget, preserving the first N."""
        if self.fits_in_budget(messages):
            return messages

        preserved = messages[:preserve_first]
        trimable = messages[preserve_first:]

        while not self.fits_in_budget(preserved + trimable) and trimable:
            trimable = trimable[2:]  # Remove oldest user+assistant pair

        result = preserved + trimable
        removed = len(messages) - len(result)
        if removed > 0:
            print(f"Trimmed {removed} messages to stay within context budget")
        return result

manager = ContextBudgetManager(max_tokens=150000)
messages = [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there"}]
print(f"Token count: {manager.messages_token_count(messages)}")
print(f"Within budget: {manager.fits_in_budget(messages)}")`
        }}
      />

      <h2>Memory Compression and Summarization</h2>

      <p>
        When message history grows too long, rather than simply deleting old messages, a better
        strategy is to compress them into a summary. The summary preserves the semantic content
        of the earlier conversation while consuming far fewer tokens. The agent retains continuity
        without the full verbatim history.
      </p>

      <SDKExample
        title="Progressive Conversation Summarization"
        tabs={{
          python: `from anthropic import Anthropic
import json

client = Anthropic()

class SummarizingAgent:
    def __init__(self, system: str, summary_threshold: int = 30):
        self.system = system
        self.messages = []
        self.running_summary = None
        self.summary_threshold = summary_threshold  # messages before summarizing

    def _should_summarize(self) -> bool:
        return len(self.messages) >= self.summary_threshold

    def _summarize_history(self):
        """Compress old messages into a rolling summary."""
        # Keep the last 10 messages fresh; summarize everything before
        to_summarize = self.messages[:-10]
        recent = self.messages[-10:]

        summary_prompt = f"""Summarize the following conversation history concisely.
Preserve: key decisions made, information learned, tasks completed, and any open questions.
Previous summary (if any): {self.running_summary or "None"}

Messages to summarize:
{json.dumps(to_summarize, indent=2)}"""

        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=512,
            messages=[{"role": "user", "content": summary_prompt}]
        )

        self.running_summary = response.content[0].text
        self.messages = recent
        print(f"Compressed {len(to_summarize)} messages into summary.")

    def _build_system_with_summary(self) -> str:
        if self.running_summary:
            return f"{self.system}\\n\\nConversation summary so far:\\n{self.running_summary}"
        return self.system

    def chat(self, user_message: str) -> str:
        if self._should_summarize():
            self._summarize_history()

        self.messages.append({"role": "user", "content": user_message})

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=self._build_system_with_summary(),
            messages=self.messages
        )

        answer = response.content[0].text
        self.messages.append({"role": "assistant", "content": answer})
        return answer

agent = SummarizingAgent(
    system="You are a helpful assistant.",
    summary_threshold=10  # Summarize every 10 messages for demo
)

# Simulate a long conversation
for i in range(15):
    response = agent.chat(f"Tell me fact number {i+1} about Python.")
    print(f"Turn {i+1}: {response[:80]}...")`
        }}
      />

      <h2>Memory Retrieval Strategies</h2>

      <p>
        For long-term memory, effective retrieval is as important as storage. Poor retrieval
        floods the context with irrelevant information; too narrow retrieval misses critical
        context. Several strategies balance recall and precision.
      </p>

      <h3>Similarity Threshold Filtering</h3>
      <p>
        Rather than always retrieving the top-N results, filter by a minimum similarity score.
        Only retrieve memories whose cosine similarity exceeds a threshold (typically 0.7–0.85).
        This prevents low-relevance memories from cluttering the context.
      </p>

      <h3>Recency Weighting</h3>
      <p>
        Combine semantic similarity with recency. A memory from last week that is moderately
        relevant may be more useful than a highly similar memory from six months ago, especially
        for time-sensitive tasks. Score memories as: final_score = 0.7 * similarity + 0.3 * recency_score.
      </p>

      <h3>Importance-Based Retention</h3>
      <p>
        Not all memories are equally important. Have the agent assign an importance score when
        storing a memory, then use importance as a factor in both retrieval ranking and eviction
        decisions. High-importance memories survive longer and surface more readily.
      </p>

      <SDKExample
        title="Memory Retrieval with Recency and Importance Scoring"
        tabs={{
          python: `from datetime import datetime, timedelta
import math

def compute_memory_score(
    similarity: float,
    created_at: datetime,
    importance: float = 0.5,
    recency_decay_days: float = 30.0
) -> float:
    """
    Score a memory for retrieval using similarity, recency, and importance.

    similarity: cosine similarity to query (0-1)
    importance: user/agent assigned importance (0-1)
    recency: exponential decay with half-life = recency_decay_days
    """
    age_days = (datetime.utcnow() - created_at).total_seconds() / 86400
    recency = math.exp(-age_days / recency_decay_days)

    # Weighted combination
    score = (
        0.5 * similarity +
        0.3 * recency +
        0.2 * importance
    )
    return score

def retrieve_memories(
    query_embedding: list[float],
    memories: list[dict],
    top_k: int = 5,
    min_similarity: float = 0.65
) -> list[dict]:
    """Retrieve top-k memories with combined scoring."""
    scored = []
    for mem in memories:
        similarity = cosine_similarity(query_embedding, mem["embedding"])
        if similarity < min_similarity:
            continue
        score = compute_memory_score(
            similarity=similarity,
            created_at=mem["created_at"],
            importance=mem.get("importance", 0.5)
        )
        scored.append({**mem, "score": score, "similarity": similarity})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]

def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x**2 for x in a))
    mag_b = math.sqrt(sum(x**2 for x in b))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0`
        }}
      />

      <h2>Forgetting: Eviction Policies</h2>

      <p>
        Long-running agents accumulate memories that may become outdated or irrelevant. Without
        eviction policies, memory stores grow unbounded and retrieval quality degrades as noise
        accumulates. Implement explicit forgetting based on:
      </p>

      <ul>
        <li><strong>TTL (Time-to-Live):</strong> Memories expire after a fixed duration. Suitable for time-sensitive information like prices or statuses.</li>
        <li><strong>Access frequency:</strong> Memories not retrieved in N days are candidates for eviction. Similar to LRU cache eviction.</li>
        <li><strong>Explicit invalidation:</strong> When the agent learns something contradicts an existing memory, mark the old one as stale and store the updated fact.</li>
        <li><strong>Capacity limits:</strong> When the store exceeds a size limit, evict the lowest-scored memories first.</li>
      </ul>

      <h2>Memory Hygiene for Long-Running Agents</h2>

      <PatternBlock
        name="Memory Hygiene Protocol"
        category="Memory Management"
        description="Establish explicit policies for what gets stored, how long it lives, and when it gets evicted. Treat memory as a managed resource, not an append-only log."
        when={[
          "Agent runs span multiple sessions or days",
          "Memory store has more than a few hundred entries",
          "Agent is acting on behalf of users whose preferences change over time",
          "Agent deals with time-sensitive information that becomes stale"
        ]}
        avoid={[
          "Storing every interaction without filtering for importance",
          "Using a single eviction policy for all memory types",
          "Never validating whether stored facts are still current"
        ]}
      />

      <BestPracticeBlock title="Separate Memory by Volatility">
        Segment your memory store by how quickly information becomes stale. User preferences
        change slowly — months to years. Session context changes with every message. Factual
        knowledge about external systems changes when those systems change. Apply different TTLs
        and eviction policies to each segment. User preferences: no expiry. Session state:
        evict after session ends. External facts: refresh on every use or set a 24-hour TTL.
      </BestPracticeBlock>

      <WarningBlock title="Stale memory is worse than no memory">
        An agent that recalls outdated facts with high confidence can cause more harm than an
        agent with no memory. If your agent stores facts about external systems (API endpoints,
        prices, user account states), implement validation: before using a recalled fact, verify
        it is still current or attach a "last verified" timestamp and treat old facts with
        appropriate uncertainty. Never let an agent act on stale information without at least
        flagging the uncertainty.
      </WarningBlock>

      <NoteBlock title="Use compression before eviction when possible">
        Before evicting old memories, consider whether they can be compressed. Multiple
        interactions with the same user can be summarized into a user profile. A series of
        debugging steps can be compressed into a solution record. Compression retains semantic
        value while reducing storage footprint, and is almost always preferable to raw deletion.
      </NoteBlock>
    </article>
  )
}
