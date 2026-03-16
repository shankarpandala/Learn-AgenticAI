import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function DeploymentStrategies() {
  return (
    <article className="prose-content">
      <h2>Deployment Strategies for Production Agents</h2>
      <p>
        Deploying a new version of an agent carries unique risks compared to traditional
        software: a changed system prompt, a different model version, or an updated tool
        definition can silently alter behaviour across millions of interactions. Blue-green
        deployments, canary releases, and feature flags give teams controlled ways to
        roll out agent changes with fast rollback paths.
      </p>

      <ArchitectureDiagram
        title="Canary Deployment for Agent Services"
        width={700}
        height={260}
        nodes={[
          { id: 'router', label: 'Traffic\nRouter', type: 'tool', x: 120, y: 130 },
          { id: 'stable', label: 'Stable\nAgent v1\n(95%)', type: 'agent', x: 340, y: 60 },
          { id: 'canary', label: 'Canary\nAgent v2\n(5%)', type: 'agent', x: 340, y: 200 },
          { id: 'metrics', label: 'Metrics +\nAlerts', type: 'store', x: 560, y: 130 },
        ]}
        edges={[
          { from: 'router', to: 'stable', label: '95%' },
          { from: 'router', to: 'canary', label: '5%' },
          { from: 'stable', to: 'metrics' },
          { from: 'canary', to: 'metrics' },
        ]}
      />

      <h2>Blue-Green Deployment</h2>

      <ConceptBlock term="Blue-Green Deployment">
        <p>
          Blue-green deployment runs two identical production environments simultaneously.
          The "blue" environment serves live traffic. The "green" environment receives the
          new agent version and is tested in isolation. When green passes all checks, traffic
          is switched atomically. Rollback is a single router config change to revert to blue.
          The key cost is running two full environments concurrently.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Blue-Green Agent Routing with Version Metadata"
        tabs={{
          python: `import anthropic
import os
from dataclasses import dataclass

@dataclass
class AgentVersion:
    color: str           # "blue" | "green"
    model: str
    system_prompt: str
    tools: list
    version_tag: str

# Two live configurations
BLUE = AgentVersion(
    color="blue",
    model="claude-opus-4-5",
    system_prompt="You are a helpful customer service assistant. Be concise.",
    tools=[],
    version_tag="v1.4.2",
)

GREEN = AgentVersion(
    color="green",
    model="claude-opus-4-5",
    system_prompt="You are a helpful customer service assistant. "
                  "Be concise and always offer a follow-up question.",
    tools=[],
    version_tag="v1.5.0",
)

# Environment variable controls which is active
ACTIVE_COLOR = os.environ.get("AGENT_ACTIVE_COLOR", "blue")
AGENT_VERSIONS = {"blue": BLUE, "green": GREEN}

def get_active_agent() -> AgentVersion:
    return AGENT_VERSIONS[ACTIVE_COLOR]

def run_agent(user_message: str, session_id: str) -> dict:
    version = get_active_agent()
    client = anthropic.Anthropic()

    response = client.messages.create(
        model=version.model,
        max_tokens=1024,
        system=version.system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    return {
        "response": response.content[0].text,
        # Tag every response with the version for metrics attribution
        "agent_version": version.version_tag,
        "agent_color": version.color,
        "session_id": session_id,
    }

# Deployment script: switch green to active
def promote_green():
    """Run this after green validation passes to switch traffic."""
    # In a real system, update environment variable or feature flag service
    print("Setting AGENT_ACTIVE_COLOR=green in your config store")
    print("Blue (v1.4.2) remains running as instant rollback target")

def rollback_to_blue():
    """Instant rollback — no redeploy needed."""
    print("Setting AGENT_ACTIVE_COLOR=blue in your config store")`,
        }}
      />

      <h2>Canary Releases</h2>

      <ConceptBlock term="Canary Release">
        <p>
          A canary release routes a small percentage of traffic (typically 1–10%) to the new
          agent version. Metrics are compared between the canary and the stable version.
          If error rates, latency, or quality scores are within acceptable bounds, the rollout
          percentage is gradually increased to 100%. Any regression triggers an automatic
          rollback of the canary slice.
        </p>
      </ConceptBlock>

      <SDKExample
        title="Canary Traffic Splitting"
        tabs={{
          python: `import anthropic
import random
import hashlib
import time
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class CanaryConfig:
    canary_percentage: float = 0.05   # 5% to canary
    sticky_sessions: bool = True      # Same user always same version

class CanaryRouter:
    def __init__(self, config: CanaryConfig):
        self.config = config
        self._metrics = {"stable": [], "canary": []}

    def get_version_for_user(self, user_id: str) -> str:
        if self.config.sticky_sessions:
            # Hash user_id for deterministic assignment
            h = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
            ratio = (h % 10000) / 10000
        else:
            ratio = random.random()

        return "canary" if ratio < self.config.canary_percentage else "stable"

    def record_metric(self, version: str, latency_ms: float, error: bool):
        self._metrics[version].append({"latency": latency_ms, "error": error})

    def should_rollback(self) -> bool:
        """Return True if canary error rate exceeds stable by 2x."""
        if len(self._metrics["canary"]) < 100:
            return False  # Not enough data yet
        canary_errors = sum(1 for m in self._metrics["canary"] if m["error"])
        stable_errors = sum(1 for m in self._metrics["stable"] if m["error"])
        canary_rate = canary_errors / len(self._metrics["canary"])
        stable_rate = stable_errors / max(len(self._metrics["stable"]), 1)
        return canary_rate > stable_rate * 2

AGENT_CONFIGS = {
    "stable": {
        "model": "claude-opus-4-5",
        "system": "You are a helpful assistant.",
        "version": "v2.0.1",
    },
    "canary": {
        "model": "claude-opus-4-5",
        "system": "You are a helpful assistant. Always structure answers with bullet points.",
        "version": "v2.1.0-canary",
    },
}

router = CanaryRouter(CanaryConfig(canary_percentage=0.05))
client = anthropic.Anthropic()

def run_agent(user_message: str, user_id: str) -> dict:
    version_name = router.get_version_for_user(user_id)
    config = AGENT_CONFIGS[version_name]
    start = time.monotonic()
    error = False

    try:
        response = client.messages.create(
            model=config["model"],
            max_tokens=1024,
            system=config["system"],
            messages=[{"role": "user", "content": user_message}],
        )
        text = response.content[0].text
    except Exception as e:
        logger.error("Agent error (version=%s): %s", version_name, e)
        text = "Sorry, I encountered an error."
        error = True

    latency_ms = (time.monotonic() - start) * 1000
    router.record_metric(version_name, latency_ms, error)

    if router.should_rollback():
        logger.critical("Canary regression detected — triggering rollback")
        # Notify on-call, update config store, etc.

    return {
        "response": text,
        "version": config["version"],
        "version_slot": version_name,
    }`,
        }}
      />

      <h2>Feature Flags for Agent Behaviour</h2>

      <PatternBlock
        name="Feature Flags"
        category="Deployment"
        whenToUse="When you want to enable or disable specific agent capabilities (tools, prompt changes, model upgrades) for specific users, tenants, or environments without redeploying."
      >
        <p>
          Feature flags decouple deployment from release. Deploy the new agent code to
          production but gate the new behaviour behind a flag. Gradually enable the flag
          for internal users, then beta users, then all users — collecting feedback at each
          stage. Flags also enable instant kill switches if a new feature misbehaves in
          production.
        </p>
      </PatternBlock>

      <SDKExample
        title="Feature Flag-Controlled Agent Capabilities"
        tabs={{
          python: `import anthropic
from dataclasses import dataclass

@dataclass
class FeatureFlags:
    enable_web_search: bool = False
    enable_code_execution: bool = False
    use_extended_thinking: bool = False
    max_tokens: int = 2048
    model: str = "claude-opus-4-5"

# Simulate a feature flag service (LaunchDarkly, Unleash, etc.)
FLAG_OVERRIDES: dict[str, FeatureFlags] = {
    "user:beta-tester-1": FeatureFlags(enable_web_search=True, use_extended_thinking=True),
    "tenant:enterprise-a": FeatureFlags(enable_code_execution=True, max_tokens=8192),
}
DEFAULT_FLAGS = FeatureFlags()

def get_flags(context_key: str) -> FeatureFlags:
    return FLAG_OVERRIDES.get(context_key, DEFAULT_FLAGS)

def build_tools(flags: FeatureFlags) -> list:
    tools = []
    if flags.enable_web_search:
        tools.append({
            "name": "web_search",
            "description": "Search the web for up-to-date information.",
            "input_schema": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        })
    if flags.enable_code_execution:
        tools.append({
            "name": "execute_python",
            "description": "Execute Python code and return the result.",
            "input_schema": {
                "type": "object",
                "properties": {"code": {"type": "string"}},
                "required": ["code"],
            },
        })
    return tools

def run_agent(user_message: str, context_key: str) -> str:
    flags = get_flags(context_key)
    tools = build_tools(flags)
    client = anthropic.Anthropic()

    kwargs = {
        "model": flags.model,
        "max_tokens": flags.max_tokens,
        "messages": [{"role": "user", "content": user_message}],
    }
    if tools:
        kwargs["tools"] = tools
    if flags.use_extended_thinking:
        kwargs["thinking"] = {"type": "enabled", "budget_tokens": 5000}

    response = client.messages.create(**kwargs)
    return next(
        b.text for b in response.content if hasattr(b, "text")
    )`,
        }}
      />

      <BestPracticeBlock title="Version Every Agent Artefact">
        <p>
          Tag every agent invocation with the version of: the system prompt, the model ID,
          the tool definitions, and the application code. Store these tags on every log line
          and trace span. When a quality regression is detected in production, you need to
          know exactly which artefact combination produced the bad output to reproduce and
          fix it. A response without version metadata is nearly impossible to debug retrospectively.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Never Test Agent Behaviour Only in Staging">
        <p>
          Agent behaviour can differ subtly between staging and production due to different
          traffic patterns, context distributions, and user phrasing. Always use canary
          deployments to expose real production traffic to new agent versions before full
          rollout. Staging catches configuration errors; canaries catch behavioural regressions.
        </p>
      </NoteBlock>
    </article>
  )
}
