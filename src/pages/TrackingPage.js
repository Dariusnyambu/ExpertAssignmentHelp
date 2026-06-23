import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { trackAssignment, subscribeToAssignment, supabase } from '../supabase';

const statusMap = {
  received:         { label:'Order Received',    desc:'Your order was received and confirmed' },
  quote_sent:       { label:'Quote Sent',         desc:'Quote sent to your email address' },
  awaiting_payment: { label:'Awaiting Payment',   desc:'Waiting for payment confirmation' },
  paid:             { label:'Payment Confirmed',  desc:'Payment verified successfully' },
  project_started:  { label:'Project Started',    desc:'Work has commenced on your assignment' },
  writer_assigned:  { label:'Writer Assigned',    desc:'An expert writer is now working on your assignment' },
  under_review:     { label:'Under Review',       desc:'Our QA team is reviewing the completed work' },
  revision_stage:   { label:'Revision Stage',     desc:'Your assignment is being revised based on feedback' },
  completed:        { label:'Completed',          desc:'Your assignment has been completed' },
  delivered:        { label:'Delivered',          desc:'Final file delivered to your dashboard' },
  cancelled:        { label:'Cancelled',          desc:'This order has been cancelled' },
};

// The fixed sequence shown in the timeline (some may be skipped
// depending on the order's actual path, but this gives a sensible
// "where am I in the journey" view).
const TIMELINE_ORDER = [
  'received','quote_sent','awaiting_payment','paid',
  'project_started','writer_assigned','under_review',
  'revision_stage','completed','delivered',
];

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
}

export default function TrackingPage({ navigate }) {
  const [input, setInput]   = useState('');
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const channelRef = useRef(null);

  const fetchOrder = useCallback(async (trackingId) => {
    setLoading(true); setError(''); setOrder(null);
    try {
      const { data, error: err } = await trackAssignment(trackingId);
      if (err || !data) {
        setError(`No order found with tracking ID "${trackingId.toUpperCase()}". Please check and try again.`);
        return;
      }
      setOrder(data);

      // Subscribe to live updates for this specific order
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = subscribeToAssignment(data.id, () => {
        // Re-fetch on any change (status update, new timeline entry)
        trackAssignment(trackingId).then(({ data: fresh }) => {
          if (fresh) setOrder(fresh);
        });
      });
    } catch (e) {
      setError(`Something went wrong: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  const track = () => {
    const id = input.trim();
    if (id) fetchOrder(id);
  };

  // Build timeline: each known status step, marked done/current/pending
  let currentIndex = order ? TIMELINE_ORDER.indexOf(order.status) : -1;
  const timelineSteps = TIMELINE_ORDER
    .filter(s => s !== 'cancelled')
    .map((statusKey, idx) => {
      const info = statusMap[statusKey];
      const update = order?.assignment_updates?.find(u => u.status === statusKey);
      let state = 'pending';
      if (currentIndex >= 0) {
        if (idx < currentIndex) state = 'done';
        else if (idx === currentIndex) state = 'current';
      }
      return { ...info, statusKey, state, date: update ? formatDate(update.created_at) : '' };
    });

  return (
    <section className="tracking-page">
      {/* Breadcrumb / back link */}
      <div style={{padding:'12px 5% 0',display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--text-muted)'}}>
        <span style={{cursor:'pointer',color:'var(--blue)',fontWeight:600,display:'flex',alignItems:'center',gap:4}}
          onClick={() => navigate && navigate('home')}>
          ← Home
        </span>
        <span>/</span>
        <span style={{color:'var(--text-muted)'}}>Track Order</span>
      </div>

      <div className="section-label text-center" style={{marginTop:24}}>Live Updates</div>
      <h2 className="section-title text-center">Track Your Assignment</h2>
      <p className="section-sub text-center mx-auto" style={{ marginBottom: 0 }}>
        Enter your tracking ID to see real-time status updates
      </p>

      <div className="tracker-wrap">
        <div className="tracker-row">
          <input
            className="tracker-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter tracking ID (e.g. EAH-2847)"
            onKeyDown={e => e.key === 'Enter' && track()}
          />
          <button className="btn-primary" onClick={track} disabled={loading}>
            <Search size={16} /> {loading ? 'Searching…' : 'Track Now'}
          </button>
        </div>

        {error && (
          <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(220,38,38,0.07)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:10,padding:'14px 18px',color:'#DC2626',marginBottom:24,fontSize:14}}>
            <AlertCircle size={18}/> {error}
          </div>
        )}

        {order && (
          <div className="track-result">
            <div className="track-header">
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>ORDER ID</div>
                <div style={{ fontFamily: 'Sora,sans-serif', fontSize: 20, fontWeight: 800 }}>{order.tracking_id}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>SUBJECT</div>
                <div style={{ fontWeight: 600 }}>{order.subject || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>DEADLINE</div>
                <div style={{ fontWeight: 600, color: 'var(--orange)' }}>
                  {order.deadline ? new Date(order.deadline).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}
                </div>
              </div>
              <span className="badge green" style={{ fontSize: 13, padding: '6px 14px' }}>
                ● {statusMap[order.status]?.label || order.status}
              </span>
            </div>

            <div className="status-timeline">
              {timelineSteps.map((s, i) => (
                <div key={i} className={`t-step ${s.state}`}>
                  <div className="t-step-info">
                    <h5>{s.state === 'done' ? '✅ ' : s.state === 'current' ? '🟠 ' : ''}{s.label}</h5>
                    <p>{s.desc}</p>
                  </div>
                  <span className={`badge ${s.state === 'done' ? 'blue' : s.state === 'current' ? 'orange' : 'gray'}`}>
                    {s.state === 'done' ? (s.date || 'Completed') : s.state === 'current' ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>

            {/* Latest notes from admin, if any are marked visible */}
            {order.assignment_updates?.filter(u => u.notes).length > 0 && (
              <div style={{marginTop:24,background:'var(--gray)',borderRadius:12,padding:'16px 20px'}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:0.6,marginBottom:10}}>Latest Update from Our Team</div>
                {order.assignment_updates.filter(u=>u.notes).slice(-1).map((u,i)=>(
                  <p key={i} style={{fontSize:14,color:'var(--text)',lineHeight:1.6,margin:0}}>{u.notes}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
