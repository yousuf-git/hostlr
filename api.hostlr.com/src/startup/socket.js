import http from 'http'
import { Server as SocketIO } from 'socket.io'
import jwt from 'jsonwebtoken'
import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js'

const initializeSocket = (app) => {
  const server = http.createServer(app)
  const io = new SocketIO(server, {
    cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST'] },
  })

  app.locals.io = io

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      socket.data.userId = decoded._id
      socket.data.role = decoded.role
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.data.userId

    // User joins their personal notification room
    socket.join(`user:${userId}`)

    socket.on('chat:join', async ({ conversationId }) => {
      try {
        const conv = await Conversation.findById(conversationId)
        if (!conv) return
        const isParticipant =
          conv.finderId.toString() === userId || conv.ownerId.toString() === userId
        if (isParticipant) socket.join(`chat:${conversationId}`)
      } catch {}
    })

    socket.on('chat:send', async ({ conversationId, text }) => {
      try {
        if (!text?.trim()) return
        const conv = await Conversation.findById(conversationId)
        if (!conv) return
        const isParticipant =
          conv.finderId.toString() === userId || conv.ownerId.toString() === userId
        if (!isParticipant) return

        const msg = await Message.create({ conversationId, senderId: userId, text: text.trim() })
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessageAt: new Date(),
          lastMessagePreview: text.slice(0, 100),
        })
        const populated = await msg.populate('senderId', 'name avatarUrl role')
        io.to(`chat:${conversationId}`).emit('chat:message', populated)
        const convUpdate = { conversationId, lastMessagePreview: text.slice(0, 100), lastMessageAt: new Date() }
        io.to(`user:${conv.finderId}`).emit('chat:newMessage', convUpdate)
        io.to(`user:${conv.ownerId}`).emit('chat:newMessage', convUpdate)
      } catch {}
    })

    socket.on('chat:typing', ({ conversationId }) => {
      socket.to(`chat:${conversationId}`).emit('chat:typing', { userId })
    })

    socket.on('chat:read', async ({ conversationId, messageId }) => {
      try {
        const readAt = new Date()
        await Message.findByIdAndUpdate(messageId, { readAt })
        socket.to(`chat:${conversationId}`).emit('chat:read', { messageId, readAt })
      } catch {}
    })

    socket.on('disconnect', () => {})
  })

  return { server, io }
}

export default initializeSocket
