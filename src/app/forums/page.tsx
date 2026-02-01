'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, Users, ArrowRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  thread_count: number
  post_count: number
}

export default function ForumsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/forums')
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen art-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-coral border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen art-bg">
      <div className="container max-w-4xl mx-auto px-5 py-10">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-black text-4xl text-foreground mb-4">
            Community Forums
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Join the discussion and connect with fellow board game enthusiasts
          </p>
        </header>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/forums/${category.slug}`}
              className="block group bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] hover:shadow-[6px_6px_0_0_hsl(var(--ink))] transition-all"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-4xl flex-shrink-0">
                    {category.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-foreground mb-2 group-hover:text-coral transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span>{category.thread_count} threads</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{category.post_count} posts</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ArrowRight className="text-muted-foreground group-hover:text-coral transition-colors" size={20} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20 bg-card border-2 border-ink">
            <MessageSquare className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">No forum categories yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
