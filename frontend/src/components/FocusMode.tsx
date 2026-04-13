import { useState, useEffect, useRef } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import type { Task } from './TaskCard'
import { riskTier } from './TaskCard'
import { LivePanel } from './LivePanel'
import type { Sprinter } from '../hooks/useRoom'

type TimerState = 'idle' | 'running' | 'paused' | 'done'

interface RoomProps {
  sprinters: Sprinter[]
  connected: boolean
  joinSprint: (task: Task, minutesLeft: number) => void
  leaveSprint: () => void
  tickUpdate: (minutesLeft: number) => void
}

interface FocusModeProps {
  task: Task
  totalTasks: number
  onBack: () => void
  onComplete: (taskId: number) => void
  onTimerComplete: () => void
  room: RoomProps
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function FocusMode({ task, totalTasks, onBack, onComplete, onTimerComplete, room }: FocusModeProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [secondsLeft, setSecondsLeft] = useState(task.estimatedMinutes * 60)
  const hasJoined = useRef(false)
  const secondsRef = useRef(secondsLeft)
  const endTimeRef = useRef<number>(0)
  const onTimerCompleteRef = useRef(onTimerComplete)
  useEffect(() => { onTimerCompleteRef.current = onTimerComplete }, [onTimerComplete])

  const risk = riskTier(task.riskScore)


  useEffect(() => {
    secondsRef.current = secondsLeft
  }, [secondsLeft])


  useEffect(() => {
    if (timerState !== 'running') return
    const interval = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000)))
    }, 1000)
    return () => clearInterval(interval)
  }, [timerState])


  useEffect(() => {
    if (timerState === 'running' && secondsLeft === 0) {
      setTimerState('done')
      onTimerCompleteRef.current()
    }
  }, [timerState, secondsLeft])


  useEffect(() => {
    if (timerState !== 'running') return
    const tick = setInterval(() => {
      room.tickUpdate(Math.ceil(secondsRef.current / 60))
    }, 10_000)
    return () => clearInterval(tick)
  }, [timerState, room.tickUpdate])



  const startTimer = () => {
    const mins = task.estimatedMinutes
    endTimeRef.current = Date.now() + mins * 60 * 1000
    setSecondsLeft(mins * 60)
    setTimerState('running')
    hasJoined.current = true
    room.joinSprint(task, mins)
  }

  const resumeTimer = () => {
    endTimeRef.current = Date.now() + secondsLeft * 1000
    setTimerState('running')
  }

  const giveUp = () => {
    if (hasJoined.current) {
      room.leaveSprint()
      hasJoined.current = false
    }
    setTimerState('idle')
    setSecondsLeft(task.estimatedMinutes * 60)
  }

  const needMoreTime = () => {
    const mins = task.estimatedMinutes
    endTimeRef.current = Date.now() + mins * 60 * 1000
    setSecondsLeft(mins * 60)
    setTimerState('running')
    room.joinSprint(task, mins)
  }

  const handleBack = () => {
    if (hasJoined.current) {
      room.leaveSprint()
      hasJoined.current = false
    }
    onBack()
  }

  const handleComplete = () => {
    if (hasJoined.current) {
      room.leaveSprint()
      hasJoined.current = false
    }
    onComplete(task.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-app-bg px-6 overflow-y-auto">
      {}
      {timerState !== 'running' && (
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <span className="text-base leading-none">←</span>
          Back to all tasks
        </button>
      )}

      <div className="w-full max-w-lg flex flex-col gap-6 py-16">
        {}
        <p className="text-sm text-text-muted font-medium tracking-wide uppercase">
          Step {task.order} of {totalTasks}
        </p>

        {}
        <div>
          <h1 className="font-display font-bold text-4xl text-text-primary leading-snug">
            {task.title}
          </h1>
          <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium ${risk.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
            {risk.label} · {task.riskScore}% delay risk
          </span>
        </div>

        {}
        {timerState === 'idle' && (
          <>
            <p className="text-text-secondary text-base leading-relaxed border-l-2 border-border pl-4">
              {task.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock size={14} className="flex-shrink-0" />
              <span>
                Estimated:{' '}
                <strong className="text-text-primary font-medium">{task.estimatedMinutes} minutes</strong>
              </span>
            </div>
            <div className="h-px bg-divider" />
            <button
              onClick={startTimer}
              className="w-full rounded-2xl bg-action py-4 font-semibold text-base text-text-inverse transition-all hover:bg-action-hover active:bg-action-pressed"
            >
              Start Timer
            </button>
          </>
        )}

        {}
        {(timerState === 'running' || timerState === 'paused') && (
          <>
            <div className="text-center py-4">
              <span className="font-mono font-semibold text-8xl text-text-primary tracking-tight tabular-nums">
                {formatTime(secondsLeft)}
              </span>
              {timerState === 'paused' && (
                <p className="text-xs text-text-muted mt-3 uppercase tracking-widest">
                  Paused
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {timerState === 'running' ? (
                <button
                  onClick={() => setTimerState('paused')}
                  className="flex-1 rounded-2xl border border-border bg-card-bg py-3 text-sm font-medium text-text-primary transition-all hover:border-border-strong"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  className="flex-1 rounded-2xl bg-action py-3 text-sm font-semibold text-text-inverse transition-all hover:bg-action-hover"
                >
                  Resume
                </button>
              )}
              <button
                onClick={giveUp}
                className="flex-1 rounded-2xl border border-border py-3 text-sm font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text-primary"
              >
                Give Up
              </button>
            </div>

            {}
            <LivePanel sprinters={room.sprinters} connected={room.connected} />
          </>
        )}

        {}
        {timerState === 'done' && (
          <>
            <div className="text-center py-2">
              <CheckCircle size={40} className="text-success-text mx-auto mb-4" />
              <p className="font-display font-bold text-3xl text-text-primary">Done. Great work.</p>
              <p className="text-text-secondary text-sm mt-2">
                Take a 5-minute break before your next task.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleComplete}
                className="w-full rounded-2xl bg-action py-4 font-semibold text-base text-text-inverse transition-all hover:bg-action-hover active:bg-action-pressed"
              >
                Mark Complete & Continue
              </button>
              <button
                onClick={needMoreTime}
                className="w-full rounded-2xl border border-border py-3 text-sm font-medium text-text-secondary transition-all hover:border-border-strong hover:text-text-primary"
              >
                I need more time
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
