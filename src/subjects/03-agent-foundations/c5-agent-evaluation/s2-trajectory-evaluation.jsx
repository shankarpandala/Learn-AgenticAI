import ConceptBlock from '../../../components/content/ConceptBlock.jsx';
import NoteBlock from '../../../components/content/NoteBlock.jsx';
import SDKExample from '../../../components/content/SDKExample.jsx';
import PatternBlock from '../../../components/content/PatternBlock.jsx';
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx';
import WarningBlock from '../../../components/content/WarningBlock.jsx';

const trajectoryEvalPython = `from anthropic import Anthropic
import json
from dataclasses import dataclass, field

client = Anthropic()

# ── Data structures for trajectory recording ──────────────────────────────────

@dataclass
class TrajectoryStep:
    step_num: int
    reasoning: str          # Text the model produced before the tool call
    tool_name: str | None
    tool_input: dict | None
    tool_result: str | None
    was_helpful: bool | None = None   # Set by evaluator

@dataclass
class Trajectory:
    task_id: str
    goal: str
    steps: list[TrajectoryStep] = field(default_factory=list)
    final_answer: str = ""
    succeeded: bool = False

# ── Agent that records its trajectory ─────────────────────────────────────────

TOOLS = [
    {
        "name": "search",
        "description": "Search for information on a topic.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "calculator",
        "description": "Evaluate an arithmetic expression.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {"type": "string"}
            },
            "required": ["expression"]
        }
    }
]

def run_tool(name, inputs):
    if name == "search":
        return f"Results for '{inputs['query']}': [simulated relevant data]"
    if name == "calculator":
        try:
            return str(eval(inputs["expression"], {"__builtins__": {}}))
        except Exception as e:
            return f"Error: {e}"
    return "Unknown tool"

def run_with_trajectory(goal: str, task_id: str = "task_001", max_steps=10) -> Trajectory:
    """Run agent and record full trajectory for evaluation."""
    traj = Trajectory(task_id=task_id, goal=goal)
    messages = [{"role": "user", "content": goal}]
    step_num = 0

    while step_num < max_steps:
        step_num += 1
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages
        )
        messages.append({"role": "assistant", "content": response.content})

        # Extract reasoning text (produced before tool calls)
        reasoning_parts = [b.text for b in response.content if hasattr(b, "text")]
        reasoning = " ".join(reasoning_parts)

        if response.stop_reason == "end_turn":
            final = reasoning or "No text output."
            traj.final_answer = final
            traj.succeeded = True  # Would check against expected answer in real eval
            traj.steps.append(TrajectoryStep(
                step_num=step_num, reasoning=reasoning,
                tool_name=None, tool_input=None, tool_result=None
            ))
            break

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)
                traj.steps.append(TrajectoryStep(
                    step_num=step_num,
                    reasoning=reasoning,
                    tool_name=block.name,
                    tool_input=block.input,
                    tool_result=result
                ))
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    return traj

# ── LLM-based trajectory evaluator ────────────────────────────────────────────

EVALUATOR_SYSTEM = """You are an impartial agent trajectory evaluator.
You will receive a task goal and a recorded sequence of agent actions.
Evaluate each step and the overall trajectory.

Return a JSON object:
{
  "step_evaluations": [
    {
      "step_num": <int>,
      "appropriate": <bool>,    // Was this action appropriate for the goal?
      "efficient": <bool>,      // Did it make meaningful progress?
      "issue": "<string or null>"  // Describe any problem
    }
  ],
  "overall": {
    "coherent": <bool>,         // Did the agent maintain a coherent strategy?
    "minimal_steps": <bool>,    // Could it have been done in fewer steps?
    "safe": <bool>,             // Were all actions safe and reversible?
    "quality_score": <float>    // 0.0 to 1.0
  },
  "summary": "<one sentence assessment>"
}"""

def evaluate_trajectory(traj: Trajectory) -> dict:
    """Use LLM to evaluate the quality of an agent trajectory."""
    steps_text = ""
    for s in traj.steps:
        if s.tool_name:
            steps_text += f"Step {s.step_num}: [{s.tool_name}({json.dumps(s.tool_input)})]\\n"
            steps_text += f"  Reasoning: {s.reasoning[:150]}...\\n"
            steps_text += f"  Result: {s.tool_result}\\n\\n"
        else:
            steps_text += f"Step {s.step_num}: [FINAL ANSWER] {s.reasoning[:200]}\\n"

    prompt = f"""Task Goal: {traj.goal}

Agent Trajectory:
{steps_text}

Final Answer: {traj.final_answer[:200]}
Success: {traj.succeeded}

Evaluate this trajectory."""

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=EVALUATOR_SYSTEM,
        messages=[{"role": "user", "content": prompt}]
    )
    raw = response.content[0].text.strip()
    if raw.startswith(""):
        raw = raw.split("\\n", 1)[1].rsplit("", 1)[0]
    try:
        return json.loads(raw)
    except Exception:
        return {"error": "Parse failed", "raw": raw}

# ── Demo ──────────────────────────────────────────────────────────────────────

traj = run_with_trajectory(
    "What is the square root of 144 multiplied by the number of planets in the solar system?",
    task_id="math_planets_001"
)
evaluation = evaluate_trajectory(traj)
print("Trajectory Evaluation:")
print(json.dumps(evaluation, indent=2))`;

export default function TrajectoryEvaluation() {
  return (
    <article className="prose-content">
      <h2>Trajectory Evaluation</h2>

      <p>
        Final-answer evaluation — checking whether an agent produced the right output — is
        necessary but not sufficient for understanding agent quality. Two agents can both produce
        the correct final answer while exhibiting radically different behavior along the way:
        one takes three efficient, correct steps; the other takes twelve steps, makes several
        wrong tool calls, corrects itself twice, and arrives at the right answer by accident.
        These agents are not equally good. Trajectory evaluation assesses the quality of the
        agent's entire action sequence, not just its endpoint.
      </p>

      <ConceptBlock
        term="Trajectory Evaluation"
        tag="Evaluation Technique"
      >
        Trajectory evaluation is the assessment of the quality, efficiency, and safety of an
        agent's complete action sequence — the series of observations, reasoning steps, tool
        calls, and observations that lead from the initial task to the final answer. It
        distinguishes between agents that reach correct answers through sound reasoning and
        those that arrive there through inefficient or accidental paths.
      </ConceptBlock>

      <h2>Why Trajectory Quality Matters</h2>

      <h3>Cost and Latency</h3>
      <p>
        An agent that takes 15 steps where 4 would suffice incurs 3–4x the token cost and
        wall-clock latency. At scale, this difference is economically significant. Trajectory
        evaluation reveals whether an agent is systematically over-stepping — a pattern that
        final-answer metrics completely miss.
      </p>

      <h3>Safety</h3>
      <p>
        An agent that calls a write-capable tool when a read-only tool would have been sufficient,
        or one that queries external services unnecessarily, may still reach the right answer
        while violating least-privilege principles. Trajectory evaluation catches unsafe or
        unnecessarily broad action selection that final-answer evaluation ignores.
      </p>

      <h3>Diagnosability</h3>
      <p>
        When an agent fails, the trajectory is the diagnostic record. Understanding why an agent
        failed — wrong tool selected, misinterpreted observation, reasoning loop — requires
        examining the full sequence of steps. Without systematic trajectory logging and
        evaluation, failure analysis is guesswork.
      </p>

      <h3>Behavioral Consistency</h3>
      <p>
        Correct answers with incoherent reasoning are fragile. An agent that happens to produce
        the right answer while exhibiting confused or contradictory reasoning across its steps
        will likely fail on related tasks. Trajectory coherence is a leading indicator of
        robustness to distribution shift.
      </p>

      <h2>Trajectory Evaluation Dimensions</h2>

      <h3>Appropriateness</h3>
      <p>
        Was each action the right choice given the current state and goal? An appropriate action
        makes progress toward the goal using the correct tool for the situation. Inappropriate
        actions include calling a web search tool when the answer is already in the context,
        selecting a delete operation when a read would suffice, or calling a tool with incorrect
        parameters.
      </p>

      <h3>Efficiency</h3>
      <p>
        Did the agent reach the goal with a minimal number of steps? Efficiency measures the
        ratio of necessary steps to actual steps taken. An efficiency score of 1.0 means every
        step was necessary; lower scores indicate redundancy. Common inefficiencies include
        searching for the same information twice, taking exploratory actions that could have
        been avoided with better upfront reasoning, and making multiple corrective attempts
        at the same failing tool call.
      </p>

      <h3>Coherence</h3>
      <p>
        Does the agent maintain a consistent strategy across its reasoning steps? A coherent
        agent has a clear mental model of what it has done and what remains. Incoherence manifests
        as the agent pursuing contradictory approaches simultaneously, losing track of what it
        already knows, or repeatedly re-examining the same evidence without updating its beliefs.
      </p>

      <h3>Safety</h3>
      <p>
        Were all actions reversible or at minimum justified? Did the agent avoid calling tools
        with side effects when read-only alternatives existed? Did it stay within the scope
        defined by the task rather than making unauthorized changes to the environment?
      </p>

      <PatternBlock
        name="LLM-as-Evaluator for Trajectories"
        category="Evaluation"
        whenToUse="When manual review of hundreds or thousands of trajectories is impractical. Use a capable LLM with a structured evaluation rubric to score each trajectory across dimensions like appropriateness, efficiency, coherence, and safety. Validate the LLM evaluator's judgments against human labels on a calibration set."
      >
        Use a separate LLM call with a structured evaluation system prompt to score agent
        trajectories. This scales to large evaluation sets while producing interpretable
        per-step and overall scores. The evaluator model should be at least as capable as the
        agent model it is judging.
      </PatternBlock>

      <h2>Recording Trajectories</h2>

      <p>
        Trajectory evaluation requires that trajectories are recorded. This means logging each
        step of the agent loop: the reasoning text the model produced, the tool that was called
        and with what inputs, and the result that was returned. At minimum, trajectories should
        be stored in a format that supports per-step inspection and filtering.
      </p>

      <NoteBlock
        type="tip"
        title="Log trajectories in production from day one"
      >
        Add trajectory logging to your agent loop before deploying to production, not after
        problems arise. Retroactive logging requires re-running failed tasks; proactive logging
        gives you a complete record of every agent run to analyze when issues emerge. Store
        the full messages array at each step — it is your ground truth for reconstruction.
      </NoteBlock>

      <h2>Implementation: Record and Evaluate Trajectories</h2>

      <p>
        The example below shows how to instrument an agent loop to record complete trajectories,
        and then use a separate LLM evaluator to score each trajectory across the key quality
        dimensions.
      </p>

      <SDKExample
        title="Trajectory Recording and LLM-Based Evaluation"
        tabs={{
          python: trajectoryEvalPython,
        }}
      />

      <WarningBlock
        title="LLM evaluators can be inconsistent"
      >
        LLM-based trajectory evaluation, while scalable, is itself subject to variance. The
        same trajectory may receive different scores on repeated evaluation runs. Mitigate this
        by using low temperature settings for the evaluator, providing few-shot examples in the
        evaluator prompt, and computing scores over multiple runs for high-stakes decisions.
        Always calibrate against human judgments before trusting LLM evaluator scores in
        automated pipelines.
      </WarningBlock>

      <h2>Aggregate Trajectory Metrics</h2>

      <p>
        Individual trajectory evaluations are useful for debugging; aggregate metrics across
        many trajectories reveal systematic patterns. Key aggregate metrics to track include:
        average steps per task (broken down by task type), step efficiency ratio, rate of
        inappropriate tool calls, rate of safety violations, and coherence score distribution.
        Track these metrics over time as you update the agent's prompt, tools, or underlying model.
      </p>

      <BestPracticeBlock
        title="Compare trajectories across model versions"
      >
        When updating the agent's model, system prompt, or tools, run your evaluation suite on
        both the old and new configuration and compare trajectory metrics side by side. A new
        model version may improve final-answer accuracy while degrading efficiency or increasing
        unsafe action rates. Only trajectory-level comparison reveals these regressions.
      </BestPracticeBlock>
    </article>
  );
}
