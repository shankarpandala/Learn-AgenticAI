import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function AmazonQDeveloper() {
  return (
    <article className="prose-content">
      <h2>Amazon Q Developer: AI-Powered Coding Assistant</h2>
      <p>
        Amazon Q Developer is an AI coding assistant built on Amazon Bedrock, purpose-built
        for software development tasks. Beyond inline code completion (which it shares with
        GitHub Copilot), Q Developer has <strong>agentic capabilities</strong> — it can take
        a natural language task description, plan a multi-file implementation, write code
        across your codebase, run tests, iterate on failures, and create a pull request.
        It integrates into IDE plugins (VS Code, JetBrains, Visual Studio), the AWS Console,
        and the CLI.
      </p>

      <ArchitectureDiagram
        title="Amazon Q Developer: Agentic Task Flow (/dev)"
        width={700}
        height={300}
        nodes={[
          { id: 'dev', label: 'Developer\n(/dev prompt)', type: 'external', x: 70, y: 150 },
          { id: 'plan', label: 'Planning\nAgent', type: 'agent', x: 210, y: 150 },
          { id: 'codebase', label: 'Codebase\nContext', type: 'store', x: 210, y: 60 },
          { id: 'impl', label: 'Implementation\nAgent', type: 'agent', x: 380, y: 150 },
          { id: 'files', label: 'File Read/\nWrite Tools', type: 'tool', x: 380, y: 60 },
          { id: 'test', label: 'Test\nRunner', type: 'tool', x: 520, y: 100 },
          { id: 'pr', label: 'Pull Request\n/ Diff', type: 'store', x: 620, y: 150 },
          { id: 'review', label: 'Developer\nReview', type: 'external', x: 620, y: 240 },
        ]}
        edges={[
          { from: 'dev', to: 'plan', label: 'requirements' },
          { from: 'codebase', to: 'plan', label: 'context' },
          { from: 'plan', to: 'impl', label: 'task plan' },
          { from: 'impl', to: 'files', label: 'read/write' },
          { from: 'impl', to: 'test', label: 'run tests' },
          { from: 'test', to: 'impl', label: 'failures' },
          { from: 'impl', to: 'pr', label: 'diff' },
          { from: 'pr', to: 'review', label: 'approve/reject' },
        ]}
      />

      <h2>Agentic Capabilities</h2>

      <ConceptBlock term="/dev — Multi-File Feature Implementation">
        <p>
          The <code>/dev</code> command is Q Developer's most powerful agentic feature. You
          provide a natural language description of a feature or change, and Q Developer:
        </p>
        <ol>
          <li><strong>Indexes your workspace</strong> — reads relevant files to understand context, existing patterns, and conventions</li>
          <li><strong>Creates a plan</strong> — proposes which files to create/modify and what changes to make (you can review and edit the plan before proceeding)</li>
          <li><strong>Implements the changes</strong> — writes code across multiple files following your codebase's style</li>
          <li><strong>Runs tests</strong> — executes your test suite and iterates on failures autonomously</li>
          <li><strong>Presents a diff</strong> — shows all changes before applying them, and can create a Git commit or PR</li>
        </ol>
        <p>
          The agentic loop runs autonomously but with human checkpoints at the plan approval
          stage and diff review stage, following a human-in-the-loop pattern that prevents
          fully unsupervised code changes.
        </p>
      </ConceptBlock>

      <ConceptBlock term="/review — Inline Code Review">
        <p>
          The <code>/review</code> command performs an automated code review of staged changes,
          a specific file, or a pull request. It produces inline comments categorized by:
        </p>
        <ul>
          <li><strong>Security</strong> — SQL injection, hardcoded secrets, insecure deserialization, SSRF vulnerabilities</li>
          <li><strong>Quality</strong> — null pointer risks, resource leaks, incorrect error handling, dead code</li>
          <li><strong>Performance</strong> — N+1 queries, unnecessary allocations, blocking calls in async contexts</li>
          <li><strong>Maintainability</strong> — overly complex functions, missing documentation, unclear naming</li>
        </ul>
        <p>
          Unlike static analysis tools that match patterns, Q Developer's review uses semantic
          understanding — it can identify logic bugs that don't match any specific lint rule.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Security Scanning">
        <p>
          Q Developer's security scanning (formerly CodeGuru Security) runs over 350 detectors
          across 15 programming languages. Detectors cover OWASP Top 10 and CWE categories
          including: injection flaws (SQL, command, LDAP), cryptographic weaknesses (hardcoded
          keys, weak algorithms), secrets detection (API keys, credentials in code), and
          infrastructure-as-code misconfigurations (open S3 buckets, overly permissive IAM).
          Scans can be triggered from the IDE, CLI, or integrated into CI/CD pipelines via the
          <code>aws codewhisperer</code> CLI or <code>aws q</code> CLI.
        </p>
      </ConceptBlock>

      <h2>IDE Integration and Inline Completions</h2>
      <p>
        Q Developer provides real-time inline code completions in VS Code, JetBrains IDEs
        (IntelliJ, PyCharm, GoLand, etc.), Visual Studio, and AWS Cloud9. Completions are
        context-aware — the model receives the current file, open tabs, and project structure.
        The <strong>Free Tier</strong> provides unlimited single-line completions and
        50 chat interactions per month. The <strong>Pro Tier</strong> (per-user subscription)
        removes limits and adds organizational features like customization on internal codebases.
      </p>

      <SDKExample
        title="Amazon Q Developer CLI and /dev Workflow"
        tabs={{
          python: `# Amazon Q Developer CLI commands
# Install: https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html

# ── CLI: Start a chat session ─────────────────────────────────────────────
# $ q chat
# > /dev Add a rate limiting middleware to the Express API that limits
#         each IP to 100 requests per minute using Redis for state storage.
#
# Q Developer response flow:
# 1. "I'll analyze your codebase to understand the current middleware setup..."
#    [reads: src/app.js, src/middleware/, package.json]
# 2. "Here's my plan:
#    - Create src/middleware/rateLimiter.js (new file)
#    - Modify src/app.js to register the middleware
#    - Add redis dependency to package.json
#    - Create tests/middleware/rateLimiter.test.js
#    Does this plan look correct? [Yes/Edit/Cancel]"
# 3. [After approval] Generates all files and runs: npm test
# 4. "Tests passed. Here is the diff: [shows changes]
#    Apply changes? [Yes/No]"

# ── CLI: Security scan ────────────────────────────────────────────────────
# $ q scan
# Scanning project... (runs 350+ detectors)
# Found 3 issues:
#   HIGH   src/auth.py:42  Hardcoded AWS credentials detected
#   MEDIUM src/db.py:17    SQL query constructed with string formatting (injection risk)
#   LOW    src/config.py:8 Weak hashing algorithm (MD5) used for password storage


# ── Python SDK: Using Q Developer via boto3 (QDeveloper API) ──────────────
# Amazon Q Developer exposes programmatic access via the qbusiness and
# codewhisperer APIs for enterprise workflows.

import boto3

# Q Developer code generation via Bedrock (underlying model access)
# For custom tooling, you can invoke the same models Q uses directly

bedrock_rt = boto3.client("bedrock-runtime", region_name="us-east-1")

# Q Developer uses Claude under the hood - you can replicate its prompting pattern
system_prompt = """You are an expert software engineer. When given a code task:
1. First analyze the existing code context provided
2. Write clean, idiomatic code following the existing patterns
3. Include appropriate error handling
4. Add docstrings and type hints
5. Consider edge cases"""

# Simulate a /dev task via direct API
code_context = """
# existing_code/src/api/users.py
from flask import Blueprint, request, jsonify
from .models import User
from .auth import require_auth

users_bp = Blueprint('users', __name__)

@users_bp.route('/users/<int:user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())
"""

task = "Add a PATCH endpoint to update user profile fields (name, bio, avatar_url). Include input validation and return 400 for invalid fields."

response = bedrock_rt.converse(
    modelId="anthropic.claude-3-5-sonnet-20241022-v2:0",
    system=[{"text": system_prompt}],
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "text": f"Existing code:\\n\\n{code_context}\\n\\nTask: {task}"
                }
            ]
        }
    ],
    inferenceConfig={"maxTokens": 2048, "temperature": 0.0}
)

generated_code = response["output"]["message"]["content"][0]["text"]
print(generated_code)`,
        }}
      />

      <h2>Java Upgrade Transformations</h2>

      <ConceptBlock term="Automated Language Upgrades">
        <p>
          Q Developer's <strong>transformation</strong> feature automates large-scale code
          migrations that would take weeks manually. Currently supported transformations:
        </p>
        <ul>
          <li><strong>Java 8/11 → Java 17/21</strong> — Updates deprecated APIs, migrates to Records and Sealed Classes where appropriate, updates Maven/Gradle configs, resolves breaking changes in newer JDK releases</li>
          <li><strong>Spring Boot 2.x → 3.x</strong> — Migrates javax.* to jakarta.* namespaces, updates Spring Security config, resolves deprecated bean configurations</li>
          <li><strong>.NET Framework → .NET 8</strong> — Windows-specific APIs to cross-platform equivalents, updated dependency injection patterns</li>
        </ul>
        <p>
          The transformation runs as a batch job: Q Developer reads your entire codebase,
          builds a dependency graph, applies changes incrementally, compiles after each change,
          and generates a comprehensive pull request with migration notes.
        </p>
      </ConceptBlock>

      <CodeBlock language="python" filename="q_transformation_cli.py">
{`# Java transformation via Q Developer CLI
# $ q transform --language java --source-version 11 --target-version 17

# What happens internally:
# 1. Q Developer uploads your Maven/Gradle project to a secure build environment
# 2. Runs the current test suite to establish a baseline
# 3. Applies transformations in dependency order:
#    - Updates pom.xml/build.gradle with new Java version
#    - Replaces deprecated javax.* with jakarta.* (for Spring Boot 3.x)
#    - Migrates anonymous inner classes to lambdas where safe
#    - Updates Mockito/JUnit 4 patterns to JUnit 5
#    - Fixes compilation errors from removed APIs (e.g., Date.getYear())
# 4. Runs test suite after each batch of changes
# 5. If tests fail, attempts automated fix or flags for manual review
# 6. Creates a PR with:
#    - Summary of all changes
#    - Files changed (diff)
#    - Test results before/after
#    - Manual action items for changes it couldn't automate

# Programmatic access to transformation status
import boto3

codewhisperer = boto3.client("codewhisperer", region_name="us-east-1")

# Start a transformation job
job = codewhisperer.start_transformation_job(
    workspaceState={
        "uploadId": "upload-id-from-prior-zip-upload",
        "programmingLanguage": {"languageName": "java"},
        "compilationUnits": []
    },
    transformationSpec={
        "transformationType": "LANGUAGE_UPGRADE",
        "source": {"language": {"name": "JAVA_11"}},
        "target": {"language": {"name": "JAVA_17"}}
    }
)

job_id = job["transformationJobId"]

# Poll for completion
import time
while True:
    status = codewhisperer.get_transformation_job(transformationJobId=job_id)
    state = status["transformationJob"]["status"]
    print(f"Job status: {state}")

    if state in ("COMPLETED", "FAILED", "STOPPED"):
        break
    time.sleep(30)

if state == "COMPLETED":
    # Download the transformed artifact
    plan = codewhisperer.get_transformation_plan(transformationJobId=job_id)
    for step in plan["transformationPlan"]["transformationSteps"]:
        print(f"Step: {step['name']} — {step['description']}")`}
      </CodeBlock>

      <h2>/test and /doc Commands</h2>

      <CodeBlock language="python" filename="q_test_doc_commands.py">
{`# /test — Unit test generation
# In IDE chat panel or CLI:
# > /test generate tests for src/payment/processor.py

# Q Developer will:
# 1. Read the target file and understand all functions/classes
# 2. Identify testable units (pure functions, class methods)
# 3. Detect existing test patterns (pytest vs unittest, fixture style)
# 4. Generate tests covering:
#    - Happy path (valid inputs)
#    - Edge cases (empty inputs, boundary values)
#    - Error cases (invalid inputs, exception paths)
#    - Mock setup for external dependencies (database, HTTP calls)
# 5. Place tests in the correct test directory following project conventions

# Example generated test skeleton for a payment processor:
"""
import pytest
from unittest.mock import Mock, patch
from src.payment.processor import PaymentProcessor, PaymentError

@pytest.fixture
def processor():
    return PaymentProcessor(api_key="test-key-123")

class TestChargeCard:
    def test_successful_charge(self, processor):
        with patch("src.payment.processor.stripe.charge.create") as mock_charge:
            mock_charge.return_value = Mock(id="ch_123", status="succeeded")
            result = processor.charge_card(amount=1000, currency="usd", token="tok_visa")
            assert result.charge_id == "ch_123"
            assert result.success is True

    def test_declined_card_raises_payment_error(self, processor):
        with patch("src.payment.processor.stripe.charge.create") as mock_charge:
            mock_charge.side_effect = stripe.error.CardError(
                message="Your card was declined.",
                param="number",
                code="card_declined"
            )
            with pytest.raises(PaymentError, match="card_declined"):
                processor.charge_card(amount=1000, currency="usd", token="tok_declined")

    def test_zero_amount_raises_value_error(self, processor):
        with pytest.raises(ValueError, match="Amount must be positive"):
            processor.charge_card(amount=0, currency="usd", token="tok_visa")
"""

# /doc — Documentation generation
# > /doc generate for src/api/

# Q Developer generates:
# - Module-level docstrings explaining purpose
# - Function/method docstrings with Args, Returns, Raises sections
# - README.md for the module (if requested)
# - OpenAPI/Swagger annotations for Flask/FastAPI endpoints`}
      </CodeBlock>

      <h2>Q Developer Agent SDK</h2>
      <p>
        For enterprise customization, Q Developer exposes an <strong>Agent SDK</strong> that
        lets you build custom Q Developer plugins — tools that appear natively in the Q chat
        interface. Custom tools can query internal systems (Jira, Confluence, internal APIs)
        and return structured responses that Q incorporates into its answers.
      </p>

      <CodeBlock language="python" filename="q_custom_plugin.py">
{`# Q Developer custom plugin (Lambda-backed tool)
# Plugins extend Q's knowledge with internal data sources

import json

def lambda_handler(event, context):
    """
    Q Developer calls this Lambda when it decides to use the plugin.
    The event contains the user's query parameters.
    """
    action = event.get("actionName")
    parameters = event.get("parameters", {})

    if action == "get_internal_ticket":
        ticket_id = parameters.get("ticketId", {}).get("value")
        # Query internal Jira/ServiceNow
        ticket = fetch_ticket_from_jira(ticket_id)
        return {
            "actionName": action,
            "actionParameters": parameters,
            "responseBody": {
                "application/json": {
                    "body": json.dumps({
                        "ticketId": ticket_id,
                        "title": ticket["summary"],
                        "status": ticket["status"],
                        "assignee": ticket["assignee"],
                        "description": ticket["description"][:500]
                    })
                }
            }
        }

    elif action == "search_runbooks":
        query = parameters.get("query", {}).get("value")
        results = search_confluence(query, space="RUNBOOKS")
        return {
            "actionName": action,
            "actionParameters": parameters,
            "responseBody": {
                "application/json": {
                    "body": json.dumps({
                        "results": [
                            {"title": r["title"], "url": r["url"], "excerpt": r["excerpt"]}
                            for r in results[:3]
                        ]
                    })
                }
            }
        }


def fetch_ticket_from_jira(ticket_id):
    # Placeholder: real implementation queries Jira REST API
    return {"summary": "...", "status": "In Progress", "assignee": "...", "description": "..."}


def search_confluence(query, space):
    # Placeholder: real implementation queries Confluence REST API
    return []`}
      </CodeBlock>

      <PatternBlock
        name="Q Developer in CI/CD Pipelines"
        category="Automation"
        whenToUse="When you want automated security scanning, code review, and test generation integrated into your pull request workflow without manual IDE usage."
      >
        <p>
          Integrate Q Developer into GitHub Actions or AWS CodePipeline to automatically:
          run security scans on every PR (<code>q scan --output sarif</code> produces SARIF
          for GitHub Security tab integration), generate unit tests for new functions lacking
          coverage, and post review comments on PRs. This shifts security and quality checks
          left without requiring developers to run them manually. The <code>amazonq</code>
          GitHub Action handles authentication via OIDC and posts findings as PR annotations.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Providing Good Context for /dev Tasks">
        <p>
          The quality of <code>/dev</code> output is proportional to the quality of your
          task description. Include: the specific feature or behavior you want, acceptance
          criteria (what does "done" look like), constraints (must be backwards compatible,
          must not change the public API, use existing Logger pattern), and pointers to
          relevant existing files. Q Developer performs better with specific, scoped tasks
          ("add rate limiting to the /api/search endpoint") than vague ones ("improve
          performance"). For large features, break them into multiple sequential /dev tasks.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Customization on Internal Codebases">
        <p>
          Q Developer Pro supports <strong>customization</strong>: you can fine-tune the
          completion model on your internal codebase (up to 10GB of code). Customized Q
          Developer learns your internal library APIs, naming conventions, and architectural
          patterns — dramatically improving completion relevance for internal frameworks
          not in the model's training data. Customization uses AWS PrivateLink; your code
          never leaves your AWS account.
        </p>
      </NoteBlock>

      <NoteBlock type="info" title="Q Developer vs GitHub Copilot">
        <p>
          Q Developer and GitHub Copilot have similar inline completion quality. Q Developer
          differentiates on: deeper AWS service integration (it knows CloudFormation, CDK,
          and boto3 APIs intimately), the agentic <code>/dev</code> command (Copilot Workspace
          is the comparable feature), built-in security scanning (requires separate GitHub
          Advanced Security for Copilot), and the Java/Spring transformation feature.
          For AWS-heavy shops, Q Developer's native understanding of AWS services and
          IAM patterns provides a practical advantage.
        </p>
      </NoteBlock>
    </article>
  )
}
