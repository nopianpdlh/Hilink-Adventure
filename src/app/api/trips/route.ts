// src/app/api/trips/route.ts
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const destination = searchParams.get('destination') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const difficulty = searchParams.get('difficulty') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const offset = (page - 1) * limit

    // Base query with JOINs
    let queryBuilder = supabase
      .from('trips')
      .select(`
        id,
        title,
        description,
        start_date,
        end_date,
        price,
        quota,
        image_url,
        created_at,
        destinations!inner(name),
        bookings(status, total_participants)
      `)

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    if (destination) {
      queryBuilder = queryBuilder.eq('destinations.name', destination)
    }

    if (minPrice) {
      queryBuilder = queryBuilder.gte('price', parseInt(minPrice))
    }

    if (maxPrice) {
      queryBuilder = queryBuilder.lte('price', parseInt(maxPrice))
    }

    if (startDate) {
      queryBuilder = queryBuilder.gte('start_date', startDate)
    }

    if (endDate) {
      queryBuilder = queryBuilder.lte('end_date', endDate)
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
      case 'oldest':
        queryBuilder = queryBuilder.order('created_at', { ascending: true })
        break
      case 'price_low':
        queryBuilder = queryBuilder.order('price', { ascending: true })
        break
      case 'price_high':
        queryBuilder = queryBuilder.order('price', { ascending: false })
        break
      case 'start_date':
        queryBuilder = queryBuilder.order('start_date', { ascending: true })
        break
      default:
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: trips, error, count } = await queryBuilder

    if (error) {
      console.error('Error fetching trips:', error)
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
    }

    // Process trips data to calculate remaining quota
    const processedTrips = trips?.map((trip: any) => {
      const confirmedBookings = trip.bookings?.filter(
        (booking: any) => booking.status === 'confirmed' || booking.status === 'paid'
      ) || []
      
      const bookedParticipants = confirmedBookings.reduce(
        (sum: number, booking: any) => sum + (booking.total_participants || 0), 
        0
      )
      
      const remaining = Math.max(0, trip.quota - bookedParticipants)
      
      // Determine status
      let status = 'Terbuka'
      if (remaining === 0) {
        status = 'Penuh'
      } else if (remaining <= trip.quota * 0.2) {
        status = 'Hampir Penuh'
      }
      
      return {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        destination_name: trip.destinations?.name || '',
        start_date: trip.start_date,
        end_date: trip.end_date,
        price: trip.price,
        quota: trip.quota,
        remaining,
        status,
        image_url: trip.image_url,
        created_at: trip.created_at
      }
    }) || []

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('trips')
      .select('id', { count: 'exact', head: true })

    const totalPages = Math.ceil((totalCount || 0) / limit)

    return NextResponse.json({
      data: processedTrips,
      meta: {
        page,
        limit,
        total: totalCount || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Get destinations for filter dropdown
export async function OPTIONS(request: NextRequest) {
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

    const { data: destinations } = await supabase
      .from('destinations')
      .select('id, name')
      .order('name')

    return NextResponse.json({ destinations: destinations || [] })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    )
  }
}