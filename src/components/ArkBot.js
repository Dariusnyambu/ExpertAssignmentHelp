import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, ChevronDown } from 'lucide-react';

const WA = 'https://wa.me/14238908259?text=';

// ── Knowledge base: Ark knows everything about the platform ──
const ARK_SYSTEM = `
You are Ark, a friendly and knowledgeable academic assistant for Ark Expert Researchers.
Your job is to help students understand services, guide them to the right solution, and
convert enquiries into quote requests or WhatsApp chats. You are warm, professional, and
always helpful — you NEVER say "I don't know". If unsure, you suggest contacting the team.

ABOUT ARK EXPERT RESEARCHERS:
- Company: Ark Expert Researchers (formerly ExpertAssignmentHelp4U)
- Website: arkexpertresearch.com
- WhatsApp: +1 423 890 8259
- Emails: info@arkexpertresearch.com, hello@arkexpertresearch.com
- Social: @researchhelpark (X), @expertresearchhelpark (Instagram), TikTok: @ark.expert.resear
- Operating hours: 24/7, 365 days

SERVICES (all included):
1. Essay Writing — all types (argumentative, analytical, reflective, critical)
2. Dissertation & Thesis Writing — full support from proposal to final chapter
3. Research Papers — peer-review quality with proper methodology
4. Assignment Help — any subject, any level, any format
5. Coursework Help — structured to rubric and learning outcomes
6. Case Studies — business, medical, law (SWOT, PESTLE, Porter's, Balanced Scorecard)
7. Literature Reviews — critical synthesis of academic sources
8. Research Proposals & Concept Papers — PhD and Master's level
9. Data Analysis — SPSS (quantitative), NVivo (qualitative), Excel charts
10. Research Instruments — questionnaires, interview guides, data extraction forms
11. Presentations — PowerPoint and Prezi with speaker notes
12. Online Class Help — discussions, quizzes, assignments, full semester support
13. Editing & Proofreading — grammar, academic tone, referencing, flow
14. Dissertation Corrections — responding to examiner/supervisor comments

FREE EXTRAS (included with every order, no extra charge):
- Free SPSS Analysis (with qualifying research projects)
- Free Consultation (before placing order)
- Free Referencing (APA 7th, Harvard, MLA, Chicago, Vancouver, IEEE, OSCOLA, AGLC)
- Unlimited Revisions until fully satisfied
- Plagiarism-free guarantee (Turnitin-proof)

SUBJECTS (30+):
Accounting, Agriculture & Agribusiness, Architecture, Biology & Life Sciences,
Business & Management, Chemistry, Computer Science & IT, Criminology,
Data Science & Business Analytics, Economics, Education, Engineering (Civil, Mechanical,
Electrical, Chemical), English Literature, Environmental Science, Finance & Banking,
Geography, Healthcare Management, Hospitality & Tourism, HRM, Law, Marketing,
Mathematics & Statistics, Medicine, Nursing, Philosophy & Ethics, Political Science & IR,
Psychology, Public Health & Epidemiology, Sociology & Social Work, and more.

ACADEMIC LEVELS:
High School, Undergraduate (Year 1-2, Year 3-4), Postgraduate/Masters, PhD/Doctoral, Professional

QUALITY & GUARANTEES:
- 100% original, plagiarism-free work
- Written by PhD and Master's degree holders
- On-time delivery (even 3-hour urgent orders)
- 100% confidential — never shared with third parties
- Full money-back guarantee if requirements not met
- Unlimited free revisions

PAYMENT METHODS:
- Credit/Debit Card (Visa, Mastercard, Amex)
- PayPal
- Bank Transfer

TURNAROUND TIMES:
- Standard: 3–14 days depending on complexity
- Express: 24–48 hours available
- Urgent: As fast as 3 hours for short assignments

MARKETS SERVED:
Malaysia, Singapore, Hong Kong, Indonesia, Thailand, Philippines, China, Japan,
South Korea, Vietnam, UAE, Qatar, Saudi Arabia, Kuwait, Bahrain, Oman,
USA, Canada, Australia, UK, Kenya, Nigeria, Uganda, Tanzania, Ghana

PRICING:
Competitive and tailored for students. Price depends on academic level, word count,
subject complexity, and deadline. Get a free quote with no obligation.

ORDER PROCESS:
1. Submit requirements (via quote form or WhatsApp)
2. Receive a free quote within 30 minutes
3. Make secure payment (Card, PayPal, or Bank Transfer)
4. Project starts — expert writer assigned
5. Quality review by QA team
6. Delivered before your deadline
7. Request revisions if needed (free, unlimited)

TRACKING:
Every order gets a unique tracking ID (e.g. EAH-2847). Students can track progress
on the Track Order page in real time. Logged-in clients see all their orders in their dashboard.

SAMPLES:
10 downloadable PDF samples available free on the Samples page:
PhD research, Master's dissertation, Undergraduate project, MBA case study,
Essay, Research proposal, Research instrument, Data analysis, Editing, Coursework.
More samples available via WhatsApp on request.

CONTACT:
- WhatsApp: +1 423 890 8259 (fastest response)
- Email: info@arkexpertresearch.com
- Email: hello@arkexpertresearch.com

RESPONSE RULES:
- Always be positive, helpful, and encouraging
- Never say "I don't know" — always provide a helpful answer or suggest contacting the team
- For pricing: explain it depends on requirements, then direct to quote form or WhatsApp
- For urgent requests: reassure them and direct to WhatsApp immediately
- Keep responses concise (2–4 sentences max per message)
- Use line breaks to separate key points
- Always end with a clear next step (WhatsApp, quote form, or tracking page)
- If someone seems frustrated: empathise and immediately offer to connect them with a human
`;

// ── Quick-reply suggestions ──
const QUICK_REPLIES = [
  'What services do you offer?',
  'How much does it cost?',
  'Can you do it urgently?',
  'Is it plagiarism-free?',
  'What subjects do you cover?',
  'How do I place an order?',
  'Free SPSS analysis?',
  'Do you do dissertations?',
];

// ── Fallback local answers (used if API call fails) ──
function localAnswer(msg) {
  const m = msg.toLowerCase();
  if (m.includes('cost') || m.includes('price') || m.includes('how much') || m.includes('charge'))
    return "Pricing depends on your academic level, word count, subject, and deadline. Get a **free no-obligation quote** in 30 minutes! 👇\n\nYou can use the quote form on our website or chat directly with us on WhatsApp for an instant estimate.";
  if (m.includes('urgent') || m.includes('fast') || m.includes('asap') || m.includes('tonight') || m.includes('tomorrow'))
    return "Yes, we handle **urgent orders** — as fast as 3 hours for short assignments! ⚡\n\nFor the fastest response on urgent work, please reach us on WhatsApp right now and we'll mobilise an expert immediately.";
  if (m.includes('plagiar') || m.includes('original') || m.includes('turnitin'))
    return "Every assignment is **100% original**, written from scratch specifically for you. 🛡️\n\nWe guarantee plagiarism-free work — Turnitin-proof. You also get unlimited free revisions if anything needs adjusting.";
  if (m.includes('dissertation') || m.includes('thesis'))
    return "Yes! Dissertation and thesis support is one of our specialities. 🎓\n\nWe assist with everything — proposal, literature review, methodology, data analysis, findings, discussion, corrections, and the final chapter. PhD and Master's level.";
  if (m.includes('spss') || m.includes('data analysis') || m.includes('nvivo') || m.includes('statistic'))
    return "We offer **free SPSS analysis** included with qualifying research projects! 📊\n\nWe also do NVivo qualitative analysis, Excel data presentation, regression, descriptive statistics, and thematic analysis. Just tell us what you need.";
  if (m.includes('referen') || m.includes('citation') || m.includes('apa') || m.includes('harvard'))
    return "**Free referencing** is included with every order! 📚\n\nWe format citations in APA 7th, Harvard, MLA, Chicago, Vancouver, IEEE, OSCOLA, AGLC — any style your university requires, at no extra charge.";
  if (m.includes('subject') || m.includes('nursing') || m.includes('law') || m.includes('engineer') || m.includes('business') || m.includes('psycholog'))
    return "We cover **30+ academic subjects** including Nursing, Business, Law, Engineering, Computer Science, Psychology, Economics, Medicine, Education, Data Science, and many more. 🌐\n\nWhat subject do you need help with? I can confirm we cover it!";
  if (m.includes('confidential') || m.includes('secret') || m.includes('privacy') || m.includes('safe'))
    return "Your privacy is 100% protected. 🔒\n\nWe use encryption and never share your details with any third party. Your university or institution will never know you used our service. Everything is completely confidential.";
  if (m.includes('revision') || m.includes('not satisfied') || m.includes('change'))
    return "We offer **unlimited free revisions** until you are completely satisfied. ✅\n\nIf the work doesn't meet the agreed requirements, we correct it at no cost. In rare cases where we can't meet your specs, you get a full refund.";
  if (m.includes('payment') || m.includes('pay') || m.includes('card') || m.includes('paypal'))
    return "We accept **Credit/Debit Card** (Visa, Mastercard, Amex), **PayPal**, and **Bank Transfer**. 💳\n\nAll payments are fully secured. You only pay after receiving and approving your quote.";
  if (m.includes('track') || m.includes('progress') || m.includes('status') || m.includes('update'))
    return "Every order gets a unique **tracking ID** (e.g. EAH-2847). 📍\n\nVisit the Track Order page, enter your ID, and see your assignment's real-time progress — from submission through to delivery.";
  if (m.includes('sample') || m.includes('example') || m.includes('see your work'))
    return "We have **10 free downloadable samples** across different categories! 📁\n\nVisit our Samples page to download PDFs — PhD, Master's, undergraduate, case study, data analysis, and more. Or I can send specific samples via WhatsApp.";
  if (m.includes('free') || m.includes('what do i get') || m.includes('included'))
    return "Every order includes **free extras**: 🎁\n\n✅ Free SPSS Analysis\n✅ Free Referencing (any style)\n✅ Free Consultation\n✅ Unlimited Revisions\n✅ Plagiarism-free guarantee\n\nAll included, no hidden charges.";
  if (m.includes('contact') || m.includes('speak') || m.includes('talk') || m.includes('human') || m.includes('team'))
    return "You can reach our team 24/7! 🟢\n\n📱 WhatsApp: +1 423 890 8259\n📧 info@arkexpertresearch.com\n\nWhatsApp is the fastest — we typically respond within minutes.";
  if (m.includes('hello') || m.includes('hi') || m.includes('hey') || m.includes('good'))
    return "Hello! I'm Ark, your academic assistant at Ark Expert Researchers. 👋\n\nI'm here to help with any questions about our services — essays, dissertations, data analysis, SPSS, and much more. What can I help you with today?";
  return "Great question! Our team can give you a precise answer and a free quote within 30 minutes. 💬\n\nReach us on WhatsApp (+1 423 890 8259) or use the contact form — we're available 24/7 and love helping students succeed.";
}

export default function ArkBot({ navigate }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm **Ark** 👋, your academic assistant at **Ark Expert Researchers**.\n\nI can answer any questions about our services — essays, dissertations, SPSS analysis, pricing, and more.\n\nWhat can I help you with today?",
    },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setShowQuick(false);
    setMessages(prev => [...prev, { role:'user', text: msg }]);
    setLoading(true);

    try {
      // Build message history for API
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text.replace(/\*\*/g,''),
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: ARK_SYSTEM,
          messages: [...history, { role:'user', content: msg }],
        }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || localAnswer(msg);
      setMessages(prev => [...prev, { role:'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role:'assistant', text: localAnswer(msg) }]);
    }
    setLoading(false);
  };

  // Render text with basic **bold** and newline support
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i}>{part.slice(2,-2)}</strong>;
      if (part === '\n') return <br key={i}/>;
      return part;
    });
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:'fixed', bottom:160, right:24, zIndex:400,
          width:56, height:56, borderRadius:'50%',
          background:'linear-gradient(135deg,#0F52BA,#0a3a8a)',
          border:'none', cursor:'pointer', color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 20px rgba(15,82,186,0.45)',
          transition:'all 0.2s',
        }}
        title="Chat with Ark"
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
      >
        {open
          ? <ChevronDown size={24}/>
          : (
            <span style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
              <span style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:14,lineHeight:1}}>ARK</span>
              <MessageCircle size={12}/>
            </span>
          )
        }
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position:'fixed', bottom:200, right:24, zIndex:400,
          width: Math.min(380, window.innerWidth - 32),
          height:520, borderRadius:20,
          background:'#fff', boxShadow:'0 8px 40px rgba(0,0,0,0.18)',
          display:'flex', flexDirection:'column', overflow:'hidden',
          border:'1px solid rgba(15,82,186,0.15)',
          fontFamily:'Inter,sans-serif',
        }}>

          {/* Header */}
          <div style={{
            background:'linear-gradient(135deg,#0F52BA,#0a3a8a)',
            padding:'16px 18px', display:'flex', alignItems:'center', gap:12,
            flexShrink:0,
          }}>
            <div style={{
              width:40, height:40, borderRadius:'50%',
              background:'rgba(255,255,255,0.15)',
              border:'2px solid rgba(255,255,255,0.4)',
              display:'flex', alignItems:'center', justifyContent:'center',
              position:'relative',
            }}>
              <span style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:14,color:'#fff'}}>A</span>
              <span style={{
                position:'absolute', bottom:1, right:1,
                width:10, height:10, borderRadius:'50%',
                background:'#4ADE80', border:'2px solid #0F52BA',
              }}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,color:'#fff',fontSize:15}}>Ark</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.7)'}}>Academic Assistant · Online 24/7</div>
            </div>
            <button onClick={() => setOpen(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.7)',cursor:'pointer',padding:4,display:'flex'}}>
              <X size={18}/>
            </button>
          </div>

          {/* Messages */}
          <div style={{flex:1, overflowY:'auto', padding:'16px 14px', display:'flex', flexDirection:'column', gap:10}}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start',
              }}>
                {m.role==='assistant' && (
                  <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#0F52BA,#0a3a8a)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginRight:7,marginTop:2}}>
                    <span style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:11,color:'#fff'}}>A</span>
                  </div>
                )}
                <div style={{
                  maxWidth:'80%',
                  padding:'10px 13px',
                  borderRadius: m.role==='user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  background: m.role==='user' ? 'linear-gradient(135deg,#0F52BA,#1e6dd4)' : '#f0f4f8',
                  color: m.role==='user' ? '#fff' : '#0A1931',
                  fontSize:13.5, lineHeight:1.6,
                }}>
                  {renderText(m.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#0F52BA,#0a3a8a)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:11,color:'#fff'}}>A</span>
                </div>
                <div style={{background:'#f0f4f8',borderRadius:'4px 16px 16px 16px',padding:'10px 14px',display:'flex',gap:5}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:7,height:7,borderRadius:'50%',background:'#0F52BA',opacity:0.6,animation:`bounce 1s ${i*0.2}s infinite`}}/>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp escalation card */}
            {messages.length >= 3 && !loading && (
              <div style={{background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.25)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                <div style={{fontSize:12,fontWeight:700,color:'#16a34a',marginBottom:6}}>💬 Prefer to chat with a human?</div>
                <a
                  href={WA}
                  target="_blank" rel="noopener noreferrer"
                  style={{display:'flex',alignItems:'center',gap:7,background:'#25D366',color:'#fff',padding:'8px 14px',borderRadius:8,textDecoration:'none',fontSize:12,fontWeight:700}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.557 4.118 1.532 5.845L.057 23.492a.5.5 0 0 0 .614.614l5.796-1.448A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.522-5.204-1.43l-.374-.22-3.878.969.988-3.792-.242-.388A10 10 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  Chat with our team on WhatsApp
                </a>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Quick replies */}
          {showQuick && (
            <div style={{padding:'0 14px 10px',display:'flex',flexWrap:'wrap',gap:6}}>
              {QUICK_REPLIES.map((q,i) => (
                <button key={i} onClick={() => send(q)}
                  style={{background:'rgba(15,82,186,0.07)',border:'1px solid rgba(15,82,186,0.2)',borderRadius:16,padding:'5px 12px',fontSize:12,fontWeight:600,color:'#0F52BA',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(15,82,186,0.14)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(15,82,186,0.07)'}}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{padding:'10px 14px 14px',borderTop:'1px solid #e8edf2',display:'flex',gap:8,flexShrink:0}}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
              placeholder="Ask Ark anything…"
              style={{flex:1,padding:'10px 14px',borderRadius:24,border:'1.5px solid #e8edf2',fontSize:13.5,fontFamily:'Inter,sans-serif',outline:'none',color:'#0A1931',transition:'border-color 0.2s'}}
              onFocus={e=>e.target.style.borderColor='#0F52BA'}
              onBlur={e=>e.target.style.borderColor='#e8edf2'}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{width:40,height:40,borderRadius:'50%',background:input.trim()?'#0F52BA':'#e8edf2',border:'none',cursor:input.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s'}}>
              <Send size={16} color={input.trim()?'#fff':'#6B7A99'}/>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-5px)}
        }
      `}</style>
    </>
  );
}
