import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ArchitectureConformance() {
  return (
    <article className="prose-content">
      <h1>Architecture Conformance</h1>

      <p>
        Every engineering organization has an intended architecture: layers that should not call
        each other, modules that should only depend in one direction, patterns that are required
        (or forbidden) in certain contexts. Over time, without enforcement, codebases drift. A
        domain model imports an HTTP library. A repository layer calls a controller. A utility
        function grows into a god object that everything depends on. This drift is called
        architectural erosion, and it is one of the most expensive forms of technical debt because
        it compounds — each violation makes the next one slightly more likely and slightly harder
        to fix.
      </p>

      <p>
        AI coding assistants accelerate architectural drift if left unconstrained. Claude does not
        know your intended architecture unless you tell it. It will happily import a database
        client into a presentation layer component, call an internal service from a public API
        handler without going through the domain, or create circular dependencies that break your
        build in subtle ways. Vibe Engineering uses fitness functions and automated conformance
        checks to detect drift before it merges.
      </p>

      <ConceptBlock title="Architectural Fitness Functions">
        A fitness function is an automated test that verifies a structural property of the
        codebase rather than a behavioral property. Where a unit test asks "does this function
        return the right value?", a fitness function asks "does this module only import from
        the allowed layers?" Fitness functions run in CI on every PR and fail the build if
        architectural rules are violated. They make architecture a machine-verifiable constraint,
        not a guideline in a wiki document nobody reads.
      </ConceptBlock>

      <h2>Defining Layer Boundaries in CLAUDE.md</h2>

      <p>
        The first step in enforcing architecture conformance with AI is making the architecture
        explicit in CLAUDE.md. Claude can only follow rules it knows about. If your CLAUDE.md
        documents the layered architecture and the allowed dependency directions, Claude will
        generate code that respects them.
      </p>

      <SDKExample
        title="Architecture Rules in CLAUDE.md"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'CLAUDE.md',
            code: `## Architecture: Layered Architecture Constraints

### Layer Definitions

Presentation Layer:  src/api/, src/web/
Application Layer:   src/application/
Domain Layer:        src/domain/
Infrastructure:      src/infrastructure/
Shared Kernel:       src/shared/


### Allowed Dependencies (top → bottom only)
- Presentation → Application (via use case interfaces)
- Application → Domain (domain models and services)
- Infrastructure → Domain (implements domain interfaces)
- Any layer → Shared Kernel

### Forbidden Dependencies
- Domain MUST NOT import from: src/api/, src/application/, src/infrastructure/
- Application MUST NOT import from: src/api/, src/infrastructure/
- Circular imports are ALWAYS forbidden

### Enforcement
- dependency-cruiser runs on every PR: npm run check:arch
- Violations block merge — do not add exceptions without ADR approval

### What This Means When Writing Code
- Never import an Express/Fastify type into src/domain/
- Domain services must only accept/return domain models (no HTTP request objects)
- Use dependency injection for infrastructure adapters — inject interfaces, not implementations
- If you need to access the database from a domain service, define a repository interface in
  src/domain/repositories/ and implement it in src/infrastructure/repositories/`,
          },
        ]}
      />

      <h2>Automated Conformance with dependency-cruiser</h2>

      <SDKExample
        title="dependency-cruiser Configuration and CI Integration"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'architecture-check.sh',
            code: `# Install dependency-cruiser
npm install --save-dev dependency-cruiser

# Generate initial config (then customize)
npx depcruise --init

# Run architecture check
npx depcruise src/ --config .dependency-cruiser.js

# Ask Claude to analyze violations and fix them
claude "Run: npx depcruise src/ --config .dependency-cruiser.js --output-type err-html > /tmp/arch-violations.html

For each violation found:
1. Identify which layer is importing from a forbidden layer
2. Determine the correct fix: either move the file, extract an interface, or use DI
3. Implement the fix
4. Re-run depcruise until zero violations remain

Do not add exceptions to .dependency-cruiser.js — fix the actual violations."`,
          },
          {
            label: 'json',
            language: 'javascript',
            filename: '.dependency-cruiser.js',
            code: `/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-domain-to-infrastructure',
      severity: 'error',
      comment: 'Domain layer must not depend on infrastructure',
      from: { path: '^src/domain' },
      to: { path: '^src/infrastructure' },
    },
    {
      name: 'no-domain-to-application',
      severity: 'error',
      comment: 'Domain layer must not depend on application layer',
      from: { path: '^src/domain' },
      to: { path: '^src/application' },
    },
    {
      name: 'no-domain-to-api',
      severity: 'error',
      comment: 'Domain layer must not depend on API/presentation layer',
      from: { path: '^src/domain' },
      to: { path: '^src/(api|web)' },
    },
    {
      name: 'no-application-to-infrastructure',
      severity: 'error',
      comment: 'Application layer must not directly reference infrastructure',
      from: { path: '^src/application' },
      to: { path: '^src/infrastructure' },
    },
    {
      name: 'no-circular-deps',
      severity: 'error',
      comment: 'Circular dependencies are never allowed',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/[^/]+' },
    },
  },
}`,
          },
        ]}
      />

      <h2>Detecting Drift in PRs with Claude Code</h2>

      <p>
        Beyond automated tools, Claude Code can perform architectural review as part of the
        PR review workflow. When a PR touches multiple layers, ask Claude to check for
        boundary violations that tools might not catch — semantic violations like "this function
        is in the domain layer but its logic is HTTP-response formatting."
      </p>

      <SDKExample
        title="AI Architecture Review Prompt"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'arch-review-prompt.sh',
            code: `# As part of PR review — run architectural fitness check
claude "Review the files changed in this PR for architectural conformance.

Changed files:
$(git diff --name-only origin/main...HEAD)

For each changed file:
1. Which architectural layer does it belong to?
2. Does it import from any layer it should not (per CLAUDE.md architecture rules)?
3. Does the logic inside belong in this layer (semantic conformance)?
   Example violation: a domain service that constructs HTTP response objects
4. Are there any circular dependencies introduced?

Run: npx depcruise $(git diff --name-only origin/main...HEAD | tr '\n' ' ') --config .dependency-cruiser.js

Report: list of violations with file paths, or 'Architecture conformance: PASS'"`,
          },
        ]}
      />

      <h2>Architecture Decision Records as Conformance Source</h2>

      <p>
        Fitness functions are most powerful when their rules are traceable to specific
        Architecture Decision Records. When a rule has a documented reason, engineers
        understand why they cannot take the shortcut, and the rule is less likely to be
        quietly disabled when it becomes inconvenient.
      </p>

      <SDKExample
        title="Linking ADRs to Conformance Rules"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'CLAUDE.md (ADR references)',
            code: `## Architecture Rules (with ADR references)

### Rule: Domain must not import from Infrastructure
- Enforced by: .dependency-cruiser.js rule 'no-domain-to-infrastructure'
- Rationale: ADR-007 — Hexagonal Architecture Adoption
- Reason: Allows domain logic to be tested without database/external service dependencies
- Correct approach: Define interface in src/domain/ports/, implement in src/infrastructure/

### Rule: No circular dependencies
- Enforced by: .dependency-cruiser.js rule 'no-circular-deps'
- Rationale: ADR-003 — Module Boundary Policy
- Reason: Circular deps cause initialization order bugs and prevent tree-shaking
- Correct approach: Extract shared code to src/shared/ or restructure ownership

### Adding exceptions
- Exceptions require an approved ADR
- ADR template: docs/architecture/decisions/ADR-NNN-title.md
- Use /write-adr slash command to generate draft`,
          },
        ]}
      />

      <WarningBlock title="Drift Accelerates With AI">
        AI coding assistants are particularly likely to introduce architectural violations when
        they see a "simpler" path to making code work. If Claude needs data from the database
        inside a domain service, it may simply import the database client directly rather than
        going through the repository interface — because that is the shortest path to making
        the tests pass. Without automated enforcement, these shortcuts accumulate quickly.
        The fitness function is the only reliable defense.
      </WarningBlock>

      <BestPracticeBlock title="Run Architecture Checks Before, Not After">
        Add the architecture check to your pre-commit hook and CI pipeline. Detecting violations
        at commit time (when Claude just wrote them) is dramatically cheaper than detecting them
        in a PR review two days later, and infinitely cheaper than discovering them during
        a security audit six months later. The depcruise check takes under ten seconds on
        most codebases — there is no performance argument for skipping it.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Visualize Your Architecture Periodically">
        Run dependency-cruiser with the --output-type dot flag to generate a visual dependency
        graph. Review this graph quarterly. Architectural drift is often invisible in day-to-day
        code review but immediately obvious when you see a diagram with arrows going in every
        direction. Ask Claude: "Generate the architecture diagram and identify the top 3
        areas of architectural drift compared to our intended layered architecture."
      </NoteBlock>
    </article>
  )
}
