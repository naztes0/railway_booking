import postgres from 'postgres'
import { env } from './env.ts'

export const sql = postgres(env.DATABASE_URL, {
    max: 100,
    idle_timeout: 30,
    connect_timeout: 10
})