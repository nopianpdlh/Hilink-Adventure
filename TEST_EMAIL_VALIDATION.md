# Test Email Validation

## Setup Test Data

Untuk memastikan email validation bekerja dengan benar, kita perlu data test di database.

### 1. Insert test data ke tabel profiles

Jalankan query berikut di Supabase SQL Editor:

```sql
-- Insert beberapa test user ke profiles table
INSERT INTO public.profiles (id, email, full_name, phone, role)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'test@example.com', 'Test User 1', '081234567890', 'pelanggan'),
  ('550e8400-e29b-41d4-a716-446655440002', 'admin@hilink.com', 'Admin User', '081234567891', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440003', 'guide@hilink.com', 'Tour Guide', '081234567892', 'tour_leader')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;
```

### 2. Test RPC Function

```sql
-- Test dengan email yang ada
SELECT check_email_exists('test@example.com');
-- Output: TRUE (email sudah ada)

-- Test dengan email yang belum ada
SELECT check_email_exists('newuser@example.com');
-- Output: FALSE (email tersedia)
```

### 3. Test Direct Query

```sql
-- Test query langsung ke profiles
SELECT email FROM public.profiles WHERE email = 'test@example.com';
-- Output: test@example.com (jika ada)

SELECT email FROM public.profiles WHERE email = 'newuser@example.com';
-- Output: (kosong, tidak ada data)
```

## Testing Scenarios

### Scenario 1: Email yang sudah terdaftar
1. Buka http://localhost:3000/register
2. Ketik email: `test@example.com`
3. **Expected**: Indikator merah (X) muncul, pesan "Email sudah terdaftar"

### Scenario 2: Email baru yang tersedia
1. Ketik email: `newuser@example.com`
2. **Expected**: Indikator hijau (✓) muncul, pesan "Email tersedia"

### Scenario 3: Registrasi dengan email yang sudah ada
1. Isi form dengan email: `test@example.com`
2. Coba submit form
3. **Expected**: Error "Email sudah terdaftar. Silakan gunakan email lain."

### Scenario 4: Registrasi dengan email baru
1. Isi form dengan email: `newtestuser@gmail.com`
2. Submit form
3. **Expected**: Success message "Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi..."

## Debug Information

Buka browser console (F12) untuk melihat log debug:

```
🔍 Checking email availability for: test@example.com
❌ Email check result: exists
```

atau

```
🔍 Checking email availability for: newuser@example.com
✅ Email check result: available
```

## Troubleshooting

### Jika RPC function tidak bekerja:
1. Cek apakah function sudah dibuat di Supabase
2. Cek permission: `GRANT EXECUTE ON FUNCTION check_email_exists TO anon;`
3. Lihat error di browser console

### Jika direct query tidak bekerja:
1. Cek RLS policy: `CREATE POLICY "Allow email validation check" ON public.profiles FOR SELECT USING (true);`
2. Pastikan tabel profiles ada data test

### Jika validation tidak update real-time:
1. Cek debounce timeout (1 second)
2. Pastikan email format valid
3. Lihat network tab untuk request ke Supabase