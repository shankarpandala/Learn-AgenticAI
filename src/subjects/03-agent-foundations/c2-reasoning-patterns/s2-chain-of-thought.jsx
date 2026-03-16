import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import PatternBlock from '../../../components/content/PatternBlock.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const cotPython = `from anthropic import Anthropic

client = Anthropic()

SYSTEM_PROMPT = """You are a careful analytical assistant. When given a problem,
think through it step by step before providing your final answer.

Structure your response as:
1. Break down what the problem is asking
2. Identify the relevant facts or constraints
3. Work through the reasoning step by step
4. State your conclusion clearly

Always show your work — do not skip steps even if they seem obvious."""

def chain_of_thought(question: str) -> dict:
    """
    Elicit chain-of-thought reasoning from Claude.
    Returns both the full reasoning trace and the final answer.
    """
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": question}]
    )

    full_text = response.content[0].text

    # In production you might parse out the reasoning vs answer sections
    return {
        "reasoning_trace": full_text,
        "input_tokens": response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens
    }

# ── Extended example: CoT before a tool call ──────────────────────────────────

import json

tools = [
    {
        "name": "execute_sql",
        "description": (
            "Execute a read-only SQL query on the analytics database and "
            "return results as a JSON array of row objects."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Valid SQL SELECT statement"},
                "reasoning": {
                    "type": "string",
                    "description": (
                        "Explain why this query answers the user's question "
                        "and confirm it is read-only and safe to run."
                    )
                }
            },
            "required": ["query", "reasoning"]
        }
    }
]

def simulated_sql(query: str) -> list:
    """Simulate an analytics database."""
    if "revenue" in query.lower():
        return [
            {"month": "Jan", "revenue": 142000},
            {"month": "Feb", "revenue": 158000},
            {"month": "Mar", "revenue": 171000},
        ]
    return [{"result": "no data"}]

def cot_before_tool(user_request: str) -> str:
    """
    Agent that requires the model to write its reasoning into a 'reasoning'
    field before executing any tool — a lightweight CoT enforcement pattern.
    """
    messages = [{"role": "user", "content": user_request}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            tools=tools,
            messages=messages
        )

        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Done."

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                # Log the reasoning the model provided
                reasoning = block.input.get("reasoning", "(no reasoning provided)")
                print(f"Model reasoning: {reasoning}")
                print(f"Executing: {block.input['query']}")

                rows = simulated_sql(block.input["query"])
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(rows)
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

# Basic CoT
result = chain_of_thought(
    "A train leaves Station A at 9:00 AM traveling at 80 km/h. "
    "Another train leaves Station B (320 km away) at 10:00 AM traveling at 100 km/h toward Station A. "
    "At what time do they meet?"
)
print(result["reasoning_trace"])

# CoT embedded in tool schema
answer = cot_before_tool("Show me monthly revenue for Q1 and calculate the average.")
print(answer)`;

const cotTypeScript = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = You are a careful analytical assistant. When given a problem,
think through it step by step before providing your final answer.

Structure your response as:
1. Break down what the problem is asking
2. Identify the relevant facts or constraints
3. Work through the reasoning step by step
4. State your conclusion clearly

Always show your work — do not skip steps even if they seem obvious.;

async function chainOfThought(question: string): Promise<{
  reasoningTrace: string;
  inputTokens: number;
  outputTokens: number;
}> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: question }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const fullText = textBlock && "text" in textBlock ? textBlock.text : "";

  return {
    reasoningTrace: fullText,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

// ── CoT enforced through tool schema ─────────────────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: "execute_sql",
    description:
      "Execute a read-only SQL query on the analytics database. " +
      "Returns a JSON array of row objects.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Valid SQL SELECT statement" },
        reasoning: {
          type: "string",
          description:
            "Explain why this query answers the question and confirm it is read-only.",
        },
      },
      required: ["query", "reasoning"],
    },
  },
];

function simulatedSql(query: string): object[] {
  if (query.toLowerCase().includes("revenue")) {
    return [
      { month: "Jan", revenue: 142000 },
      { month: "Feb", revenue: 158000 },
      { month: "Mar", revenue: 171000 },
    ];
  }
  return [{ result: "no data" }];
}

async function cotBeforeTool(userRequest: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userRequest },
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
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
        const inputs = block.input as { query: string; reasoning: string };
        console.log(Model reasoning: \${inputs.reasoning});
        console.log(Executing: \${inputs.query});
        const rows = simulatedSql(inputs.query);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(rows),
        });
      }
    }

    if (toolResults.length > 0) {
      messages.push({ role: "user", content: toolResults });
    }
  }
}

// Basic CoT
chainOfThought(
  "A train leaves Station A at 9:00 AM at 80 km/h. " +
    "Another leaves Station B (320 km away) at 10:00 AM at 100 km/h toward Station A. " +
    "When do they meet?"
).then((r) => console.log(r.reasoningTrace));

// CoT in tool schema
cotBeforeTool(
  "Show me monthly revenue for Q1 and calculate the average."
).then(console.log);`;

export default function ChainOfThought() {
  return (
    <article className="prose-content">
      <h2>Chain-of-Thought Reasoning</h2>

      <p>
        Language models are trained to predict the next token given the preceding context. When
        a model is asked a complex question and told to answer immediately, it must compress all
        intermediate reasoning into a single prediction step — a process known to reduce accuracy
        on tasks that require multiple logical or arithmetic steps. Chain-of-thought prompting
        addresses this by encouraging the model to externalize its intermediate reasoning as text
        before producing a final answer.
      </p>

      <ConceptBlock
        term="Chain-of-Thought (CoT)"
        tag="Reasoning Technique"
      >
        Chain-of-thought prompting is a technique that elicits step-by-step reasoning from a
        language model before it commits to a final answer. By instructing the model to "think
        aloud" — writing out intermediate reasoning steps as natural language — CoT enables the
        model to solve problems that would be incorrect if answered immediately. The visible
        reasoning trace also makes failures diagnosable and outputs auditable.
      </ConceptBlock>

      <h2>Why CoT Improves Accuracy</h2>

      <p>
        Three complementary mechanisms explain why externalizing reasoning improves model
        performance on complex tasks.
      </p>

      <h3>Decomposition</h3>
      <p>
        Writing out "step 1: identify the constraint" forces the model to break a complex problem
        into smaller sub-problems, each of which is easier to solve independently. The result of
        each sub-problem then becomes context for the next, rather than requiring the model to
        hold all intermediate values implicitly in its activation state.
      </p>

      <h3>Error Detection</h3>
      <p>
        Intermediate steps are individually verifiable. When the model writes "speed = distance /
        time = 320 / 80 = 4 hours" as an explicit step, it — and any reviewer — can check that
        arithmetic directly. If the value is wrong, subsequent reasoning built on it is also
        wrong and visibly so. Without CoT, an error might be invisible until the final answer
        is checked.
      </p>

      <h3>Attention Guidance</h3>
      <p>
        Generating the reasoning text shifts the model's attention distribution. When the model
        writes "the key constraint is that the second train departs one hour later," it is
        creating a token that receives attention from all subsequent generation steps. This keeps
        important facts in effective context longer than they would be if they appeared only in
        the original question.
      </p>

      <h2>Prompting Strategies</h2>

      <h3>Zero-Shot CoT</h3>
      <p>
        The simplest approach: append "Think step by step" or "Let's reason through this carefully"
        to the user's question. This works surprisingly well for frontier models. Claude will
        typically produce structured reasoning even without detailed instructions, because
        step-by-step analysis is a well-represented pattern in its training data.
      </p>

      <h3>Structured System Prompt</h3>
      <p>
        A more controlled approach is to define the reasoning structure in the system prompt:
        instruct the model to first identify the question type, then list relevant facts, then
        work through each step, then state a conclusion. This produces more consistent output
        format across many different questions and is easier to parse programmatically.
      </p>

      <h3>Few-Shot CoT</h3>
      <p>
        Providing one or more worked examples in the prompt demonstrates the desired reasoning
        style concretely. Few-shot examples are especially useful when the task has a distinctive
        structure — a domain-specific calculation, a legal analysis framework, a particular
        debugging methodology — that is difficult to specify in prose instructions alone.
      </p>

      <h3>CoT Embedded in Tool Schemas</h3>
      <p>
        For agents, a powerful pattern is to add a "reasoning" or "plan" field to tool schemas
        and mark it required. The model is forced to write its reasoning into this field before
        any tool invocation. This serves three purposes: it elicits CoT naturally within the
        existing tool-use flow; it makes the reasoning observable and loggable; and it gives
        downstream reviewers a record of why each tool was invoked.
      </p>

      <PatternBlock
        name="Reasoning Field in Tool Schema"
        category="Reasoning"
        whenToUse="Any agent that invokes consequential tools — database writes, external API calls, code execution, or financial transactions. Requiring the model to articulate its reasoning before acting reduces impulsive or incorrect tool use and provides an audit trail."
      >
        Add a required "reasoning" string field to tool schemas. The model must explain why
        it is invoking the tool and what it expects the result to accomplish before the call
        is executed. This is CoT applied directly to the act phase of the agent loop.
      </PatternBlock>

      <h2>Extended Thinking</h2>

      <p>
        Claude supports an "extended thinking" mode in which the model generates a private internal
        reasoning trace before producing its visible response. This trace is not shown to users
        by default but is available to developers for inspection. Extended thinking is especially
        effective for complex reasoning tasks — mathematics, multi-step logic, and long-horizon
        planning — where the model benefits from substantial scratch-pad space that does not inflate
        the visible response length.
      </p>

      <NoteBlock
        type="tip"
        title="Extended thinking vs. explicit CoT"
      >
        Extended thinking produces reasoning in a separate, invisible block before the response.
        Explicit CoT (via system prompt) produces reasoning as part of the visible response.
        Use extended thinking when you want the benefits of CoT without including the reasoning
        in the output the user sees. Use explicit CoT when you want to surface the reasoning
        to users, log it for audit purposes, or parse it programmatically.
      </NoteBlock>

      <h2>Parsing CoT Outputs</h2>

      <p>
        When CoT produces structured output, you may want to separate the reasoning trace from
        the final answer for downstream processing. Common approaches include using XML tags
        (instructing the model to wrap its reasoning in &lt;reasoning&gt; tags and its answer
        in &lt;answer&gt; tags) or defining a JSON output schema with separate "thinking" and
        "answer" fields. Either approach allows you to store the reasoning trace for audit while
        delivering only the final answer to end users.
      </p>

      <BestPracticeBlock
        title="Log reasoning traces in production"
      >
        Even if end users never see the chain-of-thought, always log it in production systems.
        Reasoning traces are your primary diagnostic tool when an agent produces a wrong answer.
        They tell you exactly where the reasoning diverged — an incorrect assumption, a
        misread tool result, a logical error — in a way that the final answer alone never can.
      </BestPracticeBlock>

      <h2>Implementation Examples</h2>

      <p>
        The following example demonstrates two CoT patterns: a straightforward step-by-step
        system prompt for analytical questions, and a tool schema with a required reasoning
        field that enforces CoT before SQL execution.
      </p>

      <SDKExample
        title="Chain-of-Thought: System Prompt and Tool Schema Patterns"
        tabs={{
          python: cotPython,
          typescript: cotTypeScript,
        }}
      />

      <h2>CoT Limitations and Failure Modes</h2>

      <h3>Unfaithful Reasoning</h3>
      <p>
        The reasoning trace a model produces may not accurately reflect how it actually arrived
        at its answer. Research has shown that models sometimes confabulate plausible-sounding
        reasoning for answers they reached through other mechanisms. Treat CoT traces as useful
        diagnostic signals, not ground truth about the model's internal computation.
      </p>

      <h3>Verbose Outputs</h3>
      <p>
        On simple tasks, chain-of-thought adds tokens without improving accuracy. A question
        like "what is the capital of France?" does not benefit from step-by-step reasoning. Use
        CoT selectively — it is most valuable for tasks with multiple steps, calculations, or
        reasoning under uncertainty.
      </p>

      <h3>Overthinking</h3>
      <p>
        Occasionally a model will talk itself into an incorrect answer through an overly
        elaborate reasoning chain that introduces incorrect steps. If CoT is degrading accuracy
        on a class of tasks, consider switching to a more constrained output format or using
        extended thinking (which may self-correct) instead of explicit verbose CoT.
      </p>

      <NoteBlock
        type="note"
        title="CoT is the foundation, not the ceiling"
      >
        Chain-of-thought is the simplest form of structured reasoning. More advanced patterns —
        ReAct, tree-of-thought, self-consistency, and deliberate planning — all build on the
        same core idea: making reasoning explicit improves both accuracy and debuggability.
        Master CoT before reaching for these more complex techniques.
      </NoteBlock>
    </article>
  );
}
