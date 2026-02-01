'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Clock, MapPin, IndianRupee, Gavel } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'

interface Listing {
  id: string
  title: string
  condition: string
  listing_type: string
  fixed_price?: number
  current_bid: number
  starting_bid?: number
  bid_count: number
  auction_end_date?: string
  pickup_location?: string
  shipping_available: boolean
  created_at: string
  games?: {
    name: string
    image_url?: string
  }
  profiles?: {
    username: string
    full_name: string
  }
  marketplace_photos?: Array<{
    photo_url: string
    display_order: number
  }>
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'fixed_price' | 'auction'>('all')

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filter !== 'all') {
          params.append('type', filter)
        }

        const res = await fetch(`/api/marketplace?${params}`)
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        }
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [filter])

  const getConditionBadge = (condition: string) => {
    const colors: Record<string, string> = {
      new: 'bg-mint',
      like_new: 'bg-sunny',
      good: 'bg-grape',
      fair: 'bg-coral',
      poor: 'bg-border',
    }
    return colors[condition] || 'bg-border'
  }

  return (
    <div className="min-h-screen art-bg">
      <div className="container max-w-6xl mx-auto px-5 py-10">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-black text-4xl text-foreground mb-4">
            Marketplace
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Buy and sell board games with fellow enthusiasts
          </p>
        </header>

        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { value: 'all', label: 'All Listings' },
            { value: 'fixed_price', label: 'Buy Now' },
            { value: 'auction', label: 'Auctions' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className={`px-4 py-2 font-bold text-sm border-2 border-ink transition-all ${
                filter === f.value
                  ? 'bg-coral text-white shadow-[3px_3px_0_0_hsl(var(--ink))]'
                  : 'bg-background text-foreground shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral border-t-transparent mx-auto"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-card border-2 border-ink">
            <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">No listings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const photo = listing.marketplace_photos?.sort((a, b) => a.display_order - b.display_order)[0]
              const isAuction = listing.listing_type === 'auction' || listing.listing_type === 'both'
              const price = isAuction ? listing.current_bid || listing.starting_bid : listing.fixed_price

              return (
                <Link
                  key={listing.id}
                  href={`/marketplace/${listing.id}`}
                  className="group bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-square border-b-2 border-ink overflow-hidden bg-background">
                    {photo ? (
                      <img
                        src={photo.photo_url}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : listing.games?.image_url ? (
                      <img
                        src={listing.games.image_url}
                        alt={listing.games.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Condition Badge */}
                    <div className="mb-3">
                      <span className={`inline-block px-2 py-1 ${getConditionBadge(listing.condition)} text-ink text-xs font-black uppercase border border-ink`}>
                        {listing.condition.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-black text-lg text-foreground mb-2 group-hover:text-coral transition-colors line-clamp-2">
                      {listing.title}
                    </h3>

                    {/* Game Name */}
                    {listing.games && (
                      <p className="text-xs text-muted-foreground mb-3">{listing.games.name}</p>
                    )}

                    {/* Price */}
                    <div className="mb-4">
                      {isAuction && listing.current_bid > 0 ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <Gavel size={16} className="text-coral" />
                            <span className="text-lg font-black text-foreground">
                              ₹{listing.current_bid.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {listing.bid_count} bid{listing.bid_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <IndianRupee size={16} className="text-coral" />
                          <span className="text-lg font-black text-foreground">
                            ₹{price?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {listing.pickup_location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{listing.pickup_location}</span>
                        </div>
                      )}
                      {isAuction && listing.auction_end_date && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Ends {formatDate(listing.auction_end_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
