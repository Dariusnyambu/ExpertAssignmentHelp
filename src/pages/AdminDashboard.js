import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, ClipboardList, Users, UserCog, Wallet, Star,
  CircleHelp, BarChartBig, Settings, LogOut, Bell, Search,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  XCircle, Edit2, Trash2, Plus, RefreshCw,
  ArrowUpRight, FileText, CreditCard,
  MessageSquare, Mail, Send, Shield, X,
} from 'lucide-react';
import {
  supabase,
  adminGetDashboardStats,
  adminGetAllOrders,
  adminGetAllStudents,
  adminGetAllWriters,
  adminGetAllPayments,
  adminGetAllReviews,
  adminGetFAQs,
  adminGetContactMessages,
  adminAddWriter,
  adminDeleteWriter,
  adminToggleReview,
  adminDeleteReview,
  adminAddFAQ,
  adminDeleteFAQ,
  adminUpdateOrderStatus,
  adminAssignWriter,
  adminUpdatePrice,
  subscribeToAdminOrders,
} from '../supabase';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const statusMap = {
  received:         { label:'Received',         color:'#6b7280', bg:'rgba(107,114,128,0.1)' },
  quote_sent:       { label:'Quote Sent',        color:'#0891B2', bg:'rgba(8,145,178,0.1)'  },
  awaiting_payment: { label:'Awaiting Payment',  color:'#b45309', bg:'rgba(234,179,8,0.1)'  },
  paid:             { label:'Paid',              color:'#16a34a', bg:'rgba(22,163,74,0.1)'  },
  project_started:  { label:'Started',           color:'#0F52BA', bg:'rgba(15,82,186,0.1)'  },
  writer_assigned:  { label:'Writer Assigned',   color:'#7C3AED', bg:'rgba(124,58,237,0.1)' },
  under_review:     { label:'Under Review',      color:'#EA580C', bg:'rgba(234,88,12,0.1)'  },
  revision_stage:   { label:'Revision',          color:'#FF7A00', bg:'rgba(255,122,0,0.1)'  },
  completed:        { label:'Completed',         color:'#16a34a', bg:'rgba(22,163,74,0.1)'  },
  delivered:        { label:'Delivered',         color:'#475569', bg:'rgba(71,85,105,0.1)'  },
  cancelled:        { label:'Cancelled',         color:'#DC2626', bg:'rgba(220,38,38,0.1)'  },
};

const payMethodIcon = { card:<CreditCard size={13}/>, paypal:<Wallet size={13}/> };

function StatusBadge({ status }) {
  const s = statusMap[status] || { label: status, color:'#6b7280', bg:'rgba(107,114,128,0.1)' };
  return <span style={{fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:20,background:s.bg,color:s.color,whiteSpace:'nowrap'}}>{s.label}</span>;
}

function Loader() {
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:60}}><div style={{width:32,height:32,border:'3px solid #e8edf2',borderTopColor:'#0F52BA',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
}

function ErrorMsg({ msg, retry }) {
  return <div style={{background:'rgba(220,38,38,0.07)',border:'1px solid rgba(220,38,38,0.2)',borderRadius:12,padding:'16px 20px',color:'#DC2626',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
    <span>⚠️ {msg}</span>
    {retry && <button onClick={retry} style={{background:'none',border:'1px solid rgba(220,38,38,0.3)',borderRadius:7,padding:'5px 12px',color:'#DC2626',cursor:'pointer',fontSize:13}}>Retry</button>}
  </div>;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  wrap:   { display:'flex', height:'100vh', background:'#f0f4f8', fontFamily:'Inter,sans-serif', overflow:'hidden' },
  sb:     { width:240, background:'#0A1931', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' },
  sbTop:  { padding:'18px 20px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  sbNav:  { flex:1, padding:'8px 0', overflowY:'auto' },
  sbSec:  { fontSize:10,fontWeight:700,letterSpacing:1.4,color:'rgba(255,255,255,0.3)',padding:'14px 20px 5px',textTransform:'uppercase' },
  sbItem: { display:'flex',alignItems:'center',gap:10,padding:'10px 20px',color:'rgba(255,255,255,0.6)',fontSize:13.5,fontWeight:500,cursor:'pointer',border:'none',background:'none',width:'100%',textAlign:'left',transition:'all 0.15s',fontFamily:'Inter,sans-serif' },
  sbAct:  { color:'#fff', background:'rgba(255,255,255,0.09)', borderRight:'3px solid #FF7A00' },
  sbFoot: { padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.07)' },
  main:   { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar: { background:'#fff', borderBottom:'1px solid #e8edf2', padding:'0 28px', height:62, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  content:{ flex:1, overflowY:'auto', padding:28 },
  card:   { background:'#fff', borderRadius:14, border:'1px solid #e8edf2', overflow:'hidden' },
  cardH:  { padding:'16px 20px', borderBottom:'1px solid #e8edf2', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' },
  cardT:  { fontFamily:'Sora,sans-serif', fontSize:15, fontWeight:700, color:'#0A1931' },
  th:     { padding:'11px 16px', background:'#f7f9fc', fontSize:11, fontWeight:700, color:'#6B7A99', textTransform:'uppercase', letterSpacing:0.6, textAlign:'left', borderBottom:'1px solid #e8edf2', whiteSpace:'nowrap' },
  td:     { padding:'13px 16px', fontSize:13.5, borderBottom:'1px solid #f0f4f8', color:'#0A1931', verticalAlign:'middle' },
  btn:    { display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, border:'none', fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' },
  inp:    { padding:'9px 12px', borderRadius:8, border:'1.5px solid #e8edf2', fontSize:13, fontFamily:'Inter,sans-serif', color:'#0A1931', outline:'none', background:'#f7f9fc', width:'100%', boxSizing:'border-box' },
  sel:    { padding:'9px 12px', borderRadius:8, border:'1.5px solid #e8edf2', fontSize:13, fontFamily:'Inter,sans-serif', color:'#0A1931', outline:'none', background:'#f7f9fc' },
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(10,25,49,0.55)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:wide?680:520,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'18px 24px',borderBottom:'1px solid #e8edf2',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:'#fff',zIndex:1}}>
          <h3 style={{fontFamily:'Sora,sans-serif',fontSize:16,fontWeight:700,margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#6B7A99',display:'flex'}}><X size={20}/></button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────
function DashboardHome({ adminUser }) {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const [statsData, { data: orders }] = await Promise.all([
        adminGetDashboardStats(),
        adminGetAllOrders({ limit: 8 }),
      ]);
      setStats(statsData);
      setRecentOrders(orders || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const ch = subscribeToAdminOrders(() => load());
    return () => supabase.removeChannel(ch);
  }, [load]);

  if (loading) return <Loader/>;
  if (err)     return <ErrorMsg msg={err} retry={load}/>;

  const widgets = [
    { label:'Total Orders',    val: stats?.total ?? 0,       color:'#0F52BA', Icon:ClipboardList, change:'+12%' },
    { label:'Active Orders',   val: stats?.active ?? 0,      color:'#FF7A00', Icon:Clock,         change:'' },
    { label:'Revenue (MYR)',   val: `${(stats?.totalRevenue||0).toLocaleString('en-MY',{minimumFractionDigits:2})}`, color:'#16a34a', Icon:TrendingUp, change:'' },
    { label:'New Today',       val: stats?.newToday ?? 0,    color:'#7C3AED', Icon:ArrowUpRight,   change:'' },
    { label:'Awaiting Payment',val: stats?.pending ?? 0,     color:'#b45309', Icon:AlertCircle,    change:'' },
    { label:'Delivered',       val: stats?.delivered ?? 0,   color:'#0891B2', Icon:CheckCircle2,   change:'' },
  ];

  return (
    <div>
      {/* KPI row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:24}}>
        {widgets.map((w,i) => (
          <div key={i} style={{...S.card,padding:'18px 20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:`${w.color}12`,display:'flex',alignItems:'center',justifyContent:'center',color:w.color}}><w.Icon size={20}/></div>
              {w.change && <span style={{fontSize:11,fontWeight:700,color:'#16a34a',display:'flex',alignItems:'center',gap:3}}><TrendingUp size={11}/>{w.change}</span>}
            </div>
            <div style={{fontFamily:'Sora,sans-serif',fontSize:24,fontWeight:800,color:'#0A1931',marginBottom:3}}>{w.val}</div>
            <div style={{fontSize:12,color:'#6B7A99'}}>{w.label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={S.card}>
        <div style={S.cardH}>
          <span style={S.cardT}>Live Orders</span>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'#16a34a',display:'inline-block',animation:'pulse 2s infinite'}}/>
            <span style={{fontSize:12,color:'#16a34a',fontWeight:600}}>Realtime</span>
          </div>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{padding:40,textAlign:'center',color:'#6B7A99'}}>
            <FileText size={36} style={{marginBottom:12,opacity:0.3}}/>
            <p style={{fontWeight:600}}>No orders yet</p>
            <p style={{fontSize:13}}>Orders submitted through the quote form will appear here.</p>
          </div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Order ID','Student','Subject','Deadline','Status','Amount'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {recentOrders.map((o,i) => (
                  <tr key={i} style={{cursor:'default'}} onMouseEnter={e=>e.currentTarget.style.background='#f7f9fc'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                    <td style={{...S.td,fontWeight:700,color:'#0F52BA'}}>{o.tracking_id}</td>
                    <td style={S.td}>
                      <div style={{fontWeight:600}}>{o.users?.full_name || '—'}</div>
                      <div style={{fontSize:11,color:'#6B7A99'}}>{o.users?.country || ''}</div>
                    </td>
                    <td style={S.td}>
                      <div style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.subject || '—'}</div>
                      <div style={{fontSize:11,color:'#6B7A99'}}>{o.assignment_type || ''}</div>
                    </td>
                    <td style={{...S.td,color:'#FF7A00',fontWeight:600}}>{o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}</td>
                    <td style={S.td}><StatusBadge status={o.status}/></td>
                    <td style={{...S.td,fontWeight:700}}>{o.currency} {o.quoted_price || o.final_price || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ─── ORDERS PANEL ─────────────────────────────────────────────────────────────
function OrdersPanel({ adminUser }) {
  const [orders, setOrders]   = useState([]);
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [search, setSearch]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes]   = useState('');
  const [editWriterId, setEditWriterId] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const [{ data: ord }, { data: wrt }] = await Promise.all([
        adminGetAllOrders({ status: filterStatus, search }),
        adminGetAllWriters(),
      ]);
      setOrders(ord || []);
      setWriters(wrt || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [filterStatus, search]);

  useEffect(() => { load(); }, [load]);

  const openModal = (o) => {
    setModal(o);
    setEditStatus(o.status);
    setEditNotes('');
    setEditWriterId(o.writer_id || '');
    setEditPrice(o.quoted_price || '');
  };

  const saveChanges = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const statusChanged = editStatus !== modal.status;
      const hasNotes = editNotes.trim().length > 0;

      // Only write to the timeline (and re-set status) if the
      // status actually changed, or the admin added a note —
      // otherwise every minor edit (price/writer) would create
      // duplicate "status unchanged" timeline entries.
      if (statusChanged || hasNotes) {
        await adminUpdateOrderStatus(modal.id, editStatus, editNotes, adminUser?.id);
      }
      if (editWriterId && editWriterId !== modal.writer_id) {
        await adminAssignWriter(modal.id, editWriterId);
      }
      if (editPrice && parseFloat(editPrice) !== modal.quoted_price) {
        await adminUpdatePrice(modal.id, parseFloat(editPrice), parseFloat(editPrice));
      }
      setModal(null);
      await load();
    } catch(e) { alert('Error saving: ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {modal && (
        <Modal title={`Edit Order ${modal.tracking_id}`} onClose={() => setModal(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {/* Order info */}
            <div style={{gridColumn:'span 2',background:'#f7f9fc',borderRadius:10,padding:'14px 16px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  ['Student',    modal.users?.full_name || '—'],
                  ['Email',      modal.users?.email || '—'],
                  ['Subject',    modal.subject || '—'],
                  ['Type',       modal.assignment_type || '—'],
                  ['Level',      modal.academic_level || '—'],
                  ['Words',      modal.word_count || '—'],
                  ['Deadline',   modal.deadline ? new Date(modal.deadline).toLocaleString() : '—'],
                  ['Priority',   modal.priority || '—'],
                ].map(([l,v]) => (
                  <div key={l}>
                    <div style={{fontSize:11,color:'#6B7A99',fontWeight:600,marginBottom:2}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'#0A1931'}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{fontSize:13,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:6}}>Update Status</label>
              <select style={S.sel} value={editStatus} onChange={e=>setEditStatus(e.target.value)}>
                {Object.entries(statusMap).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{fontSize:13,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:6}}>Assign Writer</label>
              <select style={S.sel} value={editWriterId} onChange={e=>setEditWriterId(e.target.value)}>
                <option value="">— Select Writer —</option>
                {writers.map(w => <option key={w.id} value={w.id}>{w.full_name} ({w.qualification || 'Writer'})</option>)}
              </select>
            </div>

            <div>
              <label style={{fontSize:13,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:6}}>Quoted Price (MYR)</label>
              <input style={S.inp} type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)} placeholder="e.g. 350"/>
            </div>

            <div>
              <label style={{fontSize:13,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:6}}>Internal Note</label>
              <input style={S.inp} value={editNotes} onChange={e=>setEditNotes(e.target.value)} placeholder="Add a team note..."/>
            </div>

            <div style={{gridColumn:'span 2',display:'flex',gap:10,marginTop:4}}>
              <button style={{...S.btn,background:'#0F52BA',color:'#fff',flex:1,justifyContent:'center',opacity:saving?0.7:1}} onClick={saveChanges} disabled={saving}>
                {saving ? 'Saving…' : <><Send size={14}/> Save Changes</>}
              </button>
              <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      <div style={S.card}>
        <div style={S.cardH}>
          <span style={S.cardT}>Orders <span style={{fontSize:12,color:'#6B7A99',fontWeight:400}}>({orders.length})</span></span>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <div style={{position:'relative'}}>
              <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#6B7A99'}}/>
              <input style={{...S.inp,paddingLeft:30,width:180}} placeholder="Search ID or subject…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select style={S.sel} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              {Object.entries(statusMap).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={load}><RefreshCw size={13}/></button>
          </div>
        </div>

        {loading ? <Loader/> : err ? <ErrorMsg msg={err} retry={load}/> : orders.length === 0 ? (
          <div style={{padding:48,textAlign:'center',color:'#6B7A99'}}>
            <ClipboardList size={40} style={{marginBottom:12,opacity:0.3}}/>
            <p style={{fontWeight:600,fontSize:15}}>No orders found</p>
            <p style={{fontSize:13}}>Try adjusting your search or status filter.</p>
          </div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Order ID','Student','Subject','Deadline','Priority','Writer','Status','Amount','Actions'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {orders.map((o,i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#f7f9fc'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                    <td style={{...S.td,fontWeight:700,color:'#0F52BA'}}>{o.tracking_id}</td>
                    <td style={S.td}>
                      <div style={{fontWeight:600}}>{o.users?.full_name || '—'}</div>
                      <div style={{fontSize:11,color:'#6B7A99'}}>{o.users?.country || ''}</div>
                    </td>
                    <td style={S.td}>
                      <div style={{maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:500}}>{o.subject || '—'}</div>
                      <div style={{fontSize:11,color:'#6B7A99'}}>{o.assignment_type || ''}</div>
                    </td>
                    <td style={{...S.td,color:'#FF7A00',fontWeight:600,whiteSpace:'nowrap'}}>{o.deadline ? new Date(o.deadline).toLocaleDateString() : '—'}</td>
                    <td style={S.td}><span style={{fontSize:11,fontWeight:700,padding:'3px 8px',borderRadius:10,background:o.priority==='urgent'?'rgba(220,38,38,0.1)':'rgba(107,114,128,0.08)',color:o.priority==='urgent'?'#DC2626':'#6b7280'}}>{o.priority||'normal'}</span></td>
                    <td style={S.td}>{o.writers?.full_name || <span style={{color:'#b45309',fontSize:12}}>Unassigned</span>}</td>
                    <td style={S.td}><StatusBadge status={o.status}/></td>
                    <td style={{...S.td,fontWeight:700,whiteSpace:'nowrap'}}>{o.currency||'MYR'} {o.quoted_price || o.final_price || '—'}</td>
                    <td style={S.td}>
                      <button style={{...S.btn,padding:'5px 10px',background:'#f0f4f8',color:'#0F52BA'}} onClick={() => openModal(o)}><Edit2 size={13}/> Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STUDENTS PANEL ───────────────────────────────────────────────────────────
function StudentsPanel() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [search, setSearch]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const { data, error } = await adminGetAllStudents();
      if (error) throw error;
      setStudents(data || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter(s =>
    !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email?.includes(search)
  );

  return (
    <div style={S.card}>
      <div style={S.cardH}>
        <span style={S.cardT}>Students <span style={{fontSize:12,color:'#6B7A99',fontWeight:400}}>({filtered.length})</span></span>
        <div style={{display:'flex',gap:8}}>
          <div style={{position:'relative'}}>
            <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#6B7A99'}}/>
            <input style={{...S.inp,paddingLeft:30,width:200}} placeholder="Search students…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={load}><RefreshCw size={13}/></button>
        </div>
      </div>
      {loading ? <Loader/> : err ? <ErrorMsg msg={err} retry={load}/> : filtered.length === 0 ? (
        <div style={{padding:48,textAlign:'center',color:'#6B7A99'}}><Users size={40} style={{marginBottom:12,opacity:0.3}}/><p style={{fontWeight:600}}>No students found</p></div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Name','Email','Phone','Country','Role','Joined','Status','Actions'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((s,i) => (
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#f7f9fc'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  <td style={S.td}><span style={{fontWeight:700}}>{s.full_name}</span></td>
                  <td style={S.td}>{s.email}</td>
                  <td style={S.td}>{s.phone || '—'}</td>
                  <td style={S.td}>{s.country || '—'}</td>
                  <td style={S.td}><span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:10,background:'rgba(15,82,186,0.08)',color:'#0F52BA'}}>{s.role}</span></td>
                  <td style={S.td}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                  <td style={S.td}><span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:10,background:s.is_active?'rgba(22,163,74,0.1)':'rgba(107,114,128,0.1)',color:s.is_active?'#16a34a':'#6b7280'}}>{s.is_active?'Active':'Inactive'}</span></td>
                  <td style={S.td}><button style={{...S.btn,padding:'5px 9px',background:'#f0f4f8',color:'#0F52BA'}}><Mail size={13}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── WRITERS PANEL ────────────────────────────────────────────────────────────
function WritersPanel() {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ full_name:'', email:'', qualification:'', subjects:'' });
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const { data, error } = await adminGetAllWriters();
      if (error) throw error;
      setWriters(data || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addWriter = async () => {
    if (!form.full_name || !form.email) { alert('Name and email are required.'); return; }
    setSaving(true);
    try {
      const { error } = await adminAddWriter({
        ...form,
        subjects: form.subjects ? form.subjects.split(',').map(s=>s.trim()) : [],
      });
      if (error) throw error;
      setModal(false);
      setForm({ full_name:'', email:'', qualification:'', subjects:'' });
      await load();
    } catch(e) { alert('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const removeWriter = async (id) => {
    if (!window.confirm('Remove this writer?')) return;
    await adminDeleteWriter(id);
    await load();
  };

  return (
    <div>
      {modal && (
        <Modal title="Add New Writer" onClose={() => setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {[['Full Name','full_name','text','e.g. Dr. Sarah M.'],['Email','email','email','writer@email.com'],['Qualification','qualification','text','e.g. PhD Business Admin'],['Subjects (comma separated)','subjects','text','Business, Management, HRM']].map(([l,k,t,p]) => (
              <div key={k}>
                <label style={{fontSize:13,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:5}}>{l}</label>
                <input type={t} placeholder={p} style={S.inp} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
              </div>
            ))}
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button style={{...S.btn,background:'#0F52BA',color:'#fff',flex:1,justifyContent:'center',opacity:saving?0.7:1}} onClick={addWriter} disabled={saving}>
                {saving?'Adding…':<><Plus size={14}/> Add Writer</>}
              </button>
              <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      <div style={S.card}>
        <div style={S.cardH}>
          <span style={S.cardT}>Writers <span style={{fontSize:12,color:'#6B7A99',fontWeight:400}}>({writers.length})</span></span>
          <div style={{display:'flex',gap:8}}>
            <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={load}><RefreshCw size={13}/></button>
            <button style={{...S.btn,background:'#0F52BA',color:'#fff'}} onClick={() => setModal(true)}><Plus size={14}/> Add Writer</button>
          </div>
        </div>
        {loading ? <Loader/> : err ? <ErrorMsg msg={err} retry={load}/> : writers.length === 0 ? (
          <div style={{padding:48,textAlign:'center',color:'#6B7A99'}}><UserCog size={40} style={{marginBottom:12,opacity:0.3}}/><p style={{fontWeight:600}}>No writers yet</p><button style={{...S.btn,background:'#0F52BA',color:'#fff',marginTop:12}} onClick={()=>setModal(true)}><Plus size={14}/> Add First Writer</button></div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Name','Email','Qualification','Subjects','Rating','Orders','Status','Actions'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {writers.map((w,i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#f7f9fc'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                    <td style={S.td}><span style={{fontWeight:700}}>{w.full_name}</span></td>
                    <td style={S.td}>{w.email}</td>
                    <td style={S.td}>{w.qualification || '—'}</td>
                    <td style={S.td}><div style={{display:'flex',flexWrap:'wrap',gap:4}}>{(w.subjects||[]).slice(0,3).map(s=><span key={s} style={{fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:5,background:'rgba(15,82,186,0.08)',color:'#0F52BA'}}>{s}</span>)}</div></td>
                    <td style={S.td}><span style={{color:'#FFB300'}}>★</span> {w.rating||'5.0'}</td>
                    <td style={{...S.td,fontWeight:700}}>{w.orders_done||0}</td>
                    <td style={S.td}><span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:10,background:w.is_active?'rgba(22,163,74,0.1)':'rgba(107,114,128,0.1)',color:w.is_active?'#16a34a':'#6b7280'}}>{w.is_active?'Active':'Inactive'}</span></td>
                    <td style={S.td}><button style={{...S.btn,padding:'5px 8px',background:'rgba(220,38,38,0.06)',color:'#DC2626'}} onClick={()=>removeWriter(w.id)}><Trash2 size={13}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAYMENTS PANEL ───────────────────────────────────────────────────────────
function PaymentsPanel() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const { data, error } = await adminGetAllPayments();
      if (error) throw error;
      setPayments(data || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const total    = payments.filter(p=>p.payment_status==='completed').reduce((s,p)=>s+parseFloat(p.amount||0),0);
  const pending  = payments.filter(p=>p.payment_status==='pending').reduce((s,p)=>s+parseFloat(p.amount||0),0);
  const refunded = payments.filter(p=>p.payment_status==='refunded').reduce((s,p)=>s+parseFloat(p.amount||0),0);

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:20}}>
        {[['Total Revenue',`MYR ${total.toFixed(2)}`,'#16a34a',TrendingUp],['Pending',`MYR ${pending.toFixed(2)}`,'#b45309',AlertCircle],['Refunded',`MYR ${refunded.toFixed(2)}`,'#DC2626',XCircle],['Transactions',payments.length,'#0F52BA',BarChartBig]].map(([l,v,c,Icon]) => (
          <div key={l} style={{...S.card,padding:'18px 20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><span style={{fontSize:12,color:'#6B7A99',fontWeight:600}}>{l}</span><Icon size={16} color={c}/></div>
            <div style={{fontFamily:'Sora,sans-serif',fontSize:20,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.cardH}>
          <span style={S.cardT}>All Transactions</span>
          <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={load}><RefreshCw size={13}/> Refresh</button>
        </div>
        {loading ? <Loader/> : err ? <ErrorMsg msg={err} retry={load}/> : payments.length === 0 ? (
          <div style={{padding:48,textAlign:'center',color:'#6B7A99'}}><Wallet size={40} style={{marginBottom:12,opacity:0.3}}/><p style={{fontWeight:600}}>No payments yet</p></div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Invoice','Order','Student','Amount','Method','Status','Date','Transaction Ref'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {payments.map((p,i) => (
                  <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#f7f9fc'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                    <td style={{...S.td,fontSize:12,color:'#6B7A99',fontFamily:'monospace'}}>{p.invoice_number||'—'}</td>
                    <td style={{...S.td,fontWeight:700,color:'#0F52BA'}}>{p.assignments?.tracking_id||'—'}</td>
                    <td style={S.td}>{p.users?.full_name||'—'}</td>
                    <td style={{...S.td,fontWeight:700}}>MYR {parseFloat(p.amount||0).toFixed(2)}</td>
                    <td style={S.td}><div style={{display:'flex',alignItems:'center',gap:6}}>{payMethodIcon[p.payment_method]||null}{p.payment_method||'—'}</div></td>
                    <td style={S.td}><span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:10,background:p.payment_status==='completed'?'rgba(22,163,74,0.1)':p.payment_status==='pending'?'rgba(234,179,8,0.1)':'rgba(220,38,38,0.1)',color:p.payment_status==='completed'?'#16a34a':p.payment_status==='pending'?'#b45309':'#DC2626'}}>{p.payment_status}</span></td>
                    <td style={S.td}>{p.paid_at?new Date(p.paid_at).toLocaleDateString():p.created_at?new Date(p.created_at).toLocaleDateString():'—'}</td>
                    <td style={{...S.td,fontSize:12,color:'#6B7A99',fontFamily:'monospace'}}>{p.transaction_id||p.mpesa_receipt||p.paypal_capture_id||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── REVIEWS PANEL ────────────────────────────────────────────────────────────
function ReviewsPanel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const { data, error } = await adminGetAllReviews();
      if (error) throw error;
      setReviews(data || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePublish = async (id, current) => {
    await adminToggleReview(id, !current);
    await load();
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await adminDeleteReview(id);
    await load();
  };

  return (
    <div style={S.card}>
      <div style={S.cardH}>
        <span style={S.cardT}>Reviews <span style={{fontSize:12,color:'#6B7A99',fontWeight:400}}>({reviews.length})</span></span>
        <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={load}><RefreshCw size={13}/></button>
      </div>
      {loading ? <Loader/> : err ? <ErrorMsg msg={err} retry={load}/> : reviews.length === 0 ? (
        <div style={{padding:48,textAlign:'center',color:'#6B7A99'}}><Star size={40} style={{marginBottom:12,opacity:0.3}}/><p style={{fontWeight:600}}>No reviews yet</p></div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Name','Service','Rating','Review','Country','Date','Published','Actions'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {reviews.map((r,i) => (
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='#f7f9fc'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                  <td style={{...S.td,fontWeight:600}}>{r.student_name}</td>
                  <td style={S.td}><span style={{fontSize:11,fontWeight:600,background:'rgba(15,82,186,0.08)',color:'#0F52BA',padding:'2px 8px',borderRadius:5}}>{r.service||'—'}</span></td>
                  <td style={S.td}><span style={{color:'#FFB300'}}>{'★'.repeat(r.rating||5)}</span></td>
                  <td style={S.td}><span style={{fontSize:13,color:'#6B7A99',display:'block',maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.review_text}</span></td>
                  <td style={S.td}>{r.country||'—'}</td>
                  <td style={S.td}>{r.created_at?new Date(r.created_at).toLocaleDateString():'—'}</td>
                  <td style={S.td}><button onClick={()=>togglePublish(r.id,r.is_published)} style={{...S.btn,padding:'5px 12px',background:r.is_published?'rgba(22,163,74,0.1)':'rgba(107,114,128,0.1)',color:r.is_published?'#16a34a':'#6b7280',fontSize:12}}>{r.is_published?'Published':'Hidden'}</button></td>
                  <td style={S.td}><button style={{...S.btn,padding:'5px 8px',background:'rgba(220,38,38,0.06)',color:'#DC2626'}} onClick={()=>deleteReview(r.id)}><Trash2 size={13}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── FAQ PANEL ────────────────────────────────────────────────────────────────
function FAQPanel() {
  const [faqs, setFaqs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ question:'', answer:'', category:'general' });
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const { data, error } = await adminGetFAQs();
      if (error) throw error;
      setFaqs(data || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addFAQ = async () => {
    if (!form.question || !form.answer) { alert('Question and answer are required.'); return; }
    setSaving(true);
    try {
      const { error } = await adminAddFAQ(form);
      if (error) throw error;
      setModal(false);
      setForm({ question:'', answer:'', category:'general' });
      await load();
    } catch(e) { alert('Error: ' + e.message); }
    finally { setSaving(false); }
  };

  const deleteFAQ = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    await adminDeleteFAQ(id);
    await load();
  };

  return (
    <div>
      {modal && (
        <Modal title="Add FAQ" onClose={() => setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div><label style={{fontSize:13,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:5}}>Question</label><input style={S.inp} value={form.question} onChange={e=>setForm(f=>({...f,question:e.target.value}))} placeholder="Enter the question..."/></div>
            <div><label style={{fontSize:13,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:5}}>Answer</label><textarea style={{...S.inp,minHeight:100,resize:'vertical'}} value={form.answer} onChange={e=>setForm(f=>({...f,answer:e.target.value}))} placeholder="Provide a detailed answer..."/></div>
            <div><label style={{fontSize:13,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:5}}>Category</label>
              <select style={S.sel} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {['general','privacy','orders','payments','quality'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button style={{...S.btn,background:'#0F52BA',color:'#fff',flex:1,justifyContent:'center',opacity:saving?0.7:1}} onClick={addFAQ} disabled={saving}>{saving?'Adding…':<><Plus size={14}/> Add FAQ</>}</button>
              <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={()=>setModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
      <div style={S.card}>
        <div style={S.cardH}>
          <span style={S.cardT}>FAQ Manager <span style={{fontSize:12,color:'#6B7A99',fontWeight:400}}>({faqs.length})</span></span>
          <div style={{display:'flex',gap:8}}>
            <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={load}><RefreshCw size={13}/></button>
            <button style={{...S.btn,background:'#0F52BA',color:'#fff'}} onClick={()=>setModal(true)}><Plus size={14}/> Add FAQ</button>
          </div>
        </div>
        {loading ? <Loader/> : err ? <ErrorMsg msg={err} retry={load}/> : (
          <div style={{padding:'4px 0'}}>
            {faqs.map((f,i) => (
              <div key={i} style={{padding:'16px 20px',borderBottom:'1px solid #f0f4f8',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                    <span style={{fontSize:10,fontWeight:700,background:'rgba(15,82,186,0.08)',color:'#0F52BA',padding:'2px 8px',borderRadius:5}}>{f.category}</span>
                    <span style={{fontSize:14,fontWeight:700,color:'#0A1931'}}>{f.question}</span>
                  </div>
                  <p style={{fontSize:13,color:'#6B7A99',lineHeight:1.6,margin:0}}>{f.answer}</p>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <span style={{fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:10,background:f.is_active?'rgba(22,163,74,0.1)':'rgba(107,114,128,0.1)',color:f.is_active?'#16a34a':'#6b7280'}}>{f.is_active?'Active':'Hidden'}</span>
                  <button style={{...S.btn,padding:'5px 8px',background:'rgba(220,38,38,0.06)',color:'#DC2626'}} onClick={()=>deleteFAQ(f.id)}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MESSAGES PANEL ───────────────────────────────────────────────────────────
function MessagesPanel() {
  const [msgs, setMsgs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const { data, error } = await adminGetContactMessages();
      if (error) throw error;
      setMsgs(data || []);
    } catch(e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{display:'grid',gridTemplateColumns:selected?'1fr 1.4fr':'1fr',gap:18}}>
      <div style={S.card}>
        <div style={S.cardH}>
          <span style={S.cardT}>Messages <span style={{fontSize:12,color:'#6B7A99',fontWeight:400}}>({msgs.length})</span></span>
          <button style={{...S.btn,background:'#f0f4f8',color:'#0A1931'}} onClick={load}><RefreshCw size={13}/></button>
        </div>
        {loading ? <Loader/> : err ? <ErrorMsg msg={err} retry={load}/> : msgs.length === 0 ? (
          <div style={{padding:48,textAlign:'center',color:'#6B7A99'}}><MessageSquare size={40} style={{marginBottom:12,opacity:0.3}}/><p style={{fontWeight:600}}>No messages yet</p></div>
        ) : (
          <div>
            {msgs.map((m,i) => (
              <div key={i} onClick={() => setSelected(m)} style={{padding:'14px 20px',borderBottom:'1px solid #f0f4f8',cursor:'pointer',background:selected?.id===m.id?'#f0f6ff':'#fff',transition:'background 0.15s'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:14,color:'#0A1931'}}>{m.name}</span>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {!m.is_read && <span style={{width:8,height:8,borderRadius:'50%',background:'#0F52BA',display:'inline-block'}}/>}
                    <span style={{fontSize:11,color:'#6B7A99'}}>{m.created_at?new Date(m.created_at).toLocaleDateString():'—'}</span>
                  </div>
                </div>
                <div style={{fontSize:12,color:'#6B7A99',marginBottom:3}}>{m.email}</div>
                <div style={{fontSize:13,color:'#0A1931',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.subject||'—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <div style={S.card}>
          <div style={S.cardH}>
            <span style={S.cardT}>Message from {selected.name}</span>
            <button style={{...S.btn,padding:'5px 8px',background:'#f0f4f8',color:'#6B7A99'}} onClick={()=>setSelected(null)}><X size={15}/></button>
          </div>
          <div style={{padding:20}}>
            <div style={{background:'#f7f9fc',borderRadius:10,padding:'14px 16px',marginBottom:16}}>
              {[['From', selected.name],['Email', selected.email],['Phone', selected.phone||'—'],['Subject', selected.subject||'—'],['Received', selected.created_at?new Date(selected.created_at).toLocaleString():'—']].map(([l,v]) => (
                <div key={l} style={{display:'flex',gap:12,marginBottom:8}}><span style={{fontSize:12,fontWeight:700,color:'#6B7A99',width:60,flexShrink:0}}>{l}</span><span style={{fontSize:13,color:'#0A1931'}}>{v}</span></div>
              ))}
            </div>
            <div style={{background:'#fff',border:'1px solid #e8edf2',borderRadius:10,padding:'14px 16px',marginBottom:16,fontSize:14,color:'#0A1931',lineHeight:1.7}}>{selected.message}</div>
            <div>
              <label style={{fontSize:13,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:6}}>Reply</label>
              <textarea style={{...S.inp,minHeight:80,resize:'vertical',marginBottom:10}} placeholder="Type your reply..."/>
              <button style={{...S.btn,background:'#0F52BA',color:'#fff',width:'100%',justifyContent:'center'}}><Send size={14}/> Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsPanel({ user, onLogout }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <div style={S.card}>
        <div style={S.cardH}><span style={S.cardT}>Admin Profile</span></div>
        <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:4}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#0F52BA,#FF7A00)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:18,flexShrink:0}}>AD</div>
            <div><div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:15}}>{user?.name||'Administrator'}</div><div style={{fontSize:13,color:'#6B7A99'}}>{user?.email||'admin@expertassignment.com'}</div></div>
          </div>
          {[['Full Name','text',user?.name||'Administrator'],['Email','email',user?.email||''],['Phone','tel','+60 12 000 0000']].map(([l,t,v]) => (
            <div key={l}><label style={{fontSize:12,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:4}}>{l}</label><input type={t} defaultValue={v} style={S.inp}/></div>
          ))}
          <button style={{...S.btn,background:'#0F52BA',color:'#fff',justifyContent:'center'}}><RefreshCw size={14}/> Update Profile</button>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardH}><span style={S.cardT}>Security</span></div>
        <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>
          {['Current Password','New Password','Confirm Password'].map(l => (
            <div key={l}><label style={{fontSize:12,fontWeight:600,color:'#6B7A99',display:'block',marginBottom:4}}>{l}</label><input type="password" placeholder="••••••••" style={S.inp}/></div>
          ))}
          <button style={{...S.btn,background:'#0F52BA',color:'#fff',justifyContent:'center'}}><Shield size={14}/> Change Password</button>
          <div style={{borderTop:'1px solid #f0f4f8',paddingTop:14}}>
            <button onClick={onLogout} style={{...S.btn,background:'rgba(220,38,38,0.07)',color:'#DC2626',width:'100%',justifyContent:'center',border:'1px solid rgba(220,38,38,0.15)'}}><LogOut size={14}/> Sign Out of Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { section:null,         icon:LayoutDashboard, label:'Dashboard',  key:'dashboard', badge:null },
  { section:'MANAGEMENT', icon:ClipboardList,   label:'Orders',     key:'orders',    badge:'new' },
  { section:null,         icon:Users,           label:'Students',   key:'students',  badge:null },
  { section:null,         icon:UserCog,         label:'Writers',    key:'writers',   badge:null },
  { section:'FINANCE',    icon:Wallet,          label:'Payments',   key:'payments',  badge:null },
  { section:'CONTENT',    icon:Star,            label:'Reviews',    key:'reviews',   badge:null },
  { section:null,         icon:CircleHelp,      label:'FAQ',        key:'faq',       badge:null },
  { section:null,         icon:MessageSquare,   label:'Messages',   key:'messages',  badge:null },
  { section:'SYSTEM',     icon:Settings,        label:'Settings',   key:'settings',  badge:null },
];

const TITLES = { dashboard:'Dashboard', orders:'Orders', students:'Students', writers:'Writers', payments:'Payments', reviews:'Reviews', faq:'FAQ Manager', messages:'Messages', settings:'Settings' };

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ navigate, user, onLogout }) {
  const [active, setActive]   = useState('dashboard');
  const [newOrders, setNewOrders] = useState(0);

  // Listen for new orders badge
  useEffect(() => {
    const ch = subscribeToAdminOrders((payload) => {
      if (payload.eventType === 'INSERT') setNewOrders(n => n + 1);
    });
    return () => supabase.removeChannel(ch);
  }, []);

  const today = new Date().toLocaleDateString('en-GB',{ weekday:'short', day:'numeric', month:'short', year:'numeric' });

  const panels = {
    dashboard: <DashboardHome adminUser={user}/>,
    orders:    <OrdersPanel adminUser={user}/>,
    students:  <StudentsPanel/>,
    writers:   <WritersPanel/>,
    payments:  <PaymentsPanel/>,
    reviews:   <ReviewsPanel/>,
    faq:       <FAQPanel/>,
    messages:  <MessagesPanel/>,
    settings:  <SettingsPanel user={user} onLogout={onLogout}/>,
  };

  let lastSection = null;

  return (
    <div style={S.wrap}>
      {/* SIDEBAR */}
      <div style={S.sb}>
        <div style={S.sbTop}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#0F52BA,#FF7A00)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:12,fontFamily:'Sora,sans-serif',flexShrink:0}}>EA</div>
            <div style={{fontFamily:'Sora,sans-serif',fontSize:12.5,fontWeight:700,color:'#fff',lineHeight:1.3}}>Ark Expert<br/><span style={{fontSize:10,color:'rgba(255,122,0,0.8)',fontWeight:400}}>Admin Panel</span></div>
          </div>
        </div>
        <div style={S.sbNav}>
          {NAV.map((item, i) => {
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;
            return (
              <React.Fragment key={i}>
                {showSection && <div style={S.sbSec}>{item.section}</div>}
                <button
                  style={{...S.sbItem,...(active===item.key?S.sbAct:{})}}
                  onClick={() => { setActive(item.key); if (item.key==='orders') setNewOrders(0); }}>
                  <item.icon size={15}/>
                  <span style={{flex:1,textAlign:'left'}}>{item.label}</span>
                  {item.key==='orders' && newOrders > 0 && (
                    <span style={{fontSize:10,fontWeight:700,background:'#FF7A00',color:'#fff',padding:'2px 6px',borderRadius:8}}>{newOrders}</span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        <div style={S.sbFoot}>
          <button onClick={onLogout} style={{...S.sbItem,color:'rgba(220,38,38,0.75)',padding:'8px 0',width:'100%',borderRadius:8,justifyContent:'center',gap:8}}>
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        <div style={S.topbar}>
          <div>
            <h2 style={{fontFamily:'Sora,sans-serif',fontSize:18,fontWeight:700,color:'#0A1931',margin:0}}>{TITLES[active]}</h2>
            <p style={{fontSize:12,color:'#6B7A99',margin:0}}>{today}</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button style={{position:'relative',...S.btn,padding:'8px 10px',background:'#f0f4f8',color:'#0A1931'}}>
              <Bell size={16}/>
              {newOrders > 0 && <span style={{position:'absolute',top:5,right:5,width:8,height:8,borderRadius:'50%',background:'#FF7A00'}}/>}
            </button>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#0F52BA,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13}}>AD</div>
              <div style={{lineHeight:1.3}}>
                <div style={{fontSize:13,fontWeight:600,color:'#0A1931'}}>{user?.name||'Administrator'}</div>
                <div style={{fontSize:11,color:'#6B7A99'}}>Super Admin</div>
              </div>
            </div>
          </div>
        </div>
        <div style={S.content}>{panels[active]}</div>
      </div>
    </div>
  );
}
