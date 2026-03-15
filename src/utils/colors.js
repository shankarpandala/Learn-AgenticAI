/**
 * Subject and difficulty color utilities for Learn-AgenticAI.
 * Maps subject IDs and difficulty levels to Tailwind CSS class fragments.
 */

export const SUBJECT_COLORS = {
  '01-rag-fundamentals':      { hex: '#06b6d4', name: 'cyan',    light: 'bg-cyan-50 dark:bg-cyan-950',    border: 'border-cyan-300 dark:border-cyan-700',    text: 'text-cyan-700 dark:text-cyan-300' },
  '02-advanced-rag':          { hex: '#3b82f6', name: 'blue',    light: 'bg-blue-50 dark:bg-blue-950',    border: 'border-blue-300 dark:border-blue-700',    text: 'text-blue-700 dark:text-blue-300' },
  '03-agent-foundations':     { hex: '#8b5cf6', name: 'violet',  light: 'bg-violet-50 dark:bg-violet-950', border: 'border-violet-300 dark:border-violet-700', text: 'text-violet-700 dark:text-violet-300' },
  '04-agentic-architectures': { hex: '#a855f7', name: 'purple',  light: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-300' },
  '05-llm-foundations':       { hex: '#6366f1', name: 'indigo',  light: 'bg-indigo-50 dark:bg-indigo-950', border: 'border-indigo-300 dark:border-indigo-700', text: 'text-indigo-700 dark:text-indigo-300' },
  '06-coding-agents':         { hex: '#10b981', name: 'emerald', light: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300' },
  '07-sdks-frameworks':       { hex: '#f59e0b', name: 'amber',   light: 'bg-amber-50 dark:bg-amber-950',  border: 'border-amber-300 dark:border-amber-700',  text: 'text-amber-700 dark:text-amber-300' },
  '08-enterprise-agentic':    { hex: '#ef4444', name: 'red',     light: 'bg-red-50 dark:bg-red-950',      border: 'border-red-300 dark:border-red-700',      text: 'text-red-700 dark:text-red-300' },
  '09-security-compliance':   { hex: '#f97316', name: 'orange',  light: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-300' },
  '10-evaluation-observability': { hex: '#14b8a6', name: 'teal', light: 'bg-teal-50 dark:bg-teal-950',    border: 'border-teal-300 dark:border-teal-700',    text: 'text-teal-700 dark:text-teal-300' },
  '11-vibe-engineering':      { hex: '#ec4899', name: 'pink',    light: 'bg-pink-50 dark:bg-pink-950',    border: 'border-pink-300 dark:border-pink-700',    text: 'text-pink-700 dark:text-pink-300' },
}

export const DIFFICULTY_COLORS = {
  beginner:     { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  intermediate: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  advanced:     { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  research:     { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
}

export function getSubjectColor(subjectId) {
  return SUBJECT_COLORS[subjectId] || { hex: '#6366f1', name: 'indigo', light: 'bg-indigo-50 dark:bg-indigo-950', border: 'border-indigo-300 dark:border-indigo-700', text: 'text-indigo-700 dark:text-indigo-300' }
}

export function getDifficultyColor(difficulty) {
  return DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.beginner
}
