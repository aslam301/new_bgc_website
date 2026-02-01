import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Upload photo
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      photo_url,
      thumbnail_url,
      caption,
      event_id,
      community_id,
      album_name,
      type // 'event' or 'community'
    } = body

    if (!photo_url || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert photo
    if (type === 'event') {
      if (!event_id) {
        return NextResponse.json({ error: 'event_id required for event photos' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('event_photos')
        .insert({
          event_id,
          community_id,
          photo_url,
          thumbnail_url,
          caption,
          uploaded_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ photo: data })
    } else {
      if (!community_id) {
        return NextResponse.json({ error: 'community_id required for community photos' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('community_photos')
        .insert({
          community_id,
          photo_url,
          thumbnail_url,
          caption,
          album_name,
          uploaded_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ photo: data })
    }
  } catch (error: any) {
    console.error('Error uploading photo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Get photos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const event_id = searchParams.get('event_id')
    const community_id = searchParams.get('community_id')
    const album_name = searchParams.get('album_name')
    const type = searchParams.get('type') // 'event' or 'community'

    if (type === 'event' && event_id) {
      const { data, error } = await supabase
        .from('event_photos')
        .select('*, profiles:uploaded_by(username, full_name)')
        .eq('event_id', event_id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ photos: data })
    } else if (type === 'community' && community_id) {
      let query = supabase
        .from('community_photos')
        .select('*, profiles:uploaded_by(username, full_name)')
        .eq('community_id', community_id)
        .eq('status', 'approved')

      if (album_name) {
        query = query.eq('album_name', album_name)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ photos: data })
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  } catch (error: any) {
    console.error('Error fetching photos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
