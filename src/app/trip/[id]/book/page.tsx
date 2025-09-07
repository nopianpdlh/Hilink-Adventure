'use client'

import { createClient } from '@/lib/supabase/client'
import { notFound, redirect } from 'next/navigation'
import { useState, useEffect, use } from 'react'
import EquipmentRental from '@/components/EquipmentRental'
import { createBookingWithEquipment } from '@/app/actions'

interface Trip {
  id: string
  title: string
  price: number
  quota: number
  start_date: string
  end_date: string
}

interface RentalItem {
  equipment_id: string
  name: string
  quantity: number
  price_per_day: number
  total_price: number
}

export default function BookingPage({ params, searchParams }: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Unwrap params and searchParams using React.use()
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)
  
  const [trip, setTrip] = useState<Trip | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState(1)
  const [equipmentTotal, setEquipmentTotal] = useState(0)
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      
      // Check user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = `/login?next=/trip/${resolvedParams.id}/book`
        return
      }
      setUser(user)

      // Get trip details
      const { data: tripData } = await supabase
        .from('trips')
        .select('id, title, price, quota, start_date, end_date')
        .eq('id', resolvedParams.id)
        .single()

      if (!tripData) {
        notFound()
        return
      }

      setTrip(tripData)
      setLoading(false)
    }

    init()
  }, [resolvedParams.id])

  const calculateTripDuration = () => {
    if (!trip) return 1
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(diffDays, 1)
  }

  const handleEquipmentChange = (total: number, items: RentalItem[]) => {
    setEquipmentTotal(total)
    setRentalItems(items)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trip || submitting) return

    setSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('tripId', trip.id)
      formData.append('tripPrice', trip.price.toString())
      formData.append('participants', participants.toString())
      formData.append('equipmentTotal', equipmentTotal.toString())
      formData.append('rentalItems', JSON.stringify(rentalItems))

      await createBookingWithEquipment(formData)
    } catch (error) {
      console.error('Booking error:', error)
      setSubmitting(false)
    }
  }

  const totalTripPrice = trip ? trip.price * participants : 0
  const grandTotal = totalTripPrice + equipmentTotal

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!trip) return notFound()

  const error = resolvedSearchParams.error

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900">Formulir Pemesanan</h1>
              <p className="mt-2 text-gray-600">Anda hampir selesai! Harap konfirmasi detail pesanan Anda.</p>
              
              {error && (
                <div className="mt-4 p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">{trip.title}</h2>
                <div className="mt-2 space-y-1 text-gray-700">
                  <div className="flex justify-between">
                    <span>Harga per orang:</span>
                    <span className="font-medium">{formatPrice(trip.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sisa kuota:</span>
                    <span className="font-medium">{trip.quota} orang</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durasi:</span>
                    <span className="font-medium">{calculateTripDuration()} hari</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="mt-6">
                <div>
                  <label htmlFor="participants" className="block text-sm font-medium text-gray-700">
                    Jumlah Peserta
                  </label>
                  <input
                    type="number"
                    id="participants"
                    min="1"
                    max={trip.quota}
                    value={participants}
                    onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                    required
                    className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </form>
            </div>

            {/* Equipment Rental Section */}
            <EquipmentRental
              tripId={resolvedParams.id}
              tripDuration={calculateTripDuration()}
              onTotalChange={handleEquipmentChange}
            />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Trip ({participants} orang)</span>
                  <span>{formatPrice(totalTripPrice)}</span>
                </div>
                
                {equipmentTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Sewa Peralatan</span>
                    <span>{formatPrice(equipmentTotal)}</span>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 px-4 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                {submitting ? 'Memproses...' : 'Konfirmasi dan Lanjutkan ke Pembayaran'}
              </button>

              <div className="text-center mt-4">
                <a href={`/trip/${resolvedParams.id}`} className="text-sm text-green-600 hover:underline">
                  Batal dan kembali
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}