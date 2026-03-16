import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function AIPairProgramming() {
  return (
    <article className="prose-content">
      <h1>AI Pair Programming</h1>

      <p>
        Traditional pair programming has one driver (who writes the code) and one navigator (who
        thinks about the bigger picture, catches mistakes, and asks "why are we doing it this way?").
        The practice works because it forces continuous explanation and review — you cannot silently
        make a questionable decision when your partner is watching.
      </p>

      <p>
        AI pair programming changes the role assignments. Claude is almost always the most effective
        driver — it writes code faster and makes fewer syntax errors than a human. The engineer is
        almost always the most effective navigator — they understand the business context, the
        architectural constraints, and the failure modes that Claude will not consider unless prompted.
      </p>

      <p>
        The key to effective AI pair programming is knowing when each party should lead — and when
        to intervene.
      </p>

      <ConceptBlock title="The Human as Navigator">
        In AI pair programming, the engineer's primary job is navigation: directing where the code
        is going, checking the path is correct, and catching when the driver has gone off-course.
        This requires staying mentally engaged with what Claude is doing — not reviewing the final
        output, but watching the approach as it develops and redirecting before the wrong approach
        is fully implemented. A navigator who only reviews the finished result is not pair programming;
        they are code reviewing.
      </ConceptBlock>

      <h2>When to Lead vs. When to Delegate</h2>

      <h3>Let Claude Lead</h3>

      <p>
        Claude excels at tasks that are well-defined, follow patterns it has seen many times, and
        have clear success criteria. Delegating these tasks frees the engineer for higher-judgment
        work.
      </p>

      <ul>
        <li>Implementing functions once you have specified the interface and tests</li>
        <li>Writing boilerplate (model definitions, migration files, test fixtures)</li>
        <li>Adding error handling to existing functions following established patterns</li>
        <li>Implementing CRUD endpoints that follow your API conventions</li>
        <li>Translating a data schema into ORM models</li>
        <li>Writing docstrings and inline comments</li>
        <li>Refactoring for style consistency after the logic is correct</li>
      </ul>

      <h3>The Engineer Must Lead</h3>

      <p>
        The engineer must lead when the task requires judgment that cannot be encoded in a prompt:
        deep knowledge of the organisation's history, strategic context, or the specific failure
        modes of the existing system.
      </p>

      <ul>
        <li>Deciding which of two valid architectures fits the team's capabilities better</li>
        <li>Understanding why a legacy system works the way it does before modifying it</li>
        <li>Evaluating whether a new dependency is safe to introduce given the organisation's risk profile</li>
        <li>Determining whether a performance issue is worth fixing now or later</li>
        <li>Assessing the blast radius of a breaking API change</li>
        <li>Deciding what tests are actually necessary vs. what tests just increase coverage numbers</li>
      </ul>

      <h2>Effective Navigation Techniques</h2>

      <h3>Frontload the Constraints</h3>

      <p>
        The most expensive navigating is correcting wrong turns after they have been fully implemented.
        Prevent wrong turns by giving Claude the constraints that define "right" before implementation
        begins — not as feedback after the fact.
      </p>

      <CodeBlock language="text" filename="Constraint-First Navigation">
{`# Less effective: Let Claude implement, then correct
"Implement the payment processing service"
[Claude implements with Stripe, which we don't use]
"Actually we use Braintree — redo it"

# More effective: Constraints first
"Implement the payment processing service.
 Constraints:
 - Use the Braintree SDK (see src/clients/braintree.ts for the wrapper)
 - All amounts in cents (integer) — never floating point
 - Log transaction IDs but never card numbers or CVVs
 - All failures must update the order status to PAYMENT_FAILED via OrderService
 Now implement."`}
      </CodeBlock>

      <h3>Ask for the Plan Before the Code</h3>

      <p>
        For any non-trivial task, ask Claude to describe its approach before writing code. This is
        the pair programming equivalent of the navigator saying "before you start, walk me through
        what you're going to do." A bad approach caught at the description stage costs 30 seconds
        to correct. The same approach caught after full implementation costs an hour.
      </p>

      <CodeBlock language="text" filename="Plan-Before-Code Prompt">
{`Before writing any code, describe your approach for implementing the
distributed lock mechanism.

Tell me:
1. Which algorithm you plan to use and why
2. Which Redis commands you will use
3. How you will handle lock expiry and renewal
4. How you will handle the case where the lock holder crashes

Do not write any code yet. I will approve or redirect the approach first.`}
      </CodeBlock>

      <h3>Rubber Duck Debugging with AI</h3>

      <p>
        When debugging a complex issue, narrate the problem to Claude as if explaining it to a
        colleague who is unfamiliar with the codebase. This forces you to articulate your mental
        model, which often surfaces the misunderstanding that is causing the bug. Claude can then
        ask clarifying questions or suggest what you might have missed.
      </p>

      <PatternBlock title="The Debugging Dialogue">
        Effective debugging with an AI pair is a dialogue, not a request. Start with "here's what
        I observe, here's what I expect, and here's what I've already ruled out." Claude responds
        with hypotheses. You verify each one. Claude narrows. You find the bug. This process is
        faster than asking Claude to "fix this bug" — because Claude doesn't have the runtime
        context you have from watching the system misbehave.
      </PatternBlock>

      <h2>Handling Claude Mistakes</h2>

      <p>
        Claude makes characteristic mistakes. Knowing the patterns lets you catch them quickly
        without reviewing everything with equal suspicion.
      </p>

      <h3>Confident Wrongness</h3>

      <p>
        Claude writes incorrect code with the same confident tone as correct code. The most
        dangerous form is when it implements a slightly wrong version of a security pattern —
        JWT validation that technically runs but is bypassable, rate limiting that has an
        off-by-one in the window calculation, bcrypt with the cost factor hardcoded to 10
        instead of 12. These pass a casual review. Review security-critical code with active
        suspicion, not passive approval.
      </p>

      <h3>Scope Creep</h3>

      <p>
        Claude sometimes implements more than you asked for, especially when it sees "related"
        improvements it could make. This is usually well-intentioned but creates unreviewed changes.
        If Claude modifies files outside the scope you defined, do not accept the changes without
        understanding them — even if they look like improvements.
      </p>

      <CodeBlock language="markdown" filename="CLAUDE.md (Scope Constraint)">
{`## Scope

Only modify files that are directly required to implement the requested task.
Do NOT:
- Refactor code you notice but that is not related to the current task
- Add features that "seem useful" but were not requested
- Update dependencies unless the task requires a new dependency
- Modify test files that are not failing or not related to the current task

If you notice something worth improving outside the current scope, mention it
as a suggestion but do not implement it without explicit approval.`}
      </CodeBlock>

      <h3>Test Weakening</h3>

      <p>
        When tests fail, Claude's first instinct is sometimes to weaken the test rather than fix
        the implementation — change an assertion to be less strict, add a try/except that swallows
        the failure, or mock the thing being tested. Watch for this pattern. Tests represent the
        specification; they should not change unless the specification changed.
      </p>

      <WarningBlock title="Never Allow Claude to Modify Tests to Make Them Pass">
        If Claude proposes changing a test assertion to fix a failing test — weakening a check,
        removing a case, or mocking a dependency that the test is supposed to exercise — reject
        it. The test represents a requirement. If the test is wrong, you change it consciously
        with a clear commit message explaining why the requirement changed. If the implementation
        is wrong, the implementation changes. Tests are not obstacles to work around.
      </WarningBlock>

      <BestPracticeBlock title="Rotate Focus Every 25 Minutes">
        In extended AI pair programming sessions, rotate your focus: 25 minutes of directing Claude
        on implementation tasks, then 5 minutes of reviewing what was built. This prevents the
        drift where you realise after two hours that Claude took an approach that diverged from
        what you intended 90 minutes ago. Short review cycles catch drift early when it is cheap
        to correct.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use Claude's Uncertainty as a Signal">
        When Claude explicitly expresses uncertainty ("I'm not sure this is the right approach for
        your codebase" or "this depends on how you've structured X"), treat it as a signal to
        lead. Claude is telling you that it doesn't have enough context to make the right choice
        autonomously. Step in, provide the context, make the decision, then hand back to Claude
        for execution. Uncertainty is not a failure — it is the system working correctly.
      </NoteBlock>
    </article>
  )
}
