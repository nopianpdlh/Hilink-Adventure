'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users,
  Shield,
  Package,
  Heart,
  Calendar,
  MapPin,
  CheckCircle,
  Star,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react'

export default function ValuePropositions() {
  const tripPropositions = [
    {
      icon: Users,
      title: "Join Like-minded Adventurers",
      description: "Connect with fellow outdoor enthusiasts and make lasting friendships",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Shield,
      title: "Professional Guides & Safety",
      description: "Experienced guides with certifications and emergency protocols",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Package,
      title: "All-inclusive Packages",
      description: "Transportation, meals, accommodation, and equipment included",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Heart,
      title: "Small Group Experiences",
      description: "Intimate groups of 8-12 people for personalized adventures",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Calendar,
      title: "Flexible Booking & Cancellation",
      description: "Easy booking process with flexible cancellation policies",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  const equipmentPropositions = [
    {
      icon: Award,
      title: "Premium Quality Gear",
      description: "Top-brand equipment from trusted outdoor manufacturers",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      icon: Clock,
      title: "Flexible Rental Periods",
      description: "Daily, weekly, or monthly rentals to fit your adventure schedule",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: MapPin,
      title: "Multiple Pickup Locations",
      description: "Convenient pickup points in Jakarta, Bandung, Yogyakarta, and Surabaya",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      icon: CheckCircle,
      title: "Maintenance Included",
      description: "All equipment cleaned, serviced, and safety-checked before rental",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      icon: Shield,
      title: "Insurance Coverage Available",
      description: "Optional insurance to protect your rental and adventure",
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            💝 Why Choose HiLink Adventure?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing exceptional outdoor experiences and premium equipment rentals
          </p>
        </div>

        <div className="space-y-16">
          {/* Open Trips Value Propositions */}
          <div>
            <div className="text-center mb-12">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg font-semibold mb-4">
                🏔️ Open Trip Adventures
              </Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Join Our Community of Adventurers
              </h3>
              <p className="text-gray-600 max-w-xl mx-auto">
                Experience Indonesia's most beautiful destinations with like-minded travelers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {tripPropositions.map((prop, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-md">
                  <CardContent className="p-8">
                    <div className={`${prop.bgColor} ${prop.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <prop.icon className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">
                      {prop.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {prop.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-4">
                <Link href="/trips">
                  Explore Our Trips
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">or</span>
            </div>
          </div>

          {/* Equipment Rental Value Propositions */}
          <div>
            <div className="text-center mb-12">
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-lg font-semibold mb-4">
                🎒 Equipment Rentals
              </Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Premium Gear for Your Adventures
              </h3>
              <p className="text-gray-600 max-w-xl mx-auto">
                Access professional-grade outdoor equipment without the investment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {equipmentPropositions.map((prop, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-md">
                  <CardContent className="p-8">
                    <div className={`${prop.bgColor} ${prop.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <prop.icon className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">
                      {prop.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {prop.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button asChild size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4">
                <Link href="/equipment">
                  Browse Equipment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Combined CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready for Your Next Adventure?
            </h3>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Whether you want to join a group trip or rent premium gear, we've got everything you need
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4">
                <Link href="/trips">
                  Book a Trip
                  <Users className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4">
                <Link href="/equipment">
                  Rent Equipment
                  <Package className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Compare Our Services
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Open Trips */}
              <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-green-600 mr-3" />
                  <h4 className="text-xl font-semibold text-gray-900">Open Trips</h4>
                </div>
                <ul className="space-y-3">
                  {[
                    'Group experiences with 8-12 people',
                    'Professional guides included',
                    'All meals & accommodation',
                    'Transportation provided',
                    'Equipment can be rented separately',
                    'Social networking opportunities'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Equipment Rental */}
              <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center mb-4">
                  <Package className="h-6 w-6 text-blue-600 mr-3" />
                  <h4 className="text-xl font-semibold text-gray-900">Equipment Rental</h4>
                </div>
                <ul className="space-y-3">
                  {[
                    'Premium outdoor gear brands',
                    'Flexible rental periods',
                    'Multiple pickup locations',
                    'Maintenance & cleaning included',
                    'Insurance options available',
                    'Perfect for solo adventures'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}