import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ReleaseAutomation() {
  return (
    <article className="prose-content">
      <h1>Release Automation</h1>

      <p>
        A release is a decision and a set of operations: determine the new version number,
        generate the changelog, tag the commit, build the artifacts, deploy to production,
        and communicate what changed. Most organizations do some of these steps manually —
        a human decides the version, writes a changelog by reading commits, creates the
        git tag, and types the deployment command. This process is slow, error-prone,
        and inconsistent across releases.
      </p>

      <p>
        Semantic release automates the entire pipeline by making version numbers a function
        of commit messages. Conventional commits (<code>feat:</code>, <code>fix:</code>,
        <code>chore:</code>, <code>BREAKING CHANGE:</code>) encode the version impact of
        each change. The release tooling reads the commits since the last release and
        determines the next version number automatically, generates a structured changelog,
        creates the git tag, publishes the release, and triggers the deployment.
        Claude enforces conventional commits through linting and can generate them correctly
        from any change description.
      </p>

      <ConceptBlock title="Semantic Versioning as Communication">
        Semantic version numbers (MAJOR.MINOR.PATCH) communicate change impact to consumers.
        A patch release signals that no existing behavior changed — consumers can upgrade
        without risk. A minor release adds capability without breaking existing usage. A
        major release breaks the existing API contract and requires consumer migration.
        When version numbers are generated automatically from conventional commits, they
        carry this information reliably. When humans choose version numbers manually, they
        are often wrong — minor changes get major versions, breaking changes get patches.
      </ConceptBlock>

      <SDKExample
        title="Setting Up Semantic Release"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'setup-semantic-release.sh',
            code: `# Install semantic-release and plugins
npm install --save-dev \
  semantic-release \
  @semantic-release/changelog \
  @semantic-release/git \
  @semantic-release/github \
  @semantic-release/npm \
  @commitlint/cli \
  @commitlint/config-conventional

# Configure commitlint
echo "module.exports = { extends: ['@commitlint/config-conventional'] }" > commitlint.config.js

# Add commitlint to pre-commit hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'

# Test commitlint
echo "feat: add new payment method" | npx commitlint  # Should pass
echo "added payment method" | npx commitlint          # Should fail

# Ask Claude to help with commit message format
claude "I need to write a commit message for the following changes:
$(git diff --staged --stat)

Changes summary: Added rate limiting to the login endpoint to prevent brute force attacks.
Added a Redis-backed rate limiter, updated the login handler, and added tests.
This is a new feature that doesn't break existing behavior.

Write the correct conventional commit message for these changes.
Format: type(scope): description
Available types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
Use breaking change footer if applicable."`,
          },
          {
            label: 'json',
            language: 'json',
            filename: '.releaserc.json',
            code: `{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        "preset": "conventionalcommits",
        "presetConfig": {
          "types": [
            { "type": "feat", "section": "Features" },
            { "type": "fix", "section": "Bug Fixes" },
            { "type": "perf", "section": "Performance Improvements" },
            { "type": "revert", "section": "Reverts" },
            { "type": "docs", "section": "Documentation", "hidden": false },
            { "type": "chore", "hidden": true },
            { "type": "style", "hidden": true },
            { "type": "refactor", "hidden": true },
            { "type": "test", "hidden": true },
            { "type": "build", "hidden": true },
            { "type": "ci", "hidden": true }
          ]
        }
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md"
      }
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): \$\{nextRelease.version\} [skip ci]\\n\\n\$\{nextRelease.notes\}"
      }
    ],
    "@semantic-release/github"
  ]
}`,
          },
        ]}
      />

      <h2>Feature Flag Management</h2>

      <p>
        Feature flags decouple deployment from release: code ships to production in a disabled
        state and is activated separately, enabling dark launches, A/B testing, and instant
        rollback without a code deployment. Claude can generate feature flag scaffolding
        and help manage flag lifecycles.
      </p>

      <SDKExample
        title="Feature Flag Integration"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'feature-flags.sh',
            code: `# Generate feature flag scaffolding for a new feature
claude "Add a feature flag for the new payment methods feature.

Feature: PAYMENT_METHODS_V2
Status: shipping disabled, will be enabled for 10% of users in week 1, 100% in week 2

Generate:
1. Feature flag type definition in src/features/flags.ts:
   export enum FeatureFlag {
     PAYMENT_METHODS_V2 = 'payment_methods_v2',
     // ... existing flags
   }

2. Flag check utility in src/features/useFlag.ts:
   - Check LaunchDarkly (or environment variable fallback)
   - Type-safe flag evaluation with default value
   - Track flag evaluation in analytics

3. Update PaymentController to gate the new payment method endpoints behind the flag:
   if (await featureFlags.isEnabled(FeatureFlag.PAYMENT_METHODS_V2, userId)) {
     return this.paymentServiceV2.processPayment(request)
   }
   return this.paymentService.processPayment(request)  // Original path

4. Add a cleanup TODO comment: // TODO: Remove flag + old code path after 2024-02-01

After implementing:
- Run tests: all tests must pass (test both flag-on and flag-off paths)
- Run: grep -r 'payment_methods_v2' src/ to verify all usages are gated"`,
          },
        ]}
      />

      <h2>Automated Changelog Generation</h2>

      <SDKExample
        title="Generating Release Notes with Claude"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-release-notes.sh',
            code: `# Generate human-friendly release notes from conventional commits
claude "Generate release notes for version 2.3.0.

Commits since v2.2.0:
$(git log v2.2.0..HEAD --pretty=format:'%H %s' --no-merges)

PR descriptions for significant features:
$(gh pr list --state merged --base main --search 'merged:>=$(git log -1 --format=%aI v2.2.0)' --json title,body --jq '.[] | \"## \" + .title + \"\\n\" + .body' 2>/dev/null | head -200)

Generate two versions of release notes:

1. TECHNICAL (for CHANGELOG.md — follows keepachangelog.com format):
## [2.3.0] - $(date -I)
### Added
- ...
### Changed
- ...
### Fixed
- ...
### Security
- ...

2. BUSINESS (for stakeholder communication — plain English, no technical jargon):
### What's New in v2.3.0
A summary paragraph of the key value delivered in this release.

#### New Capabilities
- [Feature]: what users can now do that they couldn't before

#### Improvements
- [What changed]: the customer benefit, not the technical change

Write both to /tmp/release-notes-2.3.0.md"`,
          },
        ]}
      />

      <WarningBlock title="Conventional Commits Require Team-Wide Discipline">
        Semantic release only works if every commit to main follows the conventional commit
        format. One improperly formatted commit message (e.g., a merge commit "Merge branch
        'feature/x'") can cause semantic-release to fail or produce the wrong version number.
        Enforce commitlint via the commit-msg git hook, and configure GitHub to require
        conventional commit message formats on PR titles (which become the squash-merge
        commit message). The GitHub action <code>amannn/action-semantic-pull-request</code>
        validates PR title format automatically.
      </WarningBlock>

      <BestPracticeBlock title="Feature Flag Lifecycle Management">
        Feature flags that are never removed become permanent complexity. Establish a
        maximum flag lifetime policy (typically 2-4 weeks) and enforce it. Ask Claude
        to help with cleanup: "Find all feature flags in src/features/flags.ts that
        have a TODO comment with a cleanup date in the past. For each one, implement
        the permanent path (remove the flag check and the old code path), update the
        tests to remove flag-based branching, and delete the flag from the FeatureFlag enum."
        This cleanup is exactly the kind of mechanical refactoring where Claude provides
        leverage.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Dry-Run Releases for Verification">
        Run <code>npx semantic-release --dry-run</code> in CI on every PR to preview
        what version the release pipeline would produce if this PR were merged. This
        surfaces misclassified commits (a breaking change labeled as a fix) before
        merge, not after. Include the dry-run output in the PR description. Ask Claude:
        "The semantic-release dry run shows this PR would trigger a major version bump,
        but I only added a new optional field to the API response. Explain whether
        this should be a major or minor bump, and if minor, how to fix the commit message."
      </NoteBlock>
    </article>
  )
}
