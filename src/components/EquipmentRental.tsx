'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, Package, CreditCard } from 'lucide-react'

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
  tripDuration: number
  onTotalChange?: (total: number, items: RentalItem[]) => void
}

interface RentalItem {
  equipment_id: string
  name: string
  quantity: number
  price_per_day: number
  total_price: number
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: any) => void
    }
  }
}

export default function EquipmentRental({ tripId, tripDuration, onTotalChange }: EquipmentRentalProps) {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([])
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchEquipment()
  }, [])

  useEffect(() => {
    const total = rentalItems.reduce((sum, item) => sum + item.total_price, 0)
    onTotalChange?.(total, rentalItems)
  }, [rentalItems, onTotalChange])

  const fetchEquipment = async () => {
    try {
      // Mock data for now since we don't have all dependencies
      const mockData: EquipmentItem[] = [
        {
          id: '1',
          name: 'Tenda Camping',
          price_per_day: 50000,
          description: 'Tenda untuk 2-3 orang',
          stock_available: 5,
          category: 'shelter'
        },
        {
          id: '2',
          name: 'Sleeping Bag',
          price_per_day: 25000,
          description: 'Kantong tidur hangat',
          stock_available: 10,
          category: 'sleep'
        }
      ]
      setEquipmentList(mockData)
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = (equipment: EquipmentItem) => {
    const existingItem = rentalItems.find(item => item.equipment_id === equipment.id)
    
    if (existingItem) {
      if (existingItem.quantity >= equipment.stock_available) {
        return
      }
      
      setRentalItems(items =>
        items.map(item =>
          item.equipment_id === equipment.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total_price: (item.quantity + 1) * equipment.price_per_day * tripDuration
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

  const handleCheckout = async () => {
    if (rentalItems.length === 0) return

    setIsProcessing(true)
    
    try {
      // Payment integration will be added here
      console.log('Processing payment for:', rentalItems)
      alert('Payment integration coming soon!')
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateTotal = () => {
    return rentalItems.reduce((sum, item) => sum + item.total_price, 0)
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
        <h3 className="text-lg font-semibold mb-4">Sewa Peralatan</h3>
        <div className="space-y-4">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Sewa Peralatan</h3>
      </div>

      <div className="space-y-4 mb-6">
        {equipmentList.map(equipment => {
          const rentedItem = rentalItems.find(item => item.equipment_id === equipment.id)
          const quantity = rentedItem?.quantity || 0

          return (
            <div key={equipment.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{equipment.name}</h4>
                  <p className="text-sm text-gray-600">{equipment.description}</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatPrice(equipment.price_per_day)}/hari
                  </p>
                  <p className="text-xs text-gray-500">Stok: {equipment.stock_available}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center disabled:opacity-50"
                    onClick={() => removeItem(equipment.id)}
                    disabled={quantity === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  
                  <button
                    className="w-8 h-8 bg-green-600 text-white rounded flex items-center justify-center hover:bg-green-700 disabled:opacity-50"
                    onClick={() => addItem(equipment)}
                    disabled={quantity >= equipment.stock_available}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {rentedItem && (
                <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                  <div className="flex justify-between">
                    <span>{quantity}x untuk {tripDuration} hari</span>
                    <span className="font-medium">{formatPrice(rentedItem.total_price)}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {rentalItems.length > 0 && (
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-green-600">{formatPrice(calculateTotal())}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              'Memproses...'
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Bayar Sekarang
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
