import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// API route for cleaning up expired holds (server-side only)
export async function POST() {
  try {
    const supabase = await createClient()

    const { error, count } = await supabase.rpc('cleanup_expired_holds')

    if (error) {
      console.error('Error cleaning up expired holds:', error)
      return NextResponse.json(
        { error: 'Failed to cleanup expired holds' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      cleaned_count: count || 0 
    })
  } catch (error) {
    console.error('Hold cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}