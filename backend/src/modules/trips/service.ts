import { sql } from '../../config/db.ts'

export const tripsService = {
    async findAll(originId?: number, destinationId?: number, date?: string) {
        return await sql`
      SELECT
        t.id,
        t.departure_at,
        t.arrival_at,
        t.price,
        tr.number AS train_number,
        os.name   AS origin_station,
        ds.name   AS destination_station,
        -- count only seats that are not booked for this trip
        COUNT(s.id) FILTER (
          WHERE NOT EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.seat_id = s.id
              AND b.trip_id = t.id
              AND b.status != 'cancelled'
          )
        ) AS available_seats
      FROM trips t
        JOIN trains  tr ON tr.id = t.train_id
        JOIN routes  r  ON r.id  = t.route_id
        JOIN stations os ON os.id = r.origin_station_id
        JOIN stations ds ON ds.id = r.destination_station_id
        JOIN wagons  w  ON w.train_id = t.train_id
        JOIN seats   s  ON s.wagon_id = w.id
      WHERE
        (${originId ?? null}::int IS NULL OR r.origin_station_id      = ${originId ?? null}::int)
        AND (${destinationId ?? null}::int IS NULL OR r.destination_station_id = ${destinationId ?? null}::int)
        AND (${date ?? null}::date IS NULL OR t.departure_at::date    = ${date ?? null}::date)
      GROUP BY t.id, tr.number, os.name, ds.name
      ORDER BY t.departure_at ASC
    `
    },

    async findById(id: number) {
        const [trip] = await sql`
      SELECT
        t.id,
        t.train_id,
        t.departure_at,
        t.arrival_at,
        t.price,
        tr.number AS train_number,
        os.name   AS origin_station,
        ds.name   AS destination_station
      FROM trips t
        JOIN trains   tr ON tr.id = t.train_id
        JOIN routes   r  ON r.id  = t.route_id
        JOIN stations os ON os.id = r.origin_station_id
        JOIN stations ds ON ds.id = r.destination_station_id
      WHERE t.id = ${id}
    `

        if (!trip) return null

        const wagons = await sql`
      SELECT
        w.id          AS wagon_id,
        w.number      AS wagon_number,
        w.total_seats,
        s.id          AS seat_id,
        s.seat_number,
        EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.seat_id = s.id
            AND b.trip_id = ${id}
            AND b.status != 'cancelled'
        ) AS is_booked
      FROM wagons w
        JOIN seats s ON s.wagon_id = w.id
      WHERE w.train_id = ${trip.train_id}
      ORDER BY w.number ASC, s.seat_number ASC
    `

        return { ...trip, wagons }
    },
}