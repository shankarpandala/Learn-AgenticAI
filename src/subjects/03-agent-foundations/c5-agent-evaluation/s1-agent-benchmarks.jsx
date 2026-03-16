import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import PatternBlock from '../../../components/content/PatternBlock.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';

const benchmarkRunnerPython = `import json
import time
from anthropic import Anthropic
from dataclasses import dataclass, field

client = Anthropic()

@dataclass
class BenchmarkTask:
    task_id: str
    prompt: str
    expected_keywords: list[str]   # Minimal grading: correct answer contains these
    max_steps: int = 10

@dataclass
class BenchmarkResult:
    task_id: str
    success: bool
    steps_taken: int
    wall_time_s: float
    input_tokens: int
    output_tokens: int
    final_answer: str

# ── Minimal agent for benchmark evaluation ────────────────────────────────────

tools = [
    {
        "name": "python_eval",
        "description": "Evaluate a Python expression and return the result.",
        "input_schema": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Python expression to evaluate"}
            },
            "required": ["code"]
        }
    },
    {
        "name": "lookup",
        "description": "Look up a fact from a simulated knowledge base.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Fact to look up"}
            },
            "required": ["query"]
        }
    }
]

KNOWLEDGE_BASE = {
    "webArena": "WebArena is a benchmark for autonomous web agents with 812 tasks across 5 websites.",
    "swe-bench": "SWE-bench evaluates agents on real GitHub issues from Python repositories.",
    "hotpotqa": "HotpotQA requires multi-hop reasoning across 2 Wikipedia documents.",
    "agentbench": "AgentBench covers 8 environments including OS, DB, web browsing, and games.",
}

def run_tool(name: str, inputs: dict) -> str:
    if name == "python_eval":
        try:
            import math
            result = eval(inputs["code"], {"__builtins__": {}}, {"math": math, "abs": abs, "round": round})
            return str(result)
        except Exception as e:
            return f"Error: {e}"
    if name == "lookup":
        for key, val in KNOWLEDGE_BASE.items():
            if key.lower() in inputs["query"].lower():
                return val
        return "No entry found."
    return "Unknown tool"

def run_benchmark_task(task: BenchmarkTask) -> BenchmarkResult:
    """Run a single benchmark task and measure performance."""
    messages = [{"role": "user", "content": task.prompt}]
    total_input = 0
    total_output = 0
    steps = 0
    start = time.perf_counter()

    while steps < task.max_steps:
        steps += 1
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )
        total_input += response.usage.input_tokens
        total_output += response.usage.output_tokens
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            answer = next((b.text for b in response.content if hasattr(b, "text")), "")
            success = all(kw.lower() in answer.lower() for kw in task.expected_keywords)
            elapsed = time.perf_counter() - start
            return BenchmarkResult(
                task_id=task.task_id,
                success=success,
                steps_taken=steps,
                wall_time_s=round(elapsed, 2),
                input_tokens=total_input,
                output_tokens=total_output,
                final_answer=answer[:200]
            )

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)
                tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})
        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    elapsed = time.perf_counter() - start
    return BenchmarkResult(
        task_id=task.task_id, success=False, steps_taken=steps,
        wall_time_s=round(elapsed, 2), input_tokens=total_input,
        output_tokens=total_output, final_answer="MAX_STEPS_EXCEEDED"
    )

def run_benchmark_suite(tasks: list[BenchmarkTask]) -> dict:
    """Run a suite of tasks and aggregate metrics."""
    results = [run_benchmark_task(t) for t in tasks]
    successes = [r for r in results if r.success]

    return {
        "total_tasks": len(results),
        "successes": len(successes),
        "success_rate": round(len(successes) / len(results), 3),
        "avg_steps": round(sum(r.steps_taken for r in results) / len(results), 1),
        "avg_wall_time_s": round(sum(r.wall_time_s for r in results) / len(results), 2),
        "total_input_tokens": sum(r.input_tokens for r in results),
        "total_output_tokens": sum(r.output_tokens for r in results),
        "results": [vars(r) for r in results]
    }

# ── Example benchmark suite ───────────────────────────────────────────────────

tasks = [
    BenchmarkTask(
        task_id="math_001",
        prompt="What is the cube root of 27000 plus 5 factorial?",
        expected_keywords=["150"]
    ),
    BenchmarkTask(
        task_id="info_001",
        prompt="What is SWE-bench and what does it evaluate?",
        expected_keywords=["GitHub", "Python"]
    ),
    BenchmarkTask(
        task_id="multistep_001",
        prompt="Calculate 2 to the power of 10, then subtract 24. What benchmark covers 8 environments?",
        expected_keywords=["1000", "AgentBench"]
    ),
]

report = run_benchmark_suite(tasks)
print(json.dumps(report, indent=2))`;

export default function AgentBenchmarks() {
  return (
    <article className="prose-content">
      <h2>Agent Benchmarks</h2>

      <p>
        Measuring agent capability is harder than measuring standard machine learning model
        performance. Classification accuracy on a fixed test set is straightforward. Agent
        evaluation requires assessing whether an agent can complete open-ended tasks in dynamic
        environments, use tools correctly, recover from errors, and produce the right final output
        after an arbitrary number of steps. A set of standard benchmarks has emerged to make
        these measurements comparable across systems.
      </p>

      <ConceptBlock
        term="Agent Benchmark"
        tag="Evaluation"
      >
        An agent benchmark is a standardized evaluation suite that measures an agent's ability
        to complete tasks in a defined environment. Benchmarks specify tasks (what the agent
        must accomplish), environments (what tools and information are available), evaluation
        criteria (how success is judged), and metrics (quantitative scores for comparison).
        Standard benchmarks enable reproducible, comparable evaluation across different agent
        architectures and models.
      </ConceptBlock>

      <h2>Major Agent Benchmarks</h2>

      <h3>WebArena</h3>
      <p>
        WebArena evaluates agents on real web-browsing tasks across five websites: an e-commerce
        store (OneStopShop), a forum (Reddit), a code repository (GitLab), a map application
        (OpenStreetMap), and a collaborative editing platform (Wikipedia). The benchmark contains
        812 tasks ranging from "find the price of this product" to "create a pull request that
        fixes this bug." Tasks are evaluated functionally — the correct state must be reached,
        not just the correct text produced. State-of-the-art agents achieve roughly 10–35% success
        rates on WebArena, illustrating how hard real-world web tasks remain.
      </p>

      <h3>SWE-bench</h3>
      <p>
        SWE-bench (Software Engineering benchmark) evaluates agents on real GitHub issues from
        popular Python repositories. Each task presents the agent with a failing test case and
        the full codebase; the agent must identify the bug and produce a patch that makes the
        tests pass. SWE-bench is notable for testing practical software engineering capability
        and for its strict, automated evaluation — a patch either passes the tests or it does
        not. The SWE-bench Verified subset contains 500 tasks that are confirmed solvable by
        humans and is widely used for model comparison.
      </p>

      <h3>HotpotQA</h3>
      <p>
        HotpotQA is a multi-hop question-answering benchmark requiring an agent to reason across
        two or more Wikipedia documents to answer a question. For example: "What nationality is
        the director of the film that won the Palme d'Or in 1994?" requires finding the 1994
        Palme d'Or winner, then finding the director's nationality. HotpotQA tests multi-step
        information retrieval and synthesis — capabilities directly relevant to research and
        analysis agents.
      </p>

      <h3>AgentBench</h3>
      <p>
        AgentBench is a comprehensive benchmark covering eight diverse environments: an operating
        system (bash), a relational database (MySQL), a knowledge graph, a web browsing environment,
        web shopping, a lateral thinking puzzle, and two game environments (Alfworld and Mind2Web).
        The breadth of AgentBench makes it useful for evaluating generalist agents that must
        handle heterogeneous task types.
      </p>

      <h3>GAIA</h3>
      <p>
        GAIA (General AI Assistant benchmark) evaluates agents on real-world questions that require
        a combination of web search, file analysis, multi-step reasoning, and tool use. GAIA
        questions are written to be unambiguous to humans but require using multiple tools and
        reasoning steps. The benchmark has three difficulty levels, with the hardest requiring
        agents to orchestrate many tools over many steps.
      </p>

      <h3>τ-bench (tau-bench)</h3>
      <p>
        τ-bench focuses on tool-use-heavy tasks where the agent must interact with a simulated
        environment through a realistic set of APIs. It emphasizes measuring whether agents
        use tools correctly and efficiently, not just whether they reach the right final answer.
        This makes it particularly useful for evaluating the tool-use quality of production agents.
      </p>

      <NoteBlock
        type="note"
        title="Benchmark scores are not product metrics"
      >
        Standard benchmark scores measure capability on standardized tasks in controlled
        environments. They are a useful proxy for relative model and agent quality, but they
        do not directly predict performance on your specific task distribution, with your specific
        tools, in your production environment. Always evaluate on your own task distribution
        before drawing conclusions from benchmark scores.
      </NoteBlock>

      <h2>Benchmark Evaluation Criteria</h2>

      <h3>Functional Correctness</h3>
      <p>
        The most common evaluation criterion: did the agent achieve the desired end state?
        For coding benchmarks, this means tests pass. For web benchmarks, this means the
        correct page state was reached. Functional correctness ignores how the agent got there —
        an agent that takes 20 steps when 3 suffice can still score 100% on correctness.
      </p>

      <h3>Efficiency</h3>
      <p>
        Some benchmarks also measure how many steps or tokens were consumed. An agent that solves
        tasks correctly but uses 10x more steps or tokens than necessary is less useful in
        production where latency and cost matter. Efficiency metrics complement correctness to
        provide a fuller picture of agent quality.
      </p>

      <h3>Exact Match vs. Semantic Match</h3>
      <p>
        Simple benchmarks use exact string matching for evaluation; more sophisticated ones use
        semantic similarity, LLM-based grading, or functional state checking. The evaluation
        method significantly affects apparent performance — a model that gives a correct but
        slightly differently phrased answer will score 0% on exact match and near 100% on
        semantic match.
      </p>

      <PatternBlock
        name="Internal Benchmark Suite"
        category="Evaluation"
        whenToUse="Any production agent system. Build a task suite representative of your actual use cases, with automated success criteria, and run it on every model update or major prompt change. Standard benchmarks tell you how your agent compares to the field; your internal suite tells you whether it is regressing."
      >
        Maintain an internal benchmark suite derived from real production tasks. Track success
        rate, average steps, and token cost over time. Run it as part of your CI/CD pipeline.
        Standard benchmarks are research tools; your internal suite is your regression test.
      </PatternBlock>

      <h2>Building an Internal Benchmark Runner</h2>

      <p>
        The example below implements a lightweight benchmark runner that measures success rate,
        step count, wall-clock time, and token consumption across a suite of tasks. This is the
        core pattern for internal evaluation infrastructure.
      </p>

      <SDKExample
        title="Agent Benchmark Runner"
        tabs={{
          python: benchmarkRunnerPython,
        }}
      />

      <BestPracticeBlock
        title="Measure leading indicators, not just final scores"
      >
        Track intermediate metrics alongside final success rates: average steps taken per task,
        rate of tool call errors, rate of hitting the maximum step limit, and token cost per
        successful task completion. These leading indicators reveal systematic problems —
        a model that is getting stuck in loops, calling the wrong tools, or producing invalid
        tool inputs — before they manifest as declining success rates.
      </BestPracticeBlock>
    </article>
  );
}
