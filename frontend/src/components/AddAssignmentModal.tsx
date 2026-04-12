import { useState } from 'react'
import { breakDownAssignment } from '../lib/api'
import type { Assignment } from '../lib/api'
import { FileUpload } from './FileUpload'

interface AddAssignmentModalProps {
  apiKey: string
  onCreated: (assignment: Assignment) => void
  onClose: () => void
  onNeedApiKey: () => void
}

export function AddAssignmentModal({ apiKey, onCreated, onClose, onNeedApiKey }: AddAssignmentModalProps) {
  const [input, setInput] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!input.trim()) return
    if (!apiKey) {
      onNeedApiKey()
      return
    }

    setLoading(true)
    setError('')

    try {
      const { title, tasks } = await breakDownAssignment(input.trim(), apiKey)

      // Apply deadline proximity multiplier to risk scores
      const scaledTasks = tasks.map((t) => {
        let multiplier = 1
        if (deadline) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const due = new Date(deadline + 'T00:00:00')
          const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft <= 0) multiplier = 1.5
          else if (daysLeft === 1) multiplier = 1.3
          else if (daysLeft <= 3) multiplier = 1.1
        }
        return { ...t, riskScore: Math.min(99, Math.round(t.riskScore * multiplier)) }
      })

      const assignment: Assignment = {
        id: crypto.randomUUID(),
        title,
        rawInput: input.trim(),
        deadline: deadline || null,
        tasks: scaledTasks,
        completedIds: [],
        createdAt: new Date().toISOString(),
      }
      onCreated(assignment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-text-primary/30 px-4 pb-4 sm:pb-0"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card-bg p-6 flex flex-col gap-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-text-primary">Add Assignment</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Assignment text */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium uppercase tracking-wide">
            What's the assignment?
          </label>

          {/* File upload — populates textarea on extraction */}
          <FileUpload
            apiKey={apiKey}
            onExtracted={(text) => setInput(text)}
            onClear={() => setInput('')}
          />

          <textarea
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Write a 5-page analysis of The Great Gatsby due Friday..."
            rows={4}
            className="w-full rounded-2xl border border-border bg-app-bg px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-action resize-none leading-relaxed"
          />
        </div>

        {/* Deadline */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-secondary font-medium uppercase tracking-wide">
            Deadline <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-2xl border border-border bg-app-bg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-action [color-scheme:light]"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-danger-text rounded-xl border border-danger-text/25 bg-danger-bg px-4 py-2.5">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border py-3 text-sm font-medium text-text-secondary transition-all hover:text-text-primary hover:border-border-strong"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="flex-1 rounded-2xl bg-action py-3 text-sm font-semibold text-text-inverse transition-all hover:bg-action-hover active:bg-action-pressed disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Breaking it down…' : 'Break it down'}
          </button>
        </div>

        <p className="text-xs text-text-muted text-center -mt-2">
          ⌘↵ to submit
        </p>
      </div>
    </div>
  )
}
