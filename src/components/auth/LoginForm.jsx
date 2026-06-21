import { useState } from 'react'

function LoginForm({ onSubmit, onRegister, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit({ email, password })
    setSubmitting(false)
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="brand-mark">KB</div>
      <h1>Welcome back</h1>
      <p className="muted">Log in to manage your Team Workspace board.</p>

      {error && <div className="alert error">{error}</div>}

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
        />
      </label>

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Logging in...' : 'Login'}
      </button>

      <p className="switch-auth">
        New here?{' '}
        <a href="/register" onClick={onRegister}>
          Create an account
        </a>
      </p>
    </form>
  )
}

export default LoginForm
