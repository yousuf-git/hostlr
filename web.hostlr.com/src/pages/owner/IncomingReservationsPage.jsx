import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { ClipboardList, Check, X } from 'lucide-react'

const TABS = ['pending', 'completed', 'cancelled', 'expired']

export default function IncomingReservationsPage() {
  const [tab, setTab] = useState('pending')
  const [confirmId, setConfirmId] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['incoming-reservations', tab],
    queryFn: async () => (await api.get(`/up/reservations/incoming?status=${tab}&size=20`)).data,
  })

  const completeMutation = useMutation({
    mutationFn: (id) => api.post(`/up/reservations/${id}/complete`),
    onSuccess: () => { toast.success('Reservation marked complete!'); qc.invalidateQueries(['incoming-reservations']) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
    onSettled: () => { setConfirmId(null); setConfirmAction(null) },
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => api.post(`/up/reservations/${id}/cancel`),
    onSuccess: () => { toast.success('Reservation cancelled.'); qc.invalidateQueries(['incoming-reservations']) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
    onSettled: () => { setConfirmId(null); setConfirmAction(null) },
  })

  const handleConfirm = () => {
    if (confirmAction === 'complete') completeMutation.mutate(confirmId)
    else cancelMutation.mutate(confirmId)
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-ink mb-6">Incoming Reservations</h1>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition ${tab === t ? 'bg-accent text-white' : 'bg-sand text-muted hover:text-ink'}`}>
              {t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {data?.reservations?.length === 0 ? (
                <EmptyState icon={<ClipboardList size={48} />} title="No reservations" description={`No ${tab} reservations.`} />
              ) : data?.reservations?.map(r => (
                <div key={r._id} className="bg-white border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-ink text-lg">{r.finderId?.name}</p>
                      <p className="text-sm text-muted">{r.finderId?.email} · {r.finderId?.phone}</p>
                    </div>
                    <Badge status={r.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div><span className="text-muted">Hostel</span><p className="font-medium text-ink">{r.hostelId?.name}</p></div>
                    <div><span className="text-muted">Room</span><p className="font-medium text-ink">{r.roomId?.name}</p></div>
                    <div><span className="text-muted">Seat</span><p className="font-medium text-ink">{r.seatId?.label}</p></div>
                  </div>
                  <p className="text-xs text-muted">
                    Reserved {format(new Date(r.createdAt), 'dd MMM yyyy')} · Expires {format(new Date(r.expiresAt), 'dd MMM yyyy HH:mm')}
                  </p>
                  {tab === 'pending' && (
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => { setConfirmId(r._id); setConfirmAction('complete') }}
                        className="flex-1 py-2.5 bg-moss text-white rounded-xl text-sm font-medium hover:bg-moss/90 transition">
                        <Check size={14} /> Mark Complete
                      </button>
                      <button onClick={() => { setConfirmId(r._id); setConfirmAction('cancel') }}
                        className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmId && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h3 className="font-semibold text-ink text-lg mb-2">
                {confirmAction === 'complete' ? 'Mark as Completed?' : 'Cancel Reservation?'}
              </h3>
              <p className="text-muted text-sm mb-5">
                {confirmAction === 'complete'
                  ? 'This will mark the seat as booked. The tenant has arrived and checked in.'
                  : 'This will free the seat and notify the finder.'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setConfirmId(null); setConfirmAction(null) }}
                  className="flex-1 py-2.5 border border-border rounded-xl text-muted hover:bg-sand transition">Back</button>
                <button onClick={handleConfirm}
                  disabled={completeMutation.isPending || cancelMutation.isPending}
                  className={`flex-1 py-2.5 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${confirmAction === 'complete' ? 'bg-moss hover:bg-moss/90' : 'bg-red-500 hover:bg-red-600'}`}>
                  {(completeMutation.isPending || cancelMutation.isPending) ? <Spinner size="sm" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
