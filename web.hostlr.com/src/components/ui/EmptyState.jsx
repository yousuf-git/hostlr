export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && (
        <div className="mb-4 flex justify-center text-muted">{icon}</div>
      )}
      <h3 className="text-xl font-display font-semibold text-ink mb-2">{title}</h3>
      {description && (
        <p className="text-muted text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <div>{action}</div>
      )}
    </div>
  )
}
