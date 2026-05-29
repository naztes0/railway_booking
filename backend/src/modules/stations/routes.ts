import type { FastifyInstance } from 'fastify'
import { stationsController } from './controller.ts'

export default async function stationsRoutes(app: FastifyInstance) {
    // public route
    app.get('/stations', stationsController.findAll)
}