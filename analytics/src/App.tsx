import { useState, useEffect } from 'react'
import apiClient from './api/client'
import type { AllResults } from '../src/types'
import {
  PATTERNS, PATTERN_LABELS,
  PATTERN_COLORS, VUS_LIST
} from './types'
import LatencyChart from './components/LatencyChart'
import ThroughputChart from './components/ThroughputChart'
import ResultsTable from './components/ResultsTable'
import MetricCard from './components/MetricCard'

const App = () => {
  const [results, setResults] = useState<AllResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeVus, setActiveVus] = useState<number>(100)
  const [testType, setTestType] = useState<'spike' | 'soak'>('spike')

  const fetchResults = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/admin/results?type=${testType}`)
      setResults(data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchResults() }, [testType])

  // summary cards for active vus tab
  const activeData = results?.[activeVus]

  const bestLatency = activeData
    ? Object.entries(activeData)
      .filter(([k, v]) => v !== null && k !== 'naive')
      .sort(([, a], [, b]) => a!.avgLatency - b!.avgLatency)[0]
    : null

  const bestRps = activeData
    ? Object.entries(activeData)
      .filter(([, v]) => v !== null)
      .sort(([, a], [, b]) => b!.rps - a!.rps)[0]
    : null

  const hasCorrectness = activeData
    ? Object.values(activeData).filter(Boolean).every((v) => v!.successfulBookings <= 1)
    : false

  const naiveIssues = activeData?.naive?.successfulBookings ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              RailWay — Performance Analytics
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Concurrency Pattern Benchmark
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-1 rounded-lg flex items-center">
              <button
                onClick={() => {
                  setTestType('spike')
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${testType === 'spike'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Spike Test
              </button>
              <button
                onClick={() => {
                  setTestType('soak')
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${testType === 'soak'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Soak Test
              </button>
            </div>

            <button
              onClick={fetchResults}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center text-gray-400 py-20">Loading results...</div>
        )}

        {!loading && results && (
          <>
            {/* overview charts — show all VU counts */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Overview — All VU Counts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <LatencyChart
                  results={results}
                  metric="avgLatency"
                  title="Avg Latency vs Load"
                />
                <LatencyChart
                  results={results}
                  metric="p95Latency"
                  title="p95 Latency vs Load"
                />
              </div>
              <ThroughputChart results={results} />
            </div>

            {/* vus tabs */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Detailed View — Select Load
              </h2>
              <div className="flex gap-2 flex-wrap mb-6">
                {VUS_LIST.map((vus) => (
                  <button
                    key={vus}
                    onClick={() => setActiveVus(vus)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeVus === vus
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                      }`}
                  >
                    {vus} VUs
                  </button>
                ))}
              </div>

              {/* metric cards for active vus */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <MetricCard
                  label="Best Avg Latency"
                  value={bestLatency ? `${Math.round(bestLatency[1]!.avgLatency)}ms` : '—'}
                  sub={bestLatency ? PATTERN_LABELS[bestLatency[0]] : undefined}
                  color="#3b82f6"
                />
                <MetricCard
                  label="Best RPS"
                  value={bestRps ? Math.round(bestRps[1]!.rps) : '—'}
                  sub={bestRps ? PATTERN_LABELS[bestRps[0]] : undefined}
                  color="#22c55e"
                />
                <MetricCard
                  label="Data Correctness"
                  value={hasCorrectness ? 'Pass' : 'Check'}
                  sub="protected patterns"
                  color={hasCorrectness ? '#22c55e' : '#f97316'}
                />
                <MetricCard
                  label="Naive Race Condition"
                  value={naiveIssues > 1 ? `${naiveIssues} sold` : naiveIssues === 1 ? 'Lucky 1' : '—'}
                  sub="expected: > 1 at high load"
                  color={naiveIssues > 1 ? '#ef4444' : '#f97316'}
                />
              </div>

              {/* pattern cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                {PATTERNS.map((key) => {
                  const v = activeData?.[key]
                  return (
                    <div
                      key={key}
                      className="bg-white rounded-xl shadow-sm p-4 border-t-4"
                      style={{ borderColor: PATTERN_COLORS[key] }}
                    >
                      <p className="text-xs font-semibold text-gray-500 mb-3">
                        {PATTERN_LABELS[key]}
                      </p>
                      {v ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Avg</span>
                            <span className="font-medium">{Math.round(v.avgLatency)}ms</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">p95</span>
                            <span className="font-medium">{Math.round(v.p95Latency)}ms</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">RPS</span>
                            <span className="font-medium">{Math.round(v.rps)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Sold</span>
                            <span className={`font-medium ${v.successfulBookings === 1 ? 'text-green-600' : 'text-red-500'}`}>
                              {v.successfulBookings}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-300">No data</p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* detailed table */}
              <ResultsTable results={results} vus={activeVus} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App