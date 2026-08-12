/**
 * Skeleton — animated shimmer placeholder while data is loading.
 * Usage:
 *   <Skeleton rows={5} />          → table rows
 *   <Skeleton type="stat" count={4} />  → stat cards
 *   <Skeleton type="card" />        → single card
 */
export default function Skeleton({ rows = 5, type = "table", count = 3 }) {
  if (type === "stat") {
    return (
      <div
        className={`grid gap-4`}
        style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-5 flex items-center gap-4 animate-pulse"
          >
            <div className="w-11 h-11 rounded-xl skeleton-box shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-12 rounded skeleton-box" />
              <div className="h-3 w-20 rounded skeleton-box" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse space-y-3">
        <div className="h-5 w-40 rounded skeleton-box" />
        <div className="h-3 w-full rounded skeleton-box" />
        <div className="h-3 w-3/4 rounded skeleton-box" />
        <div className="h-3 w-2/3 rounded skeleton-box" />
      </div>
    );
  }

  // Default: table rows
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      {/* Header */}
      <div
        className="flex gap-4 px-5 py-3 border-b"
        style={{ borderColor: "var(--border-faint)" }}
      >
        {[40, 80, 120, 80, 60, 60].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded skeleton-box"
            style={{ width: w }}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 items-center px-5 py-4 border-b"
          style={{
            borderColor: "var(--border-faint)",
            animationDelay: `${i * 60}ms`,
          }}
        >
          <div className="h-3 rounded skeleton-box" style={{ width: 40 }} />
          <div className="h-3 rounded skeleton-box" style={{ width: 80 }} />
          <div className="h-3 rounded skeleton-box flex-1" />
          <div className="h-3 rounded skeleton-box" style={{ width: 80 }} />
          <div className="h-5 w-16 rounded-full skeleton-box" />
          <div className="h-3 rounded skeleton-box" style={{ width: 60 }} />
        </div>
      ))}
    </div>
  );
}
