import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ModernNavbar from '@/components/ModernNavbar'
import { 
  Mountain, 
  Backpack, 
  Users, 
  Calendar, 
  MapPin, 
  Star,
  ArrowRight,
  Shield,
  Clock,
  Award
} from 'lucide-react'

interface Trip {
  id: string
  title: string
  price: number
  image_url: string | null
  start_date: string
  end_date: string
  quota: number
  destination?: {
    name: string
  } | { name: string }[]
}

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 pt-24 pb-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Jelajahi <span className="text-green-600">Petualangan</span>
            <br />
            Impianmu Bersama Kami
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan open trip terbaik dan sewa peralatan berkualitas untuk pengalaman outdoor yang tak terlupakan
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6">
              <Link href="/trips">
                <Calendar className="mr-2 h-5 w-5" />
                Lihat Open Trip
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-green-200 hover:bg-green-50">
              <Link href="/equipment">
                <Backpack className="mr-2 h-5 w-5" />
                Sewa Peralatan
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-sm text-gray-600">Trip Sukses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">2000+</div>
              <div className="text-sm text-gray-600">Petualang</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">50+</div>
              <div className="text-sm text-gray-600">Destinasi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">100+</div>
              <div className="text-sm text-gray-600">Peralatan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Aman & Terpercaya",
      description: "Pemandu berpengalaman dan peralatan berkualitas tinggi untuk keamanan maksimal"
    },
    {
      icon: Users,
      title: "Komunitas Aktif",
      description: "Bergabung dengan ribuan petualang dan bangun koneksi yang bermakna"
    },
    {
      icon: Award,
      title: "Pengalaman Terbaik",
      description: "Destinasi pilihan dan itinerary yang dirancang khusus untuk pengalaman optimal"
    },
    {
      icon: Clock,
      title: "Fleksibel",
      description: "Berbagai pilihan trip dan rental yang sesuai dengan jadwal dan budget Anda"
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mengapa Memilih HiLink Adventure?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kami berkomitmen memberikan pengalaman outdoor terbaik dengan standar keamanan dan kualitas tinggi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Trip Card Component
function TripCard({ trip }: { trip: Trip }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <img 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
          src={trip.image_url || 'https://placehold.co/600x400/22c55e/ffffff?text=HiLink+Adventure'} 
          alt={trip.title} 
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-600 hover:bg-green-700">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(trip.start_date)}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
          {trip.title}
        </CardTitle>
        <CardDescription className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          {Array.isArray(trip.destination) 
            ? trip.destination[0]?.name 
            : trip.destination?.name || 'Destinasi Menarik'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>Kuota: {trip.quota} orang</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            <span>4.8</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Mulai dari</p>
            <p className="text-2xl font-bold text-green-600">{formatPrice(trip.price)}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button asChild className="w-full bg-green-600 hover:bg-green-700 group-hover:shadow-md transition-all">
          <Link href={`/trip/${trip.id}`}>
            Lihat Detail
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Main Page Component
export default async function HomePage() {
  const supabase = await createClient()
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch featured trips
  const { data: trips, error } = await supabase
    .from('trips')
    .select(`
      id, 
      title, 
      price, 
      image_url, 
      start_date, 
      end_date, 
      quota,
      destination:destinations(name)
    `)
    .gte('start_date', new Date().toISOString().split('T')[0]) // Only future trips
    .order('start_date', { ascending: true })
    .limit(6)

  if (error) {
    console.error('Error fetching trips:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Featured Trips Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Open Trip Populer
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pilihan trip terbaik yang paling diminati oleh para petualang
            </p>
          </div>

          {trips && trips.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {trips.map((trip) => (
                  <TripCard key={trip.id} trip={trip as Trip} />
                ))}
              </div>
              
              <div className="text-center">
                <Button size="lg" variant="outline" asChild className="border-green-200 hover:bg-green-50">
                  <Link href="/trips">
                    Lihat Semua Trip
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Mountain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">Belum ada trip yang tersedia saat ini</p>
              <p className="text-gray-400 mt-2">Pantau terus untuk update trip terbaru!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Memulai Petualangan?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan petualang lain dan rasakan pengalaman outdoor yang tak terlupakan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                <Link href="/dashboard">
                  <Users className="mr-2 h-5 w-5" />
                  Dashboard Saya
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                  <Link href="/register">
                    Daftar Sekarang
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-green-600">
                  <Link href="/login">
                    Masuk
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="h-8 w-8 text-green-500" />
                <span className="text-xl font-bold">
                  <span className="text-green-500">HiLink</span> Adventure
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Platform terpercaya untuk open trip dan sewa peralatan outdoor. 
                Wujudkan petualangan impianmu bersama kami.
              </p>
              <div className="text-sm text-gray-500">
                © 2025 HiLink Adventure. All rights reserved.
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Layanan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/trips" className="hover:text-green-500 transition-colors">Open Trip</Link></li>
                <li><Link href="/equipment" className="hover:text-green-500 transition-colors">Sewa Alat</Link></li>
                <li><Link href="/blog" className="hover:text-green-500 transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-green-500 transition-colors">Kontak</Link></li>
                <li><Link href="/faq" className="hover:text-green-500 transition-colors">FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-green-500 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const revalidate = 3600 // Revalidate every hour
