import type { Assignment } from './api'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'



export interface AuthUser {
  id: string
  email: string
}

export interface StreakPayload {
  currentStreak: number
  lastActiveDate: string
  totalTasksCompleted: number
  totalFocusMinutes: number
  badges: string[]
  sprintsToday: number
  sprintsDate: string
}



async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { detail?: string }).detail ?? `Request failed (${res.status})`)
  }
  return data as T
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { detail?: string }).detail ?? `Request failed (${res.status})`)
  }
  return data as T
}

async function put(path: string, body: unknown, token: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { detail?: string }).detail ?? `Request failed (${res.status})`)
  }
}



export async function apiRegister(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return post('/auth/register', { email, password })
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  return post('/auth/login', { email, password })
}

export async function apiMe(token: string): Promise<AuthUser> {
  return get('/auth/me', token)
}



export async function fetchAssignments(token: string): Promise<Assignment[]> {
  const data = await get<{ assignments: Assignment[] }>('/data/assignments', token)
  return data.assignments ?? []
}

export async function syncAssignments(token: string, assignments: Assignment[]): Promise<void> {
  await put('/data/assignments', { assignments }, token)
}

export async function fetchStreak(token: string): Promise<StreakPayload | null> {
  const data = await get<{ streak: StreakPayload | null }>('/data/streak', token)
  return data.streak ?? null
}

export async function syncStreak(token: string, streak: StreakPayload): Promise<void> {
  await put('/data/streak', { streak }, token)
}
