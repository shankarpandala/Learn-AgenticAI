import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function KnowledgeCaptureOnboarding() {
  return (
    <article className="prose-content">
      <h1>Knowledge Capture and Onboarding</h1>

      <p>
        Every engineering team accumulates tribal knowledge — understanding that lives only
        in the heads of people who were there. Why was this service extracted from the monolith
        instead of left in place? Why does the payment flow have three redundant retry mechanisms?
        Why is there a mysterious sleep(2000) in the checkout handler that nobody dares remove?
        This knowledge is invisible to new engineers, invisible to auditors, and vulnerable
        to departures. When the engineer who made those decisions leaves, the knowledge leaves
        with them.
      </p>

      <p>
        Claude Code can help capture this knowledge in two ways: by analyzing commit history
        and code comments to infer the reasoning behind decisions, and by providing a
        conversational interface for existing engineers to externalize their knowledge
        into structured documentation. The goal is a codebase that explains itself —
        one where a new engineer can understand not just what the code does but why
        it does it that way.
      </p>

      <ConceptBlock title="Decision Archaeology">
        Decision archaeology is the practice of using git history, commit messages, PR
        descriptions, and code comments to reconstruct the reasoning behind past decisions.
        Claude can perform this analysis at scale — reading thousands of commits and
        synthesizing the story of how a system evolved into its current state. This creates
        the foundation for onboarding documentation that captures not just the current
        architecture but the context that explains it.
      </ConceptBlock>

      <SDKExample
        title="Codebase Orientation Guide Generation"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-onboarding-docs.sh',
            code: `# Generate a codebase orientation guide for new engineers
claude "Generate a codebase orientation guide for new engineers joining the team.

Analyze:
1. Directory structure: ls -la src/
2. Package.json for tech stack and key dependencies
3. README.md (if exists)
4. CLAUDE.md for architectural decisions and conventions
5. docs/architecture/ for system design
6. git log --oneline -50 for recent significant changes

Generate: docs/ONBOARDING.md

Required sections:

## Quick Start (Day 1)
- How to run the application locally (exact commands)
- How to run tests (exact commands)
- How to access the development environment
- Who to ask when stuck (link to team channels)

## Architecture Overview
- What the system does (business context)
- High-level architecture (link to C4 diagram or inline Mermaid)
- Key services and their responsibilities
- Data flow for the most important user journey

## Codebase Structure
For each top-level src/ directory:
- What it contains
- When would I add something here vs elsewhere?
- Key conventions to know

## Development Conventions
- Branch naming: feature/ENG-XXX-description
- Commit format: conventional commits (feat:, fix:, docs:, etc.)
- PR requirements: tests, CLAUDE.md constraints, reviewer assignment
- How to use CLAUDE.md when writing code with Claude Code

## Common Development Tasks
- Adding a new API endpoint: step-by-step guide
- Adding a new database model: step-by-step guide
- Running and writing tests: guide with examples

## Where to Find Things
- API documentation: /docs/api/
- Architecture decisions: /docs/architecture/decisions/ (ADRs)
- Runbooks: /docs/runbooks/
- Incident history: /docs/incidents/"`,
          },
        ]}
      />

      <h2>Tribal Knowledge Extraction</h2>

      <SDKExample
        title="Extracting Tribal Knowledge from Commit History"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'extract-tribal-knowledge.sh',
            code: `# Extract tribal knowledge from git history for a specific file
claude "Perform decision archaeology on src/services/payment/PaymentProcessor.ts.

Analyze the full git history for this file:
git log --follow -p src/services/payment/PaymentProcessor.ts | head -500

Also analyze:
git log --follow --format='%H %s %b' src/services/payment/PaymentProcessor.ts

For each significant change:
1. What was the business reason for the change?
2. What problem was being solved?
3. What alternatives were considered (from PR description or commit message)?
4. Are there any 'do not remove' or 'important' comments that explain constraints?

Special attention to:
- Any sleep() or artificial delays: why do they exist? Is the reason still valid?
- Multiple retry mechanisms: what failure modes were they added to handle?
- Unusual error handling patterns: what incidents prompted them?
- Configuration flags and feature flags: are they still needed?

Generate: docs/architecture/decisions/ADR-PAYMENT-PROCESSOR-HISTORY.md
Format as a decision log showing the evolution of this service."`,
          },
          {
            label: 'bash',
            language: 'bash',
            filename: 'knowledge-interview.sh',
            code: `# Structured knowledge extraction from a departing engineer
claude "I am a departing senior engineer and I want to document my tribal knowledge
about the payment system before I leave. Ask me questions to extract this knowledge.

Start with:
1. What are the most important things a new engineer needs to know about the payment service?
2. What are the gotchas — things that will bite them if they don't know about them?
3. What decisions were made that seem weird but have good reasons?
4. What would you change if you had 6 more months on this project?

As I answer, help me structure the information into:
- docs/architecture/decisions/ (architectural reasoning)
- docs/runbooks/ (operational procedures)
- Inline code comments (specific code explanations)
- ONBOARDING.md updates (what new engineers need to know first)

Let's start with the most critical knowledge first."`,
          },
        ]}
      />

      <h2>Automated Onboarding Validation</h2>

      <SDKExample
        title="Testing Onboarding Documentation Accuracy"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'validate-onboarding.sh',
            code: `# Validate that onboarding docs are accurate by following them
claude "Act as a new engineer following the ONBOARDING.md documentation.

Read: docs/ONBOARDING.md

For each step in the Quick Start section:
1. Execute the exact command described
2. Report whether it succeeded or failed
3. If failed: what was the actual error? What needs to change in the docs?

For each command in 'Common Development Tasks':
1. Attempt to execute it
2. Verify the expected result matches reality

Report: a list of documentation issues found, with:
- The section that is incorrect
- What the documentation says
- What actually happens
- The corrected command or instruction

This identifies onboarding documentation rot before it frustrates a new team member."`,
          },
        ]}
      />

      <WarningBlock title="Onboarding Docs Rot Silently">
        Onboarding documentation becomes inaccurate the moment it is written, because
        the codebase continues to evolve. Schedule a documentation review every quarter
        where one team member (ideally someone who hasn't onboarded recently) follows
        the onboarding guide and reports anything that doesn't work. Alternatively, use
        each new hire as an opportunity to update the docs: "Keep a log of anything
        confusing or broken during your first week. We'll use your feedback to update
        ONBOARDING.md." New engineers are the most sensitive detectors of documentation
        gaps precisely because they don't have the tribal knowledge to fill them in.
      </WarningBlock>

      <BestPracticeBlock title="Code Comments That Explain Why, Not What">
        The most valuable code comments explain the reasoning behind non-obvious choices,
        not what the code does (which is visible from reading it). Ask Claude: "Review
        src/services/payment/PaymentProcessor.ts and add comments to any code that
        requires domain or historical context to understand. Specifically: explain
        the sleep(500) on line 47, the fallback retry mechanism in processWithFallback(),
        and the hardcoded maximum retry count. Do not add comments that simply restate
        what the code does." Explanatory comments with JIRA ticket references or ADR
        numbers create a paper trail that prevents future engineers from removing
        important constraints without understanding their purpose.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="CLAUDE.md as Onboarding Document">
        Your CLAUDE.md file is itself an onboarding document for AI-assisted development.
        A new engineer who reads the CLAUDE.md understands the project's architectural
        decisions, coding standards, security requirements, and workflow conventions
        before writing a single line of code. Invest in making it comprehensive and
        well-organized — it serves both Claude and human engineers. Ask new hires:
        "After reading our CLAUDE.md, what questions do you still have?" Their questions
        reveal gaps that should be filled before the next hire joins.
      </NoteBlock>
    </article>
  )
}
