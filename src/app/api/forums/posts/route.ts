import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get posts for a thread
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const thread_id = searchParams.get('thread_id')

    if (!thread_id) {
      return NextResponse.json({ error: 'thread_id required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .select('*, profiles:author_id(username, full_name, avatar_url)')
      .eq('thread_id', thread_id)
      .eq('is_deleted', false)
      .order('created_at')

    if (error) throw error

    return NextResponse.json({ posts: data })
  } catch (error: any) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { thread_id, content, reply_to_id } = body

    if (!thread_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if thread is locked
    const { data: thread } = await supabase
      .from('forum_threads')
      .select('is_locked')
      .eq('id', thread_id)
      .single()

    if (thread?.is_locked) {
      return NextResponse.json({ error: 'Thread is locked' }, { status: 403 })
    }

    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .insert({
        thread_id,
        content,
        reply_to_id,
        author_id: user.id,
      })
      .select()
      .single()

    if (postError) throw postError

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
