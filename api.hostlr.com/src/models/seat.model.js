import mongoose, { Schema } from 'mongoose'

const seatSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  label: { type: String, required: true },
  status: { type: String, enum: ['available', 'reserved', 'booked'], default: 'available' },
  reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation', default: null },
}, { timestamps: true })

seatSchema.index({ roomId: 1 })
seatSchema.index({ hostelId: 1, status: 1 })
export default mongoose.model('Seat', seatSchema)
