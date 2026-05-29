import http from 'k6/http'
import { check } from 'k6'
import { Counter } from 'k6/metrics'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

const BASE_URL = 'http://172.27.80.1:3000'

const HEADERS = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
})


const PATTERN = __ENV.PATTERN
const VUS = parseInt(__ENV.VUS)

const SEAT_MAP = {
    naive: 1,
    constraint: 2,
    pessimistic: 3,
    optimistic: 4,
    soft_reserve: 5,
}

const TRIP_ID = 1
const SEAT_ID = SEAT_MAP[PATTERN]

const successfulBookings = new Counter('successful_bookings')
const failedBookings = new Counter('failed_bookings')

export let options = {
    scenarios: {
        test: {
            executor: 'per-vu-iterations', //constant-vu-iterator 
            vus: VUS,
            iterations: 1,
        },
    },
}

export const setup = () => {
    const requests = []
    for (let i = 1; i <= VUS; i++) {
        requests.push({
            method: 'POST',
            url: `${BASE_URL}/auth/login`,
            body: JSON.stringify({
                email: `testuser${i}@test.com`,
                password: 'password',
            }),
            params: { headers: { 'Content-Type': 'application/json' } },
        })
    }

    const responses = http.batch(requests)
    const tokens = responses.map((res) => JSON.parse(res.body).token)

    http.del(`${BASE_URL}/admin/reset?tripId=${TRIP_ID}&seatId=${SEAT_ID}`)

    return { tokens }
}

export default (data) => {
    const token = data.tokens[(__VU - 1) % data.tokens.length]

    const res = http.post(
        `${BASE_URL}/bookings/${PATTERN}`,
        JSON.stringify({ tripId: TRIP_ID, seatId: SEAT_ID }),
        { headers: HEADERS(token) }
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
    http.del(`${BASE_URL}/admin/reset?tripId=${TRIP_ID}&seatId=${SEAT_ID}`)
}

export const handleSummary = (data) => {
    const metrics = data.metrics

    const summary = {
        pattern: PATTERN,
        vus: VUS,
        testedAt: new Date().toISOString(),
        avgLatency: metrics.http_req_duration?.values?.avg ?? 0,
        minLatency: metrics.http_req_duration?.values?.min ?? 0,
        maxLatency: metrics.http_req_duration?.values?.max ?? 0,
        p90Latency: metrics.http_req_duration?.values?.['p(90)'] ?? 0,
        p95Latency: metrics.http_req_duration?.values?.['p(95)'] ?? 0,
        rps: metrics.http_reqs?.values?.rate ?? 0,
        totalReqs: metrics.http_reqs?.values?.count ?? 0,
        successfulBookings: metrics.successful_bookings?.values?.count ?? 0,
        failedBookings: metrics.failed_bookings?.values?.count ?? 0,
        errorRate: metrics.http_req_failed?.values?.rate ?? 0,
        checksTotal: (metrics.checks?.values?.passes ?? 0) + (metrics.checks?.values?.fails ?? 0),
        checksPassed: metrics.checks?.values?.passes ?? 0,
        totalDuration: metrics.iteration_duration?.values?.max ?? 0,
    }

    return {
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
        [`k6/results/${PATTERN}_${VUS}.json`]: JSON.stringify(summary, null, 2),
    }
}