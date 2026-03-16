import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function AILogAnalysis() {
  return (
    <article className="prose-content">
      <h1>AI Log Analysis</h1>

      <p>
        Production logs are among the most information-dense artifacts in software engineering —
        and among the least effectively analyzed. A production incident generates thousands
        of log lines per minute. Finding the signal in that noise — the first error that
        preceded the cascade, the pattern that distinguishes affected users from healthy ones,
        the specific component that began degrading before alerts fired — is cognitively
        demanding work that takes experienced engineers time they don't have during an active
        incident.
      </p>

      <p>
        Claude, when given structured access to logs through MCP tools or direct analysis
        sessions, can perform this analysis much faster than a human scanning log lines.
        The key is structured logging — logs that are queryable, filterable, and machine-readable
        are exponentially more useful than unstructured text when an AI is analyzing them.
      </p>

      <ConceptBlock title="Structured Logging as AI Input">
        Structured logs — JSON-formatted with consistent field names, request IDs, user IDs,
        and trace IDs — are not just better for human operators; they are prerequisites for
        effective AI log analysis. When Claude can filter <code>level:error AND service:payment-api AND
        trace_id:abc123</code>, it can correlate errors across services and identify root causes
        in seconds. When logs are unstructured strings, Claude must parse them, which introduces
        error and slows analysis. Structured logging is not a nice-to-have for AI-assisted
        operations — it is an enabler.
      </ConceptBlock>

      <SDKExample
        title="Setting Up Structured Logging for AI Analysis"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: 'CLAUDE.md (logging standards)',
            code: `## Logging Standards

### Format
All log output must be structured JSON using pino or winston with JSON transport.

### Required Fields (all log entries)
- timestamp: ISO 8601 format (pino generates automatically)
- level: error/warn/info/debug
- service: service name (process.env.SERVICE_NAME)
- version: application version (process.env.APP_VERSION)
- environment: dev/staging/production
- traceId: distributed trace ID (from request context or generated)
- requestId: individual request ID (for correlating within a single request)

### Required Fields (request logs)
- method: HTTP method
- path: request path (no query string — log that separately to avoid PII)
- statusCode: response status code
- durationMs: request duration in milliseconds
- userId: authenticated user ID (NOT email, NOT name — only UUID)

### FORBIDDEN in logs
- Passwords, tokens, API keys (any value matching secret patterns)
- PII: email addresses, names, phone numbers, addresses
- Full request/response bodies (log only metadata)
- Stack traces in info/warn levels (only in error level, with sanitization)

### Anomaly Detection
Logs are analyzed by Claude Code sessions during incidents.
Ensure log format supports: filtering by service, level, traceId, statusCode
CloudWatch Insights query format must be supported.`,
          },
          {
            label: 'typescript',
            language: 'typescript',
            filename: 'src/infrastructure/logger.ts',
            code: `import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: process.env.SERVICE_NAME || 'unknown',
    version: process.env.APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV,
  },
  redact: {
    // Automatically redact sensitive fields
    paths: ['password', 'token', 'secret', 'authorization', 'cookie',
            '*.password', '*.token', '*.secret', 'req.headers.authorization'],
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,  // Standard error serializer
    req: (req) => ({
      method: req.method,
      path: req.url?.split('?')[0],  // No query string (may contain PII)
      traceId: req.headers['x-trace-id'],
    }),
  },
})`,
          },
        ]}
      />

      <SDKExample
        title="AI Log Analysis Session"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'log-analysis-session.sh',
            code: `# During or after an incident — analyze logs with Claude
# Using AWS CloudWatch Logs directly

# Export relevant logs for analysis
aws logs filter-log-events \
  --log-group-name "/ecs/production/payment-api" \
  --start-time $(date -d '2 hours ago' +%s000) \
  --end-time $(date +%s000) \
  --filter-pattern '{ $.level = "error" }' \
  --query 'events[*].message' \
  --output text > /tmp/error-logs.json

# Analyze with Claude
claude "Analyze the following production error logs from payment-api.

Logs (last 2 hours, errors only): /tmp/error-logs.json

Perform the following analysis:

1. ERROR DISTRIBUTION
   - How many errors total?
   - What are the distinct error types and their frequency?
   - Which traceIds appear in multiple error log lines (cascading failures)?

2. TIMELINE
   - When did errors start? (compare to 30 minutes before)
   - Is the error rate increasing, decreasing, or stable?
   - Are there any error bursts (> 10 errors in 1 minute)?

3. IMPACT SCOPE
   - How many distinct userId values appear in error logs? (user impact)
   - Are errors concentrated in specific userIds or widespread?
   - Are errors concentrated in specific endpoints (\$.path)?

4. ROOT CAUSE HYPOTHESIS
   - What is the most likely root cause based on error messages and timing?
   - List hypotheses in order of probability

5. RECOMMENDED ACTIONS
   - What should be investigated first?
   - What queries would confirm or deny the top hypothesis?

Report format: structured summary, then detailed findings"`,
          },
        ]}
      />

      <h2>MCP Tools for Observability Platforms</h2>

      <SDKExample
        title="Datadog MCP Integration for Log Analysis"
        tabs={[
          {
            label: 'yaml',
            language: 'yaml',
            filename: '.claude/mcp-config.json',
            code: `{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-datadog"],
      "env": {
        "DD_API_KEY": "\$\{DD_API_KEY\}",
        "DD_APP_KEY": "\$\{DD_APP_KEY\}",
        "DD_SITE": "datadoghq.eu"
      }
    }
  }
}`,
          },
          {
            label: 'bash',
            language: 'bash',
            filename: 'datadog-mcp-session.sh',
            code: `# With Datadog MCP configured, Claude can query directly
claude "Use the Datadog MCP tools to analyze our payment service.

1. Query error logs for payment-api service in the last 1 hour:
   service:payment-api status:error

2. Get the top 10 error patterns (group by @error.message)

3. Check if error rate is elevated compared to baseline:
   Compare errors in last 1 hour vs same time window 7 days ago

4. Query APM traces for slow transactions:
   service:payment-api operation:stripe.charge duration:>2000ms

5. Check if there are correlated errors in dependent services:
   Query: service:(user-api OR notification-service) status:error 
   in the same timeframe

Report: timeline of events, services affected, user impact estimate,
top 3 hypotheses for root cause with supporting evidence from logs"`,
          },
        ]}
      />

      <h2>Anomaly Detection Patterns</h2>

      <SDKExample
        title="Setting Up Intelligent Alerting"
        tabs={[
          {
            label: 'bash',
            language: 'bash',
            filename: 'anomaly-alert-analysis.sh',
            code: `# When an anomaly alert fires, use Claude to contextualise it
claude "An anomaly detection alert fired: payment-api error rate is 3x baseline.

Context:
- Normal error rate: 0.1% (1 error per 1000 requests)
- Current error rate: 0.32% (3.2 errors per 1000 requests)
- Alert fired at: 14:23 UTC
- Recent deployments: $(git log --oneline --since='6 hours ago' origin/main)

Fetch and analyze the error logs from the past 30 minutes.
Available data sources: /tmp/recent-errors.json

Determine:
1. Are these new error types (first seen after last deployment) or pre-existing?
2. Is the error rate trending up (getting worse) or flat (stable at new baseline)?
3. Are errors correlated with the last deployment time?
4. What percentage of users are affected?

Recommendation:
- If new errors after deployment: suggest rollback assessment
- If pre-existing errors that increased: identify the trigger
- If isolated to a specific user segment: identify the segment for targeted fix"`,
          },
        ]}
      />

      <WarningBlock title="Log Analysis Is Not Log-Free Debugging">
        AI log analysis accelerates incident investigation but does not replace good logging.
        If your logs don't include the request ID, you cannot correlate events across services.
        If they don't include the user ID, you cannot assess user impact. If they don't include
        duration, you cannot identify performance degradation. The quality of AI log analysis
        is bounded by the quality of the logs themselves. Invest in structured logging with
        the right fields before expecting AI to make sense of them.
      </WarningBlock>

      <BestPracticeBlock title="Correlate Logs Across Services with Trace IDs">
        In a microservices architecture, a single user request may touch ten services.
        Without a correlation ID that propagates across service boundaries, you cannot
        follow a request through the system when debugging an incident. Implement distributed
        tracing (OpenTelemetry with Jaeger or Datadog APM): every request gets a trace ID
        at the entry point, and every downstream call carries that trace ID in the header.
        Include trace IDs in all log entries. This enables Claude to reconstruct the full
        request path from a single failing trace ID, rather than manually correlating
        logs across services by timestamp.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Log Retention Strategy for AI Analysis">
        AI log analysis sessions work best with logs that are queryable in real time —
        not archived to cold storage. Configure your log platform to retain hot logs
        (immediately queryable) for at least 14 days and warm logs for 90 days. This
        window covers the typical incident investigation timeline and enables post-incident
        analysis of patterns that weren't noticed during the incident. For GDPR compliance,
        anonymize PII in logs (replace real user IDs with pseudonymized IDs after 7 days)
        while retaining the structural information needed for analysis.
      </NoteBlock>
    </article>
  )
}
