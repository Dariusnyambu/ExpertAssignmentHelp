-- ============================================================
--  FIX: "infinite recursion detected in policy for relation users"
--  Run this in Supabase SQL Editor
-- ============================================================
--
-- CAUSE:
--   is_admin() queries public.users to check the caller's role.
--   But public.users ALSO has a policy that calls is_admin().
--   So: policy on users -> calls is_admin() -> queries users
--       -> triggers policy on users -> calls is_admin() -> ... loop.
--
-- FIX:
--   Add `SET row_security = off` to is_admin(). This makes the
--   SELECT inside the function bypass RLS entirely, so it no
--   longer re-triggers the users table policies.
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
$$ LANGUAGE sql SECURITY DEFINER SET row_security = off STABLE;

-- Make sure logged-in users (incl. anon) can execute this function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- ============================================================
-- VERIFY
-- ============================================================
-- 1) This should now run without recursion error:
-- SELECT is_admin();

-- 2) Test as admin (after logging in via the app):
-- SELECT COUNT(*) FROM public.users;
-- SELECT COUNT(*) FROM public.assignments;

SELECT 'is_admin() recursion fix applied' AS status;
