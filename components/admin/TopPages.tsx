type Page = { path: string; views: number }

export default function TopPages({ pages }: { pages: Page[] }) {
  if (!pages.length) {
    return (
      <div className="border border-border p-6">
        <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-6">Top pages</p>
        <p className="font-mono text-xs text-text-subtle">No data yet</p>
      </div>
    )
  }

  const max = pages[0].views

  return (
    <div className="border border-border p-6">
      <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-6">Top pages</p>
      <div className="space-y-5">
        {pages.map(({ path, views }) => (
          <div key={path}>
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono text-xs text-text truncate mr-4" title={path}>{path}</span>
              <span className="font-mono text-xs text-text-muted shrink-0">{views.toLocaleString()}</span>
            </div>
            <div className="h-[2px] bg-border">
              <div className="h-[2px] bg-primary" style={{ width: `${(views / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
