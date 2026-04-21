import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Badge from '../ui/Badge'

const PKR = (amount) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount)

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=70'

export default function HostelCard({ hostel }) {
  const navigate = useNavigate()

  const {
    _id,
    name,
    city,
    gender,
    images = [],
    amenities = [],
    rooms = [],
    minPrice,
  } = hostel

  const imageUrl = images[0] ? `/uploads/${images[0]}` : PLACEHOLDER
  const displayedAmenities = amenities.slice(0, 4)

  const totalSeats = rooms.reduce((acc, r) => acc + (r.totalSeats || 0), 0)
  const availableSeats = rooms.reduce((acc, r) => {
    const avail = (r.seats || []).filter((s) => s.status === 'available').length
    return acc + avail
  }, 0)

  const lowestPrice = minPrice || rooms.reduce((min, r) => {
    return r.pricePerSeat < min ? r.pricePerSeat : min
  }, Infinity)

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(15,23,36,0.10)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden border border-border cursor-pointer group"
      onClick={() => navigate(`/hostel/${_id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = PLACEHOLDER }}
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge status={gender} />
        </div>
        {availableSeats > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-moss">
            {availableSeats} seats free
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-muted uppercase tracking-wide mb-1">{city}</p>
        <h3 className="font-display font-semibold text-lg text-ink leading-tight mb-2 line-clamp-2">
          {name}
        </h3>

        {displayedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {displayedAmenities.map((a) => (
              <span
                key={a}
                className="text-xs bg-sand text-muted rounded-md px-2 py-0.5 capitalize"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-xs text-muted">From </span>
            <span className="font-semibold text-ink">
              {lowestPrice && lowestPrice !== Infinity ? PKR(lowestPrice) : 'PKR -'}
            </span>
            <span className="text-xs text-muted">/mo</span>
          </div>
          {availableSeats === 0 && (
            <span className="text-xs font-medium text-accent">Full</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
