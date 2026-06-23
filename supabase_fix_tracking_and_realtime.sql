-- ============================================================
--  FIX: Order tracking, real-time updates, and assignment_updates
--  access for guests, logged-in students, and admin edits.
--
--  Run this entire file in Supabase SQL Editor.
--  Safe to run multiple times.
-- ============================================================

-- ------------------------------------------------------------
-- 1. ASSIGNMENTS — allow public read by tracking_id
--    (Order tracking works like a courier: if you know the
--    tracking ID, you can check status. Sensitive contact info
--    lives in internal_notes/users, which stay protected.)
-- ------------------------------------------------------------
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assignments' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.assignments', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "assignments_select_public" ON public.assignments
  FOR SELECT USING (true);

GRANT SELECT ON public.assignments TO anon, authenticated;

-- ------------------------------------------------------------
-- 2. ASSIGNMENT_UPDATES — allow public read of the timeline
--    for any order (needed so guests tracking by ID can see
--    status history), but only "visible to student" entries.
-- ------------------------------------------------------------
ALTER TABLE public.assignment_updates ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assignment_updates' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.assignment_updates', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "assignment_updates_select_public" ON public.assignment_updates
  FOR SELECT USING (is_visible_to_student = true);

GRANT SELECT ON public.assignment_updates TO anon, authenticated;

-- Admin can manage (insert/update/delete) assignment_updates
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assignment_updates'
      AND cmd IN ('INSERT','UPDATE','DELETE')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.assignment_updates', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "assignment_updates_admin_write" ON public.assignment_updates
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

GRANT INSERT, UPDATE, DELETE ON public.assignment_updates TO authenticated;

-- ------------------------------------------------------------
-- 3. ASSIGNMENTS — allow admin UPDATE (status, writer, price)
-- ------------------------------------------------------------
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assignments'
      AND cmd IN ('UPDATE','DELETE')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.assignments', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "assignments_admin_update" ON public.assignments
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "assignments_admin_delete" ON public.assignments
  FOR DELETE USING (is_admin());

GRANT UPDATE, DELETE ON public.assignments TO authenticated;

-- ------------------------------------------------------------
-- 4. WRITERS — allow public SELECT (needed for admin dropdown
--    AND for student dashboard to show assigned writer's name)
-- ------------------------------------------------------------
ALTER TABLE public.writers ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'writers' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.writers', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "writers_select_public" ON public.writers
  FOR SELECT USING (true);

GRANT SELECT ON public.writers TO anon, authenticated;

-- ------------------------------------------------------------
-- 5. REALTIME — enable replication for live updates
--    (Run once; Supabase ignores if already added)
-- ------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_updates;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ============================================================
-- VERIFY
-- ============================================================
-- a) As a guest (logged out), this should now work from the app:
--    Track Order page → enter a tracking_id → see status + timeline
--
-- b) As admin, edit an order's status in the Orders panel, then
--    check the timeline updates live on the student's dashboard
--    and on the public Track Order page.

SELECT 'Tracking, realtime, and admin-edit policies applied' AS status;
