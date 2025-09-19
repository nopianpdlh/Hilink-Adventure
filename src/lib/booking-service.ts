import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { EquipmentHoldService } from './equipment-holds'
import { MidtransService } from './midtrans'

export interface BookingRequest {
  trip_id: string
  participants_count: number
  equipment_items?: EquipmentBookingItem[]
  customer_details: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export interface EquipmentBookingItem {
  equipment_id: string
  quantity: number
}

export interface BookingResponse {
  booking_id: string
  payment_token?: string
  payment_url?: string
  order_id?: string
  total_amount: number
  status: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired'
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'

export class BookingService {
  // Create a new booking with equipment holds
  static async createBooking(bookingData: BookingRequest, userId: string): Promise<BookingResponse> {
    try {
      const supabase = createClient()

      // 1. Get trip details
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', bookingData.trip_id)
        .single()

      if (tripError || !trip) {
        throw new Error('Trip not found')
      }

      // 2. Calculate trip duration
      const startDate = new Date(trip.start_date)
      const endDate = new Date(trip.end_date)
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      // 3. Calculate total cost
      const tripCost = trip.price_per_person * bookingData.participants_count
      let equipmentCost = 0
      
      if (bookingData.equipment_items?.length) {
        for (const item of bookingData.equipment_items) {
          const { data: equipment } = await supabase
            .from('equipment')
            .select('rental_price_per_day')
            .eq('id', item.equipment_id)
            .single()
          
          if (equipment) {
            equipmentCost += equipment.rental_price_per_day * item.quantity * durationDays
          }
        }
      }

      const totalAmount = tripCost + equipmentCost

      // 4. Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          trip_id: bookingData.trip_id,
          user_id: userId,
          participants_count: bookingData.participants_count,
          duration_days: durationDays,
          total_price: totalAmount,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (bookingError) {
        console.error('Booking creation error:', bookingError)
        throw new Error('Failed to create booking')
      }

      // 5. Create equipment holds and bookings
      if (bookingData.equipment_items?.length) {
        for (const item of bookingData.equipment_items) {
          // Create hold first
          await EquipmentHoldService.createHold({
            equipment_id: item.equipment_id,
            quantity: item.quantity,
            booking_id: booking.id,
            hold_duration_minutes: 15
          }, userId)

          // Create equipment booking record
          await supabase
            .from('equipment_bookings')
            .insert({
              booking_id: booking.id,
              equipment_id: item.equipment_id,
              quantity: item.quantity
            })
        }
      }

      // 6. Generate payment token
      const paymentRequest = {
        booking_id: booking.id,
        customer_details: bookingData.customer_details
      }

      const paymentResponse = await fetch('/api/payment/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest)
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment token')
      }

      const paymentData = await paymentResponse.json()

      return {
        booking_id: booking.id,
        payment_token: paymentData.token,
        payment_url: paymentData.redirect_url,
        order_id: paymentData.order_id,
        total_amount: totalAmount,
        status: 'pending'
      }

    } catch (error) {
      console.error('Booking creation error:', error)
      throw error
    }
  }

  // Get booking details
  static async getBooking(bookingId: string, userId?: string): Promise<any> {
    try {
      const supabase = createClient()

      let query = supabase
        .from('bookings')
        .select(`
          *,
          trips (
            id,
            title,
            destination_id,
            start_date,
            end_date,
            price_per_person,
            destinations (
              name
            )
          ),
          equipment_bookings (
            id,
            quantity,
            equipment (
              id,
              name,
              rental_price_per_day,
              image_url
            )
          ),
          payment_transactions (
            id,
            amount,
            status,
            transaction_status,
            created_at
          )
        `)
        .eq('id', bookingId)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: booking, error } = await query.single()

      if (error) {
        console.error('Error fetching booking:', error)
        throw new Error('Booking not found')
      }

      return booking
    } catch (error) {
      console.error('Get booking error:', error)
      throw error
    }
  }

  // Update booking status
  static async updateBookingStatus(
    bookingId: string, 
    status: BookingStatus, 
    paymentStatus?: PaymentStatus
  ): Promise<boolean> {
    try {
      const supabase = createClient()

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (paymentStatus) {
        updateData.payment_status = paymentStatus
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)

      if (error) {
        console.error('Error updating booking status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Booking status update error:', error)
      return false
    }
  }

  // Cancel booking
  static async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<boolean> {
    try {
      const supabase = createClient()

      // 1. Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('user_id', userId)

      if (bookingError) {
        console.error('Error canceling booking:', bookingError)
        return false
      }

      // 2. Release equipment holds
      await supabase
        .from('equipment_holds')
        .delete()
        .eq('booking_id', bookingId)

      // 3. Cancel payment if exists and is still pending
      const { data: paymentTransactions } = await supabase
        .from('payment_transactions')
        .select('id, status')
        .eq('booking_id', bookingId)
        .eq('status', 'pending')

      if (paymentTransactions?.length) {
        for (const transaction of paymentTransactions) {
          try {
            await MidtransService.cancelTransaction(transaction.id)
          } catch (error) {
            console.error('Error canceling Midtrans transaction:', error)
          }

          // Update our payment record
          await supabase
            .from('payment_transactions')
            .update({ status: 'failed' })
            .eq('id', transaction.id)
        }
      }

      return true
    } catch (error) {
      console.error('Booking cancellation error:', error)
      return false
    }
  }

  // Get user bookings
  static async getUserBookings(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trips (
            id,
            title,
            start_date,
            end_date,
            destinations (
              name
            )
          ),
          payment_transactions (
            status,
            transaction_status
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching user bookings:', error)
        throw new Error('Failed to fetch bookings')
      }

      return data || []
    } catch (error) {
      console.error('Get user bookings error:', error)
      throw error
    }
  }

  // Extend equipment holds for a booking
  static async extendBookingHolds(bookingId: string, additionalMinutes: number = 15): Promise<boolean> {
    try {
      const supabase = createClient()

      // Get all holds for this booking
      const { data: holds, error } = await supabase
        .from('equipment_holds')
        .select('id')
        .eq('booking_id', bookingId)

      if (error || !holds?.length) {
        return false
      }

      // Extend each hold
      for (const hold of holds) {
        await EquipmentHoldService.extendHold(hold.id, additionalMinutes)
      }

      return true
    } catch (error) {
      console.error('Error extending booking holds:', error)
      return false
    }
  }
}

// Utility functions
export const getBookingStatusBadge = (status: BookingStatus) => {
  const statusConfig = {
    pending: { label: 'Menunggu Pembayaran', color: 'yellow' },
    confirmed: { label: 'Dikonfirmasi', color: 'green' },
    cancelled: { label: 'Dibatalkan', color: 'red' },
    completed: { label: 'Selesai', color: 'blue' },
    expired: { label: 'Kadaluarsa', color: 'gray' }
  }
  
  return statusConfig[status] || { label: status, color: 'gray' }
}

export const getPaymentStatusBadge = (status: PaymentStatus) => {
  const statusConfig = {
    pending: { label: 'Menunggu', color: 'yellow' },
    processing: { label: 'Diproses', color: 'blue' },
    paid: { label: 'Lunas', color: 'green' },
    failed: { label: 'Gagal', color: 'red' },
    refunded: { label: 'Dikembalikan', color: 'purple' }
  }
  
  return statusConfig[status] || { label: status, color: 'gray' }
}