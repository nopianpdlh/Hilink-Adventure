import { CoreApi, Snap } from 'midtrans-client'

// Initialize Midtrans Core API
const coreApi = new CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})

// Initialize Midtrans Snap
const snap = new Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})

export interface PaymentItem {
  id: string
  price: number
  quantity: number
  name: string
  category?: string
}

export interface CustomerDetails {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export interface PaymentRequest {
  order_id: string
  gross_amount: number
  customer_details: CustomerDetails
  item_details: PaymentItem[]
}

export class MidtransService {
  // Create Snap token for payment
  static async createSnapToken(paymentData: PaymentRequest) {
    try {
      const parameter = {
        transaction_details: {
          order_id: paymentData.order_id,
          gross_amount: paymentData.gross_amount,
        },
        customer_details: paymentData.customer_details,
        item_details: paymentData.item_details,
        credit_card: {
          secure: true
        },
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`
        }
      }

      const transaction = await snap.createTransaction(parameter)
      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url
      }
    } catch (error) {
      console.error('Midtrans error:', error)
      throw new Error('Failed to create payment token')
    }
  }

  // Check transaction status
  static async checkTransactionStatus(orderId: string) {
    try {
      const baseUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true' 
        ? 'https://api.midtrans.com' 
        : 'https://api.sandbox.midtrans.com'
      
      const response = await fetch(`${baseUrl}/v2/${orderId}/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking transaction status:', error)
      throw new Error('Failed to check payment status')
    }
  }

  // Cancel transaction
  static async cancelTransaction(orderId: string) {
    try {
      const baseUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true' 
        ? 'https://api.midtrans.com' 
        : 'https://api.sandbox.midtrans.com'
      
      const response = await fetch(`${baseUrl}/v2/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error canceling transaction:', error)
      throw new Error('Failed to cancel payment')
    }
  }

  // Verify notification signature for webhook
  static verifySignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string): string {
    const crypto = require('crypto')
    const signatureKey = orderId + statusCode + grossAmount + serverKey
    const signature = crypto.createHash('sha512').update(signatureKey).digest('hex')
    return signature
  }

  // Parse webhook notification
  static parseWebhookNotification(notification: any) {
    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key
    } = notification

    // Verify signature
    const expectedSignature = this.verifySignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!
    )

    if (signature_key !== expectedSignature) {
      throw new Error('Invalid signature')
    }

    // Determine payment status
    let paymentStatus = 'pending'
    
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      paymentStatus = 'success'
    } else if (transaction_status === 'cancel' || transaction_status === 'expire' || transaction_status === 'failure') {
      paymentStatus = 'failed'
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending'
    }

    return {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount: parseFloat(gross_amount),
      payment_status: paymentStatus
    }
  }
}

export { coreApi, snap }