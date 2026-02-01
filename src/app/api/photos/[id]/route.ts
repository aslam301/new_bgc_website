import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Delete photo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'event' or 'community'

    if (type === 'event') {
      const { error } = await supabase
        .from('event_photos')
        .delete()
        .eq('id', id)
        .eq('uploaded_by', user.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('community_photos')
        .delete()
        .eq('id', id)
        .eq('uploaded_by', user.id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting photo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Moderate photo (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, rejection_reason, type, community_id } = body

    if (!type || !community_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify admin status
    const { data: membership } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', community_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update photo
    if (type === 'event') {
      const { error } = await supabase
        .from('event_photos')
        .update({
          status,
          rejection_reason,
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('community_photos')
        .update({
          status,
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error moderating photo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
