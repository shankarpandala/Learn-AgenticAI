/**
 * ConceptBlock — formal AI concept definition
 * Matches math4ai DefinitionBlock visual style
 */
export default function ConceptBlock({ term, children, tag }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border-2 border-cyan-400/50 bg-cyan-50/50 shadow-sm dark:border-cyan-500/40 dark:bg-cyan-950/20">
      {/* Header strip */}
      <div className="flex items-center gap-3 border-b border-cyan-400/30 bg-cyan-100/60 px-5 py-3 dark:border-cyan-500/30 dark:bg-cyan-900/30">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white dark:bg-cyan-600">
          C
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
          Concept
        </span>
        {term && (
          <>
            <span className="text-cyan-400 dark:text-cyan-600">·</span>
            <span className="text-sm font-semibold text-cyan-800 dark:text-cyan-200 truncate">
              {term}
            </span>
          </>
        )}
        {tag && (
          <span className="ml-auto shrink-0 rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300">
            {tag}
          </span>
        )}
      </div>
      {/* Body */}
      <div className="px-5 py-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 [&>p]:mb-2 [&>p:last-child]:mb-0 [&_code]:rounded [&_code]:bg-cyan-100/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-cyan-700 dark:[&_code]:bg-cyan-900/30 dark:[&_code]:text-cyan-300">
        {children}
      </div>
    </div>
  )
}
