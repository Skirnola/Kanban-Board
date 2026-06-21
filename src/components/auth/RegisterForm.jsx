import { useState } from 'react'

function RegisterForm({ onSubmit, onLogin, error, success }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit({ email, password, confirmPassword })
    setSubmitting(false)
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="brand-mark">KB</div>
      <h1>Create account</h1>
      <p className="muted">Start organizing your work in a personal Kanban board.</p>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

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
          placeholder="Minimum 6 characters"
          minLength="6"
          required
        />
      </label>

      <label>
        Confirm password
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your password"
          minLength="6"
          required
        />
      </label>

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Register'}
      </button>

      <p className="switch-auth">
        Already have an account?{' '}
        <a href="/login" onClick={onLogin}>
          Log in
        </a>
      </p>
    </form>
  )
}

export default RegisterForm
