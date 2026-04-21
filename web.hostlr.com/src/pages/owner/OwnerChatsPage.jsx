import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'
import { getSocket } from '../../api/socket'
import Navbar from '../../components/layout/Navbar'
import PageTransition from '../../components/ui/PageTransition'
import ConversationList from '../../components/chat/ConversationList'
import ChatThread from '../../components/chat/ChatThread'
import { MessageSquare } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'

export default function OwnerChatsPage() {
  const { user, token } = useAuth()
  const qc = useQueryClient()
  const [activeId, setActiveId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await api.get('/up/chat/conversations')).data,
  })

  useEffect(() => {
    if (!token) return
    const socket = getSocket(token)
    const refresh = () => qc.invalidateQueries({ queryKey: ['conversations'] })
    socket.on('chat:newMessage', refresh)
    return () => socket.off('chat:newMessage', refresh)
  }, [token])

  const conversations = data?.conversations || []

  useEffect(() => {
    if (conversations.length && !activeId) setActiveId(conversations[0]._id)
  }, [conversations])

  return (
    <PageTransition>
      <Navbar />
      <div className="h-[calc(100vh-64px)] flex">
        <div className="w-80 border-r border-border bg-white flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-bold text-xl text-ink">Chats</h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={<MessageSquare size={48} />} title="No chats yet" description="Finders will message you from hostel pages." />
            </div>
          ) : (
            <ConversationList conversations={conversations} activeId={activeId} currentUserId={user?._id} onSelect={setActiveId} />
          )}
        </div>
        <div className="flex-1 flex flex-col bg-surface">
          {activeId ? (
            <ChatThread conversationId={activeId} currentUserId={user?._id} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon="👈" title="Select a conversation" description="Choose from the list." />
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
