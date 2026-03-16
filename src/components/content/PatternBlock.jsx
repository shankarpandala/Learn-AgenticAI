/**
 * PatternBlock — AI design pattern with context
 * Matches math4ai TheoremBlock visual style
 */
export default function PatternBlock({ name, category, children, whenToUse }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border-2 border-violet-400/50 bg-violet-50/50 shadow-sm dark:border-violet-500/40 dark:bg-violet-950/20">
      {/* Header strip */}
      <div className="flex items-center gap-3 border-b border-violet-400/30 bg-violet-100/60 px-5 py-3 dark:border-violet-500/30 dark:bg-violet-900/30">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white dark:bg-violet-600">
          P
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
          Pattern
        </span>
        {name && (
          <>
            <span className="text-violet-400 dark:text-violet-600">·</span>
            <span className="text-sm font-semibold text-violet-800 dark:text-violet-200 truncate">
              {name}
            </span>
          </>
        )}
        {category && (
          <span className="ml-auto shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
            {category}
          </span>
        )}
      </div>
      {/* Body */}
      <div className="px-5 py-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 [&>p]:mb-2 [&>p:last-child]:mb-0 [&_code]:rounded [&_code]:bg-violet-100/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-violet-700 dark:[&_code]:bg-violet-900/30 dark:[&_code]:text-violet-300">
        {children}
      </div>
      {whenToUse && (
        <div className="border-t border-violet-400/20 bg-violet-50/40 px-5 py-3 dark:border-violet-500/20 dark:bg-violet-900/15">
          <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            When to use:
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{whenToUse}</span>
        </div>
      )}
    </div>
  )
}
