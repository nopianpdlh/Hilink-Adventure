import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Import admin function on server-side only
    const { getBookingsAsAdmin } = await import('@/lib/supabase/admin')
    
    console.log("🔄 Admin API: Fetching bookings...")
    const bookings = await getBookingsAsAdmin()
    
    console.log(`✅ Admin API: Successfully loaded ${bookings.length} bookings`)
    
    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length
    })
  } catch (error: any) {
    console.error('❌ Admin bookings API error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch bookings',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { 
      status: 500 
    })
  }
}