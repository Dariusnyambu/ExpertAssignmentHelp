# Setup Guide: Real Login, Order Tracking & Admin Edits

This update wires up **real Supabase authentication**, a **live client
dashboard**, **real-time order tracking**, and lets the **admin edit
orders** with changes appearing instantly for clients.

---

## ✅ Step 1 — Run the new SQL file

In Supabase Dashboard → **SQL Editor → New Query**, paste and run:

```
supabase_fix_tracking_and_realtime.sql
```

This file:
- Allows **anyone** (guest or logged in) to look up an order by tracking ID
- Allows the **timeline** (`assignment_updates`) to be read publicly when
  marked `is_visible_to_student = true`
- Lets **admins update/delete** assignments (status, writer, price)
- Makes the **writers table** readable (so dropdowns and dashboards
  can show writer names)
- Enables **Realtime replication** on `assignments` and
  `assignment_updates` — this is what makes tracking "live"

Run this **after** `supabase_fix_recursion_final.sql` and
`supabase_fix_guest_submit.sql` (from earlier steps) — order doesn't
matter much, but those should already be applied.

---

## ✅ Step 2 — Enable Email Auth (if not already)

In Supabase Dashboard → **Authentication → Providers**:
- Make sure **Email** provider is enabled
- Under **Authentication → Settings**:
  - For quick testing, you can **disable "Confirm email"** so accounts
    are usable immediately after signup (recommended for development)
  - For production, keep email confirmation ON and customize the
    email template under **Authentication → Email Templates**

---

## ✅ Step 3 — Create Your Admin Account

1. Go to **Authentication → Users → Add User**
   - Email: `admin@expertassignment.com` (or your real admin email)
   - Password: choose a strong password
   - Click **Create User**, then **copy the User UID**

2. Run in SQL Editor (replace `<UID>` and email):

```sql
INSERT INTO public.admin_users (id, full_name, email)
VALUES ('<UID>', 'Administrator', 'admin@expertassignment.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, full_name, email, role)
VALUES ('<UID>', 'Administrator', 'admin@expertassignment.com', 'superadmin')
ON CONFLICT (id) DO UPDATE SET role = 'superadmin';
```

3. Go to `yourdomain.com/admin`, log in with that email/password.

---

## ✅ Step 4 — Test the Full Flow

### A. Client registration & dashboard
1. Go to **Client Login** → **Create Account** tab
2. Register with a real email + password (6+ chars)
3. If email confirmation is OFF, you're logged in immediately and
   land on **My Orders** (`/student`)
4. If email confirmation is ON, check your inbox, confirm, then log in

### B. Submitting an order while logged in
1. While logged in, go to **Get Quote** and submit a request
2. The order is saved with `user_id` = your account
3. Go to **My Orders** — your new order appears instantly with a
   tracking ID (e.g. `EAH-3041`)

### C. Guest submission → claiming it later
1. Log out, submit a quote as a guest using the same email
2. Register/login with that same email afterward
3. On login, `claimGuestOrdersByEmail()` automatically links that
   guest order to your new account — it'll show up in **My Orders**

### D. Live order tracking
1. Copy a tracking ID (from My Orders, or the confirmation screen)
2. Go to **Track Order**, paste the ID, click **Track Now**
3. You'll see the current status + a step-by-step timeline

### E. Admin edits → client sees it live
1. Log into `/admin`
2. Go to **Orders**, click **Edit** on any order
3. Change the **status** (e.g. "Writer Assigned" → "Under Review"),
   optionally add a note, then **Save Changes**
4. With the **Track Order** page or **My Orders** dashboard open in
   another tab/browser, the status updates **automatically within
   a second or two** — no refresh needed (powered by Supabase
   Realtime)

---

## 🔍 Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| "Invalid login" on correct credentials | Email confirmation required but not done | Disable "Confirm email" in Auth settings, or check inbox |
| Admin login says "no admin access" | UID not in `admin_users` table | Re-run Step 3's SQL with the correct UID |
| Tracking page says "No order found" | Tracking ID typo, or `assignments_select_public` policy not applied | Re-run `supabase_fix_tracking_and_realtime.sql` |
| Status changes don't appear live | Realtime not enabled on tables | Re-run Step 1's SQL (the `ALTER PUBLICATION` part), or manually add `assignments` + `assignment_updates` under **Database → Replication** |
| Recursion error returns | A new policy on `users`/`writers` was added without using `is_admin()` | Re-run `supabase_fix_recursion_final.sql` |

---

## 📁 Files Changed in This Update

- `src/supabase.js` — added `onAuthStateChange`, `claimGuestOrdersByEmail`,
  fixed `trackAssignment` (timeline sort), `adminAssignWriter` (no forced
  status)
- `src/App.js` — session restore on load, auth state listener
- `src/pages/LoginPage.js` — real signup/login via Supabase Auth
- `src/pages/AdminLogin.js` — real admin auth + `admin_users` check
- `src/pages/StudentDashboard.js` — fetches real orders, live updates
- `src/pages/TrackingPage.js` — live tracking by ID with realtime timeline
- `src/components/Navbar.js` — shows logged-in user's name
- `supabase_fix_tracking_and_realtime.sql` — **NEW**, run this
