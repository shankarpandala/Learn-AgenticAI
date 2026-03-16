import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function HumanOversight() {
  return (
    <article className="prose-content">
      <h2>Human-in-the-Loop Oversight for Agents</h2>
      <p>
        High-stakes agent tasks — sending emails to customers, modifying financial records,
        publishing content, or taking irreversible actions — should not be executed autonomously
        without a human checkpoint. Human-in-the-loop (HITL) patterns insert approval gates
        at critical decision points, allowing agents to prepare work and humans to review,
        approve, or override before irreversible actions are taken.
      </p>

      <ArchitectureDiagram
        title="Human-in-the-Loop Approval Flow"
        width={700}
        height={260}
        nodes={[
          { id: 'agent', label: 'Agent\nPrepares\nAction', type: 'agent', x: 80, y: 130 },
          { id: 'risk', label: 'Risk\nClassifier', type: 'tool', x: 260, y: 130 },
          { id: 'auto', label: 'Auto\nExecute', type: 'store', x: 440, y: 60 },
          { id: 'review', label: 'Human\nReview\nQueue', type: 'external', x: 440, y: 130 },
          { id: 'reject', label: 'Reject\n+ Explain', type: 'tool', x: 440, y: 200 },
          { id: 'execute', label: 'Execute\nAction', type: 'agent', x: 630, y: 100 },
        ]}
        edges={[
          { from: 'agent', to: 'risk' },
          { from: 'risk', to: 'auto', label: 'low risk' },
          { from: 'risk', to: 'review', label: 'high risk' },
          { from: 'risk', to: 'reject', label: 'blocked' },
          { from: 'auto', to: 'execute' },
          { from: 'review', to: 'execute', label: 'approved' },
        ]}
      />

      <h2>Risk-Based Approval Gates</h2>

      <ConceptBlock term="Approval Gate">
        <p>
          An approval gate pauses agent execution before a high-risk action, serialises
          the proposed action to a review queue, and waits for a human decision (approve,
          reject, or modify). The agent resumes only after receiving an explicit approval
          signal. This pattern is essential for agents that can take actions with real-world
          consequences: financial transactions, external communications, or data deletion.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Risk-Classified Approval Gate"
        tabs={{
          python: `import anthropic
import uuid
import time
from enum import Enum
from dataclasses import dataclass

client = anthropic.Anthropic()

class RiskLevel(Enum):
    LOW = "low"        # Auto-execute
    MEDIUM = "medium"  # Log and execute with delay
    HIGH = "high"      # Require human approval
    BLOCKED = "blocked"  # Never execute

# Risk classification rules
HIGH_RISK_TOOLS = {"send_customer_email", "process_refund", "delete_account", "publish_content"}
BLOCKED_TOOLS = {"drop_database", "modify_billing", "export_all_data"}

def classify_tool_risk(tool_name: str, tool_input: dict) -> RiskLevel:
    if tool_name in BLOCKED_TOOLS:
        return RiskLevel.BLOCKED
    if tool_name in HIGH_RISK_TOOLS:
        return RiskLevel.HIGH
    # Additional heuristics
    if tool_name == "send_email":
        recipients = tool_input.get("to", "")
        if "@" in str(recipients) and "external" in str(recipients):
            return RiskLevel.HIGH
    return RiskLevel.LOW

@dataclass
class PendingAction:
    action_id: str
    tool_name: str
    tool_input: dict
    risk_level: RiskLevel
    context: str  # Why the agent wants to take this action
    submitted_at: float
    approved: bool | None = None  # None = pending
    reviewer_id: str = ""
    reviewer_note: str = ""

# In-memory pending actions (use a DB in production)
PENDING_ACTIONS: dict[str, PendingAction] = {}

def submit_for_review(tool_name: str, tool_input: dict, context: str) -> str:
    action_id = str(uuid.uuid4())
    PENDING_ACTIONS[action_id] = PendingAction(
        action_id=action_id,
        tool_name=tool_name,
        tool_input=tool_input,
        risk_level=classify_tool_risk(tool_name, tool_input),
        context=context,
        submitted_at=time.time(),
    )
    # Notify reviewers (email, Slack, etc.)
    print(f"[REVIEW REQUIRED] Action {action_id}: {tool_name} — {context}")
    return action_id

def wait_for_approval(action_id: str, timeout: float = 3600.0) -> bool:
    """Poll for approval decision (use webhooks or SSE in production)."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        action = PENDING_ACTIONS.get(action_id)
        if action and action.approved is not None:
            return action.approved
        time.sleep(5)
    return False  # Timeout = implicit reject

def human_approve(action_id: str, reviewer_id: str, note: str = "") -> None:
    if action_id in PENDING_ACTIONS:
        PENDING_ACTIONS[action_id].approved = True
        PENDING_ACTIONS[action_id].reviewer_id = reviewer_id
        PENDING_ACTIONS[action_id].reviewer_note = note

def human_reject(action_id: str, reviewer_id: str, reason: str) -> None:
    if action_id in PENDING_ACTIONS:
        PENDING_ACTIONS[action_id].approved = False
        PENDING_ACTIONS[action_id].reviewer_id = reviewer_id
        PENDING_ACTIONS[action_id].reviewer_note = reason

def execute_tool_with_oversight(tool_name: str, tool_input: dict, context: str = "") -> dict:
    risk = classify_tool_risk(tool_name, tool_input)

    if risk == RiskLevel.BLOCKED:
        return {"error": True, "message": f"Tool '{tool_name}' is blocked by policy."}

    if risk == RiskLevel.LOW:
        return _execute_tool(tool_name, tool_input)

    if risk == RiskLevel.HIGH:
        action_id = submit_for_review(tool_name, tool_input, context)
        approved = wait_for_approval(action_id, timeout=3600)
        if approved:
            return _execute_tool(tool_name, tool_input)
        reason = PENDING_ACTIONS.get(action_id, PendingAction("", "", {}, RiskLevel.LOW, "", 0)).reviewer_note
        return {
            "error": True,
            "message": f"Action rejected by reviewer: {reason or 'No reason provided.'}",
        }

    return {"error": True, "message": "Unhandled risk level."}

def _execute_tool(tool_name: str, tool_input: dict) -> dict:
    # Real implementation here
    return {"success": True, "tool": tool_name}`,
        }}
      />

      <h2>Override Mechanisms</h2>

      <PatternBlock
        name="Human Override"
        category="Governance"
        whenToUse="When an agent has taken an incorrect action that needs to be reversed, or when a human needs to inject additional context into a running agent loop."
      >
        <p>
          Design agents to accept out-of-band human inputs mid-run: a "stop and replan"
          signal, an injected context message, or an "undo last action" command. Store
          pending override instructions in the session state store; the agent loop checks
          for them at the start of each step. This gives operators the ability to course-
          correct a running agent without killing the session entirely.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Make Approval Workflows Low-Friction">
        <p>
          Approval gates that require reviewers to log into a separate dashboard, read
          pages of context, and manually execute actions create friction that leads to
          rubber-stamping. Design approval UIs that show the proposed action, its risk
          rationale, and the agent's explanation in one view, with one-click approve/reject.
          Include a "request more information" option that injects a question back to the
          agent rather than rejecting outright.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Start with Higher Oversight, Reduce Over Time">
        <p>
          When deploying a new agent, require human approval for all medium and high risk
          actions. As the agent proves reliable in production (low rejection rate, high
          quality), gradually automate medium-risk actions using the approval history as
          training data for a risk classifier. This data-driven approach to reducing HITL
          overhead is safer than setting a low oversight level at launch.
        </p>
      </NoteBlock>
    </article>
  )
}
