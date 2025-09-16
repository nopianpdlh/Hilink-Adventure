// src/app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Get session and check admin role
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // Calculate date range
    const now = new Date()
    let dateCondition = ''
    
    if (startDate && endDate) {
      dateCondition = `AND created_at BETWEEN '${startDate}' AND '${endDate}'`
    } else {
      switch (period) {
        case 'day':
          dateCondition = `AND DATE(created_at) = CURRENT_DATE`
          break
        case 'week':
          dateCondition = `AND created_at >= CURRENT_DATE - INTERVAL '7 days'`
          break
        case 'month':
          dateCondition = `AND created_at >= CURRENT_DATE - INTERVAL '30 days'`
          break
        case 'year':
          dateCondition = `AND created_at >= CURRENT_DATE - INTERVAL '1 year'`
          break
      }
    }

    // 1. Trip Revenue & Statistics
    const { data: tripStats } = await supabase
      .from('bookings')
      .select(`
        total_price,
        total_participants,
        status,
        created_at,
        trips!inner(title, quota)
      `)
      .gte('created_at', startDate || new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString())

    // 2. Equipment Revenue (calculated from rentals)
    const { data: equipmentStats } = await supabase
      .from('equipment_rentals')
      .select(`
        quantity,
        created_at,
        bookings!inner(created_at, total_price, status),
        equipment!inner(name, rental_price_per_day, category)
      `)
      .gte('created_at', startDate || new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString())

    // 3. Popular Trips (with booking count)
    const { data: popularTrips } = await supabase
      .from('trips')
      .select(`
        id,
        title,
        quota,
        price,
        bookings(total_participants, status)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // 4. Popular Equipment (with rental count)
    const { data: popularEquipment } = await supabase
      .from('equipment')
      .select(`
        id,
        name,
        category,
        rental_price_per_day,
        equipment_rentals(quantity, bookings!inner(status))
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // 5. Customer Analytics
    const { data: customerData } = await supabase
      .from('profiles')
      .select('id, created_at, role')
      .eq('role', 'pelanggan')
      .gte('created_at', startDate || new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString())

    // Process data for analytics
    const processedData = processAnalyticsData(
      tripStats || [], 
      equipmentStats || [], 
      popularTrips || [], 
      popularEquipment || [],
      customerData || [],
      period
    )

    return NextResponse.json(processedData)

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

function processAnalyticsData(
  tripStats: any[], 
  equipmentStats: any[], 
  popularTrips: any[], 
  popularEquipment: any[],
  customerData: any[],
  period: string
) {
  // Calculate trip revenue and participants
  const validTripBookings = tripStats?.filter(booking => booking.status !== 'cancelled') || []
  const tripRevenue = validTripBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0)
  const tripParticipants = validTripBookings.reduce((sum, booking) => sum + (booking.total_participants || 0), 0)
  const tripBookingsCount = validTripBookings.length

  // Calculate equipment revenue (estimated from rentals * price_per_day)
  const validEquipmentRentals = equipmentStats?.filter(rental => 
    rental.bookings?.status !== 'cancelled'
  ) || []
  
  const equipmentRevenue = validEquipmentRentals.reduce((sum, rental) => {
    const dailyPrice = rental.equipment?.rental_price_per_day || 0
    const quantity = rental.quantity || 0
    // Assuming 1 day rental for simplification, can be enhanced
    return sum + (dailyPrice * quantity)
  }, 0)

  const equipmentOrdersCount = validEquipmentRentals.length

  // Process popular trips with utilization
  const processedTrips = popularTrips?.map(trip => {
    const confirmedBookings = trip.bookings?.filter((b: any) => b.status !== 'cancelled') || []
    const totalParticipants = confirmedBookings.reduce((sum: number, b: any) => sum + (b.total_participants || 0), 0)
    const utilization = trip.quota > 0 ? Math.round((totalParticipants / trip.quota) * 100) : 0
    
    return {
      id: trip.id,
      title: trip.title,
      participants: totalParticipants,
      quota: trip.quota,
      utilization,
      bookingCount: confirmedBookings.length
    }
  }).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5) || []

  // Process popular equipment
  const processedEquipment = popularEquipment?.map(equipment => {
    const confirmedRentals = equipment.equipment_rentals?.filter((r: any) => 
      r.bookings?.status !== 'cancelled'
    ) || []
    const totalRentals = confirmedRentals.reduce((sum: number, r: any) => sum + (r.quantity || 0), 0)
    
    return {
      id: equipment.id,
      name: equipment.name,
      category: equipment.category,
      totalRentals,
      rentalCount: confirmedRentals.length
    }
  }).sort((a, b) => b.totalRentals - a.totalRentals).slice(0, 5) || []

  // Transaction status
  const allBookings = [...(tripStats || []), ...(equipmentStats?.map(e => e.bookings) || [])]
  const statusCounts = allBookings.reduce((acc, booking) => {
    const status = booking?.status || 'pending'
    if (status === 'confirmed' || status === 'paid') acc.success++
    else if (status === 'pending') acc.pending++
    else if (status === 'cancelled') acc.failed++
    return acc
  }, { success: 0, pending: 0, failed: 0 })

  const totalTransactions = statusCounts.success + statusCounts.pending + statusCounts.failed
  const transactionStatus = {
    success: totalTransactions > 0 ? Math.round((statusCounts.success / totalTransactions) * 100) : 0,
    pending: totalTransactions > 0 ? Math.round((statusCounts.pending / totalTransactions) * 100) : 0,
    failed: totalTransactions > 0 ? Math.round((statusCounts.failed / totalTransactions) * 100) : 0
  }

  // Generate trend data (simplified)
  const trendData = generateTrendData(tripStats, equipmentStats, period)

  // Customer analytics
  const newCustomers = customerData?.length || 0
  const repeatCustomers = Math.floor(newCustomers * 0.3) // Estimation

  return {
    summary: {
      tripRevenue,
      equipmentRevenue,
      totalRevenue: tripRevenue + equipmentRevenue,
      tripParticipants,
      equipmentOrders: equipmentOrdersCount,
      totalOrders: tripBookingsCount + equipmentOrdersCount
    },
    popularTrips: processedTrips,
    popularEquipment: processedEquipment,
    transactionStatus,
    trendData,
    customerStats: {
      newCustomers,
      repeatOrders: repeatCustomers
    }
  }
}

function generateTrendData(tripStats: any[], equipmentStats: any[], period: string) {
  // Generate mock trend data based on period
  const periods = period === 'month' ? 30 : period === 'week' ? 7 : period === 'year' ? 12 : 24
  const data = []

  for (let i = periods - 1; i >= 0; i--) {
    let label = ''
    const date = new Date()
    
    if (period === 'year') {
      date.setMonth(date.getMonth() - i)
      label = date.toLocaleDateString('id-ID', { month: 'short' })
    } else if (period === 'month') {
      date.setDate(date.getDate() - i)
      label = date.getDate().toString()
    } else if (period === 'week') {
      date.setDate(date.getDate() - i)
      label = date.toLocaleDateString('id-ID', { weekday: 'short' })
    } else {
      date.setHours(date.getHours() - i)
      label = date.getHours() + ':00'
    }

    // Calculate actual data for the period (simplified)
    const tripRevenue = Math.floor(Math.random() * 5000000) + 2000000 // 2M - 7M
    const equipmentRevenue = Math.floor(Math.random() * 3000000) + 1000000 // 1M - 4M

    data.push({
      label,
      tripRevenue,
      equipmentRevenue,
      participants: Math.floor(Math.random() * 50) + 10,
      orders: Math.floor(Math.random() * 20) + 5
    })
  }

  return data
}