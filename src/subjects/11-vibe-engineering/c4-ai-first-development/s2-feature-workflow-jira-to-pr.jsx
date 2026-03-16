import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function FeatureWorkflowJiraToPR() {
  return (
    <article className="prose-content">
      <h1>Feature Workflow: JIRA to PR</h1>

      <p>
        The end-to-end feature workflow is where Vibe Engineering produces its most dramatic gains
        in delivery velocity. With JIRA MCP connected, Claude can read a ticket, ask clarifying
        questions, create a plan, implement with tests, run quality gates, and open a PR — all as
        a single orchestrated workflow. What previously took a full day of context-switching between
        systems can be compressed into a focused 2-3 hour session.
      </p>

      <p>
        This section describes the complete workflow as a repeatable pattern, with the specific
        commands and checkpoints where human judgment is required.
      </p>

      <ConceptBlock title="The Assisted Feature Workflow">
        The goal is not to remove the engineer from the feature implementation. The goal is to remove
        the mechanical work — reading and reformatting ticket content, setting up boilerplate,
        remembering command syntax, writing test scaffolding — so the engineer can focus on the
        decisions that require judgment: understanding the business intent, evaluating architectural
        tradeoffs, reviewing the implementation for correctness and security.
      </ConceptBlock>

      <h2>Phase 1: Ticket to Plan (10 minutes)</h2>

      <p>
        The first phase turns a JIRA ticket into an implementation plan that the engineer reviews
        before any code is written. This plan is the contract for the session — it defines scope,
        identifies risks, and surfaces questions before they become implementation assumptions.
      </p>

      <CodeBlock language="text" filename="Phase 1 Prompt">
{`Read JIRA ticket $TICKET_ID and create an implementation plan.

The plan must include:
1. Summary of what needs to be built (in your own words, not copy-paste)
2. Files to be created or modified (with brief explanation of why each)
3. External dependencies this touches (APIs, services, databases)
4. Risks or ambiguities that need clarification before implementation
5. Estimated test cases (happy path + error cases)
6. Any CLAUDE.md constraints that are particularly relevant to this ticket

Do NOT write any code yet. Output only the plan.
I will review it and confirm before you proceed.`}
      </CodeBlock>

      <p>
        The engineer reads the plan. If anything is wrong — the scope is too broad, a risk was missed,
        an architectural concern isn't addressed — they correct it now, not after hours of implementation.
        The plan review is a 5-minute investment that prevents multi-hour rework.
      </p>

      <h2>Phase 2: Branch and Tests (20 minutes)</h2>

      <p>
        Once the plan is approved, Claude creates the feature branch and writes the tests. The tests
        are committed before any implementation — this is the AI-TDD discipline applied to the full
        feature workflow.
      </p>

      <CodeBlock language="text" filename="Phase 2 Prompt">
{`Plan approved. Proceed with phase 2.

1. Create a feature branch: git checkout -b feat/$TICKET_ID-$SLUG

2. Write the failing tests as specified in the plan.
   Tests live in tests/ following our existing structure.
   Each test must have a docstring explaining what behavior it verifies.

3. Run the tests to confirm they fail for the right reasons (not import errors):
   pytest tests/[relevant test file] -v

4. Commit the tests:
   git add tests/
   git commit -m "test($TICKET_ID): add acceptance tests for [feature name]"

5. Report: test file paths created, test names, and the failure reason for each
   (what error they produce when run against the current implementation).`}
      </CodeBlock>

      <h2>Phase 3: Implementation (1-2 hours)</h2>

      <p>
        This is the phase where Claude does the most work autonomously. The engineer can be
        doing other things while Claude iterates — the tests provide the objective success criterion,
        so there is no need to supervise each iteration.
      </p>

      <SDKExample
        title="Phase 3: Implementation Session"
        tabs={[
          {
            label: "prompt",
            language: "text",
            filename: "Phase 3 prompt",
            code: `Tests committed. Proceed with implementation.

Implement the feature to make all tests in the committed test files pass.

Constraints from CLAUDE.md apply. Additional constraints for this ticket:
- [any ticket-specific constraints identified in the plan]

After each significant change, run:
pytest tests/[relevant files] --tb=short

Continue iterating until all tests pass.

When all tests pass, run the full quality gate sequence from CLAUDE.md:
1. pytest --cov=src --cov-fail-under=80
2. ruff check src/ && ruff format src/ --check
3. mypy src/
4. bandit -r src/ -ll

Report: tests passing, coverage percentage, any lint/type/security issues found and how you resolved them.`,
          },
          {
            label: "completion",
            language: "text",
            filename: "Expected completion report",
            code: `Implementation complete for PLAT-2847 (Rate Limiting).

Tests: 12 passed, 0 failed
New tests: tests/api/test_rate_limiting.py (8 tests)
Updated tests: tests/middleware/test_middleware_stack.py (4 tests)

Coverage: 84.2% (was 83.1% — increased)

Files created:
  src/middleware/rate_limit.py          (127 lines)
  src/redis/rate_limit_store.py         (45 lines)

Files modified:
  src/main.py                           (added middleware registration)
  src/config/settings.py               (added RATE_LIMIT_* env vars)

Quality gates:
  ruff: ✅ clean
  mypy: ✅ clean
  bandit: ✅ clean (0 findings)

One decision I made: chose sliding window algorithm over fixed window because
the acceptance criteria says "100 requests per minute" — fixed window can
allow 200 requests in a 2-minute span at window boundaries. Sliding window
prevents this. If you prefer fixed window for simplicity, I can change it.`,
          },
        ]}
      />

      <h2>Phase 4: Human Review (15-30 minutes)</h2>

      <p>
        This is the non-delegatable phase. The engineer reviews every diff, not the summary. They
        verify that the implementation makes sense, the tests actually test what they claim, and no
        security or architectural issues slipped through.
      </p>

      <CodeBlock language="text" filename="Review Checklist">
{`## Implementation Review Checklist

### Code Review
- [ ] Read every line of every modified file (not just the summary)
- [ ] The implementation matches the plan (no undiscussed scope creep)
- [ ] Tests actually test the claimed behavior (not vacuous assertions)
- [ ] Error handling is correct (not silent swallows, not generic 500s)
- [ ] Logging uses the standard logger (no console.log / print statements)
- [ ] No new environment variables without docs/env.example update

### Security Review
- [ ] No new SQL queries without parameterization
- [ ] No new external HTTP calls without timeout
- [ ] No sensitive data in logs
- [ ] Auth checks present on new endpoints

### Architecture Review
- [ ] Implementation follows the patterns in CLAUDE.md
- [ ] No new dependencies without explicit justification
- [ ] ADR implications considered (no decisions that contradict existing ADRs)

If anything in this list fails, return to Claude with specific feedback.`}
      </CodeBlock>

      <h2>Phase 5: PR Creation (10 minutes)</h2>

      <p>
        Once the engineer approves the implementation, Claude creates the PR with a complete
        description. This description is not a summary of what changed — it is a professional
        communication to reviewers that explains the context, the approach, and what reviewers
        should focus on.
      </p>

      <CodeBlock language="text" filename="Phase 5 Prompt">
{`Implementation approved. Create a pull request.

PR requirements:
- Title: "feat(rate-limiting): implement per-API-key rate limiting [PLAT-2847]"
- Branch: feat/PLAT-2847-rate-limiting → main
- Description must include:
  * What problem this solves (context from the ticket)
  * What approach was taken and why (the sliding window decision, etc.)
  * What tests cover this feature
  * What to look for in review (any areas of uncertainty)
  * Link to JIRA ticket PLAT-2847
  * Any follow-up work deferred to future tickets

After creating the PR:
1. Transition JIRA ticket PLAT-2847 to "In Review"
2. Add a comment on the JIRA ticket with the PR URL
3. Report the PR URL`}
      </CodeBlock>

      <PatternBlock title="The 5-Phase Workflow as a Slash Command">
        Encode this entire workflow as a slash command in <code>.claude/commands/feature.md</code>
        so any engineer can invoke it with <code>/feature PLAT-2847</code>. The command file encodes
        the five phases, the commit conventions, the quality gate sequence, and the PR template.
        New engineers on the team immediately have access to the complete workflow without needing to
        learn each step individually.
      </PatternBlock>

      <BestPracticeBlock title="One Ticket per Session">
        Keep each Claude session focused on one JIRA ticket. Multi-ticket sessions lead to scope creep,
        interleaved implementations that are hard to review, and commits that touch multiple concerns.
        The ticket boundary is also the natural PR boundary — one ticket, one PR, one focused review.
        If a ticket is too large for one session, decompose it into subtasks before starting.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="The Review is Where the Value Is">
        It is tempting to measure Vibe Engineering productivity by how fast Claude generates the
        implementation. But the value is created in the review — the moment when an experienced
        engineer reads Claude's approach and confirms "yes, that's the right way to do this in our
        system." Speed without review is vibe coding. Speed with thorough review is Vibe Engineering.
        Protect the time for review; do not compress it.
      </NoteBlock>
    </article>
  )
}
