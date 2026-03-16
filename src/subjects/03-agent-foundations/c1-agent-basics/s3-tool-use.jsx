import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import PatternBlock from '../../../components/content/PatternBlock.jsx';
import WarningBlock from '../../../components/content/WarningBlock.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const toolUsePython = `from anthropic import Anthropic
import json
import math

client = Anthropic()

# ── Tool definitions (schemas the model uses to decide when/how to call) ──────
tools = [
    {
        "name": "get_weather",
        "description": (
            "Retrieve current weather conditions for a city. "
            "Returns temperature (Celsius), humidity (%), and a short description."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "City name, e.g. 'London' or 'Tokyo'"
                },
                "units": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature unit. Defaults to celsius."
                }
            },
            "required": ["city"]
        }
    },
    {
        "name": "calculate",
        "description": "Evaluate a safe arithmetic expression and return the numeric result.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Arithmetic expression using +, -, *, /, **, sqrt(), e.g. 'sqrt(144) + 2**8'"
                }
            },
            "required": ["expression"]
        }
    }
]

# ── Tool implementations ───────────────────────────────────────────────────────

def get_weather(city: str, units: str = "celsius") -> dict:
    """Simulated weather service."""
    weather_db = {
        "london":  {"temp_c": 12, "humidity": 78, "desc": "overcast clouds"},
        "tokyo":   {"temp_c": 24, "humidity": 55, "desc": "partly cloudy"},
        "sydney":  {"temp_c": 21, "humidity": 62, "desc": "sunny"},
    }
    data = weather_db.get(city.lower())
    if not data:
        return {"error": f"No weather data for '{city}'"}

    temp = data["temp_c"]
    if units == "fahrenheit":
        temp = round(temp * 9 / 5 + 32, 1)
        unit_label = "°F"
    else:
        unit_label = "°C"

    return {
        "city": city,
        "temperature": f"{temp}{unit_label}",
        "humidity": f"{data['humidity']}%",
        "description": data["desc"]
    }

def calculate(expression: str) -> str:
    """Safe arithmetic evaluator using a restricted namespace."""
    safe_names = {
        "sqrt": math.sqrt, "abs": abs, "round": round,
        "pi": math.pi, "e": math.e
    }
    try:
        result = eval(expression, {"__builtins__": {}}, safe_names)
        return str(result)
    except Exception as exc:
        return f"Error evaluating expression: {exc}"

# ── Tool dispatcher ────────────────────────────────────────────────────────────

def execute_tool(name: str, inputs: dict) -> str:
    """Route a tool call to its implementation and serialize the result."""
    if name == "get_weather":
        result = get_weather(inputs["city"], inputs.get("units", "celsius"))
        return json.dumps(result)
    if name == "calculate":
        return calculate(inputs["expression"])
    return json.dumps({"error": f"Unknown tool: {name}"})

# ── Agent loop ─────────────────────────────────────────────────────────────────

def agent_with_tools(user_query: str) -> str:
    messages = [{"role": "user", "content": user_query}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )

        # Append assistant turn
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Done."

        # Execute all tool calls and collect results
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                raw_result = execute_tool(block.name, block.input)
                print(f"Tool: {block.name}  Input: {block.input}  Result: {raw_result}")
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": raw_result          # always a string
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

# Example
answer = agent_with_tools(
    "What's the weather like in Tokyo and London? "
    "Also, what is the square root of the sum of their temperatures in Celsius?"
)
print(answer)`;

const toolUseTypeScript = `import Anthropic from "@anthropic-ai/sdk";
import * as math from "mathjs"; // npm install mathjs

const client = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: "get_weather",
    description:
      "Retrieve current weather conditions for a city. " +
      "Returns temperature, humidity, and a short description.",
    input_schema: {
      type: "object" as const,
      properties: {
        city: { type: "string", description: "City name, e.g. 'Tokyo'" },
        units: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Temperature unit. Defaults to celsius.",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "calculate",
    description: "Evaluate a safe arithmetic expression and return the result.",
    input_schema: {
      type: "object" as const,
      properties: {
        expression: {
          type: "string",
          description: "Arithmetic expression, e.g. 'sqrt(144) + 2^8'",
        },
      },
      required: ["expression"],
    },
  },
];

type WeatherData = { city: string; temperature: string; humidity: string; description: string };

const weatherDb: Record<string, { temp_c: number; humidity: number; desc: string }> = {
  london: { temp_c: 12, humidity: 78, desc: "overcast clouds" },
  tokyo:  { temp_c: 24, humidity: 55, desc: "partly cloudy" },
  sydney: { temp_c: 21, humidity: 62, desc: "sunny" },
};

function getWeather(city: string, units = "celsius"): WeatherData | { error: string } {
  const data = weatherDb[city.toLowerCase()];
  if (!data) return { error: No weather data for '\${city}' };
  let temp = data.temp_c;
  let unitLabel = "°C";
  if (units === "fahrenheit") { temp = Math.round(temp * 9 / 5 + 32 * 10) / 10; unitLabel = "°F"; }
  return { city, temperature: \${temp}\${unitLabel}, humidity: \${data.humidity}%, description: data.desc };
}

function calculate(expression: string): string {
  try {
    return String(math.evaluate(expression));
  } catch (e) {
    return Error: \${(e as Error).message};
  }
}

function executeTool(name: string, inputs: Record<string, string>): string {
  if (name === "get_weather") return JSON.stringify(getWeather(inputs.city, inputs.units));
  if (name === "calculate") return calculate(inputs.expression);
  return JSON.stringify({ error: Unknown tool: \${name} });
}

async function agentWithTools(userQuery: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userQuery }];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      tools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      return textBlock && "text" in textBlock ? textBlock.text : "Done.";
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inputs = block.input as Record<string, string>;
        const result = executeTool(block.name, inputs);
        console.log(Tool: \${block.name}  Result: \${result});
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }
}

agentWithTools(
  "What's the weather in Tokyo and London? " +
  "Also compute the square root of the sum of their temperatures in Celsius."
).then(console.log);`;

export default function ToolUse() {
  return (
    <article className="prose-content">
      <h2>Tool Use &amp; Function Calling</h2>

      <p>
        A language model on its own can only read and write text. Tool use — also called function
        calling — is the mechanism that allows an agent to reach outside that boundary: retrieve
        live data, perform precise computation, modify state in external systems, and take actions
        with real-world consequences. Understanding exactly how tool invocation works, how results
        flow back into the reasoning loop, and how to design the tool layer for reliability is
        central to building effective agents.
      </p>

      <ConceptBlock
        term="Function Calling (Tool Use)"
        tag="Core Mechanism"
      >
        Function calling is a structured API capability that allows a language model to emit
        a typed, machine-readable request to invoke an external function rather than producing
        plain text. The model selects a function from a set of schemas defined by the developer,
        fills in the required parameters based on its current reasoning, and signals that the
        application layer should execute the call. The result is fed back into the conversation
        as an observation, completing one perceive-act-observe cycle.
      </ConceptBlock>

      <h2>Anatomy of a Tool Definition</h2>

      <p>
        Every tool exposed to the model has three required parts that the model reads before
        deciding whether and how to invoke it.
      </p>

      <h3>Name</h3>
      <p>
        The tool name is a short, unambiguous identifier. The model uses the name in its tool_use
        output to specify which tool it is calling. Names should be descriptive enough that the
        model can infer the tool's purpose even without reading the description: get_weather,
        search_database, send_email, run_python are all clear. Avoid generic names like
        tool_1 or helper that give the model no signal about purpose.
      </p>

      <h3>Description</h3>
      <p>
        The description is the model's guide for when and how to use the tool. It should explain
        what the tool does, what kind of input it expects, what it returns, and any important
        behavioral caveats — such as rate limits, side effects, or cases where the tool will fail.
        A good description is 1–3 sentences and reads like documentation written for an intelligent
        developer who needs to decide whether this tool is appropriate for their current subtask.
      </p>

      <h3>Input Schema</h3>
      <p>
        The input schema is a JSON Schema object that defines the parameters the tool accepts.
        It should specify each parameter's type, a clear description, any constraints (enum values,
        numeric ranges), and which parameters are required versus optional. The model uses the
        schema to fill in correct values and to understand when a parameter should be omitted.
        A well-designed schema dramatically reduces hallucinated or malformed tool inputs.
      </p>

      <h2>The Tool Call Lifecycle</h2>

      <p>
        Understanding the complete lifecycle of a tool call helps in building robust error handling
        and debugging failures.
      </p>

      <h3>Step 1: Schema Injection</h3>
      <p>
        Tool definitions are included in the API request alongside the messages. The model reads
        these definitions as part of its context — they are not hidden from its reasoning. This
        means the model can reason about which tools are available and what each can do before
        deciding to invoke any of them.
      </p>

      <h3>Step 2: Tool Selection and Parameter Filling</h3>
      <p>
        When the model decides to call a tool, it emits a tool_use content block in its response.
        This block contains the tool name, a unique tool_use_id, and the input object populated
        according to the schema. The model may emit multiple tool_use blocks in a single response
        when it determines that several tool calls can be made in parallel.
      </p>

      <h3>Step 3: Application-Layer Execution</h3>
      <p>
        The application code — not the model — actually executes the tool. This is a critical
        security boundary. The model only specifies what it wants done; the application decides
        whether to allow it, validates the inputs, executes the call, and catches errors. The
        model never runs arbitrary code directly.
      </p>

      <h3>Step 4: Result Serialization</h3>
      <p>
        Tool results must be serialized to a string before being returned to the model. JSON is
        the standard format for structured results. The result is wrapped in a tool_result content
        block that references the original tool_use_id, and this block is included in a user-turn
        message appended to the conversation history.
      </p>

      <h3>Step 5: Result Integration</h3>
      <p>
        On the next API call, the model reads the tool result as part of its updated context.
        The tool_use_id linkage allows it to correlate each result with the specific call that
        produced it, even when multiple tools were called in parallel. The model can now reason
        about what it learned from the observation and decide what to do next.
      </p>

      <BestPracticeBlock
        title="Always return string content from tools"
      >
        The tool_result content field must be a string. Serialize all structured data to JSON
        before returning it. Include error information in the returned string rather than raising
        exceptions that the agent loop cannot handle — the model can reason about and recover from
        a JSON error object, but it cannot recover from an unhandled exception that terminates the
        loop.
      </BestPracticeBlock>

      <h2>Error Handling in Tool Results</h2>

      <p>
        How you represent errors in tool results has a large impact on the agent's ability to
        recover. There are two approaches.
      </p>

      <h3>Descriptive String Errors</h3>
      <p>
        Return a clear, human-readable error message as the tool result content. For example:
        "Error: file 'config.yaml' not found in /etc or /home/user. Check that the filename
        is correct and the path exists." The model can read this, understand what went wrong,
        and try a different approach.
      </p>

      <h3>Structured Error Objects</h3>
      <p>
        Return a JSON object with an "error" field and optionally a "code" field for programmatic
        handling. For example: <code>&lbrace;"error": "rate_limit_exceeded", "retry_after": 30&rbrace;</code>. This allows
        the model to reason about the specific error type and potentially handle it differently
        — for instance, noting that it should wait before retrying.
      </p>

      <PatternBlock
        name="Graceful Tool Error Handling"
        category="Reliability"
        whenToUse="Any tool that can fail — network calls, file I/O, database queries. Wrap tool implementations in try/except blocks and always return a descriptive error string rather than propagating exceptions up to the agent loop."
      >
        Catch all exceptions within the tool executor and return them as informative string
        results. The model can reason about tool failures and self-correct; an unhandled exception
        that crashes the loop cannot be recovered from without restarting the entire task.
      </PatternBlock>

      <h2>Parallel Tool Execution</h2>

      <p>
        When the model emits multiple tool_use blocks in a single response, those calls are
        independent — their results do not depend on each other. Execute them concurrently and
        return all results in a single user-turn message with multiple tool_result blocks. This
        is both semantically correct (the model expects them together) and more efficient (parallel
        network calls reduce wall-clock latency significantly).
      </p>

      <NoteBlock
        type="tip"
        title="Detect and exploit parallel tool calls"
      >
        After extracting tool_use blocks from a response, check whether there are multiple. If
        so, use concurrent execution — asyncio.gather in Python, Promise.all in TypeScript — rather
        than a sequential loop. The time savings compound quickly: a task that makes 3 independent
        API calls with 500ms each takes 500ms in parallel vs. 1500ms serially.
      </NoteBlock>

      <h2>Full Example: Weather and Calculation Agent</h2>

      <p>
        The example below builds an agent with two tools: a simulated weather service and an
        arithmetic evaluator. It demonstrates the complete tool lifecycle: schema definition,
        tool dispatch, result serialization, and feeding results back into the reasoning loop.
      </p>

      <SDKExample
        title="Tool Use: Weather Agent with Parallel Tool Calls"
        tabs={{
          python: toolUsePython,
          typescript: toolUseTypeScript,
        }}
      />

      <WarningBlock
        title="Validate all model-supplied tool inputs"
      >
        Never trust inputs provided by the model without validation. The model may occasionally
        produce inputs that do not match the schema — wrong types, unexpected values, or missing
        required fields. Validate against the schema in your tool dispatcher before passing inputs
        to the implementation. This is especially important for tools with side effects like
        database writes, emails, or API calls that cannot be undone.
      </WarningBlock>

      <h2>Tool Result Quality Principles</h2>

      <p>
        The format and content of tool results directly affect how well the agent reasons. Several
        principles apply across all tools.
      </p>

      <h3>Return Structured Data, Not Prose</h3>
      <p>
        JSON objects are easier for the model to parse and reason about than natural-language
        sentences. Return <code>&lbrace;"temperature": "24°C", "humidity": "55%"&rbrace;</code> rather than "The temperature
        in Tokyo is 24 degrees Celsius with 55% humidity." The model can handle both, but
        structured data reduces the chance of misparse.
      </p>

      <h3>Include Relevant Metadata</h3>
      <p>
        Include any information that might affect how the model should interpret or act on the
        result: timestamps for data freshness, units for numeric values, source identifiers for
        attribution, and status codes for distinguishing success from partial results.
      </p>

      <h3>Keep Results Concise</h3>
      <p>
        Every token in a tool result consumes context window space and is paid for on the next
        API call. Return only the information the model needs. If a search API returns 10,000
        words of results but only the top 3 snippets are relevant, extract and return just those
        snippets.
      </p>
    </article>
  );
}
