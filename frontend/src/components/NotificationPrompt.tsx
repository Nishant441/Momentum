import { Bell } from 'lucide-react'

interface NotificationPromptProps {
  onEnable: () => void
  onSkip: () => void
}

export function NotificationPrompt({ onEnable, onSkip }: NotificationPromptProps) {
  return (
    <div className="w-full rounded-2xl border border-border bg-card-bg px-5 py-4 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Bell size={18} className="text-text-secondary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-display font-bold text-lg text-text-primary">Stay on track</p>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            Get nudged before you procrastinate. We'll only notify you when it matters.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onEnable}
          className="flex-1 rounded-2xl bg-action py-2.5 text-sm font-semibold text-text-inverse transition-all hover:bg-action-hover active:bg-action-pressed"
        >
          Enable Notifications
        </button>
        <button
          onClick={onSkip}
          className="rounded-2xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:text-text-primary hover:border-border-strong"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
