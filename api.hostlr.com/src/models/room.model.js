import mongoose, { Schema } from 'mongoose'

const roomSchema = new Schema({
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  name: { type: String, required: true, trim: true },
  totalSeats: { type: Number, required: true, min: 1 },
  pricePerSeat: { type: Number, required: true, min: 0 },
  pricingUnit: { type: String, enum: ['monthly'], default: 'monthly' },
  amenities: [{ type: String }],
  images: [{ type: String }],
}, { timestamps: true })

roomSchema.index({ hostelId: 1 })
export default mongoose.model('Room', roomSchema)
