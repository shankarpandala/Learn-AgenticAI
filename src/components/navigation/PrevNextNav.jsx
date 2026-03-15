import { Link } from 'react-router-dom'

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function PrevNextNav({ prev = null, next = null }) {
  if (!prev && !next) return null

  const buildHref = (item) =>
    `/subjects/${item.subjectId}/${item.chapterId}/${item.sectionId}`

  return (
    <nav
      className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-gray-200 pt-8 dark:border-gray-800"
      aria-label="Section navigation"
    >
      {/* Previous */}
      <div>
        {prev ? (
          <Link
            to={buildHref(prev)}
            className="group flex flex-col gap-1 rounded-xl border border-gray-200 px-5 py-4 text-left transition-all hover:border-cyan-300 hover:bg-cyan-50/50 dark:border-gray-800 dark:hover:border-cyan-700/50 dark:hover:bg-cyan-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            rel="prev"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
              <ArrowLeftIcon />
              Previous
            </span>
            {prev.crossesSubject && (
              <span className="text-xs text-cyan-500 dark:text-cyan-400 font-medium">
                {prev.subjectTitle}
              </span>
            )}
            <span className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Next */}
      <div className="sm:text-right">
        {next ? (
          <Link
            to={buildHref(next)}
            className={`group flex flex-col gap-1 rounded-xl border px-5 py-4 text-right transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
              next.crossesSubject
                ? 'border-cyan-200 bg-cyan-50/30 hover:border-cyan-400 hover:bg-cyan-50 dark:border-cyan-800/50 dark:bg-cyan-950/20 dark:hover:border-cyan-600/60 dark:hover:bg-cyan-900/20'
                : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50 dark:border-gray-800 dark:hover:border-cyan-700/50 dark:hover:bg-cyan-900/10'
            }`}
            rel="next"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
              {next.crossesSubject ? 'Continue to Next Subject' : 'Next'}
              <ArrowRightIcon />
            </span>
            {next.crossesSubject && (
              <span className="text-xs text-cyan-500 dark:text-cyan-400 font-medium">
                {next.subjectTitle}
              </span>
            )}
            <span className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
              {next.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  )
}
