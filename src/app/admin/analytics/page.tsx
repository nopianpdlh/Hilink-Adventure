// src/app/admin/analytics/page.tsx

import { getAnalyticsData } from "@/app/actions";
import BookingChart from "./BookingChart";
import { DollarSign, ShoppingCart, Star } from "lucide-react";

// Komponen Kartu Statistik
function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border flex items-start justify-between">
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Analitik</h1>
            </div>
            
            {/* Kartu Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <StatCard title="Total Pendapatan" value={formattedRevenue} icon={DollarSign} />
                <StatCard title="Total Pesanan" value={data.totalBookings} icon={ShoppingCart} />
                <StatCard title="Rata-rata Rating" value="N/A" icon={Star} />
            </div>

            {/* Grafik Pesanan */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Tren Pesanan</h2>
                <div className="overflow-x-auto">
                    <BookingChart data={data.chartData} />
                </div>
            </div>
        </div>
    );
}
