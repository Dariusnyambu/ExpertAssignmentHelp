import React from 'react';
import { FilePenLine, Microscope, Zap, BookOpen, ClipboardList, GraduationCap } from 'lucide-react';

const cards = [
  {
    icon: <FilePenLine size={20} />,
    iconBg: 'rgba(255,122,0,0.18)',
    iconColor: '#FF9A3C',
    title: 'Business Essay',
    sub: 'Order #EAH-2847 · In Progress',
    progress: 75,
    progressBg: 'linear-gradient(90deg,#0F52BA,#FF7A00)',
    tags: [
      { label: '✓ Writer Assigned', bg: 'rgba(22,163,74,0.15)', color: '#16a34a' },
      { label: '⏰ Due in 18h', bg: 'rgba(255,122,0,0.15)', color: '#FF7A00' },
    ],
  },
  {
    icon: <Microscope size={20} />,
    iconBg: 'rgba(15,82,186,0.18)',
    iconColor: '#7BA7E8',
    title: 'Research Paper',
    sub: 'Order #EAH-2831 · Delivered',
    progress: 100,
    progressBg: '#16a34a',
    tags: [
      { label: '✓ Delivered', bg: 'rgba(22,163,74,0.15)', color: '#16a34a' },
      { label: '★ 5.0 Rated', bg: 'rgba(15,82,186,0.12)', color: '#7BA7E8' },
    ],
  },
  {
    icon: <Zap size={20} />,
    iconBg: 'rgba(255,122,0,0.18)',
    iconColor: '#FF9A3C',
    title: 'Urgent Order',
    sub: '3-hour delivery · Premium experts',
    progress: 40,
    progressBg: 'linear-gradient(90deg,#FF7A00,#FFB347)',
    tags: [
      { label: '⚡ Urgent', bg: 'rgba(255,122,0,0.15)', color: '#FF7A00' },
      { label: '🔥 Expert Ready', bg: 'rgba(220,38,38,0.12)', color: '#ef4444' },
    ],
  },
  {
    icon: <BookOpen size={20} />,
    iconBg: 'rgba(124,58,237,0.18)',
    iconColor: '#A78BFA',
    title: 'Literature Review',
    sub: 'Order #EAH-2819 · Under Review',
    progress: 88,
    progressBg: 'linear-gradient(90deg,#7C3AED,#0F52BA)',
    tags: [
      { label: '🔍 QA Review', bg: 'rgba(124,58,237,0.12)', color: '#A78BFA' },
      { label: '📅 Due Tomorrow', bg: 'rgba(255,122,0,0.12)', color: '#FF7A00' },
    ],
  },
  {
    icon: <ClipboardList size={20} />,
    iconBg: 'rgba(22,163,74,0.18)',
    iconColor: '#4ADE80',
    title: 'Case Study',
    sub: 'Order #EAH-2803 · Completed',
    progress: 100,
    progressBg: '#16a34a',
    tags: [
      { label: '✓ Delivered', bg: 'rgba(22,163,74,0.15)', color: '#16a34a' },
      { label: '★ 4.9 Rated', bg: 'rgba(15,82,186,0.12)', color: '#7BA7E8' },
    ],
  },
  {
    icon: <GraduationCap size={20} />,
    iconBg: 'rgba(8,145,178,0.18)',
    iconColor: '#38BDF8',
    title: 'Dissertation Chapter',
    sub: 'Order #EAH-2856 · Started',
    progress: 25,
    progressBg: 'linear-gradient(90deg,#0891B2,#0F52BA)',
    tags: [
      { label: '✍️ Writing', bg: 'rgba(8,145,178,0.12)', color: '#38BDF8' },
      { label: '📌 5 Days Left', bg: 'rgba(15,82,186,0.1)', color: '#7BA7E8' },
    ],
  },
];

// Duplicate for seamless loop
const allCards = [...cards, ...cards];

export default function OrderStatusSlider() {
  return (
    <section className="sliding-section">
      <div className="sliding-section-head">
        <div className="section-label">Live Orders</div>
        <h2 className="section-title">
          Student Assignments <span style={{ color: 'var(--orange)' }}>In Progress</span>
        </h2>
        <p className="section-sub">
          Real-time visibility into every stage — from submission to delivery. Your work, always tracked.
        </p>
      </div>

      <div className="slider-track-wrap">
        <div className="slider-track">
          {allCards.map((c, i) => (
            <div className="order-status-card" key={i}>
              <div className="osc-head">
                <div className="osc-icon" style={{ background: c.iconBg, color: c.iconColor }}>
                  {c.icon}
                </div>
                <div>
                  <div className="osc-title">{c.title}</div>
                  <div className="osc-sub">{c.sub}</div>
                </div>
              </div>
              <div className="osc-progress">
                <div
                  className="osc-fill"
                  style={{ width: `${c.progress}%`, background: c.progressBg }}
                />
              </div>
              <div className="osc-tags">
                {c.tags.map((t, j) => (
                  <span
                    key={j}
                    className="osc-tag"
                    style={{ background: t.bg, color: t.color }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
