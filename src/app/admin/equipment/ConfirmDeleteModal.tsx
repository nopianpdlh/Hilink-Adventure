'use client'

import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    equipment: {
        name: string;
        category?: string;
        rental_price_per_day: number;
        stock_quantity: number;
    };
    isDeleting?: boolean;
}

export default function ConfirmDeleteModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    equipment, 
    isDeleting = false 
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    const formatPrice = new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(equipment.rental_price_per_day);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Konfirmasi Penghapusan</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Anda akan menghapus peralatan berikut:
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Nama:</span>
                                <span className="text-gray-900">{equipment.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Kategori:</span>
                                <span className="text-gray-900 capitalize">{equipment.category || 'Tidak ada'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Harga Sewa:</span>
                                <span className="text-gray-900">{formatPrice}/hari</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-700">Stok:</span>
                                <span className="text-gray-900">{equipment.stock_quantity} unit</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 text-sm">
                            <strong>Peringatan:</strong> Data yang dihapus tidak dapat dikembalikan. 
                            Pastikan Anda yakin sebelum melanjutkan.
                        </p>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <>
                                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                Menghapus...
                            </>
                        ) : (
                            'Ya, Hapus Peralatan'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
