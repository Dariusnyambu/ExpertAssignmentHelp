import React, { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import OrderStatusSlider from '../components/OrderStatusSlider';
import Footer from '../components/Footer';
import {
  ShieldCheck, GraduationCap, Clock3, BadgeDollarSign, Lock, RefreshCw, CreditCard, Headset,
  PencilLine, BookOpen, FlaskConical, Presentation, MonitorCheck, ClipboardList, SpellCheck,
  FileText, Star, ChevronDown, MessageCircle,
  UploadCloud, PlayCircle, SearchCheck, CheckCircle2,
  BarChart3, MessagesSquare,
} from 'lucide-react';

const sampleItems = [
  { label:'PhD Theses', color:'#7C3AED', Icon: GraduationCap },
  { label:"Master's Dissertations", color:'#0F52BA', Icon: BookOpen },
  { label:'Undergraduate Projects', color:'#16a34a', Icon: ClipboardList },
  { label:'Research Proposals', color:'#0891B2', Icon: FlaskConical },
  { label:'Essays & Papers', color:'#FF7A00', Icon: PencilLine },
  { label:'Case Studies', color:'#BE185D', Icon: BarChart3 },
  { label:'Data Analysis', color:'#6D28D9', Icon: MessagesSquare },
  { label:'Editing Samples', color:'#475569', Icon: SpellCheck },
];

function SamplesPreviewGrid({ navigate }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,maxWidth:960,margin:'0 auto 32px'}}>
      {sampleItems.map(({label, color, Icon}) => (
        <div key={label} onClick={() => navigate('samples')}
          style={{background:'#fff',border:'1.5px solid var(--border)',borderRadius:12,padding:'20px 16px',
            textAlign:'center',cursor:'pointer',transition:'all 0.22s',display:'flex',flexDirection:'column',alignItems:'center',gap:10}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.08)'}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
          <div style={{width:48,height:48,borderRadius:12,background:`${color}15`,color,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Icon size={24}/>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:'var(--text)',lineHeight:1.3}}>{label}</div>
        </div>
      ))}
    </div>
  );
}

const features = [
  { icon:ShieldCheck, color:'blue', title:'100% Original Work', desc:'Every assignment is written from scratch with full Turnitin-proof plagiarism-free guarantees included.' },
  { icon:GraduationCap, color:'orange', title:'Qualified Experts', desc:"Master's and PhD-level writers with verified credentials across 150+ academic subjects worldwide." },
  { icon:Clock3, color:'blue', title:'On-Time Delivery', desc:'We guarantee delivery before your deadline — even for urgent 3-hour orders. Never late.' },
  { icon:BadgeDollarSign, color:'orange', title:'Affordable Pricing', desc:'Competitive rates tailored for students. Transparent pricing with zero hidden charges ever.' },
  { icon:Lock, color:'blue', title:'100% Confidential', desc:'Your identity and order details are fully protected with enterprise-grade encryption at all times.' },
  { icon:RefreshCw, color:'orange', title:'Unlimited Revisions', desc:"Not satisfied? Request as many revisions as you need until you're completely happy — free." },
  { icon:CreditCard, color:'blue', title:'Secure Payments', desc:'Credit/Debit Card, PayPal, and Bank Transfer — all payments fully secured with buyer protection.' },
  { icon:Headset, color:'orange', title:'24/7 Support', desc:'Our team is available around the clock via live chat, WhatsApp, and email — always.' },
];

const services = [
  { icon:PencilLine, color:'blue', title:'Essay Writing', sub:'All types & levels' },
  { icon:BookOpen, color:'orange', title:'Assignments', sub:'Any subject & format' },
  { icon:GraduationCap, color:'blue', title:'Dissertation', sub:'Full thesis support' },
  { icon:FlaskConical, color:'orange', title:'Research Papers', sub:'Peer-review quality' },
  { icon:Presentation, color:'blue', title:'Presentations', sub:'PPT & Prezi design' },
  { icon:MonitorCheck, color:'orange', title:'Online Classes', sub:'Full semester support' },
  { icon:ClipboardList, color:'blue', title:'Case Studies', sub:'Deep analysis' },
  { icon:SpellCheck, color:'orange', title:'Proofreading', sub:'Edit & polish' },
];

const stats = [
  { num:'12,000', sup:'+', label:'Assignments Completed' },
  { num:'6,000', sup:'+', label:'Happy Students' },
  { num:'150', sup:'+', label:'Subject Experts' },
  { num:'98', sup:'%', label:'Satisfaction Rate' },
];

const steps = [
  { icon:UploadCloud, num:1, title:'Submit Requirements', desc:'Fill in your details' },
  { icon:FileText, num:2, title:'Receive Quote', desc:'Free instant quote', highlight:true },
  { icon:CreditCard, num:3, title:'Secure Payment', desc:'Multiple options' },
  { icon:PlayCircle, num:4, title:'Project Starts', desc:'Expert assigned' },
  { icon:SearchCheck, num:5, title:'Quality Review', desc:'QA team checks' },
  { icon:CheckCircle2, num:6, title:'Delivered', desc:'Before deadline' },
];

const reviews = [
  { initials:'TM', bg:'#0F52BA', name:'T.M.', country:'🇲🇾 Malaysia · Master\'s', service:'Thesis Structure', text:'Support with my master\'s thesis was organised and easy to follow. The chapters were aligned with my research objectives, and recommendations helped me respond to my supervisor\'s comments more confidently.'},
  { initials:'AM', bg:'#DC2626', name:'A.M.', country:'🇵🇭 Philippines · Nursing', service:'Nursing Assignment', text:'The nursing paper followed the instructions closely and used relevant academic evidence. The discussion connected theory with clinical practice and was presented in a clear, professional style.' },
  { initials:'JK', bg:'#FF7A00', name:'J.K.', country:'🇹🇭 Thailand · MBA', service:'Business Case Study', text:'The case study went beyond describing the company. It applied required business models, evaluated challenges, and provided practical recommendations supported by strong academic evidence.' },
];

const faqs = [
  { q:'Is my order kept confidential?', a:'Absolutely. We use end-to-end encryption and never share your personal information or order details with any third party. Your identity remains completely anonymous throughout the entire process. Your academic institution will never know you used our service.' },
  { q:"What if I'm not satisfied with the work?", a:'We offer unlimited free revisions until you are fully satisfied with the quality. If the work does not meet the agreed requirements, our QA team will correct it promptly. We also offer a full refund in rare cases where we fail to meet your agreed specifications.' },
  { q:'How do I track my assignment progress?', a:"After placing your order you'll receive a unique tracking ID. Visit our Track Order page and enter your ID to see real-time status updates. You can also log into your client dashboard for detailed progress and direct communication with your writer." },
  { q:'What payment methods do you accept?', a:'We accept Credit/Debit Card (Visa, Mastercard, Amex), PayPal, and Bank Transfer. All payments are fully secured and protected. Contact us if you need help choosing the right payment method for your country.' },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open?' open':''}`}>
      <button className="faq-q" onClick={()=>setOpen(o=>!o)}>{q}<ChevronDown size={20} className="faq-chevron"/></button>
      <div className="faq-a"><p>{a}</p></div>
    </div>
  );
}

export default function HomePage({ navigate }) {
  return (
    <div>
      <HeroSlider navigate={navigate}/>

      {/* SERVICES */}
      <section className="services-section">
        <div className="section-label">What We Offer</div>
        <h2 className="section-title">Academic Services Tailored to You</h2>
        <div className="services-grid">
          {services.map((s,i)=>(
            <div className="service-card" key={i} onClick={()=>navigate('services')}>
              <div className={`sc-icon fc-icon ${s.color}`}><s.icon size={26}/></div>
              <h4>{s.title}</h4><p>{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ORDER STATUS SLIDER */}
      <OrderStatusSlider/>

      {/* WHY CHOOSE US */}
      <section className="why-section">
        <div className="section-label text-center">Why Students Trust Us</div>
        <h2 className="section-title text-center">Why Choose Ark Expert Researchers?</h2>
        <div className="features-grid">
          {features.map((f,i)=>(
            <div className="feature-card" key={i}>
              <div className={`fc-icon ${f.color}`}><f.icon size={24}/></div>
              <h4>{f.title}</h4><p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="stats-section">
        <div className="stats-grid">
          {stats.map((s,i)=>(<div className="stat-item" key={i}><div className="num">{s.num}<em>{s.sup}</em></div><div className="lbl">{s.label}</div></div>))}
        </div>
      </div>

      {/* FREE FEATURES STRIP */}
      <section style={{background:'linear-gradient(135deg,#0a1931 0%,#0F52BA 100%)',padding:'48px 5%'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div className="section-label" style={{color:'#FFB347',justifyContent:'center',display:'flex'}}>Included With Every Order</div>
          <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:800,color:'#fff',marginBottom:8}}>
            What You Get — <span style={{color:'#FFB347'}}>Absolutely Free</span>
          </h2>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:15,maxWidth:520,margin:'0 auto'}}>
            Every client at Ark Expert Researchers gets these premium extras at no extra cost.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20,maxWidth:900,margin:'0 auto'}}>
          {[
            { icon:'📊', title:'Free SPSS Analysis', desc:'Full statistical analysis using SPSS included with your research project — no extra charge.' },
            { icon:'💬', title:'Free Consultation', desc:'Get a free expert consultation before placing your order. We help you clarify requirements and scope.' },
            { icon:'📚', title:'Free Referencing', desc:'Proper citations in APA, Harvard, MLA, Chicago, or any other style — formatted for you at no cost.' },
          ].map((f,i) => (
            <div key={i} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:16,padding:'28px 24px',textAlign:'center',transition:'all 0.25s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.12)';e.currentTarget.style.transform='translateY(-4px)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)';e.currentTarget.style.transform='translateY(0)'}}>
              <div style={{fontSize:40,marginBottom:14}}>{f.icon}</div>
              <div style={{fontFamily:'Sora,sans-serif',fontSize:16,fontWeight:700,color:'#fff',marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13.5,color:'rgba(255,255,255,0.62)',lineHeight:1.65}}>{f.desc}</div>
              <div style={{marginTop:14,display:'inline-block',background:'rgba(255,179,71,0.15)',border:'1px solid rgba(255,179,71,0.3)',borderRadius:20,padding:'4px 14px',fontSize:12,fontWeight:700,color:'#FFB347'}}>FREE</div>
            </div>
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="workflow-section">
        <div className="section-label text-center">How It Works</div>
        <h2 className="section-title text-center">6 Simple Steps to Academic Success</h2>
        <div className="workflow-steps">
          {steps.map((s,i)=>(<div className={`step${s.highlight?' highlight':''}`} key={i}><div className="step-circle">{s.num}</div><h4>{s.title}</h4><p>{s.desc}</p></div>))}
        </div>
      </section>

      {/* SUBJECTS PREVIEW */}
      <section style={{padding:'72px 5%',background:'var(--gray)'}}>
        <div className="section-label text-center">Academic Coverage</div>
        <h2 className="section-title text-center">30+ Subjects Covered</h2>
        <p className="section-sub text-center mx-auto" style={{marginBottom:32}}>From nursing to computer science, law to data analytics — our specialists cover every major discipline.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center',maxWidth:900,margin:'0 auto 32px'}}>
          {['Nursing','Business','Law','Computer Science','Psychology','Engineering','Accounting','Finance','Marketing','Economics','Education','Medicine','Data Science','Architecture','Public Health','HRM','Sociology','Mathematics','Chemistry','Biology'].map(s=>(
            <span key={s} onClick={()=>navigate('subjects')} style={{padding:'8px 16px',borderRadius:20,background:'#fff',border:'1.5px solid var(--border)',fontSize:13,fontWeight:600,color:'var(--text)',cursor:'pointer',transition:'all 0.2s'}}
              onMouseEnter={e=>{e.target.style.borderColor='var(--blue)';e.target.style.color='var(--blue)'}}
              onMouseLeave={e=>{e.target.style.borderColor='var(--border)';e.target.style.color='var(--text)'}}>
              {s}
            </span>
          ))}
        </div>
        <div style={{textAlign:'center'}}><button className="btn-primary" onClick={()=>navigate('subjects')}>View All 30 Subjects</button></div>
      </section>

      {/* REVIEWS */}
      <section className="reviews-section">
        <div className="section-label text-center">Client Testimonials</div>
        <h2 className="section-title text-center">What Our Clients Say</h2>
        <div className="reviews-grid">
          {reviews.map((r,i)=>(
            <div className="review-card" key={i}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <div className="review-avatar" style={{background:r.bg}}>{r.initials}</div>
                <div>
                  <div className="review-stars">★★★★★</div>
                  <div style={{fontWeight:700,fontSize:14}}>{r.name}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>{r.country}</div>
                </div>
                <span style={{marginLeft:'auto',fontSize:10,fontWeight:700,background:'var(--gray)',color:'var(--text-muted)',padding:'3px 8px',borderRadius:5}}>{r.service}</span>
              </div>
              <p style={{fontSize:13.5,color:'var(--text-muted)',lineHeight:1.7}}>{r.text}</p>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',marginTop:28}}><button className="btn-primary" onClick={()=>navigate('reviews')}><Star size={16}/> View All Reviews</button></div>
      </section>

      {/* SAMPLES PREVIEW */}
      <section style={{padding:'72px 5%'}}>
        <div className="section-label text-center">Work Portfolio</div>
        <h2 className="section-title text-center">Browse Our Academic Samples</h2>
        <p className="section-sub text-center mx-auto" style={{marginBottom:36}}>See the quality before you order. Anonymised samples across PhD, Master's, undergraduate levels and all service types.</p>
        <SamplesPreviewGrid navigate={navigate}/>
        <div style={{textAlign:'center'}}><button className="btn-primary" onClick={()=>navigate('samples')}>Browse All Samples</button></div>
      </section>

      {/* FAQ */}
      <section className="faq-section" style={{background:'var(--gray)'}}>
        <div className="section-label text-center">Got Questions?</div>
        <h2 className="section-title text-center">Frequently Asked Questions</h2>
        <div className="faq-list">{faqs.map((f,i)=><FAQ key={i} q={f.q} a={f.a}/>)}</div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Ace Your Assignment?</h2>
        <p>Join 6,000+ students who've trusted Ark Expert Researchers with their academic success</p>
        <div className="cta-btns">
          <button className="btn-primary" style={{background:'#fff',color:'var(--orange)'}} onClick={()=>navigate('quote')}><FileText size={17}/> Get Free Quote</button>
          <button className="btn-outline" onClick={()=>navigate('contact')}><MessageCircle size={17}/> Chat with Us</button>
        </div>
      </section>

      <Footer navigate={navigate}/>
    </div>
  );
}
