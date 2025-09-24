import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function checkBookingStatusEnum() {
  try {
    // Query untuk melihat constraint enum pada tabel bookings
    const { data, error } = await supabase
      .rpc('get_enum_values', {
        enum_name: 'booking_status'
      })
    
    if (error) {
      console.log('Error getting enum values:', error)
      
      // Fallback: coba query manual untuk melihat constraint
      const { data: constraints, error: constraintError } = await supabase
        .from('information_schema.check_constraints')
        .select('*')
        .like('constraint_name', '%status%')
      
      console.log('Check constraints:', constraints)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error checking enum:', error)
    return null
  }
}

export async function testStatusValues() {
  console.log('🔍 Testing booking status values...')
  
  const testValues = ['pending', 'confirmed', 'cancelled', 'completed', 'paid']
  
  for (const status of testValues) {
    try {
      console.log(`Testing status: ${status}`)
      
      // Test dengan insert dummy (kemudian rollback)
      const { error } = await supabase
        .from('bookings')
        .insert({
          trip_id: '00000000-0000-0000-0000-000000000000', // UUID dummy
          user_id: '00000000-0000-0000-0000-000000000000', // UUID dummy  
          booking_date: new Date().toISOString(),
          status: status,
          total_price: 0,
          participants: 1
        })
        .select()
      
      if (error) {
        console.log(`❌ Status '${status}' failed:`, error.message)
      } else {
        console.log(`✅ Status '${status}' accepted`)
      }
    } catch (error: any) {
      console.log(`❌ Status '${status}' failed:`, error.message)
    }
  }
}