import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function IncidentTriageWorkflow() {
  return (
    <article className="prose-content">
      <h1>Incident Triage Workflow</h1>

      <p>
        Incident triage is a race against time under cognitive load. The on-call engineer
        is paged, often in the middle of the night, often for a system they didn't build,
        and must quickly determine: what is broken, who is affected, what is the most likely
        cause, and what are the immediate mitigation options? Making good decisions under
        this pressure requires having the right information, organized in the right way,
        at the right moment.
      </p>

      <p>
        Claude Code can serve as an intelligent triage assistant during incidents: analyzing
        logs and metrics, generating hypotheses, checking runbooks, and suggesting diagnostic
        commands — not replacing the engineer's judgment but dramatically accelerating the
        information-gathering and hypothesis-formation phases that consume most of incident
        response time.
      </p>

      <ConceptBlock title="The Incident Triage State Machine">
        Effective incident triage follows a consistent process: (1) Assess — what is the
        user impact? (2) Contain — stop the bleeding before diagnosing the cause,
        (3) Diagnose — identify the root cause using evidence, (4) Mitigate — implement
        a fix or workaround, (5) Validate — confirm the fix restored normal operation,
        (6) Document — capture the timeline and actions for the post-incident review.
        Claude assists most effectively in steps 1, 3, and 6.
      </ConceptBlock>

      <SDKExample
        title="Initial Triage Session"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'start-triage.sh',
            code: `#!/bin/bash
# Incident triage starter script — run when paged

INCIDENT_ID="INC-$(date +%Y%m%d-%H%M)"
echo "Starting incident triage: $INCIDENT_ID"

# Collect initial context
echo "Collecting system state..."
RECENT_DEPLOYS=$(git log --oneline --since='4 hours ago' origin/main 2>/dev/null | head -10)
ERROR_RATE=$(curl -s "https://api.datadoghq.com/api/v1/query?from=$(date -d '10 minutes ago' +%s)&to=$(date +%s)&query=sum:payment-api.errors{*}.as_rate()" -H "DD-API-KEY: $DD_API_KEY" | jq '.series[0].pointlist[-1][1]' 2>/dev/null || echo "unknown")
CURRENT_VERSION=$(kubectl get deployment payment-api -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "unknown")

# Start triage with Claude
claude "I have been paged for an incident. Help me triage.

Incident ID: $INCIDENT_ID
Time: $(date -u)
Alert: Payment service error rate elevated
Current error rate: $ERROR_RATE per minute (baseline: ~0.1)
Current deployed version: $CURRENT_VERSION

Recent deployments (last 4 hours):
$RECENT_DEPLOYS

Step 1 — Assess Impact:
1. How many users are affected? Query error logs for unique userIds in last 10 min
2. What percentage of payment attempts are failing?
3. Are all payment methods affected or only specific ones?

Step 2 — Collect Evidence:
4. Pull the last 50 error log lines: cat /var/log/payment-api/error.log | tail -50
5. Check if errors started at a specific time that correlates with a deployment

Step 3 — Form Hypotheses:
6. Based on the evidence, list the 3 most likely root causes in order of probability
7. For each hypothesis: what one command would confirm or deny it?

I will execute your suggested commands and report back. Let's work through this together."`,
          },
        ]}
      />

      <h2>Hypothesis-Driven Diagnosis</h2>

      <SDKExample
        title="Structured Hypothesis Generation"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'hypothesis-generation.sh',
            code: `# After initial assessment — structured hypothesis testing
claude "Based on the evidence collected:

Error pattern: 
- All errors are 'stripe.charge failed: card_declined' with error code 'generic_decline'
- Error rate: 40% of payment attempts (up from 0.5%)
- First error: 14:17 UTC
- Most recent deployment: 14:12 UTC (updated Stripe API client from v9 to v10)
- Geographic distribution: errors evenly distributed (not regional)
- User segment: affects all user types equally

Hypothesis 1: Stripe API v10 has a different request format for charge creation
Evidence for: timing perfectly correlates with Stripe client upgrade
Evidence against: would expect 100% failure, not 40%
Test: Check the Stripe API changelog for v9→v10 breaking changes; look at actual Stripe request payload in debug logs

Hypothesis 2: Stripe is having a service incident
Evidence for: 40% failure rate could indicate Stripe degradation
Evidence against: Stripe status.stripe.com shows all systems operational
Test: Check Stripe dashboard for decline reason codes; if 'generic_decline' it could be Stripe-side

Hypothesis 3: Race condition in the new v10 client for concurrent requests
Evidence for: 40% failure rate could indicate intermittent issue
Evidence against: Would expect random distribution, not card_declined errors
Test: Look at request timing — are errors on requests that come within ms of each other?

For Hypothesis 1, the highest probability: 
What exact code changed in the Stripe v10 client upgrade?
Show me: git diff HEAD~1 package-lock.json | grep 'stripe'
Then: npm show stripe@10.0.0 vs stripe@9.14.0 — what changed in request format?"`,
          },
        ]}
      />

      <h2>Runbook Integration During Incidents</h2>

      <SDKExample
        title="Using Runbooks During Active Incidents"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'runbook-triage.sh',
            code: `# Use Claude to find and execute the relevant runbook
claude "We've confirmed the hypothesis: Stripe v10 changed the idempotency key format
and our implementation is generating duplicate keys under load, causing Stripe to
return generic_decline for what it thinks are duplicate charges.

Check the runbook for this scenario:
cat docs/runbooks/payment-service.md | grep -A 50 'stripe\|idempotency'

If the runbook covers this scenario:
1. Follow the runbook steps exactly
2. Report each step as you complete it
3. Run the validation check specified in the runbook after mitigation

If the runbook does not cover this scenario:
1. The immediate mitigation is: rollback to previous deployment
   Execute: kubectl rollout undo deployment/payment-api -n payment
2. Verify rollback: kubectl rollout status deployment/payment-api -n payment
3. Check error rate: [use Datadog query from earlier]
4. Expected recovery: error rate should return to baseline within 2 minutes

After mitigation:
- Confirm error rate has returned to < 0.1% per minute
- Check that in-flight transactions during the rollback resolved correctly
- Post incident update in #incidents Slack channel:
  'MITIGATED: Payment API rolled back to v2.2.1 — error rate returning to baseline.
   Root cause: Stripe v10 idempotency key format change. Fix in progress.'"`,
          },
        ]}
      />

      <WarningBlock title="AI Triage Is Advisory, Not Autonomous">
        Claude's role during an active incident is to analyze information and suggest actions —
        not to execute destructive operations autonomously. Always confirm before Claude executes
        commands that: restart services, modify database records, change configuration in
        production, or roll back deployments. An AI that makes a confident but wrong diagnosis
        and autonomously executes a rollback can turn a localized incident into a broader one.
        The "approve each action" mode of Claude Code is the right setting during incidents.
      </WarningBlock>

      <BestPracticeBlock title="Document the Triage Process as It Happens">
        During an incident, have Claude maintain a running timeline: "Update the incident
        timeline with what we just found." This produces a structured record of the incident
        as it unfolds, capturing the exact commands run, the evidence found, and the
        decisions made. This timeline is the foundation of the post-incident review and
        is far more accurate than reconstructing it from memory two days later. Start every
        triage session with: "Create an incident document at docs/incidents/$(date +%Y-%m-%d)-payment-incident.md
        and keep it updated as we work through the incident."
      </BestPracticeBlock>

      <NoteBlock type="tip" title="PagerDuty and Opsgenie Runbook Links">
        The fastest way to get Claude into the incident response workflow is to include
        a Claude triage starter script link in your PagerDuty or Opsgenie alert body.
        When the engineer acknowledges the alert, they can run the triage script with
        one command. The script automatically collects context (recent deployments,
        current error rate, current version) and starts a Claude session with that
        context pre-loaded. This eliminates the first 5-10 minutes of manual data
        collection that currently happens before any diagnosis begins.
      </NoteBlock>
    </article>
  )
}
