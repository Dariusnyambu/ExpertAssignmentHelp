import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Search } from 'lucide-react';

const slides = [
  {
    badge: '🌍 Trusted by Students in 15+ Countries Worldwide',
    title: <>Professional <span>Assignment Help</span><br/>Wherever You Study</>,
    sub: 'Get expert academic assistance from qualified professionals. High-quality, plagiarism-free work delivered before your deadline — guaranteed.',
    bgColor: '#040d1f',
    bgImage: 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=1600',
    overlay: 'linear-gradient(105deg,rgba(4,13,31,0.93) 0%,rgba(10,25,49,0.85) 50%,rgba(10,25,49,0.45) 100%)',
    accent: '#0F52BA',
  },
  {
    badge: '📝 Expert Essay & Dissertation Writers',
    title: <>Top-Rated <span>Essay Writing</span><br/>Service for International Students</>,
    sub: "Original, plagiarism-free essays crafted by PhD and Master's holders. Any subject, any level, any deadline — UK, US & Australian standards.",
    bgColor: '#0a0518',
    bgImage: 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=1600',
    overlay: 'linear-gradient(105deg,rgba(4,8,28,0.94) 0%,rgba(14,10,40,0.86) 50%,rgba(14,10,40,0.4) 100%)',
    accent: '#7C3AED',
  },
  {
    badge: '🔬 Research & Dissertation Specialists',
    title: <>Dissertation &amp; <span>Research Papers</span><br/>Done Right</>,
    sub: 'From research proposals to full dissertations — our academic specialists ensure your work meets the highest scholarly standards worldwide.',
    bgColor: '#011810',
    bgImage: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=1600',
    overlay: 'linear-gradient(105deg,rgba(1,10,6,0.94) 0%,rgba(2,20,14,0.86) 50%,rgba(2,20,14,0.4) 100%)',
    accent: '#16a34a',
  },
  {
    badge: '⚡ Urgent Orders Delivered in 3 Hours',
    title: <>Same-Day <span>Deadline</span><br/>Assignment Help</>,
    sub: 'Running out of time? We handle urgent assignments in as little as 3 hours, in any timezone — quality never compromised.',
    bgColor: '#1a0800',
    bgImage: 'https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?auto=compress&cs=tinysrgb&w=1600',
    overlay: 'linear-gradient(105deg,rgba(20,6,0,0.95) 0%,rgba(30,12,0,0.87) 50%,rgba(30,12,0,0.45) 100%)',
    accent: '#FF7A00',
  },
  {
    badge: '🌐 Serving Students Across Asia, the Gulf & the West',
    title: <>Academic Help for <span>International</span><br/>Students Everywhere</>,
    sub: 'Proudly serving students in Malaysia, Singapore, the UAE, Qatar, Saudi Arabia, the USA, Canada, Australia and beyond.',
    bgColor: '#00101a',
    bgImage: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1600',
    overlay: 'linear-gradient(105deg,rgba(0,10,18,0.94) 0%,rgba(0,18,30,0.86) 50%,rgba(0,18,30,0.45) 100%)',
    accent: '#0891B2',
  },
];

export default function HeroSlider({ navigate }) {
  const [current, setCurrent] = useState(0);
  const [imgLoaded, setImgLoaded] = useState({0: false,1:false,2:false,3:false,4:false});

  useEffect(() => {
    slides.forEach((s, i) => {
      const img = new window.Image();
      img.onload  = () => setImgLoaded(p => ({ ...p, [i]: true }));
      img.onerror = () => setImgLoaded(p => ({ ...p, [i]: false }));
      img.src = s.bgImage;
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5800);
    return () => clearInterval(t);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent(c => (c + 1) % slides.length);

  return (
    <div className="hero">
      {slides.map((s, i) => (
        <div key={i} className={`hero-slide${i === current ? ' active' : ''}`}>
          <div className="hero-slide-bg" style={{ background: s.bgColor }} />

          {imgLoaded[i] && (
            <div
              className="hero-slide-bg"
              style={{
                backgroundImage: `url(${s.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
              }}
            />
          )}

          <div className="hero-slide-overlay" style={{ background: s.overlay }} />

          <div style={{
            position:'absolute', width:500, height:500, borderRadius:'50%',
            background:`radial-gradient(circle,${s.accent}22 0%,transparent 70%)`,
            top:-140, right:-80, pointerEvents:'none',
            animation:'heroFloat 9s ease-in-out infinite',
          }}/>
          <div style={{
            position:'absolute', width:260, height:260, borderRadius:'50%',
            background:'radial-gradient(circle,rgba(255,122,0,0.1) 0%,transparent 70%)',
            bottom:-40, left:'10%', pointerEvents:'none',
            animation:'heroFloat 12s ease-in-out infinite reverse',
          }}/>

          <div className="hero-slide-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"/>
              {s.badge}
            </div>
            <h1>{s.title}</h1>
            <p>{s.sub}</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => navigate('quote')}>
                <FileText size={17}/> Get Free Quote
              </button>
              <button className="btn-outline" onClick={() => navigate('tracking')}>
                <Search size={17}/> Track Assignment
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="num">12K<em>+</em></div><div className="lbl">Assignments Done</div></div>
              <div className="hero-stat"><div className="num">98<em>%</em></div><div className="lbl">Satisfaction Rate</div></div>
              <div className="hero-stat"><div className="num">150<em>+</em></div><div className="lbl">Subject Experts</div></div>
              <div className="hero-stat"><div className="num">24<em>/7</em></div><div className="lbl">Support</div></div>
            </div>
          </div>
        </div>
      ))}

      <div className="hero-controls">
        {slides.map((_, i) => (
          <button key={i} className={`hero-dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)} aria-label={`Slide ${i+1}`}/>
        ))}
      </div>

      <div className="hero-arrows">
        <button className="hero-arrow" onClick={prev}><ChevronLeft size={20}/></button>
        <button className="hero-arrow" onClick={next}><ChevronRight size={20}/></button>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
