// src/app/admin/layout.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminDashboardLayout({ children }: PropsWithChildren) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { redirect('/login'); }

    return (
        <div className="min-h-screen bg-gray-50">
             {/* Header - Desktop Only */}
             <header className="hidden lg:block bg-white shadow-sm sticky top-0 z-40 border-b">
                <nav className="container mx-auto px-4 lg:px-6 py-4 flex justify-between items-center">
                    <Link href="/admin" className="text-xl font-bold text-gray-900">
                        <span className="text-green-600">HiLink</span> Admin
                    </Link>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{user.email}</span>
                        <form action="/auth/sign-out" method="post">
                            <button type="submit" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors">
                                Logout
                            </button>
                        </form>
                    </div>
                </nav>
            </header>

            {/* Mobile Header */}
            <header className="lg:hidden bg-white shadow-sm sticky top-0 z-40 border-b">
                <nav className="pl-16 pr-4 py-4 flex justify-between items-center">
                    <Link href="/admin" className="text-xl font-bold text-gray-900">
                        <span className="text-green-600">HiLink</span> Admin
                    </Link>
                    <div className="text-sm text-gray-600 truncate max-w-[120px]">
                        {user.email}
                    </div>
                </nav>
            </header>

            <div className="flex min-h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar */}
                <Sidebar />
                
                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-6 min-w-0 overflow-x-hidden">
                    <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-120px)] p-4 sm:p-6 lg:p-8 max-w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
