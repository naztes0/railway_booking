import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import { env } from '../config/env.ts'
import type { FastifyInstance } from 'fastify'

export default fp(async (app: FastifyInstance) => {
    app.register(fastifyJwt, {
        secret: env.JWT_SECRET,
    })

    app.decorate('authenticate', async (request: any, reply: any) => {
        try {
            await request.jwtVerify()
        } catch {
            reply.code(401).send({ message: 'Unauthorized' })
        }
    })
})