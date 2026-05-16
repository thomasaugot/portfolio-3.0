type City = { city: string; country: string; users: number }

export default function TopCities({ cities }: { cities: City[] }) {
  const max = Math.max(1, ...cities.map(c => c.users))

  return (
    <div className="border border-border p-6">
      <p className="font-mono text-xs text-text-subtle tracking-widest uppercase mb-4">
        Top cities
      </p>
      {cities.length === 0 ? (
        <p className="font-mono text-sm text-text-muted">No city data yet.</p>
      ) : (
        <ul className="space-y-3">
          {cities.map((c, i) => (
            <li key={`${c.city}-${i}`} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-sm text-text truncate">
                  {c.city}
                  {c.country ? <span className="text-text-subtle"> · {c.country}</span> : null}
                </span>
                <span className="font-mono text-xs text-text-muted">{c.users}</span>
              </div>
              <div className="h-[2px] bg-primary" style={{ width: `${(c.users / max) * 100}%` }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
