-- ============================================================
--  ADMIN FIX: Run this in Supabase SQL Editor
--  Grants admin role full access to all tables via service views
--  Also enables the admin to read data submitted by students
-- ============================================================

-- 1. Create a helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Drop old admin policies if they exist and recreate cleanly

-- assignments
DROP POLICY IF EXISTS "admin_manage_assignments" ON public.assignments;
CREATE POLICY "admin_manage_assignments" ON public.assignments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- users
DROP POLICY IF EXISTS "admin_view_all_users" ON public.users;
CREATE POLICY "admin_view_all_users" ON public.users
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- writers
DROP POLICY IF EXISTS "admin_view_writers" ON public.writers;
DROP POLICY IF EXISTS "admin_manage_writers" ON public.writers;
CREATE POLICY "admin_manage_writers" ON public.writers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- payments
DROP POLICY IF EXISTS "admin_manage_payments" ON public.payments;
CREATE POLICY "admin_manage_payments" ON public.payments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- assignment_updates
DROP POLICY IF EXISTS "admin_manage_updates" ON public.assignment_updates;
CREATE POLICY "admin_manage_updates" ON public.assignment_updates
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- reviews
DROP POLICY IF EXISTS "admin_manage_reviews" ON public.reviews;
CREATE POLICY "admin_manage_reviews" ON public.reviews
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- faq
DROP POLICY IF EXISTS "admin_manage_faq" ON public.faq;
CREATE POLICY "admin_manage_faq" ON public.faq
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- samples
DROP POLICY IF EXISTS "admin_manage_samples" ON public.samples;
CREATE POLICY "admin_manage_samples" ON public.samples
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- contact_messages
DROP POLICY IF EXISTS "admin_view_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "admin_update_contact" ON public.contact_messages;
DROP POLICY IF EXISTS "admin_manage_contact" ON public.contact_messages;
CREATE POLICY "admin_manage_contact" ON public.contact_messages
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- blog_posts
DROP POLICY IF EXISTS "admin_manage_blog" ON public.blog_posts;
CREATE POLICY "admin_manage_blog" ON public.blog_posts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- notifications
DROP POLICY IF EXISTS "admin_manage_notifications" ON public.notifications;
CREATE POLICY "admin_manage_notifications" ON public.notifications
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 3. Make sure admin user exists in public.users
-- Run AFTER creating the auth user in Supabase Auth dashboard:
-- INSERT INTO public.users (id, full_name, email, role, is_active)
-- VALUES ('<paste-auth-uid-here>', 'Administrator', 'admin@expertassignment.com', 'superadmin', true)
-- ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- 4. Verify: Check if current user is admin (run while logged in as admin)
-- SELECT is_admin();

-- 5. Verify you can see assignments as admin:
-- SELECT COUNT(*) FROM public.assignments;

-- ============================================================
-- REALTIME: Enable these tables in Supabase Dashboard
-- Dashboard → Database → Replication → supabase_realtime
-- Add: assignments, assignment_updates, payments, notifications
-- ============================================================

SELECT 'Admin fix applied successfully' AS status;

-- ============================================================
-- GUEST QUOTE SUBMISSIONS FIX
-- The original policy "students_insert_assignment" requires
-- auth.uid() = user_id, which is impossible for anonymous
-- visitors (user_id is NULL, auth.uid() is NULL, NULL=NULL
-- evaluates to NULL/false in Postgres RLS).
-- This adds a policy allowing anyone (including anon/guest)
-- to submit a quote request with user_id = NULL.
-- ============================================================

DROP POLICY IF EXISTS "guests_can_submit_quote" ON public.assignments;
CREATE POLICY "guests_can_submit_quote" ON public.assignments
  FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Also allow guests (anon role) to read back their own just-inserted
-- row if needed for the confirmation screen / tracking ID display.
-- (Optional — uncomment if your tracking page needs this for guests)
-- DROP POLICY IF EXISTS "guests_can_view_by_tracking_id" ON public.assignments;
-- CREATE POLICY "guests_can_view_by_tracking_id" ON public.assignments
--   FOR SELECT USING (true);

-- ============================================================
-- VERIFY: After running, test from your app (logged out) by
-- submitting the Quote form. Then run this to confirm it landed:
-- ============================================================
-- SELECT tracking_id, subject, status, created_at
-- FROM public.assignments
-- ORDER BY created_at DESC
-- LIMIT 5;

SELECT 'Guest submission policy applied' AS status;
