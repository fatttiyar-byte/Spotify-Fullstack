import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import router from './routes.js'
import { cache } from 'ltcache'
import { createClient } from 'redis'

dotenv.config()

const cacheInstance = cache()

export const redisClient = createClient({
  password: process.env.Redis_Password as string,
  socket: {
    host: 'retrocrisp-acoustics-transport-13471.db.redis.io',
    port: 12028,
    connectTimeout: 10000, 
  }
})


redisClient.on('error', (err) => console.log('Redis Client Error:', err))

redisClient.connect()
  .then(() => console.log('connect to redis✔'))
  .catch((error: any) => console.log('Redis connection failed:', error))

const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/v1', router)

const port = process.env.PORT || 5000

const startServer = async () => {
  app.listen(port, () => {
    console.log(`✅ Server started on http://localhost:${port}`)
  })
}
startServer()