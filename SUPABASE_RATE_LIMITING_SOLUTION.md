# Konfigurasi Supabase untuk Mengatasi Rate Limiting

## Masalah yang Sering Terjadi

Error "For security purposes, you can only request this after XX seconds" terjadi karena Supabase memiliki rate limiting yang ketat untuk mencegah spam registrasi dan serangan brute force.

## Solusi yang Telah Diimplementasi dalam Kode

### 1. Rate Limiting Detection & Handling
- Deteksi error rate limiting secara spesifik
- Ekstrak waktu tunggu dari pesan error
- Tampilan pesan error yang user-friendly
- Local storage tracking untuk mencegah spam dari email yang sama

### 2. Client-side Throttling
- Delay 2 detik sebelum request registrasi
- Tracking attempt per email menggunakan localStorage
- Minimum wait time 1 menit untuk email yang sama

## Konfigurasi Supabase Dashboard (Opsional)

Jika masalah masih berlanjut, Anda bisa menyesuaikan pengaturan di Supabase Dashboard:

### 1. Auth Settings

#### A. Rate Limiting Settings
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Go to **Authentication** > **Settings** > **Auth**
4. Scroll ke bagian **Rate Limiting**
5. Sesuaikan pengaturan berikut:

```yaml
# Pengaturan yang direkomendasikan
Sign Up Rate Limit: 
  - Requests per hour: 100 (default: 30)
  - Window size: 3600 seconds (1 hour)

Sign In Rate Limit:
  - Requests per hour: 300 (default: 150)  
  - Window size: 3600 seconds (1 hour)

Password Reset Rate Limit:
  - Requests per hour: 30 (default: 10)
  - Window size: 3600 seconds (1 hour)
```

#### B. Email Settings
1. Go to **Authentication** > **Settings** > **Auth**
2. Scroll ke **Email Auth**
3. Pastikan pengaturan berikut:

```yaml
Enable email confirmations: true
Secure email change: true
Double confirm email changes: false (untuk mengurangi kompleksitas)
```

### 2. Database Policies (RLS)

Pastikan Row Level Security (RLS) dikonfigurasi dengan benar:

#### A. Profiles Table Policy
```sql
-- Policy untuk membaca profile sendiri
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Policy untuk insert profile baru saat registrasi
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy untuk update profile sendiri
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);
```

#### B. Equipment Table Policy (jika ada)
```sql
-- Admin bisa CRUD semua equipment
CREATE POLICY "Admin can manage all equipment" ON equipment
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- User biasa hanya bisa melihat equipment
CREATE POLICY "Users can view equipment" ON equipment
FOR SELECT USING (true);
```

### 3. Environment Variables (.env.local)

Pastikan environment variables sudah benar:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next Auth (jika menggunakan)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Pengaturan Server-side (Opsional untuk Production)

### 1. Next.js API Routes untuk Email Check

Buat endpoint server-side untuk cek email availability:

```typescript
// pages/api/check-email.ts atau app/api/check-email/route.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side key
)

export async function POST(request: Request) {
  const { email } = await request.json()
  
  try {
    // Check if user exists in auth.users table
    const { data, error } = await supabase.auth.admin.getUserByEmail(email)
    
    return Response.json({ 
      available: !data.user,
      error: null 
    })
  } catch (error) {
    return Response.json({ 
      available: null,
      error: 'Unable to check email availability' 
    })
  }
}
```

### 2. Supabase Edge Functions (Advanced)

Untuk kontrol yang lebih baik, buat Supabase Edge Function:

```typescript
// supabase/functions/check-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { email } = await req.json()
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Check if email exists
  const { data, error } = await supabase.auth.admin.getUserByEmail(email)
  
  return new Response(
    JSON.stringify({ 
      available: !data.user,
      error: error?.message || null 
    }),
    { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    }
  )
})
```

## Testing & Troubleshooting

### 1. Test Rate Limiting
```bash
# Test dengan curl untuk melihat response headers
curl -X POST https://your-project.supabase.co/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v
```

### 2. Monitor Supabase Logs
1. Go to **Logs** > **Auth Logs** di dashboard
2. Monitor failed attempts dan rate limiting events
3. Cek pattern dari request yang gagal

### 3. Database Monitoring
```sql
-- Check auth.users table
SELECT email, created_at, email_confirmed_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check rate limiting logs (jika ada)
SELECT * FROM auth.audit_log_entries 
WHERE payload->>'error_code' = 'over_email_send_rate_limit'
ORDER BY created_at DESC;
```

## Best Practices

### 1. User Experience
- Berikan feedback yang jelas saat rate limit
- Sediakan alternatif (email berbeda, tunggu, dll)
- Implementasi retry mechanism dengan exponential backoff
- Simpan form data saat error untuk UX yang lebih baik

### 2. Security
- Jangan expose service role key di client-side
- Implementasi CAPTCHA untuk mencegah bot
- Monitor dan alert untuk abuse detection
- Implementasi IP-based rate limiting jika perlu

### 3. Performance
- Cache hasil email validation
- Implementasi debouncing untuk real-time validation
- Gunakan optimistic UI updates
- Batch multiple validations jika memungkinkan

## Monitoring & Alerts

### 1. Supabase Dashboard
- Monitor Auth > Users untuk pertumbuhan user
- Check Auth > Settings > Auth untuk konfigurasi
- Review Logs untuk error patterns

### 2. Custom Monitoring
```typescript
// Analytics tracking untuk registration errors
const trackRegistrationError = (error: string, email: string) => {
  // Google Analytics, Mixpanel, atau service lainnya
  analytics.track('registration_error', {
    error_type: error,
    email_domain: email.split('@')[1],
    timestamp: new Date().toISOString()
  })
}
```

Dengan implementasi ini, masalah rate limiting seharusnya sudah teratasi. Jika masih ada masalah, coba tingkatkan rate limit di Supabase Dashboard atau implementasikan server-side email validation.
