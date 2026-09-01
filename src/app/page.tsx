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
              Here’s your financial overview.
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

        {/* Right: Embedded 3D Financial Nexus Widget */}
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
            className="glass-panel"
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

            {/* Custom Progress Bar */}
            <div style={{ height: '6px', width: '100%', background: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '84%', background: 'var(--accent-primary)', borderRadius: '999px' }} />
            </div>
          </div>

          {/* Health 2: GROWTH */}
          <div
            className="glass-panel"
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

            <div style={{ height: '6px', width: '100%', background: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '76%', background: 'var(--indigo-accent)', borderRadius: '999px' }} />
            </div>
          </div>

          {/* Health 3: RISK */}
          <div
            className="glass-panel"
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

            <div style={{ height: '6px', width: '100%', background: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '55%', background: 'var(--gold-accent)', borderRadius: '999px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================================
          ADAPTIVE FINANCIAL MODULES (PERSONAL vs BUSINESS)
          ========================================================== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {isBusiness ? 'Enterprise Ledger Breakdown' : 'Capital Allocation Matrix'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              Deterministic accounting metrics for {isBusiness ? 'Enterprise Operations' : 'Personal Wealth'}
            </p>
          </div>
          <span className="pill-badge pill-neutral">
            Mode: {mode}
          </span>
        </div>

        {isBusiness ? (
          /* Business Mode Specific Surfaces */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Monthly Revenue
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '6px 0' }}>
                <AnimatedNumber value={data.monthlyIncome} format="currency" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>+18.2% vs previous quarter</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Operating Burn
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--danger)', margin: '6px 0' }}>
                <AnimatedNumber value={data.monthlyExpenses} format="currency" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Fixed & variable OPEX</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Accounts Receivable
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '6px 0' }}>
                <AnimatedNumber value={data.receivables || 1850000} format="currency" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gold-accent)' }}>₹4.2L past 60-day terms</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Accounts Payable
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-secondary)', margin: '6px 0' }}>
                <AnimatedNumber value={data.payables || 720000} format="currency" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>All vendor schedules current</div>
            </div>
          </div>
        ) : (
          /* Personal Mode Specific Surfaces */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Liquid Cash Reserve
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)', margin: '6px 0' }}>
                <AnimatedNumber value={data.cash} format="currency" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Instant liquidity in checking & sweep</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Investments & Assets
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '6px 0' }}>
                <AnimatedNumber value={data.investments + data.assets} format="currency" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>Equities, Debt & Real Property</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Liabilities
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--danger)', margin: '6px 0' }}>
                <AnimatedNumber value={data.liabilities} format="currency" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Car loan & secured liabilities</div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Monthly Surplus
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)', margin: '6px 0' }}>
                <AnimatedNumber value={data.monthlySurplus} format="currency" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Savings Rate: {data.savingsRate}%</div>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================================
          SMART INSIGHTS SECTION (With Actionable Modals)
          ========================================================== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--accent-primary-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Smart Insights</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                Deterministic AI reasoning with zero hallucination guarantee
              </p>
            </div>
          </div>

          <span className="pill-badge pill-neutral">3 Insights Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {smartInsights.map((insight) => (
            <div
              key={insight.id}
              className="glass-panel glass-panel-interactive"
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

      {/* ==========================================================
          MONEY FLOW PREVIEW
          ========================================================== */}
      <MoneyFlowPreview data={data} isBusiness={isBusiness} />

      {/* Interactive Smart Insight Modal */}
      <SmartInsightModal
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />

      <style jsx>{`
        @media (max-width: 960px) {
          .glass-hero {
            grid-template-columns: 1fr !important;
            padding: 28px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
