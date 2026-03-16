import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function LargeScaleCrossFileChanges() {
  return (
    <article className="prose-content">
      <h1>Large-Scale Cross-File Changes</h1>

      <p>
        Some changes are inherently wide — they touch dozens or hundreds of files across a codebase.
        Renaming a domain concept, changing an error handling pattern, migrating a library version,
        adding a new required parameter to a foundational function. These changes are tedious, error-prone,
        and risky when done manually. They are also exactly the kind of mechanical, pattern-following
        work that Claude excels at — when approached with the right strategy.
      </p>

      <p>
        The risks of large-scale AI changes are different from the risks of small changes. An incorrect
        small change affects one file and is easy to spot in review. An incorrect pattern applied to
        50 files is hard to spot because the sheer volume of the diff overwhelms the reviewer's attention.
        The safety strategy is to decompose large changes into stages, each of which is independently
        verifiable.
      </p>

      <ConceptBlock title="Staged Cross-File Changes">
        Never attempt a large cross-file change in a single Claude session with a single commit. Instead,
        decompose the change into stages: (1) an automated search to identify the scope, (2) a small
        pilot on 1-2 files, (3) review and approval of the pilot, (4) application of the pattern to
        remaining files in batches, (5) verification after each batch. This staged approach means no
        individual review requires reading hundreds of files — each stage is a manageable scope.
      </ConceptBlock>

      <h2>Step 1: Scope Discovery</h2>

      <p>
        Before touching any code, understand the full scope of the change. Claude can search the codebase
        to identify every file that needs modification, grouped by the type of change required.
      </p>

      <CodeBlock language="text" filename="Scope Discovery Prompt">
{`We need to migrate from the deprecated logger.log() API to the new structured logger.
Do NOT modify any files yet.

First, find all usages across the codebase:
1. Run: grep -r "logger.log(" src/ --include="*.ts" -l
2. Run: grep -r "console.log(" src/ --include="*.ts" -l
3. For each file found, categorize:
   - Type A: Only uses logger.log() with a string message (simple replacement)
   - Type B: Uses logger.log() with interpolated variables (needs restructuring)
   - Type C: Uses console.log() (needs import change + restructuring)

Report:
- Total files affected
- Count per type
- First 3 examples of each type with the current code and proposed replacement

Do not make any changes.`}
      </CodeBlock>

      <h2>Step 2: Pilot on Representative Files</h2>

      <p>
        Pick one file of each type and have Claude apply the change. Review the pilot carefully —
        this is where you validate that Claude's pattern is correct before it is applied at scale.
      </p>

      <CodeBlock language="text" filename="Pilot Change Prompt">
{`Apply the logger migration to these three pilot files only:
- src/services/order.service.ts (Type A)
- src/api/payment.handler.ts (Type B)
- src/workers/email.worker.ts (Type C)

For each file:
1. Show me the BEFORE and AFTER diff (use diff format)
2. Explain any decisions you made that aren't mechanical
3. Do not commit yet

I will review the three diffs, then decide whether to proceed with the full migration.`}
      </CodeBlock>

      <p>
        Read the pilot diffs. Check that the pattern is exactly right. If anything is wrong — a
        missed edge case, an incorrect restructuring, a new import that's wrong — correct it in the
        pilot before applying it to the remaining files. One correction in the pilot vs. the same
        correction across 47 files.
      </p>

      <h2>Step 3: Batch Application with Verification</h2>

      <p>
        Apply the change in batches of 5-10 files, running the test suite after each batch. If a
        batch introduces a regression, the blast radius is limited to 10 files and you know which
        batch caused it.
      </p>

      <CodeBlock language="text" filename="Batch Application Prompt">
{`Pilot approved. Apply the logger migration in batches.

Batch 1 (Type A files — simple replacements):
Apply to: src/services/user.service.ts, src/services/product.service.ts,
          src/services/cart.service.ts, src/services/notification.service.ts,
          src/services/audit.service.ts

After each batch:
1. Run: npm test
2. Run: npx tsc --noEmit
3. Report: tests passing, type check clean, files modified

If tests fail after a batch, stop and report which test failed and in which file.
Do not proceed to the next batch until I confirm.`}
      </CodeBlock>

      <h2>Pattern: Rename Across Codebase</h2>

      <p>
        Renaming a concept — a class name, a database column that's reflected in models, a configuration
        key — requires changes that span models, migrations, tests, API responses, and documentation.
        Claude can orchestrate this safely with careful staging.
      </p>

      <CodeBlock language="text" filename="Rename Workflow">
{`We are renaming the concept 'Customer' to 'Account' across the codebase.
This is a breaking change that requires a two-phase migration.

Phase 1 (today — backwards compatible):
1. Add 'account_id' as an alias alongside 'customer_id' in the API response
2. Update the domain model to accept both names
3. Add deprecation warnings when 'customer_id' is used
4. Update internal code to use 'account' terminology
5. Do NOT remove 'customer_id' from the API yet

Phase 2 (next release — after all consumers migrated):
1. Remove 'customer_id' from API responses
2. Generate migration to rename the database column

Start with Phase 1 only. Show me the file list before making changes.`}
      </CodeBlock>

      <h2>Codemod-Assisted Changes</h2>

      <p>
        For syntactic changes (import renaming, API signature changes), AST-based codemods are more
        reliable than text replacement. Claude can generate codemods using jscodeshift (JavaScript)
        or libCST (Python) that make precise, syntactically correct changes.
      </p>

      <CodeBlock language="javascript" filename="Generated jscodeshift codemod">
{`// codemod: migrate-logger-import.js
// Generated by Claude — migrates from old logger to structured logger
export default function transform(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)

  // Replace: import { logger } from '../utils/logger'
  // With:    import { createLogger } from '../lib/structured-logger'
  root
    .find(j.ImportDeclaration, {
      source: { value: (v) => v.includes('utils/logger') },
    })
    .forEach((path) => {
      path.node.source.value = '../lib/structured-logger'
      path.node.specifiers.forEach((spec) => {
        if (spec.local.name === 'logger') {
          spec.imported.name = 'createLogger'
        }
      })
    })

  // Replace: logger.log('message') with logger.info({ msg: 'message' })
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: 'logger' },
        property: { name: 'log' },
      },
    })
    .forEach((path) => {
      path.node.callee.property.name = 'info'
      if (path.node.arguments.length === 1 &&
          path.node.arguments[0].type === 'StringLiteral') {
        const msg = path.node.arguments[0].value
        path.node.arguments = [j.objectExpression([
          j.property('init', j.identifier('msg'), j.stringLiteral(msg))
        ])]
      }
    })

  return root.toSource()
}`}
      </CodeBlock>

      <PatternBlock title="Human-in-the-Loop for Large Changes">
        For changes affecting more than 20 files, insert a mandatory human review checkpoint after
        every 20-file batch. The reviewer should sample-check 3-5 files randomly from the batch —
        not just the first and last — to verify the pattern was applied consistently. Sample checking
        is not thorough review; it is anomaly detection. If any sampled file has an issue, review
        the full batch before proceeding.
      </PatternBlock>

      <WarningBlock title="Test Coverage is Not Optional for Large Changes">
        Large cross-file changes with low test coverage are particularly dangerous. Tests are the
        only way to verify that a mechanical change did not introduce a semantic error. If the
        codebase has low coverage in the areas being changed, add tests before the cross-file
        change — not after. "We'll add tests later" is how silent regressions from large
        refactorings stay hidden in production for months.
      </WarningBlock>

      <BestPracticeBlock title="One Change Type Per Commit">
        Each batch commit should contain only one type of change. "Rename Customer to Account in
        service layer" is one commit. "Rename Customer to Account in API handlers" is a separate
        commit. "Rename Customer to Account in tests" is a separate commit. This granularity makes
        the git history navigable if you need to bisect a regression — you can immediately see
        which layer introduced the issue.
      </BestPracticeBlock>

      <NoteBlock type="info" title="Large Changes are a Test of Your Test Suite">
        A large cross-file change that your test suite catches quickly is a sign of good tests.
        A large change that slips into production undetected is a sign of test gaps. Use large
        refactoring projects as an opportunity to audit coverage: before the change, identify
        which files have no tests and add them. The investment pays dividends not just for this
        change but for every future change to those files.
      </NoteBlock>
    </article>
  )
}
