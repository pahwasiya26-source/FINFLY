'use client';

import React from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface SmartInsightData {
  id: string;
  title: string;
  category: 'SAVINGS' | 'EXPENSE_VARIANCE' | 'GOAL_PROJECTION';
  actionType: 'Explore' | 'Explain' | 'Simulate';
  description: string;
  impactMetric: string;
  details: {
    heading: string;
    summary: string;
    metrics: { label: string; value: string; positive?: boolean }[];
    deterministicNote: string;
  };
}

interface SmartInsightModalProps {
  insight: SmartInsightData | null;
  onClose: () => void;
}

export function SmartInsightModal({ insight, onClose }: SmartInsightModalProps) {
  if (!insight) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-overlay)',
        backdropFilter: 'blur(12px)',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background:
                  insight.category === 'SAVINGS'
                    ? 'var(--success-bg)'
                    : insight.category === 'EXPENSE_VARIANCE'
                    ? 'var(--warning-bg)'
                    : 'rgba(99, 102, 241, 0.12)',
                color:
                  insight.category === 'SAVINGS'
                    ? 'var(--accent-primary)'
                    : insight.category === 'EXPENSE_VARIANCE'
                    ? 'var(--gold-accent)'
                    : 'var(--indigo-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {insight.category === 'SAVINGS' ? (
                <TrendingUp size={20} />
              ) : insight.category === 'EXPENSE_VARIANCE' ? (
                <AlertTriangle size={20} />
              ) : (
                <Cpu size={20} />
              )}
            </div>
            <div>
              <span className="pill-badge pill-neutral" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>
                {insight.category.replace('_', ' ')} • {insight.actionType.toUpperCase()}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{insight.title}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close insight modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.55 }}>
            {insight.details.summary}
          </p>

          {/* Metric Breakdown Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              margin: '16px 0',
            }}
          >
            {insight.details.metrics.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              >
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit',
                    color: m.positive === true ? 'var(--accent-primary)' : m.positive === false ? 'var(--danger)' : 'var(--text-primary)',
                  }}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Deterministic Verification Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <CheckCircle2 size={16} color="var(--accent-primary)" />
            <span>{insight.details.deterministicNote}</span>
          </div>
        </div>

        {/* Modal Footer / Direct Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={onClose} className="btn-secondary">
            Dismiss
          </button>
          {insight.actionType === 'Simulate' ? (
            <Link href="/digital-twin" className="btn-primary" onClick={onClose}>
              <span>Open Scenario Simulator</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <button type="button" onClick={onClose} className="btn-primary">
              <span>Acknowledge Recommendation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
