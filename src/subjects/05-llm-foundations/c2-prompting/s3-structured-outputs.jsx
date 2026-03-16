import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function StructuredOutputs() {
  return (
    <article className="prose-content">
      <h2>Structured Outputs</h2>
      <p>
        Agentic systems rarely need free-form prose from a model — they need data they can act
        on: JSON objects to store in a database, structured fields to route a workflow, typed
        function arguments to call an API. Structured outputs are techniques for forcing models
        to emit machine-readable formats reliably.
      </p>

      <ConceptBlock term="Structured Output">
        <p>
          A model response that conforms to a predefined schema — JSON, XML, CSV, or a
          custom format — rather than arbitrary prose. Structured outputs enable downstream
          code to parse model responses deterministically without fragile regex or string
          manipulation.
        </p>
      </ConceptBlock>

      <h2>Technique 1: Tool Use (Most Reliable)</h2>
      <p>
        The most reliable way to get structured output from Anthropic models is to define a
        tool whose input schema matches the output you want, then force the model to call it.
        The model's tool arguments are always valid against the schema — they are parsed and
        validated before being returned to your code.
      </p>

      <SDKExample
        title="Structured Output via Forced Tool Use"
        tabs={{
          python: `import anthropic
import json
from typing import Any

client = anthropic.Anthropic()

def extract_structured(
    text: str,
    schema: dict,
    tool_name: str = "extract",
    description: str = "Extract structured data from the text.",
) -> dict[str, Any]:
    """Generic structured extraction using forced tool use."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        tools=[{
            "name": tool_name,
            "description": description,
            "input_schema": schema,
        }],
        tool_choice={"type": "tool", "name": tool_name},
        messages=[{"role": "user", "content": text}],
    )
    tool_call = next(b for b in response.content if b.type == "tool_use")
    return tool_call.input

# Example: extract a job posting into structured fields
job_schema = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "company": {"type": "string"},
        "location": {"type": "string"},
        "remote": {"type": "boolean"},
        "salary_min_usd": {"type": "integer"},
        "salary_max_usd": {"type": "integer"},
        "required_skills": {"type": "array", "items": {"type": "string"}},
        "seniority": {"type": "string", "enum": ["junior", "mid", "senior", "lead", "principal"]},
    },
    "required": ["title", "company", "location", "remote", "required_skills", "seniority"],
}

job_posting = """
Senior Backend Engineer at DataFlow Inc, San Francisco (remote-friendly).
$160K–$200K. Must have Python, PostgreSQL, Kafka. Nice to have: Rust, Kubernetes.
"""

result = extract_structured(
    job_posting,
    job_schema,
    description="Extract all job posting details into structured fields.",
)
print(json.dumps(result, indent=2))`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function extractStructured<T>(
  text: string,
  schema: Record<string, unknown>,
  toolName = 'extract',
  description = 'Extract structured data from the text.',
): Promise<T> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    tools: [{ name: toolName, description, input_schema: schema as Anthropic.Tool['input_schema'] }],
    tool_choice: { type: 'tool', name: toolName },
    messages: [{ role: 'user', content: text }],
  });

  const toolCall = response.content.find((b) => b.type === 'tool_use');
  if (!toolCall || toolCall.type !== 'tool_use') throw new Error('No tool call in response');
  return toolCall.input as T;
}

interface JobPosting {
  title: string;
  company: string;
  location: string;
  remote: boolean;
  required_skills: string[];
  seniority: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
}

const result = await extractStructured<JobPosting>(
  'Senior Backend Engineer at DataFlow Inc, remote. Python, PostgreSQL required.',
  { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' } /* ... */ }, required: ['title', 'company'] },
);
console.log(result);`,
        }}
      />

      <h2>Technique 2: Pydantic Integration</h2>
      <p>
        For Python applications, integrating Pydantic with tool use gives you automatic schema
        generation, runtime type validation, and IDE autocompletion — with no manual JSON
        Schema writing.
      </p>

      <SDKExample
        title="Pydantic + Tool Use for Type-Safe Extraction"
        tabs={{
          python: `import anthropic
from pydantic import BaseModel, Field
from typing import Literal

client = anthropic.Anthropic()

class BugReport(BaseModel):
    title: str = Field(description="Concise title for the bug")
    severity: Literal["critical", "high", "medium", "low"]
    affected_component: str = Field(description="Module or service affected")
    steps_to_reproduce: list[str] = Field(description="Ordered steps to reproduce the bug")
    expected_behaviour: str
    actual_behaviour: str
    suggested_fix: str | None = Field(default=None, description="Optional preliminary fix suggestion")

def parse_bug_report(raw_text: str) -> BugReport:
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        tools=[{
            "name": "file_bug_report",
            "description": "File a structured bug report from the provided description.",
            "input_schema": BugReport.model_json_schema(),
        }],
        tool_choice={"type": "tool", "name": "file_bug_report"},
        messages=[{"role": "user", "content": raw_text}],
    )
    tool_call = response.content[0]
    return BugReport(**tool_call.input)  # Pydantic validates and coerces types

raw = """
The payment checkout crashes when a user applies a discount code after adding items to cart.
This is a critical issue blocking revenue. The cart service throws a 500 error.
Steps: 1. Add item to cart 2. Enter discount code SAVE10 3. Click checkout.
Expected: discount applied. Actual: 500 Internal Server Error.
"""

report = parse_bug_report(raw)
print(f"Severity: {report.severity}")
print(f"Steps: {report.steps_to_reproduce}")`,
        }}
      />

      <h2>Technique 3: Instructed JSON Output</h2>
      <p>
        Without forced tool use, you can instruct the model to emit JSON directly in its text
        response. This is less reliable but sufficient for lower-stakes applications or models
        that don't support tool use.
      </p>

      <SDKExample
        title="Instructed JSON with Robust Parsing"
        tabs={{
          python: `import anthropic
import json
import re

client = anthropic.Anthropic()

def extract_json_from_text(text: str) -> dict:
    """Extract JSON from a model response that may have surrounding prose."""
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Try to find a JSON block in markdown fences
    pattern = r"(?:json)?\\s*([\\s\\S]*?)"
    match = re.search(pattern, text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try to find any {...} block
    match = re.search(r"\\{[\\s\\S]*\\}", text)
    if match:
        return json.loads(match.group(0))

    raise ValueError(f"No valid JSON found in response: {text[:200]}")

def classify_intent(user_message: str) -> dict:
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=256,
        system="""Classify user intent. Respond ONLY with a JSON object:
{
  "intent": "question" | "request" | "complaint" | "compliment" | "other",
  "confidence": <float 0-1>,
  "topic": "<brief topic string>"
}
No prose before or after the JSON.""",
        messages=[{"role": "user", "content": user_message}],
    )
    return extract_json_from_text(response.content[0].text)

result = classify_intent("Why is my order still not shipped after 10 days?")
print(result)  # {"intent": "complaint", "confidence": 0.95, "topic": "shipping delay"}`,
        }}
      />

      <h2>Technique 4: XML for Nested Structure</h2>
      <p>
        XML is a viable alternative to JSON for structured output — Claude is particularly
        good at generating well-formed XML because it appeared heavily in pre-training data.
        XML handles nested, multi-line content (like code blocks) more cleanly than JSON.
      </p>

      <SDKExample
        title="XML Structured Output"
        tabs={{
          python: `import anthropic
import xml.etree.ElementTree as ET

client = anthropic.Anthropic()

def analyse_code_xml(code: str) -> dict:
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system="""Analyse code and respond ONLY with this XML structure:
<analysis>
  <summary>One sentence summary</summary>
  <complexity>low|medium|high</complexity>
  <issues>
    <issue severity="critical|warning|info">Description</issue>
  </issues>
  <suggestions>
    <suggestion>Improvement suggestion</suggestion>
  </suggestions>
</analysis>""",
        messages=[{"role": "user", "content": f"Analyse:\\n\\n{code}"}],
    )

    xml_text = response.content[0].text.strip()
    root = ET.fromstring(xml_text)

    return {
        "summary": root.findtext("summary"),
        "complexity": root.findtext("complexity"),
        "issues": [
            {"severity": el.get("severity"), "description": el.text}
            for el in root.findall(".//issue")
        ],
        "suggestions": [el.text for el in root.findall(".//suggestion")],
    }`,
        }}
      />

      <WarningBlock title="JSON Reliability Without Tool Forcing">
        <p>
          When asking models to produce JSON in free text without forced tool use, expect a
          5–15% failure rate in production — the model may add explanatory prose, use single
          quotes, or truncate long arrays. Always wrap free-text JSON extraction in try/except
          with a retry or fallback strategy. Forced tool use drops the failure rate to near zero.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Structured Output Best Practices">
        <ul>
          <li>Prefer forced tool use over instructed JSON for production systems — it is dramatically more reliable.</li>
          <li>Use Pydantic models to auto-generate JSON schemas and validate responses in Python.</li>
          <li>Always implement a JSON extraction fallback that strips markdown fences before parsing.</li>
          <li>Add retry logic: if parsing fails, send the invalid response back and ask the model to fix it.</li>
          <li>Use JSON Schema <code>enum</code> for categorical fields to prevent the model from inventing values.</li>
          <li>Mark fields as <code>required</code> in the schema; optional fields with <code>default: null</code> are more predictable than missing keys.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Self-Healing JSON Extraction">
        <p>
          If initial JSON parsing fails, send the malformed output back to the model with:
          "The following JSON is malformed. Fix it and return only valid JSON, nothing else:
          [malformed output]". This one-shot self-healing step recovers from ~80% of format
          failures without a full model re-run.
        </p>
      </NoteBlock>
    </article>
  )
}
