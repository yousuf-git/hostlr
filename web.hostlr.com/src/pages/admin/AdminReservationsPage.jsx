import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { ClipboardList } from 'lucide-react'

const TABS = ['', 'pending', 'completed', 'cancelled', 'expired']

export default function AdminReservationsPage() {
  const [tab, setTab] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reservations', tab, page],
    queryFn: async () => (await api.get(`/ap/reservations?page=${page}&size=15${tab ? `&status=${tab}` : ''}`)).data,
  })

  const reservations = data?.reservations || []
  const pagination = data?.pagination || {}

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-ink mb-6">Reservations</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); setPage(1) }}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition ${tab === t ? 'bg-accent text-white' : 'bg-sand text-muted hover:text-ink'}`}>
              {t || 'All'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : reservations.length === 0 ? (
          <EmptyState icon="📋" title="No reservations" description={`No ${tab || ''} reservations found.`} />
        ) : (
          <>
            <div className="bg-white border border-border rounded-2xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-sand/50">
                    {['Finder', 'Hostel', 'Room', 'Seat', 'Status', 'Expires', 'Created'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r._id} className="border-b border-border last:border-0 hover:bg-sand/30 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{r.finderId?.name || '-'}</p>
                        <p className="text-xs text-muted">{r.finderId?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted max-w-[140px] truncate">{r.hostelId?.name || '-'}</td>
                      <td className="px-4 py-3 text-muted">{r.roomId?.name || '-'}</td>
                      <td className="px-4 py-3 text-muted">{r.seatId?.label || '-'}</td>
                      <td className="px-4 py-3"><Badge status={r.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {r.status === 'pending'
                          ? formatDistanceToNow(new Date(r.expiresAt), { addSuffix: true })
                          : format(new Date(r.expiresAt), 'dd MMM yy')}
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">{format(new Date(r.createdAt), 'dd MMM yy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm transition ${page === p ? 'bg-accent text-white' : 'bg-sand text-muted hover:bg-sand/80'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  )
}
