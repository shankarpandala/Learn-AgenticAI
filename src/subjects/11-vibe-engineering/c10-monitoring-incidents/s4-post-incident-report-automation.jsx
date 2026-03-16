import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function PostIncidentReportAutomation() {
  return (
    <article className="prose-content">
      <h1>Post-Incident Report Automation</h1>

      <p>
        Post-incident reviews (PIRs, also called post-mortems or retrospectives) are among
        the highest-value activities an engineering team can do — when done well. A blameless
        PIR that honestly examines what happened, why systems and processes failed, and what
        systemic improvements would prevent recurrence is how organizations get better at
        reliability over time.
      </p>

      <p>
        In practice, PIRs are often delayed (written a week after the incident when memory
        has faded), incomplete (the timeline reconstruction is approximate), and shallow
        (action items are vague or never completed). Claude can dramatically improve PIR
        quality by automating the mechanical parts — timeline reconstruction from logs and
        Slack history, Five Whys analysis, and action item extraction — leaving the human
        team to focus on the judgment work: interpretation, learning, and commitment.
      </p>

      <ConceptBlock title="Blameless Culture and AI Analysis">
        A blameless PIR attributes failures to systems, processes, and conditions rather
        than to individual mistakes. This is not about avoiding accountability — it is
        about recognizing that humans make mistakes in contexts shaped by systems, and
        changing the systems is more effective than blaming the humans. AI-generated PIRs
        reinforce blamelessness by default: Claude describes what happened in system terms,
        not human-fault terms. Review generated PIRs to ensure this framing is maintained
        and strengthen it where the draft implies individual blame.
      </ConceptBlock>

      <SDKExample
        title="Automated PIR Generation"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'generate-pir.sh',
            code: `#!/bin/bash
# Generate PIR from incident artifacts
INCIDENT_ID=\$\{1:-"INC-2024-001"\}

claude "Generate a post-incident review (PIR) for incident $INCIDENT_ID.

Incident artifacts:

1. Incident timeline log (from triage session):
$(cat docs/incidents/\$\{INCIDENT_ID\}-timeline.md 2>/dev/null || echo 'Timeline not found')

2. Alert that triggered the incident:
$(cat /tmp/incident-alert.json 2>/dev/null || echo 'Alert data not available')

3. Commands run during incident (shell history):
$(cat /tmp/incident-commands.txt 2>/dev/null || echo 'Commands not captured')

4. Hotfix PR:
$(gh pr view $HOTFIX_PR_NUMBER --json title,body,reviews,mergedAt 2>/dev/null || echo 'PR not found')

5. Error rate timeline:
$(cat /tmp/error-rate-timeline.json 2>/dev/null || echo 'Metrics not available')

Generate: docs/incidents/\$\{INCIDENT_ID\}-pir.md

PIR structure:

## Summary
- Incident ID, date, duration
- Severity (P0/P1/P2)
- Services affected
- User impact (quantified: X% of users, Y transactions affected)
- Time to detect / time to mitigate / time to resolve

## Timeline
Reconstruct precise timeline from artifacts:
| Time (UTC) | Event |
|-----------|-------|
Use exact timestamps from logs, not approximations.

## Root Cause Analysis
Apply Five Whys:
1. Why did the incident occur? (immediate cause)
2. Why did that happen? (contributing factor)
3. Why did that happen? (systemic cause)
4. Why did that happen? (process gap)
5. Why did that happen? (cultural/organizational factor)

## What Went Well
- Detection mechanisms that worked
- Response actions that were effective
- Team coordination that was effective

## What Could Be Improved
- Detection gaps (why wasn't this caught earlier?)
- Response gaps (what slowed mitigation?)
- Process gaps (what process failed or was missing?)

## Action Items
For each gap identified, a specific, assignable action:
| Action | Owner | Due Date | Priority |
Use SMART criteria: specific, measurable, achievable, relevant, time-bound

## Appendix
- Full error log excerpt
- Relevant metrics graphs (links to Datadog dashboards)"`,
          },
        ]}
      />

      <h2>Five Whys Analysis with AI</h2>

      <SDKExample
        title="Structured Five Whys Analysis"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'five-whys.sh',
            code: `# Deep root cause analysis using Five Whys
claude "Perform a Five Whys root cause analysis for this incident.

Incident: Payment service returned 40% error rate for 18 minutes
Immediate cause: Stripe v10 API client sent malformed idempotency keys under concurrent load

Five Whys analysis — ask 'Why?' for each answer to find the systemic root cause:

Why 1: Why did the Stripe v10 client generate malformed idempotency keys?
[Expected answer: The idempotency key format changed in v10, and our implementation
was not updated to use the new format]

Why 2: Why was the implementation not updated when the key format changed?
[Expected answer: We upgraded the Stripe client version without reading the migration guide
for the idempotency key format change]

Why 3: Why did we upgrade without reading the migration guide?
[Expected answer: Our upgrade process does not require reviewing changelogs before merging
dependency upgrades]

Why 4: Why does our upgrade process not require changelog review?
[Expected answer: We rely on automated dependency updates (Dependabot) without a gate
for reviewing semantic/behavioral changes in payment-critical libraries]

Why 5: Why do we not have a gate for payment-critical library upgrades?
[Expected answer: We have not classified dependencies by criticality, so payment libraries
get the same (low) review bar as logging libraries]

ROOT CAUSE: Lack of a dependency criticality classification system that would require
human changelog review for changes to payment-critical dependencies.

SYSTEMIC FIX: Define a list of critical dependencies in CLAUDE.md and require manual
changelog review before merging any upgrade to those dependencies.

Generate the action item: 
'Create critical dependency list and update Dependabot config to require human review
for upgrades to: stripe, jsonwebtoken, bcrypt, aws-sdk, pg, typeorm'"`,
          },
        ]}
      />

      <h2>Action Item Tracking</h2>

      <SDKExample
        title="Creating and Tracking PIR Action Items"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'create-action-items.sh',
            code: `# Extract and create JIRA tickets for PIR action items
claude "Extract action items from the PIR and create JIRA tickets.

PIR action items section:
$(grep -A 50 '## Action Items' docs/incidents/INC-2024-001-pir.md)

For each action item:
1. Assess if it is sufficiently specific to become a JIRA ticket
2. If vague, make it specific (e.g., 'improve monitoring' → 'Add Datadog alert for
   payment error rate > 2x baseline with 5-minute window and PagerDuty routing')
3. Assign to the correct team (based on the system/process it addresses)
4. Set priority: P0 (prevents recurrence of this exact incident), 
                 P1 (prevents similar incidents),
                 P2 (improves response time)

Create JIRA tickets using the JIRA MCP tool for each P0 and P1 action item.
For P2 items, add to the team's backlog directly.

After creating tickets, update docs/incidents/INC-2024-001-pir.md with the JIRA links:
| Action | Owner | JIRA | Due Date | Priority |
|--------|-------|------|----------|----------|"`,
          },
        ]}
      />

      <h2>PIR Metrics and Learning Culture</h2>

      <SDKExample
        title="Incident Trend Analysis Across PIRs"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'incident-trends.sh',
            code: `# Quarterly incident trend analysis
claude "Analyze incident trends from the last 90 days of PIRs.

PIR documents: docs/incidents/
Find all PIRs from last 90 days: find docs/incidents/ -name '*-pir.md' -newer $(date -d '90 days ago' +%Y-%m-%d)

For each PIR, extract:
- Service affected
- Root cause category (deployment, dependency, configuration, capacity, external service, code bug)
- Detection method (alert fired, user report, manual observation)
- Time to detect
- Time to mitigate
- Recurrence (has this root cause category occurred before?)

Generate a trend report:

## Q4 2024 Incident Trends

### Summary
- Total incidents: X
- Total user-impact time: Y hours
- Most affected service: Z
- Average time to detect: X minutes
- Average time to mitigate: Y minutes

### Root Cause Distribution
[Chart as ASCII table]

### Systemic Issues
Issues that appeared in multiple incidents:

### Action Item Completion
Previous quarter's P0/P1 action items: X total
Completed: Y (%)
Overdue: Z

### Recommendations
Top 3 investments that would most reduce future incident impact"`,
          },
        ]}
      />

      <WarningBlock title="PIRs Must Not Be Performance Reviews in Disguise">
        The blameless culture principle is undermined when PIR action items are framed
        as individual performance issues or when PIR documents are visible to management
        during performance review cycles. Protect the psychological safety of PIR
        participation: PIR documents should be team-internal, action items should target
        systems and processes, and language like "Engineer X should have caught this"
        should be revised to "The code review checklist did not include checks for
        breaking changes in payment-critical libraries." Claude-generated PIRs should
        be reviewed for inadvertent blame language before being shared.
      </WarningBlock>

      <BestPracticeBlock title="PIR Within 48 Hours, Not 2 Weeks">
        PIRs lose value rapidly as memories fade, context is lost, and the team moves
        on. Establish a norm that PIR drafts are generated within 24 hours of incident
        resolution and reviewed within 48 hours. Claude's ability to reconstruct timelines
        from log artifacts reduces the effort barrier for early PIR generation. The
        draft does not need to be perfect — get the timeline down, form the hypotheses,
        and schedule a 45-minute team review within two days while the details are fresh.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Share PIRs Broadly for Organizational Learning">
        The value of a PIR multiplies when it is shared beyond the immediate incident team.
        A monthly "PIR digest" shared with all engineering teams surfaces patterns across
        services and prevents the same mistake being made in parallel by teams who don't
        know each other. Ask Claude to generate a monthly digest: "Summarize the 3-5 key
        learnings from this month's PIRs, written for engineers who were not involved in
        these incidents. Focus on the systemic insights and action items that could
        prevent similar incidents in other services."
      </NoteBlock>
    </article>
  )
}
