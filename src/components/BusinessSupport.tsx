'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  FileText,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

interface Vendor {
  id: string
  name: string
  category: string
  email: string | null
  phone: string | null
  address: string | null
  contact_person: string | null
  rating: number | null
  status: 'active' | 'inactive'
  created_at: string
}

interface FinancialSummary {
  total_revenue: number
  total_bookings: number
  equipment_revenue: number
  pending_payments: number
  monthly_revenue: { month: string, revenue: number }[]
}

interface BusinessSupportProps {
  isAdmin?: boolean
}

export default function BusinessSupport({ isAdmin = false }: BusinessSupportProps) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('vendors')
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: 'transport',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    rating: 5,
    status: 'active' as 'active' | 'inactive'
  })

  useEffect(() => {
    if (isAdmin) {
      loadVendors()
      loadFinancialData()
    }
  }, [isAdmin])

  const loadVendors = async () => {
    const supabase = createClient()
    
    const { data: vendorsData } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false })

    if (vendorsData) {
      setVendors(vendorsData)
    }
  }

  const loadFinancialData = async () => {
    const supabase = createClient()

    try {
      // Get total revenue and bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('total_price, status, created_at')
        .eq('status', 'confirmed')

      // Get equipment revenue
      const { data: equipmentData } = await supabase
        .from('equipment_rentals')
        .select('total_price')

      // Get pending payments
      const { data: pendingData } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('status', 'pending')

      if (bookingsData) {
        const totalRevenue = bookingsData.reduce((sum, booking) => sum + booking.total_price, 0)
        const equipmentRevenue = equipmentData?.reduce((sum, rental) => sum + rental.total_price, 0) || 0
        const pendingPayments = pendingData?.reduce((sum, booking) => sum + booking.total_price, 0) || 0

        // Calculate monthly revenue (last 6 months)
        const monthlyRevenue = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
          
          const monthRevenue = bookingsData
            .filter(booking => booking.created_at.startsWith(monthKey))
            .reduce((sum, booking) => sum + booking.total_price, 0)

          monthlyRevenue.push({
            month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
            revenue: monthRevenue
          })
        }

        setFinancialData({
          total_revenue: totalRevenue,
          total_bookings: bookingsData.length,
          equipment_revenue: equipmentRevenue,
          pending_payments: pendingPayments,
          monthly_revenue: monthlyRevenue
        })
      }
    } catch (error) {
      console.error('Error loading financial data:', error)
    }

    setLoading(false)
  }

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const supabase = createClient()

    try {
      if (editingVendor) {
        // Update vendor
        const { error } = await supabase
          .from('vendors')
          .update(vendorForm)
          .eq('id', editingVendor.id)

        if (error) throw error
      } else {
        // Create vendor
        const { error } = await supabase
          .from('vendors')
          .insert([vendorForm])

        if (error) throw error
      }

      // Reset form and reload data
      setVendorForm({
        name: '',
        category: 'transport',
        email: '',
        phone: '',
        address: '',
        contact_person: '',
        rating: 5,
        status: 'active'
      })
      setShowVendorForm(false)
      setEditingVendor(null)
      await loadVendors()

    } catch (error) {
      console.error('Error saving vendor:', error)
      alert('Gagal menyimpan data vendor')
    }
  }

  const deleteVendor = async (vendorId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus vendor ini?')) return

    const supabase = createClient()

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId)

    if (error) {
      console.error('Error deleting vendor:', error)
      alert('Gagal menghapus vendor')
    } else {
      await loadVendors()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge variant="secondary">Tidak Aktif</Badge>
    )
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      transport: <Building2 className="h-4 w-4" />,
      accommodation: <MapPin className="h-4 w-4" />,
      equipment: <FileText className="h-4 w-4" />,
      food: <DollarSign className="h-4 w-4" />,
      guide: <Users className="h-4 w-4" />
    }
    return icons[category as keyof typeof icons] || <Building2 className="h-4 w-4" />
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Akses terbatas untuk admin</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'vendors', label: 'Manajemen Vendor', icon: Building2 },
            { id: 'financial', label: 'Laporan Keuangan', icon: DollarSign }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Vendor Management Tab */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Manajemen Vendor</h3>
            <button
              onClick={() => setShowVendorForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Tambah Vendor
            </button>
          </div>

          {/* Vendor Form Modal */}
          {showVendorForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-full overflow-auto">
                <div className="p-6">
                  <h4 className="text-lg font-semibold mb-4">
                    {editingVendor ? 'Edit Vendor' : 'Tambah Vendor Baru'}
                  </h4>
                  
                  <form onSubmit={handleVendorSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Vendor
                        </label>
                        <input
                          type="text"
                          value={vendorForm.name}
                          onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kategori
                        </label>
                        <select
                          value={vendorForm.category}
                          onChange={(e) => setVendorForm({...vendorForm, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="transport">Transport</option>
                          <option value="accommodation">Akomodasi</option>
                          <option value="equipment">Peralatan</option>
                          <option value="food">Makanan</option>
                          <option value="guide">Guide</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={vendorForm.email}
                          onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telepon
                        </label>
                        <input
                          type="tel"
                          value={vendorForm.phone}
                          onChange={(e) => setVendorForm({...vendorForm, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kontak Person
                        </label>
                        <input
                          type="text"
                          value={vendorForm.contact_person}
                          onChange={(e) => setVendorForm({...vendorForm, contact_person: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rating (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={vendorForm.rating}
                          onChange={(e) => setVendorForm({...vendorForm, rating: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat
                      </label>
                      <textarea
                        value={vendorForm.address}
                        onChange={(e) => setVendorForm({...vendorForm, address: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="active"
                          checked={vendorForm.status === 'active'}
                          onChange={(e) => setVendorForm({...vendorForm, status: e.target.value as 'active' | 'inactive'})}
                          className="mr-2"
                        />
                        Aktif
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="inactive"
                          checked={vendorForm.status === 'inactive'}
                          onChange={(e) => setVendorForm({...vendorForm, status: e.target.value as 'active' | 'inactive'})}
                          className="mr-2"
                        />
                        Tidak Aktif
                      </label>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowVendorForm(false)
                          setEditingVendor(null)
                          setVendorForm({
                            name: '',
                            category: 'transport',
                            email: '',
                            phone: '',
                            address: '',
                            contact_person: '',
                            rating: 5,
                            status: 'active'
                          })
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        {editingVendor ? 'Update' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Vendor List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(vendor.category)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{vendor.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(vendor.status)}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {vendor.contact_person && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{vendor.contact_person}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">{'★'.repeat(vendor.rating)}</span>
                      <span>({vendor.rating}/5)</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingVendor(vendor)
                      setVendorForm({
                        name: vendor.name,
                        category: vendor.category,
                        email: vendor.email || '',
                        phone: vendor.phone || '',
                        address: vendor.address || '',
                        contact_person: vendor.contact_person || '',
                        rating: vendor.rating || 5,
                        status: vendor.status
                      })
                      setShowVendorForm(true)
                    }}
                    className="p-2 text-gray-600 hover:text-green-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteVendor(vendor.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Reports Tab */}
      {activeTab === 'financial' && financialData && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h3>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialData.total_revenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Booking</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {financialData.total_bookings}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendapatan Peralatan</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(financialData.equipment_revenue)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pembayaran Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(financialData.pending_payments)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
          
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold mb-4">Pendapatan Bulanan (6 Bulan Terakhir)</h4>
            <div className="space-y-4">
              {financialData.monthly_revenue.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.max(1, (item.revenue / Math.max(...financialData.monthly_revenue.map(m => m.revenue))) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
