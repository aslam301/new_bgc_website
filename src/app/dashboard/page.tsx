import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-sunny p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-brutal shadow-brutal rounded-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}! 🎲</h1>
          <p className="text-gray-600">This is your dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-mint border-brutal shadow-brutal rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">My Communities</h3>
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-gray-600 mt-2">Communities you follow</p>
          </div>

          <div className="bg-sky border-brutal shadow-brutal rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">My Events</h3>
            <p className="text-4xl font-bold">0</p>
            <p className="text-sm text-gray-600 mt-2">Upcoming events</p>
          </div>

          <div className="bg-coral border-brutal shadow-brutal rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
            <button className="w-full mt-4 px-4 py-2 bg-white text-coral font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift">
              Create Community
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white border-brutal shadow-brutal rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-mint rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-bold">1</span>
              </div>
              <div>
                <h3 className="font-bold">Complete your profile</h3>
                <p className="text-sm text-gray-600">Add your location and BGG username</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-sky rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-bold">2</span>
              </div>
              <div>
                <h3 className="font-bold">Discover communities</h3>
                <p className="text-sm text-gray-600">Find board game communities in your city</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-grape rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <span className="font-bold">3</span>
              </div>
              <div>
                <h3 className="font-bold">Follow and attend events</h3>
                <p className="text-sm text-gray-600">Stay updated with game nights and meetups</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
