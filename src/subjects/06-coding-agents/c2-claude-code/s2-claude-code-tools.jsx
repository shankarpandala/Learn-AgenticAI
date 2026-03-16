import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ClaudeCodeTools() {
  return (
    <article className="prose-content">
      <h2>Claude Code Tools</h2>
      <p>
        Claude Code exposes a fixed set of built-in tools that define everything the agent can
        do. The model cannot call arbitrary functions — it must choose from this approved list and
        produce valid JSON arguments for each call. Understanding each tool's purpose, parameters,
        and constraints is essential for writing effective prompts and CLAUDE.md configurations.
      </p>

      <h2>Complete Tool Reference</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Tool</th>
              <th className="px-4 py-3 text-left font-semibold">Purpose</th>
              <th className="px-4 py-3 text-left font-semibold">Key Parameters</th>
              <th className="px-4 py-3 text-left font-semibold">Requires Permission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Read', 'Read file contents with optional line range', 'file_path, offset, limit', 'No'],
              ['Write', 'Create or overwrite a file completely', 'file_path, content', 'Yes (new files)'],
              ['Edit', 'Targeted string replacement in an existing file', 'file_path, old_string, new_string', 'Yes'],
              ['Bash', 'Execute an arbitrary shell command', 'command, timeout, description', 'Yes'],
              ['Glob', 'Find files matching a glob pattern', 'pattern, path', 'No'],
              ['Grep', 'Search file contents with ripgrep regex', 'pattern, path, glob, output_mode', 'No'],
              ['WebFetch', 'Fetch a URL and extract text content', 'url, prompt', 'No'],
              ['Agent', 'Spawn a parallel sub-agent with its own tool loop', 'prompt', 'No'],
              ['TodoWrite', 'Maintain a structured task list for multi-step work', 'todos', 'No'],
            ].map(([tool, purpose, params, perm]) => (
              <tr key={tool}>
                <td className="px-4 py-3 font-mono font-medium text-purple-700 dark:text-purple-300">{tool}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{purpose}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{params}</td>
                <td className={`px-4 py-3 text-xs font-semibold ${perm === 'No' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{perm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Read Tool</h2>
      <p>
        Read is the most frequently used tool. It returns file contents with line numbers, making
        it easy for the model to reference specific locations when planning an Edit. The
        <code> offset</code> and <code>limit</code> parameters let the agent read large files in
        sections to avoid filling the context window.
      </p>

      <SDKExample
        title="Read Tool — Paginated Reading of Large Files"
        tabs={{
          bash: `# Claude Code internally calls Read with these parameters:
# Read first 100 lines
# { "file_path": "/project/src/main.py", "offset": 0, "limit": 100 }

# Read lines 200-300 of a large file
# { "file_path": "/project/src/main.py", "offset": 200, "limit": 100 }

# In your prompts, you can instruct Claude Code explicitly:
claude "Read the first 50 lines of src/auth.py then explain what authenticate() does"`,
        }}
      />

      <h2>Edit Tool</h2>
      <p>
        Edit performs a targeted string replacement. It is the preferred way to modify existing
        files because it only transmits the diff, leaves unchanged lines untouched, and fails if
        <code> old_string</code> is not unique — which prevents silent corruption of the wrong
        occurrence. Claude Code must read a file before editing it; attempting to use
        <code> old_string</code> from memory without re-reading fails when the file has changed.
      </p>

      <ConceptBlock term="Edit vs. Write">
        <p>
          Use <strong>Edit</strong> when changing a specific function or block inside an existing
          file. Use <strong>Write</strong> only when creating a new file or doing a complete rewrite
          where the entire content is being replaced. Write does not verify uniqueness and will
          silently overwrite the entire file — dangerous for large files with many changes pending.
        </p>
      </ConceptBlock>

      <h2>Bash Tool</h2>
      <p>
        Bash executes an arbitrary shell command and returns stdout and stderr. It is Claude Code's
        most powerful tool and the one that requires the most care. Every command runs with your
        user's permissions on your host filesystem. Common safe uses: running tests, linters, type
        checkers, git operations, and package installs. The <code>timeout</code> parameter
        (default: 2 minutes) prevents hanging commands from blocking the agent indefinitely.
      </p>

      <SDKExample
        title="Bash Tool — Common Patterns"
        tabs={{
          bash: `# Running the test suite — Claude Code uses this pattern after edits
pytest tests/ -x --tb=short -q

# Type checking
mypy src/ --ignore-missing-imports

# Linting
ruff check . --fix

# Git operations
git diff HEAD
git log --oneline -10
git add -p  # Note: interactive git commands don't work well with Claude Code

# Package management
pip install -r requirements.txt

# Build
npm run build 2>&1 | tail -50`,
        }}
      />

      <WarningBlock title="Bash Is Unrestricted by Default">
        <p>
          Claude Code's Bash tool runs with your full user permissions. There is no sandbox or
          filesystem restriction unless you explicitly set one up (e.g., run Claude Code inside a
          Docker container). Always review what Claude Code is about to run when it requests
          permission for new bash commands during a session. Use <code>--allowedTools</code> in
          non-interactive mode to restrict which tools are available.
        </p>
      </WarningBlock>

      <h2>Grep and Glob Tools</h2>
      <p>
        Grep and Glob are the agent's navigation tools. Glob finds files by name pattern (e.g.,
        <code>**/*.test.ts</code>); Grep searches file contents with ripgrep's regex syntax.
        Both tools return results truncated to a safe size and sorted by relevance (Glob: most
        recently modified first; Grep: matching lines with file and line number).
      </p>

      <SDKExample
        title="Grep Tool Parameters"
        tabs={{
          bash: `# Find all Python files importing anthropic
# grep pattern="import anthropic" glob="*.py" output_mode="files_with_matches"

# Find function definitions
# grep pattern="^def [a-z]" path="src/" glob="*.py" output_mode="content"

# Count occurrences
# grep pattern="TODO" output_mode="count"

# Search with context lines (shows 2 lines before and after each match)
# grep pattern="authenticate" -C=2 output_mode="content"

# From the command line, test your pattern first:
rg "def authenticate" src/ -n --glob "*.py"`,
        }}
      />

      <h2>WebFetch Tool</h2>
      <p>
        WebFetch fetches a URL, converts the HTML to Markdown, and then runs a fast model against
        that content with the prompt you provide. It is useful for reading API documentation,
        looking up library changelogs, or checking a Stack Overflow answer — all without leaving
        the agent loop. The tool caches results for 15 minutes to avoid redundant fetches.
      </p>

      <h2>Agent Tool (Sub-Agents)</h2>
      <p>
        The Agent tool spawns a fully independent Claude Code instance with its own context window
        and tool loop. Sub-agents run in parallel — the parent agent waits for all spawned
        sub-agents to complete before processing their results. Sub-agents are isolated: they
        cannot communicate with each other or share state with the parent directly.
      </p>

      <SDKExample
        title="Using Sub-Agents for Parallel Work"
        tabs={{
          bash: `# From a Claude Code session, the model might plan:
# "I'll use two sub-agents in parallel:
#  1. One to run all tests and collect failures
#  2. One to search for all usages of the deprecated API"

# You can suggest this pattern explicitly:
claude "Use parallel sub-agents to: (1) run pytest and collect all failing tests, 
(2) grep for all usages of 'old_auth_method' across the codebase. 
Then report both results before making any changes."`,
        }}
      />

      <PatternBlock title="Tool Selection Strategy">
        <p>
          Claude Code chooses tools based on the current goal. A reliable pattern for complex tasks:
        </p>
        <ol>
          <li>Use <strong>Glob</strong> to find the files most likely to be relevant</li>
          <li>Use <strong>Grep</strong> to find the specific lines within those files</li>
          <li>Use <strong>Read</strong> with <code>offset</code>/<code>limit</code> to get exact context around each match</li>
          <li>Use <strong>Edit</strong> for the targeted change (never Write unless creating new)</li>
          <li>Use <strong>Bash</strong> to run tests and verify the change</li>
          <li>Use <strong>Bash</strong> again to <code>git commit</code> if green</li>
        </ol>
      </PatternBlock>

      <BestPracticeBlock title="Tool Permission Settings">
        <ul>
          <li>In non-interactive (CI) mode, use <code>--allowedTools Read,Grep,Glob,Bash</code> to restrict available tools.</li>
          <li>Use <code>--disallowedTools Write,Edit</code> for read-only analysis tasks to prevent accidental modifications.</li>
          <li>For security-sensitive environments, run Claude Code inside a Docker container with a read-only mount for the source tree and a writable mount for the output directory only.</li>
          <li>Use <code>--verbose</code> to log every tool call and result — invaluable for debugging unexpected behaviour.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="TodoWrite for Long Tasks">
        <p>
          The TodoWrite tool lets Claude Code maintain a structured checklist of pending, in-progress,
          and completed sub-tasks. For tasks with more than 3 steps, explicitly ask Claude Code to
          create and maintain a todo list. This keeps the agent on track across many tool calls and
          makes it easier to resume interrupted sessions.
        </p>
      </NoteBlock>
    </article>
  )
}
