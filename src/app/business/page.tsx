'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore, computeRealOverview } from '../../store/useStore';
import { BusinessInvoice } from '../../lib/mock-data';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { CalculationPanel } from '../../components/CalculationPanel';
import { computeRunway } from '../../lib/finance-tools';
import {
  Briefcase,
  TrendingUp,
  Building2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShieldCheck,
  Receipt,
  FileSearch,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Calendar,
  Plus,
  Loader2,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/AuthContext';
import { AddAccountModal } from '../../components/AddAccountModal';
import { AddTransactionModal } from '../../components/AddTransactionModal';

export default function BusinessPage() {
  const { accounts, transactions, invoices, dataMode, isHydrating, lastSyncedAt, dataError, fetchAndHydrate } = useStore();
  const { user } = useAuth();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [agingFilter, setAgingFilter] = useState<string>('ALL');

  useEffect(() => {
    if (user?.id && dataMode !== 'DEMO') {
      fetchAndHydrate(user.id);
    }
  }, [user?.id, dataMode, fetchAndHydrate]);

  // Derive business overview deterministically
  const bizOverview = useMemo(() => {
    if (dataMode === 'DEMO') {
      return {
        revenue: 1200000,
        burnRate: 850000,
        profit: 350000,
        cash: 3200000,
        monthlyIncome: 1200000,
        monthlyExpenses: 850000,
        monthlySurplus: 350000,
        margin: 29.1,
      };
    }
    const overview = computeRealOverview(accounts, transactions, 'BUSINESS');
    const margin = overview.monthlyIncome > 0
      ? Number(((overview.monthlySurplus / overview.monthlyIncome) * 100).toFixed(1))
      : 0;
    return {
      revenue: overview.monthlyIncome,
      burnRate: overview.monthlyExpenses,
      profit: overview.monthlySurplus,
      cash: overview.cash,
      monthlyIncome: overview.monthlyIncome,
      monthlyExpenses: overview.monthlyExpenses,
      monthlySurplus: overview.monthlySurplus,
      margin,
    };
  }, [accounts, transactions, dataMode]);

  const bizRunway = useMemo(() => {
    return computeRunway(bizOverview.cash, bizOverview.burnRate, bizOverview.revenue);
  }, [bizOverview]);

  // Business transactions & accounts
  const bizAccounts = useMemo(() => {
    return accounts.filter((a) => a.organization_id !== null);
  }, [accounts]);

  const bizTransactions = useMemo(() => {
    return transactions.filter((t) => t.entity === 'BUSINESS');
  }, [transactions]);

  // Dynamic OPEX Breakdown from real transactions
  const opexBreakdown = useMemo(() => {
    if (dataMode === 'DEMO') {
      return [
        { category: 'Engineering & Core Team Payroll', amount: 420000, pct: 49.4, color: 'var(--accent-primary)' },
        { category: 'AWS Cloud Compute & GPU Infrastructure', amount: 245000, pct: 28.8, color: 'var(--indigo-accent)' },
        { category: 'Product Growth & Developer Marketing', amount: 120000, pct: 14.1, color: 'var(--gold-accent)' },
        { category: 'Legal Counsel & Statutory Retainers', amount: 65000, pct: 7.7, color: 'var(--text-secondary)' },
      ];
    }

    const outflows = bizTransactions.filter((t) => t.type === 'OUTFLOW');
    const totalOutflow = outflows.reduce((s, t) => s + t.amount, 0);
    if (totalOutflow === 0) return [];

    const catMap: Record<string, number> = {};
    outflows.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const colors = ['var(--accent-primary)', 'var(--indigo-accent)', 'var(--gold-accent)', 'var(--text-secondary)', 'var(--danger)'];
    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amount], idx) => ({
        category: cat,
        amount,
        pct: Number(((amount / totalOutflow) * 100).toFixed(1)),
        color: colors[idx % colors.length],
      }));
  }, [dataMode, bizTransactions]);

  // Filter invoices (available in DEMO mode)
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (agingFilter !== 'ALL' && inv.agingBucket !== agingFilter) return false;
      return true;
    });
  }, [invoices, agingFilter]);

  const totalReceivables = invoices
    .filter((inv) => inv.type === 'RECEIVABLE')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPayables = invoices
    .filter((inv) => inv.type === 'PAYABLE')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueReceivables = invoices
    .filter((inv) => inv.type === 'RECEIVABLE' && inv.agingBucket === '60+ Days Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (isHydrating && dataMode !== 'DEMO' && lastSyncedAt === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={20} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.94rem', color: 'var(--text-secondary)' }}>Synchronizing enterprise workspace telemetry...</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ padding: '20px 22px', height: '110px', opacity: 0.5 }} />
          ))}
        </div>
        <div className="glass-panel" style={{ padding: '24px', height: '280px', opacity: 0.5 }} />
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
            <span>Business Telemetry Synchronization Error: {dataError}</span>
          </div>
          <button
            type="button"
            onClick={() => user?.id && fetchAndHydrate(user.id, { force: true })}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-emerald">Enterprise Financial Controller</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              {dataMode === 'DEMO' ? 'Demo Corporate Organization' : 'Verified Enterprise Workspace'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={22} />
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Enterprise Financial Operations</h1>
          </div>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Corporate general ledger sync, working capital management, burn rate analytics, and invoice aging reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsAddAccountOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.84rem' }}
          >
            <Plus size={15} />
            <span>Add Business Account</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddTxOpen(true)}
            className="btn-secondary"
            style={{ fontSize: '0.84rem' }}
          >
            <Plus size={15} />
            <span>Record Business Flow</span>
          </button>
          <Link href="/finance-controller" className="btn-secondary" style={{ fontSize: '0.84rem' }}>
            <ShieldCheck size={16} />
            <span>Finance Controller</span>
          </Link>
          <Link href="/reconciliation" className="btn-secondary" style={{ fontSize: '0.84rem' }}>
            Reconciliation Center
          </Link>
        </div>
      </div>

      {/* ── ENTERPRISE KPI STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Monthly Enterprise Revenue
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            <AnimatedNumber value={bizOverview.revenue} format="currency" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            <ArrowUpRight size={13} />
            <span>{dataMode === 'DEMO' ? '+24.8% YoY growth' : 'Reconciled Inflows'}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Operating OPEX Burn
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--danger)', margin: '4px 0' }}>
            <AnimatedNumber value={bizOverview.burnRate} format="currency" />
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            {bizOverview.margin}% Net Operating Margin
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Liquid Treasury Reserves
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            <AnimatedNumber value={bizOverview.cash} format="currency" />
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>
            {bizOverview.cash === 0 ? '0' : bizRunway.data.runwayMonths} Months Runway Buffer
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Accounts Receivable (AR)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: overdueReceivables > 0 ? 'var(--gold-accent)' : 'var(--accent-primary)' }}>
            {dataMode === 'DEMO' ? (overdueReceivables > 0 ? `₹${(overdueReceivables / 100000).toFixed(1)}L Past 60 Days` : 'All invoices current') : 'Awaiting ERP Link'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Accounts Payable (AP)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            ₹{totalPayables.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>
            {dataMode === 'DEMO' ? 'All vendor terms scheduled' : 'Awaiting ERP Link'}
          </div>
        </div>
      </div>

      {/* ── WORKING CAPITAL & OPEX ALLOCATION MATRIX ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="biz-grid">
        {/* OPEX Breakdown */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Monthly OPEX Distribution</h3>
            <span className="pill-badge pill-neutral">
              ₹{bizOverview.burnRate.toLocaleString('en-IN')} Monthly Baseline
            </span>
          </div>

          {opexBreakdown.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.86rem' }}>
              No corporate expense records found for this billing cycle. Record business outflow transactions to populate OPEX attribution.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {opexBreakdown.map((item, idx) => (
                <div key={idx} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{item.category}</span>
                    <span style={{ fontSize: '0.94rem', fontWeight: 700, fontFamily: 'Outfit' }}>₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                    <span>Allocation: {item.pct}% of monthly burn</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '999px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Working Capital Runway Strategy */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Treasury &amp; Runway Health</h3>
            <span className="pill-badge pill-emerald">
              {bizOverview.cash === 0 ? '0' : bizRunway.data.runwayMonths} Months Solvent
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {dataMode === 'DEMO'
              ? 'The enterprise operates at a healthy net monthly operating surplus of ₹3.5L (29.1% net margin). Treasury liquid reserves of ₹32L provide robust 9.2-month buffer coverage against zero-revenue stress conditions.'
              : bizOverview.monthlyIncome >= bizOverview.monthlyExpenses
              ? `Enterprise operates at a monthly surplus of ₹${bizOverview.monthlySurplus.toLocaleString('en-IN')} (${bizOverview.margin}% margin). Available treasury reserves of ₹${bizOverview.cash.toLocaleString('en-IN')} provide ${bizRunway.data.runwayMonths} months of baseline expense coverage buffer.`
              : `At a net monthly burn rate of ₹${Math.abs(bizOverview.monthlySurplus).toLocaleString('en-IN')}, available treasury reserves of ₹${bizOverview.cash.toLocaleString('en-IN')} sustain operations for ${bizRunway.data.runwayMonths} months.`}
          </p>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Weighted Average DSO:</span>
              <span style={{ fontWeight: 700 }}>{dataMode === 'DEMO' ? '48 Days (Target: 45 Days)' : 'Audited via Ledger'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Accounts Payable Terms:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{dataMode === 'DEMO' ? '30 Days (100% Current)' : 'Scheduled Terms'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Overnight Sweep Retention:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{dataMode === 'DEMO' ? '7.2% Annualized Yield' : 'Active'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
            <Link href="/financial-twin" className="btn-secondary" style={{ fontSize: '0.82rem' }}>
              <span>Simulate Hiring &amp; Growth in Twin</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── ACCOUNTS RECEIVABLE & PAYABLE REGISTER / EMPTY STATE ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Accounts Receivable &amp; Payable Aging Register</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Reconciled invoice telemetry with counterparty aging status</p>
          </div>

          {/* Aging Filter */}
          {invoices.length > 0 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'Current', '1-30 Days', '60+ Days Overdue'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={agingFilter === filter ? 'btn-primary' : 'btn-ghost'}
                  style={{ fontSize: '0.76rem', padding: '5px 10px' }}
                  onClick={() => setAgingFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {invoices.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Receipt size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No Enterprise Invoices Recorded
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              Direct AR/AP invoice aging telemetry is active in the Demo Workspace. In production, enterprise invoice records sync directly with your connected ERP and General Ledger.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsAddAccountOpen(true)}
                style={{ fontSize: '0.84rem' }}
              >
                <Plus size={15} />
                <span>Add Corporate Bank Account</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsAddTxOpen(true)}
                style={{ fontSize: '0.84rem' }}
              >
                <Plus size={15} />
                <span>Record Flow Entry</span>
              </button>
              {dataMode !== 'DEMO' && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => useStore.getState().activateDemo()}
                  style={{ fontSize: '0.84rem' }}
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
                  <th>Invoice ID</th>
                  <th>Counterparty</th>
                  <th>Type</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Aging Bucket</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{inv.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.counterparty}</td>
                    <td>
                      <span className={`pill-badge ${inv.type === 'RECEIVABLE' ? 'pill-emerald' : 'pill-gold'}`} style={{ fontSize: '0.65rem' }}>
                        {inv.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{inv.issueDate}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.dueDate}</td>
                    <td>
                      <span className={`pill-badge ${inv.agingBucket === '60+ Days Overdue' ? 'pill-danger' : inv.agingBucket === '1-30 Days' ? 'pill-gold' : 'pill-emerald'}`} style={{ fontSize: '0.65rem' }}>
                        {inv.agingBucket}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'Outfit', color: inv.type === 'RECEIVABLE' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`pill-badge ${inv.status === 'PAID' ? 'pill-emerald' : inv.status === 'DISPUTED' ? 'pill-danger' : 'pill-gold'}`} style={{ fontSize: '0.62rem' }}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modals */}
      <AddAccountModal
        open={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        defaultAccountType="cash"
        defaultEntity="BUSINESS"
      />
      <AddTransactionModal
        open={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      <style jsx>{`
        @media (max-width: 900px) {
          .biz-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
