import type { FastifyRequest, FastifyReply } from 'fastify'
import { authService } from './service.ts'


interface RegisterBody {
    email: string
    password: string
    fullName: string
}

interface LoginBody {
    email: string
    password: string
}

export const authController = {
    async register(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
        try {
            const { email, password, fullName } = request.body
            const user = await authService.register(email, password, fullName)
            reply.code(201).send(user)
        } catch (err: any) {
            reply.code(400).send({ message: err.message })
        }
    },

    async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
        try {
            const { email, password } = request.body
            const user = await authService.login(email, password)

            // generate JWT token with user id and email as payload
            const token = await reply.jwtSign(
                { id: user.id, email: user.email },
                { expiresIn: '7d' }
            )

            reply.send({ token, user })
        } catch (err: any) {
            reply.code(401).send({ message: err.message })
        }
    },
}