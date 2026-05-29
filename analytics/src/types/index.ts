export interface PatternResult {
    pattern: string
    vus: number
    testedAt: string
    avgLatency: number
    minLatency: number
    maxLatency: number
    p90Latency: number
    p95Latency: number
    rps: number
    totalReqs: number
    successfulBookings: number
    failedBookings: number
    errorRate: number
    checksTotal: number
    checksPassed: number
    totalDuration: number
}

export type AllResults = Record<number, Record<string, PatternResult | null>>

export const PATTERNS = ['naive', 'constraint', 'pessimistic', 'optimistic', 'soft_reserve']
export const VUS_LIST = [5, 10, 50, 100, 500, 1000]

export const PATTERN_LABELS: Record<string, string> = {
    naive: 'Naive',
    constraint: 'DB Constraint',
    pessimistic: 'Pessimistic Lock',
    optimistic: 'Optimistic Lock',
    soft_reserve: 'Soft Reservation',
}

export const PATTERN_COLORS: Record<string, string> = {
    naive: '#ef4444',
    constraint: '#22c55e',
    pessimistic: '#f97316',
    optimistic: '#3b82f6',
    soft_reserve: '#a855f7',
}