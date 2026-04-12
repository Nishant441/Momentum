import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Home } from './pages/Home'

type AuthPage = 'login' | 'register'

function App() {
  const { token, user, authError, authLoading, login, register, logout } = useAuth()
  const [authPage, setAuthPage] = useState<AuthPage>('login')

  // Not authenticated — show login or register
  if (!token) {
    if (authPage === 'register') {
      return (
        <Register
          onRegister={register}
          onGoLogin={() => setAuthPage('login')}
          error={authError}
          loading={authLoading}
        />
      )
    }
    return (
      <Login
        onLogin={login}
        onGoRegister={() => setAuthPage('register')}
        error={authError}
        loading={authLoading}
      />
    )
  }

  return <Home token={token} user={user} onLogout={logout} />
}

export default App
