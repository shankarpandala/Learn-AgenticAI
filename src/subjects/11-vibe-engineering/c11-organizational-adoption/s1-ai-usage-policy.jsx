import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function AIUsagePolicy() {
  return (
    <article className="prose-content">
      <h1>AI Usage Policy</h1>

      <p>
        Organizations deploying AI coding assistants at scale need a formal AI usage policy —
        not as a bureaucratic control, but as a framework that enables engineers to use AI
        confidently within boundaries that protect the organization, its customers, and its
        engineers. Without policy, engineers either self-censor (avoiding AI because they
        are uncertain what is allowed) or overreach (sharing customer data with AI assistants
        without considering the implications).
      </p>

      <p>
        An effective AI usage policy is specific enough to be actionable, honest about the
        reasons for each constraint, and written by people who understand both the capabilities
        and the risks of AI assistants. It is not a blanket prohibition or a blanket approval —
        it is a nuanced framework that maximizes legitimate AI use while preventing the harms
        that justify the constraints.
      </p>

      <ConceptBlock title="Policy Principles">
        A good AI usage policy is built on three principles: (1) Proportionality — the
        restrictions are proportional to the risk (high restrictions for customer PII,
        lower restrictions for internal tooling), (2) Clarity — engineers know exactly
        what is and isn't allowed without consulting legal, and (3) Enforcement — the
        policy includes technical controls where possible, not just rules that depend
        entirely on individual compliance.
      </ConceptBlock>

      <SDKExample
        title="AI Usage Policy Template"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'docs/policy/ai-usage-policy.md',
            code: `# AI Coding Assistant Usage Policy
Version: 1.2 | Effective: 2024-01-01 | Owner: Engineering Leadership
Review cycle: Quarterly

## Purpose
This policy governs the use of AI coding assistants (Claude Code, GitHub Copilot,
Cursor, and similar tools) in engineering work at [Organization]. It enables engineers
to capture the productivity benefits of AI assistance while protecting customer data,
intellectual property, and security.

## Approved AI Tools
- Claude Code (primary, enterprise license with data residency in EU)
- GitHub Copilot (secondary, for IDE inline completion only)

## What You May Do
- Use AI assistants to write, review, and refactor code
- Ask AI to explain unfamiliar code, APIs, or concepts
- Generate tests, documentation, and boilerplate
- Debug errors and analyze stack traces
- Generate infrastructure code, pipeline configs, runbooks

## Prohibited Data — NEVER Include in AI Prompts
The following data types must never be pasted into an AI assistant prompt:

HIGH RISK (immediate disciplinary action):
- Customer PII: names, emails, addresses, phone numbers
- Customer financial data: card numbers, bank accounts, transaction history
- Authentication credentials: passwords, API keys, tokens, secrets
- Regulated health data (PHI): any patient health information
- Proprietary algorithms or unreleased product specifications

MEDIUM RISK (requires manager approval before use):
- Anonymized customer data (even without direct identifiers)
- Source code from acquired companies under NDA
- Internal product roadmap documents

ALLOWED (no approval needed):
- Your own code and the organization's internal source code
- Sanitized/synthetic data that has no connection to real customers
- Publicly available information

## Code Review Requirements
All AI-generated code must be reviewed by the engineer who will submit it.
'Claude wrote it' is not a substitute for review.
Specific review requirements:
- Security-sensitive code: review by qualified security engineer
- Payment processing code: review by payments team + security
- Infrastructure changes: review by DevOps team

## Intellectual Property
- AI-generated code in your work product belongs to [Organization]
- Do not paste competitor code or third-party proprietary code into AI tools
- Understand: AI training data may include open-source code; review generated code for
  accidental license-incompatible reproduction

## Compliance
- GDPR/HIPAA: prohibitions on customer data above apply with particular force
- SOC 2: AI tool access is logged (via Claude Code audit log integration)
- Security incidents: if you accidentally share prohibited data with an AI tool,
  report to security@example.com immediately

## Enforcement
- Technical: Claude Code API usage logged centrally for audit
- Process: Code review includes AI usage declaration in PR description
- Disciplinary: violations of PII/credential prohibitions escalate to HR`,
          },
        ]}
      />

      <SDKExample
        title="Generating a Policy with Claude"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-policy.sh',
            code: `# Use Claude to draft an AI usage policy for your organization
claude "Draft an AI coding assistant usage policy for our organization.

Organization context:
- Industry: Financial services (regulated)
- Company size: 200 engineers
- Regulatory requirements: PCI-DSS (payment processing), GDPR (EU customers)
- Current AI tools: Claude Code (enterprise), GitHub Copilot
- Data sensitivity: customer financial data, transaction history, PII
- Existing security policies: docs/security/data-classification-policy.md

Policy requirements:
1. Clear rules on what data can/cannot be shared with AI tools
2. Code review requirements for AI-generated code
3. Tool approval process (how to request access to new AI tools)
4. Incident reporting procedure for accidental data exposure
5. Enforcement mechanisms (technical + process)

Write the policy in plain language that engineers will actually read.
Avoid legal jargon where possible — use 'you must not' rather than 'prohibited by policy'.
Include a 'Quick Reference' section at the top with the 5 most important rules.
Target length: 2-4 pages, not 20 pages.

After drafting: identify any sections that should be reviewed by legal counsel
before publication."`,
          },
        ]}
      />

      <h2>Policy Communication and Training</h2>

      <SDKExample
        title="Policy Training Materials"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-training.sh',
            code: `# Generate policy training scenarios for onboarding
claude "Generate 10 scenario-based training questions for our AI usage policy.

Each scenario should:
1. Present a realistic situation engineers might encounter
2. Be ambiguous enough to require thinking (not obviously right/wrong)
3. Have a clear correct answer based on our policy
4. Include an explanation of why the answer is correct

Example format:
---
Scenario: You are debugging a payment processing bug and need to paste the relevant
code into Claude Code. The code references a database query that includes a customer's
transaction history by customer_id (a UUID).

Question: Is it acceptable to include this code in your Claude Code prompt?

Answer: YES — customer_id (UUID) without accompanying PII is acceptable. The UUID alone
cannot identify a specific customer without access to the mapping database. However,
do not include actual transaction amounts, dates, or any data that combined with the
UUID could identify a customer.
---

Topics to cover:
- Customer PII in debugging sessions
- Stack traces that contain email addresses
- Testing with production data
- Sharing competitor analysis with AI
- Storing AI-generated code without review
- Using AI for security-sensitive changes",`,
          },
        ]}
      />

      <WarningBlock title="Policy Must Come From Leadership, Not Just Security">
        An AI usage policy that is perceived as a security team's attempt to restrict
        engineers will be ignored or worked around. The most effective policies are
        written collaboratively between security, legal, and engineering leadership —
        and explicitly acknowledge the productivity benefits engineers get from AI tools.
        Frame restrictions as protecting engineers and the organization, not as
        distrust of engineers. "We prohibit pasting customer PII into AI tools because
        it may violate our data processing agreements and could expose us to GDPR fines"
        is more compelling than "prohibited by security policy."
      </WarningBlock>

      <BestPracticeBlock title="Review Quarterly, Not Annually">
        AI capabilities and risks evolve faster than annual policy review cycles. The
        tools available in Q1 2025 are significantly different from Q4 2024, and the
        policy needs to keep pace. Schedule quarterly policy reviews that cover:
        what new AI tools engineers are using (officially or not), whether any incidents
        have occurred that reveal policy gaps, and whether the approved tool list needs
        updating. Use Claude to assist in the review: "Compare our current AI usage
        policy against new capabilities in Claude 3.5 and identify any policy sections
        that should be updated."
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Technical Controls Outperform Rules Alone">
        Policy rules that depend entirely on individual compliance will be violated —
        not from malice, but from time pressure, habit, and context switching. Add
        technical controls wherever possible: configure Claude Code to refuse prompts
        that match credit card number patterns, use DLP (Data Loss Prevention) tools
        to scan for PII before it leaves the corporate network, and log AI tool usage
        centrally for audit. Technical controls catch accidents that rules alone cannot.
      </NoteBlock>
    </article>
  )
}
