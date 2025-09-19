import { NextRequest, NextResponse } from 'next/server'
import { MidtransService } from '@/lib/midtrans'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const resolvedParams = await params
    const { orderId } = resolvedParams
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get payment transaction from our database
    const { data: paymentTransaction, error: dbError } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        bookings (
          id,
          status,
          trips (
            title
          )
        )
      `)
      .eq('id', orderId)
      .single()

    if (dbError || !paymentTransaction) {
      return NextResponse.json(
        { error: 'Payment transaction not found' },
        { status: 404 }
      )
    }

    // Get latest status from Midtrans
    try {
      const midtransStatus = await MidtransService.checkTransactionStatus(orderId)
      
      // Update our database with latest Midtrans status if different
      if (midtransStatus.transaction_status !== paymentTransaction.transaction_status) {
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({
            transaction_status: midtransStatus.transaction_status,
            fraud_status: midtransStatus.fraud_status,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('Error updating payment status:', updateError)
        }
      }

      return NextResponse.json({
        order_id: orderId,
        status: paymentTransaction.status,
        transaction_status: midtransStatus.transaction_status,
        fraud_status: midtransStatus.fraud_status,
        amount: paymentTransaction.amount,
        booking: {
          id: paymentTransaction.bookings.id,
          status: paymentTransaction.bookings.status,
          trip_title: paymentTransaction.bookings.trips.title
        },
        created_at: paymentTransaction.created_at,
        updated_at: paymentTransaction.updated_at
      })

    } catch (midtransError) {
      console.error('Error checking Midtrans status:', midtransError)
      
      // Return database status if Midtrans check fails
      return NextResponse.json({
        order_id: orderId,
        status: paymentTransaction.status,
        transaction_status: paymentTransaction.transaction_status,
        fraud_status: paymentTransaction.fraud_status,
        amount: paymentTransaction.amount,
        booking: {
          id: paymentTransaction.bookings.id,
          status: paymentTransaction.bookings.status,
          trip_title: paymentTransaction.bookings.trips.title
        },
        created_at: paymentTransaction.created_at,
        updated_at: paymentTransaction.updated_at,
        note: 'Status from database (Midtrans check failed)'
      })
    }

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}