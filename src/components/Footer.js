import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const socials = [
  { Icon: Facebook,  href: 'https://web.facebook.com/profile.php?id=61591296958062', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com/expertresearchhelpark?igsh=MWY0MTVrYjlrY2x5Mw==', label: 'Instagram' },
  { Icon: Twitter,   href: 'https://x.com/researchhelpark', label: 'X / Twitter' },
  { Icon: Linkedin,  href: 'https://www.linkedin.com/company/arkexpertresearchers', label: 'LinkedIn' },
];

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

export default function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => navigate && navigate('home')}>
            <img src="/logo.png" alt="Ark Expert Researchers" style={{width:40,height:40,objectFit:'contain',borderRadius:8,background:'#fff',padding:2,flexShrink:0}}/>
            <div className="nav-logo-text" style={{ color:'#fff' }}>
              Ark Expert Researchers
              <span>Professional Academic Assistance</span>
            </div>
          </div>
          <p>Trusted by thousands of students across Asia, the Middle East, North America, and Australia. Premium academic research and writing assistance.</p>
          <div className="social-row">
            {socials.map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="social-btn" title={label}>
                <Icon size={16}/>
              </a>
            ))}
            <a
              href="https://www.tiktok.com/@ark.expert.resear?_r=1&_t=ZS-97Q3BOFrWjc"
              target="_blank" rel="noopener noreferrer"
              className="social-btn" title="TikTok">
              <TikTokIcon/>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h5>Services</h5>
          {['Essay Writing','Assignments','Dissertations','Research Papers','SPSS Analysis'].map(s => <a key={s} href="#">{s}</a>)}
        </div>

        <div className="footer-col">
          <h5>Subjects</h5>
          {['Business','Engineering','Nursing','Law','Computer Science'].map(s => <a key={s} href="#">{s}</a>)}
        </div>

        <div className="footer-col">
          <h5>Company</h5>
          <a href="#">About Us</a>
          <a href="#" onClick={e => { e.preventDefault(); navigate && navigate('reviews'); }}>Reviews</a>
          <a href="#" onClick={e => { e.preventDefault(); navigate && navigate('samples'); }}>Samples</a>
          <a href="#" onClick={e => { e.preventDefault(); navigate && navigate('contact'); }}>Contact</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Ark Expert Researchers. All rights reserved.</span>
        <span>🌍 Serving Asia · Middle East · USA · Canada · Australia</span>
      </div>
    </footer>
  );
}
