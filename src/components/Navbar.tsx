'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Gamepad2, User, LogOut } from 'lucide-react'

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="bg-card border-b-2 border-ink sticky top-0 z-40 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-black text-ink hover:text-coral transition-colors"
          >
            <Gamepad2 size={24} strokeWidth={2.5} />
            <span className="hidden sm:inline uppercase tracking-tight">BoardGameCulture</span>
            <span className="sm:hidden uppercase tracking-tight">BGC</span>
          </Link>

          <div className="flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/communities">
                      <button className="px-4 py-2 font-bold text-sm text-ink hover:text-coral transition-colors uppercase tracking-wide">
                        Communities
                      </button>
                    </Link>
                    <Link href="/dashboard">
                      <button className="px-4 py-2 bg-mint text-ink font-bold rounded border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift text-xs uppercase tracking-wide flex items-center gap-2">
                        <User size={14} />
                        <span className="hidden sm:inline">Dashboard</span>
                      </button>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-2 bg-muted text-ink font-bold rounded border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift"
                      title="Sign Out"
                    >
                      <LogOut size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/communities">
                      <button className="px-4 py-2 font-bold text-sm text-ink hover:text-coral transition-colors uppercase tracking-wide">
                        Communities
                      </button>
                    </Link>
                    <Link href="/auth/login">
                      <button className="px-4 py-2 font-bold text-sm text-ink hover:text-coral transition-colors uppercase tracking-wide">
                        Log In
                      </button>
                    </Link>
                    <Link href="/auth/signup">
                      <button className="px-6 py-2 bg-coral text-white font-bold rounded border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] btn-lift text-xs uppercase tracking-wide">
                        Sign Up
                      </button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
