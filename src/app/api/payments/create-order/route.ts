import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRazorpayClient, rupeesToPaise } from '@/lib/payments/razorpay'

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
      amount,
      payment_type,
      event_registration_id,
      marketplace_listing_id,
      intermediary_request_id,
      metadata,
    } = body

    if (!amount || !payment_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount,
        currency: 'INR',
        payment_method: 'razorpay',
        payment_type,
        event_registration_id,
        marketplace_listing_id,
        intermediary_request_id,
        metadata,
        status: 'pending',
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Create Razorpay order
    const razorpay = getRazorpayClient()
    const order = await razorpay.createOrder({
      amount: rupeesToPaise(amount),
      currency: 'INR',
      receipt: payment.id,
      notes: {
        payment_id: payment.id,
        user_id: user.id,
        payment_type,
      },
    })

    // Update payment with Razorpay order ID
    await supabase
      .from('payments')
      .update({ razorpay_order_id: order.id })
      .eq('id', payment.id)

    return NextResponse.json({
      payment_id: payment.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error('Error creating payment order:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
