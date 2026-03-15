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

const LANGUAGE_LABELS = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  jsx: 'JSX',
  bash: 'Bash',
  shell: 'Shell',
  yaml: 'YAML',
  json: 'JSON',
  toml: 'TOML',
  dockerfile: 'Dockerfile',
  sql: 'SQL',
  text: 'Text',
}

export default function CodeBlock({ language = 'python', filename, children }) {
  const [copied, setCopied] = useState(false)
  const theme = useAppStore((s) => s.theme)

  const code = typeof children === 'string' ? children.trim() : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  const langLabel = LANGUAGE_LABELS[language] ?? language

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/60">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700/60 dark:bg-gray-800/60">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {langLabel}
          </span>
          {filename && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                {filename}
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto text-sm [&>pre]:!m-0 [&>pre]:!rounded-none [&>pre]:!border-0">
        <SyntaxHighlighter
          language={language}
          style={theme === 'dark' ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.8125rem',
            lineHeight: '1.6',
            background: theme === 'dark' ? '#1a1d23' : '#f9fafb',
          }}
          showLineNumbers={code.split('\n').length > 5}
          wrapLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
