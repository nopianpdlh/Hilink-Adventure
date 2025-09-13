# Emergency Fix for AuthContext Error

## Immediate SQL Fix

Jalankan query berikut di Supabase SQL Editor untuk fix masalah secara langsung:

### 1. Disable RLS Temporarily (FOR TESTING ONLY)
```sql
-- Temporarily disable RLS to test if that's the issue
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### 2. Check Current Policies
```sql
-- List all current policies
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

### 3. Create Simple Working Policy
```sql
-- Drop all policies first
DROP POLICY IF EXISTS "Users can view own profile and public data" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow email validation check" ON public.profiles;
DROP POLICY IF EXISTS "enable_read_for_authenticated_users" ON public.profiles;
DROP POLICY IF EXISTS "enable_read_for_anon_users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON public.profiles;
DROP POLICY IF EXISTS "enable_update_for_users_based_on_id" ON public.profiles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple working policies
CREATE POLICY "allow_all_reads" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "allow_own_inserts" ON public.profiles  
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_own_updates" ON public.profiles
FOR UPDATE USING (auth.uid() = id);
```

### 4. Test Profile Access
```sql
-- Test if profiles table works without RLS
SELECT * FROM public.profiles LIMIT 3;

-- Test specific user profile
SELECT 
  id, 
  email, 
  full_name, 
  role 
FROM public.profiles 
WHERE email = 'your-test-email@example.com';
```

### 5. Create Missing Profiles
```sql
-- Create profiles for any users that don't have them
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1),
    'User'
  ) as full_name,
  'pelanggan' as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### 6. Verify Everything Works
```sql
-- Check that all users now have profiles
SELECT 
  au.id,
  au.email as auth_email,
  p.email as profile_email,
  p.full_name,
  p.role,
  CASE WHEN p.id IS NULL THEN '❌ Missing' ELSE '✅ Has Profile' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;
```

## Quick Browser Test

After running SQL, test in browser console:

```javascript
// Test direct profile access
const testProfileAccess = async () => {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('No logged in user')
    return
  }
  
  console.log('Testing for user:', user.id)
  
  // Test profile fetch
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  console.log('Direct profile test:', { data, error })
  
  // Test general access
  const { data: allData, error: allError } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(1)
  
  console.log('General access test:', { allData, allError })
}

testProfileAccess()
```

## Expected Fix Results

After running the SQL fixes:

1. ✅ **RLS Policies Fixed** - Simple policies that allow necessary access
2. ✅ **Missing Profiles Created** - All auth users now have profile records  
3. ✅ **Error Empty Object Gone** - Should now get real data or real errors
4. ✅ **AuthContext Working** - Profile fetching should succeed

## If Still Not Working

### Option A: Temporary Bypass
```sql
-- Completely bypass RLS for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### Option B: Check Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Logs > Postgrest Logs  
3. Look for recent error entries
4. Check what's actually being blocked

### Option C: Manual Profile Creation
```sql
-- Create specific profile manually (replace with your user ID)
INSERT INTO public.profiles (id, email, full_name, role) 
VALUES (
  'your-user-id-here', 
  'your-email@example.com', 
  'Your Name', 
  'pelanggan'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;
```

Run these fixes in order and the empty error object should be resolved! 🚀