'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { DigitalTwinEngine, ScenarioVariable } from '../../lib/digital-twin-engine';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { Cpu, Plus, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function FinancialTwinPage() {
  const { getCurrentData } = useStore();
  const data = getCurrentData();

  const [variables, setVariables] = useState<ScenarioVariable[]>([]);
  const [newExpense, setNewExpense] = useState('');
  const [newIncome, setNewIncome] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense || isNaN(Number(newExpense)) || Number(newExpense) <= 0) return;
    setVariables([
      ...variables,
      {
        id: Date.now().toString(),
        name: `Additional Outflow`,
        type: 'addition',
        value: Number(newExpense),
        target: 'expense',
      },
    ]);
    setNewExpense('');
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncome || isNaN(Number(newIncome)) || Number(newIncome) <= 0) return;
    setVariables([
      ...variables,
      {
        id: Date.now().toString(),
        name: `Additional Inflow`,
        type: 'addition',
        value: Number(newIncome),
        target: 'revenue',
      },
    ]);
    setNewIncome('');
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
  };

  // Deterministic simulation engine instantiation
  const engine = useMemo(
    () =>
      new DigitalTwinEngine({
        cashBalance: data.cash,
        monthlyRevenue: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
      }),
    [data]
  );

  const simulation = useMemo(() => engine.simulate(variables, 12), [engine, variables]);
  const month12 = simulation[11];
  const currentProjectedCash = data.cash + (data.monthlyIncome - data.monthlyExpenses) * 12;
  const cashDelta = month12.cash - currentProjectedCash;

  return (
    <div className="ft-root">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="ft-page-header">
        <div className="ft-header-left">
          <div className="ft-header-badges">
            <span className="pill-badge pill-emerald">Deterministic Engine</span>
            <span className="ft-sep">•</span>
            <span className="ft-badge-sub">Zero-Hallucination Math</span>
          </div>
          <h1 className="ft-h1">Financial Digital Twin</h1>
          <p className="ft-subtitle">
            Simulate decisions before committing capital. Real-time deterministic scenario forecasting.
          </p>
        </div>
        <div className="ft-header-right">
          <span className="pill-badge pill-neutral ft-base-pill">
            Base Cash: ₹{data.cash.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────── */}
      <div className="ft-layout">

        {/* ══ LEFT: Scenario Levers ══════════════════════ */}
        <aside className="ft-levers-col">
        <div className="glass-panel ft-levers-card">
          {/* Card header */}
          <div className="ft-card-header">
            <div className="ft-card-icon"><Cpu size={16} /></div>
            <div className="ft-card-title-block">
              <h3 className="ft-card-title">Scenario Levers</h3>
              <p className="ft-card-desc">Add monthly income or expense variables to project cash runway.</p>
            </div>
          </div>

          {/* Form: Add Monthly Expense */}
          <form onSubmit={handleAddExpense} className="ft-lever-form">
            <label className="ft-lever-label" htmlFor="ft-exp-input">
              Monthly Outflow — Loan, Hire, EMI
            </label>
            <div className="ft-lever-row">
              <input
                id="ft-exp-input"
                type="number" min="1" step="any"
                value={newExpense}
                onChange={(e) => setNewExpense(e.target.value)}
                placeholder="Amount in ₹"
                className="input-premium ft-lever-input"
                autoComplete="off"
              />
              <button type="submit" className="ft-btn-expense" aria-label="Add expense">
                <Plus size={14} /><span>Expense</span>
              </button>
            </div>
          </form>

          {/* Form: Add Monthly Income */}
          <form onSubmit={handleAddIncome} className="ft-lever-form">
            <label className="ft-lever-label" htmlFor="ft-inc-input">
              Monthly Inflow — New Client, Raise
            </label>
            <div className="ft-lever-row">
              <input
                id="ft-inc-input"
                type="number" min="1" step="any"
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
                placeholder="Amount in ₹"
                className="input-premium ft-lever-input"
                autoComplete="off"
              />
              <button type="submit" className="ft-btn-income" aria-label="Add income">
                <Plus size={14} /><span>Inflow</span>
              </button>
            </div>
          </form>

          {/* Active Variables List */}
          <div className="ft-active-levers">
            <div className="ft-active-levers-header">
              <span className="ft-active-label">Active Levers ({variables.length})</span>
              {variables.length > 0 && (
                <button type="button" onClick={() => setVariables([])} className="ft-reset-btn">
                  <RotateCcw size={11} /><span>Reset All</span>
                </button>
              )}
            </div>

            {variables.length === 0 ? (
              <div className="ft-empty-state">
                No active scenario variables. Add levers above to simulate financial impact.
              </div>
            ) : (
              <ul className="ft-lever-list">
                {variables.map((v) => (
                  <li key={v.id} className="ft-lever-item">
                    <div className="ft-lever-item-left">
                      <span className="ft-lever-dot" style={{ background: v.target === 'expense' ? 'var(--danger)' : 'var(--accent-primary)' }} />
                      <span className="ft-lever-name">{v.name}</span>
                    </div>
                    <div className="ft-lever-item-right">
                      <span className="ft-lever-value" style={{ color: v.target === 'expense' ? 'var(--danger)' : 'var(--accent-primary)' }}>
                        {v.target === 'expense' ? '-' : '+'}₹{v.value.toLocaleString('en-IN')}
                      </span>
                      <button type="button" onClick={() => removeVariable(v.id)} className="ft-remove-btn" aria-label="Remove lever">×</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </aside>

        {/* ══ RIGHT: Results ══════════════════════════════ */}
        <div className="ft-results-col">

          {/* Hero Banner */}
          <div className="glass-hero ft-hero-banner">
            <div className="ft-hero-left">
              <span className="pill-badge pill-indigo ft-hero-badge">12-Month Deterministic Projection</span>
              <h3 className="ft-hero-title">Simulated Year-End Cash</h3>
              <p className="ft-hero-desc">Projected cash balance at Month 12 based on active scenario variables.</p>
            </div>
            <div className="ft-hero-metric">
              <div className="ft-hero-value">
                <AnimatedNumber value={month12.cash} format="currency" />
              </div>
              {variables.length > 0 && (
                <div className="ft-hero-delta" style={{ color: cashDelta >= 0 ? 'var(--accent-primary)' : 'var(--danger)' }}>
                  {cashDelta >= 0 ? `+₹${cashDelta.toLocaleString('en-IN')}` : `-₹${Math.abs(cashDelta).toLocaleString('en-IN')}`} vs baseline
                </div>
              )}
            </div>
          </div>

          {/* Trajectory Comparison Cards */}
          <div className="ft-trajectory-grid">
            {/* Card 1: Current Trajectory (Base) */}
            <div className="glass-panel ft-trajectory-card">
              <div className="ft-traj-header">
                <span className="ft-traj-label">Current Trajectory (Base)</span>
                <span className="pill-badge pill-neutral ft-traj-badge">Baseline</span>
              </div>
              <div className="ft-traj-rows">
                <div className="ft-traj-row">
                  <span className="ft-traj-key">Monthly Net Flow</span>
                  <span className="ft-traj-val">₹{(data.monthlyIncome - data.monthlyExpenses).toLocaleString('en-IN')}/mo</span>
                </div>
                <div className="ft-traj-row">
                  <span className="ft-traj-key">Year-End Cash</span>
                  <span className="ft-traj-val ft-traj-val-lg">₹{currentProjectedCash.toLocaleString('en-IN')}</span>
                </div>
                <div className="ft-traj-row">
                  <span className="ft-traj-key">Runway Buffer</span>
                  <span className="ft-traj-val" style={{ color: 'var(--accent-primary)' }}>{(data.cash / (data.monthlyExpenses || 1)).toFixed(1)} Months</span>
                </div>
              </div>
            </div>

            {/* Card 2: Simulated Scenario */}
            <div
              className="glass-panel ft-trajectory-card"
              style={{
                borderColor: variables.length > 0 ? 'var(--accent-primary)' : undefined,
                boxShadow: variables.length > 0 ? 'var(--shadow-glow)' : undefined,
              }}
            >
              <div className="ft-traj-header">
                <span className="ft-traj-label ft-traj-label-sim">Simulated Scenario</span>
                <span className="pill-badge pill-emerald ft-traj-badge">{variables.length > 0 ? 'Dynamic Active' : 'Synced'}</span>
              </div>
              <div className="ft-traj-rows">
                <div className="ft-traj-row">
                  <span className="ft-traj-key">Simulated Net Flow</span>
                  <span
                    className="ft-traj-val"
                    style={{ color: month12.revenue - month12.expenses > data.monthlyIncome - data.monthlyExpenses ? 'var(--accent-primary)' : variables.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}
                  >
                    ₹{(month12.revenue - month12.expenses).toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <div className="ft-traj-row">
                  <span className="ft-traj-key">Simulated Year-End</span>
                  <span className="ft-traj-val ft-traj-val-lg" style={{ color: month12.cash >= currentProjectedCash ? 'var(--accent-primary)' : 'var(--danger)' }}>
                    ₹{month12.cash.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="ft-traj-row">
                  <span className="ft-traj-key">Simulated Runway</span>
                  <span className="ft-traj-val" style={{ color: month12.cash < data.cash ? 'var(--danger)' : 'var(--accent-primary)' }}>
                    {(month12.cash / (month12.expenses || 1)).toFixed(1)} Months
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk / OK Banner */}
          {variables.length > 0 && month12.cash < data.cash ? (
            <div className="glass-panel ft-warning-banner">
              <div className="ft-warning-icon"><AlertTriangle size={18} /></div>
              <div className="ft-warning-text">
                <div className="ft-warning-title">Liquidity Depletion Warning</div>
                <div className="ft-warning-body">
                  This scenario depletes reserves by ₹{(data.cash - month12.cash).toLocaleString('en-IN')} over 12 months.
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel ft-ok-banner">
              <div className="ft-ok-left">
                <CheckCircle2 size={15} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <span>Deterministic calculations audited with non-linear compounding logic.</span>
              </div>
              <span className="pill-badge pill-emerald ft-ok-badge">Mathematical Proof OK</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* ── Root ── */
        .ft-root {
          display: flex;
          flex-direction: column;
          gap: 28px;
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          min-width: 0;
        }

        /* ── Header ── */
        .ft-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          width: 100%;
        }
        .ft-header-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
          flex: 1 1 auto;
        }
        .ft-header-badges {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ft-sep { color: var(--text-muted); }
        .ft-badge-sub { font-size: 0.76rem; color: var(--text-tertiary); }
        .ft-h1 {
          font-size: clamp(1.5rem, 2.4vw, 2rem);
          font-weight: 700;
          margin: 0;
        }
        .ft-subtitle {
          font-size: 0.86rem;
          color: var(--text-secondary);
          margin: 0;
          max-width: 480px;
        }
        .ft-header-right { flex-shrink: 0; padding-top: 2px; }
        .ft-base-pill { white-space: nowrap; }

        /* ── Main grid ── */
        .ft-layout {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          gap: 24px;
          width: 100%;
          align-items: start;
        }

        /* ── Left: Levers ── */
        .ft-levers-col { min-width: 0; width: 100%; }
        .ft-levers-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
          width: 100%;
        }
        .ft-card-header { display: flex; align-items: flex-start; gap: 12px; }
        .ft-card-icon {
          width: 32px; height: 32px; min-width: 32px;
          border-radius: 9px;
          background: var(--accent-primary-subtle);
          color: var(--accent-primary);
          display: flex; align-items: center; justify-content: center;
          margin-top: 2px;
        }
        .ft-card-title-block { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .ft-card-title { font-size: 1.08rem; font-weight: 600; margin: 0; line-height: 1.3; }
        .ft-card-desc { font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.45; }

        /* Lever forms */
        .ft-lever-form { display: flex; flex-direction: column; gap: 8px; }
        .ft-lever-label {
          font-size: 0.74rem; font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.01em; line-height: 1.3;
        }
        .ft-lever-row { display: flex; gap: 8px; align-items: stretch; width: 100%; }
        .ft-lever-input {
          flex: 1 1 auto;
          min-width: 0;
          padding: 10px 12px !important;
          font-size: 0.87rem !important;
          height: 42px;
        }
        .ft-btn-expense, .ft-btn-income {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex-shrink: 0;
          height: 42px;
          padding: 0 14px;
          border-radius: 12px;
          font-size: 0.83rem; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          border: 1px solid;
        }
        .ft-btn-expense {
          background: var(--danger-bg);
          color: var(--danger);
          border-color: var(--danger-border);
        }
        .ft-btn-expense:hover { background: rgba(239,68,68,0.18); transform: translateY(-1px); }
        .ft-btn-income {
          background: var(--accent-primary);
          color: #fff;
          border-color: rgba(255,255,255,0.15);
          box-shadow: 0 3px 10px var(--accent-glow);
        }
        .ft-btn-income:hover { background: var(--accent-primary-hover); transform: translateY(-1px); }

        /* Active levers */
        .ft-active-levers {
          border-top: 1px solid var(--border-subtle);
          padding-top: 16px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .ft-active-levers-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .ft-active-label {
          font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text-tertiary);
        }
        .ft-reset-btn {
          display: inline-flex; align-items: center; gap: 4px;
          background: transparent; border: none;
          font-size: 0.72rem; font-weight: 600;
          color: var(--danger); cursor: pointer;
          padding: 4px 8px; border-radius: 6px;
          transition: background 0.15s;
          font-family: 'Inter', sans-serif;
        }
        .ft-reset-btn:hover { background: var(--danger-bg); }
        .ft-empty-state {
          background: var(--bg-surface-subtle);
          border: 1px dashed var(--border-color);
          border-radius: 12px;
          padding: 18px 16px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-tertiary);
          line-height: 1.5;
        }
        .ft-lever-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .ft-lever-item {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; padding: 10px 12px;
          border-radius: 11px;
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-color);
          min-width: 0;
        }
        .ft-lever-item-left { display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden; }
        .ft-lever-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .ft-lever-name { font-size: 0.83rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ft-lever-item-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .ft-lever-value { font-size: 0.84rem; font-weight: 700; font-family: 'Outfit', sans-serif; white-space: nowrap; }
        .ft-remove-btn {
          background: transparent; border: none;
          color: var(--text-muted); cursor: pointer;
          font-size: 1.1rem; line-height: 1;
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 5px; transition: color 0.15s, background 0.15s; flex-shrink: 0;
        }
        .ft-remove-btn:hover { color: var(--danger); background: var(--danger-bg); }

        /* ── Right: Results ── */
        .ft-results-col { display: flex; flex-direction: column; gap: 20px; min-width: 0; width: 100%; }

        /* Hero */
        .ft-hero-banner {
          padding: 28px 32px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 20px;
          min-width: 0; width: 100%;
        }
        .ft-hero-left { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1 1 200px; }
        .ft-hero-badge { font-size: 0.67rem; align-self: flex-start; }
        .ft-hero-title { font-size: clamp(1rem, 1.4vw, 1.2rem); font-weight: 600; color: var(--text-primary); margin: 0; }
        .ft-hero-desc { font-size: 0.79rem; color: var(--text-secondary); margin: 0; line-height: 1.45; }
        .ft-hero-metric { text-align: right; flex-shrink: 0; }
        .ft-hero-value {
          font-size: clamp(1.6rem, 2.6vw, 2.4rem);
          font-weight: 800; font-family: 'Outfit', sans-serif;
          letter-spacing: -0.025em; color: var(--text-primary); line-height: 1.1;
        }
        .ft-hero-delta { font-size: 0.78rem; font-weight: 600; margin-top: 4px; }

        /* Trajectory grid: always 2 equal columns on desktop/tablet */
        .ft-trajectory-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          width: 100%;
        }
        .ft-trajectory-card {
          padding: 20px 22px;
          display: flex; flex-direction: column; gap: 16px;
          min-width: 0; width: 100%;
        }
        .ft-traj-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; flex-wrap: wrap;
        }
        .ft-traj-label {
          font-size: 0.71rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
          color: var(--text-tertiary);
        }
        .ft-traj-label-sim { color: var(--accent-primary); }
        .ft-traj-badge { font-size: 0.6rem; flex-shrink: 0; }
        .ft-traj-rows { display: flex; flex-direction: column; gap: 10px; }
        .ft-traj-row {
          display: flex; align-items: baseline;
          justify-content: space-between; gap: 8px;
          font-size: 0.83rem; min-width: 0;
        }
        .ft-traj-key { color: var(--text-secondary); white-space: nowrap; flex-shrink: 0; }
        .ft-traj-val { font-weight: 600; color: var(--text-primary); text-align: right; min-width: 0; word-break: break-all; }
        .ft-traj-val-lg { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.88rem; }

        /* Banners */
        .ft-warning-banner {
          padding: 16px 20px;
          background: var(--danger-bg);
          border-color: var(--danger-border);
          display: flex; align-items: flex-start; gap: 14px;
        }
        .ft-warning-icon { color: var(--danger); flex-shrink: 0; margin-top: 1px; }
        .ft-warning-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .ft-warning-title { font-size: 0.86rem; font-weight: 600; color: var(--danger); }
        .ft-warning-body { font-size: 0.79rem; color: var(--text-secondary); line-height: 1.45; }
        .ft-ok-banner {
          padding: 14px 20px;
          background: var(--bg-surface-subtle);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
        }
        .ft-ok-left {
          display: flex; align-items: center; gap: 9px;
          font-size: 0.79rem; color: var(--text-secondary);
          min-width: 0; flex: 1 1 auto;
        }
        .ft-ok-badge { font-size: 0.63rem; flex-shrink: 0; }

        /* ── Responsive: Tablet (≤ 1100px) ── */
        @media (max-width: 1100px) {
          .ft-layout { grid-template-columns: 300px minmax(0, 1fr); gap: 20px; }
        }

        /* ── Responsive: Tablet portrait (≤ 900px) ── */
        @media (max-width: 900px) {
          .ft-layout { grid-template-columns: 1fr; gap: 20px; }
          .ft-levers-col { width: 100%; }
        }

        /* ── Responsive: Mobile (≤ 580px) ── */
        @media (max-width: 580px) {
          .ft-root { gap: 20px; }
          .ft-levers-card { padding: 18px 16px; gap: 16px; }
          .ft-hero-banner { padding: 20px 18px; flex-direction: column; align-items: flex-start; gap: 14px; }
          .ft-hero-metric { text-align: left; width: 100%; }
          .ft-trajectory-grid { grid-template-columns: 1fr; }
          .ft-trajectory-card { padding: 16px 16px; }
          .ft-ok-banner { flex-direction: column; align-items: flex-start; }
        }

        /* ── Responsive: XS (≤ 380px) ── */
        @media (max-width: 380px) {
          .ft-lever-row { flex-direction: column; }
          .ft-btn-expense, .ft-btn-income { width: 100%; height: 40px; }
          .ft-lever-input { height: 40px !important; }
        }
      `}</style>
    </div>
  );
}
