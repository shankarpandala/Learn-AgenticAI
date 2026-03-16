/**
 * BestPracticeBlock — emerald best practice callout with header strip
 */
export default function BestPracticeBlock({ title = 'Best Practices', children }) {
  return (
    <aside className="my-6 overflow-hidden rounded-xl border-2 border-emerald-400/50 bg-emerald-50/50 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-950/20">
      {/* Header strip */}
      <div className="flex items-center gap-3 border-b border-emerald-400/30 bg-emerald-100/60 px-5 py-3 dark:border-emerald-500/30 dark:bg-emerald-900/30">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 dark:bg-emerald-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {title}
        </span>
      </div>
      {/* Body */}
      <div className="px-5 py-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul>li]:leading-relaxed [&_code]:rounded [&_code]:bg-emerald-100/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-emerald-700 dark:[&_code]:bg-emerald-900/30 dark:[&_code]:text-emerald-300 [&_strong]:font-semibold">
        {children}
      </div>
    </aside>
  )
}
