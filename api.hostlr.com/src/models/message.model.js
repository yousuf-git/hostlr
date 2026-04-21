import mongoose, { Schema } from 'mongoose'

const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  readAt: { type: Date, default: null },
}, { timestamps: true })

messageSchema.index({ conversationId: 1, createdAt: 1 })
export default mongoose.model('Message', messageSchema)
