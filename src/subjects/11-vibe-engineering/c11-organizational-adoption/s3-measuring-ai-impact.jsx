import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function MeasuringAIImpact() {
  return (
    <article className="prose-content">
      <h1>Measuring AI Impact</h1>

      <p>
        "We're getting 10x productivity" is a claim frequently made about AI coding
        assistants and almost never measured rigorously. This creates a credibility problem:
        organizations that make inflated claims face skepticism from engineers and leadership
        alike, and when the expected productivity gains don't materialize uniformly, the
        entire AI adoption initiative loses support.
      </p>

      <p>
        Vibe Engineering takes a metrics-driven approach to AI adoption measurement.
        The goal is honest assessment: what measurable improvements are attributable to
        AI-assisted development, and what improvements are attributable to other factors?
        Some gains will be large and attributable. Others will be difficult to isolate.
        Measuring honestly, even when the results are mixed, builds the trust needed for
        sustained AI adoption.
      </p>

      <ConceptBlock title="DORA Metrics as the Baseline">
        The DORA (DevOps Research and Assessment) metrics — Deployment Frequency, Lead Time
        for Changes, Change Failure Rate, and Time to Restore Service — are the most
        widely validated measures of software delivery performance. They provide an
        objective baseline against which AI adoption impact can be measured. A team
        that was deploying weekly and moves to daily deployments after AI adoption has
        a measurable change. A team whose change failure rate increased after AI adoption
        has a signal that warrants investigation.
      </ConceptBlock>

      <SDKExample
        title="DORA Metrics Measurement"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'measure-dora.sh',
            code: `# Measure DORA metrics for AI impact assessment
claude "Calculate our DORA metrics for the last 90 days.

Data sources:
1. GitHub deployments API (production deployments):
   gh api repos/:owner/:repo/deployments --jq '[.[] | select(.environment == \"production\")] | length'

2. Pull request data (for lead time):
   gh pr list --state merged --base main --limit 100 --json number,createdAt,mergedAt,title

3. Incident data (for MTTR and change failure rate):
   cat docs/incidents/*.pir.md | grep -E 'Date:|Severity:|Duration:|Triggered by deployment:'

Calculate:

DEPLOYMENT FREQUENCY:
- Production deployments in last 90 days: [count]
- Daily average: [count / 90]
- DORA classification: Elite (multiple/day), High (1/day-1/week), Medium (1/week-1/month), Low (<monthly)

LEAD TIME FOR CHANGES:
- For each PR merged to main: time from first commit to production deployment
- Median lead time: [median]
- DORA classification: Elite (<1hr), High (1hr-1day), Medium (1day-1week), Low (>1week)

CHANGE FAILURE RATE:
- Deployments that required hotfix or rollback / total deployments
- Target: Elite < 5%, High 5-10%, Medium 10-15%, Low > 15%

MEAN TIME TO RESTORE:
- For each production incident: time from detection to resolution
- Median MTTR: [median]
- DORA classification: Elite (<1hr), High (<1day), Medium (<1week), Low (>1week)

Report baseline metrics. We will re-measure in 90 days after AI adoption to assess delta."`,
          },
        ]}
      />

      <SDKExample
        title="AI-Specific Metrics Dashboard"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'ai-metrics.sh',
            code: `# Collect AI-specific metrics from Claude Code usage logs
claude "Analyze Claude Code usage data and generate an AI impact report.

Claude Code audit logs: ~/.claude/logs/ (or organization's central log storage)
GitHub PR data for the last 30 days with AI usage tag

AI Usage Metrics:
1. Active users: how many engineers used Claude Code at least once this week?
2. Session frequency: average sessions per engineer per day
3. Task distribution: what types of tasks are engineers using Claude for?
   (code generation, code review, test writing, debugging, documentation)
4. Acceptance rate: what % of Claude suggestions are accepted (from VS Code telemetry)

Code Quality Metrics (compare AI-assisted vs non-AI-assisted PRs):
5. Defect rate: bugs reported per PR for AI-assisted vs non-AI-assisted features
6. Test coverage: average test coverage for AI-assisted vs non-AI-assisted code
7. Security findings: SAST findings per 1000 lines in AI-assisted vs non-AI-assisted code
8. Review cycles: average number of review cycles before merge (AI vs non-AI)

Productivity Metrics:
9. PR throughput: PRs merged per engineer per week (before/after AI adoption)
10. Cycle time: PR open to merge time for AI-assisted vs non-AI-assisted
11. Time allocation: estimated hours saved on test writing, documentation, boilerplate

ROI Calculation:
Given:
- Average engineer fully-loaded cost: $200/hour
- Claude Code cost: $X/month per engineer
- Hours saved per engineer per month (from surveys + time studies): Y hours
- ROI = (Y hours * $200) / (Claude Code cost + hours spent on AI governance)

Report format: executive summary with 5 headline numbers, then detailed metrics"`,
          },
        ]}
      />

      <h2>Measuring Quality, Not Just Speed</h2>

      <SDKExample
        title="AI Code Quality Assessment"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'ai-quality-assessment.sh',
            code: `# Assess whether AI-generated code meets quality bar
claude "Perform a quality assessment on AI-generated code from the last sprint.

Identify AI-generated PRs:
- PRs with 'AI-assisted' label in GitHub
- PRs where commit messages reference Claude Code

For a sample of 10 AI-assisted PRs:
Analyze each for:

1. TEST QUALITY
   - Do tests verify behavior (not just achieve coverage)?
   - Are there meaningful assertions (not just 'toBeDefined')?
   - Are edge cases covered?

2. SECURITY
   - Run semgrep against the changed files
   - Count and categorize findings

3. ARCHITECTURE CONFORMANCE
   - Run depcruise against the changed files
   - Does the code follow the layered architecture?

4. CODE READABILITY
   - Are functions focused (do one thing)?
   - Are variable names descriptive?
   - Is business logic documented with comments where non-obvious?

5. DOCUMENTATION
   - Are public APIs documented?
   - Are complex algorithms explained?

Score each PR on a 1-5 scale for each dimension.
Compare average scores to non-AI-assisted PRs from the same period.
Identify the quality dimensions where AI-assisted code is better/worse.
Recommend process adjustments for areas where AI-assisted code is weaker."`,
          },
        ]}
      />

      <WarningBlock title="Vanity Metrics vs. Actionable Metrics">
        Lines of code generated per day, number of AI sessions, and suggestion acceptance
        rate are vanity metrics — they measure AI activity, not AI value. A team that
        generates 10,000 AI-written lines of untested, insecure code has high AI activity
        and negative AI value. Focus measurement on outcomes: defect rate, deployment
        frequency, lead time, and team-reported productivity satisfaction. These measure
        whether AI adoption is actually improving software delivery performance.
      </WarningBlock>

      <BestPracticeBlock title="Controlled Experiments for Attribution">
        To attribute improvements to AI rather than other factors (process changes,
        team growth, simpler features), run controlled experiments. Have two teams
        with similar complexity work on comparable features — one with AI assistance,
        one without — and compare lead time, defect rate, and quality metrics.
        Or use a before/after comparison with a control: team A adopts AI in Q1,
        team B adopts AI in Q2. Compare team A's metrics change in Q1 vs. team B's
        change in Q1 (baseline for non-AI changes). This attribution is imperfect
        but better than anecdote.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Survey for Qualitative Impact">
        Quantitative metrics capture some AI impact but miss the qualitative dimensions
        that matter most to engineers: reduced cognitive fatigue, faster learning, more
        enjoyment of complex problem-solving, reduced context-switching overhead. Run
        a quarterly engineer experience survey with questions like: "How has AI assistance
        changed the cognitive demands of your work?" and "What types of tasks do you now
        complete with more confidence?" Ask Claude to analyze survey results and identify
        themes: "Analyze these 50 survey responses and identify the top 5 themes in
        how engineers describe AI impact on their work experience."
      </NoteBlock>
    </article>
  )
}
