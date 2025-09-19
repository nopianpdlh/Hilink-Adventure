import { NextRequest, NextResponse } from 'next/server'
import { MidtransService, PaymentRequest } from '@/lib/midtrans'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema
const PaymentSchema = z.object({
  booking_id: z.string().uuid(),
  customer_details: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = PaymentSchema.parse(body)

    const supabase = await createClient()

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        trips (
          id,
          title,
          price_per_person
        ),
        equipment_bookings (
          equipment_id,
          quantity,
          equipment (
            name,
            rental_price_per_day
          )
        )
      `)
      .eq('id', validatedData.booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if booking is already paid
    if (booking.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Booking already paid' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const tripCost = booking.trips.price_per_person * booking.participants_count
    const equipmentCost = booking.equipment_bookings?.reduce((total: number, item: any) => {
      return total + (item.quantity * item.equipment.rental_price_per_day * booking.duration_days)
    }, 0) || 0

    const totalAmount = tripCost + equipmentCost

    // Prepare item details for Midtrans
    const itemDetails = [
      {
        id: `trip-${booking.trips.id}`,
        name: booking.trips.title,
        price: booking.trips.price_per_person,
        quantity: booking.participants_count,
        category: 'trip'
      }
    ]

    // Add equipment items
    if (booking.equipment_bookings?.length > 0) {
      booking.equipment_bookings.forEach((equipmentBooking: any) => {
        itemDetails.push({
          id: `equipment-${equipmentBooking.equipment_id}`,
          name: equipmentBooking.equipment.name,
          price: equipmentBooking.equipment.rental_price_per_day * booking.duration_days,
          quantity: equipmentBooking.quantity,
          category: 'equipment'
        })
      })
    }

    // Generate unique order ID
    const orderId = `HILINK-${booking.id}-${Date.now()}`

    // Prepare payment request
    const paymentRequest: PaymentRequest = {
      order_id: orderId,
      gross_amount: totalAmount,
      customer_details: validatedData.customer_details,
      item_details: itemDetails
    }

    // Create Snap token
    const snapResult = await MidtransService.createSnapToken(paymentRequest)

    // Save payment transaction record
    const { error: paymentError } = await supabase
      .from('payment_transactions')
      .insert({
        id: orderId,
        booking_id: booking.id,
        amount: totalAmount,
        status: 'pending',
        payment_method: 'midtrans',
        transaction_details: paymentRequest
      })

    if (paymentError) {
      console.error('Error saving payment transaction:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Update booking payment status to processing
    await supabase
      .from('bookings')
      .update({ 
        payment_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.id)

    return NextResponse.json({
      token: snapResult.token,
      redirect_url: snapResult.redirect_url,
      order_id: orderId,
      amount: totalAmount
    })

  } catch (error) {
    console.error('Payment token creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment token' },
      { status: 500 }
    )
  }
}