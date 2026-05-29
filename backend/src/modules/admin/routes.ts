import type { FastifyInstance } from 'fastify'
import { sql } from '../../config/db.ts'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const RESULTS_PATH = join(process.cwd(), '..', 'k6', 'results')

const PATTERNS = ['naive', 'constraint', 'pessimistic', 'optimistic', 'soft_reserve']
const VUS_LIST = [5, 10, 50, 100, 500, 1000]

export default async function adminRoutes(app: FastifyInstance) {
  // reset test data between k6 runs — deletes all bookings for a specific seat
  app.delete('/admin/reset', async (request, reply) => {
    const { tripId, seatId } = request.query as { tripId: string, seatId: string }

    await sql`
      DELETE FROM bookings
      WHERE trip_id = ${Number(tripId)}
        AND seat_id = ${Number(seatId)}
    `
    await sql`
      DELETE FROM bookings_naive
      WHERE trip_id = ${Number(tripId)}
        AND seat_id = ${Number(seatId)}
    `
    // reset optimistic locking version
    await sql`
      UPDATE seats SET version = 0
      WHERE id = ${Number(seatId)}
    `

    reply.send({ message: 'Reset successful' })
  })


  // get results for specific pattern and vus
  // GET /admin/results/pessimistic/100
  app.get('/admin/results/:pattern/:vus', async (request, reply) => {
    const { pattern, vus } = request.params as { pattern: string, vus: string }

    if (!PATTERNS.includes(pattern)) {
      return reply.code(400).send({ message: 'Unknown pattern' })
    }

    const filePath = join(RESULTS_PATH, `${pattern}_${vus}.json`)

    if (!existsSync(filePath)) {
      return reply.code(404).send({ message: 'Results not found' })
    }

    reply.send(JSON.parse(readFileSync(filePath, 'utf-8')))
  })

  // get all results grouped by vus
  // GET /admin/results → { 5: { naive: {...}, constraint: {...} }, 10: {...}, ... }
  app.get('/admin/results', async (request, reply) => {
    const results: Record<number, Record<string, any>> = {}

    for (const vus of VUS_LIST) {
      results[vus] = {}
      for (const pattern of PATTERNS) {
        const filePath = join(RESULTS_PATH, `${pattern}_${vus}.json`)
        results[vus][pattern] = existsSync(filePath)
          ? JSON.parse(readFileSync(filePath, 'utf-8'))
          : null
      }
    }

    reply.send(results)
  })
}

