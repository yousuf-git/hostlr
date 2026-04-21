import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import ReservationCard from '../../components/reservation/ReservationCard'
import { ClipboardList } from 'lucide-react'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const TABS = ['pending', 'completed', 'cancelled', 'expired']

export default function MyReservationsPage() {
  const [tab, setTab] = useState('pending')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-reservations', tab],
    queryFn: async () => (await api.get(`/up/reservations/mine?status=${tab}&size=20`)).data,
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => api.post(`/up/reservations/${id}/cancel`),
    onSuccess: () => { toast.success('Reservation cancelled.'); qc.invalidateQueries(['my-reservations']) },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel.'),
  })

  return (
    <PageTransition>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-ink mb-6">My Reservations</h1>

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
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {data?.reservations?.length === 0 ? (
                <EmptyState icon={<ClipboardList size={48} />} title="No reservations" description={`No ${tab} reservations yet.`} />
              ) : (
                data?.reservations?.map(r => (
                  <ReservationCard key={r._id} reservation={r}
                    onCancel={tab === 'pending' ? () => cancelMutation.mutate(r._id) : null}
                    cancelLoading={cancelMutation.isPending}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  )
}
