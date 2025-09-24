'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Users, Calendar, Mail, Receipt, Search, Filter, Edit3, Trash2, Eye, CreditCard } from "lucide-react"
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

// Interface sesuai dengan database schema yang sebenarnya
interface Booking {
  id: string
  user_id: string
  trip_id?: string
  total_participants: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  // Derived/enriched data (tidak ada di database table)
  trip?: {
    title: string
  }
  user?: {
    email: string
  }
}

interface BookingManagerProps {
  initialBookings: Booking[]
}

export default function BookingManagerSimple({ initialBookings }: BookingManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(initialBookings)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  // Filter and search functionality
  useEffect(() => {
    let filtered = bookings

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(booking => 
        (booking.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.trip?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }, [searchQuery, statusFilter, bookings])

  // Status badge component
  function StatusBadge({ status, bookingId, onStatusChange, isLoading }: { 
    status: string; 
    bookingId: string; 
    onStatusChange?: (bookingId: string, newStatus: string) => void;
    isLoading?: boolean;
  }) {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'pending':
          return { variant: 'secondary' as const, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
        case 'confirmed':
          return { variant: 'default' as const, label: 'Confirmed', color: 'bg-green-100 text-green-800' }
        case 'cancelled':
          return { variant: 'destructive' as const, label: 'Cancelled', color: 'bg-red-100 text-red-800' }
        case 'completed':
          return { variant: 'outline' as const, label: 'Completed', color: 'bg-blue-100 text-blue-800' }
        default:
          return { variant: 'secondary' as const, label: status, color: 'bg-gray-100 text-gray-800' }
      }
    }

    const config = getStatusConfig(status)
    
    return (
      <Select 
        value={status} 
        onValueChange={(newStatus) => onStatusChange && onStatusChange(bookingId, newStatus)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent">
          <Badge variant={config.variant} className="cursor-pointer hover:opacity-80 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 rounded flex items-center justify-center">
                <div className="animate-spin h-3 w-3 border border-gray-300 rounded-full border-t-gray-600"></div>
              </div>
            )}
            {config.label}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
              Pending
            </div>
          </SelectItem>
          <SelectItem value="confirmed">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Confirmed
            </div>
          </SelectItem>
          <SelectItem value="completed">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              Completed
            </div>
          </SelectItem>
          <SelectItem value="cancelled">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
              Cancelled
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    )
  }

  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setLoading(true)
    
    // Validate status values
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    if (!validStatuses.includes(newStatus)) {
      toast.error(`Status "${newStatus}" tidak valid. Status yang diizinkan: ${validStatuses.join(', ')}`)
      setLoading(false)
      return
    }
    
    try {
      console.log(`🔄 Updating booking ${bookingId} status to: ${newStatus}`)
      
      const { error, data } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .select()

      if (error) {
        console.error('❌ Supabase error details:', error)
        throw error
      }

      console.log('✅ Booking updated successfully:', data)

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus as any }
          : booking
      ))

      toast.success(`Status booking berhasil diubah ke "${newStatus.toUpperCase()}"`)
    } catch (error: any) {
      console.error('❌ Error updating booking status:', error)
      
      let errorMessage = 'Terjadi kesalahan'
      
      if (error.message && error.message.includes('enum')) {
        errorMessage = `Status "${newStatus}" tidak diizinkan oleh database. Silakan hubungi administrator.`
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(`Gagal mengubah status booking: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete booking
  const deleteBooking = async (bookingId: string) => {
    setLoading(true)
    try {
      // First, get booking details for the toast message
      const bookingToDelete = bookings.find(b => b.id === bookingId)
      
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Update local state
      setBookings(prev => prev.filter(booking => booking.id !== bookingId))
      
      toast.success(
        `Booking ${bookingToDelete?.user?.email || 'customer'} berhasil dihapus`
      )
    } catch (error: any) {
      console.error('Error deleting booking:', error)
      toast.error(`Gagal menghapus booking: ${error.message || 'Terjadi kesalahan'}`)
    } finally {
      setLoading(false)
    }
  }

  // Update booking - hanya field yang ada di database
  const updateBooking = async (bookingData: Partial<Booking>) => {
    if (!selectedBooking) {
      toast.error('Tidak ada booking yang dipilih')
      return
    }

    setLoading(true)
    try {
      // Validate required fields
      if (bookingData.total_participants && bookingData.total_participants < 1) {
        toast.error('Jumlah peserta harus minimal 1')
        return
      }
      if (bookingData.total_price && bookingData.total_price < 0) {
        toast.error('Harga tidak boleh negatif')
        return
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          total_participants: bookingData.total_participants,
          total_price: bookingData.total_price,
          status: bookingData.status
        })
        .eq('id', selectedBooking.id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Update local state
      const updatedBooking = { ...selectedBooking, ...bookingData }
      setBookings(prev => prev.map(booking => 
        booking.id === selectedBooking.id ? updatedBooking : booking
      ))
      
      setSelectedBooking(updatedBooking)
      setIsEditDialogOpen(false)
      
      toast.success(`Booking ${selectedBooking.user?.email || 'customer'} berhasil diupdate`)
    } catch (error: any) {
      console.error('Error updating booking:', error)
      toast.error(`Gagal mengupdate booking: ${error.message || 'Terjadi kesalahan'}`)
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manajemen Pesanan</h1>
          <p className="text-gray-600 mt-1">Kelola semua pesanan trip yang masuk</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari email, trip, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dikonfirmasi</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.total_price || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <Receipt className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'Tidak ada hasil' : 'Belum ada pesanan'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Coba ubah kata kunci atau filter pencarian'
                : 'Pesanan akan muncul di sini ketika ada yang booking trip'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Mobile Cards (shown on small screens) */}
          <div className="block lg:hidden space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.user?.email || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.trip?.title || 'N/A'}
                      </p>
                    </div>
                    <StatusBadge 
                      status={booking.status} 
                      bookingId={booking.id}
                      onStatusChange={updateBookingStatus}
                      isLoading={loading}
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Peserta:</span>
                    <span className="font-medium">{booking.total_participants} orang</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-medium">{formatCurrency(booking.total_price)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tanggal:</span>
                    <span className="font-medium">{formatDate(booking.created_at)}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedBooking(booking)
                        setIsDetailsDialogOpen(true)
                      }}
                      className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Detail
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedBooking(booking)
                        setIsEditDialogOpen(true)
                      }}
                      className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-sm"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border border-gray-200 shadow-xl max-w-md mx-4">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900">Hapus Booking</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            Apakah Anda yakin ingin menghapus booking dari <strong>{booking.user?.email}</strong>? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700">Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteBooking(booking.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table (shown on large screens) */}
          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peserta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user?.email || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {booking.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.trip?.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.total_participants} orang
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(booking.total_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge 
                          status={booking.status} 
                          bookingId={booking.id}
                          onStatusChange={updateBookingStatus}
                          isLoading={loading}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(booking.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setIsDetailsDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border border-gray-200 shadow-xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-gray-900">Hapus Booking</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600">
                                Apakah Anda yakin ingin menghapus booking dari <strong>{booking.user?.email}</strong>?
                                <br />Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700">Batal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteBooking(booking.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">Detail Booking</DialogTitle>
            <DialogDescription className="text-gray-600">
              Informasi lengkap booking #{selectedBooking?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Informasi Customer</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <div className="mt-1">
                        <span className="font-medium text-gray-900">{selectedBooking.user?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Detail Pesanan</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Jumlah Peserta:</span>
                      <div className="mt-1">
                        <span className="font-medium text-gray-900">{selectedBooking.total_participants} orang</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Harga:</span>
                      <div className="mt-1">
                        <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.total_price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Trip Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Trip:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.trip?.title || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>
                  <Badge 
                    variant={selectedBooking.status === 'confirmed' ? 'default' : 'secondary'} 
                    className="ml-2"
                  >
                    {selectedBooking.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Dibuat: {formatDate(selectedBooking.created_at)}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="border-t pt-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsDialogOpen(false)}
              className="mr-2"
            >
              Tutup
            </Button>
            <Button 
              onClick={() => {
                setIsDetailsDialogOpen(false)
                setIsEditDialogOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">Edit Booking</DialogTitle>
            <DialogDescription className="text-gray-600">
              Update informasi booking #{selectedBooking?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              updateBooking({
                total_participants: parseInt(formData.get('total_participants') as string),
                total_price: parseInt(formData.get('total_price') as string),
                status: formData.get('status') as ('pending' | 'confirmed' | 'cancelled' | 'completed'),
              })
            }} className="pt-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="total_participants">Jumlah Peserta</Label>
                  <Input
                    id="total_participants"
                    name="total_participants"
                    type="number"
                    min="1"
                    defaultValue={selectedBooking.total_participants}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total_price">Total Harga (IDR)</Label>
                  <Input
                    id="total_price"
                    name="total_price"
                    type="number"
                    min="0"
                    defaultValue={selectedBooking.total_price}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedBooking.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter className="border-t pt-4 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}