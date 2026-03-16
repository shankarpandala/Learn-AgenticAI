import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const mcpNodes = [
  { id: 'host',    label: 'MCP Host\n(Claude Desktop / app)', type: 'agent',    x: 60,  y: 150 },
  { id: 'client',  label: 'MCP Client',                       type: 'agent',    x: 240, y: 150 },
  { id: 'srv1',    label: 'Filesystem Server',                 type: 'tool',     x: 440, y: 60  },
  { id: 'srv2',    label: 'Database Server',                   type: 'tool',     x: 440, y: 150 },
  { id: 'srv3',    label: 'Web Search Server',                 type: 'tool',     x: 440, y: 240 },
  { id: 'ext1',    label: 'Local Files',                       type: 'store',    x: 640, y: 60  },
  { id: 'ext2',    label: 'PostgreSQL',                        type: 'store',    x: 640, y: 150 },
  { id: 'ext3',    label: 'Search API',                        type: 'external', x: 640, y: 240 },
]

const mcpEdges = [
  { from: 'host',   to: 'client', label: 'embed'       },
  { from: 'client', to: 'srv1',   label: 'JSON-RPC 2.0' },
  { from: 'client', to: 'srv2',   label: 'JSON-RPC 2.0' },
  { from: 'client', to: 'srv3',   label: 'JSON-RPC 2.0' },
  { from: 'srv1',   to: 'ext1',   label: 'read/write'   },
  { from: 'srv2',   to: 'ext2',   label: 'query'        },
  { from: 'srv3',   to: 'ext3',   label: 'HTTP'         },
]

export default function McpProtocolDeepDive() {
  return (
    <article className="prose-content">
      <h2>Model Context Protocol (MCP) — Deep Dive</h2>
      <p>
        The <strong>Model Context Protocol (MCP)</strong> is an open standard introduced
        by Anthropic in November 2024. It defines how AI models (hosts) communicate with
        external capability providers (servers) over a structured JSON-RPC 2.0 channel.
        MCP replaces ad-hoc, per-integration tool definitions with a universal plug-and-play
        interface — build a server once, use it with any MCP-compatible host.
      </p>

      <ConceptBlock term="Model Context Protocol (MCP)">
        <p>
          MCP is a client–server protocol where the <strong>host</strong> (e.g. Claude
          Desktop, a custom app) embeds an MCP <strong>client</strong> that connects to
          one or more MCP <strong>servers</strong>. Each server exposes a set of{' '}
          <em>tools</em>, <em>resources</em>, and <em>prompts</em>. Communication uses
          JSON-RPC 2.0 over stdio, HTTP+SSE, or WebSockets.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram nodes={mcpNodes} edges={mcpEdges} title="MCP Host ↔ Client ↔ Servers" />

      <h2>Core Primitives</h2>

      <h3>Tools</h3>
      <p>
        Tools are callable functions the model can invoke. Each tool has a name,
        description, and JSON Schema input definition — identical to the Anthropic
        tool-use format. The server executes the function and returns a result.
      </p>

      <h3>Resources</h3>
      <p>
        Resources are read-only data the model can request by URI (e.g.{' '}
        <code>file:///etc/config.yaml</code> or <code>db://orders/2024-01</code>). Unlike
        tools, resource reads don't execute code; they return structured content that
        gets injected into the model's context.
      </p>

      <h3>Prompts</h3>
      <p>
        Servers can expose reusable prompt templates with parameters. The host renders
        the template and injects it as a system or user message — useful for standardised
        task bootstrapping (e.g. a "code-review" prompt that always follows your team's
        checklist).
      </p>

      <h2>Building an MCP Server</h2>

      <SDKExample
        title="Minimal MCP server (Python)"
        tabs={{
          python: `from mcp.server.fastmcp import FastMCP
import httpx

mcp = FastMCP("weather-server")

@mcp.tool()
async def get_weather(city: str) -> str:
    """Return current weather for a city."""
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://wttr.in/{city}?format=3",
            timeout=5,
        )
        return r.text

@mcp.resource("weather://{city}/forecast")
async def weather_forecast(city: str) -> str:
    """3-day forecast resource for a city."""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"https://wttr.in/{city}?format=j1", timeout=5)
        data = r.json()
        days = data["weather"][:3]
        lines = [
            f"Day {i+1}: max {d['maxtempC']}°C / min {d['mintempC']}°C"
            for i, d in enumerate(days)
        ]
        return "\\n".join(lines)

if __name__ == "__main__":
    mcp.run()   # defaults to stdio transport`,
          typescript: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "weather-server", version: "1.0.0" });

server.tool(
  "get_weather",
  "Return current weather for a city.",
  { city: z.string().describe("City name") },
  async ({ city }) => {
    const res = await fetch(https://wttr.in/\${city}?format=3);
    return { content: [{ type: "text", text: await res.text() }] };
  }
);

server.resource(
  "weather-forecast",
  "weather://{city}/forecast",
  async (uri) => {
    const city = uri.pathname.replace("/", "").split("/")[0];
    const res = await fetch(https://wttr.in/\${city}?format=j1);
    const data = await res.json();
    const text = data.weather
      .slice(0, 3)
      .map(
        (d: any, i: number) =>
          Day \${i + 1}: max \${d.maxtempC}°C / min \${d.mintempC}°C
      )
      .join("\\n");
    return { contents: [{ uri: uri.href, text, mimeType: "text/plain" }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);`,
          bash: `# Install the MCP Python SDK
pip install mcp[cli]

# Run your server
python weather_server.py

# Or use the MCP CLI to develop & inspect
mcp dev weather_server.py`,
        }}
      />

      <h2>Connecting an MCP Client</h2>

      <SDKExample
        title="MCP client — call tools from Python"
        tabs={{
          python: `import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    server_params = StdioServerParameters(
        command="python",
        args=["weather_server.py"],
    )
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # List available tools
            tools = await session.list_tools()
            print("Available tools:", [t.name for t in tools.tools])

            # Call a tool
            result = await session.call_tool(
                "get_weather", arguments={"city": "Tokyo"}
            )
            print(result.content[0].text)

asyncio.run(main())`,
          typescript: `import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "my-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: "node",
  args: ["weather-server.js"],
});

await client.connect(transport);

// Discover tools
const { tools } = await client.listTools();
console.log("Tools:", tools.map((t) => t.name));

// Call a tool
const result = await client.callTool({
  name: "get_weather",
  arguments: { city: "Tokyo" },
});
console.log((result.content[0] as { text: string }).text);`,
        }}
      />

      <h2>Transports</h2>

      <SDKExample
        title="HTTP + SSE transport (remote MCP server)"
        tabs={{
          python: `# Server side — expose over HTTP
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("remote-server")

@mcp.tool()
def ping() -> str:
    return "pong"

if __name__ == "__main__":
    mcp.run(transport="sse", host="0.0.0.0", port=8080)`,
          typescript: `// Client side — connect to remote server
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const client = new Client({ name: "remote-client", version: "1.0.0" });
const transport = new SSEClientTransport(
  new URL("http://my-mcp-server.example.com/sse")
);
await client.connect(transport);`,
        }}
      />

      <h2>Using MCP with Claude via the Anthropic SDK</h2>

      <SDKExample
        title="Feed MCP tool definitions to Claude"
        tabs={{
          python: `import asyncio, anthropic
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def mcp_tools_as_anthropic_tools(session: ClientSession):
    """Convert MCP tool definitions to Anthropic tool format."""
    mcp_tools = await session.list_tools()
    return [
        {
            "name": t.name,
            "description": t.description or "",
            "input_schema": t.inputSchema,
        }
        for t in mcp_tools.tools
    ]

async def main():
    server_params = StdioServerParameters(command="python", args=["weather_server.py"])
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await mcp_tools_as_anthropic_tools(session)

            client = anthropic.Anthropic()
            messages = [{"role": "user", "content": "What's the weather in Paris?"}]

            while True:
                response = client.messages.create(
                    model="claude-opus-4-6",
                    max_tokens=1024,
                    tools=tools,
                    messages=messages,
                )
                messages.append({"role": "assistant", "content": response.content})

                if response.stop_reason == "end_turn":
                    print(response.content[0].text)
                    break

                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        result = await session.call_tool(block.name, block.input)
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result.content[0].text,
                        })
                messages.append({"role": "user", "content": tool_results})

asyncio.run(main())`,
        }}
      />

      <h2>claude_desktop_config.json — Adding MCP Servers</h2>

      <SDKExample
        title="Registering servers in Claude Desktop"
        tabs={{
          bash: `# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%\\Claude\\claude_desktop_config.json
# Linux:   ~/.config/Claude/claude_desktop_config.json`,
          json: `{
  "mcpServers": {
    "weather": {
      "command": "python",
      "args": ["/path/to/weather_server.py"],
      "env": { "WEATHER_API_KEY": "sk-..." }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/docs"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "postgresql://user:pass@localhost/mydb" }
    }
  }
}`,
        }}
      />

      <SecurityCallout title="MCP Server Trust" severity="high">
        <p>
          MCP servers run with the permissions of the host process. A malicious or
          compromised server can read files, exfiltrate data, or execute arbitrary commands.
          Only install MCP servers from trusted sources. For remote servers, use
          authentication tokens and TLS. Review every server's tool definitions before
          enabling it in production.
        </p>
      </SecurityCallout>

      <PatternBlock name="Registry Pattern">
        <p>
          Maintain an internal MCP server registry (a JSON file or database) that lists
          approved servers, their endpoints, and the tools they expose. Gate server
          registration with a code-review process, just like you would for any third-party
          dependency.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="MCP Best Practices">
        <ul>
          <li>Prefix tool names with the server name (e.g. <code>weather__get_forecast</code>) to avoid collisions when connecting multiple servers.</li>
          <li>Return structured JSON from tools rather than plain text — it's easier for Claude to parse and extract fields.</li>
          <li>Implement <code>list_changed</code> notifications so hosts can refresh tool lists without restarting.</li>
          <li>Version your server (<code>version</code> field in <code>ServerInfo</code>) and document breaking changes.</li>
          <li>Use the <code>mcp dev</code> CLI inspector during development to test tool calls interactively.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock>
        MCP is already supported by Claude Desktop, Claude Code, Cursor, Zed, Sourcegraph
        Cody, and many other hosts. The official server registry at{' '}
        <strong>github.com/modelcontextprotocol/servers</strong> contains reference
        implementations for filesystem, Git, GitHub, databases, browser automation, and more.
      </NoteBlock>
    </article>
  )
}
