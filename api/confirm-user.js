// Vercel Serverless Function — /api/confirm-user
// Auto-confirms a new user's email after signup.
// Requires SUPABASE_SERVICE_ROLE_KEY in Vercel env vars.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    // Use the admin API — this sets email_confirmed_at correctly
    // without touching the generated confirmed_at column
    const { data, error } = await supabaseAdmin.auth.admin.updateUser(userId, {
      email_confirm: true,
    });
    if (error) throw error;
    return res.status(200).json({ success: true, email: data.user.email });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
