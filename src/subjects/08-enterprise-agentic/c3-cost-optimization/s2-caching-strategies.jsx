import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function CachingStrategies() {
  return (
    <article className="prose-content">
      <h2>Caching Strategies for Agent Cost Reduction</h2>
      <p>
        Caching is one of the most effective levers for reducing LLM costs in production.
        Three complementary caching strategies apply to different parts of the agent stack:
        prompt caching (provider-level, reuses KV cache for repeated prefixes), semantic
        caching (application-level, returns cached responses for semantically similar queries),
        and result memoisation (tool-level, avoids re-executing expensive tool calls).
      </p>

      <ArchitectureDiagram
        title="Caching Layers in an Agent System"
        width={700}
        height={260}
        nodes={[
          { id: 'user', label: 'User\nQuery', type: 'external', x: 60, y: 130 },
          { id: 'semantic', label: 'Semantic\nCache', type: 'store', x: 220, y: 60 },
          { id: 'agent', label: 'Agent\nLoop', type: 'agent', x: 400, y: 130 },
          { id: 'prompt', label: 'Prompt\nCache', type: 'store', x: 560, y: 60 },
          { id: 'tool_cache', label: 'Tool Result\nCache', type: 'store', x: 560, y: 200 },
          { id: 'llm', label: 'LLM API', type: 'llm', x: 680, y: 60 },
        ]}
        edges={[
          { from: 'user', to: 'semantic', label: 'check' },
          { from: 'user', to: 'agent', label: 'miss' },
          { from: 'agent', to: 'prompt', label: 'prefix' },
          { from: 'agent', to: 'tool_cache', label: 'tool key' },
          { from: 'prompt', to: 'llm' },
        ]}
      />

      <h2>Prompt Caching</h2>

      <ConceptBlock term="Anthropic Prompt Caching">
        <p>
          Anthropic's prompt caching feature reuses the KV cache state for repeated
          prompt prefixes, reducing input token cost by up to 90% for cached tokens.
          Mark a prefix for caching with <code>cache_control: type: ephemeral</code>.
          Cached prefixes are stored for 5 minutes (extendable on access). This is most
          effective when the same long system prompt, document context, or tool list
          appears in many consecutive requests.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Prompt Caching with cache_control"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

# --- Long static document (prime candidate for caching) ---
LARGE_KNOWLEDGE_BASE = """
[Imagine 50,000 tokens of company policy documents, product specs, or reference data here]
""" * 100  # Simulated large content

SYSTEM_WITH_CACHE = [
    {
        "type": "text",
        "text": "You are a helpful assistant with access to our product knowledge base.",
    },
    {
        "type": "text",
        "text": LARGE_KNOWLEDGE_BASE,
        "cache_control": {"type": "ephemeral"},  # Mark for caching
    },
]

def ask_with_prompt_cache(question: str) -> dict:
    """
    The large SYSTEM_WITH_CACHE prefix will be read from cache
    on the second and subsequent calls within 5 minutes.
    """
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=SYSTEM_WITH_CACHE,
        messages=[{"role": "user", "content": question}],
    )

    # Track cache performance
    usage = response.usage
    cache_hit = getattr(usage, "cache_read_input_tokens", 0) > 0
    cache_miss_tokens = getattr(usage, "cache_creation_input_tokens", 0)
    cache_read_tokens = getattr(usage, "cache_read_input_tokens", 0)

    # Approximate cost savings: cache read costs 10% of full input price
    full_price_tokens = cache_miss_tokens + cache_read_tokens
    actual_billed_tokens = (cache_miss_tokens * 1.25) + (cache_read_tokens * 0.1)
    savings_ratio = 1 - (actual_billed_tokens / max(full_price_tokens, 1))

    return {
        "response": response.content[0].text,
        "cache_hit": cache_hit,
        "cache_write_tokens": cache_miss_tokens,
        "cache_read_tokens": cache_read_tokens,
        "approx_savings_ratio": round(savings_ratio, 2),
    }

# --- Multi-turn: cache tools definition ---
TOOLS = [
    {
        "name": "search_products",
        "description": "Search the product catalog",
        "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
    },
    # ... many more tool definitions
]

def chat_with_tool_cache(messages: list) -> anthropic.types.Message:
    """Cache the tools definition — it rarely changes between turns."""
    return client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2048,
        tools=TOOLS,
        # Mark tool definitions for caching (passed as system-level cache)
        system=[{
            "type": "text",
            "text": "You are a product assistant. Use tools when needed.",
            "cache_control": {"type": "ephemeral"},
        }],
        messages=messages,
    )`,
        }}
      />

      <h2>Semantic Caching</h2>

      <ConceptBlock term="Semantic Cache">
        <p>
          A semantic cache stores embedding vectors of past queries alongside their responses.
          For each new query, compute its embedding and find the nearest neighbours in the
          cache. If the cosine similarity exceeds a threshold (typically 0.95+), return the
          cached response instead of calling the LLM. This reduces costs for paraphrased
          versions of the same question — a pattern common in customer-facing chatbots.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Semantic Cache with Embeddings"
        tabs={{
          python: `import anthropic
import numpy as np
import json
import hashlib
from pathlib import Path

client = anthropic.Anthropic()

class SemanticCache:
    def __init__(self, similarity_threshold: float = 0.95, max_size: int = 10_000):
        self.threshold = similarity_threshold
        self.max_size = max_size
        self._entries: list[dict] = []  # Each: {embedding, query, response}

    def _embed(self, text: str) -> np.ndarray:
        # Use a fast embedding model for cache lookups
        # In production, use a local model (sentence-transformers) for speed
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1,
            system="Respond with exactly one token.",
            messages=[{"role": "user", "content": f"embed: {text[:500]}"}],
        )
        # In reality, use a dedicated embedding endpoint
        # This is illustrative — use openai text-embedding-3-small or similar
        seed = int(hashlib.md5(text.encode()).hexdigest(), 16) % (2**32)
        rng = np.random.default_rng(seed)
        return rng.standard_normal(1536).astype(np.float32)

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))

    def get(self, query: str) -> str | None:
        if not self._entries:
            return None
        query_emb = self._embed(query)
        best_sim = 0.0
        best_response = None
        for entry in self._entries:
            sim = self._cosine_similarity(query_emb, entry["embedding"])
            if sim > best_sim:
                best_sim = sim
                best_response = entry["response"]
        if best_sim >= self.threshold:
            return best_response
        return None

    def put(self, query: str, response: str) -> None:
        if len(self._entries) >= self.max_size:
            self._entries.pop(0)  # LRU eviction
        self._entries.append({
            "embedding": self._embed(query),
            "query": query,
            "response": response,
        })

semantic_cache = SemanticCache(similarity_threshold=0.95)

def ask_with_semantic_cache(user_message: str) -> dict:
    cached = semantic_cache.get(user_message)
    if cached:
        return {"response": cached, "source": "semantic_cache", "tokens_used": 0}

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": user_message}],
    )
    text = response.content[0].text
    semantic_cache.put(user_message, text)
    return {
        "response": text,
        "source": "llm",
        "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
    }`,
        }}
      />

      <h2>Tool Result Memoisation</h2>

      <PatternBlock
        name="Tool Result Memoisation"
        category="Cost Optimization"
        whenToUse="When agents frequently call the same tools with the same arguments within or across runs, and the tool results are deterministic or slowly changing."
      >
        <p>
          Cache tool results by a hash of the tool name and input arguments. For idempotent
          lookups (database reads, API fetches for stable data), a TTL-based cache avoids
          redundant external calls. This reduces both cost (fewer API calls to paid external
          services) and latency (cached results return in microseconds vs. 100ms+ for live calls).
        </p>
      </PatternBlock>

      <SDKExample
        title="TTL-Based Tool Result Cache"
        tabs={{
          python: `import json
import hashlib
import time
from typing import Any, Callable

class ToolResultCache:
    def __init__(self, default_ttl: int = 300):  # 5 minutes
        self.default_ttl = default_ttl
        self._store: dict[str, dict] = {}

    def _key(self, tool_name: str, tool_input: dict) -> str:
        payload = json.dumps({"tool": tool_name, "input": tool_input}, sort_keys=True)
        return hashlib.sha256(payload.encode()).hexdigest()

    def get(self, tool_name: str, tool_input: dict) -> Any | None:
        key = self._key(tool_name, tool_input)
        entry = self._store.get(key)
        if entry and time.time() < entry["expires_at"]:
            return entry["value"]
        if entry:
            del self._store[key]
        return None

    def put(self, tool_name: str, tool_input: dict, value: Any, ttl: int = None) -> None:
        key = self._key(tool_name, tool_input)
        self._store[key] = {
            "value": value,
            "expires_at": time.time() + (ttl or self.default_ttl),
        }

# Tool TTLs: more volatile tools get shorter TTLs
TOOL_TTLS = {
    "get_product_info": 3600,    # 1 hour — product data changes slowly
    "get_exchange_rate": 60,     # 1 minute — rates change frequently
    "get_user_profile": 300,     # 5 minutes
    "send_email": 0,             # Never cache side-effects
    "execute_code": 0,           # Never cache — side-effects
}

cache = ToolResultCache()

def execute_tool_with_cache(
    tool_name: str,
    tool_input: dict,
    tool_fn: Callable,
) -> dict:
    ttl = TOOL_TTLS.get(tool_name, cache.default_ttl)

    if ttl > 0:
        cached = cache.get(tool_name, tool_input)
        if cached is not None:
            return {**cached, "_cached": True}

    result = tool_fn(**tool_input)

    if ttl > 0:
        cache.put(tool_name, tool_input, result, ttl=ttl)

    return result`,
        }}
      />

      <BestPracticeBlock title="Measure Cache Hit Rates">
        <p>
          A cache that is never hit is just added complexity. Instrument your caches with
          hit rate metrics: cache hits, misses, and evictions per cache type. A semantic
          cache hit rate below 20% suggests the threshold is too high, the cache is too
          small, or users ask genuinely diverse questions. A prompt cache miss rate above
          30% suggests your request batching or session affinity needs tuning.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Staleness Risk in Tool Caches">
        <p>
          Caching tool results risks returning stale data. Always set TTLs appropriate
          to the data's update frequency. Never cache tools that have side-effects (sending
          emails, modifying databases, charging payments). For financial or medical data,
          prefer short TTLs (under 60 seconds) or disable caching entirely and rely on
          prompt caching to reduce costs instead.
        </p>
      </NoteBlock>
    </article>
  )
}
