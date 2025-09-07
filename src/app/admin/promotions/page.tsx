// src/app/admin/promotions/page.tsx(

import { createPromotion } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

async function getPromotions() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching promotions:", error);
        return [];
    }
    return data;
}

export default async function PromotionsPage() {
    const promotions = await getPromotions();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Manajemen Promosi</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Form */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Buat Promo Baru</h2>
                        <form action={createPromotion} className="space-y-4">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700">Kode Promo</label>
                                <input type="text" name="code" id="code" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm uppercase" placeholder="e.g., HEMAT10"/>
                            </div>
                            <div>
                                <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700">Persentase Diskon (%)</label>
                                <input type="number" name="discount_percentage" id="discount_percentage" required min="1" max="100" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="e.g., 10"/>
                            </div>
                            <div>
                                <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">Tanggal Kedaluwarsa (Opsional)</label>
                                <input type="date" name="expires_at" id="expires_at" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"/>
                            </div>
                            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                Simpan Promo
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
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Kode</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Diskon</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kedaluwarsa</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4"><span className="sr-only">Aksi</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {promotions.map((promo) => (
                                            <tr key={promo.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{promo.code}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{promo.discount_percentage}%</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('id-ID') : 'Tidak ada'}</td>
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
