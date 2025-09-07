'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, Package, Calculator } from 'lucide-react'

export interface EquipmentItem {
  id: string
  name: string
  price_per_day: number
  description?: string
  stock_available: number
  category: string
}

interface EquipmentRentalProps {
  tripId: string
  tripDuration: number // dalam hari
  onTotalChange: (total: number, items: RentalItem[]) => void
}

interface RentalItem {
  equipment_id: string
  name: string
  quantity: number
  price_per_day: number
  total_price: number
}

export default function EquipmentRental({ tripId, tripDuration, onTotalChange }: EquipmentRentalProps) {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([])
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEquipment()
  }, [tripId])

  useEffect(() => {
    const total = rentalItems.reduce((sum, item) => sum + item.total_price, 0)
    onTotalChange(total, rentalItems)
  }, [rentalItems, onTotalChange])

  const fetchEquipment = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/equipment?trip_id=${tripId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Debug log untuk melihat struktur data
      console.log('Equipment API response:', data)
      
      // Handle error response dari API
      if (data.error) {
        throw new Error(data.error)
      }
      
      // Pastikan data adalah array
      if (Array.isArray(data)) {
        setEquipmentList(data)
      } else {
        console.error('Equipment data is not an array:', data)
        setEquipmentList([])
        setError('Format data tidak valid')
      }
    } catch (error) {
      console.error('Error fetching equipment:', error)
      setError(error instanceof Error ? error.message : 'Gagal memuat peralatan')
      setEquipmentList([])
    } finally {
      setLoading(false)
    }
  }

  const addItem = (equipment: EquipmentItem) => {
    const existingItem = rentalItems.find(item => item.equipment_id === equipment.id)
    
    if (existingItem) {
      setRentalItems(items =>
        items.map(item =>
          item.equipment_id === equipment.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, equipment.stock_available),
                total_price: Math.min(item.quantity + 1, equipment.stock_available) * equipment.price_per_day * tripDuration
              }
            : item
        )
      )
    } else {
      const newItem: RentalItem = {
        equipment_id: equipment.id,
        name: equipment.name,
        quantity: 1,
        price_per_day: equipment.price_per_day,
        total_price: equipment.price_per_day * tripDuration
      }
      setRentalItems(items => [...items, newItem])
    }
  }

  const removeItem = (equipmentId: string) => {
    setRentalItems(items =>
      items.map(item =>
        item.equipment_id === equipmentId
          ? {
              ...item,
              quantity: Math.max(item.quantity - 1, 0),
              total_price: Math.max(item.quantity - 1, 0) * item.price_per_day * tripDuration
            }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sewa Peralatan</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sewa Peralatan</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Error: {error}</p>
          <button 
            onClick={fetchEquipment}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  const totalRental = rentalItems.reduce((sum, item) => sum + item.total_price, 0)

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Sewa Peralatan</h3>
      </div>

      {(!equipmentList || !Array.isArray(equipmentList) || equipmentList.length === 0) ? (
        <p className="text-gray-500 text-center py-4">Tidak ada peralatan tersedia untuk trip ini</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {equipmentList.map(equipment => {
              const rentedItem = rentalItems.find(item => item.equipment_id === equipment.id)
              const rentedQuantity = rentedItem?.quantity || 0

              return (
                <div key={equipment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                      <p className="text-sm text-gray-600">{equipment.description}</p>
                      <p className="text-sm font-medium text-green-600">
                        {formatPrice(equipment.price_per_day)}/hari
                      </p>
                      <p className="text-xs text-gray-500">Stok: {equipment.stock_available}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeItem(equipment.id)}
                        disabled={rentedQuantity === 0}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="w-8 text-center font-medium">{rentedQuantity}</span>
                      
                      <button
                        onClick={() => addItem(equipment)}
                        disabled={rentedQuantity >= equipment.stock_available}
                        className="p-1 rounded-full bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {rentedItem && (
                    <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                      <div className="flex justify-between">
                        <span>{rentedQuantity}x untuk {tripDuration} hari</span>
                        <span className="font-medium">{formatPrice(rentedItem.total_price)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {rentalItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  <span>Total Sewa Peralatan:</span>
                </div>
                <span className="text-green-600">{formatPrice(totalRental)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
