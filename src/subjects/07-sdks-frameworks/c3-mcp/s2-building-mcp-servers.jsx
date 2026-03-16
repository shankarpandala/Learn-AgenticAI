import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function BuildingMcpServers() {
  return (
    <article className="prose-content">
      <h2>Building Production MCP Servers</h2>
      <p>
        A production MCP server goes beyond a simple script — it needs authentication,
        error handling, observability, and clean tool design. This section covers patterns
        for building servers you can confidently deploy in an enterprise environment.
      </p>

      <h2>Project Structure</h2>

      <SDKExample
        title="Recommended project layout"
        tabs={{
          bash: `my-mcp-server/
├── src/
│   ├── server.py          # FastMCP app entry-point
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── database.py    # DB query tools
│   │   └── documents.py   # Document tools
│   ├── resources/
│   │   └── reports.py     # Resource endpoints
│   └── auth.py            # API key / OAuth helpers
├── tests/
│   └── test_tools.py
├── pyproject.toml
└── Dockerfile`,
        }}
      />

      <h2>Authentication</h2>

      <SDKExample
        title="Bearer-token auth on HTTP+SSE transport"
        tabs={{
          python: `from mcp.server.fastmcp import FastMCP
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import os

mcp = FastMCP("secure-server")
VALID_TOKENS = set(os.environ["MCP_API_KEYS"].split(","))

class BearerAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer ") or auth[7:] not in VALID_TOKENS:
            return Response("Unauthorized", status_code=401)
        return await call_next(request)

@mcp.tool()
def get_secret_data(key: str) -> str:
    """Retrieve sensitive configuration by key."""
    secrets = {"db_url": "postgresql://...", "api_key": "sk-..."}
    return secrets.get(key, "Not found")

# Wrap in Starlette with auth middleware
sse = SseServerTransport("/messages/")
app = Starlette()
app.add_middleware(BearerAuthMiddleware)
# Mount mcp app...`,
          typescript: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const VALID_TOKENS = new Set(process.env.MCP_API_KEYS?.split(",") ?? []);

const app = express();

// Auth middleware
app.use((req, res, next) => {
  const auth = req.headers["authorization"] ?? "";
  if (!auth.startsWith("Bearer ") || !VALID_TOKENS.has(auth.slice(7))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

const server = new McpServer({ name: "secure-server", version: "1.0.0" });
// ... register tools ...

// Mount SSE transport
const transport = new SSEServerTransport("/messages", res);
app.get("/sse", async (req, res) => {
  await server.connect(transport);
});

app.listen(8080);`,
        }}
      />

      <h2>Structured Tool Outputs</h2>

      <SDKExample
        title="Return rich structured data"
        tabs={{
          python: `from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel

mcp = FastMCP("data-server")

class CustomerRecord(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    mrr_usd: float

@mcp.tool()
async def lookup_customer(customer_id: str) -> list[dict]:
    """Look up a customer by ID and return their profile."""
    # In production: query your database
    record = CustomerRecord(
        id=customer_id,
        name="Acme Corp",
        email="billing@acme.com",
        plan="enterprise",
        mrr_usd=4500.0,
    )
    # Return as a list of content blocks (text + JSON)
    import json
    return [
        {"type": "text",     "text": f"Customer: {record.name}"},
        {"type": "resource", "resource": {
            "uri": f"crm://customers/{customer_id}",
            "text": record.model_dump_json(indent=2),
            "mimeType": "application/json",
        }},
    ]`,
        }}
      />

      <h2>Error Handling</h2>

      <SDKExample
        title="Graceful error returns"
        tabs={{
          python: `from mcp.server.fastmcp import FastMCP
from mcp.types import TextContent

mcp = FastMCP("robust-server")

@mcp.tool()
async def query_database(sql: str) -> list[dict]:
    """Execute a read-only SQL query."""
    import asyncpg, os

    if any(kw in sql.upper() for kw in ("INSERT", "UPDATE", "DELETE", "DROP")):
        return [{"type": "text", "text": "Error: only SELECT queries are allowed."}]

    try:
        conn = await asyncpg.connect(os.environ["DATABASE_URL"])
        rows = await conn.fetch(sql)
        await conn.close()
        import json
        return [{"type": "text", "text": json.dumps([dict(r) for r in rows], default=str)}]
    except asyncpg.PostgresError as e:
        return [{"type": "text", "text": f"Database error: {e}"}]
    except Exception as e:
        return [{"type": "text", "text": f"Unexpected error: {e}"}]`,
          typescript: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "robust-server", version: "1.0.0" });

server.tool(
  "query_database",
  "Execute a read-only SQL query.",
  { sql: z.string() },
  async ({ sql }) => {
    const forbidden = ["INSERT", "UPDATE", "DELETE", "DROP"];
    if (forbidden.some((kw) => sql.toUpperCase().includes(kw))) {
      return {
        content: [{ type: "text", text: "Error: only SELECT queries allowed." }],
        isError: true,
      };
    }
    try {
      // const rows = await db.query(sql);
      const rows: unknown[] = []; // placeholder
      return {
        content: [{ type: "text", text: JSON.stringify(rows) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: \`Database error: \${err}\` }],
        isError: true,
      };
    }
  }
);`,
        }}
      />

      <h2>Testing MCP Servers</h2>

      <SDKExample
        title="Unit test tools with pytest / jest"
        tabs={{
          python: `import pytest
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

@pytest.mark.anyio
async def test_get_weather():
    params = StdioServerParameters(command="python", args=["src/server.py"])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool("get_weather", {"city": "London"})
            assert result.content[0].text != ""
            assert "°C" in result.content[0].text or "°F" in result.content[0].text`,
          bash: `# Interactive testing with the MCP Inspector
npx @modelcontextprotocol/inspector python src/server.py

# Or with the mcp CLI
mcp dev src/server.py`,
        }}
      />

      <h2>Dockerising Your Server</h2>

      <SDKExample
        title="Dockerfile for an MCP server"
        tabs={{
          bash: `FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir .
COPY src/ src/

# Expose for HTTP+SSE transport
EXPOSE 8080

CMD ["python", "-m", "src.server"]`,
        }}
      />

      <SecurityCallout title="Least-Privilege Tool Design" severity="medium">
        <p>
          Each tool should do exactly one thing and require the minimum permissions to do
          it. Avoid generic "run any shell command" tools in production. If you must expose
          shell access, use an allowlist of permitted commands and validate inputs with a
          strict schema.
        </p>
      </SecurityCallout>

      <BestPracticeBlock title="Production Checklist">
        <ul>
          <li>Validate all tool inputs with Pydantic / Zod schemas before execution.</li>
          <li>Return <code>isError: true</code> on tool failures so the model knows to handle the error rather than treating it as data.</li>
          <li>Emit structured logs (JSON) for every tool invocation: tool name, inputs hash, duration, success/error.</li>
          <li>Rate-limit tool calls per client token to prevent abuse.</li>
          <li>Publish your server to a private MCP registry so teams can discover and reuse it.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock>
        The <strong>MCP Inspector</strong> (<code>npx @modelcontextprotocol/inspector</code>)
        is an interactive browser-based UI for exploring, calling, and debugging any MCP
        server. It's the fastest way to verify your server behaves correctly before
        integrating it with a host.
      </NoteBlock>
    </article>
  )
}
