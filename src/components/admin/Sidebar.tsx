'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Map, 
  Package, 
  Users, 
  BarChart, 
  TicketPercent, 
  FileText, 
  Backpack, 
  UserCheck, 
  ShoppingCart,
  Menu,
  X
} from 'lucide-react'

const iconMap = { Home, Map, Package, Users, BarChart, TicketPercent, FileText, Backpack, UserCheck, ShoppingCart }

const navLinks = [
  { href: "/admin", text: "Dashboard", icon: "Home" as keyof typeof iconMap },
  { href: "/admin/users", text: "Kelola User", icon: "UserCheck" as keyof typeof iconMap },
  { href: "/admin/destinations", text: "Destinasi", icon: "Map" as keyof typeof iconMap },
  { href: "/admin/trips", text: "Paket Trip", icon: "Package" as keyof typeof iconMap },
  { href: "/admin/bookings", text: "Pesanan", icon: "ShoppingCart" as keyof typeof iconMap },
  { href: "/admin/promotions", text: "Promosi", icon: "TicketPercent" as keyof typeof iconMap }, 
  { href: "/admin/blog", text: "Blog", icon: "FileText" as keyof typeof iconMap }, 
  { href: "/admin/equipment", text: "Peralatan", icon: "Backpack" as keyof typeof iconMap },
  { href: "/admin/analytics", text: "Analitik", icon: "BarChart" as keyof typeof iconMap },
]

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Close mobile menu when clicking on a link (for better UX)
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) { // lg breakpoint
      closeMobileMenu()
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out",
        "lg:static lg:translate-x-0 lg:w-64",
        // Mobile styles
        "fixed top-0 left-0 bottom-0 w-80 max-w-[80vw] z-50 transform",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b">
            <Link href="/admin" className="text-xl font-bold text-gray-900" onClick={closeMobileMenu}>
              <span className="text-green-600">HiLink</span> Admin
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-4 px-2 uppercase tracking-wider">
              Menu
            </h2>
            <nav className="space-y-1">
              {navLinks.map(({ href, text, icon }) => {
                const IconComponent = iconMap[icon]
                const isActive = pathname === href
                
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center px-3 py-3 rounded-lg font-medium transition-all duration-200",
                      "hover:bg-green-50 hover:text-green-700",
                      isActive
                        ? "bg-green-100 text-green-800 shadow-sm border-l-4 border-green-600"
                        : "text-gray-700"
                    )}
                  >
                    <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{text}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Info - Mobile Only */}
          <div className="lg:hidden mt-6 pt-6 border-t">
            <div className="text-xs text-gray-500 mb-2">Logged in as:</div>
            <div className="text-sm font-medium text-gray-700 truncate mb-4">
              Admin User
            </div>
            <form action="/auth/sign-out" method="post">
              <button 
                type="submit" 
                className="w-full text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}