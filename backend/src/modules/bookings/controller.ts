import type { RouteHandler } from 'fastify'
import { bookingsService } from './service.ts'

interface BookingBody {
    tripId: number
    seatId: number
}

export const bookingsController = {
    bookNaive: (async (request, reply) => {
        try {
            console.log('user:', request.user)
            console.log('body:', request.body)
            const { tripId, seatId } = request.body as BookingBody
            const userId = (request.user as any).id
            const booking = await bookingsService.bookNaive(userId, tripId, seatId)
            reply.code(201).send(booking)
        } catch (err: any) {
            reply.code(err.statusCode ?? 500).send({ message: err.message })
        }
    }) as RouteHandler,

    bookWithConstraint: (async (request, reply) => {
        try {
            const { tripId, seatId } = request.body as BookingBody
            const userId = (request.user as any).id
            const booking = await bookingsService.bookWithConstraint(userId, tripId, seatId)
            reply.code(201).send(booking)
        } catch (err: any) {
            reply.code(err.statusCode ?? 500).send({ message: err.message })
        }
    }) as RouteHandler,

    bookPessimistic: (async (request, reply) => {
        try {
            const { tripId, seatId } = request.body as BookingBody
            const userId = (request.user as any).id
            const booking = await bookingsService.bookPessimistic(userId, tripId, seatId)
            reply.code(201).send(booking)
        } catch (err: any) {
            console.log('PESSIMISTIC ERROR:', err.code, err.message)
            reply.code(err.statusCode ?? 500).send({ message: err.message })
        }
    }) as RouteHandler,

    bookOptimistic: (async (request, reply) => {
        try {
            const { tripId, seatId } = request.body as BookingBody
            const userId = (request.user as any).id
            const booking = await bookingsService.bookOptimistic(userId, tripId, seatId)
            reply.code(201).send(booking)
        } catch (err: any) {
            reply.code(err.statusCode ?? 500).send({ message: err.message })
        }
    }) as RouteHandler,

    findByUser: (async (request, reply) => {
        try {
            const userId = (request.user as any).id
            const bookings = await bookingsService.findByUser(userId)
            reply.send(bookings)
        } catch (err: any) {
            reply.code(500).send({ message: err.message })
        }
    }) as RouteHandler,
}