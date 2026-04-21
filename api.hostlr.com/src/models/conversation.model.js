import mongoose, { Schema } from 'mongoose'

const conversationSchema = new Schema({
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  finderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessageAt: { type: Date, default: null },
  lastMessagePreview: { type: String, default: '' },
}, { timestamps: true })

conversationSchema.index({ hostelId: 1, finderId: 1, ownerId: 1 }, { unique: true })
conversationSchema.index({ finderId: 1 })
conversationSchema.index({ ownerId: 1 })
export default mongoose.model('Conversation', conversationSchema)
