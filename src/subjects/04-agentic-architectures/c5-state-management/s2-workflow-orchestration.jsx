import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function WorkflowOrchestration() {
  return (
    <article className="prose-content">
      <h2>Workflow Orchestration for Agent Systems</h2>

      <p>
        A workflow orchestration framework provides the infrastructure for defining, executing,
        monitoring, and recovering agent workflows as structured, persistent processes rather
        than ephemeral scripts. Workflows defined in an orchestration framework survive process
        restarts, support human-in-the-loop interruptions, provide observability into execution
        state, and enable complex control flows like conditional branching, parallel execution,
        and retry logic — without requiring you to implement all of this from scratch.
      </p>

      <ConceptBlock term="Workflow Orchestration">
        Workflow orchestration is the management of structured, multi-step processes that
        may involve multiple agents, external services, human approvals, and long wait times.
        An orchestration framework handles durability (the workflow survives system failures),
        observability (current state and history are inspectable), scheduling (steps execute
        at the right time), and coordination (parallel steps synchronize correctly).
        Orchestration frameworks bring production reliability to agent workflows that pure
        code implementations lack.
      </ConceptBlock>

      <h2>LangGraph: State Machine-Based Orchestration</h2>

      <p>
        LangGraph is a Python library built on LangChain that models agent workflows as
        directed graphs. Nodes in the graph are functions (or agent calls) that transform
        the workflow state. Edges are the transitions between nodes, which can be conditional.
        The framework manages state persistence, provides a checkpointing API, and includes
        built-in support for human-in-the-loop interruptions.
      </p>

      <h3>Core Concepts</h3>
      <ul>
        <li><strong>State schema:</strong> A typed data structure (typically a TypedDict) that holds all workflow data. Every node reads from and writes to this state.</li>
        <li><strong>Nodes:</strong> Functions that transform the state. A node might call an LLM, invoke a tool, apply business logic, or request human approval.</li>
        <li><strong>Edges:</strong> Connections between nodes. Conditional edges allow routing based on state values. Parallel edges allow concurrent node execution.</li>
        <li><strong>Checkpointer:</strong> A storage backend (SQLite, PostgreSQL, Redis) that persists the state at each node transition, enabling resumption after failures.</li>
      </ul>

      <h3>When LangGraph Is Appropriate</h3>
      <p>
        LangGraph excels for workflows where: the control flow is complex and involves
        conditional branching; human-in-the-loop checkpoints are required at specific stages;
        the workflow may run for minutes to hours; and observability into intermediate state
        is important. It is particularly well-suited for the supervisor pattern and for
        workflows where agents need to be interrupted and redirected.
      </p>

      <h2>Temporal: Durable Execution</h2>

      <p>
        Temporal is a workflow platform that provides durable execution — code that survives
        process failures and infrastructure restarts without requiring explicit checkpointing
        in your code. Temporal automatically checkpoints workflow state and replays it on
        failures. You write Python or TypeScript code that looks like sequential imperative
        code; Temporal handles the durability, retries, and distributed execution.
      </p>

      <h3>Temporal's Key Advantages for Agents</h3>
      <ul>
        <li><strong>Automatic durability:</strong> You do not write checkpointing code — Temporal handles it transparently.</li>
        <li><strong>Activity retries:</strong> Tool calls wrapped as Temporal Activities get automatic retry logic with configurable backoff.</li>
        <li><strong>Long-running workflows:</strong> Temporal workflows can run for days or months, waiting for external signals or timers without holding a server thread.</li>
        <li><strong>Signals and queries:</strong> External systems can send signals to running workflows (e.g., a human approves an action) and query current state.</li>
      </ul>

      <h3>When Temporal Is Appropriate</h3>
      <p>
        Temporal is appropriate for mission-critical agent workflows that must not lose state
        on infrastructure failures, workflows that run for hours or days, and systems where
        every tool call must be reliably executed exactly once. The setup overhead of Temporal
        is significant — it requires running a Temporal server — which makes it unsuitable for
        simple or exploratory workflows.
      </p>

      <h2>Human-in-the-Loop Patterns</h2>

      <p>
        Many production agent workflows require human checkpoints: a human must review and
        approve the agent's proposed action before it executes. Implementing this correctly
        requires the workflow to pause at the checkpoint, notify the human, wait for approval
        (potentially for minutes or hours), and then resume from the exact state it was in.
        This is fundamentally a durability problem — the workflow state must survive the wait.
      </p>

      <h3>Approval Gate</h3>
      <p>
        The agent proposes a set of actions, execution pauses, a human reviews the proposals
        via a UI or notification, approves or rejects each action, and the workflow resumes
        with the approved actions. This pattern is appropriate when the agent has write access
        to external systems and the consequences of incorrect actions are significant.
      </p>

      <h3>Clarification Request</h3>
      <p>
        The agent encounters ambiguity in its task and requests clarification from the user
        before proceeding. The workflow pauses, a notification is sent, the user provides
        clarification, and the workflow resumes with the additional context. This is different
        from a full restart — the agent retains all work done so far and only needs the
        additional clarification.
      </p>

      <h3>Exception Escalation</h3>
      <p>
        When an agent encounters an error it cannot resolve autonomously — a tool fails
        consistently, a decision requires domain expertise it lacks, a safety boundary is
        approached — it escalates to a human operator. The human reviews the situation,
        provides guidance or corrects the state, and the agent resumes. This requires the
        agent to clearly describe the problem and the context needed for the human to help.
      </p>

      <PatternBlock
        name="Pause-Before-Irreversible"
        category="Human-in-the-Loop"
        description="Insert a mandatory human approval checkpoint before any irreversible action with significant external consequences: sending emails, deleting records, making financial transactions, deploying code. The cost of a pause is low relative to the cost of an incorrect irreversible action. Use a non-blocking interrupt: the workflow pauses, a notification is sent, and the workflow resumes when approved — rather than synchronously blocking a server thread."
        when={[
          "Agents with write access to production databases, email systems, or financial services",
          "Workflows where regulatory compliance requires a human decision record",
          "Early deployment of new agent capabilities where trust is still being established"
        ]}
        avoid={[
          "Requiring approval for every action, including clearly reversible read operations",
          "Synchronous approval waits that block a thread for potentially hours",
          "Approval notifications without enough context for the reviewer to make a good decision"
        ]}
      />

      <h2>Deterministic Flows vs. Fully Autonomous Agents</h2>

      <p>
        Workflow orchestration frameworks like LangGraph and Temporal are most effective
        when the agent's control flow is partially deterministic — known phases, known
        checkpoints, known approval requirements — even if the content of each phase is
        dynamically generated by an LLM. Fully autonomous agents where even the control
        flow is LLM-determined benefit less from orchestration frameworks and more from
        robust state management within a custom agent loop.
      </p>

      <p>
        In practice, most production agent systems fall on a spectrum: some workflow phases
        are fully deterministic (always research, then plan, then execute) while others are
        dynamic (the execution phase's exact steps depend on what research produced). Design
        the deterministic skeleton in the orchestration framework, and let LLM agents handle
        the dynamic content generation within each deterministic phase.
      </p>

      <BestPracticeBlock title="Design workflows to be idempotent">
        Orchestration frameworks retry failed steps. For this to be safe, agent steps should
        be idempotent: running a step twice produces the same result as running it once.
        LLM calls are naturally idempotent (calling with the same input produces equivalent
        output). Tool calls that modify external state are not naturally idempotent — wrap
        them with idempotency keys or check-before-act patterns to prevent duplicate effects
        on retry.
      </BestPracticeBlock>

      <WarningBlock title="Workflow frameworks add operational overhead">
        Running LangGraph with a PostgreSQL checkpointer or deploying a Temporal cluster adds
        operational complexity. Evaluate whether the reliability benefits justify the overhead
        for your specific use case. For simple agents that run in under 60 seconds and do not
        touch irreversible external state, custom checkpointing to a database may be simpler
        and more maintainable than a full workflow orchestration framework.
      </WarningBlock>

      <NoteBlock title="Start with in-process checkpointing before adopting a framework">
        Before adopting LangGraph or Temporal, implement simple in-process state checkpointing
        as described in the previous section. This gives you the core recovery capability
        quickly and helps you understand your workflow's state management requirements. Only
        migrate to a full orchestration framework once you have hit limitations in the simpler
        approach — when you need human-in-the-loop interruptions, distributed execution, or
        workflows that must survive days-long waits.
      </NoteBlock>
    </article>
  )
}
