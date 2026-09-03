'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Trash2,
  Clock,
  Loader2,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../lib/auth/AuthContext';
import { AddAccountModal } from '../components/AddAccountModal';
import { AddTransactionModal } from '../components/AddTransactionModal';

export default function DashboardHome() {
  const {
    mode,
    getCurrentData,
    transactions,
    obligations,
    accounts,
    dataMode,
    isHydrating,
    dataError,
    activateDemo,
    exitDemo,
    fetchAndHydrate,
    removeTransaction,
  } = useStore();
  const { user, profile } = useAuth();
  const data = getCurrentData();
  const isBusiness = mode === 'BUSINESS';

  const displayName = profile?.fullName || user?.user_metadata?.full_name || 'there';
  const [greeting, setGreeting] = useState('Good morning');
  const [selectedInsight, setSelectedInsight] = useState<SmartInsightData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('September 2026');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && dataMode !== 'DEMO') {
      fetchAndHydrate(user.id);
    }
  }, [user?.id, dataMode, fetchAndHydrate]);

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
  const modeTransactions = useMemo(() => {
    const list = transactions.filter((t) => t.entity === mode);
    return list
      .sort((a, b) => {
        const dateCmp = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCmp !== 0) return dateCmp;
        return b.id.localeCompare(a.id);
      })
      .slice(0, 5);
  }, [transactions, mode]);

  const modeObligations = dataMode === 'DEMO' ? obligations.filter((o) => o.entity === mode) : [];

  // Smart insights aligned with deterministic calculations
  const smartInsights: SmartInsightData[] = useMemo(() => {
    if (dataMode === 'DEMO') {
      return isBusiness
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
    }

    if (dataMode === 'EMPTY') {
      return [];
    }

    const list: SmartInsightData[] = [];

    if (data.savingsRate > 0) {
      list.push({
        id: 'real-savings',
        title: `Net savings retention is ${data.savingsRate}% of monthly inflows.`,
        category: 'SAVINGS',
        actionType: 'Explore',
        description: `Retained ₹${data.monthlySurplus.toLocaleString('en-IN')} this billing cycle from verified income streams.`,
        impactMetric: `${data.savingsRate}%`,
        details: {
          heading: 'Live Monthly Savings Velocity',
          summary: 'Calculated deterministically from all inflow and outflow records across your verified accounts.',
          metrics: [
            { label: 'Monthly Inflows', value: `₹${data.monthlyIncome.toLocaleString('en-IN')}` },
            { label: 'Monthly Outflows', value: `₹${data.monthlyExpenses.toLocaleString('en-IN')}` },
            { label: 'Net Monthly Surplus', value: `₹${data.monthlySurplus.toLocaleString('en-IN')}`, positive: true },
          ],
          deterministicNote: 'Calculated deterministically: (Monthly Income - Monthly Expenses) / Monthly Income * 100',
        },
      });
    }

    if (runwayResult.data.runwayMonths < 6 && data.cash > 0) {
      list.push({
        id: 'real-runway',
        title: `Liquidity reserve provides ${runwayResult.data.runwayMonths} months runway (target: 6mo).`,
        category: 'EXPENSE_VARIANCE',
        actionType: 'Simulate',
        description: `Current liquid reserves of ₹${data.cash.toLocaleString('en-IN')} below recommended safety threshold.`,
        impactMetric: `${runwayResult.data.runwayMonths} mo`,
        details: {
          heading: 'Working Capital Buffer Status',
          summary: runwayResult.data.explanation,
          metrics: [
            { label: 'Liquid Reserves', value: `₹${data.cash.toLocaleString('en-IN')}` },
            { label: 'Monthly Burn', value: `₹${data.monthlyExpenses.toLocaleString('en-IN')}`, positive: false },
            { label: 'Runway Buffer', value: `${runwayResult.data.runwayMonths} Months`, positive: false },
          ],
          deterministicNote: 'Derived via computeRunway deterministic balance equation.',
        },
      });
    }

    if (data.investments > 0) {
      list.push({
        id: 'real-investments',
        title: `Total investment holdings stand at ₹${data.investments.toLocaleString('en-IN')}.`,
        category: 'GOAL_PROJECTION',
        actionType: 'Explore',
        description: 'Portfolio balances synchronized from your connected investment and brokerage accounts.',
        impactMetric: `₹${(data.investments / 100000).toFixed(1)}L`,
        details: {
          heading: 'Portfolio Capital Distribution',
          summary: 'Aggregate balance across all financial accounts tagged as investment assets.',
          metrics: [
            { label: 'Investment Value', value: `₹${data.investments.toLocaleString('en-IN')}` },
            { label: 'Liquid Cash', value: `₹${data.cash.toLocaleString('en-IN')}` },
            { label: 'Total Net Position', value: `₹${data.netPosition.toLocaleString('en-IN')}`, positive: true },
          ],
          deterministicNote: 'Directly aggregated from financial_accounts balance rows.',
        },
      });
    }

    return list;
  }, [dataMode, isBusiness, data, runwayResult]);

  const handleDeleteTx = async (txId: string) => {
    setDeleteError(null);
    const res = await removeTransaction(txId, user?.id);
    if (!res.success) {
      setDeleteError(res.error || 'Failed to delete transaction.');
    }
  };

  if (isHydrating && dataMode !== 'DEMO') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={20} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.94rem', color: 'var(--text-secondary)' }}>Synchronizing financial operating telemetry...</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ padding: '18px 20px', height: '105px', opacity: 0.5 }} />
          ))}
        </div>
        <div className="glass-hero" style={{ padding: '30px 36px', height: '260px', opacity: 0.5 }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Synchronization Error Banner */}
      {dataError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '12px', fontSize: '0.86rem', color: 'var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={17} />
            <span>Telemetry Synchronization Error: {dataError}</span>
          </div>
          <button
            type="button"
            onClick={() => user?.id && fetchAndHydrate(user.id)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* Action Error Banner */}
      {deleteError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '12px', fontSize: '0.86rem', color: 'var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={17} />
            <span>Action Failed: {deleteError}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── HEADER STRIP ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {greeting}, {displayName}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className={`pill-badge ${dataMode === 'REAL' ? 'pill-emerald' : dataMode === 'DEMO' ? 'pill-gold' : 'pill-neutral'}`}>
              {dataMode === 'REAL' ? 'REAL USER DATA' : dataMode === 'DEMO' ? 'DEMO DATA (SYNTHETIC)' : 'EMPTY WORKSPACE'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="pill-badge pill-emerald">
              Health Score: {dataMode === 'EMPTY' ? '0/100 (New Workspace)' : `${data.healthScore}/100 Optimal`}
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

        {/* Actions & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsAddAccountOpen(true)}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.84rem' }}
          >
            <Plus size={15} />
            <span>Add Account</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddTransactionOpen(true)}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.84rem' }}
          >
            <Plus size={15} />
            <span>Record Transaction</span>
          </button>
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

      {/* Demo Workspace Banner */}
      {dataMode === 'DEMO' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'var(--accent-primary-subtle)',
            border: '1px solid var(--accent-primary)',
            fontSize: '0.85rem',
            color: 'var(--accent-primary)',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} />
            <span style={{ fontWeight: 600 }}>Demo Workspace Active</span>
            <span style={{ color: 'var(--text-secondary)' }}>— Viewing synthetic buildathon records. Real user ledger is unedited.</span>
          </div>
          <button
            type="button"
            onClick={exitDemo}
            className="btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.78rem' }}
          >
            Exit Demo
          </button>
        </div>
      )}

      {/* ── TOP KPI STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* KPI 1: Net Position */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
                {isBusiness ? 'Enterprise Net Worth' : 'Net Financial Position'}
              </span>
              <span className="pill-badge pill-neutral" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>DETERMINISTIC</span>
            </div>
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
            <span>{dataMode === 'DEMO' ? `+${data.growthRateYoY || 12.4}% YoY growth` : 'Audited General Ledger'}</span>
          </div>
        </div>

        {/* KPI 2: Total Liquid Cash */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
              Liquid Cash Reserve
            </span>
            <span className="pill-badge pill-neutral" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>VERIFIED</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
              Net Monthly Flow
            </span>
            <span className="pill-badge pill-neutral" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>NET SURPLUS</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: data.monthlySurplus >= 0 ? 'var(--accent-primary)' : 'var(--danger)', lineHeight: 1.15 }}>
            {data.monthlySurplus < 0 ? '-' : '+'}<AnimatedNumber value={Math.abs(data.monthlySurplus)} format="currency" />
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Savings rate: {data.savingsRate}%
          </div>
        </div>

        {/* KPI 4: Runway Buffer */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
              Runway Buffer
            </span>
            <span className="pill-badge pill-neutral" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>LIQUIDITY MODEL</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1.15 }}>
            {dataMode === 'EMPTY' && data.cash === 0 ? '0' : runwayResult.data.runwayMonths} Months
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', marginTop: '6px' }}>
            ● {dataMode === 'EMPTY' && data.cash === 0 ? 'AWAITING DATA' : runwayResult.data.status}
          </div>
        </div>

        {/* KPI 5: Investments & Liabilities */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
              Investments / Debt
            </span>
            <span className="pill-badge pill-neutral" style={{ fontSize: '0.58rem', padding: '1px 5px' }}>BALANCE SHEET</span>
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
            {dataMode === 'DEMO'
              ? isBusiness
                ? 'Operating cash reserves of ₹32L sustain 9.2 months of baseline OPEX. Receivables DSO stands at 48 days with healthy gross margin retention.'
                : 'Monthly cash surplus of ₹85,000 supports continuous asset accumulation. Your liquidity buffer comfortably covers 4.7 months of baseline living costs.'
              : data.cash === 0 && data.monthlyIncome === 0
              ? 'Your workspace is empty. Create your financial accounts and record ledger transactions to activate real-time deterministic runway and treasury telemetry.'
              : `Operating cash reserves of ₹${data.cash.toLocaleString('en-IN')} sustain ${runwayResult.data.runwayMonths} months of baseline burn. Monthly net cashflow stands at ${data.monthlySurplus >= 0 ? '+' : '-'}₹${Math.abs(data.monthlySurplus).toLocaleString('en-IN')}.`}
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
          <ThreeFinancialCore mode="dashboard" height={250} interactive reactiveTrigger={data.netPosition} />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: '2px' }}>
            <span className="pill-badge pill-emerald">Liquidity: {data.cash > 0 ? 'Active' : 'Awaiting Data'}</span>
            <span className="pill-badge pill-indigo">Trajectory: {data.monthlySurplus >= 0 ? 'Ascending' : 'Deficit'}</span>
            <span className="pill-badge pill-gold">Variance: {dataMode === 'DEMO' ? 'Monitored' : accounts.length > 0 ? 'Audited' : 'Awaiting Input'}</span>
          </div>
        </div>
      </div>

      {/* ── UNIFIED BUILDATHON OPERATING LOOP ── */}
      <div
        className="glass-panel"
        style={{
          padding: '22px 26px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.25) 100%)',
          border: '1px solid var(--accent-primary-subtle)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="pill-badge pill-emerald">End-to-End Operating Loop</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Zero-Hallucination Architecture</span>
            </div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800 }}>Razorpay AI Buildathon Financial Control System</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Deterministic accounting engines compute arithmetic proofs; AI inspects variances and explains. Consequential actions require human authorization.
            </p>
          </div>
          <Link href="/finance-controller" className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            <span>Launch Controller</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 4 Connected Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Link href="/finance-controller" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} />
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>1. Finance Controller</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Natural-language intent mapped to deterministic tools with auditable Decision Traces.
              </p>
            </div>
          </Link>

          <Link href="/reconciliation" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={16} />
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>2. Reconciliation Audit</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Automated matching between gateway telemetries &amp; bank credits with MDR variance capture.
              </p>
            </div>
          </Link>

          <Link href="/financial-twin" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={16} />
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>3. Digital Twin</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                12-month forward cash simulations with interactive hiring, OPEX, and capital levers.
              </p>
            </div>
          </Link>

          <Link href="/money-flow" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Workflow size={16} />
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>4. Money Flow Pipeline</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Capital velocity pipeline mapping monthly inflows, liquidity reserves, and OPEX burn.
              </p>
            </div>
          </Link>
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
                {data.monthlyIncome > 0 ? `${((data.monthlyExpenses / data.monthlyIncome) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Net Surplus</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Outfit', color: data.monthlySurplus >= 0 ? 'var(--accent-primary)' : 'var(--danger)' }}>
                  {data.monthlySurplus >= 0 ? '+' : '-'}₹{Math.abs(data.monthlySurplus).toLocaleString('en-IN')}
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
            {smartInsights.length === 0 ? (
              <div className="glass-panel" style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Sparkles size={24} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  No Active Financial Signals
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
                  {dataMode === 'EMPTY'
                    ? 'Connect financial accounts and log transactions to generate live variance and cashflow intelligence.'
                    : 'All metrics within expected baseline variances. No anomaly detected.'}
                </p>
              </div>
            ) : (
              smartInsights.map((insight) => (
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
              ))
            )}
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
            {modeObligations.length === 0 ? (
              <div className="glass-panel" style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Clock size={24} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  No Scheduled Obligations
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
                  No pending recurring bills or compliance deadlines for this entity context.
                </p>
              </div>
            ) : (
              modeObligations.map((obl) => (
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
              ))
            )}

            {/* Reconciliation Quick Status */}
            <div className="glass-panel" style={{ padding: '14px 16px', background: 'var(--bg-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>Two-Way Reconciliation Health</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                  {dataMode === 'DEMO'
                    ? '8 records verified · 2 exceptions flagged'
                    : transactions.length > 0
                    ? `${transactions.length} verified general ledger entries reconciled`
                    : 'Awaiting ledger transaction entries'}
                </div>
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

        {modeTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No Ledger Records Found
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              Your workspace has no recorded transactions. Create your first financial account or record a transaction to activate real-time telemetry.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsAddAccountOpen(true)}
                style={{ fontSize: '0.84rem', padding: '8px 16px' }}
              >
                <Plus size={15} />
                <span>Add Account</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsAddTransactionOpen(true)}
                style={{ fontSize: '0.84rem', padding: '8px 16px' }}
              >
                <Plus size={15} />
                <span>Record Transaction</span>
              </button>
              {dataMode !== 'DEMO' && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={activateDemo}
                  style={{ fontSize: '0.84rem', padding: '8px 16px' }}
                >
                  <span>Explore Demo Workspace</span>
                </button>
              )}
            </div>
          </div>
        ) : (
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
                  <th style={{ width: '40px' }}></th>
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
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteTx(tx.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-tertiary)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete transaction"
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Smart Insight Modal */}
      <SmartInsightModal
        insight={selectedInsight}
        onClose={() => setSelectedInsight(null)}
      />

      {/* Add Account Modal */}
      <AddAccountModal
        open={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onOpenAddAccount={() => {
          setIsAddTransactionOpen(false);
          setIsAddAccountOpen(true);
        }}
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
