import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import type { AllResults } from '../types'
import { PATTERN_COLORS, PATTERN_LABELS, PATTERNS, VUS_LIST } from '../types'

interface Props {
    results: AllResults
    metric: 'avgLatency' | 'p95Latency' | 'p90Latency'
    title: string
}

const LatencyChart = ({ results, metric, title }: Props) => {
    // build data points: x = vus, y = latency per pattern
    const data = VUS_LIST.map((vus) => {
        const point: Record<string, any> = { vus }
        PATTERNS.forEach((p) => {
            point[p] = results[vus]?.[p]?.[metric]
                ? Math.round(results[vus][p]![metric])
                : null
        })
        return point
    })

    return (
        <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="vus"
                        tick={{ fontSize: 11 }}
                        label={{ value: 'VUs', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} unit="ms" />
                    <Tooltip formatter={(val) => val ? `${val}ms` : 'N/A'} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {PATTERNS.map((p) => (
                        <Line
                            key={p}
                            type="monotone"
                            dataKey={p}
                            name={PATTERN_LABELS[p]}
                            stroke={PATTERN_COLORS[p]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            connectNulls
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default LatencyChart