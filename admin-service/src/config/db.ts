import 'dotenv/config'
import postgres from 'postgres'


export const sql = postgres(process.env.DB_URI as string)