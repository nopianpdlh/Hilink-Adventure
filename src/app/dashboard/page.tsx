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
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Selamat Datang, {profile?.full_name || user?.email?.split('@')[0] || 'Adventurer'}!
          </h1>
          <p className="text-muted-foreground">
            Kelola petualangan Anda dan jelajahi keindahan alam Indonesia
          </p>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
                <p className="font-medium">{profile?.full_name || 'Belum diisi'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2">
                  <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                    {profile?.role === 'admin' ? 'Administrator' : 'Member'}
                  </Badge>
                  {profile?.role === 'admin' && <Shield className="h-4 w-4 text-blue-600" />}
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button asChild variant="outline">
                <Link href="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/my-bookings">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Booking Saya
                </CardTitle>
                <CardDescription>
                  Lihat dan kelola semua booking trip Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">-</span>
                  <Badge variant="secondary">Trip Aktif</Badge>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/equipment">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Backpack className="h-5 w-5 text-green-600" />
                  Sewa Alat
                </CardTitle>
                <CardDescription>
                  Sewa peralatan outdoor berkualitas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">-</span>
                  <Badge variant="secondary">Item Disewa</Badge>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/trips">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Open Trip
                </CardTitle>
                <CardDescription>
                  Jelajahi destinasi petualangan terbaru
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">-</span>
                  <Badge variant="secondary">Trip Tersedia</Badge>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>
              Pantau aktivitas terbaru akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada aktivitas terbaru</p>
              <p className="text-sm">Aktivitas Anda akan muncul di sini</p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Section */}
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
              <div className="flex gap-4">
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
    </div>
  )
}
