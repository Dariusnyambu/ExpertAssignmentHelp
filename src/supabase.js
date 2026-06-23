import { createClient } from '@supabase/supabase-js';

// Strip trailing /rest/v1/ if accidentally included in env var
const rawUrl = process.env.REACT_APP_SUPABASE_URL || 'https://auzahthbytvtimrqhynx.supabase.co';
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1emFodGhieXR2dGltcnFoeW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzA5OTEsImV4cCI6MjA5NjcwNjk5MX0.9Up5stbahddXP24N4fEAyJEZryXgiVd05RXLk_79pwA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const signUp = async (email, password, meta) => {
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: meta },
  });
  if (error) throw error;

  // Insert into public.users after signup
  if (data.user) {
    await supabase.from('users').upsert({
      id:        data.user.id,
      full_name: meta.full_name || meta.name || email.split('@')[0],
      email,
      role:      'student',
    });

    // Auto-confirm the user via the Vercel serverless function
    // so they don't need to click a verification email.
    // This only works if /api/confirm-user is deployed on Vercel
    // with SUPABASE_SERVICE_ROLE_KEY set in environment variables.
    try {
      await fetch('/api/confirm-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      });
    } catch (_) {
      // Non-fatal: if the API call fails the user can still
      // confirm manually via email or admin SQL.
    }
  }

  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = () => supabase.auth.signOut();
export const getUser = () => supabase.auth.getUser();

export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
  return data;
};

// Fires immediately with current session, then on every change
// (login, logout, token refresh). Returns the subscription so
// the caller can unsubscribe on unmount.
export const onAuthStateChange = (callback) =>
  supabase.auth.onAuthStateChange((event, session) => callback(event, session));

// Link any guest assignments (user_id IS NULL) that were
// submitted with this email to the now-logged-in account.
// Looks for the email inside internal_notes ("Email: ...")
// since guest submissions don't have a dedicated email column.
export const claimGuestOrdersByEmail = async (email, userId) => {
  if (!email || !userId) return { count: 0 };
  const { data, error } = await supabase
    .from('assignments')
    .select('id, internal_notes')
    .is('user_id', null);
  if (error || !data) return { count: 0 };

  const matches = data.filter(a =>
    (a.internal_notes || '').toLowerCase().includes(`email: ${email.toLowerCase()}`)
  );
  if (matches.length === 0) return { count: 0 };

  const ids = matches.map(a => a.id);
  const { error: updateError } = await supabase
    .from('assignments')
    .update({ user_id: userId })
    .in('id', ids);

  return { count: updateError ? 0 : ids.length, error: updateError };
};

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────────
export const submitAssignment = async (formData) => {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = {
    ...formData,
    user_id:     user?.id || null,
    tracking_id: '', // trigger generates it
    status:      'received',
  };
  const { data, error } = await supabase
    .from('assignments').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const getMyAssignments = (userId) =>
  supabase.from('assignments')
    .select('*, assignment_updates(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

export const trackAssignment = async (trackingId) => {
  const { data, error } = await supabase
    .from('assignments')
    .select('*, assignment_updates(*)')
    .eq('tracking_id', trackingId.trim().toUpperCase())
    .single();
  if (data?.assignment_updates) {
    data.assignment_updates.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
  return { data, error };
};

// ── ADMIN — ORDERS ────────────────────────────────────────────────────────────
export const adminGetAllOrders = (filters = {}) => {
  let q = supabase
    .from('assignments')
    .select(`
      id, tracking_id, subject, assignment_type, academic_level,
      word_count, deadline, status, priority, quoted_price,
      final_price, currency, internal_notes, created_at,
      users!assignments_user_id_fkey ( full_name, email, country, phone ),
      writers ( full_name, email )
    `)
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status);
  if (filters.search) {
    q = q.or(
      `tracking_id.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`
    );
  }
  return q;
};

export const adminUpdateOrderStatus = async (assignmentId, status, notes, adminUserId) => {
  // Update the assignment row
  const { error: e1 } = await supabase
    .from('assignments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', assignmentId);
  if (e1) throw e1;

  // Insert a timeline entry
  const { error: e2 } = await supabase
    .from('assignment_updates')
    .insert({
      assignment_id:        assignmentId,
      status,
      notes,
      updated_by:           adminUserId,
      is_visible_to_student: true,
    });
  if (e2) throw e2;
};

export const adminAssignWriter = async (assignmentId, writerId) => {
  const { error } = await supabase
    .from('assignments')
    .update({ writer_id: writerId, updated_at: new Date().toISOString() })
    .eq('id', assignmentId);
  if (error) throw error;
};

export const adminUpdatePrice = async (assignmentId, quotedPrice, finalPrice) => {
  const { error } = await supabase
    .from('assignments')
    .update({ quoted_price: quotedPrice, final_price: finalPrice, updated_at: new Date().toISOString() })
    .eq('id', assignmentId);
  if (error) throw error;
};

// ── ADMIN — STUDENTS ──────────────────────────────────────────────────────────
export const adminGetAllStudents = () =>
  supabase.from('users')
    .select('*, assignments(count)')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

// ── ADMIN — WRITERS ───────────────────────────────────────────────────────────
export const adminGetAllWriters = () =>
  supabase.from('writers').select('*').order('created_at', { ascending: false });

export const adminAddWriter = (data) =>
  supabase.from('writers').insert(data).select().single();

export const adminUpdateWriter = (id, data) =>
  supabase.from('writers').update(data).eq('id', id);

export const adminDeleteWriter = (id) =>
  supabase.from('writers').delete().eq('id', id);

// ── ADMIN — PAYMENTS ──────────────────────────────────────────────────────────
export const adminGetAllPayments = () =>
  supabase.from('payments')
    .select(`
      *,
      assignments ( tracking_id, subject ),
      users!payments_user_id_fkey ( full_name, email )
    `)
    .order('created_at', { ascending: false });

export const adminGetRevenueStats = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('amount, currency, paid_at, payment_method, payment_status')
    .eq('payment_status', 'completed');
  if (error) throw error;
  return data;
};

// ── ADMIN — REVIEWS ───────────────────────────────────────────────────────────
export const adminGetAllReviews = () =>
  supabase.from('reviews').select('*').order('created_at', { ascending: false });

export const adminToggleReview = (id, isPublished) =>
  supabase.from('reviews').update({ is_published: isPublished }).eq('id', id);

export const adminDeleteReview = (id) =>
  supabase.from('reviews').delete().eq('id', id);

// ── ADMIN — FAQ ───────────────────────────────────────────────────────────────
export const adminGetFAQs = () =>
  supabase.from('faq').select('*').order('sort_order');

export const adminAddFAQ = (data) =>
  supabase.from('faq').insert(data).select().single();

export const adminUpdateFAQ = (id, data) =>
  supabase.from('faq').update(data).eq('id', id);

export const adminDeleteFAQ = (id) =>
  supabase.from('faq').delete().eq('id', id);

// ── ADMIN — DASHBOARD STATS ───────────────────────────────────────────────────
export const adminGetDashboardStats = async () => {
  const [
    { count: total },
    { count: active },
    { count: newToday },
    { data: revenue },
    { count: pending },
    { count: delivered },
  ] = await Promise.all([
    supabase.from('assignments').select('*', { count: 'exact', head: true }),
    supabase.from('assignments').select('*', { count: 'exact', head: true })
      .in('status', ['project_started','writer_assigned','under_review','revision_stage']),
    supabase.from('assignments').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
    supabase.from('payments').select('amount').eq('payment_status', 'completed'),
    supabase.from('assignments').select('*', { count: 'exact', head: true })
      .eq('status', 'awaiting_payment'),
    supabase.from('assignments').select('*', { count: 'exact', head: true })
      .eq('status', 'delivered'),
  ]);

  const totalRevenue = revenue ? revenue.reduce((s, r) => s + (r.amount || 0), 0) : 0;

  return { total, active, newToday, totalRevenue, pending, delivered };
};

// ── ADMIN — CONTACT MESSAGES ──────────────────────────────────────────────────
export const adminGetContactMessages = () =>
  supabase.from('contact_messages').select('*').order('created_at', { ascending: false });

export const adminMarkMessageRead = (id) =>
  supabase.from('contact_messages').update({ is_read: true }).eq('id', id);

// ── PUBLIC ────────────────────────────────────────────────────────────────────
export const getPublishedReviews = () =>
  supabase.from('reviews').select('*').eq('is_published', true)
    .order('created_at', { ascending: false });

export const submitReview = (data) =>
  supabase.from('reviews').insert(data);

export const getFAQs = () =>
  supabase.from('faq').select('*').eq('is_active', true).order('sort_order');

export const submitContactMessage = (data) =>
  supabase.from('contact_messages').insert(data);

// ── REALTIME ──────────────────────────────────────────────────────────────────
export const subscribeToAssignment = (assignmentId, callback) => {
  const channelName = `order-${assignmentId}-${Math.random().toString(36).slice(2)}`;
  return supabase.channel(channelName)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'assignment_updates',
      filter: `assignment_id=eq.${assignmentId}`,
    }, callback)
    .subscribe();
};

export const subscribeToAdminOrders = (callback) => {
  // Use a unique channel name per subscription to avoid
  // "cannot add postgres_changes callbacks after subscribe()" errors
  // when multiple components subscribe simultaneously.
  const channelName = `admin-orders-${Math.random().toString(36).slice(2)}`;
  const channel = supabase.channel(channelName)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'assignments',
    }, callback)
    .subscribe();
  return channel;
};
