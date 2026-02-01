interface GameStatusBadgeProps {
  status: 'own' | 'wishlist' | 'played' | 'want_to_play'
}

export default function GameStatusBadge({ status }: GameStatusBadgeProps) {
  const statusConfig = {
    own: {
      label: 'Own',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    wishlist: {
      label: 'Wishlist',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    played: {
      label: 'Played',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    want_to_play: {
      label: 'Want to Play',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
  }

  const config = statusConfig[status]

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  )
}
