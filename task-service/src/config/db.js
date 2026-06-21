import 'dotenv/config'
import mongoose from 'mongoose'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const connectDb = async (attempt = 1) => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  } catch (error) {
    if (attempt >= 12) {
      throw error
    }

    console.log(`Waiting for MongoDB... retry ${attempt}/12`)
    await sleep(2500)
    return connectDb(attempt + 1)
  }
}
