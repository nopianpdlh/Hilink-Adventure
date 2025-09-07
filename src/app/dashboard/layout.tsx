import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function DashboardLayout({ children }: PropsWithChildren) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100">
             <header className="bg-white shadow-sm sticky top-0 z-20">
                <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                    <span className="text-green-600">HiLink</span> Adventure
                </Link>
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard/my-bookings" className="font-medium text-gray-700 hover:text-green-600">Dashboard</Link>
                    <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                    <form action="/auth/sign-out" method="post">
                        <button type="submit" className="text-gray-800 hover:text-green-600 font-medium">Logout</button>
                    </form>
                </div>
                </nav>
            </header>
            <div className="container mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-1/4">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Menu</h2>
                        <nav className="flex flex-col space-y-2">
                            <Link href="/dashboard/my-bookings" className="px-4 py-2 rounded text-gray-700 hover:bg-green-100 hover:text-green-700 font-medium">
                                Pesananku
                            </Link>
                            {/* Tambahkan link menu lain di sini, misal: Profil, Sewa Alat, dll */}
                        </nav>
                    </div>
                </aside>
                <main className="lg:w-3/4">
                    <div className="bg-white p-6 lg:p-8 rounded-lg shadow">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
