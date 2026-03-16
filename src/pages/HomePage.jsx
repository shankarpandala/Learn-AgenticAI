import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import CURRICULUM, { getSubjectSectionCount } from '../subjects/index.js'
import SubjectCard from '../components/navigation/SubjectCard.jsx'
import useProgress from '../hooks/useProgress.js'

const AI_SYMBOLS = ['⚡', '🤖', '🧠', '🔍', '🛠️', '🔒', '📊', '🏗️']

const FLOATING_POSITIONS = [
  { top: '12%', left: '8%', size: '3rem', delay: 0 },
  { top: '25%', right: '10%', size: '2.5rem', delay: 0.4 },
  { top: '60%', left: '5%', size: '2rem', delay: 0.8 },
  { bottom: '20%', right: '8%', size: '3.5rem', delay: 0.2 },
  { top: '45%', right: '20%', size: '2rem', delay: 1.1 },
  { top: '15%', left: '40%', size: '1.5rem', delay: 0.6 },
  { bottom: '30%', left: '18%', size: '2.5rem', delay: 0.9 },
  { top: '70%', right: '30%', size: '1.8rem', delay: 0.3 },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const LEARNING_PATH = [
  {
    step: 1,
    title: 'RAG & Retrieval',
    subjects: ['RAG Pipeline Fundamentals', 'Advanced RAG Architectures', 'Evaluation & Observability'],
    color: '#06b6d4',
    icon: '🔍',
  },
  {
    step: 2,
    title: 'Agents & LLMs',
    subjects: ['AI Agent Foundations', 'Agentic AI Architectures', 'LLM Foundations for Agents'],
    color: '#8b5cf6',
    icon: '🤖',
  },
  {
    step: 3,
    title: 'Tools & SDKs',
    subjects: ['AI Coding Agents', 'SDKs & Frameworks', 'Enterprise Agentic AI'],
    color: '#10b981',
    icon: '🛠️',
  },
  {
    step: 4,
    title: 'Production & Engineering',
    subjects: ['Security & Compliance', 'Evaluation & Observability', 'Vibe Engineering'],
    color: '#ec4899',
    icon: '⚡',
  },
]

export default function HomePage() {
  const { isComplete, getProgress } = useProgress()

  const totalSections = CURRICULUM.reduce(
    (sum, subject) =>
      sum +
      (subject.chapters?.reduce((cs, ch) => cs + (ch.sections?.length ?? 0), 0) ?? 0),
    0
  )
  const totalHours = CURRICULUM.reduce((sum, s) => sum + (s.estimatedHours ?? 0), 0)

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-cyan-50/30 px-6 py-20 md:py-28 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/20">
        {/* Floating symbols */}
        {AI_SYMBOLS.map((symbol, idx) => {
          const pos = FLOATING_POSITIONS[idx] || {}
          return (
            <motion.span
              key={idx}
              className="pointer-events-none absolute select-none text-cyan-200/50 dark:text-cyan-400/10"
              style={{ ...pos, fontSize: pos.size }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -12, 0] }}
              transition={{
                opacity: { delay: pos.delay, duration: 0.6 },
                y: { delay: pos.delay, duration: 4 + idx * 0.5, repeat: Infinity, ease: 'easeInOut' },
              }}
              aria-hidden="true"
            >
              {symbol}
            </motion.span>
          )
        })}

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
              Learn{' '}
              <span className="bg-gradient-to-r from-cyan-500 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                Agentic AI
              </span>
              <br />
              <span className="text-3xl sm:text-4xl md:text-5xl">
                Enterprise{' '}
                <span className="bg-gradient-to-r from-cyan-500 to-violet-600 bg-clip-text text-transparent">
                  Architecture
                </span>
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            A comprehensive interactive curriculum covering everything from RAG fundamentals to Vibe
            Engineering — your path to becoming an{' '}
            <strong className="font-semibold text-gray-800 dark:text-gray-200">
              Enterprise Agentic AI Architect
            </strong>{' '}
            capable of designing and building production AI solutions.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/subjects/01-rag-fundamentals"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:opacity-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              Start Learning →
            </Link>
            <Link
              to="/progress"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-cyan-300 hover:bg-cyan-50/40 transition-all dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              View Progress
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/40">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: 'Subjects', value: CURRICULUM.length },
              { label: 'Sections', value: `${totalSections}+` },
              { label: 'Hours', value: `~${totalHours}h` },
              { label: 'Difficulty Levels', value: '3' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</dt>
                <dd className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Learning Path ── */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Your Learning Path
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Four phases from fundamentals to enterprise production
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEARNING_PATH.map((phase, idx) => (
            <motion.div
              key={phase.step}
              className="relative rounded-xl border bg-white p-5 dark:bg-gray-900"
              style={{ borderColor: `${phase.color}40` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: `${phase.color}20` }}
              >
                {phase.icon}
              </div>
              <div
                className="mb-1 text-xs font-bold uppercase tracking-widest"
                style={{ color: phase.color }}
              >
                Phase {phase.step}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{phase.title}</h3>
              <ul className="space-y-1">
                {phase.subjects.map((s) => (
                  <li key={s} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: phase.color }} aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Subject Grid ── */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            All Subjects
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {CURRICULUM.length} subjects · complete curriculum
          </p>
        </div>
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {CURRICULUM.map((subject) => {
            const total = getSubjectSectionCount(subject.id)
            const progress = getProgress(subject.id)
            const completed = Math.round((progress / 100) * total)
            return (
              <motion.div key={subject.id} variants={cardVariants}>
                <SubjectCard
                  subject={subject}
                  completedCount={completed}
                  totalCount={total}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </section>
    </div>
  )
}
