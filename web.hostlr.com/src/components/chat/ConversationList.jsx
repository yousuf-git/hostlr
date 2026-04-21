import { format } from 'date-fns'
import { useAuthStore } from '../../store/authStore'

export default function ConversationList({ conversations = [], activeId, onSelect }) {
  const { user } = useAuthStore()

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {conversations.length === 0 && (
        <p className="text-sm text-muted text-center py-8">No conversations yet.</p>
      )}
      {conversations.map((conv) => {
        const finderId = conv.finderId?._id || conv.finderId
        const isFinder = user?._id === finderId
        const other = isFinder ? conv.ownerId : conv.finderId
        const isActive = conv._id === activeId

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`text-left px-4 py-3 border-b border-border transition-all hover:bg-sand/50
              ${isActive ? 'border-l-4 border-l-accent bg-sand/60' : 'border-l-4 border-l-transparent'}`}
          >
            <div className="flex items-center gap-3">
              {other?.avatarUrl ? (
                <img src={other.avatarUrl} alt={other.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {other?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium text-ink text-sm truncate">{other?.name || 'User'}</span>
                  {conv.lastMessageAt && (
                    <span className="text-xs text-muted flex-shrink-0 ml-2">
                      {format(new Date(conv.lastMessageAt), 'HH:mm')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted truncate">{conv.hostelId?.name || 'Hostel'}</p>
                {conv.lastMessagePreview && (
                  <p className="text-xs text-muted/70 truncate mt-0.5 italic">{conv.lastMessagePreview}</p>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
