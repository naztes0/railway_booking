import Fastify from 'fastify'
import cors from '@fastify/cors'
import { sql } from './config/db.ts'
import { env } from './config/env.ts'
import jwtPlugin from './plugins/jwt.ts'
import authRoutes from './modules/auth/routes.ts'
import tripsRoutes from './modules/trips/routes.ts'
import bookingsRoutes from './modules/bookings/routes.ts'
import stationsRoutes from './modules/stations/routes.ts'
import adminRoutes from './modules/admin/routes.ts'


const app = Fastify({
    logger: true,
})

await app.register(cors, {
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://127.0.0.1:5175'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})

// plugins
app.register(jwtPlugin)

//routes
await app.register(authRoutes)
await app.register(tripsRoutes)
await app.register(bookingsRoutes)
await app.register(stationsRoutes)
await app.register(adminRoutes)

const start = async () => {
    try {
        await app.listen({ port: env.PORT, host: '0.0.0.0' })
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()