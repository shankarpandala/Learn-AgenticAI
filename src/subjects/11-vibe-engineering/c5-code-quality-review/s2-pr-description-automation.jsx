import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function PRDescriptionAutomation() {
  return (
    <article className="prose-content">
      <h1>PR Description Automation</h1>

      <p>
        Pull request descriptions are engineering communication artefacts. A good PR description
        explains what problem is being solved, what approach was taken, what the reviewer should
        focus on, and how to test the change. A bad PR description is "fixes stuff" or a copy-paste
        of the commit messages. The difference matters: reviewers make better decisions with context,
        and future engineers reading git history understand the codebase better when PRs are well-described.
      </p>

      <p>
        Writing good PR descriptions is exactly the kind of structured, pattern-following task that
        Claude excels at — given the diff, the ticket, and a template, Claude can produce a
        professional PR description faster than a human and without the temptation to shortcut it
        under time pressure.
      </p>

      <ConceptBlock title="PR Descriptions as Team Communication">
        A PR description is not for the author — it is for the reviewer and for future engineers
        reading git history. The author knows what they did and why. The PR description exists to
        communicate that knowledge to everyone else. When Claude generates PR descriptions, it does
        so from the reader's perspective: what does a reviewer need to know to evaluate this change?
        What context is not obvious from reading the diff alone?
      </ConceptBlock>

      <h2>PR Description Slash Command</h2>

      <CodeBlock language="markdown" filename=".claude/commands/pr-description.md">
{`# Generate PR Description

Generate a professional pull request description for the current branch.

## Information to gather
1. Run: git log origin/main..HEAD --oneline (get commit list)
2. Run: git diff origin/main..HEAD --stat (get files changed summary)
3. Run: git diff origin/main..HEAD (get full diff)
4. If JIRA MCP is connected, read the linked ticket

## PR Description Template

markdown
## What & Why
<!-- 2-3 sentences: what problem does this solve? why now? -->

## Approach
<!-- How was this implemented? Were there alternative approaches considered?
     Why was this approach chosen? Keep to the most important decisions. -->

## Changes
<!-- Key changes, grouped logically (not a file-by-file list) -->
- **[Area]**: What changed and why

## Testing
<!-- How was this tested? What tests were added? -->
- [ ] Unit tests: [test file] — [what they cover]
- [ ] Integration tests: [what scenario]
- [ ] Manual testing: [how to manually verify if applicable]

## Review Focus
<!-- What should reviewers pay most attention to? -->
- [The most important thing to review]
- [Any areas of uncertainty or tradeoffs]

## Related
- JIRA: [TICKET-ID](link)
- ADR: [if this implements or relates to an ADR]
- Follows up on: [PR number if this is related to a previous PR]


## Output
Generate the description following this template.
Do not include sections that don't apply (e.g., no ADR section if not relevant).
Be specific — use actual file names, function names, and line numbers where helpful.
Aim for 200-400 words total.`}
      </CodeBlock>

      <h2>Changelog Generation</h2>

      <p>
        Changelogs are consistently neglected because they require synthesising information across
        many PRs after the fact. Claude can generate well-structured changelogs from git history
        on demand — either for a release or for periodic documentation updates.
      </p>

      <SDKExample
        title="Automated Changelog Generation"
        tabs={[
          {
            label: "prompt",
            language: "text",
            filename: "Changelog prompt",
            code: `Generate a user-facing changelog for the changes between tags v2.3.0 and v2.4.0.

Steps:
1. Run: git log v2.3.0..v2.4.0 --oneline
2. For each commit, categorize it:
   - feat: New feature
   - fix: Bug fix
   - perf: Performance improvement
   - security: Security fix
   - breaking: Breaking change (!! — these go at the top)

Format as a CHANGELOG.md entry:

## [2.4.0] - 2025-03-15

### Breaking Changes
- [Only if any breaking changes exist]

### Security
- [Security fixes — brief but clear about what was fixed]

### New Features
- [User-facing description, not technical implementation detail]

### Bug Fixes
- [What was broken, what is fixed]

### Performance
- [Measurable improvement if known]

Rules:
- Write from the user/operator perspective ("Added support for..." not "Implemented...")
- Security fixes: mention the vulnerability type without giving exploitation detail
- Breaking changes: explain what users need to change in their configuration/code`,
          },
          {
            label: "output",
            language: "markdown",
            filename: "CHANGELOG.md entry",
            code: `## [2.4.0] - 2025-03-15

### Security
- Fixed rate limiting bypass that allowed API keys to exceed request limits at
  Redis cluster failover boundaries (#847)
- API keys are now stored hashed in Redis, preventing key exposure if the
  cache layer is compromised (#851)

### New Features
- Added per-API-key rate limiting with configurable limits (default: 100 req/min)
  Rate limit status is visible in X-RateLimit-Limit, X-RateLimit-Remaining,
  and X-RateLimit-Reset response headers (#847)
- Product catalogue now supports cursor-based pagination for consistent
  performance on large catalogues (#823)
- Added support for EUR and GBP currencies in the checkout flow (#834)

### Bug Fixes
- Fixed invoice tax calculation incorrectly applying UK VAT to EU customers (#819)
- Fixed password reset tokens not being invalidated when the user changes their
  password through account settings (#826)

### Performance
- Product list endpoint p95 latency reduced from 450ms to 180ms by adding
  composite index on (category, deleted_at) (#831)`,
          },
        ]}
      />

      <h2>Migration Guide Generation</h2>

      <p>
        Breaking changes require migration guides that explain what changed, why, and exactly
        how to update consuming code. These are time-consuming to write but critical for
        downstream teams. Claude can draft migration guides from the diff and the ADR.
      </p>

      <CodeBlock language="text" filename="Migration Guide Prompt">
{`Generate a migration guide for the breaking API change in this PR.

The change: Renamed 'customer_id' field to 'account_id' in all API responses.
Deprecation period: customer_id will continue to be returned alongside account_id
until v3.0.0, then removed.

The migration guide should:
1. Explain what changed (before/after examples)
2. Explain why the change was made (briefly)
3. Give step-by-step migration instructions
4. Show before/after code examples for the most common usage patterns
5. Explain what the deprecation timeline is
6. List the endpoints affected

Audience: engineers consuming our REST API (not internal contributors).`}
      </CodeBlock>

      <h2>Release Notes for Product Teams</h2>

      <p>
        Product-facing release notes are different from technical changelogs — they focus on user
        impact rather than implementation detail. Claude can translate technical changelogs into
        product-team-readable release notes.
      </p>

      <CodeBlock language="text" filename="Release Notes Translation Prompt">
{`Translate this technical changelog into product release notes for our product team.

Rules:
- Write in plain English (no code, no technical terms without explanation)
- Focus on user impact ("Customers can now..." not "Added endpoint...")
- Security fixes: mention only if they affect user behavior
- Performance improvements: translate to user experience ("Pages load faster")
- Skip: refactoring, test additions, internal tooling changes
- Format: 3-5 bullet points, each one sentence

Input: [paste technical changelog]`}
      </CodeBlock>

      <PatternBlock title="PR Description as the Source of Truth">
        The PR description should be thorough enough that a future engineer reading it without the
        code context can understand: what problem was being solved, what approach was taken, and
        what tradeoffs were accepted. This is especially important for decisions that look
        questionable out of context — "we chose the simpler approach here because the performance
        SLA doesn't require the more complex algorithm." Without that context in the PR description,
        the next engineer to touch that code may refactor it "correctly" and break the deliberate
        simplicity tradeoff.
      </PatternBlock>

      <BestPracticeBlock title="Review the Generated Description Before Submitting">
        Claude's generated PR description is a starting draft, not a final submission. Read it
        before posting. Check: (1) Is the "Why" section accurate — does it capture the real
        motivation? (2) Are the reviewer focus areas the right ones? (3) Is there any context
        that only you know that didn't make it in? (4) Would a reviewer who wasn't at the planning
        meeting understand the approach? A 5-minute review of a generated description is much
        faster than writing one from scratch, and it's still your communication.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Store the PR Template in CLAUDE.md">
        Add your PR description template to CLAUDE.md so Claude applies it automatically in any
        session, not just when the slash command is invoked. Append: "When creating a PR, use the
        PR description template from .github/pull_request_template.md." This ensures consistent
        descriptions whether the PR is created via the slash command, at the end of a feature
        session, or any other way.
      </NoteBlock>
    </article>
  )
}
