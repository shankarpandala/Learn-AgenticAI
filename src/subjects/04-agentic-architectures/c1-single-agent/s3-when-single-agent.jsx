import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function WhenSingleAgent() {
  return (
    <article className="prose-content">
      <h2>When to Use Single-Agent vs. Multi-Agent Systems</h2>

      <p>
        Multi-agent architectures are compelling on paper: specialized agents, parallel
        execution, independent verification, virtually unlimited scale. In practice, they
        introduce coordination overhead, debugging complexity, and failure modes that simply
        do not exist in single-agent systems. The right question is not "could this benefit
        from multiple agents?" but "does the measurable benefit of multiple agents outweigh
        the measurable cost of additional complexity?" That question has a clear answer for
        many common use cases.
      </p>

      <ConceptBlock term="Architectural Decision Framework">
        Choose a single-agent architecture when the task fits within a reasonable context
        window, requires sequential reasoning, and does not have clearly independent parallel
        workstreams. Choose multi-agent when the task is genuinely parallelizable, requires
        more context than fits in one window, benefits from multiple independent perspectives,
        or requires specialized capabilities that conflict with each other in a single prompt.
      </ConceptBlock>

      <h2>The Case for Single-Agent: Underappreciated Advantages</h2>

      <h3>No Coordination Tax</h3>
      <p>
        Every multi-agent system pays a coordination tax: the cost and latency of serializing
        work assignments, deserializing results, resolving disagreements between agents, and
        managing shared state. For tasks that complete in 5–15 steps, this tax can exceed
        the actual work being done. A monolithic agent has zero coordination overhead — it
        just reasons and acts.
      </p>

      <h3>No Information Loss at Boundaries</h3>
      <p>
        When work passes between agents, information is inevitably compressed or lost.
        An orchestrator that summarizes "sub-task A is complete" may omit nuances that
        a worker agent would have used. A single-agent system never has this problem —
        all discovered information remains in context, accessible to every subsequent
        reasoning step. This is particularly important for tasks where subtle details matter.
      </p>

      <h3>Failure Isolation</h3>
      <p>
        When a single-agent system fails, you have one conversation trace to analyze.
        When a multi-agent system fails, the failure may originate in any agent, at any
        step, and may manifest as a subtle miscommunication rather than an obvious error.
        Debugging multi-agent failures is significantly harder.
      </p>

      <h3>Coherent Style and Reasoning</h3>
      <p>
        A single agent maintains consistent style, vocabulary, and reasoning approach
        throughout a task. Multi-agent systems can produce outputs that are internally
        inconsistent when different agents used different assumptions or stylistic conventions.
        Synthesizing their outputs into a coherent whole requires an additional reconciliation
        step that itself may introduce errors.
      </p>

      <h2>Decision Criteria: When to Escalate to Multi-Agent</h2>

      <h3>Context Window Exhaustion</h3>
      <p>
        The clearest signal that a monolithic agent is insufficient is running out of context.
        If the task genuinely requires more information than fits in the model's context window —
        not because of bloated system prompts or verbose tool results, but because the task
        intrinsically requires that much data — then multiple agents with partitioned contexts
        may be necessary. Before concluding this, first try: summarizing tool results, filtering
        to relevant fields, and using external memory stores accessed via search tools.
      </p>

      <h3>True Parallelism</h3>
      <p>
        If a task naturally decomposes into independent subtasks that have no data dependencies
        between them, and completing those subtasks in parallel would provide meaningful latency
        reduction, multi-agent parallelism is justified. The key word is "independent" — if
        subtask B needs the output of subtask A, parallelism doesn't help and you're just adding
        orchestration overhead. A single agent parallelizing its tool calls (by emitting multiple
        tool_use blocks in one response) handles many cases that seem to require multiple agents.
      </p>

      <h3>Conflicting Specialization Requirements</h3>
      <p>
        Sometimes a task requires behaviors that actively conflict within a single system prompt.
        A code reviewer that must be extremely critical and a code writer that must be creative
        and try unconventional approaches may perform better as separate agents with different
        instructions than as a single agent trying to do both. This is relatively rare — most
        "specialization" benefits can be achieved through careful prompting in a single agent.
      </p>

      <h3>Independent Verification</h3>
      <p>
        For high-stakes tasks, having a second independent agent verify the first agent's output
        can catch errors that the first agent would not catch reviewing its own work. This works
        because the verification agent is not anchored to the original agent's reasoning chain.
        The benefit is real, but so is the cost: two API calls instead of one, plus orchestration
        logic. Quantify both before assuming it is worth it.
      </p>

      <h2>A Decision Framework</h2>

      <p>
        Work through these questions in order. Stop at the first "yes" that indicates you need
        a more complex architecture.
      </p>

      <ol>
        <li>
          <strong>Does the task fit in one context window?</strong> If yes, start with a
          single agent. If no, consider whether better tool design (returning less verbose
          results, using search instead of loading everything) can make it fit before
          reaching for multiple agents.
        </li>
        <li>
          <strong>Are there genuinely independent parallel subtasks?</strong> If the task
          is naturally sequential, stay with a single agent. If it is genuinely parallel,
          first try emitting multiple tool calls in a single agent step before adding
          separate agents.
        </li>
        <li>
          <strong>Are there conflicting behavioral requirements?</strong> If a single prompt
          can serve all requirements without internal contradiction, stay single-agent. Most
          apparent conflicts can be resolved with careful prompting.
        </li>
        <li>
          <strong>Is independent verification required for safety or quality?</strong>
          If yes, a two-agent writer-reviewer pattern may be justified. If the stakes are
          lower, self-reflection in a single agent may be sufficient.
        </li>
        <li>
          <strong>Does the task require different models for different subtasks?</strong>
          If you need a vision model for one part and a code model for another, you need
          multiple agents by necessity.
        </li>
      </ol>

      <PatternBlock
        name="Complexity Budget"
        category="Architecture Decision"
        description="Every additional agent in a system costs: development time, debugging time, operational overhead, and latency. Set a complexity budget before designing: how much additional complexity is the task's requirements worth? A task that completes reliably with a monolithic agent in 95% of cases is better served by improving that 5% than by rewriting the system as a multi-agent pipeline."
        when={[
          "Designing a new agent system from scratch",
          "Deciding whether to migrate a working single-agent system to multi-agent",
          "Evaluating multi-agent frameworks against simpler alternatives"
        ]}
        avoid={[
          "Defaulting to multi-agent because it sounds more sophisticated",
          "Adding agents to solve problems that better prompting or tool design would fix",
          "Assuming more agents always means better quality"
        ]}
      />

      <h2>Complexity Thresholds</h2>

      <p>
        These are rough thresholds based on common production experience. They are starting
        points, not rigid rules — your specific task distribution and model capabilities will
        shift them.
      </p>

      <ul>
        <li><strong>Under 50 expected steps per task:</strong> Almost always start with a single agent.</li>
        <li><strong>Under 50,000 tokens of accumulated context per task:</strong> Single agent context management strategies (summarization, retrieval) are usually sufficient.</li>
        <li><strong>Under 3 clearly independent workstreams:</strong> Consider whether a single agent with parallel tool calls is sufficient before introducing agent coordination.</li>
        <li><strong>Under 5 distinct specialized capabilities needed:</strong> A single carefully designed prompt can usually handle this. Beyond 5, specialization benefits of separate agents start to outweigh coordination costs.</li>
      </ul>

      <BestPracticeBlock title="Benchmark the single-agent baseline before adding agents">
        Before designing a multi-agent system, build and benchmark a single-agent baseline.
        Know its failure rate, average cost, and latency. The multi-agent system must
        demonstrably improve at least one of these metrics without catastrophically worsening
        another. If the multi-agent system has higher failure rate, higher cost, and higher
        latency than the monolithic baseline, you have paid the coordination tax without
        receiving the benefit.
      </BestPracticeBlock>

      <WarningBlock title="Multi-agent systems amplify prompt injection risks">
        When agents communicate, an adversarial result in one agent's tool output can
        inject instructions that the next agent follows. A single-agent system has one
        entry point for this attack. A multi-agent system has as many entry points as there
        are inter-agent message exchanges. The expanded attack surface is a real production
        security consideration, not a theoretical concern.
      </WarningBlock>

      <NoteBlock title="The best architecture is the simplest one that meets requirements">
        Production systems that have been running for years tend to be simpler than their
        initial designs. Teams discover that most of the complexity they anticipated needing
        was not necessary in practice. Apply the same lesson proactively: start simple,
        measure real failure modes, and add complexity only where data shows it is needed.
        An agent system you can debug at 3am is more valuable than an elegant architecture
        you cannot reason about under pressure.
      </NoteBlock>
    </article>
  )
}
