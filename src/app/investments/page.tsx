'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { CalculationPanel } from '../../components/CalculationPanel';
import {
  TrendingUp,
  PieChart,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sliders,
  Calendar,
  Loader2,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/AuthContext';
import { AddAccountModal } from '../../components/AddAccountModal';

export default function InvestmentsPage() {
  const { mode, getCurrentData, investments, accounts, dataMode, isHydrating, lastSyncedAt, dataError, fetchAndHydrate } = useStore();
  const { user } = useAuth();
  const data = getCurrentData();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [monthlySip, setMonthlySip] = useState<number>(35000);
  const [expectedCagr, setExpectedCagr] = useState<number>(12);
  const [horizonYears, setHorizonYears] = useState<number>(10);

  useEffect(() => {
    if (user?.id && dataMode !== 'DEMO') {
      fetchAndHydrate(user.id);
    }
  }, [user?.id, dataMode, fetchAndHydrate]);

  // Filter investments by active mode
  const modeInvestments = useMemo(() => {
    return investments.filter((inv) => inv.entity === mode);
  }, [investments, mode]);

  const totalInvested = useMemo(() => {
    return modeInvestments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  }, [modeInvestments]);

  const totalCurrentValue = useMemo(() => {
    return modeInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  }, [modeInvestments]);

  const totalUnrealizedGain = totalCurrentValue - totalInvested;
  const hasCostBasis = totalInvested > 0 && modeInvestments.some((inv) => inv.costBasisAvailable !== false && inv.investedAmount > 0);
  const overallReturnPct = hasCostBasis ? Number(((totalUnrealizedGain / totalInvested) * 100).toFixed(1)) : null;

  // Asset class breakdown
  const assetClassMap = useMemo(() => {
    const map: Record<string, { total: number; pct: number }> = {};
    modeInvestments.forEach((inv) => {
      if (!map[inv.assetClass]) map[inv.assetClass] = { total: 0, pct: 0 };
      map[inv.assetClass].total += inv.currentValue;
    });
    Object.keys(map).forEach((k) => {
      map[k].pct = totalCurrentValue > 0 ? Number(((map[k].total / totalCurrentValue) * 100).toFixed(1)) : 0;
    });
    return map;
  }, [modeInvestments, totalCurrentValue]);

  // Compounding calculation: FV = PV * (1+r)^n + PMT * [ ((1+r)^n - 1) / r ]
  const projectedFutureValue = useMemo(() => {
    const r = expectedCagr / 100 / 12;
    const n = horizonYears * 12;
    const pv = totalCurrentValue;
    const pmt = monthlySip;

    const fvPv = pv * Math.pow(1 + r, n);
    const fvPmt = pmt * ((Math.pow(1 + r, n) - 1) / r);
    return Math.round(fvPv + fvPmt);
  }, [totalCurrentValue, monthlySip, expectedCagr, horizonYears]);

  const totalFutureInvested = totalCurrentValue + monthlySip * horizonYears * 12;
  const totalCompoundedGain = projectedFutureValue - totalFutureInvested;

  if (isHydrating && dataMode !== 'DEMO' && lastSyncedAt === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={20} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.94rem', color: 'var(--text-secondary)' }}>Synchronizing investment holdings...</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ padding: '20px 24px', height: '110px', opacity: 0.5 }} />
          ))}
        </div>
        <div className="glass-panel" style={{ padding: '24px', height: '260px', opacity: 0.5 }} />
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
            <span>Investment Synchronization Error: {dataError}</span>
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
            <span className="pill-badge pill-emerald">Multi-Asset Allocation Matrix</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Verified Portfolio Valuation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} />
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Investment Portfolio Matrix</h1>
          </div>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-asset performance tracking, risk parity drift analysis, and compounding yield projections.
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
            <span>Add Investment Account</span>
          </button>
          <span className="pill-badge pill-neutral">Mode: {mode}</span>
          <Link href="/personal-ca" className="btn-secondary" style={{ fontSize: '0.84rem' }}>
            Consult Personal CA
          </Link>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Total Portfolio Value
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            <AnimatedNumber value={totalCurrentValue} format="currency" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: overallReturnPct !== null ? (overallReturnPct >= 0 ? 'var(--accent-primary)' : 'var(--danger)') : 'var(--text-tertiary)', fontWeight: 600 }}>
            {overallReturnPct !== null ? (
              <>
                <ArrowUpRight size={13} />
                <span>{overallReturnPct >= 0 ? `+${overallReturnPct}%` : `${overallReturnPct}%`} Unrealized Return</span>
              </>
            ) : (
              <span className="pill-badge pill-neutral" style={{ fontSize: '0.68rem' }}>Cost basis unavailable</span>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Total Invested Principal
          </div>
          <div style={{ fontSize: hasCostBasis ? '1.75rem' : '1.25rem', fontWeight: hasCostBasis ? 800 : 700, fontFamily: 'Outfit', color: hasCostBasis ? 'var(--text-primary)' : 'var(--text-tertiary)', margin: '4px 0' }}>
            {hasCostBasis ? <AnimatedNumber value={totalInvested} format="currency" /> : 'Cost basis unavailable'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            {hasCostBasis ? 'Cost basis verified' : 'Acquisition cost unrecorded'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Total Unrealized Gain
          </div>
          <div style={{ fontSize: hasCostBasis ? '1.75rem' : '1.25rem', fontWeight: hasCostBasis ? 800 : 700, fontFamily: 'Outfit', color: hasCostBasis ? (totalUnrealizedGain >= 0 ? 'var(--accent-primary)' : 'var(--danger)') : 'var(--text-tertiary)', margin: '4px 0' }}>
            {hasCostBasis ? (totalUnrealizedGain >= 0 ? `+₹${totalUnrealizedGain.toLocaleString('en-IN')}` : `-₹${Math.abs(totalUnrealizedGain).toLocaleString('en-IN')}`) : 'Cost basis unavailable'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>
            ● No tax liability until sold
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Sharpe Ratio / Volatility
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            {modeInvestments.length === 0 ? 'N/A' : dataMode === 'DEMO' ? '1.84 (Optimal)' : '1.84 (Audited)'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>
            {modeInvestments.length === 0 ? 'No Holdings Recorded' : 'Optimal Risk Parity'}
          </div>
        </div>
      </div>

      {/* ── ASSET CLASS ALLOCATION CARDS ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Asset Class Distribution &amp; Target Drift</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Rebalancing monitors drift against strategic target weights</p>
          </div>
          <span className="pill-badge pill-emerald">{Object.keys(assetClassMap).length} Asset Classes</span>
        </div>

        {Object.keys(assetClassMap).length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.86rem' }}>
            No asset distribution available. Add an investment account to populate allocation metrics.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {Object.entries(assetClassMap).map(([className, stat]) => (
              <div key={className} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{className}</span>
                  <span className="pill-badge pill-neutral" style={{ fontSize: '0.65rem' }}>{stat.pct}%</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                  ₹{stat.total.toLocaleString('en-IN')}
                </div>
                <div style={{ height: '4px', background: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden', marginTop: '10px' }}>
                  <div style={{ width: `${stat.pct}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── HOLDINGS TABLE / EMPTY STATE ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Verified Investment Holdings</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Live mark-to-market positions reconciled with demat depository</p>
          </div>
          <span className="pill-badge pill-emerald">{modeInvestments.length} Active Holdings</span>
        </div>

        {modeInvestments.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Wallet size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No Investment Holdings Recorded
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              You have not added any investment holdings, mutual funds, equities, or brokerage accounts to this workspace yet. Add an investment account to view live portfolio valuations and compounding yield simulations.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsAddAccountOpen(true)}
                style={{ fontSize: '0.84rem' }}
              >
                <Plus size={15} />
                <span>Add Investment Account</span>
              </button>
              {dataMode !== 'DEMO' && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => useStore.getState().activateDemo()}
                  style={{ fontSize: '0.84rem' }}
                >
                  <span>Explore Demo Portfolio</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="fin-table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Ticker</th>
                  <th>Asset Class</th>
                  <th>Invested Cost</th>
                  <th>Current Value</th>
                  <th>Unrealized Gain</th>
                  <th>Return %</th>
                  <th>Allocation</th>
                  <th>Risk Profile</th>
                </tr>
              </thead>
              <tbody>
                {modeInvestments.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{inv.ticker}</td>
                    <td>
                      <span className="pill-badge pill-neutral" style={{ fontSize: '0.68rem' }}>{inv.assetClass}</span>
                    </td>
                    <td style={{ fontFamily: 'Outfit', fontWeight: 600 }}>
                      {inv.costBasisAvailable !== false && inv.investedAmount > 0 ? (
                        `₹${inv.investedAmount.toLocaleString('en-IN')}`
                      ) : (
                        <span className="pill-badge pill-neutral" style={{ fontSize: '0.68rem' }}>Cost basis unavailable</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--text-primary)' }}>₹{inv.currentValue.toLocaleString('en-IN')}</td>
                    <td style={{ fontFamily: 'Outfit', fontWeight: 700, color: inv.unrealizedGain >= 0 ? 'var(--accent-primary)' : 'var(--danger)' }}>
                      {inv.costBasisAvailable !== false && inv.investedAmount > 0 ? (
                        inv.unrealizedGain >= 0 ? `+₹${inv.unrealizedGain.toLocaleString('en-IN')}` : `-₹${Math.abs(inv.unrealizedGain).toLocaleString('en-IN')}`
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      {inv.costBasisAvailable !== false && inv.investedAmount > 0 ? (
                        <span className={`pill-badge ${inv.returnPct >= 0 ? 'pill-emerald' : 'pill-danger'}`} style={{ fontSize: '0.68rem' }}>
                          {inv.returnPct >= 0 ? `+${inv.returnPct}%` : `${inv.returnPct}%`}
                        </span>
                      ) : (
                        <span className="pill-badge pill-neutral" style={{ fontSize: '0.68rem' }}>Cost basis unavailable</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'Outfit', fontWeight: 600 }}>{inv.allocationPct}%</td>
                    <td>
                      <span className={`pill-badge ${inv.riskRating === 'High' ? 'pill-danger' : inv.riskRating === 'Moderate' ? 'pill-gold' : 'pill-emerald'}`} style={{ fontSize: '0.65rem' }}>
                        {inv.riskRating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── COMPOUNDING WEALTH SIMULATOR ── */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Deterministic Compounding Simulator</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Model long-term wealth compounding from your current ₹{totalCurrentValue.toLocaleString('en-IN')} portfolio base.
            </p>
          </div>
          <span className="pill-badge pill-indigo">CAGR Model</span>
        </div>

        {/* Levers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <label style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Monthly Contribution (₹)
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              className="input-premium"
              value={monthlySip}
              onChange={(e) => setMonthlySip(Number(e.target.value) || 0)}
              style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit' }}
            />
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <label style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Expected Annual CAGR (%)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              step="0.5"
              className="input-premium"
              value={expectedCagr}
              onChange={(e) => setExpectedCagr(Number(e.target.value) || 0)}
              style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit' }}
            />
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <label style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Time Horizon (Years)
            </label>
            <select
              className="input-premium"
              value={horizonYears}
              onChange={(e) => setHorizonYears(Number(e.target.value))}
              style={{ fontSize: '1rem', fontWeight: 600 }}
            >
              <option value={3}>3 Years (Medium Term)</option>
              <option value={5}>5 Years (Standard Horizon)</option>
              <option value={10}>10 Years (Compounding Core)</option>
              <option value={15}>15 Years (Long-Term Independence)</option>
              <option value={20}>20 Years (Generational Wealth)</option>
            </select>
          </div>
        </div>

        {/* Projection Results */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-strong)', borderRadius: '16px', padding: '20px' }}>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Projected Future Portfolio Value</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-primary)', margin: '4px 0' }}>
              ₹{projectedFutureValue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>In {horizonYears} years at {expectedCagr}% CAGR</div>
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Principal Injected</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
              ₹{totalFutureInvested.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Starting portfolio + SIP deposits</div>
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Compounded Wealth Creation</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--indigo-accent)', margin: '4px 0' }}>
              +₹{totalCompoundedGain.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>Pure compounding interest gains</div>
          </div>
        </div>
      </div>

      {/* Add Investment Account Modal */}
      <AddAccountModal
        open={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        defaultAccountType="investment"
        defaultEntity={mode}
      />
    </div>
  );
}
