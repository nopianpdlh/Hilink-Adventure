// src/app/admin/layout.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import { Home, Map, Package, Users, BarChart, TicketPercent, FileText, Backpack } from 'lucide-react';

const iconMap = { Home, Map, Package, Users, BarChart, TicketPercent, FileText, Backpack };

const navLinks = [
    { href: "/admin", text: "Dashboard", icon: "Home" as keyof typeof iconMap },
    { href: "/admin/destinations", text: "Destinasi", icon: "Map" as keyof typeof iconMap },
    { href: "/admin/trips", text: "Paket Trip", icon: "Package" as keyof typeof iconMap },
    { href: "/admin/bookings", text: "Pesanan", icon: "Users" as keyof typeof iconMap },
    { href: "/admin/promotions", text: "Promosi", icon: "TicketPercent" as keyof typeof iconMap }, 
    { href: "/admin/blog", text: "Blog", icon: "FileText" as keyof typeof iconMap }, 
    { href: "/admin/equipment", text: "Peralatan", icon: "Backpack" as keyof typeof iconMap },
    { href: "/admin/analytics", text: "Analitik", icon: "BarChart" as keyof typeof iconMap },
];

export default async function AdminDashboardLayout({ children }: PropsWithChildren) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { redirect('/login'); }

    return (
        <div className="min-h-screen bg-gray-100">
             <header className="bg-white shadow-sm sticky top-0 z-20 border-b">
                <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/admin" className="text-xl font-bold text-gray-900">
                    <span className="text-green-600">HiLink</span> Admin
                </Link>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                    <form action="/auth/sign-out" method="post">
                        <button type="submit" className="text-sm font-medium text-gray-700 hover:text-green-600">Logout</button>
                    </form>
                </div>
                </nav>
            </header>
            <div className="container mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
                <aside className="lg:w-64">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-500 mb-4 px-2">MENU</h2>
                        <nav className="flex flex-col space-y-1">
                             {navLinks.map(({ href, text, icon }) => {
                                const IconComponent = iconMap[icon];
                                return (
                                    <Link key={href} href={href} className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-green-100 hover:text-green-800 font-medium transition-colors">
                                        <IconComponent className="h-5 w-5 mr-3" />
                                        <span>{text}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>
                <main className="flex-1">
                    <div className="bg-white p-6 lg:p-8 rounded-lg shadow-sm min-h-[calc(100vh-120px)]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
