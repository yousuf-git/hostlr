import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Home, DoorOpen, CheckCircle, Camera, Plus } from 'lucide-react'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

const AMENITIES = ['wifi', 'meals', 'ac', 'laundry', 'study-room', 'parking', 'security', 'generator']
const EMPTY_ROOM = { name: '', totalSeats: '', pricePerSeat: '' }

export default function HostelEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qc = useQueryClient()
  const [tab, setTab] = useState(searchParams.get('tab') || 'details')
  const [form, setForm] = useState(null)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [roomForm, setRoomForm] = useState(EMPTY_ROOM)

  const { data: hostelData, isLoading: hostelLoading } = useQuery({
    queryKey: ['owner-hostel', id],
    queryFn: async () => (await api.get(`/up/hostels/${id}`)).data,
  })

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['owner-hostel-rooms', id],
    queryFn: async () => (await api.get(`/up/hostels/${id}/rooms`)).data,
    enabled: tab === 'rooms',
  })

  useEffect(() => {
    if (hostelData?.hostel) {
      const h = hostelData.hostel
      setForm({ name: h.name, city: h.city, address: h.address, gender: h.gender, description: h.description || '', amenities: h.amenities || [], status: h.status })
    }
  }, [hostelData])

  const updateMutation = useMutation({
    mutationFn: () => api.patch(`/up/hostels/${id}`, form),
    onSuccess: () => { toast.success('Hostel updated!'); qc.invalidateQueries({ queryKey: ['owner-hostels'] }); qc.invalidateQueries({ queryKey: ['owner-hostel', id] }) },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed.'),
  })

  const uploadMutation = useMutation({
    mutationFn: (files) => {
      const fd = new FormData()
      files.forEach(f => fd.append('images', f))
      return api.post(`/up/hostels/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => { toast.success('Images uploaded!'); qc.invalidateQueries({ queryKey: ['owner-hostel', id] }) },
    onError: () => toast.error('Upload failed.'),
  })

  const addRoomMutation = useMutation({
    mutationFn: () => api.post(`/up/hostels/${id}/rooms`, roomForm),
    onSuccess: () => {
      toast.success('Room added!')
      qc.invalidateQueries({ queryKey: ['owner-hostel-rooms', id] })
      qc.invalidateQueries({ queryKey: ['owner-hostels'] })
      setShowAddRoom(false)
      setRoomForm(EMPTY_ROOM)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  })

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId) => api.delete(`/up/rooms/${roomId}`),
    onSuccess: () => {
      toast.success('Room deleted.')
      qc.invalidateQueries({ queryKey: ['owner-hostel-rooms', id] })
      qc.invalidateQueries({ queryKey: ['owner-hostels'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  })

  const toggleAmenity = (a) => setForm(p => ({
    ...p, amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a]
  }))

  if (hostelLoading || !form) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  )

  const hostel = hostelData?.hostel
  const rooms = roomsData?.rooms || []

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/owner/hostels')}
            className="p-2 rounded-xl border border-border hover:bg-sand transition text-muted hover:text-ink">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge status={hostel?.gender} />
              <Badge status={hostel?.status} />
            </div>
            <h1 className="font-display font-bold text-2xl text-ink truncate">{hostel?.name}</h1>
            <p className="text-sm text-muted">{hostel?.city}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-sand/60 p-1 rounded-2xl w-fit">
          {[['details', 'Details', Home], ['rooms', 'Rooms', DoorOpen]].map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${tab === key ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* --- DETAILS TAB --- */}
        {tab === 'details' && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-ink mb-5">Basic Info</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[['Name', 'name'], ['City', 'city'], ['Address', 'address']].map(([label, key]) => (
                  <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-ink mb-1">{label}</label>
                    <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent">
                    <option value="male">Male</option><option value="female">Female</option><option value="coed">Co-ed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent">
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink mb-1">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-accent resize-none" />
                </div>
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-ink mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(a => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-full text-sm capitalize transition ${form.amenities.includes(a) ? 'bg-accent text-white' : 'bg-sand text-muted hover:text-ink'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
                className="mt-6 px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-medium transition flex items-center gap-2">
                {updateMutation.isPending ? <Spinner size="sm" /> : 'Save Changes'}
              </button>
            </div>

            {/* Images */}
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-ink mb-4">Photos</h2>
              {hostel?.images?.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                  {hostel.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-xl border border-border" />
                  ))}
                </div>
              )}
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-xl text-muted hover:border-accent hover:text-accent transition text-sm">
                <Camera size={16} /> Upload Photos
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={e => { if (e.target.files.length) uploadMutation.mutate([...e.target.files]) }} />
              </label>
              {uploadMutation.isPending && <span className="ml-3 text-muted text-sm">Uploading...</span>}
            </div>
          </div>
        )}

        {/* --- ROOMS TAB --- */}
        {tab === 'rooms' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-muted text-sm">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</p>
              <button onClick={() => setShowAddRoom(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition">
                <Plus size={15} /> Add Room
              </button>
            </div>

            {roomsLoading ? (
              <div className="flex justify-center py-20"><Spinner /></div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-16 bg-white border border-border rounded-2xl">
                <DoorOpen size={40} className="text-muted mx-auto mb-3" />
                <p className="font-medium text-ink mb-1">No rooms yet</p>
                <p className="text-muted text-sm">Add your first room to start accepting reservations.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {rooms.map(room => (
                  <div key={room._id} className="bg-white border border-border rounded-2xl p-5 hover:border-accent/40 hover:shadow-sm transition group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-ink text-base group-hover:text-accent transition">{room.name}</h3>
                        <p className="text-sm text-muted mt-0.5">PKR {new Intl.NumberFormat('en-PK').format(room.pricePerSeat)}/mo</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${room.availableSeats > 0 ? 'bg-moss/10 text-moss' : 'bg-gray-100 text-muted'}`}>
                        {room.availableSeats}/{room.totalSeats} free
                      </span>
                    </div>
                    <div className="flex gap-1 flex-wrap mb-4">
                      {(room.amenities || []).map(a => (
                        <span key={a} className="text-xs bg-sand text-muted rounded-md px-2 py-0.5 capitalize">{a}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/owner/hostels/${id}/rooms/${room._id}`}
                        className="flex-1 text-center py-2 text-sm font-medium bg-ink text-white rounded-xl hover:bg-ink/80 transition">
                        View / Edit
                      </Link>
                      <button onClick={() => { if (window.confirm(`Delete "${room.name}"? This also removes all its seats.`)) deleteRoomMutation.mutate(room._id) }}
                        className="px-3 py-2 text-sm border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoom && (
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
              <button onClick={() => { setShowAddRoom(false); setRoomForm(EMPTY_ROOM) }}
                className="flex-1 py-2.5 border border-border rounded-xl text-muted hover:bg-sand transition">Cancel</button>
              <button onClick={() => addRoomMutation.mutate()} disabled={addRoomMutation.isPending}
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
