import Link from 'next/link'

export function PoweredByBadge() {
  return (
    <Link
      href="/platform"
      target="_blank"
      className="fixed bottom-4 right-4 bg-white border-brutal shadow-brutal rounded-lg px-4 py-2 hover:shadow-brutal-lg transition-shadow z-50"
    >
      <div className="flex items-center gap-2">
        <div className="text-xs">
          <div className="text-gray-500">Powered by</div>
          <div className="font-bold text-coral">BoardGameCulture</div>
        </div>
        <div className="text-2xl">🎲</div>
      </div>
    </Link>
  )
}
