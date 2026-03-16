import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function AIAsFirstReviewer() {
  return (
    <article className="prose-content">
      <h1>AI as First Reviewer</h1>

      <p>
        Code review is one of the most valuable but expensive activities in software engineering.
        Done well, it catches bugs, spreads knowledge, and maintains code quality. Done poorly
        — or skipped because of time pressure — it fails at all three. The bottleneck is almost
        always human attention: reviewers have limited time, and that time is most valuable when
        focused on architectural judgment and business correctness, not on pointing out missing
        null checks or inconsistent naming.
      </p>

      <p>
        Running Claude as a first-pass reviewer before human review addresses this bottleneck. Claude
        catches the mechanical issues — style inconsistencies, obvious null pointer risks, missing
        error handling, performance anti-patterns — so that human reviewers arrive at a cleaner diff
        and can focus on what humans do best.
      </p>

      <ConceptBlock title="Two-Stage Review">
        The two-stage review model: Claude reviews first and leaves structured comments on the PR.
        The author addresses Claude's comments and pushes a new commit. A human reviewer then
        reviews the updated diff, with confidence that the mechanical issues have already been
        caught. Human review time focuses on intent, architecture, and business correctness.
        The total time per PR decreases; the quality of what reaches production increases.
      </ConceptBlock>

      <h2>Running Claude as First Reviewer</h2>

      <SDKExample
        title="First-Pass Code Review Session"
        tabs={[
          {
            label: "prompt",
            language: "text",
            filename: "Review prompt",
            code: `Review the diff in this PR as a senior engineer.

Focus on:
1. CORRECTNESS: Logic errors, missing edge cases, incorrect assumptions
2. SECURITY: Any of the OWASP Top 10, missing auth checks, data exposure
3. PERFORMANCE: N+1 queries, missing indexes, inefficient algorithms
4. ERROR HANDLING: Unhandled exceptions, silent failures, incorrect status codes
5. MAINTAINABILITY: Code that will confuse the next engineer, missing comments
   on non-obvious logic, functions that are too long or do too many things

Do NOT flag:
- Style issues that are caught by the linter (they're already enforced)
- Missing tests (there's a separate test coverage check in CI)
- Purely personal preference without a concrete reason

For each finding:
- Category (CORRECTNESS/SECURITY/PERFORMANCE/ERROR/MAINTAINABILITY)
- Severity (CRITICAL/HIGH/MEDIUM/LOW)
- File and line number
- What the problem is
- A specific suggestion for how to fix it

End with a summary: APPROVE (no critical/high issues) or CHANGES REQUESTED.`,
          },
          {
            label: "output",
            language: "markdown",
            filename: "Claude review output",
            code: `## Code Review: feat/rate-limiting

### Findings

**[SECURITY] [CRITICAL] src/middleware/rate_limit.py:47**
The Redis key for rate limiting is constructed from the raw API key without hashing:
python
redis_key = f"rate_limit:{api_key}"  # ← exposes full API key in Redis

If Redis is compromised (or if logs include Redis commands), API keys are exposed.
Fix: hash the key before storing: redis_key = f"rate_limit:{hashlib.sha256(api_key.encode()).hexdigest()[:16]}"

**[CORRECTNESS] [HIGH] src/middleware/rate_limit.py:82**
The sliding window implementation has a race condition. Between the INCR and EXPIRE
calls, a second request can arrive and the EXPIRE is never set if INCR returns 1 for
that second request too (two concurrent "first requests").
Fix: Use a Lua script or Redis pipeline to make INCR + EXPIRE atomic.

**[ERROR HANDLING] [MEDIUM] src/middleware/rate_limit.py:103**
When Redis is unavailable, the exception is caught and the request proceeds without
rate limiting:
python
except RedisConnectionError:
    pass  # ← fail open

This may be intentional (availability over security) but it should be logged and
there should be an explicit comment explaining the decision. Fail-open rate limiting
is a design choice that should be visible.

**[PERFORMANCE] [LOW] src/api/rate_limit_status.py:34**
The endpoint queries Redis twice for the same key (once for count, once for TTL).
These can be combined into a single pipeline call.

---
**Verdict: CHANGES REQUESTED**
One CRITICAL finding (security) and one HIGH finding (correctness) must be addressed
before human review.`,
          },
        ]}
      />

      <h2>Integrating First-Pass Review into the Workflow</h2>

      <p>
        The most effective integration is as a GitHub Actions step that runs automatically when a
        PR is opened, posts Claude's review as a PR comment, and optionally blocks merge until the
        author addresses any CRITICAL or HIGH findings.
      </p>

      <CodeBlock language="yaml" filename=".github/workflows/ai-review.yml">
{`name: AI First Review

on:
  pull_request:
    types: [opened, synchronize]
    branches: [main, develop]

jobs:
  ai-review:
    name: Claude First-Pass Review
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get diff
        id: diff
        run: |
          git diff origin/${'$'}{{ github.base_ref }}...HEAD -- '*.py' '*.ts' '*.tsx' > diff.txt
          echo "diff_lines=$(wc -l < diff.txt)" >> $GITHUB_OUTPUT

      - name: Run Claude review
        if: steps.diff.outputs.diff_lines > 0
        run: |
          # Your Claude API call here — see SDK docs for implementation
          # Post the review as a PR comment via GitHub API
        env:
          ANTHROPIC_API_KEY: ${'$'}{{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${'$'}{{ secrets.GITHUB_TOKEN }}`}
      </CodeBlock>

      <h2>Review Categories to Prioritise</h2>

      <p>
        Not all review findings are equally important. A well-configured first-pass review focuses
        Claude's attention on the highest-impact categories and avoids wasting reviewer time on
        low-value findings.
      </p>

      <h3>Always Check (CRITICAL/HIGH)</h3>
      <ul>
        <li>Authentication and authorization: missing checks, bypassable checks</li>
        <li>Input validation: SQL injection, command injection, path traversal</li>
        <li>Data exposure: PII in logs, credentials in responses, stack traces in errors</li>
        <li>Race conditions in concurrent code</li>
        <li>Unhandled promise rejections (Node.js) or uncaught exceptions that crash the process</li>
      </ul>

      <h3>Check When Relevant (MEDIUM)</h3>
      <ul>
        <li>N+1 query patterns in loops</li>
        <li>Missing database indexes on frequently queried columns</li>
        <li>Fail-open error handling without explicit justification</li>
        <li>Hardcoded configuration values that should be in env vars</li>
      </ul>

      <h3>Flag but Don't Block (LOW)</h3>
      <ul>
        <li>Functions exceeding 50 lines without a clear reason</li>
        <li>Missing comments on non-obvious algorithmic choices</li>
        <li>Inconsistent naming within the new code</li>
      </ul>

      <PatternBlock title="The Review Prompt as Team Artefact">
        The system prompt for your AI reviewer should be version-controlled and team-owned, not
        left to each engineer to write ad-hoc. Store it in <code>.claude/review-prompt.md</code>
        and reference it in the CI workflow. When the team discovers that Claude consistently
        misses a certain class of issue, update the prompt. When a finding category is generating
        too much noise, tune it down. The review prompt improves over time just like the rest of
        your engineering infrastructure.
      </PatternBlock>

      <BestPracticeBlock title="Human Reviewers Should See Claude's Comments">
        Make Claude's first-pass review visible to human reviewers — post it as a PR comment with
        a clear label ("AI First Review"). This serves two purposes: (1) reviewers know what has
        already been checked and can focus elsewhere, (2) when Claude misses something, the human
        reviewer can see the gap and the team can improve the review prompt. Transparency about
        what the AI checked is essential for maintaining confidence in the review process.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use First-Pass Review for Self-Review Too">
        Run the first-pass review prompt on your own code before opening a PR. This is especially
        valuable before requesting review from senior engineers — it catches the issues you would
        have caught anyway in a second reading, and gets them fixed before you spend social capital
        on a review. A 5-minute self-review session that finds 3 issues is 3 fewer issues the
        senior engineer has to point out.
      </NoteBlock>
    </article>
  )
}
