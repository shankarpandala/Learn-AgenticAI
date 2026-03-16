import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function EnterpriseEngineeringMindset() {
  return (
    <article className="prose-content">
      <h1>Enterprise Engineering Mindset</h1>

      <p>
        Most engineers first encounter AI coding assistants in a personal context: a side project, a
        coding challenge, a weekend experiment. In that context, prompt-tinkering works. You try a prompt,
        see what you get, tweak it, try again. The feedback loop is tight, the stakes are low, and the
        only person who suffers if the code is wrong is you.
      </p>

      <p>
        Enterprise software engineering is categorically different. The codebase is maintained by dozens
        or hundreds of engineers across years or decades. Decisions made today constrain options for teams
        that don't exist yet. Security vulnerabilities affect real customers. Compliance failures carry
        legal and financial consequences. In this environment, prompt-tinkering is not a methodology —
        it is a liability.
      </p>

      <p>
        The enterprise engineering mindset for AI-augmented development requires a different mental model
        entirely: systematic, reproducible, governed, and auditable.
      </p>

      <h2>From Prompt-Tinkering to Systematic Engineering</h2>

      <div className="table-wrapper" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-raised, #1e1e2e)' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid var(--color-border, #333)', width: '25%' }}>Dimension</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid var(--color-border, #333)', width: '37%', color: 'var(--color-warning, #f59e0b)' }}>Prompt-Tinkering</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '2px solid var(--color-border, #333)', width: '38%', color: 'var(--color-success, #10b981)' }}>Systematic Engineering</th>
            </tr>
          </thead>
          <tbody>
            {[
              { d: 'Standards', p: 'Each engineer uses whatever prompt style worked last time', e: 'Shared CLAUDE.md in the repo that encodes org standards once for all engineers' },
              { d: 'Reproducibility', p: 'Results vary by who ran the session and what mood they were in', e: 'Deterministic: same CLAUDE.md + same tests = same acceptable output bounds' },
              { d: 'Knowledge capture', p: 'Tribal: the prompt-tinkerer knows what works; nobody else does', e: 'Documented in CLAUDE.md, slash commands, and ADRs — survives team turnover' },
              { d: 'Audit trail', p: 'No record of what was asked, what was generated, what was changed', e: 'Git history shows tests committed before implementation; PR records the review' },
              { d: 'Onboarding', p: 'New engineers must rediscover which prompts work for this project', e: 'New engineers read CLAUDE.md and immediately have all constraints and patterns' },
              { d: 'Scale', p: 'Breaks down past 1-2 engineers — inconsistent output quality', e: 'Scales to 100+ engineers: constraints enforced by tooling, not by memory' },
            ].map((row, i) => (
              <tr key={row.d} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-surface-subtle, #161622)' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '600', borderBottom: '1px solid var(--color-border-subtle, #2a2a3a)', verticalAlign: 'top' }}>{row.d}</td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-subtle, #2a2a3a)', verticalAlign: 'top', color: 'var(--color-text-muted, #aaa)' }}>{row.p}</td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-subtle, #2a2a3a)', verticalAlign: 'top' }}>{row.e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>The Three Shifts in Enterprise Mindset</h2>

      <h3>Shift 1: From Personal to Institutional Knowledge</h3>

      <p>
        In prompt-tinkering, the knowledge of how to get good results from AI lives in one person's head.
        When that person leaves, the knowledge leaves with them. In enterprise Vibe Engineering, all
        AI-guidance knowledge is institutionalised in artefacts that live in the repository: CLAUDE.md,
        custom slash commands, shared prompt templates, documented ADRs, and this documentation itself.
      </p>

      <CodeBlock language="bash" filename="Repository AI Knowledge Artefacts">
{`# Knowledge that lives in the repo, not in anyone's head
/CLAUDE.md                          # Primary AI constitution
/.claude/commands/                  # Shared slash commands
/docs/adrs/                         # Architectural decisions
/docs/ai-workflows/                 # Documented session patterns
/.github/workflows/ai-quality.yml   # Automated quality gates`}
      </CodeBlock>

      <h3>Shift 2: From Reactive to Proactive Quality</h3>

      <p>
        Prompt-tinkering is reactive: you generate code, notice a problem, fix it, generate more code.
        Quality is enforced after the fact by whoever happens to notice the issue. Enterprise engineering
        is proactive: quality is enforced before the AI generates the code, by the constraints in
        CLAUDE.md, and during generation, by the automated gates in the agent loop.
      </p>

      <ConceptBlock title="Quality Injected, Not Inspected">
        The enterprise engineering mindset treats quality as a property of the process, not the output.
        If your process correctly encodes security requirements, architectural patterns, and test-first
        discipline, then the output will be high-quality by construction. If your process is ad-hoc
        prompting and eyeballing, then quality depends on luck. The goal of Vibe Engineering is to build
        a process where high-quality output is the default, not the exception.
      </ConceptBlock>

      <h3>Shift 3: From Individual to Collective Accountability</h3>

      <p>
        In personal AI use, accountability is informal: if your side project breaks, you fix it. In an
        enterprise team, accountability must be explicit and systemic. Every AI-generated change needs a
        named reviewer. Every deviation from standards needs a recorded justification. The accountability
        system must function even when the team is under delivery pressure — which is exactly when the
        temptation to skip review is highest.
      </p>

      <PatternBlock title="The Accountability Stack">
        Enterprise AI accountability operates at three levels simultaneously:
        <br /><br />
        <strong>Individual level:</strong> The engineer who approves a PR is accountable for that diff,
        regardless of who or what generated it. This accountability is enforced by the code review
        process and the org's engineering standards.
        <br /><br />
        <strong>Team level:</strong> The team is accountable for maintaining a CLAUDE.md that reflects
        current standards, for running quality gates on every PR, and for escalating when AI output
        consistently fails to meet those standards.
        <br /><br />
        <strong>Organisational level:</strong> The organisation is accountable for defining the AI usage
        policy, establishing the approved toolset, setting the data handling constraints, and measuring
        whether AI-augmented engineering is actually improving quality and velocity.
      </PatternBlock>

      <h2>What Scale Changes</h2>

      <p>
        Practices that work fine for a solo engineer or a 3-person team fail at enterprise scale for
        predictable reasons. Understanding these failure modes in advance lets you design the right
        process from the start.
      </p>

      <h3>Context Divergence</h3>

      <p>
        When 50 engineers each maintain their own mental model of "how we use AI here," those models
        diverge. One engineer's CLAUDE.md (or lack of one) lets Claude use any ORM it wants. Another's
        requires SQLAlchemy. The result is a codebase with inconsistent patterns, maintenance nightmares,
        and security properties that vary by who wrote which module. The solution is a single authoritative
        CLAUDE.md committed to the root of the repository, treated with the same governance as any other
        engineering standard.
      </p>

      <h3>Review Bottlenecks</h3>

      <p>
        If AI dramatically increases code generation velocity but review capacity stays constant, the
        review process becomes the bottleneck — and under pressure, engineers start shortcutting it.
        The enterprise solution is to automate the mechanical parts of review (tests, linting, SAST,
        type checking) so that human reviewers focus only on the parts that require judgment. This keeps
        review fast without reducing thoroughness.
      </p>

      <h3>Compliance at Velocity</h3>

      <p>
        Compliance requirements (GDPR, PCI-DSS, SOC 2, HIPAA) don't become less stringent because you
        are using AI. If anything, the velocity of AI-generated code means compliance violations can
        accumulate faster than a quarterly audit can catch them. The enterprise solution is to embed
        compliance constraints in CLAUDE.md as hard rules, and to run compliance checks automatically
        in the CI pipeline.
      </p>

      <BestPracticeBlock title="Compliance Rules in CLAUDE.md">
        Write compliance constraints as specific, actionable rules in CLAUDE.md — not as vague intentions.
        "Follow GDPR" is not actionable. "Never log email addresses, phone numbers, or any field marked
        PII in the data model" is actionable. "Do not store payment card data anywhere in this service —
        use the payment-service client in src/clients/payment.ts which handles tokenisation" is actionable.
        The more specific the constraint, the more reliably Claude will follow it and the easier it is
        to verify compliance in code review.
      </BestPracticeBlock>

      <h2>Introducing Vibe Engineering to an Existing Team</h2>

      <p>
        Most teams adopting Vibe Engineering are not greenfield. They have existing codebases, existing
        processes, and engineers at various levels of AI familiarity. The transition works best when
        introduced incrementally, starting with the highest-leverage changes.
      </p>

      <ol>
        <li>
          <strong>Week 1-2: Write the CLAUDE.md.</strong> Gather the senior engineers and spend one
          focused session writing the CLAUDE.md for your primary repository. Cover architecture,
          security constraints, forbidden patterns, and naming conventions. This single artefact
          delivers more value than any amount of individual prompt coaching.
        </li>
        <li>
          <strong>Week 3-4: Establish the quality gate.</strong> Add automated checks to your CI
          pipeline that run tests, linting, type checking, and SAST. These are the feedback
          infrastructure that makes verification systematic.
        </li>
        <li>
          <strong>Week 5-6: Define the review standard.</strong> Write a one-page document stating
          explicitly what "reviewing AI-generated code" means for your team. What must every reviewer
          check? What automation can they rely on? What constitutes an approval?
        </li>
        <li>
          <strong>Month 2+: Build slash commands and workflows.</strong> Identify the most common
          patterns — "implement this feature," "add tests for this module," "update this API" —
          and build reusable slash commands that encode the right approach for each.
        </li>
      </ol>

      <WarningBlock title="Do Not Reorganise Around AI Before You Understand It">
        Some organisations see AI productivity gains and immediately restructure teams, eliminate
        roles, or dramatically increase delivery expectations. This is premature. AI-augmented
        engineering requires new skills (specification writing, output review, constraint design)
        that take time to develop. Teams that are restructured before those skills are established
        will produce more AI-generated code that nobody properly reviewed, more quickly. That is
        strictly worse than the status quo. Invest in capability first. Restructure second, and
        only based on measured outcomes.
      </WarningBlock>

      <NoteBlock type="tip" title="The Biggest Leverage Point">
        If you can do only one thing to shift your team toward systematic AI-augmented engineering,
        write a thorough CLAUDE.md and commit it to your primary repository. It takes 2-4 hours.
        Every engineer on the team immediately gets those hours' worth of institutional knowledge
        injected into every Claude session they run. It compounds with every engineer and every
        session. No other single investment has a higher return.
      </NoteBlock>
    </article>
  )
}
