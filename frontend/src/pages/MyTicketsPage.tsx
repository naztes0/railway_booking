import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import apiClient from '../api/client'

interface Ticket {
    id: string
    status: string
    booked_at: string
    reserved_until: string | null
    departure_at: string
    arrival_at: string
    price: number
    origin_station: string
    destination_station: string
    train_number: string
    wagon_number: number
    seat_number: number
}

const MyTicketsPage = () => {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        apiClient
            .get('/bookings/my')
            .then(({ data }) => setTickets(data))
            .catch(() => setError('Failed to load tickets'))
            .finally(() => setLoading(false))
    }, [])

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        })

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-50 text-green-600'
            case 'reserved': return 'bg-yellow-50 text-yellow-600'
            case 'expired': return 'bg-gray-100 text-gray-400'
            case 'cancelled': return 'bg-red-50 text-red-400'
            default: return 'bg-gray-100 text-gray-400'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My tickets</h1>

                {loading && (
                    <div className="text-center text-gray-400 py-20">Loading...</div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && tickets.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 mb-4">No tickets yet</p>
                        <button
                            onClick={() => navigate('/')}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            Find a train →
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <div key={ticket.id} className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between">

                                {/* route and time */}
                                <div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {ticket.origin_station} → {ticket.destination_station}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatDate(ticket.departure_at)} · {formatTime(ticket.departure_at)} – {formatTime(ticket.arrival_at)}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Train {ticket.train_number} · Wagon {ticket.wagon_number} · Seat {ticket.seat_number}
                                    </p>
                                </div>

                                {/* price and status */}
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600 mb-2">
                                        ₴{ticket.price}
                                    </p>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusStyle(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>

                            </div>

                            {/* reserved_until timer for soft reservation */}
                            {ticket.status === 'reserved' && ticket.reserved_until && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-yellow-600">
                                        Reserved until {new Date(ticket.reserved_until).toLocaleTimeString('en-GB', {
                                            hour: '2-digit', minute: '2-digit'
                                        })} — confirm your booking before it expires
                                    </p>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default MyTicketsPage