import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function CodexArchitecture() {
  return (
    <article className="prose-content">
      <h2>OpenAI Codex &amp; GPT-4o for Code</h2>
      <p>
        OpenAI Codex was the original LLM fine-tuned specifically for code generation, powering
        the first version of GitHub Copilot. Today OpenAI's coding capabilities live in
        <strong> GPT-4o</strong> and <strong>GPT-4o mini</strong> — foundation models with strong
        code understanding built in — plus the cloud-hosted <strong>Code Interpreter</strong>
        (now called the <em>code_interpreter</em> tool in the Assistants API) that executes Python
        in a sandboxed environment. Understanding this evolution helps you pick the right OpenAI
        tool for each coding task.
      </p>

      <ConceptBlock term="Codex (2021–2023)">
        <p>
          Codex was a GPT-3 variant fine-tuned on a 159 GB dataset of public GitHub code. It was
          the model behind GitHub Copilot v1 and the <code>code-davinci-002</code> API endpoint.
          OpenAI deprecated Codex in March 2023, replacing it with the more capable GPT-3.5 Turbo
          and later GPT-4 series, which were trained on code as part of their general pretraining
          rather than as a separate fine-tuning stage.
        </p>
      </ConceptBlock>

      <h2>How GPT-4o Was Trained for Code</h2>
      <p>
        GPT-4o is trained on a massive multi-modal corpus that includes a large fraction of public
        source code from GitHub, Stack Overflow, documentation sites, and technical books. Key
        training techniques relevant to code performance:
      </p>
      <ul>
        <li>
          <strong>Fill-in-the-middle (FIM)</strong> — The model is trained to predict a middle
          span of code given both the prefix and suffix context. This is what powers inline
          completion suggestions in Copilot.
        </li>
        <li>
          <strong>RLHF with code feedback</strong> — Human labellers and automated test execution
          provide reward signals for code correctness, allowing the model to prefer solutions that
          actually run over syntactically correct but buggy ones.
        </li>
        <li>
          <strong>Multi-language coverage</strong> — GPT-4o performs well across Python,
          JavaScript/TypeScript, Java, C/C++, Go, Rust, and SQL, with Python and JavaScript
          showing the strongest benchmark results.
        </li>
      </ul>

      <h2>Code Interpreter (Sandboxed Execution)</h2>
      <p>
        Code Interpreter is OpenAI's managed Python execution environment. The model can write
        Python, run it in an isolated container, observe the output (including matplotlib charts,
        DataFrames, error tracebacks), and iterate. It is the backbone of ChatGPT's data analysis
        feature and is available to developers via the Assistants API's
        <code> code_interpreter</code> tool.
      </p>

      <SDKExample
        title="GPT-4o for Code Generation (Chat Completions API)"
        tabs={{
          python: `from openai import OpenAI

client = OpenAI()

# Request a Python function with type hints and docstring
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "system",
            "content": (
                "You are an expert Python developer. "
                "Write clean, type-annotated Python with docstrings. "
                "Include unit tests using pytest."
            ),
        },
        {
            "role": "user",
            "content": (
                "Write a function that parses a CSV file and returns a list of dicts. "
                "Handle missing values and type coercion. Include tests."
            ),
        },
    ],
    temperature=0.2,  # lower temperature for more deterministic code
)

print(response.choices[0].message.content)
print(f"Tokens used: {response.usage.total_tokens}")`,
          typescript: `import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: 'You are an expert TypeScript developer. Write clean, typed code with JSDoc.',
    },
    {
      role: 'user',
      content: 'Write a generic retry utility function with exponential backoff and jitter.',
    },
  ],
  temperature: 0.2,
});

console.log(response.choices[0].message.content);`,
        }}
      />

      <h2>Structured Code Output with JSON Mode</h2>
      <p>
        For programmatic code generation pipelines, use <code>response_format</code> to get
        structured output alongside the generated code — useful for extracting function signatures,
        extracting file paths, or splitting multi-file output.
      </p>

      <SDKExample
        title="Structured Code Generation Output"
        tabs={{
          python: `from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class GeneratedFile(BaseModel):
    filename: str
    language: str
    content: str
    description: str

class CodeGenResponse(BaseModel):
    files: list[GeneratedFile]
    setup_instructions: str

response = client.beta.chat.completions.parse(
    model="gpt-4o-2024-08-06",
    messages=[
        {
            "role": "system",
            "content": "Generate code files as structured JSON. Be complete and correct.",
        },
        {
            "role": "user",
            "content": "Create a FastAPI endpoint for user authentication with JWT tokens.",
        },
    ],
    response_format=CodeGenResponse,
)

result = response.choices[0].message.parsed
for file in result.files:
    print(f"=== {file.filename} ({file.language}) ===")
    print(file.content)
    print()
print("Setup:", result.setup_instructions)`,
        }}
      />

      <h2>Fine-tuning GPT-4o mini for Code</h2>
      <p>
        OpenAI supports fine-tuning GPT-4o mini on custom datasets. For coding agents, fine-tuning
        is valuable when you need the model to consistently follow project-specific patterns,
        generate code in a proprietary DSL, or reliably produce a specific output format.
        Fine-tuning is more cost-effective than few-shot prompting when you have hundreds of
        examples and are making many API calls.
      </p>

      <SDKExample
        title="Preparing Fine-tuning Data for Code Generation"
        tabs={{
          python: `import json
from openai import OpenAI

client = OpenAI()

# Training data format: JSONL with system/user/assistant turns
training_examples = [
    {
        "messages": [
            {"role": "system", "content": "Generate SQLAlchemy 2.0 model classes."},
            {"role": "user", "content": "Create a User model with email, hashed_password, created_at"},
            {"role": "assistant", "content": """from datetime import datetime
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
"""},
        ]
    },
    # ... more examples
]

# Write to JSONL
with open("training_data.jsonl", "w") as f:
    for example in training_examples:
        f.write(json.dumps(example) + "\\n")

# Upload and start fine-tuning
with open("training_data.jsonl", "rb") as f:
    file_response = client.files.create(file=f, purpose="fine-tune")

ft_job = client.fine_tuning.jobs.create(
    training_file=file_response.id,
    model="gpt-4o-mini-2024-07-18",
)
print(f"Fine-tuning job: {ft_job.id}")`,
        }}
      />

      <BestPracticeBlock title="GPT-4o Code Best Practices">
        <ul>
          <li>Use <code>temperature=0.0</code> to <code>0.2</code> for code generation — lower temperatures produce more consistent, less hallucinated output.</li>
          <li>Include the target language and framework in the system prompt explicitly (e.g., "Python 3.12 with FastAPI 0.111").</li>
          <li>For multi-file generation, use structured output (Pydantic + <code>response_format</code>) to get well-formed, parseable results.</li>
          <li>Prefer GPT-4o for complex reasoning tasks; use GPT-4o mini for high-volume, simpler completions to reduce cost.</li>
          <li>Always validate generated code by running it — GPT-4o produces plausible-looking code that may have subtle bugs.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="info" title="OpenAI o-series for Hard Problems">
        <p>
          For algorithmic problems requiring deep reasoning (competitive programming, complex
          refactoring, debugging subtle concurrency bugs), the OpenAI o-series models (o1, o3)
          significantly outperform GPT-4o. They use extended chain-of-thought reasoning at
          inference time and are available via the same Chat Completions API but with
          <code> reasoning_effort</code> parameter instead of <code>temperature</code>.
        </p>
      </NoteBlock>
    </article>
  )
}
