import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function CoordinationPatterns() {
  return (
    <article className="prose-content">
      <h2>Coordination Patterns in Multi-Agent Systems</h2>

      <p>
        When multiple agents must work together toward a shared goal, how they coordinate
        their efforts determines whether the system is efficient, correct, and robust. Different
        coordination patterns make different trade-offs between simplicity, throughput, fairness,
        and resilience. Choosing the right pattern for your use case is as important as
        choosing the right model or writing the right prompt.
      </p>

      <h2>Sequential Pipeline</h2>

      <ConceptBlock term="Sequential Pipeline Pattern">
        In a sequential pipeline, agents are arranged in a fixed order where each agent
        processes the output of the previous agent before passing its own output to the next.
        The coordination is entirely deterministic: agent A always runs before agent B,
        which always runs before agent C. This is the simplest coordination pattern and
        the right starting point for tasks with a natural sequential structure.
      </ConceptBlock>

      <p>
        Sequential pipelines excel when each stage clearly depends on the output of the
        previous stage. A document processing pipeline might have stages for extraction,
        cleaning, enrichment, and summarization — each stage logically follows from the last.
        The failure mode is simple: if any stage fails, the pipeline halts at that stage.
        Recovery is straightforward: restart from the failed stage.
      </p>

      <p>
        The limitation of sequential pipelines is that they are slow — all stages must
        complete before the final result is available, and there is no parallelism regardless
        of whether intermediate stages are actually interdependent. For latency-sensitive
        applications with large data volumes, the sequential pipeline's simplicity comes at
        a significant performance cost.
      </p>

      <h2>Fan-Out / Fan-In (Parallel Coordination)</h2>

      <ConceptBlock term="Fan-Out / Fan-In">
        Fan-out / fan-in divides a task into independent subtasks, distributes them to
        multiple agents for parallel execution (fan-out), then collects and aggregates all
        results once they are complete (fan-in). This pattern is ideal for tasks that can
        be cleanly partitioned: analyze 10 documents in parallel, then synthesize the
        individual analyses into a unified report.
      </ConceptBlock>

      <p>
        The key requirement for fan-out / fan-in is that the subtasks must be genuinely
        independent — no subtask should depend on the output of another subtask at the
        same level. If there are dependencies, those subtasks must be sequenced rather than
        parallelized. The aggregation step (fan-in) must also handle the case where some
        subtasks fail: decide whether to proceed with partial results or retry failed tasks
        before aggregating.
      </p>

      <p>
        Implementation requires an async execution layer. In Python, use asyncio.gather
        or a ThreadPoolExecutor to run multiple agent calls concurrently. In TypeScript,
        use Promise.all or Promise.allSettled. The fan-in step typically involves a
        synthesizing agent that receives all subtask results and produces a unified output.
      </p>

      <h2>Round-Robin</h2>

      <ConceptBlock term="Round-Robin Coordination">
        Round-robin coordination cycles task assignments through a pool of worker agents in
        turn, ensuring each agent gets an equal share of tasks. A round-robin coordinator
        maintains a pointer to the next agent to receive a task, advancing it by one after
        each assignment. This is appropriate for load-balanced systems where tasks are
        similar in complexity and the goal is uniform utilization across agents.
      </ConceptBlock>

      <p>
        Round-robin is simple to implement but naive: it ignores differences in agent
        availability and task complexity. A task that takes 30 seconds assigned to a busy
        agent holds up the queue, while an idle agent sits unused. For high-variance task
        workloads, work-stealing or dynamic assignment produces better throughput.
      </p>

      <h2>Voting and Ensemble</h2>

      <ConceptBlock term="Voting Coordination">
        Voting coordination runs the same task on multiple independent agents and selects
        the final output by majority vote or a weighted combination of responses. This
        improves reliability and consistency for tasks where individual agents may make
        different errors. A three-agent system that produces "correct, incorrect, correct"
        votes correctly on the final answer. Voting is particularly valuable for
        classification tasks, factual question answering, and decisions where one agent
        might hallucinate.
      </ConceptBlock>

      <p>
        The cost of voting is multiplicative: N-way voting costs N times as much as a
        single-agent response and takes as long as the slowest agent. This is justified
        when correctness is critical and the error reduction from voting is demonstrable.
        Before committing to multi-agent voting, measure the error reduction empirically
        on your specific task distribution — for some tasks, a single better-prompted agent
        outperforms three weakly-prompted agents with majority voting.
      </p>

      <h3>Vote Aggregation Strategies</h3>
      <ul>
        <li><strong>Simple majority:</strong> The answer that more than half the agents agree on. Fails when there is no majority.</li>
        <li><strong>Plurality:</strong> The most common answer, even if not a majority. Works when agents may all produce different answers.</li>
        <li><strong>Weighted voting:</strong> Agents are weighted by their demonstrated accuracy on similar tasks. Higher-confidence or higher-capability agents have more influence.</li>
        <li><strong>LLM judge:</strong> A separate evaluator agent reads all responses and selects or synthesizes the best one. Most flexible but adds an additional LLM call.</li>
      </ul>

      <h2>Bidding / Market-Based Coordination</h2>

      <ConceptBlock term="Market-Based Coordination">
        In market-based coordination, tasks are auctioned to agents that bid based on their
        estimated capability to complete the task. Agents advertise their specializations,
        assess incoming tasks, and submit bids. The coordinator assigns each task to the
        lowest-cost or highest-capability bidder. This pattern enables dynamic specialization:
        agents self-select for tasks they are best suited to, without requiring the coordinator
        to know which agent is most appropriate for each task type.
      </ConceptBlock>

      <p>
        Market-based coordination is sophisticated and powerful for systems with diverse
        agent specializations, but it introduces significant complexity: a bidding protocol,
        capability advertisement, bid evaluation, and assignment logic. It is rarely necessary
        in practice — a simple routing table that maps task types to appropriate agents
        achieves similar specialization with far less complexity.
      </p>

      <h2>Blackboard Pattern</h2>

      <ConceptBlock term="Blackboard Pattern">
        The blackboard pattern uses a shared data store (the "blackboard") that all agents
        can read from and write to. Agents monitor the blackboard for tasks that match their
        specializations, claim tasks, produce results, and write them back to the blackboard.
        Coordination emerges from the shared state rather than from direct agent-to-agent
        communication. The blackboard acts as both the task queue and the result store.
      </ConceptBlock>

      <p>
        The blackboard pattern is particularly well-suited for tasks where the set of
        subtasks is not known in advance — it emerges as agents process the task and
        discover what additional work is needed. A code analysis agent might add "analyze
        function X" entries to the blackboard as it discovers functions that need review,
        and other agents claim and complete those entries. The task is complete when the
        blackboard is empty.
      </p>

      <PatternBlock
        name="Match Pattern to Task Structure"
        category="Coordination"
        description="Sequential pipelines for tasks with inherent data dependencies between stages. Fan-out/fan-in for tasks with genuinely independent parallel subtasks. Voting for high-stakes decisions where individual agent errors must be caught. Blackboard for tasks where the full set of subtasks is discovered dynamically during execution. Use the simplest pattern that meets your requirements."
        when={[
          "Sequential pipeline: document processing, ETL workflows, staged analysis",
          "Fan-out/fan-in: research across multiple sources, parallel data processing",
          "Voting: fact-checking, medical triage, financial decisions",
          "Blackboard: open-ended exploration tasks, dynamic code analysis workflows"
        ]}
        avoid={[
          "Market-based coordination unless you have genuinely diverse, autonomous specialist agents",
          "Voting for generative tasks like writing — the 'average' of three essays is not good",
          "Sequential pipelines for tasks with parallelism potential when latency matters"
        ]}
      />

      <BestPracticeBlock title="Implement backpressure for parallel coordination">
        When using fan-out to distribute many tasks to worker agents, implement backpressure
        to prevent overwhelming your LLM API rate limits. Use a semaphore or concurrency
        limiter to cap the number of simultaneously running agent calls. Without backpressure,
        a large fan-out can trigger rate limiting that causes cascading failures across all
        parallel workers.
      </BestPracticeBlock>

      <WarningBlock title="Deadlocks are possible in bidirectional agent networks">
        In systems where agents can delegate tasks to each other (not just orchestrator
        to worker), circular dependencies can cause deadlocks: agent A waits for agent B,
        which waits for agent C, which waits for agent A. Detect this by implementing
        request timeouts and cycle detection. The simplest prevention is to enforce a strict
        hierarchy: orchestrators can call workers, but workers cannot call other workers.
      </WarningBlock>

      <NoteBlock title="Most production systems use simple patterns">
        The research literature on multi-agent coordination covers many sophisticated
        patterns. Production systems that actually work reliably at scale use almost
        exclusively sequential pipelines and fan-out/fan-in. The simpler patterns are
        not unsophisticated — they are the result of hard-won experience that complexity
        beyond these patterns does not pay for itself in production environments.
      </NoteBlock>
    </article>
  )
}
