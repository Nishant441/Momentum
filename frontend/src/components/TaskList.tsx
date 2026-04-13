import { TaskCard, riskTier } from './TaskCard'
import type { Task } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  completedIds: number[]
  onStartOver: () => void
  onFocusTask: (task: Task) => void
}

export function TaskList({ tasks, completedIds, onStartOver, onFocusTask }: TaskListProps) {
  const incompleteTasks = tasks.filter((t) => !completedIds.includes(t.id))
  const totalMinutes = incompleteTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)

  const overallRisk =
    incompleteTasks.length > 0
      ? Math.round(incompleteTasks.reduce((sum, t) => sum + t.riskScore, 0) / incompleteTasks.length)
      : 0
  const risk = riskTier(overallRisk)

  const highestRiskId =
    incompleteTasks.length > 0
      ? incompleteTasks.reduce((max, t) => (t.riskScore > max.riskScore ? t : max), incompleteTasks[0]).id
      : -1

  const riskMessage = () => {
    if (incompleteTasks.length === 0) return 'All tasks complete!'
    if (overallRisk >= 70) return "You're highly likely to push this to the last minute."
    if (overallRisk >= 40) return "You might delay a few of these. Tackle the hard ones first."
    return "You're in good shape. Stay consistent and you'll finish on time."
  }

  const bannerStyle =
    overallRisk >= 70
      ? 'border-danger-text/20 bg-danger-bg'
      : overallRisk >= 40
      ? 'border-warning-text/20 bg-warning-bg'
      : 'border-success-text/20 bg-success-bg'

  return (
    <div className="w-full flex flex-col gap-4">
      {}
      <div className={`rounded-2xl border px-5 py-4 flex items-start gap-4 ${bannerStyle}`}>
        <span className={`h-2 w-2 rounded-full flex-shrink-0 mt-1.5 ${risk.dot}`} />
        <div className="flex-1">
          <p className={`font-medium text-sm ${risk.color}`}>
            Overall delay risk: {overallRisk}%
          </p>
          <p className="text-sm text-text-secondary mt-0.5">{riskMessage()}</p>
        </div>
      </div>

      {}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card-bg px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-text-primary text-lg">
            {incompleteTasks.length} remaining
          </span>
          <span className="text-text-muted text-sm">·</span>
          <span className="text-sm text-text-secondary">~{totalMinutes} min left</span>
        </div>
        {completedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success-text" />
            <span className="text-xs text-success-text font-medium">
              {completedIds.length} done
            </span>
          </div>
        )}
      </div>

      {}
      <div className="flex flex-col gap-2">
        {tasks.map((task) => {
          const completed = completedIds.includes(task.id)
          return (
            <TaskCard
              key={task.id}
              task={task}
              isCompleted={completed}
              isHighestRisk={!completed && task.id === highestRiskId}
              onStartNow={!completed && task.id === highestRiskId ? () => onFocusTask(task) : undefined}
            />
          )
        })}
      </div>

      {}
      <button
        onClick={onStartOver}
        className="mt-2 w-full rounded-2xl border border-border bg-transparent py-3 text-sm text-text-secondary transition-all hover:border-border-strong hover:text-text-primary"
      >
        ← Back to Dashboard
      </button>
    </div>
  )
}
