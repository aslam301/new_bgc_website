'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { CommunityCard } from '@/components/CommunityCard'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Filter } from 'lucide-react'

const INDIAN_CITIES = [
  'All Cities',
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad',
  'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah',
  'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai',
  'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad',
  'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar',
  'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar', 'Thiruvananthapuram',
  'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Guntur', 'Bikaner', 'Amravati',
  'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi',
  'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela',
  'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar',
  'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu',
  'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli',
  'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala', 'Other'
]

const SORT_OPTIONS = [
  { value: 'followers', label: 'Most Followers' },
  { value: 'newest', label: 'Newest First' },
  { value: 'active', label: 'Recently Active' },
  { value: 'alpha', label: 'Alphabetical' },
]

interface Community {
  id: string
  slug: string
  name: string
  description: string | null
  city: string
  state: string | null
  logo_url: string | null
  accent_color: string
  follower_count: number
  events_count: number
  games_count: number
}

export default function CommunitiesPage() {
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All Cities')
  const [sort, setSort] = useState('followers')
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})

  // Fetch communities
  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (city && city !== 'All Cities') params.append('city', city)
        params.append('sort', sort)

        const res = await fetch(`/api/communities?${params}`)
        const data = await res.json()

        if (data.communities) {
          setCommunities(data.communities)

          // Fetch following status if logged in
          if (user) {
            const followingRes = await fetch('/api/users/me/following')
            const followingData = await followingRes.json()
            if (followingData.following) {
              const map: Record<string, boolean> = {}
              followingData.following.forEach((f: any) => {
                map[f.community_id] = true
              })
              setFollowingMap(map)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchCommunities, 300)
    return () => clearTimeout(debounce)
  }, [search, city, sort, user])

  const handleFollowChange = (communityId: string, following: boolean) => {
    setFollowingMap((prev) => ({ ...prev, [communityId]: following }))
    // Update follower count in community list
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === communityId
          ? { ...c, follower_count: c.follower_count + (following ? 1 : -1) }
          : c
      )
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen art-bg relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-40 right-10 w-40 h-40 bg-sunny/15 -rotate-12 -z-10 animate-float" />
        <div className="absolute bottom-40 -left-16 w-32 h-32 bg-grape/10 rotate-45 -z-10 animate-float" style={{ animationDelay: '3s' }} />

        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-8 mb-6 animate-slide-up">
            <h1 className="text-3xl font-black mb-2 text-ink uppercase tracking-tight">Discover Communities</h1>
            <p className="text-muted-foreground">Find board game communities in your city</p>
          </div>

          {/* Filters */}
          <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-6 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-xs font-black mb-2 uppercase tracking-wider text-muted-foreground">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search communities..."
                    className="w-full px-4 py-3 pl-10 border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                </div>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-black mb-2 uppercase tracking-wider text-muted-foreground">
                  City
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral appearance-none"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-black mb-2 uppercase tracking-wider text-muted-foreground">
                  Sort By
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-pulse">🎲</div>
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">Loading communities...</p>
            </div>
          ) : communities.length === 0 ? (
            <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--sunny))] p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-black mb-2 text-ink uppercase">No communities found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Found {communities.length} {communities.length === 1 ? 'community' : 'communities'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community, index) => (
                  <div
                    key={community.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CommunityCard
                      community={community}
                      isFollowing={!!followingMap[community.id]}
                      onFollowChange={(following) => handleFollowChange(community.id, following)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
