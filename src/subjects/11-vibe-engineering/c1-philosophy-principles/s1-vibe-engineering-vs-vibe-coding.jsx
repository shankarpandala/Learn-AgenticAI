import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function VibeEngineeringVsVibeCoding() {
  return (
    <div className="section-content">
      <h1>Vibe Engineering vs. Vibe Coding</h1>

      <p>
        In early 2025, Andrej Karpathy coined the term <strong>"vibe coding"</strong> to describe a new way people
        were interacting with AI coding assistants: you describe what you want, the AI writes the code, you glance at
        it, it looks plausible, you hit accept, and you move on. You're not really reading it. You're not really
        understanding it. You're just... vibing. The code works, or it seems to, and that's enough.
      </p>

      <p>
        For personal projects, weekend hacks, and throwaway prototypes, vibe coding is genuinely liberating. You can
        build things you never could have built before. You can explore ideas at the speed of thought. The joy is real
        and the productivity gains are real.
      </p>

      <p>
        Then organizations started doing it with production systems. And that's where it goes wrong.
      </p>

      <p>
        Vibe coding in a professional context means shipping code you don't understand, authored by a model that
        hallucinates, into systems that handle real users, real money, and real data. It means vulnerabilities you
        didn't know you introduced, architectural decisions you didn't consciously make, and technical debt that
        accumulates at AI speed. When something breaks — and it will break — nobody can explain why, because nobody
        actually read the code that was written.
      </p>

      <p>
        <strong>Vibe Engineering</strong> is the answer to this problem. It's not about removing AI from the
        development process. It's about bringing discipline to how AI is used — the same discipline that separates
        a production-grade codebase from a prototype, the same discipline that enables teams of 100+ engineers to
        ship safely at scale.
      </p>

      <h2>Side-by-Side: Vibe Coding vs. Vibe Engineering</h2>

      <div className="table-wrapper" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-raised, #1e1e2e)' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid var(--color-border, #333)', width: '20%' }}>
                Dimension
              </th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid var(--color-border, #333)', width: '40%', color: 'var(--color-warning, #f59e0b)' }}>
                Vibe Coding
              </th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid var(--color-border, #333)', width: '40%', color: 'var(--color-success, #10b981)' }}>
                Vibe Engineering
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                dimension: 'Standards Adherence',
                vibe: 'Ignores them — AI has no knowledge of your org\'s standards',
                engineering: 'Enforces via CLAUDE.md — standards are embedded before the first prompt',
              },
              {
                dimension: 'Security',
                vibe: 'Ships vulnerabilities the engineer never saw because they never read the code',
                engineering: 'SAST / security gates run in the loop; Claude remediates findings before PR',
              },
              {
                dimension: 'Code Review',
                vibe: 'Accept AI output directly — "it compiled, looks fine"',
                engineering: 'AI reviews first (automated checks), human reviews second (every diff)',
              },
              {
                dimension: 'Accountability',
                vibe: '"Who wrote this bug?" — diffuse, deniable, unresolvable',
                engineering: 'The engineer who approved the PR owns it, unconditionally',
              },
              {
                dimension: 'Testing',
                vibe: 'Hope it works — maybe manual smoke test',
                engineering: 'Tests written first (AI-TDD); implementation must pass before acceptance',
              },
              {
                dimension: 'Documentation',
                vibe: 'Never — there\'s no time, the AI writes fast',
                engineering: 'Generated and kept fresh automatically as part of the session workflow',
              },
              {
                dimension: 'Compliance',
                vibe: 'Never considered — compliance is "the security team\'s problem"',
                engineering: 'Embedded in CLAUDE.md as hard constraints (SOC 2, PCI-DSS, GDPR, etc.)',
              },
              {
                dimension: 'Scale',
                vibe: 'Solo projects, throwaway prototypes, or codebases nobody has to maintain',
                engineering: 'Enterprise teams of 100+ engineers shipping to production daily',
              },
            ].map((row, i) => (
              <tr
                key={row.dimension}
                style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-surface-subtle, #161622)' }}
              >
                <td style={{ padding: '0.75rem 1rem', fontWeight: '600', borderBottom: '1px solid var(--color-border-subtle, #2a2a3a)', verticalAlign: 'top' }}>
                  {row.dimension}
                </td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-subtle, #2a2a3a)', verticalAlign: 'top', color: 'var(--color-text-muted, #aaa)' }}>
                  {row.vibe}
                </td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-subtle, #2a2a3a)', verticalAlign: 'top' }}>
                  {row.engineering}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConceptBlock title="Vibe Engineering">
        Vibe Engineering is the disciplined methodology of using AI coding assistants (Claude Code, Cursor, Copilot,
        and their successors) as <strong>accelerators</strong> while the engineer retains architectural authority,
        sets organizational constraints, validates all AI output, and holds accountability for the production system.
        <br /><br />
        The word "vibe" is intentional: flow state, developer momentum, and intuition remain valuable. The word
        "engineering" is equally intentional: discipline, rigor, accountability, and reproducibility are non-negotiable.
        Vibe Engineering is what happens when you refuse to choose between the two.
      </ConceptBlock>

      <h2>The Engineer's Role Shift</h2>

      <p>
        The most important cognitive shift in Vibe Engineering is understanding what your job actually is when an AI
        is writing most of the code. Many engineers initially feel deskilled — "I'm just reviewing AI output now" —
        but this fundamentally misreads what's happening. The role has changed, but it hasn't diminished. In many
        ways it has expanded.
      </p>

      <p>
        <strong>Before AI assistance:</strong> The engineer was primarily an <em>implementer</em>. The job was to
        translate requirements into working code, line by line. The bottleneck was typing speed and the ability to
        hold the entire solution in working memory simultaneously.
      </p>

      <p>
        <strong>With AI assistance:</strong> The engineer is primarily a <em>governor</em>. The job is to specify
        what to build with enough precision that AI can implement it correctly, to establish what rules apply to the
        implementation, to validate that the output meets those rules, and to make the architectural decisions that
        no AI can make for you — because architectural decisions require understanding the organization's constraints,
        history, team capability, and strategic direction.
      </p>

      <p>The specific shifts are:</p>

      <ul>
        <li>
          <strong>From</strong> writing every line of code <strong>→ To</strong> specifying what to build with
          precision (requirements, acceptance criteria, test cases)
        </li>
        <li>
          <strong>From</strong> knowing the implementation details <strong>→ To</strong> knowing why each
          architectural decision was made and being able to defend it
        </li>
        <li>
          <strong>From</strong> debugging your own mistakes <strong>→ To</strong> validating AI output against
          known constraints and catching its characteristic failure modes
        </li>
        <li>
          <strong>From</strong> writing documentation after the fact <strong>→ To</strong> writing constraints
          before the fact (CLAUDE.md) that shape what gets generated
        </li>
        <li>
          <strong>From</strong> personal accountability for code you wrote <strong>→ To</strong> institutional
          accountability for code you approved
        </li>
      </ul>

      <p>
        That last point is the one that matters most for enterprise adoption, and the one that vibe coders most
        consistently evade. When you accept a diff — when you click "Accept" or merge the PR — you are making a
        professional declaration that this code is correct, secure, and meets your organization's standards. It
        doesn't matter that Claude wrote it. You reviewed it. You own it.
      </p>

      <blockquote style={{ borderLeft: '4px solid var(--color-accent, #6366f1)', paddingLeft: '1rem', marginLeft: '0', fontStyle: 'italic', color: 'var(--color-text-muted, #aaa)' }}>
        "I am responsible for everything Claude writes in my session. Claude is a tool I wield, not a co-author
        I share blame with."
      </blockquote>

      <h2>What Goes Wrong: The Vibe Coding Failure Mode</h2>

      <p>
        Here's what a toxic vibe coding interaction looks like in practice. Read it carefully, because if you've
        been using AI coding assistants without a CLAUDE.md, you may have shipped exactly this:
      </p>

      <CodeBlock language="markdown" filename="vibe-coding-example.md">
{`# Vibe Coding: User Auth (What NOT to Do)

User: "build me a user auth system"

Claude: [generates 500 lines of code with the following characteristics]
  - JWT stored in localStorage (XSS-accessible, trivially stealable)
  - Passwords hashed with MD5 (broken since 1996, rainbow-table-crackable)
  - No CSRF protection (state-changing endpoints vulnerable to CSRF attacks)
  - No rate limiting on /login (brute-force trivially possible)
  - Session tokens never expire (stolen token valid indefinitely)
  - User IDs exposed in JWT payload without validation (IDOR risk)
  - SQL query built with string concatenation (SQL injection possible)
  - Error messages include stack traces (information disclosure)

User: "looks good, ship it"

[Two weeks later]
Security researcher: "Your users' passwords are exposed. Here's 50,000 of them."
Engineer: "But Claude said it looked right..."
`}
      </CodeBlock>

      <p>
        None of these vulnerabilities are exotic. Every one of them is in OWASP Top 10. Claude generated them
        not because it was malicious, but because the prompt contained zero constraints. "Build me a user auth
        system" is a specification that could be satisfied by an infinite variety of implementations, including
        deeply insecure ones. Claude picked one. You shipped it.
      </p>

      <p>
        Now look at the same task done with Vibe Engineering discipline:
      </p>

      <CodeBlock language="markdown" filename="vibe-engineering-example.md">
{`# Vibe Engineering: User Auth (The Right Way)

# ── Step 1: CLAUDE.md established BEFORE any coding ────────────────────────

## Security Constraints (from CLAUDE.md)
- JWT: httpOnly cookies ONLY — never localStorage, never sessionStorage
- Passwords: bcrypt with cost factor >= 12 (never MD5, SHA1, SHA256 raw)
- CSRF: SameSite=Strict cookie attribute + CSRF token for all state-changing ops
- Session: 15min access token TTL, 7-day refresh token with rotation on use
- Rate limiting: max 5 login attempts per IP per 15 minutes (return 429)
- Input validation: Zod schema validation on ALL inputs before any processing
- Error responses: generic messages only ("Invalid credentials") — no stack traces
- SQL: parameterized queries ONLY via ORM (no string concatenation)

# ── Step 2: The Vibe Engineering prompt ─────────────────────────────────────

User: "Implement the user authentication system per CLAUDE.md security
       constraints. Write failing tests first that assert the security
       behaviors, then implement code that passes them. After implementation,
       run 'semgrep --config auto src/auth/' and report any findings."

# ── Step 3: What Claude actually does ───────────────────────────────────────

Claude:
  1. Writes failing tests:
     - test_jwt_not_in_localStorage() → asserts cookie-based storage
     - test_password_bcrypt_cost_12() → asserts bcrypt with correct cost
     - test_csrf_token_required() → asserts CSRF validation on POST /login
     - test_rate_limit_after_5_attempts() → asserts 429 on 6th attempt
     - test_refresh_token_rotates() → asserts old token invalid after use
  2. Implements auth module that passes all tests
  3. Runs semgrep: reports 0 critical findings, 1 informational note
  4. Reports: "Implementation complete. All 12 tests pass. Semgrep clean."

# ── Step 4: Engineer review ──────────────────────────────────────────────────

Engineer:
  - Reads every diff (not just the summary)
  - Verifies tests actually test what they claim
  - Confirms semgrep output matches what Claude reported
  - Checks bcrypt cost factor in the actual code (not just trusts Claude's claim)
  - Merges PR: now personally accountable for this code
`}
      </CodeBlock>

      <p>
        The difference is not that one uses AI and one doesn't. Both use AI. The difference is that the second
        approach treats the engineer's job as governing the AI's output, not hoping the AI happened to make the
        right choices.
      </p>

      <WarningBlock title="The Confidence Trap">
        AI models generate text with uniform fluency regardless of whether the underlying content is correct. A
        correct implementation and a subtly broken one are written in the same confident tone, with the same clean
        formatting, and the same authoritative comments. There is no signal in the prose that tells you "this
        part is hallucinated" or "I'm not sure about this security pattern."
        <br /><br />
        This is categorically different from human code review, where a junior engineer's uncertainty is often
        visible in their code, their comments, or their PR description. AI does not express uncertainty at the
        code level. It expresses it only when you ask it to, and only sometimes.
        <br /><br />
        The engineer must never mistake confidence for correctness. The mechanism for not making that mistake
        is: tests, SAST, linting, and your own careful reading of every diff.
      </WarningBlock>

      <SecurityCallout severity="critical" title='The "Accept All" Button Is a Security Incident Waiting to Happen'>
        Every major AI coding assistant has some version of an "Accept All" button — a way to accept every
        suggested change at once without reviewing individual diffs. In personal projects, this is a convenience
        feature. In production codebases, it is a security control bypass.
        <br /><br />
        Accepting AI-generated code without review is not a development velocity optimization. It is a transfer
        of authorship without transfer of understanding. You are putting your name on code you cannot explain,
        cannot defend, and may not be able to fix when it breaks.
        <br /><br />
        Organizational policy for Vibe Engineering: <strong>every line of AI-generated code must be reviewed
        by the engineer who approves the PR</strong>. "The AI generated it" is not a defense when the security
        audit asks why you shipped MD5 password hashing. "I reviewed it and approved it" is. The second answer
        is only possible if you actually reviewed it.
      </SecurityCallout>

      <PatternBlock title="The Governor Pattern">
        The engineer's role in Vibe Engineering is that of a governor — someone who sets the rules of the system,
        validates that those rules are being followed, and is accountable for the system's behavior. The five
        responsibilities of the governor are:
        <br /><br />
        <strong>1. Set Constraints (CLAUDE.md)</strong>
        <br />
        Before any coding begins, the governor defines what is and isn't acceptable. Security rules, architectural
        patterns, forbidden libraries, compliance requirements. These are not suggestions to the AI — they are
        constraints that must be satisfied before any output is accepted.
        <br /><br />
        <strong>2. Specify Requirements (Clear and Testable)</strong>
        <br />
        The governor writes requirements that are specific enough to be verified. Not "build auth" but "implement
        login with these security properties, expressed as passing tests." Vague requirements produce vague
        implementations that may or may not be correct.
        <br /><br />
        <strong>3. Review Output (Every Diff)</strong>
        <br />
        The governor reads every change before accepting it. Not skimming — reading. Line by line for security-critical
        paths, at a higher level for boilerplate. The goal is to be able to explain, in a code review, why every
        line is there and why it is correct.
        <br /><br />
        <strong>4. Run Validation Gates (Tests, SAST, Linting)</strong>
        <br />
        The governor runs the automated checks that catch what human eyes miss. Tests verify behavior. SAST catches
        security anti-patterns. Linting enforces style. These are not optional — they are the governor's instruments
        for detecting when the AI deviated from constraints.
        <br /><br />
        <strong>5. Own the Result (Accountability)</strong>
        <br />
        The governor signs their name to the output. This is what makes all of the above non-negotiable: you cannot
        hold accountability for code you didn't review, can't explain code you didn't understand, and can't fix
        code you didn't write with intention. Accountability creates the incentive structure that makes the first
        four steps happen.
      </PatternBlock>

      <BestPracticeBlock title="Write CLAUDE.md Before the First Prompt">
        Start every AI coding session by reading your CLAUDE.md in your head. Not skimming — reading. Ask yourself:
        does this still reflect the actual constraints of this project? Has anything changed since the last time I
        updated it?
        <br /><br />
        If you don't have a CLAUDE.md for this project, stop. Write it before typing a single prompt. This is not
        bureaucratic overhead. A 30-minute investment in writing a thorough CLAUDE.md saves 30 hours of security
        remediation, architectural refactoring, and compliance scrambling downstream.
        <br /><br />
        Every constraint you don't put in CLAUDE.md is a decision you're leaving to the AI's training data
        defaults — which may have been appropriate for a tutorial on the internet in 2021, but are not appropriate
        for your regulated, production, customer-facing system in the present day.
      </BestPracticeBlock>

      <NoteBlock type="tip" title='Why "Vibes" Still Matter'>
        Vibe Engineering is not a campaign against developer joy. Flow state is real. The feeling of momentum when
        ideas manifest in working code almost instantly is a genuine productivity multiplier, and it reduces
        cognitive fatigue in a way that grinds through implementation line by line never did.
        <br /><br />
        The goal of Vibe Engineering is not to eliminate vibes. It's to build the scaffolding that makes vibing
        safe. When your CLAUDE.md is thorough, your tests are in place, and your SAST is in the loop, you can
        move fast with confidence instead of moving fast with anxiety. You can enter flow state and stay there
        because you're not constantly second-guessing whether you just shipped a vulnerability.
        <br /><br />
        The discipline doesn't kill the joy. The discipline is what makes the joy sustainable at production scale.
      </NoteBlock>
    </div>
  )
}
