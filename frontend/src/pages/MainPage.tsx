import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import apiClient from '../api/client'
import { useAuth } from '../context/AuthContext'

interface Station {
    id: number
    name: string
    city: string
}

interface RecentRoute {
    originId: string
    destinationId: string
    originName: string
    destinationName: string
    date: string
    searchedAt: string
}

const MainPage = () => {
    const [stations, setStations] = useState<Station[]>([])
    const [originId, setOriginId] = useState(
        () => sessionStorage.getItem('search_originId') ?? ''
    )
    const [destinationId, setDestinationId] = useState(
        () => sessionStorage.getItem('search_destinationId') ?? ''
    )
    const today = new Date().toISOString().split('T')[0]
    const [date, setDate] = useState(
        () => sessionStorage.getItem('search_date') ?? today
    )
    const [error, setError] = useState('')
    const [recentRoutes, setRecentRoutes] = useState<RecentRoute[]>([])

    const navigate = useNavigate()
    const { user } = useAuth()

    // load stations
    useEffect(() => {
        apiClient.get('/stations').then(({ data }) => setStations(data))
    }, [])

    // load recent routes for current user
    useEffect(() => {
        if (!user) return
        const saved = localStorage.getItem(`recent_routes_${user.id}`)
        if (saved) setRecentRoutes(JSON.parse(saved))
    }, [user])

    // save route to recent — keeps last 2
    const saveRecentRoute = (oId: string, dId: string) => {
        if (!user) return

        const origin = stations.find((s) => String(s.id) === oId)
        const destination = stations.find((s) => String(s.id) === dId)
        if (!origin || !destination) return

        const newRoute: RecentRoute = {
            originId: oId,
            destinationId: dId,
            originName: origin.name,
            destinationName: destination.name,
            date,
            searchedAt: new Date().toISOString(),
        }

        // remove duplicate if same route exists, add new one to front
        const filtered = recentRoutes.filter(
            (r) => !(r.originId === oId && r.destinationId === dId)
        )
        const updated = [newRoute, ...filtered].slice(0, 2)

        setRecentRoutes(updated)
        localStorage.setItem(`recent_routes_${user.id}`, JSON.stringify(updated))
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (originId === destinationId) {
            setError('Origin and destination cannot be the same')
            return
        }

        saveRecentRoute(originId, destinationId)
        navigate(`/trips?originId=${originId}&destinationId=${destinationId}&date=${date}`)
    }

    // fill form from recent route
    const applyRecentRoute = (route: RecentRoute) => {
        setOriginId(route.originId)
        setDestinationId(route.destinationId)
        setDate(route.date)
        sessionStorage.setItem('search_originId', route.originId)
        sessionStorage.setItem('search_destinationId', route.destinationId)
        sessionStorage.setItem('search_date', route.date)
        navigate(`/trips?originId=${route.originId}&destinationId=${route.destinationId}&date=${route.date}`)
    }

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        })

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-5xl mx-auto px-6 pt-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Find your train
                </h1>
                <p className="text-gray-500 mb-10">
                    Search for available trips across Ukraine
                </p>

                <div className="bg-white rounded-2xl shadow-sm pt-6 pb-9 px-8 mb-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    From
                                </label>
                                <select
                                    value={originId}
                                    onChange={(e) => {
                                        setOriginId(e.target.value)
                                        sessionStorage.setItem('search_originId', e.target.value)
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    required
                                >
                                    <option value="">Select station</option>
                                    {stations.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    To
                                </label>
                                <select
                                    value={destinationId}
                                    onChange={(e) => {
                                        setDestinationId(e.target.value)
                                        sessionStorage.setItem('search_destinationId', e.target.value)
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    required
                                >
                                    <option value="">Select station</option>
                                    {stations.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                min={today}
                                onChange={(e) => {
                                    setDate(e.target.value)
                                    sessionStorage.setItem('search_date', e.target.value)
                                }}
                                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            Search trains
                        </button>
                    </form>
                </div>

                {/* recent routes */}
                {recentRoutes.length > 0 && (
                    <div>
                        <h2 className="text-sm font-medium text-gray-500 mb-3">
                            Recently searched
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {recentRoutes.map((route, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => applyRecentRoute(route)}
                                    className="bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {route.originName} → {route.destinationName}
                                        </p>

                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {formatDate(route.date)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default MainPage