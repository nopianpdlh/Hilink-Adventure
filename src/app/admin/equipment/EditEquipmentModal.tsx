'use client'

import { useState } from 'react';
import { updateEquipment } from "@/app/actions";
import ImageUpload from "@/components/ImageUpload";
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface Equipment {
    id: string;
    name: string;
    description?: string;
    rental_price_per_day: number;
    stock_quantity: number;
    image_url?: string;
    category?: string;
}

interface EditEquipmentModalProps {
    equipment: Equipment;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditEquipmentModal({ equipment, isOpen, onClose }: EditEquipmentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await updateEquipment(formData);
            toast.success(`Peralatan "${equipment.name}" berhasil diupdate!`, {
                duration: 3000,
            });
            onClose();
        } catch (error) {
            console.error('Error updating equipment:', error);
            toast.error(`Gagal mengupdate peralatan "${equipment.name}"`, {
                description: 'Silakan coba lagi atau hubungi administrator.',
                duration: 4000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Peralatan</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <form action={handleSubmit} className="space-y-4">
                        <input type="hidden" name="id" value={equipment.id} />
                        
                        <div>
                            <label htmlFor="edit_name" className="block text-sm font-medium text-gray-700">Nama Peralatan</label>
                            <input 
                                type="text" 
                                name="name" 
                                id="edit_name" 
                                required 
                                defaultValue={equipment.name}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                                placeholder="Tenda Dome Kap. 4"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="edit_category" className="block text-sm font-medium text-gray-700">Kategori</label>
                            <select 
                                name="category" 
                                id="edit_category" 
                                defaultValue={equipment.category || ''}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            >
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
                                <label htmlFor="edit_rental_price_per_day" className="block text-sm font-medium text-gray-700">Harga/Hari (Rp)</label>
                                <input 
                                    type="number" 
                                    name="rental_price_per_day" 
                                    id="edit_rental_price_per_day" 
                                    required 
                                    min="0" 
                                    defaultValue={equipment.rental_price_per_day}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                                    placeholder="50000"
                                />
                            </div>
                            <div>
                                <label htmlFor="edit_stock_quantity" className="block text-sm font-medium text-gray-700">Stok</label>
                                <input 
                                    type="number" 
                                    name="stock_quantity" 
                                    id="edit_stock_quantity" 
                                    required 
                                    min="0" 
                                    defaultValue={equipment.stock_quantity}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                                    placeholder="10"
                                />
                            </div>
                        </div>
                        
                        <ImageUpload 
                            name="image" 
                            label="Gambar Peralatan"
                            placeholder={equipment.image_url || "https://contoh.com/gambar-peralatan.jpg"}
                        />
                        
                        <div>
                            <label htmlFor="edit_description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                            <textarea 
                                name="description" 
                                id="edit_description" 
                                rows={3} 
                                defaultValue={equipment.description || ''}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
                                placeholder="Deskripsi singkat..."
                            />
                        </div>
                        
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-4 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                        Mengupdate...
                                    </>
                                ) : (
                                    'Update Peralatan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
