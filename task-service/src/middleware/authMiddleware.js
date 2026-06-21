import jwt from 'jsonwebtoken'

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authorization token is required' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      id: String(payload.id),
      email: payload.email,
    }
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
