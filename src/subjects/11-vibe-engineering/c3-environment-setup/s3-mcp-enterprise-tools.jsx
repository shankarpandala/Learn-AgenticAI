import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'

export default function MCPEnterpriseTools() {
  return (
    <article className="prose-content">
      <h1>MCP Enterprise Tools</h1>

      <p>
        The Model Context Protocol (MCP) lets Claude Code connect to external tools and data sources
        as first-class resources in a session. Where CLAUDE.md provides static context (rules,
        patterns, constraints), MCP provides dynamic context: the actual JIRA ticket Claude is
        implementing, the current state of the GitHub repository, the Confluence page describing the
        architecture, the Slack thread where the decision was made.
      </p>

      <p>
        Connecting Claude to enterprise tools via MCP transforms it from an isolated code-generation
        assistant into an integrated member of your engineering workflow — one that reads the same
        tickets, documents, and repositories as the rest of the team.
      </p>

      <ConceptBlock title="MCP: Dynamic Context at Scale">
        Without MCP, every Claude session starts with only the context you manually paste in. This
        creates a bottleneck: you spend time summarising tickets, copying error messages, and
        describing system state instead of directing Claude. With MCP, Claude can read the source
        directly — the JIRA ticket, the GitHub PR, the Confluence spec, the PagerDuty incident.
        This is the difference between telling Claude what the ticket says and giving Claude the
        ticket.
      </ConceptBlock>

      <h2>JIRA Integration</h2>

      <p>
        The JIRA MCP server allows Claude to read tickets, update status, add comments, and create
        subtasks. In a Vibe Engineering workflow, this enables the end-to-end feature workflow:
        Claude reads the ticket requirements directly, implements them, then updates the ticket with
        a summary of what was built.
      </p>

      <CodeBlock language="json" filename=".claude/mcp.json">
{`{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-jira"],
      "env": {
        "JIRA_HOST": "https://yourorg.atlassian.net",
        "JIRA_EMAIL": "\$\{JIRA_EMAIL\}",
        "JIRA_API_TOKEN": "\$\{JIRA_API_TOKEN\}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "\$\{GITHUB_TOKEN\}"
      }
    },
    "confluence": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-confluence"],
      "env": {
        "CONFLUENCE_HOST": "https://yourorg.atlassian.net/wiki",
        "CONFLUENCE_EMAIL": "\$\{CONFLUENCE_EMAIL\}",
        "CONFLUENCE_API_TOKEN": "\$\{CONFLUENCE_API_TOKEN\}"
      }
    }
  }
}`}
      </CodeBlock>

      <CodeBlock language="text" filename="JIRA-Driven Session Example">
{`# Claude session with JIRA MCP connected

User: Read ticket PLAT-2847 and implement it following our standard workflow.

Claude:
[reads JIRA ticket PLAT-2847]

Ticket: "Add rate limiting to the public API endpoints"
Acceptance criteria from ticket:
- Max 100 requests per minute per API key
- Return 429 with Retry-After header when limit exceeded
- Rate limit counts must be stored in Redis
- Rate limit status visible in the API response headers (X-RateLimit-*)

I'll now implement this following the workflow in CLAUDE.md:

Step 1: Writing failing tests...
[writes tests/api/test_rate_limiting.py]

Step 2: Committing tests...
[runs: git add tests/ && git commit -m "test: rate limiting acceptance tests for PLAT-2847"]

Step 3: Implementing rate limit middleware...
[implements src/middleware/rate_limit.py]

Step 4: Running quality gates...
pytest: 8 tests passed
tsc: no errors
bandit: no findings

Step 5: Updating JIRA ticket...
[adds comment to PLAT-2847: "Implementation complete. PR #847 opened. All acceptance criteria satisfied."]
[transitions ticket to "In Review"]`}
      </CodeBlock>

      <h2>GitHub Integration</h2>

      <p>
        The GitHub MCP server gives Claude read and write access to repositories, pull requests,
        issues, and actions. This enables Claude to open PRs, read existing code before modifying
        it, check CI status, and respond to PR review comments.
      </p>

      <CodeBlock language="text" filename="GitHub MCP Session Examples">
{`# Reading existing PR before implementing related changes
"Read PR #823 to understand the changes already merged to the auth module,
 then implement the session invalidation feature that was deferred from that PR."

# Opening a PR after implementation
"Create a PR for the changes on branch feat/rate-limiting with:
 - Title: feat(api): add rate limiting per PLAT-2847
 - Description generated from the changes (follow the PR template)
 - Link to JIRA ticket PLAT-2847
 - Reviewers: @alice @bob"

# Responding to review comments
"Read the review comments on PR #847 and address each one.
 For each comment: explain your change in a reply, then implement it."`}
      </CodeBlock>

      <h2>Confluence Integration</h2>

      <p>
        Technical decisions documented in Confluence are invisible to Claude without MCP. With the
        Confluence MCP server, Claude can read architectural runbooks, API documentation, onboarding
        guides, and decision records — and use them as context when generating code.
      </p>

      <CodeBlock language="text" filename="Confluence-Driven Session">
{`# Read the architecture doc before implementing
"Before implementing the notification service, read the architecture spec at:
 https://yourorg.atlassian.net/wiki/spaces/PLAT/pages/123456/Notification+Service+Architecture

 Then implement the email notification channel following the patterns documented there."`}
      </CodeBlock>

      <h2>Slack Integration</h2>

      <p>
        Slack threads often contain the context that never made it into the ticket: "we decided to
        use Redis for this because of the discussion in #platform-eng on Tuesday." With Slack MCP,
        Claude can read referenced threads to recover that context.
      </p>

      <CodeBlock language="json" filename=".claude/mcp.json (Slack addition)">
{`{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "\$\{SLACK_BOT_TOKEN\}",
        "SLACK_TEAM_ID": "\$\{SLACK_TEAM_ID\}"
      }
    }
  }
}`}
      </CodeBlock>

      <h2>Internal System MCP Servers</h2>

      <p>
        The most powerful MCP integrations are custom servers that connect Claude to your internal
        systems — feature flags, deployment systems, monitoring dashboards, internal APIs. These
        transform Claude from a general-purpose assistant into one that understands your specific
        operational environment.
      </p>

      <PatternBlock title="Building an Internal MCP Server">
        An MCP server is a small Node.js or Python process that implements the MCP protocol. Anthropic
        provides official SDKs for both. A minimal internal MCP server for a feature flag system
        might expose three tools: list_flags(), get_flag(name), and create_flag(name, description,
        default). Once Claude has access to these tools, it can read current flag states before
        implementing flag-gated features, and create new flags as part of implementation.
      </PatternBlock>

      <CodeBlock language="typescript" filename="mcp-servers/feature-flags/index.ts">
{`import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { FeatureFlagClient } from "./client.js"

const server = new Server(
  { name: "feature-flags", version: "1.0.0" },
  { capabilities: { tools: {} } }
)

const client = new FeatureFlagClient(process.env.FLAGSMITH_URL!, process.env.FLAGSMITH_KEY!)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_flags",
      description: "List all feature flags and their current state",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "get_flag",
      description: "Get the current state and description of a specific flag",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"]
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "list_flags") {
    const flags = await client.listFlags()
    return { content: [{ type: "text", text: JSON.stringify(flags, null, 2) }] }
  }
  if (request.params.name === "get_flag") {
    const flag = await client.getFlag(request.params.arguments!.name as string)
    return { content: [{ type: "text", text: JSON.stringify(flag, null, 2) }] }
  }
  throw new Error(Unknown tool: \${request.params.name})
})

const transport = new StdioServerTransport()
await server.connect(transport)`}
      </CodeBlock>

      <SecurityCallout severity="high" title="MCP Credential Security">
        MCP server configurations contain API tokens and credentials. Never commit these values
        directly to <code>.claude/mcp.json</code>. Use environment variable references
        (<code>${"${VARIABLE_NAME}"}</code>) and load them from a secrets manager or your shell
        environment. Add <code>.claude/mcp.json</code> to <code>.gitignore</code> if it contains
        any non-templated values. For team-shared configurations, use a templated version that
        each engineer populates from their own credentials.
      </SecurityCallout>

      <BestPracticeBlock title="Least-Privilege MCP Credentials">
        Create dedicated API tokens for Claude MCP servers with the minimum required permissions.
        The JIRA token needs read access to tickets and write access to comments — it does not need
        admin access. The GitHub token needs repo read/write — it does not need organisation admin.
        Dedicated tokens can be rotated independently and audited separately from personal tokens.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Start with Read-Only MCP">
        When introducing MCP to a team, start with read-only integrations. Claude reading JIRA tickets
        and Confluence docs has no side effects. Once the team is comfortable with Claude having that
        context, expand to write operations (commenting on tickets, opening PRs) with explicit review
        of what Claude is doing before it does it. Write operations via MCP should be treated with
        the same review discipline as code changes.
      </NoteBlock>
    </article>
  )
}
