import mongoose, { Schema } from 'mongoose'

const hostelSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  city: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  amenities: [{ type: String }],
  gender: { type: String, enum: ['male', 'female', 'coed'], required: true },
  images: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true })

hostelSchema.index({ city: 1, status: 1 })
hostelSchema.index({ ownerId: 1 })
export default mongoose.model('Hostel', hostelSchema)
