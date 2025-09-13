# Testing Login Redirect by Role

## Test Admin Login

### 1. Buat/Update Admin User

Jalankan query berikut di Supabase SQL Editor:

```sql
-- Pastikan ada user admin untuk testing
-- Pertama, buat user di auth.users (jika belum ada)
-- Atau update existing user profile menjadi admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@hilink.com';

-- Atau insert admin user baru (sesuaikan ID dengan auth.users)
INSERT INTO public.profiles (id, email, full_name, phone, role)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440004', 'admin@test.com', 'Admin Test', '081234567899', 'admin')
ON CONFLICT (id) DO UPDATE SET
  role = 'admin';
```

### 2. Test Login Scenarios

#### Scenario 1: Admin Login
1. Login dengan akun admin: `admin@hilink.com` atau `admin@test.com`
2. **Expected**: Redirect ke `/admin`
3. **Expected Console Log**:
   ```
   🔑 Admin login detected, redirecting to admin dashboard
   ```

#### Scenario 2: Tour Leader Login
1. Login dengan tour leader account
2. **Expected**: Redirect ke `/guide`
3. **Expected Console Log**:
   ```
   🗺️ Tour leader login detected, redirecting to guide dashboard
   ```

#### Scenario 3: Customer Login
1. Login dengan customer account
2. **Expected**: Redirect ke `/dashboard`
3. **Expected Console Log**:
   ```
   👤 Customer login detected, redirecting to customer dashboard
   ```

## Debug Information

Buka Browser Console (F12) saat login untuk melihat:

```javascript
// Profile fetch dan role detection
👤 Fetching user profile for: [user-id]
📋 Profile fetch result: { profile: {...}, error: null }
👤 User role: admin

// Role-based redirect
🔑 Admin login detected, redirecting to admin dashboard
```

## Troubleshooting

### Jika masih redirect salah:

#### 1. Check Database
```sql
-- Cek role user yang login
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'admin@test.com';
```

#### 2. Check RLS Policies
```sql
-- Pastikan policy memungkinkan user baca profile sendiri
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND policyname LIKE '%own profile%';
```

#### 3. Test RLS Access
```sql
-- Test apakah user bisa akses profile sendiri
-- Login sebagai user dulu, lalu jalankan:
SELECT role FROM public.profiles WHERE id = auth.uid();
```

### Jika profile tidak ditemukan:

#### 1. Pastikan trigger bekerja
```sql
-- Cek apakah trigger auto-create profile sudah ada
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created_custom';
```

#### 2. Manual profile creation
```sql
-- Buat profile manual jika perlu
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id, 
  au.email, 
  au.raw_user_meta_data->>'full_name',
  'pelanggan'
FROM auth.users au
WHERE au.email = 'your-email@example.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);
```

## Additional Test Cases

### 1. Update Existing User Role
```sql
-- Ubah role user yang sudah ada
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'existing-user@example.com';
```

### 2. Create Multiple Test Users
```sql
-- Buat beberapa test user dengan role berbeda
INSERT INTO public.profiles (id, email, full_name, role)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', 'customer@test.com', 'Customer Test', 'pelanggan'),
  ('550e8400-e29b-41d4-a716-446655440011', 'guide@test.com', 'Guide Test', 'tour_leader'),
  ('550e8400-e29b-41d4-a716-446655440012', 'admin2@test.com', 'Admin 2 Test', 'admin')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role;
```

### 3. Test Edge Cases
- Login dengan user yang tidak ada di profiles table
- Login dengan user yang punya role NULL
- Login dengan role yang tidak valid

## Expected Results

| Role | Redirect URL | Toast Message |
|------|-------------|--------------|
| `admin` | `/admin` | "Login berhasil! Selamat datang Admin." |
| `tour_leader` | `/guide` | "Login berhasil! Selamat datang Tour Leader." |
| `pelanggan` | `/dashboard` | "Login berhasil! Selamat datang kembali." |
| `null` or missing | `/dashboard` | "Login berhasil! Selamat datang kembali." |