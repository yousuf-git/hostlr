import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import Conversation from '../../models/conversation.model.js'
import Message from '../../models/message.model.js'
import Hostel from '../../models/hostel.model.js'

export const ChatController = {
  createConversation: asyncHandler(async (req, res) => {
    const { hostelId } = req.body
    const hostel = await Hostel.findById(hostelId)
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found.')
    if (hostel.ownerId.toString() === req.user._id.toString()) {
      return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, 'Cannot chat with yourself.')
    }
    const conversation = await Conversation.findOneAndUpdate(
      { hostelId, finderId: req.user._id, ownerId: hostel.ownerId },
      { hostelId, finderId: req.user._id, ownerId: hostel.ownerId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    return generateApiResponse(res, StatusCodes.OK, true, 'Conversation ready.', { conversation })
  }),

  getConversations: asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({
      $or: [{ finderId: req.user._id }, { ownerId: req.user._id }]
    })
      .populate('hostelId', 'name city images')
      .populate('finderId', 'name avatarUrl')
      .populate('ownerId', 'name avatarUrl')
      .sort({ lastMessageAt: -1 })
    return generateApiResponse(res, StatusCodes.OK, true, 'Conversations fetched.', { conversations })
  }),

  getMessages: asyncHandler(async (req, res) => {
    const conv = await Conversation.findById(req.params.id)
    if (!conv) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Conversation not found.')
    const isParticipant = conv.finderId.toString() === req.user._id.toString() || conv.ownerId.toString() === req.user._id.toString()
    if (!isParticipant) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Access denied.')
    const { cursor, size = 30 } = req.query
    const filter = { conversationId: req.params.id }
    if (cursor) filter.createdAt = { $lt: new Date(cursor) }
    const messages = await Message.find(filter)
      .populate('senderId', 'name avatarUrl role')
      .sort({ createdAt: -1 }).limit(parseInt(size))
    messages.reverse()
    return generateApiResponse(res, StatusCodes.OK, true, 'Messages fetched.', { messages })
  }),

  sendMessage: asyncHandler(async (req, res) => {
    const conv = await Conversation.findById(req.params.id)
    if (!conv) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Conversation not found.')
    const isParticipant = conv.finderId.toString() === req.user._id.toString() || conv.ownerId.toString() === req.user._id.toString()
    if (!isParticipant) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Access denied.')
    const msg = await Message.create({ conversationId: req.params.id, senderId: req.user._id, text: req.body.text })
    await Conversation.findByIdAndUpdate(req.params.id, { lastMessageAt: new Date(), lastMessagePreview: req.body.text.slice(0, 100) })
    const populated = await msg.populate('senderId', 'name avatarUrl role')
    const io = req.app.locals.io
    if (io) {
      io.to(`chat:${req.params.id}`).emit('chat:message', populated)
      const convUpdate = { conversationId: req.params.id, lastMessagePreview: req.body.text.slice(0, 100), lastMessageAt: new Date() }
      io.to(`user:${conv.finderId}`).emit('chat:newMessage', convUpdate)
      io.to(`user:${conv.ownerId}`).emit('chat:newMessage', convUpdate)
    }
    return generateApiResponse(res, StatusCodes.CREATED, true, 'Message sent.', { message: populated })
  }),
}
