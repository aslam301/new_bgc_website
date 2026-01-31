'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug, isValidSlug } from '@/lib/utils/slug'

const INDIAN_CITIES = [
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
].sort()

const ACCENT_COLORS = [
  { name: 'Coral', value: '#FF6B6B' },
  { name: 'Sunny', value: '#FFE66D' },
  { name: 'Grape', value: '#B565D8' },
  { name: 'Mint', value: '#6BCF7F' },
  { name: 'Sky', value: '#4ECDC4' },
]

export function CommunityForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    city: '',
    state: '',
    accent_color: '#FF6B6B',
    whatsapp_url: '',
    instagram_url: '',
    discord_url: '',
    website_url: '',
  })

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && formData.name) {
      const newSlug = generateSlug(formData.name)
      setFormData((prev) => ({ ...prev, slug: newSlug }))
    }
  }, [formData.name, slugManuallyEdited])

  // Check slug availability
  useEffect(() => {
    if (!formData.slug || !isValidSlug(formData.slug)) {
      setSlugAvailable(null)
      return
    }

    const checkSlug = async () => {
      setCheckingSlug(true)
      try {
        const res = await fetch(`/api/communities/check-slug?slug=${formData.slug}`)
        const data = await res.json()
        setSlugAvailable(data.available)
      } catch (err) {
        console.error('Slug check error:', err)
      } finally {
        setCheckingSlug(false)
      }
    }

    const debounce = setTimeout(checkSlug, 500)
    return () => clearTimeout(debounce)
  }, [formData.slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate
      if (!formData.name || !formData.slug || !formData.city) {
        setError('Name, URL slug, and city are required')
        setLoading(false)
        return
      }

      if (!isValidSlug(formData.slug)) {
        setError('Invalid slug format. Use only lowercase letters, numbers, and hyphens.')
        setLoading(false)
        return
      }

      if (slugAvailable === false) {
        setError('This URL slug is already taken. Please choose another.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create community')
      }

      // Redirect to community page
      router.push(`/c/${data.community.slug}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border-brutal border-red-500 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Community Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-bold mb-2">
          Community Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border-brutal rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
          placeholder="Bangalore Board Gamers"
          required
        />
      </div>

      {/* URL Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-bold mb-2">
          URL Slug *
        </label>
        <div className="flex items-center">
          <span className="bg-gray-100 px-4 py-3 border-brutal border-r-0 rounded-l-lg text-gray-600">
            boardgameculture.com/c/
          </span>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => {
              setFormData({ ...formData, slug: e.target.value })
              setSlugManuallyEdited(true)
            }}
            className="flex-1 px-4 py-3 border-brutal rounded-r-lg focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="bangalore-gamers"
            required
          />
        </div>
        {checkingSlug && (
          <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
        )}
        {!checkingSlug && slugAvailable === true && (
          <p className="text-sm text-green-600 mt-1">✓ Available</p>
        )}
        {!checkingSlug && slugAvailable === false && (
          <p className="text-sm text-red-600 mt-1">✗ Already taken</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Lowercase letters, numbers, and hyphens only
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-bold mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border-brutal rounded-lg focus:outline-none focus:ring-2 focus:ring-coral h-32 resize-none"
          placeholder="Tell people about your community..."
        />
      </div>

      {/* City & State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-bold mb-2">
            City *
          </label>
          <select
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 border-brutal rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
            required
          >
            <option value="">Select city</option>
            {INDIAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-bold mb-2">
            State (Optional)
          </label>
          <input
            type="text"
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-4 py-3 border-brutal rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="Karnataka"
          />
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-sm font-bold mb-2">Accent Color</label>
        <div className="flex gap-4">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData({ ...formData, accent_color: color.value })}
              className={`w-12 h-12 rounded-lg border-brutal ${
                formData.accent_color === color.value ? 'ring-4 ring-offset-2 ring-ink' : ''
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Social Links (Optional)</h3>

        <div>
          <label htmlFor="whatsapp_url" className="block text-sm font-bold mb-2">
            WhatsApp Group Link
          </label>
          <input
            type="url"
            id="whatsapp_url"
            value={formData.whatsapp_url}
            onChange={(e) => setFormData({ ...formData, whatsapp_url: e.target.value })}
            className="w-full px-4 py-3 border-brutal rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="https://chat.whatsapp.com/..."
          />
        </div>

        <div>
          <label htmlFor="instagram_url" className="block text-sm font-bold mb-2">
            Instagram Profile
          </label>
          <input
            type="url"
            id="instagram_url"
            value={formData.instagram_url}
            onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
            className="w-full px-4 py-3 border-brutal rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <label htmlFor="discord_url" className="block text-sm font-bold mb-2">
            Discord Server
          </label>
          <input
            type="url"
            id="discord_url"
            value={formData.discord_url}
            onChange={(e) => setFormData({ ...formData, discord_url: e.target.value })}
            className="w-full px-4 py-3 border-brutal rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="https://discord.gg/..."
          />
        </div>

        <div>
          <label htmlFor="website_url" className="block text-sm font-bold mb-2">
            Website
          </label>
          <input
            type="url"
            id="website_url"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            className="w-full px-4 py-3 border-brutal rounded-lg focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || slugAvailable === false}
        className="w-full px-6 py-4 bg-coral text-white font-bold rounded-lg border-brutal shadow-brutal hover:shadow-brutal-lg btn-lift disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Community...' : 'Create Community'}
      </button>
    </form>
  )
}
