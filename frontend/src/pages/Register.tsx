import { useState } from 'react'

interface RegisterProps {
  onRegister: (email: string, password: string) => Promise<void>
  onGoLogin: () => void
  error: string
  loading: boolean
}

export function Register({ onRegister, onGoLogin, error, loading }: RegisterProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setLocalError('Passwords don\u2019t match')
      return
    }
    onRegister(email, password)
  }

  const displayError = localError || error

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Brand */}
        <div className="text-center">
          <h1 className="font-display font-bold text-5xl text-text-primary tracking-normal leading-none">
            Momentum
          </h1>
          <p className="text-sm text-text-secondary mt-2">Your assignments. Your streak. Everywhere.</p>
        </div>

        {/* Form */}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters"
              className="rounded-2xl border border-border bg-card-bg px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-action transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary font-medium uppercase tracking-wide">
              Confirm Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="rounded-2xl border border-border bg-card-bg px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-action transition-colors"
            />
          </div>

          {displayError && (
            <p className="text-sm text-danger-text rounded-xl border border-danger-text/30 bg-danger-bg px-4 py-2.5">
              {displayError}
            </p>
          )}

          <button
            type="submit"
            disabled={!email || !password || !confirm || loading}
            className="rounded-2xl bg-action py-3.5 font-semibold text-base text-text-inverse transition-all hover:bg-action-hover active:bg-action-pressed disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-text-inverse/30 border-t-text-inverse animate-spin" />
                Creating account…
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <button
            onClick={onGoLogin}
            className="text-action hover:underline underline-offset-2 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
