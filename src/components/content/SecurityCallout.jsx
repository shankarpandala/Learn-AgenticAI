/**
 * SecurityCallout — security warning with severity header strip
 */
const SEVERITY = {
  critical: {
    border: 'border-red-400/50 dark:border-red-500/40',
    bg: 'bg-red-50/50 dark:bg-red-950/20',
    headerBg: 'bg-red-100/60 dark:bg-red-900/30',
    headerBorder: 'border-red-400/30 dark:border-red-500/30',
    badge: 'bg-red-500 dark:bg-red-600',
    labelColor: 'text-red-600 dark:text-red-400',
    chipBg: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  high: {
    border: 'border-orange-400/50 dark:border-orange-500/40',
    bg: 'bg-orange-50/50 dark:bg-orange-950/20',
    headerBg: 'bg-orange-100/60 dark:bg-orange-900/30',
    headerBorder: 'border-orange-400/30 dark:border-orange-500/30',
    badge: 'bg-orange-500 dark:bg-orange-600',
    labelColor: 'text-orange-600 dark:text-orange-400',
    chipBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  },
  medium: {
    border: 'border-yellow-400/50 dark:border-yellow-500/40',
    bg: 'bg-yellow-50/50 dark:bg-yellow-950/20',
    headerBg: 'bg-yellow-100/60 dark:bg-yellow-900/30',
    headerBorder: 'border-yellow-400/30 dark:border-yellow-500/30',
    badge: 'bg-yellow-500 dark:bg-yellow-600',
    labelColor: 'text-yellow-700 dark:text-yellow-400',
    chipBg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  },
}

export default function SecurityCallout({ title = 'Security Warning', severity = 'high', children }) {
  const s = SEVERITY[severity] ?? SEVERITY.high

  return (
    <aside
      className={`my-6 overflow-hidden rounded-xl border-2 shadow-sm ${s.border} ${s.bg}`}
      role="alert"
      aria-live="polite"
    >
      {/* Header strip */}
      <div className={`flex items-center gap-3 border-b px-5 py-3 ${s.headerBg} ${s.headerBorder}`}>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${s.badge}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wider ${s.labelColor}`}>
          {title}
        </span>
        <span className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.chipBg}`}>
          {severity.toUpperCase()}
        </span>
      </div>
      {/* Body */}
      <div className="px-5 py-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul>li]:leading-relaxed [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm dark:[&_code]:bg-gray-800">
        {children}
      </div>
    </aside>
  )
}
