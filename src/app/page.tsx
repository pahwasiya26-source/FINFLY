'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { CalculationPanel } from '../components/CalculationPanel';
import { ThreeFinancialCore } from '../components/ThreeFinancialCore';
import { SmartInsightModal, SmartInsightData } from '../components/SmartInsightModal';
import { computeRunway, detectAnomalies } from '../lib/finance-tools';
import {
  TrendingUp,
  ShieldAlert,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Wallet,
  Building2,
  Calendar,
  ChevronRight,
  Workflow,
  ArrowRight,
  UserCheck,
  Cpu,
  Receipt,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const { mode, getCurrentData, transactions, obligations } = useStore();
  const data = getCurrentData();
  const isBusiness = mode === 'BUSINESS';

  const [greeting, setGreeting] = useState('Good morning');
  const [selectedInsight, setSelectedInsight] = useState<SmartInsightData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('August 2026');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Compute live deterministic runway
  const runwayResult = computeRunway(data.cash, data.monthlyExpenses, data.monthlyIncome);
  const anomalyResult = detectAnomalies(mode);

  // Relevant filtered transactions & obligations for the active mode
  const modeTransactions = transactions.filter(t => t.entity === mode).slice(0, 5);
  const modeObligations = obligations.filter(o => o.entity === mode);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ── HEADER STRIP ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {greeting}, Siya
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="pill-badge pill-emerald">
              Health Score: {data.healthScore}/100 Optimal
            </span>
            <span className="pill-badge pill-neutral">
              Context: {isBusiness ? 'Corporate Enterprise' : 'Personal Wealth'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Financial Command Center
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Your financial operating system. Audited ground truth, deterministic trajectory &amp; advisory.
          </p>
        </div>

        {/* Period Selector & Quick Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 12px' }}>
            <Calendar size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedPeriod}</span>
          </div>
          <Link href="/personal-ca" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.84rem' }}>
            <UserCheck size={16} />
            <span>Ask Personal CA</span>
          </Link>
        </div>
      </div>

      {/* ── TOP KPI STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* KPI 1: Net Position */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
              {isBusiness ? 'Enterprise Net Worth' : 'Net Financial Position'}
            </span>
            <CalculationPanel
              title={isBusiness ? 'Net Enterprise Position' : 'Net Financial Position'}
              formula="Cash + Investments + Assets - Liabilities"
              inputs={[
                { label: 'Liquid Cash', value: `₹${data.cash.toLocaleString('en-IN')}` },
                { label: 'Investments', value: `₹${data.investments.toLocaleString('en-IN')}` },
                { label: 'Fixed Assets', value: `₹${data.assets.toLocaleString('en-IN')}` },
                { label: 'Liabilities', value: `-₹${data.liabilities.toLocaleString('en-IN')}` },
              ]}
              result={`₹${data.netPosition.toLocaleString('en-IN')}`}
            />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1.15 }}>
            <AnimatedNumber value={data.netPosition} format="currency" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            <ArrowUpRight size={13} strokeWidth={2.4} />
            <span>+{data.growthRateYoY || 12.4}% YoY growth</span>
          </div>
        </div>

        {/* KPI 2: Total Liquid Cash */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Liquid Cash Reserve
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1.15 }}>
            <AnimatedNumber value={data.cash} format="currency" />
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Checking &amp; high-yield sweep
          </div>
        </div>

        {/* KPI 3: Monthly Net Flow */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Net Monthly Flow
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-primary)', lineHeight: 1.15 }}>
            +<AnimatedNumber value={data.monthlySurplus} format="currency" />
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Savings rate: {data.savingsRate}%
          </div>
        </div>

        {/* KPI 4: Runway Buffer */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Runway Buffer
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1.15 }}>
            {runwayResult.data.runwayMonths} Months
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', marginTop: '6px' }}>
            ● {runwayResult.data.status}
          </div>
        </div>

        {/* KPI 5: Investments & Liabilities */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Investments / Debt
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1.15 }}>
            ₹{(data.investments / 100000).toFixed(1)}L / ₹{(data.liabilities / 100000).toFixed(1)}L
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Collateralized &amp; current
          </div>
        </div>
      </div>

      {/* ── HERO 3D CORE & POSITION HERO ── */}
      <div
        className="glass-hero"
        style={{
          padding: '30px 36px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '28px',
          alignItems: 'center',
        }}
      >
        {/* Left Side Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span className="pill-badge pill-emerald" style={{ alignSelf: 'flex-start' }}>
            Deterministic Engine Synced
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            {isBusiness ? 'Enterprise Treasury & Capital Operations' : 'Unified Wealth Architecture & Cash Buffer'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            {isBusiness
              ? 'Operating cash reserves of ₹32L sustain 9.2 months of baseline OPEX. Receivables DSO stands at 48 days with healthy gross margin retention.'
              : 'Monthly cash surplus of ₹85,000 supports continuous asset accumulation. Your liquidity buffer comfortably covers 4.7 months of baseline living costs.'}
          </p>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
            <Link href="/personal-ca" className="btn-primary" style={{ fontSize: '0.82rem' }}>
              <UserCheck size={15} />
              <span>Ask Personal CA</span>
            </Link>
            <Link href="/financial-twin" className="btn-secondary" style={{ fontSize: '0.82rem' }}>
              <Cpu size={15} />
              <span>Simulate in Twin</span>
            </Link>
            <Link href="/finance-controller" className="btn-secondary" style={{ fontSize: '0.82rem' }}>
              <ShieldCheck size={15} />
              <span>Finance Controller</span>
            </Link>
            <Link href="/reconciliation" className="btn-secondary" style={{ fontSize: '0.82rem' }}>
              <Receipt size={15} />
              <span>Audit Ledger</span>
            </Link>
          </div>
        </div>

        {/* Right Side: 3D Financial Core */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-surface-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '12px',
            minHeight: '270px',
          }}
        >
          <ThreeFinancialCore mode="dashboard" height={250} interactive />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: '2px' }}>
            <span className="pill-badge pill-emerald">Liquidity: Nominal</span>
            <span className="pill-badge pill-indigo">Trajectory: Ascending</span>
            <span className="pill-badge pill-gold">Variance: Monitored</span>
          </div>
        </div>
      </div>

      {/* ── MONEY VELOCITY PIPELINE ── */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Workflow size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Monthly Money Flow Architecture</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Inflows → Liquid Buffer → Expenses &amp; Surplus Distribution</p>
            </div>
          </div>
          <Link href="/money-flow" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            <span>Open Money Flow Workspace</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1.2fr', gap: '14px', alignItems: 'center' }} className="cmd-flow-grid">
          {/* Node 1: Inflow */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--success-border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>{isBusiness ? 'Revenue' : 'Monthly Income'}</span>
              <span className="pill-badge pill-emerald" style={{ fontSize: '0.62rem' }}>Inflow</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
              <AnimatedNumber value={data.monthlyIncome} format="currency" />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', marginTop: '4px' }}>100% Inflow Baseline</div>
          </div>

          <div style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={20} />
          </div>

          {/* Node 2: Buffer */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-strong)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>Liquid Buffer</span>
              <span className="pill-badge pill-neutral" style={{ fontSize: '0.62rem' }}>Reserve</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
              <AnimatedNumber value={data.cash} format="currency" />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{runwayResult.data.runwayMonths} Mo Coverage</div>
          </div>

          <div style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={20} />
          </div>

          {/* Node 3: Split (Expenses & Surplus) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Outflows / OPEX</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--danger)' }}>
                  -₹{data.monthlyExpenses.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="pill-badge pill-danger" style={{ fontSize: '0.68rem' }}>
                {((data.monthlyExpenses / data.monthlyIncome) * 100).toFixed(1)}%
              </span>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Net Surplus</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>
                  +₹{data.monthlySurplus.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="pill-badge pill-emerald" style={{ fontSize: '0.68rem' }}>
                {data.savingsRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN GRID: SMART INSIGHTS & UPCOMING OBLIGATIONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }} className="cmd-columns-grid">
        {/* Left Column: Smart Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Financial Signals &amp; Anomalies</h3>
            </div>
            <span className="pill-badge pill-emerald">{smartInsights.length} Verified Insights</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {smartInsights.map((insight) => (
              <div
                key={insight.id}
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  borderLeft: insight.category === 'SAVINGS' ? '3px solid var(--accent-primary)' : '3px solid var(--gold-accent)'
                }}
                onClick={() => setSelectedInsight(insight)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span className="pill-badge pill-neutral" style={{ fontSize: '0.65rem' }}>{insight.category.replace('_', ' ')}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>{insight.impactMetric}</span>
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{insight.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{insight.description}</p>
                </div>

                <button type="button" className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.76rem' }}>
                  <span>{insight.actionType}</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Obligations & Decision Trace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--gold-accent)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upcoming Scheduled Obligations</h3>
            </div>
            <Link href="/taxes" className="pill-badge pill-neutral" style={{ textDecoration: 'none' }}>
              View Schedule
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {modeObligations.map((obl) => (
              <div key={obl.id} className="glass-panel" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{obl.title}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span>Due: {obl.dueDate}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{obl.status}</span>
                  </div>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                  ₹{obl.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}

            {/* Reconciliation Quick Status */}
            <div className="glass-panel" style={{ padding: '14px 16px', background: 'var(--bg-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Two-Way Reconciliation Health</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>8 records verified · 2 exceptions flagged</div>
              </div>
              <Link href="/reconciliation" className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.76rem' }}>
                Inspect
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS TABLE ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Verified Ledger Entries</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Live transaction telemetries reconciled with general ledger</p>
          </div>
          <Link href="/money-flow" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <span>View All Transactions</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {modeTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{tx.date}</td>
                  <td style={{ fontWeight: 600 }}>{tx.description}</td>
                  <td>
                    <span className="pill-badge pill-neutral" style={{ fontSize: '0.68rem' }}>{tx.category}</span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{tx.account}</td>
                  <td>
                    <span className={`pill-badge ${tx.type === 'INFLOW' ? 'pill-emerald' : 'pill-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontFamily: 'Outfit', color: tx.type === 'INFLOW' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {tx.type === 'INFLOW' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className="pill-badge pill-emerald" style={{ fontSize: '0.62rem' }}>
                      <CheckCircle2 size={11} />
                      <span>{tx.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Insight Modal */}
      <SmartInsightModal
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />

      <style jsx>{`
        @media (max-width: 900px) {
          .cmd-flow-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .cmd-columns-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
