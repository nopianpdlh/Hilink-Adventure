'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Search,
  Package,
  Backpack,
  Tent,
  Compass,
  Footprints,
  Camera,
  Shield,
  Filter,
  SortAsc,
  ShoppingCart,
  Star,
  DollarSign,
  Heart,
  Loader2,
  Plus
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

interface EquipmentWithRating extends Equipment {
  averageRating: number
  totalReviews: number
}

interface EquipmentGridClientProps {
  initialEquipment: Equipment[]
  activeCategory: string
}

type SortOption = 'name' | 'price_low' | 'price_high' | 'stock' | 'rating'

const ITEMS_PER_PAGE = 6 // Show 6 items initially, then load more

export default function EquipmentGridClient({ initialEquipment, activeCategory }: EquipmentGridClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const [loading, setLoading] = useState(false)
  const [equipmentWithRatings, setEquipmentWithRatings] = useState<EquipmentWithRating[]>([])
  const [user, setUser] = useState<any>(null)

  // Fetch user authentication status
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Initialize equipment with ratings (show data immediately, then enhance with ratings)
  useEffect(() => {
    // First, show equipment data immediately with default ratings
    const initialEquipmentWithDefaults = initialEquipment.map(equipment => ({
      ...equipment,
      averageRating: 0,
      totalReviews: 0
    }))
    
    setEquipmentWithRatings(initialEquipmentWithDefaults)

    // Then fetch real ratings asynchronously
    const fetchRatings = async () => {
      const supabase = createClient()
      
      const equipmentWithRatingsData = await Promise.all(
        initialEquipment.map(async (equipment) => {
          const { data: reviews } = await supabase
            .from('equipment_reviews')
            .select('rating')
            .eq('equipment_id', equipment.id)

          const averageRating = reviews && reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0

          return {
            ...equipment,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: reviews?.length || 0
          }
        })
      )

      setEquipmentWithRatings(equipmentWithRatingsData)
    }

    if (initialEquipment.length > 0) {
      fetchRatings()
    }
  }, [initialEquipment])

  const filteredAndSortedEquipment = useMemo(() => {
    let filtered = [...equipmentWithRatings]

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(equipment =>
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.rental_price_per_day - b.rental_price_per_day
        case 'price_high':
          return b.rental_price_per_day - a.rental_price_per_day
        case 'stock':
          return b.stock_quantity - a.stock_quantity
        case 'rating':
          return b.averageRating - a.averageRating
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [equipmentWithRatings, searchTerm, sortBy])

  const displayedEquipment = filteredAndSortedEquipment.slice(0, displayCount)
  const hasMore = displayCount < filteredAndSortedEquipment.length

  const handleLoadMore = () => {
    setLoading(true)
    setTimeout(() => {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE)
      setLoading(false)
    }, 500) // Add a small delay for better UX
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getAvailabilityStatus = (stockQuantity: number) => {
    if (stockQuantity > 10) return { text: 'Tersedia', color: 'bg-green-500' }
    if (stockQuantity > 5) return { text: 'Terbatas', color: 'bg-yellow-500' }
    if (stockQuantity > 0) return { text: 'Sedikit', color: 'bg-orange-500' }
    return { text: 'Habis', color: 'bg-red-500' }
  }

  return (
    <>
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {activeCategory === 'all' ? 'Semua Peralatan' : 'Peralatan Tersedia'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {filteredAndSortedEquipment.length} peralatan ditemukan, menampilkan {Math.min(displayCount, filteredAndSortedEquipment.length)}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari peralatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-10 border-gray-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>
          
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 h-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm"
          >
            <option value="name">Urutkan: A-Z</option>
            <option value="price_low">Harga: Rendah ke Tinggi</option>
            <option value="price_high">Harga: Tinggi ke Rendah</option>
            <option value="stock">Stok Tersedia</option>
            <option value="rating">Rating Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      {displayedEquipment.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {displayedEquipment.map((equipment) => (
              <EquipmentCard key={equipment.id} equipment={equipment} user={user} />
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleLoadMore}
                disabled={loading}
                className="hover:bg-green-50 hover:border-green-300 transition-colors px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Muat Lebih Banyak ({filteredAndSortedEquipment.length - displayCount} lainnya)
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 sm:py-20">
          <div className="max-w-md mx-auto px-4">
            <Package className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Tidak ada peralatan ditemukan</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Coba ubah filter pencarian Anda'}
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/equipment">Lihat Semua Peralatan</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

// Equipment Card Component
function EquipmentCard({ equipment, user }: { equipment: EquipmentWithRating, user: any }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Check if item is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user) return
      
      const supabase = createClient()
      const { data } = await supabase
        .from('equipment_wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('equipment_id', equipment.id)
        .single()
      
      setIsWishlisted(!!data)
    }
    
    checkWishlistStatus()
  }, [user, equipment.id])

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist')
      return
    }

    setWishlistLoading(true)
    const supabase = createClient()

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from('equipment_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('equipment_id', equipment.id)
        
        if (error) throw error
        
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        const { error } = await supabase
          .from('equipment_wishlist')
          .insert([{
            user_id: user.id,
            equipment_id: equipment.id
          }])
        
        if (error) throw error
        
        setIsWishlisted(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      toast.error('Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getAvailabilityStatus = () => {
    if (equipment.stock_quantity > 10) return { text: 'Tersedia', color: 'bg-green-500' }
    if (equipment.stock_quantity > 5) return { text: 'Terbatas', color: 'bg-yellow-500' }
    if (equipment.stock_quantity > 0) return { text: 'Sedikit', color: 'bg-orange-500' }
    return { text: 'Habis', color: 'bg-red-500' }
  }

  const availability = getAvailabilityStatus()
  const displayPrice = equipment.price_per_day || equipment.rental_price_per_day

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-0 shadow-lg bg-white/95 backdrop-blur-sm hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <img 
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700" 
          src={equipment.image_url || `https://placehold.co/400x300/22c55e/ffffff?text=${encodeURIComponent(equipment.name)}`} 
          alt={equipment.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-4 left-4">
          <Badge className={`${availability.color} hover:${availability.color} text-white font-semibold px-3 py-1 shadow-lg`}>
            {availability.text}
          </Badge>
        </div>
        
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className="h-9 w-9 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
          >
            <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm font-medium">
            <Package className="w-3 h-3 mr-1" />
            {equipment.category}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl group-hover:text-green-600 transition-colors line-clamp-2 font-bold">
              {equipment.name}
            </CardTitle>
          </div>
          <div className="flex items-center ml-3 bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm font-semibold text-yellow-700">
              {equipment.averageRating > 0 ? equipment.averageRating.toFixed(1) : 'N/A'}
            </span>
            {equipment.totalReviews > 0 && (
              <span className="text-xs text-yellow-600 ml-1">({equipment.totalReviews})</span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {equipment.description || 'No description available.'}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600 font-medium">Stok tersedia:</span>
            <span className="font-bold text-green-600">{equipment.stock_quantity} unit</span>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Harga per hari</p>
                <p className="text-2xl font-bold text-green-700">{formatPrice(displayPrice)}</p>
              </div>
              <div className="text-green-600">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <Button 
            asChild 
            className={`h-12 font-semibold text-sm transition-all duration-300 ${
              equipment.stock_quantity === 0 
                ? 'bg-gray-400 hover:bg-gray-500' 
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
            }`}
            disabled={equipment.stock_quantity === 0}
          >
            <Link href={`/equipment/${equipment.id}`}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {equipment.stock_quantity === 0 ? 'Stok Habis' : 'Sewa Sekarang'}
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="h-12 font-semibold text-sm hover:bg-green-50 hover:border-green-300 transition-colors" 
            asChild
          >
            <Link href={`/equipment/${equipment.id}`}>
              <Search className="mr-2 h-4 w-4" />
              Lihat Detail
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}