import cron from 'node-cron'
import Reservation from '../models/reservation.model.js'
import Seat from '../models/seat.model.js'

export default function initializeJobs() {
  // Every 5 minutes: expire pending reservations past expiresAt
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expired = await Reservation.find({
        status: 'pending',
        expiresAt: { $lt: new Date() },
      })

      for (const res of expired) {
        res.status = 'expired'
        await res.save()
        await Seat.findByIdAndUpdate(res.seatId, { status: 'available', reservationId: null })
      }

      if (expired.length > 0) {
        console.log(`[JOBS] Expired ${expired.length} reservation(s)`)
      }
    } catch (err) {
      console.error('[JOBS] Expiry job error:', err.message)
    }
  })

  console.log('[JOBS] Cron jobs initialized')
}
