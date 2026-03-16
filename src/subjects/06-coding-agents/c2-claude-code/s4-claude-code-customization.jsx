import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'

export default function ClaudeCodeCustomization() {
  return (
    <article className="prose-content">
      <h2>Customizing Claude Code</h2>
      <p>
        Claude Code is highly configurable without any code changes. Four mechanisms cover most
        customization needs: the CLAUDE.md context file for project knowledge, custom slash
        commands for repeatable workflows, hooks for pre- and post-tool side effects, and MCP
        server integration for additional tools. Together they let you turn a general-purpose
        coding agent into a specialist that understands your stack, follows your conventions, and
        integrates with your toolchain.
      </p>

      <h2>CLAUDE.md — Persistent Project Context</h2>
      <p>
        CLAUDE.md is prepended to the system prompt every time Claude Code starts in a project.
        It is the primary mechanism for giving Claude Code persistent knowledge about your
        codebase without burning context window on repeated instructions.
      </p>

      <ConceptBlock term="CLAUDE.md Hierarchy">
        <p>
          Claude Code merges CLAUDE.md files in order from the global user config
          (<code>~/.claude/CLAUDE.md</code>) through the project root to the current working
          directory. This lets you define user-wide preferences (tone, IDE habits) at the global
          level, project-wide rules at the root, and module-specific constraints in subdirectories.
          All files are merged; more-specific files do not override less-specific ones — they add
          to them.
        </p>
      </ConceptBlock>

      <SDKExample
        title="CLAUDE.md — Comprehensive Example"
        tabs={{
          bash: `# CLAUDE.md
# Project Context

This is a FastAPI backend for a HIPAA-regulated healthcare application.
All contributors (human and AI) must follow HIPAA technical safeguard requirements.

## Tech Stack
- Python 3.12, FastAPI 0.111, SQLAlchemy 2.0, PostgreSQL 15
- Testing: pytest, pytest-asyncio, httpx (for async test client)
- Linting: ruff (replaces flake8 + isort + black), mypy for type checking

## Running the Project
bash
# Start dev server
uvicorn app.main:app --reload

# Run tests
pytest tests/ -x --tb=short

# Type check + lint
mypy src/ && ruff check .


## Coding Conventions
- All endpoints must have Pydantic request/response models
- All database queries MUST use parameterized statements — never f-strings in SQL
- Async functions preferred for all I/O operations
- Type hints required on all public functions and methods

## PHI (Protected Health Information) Rules
- Fields containing PHI must have a # PHI comment on the same line
- Never log PHI fields — use log_safe_user(user) helper instead
- PHI must be encrypted at rest using the encrypt_phi() utility
- Never include PHI in error messages or exception strings

## Forbidden Patterns
- No eval() or exec()
- No hardcoded credentials — use settings.py which reads from environment
- No shell=True in subprocess calls
- No print() in production code — use structlog logger

## Git Workflow
- Branch naming: feature/TICKET-description or fix/TICKET-description
- Commit messages: conventional commits format (feat:, fix:, refactor:, test:)
- Always run tests before committing`,
          yaml: `# .claude/settings.json — Claude Code runtime settings
{
  "permissions": {
    "allow": [
      "Bash(pytest:*)",
      "Bash(ruff:*)",
      "Bash(mypy:*)",
      "Bash(git:*)",
      "Bash(pip:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(curl * | bash:*)"
    ]
  },
  "env": {
    "PYTHONPATH": "src"
  }
}`,
        }}
      />

      <h2>Custom Slash Commands</h2>
      <p>
        Custom slash commands are Markdown files stored in <code>.claude/commands/</code>. Each
        file defines a reusable prompt that appears as a <code>/command-name</code> in the Claude
        Code REPL. Commands can include the <code>$ARGUMENTS</code> placeholder for dynamic input
        and <code>$SELECTION</code> for selected text.
      </p>

      <SDKExample
        title="Custom Slash Command Examples"
        tabs={{
          bash: `# .claude/commands/review-pr.md
Review the git diff since the last commit for this project.
Check for:
1. Security issues (SQL injection, hardcoded credentials, PHI exposure)
2. Missing type hints on public functions
3. Missing tests for new functions
4. Violations of the CLAUDE.md conventions

Output a markdown checklist with PASS/FAIL for each category.
For each FAIL, quote the specific line and explain the issue.

---

# .claude/commands/add-tests.md
Write pytest tests for the function or class: $ARGUMENTS

Requirements:
- Use pytest-asyncio for async functions
- Cover the happy path, edge cases, and error conditions  
- Mock external dependencies (database, HTTP calls) using pytest-mock
- Use factories from tests/factories.py if they exist
- Run the new tests and fix any failures before finishing

---

# .claude/commands/explain.md
Explain $ARGUMENTS in the context of this codebase.
Include: what it does, why it exists, how it's called, and any gotchas.
Be concise — target a developer new to this project.`,
        }}
      />

      <h2>Hooks</h2>
      <p>
        Hooks are shell commands that run automatically at specific points in the Claude Code tool
        lifecycle. They are defined in <code>.claude/settings.json</code> and fire without
        requiring a tool call from the model. Use hooks for logging, notifications, automatic
        formatting, or enforcing constraints the model might forget.
      </p>

      <SDKExample
        title="Hook Configuration"
        tabs={{
          yaml: `// .claude/settings.json — hooks configuration
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[HOOK] Running bash: $CLAUDE_TOOL_INPUT\" >> /tmp/claude-audit.log"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "ruff format $CLAUDE_TOOL_OUTPUT_FILE 2>/dev/null || true"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Task complete'"
          }
        ]
      }
    ]
  }
}`,
          bash: `# Available hook environment variables:
# $CLAUDE_TOOL_NAME       — name of the tool being called (e.g., "Edit")
# $CLAUDE_TOOL_INPUT      — JSON-encoded tool input parameters
# $CLAUDE_TOOL_OUTPUT     — tool result (PostToolUse only)
# $CLAUDE_TOOL_OUTPUT_FILE — path of file written (Write/Edit PostToolUse only)
# $CLAUDE_SESSION_ID      — unique session identifier

# Example: Auto-run type checker after any Python file edit
# PostToolUse hook for Edit matcher:
# command: "if echo '$CLAUDE_TOOL_INPUT' | grep -q '.py'; then mypy $CLAUDE_TOOL_OUTPUT_FILE --ignore-missing-imports 2>&1 | head -20; fi"`,
        }}
      />

      <h2>MCP Server Integration</h2>
      <p>
        Model Context Protocol (MCP) servers extend Claude Code with additional tools beyond the
        built-in set. An MCP server is a process that exposes a set of tools via a JSON-RPC
        interface. Claude Code discovers MCP servers from its configuration and makes their tools
        available alongside the built-in tools.
      </p>

      <SDKExample
        title="MCP Server Configuration"
        tabs={{
          yaml: `// ~/.claude/claude_desktop_config.json — global MCP server config
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/mydb"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/project"]
    }
  }
}`,
          bash: `# Project-level MCP config: .mcp.json in project root
# This overrides or extends the global config for this project only

# List available MCP servers in current session
claude mcp list

# Add a new MCP server
claude mcp add my-server --command "python" --args "-m my_mcp_server"

# Remove an MCP server
claude mcp remove my-server

# Useful MCP servers for coding agents:
# @modelcontextprotocol/server-postgres  — query your database directly
# @modelcontextprotocol/server-github    — create PRs, read issues
# @modelcontextprotocol/server-slack     — post notifications
# @modelcontextprotocol/server-brave-search — web search`,
        }}
      />

      <PatternBlock title="Layered Customization Strategy">
        <p>
          Combine the four customization mechanisms for maximum effect:
        </p>
        <ol>
          <li><strong>CLAUDE.md</strong> — Project knowledge that every session needs: stack, conventions, forbidden patterns, how to run tests.</li>
          <li><strong>Slash commands</strong> — Repeatable workflows: <code>/review-pr</code>, <code>/add-tests</code>, <code>/explain</code>, <code>/deploy</code>.</li>
          <li><strong>Hooks</strong> — Automatic enforcement: run formatter after every edit, log every bash command, notify on completion.</li>
          <li><strong>MCP servers</strong> — External integrations: database queries, GitHub API, internal tooling APIs.</li>
        </ol>
      </PatternBlock>

      <BestPracticeBlock title="CLAUDE.md Maintenance">
        <ul>
          <li>Treat CLAUDE.md as a living document — update it whenever Claude Code asks a question you wish it already knew.</li>
          <li>Keep CLAUDE.md under version control so the whole team benefits from improvements.</li>
          <li>Measure the before/after: count how many clarifying questions Claude Code asks per session. A well-maintained CLAUDE.md should reduce this to near zero for routine tasks.</li>
          <li>Separate "must never do" rules from "prefer to do" conventions — make constraints explicit and unambiguous.</li>
          <li>Include exact commands (copy-pasteable) for running tests, linting, and building — the model should never have to guess.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="settings.json vs CLAUDE.md">
        <p>
          CLAUDE.md is for prose instructions, conventions, and domain knowledge that the model
          reads and reasons about. <code>settings.json</code> is for runtime configuration:
          allowed tools, denied commands, environment variables, and hooks. Keep them separate —
          do not put JSON in CLAUDE.md or conversational instructions in settings.json.
        </p>
      </NoteBlock>
    </article>
  )
}
