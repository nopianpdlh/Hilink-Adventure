import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    console.log('🔍 Checking database constraints...')
    
    // Test dengan mencoba update ke berbagai status
    const testStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'paid']
    const results: any = {}
    
    // Ambil booking pertama untuk testing
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status')
      .limit(1)
    
    if (fetchError || !bookings || bookings.length === 0) {
      return NextResponse.json({ 
        error: 'No bookings found for testing',
        details: fetchError 
      })
    }
    
    const testBookingId = bookings[0].id
    const originalStatus = bookings[0].status
    
    console.log(`Using booking ${testBookingId} with original status: ${originalStatus}`)
    
    // Test setiap status
    for (const status of testStatuses) {
      try {
        console.log(`Testing status: ${status}`)
        
        const { error } = await supabase
          .from('bookings')
          .update({ status })
          .eq('id', testBookingId)
        
        if (error) {
          results[status] = {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details
          }
        } else {
          results[status] = {
            success: true
          }
        }
      } catch (error: any) {
        results[status] = {
          success: false,
          error: error.message
        }
      }
    }
    
    // Kembalikan ke status asli
    await supabase
      .from('bookings')
      .update({ status: originalStatus })
      .eq('id', testBookingId)
    
    return NextResponse.json({
      testBookingId,
      originalStatus,
      results
    })
    
  } catch (error: any) {
    console.error('Error testing constraints:', error)
    return NextResponse.json({ 
      error: 'Failed to test constraints',
      details: error.message 
    }, { status: 500 })
  }
}