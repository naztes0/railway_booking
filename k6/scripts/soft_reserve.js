import http from 'k6/http'
import { check } from 'k6'
import { Counter } from 'k6/metrics'
import { BASE_URL, HEADERS, getToken, resetSeat, handleSummary as createSummary } from './utils.js'

const successfulBookings = new Counter('successful_bookings')
const failedBookings = new Counter('failed_bookings')

export let options = {
    vus: 500,
    iterations: 500,
}

export const setup = () => {
    const token = getToken()
    resetSeat(1, 5)
    return { token }
}

export default (data) => {
    const res = http.post(
        `${BASE_URL}/bookings/soft_reserve`,
        JSON.stringify({ tripId: 1, seatId: 5 }),
        { headers: HEADERS(data.token) }
    )

    if (res.status === 201) {
        successfulBookings.add(1)
    } else {
        failedBookings.add(1)
    }

    check(res, {
        'status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    })
}

export const teardown = (data) => {
    resetSeat(1, 5)
}

export const handleSummary = createSummary('soft_reserve')