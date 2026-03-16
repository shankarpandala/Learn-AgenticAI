import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function EditVerifyLoop() {
  return (
    <article className="prose-content">
      <h2>The Edit-Verify Loop</h2>
      <p>
        The edit-verify loop is the fundamental pattern of reliable coding agents. The idea is
        simple: make the smallest meaningful code change, immediately verify it is correct with
        automated checks, and only then proceed. Repeat until the task is complete. This pattern
        prevents error accumulation — where multiple unverified changes create cascading failures
        that are much harder to diagnose than a single failing test caught right after the edit.
      </p>

      <ConceptBlock term="Edit-Verify Loop">
        <p>
          A recurring cycle in which an agent (1) makes a targeted code change, (2) runs automated
          verification tools (tests, linter, type checker), (3) observes the results, (4) fixes any
          failures, and (5) repeats until all checks pass. The loop terminates when the full
          verification suite is green or the agent determines the task requires human input.
        </p>
      </ConceptBlock>

      <h2>The Four Verification Layers</h2>
      <p>
        A robust edit-verify loop uses multiple verification layers in order of increasing cost:
      </p>
      <ol>
        <li><strong>Syntax check</strong> — Catch parse errors immediately (<code>python -m py_compile</code>, <code>tsc --noEmit</code>). Runs in milliseconds.</li>
        <li><strong>Linter</strong> — Catch style and common logic errors (<code>ruff check</code>, <code>eslint</code>). Runs in seconds.</li>
        <li><strong>Type checker</strong> — Catch type mismatches (<code>mypy</code>, <code>pyright</code>). Runs in seconds to minutes.</li>
        <li><strong>Tests</strong> — Verify behaviour correctness (<code>pytest -x</code>). Runs in seconds to minutes.</li>
      </ol>
      <p>
        Run cheaper checks first. If syntax fails, skip the linter. If linting fails, skip the
        type checker. This avoids wasting time on slow checks when a fast check already shows
        the change is broken.
      </p>

      <SDKExample
        title="Edit-Verify Loop Implementation"
        tabs={{
          python: `import subprocess
import anthropic
import json
from pathlib import Path

client = anthropic.Anthropic()

def run_verification(project_dir: str) -> dict:
    """Run the full verification suite. Returns pass/fail for each layer."""
    results = {}

    # 1. Syntax check (fast)
    r = subprocess.run(
        ["python", "-m", "py_compile"] +
        [str(p) for p in Path(project_dir).rglob("*.py")],
        capture_output=True, text=True, timeout=10, cwd=project_dir,
    )
    results["syntax"] = {"passed": r.returncode == 0, "output": r.stderr[:1000]}

    if not results["syntax"]["passed"]:
        return results  # skip slower checks

    # 2. Linting (fast)
    r = subprocess.run(
        ["ruff", "check", ".", "--output-format=concise"],
        capture_output=True, text=True, timeout=15, cwd=project_dir,
    )
    results["lint"] = {"passed": r.returncode == 0, "output": (r.stdout + r.stderr)[:2000]}

    # 3. Type checking (medium)
    r = subprocess.run(
        ["mypy", "src/", "--ignore-missing-imports", "--no-error-summary"],
        capture_output=True, text=True, timeout=60, cwd=project_dir,
    )
    results["types"] = {"passed": r.returncode == 0, "output": (r.stdout + r.stderr)[:2000]}

    # 4. Tests (slowest — only if everything else passes)
    if all(v["passed"] for v in results.values()):
        r = subprocess.run(
            ["pytest", "tests/", "-x", "--tb=short", "-q"],
            capture_output=True, text=True, timeout=120, cwd=project_dir,
        )
        results["tests"] = {
            "passed": r.returncode == 0,
            "output": (r.stdout + r.stderr)[-2000:],  # last 2000 chars most relevant
        }

    return results

def format_verification_result(results: dict) -> str:
    """Format verification results for the model."""
    lines = []
    for check, result in results.items():
        status = "PASS" if result["passed"] else "FAIL"
        lines.append(f"[{status}] {check.upper()}")
        if not result["passed"]:
            lines.append(result["output"])
    return "\\n".join(lines)

# The agent loop
def edit_verify_agent(task: str, project_dir: str, max_iterations: int = 10):
    messages = [{"role": "user", "content": task}]
    tools = [
        {
            "name": "read_file",
            "description": "Read a file from the project",
            "input_schema": {
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "required": ["path"],
            },
        },
        {
            "name": "edit_file",
            "description": "Replace a string in a file",
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
        {
            "name": "verify",
            "description": "Run syntax check, linting, type checking, and tests",
            "input_schema": {"type": "object", "properties": {}},
        },
    ]

    for i in range(max_iterations):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            system=(
                "You are a coding agent. Use read_file before editing, "
                "always call verify after each edit, and fix all failures before proceeding. "
                "Only respond with plain text (no tool calls) when the task is complete."
            ),
            tools=tools,
            messages=messages,
        )

        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            print("Task complete.")
            break

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            if block.name == "read_file":
                try:
                    with open(block.input["path"]) as f:
                        result = f.read()
                except FileNotFoundError:
                    result = f"File not found: {block.input['path']}"
            elif block.name == "edit_file":
                try:
                    with open(block.input["path"]) as f:
                        content = f.read()
                    new_content = content.replace(block.input["old_string"], block.input["new_string"], 1)
                    with open(block.input["path"], "w") as f:
                        f.write(new_content)
                    result = f"Edited {block.input['path']}"
                except Exception as e:
                    result = f"Edit failed: {e}"
            elif block.name == "verify":
                results = run_verification(project_dir)
                result = format_verification_result(results)
                print(f"Iteration {i+1} verification:\\n{result}\\n")
            else:
                result = "Unknown tool"

            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": result,
            })

        messages.append({"role": "user", "content": tool_results})

    return messages`,
        }}
      />

      <h2>Automatic Fix Patterns</h2>
      <p>
        Some verification failures have deterministic fixes. Running auto-fix tools before
        invoking the model reduces the number of LLM iterations needed:
      </p>

      <SDKExample
        title="Auto-fix Before Verification"
        tabs={{
          python: `import subprocess

def auto_fix_and_verify(project_dir: str) -> dict:
    """Apply deterministic fixes first, then verify."""

    # Auto-fix linting issues (safe: only fixes style, not logic)
    subprocess.run(["ruff", "check", ".", "--fix"], cwd=project_dir, capture_output=True)
    subprocess.run(["ruff", "format", "."], cwd=project_dir, capture_output=True)

    # Run verification after auto-fixes
    return run_verification(project_dir)

# In the agent loop, call auto_fix_and_verify instead of run_verification
# This way the model only sees failures that require human (or LLM) reasoning to fix`,
        }}
      />

      <PatternBlock title="Checkpoint-and-Commit Pattern">
        <p>
          Combine the edit-verify loop with git commits to create safe checkpoints:
        </p>
        <ol>
          <li>Make the targeted edit</li>
          <li>Run verification — if any check fails, fix and re-verify (do not commit)</li>
          <li>Once all checks pass, run <code>git add -p</code> and <code>git commit</code></li>
          <li>Move on to the next sub-task</li>
        </ol>
        <p>
          Small, green commits give the agent (and you) safe rollback points. If a later change
          breaks something unexpected, <code>git bisect</code> quickly identifies the culprit.
        </p>
      </PatternBlock>

      <WarningBlock title="Never Skip the Verify Step">
        <p>
          The most common mistake in coding agent implementations is batching multiple edits before
          verifying. Even experienced developers underestimate how often a change that looks correct
          breaks something unexpected. Require the agent to call verify after <em>every</em> edit,
          even when it is confident the change is trivial. The cost is a few seconds of CI time;
          the benefit is catching cascading errors early.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Edit-Verify Loop Best Practices">
        <ul>
          <li>Use <code>pytest -x</code> (stop at first failure) to keep test output short and focused — the agent reads the full output.</li>
          <li>Cap verification output at 3000 characters before returning it to the model — long tracebacks waste context budget.</li>
          <li>Run linting with <code>--fix</code> automatically; only report unfixed issues to the model.</li>
          <li>Track total iterations and token spend — a well-tuned agent should complete most tasks in 3–8 iterations.</li>
          <li>For large codebases, run only the tests relevant to the changed files using <code>pytest --co -q</code> to collect test IDs and filter by changed module.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Measure Verification Time">
        <p>
          Profile your verification suite. If tests take more than 30 seconds, the agent will be
          slow and expensive. Invest in test speed: use in-memory databases, mock external services,
          and run only the tests relevant to the changed code. A fast feedback loop is the single
          most important factor in edit-verify loop performance.
        </p>
      </NoteBlock>
    </article>
  )
}
