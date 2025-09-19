import { createClient } from '@/lib/supabase/client'

export interface EquipmentHold {
  id: string
  equipment_id: string
  booking_id?: string
  user_id: string
  quantity: number
  expires_at: string
  created_at: string
}

export interface HoldRequest {
  equipment_id: string
  quantity: number
  booking_id?: string
  hold_duration_minutes?: number // default 15 minutes
}

export class EquipmentHoldService {
  // Create equipment hold (client-side)
  static async createHold(holdData: HoldRequest, userId: string): Promise<EquipmentHold | null> {
    try {
      const supabase = createClient()
      
      // Calculate expiration time (default 15 minutes)
      const holdDuration = holdData.hold_duration_minutes || 15
      const expiresAt = new Date(Date.now() + holdDuration * 60 * 1000).toISOString()

      // Check if equipment is available
      const availableQuantity = await this.getAvailableQuantity(
        holdData.equipment_id, 
        holdData.quantity
      )

      if (availableQuantity < holdData.quantity) {
        throw new Error(`Only ${availableQuantity} units available`)
      }

      // Create the hold
      const { data, error } = await supabase
        .from('equipment_holds')
        .insert({
          equipment_id: holdData.equipment_id,
          booking_id: holdData.booking_id,
          user_id: userId,
          quantity: holdData.quantity,
          expires_at: expiresAt
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating equipment hold:', error)
        throw new Error('Failed to create equipment hold')
      }

      return data
    } catch (error) {
      console.error('Equipment hold creation error:', error)
      throw error
    }
  }

  // Get available quantity considering existing holds and bookings
  static async getAvailableQuantity(equipmentId: string, requestedQuantity: number): Promise<number> {
    try {
      const supabase = createClient()

      // Get base stock quantity
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('stock_quantity')
        .eq('id', equipmentId)
        .single()

      if (equipmentError || !equipment) {
        throw new Error('Equipment not found')
      }

      // Get active holds (not expired)
      const { data: activeHolds, error: holdsError } = await supabase
        .from('equipment_holds')
        .select('quantity')
        .eq('equipment_id', equipmentId)
        .gt('expires_at', new Date().toISOString())

      if (holdsError) {
        console.error('Error fetching active holds:', holdsError)
        throw new Error('Failed to check equipment availability')
      }

      // Get confirmed bookings that overlap with potential booking dates
      // For now, we'll just count all confirmed equipment bookings
      const { data: confirmedBookings, error: bookingsError } = await supabase
        .from('equipment_bookings')
        .select(`
          quantity,
          bookings!inner(status)
        `)
        .eq('equipment_id', equipmentId)
        .eq('bookings.status', 'confirmed')

      if (bookingsError) {
        console.error('Error fetching confirmed bookings:', bookingsError)
        throw new Error('Failed to check equipment availability')
      }

      // Calculate total held quantity
      const totalHeld = activeHolds?.reduce((sum, hold) => sum + hold.quantity, 0) || 0
      
      // Calculate total booked quantity  
      const totalBooked = confirmedBookings?.reduce((sum, booking) => sum + booking.quantity, 0) || 0

      // Available quantity = stock - holds - confirmed bookings
      const availableQuantity = equipment.stock_quantity - totalHeld - totalBooked

      return Math.max(0, availableQuantity)
    } catch (error) {
      console.error('Error calculating available quantity:', error)
      throw error
    }
  }

  // Extend hold duration
  static async extendHold(holdId: string, additionalMinutes: number = 15): Promise<boolean> {
    try {
      const supabase = createClient()

      const newExpirationTime = new Date(Date.now() + additionalMinutes * 60 * 1000).toISOString()

      const { error } = await supabase
        .from('equipment_holds')
        .update({ expires_at: newExpirationTime })
        .eq('id', holdId)

      if (error) {
        console.error('Error extending hold:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Hold extension error:', error)
      return false
    }
  }

  // Release hold (when booking is confirmed or cancelled)
  static async releaseHold(holdId: string): Promise<boolean> {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('equipment_holds')
        .delete()
        .eq('id', holdId)

      if (error) {
        console.error('Error releasing hold:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Hold release error:', error)
      return false
    }
  }

  // Release all holds for a user (cleanup)
  static async releaseUserHolds(userId: string, equipmentId?: string): Promise<number> {
    try {
      const supabase = createClient()

      let query = supabase
        .from('equipment_holds')
        .delete()
        .eq('user_id', userId)

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId)
      }

      const { error, count } = await query

      if (error) {
        console.error('Error releasing user holds:', error)
        throw new Error('Failed to release holds')
      }

      return count || 0
    } catch (error) {
      console.error('User holds release error:', error)
      throw error
    }
  }

  // Get user's active holds
  static async getUserHolds(userId: string): Promise<EquipmentHold[]> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('equipment_holds')
        .select(`
          *,
          equipment(name, rental_price_per_day)
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user holds:', error)
        throw new Error('Failed to fetch holds')
      }

      return data || []
    } catch (error) {
      console.error('User holds fetch error:', error)
      throw error
    }
  }
}

// Utility functions
export const formatHoldExpiration = (expiresAt: string): string => {
  const expiration = new Date(expiresAt)
  const now = new Date()
  const diffMs = expiration.getTime() - now.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffMinutes <= 0) {
    return 'Expired'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minutes remaining`
  } else {
    const diffHours = Math.floor(diffMinutes / 60)
    const remainingMinutes = diffMinutes % 60
    return `${diffHours}h ${remainingMinutes}m remaining`
  }
}

export const isHoldExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) <= new Date()
}