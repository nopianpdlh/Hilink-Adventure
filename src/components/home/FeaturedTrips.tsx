'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ArrowRight
} from 'lucide-react'

interface Trip {
  id: string
  title: string
  destination: {
    id: string
    name: string
  }
  description: string
  start_date: string
  end_date: string
  price: number
  quota: number
  image_url: string
  created_at: string
  bookings: Array<{
    total_participants: number
  }>
  reviews: Array<{
    rating: number
  }>
  trip_photos: Array<{
    url: string
    caption: string
  }>
}

interface FeaturedTrip {
  id: string
  title: string
  destination: string
  images: string[]
  price: number
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  departure_dates: Date[]
  available_slots: number
  total_slots: number
  rating: number
  reviews_count: number
  highlights: string[]
  included_equipment: string[]
}

export default function FeaturedTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState<{ [key: string]: number }>({})

  const supabase = createClient()

  useEffect(() => {
    fetchFeaturedTrips()
  }, [])

  const fetchFeaturedTrips = async () => {
    try {
      const { data: tripsData, error } = await supabase
        .from('trips')
        .select(`
          *,
          destinations(id, name),
          bookings(total_participants),
          reviews(rating),
          trip_photos(url, caption)
        `)
        .limit(8)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching trips:', error)
        return
      }

      setTrips(tripsData || [])
    } catch (error) {
      console.error('Error fetching featured trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} hari`
  }

  const calculateAvailableSlots = (trip: Trip) => {
    const bookedSlots = trip.bookings.reduce((total, booking) => total + booking.total_participants, 0)
    return Math.max(0, trip.quota - bookedSlots)
  }

  const calculateAverageRating = (trip: Trip) => {
    if (trip.reviews.length === 0) return 0
    const totalRating = trip.reviews.reduce((sum, review) => sum + review.rating, 0)
    return Number((totalRating / trip.reviews.length).toFixed(1))
  }

  const getDifficulty = (title: string, description: string): 'easy' | 'medium' | 'hard' => {
    const text = (title + ' ' + description).toLowerCase()
    if (text.includes('extreme') || text.includes('challenging') || text.includes('advanced')) return 'hard'
    if (text.includes('moderate') || text.includes('intermediate')) return 'medium'
    return 'easy'
  }

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleWishlist = (tripId: string) => {
    setWishlist(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    )
  }

  const nextImage = (tripId: string, totalImages: number) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [tripId]: ((prev[tripId] || 0) + 1) % totalImages
    }))
  }

  const prevImage = (tripId: string, totalImages: number) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [tripId]: ((prev[tripId] || 0) - 1 + totalImages) % totalImages
    }))
  }

  const getDisplayImages = (trip: Trip) => {
    const images = []
    if (trip.image_url) images.push(trip.image_url)
    if (trip.trip_photos) {
      images.push(...trip.trip_photos.map(photo => photo.url))
    }
    return images.length > 0 ? images : ['/placeholder-trip.jpg']
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Adventures
            </h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🏕️ Featured Adventures
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular trips and start your next adventure with confidence
          </p>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {trips.map((trip) => {
            const images = getDisplayImages(trip)
            const currentImageIndex = activeImageIndex[trip.id] || 0
            const availableSlots = calculateAvailableSlots(trip)
            const rating = calculateAverageRating(trip)
            const difficulty = getDifficulty(trip.title, trip.description || '')
            const duration = calculateDuration(trip.start_date, trip.end_date)
            
            return (
              <Card key={trip.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                {/* Image Carousel */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={images[currentImageIndex]}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => prevImage(trip.id, images.length)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1 h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => nextImage(trip.id, images.length)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1 h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      {/* Image Dots */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {images.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWishlist(trip.id)}
                    className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white p-2 h-9 w-9"
                  >
                    <Heart 
                      className={`h-4 w-4 ${wishlist.includes(trip.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>

                  {/* Difficulty Badge */}
                  <Badge 
                    className={`absolute top-3 left-3 ${getDifficultyColor(difficulty)} border-0`}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Badge>

                  {/* Available Slots Warning */}
                  {availableSlots <= 3 && availableSlots > 0 && (
                    <Badge className="absolute bottom-3 left-3 bg-orange-500 text-white">
                      Only {availableSlots} seats left!
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {trip.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{trip.destination?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="space-y-3">
                    {/* Trip Details */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(trip.start_date)}</span>
                      </div>
                    </div>

                    {/* Rating & Reviews */}
                    {rating > 0 && (
                      <div className="flex items-center">
                        <div className="flex items-center text-yellow-400 mr-2">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm text-gray-900 ml-1 font-medium">{rating}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ({trip.reviews.length} reviews)
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          {formatPrice(trip.price)}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">/ person</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          <span className="text-sm">{availableSlots}/{trip.quota}</span>
                        </div>
                        <span className="text-xs text-gray-500">available</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex gap-2 w-full">
                    <Button 
                      asChild 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Link href={`/trip/${trip.id}`}>
                        Quick Book
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="px-3 border-green-200 hover:bg-green-50"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="px-8 py-3 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
          >
            <Link href="/trips">
              View All Adventures
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}