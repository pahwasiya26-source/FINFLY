'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { User, Building2 } from 'lucide-react';

export function ModeToggle() {
  const { mode, toggleMode } = useStore();

  return (
    <div
      role="group"
      aria-label="Account Entity Switcher"
      className="mode-toggle-pill"
    >
      <button
        type="button"
        onClick={() => mode !== 'PERSONAL' && toggleMode()}
        className={`mode-btn ${mode === 'PERSONAL' ? 'mode-btn-active' : ''}`}
      >
        <User size={13} strokeWidth={mode === 'PERSONAL' ? 2.4 : 1.8} />
        <span className="mode-label">PERSONAL</span>
      </button>

      <button
        type="button"
        onClick={() => mode !== 'BUSINESS' && toggleMode()}
        className={`mode-btn ${mode === 'BUSINESS' ? 'mode-btn-active' : ''}`}
      >
        <Building2 size={13} strokeWidth={mode === 'BUSINESS' ? 2.4 : 1.8} />
        <span className="mode-label">BUSINESS</span>
      </button>

      <style jsx>{`
        .mode-toggle-pill {
          display: inline-flex;
          align-items: center;
          background: var(--bg-surface-elevated);
          border-radius: 12px;
          padding: 3px;
          border: 1px solid var(--border-strong);
          box-shadow: var(--shadow-xs);
          position: relative;
          flex-shrink: 0;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
          background: transparent;
          color: var(--text-secondary);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        .mode-btn-active {
          background: var(--accent-primary) !important;
          color: #ffffff !important;
          box-shadow: 0 2px 8px var(--accent-glow);
        }

        @media (max-width: 480px) {
          .mode-btn {
            padding: 4px 8px;
            font-size: 0.72rem;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
