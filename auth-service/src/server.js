import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { initDb } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' })
})

app.use('/auth', authRoutes)
app.use(notFound)
app.use(errorHandler)

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start auth service', error)
    process.exit(1)
  })
