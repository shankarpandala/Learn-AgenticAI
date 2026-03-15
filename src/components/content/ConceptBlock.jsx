/**
 * ConceptBlock — formal AI concept definition
 * Analogous to DefinitionBlock in math4ai
 */
export default function ConceptBlock({ term, children, tag }) {
  return (
    <div className="my-6 rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50/80 to-blue-50/40 px-5 py-4 dark:border-cyan-800/50 dark:from-cyan-950/30 dark:to-blue-950/20">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500 dark:text-cyan-400 shrink-0 mt-0.5" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            Concept
          </span>
        </div>
        {tag && (
          <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
            {tag}
          </span>
        )}
      </div>
      {term && (
        <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-gray-100">
          {term}
        </h3>
      )}
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}
