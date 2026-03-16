import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'

export default function TypesOfMemory() {
  return (
    <article className="prose-content">
      <p>
        Memory is one of the most important — and most misunderstood — aspects of building AI
        agents. Without memory, every interaction starts from scratch. With the right memory
        architecture, agents can accumulate knowledge, learn from past mistakes, and maintain
        coherent context across long-running tasks. Understanding the different types of memory
        available to an agent is the first step to designing systems that are both capable and
        efficient.
      </p>

      <p>
        Cognitive scientists distinguish several forms of human memory. LLM agent systems map
        onto these categories remarkably well, and using the human analogy is one of the clearest
        ways to reason about what information lives where and how long it persists.
      </p>

      <ConceptBlock term="Sensory Memory (Context Window)">
        Sensory memory is the immediate, raw input an agent is currently processing. In LLM
        agents this corresponds directly to the context window — everything in the current
        conversation: the system prompt, user messages, assistant turns, tool calls, and tool
        results. Like sensory memory in humans, it is large in detail but short in duration.
        When the conversation ends or the context window fills, this information is gone unless
        deliberately saved elsewhere. The context window is where all active reasoning happens.
      </ConceptBlock>

      <ConceptBlock term="Short-Term / Working Memory">
        Working memory is the scratchpad for active computation. Humans hold roughly 7 items
        in working memory at once while solving problems. LLM agents simulate working memory
        through structured data they maintain in-context: variables extracted from the
        conversation, intermediate results accumulated during a task, a running plan or checklist.
        Working memory is still bound by the context window, but it is the intentional,
        structured portion — data the agent is actively tracking rather than passively reading.
      </ConceptBlock>

      <ConceptBlock term="Long-Term Memory (Persistent Store)">
        Long-term memory persists beyond a single session or context window. In agent systems
        this is implemented as an external storage layer: a relational database, a vector store,
        a key-value store, or a file system. The agent writes to long-term memory when it learns
        something worth keeping, and retrieves from it when it needs information that is not in
        the current context. Long-term memory enables agents to learn from experience, remember
        user preferences, and share knowledge across instances.
      </ConceptBlock>

      <ConceptBlock term="Episodic Memory (Past Experiences)">
        Episodic memory is the record of specific past experiences — not just facts, but sequences
        of events with context. Humans remember "the time I tried approach X and it failed because
        of Y." Agent systems implement episodic memory by storing summaries of past agent runs:
        what task was attempted, what steps were taken, what succeeded and what failed. These
        records can be retrieved as examples when similar tasks arise, providing the agent with
        situational experience rather than just declarative knowledge.
      </ConceptBlock>

      <h2>The Memory Hierarchy in Practice</h2>

      <p>
        These four memory types form a hierarchy ordered by speed, capacity, and persistence.
        Understanding the tradeoffs of each determines which type to use for a given piece of
        information.
      </p>

      <h3>Speed vs. Capacity Tradeoff</h3>
      <p>
        The context window (sensory memory) is instantly accessible — the model reads it with
        zero latency. But it is small (200k tokens for Claude) and temporary. A vector database
        (long-term memory) can store millions of documents but requires an embedding and retrieval
        step that adds latency. The right memory architecture puts frequently-needed, session-
        critical information in context and delegates the long tail to persistent stores.
      </p>

      <h3>What Belongs in Each Tier</h3>

      <table>
        <thead>
          <tr>
            <th>Memory Type</th>
            <th>Storage Location</th>
            <th>Typical Contents</th>
            <th>Persistence</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sensory</td>
            <td>Context window (messages array)</td>
            <td>Current conversation, tool results, active instructions</td>
            <td>Session only</td>
          </tr>
          <tr>
            <td>Working</td>
            <td>Structured fields in context</td>
            <td>Current plan, extracted variables, running totals</td>
            <td>Session only</td>
          </tr>
          <tr>
            <td>Long-term</td>
            <td>Database, vector store, files</td>
            <td>User preferences, domain facts, learned procedures</td>
            <td>Permanent</td>
          </tr>
          <tr>
            <td>Episodic</td>
            <td>Database with structured summaries</td>
            <td>Past task logs, success/failure records, example solutions</td>
            <td>Permanent</td>
          </tr>
        </tbody>
      </table>

      <h2>Mapping to Human Memory: An Analogy</h2>

      <p>
        Consider a doctor seeing a patient. Their sensory memory is what they are actively
        observing right now — the patient's current symptoms and what the patient is saying.
        Their working memory holds the differential diagnosis they are building in their head
        as the conversation unfolds. Their long-term memory contains medical knowledge from
        years of study. Their episodic memory holds the recollection: "I treated a patient with
        similar symptoms three years ago and the key was the rash pattern."
      </p>

      <p>
        An AI agent diagnosing a software bug operates the same way. Sensory: the current error
        log and conversation. Working: the list of hypotheses it is currently evaluating.
        Long-term: a vector store of known bug patterns in the codebase. Episodic: a record of
        how a similar bug was resolved last month.
      </p>

      <PatternBlock
        name="Tiered Memory Architecture"
        category="Memory Design"
        description="Design agent memory as explicit tiers: immediate context for active reasoning, working memory structures for in-progress state, a persistent store for durable facts, and an episodic log for past runs. Each tier has a different access pattern, cost, and latency profile."
        when={[
          "Agent needs to maintain state across multiple turns in a session",
          "Agent needs to recall information from previous sessions",
          "Context window would overflow without offloading older information",
          "Agent needs to learn from past task outcomes"
        ]}
        avoid={[
          "Dumping all available information into the context window",
          "Using only in-context memory for long-running agents",
          "Storing ephemeral session data in permanent storage unnecessarily"
        ]}
      />

      <h2>Memory and Agent Capability</h2>

      <p>
        The sophistication of an agent's memory architecture is a major determinant of what tasks
        it can accomplish. A memoryless agent — one that starts fresh every time — can only do
        tasks completable within a single context window. An agent with long-term memory can
        build expertise over time. An agent with episodic memory can improve its strategies based
        on what has and hasn't worked before.
      </p>

      <BestPracticeBlock title="Match Memory Architecture to Task Requirements">
        Before designing memory, define what the agent needs to remember and for how long.
        A customer support agent needs to remember the current ticket (sensory), the user's
        account details (long-term retrieval), and past interactions with this user (episodic).
        A one-shot code generation agent needs almost no memory beyond the current prompt. Over-
        engineering memory adds complexity without benefit. Under-engineering it leaves the agent
        unable to complete its tasks.
      </BestPracticeBlock>

      <NoteBlock title="Context window size does not eliminate the need for external memory">
        Even with very large context windows (200k+ tokens), external memory remains valuable.
        Retrieving only the 5 most relevant documents is almost always better than stuffing 500
        documents into context. Semantic retrieval surfaces what is relevant; raw context stuffing
        creates noise that degrades model performance. Use large context windows for depth of
        reasoning in a session, not as a substitute for proper memory architecture.
      </NoteBlock>
    </article>
  )
}
