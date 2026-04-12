interface VictoryScreenProps {
  taskCount: number
  onStartOver: () => void
}

export function VictoryScreen({ taskCount, onStartOver }: VictoryScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-app-bg px-6 text-center">
      <div className="w-full max-w-lg flex flex-col items-center gap-6">
        <div className="h-px w-16 bg-gold-strong mx-auto" />

        <div>
          <h1 className="font-display font-bold text-5xl text-text-primary leading-tight">
            You crushed it.
          </h1>
          <p className="text-text-secondary text-base mt-3">
            All {taskCount} tasks complete. That's how it's done.
          </p>
        </div>

        {/* Stats row */}
        <div className="w-full rounded-2xl border border-success-text/20 bg-success-bg px-6 py-4">
          <p className="font-display font-bold text-success-text text-2xl">{taskCount} of {taskCount} complete</p>
          <p className="text-sm text-text-secondary mt-0.5">No procrastinating today.</p>
        </div>

        <div className="h-px w-full bg-divider" />

        <button
          onClick={onStartOver}
          className="w-full rounded-2xl bg-action py-4 font-semibold text-base text-text-inverse transition-all hover:bg-action-hover active:bg-action-pressed"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
