// src/app/dashboard/my-bookings/page.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ReviewModal from "./ReviewModal"; // Impor komponen baru

export const revalidate = 0;

async function getBookings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { bookings: [], reviews: [] };

    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`*, trip:trips (*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Ambil juga data ulasan yang sudah dibuat user
    const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('trip_id')
        .eq('user_id', user.id);

    if (bookingsError || reviewsError) {
        console.error("Error fetching data:", bookingsError || reviewsError);
        return { bookings: [], reviews: [] };
    }
    return { bookings, reviews: reviews.map(r => r.trip_id) };
}

function BookingCard({ booking, hasReviewed }: { booking: any, hasReviewed: boolean }) {
    // ... (Definisi dan format variabel tetap sama)
    const tripTitle = booking.trip?.title || 'Trip tidak ditemukan';
    const startDate = new Date(booking.trip?.start_date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const bookingDate = new Date(booking.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
     const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(booking.total_price);

    const statusStyles: { [key: string]: string } = {
        pending: 'bg-yellow-100 text-yellow-800', paid: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800', completed: 'bg-blue-100 text-blue-800'
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h3 className="font-bold text-lg text-gray-900">{tripTitle}</h3>
                <p className="text-sm text-gray-600 mt-1">Tanggal Trip: {startDate}</p>
                <p className="text-sm text-gray-600">Dipesan pada: {bookingDate}</p>
                <p className="text-md font-semibold text-green-600 mt-2">{formattedPrice}</p>
            </div>
            <div className="flex items-center gap-4">
                 <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                    {booking.status}
                </span>
                {booking.status === 'completed' && !hasReviewed && (
                     <ReviewModal trip={booking.trip} bookingId={booking.id} />
                )}
                 {hasReviewed && (
                     <span className="text-sm text-gray-500">Ulasan Diberikan</span>
                )}
            </div>
        </div>
    );
}

export default async function MyBookingsPage() {
    const { bookings, reviews } = await getBookings();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Pesananku</h1>
            {bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        const hasReviewed = reviews.includes(booking.trip_id);
                        return <BookingCard key={booking.id} booking={booking} hasReviewed={hasReviewed} />
                    })}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-gray-600">Anda belum memiliki pesanan.</p>
                    <Link href="/" className="mt-4 inline-block bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">
                        Cari Trip Sekarang
                    </Link>
                </div>
            )}
        </div>
    );
}
