import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function RunbookGeneration() {
  return (
    <article className="prose-content">
      <h1>Runbook Generation</h1>

      <p>
        A runbook is an operational procedure document: what to do when the payment service
        is degraded, how to restart the worker queue without data loss, what the step-by-step
        process is for rolling back a bad deployment. Runbooks are among the most valuable
        documentation an engineering team can have — and among the least likely to be written,
        because they are created during or after incidents when nobody wants to write documentation.
      </p>

      <p>
        Claude can generate runbooks from the codebase, infrastructure configuration, and
        incident history, producing accurate operational procedures that an on-call engineer
        can follow at 2am without knowing the system intimately. The key is to generate
        runbooks when the system is healthy, not when it is broken.
      </p>

      <ConceptBlock title="Runbooks as Code">
        Runbooks stored in the repository alongside the code they describe stay in sync
        through the same pull request process as code changes. When a service gets a new
        dependency, the PR includes a runbook update. When a deployment procedure changes,
        the runbook is updated in the same commit. Claude can both generate initial runbooks
        and update them when infrastructure changes are made.
      </ConceptBlock>

      <SDKExample
        title="Generating Service Runbooks from Infrastructure Code"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-runbook.sh',
            code: `# Generate a comprehensive runbook for the payment service
claude "Generate a production runbook for the payment-service.

Analyze these sources to understand the service:
1. src/services/payment/ — service implementation
2. infra/terraform/modules/payment-service/ — infrastructure definition
3. .github/workflows/deploy-payment.yml — deployment pipeline
4. src/config/payment.config.ts — configuration and dependencies
5. Recent incident reports in docs/incidents/ (if any)

Generate: docs/runbooks/payment-service.md

Runbook sections required:

## Service Overview
- What the service does (1 paragraph)
- Dependencies: upstream (what calls this service) and downstream (what this service calls)
- SLO: 99.9% availability, p99 latency < 500ms, error rate < 0.1%

## Startup and Shutdown
- Normal startup procedure (steps with exact commands)
- Graceful shutdown procedure (drain in-flight requests before stopping)
- Expected startup time and how to verify health

## Health Checks
- Health endpoint: GET /health (expected response)
- Readiness endpoint: GET /ready (expected response)
- Key metrics to check: (from Datadog/CloudWatch)

## Common Failure Modes
For each dependency failure:
- Database unavailable: symptoms, detection, mitigation
- Stripe API degraded: symptoms, detection, mitigation (circuit breaker behavior)
- Redis cache unavailable: symptoms, detection, mitigation (graceful degradation)

## Deployment
- Deploy command: (from CI/CD pipeline)
- Rollback command: (immediate rollback procedure)
- Smoke test after deployment: (commands to run)
- Known risky migrations: (flag any database migrations)

## Escalation
- On-call: #payments-oncall Slack channel
- Escalation path: on-call engineer → payments team lead → VP Engineering"`,
          },
        ]}
      />

      <SDKExample
        title="Failure Mode Runbook from Error Handling Code"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-failure-runbook.sh',
            code: `# Generate failure mode documentation from error handling code
claude "Generate failure mode documentation from the error handling patterns in our codebase.

Find all error types and handling patterns:
grep -rn 'catch\|throw new\|ErrorType\.' src/ --include='*.ts' | head -100

For each significant error type found:
1. What causes this error?
2. What is the user impact when it occurs?
3. How is it currently handled (retry? fallback? alert?)?
4. What should an on-call engineer do when they see it in logs?
5. Are there known root causes to investigate first?

Format as a failure mode catalog in docs/runbooks/failure-modes.md:

## PaymentAuthorizationError
**Cause**: Stripe declined the payment authorization
**User impact**: Checkout fails with 'payment declined' message
**Current handling**: Non-retryable — fails immediately with user-facing error
**On-call action**: Check Stripe dashboard for service degradation. If Stripe status.stripe.com
shows degradation, this is expected. If no Stripe degradation, investigate specific decline
reason in audit logs: SELECT * FROM payment_audit WHERE error_code = 'authorization_failed' 
AND created_at > NOW() - INTERVAL '1 hour'

## DatabaseConnectionPoolExhausted
**Cause**: All database connection pool slots are in use (pool size: 20)
**User impact**: All requests fail with 503 until connections free up
**Current handling**: Request queuing with 30-second timeout, then 503
**On-call action**: 
1. Check connection count: SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
2. If > 18 connections: identify long-running queries: SELECT pid, duration, query FROM pg_stat_activity ORDER BY duration DESC LIMIT 10
3. Kill blocking queries if safe: SELECT pg_terminate_backend(pid) WHERE pid = ?"`,
          },
        ]}
      />

      <h2>Keeping Runbooks Current</h2>

      <SDKExample
        title="Runbook Staleness Detection"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.github/workflows/runbook-freshness.yml',
            code: `name: Check Runbook Freshness

on:
  push:
    branches: [main]
    paths:
      - 'src/services/**'
      - 'infra/terraform/**'
      - '.github/workflows/deploy-*.yml'

jobs:
  check-runbook-freshness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Identify services changed without runbook updates
        run: |
          # Get changed service directories
          CHANGED_SERVICES=$(git diff --name-only HEAD~1 HEAD | grep '^src/services/' | cut -d/ -f3 | sort -u)
          
          # Check if corresponding runbooks were updated
          for service in $CHANGED_SERVICES; do
            RUNBOOK="docs/runbooks/\$\{service\}.md"
            if [ -f "$RUNBOOK" ]; then
              RUNBOOK_LAST_CHANGED=$(git log -1 --format="%H" -- "$RUNBOOK")
              SERVICE_LAST_CHANGED=$(git log -1 --format="%H" -- "src/services/$service/")
              if [ "$RUNBOOK_LAST_CHANGED" != "$SERVICE_LAST_CHANGED" ]; then
                echo "WARNING: $RUNBOOK may be stale (service changed but runbook not updated)"
                echo "::warning file=$RUNBOOK::Runbook may need update after changes to src/services/$service/"
              fi
            else
              echo "MISSING: No runbook found for service: $service"
              echo "::warning::No runbook found at $RUNBOOK for service $service"
            fi
          done`,
          },
        ]}
      />

      <WarningBlock title="Runbooks Must Be Tested, Not Just Written">
        A runbook that has never been executed is documentation, not an operational
        procedure. Schedule game day exercises where engineers follow runbooks for
        non-critical scenarios (restarting a service in a test environment, running through
        the rollback procedure on staging). Find the gaps before 2am, not during an incident.
        Ask Claude: "Identify which steps in docs/runbooks/payment-service.md could be
        tested safely in our staging environment without affecting production."
      </WarningBlock>

      <BestPracticeBlock title="Link Runbooks from Alerts">
        Every monitoring alert that pages an on-call engineer should include a direct link
        to the relevant runbook. This is a configuration change in your alerting tool
        (Datadog, PagerDuty, Opsgenie), not a documentation change. Ask Claude: "Update
        our Terraform Datadog monitor definitions in infra/terraform/datadog-monitors.tf
        to add a 'runbook_url' field pointing to the relevant docs/runbooks/ page for
        each monitor." This ensures that when an engineer receives an alert, they have
        the operational context they need in a single click.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Post-Incident Runbook Updates">
        After every incident, run a runbook review as part of the post-incident process.
        Ask Claude: "We had an incident where X happened. Our runbook at docs/runbooks/Y.md
        describes the procedure for this scenario. Based on what actually worked during the
        incident (notes in docs/incidents/YYYY-MM-DD-incident.md), identify gaps or incorrect
        steps in the runbook and update it." Incidents are the most valuable source of
        runbook improvement — capturing lessons immediately ensures they are not lost.
      </NoteBlock>
    </article>
  )
}
