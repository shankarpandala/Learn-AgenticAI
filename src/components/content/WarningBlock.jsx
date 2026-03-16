/**
 * WarningBlock — red warning callout with header strip
 */
export default function WarningBlock({ title = 'Warning', children }) {
  return (
    <aside
      className="my-6 overflow-hidden rounded-xl border-2 border-red-400/50 bg-red-50/50 shadow-sm dark:border-red-500/40 dark:bg-red-950/20"
      role="alert"
    >
      {/* Header strip */}
      <div className="flex items-center gap-3 border-b border-red-400/30 bg-red-100/60 px-5 py-3 dark:border-red-500/30 dark:bg-red-900/30">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 dark:bg-red-600">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
          {title}
        </span>
      </div>
      {/* Body */}
      <div className="px-5 py-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm dark:[&_code]:bg-gray-800">
        {children}
      </div>
    </aside>
  )
}
