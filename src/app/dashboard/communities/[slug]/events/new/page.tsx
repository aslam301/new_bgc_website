import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EventForm } from '@/components/events/EventForm'

interface NewEventPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function NewEventPage({ params }: NewEventPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get community
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (communityError || !community) {
    notFound()
  }

  // Check if user is admin
  const { data: isAdmin } = await supabase.rpc('is_community_admin', {
    p_community_id: community.id,
    p_user_id: user.id,
  })

  if (!isAdmin) {
    redirect(`/c/${slug}`)
  }

  return (
    <div className="min-h-screen art-bg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={`/dashboard/communities/${slug}/events`}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-coral transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Events
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            Create New Event
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Create an event for {community.name}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border-2 border-ink p-8 shadow-[6px_6px_0_0_hsl(var(--ink))]">
          <EventForm communityId={community.id} communitySlug={slug} />
        </div>
      </div>
    </div>
  )
}
