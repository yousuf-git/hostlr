import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'owner', 'finder'], required: true },
  phone: { type: String, trim: true, default: null },
  avatarUrl: { type: String, default: null },
  cnic: { type: String, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })


export default mongoose.model('User', userSchema)
