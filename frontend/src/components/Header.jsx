import React from 'react';
import { FiSun, FiMoon, FiGithub } from 'react-icons/fi';
import { HiOutlineLanguage } from 'react-icons/hi2';

export default function Header({ theme, toggleTheme }) {
  return (
    <header className="navbar">
      <div className="content-wrapper">
        <div className="navbar-inner">
          {/* Brand Logo & Title */}
          <a href="#home" className="brand-link" aria-label="LinguaBridge AI Home">
            <div className="brand-logo-icon">
              <HiOutlineLanguage />
            </div>
            <div>
              <span>LinguaBridge</span>
              <span className="text-gradient">AI</span>
              <span className="brand-badge">Task 1</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li>
              <a href="#home" className="nav-link">Home</a>
            </li>
            <li>
              <a href="#translator" className="nav-link">Translator</a>
            </li>
            <li>
              <a href="#history" className="nav-link">History</a>
            </li>
            <li>
              <a href="#about" className="nav-link">About</a>
            </li>
            <li>
              <a href="#tech" className="nav-link">Tech Stack</a>
            </li>
          </ul>

          {/* Actions: Theme Toggle & GitHub */}
          <div className="nav-actions">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="github-btn"
              aria-label="GitHub Repository"
            >
              <FiGithub />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
