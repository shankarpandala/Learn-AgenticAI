import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function SASTInAgentLoop() {
  return (
    <div>
      <ConceptBlock title="SAST in the Agent Loop">
        <p>
          Most engineering teams run security scanners in CI — a pipeline that executes after
          code is pushed to a remote branch. For human-paced development, this is adequate: the
          feedback loop is measured in hours, which is fast enough for daily work. For
          AI-assisted development, where an agent can generate and commit dozens of files in
          minutes, CI-only scanning is not a safety net — it is a post-mortem.
        </p>
        <p>
          The solution is to integrate Static Application Security Testing (SAST) tools —
          Semgrep, Bandit, CodeQL, Snyk — directly into the Claude Code agent loop. Instead of
          running security scans after code is written and hoping engineers fix findings, Claude
          runs the scanner itself, reads the findings, and fixes issues before the engineer ever
          sees the code. Security shifts all the way left: into the generation step itself.
        </p>
        <p>
          When Claude writes code, it immediately runs the scanner, reads structured JSON output,
          fixes every critical and high finding, re-runs to confirm zero findings, and only then
          presents the code to the engineer. The engineer receives code that has already passed a
          security scan — not code that needs one.
        </p>
      </ConceptBlock>

      <PatternBlock title="Scan-Fix-Verify Loop">
        <p>
          The security loop runs inside every Claude Code generation session. It is not a
          separate step that happens afterward — it is part of what "writing code" means when
          Claude is doing it.
        </p>
        <ol>
          <li>
            <strong>Claude writes code.</strong> Claude generates the implementation based on
            requirements and CLAUDE.md constraints.
          </li>
          <li>
            <strong>Claude runs Semgrep/Bandit.</strong> Immediately after writing files, Claude
            runs the configured scanners against the changed files. Output is captured as
            structured JSON — not displayed to the user, consumed by Claude itself.
          </li>
          <li>
            <strong>Claude reads findings.</strong> Claude parses the JSON output, categorises
            findings by severity, and identifies which are auto-fixable versus which require
            human judgment.
          </li>
          <li>
            <strong>Claude fixes each finding.</strong> For each critical and high finding,
            Claude reads the flagged file and line number, understands the root cause, and
            applies a fix that eliminates the vulnerability — not a suppression comment, not a
            threshold adjustment, an actual fix.
          </li>
          <li>
            <strong>Claude re-runs the scanner to verify zero findings.</strong> After fixing,
            Claude runs the scanner again on the same files. If new findings appear or old ones
            remain, the fix-verify loop repeats. Claude does not stop until the scanner reports
            clean.
          </li>
          <li>
            <strong>Only then does Claude present code to the engineer.</strong> The engineer
            receives code that has already cleared the security bar. Code review focuses on
            architecture and correctness, not on catching SQL injections.
          </li>
        </ol>
      </PatternBlock>

      <h3>The /security-scan Custom Command</h3>
      <p>
        The <code>/security-scan</code> command is a Claude Code custom command defined in
        <code>.claude/commands/security-scan.md</code>. It encodes the full scanning workflow
        as a reusable instruction set. Claude invokes it as a named command rather than
        reconstructing the scanning steps from memory each time.
      </p>

      <CodeBlock language="yaml" filename=".claude/commands/security-scan.md">
        {`# /security-scan

Run the following security scanners on changed files and fix all critical/high findings:

## Steps
1. Run Semgrep with org ruleset:
   \`semgrep --config=p/owasp-top-ten --config=.semgrep/custom-rules.yml --json src/\`

2. Run Bandit for Python:
   \`bandit -r src/ -f json -ll\`

3. Run Snyk for dependencies:
   \`snyk test --json\`

4. For each CRITICAL or HIGH finding:
   - Read the file and line number
   - Understand why it's a finding
   - Apply a fix that eliminates the root cause (not just suppresses)
   - Re-run the specific scanner to confirm fixed

5. For MEDIUM findings: report them with explanation, do not auto-fix

6. Produce a security scan report: findings found, findings fixed, findings remaining

## Rules
- Never suppress findings with nosec/noqa comments unless you explain why it's a false positive
- Never change logic to avoid the scan; fix the actual vulnerability
- If you can't fix a finding safely, escalate to the engineer`}
      </CodeBlock>

      <SDKExample
        title="Security Scanner MCP Server"
        tabs={[
          {
            label: "python",
            language: "python",
            filename: "mcp_servers/security_scanner.py",
            code: `# mcp_servers/security_scanner.py
import subprocess
import json
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

server = Server("security-scanner")

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="run_semgrep",
            description="Run Semgrep SAST scan on a directory and return findings as JSON",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Directory or file to scan"},
                    "config": {"type": "string", "default": "p/owasp-top-ten", "description": "Semgrep ruleset"}
                },
                "required": ["path"]
            }
        ),
        types.Tool(
            name="run_bandit",
            description="Run Bandit Python security scanner",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Python file or directory to scan"},
                    "severity": {"type": "string", "enum": ["LOW", "MEDIUM", "HIGH"], "default": "MEDIUM"}
                },
                "required": ["path"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "run_semgrep":
        result = subprocess.run(
            ["semgrep", "--config", arguments.get("config", "p/owasp-top-ten"),
             "--json", arguments["path"]],
            capture_output=True, text=True, timeout=120
        )
        findings = json.loads(result.stdout) if result.stdout else {"results": []}
        critical = [f for f in findings.get("results", []) if f.get("extra", {}).get("severity") in ("ERROR", "WARNING")]
        return [types.TextContent(type="text", text=json.dumps({
            "total_findings": len(findings.get("results", [])),
            "critical_high": len(critical),
            "findings": critical[:20]  # Top 20 to stay within context
        }, indent=2))]

    elif name == "run_bandit":
        result = subprocess.run(
            ["bandit", "-r", arguments["path"], "-f", "json",
             f"-l{'l' if arguments.get('severity') == 'LOW' else ''}"],
            capture_output=True, text=True, timeout=60
        )
        return [types.TextContent(type="text", text=result.stdout or result.stderr)]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())`,
          },
        ]}
      />

      <p>
        By exposing the scanners as MCP tools, Claude gains structured access to security
        findings without needing to parse shell output from scratch each time. The
        <code>run_semgrep</code> tool returns only the top 20 critical/high findings to stay
        within context window limits — enough for a fix loop, without flooding the conversation.
        Claude can call these tools in sequence, fix findings between calls, and call again to
        confirm resolution.
      </p>

      <h3>Custom Semgrep Rules for Organization-Specific Patterns</h3>
      <p>
        Generic rulesets (p/owasp-top-ten, p/python) catch well-known vulnerability classes.
        The highest-leverage security investment for a mature team is writing custom rules for
        patterns specific to their codebase: internal SDK misuse, proprietary data handling
        requirements, compliance rules unique to the industry. Each custom rule encodes a lesson
        learned from a code review and permanently prevents the same mistake in all future
        AI-generated code.
      </p>

      <CodeBlock language="yaml" filename=".semgrep/custom-rules.yml">
        {`rules:
  - id: no-raw-sql-fstrings
    pattern: |
      db.execute(f"...")
    message: "SQL injection risk: never use f-strings in SQL. Use parameterized queries."
    severity: ERROR
    languages: [python]

  - id: no-pii-in-logs
    patterns:
      - pattern: logging.$FUNC(..., user.email, ...)
      - pattern: logger.$FUNC(..., request.json(), ...)
    message: "Potential PII in logs. Use mask_sensitive() before logging user data."
    severity: WARNING
    languages: [python]

  - id: jwt-not-in-localstorage
    pattern: localStorage.setItem("token", ...)
    message: "JWT in localStorage is vulnerable to XSS. Use httpOnly cookies."
    severity: ERROR
    languages: [javascript, typescript]

  - id: no-md5-for-passwords
    pattern: hashlib.md5(...)
    message: "MD5 is cryptographically broken. Use bcrypt or argon2 for passwords."
    severity: ERROR
    languages: [python]`}
      </CodeBlock>

      <p>
        Notice that each rule encodes not just what is forbidden but why. The message field is
        what Claude reads when the scanner fires. A message that says "SQL injection risk: never
        use f-strings in SQL. Use parameterized queries." gives Claude enough context to apply
        the correct fix without additional prompting. Write messages for Claude to act on, not
        just for humans to read.
      </p>

      <SecurityCallout severity="critical">
        The <code>nosec</code> comment is a security debt marker, not a fix. Every{' '}
        <code># nosec</code> in your codebase is a finding that was suppressed instead of fixed.
        When Claude encounters a finding it cannot fix cleanly, the correct behavior is to
        escalate to the engineer — not to add a suppression comment and move on. Require PR
        comments explaining every nosec, tied to a specific rule ID and a justification. Audit
        them in quarterly security reviews. A codebase where nosec comments accumulate
        unchecked is one where the security scanning is producing theater rather than protection.
      </SecurityCallout>

      <h3>Integrating SAST into CI as a Gate</h3>
      <p>
        The in-loop scanning catches issues before commit. The CI gate is a second, independent
        verification: even if the pre-commit scanning is bypassed or misconfigured, the CI
        pipeline catches it before the code reaches main. Both layers are required. The in-loop
        scan catches issues fast and cheaply. The CI gate is the enforcement mechanism that
        cannot be bypassed.
      </p>

      <CodeBlock language="yaml" filename=".github/workflows/security.yml">
        {`name: Security Scan
on: [pull_request]

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/owasp-top-ten
            p/python
            .semgrep/custom-rules.yml
          auditOn: push
          generateSarif: "1"
      - name: Run Bandit
        run: |
          pip install bandit
          bandit -r src/ -ll --exit-zero -f json -o bandit-report.json
          python scripts/check_bandit_results.py bandit-report.json
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif`}
      </CodeBlock>

      <p>
        The SARIF upload integrates findings directly into the GitHub PR interface: each finding
        appears as an inline annotation on the diff, at the exact line where the issue was
        detected. Reviewers see security issues in context without switching to a separate
        dashboard. When Claude's in-loop scanning is working correctly, this CI step should
        produce zero findings — it is verifying that the in-loop scan did its job.
      </p>

      <BestPracticeBlock title="Make SAST a Required Check, Not an Advisory One">
        Run SAST on every PR, not just on main. The cost of fixing a SQL injection after merge
        is 10x the cost of fixing it before. Make the SAST CI job a required status check —
        not optional, not advisory. If it is advisory, it will be ignored. Engineers under
        deadline pressure will merge with failing advisory checks and tell themselves they will
        fix it later. Later never comes. Required checks cannot be ignored; they must be
        addressed or explicitly overridden with documented justification. The friction is
        intentional: security findings should require effort to bypass.
      </BestPracticeBlock>

      <NoteBlock type="tip">
        Start with <code>p/owasp-top-ten</code> as your Semgrep baseline. Add custom rules one
        at a time as you discover organization-specific patterns — when a code review catches
        something the baseline missed, that becomes a rule. A focused ruleset with zero false
        positives is worth more than a comprehensive ruleset that engineers learn to ignore.
        Every false positive erodes trust in the scanner and trains Claude to suppress findings
        rather than fix them. Precision matters more than recall when the scanner is running in
        an automated loop.
      </NoteBlock>
    </div>
  )
}
