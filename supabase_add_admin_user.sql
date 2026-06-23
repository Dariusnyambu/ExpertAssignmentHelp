-- ============================================================
--  FIX: "This account does not have admin access"
--
--  STEP 1: Find your admin user's UID
--  Run this query first to get the UID of your admin email:
-- ============================================================

SELECT id, email, created_at
FROM auth.users
WHERE email = 'admin@expertassignment.com';

-- ============================================================
--  STEP 2: Copy the `id` value from above, paste it below
--  replacing <PASTE-UID-HERE>, then run ONLY these inserts.
--
--  Change the email below to match YOUR actual admin email.
-- ============================================================

-- INSERT INTO public.admin_users (id, full_name, email)
-- VALUES ('<PASTE-UID-HERE>', 'Administrator', 'admin@expertassignment.com')
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO public.users (id, full_name, email, role)
-- VALUES ('<PASTE-UID-HERE>', 'Administrator', 'admin@expertassignment.com', 'superadmin')
-- ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- ============================================================
--  SHORTCUT: If you don't want to copy/paste the UID,
--  run these two statements instead — they auto-look up
--  the UID from your email address:
-- ============================================================

INSERT INTO public.admin_users (id, full_name, email)
SELECT id, 'Administrator', email
FROM auth.users
WHERE email = 'admin@expertassignment.com'   -- ← change this to your actual admin email
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, full_name, email, role)
SELECT id, 'Administrator', email, 'superadmin'
FROM auth.users
WHERE email = 'admin@expertassignment.com'   -- ← same email here
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- ============================================================
--  VERIFY: After running the above, confirm the row exists:
-- ============================================================

SELECT
  au.id,
  au.email AS admin_email,
  u.role,
  u.full_name
FROM public.admin_users au
LEFT JOIN public.users u ON u.id = au.id;

