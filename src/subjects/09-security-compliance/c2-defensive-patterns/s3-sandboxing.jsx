import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import SecurityCallout from '../../../components/content/SecurityCallout.jsx'

export default function Sandboxing() {
  return (
    <article className="prose-content">
      <h2>Sandboxing Agent Tool Execution</h2>
      <p>
        When an AI agent executes code, runs shell commands, or invokes tools that interact with
        the operating system, the potential for damage is severe: data deletion, credential theft,
        network exfiltration, or privilege escalation. Sandboxing confines tool execution to an
        isolated environment with strict resource and capability limits, so that even if the agent
        is manipulated into running malicious code, the blast radius is contained to the sandbox.
      </p>

      <SecurityCallout severity="critical" title="Never Execute Agent-Generated Code on the Host System">
        Running LLM-generated code directly on your production host — or any host with access to
        sensitive data or network resources — is one of the highest-risk actions in agentic AI.
        Always execute in a disposable, network-isolated, resource-limited sandbox. The cost of
        spinning up a sandbox is trivial compared to the cost of a breach.
      </SecurityCallout>

      <h2>E2B Cloud Sandboxes</h2>

      <ConceptBlock term="E2B Sandboxes">
        <p>
          E2B (e2b.dev) provides cloud-hosted, disposable sandbox environments designed specifically
          for AI code execution. Each sandbox is a fresh microVM with a configurable runtime
          (Python, Node.js, etc.), filesystem, and optional network access. Sandboxes are created
          on demand, execute code in isolation, and are destroyed when the session ends. E2B
          integrates directly with agent frameworks and handles the sandbox lifecycle automatically.
        </p>
      </ConceptBlock>

      <SDKExample
        title="E2B Sandbox for Agent Code Execution"
        tabs={{
          python: `import anthropic
import json
from e2b_code_interpreter import Sandbox

client = anthropic.Anthropic()

CODE_EXECUTION_TOOL = {
    "name": "execute_python",
    "description": (
        "Execute Python code in a secure, isolated sandbox environment. "
        "Use this for data analysis, calculations, and processing tasks."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "Python code to execute",
            }
        },
        "required": ["code"],
    },
}

def execute_in_sandbox(code: str) -> dict:
    """Execute code in an E2B sandbox with automatic cleanup."""
    with Sandbox() as sandbox:
        result = sandbox.run_code(code)
        return {
            "stdout": result.logs.stdout,
            "stderr": result.logs.stderr,
            "error": result.error.value if result.error else None,
            "results": [str(r) for r in result.results],
        }

def coding_agent(user_request: str) -> str:
    """Agent that executes code in E2B sandboxes."""
    messages = [{"role": "user", "content": user_request}]

    for _ in range(10):
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=4096,
            tools=[CODE_EXECUTION_TOOL],
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            return next(b.text for b in response.content if hasattr(b, "text"))

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []
            for block in response.content:
                if block.type == "tool_use" and block.name == "execute_python":
                    result = execute_in_sandbox(block.input["code"])
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result),
                    })
            messages.append({"role": "user", "content": tool_results})

    return "Max iterations reached."`,
          typescript: `import Anthropic from '@anthropic-ai/sdk'
import { Sandbox } from '@e2b/code-interpreter'

const client = new Anthropic()

const CODE_EXECUTION_TOOL: Anthropic.Tool = {
  name: 'execute_python',
  description: 'Execute Python code in a secure, isolated sandbox.',
  input_schema: {
    type: 'object',
    properties: {
      code: { type: 'string', description: 'Python code to execute' },
    },
    required: ['code'],
  },
}

async function executeInSandbox(code: string) {
  const sandbox = await Sandbox.create()
  try {
    const result = await sandbox.runCode(code)
    return {
      stdout: result.logs.stdout,
      stderr: result.logs.stderr,
      error: result.error?.value ?? null,
      results: result.results.map((r) => String(r)),
    }
  } finally {
    await sandbox.kill()
  }
}

async function codingAgent(userRequest: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userRequest }]

  for (let i = 0; i < 10; i++) {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      tools: [CODE_EXECUTION_TOOL],
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      return (response.content[0] as Anthropic.TextBlock).text
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content })
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type === 'tool_use' && block.name === 'execute_python') {
          const result = await executeInSandbox((block.input as { code: string }).code)
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) })
        }
      }
      messages.push({ role: 'user', content: toolResults })
    }
  }
  return 'Max iterations reached.'
}`,
        }}
      />

      <h2>Docker-Based Sandboxing</h2>

      <ConceptBlock term="Docker Container Sandboxes">
        <p>
          For self-hosted environments, Docker containers provide a controllable sandbox layer.
          Key security settings: run as a non-root user, drop all Linux capabilities and add back
          only those needed, use <code>--read-only</code> filesystem with a tmpfs for temporary
          files, disable network access unless required, set CPU and memory limits, and set a
          maximum execution time. Use <code>--security-opt=no-new-privileges</code> to prevent
          privilege escalation.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Docker Sandbox Wrapper for Code Execution"
        tabs={{
          python: `import subprocess
import tempfile
import os
import json
from pathlib import Path

def run_in_docker_sandbox(
    code: str,
    timeout_seconds: int = 30,
    max_memory_mb: int = 256,
) -> dict:
    """
    Execute Python code in a restricted Docker container.
    Returns stdout, stderr, and exit code.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        code_file = Path(tmpdir) / "script.py"
        code_file.write_text(code)

        docker_cmd = [
            "docker", "run",
            "--rm",                          # Remove container after exit
            "--network=none",               # No network access
            "--read-only",                   # Read-only filesystem
            "--tmpfs", "/tmp:size=64m",      # Writable temp space
            f"--memory={max_memory_mb}m",   # Memory limit
            "--memory-swap=0",              # No swap
            "--cpus=0.5",                   # CPU limit
            "--user=nobody",                # Non-root user
            "--cap-drop=ALL",               # Drop all Linux capabilities
            "--security-opt=no-new-privileges",
            "-v", f"{tmpdir}:/workspace:ro",  # Mount code as read-only
            "python:3.12-slim",
            "python", "-u", "/workspace/script.py",
        ]

        try:
            result = subprocess.run(
                docker_cmd,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
            return {
                "stdout": result.stdout[:10_000],  # Limit output size
                "stderr": result.stderr[:2_000],
                "exit_code": result.returncode,
                "timed_out": False,
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Execution timed out",
                "exit_code": -1,
                "timed_out": True,
            }`,
        }}
      />

      <h2>Principle of Least Privilege in Sandboxes</h2>

      <SDKExample
        title="Configuring Minimal Sandbox Permissions"
        tabs={{
          python: `# Sandbox permission profiles — grant only what each agent type needs

SANDBOX_PROFILES = {
    "data_analyst": {
        # Can read uploaded files, no network, no write to persistent storage
        "network": False,
        "filesystem_writes": "/tmp",  # Temp only
        "allowed_packages": ["pandas", "numpy", "matplotlib", "scipy"],
        "max_memory_mb": 512,
        "max_cpu": 1.0,
        "timeout_seconds": 60,
    },
    "web_researcher": {
        # Can make outbound HTTPS requests, no filesystem writes
        "network": True,
        "allowed_domains": ["*.wikipedia.org", "*.arxiv.org"],  # Allowlisted only
        "filesystem_writes": None,
        "max_memory_mb": 256,
        "max_cpu": 0.5,
        "timeout_seconds": 30,
    },
    "code_runner": {
        # General code execution — most restricted
        "network": False,
        "filesystem_writes": "/tmp",
        "allowed_packages": None,  # Standard library only
        "max_memory_mb": 128,
        "max_cpu": 0.25,
        "timeout_seconds": 15,
    },
}

def create_sandbox_for_agent(agent_type: str) -> dict:
    profile = SANDBOX_PROFILES.get(agent_type)
    if not profile:
        raise ValueError(f"Unknown agent type: {agent_type}. Use a defined profile.")
    return profile  # Pass to E2B or Docker sandbox initialisation`,
        }}
      />

      <WarningBlock title="Sandboxes Are Not a Silver Bullet">
        <p>
          Sandboxes contain damage but do not prevent all harm. A sandbox with network access can
          still exfiltrate data. A sandbox with filesystem write access can persist malware for
          later extraction. A sandbox that shares a host kernel with production workloads is
          vulnerable to kernel exploits (use gVisor or Kata Containers for stronger isolation).
          Layer sandboxing with allowlisting, monitoring, and rate limits for defence in depth.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Treat Every Sandbox as Compromised After Use">
        <p>
          Never reuse a sandbox session across different users or tasks. Treat each sandbox as
          potentially compromised after it runs agent-generated code, and destroy it immediately
          after use. E2B sandboxes are ephemeral by design; Docker containers should be run with
          <code>--rm</code>. Pre-create a pool of warm, clean sandboxes to avoid cold-start
          latency while still guaranteeing freshness.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="gVisor for Stronger Host Isolation">
        <p>
          Standard Docker containers share the host kernel; a kernel exploit in a container can
          affect the host. Google's gVisor (<code>runsc</code> runtime) intercepts system calls
          in user space, providing a much stronger isolation boundary. Use gVisor for agents that
          execute untrusted, user-supplied code by setting <code>--runtime=runsc</code> in your
          Docker command. Expect a modest performance overhead (10–20%) compared to standard runc.
        </p>
      </NoteBlock>
    </article>
  )
}
