// src/app/trips/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import ModernNavbar from '@/components/ModernNavbar'
import { Search, Calendar, MapPin, DollarSign, Users, Filter, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react'

interface Trip {
  id: string
  title: string
  description: string
  destination_name: string
  start_date: string
  end_date: string
  price: number
  quota: number
  remaining: number
  status: string
  image_url?: string
  created_at: string
}

interface Destination {
  id: string
  name: string
}

interface TripsResponse {
  data: Trip[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [meta, setMeta] = useState<TripsResponse['meta']>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })

  // Filter states
  const [filters, setFilters] = useState({
    q: '',
    destination: '',
    minPrice: '',
    maxPrice: '',
    startDate: '',
    endDate: '',
    difficulty: '',
    sort: 'newest'
  })

  useEffect(() => {
    fetchDestinations()
    fetchTrips()
  }, [])

  useEffect(() => {
    if (loading) return
    
    const timeoutId = setTimeout(() => {
      fetchTrips(1)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [filters])

  const fetchDestinations = async () => {
    try {
      const response = await fetch('/api/trips', { method: 'OPTIONS' })
      if (response.ok) {
        const data = await response.json()
        setDestinations(data.destinations || [])
      }
    } catch (error) {
      console.error('Error fetching destinations:', error)
    }
  }

  const fetchTrips = async (page = meta.page) => {
    try {
      setIsFiltering(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })
      
      const response = await fetch(`/api/trips?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch trips')
      }
      
      const data: TripsResponse = await response.json()
      setTrips(data.data)
      setMeta(data.meta)
      
    } catch (error) {
      console.error('Error fetching trips:', error)
      setTrips([])
    } finally {
      setLoading(false)
      setIsFiltering(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Helper function untuk handle destination filter
  const getDestinationSelectValue = (destination: string) => {
    return destination === '' ? 'all' : destination
  }

  const handleDestinationChange = (value: string) => {
    const actualValue = value === 'all' ? '' : value
    handleFilterChange('destination', actualValue)
  }

  const clearFilters = () => {
    setFilters({
      q: '',
      destination: '',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      endDate: '',
      difficulty: '',
      sort: 'newest'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terbuka':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'Hampir Penuh':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'Penuh':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <ModernNavbar />
      
      {/* Hero Section */}
      <div 
        className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden"
        style={{
          backgroundImage: `url('/pattern.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay untuk mempertahankan readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 via-green-700/85 to-green-800/90"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
              Temukan Petualangan Anda
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-10 leading-relaxed">
              Jelajahi berbagai trip menarik di Indonesia dan ciptakan pengalaman tak terlupakan bersama komunitas petualang
            </p>
            
            {/* Quick Search with enhanced design */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-0 bg-white rounded-full blur opacity-20"></div>
              <div className="relative bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-white/20">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Cari nama trip atau lokasi..."
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  className="pl-14 pr-6 py-6 text-lg rounded-full bg-transparent text-gray-900 border-0 focus:ring-2 focus:ring-green-400/50 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters Bar */}
        <Card className="mb-10 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Filter className="w-5 h-5 text-green-600" />
                </div>
                <span className="bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  Filter & Pengurutan
                </span>
              </CardTitle>
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                size="sm"
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {/* Destination Filter */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Lokasi
                </label>
                <Select onValueChange={handleDestinationChange} value={getDestinationSelectValue(filters.destination)}>
                  <SelectTrigger className="h-12 border-2 hover:border-green-300 focus:border-green-500 transition-colors shadow-sm">
                    <SelectValue placeholder="Semua Lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Lokasi</SelectItem>
                    {destinations.map(dest => (
                      <SelectItem key={dest.id} value={dest.name}>{dest.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Harga Min
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="h-12 border-2 hover:border-green-300 focus:border-green-500 transition-colors shadow-sm"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Harga Max
                </label>
                <Input
                  type="number"
                  placeholder="999999999"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="h-12 border-2 hover:border-green-300 focus:border-green-500 transition-colors shadow-sm"
                />
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="h-12 border-2 hover:border-green-300 focus:border-green-500 transition-colors shadow-sm"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Tanggal Selesai
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="h-12 border-2 hover:border-green-300 focus:border-green-500 transition-colors shadow-sm"
                />
              </div>

              {/* Sort */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-green-600" />
                  Urutkan
                </label>
                <Select onValueChange={(value) => handleFilterChange('sort', value)} value={filters.sort}>
                  <SelectTrigger className="h-12 border-2 hover:border-green-300 focus:border-green-500 transition-colors shadow-sm">
                    <SelectValue placeholder="Terbaru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="price_low">Harga Terendah</SelectItem>
                    <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                    <SelectItem value="start_date">Tanggal Keberangkatan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Daftar Trip
            </h2>
            {isFiltering ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                <span className="text-sm text-gray-500">Memuat...</span>
              </div>
            ) : (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {meta.total} trip ditemukan
              </div>
            )}
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <div className="h-56 bg-gradient-to-r from-gray-200 to-gray-300 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                    </div>
                    <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <Card className="text-center py-20 shadow-xl border-0 bg-gradient-to-br from-gray-50 to-white">
            <CardContent>
              <div className="text-gray-300 mb-6">
                <Search className="w-24 h-24 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Tidak ada trip ditemukan</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Maaf, tidak ada trip yang sesuai dengan filter pencarian Anda. Coba ubah filter atau hapus beberapa kriteria pencarian.
              </p>
              <Button 
                onClick={clearFilters}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <X className="w-4 h-4 mr-2" />
                Reset Filter
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {trips.map((trip) => (
                <Card key={trip.id} className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:-translate-y-2">
                  <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    {trip.image_url ? (
                      <Image
                        src={trip.image_url}
                        alt={trip.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-100 to-blue-100">
                        <MapPin className="w-16 h-16 text-green-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <Badge className={`${getStatusColor(trip.status)} shadow-lg font-semibold px-3 py-1`}>
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-white text-sm font-medium">{trip.destination_name}</div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {trip.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span className="font-medium">{trip.destination_name}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <Calendar className="w-4 h-4 mr-3 text-blue-500" />
                        <span className="font-medium">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-purple-500" />
                          <span className="font-medium">Sisa: {trip.remaining}/{trip.quota}</span>
                        </div>
                        <div className="flex items-center font-bold text-xl text-green-600">
                          <DollarSign className="w-5 h-5 mr-1" />
                          <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                            {formatCurrency(trip.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {trip.description}
                    </p>

                    <Link href={`/trip/${trip.id}`} className="block">
                      <Button 
                        className={`w-full h-12 font-semibold text-base transition-all duration-300 ${
                          trip.remaining === 0 
                            ? 'bg-gray-400 hover:bg-gray-500' 
                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                        }`}
                        disabled={trip.remaining === 0}
                      >
                        {trip.remaining === 0 ? (
                          <>
                            <Users className="w-4 h-4 mr-2" />
                            Sudah Penuh
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Lihat Detail
                          </>
                        )}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                      Menampilkan <span className="font-semibold text-green-600">{((meta.page - 1) * meta.limit) + 1}</span> - <span className="font-semibold text-green-600">{Math.min(meta.page * meta.limit, meta.total)}</span> dari <span className="font-semibold text-green-600">{meta.total}</span> trip
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => fetchTrips(meta.page - 1)}
                        disabled={!meta.hasPrev || isFiltering}
                        size="sm"
                        className="hover:bg-green-50 hover:border-green-300 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Sebelumnya
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, meta.totalPages))].map((_, i) => {
                          const pageNum = i + 1
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === meta.page ? "default" : "outline"}
                              onClick={() => fetchTrips(pageNum)}
                              disabled={isFiltering}
                              size="sm"
                              className={`w-10 h-10 transition-all duration-200 ${
                                pageNum === meta.page 
                                  ? 'bg-gradient-to-r from-green-600 to-green-700 shadow-lg' 
                                  : 'hover:bg-green-50 hover:border-green-300'
                              }`}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => fetchTrips(meta.page + 1)}
                        disabled={!meta.hasNext || isFiltering}
                        size="sm"
                        className="hover:bg-green-50 hover:border-green-300 transition-colors"
                      >
                        Selanjutnya
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}