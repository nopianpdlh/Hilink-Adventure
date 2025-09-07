// src/app/admin/bookings/page.tsx

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Mail, Receipt } from "lucide-react";

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

// Komponen Badge Status menggunakan shadcn/ui Badge
function StatusBadge({ status }: { status: string }) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { variant: 'secondary' as const, label: 'Pending' };
            case 'paid':
                return { variant: 'default' as const, label: 'Paid' };
            case 'cancelled':
                return { variant: 'destructive' as const, label: 'Cancelled' };
            case 'completed':
                return { variant: 'outline' as const, label: 'Completed' };
            default:
                return { variant: 'secondary' as const, label: status };
        }
    };

    const config = getStatusConfig(status);
    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
}


export default async function BookingsPage() {
    const bookings = await getBookings();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manajemen Pesanan</h1>
                    <p className="text-gray-600 mt-1">Kelola semua pesanan trip yang masuk</p>
                </div>
                <div className="flex gap-2 text-sm">
                    <Badge variant="secondary">{bookings.length} Total Pesanan</Badge>
                    <Badge variant="default">{bookings.filter(b => b.status === 'paid').length} Terbayar</Badge>
                    <Badge variant="outline">{bookings.filter(b => b.status === 'pending').length} Pending</Badge>
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8">
                    <div className="text-center">
                        <div className="text-gray-400 mb-4">
                            <Receipt className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pesanan</h3>
                        <p className="text-gray-500 mb-4">Pesanan akan muncul di sini ketika ada yang booking trip</p>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Cara mendapatkan pesanan:</h4>
                            <div className="text-sm text-blue-700 space-y-1 text-left">
                                <p>1. Pastikan sudah ada trip di <a href="/admin/trips" className="underline">halaman trips</a></p>
                                <p>2. User bisa booking melalui halaman utama website</p>
                                <p>3. User harus login terlebih dulu untuk melakukan booking</p>
                                <p>4. Pesanan akan muncul di sini setelah user submit booking</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 justify-center mt-4">
                            <a href="/admin/trips" className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                                Kelola Trips
                            </a>
                            <a href="/" className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">
                                Lihat Website
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Pelanggan</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trip</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Peserta</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tgl. Pesan</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Harga</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4">
                                        <span className="sr-only">Aksi</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {bookings.map((booking: any) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="py-4 pl-4 pr-3 text-sm">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {booking.user?.email || booking.user_email || booking.email || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ID: {booking.id?.toString().slice(0, 8) || 'N/A'}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-sm">
                                            <div className="font-medium text-gray-900">
                                                {booking.trip_title || booking.trip?.title || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-sm">
                                            <div className="flex items-center text-gray-900">
                                                <Users className="h-4 w-4 mr-1 text-gray-400" />
                                                {booking.total_participants || booking.participants || 1} orang
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-sm">
                                            <div className="flex items-center text-gray-900">
                                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                {new Date(booking.created_at).toLocaleDateString('id-ID')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(booking.created_at).toLocaleTimeString('id-ID', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-sm">
                                            <div className="font-semibold text-gray-900">
                                                {new Intl.NumberFormat('id-ID', { 
                                                    style: 'currency', 
                                                    currency: 'IDR', 
                                                    minimumFractionDigits: 0 
                                                }).format(booking.total_price || 0)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Intl.NumberFormat('id-ID', { 
                                                    style: 'currency', 
                                                    currency: 'IDR', 
                                                    minimumFractionDigits: 0 
                                                }).format((booking.total_price || 0) / (booking.total_participants || booking.participants || 1))}/orang
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-sm">
                                            <StatusBadge status={booking.status || 'pending'} />
                                        </td>
                                        <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium">
                                            <button className="text-green-600 hover:text-green-900 hover:underline">
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
