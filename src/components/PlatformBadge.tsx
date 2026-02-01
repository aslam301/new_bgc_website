import Link from 'next/link'

export function PlatformBadge() {
  return (
    <Link
      href="/platform"
      target="_blank"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-card border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--coral))] hover:shadow-[4px_4px_0_0_hsl(var(--coral))] transition-all btn-lift"
    >
      <img src="/bgc_logo.png" alt="BGC" className="h-4 w-auto" />
      <span className="font-mono text-[9px] font-bold text-muted-foreground">
        Made with BGC
      </span>
    </Link>
  )
}
