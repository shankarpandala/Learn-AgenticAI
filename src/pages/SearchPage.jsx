import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CURRICULUM from '../subjects/index.js'

function buildSearchIndex() {
  const entries = []
  for (const subject of CURRICULUM) {
    entries.push({
      type: 'Subject',
      title: subject.title,
      description: subject.description ?? '',
      path: `/subjects/${subject.id}`,
      breadcrumb: 'Home',
      subjectId: subject.id,
      color: subject.colorHex,
      icon: subject.icon,
    })
    for (const chapter of subject.chapters ?? []) {
      entries.push({
        type: 'Chapter',
        title: chapter.title,
        description: chapter.description ?? '',
        path: `/subjects/${subject.id}/${chapter.id}`,
        breadcrumb: subject.title,
        subjectId: subject.id,
        color: subject.colorHex,
        icon: subject.icon,
      })
      for (const section of chapter.sections ?? []) {
        entries.push({
          type: 'Section',
          title: section.title,
          description: section.description ?? '',
          path: `/subjects/${subject.id}/${chapter.id}/${section.id}`,
          breadcrumb: `${subject.title} › ${chapter.title}`,
          subjectId: subject.id,
          color: subject.colorHex,
          icon: subject.icon,
        })
      }
    }
  }
  return entries
}

function scoreEntry(entry, query) {
  const q = query.toLowerCase()
  const title = entry.title.toLowerCase()
  const desc = entry.description.toLowerCase()
  let score = 0
  if (title === q) score += 100
  else if (title.startsWith(q)) score += 50
  else if (title.includes(q)) score += 25
  if (desc.includes(q)) score += 10
  return score
}

function highlightMatch(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

const TYPE_BADGE = {
  Subject: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Chapter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Section: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const index = useMemo(() => buildSearchIndex(), [])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    return index
      .map((entry) => ({ ...entry, score: scoreEntry(entry, q) }))
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [query, index])

  const trimmedQuery = query.trim()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Search</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Search across {index.length} subjects, chapters, and sections.
      </p>

      {/* Search input */}
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-input" className="sr-only">Search curriculum</label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, chapters, sections…"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cyan-500"
            aria-label="Search curriculum"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      <div className="mt-6" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          {!trimmedQuery ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center text-gray-400 dark:text-gray-600"
            >
              <svg className="mx-auto mb-4 text-gray-200 dark:text-gray-700" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p>Start typing to search the curriculum</p>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No results for "{trimmedQuery}"
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try a different term or{' '}
                <Link to="/" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                  browse all subjects
                </Link>.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="mb-4 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              <motion.ul
                className="space-y-2"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
              >
                {results.map((entry) => (
                  <motion.li
                    key={entry.path}
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}
                  >
                    <Link
                      to={entry.path}
                      className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition-all hover:border-cyan-300 hover:bg-cyan-50/30 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-cyan-700/50 dark:hover:bg-cyan-950/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                    >
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                        style={{ backgroundColor: `${entry.color}25` }}
                        aria-hidden="true"
                      >
                        {entry.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_BADGE[entry.type]}`}>
                            {entry.type}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 leading-snug group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          {highlightMatch(entry.title, trimmedQuery)}
                        </p>
                        {entry.description && (
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {highlightMatch(entry.description, trimmedQuery)}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                          {entry.breadcrumb}
                        </p>
                      </div>
                      <svg className="mt-1 shrink-0 text-gray-300 group-hover:text-cyan-400 dark:text-gray-700 dark:group-hover:text-cyan-600 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
