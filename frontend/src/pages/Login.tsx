import { useState } from 'react'

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>
  onGoRegister: () => void
  error: string
  loading: boolean
}

export function Login({ onLogin, onGoRegister, error, loading }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) onLogin(email, password)
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {}
        <div className="text-center">
          <h1 className="font-display font-bold text-5xl text-text-primary tracking-normal leading-none">
            Momentum
          </h1>
          <p className="text-sm text-text-secondary mt-2">Stop overthinking. Start doing.</p>
        </div>

        {}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary font-medium uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="rounded-2xl border border-border bg-card-bg px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-action transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary font-medium uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-2xl border border-border bg-card-bg px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-action transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-danger-text rounded-xl border border-danger-text/30 bg-danger-bg px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!email || !password || loading}
            className="rounded-2xl bg-action py-3.5 font-semibold text-base text-text-inverse transition-all hover:bg-action-hover active:bg-action-pressed disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-text-inverse/30 border-t-text-inverse animate-spin" />
                Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          No account?{' '}
          <button
            onClick={onGoRegister}
            className="text-action hover:underline underline-offset-2 font-medium"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  )
}
