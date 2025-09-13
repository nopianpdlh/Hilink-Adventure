⚠️ **WARNING: The policies below STILL CAUSE RECURSION!**

The `admin_view_all_profiles` policy causes infinite recursion because it queries the same `profiles` table that it's trying to protect:

```sql
-- ❌ THIS CAUSES RECURSION - DO NOT USE:
CREATE POLICY "admin_view_all_profiles" ON profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles  -- ❌ Queries same table = RECURSION
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**SOLUTION**: Use `EMERGENCY_STOP_RLS_ERRORS.md` instead for immediate fix.