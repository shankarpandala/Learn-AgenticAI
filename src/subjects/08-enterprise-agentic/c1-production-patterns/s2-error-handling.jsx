import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function ErrorHandling() {
  return (
    <article className="prose-content">
      <h2>Error Handling in Production Agent Systems</h2>
      <p>
        Agent systems surface a richer error taxonomy than traditional APIs: LLM API errors,
        tool execution failures, malformed model outputs, context window exhaustion, and
        network issues all require different handling strategies. Classifying errors correctly
        lets you retry the right ones, surface the right messages to users, and alert on the
        right signals in production.
      </p>

      <ArchitectureDiagram
        title="Error Classification and Handling Flow"
        width={700}
        height={260}
        nodes={[
          { id: 'error', label: 'Error Occurs', type: 'external', x: 60, y: 130 },
          { id: 'classify', label: 'Classify\nError', type: 'tool', x: 220, y: 130 },
          { id: 'transient', label: 'Transient\n→ Retry', type: 'agent', x: 420, y: 60 },
          { id: 'client', label: 'Client Error\n→ Abort', type: 'tool', x: 420, y: 130 },
          { id: 'logic', label: 'Logic Error\n→ Degrade', type: 'store', x: 420, y: 200 },
          { id: 'alert', label: 'Alert +\nLog', type: 'external', x: 600, y: 130 },
        ]}
        edges={[
          { from: 'error', to: 'classify' },
          { from: 'classify', to: 'transient' },
          { from: 'classify', to: 'client' },
          { from: 'classify', to: 'logic' },
          { from: 'transient', to: 'alert' },
          { from: 'client', to: 'alert' },
          { from: 'logic', to: 'alert' },
        ]}
      />

      <h2>Error Taxonomy</h2>

      <ConceptBlock term="Transient vs. Permanent Errors">
        <p>
          <strong>Transient errors</strong> are temporary and self-heal: rate limits (429),
          service unavailable (503), timeouts, and network blips. Always retry these with
          backoff. <strong>Permanent errors</strong> will not resolve with retries: invalid
          API key (401), request too large (400), model not found (404), or a tool returning
          a domain error (e.g. "account not found"). Retrying permanent errors wastes quota
          and increases user-facing latency.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Classifying and Handling Anthropic API Errors"
        tabs={{
          python: `import anthropic
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class ErrorCategory(Enum):
    TRANSIENT = "transient"       # Retry with backoff
    RATE_LIMITED = "rate_limited" # Retry after Retry-After header
    CLIENT_ERROR = "client"       # Don't retry — fix the request
    AUTH_ERROR = "auth"           # Don't retry — fix credentials
    CONTEXT_OVERFLOW = "context"  # Truncate and retry
    UNKNOWN = "unknown"

@dataclass
class ClassifiedError:
    category: ErrorCategory
    original: Exception
    retry_after: float | None = None  # seconds to wait before retry

def classify_error(error: Exception) -> ClassifiedError:
    if isinstance(error, anthropic.RateLimitError):
        # Parse Retry-After header if present
        retry_after = float(
            getattr(error, "response", {}).headers.get("retry-after", 10)
            if hasattr(error, "response") and error.response else 10
        )
        return ClassifiedError(ErrorCategory.RATE_LIMITED, error, retry_after)

    if isinstance(error, anthropic.APIStatusError):
        code = error.status_code
        if code in (500, 502, 503, 504, 529):
            return ClassifiedError(ErrorCategory.TRANSIENT, error)
        if code == 401:
            return ClassifiedError(ErrorCategory.AUTH_ERROR, error)
        if code == 400:
            # Could be context overflow — check the message
            if "context" in str(error).lower() or "token" in str(error).lower():
                return ClassifiedError(ErrorCategory.CONTEXT_OVERFLOW, error)
            return ClassifiedError(ErrorCategory.CLIENT_ERROR, error)
        return ClassifiedError(ErrorCategory.CLIENT_ERROR, error)

    if isinstance(error, (anthropic.APIConnectionError, anthropic.APITimeoutError)):
        return ClassifiedError(ErrorCategory.TRANSIENT, error)

    return ClassifiedError(ErrorCategory.UNKNOWN, error)

# --- Error handling in agent loop ---
import time

def call_llm_with_classification(messages: list, **kwargs) -> anthropic.types.Message:
    client = anthropic.Anthropic()
    max_retries = 4
    for attempt in range(max_retries):
        try:
            return client.messages.create(
                model="claude-opus-4-5",
                max_tokens=2048,
                messages=messages,
                **kwargs,
            )
        except Exception as e:
            classified = classify_error(e)
            logger.error(
                "LLM call failed (attempt %d/%d): category=%s error=%s",
                attempt + 1, max_retries, classified.category.value, e
            )

            if classified.category == ErrorCategory.AUTH_ERROR:
                raise  # Fatal — don't retry

            if classified.category == ErrorCategory.CLIENT_ERROR:
                raise  # Not retryable

            if classified.category == ErrorCategory.CONTEXT_OVERFLOW:
                # Truncate messages and retry once
                messages = truncate_messages(messages)
                continue

            if classified.category == ErrorCategory.RATE_LIMITED:
                wait = classified.retry_after or (2 ** attempt)
                time.sleep(wait)
                continue

            if classified.category in (ErrorCategory.TRANSIENT, ErrorCategory.UNKNOWN):
                time.sleep(2 ** attempt)
                continue

    raise RuntimeError(f"LLM call failed after {max_retries} attempts")

def truncate_messages(messages: list, keep_last: int = 10) -> list:
    """Keep system context and most recent messages to fit context window."""
    if len(messages) <= keep_last:
        return messages
    # Always keep first (usually system context) and last N turns
    return [messages[0]] + messages[-(keep_last - 1):]`,
        }}
      />

      <h2>Tool Failure Handling</h2>

      <ConceptBlock term="Tool Error Contracts">
        <p>
          Tool failures should be communicated back to the agent in structured form so the
          agent can reason about them and decide what to do next — retry, use a fallback tool,
          or inform the user. Never let a tool exception propagate unhandled through the agent
          loop; always catch and return a typed error result.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Structured Tool Error Responses"
        tabs={{
          python: `import anthropic
import traceback
from typing import Any

client = anthropic.Anthropic()

# Tool implementations (may raise)
def search_database(query: str) -> dict:
    raise ConnectionError("Database connection pool exhausted")

def send_email(to: str, subject: str, body: str) -> dict:
    return {"sent": True, "message_id": "msg-123"}

TOOL_REGISTRY = {
    "search_database": search_database,
    "send_email": send_email,
}

def safe_execute_tool(tool_name: str, tool_input: dict) -> dict:
    """
    Execute a tool and return a structured result that the agent can reason about.
    Never let raw exceptions escape to the agent loop.
    """
    if tool_name not in TOOL_REGISTRY:
        return {
            "error": True,
            "error_type": "tool_not_found",
            "message": f"Tool '{tool_name}' is not available.",
        }

    try:
        result = TOOL_REGISTRY[tool_name](**tool_input)
        return {"error": False, "result": result}
    except ConnectionError as e:
        return {
            "error": True,
            "error_type": "connectivity",
            "message": f"The {tool_name} tool is temporarily unavailable: {e}. "
                       "Please inform the user and suggest they retry in a moment.",
            "retryable": True,
        }
    except ValueError as e:
        return {
            "error": True,
            "error_type": "invalid_input",
            "message": f"Invalid input for {tool_name}: {e}",
            "retryable": False,
        }
    except Exception as e:
        # Log the full traceback internally, return a sanitised message
        traceback.print_exc()
        return {
            "error": True,
            "error_type": "unexpected",
            "message": f"An unexpected error occurred in {tool_name}. "
                       "The engineering team has been notified.",
            "retryable": False,
        }

tools = [
    {
        "name": "search_database",
        "description": "Search the product database for information.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
    {
        "name": "send_email",
        "description": "Send an email to a recipient.",
        "input_schema": {
            "type": "object",
            "properties": {
                "to": {"type": "string"},
                "subject": {"type": "string"},
                "body": {"type": "string"},
            },
            "required": ["to", "subject", "body"],
        },
    },
]

def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]
    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=2048,
            tools=tools,
            messages=messages,
        )
        if response.stop_reason == "end_turn":
            return next(b.text for b in response.content if hasattr(b, "text"))

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            results = []
            for block in response.content:
                if block.type == "tool_use":
                    outcome = safe_execute_tool(block.name, block.input)
                    results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(outcome),
                    })
            messages.append({"role": "user", "content": results})`,
        }}
      />

      <h2>Handling Malformed Model Outputs</h2>

      <PatternBlock
        name="Output Validation and Self-Correction"
        category="Error Recovery"
        whenToUse="When agents are expected to return structured data (JSON, XML, code) and a malformed response would cause downstream failures."
      >
        <p>
          LLMs occasionally produce malformed JSON, truncated outputs, or responses that
          don't match the expected schema. Use output parsing with schema validation. On
          failure, inject the parse error back into the conversation and ask the model to
          correct its output — this self-correction loop succeeds in the majority of cases.
        </p>
      </PatternBlock>

      <SDKExample
        title="Output Validation with Self-Correction Loop"
        tabs={{
          python: `import anthropic
import json
from pydantic import BaseModel, ValidationError

client = anthropic.Anthropic()

class TaskPlan(BaseModel):
    steps: list[str]
    estimated_minutes: int
    requires_human_review: bool

SYSTEM_PROMPT = """You are a task planning assistant.
Always respond with valid JSON matching this schema:
{
  "steps": ["step 1", "step 2", ...],
  "estimated_minutes": <integer>,
  "requires_human_review": <boolean>
}"""

def get_task_plan(task_description: str, max_correction_attempts: int = 2) -> TaskPlan:
    messages = [{"role": "user", "content": task_description}]

    for attempt in range(max_correction_attempts + 1):
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        raw = response.content[0].text.strip()

        # Strip markdown code fences if present
        if raw.startswith(""):
            raw = raw.split("\\n", 1)[-1].rsplit("", 1)[0].strip()

        try:
            data = json.loads(raw)
            return TaskPlan(**data)
        except (json.JSONDecodeError, ValidationError) as parse_err:
            if attempt == max_correction_attempts:
                raise ValueError(
                    f"Model failed to produce valid output after "
                    f"{max_correction_attempts + 1} attempts: {parse_err}"
                )

            # Self-correction: feed the error back to the model
            messages.append({"role": "assistant", "content": raw})
            messages.append({
                "role": "user",
                "content": (
                    f"Your response was not valid JSON or did not match the schema. "
                    f"Error: {parse_err}\\n"
                    f"Please respond again with only valid JSON."
                ),
            })`,
        }}
      />

      <BestPracticeBlock title="Never Surface Internal Errors to Users">
        <p>
          Raw exception messages often contain sensitive information: stack traces, database
          connection strings, API keys in environment variable names, and internal service
          URLs. Always catch exceptions at the agent boundary, log the full error internally
          with a correlation ID, and return a generic user-facing message with that correlation
          ID so support teams can trace the failure without exposing internals.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Context Window Overflow Strategy">
        <p>
          When an agent conversation grows too long, don't simply truncate the middle —
          that removes tool results the model needs to continue. Instead, summarise older
          turns into a compact "progress so far" block and append it as a system message,
          then keep only the most recent full turns. This preserves the agent's understanding
          of what has already been accomplished.
        </p>
      </NoteBlock>
    </article>
  )
}
