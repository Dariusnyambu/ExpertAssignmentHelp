import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Shield, LogIn } from 'lucide-react';
import { signIn, getCurrentProfile, supabase } from '../supabase';

export default function AdminLogin({ onLogin, navigate }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handle = async () => {
    setError('');
    if (!email || !password) { setError('Please enter your credentials.'); return; }
    setLoading(true);
    try {
      const { user } = await signIn(email, password);

      // Check this user is in admin_users (non-recursive admin check)
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id, full_name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        setError('This account does not have admin access.');
        setLoading(false);
        return;
      }

      const profile = await getCurrentProfile();
      onLogin({
        id: user.id,
        email: user.email,
        name: adminRow.full_name || profile?.full_name || 'Administrator',
        role: profile?.role || 'admin',
      });
    } catch (e) {
      setError(
        e.message?.toLowerCase().includes('invalid login')
          ? 'Invalid email or password. Please try again.'
          : `Login failed: ${e.message}`
      );
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', background:'linear-gradient(135deg,#040d1f 0%,#0a1931 60%,#0c2044 100%)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{position:'absolute',inset:0,backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230F52BA' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}/>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(15,82,186,0.15) 0%,transparent 70%)',top:-150,right:-100,pointerEvents:'none'}}/>
      <div style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,122,0,0.1) 0%,transparent 70%)',bottom:-80,left:'5%',pointerEvents:'none'}}/>

      <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <img src="/logo.png" alt="Ark Expert Researchers" style={{width:72,height:72,objectFit:'contain',borderRadius:16,background:'#fff',padding:6,margin:'0 auto 16px',display:'block',boxShadow:'0 8px 24px rgba(15,82,186,0.25)'}}/>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.6rem',fontWeight:800,color:'#fff',marginBottom:6}}>Admin Portal</h1>
          <p style={{fontSize:14,color:'rgba(255,255,255,0.48)'}}>Ark Expert Researchers · Restricted Access</p>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:36,backdropFilter:'blur(12px)'}}>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',marginBottom:7}}>Admin Email</label>
            <div style={{position:'relative'}}>
              <Mail size={16} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.35)'}}/>
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="admin@arkexpertresearch.com"
                onKeyDown={e=>e.key==='Enter'&&handle()}
                style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,padding:'12px 14px 12px 40px',color:'#fff',fontSize:14,fontFamily:'Inter,sans-serif',outline:'none',boxSizing:'border-box'}}
              />
            </div>
          </div>

          <div style={{marginBottom:8}}>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',marginBottom:7}}>Password</label>
            <div style={{position:'relative'}}>
              <Lock size={16} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.35)'}}/>
              <input
                type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••••••"
                onKeyDown={e=>e.key==='Enter'&&handle()}
                style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,padding:'12px 40px 12px 40px',color:'#fff',fontSize:14,fontFamily:'Inter,sans-serif',outline:'none',boxSizing:'border-box'}}
              />
              <button onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',padding:0,display:'flex'}}>
                {show?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
          </div>

          <div style={{textAlign:'right',marginBottom:22}}>
            <span style={{fontSize:12,color:'rgba(255,122,0,0.8)',cursor:'pointer'}}>Forgot password?</span>
          </div>

          {error && (
            <div style={{background:'rgba(220,38,38,0.12)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:9,padding:'10px 14px',color:'#fca5a5',fontSize:13,marginBottom:18,display:'flex',alignItems:'center',gap:8}}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handle} disabled={loading}
            style={{width:'100%',background:'linear-gradient(135deg,#0F52BA,#1e6dd4)',border:'none',borderRadius:10,padding:'14px',color:'#fff',fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:loading?0.7:1,transition:'all 0.2s'}}>
            {loading?'Authenticating…':<><LogIn size={17}/> Sign In to Admin Panel</>}
          </button>

          <div style={{marginTop:24,padding:'14px',background:'rgba(255,122,0,0.07)',border:'1px solid rgba(255,122,0,0.15)',borderRadius:9}}>
            <p style={{fontSize:12,color:'rgba(255,255,255,0.4)',textAlign:'center',lineHeight:1.6}}>
              🔒 This portal is restricted to authorised administrators only.<br/>Unauthorised access attempts are logged.
            </p>
          </div>
        </div>

        <p style={{textAlign:'center',marginTop:20,fontSize:13,color:'rgba(255,255,255,0.3)'}}>
          <span style={{cursor:'pointer',color:'rgba(255,255,255,0.5)'}} onClick={()=>navigate('home')}>← Back to main website</span>
        </p>
      </div>
    </div>
  );
}
