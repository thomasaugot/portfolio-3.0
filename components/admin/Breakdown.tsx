type Row = { name: string; users: number; pct: number }

export default function Breakdown({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="border border-border p-6">
      <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-4">{title}</p>
      {rows.length === 0 ? (
        <p className="font-mono text-sm text-text-muted">No data yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r, i) => (
            <li key={`${r.name}-${i}`} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-sm text-text truncate">{r.name}</span>
                <span className="font-mono text-xs text-text-muted">{r.pct}%</span>
              </div>
              <div className="h-[2px] bg-primary" style={{ width: `${r.pct}%` }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
