import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import apiClient from '../api/client'

interface Trip {
    id: number
    departure_at: string
    arrival_at: string
    price: number
    train_number: string
    origin_station: string
    destination_station: string
    available_seats: number
}

const TripsPage = () => {
    const [trips, setTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const originId = searchParams.get('originId')
        const destinationId = searchParams.get('destinationId')
        const date = searchParams.get('date')

        apiClient
            .get('/trips', { params: { originId, destinationId, date } })
            .then(({ data }) => setTrips(data))
            .catch(() => setError('Failed to load trips'))
            .finally(() => setLoading(false))
    }, [searchParams])

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

    const getDuration = (departure: string, arrival: string) => {
        const diff = new Date(arrival).getTime() - new Date(departure).getTime()
        const hours = Math.floor(diff / 3600000)
        const minutes = Math.floor((diff % 3600000) / 60000)
        return `${hours}h ${minutes}m`
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-10">
                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-blue-600 hover:underline mb-6 block cursor-pointer"
                >
                    ← Back to search
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Available trains
                </h1>

                {loading && (
                    <div className="text-center text-gray-400 py-20">Loading...</div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && trips.length === 0 && (
                    <div className="text-center text-gray-400 py-20">
                        No trains found for this route and date
                    </div>
                )}

                <div className="space-y-4">
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            className="bg-white rounded-2xl shadow-sm p-8"
                        >
                            <div className="flex items-center justify-between">
                                {/* route and time */}
                                <div className="flex items-center gap-12 ">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatTime(trip.departure_at)}
                                        </p>
                                        <p className="text-m text-gray-600">{trip.origin_station}</p>
                                    </div>

                                    <div className="text-center flex flex-row items-center gap-1">
                                        <div className="w-30 h-px bg-gray-300 relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            {getDuration(trip.departure_at, trip.arrival_at)}
                                        </p>
                                        <div className="w-30 h-px bg-gray-300 relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatTime(trip.arrival_at)}
                                        </p>
                                        <p className="text-m  text-gray-600">{trip.destination_station}</p>
                                    </div>
                                </div>

                                {/* price and seats */}
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">
                                        ₴{trip.price}
                                    </p>
                                    <p className="text-sm text-gray-400 mb-3">
                                        {trip.available_seats} seats available
                                    </p>
                                    <Link
                                        to={`/trips/${trip.id}/seats`}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Select seat
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
                                <span className="text-xs font-bold text-gray-600">
                                    {formatDate(trip.departure_at)}
                                </span>
                                <span className="text-xs text-gray-500">
                                    Train {trip.train_number}
                                </span>

                            </div>
                        </div>
                    ))}
                </div>
            </main >
        </div >
    )
}

export default TripsPage