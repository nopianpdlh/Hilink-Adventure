// src/app/admin/analytics/page.tsx

import { getAnalyticsData } from "@/app/actions";
import BookingChart from "./BookingChart";
import { DollarSign, ShoppingCart, Star } from "lucide-react";

// Komponen Kartu Statistik
function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
                <Icon className="h-6 w-6 text-green-600" />
            </div>
        </div>
    );
}

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    const formattedRevenue = new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(data.totalRevenue);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Analitik</h1>
            
            {/* Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Pendapatan" value={formattedRevenue} icon={DollarSign} />
                <StatCard title="Total Pesanan" value={data.totalBookings} icon={ShoppingCart} />
                <StatCard title="Rata-rata Rating" value="N/A" icon={Star} />
            </div>

            {/* Grafik Pesanan */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Tren Pesanan</h2>
                <BookingChart data={data.chartData} />
            </div>
        </div>
    );
}
