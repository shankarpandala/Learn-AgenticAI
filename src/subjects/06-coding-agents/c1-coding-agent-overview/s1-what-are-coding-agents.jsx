import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

const agentNodes = [
  { id: 'task',    label: 'Developer Task',     type: 'external', x: 60,  y: 150 },
  { id: 'agent',   label: 'Coding Agent',        type: 'llm',      x: 220, y: 150 },
  { id: 'tools',   label: 'Tools',               type: 'agent',    x: 380, y: 80  },
  { id: 'code',    label: 'Codebase',            type: 'store',    x: 540, y: 80  },
  { id: 'tests',   label: 'Test Runner',         type: 'tool',     x: 540, y: 150 },
  { id: 'env',     label: 'Shell / Environment', type: 'tool',     x: 540, y: 220 },
  { id: 'output',  label: 'Verified Changes',    type: 'external', x: 700, y: 150 },
]

const agentEdges = [
  { from: 'task',   to: 'agent',  label: 'prompt'      },
  { from: 'agent',  to: 'tools',  label: 'tool calls'  },
  { from: 'tools',  to: 'code',   label: 'read/write'  },
  { from: 'tools',  to: 'tests',  label: 'run tests'   },
  { from: 'tools',  to: 'env',    label: 'execute'     },
  { from: 'code',   to: 'agent',  label: 'file content' },
  { from: 'tests',  to: 'agent',  label: 'pass/fail'   },
  { from: 'env',    to: 'agent',  label: 'stdout/stderr' },
  { from: 'agent',  to: 'output', label: 'done'        },
]

export default function WhatAreCodingAgents() {
  return (
    <article className="prose-content">
      <h2>What Are Coding Agents?</h2>
      <p>
        Coding agents are AI systems that can autonomously understand, write, modify, test, and
        debug software. Unlike autocomplete tools that suggest the next line of code, a coding
        agent takes a high-level task description and iteratively works through it — reading
        relevant files, making changes, running tests, observing results, and correcting
        mistakes — until the task is complete.
      </p>

      <ConceptBlock term="Coding Agent">
        <p>
          An LLM embedded in a tool-execution loop with access to a software development
          environment: filesystem read/write, shell execution, test runners, version control,
          and search tools. The agent perceives the codebase, reasons about the task, acts by
          invoking tools, and observes the results in a cycle that continues until the goal is
          achieved or the agent determines it needs human input.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        nodes={agentNodes}
        edges={agentEdges}
        title="Coding Agent Architecture"
      />

      <h2>What Coding Agents Can Do</h2>

      <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            category: 'Code Understanding',
            tasks: [
              'Navigate and summarise large codebases',
              'Explain what a function, module, or system does',
              'Identify dependencies and call graphs',
              'Find all usages of a symbol across a project',
            ],
          },
          {
            category: 'Code Generation',
            tasks: [
              'Implement features from natural-language descriptions',
              'Write boilerplate, scaffolding, and CRUD endpoints',
              'Generate test cases for existing code',
              'Translate code between languages or frameworks',
            ],
          },
          {
            category: 'Code Editing',
            tasks: [
              'Refactor existing code to improve structure',
              'Apply sweeping changes across many files (rename, restructure)',
              'Fix bugs identified by failing tests or error messages',
              'Apply security patches and dependency upgrades',
            ],
          },
          {
            category: 'Verification',
            tasks: [
              'Run test suites and iterate until all tests pass',
              'Execute linters and type checkers and fix warnings',
              'Validate changes against CI pipelines',
              'Check output behaviour against expected results',
            ],
          },
        ].map(({ category, tasks }) => (
          <div key={category} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{category}</h4>
            <ul className="space-y-1">
              {tasks.map((task) => (
                <li key={task} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2>Real-World Use Cases</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Use Case</th>
              <th className="px-4 py-3 text-left font-semibold">Description</th>
              <th className="px-4 py-3 text-left font-semibold">Human Involvement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Dependency upgrade', 'Update all packages to latest, fix breaking changes, make tests pass', 'Review PR'],
              ['Bug fix from issue', 'Given a GitHub issue, reproduce bug, locate root cause, fix and test', 'Review PR'],
              ['Feature implementation', 'From user story or spec, implement feature end-to-end with tests', 'Review + test'],
              ['Code review', 'Analyse incoming PRs for style, bugs, security, architecture', 'Final decision'],
              ['Test generation', 'Write unit and integration tests for untested code paths', 'Review coverage'],
              ['Documentation', 'Generate docstrings, README updates, and API docs from source', 'Review accuracy'],
              ['Codebase migration', 'Migrate from one framework, language, or DB schema to another', 'Supervise + review'],
              ['Security audit', 'Scan for vulnerabilities, OWASP issues, and suggest patches', 'Review findings'],
            ].map(([useCase, desc, human]) => (
              <tr key={useCase}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{useCase}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{desc}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{human}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>How Coding Agents Differ from Copilots</h2>
      <p>
        The distinction between a coding copilot (e.g. GitHub Copilot autocomplete) and a
        coding agent is the degree of autonomy and the scope of action:
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Dimension</th>
              <th className="px-4 py-3 text-left font-semibold">Copilot</th>
              <th className="px-4 py-3 text-left font-semibold">Coding Agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Scope of action', 'Single file, current cursor position', 'Entire repository, multiple files'],
              ['Execution', 'Suggests text; human executes', 'Reads, writes, executes autonomously'],
              ['Task granularity', 'Next line / block', 'Multi-step task (hours of work)'],
              ['Feedback loop', 'Immediate human review', 'Automated: tests, linters, CI'],
              ['Human control', 'Accept/reject each suggestion', 'Review final diff (or intermediate checkpoints)'],
              ['Context', 'Current file + open tabs', 'Full codebase + shell + web'],
            ].map(([dim, copilot, agent]) => (
              <tr key={dim}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{dim}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{copilot}</td>
                <td className="px-4 py-3 text-blue-700 dark:text-blue-300 text-sm">{agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Limitations of Coding Agents</h2>
      <p>
        Coding agents are powerful but not infallible. Understanding their failure modes helps
        you design workflows that keep humans in the loop at the right checkpoints.
      </p>
      <ul>
        <li><strong>Context limits:</strong> Very large codebases may not fit in the agent's context window, requiring retrieval strategies.</li>
        <li><strong>Hallucinated APIs:</strong> Models can confidently invent function signatures or library APIs that don't exist.</li>
        <li><strong>Cascading errors:</strong> An early wrong assumption can compound through many subsequent actions before being detected.</li>
        <li><strong>Test blindness:</strong> An agent can make tests pass by hardcoding expected values rather than fixing the underlying logic.</li>
        <li><strong>Security risks:</strong> An agent with shell access can accidentally (or through injection) run destructive commands.</li>
        <li><strong>No domain knowledge:</strong> Business requirements and architectural constraints must be explicitly provided — the agent doesn't infer them.</li>
      </ul>

      <BestPracticeBlock title="Getting the Most from Coding Agents">
        <ul>
          <li>Give agents a clear, single-objective task rather than compound instructions.</li>
          <li>Provide a good test suite — a coding agent is only as reliable as its verification loop.</li>
          <li>Use CLAUDE.md or equivalent project context files to give agents architectural knowledge upfront.</li>
          <li>Review the agent's git diff before merging, even for small tasks.</li>
          <li>Run agents in sandboxed environments for sensitive codebases.</li>
          <li>Checkpoint often: small commits after each verified change are easier to review than large diffs.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="historical" title="The Rise of Coding Agents (2023–2025)">
        <p>
          The first wave of coding agents (GitHub Copilot, 2021) focused on autocomplete.
          The second wave (Devin, SWE-agent, 2024) demonstrated agents resolving real GitHub
          issues autonomously. By 2025, coding agents are integrated into developer workflows
          as Claude Code, Cursor Agent, and Codex — capable of resolving multi-file tasks
          that previously required hours of human engineering time.
        </p>
      </NoteBlock>
    </article>
  )
}
