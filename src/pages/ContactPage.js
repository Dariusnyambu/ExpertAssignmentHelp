import React from 'react';
import Footer from '../components/Footer';
import { Mail, Phone, Clock3, MapPin, MessageCircle, Send } from 'lucide-react';

export default function ContactPage({ navigate }) {
  return (
    <div>
      <div className="page-hero">
        <div className="section-label">Get in Touch</div>
        <h1>Contact Us</h1>
        <p>We're available 24/7 to help you succeed</p>
      </div>
      <section className="contact-section">
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Let's Talk</h3>
            <p>Get in touch with our team via any channel. We typically respond within minutes during business hours and within 1 hour at other times.</p>
            {[
              { Icon: Mail,     title: 'Primary Email',    val: 'info@arkexpertresearch.com' },
              { Icon: Mail,     title: 'Support Email',    val: 'hello@arkexpertresearch.com' },
              { Icon: Phone,    title: 'Phone / WhatsApp', val: '+1 423 890 8259' },
              { Icon: Clock3,   title: 'Availability',     val: '24 hours, 7 days a week' },
              { Icon: MapPin,   title: 'Markets Served',   val: 'Asia · Middle East · USA · Canada · Australia' },
            ].map(({ Icon, title, val }) => (
              <div className="c-item" key={title}>
                <div className="c-icon"><Icon size={20} /></div>
                <div className="c-text"><h5>{title}</h5><p>{val}</p></div>
              </div>
            ))}
            <button className="wa-btn" onClick={() => window.open('https://wa.me/14238908259','_blank')}>
              <MessageCircle size={20} /> Chat with Us on WhatsApp
            </button>
          </div>

          <div className="contact-form">
            <h3>Send Us a Message</h3>
            {['Your Name','Email','Subject'].map(lbl => (
              <div className="form-group" key={lbl}>
                <label>{lbl}</label>
                <input type={lbl==='Email'?'email':'text'} placeholder={lbl==='Your Name'?'Full name':lbl==='Email'?'your@email.com':'How can we help?'} />
              </div>
            ))}
            <div className="form-group">
              <label>Message</label>
              <textarea placeholder="Tell us about your assignment or ask us anything..." />
            </div>
            <button className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px' }} onClick={() => alert("Message sent! We'll reply within 30 minutes.")}>
              <Send size={17} /> Send Message
            </button>
          </div>
        </div>
      </section>
      <Footer navigate={navigate} />
    </div>
  );
}
