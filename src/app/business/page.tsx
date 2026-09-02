'use client';

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { BusinessInvoice } from '../../lib/mock-data';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { CalculationPanel } from '../../components/CalculationPanel';
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
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function BusinessPage() {
  const { invoices } = useStore();
  const data = useStore((state) => state.getCurrentData());

  const [agingFilter, setAgingFilter] = useState<string>('ALL');

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (agingFilter !== 'ALL' && inv.agingBucket !== agingFilter) return false;
    return true;
  });

  const totalReceivables = invoices
    .filter((inv) => inv.type === 'RECEIVABLE')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPayables = invoices
    .filter((inv) => inv.type === 'PAYABLE')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueReceivables = invoices
    .filter((inv) => inv.type === 'RECEIVABLE' && inv.agingBucket === '60+ Days Overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-emerald">Enterprise Financial Controller</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>FINFLY Corporate Org</span>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/finance-controller" className="btn-primary" style={{ fontSize: '0.84rem' }}>
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
            ₹12,00,000
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            <ArrowUpRight size={13} />
            <span>+24.8% YoY growth</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Operating OPEX Burn
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--danger)', margin: '4px 0' }}>
            ₹8,50,000
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            29.1% Net Operating Margin
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Liquid Treasury Reserves
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            ₹32,00,000
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>
            9.2 Months Runway Buffer
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
            {overdueReceivables > 0 ? `₹${(overdueReceivables / 100000).toFixed(1)}L Past 60 Days` : 'All invoices current'}
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
            All vendor terms scheduled
          </div>
        </div>
      </div>

      {/* ── WORKING CAPITAL & OPEX ALLOCATION MATRIX ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="biz-grid">
        {/* OPEX Breakdown */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Monthly OPEX Distribution</h3>
            <span className="pill-badge pill-neutral">₹8.5L Monthly Baseline</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { category: 'Engineering & Core Team Payroll', amount: 420000, pct: 49.4, color: 'var(--accent-primary)' },
              { category: 'AWS Cloud Compute & GPU Infrastructure', amount: 245000, pct: 28.8, color: 'var(--indigo-accent)' },
              { category: 'Product Growth & Developer Marketing', amount: 120000, pct: 14.1, color: 'var(--gold-accent)' },
              { category: 'Legal Counsel & Statutory Retainers', amount: 65000, pct: 7.7, color: 'var(--text-secondary)' },
            ].map((item, idx) => (
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
        </div>

        {/* Working Capital Runway Strategy */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Treasury &amp; Runway Health</h3>
            <span className="pill-badge pill-emerald">9.2 Months Solvent</span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The enterprise operates at a healthy net monthly operating surplus of ₹3.5L (29.1% net margin). Treasury liquid reserves of ₹32L provide robust 9.2-month buffer coverage against zero-revenue stress conditions.
          </p>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Weighted Average DSO:</span>
              <span style={{ fontWeight: 700 }}>48 Days (Target: 45 Days)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Accounts Payable Terms:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>30 Days (100% Current)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Overnight Sweep Retention:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>7.2% Annualized Yield</span>
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

      {/* ── ACCOUNTS RECEIVABLE & PAYABLE AGING REGISTER ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Accounts Receivable &amp; Payable Aging Register</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Reconciled invoice telemetry with counterparty aging status</p>
          </div>

          {/* Aging Filter */}
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
        </div>

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
      </div>

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
