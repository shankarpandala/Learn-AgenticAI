import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'

export default function SingleAgentPatterns() {
  return (
    <article className="prose-content">
      <h2>Common Single-Agent Patterns</h2>

      <p>
        Within the broad category of single-agent systems, several distinct reasoning patterns
        have emerged as reliable building blocks. Each pattern structures how the agent approaches
        problems, generates plans, and recovers from errors. Understanding these patterns enables
        you to choose the right reasoning structure for each task, implement it reliably, and
        diagnose failures when behavior deviates from expectations.
      </p>

      <h2>ReAct: Reasoning and Acting</h2>

      <ConceptBlock term="ReAct Pattern">
        ReAct (Reasoning and Acting) interleaves explicit reasoning steps with tool actions.
        Before each action, the agent generates a "Thought" explaining its reasoning and what
        it plans to do. After the action, it generates an "Observation" noting what it learned.
        This explicit reasoning trace improves performance on complex tasks and makes the
        agent's decision process transparent and debuggable.
      </ConceptBlock>

      <p>
        The ReAct pattern was originally formalized for prompting models to produce thoughts
        before actions. Modern frontier models like Claude produce this reasoning naturally
        when given tools — the reasoning text that appears before tool calls in a response
        is effectively the "Thought" step, and the tool result is the "Observation."
        Structured ReAct prompting can reinforce this behavior on models that do not do
        it naturally.
      </p>

      <SDKExample
        title="ReAct Pattern with Explicit Thought-Action-Observation Structure"
        tabs={{
          python: `from anthropic import Anthropic
import json

client = Anthropic()

REACT_SYSTEM_PROMPT = """You are a research agent that uses the ReAct (Reasoning + Acting) framework.

For each step, structure your response as:
Thought: [Your reasoning about what to do next and why]
Action: [The tool you will call — this is done via the tool_use mechanism]

After each tool result, you will see:
Observation: [The tool's response]

Continue until you have enough information to provide a complete answer.
Then produce your final response as a clear, direct answer without Thought/Action prefixes."""

TOOLS = [
    {
        "name": "search",
        "description": "Search for information on a topic. Returns relevant text passages.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "lookup",
        "description": "Look up a specific entity (person, company, concept) for factual details.",
        "input_schema": {
            "type": "object",
            "properties": {
                "entity": {"type": "string", "description": "The entity to look up"}
            },
            "required": ["entity"]
        }
    }
]

KNOWLEDGE_BASE = {
    "transformer architecture": "Transformers use self-attention mechanisms. Introduced by Vaswani et al. in 'Attention Is All You Need' (2017). Key components: multi-head attention, positional encoding, feed-forward layers.",
    "BERT": "Bidirectional Encoder Representations from Transformers. Developed by Google in 2018. Pre-trained on masked language modeling and next sentence prediction.",
    "GPT": "Generative Pre-trained Transformer. Developed by OpenAI. Uses causal (left-to-right) language modeling. GPT-1 (2018), GPT-2 (2019), GPT-3 (2020), GPT-4 (2023).",
}

def fake_search(query: str) -> str:
    for key, value in KNOWLEDGE_BASE.items():
        if any(word.lower() in key for word in query.lower().split()):
            return json.dumps({"results": [{"passage": value, "relevance": 0.95}]})
    return json.dumps({"results": [], "message": "No results found. Try a different query."})

def fake_lookup(entity: str) -> str:
    entity_lower = entity.lower()
    for key, value in KNOWLEDGE_BASE.items():
        if entity_lower in key:
            return json.dumps({"entity": entity, "summary": value})
    return json.dumps({"entity": entity, "summary": "Entity not found in knowledge base."})

def dispatch(name: str, inputs: dict) -> str:
    if name == "search": return fake_search(inputs["query"])
    if name == "lookup": return fake_lookup(inputs["entity"])
    return json.dumps({"error": f"Unknown tool: {name}"})

def run_react_agent(question: str, max_steps: int = 8) -> str:
    messages = [{"role": "user", "content": question}]
    for _ in range(max_steps):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=REACT_SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason == "end_turn":
            return next((b.text for b in response.content if hasattr(b, "text")), "Done.")
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = dispatch(block.name, block.input)
                # Label tool results as "Observation" to reinforce the ReAct structure
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": f"Observation: {result}",
                })
        if tool_results:
            messages.append({"role": "user", "content": tool_results})
    return "Max steps reached."

answer = run_react_agent("How does BERT differ from GPT in terms of training approach?")
print(answer)`,
          typescript: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const REACT_SYSTEM_PROMPT = You are a research agent using the ReAct framework.
Structure responses as: Thought: [reasoning] then use the appropriate tool.
After tool results, continue reasoning until you can give a direct final answer.;

const tools: Anthropic.Tool[] = [
  {
    name: "search",
    description: "Search for information on a topic.",
    input_schema: { type: "object" as const, properties: { query: { type: "string", description: "Search query" } }, required: ["query"] },
  },
  {
    name: "lookup",
    description: "Look up a specific entity for factual details.",
    input_schema: { type: "object" as const, properties: { entity: { type: "string", description: "Entity to look up" } }, required: ["entity"] },
  },
];

const KB: Record<string, string> = {
  "transformer architecture": "Transformers use self-attention. Introduced by Vaswani et al. 2017.",
  bert: "Bidirectional Encoder Representations from Transformers. Google 2018. Masked language modeling.",
  gpt: "Generative Pre-trained Transformer. OpenAI. Causal language modeling. GPT-1 through GPT-4.",
};

function fakeSearch(query: string): string {
  const key = Object.keys(KB).find((k) => query.toLowerCase().includes(k));
  return key ? JSON.stringify({ results: [{ passage: KB[key], relevance: 0.95 }] }) : JSON.stringify({ results: [] });
}

function fakeLookup(entity: string): string {
  const key = Object.keys(KB).find((k) => entity.toLowerCase().includes(k));
  return key ? JSON.stringify({ entity, summary: KB[key] }) : JSON.stringify({ entity, summary: "Not found." });
}

async function runReactAgent(question: string, maxSteps = 8): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: question }];
  for (let i = 0; i < maxSteps; i++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6", max_tokens: 1024, system: REACT_SYSTEM_PROMPT, tools, messages,
    });
    messages.push({ role: "assistant", content: response.content });
    if (response.stop_reason === "end_turn") {
      const text = response.content.find((b) => b.type === "text");
      return text && "text" in text ? text.text : "Done.";
    }
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const inp = block.input as { query?: string; entity?: string };
        const result = block.name === "search" ? fakeSearch(inp.query!) : fakeLookup(inp.entity!);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: Observation: \${result} });
      }
    }
    if (toolResults.length > 0) messages.push({ role: "user", content: toolResults });
  }
  return "Max steps reached.";
}

runReactAgent("How does BERT differ from GPT in terms of training approach?").then(console.log);`
        }}
      />

      <h2>Plan-and-Execute</h2>

      <ConceptBlock term="Plan-and-Execute Pattern">
        Plan-and-Execute separates the planning phase from the execution phase. In the planning
        step, the agent generates a complete, explicit plan of action — a numbered list of steps
        to accomplish the goal. In the execution phase, it works through each step in order,
        using tools and updating the plan if new information requires adjustment. This makes
        long-horizon reasoning more reliable by forcing upfront decomposition of complex tasks.
      </ConceptBlock>

      <p>
        The key advantage of Plan-and-Execute over pure ReAct is that explicit planning reduces
        goal drift on long tasks. When an agent generates a plan before acting, it has a stable
        reference to check its progress against. A pure ReAct agent can sometimes lose track of
        the original goal after many tool calls. The tradeoff is that the initial plan may be
        suboptimal or become outdated as the agent learns more during execution.
      </p>

      <h2>Reflexion</h2>

      <ConceptBlock term="Reflexion Pattern">
        Reflexion is a pattern where the agent explicitly reflects on its own performance
        after attempting a task. If the task fails or produces a poor result, the agent
        generates a verbal critique of what went wrong and what it should do differently,
        then retries the task using this self-critique as additional context. This enables
        the agent to improve its approach across multiple attempts without changing model weights.
      </ConceptBlock>

      <p>
        Reflexion is particularly valuable for tasks with verifiable outcomes — running code
        that either passes tests or doesn't, answering factual questions that can be checked
        against ground truth. When the outcome can be objectively evaluated, the reflection
        is grounded in concrete feedback rather than speculation. For subjective tasks,
        the reflection is less reliable because the agent is evaluating its own output without
        external ground truth.
      </p>

      <h2>LATS: Language Agent Tree Search</h2>

      <p>
        LATS (Language Agent Tree Search) applies Monte Carlo Tree Search concepts to language
        agents. Instead of committing to a single trajectory, LATS explores multiple possible
        action sequences from each state, uses a value function (often LLM-based) to score
        partial trajectories, and focuses exploration on the most promising branches. This
        dramatically improves performance on tasks where the correct path is not obvious upfront
        but requires exploration and backtracking.
      </p>

      <p>
        LATS is expensive — it calls the LLM many more times than a linear agent — but it
        achieves state-of-the-art performance on tasks like complex coding challenges, mathematical
        reasoning, and multi-step planning problems. It is best suited for tasks where correctness
        matters more than cost, where there is a clear scoring function for intermediate states,
        and where the search space is not so large that even tree search cannot find the solution.
      </p>

      <PatternBlock
        name="Choose the Pattern to Match the Task Structure"
        category="Single-Agent Design"
        description="Use ReAct for exploratory tasks where you do not know the steps in advance. Use Plan-and-Execute for tasks with a known structure that can be decomposed upfront. Use Reflexion when you have a verifiable success criterion and want the agent to improve through iteration. Use LATS for complex problems where the optimal path requires exploration and backtracking."
        when={[
          "ReAct: open-ended research, debugging, tasks with unknown step count",
          "Plan-and-Execute: data pipelines, report generation, tasks with known structure",
          "Reflexion: coding, theorem proving, tasks with checkable success conditions",
          "LATS: competitions, highly complex single tasks where quality trumps cost"
        ]}
        avoid={[
          "LATS for latency-sensitive applications — it makes many parallel LLM calls",
          "Plan-and-Execute when the task is truly open-ended and plans will be rapidly invalidated",
          "Reflexion without a reliable evaluation mechanism — it relies on accurate self-assessment"
        ]}
      />

      <BestPracticeBlock title="Make the reasoning pattern explicit in the system prompt">
        Frontier models can follow any of these patterns, but they perform more reliably when
        the system prompt explicitly instructs them to use a specific pattern. Tell the model
        to generate a step-by-step plan before executing, or to produce a reflection after
        each failed attempt. Explicit instructions reduce variance and make the agent's
        behavior more predictable across different task inputs.
      </BestPracticeBlock>

      <NoteBlock title="Patterns compose and can be mixed">
        These patterns are not mutually exclusive. A Plan-and-Execute agent can use Reflexion
        when a step fails. A ReAct agent can switch to explicit planning mid-trajectory when
        it realizes the task is more complex than initially appeared. The labels are useful
        for communication and design, but the actual agent behavior can mix elements of
        multiple patterns as the situation demands.
      </NoteBlock>
    </article>
  )
}
