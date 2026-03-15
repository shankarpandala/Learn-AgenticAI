import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCurriculumById, getSubjectSectionCount } from '../subjects/index.js'
import DifficultyBadge from '../components/navigation/DifficultyBadge.jsx'
import ProgressBar from '../components/navigation/ProgressBar.jsx'
import ChapterCard from '../components/navigation/ChapterCard.jsx'
import useProgress from '../hooks/useProgress.js'

export default function SubjectPage() {
  const { subjectId } = useParams()
  const subject = getCurriculumById(subjectId)
  const { getProgress } = useProgress()

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
        <span className="text-6xl select-none">🤖</span>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Subject Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          The subject <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">{subjectId}</code> does not exist in the curriculum.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          ← Back to Home
        </Link>
      </div>
    )
  }

  const totalSections = getSubjectSectionCount(subjectId)
  const progress = getProgress(subjectId)
  const chapters = subject.chapters || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <Link
          to="/"
          className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
        >
          Home
        </Link>
        <span className="text-gray-400 dark:text-gray-600">›</span>
        <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
          {subject.title}
        </span>
      </nav>

      {/* Subject Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-10"
      >
        {/* Icon + title row */}
        <div className="flex items-start gap-4 mb-4">
          {subject.icon && (
            <span
              className="flex-shrink-0 text-4xl sm:text-5xl leading-none select-none"
              aria-hidden="true"
            >
              {subject.icon}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              {subject.title}
            </h1>
            {subject.tagline && (
              <p className="mt-1 text-base text-cyan-600 dark:text-cyan-400 font-medium">
                {subject.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {subject.description && (
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-5">
            {subject.description}
          </p>
        )}

        {/* Meta row: difficulty + estimated hours */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {subject.difficulty && (
            <DifficultyBadge level={subject.difficulty} />
          )}
          {subject.estimatedHours != null && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-700/50 dark:bg-cyan-900/20 dark:text-cyan-300">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {subject.estimatedHours}h estimated
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'} · {totalSections} {totalSections === 1 ? 'section' : 'sections'}
          </span>
        </div>

        {/* Prerequisites */}
        {subject.prerequisites && subject.prerequisites.length > 0 && (
          <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3 dark:border-violet-700/40 dark:bg-violet-900/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2">
              Prerequisites
            </p>
            <ul className="flex flex-wrap gap-2">
              {subject.prerequisites.map((prereqId) => {
                const prereq = getCurriculumById(prereqId)
                return (
                  <li key={prereqId}>
                    <Link
                      to={`/subjects/${prereqId}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-medium text-violet-700 hover:border-violet-500 hover:bg-violet-50 transition-colors dark:border-violet-600/50 dark:bg-transparent dark:text-violet-300 dark:hover:border-violet-400 dark:hover:bg-violet-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    >
                      {prereq?.icon && (
                        <span className="text-sm" aria-hidden="true">{prereq.icon}</span>
                      )}
                      {prereq?.title || prereqId}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Overall Progress */}
        <div className="rounded-xl border border-gray-200 bg-white/60 px-5 py-4 dark:border-gray-700/50 dark:bg-gray-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Your Progress
            </span>
            <span className="text-sm font-bold tabular-nums text-cyan-600 dark:text-cyan-400">
              {progress}%
            </span>
          </div>
          <ProgressBar
            value={progress}
            color="rgb(6 182 212)"
            showPercent={false}
            size="md"
          />
          {progress === 100 && (
            <p className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
              Subject complete!
            </p>
          )}
        </div>
      </motion.header>

      {/* Chapter Grid */}
      {chapters.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <p className="text-lg">No chapters available yet.</p>
        </div>
      ) : (
        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            Chapters
          </h2>
          <motion.div
            className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {chapters.map((chapter, idx) => (
              <motion.div
                key={chapter.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <ChapterCard
                  chapter={chapter}
                  subjectId={subjectId}
                  chapterIndex={idx}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  )
}
