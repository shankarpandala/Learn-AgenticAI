import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCurriculumById, getChapterById } from '../subjects/index.js'
import DifficultyBadge from '../components/navigation/DifficultyBadge.jsx'
import useProgress from '../hooks/useProgress.js'

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function CheckCircleIcon({ filled }) {
  return filled ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 dark:text-emerald-400 shrink-0" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

export default function ChapterPage() {
  const { subjectId, chapterId } = useParams()
  const { isComplete } = useProgress()

  const subject = getCurriculumById(subjectId)
  const chapter = getChapterById(subjectId, chapterId)

  if (!subject || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
        <span className="text-6xl select-none">🤖</span>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Chapter Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Could not find chapter <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">{chapterId}</code>.
        </p>
        <Link
          to={subject ? `/subjects/${subjectId}` : '/'}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          ← {subject ? `Back to ${subject.title}` : 'Back to Home'}
        </Link>
      </div>
    )
  }

  const sections = chapter.sections || []
  const completedCount = sections.filter((s) => isComplete(subjectId, chapterId, s.id)).length

  const chapterIndex = (subject.chapters?.findIndex((c) => c.id === chapterId) ?? 0) + 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded">
          Home
        </Link>
        <span className="text-gray-400 dark:text-gray-600">›</span>
        <Link to={`/subjects/${subjectId}`} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded truncate max-w-[160px]">
          {subject.title}
        </Link>
        <span className="text-gray-400 dark:text-gray-600">›</span>
        <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">
          {chapter.title}
        </span>
      </nav>

      {/* Chapter Header */}
      <motion.header
        className="mb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-gray-200 px-6 py-6 dark:border-gray-800"
          style={{ background: `linear-gradient(135deg, ${subject.colorHex}12 0%, transparent 60%)` }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: subject.colorHex }}
              aria-hidden="true"
            >
              {chapterIndex}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: subject.colorHex }}>
                {subject.title}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-snug">
                {chapter.title}
              </h1>
              {chapter.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {chapter.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {chapter.difficulty && <DifficultyBadge level={chapter.difficulty} />}
                <span className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{sections.length}</span>{' '}
                  {sections.length === 1 ? 'section' : 'sections'}
                </span>
                {completedCount > 0 && (
                  <span className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{completedCount}</span> completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Section List */}
      <section>
        <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
          Sections
        </h2>
        <motion.ol
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          aria-label="Chapter sections"
        >
          {sections.map((section, idx) => {
            const done = isComplete(subjectId, chapterId, section.id)
            return (
              <motion.li
                key={section.id}
                variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { duration: 0.25 } } }}
              >
                <Link
                  to={`/subjects/${subjectId}/${chapterId}/${section.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition-all hover:border-cyan-300 hover:bg-cyan-50/40 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-cyan-700/50 dark:hover:bg-cyan-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-cyan-100 group-hover:text-cyan-700 dark:group-hover:bg-cyan-900/30 dark:group-hover:text-cyan-400 transition-colors tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200 leading-snug group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                      {section.title}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {section.readingMinutes && (
                      <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <ClockIcon />
                        {section.readingMinutes} min
                      </span>
                    )}
                    {section.difficulty && (
                      <span className="hidden sm:block">
                        <DifficultyBadge level={section.difficulty} size="sm" />
                      </span>
                    )}
                    <CheckCircleIcon filled={done} />
                  </div>
                </Link>
              </motion.li>
            )
          })}
        </motion.ol>
      </section>

      {/* Back link */}
      <div className="mt-10">
        <Link
          to={`/subjects/${subjectId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
        >
          ← Back to {subject.title}
        </Link>
      </div>
    </div>
  )
}
