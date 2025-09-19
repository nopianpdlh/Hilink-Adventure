'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Menu, 
  X, 
  Backpack, 
  User, 
  Settings, 
  LogOut, 
  Calendar,
  Camera,
  Shield,
  Home
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    // Only add event listener on the client side
    if (typeof window !== 'undefined' && mounted) {
      window.addEventListener('scroll', handleScroll)
      
      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [mounted])

  const handleSignOut = async () => {
    try {
      // Show logout message first
      toast.success('Logging out...', {
        duration: 1000,
      })
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await signOut()
      
      // Success message will show after redirect
      setTimeout(() => {
        toast.success('Logout berhasil! Sampai jumpa lagi.', {
          duration: 3000,
        })
      }, 100)
      
    } catch (error) {
      toast.error('Terjadi kesalahan saat logout. Silakan coba lagi.', {
        duration: 3000,
      })
    }
  }

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const navItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/trips', label: 'Open Trip', icon: Calendar },
    { href: '/equipment', label: 'Sewa Alat', icon: Backpack },
    { href: '/blog', label: 'Blog', icon: Camera },
  ]

  const userMenuItems = user
    ? profile?.role === 'admin'
      ? [
          { href: '/dashboard', label: 'Dashboard', icon: User },
          { href: '/admin', label: 'Admin Panel', icon: Shield },
          { href: '/dashboard/my-bookings', label: 'Booking Saya', icon: Calendar },
        ]
      : [
          { href: '/dashboard', label: 'Dashboard', icon: User },
          { href: '/dashboard/my-bookings', label: 'Booking Saya', icon: Calendar },
        ]
    : []

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100' 
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-green-600 transition-colors"
          >
            <img src="/camp.svg" alt="HiLink Adventure" className="h-8 w-8" />
            <span>
              <span className="text-green-600">HiLink</span> Adventure
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                        alt={profile?.full_name || user.email || ''} 
                      />
                      <AvatarFallback className="bg-green-100 text-green-600">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/register">Daftar</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white text-gray-900 border-l border-gray-200 shadow-2xl [&_*]:text-gray-900">
                <SheetHeader>
                  <VisuallyHidden>
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </VisuallyHidden>
                </SheetHeader>
                <div className="flex flex-col space-y-6 mt-6 bg-white">
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col space-y-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-colors p-3 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-200"
                      >
                        <item.icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-800">{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile User Section */}
                  {loading ? (
                    <div className="border-t border-gray-200 pt-6 bg-white">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ) : user ? (
                    <div className="border-t border-gray-200 pt-6 bg-white">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                            alt={profile?.full_name || user.email || ''} 
                          />
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-colors p-3 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-200"
                          >
                            <item.icon className="h-5 w-5 text-gray-600" />
                            <span className="text-gray-800">{item.label}</span>
                          </Link>
                        ))}
                        <button
                          onClick={() => {
                            handleSignOut()
                            setIsOpen(false)
                          }}
                          className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition-colors p-3 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 w-full text-left"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 pt-6 flex flex-col space-y-3 bg-white">
                      <Button variant="outline" asChild onClick={() => setIsOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Link href="/login">Masuk</Link>
                      </Button>
                      <Button asChild className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsOpen(false)}>
                        <Link href="/register">Daftar</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}
