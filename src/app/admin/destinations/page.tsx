// src/app/admin/destinations/page.tsx

import { createDestination, deleteDestination } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { Trash2 } from "lucide-react" 

export const revalidate = 0;

async function getDestinations() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('destinations').select('*').order('name');
    if (error) {
        console.error("Error fetching destinations:", error);
        return [];
    }
    return data;
}

export default async function DestinationsPage() {
    const destinations = await getDestinations();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Destinasi</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tambah Destinasi Baru</h2>
                        <form action={createDestination} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Destinasi</label>
                                <input type="text" name="name" id="name" required className="w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="e.g., Gunung Rinjani" />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi</label>
                                <input type="text" name="location" id="location" required className="w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="e.g., Lombok, NTB" />
                            </div>
                             <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Singkat</label>
                                <textarea name="description" id="description" rows={4} className="w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Jelaskan sedikit tentang destinasi ini"></textarea>
                            </div>
                            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Simpan
                            </button>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2">
                     <div className="flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Nama</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Lokasi</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Aksi</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {destinations.map((dest) => (
                                            <tr key={dest.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{dest.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{dest.location}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                   <form action={deleteDestination}>
                                                        <input type="hidden" name="id" value={dest.id} />
                                                        <button type="submit" className="text-red-600 hover:text-red-900">
                                                            <Trash2 className="w-4 h-4"/>
                                                        </button>
                                                   </form>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
