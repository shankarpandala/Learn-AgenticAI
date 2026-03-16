import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'

export default function CodingAgentLandscape() {
  return (
    <article className="prose-content">
      <h2>Coding Agent Landscape</h2>
      <p>
        The coding agent ecosystem has grown rapidly since 2023. Today there are purpose-built
        terminal agents, IDE-integrated agents, cloud-hosted agents, and open-source research
        systems. Each product makes different trade-offs between autonomy, safety, IDE integration,
        and context size. This section surveys the major players as of early 2025.
      </p>

      <ConceptBlock term="Coding Agent vs. Copilot">
        <p>
          A <strong>copilot</strong> (GitHub Copilot's original inline completion mode, Tabnine)
          responds to the cursor position and suggests the next line or block. A
          <strong> coding agent</strong> receives a task description, autonomously reads files,
          runs commands, edits code, and verifies results in a loop — no human steering each step.
          The distinction matters: copilots augment keystrokes; agents own entire tasks.
        </p>
      </ConceptBlock>

      <h2>Major Platforms (2025)</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Product</th>
              <th className="px-4 py-3 text-left font-semibold">Maker</th>
              <th className="px-4 py-3 text-left font-semibold">Interface</th>
              <th className="px-4 py-3 text-left font-semibold">Underlying Model</th>
              <th className="px-4 py-3 text-left font-semibold">Key Differentiator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Claude Code', 'Anthropic', 'Terminal / CLI', 'Claude Opus/Sonnet', 'Full filesystem + bash, sub-agents, CLAUDE.md'],
              ['Cursor (Agent Mode)', 'Anysphere', 'VS Code fork', 'Claude / GPT-4o', 'Deep IDE integration, inline diffs, codebase index'],
              ['GitHub Copilot Workspace', 'GitHub/Microsoft', 'Browser + VS Code', 'GPT-4o', 'PR-centric workflow, issue-to-code pipeline'],
              ['Devin', 'Cognition AI', 'Browser / API', 'Proprietary', 'Full computer use, browser, isolated VM environment'],
              ['SWE-agent', 'Princeton NLP', 'CLI (open source)', 'Any LLM', 'Research benchmark tool, highly configurable'],
              ['Amazon Q Developer', 'AWS', 'VS Code / JetBrains', 'Amazon Titan', 'AWS-native, code review, security scanning'],
              ['Replit Ghostwriter', 'Replit', 'Browser IDE', 'GPT-4o / Claude', 'Cloud-native, runs code in Replit environment'],
              ['Aider', 'Community', 'Terminal (open source)', 'Any LLM', 'Git-native, repo maps, architect+editor mode'],
            ].map(([product, maker, iface, model, diff]) => (
              <tr key={product}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{product}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{maker}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{iface}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{model}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Feature Comparison</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Feature</th>
              <th className="px-4 py-3 text-center font-semibold">Claude Code</th>
              <th className="px-4 py-3 text-center font-semibold">Cursor</th>
              <th className="px-4 py-3 text-center font-semibold">Devin</th>
              <th className="px-4 py-3 text-center font-semibold">Copilot WS</th>
              <th className="px-4 py-3 text-center font-semibold">Aider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['File read/write', '✓', '✓', '✓', '✓', '✓'],
              ['Terminal / bash execution', '✓', '✓', '✓', '✗', '✓'],
              ['Web browsing', '✓ (fetch)', '✗', '✓', '✗', '✗'],
              ['Git operations', '✓', '✓', '✓', '✓', '✓'],
              ['Parallel sub-agents', '✓', '✗', '✗', '✗', '✗'],
              ['Codebase index / RAG', '✗ (grep/glob)', '✓', '✓', '✓', '✓ (repo map)'],
              ['Custom config file', '✓ (CLAUDE.md)', '✓ (.cursorrules)', '✗', '✗', '✓ (.aider.conf)'],
              ['MCP server support', '✓', '✓', '✗', '✗', '✗'],
              ['CI/CD / headless mode', '✓', '✗', '✓ (API)', '✓ (API)', '✓'],
              ['Open source', '✗', '✗', '✗', '✗', '✓'],
            ].map(([feature, ...vals]) => (
              <tr key={feature}>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{feature}</td>
                {vals.map((v, i) => (
                  <td key={i} className={`px-4 py-3 text-center font-mono text-xs ${v === '✓' ? 'text-green-600 dark:text-green-400' : v === '✗' ? 'text-red-500 dark:text-red-400' : 'text-gray-500'}`}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Product Deep-Dives</h2>

      <h3>Claude Code (Anthropic)</h3>
      <p>
        Claude Code is a terminal-first agent that ships as an npm package. It has the deepest
        tool set of any commercially available agent: read, write, edit, bash, glob, grep,
        WebFetch, and the Agent tool for spawning parallel sub-agents. The CLAUDE.md configuration
        file provides persistent project context. It excels at large, multi-file tasks in existing
        codebases. Claude Code operates directly on the host filesystem with no VM isolation by
        default — operators must enforce their own sandboxing for untrusted tasks.
      </p>

      <h3>Cursor (Agent Mode)</h3>
      <p>
        Cursor is a VS Code fork with a built-in agent mode that understands the full codebase
        through a local semantic index. Its inline diff view lets developers review and accept or
        reject changes file by file. Cursor supports <code>.cursorrules</code> for project-level
        instructions and integrates with MCP servers. It is the dominant choice for developers
        who want IDE-native agent capabilities.
      </p>

      <h3>Devin (Cognition)</h3>
      <p>
        Devin runs in an isolated virtual machine with a full browser, terminal, and development
        environment. It can clone repositories, install dependencies, browse documentation, write
        and run code, and submit pull requests — all autonomously. Devin is accessed via a web
        interface or API, making it the closest product to a "fully autonomous software engineer"
        available commercially. Its isolation model is safer for untrusted tasks than terminal
        agents that run on the host.
      </p>

      <h3>SWE-agent (Princeton NLP)</h3>
      <p>
        SWE-agent is an open-source research system designed to benchmark LLM performance on
        real GitHub issues (the SWE-bench dataset). It is highly configurable: you choose the
        model and the agent-computer interface (ACI). SWE-agent introduced several ideas later
        adopted by commercial products, including the file viewer with line numbers and the
        search-and-replace edit primitive.
      </p>

      <h3>Aider</h3>
      <p>
        Aider is an open-source terminal agent with a unique <em>repo map</em> feature: it builds
        a compact symbol-level map of the entire repository and includes it in the context window,
        giving the model a high-level understanding of structure without reading every file. Aider
        supports an architect/editor mode where one model plans changes and a second, cheaper model
        applies them.
      </p>

      <BestPracticeBlock title="Choosing the Right Tool">
        <ul>
          <li><strong>Large existing codebase, terminal workflow:</strong> Claude Code or Aider.</li>
          <li><strong>IDE-first, VS Code user:</strong> Cursor agent mode.</li>
          <li><strong>Fully autonomous, long-running tasks:</strong> Devin or Claude Code in CI.</li>
          <li><strong>Research / benchmarking:</strong> SWE-agent (open-source, configurable).</li>
          <li><strong>AWS workloads, code review:</strong> Amazon Q Developer.</li>
          <li><strong>Prototyping in a browser environment:</strong> Replit Ghostwriter.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="info" title="The Landscape Is Moving Fast">
        <p>
          Coding agent capabilities are improving weekly. Features listed as absent in this table
          may have shipped by the time you read this. Always check the current product documentation
          before making architectural decisions based on feature comparisons.
        </p>
      </NoteBlock>
    </article>
  )
}
