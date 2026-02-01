'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    router.push('/')
  }

  return (
    <div className="md:hidden relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 border-2 border-ink bg-card"
        aria-label="Menu"
      >
        {isOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Dropdown */}
          <div className="absolute right-0 top-12 w-56 bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] z-50">
            <div className="p-3 space-y-2">
              <Link href="/discover" onClick={() => setIsOpen(false)}>
                <button className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-muted transition-colors">
                  Discover
                </button>
              </Link>

              <Link href="/events" onClick={() => setIsOpen(false)}>
                <button className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-muted transition-colors">
                  Events
                </button>
              </Link>

              <Link href="/games" onClick={() => setIsOpen(false)}>
                <button className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-muted transition-colors">
                  Games
                </button>
              </Link>

              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <button className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-muted transition-colors">
                      Dashboard
                    </button>
                  </Link>

                  <div className="border-t-2 border-ink my-2" />

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-coral hover:bg-muted transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-muted transition-colors">
                      Log In
                    </button>
                  </Link>

                  <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                    <button className="w-full text-left px-3 py-2 text-xs font-bold bg-coral text-white hover:bg-coral/90 transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
