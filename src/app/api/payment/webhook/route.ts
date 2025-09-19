import { NextRequest, NextResponse } from 'next/server'
import { MidtransService } from '@/lib/midtrans'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()
    console.log('Midtrans notification received:', notification)

    // Parse and verify notification
    const paymentData = MidtransService.parseWebhookNotification(notification)

    const supabase = await createClient()

    // Update payment transaction
    const { data: paymentTransaction, error: paymentError } = await supabase
      .from('payment_transactions')
      .update({
        status: paymentData.payment_status,
        transaction_status: paymentData.transaction_status,
        fraud_status: paymentData.fraud_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentData.order_id)
      .select('booking_id')
      .single()

    if (paymentError) {
      console.error('Error updating payment transaction:', paymentError)
      return NextResponse.json(
        { error: 'Failed to update payment transaction' },
        { status: 500 }
      )
    }

    // Update booking status based on payment status
    let bookingStatus = 'pending'
    let paymentStatus = 'pending'

    if (paymentData.payment_status === 'success') {
      bookingStatus = 'confirmed'
      paymentStatus = 'paid'

      // Release equipment holds and confirm stock allocation
      await supabase.rpc('confirm_booking_and_release_holds', {
        booking_id_param: paymentTransaction.booking_id
      })

      // TODO: Send confirmation email
      console.log('Booking confirmed, should send confirmation email')

    } else if (paymentData.payment_status === 'failed') {
      bookingStatus = 'cancelled'
      paymentStatus = 'failed'

      // Release equipment holds
      await supabase
        .from('equipment_holds')
        .delete()
        .eq('booking_id', paymentTransaction.booking_id)

    } else {
      // Keep as pending for other statuses
      paymentStatus = 'processing'
    }

    // Update booking
    const { error: bookingUpdateError } = await supabase
      .from('bookings')
      .update({
        status: bookingStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentTransaction.booking_id)

    if (bookingUpdateError) {
      console.error('Error updating booking:', bookingUpdateError)
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle GET request for webhook verification
export async function GET() {
  return NextResponse.json({ message: 'Midtrans webhook endpoint is active' })
}