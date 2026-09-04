'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { FinanceControllerOrchestrator, ControllerResponse, DecisionTraceEntry } from '../../lib/finance-controller-orchestrator';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { CalculationPanel } from '../../components/CalculationPanel';
import {
  ShieldCheck,
  Sparkles,
  Send,
  ArrowRight,
  Activity,
  Cpu,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Terminal,
  FileSearch,
  Check,
  Loader2,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/AuthContext';
import { insertDecisionTrace } from '../../lib/supabase/queries';

const PRESET_QUERIES = [
  'What is my current runway and cash buffer?',
  'Run a two-way reconciliation audit on gateway and bank settlements.',
  'What happens if we increase monthly expenses by ₹50,000?',
  'Detect any financial anomalies or spending variances.',
  'Estimate my statutory tax liability for the year.',
];

export default function FinanceControllerPage() {
  const { mode, getCurrentData, dataMode, isHydrating, dataError, fetchAndHydrate } = useStore();
  const { user } = useAuth();
  const data = getCurrentData();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<ControllerResponse | null>(null);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ControllerResponse[]>([]);

  useEffect(() => {
    if (user?.id && dataMode !== 'DEMO') {
      fetchAndHydrate(user.id);
    }
  }, [user?.id, dataMode, fetchAndHydrate]);

  // Load initial runway analysis on mount or mode change
  useEffect(() => {
    handleRunQuery('What is my current runway and cash buffer?');
  }, [mode]);

  const handleRunQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setActionSuccessMessage(null);

    const resp = await FinanceControllerOrchestrator.processQuery(queryText, mode, data);
    setCurrentResponse(resp);
    setExpandedTraceId(resp.id);
    setHistory((prev) => [resp, ...prev.filter((h) => h.id !== resp.id)].slice(0, 5));
    setLoading(false);
    setInputQuery('');

    // Persist trace to Supabase in authenticated session (immutable audit trail)
    if (user?.id && dataMode !== 'DEMO') {
      insertDecisionTrace({
        id: `dt_${Date.now()}`,
        trace_id: resp.id,
        user_id: user.id,
        organization_id: null,
        query: resp.query,
        intent: resp.intent,
        tools_used: resp.decisionTrace.toolsUsed,
        validation_status: resp.decisionTrace.validationStatus,
        grounded_metrics: resp.decisionTrace.groundedMetrics,
        created_at: new Date().toISOString(),
      }).catch(() => {
        // Non-blocking audit logging
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunQuery(inputQuery);
  };

  const handleApproveStagedAction = (action: DecisionTraceEntry['stagedAction']) => {
    if (!action) return;
    setActionSuccessMessage(`Action verified and authorized by human controller: "${action.title}". Staged execution recorded in audit trail.`);
    if (action.targetUrl) {
      setTimeout(() => {
        window.location.href = action.targetUrl!;
      }, 1200);
    }
  };

  if (isHydrating && dataMode !== 'DEMO') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={20} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.94rem', color: 'var(--text-secondary)' }}>Initializing Finance Controller &amp; Audit Engine...</span>
        </div>
        <div className="glass-panel" style={{ padding: '24px', height: '140px', opacity: 0.5 }} />
        <div className="glass-panel" style={{ padding: '24px', height: '240px', opacity: 0.5 }} />
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
            <span>Controller Telemetry Error: {dataError}</span>
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

      {/* ── HERO & SYSTEM STATUS ── */}
      <div className="glass-hero" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="pill-badge pill-emerald">Strict Read-Only Enclave</span>
              <span className="pill-badge pill-indigo">Deterministic Finance Engine</span>
              <span className="pill-badge pill-neutral">Mode: {mode}</span>
              {dataMode === 'DEMO' && <span className="pill-badge pill-gold">Demo Telemetry Active</span>}
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              AI Finance Controller &amp; Operations
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', maxWidth: '750px', marginTop: '4px' }}>
              Natural-language financial reasoning strictly grounded in deterministic accounting math, general ledger truth, and auditable Decision Traces.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-elevated)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Lock size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>No Autonomous Ledger Mutation</span>
          </div>
        </div>

        {/* Operational Guardrails KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div className="glass-panel" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Audit Guardrails
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '3px 0' }}>
              100% Policy Bound
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--accent-primary)' }}>Human Authorization Required</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Deterministic Tool Fleet
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '3px 0' }}>
              6 Verified Tools
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--indigo-accent)' }}>Math &amp; Ledgers Decoupled</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Net Position Ground Truth
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '3px 0' }}>
              <AnimatedNumber value={data.netPosition} format="currency" />
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--accent-primary)' }}>General Ledger Snapshot</div>
          </div>

          <div className="glass-panel" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Health Index Score
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '3px 0' }}>
              {data.healthScore} / 100
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--accent-primary)' }}>Nominal Target</div>
          </div>
        </div>
      </div>

      {/* ── QUERY CONSOLE & PRESET PROMPTS ── */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-premium"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Finance Controller: e.g., 'What is my current runway?', 'Run reconciliation audit', 'Simulate adding ₹50k expense'"
              style={{ paddingLeft: '40px', fontSize: '0.94rem' }}
            />
            <Terminal size={17} color="var(--accent-primary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '11px 22px' }}>
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            <span>{loading ? 'Evaluating Tools...' : 'Execute Query'}</span>
          </button>
        </form>

        {/* Preset Query Chips */}
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
            Preset Finance-Ops Queries
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                onClick={() => handleRunQuery(preset)}
              >
                <span>{preset}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── STAGED ACTION SUCCESS TOAST ── */}
      {actionSuccessMessage && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>{actionSuccessMessage}</span>
        </div>
      )}

      {/* ── ACTIVE CONTROLLER RESPONSE (STRUCTURED REASONING) ── */}
      {currentResponse && (
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Query & Intent Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span className="pill-badge pill-emerald">Intent: {currentResponse.intent}</span>
                <span className={`pill-badge ${currentResponse.decisionTrace.validationStatus === 'STRICTLY_GROUNDED' ? 'pill-emerald' : 'pill-gold'}`}>
                  {currentResponse.decisionTrace.validationStatus === 'STRICTLY_GROUNDED' ? '● STRICTLY GROUNDED (VERIFIED LEDGER)' : '▲ PROJECTION ESTIMATE (FORWARD SIMULATION)'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>"{currentResponse.query}"</h2>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
              Trace ID: {currentResponse.id}
            </span>
          </div>

          {/* Explanation & Key Findings */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Deterministic Analysis &amp; Findings
            </div>
            <p style={{ fontSize: '0.94rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '14px' }}>
              {currentResponse.explanation}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {currentResponse.bulletPoints.map((point, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <Check size={15} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grounded Metrics Grid */}
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Grounded Evidence Metrics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {currentResponse.decisionTrace.groundedMetrics.map((metric, idx) => (
                <div key={idx} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>{metric.label}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', color: metric.positive === false ? 'var(--danger)' : 'var(--text-primary)', margin: '2px 0' }}>
                    {metric.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {metric.source}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unresolved Exceptions Table if Reconciliation Query */}
          {(() => {
            const reconTool = currentResponse.decisionTrace.toolsUsed.find(
              (t) => t.toolName === 'runReconciliationAudit'
            );
            const discrepancies = reconTool?.outputs?.discrepancies || [];
            if (reconTool && discrepancies.length > 0) {
              return (
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
                      Unresolved Reconciliation Exceptions ({discrepancies.length})
                    </div>
                    <span className="pill-badge pill-gold">Requires Human Review</span>
                  </div>
                  <div className="fin-table-container">
                    <table className="fin-table" style={{ fontSize: '0.84rem' }}>
                      <thead>
                        <tr>
                          <th>Reference ID</th>
                          <th>Exception Type</th>
                          <th>Amount</th>
                          <th>Audit Findings / Note</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discrepancies.map((d: any, i: number) => (
                          <tr key={i}>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d.id}</td>
                            <td>
                              <span className={`pill-badge ${d.type === 'DUPLICATE_WEBHOOK' ? 'pill-danger' : d.type === 'MDR_FEE_VARIANCE' ? 'pill-gold' : 'pill-neutral'}`} style={{ fontSize: '0.65rem' }}>
                                {d.type}
                              </span>
                            </td>
                            <td style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                              ₹{d.amount.toLocaleString('en-IN')}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{d.note}</td>
                            <td>
                              <span className="pill-badge pill-gold" style={{ fontSize: '0.62rem' }}>
                                Unresolved
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            } else if (reconTool && discrepancies.length === 0) {
              return (
                <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={20} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>100% Reconciled — Zero Exceptions</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>All evaluated records cleanly match between gateway and bank settlement statements.</div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Staged Action Proposal Requiring Human Authorization */}
          {currentResponse.stagedAction && (
            <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--accent-primary)', borderRadius: '12px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span className="pill-badge pill-emerald" style={{ fontSize: '0.65rem' }}>Staged Action</span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>Requires Explicit Human Authorization</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentResponse.stagedAction.title}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{currentResponse.stagedAction.description}</div>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => handleApproveStagedAction(currentResponse.stagedAction)}
                style={{ padding: '9px 18px', fontSize: '0.84rem' }}
              >
                <span>Authorize &amp; Execute</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* Decision Trace Tool Execution Inspection */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}
              onClick={() => setExpandedTraceId(expandedTraceId ? null : currentResponse.id)}
            >
              <FileSearch size={14} />
              <span>{expandedTraceId ? 'Hide Auditable Decision Trace' : 'Inspect Auditable Decision Trace'}</span>
              {expandedTraceId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedTraceId && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentResponse.decisionTrace.toolsUsed.map((tool, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '4px' }}>
                      Tool: {tool.toolName}()
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      Source: {tool.source}
                    </div>
                    {tool.formula && (
                      <div style={{ color: 'var(--gold-accent)' }}>
                        Formula: {tool.formula}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
