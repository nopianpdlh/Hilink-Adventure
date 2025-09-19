// src/app/api/payment/recurring-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const signature = req.headers.get('X-Midtrans-Signature')
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Handle recurring payment notification
    console.log('Recurring payment notification:', body)
    
    // Update subscription status in database
    if (body.transaction_status === 'capture' || body.transaction_status === 'settlement') {
      await supabase
        .from('subscriptions')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', body.order_id)
    }
    
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Recurring webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}