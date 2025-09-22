'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Clock,
  Mountain,
  Users,
  Package,
  Filter,
  X
} from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SearchFilters {
  destination: string
  startDate: Date | undefined
  endDate: Date | undefined
  priceRange: number[]
  tripType: string
  duration: string
  difficulty: string
  groupSize: string
  category: string
  brand: string
}

export default function SmartSearch() {
  const [activeTab, setActiveTab] = useState('trips')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    destination: '',
    startDate: undefined,
    endDate: undefined,
    priceRange: [500000, 5000000], // IDR
    tripType: '',
    duration: '',
    difficulty: '',
    groupSize: '',
    category: '',
    brand: ''
  })

  // Popular destinations
  const popularDestinations = [
    'Yogyakarta', 'Bromo', 'Komodo', 'Raja Ampat', 'Lombok', 'Flores', 'Labuan Bajo', 'Bali'
  ]

  // Trip types
  const tripTypes = [
    'Adventure', 'Cultural', 'Nature', 'Beach', 'Mountain', 'Diving', 'Trekking', 'Photography'
  ]

  // Equipment categories
  const equipmentCategories = [
    'Climbing Gear', 'Camping Equipment', 'Diving Gear', 'Photography', 'Trekking Gear', 'Safety Equipment'
  ]

  // Equipment brands
  const equipmentBrands = [
    'The North Face', 'Patagonia', 'Black Diamond', 'Petzl', 'Osprey', 'Deuter', 'Arc\'teryx'
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    
    // Add non-empty filters to search params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value)) {
          searchParams.set(key, value.join(','))
        } else if (value instanceof Date) {
          searchParams.set(key, format(value, 'yyyy-MM-dd'))
        } else {
          searchParams.set(key, value.toString())
        }
      }
    })

    // Redirect to appropriate search page
    const searchUrl = `/${activeTab}?${searchParams.toString()}`
    window.location.href = searchUrl
  }

  const clearFilters = () => {
    setFilters({
      destination: '',
      startDate: undefined,
      endDate: undefined,
      priceRange: [500000, 5000000],
      tripType: '',
      duration: '',
      difficulty: '',
      groupSize: '',
      category: '',
      brand: ''
    })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceRange') return value[0] !== 500000 || value[1] !== 5000000
    if (value instanceof Date) return value !== undefined
    return value && value !== ''
  }).length

  return (
    <section id="smart-search" className="py-12 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Adventure
          </h2>
          <p className="text-lg text-gray-600">
            Search through our curated trips and premium equipment
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Headers */}
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="trips" className="flex items-center">
                <Mountain className="w-4 h-4 mr-2" />
                Search Trips
              </TabsTrigger>
              <TabsTrigger value="equipment" className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Rent Equipment
              </TabsTrigger>
            </TabsList>

            {/* Trips Search */}
            <TabsContent value="trips" className="space-y-6">
              {/* Main Search Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Destination */}
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="destination"
                      placeholder="Where to?"
                      value={filters.destination}
                      onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  {/* Popular destinations */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {popularDestinations.slice(0, 4).map((dest) => (
                      <Badge
                        key={dest}
                        variant="secondary"
                        className="cursor-pointer hover:bg-green-100 text-xs"
                        onClick={() => setFilters({ ...filters, destination: dest })}
                      >
                        {dest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date: Date | undefined) => setFilters({ ...filters, startDate: date })}
                        disabled={(date: Date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date: Date | undefined) => setFilters({ ...filters, endDate: date })}
                        disabled={(date: Date) => date < new Date() || (filters.startDate ? date < filters.startDate : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="space-y-2">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value: number[]) => setFilters({ ...filters, priceRange: value })}
                      max={10000000}
                      min={100000}
                      step={100000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatPrice(filters.priceRange[0])}</span>
                      <span>{formatPrice(filters.priceRange[1])}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Trip Type</Label>
                    <Select value={filters.tripType} onValueChange={(value) => setFilters({ ...filters, tripType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {tripTypes.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase()}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={filters.duration} onValueChange={(value) => setFilters({ ...filters, duration: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">1-3 days</SelectItem>
                        <SelectItem value="4-7">4-7 days</SelectItem>
                        <SelectItem value="8-14">8-14 days</SelectItem>
                        <SelectItem value="15+">15+ days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={filters.difficulty} onValueChange={(value) => setFilters({ ...filters, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="challenging">Challenging</SelectItem>
                        <SelectItem value="extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Group Size</Label>
                    <Select value={filters.groupSize} onValueChange={(value) => setFilters({ ...filters, groupSize: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 people</SelectItem>
                        <SelectItem value="6-10">6-10 people</SelectItem>
                        <SelectItem value="11-20">11-20 people</SelectItem>
                        <SelectItem value="20+">20+ people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Equipment Search */}
            <TabsContent value="equipment" className="space-y-6">
              {/* Main Search Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentCategories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase().replace(' ', '-')}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rental Start Date */}
                <div className="space-y-2">
                  <Label>Rental Start</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDate ? format(filters.startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date: Date | undefined) => setFilters({ ...filters, startDate: date })}
                        disabled={(date: Date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Rental End Date */}
                <div className="space-y-2">
                  <Label>Rental End</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.endDate ? format(filters.endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date: Date | undefined) => setFilters({ ...filters, endDate: date })}
                        disabled={(date: Date) => date < new Date() || (filters.startDate ? date < filters.startDate : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Daily Rate Range */}
                <div className="space-y-2">
                  <Label>Daily Rate</Label>
                  <div className="space-y-2">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value: number[]) => setFilters({ ...filters, priceRange: value })}
                      max={1000000}
                      min={50000}
                      step={25000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatPrice(filters.priceRange[0])}/day</span>
                      <span>{formatPrice(filters.priceRange[1])}/day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Filters for Equipment */}
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Select value={filters.brand} onValueChange={(value) => setFilters({ ...filters, brand: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentBrands.map((brand) => (
                          <SelectItem key={brand} value={brand.toLowerCase().replace(' ', '-')}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pickup location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jakarta">Jakarta</SelectItem>
                        <SelectItem value="bandung">Bandung</SelectItem>
                        <SelectItem value="yogyakarta">Yogyakarta</SelectItem>
                        <SelectItem value="surabaya">Surabaya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            <Button
              onClick={handleSearch}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 min-w-32"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}