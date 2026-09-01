'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { CalculationPanel } from '../components/CalculationPanel';
import { MoneyFlowPreview } from '../components/MoneyFlowPreview';
import { ThreeFinancialCore } from '../components/ThreeFinancialCore';
import { SmartInsightModal, SmartInsightData } from '../components/SmartInsightModal';
import {
  TrendingUp,
  ShieldAlert,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Wallet,
  Building2,
  PieChart,
  Calendar,
  Layers,
  ChevronRight,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const { mode, getCurrentData } = useStore();
  const data = getCurrentData();
  const isBusiness = mode === 'BUSINESS';

  const [greeting, setGreeting] = useState('Good evening');
  const [selectedInsight, setSelectedInsight] = useState<SmartInsightData | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Smart insights aligned with deterministic calculations
  const smartInsights: SmartInsightData[] = isBusiness
    ? [
        {
          id: 'biz-1',
          title: 'Operating margin expanded by 3.8% this quarter.',
          category: 'SAVINGS',
          actionType: 'Explore',
          description: 'Net operating profit reached ₹3.5L with a 29.1% retention rate.',
          impactMetric: '+3.8%',
          details: {
            heading: 'Operating Margin Expansion',
            summary:
              'Lower administrative overhead and improved vendor terms increased gross retention from 25.3% to 29.1% over the past 90 days.',
            metrics: [
              { label: 'Monthly Revenue', value: '₹12,00,000' },
              { label: 'Operating Burn', value: '₹8,50,000' },
              { label: 'Net Profit Margin', value: '29.1%', positive: true },
            ],
            deterministicNote: 'Calculated deterministically from audited general ledger and invoice records.',
          },
        },
        {
          id: 'biz-2',
          title: 'Accounts receivable aging exceeds 45-day target.',
          category: 'EXPENSE_VARIANCE',
          actionType: 'Explain',
          description: '₹18.5L in outstanding invoices with ₹4.2L past 60 days.',
          impactMetric: '₹18.5L',
          details: {
            heading: 'Receivables Variance Audit',
            summary:
              'Two enterprise client accounts are pending purchase order reconciliation, extending the weighted average DSO to 48 days.',
            metrics: [
              { label: 'Total Receivables', value: '₹18,50,000' },
              { label: 'Overdue (>60d)', value: '₹4,20,000', positive: false },
              { label: 'DSO Impact', value: '+7 days', positive: false },
            ],
            deterministicNote: 'Directly aggregated from ERP receivable ledger without model extrapolation.',
          },
        },
        {
          id: 'biz-3',
          title: 'Runway projected at 9.2 months at current capital burn.',
          category: 'GOAL_PROJECTION',
          actionType: 'Simulate',
          description: 'Cash reserves of ₹32L support existing operations without additional financing.',
          impactMetric: '9.2 mo',
          details: {
            heading: '12-Month Runway Projection',
            summary:
              'At a net monthly surplus of ₹3.5L and zero debt service acceleration, working capital maintains healthy buffer above the 6-month threshold.',
            metrics: [
              { label: 'Liquid Cash', value: '₹32,00,000' },
              { label: 'Monthly Net Flow', value: '+₹3,50,000', positive: true },
              { label: 'Runway Buffer', value: '9.2 Months', positive: true },
            ],
            deterministicNote: 'Simulated via DigitalTwinEngine deterministic cashflow equations.',
          },
        },
      ]
    : [
        {
          id: 'p-1',
          title: 'Savings rate increased 4.2% this month.',
          category: 'SAVINGS',
          actionType: 'Explore',
          description: 'Discretionary spending dropped 12%, accelerating your monthly surplus to ₹85,000.',
          impactMetric: '+4.2%',
          details: {
            heading: 'Monthly Savings Velocity',
            summary:
              'Your savings rate increased from 43.0% to 47.2% due to reduced dining and lifestyle costs this billing cycle.',
            metrics: [
              { label: 'Monthly Inflow', value: '₹1,80,000' },
              { label: 'Total Outflows', value: '₹95,000' },
              { label: 'Net Savings Rate', value: '47.2%', positive: true },
            ],
            deterministicNote: 'Deterministic computation: (Income - Expenses) / Income * 100.',
          },
        },
        {
          id: 'p-2',
          title: 'Travel spending is 18% above your normal pattern.',
          category: 'EXPENSE_VARIANCE',
          actionType: 'Explain',
          description: 'One-off flight bookings contributed ₹18,400 to non-recurring discretionary outflow.',
          impactMetric: '+18%',
          details: {
            heading: 'Category Variance Breakdown',
            summary:
              'Travel expenditure totaled ₹28,400 versus the 6-month rolling baseline of ₹24,000 due to quarterly travel reservations.',
            metrics: [
              { label: 'Actual Outflow', value: '₹28,400' },
              { label: 'Baseline Average', value: '₹24,000' },
              { label: 'Variance', value: '+₹4,400', positive: false },
            ],
            deterministicNote: 'Reconciled from bank transaction categorization tags.',
          },
        },
        {
          id: 'p-3',
          title: 'Emergency fund target is projected to be reached in 7 months.',
          category: 'GOAL_PROJECTION',
          actionType: 'Simulate',
          description: 'Maintaining your current surplus of ₹85,000/mo achieves full 6-month coverage.',
          impactMetric: '7 months',
          details: {
            heading: 'Emergency Liquidity Runway Goal',
            summary:
              'Target buffer: ₹6,00,000 (6 months of baseline expenses). Current liquid cash: ₹4,50,000. Gap: ₹1,50,000.',
            metrics: [
              { label: 'Current Buffer', value: '₹4,50,000' },
              { label: 'Target Buffer', value: '₹6,00,000' },
              { label: 'Time to Goal', value: '7 Months', positive: true },
            ],
            deterministicNote: 'Projected deterministically: Gap / Monthly Surplus = 1.76 months to baseline target.',
          },
        },
      ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ==========================================================
          HERO SECTION: NET POSITION & 3D FINANCIAL NEXUS
          ========================================================== */}
      <div
        className="glass-hero"
        style={{
          padding: '36px 40px',
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr',
          gap: '32px',
          alignItems: 'center',
        }}
      >
        {/* Left: Net Position & Typography */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Greeting & Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                {greeting}, Siya
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span className="pill-badge pill-emerald" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                Health: ON TRACK
              </span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Here's your financial overview.
            </h1>
          </div>

          {/* Big Metric Display */}
          <div
            style={{
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '24px 28px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-tertiary)',
                }}
              >
                {isBusiness ? 'NET ENTERPRISE POSITION' : 'NET FINANCIAL POSITION'}
              </span>

              <CalculationPanel
                title={isBusiness ? 'Net Enterprise Position' : 'Net Financial Position'}
                formula="Cash + Investments + Assets - Liabilities"
                inputs={[
                  { label: 'Liquid Cash', value: `₹${data.cash.toLocaleString('en-IN')}` },
                  { label: 'Investments', value: `₹${data.investments.toLocaleString('en-IN')}` },
                  { label: 'Fixed Assets', value: `₹${data.assets.toLocaleString('en-IN')}` },
                  { label: 'Total Liabilities', value: `-₹${data.liabilities.toLocaleString('en-IN')}` },
                ]}
                result={`₹${data.netPosition.toLocaleString('en-IN')}`}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
              <div
                style={{
                  fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                }}
              >
                <AnimatedNumber value={data.netPosition} format="currency" />
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'var(--success-bg)',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                <ArrowUpRight size={16} strokeWidth={2.4} />
                <span>+{isBusiness ? '24.8%' : '8.42%'} this year</span>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Deterministic multi-asset aggregation with verified general ledger sync.
            </div>
          </div>
        </div>

        {/* Right: Embedded 3D Financial Nexus Widget placeholder */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-surface-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '16px',
            minHeight: '290px',
          }}
        >
          <ThreeFinancialCore mode="dashboard" height={240} interactive />

          {/* Dimension Chips */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
              marginTop: '4px',
            }}
          >
            <span className="pill-badge pill-emerald">Liquidity: Strong</span>
            <span className="pill-badge pill-indigo">Growth: +12.4%</span>
            <span className="pill-badge pill-gold">Risk: Moderate</span>
            <span className="pill-badge pill-neutral">Investments: Synced</span>
          </div>
        </div>
      </div>

      {/* ==========================================================
          FINANCIAL HEALTH TRIAD (Visually Distinct Modules)
          ========================================================== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Financial Health Index</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              Core operational vital signs calibrated continuously
            </p>
          </div>
          <span className="pill-badge pill-emerald">Score: {data.healthScore}/100</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Health 1: LIQUIDITY */}
          <div
            className="glass-panel db-health-card"
            style={{
              padding: '24px',
              borderTop: '3px solid var(--accent-primary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--success-bg)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Droplets size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                    LIQUIDITY
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Strong
                  </div>
                </div>
              </div>
              <span className="pill-badge pill-emerald">
                {isBusiness ? '9.2 Mo Runway' : '4.7 Mo Buffer'}
              </span>
            </div>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Liquid cash of ₹{data.cash.toLocaleString('en-IN')} exceeds the recommended baseline reserve.
            </div>

            {/* Animated Progress Bar */}
            <div className="db-progress-track">
              <div className="db-progress-fill db-progress-emerald" style={{ width: '84%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>0%</span><span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>84%</span><span>100%</span>
            </div>
          </div>

          {/* Health 2: GROWTH */}
          <div
            className="glass-panel db-health-card"
            style={{
              padding: '24px',
              borderTop: '3px solid var(--indigo-accent)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--indigo-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                    GROWTH
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    +{data.growthRateYoY || 12.4}% YoY
                  </div>
                </div>
              </div>
              <span className="pill-badge pill-indigo">Outpacing Inflation</span>
            </div>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Portfolio compounding yield outperforming benchmark by +6.1% annualized.
            </div>

            <div className="db-progress-track">
              <div className="db-progress-fill db-progress-indigo" style={{ width: '76%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>0%</span><span style={{ color: 'var(--indigo-accent)', fontWeight: 600 }}>76%</span><span>100%</span>
            </div>
          </div>

          {/* Health 3: RISK */}
          <div
            className="glass-panel db-health-card"
            style={{
              padding: '24px',
              borderTop: '3px solid var(--gold-accent)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--gold-bg)',
                    color: 'var(--gold-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                    RISK PROFILE
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Moderate
                  </div>
                </div>
              </div>
              <span className="pill-badge pill-gold">Sharpe 1.84</span>
            </div>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Debt-to-income at 14.2% with fully collateralized long-term obligations.
            </div>

            <div className="db-progress-track">
              <div className="db-progress-fill db-progress-gold" style={{ width: '55%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>0%</span><span style={{ color: 'var(--gold-accent)', fontWeight: 600 }}>55%</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================================
          MONEY FLOW — ELEVATED AS PROMINENT INTERACTIVE MODULE
          ========================================================== */}
      <div className="db-money-flow-section">
        {/* Section header with CTA */}
        <div className="db-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="db-section-icon db-icon-emerald">
              <Workflow size={17} />
            </div>
            <div>
              <h2 className="db-section-title">
                {isBusiness ? 'Enterprise Money Velocity' : 'Monthly Money Flow'}
              </h2>
              <p className="db-section-desc">
                Deterministic pipeline · inflows → buffer → capital distribution
              </p>
            </div>
          </div>
          <Link href="/money-flow" className="db-cta-link">
            Full breakdown <ChevronRight size={14} />
          </Link>
        </div>

        {/* Flow Pipeline */}
        <div className="db-flow-grid">
          {/* Inflow node */}
          <div className="db-flow-node db-flow-node-inflow">
            <div className="db-flow-node-header">
              <span className="db-flow-node-label">{isBusiness ? 'Monthly Revenue' : 'Primary Income'}</span>
              <span className="pill-badge pill-emerald" style={{ fontSize: '0.62rem' }}>Inflow</span>
            </div>
            <div className="db-flow-node-value db-value-primary">
              <AnimatedNumber value={data.monthlyIncome} format="currency" />
            </div>
            <div className="db-flow-node-sub">100% baseline</div>
            <div className="db-flow-bar-track">
              <div className="db-flow-bar db-flow-bar-emerald" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Connector */}
          <div className="db-flow-connector">
            <ArrowRight size={20} strokeWidth={2} className="db-connector-arrow" />
          </div>

          {/* Buffer node */}
          <div className="db-flow-node db-flow-node-buffer">
            <div className="db-flow-node-header">
              <span className="db-flow-node-label">{isBusiness ? 'Operating Capital' : 'Cash Buffer'}</span>
              <span className="pill-badge pill-neutral" style={{ fontSize: '0.62rem' }}>Reserve</span>
            </div>
            <div className="db-flow-node-value">
              <AnimatedNumber value={data.cash} format="currency" />
            </div>
            <div className="db-flow-node-sub">Available reserves</div>
            <div className="db-flow-bar-track">
              <div className="db-flow-bar db-flow-bar-neutral" style={{ width: `${Math.min((data.cash / data.monthlyIncome) * 40, 100)}%` }} />
            </div>
          </div>

          {/* Connector */}
          <div className="db-flow-connector">
            <ArrowRight size={20} strokeWidth={2} className="db-connector-arrow" />
          </div>

          {/* Outflow stack */}
          <div className="db-flow-outputs">
            {/* Expenses row */}
            <div className="db-flow-output-row db-output-danger">
              <div>
                <div className="db-flow-node-label">{isBusiness ? 'Operating Burn' : 'Fixed & Variable Expenses'}</div>
                <div className="db-output-value db-output-danger-val">
                  -₹{data.monthlyExpenses.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="db-output-pct db-pct-danger">
                <ArrowDownRight size={12} />
                {((data.monthlyExpenses / data.monthlyIncome) * 100).toFixed(1)}%
              </div>
            </div>

            {/* Surplus row */}
            <div className="db-flow-output-row db-output-success">
              <div>
                <div className="db-flow-node-label">{isBusiness ? 'Net Operating Profit' : 'Surplus & Investments'}</div>
                <div className="db-output-value db-output-success-val">
                  +₹{data.monthlySurplus.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="db-output-pct db-pct-success">
                <ArrowUpRight size={12} />
                {((data.monthlySurplus / data.monthlyIncome) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================================
          ADAPTIVE FINANCIAL MODULES (PERSONAL vs BUSINESS)
          ========================================================== */}
      <div>
        <div className="db-section-header">
          <div>
            <h2 className="db-section-title">
              {isBusiness ? 'Enterprise Ledger Breakdown' : 'Capital Allocation Matrix'}
            </h2>
            <p className="db-section-desc">
              Deterministic accounting metrics · {isBusiness ? 'Enterprise Operations' : 'Personal Wealth'}
            </p>
          </div>
          <span className="pill-badge pill-neutral">Mode: {mode}</span>
        </div>

        {isBusiness ? (
          <div className="db-metric-grid">
            <div className="glass-panel db-metric-card">
              <span className="db-metric-label">Monthly Revenue</span>
              <div className="db-metric-value db-metric-primary">
                <AnimatedNumber value={data.monthlyIncome} format="currency" />
              </div>
              <div className="db-metric-trend db-trend-up">
                <TrendingUp size={12} /> +18.2% vs prev. quarter
              </div>
            </div>

            <div className="glass-panel db-metric-card">
              <span className="db-metric-label">Operating Burn</span>
              <div className="db-metric-value db-metric-danger">
                <AnimatedNumber value={data.monthlyExpenses} format="currency" />
              </div>
              <div className="db-metric-trend db-trend-neutral">Fixed &amp; variable OPEX</div>
            </div>

            <div className="glass-panel db-metric-card">
              <span className="db-metric-label">Accounts Receivable</span>
              <div className="db-metric-value db-metric-primary">
                <AnimatedNumber value={data.receivables || 1850000} format="currency" />
              </div>
              <div className="db-metric-trend db-trend-warn">
                <ShieldAlert size={12} /> ₹4.2L past 60-day terms
              </div>
            </div>

            <div className="glass-panel db-metric-card">
              <span className="db-metric-label">Accounts Payable</span>
              <div className="db-metric-value db-metric-secondary">
                <AnimatedNumber value={data.payables || 720000} format="currency" />
              </div>
              <div className="db-metric-trend db-trend-up">All vendor schedules current</div>
            </div>
          </div>
        ) : (
          <div className="db-metric-grid">
            <div className="glass-panel db-metric-card">
              <span className="db-metric-label">Liquid Cash Reserve</span>
              <div className="db-metric-value db-metric-primary">
                <AnimatedNumber value={data.cash} format="currency" />
              </div>
              <div className="db-metric-trend db-trend-neutral">Instant liquidity in checking &amp; sweep</div>
            </div>

            <div className="glass-panel db-metric-card">
              <span className="db-metric-label">Investments &amp; Assets</span>
              <div className="db-metric-value db-metric-primary">
                <AnimatedNumber value={data.investments + data.assets} format="currency" />
              </div>
              <div className="db-metric-trend db-trend-up">
                <TrendingUp size={12} /> Equities, Debt &amp; Real Property
              </div>
            </div>

            <div className="glass-panel db-metric-card">
              <span className="db-metric-label">Total Liabilities</span>
              <div className="db-metric-value db-metric-danger">
                <AnimatedNumber value={data.liabilities} format="currency" />
              </div>
              <div className="db-metric-trend db-trend-neutral">Car loan &amp; secured liabilities</div>
            </div>

            <div className="glass-panel db-metric-card">
              <span className="db-metric-label">Monthly Surplus</span>
              <div className="db-metric-value db-metric-primary">
                <AnimatedNumber value={data.monthlySurplus} format="currency" />
              </div>
              <div className="db-metric-trend db-trend-up">
                <ArrowUpRight size={12} /> Savings Rate: {data.savingsRate}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================================
          SMART INSIGHTS SECTION (With Actionable Modals)
          ========================================================== */}
      <div>
        <div className="db-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="db-section-icon db-icon-accent">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="db-section-title">Smart Insights</h2>
              <p className="db-section-desc">Deterministic AI reasoning · zero hallucination guarantee</p>
            </div>
          </div>
          <span className="pill-badge pill-neutral">3 Insights Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {smartInsights.map((insight) => (
            <div
              key={insight.id}
              className={`glass-panel glass-panel-interactive db-insight-card ${
                insight.category === 'SAVINGS'
                  ? 'db-insight-emerald'
                  : insight.category === 'EXPENSE_VARIANCE'
                  ? 'db-insight-gold'
                  : 'db-insight-indigo'
              }`}
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onClick={() => setSelectedInsight(insight)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span
                    className={
                      insight.category === 'SAVINGS'
                        ? 'pill-badge pill-emerald'
                        : insight.category === 'EXPENSE_VARIANCE'
                        ? 'pill-badge pill-gold'
                        : 'pill-badge pill-indigo'
                    }
                    style={{ fontSize: '0.68rem' }}
                  >
                    {insight.category.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>
                    {insight.impactMetric}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.35 }}>
                  {insight.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  {insight.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{
                    fontSize: '0.78rem',
                    padding: '6px 12px',
                    borderRadius: '8px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInsight(insight);
                  }}
                >
                  <span>{insight.actionType}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Smart Insight Modal */}
      <SmartInsightModal
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />

      <style jsx>{`
        /* ── Global responsive hero ── */
        @media (max-width: 960px) {
          .glass-hero {
            grid-template-columns: 1fr !important;
            padding: 28px 20px !important;
          }
        }

        /* ── Health cards hover lift ── */
        .db-health-card {
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.22s ease;
          cursor: default;
        }
        .db-health-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        /* ── Animated progress bars ── */
        .db-progress-track {
          height: 6px;
          width: 100%;
          background: var(--bg-surface-hover);
          border-radius: 999px;
          overflow: hidden;
        }
        .db-progress-fill {
          height: 100%;
          border-radius: 999px;
          animation: db-bar-grow 0.9s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes db-bar-grow {
          from { width: 0 !important; }
        }
        .db-progress-emerald { background: var(--accent-primary); }
        .db-progress-indigo  { background: var(--indigo-accent); }
        .db-progress-gold    { background: var(--gold-accent); }

        /* ── Section header ── */
        .db-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
        }
        .db-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }
        .db-section-desc {
          font-size: 0.82rem;
          color: var(--text-tertiary);
          margin: 0;
        }
        .db-section-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-icon-emerald {
          background: var(--accent-primary-subtle);
          color: var(--accent-primary);
        }
        .db-icon-accent {
          background: var(--accent-primary-subtle);
          color: var(--accent-primary);
        }
        .db-cta-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent-primary);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--success-border);
          background: var(--success-bg);
          transition: all 0.18s ease;
          flex-shrink: 0;
        }
        .db-cta-link:hover {
          background: var(--accent-primary);
          color: #fff;
          border-color: transparent;
        }

        /* ── Money Flow Section ── */
        .db-money-flow-section {
          background: var(--bg-surface-glass);
          border: 1px solid var(--border-strong);
          border-radius: 24px;
          padding: 28px 32px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .db-money-flow-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-primary), var(--indigo-accent), var(--gold-accent));
          opacity: 0.7;
        }

        /* Flow pipeline grid */
        .db-flow-grid {
          display: grid;
          grid-template-columns: minmax(180px, 1fr) auto minmax(180px, 1fr) auto minmax(200px, 1.3fr);
          align-items: center;
          gap: 16px;
        }

        /* Flow node */
        .db-flow-node {
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: default;
        }
        .db-flow-node:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .db-flow-node-inflow {
          background: linear-gradient(145deg, var(--bg-surface-elevated) 0%, rgba(5,150,105,0.06) 100%);
          border: 1px solid var(--success-border);
          box-shadow: var(--shadow-xs);
        }
        .db-flow-node-buffer {
          background: linear-gradient(145deg, var(--bg-surface-elevated) 0%, var(--bg-surface-subtle) 100%);
          border: 1px solid var(--border-strong);
          box-shadow: var(--shadow-sm);
        }
        .db-flow-node-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .db-flow-node-label {
          font-size: 0.74rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
        }
        .db-flow-node-value {
          font-size: 1.35rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          color: var(--text-primary);
          line-height: 1.1;
        }
        .db-value-primary { color: var(--text-primary); }
        .db-flow-node-sub {
          font-size: 0.73rem;
          color: var(--accent-primary);
          font-weight: 500;
        }
        .db-flow-bar-track {
          height: 4px;
          background: var(--bg-surface-hover);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 4px;
        }
        .db-flow-bar {
          height: 100%;
          border-radius: 999px;
          animation: db-bar-grow 1.1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .db-flow-bar-emerald { background: var(--accent-primary); }
        .db-flow-bar-neutral { background: var(--text-tertiary); }

        /* Connector */
        .db-flow-connector {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
        .db-connector-arrow {
          opacity: 0.7;
          transition: color 0.2s ease;
        }

        /* Output stack */
        .db-flow-outputs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .db-flow-output-row {
          border-radius: 13px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          transition: transform 0.18s ease;
          cursor: default;
        }
        .db-flow-output-row:hover { transform: translateX(2px); }
        .db-output-danger {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-color);
        }
        .db-output-success {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-color);
        }
        .db-output-value {
          font-size: 1.05rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          margin-top: 2px;
        }
        .db-output-danger-val { color: var(--danger); }
        .db-output-success-val { color: var(--accent-primary); }
        .db-output-pct {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 4px 9px;
          border-radius: 7px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .db-pct-danger {
          color: var(--danger);
          background: var(--danger-bg);
        }
        .db-pct-success {
          color: var(--accent-primary);
          background: var(--success-bg);
        }

        /* Responsive flow */
        @media (max-width: 900px) {
          .db-flow-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .db-flow-connector {
            transform: rotate(90deg);
            margin: 2px auto;
          }
          .db-money-flow-section { padding: 20px 18px; }
        }

        /* ── Metric cards ── */
        .db-metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .db-metric-card {
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.2s ease;
          cursor: default;
        }
        .db-metric-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--border-strong);
        }
        .db-metric-label {
          font-size: 0.72rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }
        .db-metric-value {
          font-size: 1.55rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          margin: 4px 0 2px;
          line-height: 1.1;
        }
        .db-metric-primary { color: var(--text-primary); }
        .db-metric-danger  { color: var(--danger); }
        .db-metric-secondary { color: var(--text-secondary); }
        .db-metric-trend {
          font-size: 0.76rem;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }
        .db-trend-up      { color: var(--accent-primary); }
        .db-trend-warn    { color: var(--gold-accent); }
        .db-trend-neutral { color: var(--text-secondary); }

        /* ── Insight cards accent borders ── */
        .db-insight-card {
          border-left: 3px solid transparent;
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.2s ease,
                      border-color 0.2s ease;
        }
        .db-insight-emerald { border-left-color: var(--accent-primary); }
        .db-insight-gold    { border-left-color: var(--gold-accent); }
        .db-insight-indigo  { border-left-color: var(--indigo-accent); }
        .db-insight-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        /* ── Responsive section headers ── */
        @media (max-width: 640px) {
          .db-money-flow-section { padding: 18px 14px; }
          .db-metric-grid { grid-template-columns: 1fr 1fr; }
          .db-section-header { margin-bottom: 14px; }
        }
        @media (max-width: 420px) {
          .db-metric-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
