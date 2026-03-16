import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function InputValidation() {
  return (
    <article className="prose-content">
      <h2>Input Validation for AI Agents</h2>
      <p>
        Every piece of data that enters an agent system — user messages, tool outputs, retrieved
        documents, API responses, inter-agent payloads — is a potential attack surface. Robust
        input validation is the first line of defence: it rejects malformed data before it ever
        reaches the LLM, prevents prompt injection strings from being treated as instructions,
        and ensures tool parameters stay within safe bounds. Validation must happen at every
        trust boundary, not just at the outermost API endpoint.
      </p>

      <h2>Schema Validation with Pydantic and Zod</h2>

      <ConceptBlock term="Structural Input Validation">
        <p>
          Schema validation enforces the expected shape, types, and value ranges of input data.
          For agent tool inputs this means every parameter must match its declared JSON schema
          before execution. Use Pydantic (Python) or Zod (TypeScript) to define models that serve
          as both documentation and enforcement. A validation failure at this layer is far cheaper
          than an agent executing a tool with a malicious or malformed parameter.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Pydantic Schema Validation for Tool Inputs"
        tabs={{
          python: `from pydantic import BaseModel, Field, validator, root_validator
import re
import anthropic

client = anthropic.Anthropic()

# --- Tool input models ---

class SearchInput(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    top_k: int = Field(default=5, ge=1, le=20)
    filters: dict = Field(default_factory=dict)

    @validator("query")
    def no_injection_markers(cls, v):
        blocked = ["<system>", "</system>", "[INST]", "ignore previous"]
        for marker in blocked:
            if marker.lower() in v.lower():
                raise ValueError(f"Query contains blocked content: {marker}")
        return v

    @validator("filters")
    def safe_filter_keys(cls, v):
        allowed_keys = {"category", "date_from", "date_to", "language"}
        bad = set(v.keys()) - allowed_keys
        if bad:
            raise ValueError(f"Unsupported filter keys: {bad}")
        return v


class SendEmailInput(BaseModel):
    to: str = Field(..., description="Recipient email address")
    subject: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=10_000)

    @validator("to")
    def valid_email(cls, v):
        pattern = r"^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError(f"Invalid email address: {v}")
        # Block sending to external domains in this example
        allowed_domains = {"company.com", "partner.org"}
        domain = v.split("@")[1].lower()
        if domain not in allowed_domains:
            raise ValueError(f"Sending to {domain} not permitted")
        return v.lower()

# --- Tool dispatcher with validation ---

TOOL_MODELS = {
    "search_documents": SearchInput,
    "send_email": SendEmailInput,
}

def dispatch_tool(tool_name: str, raw_input: dict) -> dict:
    """Validate and execute a tool call."""
    model_cls = TOOL_MODELS.get(tool_name)
    if model_cls is None:
        return {"error": f"Unknown tool: {tool_name}"}

    try:
        validated = model_cls(**raw_input)
    except Exception as e:
        # Return validation error to the LLM so it can self-correct
        return {"validation_error": str(e), "hint": "Please fix the input and retry."}

    # Execute with validated inputs
    if tool_name == "search_documents":
        return search_documents(validated.query, validated.top_k, validated.filters)
    elif tool_name == "send_email":
        return send_email(validated.to, validated.subject, validated.body)

def search_documents(query: str, top_k: int, filters: dict) -> dict:
    return {"results": [], "query": query}  # Real implementation here

def send_email(to: str, subject: str, body: str) -> dict:
    return {"sent": True, "to": to}  # Real implementation here`,
          typescript: `import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// --- Tool input schemas ---

const SearchInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(500)
    .refine(
      (q) => !['<system>', '[INST]', 'ignore previous'].some((m) => q.toLowerCase().includes(m)),
      { message: 'Query contains blocked content' }
    ),
  top_k: z.number().int().min(1).max(20).default(5),
  filters: z
    .record(z.string())
    .refine((f) => Object.keys(f).every((k) => ['category', 'date_from', 'language'].includes(k)), {
      message: 'Unsupported filter keys',
    })
    .default({}),
})

const SendEmailInputSchema = z.object({
  to: z
    .string()
    .email()
    .refine((e) => ['company.com', 'partner.org'].includes(e.split('@')[1]), {
      message: 'Recipient domain not permitted',
    }),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10_000),
})

type SearchInput = z.infer<typeof SearchInputSchema>
type SendEmailInput = z.infer<typeof SendEmailInputSchema>

const TOOL_SCHEMAS: Record<string, z.ZodSchema> = {
  search_documents: SearchInputSchema,
  send_email: SendEmailInputSchema,
}

function dispatchTool(toolName: string, rawInput: unknown): Record<string, unknown> {
  const schema = TOOL_SCHEMAS[toolName]
  if (!schema) return { error: Unknown tool: \${toolName} }

  const result = schema.safeParse(rawInput)
  if (!result.success) {
    return {
      validation_error: result.error.issues.map((i) => i.message).join('; '),
      hint: 'Please fix the input and retry.',
    }
  }

  // Execute with validated data
  if (toolName === 'search_documents') {
    const input = result.data as SearchInput
    return { results: [], query: input.query }
  }
  if (toolName === 'send_email') {
    const input = result.data as SendEmailInput
    return { sent: true, to: input.to }
  }
  return { error: 'Unhandled tool' }
}`,
        }}
      />

      <h2>Allowlisting vs. Denylisting</h2>

      <ConceptBlock term="Allowlist-First Validation">
        <p>
          Denylists (blocking known bad patterns) are inherently incomplete — an attacker needs
          only to find one variant not on the list. Allowlists (permitting only known good patterns)
          are far stronger: anything not explicitly permitted is rejected. Apply allowlisting at
          every validation layer: permitted tool names, permitted parameter keys, permitted value
          formats (regex patterns, enumerated values), and permitted output schemas.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Allowlist-Based Tool Name and Parameter Validation"
        tabs={{
          python: `# Allowlist-based validation layer
from typing import Any

ALLOWED_TOOLS = frozenset({"search_documents", "send_email", "read_file", "write_file"})

ALLOWED_FILE_EXTENSIONS = frozenset({
    ".txt", ".md", ".json", ".csv", ".yaml", ".yml"
})

def validate_tool_call(tool_name: str, tool_input: dict[str, Any]) -> tuple[bool, str]:
    """
    Returns (is_valid, error_message).
    Validates tool name against allowlist and applies per-tool parameter rules.
    """
    # 1. Tool name allowlist
    if tool_name not in ALLOWED_TOOLS:
        return False, f"Tool '{tool_name}' is not in the permitted tools list"

    # 2. Parameter key allowlist per tool
    allowed_params = {
        "search_documents": {"query", "top_k", "filters"},
        "send_email": {"to", "subject", "body"},
        "read_file": {"path"},
        "write_file": {"path", "content"},
    }
    permitted_keys = allowed_params.get(tool_name, set())
    unexpected_keys = set(tool_input.keys()) - permitted_keys
    if unexpected_keys:
        return False, f"Unexpected parameters: {unexpected_keys}"

    # 3. File path safety for file tools
    if tool_name in {"read_file", "write_file"}:
        path = tool_input.get("path", "")
        import os
        ext = os.path.splitext(path)[1].lower()
        if ext not in ALLOWED_FILE_EXTENSIONS:
            return False, f"File extension '{ext}' not permitted"
        if ".." in path or path.startswith("/"):
            return False, "Absolute paths and path traversal not permitted"

    return True, ""`,
        }}
      />

      <WarningBlock title="Validate at Every Trust Boundary, Not Just the Edge">
        <p>
          It is tempting to validate only at the user-facing API gateway. But in agentic systems,
          tool outputs re-enter the context window and can carry injected content. Retrieved
          documents, API responses, and messages from other agents must all pass through validation
          appropriate to their trust level. Define trust zones (system, agent, user, external) and
          apply stricter validation for lower-trust zones.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Return Validation Errors to the LLM for Self-Correction">
        <p>
          When a tool call fails validation, return a structured error message to the LLM rather
          than raising an exception. Include the specific validation failure and a hint for how to
          fix it. Well-structured validation errors allow capable models to self-correct their
          tool calls without human intervention, while still preventing execution of the invalid
          input. Log every validation failure for security monitoring — repeated failures against
          the same tool can indicate a probing attack.
        </p>
      </BestPracticeBlock>

      <SecurityCallout severity="medium" title="Don't Trust LLM-Generated Tool Inputs Without Validation">
        Even when the LLM is your own agent, treat its tool call parameters as untrusted. The model
        can be manipulated via prompt injection to generate malicious tool inputs. Schema validation
        before execution is a non-negotiable control that costs almost nothing in latency but
        prevents entire categories of attack.
      </SecurityCallout>

      <NoteBlock type="tip" title="Use JSON Schema for Cross-Language Validation">
        <p>
          Anthropic's tool use API already requires you to define a JSON schema for each tool's
          input. Reuse that same schema as the authoritative specification for validation — in
          Python via <code>jsonschema</code> or Pydantic, in TypeScript via Zod. Keeping the
          schema in one place ensures the LLM's understanding of valid inputs and your validation
          layer stay in sync as tools evolve.
        </p>
      </NoteBlock>
    </article>
  )
}
