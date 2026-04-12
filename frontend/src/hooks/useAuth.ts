import { useState, useCallback } from 'react'
import { apiLogin, apiRegister, apiMe } from '../lib/authClient'
import type { AuthUser } from '../lib/authClient'

const TOKEN_KEY = 'momentum_token'

export interface AuthState {
  token: string | null
  user: AuthUser | null
  authError: string
  authLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

export function useAuth(): AuthState {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // On first load with a stored token, validate it
  useState(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) return
    apiMe(stored)
      .then((u) => setUser(u))
      .catch(() => {
        // Token expired or invalid — clear it
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
  })

  const _setAuth = useCallback((tok: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, tok)
    setToken(tok)
    setUser(u)
    setAuthError('')
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const { token: tok, user: u } = await apiLogin(email, password)
      _setAuth(tok, u)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setAuthLoading(false)
    }
  }, [_setAuth])

  const register = useCallback(async (email: string, password: string) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const { token: tok, user: u } = await apiRegister(email, password)
      _setAuth(tok, u)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setAuthLoading(false)
    }
  }, [_setAuth])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return { token, user, authError, authLoading, login, register, logout }
}
