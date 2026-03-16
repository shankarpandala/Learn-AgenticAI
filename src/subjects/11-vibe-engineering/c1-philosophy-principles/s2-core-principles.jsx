import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function CorePrinciples() {
  return (
    <article className="prose-content">
      <h1>Core Principles</h1>

      <p>
        Vibe Engineering is not a loose collection of tips for getting better results from AI assistants.
        It is a methodology built on five interlocking principles that together define the difference
        between professional AI-augmented engineering and ad-hoc AI experimentation. These principles
        apply regardless of which AI model you are using, which language you are writing in, or how
        large your team is.
      </p>

      <p>
        Each principle addresses a specific failure mode of naive AI-assisted development. Understanding
        why each principle exists makes it easier to apply correctly — and makes it obvious when a
        workflow is violating one.
      </p>

      <h2>Principle 1: Trust — Verify Everything, Trust the System</h2>

      <ConceptBlock title="Calibrated Trust">
        AI models are not reliable narrators. They produce correct output most of the time, plausible-sounding
        output almost all of the time, and dangerously wrong output occasionally — with no reliable signal
        distinguishing the three cases in the prose itself. The principle of Trust in Vibe Engineering is
        not "trust the AI" or "don't trust the AI." It is: <strong>trust the system of verification you
        have built, not the individual output.</strong>
      </ConceptBlock>

      <p>
        In practice, this means the question after every AI output is not "does this look right?" but
        "what would have to be true for this to be wrong, and have I checked that?" Your tests, your SAST
        tools, your type checker, your linter — these are the trust infrastructure. When they pass, you
        can have confidence in the output. When they aren't in place, you have nothing but vibes.
      </p>

      <CodeBlock language="markdown" filename="CLAUDE.md (Trust Infrastructure)">
{`## Verification Requirements

Before reporting any task complete, you MUST:
1. Run the full test suite: npm test — all tests must pass
2. Run the type checker: tsc --noEmit — zero errors
3. Run the linter: eslint src/ --max-warnings 0 — zero warnings
4. Run SAST: semgrep --config auto src/ — no HIGH/CRITICAL findings

If any check fails, fix the issue before reporting completion.
Do NOT report "tests pass" without actually running them.`}
      </CodeBlock>

      <h2>Principle 2: Iteration — Small, Verifiable Steps</h2>

      <p>
        Vibe coding tends toward large, sweeping prompts: "build me the entire authentication system."
        Vibe Engineering uses tight iteration loops: one small, well-defined task at a time, each
        producing output that can be completely verified before proceeding.
      </p>

      <PatternBlock title="The Tight Loop Pattern">
        The unit of work in Vibe Engineering is <strong>one task that produces verifiable output</strong>.
        A task is too large if you cannot fully verify its output before moving to the next one. Decompose
        until each step is verifiable. This is not bureaucratic overhead — it is the mechanism that keeps
        errors from compounding.
        <br /><br />
        <strong>Large prompt (vibe coding):</strong> "Implement user authentication with registration, login,
        password reset, email verification, and session management."
        <br /><br />
        <strong>Tight iteration (vibe engineering):</strong>
        <br />
        Step 1: "Implement the User model with the schema defined in user.schema.ts. Tests in
        tests/user.model.test.ts must pass."
        <br />
        Step 2: "Implement POST /auth/register. Tests in tests/auth.register.test.ts must pass."
        <br />
        Step 3: "Implement POST /auth/login. Tests in tests/auth.login.test.ts must pass."
        <br />
        Each step is a separate Claude session or a clearly delimited task. Each is fully verified before
        the next begins.
      </PatternBlock>

      <h2>Principle 3: Context — Front-Load What Matters</h2>

      <p>
        AI models work with the context they are given. When context is absent, they fill in gaps with
        training data defaults — which reflect internet averages, not your organization's standards. The
        principle of Context in Vibe Engineering is: <strong>every constraint, pattern, and decision
        that matters to this codebase must be in CLAUDE.md before the first prompt.</strong>
      </p>

      <p>
        Context is not just about what to build. It is about what not to build, what libraries to use,
        what security requirements apply, what naming conventions the team follows, what the existing
        architecture looks like, and what architectural decisions have already been made and why. Each of
        these pieces of context narrows the space of valid AI output from "everything" to "exactly what
        we need."
      </p>

      <CodeBlock language="markdown" filename="CLAUDE.md (Context Sections)">
{`# Project Context

## Architecture
- Monorepo: packages/api (FastAPI), packages/web (React/Vite), packages/shared (types)
- Database: PostgreSQL 15 with SQLAlchemy 2.0 ORM — no raw SQL
- Auth: JWT in httpOnly cookies, 15min TTL, refresh token rotation
- Message queue: Redis Streams (not Celery, not RabbitMQ)

## Decisions Already Made (ADRs in docs/adrs/)
- ADR-001: PostgreSQL over MongoDB — do not suggest NoSQL alternatives
- ADR-003: REST over GraphQL for external APIs — do not suggest GraphQL
- ADR-007: No class-based components in React — hooks only

## Forbidden
- No console.log() in production code — use the logger in src/lib/logger.ts
- No any type in TypeScript — use unknown and narrow
- No new dependencies without a comment explaining why
- No setTimeout/setInterval — use the job scheduler in src/jobs/`}
      </CodeBlock>

      <h2>Principle 4: Feedback — Close the Loop Automatically</h2>

      <p>
        Human review is a feedback mechanism, but it is slow and expensive. Vibe Engineering invests in
        automated feedback that runs inside the Claude session itself — tests, linters, type checkers,
        security scanners — so that the loop closes before you ever see the output. The human review then
        focuses on what automation cannot check: architectural judgment, security intent, and business
        correctness.
      </p>

      <BestPracticeBlock title="In-Loop Feedback">
        Structure every Claude session so that feedback tools run automatically after each code change.
        This means telling Claude explicitly which commands to run, in which order, and what constitutes
        a passing result. Claude should not consider a task done until all automated feedback is clean.
        The human review is the final gate, not the only gate.
      </BestPracticeBlock>

      <CodeBlock language="markdown" filename="Claude Session Feedback Loop">
{`After implementing each change, run in this order:
1. npm run build              → must exit 0
2. npm test -- --coverage    → must pass, coverage must not decrease
3. npm run lint              → zero warnings
4. npx tsc --noEmit         → zero errors
5. docker build -t app:test . → must succeed

If any step fails, fix the issue and re-run from step 1.
Only report completion when all five steps pass consecutively.`}
      </CodeBlock>

      <h2>Principle 5: Governance — Every Output Has an Owner</h2>

      <p>
        The governance principle is the one that makes Vibe Engineering viable at enterprise scale.
        Without it, the other four principles can be followed sporadically but will not hold under
        production pressure. Governance means: <strong>every piece of AI-generated code has a named
        human who reviewed it, approved it, and is accountable for it.</strong>
      </p>

      <p>
        This is not a bureaucratic requirement. It is an incentive structure. When engineers know they
        are personally accountable for code they approve — regardless of whether an AI generated it —
        they review it carefully. They run the tests. They read the diff. They ask questions. They push
        back on outputs that don't meet standards. Accountability is the force that makes all the other
        principles actually happen.
      </p>

      <WarningBlock title="The Accountability Gap">
        "But Claude generated it" is not a defense that works in a post-incident review, a security
        audit, a compliance examination, or a customer breach notification. The engineer who approved
        the PR owns the code. The organization that deployed it owns the vulnerability. This was true
        before AI, and it remains true with AI. The only change is the speed at which code can be
        generated — and therefore the speed at which accountability must be exercised.
      </WarningBlock>

      <h2>How the Five Principles Interlock</h2>

      <p>
        The principles are not independent. They are mutually reinforcing, and they fail together if any
        one is missing:
      </p>

      <ul>
        <li>
          <strong>Context without Feedback</strong> means you set good rules but have no way to verify
          they were followed.
        </li>
        <li>
          <strong>Feedback without Governance</strong> means automated checks run but nobody is
          accountable for acting on them.
        </li>
        <li>
          <strong>Governance without Iteration</strong> means reviews are so large and infrequent that
          accountability becomes nominal.
        </li>
        <li>
          <strong>Iteration without Trust Infrastructure</strong> means you iterate fast but never know
          if any step was actually correct.
        </li>
        <li>
          <strong>Trust without Context</strong> means your verification tools pass code that violates
          your org's specific requirements.
        </li>
      </ul>

      <NoteBlock type="tip" title="The Principle Priority Order">
        When you are adopting Vibe Engineering incrementally, implement the principles in this order:
        Context first (write CLAUDE.md), then Feedback (set up automated checks), then Iteration (break
        work into verifiable units), then Trust (establish what "verified" means for your team), then
        Governance (formalize accountability in your process). Each layer makes the next one effective.
        Governance without Context is just bureaucracy. Context with Governance and automated Feedback
        is an engineering system that scales.
      </NoteBlock>
    </article>
  )
}
