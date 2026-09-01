'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { FinanceControllerOrchestrator, ControllerResponse, DecisionTraceEntry } from '../../lib/finance-controller-orchestrator';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { CalculationPanel } from '../../components/CalculationPanel';
import {
  Bot,
  ShieldCheck,
  Sparkles,
  Send,
  ArrowRight,
  Activity,
  Cpu,
  Receipt,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const PRESET_QUERIES = [
  'What is my current runway and cash buffer?',
  'Run a two-way reconciliation audit on gateway and bank settlements.',
  'What happens if we increase monthly expenses by ₹50,000?',
  'Detect any financial anomalies or spending variances.',
  'Estimate my statutory tax liability for the year.',
];

export default function FinanceControllerPage() {
  const { mode, getCurrentData } = useStore();
  const data = getCurrentData();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<ControllerResponse | null>(null);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Load an initial runway analysis on mount or mode change
  useEffect(() => {
    handleRunQuery('What is my current runway and cash buffer?');
  }, [mode]);

  const handleRunQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setActionSuccessMessage(null);

    // Deterministic simulation / AI orchestration
    const resp = await FinanceControllerOrchestrator.processQuery(queryText, mode);
    setCurrentResponse(resp);
    setExpandedTraceId(resp.id); // Auto-expand current trace
    setLoading(false);
    setInputQuery('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunQuery(inputQuery);
  };

  const handleApproveStagedAction = (action: DecisionTraceEntry['stagedAction']) => {
    if (!action) return;
    setActionSuccessMessage(`Action verified and authorized: "${action.title}". Proceeding to target module...`);
    if (action.targetUrl) {
      setTimeout(() => {
        window.location.href = action.targetUrl!;
      }, 1000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ==========================================================
          HERO & SYSTEM STATUS HEADER
          ========================================================== */}
      <div className="glass-hero" style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="pill-badge pill-emerald">Strict Read-Only Enclave</span>
              <span className="pill-badge pill-indigo">Zero-Hallucination Engine</span>
              <span className="pill-badge pill-neutral">Mode: {mode}</span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              AI Finance Controller &amp; Intelligence
            </h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', maxWidth: '750px' }}>
              Natural-language financial reasoning strictly backed by deterministic accounting math, general ledger truth, and auditable Decision Traces.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-elevated)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Lock size={15} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>No Autonomous Ledger Mutation</span>
          </div>
        </div>

        {/* Top Operational Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '18px 20px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Audit Guardrails
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
              100% Policy Bound
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>Human-in-the-Loop Required</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 20px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Deterministic Tool Fleet
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
              6 Verified Tools
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--indigo-accent)' }}>Math &amp; Ledgers Decoupled</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 20px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Net Financial Position
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
              <AnimatedNumber value={data.netPosition} format="currency" />
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>General Ledger Ground Truth</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 20px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Health Index Score
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
              {data.healthScore}/100
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>Optimal Vital Signs</div>
          </div>
        </div>
      </div>

      {/* ==========================================================
          COMMAND CENTER QUERY BAR & PRESETS
          ========================================================== */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Bot
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--accent-primary)',
              }}
            />
            <input
              type="text"
              className="fc-input"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask the Finance Controller (e.g. runway analysis, reconciliation audit, simulate ₹50k expense)..."
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !inputQuery.trim()} style={{ height: '48px', padding: '0 24px', flexShrink: 0 }}>
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            <span>{loading ? 'Evaluating...' : 'Query'}</span>
          </button>
        </form>

        {/* Preset Query Chips */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Quick Queries:</span>
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => handleRunQuery(preset)}
              disabled={loading}
            >
              <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />
              <span>{preset}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==========================================================
          CONTROLLER RESPONSE & AUDITABLE DECISION TRACE
          ========================================================== */}
      {currentResponse && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Reasoning Card */}
          <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
                    {currentResponse.intent}
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    Query: "{currentResponse.query}"
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={currentResponse.decisionTrace.validationStatus === 'STRICTLY_GROUNDED' ? 'pill-badge pill-emerald' : 'pill-badge pill-gold'}>
                  {currentResponse.decisionTrace.validationStatus === 'STRICTLY_GROUNDED' ? '● Strictly Grounded' : '● Statutory Estimate'}
                </span>
                <span className="pill-badge pill-neutral">
                  Trace ID: {currentResponse.id.substring(0, 14)}
                </span>
              </div>
            </div>

            {/* Natural Language Explanation */}
            <div style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '24px', background: 'var(--bg-surface-elevated)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              {currentResponse.explanation}
            </div>

            {/* Verified Metric Badges / Grounded Data Cards */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '12px' }}>
                Grounded Deterministic Findings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {currentResponse.decisionTrace.groundedMetrics.map((metric, idx) => (
                  <div key={idx} className="metric-chip-card">
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{metric.label}</span>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'Outfit', color: metric.positive === false ? 'var(--danger)' : 'var(--text-primary)', margin: '4px 0' }}>
                      {metric.value}
                    </div>
                    {metric.formula ? (
                      <CalculationPanel
                        title={metric.label}
                        formula={metric.formula}
                        inputs={[{ label: 'Source', value: metric.source }]}
                        result={metric.value}
                      />
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{metric.source}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Analytical Bullet Points */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '12px' }}>
                Ledger Evidence &amp; Observations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentResponse.bulletPoints.map((point, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Staged Action (Human-in-the-Loop Safe Proposal) */}
            {currentResponse.stagedAction && (
              <div className="staged-action-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className="pill-badge pill-gold" style={{ fontSize: '0.68rem' }}>Staged Proposal</span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>Requires Human Authorization</span>
                    </div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0' }}>
                      {currentResponse.stagedAction.title}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {currentResponse.stagedAction.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => handleApproveStagedAction(currentResponse.stagedAction)}
                  >
                    <span>Authorize &amp; Proceed</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {actionSuccessMessage && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--success-bg)', color: 'var(--accent-primary)', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {actionSuccessMessage}
                  </div>
                )}
              </div>
            )}

            {/* Expandable Append-Only Decision Trace */}
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button
                type="button"
                className="trace-toggle-btn"
                onClick={() => setExpandedTraceId(expandedTraceId === currentResponse.id ? null : currentResponse.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={15} style={{ color: 'var(--indigo-accent)' }} />
                  <span style={{ fontWeight: 600 }}>Append-Only Decision Trace (Audit Log)</span>
                </div>
                {expandedTraceId === currentResponse.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedTraceId === currentResponse.id && (
                <div className="trace-content-box">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <span className="trace-label">Timestamp:</span>
                      <div className="trace-val">{currentResponse.decisionTrace.timestamp}</div>
                    </div>
                    <div>
                      <span className="trace-label">Classified Intent:</span>
                      <div className="trace-val">{currentResponse.decisionTrace.intent}</div>
                    </div>
                    <div>
                      <span className="trace-label">Validation Status:</span>
                      <div className="trace-val" style={{ color: 'var(--accent-primary)' }}>
                        {currentResponse.decisionTrace.validationStatus}
                      </div>
                    </div>
                    <div>
                      <span className="trace-label">Deterministic Tools Executed:</span>
                      <div className="trace-val">
                        {currentResponse.decisionTrace.toolsUsed.map((t) => t.toolName).join(', ')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentResponse.decisionTrace.toolsUsed.map((tool, i) => (
                      <div key={i} className="tool-execution-record">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--indigo-accent)', fontSize: '0.84rem' }}>
                            [{String(i + 1).padStart(2, '0')}] Tool: {tool.toolName}()
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{tool.source}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '8px', marginBottom: '6px' }}>
                          <div><strong>Inputs:</strong> {JSON.stringify(tool.inputs)}</div>
                          {tool.formula && <div style={{ marginTop: '2px', color: 'var(--accent-primary)' }}><strong>Formula:</strong> {tool.formula}</div>}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-tertiary)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                          <strong>Output:</strong> {JSON.stringify(tool.outputs, null, 2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          FINANCIAL CONTROLLER STYLES
          ========================================================== */}
      <style jsx>{`
        .fc-input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 44px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface-elevated);
          color: var(--text-primary);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .fc-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-primary-subtle);
        }
        .preset-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-color);
          border-radius: 999px;
          font-size: 0.76rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .preset-chip:hover {
          color: var(--text-primary);
          border-color: var(--accent-primary);
          background: var(--bg-surface-hover);
        }
        .metric-chip-card {
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .staged-action-card {
          background: linear-gradient(145deg, var(--bg-surface-elevated) 0%, rgba(217, 119, 6, 0.04) 100%);
          border: 1px solid var(--gold-border);
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 20px;
        }
        .trace-toggle-btn {
          width: 100%;
          display: flex;
          justifyContent: space-between;
          align-items: center;
          background: transparent;
          border: none;
          padding: 8px 0;
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
        }
        .trace-toggle-btn:hover {
          color: var(--text-primary);
        }
        .trace-content-box {
          margin-top: 12px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 20px;
        }
        .trace-label {
          font-size: 0.72rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          font-weight: 700;
        }
        .trace-val {
          font-size: 0.85rem;
          font-family: monospace;
          color: var(--text-primary);
          margin-top: 2px;
        }
        .tool-execution-record {
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          padding: 12px;
          background: var(--bg-surface-glass);
        }
      `}</style>
    </div>
  );
}
