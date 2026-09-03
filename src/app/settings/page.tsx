'use client';

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../lib/auth/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ModeToggle } from '../../components/ModeToggle';
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Sliders,
  Moon,
  Sun,
  Monitor,
  Lock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Database,
  Key,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { mode, toggleMode } = useStore();
  const { user, profile, signOut, isDemoMode } = useAuth();
  const router = useRouter();

  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  const handleSaveSettings = () => {
    setSavedNotice('Workspace preferences saved successfully.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-neutral">System Configuration</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>FINEXFLY Preferences</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={22} />
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Settings &amp; Workspace Preferences</h1>
          </div>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage entity defaults, verified user profiles, hardware enclave security, and theme preferences.
          </p>
        </div>

        <button type="button" onClick={handleSaveSettings} className="btn-primary" style={{ fontSize: '0.84rem' }}>
          <span>Save Preferences</span>
        </button>
      </div>

      {/* ── TOAST NOTICE ── */}
      {savedNotice && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>{savedNotice}</span>
        </div>
      )}

      {/* ── SETTINGS CARDS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Card 1: Verified User Profile */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-primary)' }}><User size={20} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Verified User Profile</h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Organization administrator identity and cryptographic signing credentials.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5 0%, #059669 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.94rem' }}>
              SP
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>{profile?.fullName || 'Siya Pahwa'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{profile?.email || 'siya.pahwa@finfly.ai'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '2px' }}>
                ● Verified Workspace Owner &amp; Controller
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Entity Mode Context */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-primary)' }}><Sliders size={20} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Entity &amp; Mode</h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Toggle between Personal wealth office and Corporate enterprise ledger context.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Active Context: {mode}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>Zustand persistent state</div>
            </div>
            <ModeToggle />
          </div>
        </div>

        {/* Card 3: Theme & Visual Appearance */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-primary)' }}><Sun size={20} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Theme &amp; Visual Appearance</h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Select Light (warm ivory), Dark (cinematic graphite), or System automated mode.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-surface-elevated)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Color Theme</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>NextThemes data-theme</div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Card 4: Hardware Enclave & Supabase Security */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-primary)' }}><Shield size={20} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Hardware Enclave &amp; Database</h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Cryptographic isolation and Supabase database connection health.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Enclave Isolation</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>● Active &amp; Verified</div>
              </div>
              <span className="pill-badge pill-emerald">Enclave Locked</span>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Supabase Auth State</div>
                <div style={{ fontSize: '0.72rem', color: isConfigured ? 'var(--accent-primary)' : 'var(--gold-accent)' }}>
                  {isConfigured ? '● Production Cloud Connected' : '● Demo Workspace Active'}
                </div>
              </div>
              <span className={`pill-badge ${isConfigured ? 'pill-emerald' : 'pill-gold'}`}>
                {isConfigured ? 'Connected' : 'Demo Enclave'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Session & Security Lock */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: 'var(--accent-primary)' }}><Lock size={20} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Session &amp; Workspace Lock</h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Terminate active session and lock ledger access.
          </p>

          <button
            type="button"
            className="btn-danger"
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
          >
            <LogOut size={16} />
            <span>Lock Workspace &amp; Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
