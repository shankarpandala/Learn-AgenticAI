import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const toolCallNodes = [
  { id: 'user',    label: 'User Message',      type: 'external', x: 60,  y: 150 },
  { id: 'model',   label: 'LLM',               type: 'llm',      x: 220, y: 150 },
  { id: 'parse',   label: 'Parse Tool Call',   type: 'agent',    x: 380, y: 150 },
  { id: 'exec',    label: 'Execute Function',  type: 'tool',     x: 540, y: 150 },
  { id: 'result',  label: 'Tool Result',       type: 'store',    x: 380, y: 280 },
]

const toolCallEdges = [
  { from: 'user',   to: 'model',  label: 'messages'     },
  { from: 'model',  to: 'parse',  label: 'tool_use block' },
  { from: 'parse',  to: 'exec',   label: 'args (JSON)'  },
  { from: 'exec',   to: 'result', label: 'return value'  },
  { from: 'result', to: 'model',  label: 'tool_result'  },
]

export default function FunctionCalling() {
  return (
    <article className="prose-content">
      <h2>Function Calling</h2>
      <p>
        Function calling (also called tool use) is the mechanism by which an LLM requests
        that the host application execute a specific function and return the result. The model
        does not execute code itself — it emits a structured representation of a function call
        which the application interprets and runs. This enables agents to interact with external
        systems, APIs, databases, and file systems.
      </p>

      <ConceptBlock term="Function Calling / Tool Use">
        <p>
          A model feature where, instead of generating a plain text response, the model emits
          a structured JSON object describing a function it wants called: the function name and
          a set of typed arguments extracted from the conversation context. The application
          runs the function and feeds the result back as a <code>tool_result</code> message.
          The model then continues reasoning with the new information.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        nodes={toolCallNodes}
        edges={toolCallEdges}
        title="Function Calling Flow"
      />

      <h2>Defining Tools</h2>
      <p>
        Tools are declared via JSON Schema. Each tool has a name, description, and an
        input schema that describes its parameters. The quality of these descriptions directly
        affects how reliably the model invokes the tool with correct arguments.
      </p>

      <SDKExample
        title="Defining and Invoking Tools"
        tabs={{
          python: `import anthropic
import json

client = anthropic.Anthropic()

# Tool definitions — the model uses the descriptions to decide when and how to call each tool
tools = [
    {
        "name": "get_weather",
        "description": (
            "Retrieve current weather conditions for a city. "
            "Use this whenever the user asks about weather, temperature, or conditions "
            "in a specific location."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "City name, e.g. 'London' or 'New York'",
                },
                "units": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature units. Default: celsius",
                },
            },
            "required": ["city"],
        },
    },
    {
        "name": "search_web",
        "description": "Search the web for current information. Use for recent events or facts.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "max_results": {"type": "integer", "description": "Number of results (1–10)", "default": 5},
            },
            "required": ["query"],
        },
    },
]

# Simulated tool implementations
def get_weather(city: str, units: str = "celsius") -> dict:
    return {"city": city, "temperature": 18, "units": units, "condition": "partly cloudy"}

def search_web(query: str, max_results: int = 5) -> list[dict]:
    return [{"title": f"Result {i}", "url": f"https://example.com/{i}"} for i in range(max_results)]

TOOL_FUNCTIONS = {"get_weather": get_weather, "search_web": search_web}

def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            # Model finished — return the text response
            return next(b.text for b in response.content if b.type == "text")

        if response.stop_reason == "tool_use":
            # Model wants to call one or more tools
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    fn = TOOL_FUNCTIONS[block.name]
                    result = fn(**block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result),
                    })

            # Feed tool results back into the conversation
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})

result = run_agent("What's the weather like in Tokyo right now?")
print(result)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'get_weather',
    description: 'Retrieve current weather for a city.',
    input_schema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name' },
        units: { type: 'string', enum: ['celsius', 'fahrenheit'] },
      },
      required: ['city'],
    },
  },
];

function getWeather(city: string, units = 'celsius') {
  return { city, temperature: 18, units, condition: 'partly cloudy' };
}

async function runAgent(userMessage: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage },
  ];

  while (true) {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      tools,
      messages,
    });

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text');
      return textBlock && textBlock.type === 'text' ? textBlock.text : '';
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'get_weather') {
        const input = block.input as { city: string; units?: string };
        const result = getWeather(input.city, input.units);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
    }

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });
  }
}

const answer = await runAgent("What's the weather in Tokyo?");
console.log(answer);`,
        }}
      />

      <h2>Tool Choice Control</h2>
      <p>
        You can control whether the model is allowed to call tools, required to call a specific
        tool, or required to call any tool. This is useful for forcing structured output or
        preventing unwanted free-text responses.
      </p>

      <SDKExample
        title="Controlling Tool Choice"
        tabs={{
          python: `import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "extract_entities",
        "description": "Extract named entities from text",
        "input_schema": {
            "type": "object",
            "properties": {
                "people": {"type": "array", "items": {"type": "string"}},
                "organisations": {"type": "array", "items": {"type": "string"}},
                "locations": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["people", "organisations", "locations"],
        },
    }
]

# Force the model to always call extract_entities — no free-text response allowed
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=512,
    tools=tools,
    tool_choice={"type": "tool", "name": "extract_entities"},  # force specific tool
    messages=[{
        "role": "user",
        "content": "Apple CEO Tim Cook met with EU Commissioner Margrethe Vestager in Brussels."
    }],
)

tool_call = response.content[0]
print(tool_call.input)
# {"people": ["Tim Cook", "Margrethe Vestager"],
#  "organisations": ["Apple", "EU"],
#  "locations": ["Brussels"]}`,
        }}
      />

      <h2>Parallel Tool Calls</h2>
      <p>
        Modern models can request multiple tool calls in a single response when those calls are
        independent. This reduces round-trips significantly — instead of serialising N independent
        lookups, the model batches them.
      </p>

      <SDKExample
        title="Handling Parallel Tool Calls"
        tabs={{
          python: `import anthropic
import json
from concurrent.futures import ThreadPoolExecutor

client = anthropic.Anthropic()

# The model may request multiple tool_use blocks in one response
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,  # tools defined elsewhere
    messages=[{
        "role": "user",
        "content": "Compare the weather in London, Paris, and Berlin."
    }],
)

# Collect all tool_use blocks
tool_use_blocks = [b for b in response.content if b.type == "tool_use"]

# Execute all tool calls in parallel
def execute_tool(block):
    fn = TOOL_FUNCTIONS[block.name]
    result = fn(**block.input)
    return {
        "type": "tool_result",
        "tool_use_id": block.id,
        "content": json.dumps(result),
    }

with ThreadPoolExecutor() as pool:
    tool_results = list(pool.map(execute_tool, tool_use_blocks))

print(f"Executed {len(tool_results)} tool calls in parallel")`,
        }}
      />

      <h2>Structured Output via Tool Use</h2>
      <p>
        A common pattern is to define a single "output" tool with the exact schema you want and
        force the model to call it. This is more reliable than asking the model to emit JSON
        in a text block because the model's tool call arguments are always valid against the schema.
      </p>

      <SDKExample
        title="Structured Output Pattern"
        tabs={{
          python: `import anthropic
from pydantic import BaseModel

client = anthropic.Anthropic()

class ArticleSummary(BaseModel):
    title: str
    key_points: list[str]
    sentiment: str
    word_count_estimate: int

# Use Pydantic model to generate the JSON schema
output_tool = {
    "name": "save_summary",
    "description": "Save the structured article summary",
    "input_schema": ArticleSummary.model_json_schema(),
}

def summarise_article(article_text: str) -> ArticleSummary:
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        tools=[output_tool],
        tool_choice={"type": "tool", "name": "save_summary"},
        messages=[{
            "role": "user",
            "content": f"Summarise this article:\\n\\n{article_text}"
        }],
    )
    tool_call = response.content[0]
    return ArticleSummary(**tool_call.input)

summary = summarise_article("OpenAI released GPT-5 today...")
print(summary.key_points)`,
        }}
      />

      <BestPracticeBlock title="Function Calling Best Practices">
        <ul>
          <li>Write descriptive tool descriptions — the model relies on them to decide when to call each tool.</li>
          <li>Mark required parameters explicitly in the JSON schema; optional parameters should have sensible defaults.</li>
          <li>Handle <code>tool_use</code> stop reason in a loop — a single agent turn can involve many tool calls.</li>
          <li>Execute independent tool calls in parallel to reduce latency.</li>
          <li>Use <code>tool_choice: force</code> when you need guaranteed structured output rather than optional tool use.</li>
          <li>Return informative error messages as tool results — the model can reason about failures and retry.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="historical" title="Evolution of Function Calling">
        <p>
          Function calling was introduced by OpenAI in June 2023 and quickly adopted across
          providers. Early implementations required the model to serialise JSON inside a special
          token-delimited block. Current implementations expose a dedicated <code>tool_use</code>
          content block type, which is parsed independently from the text response and validated
          against the declared schema before being returned to the application.
        </p>
      </NoteBlock>
    </article>
  )
}
