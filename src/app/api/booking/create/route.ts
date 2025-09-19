import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const bookingRequestSchema = z.object({
  trip_id: z.string().uuid(),
  user_id: z.string().uuid(),
  equipment_items: z.array(z.object({
    equipment_id: z.string().uuid(),
    quantity: z.number().min(1),
    daily_rate: z.number().min(0)
  })),
  total_amount: z.number().min(0),
  trip_date: z.string().optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = bookingRequestSchema.parse(body)
    
    const supabase = await createClient()
    
    // Generate order ID
    const orderId = `HLA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    
    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        order_id: orderId,
        trip_id: validatedData.trip_id,
        user_id: validatedData.user_id,
        total_amount: validatedData.total_amount,
        status: 'pending',
        trip_date: validatedData.trip_date || null,
        notes: validatedData.notes || null
      })
      .select()
      .single()
    
    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }
    
    // Create booking equipment items
    const equipmentItems = validatedData.equipment_items.map(item => ({
      booking_id: booking.id,
      equipment_id: item.equipment_id,
      quantity: item.quantity,
      daily_rate: item.daily_rate
    }))
    
    const { error: itemsError } = await supabase
      .from('equipment_bookings')
      .insert(equipmentItems)
    
    if (itemsError) {
      console.error('Equipment booking error:', itemsError)
      // Rollback booking
      await supabase.from('bookings').delete().eq('id', booking.id)
      return NextResponse.json({ error: 'Failed to create booking items' }, { status: 500 })
    }
    
    return NextResponse.json({
      id: booking.id,
      order_id: booking.order_id,
      status: booking.status,
      total_amount: booking.total_amount,
      created_at: booking.created_at
    }, { status: 201 })
    
  } catch (error) {
    console.error('Booking creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.issues 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}