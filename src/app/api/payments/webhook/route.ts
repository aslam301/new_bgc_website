import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRazorpayClient } from '@/lib/payments/razorpay'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // TODO: Verify webhook signature
    // For now, we'll just log the webhook

    const supabase = await createClient()

    // Store webhook
    const { data: webhook, error: webhookError } = await supabase
      .from('payment_webhooks')
      .insert({
        provider: 'razorpay',
        event_type: body.event,
        payload: body,
      })
      .select()
      .single()

    if (webhookError) throw webhookError

    // Process webhook based on event type
    if (body.event === 'payment.captured') {
      const paymentEntity = body.payload.payment.entity

      // Find payment by Razorpay order ID
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', paymentEntity.order_id)
        .single()

      if (payment && payment.status === 'pending') {
        // Update payment status
        await supabase
          .from('payments')
          .update({
            razorpay_payment_id: paymentEntity.id,
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', payment.id)

        // Mark webhook as processed
        await supabase
          .from('payment_webhooks')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            payment_id: payment.id,
          })
          .eq('id', webhook.id)
      }
    } else if (body.event === 'payment.failed') {
      const paymentEntity = body.payload.payment.entity

      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', paymentEntity.order_id)
        .single()

      if (payment) {
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
            error_code: paymentEntity.error_code,
            error_message: paymentEntity.error_description,
          })
          .eq('id', payment.id)

        await supabase
          .from('payment_webhooks')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            payment_id: payment.id,
          })
          .eq('id', webhook.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
