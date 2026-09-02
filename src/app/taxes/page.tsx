'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { calculateTaxProjection } from '../../lib/finance-tools';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { CalculationPanel } from '../../components/CalculationPanel';
import {
  Receipt,
  ShieldCheck,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

export default function TaxesPage() {
  const { mode, getCurrentData } = useStore();
  const data = getCurrentData();

  const isBusiness = mode === 'BUSINESS';
  const defaultGross = isBusiness ? data.monthlyIncome * 12 : data.monthlyIncome * 12;

  // Interactive Tax Planning Inputs
  const [grossAnnual, setGrossAnnual] = useState<number>(defaultGross);
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [deduction80C, setDeduction80C] = useState<number>(150000);
  const [deduction80D, setDeduction80D] = useState<number>(25000);
  const [hraExemption, setHraExemption] = useState<number>(120000);

  const totalDeductions = regime === 'old' ? deduction80C + deduction80D + hraExemption : 0;

  // Compute live statutory projection via deterministic tool
  const taxResult = useMemo(() => {
    return calculateTaxProjection(grossAnnual, totalDeductions, regime);
  }, [grossAnnual, totalDeductions, regime]);

  const taxData = taxResult.data;

  // Advance tax installments (15%, 45%, 75%, 100%)
  const totalTax = taxData.totalPayableWithCess;
  const advanceTaxSchedule = [
    { quarter: 'Q1 (June 15)', targetPct: 15, targetAmount: Math.round(totalTax * 0.15), status: 'PAID', date: '2026-06-15' },
    { quarter: 'Q2 (Sept 15)', targetPct: 45, targetAmount: Math.round(totalTax * 0.45), status: 'PROVISIONED', date: '2026-09-15' },
    { quarter: 'Q3 (Dec 15)', targetPct: 75, targetAmount: Math.round(totalTax * 0.75), status: 'SCHEDULED', date: '2026-12-15' },
    { quarter: 'Q4 (March 15)', targetPct: 100, targetAmount: totalTax, status: 'SCHEDULED', date: '2027-03-15' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-gold">Statutory Planning Engine</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>FY 2024-25 Assessment</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={22} />
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Tax Intelligence &amp; Projections</h1>
          </div>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Deterministic statutory tax slab calculations, regime comparison, deductible category tracking, and advance tax scheduling.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pill-badge pill-neutral">Mode: {mode}</span>
          <Link href="/personal-ca" className="btn-secondary" style={{ fontSize: '0.84rem' }}>
            Ask Personal CA
          </Link>
        </div>
      </div>

      {/* ── STATUTORY DISCLAIMER ── */}
      <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--gold-accent)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Info size={18} color="var(--gold-accent)" />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <strong>Statutory Projection Notice:</strong> Computations are deterministic estimates based on standard FY 2024-25 Indian Income Tax slabs. Final tax obligations require verification with formal IT filing records.
        </span>
      </div>

      {/* ── TOP KPI STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Estimated Tax Liability
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--danger)', margin: '4px 0' }}>
            ₹{taxData.totalPayableWithCess.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            Includes 4% Health &amp; Education Cess
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Effective Tax Rate
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--gold-accent)', margin: '4px 0' }}>
            {taxData.effectiveTaxRatePct}%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            On ₹{grossAnnual.toLocaleString('en-IN')} gross inflow
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Taxable Base Income
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            ₹{taxData.taxableIncome.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>
            After ₹{regime === 'new' ? '75,000' : '50,000'} standard deduction
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Section 87A Rebate
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: taxData.rebate87AApplied ? 'var(--accent-primary)' : 'var(--text-muted)', margin: '4px 0' }}>
            {taxData.rebate87AApplied ? 'Applied (Zero Tax)' : 'Not Eligible'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            {taxData.rebate87AApplied ? 'Taxable income ≤ ₹7,00,000' : 'Taxable income > ₹7,00,000'}
          </div>
        </div>
      </div>

      {/* ── REGIME COMPARISON & DEDUCTIONS WORKSPACE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="tax-workspace-grid">
        {/* Left Side: Levers & Regime Selector */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Tax Inputs &amp; Regime Selector</h3>
            {/* Regime Toggle */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-subtle)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className={regime === 'new' ? 'btn-primary' : 'btn-ghost'}
                style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                onClick={() => setRegime('new')}
              >
                New Regime (FY 2024-25)
              </button>
              <button
                type="button"
                className={regime === 'old' ? 'btn-primary' : 'btn-ghost'}
                style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                onClick={() => setRegime('old')}
              >
                Old Regime
              </button>
            </div>
          </div>

          {/* Gross Annual Inflow */}
          <div>
            <label style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Gross Annualized Inflow (₹)
            </label>
            <input
              type="number"
              min="0"
              step="50000"
              className="input-premium"
              value={grossAnnual}
              onChange={(e) => setGrossAnnual(Number(e.target.value) || 0)}
              style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'Outfit' }}
            />
          </div>

          {/* Old Regime Deductions Section (Disabled in New Regime) */}
          {regime === 'old' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                Old Regime Deductions
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Section 80C (EPF, PPF, ELSS, Life Insurance — Max ₹1.5L)
                </label>
                <input
                  type="number"
                  max="150000"
                  step="10000"
                  className="input-premium"
                  value={deduction80C}
                  onChange={(e) => setDeduction80C(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Section 80D Health Insurance (Self &amp; Family — Max ₹25k / ₹50k)
                </label>
                <input
                  type="number"
                  max="50000"
                  step="5000"
                  className="input-premium"
                  value={deduction80D}
                  onChange={(e) => setDeduction80D(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  House Rent Allowance (HRA) Exemption
                </label>
                <input
                  type="number"
                  step="10000"
                  className="input-premium"
                  value={hraExemption}
                  onChange={(e) => setHraExemption(Number(e.target.value) || 0)}
                />
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Standard Deduction of ₹75,000 Automatically Applied
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Under the FY 2024-25 New Tax Regime, individual itemized deductions (80C/80D/HRA) are replaced by concessional tax slabs and an increased standard deduction of ₹75,000.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Slab Calculation Breakdown */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Statutory Slabs Breakdown</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Gross Annual Inflow</span>
              <span style={{ fontSize: '0.94rem', fontWeight: 700, fontFamily: 'Outfit' }}>₹{grossAnnual.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Standard Deduction</span>
              <span style={{ fontSize: '0.94rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>
                -₹{regime === 'new' ? '75,000' : '50,000'}
              </span>
            </div>

            {regime === 'old' && (
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>80C + 80D + HRA Deductions</span>
                <span style={{ fontSize: '0.94rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>
                  -₹{totalDeductions.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-strong)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Net Taxable Base</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                ₹{taxData.taxableIncome.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Calculated Slab Tax</span>
              <span style={{ fontSize: '0.94rem', fontWeight: 700, fontFamily: 'Outfit' }}>₹{taxData.estimatedTaxLiability.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>4% Health &amp; Education Cess</span>
              <span style={{ fontSize: '0.94rem', fontWeight: 700, fontFamily: 'Outfit' }}>₹{taxData.cess.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ background: 'var(--bg-surface-glass-heavy)', border: '2px solid var(--border-focus)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>Total Estimated Tax Payable</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--danger)' }}>
                ₹{taxData.totalPayableWithCess.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADVANCE TAX QUARTERLY SCHEDULE ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Section 208 Statutory Advance Tax Schedule</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Quarterly payment targets to avoid Section 234B &amp; 234C interest penalties</p>
          </div>
          <span className="pill-badge pill-emerald">Zero Penalty Risk</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {advanceTaxSchedule.map((sched, idx) => (
            <div key={idx} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sched.quarter}</span>
                <span className={`pill-badge ${sched.status === 'PAID' ? 'pill-emerald' : sched.status === 'PROVISIONED' ? 'pill-gold' : 'pill-neutral'}`} style={{ fontSize: '0.62rem' }}>
                  {sched.status}
                </span>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
                ₹{sched.targetAmount.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                Cumulative: {sched.targetPct}% target by {sched.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .tax-workspace-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
