# Database Setup for Email Validation

## Row Level Security (RLS) Policies

Jalankan query SQL berikut di Supabase SQL Editor:

### 1. Enable RLS on profiles table
```sql
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Create policies for profiles table
```sql
-- Policy: Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy: Allow users to insert their own profile during registration
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Policy: Allow public read access for email validation (IMPORTANT!)
CREATE POLICY "Allow email validation check" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Note: The last policy allows anyone to check if an email exists
-- This is needed for the registration form email validation
-- If you want to restrict this, you can create a specific RPC function instead
```

### 3. Alternative: Create RPC function for email checking (More Secure)
```sql
-- Create a secure function to check email availability
CREATE OR REPLACE FUNCTION check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE email = email_to_check
  );
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION check_email_exists TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists TO anon;
```

### 4. Create trigger to auto-create profile on user registration
```sql
-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES ( NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', 'pelanggan' ) ON CONFLICT (id) DO NOTHING; RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_custom AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5. Optional: Admin policies for user management
```sql
-- Policy: Admin can view all profiles
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admin can update any profile
CREATE POLICY "Admin can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admin can delete any profile
CREATE POLICY "Admin can delete any profile" 
ON public.profiles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Verification Queries

Setelah setup, verifikasi dengan query berikut:

### Check existing policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Check RLS status
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
-- output dari sql diatas adalah True
```

### Test email check function
```sql
-- Test the email check function
SELECT check_email_exists('test@example.com');
-- output dari sql diatas adalah 'FALSE'
```

## Important Notes

1. **Email Validation Policy**: Policy "Allow email validation check" memungkinkan public read access untuk validasi email. Ini diperlukan agar form registrasi bisa mengecek ketersediaan email.

2. **Security Consideration**: Jika Anda khawatir dengan security, gunakan RPC function `check_email_exists` sebagai gantinya dan update kode frontend untuk menggunakan function tersebut.

3. **Auto Profile Creation**: Trigger `on_auth_user_created` akan otomatis membuat profile di tabel profiles saat user baru mendaftar melalui auth.

4. **Admin Access**: Policy admin memungkinkan user dengan role 'admin' untuk mengelola semua profiles.

## Testing

1. Daftar dengan email baru -> harus berhasil
2. Coba daftar lagi dengan email yang sama -> harus menunjukkan "Email sudah terdaftar"
3. Ketik email yang sudah ada di form -> validasi real-time harus menunjukkan email tidak tersedia