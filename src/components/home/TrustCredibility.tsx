'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users,
  MapPin,
  Package,
  TrendingUp,
  Award,
  Shield,
  Star,
  CheckCircle,
  Target,
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface TrustMetrics {
  total_trips: number
  happy_customers: number
  equipment_items: number
  success_rate: number
  years_experience: number
  certified_guides: number
}

interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  rating: number
  comment: string
  trip_name: string
}

export default function TrustCredibility() {
  const [metrics, setMetrics] = useState<TrustMetrics>({
    total_trips: 0,
    happy_customers: 0,
    equipment_items: 0,
    success_rate: 99,
    years_experience: 5,
    certified_guides: 50
  })
  const [testimonials] = useState<Testimonial[]>([
    {
      id: '1',
      name: 'Sarah Wijaya',
      role: 'Adventure Enthusiast',
      avatar: '/avatars/avatar-1.jpg',
      rating: 5,
      comment: 'Amazing experience! The guide was professional and the equipment was top-notch. Highly recommended for anyone looking for authentic outdoor adventures.',
      trip_name: 'Bromo Sunrise Trek'
    },
    {
      id: '2',
      name: 'Ahmad Rizki',
      role: 'Photography Enthusiast',
      avatar: '/avatars/avatar-2.jpg',
      rating: 5,
      comment: 'Perfect organization and stunning locations. Got incredible shots and made new friends. The rental equipment saved me from carrying heavy gear.',
      trip_name: 'Raja Ampat Diving'
    },
    {
      id: '3',
      name: 'Lisa Chen',
      role: 'Travel Blogger',
      avatar: '/avatars/avatar-3.jpg',
      rating: 5,
      comment: 'Outstanding service from booking to completion. Safety protocols were excellent and the whole team was incredibly knowledgeable.',
      trip_name: 'Komodo Island Adventure'
    }
  ])
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchTrustMetrics()
  }, [])

  const fetchTrustMetrics = async () => {
    try {
      // Fetch actual metrics from database
      const [tripsResult, bookingsResult, equipmentResult] = await Promise.all([
        supabase.from('trips').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('total_participants', { count: 'exact' }),
        supabase.from('equipment').select('id', { count: 'exact', head: true })
      ])

      const totalTrips = tripsResult.count || 0
      const totalCustomers = bookingsResult.data?.reduce((sum, booking) => sum + booking.total_participants, 0) || 0
      const totalEquipment = equipmentResult.count || 0

      setMetrics({
        total_trips: totalTrips,
        happy_customers: totalCustomers,
        equipment_items: totalEquipment,
        success_rate: 99,
        years_experience: 5,
        certified_guides: 50
      })
    } catch (error) {
      console.error('Error fetching trust metrics:', error)
      // Use default values if fetch fails
      setMetrics({
        total_trips: 500,
        happy_customers: 2500,
        equipment_items: 1000,
        success_rate: 99,
        years_experience: 5,
        certified_guides: 50
      })
    } finally {
      setLoading(false)
    }
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const certifications = [
    {
      name: "Indonesian Tourism Association",
      logo: "/certifications/tourism-association.png",
      description: "Certified tour operator"
    },
    {
      name: "Adventure Travel Trade Association",
      logo: "/certifications/atta.png", 
      description: "ATTA member since 2020"
    },
    {
      name: "Mountain Guide Certification",
      logo: "/certifications/mountain-guide.png",
      description: "Certified mountain guides"
    },
    {
      name: "First Aid Certified",
      logo: "/certifications/first-aid.png",
      description: "All guides first aid certified"
    }
  ]

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            📊 Trusted by Thousands of Adventurers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your safety and satisfaction are our top priorities. Here's why adventurers choose us.
          </p>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {[
            {
              icon: MapPin,
              value: `${metrics.total_trips}+`,
              label: "Trips Organized",
              color: "text-blue-600"
            },
            {
              icon: Users,
              value: `${metrics.happy_customers.toLocaleString()}+`,
              label: "Happy Adventurers",
              color: "text-green-600"
            },
            {
              icon: Package,
              value: `${metrics.equipment_items.toLocaleString()}+`,
              label: "Equipment Available",
              color: "text-purple-600"
            },
            {
              icon: TrendingUp,
              value: `${metrics.success_rate}%`,
              label: "Trip Success Rate",
              color: "text-emerald-600"
            },
            {
              icon: Clock,
              value: `${metrics.years_experience}+`,
              label: "Years Experience",
              color: "text-orange-600"
            },
            {
              icon: Award,
              value: `${metrics.certified_guides}+`,
              label: "Certified Guides",
              color: "text-red-600"
            }
          ].map((metric, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className={`${metric.color} mb-4 flex justify-center`}>
                  <metric.icon className="h-8 w-8" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600">
                  {metric.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customer Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What Our Adventurers Say
          </h3>
          
          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-white shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mr-4 text-white font-bold text-xl">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-4">
                  "{testimonials[currentTestimonial].comment}"
                </blockquote>
                
                <div className="flex items-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {testimonials[currentTestimonial].trip_name}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Button
              variant="ghost"
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:bg-gray-50 rounded-full p-3"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:bg-gray-50 rounded-full p-3"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Dots indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Safety & Quality Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Shield,
              title: "Insurance Coverage",
              description: "Comprehensive insurance for all participants",
              color: "bg-blue-100 text-blue-800"
            },
            {
              icon: Target,
              title: "Safety Record",
              description: "99% trip success rate with zero major incidents",
              color: "bg-green-100 text-green-800"
            },
            {
              icon: Award,
              title: "Guide Qualifications",
              description: "All guides certified and experienced",
              color: "bg-purple-100 text-purple-800"
            },
            {
              icon: CheckCircle,
              title: "Equipment Quality",
              description: "Premium gear with quality guarantees",
              color: "bg-orange-100 text-orange-800"
            }
          ].map((item, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${item.color} rounded-full mb-4`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications & Partnerships */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Certifications & Partnerships
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            {certifications.map((cert, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 mb-3">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-50 transition-colors">
                    <Award className="h-8 w-8 text-gray-600 group-hover:text-green-600" />
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 text-sm mb-1">{cert.name}</h4>
                <p className="text-xs text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}