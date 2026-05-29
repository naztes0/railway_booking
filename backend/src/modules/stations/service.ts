import { sql } from '../../config/db.ts'

export const stationsService = {
    async findAll() {
        return await sql`
      SELECT id, name, city
      FROM stations
      ORDER BY city ASC
    `
    },
}