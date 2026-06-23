-- ============================================================
--  EXPORT QUERIES — Run in Supabase SQL Editor
--  After running, click the Download/Export CSV button
--  that appears below the results table.
-- ============================================================

-- ============================================================
-- QUERY 1: All orders with full student contact details
-- Use this to email students about their orders
-- ============================================================
SELECT
  a.tracking_id,
  a.created_at::DATE                        AS date_submitted,
  a.status,
  a.priority,
  a.subject,
  a.assignment_type,
  a.academic_level,
  a.word_count,
  a.deadline::DATE                          AS deadline_date,
  a.deadline::TIME                          AS deadline_time,
  a.referencing,
  a.quoted_price,
  a.final_price,
  a.currency,
  a.requirements,

  -- Student contact info (from internal_notes for guest orders)
  u.full_name                               AS student_name,
  u.email                                   AS student_email,
  u.phone                                   AS student_phone,
  u.country                                 AS student_country,

  -- Extract contact from internal_notes (for guest/anonymous orders)
  CASE WHEN u.email IS NULL THEN
    SUBSTRING(a.internal_notes FROM 'Email: ([^\n]+)')
  END                                       AS guest_email,

  CASE WHEN u.full_name IS NULL THEN
    SUBSTRING(a.internal_notes FROM 'Name: ([^\n]+)')
  END                                       AS guest_name,

  CASE WHEN u.phone IS NULL THEN
    SUBSTRING(a.internal_notes FROM 'Phone: ([^\n]+)')
  END                                       AS guest_phone,

  -- Writer info
  w.full_name                               AS writer_name,
  w.email                                   AS writer_email,

  -- Payment info
  p.payment_method,
  p.payment_status,
  p.amount                                  AS amount_paid,
  p.transaction_id

FROM public.assignments a
LEFT JOIN public.users   u ON u.id = a.user_id
LEFT JOIN public.writers w ON w.id = a.writer_id
LEFT JOIN public.payments p ON p.assignment_id = a.id
  AND p.payment_status = 'completed'

ORDER BY a.created_at DESC;


-- ============================================================
-- QUERY 2: Only NEW / unquoted orders (for follow-up emails)
-- ============================================================
SELECT
  a.tracking_id,
  a.created_at::DATE                        AS submitted,
  a.subject,
  a.assignment_type,
  a.deadline::DATE                          AS deadline,
  a.word_count,

  COALESCE(u.full_name,
    SUBSTRING(a.internal_notes FROM 'Name: ([^\n]+)'))  AS name,
  COALESCE(u.email,
    SUBSTRING(a.internal_notes FROM 'Email: ([^\n]+)')) AS email,
  COALESCE(u.phone,
    SUBSTRING(a.internal_notes FROM 'Phone: ([^\n]+)')) AS phone,

  SUBSTRING(a.internal_notes FROM 'Preferred Payment: ([^\n]+)') AS preferred_payment

FROM public.assignments a
LEFT JOIN public.users u ON u.id = a.user_id
WHERE a.status IN ('received', 'quote_sent')
ORDER BY a.created_at DESC;


-- ============================================================
-- QUERY 3: Paid orders — for invoicing / receipt emails
-- ============================================================
SELECT
  a.tracking_id,
  p.invoice_number,
  p.paid_at::DATE                           AS payment_date,
  p.amount,
  p.currency,
  p.payment_method,
  p.transaction_id,

  COALESCE(u.full_name,
    SUBSTRING(a.internal_notes FROM 'Name: ([^\n]+)'))  AS student_name,
  COALESCE(u.email,
    SUBSTRING(a.internal_notes FROM 'Email: ([^\n]+)')) AS student_email,

  a.subject,
  a.assignment_type,
  a.deadline::DATE                          AS deadline

FROM public.payments p
JOIN public.assignments a ON a.id = p.assignment_id
LEFT JOIN public.users   u ON u.id = a.user_id
WHERE p.payment_status = 'completed'
ORDER BY p.paid_at DESC;


-- ============================================================
-- QUERY 4: All emails in one list (for newsletter / bulk email)
-- Combines registered users + guest order emails
-- ============================================================
SELECT DISTINCT
  COALESCE(u.full_name,
    SUBSTRING(a.internal_notes FROM 'Name: ([^\n]+)'))  AS name,
  COALESCE(u.email,
    SUBSTRING(a.internal_notes FROM 'Email: ([^\n]+)')) AS email,
  u.country,
  MAX(a.created_at)::DATE                              AS last_order_date,
  COUNT(a.id)                                          AS total_orders

FROM public.assignments a
LEFT JOIN public.users u ON u.id = a.user_id

WHERE COALESCE(u.email,
  SUBSTRING(a.internal_notes FROM 'Email: ([^\n]+)')) IS NOT NULL

GROUP BY u.full_name, u.email, u.country,
  SUBSTRING(a.internal_notes FROM 'Name: ([^\n]+)'),
  SUBSTRING(a.internal_notes FROM 'Email: ([^\n]+)')

ORDER BY last_order_date DESC;

