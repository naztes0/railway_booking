import { sql } from '../../config/db.ts'

export const bookingsService = {

    //Naive (no protection)
    // no locks, no version check - just read and write
    // demonstrates race condition: multiple users can book the same seat
    async bookNaive(userId: string, tripId: number, seatId: number) {
        const [existing] = await sql`
      SELECT id FROM bookings_naive
      WHERE trip_id = ${tripId} AND seat_id = ${seatId}
    `
        if (existing) {
            throw { statusCode: 409, message: 'Seat already booked' }
        }

        const [booking] = await sql`
      INSERT INTO bookings_naive (user_id, trip_id, seat_id)
      VALUES (${userId}, ${tripId}, ${seatId})
      RETURNING *
    `
        return booking
    },

    // DB constraint only 
    // no code-level protection — rely entirely on UNIQUE(trip_id, seat_id)
    // db rejects duplicate inserts automatically
    async bookWithConstraint(userId: string, tripId: number, seatId: number) {
        try {
            const [booking] = await sql`
        INSERT INTO bookings (user_id, trip_id, seat_id)
        VALUES (${userId}, ${tripId}, ${seatId})
        RETURNING *
      `
            return booking
        } catch (err: any) {
            // postgres unique violation error code is '23505'
            if (err.code === '23505') {
                throw { statusCode: 409, message: 'Seat already booked' }
            }
            throw err
        }
    },

    // Pessimistic Locking
    // FOR UPDATE locks the seat row until transaction commits
    // other requests wait in queue — guaranteed correctness, lower throughput
    async bookPessimistic(userId: string, tripId: number, seatId: number) {
        try {
            return await sql.begin(async (tx) => {
                const [seat] = await tx`
        SELECT id FROM seats
        WHERE id = ${seatId}
        FOR UPDATE
      `
                if (!seat) {
                    throw { statusCode: 404, message: 'Seat not found' }
                }

                const [existing] = await tx`
        SELECT id FROM bookings
        WHERE trip_id = ${tripId}
          AND seat_id = ${seatId}
          AND status != 'cancelled'
      `
                if (existing) {
                    throw { statusCode: 409, message: 'Seat already booked' }
                }

                const [booking] = await tx`
        INSERT INTO bookings (user_id, trip_id, seat_id)
        VALUES (${userId}, ${tripId}, ${seatId})
        RETURNING *
      `
                return booking
            })
        } catch (err: any) {
            // handle postgres timeout and lock errors as 409
            if (
                err.code === '40001' || // serialization failure
                err.code === '40P01' || // deadlock detected
                err.code === '55P03' || // lock not available
                err.message?.includes('canceling statement')
            ) {
                throw { statusCode: 409, message: 'Seat already booked' }
            }
            throw err
        }
    },

    // Optimistic Locking
    // no locks — read version, then update only if version hasn't changed
    // higher throughput than pessimistic, but losers get 409 immediately
    async bookOptimistic(userId: string, tripId: number, seatId: number) {
        return await sql.begin(async (tx) => {
            const [seat] = await tx`
        SELECT id, version FROM seats
        WHERE id = ${seatId}
      `
            if (!seat) {
                throw { statusCode: 404, message: 'Seat not found' }
            }

            // check if seat is already booked for this trip
            const [existing] = await tx`
        SELECT id FROM bookings
        WHERE trip_id = ${tripId}
          AND seat_id = ${seatId}
          AND status != 'cancelled'
      `
            if (existing) {
                throw { statusCode: 409, message: 'Seat already booked' }
            }

            // update version only if it hasn't changed since was read
            const [updated] = await tx`
        UPDATE seats
        SET version = version + 1
        WHERE id = ${seatId} AND version = ${seat.version}
        RETURNING id
      `

            // if 0 rows updated — someone else changed the version first
            if (!updated) {
                throw { statusCode: 409, message: 'Seat was modified concurrently, try again' }
            }

            const [booking] = await tx`
        INSERT INTO bookings (user_id, trip_id, seat_id)
        VALUES (${userId}, ${tripId}, ${seatId})
        RETURNING *
      `
            return booking
        })
    },

    // Soft Reservation
    // two-step process: reserve for N minutes, then confirm
    // closest to real-world UX (like Tickets.ua)
    // async softReserve(userId: string, tripId: number, seatId: number) {
    //     return await sql.begin(async (tx) => {
    //         const [seat] = await tx`
    //     SELECT id FROM seats
    //     WHERE id = ${seatId}
    //     FOR UPDATE
    //   `
    //         if (!seat) {
    //             throw { statusCode: 404, message: 'Seat not found' }
    //         }

    //         // check for any active reservation or confirmed booking
    //         const [existing] = await tx`
    //     SELECT id FROM bookings
    //     WHERE trip_id = ${tripId}
    //       AND seat_id = ${seatId}
    //       AND status IN ('confirmed', 'reserved')
    //       AND (reserved_until IS NULL OR reserved_until > NOW())
    //   `
    //         if (existing) {
    //             throw { statusCode: 409, message: 'Seat already booked or reserved' }
    //         }

    //         // reserve for 10 minutes
    //         const [booking] = await tx`
    //     INSERT INTO bookings (user_id, trip_id, seat_id, status, reserved_until)
    //     VALUES (
    //       ${userId},
    //       ${tripId},
    //       ${seatId},
    //       'reserved',
    //       NOW() + INTERVAL '10 minutes'
    //     )
    //     RETURNING *
    //   `
    //         return booking
    //     })
    // },

    // // confirm reservation (second step of soft reservation)
    // async confirmReservation(bookingId: string, userId: string) {
    //     const [booking] = await sql`
    //   UPDATE bookings
    //   SET status = 'confirmed', reserved_until = NULL
    //   WHERE id        = ${bookingId}
    //     AND user_id   = ${userId}
    //     AND status    = 'reserved'
    //     AND reserved_until > NOW()
    //   RETURNING *
    // `
    //     if (!booking) {
    //         throw { statusCode: 409, message: 'Reservation expired or not found' }
    //     }
    //     return booking
    // },

    // get all bookings for current user
    async findByUser(userId: string) {
        return await sql`
      SELECT
        b.id,
        b.status,
        b.booked_at,
        b.reserved_until,
        t.departure_at,
        t.arrival_at,
        t.price,
        os.name AS origin_station,
        ds.name AS destination_station,
        tr.number AS train_number,
        w.number  AS wagon_number,
        s.seat_number
      FROM bookings b
        JOIN trips    t  ON t.id  = b.trip_id
        JOIN routes   r  ON r.id  = t.route_id
        JOIN stations os ON os.id = r.origin_station_id
        JOIN stations ds ON ds.id = r.destination_station_id
        JOIN trains   tr ON tr.id = t.train_id
        JOIN seats    s  ON s.id  = b.seat_id
        JOIN wagons   w  ON w.id  = s.wagon_id
      WHERE b.user_id = ${userId}
        AND b.status != 'expired'
      ORDER BY b.booked_at DESC
    `
    },
}