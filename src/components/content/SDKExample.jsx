import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import useAppStore from '../../store/appStore.js'

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const TAB_META = {
  python:     { label: 'Python',     lang: 'python' },
  typescript: { label: 'TypeScript', lang: 'typescript' },
  javascript: { label: 'JavaScript', lang: 'javascript' },
  yaml:       { label: 'YAML',       lang: 'yaml' },
  json:       { label: 'JSON',       lang: 'json' },
  bash:       { label: 'Bash',       lang: 'bash' },
  dockerfile: { label: 'Dockerfile', lang: 'dockerfile' },
  sql:        { label: 'SQL',        lang: 'sql' },
  text:       { label: 'Text',       lang: 'text' },
}

/**
 * SDKExample — multi-tab code example block (Python / TypeScript / YAML / JSON / ...)
 *
 * Usage:
 *   <SDKExample title="Basic RAG Pipeline" tabs={{ python: `...`, typescript: `...` }} />
 */
export default function SDKExample({ title, tabs = {} }) {
  const theme = useAppStore((s) => s.theme)
  const tabKeys = Object.keys(tabs).filter((k) => k in TAB_META && tabs[k])
  const [activeTab, setActiveTab] = useState(tabKeys[0] ?? '')
  const [copied, setCopied] = useState(false)

  if (!tabKeys.length) return null

  const activeMeta = TAB_META[activeTab]
  const activeCode = (tabs[activeTab] ?? '').trim()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/60">
      {/* Title bar */}
      {title && (
        <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-2.5 dark:border-gray-700/60 dark:bg-gray-800/40">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            {title}
          </span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 dark:border-gray-700/60 dark:bg-gray-800/60">
        <div className="flex items-end gap-0 px-3 pt-1.5">
          {tabKeys.map((key) => {
            const meta = TAB_META[key]
            const isActive = key === activeTab
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  isActive
                    ? 'bg-white text-gray-900 border border-b-white border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700/60 dark:border-b-gray-900'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                aria-selected={isActive}
                role="tab"
              >
                {meta.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="mr-3 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code panel */}
      <div className="overflow-x-auto text-sm [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0">
        <SyntaxHighlighter
          language={activeMeta?.lang ?? 'text'}
          style={theme === 'dark' ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.8125rem',
            lineHeight: '1.6',
            background: theme === 'dark' ? '#1a1d23' : '#ffffff',
          }}
          showLineNumbers={activeCode.split('\n').length > 5}
          wrapLines
        >
          {activeCode}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
