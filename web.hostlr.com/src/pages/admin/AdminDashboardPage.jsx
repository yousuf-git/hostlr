import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Users, Home, DoorOpen, Bed, ClipboardList, MessageSquare } from 'lucide-react'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import Spinner from '../../components/ui/Spinner'

const STATUS_COLORS = { pending: '#F59E0B', completed: '#3D7B5A', cancelled: '#6B7280', expired: '#D1D5DB' }
const PKR = (n) => `PKR ${new Intl.NumberFormat('en-PK').format(n)}`

function StatCard({ label, value, icon: Icon, sub }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon size={18} className="text-accent" />
        </div>
        {sub && <span className="text-xs text-muted bg-sand px-2 py-1 rounded-full">{sub}</span>}
      </div>
      <div className="font-display font-bold text-3xl text-ink">{value ?? '-'}</div>
      <div className="text-muted text-sm mt-1">{label}</div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/ap/dashboard/stats')).data,
    staleTime: 30000,
  })

  if (isLoading) return (
    <PageTransition>
      <Navbar />
      <div className="flex justify-center py-32"><Spinner /></div>
    </PageTransition>
  )

  const s = data || {}
  const { counts = {}, reservationsByStatus = {}, topCities = [], newUsersLast30Days = [], reservationsLast30Days = [], revenuePotential = 0 } = s

  const pieData = Object.entries(reservationsByStatus).map(([name, value]) => ({ name, value }))

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-ink mb-8">Admin Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard label="Users" value={counts.users} icon={Users} />
          <StatCard label="Hostels" value={counts.hostels} icon={Home} />
          <StatCard label="Rooms" value={counts.rooms} icon={DoorOpen} />
          <StatCard label="Seats" value={counts.seats} icon={Bed} />
          <StatCard label="Reservations" value={counts.reservations} icon={ClipboardList} />
          <StatCard label="Chats" value={counts.conversations} icon={MessageSquare} />
        </div>

        {/* Revenue */}
        <div className="bg-accent text-white rounded-2xl p-6 mb-8">
          <p className="text-white/70 text-sm mb-1">Revenue Potential (Booked Seats)</p>
          <p className="font-display font-bold text-4xl">{PKR(revenuePotential)}</p>
          <p className="text-white/60 text-sm mt-1">per month from currently booked seats</p>
        </div>

        {/* Charts grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Reservations by status */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-4">Reservations by Status</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#C4522A'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted text-center py-10">No data</p>}
          </div>

          {/* Top cities */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-4">Hostels by City</h3>
            {topCities.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topCities}>
                  <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#C4522A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted text-center py-10">No data</p>}
          </div>

          {/* New users */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-4">New Users (Last 30 Days)</h3>
            {newUsersLast30Days.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={newUsersLast30Days}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#3D7B5A" fill="#3D7B5A20" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-muted text-center py-10">No data yet</p>}
          </div>

          {/* Reservations over time */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-ink mb-4">Reservations (Last 30 Days)</h3>
            {reservationsLast30Days.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={reservationsLast30Days}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#C4522A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-muted text-center py-10">No data yet</p>}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
