// src/app/admin/bookings/page.tsx

import { createClient } from "@/lib/supabase/server";
import BookingManagerSimple from '@/components/admin/BookingManagerSimple';

export const revalidate = 0;

async function getBookings() {
    const supabase = await createClient();
    
    console.log("🔍 Fetching bookings...");
    
    // Try to get all bookings data
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("❌ Error fetching bookings:", error);
        return [];
    }
    
    console.log("📋 Raw bookings found:", bookings?.length || 0);
    
    if (!bookings || bookings.length === 0) {
        console.log("📝 No bookings found in database");
        return [];
    }

    // Get additional data separately
    const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
            console.log(`🔄 Processing booking ${booking.id}...`);
            
            // Get trip data if trip_id exists
            if (booking.trip_id) {
                const { data: trip, error: tripError } = await supabase
                    .from('trips')
                    .select('title')
                    .eq('id', booking.trip_id)
                    .single();
                
                if (tripError) {
                    console.log(`⚠️ Trip not found for booking ${booking.id}:`, tripError);
                } else {
                    booking.trip = trip;
                    console.log(`✅ Trip found: ${trip?.title}`);
                }
            }

            // Get user email directly if user_id exists
            if (booking.user_id) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('id', booking.user_id)
                    .single();
                
                if (profileError) {
                    console.log(`⚠️ Profile not found for booking ${booking.id}:`, profileError);
                    // Try to get email from auth.users if profiles table doesn't exist
                    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(booking.user_id);
                    if (!authError && authUser?.user?.email) {
                        booking.user = { email: authUser.user.email };
                        console.log(`✅ Email from auth: ${authUser.user.email}`);
                    }
                } else {
                    booking.user = profile;
                    console.log(`✅ Profile found: ${profile?.email}`);
                }
            }

            return booking;
        })
    );

    console.log("✨ Enriched bookings:", enrichedBookings.length);
    return enrichedBookings;
}


export default async function BookingsPage() {
    const bookings = await getBookings();

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <BookingManagerSimple initialBookings={bookings} />
        </div>
    );
}
