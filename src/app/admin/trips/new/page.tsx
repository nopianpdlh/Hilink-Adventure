// src/app/admin/trips/new/page.tsx

import { createTrip } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import ImageUpload from "@/components/ImageUpload";
import Link from "next/link";

async function getDestinations() {
    const supabase = await createClient();
    const { data } = await supabase.from('destinations').select('id, name');
    return data || [];
}

export default async function NewTripPage() {
    const destinations = await getDestinations();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Buat Paket Trip Baru</h1>
            <div className="bg-white p-8 rounded-lg shadow-sm border">
                <form action={createTrip} className="max-w-2xl space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Trip</label>
                        <input type="text" name="title" id="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., Pendakian Gunung Semeru 3D2N"/>
                    </div>
                    <div>
                        <label htmlFor="destination_id" className="block text-sm font-medium text-gray-700">Destinasi</label>
                        <select id="destination_id" name="destination_id" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                            <option value="">Pilih Destinasi</option>
                            {destinations.map(dest => (
                                <option key={dest.id} value={dest.id}>{dest.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <textarea id="description" name="description" rows={5} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Jelaskan detail itinerary, fasilitas, dan informasi penting lainnya..."></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                            <input type="date" name="start_date" id="start_date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                            <input type="date" name="end_date" id="end_date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Harga (IDR)</label>
                            <input type="number" name="price" id="price" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 1500000"/>
                        </div>
                        <div>
                            <label htmlFor="quota" className="block text-sm font-medium text-gray-700">Kuota</label>
                            <input type="number" name="quota" id="quota" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 15"/>
                        </div>
                    </div>
                    <ImageUpload 
                        name="image" 
                        label="Gambar Utama Trip"
                        placeholder="https://contoh.com/gambar.jpg"
                    />
                    <div className="flex justify-end gap-4 pt-4">
                        <Link href="/admin/trips" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                            Batal
                        </Link>
                        <button type="submit" className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                            Simpan Paket Trip
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
