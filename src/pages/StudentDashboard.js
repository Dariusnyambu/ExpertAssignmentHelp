import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, Clock, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { getMyAssignments, subscribeToAdminOrders, supabase } from '../supabase';

const statusLabels = {
  received:         { label:'Received',         pill:'gray'   },
  quote_sent:       { label:'Quote Sent',        pill:'blue'   },
  awaiting_payment: { label:'Awaiting Payment',  pill:'yellow' },
  paid:             { label:'Paid',              pill:'green'  },
  project_started:  { label:'In Progress',       pill:'blue'   },
  writer_assigned:  { label:'Writer Assigned',   pill:'green'  },
  under_review:     { label:'Under Review',      pill:'yellow' },
  revision_stage:   { label:'Revision Stage',    pill:'yellow' },
  completed:        { label:'Completed',         pill:'green'  },
  delivered:        { label:'Delivered ✓',       pill:'gray'   },
  cancelled:        { label:'Cancelled',         pill:'gray'   },
};

const ACTIVE_STATUSES = ['paid','project_started','writer_assigned','under_review','revision_stage'];

function Loader() {
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:60}}>
    <div style={{width:32,height:32,border:'3px solid #e8edf2',borderTopColor:'#0F52BA',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}

export default function StudentDashboard({ navigate, user, onLogout }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const { data, error: err } = await getMyAssignments(user.id);
      if (err) throw err;
      setOrders(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    if (!user?.id) return;
    // Live-refresh whenever any assignment changes (covers admin edits)
    const ch = subscribeToAdminOrders(() => load());
    return () => supabase.removeChannel(ch);
  }, [load, user]);

  if (!user) {
    return (
      <div className="student-dash" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <p style={{color:'var(--text-muted)',marginBottom:16}}>Please log in to view your dashboard.</p>
          <button className="btn-primary" onClick={()=>navigate('login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  const total     = orders.length;
  const active    = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;
  const delivered = orders.filter(o => ['delivered','completed'].includes(o.status)).length;

  const firstName = (user.full_name || user.name || user.email || '').split(' ')[0].split('@')[0];

  return (
    <div className="student-dash">
      <div className="dash-head">
        <div>
          <h2>👋 Welcome back, {firstName || 'there'}!</h2>
          <p>Track your assignments and manage your academic journey</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{...btnGhost}} onClick={load}><RefreshCw size={15}/></button>
          <button className="btn-primary" onClick={() => navigate('quote')}>
            <Plus size={16} /> New Assignment
          </button>
        </div>
      </div>

      <div className="dash-cards-row">
        <div className="dash-card">
          <h5>Total Orders</h5>
          <div className="big">{total}</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>All-time submissions</p>
        </div>
        <div className="dash-card">
          <h5>Active Orders</h5>
          <div className="big" style={{ color: 'var(--orange)' }}>{active}</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>In progress now</p>
        </div>
        <div className="dash-card">
          <h5>Delivered</h5>
          <div className="big" style={{ color: '#16a34a' }}>{delivered}</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Successfully completed</p>
        </div>
      </div>

      <div className="my-orders">
        <div className="my-orders-head">
          <h3 style={{ fontFamily: 'Sora,sans-serif', fontSize: 15, fontWeight: 700 }}>My Assignments</h3>
          {active > 0 && <span className="pill green">{active} Active</span>}
        </div>

        {loading ? <Loader/> : error ? (
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'24px 20px',color:'#DC2626'}}>
            <AlertCircle size={18}/> {error}
          </div>
        ) : orders.length === 0 ? (
          <div style={{padding:48,textAlign:'center',color:'var(--text-muted)'}}>
            <FileText size={40} style={{marginBottom:12,opacity:0.3}}/>
            <p style={{fontWeight:600,fontSize:15,color:'var(--text)'}}>No assignments yet</p>
            <p style={{fontSize:13,marginBottom:20}}>Submit your first assignment to get started.</p>
            <button className="btn-primary" onClick={() => navigate('quote')}><Plus size={16}/> Get a Free Quote</button>
          </div>
        ) : (
          orders.map((o, i) => {
            const sl = statusLabels[o.status] || { label:o.status, pill:'gray' };
            const Icon = ACTIVE_STATUSES.includes(o.status) ? Clock : o.status === 'delivered' ? CheckCircle2 : FileText;
            return (
              <div key={i} className="a-row" onClick={() => navigate('tracking')}>
                <div className="a-icon"><Icon size={20} /></div>
                <div className="a-info">
                  <h5>{o.subject || 'Assignment'}</h5>
                  <p>{o.tracking_id} · {o.assignment_type || '—'} · {o.word_count ? `${o.word_count} words` : '—'}</p>
                </div>
                <span className={`pill ${sl.pill}`}>{sl.label}</span>
                <div className="a-right">
                  <div className="price">{o.currency || 'MYR'} {o.quoted_price || o.final_price || '—'}</div>
                  <div className="date">
                    {o.deadline ? `Due: ${new Date(o.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}` : '—'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const btnGhost = {
  display:'inline-flex', alignItems:'center', justifyContent:'center',
  width:42, padding:'0 12px', borderRadius:10, border:'1.5px solid var(--border)',
  background:'#fff', color:'var(--text-muted)', cursor:'pointer',
};
