'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, 
  Backpack, 
  MapPin, 
  Clock, 
  Star,
  User,
  Settings,
  Shield,
  TrendingUp,
  Award,
  Camera,
  Phone,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Heart,
  Navigation,
  Trophy
} from 'lucide-react'
import Link from 'next/link'

// Mock data - replace with real API calls
const mockStats = {
  totalTrips: 12,
  completedTrips: 8,
  upcomingTrips: 2,
  totalSpent: 15750000,
  rewardPoints: 850,
  memberLevel: 'Gold',
  equipmentRented: 24,
  reviewsGiven: 6
}

const upcomingTrips = [
  {
    id: 1,
    name: "Gunung Bromo Sunrise",
    date: "2025-09-20",
    status: "confirmed",
    image: "/placeholder-trip.jpg"
  },
  {
    id: 2,
    name: "Pantai Pink Lombok",
    date: "2025-10-05", 
    status: "pending",
    image: "/placeholder-trip.jpg"
  }
]

const recentActivities = [
  {
    id: 1,
    type: "trip_completed",
    title: "Trip Gunung Rinjani selesai",
    description: "Berikan review untuk mendapatkan poin reward",
    timestamp: "2 hari yang lalu",
    actionRequired: true
  },
  {
    id: 2,
    type: "equipment_returned",
    title: "Peralatan hiking dikembalikan",
    description: "Sleeping bag dan tenda telah dikembalikan",
    timestamp: "1 minggu yang lalu",
    actionRequired: false
  }
]

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Selamat Datang, {profile?.full_name || user?.email?.split('@')[0] || 'Adventurer'}! 👋
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Siap untuk petualangan selanjutnya? Mari jelajahi keindahan alam Indonesia!
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
          <Award className="h-5 w-5 text-green-600" />
          <div className="text-sm">
            <div className="font-semibold text-green-800">Level {mockStats.memberLevel}</div>
            <div className="text-green-600">{mockStats.rewardPoints} poin</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Calendar className="h-5 w-5 text-blue-600" />
              <Badge variant="secondary" className="text-xs">Total</Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-blue-600">{mockStats.totalTrips}</CardTitle>
            <CardDescription className="text-xs">Trip Terdaftar</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Badge variant="secondary" className="text-xs">Selesai</Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">{mockStats.completedTrips}</CardTitle>
            <CardDescription className="text-xs">Trip Selesai</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Backpack className="h-5 w-5 text-orange-600" />
              <Badge variant="secondary" className="text-xs">Items</Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-orange-600">{mockStats.equipmentRented}</CardTitle>
            <CardDescription className="text-xs">Alat Disewa</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Star className="h-5 w-5 text-yellow-600" />
              <Badge variant="secondary" className="text-xs">Rating</Badge>
            </div>
            <CardTitle className="text-2xl font-bold text-yellow-600">{mockStats.reviewsGiven}</CardTitle>
            <CardDescription className="text-xs">Review Diberikan</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Upcoming Trips */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-green-600" />
                  Trip Mendatang
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/my-bookings">
                    Lihat Semua
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>
                Persiapkan diri untuk petualangan yang menanti
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTrips.length > 0 ? (
                upcomingTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{trip.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(trip.date).toLocaleDateString('id-ID')}
                        </div>
                        <Badge variant={trip.status === 'confirmed' ? 'default' : 'secondary'}>
                          {trip.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu'}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Detail
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="font-medium">Belum ada trip mendatang</p>
                  <p className="text-sm mt-1">Yuk booking trip impian kamu!</p>
                  <Button className="mt-4" asChild>
                    <Link href="/trips">Jelajahi Trip</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Emergency Contact */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Phone className="h-5 w-5" />
                Kontak Darurat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-gray-900">Customer Service</div>
                <div className="text-gray-600">+62 812-3456-7890</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">Trip Leader</div>
                <div className="text-gray-600">+62 813-2345-6789</div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                Hubungi Sekarang
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/trips">
                  <MapPin className="mr-2 h-4 w-4" />
                  Booking Trip Baru
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/equipment">
                  <Backpack className="mr-2 h-4 w-4" />
                  Sewa Peralatan
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profil
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/reviews">
                  <Star className="mr-2 h-4 w-4" />
                  Tulis Review
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Achievement */}
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Trophy className="h-5 w-5" />
                Achievement Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-yellow-800">Mountain Explorer</h4>
                <p className="text-sm text-yellow-600 mt-1">
                  Selesaikan 5 trip gunung
                </p>
                <Badge className="mt-2 bg-yellow-500">Baru Didapat!</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Aktivitas Terbaru
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/activity">
                Lihat Semua
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CardDescription>
            Pantau semua aktivitas dan update terbaru
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 ${
                  activity.actionRequired ? 'border-orange-400 bg-orange-50/50' : 'border-gray-200 bg-gray-50/50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.actionRequired ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    {activity.actionRequired ? (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.timestamp}</p>
                  </div>
                  {activity.actionRequired && (
                    <Button size="sm" variant="outline">
                      Ambil Aksi
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">Belum ada aktivitas terbaru</p>
              <p className="text-sm mt-1">Aktivitas Anda akan muncul di sini</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Section - Unchanged */}
      {profile?.role === 'admin' && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Shield className="h-5 w-5" />
              Panel Administrator
            </CardTitle>
            <CardDescription>
              Akses khusus untuk administrator sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Dashboard Admin
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/trips">
                  Kelola Trip
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/equipment">
                  Kelola Alat
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
