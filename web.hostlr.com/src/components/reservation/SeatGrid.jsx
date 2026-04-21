import Badge from '../ui/Badge'

const seatColors = {
  available: 'bg-moss/10 border-moss text-moss hover:bg-moss hover:text-white cursor-pointer',
  reserved:  'bg-accent/10 border-accent/40 text-accent cursor-not-allowed',
  booked:    'bg-ink/10 border-ink/20 text-ink/50 cursor-not-allowed',
}

export default function SeatGrid({ seats = [], onReserve, canReserve }) {
  if (!seats.length) {
    return <p className="text-sm text-muted italic">No seats defined for this room.</p>
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {seats.map((seat) => {
        const isAvailable = seat.status === 'available'
        const colorClass = seatColors[seat.status] || seatColors.booked

        return (
          <button
            key={seat._id || seat.label}
            disabled={!isAvailable || !canReserve}
            onClick={() => isAvailable && canReserve && onReserve && onReserve(seat)}
            className={`
              relative border-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150
              ${colorClass}
              ${!isAvailable || !canReserve ? 'opacity-70' : ''}
            `}
            title={isAvailable && !canReserve ? 'Log in as a finder to reserve' : seat.status}
          >
            {seat.label || seat._id?.slice(-4)}
            {seat.status !== 'available' && (
              <span className="block text-[10px] font-normal capitalize mt-0.5 opacity-70">
                {seat.status}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
