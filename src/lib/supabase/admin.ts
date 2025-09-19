import { createClient } from '@supabase/supabase-js'

// Admin client with service role key - bypasses RLS
// ⚠️ ONLY USE ON SERVER-SIDE - Never expose service role key to client
export const createAdminClient = () => {
  // Check if we're on server-side
  if (typeof window !== 'undefined') {
    throw new Error('Admin client can only be used on server-side')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper function untuk admin queries
export async function getBookingsAsAdmin() {
  const supabase = createAdminClient()
  
  console.log("🔍 Fetching bookings as admin...")
  
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trips(title),
      equipment_bookings(
        quantity,
        equipment(name)
      ),
      payment_transactions(
        id,
        transaction_status,
        amount,
        payment_method,
        transaction_details,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("❌ Admin bookings query error:", error)
    throw error
  }

  console.log(`✅ Found ${bookings?.length || 0} bookings as admin`)

  // Process data
  const enrichedBookings = await Promise.all((bookings || []).map(async (booking: any) => {
    let userEmail = 'N/A'
    
    // Get user email dari profiles table
    if (booking.user_id) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', booking.user_id)
          .single()
        
        if (profile?.email) {
          userEmail = profile.email
        }
      } catch (error) {
        console.log('Error getting profile email:', error)
      }
    }

    return {
      ...booking,
      user: { email: userEmail },
      trip: booking.trips || { title: 'N/A' },
      equipment_rentals: booking.equipment_bookings?.map((eb: any) => ({
        equipment_name: eb.equipment?.name || 'Unknown',
        quantity: eb.quantity,
        daily_rate: 0,
        total_cost: 0
      })) || []
    }
  }))

  return enrichedBookings
}