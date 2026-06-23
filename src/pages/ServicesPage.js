import React from 'react';
import Footer from '../components/Footer';
import { PencilLine, BookOpen, GraduationCap, FlaskConical, ClipboardList, Library, Presentation, SpellCheck, MonitorCheck, FileCheck, FileSearch, ScrollText, FileText } from 'lucide-react';

const services = [
  { icon: PencilLine, color: 'blue', title: 'Essay Writing', desc: 'Argumentative, analytical, descriptive, narrative, and all essay types across any subject. Custom-crafted to your guidelines and marking rubric.' },
  { icon: BookOpen, color: 'orange', title: 'Assignment Help', desc: 'Comprehensive help with any university assignment including case analyses, reports, problem sets, and coursework across all disciplines.' },
  { icon: GraduationCap, color: 'blue', title: 'Dissertation Writing', desc: 'Full dissertation support from topic selection, literature review, methodology, data analysis, to conclusion and editing.' },
  { icon: FlaskConical, color: 'orange', title: 'Research Papers', desc: 'Peer-review quality research papers with proper citation, methodology, and analysis to meet academic publication standards.' },
  { icon: ClipboardList, color: 'blue', title: 'Case Studies', desc: 'In-depth business, medical, and academic case study analysis with structured frameworks and evidence-based conclusions.' },
  { icon: Library, color: 'orange', title: 'Literature Reviews', desc: 'Comprehensive, critically synthesized literature reviews using current and relevant academic sources in your field.' },
  { icon: Presentation, color: 'blue', title: 'Presentations', desc: 'Professional PowerPoint and Prezi presentations with compelling visuals, speaker notes, and structured narratives.' },
  { icon: SpellCheck, color: 'orange', title: 'Editing & Proofreading', desc: 'Grammar, style, structure, and clarity improvements with detailed track-changes review from expert editors.' },
  { icon: MonitorCheck, color: 'blue', title: 'Online Class Help', desc: 'Full semester online class support including discussions, quizzes, assignments, and exam preparation.' },
  { icon: FileCheck, color: 'orange', title: 'Coursework Help', desc: 'Structured coursework assistance across all subjects and levels from undergraduate to doctoral programs.' },
  { icon: FileSearch, color: 'blue', title: 'Research Proposals', desc: 'Compelling research proposals with clear problem statements, objectives, methodology, and literature foundations.' },
  { icon: ScrollText, color: 'orange', title: 'Thesis Writing', desc: "Expert thesis writing from proposal to final chapter, ensuring alignment with your institution's requirements." },
];

export default function ServicesPage({ navigate }) {
  return (
    <div>
      <div className="page-hero">
        <div className="section-label">Our Expertise</div>
        <h1>Academic Writing Services</h1>
        <p>Expert assistance across all academic writing types, delivered by qualified professionals</p>
      </div>
      <section style={{ padding: '72px 5%' }}>
        <div className="features-grid">
          {services.map((s, i) => (
            <div className="feature-card" key={i}>
              <div className={`fc-icon ${s.color}`}><s.icon size={24} /></div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="btn-primary" onClick={() => navigate('quote')}>
            <FileText size={17} /> Get a Free Quote for Your Service
          </button>
        </div>
      </section>
      <Footer navigate={navigate} />
    </div>
  );
}
