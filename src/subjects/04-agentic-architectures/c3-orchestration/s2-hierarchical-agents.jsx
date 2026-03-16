import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function HierarchicalAgents() {
  return (
    <article className="prose-content">
      <h2>Hierarchical Agent Systems</h2>

      <p>
        A hierarchical agent system extends the orchestrator-worker pattern by introducing
        multiple levels of orchestration. A top-level orchestrator delegates to mid-level
        orchestrators, which in turn delegate to leaf-level workers. Each level manages
        a different scope of complexity: the top level handles overall strategy, middle levels
        handle coordination within major task components, and leaf workers handle atomic
        execution tasks. This structure enables managing tasks of a scale and complexity that
        would overwhelm a single orchestration layer.
      </p>

      <ConceptBlock term="Hierarchical Agent System">
        A hierarchical agent system organizes agents in a tree structure with multiple levels
        of orchestration. Top-level orchestrators hold the broadest task context and make
        high-level decomposition decisions. Mid-level orchestrators manage subtask coordination
        within their scope. Leaf workers execute atomic, well-specified tasks. Information
        flows downward as task assignments and upward as results. No agent needs to understand
        the full scope of the task — each level only needs to understand its own layer.
      </ConceptBlock>

      <h2>When Hierarchical Systems Are Appropriate</h2>

      <h3>Task Scale</h3>
      <p>
        When a task is too large for a single orchestrator to manage coherently — the full
        context of all subtasks would overflow its context window — a hierarchical structure
        distributes the coordination burden. Each orchestrator manages only the subtasks
        within its scope rather than the full task. A large software project analysis might
        have a top-level orchestrator managing component analyses, mid-level orchestrators
        for each component, and leaf workers for individual file analyses.
      </p>

      <h3>Domain Boundaries</h3>
      <p>
        When a task crosses clear domain boundaries and each domain requires specialized
        coordination logic, hierarchical organization naturally maps to those boundaries.
        A research report task might have one mid-level orchestrator managing technical
        research (with code analysis workers and paper search workers) and another managing
        business analysis (with market data workers and competitive analysis workers).
        The top-level orchestrator coordinates between domains.
      </p>

      <h3>Reusability</h3>
      <p>
        Sub-orchestrator agents that manage well-defined subtask categories can be reused
        across different top-level tasks. A "document analysis orchestrator" that coordinates
        extraction, summarization, and entity recognition workers can be called by any
        top-level task that needs to process a document. This modularity is a key advantage
        of hierarchical over flat multi-agent designs.
      </p>

      <h2>Communication Flow in Hierarchies</h2>

      <p>
        Information in hierarchical agent systems flows in two directions:
      </p>

      <ul>
        <li>
          <strong>Downward (task assignment):</strong> Each orchestrator passes task context
          and instructions to its children. The context is scoped to the child's responsibility —
          a leaf worker does not receive the full task context, only what is needed for its subtask.
          This scoping is critical: it keeps worker context focused and prevents workers from
          making decisions above their level.
        </li>
        <li>
          <strong>Upward (result aggregation):</strong> Workers return results to their
          immediate parent orchestrator. The parent aggregates and summarizes before
          returning upward. Information is compressed and abstracted at each level: raw
          data at the leaves, summaries at mid-levels, high-level conclusions at the top.
          This compression prevents context explosion as results propagate upward.
        </li>
      </ul>

      <h2>Scope and Responsibility Management</h2>

      <p>
        A critical design principle for hierarchical systems is that each agent should have
        a clearly defined scope and should not act outside it. An agent at level 2 should not
        make decisions that belong to level 1, and should not need information from level 3
        to make its decisions. This discipline is what makes hierarchical systems manageable.
      </p>

      <p>
        Scope violations manifest as agents that "reach up" to ask for context that should have
        been provided in their task assignment, or agents that "reach down" to make decisions
        that should be delegated to sub-agents. When you observe these patterns, it is a signal
        that the hierarchy is mis-designed: the task assignment was under-specified, or the
        responsibility boundaries are unclear.
      </p>

      <h2>Depth vs. Width Trade-offs</h2>

      <h3>Deep Hierarchies (more levels)</h3>
      <p>
        More levels allow more granular specialization and smaller scopes per agent. Each
        agent is simpler and more focused. The downside is latency: every level adds at least
        one additional round-trip, and in a strictly sequential hierarchy, depth multiplies
        latency directly. Deep hierarchies also make debugging harder — understanding why
        the final output is wrong requires tracing through more levels.
      </p>

      <h3>Wide Hierarchies (more workers per level)</h3>
      <p>
        More workers per level enables more parallelism but increases the aggregation burden
        on the orchestrator at that level. An orchestrator managing 20 parallel workers must
        synthesize 20 results — and its context window must accommodate all 20 results
        simultaneously. Width is bounded by context window limits, result quality, and the
        orchestrator's capacity to coherently aggregate many inputs.
      </p>

      <p>
        In practice, 2–3 levels with 3–7 workers per level covers most use cases that
        genuinely require hierarchical organization. Deeper or wider structures should be
        motivated by specific, measured requirements rather than anticipatory design.
      </p>

      <h2>Handling Failures Across Levels</h2>

      <p>
        Failure handling in hierarchical systems must be explicitly designed at each level.
        When a leaf worker fails, its parent orchestrator must decide: retry, skip the
        subtask, or escalate the failure. When a mid-level orchestrator fails, the top-level
        orchestrator must decide whether to retry the entire sub-hierarchy or proceed with
        partial results. These decisions should be encoded as explicit policies, not left
        to ad-hoc LLM judgment.
      </p>

      <p>
        A common approach is to establish a "partial result policy" at each level: if more
        than X% of subtasks succeed, the orchestrator synthesizes available results and
        clearly marks missing components in its output. If fewer than X% succeed, it returns
        an error to its parent. The parent then applies the same policy. This makes failure
        handling predictable and auditable.
      </p>

      <PatternBlock
        name="Two-Level Hierarchy as Default"
        category="Hierarchical Design"
        description="Most tasks that require hierarchical organization can be handled with two levels: a single top-level orchestrator and a set of specialized workers. Before adding a third level, verify with data that a two-level hierarchy genuinely fails to meet your requirements. Third levels add significant complexity and latency overhead that is rarely justified."
        when={[
          "Tasks that decompose into two or three major domains, each requiring multiple workers",
          "Systems where sub-orchestrators are reusable modules called from multiple top-level tasks",
          "Workflows with scope too large for a single orchestrator's context window"
        ]}
        avoid={[
          "Adding levels to model organizational hierarchy rather than task hierarchy",
          "Hierarchies deeper than 3 levels without explicit performance justification",
          "Creating mid-level orchestrators that do not genuinely aggregate or route"
        ]}
      />

      <BestPracticeBlock title="Give each orchestrator a unique, descriptive name and role">
        In a hierarchical system, every orchestrator should have a distinct name (e.g.,
        "research-coordinator", "code-analysis-orchestrator") and a clearly documented
        scope. These names should appear in your logs and traces. When debugging, you need
        to immediately understand which level of the hierarchy produced a given log entry
        and what that agent was responsible for. Ambiguous agent naming in hierarchical
        systems makes debugging exponentially harder.
      </BestPracticeBlock>

      <WarningBlock title="Hierarchical systems have multiplicative latency">
        In a strictly sequential hierarchy with 3 levels and 3 agents per level, the minimum
        task latency is the sum of 9 agent calls in series. Each LLM call adds seconds of
        latency. For interactive applications, the accumulated latency of a deep sequential
        hierarchy may be unacceptable. Use asynchronous parallel execution wherever possible
        within each level, and consider whether a shallower architecture with more parallelism
        at each level can achieve the same results with lower latency.
      </WarningBlock>

      <NoteBlock title="Track task IDs across the hierarchy">
        Every task assignment in a hierarchical system should carry a task ID that links it
        to the original user request. When a top-level orchestrator creates sub-tasks, those
        sub-tasks should carry the parent task ID plus a sub-task identifier (e.g.,
        "task_001.research.file_analysis_3"). This allows you to reconstruct the full
        execution tree from logs when debugging failures, and enables cost attribution by
        user request rather than by individual API call.
      </NoteBlock>
    </article>
  )
}
