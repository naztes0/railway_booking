import type { FastifyInstance } from 'fastify'
import { tripsController } from './controller.ts'

export default async function tripsRoutes(app: FastifyInstance) {
    // public routes
    app.get('/trips', tripsController.findAll)
    app.get('/trips/:id', tripsController.findById)
}