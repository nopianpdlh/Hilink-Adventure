'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ModernNavbar from '@/components/ModernNavbar'

function PaymentPendingContent() {
  const searchParams = useSearchParams()
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const order_id = searchParams.get('order_id')
    setOrderId(order_id)
  }, [searchParams])

  const checkPaymentStatus = async () => {
    if (!orderId) return

    setCheckingStatus(true)
    setStatusMessage('')

    try {
      const response = await fetch(`/api/payment/status/${orderId}`)
      const data = await response.json()

      if (data.status === 'paid') {
        setStatusMessage('Pembayaran berhasil! Redirecting...')
        setTimeout(() => {
          window.location.href = `/payment/status?order_id=${orderId}&status=success`
        }, 2000)
      } else if (data.status === 'failed') {
        setStatusMessage('Pembayaran gagal. Redirecting...')
        setTimeout(() => {
          window.location.href = `/payment/error?order_id=${orderId}`
        }, 2000)
      } else {
        setStatusMessage('Status masih pending. Silakan tunggu atau cek ulang.')
      }
    } catch (error) {
      setStatusMessage('Error mengecek status. Silakan coba lagi.')
    } finally {
      setCheckingStatus(false)
    }
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <ModernNavbar />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="border-yellow-200 shadow-lg">
          <CardContent className="text-center py-12">
            {/* Pending Icon with Animation */}
            <div className="mb-8">
              <div className="relative mx-auto w-20 h-20 mb-4">
                <Clock className="h-20 w-20 text-yellow-600 mx-auto animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-yellow-200 border-t-yellow-600 animate-spin"></div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pembayaran Sedang Diproses
              </h1>
              <p className="text-lg text-gray-600">
                Mohon tunggu konfirmasi pembayaran dari bank/payment gateway
              </p>
            </div>

            {/* Status Badge */}
            <div className="mb-8">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-4 py-2 text-lg">
                PENDING
              </Badge>
            </div>

            {/* Order Information */}
            {orderId && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-yellow-800">
                  <strong>Order ID:</strong> <span className="font-mono">{orderId}</span>
                </p>
              </div>
            )}

            {/* Status Check Section */}
            <div className="mb-8">
              <Button 
                onClick={checkPaymentStatus}
                disabled={checkingStatus}
                variant="outline"
                className="mb-4"
              >
                {checkingStatus ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Mengecek Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Cek Status Pembayaran
                  </>
                )}
              </Button>

              {statusMessage && (
                <Alert className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{statusMessage}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Information Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">Informasi Pembayaran Pending:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Transfer bank: Biasanya diproses dalam 1-24 jam</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>E-wallet: Biasanya instan, maksimal 15 menit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Virtual Account: Diproses setelah pembayaran dikonfirmasi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Kartu kredit: Otorisasi sedang diverifikasi bank</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/bookings">
                    Lihat Status Booking
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Beranda
                  </Link>
                </Button>
              </div>
            </div>

            {/* Auto Refresh Notice */}
            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                💡 Halaman ini akan otomatis refresh setiap 30 detik untuk mengecek status pembayaran
              </p>
              
              {/* Contact Support */}
              <div className="text-sm text-gray-600">
                <p>
                  Jika pembayaran tidak update dalam waktu yang wajar, hubungi:{' '}
                  <a href="https://wa.me/6281234567890" className="text-green-600 hover:underline font-medium">
                    Customer Service
                  </a>
                </p>
              </div>
            </div>

            {/* Important Notes */}
            <Alert className="mt-8 text-left border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Penting:</strong> Jangan melakukan pembayaran ulang jika status masih pending. 
                Tunggu konfirmasi atau hubungi customer service jika ada pertanyaan.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Add auto-refresh functionality
if (typeof window !== 'undefined') {
  setInterval(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get('order_id')
    
    if (orderId) {
      fetch(`/api/payment/status/${orderId}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === 'paid') {
            window.location.href = `/payment/status?order_id=${orderId}&status=success`
          } else if (data.status === 'failed') {
            window.location.href = `/payment/error?order_id=${orderId}`
          }
        })
        .catch(console.error)
    }
  }, 30000) // Check every 30 seconds
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  )
}