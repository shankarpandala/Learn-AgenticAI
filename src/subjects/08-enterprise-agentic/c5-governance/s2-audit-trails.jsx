import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function AuditTrails() {
  return (
    <article className="prose-content">
      <h2>Audit Trails for Agent Systems</h2>
      <p>
        An immutable audit trail records every decision, tool call, and model response
        produced by an agent. Audit logs are the foundation for incident investigation,
        regulatory compliance (SOC 2, GDPR, EU AI Act), and accountability when an agent
        takes a harmful action. Unlike operational logs, audit records must be write-once,
        tamper-evident, and retained for compliance periods.
      </p>

      <ArchitectureDiagram
        title="Audit Trail Architecture"
        width={700}
        height={240}
        nodes={[
          { id: 'agent', label: 'Agent\nService', type: 'agent', x: 80, y: 120 },
          { id: 'event_bus', label: 'Audit\nEvent Bus', type: 'tool', x: 280, y: 120 },
          { id: 'immutable', label: 'Immutable\nAudit Store\n(S3/WORM)', type: 'store', x: 500, y: 60 },
          { id: 'search', label: 'Searchable\nIndex\n(OpenSearch)', type: 'store', x: 500, y: 180 },
          { id: 'compliance', label: 'Compliance\nReporting', type: 'external', x: 660, y: 120 },
        ]}
        edges={[
          { from: 'agent', to: 'event_bus', label: 'emit' },
          { from: 'event_bus', to: 'immutable', label: 'write-once' },
          { from: 'event_bus', to: 'search', label: 'index' },
          { from: 'immutable', to: 'compliance' },
          { from: 'search', to: 'compliance' },
        ]}
      />

      <h2>Audit Event Schema</h2>

      <ConceptBlock term="Structured Audit Events">
        <p>
          Each audit event captures: who initiated the action (user, system, tenant),
          what happened (event type), when it happened (ISO 8601 timestamp), what inputs
          were provided, what outputs were produced, and what the outcome was. Every event
          carries a correlation ID linking it to its parent agent run and session.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Audit Event Emission"
        tabs={{
          python: `import anthropic
import hashlib
import json
import time
import uuid
from dataclasses import dataclass, asdict, field

client = anthropic.Anthropic()

@dataclass
class AuditEvent:
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    run_id: str = ""
    session_id: str = ""
    user_id: str = ""
    tenant_id: str = ""
    event_type: str = ""
    agent_version: str = ""
    timestamp: str = field(default_factory=lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    input_summary: str = ""
    output_summary: str = ""
    input_hash: str = ""
    output_hash: str = ""
    tokens_input: int = 0
    tokens_output: int = 0
    latency_ms: float = 0.0
    model: str = ""
    tool_name: str = ""
    outcome: str = ""
    error_type: str = ""

    def to_json(self) -> str:
        return json.dumps(asdict(self))

    def integrity_hash(self) -> str:
        return hashlib.sha256(self.to_json().encode()).hexdigest()

class AuditLogger:
    def emit(self, event: AuditEvent) -> None:
        print(json.dumps({
            "audit": True,
            "event": asdict(event),
            "integrity": event.integrity_hash(),
        }))

audit = AuditLogger()

def _hash_content(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()[:16]

def _summarise(text: str, max_len: int = 200) -> str:
    summary = text[:max_len]
    if len(text) > max_len:
        summary += f"... [{len(text)} chars total]"
    return summary

def run_agent_with_audit(
    user_message: str,
    user_id: str,
    session_id: str,
    tenant_id: str,
    agent_version: str = "v1.5.0",
) -> str:
    run_id = str(uuid.uuid4())

    audit.emit(AuditEvent(
        run_id=run_id,
        session_id=session_id,
        user_id=user_id,
        tenant_id=tenant_id,
        event_type="agent.run.started",
        agent_version=agent_version,
        input_summary=_summarise(user_message),
        input_hash=_hash_content(user_message),
    ))

    messages = [{"role": "user", "content": user_message}]
    start = time.monotonic()

    try:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2048,
            messages=messages,
        )
        output_text = next(b.text for b in response.content if hasattr(b, "text"))

        audit.emit(AuditEvent(
            run_id=run_id, session_id=session_id, user_id=user_id, tenant_id=tenant_id,
            event_type="llm.call",
            agent_version=agent_version,
            model=response.model,
            tokens_input=response.usage.input_tokens,
            tokens_output=response.usage.output_tokens,
            latency_ms=round((time.monotonic() - start) * 1000, 2),
            output_summary=_summarise(output_text),
            output_hash=_hash_content(output_text),
            outcome="success",
        ))

        return output_text

    except Exception as e:
        audit.emit(AuditEvent(
            run_id=run_id, session_id=session_id, user_id=user_id, tenant_id=tenant_id,
            event_type="agent.run.error",
            agent_version=agent_version,
            outcome="error",
            error_type=type(e).__name__,
        ))
        raise`,
        }}
      />

      <PatternBlock
        name="Write-Once Audit Store"
        category="Governance"
        whenToUse="When audit records must be tamper-evident for regulatory compliance (SOC 2, EU AI Act, financial regulations) or legal admissibility."
      >
        <p>
          Use an S3 bucket with Object Lock (WORM) or an append-only database (Amazon QLDB,
          Azure Immutable Blob Storage) to ensure audit records cannot be modified or deleted.
          Fan audit events to both the WORM store and an OpenSearch index — the WORM store
          is the source of truth; the index is a queryable replica.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Hash Content Instead of Storing Raw PII">
        <p>
          Raw user messages in audit logs may contain PII. Under GDPR, you may need to
          delete this data on request — but audit records must be immutable. Resolve this
          by storing a SHA-256 hash of the content in the immutable audit store and the
          actual content in a separate erasable store. The hash proves integrity; the
          erasable store satisfies right-to-erasure requests.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Restrict Audit Store Write Permissions">
        <p>
          Audit logs that can be modified by the same team whose actions they record provide
          no meaningful accountability. Audit store write permissions must be restricted to
          the agent service identity only. Developers and DBAs should have read access only.
          Protect write permissions with MFA and log all access attempts to the audit store.
        </p>
      </NoteBlock>
    </article>
  )
}
