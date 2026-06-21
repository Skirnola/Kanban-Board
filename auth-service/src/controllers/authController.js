import { loginUser, registerUser } from '../services/authService.js'

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body)
    res.status(201).json({ user })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const session = await loginUser(req.body)
    res.json(session)
  } catch (error) {
    next(error)
  }
}
