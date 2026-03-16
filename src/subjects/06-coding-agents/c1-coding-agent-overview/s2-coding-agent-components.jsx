import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function CodingAgentComponents() {
  return (
    <article className="prose-content">
      <h2>Coding Agent Components</h2>
      <p>
        A coding agent is not a single model call — it is a system built from several cooperating
        components. Understanding each component helps you design agents that are reliable,
        debuggable, and easy to extend. The core loop is: observe the codebase, reason about the
        next action, act via a tool, and observe the result. The components described here implement
        each phase of that loop.
      </p>

      <ConceptBlock term="Tool Layer">
        <p>
          The tool layer is the agent's interface to the outside world. Each tool is a function
          with a well-defined JSON schema: the model generates valid arguments, the runtime
          executes the function, and the result is returned as a string in the next context window.
          Tools are the only mechanism through which a coding agent can read files, run code, or
          communicate with external services.
        </p>
      </ConceptBlock>

      <h2>Core Tool Categories</h2>

      <h3>1. File System Tools</h3>
      <p>
        File system tools give the agent read and write access to source files. At minimum you need
        read, write, and targeted-edit capabilities. A targeted edit (replacing a specific string)
        is safer than a full rewrite because it leaves unchanged lines untouched and fails loudly
        when the target string is not found, forcing the agent to re-read before retrying.
      </p>

      <SDKExample
        title="File System Tool Definitions"
        tabs={{
          python: `import anthropic
import os

client = anthropic.Anthropic()

FILE_TOOLS = [
    {
        "name": "read_file",
        "description": "Read the full contents of a file from disk.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Absolute path to the file"},
                "offset": {"type": "integer", "description": "Line number to start reading from"},
                "limit": {"type": "integer", "description": "Maximum lines to return"},
            },
            "required": ["path"],
        },
    },
    {
        "name": "write_file",
        "description": "Write content to a file, creating it if it does not exist.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"},
            },
            "required": ["path", "content"],
        },
    },
    {
        "name": "edit_file",
        "description": "Replace an exact string in a file. Fails if old_string is not unique.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "old_string": {"type": "string"},
                "new_string": {"type": "string"},
            },
            "required": ["path", "old_string", "new_string"],
        },
    },
]

def read_file(path: str, offset: int = 0, limit: int | None = None) -> str:
    with open(path) as f:
        lines = f.readlines()
    lines = lines[offset:offset + limit] if limit else lines[offset:]
    return "".join(f"{offset + i + 1}\\t{line}" for i, line in enumerate(lines))

def write_file(path: str, content: str) -> str:
    with open(path, "w") as f:
        f.write(content)
    return f"Wrote {len(content)} chars to {path}"

def edit_file(path: str, old_string: str, new_string: str) -> str:
    with open(path) as f:
        content = f.read()
    count = content.count(old_string)
    if count == 0:
        raise ValueError(f"old_string not found in {path} — re-read the file first")
    if count > 1:
        raise ValueError(f"old_string appears {count} times in {path} — must be unique")
    with open(path, "w") as f:
        f.write(content.replace(old_string, new_string, 1))
    return f"Edit applied to {path}"`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

const client = new Anthropic();

function readFile(path: string, offset = 0, limit?: number): string {
  const lines = fs.readFileSync(path, 'utf8').split('\\n');
  const slice = limit ? lines.slice(offset, offset + limit) : lines.slice(offset);
  return slice.map((l, i) => \${offset + i + 1}\\t\${l}).join('\\n');
}

function writeFile(path: string, content: string): string {
  fs.writeFileSync(path, content, 'utf8');
  return Wrote \${content.length} chars to \${path};
}

function editFile(path: string, oldString: string, newString: string): string {
  const content = fs.readFileSync(path, 'utf8');
  const count = content.split(oldString).length - 1;
  if (count === 0) throw new Error(old_string not found in \${path});
  if (count > 1) throw new Error(old_string appears \${count} times — must be unique);
  fs.writeFileSync(path, content.replace(oldString, newString), 'utf8');
  return Edit applied to \${path};
}`,
        }}
      />

      <h3>2. Terminal Execution Tool</h3>
      <p>
        The terminal tool executes shell commands and captures stdout and stderr. This is the most
        powerful — and most dangerous — tool in a coding agent. Always add a timeout, a working
        directory constraint, and consider a process-level sandbox for untrusted code. Always
        capture stderr so the agent can read error messages.
      </p>

      <SDKExample
        title="Safe Bash Execution Tool"
        tabs={{
          python: `import subprocess

def bash(command: str, timeout: int = 30, cwd: str | None = None) -> str:
    """Execute a shell command and return combined stdout + stderr."""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd,
        )
        output = result.stdout
        if result.stderr:
            output += "\\nSTDERR:\\n" + result.stderr
        if result.returncode != 0:
            output += f"\\nExit code: {result.returncode}"
        return output[:4000] or "(no output)"  # cap at 4000 chars
    except subprocess.TimeoutExpired:
        return f"Command timed out after {timeout}s"
    except Exception as e:
        return f"Execution error: {e}"

# Usage in agent loop
result = bash("pytest tests/ -x --tb=short", timeout=60, cwd="/home/user/project")
print(result)`,
        }}
      />

      <h3>3. Code Search Tools</h3>
      <p>
        Glob finds files by name pattern; grep searches file contents with regular expressions.
        Together they let the agent navigate large codebases without reading every file — finding
        class definitions, all usages of a function, or all test files in a project.
      </p>

      <SDKExample
        title="Glob and Grep Tool Implementations"
        tabs={{
          python: `import glob as glob_module
import subprocess
import os

def glob_files(pattern: str, path: str = ".") -> str:
    """Find files matching a glob pattern, sorted by modification time."""
    matches = glob_module.glob(os.path.join(path, pattern), recursive=True)
    matches.sort(key=lambda p: os.path.getmtime(p), reverse=True)
    if not matches:
        return "No files matched"
    return "\\n".join(matches[:100])  # cap at 100

def grep_files(pattern: str, path: str = ".", file_glob: str = "*") -> str:
    """Search file contents using ripgrep."""
    cmd = ["rg", "--glob", file_glob, "-n", "--max-count=5", pattern, path]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
    output = result.stdout or result.stderr or "No matches"
    lines = output.splitlines()
    if len(lines) > 200:
        lines = lines[:200] + [f"... ({len(lines) - 200} more lines truncated)"]
    return "\\n".join(lines)

# Find all Python test files
print(glob_files("**/test_*.py", path="/home/user/project"))

# Find all usages of authenticate()
print(grep_files(r"authenticate\\(", path="/home/user/project", file_glob="*.py"))`,
        }}
      />

      <h3>4. Test Runner Tool</h3>
      <p>
        The test runner executes the project's test suite and returns structured results. Parsing
        output into pass/fail counts and error messages lets the agent reason about test results
        without processing noisy raw output.
      </p>

      <SDKExample
        title="Structured Test Runner"
        tabs={{
          python: `import subprocess
import re

def run_tests(path: str = ".", pattern: str = "") -> dict:
    """Run pytest and return structured results."""
    cmd = ["pytest", path, "-x", "--tb=short", "-q"]
    if pattern:
        cmd += ["-k", pattern]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    output = result.stdout + result.stderr

    summary_match = re.search(r"(\\d+ (?:failed|passed|error)[^\\n]*)", output)

    return {
        "passed": result.returncode == 0,
        "exit_code": result.returncode,
        "output": output[-3000:],  # last 3000 chars is usually most relevant
        "summary": summary_match.group(1) if summary_match else "unknown",
    }

result = run_tests(path="tests/auth/")
if not result["passed"]:
    print("Tests failed:", result["summary"])
    print(result["output"])`,
        }}
      />

      <h3>5. Git Tools</h3>
      <p>
        Git tools let the agent inspect history, create checkpoints, and diff changes. Core
        operations: <code>git diff</code> to see what changed, <code>git status</code> for
        untracked files, <code>git log --oneline</code> for recent history, and
        <code>git commit</code> to create a safe rollback point after a successful change.
      </p>

      <PatternBlock title="Tool Composition in the Agent Loop">
        <p>
          Effective coding agents compose tools in a predictable order each cycle:
        </p>
        <ol>
          <li><strong>Search</strong> — Glob/grep to locate relevant files quickly</li>
          <li><strong>Read</strong> — Read the specific files needed for context</li>
          <li><strong>Reason</strong> — Plan the minimal change required</li>
          <li><strong>Edit</strong> — Apply a targeted edit (prefer over full rewrite)</li>
          <li><strong>Verify</strong> — Run tests or linter to confirm correctness</li>
          <li><strong>Commit</strong> — Create a git checkpoint if verification passes</li>
        </ol>
        <p>
          Skipping the verify step causes error accumulation. Multiple broken changes are
          much harder to diagnose than one failing test caught immediately after the edit.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Tool Design Best Practices">
        <ul>
          <li>Truncate all tool outputs to a reasonable length (e.g., 4000 chars) before returning to the model — large outputs waste context window budget.</li>
          <li>Include exit codes in bash output so the agent knows if a command failed.</li>
          <li>Make edit tools fail loudly when the target string is ambiguous or missing rather than silently applying a wrong change.</li>
          <li>Add a <code>timeout</code> to every tool that calls external processes.</li>
          <li>Log every tool call and result to a file for post-hoc debugging and cost tracking.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Start Minimal">
        <p>
          A working coding agent needs only four tools to start: read file, write file, bash, and
          glob. Add search, git, and LSP tools incrementally as you discover limitations. Each new
          tool increases the model's decision space and the surface area for mistakes.
        </p>
      </NoteBlock>
    </article>
  )
}
