import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ModernNavbar from '@/components/ModernNavbar'
import { 
  Mountain, 
  ArrowLeft,
  Star,
  Package,
  Shield,
  Clock,
  MapPin,
  Calendar,
  Users,
  ShoppingCart,
  Heart,
  Share2,
  Info,
  CheckCircle,
  XCircle,
  Camera,
  Zap,
  Award
} from 'lucide-react'

interface Equipment {
  id: string
  name: string
  description: string
  price_per_day: number
  category: string
  image_url: string | null
  available_quantity: number
  total_quantity: number
  brand?: string
  condition?: string
  specifications?: any
  features?: string[]
  included_items?: string[]
}

// Sample equipment data
const sampleEquipment: Equipment = {
  id: '1',
  name: 'Carrier Eiger 60L Adventure Pro',
  description: 'Tas carrier premium dengan kapasitas 60L yang dirancang khusus untuk petualangan outdoor multi-day. Dilengkapi dengan sistem ventilasi punggung, rain cover, dan berbagai compartment untuk organisasi gear yang optimal.',
  price_per_day: 25000,
  category: 'backpack',
  image_url: null,
  available_quantity: 5,
  total_quantity: 8,
  brand: 'Eiger',
  condition: 'Sangat Baik',
  specifications: {
    capacity: '60L',
    weight: '2.8kg',
    material: 'Ripstop Nylon 420D',
    dimensions: '75 x 35 x 25 cm',
    max_load: '25kg'
  },
  features: [
    'Rain Cover Included',
    'Ventilated Back System',
    'Multiple Compartments',
    'Adjustable Shoulder Straps',
    'Hip Belt with Pockets',
    'Hydration Compatible',
    'Compression Straps',
    'External Attachment Points'
  ],
  included_items: [
    '1x Carrier Bag 60L',
    '1x Rain Cover',
    '1x Instruction Manual',
    '1x Warranty Card'
  ]
}

// Rental Booking Component
function RentalBooking({ equipment }: { equipment: Equipment }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getAvailabilityStatus = () => {
    const percentage = (equipment.available_quantity / equipment.total_quantity) * 100
    if (percentage > 70) return { text: 'Tersedia', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle }
    if (percentage > 30) return { text: 'Terbatas', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Clock }
    if (percentage > 0) return { text: 'Sedikit', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: Clock }
    return { text: 'Habis', color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle }
  }

  const availability = getAvailabilityStatus()

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-green-600">
              {formatPrice(equipment.price_per_day)}
            </CardTitle>
            <CardDescription>per hari</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Availability Status */}
        <div className={`p-4 rounded-lg ${availability.bgColor}`}>
          <div className="flex items-center">
            <availability.icon className={`h-5 w-5 ${availability.color} mr-2`} />
            <div>
              <p className={`font-semibold ${availability.color}`}>{availability.text}</p>
              <p className="text-sm text-gray-600">
                {equipment.available_quantity} dari {equipment.total_quantity} tersedia
              </p>
            </div>
          </div>
        </div>

        {/* Rental Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Tanggal Mulai</Label>
              <Input
                id="start-date"
                type="date"
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Tanggal Selesai</Label>
              <Input
                id="end-date"
                type="date"
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">Jumlah</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={equipment.available_quantity}
              defaultValue="1"
              className="mt-1"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Subtotal (3 hari)</span>
              <span className="font-semibold">{formatPrice(equipment.price_per_day * 3)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Deposit keamanan</span>
              <span className="font-semibold">{formatPrice(equipment.price_per_day * 2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(equipment.price_per_day * 5)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="space-y-3">
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
          disabled={equipment.available_quantity === 0}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {equipment.available_quantity === 0 ? 'Tidak Tersedia' : 'Sewa Sekarang'}
        </Button>
        <Button variant="outline" className="w-full">
          <Calendar className="mr-2 h-4 w-4" />
          Cek Ketersediaan
        </Button>
      </CardFooter>
    </Card>
  )
}

// Equipment Gallery Component
function EquipmentGallery({ equipment }: { equipment: Equipment }) {
  const images = [
    equipment.image_url || `https://placehold.co/600x400/22c55e/ffffff?text=${encodeURIComponent(equipment.name)}`,
    `https://placehold.co/600x400/1e40af/ffffff?text=Detail+1`,
    `https://placehold.co/600x400/dc2626/ffffff?text=Detail+2`,
    `https://placehold.co/600x400/7c3aed/ffffff?text=Detail+3`,
  ]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img 
          src={images[0]} 
          alt={equipment.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-green-600 hover:bg-green-600">
            {equipment.brand}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary">
            <Camera className="w-3 h-3 mr-1" />
            {images.length} Foto
          </Badge>
        </div>
      </div>

      {/* Thumbnail Images */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <div key={index} className="aspect-square overflow-hidden rounded-md bg-gray-100 cursor-pointer hover:opacity-75">
            <img 
              src={image} 
              alt={`${equipment.name} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Page Component
export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch equipment details
  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  // Use sample data if not found in database
  const displayEquipment = equipment || sampleEquipment

  if (error && equipment === null) {
    console.error('Error fetching equipment:', error)
    // Don't return notFound() here, use sample data instead
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />
      
      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link href="/equipment" className="hover:text-green-600">Equipment</Link>
            <span>/</span>
            <span className="text-gray-900">{displayEquipment.name}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/equipment">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Equipment
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Equipment Gallery */}
              <EquipmentGallery equipment={displayEquipment} />

              {/* Equipment Info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {displayEquipment.name}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        <span className="capitalize">{displayEquipment.category}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span>4.8 (42 ulasan)</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-1" />
                        <span>{displayEquipment.condition}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed">
                  {displayEquipment.description}
                </p>
              </div>

              {/* Specifications */}
              {displayEquipment.specifications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="mr-2 h-5 w-5" />
                      Spesifikasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(displayEquipment.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              {displayEquipment.features && displayEquipment.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="mr-2 h-5 w-5" />
                      Fitur & Keunggulan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {displayEquipment.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Included Items */}
              {displayEquipment.included_items && displayEquipment.included_items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Yang Termasuk dalam Paket
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {displayEquipment.included_items.map((item: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Terms & Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Syarat & Ketentuan Rental
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Deposit keamanan akan dikembalikan 100% jika equipment dikembalikan dalam kondisi baik</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Pemeriksaan kondisi equipment akan dilakukan saat pengambilan dan pengembalian</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Keterlambatan pengembalian dikenakan denda 50% dari harga sewa per hari</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Equipment yang hilang atau rusak berat akan dikenakan biaya penggantian sesuai harga market</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <RentalBooking equipment={displayEquipment} />

              {/* Additional Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">Lokasi Pickup</p>
                      <p className="text-sm text-gray-600">Jakarta Selatan</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">Jam Operasional</p>
                      <p className="text-sm text-gray-600">09:00 - 18:00 WIB</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">Customer Support</p>
                      <p className="text-sm text-gray-600">24/7 Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Equipment */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Equipment Lainnya
            </h2>
            <p className="text-gray-600">
              Peralatan serupa yang mungkin Anda butuhkan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Related equipment cards would go here */}
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 rounded-t-lg"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Equipment {item}</CardTitle>
                  <CardDescription>Kategori equipment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-green-600">Rp 25,000/hari</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Lihat Detail
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="h-8 w-8 text-green-500" />
                <span className="text-xl font-bold">
                  <span className="text-green-500">HiLink</span> Adventure
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Platform terpercaya untuk open trip dan sewa peralatan outdoor. 
                Wujudkan petualangan impianmu bersama kami.
              </p>
              <div className="text-sm text-gray-500">
                © 2025 HiLink Adventure. All rights reserved.
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Layanan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/trips" className="hover:text-green-500 transition-colors">Open Trip</Link></li>
                <li><Link href="/equipment" className="hover:text-green-500 transition-colors">Sewa Alat</Link></li>
                <li><Link href="/blog" className="hover:text-green-500 transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-green-500 transition-colors">Kontak</Link></li>
                <li><Link href="/faq" className="hover:text-green-500 transition-colors">FAQ</Link></li>
                <li><Link href="/terms" className="hover:text-green-500 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const revalidate = 3600 // Revalidate every hour
