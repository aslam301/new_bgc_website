import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get marketplace listings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const game_id = searchParams.get('game_id')
    const listing_type = searchParams.get('type')
    const condition = searchParams.get('condition')
    const location = searchParams.get('location')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('marketplace_listings')
      .select(`
        *,
        games(name, image_url),
        profiles:seller_id(username, full_name, avatar_url),
        marketplace_photos(photo_url, display_order)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (game_id) {
      query = query.eq('game_id', game_id)
    }

    if (listing_type) {
      query = query.eq('listing_type', listing_type)
    }

    if (condition) {
      query = query.eq('condition', condition)
    }

    if (location) {
      query = query.eq('pickup_location', location)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ listings: data })
  } catch (error: any) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create marketplace listing
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      game_id,
      title,
      description,
      condition,
      listing_type,
      fixed_price,
      starting_bid,
      reserve_price,
      buyout_price,
      auction_end_date,
      shipping_available,
      shipping_cost,
      pickup_location,
      use_intermediary,
      photos,
    } = body

    if (!game_id || !title || !description || !condition || !listing_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create listing
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .insert({
        game_id,
        seller_id: user.id,
        title,
        description,
        condition,
        listing_type,
        fixed_price,
        starting_bid,
        reserve_price,
        buyout_price,
        auction_end_date: auction_end_date ? new Date(auction_end_date).toISOString() : null,
        shipping_available,
        shipping_cost,
        pickup_location,
        use_intermediary,
        intermediary_fee: use_intermediary ? (fixed_price || starting_bid || 0) * 0.05 : 0, // 5% fee
      })
      .select()
      .single()

    if (listingError) throw listingError

    // Add photos if provided
    if (photos && photos.length > 0) {
      const photoInserts = photos.map((url: string, index: number) => ({
        listing_id: listing.id,
        photo_url: url,
        display_order: index,
      }))

      await supabase.from('marketplace_photos').insert(photoInserts)
    }

    return NextResponse.json({ listing })
  } catch (error: any) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
