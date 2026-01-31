'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b-4 border-ink">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-ink hover:text-coral transition-colors">
            BoardGameCulture
          </Link>

          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <button className="px-4 py-2 font-bold text-ink hover:text-coral transition-colors">
                        Dashboard
                      </button>
                    </Link>
                    <Link href="/communities">
                      <button className="px-4 py-2 font-bold text-ink hover:text-coral transition-colors">
                        Communities
                      </button>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-6 py-2 bg-white text-ink font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/communities">
                      <button className="px-4 py-2 font-bold text-ink hover:text-coral transition-colors">
                        Communities
                      </button>
                    </Link>
                    <Link href="/auth/login">
                      <button className="px-4 py-2 font-bold text-ink hover:text-coral transition-colors">
                        Log In
                      </button>
                    </Link>
                    <Link href="/auth/signup">
                      <button className="px-6 py-2 bg-coral text-white font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift">
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
