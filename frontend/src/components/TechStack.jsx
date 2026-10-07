import React from 'react';
import {
  SiReact,
  SiVite,
  SiPython,
  SiFlask,
  SiHtml5,
  SiCss,
  SiJavascript
} from 'react-icons/si';
import { TbApi, TbBrain } from 'react-icons/tb';

export default function TechStack() {
  const technologies = [
    { icon: <SiReact style={{ color: '#61DAFB' }} />, name: 'React 19', role: 'Frontend UI Library' },
    { icon: <SiVite style={{ color: '#646CFF' }} />, name: 'Vite', role: 'Build Tool & Dev Server' },
    { icon: <SiJavascript style={{ color: '#F7DF1E' }} />, name: 'JavaScript ES6+', role: 'Client Application Logic' },
    { icon: <SiPython style={{ color: '#3776AB' }} />, name: 'Python 3.12', role: 'Backend Runtime' },
    { icon: <SiFlask style={{ color: 'var(--text-primary)' }} />, name: 'Flask', role: 'REST API Framework' },
    { icon: <TbApi style={{ color: '#10B981' }} />, name: 'REST API', role: 'Client-Server Interface' },
    { icon: <TbBrain style={{ color: '#8B5CF6' }} />, name: 'Neural Engine', role: 'Translation Layer' },
    { icon: <SiHtml5 style={{ color: '#E34F26' }} />, name: 'HTML5', role: 'Semantic Structure' },
    { icon: <SiCss style={{ color: '#1572B6' }} />, name: 'Vanilla CSS', role: 'Design System & Themes' },
  ];

  return (
    <section id="tech" className="info-section">
      <div className="content-wrapper">
        <div className="section-header">
          <h2 className="section-title">
            <TbApi className="section-title-icon" />
            <span>Technology Stack</span>
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', maxWidth: '650px' }}>
          LinguaBridge AI is built with modern, enterprise-grade tooling to ensure high performance,
          maintainability, security, and developer ergonomics.
        </p>

        <div className="tech-grid">
          {technologies.map((t, idx) => (
            <div key={idx} className="tech-card">
              <div className="tech-icon">{t.icon}</div>
              <div className="tech-name">{t.name}</div>
              <div className="tech-role">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
