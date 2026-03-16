import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'

export default function FrameworkComparison() {
  const frameworks = [
    {
      name: 'LangChain',
      primaryUse: 'General-purpose LLM orchestration, chains, agents',
      strengths: 'Largest ecosystem, widest integrations (200+ LLMs, tools)',
      weaknesses: 'Abstraction overhead, rapid API changes, verbose for simple tasks',
      ragSupport: 'Yes (LCEL, vectorstores)',
      agentSupport: 'Yes (AgentExecutor, LangGraph)',
      multiAgent: 'Via LangGraph',
      maturity: 'High',
      license: 'MIT',
      pythonTs: 'Both',
    },
    {
      name: 'LlamaIndex',
      primaryUse: 'RAG, document indexing, knowledge retrieval',
      strengths: 'Best-in-class RAG primitives, index types, query engines',
      weaknesses: 'Less flexible for non-RAG workflows',
      ragSupport: 'Excellent (native focus)',
      agentSupport: 'Yes (ReActAgent, FunctionCalling)',
      multiAgent: 'Via Workflows',
      maturity: 'High',
      license: 'MIT',
      pythonTs: 'Both',
    },
    {
      name: 'CrewAI',
      primaryUse: 'Role-based multi-agent crews',
      strengths: 'Intuitive crew/agent/task model, built-in memory, easy setup',
      weaknesses: 'Less control over low-level agent behavior',
      ragSupport: 'Via tools',
      agentSupport: 'Yes (core focus)',
      multiAgent: 'Excellent (native)',
      maturity: 'Medium',
      license: 'MIT',
      pythonTs: 'Python',
    },
    {
      name: 'AutoGen',
      primaryUse: 'Conversational multi-agent systems, code generation',
      strengths: 'Strong code execution, nested chats, research-backed patterns',
      weaknesses: 'Version fragmentation, complex setup for production',
      ragSupport: 'Via custom agents',
      agentSupport: 'Yes (AssistantAgent)',
      multiAgent: 'Excellent (GroupChat)',
      maturity: 'Medium',
      license: 'CC BY 4.0 / MIT',
      pythonTs: 'Python (.NET beta)',
    },
    {
      name: 'Haystack',
      primaryUse: 'Production RAG pipelines, document QA',
      strengths: 'Type-safe pipelines, serialization, enterprise support (deepset)',
      weaknesses: 'Smaller community vs LangChain, more verbose component setup',
      ragSupport: 'Excellent (native focus)',
      agentSupport: 'Limited',
      multiAgent: 'No',
      maturity: 'High',
      license: 'Apache 2.0',
      pythonTs: 'Python',
    },
    {
      name: 'DSPy',
      primaryUse: 'Systematic prompt optimization, compiled LLM programs',
      strengths: 'Automatic prompt optimization, model-agnostic, research-backed',
      weaknesses: 'Requires labeled data, smaller ecosystem, steep learning curve',
      ragSupport: 'Via Retrieve module',
      agentSupport: 'Via ReAct module',
      multiAgent: 'No',
      maturity: 'Medium',
      license: 'MIT',
      pythonTs: 'Python',
    },
  ]

  return (
    <article className="prose-content">
      <h2>Framework Comparison</h2>
      <p>
        Choosing the right LLM framework depends heavily on your use case, team expertise,
        and production requirements. This comparison covers the six major frameworks across
        the dimensions that matter most for production applications.
      </p>

      <h2>Feature Matrix</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-3 text-left font-semibold">Framework</th>
              <th className="px-3 py-3 text-left font-semibold">Primary Use</th>
              <th className="px-3 py-3 text-left font-semibold">RAG</th>
              <th className="px-3 py-3 text-left font-semibold">Agents</th>
              <th className="px-3 py-3 text-left font-semibold">Multi-Agent</th>
              <th className="px-3 py-3 text-left font-semibold">Maturity</th>
              <th className="px-3 py-3 text-left font-semibold">License</th>
              <th className="px-3 py-3 text-left font-semibold">Languages</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {frameworks.map((f) => (
              <tr key={f.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-3 font-semibold text-gray-900 dark:text-gray-100">{f.name}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{f.primaryUse}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{f.ragSupport}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{f.agentSupport}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{f.multiAgent}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{f.maturity}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono">{f.license}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{f.pythonTs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Strengths and Weaknesses</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-3 text-left font-semibold">Framework</th>
              <th className="px-3 py-3 text-left font-semibold">Key Strengths</th>
              <th className="px-3 py-3 text-left font-semibold">Key Weaknesses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {frameworks.map((f) => (
              <tr key={f.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-3 font-semibold text-gray-900 dark:text-gray-100">{f.name}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{f.strengths}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-xs">{f.weaknesses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Community and Ecosystem (as of 2025)</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-3 py-3 text-left font-semibold">Framework</th>
              <th className="px-3 py-3 text-left font-semibold">GitHub Stars</th>
              <th className="px-3 py-3 text-left font-semibold">npm/PyPI Downloads</th>
              <th className="px-3 py-3 text-left font-semibold">Commercial Support</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['LangChain', '~95K', 'Very High', 'LangChain Inc. (LangSmith)'],
              ['LlamaIndex', '~40K', 'High', 'LlamaIndex Inc. (LlamaCloud)'],
              ['CrewAI', '~25K', 'Medium', 'CrewAI Inc.'],
              ['AutoGen', '~35K', 'Medium', 'Microsoft (open source)'],
              ['Haystack', '~20K', 'Medium', 'deepset (enterprise tier)'],
              ['DSPy', '~20K', 'Medium', 'Stanford / community'],
            ].map(([name, stars, downloads, support]) => (
              <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-3 font-semibold">{name}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{stars}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{downloads}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{support}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BestPracticeBlock title="Evaluate Frameworks Against Your Specific Use Case">
        <p>The "best" framework depends entirely on your use case. Run a proof-of-concept
        with your actual data and workload — not a toy example — before committing to a
        framework. Key metrics to evaluate: time-to-working-prototype, performance on your
        task (not benchmarks), debuggability when something goes wrong, and your team's
        ability to maintain it long-term.</p>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Frameworks Are Not Mutually Exclusive">
        <p>Many production systems combine frameworks. A common pattern: LangGraph for agent
        orchestration + LlamaIndex for retrieval + DSPy for optimized prompts. Each framework
        can be used for what it does best. See the "Mixing Frameworks" section for
        interoperability patterns and guidance on when this makes sense.</p>
      </NoteBlock>
    </article>
  )
}
