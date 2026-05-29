import type { FastifyRequest, FastifyReply } from 'fastify'
import { tripsService } from './service.ts'

interface TripsQuery {
    originId?: string
    destinationId?: string
    date?: string
}

export const tripsController = {
    async findAll(request: FastifyRequest<{ Querystring: TripsQuery }>, reply: FastifyReply) {
        try {
            const { originId, destinationId, date } = request.query
            const trips = await tripsService.findAll(
                originId ? Number(originId) : undefined,
                destinationId ? Number(destinationId) : undefined,
                date
            )
            reply.send(trips)
        } catch (err: any) {
            reply.code(500).send({ message: err.message })
        }
    },

    async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const trip = await tripsService.findById(Number(request.params.id))
            if (!trip) return reply.code(404).send({ message: 'Trip not found' })
            reply.send(trip)
        } catch (err: any) {
            reply.code(500).send({ message: err.message })
        }
    },
}