import { Check } from 'lucide-react'

export interface Task {
  id: number
  title: string
  description: string
  estimatedMinutes: number
  order: number
  riskScore: number
}

interface TaskCardProps {
  task: Task
  isHighestRisk?: boolean
  isCompleted?: boolean
  onStartNow?: () => void
}

function minuteColor(minutes: number) {
  if (minutes <= 10) return { badge: 'bg-success-bg text-success-text', dot: 'bg-success-text' }
  if (minutes <= 20) return { badge: 'bg-warning-bg text-warning-text', dot: 'bg-warning-text' }
  return { badge: 'bg-danger-bg text-danger-text', dot: 'bg-danger-text' }
}

export function riskTier(score: number): { label: string; color: string; dot: string } {
  if (score >= 70) return { label: 'High risk', color: 'text-danger-text', dot: 'bg-danger-text' }
  if (score >= 40) return { label: 'Medium risk', color: 'text-warning-text', dot: 'bg-warning-text' }
  return { label: 'Low risk', color: 'text-success-text', dot: 'bg-success-text' }
}

export function TaskCard({ task, isHighestRisk, isCompleted, onStartNow }: TaskCardProps) {
  const { badge, dot } = minuteColor(task.estimatedMinutes)
  const risk = riskTier(task.riskScore)

  if (isCompleted) {
    return (
      <div className="flex gap-4 rounded-2xl border border-border bg-raised p-5 opacity-50">
        <div className="flex-shrink-0 flex items-start pt-0.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-muted">
            <Check size={13} />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-text-secondary text-lg leading-snug line-through">
            {task.title}
          </h3>
          <p className="text-xs text-text-muted mt-1">Completed</p>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex gap-4 rounded-2xl border border-border bg-card-bg p-5 transition-all hover:border-border-strong hover:bg-raised">
      {}
      <div className="flex-shrink-0 flex items-start pt-0.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs font-medium text-text-secondary">
          {task.order}
        </span>
      </div>

      {}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-text-primary text-lg leading-snug mb-1">
          {task.title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {task.description}
        </p>
        {}
        <div className="flex items-center gap-2 mt-2">
          <span className={`flex items-center gap-1.5 text-xs font-medium ${risk.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
            {risk.label}
          </span>
          {isHighestRisk && (
            <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[10px] font-semibold text-danger-text uppercase tracking-wide">
              Start this first
            </span>
          )}
        </div>

        {}
        {onStartNow && (
          <button
            onClick={onStartNow}
            className="mt-3 flex items-center gap-2 rounded-xl bg-action px-4 py-2 font-semibold text-sm text-text-inverse transition-all hover:bg-action-hover active:bg-action-pressed"
          >
            Start Now
          </button>
        )}
      </div>

      {}
      <div className="flex-shrink-0 flex items-start pt-0.5">
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {task.estimatedMinutes} min
        </span>
      </div>
    </div>
  )
}
