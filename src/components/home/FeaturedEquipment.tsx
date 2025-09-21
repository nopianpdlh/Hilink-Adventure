'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { 
  Package,
  Star,
  Shield,
  Calendar,
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

interface Equipment {
  id: string
  name: string
  category: string
  description: string
  rental_price_per_day: number
  price_per_day: number
  stock_quantity: number
  image_url: string
  created_at: string
  equipment_reviews: Array<{
    rating: number
    comment: string
  }>
}

export default function FeaturedEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState<{ [key: string]: number }>({})

  const supabase = createClient()

  const categories = [
    'Backpacks & Bags',
    'Tents & Shelters', 
    'Sleeping Systems',
    'Cooking Equipment',
    'Climbing Gear',
    'Navigation Tools',
    'Safety Equipment',
    'Clothing & Footwear'
  ]

  useEffect(() => {
    fetchFeaturedEquipment()
  }, [])

  const fetchFeaturedEquipment = async () => {
    try {
      const { data: equipmentData, error } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_reviews(rating, comment)
        `)
        .gt('stock_quantity', 0)
        .limit(8)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching equipment:', error)
        return
      }

      setEquipment(equipmentData || [])
    } catch (error) {
      console.error('Error fetching featured equipment:', error)
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

  const calculateAverageRating = (item: Equipment) => {
    if (item.equipment_reviews.length === 0) return 0
    const totalRating = item.equipment_reviews.reduce((sum, review) => sum + review.rating, 0)
    return Number((totalRating / item.equipment_reviews.length).toFixed(1))
  }

  const getCondition = (stockQuantity: number): 'excellent' | 'good' | 'fair' => {
    if (stockQuantity >= 10) return 'excellent'
    if (stockQuantity >= 5) return 'good'
    return 'fair'
  }

  const getConditionColor = (condition: 'excellent' | 'good' | 'fair') => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-yellow-100 text-yellow-800'
      case 'fair': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleWishlist = (equipmentId: string) => {
    setWishlist(prev => 
      prev.includes(equipmentId) 
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    )
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Equipment
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎒 Featured Equipment
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rent premium quality outdoor gear for your next adventure
          </p>
        </div>

        {/* Equipment Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-green-50 hover:border-green-200 px-4 py-2"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {equipment.map((item) => {
            const rating = calculateAverageRating(item)
            const condition = getCondition(item.stock_quantity)
            const dailyRate = item.price_per_day || item.rental_price_per_day
            const weeklyRate = Math.floor(dailyRate * 6.5) // 7 days with small discount
            
            return (
              <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url || '/placeholder-equipment.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWishlist(item.id)}
                    className="absolute top-3 right-3 bg-black/20 hover:bg-black/40 text-white p-2 h-9 w-9"
                  >
                    <Heart 
                      className={`h-4 w-4 ${wishlist.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>

                  {/* Condition Badge */}
                  <Badge 
                    className={`absolute top-3 left-3 ${getConditionColor(condition)} border-0`}
                  >
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </Badge>

                  {/* Available Badge */}
                  {item.stock_quantity > 0 && (
                    <Badge className="absolute bottom-3 left-3 bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Package className="h-4 w-4 mr-1" />
                        <span className="text-sm">{item.category || 'Equipment'}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="space-y-3">
                    {/* Rating & Reviews */}
                    {rating > 0 && (
                      <div className="flex items-center">
                        <div className="flex items-center text-yellow-400 mr-2">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm text-gray-900 ml-1 font-medium">{rating}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ({item.equipment_reviews.length} reviews)
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-green-600">
                            {formatPrice(dailyRate)}
                          </span>
                          <span className="text-sm text-gray-600 ml-1">/ day</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">
                            {formatPrice(weeklyRate)}
                          </span>
                          <div className="text-xs text-gray-500">/ week</div>
                        </div>
                      </div>
                      
                      {/* Stock Info */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Stock: {item.stock_quantity}</span>
                        <span className={`font-medium ${
                          item.stock_quantity > 10 ? 'text-green-600' : 
                          item.stock_quantity > 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.stock_quantity > 10 ? 'In Stock' : 
                           item.stock_quantity > 5 ? 'Limited' : 'Low Stock'}
                        </span>
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
                      <Link href={`/equipment/${item.id}`}>
                        Rent Now
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

        {/* Value Propositions for Equipment */}
        <div className="bg-green-50 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Rent Equipment From Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Premium Quality Gear",
                description: "Top-brand equipment maintained to highest standards"
              },
              {
                icon: Calendar,
                title: "Flexible Rental Periods",
                description: "Daily, weekly, or monthly rentals available"
              },
              {
                icon: MapPin,
                title: "Multiple Pickup Locations",
                description: "Convenient locations across major cities"
              },
              {
                icon: CheckCircle,
                title: "Maintenance Included",
                description: "All equipment serviced and ready to use"
              },
              {
                icon: Shield,
                title: "Insurance Coverage Available",
                description: "Protect your adventure with optional coverage"
              },
              {
                icon: Star,
                title: "Expert Recommendations",
                description: "Get advice from our outdoor gear specialists"
              }
            ].map((prop, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <prop.icon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{prop.title}</h4>
                  <p className="text-sm text-gray-600">{prop.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="px-8 py-3 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
          >
            <Link href="/equipment">
              Browse All Equipment
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}