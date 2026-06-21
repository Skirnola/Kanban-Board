import { pool } from '../config/db.js'
import { generateToken } from '../utils/generateToken.js'
import { comparePassword, hashPassword } from '../utils/hashPassword.js'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateCredentials = (email, password) => {
  if (!email || !emailRegex.test(email)) {
    const error = new Error('A valid email is required')
    error.statusCode = 400
    throw error
  }

  if (!password || password.length < 6) {
    const error = new Error('Password must be at least 6 characters')
    error.statusCode = 400
    throw error
  }
}

const sanitizeUser = (user) => ({
  id: String(user.id),
  email: user.email,
})

export const registerUser = async ({ email, password }) => {
  validateCredentials(email, password)

  const normalizedEmail = email.toLowerCase().trim()
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [
    normalizedEmail,
  ])

  if (existingUser.rowCount > 0) {
    const error = new Error('Email is already registered')
    error.statusCode = 409
    throw error
  }

  const hashedPassword = await hashPassword(password)
  const result = await pool.query(
    `INSERT INTO users (email, password)
     VALUES ($1, $2)
     RETURNING id, email, created_at, updated_at`,
    [normalizedEmail, hashedPassword],
  )

  return sanitizeUser(result.rows[0])
}

export const loginUser = async ({ email, password }) => {
  validateCredentials(email, password)

  const normalizedEmail = email.toLowerCase().trim()
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [
    normalizedEmail,
  ])

  if (result.rowCount === 0) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const user = result.rows[0]
  const passwordMatches = await comparePassword(password, user.password)

  if (!passwordMatches) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const safeUser = sanitizeUser(user)

  return {
    token: generateToken(safeUser),
    user: safeUser,
  }
}
