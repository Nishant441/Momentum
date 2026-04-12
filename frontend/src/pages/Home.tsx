import { useState, useEffect, useRef } from 'react'
import { Key } from 'lucide-react'
import { TaskList } from '../components/TaskList'
import { FocusMode } from '../components/FocusMode'
import { VictoryScreen } from '../components/VictoryScreen'
import { useRoom } from '../hooks/useRoom'
import { useStreak } from '../hooks/useStreak'
import { useNotifications } from '../hooks/useNotifications'
import { VisualWorld } from '../components/VisualWorld'
import { StatsBar } from '../components/StatsBar'
import { BadgeRow } from '../components/BadgeRow'
import { AddAssignmentModal } from '../components/AddAssignmentModal'
import { UrgencyDashboard } from '../components/UrgencyDashboard'
import { NotificationPrompt } from '../components/NotificationPrompt'
import { SettingsMenu } from '../components/SettingsMenu'
import { loadAssignments, saveAssignments } from '../lib/api'
import { fetchAssignments, syncAssignments } from '../lib/authClient'
import type { Assignment } from '../lib/api'
import type { AuthUser } from '../lib/authClient'
import type { Task } from '../components/TaskCard'

interface HomeProps {
  token: string
  user: AuthUser | null
  onLogout: () => void
}

export function Home({ token, user, onLogout }: HomeProps) {
  const room = useRoom()
  const { streak, totalTasksCompleted, totalFocusMinutes, badges, recordTaskComplete, addFocusMinutes } =
    useStreak(token)
  const {
    permissionState,
    settings,
    handleEnableNotifications,
    handleSkipNotifications,
    toggleNotifications,
    toggleSound,
    scheduleNotifications,
  } = useNotifications()

  // ── Persistent assignment list ────────────────────────────────────────────
  const [assignments, setAssignments] = useState<Assignment[]>(() => loadAssignments())
  const [serverLoaded, setServerLoaded] = useState(false)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // On mount: fetch from server, replacing localStorage snapshot
  useEffect(() => {
    fetchAssignments(token)
      .then((serverAssignments) => {
        setAssignments(serverAssignments)
        saveAssignments(serverAssignments)
      })
      .catch(() => {
        // Server unreachable — fall back to localStorage, still allow use
      })
      .finally(() => setServerLoaded(true))
  }, [token])

  // Sync to server (debounced 1s) + localStorage whenever assignments change
  useEffect(() => {
    if (!serverLoaded) return
    saveAssignments(assignments)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(() => {
      syncAssignments(token, assignments).catch(() => {})
    }, 1000)
  }, [assignments, serverLoaded, token])

  // ── Smart notifications ───────────────────────────────────────────────────
  useEffect(() => {
    scheduleNotifications(assignments, room.sprinters)
  }, [assignments, room.sprinters, scheduleNotifications])

  // ── Navigation state ──────────────────────────────────────────────────────
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null)
  const [focusTask, setFocusTask] = useState<Task | null>(null)
  const [showVictory, setShowVictory] = useState(false)

  // ── Modal / API key ───────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('momentum_api_key') ?? '')
  const [showKeyInput, setShowKeyInput] = useState(false)

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeAssignment = activeAssignmentId
    ? assignments.find((a) => a.id === activeAssignmentId) ?? null
    : null

  const globalTotal = assignments.reduce((sum, a) => sum + a.tasks.length, 0)
  const globalCompleted = assignments.reduce((sum, a) => sum + a.completedIds.length, 0)
  const showNotifPrompt = assignments.length > 0 && permissionState === 'pending'

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAssignmentCreated = (assignment: Assignment) => {
    setAssignments((prev) => [assignment, ...prev])
    setShowModal(false)
    setActiveAssignmentId(assignment.id)
  }

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleOpenAssignment = (id: string) => {
    setActiveAssignmentId(id)
    setFocusTask(null)
    setShowVictory(false)
  }

  const handleBackToDashboard = () => {
    setActiveAssignmentId(null)
    setFocusTask(null)
    setShowVictory(false)
  }

  const handleComplete = (taskId: number) => {
    if (!activeAssignmentId) return
    let allDone = false
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== activeAssignmentId) return a
        const newCompleted = [...a.completedIds, taskId]
        if (newCompleted.length >= a.tasks.length) allDone = true
        return { ...a, completedIds: newCompleted }
      }),
    )
    setFocusTask(null)
    recordTaskComplete()
    if (allDone) setShowVictory(true)
  }

  const handleSaveKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('momentum_api_key', key)
    setShowKeyInput(false)
  }

  // ── Victory screen ────────────────────────────────────────────────────────
  if (showVictory && activeAssignment) {
    return (
      <VictoryScreen
        taskCount={activeAssignment.tasks.length}
        onStartOver={handleBackToDashboard}
      />
    )
  }

  // ── Focus mode ────────────────────────────────────────────────────────────
  if (focusTask && activeAssignment) {
    return (
      <FocusMode
        task={focusTask}
        totalTasks={activeAssignment.tasks.length}
        onBack={() => setFocusTask(null)}
        onComplete={handleComplete}
        onTimerComplete={() => addFocusMinutes(focusTask.estimatedMinutes)}
        room={room}
      />
    )
  }

  // ── Shared header actions ─────────────────────────────────────────────────
  const headerRight = (
    <div className="flex items-center gap-2">
      <SettingsMenu
        settings={settings}
        notifPermission={permissionState}
        onToggleNotifications={toggleNotifications}
        onToggleSound={toggleSound}
      />
      <button
        onClick={() => setShowKeyInput((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-text-secondary border border-border rounded-xl px-3 py-1.5 hover:text-text-primary hover:border-border-strong transition-all"
        title="Set API key"
      >
        <Key size={12} />
        {apiKey ? 'Key set' : 'Add key'}
      </button>
      <button
        onClick={onLogout}
        className="text-xs text-text-secondary border border-border rounded-xl px-3 py-1.5 hover:text-danger-text hover:border-danger-text/30 transition-all"
        title="Sign out"
      >
        Sign out
      </button>
    </div>
  )

  const keyForm = showKeyInput && (
    <div className="w-full max-w-2xl px-4 mt-3">
      <ApiKeyForm currentKey={apiKey} onSave={handleSaveKey} onCancel={() => setShowKeyInput(false)} />
    </div>
  )

  // ── Task list for a single assignment ─────────────────────────────────────
  if (activeAssignment) {
    return (
      <div className="min-h-svh flex flex-col items-center bg-app-bg">
        <header className="w-full max-w-2xl px-4 pt-10 pb-2 flex items-center justify-between">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <span className="text-base leading-none">←</span>
            Dashboard
          </button>
          {headerRight}
        </header>

        {keyForm}

        <main className="w-full max-w-2xl px-4 py-6 flex flex-col gap-6">
          <div>
            <h2 className="font-display font-bold text-3xl text-text-primary leading-snug">
              {activeAssignment.title}
            </h2>
            {activeAssignment.deadline && (
              <p className="text-sm text-text-secondary mt-1">
                Due{' '}
                {new Date(activeAssignment.deadline + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>

          <VisualWorld
            totalTasks={activeAssignment.tasks.length}
            completedCount={activeAssignment.completedIds.length}
          />

          {room.connected && room.sprinters.length > 0 && (
            <div className="flex items-center gap-2 rounded-2xl border border-danger-text/20 bg-danger-bg px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-danger-text animate-pulse flex-shrink-0" />
              <span className="text-sm text-danger-text font-medium">
                {room.sprinters.length} student{room.sprinters.length !== 1 ? 's' : ''} working right now
              </span>
              <span className="text-xs text-text-muted ml-auto">Start a sprint to join them</span>
            </div>
          )}

          <TaskList
            tasks={activeAssignment.tasks}
            completedIds={activeAssignment.completedIds}
            onStartOver={handleBackToDashboard}
            onFocusTask={setFocusTask}
          />
        </main>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-svh flex flex-col items-center bg-app-bg">
      <header className="w-full max-w-2xl px-4 pt-12 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-4xl text-text-primary leading-none">
            Momentum
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {user ? user.email : 'Stop overthinking. Start doing.'}
          </p>
        </div>
        {headerRight}
      </header>

      {keyForm}

      <div className="w-full max-w-2xl px-4 mt-4 flex flex-col gap-2">
        <StatsBar streak={streak} totalTasksCompleted={totalTasksCompleted} totalFocusMinutes={totalFocusMinutes} />
        <BadgeRow badges={badges} />
      </div>

      {globalTotal > 0 && (
        <div className="w-full max-w-2xl px-4 mt-4">
          <VisualWorld totalTasks={globalTotal} completedCount={globalCompleted} />
        </div>
      )}

      <main className="w-full max-w-2xl px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-text-primary">
            {assignments.length === 0 ? 'What\u2019s due?' : 'Assignments'}
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-action px-4 py-2 text-sm font-semibold text-text-inverse transition-all hover:bg-action-hover active:bg-action-pressed"
          >
            <span className="text-base leading-none">+</span>
            Add
          </button>
        </div>

        {showNotifPrompt && (
          <NotificationPrompt
            onEnable={handleEnableNotifications}
            onSkip={handleSkipNotifications}
          />
        )}

        <UrgencyDashboard
          assignments={assignments}
          onOpen={handleOpenAssignment}
          onDelete={handleDeleteAssignment}
        />
      </main>

      {showModal && (
        <AddAssignmentModal
          apiKey={apiKey}
          onCreated={handleAssignmentCreated}
          onClose={() => setShowModal(false)}
          onNeedApiKey={() => {
            setShowModal(false)
            setShowKeyInput(true)
          }}
        />
      )}
    </div>
  )
}

// ── Inline API key form ───────────────────────────────────────────────────────

function ApiKeyForm({
  currentKey,
  onSave,
  onCancel,
}: {
  currentKey: string
  onSave: (key: string) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(currentKey)

  return (
    <div className="rounded-2xl border border-border bg-card-bg p-4 flex flex-col gap-3">
      <p className="text-xs text-text-secondary">
        Your Anthropic API key \u2014 stored locally in your browser, never sent anywhere except directly to Anthropic.
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="sk-ant-..."
          className="flex-1 rounded-xl border border-border bg-app-bg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-action"
        />
        <button
          onClick={() => onSave(draft.trim())}
          disabled={!draft.trim()}
          className="rounded-xl bg-action px-4 py-2 text-sm font-semibold text-text-inverse disabled:opacity-40 hover:bg-action-hover"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-border px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
