import mongoose, { Schema } from 'mongoose'

const reservationSchema = new Schema({
  seatId: { type: Schema.Types.ObjectId, ref: 'Seat', required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  finderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled', 'expired'], default: 'pending' },
  expiresAt: { type: Date, required: true },
  completedAt: { type: Date, default: null },
  cancelReason: { type: String, default: null },
}, { timestamps: true })

reservationSchema.index({ seatId: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } })
reservationSchema.index({ finderId: 1, status: 1 })
reservationSchema.index({ hostelId: 1, status: 1 })
reservationSchema.index({ ownerId: 1, status: 1 })
reservationSchema.index({ expiresAt: 1, status: 1 })
export default mongoose.model('Reservation', reservationSchema)
