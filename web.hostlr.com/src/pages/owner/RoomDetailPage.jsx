import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Bed, Phone, Mail, User } from 'lucide-react'
import { format } from 'date-fns'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

const STATUS_STYLES = {
  available: 'bg-moss/10 text-moss border-moss/20',
  reserved: 'bg-amber-50 text-amber-700 border-amber-200',
  booked: 'bg-accent/10 text-accent border-accent/20',
}

export default function RoomDetailPage() {
  const { hostelId, roomId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState(null)
  const [expandedSeat, setExpandedSeat] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['owner-room', roomId],
    queryFn: async () => (await api.get(`/up/rooms/${roomId}`)).data,
  })

  useEffect(() => {
    if (data?.room) {
      const r = data.room
      setForm({ name: r.name, pricePerSeat: r.pricePerSeat })
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: () => api.patch(`/up/rooms/${roomId}`, form),
    onSuccess: () => {
      toast.success('Room updated!')
      qc.invalidateQueries({ queryKey: ['owner-room', roomId] })
      qc.invalidateQueries({ queryKey: ['owner-hostel-rooms', hostelId] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/up/rooms/${roomId}`),
    onSuccess: () => {
      toast.success('Room deleted.')
      qc.invalidateQueries({ queryKey: ['owner-hostel-rooms', hostelId] })
      qc.invalidateQueries({ queryKey: ['owner-hostels'] })
      navigate(`/owner/hostels/${hostelId}?tab=rooms`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  })

  if (isLoading || !form) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  )

  const room = data?.room
  const seats = data?.seats || []
  const hostel = data?.hostel
  const available = seats.filter(s => s.status === 'available').length

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(`/owner/hostels/${hostelId}?tab=rooms`)}
            className="p-2 rounded-xl border border-border hover:bg-sand transition text-muted hover:text-ink">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted mb-0.5">{hostel?.name}</p>
            <h1 className="font-display font-bold text-2xl text-ink">{room?.name}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted bg-sand px-3 py-1.5 rounded-xl">
            <Bed size={14} />
            <span>{available}/{seats.length} available</span>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Edit form */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white border border-border rounded-2xl p-5">
              <h2 className="font-semibold text-ink mb-4">Room Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Room Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Price per Seat (PKR/mo)</label>
                  <input type="number" value={form.pricePerSeat} onChange={e => setForm(p => ({ ...p, pricePerSeat: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent text-sm" />
                </div>
              </div>
              <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
                className="mt-5 w-full py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2">
                {updateMutation.isPending ? <Spinner size="sm" /> : 'Save Changes'}
              </button>
            </div>

            <div className="bg-white border border-red-100 rounded-2xl p-5">
              <h2 className="font-semibold text-ink mb-2">Danger Zone</h2>
              <p className="text-muted text-xs mb-4">Deleting this room also removes all its seats permanently.</p>
              <button
                onClick={() => { if (window.confirm(`Delete "${room?.name}"? This cannot be undone.`)) deleteMutation.mutate() }}
                disabled={deleteMutation.isPending}
                className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition flex items-center justify-center gap-2">
                {deleteMutation.isPending ? <Spinner size="sm" /> : 'Delete Room'}
              </button>
            </div>
          </div>

          {/* Seats */}
          <div className="md:col-span-3">
            <div className="bg-white border border-border rounded-2xl p-5">
              <h2 className="font-semibold text-ink mb-4">Seats ({seats.length})</h2>
              <div className="space-y-2">
                {seats.map(seat => {
                  const res = seat.reservation
                  const tenant = res?.finderId
                  const isOpen = expandedSeat === seat._id

                  return (
                    <div key={seat._id}
                      className={`border rounded-xl overflow-hidden transition ${STATUS_STYLES[seat.status] || 'border-border'}`}>
                      <button
                        onClick={() => seat.status !== 'available' ? setExpandedSeat(isOpen ? null : seat._id) : null}
                        className={`w-full flex items-center justify-between px-4 py-3 ${seat.status !== 'available' ? 'cursor-pointer' : 'cursor-default'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            seat.status === 'available' ? 'bg-moss/20 text-moss' :
                            seat.status === 'reserved' ? 'bg-amber-100 text-amber-700' :
                            'bg-accent/20 text-accent'
                          }`}>
                            {seat.label.replace('Bed ', '')}
                          </div>
                          <span className="font-medium text-sm">{seat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize border ${STATUS_STYLES[seat.status]}`}>
                            {seat.status}
                          </span>
                          {seat.status !== 'available' && (
                            <span className="text-xs text-current opacity-60">{isOpen ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </button>

                      {/* Tenant details (expanded) */}
                      {isOpen && tenant && (
                        <div className="px-4 pb-4 border-t border-current/10">
                          <div className="flex items-center gap-3 pt-3">
                            {tenant.avatarUrl ? (
                              <img src={tenant.avatarUrl} alt={tenant.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-current/20 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {tenant.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{tenant.name}</p>
                              <Badge status={res.status} />
                            </div>
                          </div>
                          <div className="mt-3 space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-current/80">
                              <Mail size={13} className="flex-shrink-0" />
                              <span className="truncate">{tenant.email}</span>
                            </div>
                            {tenant.phone && (
                              <div className="flex items-center gap-2 text-current/80">
                                <Phone size={13} className="flex-shrink-0" />
                                <span>{tenant.phone}</span>
                              </div>
                            )}
                            {res.createdAt && (
                              <p className="text-xs text-current/60 mt-2">
                                Reserved {format(new Date(res.createdAt), 'dd MMM yyyy')}
                                {res.expiresAt && ` · Expires ${format(new Date(res.expiresAt), 'dd MMM yyyy')}`}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
