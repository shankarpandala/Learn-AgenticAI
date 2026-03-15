import { useRef, useEffect } from 'react'

/**
 * ArchitectureDiagram — D3-based SVG flow diagram for AI architecture visualization.
 *
 * nodes: Array<{ id, label, type? ('agent'|'tool'|'store'|'external'|'llm'), x?, y? }>
 * edges: Array<{ from, to, label? }>
 * width, height: SVG dimensions (default 600x300)
 */

const NODE_TYPE_STYLES = {
  agent: { fill: '#e0f2fe', stroke: '#0284c7', textFill: '#0c4a6e' },
  tool: { fill: '#f0fdf4', stroke: '#16a34a', textFill: '#14532d' },
  store: { fill: '#faf5ff', stroke: '#7c3aed', textFill: '#4c1d95' },
  external: { fill: '#fff7ed', stroke: '#ea580c', textFill: '#7c2d12' },
  llm: { fill: '#fdf4ff', stroke: '#a21caf', textFill: '#701a75' },
  default: { fill: '#f8fafc', stroke: '#64748b', textFill: '#1e293b' },
}

const DARK_NODE_TYPE_STYLES = {
  agent: { fill: '#0c4a6e', stroke: '#38bdf8', textFill: '#e0f2fe' },
  tool: { fill: '#14532d', stroke: '#4ade80', textFill: '#dcfce7' },
  store: { fill: '#4c1d95', stroke: '#c084fc', textFill: '#ede9fe' },
  external: { fill: '#7c2d12', stroke: '#fb923c', textFill: '#fff7ed' },
  llm: { fill: '#701a75', stroke: '#e879f9', textFill: '#fdf4ff' },
  default: { fill: '#1e293b', stroke: '#94a3b8', textFill: '#e2e8f0' },
}

function layoutNodes(nodes, width, height) {
  const positioned = nodes.filter((n) => n.x !== undefined && n.y !== undefined)
  if (positioned.length === nodes.length) return nodes

  const cols = Math.ceil(Math.sqrt(nodes.length))
  const colW = width / (cols + 1)
  const rowH = height / (Math.ceil(nodes.length / cols) + 1)

  return nodes.map((n, i) => ({
    ...n,
    x: n.x ?? colW * ((i % cols) + 1),
    y: n.y ?? rowH * (Math.floor(i / cols) + 1),
  }))
}

export default function ArchitectureDiagram({
  nodes = [],
  edges = [],
  width = 640,
  height = 320,
  title,
  dark = false,
}) {
  const laid = layoutNodes(nodes, width, height)
  const nodeMap = Object.fromEntries(laid.map((n) => [n.id, n]))
  const styles = dark ? DARK_NODE_TYPE_STYLES : NODE_TYPE_STYLES

  const nodeW = 120
  const nodeH = 40
  const rx = 8

  return (
    <figure className="my-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700/60 dark:bg-gray-900">
      {title && (
        <figcaption className="border-b border-gray-100 px-4 py-2 text-xs font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {title}
        </figcaption>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width, display: 'block', margin: '0 auto' }}
        aria-label={title ?? 'Architecture diagram'}
        role="img"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 8 3, 0 6"
              fill={dark ? '#94a3b8' : '#64748b'}
            />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = nodeMap[edge.from]
          const to = nodeMap[edge.to]
          if (!from || !to) return null
          const x1 = from.x
          const y1 = from.y
          const x2 = to.x
          const y2 = to.y
          const mx = (x1 + x2) / 2
          const my = (y1 + y2) / 2
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={dark ? '#475569' : '#94a3b8'}
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              {edge.label && (
                <text
                  x={mx}
                  y={my - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill={dark ? '#94a3b8' : '#64748b'}
                >
                  {edge.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {laid.map((node) => {
          const s = styles[node.type ?? 'default'] ?? styles.default
          return (
            <g key={node.id} transform={`translate(${node.x - nodeW / 2}, ${node.y - nodeH / 2})`}>
              <rect
                width={nodeW}
                height={nodeH}
                rx={rx}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth="1.5"
              />
              <text
                x={nodeW / 2}
                y={nodeH / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill={s.textFill}
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
