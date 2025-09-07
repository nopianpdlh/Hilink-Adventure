'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { uploadImageToSupabase } from '@/lib/uploadHelpers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import BookingConfirmationEmail from '@/emails/BookingConfirmation'

// --- BOOKING ACTIONS (DIPERBARUI) ---
export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) { return redirect('/login'); }

  const tripId = formData.get('tripId') as string;
  const tripPrice = parseInt(formData.get('tripPrice') as string, 10);
  const participants = parseInt(formData.get('participants') as string, 10);

  if (!tripId || isNaN(tripPrice) || isNaN(participants) || participants <= 0) {
    return redirect(`/trip/${tripId}?error=Invalid data`);
  }

  const { data: tripData } = await supabase.from('trips').select('title').eq('id', tripId).single();
  if (!tripData) {
    return redirect(`/trip/${tripId}?error=Trip tidak ditemukan`);
  }

  const totalPrice = tripPrice * participants;

  const { data: newBooking, error } = await supabase.from('bookings').insert({
    trip_id: tripId,
    user_id: user.id,
    total_participants: participants,
    total_price: totalPrice,
    status: 'pending'
  }).select().single();

  if (error || !newBooking) {
    console.error('Error creating booking:', error);
    return redirect(`/trip/${tripId}/book?error=Gagal membuat pesanan`);
  }

  // Kirim email konfirmasi
  try {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalPrice);
    
    await resend.emails.send({
      from: 'HiLink Adventure <onboarding@resend.dev>', // Ganti dengan domain terverifikasi Anda
      to: [user.email],
      subject: `Konfirmasi Pesanan Anda untuk ${tripData.title}`,
      react: BookingConfirmationEmail({
        customerName: user.email, // Idealnya nama, tapi kita gunakan email dulu
        tripTitle: tripData.title,
        bookingId: newBooking.id,
        totalPrice: formattedPrice,
        totalParticipants: participants,
      })
    });
  } catch (emailError) {
    console.error("Failed to send confirmation email:", emailError);
    // Lanjutkan proses meskipun email gagal, jangan sampai user tidak bisa booking
  }
  
  revalidatePath('/dashboard/my-bookings');
  redirect('/dashboard/my-bookings');
}

// Create booking with equipment rental
export async function createBookingWithEquipment(formData: FormData) {
  const supabase = await createClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) { 
    return redirect('/login'); 
  }

  const tripId = formData.get('tripId') as string;
  const tripPrice = parseInt(formData.get('tripPrice') as string, 10);
  const participants = parseInt(formData.get('participants') as string, 10);
  const equipmentTotal = parseInt(formData.get('equipmentTotal') as string, 10);
  const rentalItemsJson = formData.get('rentalItems') as string;

  if (!tripId || isNaN(tripPrice) || isNaN(participants) || participants <= 0) {
    return redirect(`/trip/${tripId}/book?error=Data tidak valid`);
  }

  // Parse rental items
  let rentalItems = [];
  try {
    rentalItems = rentalItemsJson ? JSON.parse(rentalItemsJson) : [];
  } catch (error) {
    console.error('Error parsing rental items:', error);
    return redirect(`/trip/${tripId}/book?error=Data peralatan tidak valid`);
  }

  const { data: tripData } = await supabase
    .from('trips')
    .select('title')
    .eq('id', tripId)
    .single();

  if (!tripData) {
    return redirect(`/trip/${tripId}/book?error=Trip tidak ditemukan`);
  }

  const totalTripPrice = tripPrice * participants;
  const totalPrice = totalTripPrice + equipmentTotal;

  // Start transaction
  const { data: newBooking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      trip_id: tripId,
      user_id: user.id,
      total_participants: participants,
      total_price: totalPrice,
      status: 'pending'
    })
    .select()
    .single();

  if (bookingError || !newBooking) {
    console.error('Error creating booking:', bookingError);
    return redirect(`/trip/${tripId}/book?error=Gagal membuat pesanan`);
  }

  // Insert equipment rentals if any
  if (rentalItems.length > 0) {
    const equipmentRentals = rentalItems.map((item: any) => ({
      booking_id: newBooking.id,
      equipment_id: item.equipment_id,
      quantity: item.quantity,
      price_per_day: item.price_per_day,
      total_price: item.total_price
    }));

    const { error: rentalError } = await supabase
      .from('equipment_rentals')
      .insert(equipmentRentals);

    if (rentalError) {
      console.error('Error creating equipment rentals:', rentalError);
      // Note: Booking is already created, we might want to handle this differently
      // For now, we'll continue with the booking process
    }

    // Update equipment stock (reduce stock)
    for (const item of rentalItems) {
      // First check current stock
      const { data: currentEquipment } = await supabase
        .from('equipment')
        .select('stock')
        .eq('id', item.equipment_id)
        .single()

      if (currentEquipment && currentEquipment.stock >= item.quantity) {
        const { error: stockError } = await supabase
          .from('equipment')
          .update({ 
            stock: currentEquipment.stock - item.quantity
          })
          .eq('id', item.equipment_id)

        if (stockError) {
          console.error('Error updating equipment stock:', stockError)
        }
      } else {
        console.error('Insufficient stock for equipment:', item.equipment_id)
      }
    }
  }

  // Send confirmation email
  try {
    const formattedPrice = new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR' 
    }).format(totalPrice);
    
    await resend.emails.send({
      from: 'HiLink Adventure <onboarding@resend.dev>',
      to: [user.email],
      subject: `Konfirmasi Pesanan Anda untuk ${tripData.title}`,
      react: BookingConfirmationEmail({
        customerName: user.email,
        tripTitle: tripData.title,
        bookingId: newBooking.id,
        totalPrice: formattedPrice,
        totalParticipants: participants,
      })
    });
  } catch (emailError) {
    console.error("Failed to send confirmation email:", emailError);
  }
  
  revalidatePath('/dashboard/my-bookings');
  redirect('/dashboard/my-bookings');
}


// --- ADMIN ACTIONS ---

// Fungsi untuk membuat destinasi baru
export async function createDestination(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { 
    throw new Error('Authentication required'); 
  }
  
  // Check user role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') { 
    throw new Error('Unauthorized: Admin access required'); 
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) { 
    throw new Error('Name is required'); 
  }

  // Use admin client to bypass RLS for insert operation
  const { error } = await adminSupabase.from('destinations').insert({ 
    name, 
    description
  });

  if (error) {
    console.error("Error creating destination:", error);
    
    // Provide more specific error messages
    if (error.code === '42501') {
      throw new Error('Permission denied: Unable to create destination. Please check your admin privileges.');
    } else if (error.code === '23505') {
      throw new Error('A destination with this name already exists.');
    } else {
      throw new Error(`Failed to create destination: ${error.message}`);
    }
  }

  revalidatePath('/admin/destinations');
}

// Fungsi untuk menghapus destinasi
export async function deleteDestination(formData: FormData) {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('Authentication required'); }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') { throw new Error('Unauthorized'); }

    const id = formData.get('id') as string;
    if (!id) { throw new Error('ID is required'); }

    const { error } = await adminSupabase.from('destinations').delete().eq('id', id);

    if (error) {
        console.error("Error deleting destination:", error);
        throw new Error('Failed to delete destination');
    }

    revalidatePath('/admin/destinations');
}

// --- ADMIN: TRIP ACTIONS ---
export async function createTrip(formData: FormData) {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('Authentication required'); }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') { throw new Error('Unauthorized'); }

    // Handle image upload or URL
    let imageUrl: string | null = null;
    const imageType = formData.get('image_type') as string;
    
    if (imageType === 'file') {
        const imageFile = formData.get('image_file') as File;
        if (imageFile && imageFile.size > 0) {
            try {
                imageUrl = await uploadImageToSupabase(imageFile);
            } catch (error) {
                throw new Error(`Gagal mengupload gambar: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    } else if (imageType === 'url') {
        imageUrl = formData.get('image_url') as string || null;
    }

    const tripData = {
        title: formData.get('title') as string,
        destination_id: formData.get('destination_id') as string,
        description: formData.get('description') as string,
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        price: parseInt(formData.get('price') as string, 10),
        quota: parseInt(formData.get('quota') as string, 10),
        image_url: imageUrl,
    };

    if (!tripData.title || !tripData.destination_id || !tripData.start_date || !tripData.end_date || isNaN(tripData.price) || isNaN(tripData.quota)) {
        console.error('Invalid trip data:', tripData);
        throw new Error('Data tidak lengkap atau tidak valid.');
    }
    
    console.log('Creating trip with data:', tripData);
    
    // Use admin client to bypass RLS
    const { error } = await adminSupabase.from('trips').insert(tripData);

    if (error) {
        console.error("Error creating trip:", error);
        
        // Provide more specific error messages
        if (error.code === '42501') {
            throw new Error('Permission denied: Unable to create trip. Please check your admin privileges.');
        } else if (error.code === '23505') {
            throw new Error('A trip with this data already exists.');
        } else {
            throw new Error(`Gagal membuat paket trip: ${error.message}`);
        }
    }

    revalidatePath('/admin/trips');
    redirect('/admin/trips');
}

// --- ADMIN: PROMOTION ACTIONS ---
export async function createPromotion(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('Authentication required'); }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') { throw new Error('Unauthorized'); }

    const promotionData = {
        code: (formData.get('code') as string).toUpperCase(),
        discount_percentage: parseInt(formData.get('discount_percentage') as string, 10),
        expires_at: formData.get('expires_at') as string || null,
    };
    
    if (!promotionData.code || isNaN(promotionData.discount_percentage)) {
        throw new Error("Kode dan Persentase Diskon wajib diisi.");
    }
    // Jika tanggal kosong, set ke null
    if (!promotionData.expires_at) {
        delete (promotionData as any).expires_at;
    }

    const { error } = await supabase.from('promotions').insert(promotionData);

    if (error) {
        console.error("Error creating promotion:", error);
        // Error spesifik jika kode sudah ada
        if (error.code === '23505') { // unique_violation
             throw new Error("Kode promo sudah ada. Gunakan kode lain.");
        }
        throw new Error("Gagal membuat promo.");
    }

    revalidatePath('/admin/promotions');
}

// --- ADMIN: BLOG ACTIONS ---
export async function createBlogPost(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('Authentication required'); }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') { throw new Error('Unauthorized'); }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const isPublished = formData.get('published') === 'on';

    if (!title || !content) {
        throw new Error("Judul dan Konten wajib diisi.");
    }
    
    // Membuat slug sederhana dari judul
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const postData = {
        title,
        content,
        slug,
        author_id: user.id,
        published_at: isPublished ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from('blog_posts').insert(postData);

    if (error) {
        console.error("Error creating blog post:", error);
        if (error.code === '23505') { // unique_violation untuk slug
             throw new Error("Judul artikel ini sudah ada. Gunakan judul lain.");
        }
        throw new Error("Gagal membuat artikel.");
    }

    revalidatePath('/admin/blog');
    revalidatePath('/blog'); // Revalidate halaman blog publik
    redirect('/admin/blog');
}

// --- ADMIN: EQUIPMENT ACTIONS ---
export async function createEquipment(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('Authentication required'); }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') { throw new Error('Unauthorized'); }

    const equipmentData = {
        name: formData.get('name') as string,
        rental_price_per_day: parseInt(formData.get('rental_price_per_day') as string, 10),
        stock: parseInt(formData.get('stock') as string, 10),
        description: formData.get('description') as string || null,
    };
    
    if (!equipmentData.name || isNaN(equipmentData.rental_price_per_day) || isNaN(equipmentData.stock)) {
        throw new Error("Data peralatan tidak lengkap atau tidak valid.");
    }

    const { error } = await supabase.from('equipment').insert(equipmentData);

    if (error) {
        console.error("Error creating equipment:", error);
        throw new Error("Gagal menyimpan peralatan.");
    }

    revalidatePath('/admin/equipment');
}

// --- ADMIN: REVIEW ACTIONS ---
export async function createReview(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('Authentication required'); }

    const reviewData = {
        trip_id: formData.get('trip_id') as string,
        rating: parseInt(formData.get('rating') as string, 10),
        comment: formData.get('comment') as string,
        user_id: user.id,
    };
    
    if (!reviewData.trip_id || isNaN(reviewData.rating) || reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error("Data ulasan tidak valid.");
    }
    
    // 1. Simpan ulasan
    const { error: reviewError } = await supabase.from('reviews').insert(reviewData);

    if (reviewError) {
        console.error("Error creating review:", reviewError);
        throw new Error("Gagal menyimpan ulasan.");
    }

    // 2. Tandai booking sebagai sudah direview (jika perlu, bisa di-skip)
    // Untuk ini, kita butuh kolom baru di tabel bookings, misal `has_reviewed`
    
    revalidatePath(`/dashboard/my-bookings`);
    revalidatePath(`/trip/${reviewData.trip_id}`);
}


// --- ADMIN: ANALYTICS ACTIONS ---
export async function getAnalyticsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { throw new Error('Authentication required'); }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') { throw new Error('Unauthorized'); }

    // 1. Ambil semua data booking yang statusnya 'paid' atau 'completed'
    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_price, created_at, trip_id')
        .in('status', ['paid', 'completed']);

    if (bookingsError) {
        console.error("Error fetching analytics bookings:", bookingsError);
        throw new Error("Gagal mengambil data booking.");
    }
    
    // 2. Kalkulasi statistik dasar
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_price, 0);
    const totalBookings = bookings.length;

    // 3. Proses data untuk grafik (jumlah pesanan per hari)
    const bookingsByDate = bookings.reduce((acc, booking) => {
        const date = new Date(booking.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date]++;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(bookingsByDate).map(date => ({
        date,
        count: bookingsByDate[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    return {
        totalRevenue,
        totalBookings,
        chartData
    };
}
