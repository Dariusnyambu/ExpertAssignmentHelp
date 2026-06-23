import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, User as UserIcon, Phone } from 'lucide-react';
import { signIn, signUp, getCurrentProfile, claimGuestOrdersByEmail, supabase } from '../supabase';

export default function LoginPage({ navigate, onLogin }) {
  const [tab, setTab] = useState('login');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email:'', password:'', name:'', phone:'', confirm:'' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => { setError(''); setInfo(''); setForm(f=>({...f,[k]:e.target.value})); };

  const handleLogin = async () => {
    setError(''); setInfo('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { user } = await signIn(form.email, form.password);
      const profile = await getCurrentProfile();
      const merged = {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.email.split('@')[0],
        role: profile?.role || 'student',
      };
      onLogin(merged);
    } catch (e) {
      const msg = (e.message || '').toLowerCase();
      if (msg.includes('not confirmed') || msg.includes('email not confirmed')) {
        setError('__unconfirmed__');
      } else if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(`Login failed: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!form.email) { setError('Enter your email address above first.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: form.email });
      if (error) throw error;
      setError('');
      setInfo('Confirmation email resent! Check your inbox (and spam folder).');
    } catch (e) {
      setError(`Could not resend: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(''); setInfo('');
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.'); return;
    }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const { user, session } = await signUp(form.email, form.password, {
        full_name: form.name, phone: form.phone,
      });

      if (!session) {
        // Email confirmation required before login is possible
        setInfo('Account created! Please check your email to confirm your address, then log in.');
        setTab('login');
        setLoading(false);
        return;
      }

      // Link any guest quote submissions made with this email
      await claimGuestOrdersByEmail(form.email, user.id);

      onLogin({ id: user.id, email: user.email, full_name: form.name, role: 'student' });
    } catch (e) {
      setError(
        e.message?.toLowerCase().includes('already registered')
          ? 'An account with this email already exists. Please log in instead.'
          : `Registration failed: ${e.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'center',marginBottom:24}}>
          <img src="/logo.png" alt="Ark Expert Researchers" style={{width:40,height:40,objectFit:'contain',borderRadius:8,background:'#fff',padding:2}}/>
          <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,color:'#fff',fontSize:13,lineHeight:1.2}}>
            Ark Expert Researchers
            <span style={{display:'block',fontSize:10,color:'var(--orange-light)',fontWeight:400}}>Academic Assistance Portal</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{display:'flex',background:'rgba(255,255,255,0.06)',borderRadius:10,padding:4,marginBottom:28}}>
          {['login','register'].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setError('');setInfo('');}}
              style={{flex:1,padding:'9px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:600,fontSize:13,transition:'all 0.2s',
                background:tab===t?'rgba(255,122,0,0.85)':'transparent',
                color:tab===t?'#fff':'rgba(255,255,255,0.55)',fontFamily:'Inter,sans-serif'}}>
              {t==='login'?'Client Login':'Create Account'}
            </button>
          ))}
        </div>

        {info && (
          <div style={{background:'rgba(22,163,74,0.12)',border:'1px solid rgba(22,163,74,0.3)',borderRadius:8,padding:'10px 14px',color:'#86efac',fontSize:13,marginBottom:16}}>
            ✅ {info}
          </div>
        )}

        {tab==='login' ? (
          <>
            <h2 style={{fontSize:'1.5rem',marginBottom:4}}>Welcome Back</h2>
            <p className="sub">Login to track your assignments &amp; orders</p>
            <div className="login-field">
              <label>Email Address</label>
              <div style={{position:'relative'}}>
                <Mail size={16} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)'}}/>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} style={{paddingLeft:38}} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
              </div>
            </div>
            <div className="login-field">
              <label>Password</label>
              <div style={{position:'relative'}}>
                <Lock size={16} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)'}}/>
                <input type={show?'text':'password'} placeholder="Your password" value={form.password} onChange={set('password')} style={{paddingLeft:38,paddingRight:40}} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
                <button onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',padding:0}}>
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>

            {error === '__unconfirmed__' ? (
              <div style={{background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:8,padding:'14px',color:'#fde68a',fontSize:13,marginBottom:16}}>
                <div style={{fontWeight:700,marginBottom:6}}>📧 Please confirm your email first</div>
                <div style={{marginBottom:10,lineHeight:1.6,opacity:0.85}}>
                  Check your inbox for a confirmation link. Once confirmed, come back and log in.<br/>
                  Can't find it? Check your spam folder.
                </div>
                <button onClick={resendConfirmation} disabled={loading}
                  style={{background:'rgba(245,158,11,0.25)',border:'1px solid rgba(245,158,11,0.4)',borderRadius:6,padding:'7px 14px',color:'#fde68a',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'Inter,sans-serif',opacity:loading?0.6:1}}>
                  {loading ? 'Sending…' : '🔄 Resend confirmation email'}
                </button>
              </div>
            ) : error ? (
              <div style={{background:'rgba(220,38,38,0.15)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:8,padding:'10px 14px',color:'#fca5a5',fontSize:13,marginBottom:16}}>{error}</div>
            ) : null}

            <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15,opacity:loading?0.7:1,marginTop:6}} onClick={handleLogin} disabled={loading}>
              {loading?'Logging in…':<><LogIn size={17}/> Login to Dashboard</>}
            </button>
            <p className="login-footer">Don't have an account? <span onClick={()=>{setTab('register');setError('');setInfo('');}}>Create one free</span></p>
          </>
        ) : (
          <>
            <h2 style={{fontSize:'1.5rem',marginBottom:4}}>Create Account</h2>
            <p className="sub">Track your orders and stay updated</p>
            <div className="login-field">
              <label>Full Name</label>
              <div style={{position:'relative'}}>
                <UserIcon size={16} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)'}}/>
                <input type="text" placeholder="Your full name" value={form.name} onChange={set('name')} style={{paddingLeft:38}}/>
              </div>
            </div>
            <div className="login-field">
              <label>Email Address</label>
              <div style={{position:'relative'}}>
                <Mail size={16} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)'}}/>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} style={{paddingLeft:38}}/>
              </div>
            </div>
            <div className="login-field">
              <label>Phone / WhatsApp (optional)</label>
              <div style={{position:'relative'}}>
                <Phone size={16} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)'}}/>
                <input type="tel" placeholder="+60 12 345 6789" value={form.phone} onChange={set('phone')} style={{paddingLeft:38}}/>
              </div>
            </div>
            <div className="login-field">
              <label>Password</label>
              <div style={{position:'relative'}}>
                <Lock size={16} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)'}}/>
                <input type={show?'text':'password'} placeholder="At least 6 characters" value={form.password} onChange={set('password')} style={{paddingLeft:38,paddingRight:40}}/>
                <button onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',padding:0}}>
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            <div className="login-field">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')}/>
            </div>
            {error && <div style={{background:'rgba(220,38,38,0.15)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:8,padding:'10px 14px',color:'#fca5a5',fontSize:13,marginBottom:16}}>{error}</div>}
            <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:14,fontSize:15,opacity:loading?0.7:1}} onClick={handleRegister} disabled={loading}>
              {loading?'Creating account…':<><UserPlus size={17}/> Create My Account</>}
            </button>
            <p className="login-footer" style={{marginTop:16}}>Already have an account? <span onClick={()=>{setTab('login');setError('');setInfo('');}}>Login here</span></p>
          </>
        )}

        <p className="login-footer" style={{marginTop:8}}>
          <span onClick={()=>navigate('home')}>← Back to homepage</span>
        </p>
      </div>
    </div>
  );
}
