import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function ADRsWithAI() {
  return (
    <article className="prose-content">
      <h1>ADRs with AI</h1>

      <p>
        Architecture Decision Records (ADRs) are short documents that capture a significant architectural
        decision: the context that prompted it, the options considered, the decision made, and the
        consequences. They are one of the most valuable artefacts in a long-lived codebase — and one
        of the most consistently neglected, because writing them well takes time and discipline.
      </p>

      <p>
        Claude Code dramatically lowers the cost of maintaining ADRs. It can draft an ADR from a
        conversation about a decision, extract implicit decisions from existing code, keep ADRs fresh
        as the codebase evolves, and cross-reference ADRs against implementation to detect when
        reality has drifted from the documented decision.
      </p>

      <ConceptBlock title="Why ADRs Matter for AI-Augmented Engineering">
        ADRs serve a double purpose in a Vibe Engineering context. First, they are historical records
        for human engineers — understanding why a decision was made is essential before reversing it.
        Second, they are context for Claude. When ADRs are referenced in CLAUDE.md or included in
        Claude sessions, they prevent Claude from suggesting architectural changes that contradict
        decisions the team deliberately made. An ADR saying "we chose PostgreSQL over MongoDB because
        of ACID transaction requirements" stops Claude from suggesting a MongoDB migration to improve
        write performance.
      </ConceptBlock>

      <h2>Generating an ADR with Claude</h2>

      <p>
        The most common ADR workflow is: the team makes a decision in a meeting or async discussion,
        then never writes it down because someone has to "write the ADR" and it keeps getting
        deprioritised. Claude can turn a rough description of a decision into a well-structured ADR
        in minutes.
      </p>

      <SDKExample
        title="ADR Generation from Decision Notes"
        tabs={[
          {
            label: "prompt",
            language: "text",
            filename: "Claude Code session",
            code: `Generate an Architecture Decision Record from the following decision notes.
Use the MADR format (Markdown Architectural Decision Records).

Decision notes:
"We decided to use React Query (TanStack Query) instead of Redux for server state
management. Main reasons: Redux was being used only for API data caching, not for
genuinely shared client state. Redux required too much boilerplate. React Query
gives us cache invalidation, background refetching, and optimistic updates out of
the box. The team was already familiar with it. Downside: we'll need to migrate
existing Redux slices that were doing API calls."

Also include:
- Consequences (positive and negative)
- What we are NOT deciding (scope)
- How this decision affects CLAUDE.md constraints`,
          },
          {
            label: "output",
            language: "markdown",
            filename: "docs/adrs/ADR-012-react-query-over-redux.md",
            code: `# ADR-012: Use React Query for Server State Management

## Status
Accepted

## Date
2025-03-15

## Context
The application uses Redux for state management. Analysis revealed that approximately
80% of our Redux slices exist solely to cache API responses — not to manage shared
client-side state. This pattern required significant boilerplate (action creators,
reducers, selectors, thunks) for each endpoint and made cache invalidation logic
complex and error-prone.

Server state (data that originates on the server) has different requirements from
client state (UI state, form state, user preferences). Mixing them in a single store
creates accidental complexity.

## Decision
We will use TanStack Query (React Query) v5 for all server state management.
Redux will be retained only for genuinely shared client state (currently: user
preferences, UI theme, active modal state).

## Options Considered

### Option A: Continue with Redux + RTK Query
- Pros: No migration cost; team already knows it; RTK Query improves on raw Redux
- Cons: Still more boilerplate than React Query; less community momentum

### Option B: React Query (chosen)
- Pros: Purpose-built for server state; excellent DX; background refetching,
  cache invalidation, optimistic updates built-in; strong ecosystem
- Cons: Migration cost for existing Redux API slices; two state libraries in codebase
  during migration period

### Option C: SWR
- Pros: Simpler API than React Query; smaller bundle
- Cons: Fewer features; less mature ecosystem; team less familiar

## Consequences

### Positive
- Eliminates ~60% of Redux boilerplate
- Background refetching keeps data fresh automatically
- Cache invalidation is declarative (queryClient.invalidateQueries)
- Optimistic updates for mutations without manual rollback logic

### Negative
- Migration effort: ~15 Redux slices need conversion (estimated 3 sprints)
- During migration: two state management patterns coexist
- Team must learn React Query patterns and mental model

## What This Decision Does NOT Cover
- Client state management (Redux remains for this)
- WebSocket / real-time data (separate ADR-013)
- State persistence (Redux Persist — separate evaluation needed)

## CLAUDE.md Impact
Add to CLAUDE.md:

## State Management
- Server state: React Query (TanStack Query v5) — use useQuery, useMutation
- Client state: Redux Toolkit — use createSlice, useSelector, useDispatch
- Do NOT use Redux for API calls — this is a React Query concern
- Do NOT use React Query for client-only state — this is a Redux concern
`,
          },
        ]}
      />

      <h2>Extracting Implicit ADRs from Existing Code</h2>

      <p>
        Most codebases contain dozens of undocumented architectural decisions — choices made years ago
        that are now structural constraints. Claude can scan code and surface these implicit decisions
        so they can be documented before someone unknowingly reverses them.
      </p>

      <CodeBlock language="text" filename="Implicit Decision Extraction Prompt">
{`Scan the codebase and identify architectural decisions that appear to have been made
but are not documented in docs/adrs/.

For each implicit decision you find:
1. State what decision appears to have been made
2. Cite the evidence in the code (file paths and line numbers)
3. Estimate how significant reversing this decision would be (low/medium/high)
4. Draft a one-sentence ADR title I can use to document it

Focus on: technology choices, integration patterns, data model constraints,
authentication approaches, error handling patterns, logging conventions.`}
      </CodeBlock>

      <h2>Keeping ADRs Current</h2>

      <p>
        ADRs have a staleness problem: decisions change, implementations evolve, but the documents
        stay behind. Claude can perform periodic freshness checks — comparing ADR content against
        current code to detect when reality has drifted from the documented decision.
      </p>

      <PatternBlock title="ADR Freshness Check">
        Run this check quarterly or before major refactoring work. For each ADR, Claude reads the
        document and the code it describes, then reports: (1) Is the implementation consistent with
        the ADR? (2) Has the decision been partially reversed? (3) Are there new technologies in use
        that the ADR's options section did not consider? (4) Does the ADR's CLAUDE.md section still
        match the current CLAUDE.md?
        <br /><br />
        ADRs that no longer reflect reality should be marked "Superseded" with a reference to the
        new ADR, not deleted — the history of why decisions were made and changed is itself valuable.
      </PatternBlock>

      <CodeBlock language="bash" filename="ADR Freshness Check (Claude Slash Command)">
{`# .claude/commands/check-adrs.md
Check whether the following ADRs are still accurately reflected in the codebase.

For each ADR in docs/adrs/:
1. Read the ADR
2. Find the relevant code it describes
3. Check whether the implementation matches the decision
4. Report: CURRENT | DRIFTED | SUPERSEDED

For any DRIFTED ADR, describe specifically what has changed and draft
a brief update or a new "superseding" ADR.`}
      </CodeBlock>

      <h2>ADR Templates in CLAUDE.md</h2>

      <p>
        Standardising your ADR format in CLAUDE.md ensures that every AI-generated ADR follows the
        same structure — which matters when you have dozens of them and engineers need to scan them
        quickly. It also means any engineer can ask Claude to "write an ADR for this decision" and
        get a consistently formatted result.
      </p>

      <CodeBlock language="markdown" filename="CLAUDE.md (ADR Section)">
{`## Architecture Decision Records

ADRs live in docs/adrs/. Naming: ADR-{NNN}-{slug}.md

### ADR Format (MADR)
markdown
# ADR-{NNN}: {Title}

## Status
{Proposed | Accepted | Superseded by ADR-NNN | Deprecated}

## Date
{YYYY-MM-DD}

## Context
{What situation prompted this decision?}

## Decision
{What was decided?}

## Options Considered
{Brief summary of alternatives evaluated}

## Consequences
### Positive
### Negative

## CLAUDE.md Impact
{What rules should be added to CLAUDE.md based on this decision?}


### When to write an ADR
- Choosing between two or more viable technologies
- Establishing a pattern that will be followed across the codebase
- Reversing a previous architectural decision
- Making a decision with significant future consequences that is not obvious`}
      </CodeBlock>

      <BestPracticeBlock title="Reference ADRs in PR Descriptions">
        When a PR implements a feature that was guided by an ADR, reference the ADR in the PR
        description. This creates a bidirectional link: the ADR explains why, the PR shows how.
        When Claude generates PR descriptions (as covered in the code review chapter), include
        ADR references in the PR description template so Claude includes them automatically.
      </BestPracticeBlock>

      <NoteBlock type="tip" title="ADRs as Claude Context">
        The highest-value use of ADRs in Vibe Engineering is as context for Claude. When starting
        a Claude session for a significant feature, include the relevant ADRs in the context:
        "Before implementing, read docs/adrs/ADR-003, ADR-007, and ADR-012. These constrain the
        architectural choices you may make." This prevents Claude from suggesting architecturally
        sound but locally wrong implementations — solutions that would be good in a greenfield
        project but contradict decisions your team made deliberately.
      </NoteBlock>
    </article>
  )
}
