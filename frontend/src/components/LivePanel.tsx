import type { Sprinter } from '../hooks/useRoom'

interface LivePanelProps {
  sprinters: Sprinter[]
  connected: boolean
}

export function LivePanel({ sprinters, connected }: LivePanelProps) {
  if (!connected) return null

  return (
    <div className="mt-2 border-t border-divider pt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full bg-danger-text animate-pulse flex-shrink-0" />
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {sprinters.length > 0
            ? `${sprinters.length} student${sprinters.length !== 1 ? 's' : ''} sprinting now`
            : "You\u2019re the only one here \u2014 lead by example"}
        </span>
      </div>

      {/* Sprinter list */}
      {sprinters.length > 0 && (
        <div className="flex flex-col gap-2">
          {sprinters.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-text-muted text-sm flex-shrink-0">·</span>
                <span className="text-sm font-medium text-text-primary flex-shrink-0">
                  {s.user}
                </span>
                <span className="text-sm text-text-secondary truncate">— {s.task}</span>
              </div>
              <span className="text-xs text-text-muted flex-shrink-0">
                {s.minutesLeft}m left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
