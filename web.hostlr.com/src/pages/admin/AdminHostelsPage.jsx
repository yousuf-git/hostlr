import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Home } from 'lucide-react'

export default function AdminHostelsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-hostels', page],
    queryFn: async () => (await api.get(`/ap/hostels?page=${page}&size=15`)).data,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/ap/hostels/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status updated.'); qc.invalidateQueries(['admin-hostels']) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/ap/hostels/${id}`),
    onSuccess: () => { toast.success('Hostel deleted.'); qc.invalidateQueries(['admin-hostels']); setDeleteTarget(null) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  })

  const hostels = data?.hostels || []
  const pagination = data?.pagination || {}

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-ink mb-6">Hostels</h1>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : hostels.length === 0 ? (
          <EmptyState icon="🏠" title="No hostels" description="No hostels registered yet." />
        ) : (
          <>
            <div className="bg-white border border-border rounded-2xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-sand/50">
                    {['Hostel', 'Owner', 'City', 'Gender', 'Status', 'Listed', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hostels.map(h => (
                    <tr key={h._id} className="border-b border-border last:border-0 hover:bg-sand/30 transition">
                      <td className="px-4 py-3 font-medium text-ink max-w-[180px] truncate">{h.name}</td>
                      <td className="px-4 py-3 text-muted">{h.ownerId?.name || '-'}</td>
                      <td className="px-4 py-3 text-muted">{h.city}</td>
                      <td className="px-4 py-3"><Badge status={h.gender} size="sm" /></td>
                      <td className="px-4 py-3"><Badge status={h.status} size="sm" /></td>
                      <td className="px-4 py-3 text-muted">{format(new Date(h.createdAt), 'dd MMM yy')}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => statusMutation.mutate({ id: h._id, status: h.status === 'active' ? 'inactive' : 'active' })}
                            className="text-xs px-2 py-1 border border-border rounded-lg hover:bg-sand transition">
                            {h.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => setDeleteTarget(h)}
                            className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
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

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-ink text-lg mb-2">Delete Hostel?</h3>
            <p className="text-muted text-sm mb-5">This will delete <strong>{deleteTarget.name}</strong> and all its rooms and seats. Irreversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-border rounded-xl text-muted hover:bg-sand transition">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteTarget._id)} disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition flex items-center justify-center gap-2">
                {deleteMutation.isPending ? <Spinner size="sm" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  )
}
