import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ModernNavbar from '@/components/ModernNavbar'
import { 
  Mountain, 
  Backpack, 
  Search,
  Star,
  MapPin,
  Clock,
  Shield,
  Package,
  Filter,
  SortAsc,
  Heart,
  ShoppingCart,
  Camera,
  Compass,
  Tent,
  Footprints
} from 'lucide-react'

interface Equipment {
  id: string
  name: string
  description: string
  price_per_day: number
  category: string
  image_url: string | null
  available_quantity: number
  total_quantity: number
  brand?: string
  condition?: string
}

// Equipment Categories
const categories = [
  { id: 'all', name: 'Semua Kategori', icon: Package },
  { id: 'backpack', name: 'Tas & Carrier', icon: Backpack },
  { id: 'tent', name: 'Tenda & Shelter', icon: Tent },
  { id: 'navigation', name: 'Navigasi', icon: Compass },
  { id: 'footwear', name: 'Sepatu & Alas Kaki', icon: Footprints },
  { id: 'camera', name: 'Kamera & Dokumentasi', icon: Camera },
  { id: 'safety', name: 'Keamanan', icon: Shield },
]

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
            Sewa <span className="text-green-600">Peralatan</span>
            <br />
            Outdoor Berkualitas
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Dapatkan peralatan outdoor terbaik dengan harga terjangkau. Semua peralatan telah diperiksa dan dijamin kualitasnya.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari peralatan yang Anda butuhkan..."
                className="pl-12 pr-4 h-14 text-lg border-gray-200 focus:border-green-400 focus:ring-green-400 bg-white/80 backdrop-blur-sm"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 bg-green-600 hover:bg-green-700">
                Cari
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100+</div>
              <div className="text-sm text-gray-600">Peralatan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">50+</div>
              <div className="text-sm text-gray-600">Brand Terpercaya</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Equipment Card Component
function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getAvailabilityStatus = () => {
    const percentage = (equipment.available_quantity / equipment.total_quantity) * 100
    if (percentage > 70) return { text: 'Tersedia', color: 'bg-green-500' }
    if (percentage > 30) return { text: 'Terbatas', color: 'bg-yellow-500' }
    if (percentage > 0) return { text: 'Sedikit', color: 'bg-orange-500' }
    return { text: 'Habis', color: 'bg-red-500' }
  }

  const availability = getAvailabilityStatus()

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <img 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
          src={equipment.image_url || `https://placehold.co/400x300/22c55e/ffffff?text=${encodeURIComponent(equipment.name)}`} 
          alt={equipment.name} 
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${availability.color} hover:${availability.color}`}>
            {availability.text}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        {equipment.brand && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="bg-white/80">
              {equipment.brand}
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-green-600 transition-colors line-clamp-1">
              {equipment.name}
            </CardTitle>
            <CardDescription className="flex items-center text-gray-600 mt-1">
              <Package className="w-4 h-4 mr-1" />
              {equipment.category}
            </CardDescription>
          </div>
          <div className="flex items-center ml-2">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {equipment.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Stok tersedia:</span>
            <span className="font-medium">{equipment.available_quantity} dari {equipment.total_quantity}</span>
          </div>
          
          {equipment.condition && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Kondisi:</span>
              <span className="font-medium">{equipment.condition}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Harga per hari</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(equipment.price_per_day)}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 space-y-2">
        <Button 
          asChild 
          className="w-full bg-green-600 hover:bg-green-700 group-hover:shadow-md transition-all"
          disabled={equipment.available_quantity === 0}
        >
          <Link href={`/equipment/${equipment.id}`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {equipment.available_quantity === 0 ? 'Tidak Tersedia' : 'Sewa Sekarang'}
          </Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/equipment/${equipment.id}`}>
            Lihat Detail
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

// Category Filter Component
function CategoryFilter({ activeCategory }: { activeCategory: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="font-semibold text-gray-900">Kategori</h3>
      </div>
      <div className="space-y-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/equipment?category=${category.id}`}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              activeCategory === category.id
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <category.icon className="h-4 w-4 mr-3" />
            <span>{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Main Page Component
export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Build query based on filters
  let query = supabase
    .from('equipment')
    .select('*')
    .order('name', { ascending: true })

  // Apply category filter
  if (resolvedSearchParams.category && resolvedSearchParams.category !== 'all') {
    query = query.eq('category', resolvedSearchParams.category)
  }

  // Apply search filter
  if (resolvedSearchParams.search) {
    query = query.ilike('name', `%${resolvedSearchParams.search}%`)
  }

  const { data: equipment, error } = await query

  // Sample data if no equipment found
  const sampleEquipment: Equipment[] = [
    {
      id: '1',
      name: 'Carrier Eiger 60L',
      description: 'Tas carrier berkualitas tinggi dengan kapasitas 60L, cocok untuk perjalanan multi-day hiking',
      price_per_day: 25000,
      category: 'backpack',
      image_url: null,
      available_quantity: 5,
      total_quantity: 8,
      brand: 'Eiger',
      condition: 'Sangat Baik'
    },
    {
      id: '2',
      name: 'Tenda Dome 4 Orang',
      description: 'Tenda dome untuk 4 orang dengan material tahan air dan angin kencang',
      price_per_day: 35000,
      category: 'tent',
      image_url: null,
      available_quantity: 3,
      total_quantity: 6,
      brand: 'Consina',
      condition: 'Baik'
    },
    {
      id: '3',
      name: 'Sepatu Gunung Rei',
      description: 'Sepatu gunung dengan grip yang baik dan tahan air untuk berbagai medan',
      price_per_day: 20000,
      category: 'footwear',
      image_url: null,
      available_quantity: 0,
      total_quantity: 4,
      brand: 'Rei',
      condition: 'Sangat Baik'
    },
    {
      id: '4',
      name: 'GPS Garmin eTrex',
      description: 'GPS handheld untuk navigasi outdoor dengan akurasi tinggi',
      price_per_day: 15000,
      category: 'navigation',
      image_url: null,
      available_quantity: 2,
      total_quantity: 3,
      brand: 'Garmin',
      condition: 'Baik'
    },
    {
      id: '5',
      name: 'Action Camera GoPro',
      description: 'Kamera action untuk dokumentasi petualangan outdoor dengan kualitas 4K',
      price_per_day: 50000,
      category: 'camera',
      image_url: null,
      available_quantity: 4,
      total_quantity: 6,
      brand: 'GoPro',
      condition: 'Sangat Baik'
    },
    {
      id: '6',
      name: 'Headlamp LED',
      description: 'Headlamp LED dengan brightness tinggi dan battery life yang tahan lama',
      price_per_day: 10000,
      category: 'safety',
      image_url: null,
      available_quantity: 8,
      total_quantity: 10,
      brand: 'Petzl',
      condition: 'Baik'
    }
  ]

  const displayEquipment = equipment && equipment.length > 0 ? equipment : sampleEquipment
  const activeCategory = resolvedSearchParams.category || 'all'

  if (error) {
    console.error('Error fetching equipment:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:w-1/4">
              <CategoryFilter activeCategory={activeCategory} />
              
              {/* Additional Filters */}
              <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <SortAsc className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Urutkan</h3>
                </div>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Harga Terendah
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Harga Tertinggi
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Paling Populer
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Stok Tersedia
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Main Content - Equipment Grid */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Peralatan Tersedia
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {displayEquipment.length} peralatan ditemukan
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {displayEquipment && displayEquipment.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayEquipment.map((item) => (
                    <EquipmentCard key={item.id} equipment={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">Tidak ada peralatan yang ditemukan</p>
                  <p className="text-gray-400 mt-2">Coba ubah filter atau kata kunci pencarian</p>
                </div>
              )}

              {/* Load More Button */}
              {displayEquipment && displayEquipment.length > 0 && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg">
                    Muat Lebih Banyak
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Sewa Equipment di HiLink?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Kualitas Terjamin</h3>
              <p className="text-gray-600">Semua peralatan telah diperiksa dan dipastikan dalam kondisi baik sebelum disewakan</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fleksibel</h3>
              <p className="text-gray-600">Sewa mulai dari 1 hari dengan sistem pembayaran yang mudah dan fleksibel</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pickup & Delivery</h3>
              <p className="text-gray-600">Layanan antar jemput peralatan untuk kemudahan Anda (area tertentu)</p>
            </div>
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
