import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const bookingId = searchParams.get('booking_id')
    
    if (!orderId && !bookingId) {
      return NextResponse.json({ 
        error: 'Either order_id or booking_id is required' 
      }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        id,
        order_id,
        total_amount,
        status,
        trip_date,
        notes,
        created_at,
        updated_at,
        trips!inner (
          id,
          title,
          location,
          start_date,
          end_date,
          price
        ),
        users!inner (
          id,
          full_name,
          email,
          phone
        ),
        equipment_bookings (
          id,
          quantity,
          daily_rate,
          equipment (
            id,
            name,
            category,
            price_per_day
          )
        )
      `)
    
    if (orderId) {
      query = query.eq('order_id', orderId)
    } else {
      query = query.eq('id', bookingId)
    }
    
    const { data: booking, error } = await query.single()
    
    if (error) {
      console.error('Booking details error:', error)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // Format response
    const tripData = Array.isArray(booking.trips) ? booking.trips[0] : booking.trips
    const userData = Array.isArray(booking.users) ? booking.users[0] : booking.users
    
    const response = {
      id: booking.id,
      order_id: booking.order_id,
      total_amount: booking.total_amount,
      status: booking.status,
      trip_date: booking.trip_date,
      notes: booking.notes,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      trip: {
        id: tripData.id,
        title: tripData.title,
        location: tripData.location,
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        price: tripData.price
      },
      customer: {
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone
      },
      equipment_items: booking.equipment_bookings.map(item => {
        const equipmentData = Array.isArray(item.equipment) ? item.equipment[0] : item.equipment
        return {
          id: item.id,
          equipment_name: equipmentData.name,
          equipment_id: equipmentData.id,
          category: equipmentData.category,
          quantity: item.quantity,
          daily_rate: item.daily_rate,
          subtotal: item.quantity * item.daily_rate
        }
      })
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Booking details error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}