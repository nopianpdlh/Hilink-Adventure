'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Package, MapPin, Calendar, Clock } from 'lucide-react'

interface Trip {
  id: string
  title: string
  start_date: string
  end_date: string
  quota: number
  bookings: {
    id: string
    total_participants: number
    status: string
    user_id: string
    profiles: {
      full_name: string
      email: string
      phone: string
    } | null
  }[]
}

interface TourLeader {
  id: string
  full_name: string
  email: string
  phone: string
}

interface Equipment {
  id: string
  name: string
  category: string
  stock_quantity: number
}

interface TripManagementProps {
  tripId: string
}

export default function TripManagement({ tripId }: TripManagementProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [tourLeaders, setTourLeaders] = useState<TourLeader[]>([])
  const [assignedLeader, setAssignedLeader] = useState<string>('')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('participants')

  useEffect(() => {
    loadTripData()
    loadTourLeaders()
    loadEquipment()
  }, [tripId])

  const loadTripData = async () => {
    const supabase = createClient()
    
    const { data: tripData } = await supabase
      .from('trips')
      .select(`
        id,
        title,
        start_date,
        end_date,
        quota,
        bookings!inner(
          id,
          total_participants,
          status,
          user_id,
          profiles(
            full_name,
            email,
            phone
          )
        )
      `)
      .eq('id', tripId)
      .eq('bookings.status', 'confirmed')
      .single()

    if (tripData) {
      setTrip(tripData as unknown as Trip)
    }
  }

  const loadTourLeaders = async () => {
    const supabase = createClient()
    
    const { data: leaders } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('role', 'tour_leader')

    if (leaders) {
      setTourLeaders(leaders)
    }
  }

  const loadEquipment = async () => {
    const supabase = createClient()
    
    const { data: equipmentData } = await supabase
      .from('equipment')
      .select('id, name, category, stock_quantity')
      .gt('stock_quantity', 0)
      .order('category', { ascending: true })

    if (equipmentData) {
      setEquipment(equipmentData)
    }
    
    setLoading(false)
  }

  const assignTourLeader = async () => {
    if (!assignedLeader) return

    const supabase = createClient()
    
    const { error } = await supabase
      .from('trip_assignments')
      .upsert({
        trip_id: tripId,
        tour_leader_id: assignedLeader,
        role: 'leader',
        assigned_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error assigning tour leader:', error)
    } else {
      alert('Tour leader berhasil ditugaskan!')
    }
  }

  const saveEquipmentChecklist = async () => {
    const supabase = createClient()
    
    // Delete existing checklist
    await supabase
      .from('trip_equipment_checklist')
      .delete()
      .eq('trip_id', tripId)

    // Insert new checklist
    const checklistItems = selectedEquipment.map(equipmentId => ({
      trip_id: tripId,
      equipment_id: equipmentId,
      is_required: true
    }))

    const { error } = await supabase
      .from('trip_equipment_checklist')
      .insert(checklistItems)

    if (error) {
      console.error('Error saving equipment checklist:', error)
    } else {
      alert('Checklist peralatan berhasil disimpan!')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const },
      confirmed: { label: 'Dikonfirmasi', variant: 'default' as const },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTotalParticipants = () => {
    return trip?.bookings.reduce((total, booking) => total + booking.total_participants, 0) || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Trip tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{trip.title}</h2>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{getTotalParticipants()} / {trip.quota} peserta</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'participants', label: 'Daftar Peserta', icon: Users },
            { id: 'leader', label: 'Tour Leader', icon: UserCheck },
            { id: 'equipment', label: 'Checklist Peralatan', icon: Package }
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

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'participants' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Daftar Peserta Terkonfirmasi</h3>
            {trip.bookings.length === 0 ? (
              <p className="text-gray-500">Belum ada peserta yang terkonfirmasi</p>
            ) : (
              <div className="space-y-3">
                {trip.bookings.map((booking, index) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {booking.profiles?.full_name || booking.profiles?.email || 'Nama tidak tersedia'}
                        </p>
                        <p className="text-sm text-gray-600">{booking.profiles?.email || 'Email tidak tersedia'}</p>
                        {booking.profiles?.phone && (
                          <p className="text-sm text-gray-600">{booking.profiles.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{booking.total_participants} orang</p>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leader' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Penugasan Tour Leader</h3>
            <div className="max-w-md">
              <label htmlFor="tourLeader" className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Tour Leader
              </label>
              <select
                id="tourLeader"
                value={assignedLeader}
                onChange={(e) => setAssignedLeader(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Pilih Tour Leader --</option>
                {tourLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.full_name} ({leader.email})
                  </option>
                ))}
              </select>
              <button
                onClick={assignTourLeader}
                disabled={!assignedLeader}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tugaskan Tour Leader
              </button>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Checklist Peralatan Wajib</h3>
            <p className="text-sm text-gray-600">
              Pilih peralatan yang wajib dibawa oleh peserta atau disediakan oleh penyelenggara
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.reduce((acc, item) => {
                const categoryItems = acc.find(group => group.category === item.category)
                if (categoryItems) {
                  categoryItems.items.push(item)
                } else {
                  acc.push({ category: item.category, items: [item] })
                }
                return acc
              }, [] as { category: string, items: Equipment[] }[]).map((group) => (
                <div key={group.category} className="space-y-3">
                  <h4 className="font-medium text-gray-900 border-b pb-1">{group.category}</h4>
                  {group.items.map((item) => (
                    <label key={item.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEquipment([...selectedEquipment, item.id])
                          } else {
                            setSelectedEquipment(selectedEquipment.filter(id => id !== item.id))
                          }
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="text-xs text-gray-500">({item.stock_quantity} tersedia)</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <button
              onClick={saveEquipmentChecklist}
              className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Simpan Checklist
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
