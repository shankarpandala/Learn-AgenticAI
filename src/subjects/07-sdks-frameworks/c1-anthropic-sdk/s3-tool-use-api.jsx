import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ToolUseApi() {
  return (
    <article className="prose-content">
      <h2>Tool Use API</h2>
      <p>
        Tool use (also called function calling) allows Claude to request execution of external
        functions — searching databases, calling APIs, running code — then incorporate the results
        into its final response. This is the foundation of agentic behaviour.
      </p>

      <ConceptBlock term="Tool Use">
        <p>
          When Claude decides a tool is needed, it returns a <code>tool_use</code> content block
          containing the tool name and a JSON argument object. Your code executes the tool and
          returns the result as a <code>tool_result</code> block in the next user message. The loop
          continues until Claude responds with <code>stop_reason: "end_turn"</code>.
        </p>
      </ConceptBlock>

      <h2>Defining Tools</h2>
      <p>
        Tools are defined as JSON Schema objects specifying the name, description, and input
        parameters. Write clear descriptions — Claude uses them to decide when and how to call
        each tool.
      </p>

      <SDKExample
        title="Defining Tools"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "search_documents",
        "description": (
            "Search the internal knowledge base for documents matching a query. "
            "Use this when the user asks about company policies, procedures, or history."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query string.",
                },
                "top_k": {
                    "type": "integer",
                    "description": "Maximum number of results to return (1-10). Default 5.",
                    "default": 5,
                },
                "filter_date_after": {
                    "type": "string",
                    "format": "date",
                    "description": "Only return documents created after this date (YYYY-MM-DD).",
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name, e.g. 'London'"},
                "units": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "default": "celsius",
                },
            },
            "required": ["city"],
        },
    },
]

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[
        {"role": "user", "content": "What's the weather in Tokyo right now?"}
    ],
)
print(response.stop_reason)   # "tool_use"
print(response.content)       # includes tool_use block`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'search_documents',
    description:
      'Search the internal knowledge base for documents matching a query. ' +
      'Use this when the user asks about company policies, procedures, or history.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query string.' },
        top_k: {
          type: 'integer',
          description: 'Maximum number of results to return (1-10). Default 5.',
          default: 5,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_weather',
    description: 'Get the current weather for a city.',
    input_schema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: "City name, e.g. 'London'" },
        units: { type: 'string', enum: ['celsius', 'fahrenheit'], default: 'celsius' },
      },
      required: ['city'],
    },
  },
];

const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  tools,
  messages: [{ role: 'user', content: "What's the weather in Tokyo right now?" }],
});
console.log(response.stop_reason); // "tool_use"`,
        }}
      />

      <h2>The Tool Use Loop</h2>
      <p>
        A complete agentic tool-use loop requires: (1) sending the initial request, (2) detecting
        <code>tool_use</code> blocks, (3) executing the tools, (4) sending results back, and
        (5) repeating until <code>end_turn</code>.
      </p>

      <SDKExample
        title="Full Tool Use Loop"
        tabs={{
          python: `import anthropic
import json
from typing import Any

client = anthropic.Anthropic()

# Simulated tool implementations
def search_documents(query: str, top_k: int = 5, **_) -> list[dict]:
    """Mock: search a vector store."""
    return [
        {"title": f"Doc about {query}", "snippet": f"Relevant content for {query}...", "score": 0.95}
    ]

def get_weather(city: str, units: str = "celsius") -> dict:
    """Mock: call a weather API."""
    return {"city": city, "temperature": 22, "units": units, "condition": "sunny"}

TOOL_REGISTRY: dict[str, Any] = {
    "search_documents": search_documents,
    "get_weather": get_weather,
}

def run_tool(name: str, inputs: dict) -> str:
    """Dispatch a tool call and return JSON result."""
    if name not in TOOL_REGISTRY:
        return json.dumps({"error": f"Unknown tool: {name}"})
    try:
        result = TOOL_REGISTRY[name](**inputs)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"error": str(e)})

def agent_loop(user_message: str, tools: list, max_iterations: int = 10) -> str:
    """Run the tool-use loop until end_turn."""
    messages = [{"role": "user", "content": user_message}]

    for iteration in range(max_iterations):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )

        # Append assistant response to history
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            # Extract final text response
            for block in response.content:
                if block.type == "text":
                    return block.text
            return ""

        if response.stop_reason == "tool_use":
            # Execute all requested tool calls
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    print(f"[Tool] Calling {block.name} with {block.input}")
                    result_str = run_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result_str,
                    })

            # Send all tool results in a single user message
            messages.append({"role": "user", "content": tool_results})
        else:
            # Unexpected stop reason
            break

    return "Max iterations reached"

# Define tools (same as above)
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "units": {"type": "string", "enum": ["celsius", "fahrenheit"]},
            },
            "required": ["city"],
        },
    }
]

answer = agent_loop("What's the weather in Paris and Berlin?", tools)
print(answer)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Simulated tool implementations
const toolRegistry: Record<string, (args: Record<string, unknown>) => unknown> = {
  get_weather: ({ city, units = 'celsius' }) => ({
    city,
    temperature: 22,
    units,
    condition: 'sunny',
  }),
  search_documents: ({ query, top_k = 5 }) => [
    { title: Doc about \${query}, score: 0.95 },
  ],
};

function runTool(name: string, input: Record<string, unknown>): string {
  const fn = toolRegistry[name];
  if (!fn) return JSON.stringify({ error: Unknown tool: \${name} });
  try {
    return JSON.stringify(fn(input));
  } catch (e) {
    return JSON.stringify({ error: String(e) });
  }
}

async function agentLoop(
  userMessage: string,
  tools: Anthropic.Tool[],
  maxIterations = 10,
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  for (let i = 0; i < maxIterations; i++) {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      tools,
      messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text');
      return textBlock && textBlock.type === 'text' ? textBlock.text : '';
    }

    if (response.stop_reason === 'tool_use') {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          console.log([Tool] Calling \${block.name});
          const result = runTool(block.name, block.input as Record<string, unknown>);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }
      }
      messages.push({ role: 'user', content: toolResults });
    }
  }
  return 'Max iterations reached';
}

const tools: Anthropic.Tool[] = [
  {
    name: 'get_weather',
    description: 'Get the current weather for a city.',
    input_schema: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        units: { type: 'string', enum: ['celsius', 'fahrenheit'] },
      },
      required: ['city'],
    },
  },
];

const answer = await agentLoop("What's the weather in Paris and Berlin?", tools);
console.log(answer);`,
        }}
      />

      <h2>Tool Choice</h2>
      <p>
        The <code>tool_choice</code> parameter controls whether Claude must use a tool, may use
        one, or cannot use any.
      </p>

      <SDKExample
        title="Controlling Tool Choice"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

# Default: Claude decides whether to use tools
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    tool_choice={"type": "auto"},  # Default
    messages=[{"role": "user", "content": "Hello!"}],
)

# Force Claude to call a specific tool
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    tool_choice={"type": "tool", "name": "get_weather"},
    messages=[{"role": "user", "content": "Tell me about Paris."}],
)

# Force Claude to call at least one tool (but choose which)
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    tool_choice={"type": "any"},
    messages=[{"role": "user", "content": "I need information about Tokyo."}],
)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Force a specific tool
const forced = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  tools,
  tool_choice: { type: 'tool', name: 'get_weather' },
  messages: [{ role: 'user', content: 'Tell me about Paris.' }],
});

// Force at least one tool (Claude picks which)
const anyTool = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 1024,
  tools,
  tool_choice: { type: 'any' },
  messages: [{ role: 'user', content: 'I need information about Tokyo.' }],
});`,
        }}
      />

      <PatternBlock
        name="Parallel Tool Calls"
        category="Efficiency"
        whenToUse="When the user query requires independent data from multiple sources. Claude may return multiple tool_use blocks in a single response. Execute them in parallel to minimise latency."
      >
        <p>
          Claude can request multiple tool calls in a single response when the calls are
          independent. Your loop should collect all <code>tool_use</code> blocks from the
          response, execute them concurrently, and return all results in a single user message.
        </p>
      </PatternBlock>

      <WarningBlock title="Validate Tool Inputs Before Execution">
        <p>Claude's tool inputs are model-generated and could be malformed. Always validate
        inputs against the expected schema before executing, especially for destructive operations
        (deletions, writes, API calls with side effects). Use Pydantic or Zod for schema
        validation and return a descriptive error in the <code>tool_result</code> if validation
        fails — Claude will self-correct on the next turn.</p>
      </WarningBlock>

      <BestPracticeBlock title="Write Precise Tool Descriptions">
        <p>Tool descriptions are the primary signal Claude uses to select and invoke tools correctly.
        Include: what the tool does, when to use it (and when NOT to), what each parameter means,
        and example values. Vague descriptions cause hallucinated arguments or wrong tool selection.
        Treat tool descriptions like API documentation for a junior developer.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Token Efficiency with Tool Schemas">
        <p>Tool schemas count toward your input tokens on every request. For agents with many tools,
        this adds up quickly. Consider: grouping related tools into fewer tools with an action
        parameter, using a router agent that only passes relevant tools to sub-agents, or
        dynamically selecting a subset of tools based on the current task context.</p>
      </NoteBlock>
    </article>
  )
}
