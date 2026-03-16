import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const sdkNodes = [
  { id: 'app',      label: 'Your Application',    type: 'agent',    x: 60,  y: 150 },
  { id: 'sdk',      label: 'Claude Agent SDK',     type: 'llm',      x: 230, y: 150 },
  { id: 'session',  label: 'Session Manager',      type: 'agent',    x: 400, y: 80  },
  { id: 'tools',    label: 'Tool Executor',        type: 'tool',     x: 400, y: 150 },
  { id: 'memory',   label: 'Memory / Context',     type: 'store',    x: 400, y: 220 },
  { id: 'api',      label: 'Anthropic Messages API', type: 'external', x: 580, y: 150 },
]

const sdkEdges = [
  { from: 'app',     to: 'sdk',     label: 'run(task)' },
  { from: 'sdk',     to: 'session', label: 'manage' },
  { from: 'sdk',     to: 'tools',   label: 'dispatch' },
  { from: 'sdk',     to: 'memory',  label: 'read/write' },
  { from: 'sdk',     to: 'api',     label: 'messages' },
  { from: 'api',     to: 'sdk',     label: 'response' },
  { from: 'tools',   to: 'sdk',     label: 'result' },
]

export default function ClaudeAgentSdk() {
  return (
    <article className="prose-content">
      <h2>Claude Agent SDK</h2>
      <p>
        The Claude Agent SDK (part of the Anthropic Agent SDK / Claude Code SDK) provides
        higher-level abstractions on top of the raw Messages API. Instead of manually managing
        the tool-call loop, building context windows, and handling retries, the SDK handles
        the agentic loop for you so you can focus on defining tools and tasks.
      </p>

      <ConceptBlock term="Agentic Loop">
        <p>
          The agentic loop is the cycle: <strong>send message → receive response →
          if tool_use block present, execute tool → append result → repeat</strong> until
          the model returns a final <code>end_turn</code> stop reason. The Agent SDK
          encapsulates this loop, including streaming, error handling, and context-window
          management.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram nodes={sdkNodes} edges={sdkEdges} title="Claude Agent SDK Architecture" />

      <h2>Installation</h2>

      <SDKExample
        title="Install the SDK"
        tabs={{
          bash: `# Python (Claude Agent SDK ships inside the anthropic package)
pip install anthropic

# TypeScript
npm install @anthropic-ai/sdk`,
        }}
      />

      <h2>Running an Agent with the SDK</h2>
      <p>
        The simplest entry-point is <code>client.beta.messages.create</code> with
        <code>betas=["computer-use-2024-10-22"]</code> for computer use, or the higher-level
        agentic helpers introduced in the Claude Code SDK for programmatic sub-agent control.
      </p>

      <SDKExample
        title="Basic tool-use agentic loop (Python)"
        tabs={{
          python: `import anthropic
import json

client = anthropic.Anthropic()

# Define tools
tools = [
    {
        "name": "read_file",
        "description": "Read the contents of a file from disk.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Absolute file path"}
            },
            "required": ["path"],
        },
    },
    {
        "name": "write_file",
        "description": "Write content to a file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path":    {"type": "string"},
                "content": {"type": "string"},
            },
            "required": ["path", "content"],
        },
    },
]

def execute_tool(name: str, inputs: dict) -> str:
    """Dispatch tool calls to real implementations."""
    if name == "read_file":
        try:
            with open(inputs["path"]) as f:
                return f.read()
        except FileNotFoundError:
            return f"Error: file not found: {inputs['path']}"
    elif name == "write_file":
        with open(inputs["path"], "w") as f:
            f.write(inputs["content"])
        return "File written successfully."
    return f"Unknown tool: {name}"

def run_agent(task: str) -> str:
    """Run the agentic loop until end_turn."""
    messages = [{"role": "user", "content": task}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )

        # Append assistant response to context
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            # Extract final text answer
            for block in response.content:
                if block.type == "text":
                    return block.text
            return ""

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })
            messages.append({"role": "user", "content": tool_results})

answer = run_agent("Read /etc/hostname and tell me the machine name.")
print(answer)`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "read_file",
    description: "Read the contents of a file from disk.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Absolute file path" },
      },
      required: ["path"],
    },
  },
];

function executeTool(name: string, input: Record<string, string>): string {
  if (name === "read_file") {
    try {
      return fs.readFileSync(input.path, "utf-8");
    } catch {
      return Error: file not found: \${input.path};
    }
  }
  return Unknown tool: \${name};
}

async function runAgent(task: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: task },
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      return response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = response.content
        .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
        .map((b) => ({
          type: "tool_result" as const,
          tool_use_id: b.id,
          content: executeTool(b.name, b.input as Record<string, string>),
        }));
      messages.push({ role: "user", content: toolResults });
    }
  }
}

runAgent("Read /etc/hostname and tell me the machine name.").then(console.log);`,
        }}
      />

      <h2>Claude Code SDK — Programmatic Sub-Agents</h2>
      <p>
        The <strong>Claude Code SDK</strong> lets you spawn Claude Code as a headless
        sub-agent inside your own programs. This is ideal for coding pipelines where you
        want Claude to autonomously edit files, run tests, and iterate.
      </p>

      <SDKExample
        title="Claude Code SDK — headless sub-agent"
        tabs={{
          bash: `# Install the Claude Code CLI (also ships the SDK)
npm install -g @anthropic-ai/claude-code`,
          typescript: `import { query, type SDKMessage } from "@anthropic-ai/claude-code";

async function runCodingAgent(prompt: string, projectDir: string) {
  const messages: SDKMessage[] = [];

  // query() streams messages from a headless Claude Code session
  for await (const message of query({
    prompt,
    options: {
      cwd: projectDir,
      // Limit tools for safety in CI
      allowedTools: ["Read", "Write", "Edit", "Bash"],
    },
  })) {
    messages.push(message);

    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") process.stdout.write(block.text);
      }
    }
  }

  return messages;
}

// Example: fix a failing test
await runCodingAgent(
  "Run the test suite, identify any failures, and fix them.",
  "/home/user/my-project"
);`,
          python: `# Python wrapper (calls the CLI via subprocess)
import subprocess, json, sys

def run_claude_code(prompt: str, cwd: str) -> list[dict]:
    """Run Claude Code headlessly and collect output messages."""
    result = subprocess.run(
        ["claude", "--print", "--output-format", "stream-json",
         "--allowedTools", "Read,Write,Edit,Bash",
         "--prompt", prompt],
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    messages = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if line:
            try:
                messages.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return messages

msgs = run_claude_code(
    "Add type annotations to all functions in src/utils.py",
    "/home/user/my-project"
)
for m in msgs:
    if m.get("type") == "result":
        print("Final:", m.get("result"))`,
        }}
      />

      <h2>Sessions and Multi-Turn Conversations</h2>
      <p>
        For long-running agents you want to persist the conversation across invocations.
        The SDK supports passing a <code>session_id</code> (Claude Code SDK) or
        manually serialising <code>messages</code> to a store between runs.
      </p>

      <SDKExample
        title="Resuming a Claude Code session"
        tabs={{
          typescript: `import { query } from "@anthropic-ai/claude-code";

// First turn – no session yet
let sessionId: string | undefined;

for await (const msg of query({ prompt: "Create a React component for a login form." })) {
  if (msg.type === "system" && msg.session_id) {
    sessionId = msg.session_id;   // capture for next turn
  }
}

// Second turn – continue the same session
for await (const msg of query({
  prompt: "Now add form validation with Zod.",
  options: { resume: sessionId },
})) {
  if (msg.type === "assistant") {
    for (const block of msg.message.content) {
      if (block.type === "text") process.stdout.write(block.text);
    }
  }
}`,
        }}
      />

      <h2>Streaming Responses</h2>

      <SDKExample
        title="Streaming with the Anthropic SDK"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a haiku about agentic AI."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

# Access the final message after streaming completes
final = stream.get_final_message()
print(f"\\nStop reason: {final.stop_reason}")
print(f"Input tokens: {final.usage.input_tokens}")`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const stream = await client.messages.stream({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Write a haiku about agentic AI." }],
});

for await (const chunk of stream) {
  if (
    chunk.type === "content_block_delta" &&
    chunk.delta.type === "text_delta"
  ) {
    process.stdout.write(chunk.delta.text);
  }
}

const final = await stream.finalMessage();
console.log("\\nStop reason:", final.stop_reason);`,
        }}
      />

      <PatternBlock name="Tool-Result Injection Pattern">
        <p>
          Always include tool results in the same <code>user</code> turn that follows the
          assistant's <code>tool_use</code> blocks. Each <code>tool_result</code> must
          reference the exact <code>tool_use_id</code> from the model's response. Missing
          or mismatched IDs cause <code>400</code> validation errors.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Agent SDK Best Practices">
        <ul>
          <li>Set <code>max_tokens</code> high enough (≥ 4 096) for tool-heavy tasks; the model stops mid-loop if it runs out.</li>
          <li>Add a <strong>loop counter</strong> (e.g. max 20 iterations) to prevent runaway agents.</li>
          <li>Catch <code>anthropic.APIStatusError</code> for rate-limit (429) and server (500+) errors; implement exponential back-off.</li>
          <li>Log every message turn to a structured store for observability and replay.</li>
          <li>Use <code>tool_choice: &#123;"type": "auto"&#125;</code> in most cases; switch to <code>"any"</code> only when you need to force a tool call.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock>
        The <strong>Claude Code SDK</strong> (<code>@anthropic-ai/claude-code</code>) and
        the <strong>Anthropic Messages SDK</strong> (<code>@anthropic-ai/sdk</code>) are
        complementary, not competing. Use the Messages SDK when you build your own tool
        executor. Use the Claude Code SDK when you want Claude Code's full tool suite
        (file editing, bash, MCP) in a headless subprocess.
      </NoteBlock>
    </article>
  )
}
