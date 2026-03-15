/**
 * FlowDiagram — simple step-by-step horizontal/vertical flow visualization
 * Useful for showing pipeline stages, agent loops, and process flows
 */
export default function FlowDiagram({ steps = [], direction = 'horizontal', title }) {
  const isHorizontal = direction === 'horizontal'

  const stepColors = [
    { bg: 'bg-cyan-50 dark:bg-cyan-950/40', border: 'border-cyan-200 dark:border-cyan-800/50', text: 'text-cyan-700 dark:text-cyan-300', num: 'bg-cyan-500' },
    { bg: 'bg-violet-50 dark:bg-violet-950/40', border: 'border-violet-200 dark:border-violet-800/50', text: 'text-violet-700 dark:text-violet-300', num: 'bg-violet-500' },
    { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800/50', text: 'text-emerald-700 dark:text-emerald-300', num: 'bg-emerald-500' },
    { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-700 dark:text-amber-300', num: 'bg-amber-500' },
    { bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200 dark:border-blue-800/50', text: 'text-blue-700 dark:text-blue-300', num: 'bg-blue-500' },
    { bg: 'bg-pink-50 dark:bg-pink-950/40', border: 'border-pink-200 dark:border-pink-800/50', text: 'text-pink-700 dark:text-pink-300', num: 'bg-pink-500' },
  ]

  return (
    <figure className="my-6 rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700/60 dark:bg-gray-900/30">
      {title && (
        <figcaption className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </figcaption>
      )}
      <div className={`flex ${isHorizontal ? 'flex-row flex-wrap' : 'flex-col'} items-start gap-2`}>
        {steps.map((step, i) => {
          const colors = stepColors[i % stepColors.length]
          const isLast = i === steps.length - 1
          return (
            <div key={i} className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center gap-2`}>
              <div className={`rounded-lg border ${colors.border} ${colors.bg} px-3.5 py-2.5 min-w-[100px]`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${colors.num} text-[10px] font-bold text-white`}>
                    {i + 1}
                  </span>
                  <span className={`text-xs font-semibold ${colors.text}`}>{step.label}</span>
                </div>
                {step.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-1">
                    {step.description}
                  </p>
                )}
              </div>
              {!isLast && (
                <span className={`text-gray-400 dark:text-gray-600 ${isHorizontal ? 'rotate-0' : 'rotate-90'} text-base select-none`} aria-hidden="true">
                  →
                </span>
              )}
            </div>
          )
        })}
      </div>
    </figure>
  )
}
