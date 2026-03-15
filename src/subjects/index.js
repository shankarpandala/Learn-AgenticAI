// ============================================================
// Learn-AgenticAI — Curriculum Registry (single source of truth)
// ============================================================

const CURRICULUM = [
  // ─────────────────────────────────────────────────────────
  // 01 · RAG Pipeline Fundamentals
  // ─────────────────────────────────────────────────────────
  {
    id: '01-rag-fundamentals',
    title: 'RAG Pipeline Fundamentals',
    icon: '🔍',
    colorHex: '#06b6d4',
    difficulty: 'beginner',
    estimatedHours: 20,
    prerequisites: [],
    description:
      'Master Retrieval-Augmented Generation from the ground up. Learn document processing, vector embeddings, similarity search, and how to build production-ready RAG pipelines.',
    chapters: [
      {
        id: 'c1-retrieval-basics',
        title: 'Document Retrieval Basics',
        sections: [
          {
            id: 's1-what-is-rag',
            title: 'What is RAG?',
            difficulty: 'beginner',
            readingMinutes: 8,
            description: 'An introduction to Retrieval-Augmented Generation and why it matters for modern AI applications.',
          },
          {
            id: 's2-vector-embeddings',
            title: 'Vector Embeddings',
            difficulty: 'beginner',
            readingMinutes: 10,
            description: 'Understand how text is converted into high-dimensional vectors that capture semantic meaning.',
          },
          {
            id: 's3-similarity-search',
            title: 'Similarity Search',
            difficulty: 'beginner',
            readingMinutes: 8,
            description: 'Learn how nearest-neighbour search over embeddings powers document retrieval.',
          },
        ],
      },
      {
        id: 'c2-document-processing',
        title: 'Document Processing & Chunking',
        sections: [
          {
            id: 's1-chunking-strategies',
            title: 'Chunking Strategies',
            difficulty: 'beginner',
            readingMinutes: 10,
            description: 'Explore fixed-size, recursive, semantic, and document-aware chunking strategies.',
          },
          {
            id: 's2-metadata-filtering',
            title: 'Metadata Filtering',
            difficulty: 'intermediate',
            readingMinutes: 8,
            description: 'Use metadata to narrow retrieval scope and dramatically improve precision.',
          },
          {
            id: 's3-document-loaders',
            title: 'Document Loaders',
            difficulty: 'beginner',
            readingMinutes: 6,
            description: 'Survey loaders for PDFs, HTML, Markdown, databases, and other common sources.',
          },
        ],
      },
      {
        id: 'c3-vector-stores',
        title: 'Vector Stores & Databases',
        sections: [
          {
            id: 's1-vector-db-overview',
            title: 'Vector DB Overview',
            difficulty: 'beginner',
            readingMinutes: 10,
            description: 'What vector databases are, how they differ from traditional databases, and when to use them.',
          },
          {
            id: 's2-indexing-strategies',
            title: 'Indexing Strategies',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Dive into HNSW, IVF, and other approximate nearest-neighbour index structures.',
          },
          {
            id: 's3-popular-vector-dbs',
            title: 'Popular Vector Databases',
            difficulty: 'intermediate',
            readingMinutes: 15,
            description: 'Compare Pinecone, Weaviate, Qdrant, Chroma, pgvector, and more on cost, scale, and features.',
          },
        ],
      },
      {
        id: 'c4-generation-pipeline',
        title: 'Generation Pipeline',
        sections: [
          {
            id: 's1-prompt-construction',
            title: 'Prompt Construction',
            difficulty: 'beginner',
            readingMinutes: 8,
            description: 'Build prompts that effectively combine retrieved context with user queries.',
          },
          {
            id: 's2-context-management',
            title: 'Context Management',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Handle long context windows, context stuffing, and relevance ranking before generation.',
          },
          {
            id: 's3-response-generation',
            title: 'Response Generation',
            difficulty: 'intermediate',
            readingMinutes: 8,
            description: 'Connect retrieval to LLM generation and control grounding, citation, and hallucination.',
          },
        ],
      },
      {
        id: 'c5-rag-evaluation',
        title: 'RAG Evaluation',
        sections: [
          {
            id: 's1-ragas-framework',
            title: 'RAGAS Framework',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Use the RAGAS library to evaluate RAG pipelines without requiring ground-truth labels.',
          },
          {
            id: 's2-faithfulness-relevance',
            title: 'Faithfulness & Relevance',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Measure faithfulness, answer relevance, context precision, and context recall.',
          },
          {
            id: 's3-end-to-end-testing',
            title: 'End-to-End Testing',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Build end-to-end test suites that catch regressions in your RAG pipeline over time.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 02 · Advanced RAG Architectures
  // ─────────────────────────────────────────────────────────
  {
    id: '02-advanced-rag',
    title: 'Advanced RAG Architectures',
    icon: '🧠',
    colorHex: '#3b82f6',
    difficulty: 'intermediate',
    estimatedHours: 25,
    prerequisites: ['01-rag-fundamentals'],
    description:
      'Go beyond basic RAG with advanced retrieval strategies including HyDE, RAG-Fusion, CRAG, Self-RAG, Adaptive RAG, Multi-hop reasoning, and GraphRAG.',
    chapters: [
      {
        id: 'c1-query-enhancement',
        title: 'Query Enhancement',
        sections: [
          {
            id: 's1-hyde',
            title: 'HyDE - Hypothetical Document Embeddings',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Use an LLM to generate a hypothetical answer, then embed it for improved retrieval.',
            buildsOn: '01-rag-fundamentals/c1-retrieval-basics/s2-vector-embeddings',
          },
          {
            id: 's2-query-rewriting',
            title: 'Query Rewriting & Expansion',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Rewrite or expand user queries with synonyms, sub-questions, and step-back prompts.',
          },
          {
            id: 's3-rag-fusion',
            title: 'RAG-Fusion',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Generate multiple query variants and merge their ranked results with Reciprocal Rank Fusion.',
          },
        ],
      },
      {
        id: 'c2-retrieval-improvements',
        title: 'Retrieval Improvements',
        sections: [
          {
            id: 's1-hybrid-search',
            title: 'Hybrid Search',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Combine dense (vector) and sparse (BM25) retrieval to get the best of both worlds.',
          },
          {
            id: 's2-reranking',
            title: 'Reranking Strategies',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Apply cross-encoder rerankers, Cohere Rerank, and LLM-based reranking after initial retrieval.',
          },
          {
            id: 's3-contextual-compression',
            title: 'Contextual Compression',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Extract only the relevant portions of retrieved documents before passing them to the LLM.',
          },
        ],
      },
      {
        id: 'c3-iterative-rag',
        title: 'Iterative & Corrective RAG',
        sections: [
          {
            id: 's1-corrective-rag',
            title: 'Corrective RAG (CRAG)',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: 'Grade retrieved documents and fall back to web search when retrieval quality is low.',
          },
          {
            id: 's2-self-rag',
            title: 'Self-RAG',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: 'Train models to decide when to retrieve and to critique their own generated responses.',
          },
          {
            id: 's3-adaptive-rag',
            title: 'Adaptive RAG',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Dynamically choose between no-retrieval, single-step, and iterative retrieval based on query complexity.',
          },
        ],
      },
      {
        id: 'c4-multi-hop-rag',
        title: 'Multi-Hop & Complex Reasoning',
        sections: [
          {
            id: 's1-multi-hop-reasoning',
            title: 'Multi-Hop Reasoning',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Answer questions that require chaining multiple retrieval steps across different documents.',
          },
          {
            id: 's2-graph-rag',
            title: 'GraphRAG',
            difficulty: 'advanced',
            readingMinutes: 18,
            description: "Build a knowledge graph from your corpus and traverse it for community-level question answering.",
          },
          {
            id: 's3-multi-hop-architectures',
            title: 'Multi-Hop Architectures',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Implement IRCoT, FLARE, and other architecture patterns for iterative multi-step retrieval.',
          },
        ],
      },
      {
        id: 'c5-agentic-rag',
        title: 'Agentic RAG',
        sections: [
          {
            id: 's1-agentic-rag-overview',
            title: 'Agentic RAG Overview',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Understand how agents augment traditional RAG with planning, tool use, and iteration.',
          },
          {
            id: 's2-tool-use-retrieval',
            title: 'Tool-Use in Retrieval',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Give agents structured retrieval tools they can call with precision-crafted queries.',
          },
          {
            id: 's3-rag-with-agents',
            title: 'RAG with Agents',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Wire RAG pipelines into a full agent loop using LangGraph or custom orchestration.',
            buildsOn: '03-agent-foundations/c1-agent-basics/s3-tool-use',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 03 · AI Agent Foundations
  // ─────────────────────────────────────────────────────────
  {
    id: '03-agent-foundations',
    title: 'AI Agent Foundations',
    icon: '🤖',
    colorHex: '#8b5cf6',
    difficulty: 'beginner',
    estimatedHours: 22,
    prerequisites: [],
    description:
      'Understand the fundamentals of AI agents: the agent loop, tool use, memory systems, reasoning patterns like ReAct and Chain-of-Thought, and how to evaluate agents.',
    chapters: [
      {
        id: 'c1-agent-basics',
        title: 'Agent Basics',
        sections: [
          {
            id: 's1-what-is-an-agent',
            title: 'What is an Agent?',
            difficulty: 'beginner',
            readingMinutes: 8,
            description: 'Define AI agents, contrast them with simple LLM calls, and survey real-world use cases.',
          },
          {
            id: 's2-agent-loop',
            title: 'The Agent Loop',
            difficulty: 'beginner',
            readingMinutes: 10,
            description: 'Walk through the perceive → reason → act → observe cycle that drives every agent.',
          },
          {
            id: 's3-tool-use',
            title: 'Tool Use & Function Calling',
            difficulty: 'beginner',
            readingMinutes: 12,
            description: "Learn how to expose tools to an LLM and handle the model's structured tool-call responses.",
          },
        ],
      },
      {
        id: 'c2-reasoning-patterns',
        title: 'Reasoning Patterns',
        sections: [
          {
            id: 's1-react-pattern',
            title: 'ReAct Pattern',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Interleave Reasoning and Acting steps to ground agent decisions in real observations.',
          },
          {
            id: 's2-chain-of-thought',
            title: 'Chain-of-Thought',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Prompt agents to think step-by-step before committing to an action or final answer.',
          },
          {
            id: 's3-planning-agents',
            title: 'Planning Agents',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: 'Survey planning approaches: task decomposition, goal-based planning, and plan-then-act agents.',
          },
        ],
      },
      {
        id: 'c3-memory-systems',
        title: 'Memory Systems',
        sections: [
          {
            id: 's1-types-of-memory',
            title: 'Types of Memory',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Distinguish in-context (working), episodic, semantic, and procedural memory for agents.',
          },
          {
            id: 's2-memory-implementations',
            title: 'Memory Implementations',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Implement conversation buffers, summary memory, vector-store memory, and entity memory.',
          },
          {
            id: 's3-memory-management',
            title: 'Memory Management',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Manage memory lifecycles: when to store, retrieve, compress, forget, and share across sessions.',
          },
        ],
      },
      {
        id: 'c4-tool-design',
        title: 'Tool Design & Integration',
        sections: [
          {
            id: 's1-tool-design-principles',
            title: 'Tool Design Principles',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Design tools with clear names, strong schemas, idempotency, and agent-friendly error messages.',
          },
          {
            id: 's2-api-tools',
            title: 'API Tools',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Wrap REST and GraphQL APIs as agent tools, handling auth, rate limits, and pagination.',
          },
          {
            id: 's3-code-execution',
            title: 'Code Execution',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Give agents the ability to write and run code securely in sandboxed environments.',
          },
        ],
      },
      {
        id: 'c5-agent-evaluation',
        title: 'Agent Evaluation',
        sections: [
          {
            id: 's1-agent-benchmarks',
            title: 'Agent Benchmarks',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Survey standard benchmarks: WebArena, SWE-bench, HotpotQA, AgentBench, and others.',
          },
          {
            id: 's2-trajectory-evaluation',
            title: 'Trajectory Evaluation',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Evaluate not just final answers but the quality, efficiency, and safety of agent action sequences.',
          },
          {
            id: 's3-cost-reliability',
            title: 'Cost & Reliability',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Measure token spend, latency, error rates, and reliability across many agent runs.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 04 · Agentic AI Architectures
  // ─────────────────────────────────────────────────────────
  {
    id: '04-agentic-architectures',
    title: 'Agentic AI Architectures',
    icon: '🏗️',
    colorHex: '#a855f7',
    difficulty: 'intermediate',
    estimatedHours: 30,
    prerequisites: ['03-agent-foundations'],
    description:
      'Design and build robust agentic systems: from single-agent patterns to complex multi-agent orchestration, hierarchical workflows, and long-running stateful processes.',
    chapters: [
      {
        id: 'c1-single-agent',
        title: 'Single-Agent Systems',
        sections: [
          {
            id: 's1-monolithic-agents',
            title: 'Monolithic Agents',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Build self-contained agents that handle an entire task with a unified tool set and context.',
          },
          {
            id: 's2-single-agent-patterns',
            title: 'Single-Agent Patterns',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Explore prompt chaining, routing, parallelisation, and orchestrator-subagent within a single agent.',
          },
          {
            id: 's3-when-single-agent',
            title: 'When to Use a Single Agent',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Understand the trade-offs and choose appropriately between single-agent and multi-agent designs.',
          },
        ],
      },
      {
        id: 'c2-multi-agent',
        title: 'Multi-Agent Systems',
        sections: [
          {
            id: 's1-multi-agent-overview',
            title: 'Multi-Agent Overview',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Survey the motivations for multi-agent systems: specialisation, parallelism, and resilience.',
          },
          {
            id: 's2-agent-communication',
            title: 'Agent Communication',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Design message-passing, shared memory, and event-driven communication channels between agents.',
          },
          {
            id: 's3-coordination-patterns',
            title: 'Coordination Patterns',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Implement round-robin, auction, market, and consensus coordination mechanisms.',
          },
        ],
      },
      {
        id: 'c3-orchestration',
        title: 'Orchestration Patterns',
        sections: [
          {
            id: 's1-orchestrator-worker',
            title: 'Orchestrator-Worker Pattern',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: 'Separate task planning (orchestrator) from task execution (workers) for cleaner architectures.',
          },
          {
            id: 's2-hierarchical-agents',
            title: 'Hierarchical Agents',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: 'Nest agents in trees or hierarchies to handle tasks at multiple levels of abstraction.',
          },
          {
            id: 's3-parallel-agents',
            title: 'Parallel Agents',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Fan out work across specialised agents in parallel and aggregate results efficiently.',
          },
        ],
      },
      {
        id: 'c4-specialized-patterns',
        title: 'Specialized Patterns',
        sections: [
          {
            id: 's1-mixture-of-agents',
            title: 'Mixture of Agents',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Route to or blend outputs from a diverse ensemble of agent specialisations.',
          },
          {
            id: 's2-supervisor-pattern',
            title: 'Supervisor Pattern',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Use a supervisor agent to monitor, correct, and re-route worker agents at runtime.',
          },
          {
            id: 's3-debate-reflection',
            title: 'Debate & Reflection',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Improve output quality by having agents debate or self-reflect before producing a final answer.',
          },
        ],
      },
      {
        id: 'c5-state-management',
        title: 'State & Workflow Management',
        sections: [
          {
            id: 's1-agent-state',
            title: 'Agent State',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Model agent state as immutable snapshots and design durable state stores for reliability.',
          },
          {
            id: 's2-workflow-orchestration',
            title: 'Workflow Orchestration',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Use graph-based workflow engines (LangGraph, Temporal, Prefect) to manage complex agent flows.',
          },
          {
            id: 's3-long-running-agents',
            title: 'Long-Running Agents',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Handle human-in-the-loop pauses, timeouts, retries, and checkpointing for hours-long agent tasks.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 05 · LLM Foundations for Agents
  // ─────────────────────────────────────────────────────────
  {
    id: '05-llm-foundations',
    title: 'LLM Foundations for Agents',
    icon: '💡',
    colorHex: '#6366f1',
    difficulty: 'beginner',
    estimatedHours: 15,
    prerequisites: [],
    description:
      'Build a solid understanding of LLM capabilities, limitations, and configuration needed to use them effectively as the reasoning engine inside agents.',
    chapters: [
      {
        id: 'c1-llm-capabilities',
        title: 'LLM Capabilities',
        sections: [
          {
            id: 's1-context-windows',
            title: 'Context Windows',
            difficulty: 'beginner',
            readingMinutes: 8,
            description: 'Understand token limits, context utilisation, and strategies for working with long documents.',
          },
          {
            id: 's2-instruction-following',
            title: 'Instruction Following',
            difficulty: 'beginner',
            readingMinutes: 8,
            description: 'Learn how models follow instructions and how formatting, persona, and tone affect compliance.',
          },
          {
            id: 's3-function-calling',
            title: 'Function Calling',
            difficulty: 'beginner',
            readingMinutes: 8,
            description: 'Understand native function-calling APIs: schema, response format, and parallel calls.',
          },
        ],
      },
      {
        id: 'c2-prompting',
        title: 'Prompting for Agents',
        sections: [
          {
            id: 's1-system-prompts',
            title: 'System Prompts',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Craft system prompts that reliably set agent persona, scope, and tool-use behaviour.',
          },
          {
            id: 's2-few-shot-prompting',
            title: 'Few-Shot Prompting',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Use examples in the prompt to steer model behaviour for complex or ambiguous tasks.',
          },
          {
            id: 's3-structured-outputs',
            title: 'Structured Outputs',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Force JSON, XML, or custom schema outputs for deterministic downstream parsing.',
          },
        ],
      },
      {
        id: 'c3-model-selection',
        title: 'Model Selection',
        sections: [
          {
            id: 's1-model-comparison',
            title: 'Model Comparison',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Compare Claude, GPT-4o, Gemini, Llama, Mistral, and others on capability and price.',
          },
          {
            id: 's2-cost-performance',
            title: 'Cost & Performance Trade-offs',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Model cascade strategies: use cheap fast models for easy tasks and reserve large models for hard ones.',
          },
          {
            id: 's3-specialized-models',
            title: 'Specialized Models',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Explore embedding models, re-rankers, vision models, and fine-tuned domain specialists.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 06 · AI Coding Agents
  // ─────────────────────────────────────────────────────────
  {
    id: '06-coding-agents',
    title: 'AI Coding Agents',
    icon: '💻',
    colorHex: '#10b981',
    difficulty: 'intermediate',
    estimatedHours: 28,
    prerequisites: ['03-agent-foundations'],
    description:
      'Study how AI coding agents work, explore leading tools like Claude Code and OpenAI Codex, and learn to build your own code-generation and code-review agents.',
    chapters: [
      {
        id: 'c1-coding-agent-overview',
        title: 'Coding Agent Overview',
        sections: [
          {
            id: 's1-what-are-coding-agents',
            title: 'What Are Coding Agents?',
            difficulty: 'beginner',
            readingMinutes: 10,
            description: 'Define coding agents and survey how they differ from simple autocomplete or chat assistants.',
          },
          {
            id: 's2-coding-agent-components',
            title: 'Coding Agent Components',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Break down the key components: code search, edit tools, test runners, and terminal access.',
          },
          {
            id: 's3-coding-agent-landscape',
            title: 'Coding Agent Landscape',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Survey Claude Code, Copilot, Cursor, Devin, SWE-agent, OpenHands, and their positions.',
          },
        ],
      },
      {
        id: 'c2-claude-code',
        title: 'Claude Code Deep Dive',
        sections: [
          {
            id: 's1-claude-code-architecture',
            title: 'Claude Code Architecture',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: "Explore Claude Code's internal architecture: file tools, bash tool, and agent loop design.",
          },
          {
            id: 's2-claude-code-tools',
            title: 'Claude Code Tools',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: 'Master the Read, Edit, Write, Glob, Grep, Bash, and WebFetch tools available to Claude Code.',
          },
          {
            id: 's3-mcp-protocol',
            title: 'MCP Protocol',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Understand the Model Context Protocol: how servers expose resources, tools, and prompts.',
          },
          {
            id: 's4-claude-code-customization',
            title: 'Claude Code Customization',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Customise Claude Code with CLAUDE.md, custom slash commands, settings, and MCP servers.',
          },
        ],
      },
      {
        id: 'c3-codex-openai',
        title: 'Codex & OpenAI Agents',
        sections: [
          {
            id: 's1-codex-architecture',
            title: 'Codex Architecture',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: "Understand OpenAI Codex's sandboxed cloud environment and its software engineering approach.",
          },
          {
            id: 's2-openai-assistants',
            title: 'OpenAI Assistants API',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Build stateful assistants with threads, runs, file search, code interpreter, and function tools.',
          },
          {
            id: 's3-openai-agent-sdk',
            title: 'OpenAI Agents SDK',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Use the OpenAI Agents SDK for handoffs, guardrails, tracing, and multi-agent orchestration.',
          },
        ],
      },
      {
        id: 'c4-coding-agent-patterns',
        title: 'Coding Agent Patterns',
        sections: [
          {
            id: 's1-edit-verify-loop',
            title: 'Edit-Verify Loop',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Implement the core edit → lint/test → verify cycle that makes coding agents reliable.',
          },
          {
            id: 's2-code-context-management',
            title: 'Code Context Management',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Strategies for efficiently selecting and compressing code context within token budgets.',
          },
          {
            id: 's3-test-driven-agents',
            title: 'Test-Driven Agents',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Use tests as a grounding signal: write failing tests first, then drive the agent to pass them.',
          },
        ],
      },
      {
        id: 'c5-building-coding-agents',
        title: 'Building Coding Agents',
        sections: [
          {
            id: 's1-code-understanding',
            title: 'Code Understanding',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Parse ASTs, call graphs, and symbol trees to give agents deep codebase understanding.',
          },
          {
            id: 's2-code-generation-patterns',
            title: 'Code Generation Patterns',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Scaffold, implement, and refactor code reliably with structured prompting and verification.',
          },
          {
            id: 's3-code-review-agents',
            title: 'Code Review Agents',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Build automated code review agents that check style, logic, security, and test coverage.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 07 · SDKs & Frameworks
  // ─────────────────────────────────────────────────────────
  {
    id: '07-sdks-frameworks',
    title: 'SDKs & Frameworks',
    icon: '🛠️',
    colorHex: '#f59e0b',
    difficulty: 'intermediate',
    estimatedHours: 35,
    prerequisites: ['03-agent-foundations', '05-llm-foundations'],
    description:
      'Get hands-on with the leading agent SDKs and frameworks: Anthropic SDK, LangChain/LangGraph, LlamaIndex, CrewAI, AutoGen, and more. Learn when and how to use each.',
    chapters: [
      {
        id: 'c1-anthropic-sdk',
        title: 'Anthropic SDK',
        sections: [
          {
            id: 's1-anthropic-sdk-basics',
            title: 'Anthropic SDK Basics',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Install and configure the Anthropic Python and TypeScript SDKs for production use.',
          },
          {
            id: 's2-messages-api',
            title: 'Messages API',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Master the Messages API: roles, content blocks, streaming, caching, and vision inputs.',
          },
          {
            id: 's3-tool-use-api',
            title: 'Tool Use API',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Implement tool use with the Anthropic SDK: defining tools, handling tool_use blocks, and loops.',
          },
          {
            id: 's4-claude-agent-sdk',
            title: 'Claude Agent SDK',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Use the Claude Agent SDK for higher-level abstractions, sessions, and multi-turn tool loops.',
          },
        ],
      },
      {
        id: 'c2-langchain',
        title: 'LangChain & LangGraph',
        sections: [
          {
            id: 's1-langchain-overview',
            title: 'LangChain Overview',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: "Survey LangChain's architecture: chains, runnables, LCEL, and the component ecosystem.",
          },
          {
            id: 's2-langchain-agents',
            title: 'LangChain Agents',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: 'Build ReAct and OpenAI-tools agents with LangChain, including custom tools and callbacks.',
          },
          {
            id: 's3-langgraph',
            title: 'LangGraph',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: 'Model stateful, cyclic agent workflows as directed graphs with LangGraph nodes and edges.',
          },
          {
            id: 's4-langsmith',
            title: 'LangSmith',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: 'Trace, evaluate, and iterate on LangChain and LangGraph apps with LangSmith.',
          },
        ],
      },
      {
        id: 'c3-llamaindex',
        title: 'LlamaIndex',
        sections: [
          {
            id: 's1-llamaindex-overview',
            title: 'LlamaIndex Overview',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: "Understand LlamaIndex's data-centric approach: data connectors, indexes, and query engines.",
          },
          {
            id: 's2-llamaindex-rag',
            title: 'LlamaIndex for RAG',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Build retrieval pipelines with LlamaIndex: ingestion, vector stores, and retrieval strategies.',
          },
          {
            id: 's3-llamaindex-agents',
            title: 'LlamaIndex Agents',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Create ReAct and OpenAI-tools agents backed by LlamaIndex query tools and memory.',
          },
          {
            id: 's4-llamaindex-workflows',
            title: 'LlamaIndex Workflows',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Orchestrate complex, event-driven agentic workflows with the LlamaIndex Workflows API.',
          },
        ],
      },
      {
        id: 'c4-multi-agent-frameworks',
        title: 'Multi-Agent Frameworks',
        sections: [
          {
            id: 's1-crewai',
            title: 'CrewAI',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: "Build role-based AI crews with CrewAI's agents, tasks, and process primitives.",
          },
          {
            id: 's2-autogen',
            title: 'AutoGen',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: "Use Microsoft's AutoGen for conversable, composable multi-agent conversations.",
          },
          {
            id: 's3-haystack',
            title: 'Haystack',
            difficulty: 'intermediate',
            readingMinutes: 14,
            description: "Build production AI pipelines with Deepset's Haystack: components, pipelines, and agents.",
          },
          {
            id: 's4-dspy',
            title: 'DSPy',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Programmatically optimise LLM prompts and weights with DSPy signatures and teleprompters.',
          },
        ],
      },
      {
        id: 'c5-framework-selection',
        title: 'Framework Selection Guide',
        sections: [
          {
            id: 's1-comparison',
            title: 'Framework Comparison',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Head-to-head comparison of all major frameworks on abstraction level, flexibility, and maturity.',
          },
          {
            id: 's2-selection-criteria',
            title: 'Selection Criteria',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Decision framework: team expertise, use-case fit, ecosystem, and long-term maintenance.',
          },
          {
            id: 's3-mixing-frameworks',
            title: 'Mixing Frameworks',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Strategies for composing multiple frameworks (e.g., LlamaIndex retrieval + LangGraph orchestration).',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 08 · Enterprise Agentic AI
  // ─────────────────────────────────────────────────────────
  {
    id: '08-enterprise-agentic',
    title: 'Enterprise Agentic AI',
    icon: '🏢',
    colorHex: '#ef4444',
    difficulty: 'advanced',
    estimatedHours: 30,
    prerequisites: ['04-agentic-architectures', '07-sdks-frameworks'],
    description:
      'Deploy agentic AI systems in enterprise environments with production-grade reliability, observability, cost controls, scalability, and governance.',
    chapters: [
      {
        id: 'c1-production-patterns',
        title: 'Production Patterns',
        sections: [
          {
            id: 's1-reliability-patterns',
            title: 'Reliability Patterns',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Implement retries, circuit breakers, fallbacks, and graceful degradation for agent reliability.',
          },
          {
            id: 's2-error-handling',
            title: 'Error Handling & Recovery',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Design robust error handling strategies that keep agents productive when tools or APIs fail.',
          },
          {
            id: 's3-deployment-strategies',
            title: 'Deployment Strategies',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Compare containerised, serverless, and hosted deployment models for production agents.',
          },
        ],
      },
      {
        id: 'c2-observability',
        title: 'Observability',
        sections: [
          {
            id: 's1-tracing-agents',
            title: 'Tracing Agents',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Instrument agents with distributed tracing (OpenTelemetry, LangSmith) for full span visibility.',
          },
          {
            id: 's2-logging-monitoring',
            title: 'Logging & Monitoring',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Build structured logging pipelines and dashboards for agent health, latency, and errors.',
          },
          {
            id: 's3-alerting-debugging',
            title: 'Alerting & Debugging',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Set up actionable alerts and replay/debug agent runs from captured traces.',
          },
        ],
      },
      {
        id: 'c3-cost-optimization',
        title: 'Cost Optimization',
        sections: [
          {
            id: 's1-token-budgeting',
            title: 'Token Budgeting',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Set and enforce per-agent, per-session, and per-feature token and cost budgets.',
          },
          {
            id: 's2-caching-strategies',
            title: 'Caching Strategies',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Use prompt caching, result memoisation, and semantic deduplication to cut LLM spend.',
          },
          {
            id: 's3-model-routing',
            title: 'Model Routing',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Dynamically route tasks to cheaper models when quality requirements allow, saving up to 80% cost.',
          },
        ],
      },
      {
        id: 'c4-scalability',
        title: 'Scalability',
        sections: [
          {
            id: 's1-horizontal-scaling',
            title: 'Horizontal Scaling',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Scale agent fleets horizontally with stateless design, queue-based dispatch, and autoscaling.',
          },
          {
            id: 's2-rate-limiting',
            title: 'Rate Limiting & Throttling',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Manage API rate limits across large agent fleets with token bucket and leaky bucket patterns.',
          },
          {
            id: 's3-distributed-state',
            title: 'Distributed State',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Synchronise agent state across distributed workers with Redis, DynamoDB, or Postgres.',
          },
        ],
      },
      {
        id: 'c5-governance',
        title: 'Governance',
        sections: [
          {
            id: 's1-ai-policy',
            title: 'AI Policy & Standards',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Establish organisational AI use policies, acceptable-use standards, and approval workflows.',
          },
          {
            id: 's2-audit-trails',
            title: 'Audit Trails',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Create immutable audit logs of all agent actions and decisions for compliance and forensics.',
          },
          {
            id: 's3-human-oversight',
            title: 'Human Oversight',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Design human-in-the-loop approval gates for high-risk agent actions and escalation paths.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 09 · Security & Compliance
  // ─────────────────────────────────────────────────────────
  {
    id: '09-security-compliance',
    title: 'Security & Compliance',
    icon: '🔒',
    colorHex: '#f97316',
    difficulty: 'advanced',
    estimatedHours: 25,
    prerequisites: ['04-agentic-architectures'],
    description:
      'Secure agentic AI systems against prompt injection, data exfiltration, privilege escalation, and other threats while meeting regulatory compliance requirements.',
    chapters: [
      {
        id: 'c1-threat-model',
        title: 'Threat Modelling for Agents',
        sections: [
          {
            id: 's1-attack-surface',
            title: 'Agent Attack Surface',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Map the attack surface: prompt injection, tool abuse, data exfiltration, and model inversion.',
          },
          {
            id: 's2-prompt-injection',
            title: 'Prompt Injection',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Understand direct and indirect prompt injection, jailbreaking, and how to mitigate them.',
          },
          {
            id: 's3-threat-scenarios',
            title: 'Threat Scenarios',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Work through end-to-end threat scenarios for autonomous agents operating in enterprise environments.',
          },
        ],
      },
      {
        id: 'c2-defensive-patterns',
        title: 'Defensive Patterns',
        sections: [
          {
            id: 's1-input-validation',
            title: 'Input Validation & Sanitisation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Validate and sanitise all inputs before they reach the LLM or agent tools.',
          },
          {
            id: 's2-output-filtering',
            title: 'Output Filtering & Guardrails',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Apply content filters, PII detectors, and policy guardrails on every agent output.',
          },
          {
            id: 's3-sandboxing',
            title: 'Sandboxing & Isolation',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Run agent tools in isolated sandboxes (containers, VMs, e2b) to contain blast radius.',
          },
        ],
      },
      {
        id: 'c3-access-control',
        title: 'Access Control',
        sections: [
          {
            id: 's1-least-privilege',
            title: 'Principle of Least Privilege',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Grant agents only the minimum permissions needed and revoke them when the task completes.',
          },
          {
            id: 's2-rbac-abac',
            title: 'RBAC & ABAC for Agents',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Apply role-based and attribute-based access control to agent tool invocations and data access.',
          },
          {
            id: 's3-secrets-management',
            title: 'Secrets Management',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Securely inject API keys and credentials into agent environments without leaking them to the LLM.',
          },
        ],
      },
      {
        id: 'c4-compliance',
        title: 'Regulatory Compliance',
        sections: [
          {
            id: 's1-gdpr-ccpa',
            title: 'GDPR & CCPA',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Meet GDPR/CCPA requirements when agents process personal data: consent, erasure, and minimisation.',
          },
          {
            id: 's2-soc2-iso27001',
            title: 'SOC 2 & ISO 27001',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Align agentic AI systems with SOC 2 trust criteria and ISO 27001 control objectives.',
          },
          {
            id: 's3-ai-regulations',
            title: 'AI-Specific Regulations',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Understand the EU AI Act, NIST AI RMF, and emerging AI-specific compliance frameworks.',
          },
        ],
      },
      {
        id: 'c5-data-privacy',
        title: 'Data Privacy',
        sections: [
          {
            id: 's1-data-minimization',
            title: 'Data Minimization',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Collect and retain only the data agents truly need; anonymise and aggregate where possible.',
          },
          {
            id: 's2-pii-handling',
            title: 'PII Handling',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Detect, redact, tokenise, and vault PII in agent inputs, outputs, and long-term memory.',
          },
          {
            id: 's3-data-residency',
            title: 'Data Residency & Sovereignty',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Ensure agent data stays within required geographic boundaries using routing and encryption.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 10 · Evaluation & Observability
  // ─────────────────────────────────────────────────────────
  {
    id: '10-evaluation-observability',
    title: 'Evaluation & Observability',
    icon: '📊',
    colorHex: '#14b8a6',
    difficulty: 'intermediate',
    estimatedHours: 20,
    prerequisites: ['03-agent-foundations', '01-rag-fundamentals'],
    description:
      'Build rigorous evaluation pipelines and observability stacks for RAG and agent systems. Move from manual testing to automated, continuous quality assurance.',
    chapters: [
      {
        id: 'c1-evaluation-frameworks',
        title: 'Evaluation Frameworks',
        sections: [
          {
            id: 's1-evaluation-overview',
            title: 'Evaluation Overview',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Survey the evaluation landscape: offline evals, online evals, human evals, and LLM-as-judge.',
          },
          {
            id: 's2-llm-as-judge',
            title: 'LLM-as-Judge',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Use LLMs as automated evaluators with reference-based and reference-free grading rubrics.',
          },
          {
            id: 's3-eval-datasets',
            title: 'Evaluation Datasets',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Create, curate, and version evaluation datasets that reflect real production distributions.',
          },
        ],
      },
      {
        id: 'c2-testing-strategies',
        title: 'Testing Strategies',
        sections: [
          {
            id: 's1-unit-testing-agents',
            title: 'Unit Testing Agents',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Mock LLM calls and tool responses to write fast, deterministic unit tests for agent logic.',
          },
          {
            id: 's2-integration-testing',
            title: 'Integration Testing',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Test agent pipelines end-to-end against real (or seeded) external services.',
          },
          {
            id: 's3-regression-testing',
            title: 'Regression Testing',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Run eval suites on every model update or code change to catch quality regressions early.',
          },
        ],
      },
      {
        id: 'c3-tracing-tools',
        title: 'Tracing Tools',
        sections: [
          {
            id: 's1-opentelemetry-agents',
            title: 'OpenTelemetry for Agents',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Instrument agent pipelines with OpenTelemetry spans, attributes, and context propagation.',
          },
          {
            id: 's2-langsmith-tracing',
            title: 'LangSmith Tracing',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Use LangSmith to capture, replay, annotate, and evaluate LangChain/LangGraph runs.',
          },
          {
            id: 's3-custom-tracing',
            title: 'Custom Tracing Solutions',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Build custom tracing with Weights & Biases, Arize, Helicone, or a homegrown solution.',
          },
        ],
      },
      {
        id: 'c4-continuous-improvement',
        title: 'Continuous Improvement',
        sections: [
          {
            id: 's1-feedback-loops',
            title: 'Feedback Loops',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Capture implicit and explicit user feedback and route it into your eval and fine-tuning pipelines.',
          },
          {
            id: 's2-ab-testing',
            title: 'A/B Testing Agents',
            difficulty: 'intermediate',
            readingMinutes: 10,
            description: 'Run controlled experiments to compare agent versions, prompt changes, and model upgrades.',
          },
          {
            id: 's3-fine-tuning-loop',
            title: 'Fine-Tuning Loop',
            difficulty: 'intermediate',
            readingMinutes: 12,
            description: 'Close the loop from production failures to fine-tuned models with curated distillation datasets.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 11 · Vibe Engineering
  // ─────────────────────────────────────────────────────────
  {
    id: '11-vibe-engineering',
    title: 'Vibe Engineering',
    icon: '⚡',
    colorHex: '#ec4899',
    difficulty: 'advanced',
    estimatedHours: 60,
    prerequisites: ['06-coding-agents', '08-enterprise-agentic', '09-security-compliance'],
    description:
      'The disciplined, enterprise-grade methodology of leveraging AI-assisted development tools to accelerate the entire software product lifecycle while enforcing organisational standards, security controls, and architectural governance.',
    chapters: [
      {
        id: 'c1-philosophy-principles',
        title: 'The Philosophy & Principles of Vibe Engineering',
        sections: [
          {
            id: 's1-vibe-engineering-vs-vibe-coding',
            title: 'Vibe Engineering vs Vibe Coding',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Distinguish undisciplined vibe coding from structured vibe engineering with organisational guardrails.',
          },
          {
            id: 's2-core-principles',
            title: 'Core Principles',
            difficulty: 'advanced',
            readingMinutes: 10,
            description: 'The five core principles: intentionality, verifiability, auditability, governance, and velocity.',
          },
          {
            id: 's3-enterprise-engineering-mindset',
            title: 'Enterprise Engineering Mindset',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Shift from ad-hoc AI use to systematic AI-augmented engineering practices across the SDLC.',
          },
          {
            id: 's4-ai-constitution-claudemd',
            title: 'AI Constitution & CLAUDE.md',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Write an organisational AI constitution and encode it into CLAUDE.md for consistent behaviour.',
          },
        ],
      },
      {
        id: 'c2-requirements-and-design',
        title: 'AI-Assisted Requirements & Architecture',
        sections: [
          {
            id: 's1-requirements-discovery',
            title: 'Requirements Discovery',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Use AI agents to elicit, refine, and validate requirements from stakeholder conversations.',
          },
          {
            id: 's2-adrs-with-ai',
            title: 'Architecture Decision Records with AI',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Generate, review, and maintain ADRs with AI assistance while keeping humans in the decision seat.',
          },
          {
            id: 's3-api-contract-design',
            title: 'API Contract Design',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Draft and validate OpenAPI/AsyncAPI contracts with AI, catching inconsistencies before coding.',
          },
          {
            id: 's4-nfr-automation',
            title: 'NFR Automation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Automate non-functional requirement checks (performance, availability, security) into CI gates.',
          },
        ],
      },
      {
        id: 'c3-environment-setup',
        title: 'Setting Up the Vibe Engineering Environment',
        sections: [
          {
            id: 's1-claudemd-enterprise-patterns',
            title: 'CLAUDE.md Enterprise Patterns',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Author CLAUDE.md files at project, team, and org level that encode standards and tool policies.',
          },
          {
            id: 's2-custom-slash-commands',
            title: 'Custom Slash Commands',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Build reusable slash commands for common workflows: PR creation, ADR drafting, test generation.',
          },
          {
            id: 's3-mcp-enterprise-tools',
            title: 'MCP Enterprise Tools',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Connect Claude Code to Jira, GitHub, Confluence, Datadog, and internal tools via MCP servers.',
          },
          {
            id: 's4-automated-quality-gates',
            title: 'Automated Quality Gates',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Wire linters, formatters, SAST tools, and test runners as automatic post-edit quality gates.',
          },
        ],
      },
      {
        id: 'c4-ai-first-development',
        title: 'AI-First Development Patterns',
        sections: [
          {
            id: 's1-ai-first-tdd',
            title: 'AI-First TDD',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Drive development by writing acceptance tests first and letting the AI implement to pass them.',
          },
          {
            id: 's2-feature-workflow-jira-to-pr',
            title: 'Feature Workflow: Jira to PR',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Automate the full journey from Jira ticket to merged PR using AI and custom slash commands.',
          },
          {
            id: 's3-ai-pair-programming',
            title: 'AI Pair Programming',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Effective techniques for pairing with AI: when to lead, when to review, and how to stay in control.',
          },
          {
            id: 's4-large-scale-cross-file-changes',
            title: 'Large-Scale Cross-File Changes',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Use AI to safely execute large refactors, renames, and migrations across thousands of files.',
          },
        ],
      },
      {
        id: 'c5-code-quality-review',
        title: 'Code Quality & Automated Review',
        sections: [
          {
            id: 's1-ai-as-first-reviewer',
            title: 'AI as First Reviewer',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Run AI pre-review on every PR to catch bugs, style violations, and security issues before humans.',
          },
          {
            id: 's2-pr-description-automation',
            title: 'PR Description Automation',
            difficulty: 'advanced',
            readingMinutes: 10,
            description: 'Auto-generate rich PR descriptions with context, testing instructions, and risk assessment.',
          },
          {
            id: 's3-architecture-conformance',
            title: 'Architecture Conformance',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Enforce architectural rules (layer boundaries, module coupling) as automated CI checks.',
          },
          {
            id: 's4-technical-debt-management',
            title: 'Technical Debt Management',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Use AI to continuously identify, prioritise, and schedule technical debt remediation.',
          },
        ],
      },
      {
        id: 'c6-testing-strategy',
        title: 'AI-Augmented Testing Strategy',
        sections: [
          {
            id: 's1-unit-integration-test-generation',
            title: 'Unit & Integration Test Generation',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Generate comprehensive unit and integration tests with high branch coverage from code context.',
          },
          {
            id: 's2-e2e-test-from-user-stories',
            title: 'E2E Tests from User Stories',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Derive Playwright/Cypress E2E tests directly from user story acceptance criteria with AI.',
          },
          {
            id: 's3-security-test-automation',
            title: 'Security Test Automation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Generate fuzz tests, OWASP checks, and auth boundary tests automatically from code analysis.',
          },
          {
            id: 's4-test-data-generation',
            title: 'Test Data Generation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Create realistic, schema-conformant test data sets including edge cases and adversarial inputs.',
          },
        ],
      },
      {
        id: 'c7-security-compliance-loop',
        title: 'Security & Compliance in the Development Loop',
        sections: [
          {
            id: 's1-sast-in-agent-loop',
            title: 'SAST in the Agent Loop',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Run static analysis (Semgrep, Bandit, CodeQL) inside the agent loop and auto-remediate findings.',
          },
          {
            id: 's2-dependency-vulnerability-remediation',
            title: 'Dependency Vulnerability Remediation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Detect and auto-patch vulnerable dependencies with AI-generated upgrade PRs.',
          },
          {
            id: 's3-compliance-controls-in-claudemd',
            title: 'Compliance Controls in CLAUDE.md',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Encode GDPR, SOC 2, HIPAA, and PCI controls as CLAUDE.md rules that apply to every session.',
          },
          {
            id: 's4-secrets-detection',
            title: 'Secrets Detection',
            difficulty: 'advanced',
            readingMinutes: 10,
            description: 'Integrate secrets scanners (Trufflehog, gitleaks) as pre-commit hooks and CI gates.',
          },
        ],
      },
      {
        id: 'c8-living-documentation',
        title: 'Living Documentation',
        sections: [
          {
            id: 's1-code-first-api-docs',
            title: 'Code-First API Documentation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Generate and keep OpenAPI docs in sync with implementation using AI-powered doc agents.',
          },
          {
            id: 's2-architecture-doc-freshness',
            title: 'Architecture Doc Freshness',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Detect when code changes invalidate architecture docs and generate targeted update suggestions.',
          },
          {
            id: 's3-runbook-generation',
            title: 'Runbook Generation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Auto-generate operational runbooks from code, infrastructure, and incident history.',
          },
          {
            id: 's4-knowledge-capture-onboarding',
            title: 'Knowledge Capture & Onboarding',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Build AI-powered onboarding assistants that answer codebase questions from living documentation.',
          },
        ],
      },
      {
        id: 'c9-cicd-devops',
        title: 'CI/CD & DevOps with AI',
        sections: [
          {
            id: 's1-pipeline-as-code',
            title: 'Pipeline as Code',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Generate and optimise GitHub Actions, GitLab CI, and Jenkins pipelines with AI assistance.',
          },
          {
            id: 's2-infrastructure-as-code',
            title: 'Infrastructure as Code',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Write, review, and refactor Terraform, Pulumi, and CDK infrastructure with AI pair programming.',
          },
          {
            id: 's3-container-kubernetes-generation',
            title: 'Container & Kubernetes Generation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Generate production-ready Dockerfiles, Helm charts, and Kubernetes manifests from service context.',
          },
          {
            id: 's4-release-automation',
            title: 'Release Automation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Automate changelogs, semantic versioning, release notes, and deployment orchestration with AI.',
          },
        ],
      },
      {
        id: 'c10-monitoring-incidents',
        title: 'Monitoring & Incident Response',
        sections: [
          {
            id: 's1-ai-log-analysis',
            title: 'AI Log Analysis',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Use AI to parse, cluster, and surface actionable signals from high-volume log streams.',
          },
          {
            id: 's2-incident-triage-workflow',
            title: 'Incident Triage Workflow',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Automate incident detection, severity classification, and initial triage with AI agents.',
          },
          {
            id: 's3-hotfix-generation-deployment',
            title: 'Hotfix Generation & Deployment',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Generate, test, and deploy hotfixes in minutes using AI-accelerated incident response playbooks.',
          },
          {
            id: 's4-post-incident-report-automation',
            title: 'Post-Incident Report Automation',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Automatically draft post-incident reports from timeline data, traces, and on-call notes.',
          },
        ],
      },
      {
        id: 'c11-organizational-adoption',
        title: 'Organizational Adoption & Governance',
        sections: [
          {
            id: 's1-ai-usage-policy',
            title: 'AI Usage Policy',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Draft and maintain a comprehensive organisational AI usage policy for engineering teams.',
          },
          {
            id: 's2-center-of-excellence',
            title: 'Center of Excellence',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Stand up an AI Center of Excellence to share patterns, tooling, and best practices org-wide.',
          },
          {
            id: 's3-measuring-ai-impact',
            title: 'Measuring AI Impact',
            difficulty: 'advanced',
            readingMinutes: 12,
            description: 'Define and track engineering metrics (DORA, cycle time, defect escape rate) for AI impact measurement.',
          },
          {
            id: 's4-governance-cost-risk',
            title: 'Governance, Cost & Risk',
            difficulty: 'advanced',
            readingMinutes: 14,
            description: 'Build a governance framework that balances AI-driven velocity with cost controls and risk management.',
          },
        ],
      },
    ],
  },
]

export default CURRICULUM

// ────────────────────────────────────────────────
// Utility functions
// ────────────────────────────────────────────────

export function getCurriculumById(subjectId) {
  return CURRICULUM.find(s => s.id === subjectId) ?? null
}

export function getChapterById(subjectId, chapterId) {
  const subject = getCurriculumById(subjectId)
  return subject?.chapters?.find(c => c.id === chapterId) ?? null
}

export function getSectionById(subjectId, chapterId, sectionId) {
  const chapter = getChapterById(subjectId, chapterId)
  return chapter?.sections?.find(s => s.id === sectionId) ?? null
}

/**
 * Returns { prev, next } for a given section position across all subjects.
 * Each of prev/next has shape: { title, subjectId, chapterId, sectionId, crossesChapter?, crossesSubject?, subjectTitle? }
 */
export function getAdjacentSections(subjectId, chapterId, sectionId) {
  // Build a flat ordered list of all section pointers across the entire curriculum
  const flat = []
  for (const subject of CURRICULUM) {
    for (const chapter of subject.chapters ?? []) {
      for (const section of chapter.sections ?? []) {
        flat.push({
          subjectId: subject.id,
          subjectTitle: subject.title,
          chapterId: chapter.id,
          sectionId: section.id,
          title: section.title,
        })
      }
    }
  }

  const idx = flat.findIndex(
    p => p.subjectId === subjectId && p.chapterId === chapterId && p.sectionId === sectionId,
  )

  if (idx === -1) return { prev: null, next: null }

  const current = flat[idx]

  const buildEntry = (pointer) => {
    if (!pointer) return null
    const crossesSubject = pointer.subjectId !== current.subjectId
    const crossesChapter = !crossesSubject && pointer.chapterId !== current.chapterId
    return {
      title: pointer.title,
      subjectId: pointer.subjectId,
      chapterId: pointer.chapterId,
      sectionId: pointer.sectionId,
      ...(crossesSubject ? { crossesSubject: true, subjectTitle: pointer.subjectTitle } : {}),
      ...(crossesChapter ? { crossesChapter: true } : {}),
    }
  }

  return {
    prev: buildEntry(flat[idx - 1] ?? null),
    next: buildEntry(flat[idx + 1] ?? null),
  }
}

/**
 * Resolves a buildsOn string of the form "subjectId/chapterId/sectionId".
 * Returns { subjectId, chapterId, sectionId, title, subjectTitle } or null.
 */
export function resolveBuildsOn(buildsOnStr) {
  if (!buildsOnStr) return null
  const parts = buildsOnStr.split('/')
  if (parts.length !== 3) return null
  const [sId, cId, secId] = parts
  const subject = getCurriculumById(sId)
  if (!subject) return null
  const chapter = subject.chapters?.find(c => c.id === cId) ?? null
  if (!chapter) return null
  const section = chapter.sections?.find(s => s.id === secId) ?? null
  if (!section) return null
  return {
    subjectId: sId,
    chapterId: cId,
    sectionId: secId,
    title: section.title,
    subjectTitle: subject.title,
  }
}

export function getSubjectSectionCount(subjectId) {
  const subject = getCurriculumById(subjectId)
  if (!subject) return 0
  return subject.chapters?.reduce((total, ch) => total + (ch.sections?.length ?? 0), 0) ?? 0
}
