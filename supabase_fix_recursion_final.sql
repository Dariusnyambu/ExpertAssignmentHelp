-- ============================================================
--  FINAL / NUCLEAR FIX for:
--  "infinite recursion detected in policy for relation users"
--
--  This dynamically finds and removes EVERY existing policy
--  on `users` and `writers` (regardless of name), then
--  recreates a clean, minimal, NON-recursive set.
--
--  Safe to run multiple times.
-- ============================================================

-- 1. Drop every policy currently on public.users
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
  END LOOP;
END $$;

-- 2. Drop every policy currently on public.writers
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'writers'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.writers', pol.policyname);
  END LOOP;
END $$;

-- 3. admin_users table (non-recursive admin check)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'public' AND tablename = 'admin_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "admin_users_self_select" ON public.admin_users
  FOR SELECT USING (auth.uid() = id);

-- 4. is_admin() — checks admin_users only, never public.users
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- 5. Recreate CLEAN, non-recursive policies on users
CREATE POLICY "users_self_select" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_self_update" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_self_insert" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 6. Recreate CLEAN policies on writers
CREATE POLICY "writers_self_all" ON public.writers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "writers_admin_all" ON public.writers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 7. Make sure your admin account exists in admin_users
-- ============================================================
-- Get your admin's UID: Dashboard → Authentication → Users
--
-- INSERT INTO public.admin_users (id, full_name, email)
-- VALUES ('<paste-uid-here>', 'Administrator', 'admin@expertassignment.com')
-- ON CONFLICT (id) DO NOTHING;
--
-- INSERT INTO public.users (id, full_name, email, role)
-- VALUES ('<same-uid>', 'Administrator', 'admin@expertassignment.com', 'superadmin')
-- ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- ============================================================
-- 8. DIAGNOSTIC — run this to confirm only the 4 clean
--    policies above exist on `users` now:
-- ============================================================
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies WHERE schemaname='public' AND tablename='users';

SELECT 'All policies on users & writers rebuilt — recursion eliminated' AS status;
