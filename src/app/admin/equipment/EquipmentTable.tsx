'use client'

import { useState } from 'react';
import { deleteEquipment } from "@/app/actions";
import EditEquipmentModal from "./EditEquipmentModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { Edit, Trash2 } from 'lucide-react';
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

interface EquipmentTableProps {
    equipmentList: Equipment[];
}

export default function EquipmentTable({ equipmentList }: EquipmentTableProps) {
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirm = async () => {
        if (!deletingEquipment) return;
        
        setIsDeleting(true);
        try {
            const formData = new FormData();
            formData.append('id', deletingEquipment.id);
            await deleteEquipment(formData);
            
            toast.success(`Peralatan "${deletingEquipment.name}" berhasil dihapus!`, {
                duration: 3000,
            });
            
            setDeletingEquipment(null);
        } catch (error) {
            console.error('Error deleting equipment:', error);
            toast.error(`Gagal menghapus peralatan "${deletingEquipment.name}"`, {
                description: 'Silakan coba lagi atau hubungi administrator.',
                duration: 4000,
            });
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Desktop Table View */}
            <div className="hidden lg:block p-2">
                <div className="flow-root">
                    <div className="inline-block min-w-full py-2 align-middle">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Nama</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kategori</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Harga/Hari</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stok</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4"><span className="sr-only">Aksi</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {equipmentList.length > 0 ? (
                                    equipmentList.map((item) => (
                                        <tr key={item.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    {item.image_url && (
                                                        <img 
                                                            src={item.image_url} 
                                                            alt={item.name}
                                                            className="h-10 w-10 rounded-lg object-cover mr-3"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.name}</div>
                                                        {item.description && (
                                                            <div className="text-xs text-gray-500 truncate max-w-xs">
                                                                {item.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 capitalize">
                                                    {item.category || 'Tidak ada'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.rental_price_per_day)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    item.stock_quantity > 0 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.stock_quantity} unit
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingEquipment(item)}
                                                        title={`Edit peralatan ${item.name}`}
                                                        className="text-blue-600 hover:text-blue-900 text-xs flex items-center gap-1 transition-colors duration-200"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingEquipment(item)}
                                                        disabled={isDeleting && deletingEquipment?.id === item.id}
                                                        title={`Hapus peralatan ${item.name}`}
                                                        className="text-red-600 hover:text-red-900 text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                                    >
                                                        <Trash2 className={`w-3 h-3 ${isDeleting && deletingEquipment?.id === item.id ? 'animate-pulse' : ''}`} />
                                                        {isDeleting && deletingEquipment?.id === item.id ? 'Menghapus...' : 'Hapus'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <svg className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <p className="text-sm">Belum ada peralatan yang tersedia</p>
                                                <p className="text-xs text-gray-400">Tambahkan peralatan pertama menggunakan form di sebelah kiri</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4">
                {equipmentList.length > 0 ? (
                    <div className="space-y-4">
                        {equipmentList.map((item) => (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-start space-x-3">
                                    {item.image_url && (
                                        <img 
                                            src={item.image_url} 
                                            alt={item.name}
                                            className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                        {item.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                {item.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 capitalize">
                                                {item.category || 'Tidak ada'}
                                            </span>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                item.stock_quantity > 0 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.stock_quantity} unit
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <div className="text-sm font-medium text-gray-900">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.rental_price_per_day)}/hari
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingEquipment(item)}
                                            className="text-blue-600 hover:text-blue-900 text-sm flex items-center gap-1 transition-colors duration-200 px-2 py-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeletingEquipment(item)}
                                            disabled={isDeleting && deletingEquipment?.id === item.id}
                                            className="text-red-600 hover:text-red-900 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 px-2 py-1"
                                        >
                                            <Trash2 className={`w-4 h-4 ${isDeleting && deletingEquipment?.id === item.id ? 'animate-pulse' : ''}`} />
                                            {isDeleting && deletingEquipment?.id === item.id ? 'Menghapus...' : 'Hapus'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center">
                            <svg className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="text-sm">Belum ada peralatan yang tersedia</p>
                            <p className="text-xs text-gray-400 mt-1">Tambahkan peralatan pertama menggunakan form di atas</p>
                        </div>
                    </div>
                )}
            </div>            {/* Edit Modal */}
            {editingEquipment && (
                <EditEquipmentModal
                    equipment={editingEquipment}
                    isOpen={!!editingEquipment}
                    onClose={() => setEditingEquipment(null)}
                />
            )}
            
            {/* Confirm Delete Modal */}
            {deletingEquipment && (
                <ConfirmDeleteModal
                    isOpen={!!deletingEquipment}
                    onClose={() => !isDeleting && setDeletingEquipment(null)}
                    onConfirm={handleDeleteConfirm}
                    equipment={deletingEquipment}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
}
