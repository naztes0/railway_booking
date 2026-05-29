import type { FastifyInstance } from 'fastify'
import { bookingsController } from './controller.ts'

export default async function bookingsRoutes(app: FastifyInstance) {
    // all booking routes require authentication
    const auth = { onRequest: [app.authenticate] }

    // 5 patterns, each has its own endpoint
    app.post('/bookings/naive', auth, bookingsController.bookNaive)
    app.post('/bookings/constraint', auth, bookingsController.bookWithConstraint)
    app.post('/bookings/pessimistic', auth, bookingsController.bookPessimistic)
    app.post('/bookings/optimistic', auth, bookingsController.bookOptimistic)
    app.post('/bookings/soft_reserve', auth, bookingsController.softReserve)

    // confirm soft reservation
    app.patch('/bookings/:id/confirm', auth, bookingsController.confirmReservation)

    // get current user bookings
    app.get('/bookings/my', auth, bookingsController.findByUser)
}