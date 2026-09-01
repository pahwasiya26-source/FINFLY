'use client';

import React from 'react';
import { FinancialOverview } from '../lib/mock-data';
import { ArrowRight, ArrowDownRight, ArrowUpRight, Workflow } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface MoneyFlowPreviewProps {
  data: FinancialOverview;
  isBusiness?: boolean;
}

export function MoneyFlowPreview({ data, isBusiness = false }: MoneyFlowPreviewProps) {
  const income = data.monthlyIncome;
  const expenses = data.monthlyExpenses;
  const surplus = data.monthlySurplus;
  const cash = data.cash;

  const expensePct = ((expenses / income) * 100).toFixed(1);
  const surplusPct = ((surplus / income) * 100).toFixed(1);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'var(--accent-primary-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Workflow size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
              {isBusiness ? 'Enterprise Money Velocity' : 'Monthly Money Flow Architecture'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Deterministic pipeline of monthly inflows, liquidity buffering, and capital distribution
            </p>
          </div>
        </div>

        <span className="pill-badge pill-emerald">
          ● Balanced Flow ({surplusPct}% Retention)
        </span>
      </div>

      {/* Visual Pipeline Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 1fr) auto minmax(200px, 1.2fr) auto minmax(220px, 1.4fr)',
          alignItems: 'center',
          gap: '16px',
        }}
        className="money-flow-grid"
      >
        {/* Step 1: Inflow Node */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isBusiness ? 'Monthly Revenue' : 'Primary Income'}
            </span>
            <span className="pill-badge pill-emerald" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
              Inflow
            </span>
          </div>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              fontFamily: 'Outfit',
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}
          >
            <AnimatedNumber value={income} format="currency" />
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
            100% Inflow Baseline
          </div>
        </div>

        {/* Connector 1 */}
        <div
          className="flow-connector"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
          }}
        >
          <ArrowRight size={22} strokeWidth={2} />
        </div>

        {/* Step 2: Buffer / Holding Node */}
        <div
          style={{
            background: 'linear-gradient(145deg, var(--bg-surface-elevated) 0%, var(--bg-surface-subtle) 100%)',
            border: '1px solid var(--border-strong)',
            borderRadius: '16px',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isBusiness ? 'Operating Capital' : 'Cash Buffer'}
            </span>
            <span className="pill-badge pill-neutral" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
              Buffer
            </span>
          </div>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              fontFamily: 'Outfit',
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}
          >
            <AnimatedNumber value={cash} format="currency" />
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Available reserves
          </div>
        </div>

        {/* Connector 2 */}
        <div
          className="flow-connector"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-tertiary)',
          }}
        >
          <ArrowRight size={22} strokeWidth={2} />
        </div>

        {/* Step 3: Outflows & Retention Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Outflow: Expenses */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {isBusiness ? 'Operating Burn' : 'Fixed & Variable Expenses'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--danger)' }}>
                -₹{expenses.toLocaleString('en-IN')}
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--danger)',
                background: 'var(--danger-bg)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              {expensePct}%
            </span>
          </div>

          {/* Outflow: Surplus / Retained Capital */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {isBusiness ? 'Net Operating Profit' : 'Surplus & Investments'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>
                +₹{surplus.toLocaleString('en-IN')}
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                background: 'var(--success-bg)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              {surplusPct}%
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .money-flow-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .flow-connector {
            transform: rotate(90deg);
            margin: 4px auto;
          }
        }
      `}</style>
    </div>
  );
}
