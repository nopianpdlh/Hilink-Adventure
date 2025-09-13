'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mountain, Shield, Eye, Lock, Database, UserCheck } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
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
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Kebijakan Privasi
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Terakhir diperbarui: 9 September 2025
              </p>
            </CardHeader>

            <CardContent className="prose max-w-none space-y-8">
              {/* Introduction */}
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg">
                  HiLink Adventure berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Database className="mr-2 h-6 w-6 text-blue-600" />
                  1. Informasi yang Kami Kumpulkan
                </h2>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">1.1 Informasi Pribadi</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Nama lengkap</li>
                    <li>Alamat email</li>
                    <li>Nomor telepon</li>
                    <li>Alamat tempat tinggal (jika diperlukan)</li>
                    <li>Tanggal lahir (untuk verifikasi usia)</li>
                    <li>Informasi kontak darurat</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">1.2 Informasi Transaksi</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Riwayat booking dan pembelian</li>
                    <li>Informasi pembayaran (disimpan secara aman)</li>
                    <li>Preferensi trip dan aktivitas</li>
                    <li>Review dan rating yang Anda berikan</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">1.3 Informasi Teknis</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Alamat IP dan lokasi</li>
                    <li>Jenis browser dan perangkat</li>
                    <li>Data penggunaan website</li>
                    <li>Cookies dan teknologi serupa</li>
                  </ul>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Eye className="mr-2 h-6 w-6 text-blue-600" />
                  2. Cara Kami Menggunakan Informasi
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Layanan Utama</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Memproses booking dan pembayaran</li>
                      <li>• Mengirim konfirmasi dan notifikasi</li>
                      <li>• Menyediakan dukungan pelanggan</li>
                      <li>• Mengelola akun pengguna</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Peningkatan Layanan</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Personalisasi pengalaman</li>
                      <li>• Analisis dan penelitian</li>
                      <li>• Pengembangan fitur baru</li>
                      <li>• Keamanan dan fraud prevention</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Lock className="mr-2 h-6 w-6 text-blue-600" />
                  3. Perlindungan Data
                </h2>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">3.1 Keamanan Teknis</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Enkripsi SSL/TLS untuk transmisi data</li>
                    <li>Enkripsi database untuk penyimpanan</li>
                    <li>Autentikasi multi-faktor untuk admin</li>
                    <li>Monitoring keamanan 24/7</li>
                    <li>Backup data secara berkala</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">3.2 Akses Terbatas</h3>
                  <p className="text-gray-700">
                    Hanya karyawan yang memerlukan akses untuk menjalankan tugas mereka yang dapat mengakses data pribadi Anda. Semua akses dicatat dan dimonitor.
                  </p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">4. Berbagi Informasi</h2>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Kami TIDAK menjual data pribadi Anda</h4>
                  <p className="text-amber-700 text-sm">
                    HiLink Adventure berkomitmen untuk tidak menjual, menyewakan, atau memperdagangkan data pribadi pengguna kepada pihak ketiga untuk tujuan komersial.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-gray-800">Kami hanya berbagi informasi dalam situasi:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Dengan persetujuan eksplisit Anda</li>
                    <li>Kepada partner operasional (pemandu, penyedia akomodasi) untuk menjalankan trip</li>
                    <li>Kepada processor pembayaran yang tersertifikasi</li>
                    <li>Jika diwajibkan oleh hukum atau otoritas berwenang</li>
                    <li>Untuk melindungi keamanan dan mencegah fraud</li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <UserCheck className="mr-2 h-6 w-6 text-blue-600" />
                  5. Hak-Hak Anda
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Akses & Kontrol</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ Mengakses data pribadi Anda</li>
                      <li>✓ Memperbarui informasi</li>
                      <li>✓ Menghapus akun</li>
                      <li>✓ Mengunduh data Anda</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Komunikasi</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ Opt-out dari email marketing</li>
                      <li>✓ Mengatur preferensi notifikasi</li>
                      <li>✓ Meminta penjelasan penggunaan data</li>
                      <li>✓ Mengajukan keluhan</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">6. Cookies dan Tracking</h2>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-800">6.1 Jenis Cookies</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <h5 className="font-medium">Essential</h5>
                      <p className="text-gray-600">Diperlukan untuk fungsi website</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <h5 className="font-medium">Analytics</h5>
                      <p className="text-gray-600">Membantu kami memahami penggunaan</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <h5 className="font-medium">Marketing</h5>
                      <p className="text-gray-600">Untuk personalisasi konten</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">7. Penyimpanan Data</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Lokasi:</strong> Data disimpan di server yang berlokasi di Indonesia dan Singapura dengan standar keamanan internasional.</p>
                  <p><strong>Durasi:</strong> Data akan disimpan selama akun aktif dan hingga 7 tahun setelah penutupan akun untuk keperluan legal dan audit.</p>
                  <p><strong>Penghapusan:</strong> Anda dapat meminta penghapusan data lebih awal melalui permintaan tertulis.</p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">8. Perubahan Kebijakan</h2>
                <p className="text-gray-700 leading-relaxed">
                  Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi di website. Kami mendorong Anda untuk meninjau kebijakan ini secara berkala.
                </p>
              </div>

              {/* Contact Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900">9. Hubungi Kami</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-800 mb-4">Data Protection Officer (DPO)</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <p><strong>Email:</strong> privacy@hilinkadventure.com</p>
                      <p><strong>WhatsApp:</strong> +62 812-3456-7890</p>
                    </div>
                    <div>
                      <p><strong>Alamat:</strong> Jl. Gunung Merapi No. 123<br />Yogyakarta, Indonesia 55511</p>
                    </div>
                  </div>
                  <p className="text-blue-600 text-sm mt-4">
                    <strong>Jam Operasional:</strong> Senin - Jumat, 09:00 - 17:00 WIB
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
                <Button asChild className="flex-1">
                  <Link href="/register">
                    Saya Memahami & Daftar
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/terms">
                    Baca Syarat & Ketentuan
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
