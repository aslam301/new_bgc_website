import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRazorpayClient } from '@/lib/payments/razorpay'

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
      payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body

    if (!payment_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get payment record
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Verify signature
    const razorpay = getRazorpayClient()
    const isValid = await razorpay.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      // Update payment as failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          error_code: 'SIGNATURE_MISMATCH',
          error_message: 'Payment signature verification failed',
        })
        .eq('id', payment_id)

      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Fetch payment details from Razorpay
    const razorpayPayment = await razorpay.fetchPayment(razorpay_payment_id)

    // Update payment as completed
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          razorpay_payment: razorpayPayment,
        },
      })
      .eq('id', payment_id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, payment })
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
