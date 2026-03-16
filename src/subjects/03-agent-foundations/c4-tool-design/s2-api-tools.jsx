import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function ApiTools() {
  return (
    <article className="prose-content">
      <p>
        The majority of real-world agent tools wrap existing APIs: REST endpoints, GraphQL
        services, database queries, or third-party platforms like GitHub, Slack, or Jira.
        Wrapping an API as an agent tool requires more than copying its parameters into a
        JSON Schema. Authentication must be handled transparently, rate limits must be respected,
        and errors must be translated into messages the LLM can act on. This section covers the
        patterns that make API-backed tools robust and production-ready.
      </p>

      <h2>Anatomy of a Well-Wrapped API Tool</h2>

      <p>
        A production API tool has five responsibilities: input validation, authentication
        injection, the HTTP request, response normalization, and error translation. The agent
        should see none of the authentication mechanics and should always receive a response
        it can reason about, even when the API fails.
      </p>

      <SDKExample
        title="Wrapping a REST API as an Agent Tool"
        tabs={{
          python: `import json
import os
import time
from typing import Any
import httpx  # pip install httpx

class GitHubAPITool:
    """Wraps GitHub REST API endpoints as agent-callable tools."""

    def __init__(self):
        self.token = os.environ["GITHUB_TOKEN"]
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        self._rate_limit_remaining = 5000
        self._rate_limit_reset = 0

    def _handle_rate_limit(self, response: httpx.Response):
        """Track and respect GitHub rate limits."""
        self._rate_limit_remaining = int(
            response.headers.get("X-RateLimit-Remaining", 5000)
        )
        self._rate_limit_reset = int(
            response.headers.get("X-RateLimit-Reset", 0)
        )
        if self._rate_limit_remaining < 10:
            wait_time = max(0, self._rate_limit_reset - time.time())
            if wait_time > 0:
                print(f"Rate limit nearly exhausted. Waiting {wait_time:.0f}s...")
                time.sleep(min(wait_time, 60))  # Cap wait at 60s

    def _translate_error(self, status_code: int, body: dict, context: str) -> str:
        """Convert HTTP errors to LLM-actionable messages."""
        error_map = {
            401: "Authentication failed. Check that GITHUB_TOKEN is valid and has required scopes.",
            403: f"Access denied to {context}. The token may lack required permissions.",
            404: f"Resource not found: {context}. Check the repository name and owner.",
            422: f"Validation failed: {body.get('message', 'invalid input')}. Check parameter values.",
            429: "Rate limit exceeded. Wait before retrying.",
            500: "GitHub server error. Retry after a short delay.",
            503: "GitHub is temporarily unavailable. Retry later."
        }
        return json.dumps({
            "error": f"HTTP_{status_code}",
            "message": error_map.get(status_code, f"Request failed with status {status_code}"),
            "details": body.get("message", ""),
            "suggestion": "Check the error message and adjust your request parameters."
        })

    def search_issues(self, repo: str, query: str, state: str = "open", limit: int = 10) -> str:
        """
        Search GitHub issues in a repository.

        Args:
            repo: Repository in 'owner/name' format, e.g. 'anthropics/anthropic-sdk-python'
            query: Search terms to match in issue title or body
            state: Filter by state: 'open', 'closed', or 'all'
            limit: Maximum number of results (1-30)
        """
        search_query = f"repo:{repo} is:issue state:{state} {query}"
        url = f"{self.base_url}/search/issues"
        params = {"q": search_query, "per_page": min(limit, 30), "sort": "updated"}

        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, headers=self.headers, params=params)
                self._handle_rate_limit(response)

                if response.status_code != 200:
                    return self._translate_error(
                        response.status_code,
                        response.json(),
                        f"issue search in {repo}"
                    )

                data = response.json()
                issues = []
                for item in data.get("items", []):
                    issues.append({
                        "number": item["number"],
                        "title": item["title"],
                        "state": item["state"],
                        "url": item["html_url"],
                        "created": item["created_at"][:10],
                        "labels": [l["name"] for l in item.get("labels", [])]
                    })

                return json.dumps({
                    "total_count": data["total_count"],
                    "returned": len(issues),
                    "issues": issues
                }, indent=2)

        except httpx.TimeoutException:
            return json.dumps({
                "error": "TIMEOUT",
                "message": "Request to GitHub timed out after 10 seconds.",
                "suggestion": "Retry the request. If it continues to fail, try a simpler query."
            })
        except httpx.NetworkError as e:
            return json.dumps({
                "error": "NETWORK_ERROR",
                "message": f"Could not connect to GitHub: {str(e)}",
                "suggestion": "Check network connectivity and retry."
            })

# Register as tool schema for Claude
GITHUB_TOOLS = [
    {
        "name": "search_github_issues",
        "description": (
            "Search for issues in a GitHub repository. "
            "Returns issue numbers, titles, states, and URLs. "
            "Use this to find relevant issues before creating new ones."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "repo": {
                    "type": "string",
                    "description": "Repository in 'owner/name' format, e.g. 'anthropics/anthropic-sdk-python'"
                },
                "query": {
                    "type": "string",
                    "description": "Search terms to find in issue title or body"
                },
                "state": {
                    "type": "string",
                    "description": "Filter by issue state",
                    "enum": ["open", "closed", "all"],
                    "default": "open"
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum results to return (1-30)",
                    "default": 10,
                    "minimum": 1,
                    "maximum": 30
                }
            },
            "required": ["repo", "query"]
        }
    }
]`
        }}
      />

      <h2>Authentication Patterns</h2>

      <p>
        Authentication should be injected by the tool layer, never exposed to the agent.
        The model should not see API keys, tokens, or credentials — they should not appear
        in tool schemas, system prompts, or conversation history.
      </p>

      <ConceptBlock term="Credential Injection">
        Credential injection is the pattern of loading authentication secrets from environment
        variables or a secrets manager and adding them to requests inside the tool implementation,
        invisible to the LLM. The tool schema describes what the agent needs to provide (the
        resource identifier, query parameters) but never asks for credentials. This keeps
        secrets out of the context window where they could be leaked in responses or logs.
      </ConceptBlock>

      <h2>Rate Limiting</h2>

      <p>
        APIs enforce rate limits that tools must respect. Hitting a rate limit returns an error;
        an agent that does not handle this will enter a failure loop. Three strategies handle
        rate limits gracefully:
      </p>

      <ul>
        <li><strong>Proactive tracking:</strong> Read rate limit headers on every response and slow down before hitting the limit.</li>
        <li><strong>Exponential backoff:</strong> On 429 responses, retry with exponentially increasing delays.</li>
        <li><strong>Informative errors:</strong> When rate limited, return an error that tells the agent to wait rather than retry immediately.</li>
      </ul>

      <h2>OpenAPI Spec to Tool Schema Conversion</h2>

      <p>
        Many APIs publish OpenAPI (Swagger) specifications. These can be automatically converted
        to Claude tool schemas, dramatically reducing the manual work of wrapping large APIs.
      </p>

      <SDKExample
        title="Convert OpenAPI Spec to Claude Tool Schema"
        tabs={{
          python: `import json
from typing import Any

def openapi_to_claude_tool(
    operation_id: str,
    operation: dict,
    parameters: list[dict]
) -> dict:
    """
    Convert an OpenAPI operation to a Claude tool schema.

    Args:
        operation_id: The operationId from the spec
        operation: The operation object from the spec
        parameters: List of parameter objects for this operation
    """
    properties = {}
    required = []

    for param in parameters:
        if param.get("in") not in ("query", "path"):
            continue
        schema = param.get("schema", {})
        properties[param["name"]] = {
            "type": schema.get("type", "string"),
            "description": param.get("description", f"The {param['name']} parameter")
        }
        if schema.get("enum"):
            properties[param["name"]]["enum"] = schema["enum"]
        if schema.get("default") is not None:
            properties[param["name"]]["default"] = schema["default"]
        if param.get("required", False):
            required.append(param["name"])

    # Also process requestBody if present
    request_body = operation.get("requestBody", {})
    if request_body:
        content = request_body.get("content", {})
        json_content = content.get("application/json", {})
        body_schema = json_content.get("schema", {})
        for prop_name, prop_schema in body_schema.get("properties", {}).items():
            properties[prop_name] = {
                "type": prop_schema.get("type", "string"),
                "description": prop_schema.get("description", prop_name)
            }
        required.extend(body_schema.get("required", []))

    return {
        "name": operation_id,
        "description": operation.get("summary", "") + " " + operation.get("description", ""),
        "input_schema": {
            "type": "object",
            "properties": properties,
            "required": list(set(required))
        }
    }

# Example: parse a minimal OpenAPI spec
openapi_spec = {
    "paths": {
        "/users/{user_id}": {
            "get": {
                "operationId": "get_user",
                "summary": "Get a user by ID.",
                "description": "Returns user profile data including name and email.",
                "parameters": [
                    {
                        "name": "user_id",
                        "in": "path",
                        "required": True,
                        "description": "The unique user identifier",
                        "schema": {"type": "string"}
                    }
                ]
            }
        }
    }
}

tools = []
for path, path_item in openapi_spec["paths"].items():
    for method, operation in path_item.items():
        if "operationId" in operation:
            tool = openapi_to_claude_tool(
                operation["operationId"],
                operation,
                operation.get("parameters", [])
            )
            tools.append(tool)

print(json.dumps(tools, indent=2))`
        }}
      />

      <PatternBlock
        name="Thin Tool Wrapper Pattern"
        category="API Integration"
        description="Keep tool implementations as thin wrappers around underlying API clients. The tool layer handles authentication, error translation, and schema validation. The underlying client handles HTTP mechanics. This separation makes tools easy to test and the underlying clients easy to swap."
        when={[
          "Wrapping any external REST, GraphQL, or RPC API",
          "Multiple tools share the same API base URL and authentication",
          "You need to mock the API in tests"
        ]}
        avoid={[
          "Putting business logic inside tool implementations",
          "Exposing raw HTTP error codes without translation",
          "Storing credentials in tool schema descriptions"
        ]}
      />

      <BestPracticeBlock title="Return Structured Data, Not Raw HTTP Responses">
        Raw API responses often contain dozens of fields the agent will never use. Select and
        reshape the response to include only what is relevant to the agent's task. A GitHub
        issue has 40+ fields; an agent typically needs 5: number, title, state, URL, and body.
        Trimming responses reduces token usage, improves response quality, and makes tool
        output easier to reason about.
      </BestPracticeBlock>

      <WarningBlock title="Never log tool calls that may contain sensitive data">
        API tools often process or return sensitive information: user records, financial data,
        authentication tokens, PII. Be deliberate about what gets logged. Log tool names and
        operation types for debugging, but redact or omit the content of inputs and outputs
        unless you have explicit data handling policies that permit it. A debug log that captures
        full tool call content can become a compliance liability.
      </WarningBlock>

      <NoteBlock title="Test tools against API sandbox environments">
        Most production APIs offer sandbox or test environments with predictable data.
        Run all tool integration tests against sandboxes, not production. An agent under test
        that calls a real Stripe or Twilio endpoint can cause real charges or send real messages.
        Gate production credentials behind explicit environment checks and default to sandbox
        in all test and development environments.
      </NoteBlock>
    </article>
  )
}
