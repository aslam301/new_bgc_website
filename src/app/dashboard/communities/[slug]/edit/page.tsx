import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditCommunityForm } from '@/components/EditCommunityForm'

interface EditCommunityPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditCommunityPage({ params }: EditCommunityPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get community
  const { data: community } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!community) notFound()

  // Check if user is admin
  const { data: isAdmin } = await supabase
    .from('community_admins')
    .select('id, role')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .single()

  if (!isAdmin) {
    redirect(`/c/${slug}`)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-3 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-4 md:mb-6">
            <Link
              href={`/dashboard/communities/${slug}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-coral transition-colors uppercase tracking-wide"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-ink mb-2 uppercase tracking-tight">
              Edit Community
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-mono">
              Update {community.name}'s profile and settings
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border-2 border-ink shadow-[4px_4px_0_0_hsl(var(--ink))] p-4 md:p-8">
            <EditCommunityForm community={community} />
          </div>
        </div>
      </div>
    </>
  )
}
