import { useState } from 'react'
import RegisterForm from '../components/auth/RegisterForm'
import AppLayout from '../components/layout/AppLayout'
import AuthShowcase from '../components/layout/AuthShowcase'
import { useAuth } from '../hooks/useAuth'

function RegisterPage({ navigate }) {
  const { register } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async ({ email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setSuccess('')
      return
    }

    try {
      setError('')
      await register({ email, password })
      setSuccess('Account created. You can now log in.')
      setTimeout(() => navigate('/login'), 800)
    } catch (err) {
      setSuccess('')
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <AppLayout>
      <section className="auth-page">
        <div className="auth-copy">
          <span className="eyebrow">New workspace</span>
          <h2>Create your account and start tracking tasks in seconds.</h2>
          <p>
            Every user sees only their own tasks. The Task Service validates your
            JWT before touching MongoDB.
          </p>
          <AuthShowcase />
        </div>
        <RegisterForm
          onSubmit={handleRegister}
          onLogin={(event) => {
            event.preventDefault()
            navigate('/login')
          }}
          error={error}
          success={success}
        />
      </section>
    </AppLayout>
  )
}

export default RegisterPage
