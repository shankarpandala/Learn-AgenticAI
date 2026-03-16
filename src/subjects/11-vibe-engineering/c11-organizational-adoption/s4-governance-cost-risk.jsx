import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function GovernanceCostRisk() {
  return (
    <article className="prose-content">
      <h1>Governance, Cost, and Risk Management</h1>

      <p>
        Scaling AI coding assistant adoption from a pilot with ten engineers to a program
        with hundreds introduces governance, cost, and risk management challenges that
        are not present at the individual level. Token costs that are negligible for one
        engineer become significant at scale. Risks that are manageable for occasional
        use (data exposure, IP contamination, model hallucinations) require systematic
        controls at scale. And the organizational changes required for effective AI adoption
        — new roles, new processes, new skills — require change management discipline.
      </p>

      <p>
        Vibe Engineering organizations treat AI adoption as a program to be managed,
        not just a tool rollout. This means budget management, risk frameworks, intellectual
        property policies, and governance structures that scale with the organization.
      </p>

      <ConceptBlock title="Token Governance as Cloud Cost Management">
        AI API costs scale with usage in ways that are less visible than traditional
        compute costs. A single poorly-scoped prompt that sends 100,000 tokens of context
        to the API costs more than a hundred efficiently-scoped prompts. Organizations
        deploying Claude Code at scale need the same cost governance they apply to
        AWS or Azure spend: budgets, alerts, cost attribution by team, and optimization
        guidance that helps engineers use AI efficiently.
      </ConceptBlock>

      <SDKExample
        title="Token Usage Monitoring and Budget Management"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'token-governance.sh',
            code: `# Set up token usage monitoring for the organization
claude "Design a token governance system for our Claude Code deployment.

Current usage:
- 50 engineers using Claude Code
- Anthropic API key shared via enterprise proxy
- Current monthly spend: $X (from last invoice)
- No per-team visibility or limits

Design required:

1. COST ATTRIBUTION
   - How to attribute token usage to individual engineers and teams
   - Options: per-user API keys, proxy with header-based attribution, audit log parsing
   - Recommendation with implementation details

2. BUDGET ALERTS
   - Daily spend alert: >$X triggers Slack notification to FinOps team
   - Weekly team report: each team lead receives their team's usage
   - Monthly forecast: project end-of-month spend based on daily trend

3. USAGE OPTIMIZATION RULES (add to org CLAUDE.md)
   - Context window efficiency: include only relevant code, not entire files
   - Prefer focused prompts over broad exploration prompts
   - Use --continue for follow-up questions in same session (reduces context reload)
   - Archive completed sessions (frees context for new work)

4. BUDGET POLICY
   - Team monthly budget: allocated based on team size and complexity
   - Overage process: engineer reviews with team lead, adjust limit if justified
   - No hard cutoffs that would interrupt incident response

Generate:
- Implementation plan for option 1 (cost attribution)
- Alert configuration for option 2
- Policy document for option 4"`,
          },
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'CLAUDE.md (token efficiency)',
            code: `## Claude Code Session Efficiency Guidelines

### Context Window Management
- Include only relevant files in context — do not paste entire codebases
- For large files, include only the functions/classes relevant to the current task
- Reference file paths for context Claude can read itself vs. pasting content directly
- Close and start fresh sessions when switching to unrelated tasks

### Prompt Efficiency
- Be specific about scope: 'Add error handling to the processPayment() function'
  is more efficient than 'Review the payment code and suggest improvements'
- Include expected output format to reduce back-and-forth
- Ask Claude to plan before implementing for complex tasks (reduces failed attempts)

### Session Management
- Use --continue flag to stay in the same session for related follow-up questions
- Start a new session when context has drifted (errors mentioning irrelevant code)
- Save session transcripts for debugging and knowledge capture

### Cost-Aware Patterns
- Use claude with specific file paths rather than 'look at everything'
- For exploratory sessions, use a focused sample rather than all files
- Request summaries rather than full output when you need an overview`,
          },
        ]}
      />

      <h2>Intellectual Property Risk Management</h2>

      <SDKExample
        title="IP Risk Policy and Technical Controls"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'docs/policy/ai-ip-policy.md',
            code: `# AI and Intellectual Property Policy

## What Claude Code Generates Is Ours
Code generated by Claude Code as part of your work product belongs to [Organization].
Anthropic's enterprise agreement includes IP indemnification for Claude-generated code.

## License Contamination Risk
AI models are trained on public code that includes open-source code under various licenses.
There is a theoretical risk that Claude could reproduce open-source code verbatim in
a way that creates a license obligation.

Mitigation approach:
1. Claude Code by default does not reproduce long verbatim passages of training data
2. For any generated function > 50 lines that looks "too clean" or "too standard",
   run it through our license scanner: 
   npx licensee-check generated-file.ts
3. All generated code undergoes code review — reviewers should flag anything that
   looks like it could be from a known open-source project

## Competitor Code Prohibition
NEVER paste code, architecture documents, or technical specifications from:
- Competitors or potential acquisition targets
- Third parties under NDA
- Code you have obtained through unauthorized means

This includes: screenshots of competitor code, decompiled binaries, leaked source code.
Doing so could create legal liability regardless of what Claude does with the input.

## Trade Secret Inputs
When working on proprietary algorithms or unreleased features:
- Use Claude Code without including the proprietary algorithm in the prompt
- Describe the algorithm abstractly if you need AI assistance with surrounding code
- Consult legal before pasting unreleased product specifications into any AI tool

## Enterprise Agreement Coverage
Our Claude Code enterprise agreement includes:
- Data residency in EU (required for GDPR)
- No training on our prompts or outputs
- IP indemnification
- SOC 2 Type II certification

See: docs/vendor/anthropic-enterprise-agreement-summary.md`,
          },
        ]}
      />

      <h2>Risk Register for AI Adoption</h2>

      <SDKExample
        title="AI Risk Assessment and Mitigation"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'ai-risk-assessment.sh',
            code: `# Generate AI adoption risk register
claude "Generate a risk register for our AI coding assistant program.

For each risk category below, assess:
- Likelihood (High/Medium/Low)
- Impact (High/Medium/Low)
- Current controls
- Recommended additional controls

Risk categories:

1. DATA EXPOSURE
   Risk: Engineers paste customer PII or credentials into AI prompts
   
2. SECURITY VULNERABILITIES
   Risk: AI-generated code introduces security vulnerabilities that pass review
   
3. MODEL HALLUCINATION
   Risk: Claude generates plausible but incorrect code that passes tests 
   but fails in edge cases
   
4. VENDOR DEPENDENCY
   Risk: Heavy reliance on Anthropic creates concentration risk (API changes, pricing,
   service availability)
   
5. SKILL ATROPHY
   Risk: Engineers lose ability to write code without AI assistance, reducing
   team capability when AI is unavailable

6. INTELLECTUAL PROPERTY
   Risk: AI-generated code reproduces open-source code in ways that create license obligations
   
7. REGULATORY COMPLIANCE
   Risk: AI outputs in regulated domains (medical, financial) are incorrect and acted upon
   
8. COST OVERRUN
   Risk: Token costs escalate beyond budget as usage scales

Format as a risk register table with columns:
Risk | Likelihood | Impact | Risk Score | Current Controls | Additional Controls | Owner"`,
          },
        ]}
      />

      <WarningBlock title="Skill Atrophy Is a Real Organizational Risk">
        Over-reliance on AI coding assistance can reduce engineers' ability to reason
        about code independently — a skill that remains essential when AI tools are
        unavailable (during incidents with network issues, for extremely sensitive
        contexts where AI cannot be used, or when a specific problem is outside AI's
        capability). Organizations should ensure engineers maintain fundamental coding
        skills through deliberate practice: code review of AI-generated code (requires
        reading and understanding code), algorithmic problem-solving sessions without AI,
        and periodic design discussions where AI is not the first tool reached for.
      </WarningBlock>

      <BestPracticeBlock title="Multi-Vendor Strategy for Resilience">
        Dependence on a single AI provider creates concentration risk. A Anthropic API
        outage or a significant pricing change could disrupt the entire engineering
        organization. Build resilience through: (1) evaluating multiple tools annually
        (Claude Code, GitHub Copilot, Cursor), (2) maintaining the ability to work
        without AI for critical workflows, (3) documenting AI-specific process dependencies
        in your business continuity plan. This is not about distrusting Anthropic — it
        is the same portfolio approach applied to any critical vendor.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Quarterly Business Review for AI Program">
        Treat your AI coding assistant program like any significant technology investment:
        run a quarterly business review that covers spend vs. budget, measured impact
        vs. targets, open risks and their mitigation status, and upcoming changes
        (new capabilities, policy updates, pricing changes). Include both engineering
        leadership and finance. This keeps the program accountable, surfaces problems
        before they escalate, and demonstrates the organizational maturity that justifies
        continued investment in AI-assisted engineering.
      </NoteBlock>
    </article>
  )
}
