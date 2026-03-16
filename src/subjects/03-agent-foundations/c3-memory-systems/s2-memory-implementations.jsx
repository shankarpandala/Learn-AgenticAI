import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'

export default function MemoryImplementations() {
  return (
    <article className="prose-content">
      <p>
        Understanding memory types conceptually is only the first step. Implementing them
        correctly in a production agent requires concrete patterns for each tier. This section
        covers four practical memory implementations: in-context message memory, vector store
        semantic memory, structured key-value memory, and episodic memory with summarization.
        Each has distinct code patterns, tradeoffs, and appropriate use cases.
      </p>

      <h2>In-Context Memory (Message History)</h2>

      <p>
        The simplest memory implementation is the conversation history itself. Every message
        — user turns, assistant turns, tool calls, tool results — is appended to the messages
        array and sent with every request. The model "remembers" the conversation simply because
        it can read the full history each time.
      </p>

      <SDKExample
        title="In-Context Memory with Message History"
        tabs={{
          python: `from anthropic import Anthropic

client = Anthropic()

class InContextAgent:
    def __init__(self, system_prompt: str):
        self.system = system_prompt
        self.messages = []  # The entire conversation history

    def chat(self, user_message: str) -> str:
        self.messages.append({"role": "user", "content": user_message})

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2048,
            system=self.system,
            messages=self.messages
        )

        assistant_message = response.content[0].text
        self.messages.append({"role": "assistant", "content": assistant_message})
        return assistant_message

    def token_count(self) -> int:
        """Estimate tokens used by current history."""
        # Rough estimate: 4 chars per token
        total_chars = sum(
            len(str(m["content"])) for m in self.messages
        )
        return total_chars // 4

    def trim_history(self, keep_last_n: int = 20):
        """Keep only the most recent N turns to manage context size."""
        if len(self.messages) > keep_last_n:
            self.messages = self.messages[-keep_last_n:]

# Usage
agent = InContextAgent("You are a helpful assistant that remembers our conversation.")
print(agent.chat("My name is Alex and I work on ML infrastructure."))
print(agent.chat("What's my name and what do I work on?"))  # Agent remembers
print(f"Approximate tokens used: {agent.token_count()}")`
        }}
      />

      <ConceptBlock term="Vector Store Memory">
        Vector store memory implements semantic search over a corpus of documents or past
        interactions. Text is converted to embedding vectors, stored in a vector database, and
        retrieved by finding vectors with high cosine similarity to a query embedding. This
        allows the agent to retrieve relevant information from a large corpus without stuffing
        everything into context. Common implementations use FAISS, Chroma, Pinecone, or Weaviate.
      </ConceptBlock>

      <SDKExample
        title="Vector Store Semantic Memory"
        tabs={{
          python: `from anthropic import Anthropic
import json

# Using chromadb for local vector storage
# pip install chromadb anthropic

import chromadb
from chromadb.utils import embedding_functions

client = Anthropic()
chroma_client = chromadb.Client()

# Use a sentence transformer for embeddings
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

class VectorMemoryAgent:
    def __init__(self, collection_name: str = "agent_memory"):
        self.collection = chroma_client.get_or_create_collection(
            name=collection_name,
            embedding_function=embedding_fn
        )
        self.message_count = 0

    def remember(self, text: str, metadata: dict = None):
        """Store a memory in the vector store."""
        self.message_count += 1
        self.collection.add(
            documents=[text],
            metadatas=[metadata or {}],
            ids=[f"memory_{self.message_count}"]
        )

    def recall(self, query: str, n_results: int = 3) -> list[str]:
        """Retrieve relevant memories for a query."""
        results = self.collection.query(
            query_texts=[query],
            n_results=min(n_results, self.collection.count())
        )
        return results["documents"][0] if results["documents"] else []

    def chat(self, user_message: str) -> str:
        # Retrieve relevant memories
        relevant_memories = self.recall(user_message)
        memory_context = ""
        if relevant_memories:
            memory_context = "\\nRelevant memories:\\n" + "\\n".join(
                f"- {m}" for m in relevant_memories
            )

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=f"You are a helpful assistant with access to long-term memory.{memory_context}",
            messages=[{"role": "user", "content": user_message}]
        )

        answer = response.content[0].text

        # Store this interaction as a memory
        self.remember(
            f"User asked: {user_message} | Answer: {answer}",
            {"type": "interaction"}
        )
        return answer

# Usage
agent = VectorMemoryAgent()
agent.remember("Alex is a senior ML engineer who prefers Python.", {"type": "user_profile"})
agent.remember("The production model is claude-opus-4-5, deployed in us-east-1.", {"type": "system_info"})

response = agent.chat("What model are we running in production?")
print(response)  # Recalls the stored system info`
        }}
      />

      <h2>Structured Key-Value Memory</h2>

      <p>
        Not all memory needs semantic search. User preferences, account settings, and
        configuration values are best stored in a structured key-value store and retrieved
        deterministically by key. This pattern is simpler, faster, and cheaper than vector
        retrieval for information with known lookup keys.
      </p>

      <SDKExample
        title="Structured Key-Value Memory"
        tabs={{
          python: `from anthropic import Anthropic
import json
import redis  # pip install redis

client = Anthropic()
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

class StructuredMemoryAgent:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.memory_prefix = f"agent:memory:{user_id}"

    def set_memory(self, key: str, value: any):
        """Store a structured memory item."""
        full_key = f"{self.memory_prefix}:{key}"
        redis_client.set(full_key, json.dumps(value))

    def get_memory(self, key: str) -> any:
        """Retrieve a specific memory item."""
        full_key = f"{self.memory_prefix}:{key}"
        value = redis_client.get(full_key)
        return json.loads(value) if value else None

    def get_all_memories(self) -> dict:
        """Retrieve all stored memories for this user."""
        pattern = f"{self.memory_prefix}:*"
        keys = redis_client.keys(pattern)
        memories = {}
        for key in keys:
            short_key = key.replace(f"{self.memory_prefix}:", "")
            value = redis_client.get(key)
            memories[short_key] = json.loads(value) if value else None
        return memories

    def chat_with_memory(self, user_message: str) -> str:
        memories = self.get_all_memories()
        memory_context = json.dumps(memories, indent=2) if memories else "No stored memories."

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=f"""You are a personalized assistant.
User memory store:
{memory_context}

When the user tells you something to remember, acknowledge it.
When updating memory based on conversation, note the key you would update.""",
            messages=[{"role": "user", "content": user_message}]
        )
        return response.content[0].text

# Usage
agent = StructuredMemoryAgent(user_id="user_123")
agent.set_memory("name", "Alex")
agent.set_memory("preferences", {"language": "Python", "editor": "neovim"})
agent.set_memory("timezone", "UTC-8")

response = agent.chat_with_memory("What do you know about me?")
print(response)`
        }}
      />

      <h2>Episodic Memory with Summarization</h2>

      <p>
        Episodic memory stores the record of past agent runs: what was attempted, what tools
        were called, what succeeded, and what failed. When a new similar task arrives, the agent
        can retrieve relevant past episodes as context, learning from experience without
        retraining.
      </p>

      <SDKExample
        title="Episodic Memory with Run Summarization"
        tabs={{
          python: `from anthropic import Anthropic
import json
import sqlite3
from datetime import datetime

client = Anthropic()

class EpisodicMemoryStore:
    def __init__(self, db_path: str = "episodes.db"):
        self.conn = sqlite3.connect(db_path)
        self._init_db()

    def _init_db(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS episodes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT NOT NULL,
                summary TEXT NOT NULL,
                outcome TEXT NOT NULL,
                tools_used TEXT,
                created_at TEXT NOT NULL
            )
        """)
        self.conn.commit()

    def store_episode(self, task: str, messages: list, outcome: str):
        """Summarize and store a completed agent run."""
        # Use Claude to generate a concise episode summary
        summary_response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=512,
            messages=[{
                "role": "user",
                "content": f"""Summarize this agent run in 2-3 sentences for future reference.
Focus on: what was attempted, key steps taken, and what succeeded or failed.

Task: {task}
Messages: {json.dumps(messages[-6:], indent=2)}  # Last 6 messages
Outcome: {outcome}"""
            }]
        )
        summary = summary_response.content[0].text

        tools_used = [
            m.get("tool_name") for m in messages
            if isinstance(m, dict) and m.get("type") == "tool_use"
        ]

        self.conn.execute(
            "INSERT INTO episodes (task, summary, outcome, tools_used, created_at) VALUES (?,?,?,?,?)",
            (task, summary, outcome, json.dumps(tools_used), datetime.utcnow().isoformat())
        )
        self.conn.commit()

    def retrieve_similar_episodes(self, task: str, limit: int = 3) -> list[dict]:
        """Retrieve episodes with similar task descriptions."""
        # Simplified: keyword search. Production: use vector similarity.
        words = task.lower().split()
        query = " OR ".join([f"task LIKE '%{w}%'" for w in words[:5]])
        cursor = self.conn.execute(
            f"SELECT task, summary, outcome, created_at FROM episodes WHERE {query} "
            f"ORDER BY created_at DESC LIMIT ?",
            (limit,)
        )
        return [
            {"task": row[0], "summary": row[1], "outcome": row[2], "date": row[3]}
            for row in cursor.fetchall()
        ]

def run_agent_with_episodes(task: str, store: EpisodicMemoryStore) -> str:
    # Retrieve relevant past experiences
    past_episodes = store.retrieve_similar_episodes(task)
    episode_context = ""
    if past_episodes:
        episode_context = "\\nRelevant past experiences:\\n" + "\\n".join([
            f"- Task: {ep['task']}\\n  Summary: {ep['summary']}\\n  Outcome: {ep['outcome']}"
            for ep in past_episodes
        ])

    messages = [{"role": "user", "content": task}]
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=f"You are a helpful agent.{episode_context}",
        messages=messages
    )

    result = response.content[0].text
    messages.append({"role": "assistant", "content": result})

    # Store this episode for future reference
    store.store_episode(task, messages, "completed")
    return result

store = EpisodicMemoryStore()
result = run_agent_with_episodes("Debug the authentication service", store)
print(result)`
        }}
      />

      <BestPracticeBlock title="Choose Memory Implementation Based on Access Pattern">
        Use in-context history for active session state, vector stores for semantic recall over
        large corpora, key-value stores for structured attributes with known keys, and episodic
        stores for learning from past runs. Mixing all four in a single agent is common for
        sophisticated applications — each serves a distinct purpose. The wrong choice is using
        one type for all cases: vector search for structured preferences adds unnecessary latency,
        while key-value lookup for free-form knowledge is brittle.
      </BestPracticeBlock>

      <NoteBlock title="Embedding model choice matters for retrieval quality">
        The quality of vector store retrieval depends heavily on the embedding model. General-
        purpose models like all-MiniLM-L6-v2 work well for conversational content. For domain-
        specific content (code, legal text, medical records), fine-tuned or domain-specific
        embedding models significantly improve retrieval precision. Always evaluate retrieval
        quality with real queries before deploying a vector memory system.
      </NoteBlock>
    </article>
  )
}
