type Source = { channel: string; sessions: number; pct: number }

export default function TrafficSources({ sources }: { sources: Source[] }) {
  if (!sources.length) {
    return (
      <div className="border border-border p-6">
        <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-6">Traffic sources</p>
        <p className="font-mono text-xs text-text-subtle">No data yet</p>
      </div>
    )
  }

  return (
    <div className="border border-border p-6">
      <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-6">Traffic sources</p>
      <div className="space-y-5">
        {sources.map(({ channel, sessions, pct }) => (
          <div key={channel}>
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono text-xs text-text">{channel}</span>
              <span className="font-mono text-xs text-text-muted">
                {sessions.toLocaleString()} <span className="text-text-subtle">· {pct}%</span>
              </span>
            </div>
            <div className="h-[2px] bg-border">
              <div className="h-[2px] bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
