/**
 * RechartsWrapper — thin wrapper that provides consistent theming for Recharts charts
 * Pass a Recharts chart component as children with a ResponsiveContainer parent.
 */
export default function RechartsWrapper({ title, caption, height = 300, children }) {
  return (
    <figure className="my-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-900">
      {title && (
        <figcaption className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </figcaption>
      )}
      <div style={{ height }}>
        {children}
      </div>
      {caption && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
          {caption}
        </p>
      )}
    </figure>
  )
}
