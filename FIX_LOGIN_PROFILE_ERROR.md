# Fix Profile Fetch Error on Login

## URGENT UPDATE: RLS Policy Recursion Fix

### New Error: Infinite Recursion in RLS Policies

If you see error: `infinite recursion detected in policy for relation "profiles"` (code: `42P17`):

**IMMEDIATE FIX - Run in Supabase SQL Editor:**

```sql
-- 1. Drop ALL policies to stop recursion
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.profiles';
    END LOOP;
END $$;

-- 2. Temporarily disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Test access works now
SELECT count(*) FROM public.profiles;
```

**If you need RLS back:**
```sql
-- Re-enable with simple policies only
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "simple_select" ON public.profiles 
FOR SELECT USING (true);

CREATE POLICY "simple_insert" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## Problem
Login berhasil tapi gagal fetch profile, sehingga user redirect ke dashboard default tanpa role-based routing yang tepat.

## Immediate Troubleshooting

### 1. Run in Browser Console (while logged in)

```javascript
// Test profile access and create if missing
const fixProfileIssue = async () => {
  console.log('🔧 Starting profile fix...')
  
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.log('❌ No user found:', userError)
    return
  }
  
  console.log('👤 Current user:', user.id, user.email)
  
  // Try to fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  console.log('📋 Profile fetch result:', { profile, error: profileError })
  
  if (profileError && profileError.code === 'PGRST116') {
    console.log('📝 Profile missing, creating...')
    
    // Create profile
    const newProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: 'pelanggan',
      avatar_url: null,
      phone: user.user_metadata?.phone || null
    }
    
    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Failed to create profile:', createError)
    } else {
      console.log('✅ Profile created:', created)
    }
  } else if (profile) {
    console.log('✅ Profile exists:', profile)
  }
}

fixProfileIssue()
```

### 2. SQL Fix in Supabase Dashboard

```sql
-- Check which users don't have profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  p.id as has_profile,
  p.role,
  au.raw_user_meta_data
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 20;

-- Create missing profiles with proper data
INSERT INTO public.profiles (id, email, full_name, phone, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1),
    'User'
  ) as full_name,
  au.raw_user_meta_data->>'phone' as phone,
  'pelanggan' as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Verify all users now have profiles
SELECT 
  count(*) as total_auth_users,
  count(p.id) as users_with_profiles,
  count(*) - count(p.id) as missing_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;
```

### 3. Check RLS Policies

```sql
-- Check current RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- If no policies exist or they're too restrictive, create basic ones
DROP POLICY IF EXISTS "allow_all_reads" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_inserts" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_updates" ON public.profiles;

CREATE POLICY "allow_all_reads" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "allow_own_inserts" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_own_updates" ON public.profiles
FOR UPDATE USING (auth.uid() = id);
```

## Enhanced Login Flow

The updated login page now:

1. ✅ **Auto-Create Profile**: If profile missing, automatically creates one
2. ✅ **Better Error Handling**: Specific handling for different error types
3. ✅ **Detailed Logging**: More informative error messages
4. ✅ **Graceful Fallback**: Always redirect somewhere, never leave user stuck

## Expected Behavior After Fix

### Success Case:
```javascript
🔐 Attempting login for: user@example.com
✅ Login successful for: user@example.com
👤 Fetching user profile for: [user-id]
✅ Profile fetched successfully: { role: "pelanggan", email: "user@example.com" }
👤 Customer login detected, redirecting to customer dashboard
```

### Auto-Create Case:
```javascript
🔐 Attempting login for: user@example.com
✅ Login successful for: user@example.com
👤 Fetching user profile for: [user-id]
⚠️ Could not fetch profile: { code: "PGRST116", message: "No rows found" }
📝 Profile not found - attempting to create profile for user
✅ Profile created successfully: { role: "pelanggan", email: "user@example.com" }
```

### Error but Handled Case:
```javascript
🔐 Attempting login for: user@example.com
✅ Login successful for: user@example.com
👤 Fetching user profile for: [user-id]
🚫 Permission denied fetching profile - check RLS policies
// User still gets redirected to dashboard with success message
```

## Testing Steps

1. **Run the SQL fixes** in Supabase dashboard
2. **Test login** with existing account
3. **Check browser console** for detailed logs
4. **If still issues**, run the browser console script
5. **Verify** that users get proper role-based redirects

## Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `PGRST116` | Profile doesn't exist | Auto-created by login page |
| `42501` | Permission denied | Check RLS policies |
| Empty error `{}` | RLS blocking access | Simplify RLS policies |
| Network error | Supabase connection | Check API keys/internet |

The updated login flow should now handle all these cases gracefully and provide a better user experience! 🚀