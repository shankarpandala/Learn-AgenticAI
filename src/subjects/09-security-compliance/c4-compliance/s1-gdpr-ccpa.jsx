import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function GdprCcpa() {
  return (
    <article className="prose-content">
      <h2>GDPR and CCPA Compliance for AI Systems</h2>
      <p>
        AI agents that process personal data of EU residents must comply with the General Data
        Protection Regulation (GDPR). Agents that process personal data of California residents
        must comply with the California Consumer Privacy Act (CCPA) and its amendment, the CPRA.
        Both regulations impose obligations on how personal data is collected, processed, stored,
        and deleted — obligations that apply specifically to AI pipelines even when the underlying
        LLM is operated by a third party. This section covers the key requirements and how to
        implement them in agent systems.
      </p>

      <h2>Lawful Basis for Processing</h2>

      <ConceptBlock term="GDPR Lawful Basis">
        <p>
          Under GDPR, every processing activity must have a lawful basis: consent, contract
          necessity, legal obligation, vital interests, public task, or legitimate interests.
          For AI agents processing customer data, the most common bases are contract necessity
          (processing required to deliver the service the user contracted for) and legitimate
          interests (with a balancing test). Consent is required for processing that goes beyond
          service delivery — such as using conversation data to train models. Document the lawful
          basis for each processing activity in your Record of Processing Activities (RoPA).
        </p>
      </ConceptBlock>

      <SecurityCallout severity="high" title="Using Customer Data to Train Models Requires Explicit Consent">
        If your AI agent logs conversations and you plan to use those logs to fine-tune or train
        models, this constitutes a new processing purpose beyond service delivery. Under GDPR,
        this requires a separate lawful basis — typically explicit consent. Under CCPA, users must
        have the right to opt out. Failure to obtain this consent before training on customer
        data is a high-risk GDPR violation.
      </SecurityCallout>

      <h2>Data Subject Rights Implementation</h2>

      <ConceptBlock term="Right to Access, Erasure, and Portability">
        <p>
          GDPR grants data subjects the right to access their data (Article 15), the right to
          erasure ("right to be forgotten," Article 17), the right to data portability (Article 20),
          and the right to object to automated decision-making (Article 22). For AI agent systems,
          this means you must be able to: locate all personal data for a given user across your
          system (conversations, tool call logs, cached results), export it in a machine-readable
          format, and delete it completely on request — including from vector databases, caches,
          and any fine-tuning datasets.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Data Subject Rights Handlers for Agent Systems"
        tabs={{
          python: `import json
import hashlib
from datetime import datetime
from typing import Any

# Simulated data stores — replace with your actual DB/vector DB clients

class ConversationStore:
    def find_by_user(self, user_id: str) -> list[dict]:
        # Query your conversation database
        return [{"id": "conv-1", "user_id": user_id, "messages": [...], "created_at": "2025-01-01"}]

    def delete_by_user(self, user_id: str) -> int:
        # Delete all conversations for user, return count
        return 1

class VectorStore:
    def find_by_user(self, user_id: str) -> list[str]:
        # Find vector IDs associated with user documents
        return ["vec-001", "vec-002"]

    def delete_by_ids(self, ids: list[str]) -> int:
        return len(ids)

class AuditLogStore:
    def find_by_user(self, user_id: str) -> list[dict]:
        # Audit logs may need to be retained for legal reasons even after erasure
        return [{"event": "login", "user_id": user_id, "timestamp": "2025-01-01"}]

conv_store = ConversationStore()
vector_store = VectorStore()
audit_store = AuditLogStore()

def handle_access_request(user_id: str) -> dict[str, Any]:
    """
    GDPR Article 15 / CCPA Right to Know.
    Return all personal data held for a user in a structured, portable format.
    """
    return {
        "user_id": user_id,
        "exported_at": datetime.utcnow().isoformat(),
        "data": {
            "conversations": conv_store.find_by_user(user_id),
            "vector_embeddings_count": len(vector_store.find_by_user(user_id)),
            "audit_events": audit_store.find_by_user(user_id),
        },
    }

def handle_erasure_request(user_id: str) -> dict[str, Any]:
    """
    GDPR Article 17 / CCPA Right to Delete.
    Delete all personal data. Audit logs retained per legal obligation (Art. 17(3)).
    """
    conv_deleted = conv_store.delete_by_user(user_id)
    vec_ids = vector_store.find_by_user(user_id)
    vec_deleted = vector_store.delete_by_ids(vec_ids)

    # Audit logs: retain for legal obligation, pseudonymise instead of delete
    # Replace user_id with a hash in audit records
    pseudonymised_id = hashlib.sha256(f"deleted:{user_id}".encode()).hexdigest()[:16]

    return {
        "user_id": user_id,
        "erasure_completed_at": datetime.utcnow().isoformat(),
        "deleted": {
            "conversations": conv_deleted,
            "vector_embeddings": vec_deleted,
        },
        "retained_and_pseudonymised": {
            "audit_logs": "retained per Art. 17(3)(e) legal obligation",
            "pseudonymised_id": pseudonymised_id,
        },
    }

def handle_portability_request(user_id: str) -> str:
    """
    GDPR Article 20 — export data in machine-readable format (JSON).
    """
    data = handle_access_request(user_id)
    return json.dumps(data, indent=2, default=str)`,
          typescript: `import * as crypto from 'crypto'

interface ConversationRecord {
  id: string
  userId: string
  messages: unknown[]
  createdAt: string
}

// Simulated data stores
async function findConversationsByUser(userId: string): Promise<ConversationRecord[]> {
  return [{ id: 'conv-1', userId, messages: [], createdAt: new Date().toISOString() }]
}

async function deleteConversationsByUser(userId: string): Promise<number> {
  return 1
}

async function findVectorIdsByUser(userId: string): Promise<string[]> {
  return ['vec-001', 'vec-002']
}

async function deleteVectorsByIds(ids: string[]): Promise<number> {
  return ids.length
}

async function handleAccessRequest(userId: string) {
  const conversations = await findConversationsByUser(userId)
  const vectorIds = await findVectorIdsByUser(userId)
  return {
    userId,
    exportedAt: new Date().toISOString(),
    data: { conversations, vectorEmbeddingsCount: vectorIds.length },
  }
}

async function handleErasureRequest(userId: string) {
  const convsDeleted = await deleteConversationsByUser(userId)
  const vectorIds = await findVectorIdsByUser(userId)
  const vecsDeleted = await deleteVectorsByIds(vectorIds)

  const pseudonymisedId = crypto
    .createHash('sha256')
    .update(deleted:\${userId})
    .digest('hex')
    .slice(0, 16)

  return {
    userId,
    erasureCompletedAt: new Date().toISOString(),
    deleted: { conversations: convsDeleted, vectorEmbeddings: vecsDeleted },
    retained: { auditLogs: 'retained per legal obligation', pseudonymisedId },
  }
}`,
        }}
      />

      <h2>Data Minimisation and Purpose Limitation</h2>

      <SDKExample
        title="Enforcing Data Minimisation in Agent Prompts"
        tabs={{
          python: `import anthropic
import re

client = anthropic.Anthropic()

def strip_unnecessary_pii(document: str, task: str) -> str:
    """
    Remove PII from documents when it is not required for the task.
    For a 'summarise topic' task, names and emails are irrelevant.
    """
    task_lower = task.lower()
    needs_names = any(k in task_lower for k in ["who", "author", "contact", "name"])
    needs_emails = any(k in task_lower for k in ["email", "contact", "reach"])

    if not needs_names:
        # Replace names with placeholder (simplified — use NER in production)
        document = re.sub(r"\\b[A-Z][a-z]+ [A-Z][a-z]+\\b", "[NAME]", document)

    if not needs_emails:
        document = re.sub(
            r"[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
            "[EMAIL]",
            document,
        )

    return document

def process_with_minimised_data(document: str, task: str) -> str:
    """Process a document with only the data necessary for the task."""
    minimised_doc = strip_unnecessary_pii(document, task)

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": f"Task: {task}\\n\\nDocument:\\n{minimised_doc}",
            }
        ],
    )
    return response.content[0].text`,
        }}
      />

      <WarningBlock title="Third-Party LLM Providers Are Data Processors Under GDPR">
        <p>
          When you send personal data to Anthropic or any other LLM provider's API, they become
          a data processor under GDPR, and you are the data controller. You must have a Data
          Processing Agreement (DPA) in place with the provider. Review Anthropic's privacy
          policy and DPA, understand their data retention policies, and ensure that the regions
          where API calls are processed are consistent with your data residency requirements.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Maintain a Record of Processing Activities for AI Systems">
        <p>
          GDPR Article 30 requires organisations to maintain a RoPA documenting each processing
          activity: purpose, data categories, recipients, retention periods, and security measures.
          Create a RoPA entry for every agent workflow that processes personal data. Include the
          lawful basis, the specific personal data categories involved (names, emails, health data),
          the retention schedule, and any third-party processors (LLM APIs, vector DBs). Review
          and update the RoPA whenever an agent's functionality changes.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="CCPA Differences from GDPR">
        <p>
          CCPA/CPRA gives California consumers the right to know, delete, correct, and opt out
          of the sale or sharing of their personal information. Unlike GDPR, CCPA does not require
          a lawful basis for processing — instead, it requires a clear privacy notice at collection.
          CCPA's "opt out of sale/sharing" applies to sharing data with third parties for
          cross-context behavioural advertising, which is rarely relevant for internal agent
          systems. However, the right to delete and right to know apply broadly and require
          the same technical implementation as GDPR erasure and access rights.
        </p>
      </NoteBlock>
    </article>
  )
}
