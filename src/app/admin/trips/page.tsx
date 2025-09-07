// src/app/admin/trips/page.tsx

import { createClient } from "@/lib/supabase/server";
import { Plus, Edit, Trash2, Calendar, Users, MapPin } from "lucide-react";
import Link from "next/link";
import TripImage from "@/components/TripImage";

export const revalidate = 0;

async function getTrips() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('trips')
        .select(`
            id,
            title,
            description,
            price,
            quota,
            start_date,
            end_date,
            image_url,
            destination:destinations (name)
        `)
        .order('start_date', { ascending: false });
    
    if (error) {
        console.error("Error fetching trips:", error);
        return [];
    }
    return data;
}

export default async function TripsPage() {
    const trips = await getTrips();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manajemen Paket Trip</h1>
                    <p className="text-gray-600 mt-1">Kelola semua paket trip yang tersedia</p>
                </div>
                <Link href="/admin/trips/new" className="inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Buat Trip Baru</span>
                </Link>
            </div>

            {trips.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <div className="text-gray-400 mb-4">
                        <Calendar className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada trip</h3>
                    <p className="text-gray-500 mb-4">Mulai dengan membuat paket trip pertama Anda</p>
                    <Link href="/admin/trips/new" className="inline-flex items-center gap-2 px-4 py-2 font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <Plus className="w-4 h-4" />
                        Buat Trip Baru
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <div key={trip.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                            {/* Image */}
                            <div className="relative h-48 bg-gray-200">
                                <TripImage 
                                    src={trip.image_url} 
                                    alt={trip.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Status Badge */}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        new Date(trip.start_date) > new Date() 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {new Date(trip.start_date) > new Date() ? 'Upcoming' : 'Past'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {trip.title}
                                </h3>
                                
                                {trip.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {trip.description}
                                    </p>
                                )}

                                {/* Trip Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{(trip.destination as any)?.name || 'Destinasi tidak tersedia'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>
                                            {new Date(trip.start_date).toLocaleDateString('id-ID', { 
                                                day: 'numeric', 
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                            {trip.end_date && (
                                                <> - {new Date(trip.end_date).toLocaleDateString('id-ID', { 
                                                    day: 'numeric', 
                                                    month: 'short'
                                                })}</>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>Kuota: {trip.quota} orang</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <span className="text-xl font-bold text-green-600">
                                        {new Intl.NumberFormat('id-ID', { 
                                            style: 'currency', 
                                            currency: 'IDR', 
                                            minimumFractionDigits: 0 
                                        }).format(trip.price)}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-1">/orang</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link 
                                        href={`/admin/trips/${trip.id}`}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        <Users className="w-4 h-4" />
                                        Kelola
                                    </Link>
                                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
