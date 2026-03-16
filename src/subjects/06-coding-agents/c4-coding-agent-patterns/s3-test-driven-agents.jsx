import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function TestDrivenAgents() {
  return (
    <article className="prose-content">
      <h2>Test-Driven Agentic Development</h2>
      <p>
        Test-driven development (TDD) — writing tests before writing implementation code — is one
        of the most effective practices for agentic software development. When a coding agent has
        a concrete, executable test suite as its success criterion, it can verify its own work,
        detect regressions, and iterate until the task is genuinely complete rather than
        superficially complete. TDD transforms the agent's feedback loop from "does this look
        right?" to "do the tests pass?" — an objective, automatable signal.
      </p>

      <ConceptBlock term="Test-Driven Agentic Development (TDAD)">
        <p>
          A workflow where tests are defined before implementation, and the coding agent uses the
          test suite as its primary success criterion. The agent writes or receives failing tests,
          implements code to make them pass, runs the test suite after each change, and iterates
          until all tests pass and no regressions are introduced. The human's role shifts from
          reviewing every line of implementation code to reviewing and approving the test
          specification.
        </p>
      </ConceptBlock>

      <h2>Why Tests Are the Ideal Agent Feedback Signal</h2>
      <p>
        Coding agents face a fundamental challenge: how do they know when they are done? Without
        an objective criterion, agents tend to either stop too early (returning plausible-looking
        but buggy code) or loop indefinitely. Tests solve this by providing:
      </p>
      <ul>
        <li><strong>Binary signals:</strong> PASS or FAIL — no ambiguity about whether progress was made.</li>
        <li><strong>Granular feedback:</strong> Individual test failures pinpoint exactly what is broken.</li>
        <li><strong>Regression detection:</strong> The full test suite catches unintended side effects of changes.</li>
        <li><strong>Scope bounding:</strong> Tests define the exact behaviour required, preventing over-engineering.</li>
        <li><strong>Human-readable specifications:</strong> Well-named tests document intent in a form both humans and agents understand.</li>
      </ul>

      <h2>The Test-First Agent Workflow</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Phase</th>
              <th className="px-4 py-3 text-left font-semibold">Who</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
              <th className="px-4 py-3 text-left font-semibold">Output</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['1. Specify', 'Human', 'Describe the desired behaviour in natural language', 'Task description + acceptance criteria'],
              ['2. Write tests', 'Agent or Human', 'Translate acceptance criteria into executable tests', 'Failing test suite'],
              ['3. Confirm tests fail', 'Agent', 'Run tests to verify they fail for the right reason', 'Expected failures confirmed'],
              ['4. Implement', 'Agent', 'Write minimum code to make tests pass', 'Implementation draft'],
              ['5. Verify', 'Agent', 'Run full test suite (not just new tests)', 'PASS or targeted failure list'],
              ['6. Fix regressions', 'Agent', 'Iterate on implementation until all tests pass', 'Green test suite'],
              ['7. Review', 'Human', 'Review diff, test quality, and edge cases', 'Approval or refinement request'],
            ].map(([phase, who, action, output]) => (
              <tr key={phase}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">{phase}</td>
                <td className="px-4 py-3 text-blue-600 dark:text-blue-400 text-sm">{who}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{action}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PatternBlock
        name="Agent Writes Tests First"
        category="Test-Driven Development"
        whenToUse="When a human provides a feature description and wants the agent to own the full TDD cycle — test specification, implementation, and verification."
      >
        <p>
          Instruct the agent to write tests before any implementation. This forces the agent to
          reason about the interface and expected behaviour before touching implementation details,
          and gives you a reviewable specification before any code is generated.
        </p>
        <SDKExample
          title="Instructing an Agent to Write Tests First"
          tabs={{
            python: `import anthropic

client = anthropic.Anthropic()

TDD_SYSTEM = """You are a test-driven Python developer.
When given a feature request, you ALWAYS follow this order:
1. Write failing tests using pytest that fully specify the behaviour
2. Show the test file and confirm you understand what PASS means
3. Only then implement the code to make the tests pass
4. Run the tests and iterate until all pass
5. Report final test results

Never write implementation code before tests exist."""

feature_request = """
Implement a RateLimiter class that:
- Accepts requests_per_minute as constructor argument
- Exposes an allow(user_id: str) -> bool method
- Returns True if the user is within their rate limit
- Returns False and does NOT consume a token if the user is over limit
- Uses a sliding window algorithm
- Is thread-safe
"""

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=4096,
    system=TDD_SYSTEM,
    messages=[{"role": "user", "content": feature_request}],
)
print(response.content[0].text)`,
            typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const TDD_SYSTEM = You are a test-driven TypeScript developer.
When given a feature request, you ALWAYS follow this order:
1. Write failing tests using Jest/Vitest that fully specify the behaviour
2. Show the test file and confirm you understand what PASS means
3. Only then implement the code to make the tests pass
4. Run the tests and iterate until all pass

Never write implementation code before tests exist.;

const featureRequest = 
Implement a RateLimiter class that:
- Accepts requestsPerMinute as constructor argument
- Exposes an allow(userId: string): boolean method
- Returns true if the user is within their rate limit
- Uses a sliding window algorithm
- Is safe for concurrent use
;

const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 4096,
  system: TDD_SYSTEM,
  messages: [{ role: 'user', content: featureRequest }],
});

console.log(response.content[0].type === 'text' ? response.content[0].text : '');`,
          }}
        />
      </PatternBlock>

      <h2>Agentic TDD Loop Implementation</h2>
      <p>
        The following pattern implements a full TDD loop where the agent writes tests, implements
        code, runs the test suite, and iterates automatically until all tests pass or a maximum
        iteration count is reached.
      </p>

      <SDKExample
        title="Full Agentic TDD Loop"
        tabs={{
          python: `import anthropic
import subprocess
import tempfile
import os
from pathlib import Path

client = anthropic.Anthropic()

def run_pytest(test_file: str, source_file: str) -> tuple[bool, str]:
    """Run pytest and return (passed, output)."""
    result = subprocess.run(
        ["pytest", test_file, "-v", "--tb=short", "--no-header"],
        capture_output=True,
        text=True,
        timeout=30,
    )
    output = result.stdout + result.stderr
    passed = result.returncode == 0
    return passed, output

def tdd_agent_loop(feature_description: str, max_iterations: int = 5) -> str:
    """Run a full TDD loop: write tests, implement, iterate until green."""

    with tempfile.TemporaryDirectory() as tmpdir:
        test_file = os.path.join(tmpdir, "test_feature.py")
        source_file = os.path.join(tmpdir, "feature.py")

        messages = [{
            "role": "user",
            "content": (
                f"Feature to implement:\\n{feature_description}\\n\\n"
                "Step 1: Write comprehensive pytest tests in test_feature.py "
                "that fully specify this behaviour. Only output the test file content."
            ),
        }]

        # Step 1: Generate tests
        resp = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            system="You are a TDD Python developer. Output ONLY raw Python code, no markdown.",
            messages=messages,
        )
        test_code = resp.content[0].text.strip()
        Path(test_file).write_text(test_code)
        messages.append({"role": "assistant", "content": test_code})

        # Step 2: Iterate — implement and fix until tests pass
        for iteration in range(max_iterations):
            messages.append({
                "role": "user",
                "content": (
                    "Now implement feature.py to make all tests pass. "
                    "Output ONLY the raw Python source code for feature.py."
                ) if iteration == 0 else (
                    f"Tests still failing. Fix feature.py:\\n\\n{test_output}\\n\\n"
                    "Output ONLY the corrected feature.py source code."
                ),
            })

            resp = client.messages.create(
                model="claude-opus-4-6",
                max_tokens=2048,
                system="You are a TDD Python developer. Output ONLY raw Python code, no markdown.",
                messages=messages,
            )
            source_code = resp.content[0].text.strip()
            Path(source_file).write_text(source_code)
            messages.append({"role": "assistant", "content": source_code})

            passed, test_output = run_pytest(test_file, source_file)
            print(f"Iteration {iteration + 1}: {'PASS' if passed else 'FAIL'}")

            if passed:
                return f"SUCCESS after {iteration + 1} iteration(s):\\n{test_output}"

        return f"FAILED after {max_iterations} iterations:\\n{test_output}"

result = tdd_agent_loop("""
A BankAccount class with:
- deposit(amount: float) -> None
- withdraw(amount: float) -> None (raises InsufficientFundsError if balance < amount)
- balance property returning current balance
- transfer(amount: float, target: BankAccount) -> None
""")
print(result)`,
            typescript: `import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const client = new Anthropic();

function runTests(testFile: string): { passed: boolean; output: string } {
  try {
    const output = execSync(npx vitest run \${testFile} --reporter=verbose 2>&1, {
      encoding: 'utf8',
      timeout: 30000,
    });
    return { passed: true, output };
  } catch (e: any) {
    return { passed: false, output: e.stdout ?? e.message };
  }
}

async function tddAgentLoop(
  featureDescription: string,
  maxIterations = 5
): Promise<string> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tdd-'));
  const testFile = path.join(tmpDir, 'feature.test.ts');
  const sourceFile = path.join(tmpDir, 'feature.ts');

  const SYSTEM = 'You are a TDD TypeScript developer. Output ONLY raw TypeScript code, no markdown fences.';

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: Feature:\\n\${featureDescription}\\n\\nWrite comprehensive Vitest tests in feature.test.ts. Output ONLY the test file content.,
    },
  ];

  // Step 1: Generate tests
  const testResp = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    system: SYSTEM,
    messages,
  });
  const testCode = testResp.content[0].type === 'text' ? testResp.content[0].text.trim() : '';
  fs.writeFileSync(testFile, testCode);
  messages.push({ role: 'assistant', content: testCode });

  let testOutput = '';

  // Step 2: Implement and iterate
  for (let i = 0; i < maxIterations; i++) {
    messages.push({
      role: 'user',
      content: i === 0
        ? 'Now implement feature.ts to make all tests pass. Output ONLY raw TypeScript.'
        : Tests failing. Fix feature.ts:\\n\\n\${testOutput}\\n\\nOutput ONLY the corrected feature.ts.,
    });

    const implResp = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: SYSTEM,
      messages,
    });
    const sourceCode = implResp.content[0].type === 'text' ? implResp.content[0].text.trim() : '';
    fs.writeFileSync(sourceFile, sourceCode);
    messages.push({ role: 'assistant', content: sourceCode });

    const { passed, output } = runTests(testFile);
    testOutput = output;
    console.log(Iteration \${i + 1}: \${passed ? 'PASS' : 'FAIL'});
    if (passed) return SUCCESS after \${i + 1} iteration(s):\\n\${output};
  }

  return FAILED after \${maxIterations} iterations:\\n\${testOutput};
}

const result = await tddAgentLoop(
A BankAccount class with:
- deposit(amount: number): void
- withdraw(amount: number): void (throws InsufficientFundsError if balance < amount)
- readonly balance: number
- transfer(amount: number, target: BankAccount): void
);
console.log(result);`,
          }}
        />

      <h2>Writing Good Tests for Agent Tasks</h2>
      <p>
        The quality of your test suite directly determines the reliability of the agent's output.
        Weak tests produce superficially passing but subtly wrong code. Good tests for agent
        tasks share the following properties:
      </p>

      <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: 'Behavioural, not implementation',
            desc: 'Test what the code does, not how it does it. Agents need freedom to choose implementation strategies.',
          },
          {
            title: 'Edge cases explicitly covered',
            desc: 'Empty inputs, boundary values, error conditions. Agents commonly miss edge cases without explicit tests.',
          },
          {
            title: 'Descriptive test names',
            desc: 'test_withdraw_raises_error_when_balance_insufficient gives the agent precise information about what failed.',
          },
          {
            title: 'Independent and isolated',
            desc: 'Each test should set up its own state. Shared mutable fixtures cause cascading failures that confuse agents.',
          },
          {
            title: 'Fast execution',
            desc: 'The agent runs tests many times. Tests that take seconds per run slow the iteration loop dramatically.',
          },
          {
            title: 'Deterministic',
            desc: 'Flaky tests that sometimes pass and sometimes fail break the agent\'s ability to reason about progress.',
          },
        ].map(({ title, desc }) => (
          <div key={title} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
          </div>
        ))}
      </div>

      <h2>Agents That Fix Failing CI</h2>
      <p>
        A particularly powerful application of test-driven agents is automatically fixing failing
        CI pipelines. Given a failing CI run, the agent reads the test output, locates the
        relevant code, implements a fix, and verifies locally before creating a pull request.
      </p>

      <SDKExample
        title="Fix-CI Agent"
        tabs={{
          python: `import anthropic
import subprocess

client = anthropic.Anthropic()

def get_failing_tests() -> str:
    """Run the test suite and capture failure output."""
    result = subprocess.run(
        ["pytest", "--tb=long", "-q"],
        capture_output=True, text=True, timeout=120,
    )
    return result.stdout + result.stderr

def fix_ci_agent(max_attempts: int = 3) -> bool:
    """Ask the agent to fix failing tests, verify, and repeat if needed."""
    for attempt in range(max_attempts):
        failures = get_failing_tests()

        if "failed" not in failures and "error" not in failures.lower():
            print("CI is green!")
            return True

        print(f"Attempt {attempt + 1}: {failures.count('FAILED')} failures")

        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            system="""You are a CI repair agent.
Given failing test output, identify root causes and fix the source code.
Be precise: prefer minimal changes that target the actual failure.
Output your changes as unified diff format.""",
            messages=[{
                "role": "user",
                "content": (
                    "Fix these failing tests by modifying the source code.\\n"
                    "Output ONLY a unified diff that can be applied with patch -p1.\\n\\n"
                    f"Failing test output:\\n{failures}"
                ),
            }],
        )

        diff = response.content[0].text
        # Apply the diff
        patch_result = subprocess.run(
            ["patch", "-p1"],
            input=diff, text=True, capture_output=True,
        )
        if patch_result.returncode != 0:
            print(f"Patch failed: {patch_result.stderr}")
            continue

    return False

success = fix_ci_agent()
print("Fixed!" if success else "Could not fix CI automatically.")`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';
import { execSync, spawnSync } from 'child_process';

const client = new Anthropic();

function getFailingTests(): string {
  try {
    return execSync('npx vitest run --reporter=verbose 2>&1', {
      encoding: 'utf8',
      timeout: 120000,
    });
  } catch (e: any) {
    return e.stdout ?? e.message;
  }
}

async function fixCiAgent(maxAttempts = 3): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const failures = getFailingTests();

    if (!failures.includes('FAIL') && !failures.toLowerCase().includes('error')) {
      console.log('CI is green!');
      return true;
    }

    console.log(Attempt \${attempt + 1}: failures detected);

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: You are a CI repair agent.
Given failing test output, identify root causes and fix source code.
Prefer minimal changes. Output ONLY a unified diff (patch -p1 format).,
      messages: [{
        role: 'user',
        content: Fix these failing tests by modifying the source code.
Output ONLY a unified diff.

Failing output:
\${failures},
      }],
    });

    const diff = response.content[0].type === 'text' ? response.content[0].text : '';
    const patchResult = spawnSync('patch', ['-p1'], {
      input: diff,
      encoding: 'utf8',
    });

    if (patchResult.status !== 0) {
      console.error('Patch failed:', patchResult.stderr);
      continue;
    }
  }

  return false;
}

const success = await fixCiAgent();
console.log(success ? 'Fixed!' : 'Could not fix CI automatically.');`,
        }}
      />

      <WarningBlock title="Test Gaming: Hardcoding to Pass">
        <p>
          Agents can "cheat" by hardcoding expected outputs or writing implementation code that
          specifically targets test assertions rather than solving the general problem. Watch for
          signs like: test data appearing verbatim in source code, conditional logic keyed on
          test-specific inputs, or tests passing locally but failing on new inputs. Mitigate by
          including property-based tests (Hypothesis in Python, fast-check in TypeScript) and
          randomised test inputs that the agent cannot predict.
        </p>
      </WarningBlock>

      <BestPracticeBlock title="Test-Driven Agentic Development Best Practices">
        <ul>
          <li>Write tests that cover the public interface, not implementation internals — agents should freely choose how to implement.</li>
          <li>Include property-based tests alongside example-based tests to prevent hardcoding.</li>
          <li>Set a maximum iteration count (3–5) and escalate to a human if the agent cannot reach a green suite.</li>
          <li>Always run the full test suite, not just new tests — catch regressions introduced by the agent's changes.</li>
          <li>Require the agent to explain its changes before applying them — this surface reasoning errors before code is written.</li>
          <li>Use coverage tools to verify the agent's tests actually exercise the code paths they claim to test.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Acceptance Tests as Agent Contracts">
        <p>
          Frame the human-agent handoff around acceptance tests rather than implementation
          specifications. A human who writes "here are the tests that must pass" gives the agent
          a precise, verifiable contract. A human who writes "here is what I want" gives the
          agent a vague brief that requires interpretation at every step. Investing time in good
          acceptance tests pays dividends in predictable, verifiable agent output.
        </p>
      </NoteBlock>
    </article>
  )
}
