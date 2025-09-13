# Fix AuthContext Profile Access

## Problem
AuthContext tidak bisa fetch profile data karena RLS policies atau missing data.

## Solution SQL Queries

Jalankan query berikut di Supabase SQL Editor:

### 1. Update RLS Policies for AuthContext
  
```sql
-- Drop existing conflicting policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow email validation check" ON public.profiles;

-- Create new comprehensive policies
CREATE POLICY "Users can view own profile and public data" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR  -- Users can view their own profile
  true                -- Allow public read for email validation (can be restricted later)
);

-- Alternative: More restrictive policy (choose one)
-- CREATE POLICY "Users can view own profile only" 
-- ON public.profiles 
-- FOR SELECT 
-- USING (auth.uid() = id);

-- Keep other policies
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);
```

### 2. Create Auto-Profile Creation Trigger (Updated)

```sql
-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created_custom ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'pelanggan'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created_custom
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 3. Fix Missing Profiles for Existing Users

```sql
-- Check for users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  p.id as profile_exists
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Create profiles for users who don't have them
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
  'pelanggan'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

### 4. Test Queries

```sql
-- Test profile access as authenticated user
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  avatar_url 
FROM public.profiles 
WHERE id = auth.uid();

-- Test RPC function
SELECT check_email_exists('test@example.com');

-- Verify policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'profiles';
```

## Expected Results

After running these queries:

1. ✅ AuthContext should be able to fetch user profiles
2. ✅ Email validation should work
3. ✅ New user registration should auto-create profiles
4. ✅ Login should work with proper role-based redirect

## Debug Output

In browser console, you should see:

```javascript
🔍 Fetching profile for user: [user-id]
✅ Profile fetched successfully: { id: "...", email: "...", role: "pelanggan", ... }
```

Instead of:
```javascript
❌ Error fetching profile: { message: "...", code: "..." }
```

## Troubleshooting

If still getting errors:

### Check RLS Status
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
-- Should return: rowsecurity = true
```

### Check User Session
```sql
-- In Supabase SQL Editor, this should return current user
SELECT auth.uid(), auth.jwt();
```

### Manual Profile Creation
```sql
-- If a specific user has no profile, create manually
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('user-uuid-here', 'user-email@example.com', 'User Name', 'pelanggan');
```