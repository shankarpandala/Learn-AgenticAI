import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import CURRICULUM, { getSubjectSectionCount } from '../subjects/index.js'
import ProgressBar from '../components/navigation/ProgressBar.jsx'
import useProgress from '../hooks/useProgress.js'
import useAppStore from '../store/appStore.js'

export default function ProgressPage() {
  const { completedSections, isComplete, getProgress } = useProgress()
  const bookmarks = useAppStore((s) => s.bookmarks)
  const removeBookmark = useAppStore((s) => s.bookmarkSection)

  const totalSections = CURRICULUM.reduce(
    (sum, subject) =>
      sum +
      (subject.chapters?.reduce((cs, ch) => cs + (ch.sections?.length ?? 0), 0) ?? 0),
    0
  )
  const overallPercent = totalSections > 0
    ? Math.round((completedSections.length / totalSections) * 100)
    : 0

  // Compute per-subject stats
  const subjectStats = CURRICULUM.map((subject) => {
    const total = getSubjectSectionCount(subject.id)
    const progress = getProgress(subject.id)
    const completed = Math.round((progress / 100) * total)
    return { subject, total, completed, progress }
  })

  const subjectsStarted = subjectStats.filter((s) => s.completed > 0).length

  // Recent completions (last 10)
  const recent = completedSections.slice(-10).reverse()

  function resolveCompletion(key) {
    const [subjectId, chapterId, sectionId] = key.split('::')
    const subject = CURRICULUM.find((s) => s.id === subjectId)
    const chapter = subject?.chapters?.find((c) => c.id === chapterId)
    const section = chapter?.sections?.find((s) => s.id === sectionId)
    if (!subject || !chapter || !section) return null
    return { subject, chapter, section, href: `/subjects/${subjectId}/${chapterId}/${sectionId}` }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          My Progress
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Track your journey to becoming an Enterprise Agentic AI Architect.
        </p>

        {completedSections.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/40 px-8 py-16 text-center dark:border-cyan-800/40 dark:bg-cyan-950/10">
            <div className="text-5xl mb-4 select-none" aria-hidden="true">🚀</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Start Your Journey
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              You haven't completed any sections yet. Begin with RAG fundamentals and work your way
              to enterprise Agentic AI architecture.
            </p>
            <Link
              to="/subjects/01-rag-fundamentals"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              Start Learning →
            </Link>
          </div>
        ) : (
          <>
            {/* Overall progress */}
            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900/40">
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Overall Completion
                </h2>
                <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {overallPercent}%
                </span>
              </div>
              <ProgressBar value={overallPercent} color="#06b6d4" showPercent={false} size="lg" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {completedSections.length} of {totalSections} sections completed
              </p>
            </section>

            {/* Stats grid */}
            <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Subjects Started', value: subjectsStarted, icon: '📚' },
                { label: 'Sections Done', value: completedSections.length, icon: '✅' },
                { label: 'Total Sections', value: totalSections, icon: '📖' },
                { label: 'Bookmarks', value: bookmarks.length, icon: '🔖' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900/40">
                  <div className="text-2xl mb-1 select-none" aria-hidden="true">{icon}</div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </section>

            {/* Per-subject progress */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Progress by Subject
              </h2>
              <div className="space-y-3">
                {subjectStats.map(({ subject, total, completed, progress }) => (
                  <Link
                    key={subject.id}
                    to={`/subjects/${subject.id}`}
                    className="block rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-cyan-300 hover:bg-cyan-50/30 transition-colors dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-cyan-700/50 dark:hover:bg-cyan-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl select-none" aria-hidden="true">{subject.icon}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 leading-snug">
                        {subject.title}
                      </span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: subject.colorHex }}>
                        {progress}%
                      </span>
                    </div>
                    <ProgressBar
                      value={progress}
                      color={subject.colorHex}
                      showPercent={false}
                      size="sm"
                    />
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                      {completed} / {total} sections
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Recent completions */}
            {recent.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Recently Completed
                </h2>
                <div className="space-y-2">
                  {recent.map((key) => {
                    const resolved = resolveCompletion(key)
                    if (!resolved) return null
                    return (
                      <Link
                        key={key}
                        to={resolved.href}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-cyan-300 transition-colors dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-cyan-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                          style={{ backgroundColor: resolved.subject.colorHex }}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200 leading-snug truncate">
                            {resolved.section.title}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {resolved.subject.title} › {resolved.chapter.title}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Bookmarks */}
            {bookmarks.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Bookmarks
                </h2>
                <div className="space-y-2">
                  {bookmarks.map((key) => {
                    const resolved = resolveCompletion(key)
                    if (!resolved) return null
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900/40"
                      >
                        <span className="text-base" aria-hidden="true">🔖</span>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={resolved.href}
                            className="font-medium text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors leading-snug truncate block"
                          >
                            {resolved.section.title}
                          </Link>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {resolved.subject.title} › {resolved.chapter.title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBookmark(key)}
                          className="text-xs text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
                          aria-label={`Remove bookmark for ${resolved.section.title}`}
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
