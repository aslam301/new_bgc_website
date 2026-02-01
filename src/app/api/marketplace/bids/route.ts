import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Place a bid
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { listing_id, bid_amount, is_auto_bid, max_bid_amount } = body

    if (!listing_id || !bid_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Validate listing
    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is not active' }, { status: 400 })
    }

    if (listing.seller_id === user.id) {
      return NextResponse.json({ error: 'Cannot bid on your own listing' }, { status: 400 })
    }

    if (listing.listing_type === 'fixed_price') {
      return NextResponse.json({ error: 'This is a fixed price listing' }, { status: 400 })
    }

    // Check if auction has ended
    if (listing.auction_end_date && new Date(listing.auction_end_date) < new Date()) {
      return NextResponse.json({ error: 'Auction has ended' }, { status: 400 })
    }

    // Validate bid amount
    const minimumBid = listing.current_bid > 0 ? listing.current_bid + 10 : listing.starting_bid
    if (bid_amount < minimumBid) {
      return NextResponse.json({
        error: `Minimum bid is ₹${minimumBid}`,
      }, { status: 400 })
    }

    // Place bid
    const { data: bid, error: bidError } = await supabase
      .from('marketplace_bids')
      .insert({
        listing_id,
        bidder_id: user.id,
        bid_amount,
        is_auto_bid,
        max_bid_amount,
      })
      .select()
      .single()

    if (bidError) throw bidError

    return NextResponse.json({ bid })
  } catch (error: any) {
    console.error('Error placing bid:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Get bids for a listing
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const listing_id = searchParams.get('listing_id')

    if (!listing_id) {
      return NextResponse.json({ error: 'listing_id required' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    // Get listing to check if user is seller
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('seller_id')
      .eq('id', listing_id)
      .single()

    const isSeller = listing && user && listing.seller_id === user.id

    let query = supabase
      .from('marketplace_bids')
      .select('*, profiles:bidder_id(username, full_name, avatar_url)')
      .eq('listing_id', listing_id)
      .order('bid_amount', { ascending: false })

    // If not seller, only show anonymized bids
    const { data, error } = await query

    if (error) throw error

    // Anonymize bidder info if not seller
    const bids = isSeller ? data : data?.map(bid => ({
      ...bid,
      profiles: null,
      bidder_id: null,
    }))

    return NextResponse.json({ bids })
  } catch (error: any) {
    console.error('Error fetching bids:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
