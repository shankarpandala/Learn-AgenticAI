import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const mcpNodes = [
  { id: 'claude',  label: 'Claude Code',        type: 'llm',      x: 80,  y: 150 },
  { id: 'client',  label: 'MCP Client',          type: 'agent',    x: 220, y: 150 },
  { id: 'server1', label: 'JIRA MCP Server',     type: 'tool',     x: 420, y: 80  },
  { id: 'server2', label: 'DB Query Server',      type: 'tool',     x: 420, y: 150 },
  { id: 'server3', label: 'Vault MCP Server',    type: 'tool',     x: 420, y: 220 },
  { id: 'jira',    label: 'JIRA API',            type: 'external', x: 580, y: 80  },
  { id: 'db',      label: 'PostgreSQL',          type: 'store',    x: 580, y: 150 },
  { id: 'vault',   label: 'HashiCorp Vault',     type: 'external', x: 580, y: 220 },
]

const mcpEdges = [
  { from: 'claude',  to: 'client',  label: 'tool call'    },
  { from: 'client',  to: 'server1', label: 'JSON-RPC'     },
  { from: 'client',  to: 'server2', label: 'JSON-RPC'     },
  { from: 'client',  to: 'server3', label: 'JSON-RPC'     },
  { from: 'server1', to: 'jira',    label: 'REST'         },
  { from: 'server2', to: 'db',      label: 'SQL'          },
  { from: 'server3', to: 'vault',   label: 'HTTP API'     },
  { from: 'server1', to: 'client',  label: 'result'       },
  { from: 'server2', to: 'client',  label: 'result'       },
  { from: 'server3', to: 'client',  label: 'result'       },
  { from: 'client',  to: 'claude',  label: 'tool result'  },
]

export default function MCPProtocol() {
  return (
    <div className="section-content">
      <h1>Model Context Protocol (MCP)</h1>
      <p>
        The Model Context Protocol (MCP) is an open standard published by Anthropic for connecting
        AI models to external tools, data sources, and services. Where Claude Code's built-in tools
        (Read, Write, Bash, etc.) give it access to the local filesystem and shell, MCP lets you
        extend Claude Code with <em>any</em> capability: querying your JIRA board, fetching secrets
        from HashiCorp Vault, running SQL against a production replica, calling internal REST APIs,
        or anything else you can wrap in a small process.
      </p>
      <p>
        MCP uses <strong>JSON-RPC 2.0</strong> as its wire protocol. A <em>server</em> is any
        process that speaks this protocol; a <em>client</em> (embedded in Claude Code) connects to
        one or more servers at startup and discovers their capabilities. From Claude Code's
        perspective, MCP tools appear alongside its built-in tools — the model chooses between them
        using the same reasoning process.
      </p>

      <h2>MCP Architecture</h2>
      <ArchitectureDiagram
        nodes={mcpNodes}
        edges={mcpEdges}
        width={640}
        height={320}
        title="Claude Code MCP Architecture"
      />

      <ConceptBlock title="MCP Server">
        <p>
          An MCP server is a local or remote process that exposes one or more of three primitive
          types over JSON-RPC 2.0:
        </p>
        <ul>
          <li>
            <strong>Tools</strong> — Callable actions with a name, description, and JSON Schema
            for their inputs. Claude Code invokes tools when it wants to take an action: create a
            JIRA ticket, run a parameterized SQL query, rotate a secret.
          </li>
          <li>
            <strong>Resources</strong> — Read-only data sources identified by a URI. Claude Code
            can read resources to gather context: a ticket's full description, a database schema,
            an API's OpenAPI spec. Resources are analogous to the Read tool but scoped to external
            systems.
          </li>
          <li>
            <strong>Prompts</strong> — Reusable, parameterised prompt templates stored on the
            server. An organization can define a "write a pull-request description" prompt once and
            have every Claude Code user invoke it consistently, ensuring formatting and content
            standards.
          </li>
        </ul>
        <p>
          Servers communicate over either <strong>stdio</strong> (the server is a child process of
          Claude Code, reading from stdin and writing to stdout) or <strong>HTTP + SSE</strong>
          (the server is a remote service, useful for shared team servers). Stdio is the standard
          choice for local development because it requires no network configuration and inherits
          the shell's environment variables automatically.
        </p>
      </ConceptBlock>

      <NoteBlock type="tip">
        <strong>Tools vs. Resources vs. Prompts at a glance:</strong> Use <em>tools</em> for
        anything that performs an action or has side effects (writing a ticket, querying a DB).
        Use <em>resources</em> for read-only structured data that Claude Code should inspect
        before acting (a ticket's current state, a table's schema). Use <em>prompts</em> for
        standardising how Claude Code frames a class of request, so every developer on the team
        gets the same quality of output for recurring tasks.
      </NoteBlock>

      <h2>Configuring MCP Servers</h2>
      <p>
        MCP servers are declared in a JSON configuration file. Claude Code looks for configuration
        in two places, merged in order:
      </p>
      <ul>
        <li>
          <code>~/.claude.json</code> — user-level servers available in every project (e.g., a
          Vault server for fetching your personal development credentials)
        </li>
        <li>
          <code>.mcp.json</code> in the project root — project-level servers checked into the
          repository so the whole team gets the same integrations
        </li>
      </ul>
      <CodeBlock language="json" filename=".mcp.json">{`{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["./mcp-servers/jira-server.js"],
      "env": {
        "JIRA_URL": "https://company.atlassian.net",
        "JIRA_TOKEN": "\${JIRA_API_TOKEN}"
      }
    },
    "postgres": {
      "command": "uvx",
      "args": ["mcp-server-postgres", "--db-url", "\${DATABASE_URL}"]
    }
  }
}`}</CodeBlock>

      <p>
        Each entry under <code>mcpServers</code> describes how to launch one server:
        <code>command</code> + <code>args</code> are passed to <code>child_process.spawn</code>,
        and <code>env</code> is merged into the child's environment. The <code>${"{VAR}"}</code>
        syntax performs variable interpolation from the parent shell's environment, keeping
        secrets out of the config file itself.
      </p>
      <p>
        The <code>uvx</code> runner (from the <code>uv</code> Python package manager) is
        convenient for Python MCP servers: it downloads and caches the package on first run
        without requiring a global <code>pip install</code>. This makes <code>.mcp.json</code>
        fully self-contained for projects with Python-based integrations.
      </p>

      <h2>Building a Custom MCP Server in Python</h2>
      <p>
        The official MCP Python SDK provides a decorator-based API that maps cleanly onto the
        JSON-RPC protocol. The following example implements a JIRA integration with two tools:
        <code>get_ticket</code> for fetching a single issue and <code>search_tickets</code> for
        JQL queries.
      </p>
      <CodeBlock language="python" filename="jira_mcp_server.py">{`"""
JIRA MCP Server — exposes JIRA query and retrieval tools to Claude Code.
Install: pip install mcp httpx
Run via Claude Code: configured in .mcp.json (see above)
"""

import asyncio
import os
from typing import Any

import httpx
import mcp.server.stdio
import mcp.types as types
from mcp.server import Server

JIRA_URL = os.environ["JIRA_URL"]          # e.g. https://company.atlassian.net
JIRA_TOKEN = os.environ["JIRA_TOKEN"]      # Personal Access Token or API token

# ── Server initialisation ────────────────────────────────────────────────────

server = Server("jira-tools")

def _jira_client() -> httpx.AsyncClient:
    """Return an authenticated httpx client for the JIRA REST API v3."""
    return httpx.AsyncClient(
        base_url=f"{JIRA_URL}/rest/api/3",
        headers={
            "Authorization": f"Bearer {JIRA_TOKEN}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        timeout=15.0,
    )

# ── Tool definitions ─────────────────────────────────────────────────────────

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="get_ticket",
            description=(
                "Fetch a single JIRA issue by its key (e.g. 'ENG-1234'). "
                "Returns the summary, description, status, assignee, priority, "
                "and all comments. Use this before updating or referencing a ticket."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "ticket_key": {
                        "type": "string",
                        "description": "JIRA issue key, e.g. 'ENG-1234'",
                        "pattern": "^[A-Z]+-[0-9]+$",
                    }
                },
                "required": ["ticket_key"],
                "additionalProperties": False,
            },
        ),
        types.Tool(
            name="search_tickets",
            description=(
                "Search JIRA issues using JQL (JIRA Query Language). "
                "Returns up to 50 matching issues with key, summary, status, and assignee. "
                "Example JQL: 'project = ENG AND status = \"In Progress\" AND assignee = currentUser()'"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "jql": {
                        "type": "string",
                        "description": "A valid JQL query string",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return (1–50, default 20)",
                        "minimum": 1,
                        "maximum": 50,
                        "default": 20,
                    },
                },
                "required": ["jql"],
                "additionalProperties": False,
            },
        ),
    ]

# ── Tool handlers ────────────────────────────────────────────────────────────

@server.call_tool()
async def call_tool(
    name: str, arguments: dict[str, Any]
) -> list[types.TextContent]:

    if name == "get_ticket":
        return await _get_ticket(arguments["ticket_key"])

    if name == "search_tickets":
        return await _search_tickets(
            jql=arguments["jql"],
            max_results=arguments.get("max_results", 20),
        )

    # Unknown tool — return a structured error so Claude Code understands
    return [types.TextContent(
        type="text",
        text=f'{{"error": "Unknown tool: {name}. Available tools: get_ticket, search_tickets"}}',
    )]


async def _get_ticket(ticket_key: str) -> list[types.TextContent]:
    async with _jira_client() as client:
        resp = await client.get(
            f"/issue/{ticket_key}",
            params={
                "fields": "summary,description,status,assignee,priority,comment",
            },
        )

    if resp.status_code == 404:
        return [types.TextContent(
            type="text",
            text=f'{{"error": "Ticket {ticket_key} not found. Verify the key and try again."}}',
        )]

    if resp.status_code != 200:
        return [types.TextContent(
            type="text",
            text=f'{{"error": "JIRA API returned HTTP {resp.status_code}", "detail": "{resp.text[:200]}"}}',
        )]

    data = resp.json()
    fields = data["fields"]

    # Flatten comments to plain text to keep the response compact
    comments = [
        {
            "author": c["author"]["displayName"],
            "created": c["created"],
            "body": c["body"],
        }
        for c in (fields.get("comment", {}).get("comments") or [])
    ]

    result = {
        "key": ticket_key,
        "summary": fields.get("summary"),
        "status": fields["status"]["name"],
        "priority": fields["priority"]["name"] if fields.get("priority") else None,
        "assignee": fields["assignee"]["displayName"] if fields.get("assignee") else "Unassigned",
        "description": fields.get("description"),
        "comments": comments,
    }

    import json
    return [types.TextContent(type="text", text=json.dumps(result, indent=2))]


async def _search_tickets(jql: str, max_results: int) -> list[types.TextContent]:
    async with _jira_client() as client:
        resp = await client.post(
            "/search",
            json={
                "jql": jql,
                "maxResults": max_results,
                "fields": ["key", "summary", "status", "assignee"],
            },
        )

    if resp.status_code != 200:
        return [types.TextContent(
            type="text",
            text=f'{{"error": "JQL search failed with HTTP {resp.status_code}", "detail": "{resp.text[:200]}"}}',
        )]

    data = resp.json()
    issues = [
        {
            "key": issue["key"],
            "summary": issue["fields"]["summary"],
            "status": issue["fields"]["status"]["name"],
            "assignee": (
                issue["fields"]["assignee"]["displayName"]
                if issue["fields"].get("assignee")
                else "Unassigned"
            ),
        }
        for issue in data.get("issues", [])
    ]

    import json
    return [types.TextContent(
        type="text",
        text=json.dumps({"total": data.get("total", 0), "issues": issues}, indent=2),
    )]

# ── Entrypoint ───────────────────────────────────────────────────────────────

async def main() -> None:
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )

if __name__ == "__main__":
    asyncio.run(main())`}</CodeBlock>

      <SecurityCallout severity="high">
        <strong>Never embed secrets in MCP server code or configuration.</strong>
        <ul>
          <li>
            Always read credentials from environment variables (as shown above). The
            <code>.mcp.json</code> <code>env</code> block uses <code>${"{VAR}"}</code>
            interpolation — it reads from the shell, not from the file. Commit
            <code>.mcp.json</code> to git; never commit <code>.env</code> files or any file
            containing real tokens.
          </li>
          <li>
            Never log the full request body or response body from external APIs. JIRA descriptions,
            Vault secret values, and database rows may contain PII, credentials, or other sensitive
            data. Log only the HTTP status code and the tool name.
          </li>
          <li>
            Validate all inputs with JSON Schema (as shown in <code>inputSchema</code> above)
            <em>before</em> forwarding them to external systems. An LLM can produce unexpected
            values; the MCP server is the last line of defence before those values reach your
            production APIs.
          </li>
          <li>
            Scope JIRA tokens to the minimum required permissions. A read-only token is sufficient
            for <code>get_ticket</code> and <code>search_tickets</code>. Create a separate token
            with write permissions only if you add tools that create or update issues.
          </li>
        </ul>
      </SecurityCallout>

      <h2>The Internal Tool Registry Pattern</h2>
      <PatternBlock title="Internal Tool Registry Pattern">
        <p>
          As the number of MCP servers in an organization grows, managing them individually on
          each developer's machine becomes error-prone. Teams end up with different server
          versions, inconsistent tool schemas, and no central visibility into what tools exist.
          The Internal Tool Registry Pattern solves this by treating MCP servers as shared
          infrastructure.
        </p>
        <ol>
          <li>
            <strong>Create a dedicated repository</strong> (e.g.,
            <code>internal/mcp-servers</code>) that contains all approved MCP servers for the
            organization. Each server lives in its own subdirectory with a
            <code>package.json</code> or <code>pyproject.toml</code>, a changelog, and semantic
            versioning tags.
          </li>
          <li>
            <strong>Publish servers to an internal package registry</strong> (npm private registry,
            PyPI private index, or a simple GitHub release with a tarball). Developers reference
            the server by package name and version in <code>.mcp.json</code>, not by a local path.
          </li>
          <li>
            <strong>Gate changes through code review.</strong> Any modification to a tool's
            schema or behaviour is a breaking change for every Claude Code user who depends on it.
            Require at least one review from a security engineer before merging changes to servers
            that touch production systems.
          </li>
          <li>
            <strong>Document tools for Claude, not for humans.</strong> The
            <code>description</code> field in each tool definition is read by the model, not
            shown in a UI. Write descriptions that explain <em>when</em> to use the tool, what
            the inputs mean, and what errors to expect. A well-written description reduces
            incorrect tool invocations.
          </li>
          <li>
            <strong>Version the shared <code>.mcp.json</code> template.</strong> Ship a
            <code>.mcp.json.template</code> with the registry repo. Developers copy it to their
            projects and fill in their environment-specific variable names. Infrastructure
            changes that require an update to the template are communicated via changelog, not
            Slack messages.
          </li>
        </ol>
      </PatternBlock>

      <BestPracticeBlock title="MCP Server Design Principles">
        <ul>
          <li>
            <strong>One tool, one responsibility.</strong> Resist the urge to create a
            <code>jira_do_everything</code> tool that takes an <code>action</code> enum. Instead,
            define <code>get_ticket</code>, <code>create_ticket</code>,
            <code>add_comment</code>, and <code>transition_status</code> as separate tools. The
            model selects tools by name and description; a coarse-grained tool with a vague
            description leads to misuse.
          </li>
          <li>
            <strong>Validate all inputs with JSON Schema before acting.</strong> Declare
            <code>additionalProperties: false</code> and <code>required</code> arrays in every
            <code>inputSchema</code>. Reject invalid inputs with a structured JSON error response
            rather than an uncaught exception — a clean error message helps Claude Code self-correct
            on the next attempt.
          </li>
          <li>
            <strong>Return structured JSON, not prose.</strong> Claude Code parses tool results
            as text, but structured JSON makes it far easier for the model to extract specific
            fields and reason about them. Return <code>{"{"}"error": "...", "code": "NOT_FOUND"{"}"}</code>
            on failure and <code>{"{"}"data": ...{"}"}</code> on success. Consistency across tools
            reduces the model's cognitive load.
          </li>
          <li>
            <strong>Write error messages that tell Claude Code what to do next.</strong> Instead
            of <code>"HTTP 403"</code>, return <code>"Access denied: the JIRA_TOKEN does not have
            permission to view project ENG. Ask your JIRA admin to grant Browse Projects access."
            </code> The model will surface this to the user or attempt an alternative approach.
          </li>
          <li>
            <strong>Keep server startup fast.</strong> Claude Code launches MCP servers at
            startup and waits for them to report ready before accepting the first prompt. Defer
            expensive initialisation (opening database connections, warming caches) to the first
            actual tool call, not to server startup.
          </li>
          <li>
            <strong>Test servers independently of Claude Code.</strong> Write unit tests that
            call your tool handler functions directly with known inputs and assert on the returned
            JSON. This is far faster than debugging a server by running Claude Code end-to-end.
          </li>
        </ul>
      </BestPracticeBlock>
    </div>
  )
}
