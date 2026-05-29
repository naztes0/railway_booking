import http from 'k6/http'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

export const BASE_URL = 'http://172.27.80.1:3000'

export const HEADERS = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
})

export const getToken = () => {
    const res = http.post(
        `${BASE_URL}/auth/login`,
        JSON.stringify({ email: 'test@test.com', password: 'password123' }),
        { headers: { 'Content-Type': 'application/json' } }
    )
    return JSON.parse(res.body).token
}

export const resetSeat = (tripId, seatId) => {
    http.del(`${BASE_URL}/admin/reset?tripId=${tripId}&seatId=${seatId}`)
}
export const handleSummary = (patternName) => (data) => {
    const metrics = data.metrics

    const summary = {
        pattern: patternName,
        testedAt: new Date().toISOString(),
        vus: data.options?.vus ?? 500,

        // latency
        avgLatency: metrics.http_req_duration?.values?.avg ?? 0,
        minLatency: metrics.http_req_duration?.values?.min ?? 0,
        maxLatency: metrics.http_req_duration?.values?.max ?? 0,
        p90Latency: metrics.http_req_duration?.values?.['p(90)'] ?? 0,
        p95Latency: metrics.http_req_duration?.values?.['p(95)'] ?? 0,

        // throughput
        rps: metrics.http_reqs?.values?.rate ?? 0,
        totalReqs: metrics.http_reqs?.values?.count ?? 0,

        // correctness
        successfulBookings: metrics.successful_bookings?.values?.count ?? 0,
        failedBookings: metrics.failed_bookings?.values?.count ?? 0,

        // error rate — 500 errors specifically
        errorRate: metrics.http_req_failed?.values?.rate ?? 0,

        // checks
        checksTotal: metrics.checks?.values?.passes + metrics.checks?.values?.fails ?? 0,
        checksPassed: metrics.checks?.values?.passes ?? 0,

        // duration
        totalDuration: metrics.iteration_duration?.values?.max ?? 0,

    }

    // stdout — термінал як завжди
    return {
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
        [`k6/results/${patternName}.json`]: JSON.stringify(summary, null, 2),
    }
}