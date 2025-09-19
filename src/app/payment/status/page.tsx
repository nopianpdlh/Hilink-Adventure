'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

function PaymentStatusContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    const orderIdParam = searchParams.get('order_id')
    const transactionStatus = searchParams.get('transaction_status')
    
    setOrderId(orderIdParam || '')
    
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      setStatus('success')
    } else if (transactionStatus === 'pending') {
      setStatus('pending')
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      setStatus('failed')
    } else {
      setStatus('unknown')
    }
  }, [searchParams])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          title: 'Pembayaran Berhasil!',
          message: 'Terima kasih, pembayaran Anda telah berhasil diproses.'
        }
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          title: 'Pembayaran Pending',
          message: 'Pembayaran Anda sedang diproses. Silakan tunggu beberapa saat.'
        }
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-500',
          title: 'Pembayaran Gagal',
          message: 'Maaf, terjadi kesalahan dalam memproses pembayaran Anda.'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          title: 'Mengecek Status...',
          message: 'Sedang mengecek status pembayaran Anda.'
        }
    }
  }

  const statusInfo = getStatusInfo(status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <StatusIcon className={`h-16 w-16 mx-auto mb-4 ${statusInfo.color}`} />
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {statusInfo.title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {statusInfo.message}
        </p>

        {orderId && (
          <p className="text-sm text-gray-500 mb-6">
            Order ID: {orderId}
          </p>
        )}

        <div className="space-y-3">
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Kembali ke Beranda
          </Button>
          
          {status === 'failed' && (
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Coba Lagi
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  )
}