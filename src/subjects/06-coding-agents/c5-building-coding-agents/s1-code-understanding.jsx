import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function CodeUnderstanding() {
  return (
    <article className="prose-content">
      <h2>Code Understanding Tools</h2>
      <p>
        A coding agent that cannot deeply understand a codebase cannot reliably modify it.
        Raw file reading is insufficient for large projects — the agent must understand structure:
        which functions call which others, where a symbol is defined and used, how modules
        depend on each other, and what the abstract syntax tree of a file looks like. Code
        understanding tools — LSPs, tree-sitter parsers, call graph analyzers, and semantic
        code search engines — give agents this structural intelligence.
      </p>

      <ConceptBlock term="Language Server Protocol (LSP)">
        <p>
          A standardised JSON-RPC protocol that decouples language intelligence from editor
          tooling. An LSP server (e.g. <code>pylsp</code>, <code>typescript-language-server</code>,
          <code>rust-analyzer</code>) provides services like go-to-definition, find-all-references,
          hover documentation, rename symbol, and diagnostics. Coding agents can connect to LSP
          servers to obtain precise, compiler-accurate structural information about code.
        </p>
      </ConceptBlock>

      <ConceptBlock term="tree-sitter">
        <p>
          A fast, incremental, error-tolerant parser that builds a concrete syntax tree (CST) from
          source code. Unlike regex or line-based parsing, tree-sitter produces a structured
          representation that can be queried using S-expression patterns. It supports over 100
          languages and is used by editors like Neovim, Helix, and GitHub's code search to
          extract structural information from code without running a full compiler.
        </p>
      </ConceptBlock>

      <h2>Code Understanding Techniques</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Technique</th>
              <th className="px-4 py-3 text-left font-semibold">What It Provides</th>
              <th className="px-4 py-3 text-left font-semibold">Accuracy</th>
              <th className="px-4 py-3 text-left font-semibold">Setup Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Grep / regex search', 'Text pattern matches across files', 'Low (no semantics)', 'None'],
              ['tree-sitter parsing', 'Structural AST, symbol extraction', 'High (syntax-accurate)', 'Low'],
              ['LSP queries', 'Go-to-definition, find-references, types', 'Very high (type-aware)', 'Medium'],
              ['ctags / etags', 'Symbol index (name → file:line)', 'Medium (tag-based)', 'Low'],
              ['Call graph analysis', 'Which function calls which', 'High (static analysis)', 'Medium-High'],
              ['Semantic code search', 'Natural language → relevant code', 'Variable', 'High (embeddings)'],
              ['AST-based refactoring (jscodeshift, libCST)', 'Structured code transforms', 'Very high', 'Medium'],
            ].map(([tech, provides, accuracy, cost]) => (
              <tr key={tech}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{tech}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{provides}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{accuracy}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>tree-sitter for Structural Code Analysis</h2>
      <p>
        tree-sitter is the most practical tool for giving a coding agent structural code
        understanding without requiring a running language server. It parses code into a CST and
        lets you query it with patterns — extracting all function definitions, class hierarchies,
        import statements, or any other syntactic structure in milliseconds.
      </p>

      <SDKExample
        title="Extracting Code Structure with tree-sitter"
        tabs={{
          python: `# pip install tree-sitter tree-sitter-python tree-sitter-javascript
import tree_sitter_python as tspython
from tree_sitter import Language, Parser, Node

PY_LANGUAGE = Language(tspython.language())
parser = Parser(PY_LANGUAGE)

def parse_python_file(source: str) -> dict:
    """Extract all function and class definitions from a Python file."""
    tree = parser.parse(source.encode())
    root = tree.root_node

    functions = []
    classes = []

    def traverse(node: Node):
        if node.type == "function_definition":
            name_node = node.child_by_field_name("name")
            params_node = node.child_by_field_name("parameters")
            functions.append({
                "name": name_node.text.decode() if name_node else "?",
                "line": node.start_point[0] + 1,
                "params": params_node.text.decode() if params_node else "()",
                "is_async": node.children[0].type == "async",
            })
        elif node.type == "class_definition":
            name_node = node.child_by_field_name("name")
            classes.append({
                "name": name_node.text.decode() if name_node else "?",
                "line": node.start_point[0] + 1,
            })
        for child in node.children:
            traverse(child)

    traverse(root)
    return {"functions": functions, "classes": classes}

# Usage
source = open("my_module.py").read()
structure = parse_python_file(source)

print("Functions:")
for fn in structure["functions"]:
    async_prefix = "async " if fn["is_async"] else ""
    print(f"  Line {fn['line']}: {async_prefix}def {fn['name']}{fn['params']}")

print("\\nClasses:")
for cls in structure["classes"]:
    print(f"  Line {cls['line']}: class {cls['name']}")`,
          typescript: `// npm install tree-sitter tree-sitter-typescript
import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import * as fs from 'fs';

const parser = new Parser();
parser.setLanguage(TypeScript.typescript);

interface FunctionInfo {
  name: string;
  line: number;
  isAsync: boolean;
  isExported: boolean;
}

interface ClassInfo {
  name: string;
  line: number;
  methods: string[];
}

function parseTypeScriptFile(source: string): { functions: FunctionInfo[]; classes: ClassInfo[] } {
  const tree = parser.parse(source);
  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];

  function traverse(node: Parser.SyntaxNode): void {
    if (node.type === 'function_declaration' || node.type === 'arrow_function') {
      const nameNode = node.childForFieldName('name');
      functions.push({
        name: nameNode?.text ?? '(anonymous)',
        line: node.startPosition.row + 1,
        isAsync: node.children.some(c => c.type === 'async'),
        isExported: node.parent?.type === 'export_statement',
      });
    } else if (node.type === 'class_declaration') {
      const nameNode = node.childForFieldName('name');
      const bodyNode = node.childForFieldName('body');
      const methods: string[] = [];

      bodyNode?.children.forEach(child => {
        if (child.type === 'method_definition') {
          const methodName = child.childForFieldName('name');
          if (methodName) methods.push(methodName.text);
        }
      });

      classes.push({
        name: nameNode?.text ?? '(anonymous)',
        line: node.startPosition.row + 1,
        methods,
      });
    }

    node.children.forEach(traverse);
  }

  traverse(tree.rootNode);
  return { functions, classes };
}

const source = fs.readFileSync('my_module.ts', 'utf8');
const structure = parseTypeScriptFile(source);

console.log('Functions:');
structure.functions.forEach(fn => {
  const prefix = \${fn.isExported ? 'export ' : ''}\${fn.isAsync ? 'async ' : ''};
  console.log(  Line \${fn.line}: \${prefix}function \${fn.name});
});

console.log('\\nClasses:');
structure.classes.forEach(cls => {
  console.log(  Line \${cls.line}: class \${cls.name} [methods: \${cls.methods.join(', ')}]);
});`,
        }}
      />

      <h2>Building a Symbol Index for Agent Navigation</h2>
      <p>
        A symbol index maps every function, class, and variable name to its definition location
        and all usage sites. This enables an agent to answer questions like "where is
        <code>AuthService</code> defined?" and "what calls <code>validate_token()</code>?" without
        reading every file.
      </p>

      <SDKExample
        title="Building and Querying a Symbol Index"
        tabs={{
          python: `import subprocess
import json
from pathlib import Path
from collections import defaultdict

class SymbolIndex:
    """A simple symbol index built using ctags and grep."""

    def __init__(self, project_root: str):
        self.root = Path(project_root)
        self.index: dict[str, list[dict]] = defaultdict(list)
        self._build()

    def _build(self):
        """Build index using Universal Ctags."""
        result = subprocess.run(
            ["ctags", "-R", "--output-format=json", "--fields=+n", "."],
            cwd=self.root,
            capture_output=True,
            text=True,
        )
        for line in result.stdout.splitlines():
            try:
                tag = json.loads(line)
                self.index[tag["name"]].append({
                    "kind": tag.get("kind", "unknown"),
                    "file": tag["path"],
                    "line": tag.get("line", 0),
                    "scope": tag.get("scope", ""),
                })
            except (json.JSONDecodeError, KeyError):
                continue

    def find_definition(self, symbol: str) -> list[dict]:
        """Find where a symbol is defined."""
        return [
            entry for entry in self.index.get(symbol, [])
            if entry["kind"] in ("function", "class", "method", "variable")
        ]

    def find_usages(self, symbol: str) -> list[dict]:
        """Find all files where a symbol name appears (text search)."""
        result = subprocess.run(
            ["grep", "-rn", "--include=*.py", f"\\\\b{symbol}\\\\b", "."],
            cwd=self.root,
            capture_output=True,
            text=True,
        )
        usages = []
        for line in result.stdout.splitlines():
            parts = line.split(":", 2)
            if len(parts) >= 3:
                usages.append({
                    "file": parts[0],
                    "line": int(parts[1]),
                    "context": parts[2].strip(),
                })
        return usages

# Usage
index = SymbolIndex("/path/to/project")

# Find where UserService is defined
defns = index.find_definition("UserService")
for d in defns:
    print(f"Defined at {d['file']}:{d['line']} (kind={d['kind']})")

# Find all usages of validate_token
usages = index.find_usages("validate_token")
print(f"\\nvalidate_token used in {len(usages)} locations")
for u in usages[:5]:
    print(f"  {u['file']}:{u['line']}  {u['context']}")`,
          typescript: `import { execSync } from 'child_process';
import * as path from 'path';

interface SymbolEntry {
  kind: string;
  file: string;
  line: number;
  scope?: string;
}

interface Usage {
  file: string;
  line: number;
  context: string;
}

class SymbolIndex {
  private root: string;
  private index = new Map<string, SymbolEntry[]>();

  constructor(projectRoot: string) {
    this.root = projectRoot;
    this.build();
  }

  private build(): void {
    try {
      const output = execSync(
        'ctags -R --output-format=json --fields=+n --languages=TypeScript,JavaScript .',
        { cwd: this.root, encoding: 'utf8' }
      );
      for (const line of output.split('\\n')) {
        try {
          const tag = JSON.parse(line);
          const entries = this.index.get(tag.name) ?? [];
          entries.push({
            kind: tag.kind ?? 'unknown',
            file: tag.path,
            line: tag.line ?? 0,
            scope: tag.scope,
          });
          this.index.set(tag.name, entries);
        } catch {
          // skip malformed lines
        }
      }
    } catch (e) {
      console.error('ctags not available:', e);
    }
  }

  findDefinition(symbol: string): SymbolEntry[] {
    const definitionKinds = new Set(['function', 'class', 'method', 'variable', 'interface']);
    return (this.index.get(symbol) ?? []).filter(e => definitionKinds.has(e.kind));
  }

  findUsages(symbol: string): Usage[] {
    try {
      const output = execSync(
        grep -rn --include="*.ts" --include="*.tsx" "\\\\b\${symbol}\\\\b" .,
        { cwd: this.root, encoding: 'utf8' }
      );
      return output.split('\\n').filter(Boolean).map(line => {
        const [file, lineNum, ...rest] = line.split(':');
        return { file, line: parseInt(lineNum, 10), context: rest.join(':').trim() };
      });
    } catch {
      return [];
    }
  }
}

const index = new SymbolIndex('/path/to/project');

const defns = index.findDefinition('UserService');
defns.forEach(d => console.log(Defined at \${d.file}:\${d.line} (\${d.kind})));

const usages = index.findUsages('validateToken');
console.log(\\nvalidateToken used in \${usages.length} locations);
usages.slice(0, 5).forEach(u => console.log(  \${u.file}:\${u.line}  \${u.context}));`,
        }}
      />

      <h2>Semantic Code Search with Embeddings</h2>
      <p>
        Text search finds exact symbol names but misses semantic matches — "find all functions
        that handle authentication" cannot be answered by grep. Embedding-based semantic search
        encodes code chunks as vectors and retrieves chunks that are semantically similar to a
        natural-language query, enabling agents to navigate unfamiliar codebases by concept.
      </p>

      <SDKExample
        title="Semantic Code Search with Embeddings"
        tabs={{
          python: `import anthropic
import numpy as np
from pathlib import Path

client = anthropic.Anthropic()

def embed_text(text: str) -> list[float]:
    """Get an embedding using a voyage-code-2 model via Anthropic's embedding API."""
    # Note: use the voyage embedding API or OpenAI embeddings in practice
    # This shows the pattern with a placeholder
    import voyageai
    vo = voyageai.Client()
    result = vo.embed([text], model="voyage-code-2")
    return result.embeddings[0]

def cosine_similarity(a: list[float], b: list[float]) -> float:
    a_arr, b_arr = np.array(a), np.array(b)
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr)))

def build_code_index(project_root: str, chunk_lines: int = 30) -> list[dict]:
    """Chunk all Python files and embed them."""
    chunks = []
    for py_file in Path(project_root).rglob("*.py"):
        lines = py_file.read_text().splitlines()
        for i in range(0, len(lines), chunk_lines // 2):  # 50% overlap
            chunk_text = "\\n".join(lines[i:i + chunk_lines])
            if len(chunk_text.strip()) < 50:
                continue
            embedding = embed_text(f"// {py_file}\\n{chunk_text}")
            chunks.append({
                "file": str(py_file),
                "start_line": i + 1,
                "text": chunk_text,
                "embedding": embedding,
            })
    return chunks

def semantic_search(query: str, index: list[dict], top_k: int = 5) -> list[dict]:
    """Find the top-k most relevant code chunks for a natural-language query."""
    query_embedding = embed_text(query)
    scored = [
        {**chunk, "score": cosine_similarity(query_embedding, chunk["embedding"])}
        for chunk in index
    ]
    return sorted(scored, key=lambda x: x["score"], reverse=True)[:top_k]

# Build index once and cache
index = build_code_index("/path/to/project")

# Search
results = semantic_search("authentication token validation", index)
for r in results:
    print(f"Score: {r['score']:.3f}  {r['file']}:{r['start_line']}")
    print(r['text'][:200])
    print("---")`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';

// In practice use voyage-code-2 or text-embedding-3-large
// This pattern works with any embedding provider
async function embedText(text: string): Promise<number[]> {
  const openai = new (await import('openai')).default();
  const resp = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return resp.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

interface CodeChunk {
  file: string;
  startLine: number;
  text: string;
  embedding: number[];
}

async function buildCodeIndex(projectRoot: string, chunkLines = 30): Promise<CodeChunk[]> {
  const files = globSync('**/*.ts', { cwd: projectRoot, ignore: 'node_modules/**' });
  const chunks: CodeChunk[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
    const lines = content.split('\\n');

    for (let i = 0; i < lines.length; i += Math.floor(chunkLines / 2)) {
      const chunkText = lines.slice(i, i + chunkLines).join('\\n');
      if (chunkText.trim().length < 50) continue;

      const embedding = await embedText(// \${file}\\n\${chunkText});
      chunks.push({ file, startLine: i + 1, text: chunkText, embedding });
    }
  }

  return chunks;
}

async function semanticSearch(
  query: string,
  index: CodeChunk[],
  topK = 5
): Promise<(CodeChunk & { score: number })[]> {
  const queryEmbedding = await embedText(query);
  return index
    .map(chunk => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

const index = await buildCodeIndex('/path/to/project');
const results = await semanticSearch('authentication token validation', index);
results.forEach(r => {
  console.log(Score: \${r.score.toFixed(3)}  \${r.file}:\${r.startLine});
  console.log(r.text.slice(0, 200));
  console.log('---');
});`,
        }}
      />

      <h2>Call Graph Analysis</h2>
      <p>
        Call graphs map which functions call which other functions. They are essential for impact
        analysis ("if I change <code>parse_token()</code>, which callers will be affected?") and
        for understanding the execution flow of a feature. Static call graph tools like
        <code>pycallgraph2</code>, <code>madge</code> (JavaScript), or compiler-level tools
        extract these relationships from source code without running it.
      </p>

      <SDKExample
        title="Static Call Graph with pyan"
        tabs={{
          python: `# pip install pyan3
import pyan
import json

def get_call_graph(python_files: list[str]) -> dict[str, list[str]]:
    """
    Build a static call graph for a set of Python files.
    Returns a dict mapping caller -> list of callees.
    """
    callgraph = pyan.create_callgraph(
        filenames=python_files,
        format="json",
        draw_defines=False,
        draw_uses=True,
    )
    graph = json.loads(callgraph)

    # Convert to simple caller -> [callee] dict
    edges: dict[str, list[str]] = {}
    for node in graph.get("nodes", []):
        edges[node["id"]] = []
    for edge in graph.get("edges", []):
        caller = edge["source"]
        callee = edge["target"]
        edges.setdefault(caller, []).append(callee)

    return edges

def find_callers(symbol: str, graph: dict[str, list[str]]) -> list[str]:
    """Find all functions that (directly) call a given symbol."""
    return [
        caller for caller, callees in graph.items()
        if any(symbol in callee for callee in callees)
    ]

def find_transitive_callers(symbol: str, graph: dict[str, list[str]]) -> set[str]:
    """Find all functions that transitively call a given symbol."""
    direct = set(find_callers(symbol, graph))
    all_callers = set(direct)
    queue = list(direct)
    while queue:
        current = queue.pop()
        for upstream in find_callers(current, graph):
            if upstream not in all_callers:
                all_callers.add(upstream)
                queue.append(upstream)
    return all_callers

import glob
py_files = glob.glob("src/**/*.py", recursive=True)
graph = get_call_graph(py_files)

# Impact analysis: who calls validate_token?
callers = find_transitive_callers("validate_token", graph)
print(f"Functions that transitively call validate_token ({len(callers)} total):")
for c in sorted(callers):
    print(f"  {c}")`,
          typescript: `// npm install madge
import { execSync } from 'child_process';
import * as fs from 'fs';

interface CallGraph {
  [module: string]: string[];
}

function buildModuleGraph(projectRoot: string): CallGraph {
  // madge produces a dependency graph (imports, not calls)
  // For a true call graph, use a TypeScript compiler plugin
  const output = execSync(
    npx madge --json src/,
    { cwd: projectRoot, encoding: 'utf8' }
  );
  return JSON.parse(output) as CallGraph;
}

function findTransitiveDependents(
  module: string,
  graph: CallGraph
): Set<string> {
  // Find all modules that import (depend on) this module
  const directDependents = Object.entries(graph)
    .filter(([, deps]) => deps.some(d => d.includes(module)))
    .map(([mod]) => mod);

  const all = new Set<string>(directDependents);
  const queue = [...directDependents];

  while (queue.length > 0) {
    const current = queue.pop()!;
    const upstream = Object.entries(graph)
      .filter(([, deps]) => deps.some(d => d.includes(current)))
      .map(([mod]) => mod);

    for (const up of upstream) {
      if (!all.has(up)) {
        all.add(up);
        queue.push(up);
      }
    }
  }

  return all;
}

const graph = buildModuleGraph('/path/to/project');
const dependents = findTransitiveDependents('auth/tokenValidator', graph);
console.log(Modules that depend on tokenValidator (\${dependents.size} total):);
[...dependents].sort().forEach(m => console.log(  \${m}));`,
        }}
      />

      <WarningBlock title="Structural Analysis Has Limits">
        <p>
          Static analysis cannot see through dynamic dispatch, monkey-patching, metaprogramming,
          or runtime-generated code. Call graphs for heavily dynamic code (Python decorators,
          JavaScript Proxy objects, reflection) may be incomplete. Always combine structural
          analysis with runtime profiling or tracing for highly dynamic codebases. Agents should
          treat static analysis results as strong hints, not ground truth.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Code Understanding Best Practices">
        <ul>
          <li>Provide agents with a project map (file tree + module descriptions) at the start of each session to reduce navigation overhead.</li>
          <li>Use tree-sitter for fast, incremental structural queries — it is far more reliable than regex for code.</li>
          <li>Cache symbol indexes and call graphs between agent runs — rebuilding them on every run is wasteful for large codebases.</li>
          <li>Prefer LSP queries over grep for cross-file symbol resolution in statically-typed languages — they are type-aware.</li>
          <li>For monorepos, scope the agent's analysis to the relevant package or module to avoid context explosion.</li>
          <li>Use semantic code search for discovery tasks and structural tools for precise navigation once a symbol is identified.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Combining Understanding Tools">
        <p>
          The most capable coding agents layer multiple understanding tools: semantic search to
          find relevant code regions, tree-sitter to extract the structure of those regions, LSP
          to resolve types and references, and call graphs to assess impact. Providing all of
          these as agent tools and letting the model choose which to invoke produces better
          results than any single tool alone.
        </p>
      </NoteBlock>
    </article>
  )
}
