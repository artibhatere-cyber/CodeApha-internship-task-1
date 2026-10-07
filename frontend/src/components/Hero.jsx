import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

export default function Hero() {
  const scrollToTranslator = (e) => {
    e.preventDefault();
    const el = document.getElementById('translator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero-section">
      <div className="content-wrapper">
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          <span>CodeAlpha Artificial Intelligence Internship — Task 1</span>
        </div>

        <h1 className="hero-title">
          LinguaBridge <span className="text-gradient">AI</span>
        </h1>

        <p className="hero-subtitle">
          Break Language Barriers with Intelligent Translation
        </p>

        <p className="hero-desc">
          Translate text instantly across multiple global and regional languages with a fast,
          accessible, and user-friendly AI-powered translation experience built on Flask REST architecture.
        </p>

        <div>
          <a href="#translator" onClick={scrollToTranslator} className="hero-cta">
            <BsStars />
            <span>Start Translating</span>
            <FiArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}
