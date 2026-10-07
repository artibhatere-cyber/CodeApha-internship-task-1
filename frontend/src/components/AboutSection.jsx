import React from 'react';
import {
  FiCheckCircle,
  FiServer,
  FiCpu,
  FiShield,
  FiLayout,
  FiRefreshCw
} from 'react-icons/fi';

export default function AboutSection() {
  const highlights = [
    {
      icon: <FiServer />,
      title: 'RESTful Architecture',
      desc: 'Decoupled Python Flask backend serving clean endpoints with CORS and JSON payload validation.'
    },
    {
      icon: <FiCpu />,
      title: 'Neural Translation Engine',
      desc: 'Seamless integration with real multilingual translation services supporting 35+ global and Indian languages.'
    },
    {
      icon: <FiLayout />,
      title: 'Modern Responsive UI',
      desc: 'Interactive React and Vite interface with dark/light themes, accessible controls, and live character/word counters.'
    },
    {
      icon: <FiShield />,
      title: 'Production Security',
      desc: 'Environment variable isolation (.env), no exposed client secrets, and comprehensive payload boundary validation.'
    },
    {
      icon: <FiRefreshCw />,
      title: 'Speech & Persistence',
      desc: 'Web Speech API for audio pronunciation and browser localStorage for offline recent translation history.'
    },
    {
      icon: <FiCheckCircle />,
      title: 'Graceful Error Handling',
      desc: 'Friendly visual toasts and fallback mechanisms for empty inputs, network timeouts, and service unavailability.'
    }
  ];

  return (
    <section id="about" className="info-section">
      <div className="content-wrapper">
        <div className="about-card">
          <div className="internship-tag">
            <span>CodeAlpha Artificial Intelligence Internship</span>
          </div>

          <h2 className="about-title">
            About LinguaBridge AI
          </h2>

          <p className="about-text">
            <strong>LinguaBridge AI</strong> is an intelligent, full-stack language translation platform
            engineered as part of the <strong>CodeAlpha Artificial Intelligence Internship (Task 1)</strong>.
            The project demonstrates modern software engineering principles, client-server design,
            asynchronous API communication, natural language processing integration, and responsive web accessibility.
          </p>

          <p className="about-text" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            <em>Architecture Note:</em> Rather than simulating static or hardcoded translations, LinguaBridge AI
            communicates dynamically with a modular backend translation service layer. This layer proxies queries
            to real-world neural translation providers, ensuring accurate multilingual outputs across global and regional Indian languages.
          </p>

          <div className="features-grid">
            {highlights.map((h, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon-wrapper">{h.icon}</div>
                <div>
                  <h3 className="feature-title">{h.title}</h3>
                  <p className="feature-desc">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
