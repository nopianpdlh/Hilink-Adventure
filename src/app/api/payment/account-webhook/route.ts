// src/app/api/payment/account-webhook/route.ts
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
      .update(`${body.account_id}${body.account_status}${process.env.MIDTRANS_SERVER_KEY}`)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Handle account linking notification
    console.log('Account linking notification:', body)
    
    // Update user payment account status
    if (body.account_status === 'ENABLED') {
      await supabase
        .from('user_payment_accounts')
        .upsert({
          user_id: body.user_id,
          account_type: body.account_type, // 'gopay', 'shopeepay', etc
          account_id: body.account_id,
          status: 'active',
          updated_at: new Date().toISOString()
        })
    }
    
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Account webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}