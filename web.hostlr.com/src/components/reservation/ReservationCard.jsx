import { format, formatDistanceToNow, isPast } from 'date-fns'
import Badge from '../ui/Badge'

export default function ReservationCard({ reservation, onCancel, onComplete, showActions = true }) {
  const {
    _id,
    hostel,
    room,
    seat,
    status,
    createdAt,
    expiresAt,
  } = reservation

  const hostelName = hostel?.name || 'Unknown Hostel'
  const roomName = room?.name || 'Unknown Room'
  const seatLabel = seat?.label || '-'

  const isPending = status === 'pending'
  const isExpired = expiresAt && isPast(new Date(expiresAt))

  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-display font-semibold text-ink text-lg">{hostelName}</h4>
          <p className="text-sm text-muted mt-0.5">
            {roomName} &middot; Seat <span className="font-medium text-ink">{seatLabel}</span>
          </p>
        </div>
        <Badge status={status} size="md" />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted mb-4">
        <div>
          <span className="block text-xs uppercase tracking-wide mb-0.5">Reserved on</span>
          <span className="text-ink font-medium">{format(new Date(createdAt), 'dd MMM yyyy')}</span>
        </div>
        {expiresAt && isPending && (
          <div>
            <span className="block text-xs uppercase tracking-wide mb-0.5">Expires</span>
            <span className={`font-medium ${isExpired ? 'text-red-500' : 'text-amber-600'}`}>
              {isExpired
                ? 'Expired'
                : `in ${formatDistanceToNow(new Date(expiresAt))}`}
            </span>
          </div>
        )}
      </div>

      {showActions && isPending && !isExpired && (
        <div className="flex gap-2 pt-3 border-t border-border">
          {onComplete && (
            <button
              onClick={() => onComplete(_id)}
              className="text-sm bg-moss text-white rounded-lg px-4 py-1.5 font-medium hover:bg-moss/90 transition-colors"
            >
              Mark Complete
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => onCancel(_id)}
              className="text-sm border border-red-200 text-red-500 rounded-lg px-4 py-1.5 font-medium hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}
