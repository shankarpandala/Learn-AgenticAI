import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const agentLoopNodes = [
  { id: 'user',   label: 'User Input',       type: 'external', x: 60,  y: 150 },
  { id: 'claude', label: 'Claude Model',      type: 'llm',      x: 220, y: 150 },
  { id: 'tools',  label: 'Tool Selection',    type: 'agent',    x: 380, y: 150 },
  { id: 'read',   label: 'Read/Glob/Grep',    type: 'tool',     x: 540, y: 80  },
  { id: 'bash',   label: 'Bash/Write',        type: 'tool',     x: 540, y: 150 },
  { id: 'git',    label: 'Git Operations',    type: 'tool',     x: 540, y: 220 },
  { id: 'result', label: 'Tool Results',      type: 'store',    x: 380, y: 280 },
]

const agentLoopEdges = [
  { from: 'user',   to: 'claude', label: 'prompt'    },
  { from: 'claude', to: 'tools',  label: 'plan'       },
  { from: 'tools',  to: 'read',   label: 'invoke'     },
  { from: 'tools',  to: 'bash',   label: 'invoke'     },
  { from: 'tools',  to: 'git',    label: 'invoke'     },
  { from: 'read',   to: 'result', label: 'output'     },
  { from: 'bash',   to: 'result', label: 'output'     },
  { from: 'git',    to: 'result', label: 'output'     },
  { from: 'result', to: 'claude', label: 'observe'    },
]

export default function ClaudeCodeArchitecture() {
  return (
    <div className="section-content">
      <h1>Claude Code Architecture</h1>
      <p>
        Claude Code is Anthropic's agentic AI coding assistant that runs directly in your terminal.
        Unlike browser-based AI tools, Claude Code operates with <strong>full filesystem access</strong>:
        it reads and writes files, executes shell commands, searches code with grep and glob patterns,
        manages git history, and even spawns parallel sub-agents to tackle independent subtasks
        concurrently. The model behind Claude Code is <code>claude-opus-4-6</code>, optimized for
        long-horizon reasoning over large codebases.
      </p>
      <p>
        The key architectural insight is that Claude Code is not a chatbot with file-upload support.
        It is a full <em>agent</em>: a model embedded inside a tool-execution loop that repeats until
        the task is complete or the model decides it is done. Understanding that loop is the foundation
        for using Claude Code effectively.
      </p>

      <h2>The Agent Loop</h2>
      <ArchitectureDiagram
        nodes={agentLoopNodes}
        edges={agentLoopEdges}
        width={640}
        height={320}
        title="Claude Code Agent Loop"
      />

      <ConceptBlock title="Agentic Loop">
        <p>
          Every action Claude Code takes passes through a four-phase cycle that repeats until the
          task is complete:
        </p>
        <ol>
          <li>
            <strong>Perceive</strong> — Read files, run shell commands, grep source trees, fetch
            web pages. The model builds a working picture of the codebase and environment.
          </li>
          <li>
            <strong>Reason</strong> — Given the current context (conversation history + all tool
            results so far), plan the single best next action. Claude Code thinks in terms of
            sub-goals: "I need to understand the failing test before I touch the implementation."
          </li>
          <li>
            <strong>Act</strong> — Invoke a tool. Each tool call is atomic: Read a file, run a
            bash command, write a new file, perform a targeted Edit. Tool calls are sequential by
            default; sub-agents enable parallelism.
          </li>
          <li>
            <strong>Observe</strong> — Receive the tool result and fold it back into context.
            A failed bash command, a linter warning, or a 200 OK from a test run all become
            inputs that steer the next planning step.
          </li>
        </ol>
        <p>
          The loop terminates when the model emits a plain text response without a tool call,
          signalling that the task is complete (or that it needs clarification from the user).
        </p>
      </ConceptBlock>

      <h2>Installation and Basic Usage</h2>
      <p>
        Claude Code is distributed as an npm package and requires Node 18+. After installation,
        run <code>claude</code> inside any project directory.
      </p>
      <CodeBlock language="bash">{`npm install -g @anthropic-ai/claude-code
# Run in your project
claude
# Or with a task
claude "Fix the failing tests in src/auth/"`}</CodeBlock>

      <p>
        When you pass a task string directly, Claude Code enters non-interactive (headless) mode:
        it works through the task autonomously and exits. This makes it composable with CI pipelines
        and shell scripts. Without a task string it opens an interactive REPL where you can have a
        back-and-forth conversation while Claude Code retains the full conversation context and all
        tool results.
      </p>

      <h2>The Tool System</h2>
      <p>
        Claude Code has a fixed set of built-in tools. The model cannot call arbitrary shell
        functions; it must choose from this approved list. Each tool has a well-defined input
        schema and the model must produce valid JSON tool-call arguments.
      </p>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>What it does</th>
            <th>Key parameters</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Read</code></td>
            <td>Read a file from disk (supports offset + limit for large files)</td>
            <td><code>file_path</code>, <code>offset</code>, <code>limit</code></td>
          </tr>
          <tr>
            <td><code>Write</code></td>
            <td>Overwrite or create a file with new content</td>
            <td><code>file_path</code>, <code>content</code></td>
          </tr>
          <tr>
            <td><code>Edit</code></td>
            <td>Targeted string replacement inside an existing file</td>
            <td><code>file_path</code>, <code>old_string</code>, <code>new_string</code></td>
          </tr>
          <tr>
            <td><code>Bash</code></td>
            <td>Execute an arbitrary shell command and capture stdout/stderr</td>
            <td><code>command</code>, <code>timeout</code></td>
          </tr>
          <tr>
            <td><code>Glob</code></td>
            <td>Find files matching a glob pattern, sorted by modification time</td>
            <td><code>pattern</code>, <code>path</code></td>
          </tr>
          <tr>
            <td><code>Grep</code></td>
            <td>Search file contents with ripgrep regex</td>
            <td><code>pattern</code>, <code>path</code>, <code>glob</code></td>
          </tr>
          <tr>
            <td><code>WebFetch</code></td>
            <td>Fetch a URL and extract text content for analysis</td>
            <td><code>url</code>, <code>prompt</code></td>
          </tr>
          <tr>
            <td><code>Agent</code></td>
            <td>Spawn a sub-agent with its own tool loop to handle a sub-task</td>
            <td><code>prompt</code></td>
          </tr>
          <tr>
            <td><code>TodoWrite</code></td>
            <td>Maintain a structured task list to track multi-step progress</td>
            <td><code>todos</code></td>
          </tr>
        </tbody>
      </table>
      <p>
        The <code>Edit</code> tool is the preferred way to make targeted changes because it only
        transmits the diff, keeps the rest of the file untouched, and fails loudly if
        <code>old_string</code> is not unique — which forces Claude Code to re-read the file
        before attempting a second edit rather than silently clobbering the wrong occurrence.
      </p>

      <h2>CLAUDE.md: Persistent Memory</h2>
      <p>
        Claude Code has no persistent memory between sessions beyond your conversation history.
        The <strong>CLAUDE.md</strong> file is the designed solution to this limitation. When
        Claude Code starts, it searches for <code>CLAUDE.md</code> in the project root (and
        optionally <code>~/.claude/CLAUDE.md</code> for user-wide rules). The file is prepended
        to the system prompt, giving Claude Code immediate context about:
      </p>
      <ul>
        <li>The project's purpose, tech stack, and architecture decisions</li>
        <li>Coding conventions and forbidden patterns</li>
        <li>Security or compliance constraints that must never be violated</li>
        <li>Testing requirements and how to run the test suite</li>
        <li>External services and how to reach them in development</li>
      </ul>
      <p>
        A well-crafted CLAUDE.md dramatically reduces the number of clarifying questions Claude
        Code asks and prevents it from making decisions that violate project standards. Think of
        it as an onboarding document written for an AI, not for humans.
      </p>
      <CodeBlock language="markdown" filename="CLAUDE.md">{`# Project Context
This is a FastAPI backend for a healthcare application.

## Tech Stack
- Python 3.11, FastAPI, SQLAlchemy, PostgreSQL
- Testing: pytest, pytest-asyncio

## Rules
- All database queries MUST use parameterized statements (no f-strings in SQL)
- All endpoints MUST validate request bodies with Pydantic models
- PHI fields must be tagged with # PHI comment
- Never log PHI data

## Forbidden Patterns
- No eval() or exec()
- No hardcoded credentials
- No shell=True in subprocess calls`}</CodeBlock>

      <NoteBlock type="info">
        CLAUDE.md files are hierarchical. Place a root-level CLAUDE.md for project-wide rules and
        sub-directory CLAUDE.md files for module-specific context. Claude Code merges all of them
        in order from root to the working directory. This lets you, for example, define stricter
        constraints for a <code>payments/</code> subdirectory without polluting the top-level file.
      </NoteBlock>

      <h2>Sub-Agent Architecture</h2>
      <p>
        Claude Code can spawn parallel sub-agents using the <code>Agent</code> tool. A sub-agent
        is a full, independent Claude Code instance with its own tool loop and context window.
        Sub-agents are isolated: they do not share state with the parent or with each other. The
        parent waits for all sub-agents to complete before proceeding.
      </p>
      <p>
        Sub-agents are ideal for tasks that are genuinely independent:
      </p>
      <ul>
        <li>Running the test suite in one sub-agent while refactoring a module in another</li>
        <li>Searching three different parts of a large codebase simultaneously</li>
        <li>Generating documentation for multiple modules in parallel</li>
        <li>Running linting and type-checking concurrently</li>
      </ul>
      <p>
        The parent agent collects the results of all sub-agents and synthesizes them. This
        multi-agent topology can cut wall-clock time significantly on large tasks, though it also
        multiplies token consumption because each sub-agent has its own context and tool results.
      </p>

      <PatternBlock title="Checkpoint-Verify Loop">
        <p>
          The most reliable way to use Claude Code on non-trivial tasks is to impose a
          checkpoint-verify discipline: make the smallest meaningful change, then immediately
          verify it before proceeding.
        </p>
        <ol>
          <li>
            <strong>Scope the change</strong> — Instruct Claude Code to work on one logical unit
            at a time (one function, one endpoint, one migration). Resist the temptation to ask
            for "refactor the entire auth module" in one shot.
          </li>
          <li>
            <strong>Run the tests</strong> — After each change, Claude Code should run
            <code>pytest -x</code> (or equivalent). The <code>-x</code> flag stops at the first
            failure, keeping output short and focused.
          </li>
          <li>
            <strong>Run the linter/type-checker</strong> — <code>ruff check .</code> and
            <code>mypy src/</code> catch a different class of bugs than tests. Include them in the
            verify step.
          </li>
          <li>
            <strong>Read the output</strong> — Claude Code observes the tool result. A red test
            triggers another reason-act-observe cycle focused on the failure message. A green
            result moves the task forward.
          </li>
          <li>
            <strong>Commit the checkpoint</strong> — Once green, commit. Small, green commits give
            Claude Code a safe rollback point and keep git history readable.
          </li>
        </ol>
        <p>
          This pattern prevents error accumulation. A large batch of untested changes can produce
          cascading failures that are much harder to diagnose than a single failing test in a small
          delta.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Keeping Tasks Focused and Using --verbose">
        <ul>
          <li>
            <strong>One task at a time.</strong> Claude Code performs best when each session has a
            single, clearly defined goal. Compound requests ("fix the bug, add tests, update the
            docs, and bump the version") force Claude Code to context-switch, increasing the risk
            that it misses a step or that an intermediate failure cascades into subsequent ones.
          </li>
          <li>
            <strong>Describe the desired outcome, not the steps.</strong> "The test
            <code>test_auth_token_expiry</code> must pass" is a better prompt than "change the
            token TTL to 3600 seconds." The outcome-focused prompt lets Claude Code reason about
            the problem rather than blindly executing a prescription that may be wrong.
          </li>
          <li>
            <strong>Use <code>--verbose</code> when debugging Claude Code itself.</strong> The
            <code>--verbose</code> flag prints every tool call and its result to the terminal,
            making it easy to see exactly what Claude Code read, what commands it ran, and what
            output it received. This is invaluable when Claude Code is behaving unexpectedly.
          </li>
          <li>
            <strong>Interrupt early, not late.</strong> If you see Claude Code heading in the
            wrong direction in the first few tool calls, interrupt (<code>Ctrl+C</code>) and
            clarify. Letting a wrong plan run to completion is expensive: the model will have made
            changes you need to revert, and the conversation context will be full of noise.
          </li>
          <li>
            <strong>Keep CLAUDE.md up to date.</strong> Whenever Claude Code asks a question you
            wish it already knew, add the answer to CLAUDE.md. The file should evolve as the
            project evolves.
          </li>
        </ul>
      </BestPracticeBlock>
    </div>
  )
}
