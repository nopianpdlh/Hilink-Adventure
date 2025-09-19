'use client'

import { useState, useEffect } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, Calendar, Mail, Receipt, Search, Filter, Eye, 
  Download, RefreshCw, MoreHorizontal, MapPin, Phone, 
  Clock, DollarSign, Package, CheckCircle, XCircle,
  AlertCircle, Calendar as CalendarIcon, X
} from "lucide-react"
import { toast } from "sonner"

interface Booking {
  id: string
  user_id?: string
  trip_id?: string
  status: 'pending' | 'paid' | 'cancelled' | 'completed'
  total_participants: number
  total_price: number
  created_at: string
  updated_at?: string
  participants_count?: number
  duration_days?: number
  payment_status?: 'pending' | 'paid' | 'failed'
  user?: { email?: string }
  trip?: { title?: string }
  user_email?: string
  trip_title?: string
  email?: string
  equipment_rentals?: Array<{
    equipment_name: string
    quantity: number
    daily_rate: number
    total_cost: number
  }>
  payment_transactions?: Array<{
    id: string
    transaction_status: string
    amount: number
    payment_method?: string
    transaction_details?: any
    created_at?: string
  }>
}

async function getBookings(): Promise<Booking[]> {
  const supabase = createClient()
  
  console.log("🔍 Fetching bookings...")
  
  // Get bookings with related data - sesuai dengan schema yang benar
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trips(title),
      equipment_bookings(
        quantity,
        equipment(name)
      ),
      payment_transactions(
        id,
        transaction_status,
        amount,
        payment_method,
        transaction_details,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("❌ Error fetching bookings:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return []
  }

  console.log(`✅ Found ${bookings?.length || 0} bookings`)

  // Process and enrich the data - sesuai dengan schema yang ada
  const enrichedBookings = await Promise.all((bookings || []).map(async (booking: any) => {
    let userEmail = 'N/A'
    
    // Get user email dari profiles table jika user_id ada
    if (booking.user_id) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', booking.user_id)
          .single()
        
        if (profileError) {
          console.log(`⚠️ Profile error for user ${booking.user_id}:`, profileError.message)
        } else if (profile?.email) {
          userEmail = profile.email
          console.log(`✅ Found email: ${userEmail}`)
        }
      } catch (profileError) {
        console.log('❌ Profile query failed:', profileError)
      }
    }

    return {
      ...booking,
      user: { email: userEmail },
      trip: booking.trips || { title: booking.trip_title || 'N/A' },
      equipment_rentals: booking.equipment_bookings?.map((eb: any) => ({
        equipment_name: eb.equipment?.name || 'Unknown',
        quantity: eb.quantity,
        // Note: Schema tidak ada daily_rate dan total_cost di equipment_bookings
        // Ini akan ditambahkan nanti jika diperlukan
        daily_rate: 0,
        total_cost: 0
      })) || []
    }
  }))

  console.log("✨ Enriched bookings completed")
  return enrichedBookings
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          variant: 'secondary' as const, 
          label: 'Pending', 
          icon: Clock,
          color: 'text-yellow-600'
        }
      case 'paid':
        return { 
          variant: 'default' as const, 
          label: 'Paid', 
          icon: CheckCircle,
          color: 'text-green-600'
        }
      case 'cancelled':
        return { 
          variant: 'destructive' as const, 
          label: 'Cancelled', 
          icon: XCircle,
          color: 'text-red-600'
        }
      case 'completed':
        return { 
          variant: 'outline' as const, 
          label: 'Completed', 
          icon: CheckCircle,
          color: 'text-blue-600'
        }
      default:
        return { 
          variant: 'secondary' as const, 
          label: status, 
          icon: AlertCircle,
          color: 'text-gray-600'
        }
    }
  }

  const config = getStatusConfig(status)
  const IconComponent = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Booking Details Sheet Component
function BookingDetailsSheet({ booking, onStatusUpdate }: { 
  booking: Booking, 
  onStatusUpdate: (bookingId: string, newStatus: string) => void 
}) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id)

      if (error) throw error

      onStatusUpdate(booking.id, newStatus)
      toast.success(`Status booking berhasil diubah ke ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      } else {
        console.error('Error details:', JSON.stringify(error, null, 2))
      }
      toast.error(`Gagal mengubah status booking: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <SheetContent className="w-full sm:w-[400px] md:w-[540px] max-w-none sm:max-w-sm md:max-w-lg bg-white z-50">
      <div className="absolute inset-0 bg-white"></div>
      <div className="relative z-10 h-full flex flex-col">
        <SheetHeader className="pb-4 border-b bg-white flex-row justify-between items-start">
          <div className="flex-1">
            <SheetTitle className="text-lg md:text-xl text-gray-900">Detail Booking</SheetTitle>
            <SheetDescription className="text-sm text-gray-600">
              Informasi lengkap tentang booking ini
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>
        
        <div className="flex-1 mt-4 space-y-4 md:space-y-6 overflow-y-auto pb-6">
          {/* Customer Info */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2 text-gray-900">
                <Mail className="h-4 w-4 md:h-5 md:w-5" />
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div>
                <span className="text-xs md:text-sm text-gray-500">Email:</span>
                <p className="font-medium text-sm md:text-base break-all text-gray-900">{booking.user?.email || booking.user_email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs md:text-sm text-gray-500">Booking ID:</span>
                <p className="font-mono text-xs md:text-sm break-all text-gray-700">{booking.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Trip Info */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2 text-gray-900">
                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                Informasi Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div>
                <span className="text-xs md:text-sm text-gray-500">Trip:</span>
                <p className="font-medium text-sm md:text-base text-gray-900">{booking.trip?.title || booking.trip_title || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs md:text-sm text-gray-500">Jumlah Peserta:</span>
                <p className="font-medium text-sm md:text-base text-gray-900">{booking.total_participants || booking.participants_count || 1} orang</p>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Rentals */}
          {booking.equipment_rentals && booking.equipment_rentals.length > 0 && (
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2 text-gray-900">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  Sewa Peralatan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {booking.equipment_rentals.map((rental, index) => (
                    <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm md:text-base truncate text-gray-900">{rental.equipment_name}</p>
                        <p className="text-xs md:text-sm text-gray-500">{rental.quantity}x @ {formatCurrency(rental.daily_rate)}/hari</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-sm md:text-base text-gray-900">{formatCurrency(rental.total_cost)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2 text-gray-900">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                Informasi Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <span className="text-xs md:text-sm text-gray-500">Total Harga:</span>
                <p className="font-bold text-base md:text-lg text-gray-900">{formatCurrency(booking.total_price)}</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <span className="text-xs md:text-sm text-gray-500">Status:</span>
                <StatusBadge status={booking.status} />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <span className="text-xs md:text-sm text-gray-500">Tanggal Booking:</span>
                <p className="text-xs md:text-sm text-gray-900">{new Date(booking.created_at).toLocaleString('id-ID')}</p>
              </div>
              {booking.updated_at && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <span className="text-xs md:text-sm text-gray-500">Terakhir Diupdate:</span>
                  <p className="text-xs md:text-sm text-gray-900">{new Date(booking.updated_at).toLocaleString('id-ID')}</p>
                </div>
              )}
              
              {/* Payment Transactions */}
              {booking.payment_transactions && booking.payment_transactions.length > 0 && (
                <div className="pt-3 border-t">
                  <span className="text-xs md:text-sm text-gray-500 block mb-2">Riwayat Pembayaran:</span>
                  <div className="space-y-2">
                    {booking.payment_transactions.map((transaction, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                          <span className="text-xs md:text-sm text-gray-700">Status: {transaction.transaction_status}</span>
                          <span className="text-xs md:text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</span>
                        </div>
                        {transaction.payment_method && (
                          <p className="text-xs text-gray-500 mt-1">Via: {transaction.payment_method}</p>
                        )}
                        {transaction.created_at && (
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-base md:text-lg text-gray-900">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Select onValueChange={handleStatusUpdate} disabled={isUpdating}>
                  <SelectTrigger className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <SelectValue placeholder="Pilih status baru" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {isUpdating && (
                  <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Memperbarui status...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SheetContent>
  )
}


export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchQuery, statusFilter, dateFilter])

  const loadBookings = async () => {
    setLoading(true)
    try {
      // Try admin API route first (server-side dengan admin privileges)
      console.log("🔄 Trying admin API...")
      const response = await fetch('/api/admin/bookings')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setBookings(result.data)
          console.log(`✅ Admin API succeeded - loaded ${result.count} bookings`)
          return
        }
      }
      
      console.log("❌ Admin API failed, trying regular client...")
      
      // Fallback to regular client (dengan RLS policies)
      try {
        const data = await getBookings()
        setBookings(data)
        console.log("✅ Regular client succeeded")
      } catch (regularError) {
        console.error('❌ Regular client failed:', regularError)
        toast.error('Gagal memuat data booking - periksa koneksi database dan RLS policies')
        setBookings([])
      }
    } catch (error) {
      console.error('❌ Load bookings error:', error)
      toast.error('Gagal memuat data booking')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(booking => 
        (booking.user?.email || booking.user_email || '').toLowerCase().includes(query) ||
        (booking.trip?.title || booking.trip_title || '').toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(booking => 
            new Date(booking.created_at) >= filterDate
          )
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(booking => 
            new Date(booking.created_at) >= filterDate
          )
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(booking => 
            new Date(booking.created_at) >= filterDate
          )
          break
      }
    }

    setFilteredBookings(filtered)
  }

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus as any }
          : booking
      )
    )
  }

  const exportToCSV = () => {
    const csvData = filteredBookings.map(booking => ({
      'Booking ID': booking.id,
      'Email': booking.user?.email || booking.user_email || 'N/A',
      'Trip': booking.trip?.title || booking.trip_title || 'N/A',
      'Participants': booking.total_participants || booking.participants_count || 1,
      'Total Price': booking.total_price,
      'Status': booking.status,
      'Created Date': new Date(booking.created_at).toLocaleDateString('id-ID')
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      paid: bookings.filter(b => b.status === 'paid').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.status === 'paid' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_price || 0), 0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 md:bg-white overflow-x-hidden w-full max-w-full">
        <div className="space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 max-w-full w-full min-w-0">
          <div className="mb-6">
            <Skeleton className="h-6 md:h-8 w-48 md:w-64 mb-2" />
            <Skeleton className="h-3 md:h-4 w-64 md:w-96" />
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 w-full overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-16 md:h-20 w-full min-w-0" />
            ))}
          </div>
          
          {/* Filter skeleton */}
          <Skeleton className="h-16 md:h-20 w-full" />
          
          {/* Content skeleton - desktop table or mobile cards */}
          <div className="space-y-4 w-full">
            <div className="hidden lg:block w-full">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
            <div className="lg:hidden space-y-3 w-full">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white overflow-x-hidden w-full max-w-full">
      <div className="space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 max-w-full w-full min-w-0">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center w-full overflow-hidden">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">Manajemen Bookings</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Kelola semua booking trip yang masuk</p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 w-full md:w-auto shrink-0">
            <Button 
              onClick={loadBookings} 
              variant="outline" 
              size="sm"
              className="flex items-center justify-center gap-2 w-full xs:w-auto h-10"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button 
              onClick={exportToCSV} 
              variant="outline" 
              size="sm"
              className="flex items-center justify-center gap-2 w-full xs:w-auto h-10"
              disabled={filteredBookings.length === 0}
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 w-full overflow-hidden">
          <Card className="bg-white shadow-sm border min-w-0 w-full">
            <CardContent className="p-2 sm:p-3 md:p-4 w-full overflow-hidden">
              <div className="text-center sm:flex sm:items-center sm:justify-between w-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">Total</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-400 mx-auto mt-1 sm:mt-0 sm:ml-2 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border min-w-0 w-full">
            <CardContent className="p-2 sm:p-3 md:p-4 w-full overflow-hidden">
              <div className="text-center sm:flex sm:items-center sm:justify-between w-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">Pending</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-400 mx-auto mt-1 sm:mt-0 sm:ml-2 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border min-w-0 w-full">
            <CardContent className="p-2 sm:p-3 md:p-4 w-full overflow-hidden">
              <div className="text-center sm:flex sm:items-center sm:justify-between w-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">Paid</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-green-600">{stats.paid}</p>
                </div>
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-400 mx-auto mt-1 sm:mt-0 sm:ml-2 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border min-w-0 w-full">
            <CardContent className="p-2 sm:p-3 md:p-4 w-full overflow-hidden">
              <div className="text-center sm:flex sm:items-center sm:justify-between w-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">Completed</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-400 mx-auto mt-1 sm:mt-0 sm:ml-2 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border min-w-0 w-full">
            <CardContent className="p-2 sm:p-3 md:p-4 w-full overflow-hidden">
              <div className="text-center sm:flex sm:items-center sm:justify-between w-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">Cancelled</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-400 mx-auto mt-1 sm:mt-0 sm:ml-2 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 sm:col-span-3 lg:col-span-1 bg-white shadow-sm border min-w-0 w-full">
            <CardContent className="p-2 sm:p-3 md:p-4 w-full overflow-hidden">
              <div className="text-center sm:flex sm:items-center sm:justify-between w-full">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate mb-1">Revenue</p>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-green-600 truncate">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-400 mx-auto mt-1 sm:mt-0 sm:ml-2 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-sm w-full overflow-hidden">
          <CardContent className="p-3 sm:p-4 w-full">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 w-full">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari berdasarkan email, trip, atau booking ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1 sm:w-36 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="flex-1 sm:w-36 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <SelectValue placeholder="Tanggal" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all">Semua Tanggal</SelectItem>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="week">7 Hari Terakhir</SelectItem>
                    <SelectItem value="month">30 Hari Terakhir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Bookings Table/Cards */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <Receipt className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                {bookings.length === 0 ? 'Belum ada booking' : 'Tidak ada hasil'}
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-4">
                {bookings.length === 0 
                  ? 'Booking akan muncul di sini ketika ada yang melakukan pemesanan'
                  : 'Coba ubah filter pencarian atau kriteria lainnya'
                }
              </p>
              
              {bookings.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h4 className="text-xs md:text-sm font-medium text-blue-900 mb-2">💡 Cara mendapatkan booking:</h4>
                  <div className="text-xs md:text-sm text-blue-700 space-y-1 text-left">
                    <p>1. Pastikan sudah ada trip di halaman trips</p>
                    <p>2. User bisa booking melalui halaman utama website</p>
                    <p>3. User harus login terlebih dulu untuk melakukan booking</p>
                    <p>4. Booking akan muncul di sini setelah user submit</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                <Button asChild className="w-full sm:w-auto">
                  <a href="/admin/trips">Kelola Trips</a>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <a href="/">Lihat Website</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Pelanggan
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Trip
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Peserta
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Tanggal
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Total
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="py-4 pl-4 pr-3 text-sm">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.user?.email || booking.user_email || booking.email || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {booking.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {booking.trip?.title || booking.trip_title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <div className="flex items-center text-gray-900">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {booking.total_participants || booking.participants_count || 1} orang
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <div className="flex items-center text-gray-900">
                          <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(booking.created_at).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.created_at).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(booking.total_price || 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency((booking.total_price || 0) / (booking.total_participants || booking.participants_count || 1))}/orang
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm">
                        <StatusBadge status={booking.status || 'pending'} />
                      </td>
                      <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              Detail
                            </Button>
                          </SheetTrigger>
                          <BookingDetailsSheet 
                            booking={booking} 
                            onStatusUpdate={handleStatusUpdate}
                          />
                        </Sheet>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout - Hidden on desktop */}
            <div className="lg:hidden divide-y divide-gray-100 bg-white w-full overflow-hidden">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-3 hover:bg-gray-50 transition-colors w-full">
                  <div className="space-y-3 w-full overflow-hidden">
                    {/* Header with customer and status */}
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="font-medium text-gray-900 text-sm truncate">
                            {booking.user?.email || booking.user_email || booking.email || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate">
                            ID: {booking.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={booking.status || 'pending'} />
                      </div>
                    </div>

                    {/* Trip and participants info */}
                    <div className="bg-gray-50 rounded-lg p-2 space-y-2 w-full overflow-hidden">
                      <div className="flex items-start gap-2 w-full">
                        <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <span className="text-xs text-gray-500 block">Trip:</span>
                          <span className="text-sm font-medium text-gray-900 block truncate">{booking.trip?.title || booking.trip_title || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full">
                        <Users className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="text-xs text-gray-500">Peserta: </span>
                          <span className="text-sm font-medium text-gray-900">{booking.total_participants || booking.participants_count || 1} orang</span>
                        </div>
                      </div>
                    </div>

                    {/* Date and price info */}
                    <div className="flex flex-col gap-2 w-full overflow-hidden">
                      <div className="flex items-center gap-2 w-full">
                        <CalendarIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <span className="text-xs text-gray-500">Tanggal: </span>
                          <span className="text-sm text-gray-900">
                            {new Date(booking.created_at).toLocaleDateString('id-ID')}
                            <span className="text-gray-500 ml-1 text-xs">
                              {new Date(booking.created_at).toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-green-50 rounded-lg p-2 min-w-0 w-full">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 text-green-600 flex-shrink-0" />
                          <span className="text-xs text-green-700">Total:</span>
                        </div>
                        <div className="text-right min-w-0 flex-1 overflow-hidden">
                          <div className="font-semibold text-sm text-green-900 truncate">
                            {formatCurrency(booking.total_price || 0)}
                          </div>
                          <div className="text-xs text-green-600 truncate">
                            {formatCurrency((booking.total_price || 0) / (booking.total_participants || booking.participants_count || 1))}/orang
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-gray-100 space-y-2 w-full">
                      {/* Quick Status Update - Only show for pending bookings */}
                      {booking.status === 'pending' && (
                        <div className="flex gap-1 w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-7 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 min-w-0"
                            onClick={() => handleStatusUpdate(booking.id, 'paid')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terima
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-7 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100 min-w-0"
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Tolak
                          </Button>
                        </div>
                      )}
                      
                      {/* Detail Button */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 h-8 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm">
                            <Eye className="h-3 w-3" />
                            Lihat Detail & Edit Status
                          </Button>
                        </SheetTrigger>
                        <BookingDetailsSheet 
                          booking={booking} 
                          onStatusUpdate={handleStatusUpdate}
                        />
                      </Sheet>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {filteredBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs md:text-sm text-gray-500 px-2">
          <span>
            Menampilkan {filteredBookings.length} dari {bookings.length} booking
          </span>
          <span className="font-medium">
            Total nilai: {formatCurrency(
              filteredBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
            )}
          </span>
        </div>
      )}
      </div>
    </div>
  )
}
