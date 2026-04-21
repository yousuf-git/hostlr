import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'
import api from '../../api/axios'
import { getSocket } from '../../api/socket'
import { useAuth } from '../../hooks/useAuth'
import MessageBubble from './MessageBubble'
import Spinner from '../ui/Spinner'

export default function ChatThread({ conversationId, currentUserId }) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const bottomRef = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => api.get(`/up/chat/conversations/${conversationId}/messages`).then(r => r.data),
    enabled: !!conversationId,
  })

  useEffect(() => {
    if (data?.messages) setMessages(data.messages)
  }, [data])

  useEffect(() => {
    if (!conversationId || !token) return
    const socket = getSocket(token)
    socket.emit('chat:join', { conversationId })

    const handleMessage = (msg) => {
      setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg])
    }

    const handleTyping = ({ userId }) => {
      if (userId !== currentUserId) {
        setIsTyping(true)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2500)
      }
    }

    socket.on('chat:message', handleMessage)
    socket.on('chat:typing', handleTyping)

    return () => {
      socket.off('chat:message', handleMessage)
      socket.off('chat:typing', handleTyping)
      socket.emit('chat:leave', { conversationId })
    }
  }, [conversationId, token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (!conversationId || !token) return
    const socket = getSocket(token)
    socket.emit('chat:typing', { conversationId, userId: currentUserId })
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !conversationId) return
    setInput('')

    try {
      const res = await api.post(`/up/chat/conversations/${conversationId}/messages`, { text })
      const newMsg = res.data?.message
      if (newMsg) {
        setMessages(prev => prev.find(m => m._id === newMsg._id) ? prev : [...prev, newMsg])
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        <p className="text-sm">Select a conversation to start chatting.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center mt-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted py-8">No messages yet. Say hello!</p>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={
                msg.senderId?._id === currentUserId ||
                msg.senderId === currentUserId
              }
            />
          ))
        )}
        {isTyping && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex gap-1">
              {[0, 150, 300].map(d => (
                <span key={d} className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
            <span className="text-xs text-muted">typing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3 bg-white flex items-end gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none border border-border rounded-xl px-3 py-2.5 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent min-h-[40px] max-h-32"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="bg-accent text-white rounded-xl p-2.5 hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
