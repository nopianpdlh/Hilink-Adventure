'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ModernNavbar from '@/components/ModernNavbar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Shield, 
  Clock, 
  MapPin,
  Calendar,
  Users,
  Package,
  DollarSign,
  ImageIcon,
  Heart,
  Share2,
  Truck,
  CheckCircle,
  XCircle,
  Camera,
  Plus,
  Minus,
  Mountain,
  MessageCircle,
  ThumbsUp,
  Send
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Types - Updated to match Supabase schema
interface Equipment {
  id: string // UUID in schema
  name: string
  description: string | null
  rental_price_per_day: number
  stock_quantity: number
  image_url: string | null
  category: string | null
  price_per_day: number | null
  created_at: string
  updated_at: string | null
}

interface RentalState {
  quantity: number
  rentalDays: number
  startDate: string
  endDate: string
  totalPrice: number
}

interface Review {
  id: string
  user_id: string
  rating: number
  comment: string
  helpful_count: number
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

export default function EquipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
  const [rental, setRental] = useState<RentalState>({
    quantity: 1,
    rentalDays: 1,
    startDate: '',
    endDate: '',
    totalPrice: 0
  })

  // Fetch equipment data, reviews, wishlist status
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Use client-side supabase for auth check
        const clientSupabase = createClient()
        const { data: { user }, error: userError } = await clientSupabase.auth.getUser()
        
        console.log('Auth check:', { user, userError }) // Debug log
        setUser(user)
        
        // Fetch equipment data - use anonymous supabase for public data
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('*')
          .eq('id', params.id)
          .single()

        if (equipmentError) throw equipmentError
        setEquipment(equipmentData)

        // Fetch reviews - public data
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('equipment_reviews')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('equipment_id', params.id)
          .order('created_at', { ascending: false })

        if (reviewsData) {
          setReviews(reviewsData)
          setTotalReviews(reviewsData.length)
          
          if (reviewsData.length > 0) {
            const avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
            setAverageRating(Math.round(avgRating * 10) / 10)
          }
        }

        // Check if item is in user's wishlist - only if user is logged in
        if (user) {
          const { data: wishlistData } = await clientSupabase
            .from('equipment_wishlist')
            .select('id')
            .eq('user_id', user.id)
            .eq('equipment_id', params.id)
            .single()
          
          setIsInWishlist(!!wishlistData)
          console.log('Wishlist check:', { wishlistData, isInWishlist: !!wishlistData }) // Debug log
        }

      } catch (err) {
        console.error('Fetch data error:', err) // Debug log
        setError(err instanceof Error ? err.message : 'Failed to load equipment')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  // Listen to auth state changes
  useEffect(() => {
    const clientSupabase = createClient()
    
    const { data: { subscription } } = clientSupabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id) // Debug log
        setUser(session?.user || null)
        
        // If user logs in/out, recheck wishlist status
        if (session?.user && params.id) {
          const { data: wishlistData } = await clientSupabase
            .from('equipment_wishlist')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('equipment_id', params.id)
            .single()
          
          setIsInWishlist(!!wishlistData)
        } else {
          setIsInWishlist(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [params.id])

  // Calculate rental dates and total price
  useEffect(() => {
    if (rental.startDate && rental.rentalDays > 0) {
      const startDate = new Date(rental.startDate)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + rental.rentalDays)
      
      const totalPrice = equipment ? 
        rental.quantity * equipment.rental_price_per_day * rental.rentalDays : 0

      setRental(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0],
        totalPrice
      }))
    }
  }, [rental.startDate, rental.rentalDays, rental.quantity, equipment])

  // Wishlist toggle function
  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist')
      return
    }

    const clientSupabase = createClient()

    try {
      if (isInWishlist) {
        const { error } = await clientSupabase
          .from('equipment_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('equipment_id', params.id)
        
        if (error) throw error
        
        setIsInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        const { error } = await clientSupabase
          .from('equipment_wishlist')
          .insert([{
            user_id: user.id,
            equipment_id: params.id
          }])
        
        if (error) throw error
        
        setIsInWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      console.error('Wishlist error:', error) // Debug log
      toast.error('Failed to update wishlist: ' + (error as any)?.message)
    }
  }

  // Share function
  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: equipment?.name,
          text: `Check out this equipment: ${equipment?.name}`,
          url: url
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy link')
      }
    }
  }

  // Submit review function
  const submitReview = async () => {
    if (!user) {
      toast.error('Please login to submit a review')
      return
    }

    if (newReview.rating === 0) {
      toast.error('Please select a rating')
      return
    }

    const clientSupabase = createClient()

    try {
      const { data, error } = await clientSupabase
        .from('equipment_reviews')
        .insert([{
          equipment_id: params.id,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment
        }])
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      // Add new review to list
      setReviews(prev => [data, ...prev])
      setTotalReviews(prev => prev + 1)
      
      // Recalculate average rating
      const newTotal = totalReviews + 1
      const newAverage = ((averageRating * totalReviews) + newReview.rating) / newTotal
      setAverageRating(Math.round(newAverage * 10) / 10)

      // Reset form
      setNewReview({ rating: 0, comment: '' })
      toast.success('Review submitted successfully!')

    } catch (error) {
      console.error('Review error:', error) // Debug log
      toast.error('Failed to submit review: ' + (error as any)?.message)
    }
  }

  // Handle rent now function
  const handleRentNow = async () => {
    console.log('handleRentNow called!') // Debug log
    console.log('User:', user) // Debug log
    console.log('Rental startDate:', rental.startDate) // Debug log
    console.log('isAvailable:', isAvailable) // Debug log

    if (!user) {
      toast.error('Please login to rent equipment')
      return
    }

    if (!rental.startDate) {
      toast.error('Please select a start date')
      return
    }

    if (!isAvailable) {
      toast.error('Equipment is not available')
      return
    }

    // For now, show success message (you can implement actual booking logic later)
    toast.success(`Rent request submitted!\nEquipment: ${equipment?.name}\nQuantity: ${rental.quantity}\nDays: ${rental.rentalDays}\nTotal: Rp ${total.toLocaleString('id-ID')}`)
  }

  // Handle add to cart function
  const handleAddToCart = async () => {
    console.log('handleAddToCart called!') // Debug log
    console.log('User:', user) // Debug log
    console.log('Rental startDate:', rental.startDate) // Debug log
    console.log('isAvailable:', isAvailable) // Debug log

    if (!user) {
      toast.error('Please login to add items to cart')
      return
    }

    if (!rental.startDate) {
      toast.error('Please select a start date')
      return
    }

    if (!isAvailable) {
      toast.error('Equipment is not available')
      return
    }

    // For now, show success message (you can implement actual cart logic later)
    toast.success(`Added to cart!\nEquipment: ${equipment?.name}\nQuantity: ${rental.quantity}\nDays: ${rental.rentalDays}`)
  }

  // Handle chat seller function
  const handleChatSeller = () => {
    console.log('handleChatSeller called!') // Debug log
    console.log('User:', user) // Debug log

    if (!user) {
      toast.error('Please login to chat with seller')
      return
    }

    // For now, show message (you can implement actual chat logic later)
    toast.info('Chat feature will be available soon!')
  }

  // Calculate subtotal and total
  const subtotal = equipment ? rental.quantity * equipment.rental_price_per_day * rental.rentalDays : 0
  const serviceFee = Math.round(subtotal * 0.05) // 5% service fee
  const insurance = Math.round(subtotal * 0.03) // 3% insurance
  const total = subtotal + serviceFee + insurance

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    setRental(prev => ({
      ...prev,
      quantity: Math.max(1, Math.min(equipment?.stock_quantity || 1, prev.quantity + change))
    }))
  }

  // Handle rental days change
  const handleRentalDaysChange = (change: number) => {
    setRental(prev => ({
      ...prev,
      rentalDays: Math.max(1, prev.rentalDays + change)
    }))
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernNavbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipment Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The equipment you are looking for does not exist.'}</p>
            <Button asChild>
              <Link href="/equipment">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Equipment
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isAvailable = equipment.stock_quantity > 0
  const availabilityColor = isAvailable ? 'text-green-600' : 'text-red-600'
  const availabilityIcon = isAvailable ? CheckCircle : XCircle

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link href="/equipment" className="hover:text-green-600">Equipment</Link>
            <span>/</span>
            <span className="text-gray-900">{equipment.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6 hover:bg-green-50 hover:text-green-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Equipment List
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Equipment Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {equipment.image_url ? (
                <Image
                  src={equipment.image_url}
                  alt={equipment.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                  {equipment.image_url ? (
                    <Image
                      src={equipment.image_url}
                      alt={`${equipment.name} view ${index}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-75"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 pr-4">{equipment.name}</h1>
                <div className="flex space-x-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleWishlist}
                    className={`${isInWishlist ? 'text-red-500 border-red-300' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500' : ''}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {equipment.category}
                </Badge>
                <div className="flex items-center">
                  {availabilityIcon === CheckCircle ? (
                    <CheckCircle className={`h-4 w-4 mr-1 ${availabilityColor}`} />
                  ) : (
                    <XCircle className={`h-4 w-4 mr-1 ${availabilityColor}`} />
                  )}
                  <span className={`text-sm font-medium ${availabilityColor}`}>
                    {isAvailable ? `${equipment.stock_quantity} Available` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  ({averageRating} • {totalReviews} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <Card>
              <CardHeader>
                <h3 className="text-2xl font-bold text-green-600">
                  Rp {equipment.rental_price_per_day.toLocaleString('id-ID')}
                </h3>
                <p className="text-gray-600">per hari</p>
              </CardHeader>
            </Card>

            {/* Rental Configuration */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Rental Configuration</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quantity Selection */}
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
                  <div className="flex items-center space-x-3 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={rental.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      value={rental.quantity}
                      min="1"
                      max={equipment.stock_quantity}
                      className="w-20 text-center"
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={rental.quantity >= equipment.stock_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Rental Period */}
                <div>
                  <Label htmlFor="rental-days" className="text-sm font-medium">Rental Days</Label>
                  <div className="flex items-center space-x-3 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRentalDaysChange(-1)}
                      disabled={rental.rentalDays <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="rental-days"
                      type="number"
                      value={rental.rentalDays}
                      min="1"
                      className="w-20 text-center"
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRentalDaysChange(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={rental.startDate}
                      onChange={(e) => setRental(prev => ({ ...prev, startDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={rental.endDate}
                      readOnly
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Rental Summary */}
                {subtotal > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-gray-900">Rental Summary</h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Subtotal ({rental.quantity} × {rental.rentalDays} days)
                        </span>
                        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee (5%)</span>
                        <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance (3%)</span>
                        <span>Rp {insurance.toLocaleString('id-ID')}</span>
                      </div>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-green-600">
                          Rp {total.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Price per day: Rp {equipment.rental_price_per_day.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col space-y-3">
                {user ? (
                  <div className="w-full space-y-3">
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={!isAvailable || !rental.startDate}
                      onClick={handleRentNow}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {isAvailable ? 'Rent Now' : 'Out of Stock'}
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline"
                        size="lg"
                        className="w-full"
                        disabled={!isAvailable || !rental.startDate}
                        onClick={handleAddToCart}
                      >
                        Add to Cart
                      </Button>
                      <Button 
                        variant="ghost"
                        size="lg"
                        className="w-full"
                        onClick={handleChatSeller}
                      >
                        Chat Seller
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 text-center">
                        Please login to rent this equipment
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => router.push('/login')}
                      >
                        Login to Rent
                      </Button>
                      <Button 
                        variant="outline"
                        size="lg"
                        className="w-full"
                        disabled
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Add to Wishlist
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Equipment Information Tabs */}
        <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Description
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {equipment.description || 'No description available for this equipment.'}
              </p>
            </CardContent>
          </Card>

          {/* Features - Display based on category */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center">
                <Star className="mr-2 h-5 w-5" />
                Features
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>High Quality Material</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Weather Resistant</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Lightweight Design</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span>Easy to Use</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Specifications
              </h3>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Technical Details</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-medium">{equipment.category || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock Available:</span>
                    <span className="font-medium">{equipment.stock_quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Rate:</span>
                    <span className="font-medium">Rp {equipment.rental_price_per_day.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rental Information */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Rental Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Pickup Hours</p>
                      <p className="text-sm text-gray-600">08:00 - 17:00 WIB</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Pickup Location</p>
                      <p className="text-sm text-gray-600">HiLink Adventure Store</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Delivery Available</p>
                      <p className="text-sm text-gray-600">Within city limits</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Damage Protection</p>
                      <p className="text-sm text-gray-600">Included in rental price</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Minimum Rental</p>
                      <p className="text-sm text-gray-600">1 day</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Security Deposit</p>
                      <p className="text-sm text-gray-600">Required upon pickup</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Reviews ({totalReviews})
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-4 w-4 ${star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{averageRating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Write Review Form */}
              {user && (
                <div className="border-b pb-6">
                  <h4 className="font-medium mb-4">Write a Review</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Rating</Label>
                      <div className="flex items-center space-x-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`h-6 w-6 cursor-pointer ${
                                star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="review-comment" className="text-sm font-medium">Comment</Label>
                      <Textarea
                        id="review-comment"
                        value={newReview.comment}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience with this equipment..."
                        className="mt-2 min-h-[100px]"
                      />
                    </div>
                    <Button 
                      onClick={submitReview}
                      disabled={newReview.rating === 0}
                      className="w-full sm:w-auto"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit Review
                    </Button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.profiles?.avatar_url ? (
                            <Image
                              src={review.profiles.avatar_url}
                              alt={review.profiles.full_name || 'User'}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {(review.profiles?.full_name || 'User').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{review.profiles?.full_name || 'Anonymous'}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {review.helpful_count}
                            </Button>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet. Be the first to review this equipment!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}