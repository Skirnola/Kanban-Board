import jwt from 'jsonwebtoken'

export const generateToken = (user) =>
  jwt.sign(
    {
      id: String(user.id),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
