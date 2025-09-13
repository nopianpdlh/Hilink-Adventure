# Debug AuthContext Profile Error

## Quick Debug Script

Jalankan script berikut di Browser Console untuk debug masalah profile:

```javascript
// 1. Check current Supabase session
const checkSession = async () => {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  console.log('Current session:', { session, error })
  
  if (session) {
    console.log('User ID:', session.user.id)
    console.log('User email:', session.user.email)
  }
}

// 2. Test profile access
const testProfileAccess = async () => {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.log('No session found')
    return
  }
  
  console.log('Testing profile access for user:', session.user.id)
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
  
  console.log('Profile query result:', { data, error })
}

// 3. Test RLS policies
const testRLSPolicies = async () => {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  
  // Test general select without filter
  const { data: allProfiles, error: allError } = await supabase
    .from('profiles')
    .select('id, email')
    .limit(1)
  
  console.log('General profiles access:', { allProfiles, allError })
}

// Run all checks
const runDebug = async () => {
  console.log('🔍 Starting AuthContext Debug...')
  await checkSession()
  await testProfileAccess()
  await testRLSPolicies()
  console.log('✅ Debug complete')
}

runDebug()
```

## Manual Fix SQL Queries

Jika masalah persists, jalankan queries berikut di Supabase SQL Editor:

### 1. Check missing profiles
```sql
-- Find users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at as user_created,
  p.id as has_profile
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;
```

### 2. Create missing profiles
```sql
-- Create profiles for users who don't have them
INSERT INTO public.profiles (id, email, full_name, role, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 
           split_part(au.email, '@', 1)) as full_name,
  'pelanggan' as role,
  NOW() as created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

### 3. Fix RLS policies
```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile and public data" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow email validation check" ON public.profiles;

-- Create simple, working policy
CREATE POLICY "enable_read_for_authenticated_users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "enable_read_for_anon_users" 
ON public.profiles 
FOR SELECT 
TO anon
USING (true);

CREATE POLICY "enable_insert_for_authenticated_users" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "enable_update_for_users_based_on_id" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 4. Test queries
```sql
-- Test profile access
SELECT 
  id, 
  email, 
  full_name, 
  role 
FROM public.profiles 
WHERE id = auth.uid();

-- Check RLS is working
SELECT current_user, auth.uid();

-- List all policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

## Expected Results

After running fixes, you should see in console:

```javascript
🔍 Fetching profile for user: [uuid]
✅ Profile fetched successfully: {
  id: "[uuid]",
  email: "user@example.com",
  full_name: "User Name",
  role: "pelanggan",
  avatar_url: null
}
```

Instead of:
```javascript
❌ Error fetching profile: {}
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Empty error `{}` | RLS blocking access | Update RLS policies |
| `PGRST116` error | Profile doesn't exist | Create profile manually |
| Permission denied | RLS too restrictive | Simplify RLS policies |
| Network error | Supabase connection issue | Check API keys |
| Unknown error | Generic Supabase error | Enable more detailed logging |

## Auto-Fix Implementation

The updated AuthContext now includes:
- ✅ Better error handling for empty errors
- ✅ Auto-profile creation when missing
- ✅ Graceful fallbacks for all error cases
- ✅ Detailed logging for troubleshooting

If profile is missing, AuthContext will automatically try to create it using current user data.