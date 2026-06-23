-- ============================================================
--  FIX: "Submission blocked by database security rules"
--  when submitting the public Quote form (guest/anonymous)
--
--  Run this entire file in Supabase SQL Editor.
--  Safe to run multiple times, in any order relative to
--  the recursion-fix scripts.
-- ============================================================

-- 1. Make sure RLS is enabled on assignments (should be already)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing INSERT policies on assignments
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'assignments'
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.assignments', pol.policyname);
  END LOOP;
END $$;

-- 3. Recreate a single, simple INSERT policy
CREATE POLICY "assignments_insert_guest_or_own" ON public.assignments
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR auth.uid() = user_id
  );

-- 4. Grant base table privilege (RLS alone isn't enough — the
--    Postgres role itself needs INSERT/SELECT rights)
GRANT INSERT ON public.assignments TO anon, authenticated;
GRANT SELECT ON public.assignments TO anon, authenticated;

-- 5. Drop ALL existing SELECT policies on assignments and
--    recreate one that's safe whether or not is_admin() exists
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'assignments'
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.assignments', pol.policyname);
  END LOOP;
END $$;

-- If is_admin() exists, include it in the SELECT policy;
-- otherwise fall back to a version without it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_admin'
  ) THEN
    EXECUTE '
      CREATE POLICY "assignments_select_guest_or_own" ON public.assignments
        FOR SELECT
        USING (
          user_id IS NULL
          OR auth.uid() = user_id
          OR is_admin()
        )';
  ELSE
    EXECUTE '
      CREATE POLICY "assignments_select_guest_or_own" ON public.assignments
        FOR SELECT
        USING (
          user_id IS NULL
          OR auth.uid() = user_id
        )';
  END IF;
END $$;

-- ============================================================
-- 6. VERIFY
-- ============================================================
-- a) List all policies currently on assignments:
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies WHERE schemaname='public' AND tablename='assignments';
--
-- b) Confirm anon role has table privileges:
-- SELECT grantee, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_name = 'assignments' AND grantee IN ('anon','authenticated');
--
-- c) Test as anon (logged out) by submitting the Quote form on
--    your site, then check it landed:
-- SELECT tracking_id, subject, status, created_at
-- FROM public.assignments ORDER BY created_at DESC LIMIT 5;

SELECT 'Guest quote submission policy fixed' AS status;
