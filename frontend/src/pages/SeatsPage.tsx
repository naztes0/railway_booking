import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import apiClient from '../api/client'

interface Seat {
    seat_id: number
    seat_number: number
    is_booked: boolean
}

interface Wagon {
    wagon_id: number
    wagon_number: number
    total_seats: number
    seats: Seat[]
}

interface Trip {
    id: number
    train_number: string
    origin_station: string
    destination_station: string
    departure_at: string
    arrival_at: string
    price: number
    wagons: Wagon[]
}

type BookingPattern = 'constraint' | 'pessimistic' | 'optimistic' | 'soft_reserve'

const SeatsPage = () => {
    const [trip, setTrip] = useState<Trip | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
    const [pattern, setPattern] = useState<BookingPattern>('pessimistic')
    const [booking, setBooking] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const { id } = useParams()
    const navigate = useNavigate()

    const fetchTrip = async () => {
        const { data } = await apiClient.get(`/trips/${id}`)
        const wagonsMap = new Map<number, Wagon>()

        data.wagons.forEach((row: any) => {
            if (!wagonsMap.has(row.wagon_id)) {
                wagonsMap.set(row.wagon_id, {
                    wagon_id: row.wagon_id,
                    wagon_number: row.wagon_number,
                    total_seats: row.total_seats,
                    seats: [],
                })
            }
            wagonsMap.get(row.wagon_id)!.seats.push({
                seat_id: row.seat_id,
                seat_number: row.seat_number,
                is_booked: row.is_booked,
            })
        })

        setTrip({ ...data, wagons: Array.from(wagonsMap.values()) })
    }

    useEffect(() => {
        fetchTrip()
            .catch(() => setError('Failed to load trip'))
            .finally(() => setLoading(false))
    }, [id])

    const toggleSeat = (seat: Seat) => {
        if (seat.is_booked) return
        setSelectedSeats((prev) =>
            prev.find((s) => s.seat_id === seat.seat_id)
                ? prev.filter((s) => s.seat_id !== seat.seat_id)
                : [...prev, seat]
        )
    }

    const handleBook = async () => {
        if (selectedSeats.length === 0) return
        setBooking(true)
        setError('')
        setSuccess('')

        try {
            await Promise.all(
                selectedSeats.map((seat) =>
                    apiClient.post(`/bookings/${pattern}`, {
                        tripId: Number(id),
                        seatId: seat.seat_id,
                    })
                )
            )
            setSuccess(`${selectedSeats.length} seat(s) booked successfully!`)
            setSelectedSeats([])
            await fetchTrip()
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Booking failed')
        } finally {
            setBooking(false)
        }
    }

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    const renderWagon = (wagon: Wagon) => {
        const cols: { top: Seat[], bottom: Seat[] }[] = []

        for (let i = 0; i < wagon.seats.length; i += 5) {
            cols.push({
                top: wagon.seats.slice(i, i + 3),
                bottom: wagon.seats.slice(i + 3, i + 5),
            })
        }

        const getSeatStyle = (seat: Seat) => {
            if (seat.is_booked) return 'bg-gray-300 text-gray-700 cursor-not-allowed'
            if (selectedSeats.find((s) => s.seat_id === seat.seat_id))
                return 'bg-blue-600 text-white'
            return 'bg-white border border-gray-200 text-gray-800 hover:border-blue-400 hover:text-blue-600 cursor-pointer'
        }

        return (
            <div key={wagon.wagon_id} className="mb-8">
                <p className="text-sm font-medium text-gray-700 mb-3">
                    Wagon {wagon.wagon_number}
                </p>

                <div className="bg-gray-100 rounded-2xl border border-gray-300 p-4 overflow-x-auto">
                    <div className="flex gap-2 w-max">
                        {cols.map((col, colIdx) => (
                            <div key={colIdx} className="flex flex-col gap-1">
                                {/* top 3 seats */}
                                <div className="flex flex-col gap-2 mx-2">
                                    {col.top.map((seat) => (
                                        <button
                                            key={seat.seat_id}
                                            onClick={() => toggleSeat(seat)}
                                            disabled={seat.is_booked}
                                            className={`w-11 h-11 rounded-lg text-xs font-medium transition-colors ${getSeatStyle(seat)}`}
                                        >
                                            {seat.seat_number}
                                        </button>
                                    ))}
                                </div>

                                {/* aisle */}
                                <div className="h-11" />

                                {/* bottom 2 seats */}
                                <div className="flex flex-col gap-3">
                                    {col.bottom.map((seat) => (
                                        <button
                                            key={seat.seat_id}
                                            onClick={() => toggleSeat(seat)}
                                            disabled={seat.is_booked}
                                            className={`w-11 h-11 rounded-lg text-xs font-medium transition-colors ${getSeatStyle(seat)}`}
                                        >
                                            {seat.seat_number}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="text-center text-gray-400 py-20">Loading...</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-blue-600 hover:underline mb-6 block cursor-pointer"
                >
                    ← Back to trains
                </button>

                <div className="flex gap-8 items-start">

                    {/* left — wagons and seats */}
                    <div className="flex-1">
                        {/* trip info */}
                        {trip && (
                            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">
                                            {trip.origin_station} → {trip.destination_station}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Train {trip.train_number} · {formatTime(trip.departure_at)} – {formatTime(trip.arrival_at)}
                                        </p>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">₴{trip.price}</p>
                                </div>
                            </div>
                        )}

                        {/* wagons */}
                        {trip?.wagons.map((wagon) => renderWagon(wagon))}
                    </div>

                    {/* right — sticky booking panel */}
                    <div className="w-72 sticky top-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-base font-bold text-gray-900 mb-4">
                                Your order
                            </h2>

                            {/* pattern selector */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                                    Booking pattern
                                </label>
                                <select
                                    value={pattern}
                                    onChange={(e) => setPattern(e.target.value as BookingPattern)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="constraint">DB Constraint</option>
                                    <option value="pessimistic">Pessimistic Lock</option>
                                    <option value="optimistic">Optimistic Lock</option>
                                    <option value="soft_reserve">Soft Reservation</option>
                                </select>
                            </div>

                            {/* selected seats list */}
                            <div className="mb-4 min-h-16">
                                {selectedSeats.length === 0 ? (
                                    <p className="text-sm text-gray-400">No seats selected</p>
                                ) : (
                                    <div className="space-y-1.5 max-h-30 overflow-y-auto pr-2">
                                        {selectedSeats.map((seat) => {
                                            // find wagon for this seat
                                            const wagon = trip?.wagons.find((w) =>
                                                w.seats.find((s) => s.seat_id === seat.seat_id)
                                            )
                                            return (
                                                <div
                                                    key={seat.seat_id}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <span className="text-gray-700">
                                                        W{wagon?.wagon_number} · Seat {seat.seat_number}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleSeat(seat)}
                                                        className="text-red-400 hover:text-red-500 text-xs cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* divider */}
                            <div className="border-t border-gray-100 my-4" />

                            {/* total */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-500">
                                    Total ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
                                </span>
                                <span className="text-lg font-bold text-gray-900">
                                    ₴{((trip?.price ?? 0) * selectedSeats.length).toFixed(2)}
                                </span>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg mb-3 text-xs">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 text-green-600 px-3 py-2 rounded-lg mb-3 text-xs">
                                    {success}
                                </div>
                            )}

                            <button
                                onClick={handleBook}
                                disabled={booking || selectedSeats.length === 0}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                                {booking ? 'Booking...' : 'Book selected seats'}
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

export default SeatsPage