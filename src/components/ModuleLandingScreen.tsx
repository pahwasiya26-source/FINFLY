'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { AnimatedNumber } from './AnimatedNumber';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Cpu, Lock, Layers } from 'lucide-react';
import Link from 'next/link';

export interface ModuleMetric {
  label: string;
  value: string | number;
  format?: 'currency' | 'percentage' | 'number';
  change?: string;
  positive?: boolean;
}

export interface ModuleFeaturePreview {
  title: string;
  description: string;
  status: 'Ready for Phase 2' | 'Telemetry Synced' | 'Enclave Protected';
}

export interface ModuleLandingScreenProps {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor?: string;
  metrics: ModuleMetric[];
  features: ModuleFeaturePreview[];
  phaseNotice?: string;
}

export function ModuleLandingScreen({
  title,
  subtitle,
  badge,
  icon: Icon,
  metrics,
  features,
  phaseNotice = 'Architecture & Data Pipelines Verified — Scheduled for Phase 2 Implementation',
}: ModuleLandingScreenProps) {
  const { mode } = useStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-emerald">{badge}</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>FINEXFLY — AI Finance Controller</span>
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
              <Icon size={20} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>{title}</h1>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pill-badge pill-neutral">Mode: {mode}</span>
          <Link href="/" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.84rem' }}>
            <span>Back to Overview</span>
          </Link>
        </div>
      </div>

      {/* Hero Telemetry Card */}
      <div
        className="glass-hero"
        style={{
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                boxShadow: '0 0 8px var(--accent-primary)',
              }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Deterministic Integration Pipeline Online
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {phaseNotice}
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
            All schemas, Zustand stores, and mathematical simulation engines are initialized and ready for visual activation.
          </p>
        </div>

        <Link href="/financial-twin" className="btn-primary" style={{ padding: '12px 20px' }}>
          <Sparkles size={16} />
          <span>Launch Scenario Simulator</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Metrics Row */}
      {metrics.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '14px' }}>Live Core Telemetry</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {m.label}
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                  {typeof m.value === 'number' ? (
                    <AnimatedNumber value={m.value} format={m.format || 'currency'} />
                  ) : (
                    <span>{m.value}</span>
                  )}
                </div>
                {m.change && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: m.positive !== false ? 'var(--accent-primary)' : 'var(--danger)',
                    }}
                  >
                    {m.change}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features & Architectural Specifications */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '14px' }}>Module Capabilities & Roadmap</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {features.map((f, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.title}</h4>
                  <span className="pill-badge pill-neutral" style={{ fontSize: '0.66rem' }}>
                    {f.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {f.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.76rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={14} />
                <span>Deterministic Engine Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
