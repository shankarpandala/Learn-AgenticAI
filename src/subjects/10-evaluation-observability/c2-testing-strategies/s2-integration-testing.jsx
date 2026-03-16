import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function IntegrationTesting() {
  return (
    <article className="prose-content">
      <h2>Integration Testing</h2>
      <p>
        Integration tests verify that a complete agent pipeline works correctly end-to-end —
        from raw user input through tool calls to a final response. Unlike unit tests, integration
        tests do not mock the agent loop itself; they test the real orchestration logic, actual
        tool invocations (against real or carefully controlled test services), and the full
        interaction between components.
      </p>

      <ConceptBlock term="Agent Integration Test">
        <p>
          An agent integration test runs the full agent pipeline against a controlled test
          environment. The LLM is called for real (or via a deterministic test harness), tools
          interact with sandboxed external services, and the test asserts on the final output,
          tool call sequence, and state transitions. These tests are slower than unit tests
          (typically 5–60 seconds) and run on pull requests and before releases rather than
          on every commit.
        </p>
      </ConceptBlock>

      <ArchitectureDiagram
        title="Integration Test — Full Pipeline"
        width={700}
        height={260}
        nodes={[
          { id: 'harness', label: 'Test Harness', type: 'external', x: 80, y: 130 },
          { id: 'agent', label: 'Agent\n(real loop)', type: 'agent', x: 250, y: 130 },
          { id: 'llm', label: 'LLM API\n(real / test key)', type: 'llm', x: 430, y: 60 },
          { id: 'tools', label: 'Tools\n(sandbox services)', type: 'tool', x: 430, y: 130 },
          { id: 'db', label: 'Test DB\n(ephemeral)', type: 'store', x: 430, y: 200 },
          { id: 'assert', label: 'Assertions', type: 'store', x: 600, y: 130 },
        ]}
        edges={[
          { from: 'harness', to: 'agent', label: 'input' },
          { from: 'agent', to: 'llm' },
          { from: 'agent', to: 'tools' },
          { from: 'agent', to: 'db' },
          { from: 'agent', to: 'assert', label: 'output + trace' },
        ]}
      />

      <h2>Real vs. Mocked External Services</h2>
      <p>
        Integration tests sit between unit tests (fully mocked) and production (fully real).
        The right balance depends on cost and risk: use real LLM calls sparingly (expensive and
        non-deterministic), use sandboxed/test-mode versions of external APIs (databases, search
        services), and use in-memory or ephemeral test instances for stateful services (Redis,
        Postgres).
      </p>

      <SDKExample
        title="Integration Tests for an Agent Pipeline"
        tabs={{
          python: `import pytest
import asyncio
from dataclasses import dataclass
from typing import Any
from unittest.mock import AsyncMock, patch

import anthropic

# ---- Agent under test ----

@dataclass
class AgentResult:
    output: str
    tool_calls: list[dict]
    step_count: int

class ResearchAgent:
    def __init__(self, client: anthropic.AsyncAnthropic):
        self.client = client
        self.tools = self._define_tools()

    def _define_tools(self) -> list[dict]:
        return [
            {
                "name": "web_search",
                "description": "Search the web for information",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "max_results": {"type": "integer", "default": 5},
                    },
                    "required": ["query"],
                },
            },
            {
                "name": "summarize_url",
                "description": "Fetch and summarize a URL",
                "input_schema": {
                    "type": "object",
                    "properties": {"url": {"type": "string"}},
                    "required": ["url"],
                },
            },
        ]

    async def _execute_tool(self, name: str, inputs: dict) -> str:
        """Dispatch tool calls to implementations."""
        if name == "web_search":
            return await self._web_search(inputs["query"], inputs.get("max_results", 5))
        if name == "summarize_url":
            return await self._summarize_url(inputs["url"])
        raise ValueError(f"Unknown tool: {name}")

    async def _web_search(self, query: str, max_results: int) -> str:
        # Real implementation calls external API
        raise NotImplementedError("Override in tests")

    async def _summarize_url(self, url: str) -> str:
        raise NotImplementedError("Override in tests")

    async def run(self, user_input: str, max_steps: int = 10) -> AgentResult:
        messages = [{"role": "user", "content": user_input}]
        tool_calls_made = []

        for step in range(max_steps):
            response = await self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2048,
                tools=self.tools,
                messages=messages,
            )

            if response.stop_reason == "end_turn":
                text = next(
                    (b.text for b in response.content if hasattr(b, "text")), ""
                )
                return AgentResult(
                    output=text,
                    tool_calls=tool_calls_made,
                    step_count=step + 1,
                )

            if response.stop_reason == "tool_use":
                tool_uses = [b for b in response.content if b.type == "tool_use"]
                tool_results = []
                for tool_use in tool_uses:
                    result = await self._execute_tool(tool_use.name, tool_use.input)
                    tool_calls_made.append({"name": tool_use.name, "input": tool_use.input})
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": result,
                    })
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})

        raise TimeoutError(f"Agent exceeded {max_steps} steps")

# ---- Integration Tests ----

class TestResearchAgentIntegration:
    """Integration tests using real LLM API with mocked tools."""

    @pytest.fixture
    def client(self):
        return anthropic.AsyncAnthropic()  # real API key from env

    @pytest.fixture
    def agent(self, client):
        agent = ResearchAgent(client=client)
        # Mock tool implementations to control environment
        agent._web_search = AsyncMock(return_value=json.dumps([
            {"title": "OpenAI GPT-4 Technical Report", "url": "https://arxiv.org/abs/2303.08774"},
            {"title": "Anthropic Claude 3 Model Card", "url": "https://anthropic.com/claude"},
        ]))
        agent._summarize_url = AsyncMock(
            return_value="This paper describes a large language model with..."
        )
        return agent

    @pytest.mark.asyncio
    @pytest.mark.integration  # mark for selective CI runs
    async def test_agent_uses_search_for_factual_query(self, agent):
        result = await agent.run("Find recent large language model papers from 2024")

        # Assert tool was called
        tool_names = [tc["name"] for tc in result.tool_calls]
        assert "web_search" in tool_names, "Agent should use web_search for research queries"

        # Assert final output is non-empty
        assert len(result.output) > 50, "Agent should produce a substantive response"

        # Assert efficiency
        assert result.step_count <= 5, f"Agent took too many steps: {result.step_count}"

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_agent_does_not_call_tools_for_simple_query(self, agent):
        result = await agent.run("What is 2 + 2?")
        assert result.tool_calls == [], "Agent should not use tools for simple math"
        assert "4" in result.output

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_agent_handles_tool_failure_gracefully(self, agent):
        agent._web_search = AsyncMock(side_effect=RuntimeError("Search API unavailable"))

        # Agent should handle the error and produce some response rather than crash
        with pytest.raises((RuntimeError, Exception)):
            result = await agent.run("Search for recent AI news")
            # If it doesn't raise, verify it handled gracefully
            assert result.output  # should still return something

# conftest.py addition for integration test markers
# Add to pytest.ini or pyproject.toml:
# [tool.pytest.ini_options]
# markers = ["integration: marks tests as integration tests (deselect with '-m not integration')"]`,
          typescript: `import { describe, it, expect, vi, beforeEach } from "vitest";
import Anthropic from "@anthropic-ai/sdk";

// ---- Agent Under Test ----

interface AgentResult {
  output: string;
  toolCalls: Array<{ name: string; input: Record<string, unknown> }>;
  stepCount: number;
}

class ResearchAgent {
  private client: Anthropic;
  private tools: Anthropic.Tool[];

  constructor(client: Anthropic) {
    this.client = client;
    this.tools = [
      {
        name: "web_search",
        description: "Search the web for information",
        input_schema: {
          type: "object" as const,
          properties: {
            query: { type: "string" },
            max_results: { type: "integer" },
          },
          required: ["query"],
        },
      },
    ];
  }

  // Override these in tests
  async webSearch(query: string, maxResults = 5): Promise<string> {
    throw new Error("Not implemented");
  }

  private async executeTool(
    name: string,
    inputs: Record<string, unknown>
  ): Promise<string> {
    if (name === "web_search")
      return this.webSearch(inputs.query as string, inputs.max_results as number);
    throw new Error(Unknown tool: \${name});
  }

  async run(userInput: string, maxSteps = 10): Promise<AgentResult> {
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: userInput },
    ];
    const toolCallsMade: AgentResult["toolCalls"] = [];

    for (let step = 0; step < maxSteps; step++) {
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        tools: this.tools,
        messages,
      });

      if (response.stop_reason === "end_turn") {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
        return { output: text, toolCalls: toolCallsMade, stepCount: step + 1 };
      }

      if (response.stop_reason === "tool_use") {
        const toolUses = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
        );
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const toolUse of toolUses) {
          const result = await this.executeTool(
            toolUse.name,
            toolUse.input as Record<string, unknown>
          );
          toolCallsMade.push({ name: toolUse.name, input: toolUse.input as Record<string, unknown> });
          toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: result });
        }
        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResults });
      }
    }
    throw new Error(Agent exceeded \${maxSteps} steps);
  }
}

// ---- Integration Tests ----

describe("ResearchAgent integration", () => {
  let agent: ResearchAgent;

  beforeEach(() => {
    const client = new Anthropic(); // real API key from env
    agent = new ResearchAgent(client);
    // Mock tool implementations
    agent.webSearch = vi.fn().mockResolvedValue(
      JSON.stringify([
        { title: "GPT-4 Technical Report", url: "https://arxiv.org/abs/2303.08774" },
      ])
    );
  });

  it("uses web_search for research queries", async () => {
    const result = await agent.run("Find recent large language model papers from 2024");
    const toolNames = result.toolCalls.map((tc) => tc.name);
    expect(toolNames).toContain("web_search");
    expect(result.output.length).toBeGreaterThan(50);
    expect(result.stepCount).toBeLessThanOrEqual(5);
  }, 30_000); // 30 second timeout for real LLM call

  it("does not call tools for simple queries", async () => {
    const result = await agent.run("What is 2 + 2?");
    expect(result.toolCalls).toHaveLength(0);
    expect(result.output).toContain("4");
  }, 15_000);
});`,
        }}
      />

      <PatternBlock
        name="Sandbox External Services"
        category="Test Infrastructure"
        whenToUse="When integration tests need to call external APIs (search engines, databases, third-party services) without paying real costs or affecting production data."
      >
        <p>
          Spin up lightweight sandbox versions of external services for integration tests:
          use LocalStack for AWS services, a Docker-based Postgres for databases, WireMock or
          msw for HTTP APIs, and in-memory vector stores for RAG pipelines. Record real API
          responses once with a VCR-style cassette library, then replay them deterministically
          in CI. This keeps integration tests fast, cost-free, and independent of external
          service availability.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Assert on Trace Structure, Not Just Final Output">
        <p>
          Integration tests should assert on the full trace — which tools were called, in what
          order, and with what arguments — not just the final text response. A correct final
          answer reached through an inefficient or incorrect tool sequence is a bug waiting to
          manifest. Assert that: (1) required tools were called; (2) tool arguments were
          reasonable; (3) step count was within acceptable bounds; (4) no error recovery paths
          were triggered unexpectedly.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Gate Integration Tests on PRs, Not Every Commit">
        <p>
          Integration tests calling real LLM APIs cost money and take minutes. Run them
          automatically on every pull request and every merge to main, but not on every developer
          commit. Use test markers (<code>@pytest.mark.integration</code>, Vitest tags) to
          separate unit and integration suites. Developers run unit tests locally; CI runs both.
          Budget approximately $0.01–$0.10 per integration test suite run for medium-complexity
          agents.
        </p>
      </NoteBlock>
    </article>
  )
}
