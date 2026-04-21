import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store/authStore'

// Pages
import LandingPage from './pages/public/LandingPage'
import BrowsePage from './pages/public/BrowsePage'
import HostelDetailPage from './pages/public/HostelDetailPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import MyReservationsPage from './pages/finder/MyReservationsPage'
import MyChatsPage from './pages/finder/MyChatsPage'
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage'
import ManageHostelsPage from './pages/owner/ManageHostelsPage'
import HostelEditPage from './pages/owner/HostelEditPage'
import RoomDetailPage from './pages/owner/RoomDetailPage'
import IncomingReservationsPage from './pages/owner/IncomingReservationsPage'
import OwnerChatsPage from './pages/owner/OwnerChatsPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminHostelsPage from './pages/admin/AdminHostelsPage'
import AdminReservationsPage from './pages/admin/AdminReservationsPage'

function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/auth/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/hostel/:id" element={<HostelDetailPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Finder */}
        <Route path="/me/reservations" element={<ProtectedRoute roles={['finder']}><MyReservationsPage /></ProtectedRoute>} />
        <Route path="/me/chats" element={<ProtectedRoute roles={['finder']}><MyChatsPage /></ProtectedRoute>} />

        {/* Owner */}
        <Route path="/owner/dashboard" element={<ProtectedRoute roles={['owner']}><OwnerDashboardPage /></ProtectedRoute>} />
        <Route path="/owner/hostels" element={<ProtectedRoute roles={['owner']}><ManageHostelsPage /></ProtectedRoute>} />
        <Route path="/owner/hostels/:id" element={<ProtectedRoute roles={['owner']}><HostelEditPage /></ProtectedRoute>} />
        <Route path="/owner/hostels/:hostelId/rooms/:roomId" element={<ProtectedRoute roles={['owner']}><RoomDetailPage /></ProtectedRoute>} />
        <Route path="/owner/reservations" element={<ProtectedRoute roles={['owner']}><IncomingReservationsPage /></ProtectedRoute>} />
        <Route path="/owner/chats" element={<ProtectedRoute roles={['owner']}><OwnerChatsPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/hostels" element={<ProtectedRoute roles={['admin']}><AdminHostelsPage /></ProtectedRoute>} />
        <Route path="/admin/reservations" element={<ProtectedRoute roles={['admin']}><AdminReservationsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
