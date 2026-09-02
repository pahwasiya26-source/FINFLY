'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { DigitalTwinEngine, ScenarioVariable, SimulationResult } from '../../lib/digital-twin-engine';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { ThreeFinancialCore } from '../../components/ThreeFinancialCore';
import {
  Cpu,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Sliders,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

export default function FinancialTwinPage() {
  const { getCurrentData, mode } = useStore();
  const data = getCurrentData();

  const [variables, setVariables] = useState<ScenarioVariable[]>([
    {
      id: 'var_default_1',
      name: 'Advisory Inflow Expansion',
      type: 'addition',
      value: 30000,
      target: 'revenue',
    },
  ]);
  const [newExpense, setNewExpense] = useState('');
  const [newIncome, setNewIncome] = useState('');
  const [reactionCounter, setReactionCounter] = useState(0);

  // Deterministic engine
  const baselineEngine = useMemo(
    () =>
      new DigitalTwinEngine({
        cashBalance: data.cash,
        monthlyRevenue: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
      }),
    [data]
  );

  const scenarioEngine = useMemo(
    () =>
      new DigitalTwinEngine({
        cashBalance: data.cash,
        monthlyRevenue: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
      }),
    [data]
  );

  const baselineTrajectory = useMemo(() => baselineEngine.simulate([], 12), [baselineEngine]);
  const simulatedTrajectory = useMemo(() => scenarioEngine.simulate(variables, 12), [scenarioEngine, variables]);

  const baselineM12 = baselineTrajectory[11]?.cash ?? 0;
  const simulatedM12 = simulatedTrajectory[11]?.cash ?? 0;
  const cashDelta = simulatedM12 - baselineM12;

  // Monthly net flows at month 12
  const baselineNetFlow = data.monthlyIncome - data.monthlyExpenses;
  const simulatedNetFlow = simulatedTrajectory[11]
    ? simulatedTrajectory[11].revenue - simulatedTrajectory[11].expenses
    : baselineNetFlow;

  // Runway projection
  const baselineRunway = data.monthlyExpenses > 0 ? Number((data.cash / data.monthlyExpenses).toFixed(1)) : 999;
  const simulatedRunway =
    simulatedTrajectory[0]?.expenses > 0
      ? Number((simulatedTrajectory[0].cash / simulatedTrajectory[0].expenses).toFixed(1))
      : baselineRunway;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(newExpense);
    if (!val || val <= 0) return;

    setVariables([
      ...variables,
      {
        id: `var_${Date.now()}`,
        name: `Additional Outflow (+₹${val.toLocaleString('en-IN')})`,
        type: 'addition',
        value: val,
        target: 'expense',
      },
    ]);
    setNewExpense('');
    setReactionCounter((prev) => prev + 1);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(newIncome);
    if (!val || val <= 0) return;

    setVariables([
      ...variables,
      {
        id: `var_${Date.now()}`,
        name: `Additional Inflow (+₹${val.toLocaleString('en-IN')})`,
        type: 'addition',
        value: val,
        target: 'revenue',
      },
    ]);
    setNewIncome('');
    setReactionCounter((prev) => prev + 1);
  };

  const handleApplyPreset = (presetName: string, target: 'revenue' | 'expense', value: number) => {
    setVariables([
      ...variables,
      {
        id: `preset_${Date.now()}`,
        name: presetName,
        type: 'addition',
        value: value,
        target: target,
      },
    ]);
    setReactionCounter((prev) => prev + 1);
  };

  const removeVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
    setReactionCounter((prev) => prev + 1);
  };

  const resetAllVariables = () => {
    setVariables([]);
    setReactionCounter((prev) => prev + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-emerald">Deterministic Digital Twin</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>Zero-Hallucination Math</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={22} />
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Financial Digital Twin</h1>
          </div>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Simulate the future before committing present capital. Real-time deterministic 12-month trajectory modeling.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pill-badge pill-neutral">Base Cash: ₹{data.cash.toLocaleString('en-IN')}</span>
          <button type="button" onClick={resetAllVariables} className="btn-secondary" style={{ fontSize: '0.84rem' }}>
            <RotateCcw size={14} />
            <span>Reset Levers</span>
          </button>
        </div>
      </div>

      {/* ── 3-COLUMN HERO WORKSPACE (LEVERS | 3D REACTIVE CORE | SCENARIO COMPARISON) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr 360px', gap: '20px', alignItems: 'stretch' }} className="twin-3col-grid">
        {/* ── LEFT COLUMN: SCENARIO LEVERS ── */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Scenario Levers</h3>
          </div>

          {/* Form: Add Expense */}
          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              Add Monthly Outflow (Loan, EMI, Hire)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                min="1000"
                step="5000"
                className="input-premium"
                placeholder="Amount in ₹"
                value={newExpense}
                onChange={(e) => setNewExpense(e.target.value)}
              />
              <button type="submit" className="btn-danger" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <Plus size={14} />
                <span>Outflow</span>
              </button>
            </div>
          </form>

          {/* Form: Add Inflow */}
          <form onSubmit={handleAddIncome} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              Add Monthly Inflow (Client, Raise)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                min="1000"
                step="5000"
                className="input-premium"
                placeholder="Amount in ₹"
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                <Plus size={14} />
                <span>Inflow</span>
              </button>
            </div>
          </form>

          {/* Pre-Built Scenario Levers */}
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '8px' }}>
              One-Click Scenario Templates
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.78rem', padding: '7px 10px' }}
                onClick={() => handleApplyPreset('Enterprise Retainer Expansion', 'revenue', 60000)}
              >
                <span>+ Enterprise Retainer</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>+₹60k/mo</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.78rem', padding: '7px 10px' }}
                onClick={() => handleApplyPreset('Tech Lead / Senior Hire', 'expense', 45000)}
              >
                <span>- Senior Hire OPEX</span>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>-₹45k/mo</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.78rem', padding: '7px 10px' }}
                onClick={() => handleApplyPreset('Office Lease Upgrade', 'expense', 25000)}
              >
                <span>- Lease Upgrade</span>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>-₹25k/mo</span>
              </button>
            </div>
          </div>

          {/* Active Variable Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                Active Scenario Levers ({variables.length})
              </span>
            </div>

            {variables.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                Baseline mode (no active levers)
              </div>
            ) : (
              variables.map((v) => (
                <div key={v.id} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</div>
                    <div style={{ fontSize: '0.72rem', color: v.target === 'revenue' ? 'var(--accent-primary)' : 'var(--danger)', fontWeight: 700 }}>
                      {v.target === 'revenue' ? '+' : '-'}₹{v.value.toLocaleString('en-IN')}/mo
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariable(v.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── CENTER COLUMN: 3D FINANCIAL CORE (REACTS ON LEVER CHANGE) ── */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: '420px',
          }}
        >
          <div style={{ position: 'absolute', top: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot" />
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Simulation Engine Live
            </span>
          </div>

          <ThreeFinancialCore mode="twin" height={320} interactive reactiveTrigger={reactionCounter} />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
            <span className="pill-badge pill-emerald">12-Month Cash Trajectory Synced</span>
            <span className="pill-badge pill-indigo">{variables.length} Active Levers Applied</span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: BASELINE VS SCENARIO COMPARISON ── */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Scenario Delta</h3>
            <span className={`pill-badge ${cashDelta >= 0 ? 'pill-emerald' : 'pill-danger'}`}>
              {cashDelta >= 0 ? '+ Expansion' : '- Contraction'}
            </span>
          </div>

          {/* Metric 1: Month 12 Projected Cash */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>Month 12 Ending Cash</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'Outfit', color: simulatedM12 >= 0 ? 'var(--text-primary)' : 'var(--danger)', margin: '4px 0' }}>
              ₹{simulatedM12.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Baseline: ₹{baselineM12.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Metric 2: Net Cash Delta */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>12-Month Net Difference</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'Outfit', color: cashDelta >= 0 ? 'var(--accent-primary)' : 'var(--danger)', margin: '4px 0' }}>
              {cashDelta >= 0 ? '+' : ''}₹{cashDelta.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.76rem', color: cashDelta >= 0 ? 'var(--accent-primary)' : 'var(--danger)' }}>
              {cashDelta >= 0 ? 'Surplus capital created' : 'Capital burn acceleration'}
            </div>
          </div>

          {/* Metric 3: Runway Impact */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>Simulated Runway Buffer</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
              {simulatedRunway} Months
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Baseline buffer: {baselineRunway} Months
            </div>
          </div>
        </div>
      </div>

      {/* ── 12-MONTH TRAJECTORY BREAKDOWN TABLE ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>12-Month Deterministic Trajectory Timeline</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Month-by-month cash progression comparing Baseline vs Simulated scenario</p>
          </div>
          <span className="pill-badge pill-emerald">DigitalTwinEngine Verified</span>
        </div>

        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Baseline Cash</th>
                <th>Simulated Revenue</th>
                <th>Simulated Outflow</th>
                <th>Simulated Cash</th>
                <th>Monthly Delta</th>
                <th>Solvency Status</th>
              </tr>
            </thead>
            <tbody>
              {simulatedTrajectory.map((step, idx) => {
                const baseStep = baselineTrajectory[idx];
                const diff = step.cash - (baseStep?.cash ?? 0);
                return (
                  <tr key={step.month}>
                    <td style={{ fontWeight: 700, fontFamily: 'Outfit' }}>Month {step.month}</td>
                    <td style={{ fontFamily: 'Outfit', color: 'var(--text-secondary)' }}>₹{baseStep?.cash.toLocaleString('en-IN')}</td>
                    <td style={{ fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>₹{step.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ fontFamily: 'Outfit', color: 'var(--danger)' }}>-₹{step.expenses.toLocaleString('en-IN')}</td>
                    <td style={{ fontFamily: 'Outfit', fontWeight: 800, color: step.cash >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                      ₹{step.cash.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontFamily: 'Outfit', fontWeight: 700, color: diff >= 0 ? 'var(--accent-primary)' : 'var(--danger)' }}>
                      {diff >= 0 ? '+' : ''}₹{diff.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`pill-badge ${step.cash > 0 ? 'pill-emerald' : 'pill-danger'}`} style={{ fontSize: '0.62rem' }}>
                        {step.cash > 0 ? 'Solvent' : 'Deficit Risk'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1080px) {
          .twin-3col-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
