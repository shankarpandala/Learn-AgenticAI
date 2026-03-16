import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import CodeBlock from '../../../components/content/CodeBlock.jsx'
import ArchitectureDiagram from '../../../components/viz/ArchitectureDiagram.jsx'

export default function ManagedAgentServices() {
  return (
    <article className="prose-content">
      <h2>Managed Agent Services: Build vs. Buy Decision</h2>
      <p>
        Each major cloud provider offers a fully managed agent hosting service that eliminates
        the need to build and maintain an agent loop, tool execution infrastructure, and state
        management. These managed services make different trade-offs between flexibility, control,
        and operational simplicity.
      </p>

      <ArchitectureDiagram
        title="Managed Agent Service Architectures"
        width={700}
        height={280}
        nodes={[
          { id: 'user', label: 'User / App', type: 'external', x: 60, y: 140 },
          { id: 'azure', label: 'Azure AI\nAgent Service', type: 'agent', x: 240, y: 60 },
          { id: 'bedrock', label: 'Bedrock\nAgents', type: 'agent', x: 240, y: 140 },
          { id: 'vertex', label: 'Vertex AI\nAgent Builder', type: 'agent', x: 240, y: 220 },
          { id: 'tools', label: 'Tools / APIs', type: 'tool', x: 460, y: 100 },
          { id: 'rag', label: 'Knowledge / RAG', type: 'store', x: 460, y: 200 },
        ]}
        edges={[
          { from: 'user', to: 'azure' },
          { from: 'user', to: 'bedrock' },
          { from: 'user', to: 'vertex' },
          { from: 'azure', to: 'tools' },
          { from: 'bedrock', to: 'tools' },
          { from: 'vertex', to: 'tools' },
          { from: 'azure', to: 'rag' },
          { from: 'bedrock', to: 'rag' },
          { from: 'vertex', to: 'rag' },
        ]}
      />

      <h2>Azure AI Agent Service</h2>

      <ConceptBlock term="Azure AI Agent Service">
        <p>
          Azure AI Agent Service is Microsoft's managed agent hosting platform, available via
          Azure AI Foundry. It provides server-side orchestration: threads (conversation history),
          built-in tools (code interpreter, file search, Bing grounding, function calling),
          and streaming support. Agents are defined once and called via the SDK — no custom
          agentic loop needed.
        </p>
      </ConceptBlock>

      <h3>Key Capabilities</h3>
      <ul>
        <li><strong>Built-in tools:</strong> Code interpreter (sandbox Python/data analysis), file search (vector store with auto-chunking + embedding), Bing grounding (real-time web search), function calling</li>
        <li><strong>Persistent threads:</strong> Conversation history managed server-side — resume across sessions</li>
        <li><strong>Vector store management:</strong> Upload files once, attach to multiple agents</li>
        <li><strong>Streaming:</strong> Stream intermediate steps (tool calls, thoughts) to the client</li>
        <li><strong>Multi-model:</strong> GPT-4o, GPT-4o-mini, or Azure AI Foundry catalog models</li>
        <li><strong>Compliance:</strong> Data stays in your Azure region; no training on your data</li>
      </ul>

      <h3>When to Choose Azure AI Agent Service</h3>
      <ul>
        <li>Already Azure-native with existing Azure OpenAI deployments</li>
        <li>Need built-in file search (document Q&A) without managing a vector DB</li>
        <li>Need code interpreter for data analysis workflows</li>
        <li>Teams using Microsoft 365 / Azure AD identity</li>
        <li>Data residency requirements met by Azure regions</li>
      </ul>

      <h2>Amazon Bedrock Agents</h2>

      <ConceptBlock term="Amazon Bedrock Agents">
        <p>
          Bedrock Agents is AWS's fully managed orchestration layer for building agents on
          Amazon Bedrock. An agent is configured with: a foundation model, instructions, action
          groups (Lambda-backed tools with OpenAPI schemas), and knowledge bases (managed RAG).
          Bedrock Agents handles the ReAct loop — planning, tool invocation, and response
          synthesis — without any custom orchestration code.
        </p>
      </ConceptBlock>

      <h3>Key Capabilities</h3>
      <ul>
        <li><strong>Action groups:</strong> Tools defined by OpenAPI schemas, backed by Lambda functions</li>
        <li><strong>Knowledge bases:</strong> Managed RAG with S3 + OpenSearch Serverless or Aurora pgvector</li>
        <li><strong>Agent aliases + versions:</strong> Immutable agent snapshots for blue/green deployments</li>
        <li><strong>Multi-agent collaboration:</strong> Supervisor agent delegates to specialized sub-agents</li>
        <li><strong>Inline agents:</strong> Create ephemeral agents dynamically (no console required)</li>
        <li><strong>Session memory:</strong> Optional cross-session memory for personalization</li>
        <li><strong>Guardrails integration:</strong> Apply content filters, PII redaction at the agent level</li>
      </ul>

      <h3>When to Choose Bedrock Agents</h3>
      <ul>
        <li>AWS-native stack with Lambda, S3, DynamoDB</li>
        <li>Need managed RAG with automatic S3 sync and OpenSearch Serverless</li>
        <li>Lambda is the natural home for your business logic</li>
        <li>Multi-agent architectures where Bedrock models are primary</li>
        <li>FedRAMP or AWS GovCloud requirements</li>
      </ul>

      <h2>Vertex AI Agent Builder</h2>

      <ConceptBlock term="Vertex AI Agent Builder">
        <p>
          Vertex AI Agent Builder is Google Cloud's platform for building and deploying AI agents
          without managing infrastructure. It supports two complementary paradigms:
          <strong>Playbooks</strong> (LLM-based, instruction-following agents for flexible tasks)
          and <strong>Flows</strong> (Dialogflow CX-based, deterministic flows for high-reliability
          processes). Both can attach data stores for RAG grounding and tools for external APIs.
        </p>
      </ConceptBlock>

      <h3>Key Capabilities</h3>
      <ul>
        <li><strong>Playbooks:</strong> LLM-driven agents with natural language instructions, examples, and tools</li>
        <li><strong>Flows:</strong> Deterministic conversation flows with visual editor (Dialogflow CX)</li>
        <li><strong>Data stores:</strong> RAG over Cloud Storage, BigQuery, websites, third-party connectors</li>
        <li><strong>Evaluation:</strong> Built-in metrics (tool call accuracy, trajectory match, safety)</li>
        <li><strong>Gemini grounding:</strong> Direct integration with Vertex AI Search and Google Search</li>
        <li><strong>Multi-region:</strong> Deploy agents in specific GCP regions for data residency</li>
      </ul>

      <h3>When to Choose Vertex AI Agent Builder</h3>
      <ul>
        <li>GCP-native stack with Cloud Storage, BigQuery, Cloud Run</li>
        <li>Need Gemini as the primary model</li>
        <li>Existing Dialogflow CX investments to extend</li>
        <li>Need built-in evaluation framework for continuous improvement</li>
        <li>Integration with Google Workspace (Gmail, Docs, Drive) via connectors</li>
      </ul>

      <h2>Comparison: Managed Agent Services</h2>

      <CodeBlock language="text" filename="managed-agent-comparison.txt">
{`┌────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ Feature            │ Azure AI Agent Svc   │ Bedrock Agents       │ Vertex AI Agent Bldr │
├────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ Primary model      │ GPT-4o (Azure OAI)   │ Any Bedrock model    │ Gemini 2.0 Flash/Pro │
│ Other models       │ AI Foundry catalog   │ All Bedrock models   │ Limited              │
│ Tool mechanism     │ Function calling     │ OpenAPI + Lambda     │ OpenAPI + Cloud Fn   │
│ Built-in RAG       │ File search (FAISS)  │ Knowledge Bases (OAI)│ Data stores          │
│ Code execution     │ Yes (sandbox)        │ No (use Lambda)      │ Yes (code executor)  │
│ Web grounding      │ Bing grounding       │ No native            │ Google Search        │
│ Conversation state │ Threads (persistent) │ Session memory       │ Session variables    │
│ Versioning         │ Agent versions       │ Agent aliases        │ Agent versions       │
│ Multi-agent        │ Yes (limited)        │ Yes (supervisor)     │ Yes (playbook chain) │
│ Evaluation         │ Azure AI evals       │ CloudWatch metrics   │ Built-in eval FW     │
│ Guardrails         │ Azure Content Safety │ Bedrock Guardrails   │ Vertex safety filter │
│ Auth               │ Azure AD / RBAC      │ IAM roles            │ GCP IAM              │
│ Pricing            │ Per token + tier     │ Per invocation + KB  │ Per invocation + DS  │
│ SDK                │ azure-ai-projects    │ boto3 bedrock-agent  │ google-cloud-agent   │
└────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘`}
      </CodeBlock>

      <h2>When to Self-Host Instead</h2>

      <PatternBlock
        name="Self-Hosted Agent with Framework"
        category="Architecture Decision"
        whenToUse="When you need multi-cloud model routing, custom orchestration logic, fine-grained control over the agent loop, or want to avoid vendor lock-in to a specific cloud provider's agent runtime."
      >
        <p>
          Self-hosted agents using frameworks like LangGraph, Anthropic Agent SDK, or CrewAI give
          you complete control: custom retry policies, multi-provider model routing (LiteLLM),
          bespoke state schemas, and the ability to deploy anywhere (containers, serverless, on-prem).
          The trade-off is operational complexity — you own the agent loop, error handling, and
          observability stack.
        </p>
      </PatternBlock>

      <CodeBlock language="text" filename="build-vs-buy-decision.txt">
{`Choose MANAGED SERVICE when:
  ✓ Speed to production is critical (weeks, not months)
  ✓ Team is cloud-native on one provider
  ✓ Built-in tools (file search, code interpreter) meet your needs
  ✓ Limited DevOps capacity to manage infrastructure
  ✓ Usage is predictable and provider pricing is acceptable

Choose SELF-HOSTED FRAMEWORK when:
  ✓ Multi-cloud model routing is required (primary + fallback)
  ✓ Complex custom orchestration patterns (parallel subgraph, dynamic agents)
  ✓ Need to migrate away from a specific cloud in future
  ✓ Existing team expertise with LangGraph/CrewAI/AutoGen
  ✓ Very high volume where managed service pricing is prohibitive
  ✓ Highly sensitive data requiring air-gapped or on-prem deployment`}
      </CodeBlock>

      <BestPracticeBlock title="Pilot Before Committing to a Managed Service">
        <p>
          Before committing to a managed agent service, build a proof-of-concept with your actual
          tools and data. Verify: (1) tool latency is acceptable — Lambda cold starts in Bedrock
          Agents can add 1-3 seconds; (2) token costs with built-in RAG match your projections;
          (3) the platform's evaluation tools are sufficient for your quality requirements;
          (4) compliance certifications (FedRAMP, HIPAA BAA, GDPR data processing addendum)
          are available in your required tier.
        </p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Hybrid Architecture">
        <p>
          Many production systems combine managed and self-hosted: use Bedrock Agents or Azure AI
          Agent Service for external-facing customer workflows (where simplicity and compliance
          matter most), while internal automation pipelines use LangGraph with LiteLLM for
          flexibility and cost optimization. The managed service handles the customer-facing
          reliability; the self-hosted handles complex internal workflows.
        </p>
      </NoteBlock>
    </article>
  )
}
