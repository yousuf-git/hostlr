const colorMap = {
  available:  'bg-moss/10 text-moss border border-moss/20',
  reserved:   'bg-accent/10 text-accent border border-accent/20',
  booked:     'bg-ink/10 text-ink border border-ink/20',
  pending:    'bg-amber-100 text-amber-700 border border-amber-200',
  completed:  'bg-moss/10 text-moss border border-moss/20',
  cancelled:  'bg-red-100 text-red-600 border border-red-200',
  expired:    'bg-gray-100 text-gray-500 border border-gray-200',
  active:     'bg-moss/10 text-moss border border-moss/20',
  inactive:   'bg-gray-100 text-gray-500 border border-gray-200',
  male:       'bg-blue-50 text-blue-700 border border-blue-100',
  female:     'bg-pink-50 text-pink-600 border border-pink-100',
  coed:       'bg-purple-50 text-purple-600 border border-purple-100',
  'co-ed':    'bg-purple-50 text-purple-600 border border-purple-100',
}

const sizeMap = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
}

export default function Badge({ status, size = 'sm', label }) {
  const key = status?.toLowerCase()
  const color = colorMap[key] || 'bg-gray-100 text-gray-500 border border-gray-200'
  const sizeClass = sizeMap[size] || sizeMap.sm

  const displayLabel = label || (status ? status.charAt(0).toUpperCase() + status.slice(1) : '')

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClass}`}>
      {displayLabel}
    </span>
  )
}
