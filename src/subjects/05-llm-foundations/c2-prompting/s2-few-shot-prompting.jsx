import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'

export default function FewShotPrompting() {
  return (
    <article className="prose-content">
      <h2>Few-Shot Prompting</h2>
      <p>
        Few-shot prompting provides the model with worked examples of the task before asking
        it to solve a new instance. By showing the model input-output pairs that demonstrate
        the desired behaviour, you steer it more reliably than you can with instructions alone —
        particularly for format-sensitive or domain-specific tasks.
      </p>

      <ConceptBlock term="Few-Shot Prompting">
        <p>
          A prompting technique where you prepend N example (input, output) pairs — "shots" —
          before the actual query. The model uses these examples to infer the task format,
          domain vocabulary, output style, and reasoning pattern. Zero-shot uses no examples;
          one-shot uses one; few-shot typically uses 2–10.
        </p>
      </ConceptBlock>

      <ConceptBlock term="In-Context Learning">
        <p>
          The broader phenomenon where LLMs adapt their behaviour based on examples in the
          prompt, without updating model weights. Few-shot prompting exploits in-context learning.
          The model's ability to in-context learn scales strongly with model size and was a
          surprising emergent capability of large language models.
        </p>
      </ConceptBlock>

      <h2>Zero-Shot vs One-Shot vs Few-Shot</h2>

      <SDKExample
        title="Progression: Zero to Few-Shot"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

# Zero-shot: instructions only — works for simple tasks
zero_shot_response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=128,
    messages=[{
        "role": "user",
        "content": "Classify the sentiment of: 'The new UI is clean but checkout is broken.'"
    }]
)

# One-shot: one example establishes the format
one_shot_response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=128,
    messages=[
        {
            "role": "user",
            "content": "Classify: 'Battery life is fantastic but the camera disappoints.'"
        },
        {
            "role": "assistant",
            "content": "mixed | positive:battery | negative:camera"
        },
        {
            "role": "user",
            "content": "Classify: 'The new UI is clean but checkout is broken.'"
        },
    ]
)

# Few-shot: multiple examples constrain output format tightly
few_shot_messages = [
    {"role": "user",      "content": "Classify: 'Love the speed, hate the price.'"},
    {"role": "assistant", "content": "mixed | positive:speed | negative:price"},
    {"role": "user",      "content": "Classify: 'Best coffee maker I've ever owned.'"},
    {"role": "assistant", "content": "positive | positive:overall"},
    {"role": "user",      "content": "Classify: 'Arrived damaged and support was useless.'"},
    {"role": "assistant", "content": "negative | negative:condition,support"},
    {"role": "user",      "content": "Classify: 'The new UI is clean but checkout is broken.'"},
]

few_shot_response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=128,
    messages=few_shot_messages,
)
print(few_shot_response.content[0].text)
# Expected: "mixed | positive:ui | negative:checkout"`,
        }}
      />

      <h2>Few-Shot for Output Format Control</h2>
      <p>
        Few-shot prompting is especially powerful when you need exact output formats that are
        hard to specify with instructions alone — custom delimiters, unusual schemas, domain
        notation, or multi-line templates.
      </p>

      <SDKExample
        title="Few-Shot Format Control"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

# Target format: structured changelog entry — hard to specify exactly in words
EXAMPLES = [
    {
        "role": "user",
        "content": "Git diff: +def retry(fn, n=3): ... -def attempt(fn, retries=3): ..."
    },
    {
        "role": "assistant",
        "content": """## Changed
- **Renamed** attempt() → retry() for clarity
- No behaviour change; parameter default preserved

**Category:** refactor  **Breaking:** no"""
    },
    {
        "role": "user",
        "content": "Git diff: +raise ValueError('amount must be positive') ..."
    },
    {
        "role": "assistant",
        "content": """## Added
- Input validation: raises ValueError for non-positive amounts

**Category:** fix  **Breaking:** no"""
    },
]

def generate_changelog(diff: str) -> str:
    messages = EXAMPLES + [{"role": "user", "content": f"Git diff: {diff}"}]
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=256,
        system="Generate changelog entries from git diffs. Follow the format shown exactly.",
        messages=messages,
    )
    return response.content[0].text

print(generate_changelog("+class RateLimiter: ... -class Throttle: ..."))`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const EXAMPLES: Anthropic.MessageParam[] = [
  {
    role: 'user',
    content: 'Git diff: +def retry(fn, n=3): ... -def attempt(fn, retries=3): ...',
  },
  {
    role: 'assistant',
    content: '## Changed\n- **Renamed** attempt() → retry() for clarity\n\n**Category:** refactor  **Breaking:** no',
  },
  {
    role: 'user',
    content: 'Git diff: +raise ValueError("amount must be positive") ...',
  },
  {
    role: 'assistant',
    content: '## Added\n- Input validation: raises ValueError for non-positive amounts\n\n**Category:** fix  **Breaking:** no',
  },
];

async function generateChangelog(diff: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 256,
    system: 'Generate changelog entries from git diffs. Follow the format shown exactly.',
    messages: [...EXAMPLES, { role: 'user', content: Git diff: \${diff} }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}`,
        }}
      />

      <h2>Few-Shot for Reasoning Style</h2>
      <p>
        Beyond format, examples can demonstrate <em>how</em> to think through a problem —
        a technique called chain-of-thought few-shot prompting. The model learns to apply
        the same reasoning structure to new inputs.
      </p>

      <SDKExample
        title="Chain-of-Thought Few-Shot"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

COT_EXAMPLES = [
    {
        "role": "user",
        "content": "Should we index the user_id column in the orders table?"
    },
    {
        "role": "assistant",
        "content": """Reasoning:
1. Query patterns: Most order queries filter or join on user_id (fetch orders for a user).
2. Cardinality: user_id has high cardinality (one per user) — index is selective, low false-positive rate.
3. Write cost: orders table has frequent inserts but reads dominate (10:1 read/write ratio typical).
4. Table size: at >100K rows, a full table scan per query is expensive.

Decision: YES — add a B-tree index on user_id.
Caveat: Monitor index bloat on high-insert workloads; consider a partial index if only active orders are queried."""
    },
    {
        "role": "user",
        "content": "Should we cache the result of the get_user_profile function?"
    },
    {
        "role": "assistant",
        "content": """Reasoning:
1. Read frequency: User profiles are fetched on every authenticated request — very high read rate.
2. Change frequency: Profile data changes rarely (name/email edits are infrequent).
3. Consistency requirements: Stale profile data for <60s is acceptable for this application.
4. Cache complexity: Profile data is per-user, so cache keys are simple (user_id).

Decision: YES — cache with a 60-second TTL per user_id. Invalidate on profile update.
Caveat: Ensure cache is invalidated atomically with the database write to avoid serving stale data after updates."""
    },
]

def analyse_optimisation(question: str) -> str:
    messages = COT_EXAMPLES + [{"role": "user", "content": question}]
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system="You are a database and backend performance expert. Always reason step by step before deciding.",
        messages=messages,
    )
    return response.content[0].text

print(analyse_optimisation("Should we add a composite index on (tenant_id, created_at) for the events table?"))`,
        }}
      />

      <PatternBlock
        name="Example Selection Strategy"
        category="Prompt Engineering"
        whenToUse="When you have a large example library and need to dynamically select the most relevant examples for each query."
      >
        <p>
          Not all examples help equally. For best results, select examples that are semantically
          similar to the current query using embedding similarity search, rather than using a
          fixed set of examples for all queries.
        </p>
        <SDKExample
          title="Dynamic Example Selection with Embeddings"
          tabs={{
            python: `import anthropic
import numpy as np

client = anthropic.Anthropic()

# Pre-embed your example library
example_library = [
    {"input": "Sort a list in Python", "output": "Use list.sort() or sorted(list)."},
    {"input": "Read a file in Python", "output": "Use open(path) as f: return f.read()"},
    {"input": "Parse JSON in Python", "output": "Use json.loads(string) or json.load(file)"},
    # ... many more examples
]

def embed(text: str) -> list[float]:
    # Use any embedding model here
    # Anthropic does not yet offer embeddings — use OpenAI or a local model
    raise NotImplementedError("Plug in your embedding model here")

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def get_top_k_examples(query: str, k: int = 3) -> list[dict]:
    query_embedding = embed(query)
    scored = [
        (ex, cosine_similarity(query_embedding, embed(ex["input"])))
        for ex in example_library
    ]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [ex for ex, _ in scored[:k]]

def few_shot_query(question: str) -> str:
    examples = get_top_k_examples(question)
    messages = []
    for ex in examples:
        messages.append({"role": "user", "content": ex["input"]})
        messages.append({"role": "assistant", "content": ex["output"]})
    messages.append({"role": "user", "content": question})
    response = client.messages.create(
        model="claude-opus-4-6", max_tokens=256, messages=messages
    )
    return response.content[0].text`,
          }}
        />
      </PatternBlock>

      <BestPracticeBlock title="Few-Shot Prompting Best Practices">
        <ul>
          <li>Use 3–5 examples for most tasks — diminishing returns beyond 8–10 examples.</li>
          <li>Ensure examples cover edge cases, not just the happy path.</li>
          <li>Order examples from simplest to most complex to build up reasoning scaffolding.</li>
          <li>Make examples representative of the actual distribution of inputs you expect.</li>
          <li>For chain-of-thought tasks, show the full reasoning chain, not just the answer.</li>
          <li>Use dynamic example selection (embedding similarity) for large example libraries.</li>
          <li>Keep examples consistent in style and format — inconsistencies confuse the model.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="intuition" title="Why Few-Shot Works">
        <p>
          LLMs are trained to predict the next token given all prior tokens. When you provide
          several examples that all share the same pattern, the probability distribution for
          the next token is heavily shaped by that pattern. The model doesn't "understand"
          your task — it infers the most likely continuation of the established pattern.
          This is why consistent, high-quality examples produce consistent outputs.
        </p>
      </NoteBlock>
    </article>
  )
}
