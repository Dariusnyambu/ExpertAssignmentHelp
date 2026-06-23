-- ============================================================
--  DEFINITIVE FIX: "infinite recursion detected in policy
--  for relation users"
--  Run this entire file in Supabase SQL Editor
-- ============================================================
--
-- WHY THE PREVIOUS FIX DIDN'T WORK:
--   `SET row_security = off` only bypasses RLS if the function
--   owner has the BYPASSRLS role attribute. That's not
--   guaranteed, so is_admin() was STILL triggering the
--   `users` table's own RLS policies when it queried
--   `public.users` — causing the same infinite loop.
--
-- THE REAL FIX:
--   Stop checking `public.users` for the admin role entirely.
--   Use a separate, tiny `admin_users` table whose only policy
--   is a simple non-recursive `auth.uid() = id` check. Since
--   that policy never calls is_admin(), there is NO cycle —
--   no matter how is_admin() is implemented.
-- ============================================================

-- 1. Create the admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Non-recursive policy: a user can see their own admin row (if any)
DROP POLICY IF EXISTS "admin_users_self_select" ON public.admin_users;
CREATE POLICY "admin_users_self_select" ON public.admin_users
  FOR SELECT USING (auth.uid() = id);

-- 2. Redefine is_admin() to check admin_users instead of public.users
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- 3. Make sure the `users` table policies don't reference
--    public.users recursively anymore (they now use is_admin(),
--    which is safe since it queries admin_users, not users).
DROP POLICY IF EXISTS "admin_view_all_users"   ON public.users;
DROP POLICY IF EXISTS "admin_manage_users"     ON public.users;
CREATE POLICY "admin_manage_users" ON public.users
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 4. ADD YOUR ADMIN ACCOUNT
-- ============================================================
-- Step A: Create the admin user in Supabase Dashboard
--         → Authentication → Users → Add User
--         (e.g. admin@expertassignment.com)
--
-- Step B: Copy that user's UID, then run:
--
-- INSERT INTO public.admin_users (id, full_name, email)
-- VALUES ('<paste-the-auth-uid-here>', 'Administrator', 'admin@expertassignment.com')
-- ON CONFLICT (id) DO NOTHING;
--
-- Step C: (optional) keep public.users in sync too, so the
-- app's profile screens show the right role:
--
-- INSERT INTO public.users (id, full_name, email, role)
-- VALUES ('<same-uid>', 'Administrator', 'admin@expertassignment.com', 'superadmin')
-- ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- ============================================================
-- 5. VERIFY (run these AFTER logging in as the admin in the app)
-- ============================================================
-- SELECT is_admin();                          -- should return true
-- SELECT COUNT(*) FROM public.assignments;    -- should work, no recursion
-- SELECT COUNT(*) FROM public.users;          -- should work, no recursion

SELECT 'admin_users table created + is_admin() fixed — no more recursion' AS status;
