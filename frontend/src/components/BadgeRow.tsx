import type { BadgeId } from '../hooks/useStreak'

const BADGE_META: Record<BadgeId, { label: string; desc: string }> = {
  first_win:       { label: 'First Win',       desc: 'Completed your first task' },
  streak_master:   { label: 'Streak Master',   desc: '10 day streak reached' },
  sprint_champion: { label: 'Sprint Champion', desc: '5 sprints in one day' },
}

interface BadgeRowProps {
  badges: BadgeId[]
}

export function BadgeRow({ badges }: BadgeRowProps) {
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((id) => {
        const { label, desc } = BADGE_META[id]
        return (
          <div
            key={id}
            title={desc}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card-bg px-3 py-1.5 text-xs font-medium text-text-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold-strong flex-shrink-0" />
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
