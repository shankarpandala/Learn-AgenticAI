import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function UnitTestingAgents() {
  return (
    <article className="prose-content">
      <h2>Unit Testing Agents</h2>
      <p>
        Unit tests for agents follow the same principle as unit tests for any software: isolate
        the smallest testable unit, verify its behaviour deterministically, and run fast enough
        to gate every commit. For agents, the testable units are individual tools, prompt
        templates, routing logic, and output parsers — not the full agent loop.
      </p>

      <ConceptBlock term="Agent Unit Test">
        <p>
          An agent unit test exercises a single component in isolation, mocking or stubbing all
          external dependencies (LLM calls, external APIs, databases). This makes tests fast
          (&lt;100ms), deterministic, and independent of LLM latency or API availability. Unit
          tests catch structural bugs in tool implementations, argument validation, output
          parsing, and prompt construction — before the agent is ever run end-to-end.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Agent Unit Test Scope"
        width={700}
        height={240}
        nodes={[
          { id: 'tool', label: 'Tool\nFunction', type: 'tool', x: 120, y: 80 },
          { id: 'prompt', label: 'Prompt\nTemplate', type: 'tool', x: 280, y: 80 },
          { id: 'router', label: 'Routing\nLogic', type: 'agent', x: 440, y: 80 },
          { id: 'parser', label: 'Output\nParser', type: 'tool', x: 600, y: 80 },
          { id: 'llm', label: 'LLM (mocked)', type: 'llm', x: 360, y: 190 },
        ]}
        edges={[
          { from: 'tool', to: 'llm', label: 'stubbed' },
          { from: 'prompt', to: 'llm', label: 'stubbed' },
          { from: 'router', to: 'llm', label: 'stubbed' },
          { from: 'parser', to: 'llm', label: 'stubbed' },
        ]}
      />

      <h2>What to Unit Test</h2>
      <ul>
        <li><strong>Tool functions:</strong> correct return values, error handling, argument validation</li>
        <li><strong>Prompt templates:</strong> correct variable substitution, expected sections present, token count within limits</li>
        <li><strong>Routing logic:</strong> intent classifier or router selects the right agent/tool for each input class</li>
        <li><strong>Output parsers:</strong> structured extraction from LLM text, graceful fallback on malformed output</li>
        <li><strong>State transitions:</strong> agent state machine advances correctly given specific tool results</li>
      </ul>

      <SDKExample
        title="Unit Tests for Agent Tools, Prompts, and Routing"
        tabs={{
          python: `import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from typing import Any

# ---- Tool Under Test ----
import httpx

async def search_web(query: str, max_results: int = 5) -> list[dict]:
    """Search the web and return structured results."""
    if not query.strip():
        raise ValueError("Query cannot be empty")
    if max_results < 1 or max_results > 20:
        raise ValueError("max_results must be between 1 and 20")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.search.example.com/search",
            params={"q": query, "limit": max_results},
            timeout=10.0,
        )
        response.raise_for_status()
        return response.json()["results"]

# ---- Unit Tests for Tool ----

@pytest.mark.asyncio
async def test_search_web_returns_results():
    mock_results = [{"title": "Result 1", "url": "https://example.com"}]
    with patch("httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client_class.return_value.__aenter__.return_value = mock_client
        mock_response = MagicMock()
        mock_response.json.return_value = {"results": mock_results}
        mock_client.get.return_value = mock_response

        results = await search_web("AI agents", max_results=1)
        assert results == mock_results
        mock_client.get.assert_called_once()

@pytest.mark.asyncio
async def test_search_web_rejects_empty_query():
    with pytest.raises(ValueError, match="Query cannot be empty"):
        await search_web("")

@pytest.mark.asyncio
async def test_search_web_rejects_invalid_max_results():
    with pytest.raises(ValueError, match="max_results must be between"):
        await search_web("test", max_results=0)
    with pytest.raises(ValueError, match="max_results must be between"):
        await search_web("test", max_results=25)

# ---- Prompt Template Tests ----

def build_system_prompt(
    agent_name: str,
    tools: list[str],
    max_steps: int,
) -> str:
    return f"""You are {agent_name}, an AI assistant.
Available tools: {", ".join(tools)}
Complete the task in at most {max_steps} steps.
Always cite your sources."""

def test_system_prompt_contains_agent_name():
    prompt = build_system_prompt("ResearchBot", ["web_search"], 10)
    assert "ResearchBot" in prompt

def test_system_prompt_lists_all_tools():
    tools = ["web_search", "calculator", "file_read"]
    prompt = build_system_prompt("Bot", tools, 10)
    for tool in tools:
        assert tool in prompt

def test_system_prompt_enforces_step_limit():
    prompt = build_system_prompt("Bot", ["web_search"], 5)
    assert "5" in prompt

def test_system_prompt_token_count():
    """Ensure prompt stays within reasonable token budget."""
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")
    prompt = build_system_prompt("Bot", ["web_search"] * 20, 10)
    token_count = len(enc.encode(prompt))
    assert token_count < 500, f"System prompt too long: {token_count} tokens"

# ---- Routing Logic Tests ----

def classify_intent(user_input: str) -> str:
    """Simple keyword-based intent router."""
    input_lower = user_input.lower()
    if any(word in input_lower for word in ["search", "find", "look up", "what is"]):
        return "search"
    if any(word in input_lower for word in ["calculate", "compute", "math", "how many"]):
        return "math"
    if any(word in input_lower for word in ["write", "draft", "compose", "create"]):
        return "write"
    return "general"

@pytest.mark.parametrize("input,expected_intent", [
    ("Search for recent papers on LLMs", "search"),
    ("Find the capital of France", "search"),
    ("Calculate 15% of 240", "math"),
    ("How many days are in a leap year?", "math"),
    ("Write a cover letter for a data science role", "write"),
    ("Draft an email to my team", "write"),
    ("Hello there", "general"),
])
def test_intent_classification(input, expected_intent):
    assert classify_intent(input) == expected_intent

# ---- Output Parser Tests ----
import json

def parse_structured_output(llm_response: str) -> dict:
    """Extract JSON from LLM response that may contain prose."""
    import re
    json_match = re.search(r'\\{[^{}]*\\}', llm_response, re.DOTALL)
    if not json_match:
        raise ValueError(f"No JSON found in response: {llm_response[:100]}")
    return json.loads(json_match.group())

def test_parser_extracts_json_from_prose():
    response = 'Here is the result: {"score": 4, "reason": "good"} Let me know.'
    result = parse_structured_output(response)
    assert result == {"score": 4, "reason": "good"}

def test_parser_handles_clean_json():
    response = '{"action": "search", "query": "AI"}'
    result = parse_structured_output(response)
    assert result["action"] == "search"

def test_parser_raises_on_missing_json():
    with pytest.raises(ValueError, match="No JSON found"):
        parse_structured_output("I cannot provide that information.")`,
          typescript: `import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Tool Under Test ----

interface SearchResult {
  title: string;
  url: string;
}

async function searchWeb(
  query: string,
  maxResults = 5
): Promise<SearchResult[]> {
  if (!query.trim()) throw new Error("Query cannot be empty");
  if (maxResults < 1 || maxResults > 20)
    throw new Error("maxResults must be between 1 and 20");

  const response = await fetch(
    https://api.search.example.com/search?q=\${encodeURIComponent(query)}&limit=\${maxResults}
  );
  if (!response.ok) throw new Error(Search failed: \${response.status});
  const data = await response.json();
  return data.results;
}

// ---- Unit Tests for Tool ----

describe("searchWeb", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns results from API", async () => {
    const mockResults = [{ title: "Result 1", url: "https://example.com" }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: mockResults }),
    });

    const results = await searchWeb("AI agents", 1);
    expect(results).toEqual(mockResults);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("rejects empty query", async () => {
    await expect(searchWeb("")).rejects.toThrow("Query cannot be empty");
  });

  it("rejects invalid maxResults", async () => {
    await expect(searchWeb("test", 0)).rejects.toThrow("maxResults must be between");
    await expect(searchWeb("test", 25)).rejects.toThrow("maxResults must be between");
  });
});

// ---- Prompt Template Tests ----

function buildSystemPrompt(
  agentName: string,
  tools: string[],
  maxSteps: number
): string {
  return You are \${agentName}, an AI assistant.
Available tools: \${tools.join(", ")}
Complete the task in at most \${maxSteps} steps.
Always cite your sources.;
}

describe("buildSystemPrompt", () => {
  it("contains agent name", () => {
    const prompt = buildSystemPrompt("ResearchBot", ["web_search"], 10);
    expect(prompt).toContain("ResearchBot");
  });

  it("lists all tools", () => {
    const tools = ["web_search", "calculator", "file_read"];
    const prompt = buildSystemPrompt("Bot", tools, 10);
    tools.forEach((tool) => expect(prompt).toContain(tool));
  });

  it("enforces step limit", () => {
    const prompt = buildSystemPrompt("Bot", ["web_search"], 5);
    expect(prompt).toContain("5");
  });
});

// ---- Routing Logic Tests ----

function classifyIntent(userInput: string): string {
  const lower = userInput.toLowerCase();
  if (/search|find|look up|what is/.test(lower)) return "search";
  if (/calculate|compute|math|how many/.test(lower)) return "math";
  if (/write|draft|compose|create/.test(lower)) return "write";
  return "general";
}

describe("classifyIntent", () => {
  const cases: [string, string][] = [
    ["Search for recent papers on LLMs", "search"],
    ["Find the capital of France", "search"],
    ["Calculate 15% of 240", "math"],
    ["How many days are in a leap year?", "math"],
    ["Write a cover letter for a data science role", "write"],
    ["Draft an email to my team", "write"],
    ["Hello there", "general"],
  ];

  cases.forEach(([input, expected]) => {
    it(classifies "\${input.slice(0, 30)}..." as \${expected}, () => {
      expect(classifyIntent(input)).toBe(expected);
    });
  });
});

// ---- Output Parser Tests ----

function parseStructuredOutput(llmResponse: string): Record<string, unknown> {
  const match = llmResponse.match(/\\{[^{}]*\\}/s);
  if (!match) throw new Error(No JSON found in response: \${llmResponse.slice(0, 100)});
  return JSON.parse(match[0]);
}

describe("parseStructuredOutput", () => {
  it("extracts JSON from prose", () => {
    const response = 'Here is the result: {"score": 4, "reason": "good"} Let me know.';
    expect(parseStructuredOutput(response)).toEqual({ score: 4, reason: "good" });
  });

  it("handles clean JSON", () => {
    const response = '{"action": "search", "query": "AI"}';
    expect(parseStructuredOutput(response).action).toBe("search");
  });

  it("throws on missing JSON", () => {
    expect(() =>
      parseStructuredOutput("I cannot provide that information.")
    ).toThrow("No JSON found");
  });
});`,
        }}
      />

      <PatternBlock
        name="Deterministic Tool Mocking"
        category="Testing"
        whenToUse="When you need fast, reproducible unit tests that do not depend on LLM API availability or produce non-deterministic outputs."
      >
        <p>
          Replace all LLM calls with pre-recorded fixtures or simple stubs that return hardcoded
          responses. Store fixtures as JSON files alongside the tests. This allows the CI pipeline
          to run agent unit tests without network access, making them orders of magnitude faster
          and eliminating flakiness caused by model output variance.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Test Tool Error Handling Exhaustively">
        <p>
          The most common source of agent failures in production is a tool returning an unexpected
          error or malformed response. Unit test every error path: network timeouts, HTTP 4xx/5xx
          responses, empty results, malformed JSON, and rate limit errors. Verify that the tool
          raises specific, informative exceptions rather than silently returning <code>None</code>
          or an empty list — the agent's error recovery depends on meaningful error signals.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="info" title="Unit Tests Do Not Test Reasoning">
        <p>
          Unit tests verify structural correctness — argument handling, return types, error paths.
          They cannot test whether the agent reasons correctly, chooses the right tool for a given
          situation, or produces a helpful response. That requires integration tests (testing the
          full agent loop) and evaluation against a dataset. Unit tests are necessary but not
          sufficient for agent quality assurance.
        </p>
      </NoteBlock>
    </article>
  )
}
