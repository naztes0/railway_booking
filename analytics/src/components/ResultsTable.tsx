import type { AllResults } from '../types'
import { PATTERN_COLORS, PATTERN_LABELS, PATTERNS } from '../types'

interface Props {
    results: AllResults
    vus: number
}

const ResultsTable = ({ results, vus }: Props) => {
    const data = results[vus]

    return (
        <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Detailed Results — {vus} VUs
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-2 pr-4 text-gray-400 font-medium">Pattern</th>
                            <th className="text-right py-2 px-3 text-gray-400 font-medium">Correctness</th>
                            <th className="text-right py-2 px-3 text-gray-400 font-medium">Avg</th>
                            <th className="text-right py-2 px-3 text-gray-400 font-medium">p90</th>
                            <th className="text-right py-2 px-3 text-gray-400 font-medium">p95</th>
                            <th className="text-right py-2 px-3 text-gray-400 font-medium">Max</th>
                            <th className="text-right py-2 pl-3 text-gray-400 font-medium">RPS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {PATTERNS.map((key) => {
                            const v = data?.[key]
                            return (
                                <tr key={key} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-2 pr-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: PATTERN_COLORS[key] }}
                                            />
                                            <span className="font-medium text-gray-800">
                                                {PATTERN_LABELS[key]}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right py-2 px-3">
                                        {v ? (
                                            <span className={v.successfulBookings === 1 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                                                {v.successfulBookings === 1 ? '1/1' : `${v.successfulBookings}`}
                                            </span>
                                        ) : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="text-right py-2 px-3 text-gray-700">
                                        {v ? `${Math.round(v.avgLatency)}ms` : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="text-right py-2 px-3 text-gray-700">
                                        {v ? `${Math.round(v.p90Latency)}ms` : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="text-right py-2 px-3 text-gray-700">
                                        {v ? `${Math.round(v.p95Latency)}ms` : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="text-right py-2 px-3 text-gray-700">
                                        {v ? `${Math.round(v.maxLatency)}ms` : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="text-right py-2 pl-3 text-gray-700">
                                        {v ? Math.round(v.rps) : <span className="text-gray-300">—</span>}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ResultsTable