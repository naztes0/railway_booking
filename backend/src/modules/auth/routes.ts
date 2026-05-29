import type { FastifyInstance } from 'fastify'
import { authController } from './controller.ts'

export default async function authRoutes(app: FastifyInstance) {
    // public routes
    app.post('/auth/register', authController.register)
    app.post('/auth/login', authController.login)
}