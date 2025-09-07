import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const tripId = searchParams.get('trip_id')

  try {
    let query = supabase
      .from('equipment')
      .select('id, name, description, rental_price_per_day, stock, image_url')
      .gt('stock', 0)
      .order('name', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching equipment:', error)
      return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 })
    }

    // Transform data to match expected format and add categories
    const transformedData = data?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price_per_day: item.rental_price_per_day,
      stock_available: item.stock, // Changed from stock_quantity to stock_available
      image_url: item.image_url,
      category: getCategoryFromName(item.name)
    })) || []

    // If no data from database, return sample data for testing
    if (transformedData.length === 0) {
      const sampleData = [
        {
          id: 'sample-1',
          name: 'Tenda 2 Orang',
          description: 'Tenda berkualitas tinggi untuk 2 orang, tahan air dan mudah dipasang',
          price_per_day: 75000,
          stock_available: 10,
          image_url: '/images/equipment/tent-2p.jpg',
          category: 'Camping'
        },
        {
          id: 'sample-2',
          name: 'Sleeping Bag',
          description: 'Sleeping bag hangat untuk suhu hingga -5°C',
          price_per_day: 50000,
          stock_available: 15,
          image_url: '/images/equipment/sleeping-bag.jpg',
          category: 'Camping'
        },
        {
          id: 'sample-3',
          name: 'Carrier 60L',
          description: 'Carrier/tas gunung kapasitas 60 liter dengan frame internal',
          price_per_day: 100000,
          stock_available: 8,
          image_url: '/images/equipment/carrier-60l.jpg',
          category: 'Tas'
        }
      ]
      return NextResponse.json(sampleData)
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Equipment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getCategoryFromName(name: string): string {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('tenda') || lowerName.includes('sleeping') || lowerName.includes('matras')) {
    return 'Camping'
  } else if (lowerName.includes('tas') || lowerName.includes('carrier') || lowerName.includes('ransel')) {
    return 'Tas'
  } else if (lowerName.includes('kompor') || lowerName.includes('masak') || lowerName.includes('cook')) {
    return 'Masak'
  } else if (lowerName.includes('jaket') || lowerName.includes('sepatu') || lowerName.includes('jacket')) {
    return 'Pakaian'
  } else if (lowerName.includes('senter') || lowerName.includes('headlamp') || lowerName.includes('lampu')) {
    return 'Penerangan'
  } else if (lowerName.includes('pole') || lowerName.includes('tongkat') || lowerName.includes('stick')) {
    return 'Peralatan'
  } else {
    return 'Lainnya'
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, rental_price_per_day, description, stock } = body

    const { data, error } = await supabase
      .from('equipment')
      .insert({
        name,
        rental_price_per_day,
        description,
        stock
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating equipment:', error)
      return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Equipment creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
