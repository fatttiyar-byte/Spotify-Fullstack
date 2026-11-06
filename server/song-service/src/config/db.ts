import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DB_URL

if (!connectionString) {
  throw new Error('DB_URL environment variable is missing')
}

export const sql = postgres(connectionString)