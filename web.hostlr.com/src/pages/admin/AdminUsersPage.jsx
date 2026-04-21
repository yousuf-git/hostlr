import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import { Users } from 'lucide-react'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const ROLE_COLORS = { admin: 'bg-ink text-white', owner: 'bg-accent/10 text-accent', finder: 'bg-moss/10 text-moss' }

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: async () => (await api.get(`/ap/users?page=${page}&size=15${roleFilter ? `&role=${roleFilter}` : ''}`)).data,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/ap/users/${id}`, payload),
    onSuccess: () => { toast.success('User updated.'); qc.invalidateQueries(['admin-users']) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/ap/users/${id}`),
    onSuccess: () => { toast.success('User deleted.'); qc.invalidateQueries(['admin-users']); setDeleteTarget(null) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  })

  const users = data?.users || []
  const pagination = data?.pagination || {}

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-3xl text-ink">Users</h1>
          <div className="flex gap-2">
            {['', 'admin', 'owner', 'finder'].map(r => (
              <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }}
                className={`px-3 py-1.5 rounded-full text-sm capitalize transition ${roleFilter === r ? 'bg-accent text-white' : 'bg-sand text-muted hover:text-ink'}`}>
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : users.length === 0 ? (
          <EmptyState icon={<Users size={48} />} title="No users" description="No users found." />
        ) : (
          <>
            <div className="bg-white border border-border rounded-2xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-sand/50">
                    {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-border last:border-0 hover:bg-sand/30 transition">
                      <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                      <td className="px-4 py-3 text-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-moss/10 text-moss' : 'bg-gray-100 text-muted'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{format(new Date(u.createdAt), 'dd MMM yy')}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => updateMutation.mutate({ id: u._id, payload: { isActive: !u.isActive } })}
                            className="text-xs px-2 py-1 border border-border rounded-lg hover:bg-sand transition">
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          {u.role !== 'admin' && (
                            <button onClick={() => setDeleteTarget(u)}
                              className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-ink text-lg mb-2">Delete User?</h3>
            <p className="text-muted text-sm mb-5">This will permanently delete <strong>{deleteTarget.name}</strong>. This cannot be undone.</p>
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
