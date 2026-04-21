import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import PageTransition from '../../components/ui/PageTransition'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import SeatGrid from '../../components/reservation/SeatGrid'

const AMENITY_ICONS = { wifi: '📶', meals: '🍽️', ac: '❄️', laundry: '👕', 'study-room': '📚', parking: '🚗', security: '🔒', generator: '⚡' }

export default function HostelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuthStore()
  const qc = useQueryClient()
  const [imgIdx, setImgIdx] = useState(0)
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['hostel', id],
    queryFn: async () => (await api.get(`/up/browse/hostels/${id}`)).data,
  })

  const chatMutation = useMutation({
    mutationFn: () => api.post('/up/chat/conversations', { hostelId: id }),
    onSuccess: () => navigate('/me/chats'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to start chat.'),
  })

  const reserveMutation = useMutation({
    mutationFn: (seatId) => api.post('/up/reservations', { seatId }),
    onSuccess: () => {
      toast.success('Seat reserved! You have 48 hours to move in.')
      setShowModal(false)
      setSelectedSeat(null)
      qc.invalidateQueries(['hostel', id])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reservation failed.'),
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!data?.hostel) return <div className="min-h-screen flex items-center justify-center text-muted">Hostel not found</div>

  const { hostel, rooms } = data
  const images = hostel.images?.length ? hostel.images : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80']

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Image gallery */}
        <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 mb-8 bg-sand">
          <img src={images[imgIdx]} alt={hostel.name} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-2 h-2 rounded-full transition ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
          {images.length > 1 && (
            <>
              <button onClick={() => setImgIdx(p => (p - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center text-ink transition">‹</button>
              <button onClick={() => setImgIdx(p => (p + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center text-ink transition">›</button>
            </>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex gap-2 mb-2">
              <Badge status={hostel.gender} />
              <Badge status={hostel.status} />
            </div>
            <h1 className="font-display font-bold text-3xl text-ink">{hostel.name}</h1>
            <p className="text-muted mt-1">📍 {hostel.address}, {hostel.city}</p>
            {hostel.ownerId && (
              <p className="text-sm text-muted mt-1">Listed by {hostel.ownerId.name} · {hostel.ownerId.phone}</p>
            )}
          </div>
          <div className="flex gap-3">
            {token && user?.role === 'finder' && (
              <button onClick={() => chatMutation.mutate()}
                disabled={chatMutation.isPending}
                className="px-5 py-2.5 border border-ink text-ink hover:bg-sand rounded-xl font-medium transition text-sm">
                💬 Chat with Owner
              </button>
            )}
            {!token && (
              <button onClick={() => navigate('/auth/login')}
                className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium transition text-sm hover:bg-accent-dark">
                Sign in to Reserve
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {hostel.description && <p className="text-gray-600 mb-6">{hostel.description}</p>}

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-8">
          {hostel.amenities?.map(a => (
            <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-sand rounded-full text-sm text-ink">
              {AMENITY_ICONS[a] || '✓'} {a}
            </span>
          ))}
        </div>

        {/* Rooms */}
        <h2 className="font-display font-bold text-2xl text-ink mb-4">Rooms & Availability</h2>
        <div className="space-y-4">
          {rooms?.map(room => (
            <div key={room._id} className="border border-border rounded-2xl p-5 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-ink text-lg">{room.name}</h3>
                  <p className="text-accent font-bold text-xl mt-0.5">
                    PKR {new Intl.NumberFormat('en-PK').format(room.pricePerSeat)}
                    <span className="text-sm font-normal text-muted">/mo per seat</span>
                  </p>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${room.availableSeats > 0 ? 'bg-moss/10 text-moss' : 'bg-gray-100 text-muted'}`}>
                  {room.availableSeats} available
                </span>
              </div>
              <SeatGrid
                seats={room.seats || []}
                canReserve={!!token && user?.role === 'finder'}
                onReserve={(seat) => { setSelectedSeat({ ...seat, roomName: room.name }); setShowModal(true) }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Modal */}
      <AnimatePresence>
        {showModal && selectedSeat && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3 className="font-display font-bold text-xl text-ink mb-2">Confirm Reservation</h3>
              <p className="text-muted text-sm mb-4">
                You are about to reserve <strong>{selectedSeat.label}</strong> in <strong>{selectedSeat.roomName}</strong>.
              </p>
              <div className="bg-sand rounded-xl p-4 mb-6 text-sm">
                <p className="font-medium text-ink mb-1">⏱ 48-hour window</p>
                <p className="text-muted">The seat will be held for 48 hours. If the owner doesn't confirm your arrival, it will be released automatically. No online payment required.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-muted hover:bg-sand transition">Cancel</button>
                <button onClick={() => reserveMutation.mutate(selectedSeat._id)}
                  disabled={reserveMutation.isPending}
                  className="flex-1 py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
                  {reserveMutation.isPending ? <Spinner size="sm" /> : 'Reserve Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </PageTransition>
  )
}
