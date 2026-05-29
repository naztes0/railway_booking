import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'


import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MainPage from './pages/MainPage'
import TripsPage from './pages/TripsPage'
import SeatsPage from './pages/SeatsPage'
import MyTicketsPage from './pages/MyTicketsPage'

// protected route — redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={
        <ProtectedRoute><MainPage /></ProtectedRoute>
      } />
      <Route path="/trips" element={
        <ProtectedRoute><TripsPage /></ProtectedRoute>
      } />
      <Route path="/trips/:id/seats" element={
        <ProtectedRoute><SeatsPage /></ProtectedRoute>
      } />
      <Route path="/my-tickets" element={
        <ProtectedRoute><MyTicketsPage /></ProtectedRoute>
      } />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App