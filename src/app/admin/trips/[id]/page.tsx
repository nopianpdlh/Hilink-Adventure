import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TripManagement from '@/components/TripManagement'
import PhotoGallery from '@/components/PhotoGallery'
import BusinessSupport from '@/components/BusinessSupport'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

async function getTripDetails(id: string) {
  const supabase = await createClient()
  
  const { data: trip } = await supabase
    .from('trips')
    .select('id, title, description, start_date, end_date')
    .eq('id', id)
    .single()

  return trip
}

export default async function TripDetailAdminPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const supabase = await createClient()
  
  // Check authentication and admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const trip = await getTripDetails(resolvedParams.id)
  if (!trip) {
    redirect('/admin/trips')
  }

  const activeTab = resolvedSearchParams.tab || 'management'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
              <p className="mt-2 text-gray-600">
                Kelola detail trip, peserta, dan galeri foto
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`/trip/${trip.id}`}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Lihat Halaman Publik
              </a>
              <a
                href="/admin/trips"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Kembali ke Daftar Trip
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'management', label: 'Manajemen Trip' },
              { id: 'gallery', label: 'Galeri Foto' },
              { id: 'business', label: 'Business Support' }
            ].map(({ id, label }) => (
              <a
                key={id}
                href={`?tab=${id}`}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'management' && (
            <TripManagement tripId={resolvedParams.id} />
          )}
          
          {activeTab === 'gallery' && (
            <PhotoGallery tripId={resolvedParams.id} isAdmin={true} />
          )}
          
          {activeTab === 'business' && (
            <BusinessSupport isAdmin={true} />
          )}
        </div>
      </div>
    </div>
  )
}
