'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { Settings, User, Building2, Bell, Shield, Sliders, Moon, Sun, Monitor } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ModeToggle } from '../../components/ModeToggle';

export default function SettingsPage() {
  const { mode } = useStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="pill-badge pill-neutral">System Configuration</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>FINFLY OS Preferences</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-primary-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={20} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Settings & Preferences</h1>
        </div>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage workspace profiles, entity switching, theme customization, and notification triggers.
        </p>
      </div>

      {/* Settings Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Card 1: Active Workspace & Mode */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <Sliders size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Entity & Mode</h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Switch between personal family office and corporate enterprise ledger context.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Current Mode: {mode}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>Zustand persistent state</div>
            </div>
            <ModeToggle />
          </div>
        </div>

        {/* Card 2: Theme & Appearance */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <Sun size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Theme & Visual Appearance</h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Select Light (warm ivory), Dark (cinematic graphite), or System automated mode.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Color Theme</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>NextThemes data-theme</div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Card 3: Security & Recovery */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Security & Enclave</h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Master recovery keys and cryptographic session verification settings.
          </p>

          <div style={{ padding: '12px 14px', background: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Hardware Enclave</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>● Verified Active</div>
            </div>
            <span className="pill-badge pill-emerald">Enclave Locked</span>
          </div>
        </div>

        {/* Card 4: User Profile & Identity */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-primary)' }}>
              <User size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Verified Profile</h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Organization administrator identity and signing credentials.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: 'var(--bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5 0%, #059669 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              SP
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Siya Pahwa</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>siya.pahwa@finfly.ai</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
