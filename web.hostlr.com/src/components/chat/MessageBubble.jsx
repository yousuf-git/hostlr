import { format } from 'date-fns'

export default function MessageBubble({ message, isOwn }) {
  const sender = message.senderId
  const time = message.createdAt ? format(new Date(message.createdAt), 'HH:mm') : ''

  return (
    <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && (
        <div className="flex items-center gap-1.5 mb-1 ml-1">
          {sender?.avatarUrl ? (
            <img src={sender.avatarUrl} alt={sender.name} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[9px] font-semibold">
              {sender?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <span className="text-[11px] text-muted font-medium">{sender?.name || 'User'}</span>
        </div>
      )}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isOwn
            ? 'bg-accent text-white rounded-br-sm'
            : 'bg-white border border-border text-ink rounded-bl-sm shadow-sm'
          }`}
      >
        {message.text}
      </div>
      <span className="text-[11px] text-muted mt-1">{time}</span>
    </div>
  )
}
