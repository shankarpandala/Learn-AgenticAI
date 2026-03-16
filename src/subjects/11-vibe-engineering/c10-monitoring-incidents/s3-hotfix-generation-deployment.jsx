import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function HotfixGenerationDeployment() {
  return (
    <article className="prose-content">
      <h1>Hotfix Generation and Deployment</h1>

      <p>
        A hotfix is a code change that must be deployed to production as fast as possible
        to mitigate an active incident. The pressure is high, the risk is high, and the
        normal development workflow (feature branch, full review, staging deployment,
        approval gate) needs to be compressed without being bypassed entirely. The wrong
        hotfix can make an incident worse. The right hotfix compressed through a thoughtful
        fast-track process can resolve it in minutes.
      </p>

      <p>
        Claude excels at hotfix generation when given a clear description of the bug and
        a stack trace. It can identify the root cause, generate a targeted fix, write
        a regression test, and prepare the deployment in a fraction of the time it would
        take an engineer working alone under incident pressure. The engineer's role is to
        review the fix critically — under pressure, the temptation to accept without reading
        is highest, which is exactly when it must be resisted.
      </p>

      <ConceptBlock title="Hotfix Process vs Normal Development Process">
        A hotfix process is a deliberately simplified version of the normal development
        process, not an escape from it. Key differences: (1) smaller scope (fix only the
        immediate problem, not related issues), (2) faster review (two engineers, not full
        team), (3) direct to main (no staging gate, but smoke tests run immediately after),
        (4) accelerated but not skipped security check. What must never be skipped: code
        review, tests passing, and engineer accountability for the change.
      </ConceptBlock>

      <SDKExample
        title="Hotfix from Stack Trace"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-hotfix.sh',
            code: `#!/bin/bash
# Hotfix generation workflow
INCIDENT_ID=\${1:-"INC-UNKNOWN"}

echo "=== HOTFIX WORKFLOW: $INCIDENT_ID ==="

# Create hotfix branch from main
git fetch origin main
git checkout -b "hotfix/$INCIDENT_ID" origin/main

# Generate hotfix with Claude
claude "HOTFIX REQUIRED — Active production incident: $INCIDENT_ID

Stack trace from production error logs:
$(cat /tmp/incident-stack-trace.txt)

Affected code:
$(cat src/services/payment/PaymentProcessor.ts)

HOTFIX CONSTRAINTS (non-negotiable):
- Fix ONLY the error shown in the stack trace
- Do NOT refactor, do NOT fix related issues you notice
- Write ONE regression test that proves the bug is fixed
- The fix must be the minimum change that prevents the error
- Do not add new dependencies

Analysis required before writing code:
1. What is the exact line that is throwing the error?
2. What is the root cause (not just the symptom)?
3. What is the simplest possible fix?
4. Are there any edge cases the fix must handle?

After generating:
1. Write the regression test FIRST (in tests/)
2. Implement the fix
3. Run: npm test -- --testPathPattern='PaymentProcessor'
4. All tests must pass

Show me each step before executing."`,
          },
        ]}
      />

      <SDKExample
        title="Fast-Track Hotfix Review Process"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'hotfix-review.sh',
            code: `# After Claude generates the hotfix — structured review
claude "Review the hotfix diff before deployment.

Hotfix diff:
$(git diff origin/main...HEAD)

Security review (critical for hotfix — cannot skip):
1. Does this change introduce any new security vulnerabilities?
   Check: SQL injection, command injection, authentication bypass, path traversal
2. Does this change expose any sensitive data in logs or responses?
3. Does this change affect authentication or authorization logic?

Correctness review:
4. Does the fix address the root cause (not just the symptom)?
5. Could this fix cause a new failure in a different code path?
6. Are there race conditions or concurrent access issues introduced?

Test coverage:
7. Does the regression test actually reproduce the original bug?
8. Would the test fail if the fix were reverted?

Deployment risk:
9. Does this change require a database migration? (if yes, more careful review needed)
10. Does this change affect any shared infrastructure? (caches, queues)

VERDICT: SAFE TO DEPLOY / NEEDS MODIFICATION / UNSAFE (with explanation)

After review approval, run fast-track deployment:
$(cat docs/runbooks/hotfix-deployment.md | grep -A20 'Fast-track procedure')"`,
          },
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.github/workflows/hotfix.yml',
            code: `name: Hotfix Fast-Track

on:
  push:
    branches:
      - 'hotfix/**'

jobs:
  # Hotfix pipeline — faster than normal CI, no staging gate
  hotfix-validate:
    name: Hotfix Validation
    runs-on: ubuntu-latest
    environment: hotfix-approval  # Requires 2 approvers in GitHub settings

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11

      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Type check (must pass)
        run: npx tsc --noEmit

      - name: Full test suite (must pass)
        run: npm test
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb

      - name: Security scan
        run: |
          npm audit --audit-level=critical
          npx semgrep --config auto src/ --error

      - name: Notify on failure
        if: failure()
        run: |
          echo "::error::Hotfix validation FAILED — cannot deploy"
          # Notify incident channel

  hotfix-deploy-production:
    name: Deploy to Production
    needs: hotfix-validate
    runs-on: ubuntu-latest
    environment: production-hotfix  # Requires incident commander approval
    steps:
      - name: Deploy hotfix
        run: |
          aws ecs update-service \
            --cluster production \
            --service payment-api \
            --force-new-deployment
          
      - name: Smoke test
        run: |
          sleep 30
          curl -f https://api.production.example.com/health
          # Run the specific smoke test for the fixed functionality
          npm run test:smoke:payment`,
          },
        ]}
      />

      <h2>Hotfix Communication Template</h2>

      <SDKExample
        title="Incident Communication During Hotfix"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'hotfix-comms.sh',
            code: `# Generate stakeholder communication during hotfix
claude "Generate incident communication for the following hotfix deployment.

Incident: Payment failures affecting 40% of checkout attempts
Root cause: Stripe v10 API client sends malformed idempotency keys under load
Fix: Reverted to Stripe v9.14.0, added idempotency key generation fix for v10
Deployment time: ~5 minutes
Risk: Low (rollback to known-good version)

Generate three communications:

1. SLACK (#incidents channel — technical, real-time):
'🔴 INC-2024-001 UPDATE: Identified root cause — Stripe v10 idempotency key format issue.
Hotfix in deployment (ETA 5 min). Error rate currently 40%. Will update when resolved.'

2. STATUS PAGE (customer-facing — non-technical):
Title: 'Payment Processing — Investigating'
Body: We are investigating an issue affecting some payment transactions.
Our team has identified the cause and is deploying a fix.
Estimated resolution: 5 minutes. We apologize for the inconvenience.

3. MANAGEMENT SUMMARY (3 bullet points max):
- What happened
- Customer impact (quantified)
- Current status and ETA

Write all three. I will copy-paste them."`,
          },
        ]}
      />

      <WarningBlock title="Hotfix Code Gets the Same Security Review as Normal Code">
        The temptation during an incident is to skip security review in the name of speed.
        This temptation must be resisted. An attacker who knows you are in incident response
        mode may be deliberately creating the conditions for a hurried, unreviewed hotfix
        deployment. Security review of a hotfix diff takes 5 minutes — the time investment
        is trivially small compared to a secondary security incident caused by a rushed fix.
        Claude's security review checklist from this section runs in seconds. Use it.
      </WarningBlock>

      <BestPracticeBlock title="Hotfix Branches From Main, Not From Feature Branches">
        Always create hotfix branches from the current production commit, not from a feature
        branch that may contain unreleased changes. The hotfix should contain only the fix
        for the current incident. Verify before branching: <code>git log --oneline origin/main</code>
        shows the commit currently deployed to production. After the hotfix is deployed,
        cherry-pick it to your next release branch so it is not lost when that release deploys.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Regression Test Before Hotfix Deployment">
        The regression test Claude writes for the hotfix serves two purposes: it verifies
        the fix works, and it prevents the same bug from recurring in future changes. After
        the incident is resolved, the regression test stays in the test suite permanently.
        When reviewing a hotfix, verify the regression test actually reproduces the bug:
        remove the fix temporarily, run the test, confirm it fails. If removing the fix
        doesn't fail the test, the test is not a regression test — it is a false sense
        of security.
      </NoteBlock>
    </article>
  )
}
