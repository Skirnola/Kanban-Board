import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDb } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import taskRoutes from './routes/taskRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'task-service' })
})

app.use('/tasks', taskRoutes)
app.use(notFound)
app.use(errorHandler)

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Task service running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start task service', error)
    process.exit(1)
  })
