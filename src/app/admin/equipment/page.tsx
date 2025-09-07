// src/app/admin/equipment/page.tsx

import { createEquipment } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

async function getEquipment() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching equipment:", error);
        return [];
    }
    return data;
}

export default async function EquipmentPage() {
    const equipmentList = await getEquipment();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Manajemen Peralatan Sewa</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Form */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tambah Peralatan Baru</h2>
                        <form action={createEquipment} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Peralatan</label>
                                <input type="text" name="name" id="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Tenda Dome Kap. 4"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="rental_price_per_day" className="block text-sm font-medium text-gray-700">Harga/Hari (Rp)</label>
                                    <input type="number" name="rental_price_per_day" id="rental_price_per_day" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="50000"/>
                                </div>
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stok</label>
                                    <input type="number" name="stock" id="stock" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="10"/>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                <textarea name="description" id="description" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Deskripsi singkat..."></textarea>
                            </div>
                            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                Simpan Peralatan
                            </button>
                        </form>
                    </div>
                </div>

                {/* Kolom Tabel */}
                <div className="lg:col-span-2">
                     <div className="bg-white p-2 rounded-lg shadow-sm border">
                        <div className="flow-root">
                            <div className="inline-block min-w-full py-2 align-middle">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nama</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Harga/Hari</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stok</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4"><span className="sr-only">Aksi</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {equipmentList.map((item) => (
                                            <tr key={item.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{item.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.rental_price_per_day)}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.stock} unit</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                                   <button className="text-red-600 hover:text-red-900 text-xs">Hapus</button>
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
