import { createClient } from '@/lib/supabase/server'

// Script untuk menambah beberapa booking dummy untuk testing
export async function seedBookings() {
  const supabase = await createClient()
  
  // Cek apakah sudah ada booking
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('id')
    .limit(1)
  
  if (existingBookings && existingBookings.length > 0) {
    console.log('Bookings already exist, skipping seed')
    return
  }
  
  // Ambil trip dan user yang ada
  const { data: trips } = await supabase
    .from('trips')
    .select('id')
    .limit(3)
  
  const { data: users } = await supabase.auth.admin.listUsers()
  
  if (!trips || trips.length === 0) {
    console.log('No trips found, cannot seed bookings')
    return
  }
  
  if (!users.users || users.users.length === 0) {
    console.log('No users found, cannot seed bookings')
    return
  }
  
  // Buat beberapa booking dummy
  const dummyBookings = [
    {
      trip_id: trips[0]?.id,
      user_id: users.users[0]?.id,
      total_participants: 2,
      total_price: 2000000,
      status: 'pending'
    },
    {
      trip_id: trips[1]?.id || trips[0]?.id,
      user_id: users.users[1]?.id || users.users[0]?.id,
      total_participants: 4,
      total_price: 4000000,
      status: 'confirmed'
    },
    {
      trip_id: trips[2]?.id || trips[0]?.id,
      user_id: users.users[2]?.id || users.users[0]?.id,
      total_participants: 1,
      total_price: 1500000,
      status: 'completed'
    }
  ]
  
  const { data, error } = await supabase
    .from('bookings')
    .insert(dummyBookings)
    .select()
  
  if (error) {
    console.error('Error seeding bookings:', error)
  } else {
    console.log('Successfully seeded bookings:', data)
  }
}