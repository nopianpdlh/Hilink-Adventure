'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mountain, Shield, FileText, AlertTriangle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold">
                <span className="text-green-600">HiLink</span> Adventure
              </span>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Syarat & Ketentuan
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Terakhir diperbarui: 9 September 2025
              </p>
            </CardHeader>

            <CardContent className="prose max-w-none space-y-8">
              {/* Section 1 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Shield className="mr-2 h-6 w-6 text-green-600" />
                  1. Penerimaan Syarat
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Dengan mengakses dan menggunakan layanan HiLink Adventure, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini. Jika Anda tidak menyetujui syarat ini, mohon untuk tidak menggunakan layanan kami.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">2. Layanan Kami</h2>
                <p className="text-gray-700 leading-relaxed">
                  HiLink Adventure menyediakan platform untuk:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Booking trip dan petualangan outdoor</li>
                  <li>Penyewaan peralatan outdoor dan camping</li>
                  <li>Informasi destinasi wisata dan blog</li>
                  <li>Komunitas penggemar alam dan petualangan</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">3. Akun Pengguna</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>3.1 Registrasi:</strong> Anda harus memberikan informasi yang akurat dan lengkap saat mendaftar.</p>
                  <p><strong>3.2 Keamanan:</strong> Anda bertanggung jawab untuk menjaga kerahasiaan password dan aktivitas akun Anda.</p>
                  <p><strong>3.3 Penggunaan:</strong> Akun hanya boleh digunakan oleh pemilik yang sah dan tidak boleh dipindahtangankan.</p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">4. Booking dan Pembayaran</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>4.1 Konfirmasi:</strong> Booking dianggap sah setelah pembayaran dikonfirmasi.</p>
                  <p><strong>4.2 Pembatalan:</strong> Kebijakan pembatalan berlaku sesuai dengan ketentuan masing-masing trip.</p>
                  <p><strong>4.3 Harga:</strong> Harga dapat berubah tanpa pemberitahuan sebelumnya.</p>
                  <p><strong>4.4 Refund:</strong> Pengembalian dana mengikuti kebijakan yang berlaku.</p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">5. Penyewaan Peralatan</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>5.1 Kondisi:</strong> Peralatan harus dikembalikan dalam kondisi baik.</p>
                  <p><strong>5.2 Kerusakan:</strong> Biaya perbaikan atau penggantian akan dibebankan kepada penyewa.</p>
                  <p><strong>5.3 Keterlambatan:</strong> Denda keterlambatan berlaku untuk pengembalian terlambat.</p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="mr-2 h-6 w-6 text-amber-600" />
                  6. Tanggung Jawab dan Risiko
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 font-medium mb-2">Penting untuk dibaca:</p>
                  <ul className="list-disc list-inside space-y-2 text-amber-700">
                    <li>Aktivitas outdoor mengandung risiko yang melekat</li>
                    <li>Peserta bertanggung jawab atas kesehatan dan keselamatan pribadi</li>
                    <li>Wajib mengikuti instruksi pemandu dan aturan keselamatan</li>
                    <li>HiLink Adventure tidak bertanggung jawab atas cedera atau kehilangan akibat kelalaian peserta</li>
                  </ul>
                </div>
              </div>

              {/* Section 7 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">7. Larangan Penggunaan</h2>
                <p className="text-gray-700">Pengguna dilarang untuk:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Menggunakan layanan untuk tujuan ilegal</li>
                  <li>Mengganggu atau merusak sistem</li>
                  <li>Menyebarkan konten yang tidak pantas</li>
                  <li>Melanggar hak kekayaan intelektual</li>
                  <li>Melakukan aktivitas yang membahayakan lingkungan</li>
                </ul>
              </div>

              {/* Section 8 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">8. Kebijakan Privasi</h2>
                <p className="text-gray-700 leading-relaxed">
                  Penggunaan data pribadi Anda diatur dalam{' '}
                  <Link href="/privacy" className="text-green-600 hover:underline">
                    Kebijakan Privasi
                  </Link>{' '}
                  kami yang merupakan bagian integral dari syarat dan ketentuan ini.
                </p>
              </div>

              {/* Section 9 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">9. Perubahan Syarat</h2>
                <p className="text-gray-700 leading-relaxed">
                  HiLink Adventure berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui website atau email. Penggunaan layanan setelah perubahan dianggap sebagai persetujuan terhadap syarat baru.
                </p>
              </div>

              {/* Section 10 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">10. Kontak</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">Hubungi kami jika ada pertanyaan:</p>
                  <ul className="space-y-1 text-green-700">
                    <li>Email: info@hilinkadventure.com</li>
                    <li>WhatsApp: +62 812-3456-7890</li>
                    <li>Alamat: Jl. Gunung Merapi No. 123, Yogyakarta</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
                <Button asChild className="flex-1">
                  <Link href="/register">
                    Saya Menyetujui & Daftar
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/privacy">
                    Baca Kebijakan Privasi
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
