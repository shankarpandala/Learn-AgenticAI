import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import FlowDiagram from '../../../components/viz/FlowDiagram.jsx'

const semgrepRules = `rules:
  - id: hardcoded-api-key
    patterns:
      - pattern: |
          $VAR = "..."
      - metavariable-regex:
          metavariable: $VAR
          regex: (api_key|api_token|secret_key|password|passwd|credential)
      - metavariable-regex:
          metavariable: '...'
          regex: '[A-Za-z0-9_\\-]{20,}'
    message: >
      Hardcoded credential detected in $VAR.
      Use environment variables or a secrets manager (e.g. os.environ["$VAR"] or
      the Vault SDK). Committing secrets to git exposes them in history permanently.
    languages: [python, javascript, typescript]
    severity: ERROR
    metadata:
      category: security
      cwe: CWE-798
      confidence: HIGH
      fix-guidance: >
        Replace the literal value with os.environ.get("VAR_NAME") in Python,
        or process.env.VAR_NAME in JavaScript/TypeScript.
        Store the actual secret in your secrets manager (Vault, AWS Secrets Manager,
        GitHub Actions secrets) and inject it at runtime.

  - id: sql-injection-format-string
    pattern: |
      cursor.execute("..." % ...)
    message: >
      SQL injection risk: string formatting used to build a SQL query.
      Use parameterised queries instead: cursor.execute("SELECT ... WHERE id = %s", (user_id,))
    languages: [python]
    severity: ERROR
    metadata:
      category: security
      cwe: CWE-89
      confidence: HIGH

  - id: sql-injection-fstring
    pattern: |
      cursor.execute(f"...")
    message: >
      SQL injection risk: f-string used to build a SQL query.
      f-strings interpolate variables directly into the SQL string, making injection
      possible whenever a variable contains user-supplied input.
      Use parameterised queries: cursor.execute("SELECT ... WHERE id = %s", (user_id,))
    languages: [python]
    severity: ERROR
    metadata:
      category: security
      cwe: CWE-89
      confidence: HIGH

  - id: debug-logging-pii-risk
    patterns:
      - pattern: |
          logging.$LEVEL(f"... {$USER.email} ...")
      - pattern: |
          logging.$LEVEL(f"... {$USER.password} ...")
    message: >
      PII detected in log statement. User email and password fields must not be logged.
      Log the user ID only: logging.$LEVEL(f"user_id={$USER.id}")
    languages: [python]
    severity: WARNING
    metadata:
      category: privacy
      cwe: CWE-532
      confidence: MEDIUM

  - id: jwt-none-algorithm
    patterns:
      - pattern: jwt.decode($TOKEN, algorithms=["none"])
      - pattern: jwt.decode($TOKEN, algorithms=["None"])
    message: >
      The 'none' JWT algorithm disables signature verification entirely.
      This allows an attacker to forge arbitrary tokens. Remove 'none' from the
      algorithms list and explicitly whitelist only the algorithms you support.
    languages: [python]
    severity: ERROR
    metadata:
      category: security
      cwe: CWE-347
      confidence: HIGH
`;

const claudeMdSecurityConfig = `## Security Scanning (Mandatory)

Before committing any code changes, run:
/security-scan

This runs the following checks in order:

1. semgrep --config=.semgrep/ --error
   Applies all custom rules in .semgrep/ plus the auto ruleset.
   Fails (exit code 1) on any finding — --error promotes all findings to errors.

2. bandit -r src/ -ll
   Python-specific checks: hardcoded passwords, use of dangerous functions (eval, exec,
   subprocess with shell=True), weak cryptography, XML injection risks.
   -ll reports medium severity and above.

3. safety check --json
   Scans requirements.txt / pyproject.toml for dependencies with known CVEs.
   Fails on any CVE with CVSS score >= 7.0.

4. pip-audit (if running in a virtualenv)
   Secondary dependency audit using the OSV database.

### Handling Findings

If findings are reported:

CRITICAL / HIGH severity:
  Fix before proceeding. Do not commit, do not request review, do not mark as accepted risk
  without explicit security team sign-off in the PR description.

MEDIUM severity:
  Fix unless you can document a specific, accepted reason in a code comment using the format:
  # nosec RULE-ID: <justification> <date> <author>
  Example: # nosec B106: test-only fixture, never used in production — 2024-11-01 alice@corp.com

LOW severity:
  Document in a code comment if not fixing. Low findings that accumulate into patterns
  will be escalated in quarterly security reviews.

### NEVER do this
- NEVER skip security scanning with git commit --no-verify
- NEVER pipe semgrep output to /dev/null
- NEVER add # nosec without a justification comment
- NEVER mark a CRITICAL finding as accepted risk without a security team ticket number

The /security-scan command is a pre-commit hook AND a CI gate.
Bypassing the pre-commit hook does not bypass CI.
`;

const semgrepJsonParser = `#!/usr/bin/env python3
"""
parse_semgrep_findings.py

Parses Semgrep JSON output and categorises findings for the agent loop.
Used by the /security-scan command to determine whether to auto-fix,
prompt for review, or hard-block a commit.

Usage: semgrep --json --config=.semgrep/ src/ | python parse_semgrep_findings.py
"""
from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from typing import Literal


Severity = Literal["ERROR", "WARNING", "INFO"]

# Semgrep severities mapped to our internal triage categories
SEVERITY_MAP: dict[Severity, str] = {
    "ERROR": "CRITICAL",    # Treat all Semgrep ERRORs as critical
    "WARNING": "MEDIUM",
    "INFO": "LOW",
}

# Rules we can auto-fix with high confidence (no human review required)
AUTO_FIXABLE_RULES: frozenset[str] = frozenset({
    "sql-injection-format-string",
    "sql-injection-fstring",
    "debug-logging-pii-risk",
})


@dataclass
class Finding:
    rule_id: str
    path: str
    line: int
    message: str
    severity: str
    triage_level: str
    auto_fixable: bool

    def __str__(self) -> str:
        fix_hint = " [AUTO-FIXABLE]" if self.auto_fixable else ""
        return (
            f"[{self.triage_level}]{fix_hint} {self.rule_id}\n"
            f"  {self.path}:{self.line}\n"
            f"  {self.message}"
        )


def parse_findings(semgrep_output: dict) -> list[Finding]:
    findings = []
    for result in semgrep_output.get("results", []):
        raw_severity: Severity = result.get("extra", {}).get("severity", "INFO")
        rule_id = result.get("check_id", "unknown").split(".")[-1]
        findings.append(Finding(
            rule_id=rule_id,
            path=result["path"],
            line=result["start"]["line"],
            message=result["extra"]["message"].strip(),
            severity=raw_severity,
            triage_level=SEVERITY_MAP.get(raw_severity, "LOW"),
            auto_fixable=rule_id in AUTO_FIXABLE_RULES,
        ))
    return findings


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError as exc:
        print(f"ERROR: Could not parse Semgrep output: {exc}", file=sys.stderr)
        sys.exit(2)

    findings = parse_findings(data)

    if not findings:
        print("Security scan: PASSED — no findings.")
        sys.exit(0)

    critical = [f for f in findings if f.triage_level == "CRITICAL"]
    medium = [f for f in findings if f.triage_level == "MEDIUM"]
    low = [f for f in findings if f.triage_level == "LOW"]

    print(f"\\nSecurity scan findings: {len(findings)} total")
    print(f"  CRITICAL: {len(critical)}  MEDIUM: {len(medium)}  LOW: {len(low)}\\n")

    for finding in sorted(findings, key=lambda f: f.triage_level):
        print(finding)
        print()

    # Auto-fixable findings are reported but do not block — the agent fixes them
    blocking = [f for f in critical if not f.auto_fixable]
    auto_fix_pending = [f for f in findings if f.auto_fixable]

    if auto_fix_pending:
        rule_ids = ", ".join(f.rule_id for f in auto_fix_pending)
        print(f"Auto-fixable findings ({len(auto_fix_pending)}): {rule_ids}")
        print("The agent will apply fixes. Re-scan will run after fixes are applied.")

    if blocking:
        print(f"\\nBLOCKED: {len(blocking)} critical finding(s) require human review.")
        sys.exit(1)

    # Non-blocking exit — medium/low findings are logged but do not fail CI
    sys.exit(0)


if __name__ == "__main__":
    main()
`;

const banditWorkflow = `# Full security scan workflow used by /security-scan command
# This runs as a pre-commit hook via .pre-commit-config.yaml

set -euo pipefail

echo "=== Running Semgrep ==="
semgrep --config=.semgrep/ --config=p/python --json src/ \\
  | python scripts/parse_semgrep_findings.py

echo "=== Running Bandit ==="
bandit -r src/ -ll -f json \\
  | python -c "
import json, sys
data = json.load(sys.stdin)
highs = [r for r in data.get('results', []) if r['issue_severity'] in ('HIGH', 'MEDIUM')]
if highs:
    for r in highs:
        print(f\\"  [{r['issue_severity']}] {r['test_id']}: {r['issue_text']}\\")
        print(f\\"    {r['filename']}:{r['line_number']}\\")
    sys.exit(1)
print(f\\"Bandit: PASSED ({len(data.get('results', []))} low-severity findings suppressed)\\")
"

echo "=== Running Safety ==="
safety check --json 2>/dev/null \\
  | python -c "
import json, sys
vulns = json.load(sys.stdin)
critical = [v for v in vulns if float(v.get('cvss_v3', 0) or 0) >= 7.0]
if critical:
    for v in critical:
        print(f\\"  [CVE] {v['package_name']} {v['installed_version']}: {v['advisory']}\\")
    sys.exit(1)
print(f\\"Safety: PASSED ({len(vulns)} low-severity CVEs suppressed)\\")
"

echo ""
echo "Security scan: ALL CHECKS PASSED"
`;

export default function SastInAgentLoop() {
  return (
    <div className="lesson-content">
      <h2>Static Analysis Security Testing in the Agent Loop</h2>

      <p>
        Most engineering teams run security scanners in CI — a pipeline that executes after code is
        pushed to a remote branch. For human-paced development, this is adequate: the feedback loop
        is hours, which is fast enough for daily work. For AI-assisted development, where an agent
        can generate and commit dozens of files in minutes, CI-only scanning is not a safety net —
        it is a post-mortem. By the time the scanner runs, the problematic pattern may already be
        in main, referenced by other generated code, or triggering alerts in production.
      </p>

      <p>
        The solution is to move security scanning into the agent loop itself: before any commit,
        before any file is handed off for review, the agent runs the scanner and treats findings
        as blocking conditions. This section explains how to configure that loop and how to write
        custom rules that catch organisation-specific risks that generic rulesets miss.
      </p>

      <ConceptBlock term="SAST in the Agent Loop">
        <p>
          Static Application Security Testing (SAST) analyses source code without executing it,
          identifying patterns that correspond to known vulnerability classes: SQL injection,
          hardcoded credentials, insecure cryptography, PII exposure, and hundreds of others. When
          SAST is integrated into the agent loop — running automatically after every generation
          pass and before any commit — it functions as a continuous quality gate rather than a
          periodic audit. The agent generates code, scans it, reads the findings, fixes what it can
          automatically, re-scans to confirm clean results, and only then proceeds to commit.
        </p>
      </ConceptBlock>

      <NoteBlock type="note" title="IDE SAST vs. Agent-Loop SAST: A Critical Difference">
        <p>
          IDE-integrated SAST (Semgrep's VS Code extension, SonarLint) provides inline feedback
          to a human developer who reads it and decides what to do. Agent-loop SAST is consumed
          programmatically by the agent itself. This changes the requirements entirely. IDE SAST
          can afford false positives because a human filters them. Agent-loop SAST must have high
          precision — too many false positives cause the agent to stall in fix loops or, worse, to
          learn to suppress findings indiscriminately. This is why custom rules with high-confidence
          patterns are more valuable in the agent loop than broad generic rulesets.
        </p>
      </NoteBlock>

      <h2>The Secure Agent Loop</h2>

      <FlowDiagram
        direction="vertical"
        title="SAST-Integrated Agent Code Generation Loop"
        steps={[
          {
            label: "Generate Code",
            description: "Claude generates implementation based on requirements and CLAUDE.md constraints.",
          },
          {
            label: "Run Security Scanner",
            description: "Semgrep + Bandit + Safety run against the generated files. Output is captured as structured JSON.",
          },
          {
            label: "Parse Findings",
            description: "Findings are categorised by severity. AUTO-FIXABLE rules are separated from those requiring human review.",
          },
          {
            label: "Auto-Fix High-Confidence Issues",
            description: "For rules tagged AUTO-FIXABLE, the agent applies the fix pattern (e.g. replace f-string SQL with parameterised query) without human input.",
          },
          {
            label: "Re-Scan",
            description: "Scanner runs again to confirm fixes resolved the finding and did not introduce new ones.",
          },
          {
            label: "Commit Only Clean Code",
            description: "If all critical and high findings are resolved, the agent proceeds to commit. Any remaining blockers halt and escalate to the human.",
          },
        ]}
      />

      <h2>The Scanning Tools</h2>

      <p>
        Each tool in the stack covers a different part of the risk surface. Using all four in
        combination closes gaps that any single tool leaves open.
      </p>

      <PatternBlock
        name="Semgrep: Custom Rules for Organisation-Specific Patterns"
        category="SAST"
        whenToUse="Any codebase where generic rulesets miss organisation-specific patterns: internal API misuse, custom ORM bypass patterns, proprietary data handling rules, or compliance requirements not covered by public rulesets."
      >
        <p>
          Semgrep is a structural pattern-matching tool that understands code syntax rather than
          matching text with regexes. Its rules are written in YAML and can match complex
          multi-statement patterns, track data flow across variable assignments, and apply
          metavariable constraints. This makes it uniquely suited for writing
          organisation-specific rules: you describe the pattern of misuse in terms the tool
          understands, and it catches every instance regardless of variable names or formatting.
        </p>
        <p>
          Semgrep's public registry (semgrep.dev/r) contains thousands of rules for common
          frameworks. The highest leverage work, however, is writing custom rules for patterns
          specific to your codebase — the internal SDK misuse patterns, the compliance violations
          unique to your industry, the forbidden API calls that are project-specific.
        </p>
      </PatternBlock>

      <PatternBlock
        name="Bandit: Python-Specific Security Checks"
        category="SAST"
        whenToUse="Any Python codebase. Bandit is a Python-native tool that catches issues Semgrep's Python rules may miss: subprocess shell injection, weak cryptography defaults, use of assert for security checks, and XML entity expansion."
      >
        <p>
          Bandit uses AST analysis to identify Python-specific security issues. Where Semgrep
          works best for pattern-based rules you define, Bandit's built-in checks cover decades
          of Python security anti-patterns. Key checks include: B106 (hardcoded password in
          function call), B201 (Flask debug mode enabled), B320 (XML parsing with no
          defusedxml), B501-B506 (weak SSL/TLS configuration), and B602-B607 (subprocess
          injection risks).
        </p>
      </PatternBlock>

      <NoteBlock type="note" title="CodeQL and Snyk: When to Add Them">
        <p>
          CodeQL (GitHub Advanced Security) performs deep dataflow analysis — tracking user input
          from entry point to sink — catching vulnerabilities that pattern matching misses. It is
          slower (minutes rather than seconds) and requires GitHub integration, so it is better
          suited as a CI gate than an in-loop pre-commit check. Snyk covers two surfaces: known
          CVEs in dependencies (similar to Safety) and SAST on source code. Add Snyk to the loop
          when you need container image scanning or when your dependency graph is large enough that
          Safety misses transitive vulnerabilities. For most teams, Semgrep + Bandit + Safety in
          the agent loop, with CodeQL in CI, provides the right coverage at the right speed.
        </p>
      </NoteBlock>

      <h2>Custom Semgrep Rules</h2>

      <p>
        Generic rulesets catch generic problems. The most impactful security investment for a
        mature team is writing rules for patterns that are specific to your codebase. The YAML
        below shows five rules that address the most common AI-generated security issues in Python
        services: hardcoded credentials, SQL injection via string formatting, PII in logs, and
        JWT algorithm confusion attacks.
      </p>

      <BestPracticeBlock title="Write Custom Rules Before You Need Them">
        <p>
          The right time to write a Semgrep rule is when you discover a pattern in a code review
          — not after it reaches production. When a reviewer catches "we should never do X in this
          codebase," that observation should immediately become a Semgrep rule in .semgrep/. This
          creates a ratchet: each lesson learned from a review permanently prevents the same
          mistake in all future AI-generated code. Over time, your .semgrep/ directory becomes an
          executable record of your team's security knowledge.
        </p>
      </BestPracticeBlock>

      <CodeBlock language="yaml" filename=".semgrep/credentials-and-injection.yaml">
        {semgrepRules}
      </CodeBlock>

      <h2>Configuring Claude Code for Security Scanning</h2>

      <p>
        The CLAUDE.md configuration below establishes security scanning as a mandatory pre-commit
        step. The key design decisions are: (1) the command is named <code>/security-scan</code>
        so Claude can invoke it as a tool call rather than constructing the command each time,
        (2) severity handling is explicit so Claude knows exactly when to proceed versus when to
        stop and escalate, and (3) bypass mechanisms are explicitly forbidden to prevent the
        agent from taking the path of least resistance when under pressure to complete a task.
      </p>

      <CodeBlock language="text" filename="CLAUDE.md">
        {claudeMdSecurityConfig}
      </CodeBlock>

      <SecurityCallout
        title="Never Bypass Security Scanning — The Bypass Is the Vulnerability"
        severity="critical"
      >
        <p>
          The most dangerous pattern in AI-assisted development is an agent that learns to
          suppress, skip, or silence security findings in order to complete a task. This can
          happen in subtle ways: adding <code># nosec</code> without justification, piping scanner
          output to <code>/dev/null</code>, using <code>git commit --no-verify</code>, or
          silently increasing severity thresholds. Each of these actions constitutes a security
          control bypass — and unlike human developers who bypass controls intentionally and with
          awareness of the risk, an agent may do so as a mechanical response to a failing step
          with no understanding of the consequences.
        </p>
        <p>
          CLAUDE.md must explicitly forbid every bypass mechanism you can name. If your agent
          has shell access, it can bypass pre-commit hooks. If it can edit pyproject.toml, it can
          raise safety thresholds. Enumerate the specific bypass paths and mark them forbidden.
        </p>
      </SecurityCallout>

      <h2>Making Findings Actionable</h2>

      <p>
        A scanner that reports fifty findings per run, most of them low-severity informational
        notes, will be suppressed by agents and humans alike. The goal is a findings pipeline that
        surfaces only what requires action, clearly categorises what can be auto-fixed versus what
        requires human judgment, and produces output the agent can consume programmatically.
      </p>

      <CodeBlock language="python" filename="scripts/parse_semgrep_findings.py">
        {semgrepJsonParser}
      </CodeBlock>

      <CodeBlock language="bash" filename="scripts/security-scan.sh">
        {banditWorkflow}
      </CodeBlock>

      <BestPracticeBlock title="Triage by Severity, Auto-Fix When Confident">
        <p>
          Not all security findings require human intervention. SQL injection via f-string is a
          mechanical transformation: replace the f-string with a parameterised query. PII in logs
          is similarly mechanical: replace the field reference with the ID field. For these
          patterns, having the agent apply the fix automatically — and then re-scan to confirm —
          is both faster and safer than interrupting the human for a trivial change.
        </p>
        <p>
          Reserve human escalation for findings where the fix requires judgment: a hardcoded
          credential where the correct secrets manager path is not obvious, a missing
          authentication check where the correct auth mechanism depends on architecture context,
          or any finding involving data exposure where the correct response may be architectural
          rather than code-level. The parsing script above implements exactly this distinction
          via the AUTO_FIXABLE_RULES set.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Measure Your Security Debt Over Time">
        <p>
          Track the number of security findings per thousand lines of code over time. In a healthy
          AI-assisted workflow with SAST in the agent loop, this metric should trend downward as
          your custom Semgrep rules encode more organisation-specific constraints and the agent
          internalises them via CLAUDE.md. A rising trend indicates that either your rules are
          not covering the patterns being generated, or the agent is finding paths around the
          scanning step. Both are worth investigating immediately.
        </p>
      </NoteBlock>
    </div>
  )
}
