import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-xl font-bold text-blue-600">
                    RailWay
                </Link>

                <nav className="flex items-center gap-6">
                    <Link
                        to="/my-tickets"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        My tickets
                    </Link>

                    <span className="text-sm text-gray-500">
                        {user?.full_name}
                    </span>

                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </nav>
            </div>
        </header>
    )
}

export default Header