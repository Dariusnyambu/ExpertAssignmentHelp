import React, { useState } from 'react';
import Footer from '../components/Footer';
import {
  GraduationCap, BookOpen, FileText, FlaskConical, PencilLine,
  ClipboardList, BarChart3, MessagesSquare, SpellCheck, FileSearch,
  Download, MessageCircle, ChevronRight,
} from 'lucide-react';

const WA_BASE = 'https://wa.me/14238908259?text=Hi%20Ark%20Expert%20Researchers%2C%20I%20would%20like%20to%20request%20a%20sample%20for%3A%20';

const downloadableSamples = [
  {
    file: '/samples/assignment-coursework.pdf',
    label: 'Assignment & Coursework Sample',
    category: 'Assignments & Coursework',
    icon: ClipboardList, color: '#EA580C', bg: 'rgba(234,88,12,0.09)',
    desc: 'A well-structured coursework submission demonstrating clear argument, proper referencing, and academic formatting to university standards.',
  },
  {
    file: '/samples/case-study-airbnb-mba.pdf',
    label: 'MBA Case Study — AirBnB Strategic Plan',
    category: 'Case Studies & Business Reports',
    icon: BarChart3, color: '#BE185D', bg: 'rgba(190,24,93,0.09)',
    desc: 'An MBA-level strategic business analysis applying SWOT, PESTLE, and Porter\'s Five Forces frameworks to a real-world company.',
  },
  {
    file: '/samples/data-analysis-social-media.pdf',
    label: 'Data Analysis — Social Media & Health Promotion',
    category: 'Data Analysis (SPSS / NVivo)',
    icon: MessagesSquare, color: '#6D28D9', bg: 'rgba(109,40,217,0.09)',
    desc: 'Quantitative and qualitative research data analysis on a social media health intervention, with full statistical results and interpretation.',
  },
  {
    file: '/samples/editing-proofreading-sample.pdf',
    label: 'Editing & Proofreading — Work-Family Conflict Study',
    category: 'Editing & Proofreading',
    icon: SpellCheck, color: '#475569', bg: 'rgba(71,85,105,0.09)',
    desc: 'Chapters 1–6 of a research project showing professional editing, improved academic tone, flow corrections, and referencing consistency.',
  },
  {
    file: '/samples/essay-academic-paper.pdf',
    label: 'Academic Essay Paper',
    category: 'Essays & Academic Papers',
    icon: PencilLine, color: '#FF7A00', bg: 'rgba(255,122,0,0.09)',
    desc: 'A well-argued, properly cited academic essay demonstrating strong thesis, logical structure, and critical analysis.',
  },
  {
    file: '/samples/masters-dissertation.pdf',
    label: "Master's Dissertation Sample",
    category: "Master's Dissertations",
    icon: BookOpen, color: '#0F52BA', bg: 'rgba(15,82,186,0.09)',
    desc: "A complete Master's-level dissertation with literature review, research methodology, findings, discussion, and recommendations.",
  },
  {
    file: '/samples/phd-research-paper.pdf',
    label: 'PhD Research Project',
    category: 'PhD / Doctoral',
    icon: GraduationCap, color: '#7C3AED', bg: 'rgba(124,58,237,0.09)',
    desc: 'A full doctoral-level research paper with advanced theoretical framework, mixed methodology, and scholarly analysis.',
  },
  {
    file: '/samples/research-instrument-questionnaire.pdf',
    label: 'Research Instrument — Survey Questionnaire',
    category: 'Research Instruments',
    icon: FileSearch, color: '#0D9488', bg: 'rgba(13,148,136,0.09)',
    desc: 'A professionally designed survey questionnaire aligned with study objectives, research questions, and variable measurement.',
  },
  {
    file: '/samples/research-proposal.pdf',
    label: 'Research Proposal Sample',
    category: 'Research Proposals',
    icon: FlaskConical, color: '#0891B2', bg: 'rgba(8,145,178,0.09)',
    desc: 'A complete research proposal including problem statement, research gap, objectives, questions, and proposed methodology.',
  },
  {
    file: '/samples/undergraduate-project.pdf',
    label: 'Undergraduate Project — Banking Customer Loyalty',
    category: 'Undergraduate Research Projects',
    icon: FileText, color: '#16a34a', bg: 'rgba(22,163,74,0.09)',
    desc: 'A final-year undergraduate research project with primary data collection, statistical analysis, and evidence-based recommendations.',
  },
];

const allCategories = [
  { icon:GraduationCap, color:'#7C3AED', bg:'rgba(124,58,237,0.09)', title:'PhD Theses & Doctoral Research',        desc:'Advanced doctoral research covering quantitative, qualitative, and mixed-methods studies with original contributions.' },
  { icon:BookOpen,       color:'#0F52BA', bg:'rgba(15,82,186,0.09)',   title:"Master's Theses & Dissertations",       desc:'Postgraduate-level research demonstrating a cohesive connection between problem, objectives, methodology, and findings.' },
  { icon:FileText,       color:'#16a34a', bg:'rgba(22,163,74,0.09)',   title:'Undergraduate Research Projects',       desc:'Final-year projects, capstone work, and undergraduate dissertations aligned with university requirements.' },
  { icon:FlaskConical,   color:'#0891B2', bg:'rgba(8,145,178,0.09)',   title:'Research Proposals & Concept Papers',   desc:'From a broad topic to a focused, academically defensible proposal with objectives, questions, and methodology.' },
  { icon:PencilLine,     color:'#FF7A00', bg:'rgba(255,122,0,0.09)',   title:'Essays & Academic Papers',              desc:'Well-structured essays — clear arguments, critical analysis, and properly supported conclusions.' },
  { icon:ClipboardList,  color:'#EA580C', bg:'rgba(234,88,12,0.09)',   title:'Assignments & Coursework',              desc:'Academic assignments completed to specific rubrics, word limits, and referencing requirements.' },
  { icon:BarChart3,      color:'#BE185D', bg:'rgba(190,24,93,0.09)',   title:'Case Studies & Business Reports',       desc:'SWOT, PESTLE, Porter\'s Five Forces and other frameworks applied to real-world organisations.' },
  { icon:MessagesSquare, color:'#6D28D9', bg:'rgba(109,40,217,0.09)', title:'Data Analysis — SPSS / NVivo',          desc:'Statistical analysis, qualitative coding, and data presentation with clear academic interpretation.' },
  { icon:FileSearch,     color:'#0D9488', bg:'rgba(13,148,136,0.09)', title:'Research Instruments',                  desc:'Questionnaires, interview guides, and data collection tools aligned with study variables.' },
  { icon:SpellCheck,     color:'#475569', bg:'rgba(71,85,105,0.09)',  title:'Editing & Proofreading Samples',        desc:'Grammar, academic tone, flow, and referencing improvements without changing original ideas.' },
];

export default function SamplesPage({ navigate }) {
  const [tab, setTab] = useState('downloads');

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div className="section-label">Work Portfolio</div>
        <h1>Academic Work Samples</h1>
        <p>Browse and download real anonymised samples across all academic levels, disciplines, and service types — completely free.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:28,flexWrap:'wrap'}}>
          {[['10+','Downloadable PDFs'],['100%','Anonymised'],['FREE','No Sign-up Needed']].map(([v,l]) => (
            <div key={l} style={{background:'rgba(255,255,255,0.08)',borderRadius:12,padding:'14px 24px',textAlign:'center'}}>
              <div style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800,color:v==='FREE'?'var(--orange)':'#fff'}}>{v}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.55)'}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{background:'var(--gray)',padding:'20px 5% 0',display:'flex',gap:4,borderBottom:'1px solid var(--border)'}}>
        {[['downloads','⬇️  Download Samples'],['categories','📂  All Categories']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{padding:'10px 20px',borderRadius:'8px 8px 0 0',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',
              fontWeight:600,fontSize:14,transition:'all 0.2s',
              background:tab===id?'#fff':'transparent',
              color:tab===id?'var(--blue)':'var(--text-muted)',
              borderBottom:tab===id?'2px solid var(--blue)':'2px solid transparent'}}>
            {label}
          </button>
        ))}
      </div>

      {/* DOWNLOADS TAB */}
      {tab === 'downloads' && (
        <section style={{padding:'56px 5%'}}>
          <div style={{marginBottom:36}}>
            <div className="section-label">10 Real Samples — One Per Category</div>
            <h2 className="section-title">Download & See Our Quality First</h2>
            <p className="section-sub">Click the orange button to download any PDF instantly. Use the green button to request a similar sample for your specific topic via WhatsApp.</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20,marginBottom:48}}>
            {downloadableSamples.map((s, i) => (
              <div key={i}
                style={{background:'#fff',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',transition:'all 0.25s'}}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 10px 30px rgba(15,82,186,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>

                <div style={{padding:'20px 20px 16px',flex:1}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
                    <div style={{width:44,height:44,borderRadius:11,background:s.bg,color:s.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <s.icon size={22}/>
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontSize:10,fontWeight:700,background:s.bg,color:s.color,padding:'2px 8px',borderRadius:5,display:'inline-block',marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>
                        {s.category}
                      </span>
                      <h3 style={{fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'var(--text)',lineHeight:1.35,margin:0}}>{s.label}</h3>
                    </div>
                  </div>
                  <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.65,margin:0}}>{s.desc}</p>
                </div>

                <div style={{padding:'14px 20px',display:'flex',gap:8,background:'var(--gray)',borderTop:'1px solid var(--border)'}}>
                  <a
                    href={s.file}
                    download
                    style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'10px 14px',borderRadius:9,
                      background:s.color,color:'#fff',textDecoration:'none',fontSize:13,fontWeight:700,fontFamily:'Inter,sans-serif'}}>
                    <Download size={15}/> Download PDF
                  </a>
                  <a
                    href={`${WA_BASE}${encodeURIComponent(s.label)}`}
                    target="_blank" rel="noopener noreferrer"
                    title="Request similar sample via WhatsApp"
                    style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px 16px',borderRadius:9,
                      background:'#25D366',color:'#fff',textDecoration:'none',fontSize:13,fontWeight:700,fontFamily:'Inter,sans-serif'}}>
                    <MessageCircle size={15}/> Request
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{background:'linear-gradient(135deg,#0A1931,#0F52BA)',borderRadius:20,padding:'40px',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:14}}>📁</div>
            <h3 style={{fontFamily:'Sora,sans-serif',fontSize:'1.3rem',fontWeight:700,color:'#fff',marginBottom:10}}>
              Need a Sample in a Different Subject or Format?
            </h3>
            <p style={{color:'rgba(255,255,255,0.65)',fontSize:14,maxWidth:480,margin:'0 auto 24px',lineHeight:1.7}}>
              We have more samples across 30+ subjects and all academic levels. Message us on WhatsApp and we'll send you a relevant sample within minutes — free.
            </p>
            <a
              href="https://wa.me/14238908259?text=Hi%20Ark%20Expert%20Researchers%2C%20I%20would%20like%20to%20request%20a%20specific%20sample"
              target="_blank" rel="noopener noreferrer"
              style={{display:'inline-flex',alignItems:'center',gap:10,background:'#25D366',color:'#fff',
                padding:'14px 28px',borderRadius:12,textDecoration:'none',fontSize:15,fontWeight:700,fontFamily:'Sora,sans-serif'}}>
              <MessageCircle size={20}/> Request a Sample on WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* CATEGORIES TAB */}
      {tab === 'categories' && (
        <section style={{padding:'56px 5%'}}>
          <div style={{marginBottom:36}}>
            <div className="section-label">Full Coverage</div>
            <h2 className="section-title">All Sample Categories</h2>
            <p className="section-sub">Click any category to request a sample for that type via WhatsApp — we'll send it within minutes.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:18}}>
            {allCategories.map((c, i) => (
              <div key={i}
                style={{background:'#fff',border:'1px solid var(--border)',borderRadius:14,padding:'22px',transition:'all 0.22s'}}
                onMouseEnter={e => { e.currentTarget.style.borderColor=c.color; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:10}}>
                  <div style={{width:44,height:44,borderRadius:11,background:c.bg,color:c.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <c.icon size={22}/>
                  </div>
                  <h3 style={{fontFamily:'Sora,sans-serif',fontSize:14,fontWeight:700,color:'var(--text)',lineHeight:1.35,margin:0}}>{c.title}</h3>
                </div>
                <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.65,margin:'0 0 14px'}}>{c.desc}</p>
                <a
                  href={`${WA_BASE}${encodeURIComponent(c.title)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,color:'#25D366',textDecoration:'none'}}>
                  <MessageCircle size={14}/> Request a Sample <ChevronRight size={13}/>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer navigate={navigate}/>
    </div>
  );
}
