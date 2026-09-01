'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { MoneyFlowPreview } from '../../components/MoneyFlowPreview';
import { ArrowLeftRight, Workflow, Layers, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function MoneyFlowPage() {
  const { mode, getCurrentData } = useStore();
  const data = getCurrentData();
  const isBusiness = mode === 'BUSINESS';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-emerald">Live Pipeline Active</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>FINFLY Capital Architecture</span>
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
              <ArrowLeftRight size={20} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Money Flow Architecture</h1>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            End-to-end multi-entity capital routing, automated buffering, and outflow attribution.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pill-badge pill-neutral">Mode: {mode}</span>
          <Link href="/" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.84rem' }}>
            Back to Overview
          </Link>
        </div>
      </div>

      {/* Main Flow Canvas Component */}
      <MoneyFlowPreview data={data} isBusiness={isBusiness} />

      {/* Pipeline Status Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Automated Sweep Rules</h4>
            <span className="pill-badge pill-emerald" style={{ fontSize: '0.66rem' }}>Active</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Surplus exceeding ₹50,000 threshold is automatically allocated to liquid high-yield overnight reserves.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            <CheckCircle2 size={14} />
            <span>Deterministic Rule Verified</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Tax Buffer Allocation</h4>
            <span className="pill-badge pill-gold" style={{ fontSize: '0.66rem' }}>Phase 2 Sync</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Automatic 30% advance tax withholding partition on every incoming client invoice.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--gold-accent)', fontWeight: 600 }}>
            <CheckCircle2 size={14} />
            <span>Telemetry Calibrated</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Multi-Bank Aggregation</h4>
            <span className="pill-badge pill-indigo" style={{ fontSize: '0.66rem' }}>Encrypted</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Direct integration with HDFC, ICICI, and Axis accounts via Account Aggregator framework.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            <CheckCircle2 size={14} />
            <span>Zero-Knowledge Pipeline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
