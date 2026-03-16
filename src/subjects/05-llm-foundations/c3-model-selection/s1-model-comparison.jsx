import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'

export default function ModelComparison() {
  return (
    <article className="prose-content">
      <h2>Model Comparison</h2>
      <p>
        The LLM landscape in 2025 offers many capable models across multiple providers. Choosing
        the right model for your agent requires understanding the trade-offs between capability,
        context size, latency, cost, and licensing. This page compares the leading models across
        these dimensions.
      </p>

      <ConceptBlock term="Model Frontier">
        <p>
          The set of publicly available models that define the current state of the art on
          reasoning benchmarks, coding tasks, and instruction following. The frontier advances
          rapidly — a model that was best-in-class six months ago may now be outperformed by
          newer releases. Always evaluate on your specific task distribution, not just benchmarks.
        </p>
      </ConceptBlock>

      <h2>Frontier Model Comparison (2025)</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold">Provider</th>
              <th className="px-4 py-3 text-left font-semibold">Context</th>
              <th className="px-4 py-3 text-left font-semibold">Strengths</th>
              <th className="px-4 py-3 text-left font-semibold">Weaknesses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Claude 3.7 Sonnet', 'Anthropic', '200K', 'Coding, reasoning, instruction following, safety', 'No native image generation'],
              ['Claude 3.5 Haiku', 'Anthropic', '200K', 'Speed, cost, structured tasks', 'Less capable on complex reasoning vs Sonnet'],
              ['GPT-4o', 'OpenAI', '128K', 'Multimodal (audio/vision), broad capability, ecosystem', 'Context window smaller than Claude/Gemini'],
              ['GPT-4o mini', 'OpenAI', '128K', 'Low cost, fast, good for structured tasks', 'Less capable than GPT-4o on hard reasoning'],
              ['o3 / o1', 'OpenAI', '200K', 'Math, competition coding, multi-step reasoning', 'Very slow (thinking tokens), expensive'],
              ['Gemini 1.5 Pro', 'Google', '1M', 'Massive context, multimodal, video understanding', 'Slower on structured JSON tasks'],
              ['Gemini 2.0 Flash', 'Google', '1M', 'Fast, multimodal, cost-effective at scale', 'Less consistent instruction following'],
              ['Llama 3.1 405B', 'Meta (self-host)', '128K', 'Open weights, no data-sharing, customisable', 'Requires significant infrastructure, slower than cloud'],
              ['Mistral Large', 'Mistral', '128K', 'European data residency, strong code and reasoning', 'Smaller ecosystem than OpenAI/Anthropic'],
            ].map(([model, provider, ctx, strengths, weaknesses]) => (
              <tr key={model}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{model}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{provider}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{ctx}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{strengths}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{weaknesses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Capability Breakdown by Task Type</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Task</th>
              <th className="px-4 py-3 text-left font-semibold">Top Choice</th>
              <th className="px-4 py-3 text-left font-semibold">Budget Choice</th>
              <th className="px-4 py-3 text-left font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Code generation', 'Claude 3.7 Sonnet', 'Claude 3.5 Haiku', 'Claude trained on large code corpus; strong at multi-file edits'],
              ['Complex reasoning', 'o3 / Claude 3.7', 'GPT-4o', 'o3 uses chain-of-thought compute scaling; best for math/competition'],
              ['Long document QA', 'Gemini 1.5 Pro', 'Claude 3.7 Sonnet', 'Gemini handles 1M tokens; Claude at 200K with better instruction following'],
              ['Structured output / tool use', 'Claude 3.7 Sonnet', 'GPT-4o mini', 'Claude most consistent at complex JSON schemas'],
              ['Multimodal (images)', 'GPT-4o / Gemini', 'GPT-4o mini', 'GPT-4o excels at image understanding and description'],
              ['High-volume production', 'Claude 3.5 Haiku', 'Gemini 2.0 Flash', 'Both optimised for throughput and low cost'],
              ['Private / on-premise', 'Llama 3.1 405B', 'Mistral Large', 'Open weights allow self-hosting; no data leaves your infra'],
            ].map(([task, top, budget, notes]) => (
              <tr key={task}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{task}</td>
                <td className="px-4 py-3 text-blue-600 dark:text-blue-400 text-xs">{top}</td>
                <td className="px-4 py-3 text-green-600 dark:text-green-400 text-xs">{budget}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Latency Characteristics</h2>
      <p>
        Latency has two components that matter differently depending on your use case:
        time-to-first-token (TTFT) and tokens-per-second (TPS). Chat interfaces care most about
        TTFT; batch processing cares most about TPS.
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold">TTFT (typical)</th>
              <th className="px-4 py-3 text-left font-semibold">Output Speed</th>
              <th className="px-4 py-3 text-left font-semibold">Best For</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Claude 3.5 Haiku', '<300ms', '~150 tok/s', 'Real-time chat, high-volume batch'],
              ['GPT-4o mini', '<300ms', '~120 tok/s', 'Real-time chat, structured output'],
              ['Gemini 2.0 Flash', '<400ms', '~130 tok/s', 'Multimodal real-time tasks'],
              ['Claude 3.7 Sonnet', '<600ms', '~80 tok/s', 'Quality-first agentic tasks'],
              ['GPT-4o', '<700ms', '~70 tok/s', 'Complex reasoning, multimodal'],
              ['o3', '10–60s', 'N/A (batch)', 'Hard reasoning where quality > speed'],
            ].map(([model, ttft, speed, useFor]) => (
              <tr key={model}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{model}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{ttft}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{speed}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{useFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Open-Weight Models</h2>
      <p>
        Open-weight models (Llama, Mistral, Qwen, Phi) allow self-hosting, fine-tuning, and
        deployment without per-token API costs. The trade-off is infrastructure investment and
        typically lower quality than frontier proprietary models.
      </p>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-left font-semibold">Params</th>
              <th className="px-4 py-3 text-left font-semibold">License</th>
              <th className="px-4 py-3 text-left font-semibold">Best Use Case</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['Llama 3.1 405B', '405B', 'Meta community', 'Highest quality open model; matches GPT-4 class'],
              ['Llama 3.1 70B', '70B', 'Meta community', 'Quality/compute sweet spot for self-hosting'],
              ['Mistral Large 2', '123B', 'Mistral Research', 'European data residency, strong code'],
              ['Qwen2.5 72B', '72B', 'Apache 2.0', 'Strong at coding and multilingual tasks'],
              ['Phi-3.5 Mini', '3.8B', 'MIT', 'Edge deployment, mobile, CPU inference'],
            ].map(([model, params, license, useCase]) => (
              <tr key={model}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{model}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{params}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{license}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{useCase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BestPracticeBlock title="Model Selection Guidelines">
        <ul>
          <li>Benchmark on your actual task distribution — cross-task benchmarks (MMLU, HumanEval) rarely predict performance on domain-specific work.</li>
          <li>Start with a powerful model to establish quality baselines, then downscale to find the minimum model that meets your threshold.</li>
          <li>Use different models for different subtasks: a fast/cheap model for classification routing, a powerful model for generation.</li>
          <li>Factor in ecosystem: tool support, SDKs, fine-tuning availability, and reliability SLAs matter for production.</li>
          <li>For regulated industries (healthcare, finance), check each provider's data processing agreements and residency options.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Evaluating Models on Your Task">
        <p>
          Build a 50–100 sample golden test set with known-good outputs for your specific task.
          Run each candidate model on this set and measure accuracy, format compliance, and
          latency. This takes a few hours but prevents costly production model swaps. Repeat
          this evaluation quarterly as new models are released.
        </p>
      </NoteBlock>
    </article>
  )
}
