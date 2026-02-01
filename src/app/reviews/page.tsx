'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Calendar, User } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image_url?: string
  article_type: string
  rating?: number
  published_at: string
  profiles?: {
    username: string
    full_name: string
    avatar_url?: string
  }
  games?: {
    name: string
    image_url?: string
  }
}

export default function ReviewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'review' | 'guide' | 'comparison'>('all')

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filter !== 'all') {
          params.append('type', filter)
        }

        const res = await fetch(`/api/articles?${params}`)
        if (res.ok) {
          const data = await res.json()
          setArticles(data.articles || [])
        }
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [filter])

  return (
    <div className="min-h-screen art-bg">
      <div className="container max-w-6xl mx-auto px-5 py-10">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-black text-4xl text-foreground mb-4">
            Reviews & Guides
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Expert reviews, comprehensive guides, and game comparisons from the community
          </p>
        </header>

        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'review', label: 'Reviews' },
            { value: 'guide', label: 'Guides' },
            { value: 'comparison', label: 'Comparisons' },
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

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral border-t-transparent mx-auto"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-card border-2 border-ink">
            <p className="text-muted-foreground">No articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/reviews/${article.slug}`}
                className="group bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all overflow-hidden"
              >
                {/* Cover Image */}
                {article.cover_image_url && (
                  <div className="aspect-video border-b-2 border-ink overflow-hidden">
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-5">
                  {/* Type Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-sunny text-ink text-xs font-black uppercase border border-ink">
                      {article.article_type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-black text-lg text-foreground mb-2 group-hover:text-coral transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Rating */}
                  {article.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(article.rating!) ? 'fill-sunny text-sunny' : 'text-border'}
                        />
                      ))}
                      <span className="text-xs font-bold ml-1">{article.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {article.profiles && (
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{article.profiles.full_name || article.profiles.username}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(article.published_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
