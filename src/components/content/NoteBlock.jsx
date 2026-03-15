const VARIANTS = {
  note: {
    border: 'border-blue-200 dark:border-blue-800/50',
    bg: 'bg-blue-50/60 dark:bg-blue-950/30',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    iconColor: 'text-blue-500 dark:text-blue-400',
    labelColor: 'text-blue-700 dark:text-blue-300',
    label: 'Note',
  },
  tip: {
    border: 'border-emerald-200 dark:border-emerald-800/50',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
        <line x1="9" y1="21" x2="15" y2="21" />
        <line x1="10" y1="17" x2="14" y2="17" />
      </svg>
    ),
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    labelColor: 'text-emerald-700 dark:text-emerald-300',
    label: 'Tip',
  },
  intuition: {
    border: 'border-violet-200 dark:border-violet-800/50',
    bg: 'bg-violet-50/60 dark:bg-violet-950/30',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    iconColor: 'text-violet-500 dark:text-violet-400',
    labelColor: 'text-violet-700 dark:text-violet-300',
    label: 'Intuition',
  },
  historical: {
    border: 'border-amber-200 dark:border-amber-800/50',
    bg: 'bg-amber-50/60 dark:bg-amber-950/30',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    iconColor: 'text-amber-500 dark:text-amber-400',
    labelColor: 'text-amber-700 dark:text-amber-300',
    label: 'Context',
  },
}

export default function NoteBlock({ type = 'note', title, children }) {
  const v = VARIANTS[type] ?? VARIANTS.note
  const displayTitle = title ?? v.label

  return (
    <aside
      className={`my-6 rounded-xl border ${v.border} ${v.bg} px-5 py-4`}
      role="note"
    >
      <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${v.iconColor}`}>
        {v.icon}
        <span className={v.labelColor}>{displayTitle}</span>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  )
}
