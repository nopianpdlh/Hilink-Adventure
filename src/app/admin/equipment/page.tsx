// src/app/admin/equipment/page.tsx

import { createClient } from "@/lib/supabase/server";
import EquipmentTable from "./EquipmentTable";
import EquipmentForm from "./EquipmentForm";

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
                    <EquipmentForm />
                </div>

                {/* Kolom Tabel */}
                <div className="lg:col-span-2">
                    <EquipmentTable equipmentList={equipmentList} />
                </div>
            </div>
        </div>
    );
}
