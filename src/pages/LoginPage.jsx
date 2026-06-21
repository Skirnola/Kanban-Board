import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import AppLayout from '../components/layout/AppLayout'
import AuthShowcase from '../components/layout/AuthShowcase'
import { useAuth } from '../hooks/useAuth'

function LoginPage({ navigate }) {
  const { login } = useAuth()
  const [error, setError] = useState('')

  const handleLogin = async (credentials) => {
    try {
      setError('')
      await login(credentials)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <AppLayout>
      <section className="auth-page">
        <div className="auth-copy">
          <span className="eyebrow">Secure task management</span>
          <h2>Focus work, move faster, and keep your tasks flowing.</h2>
          <p>
            A polished Kanban workspace backed by JWT authentication, PostgreSQL,
            and MongoDB microservices.
          </p>
          <AuthShowcase />
        </div>
        <LoginForm
          onSubmit={handleLogin}
          onRegister={(event) => {
            event.preventDefault()
            navigate('/register')
          }}
          error={error}
        />
      </section>
    </AppLayout>
  )
}

export default LoginPage
