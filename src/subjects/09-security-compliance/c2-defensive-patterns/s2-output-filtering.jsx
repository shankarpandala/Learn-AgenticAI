import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function OutputFiltering() {
  return (
    <article className="prose-content">
      <h2>Output Filtering for AI Agents</h2>
      <p>
        While input validation prevents malicious data from entering the agent, output filtering
        prevents sensitive data from leaving it. Agent outputs can inadvertently contain personally
        identifiable information (PII) extracted from documents, secrets echoed back from context,
        policy-violating content, or data that belongs to a different user. Output filtering
        intercepts the agent's response before it reaches the caller and applies redaction,
        replacement, or blocking as appropriate.
      </p>

      <h2>PII Detection and Redaction</h2>

      <SecurityCallout severity="high" title="LLM Outputs Can Leak PII from Context">
        When an agent processes documents containing PII — customer records, medical notes,
        financial data — the LLM may reproduce that PII verbatim in its response, even when
        not asked to. Output filtering must scan every agent response for PII patterns before
        delivery, especially for agents that handle regulated data categories.
      </SecurityCallout>

      <ConceptBlock term="PII Output Filter">
        <p>
          PII output filters scan agent responses for patterns matching sensitive data: email
          addresses, phone numbers, Social Security Numbers, credit card numbers, passport numbers,
          dates of birth, and named individuals. Detected items are either redacted (replaced with
          a placeholder), blocked (response suppressed), or flagged for human review depending on
          data classification policies. Libraries like Microsoft Presidio, spaCy NER, and AWS
          Comprehend Medical provide production-ready PII detection.
        </p>
      </ConceptBlock>

      <SDKExample
        title="PII Detection and Redaction in Agent Outputs"
        tabs={{
          python: `import re
import anthropic
from dataclasses import dataclass

client = anthropic.Anthropic()

@dataclass
class PIIMatch:
    pii_type: str
    value: str
    start: int
    end: int

# Regex-based PII patterns (use Presidio for production)
PII_PATTERNS = {
    "EMAIL": re.compile(r"[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"),
    "PHONE_US": re.compile(r"\\b(\\+1[\\s\\-]?)?\\(?[0-9]{3}\\)?[\\s\\-]?[0-9]{3}[\\s\\-]?[0-9]{4}\\b"),
    "SSN": re.compile(r"\\b[0-9]{3}[\\-\\s]?[0-9]{2}[\\-\\s]?[0-9]{4}\\b"),
    "CREDIT_CARD": re.compile(r"\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\\b"),
    "IP_ADDRESS": re.compile(r"\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b"),
}

def detect_pii(text: str) -> list[PIIMatch]:
    """Detect PII in text using regex patterns."""
    matches = []
    for pii_type, pattern in PII_PATTERNS.items():
        for m in pattern.finditer(text):
            matches.append(PIIMatch(pii_type, m.group(), m.start(), m.end()))
    # Sort by position (reverse) so replacements don't shift offsets
    return sorted(matches, key=lambda x: x.start, reverse=True)

def redact_pii(text: str) -> tuple[str, list[PIIMatch]]:
    """
    Replace detected PII with labelled placeholders.
    Returns (redacted_text, list_of_detections).
    """
    matches = detect_pii(text)
    result = text
    for match in matches:
        placeholder = f"[{match.pii_type}_REDACTED]"
        result = result[: match.start] + placeholder + result[match.end :]
    return result, matches

def agent_with_output_filter(user_message: str) -> dict:
    """Run agent and apply PII redaction to the output."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": user_message}],
    )
    raw_output = response.content[0].text
    filtered_output, pii_found = redact_pii(raw_output)

    if pii_found:
        import logging
        logging.warning(
            "PII detected in agent output: %s types found",
            [m.pii_type for m in pii_found],
        )

    return {
        "response": filtered_output,
        "pii_redacted": len(pii_found) > 0,
        "pii_count": len(pii_found),
    }`,
          typescript: `import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface PIIMatch {
  type: string
  value: string
  start: number
  end: number
}

const PII_PATTERNS: Record<string, RegExp> = {
  EMAIL: /[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/g,
  PHONE_US: /\\b(\\+1[\\s\\-]?)?\\(?[0-9]{3}\\)?[\\s\\-]?[0-9]{3}[\\s\\-]?[0-9]{4}\\b/g,
  SSN: /\\b[0-9]{3}[\\-\\s]?[0-9]{2}[\\-\\s]?[0-9]{4}\\b/g,
  CREDIT_CARD: /\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\\b/g,
}

function detectPII(text: string): PIIMatch[] {
  const matches: PIIMatch[] = []
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const regex = new RegExp(pattern.source, 'g')
    let match
    while ((match = regex.exec(text)) !== null) {
      matches.push({ type, value: match[0], start: match.index, end: match.index + match[0].length })
    }
  }
  return matches.sort((a, b) => b.start - a.start)
}

function redactPII(text: string): { redacted: string; matches: PIIMatch[] } {
  const matches = detectPII(text)
  let result = text
  for (const match of matches) {
    result = result.slice(0, match.start) + [\${match.type}_REDACTED] + result.slice(match.end)
  }
  return { redacted: result, matches }
}

async function agentWithOutputFilter(userMessage: string) {
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userMessage }],
  })

  const rawOutput = (response.content[0] as Anthropic.TextBlock).text
  const { redacted, matches } = redactPII(rawOutput)

  if (matches.length > 0) {
    console.warn('PII detected in agent output:', matches.map((m) => m.type))
  }

  return { response: redacted, piiRedacted: matches.length > 0, piiCount: matches.length }
}`,
        }}
      />

      <h2>Content Policy Enforcement</h2>

      <ConceptBlock term="Output Content Policy">
        <p>
          Beyond PII, agent outputs must comply with your application's content policy: no hate
          speech, no harmful instructions, no competitor mentions (for some deployments), no
          legal advice (for non-legal agents), and no confidential internal data. Define a content
          policy as a machine-readable set of rules and enforce it programmatically rather than
          relying solely on the model's training.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Content Policy Check Using a Secondary LLM Call"
        tabs={{
          python: `import anthropic
import json

client = anthropic.Anthropic()

CONTENT_POLICY_PROMPT = """
You are a content policy checker. Evaluate whether the following text violates any of these policies:
1. Contains explicit harmful instructions (weapons, self-harm, illegal activities)
2. Contains hate speech or discrimination
3. Reveals confidential system information (API keys, internal URLs, database schemas)
4. Provides medical/legal/financial advice without appropriate disclaimers

Respond with JSON only:
{"violation": true/false, "category": "category_name_or_null", "confidence": 0.0-1.0}

Text to evaluate:
"""

def check_content_policy(agent_output: str) -> dict:
    """Use a secondary LLM call to check content policy compliance."""
    response = client.messages.create(
        model="claude-haiku-4-5",  # Use a fast, cheap model for the check
        max_tokens=128,
        messages=[
            {
                "role": "user",
                "content": CONTENT_POLICY_PROMPT + agent_output[:2000],  # Truncate for efficiency
            }
        ],
    )
    try:
        return json.loads(response.content[0].text)
    except json.JSONDecodeError:
        return {"violation": False, "category": None, "confidence": 0.0}

def filtered_agent_response(user_message: str) -> str:
    """Generate and filter an agent response."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": user_message}],
    )
    output = response.content[0].text

    policy_result = check_content_policy(output)
    if policy_result.get("violation") and policy_result.get("confidence", 0) > 0.8:
        category = policy_result.get("category", "unknown")
        return (
            f"I'm unable to provide that response due to content policy ({category}). "
            "Please rephrase your request."
        )

    return output`,
        }}
      />

      <h2>Output Schema Enforcement</h2>

      <SDKExample
        title="Enforcing Structured Output Schemas"
        tabs={{
          python: `import anthropic
import json
from pydantic import BaseModel, ValidationError
from typing import Optional

client = anthropic.Anthropic()

class AgentResponse(BaseModel):
    """Expected output schema for a customer support agent."""
    answer: str
    confidence: float  # 0.0 - 1.0
    sources: list[str] = []
    requires_escalation: bool = False
    escalation_reason: Optional[str] = None

def get_structured_response(user_message: str) -> AgentResponse:
    """Get an agent response validated against a Pydantic schema."""
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=(
            "You are a customer support agent. Always respond with valid JSON matching this schema: "
            '{"answer": "string", "confidence": 0.0-1.0, "sources": ["list"], '
            '"requires_escalation": false, "escalation_reason": null}'
        ),
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text
    # Strip markdown code fences if present
    raw = raw.strip().lstrip("json").lstrip("").rstrip("").strip()

    try:
        data = json.loads(raw)
        return AgentResponse(**data)
    except (json.JSONDecodeError, ValidationError) as e:
        # Fallback: return a safe default response
        return AgentResponse(
            answer="I was unable to process your request. Please try again.",
            confidence=0.0,
            requires_escalation=True,
            escalation_reason=f"Output schema validation failed: {e}",
        )`,
        }}
      />

      <WarningBlock title="Regex Alone Is Not Enough for PII Detection">
        <p>
          Regex patterns catch structured PII (SSNs, phone numbers, credit cards) reliably, but
          unstructured PII — full names, addresses, freeform medical information — requires NER
          models or specialised services. For regulated data (HIPAA, GDPR, PCI DSS), use a
          production-grade solution like Microsoft Presidio, AWS Comprehend, or Google DLP
          rather than hand-rolled regex patterns.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Log Filtered Outputs for Security Monitoring">
        <p>
          Every time the output filter redacts PII, blocks a content policy violation, or rejects
          a schema mismatch, log the event with enough context to investigate: session ID, user ID,
          filter category, and a hash of the raw output (not the raw text itself). Aggregate
          these logs in your SIEM or observability platform. Spikes in filter activations can
          indicate model drift, prompt injection campaigns, or misconfigured system prompts.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Output Filtering Complements, Not Replaces, Model Safety">
        <p>
          Claude and other frontier models have extensive built-in safety training that prevents
          most harmful outputs. Output filtering adds a deterministic, auditable layer on top of
          probabilistic model safety. This defence-in-depth approach satisfies compliance
          requirements that demand demonstrable, code-level controls independent of model
          behaviour — because "the model doesn't do that" is not an auditable control.
        </p>
      </NoteBlock>
    </article>
  )
}
