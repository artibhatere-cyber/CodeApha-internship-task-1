import React from 'react';

export default function LanguageSelector({
  value,
  onChange,
  languages = [],
  allowAuto = false,
  label = 'Select Language',
  disabled = false,
  id = 'language-select'
}) {
  return (
    <div className="language-selector-wrapper">
      <label htmlFor={id} className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        {label}
      </label>
      <select
        id={id}
        className="custom-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={label}
      >
        {allowAuto && (
          <option value="auto">
            🌐 Auto Detect
          </option>
        )}
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name} {lang.nativeName && lang.nativeName !== lang.name ? `(${lang.nativeName})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
