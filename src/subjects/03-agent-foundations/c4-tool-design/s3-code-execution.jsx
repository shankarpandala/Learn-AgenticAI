import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'

export default function CodeExecutionTools() {
  return (
    <article className="prose-content">
      <p>
        Code execution tools give agents the ability to write and run code dynamically —
        transforming the agent from a system that reasons about computation to one that actually
        performs it. An agent with a code execution tool can compute exact answers rather than
        approximating them, verify its own outputs, and automate tasks that would require
        many fragile string-manipulation steps. The challenge is doing this safely. Arbitrary
        code execution is one of the most powerful and dangerous capabilities you can give
        an agent.
      </p>

      <h2>Why Code Execution Changes Everything</h2>

      <p>
        Language models are not reliable calculators. Ask Claude to compute the 47th Fibonacci
        number and it may hallucinate. Give it a Python execution tool and it will write code,
        run it, and return the exact answer. The same applies to data analysis, string parsing,
        file transformation, API request formatting, and hundreds of other tasks that require
        precise computation rather than approximate reasoning.
      </p>

      <ConceptBlock term="Sandboxed Code Execution">
        Sandboxed code execution runs agent-generated code in an isolated environment with
        restricted access to the host system. The sandbox prevents the executed code from
        reading arbitrary files, making network requests, spawning processes, or consuming
        unbounded resources. Without sandboxing, a code execution tool is effectively a remote
        code execution vulnerability — the model (or a prompt injection attack) could run
        arbitrary commands on your infrastructure.
      </ConceptBlock>

      <h2>Python subprocess: The Naive Approach</h2>

      <p>
        The simplest implementation uses Python's subprocess module to run code in a child
        process. This approach is easy to implement and works for trusted code, but provides
        limited isolation. Use it only for internal tools where you trust the code source.
      </p>

      <SDKExample
        title="Basic Code Execution with subprocess"
        tabs={{
          python: `import subprocess
import json
import tempfile
import os
from pathlib import Path

def execute_python(code: str, timeout: int = 10, max_output_bytes: int = 50_000) -> str:
    """
    Execute Python code in a subprocess with timeout and output limits.
    Returns structured output the LLM can reason about.

    WARNING: This does NOT provide strong sandboxing. Use only for trusted code.
    """
    # Write code to a temp file to avoid shell injection
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.py', delete=False, dir='/tmp'
    ) as f:
        f.write(code)
        temp_path = f.name

    try:
        result = subprocess.run(
            ["python3", temp_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            # Restrict environment variables available to subprocess
            env={
                "PATH": "/usr/bin:/usr/local/bin",
                "PYTHONPATH": "",
                "HOME": "/tmp"
            }
        )

        stdout = result.stdout
        stderr = result.stderr

        # Enforce output size limits
        if len(stdout) > max_output_bytes:
            stdout = stdout[:max_output_bytes] + f"\\n[OUTPUT TRUNCATED: {len(result.stdout)} total bytes]"

        return json.dumps({
            "success": result.returncode == 0,
            "stdout": stdout,
            "stderr": stderr[:2000] if stderr else "",
            "return_code": result.returncode
        })

    except subprocess.TimeoutExpired:
        return json.dumps({
            "error": "TIMEOUT",
            "message": f"Code execution exceeded {timeout} second timeout.",
            "suggestion": "Optimize the code or break it into smaller steps."
        })
    except Exception as e:
        return json.dumps({
            "error": "EXECUTION_ERROR",
            "message": str(e)
        })
    finally:
        Path(temp_path).unlink(missing_ok=True)

# Tool schema
PYTHON_EXEC_TOOL = {
    "name": "execute_python",
    "description": (
        "Execute Python code and return the output. "
        "Use for calculations, data transformations, file parsing, or any task requiring "
        "precise computation. stdout is captured and returned. "
        "Execution is limited to 10 seconds. "
        "Available libraries: standard library + numpy, pandas, requests."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "Python code to execute. Use print() to produce output."
            }
        },
        "required": ["code"]
    }
}`
        }}
      />

      <h2>E2B: Cloud Sandboxed Execution</h2>

      <p>
        E2B (e2b.dev) provides cloud-hosted, fully sandboxed code execution environments.
        Each execution runs in an isolated microVM with no access to your infrastructure.
        This is the recommended approach for production agents that run untrusted or
        model-generated code.
      </p>

      <SDKExample
        title="Sandboxed Code Execution with E2B"
        tabs={{
          python: `# pip install e2b-code-interpreter anthropic
import json
import os
from e2b_code_interpreter import Sandbox
from anthropic import Anthropic

client = Anthropic()

def execute_python_e2b(code: str, sandbox_id: str = None) -> str:
    """
    Execute code in an E2B cloud sandbox.
    Each sandbox is a fully isolated microVM — safe for model-generated code.
    """
    try:
        # Reuse sandbox across multiple calls for efficiency
        with Sandbox(api_key=os.environ["E2B_API_KEY"]) as sandbox:
            execution = sandbox.run_code(code)

            output_parts = []
            for log in execution.logs.stdout:
                output_parts.append(log)

            error_parts = []
            for log in execution.logs.stderr:
                error_parts.append(log)

            return json.dumps({
                "success": not execution.error,
                "output": "\\n".join(output_parts),
                "error": execution.error.value if execution.error else None,
                "stderr": "\\n".join(error_parts)
            })

    except Exception as e:
        return json.dumps({
            "error": "SANDBOX_ERROR",
            "message": f"Failed to execute in sandbox: {str(e)}"
        })

def run_code_agent(task: str) -> str:
    """Agent that uses E2B for safe code execution."""
    tools = [
        {
            "name": "execute_python",
            "description": (
                "Execute Python code in a secure sandbox. "
                "The sandbox has Python 3.11, numpy, pandas, matplotlib, and scikit-learn. "
                "Use print() to show output. Files written persist for the session."
            ),
            "input_schema": {
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Python code to run. Use print() for output."
                    }
                },
                "required": ["code"]
            }
        }
    ]

    messages = [{"role": "user", "content": task}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=4096,
            tools=tools,
            messages=messages
        )

        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Done."

        tool_results = []
        for block in response.content:
            if block.type == "tool_use" and block.name == "execute_python":
                result = execute_python_e2b(block.input["code"])
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

# Example usage
result = run_code_agent(
    "Calculate the first 20 prime numbers and show their sum."
)
print(result)`
        }}
      />

      <h2>Docker-Based Execution</h2>

      <p>
        For self-hosted sandboxing, Docker containers provide strong isolation without relying
        on a third-party service. Each code execution runs in a fresh container that is
        destroyed after completion.
      </p>

      <SDKExample
        title="Docker-Based Code Execution"
        tabs={{
          python: `import docker  # pip install docker
import json
import tempfile
import os

def execute_in_docker(
    code: str,
    image: str = "python:3.11-slim",
    timeout: int = 15,
    memory_limit: str = "128m",
    cpu_period: int = 100000,
    cpu_quota: int = 50000  # 50% of one CPU
) -> str:
    """
    Execute Python code in an isolated Docker container.
    Container is destroyed after execution.
    """
    docker_client = docker.from_env()

    # Write code to a temp file to mount into the container
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.py', delete=False, dir='/tmp'
    ) as f:
        f.write(code)
        code_path = f.name

    container = None
    try:
        container = docker_client.containers.run(
            image=image,
            command=["python3", "/code/script.py"],
            volumes={code_path: {"bind": "/code/script.py", "mode": "ro"}},
            # Security constraints
            mem_limit=memory_limit,
            cpu_period=cpu_period,
            cpu_quota=cpu_quota,
            network_disabled=True,      # No network access
            read_only=True,             # Read-only filesystem
            user="nobody",              # Non-root user
            security_opt=["no-new-privileges"],
            # Run in detached mode for timeout control
            detach=True,
            remove=False,               # We'll remove manually
            stdout=True,
            stderr=True
        )

        # Wait for completion with timeout
        exit_code = container.wait(timeout=timeout)["StatusCode"]
        logs = container.logs(stdout=True, stderr=True).decode("utf-8")

        return json.dumps({
            "success": exit_code == 0,
            "output": logs[:50000],  # Limit output size
            "exit_code": exit_code
        })

    except docker.errors.ContainerError as e:
        return json.dumps({
            "error": "CONTAINER_ERROR",
            "message": str(e),
            "output": e.stderr.decode("utf-8") if e.stderr else ""
        })
    except Exception as e:
        return json.dumps({
            "error": "DOCKER_ERROR",
            "message": str(e),
            "suggestion": "Check that Docker is running and the image is available."
        })
    finally:
        if container:
            try:
                container.remove(force=True)
            except Exception:
                pass
        try:
            os.unlink(code_path)
        except Exception:
            pass`
        }}
      />

      <h2>Output Capturing and Size Limits</h2>

      <p>
        Agent-generated code can produce very large outputs: printing a DataFrame, dumping a
        JSON file, or logging debug information. Without size limits, large outputs flood the
        context window and degrade performance. Always cap output and communicate the truncation
        to the model.
      </p>

      <PatternBlock
        name="Output Normalization"
        category="Code Execution"
        description="Always normalize execution output before returning it to the agent. Truncate large outputs with a clear message, separate stdout from stderr, and include the exit code. The model uses all of this to determine whether the code succeeded and what to do next."
        when={[
          "Any code execution tool that captures stdout/stderr",
          "Tools that run external processes",
          "Tools that read potentially large file contents"
        ]}
        avoid={[
          "Returning raw exception tracebacks without parsing",
          "Allowing unbounded output that can overflow the context window",
          "Silently truncating output without telling the model"
        ]}
      />

      <BestPracticeBlock title="Pre-install libraries in the execution environment">
        Agents frequently want to use libraries like numpy, pandas, or requests. If these require
        installation at runtime, each code execution gains significant latency and may fail
        due to network restrictions in the sandbox. Pre-build a Docker image or E2B sandbox
        template with the libraries your agent is likely to need. Document the available
        libraries in the tool description so the model knows what it can use without trying
        to install anything.
      </BestPracticeBlock>

      <WarningBlock title="Never execute code with access to production credentials">
        Code execution sandboxes must not have access to production databases, API keys, or
        internal services. An adversarial prompt or a hallucinated code path could exfiltrate
        secrets or corrupt data. Mount only the minimum data the agent needs, use read-only
        mounts where possible, and disable network access unless the task explicitly requires
        it. Treat agent-generated code as untrusted input, always.
      </WarningBlock>

      <NoteBlock title="Persistent sessions improve performance for iterative tasks">
        For agents that write and refine code iteratively — debugging, data exploration —
        persistent execution sessions (keeping the same sandbox alive across multiple tool calls)
        dramatically improve performance. Variables, imported libraries, and created files
        persist between calls. E2B supports persistent sandboxes; Docker requires explicit
        volume management. The tradeoff is that state from earlier calls can affect later ones
        unexpectedly.
      </NoteBlock>
    </article>
  )
}
