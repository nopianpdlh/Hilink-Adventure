'use client'

import { useState } from "react";
import { createEquipment } from "@/app/actions";
import ImageUpload from "@/components/ImageUpload";
import { toast } from 'sonner';

export default function EquipmentForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await createEquipment(formData);
            const equipmentName = formData.get('name') as string;
            toast.success(`Peralatan "${equipmentName}" berhasil ditambahkan!`, {
                duration: 3000,
            });
            
            // Reset form
            const form = document.getElementById('equipment-form') as HTMLFormElement;
            if (form) {
                form.reset();
            }
        } catch (error) {
            console.error('Error creating equipment:', error);
            toast.error('Gagal menambahkan peralatan', {
                description: 'Silakan coba lagi atau hubungi administrator.',
                duration: 4000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Tambah Peralatan Baru</h2>
            <form id="equipment-form" action={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Peralatan</label>
                    <input type="text" name="name" id="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Tenda Dome Kap. 4"/>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select name="category" id="category" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm">
                        <option value="">Pilih Kategori</option>
                        <option value="tenda">Tenda</option>
                        <option value="tas">Tas & Carrier</option>
                        <option value="sepatu">Sepatu & Sandal</option>
                        <option value="jaket">Jaket & Pakaian</option>
                        <option value="alat_masak">Alat Masak</option>
                        <option value="penerangan">Penerangan</option>
                        <option value="navigasi">Navigasi</option>
                        <option value="lainnya">Lainnya</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="rental_price_per_day" className="block text-sm font-medium text-gray-700">Harga/Hari (Rp)</label>
                        <input type="number" name="rental_price_per_day" id="rental_price_per_day" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="50000"/>
                    </div>
                    <div>
                        <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">Stok</label>
                        <input type="number" name="stock_quantity" id="stock_quantity" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="10"/>
                    </div>
                </div>
                <ImageUpload 
                    name="image" 
                    label="Gambar Peralatan"
                    placeholder="https://contoh.com/gambar-peralatan.jpg"
                />
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea name="description" id="description" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" placeholder="Deskripsi singkat..."></textarea>
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isSubmitting ? (
                        <>
                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan Peralatan'
                    )}
                </button>
            </form>
        </div>
    );
}
