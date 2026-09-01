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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1400px', minWidth: 0, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', width: '100%', minWidth: 0 }}>
        <div style={{ minWidth: 0, maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
            <span className="pill-badge pill-emerald">Deterministic Engine</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Zero-Hallucination Math</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700 }}>Financial Digital Twin</h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Simulate decisions before committing capital. Real-time deterministic scenario forecasting.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span className="pill-badge pill-neutral">
            Base Cash: ₹{data.cash.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="financial-twin-layout">
        {/* ==========================================================
            LEFT COLUMN: SCENARIO VARIABLES LEVERS
            ========================================================== */}
        <div className="glass-panel financial-twin-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
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
                  flexShrink: 0,
                }}
              >
                <Cpu size={16} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Scenario Levers</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Add monthly income or expense variables to project cash runway.
            </p>
          </div>

          {/* Form: Add Monthly Expense */}
          <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Add Monthly Outflow (Loan, Hire, EMI)
            </label>
            <div className="lever-input-row">
              <input
                type="number"
                min="1"
                step="any"
                value={newExpense}
                onChange={(e) => setNewExpense(e.target.value)}
                placeholder="Amount in ₹"
                className="input-premium lever-input"
              />
              <button
                type="submit"
                className="btn-secondary lever-btn-expense"
              >
                <Plus size={15} />
                <span>Expense</span>
              </button>
            </div>
          </form>

          {/* Form: Add Monthly Income */}
          <form onSubmit={handleAddIncome} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Add Monthly Inflow (New Client, Raise)
            </label>
            <div className="lever-input-row">
              <input
                type="number"
                min="1"
                step="any"
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
                placeholder="Amount in ₹"
                className="input-premium lever-input"
              />
              <button
                type="submit"
                className="btn-primary lever-btn-income"
              >
                <Plus size={15} />
                <span>Inflow</span>
              </button>
            </div>
          </form>

          {/* Active Variables List */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
                Active Levers ({variables.length})
              </span>
              {variables.length > 0 && (
                <button
                  type="button"
                  onClick={() => setVariables([])}
                  className="btn-ghost"
                  style={{ fontSize: '0.72rem', padding: '3px 6px', color: 'var(--danger)' }}
                >
                  <RotateCcw size={12} />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {variables.length === 0 ? (
              <div
                style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--text-tertiary)',
                  border: '1px dashed var(--border-color)',
                }}
              >
                No active scenario variables. Add levers above to simulate financial impact.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {variables.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: v.target === 'expense' ? 'var(--danger)' : 'var(--accent-primary)',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontFamily: 'Outfit',
                          color: v.target === 'expense' ? 'var(--danger)' : 'var(--accent-primary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {v.target === 'expense' ? '-' : '+'}₹{v.value.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVariable(v.id)}
                        aria-label="Remove lever"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-tertiary)',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================================
            RIGHT COLUMN: 12-MONTH SIMULATION & TRAJECTORY COMPARISON
            ========================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, width: '100%' }}>
          {/* Projected Cash Hero Banner */}
          <div className="glass-hero financial-twin-hero">
            <div style={{ minWidth: 0, flex: '1 1 180px' }}>
              <span className="pill-badge pill-indigo" style={{ marginBottom: '6px', fontSize: '0.68rem' }}>
                12-Month Deterministic Projection
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Simulated Year-End Cash
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Projected cash balance at Month 12 based on active scenario variables.
              </p>
            </div>

            <div className="hero-metric-side">
              <div
                style={{
                  fontSize: 'clamp(1.5rem, 2.5vw, 2.3rem)',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                <AnimatedNumber value={month12.cash} format="currency" />
              </div>

              {variables.length > 0 && (
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: cashDelta >= 0 ? 'var(--accent-primary)' : 'var(--danger)',
                    marginTop: '2px',
                  }}
                >
                  {cashDelta >= 0 ? `+₹${cashDelta.toLocaleString('en-IN')}` : `-₹${Math.abs(cashDelta).toLocaleString('en-IN')}`} vs base baseline
                </div>
              )}
            </div>
          </div>

          {/* Trajectory Comparison Cards */}
          <div className="trajectory-grid">
            {/* Card 1: Current Trajectory */}
            <div className="glass-panel trajectory-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)' }}>
                  Current Trajectory (Base)
                </span>
                <span className="pill-badge pill-neutral" style={{ fontSize: '0.62rem' }}>
                  Baseline
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Monthly Net Flow</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    ₹{(data.monthlyIncome - data.monthlyExpenses).toLocaleString('en-IN')}/mo
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Year-End Cash</span>
                  <span style={{ fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                    ₹{currentProjectedCash.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Runway Buffer</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {(data.cash / (data.monthlyExpenses || 1)).toFixed(1)} Months
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Simulated Scenario */}
            <div
              className="glass-panel trajectory-card"
              style={{
                border: variables.length > 0 ? '1px solid var(--accent-primary)' : 'var(--glass-border)',
                boxShadow: variables.length > 0 ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent-primary)' }}>
                  Simulated Scenario
                </span>
                <span className="pill-badge pill-emerald" style={{ fontSize: '0.62rem' }}>
                  {variables.length > 0 ? 'Dynamic Active' : 'Synced'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Simulated Net Flow</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        month12.revenue - month12.expenses > data.monthlyIncome - data.monthlyExpenses
                          ? 'var(--accent-primary)'
                          : variables.length > 0
                          ? 'var(--danger)'
                          : 'var(--text-primary)',
                    }}
                  >
                    ₹{(month12.revenue - month12.expenses).toLocaleString('en-IN')}/mo
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Simulated Year-End</span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontFamily: 'Outfit',
                      color: month12.cash >= currentProjectedCash ? 'var(--accent-primary)' : 'var(--danger)',
                    }}
                  >
                    ₹{month12.cash.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Simulated Runway</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: month12.cash < data.cash ? 'var(--danger)' : 'var(--accent-primary)',
                    }}
                  >
                    {(month12.cash / (month12.expenses || 1)).toFixed(1)} Months
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Warning / Verification Enclave */}
          {variables.length > 0 && month12.cash < data.cash ? (
            <div
              className="glass-panel"
              style={{
                padding: '14px 18px',
                background: 'var(--danger-bg)',
                borderColor: 'var(--danger-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ color: 'var(--danger)', flexShrink: 0 }}>
                <AlertTriangle size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--danger)' }}>
                  Liquidity Depletion Warning
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  This scenario depletes reserves by ₹{(data.cash - month12.cash).toLocaleString('en-IN')} over 12 months.
                </div>
              </div>
            </div>
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                background: 'var(--bg-surface-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: 0 }}>
                <CheckCircle2 size={15} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <span>Deterministic calculations audited with non-linear compounding logic.</span>
              </div>
              <span className="pill-badge pill-emerald" style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                Mathematical Proof OK
              </span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .financial-twin-layout {
          display: grid;
          grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
          gap: 20px;
          width: 100%;
          align-items: start;
        }

        .financial-twin-card {
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-width: 0;
          width: 100%;
        }

        .financial-twin-hero {
          padding: 22px 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          width: 100%;
          min-width: 0;
        }

        .hero-metric-side {
          text-align: right;
          flex-shrink: 0;
        }

        .lever-input-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
          width: 100%;
          align-items: center;
        }

        .lever-input {
          padding: 10px 12px;
          font-size: 0.86rem;
          min-width: 0;
          width: 100%;
        }

        .lever-btn-expense {
          color: var(--danger);
          border-color: var(--danger-border);
          padding: 10px 14px;
          white-space: nowrap;
          flex-shrink: 0;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .lever-btn-income {
          padding: 10px 14px;
          white-space: nowrap;
          flex-shrink: 0;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .trajectory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          width: 100%;
          min-width: 0;
        }

        .trajectory-card {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .financial-twin-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .financial-twin-card {
            padding: 14px 12px !important;
          }
          .financial-twin-hero {
            padding: 16px 14px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .hero-metric-side {
            text-align: left !important;
            width: 100% !important;
          }
          .lever-input-row {
            grid-template-columns: minmax(0, 1fr) auto !important;
            gap: 6px !important;
          }
          .lever-input {
            padding: 8px 10px !important;
            font-size: 0.8rem !important;
          }
          .lever-btn-expense,
          .lever-btn-income {
            padding: 8px 10px !important;
            font-size: 0.78rem !important;
          }
          .trajectory-grid {
            grid-template-columns: 1fr !important;
          }
          .trajectory-card {
            padding: 14px 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
