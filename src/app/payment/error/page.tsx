'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw, Phone, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ModernNavbar from '@/components/ModernNavbar'

export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen bg-red-50">
      <ModernNavbar />
      
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="border-red-200 shadow-lg">
          <CardContent className="text-center py-12">
            {/* Error Icon */}
            <div className="mb-8">
              <XCircle className="h-20 w-20 text-red-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pembayaran Gagal
              </h1>
              <p className="text-lg text-gray-600">
                Maaf, terjadi kesalahan saat memproses pembayaran Anda
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-red-900 mb-3">Kemungkinan Penyebab:</h3>
              <ul className="text-sm text-red-800 space-y-2">
                <li>• Saldo kartu kredit/debit tidak mencukupi</li>
                <li>• Koneksi internet terputus saat transaksi</li>
                <li>• Limit transaksi harian telah tercapai</li>
                <li>• Kartu diblokir oleh bank</li>
                <li>• Data kartu tidak valid</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                  <Link href="/trips">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Coba Pembayaran Lagi
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

            {/* Help Section */}
            <div className="border-t pt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Butuh Bantuan?</h3>
              <p className="text-gray-600 mb-4">
                Tim customer service kami siap membantu Anda 24/7
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">WhatsApp</div>
                    <a href="https://wa.me/6281234567890" className="text-green-600 hover:underline">
                      +62 812-3456-7890
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Email</div>
                    <a href="mailto:support@hilink-adventure.com" className="text-blue-600 hover:underline">
                      support@hilink-adventure.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Tips untuk Pembayaran Sukses:</h4>
              <ul className="text-sm text-blue-800 text-left space-y-1">
                <li>• Pastikan koneksi internet stabil</li>
                <li>• Periksa saldo dan limit kartu Anda</li>
                <li>• Gunakan browser terbaru dan aktifkan JavaScript</li>
                <li>• Jangan refresh halaman saat proses pembayaran</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}