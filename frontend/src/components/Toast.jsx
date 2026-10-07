import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const type = toast.type || 'info';
        return (
          <div key={toast.id} className={`toast toast-${type}`} role="alert">
            <span className="toast-icon">
              {type === 'success' && <FiCheckCircle style={{ color: 'var(--success)', fontSize: '1.2rem' }} />}
              {type === 'error' && <FiAlertCircle style={{ color: 'var(--error)', fontSize: '1.2rem' }} />}
              {type === 'warning' && <FiAlertTriangle style={{ color: 'var(--warning)', fontSize: '1.2rem' }} />}
              {type === 'info' && <FiInfo style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }} />}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                padding: '2px',
              }}
              aria-label="Close notification"
            >
              <FiX />
            </button>
          </div>
        );
      })}
    </div>
  );
}
