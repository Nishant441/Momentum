import { useState, useCallback, useEffect, useRef } from 'react'
import { isSupported, requestPermission, sendNotification } from '../lib/notifications'
import type { Assignment } from '../lib/api'
import type { Sprinter } from './useRoom'

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotifPermission = 'pending' | 'granted' | 'denied'

export interface NotificationSettings {
  notificationsEnabled: boolean
  soundEnabled: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  notificationsEnabled: true,
  soundEnabled: false,
}

const PERM_KEY = 'momentum_notif_permission'
const SETTINGS_KEY = 'momentum_settings'

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const [permissionState, setPermissionState] = useState<NotifPermission>(() => {
    const stored = localStorage.getItem(PERM_KEY)
    return (stored as NotifPermission | null) ?? 'pending'
  })

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<NotificationSettings>) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  // Persist settings on change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // Scheduling deduplication — refs so scheduleNotifications stays stable
  const sentType1Ids = useRef(new Set<string>())
  const scheduledType2Ids = useRef(new Set<string>())
  const sprintNudgeScheduled = useRef(false)
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([])

  // Ref-based canSend so scheduleNotifications doesn't need to be recreated when settings change
  const canSendRef = useRef(false)
  canSendRef.current =
    settings.notificationsEnabled &&
    permissionState === 'granted' &&
    isSupported() &&
    Notification.permission === 'granted'

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleEnableNotifications = useCallback(async () => {
    const granted = await requestPermission()
    const newState: NotifPermission = granted ? 'granted' : 'denied'
    setPermissionState(newState)
    localStorage.setItem(PERM_KEY, newState)
    if (granted) {
      setSettings((prev) => ({ ...prev, notificationsEnabled: true }))
    }
  }, [])

  const handleSkipNotifications = useCallback(() => {
    setPermissionState('denied')
    localStorage.setItem(PERM_KEY, 'denied')
  }, [])

  const toggleNotifications = useCallback(() => {
    setSettings((prev) => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))
  }, [])

  const toggleSound = useCallback(() => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }, [])

  // ── Scheduling ────────────────────────────────────────────────────────────

  // Stable function — reads canSend via ref, no deps that change between renders
  const scheduleNotifications = useCallback(
    (assignments: Assignment[], sprinters: Sprinter[]) => {
      if (!canSendRef.current) return

      const now = new Date()

      // Type 1 — immediate deadline check (deduplicated per session via sentType1Ids)
      for (const a of assignments) {
        if (sentType1Ids.current.has(a.id)) continue
        if (!a.deadline) continue
        const allDone = a.completedIds.length >= a.tasks.length
        if (allDone) continue

        const due = new Date(a.deadline + 'T00:00:00')
        const daysLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        if (daysLeft <= 1) {
          sentType1Ids.current.add(a.id)
          const remaining = a.tasks.length - a.completedIds.length
          sendNotification(
            `${a.title} is due tomorrow`,
            `You have ${remaining} task${remaining !== 1 ? 's' : ''} left. Start now.`,
          )
        }
      }

      // Type 2 — untouched high-risk, fire after 30 min in session
      for (const a of assignments) {
        if (scheduledType2Ids.current.has(a.id)) continue
        if (a.completedIds.length > 0 || a.tasks.length === 0) continue

        const avgRisk = a.tasks.reduce((sum, t) => sum + t.riskScore, 0) / a.tasks.length
        if (avgRisk < 70) continue

        const addedHours = (now.getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60)
        if (addedHours < 2) continue

        scheduledType2Ids.current.add(a.id)
        const id = setTimeout(() => {
          if (!canSendRef.current) return
          sendNotification(
            `You haven\u2019t started ${a.title}`,
            `${Math.round(avgRisk)}% chance you\u2019ll delay this. Do one task now.`,
          )
        }, 1000 * 60 * 30)
        timeoutIds.current.push(id)
      }

      // Type 3 — social sprint nudge, fire 5 min after detecting 3+ sprinters
      if (sprinters.length >= 3 && !sprintNudgeScheduled.current) {
        sprintNudgeScheduled.current = true
        const count = sprinters.length
        const id = setTimeout(() => {
          if (!canSendRef.current) return
          sendNotification(
            `${count} students are sprinting right now`,
            'Join them for a focus session.',
          )
          sprintNudgeScheduled.current = false // allow re-trigger next time
        }, 1000 * 60 * 5)
        timeoutIds.current.push(id)
      }
    },
    [], // stable — all live state read via refs
  )

  // Clear pending timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(clearTimeout)
    }
  }, [])

  return {
    permissionState,
    settings,
    handleEnableNotifications,
    handleSkipNotifications,
    toggleNotifications,
    toggleSound,
    scheduleNotifications,
  }
}
