'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Play, Star, Users, MapPin, Calendar, TrendingUp } from 'lucide-react'
import SmartSearch from './SmartSearch'

export default function EnhancedHero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const heroImages = [
    '/hero.png',
    '/img-1.png',
    '/img-2.png'
  ]

  const trustIndicators = [
    { icon: Users, label: '1000+', sublabel: 'Happy Adventurers' },
    { icon: MapPin, label: '50+', sublabel: 'Destinations' },
    { icon: Calendar, label: '500+', sublabel: 'Trips Organized' },
    { icon: Star, label: '4.9', sublabel: 'Rating Average' }
  ]

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const scrollToSearch = () => {
    const searchElement = document.getElementById('smart-search')
    searchElement?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        
        {/* Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headlines */}
        <div className="space-y-6 mb-8">
          {/* Badge */}
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Indonesia's #1 Adventure Platform
          </Badge>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Explore Indonesia's
            <span className="block bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Hidden Gems
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Join open trips or rent premium equipment for your next adventure
          </p>

          {/* Description */}
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover breathtaking destinations, connect with fellow adventurers, and gear up with professional-grade equipment for unforgettable experiences
          </p>
        </div>

        {/* Dual CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            asChild 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Link href="/trips" className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Browse Trips
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 py-4 text-lg font-semibold backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Link href="/equipment" className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Rent Equipment
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {trustIndicators.map((indicator, index) => {
            const IconComponent = indicator.icon
            return (
              <div 
                key={index} 
                className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-2">
                  <IconComponent className="w-6 h-6 text-green-400 mr-2" />
                  <span className="text-2xl font-bold text-white">{indicator.label}</span>
                </div>
                <p className="text-sm text-gray-300">{indicator.sublabel}</p>
              </div>
            )
          })}
        </div>

        {/* Video Play Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsVideoPlaying(true)}
            className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-6"
          >
            <Play className="w-8 h-8" />
          </Button>
          <p className="text-sm text-gray-300 mt-2">Watch Our Adventure Story</p>
        </div>

        {/* Scroll Indicator */}
        <div 
          onClick={scrollToSearch}
          className="cursor-pointer animate-bounce hover:scale-110 transition-transform duration-300"
        >
          <div className="mx-auto w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Scroll to explore</p>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-bold z-10"
            >
              ✕ Close
            </button>
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="HiLink Adventure Story"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  )
}