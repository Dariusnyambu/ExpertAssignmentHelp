import React from 'react';
import Footer from '../components/Footer';
import { PencilLine, GraduationCap, BookOpen, FlaskConical, Clock, FileText } from 'lucide-react';

const posts = [
  { icon: PencilLine, iconBg: 'rgba(15,82,186,0.07)', iconColor: 'var(--blue)', cat: 'Essay Tips', title: 'How to Write a First-Class Essay: Structure, Argument & Evidence', desc: 'Master the art of academic essay writing with our step-by-step guide covering thesis statements, body paragraphs, and conclusions.', date: 'June 5, 2025', read: '8 min read' },
  { icon: GraduationCap, iconBg: 'rgba(255,122,0,0.07)', iconColor: 'var(--orange)', cat: 'Dissertation Advice', title: '10 Common Dissertation Mistakes and How to Avoid Them', desc: 'From poor research questions to inadequate methodology, learn how to avoid the pitfalls that cost students valuable marks.', date: 'May 28, 2025', read: '12 min read' },
  { icon: BookOpen, iconBg: 'rgba(22,163,74,0.07)', iconColor: '#16a34a', cat: 'Study Guides', title: 'The Ultimate Guide to Academic Referencing: APA, Harvard & More', desc: 'A comprehensive breakdown of the most popular referencing styles used in Malaysian and Asian universities.', date: 'May 20, 2025', read: '10 min read' },
  { icon: FlaskConical, iconBg: 'rgba(124,58,237,0.07)', iconColor: '#7C3AED', cat: 'Research Tips', title: 'How to Find Quality Academic Sources for Your Research Paper', desc: 'Discover the best databases, libraries, and strategies for finding credible, peer-reviewed sources for your research.', date: 'May 15, 2025', read: '9 min read' },
  { icon: Clock, iconBg: 'rgba(220,38,38,0.07)', iconColor: '#DC2626', cat: 'Student Success', title: 'Time Management for Students: How to Balance Study and Life', desc: 'Practical strategies for managing your workload, beating procrastination, and staying ahead of deadlines all semester.', date: 'May 8, 2025', read: '7 min read' },
  { icon: FileText, iconBg: 'rgba(8,145,178,0.07)', iconColor: '#0891B2', cat: 'Academic Writing', title: 'Academic Writing Style: Formal vs Informal Language in Essays', desc: 'Understanding the nuances of academic tone and how to maintain a professional writing style throughout your assignments.', date: 'April 30, 2025', read: '6 min read' },
];

export default function BlogPage({ navigate }) {
  return (
    <div>
      <div className="page-hero">
        <div className="section-label">Academic Insights</div>
        <h1>Academic Writing Blog</h1>
        <p>Tips, guides and advice for academic success</p>
      </div>
      <section className="blog-section">
        <div className="blog-grid">
          {posts.map((p, i) => (
            <div className="blog-card" key={i}>
              <div className="blog-thumb" style={{ background: p.iconBg, color: p.iconColor }}>
                <p.icon size={52} style={{ opacity: 0.45 }} />
              </div>
              <div className="blog-body">
                <div className="blog-cat">{p.cat}</div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
                <div className="blog-meta">{p.date} · {p.read}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer navigate={navigate} />
    </div>
  );
}
