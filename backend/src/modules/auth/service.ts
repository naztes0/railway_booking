import { sql } from '../../config/db.ts'
import bcrypt from 'bcrypt'

// number of bcrypt rounds 
const SALT_ROUNDS = 10

export const authService = {
    async register(email: string, password: string, fullName: string) {
        const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
        if (existing.length > 0) {
            throw new Error('User with this email already exists')
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const [user] = await sql`
      INSERT INTO users (email, password, full_name)
      VALUES (${email}, ${hashedPassword}, ${fullName})
      RETURNING id, email, full_name, created_at
    `
        return user
    },

    async login(email: string, password: string) {
        const [user] = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
        if (!user) {
            throw new Error('Invalid credentials')
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            throw new Error('Invalid credentials')
        }

        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
    },
}