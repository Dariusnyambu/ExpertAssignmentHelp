import React, { useState } from 'react';
import { Send, Lock, CreditCard, Wallet } from 'lucide-react';
import { submitAssignment } from '../supabase';

const paymentMethods = [
  { id:'card',    Icon:CreditCard, label:'Credit / Debit Card', sub:'Visa, Mastercard, Amex',  color:'#0F52BA', bg:'rgba(15,82,186,0.08)' },
  { id:'paypal',  Icon:Wallet,     label:'PayPal',              sub:'Secure PayPal checkout',  color:'#0891B2', bg:'rgba(8,145,178,0.08)' },
];

const academicLevelMap = {
  'High School':'high_school',
  'Undergraduate (Year 1–2)':'undergraduate_1_2',
  'Undergraduate (Year 3–4)':'undergraduate_3_4',
  'Postgraduate / Masters':'postgraduate',
  'PhD / Doctoral':'phd',
  'Professional / Other':'professional',
};

const initialForm = {
  full_name:'', email:'', phone:'', country:'Malaysia',
  subject:'Accounting', academic_level:'Undergraduate (Year 1–2)',
  deadline_date:'', deadline_time:'23:59', word_count:'', assignment_type:'Essay',
  referencing:'APA 7th', requirements:'',
};

export default function QuotePage() {
  const [form, setForm] = useState(initialForm);
  const [payment, setPayment] = useState('card');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => { setError(''); setForm((f) => ({ ...f, [k]: e.target.value })); };

  const handleSubmit = async () => {
    setError('');

    const missing = [];
    if (!form.full_name.trim()) missing.push('Full Name');
    if (!form.email.trim()) missing.push('Email');
    if (!form.subject) missing.push('Subject');
    if (!form.deadline_date) missing.push('Deadline date');

    if (missing.length) {
      setError(`Please fill in: ${missing.join(', ')}.`);
      return;
    }

    const deadlineISO = new Date(`${form.deadline_date}T${form.deadline_time || '23:59'}:00`).toISOString();

    setSaving(true);
    try {
      const payload = {
        // contact info — stored in requirements/internal_notes since
        // assignments table doesn't have name/email/phone/payment columns
        subject:         form.subject,
        academic_level:  academicLevelMap[form.academic_level] || 'other',
        assignment_type: form.assignment_type,
        word_count:      form.word_count ? parseInt(form.word_count, 10) : null,
        referencing:     form.referencing,
        deadline:        deadlineISO,
        requirements:    form.requirements,
        internal_notes:
          `Name: ${form.full_name}\n` +
          `Email: ${form.email}\n` +
          `Phone: ${form.phone}\n` +
          `Country: ${form.country}\n` +
          `Preferred Payment: ${paymentMethods.find(p=>p.id===payment)?.label || payment}`,
        priority: 'normal',
        currency: 'MYR',
      };

      const data = await submitAssignment(payload);
      setSubmitted(data.tracking_id);
      setForm(initialForm);
    } catch (e) {
      console.error('Quote submission error:', e);
      const msg = (e.message || '').toLowerCase();
      const code = e.code || '';
      const isPermissionError =
        msg.includes('row-level security') ||
        msg.includes('permission denied') ||
        msg.includes('policy') ||
        code === '42501' || // insufficient_privilege
        code === '42P17';   // infinite recursion in policy

      setError(
        isPermissionError
          ? `Submission blocked by database security rules (${code || 'RLS'}). Run supabase_fix_guest_submit.sql in Supabase, then try again. Details: ${e.message}`
          : `Something went wrong: ${e.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="quote-page" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',textAlign:'center'}}>
        <div>
          <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(22,163,74,0.15)',border:'2px solid #16a34a',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:32}}>✅</div>
          <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'2rem',fontWeight:800,color:'#fff',marginBottom:12}}>Quote Request Submitted!</h2>
          <p style={{color:'rgba(255,255,255,0.65)',fontSize:16,marginBottom:8}}>Your Tracking ID: <strong style={{color:'var(--orange)'}}>{submitted}</strong></p>
          <p style={{color:'rgba(255,255,255,0.5)',fontSize:14,marginBottom:28}}>Our team will contact you within 30 minutes with a personalised quote. Save your tracking ID to monitor progress.</p>
          <button className="btn-primary" onClick={() => setSubmitted(false)}>Submit Another Request</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-page">
      <div style={{textAlign:'center',marginBottom:44}}>
        <div className="section-label" style={{color:'var(--orange)',textAlign:'center',justifyContent:'center',display:'flex'}}>Free Quote</div>
        <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'clamp(1.8rem,3vw,2.4rem)',fontWeight:800,color:'#fff',marginBottom:10}}>Get Your Free Quote</h1>
        <p style={{color:'rgba(255,255,255,0.58)',fontSize:15}}>Fill in your details and receive a quote within 30 minutes</p>
      </div>

      <div className="quote-form-wrap">
        <div className="quote-form-grid">
          <div className="qfg"><label>Full Name *</label><input type="text" placeholder="Your full name" value={form.full_name} onChange={set('full_name')}/></div>
          <div className="qfg"><label>Email Address *</label><input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')}/></div>
          <div className="qfg"><label>Phone / WhatsApp</label><input type="tel" placeholder="+60 12 345 6789" value={form.phone} onChange={set('phone')}/></div>
          <div className="qfg">
            <label>Country</label>
            <select value={form.country} onChange={set('country')}>
              {['Malaysia','Singapore','Hong Kong','Indonesia','Thailand','Philippines','China','Japan','South Korea','Vietnam','United Arab Emirates','Qatar','Saudi Arabia','Kuwait','Bahrain','Oman','United States','Canada','Australia','United Kingdom','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="qfg">
            <label>Subject / Field *</label>
            <select value={form.subject} onChange={set('subject')}>
              {['Accounting','Agriculture & Agribusiness','Architecture','Biology & Life Sciences','Business & Management','Chemistry','Computer Science & IT','Criminology','Data Science','Economics','Education','Engineering','English Literature','Environmental Science','Finance & Banking','Geography','Healthcare Management','Hospitality & Tourism','HRM','Law','Marketing','Mathematics & Statistics','Medicine','Nursing','Philosophy & Ethics','Political Science','Psychology','Public Health','Sociology & Social Work','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="qfg">
            <label>Academic Level *</label>
            <select value={form.academic_level} onChange={set('academic_level')}>
              {Object.keys(academicLevelMap).map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="qfg">
            <label>Deadline Date *</label>
            <input type="date" value={form.deadline_date} onChange={set('deadline_date')}/>
          </div>
          <div className="qfg">
            <label>Deadline Time</label>
            <input type="time" value={form.deadline_time} onChange={set('deadline_time')}/>
          </div>
          <div className="qfg"><label>Word Count</label><input type="number" placeholder="e.g. 2500" value={form.word_count} onChange={set('word_count')}/></div>
          <div className="qfg">
            <label>Assignment Type</label>
            <select value={form.assignment_type} onChange={set('assignment_type')}>
              {['Essay','Research Paper','Dissertation','Coursework','Case Study','Literature Review','Presentation','Thesis','Research Proposal','Data Analysis','Proofreading / Editing','Lab Report','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="qfg">
            <label>Referencing Style</label>
            <select value={form.referencing} onChange={set('referencing')}>
              {['APA 7th','Harvard','MLA','Chicago','Vancouver','AGLC','IEEE','OSCOLA','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="qfg full">
            <label>Additional Instructions</label>
            <textarea placeholder="Describe your requirements, learning objectives, marking rubric, or any special instructions..." value={form.requirements} onChange={set('requirements')}/>
          </div>

          {/* PAYMENT METHOD */}
          <div className="qfg full">
            <label style={{marginBottom:12,display:'block',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.72)'}}>
              Preferred Payment Method
            </label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10}}>
              {paymentMethods.map(({id, Icon, label, sub, color}) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPayment(id)}
                  style={{
                    display:'flex',alignItems:'center',gap:10,
                    padding:'12px 14px',borderRadius:10,cursor:'pointer',
                    transition:'all 0.2s',textAlign:'left',fontFamily:'Inter,sans-serif',
                    border: payment === id ? `2px solid ${color}` : '1.5px solid rgba(255,255,255,0.12)',
                    background: payment === id ? `${color}22` : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{
                    width:36,height:36,borderRadius:9,flexShrink:0,
                    background: payment === id ? `${color}30` : 'rgba(255,255,255,0.08)',
                    color: payment === id ? color : 'rgba(255,255,255,0.5)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    transition:'all 0.2s',
                  }}>
                    <Icon size={18}/>
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color: payment===id ? '#fff' : 'rgba(255,255,255,0.7)',lineHeight:1.2}}>{label}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>{sub}</div>
                  </div>
                  {payment === id && (
                    <div style={{marginLeft:'auto',width:16,height:16,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:10,color:'#fff',fontWeight:700}}>✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={{marginTop:20,background:'rgba(220,38,38,0.12)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:10,padding:'12px 16px',color:'#fca5a5',fontSize:13,textAlign:'center'}}>
            ⚠️ {error}
          </div>
        )}

        <div style={{textAlign:'center',marginTop:28}}>
          <button className="btn-primary" style={{padding:'15px 48px',fontSize:16,opacity:saving?0.7:1}} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Submitting…' : <><Send size={17}/> Get My Free Quote</>}
          </button>
          <p style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,fontSize:12,color:'rgba(255,255,255,0.35)',marginTop:14}}>
            <Lock size={13}/> 100% confidential — your details are never shared with third parties
          </p>
        </div>
      </div>
    </div>
  );
}
