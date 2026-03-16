/**
 * BestPracticeBlock — green-bordered best practice callout
 */
export default function BestPracticeBlock({ title = 'Best Practice', children }) {
  return (
    <aside className="my-6 rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 dark:border-emerald-800/50 dark:bg-emerald-950/25">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 dark:text-emerald-400" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        {title}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ul>li]:mb-1">
        {children}
      </div>
    </aside>
  )
}
