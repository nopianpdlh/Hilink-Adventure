// src/app/admin/page.tsx
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  Shield,
  Map,
  Calendar,
  MessageSquare
} from 'lucide-react'

export default function AdminDashboardPage() {
  const adminMenus = [
    {
      title: 'Kelola User',
      description: 'Atur user, ubah role, dan kelola akses sistem',
      icon: Users,
      href: '/admin/users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Kelola Equipment',
      description: 'Tambah, edit, dan hapus peralatan adventure',
      icon: Package,
      href: '/admin/equipment',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Kelola Trip',
      description: 'Atur paket trip dan destinasi wisata',
      icon: Map,
      href: '/admin/trips',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Booking',
      description: 'Lihat dan kelola semua booking pelanggan',
      icon: Calendar,
      href: '/admin/bookings',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Analytics',
      description: 'Lihat statistik dan laporan website',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Pesan & Feedback',
      description: 'Kelola pesan dan feedback dari pelanggan',
      icon: MessageSquare,
      href: '/admin/messages',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ]

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Selamat Datang, Admin!
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Kelola semua aspek website HiLink Adventure dari dashboard ini
          </p>
        </div>
      </div>

      {/* Admin Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {adminMenus.map((menu) => {
          const IconComponent = menu.icon
          return (
            <Card key={menu.href} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg ${menu.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${menu.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{menu.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-2 text-sm leading-relaxed">
                  {menu.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={menu.href}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-sm py-2">
                    Buka {menu.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Equipment</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Trips</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Map className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
          <CardDescription>
            Aktivitas terbaru di website HiLink Adventure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Fitur aktivitas terbaru akan segera hadir</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}