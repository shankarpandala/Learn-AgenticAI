import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function DistributedState() {
  return (
    <article className="prose-content">
      <h2>Distributed State for Agent Systems</h2>
      <p>
        Stateless agent workers require all persistent state to live in shared external stores.
        This includes conversation history (messages), per-run progress checkpoints, long-term
        user memory, and distributed locks to prevent concurrent workers from processing the
        same session. Redis, DynamoDB, and event sourcing each fit different state access patterns.
      </p>

      <ArchitectureDiagram
        title="Distributed State Architecture"
        width={700}
        height={260}
        nodes={[
          { id: 'w1', label: 'Worker 1', type: 'agent', x: 80, y: 80 },
          { id: 'w2', label: 'Worker 2', type: 'agent', x: 80, y: 180 },
          { id: 'redis', label: 'Redis\n(session state,\nlocks, cache)', type: 'store', x: 320, y: 80 },
          { id: 'dynamo', label: 'DynamoDB\n(conversation\nhistory)', type: 'store', x: 320, y: 180 },
          { id: 'events', label: 'Event\nStore\n(audit)', type: 'store', x: 560, y: 130 },
        ]}
        edges={[
          { from: 'w1', to: 'redis' },
          { from: 'w2', to: 'redis' },
          { from: 'w1', to: 'dynamo' },
          { from: 'w2', to: 'dynamo' },
          { from: 'w1', to: 'events' },
          { from: 'w2', to: 'events' },
        ]}
      />

      <h2>Session State in Redis</h2>

      <ConceptBlock term="Redis Session Store">
        <p>
          Redis is the primary store for short-lived agent session state: the current
          message list, step counter, token budget remaining, and any in-progress tool
          results. Redis's sub-millisecond reads and atomic operations (SETNX for locks,
          INCR for counters) make it ideal for hot session data that workers read and
          write on every agent step.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Redis-Backed Session State"
        tabs={{
          python: `import redis
import json
import time
from dataclasses import dataclass, asdict
from typing import Optional

r = redis.Redis(host="redis", port=6379, decode_responses=True)

SESSION_TTL = 3600  # 1 hour

@dataclass
class AgentSession:
    session_id: str
    messages: list
    step: int = 0
    tokens_used: int = 0
    created_at: float = 0.0
    updated_at: float = 0.0

class RedisSessionStore:
    def load(self, session_id: str) -> Optional[AgentSession]:
        key = f"session:{session_id}"
        data = r.get(key)
        if not data:
            return None
        d = json.loads(data)
        return AgentSession(**d)

    def save(self, session: AgentSession) -> None:
        key = f"session:{session.session_id}"
        session.updated_at = time.time()
        r.setex(key, SESSION_TTL, json.dumps(asdict(session)))

    def create(self, session_id: str, initial_message: str) -> AgentSession:
        session = AgentSession(
            session_id=session_id,
            messages=[{"role": "user", "content": initial_message}],
            created_at=time.time(),
        )
        self.save(session)
        return session

    def delete(self, session_id: str) -> None:
        r.delete(f"session:{session_id}")

# --- Distributed lock: prevent two workers resuming the same session ---
class DistributedLock:
    def __init__(self, name: str, ttl: int = 300):
        self.key = f"lock:{name}"
        self.ttl = ttl

    def acquire(self, worker_id: str) -> bool:
        """Returns True if lock acquired, False if already held."""
        return bool(r.set(self.key, worker_id, nx=True, ex=self.ttl))

    def release(self, worker_id: str) -> bool:
        """Only release if this worker holds the lock."""
        current = r.get(self.key)
        if current == worker_id:
            r.delete(self.key)
            return True
        return False

    def extend(self, worker_id: str) -> bool:
        """Extend lock TTL while still processing."""
        current = r.get(self.key)
        if current == worker_id:
            r.expire(self.key, self.ttl)
            return True
        return False

# Usage
store = RedisSessionStore()

def resume_agent_session(session_id: str, worker_id: str) -> Optional[AgentSession]:
    lock = DistributedLock(f"session-{session_id}", ttl=60)
    if not lock.acquire(worker_id):
        return None  # Another worker is handling this session
    return store.load(session_id)`,
        }}
      />

      <h2>Persistent Conversation History in DynamoDB</h2>

      <ConceptBlock term="DynamoDB Conversation Store">
        <p>
          While Redis holds hot in-flight session state, DynamoDB (or any NoSQL document
          store) is better suited for long-term conversation history: durable, scalable,
          queryable by user and time, and with TTL-based expiry for privacy compliance.
          Store each message turn as a separate item for efficient range queries and
          incremental appends.
        </p>
      </ConceptBlock>

      <SDKExample
        title="DynamoDB Conversation History Store"
        tabs={{
          python: `import boto3
import time
import uuid
from decimal import Decimal

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("agent-conversations")

# Table schema:
# PK: session_id (string)
# SK: turn_id (string, sortable: timestamp#uuid)
# TTL: expires_at (number, epoch seconds)

CONVERSATION_TTL_DAYS = 90

def append_turn(
    session_id: str,
    role: str,  # "user" | "assistant"
    content: str,
    metadata: dict = None,
) -> str:
    turn_id = f"{int(time.time() * 1000):016d}#{uuid.uuid4()}"
    expires_at = int(time.time()) + (CONVERSATION_TTL_DAYS * 86400)

    item = {
        "session_id": session_id,
        "turn_id": turn_id,
        "role": role,
        "content": content,
        "timestamp": Decimal(str(time.time())),
        "expires_at": expires_at,
    }
    if metadata:
        item["metadata"] = metadata

    table.put_item(Item=item)
    return turn_id

def get_conversation(
    session_id: str,
    limit: int = 50,
) -> list[dict]:
    response = table.query(
        KeyConditionExpression="session_id = :sid",
        ExpressionAttributeValues={":sid": session_id},
        ScanIndexForward=True,  # Oldest first
        Limit=limit,
    )
    return [
        {"role": item["role"], "content": item["content"]}
        for item in response["Items"]
    ]

def delete_conversation(session_id: str) -> None:
    """Delete all turns for a session (GDPR right to erasure)."""
    items = table.query(
        KeyConditionExpression="session_id = :sid",
        ExpressionAttributeValues={":sid": session_id},
        ProjectionExpression="session_id, turn_id",
    )["Items"]

    with table.batch_writer() as batch:
        for item in items:
            batch.delete_item(Key={
                "session_id": item["session_id"],
                "turn_id": item["turn_id"],
            })`,
        }}
      />

      <h2>Event Sourcing for Agent State</h2>

      <PatternBlock
        name="Event Sourcing"
        category="Distributed State"
        whenToUse="When you need a complete, immutable audit trail of all agent state changes, or when you need to replay agent runs to reconstruct state at any point in time."
      >
        <p>
          Instead of storing the current state directly, store the sequence of events that
          produced it (LLM call made, tool call executed, message appended). To reconstruct
          the current state, replay the event log from the beginning. This provides a natural
          audit trail, makes time-travel debugging trivial, and enables event-driven
          integration with other systems.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Use Redis for Hot State, DynamoDB for Cold State">
        <p>
          Structure your state storage in two tiers: Redis for the in-flight active session
          (fast read/write on every step, TTL-based expiry when session ends) and DynamoDB
          for long-term persisted conversation history and audit records. When a session
          resumes after expiry, reconstruct the Redis session from DynamoDB. This gives you
          the best of both: sub-millisecond hot access and durable long-term storage.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Avoid Storing Raw Message Content in Redis">
        <p>
          Redis is typically deployed without encryption at rest in many configurations.
          If message content may contain PII or confidential data, store only a reference
          (session ID + DynamoDB key) in Redis, with the actual content in DynamoDB with
          encryption at rest enabled. This ensures sensitive content is only stored in your
          encrypted durable store, not in a hot in-memory cache.
        </p>
      </NoteBlock>
    </article>
  )
}
