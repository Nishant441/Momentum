import { useState, useCallback, useEffect } from 'react'
import { fetchStreak, syncStreak } from '../lib/authClient'
import type { StreakPayload } from '../lib/authClient'

export type BadgeId = 'first_win' | 'streak_master' | 'sprint_champion'

interface StreakData {
  currentStreak: number
  lastActiveDate: string   // "YYYY-MM-DD"
  totalTasksCompleted: number
  totalFocusMinutes: number
  badges: BadgeId[]
  sprintsToday: number
  sprintsDate: string      // "YYYY-MM-DD" — resets sprintsToday counter
}

const KEY = 'momentum_streak'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function defaults(): StreakData {
  return {
    currentStreak: 0,
    lastActiveDate: '',
    totalTasksCompleted: 0,
    totalFocusMinutes: 0,
    badges: [],
    sprintsToday: 0,
    sprintsDate: '',
  }
}

function load(): StreakData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaults()
    return { ...defaults(), ...JSON.parse(raw) }
  } catch {
    return defaults()
  }
}

function persist(data: StreakData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

/** Reset streak to 0 if last active date is neither today nor yesterday. */
function applyStreakDecay(data: StreakData): StreakData {
  const t = todayStr()
  const y = yesterdayStr()
  if (data.lastActiveDate === t || data.lastActiveDate === y || data.lastActiveDate === '') {
    return data
  }
  return { ...data, currentStreak: 0 }
}

function withBadge(data: StreakData, badge: BadgeId): StreakData {
  if (data.badges.includes(badge)) return data
  return { ...data, badges: [...data.badges, badge] }
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useStreak(token?: string) {
  const [data, setData] = useState<StreakData>(() => {
    const loaded = applyStreakDecay(load())
    persist(loaded)
    return loaded
  })

  // On mount with token: fetch from server and override local state
  useEffect(() => {
    if (!token) return
    fetchStreak(token)
      .then((serverStreak: StreakPayload | null) => {
        if (!serverStreak || Object.keys(serverStreak).length === 0) return
        const merged: StreakData = { ...defaults(), ...serverStreak } as StreakData
        const decayed = applyStreakDecay(merged)
        setData(decayed)
        persist(decayed)
      })
      .catch(() => {}) // fall back to localStorage on network error
  }, [token])

  const update = useCallback(
    (fn: (prev: StreakData) => StreakData) => {
      setData((prev) => {
        const next = fn(prev)
        persist(next)
        // Fire-and-forget server sync
        if (token) {
          syncStreak(token, next as StreakPayload).catch(() => {})
        }
        return next
      })
    },
    [token],
  )

  /** Call when a task is marked complete (Mark Complete & Continue). */
  const recordTaskComplete = useCallback(() => {
    update((prev) => {
      let next = { ...prev }
      const t = todayStr()

      if (next.lastActiveDate !== t) {
        next.currentStreak += 1
        next.lastActiveDate = t
      }

      next.totalTasksCompleted += 1

      if (next.totalTasksCompleted === 1) next = withBadge(next, 'first_win')
      if (next.currentStreak >= 10)       next = withBadge(next, 'streak_master')

      return next
    })
  }, [update])

  /** Call when the countdown timer hits 00:00. */
  const addFocusMinutes = useCallback(
    (minutes: number) => {
      update((prev) => {
        let next = { ...prev }
        next.totalFocusMinutes += minutes

        const t = todayStr()
        if (next.sprintsDate !== t) {
          next.sprintsToday = 0
          next.sprintsDate = t
        }
        next.sprintsToday += 1

        if (next.sprintsToday >= 5) next = withBadge(next, 'sprint_champion')

        return next
      })
    },
    [update],
  )

  // Derive first_win from totalTasksCompleted so it disappears after a
  // localStorage clear rather than being restored from the server's badges array.
  const badges: BadgeId[] = [
    ...(data.totalTasksCompleted > 0 ? (['first_win'] as BadgeId[]) : []),
    ...data.badges.filter((b) => b !== 'first_win'),
  ]

  return {
    streak: data.currentStreak,
    totalTasksCompleted: data.totalTasksCompleted,
    totalFocusMinutes: data.totalFocusMinutes,
    badges,
    recordTaskComplete,
    addFocusMinutes,
  }
}
