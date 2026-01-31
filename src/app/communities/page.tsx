import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function CommunitiesPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-sunny p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-brutal shadow-brutal rounded-lg p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Communities</h1>
            <p className="text-xl text-gray-600 mb-8">
              Community discovery coming soon! This will be part of Phase 1C.
            </p>
            <div className="inline-block bg-mint border-brutal shadow-brutal rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-2">🚧 Under Construction</h3>
              <p className="text-gray-700">
                Features coming in this section:
              </p>
              <ul className="text-left mt-4 space-y-2 text-gray-700">
                <li>• Search communities by name</li>
                <li>• Filter by city</li>
                <li>• IP-based location detection</li>
                <li>• Community cards with follower counts</li>
                <li>• Follow/Unfollow functionality</li>
              </ul>
            </div>
            <div className="mt-8">
              <Link href="/dashboard">
                <button className="px-6 py-3 bg-coral text-white font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
