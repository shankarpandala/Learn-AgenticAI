import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function LeastPrivilege() {
  return (
    <article className="prose-content">
      <h2>Principle of Least Privilege for AI Agents</h2>
      <p>
        The principle of least privilege (PoLP) states that every component of a system should
        have access only to the resources it needs to perform its specific function — nothing more.
        For AI agents, this means restricting the tool set, data scope, API permissions, and
        resource access to the minimum required for the agent's defined task. Because agents can
        be manipulated through prompt injection or model errors, limiting their permissions limits
        the damage any single failure can cause.
      </p>

      <SecurityCallout severity="high" title="Agents with Broad Permissions Amplify Attack Impact">
        An agent granted read/write access to an entire database, full email account access, or
        unrestricted code execution can cause catastrophic damage if manipulated. The blast radius
        of a prompt injection attack scales directly with the permissions granted to the agent.
        Apply PoLP before granting any tool or data access.
      </SecurityCallout>

      <h2>Minimal Tool Sets</h2>

      <ConceptBlock term="Tool Scope Minimisation">
        <p>
          Every tool exposed to an agent is a potential attack vector. Before adding a tool, ask:
          does this agent <em>need</em> this capability to fulfil its defined purpose? A customer
          FAQ agent needs a search tool but not a database write tool. A report generator needs
          read access to data but not network access. Define tool sets per agent role and enforce
          them at the dispatch layer, not merely in the system prompt.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Role-Scoped Tool Sets for Different Agent Types"
        tabs={{
          python: `import anthropic
from dataclasses import dataclass, field
from typing import Any

client = anthropic.Anthropic()

# --- Tool definitions ---

SEARCH_TOOL = {
    "name": "search_knowledge_base",
    "description": "Search the knowledge base for relevant articles.",
    "input_schema": {
        "type": "object",
        "properties": {"query": {"type": "string"}, "top_k": {"type": "integer", "default": 5}},
        "required": ["query"],
    },
}

READ_TICKET_TOOL = {
    "name": "read_ticket",
    "description": "Read the details of a support ticket by ID.",
    "input_schema": {
        "type": "object",
        "properties": {"ticket_id": {"type": "string"}},
        "required": ["ticket_id"],
    },
}

UPDATE_TICKET_TOOL = {
    "name": "update_ticket_status",
    "description": "Update the status of a support ticket.",
    "input_schema": {
        "type": "object",
        "properties": {
            "ticket_id": {"type": "string"},
            "status": {"type": "string", "enum": ["open", "in_progress", "resolved", "escalated"]},
        },
        "required": ["ticket_id", "status"],
    },
}

SEND_EMAIL_TOOL = {
    "name": "send_email",
    "description": "Send an email reply to the customer.",
    "input_schema": {
        "type": "object",
        "properties": {
            "to": {"type": "string"},
            "body": {"type": "string"},
        },
        "required": ["to", "body"],
    },
}

DELETE_TICKET_TOOL = {
    "name": "delete_ticket",
    "description": "Permanently delete a ticket. Admin only.",
    "input_schema": {
        "type": "object",
        "properties": {"ticket_id": {"type": "string"}},
        "required": ["ticket_id"],
    },
}

# --- Role-based tool sets ---
# Each role gets the minimum tools required for its function

ROLE_TOOL_SETS = {
    "faq_bot": [SEARCH_TOOL],  # Read-only, knowledge base only
    "support_tier1": [SEARCH_TOOL, READ_TICKET_TOOL],  # Read tickets, no write
    "support_tier2": [SEARCH_TOOL, READ_TICKET_TOOL, UPDATE_TICKET_TOOL, SEND_EMAIL_TOOL],
    "support_admin": [SEARCH_TOOL, READ_TICKET_TOOL, UPDATE_TICKET_TOOL, SEND_EMAIL_TOOL, DELETE_TICKET_TOOL],
}

@dataclass
class AgentConfig:
    role: str
    system_prompt: str
    tools: list[dict] = field(default_factory=list)

    def __post_init__(self):
        tool_set = ROLE_TOOL_SETS.get(self.role)
        if tool_set is None:
            raise ValueError(f"Unknown role: {self.role}. Must be one of {list(ROLE_TOOL_SETS)}")
        self.tools = tool_set

def run_scoped_agent(config: AgentConfig, user_message: str) -> str:
    """Run an agent with its role-restricted tool set."""
    messages = [{"role": "user", "content": user_message}]

    for _ in range(15):
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=config.system_prompt,
            tools=config.tools,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            return next(b.text for b in response.content if hasattr(b, "text"))

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            results = []
            for block in response.content:
                if block.type == "tool_use":
                    # Dispatch — the tool set is already limited at the API call level
                    output = dispatch_tool(block.name, block.input)
                    results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(output),
                    })
            messages.append({"role": "user", "content": results})

    return "Max iterations reached."

def dispatch_tool(name: str, inputs: dict) -> Any:
    # Real implementations here
    return {"status": "executed", "tool": name}

# Usage
faq_agent = AgentConfig(
    role="faq_bot",
    system_prompt="You answer customer questions using the knowledge base. You cannot modify data.",
)
tier2_agent = AgentConfig(
    role="support_tier2",
    system_prompt="You are a tier-2 support agent. You can read tickets, update their status, and send emails.",
)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SEARCH_TOOL: Anthropic.Tool = {
  name: 'search_knowledge_base',
  description: 'Search the knowledge base.',
  input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
}

const READ_TICKET_TOOL: Anthropic.Tool = {
  name: 'read_ticket',
  description: 'Read a support ticket.',
  input_schema: { type: 'object', properties: { ticket_id: { type: 'string' } }, required: ['ticket_id'] },
}

const UPDATE_TICKET_TOOL: Anthropic.Tool = {
  name: 'update_ticket_status',
  description: 'Update ticket status.',
  input_schema: {
    type: 'object',
    properties: {
      ticket_id: { type: 'string' },
      status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'escalated'] },
    },
    required: ['ticket_id', 'status'],
  },
}

const ROLE_TOOL_SETS: Record<string, Anthropic.Tool[]> = {
  faq_bot: [SEARCH_TOOL],
  support_tier1: [SEARCH_TOOL, READ_TICKET_TOOL],
  support_tier2: [SEARCH_TOOL, READ_TICKET_TOOL, UPDATE_TICKET_TOOL],
}

function getToolsForRole(role: string): Anthropic.Tool[] {
  const tools = ROLE_TOOL_SETS[role]
  if (!tools) throw new Error(Unknown role: \${role})
  return tools
}

async function runScopedAgent(role: string, systemPrompt: string, userMessage: string): Promise<string> {
  const tools = getToolsForRole(role)
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userMessage }]

  for (let i = 0; i < 15; i++) {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      return (response.content[0] as Anthropic.TextBlock).text
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content })
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify({ status: 'ok' }) })
        }
      }
      messages.push({ role: 'user', content: results })
    }
  }
  return 'Max iterations reached.'
}`,
        }}
      />

      <h2>Data Scope Minimisation</h2>

      <ConceptBlock term="Need-to-Know Data Access">
        <p>
          Even within a permitted tool, agents should access only the data relevant to the current
          task. A customer support agent should only see the data for the customer whose ticket
          is being handled — not the entire customer database. Implement row-level security in
          databases, scope API keys to specific resources, and pass only the necessary data into
          the agent's context window.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Scoped Database Access for Per-Customer Agents"
        tabs={{
          python: `import anthropic
from functools import partial

client = anthropic.Anthropic()

def get_orders_for_customer(customer_id: str, order_id: str | None = None) -> list[dict]:
    """
    Data access function scoped to a specific customer.
    The customer_id is bound at agent creation time, not passed by the LLM.
    """
    # In production, query DB with WHERE customer_id = :customer_id
    orders = [{"order_id": "ORD-123", "status": "shipped", "customer_id": customer_id}]
    if order_id:
        orders = [o for o in orders if o["order_id"] == order_id]
    return orders

def create_customer_agent(customer_id: str) -> callable:
    """
    Factory that creates an agent scoped to a single customer.
    The agent can only access data belonging to that customer.
    """
    # Pre-bind customer_id so the LLM cannot override it
    scoped_get_orders = partial(get_orders_for_customer, customer_id=customer_id)

    def run_agent(user_message: str) -> str:
        messages = [{"role": "user", "content": user_message}]
        tools = [
            {
                "name": "get_my_orders",
                "description": "Get orders for the current customer.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "order_id": {"type": "string", "description": "Optional: filter to a specific order"}
                    },
                },
            }
        ]

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=512,
            tools=tools,
            messages=messages,
        )

        # Tool execution uses scoped function — customer_id cannot be changed by LLM
        if response.stop_reason == "tool_use":
            for block in response.content:
                if block.type == "tool_use" and block.name == "get_my_orders":
                    return str(scoped_get_orders(order_id=block.input.get("order_id")))

        return next(b.text for b in response.content if hasattr(b, "text"))

    return run_agent

# Agent is scoped to customer cust-456 — cannot access other customers
agent = create_customer_agent("cust-456")`,
        }}
      />

      <WarningBlock title="System Prompts Alone Do Not Enforce Permissions">
        <p>
          Telling an agent "you can only access customer data for the current session" in the
          system prompt is not a security control — it is a behavioural guideline that a
          sufficiently clever injection can override. Permissions must be enforced in code at
          the tool execution layer, not just in natural language instructions.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Audit Tool Permissions Quarterly">
        <p>
          Tool permissions tend to grow over time as features are added. Schedule a quarterly
          review of every agent's tool set and data access scope. Ask for each tool: is this
          still necessary? Could it be replaced with a more restricted version? Have any
          tools accumulated permissions beyond their original design? Remove or narrow any tool
          whose current scope exceeds current need.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Start Maximally Restricted, Then Expand">
        <p>
          When building a new agent, start with no tools and add them one at a time as you
          validate the need. This "deny by default" approach is far easier to maintain securely
          than starting with broad permissions and trying to remove them later. Document the
          justification for each tool in code comments or a decision log — it will prevent
          unnecessary re-additions during future reviews.
        </p>
      </NoteBlock>
    </article>
  )
}
