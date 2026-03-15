/**
 * PatternBlock — AI design pattern with context
 * Analogous to TheoremBlock in math4ai
 */
export default function PatternBlock({ name, category, children, whenToUse }) {
  return (
    <div className="my-6 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-purple-50/40 px-5 py-4 dark:border-violet-800/50 dark:from-violet-950/30 dark:to-purple-950/20">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500 dark:text-violet-400 shrink-0 mt-0.5" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Pattern
          </span>
        </div>
        {category && (
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {category}
          </span>
        )}
      </div>
      {name && (
        <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-gray-100">
          {name}
        </h3>
      )}
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
      {whenToUse && (
        <div className="mt-3 border-t border-violet-200/60 pt-3 dark:border-violet-800/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-1">
            When to use
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{whenToUse}</p>
        </div>
      )}
    </div>
  )
}
