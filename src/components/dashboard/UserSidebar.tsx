'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home,
  Calendar,
  Backpack,
  MapPin,
  User,
  Trophy,
  Bell,
  HelpCircle,
  Settings,
  Menu,
  X,
  Star,
  CreditCard
} from 'lucide-react'

const navigationItems = [
  { href: "/dashboard", text: "Dashboard", icon: Home },
  { href: "/dashboard/my-bookings", text: "Booking Saya", icon: Calendar },
  { href: "/dashboard/equipment-rental", text: "Sewa Alat", icon: Backpack },
  { href: "/dashboard/trip-history", text: "Riwayat Trip", icon: MapPin },
  { href: "/dashboard/rewards", text: "Reward & Poin", icon: Trophy },
  { href: "/dashboard/profile", text: "Profil Saya", icon: User },
  { href: "/dashboard/notifications", text: "Notifikasi", icon: Bell },
  { href: "/dashboard/support", text: "Bantuan", icon: HelpCircle },
]

interface UserSidebarProps {
  className?: string
}

export default function UserSidebar({ className }: UserSidebarProps) {
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
        "lg:static lg:translate-x-0 lg:w-80",
        // Mobile styles
        "fixed top-0 left-0 bottom-0 w-80 max-w-[80vw] z-50 transform",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900" onClick={closeMobileMenu}>
              <span className="text-green-600">HiLink</span> Adventure
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">Adventure Explorer</h3>
                <p className="text-sm text-gray-600 truncate">user@example.com</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded">
                <div className="text-lg font-bold text-green-600">12</div>
                <div className="text-xs text-gray-600">Trips</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-lg font-bold text-orange-600">850</div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-lg font-bold text-blue-600">Gold</div>
                <div className="text-xs text-gray-600">Level</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-4 px-2 uppercase tracking-wider">
              Menu Utama
            </h2>
            <nav className="space-y-1">
              {navigationItems.map(({ href, text, icon: IconComponent }) => {
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
                    {/* Badge for notifications */}
                    {href === '/dashboard/notifications' && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        3
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/trips"
                onClick={handleLinkClick}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Jelajahi Trip Baru
              </Link>
              <Link
                href="/equipment"
                onClick={handleLinkClick}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Backpack className="h-4 w-4 mr-2" />
                Sewa Peralatan
              </Link>
              <Link
                href="/dashboard/reviews"
                onClick={handleLinkClick}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Star className="h-4 w-4 mr-2" />
                Tulis Review
              </Link>
            </div>
          </div>

          {/* Logout - Mobile Only */}
          <div className="lg:hidden mt-6 pt-6 border-t">
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