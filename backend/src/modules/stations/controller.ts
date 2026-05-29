import type { RouteHandler } from 'fastify'
import { stationsService } from './service.ts'

export const stationsController = {
    findAll: (async (request, reply) => {
        try {
            const stations = await stationsService.findAll()
            reply.send(stations)
        } catch (err: any) {
            reply.code(500).send({ message: err.message })
        }
    }) as RouteHandler,
}