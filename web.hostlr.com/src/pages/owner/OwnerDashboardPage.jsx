import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Home, Clock, DoorOpen, ClipboardList, MessageSquare } from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import Spinner from '../../components/ui/Spinner'

function StatCard({ label, value, icon: Icon, to }) {
  const inner = (
    <div className="bg-white border border-border rounded-2xl p-5 hover:border-accent/40 transition">
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
        <Icon size={20} className="text-accent" />
      </div>
      <div className="font-display font-bold text-3xl text-ink">{value ?? '-'}</div>
      <div className="text-muted text-sm mt-1">{label}</div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

const QUICK_ACTIONS = [
  { label: 'Manage Hostels', desc: 'Add, edit, and manage your properties', to: '/owner/hostels', icon: Home },
  { label: 'Reservations', desc: 'View and act on incoming reservation requests', to: '/owner/reservations', icon: ClipboardList },
  { label: 'Chats', desc: 'Communicate with potential tenants', to: '/owner/chats', icon: MessageSquare },
]

export default function OwnerDashboardPage() {
  const { user } = useAuthStore()

  const { data: hostelsData, isLoading: h } = useQuery({
    queryKey: ['owner-hostels'],
    queryFn: async () => (await api.get('/up/hostels/mine?size=100')).data,
  })

  const { data: resData, isLoading: r } = useQuery({
    queryKey: ['incoming-pending'],
    queryFn: async () => (await api.get('/up/reservations/incoming?status=pending&size=5')).data,
  })

  const loading = h || r

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-ink mb-2">Welcome, {user?.name}</h1>
        <p className="text-muted mb-8">Manage your hostels and reservations.</p>

        {loading ? <div className="flex justify-center py-20"><Spinner /></div> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              <StatCard label="My Hostels" value={hostelsData?.pagination?.totalItems} icon={Home} to="/owner/hostels" />
              <StatCard label="Pending Reservations" value={resData?.pagination?.totalItems} icon={Clock} to="/owner/reservations" />
              <StatCard label="Total Rooms" value={hostelsData?.hostels?.reduce((a, h) => a + (h.roomCount || 0), 0)} icon={DoorOpen} />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {QUICK_ACTIONS.map(a => (
                <Link key={a.to} to={a.to}
                  className="bg-white border border-border rounded-2xl p-5 hover:border-accent/40 hover:shadow-sm transition group">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <a.icon size={20} className="text-accent" />
                  </div>
                  <div className="font-semibold text-ink group-hover:text-accent transition">{a.label}</div>
                  <div className="text-muted text-sm mt-1">{a.desc}</div>
                </Link>
              ))}
            </div>

            {resData?.reservations?.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl text-ink mb-4">Pending Reservations</h2>
                <div className="space-y-3">
                  {resData.reservations.map(r => (
                    <div key={r._id} className="bg-white border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-ink">{r.finderId?.name}</p>
                        <p className="text-sm text-muted">{r.hostelId?.name} · {r.roomId?.name} · {r.seatId?.label}</p>
                      </div>
                      <Link to="/owner/reservations" className="text-sm text-accent font-medium hover:underline">Review</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  )
}
