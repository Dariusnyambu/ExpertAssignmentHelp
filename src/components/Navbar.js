import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { id: 'home',     label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'samples',  label: 'Samples' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'reviews',  label: 'Reviews' },
  { id: 'tracking', label: 'Track Order' },
  { id: 'contact',  label: 'Contact' },
];

export default function Navbar({ current, navigate, user, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-logo" onClick={() => navigate('home')}>
          <img
            src="/logo.png"
            alt="Ark Expert Researchers"
            style={{ width:40, height:40, objectFit:'contain', borderRadius:8, background:'#fff', padding:2, flexShrink:0 }}
          />
          <div className="nav-logo-text">
            Ark Expert Researchers
            <span>Professional Academic Assistance</span>
          </div>
        </div>

        <div className="nav-links">
          {links.map(l => (
            <button key={l.id} className={`nav-link${current===l.id?' active':''}`} onClick={() => navigate(l.id)}>
              {l.label}
            </button>
          ))}
          {user ? (
            <>
              <button className="nav-link" onClick={() => navigate('student')}>
                👤 {(user.full_name || user.email || '').split(' ')[0].split('@')[0]}
              </button>
              <button className="nav-link" style={{color:'rgba(255,155,100,0.9)'}} onClick={onLogout}>Logout</button>
            </>
          ) : (
            <button className="nav-link" style={{background:'rgba(255,122,0,0.18)',border:'1px solid rgba(255,122,0,0.4)',color:'#FFB347',borderRadius:8,padding:'7px 16px',fontWeight:600}} onClick={() => navigate('login')}>
              Client Login
            </button>
          )}
          <button className="nav-link" style={{background:'var(--orange)',color:'#fff',borderRadius:8,padding:'8px 16px',fontWeight:700}} onClick={() => navigate('quote')}>
            Get Quote
          </button>
        </div>

        <button className="nav-hamburger" onClick={() => setOpen(o => !o)}>
          {open ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      <div className={`nav-mobile${open ? ' open' : ''}`}>
        {links.map(l => (
          <button key={l.id} className="nav-link" onClick={() => { navigate(l.id); setOpen(false); }}>
            {l.label}
          </button>
        ))}
        {user ? (
          <>
            <button className="nav-link" onClick={() => { navigate('student'); setOpen(false); }}>
              👤 {(user.full_name || user.email || '').split(' ')[0].split('@')[0]} — My Orders
            </button>
            <button className="nav-link" onClick={() => { onLogout(); setOpen(false); }}>Logout</button>
          </>
        ) : (
          <button className="nav-link" onClick={() => { navigate('login'); setOpen(false); }}>Client Login</button>
        )}
        <button className="nav-link" style={{background:'var(--orange)',color:'#fff',borderRadius:8,fontWeight:700}} onClick={() => { navigate('quote'); setOpen(false); }}>
          Get Free Quote
        </button>
      </div>
    </nav>
  );
}
