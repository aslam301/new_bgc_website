import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FollowButton } from '@/components/FollowButton'
import { PoweredByBadge } from '@/components/PoweredByBadge'

interface CommunityPageProps {
  params: {
    slug: string
  }
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = params
  const supabase = await createClient()

  // Get community data
  const { data: community, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !community) {
    notFound()
  }

  // Check if current user follows this community
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isFollowing = false
  if (user) {
    const { data: followData } = await supabase
      .from('community_followers')
      .select('id')
      .eq('community_id', community.id)
      .eq('user_id', user.id)
      .single()

    isFollowing = !!followData
  }

  // Get social links
  const socialLinks = [
    { name: 'WhatsApp', url: community.whatsapp_url, emoji: '💬', color: 'bg-green-500' },
    { name: 'Instagram', url: community.instagram_url, emoji: '📸', color: 'bg-pink-500' },
    { name: 'Discord', url: community.discord_url, emoji: '💬', color: 'bg-indigo-500' },
    { name: 'Website', url: community.website_url, emoji: '🌐', color: 'bg-blue-500' },
  ].filter((link) => link.url)

  return (
    <div className="min-h-screen bg-sunny">
      {/* Hero Section */}
      <div
        className="border-b-brutal py-12 px-8"
        style={{ backgroundColor: community.accent_color || '#FF6B6B' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Logo */}
            {community.logo_url ? (
              <img
                src={community.logo_url}
                alt={community.name}
                className="w-32 h-32 rounded-lg border-brutal shadow-brutal object-cover bg-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg border-brutal shadow-brutal bg-white flex items-center justify-center text-6xl">
                🎲
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-center md:text-left text-white">
              <h1 className="text-4xl font-bold mb-2">{community.name}</h1>
              <p className="text-lg opacity-90 mb-4">
                {community.city}{community.state ? `, ${community.state}` : ''}
              </p>
              <FollowButton
                communitySlug={slug}
                initialFollowing={isFollowing}
                initialFollowerCount={community.follower_count || 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Description */}
        {community.description && (
          <div className="bg-white border-brutal shadow-brutal rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">About</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{community.description}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-mint border-brutal shadow-brutal rounded-lg p-6 text-center">
            <div className="text-4xl font-bold">{community.follower_count || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Followers</div>
          </div>
          <div className="bg-sky border-brutal shadow-brutal rounded-lg p-6 text-center">
            <div className="text-4xl font-bold">{community.events_count || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Events</div>
          </div>
          <div className="bg-grape border-brutal shadow-brutal rounded-lg p-6 text-center text-white">
            <div className="text-4xl font-bold">{community.games_count || 0}</div>
            <div className="text-sm mt-1">Games</div>
          </div>
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="bg-white border-brutal shadow-brutal rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Connect With Us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${link.color} text-white px-6 py-4 rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift flex items-center justify-center gap-3 font-bold`}
                >
                  <span className="text-2xl">{link.emoji}</span>
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Events Section (Empty State) */}
        <div className="bg-white border-brutal shadow-brutal rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">Upcoming Events</h2>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">📅</div>
            <p>No upcoming events yet</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        </div>

        {/* Games Section (Empty State) */}
        <div className="bg-white border-brutal shadow-brutal rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3">Game Collection</h2>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">🎲</div>
            <p>Game collection coming soon</p>
            <p className="text-sm mt-1">Phase 3 feature</p>
          </div>
        </div>

        {/* Back to Discovery */}
        <div className="mt-8 text-center">
          <Link
            href="/communities"
            className="inline-block px-6 py-3 bg-white border-brutal shadow-brutal rounded-lg hover:shadow-brutal-lg btn-lift font-bold"
          >
            ← Discover More Communities
          </Link>
        </div>
      </div>

      {/* Powered By Badge */}
      <PoweredByBadge />
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CommunityPageProps) {
  const { slug } = params
  const supabase = await createClient()

  const { data: community } = await supabase
    .from('communities')
    .select('name, description, city')
    .eq('slug', slug)
    .single()

  if (!community) {
    return {
      title: 'Community Not Found',
    }
  }

  return {
    title: `${community.name} - BoardGameCulture`,
    description: community.description || `Join ${community.name}, a board gaming community in ${community.city}`,
  }
}
