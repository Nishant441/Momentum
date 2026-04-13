import type { Assignment } from '../lib/api'

type Bucket = 'urgent' | 'do_today' | 'on_track' | 'done'

export function getBucket(assignment: Assignment): Bucket {
  if (assignment.completedIds.length === assignment.tasks.length && assignment.tasks.length > 0) {
    return 'done'
  }
  if (!assignment.deadline) return 'on_track'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(assignment.deadline + 'T00:00:00')
  const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft <= 1) return 'urgent'
  if (daysLeft <= 3) return 'do_today'
  return 'on_track'
}

function formatDeadline(deadline: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(deadline + 'T00:00:00')
  const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) return 'Overdue'
  if (daysLeft === 0) return 'Due today'
  if (daysLeft === 1) return 'Due tomorrow'
  return `${daysLeft} days left`
}

const BUCKET_STYLE: Record<Bucket, { badge: string; bar: string }> = {
  urgent:   { badge: 'text-danger-text bg-danger-bg border-danger-text/25',   bar: 'bg-danger-text' },
  do_today: { badge: 'text-warning-text bg-warning-bg border-warning-text/25', bar: 'bg-warning-text' },
  on_track: { badge: 'text-success-text bg-success-bg border-success-text/25', bar: 'bg-success-text' },
  done:     { badge: 'text-text-muted bg-raised border-border',               bar: 'bg-text-muted' },
}

interface AssignmentCardProps {
  assignment: Assignment
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

export function AssignmentCard({ assignment, onOpen, onDelete }: AssignmentCardProps) {
  const bucket = getBucket(assignment)
  const style = BUCKET_STYLE[bucket]
  const total = assignment.tasks.length
  const completed = assignment.completedIds.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const isDone = bucket === 'done'

  const avgRisk =
    total > 0
      ? Math.round(
          assignment.tasks
            .filter((t) => !assignment.completedIds.includes(t.id))
            .reduce((sum, t) => sum + t.riskScore, 0) /
            Math.max(1, total - completed),
        )
      : 0

  return (
    <div
      className={`group relative rounded-2xl border bg-card-bg px-5 py-4 flex flex-col gap-3 transition-all ${
        isDone ? 'border-border opacity-60' : 'border-border hover:border-border-strong cursor-pointer hover:bg-raised'
      }`}
      onClick={() => !isDone && onOpen(assignment.id)}
    >
      {}
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`font-display font-bold text-xl leading-snug ${
            isDone ? 'text-text-muted line-through' : 'text-text-primary'
          }`}
        >
          {assignment.title}
        </h3>

        <div className="flex items-center gap-2 flex-shrink-0">
          {assignment.deadline && (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${style.badge}`}>
              {formatDeadline(assignment.deadline)}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(assignment.id) }}
            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger-text text-base leading-none transition-all"
            title="Delete assignment"
          >
            ×
          </button>
        </div>
      </div>

      {}
      <div className="flex flex-col gap-1.5">
        <div className="h-1.5 w-full rounded-full bg-raised overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            {completed} / {total} tasks
          </span>
          {!isDone && total > 0 && completed < total && (
            <span>{avgRisk}% delay risk on remaining</span>
          )}
          {isDone && <span className="text-success-text font-medium">Complete ✓</span>}
        </div>
      </div>

      {}
      {!isDone && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            {total - completed} task{total - completed !== 1 ? 's' : ''} remaining
          </span>
          <span className="text-xs font-medium text-action group-hover:underline underline-offset-2">
            {completed === 0 ? 'Start →' : 'Continue →'}
          </span>
        </div>
      )}
    </div>
  )
}
