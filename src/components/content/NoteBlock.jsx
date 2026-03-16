const VARIANTS = {
  note: {
    border: 'border-blue-400/50 dark:border-blue-500/40',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    headerBg: 'bg-blue-100/60 dark:bg-blue-900/30',
    headerBorder: 'border-blue-400/30 dark:border-blue-500/30',
    badge: 'bg-blue-500 dark:bg-blue-600',
    iconColor: 'text-blue-500 dark:text-blue-400',
    labelColor: 'text-blue-600 dark:text-blue-400',
    letter: 'N',
    label: 'Note',
  },
  tip: {
    border: 'border-emerald-400/50 dark:border-emerald-500/40',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    headerBg: 'bg-emerald-100/60 dark:bg-emerald-900/30',
    headerBorder: 'border-emerald-400/30 dark:border-emerald-500/30',
    badge: 'bg-emerald-500 dark:bg-emerald-600',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    labelColor: 'text-emerald-600 dark:text-emerald-400',
    letter: 'T',
    label: 'Tip',
  },
  intuition: {
    border: 'border-violet-400/50 dark:border-violet-500/40',
    bg: 'bg-violet-50/50 dark:bg-violet-950/20',
    headerBg: 'bg-violet-100/60 dark:bg-violet-900/30',
    headerBorder: 'border-violet-400/30 dark:border-violet-500/30',
    badge: 'bg-violet-500 dark:bg-violet-600',
    iconColor: 'text-violet-500 dark:text-violet-400',
    labelColor: 'text-violet-600 dark:text-violet-400',
    letter: 'I',
    label: 'Intuition',
  },
  historical: {
    border: 'border-amber-400/50 dark:border-amber-500/40',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    headerBg: 'bg-amber-100/60 dark:bg-amber-900/30',
    headerBorder: 'border-amber-400/30 dark:border-amber-500/30',
    badge: 'bg-amber-500 dark:bg-amber-600',
    iconColor: 'text-amber-500 dark:text-amber-400',
    labelColor: 'text-amber-600 dark:text-amber-400',
    letter: 'H',
    label: 'Context',
  },
}

export default function NoteBlock({ type = 'note', title, children }) {
  const v = VARIANTS[type] ?? VARIANTS.note
  const displayTitle = title ?? v.label

  return (
    <aside
      className={`my-6 overflow-hidden rounded-xl border-2 shadow-sm ${v.border} ${v.bg}`}
      role="note"
    >
      {/* Header strip */}
      <div className={`flex items-center gap-3 border-b px-5 py-3 ${v.headerBg} ${v.headerBorder}`}>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${v.badge}`}>
          {v.letter}
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wider ${v.labelColor}`}>
          {displayTitle}
        </span>
      </div>
      {/* Body */}
      <div className="px-5 py-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 [&>p]:mb-2 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm dark:[&_code]:bg-gray-800">
        {children}
      </div>
    </aside>
  )
}
