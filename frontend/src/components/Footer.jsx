import React from 'react';
import { HiOutlineLanguage } from 'react-icons/hi2';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="content-wrapper">
        <div className="footer-inner">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
              <HiOutlineLanguage style={{ color: 'var(--accent-primary)', fontSize: '1.25rem' }} />
              <span>LinguaBridge AI</span>
            </div>
            <span className="footer-tagline">
              Intelligent Language Translation Platform • CodeAlpha Artificial Intelligence Internship
            </span>
          </div>

          <div className="footer-copy">
            <span>Task 1 Submission • Built with React & Flask</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
