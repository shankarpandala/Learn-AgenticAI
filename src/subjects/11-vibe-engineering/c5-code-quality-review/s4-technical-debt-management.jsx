import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function TechnicalDebtManagement() {
  return (
    <article className="prose-content">
      <h1>Technical Debt Management</h1>

      <p>
        Technical debt is the cost of deferred quality work — shortcuts taken under time pressure,
        patterns that made sense in 2019 but are now liabilities, tests never written, abstractions
        that grew into god objects, copy-pasted code that diverged. Every non-trivial codebase
        carries it. The question is never "do we have technical debt?" but "do we know what debt
        we have, and are we managing it intentionally?"
      </p>

      <p>
        AI coding assistants create a new dynamic for technical debt. On one hand, Claude can
        identify, document, and remediate debt at a speed no human team could match. On the other
        hand, without discipline, AI-assisted development creates debt at the same accelerated
        pace — poorly structured code that works but is unmaintainable, missing tests, duplicated
        logic, and shallow abstractions that collapse under future requirements.
      </p>

      <p>
        Vibe Engineering treats technical debt as a first-class concern. Debt is tracked
        explicitly, remediation is AI-assisted, and new debt is prevented by making quality gates
        part of the development loop — not a separate cleanup project that never gets scheduled.
      </p>

      <ConceptBlock title="AI-Assisted Debt Identification">
        Claude Code can analyze a codebase and produce a structured technical debt inventory
        in a fraction of the time a manual review would take. The key is to ask Claude to look
        for specific categories of debt with machine-verifiable evidence — not vague observations
        about "complexity" but concrete findings like "this function has cyclomatic complexity
        of 34" or "this module has 8 direct dependents but no tests."
      </ConceptBlock>

      <SDKExample
        title="Technical Debt Audit Prompt"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'debt-audit.sh',
            code: `# Run a structured technical debt audit
claude "Perform a technical debt audit on src/. For each category below,
produce a structured list of findings with file paths, line numbers,
and severity (high/medium/low).

Categories to audit:

1. COMPLEXITY DEBT
   - Run: npx ts-complexity-report src/ --threshold 15
   - Functions with cyclomatic complexity > 15 (high), 10-15 (medium)

2. TEST DEBT
   - Run: npx jest --coverage --coverageThreshold='{}' 2>&1 | grep -E 'Uncovered'
   - Modules with 0% test coverage (high), < 50% coverage (medium)

3. DUPLICATION DEBT
   - Run: npx jscpd src/ --min-lines 10 --reporters json
   - Copy-paste blocks > 20 lines (high), 10-20 lines (medium)

4. DEPENDENCY DEBT
   - Run: npm outdated --json
   - Packages > 2 major versions behind (high), 1 major behind (medium)
   - Run: npm audit --json
   - Critical CVEs (high), high severity CVEs (medium)

5. TYPE SAFETY DEBT
   - Count: grep -r 'any' src/ --include='*.ts' | wc -l
   - Files with > 5 uses of 'any' type (medium)

Output format:
CATEGORY | SEVERITY | FILE | LINE | FINDING | ESTIMATED EFFORT (hours)"`,
          },
        ]}
      />

      <h2>Debt Register in CLAUDE.md</h2>

      <p>
        Once debt is identified, it needs to be tracked. A debt register in CLAUDE.md serves two
        purposes: it gives Claude context about known issues that should not be extended when
        writing new code, and it gives the team a shared, version-controlled view of what debt
        exists.
      </p>

      <SDKExample
        title="Technical Debt Register in CLAUDE.md"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'CLAUDE.md',
            code: `## Technical Debt Register

### High Priority (block new features in affected areas)

#### DEBT-001: PaymentProcessor god class
- File: src/services/PaymentProcessor.ts (1,847 lines)
- Issue: Handles authorization, settlement, refunds, webhooks, currency conversion
  in a single class with 34 methods. Cyclomatic complexity > 50.
- Impact: All payment-related bugs cluster here. 40% of incidents touch this file.
- Remediation: Extract into PaymentAuthorizer, PaymentSettler, RefundProcessor, WebhookHandler
- Estimated effort: 3 days
- Owner: @payments-team
- DO NOT add new methods to PaymentProcessor — route new payment features to new services

#### DEBT-002: User service 0% test coverage
- File: src/services/UserService.ts
- Issue: Critical service with no automated tests. 3 production incidents in 6 months.
- Impact: Every change is manual-test-only. Change velocity: near zero.
- Remediation: Write characterization tests capturing current behavior, then refactor
- Estimated effort: 2 days
- Owner: @identity-team
- When touching UserService: write a test for every function you change before changing it

### Medium Priority (address in next quarter)

#### DEBT-003: 47 uses of 'any' type in OrderService
- Files: src/services/order/*.ts
- Remediation: Run /generate-types slash command on affected files`,
          },
        ]}
      />

      <h2>Automated Remediation Campaigns</h2>

      <p>
        Some types of technical debt are mechanical enough that Claude can remediate them
        systematically. Type safety improvements, test coverage gaps, and outdated dependency
        upgrades are all candidates for AI-driven remediation campaigns.
      </p>

      <SDKExample
        title="Automated Debt Remediation Campaign"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'remediation-campaign.sh',
            code: `# Campaign: Eliminate 'any' types in OrderService
claude "Technical debt campaign: eliminate TypeScript 'any' types in src/services/order/

Step 1: Find all 'any' usages:
grep -n ': any' src/services/order/*.ts

For each 'any' found:
1. Analyze the value's actual runtime shape (check callers and usages)
2. Define a proper interface or type alias in src/types/order.ts
3. Replace the 'any' with the specific type
4. Run: npx tsc --noEmit to verify no new type errors

Target: zero 'any' usages in src/services/order/
Do NOT suppress errors with @ts-ignore or @ts-expect-error
Report before/after count."

# Campaign: Increase test coverage for UserService
claude "Technical debt campaign: add characterization tests for UserService.

File: src/services/UserService.ts
Current coverage: 0%

Strategy for characterization tests:
1. For each public method, write tests that capture CURRENT behavior (not ideal behavior)
2. These tests document what the code actually does, enabling safe refactoring later
3. Do not refactor the implementation — only add tests

Run: npm test -- --coverage --collectCoverageFrom='src/services/UserService.ts'
Target: 60% coverage minimum
Report: methods covered, methods not covered, key edge cases found"`,
          },
        ]}
      />

      <h2>Preventing New Debt With Quality Gates</h2>

      <p>
        The most effective debt management strategy is preventing new debt. Quality gates in the
        CI pipeline enforce minimum standards on every PR, making it impossible to merge code
        that falls below the threshold.
      </p>

      <SDKExample
        title="Ratchet Pattern: No New Debt Policy"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.github/workflows/quality-gates.yml',
            code: `name: Quality Gates

on: [pull_request]

jobs:
  no-new-debt:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Coverage ratchet (must not decrease)
        run: |
          # Get coverage on main branch
          git stash
          npm ci --silent
          MAIN_COVERAGE=$(npx jest --coverage --coverageThreshold='{}' --json 2>/dev/null | jq '.coverageMap | to_entries | map(.value.s) | flatten | (map(select(. > 0)) | length) / length * 100' || echo "0")
          git stash pop
          
          # Get coverage on PR branch
          PR_COVERAGE=$(npx jest --coverage --coverageThreshold='{}' --json 2>/dev/null | jq '.coverageMap | to_entries | map(.value.s) | flatten | (map(select(. > 0)) | length) / length * 100' || echo "0")
          
          echo "Main coverage: $MAIN_COVERAGE%"
          echo "PR coverage: $PR_COVERAGE%"
          
          if (( $(echo "$PR_COVERAGE < $MAIN_COVERAGE - 1" | bc -l) )); then
            echo "Coverage decreased by more than 1%. New debt introduced."
            exit 1
          fi

      - name: Complexity gate (no new high-complexity functions)
        run: |
          npx ts-complexity-report src/ --threshold 20 --failOnHigherThan 20
          
      - name: Duplication gate
        run: |
          npx jscpd src/ --min-lines 15 --threshold 5
          # Fails if duplication percentage exceeds 5%`,
          },
        ]}
      />

      <WarningBlock title="Don't Let AI Add Debt While Fixing Debt">
        When asking Claude to remediate technical debt, specify constraints tightly. Claude
        will sometimes "fix" a complexity problem by extracting methods that are essentially
        the same function split into pieces with no real separation of concerns, or by adding
        a passing test that does not actually exercise the code path you care about. Review
        remediation PRs more carefully than feature PRs — the goal is genuine improvement,
        not metric manipulation.
      </WarningBlock>

      <BestPracticeBlock title="Schedule Debt Sprints, Not Debt Someday">
        Technical debt that is tracked but never remediated is only marginally better than
        debt that is ignored. Effective debt management requires allocating real capacity —
        typically 20% of each sprint — to remediation work. Use Claude to make this work
        fast enough that 20% goes further than it used to. A well-scoped debt remediation
        session with Claude can cover ground that would have taken a developer a full week
        in a few hours, making the 20% investment return far more than 20% improvement.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Use the Strangler Fig Pattern for God Objects">
        When Claude needs to work in or around a known god object (like DEBT-001 PaymentProcessor),
        use the strangler fig pattern: new functionality goes into a new, properly structured
        module, and calls from the god object are redirected to the new module. Over time,
        the god object shrinks as its responsibilities migrate out. Ask Claude: "Implement
        the new refund retry feature in a new RefundRetryService, and add a delegation call
        from PaymentProcessor.retryRefund() to RefundRetryService. Do not add logic to
        PaymentProcessor."
      </NoteBlock>
    </article>
  )
}
