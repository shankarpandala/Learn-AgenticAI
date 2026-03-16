import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function CenterOfExcellence() {
  return (
    <article className="prose-content">
      <h1>AI Engineering Center of Excellence</h1>

      <p>
        When AI coding assistants are deployed across a large engineering organization,
        two failure modes emerge. In the first, adoption is siloed: some teams use AI
        extensively and develop effective patterns, others don't use it at all, and
        the organization's AI capability is fragmented and uneven. In the second, adoption
        is ungoverned: everyone uses AI, but each team develops its own patterns,
        CLAUDE.md conventions, slash commands, and quality gates independently — resulting
        in duplicated effort and inconsistent outcomes.
      </p>

      <p>
        An AI Engineering Center of Excellence (CoE) addresses both failure modes. It
        creates shared infrastructure (organization-wide CLAUDE.md templates, slash
        command libraries, MCP servers, quality gate standards) that all teams can use,
        while establishing the governance model that ensures consistent, compliant AI use.
        It also creates a community of practice where teams share patterns, learnings,
        and tools.
      </p>

      <ConceptBlock title="CoE vs. Centralized Control">
        An AI Engineering CoE operates on the enabling team model, not the centralized
        control model. Its job is to build shared tooling and patterns that reduce the
        cost of doing AI development correctly — making the right path the easy path.
        It does not mandate how teams use AI in their day-to-day work (that would create
        a bottleneck and resentment). It mandates the boundaries (security, compliance,
        quality gates) and enables teams to move fast within those boundaries.
      </ConceptBlock>

      <SDKExample
        title="CoE Shared CLAUDE.md Template"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'templates/CLAUDE.md (org-wide base)',
            code: `# [Organization] Engineering Standards — CLAUDE.md Base Template
# This template is maintained by the AI Engineering CoE
# Version: 2024-Q4 | Last updated: 2024-12-01
# Import into project-specific CLAUDE.md: @include base-standards.md

## Non-Negotiable Security Rules (enforced by SAST + security gates)
- Never store credentials in code: use AWS Secrets Manager or environment variables
- SQL: parameterized queries ONLY (Prisma, TypeORM ORMs enforce this; raw queries forbidden)
- Auth: JWT in httpOnly cookies ONLY — never localStorage
- Passwords: bcrypt cost >= 12 — never MD5, SHA1, SHA256 raw
- Input validation: Zod/Joi schema validation on ALL external inputs before processing
- CSRF protection: SameSite=Strict + CSRF token on all state-changing endpoints
- Rate limiting: every auth endpoint requires rate limiting (max 5/min per IP)
- Secrets scanning: gitleaks pre-commit hook is mandatory

## Code Quality Standards
- Test coverage: new code must not decrease coverage below current baseline
- Complexity: functions > 15 cyclomatic complexity require refactoring before PR
- Type safety: TypeScript strict mode, no 'any' type without explicit justification comment
- Linting: ESLint + Prettier, zero lint errors before PR review

## AI Development Standards
- SAST runs in every Claude Code session (semgrep --config auto)
- Tests written before implementation for all business logic (AI-TDD)
- Every AI-generated function must have a test
- Architecture conformance: depcruise check before PR

## Org-Specific Tools and Patterns
- JIRA integration: /analyze-ticket command for story analysis
- Internal MCP: jira-mcp, confluence-mcp, vault-mcp available in enterprise setup
- Custom slash commands: see /docs/ai-engineering/slash-commands.md
- ADR template: /write-adr command

## What This Template Does NOT Cover
- Language-specific patterns (add in your project's CLAUDE.md)
- Service-specific architecture decisions (add in your project's CLAUDE.md)
- Team-specific conventions (add in your project's CLAUDE.md)`,
          },
        ]}
      />

      <SDKExample
        title="Shared Slash Command Library"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'setup-org-slash-commands.sh',
            code: `# Install org-wide slash command library
# These are maintained by the AI Engineering CoE and available to all engineers

mkdir -p ~/.claude/commands

# Download from internal package registry
npm install @acme-corp/claude-commands --global

# Or clone from internal git
git clone git://git.internal.acme.com/ai-engineering/claude-commands ~/.claude/commands/acme

# Available org-wide commands:
cat ~/.claude/commands/acme/security-scan.md
# /security-scan — Run full security audit: semgrep + npm audit + gitleaks

cat ~/.claude/commands/acme/analyze-ticket.md  
# /analyze-ticket [JIRA-ID] — Fetch ticket, extract acceptance criteria, create test plan

cat ~/.claude/commands/acme/write-adr.md
# /write-adr — Generate Architecture Decision Record from current context

cat ~/.claude/commands/acme/generate-tests.md
# /generate-tests [file] — Generate comprehensive test suite for specified file

cat ~/.claude/commands/acme/pr-review.md
# /pr-review — Run AI code review: security, conformance, coverage check

cat ~/.claude/commands/acme/incident-triage.md
# /incident-triage [INCIDENT-ID] — Start structured incident triage session

# List all available commands
ls ~/.claude/commands/acme/`,
          },
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'commands/security-scan.md (slash command)',
            code: `Run a comprehensive security scan on the current codebase changes.

Steps:
1. SAST scan with semgrep:
   npx semgrep --config auto src/ --json > /tmp/semgrep-results.json
   
2. Dependency audit:
   npm audit --json > /tmp/npm-audit.json
   
3. Secret detection:
   gitleaks detect --source . --log-opts="origin/main..HEAD" --json > /tmp/gitleaks.json 2>/dev/null

4. Architecture check:
   npx depcruise src/ --config .dependency-cruiser.js --output-type err 2>/dev/null

Analyze all results and report:
- CRITICAL findings (must fix before PR): list with file, line, description, fix
- HIGH findings (should fix before PR): list with file, line, description, fix
- MEDIUM findings (add to tech debt register): list
- Architecture violations: list

If any CRITICAL findings: DO NOT proceed until fixed.
If zero findings: report 'Security scan PASSED — no issues found.'`,
          },
        ]}
      />

      <h2>Governance Model</h2>

      <SDKExample
        title="CoE Governance Structure"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'docs/ai-engineering/governance.md',
            code: `# AI Engineering CoE Governance

## Structure

### Core Team (full-time CoE members)
- AI Engineering Lead (technical strategy, tool evaluation, standards)
- DevOps/Platform Engineer (MCP servers, CI/CD integration, tooling)
- Security Engineer (security standards, policy, SAST rules)

### Community of Practice (representatives from each team)
- One AI champion per engineering team (volunteer, 20% time)
- Monthly community meetings: share patterns, report adoption blockers
- Quarterly all-hands: celebrate wins, share learnings

## Decision Authority

### CoE decides (no team vote needed):
- Security requirements in base CLAUDE.md
- Approved AI tool list
- Compliance controls

### CoE proposes, community votes:
- New shared slash commands
- Changes to code quality standards
- New MCP server integrations

### Teams decide independently:
- Project-specific CLAUDE.md additions
- Team-level conventions and patterns
- How much AI assistance to use for specific tasks

## Change Process for Base CLAUDE.md
1. Engineer proposes change (GitHub issue in ai-engineering/standards repo)
2. CoE reviews for security/compliance implications
3. Community vote (2-week comment period)
4. CoE implements and publishes new version
5. Teams receive automated PR to update their base template import

## SLA for Teams
- New slash command requests: reviewed within 5 business days
- Security exception requests: reviewed within 2 business days
- Tool evaluation requests: reviewed within 10 business days`,
          },
        ]}
      />

      <WarningBlock title="Avoid the Ivory Tower Trap">
        A CoE that is perceived as distant from daily engineering work will be ignored.
        CoE team members should spend at least 20% of their time embedded in product
        teams, using the tools they maintain, experiencing the friction points they
        need to address. The best improvements to org-wide tooling come from engineers
        who use those tools daily. Build feedback loops: a monthly survey asking
        "What friction are you experiencing with AI development?" and a Slack channel
        where teams can report tooling issues in real time.
      </WarningBlock>

      <BestPracticeBlock title="Measure CoE Value in Engineer Hours Saved">
        CoEs are sometimes seen as overhead. Counter this by measuring and reporting
        the value delivered: how many engineer-hours were saved by the shared slash
        command library this quarter? How many security findings were caught by the
        org-wide SAST rules before they reached production? How much faster do new
        engineers reach productivity with the org-wide CLAUDE.md template vs. without
        it? Ask Claude to help measure this: "Analyze our JIRA data for the last quarter
        and estimate the engineer hours saved by CoE tooling, using these assumptions
        about time-per-finding-caught and time-per-command-used."
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Inner-Source the AI Engineering Tooling">
        Treat the CoE's tooling (slash commands, CLAUDE.md templates, MCP servers) as
        inner-source projects: published in an internal package registry, documented,
        versioned with changelogs, and open to contributions from any engineer in the
        organization. Engineers who contribute improvements to shared tooling should
        be recognized — this behavior creates multiplier effects where one engineer's
        workflow improvement benefits the entire organization. Set up a monthly "tools
        spotlight" to highlight engineer contributions to the shared library.
      </NoteBlock>
    </article>
  )
}
