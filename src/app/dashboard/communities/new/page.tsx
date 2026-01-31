import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { CommunityForm } from '@/components/CommunityForm'

export default async function NewCommunityPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-sunny p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white border-brutal shadow-brutal rounded-lg p-8 mb-6">
            <h1 className="text-3xl font-bold mb-2">Create Your Community</h1>
            <p className="text-gray-600">
              Get a shareable profile page for your board game community in 5 minutes
            </p>
          </div>

          {/* Benefits Card */}
          <div className="bg-mint border-brutal shadow-brutal rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">What you'll get:</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-xl mr-2">🔗</span>
                <div>
                  <strong>Shareable URL:</strong> boardgameculture.com/c/your-community
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-2">🎪</span>
                <div>
                  <strong>Event Management:</strong> Create and manage game nights (Phase 2)
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-2">🎲</span>
                <div>
                  <strong>Game Collection:</strong> Showcase your game library (Phase 3)
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-2">📸</span>
                <div>
                  <strong>Photo Galleries:</strong> Share memories from your events (Phase 4)
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-2">👥</span>
                <div>
                  <strong>Followers:</strong> Build your community following
                </div>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-white border-brutal shadow-brutal rounded-lg p-8">
            <CommunityForm />
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Need help? <a href="/support" className="text-coral font-bold hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
