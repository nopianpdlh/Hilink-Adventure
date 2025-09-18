import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ModernNavbar from '@/components/ModernNavbar'
import EquipmentGridClient from '@/components/EquipmentGridClient'
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
  Footprints,
  DollarSign
} from 'lucide-react'

interface Equipment {
  id: string // UUID in schema
  name: string
  description: string | null
  rental_price_per_day: number
  stock_quantity: number
  category: string | null
  image_url: string | null
  price_per_day: number | null
  created_at: string
  updated_at: string | null
}

// Equipment Categories - Updated to match actual database usage
const categories = [
  { id: 'all', name: 'Semua Kategori', icon: Package },
  { id: 'backpack', name: 'Tas & Carrier', icon: Backpack },
  { id: 'tent', name: 'Tenda & Shelter', icon: Tent },
  { id: 'footwear', name: 'Sepatu & Alas Kaki', icon: Footprints },
  { id: 'navigation', name: 'Navigasi & GPS', icon: Compass },
  { id: 'camera', name: 'Kamera & Dokumentasi', icon: Camera },
  { id: 'safety', name: 'Keamanan & Perlengkapan', icon: Shield },
  { id: 'cooking', name: 'Masak & Minum', icon: Package },
  { id: 'lighting', name: 'Penerangan', icon: Package },
]

// Hero Section Component with Dynamic Stats
async function HeroSection() {
  const supabase = await createClient()
  
  // Get real-time stats from database
  const [
    { count: totalEquipment },
    { data: uniqueCategories }
  ] = await Promise.all([
    supabase.from('equipment').select('*', { count: 'exact', head: true }),
    supabase.from('equipment').select('category').not('category', 'is', null)
  ])

  const totalCategories = uniqueCategories ? new Set(uniqueCategories.map(item => item.category)).size : 8

  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-green-100 pt-20 pb-12 sm:pt-24 sm:pb-16 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/boat.png')" }}
      />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 -left-4 w-40 h-40 sm:w-72 sm:h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-40 h-40 sm:w-72 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-40 h-40 sm:w-72 sm:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Sewa <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Peralatan</span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Outdoor Berkualitas</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Dapatkan peralatan outdoor terbaik dengan harga terjangkau. Semua peralatan telah diperiksa dan dijamin kualitasnya.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-6 sm:mb-8 px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari peralatan..."
                className="pl-10 sm:pl-12 pr-4 h-12 sm:h-14 text-base sm:text-lg border-gray-200 focus:border-green-400 focus:ring-green-400 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 sm:h-10 bg-green-600 hover:bg-green-700 px-3 sm:px-4 text-sm sm:text-base">
                Cari
              </Button>
            </div>
          </div>

          {/* Dynamic Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto px-4">
            <div className="text-center p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{totalEquipment || 100}+</div>
              <div className="text-xs sm:text-sm text-gray-600">Peralatan</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{totalCategories}+</div>
              <div className="text-xs sm:text-sm text-gray-600">Kategori</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl font-bold text-green-600">24/7</div>
              <div className="text-xs sm:text-sm text-gray-600">Siap Sewa</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Category Filter Component
function CategoryFilter({ activeCategory }: { activeCategory: string }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center mb-4 sm:mb-6">
        <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
        <h3 className="font-bold text-gray-900 text-base sm:text-lg">Kategori</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:space-y-2 sm:gap-0">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/equipment?category=${category.id}`}
            className={`flex items-center p-3 sm:p-3 rounded-lg transition-all duration-300 text-sm sm:text-base ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-md'
                : 'hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200'
            }`}
          >
            <category.icon className="h-4 w-4 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="font-medium truncate">{category.name}</span>
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

  // Use only real database data - no fallback to sample data
  const displayEquipment = equipment || []
  const activeCategory = resolvedSearchParams.category || 'all'

  if (error) {
    console.error('Error fetching equipment:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ModernNavbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:w-1/4">
              <CategoryFilter activeCategory={activeCategory} />
              
              {/* Additional Filters */}
              <div className="mt-6 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4 sm:mb-6">
                  <SortAsc className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2" />
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">Urutkan</h3>
                </div>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-sm hover:bg-green-50 hover:text-green-600 transition-colors">
                    Harga Terendah
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm hover:bg-green-50 hover:text-green-600 transition-colors">
                    Harga Tertinggi
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm hover:bg-green-50 hover:text-green-600 transition-colors">
                    Paling Populer
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm hover:bg-green-50 hover:text-green-600 transition-colors">
                    Stok Tersedia
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Main Content - Equipment Grid */}
            <div className="lg:w-3/4">
              {displayEquipment.length > 0 ? (
                <EquipmentGridClient 
                  initialEquipment={displayEquipment} 
                  activeCategory={activeCategory}
                />
              ) : (
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                  <div className="max-w-md mx-auto">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Peralatan</h3>
                    <p className="text-gray-600 mb-6">
                      Database masih kosong. Silakan tambahkan peralatan melalui halaman admin atau import data sample.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild className="bg-green-600 hover:bg-green-700">
                        <Link href="/admin/equipment">Kelola Peralatan</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Mengapa Sewa Equipment di HiLink?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Dapatkan peralatan outdoor berkualitas tinggi dengan layanan terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <div className="text-center p-4 sm:p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">Kualitas Terjamin</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Semua peralatan telah diperiksa dan dipastikan dalam kondisi baik sebelum disewakan
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">Fleksibel</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Sewa mulai dari 1 hari dengan sistem pembayaran yang mudah dan fleksibel
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">Pickup & Delivery</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Layanan antar jemput peralatan untuk kemudahan Anda (area tertentu)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <Mountain className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                <span className="text-lg sm:text-xl font-bold">
                  <span className="text-green-500">HiLink</span> Adventure
                </span>
              </div>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed max-w-md">
                Platform terpercaya untuk open trip dan sewa peralatan outdoor. 
                Wujudkan petualangan impianmu bersama kami.
              </p>
              <div className="text-xs sm:text-sm text-gray-500">
                © 2025 HiLink Adventure. All rights reserved.
              </div>
            </div>
            
            <div className="mt-6 sm:mt-0">
              <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Layanan</h3>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="/trips" className="hover:text-green-500 transition-colors duration-200">Open Trip</Link></li>
                <li><Link href="/equipment" className="hover:text-green-500 transition-colors duration-200">Sewa Alat</Link></li>
                <li><Link href="/blog" className="hover:text-green-500 transition-colors duration-200">Blog</Link></li>
              </ul>
            </div>
            
            <div className="mt-6 sm:mt-0">
              <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Support</h3>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="/contact" className="hover:text-green-500 transition-colors duration-200">Kontak</Link></li>
                <li><Link href="/faq" className="hover:text-green-500 transition-colors duration-200">FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-green-500 transition-colors duration-200">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const revalidate = 0 // Always fetch fresh data - no cache
