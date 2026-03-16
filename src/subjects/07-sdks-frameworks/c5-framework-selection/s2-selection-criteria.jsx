import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'

export default function SelectionCriteria() {
  return (
    <article className="prose-content">
      <h2>Framework Selection Criteria</h2>
      <p>
        Selecting an LLM framework is an architectural decision with long-term consequences.
        A poor choice leads to fighting abstractions, performance ceilings, and painful
        migrations. This guide provides a structured decision framework based on use case
        type, team context, and production requirements.
      </p>

      <h2>Step 1: Identify Your Primary Use Case</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-3 text-left font-semibold">Use Case</th>
              <th className="px-3 py-3 text-left font-semibold">First Choice</th>
              <th className="px-3 py-3 text-left font-semibold">Alternative</th>
              <th className="px-3 py-3 text-left font-semibold">Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Document Q&A / RAG', 'LlamaIndex', 'Haystack', 'Native RAG primitives, best-in-class index types'],
              ['Complex agent workflows', 'LangGraph', 'Custom + Anthropic SDK', 'State machines, cycles, human-in-the-loop'],
              ['Multi-agent collaboration', 'CrewAI', 'AutoGen', 'Role-based crews, easy setup, memory built-in'],
              ['Code generation & execution', 'AutoGen', 'LangGraph', 'Native code execution sandbox, conversational loops'],
              ['Production RAG pipeline', 'Haystack', 'LlamaIndex', 'Type safety, serialization, enterprise support'],
              ['Prompt optimization', 'DSPy', 'None (unique)', 'Only framework with systematic prompt compilation'],
              ['Simple chatbot / chain', 'LangChain LCEL', 'Anthropic SDK directly', 'Widest model support, streaming built-in'],
              ['TypeScript/Node.js first', 'LangChain.js', 'Vercel AI SDK', 'Best TS ecosystem coverage'],
            ].map(([useCase, first, alt, rationale]) => (
              <tr key={useCase} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-3 font-medium text-gray-900 dark:text-gray-100">{useCase}</td>
                <td className="px-3 py-3 font-semibold text-blue-600 dark:text-blue-400">{first}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{alt}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Decision Tree</h2>

      <ConceptBlock term="Question 1: Do you need multi-agent orchestration?">
        <p>
          <strong>Yes, role-based crews (researcher + writer + reviewer):</strong> Use CrewAI.
          It models agent collaboration naturally and handles task dependencies.<br/>
          <strong>Yes, conversational code-gen with execution:</strong> Use AutoGen.
          Its UserProxyAgent + code execution loop is unmatched for this pattern.<br/>
          <strong>Yes, complex graph-based workflows with cycles/loops:</strong> Use LangGraph.
          Gives you full state machine control.<br/>
          <strong>No:</strong> Continue to Question 2.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Question 2: Is retrieval over documents your primary capability?">
        <p>
          <strong>Yes, and I need maximum RAG quality:</strong> Use LlamaIndex.
          Best index types, query engines, and retrieval primitives.<br/>
          <strong>Yes, and I need production serialization + type safety:</strong> Use Haystack.
          Pipeline YAML serialization and strongly typed component I/O.<br/>
          <strong>No:</strong> Continue to Question 3.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Question 3: Do you need systematic prompt optimization?">
        <p>
          <strong>Yes, and I have labeled evaluation data:</strong> Use DSPy.
          Compile prompts automatically using your examples and metric.<br/>
          <strong>No:</strong> Continue to Question 4.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Question 4: What is your team's primary language?">
        <p>
          <strong>TypeScript/JavaScript first:</strong> Use LangChain.js or Vercel AI SDK.
          Only LangChain has full parity across Python and TypeScript.<br/>
          <strong>Python:</strong> Consider LangChain for breadth, or go framework-free with
          the Anthropic SDK directly for simpler use cases.
        </p>
      </ConceptBlock>

      <h2>Production Requirements Checklist</h2>

      <SDKExample
        title="Framework Evaluation Scorecard"
        tabs={{
          python: `# Use this as a decision matrix — score 1-5 for your needs
evaluation_criteria = {
    "observability": {
        "question": "Do you need built-in tracing and debugging?",
        "langchain": 5,      # LangSmith is excellent
        "llamaindex": 4,     # Built-in callbacks, LlamaCloud tracing
        "crewai": 3,         # Basic logging
        "autogen": 3,        # Console logging
        "haystack": 4,       # Haystack tracing + OpenTelemetry
        "dspy": 3,           # MLflow integration
    },
    "streaming": {
        "question": "Do you need real-time streaming output?",
        "langchain": 5,      # Excellent LCEL streaming
        "llamaindex": 4,     # Streaming query engines
        "crewai": 2,         # Limited
        "autogen": 2,        # Limited
        "haystack": 4,       # Async streaming generators
        "dspy": 2,           # Limited streaming
    },
    "evaluation": {
        "question": "Do you need built-in evaluation frameworks?",
        "langchain": 5,      # LangSmith datasets + evals
        "llamaindex": 4,     # LlamaIndex evals library
        "crewai": 2,         # Manual
        "autogen": 2,        # Manual
        "haystack": 4,       # Haystack evaluation pipelines
        "dspy": 5,           # Core feature: metric-driven optimization
    },
    "vendor_lock_in": {
        "question": "How important is avoiding vendor lock-in?",
        "langchain": 4,      # Abstraction over many providers
        "llamaindex": 4,     # Multi-provider support
        "crewai": 3,         # LangChain-based, some lock-in
        "autogen": 4,        # Model-agnostic
        "haystack": 5,       # Fully open, self-hostable
        "dspy": 5,           # Model-agnostic, compile to any LLM
    },
    "deployment_simplicity": {
        "question": "How important is simple production deployment?",
        "langchain": 3,      # LangServe helps, complex deps
        "llamaindex": 3,     # Straightforward but index management needed
        "crewai": 4,         # Simple kickoff() interface
        "autogen": 2,        # Docker setup needed for code execution
        "haystack": 5,       # Serializable pipelines, REST API built-in
        "dspy": 4,           # Load compiled JSON, simple inference
    },
}

def score_framework(framework: str, weights: dict) -> float:
    """Score a framework based on weighted criteria."""
    total = sum(
        evaluation_criteria[criterion][framework] * weight
        for criterion, weight in weights.items()
        if criterion in evaluation_criteria
    )
    max_score = sum(5 * w for w in weights.values())
    return total / max_score

# Example: production RAG application weights
rag_weights = {
    "observability": 0.25,
    "streaming": 0.20,
    "evaluation": 0.25,
    "vendor_lock_in": 0.15,
    "deployment_simplicity": 0.15,
}

for fw in ["langchain", "llamaindex", "haystack", "dspy"]:
    score = score_framework(fw, rag_weights)
    print(f"{fw:12}: {score:.0%}")
# llamaindex  : 84%
# haystack    : 90%
# langchain   : 82%
# dspy        : 70%`,
        }}
      />

      <h2>Team Expertise Considerations</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-3 text-left font-semibold">Team Background</th>
              <th className="px-3 py-3 text-left font-semibold">Recommended Framework</th>
              <th className="px-3 py-3 text-left font-semibold">Learning Curve</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['ML/Research background', 'DSPy', 'Medium — familiar concepts, new paradigm'],
              ['Backend / SWE background', 'Haystack or LangChain', 'Low — familiar patterns (pipelines, APIs)'],
              ['Data engineering background', 'LlamaIndex', 'Low — data pipeline concepts transfer well'],
              ['No LLM framework experience', 'LangChain or CrewAI', 'Medium — large community, many tutorials'],
              ['Node.js / TypeScript team', 'LangChain.js or Vercel AI SDK', 'Low — native TypeScript support'],
            ].map(([bg, fw, curve]) => (
              <tr key={bg} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-3 text-gray-900 dark:text-gray-100">{bg}</td>
                <td className="px-3 py-3 font-semibold text-blue-600 dark:text-blue-400">{fw}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{curve}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PatternBlock
        name="Thin Wrapper Strategy"
        category="Architecture"
        whenToUse="When long-term maintainability and framework flexibility matter more than speed of initial development. Wrapping framework calls prevents deep coupling and makes migration feasible."
      >
        <p>
          Wrap all framework calls behind your own interfaces. Define a
          <code>Retriever</code> protocol, a <code>LLMClient</code> protocol, and
          a <code>Pipeline</code> interface in your codebase. Framework code lives only
          in adapter implementations. This adds a day of upfront work but makes it
          possible to swap frameworks without touching application logic.
        </p>
      </PatternBlock>

      <BestPracticeBlock title="Prototype Before Committing">
        <p>Before committing to a framework, build a working prototype of your hardest
        use case — not a hello-world tutorial. The prototype should use your real data,
        hit the API endpoints you'll call in production, and handle error cases. A day
        spent prototyping can save weeks of migration later. Document what was easy,
        what required workarounds, and what was impossible.</p>
      </BestPracticeBlock>

      <NoteBlock type="warning" title="Framework Stability Varies Significantly">
        <p>As of 2025, LangChain has a history of breaking changes between minor versions.
        LlamaIndex has stabilized since 0.10. CrewAI is newer and still evolving rapidly.
        Haystack 2.x is stable with a clear migration path. Always pin exact versions in
        production (<code>requirements.txt</code> or <code>poetry.lock</code>) and have a
        documented upgrade process before updating dependencies.</p>
      </NoteBlock>
    </article>
  )
}
