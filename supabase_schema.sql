-- ============================================================
--  ExpertAssignmentHelp4U — Complete Supabase SQL Schema v2
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  country       TEXT,
  role          TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student','writer','admin','superadmin')),
  avatar_url    TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. SUBJECTS LOOKUP
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id        SERIAL PRIMARY KEY,
  name      TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO public.subjects (name) VALUES
  ('Accounting'),('Agriculture & Agribusiness'),('Architecture & Built Environment'),
  ('Biology & Life Sciences'),('Business & Management'),('Chemistry'),
  ('Communication & Media Studies'),('Computer Science & IT'),
  ('Criminology & Criminal Justice'),('Data Science & Business Analytics'),
  ('Economics'),('Education'),('Engineering'),('English Language & Literature'),
  ('Environmental Science'),('Finance & Banking'),('Geography & Development Studies'),
  ('Healthcare Management'),('Hospitality & Tourism'),('Human Resource Management'),
  ('Law'),('Marketing'),('Mathematics & Statistics'),('Medicine'),('Nursing'),
  ('Philosophy & Ethics'),('Political Science & IR'),('Psychology'),
  ('Public Health & Epidemiology'),('Sociology & Social Work')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. WRITERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.writers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name      TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  qualification  TEXT,
  subjects       TEXT[],
  rating         NUMERIC(3,2) DEFAULT 5.00 CHECK (rating BETWEEN 1 AND 5),
  orders_done    INT DEFAULT 0,
  on_time_rate   NUMERIC(5,2) DEFAULT 100.00,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. ASSIGNMENTS / ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id       TEXT UNIQUE NOT NULL DEFAULT '',
  user_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,
  writer_id         UUID REFERENCES public.writers(id) ON DELETE SET NULL,

  -- Assignment details
  subject           TEXT,
  academic_level    TEXT CHECK (academic_level IN (
                      'high_school','undergraduate_1_2','undergraduate_3_4',
                      'postgraduate','phd','professional','other')),
  assignment_type   TEXT,
  word_count        INT,
  referencing       TEXT,
  requirements      TEXT,
  file_urls         TEXT[],           -- uploaded brief/rubric files

  -- Scheduling
  deadline          TIMESTAMPTZ NOT NULL,
  delivered_at      TIMESTAMPTZ,

  -- Status & priority
  status            TEXT NOT NULL DEFAULT 'received'
                    CHECK (status IN (
                      'received','quote_sent','awaiting_payment','paid',
                      'project_started','writer_assigned','under_review',
                      'revision_stage','completed','delivered','cancelled')),
  priority          TEXT DEFAULT 'normal'
                    CHECK (priority IN ('normal','urgent','super_urgent')),

  -- Pricing
  quoted_price      NUMERIC(10,2),
  final_price       NUMERIC(10,2),
  currency          TEXT DEFAULT 'MYR',

  -- Delivery
  deliverable_urls  TEXT[],           -- completed files for download

  -- Metadata
  internal_notes    TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate tracking ID: EAH-XXXX
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TRIGGER AS $$
DECLARE
  new_id TEXT;
  exists BOOLEAN;
BEGIN
  IF NEW.tracking_id IS NULL OR NEW.tracking_id = '' THEN
    LOOP
      new_id := 'EAH-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
      SELECT COUNT(*) > 0 INTO exists FROM public.assignments WHERE tracking_id = new_id;
      EXIT WHEN NOT exists;
    END LOOP;
    NEW.tracking_id := new_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tracking_id
  BEFORE INSERT ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION generate_tracking_id();

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. ASSIGNMENT STATUS TIMELINE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assignment_updates (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id  UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  status         TEXT NOT NULL,
  notes          TEXT,
  is_visible_to_student BOOLEAN DEFAULT TRUE,
  updated_by     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id       UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES public.users(id) ON DELETE SET NULL,

  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT DEFAULT 'MYR',

  payment_method      TEXT CHECK (payment_method IN (
                        'card','mpesa','paypal','pesapal',
                        'bank_transfer','crypto','other')),
  payment_status      TEXT DEFAULT 'pending'
                      CHECK (payment_status IN (
                        'pending','processing','completed',
                        'failed','refunded','partial')),

  -- Gateway references
  transaction_id      TEXT,           -- generic ref
  paypal_order_id     TEXT,
  paypal_capture_id   TEXT,
  pesapal_order_id    TEXT,
  pesapal_tracking_id TEXT,
  mpesa_checkout_id   TEXT,
  mpesa_receipt       TEXT,           -- M-Pesa receipt number
  card_last4          TEXT,
  card_brand          TEXT,

  -- Invoice
  invoice_number      TEXT UNIQUE,
  invoice_url         TEXT,

  paid_at             TIMESTAMPTZ,
  refunded_at         TIMESTAMPTZ,
  refund_reason       TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-'
                          || LPAD(NEXTVAL('invoice_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1001;
CREATE TRIGGER set_invoice_number BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ============================================================
-- 7. REVIEWS / TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id   UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  student_name    TEXT NOT NULL,
  academic_level  TEXT,
  country         TEXT,
  service         TEXT,
  rating          SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT NOT NULL,
  is_published    BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  admin_response  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. SAMPLES / PORTFOLIO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.samples (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  category      TEXT,
  subject       TEXT,
  academic_level TEXT,
  description   TEXT,
  file_url      TEXT,
  preview_url   TEXT,
  tags          TEXT[],
  is_published  BOOLEAN DEFAULT TRUE,
  downloads     INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. FAQ
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faq (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    TEXT DEFAULT 'general',
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.faq (question, answer, category, sort_order) VALUES
  ('Is my order kept confidential?',
   'Yes. We use end-to-end encryption and never share your personal information or order details with any third party. Your identity remains completely anonymous throughout the entire process.',
   'privacy', 1),
  ('What if I am not satisfied with the work?',
   'We offer unlimited free revisions until you are fully satisfied. In rare cases where we fail to meet agreed specifications, we provide a full refund per our money-back guarantee.',
   'quality', 2),
  ('How do I track my assignment progress?',
   'After placing your order you receive a unique tracking ID. Use it on the Track Order page for real-time updates. You can also view progress in your client dashboard.',
   'orders', 3),
  ('What payment methods do you accept?',
   'We accept Credit/Debit Card (Visa, Mastercard), M-Pesa, PayPal, PesaPal, Bank Transfer, and Cryptocurrency (USDT/BTC).',
   'payments', 4),
  ('How quickly can you complete an urgent assignment?',
   'We handle urgent orders with deadlines as short as 3 hours for shorter assignments. Contact us via WhatsApp for the fastest response on urgent work.',
   'orders', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  excerpt       TEXT,
  content       TEXT,
  category      TEXT,
  author_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  cover_image   TEXT,
  tags          TEXT[],
  is_published  BOOLEAN DEFAULT FALSE,
  published_at  TIMESTAMPTZ,
  views         INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. CONTACT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  subject      TEXT,
  message      TEXT NOT NULL,
  source       TEXT DEFAULT 'contact_form',
  is_read      BOOLEAN DEFAULT FALSE,
  is_replied   BOOLEAN DEFAULT FALSE,
  replied_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  type          TEXT DEFAULT 'info'
                CHECK (type IN ('info','success','warning','error')),
  link          TEXT,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_assignments_user        ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_writer      ON public.assignments(writer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status      ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_tracking    ON public.assignments(tracking_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline    ON public.assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_payments_assignment     ON public.payments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status         ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_method         ON public.payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_updates_assignment      ON public.assignment_updates(assignment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published       ON public.reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_notifications_user      ON public.notifications(user_id, is_read);

-- Full-text search on assignments
CREATE INDEX IF NOT EXISTS idx_assignments_search ON public.assignments
  USING GIN (to_tsvector('english', COALESCE(subject,'') || ' ' || COALESCE(requirements,'')));

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;

-- Users: see & update own profile
CREATE POLICY "users_own_profile_select" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_own_profile_update" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Students: see only own assignments
CREATE POLICY "students_own_assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "students_insert_assignment" ON public.assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students: see own payments
CREATE POLICY "students_own_payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Students: see own timeline updates
CREATE POLICY "students_own_updates" ON public.assignment_updates
  FOR SELECT USING (
    is_visible_to_student = TRUE AND
    assignment_id IN (
      SELECT id FROM public.assignments WHERE user_id = auth.uid()
    )
  );

-- Published reviews are public
CREATE POLICY "reviews_public_select" ON public.reviews
  FOR SELECT USING (is_published = TRUE);
CREATE POLICY "students_submit_review" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Own notifications
CREATE POLICY "own_notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Subjects & FAQ are public read
CREATE POLICY "subjects_public" ON public.subjects FOR SELECT USING (TRUE);
CREATE POLICY "faq_public" ON public.faq FOR SELECT USING (is_active = TRUE);
CREATE POLICY "samples_public" ON public.samples FOR SELECT USING (is_published = TRUE);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samples  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ADMIN HELPER VIEWS
-- ============================================================

-- Orders with student + writer info joined
CREATE OR REPLACE VIEW public.v_orders_full AS
SELECT
  a.*,
  u.full_name   AS student_name,
  u.email       AS student_email,
  u.country     AS student_country,
  u.phone       AS student_phone,
  w.full_name   AS writer_name,
  w.email       AS writer_email,
  p.amount      AS paid_amount,
  p.payment_method,
  p.payment_status,
  p.transaction_id
FROM public.assignments a
LEFT JOIN public.users   u ON u.id = a.user_id
LEFT JOIN public.writers w ON w.id = a.writer_id
LEFT JOIN public.payments p ON p.assignment_id = a.id
   AND p.payment_status = 'completed';

-- Revenue summary by month
CREATE OR REPLACE VIEW public.v_revenue_monthly AS
SELECT
  DATE_TRUNC('month', paid_at) AS month,
  COUNT(*)                      AS transactions,
  SUM(amount)                   AS total_revenue,
  currency
FROM public.payments
WHERE payment_status = 'completed'
GROUP BY DATE_TRUNC('month', paid_at), currency
ORDER BY month DESC;

-- Orders count by status
CREATE OR REPLACE VIEW public.v_orders_by_status AS
SELECT status, COUNT(*) AS count
FROM public.assignments
GROUP BY status;

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- Enable in Supabase Dashboard → Database → Replication:
--   assignments, assignment_updates, payments, notifications
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS (run in Dashboard → Storage, or via API)
-- ============================================================
-- Bucket 1: assignment-files  (private) — student uploads
-- Bucket 2: deliverables      (private) — completed work
-- Bucket 3: samples           (public)  — portfolio files
-- Bucket 4: avatars           (public)  — profile pictures
-- Bucket 5: invoices          (private) — PDF invoices

-- ============================================================
-- SEED: Default Admin User
-- After running this schema, create admin in Auth dashboard,
-- then run:
-- ============================================================
-- INSERT INTO public.users (id, full_name, email, role)
-- VALUES ('<auth-uid-here>', 'Administrator', 'admin@expertassignment.com', 'superadmin');
