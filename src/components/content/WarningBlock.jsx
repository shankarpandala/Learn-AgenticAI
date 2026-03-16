export default function WarningBlock({ title = 'Warning', children }) {
  return (
    <aside
      className="my-6 rounded-xl border border-red-200 bg-red-50/60 px-5 py-4 dark:border-red-800/50 dark:bg-red-950/30"
      role="alert"
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-red-700 dark:text-red-300">{title}</span>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  )
}
