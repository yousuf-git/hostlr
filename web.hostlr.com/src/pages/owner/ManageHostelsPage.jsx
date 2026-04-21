import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Home, MapPin, DoorOpen, CheckCircle } from 'lucide-react'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const AMENITIES = ['wifi', 'meals', 'ac', 'laundry', 'study-room', 'parking', 'security', 'generator']

const EMPTY_FORM = { name: '', city: '', address: '', gender: 'male', description: '', amenities: [] }
const EMPTY_ROOM = { name: '', totalSeats: '', pricePerSeat: '' }

export default function ManageHostelsPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [showRoom, setShowRoom] = useState(null) // hostelId
  const [form, setForm] = useState(EMPTY_FORM)
  const [roomForm, setRoomForm] = useState(EMPTY_ROOM)

  const { data, isLoading } = useQuery({
    queryKey: ['owner-hostels'],
    queryFn: async () => (await api.get('/up/hostels/mine?size=50')).data,
  })

  const addHostelMutation = useMutation({
    mutationFn: () => api.post('/up/hostels', form),
    onSuccess: () => { toast.success('Hostel created!'); qc.invalidateQueries(['owner-hostels']); setShowAdd(false); setForm(EMPTY_FORM) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  })

  const addRoomMutation = useMutation({
    mutationFn: (hostelId) => api.post(`/up/hostels/${hostelId}/rooms`, roomForm),
    onSuccess: () => { toast.success('Room added!'); qc.invalidateQueries(['owner-hostels']); setShowRoom(null); setRoomForm(EMPTY_ROOM) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  })

  const toggleAmenity = (a) => setForm(p => ({
    ...p, amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a]
  }))

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl text-ink">My Hostels</h1>
          <button onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-medium transition text-sm">
            + Add Hostel
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : data?.hostels?.length === 0 ? (
          <EmptyState icon={<Home size={48} />} title="No hostels yet" description="Add your first hostel to get started."
            action={<button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-accent text-white rounded-xl text-sm">Add Hostel</button>} />
        ) : (
          <div className="space-y-4">
            {data?.hostels?.map(h => (
              <motion.div key={h._id} className="bg-white border border-border rounded-2xl p-5"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex gap-2 mb-1"><Badge status={h.gender} /><Badge status={h.status} /></div>
                    <h3 className="font-semibold text-ink text-lg">{h.name}</h3>
                    <p className="text-sm text-muted flex items-center gap-1"><MapPin size={12} />{h.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowRoom(h._id)}
                      className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-sand transition">+ Room</button>
                    <Link to={`/owner/hostels/${h._id}`}
                      className="px-3 py-1.5 text-sm bg-ink text-white rounded-lg hover:bg-ink/80 transition">Edit</Link>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted">
                  <Link to={`/owner/hostels/${h._id}?tab=rooms`} className="flex items-center gap-1 hover:text-accent transition">
                    <DoorOpen size={13} />{h.roomCount || 0} rooms
                  </Link>
                  <span className="flex items-center gap-1"><CheckCircle size={13} className="text-moss" />{h.availableSeats || 0} seats available</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Hostel Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full my-4">
            <h3 className="font-display font-bold text-xl text-ink mb-5">Add New Hostel</h3>
            <div className="space-y-4">
              {[['Hostel Name', 'name', 'text'], ['City', 'city', 'text'], ['Address', 'address', 'text']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-ink mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Gender</label>
                <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="coed">Co-ed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(a => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1 rounded-full text-sm transition ${form.amenities.includes(a) ? 'bg-accent text-white' : 'bg-sand text-muted hover:bg-sand/80'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAdd(false); setForm(EMPTY_FORM) }}
                className="flex-1 py-2.5 border border-border rounded-xl text-muted hover:bg-sand transition">Cancel</button>
              <button onClick={() => addHostelMutation.mutate()} disabled={addHostelMutation.isPending}
                className="flex-1 py-2.5 bg-accent text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
                {addHostelMutation.isPending ? <Spinner size="sm" /> : 'Create Hostel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display font-bold text-xl text-ink mb-5">Add Room</h3>
            <div className="space-y-4">
              {[['Room Name', 'name', 'text'], ['Total Seats', 'totalSeats', 'number'], ['Price per Seat (PKR/mo)', 'pricePerSeat', 'number']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-ink mb-1">{label}</label>
                  <input type={type} value={roomForm[key]} onChange={e => setRoomForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowRoom(null); setRoomForm(EMPTY_ROOM) }}
                className="flex-1 py-2.5 border border-border rounded-xl text-muted hover:bg-sand transition">Cancel</button>
              <button onClick={() => addRoomMutation.mutate(showRoom)} disabled={addRoomMutation.isPending}
                className="flex-1 py-2.5 bg-accent text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
                {addRoomMutation.isPending ? <Spinner size="sm" /> : 'Add Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  )
}
