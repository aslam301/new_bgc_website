'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LocationData {
  city: string
  state: string
  country: string
  lat: number | null
  lng: number | null
  source: string
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Detect location on component mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('/api/location/detect')
        const data = await res.json()
        setDetectedLocation(data)
      } catch (err) {
        console.error('Location detection failed:', err)
        // Set default if detection fails
        setDetectedLocation({
          city: 'Other',
          state: '',
          country: 'India',
          lat: null,
          lng: null,
          source: 'fallback',
        })
      }
    }

    detectLocation()
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signupError) throw signupError

      if (data.user) {
        // Update profile with detected location
        if (detectedLocation) {
          await supabase
            .from('profiles')
            .update({
              detected_city: detectedLocation.city,
              detected_state: detectedLocation.state,
              location_lat: detectedLocation.lat,
              location_lng: detectedLocation.lng,
            })
            .eq('id', data.user.id)
        }

        setSuccess(true)
        // If email confirmation is disabled, redirect to dashboard
        if (data.user.identities?.length === 0) {
          setError('Email already registered')
          setSuccess(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-sunny flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border-brutal shadow-brutal rounded-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email!</h2>
            <p className="text-gray-600 mb-6">
              We've sent a confirmation link to <span className="font-bold">{email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to verify your account and get started.
            </p>
            <Link href="/auth/login">
              <button className="px-6 py-3 bg-coral text-white font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sunny flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-brutal shadow-brutal rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-600">Join BoardGameCulture today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-coral/10 border-2 border-coral rounded-lg p-4">
                <p className="text-coral font-bold text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-brutal shadow-brutal focus:shadow-brutal-lg outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-brutal shadow-brutal focus:shadow-brutal-lg outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border-brutal shadow-brutal focus:shadow-brutal-lg outline-none transition-all"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border-brutal shadow-brutal focus:shadow-brutal-lg outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="text-xs text-gray-600">
              By signing up, you agree to our{' '}
              <Link href="/legal/terms" className="text-coral font-bold hover:underline">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-coral font-bold hover:underline">
                Privacy Policy
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-coral text-white font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-coral font-bold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-ink">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
