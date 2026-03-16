import { useParams, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { getCurriculumById, getChapterById, getSectionById, getAdjacentSections, resolveBuildsOn } from '../subjects/index.js'
import DifficultyBadge from '../components/navigation/DifficultyBadge.jsx'
import PrevNextNav from '../components/navigation/PrevNextNav.jsx'
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx'
import useProgress from '../hooks/useProgress.js'

// Registry of sections with full content pages.
// Add entries here as content is created:
// '01-rag-fundamentals/c1-retrieval-basics/s1-what-is-rag': lazy(() => import('../subjects/01-rag-fundamentals/c1-retrieval-basics/s1-what-is-rag.jsx')),
const CONTENT_REGISTRY = {
  '01-rag-fundamentals/c1-retrieval-basics/s1-what-is-rag': lazy(() => import('../subjects/01-rag-fundamentals/c1-retrieval-basics/s1-what-is-rag.jsx')),
  '01-rag-fundamentals/c1-retrieval-basics/s2-vector-embeddings': lazy(() => import('../subjects/01-rag-fundamentals/c1-retrieval-basics/s2-vector-embeddings.jsx')),
  '01-rag-fundamentals/c1-retrieval-basics/s3-similarity-search': lazy(() => import('../subjects/01-rag-fundamentals/c1-retrieval-basics/s3-similarity-search.jsx')),
  '01-rag-fundamentals/c2-document-processing/s1-chunking-strategies': lazy(() => import('../subjects/01-rag-fundamentals/c2-document-processing/s1-chunking-strategies.jsx')),
  '01-rag-fundamentals/c2-document-processing/s2-metadata-filtering': lazy(() => import('../subjects/01-rag-fundamentals/c2-document-processing/s2-metadata-filtering.jsx')),
  '01-rag-fundamentals/c2-document-processing/s3-document-loaders': lazy(() => import('../subjects/01-rag-fundamentals/c2-document-processing/s3-document-loaders.jsx')),
  '01-rag-fundamentals/c3-vector-stores/s1-vector-db-overview': lazy(() => import('../subjects/01-rag-fundamentals/c3-vector-stores/s1-vector-db-overview.jsx')),
  '01-rag-fundamentals/c3-vector-stores/s2-indexing-strategies': lazy(() => import('../subjects/01-rag-fundamentals/c3-vector-stores/s2-indexing-strategies.jsx')),
  '01-rag-fundamentals/c3-vector-stores/s3-popular-vector-dbs': lazy(() => import('../subjects/01-rag-fundamentals/c3-vector-stores/s3-popular-vector-dbs.jsx')),
  '01-rag-fundamentals/c3-vector-stores/s4-cloud-retrieval-services': lazy(() => import('../subjects/01-rag-fundamentals/c3-vector-stores/s4-cloud-retrieval-services.jsx')),
  '01-rag-fundamentals/c4-generation-pipeline/s1-prompt-construction': lazy(() => import('../subjects/01-rag-fundamentals/c4-generation-pipeline/s1-prompt-construction.jsx')),
  '01-rag-fundamentals/c4-generation-pipeline/s2-context-management': lazy(() => import('../subjects/01-rag-fundamentals/c4-generation-pipeline/s2-context-management.jsx')),
  '01-rag-fundamentals/c4-generation-pipeline/s3-response-generation': lazy(() => import('../subjects/01-rag-fundamentals/c4-generation-pipeline/s3-response-generation.jsx')),
  '01-rag-fundamentals/c5-rag-evaluation/s1-ragas-framework': lazy(() => import('../subjects/01-rag-fundamentals/c5-rag-evaluation/s1-ragas-framework.jsx')),
  '01-rag-fundamentals/c5-rag-evaluation/s2-faithfulness-relevance': lazy(() => import('../subjects/01-rag-fundamentals/c5-rag-evaluation/s2-faithfulness-relevance.jsx')),
  '01-rag-fundamentals/c5-rag-evaluation/s3-end-to-end-testing': lazy(() => import('../subjects/01-rag-fundamentals/c5-rag-evaluation/s3-end-to-end-testing.jsx')),
  '02-advanced-rag/c1-query-enhancement/s1-hyde': lazy(() => import('../subjects/02-advanced-rag/c1-query-enhancement/s1-hyde.jsx')),
  '02-advanced-rag/c1-query-enhancement/s2-query-rewriting': lazy(() => import('../subjects/02-advanced-rag/c1-query-enhancement/s2-query-rewriting.jsx')),
  '02-advanced-rag/c1-query-enhancement/s3-rag-fusion': lazy(() => import('../subjects/02-advanced-rag/c1-query-enhancement/s3-rag-fusion.jsx')),
  '02-advanced-rag/c2-retrieval-improvements/s1-hybrid-search': lazy(() => import('../subjects/02-advanced-rag/c2-retrieval-improvements/s1-hybrid-search.jsx')),
  '02-advanced-rag/c2-retrieval-improvements/s2-reranking': lazy(() => import('../subjects/02-advanced-rag/c2-retrieval-improvements/s2-reranking.jsx')),
  '02-advanced-rag/c2-retrieval-improvements/s3-contextual-compression': lazy(() => import('../subjects/02-advanced-rag/c2-retrieval-improvements/s3-contextual-compression.jsx')),
  '02-advanced-rag/c3-iterative-rag/s1-corrective-rag': lazy(() => import('../subjects/02-advanced-rag/c3-iterative-rag/s1-corrective-rag.jsx')),
  '02-advanced-rag/c3-iterative-rag/s2-self-rag': lazy(() => import('../subjects/02-advanced-rag/c3-iterative-rag/s2-self-rag.jsx')),
  '02-advanced-rag/c3-iterative-rag/s3-adaptive-rag': lazy(() => import('../subjects/02-advanced-rag/c3-iterative-rag/s3-adaptive-rag.jsx')),
  '02-advanced-rag/c4-multi-hop-rag/s1-multi-hop-reasoning': lazy(() => import('../subjects/02-advanced-rag/c4-multi-hop-rag/s1-multi-hop-reasoning.jsx')),
  '02-advanced-rag/c4-multi-hop-rag/s2-graph-rag': lazy(() => import('../subjects/02-advanced-rag/c4-multi-hop-rag/s2-graph-rag.jsx')),
  '02-advanced-rag/c4-multi-hop-rag/s3-multi-hop-architectures': lazy(() => import('../subjects/02-advanced-rag/c4-multi-hop-rag/s3-multi-hop-architectures.jsx')),
  '02-advanced-rag/c5-agentic-rag/s1-agentic-rag-overview': lazy(() => import('../subjects/02-advanced-rag/c5-agentic-rag/s1-agentic-rag-overview.jsx')),
  '02-advanced-rag/c5-agentic-rag/s2-tool-use-retrieval': lazy(() => import('../subjects/02-advanced-rag/c5-agentic-rag/s2-tool-use-retrieval.jsx')),
  '02-advanced-rag/c5-agentic-rag/s3-rag-with-agents': lazy(() => import('../subjects/02-advanced-rag/c5-agentic-rag/s3-rag-with-agents.jsx')),
  '03-agent-foundations/c1-agent-basics/s1-what-is-an-agent': lazy(() => import('../subjects/03-agent-foundations/c1-agent-basics/s1-what-is-an-agent.jsx')),
  '03-agent-foundations/c1-agent-basics/s2-agent-loop': lazy(() => import('../subjects/03-agent-foundations/c1-agent-basics/s2-agent-loop.jsx')),
  '03-agent-foundations/c1-agent-basics/s3-tool-use': lazy(() => import('../subjects/03-agent-foundations/c1-agent-basics/s3-tool-use.jsx')),
  '03-agent-foundations/c2-reasoning-patterns/s1-react-pattern': lazy(() => import('../subjects/03-agent-foundations/c2-reasoning-patterns/s1-react-pattern.jsx')),
  '03-agent-foundations/c2-reasoning-patterns/s2-chain-of-thought': lazy(() => import('../subjects/03-agent-foundations/c2-reasoning-patterns/s2-chain-of-thought.jsx')),
  '03-agent-foundations/c2-reasoning-patterns/s3-planning-agents': lazy(() => import('../subjects/03-agent-foundations/c2-reasoning-patterns/s3-planning-agents.jsx')),
  '03-agent-foundations/c3-memory-systems/s1-types-of-memory': lazy(() => import('../subjects/03-agent-foundations/c3-memory-systems/s1-types-of-memory.jsx')),
  '03-agent-foundations/c3-memory-systems/s2-memory-implementations': lazy(() => import('../subjects/03-agent-foundations/c3-memory-systems/s2-memory-implementations.jsx')),
  '03-agent-foundations/c3-memory-systems/s3-memory-management': lazy(() => import('../subjects/03-agent-foundations/c3-memory-systems/s3-memory-management.jsx')),
  '03-agent-foundations/c4-tool-design/s1-tool-design-principles': lazy(() => import('../subjects/03-agent-foundations/c4-tool-design/s1-tool-design-principles.jsx')),
  '03-agent-foundations/c4-tool-design/s2-api-tools': lazy(() => import('../subjects/03-agent-foundations/c4-tool-design/s2-api-tools.jsx')),
  '03-agent-foundations/c4-tool-design/s3-code-execution': lazy(() => import('../subjects/03-agent-foundations/c4-tool-design/s3-code-execution.jsx')),
  '03-agent-foundations/c5-agent-evaluation/s1-agent-benchmarks': lazy(() => import('../subjects/03-agent-foundations/c5-agent-evaluation/s1-agent-benchmarks.jsx')),
  '03-agent-foundations/c5-agent-evaluation/s2-trajectory-evaluation': lazy(() => import('../subjects/03-agent-foundations/c5-agent-evaluation/s2-trajectory-evaluation.jsx')),
  '03-agent-foundations/c5-agent-evaluation/s3-cost-reliability': lazy(() => import('../subjects/03-agent-foundations/c5-agent-evaluation/s3-cost-reliability.jsx')),
  '04-agentic-architectures/c1-single-agent/s1-monolithic-agents': lazy(() => import('../subjects/04-agentic-architectures/c1-single-agent/s1-monolithic-agents.jsx')),
  '04-agentic-architectures/c1-single-agent/s2-single-agent-patterns': lazy(() => import('../subjects/04-agentic-architectures/c1-single-agent/s2-single-agent-patterns.jsx')),
  '04-agentic-architectures/c1-single-agent/s3-when-single-agent': lazy(() => import('../subjects/04-agentic-architectures/c1-single-agent/s3-when-single-agent.jsx')),
  '04-agentic-architectures/c2-multi-agent/s1-multi-agent-overview': lazy(() => import('../subjects/04-agentic-architectures/c2-multi-agent/s1-multi-agent-overview.jsx')),
  '04-agentic-architectures/c2-multi-agent/s2-agent-communication': lazy(() => import('../subjects/04-agentic-architectures/c2-multi-agent/s2-agent-communication.jsx')),
  '04-agentic-architectures/c2-multi-agent/s3-coordination-patterns': lazy(() => import('../subjects/04-agentic-architectures/c2-multi-agent/s3-coordination-patterns.jsx')),
  '04-agentic-architectures/c3-orchestration/s1-orchestrator-worker': lazy(() => import('../subjects/04-agentic-architectures/c3-orchestration/s1-orchestrator-worker.jsx')),
  '04-agentic-architectures/c3-orchestration/s2-hierarchical-agents': lazy(() => import('../subjects/04-agentic-architectures/c3-orchestration/s2-hierarchical-agents.jsx')),
  '04-agentic-architectures/c3-orchestration/s3-parallel-agents': lazy(() => import('../subjects/04-agentic-architectures/c3-orchestration/s3-parallel-agents.jsx')),
  '04-agentic-architectures/c4-specialized-patterns/s1-mixture-of-agents': lazy(() => import('../subjects/04-agentic-architectures/c4-specialized-patterns/s1-mixture-of-agents.jsx')),
  '04-agentic-architectures/c4-specialized-patterns/s2-supervisor-pattern': lazy(() => import('../subjects/04-agentic-architectures/c4-specialized-patterns/s2-supervisor-pattern.jsx')),
  '04-agentic-architectures/c4-specialized-patterns/s3-debate-reflection': lazy(() => import('../subjects/04-agentic-architectures/c4-specialized-patterns/s3-debate-reflection.jsx')),
  '04-agentic-architectures/c5-state-management/s1-agent-state': lazy(() => import('../subjects/04-agentic-architectures/c5-state-management/s1-agent-state.jsx')),
  '04-agentic-architectures/c5-state-management/s2-workflow-orchestration': lazy(() => import('../subjects/04-agentic-architectures/c5-state-management/s2-workflow-orchestration.jsx')),
  '04-agentic-architectures/c5-state-management/s3-long-running-agents': lazy(() => import('../subjects/04-agentic-architectures/c5-state-management/s3-long-running-agents.jsx')),
  '05-llm-foundations/c1-llm-capabilities/s1-context-windows': lazy(() => import('../subjects/05-llm-foundations/c1-llm-capabilities/s1-context-windows.jsx')),
  '05-llm-foundations/c1-llm-capabilities/s2-instruction-following': lazy(() => import('../subjects/05-llm-foundations/c1-llm-capabilities/s2-instruction-following.jsx')),
  '05-llm-foundations/c1-llm-capabilities/s3-function-calling': lazy(() => import('../subjects/05-llm-foundations/c1-llm-capabilities/s3-function-calling.jsx')),
  '05-llm-foundations/c2-prompting/s1-system-prompts': lazy(() => import('../subjects/05-llm-foundations/c2-prompting/s1-system-prompts.jsx')),
  '05-llm-foundations/c2-prompting/s2-few-shot-prompting': lazy(() => import('../subjects/05-llm-foundations/c2-prompting/s2-few-shot-prompting.jsx')),
  '05-llm-foundations/c2-prompting/s3-structured-outputs': lazy(() => import('../subjects/05-llm-foundations/c2-prompting/s3-structured-outputs.jsx')),
  '05-llm-foundations/c3-model-selection/s1-model-comparison': lazy(() => import('../subjects/05-llm-foundations/c3-model-selection/s1-model-comparison.jsx')),
  '05-llm-foundations/c3-model-selection/s2-cost-performance': lazy(() => import('../subjects/05-llm-foundations/c3-model-selection/s2-cost-performance.jsx')),
  '05-llm-foundations/c3-model-selection/s3-specialized-models': lazy(() => import('../subjects/05-llm-foundations/c3-model-selection/s3-specialized-models.jsx')),
  '05-llm-foundations/c3-model-selection/s4-cloud-model-catalogs': lazy(() => import('../subjects/05-llm-foundations/c3-model-selection/s4-cloud-model-catalogs.jsx')),
  '06-coding-agents/c1-coding-agent-overview/s1-what-are-coding-agents': lazy(() => import('../subjects/06-coding-agents/c1-coding-agent-overview/s1-what-are-coding-agents.jsx')),
  '06-coding-agents/c1-coding-agent-overview/s2-coding-agent-components': lazy(() => import('../subjects/06-coding-agents/c1-coding-agent-overview/s2-coding-agent-components.jsx')),
  '06-coding-agents/c1-coding-agent-overview/s3-coding-agent-landscape': lazy(() => import('../subjects/06-coding-agents/c1-coding-agent-overview/s3-coding-agent-landscape.jsx')),
  '06-coding-agents/c2-claude-code/s1-claude-code-architecture': lazy(() => import('../subjects/06-coding-agents/c2-claude-code/s1-claude-code-architecture.jsx')),
  '06-coding-agents/c2-claude-code/s2-claude-code-tools': lazy(() => import('../subjects/06-coding-agents/c2-claude-code/s2-claude-code-tools.jsx')),
  '06-coding-agents/c2-claude-code/s3-mcp-protocol': lazy(() => import('../subjects/06-coding-agents/c2-claude-code/s3-mcp-protocol.jsx')),
  '06-coding-agents/c2-claude-code/s4-claude-code-customization': lazy(() => import('../subjects/06-coding-agents/c2-claude-code/s4-claude-code-customization.jsx')),
  '06-coding-agents/c3-codex-openai/s1-codex-architecture': lazy(() => import('../subjects/06-coding-agents/c3-codex-openai/s1-codex-architecture.jsx')),
  '06-coding-agents/c3-codex-openai/s2-openai-assistants': lazy(() => import('../subjects/06-coding-agents/c3-codex-openai/s2-openai-assistants.jsx')),
  '06-coding-agents/c3-codex-openai/s3-openai-agent-sdk': lazy(() => import('../subjects/06-coding-agents/c3-codex-openai/s3-openai-agent-sdk.jsx')),
  '06-coding-agents/c4-coding-agent-patterns/s1-edit-verify-loop': lazy(() => import('../subjects/06-coding-agents/c4-coding-agent-patterns/s1-edit-verify-loop.jsx')),
  '06-coding-agents/c4-coding-agent-patterns/s2-code-context-management': lazy(() => import('../subjects/06-coding-agents/c4-coding-agent-patterns/s2-code-context-management.jsx')),
  '06-coding-agents/c4-coding-agent-patterns/s3-test-driven-agents': lazy(() => import('../subjects/06-coding-agents/c4-coding-agent-patterns/s3-test-driven-agents.jsx')),
  '06-coding-agents/c5-building-coding-agents/s1-code-understanding': lazy(() => import('../subjects/06-coding-agents/c5-building-coding-agents/s1-code-understanding.jsx')),
  '06-coding-agents/c5-building-coding-agents/s2-code-generation-patterns': lazy(() => import('../subjects/06-coding-agents/c5-building-coding-agents/s2-code-generation-patterns.jsx')),
  '06-coding-agents/c5-building-coding-agents/s3-code-review-agents': lazy(() => import('../subjects/06-coding-agents/c5-building-coding-agents/s3-code-review-agents.jsx')),
  '07-sdks-frameworks/c1-anthropic-sdk/s1-anthropic-sdk-basics': lazy(() => import('../subjects/07-sdks-frameworks/c1-anthropic-sdk/s1-anthropic-sdk-basics.jsx')),
  '07-sdks-frameworks/c1-anthropic-sdk/s2-messages-api': lazy(() => import('../subjects/07-sdks-frameworks/c1-anthropic-sdk/s2-messages-api.jsx')),
  '07-sdks-frameworks/c1-anthropic-sdk/s3-tool-use-api': lazy(() => import('../subjects/07-sdks-frameworks/c1-anthropic-sdk/s3-tool-use-api.jsx')),
  '07-sdks-frameworks/c1-anthropic-sdk/s4-claude-agent-sdk': lazy(() => import('../subjects/07-sdks-frameworks/c1-anthropic-sdk/s4-claude-agent-sdk.jsx')),
  '07-sdks-frameworks/c2-langchain/s1-langchain-overview': lazy(() => import('../subjects/07-sdks-frameworks/c2-langchain/s1-langchain-overview.jsx')),
  '07-sdks-frameworks/c2-langchain/s2-langchain-agents': lazy(() => import('../subjects/07-sdks-frameworks/c2-langchain/s2-langchain-agents.jsx')),
  '07-sdks-frameworks/c2-langchain/s3-langgraph': lazy(() => import('../subjects/07-sdks-frameworks/c2-langchain/s3-langgraph.jsx')),
  '07-sdks-frameworks/c2-langchain/s4-langsmith': lazy(() => import('../subjects/07-sdks-frameworks/c2-langchain/s4-langsmith.jsx')),
  '07-sdks-frameworks/c3-llamaindex/s1-llamaindex-overview': lazy(() => import('../subjects/07-sdks-frameworks/c3-llamaindex/s1-llamaindex-overview.jsx')),
  '07-sdks-frameworks/c3-llamaindex/s2-llamaindex-rag': lazy(() => import('../subjects/07-sdks-frameworks/c3-llamaindex/s2-llamaindex-rag.jsx')),
  '07-sdks-frameworks/c3-llamaindex/s3-llamaindex-agents': lazy(() => import('../subjects/07-sdks-frameworks/c3-llamaindex/s3-llamaindex-agents.jsx')),
  '07-sdks-frameworks/c3-llamaindex/s4-llamaindex-workflows': lazy(() => import('../subjects/07-sdks-frameworks/c3-llamaindex/s4-llamaindex-workflows.jsx')),
  '07-sdks-frameworks/c3-mcp/s1-mcp-protocol-deep-dive': lazy(() => import('../subjects/07-sdks-frameworks/c3-mcp/s1-mcp-protocol-deep-dive.jsx')),
  '07-sdks-frameworks/c3-mcp/s2-building-mcp-servers': lazy(() => import('../subjects/07-sdks-frameworks/c3-mcp/s2-building-mcp-servers.jsx')),
  '07-sdks-frameworks/c4-a2a-protocol/s1-a2a-overview': lazy(() => import('../subjects/07-sdks-frameworks/c4-a2a-protocol/s1-a2a-overview.jsx')),
  '07-sdks-frameworks/c4-a2a-protocol/s2-a2a-implementation': lazy(() => import('../subjects/07-sdks-frameworks/c4-a2a-protocol/s2-a2a-implementation.jsx')),
  '07-sdks-frameworks/c4-multi-agent-frameworks/s1-crewai': lazy(() => import('../subjects/07-sdks-frameworks/c4-multi-agent-frameworks/s1-crewai.jsx')),
  '07-sdks-frameworks/c4-multi-agent-frameworks/s2-autogen': lazy(() => import('../subjects/07-sdks-frameworks/c4-multi-agent-frameworks/s2-autogen.jsx')),
  '07-sdks-frameworks/c4-multi-agent-frameworks/s3-haystack': lazy(() => import('../subjects/07-sdks-frameworks/c4-multi-agent-frameworks/s3-haystack.jsx')),
  '07-sdks-frameworks/c4-multi-agent-frameworks/s4-dspy': lazy(() => import('../subjects/07-sdks-frameworks/c4-multi-agent-frameworks/s4-dspy.jsx')),
  '07-sdks-frameworks/c5-agent-dev-kits/s1-google-adk': lazy(() => import('../subjects/07-sdks-frameworks/c5-agent-dev-kits/s1-google-adk.jsx')),
  '07-sdks-frameworks/c5-agent-dev-kits/s2-azure-ai-agent-service': lazy(() => import('../subjects/07-sdks-frameworks/c5-agent-dev-kits/s2-azure-ai-agent-service.jsx')),
  '07-sdks-frameworks/c5-agent-dev-kits/s3-aws-agent-frameworks': lazy(() => import('../subjects/07-sdks-frameworks/c5-agent-dev-kits/s3-aws-agent-frameworks.jsx')),
  '07-sdks-frameworks/c5-framework-selection/s1-comparison': lazy(() => import('../subjects/07-sdks-frameworks/c5-framework-selection/s1-comparison.jsx')),
  '07-sdks-frameworks/c5-framework-selection/s2-selection-criteria': lazy(() => import('../subjects/07-sdks-frameworks/c5-framework-selection/s2-selection-criteria.jsx')),
  '07-sdks-frameworks/c5-framework-selection/s3-mixing-frameworks': lazy(() => import('../subjects/07-sdks-frameworks/c5-framework-selection/s3-mixing-frameworks.jsx')),
  '07-sdks-frameworks/c6-cloud-sdks/s1-azure-ai-sdk': lazy(() => import('../subjects/07-sdks-frameworks/c6-cloud-sdks/s1-azure-ai-sdk.jsx')),
  '07-sdks-frameworks/c6-cloud-sdks/s2-aws-bedrock-sdk': lazy(() => import('../subjects/07-sdks-frameworks/c6-cloud-sdks/s2-aws-bedrock-sdk.jsx')),
  '07-sdks-frameworks/c6-cloud-sdks/s3-vertex-ai-sdk': lazy(() => import('../subjects/07-sdks-frameworks/c6-cloud-sdks/s3-vertex-ai-sdk.jsx')),
  '07-sdks-frameworks/c6-cloud-sdks/s4-litellm': lazy(() => import('../subjects/07-sdks-frameworks/c6-cloud-sdks/s4-litellm.jsx')),
  '08-enterprise-agentic/c1-production-patterns/s1-reliability-patterns': lazy(() => import('../subjects/08-enterprise-agentic/c1-production-patterns/s1-reliability-patterns.jsx')),
  '08-enterprise-agentic/c1-production-patterns/s2-error-handling': lazy(() => import('../subjects/08-enterprise-agentic/c1-production-patterns/s2-error-handling.jsx')),
  '08-enterprise-agentic/c1-production-patterns/s3-deployment-strategies': lazy(() => import('../subjects/08-enterprise-agentic/c1-production-patterns/s3-deployment-strategies.jsx')),
  '08-enterprise-agentic/c1-production-patterns/s4-managed-agent-services': lazy(() => import('../subjects/08-enterprise-agentic/c1-production-patterns/s4-managed-agent-services.jsx')),
  '08-enterprise-agentic/c2-observability/s1-tracing-agents': lazy(() => import('../subjects/08-enterprise-agentic/c2-observability/s1-tracing-agents.jsx')),
  '08-enterprise-agentic/c2-observability/s2-logging-monitoring': lazy(() => import('../subjects/08-enterprise-agentic/c2-observability/s2-logging-monitoring.jsx')),
  '08-enterprise-agentic/c2-observability/s3-alerting-debugging': lazy(() => import('../subjects/08-enterprise-agentic/c2-observability/s3-alerting-debugging.jsx')),
  '08-enterprise-agentic/c3-cost-optimization/s1-token-budgeting': lazy(() => import('../subjects/08-enterprise-agentic/c3-cost-optimization/s1-token-budgeting.jsx')),
  '08-enterprise-agentic/c3-cost-optimization/s2-caching-strategies': lazy(() => import('../subjects/08-enterprise-agentic/c3-cost-optimization/s2-caching-strategies.jsx')),
  '08-enterprise-agentic/c3-cost-optimization/s3-model-routing': lazy(() => import('../subjects/08-enterprise-agentic/c3-cost-optimization/s3-model-routing.jsx')),
  '08-enterprise-agentic/c4-scalability/s1-horizontal-scaling': lazy(() => import('../subjects/08-enterprise-agentic/c4-scalability/s1-horizontal-scaling.jsx')),
  '08-enterprise-agentic/c4-scalability/s2-rate-limiting': lazy(() => import('../subjects/08-enterprise-agentic/c4-scalability/s2-rate-limiting.jsx')),
  '08-enterprise-agentic/c4-scalability/s3-distributed-state': lazy(() => import('../subjects/08-enterprise-agentic/c4-scalability/s3-distributed-state.jsx')),
  '08-enterprise-agentic/c5-governance/s1-ai-policy': lazy(() => import('../subjects/08-enterprise-agentic/c5-governance/s1-ai-policy.jsx')),
  '08-enterprise-agentic/c5-governance/s2-audit-trails': lazy(() => import('../subjects/08-enterprise-agentic/c5-governance/s2-audit-trails.jsx')),
  '08-enterprise-agentic/c5-governance/s3-human-oversight': lazy(() => import('../subjects/08-enterprise-agentic/c5-governance/s3-human-oversight.jsx')),
  '09-security-compliance/c1-threat-model/s1-attack-surface': lazy(() => import('../subjects/09-security-compliance/c1-threat-model/s1-attack-surface.jsx')),
  '09-security-compliance/c1-threat-model/s2-prompt-injection': lazy(() => import('../subjects/09-security-compliance/c1-threat-model/s2-prompt-injection.jsx')),
  '09-security-compliance/c1-threat-model/s3-threat-scenarios': lazy(() => import('../subjects/09-security-compliance/c1-threat-model/s3-threat-scenarios.jsx')),
  '09-security-compliance/c2-defensive-patterns/s1-input-validation': lazy(() => import('../subjects/09-security-compliance/c2-defensive-patterns/s1-input-validation.jsx')),
  '09-security-compliance/c2-defensive-patterns/s2-output-filtering': lazy(() => import('../subjects/09-security-compliance/c2-defensive-patterns/s2-output-filtering.jsx')),
  '09-security-compliance/c2-defensive-patterns/s3-sandboxing': lazy(() => import('../subjects/09-security-compliance/c2-defensive-patterns/s3-sandboxing.jsx')),
  '09-security-compliance/c2-defensive-patterns/s4-cloud-guardrails': lazy(() => import('../subjects/09-security-compliance/c2-defensive-patterns/s4-cloud-guardrails.jsx')),
  '09-security-compliance/c3-access-control/s1-least-privilege': lazy(() => import('../subjects/09-security-compliance/c3-access-control/s1-least-privilege.jsx')),
  '09-security-compliance/c3-access-control/s2-rbac-abac': lazy(() => import('../subjects/09-security-compliance/c3-access-control/s2-rbac-abac.jsx')),
  '09-security-compliance/c3-access-control/s3-secrets-management': lazy(() => import('../subjects/09-security-compliance/c3-access-control/s3-secrets-management.jsx')),
  '09-security-compliance/c4-compliance/s1-gdpr-ccpa': lazy(() => import('../subjects/09-security-compliance/c4-compliance/s1-gdpr-ccpa.jsx')),
  '09-security-compliance/c4-compliance/s2-soc2-iso27001': lazy(() => import('../subjects/09-security-compliance/c4-compliance/s2-soc2-iso27001.jsx')),
  '09-security-compliance/c4-compliance/s3-ai-regulations': lazy(() => import('../subjects/09-security-compliance/c4-compliance/s3-ai-regulations.jsx')),
  '09-security-compliance/c5-data-privacy/s1-data-minimization': lazy(() => import('../subjects/09-security-compliance/c5-data-privacy/s1-data-minimization.jsx')),
  '09-security-compliance/c5-data-privacy/s2-pii-handling': lazy(() => import('../subjects/09-security-compliance/c5-data-privacy/s2-pii-handling.jsx')),
  '09-security-compliance/c5-data-privacy/s3-data-residency': lazy(() => import('../subjects/09-security-compliance/c5-data-privacy/s3-data-residency.jsx')),
  '10-evaluation-observability/c1-evaluation-frameworks/s1-evaluation-overview': lazy(() => import('../subjects/10-evaluation-observability/c1-evaluation-frameworks/s1-evaluation-overview.jsx')),
  '10-evaluation-observability/c1-evaluation-frameworks/s2-llm-as-judge': lazy(() => import('../subjects/10-evaluation-observability/c1-evaluation-frameworks/s2-llm-as-judge.jsx')),
  '10-evaluation-observability/c1-evaluation-frameworks/s3-eval-datasets': lazy(() => import('../subjects/10-evaluation-observability/c1-evaluation-frameworks/s3-eval-datasets.jsx')),
  '10-evaluation-observability/c2-testing-strategies/s1-unit-testing-agents': lazy(() => import('../subjects/10-evaluation-observability/c2-testing-strategies/s1-unit-testing-agents.jsx')),
  '10-evaluation-observability/c2-testing-strategies/s2-integration-testing': lazy(() => import('../subjects/10-evaluation-observability/c2-testing-strategies/s2-integration-testing.jsx')),
  '10-evaluation-observability/c2-testing-strategies/s3-regression-testing': lazy(() => import('../subjects/10-evaluation-observability/c2-testing-strategies/s3-regression-testing.jsx')),
  '10-evaluation-observability/c3-tracing-tools/s1-opentelemetry-agents': lazy(() => import('../subjects/10-evaluation-observability/c3-tracing-tools/s1-opentelemetry-agents.jsx')),
  '10-evaluation-observability/c3-tracing-tools/s2-langsmith-tracing': lazy(() => import('../subjects/10-evaluation-observability/c3-tracing-tools/s2-langsmith-tracing.jsx')),
  '10-evaluation-observability/c3-tracing-tools/s3-custom-tracing': lazy(() => import('../subjects/10-evaluation-observability/c3-tracing-tools/s3-custom-tracing.jsx')),
  '10-evaluation-observability/c4-continuous-improvement/s1-feedback-loops': lazy(() => import('../subjects/10-evaluation-observability/c4-continuous-improvement/s1-feedback-loops.jsx')),
  '10-evaluation-observability/c4-continuous-improvement/s2-ab-testing': lazy(() => import('../subjects/10-evaluation-observability/c4-continuous-improvement/s2-ab-testing.jsx')),
  '10-evaluation-observability/c4-continuous-improvement/s3-fine-tuning-loop': lazy(() => import('../subjects/10-evaluation-observability/c4-continuous-improvement/s3-fine-tuning-loop.jsx')),
  '11-vibe-engineering/c1-philosophy-principles/s1-vibe-engineering-vs-vibe-coding': lazy(() => import('../subjects/11-vibe-engineering/c1-philosophy-principles/s1-vibe-engineering-vs-vibe-coding.jsx')),
  '11-vibe-engineering/c1-philosophy-principles/s2-core-principles': lazy(() => import('../subjects/11-vibe-engineering/c1-philosophy-principles/s2-core-principles.jsx')),
  '11-vibe-engineering/c1-philosophy-principles/s3-enterprise-engineering-mindset': lazy(() => import('../subjects/11-vibe-engineering/c1-philosophy-principles/s3-enterprise-engineering-mindset.jsx')),
  '11-vibe-engineering/c1-philosophy-principles/s4-ai-constitution-claudemd': lazy(() => import('../subjects/11-vibe-engineering/c1-philosophy-principles/s4-ai-constitution-claudemd.jsx')),
  '11-vibe-engineering/c10-monitoring-incidents/s1-ai-log-analysis': lazy(() => import('../subjects/11-vibe-engineering/c10-monitoring-incidents/s1-ai-log-analysis.jsx')),
  '11-vibe-engineering/c10-monitoring-incidents/s2-incident-triage-workflow': lazy(() => import('../subjects/11-vibe-engineering/c10-monitoring-incidents/s2-incident-triage-workflow.jsx')),
  '11-vibe-engineering/c10-monitoring-incidents/s3-hotfix-generation-deployment': lazy(() => import('../subjects/11-vibe-engineering/c10-monitoring-incidents/s3-hotfix-generation-deployment.jsx')),
  '11-vibe-engineering/c10-monitoring-incidents/s4-post-incident-report-automation': lazy(() => import('../subjects/11-vibe-engineering/c10-monitoring-incidents/s4-post-incident-report-automation.jsx')),
  '11-vibe-engineering/c11-organizational-adoption/s1-ai-usage-policy': lazy(() => import('../subjects/11-vibe-engineering/c11-organizational-adoption/s1-ai-usage-policy.jsx')),
  '11-vibe-engineering/c11-organizational-adoption/s2-center-of-excellence': lazy(() => import('../subjects/11-vibe-engineering/c11-organizational-adoption/s2-center-of-excellence.jsx')),
  '11-vibe-engineering/c11-organizational-adoption/s3-measuring-ai-impact': lazy(() => import('../subjects/11-vibe-engineering/c11-organizational-adoption/s3-measuring-ai-impact.jsx')),
  '11-vibe-engineering/c11-organizational-adoption/s4-governance-cost-risk': lazy(() => import('../subjects/11-vibe-engineering/c11-organizational-adoption/s4-governance-cost-risk.jsx')),
  '11-vibe-engineering/c2-requirements-and-design/s1-requirements-discovery': lazy(() => import('../subjects/11-vibe-engineering/c2-requirements-and-design/s1-requirements-discovery.jsx')),
  '11-vibe-engineering/c2-requirements-and-design/s2-adrs-with-ai': lazy(() => import('../subjects/11-vibe-engineering/c2-requirements-and-design/s2-adrs-with-ai.jsx')),
  '11-vibe-engineering/c2-requirements-and-design/s3-api-contract-design': lazy(() => import('../subjects/11-vibe-engineering/c2-requirements-and-design/s3-api-contract-design.jsx')),
  '11-vibe-engineering/c2-requirements-and-design/s4-nfr-automation': lazy(() => import('../subjects/11-vibe-engineering/c2-requirements-and-design/s4-nfr-automation.jsx')),
  '11-vibe-engineering/c3-environment-setup/s1-claudemd-enterprise-patterns': lazy(() => import('../subjects/11-vibe-engineering/c3-environment-setup/s1-claudemd-enterprise-patterns.jsx')),
  '11-vibe-engineering/c3-environment-setup/s2-custom-slash-commands': lazy(() => import('../subjects/11-vibe-engineering/c3-environment-setup/s2-custom-slash-commands.jsx')),
  '11-vibe-engineering/c3-environment-setup/s3-mcp-enterprise-tools': lazy(() => import('../subjects/11-vibe-engineering/c3-environment-setup/s3-mcp-enterprise-tools.jsx')),
  '11-vibe-engineering/c3-environment-setup/s4-automated-quality-gates': lazy(() => import('../subjects/11-vibe-engineering/c3-environment-setup/s4-automated-quality-gates.jsx')),
  '11-vibe-engineering/c4-ai-first-development/s1-ai-first-tdd': lazy(() => import('../subjects/11-vibe-engineering/c4-ai-first-development/s1-ai-first-tdd.jsx')),
  '11-vibe-engineering/c4-ai-first-development/s2-feature-workflow-jira-to-pr': lazy(() => import('../subjects/11-vibe-engineering/c4-ai-first-development/s2-feature-workflow-jira-to-pr.jsx')),
  '11-vibe-engineering/c4-ai-first-development/s3-ai-pair-programming': lazy(() => import('../subjects/11-vibe-engineering/c4-ai-first-development/s3-ai-pair-programming.jsx')),
  '11-vibe-engineering/c4-ai-first-development/s4-large-scale-cross-file-changes': lazy(() => import('../subjects/11-vibe-engineering/c4-ai-first-development/s4-large-scale-cross-file-changes.jsx')),
  '11-vibe-engineering/c5-code-quality-review/s1-ai-as-first-reviewer': lazy(() => import('../subjects/11-vibe-engineering/c5-code-quality-review/s1-ai-as-first-reviewer.jsx')),
  '11-vibe-engineering/c5-code-quality-review/s2-pr-description-automation': lazy(() => import('../subjects/11-vibe-engineering/c5-code-quality-review/s2-pr-description-automation.jsx')),
  '11-vibe-engineering/c5-code-quality-review/s3-architecture-conformance': lazy(() => import('../subjects/11-vibe-engineering/c5-code-quality-review/s3-architecture-conformance.jsx')),
  '11-vibe-engineering/c5-code-quality-review/s4-technical-debt-management': lazy(() => import('../subjects/11-vibe-engineering/c5-code-quality-review/s4-technical-debt-management.jsx')),
  '11-vibe-engineering/c6-testing-strategy/s1-unit-integration-test-generation': lazy(() => import('../subjects/11-vibe-engineering/c6-testing-strategy/s1-unit-integration-test-generation.jsx')),
  '11-vibe-engineering/c6-testing-strategy/s2-e2e-test-from-user-stories': lazy(() => import('../subjects/11-vibe-engineering/c6-testing-strategy/s2-e2e-test-from-user-stories.jsx')),
  '11-vibe-engineering/c6-testing-strategy/s3-security-test-automation': lazy(() => import('../subjects/11-vibe-engineering/c6-testing-strategy/s3-security-test-automation.jsx')),
  '11-vibe-engineering/c6-testing-strategy/s4-test-data-generation': lazy(() => import('../subjects/11-vibe-engineering/c6-testing-strategy/s4-test-data-generation.jsx')),
  '11-vibe-engineering/c7-security-compliance-loop/s1-sast-in-agent-loop': lazy(() => import('../subjects/11-vibe-engineering/c7-security-compliance-loop/s1-sast-in-agent-loop.jsx')),
  '11-vibe-engineering/c7-security-compliance-loop/s2-dependency-vulnerability-remediation': lazy(() => import('../subjects/11-vibe-engineering/c7-security-compliance-loop/s2-dependency-vulnerability-remediation.jsx')),
  '11-vibe-engineering/c7-security-compliance-loop/s3-compliance-controls-in-claudemd': lazy(() => import('../subjects/11-vibe-engineering/c7-security-compliance-loop/s3-compliance-controls-in-claudemd.jsx')),
  '11-vibe-engineering/c7-security-compliance-loop/s4-secrets-detection': lazy(() => import('../subjects/11-vibe-engineering/c7-security-compliance-loop/s4-secrets-detection.jsx')),
  '11-vibe-engineering/c8-living-documentation/s1-code-first-api-docs': lazy(() => import('../subjects/11-vibe-engineering/c8-living-documentation/s1-code-first-api-docs.jsx')),
  '11-vibe-engineering/c8-living-documentation/s2-architecture-doc-freshness': lazy(() => import('../subjects/11-vibe-engineering/c8-living-documentation/s2-architecture-doc-freshness.jsx')),
  '11-vibe-engineering/c8-living-documentation/s3-runbook-generation': lazy(() => import('../subjects/11-vibe-engineering/c8-living-documentation/s3-runbook-generation.jsx')),
  '11-vibe-engineering/c8-living-documentation/s4-knowledge-capture-onboarding': lazy(() => import('../subjects/11-vibe-engineering/c8-living-documentation/s4-knowledge-capture-onboarding.jsx')),
  '11-vibe-engineering/c9-cicd-devops/s1-pipeline-as-code': lazy(() => import('../subjects/11-vibe-engineering/c9-cicd-devops/s1-pipeline-as-code.jsx')),
  '11-vibe-engineering/c9-cicd-devops/s2-infrastructure-as-code': lazy(() => import('../subjects/11-vibe-engineering/c9-cicd-devops/s2-infrastructure-as-code.jsx')),
  '11-vibe-engineering/c9-cicd-devops/s3-container-kubernetes-generation': lazy(() => import('../subjects/11-vibe-engineering/c9-cicd-devops/s3-container-kubernetes-generation.jsx')),
  '11-vibe-engineering/c9-cicd-devops/s4-release-automation': lazy(() => import('../subjects/11-vibe-engineering/c9-cicd-devops/s4-release-automation.jsx')),
  '12-cloud-ai-platforms/c1-azure-ai/s1-azure-openai-service': lazy(() => import('../subjects/12-cloud-ai-platforms/c1-azure-ai/s1-azure-openai-service.jsx')),
  '12-cloud-ai-platforms/c1-azure-ai/s2-azure-ai-foundry': lazy(() => import('../subjects/12-cloud-ai-platforms/c1-azure-ai/s2-azure-ai-foundry.jsx')),
  '12-cloud-ai-platforms/c1-azure-ai/s3-azure-ai-agent-service': lazy(() => import('../subjects/12-cloud-ai-platforms/c1-azure-ai/s3-azure-ai-agent-service.jsx')),
  '12-cloud-ai-platforms/c1-azure-ai/s4-semantic-kernel': lazy(() => import('../subjects/12-cloud-ai-platforms/c1-azure-ai/s4-semantic-kernel.jsx')),
  '12-cloud-ai-platforms/c2-aws-ai/s1-amazon-bedrock': lazy(() => import('../subjects/12-cloud-ai-platforms/c2-aws-ai/s1-amazon-bedrock.jsx')),
  '12-cloud-ai-platforms/c2-aws-ai/s2-bedrock-agents': lazy(() => import('../subjects/12-cloud-ai-platforms/c2-aws-ai/s2-bedrock-agents.jsx')),
  '12-cloud-ai-platforms/c2-aws-ai/s3-bedrock-guardrails': lazy(() => import('../subjects/12-cloud-ai-platforms/c2-aws-ai/s3-bedrock-guardrails.jsx')),
  '12-cloud-ai-platforms/c2-aws-ai/s4-amazon-q-developer': lazy(() => import('../subjects/12-cloud-ai-platforms/c2-aws-ai/s4-amazon-q-developer.jsx')),
  '12-cloud-ai-platforms/c3-gcp-ai/s1-vertex-ai-gemini': lazy(() => import('../subjects/12-cloud-ai-platforms/c3-gcp-ai/s1-vertex-ai-gemini.jsx')),
  '12-cloud-ai-platforms/c3-gcp-ai/s2-vertex-ai-agent-builder': lazy(() => import('../subjects/12-cloud-ai-platforms/c3-gcp-ai/s2-vertex-ai-agent-builder.jsx')),
  '12-cloud-ai-platforms/c3-gcp-ai/s3-google-adk': lazy(() => import('../subjects/12-cloud-ai-platforms/c3-gcp-ai/s3-google-adk.jsx')),
  '12-cloud-ai-platforms/c3-gcp-ai/s4-model-garden': lazy(() => import('../subjects/12-cloud-ai-platforms/c3-gcp-ai/s4-model-garden.jsx')),
  '12-cloud-ai-platforms/c4-cross-cloud/s1-model-selection-across-clouds': lazy(() => import('../subjects/12-cloud-ai-platforms/c4-cross-cloud/s1-model-selection-across-clouds.jsx')),
  '12-cloud-ai-platforms/c4-cross-cloud/s2-multi-cloud-agents': lazy(() => import('../subjects/12-cloud-ai-platforms/c4-cross-cloud/s2-multi-cloud-agents.jsx')),
  '12-cloud-ai-platforms/c4-cross-cloud/s3-cloud-native-rag': lazy(() => import('../subjects/12-cloud-ai-platforms/c4-cross-cloud/s3-cloud-native-rag.jsx')),
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300 dark:text-cyan-700" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function ComingSoonPlaceholder({ section }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/50 px-8 py-16 text-center dark:border-cyan-800/40 dark:bg-cyan-950/10"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <BookIcon />
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Content Coming Soon
        </h2>
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          The interactive content for{' '}
          <strong className="font-semibold text-gray-700 dark:text-gray-300">
            {section.title}
          </strong>{' '}
          is being prepared. It will include concept explanations, architecture diagrams,
          SDK code examples, and hands-on exercises.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {['Concepts', 'Code Examples', 'Architecture Diagrams', 'Exercises'].map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function PrerequisiteBanner({ section, subjectId }) {
  if (!section?.buildsOn) return null
  const prereq = resolveBuildsOn(section.buildsOn)
  if (!prereq) return null

  const href = `/subjects/${prereq.subjectId}/${prereq.chapterId}/${prereq.sectionId}`
  const isSameSubject = prereq.subjectId === subjectId

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/20">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
      <div className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
        <span className="font-medium">Builds on: </span>
        <Link
          to={href}
          className="underline decoration-amber-400/60 underline-offset-2 hover:decoration-amber-600 dark:decoration-amber-600/60 dark:hover:decoration-amber-400 transition-colors"
        >
          {prereq.title}
        </Link>
        {!isSameSubject && (
          <span className="ml-1 text-amber-700 dark:text-amber-400/80">
            ({prereq.subjectTitle})
          </span>
        )}
      </div>
    </div>
  )
}

function SectionContent({ subjectId, chapterId, sectionId, section }) {
  const key = `${subjectId}/${chapterId}/${sectionId}`
  const ContentComponent = CONTENT_REGISTRY[key]
  if (ContentComponent) {
    return (
      <Suspense fallback={<div className="py-16 text-center text-gray-400">Loading content…</div>}>
        <ContentComponent />
      </Suspense>
    )
  }
  return <ComingSoonPlaceholder section={section} />
}

export default function SectionPage() {
  const { subjectId, chapterId, sectionId } = useParams()
  const { isComplete, markSectionComplete } = useProgress()

  const subject = getCurriculumById(subjectId)
  const chapter = getChapterById(subjectId, chapterId)
  const section = getSectionById(subjectId, chapterId, sectionId)
  const done = isComplete(subjectId, chapterId, sectionId)

  if (!subject || !chapter || !section) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-5xl select-none" aria-hidden="true">🤖</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Section Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Could not find section "{sectionId}".
        </p>
        <Link
          to="/"
          className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  const { prev, next } = getAdjacentSections(subjectId, chapterId, sectionId)

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: subject.title, href: `/subjects/${subjectId}` },
    { label: chapter.title, href: `/subjects/${subjectId}/${chapterId}` },
    { label: section.title },
  ]

  function handleMarkComplete() {
    if (!done) {
      markSectionComplete(subjectId, chapterId, sectionId)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Section Header */}
      <div
        className="relative border-b border-gray-200 dark:border-gray-800"
        style={{ background: `linear-gradient(135deg, ${subject.colorHex}10 0%, transparent 50%)` }}
      >
        <div
          className="absolute left-0 top-0 h-full w-1.5"
          style={{ backgroundColor: subject.colorHex }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-3xl px-6 py-8 pl-10">
          <Breadcrumbs items={breadcrumbs} />
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl leading-snug">
              {section.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <DifficultyBadge level={section.difficulty} />
              {section.readingMinutes && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <ClockIcon />
                  {section.readingMinutes} min read
                </span>
              )}
              {done && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <CheckIcon />
                  Completed
                </span>
              )}
            </div>
            {section.description && (
              <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                {section.description}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main content area */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <PrerequisiteBanner section={section} subjectId={subjectId} />
        <SectionContent
          subjectId={subjectId}
          chapterId={chapterId}
          sectionId={sectionId}
          section={section}
        />

        {/* Mark as complete */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={done}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
              done
                ? 'cursor-default bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-md hover:shadow-lg'
            }`}
            aria-label={done ? 'Section already marked complete' : 'Mark this section as complete'}
          >
            {done ? (
              <>
                <CheckIcon />
                Marked as Complete
              </>
            ) : (
              'Mark as Complete'
            )}
          </button>
        </div>

        <PrevNextNav prev={prev} next={next} />
      </div>
    </div>
  )
}
