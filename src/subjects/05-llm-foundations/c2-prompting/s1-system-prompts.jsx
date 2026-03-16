import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function SystemPrompts() {
  return (
    <article className="prose-content">
      <h2>System Prompts</h2>
      <p>
        The system prompt is the most powerful lever you have for shaping model behaviour.
        Sent before any user messages, it establishes the agent's identity, capabilities,
        constraints, and output format. A well-designed system prompt is the difference between
        an agent that reliably serves its purpose and one that drifts unpredictably.
      </p>

      <ConceptBlock term="System Prompt">
        <p>
          A special message, distinct from the conversation history, that is prepended to every
          inference call. It defines the model's operating context: its persona, the rules it must
          follow, the tools available to it, and any domain-specific knowledge it should treat as
          ground truth. Unlike user messages, the system prompt is invisible to end users in most
          production deployments.
        </p>
      </ConceptBlock>

      <h2>Anatomy of an Effective System Prompt</h2>
      <p>
        A production-grade system prompt typically has five sections, each serving a distinct
        purpose:
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Section</th>
              <th className="px-4 py-3 text-left font-semibold">Purpose</th>
              <th className="px-4 py-3 text-left font-semibold">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Identity', 'Who the agent is and what it does', '"You are CodeGuard, a security-focused code review agent."'],
              ['Capabilities', 'What the agent can and should do', '"You can read files, run static analysis, and suggest fixes."'],
              ['Constraints', 'Hard limits and negative rules', '"Never suggest deleting files. Never run arbitrary shell commands."'],
              ['Output format', 'How responses should be structured', '"Respond with JSON: {severity, description, suggestion}."'],
              ['Context', 'Domain knowledge, current state', '"The project uses Python 3.11 and FastAPI. All endpoints require OAuth2."'],
            ].map(([section, purpose, example]) => (
              <tr key={section}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{section}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{purpose}</td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-500 italic">{example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Building a System Prompt Progressively</h2>

      <SDKExample
        title="Minimal to Production System Prompt"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

# --- Level 1: Minimal (good for prototyping) ---
minimal_system = "You are a helpful Python programming assistant."

# --- Level 2: With constraints ---
constrained_system = """You are a Python programming assistant for a fintech startup.

Scope: Only answer Python programming questions related to the project.
Tone: Professional, concise.
Never: Provide financial or legal advice."""

# --- Level 3: Production-grade ---
production_system = """# Identity
You are Pyra, the internal Python assistant for AcmePay engineering.

# Capabilities
- Answer Python questions (3.11+), FastAPI, SQLAlchemy, pytest, Pydantic v2
- Review code snippets and suggest improvements
- Explain error messages with root-cause analysis
- Generate code that follows the conventions below

# Conventions
- Type hints on all function signatures
- Docstrings in Google format
- No mutable default arguments
- Use structlog for logging (not print or logging.info)
- All monetary values use decimal.Decimal, never float

# Constraints
- Do not answer questions unrelated to Python/backend engineering
- Do not generate code that connects to production databases
- If you are unsure, say so explicitly — do not hallucinate API signatures

# Output Format
When providing code: wrap in a single fenced code block with language tag.
When reviewing code: use the format:
  ISSUE: <description>
  SEVERITY: critical | warning | suggestion
  FIX: <corrected code or explanation>"""

def ask(question: str, system: str = production_system) -> str:
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": question}],
    )
    return response.content[0].text

print(ask("How do I handle database transactions in SQLAlchemy?"))`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const PRODUCTION_SYSTEM = # Identity
You are Pyra, the internal Python assistant for AcmePay engineering.

# Capabilities
- Answer Python questions (3.11+), FastAPI, SQLAlchemy, pytest, Pydantic v2
- Review code snippets and suggest improvements

# Conventions
- Type hints on all function signatures
- All monetary values use decimal.Decimal, never float
- Use structlog for logging

# Constraints
- Do not answer questions unrelated to Python/backend engineering
- Do not generate code that connects to production databases
- If you are unsure, say so explicitly;

async function ask(question: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: PRODUCTION_SYSTEM,
    messages: [{ role: 'user', content: question }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

console.log(await ask('How do I handle database transactions in SQLAlchemy?'));`,
        }}
      />

      <h2>Persona Design</h2>
      <p>
        A well-defined persona does more than set a name. It implicitly shapes the model's
        tone, level of detail, and domain focus. The persona should match the target user's
        expectations and the application's brand.
      </p>

      <SDKExample
        title="Persona-Driven System Prompts"
        tabs={{
          python: `# Expert persona: assumes technical depth, uses jargon, skips basics
expert_persona = """You are Dr. Chen, a machine learning researcher specialising in
retrieval systems. Your audience is senior ML engineers. Assume familiarity with
linear algebra, attention mechanisms, and distributed systems. Use precise technical
terminology. Cite papers when relevant. Be direct and skip motivating explanations."""

# Educator persona: explains concepts from first principles
educator_persona = """You are Alex, a patient programming tutor for beginners.
Your students are learning Python for the first time. Use simple analogies, avoid
jargon, and always explain the "why" before the "how". Break concepts into small
steps. Encourage questions. Celebrate progress."""

# Triage persona: structured, decision-making focused
triage_persona = """You are the first-line support agent for CloudBase SRE team.
Your job is to classify incoming alerts and recommend the next action.
Respond in this exact JSON format:
{
  "severity": "P0" | "P1" | "P2" | "P3",
  "category": "infra" | "app" | "data" | "security",
  "recommended_action": "<one sentence>",
  "escalate_to": "<team name or null>"
}"""`,
        }}
      />

      <PatternBlock
        name="Dynamic System Prompt Assembly"
        category="Prompt Engineering"
        whenToUse="When different users, tenants, or modes require different agent behaviour from the same base model."
      >
        <p>
          Build system prompts programmatically by composing a base template with
          context-specific sections. This keeps the base rules consistent while allowing
          per-tenant customisation.
        </p>
        <SDKExample
          title="Composing System Prompts Dynamically"
          tabs={{
            python: `def build_system_prompt(
    tenant: str,
    allowed_tools: list[str],
    extra_context: str = "",
) -> str:
    base = """You are an AI assistant. Be helpful, accurate, and concise."""

    tool_section = "# Available Tools\\n" + "\\n".join(
        f"- {tool}" for tool in allowed_tools
    )

    tenant_section = f"# Tenant Context\\nYou are operating for: {tenant}."

    sections = [base, tool_section, tenant_section]
    if extra_context:
        sections.append(f"# Additional Context\\n{extra_context}")

    return "\\n\\n".join(sections)

# Usage
system = build_system_prompt(
    tenant="AcmeCorp",
    allowed_tools=["read_file", "search_docs", "create_ticket"],
    extra_context="The team is currently in a code freeze until 2025-04-01.",
)`,
          }}
        />
      </PatternBlock>

      <SecurityCallout title="System Prompt Injection" severity="high">
        <p>
          If your system prompt incorporates user-controlled data (e.g. a document the user
          uploaded or a URL you fetched), an attacker can embed instructions inside that data
          to override your system prompt. This is called prompt injection. Mitigate by:
        </p>
        <ul>
          <li>Wrapping user-controlled content in explicit delimiters: <code>{"<document>"}</code>...</li>
          <li>Telling the model in the system prompt to ignore instructions inside those delimiters.</li>
          <li>Validating that tool results or retrieved content cannot contain your control sequences.</li>
          <li>Never placing sensitive secrets inside the system prompt of a user-facing deployment.</li>
        </ul>
      </SecurityCallout>

      <BestPracticeBlock title="System Prompt Design Principles">
        <ul>
          <li>Write system prompts as documents, not sentences — use headers and lists for clarity.</li>
          <li>Test your system prompt against adversarial user inputs before shipping.</li>
          <li>Version control your system prompts alongside your code — they are code.</li>
          <li>Keep the system prompt focused: long, rambling prompts dilute the signal of individual rules.</li>
          <li>Use positive framing ("always respond in English") not just negative ("don't respond in French").</li>
          <li>For multi-tenant apps, parameterise the tenant-specific sections — don't maintain separate prompts.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Measuring System Prompt Effectiveness">
        <p>
          Build an evaluation set of 20–50 test cases that cover your intended behaviour, edge
          cases, and adversarial inputs. Run this eval against every system prompt change.
          A system prompt that improves average quality but breaks a critical edge case is not
          an improvement. Treat prompt changes the same as code changes: test, review, deploy.
        </p>
      </NoteBlock>
    </article>
  )
}
