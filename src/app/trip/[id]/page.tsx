import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Fungsi untuk mengambil data satu trip berdasarkan ID
async function getTripDetails(id: string) {
  console.log('🔍 Getting trip details for ID:', id);
  
  const supabase = await createClient();
  
  // First try: get trip with destination only
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select(`
      *,
      destination:destinations(name)
    `)
    .eq('id', id)
    .single();

  if (tripError) {
    console.error('❌ Error fetching trip details:', tripError);
    return null;
  }
  
  if (!trip) {
    console.log('⚠️ No trip data found for ID:', id);
    return null;
  }
  
  // Try to get reviews separately (fallback if reviews table doesn't exist)
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating, comment, created_at, user_id')
    .eq('trip_id', id);
    
  if (reviewsError) {
    console.log('⚠️ Reviews not available:', reviewsError.message);
    trip.reviews = [];
  } else {
    trip.reviews = reviews || [];
  }
  
  console.log('✅ Trip details found:', trip.title);
  return trip;
}

// Komponen untuk menampilkan bintang rating
function StarRating({ rating, reviewCount }: { rating: number, reviewCount: number }) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-2">
            <div className="flex">
                {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-5 w-5 text-yellow-400" fill="currentColor"/>)}
                {/* Untuk half-star butuh ikon terpisah, kita skip untuk simpel */}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300"/>)}
            </div>
            <span className="text-gray-600 text-sm">({reviewCount} ulasan)</span>
        </div>
    );
}

// Komponen Halaman Detail (Server Component)
export default async function TripDetailPage({ params }: PageProps) {
  // Await params first (Next.js 15 requirement)
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const trip = await getTripDetails(id);

  // Jika trip tidak ditemukan, tampilkan halaman 404
  if (!trip) {
    notFound();
  }

   const reviews = trip.reviews || [];
  const totalRating = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(trip.price);

  const startDate = new Date(trip.start_date).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const endDate = new Date(trip.end_date).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="bg-white">
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
                <span className="text-green-600">HiLink</span> Adventure
            </Link>
            <div className="flex items-center space-x-4">
                {user ? (
                    <>
                        <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                        <form action="/auth/sign-out" method="post">
                            <button type="submit" className="text-gray-800 hover:text-green-600 font-medium">Logout</button>
                        </form>
                    </>
                ) : (
                    <Link href="/login" className="text-gray-800 hover:text-green-600 font-medium">Login</Link>
                )}
            </div>
            </nav>
        </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri: Gambar dan Deskripsi */}
          <div className="lg:col-span-2">
            <img 
              src={trip.image_url || 'https://placehold.co/1200x800/22c55e/ffffff?text=HiLink'} 
              alt={trip.title}
              className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg"
            />
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-6">{trip.title}</h1>
           <div className="flex items-center gap-4 mt-2">
                <p className="text-lg text-gray-600">
                Destinasi: {(trip.destination as any)?.name || 'Tidak diketahui'}
                </p>
                <StarRating rating={averageRating} reviewCount={reviews.length} />
            </div>
            <div className="mt-6 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Deskripsi Trip</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {trip.description}
              </p>
            </div>
             {/* Bagian Ulasan */}
            <div className="mt-10 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ulasan Peserta</h2>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any, index: number) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating || 0} reviewCount={0} />
                        <p className="font-semibold">{review.user?.email || review.user_email || 'Peserta Trip'}</p>
                      </div>
                      <p className="mt-2 text-gray-700">{review.comment || 'Tidak ada komentar'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString('id-ID') : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Belum ada ulasan untuk trip ini.</p>
              )}
            </div>
          </div>
          
          {/* Kolom Kanan (Sidebar): Info Harga & Pesan */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-md p-6 sticky top-24">
              <p className="text-sm text-gray-600">Harga per orang</p>
              <p className="text-3xl font-bold text-green-600 my-2">{formattedPrice}</p>
              
              <div className="mt-4 space-y-3 text-gray-800">
                <div className="flex justify-between">
                  <span className="font-semibold">Tanggal Mulai:</span>
                  <span>{startDate}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="font-semibold">Tanggal Selesai:</span>
                  <span>{endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Sisa Kuota:</span>
                  <span>{trip.quota} orang</span>
                </div>
              </div>

              {user ? (
                <Link href={`/trip/${id}/book`} className="block text-center mt-6 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg">
                    Pesan Sekarang
                </Link>
              ) : (
                <Link href={`/login?next=/trip/${id}`} className="block text-center mt-6 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg">
                    Login untuk Memesan
                </Link>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}