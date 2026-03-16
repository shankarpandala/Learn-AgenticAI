import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function CodeContextManagement() {
  return (
    <article className="prose-content">
      <h2>Code Context Management</h2>
      <p>
        The single biggest challenge in building coding agents is managing what code to include
        in the context window. Include too little and the agent makes changes that conflict with
        existing code. Include too much and you waste tokens, increase latency, and risk the
        "lost in the middle" problem where critical information gets overlooked. Good context
        management is the difference between an agent that works reliably and one that hallucinates
        function signatures.
      </p>

      <ConceptBlock term="Repository Map">
        <p>
          A repository map is a compact, symbol-level summary of a codebase: the names of all
          files, classes, functions, and their relationships. Rather than including full file
          contents, the map tells the agent <em>what exists and where</em>, so it can request
          the specific files it actually needs. This technique, popularized by the Aider project,
          scales to codebases of any size.
        </p>
      </ConceptBlock>

      <h2>Context Selection Strategies</h2>

      <h3>Strategy 1: Glob + Grep (Search-First)</h3>
      <p>
        Let the agent search for relevant files using glob and grep rather than pre-loading
        context. The agent starts with only the task description, uses search tools to find
        relevant code, reads only what it needs, and builds context incrementally.
      </p>

      <SDKExample
        title="Search-First Context Building"
        tabs={{
          python: `import anthropic
import subprocess
import glob
import os

client = anthropic.Anthropic()

SEARCH_TOOLS = [
    {
        "name": "glob",
        "description": "Find files matching a pattern",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern": {"type": "string"},
                "path": {"type": "string", "default": "."},
            },
            "required": ["pattern"],
        },
    },
    {
        "name": "grep",
        "description": "Search file contents with a regex pattern",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern": {"type": "string"},
                "path": {"type": "string", "default": "."},
                "file_glob": {"type": "string", "default": "*.py"},
            },
            "required": ["pattern"],
        },
    },
    {
        "name": "read_file",
        "description": "Read a file (use offset/limit for large files)",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "offset": {"type": "integer"},
                "limit": {"type": "integer"},
            },
            "required": ["path"],
        },
    },
]

def execute_search(name: str, inputs: dict) -> str:
    if name == "glob":
        matches = glob.glob(
            os.path.join(inputs.get("path", "."), inputs["pattern"]),
            recursive=True,
        )
        matches.sort(key=os.path.getmtime, reverse=True)
        return "\\n".join(matches[:50]) or "No matches"
    elif name == "grep":
        result = subprocess.run(
            ["rg", "--glob", inputs.get("file_glob", "*.py"), "-n",
             inputs["pattern"], inputs.get("path", ".")],
            capture_output=True, text=True, timeout=10,
        )
        lines = (result.stdout or "No matches").splitlines()
        return "\\n".join(lines[:100])
    elif name == "read_file":
        with open(inputs["path"]) as f:
            lines = f.readlines()
        offset = inputs.get("offset", 0)
        limit = inputs.get("limit", 150)
        sliced = lines[offset:offset + limit]
        return "".join(f"{offset+i+1}\\t{l}" for i, l in enumerate(sliced))
    return "Unknown tool"

# System prompt that encourages search-first behaviour
SYSTEM = """You are a coding agent working on a Python codebase.
IMPORTANT: Do NOT assume file contents. Always search before reading.
Strategy: glob to find files → grep to locate specific symbols → read_file for details.
Request only the context you need for the current step."""`,
        }}
      />

      <h3>Strategy 2: Repository Map</h3>
      <p>
        Build a compact map of the repository's symbols and include it in the system prompt.
        The map lets the agent immediately understand the codebase structure without reading
        individual files.
      </p>

      <SDKExample
        title="Building a Repository Map with ast"
        tabs={{
          python: `import ast
import os
from pathlib import Path

def extract_symbols(filepath: str) -> list[str]:
    """Extract top-level class and function names from a Python file."""
    try:
        with open(filepath) as f:
            tree = ast.parse(f.read())
    except SyntaxError:
        return []

    symbols = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            methods = [
                f"  def {n.name}({', '.join(a.arg for a in n.args.args)})"
                for n in ast.walk(node)
                if isinstance(n, ast.FunctionDef)
            ]
            symbols.append(f"class {node.name}:")
            symbols.extend(methods[:10])  # cap at 10 methods per class
        elif isinstance(node, ast.FunctionDef) and node.col_offset == 0:
            args = ", ".join(a.arg for a in node.args.args)
            symbols.append(f"def {node.name}({args})")

    return symbols

def build_repo_map(root: str, max_files: int = 50) -> str:
    """Build a compact repository map for inclusion in the system prompt."""
    lines = [f"# Repository Map: {root}\\n"]
    py_files = sorted(
        Path(root).rglob("*.py"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )[:max_files]

    for filepath in py_files:
        rel_path = filepath.relative_to(root)
        symbols = extract_symbols(str(filepath))
        if symbols:
            lines.append(f"\\n{rel_path}:")
            lines.extend(f"  {s}" for s in symbols[:15])  # cap per file

    return "\\n".join(lines)

# Usage: include in system prompt
repo_map = build_repo_map("/home/user/myproject")
print(f"Repo map size: {len(repo_map)} chars")
print(repo_map[:2000])  # preview

# Include in system prompt:
# system = f"You are a coding agent.\\n\\n{repo_map}\\n\\nUse read_file to get full contents of any file."`,
        }}
      />

      <h3>Strategy 3: Semantic Code Search (Embeddings)</h3>
      <p>
        For large codebases, embed code chunks in a vector database and retrieve the most
        semantically similar chunks for each task. This is more powerful than grep for
        conceptual queries ("find where user authentication happens") but requires more
        infrastructure.
      </p>

      <SDKExample
        title="Semantic Code Search with Embeddings"
        tabs={{
          python: `from anthropic import Anthropic
from openai import OpenAI
import numpy as np
from pathlib import Path

openai_client = OpenAI()
anthropic_client = Anthropic()

def embed_text(text: str) -> list[float]:
    """Get an embedding for a text using OpenAI's embedding model."""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text[:8000],  # truncate to model limit
    )
    return response.data[0].embedding

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

class CodebaseIndex:
    def __init__(self, root: str):
        self.chunks: list[dict] = []
        self._index(root)

    def _index(self, root: str):
        for filepath in Path(root).rglob("*.py"):
            with open(filepath) as f:
                content = f.read()
            # Split into 50-line chunks with 10-line overlap
            lines = content.splitlines()
            for i in range(0, len(lines), 40):
                chunk = "\\n".join(lines[i:i + 50])
                if len(chunk.strip()) < 50:
                    continue
                embedding = embed_text(chunk)
                self.chunks.append({
                    "file": str(filepath),
                    "start_line": i + 1,
                    "content": chunk,
                    "embedding": embedding,
                })

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        query_embedding = embed_text(query)
        scored = [
            (cosine_similarity(query_embedding, c["embedding"]), c)
            for c in self.chunks
        ]
        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:top_k]]

# Usage:
index = CodebaseIndex("/home/user/myproject")
results = index.search("user authentication and JWT token validation")
for r in results:
    print(f"{r['file']}:{r['start_line']}\\n{r['content'][:300]}\\n")`,
        }}
      />

      <h2>Avoiding Context Overload</h2>
      <p>
        Context overload occurs when too much code is loaded into the context window, causing
        the model to lose track of specific details. Signs of overload: the agent repeats code
        that already exists, introduces duplicate function definitions, or ignores constraints
        stated early in the conversation.
      </p>

      <PatternBlock title="Context Budget Management">
        <p>
          Treat the context window as a budget and spend it deliberately:
        </p>
        <ul>
          <li><strong>System prompt</strong>: Repository map + project rules — 5–15K tokens</li>
          <li><strong>Task description</strong>: Clear, specific — 200–500 tokens</li>
          <li><strong>Relevant file contents</strong>: Only files being modified — 10–50K tokens</li>
          <li><strong>Tool results</strong>: Truncated to 2–4K tokens each</li>
          <li><strong>Reserve for output</strong>: 4–8K tokens minimum</li>
        </ul>
        <p>
          If you are consistently hitting context limits, switch from full-file reads to
          line-range reads (<code>offset</code> + <code>limit</code>) and use the repository
          map to help the agent find only what it needs.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Context Management Best Practices">
        <ul>
          <li>Start with a repository map in the system prompt; let the agent pull full file contents on demand.</li>
          <li>Truncate search results before returning them to the model — 100 lines of grep output is almost always enough.</li>
          <li>Compress earlier tool results as the conversation grows: replace large file contents with a one-line summary once the edit is done.</li>
          <li>For multi-file tasks, process one file at a time: read, edit, verify, summarize, then move to the next file.</li>
          <li>Use read_file with <code>offset</code> and <code>limit</code> for files longer than 200 lines — read only the function being changed plus its immediate callers.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Measure Context Usage">
        <p>
          Log the <code>input_tokens</code> count at each step of the agent loop. If tokens are
          growing faster than 10K per iteration, you have a context leak — likely a tool result
          that is not being truncated. The optimal pattern is for context to grow slowly
          (adding only the delta of each edit and its verification result) rather than
          accumulating entire file contents on every iteration.
        </p>
      </NoteBlock>
    </article>
  )
}
