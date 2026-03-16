import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function AutomatedQualityGates() {
  return (
    <article className="prose-content">
      <h1>Automated Quality Gates</h1>

      <p>
        Quality gates are automated checks that enforce standards at specific points in the development
        workflow. In Vibe Engineering, they operate at three levels: inside the Claude session (before
        you see the output), at commit time (pre-commit hooks), and in CI (before the PR can merge).
        Each level serves a different purpose and catches a different class of issue.
      </p>

      <p>
        The goal is that by the time a PR reaches human review, the mechanical quality checks have
        already passed. Reviewers focus on architectural judgment and business correctness — not on
        pointing out missing semicolons, obvious security issues, or failing tests. This keeps review
        fast and meaningful.
      </p>

      <ConceptBlock title="The Three-Layer Quality Gate">
        <strong>Layer 1 — Agent Loop:</strong> Claude runs checks after each code change and fixes
        issues before reporting completion. The engineer never sees code that fails these checks.
        <br /><br />
        <strong>Layer 2 — Pre-commit:</strong> Hooks run when the engineer commits. They catch issues
        that slip through the agent loop — for example, secrets accidentally added to test files.
        Fast hooks only (lint, format, secret scanning). Slow checks do not belong here.
        <br /><br />
        <strong>Layer 3 — CI Pipeline:</strong> Full checks run on every PR. All tests, full SAST,
        coverage thresholds, build verification, dependency audits. PRs cannot merge until all checks
        pass. This is the final gate before code enters the main branch.
      </ConceptBlock>

      <h2>Agent Loop Quality Gates (CLAUDE.md)</h2>

      <p>
        The agent loop gates are configured in CLAUDE.md. They run inside Claude's session, before
        the output reaches you. This is the fastest and highest-leverage layer — every fix Claude
        makes in response to a failing gate takes seconds; the same fix requested via a PR comment
        takes hours.
      </p>

      <CodeBlock language="markdown" filename="CLAUDE.md (Agent Loop Gates)">
{`## Quality Gate Sequence

After every code change, run the following checks in order.
Do NOT report a task complete until all checks pass.

### TypeScript/Node
bash
npm run build              # Fails on type errors or build errors
npm test                   # All tests must pass
npm run lint               # Zero warnings, zero errors
npm audit --audit-level=high  # No HIGH/CRITICAL CVEs


### Python/FastAPI
bash
ruff check src/            # Linting — zero issues
ruff format src/ --check   # Formatting — must match ruff format
mypy src/                  # Type check — zero errors
pytest --tb=short          # All tests must pass
bandit -r src/ -ll         # Security — no HIGH findings


### If a check fails
1. Read the error output carefully
2. Fix the issue
3. Re-run ALL checks from the beginning
4. Do not re-run only the failing check — previous checks may now fail

### Reporting
When complete, include in your response:
- Number of tests run and passed
- Lines of code changed (additions/deletions)
- Any lint warnings you fixed
- Any security findings you remediated`}
      </CodeBlock>

      <h2>Pre-Commit Hooks</h2>

      <p>
        Pre-commit hooks are the commit-time gate. They should be fast (under 10 seconds) and focused
        on things that are cheap to check but expensive to miss: secret scanning, basic formatting,
        and syntax errors. Slow checks in pre-commit hooks frustrate engineers and get bypassed.
      </p>

      <CodeBlock language="yaml" filename=".pre-commit-config.yaml">
{`repos:
  # Secret scanning — highest priority
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  # Git-leaks as a second secret scanner
  - repo: https://github.com/zricethezav/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

  # Formatting (fast — uses cached results)
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.3.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  # Prevent large files (catch accidental binary commits)
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: check-merge-conflict
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace`}
      </CodeBlock>

      <CodeBlock language="bash" filename="Install and configure pre-commit">
{`# Install pre-commit
pip install pre-commit

# Install the git hooks
pre-commit install

# Initialize the secrets baseline (first time setup)
detect-secrets scan > .secrets.baseline

# Run all hooks against all files (initial setup check)
pre-commit run --all-files`}
      </CodeBlock>

      <CodeBlock language="markdown" filename="CLAUDE.md (Pre-commit note)">
{`## Committing Changes

Pre-commit hooks are installed and will run automatically on git commit.

If a pre-commit hook fails:
- detect-secrets: You may have accidentally included a credential — review the diff
  immediately. Do NOT use --no-verify to bypass this check.
- ruff: The hook auto-fixes most issues. Re-stage the modified files and commit again.
- check-added-large-files: Do not commit binary files. Use Git LFS if large files
  are genuinely needed.

Never use git commit --no-verify. If a hook is blocking a legitimate commit,
flag it to a senior engineer — do not bypass it unilaterally.`}
      </CodeBlock>

      <h2>CI Pipeline Quality Gates</h2>

      <p>
        The CI pipeline is the authoritative quality gate. It runs in a clean environment, against
        the real dependencies, and its results cannot be influenced by local environment differences.
        A PR that fails CI does not merge, period.
      </p>

      <CodeBlock language="yaml" filename=".github/workflows/quality.yml">
{`name: Quality Gates

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  quality:
    name: All Quality Checks
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install dependencies
        run: pip install -r requirements-dev.txt

      # Gate 1: Linting and formatting
      - name: Ruff lint
        run: ruff check src/ tests/

      - name: Ruff format check
        run: ruff format src/ tests/ --check

      # Gate 2: Type checking
      - name: MyPy type check
        run: mypy src/

      # Gate 3: Tests with coverage
      - name: Run tests
        run: pytest --cov=src --cov-report=xml --cov-fail-under=80
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost/test_db

      # Gate 4: Security scanning
      - name: Bandit SAST
        run: bandit -r src/ -f json -o bandit-report.json
        continue-on-error: false

      - name: Safety dependency audit
        run: safety check --full-report

      - name: Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto

      # Gate 5: Build verification
      - name: Docker build
        run: docker build -t app:ci .`}
      </CodeBlock>

      <h2>Coverage Thresholds</h2>

      <p>
        Coverage thresholds in CI prevent the gradual erosion that happens when new code is added
        without tests. Set the threshold at your current coverage level and enforce that it can only
        go up — never down.
      </p>

      <CodeBlock language="ini" filename="pyproject.toml (coverage config)">
{`[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "--cov=src --cov-report=term-missing --cov-fail-under=80"

[tool.coverage.run]
omit = [
    "*/migrations/*",
    "*/tests/*",
    "*/conftest.py",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
]`}
      </CodeBlock>

      <PatternBlock title="Ratchet Pattern for Coverage">
        Rather than a fixed coverage threshold (which can feel arbitrary), use a ratchet: record
        the current coverage in a file committed to the repository, and fail CI if coverage drops
        below that value. As coverage improves, update the ratchet. The ratchet never moves backwards.
        This creates continuous improvement without the "we're already at 80%, close enough" problem.
      </PatternBlock>

      <WarningBlock title="Do Not Bypass CI Gates Under Pressure">
        The most dangerous moment for quality gates is a production incident that needs a hotfix.
        Pressure to merge quickly creates pressure to bypass checks. This is exactly the wrong
        response — code under pressure is more likely to have errors, not less. Configure your CI
        to allow repository admins to bypass checks only in explicit emergency scenarios, and require
        that bypassed checks are re-run after the emergency is resolved. Every bypass should be
        logged and reviewed in the post-incident report.
      </WarningBlock>

      <BestPracticeBlock title="CLAUDE.md Must Match CI">
        The checks Claude runs in-session must match the checks CI runs. If Claude runs ruff but
        CI runs pylint, Claude will produce code that passes its own checks but fails CI. Maintain
        a single source of truth: the check commands in CLAUDE.md should be copy-paste identical to
        the CI steps. When CI configuration changes, CLAUDE.md must be updated simultaneously.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Branch Protection Rules">
        Configure branch protection rules in GitHub/GitLab to require CI to pass before merge,
        require at least one human code review approval, and dismiss stale approvals when new
        commits are pushed. These rules enforce the quality gate process even when delivery pressure
        is high. They should be enabled from the start of the project, not added after the first
        production incident.
      </NoteBlock>
    </article>
  )
}
