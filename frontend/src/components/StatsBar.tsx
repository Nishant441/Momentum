import { Flame, Clock, CheckCircle } from 'lucide-react'

function formatFocusTime(minutes: number): string {
  if (minutes === 0) return '0m'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

interface StatsBarProps {
  streak: number
  totalTasksCompleted: number
  totalFocusMinutes: number
}

export function StatsBar({ streak, totalTasksCompleted, totalFocusMinutes }: StatsBarProps) {
  return (
    <div className="w-full grid grid-cols-3 rounded-2xl border border-border bg-card-bg divide-x divide-border">
      <Stat
        icon={<Flame size={14} />}
        value={streak > 0 ? `${streak} day${streak !== 1 ? 's' : ''}` : 'No streak'}
        label={streak > 0 ? 'streak' : 'Start today'}
        highlight={streak >= 3}
      />
      <Stat
        icon={<Clock size={14} />}
        value={formatFocusTime(totalFocusMinutes)}
        label="focus time"
      />
      <Stat
        icon={<CheckCircle size={14} />}
        value={String(totalTasksCompleted)}
        label={totalTasksCompleted === 1 ? 'task done' : 'tasks done'}
      />
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
  highlight,
}: {
  icon: React.ReactNode
  value: string
  label: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col items-center py-3 px-2">
      <span className={`mb-1 ${highlight ? 'text-danger-text' : 'text-text-muted'}`}>{icon}</span>
      <span
        className={`font-display font-bold text-base leading-tight ${
          highlight ? 'text-danger-text' : 'text-text-primary'
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wide">{label}</span>
    </div>
  )
}
