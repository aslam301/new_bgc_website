import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-sunny flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-brutal shadow-brutal rounded-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">
            There was an error confirming your account. The link may have expired or been used already.
          </p>
          <div className="space-y-3">
            <Link href="/auth/signup">
              <button className="w-full px-6 py-3 bg-coral text-white font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift">
                Try Signing Up Again
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="w-full px-6 py-3 bg-white text-ink font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
