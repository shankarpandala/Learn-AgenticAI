import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function Soc2Iso27001() {
  return (
    <article className="prose-content">
      <h2>SOC 2 and ISO 27001 for AI Agent Systems</h2>
      <p>
        Enterprise customers increasingly require their AI vendors to hold SOC 2 Type II or ISO
        27001 certifications before signing contracts. These frameworks provide a structured
        approach to information security management that, when applied correctly, covers AI agent
        systems. The key challenge is that AI agents introduce controls gaps not covered by
        traditional checklists: model behaviour, prompt injection risk, non-deterministic outputs,
        and third-party LLM API dependency. This section maps the key requirements of each
        framework to concrete AI agent controls.
      </p>

      <h2>SOC 2 Trust Service Criteria for AI Agents</h2>

      <ConceptBlock term="SOC 2 Type II">
        <p>
          SOC 2 evaluates controls across five Trust Service Criteria: Security (CC series),
          Availability (A series), Processing Integrity (PI series), Confidentiality (C series),
          and Privacy (P series). For AI agent systems, the most frequently tested criteria are
          Security (access controls, monitoring, change management) and Processing Integrity
          (agent outputs are complete, valid, accurate, and authorised). A Type II report covers
          the effectiveness of controls over a period (typically 6–12 months), not just their
          existence at a point in time.
        </p>
      </ConceptBlock>

      <SDKExample
        title="SOC 2 Control Evidence: Access Control Logging"
        tabs={{
          python: `import json
import time
import uuid
import logging
from dataclasses import dataclass, asdict
from typing import Any

# Configure structured logging to a SIEM-compatible format
logging.basicConfig(
    format="%(message)s",
    level=logging.INFO,
)
logger = logging.getLogger("soc2.access_control")

@dataclass
class AccessEvent:
    event_id: str
    event_type: str          # "tool_access", "data_access", "auth_failure"
    timestamp_utc: str
    agent_id: str
    user_id: str
    resource: str
    action: str
    outcome: str             # "permitted", "denied"
    denial_reason: str | None
    session_id: str
    control_id: str          # Maps to SOC 2 control e.g. "CC6.1"

def log_access_event(
    event_type: str,
    agent_id: str,
    user_id: str,
    resource: str,
    action: str,
    outcome: str,
    denial_reason: str | None = None,
    session_id: str | None = None,
    control_id: str = "CC6.1",
) -> AccessEvent:
    """
    Log a structured access control event for SOC 2 evidence collection.
    CC6.1: Logical and physical access to systems and data is restricted.
    """
    event = AccessEvent(
        event_id=str(uuid.uuid4()),
        event_type=event_type,
        timestamp_utc=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        agent_id=agent_id,
        user_id=user_id,
        resource=resource,
        action=action,
        outcome=outcome,
        denial_reason=denial_reason,
        session_id=session_id or str(uuid.uuid4()),
        control_id=control_id,
    )
    logger.info(json.dumps(asdict(event)))
    return event

def controlled_tool_dispatch(
    agent_id: str,
    user_id: str,
    session_id: str,
    tool_name: str,
    tool_input: dict[str, Any],
    permitted_tools: set[str],
) -> dict[str, Any]:
    """
    Dispatch tool with access control and SOC 2 evidence logging.
    Demonstrates CC6.1 (access restriction) and CC7.2 (monitoring).
    """
    if tool_name not in permitted_tools:
        log_access_event(
            event_type="tool_access",
            agent_id=agent_id,
            user_id=user_id,
            resource=f"tool:{tool_name}",
            action="invoke",
            outcome="denied",
            denial_reason="tool not in permitted set for agent role",
            session_id=session_id,
            control_id="CC6.1",
        )
        return {"error": "access_denied", "tool": tool_name}

    log_access_event(
        event_type="tool_access",
        agent_id=agent_id,
        user_id=user_id,
        resource=f"tool:{tool_name}",
        action="invoke",
        outcome="permitted",
        session_id=session_id,
        control_id="CC6.1",
    )

    # Execute tool
    return {"status": "ok", "tool": tool_name}`,
          typescript: `import { randomUUID } from 'crypto'

interface AccessEvent {
  eventId: string
  eventType: string
  timestampUtc: string
  agentId: string
  userId: string
  resource: string
  action: string
  outcome: 'permitted' | 'denied'
  denialReason: string | null
  sessionId: string
  controlId: string
}

function logAccessEvent(event: AccessEvent): void {
  // In production, ship to SIEM (Splunk, Datadog, CloudWatch Logs)
  console.info(JSON.stringify(event))
}

function controlledToolDispatch(
  agentId: string,
  userId: string,
  sessionId: string,
  toolName: string,
  toolInput: Record<string, unknown>,
  permittedTools: Set<string>
): Record<string, unknown> {
  const baseEvent = {
    eventId: randomUUID(),
    eventType: 'tool_access',
    timestampUtc: new Date().toISOString(),
    agentId,
    userId,
    sessionId,
    resource: tool:\${toolName},
    action: 'invoke',
    controlId: 'CC6.1',
  }

  if (!permittedTools.has(toolName)) {
    logAccessEvent({ ...baseEvent, outcome: 'denied', denialReason: 'tool not in permitted set' })
    return { error: 'access_denied', tool: toolName }
  }

  logAccessEvent({ ...baseEvent, outcome: 'permitted', denialReason: null })
  return { status: 'ok', tool: toolName }
}`,
        }}
      />

      <h2>ISO 27001 Annex A Controls for AI Agents</h2>

      <ConceptBlock term="ISO 27001:2022 for AI Systems">
        <p>
          ISO 27001:2022 includes Annex A controls covering supplier relationships (A.5.19–A.5.22),
          which directly apply to LLM API providers. New controls in the 2022 update relevant to
          AI include threat intelligence (A.5.7), information security for use of cloud services
          (A.5.23), and data masking (A.8.11). The standard requires you to assess risk, implement
          controls proportionate to that risk, and maintain evidence of effectiveness — all
          documented in a Statement of Applicability (SoA).
        </p>
      </ConceptBlock>

      <SDKExample
        title="ISO 27001 A.5.23: Third-Party LLM API Risk Assessment Template"
        tabs={{
          python: `# This is a configuration data structure, not executable agent code.
# Use it to document LLM API supplier risk as required by ISO 27001 A.5.19/A.5.23.

LLM_SUPPLIER_RISK_ASSESSMENT = {
    "supplier": "Anthropic",
    "service": "Claude API",
    "assessment_date": "2025-01-15",
    "assessor": "security-team@company.com",
    "iso_controls": ["A.5.19", "A.5.20", "A.5.21", "A.5.22", "A.5.23"],

    "risk_items": [
        {
            "risk": "Service unavailability (API outage)",
            "likelihood": "medium",
            "impact": "high",
            "inherent_risk": "high",
            "controls": ["Circuit breaker", "Fallback response", "Multi-provider routing"],
            "residual_risk": "low",
        },
        {
            "risk": "Data transmitted to third-party LLM contains personal data",
            "likelihood": "high",
            "impact": "high",
            "inherent_risk": "critical",
            "controls": [
                "Data Processing Agreement (DPA) signed",
                "PII stripped before API calls where possible",
                "Data processing limited to EU regions",
            ],
            "residual_risk": "medium",
        },
        {
            "risk": "Model produces inaccurate or harmful outputs",
            "likelihood": "medium",
            "impact": "medium",
            "inherent_risk": "medium",
            "controls": [
                "Output filtering and validation",
                "Human review for high-stakes decisions",
                "Output schema enforcement",
            ],
            "residual_risk": "low",
        },
    ],

    "supplier_certifications": ["SOC 2 Type II", "ISO 27001"],
    "dpa_reference": "contracts/anthropic-dpa-2025.pdf",
    "review_frequency": "annual",
    "next_review": "2026-01-15",
}`,
        }}
      />

      <h2>Change Management for AI Agents</h2>

      <SDKExample
        title="Change Control for Agent System Prompt Updates"
        tabs={{
          python: `import hashlib
import json
from datetime import datetime

def record_prompt_change(
    agent_id: str,
    old_prompt: str,
    new_prompt: str,
    changed_by: str,
    change_ticket: str,
    approved_by: str,
    test_results_ref: str,
) -> dict:
    """
    Record a system prompt change with full change management evidence.
    Required for SOC 2 CC8.1 (change management) and ISO 27001 A.8.32.
    """
    return {
        "change_id": f"CHG-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "agent_id": agent_id,
        "change_type": "system_prompt_update",
        "timestamp_utc": datetime.utcnow().isoformat(),
        "changed_by": changed_by,
        "approved_by": approved_by,
        "change_ticket": change_ticket,
        "old_prompt_hash": hashlib.sha256(old_prompt.encode()).hexdigest(),
        "new_prompt_hash": hashlib.sha256(new_prompt.encode()).hexdigest(),
        "test_results_ref": test_results_ref,
        "rollback_available": True,
    }`,
        }}
      />

      <WarningBlock title="Auditors Will Ask for Evidence of Control Effectiveness, Not Just Design">
        <p>
          For SOC 2 Type II and ISO 27001 surveillance audits, it is not enough to describe your
          controls — you must show evidence that they operated effectively over the audit period.
          This means retaining logs of access control denials, change records, security incident
          reports, vulnerability scan results, and training completion records. Configure log
          retention to at least 12 months and ensure logs are tamper-evident (write-once storage
          or cryptographic signing).
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Map Every AI Control to a Framework Control ID">
        <p>
          When implementing security controls for your agent system, annotate each control in
          code with the framework control ID it satisfies (e.g., <code># SOC2: CC6.1</code> or
          <code># ISO27001: A.8.11</code>). This makes it easy to generate evidence reports
          during audits, demonstrates intentional compliance design to auditors, and ensures
          controls are not removed without evaluating their compliance impact.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Leverage Your LLM Provider's Compliance Documentation">
        <p>
          Anthropic, OpenAI, and other major LLM providers publish their SOC 2 reports and
          security documentation. When answering auditor questions about your LLM API supplier
          controls, request Anthropic's SOC 2 Type II report under NDA and include it as
          sub-processor evidence in your own audit pack. This satisfies ISO 27001 A.5.22
          (monitoring and reviewing supplier services) without duplicating the provider's own
          controls in your scope.
        </p>
      </NoteBlock>
    </article>
  )
}
