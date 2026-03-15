/**
 * SecurityCallout — red/orange security warning specific to AI/Agentic systems
 */
export default function SecurityCallout({ title = 'Security Warning', severity = 'high', children }) {
  const severityConfig = {
    critical: {
      border: 'border-red-300 dark:border-red-700/60',
      bg: 'bg-red-50/80 dark:bg-red-950/40',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
      icon: 'text-red-500 dark:text-red-400',
      label: 'text-red-700 dark:text-red-300',
    },
    high: {
      border: 'border-orange-300 dark:border-orange-700/60',
      bg: 'bg-orange-50/80 dark:bg-orange-950/40',
      badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
      icon: 'text-orange-500 dark:text-orange-400',
      label: 'text-orange-700 dark:text-orange-300',
    },
    medium: {
      border: 'border-yellow-300 dark:border-yellow-700/60',
      bg: 'bg-yellow-50/80 dark:bg-yellow-950/40',
      badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
      icon: 'text-yellow-600 dark:text-yellow-400',
      label: 'text-yellow-700 dark:text-yellow-300',
    },
  }

  const s = severityConfig[severity] ?? severityConfig.high

  return (
    <aside
      className={`my-6 rounded-xl border ${s.border} ${s.bg} px-5 py-4`}
      role="alert"
      aria-live="polite"
    >
      <div className="mb-2 flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={s.icon} aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className={`text-sm font-semibold ${s.label}`}>{title}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}>
          {severity.toUpperCase()}
        </span>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ul>li]:mb-1">
        {children}
      </div>
    </aside>
  )
}
