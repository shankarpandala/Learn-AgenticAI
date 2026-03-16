import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function RbacAbac() {
  return (
    <article className="prose-content">
      <h2>RBAC and ABAC for AI Agent Systems</h2>
      <p>
        As AI agent deployments grow, ad-hoc permission checks scattered through tool code become
        unmanageable. Formal access control models — Role-Based Access Control (RBAC) and
        Attribute-Based Access Control (ABAC) — provide structured, auditable frameworks for
        deciding which agents can invoke which tools on which data under what conditions.
        Implementing one of these models early makes it far easier to enforce least privilege,
        generate compliance evidence, and reason about the blast radius of a security incident.
      </p>

      <h2>Role-Based Access Control (RBAC)</h2>

      <ConceptBlock term="RBAC for Agents">
        <p>
          In RBAC, permissions are assigned to roles, and agents (like users) are assigned to
          roles. An agent inherits all permissions of its assigned roles. RBAC is simple to
          understand, easy to audit, and works well when agent types map cleanly to a fixed set
          of job functions: <em>faq-bot</em>, <em>support-tier1</em>, <em>analyst</em>,
          <em>admin</em>. The downside is that roles can become too coarse for fine-grained
          decisions (e.g., "can access data only for customer X").
        </p>
      </ConceptBlock>

      <SDKExample
        title="RBAC Permission Enforcement for Agent Tool Calls"
        tabs={{
          python: `from __future__ import annotations
import anthropic
from dataclasses import dataclass, field
from typing import Any

client = anthropic.Anthropic()

# --- RBAC model ---

@dataclass
class Permission:
    resource: str   # e.g. "ticket", "customer_record", "email"
    action: str     # e.g. "read", "write", "delete", "send"

    def __hash__(self):
        return hash((self.resource, self.action))

ROLE_PERMISSIONS: dict[str, set[Permission]] = {
    "faq_bot": {
        Permission("knowledge_base", "read"),
    },
    "support_tier1": {
        Permission("knowledge_base", "read"),
        Permission("ticket", "read"),
    },
    "support_tier2": {
        Permission("knowledge_base", "read"),
        Permission("ticket", "read"),
        Permission("ticket", "write"),
        Permission("email", "send"),
    },
    "support_admin": {
        Permission("knowledge_base", "read"),
        Permission("knowledge_base", "write"),
        Permission("ticket", "read"),
        Permission("ticket", "write"),
        Permission("ticket", "delete"),
        Permission("email", "send"),
        Permission("customer_record", "read"),
        Permission("customer_record", "write"),
    },
}

# Map tools to the permission they require
TOOL_PERMISSION_MAP: dict[str, Permission] = {
    "search_knowledge_base": Permission("knowledge_base", "read"),
    "read_ticket": Permission("ticket", "read"),
    "update_ticket": Permission("ticket", "write"),
    "delete_ticket": Permission("ticket", "delete"),
    "send_email": Permission("email", "send"),
    "read_customer": Permission("customer_record", "read"),
    "update_customer": Permission("customer_record", "write"),
}

@dataclass
class AgentIdentity:
    agent_id: str
    roles: list[str]

    @property
    def permissions(self) -> set[Permission]:
        perms: set[Permission] = set()
        for role in self.roles:
            perms.update(ROLE_PERMISSIONS.get(role, set()))
        return perms

    def can_use_tool(self, tool_name: str) -> bool:
        required = TOOL_PERMISSION_MAP.get(tool_name)
        if required is None:
            return False  # Unknown tools are denied
        return required in self.permissions

def rbac_tool_dispatch(
    agent: AgentIdentity,
    tool_name: str,
    tool_input: dict[str, Any],
) -> dict[str, Any]:
    """Execute a tool only if the agent has the required permission."""
    if not agent.can_use_tool(tool_name):
        required = TOOL_PERMISSION_MAP.get(tool_name)
        return {
            "error": "permission_denied",
            "tool": tool_name,
            "required_permission": str(required) if required else "unknown",
            "agent_roles": agent.roles,
        }

    # Safe to execute
    return execute_tool(tool_name, tool_input)

def execute_tool(name: str, inputs: dict) -> dict:
    return {"status": "ok", "tool": name}  # Real implementation

# Example
tier1_agent = AgentIdentity(agent_id="agent-001", roles=["support_tier1"])
print(tier1_agent.can_use_tool("read_ticket"))   # True
print(tier1_agent.can_use_tool("delete_ticket")) # False`,
          typescript: `import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface Permission {
  resource: string
  action: string
}

function permKey(p: Permission) {
  return \${p.resource}:\${p.action}
}

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  faq_bot: [{ resource: 'knowledge_base', action: 'read' }],
  support_tier1: [
    { resource: 'knowledge_base', action: 'read' },
    { resource: 'ticket', action: 'read' },
  ],
  support_tier2: [
    { resource: 'knowledge_base', action: 'read' },
    { resource: 'ticket', action: 'read' },
    { resource: 'ticket', action: 'write' },
    { resource: 'email', action: 'send' },
  ],
}

const TOOL_PERMISSION_MAP: Record<string, Permission> = {
  search_knowledge_base: { resource: 'knowledge_base', action: 'read' },
  read_ticket: { resource: 'ticket', action: 'read' },
  update_ticket: { resource: 'ticket', action: 'write' },
  send_email: { resource: 'email', action: 'send' },
}

interface AgentIdentity {
  agentId: string
  roles: string[]
}

function getPermissions(identity: AgentIdentity): Set<string> {
  const perms = new Set<string>()
  for (const role of identity.roles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) {
      perms.add(permKey(p))
    }
  }
  return perms
}

function canUseTool(identity: AgentIdentity, toolName: string): boolean {
  const required = TOOL_PERMISSION_MAP[toolName]
  if (!required) return false
  return getPermissions(identity).has(permKey(required))
}

function rbacDispatch(
  agent: AgentIdentity,
  toolName: string,
  toolInput: Record<string, unknown>
): Record<string, unknown> {
  if (!canUseTool(agent, toolName)) {
    return { error: 'permission_denied', tool: toolName, agentRoles: agent.roles }
  }
  return { status: 'ok', tool: toolName }
}`,
        }}
      />

      <h2>Attribute-Based Access Control (ABAC)</h2>

      <ConceptBlock term="ABAC for Fine-Grained Agent Access">
        <p>
          ABAC evaluates access decisions based on attributes of the agent (its role, clearance
          level, department), the resource (its owner, classification, region), the action, and
          the environment (time of day, request context). ABAC can express policies that RBAC
          cannot: "allow access to ticket data only if the ticket's customer_id matches the
          agent's assigned customer_id" or "allow PII access only during business hours."
        </p>
      </ConceptBlock>

      <SDKExample
        title="ABAC Policy Evaluation for Agent Data Access"
        tabs={{
          python: `from dataclasses import dataclass
from datetime import datetime, time as dtime
from typing import Any

@dataclass
class AccessRequest:
    agent_id: str
    agent_roles: list[str]
    agent_customer_id: str | None  # Customer the agent is serving
    resource_type: str
    resource_owner_id: str | None
    resource_classification: str  # "public", "internal", "confidential", "restricted"
    action: str
    environment: dict[str, Any] = None

def evaluate_abac_policy(req: AccessRequest) -> tuple[bool, str]:
    """
    Evaluate ABAC policies. Returns (permitted, reason).
    Policies are checked in order; first matching DENY wins over PERMIT.
    """
    # Policy 1: Admin role can access anything classified up to "confidential"
    if "support_admin" in req.agent_roles:
        if req.resource_classification in {"public", "internal", "confidential"}:
            return True, "admin role permit"

    # Policy 2: Agents can only read resources owned by their assigned customer
    if req.action == "read" and req.resource_type == "ticket":
        if req.agent_customer_id and req.resource_owner_id == req.agent_customer_id:
            if req.resource_classification in {"public", "internal"}:
                return True, "customer-scoped read permit"
        return False, "ticket access denied: customer_id mismatch or classification too high"

    # Policy 3: PII access only during business hours (UTC)
    if req.resource_classification == "restricted":
        now = datetime.utcnow().time()
        business_start = dtime(8, 0)
        business_end = dtime(18, 0)
        if not (business_start <= now <= business_end):
            return False, "restricted data access denied outside business hours"

    # Default deny
    return False, "no matching permit policy"

# Usage
request = AccessRequest(
    agent_id="agent-001",
    agent_roles=["support_tier2"],
    agent_customer_id="cust-456",
    resource_type="ticket",
    resource_owner_id="cust-456",
    resource_classification="internal",
    action="read",
)
permitted, reason = evaluate_abac_policy(request)
print(f"Access {'GRANTED' if permitted else 'DENIED'}: {reason}")`,
        }}
      />

      <WarningBlock title="Centralise Policy Evaluation — Never Scatter It in Tool Code">
        <p>
          Access control logic spread across dozens of tool implementations is impossible to
          audit and easy to miss during reviews. Centralise all permission checks in a single
          <code>AccessControlService</code> or policy engine (OPA, Cedar) that all tools call
          before executing. This ensures consistent enforcement, simplifies policy updates, and
          produces a single audit trail for access decisions.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Assign Agent Identities, Not Human User Identities">
        <p>
          Agents should have their own distinct service identities (e.g., service accounts,
          OAuth client credentials) separate from any human user whose session triggered the
          agent. This allows you to grant, revoke, and audit agent permissions independently of
          user permissions, and prevents an agent from inheriting a user's elevated privileges
          when operating autonomously.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Consider Open Policy Agent (OPA) for Complex Policies">
        <p>
          For complex multi-condition policies, consider using Open Policy Agent (OPA) or AWS
          Cedar as a dedicated policy engine. Define policies in Rego (OPA) or Cedar policy
          language, and call the engine's API from your agent's tool dispatcher. This separates
          policy definition from application code, enables non-engineers to review policies,
          and supports policy-as-code workflows with version control and CI/CD.
        </p>
      </NoteBlock>
    </article>
  )
}
