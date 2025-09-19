import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const holdRequestSchema = z.object({
  equipment_id: z.string().uuid(),
  quantity: z.number().min(1),
  user_id: z.string().uuid().optional()
})

// Create equipment hold
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipment_id, quantity, user_id } = holdRequestSchema.parse(body)
    
    const supabase = await createClient()
    
    // Check equipment availability
    const { data: equipment, error: equipError } = await supabase
      .from('equipment')
      .select('id, name, stock_available')
      .eq('id', equipment_id)
      .single()
    
    if (equipError) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }
    
    if (equipment.stock_available < quantity) {
      return NextResponse.json({ 
        error: 'Insufficient stock available' 
      }, { status: 400 })
    }
    
    // Create hold (15 minutes)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)
    
    const { data: hold, error: holdError } = await supabase
      .from('equipment_holds')
      .insert({
        equipment_id,
        quantity,
        user_id: user_id || null,
        expires_at: expiresAt.toISOString(),
        status: 'active'
      })
      .select()
      .single()
    
    if (holdError) {
      console.error('Hold creation error:', holdError)
      return NextResponse.json({ error: 'Failed to create hold' }, { status: 500 })
    }
    
    return NextResponse.json({
      id: hold.id,
      equipment_id: hold.equipment_id,
      quantity: hold.quantity,
      expires_at: hold.expires_at,
      message: 'Equipment held for 15 minutes'
    })
    
  } catch (error) {
    console.error('Equipment hold error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.issues 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Release equipment hold
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const holdId = searchParams.get('id')
    
    if (!holdId) {
      return NextResponse.json({ error: 'Hold ID required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('equipment_holds')
      .update({ status: 'released', updated_at: new Date().toISOString() })
      .eq('id', holdId)
    
    if (error) {
      console.error('Hold release error:', error)
      return NextResponse.json({ error: 'Failed to release hold' }, { status: 500 })
    }
    
    return NextResponse.json({ message: 'Hold released successfully' })
    
  } catch (error) {
    console.error('Equipment hold release error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}