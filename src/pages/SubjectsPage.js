import React, { useState } from 'react';
import Footer from '../components/Footer';
import { BriefcaseBusiness, Wallet, LineChart, Code2, Sigma, BarChart3, Cog, HeartPulse, Stethoscope, Brain, Scale, Dna, FlaskConical, DraftingCompass, BookOpen, Globe, Leaf, Users, Landmark, ShoppingBag, GraduationCap } from 'lucide-react';

const subjects = [
  { icon:Wallet, title:'Accounting', desc:'Financial statements, auditing, management accounting, taxation, and forensic accounting assignments.', color:'#0F52BA', bg:'rgba(15,82,186,0.08)' },
  { icon:Leaf, title:'Agriculture & Agribusiness', desc:'Farm management, agri-supply chains, food systems, rural development, and environmental sustainability.', color:'#16a34a', bg:'rgba(22,163,74,0.08)' },
  { icon:DraftingCompass, title:'Architecture & Built Environment', desc:'Design proposals, urban planning, construction management, sustainable architecture, and BIM.', color:'#EA580C', bg:'rgba(234,88,12,0.08)' },
  { icon:Dna, title:'Biology & Life Sciences', desc:'Cell biology, genetics, ecology, microbiology, biotechnology, and laboratory reports.', color:'#16a34a', bg:'rgba(22,163,74,0.08)' },
  { icon:BriefcaseBusiness, title:'Business & Management', desc:'Strategy, organisational behaviour, leadership, operations, entrepreneurship, and MBA-level research.', color:'#0F52BA', bg:'rgba(15,82,186,0.08)' },
  { icon:FlaskConical, title:'Chemistry', desc:'Organic, inorganic, physical, and analytical chemistry — lab reports, essays, and research papers.', color:'#7C3AED', bg:'rgba(124,58,237,0.08)' },
  { icon:Globe, title:'Communication & Media Studies', desc:'Journalism, public relations, digital media, film studies, and communication theory assignments.', color:'#0891B2', bg:'rgba(8,145,178,0.08)' },
  { icon:Code2, title:'Computer Science & IT', desc:'Programming, algorithms, software engineering, cybersecurity, AI, machine learning, and database systems.', color:'#0F52BA', bg:'rgba(15,82,186,0.08)' },
  { icon:Scale, title:'Criminology & Criminal Justice', desc:'Crime theories, policing, victimology, forensic science, criminal law, and penology.', color:'#DC2626', bg:'rgba(220,38,38,0.08)' },
  { icon:BarChart3, title:'Data Science & Business Analytics', desc:'Statistical modelling, Python, R, SPSS, NVivo, machine learning projects, and data visualisation.', color:'#6D28D9', bg:'rgba(109,40,217,0.08)' },
  { icon:LineChart, title:'Economics', desc:'Micro and macroeconomics, econometrics, development economics, game theory, and policy analysis.', color:'#FF7A00', bg:'rgba(255,122,0,0.08)' },
  { icon:GraduationCap, title:'Education', desc:'Curriculum design, educational psychology, pedagogy, TESOL, inclusive education, and school leadership.', color:'#0891B2', bg:'rgba(8,145,178,0.08)' },
  { icon:Cog, title:'Engineering', desc:'Civil, mechanical, electrical, chemical, and aerospace engineering projects, reports, and technical analysis.', color:'#475569', bg:'rgba(71,85,105,0.08)' },
  { icon:BookOpen, title:'English Language & Literature', desc:'Literary analysis, creative writing, linguistics, discourse analysis, and text-based research papers.', color:'#7C3AED', bg:'rgba(124,58,237,0.08)' },
  { icon:Leaf, title:'Environmental Science', desc:'Climate change, environmental impact assessments, conservation, pollution, and sustainability research.', color:'#16a34a', bg:'rgba(22,163,74,0.08)' },
  { icon:Wallet, title:'Finance & Banking', desc:'Corporate finance, investment analysis, risk management, derivatives, financial modelling, and fintech.', color:'#0F52BA', bg:'rgba(15,82,186,0.08)' },
  { icon:Globe, title:'Geography & Development Studies', desc:'Human and physical geography, GIS, regional development, international aid, and urbanisation.', color:'#0D9488', bg:'rgba(13,148,136,0.08)' },
  { icon:HeartPulse, title:'Healthcare Management', desc:'Health policy, hospital administration, healthcare quality, public health systems, and leadership.', color:'#DC2626', bg:'rgba(220,38,38,0.08)' },
  { icon:ShoppingBag, title:'Hospitality & Tourism', desc:'Hotel management, tourism marketing, event planning, sustainability in tourism, and service quality.', color:'#FF7A00', bg:'rgba(255,122,0,0.08)' },
  { icon:Users, title:'Human Resource Management', desc:'Talent management, employee relations, HRM strategies, training & development, and OD.', color:'#0F52BA', bg:'rgba(15,82,186,0.08)' },
  { icon:Scale, title:'Law', desc:'Contract law, criminal law, human rights, commercial law, constitutional law, and legal research papers.', color:'#7C3AED', bg:'rgba(124,58,237,0.08)' },
  { icon:ShoppingBag, title:'Marketing', desc:'Digital marketing, consumer behaviour, branding, market research, advertising, and CRM.', color:'#FF7A00', bg:'rgba(255,122,0,0.08)' },
  { icon:Sigma, title:'Mathematics & Statistics', desc:'Pure maths, applied maths, SPSS, statistical analysis, probability theory, and quantitative research.', color:'#0891B2', bg:'rgba(8,145,178,0.08)' },
  { icon:Stethoscope, title:'Medicine', desc:'Clinical case studies, pharmacology, anatomy, pathology, medical ethics, and research methodology.', color:'#DC2626', bg:'rgba(220,38,38,0.08)' },
  { icon:HeartPulse, title:'Nursing', desc:'Nursing care plans, clinical reflections, evidence-based practice, pharmacology, and NMC standards.', color:'#DC2626', bg:'rgba(220,38,38,0.08)' },
  { icon:BookOpen, title:'Philosophy & Ethics', desc:'Moral philosophy, applied ethics, epistemology, political philosophy, and critical thinking papers.', color:'#6D28D9', bg:'rgba(109,40,217,0.08)' },
  { icon:Landmark, title:'Political Science & IR', desc:'Comparative politics, international relations, diplomacy, foreign policy, and global governance.', color:'#0F52BA', bg:'rgba(15,82,186,0.08)' },
  { icon:Brain, title:'Psychology', desc:'Clinical, cognitive, developmental, social, forensic, and organisational psychology assignments and research.', color:'#7C3AED', bg:'rgba(124,58,237,0.08)' },
  { icon:HeartPulse, title:'Public Health & Epidemiology', desc:'Epidemiology, health promotion, disease prevention, global health policy, and biostatistics.', color:'#16a34a', bg:'rgba(22,163,74,0.08)' },
  { icon:Users, title:'Sociology & Social Work', desc:'Social theory, social research methods, community development, welfare policy, and social inequality.', color:'#0D9488', bg:'rgba(13,148,136,0.08)' },
];

export default function SubjectsPage({ navigate }) {
  const [search, setSearch] = useState('');
  const filtered = subjects.filter(s=>s.title.toLowerCase().includes(search.toLowerCase())||s.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-hero">
        <div className="section-label">Academic Coverage</div>
        <h1>Subjects We Cover</h1>
        <p>Academic support across 30+ university disciplines — from undergraduate to doctoral level.</p>
        <div style={{marginTop:24,maxWidth:420,margin:'24px auto 0'}}>
          <input
            placeholder="🔍  Search a subject..."
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:'100%',padding:'12px 18px',borderRadius:10,border:'none',fontSize:15,fontFamily:'Inter,sans-serif',outline:'none',background:'rgba(255,255,255,0.12)',color:'#fff'}}
          />
        </div>
      </div>

      <section style={{padding:'72px 5%'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:18}}>
          {filtered.map((s,i)=>(
            <div key={i} className="feature-card" style={{cursor:'pointer'}} onClick={()=>navigate('quote')}>
              <div className="fc-icon" style={{background:s.bg,color:s.color}}><s.icon size={24}/></div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
              <div style={{marginTop:12,fontSize:12,fontWeight:600,color:s.color,display:'flex',alignItems:'center',gap:4}}>
                Get Help With This Subject →
              </div>
            </div>
          ))}
        </div>
        {filtered.length===0 && (
          <div style={{textAlign:'center',padding:'48px 0',color:'var(--text-muted)'}}>
            <div style={{fontSize:48,marginBottom:12}}>🔍</div>
            <p>No subjects found for "<strong>{search}</strong>". <span style={{color:'var(--blue)',cursor:'pointer'}} onClick={()=>navigate('contact')}>Contact us</span> — we cover almost everything!</p>
          </div>
        )}
        <div style={{textAlign:'center',marginTop:48}}>
          <p style={{color:'var(--text-muted)',marginBottom:16}}>Don't see your subject? We cover over 50 disciplines.</p>
          <button className="btn-primary" onClick={()=>navigate('quote')}>Get Help With Any Subject</button>
        </div>
      </section>
      <Footer navigate={navigate}/>
    </div>
  );
}
