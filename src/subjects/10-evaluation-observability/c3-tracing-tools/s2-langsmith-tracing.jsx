import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function LangSmithTracing() {
  return (
    <article className="prose-content">
      <h2>LangSmith Tracing</h2>
      <p>
        LangSmith is LangChain's observability and evaluation platform, purpose-built for
        LLM applications and agents. It captures full execution traces — including every LLM
        call, tool invocation, and intermediate state — and provides a UI for replaying,
        annotating, and evaluating runs. LangSmith integrates natively with LangChain and
        LangGraph but can also be used with any Python application via its tracing SDK.
      </p>

      <ConceptBlock term="LangSmith Run">
        <p>
          In LangSmith, a "run" is the fundamental unit of tracing. Runs are hierarchical:
          an agent run contains child runs for each chain step, LLM call, and tool execution.
          Every run captures inputs, outputs, latency, token usage, and error details. Runs can
          be tagged, annotated with human feedback, added to datasets, and used as eval test
          cases. The LangSmith UI provides a visual trace tree and prompt diff viewer.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="LangSmith — Trace, Annotate, Evaluate Loop"
        width={700}
        height={260}
        nodes={[
          { id: 'agent', label: 'LangGraph\nAgent', type: 'agent', x: 100, y: 130 },
          { id: 'sdk', label: 'LangSmith\nSDK', type: 'tool', x: 280, y: 130 },
          { id: 'platform', label: 'LangSmith\nPlatform', type: 'store', x: 460, y: 130 },
          { id: 'human', label: 'Human\nAnnotator', type: 'external', x: 620, y: 70 },
          { id: 'eval', label: 'Eval\nDataset', type: 'store', x: 620, y: 190 },
        ]}
        edges={[
          { from: 'agent', to: 'sdk', label: 'auto-traced' },
          { from: 'sdk', to: 'platform', label: 'runs' },
          { from: 'platform', to: 'human', label: 'review' },
          { from: 'human', to: 'platform', label: 'annotations' },
          { from: 'platform', to: 'eval', label: 'add to dataset' },
        ]}
      />

      <h2>Automatic Tracing with LangChain and LangGraph</h2>
      <p>
        When you set <code>LANGCHAIN_TRACING_V2=true</code> and <code>LANGCHAIN_API_KEY</code>,
        all LangChain and LangGraph operations are automatically traced to LangSmith without any
        code changes. This zero-instrumentation path makes LangSmith the easiest way to get
        immediate visibility into LangGraph agent runs.
      </p>

      <SDKExample
        title="LangSmith — Tracing, Annotation, and Evaluation"
        tabs={{
          python: `import os
from langsmith import Client, traceable
from langsmith.evaluation import evaluate, LangChainStringEvaluator
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.tools import tool

# ---- Setup ----
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-api-key"
os.environ["LANGCHAIN_PROJECT"] = "research-agent-prod"  # Project name in LangSmith

ls_client = Client()

# ---- A LangGraph Agent (auto-traced) ----

@tool
def web_search(query: str) -> str:
    """Search the web for information."""
    # Real implementation
    return f"Search results for: {query}"

llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
llm_with_tools = llm.bind_tools([web_search])

def call_model(state: MessagesState):
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def should_continue(state: MessagesState) -> str:
    last = state["messages"][-1]
    return "tools" if last.tool_calls else END

graph = StateGraph(MessagesState)
graph.add_node("agent", call_model)
graph.add_node("tools", ToolNode([web_search]))
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue, ["tools", END])
graph.add_edge("tools", "agent")
agent = graph.compile()

# All runs are automatically sent to LangSmith — no extra code needed.
result = agent.invoke({"messages": [("user", "Find recent AI safety papers")]})

# ---- Manual Tracing with @traceable ----

@traceable(
    run_type="chain",
    name="custom-research-pipeline",
    tags=["research", "production"],
    metadata={"pipeline_version": "2.1"},
)
async def research_pipeline(topic: str, depth: str = "medium") -> dict:
    """A custom pipeline traced to LangSmith."""
    # Step 1: Generate search queries
    search_response = await llm.ainvoke(
        f"Generate 3 search queries for researching: {topic}"
    )
    queries = search_response.content.split("\\n")[:3]

    # Step 2: Search (each call also creates a child run)
    results = []
    for query in queries:
        result = web_search.invoke(query)
        results.append(result)

    # Step 3: Synthesize
    synthesis = await llm.ainvoke(
        f"Synthesize these search results into a {depth} summary:\\n" +
        "\\n".join(results)
    )
    return {"topic": topic, "summary": synthesis.content, "sources": queries}

# ---- Adding Runs to Datasets ----

def add_run_to_dataset(run_id: str, dataset_name: str) -> None:
    """Flag a production run as an eval example."""
    # Create or get dataset
    datasets = list(ls_client.list_datasets(dataset_name=dataset_name))
    if datasets:
        dataset = datasets[0]
    else:
        dataset = ls_client.create_dataset(dataset_name=dataset_name)

    # Add the run as an example
    ls_client.create_examples(
        inputs=[{"topic": "AI safety"}],  # from the run's input
        outputs=[{"summary": "..."}],      # from the run's output
        dataset_id=dataset.id,
    )

# ---- LangSmith Evaluation ----

def run_evaluation(dataset_name: str) -> dict:
    """Run an evaluation on a LangSmith dataset."""

    def predict(inputs: dict) -> dict:
        """Your agent function for evaluation."""
        result = agent.invoke({
            "messages": [("user", inputs["question"])]
        })
        return {"answer": result["messages"][-1].content}

    # Built-in evaluators
    evaluators = [
        LangChainStringEvaluator("criteria", config={
            "criteria": {
                "helpfulness": "Is the response helpful and informative?",
                "accuracy": "Are the facts in the response accurate?",
            }
        }),
    ]

    eval_results = evaluate(
        predict,
        data=dataset_name,
        evaluators=evaluators,
        experiment_prefix="research-agent-v2",
        metadata={"model": "claude-3-5-sonnet-20241022"},
    )
    return eval_results

# ---- Human Annotation API ----

def submit_human_feedback(run_id: str, score: int, comment: str) -> None:
    """Submit human evaluation feedback to a LangSmith run."""
    ls_client.create_feedback(
        run_id=run_id,
        key="helpfulness",
        score=score,         # 0 (bad) or 1 (good)
        comment=comment,
    )

# ---- Filtering Production Runs ----

def get_failed_runs(project_name: str, limit: int = 50) -> list:
    """Retrieve recent failed runs for diagnosis."""
    runs = ls_client.list_runs(
        project_name=project_name,
        error=True,
        limit=limit,
        order="desc",
    )
    return list(runs)

def get_slow_runs(project_name: str, latency_threshold_ms: int = 10000) -> list:
    """Retrieve runs that exceeded a latency threshold."""
    runs = ls_client.list_runs(
        project_name=project_name,
        filter=f'and(gt(latency, {latency_threshold_ms / 1000}), eq(is_root, true))',
        limit=100,
    )
    return list(runs)`,
          typescript: `import { Client, traceable } from "langsmith";
import { evaluate } from "langsmith/evaluation";
import { ChatAnthropic } from "@langchain/anthropic";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// ---- Setup ----
process.env.LANGCHAIN_TRACING_V2 = "true";
process.env.LANGCHAIN_API_KEY = "your-langsmith-api-key";
process.env.LANGCHAIN_PROJECT = "research-agent-prod";

const lsClient = new Client();

// ---- A LangGraph Agent (auto-traced) ----

const webSearch = tool(
  async ({ query }: { query: string }) => {
    return Search results for: \${query};
  },
  {
    name: "web_search",
    description: "Search the web for information",
    schema: z.object({ query: z.string() }),
  }
);

const llm = new ChatAnthropic({ model: "claude-3-5-sonnet-20241022" });
const llmWithTools = llm.bindTools([webSearch]);

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", async (state) => ({
    messages: [await llmWithTools.invoke(state.messages)],
  }))
  .addNode("tools", new ToolNode([webSearch]))
  .addEdge(START, "agent")
  .addConditionalEdges("agent", (state) => {
    const last = state.messages[state.messages.length - 1];
    return "tool_calls" in last && last.tool_calls?.length ? "tools" : END;
  })
  .addEdge("tools", "agent");

const agent = graph.compile();
// All runs are automatically sent to LangSmith.

// ---- Manual Tracing with traceable ----

const researchPipeline = traceable(
  async (topic: string, depth = "medium") => {
    const searchResponse = await llm.invoke(
      Generate 3 search queries for researching: \${topic}
    );
    const queries = searchResponse.content.toString().split("\\n").slice(0, 3);

    const results = await Promise.all(
      queries.map((q) => webSearch.invoke({ query: q }))
    );

    const synthesis = await llm.invoke(
      Synthesize these results into a \${depth} summary:\\n\${results.join("\\n")}
    );
    return { topic, summary: synthesis.content, sources: queries };
  },
  {
    name: "custom-research-pipeline",
    run_type: "chain",
    tags: ["research", "production"],
    metadata: { pipeline_version: "2.1" },
  }
);

// ---- LangSmith Evaluation ----

async function runEvaluation(datasetName: string) {
  const predict = async (inputs: Record<string, string>) => {
    const result = await agent.invoke({
      messages: [{ role: "user", content: inputs.question }],
    });
    return { answer: result.messages[result.messages.length - 1].content };
  };

  return evaluate(predict, {
    data: datasetName,
    evaluators: [
      async ({ inputs, outputs, referenceOutputs }) => ({
        key: "correctness",
        score:
          outputs?.answer && referenceOutputs?.answer
            ? outputs.answer.includes(referenceOutputs.answer)
              ? 1
              : 0
            : 0,
      }),
    ],
    experimentPrefix: "research-agent-v2",
    metadata: { model: "claude-3-5-sonnet-20241022" },
  });
}

// ---- Human Annotation ----

async function submitFeedback(
  runId: string,
  score: number,
  comment: string
): Promise<void> {
  await lsClient.createFeedback(runId, "helpfulness", {
    score,
    comment,
  });
}`,
        }}
      />

      <PatternBlock
        name="Dataset-Driven Development with LangSmith"
        category="Evaluation Workflow"
        whenToUse="When iterating on prompts or model changes and you want to compare new vs. old performance on a curated set of representative examples."
      >
        <p>
          Add representative production runs to a LangSmith dataset as you encounter interesting
          or failure cases. When changing a prompt or model, run the full dataset through both
          versions using LangSmith's experiment comparison feature. The side-by-side diff view
          shows exactly which examples improved or regressed, giving you signal before deploying
          to production.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Tag Runs with Environment and Version Metadata">
        <p>
          Always add structured tags and metadata to your LangSmith traces: <code>env:production</code>,
          <code>env:staging</code>, <code>model_version:claude-3-5-sonnet-20241022</code>,
          <code>prompt_hash:abc123</code>, <code>app_version:2.3.1</code>. This enables filtering
          production traces by version in the LangSmith UI, making it trivial to compare
          performance before and after a deployment without manually correlating timestamps.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="LangSmith Without LangChain">
        <p>
          LangSmith is not limited to LangChain applications. The <code>@traceable</code> decorator
          and <code>RunTree</code> API work with any Python function, including raw Anthropic SDK
          calls, custom agent loops, and non-LangChain orchestration frameworks. If you want
          LangSmith's annotation and dataset UI without committing to LangChain, use the
          standalone <code>langsmith</code> Python package with manual instrumentation.
        </p>
      </NoteBlock>
    </article>
  )
}
