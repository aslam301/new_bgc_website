'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

interface Community {
  id: string
  slug: string
  name: string
  description: string | null
  city: string
  state: string | null
  logo_url: string | null
  accent_color: string
  whatsapp_url: string | null
  instagram_url: string | null
  discord_url: string | null
  website_url: string | null
}

interface EditCommunityFormProps {
  community: Community
}

export function EditCommunityForm({ community }: EditCommunityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: community.name || '',
    description: community.description || '',
    city: community.city || '',
    state: community.state || '',
    accent_color: community.accent_color || '#FF6B6B',
    whatsapp_url: community.whatsapp_url || '',
    instagram_url: community.instagram_url || '',
    discord_url: community.discord_url || '',
    website_url: community.website_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.city) {
        setError('Name and city are required')
        setLoading(false)
        return
      }

      const res = await fetch(`/api/communities/${community.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update community')
      }

      setSuccess(true)

      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        router.push(`/dashboard/communities/${community.slug}`)
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {error && (
        <div className="bg-coral/10 border-2 border-coral text-coral px-3 py-2 md:px-4 md:py-3 font-bold text-xs md:text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-mint/20 border-2 border-mint text-ink px-3 py-2 md:px-4 md:py-3 font-bold text-xs md:text-sm">
          Community updated successfully! Redirecting...
        </div>
      )}

      {/* Community Name */}
      <div>
        <label htmlFor="name" className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide">
          Community Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
          placeholder="Bangalore Board Gamers"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral h-24 md:h-32 resize-none"
          placeholder="Tell people about your community..."
        />
      </div>

      {/* City & State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label htmlFor="city" className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide">
            City *
          </label>
          <select
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
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
          <label htmlFor="state" className="block text-xs md:text-sm font-black mb-1 md:mb-2 uppercase tracking-wide">
            State (Optional)
          </label>
          <input
            type="text"
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="Karnataka"
          />
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-xs md:text-sm font-black mb-2 md:mb-3 uppercase tracking-wide">
          Accent Color
        </label>
        <div className="flex gap-2 md:gap-4">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData({ ...formData, accent_color: color.value })}
              className={`w-10 h-10 md:w-12 md:h-12 rounded border-2 border-ink transition-all ${
                formData.accent_color === color.value
                  ? 'ring-4 ring-offset-2 ring-ink shadow-[3px_3px_0_0_hsl(var(--ink))]'
                  : 'hover:shadow-[2px_2px_0_0_hsl(var(--ink))]'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-3 md:space-y-4 pt-2 md:pt-4 border-t-2 border-border">
        <h3 className="text-sm md:text-base font-black uppercase tracking-wide">Social Links (Optional)</h3>

        <div>
          <label htmlFor="whatsapp_url" className="block text-xs font-black mb-1 uppercase tracking-wide text-muted-foreground">
            WhatsApp Group Link
          </label>
          <input
            type="url"
            id="whatsapp_url"
            value={formData.whatsapp_url}
            onChange={(e) => setFormData({ ...formData, whatsapp_url: e.target.value })}
            className="w-full px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="https://chat.whatsapp.com/..."
          />
        </div>

        <div>
          <label htmlFor="instagram_url" className="block text-xs font-black mb-1 uppercase tracking-wide text-muted-foreground">
            Instagram Profile
          </label>
          <input
            type="url"
            id="instagram_url"
            value={formData.instagram_url}
            onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
            className="w-full px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <label htmlFor="discord_url" className="block text-xs font-black mb-1 uppercase tracking-wide text-muted-foreground">
            Discord Server
          </label>
          <input
            type="url"
            id="discord_url"
            value={formData.discord_url}
            onChange={(e) => setFormData({ ...formData, discord_url: e.target.value })}
            className="w-full px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="https://discord.gg/..."
          />
        </div>

        <div>
          <label htmlFor="website_url" className="block text-xs font-black mb-1 uppercase tracking-wide text-muted-foreground">
            Website
          </label>
          <input
            type="url"
            id="website_url"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            className="w-full px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm border-2 border-ink rounded focus:outline-none focus:ring-2 focus:ring-coral"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || success}
        className="w-full px-4 py-3 md:px-6 md:py-4 bg-coral text-white font-bold text-xs md:text-sm uppercase tracking-wide border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] btn-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Saving Changes...' : success ? 'Saved!' : 'Save Changes'}
      </button>
    </form>
  )
}
