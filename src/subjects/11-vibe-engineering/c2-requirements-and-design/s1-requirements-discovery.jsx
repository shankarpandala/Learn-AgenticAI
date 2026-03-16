import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function RequirementsDiscovery() {
  return (
    <article className="prose-content">
      <h1>Requirements Discovery</h1>

      <p>
        The quality of AI-generated code is bounded by the quality of its specification. A vague
        requirement produces code that may technically satisfy the words while missing the intent entirely.
        Requirements discovery — eliciting, clarifying, and structuring requirements — is one of the
        highest-leverage activities in Vibe Engineering, because it determines whether everything that
        follows is building the right thing.
      </p>

      <p>
        Claude is a capable collaborator in this process. Used well, it can help surface unstated
        assumptions, identify conflicting requirements, generate acceptance criteria, and translate
        stakeholder language into technical specifications. Used poorly — as a passive transcriber of
        whatever the stakeholder first says — it adds no value and may paper over gaps that will surface
        as expensive bugs later.
      </p>

      <ConceptBlock title="Requirements as the AI's Specification">
        When you give Claude a requirement to implement, you are not giving it a suggestion. You are
        giving it the complete specification for what success looks like. Every ambiguity in the
        requirement is a decision Claude will make unilaterally, using its training data defaults.
        Every missing edge case is a behavior Claude will invent. The time spent making requirements
        precise is not overhead — it is the primary engineering activity in an AI-augmented workflow.
      </ConceptBlock>

      <h2>Using Claude for Stakeholder Requirement Elicitation</h2>

      <p>
        Stakeholders often describe requirements in terms of solutions ("I want a button that exports
        to Excel") rather than needs ("I need to share monthly sales data with my finance team").
        Claude can help you dig from the surface description to the underlying need — which often
        reveals a better solution than what was initially requested.
      </p>

      <CodeBlock language="text" filename="Elicitation Prompt Pattern">
{`I have a stakeholder requirement that needs clarification before we implement it.

Stakeholder request: "I want users to be able to export their data"

Help me identify:
1. The underlying need behind this request
2. The unstated assumptions in the request
3. The questions I must ask the stakeholder before writing acceptance criteria
4. The edge cases that will need to be addressed in implementation
5. Non-functional requirements that are likely implied but unstated`}
      </CodeBlock>

      <p>
        Claude will respond with probing questions and identified gaps. You then take those back to the
        stakeholder, return with answers, and repeat until the requirement is fully specified. This
        structured elicitation process typically surfaces 5-10 issues that would otherwise have become
        bugs, change requests, or architectural problems.
      </p>

      <h2>Extracting Requirements from Existing Code</h2>

      <p>
        In most enterprises, the definitive specification of what a system does is the code itself.
        Documentation is stale, specs are missing, and the only person who knew the original intent
        left two years ago. Claude can read the codebase and extract implicit requirements — which is
        essential before making changes that might break undocumented behavior.
      </p>

      <SDKExample
        title="Extracting Requirements from Code"
        tabs={[
          {
            label: "prompt",
            language: "text",
            filename: "Claude Code session",
            code: `Read the following files and extract the implicit business requirements:
- src/billing/invoice.service.ts
- src/billing/invoice.model.ts
- tests/billing/invoice.service.test.ts

For each requirement you identify:
1. State the requirement in plain English
2. Cite the specific code that implies it
3. Flag any requirements that appear inconsistent across files
4. Identify behaviors in the code that have no corresponding test (undocumented requirements)

Output as a structured markdown document I can use as a baseline spec.`,
          },
          {
            label: "output",
            language: "markdown",
            filename: "extracted-requirements.md",
            code: `# Invoice Service — Extracted Requirements

## Functional Requirements

### FR-001: Invoice Creation
- Invoices must have a unique invoice number in format INV-{YEAR}-{SEQUENCE}
- Cited: invoice.service.ts:47, invoice.model.ts:23
- Test coverage: ✅ test_invoice_number_format()

### FR-002: Tax Calculation
- Tax rate varies by customer.country — US customers: 0%, UK customers: 20% VAT
- Cited: invoice.service.ts:89-103
- Test coverage: ✅ test_uk_vat(), test_us_no_tax()

### FR-003: Invoice Immutability (UNDOCUMENTED)
- Once an invoice status is "SENT", the line items cannot be modified
- Cited: invoice.service.ts:156 — throws error on update if status === 'SENT'
- Test coverage: ❌ NO TEST — this behavior is undocumented and untested

## Inconsistencies Found
- invoice.model.ts:45 allows null due_date
- invoice.service.ts:201 throws if due_date is null when creating a PDF
- These are inconsistent — either null should be disallowed at the model level
  or the PDF generation should handle null gracefully`,
          },
        ]}
      />

      <h2>Structuring Requirements as Acceptance Criteria</h2>

      <p>
        Acceptance criteria are the bridge between stakeholder requirements and AI implementation.
        They must be written in a form that is both human-readable (so stakeholders can validate them)
        and machine-verifiable (so they can be expressed as passing tests). Claude can generate
        acceptance criteria from raw requirements, but you must review them carefully — Claude will
        sometimes write criteria that are too permissive or that miss important negative cases.
      </p>

      <CodeBlock language="text" filename="Acceptance Criteria Generation Prompt">
{`Convert this requirement into acceptance criteria using the Gherkin Given/When/Then format.

Requirement: "Users should be able to reset their password via email"

For each scenario:
- Cover the happy path
- Cover all error cases (invalid email, expired token, already-used token)
- Cover security cases (token can only be used once, expires after 1 hour)
- Include negative tests (what should NOT happen)

Output as a .feature file I can use as the basis for implementation tests.`}
      </CodeBlock>

      <CodeBlock language="gherkin" filename="password-reset.feature">
{`Feature: Password Reset

  Scenario: Successful password reset
    Given a registered user with email "alice@example.com"
    When Alice requests a password reset
    Then she receives an email containing a reset link
    And the link contains a token that expires in 60 minutes

  Scenario: Password reset with unregistered email
    Given no user exists with email "ghost@example.com"
    When a password reset is requested for "ghost@example.com"
    Then the response is 200 OK (to prevent email enumeration)
    And no email is sent

  Scenario: Token expires after 1 hour
    Given Alice has a password reset token created 61 minutes ago
    When she attempts to use the token
    Then she receives a 400 error with message "Reset link has expired"
    And her password is not changed

  Scenario: Token can only be used once
    Given Alice has successfully reset her password using a token
    When she attempts to use the same token again
    Then she receives a 400 error with message "Reset link has already been used"

  Scenario: Token is invalidated when password changes by other means
    Given Alice has an active reset token
    When Alice changes her password through account settings
    Then the reset token is invalidated
    And attempting to use the old token returns 400`}
      </CodeBlock>

      <h2>Requirements Conflicts and Gap Analysis</h2>

      <p>
        Large projects accumulate requirements from multiple stakeholders across multiple sessions.
        Conflicts between them are common and often go unnoticed until implementation reveals the
        contradiction. Claude can perform systematic gap and conflict analysis across a requirements
        document.
      </p>

      <PatternBlock title="Requirements Conflict Detection">
        Before beginning implementation of a large feature, give Claude the full requirements document
        and ask it to identify: (1) requirements that directly contradict each other, (2) requirements
        that overlap without explicitly reconciling the overlap, (3) requirements that imply infrastructure
        or capabilities not mentioned elsewhere, and (4) requirements with no acceptance criteria.
        This analysis typically takes Claude 30-60 seconds and surfaces issues that would take days to
        discover during implementation.
      </PatternBlock>

      <BestPracticeBlock title="Commit Requirements Before Implementation">
        Treat the final requirements document — acceptance criteria, edge cases, and all — as a
        first-class artefact that is committed to git before any implementation begins. This creates an
        immutable record of what was agreed, prevents scope creep during Claude sessions (Claude cannot
        quietly relax a requirement it does not remember), and gives you a reference point for future
        change requests. The requirements document is not a living document during the implementation
        sprint — it is a specification that Claude works against.
      </BestPracticeBlock>

      <WarningBlock title="Claude Fills Gaps With Assumptions">
        When a requirement is ambiguous, Claude does not stop and ask for clarification by default. It
        makes a choice based on what seems most likely given its training data, and continues. These
        silent assumptions are the primary source of AI-generated code that is technically correct but
        wrong for your context. The mitigation is to ask Claude explicitly: "Before implementing,
        list every assumption you are making that is not stated in the requirements." Review that list.
        Any incorrect assumption is a bug you prevented.
      </WarningBlock>

      <NoteBlock type="tip" title="The 10-Minute Requirements Audit">
        Before starting any non-trivial implementation session with Claude, spend 10 minutes running
        your requirements through this checklist: (1) Is the happy path fully specified? (2) Are error
        cases enumerated? (3) Are security requirements explicit? (4) Are performance requirements
        stated with numbers? (5) Are there any "it should be obvious" assumptions that aren't written
        down? Every "yes, but it's obvious" is a gap. Write it down. What's obvious to you is not
        obvious to a model trained on the entire internet.
      </NoteBlock>
    </article>
  )
}
