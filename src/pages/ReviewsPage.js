import React, { useState } from 'react';
import Footer from '../components/Footer';
import { Send } from 'lucide-react';

const reviews = [
  { initials:'TM', bg:'#0F52BA', name:'T.M.', level:"Master's Student", country:'🇲🇾 Malaysia', service:'Thesis Structure & Development', stars:5, text:'Support with my master\'s thesis was organised and easy to follow. The chapters were aligned with my research objectives, and the recommendations helped me respond to my supervisor\'s comments more confidently.' },
  { initials:'PR', bg:'#7C3AED', name:'P.R.', level:'Postgraduate Researcher', country:'🇰🇪 Kenya', service:'SPSS Data Analysis', stars:5, text:'I had collected my questionnaire data but was unsure which statistical tests to use. The dataset was cleaned, the analysis was conducted in SPSS, and every table was explained in clear academic language.' },
  { initials:'AO', bg:'#DC2626', name:'A.O.', level:'Doctoral Candidate', country:'🇳🇬 Nigeria', service:'Dissertation Corrections', stars:5, text:'My dissertation had extensive examiner corrections covering several chapters. Each comment was addressed systematically without unnecessarily rewriting the entire study. The correction matrix was also completed clearly.' },
  { initials:'SN', bg:'#0D9488', name:'S.N.', level:'Qualitative Researcher', country:'🇸🇬 Singapore', service:'NVivo Thematic Analysis', stars:5, text:'The NVivo analysis was detailed and well organised. The interview responses were coded into meaningful themes and subthemes, with relevant participant quotations included in the findings.' },
  { initials:'WC', bg:'#FF7A00', name:'W.C.', level:'Business Student', country:'🇭🇰 Hong Kong', service:'Excel Analysis & Presentation', stars:5, text:'I needed my raw Excel data converted into clear tables, charts, and summaries. The final analysis was accurate, professionally arranged, and much easier to present in my report.' },
  { initials:'FK', bg:'#16a34a', name:'F.K.', level:"Master's Student", country:'🇮🇩 Indonesia', service:'Literature Review Support', stars:5, text:'The literature review was well structured around the study objectives rather than being a collection of unrelated summaries. The research gaps were clearly identified, and the sources were properly referenced.' },
  { initials:'BM', bg:'#6D28D9', name:'B.M.', level:'Undergraduate Researcher', country:'🇹🇿 Tanzania', service:'Research Proposal Assistance', stars:5, text:'My proposal initially lacked a clear connection between the problem statement, objectives, questions, and methodology. The guidance helped strengthen the alignment and made the proposal much more coherent.' },
  { initials:'LT', bg:'#0891B2', name:'L.T.', level:'University Student', country:'🇻🇳 Vietnam', service:'Academic Editing & Proofreading', stars:5, text:'The editing improved the grammar, academic tone, paragraph flow, and referencing without changing the original meaning of my work. The document became clearer and more professional.' },
  { initials:'AM', bg:'#BE185D', name:'A.M.', level:'Nursing Student', country:'🇵🇭 Philippines', service:'Nursing Assignment Support', stars:5, text:'The nursing paper followed the instructions closely and used relevant academic evidence. The discussion connected theory with clinical practice and was presented in a clear, professional style.' },
  { initials:'JK', bg:'#EA580C', name:'J.K.', level:'MBA Student', country:'🇹🇭 Thailand', service:'Business Case Study', stars:5, text:'The case study went beyond describing the company. It applied the required business models, evaluated the organisation\'s challenges, and provided practical recommendations supported by evidence.' },
  { initials:'EO', bg:'#475569', name:'E.O.', level:'Engineering Student', country:'🇬🇭 Ghana', service:'Engineering Report Assistance', stars:5, text:'The technical report was well organised, with clear calculations, tables, figures, and explanations. Corrections were also completed promptly after I received additional comments from my lecturer.' },
  { initials:'CW', bg:'#0F52BA', name:'C.W.', level:'Postgraduate Student', country:'🇨🇳 China', service:'Referencing & Formatting', stars:5, text:'My document had inconsistent citations, table formats, headings, and reference entries. Everything was standardised according to APA 7th edition, and the final document looked professionally prepared.' },
  { initials:'RN', bg:'#7C3AED', name:'R.N.', level:'Research Student', country:'🇯🇵 Japan', service:'Timely Revision Support', stars:5, text:'What impressed me most was the responsiveness after delivery. My supervisor requested several small changes, and the revisions were handled carefully while maintaining consistency across the document.' },
  { initials:'KS', bg:'#16a34a', name:'K.S.', level:'Doctoral Researcher', country:'🇰🇷 South Korea', service:'Mixed-Methods Research Support', stars:5, text:'I received support with both the quantitative survey analysis and qualitative interview findings. The two sets of results were presented separately and then integrated clearly in the discussion.' },
  { initials:'YA', bg:'#DC2626', name:'Y.A.', level:'Undergraduate Student', country:'🇺🇬 Uganda', service:'Essay Editing', stars:5, text:'The essay was improved significantly in terms of argument, structure, transitions, and use of evidence. The feedback also helped me understand where my original draft needed strengthening.' },
];

const serviceFilters = ['All','Thesis','Dissertation','Data Analysis','Essay','Case Study','Research Proposal','Editing','Nursing','Engineering'];

function StarRating({ count, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{display:'flex',gap:4}}>
      {[1,2,3,4,5].map(n=>(
        <span key={n} style={{fontSize:26,cursor:'pointer',color:n<=(hover||count)?'#FFB300':'#ddd',transition:'color 0.1s'}}
          onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)} onClick={()=>onChange(n)}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsPage({ navigate }) {
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ name:'', level:'', country:'', service:'', rating:5, text:'' });
  const [submitted, setSubmitted] = useState(false);

  const filtered = filter==='All' ? reviews : reviews.filter(r=>r.service.toLowerCase().includes(filter.toLowerCase()));
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  return (
    <div>
      <div className="page-hero">
        <div className="section-label">Client Testimonials</div>
        <h1>What Our Clients Say</h1>
        <p>Committed to clear communication, subject-specific guidance, timely delivery, and responsive revision support.</p>
        <div className="review-stats">
          <div><div className="rs-val">4.9<em>/5</em></div><div className="rs-lbl">Average Rating</div></div>
          <div><div className="rs-val">6,000<em>+</em></div><div className="rs-lbl">Happy Clients</div></div>
          <div><div className="rs-val">98<em>%</em></div><div className="rs-lbl">Would Recommend</div></div>
        </div>
      </div>

      <section style={{padding:'72px 5%'}}>
        {/* Filter bar */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:36}}>
          {serviceFilters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:'7px 15px',borderRadius:20,border:`1.5px solid ${filter===f?'var(--blue)':'var(--border)'}`,
                background:filter===f?'var(--blue)':'#fff',color:filter===f?'#fff':'var(--text-muted)',
                fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.2s',fontFamily:'Inter,sans-serif'}}>
              {f}
            </button>
          ))}
        </div>

        <div className="reviews-grid">
          {filtered.map((r,i)=>(
            <div className="review-card" key={i}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}}>
                <div className="review-avatar" style={{background:r.bg,flexShrink:0}}>{r.initials}</div>
                <div style={{flex:1}}>
                  <div className="review-stars">{'★'.repeat(r.stars)}</div>
                  <div style={{fontWeight:700,fontSize:14}}>{r.name}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)'}}>{r.level} · {r.country}</div>
                </div>
                <span style={{fontSize:10,fontWeight:700,background:'var(--gray)',color:'var(--text-muted)',padding:'3px 8px',borderRadius:5,whiteSpace:'nowrap'}}>{r.service}</span>
              </div>
              <p style={{fontSize:13.5,color:'var(--text-muted)',lineHeight:1.72}}>{r.text}</p>
            </div>
          ))}
        </div>

        {/* Submit a Review */}
        <div style={{marginTop:60,background:'var(--gray)',borderRadius:20,padding:'40px'}}>
          <div style={{textAlign:'center',marginBottom:32}}>
            <div className="section-label text-center">Share Your Experience</div>
            <h2 className="section-title text-center">Leave a Review</h2>
            <p style={{color:'var(--text-muted)',fontSize:14,maxWidth:500,margin:'0 auto'}}>Have you received support from our team? Your feedback helps other students make informed decisions.</p>
          </div>
          {submitted ? (
            <div style={{textAlign:'center',padding:'32px'}}>
              <div style={{fontSize:48,marginBottom:12}}>🙏</div>
              <h3 style={{fontFamily:'Sora,sans-serif',fontSize:'1.2rem',fontWeight:700,marginBottom:8}}>Thank You for Your Feedback!</h3>
              <p style={{color:'var(--text-muted)',fontSize:14}}>Your review has been submitted and will be published after verification.</p>
            </div>
          ) : (
            <div style={{maxWidth:620,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="form-group"><label>Your Name or Initials</label><input type="text" placeholder="e.g. J.K. or James" value={form.name} onChange={set('name')}/></div>
              <div className="form-group"><label>Academic Level</label>
                <select value={form.level} onChange={set('level')}>
                  {['Select...','Undergraduate','Master\'s Student','Doctoral Candidate','Postgraduate Researcher','Professional'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Country</label><input type="text" placeholder="e.g. Malaysia" value={form.country} onChange={set('country')}/></div>
              <div className="form-group"><label>Service Received</label><input type="text" placeholder="e.g. Dissertation Support" value={form.service} onChange={set('service')}/></div>
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label>Your Rating</label>
                <StarRating count={form.rating} onChange={v=>setForm(f=>({...f,rating:v}))}/>
              </div>
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label>Your Experience (50–150 words)</label>
                <textarea placeholder="Describe your experience with our academic support team..." value={form.text} onChange={set('text')} style={{minHeight:100}}/>
              </div>
              <div style={{gridColumn:'span 2',textAlign:'center'}}>
                <button className="btn-primary" style={{padding:'13px 40px'}} onClick={()=>{if(form.name&&form.text)setSubmitted(true);}}>
                  <Send size={16}/> Submit Review
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer navigate={navigate}/>
    </div>
  );
}
