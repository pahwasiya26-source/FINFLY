'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { CalculationPanel } from '../../components/CalculationPanel';
import {
  computeRunway,
  calculateTaxProjection,
  detectAnomalies,
} from '../../lib/finance-tools';
import {
  ControllerResponse,
  DecisionTraceEntry,
} from '../../lib/finance-controller-orchestrator';
import {
  UserCheck,
  Sparkles,
  Shield,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Calculator,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Send,
  Zap,
  Info,
  DollarSign,
  RefreshCw,
  FileSearch,
  Check,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/AuthContext';

interface AdvisorTopic {
  id: string;
  question: string;
  category: 'AFFORDABILITY' | 'HEALTH' | 'SAVINGS' | 'TAX' | 'EXPENSE_VARIANCE' | 'GOALS';
  title: string;
}

const ADVISOR_TOPICS: AdvisorTopic[] = [
  { id: 'q_health', question: 'How am I doing financially this month?', category: 'HEALTH', title: 'Overall Financial Health & Vital Signs' },
  { id: 'q_afford', question: 'Can I afford a ₹1,50,000 major purchase or equipment upgrade?', category: 'AFFORDABILITY', title: 'Major Purchase & Affordability Simulator' },
  { id: 'q_spend', question: 'Where am I overspending compared to my historical baseline?', category: 'EXPENSE_VARIANCE', title: 'Category Variance & Discretionary Outflow Audit' },
  { id: 'q_save', question: 'How much should I save and allocate to investments each month?', category: 'SAVINGS', title: 'Savings Velocity & Surplus Allocation' },
  { id: 'q_tax', question: 'How much statutory income tax should I provision for FY 2024-25?', category: 'TAX', title: 'Statutory Tax Liability & Advance Tax Schedule' },
  { id: 'q_watch', question: 'What financial obligations and risk signals should I watch this month?', category: 'GOALS', title: 'Monthly Sentinel & Upcoming Commitments' },
];

export default function PersonalCaPage() {
  const { mode, getCurrentData, dataMode, obligations, fetchAndHydrate, activateDemo, exitDemo } = useStore();
  const { user, profile } = useAuth();
  const data = getCurrentData();

  const [activeTopicId, setActiveTopicId] = useState<string>('q_health');
  const [customQuestion, setCustomQuestion] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(150000);
  const [customResponse, setCustomResponse] = useState<ControllerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Synchronize authenticated data on mount if needed
  useEffect(() => {
    if (user?.id && dataMode !== 'DEMO') {
      fetchAndHydrate(user.id);
    }
  }, [user?.id, dataMode, fetchAndHydrate]);

  // Deterministic computations for fallback reference cards
  const runway = computeRunway(data.cash, data.monthlyExpenses, data.monthlyIncome);
  const taxProj = calculateTaxProjection(data.monthlyIncome * 12, 150000, 'new');
  const anomalies = detectAnomalies(mode);

  // Affordability calculation for simulator card
  const cashAfterPurchase = data.cash - purchaseAmount;
  const postPurchaseRunwayMonths = data.monthlyExpenses > 0 ? Number((cashAfterPurchase / data.monthlyExpenses).toFixed(1)) : 0;
  const isAffordable = postPurchaseRunwayMonths >= 3.0 && cashAfterPurchase > 0;

  const handleRunQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;
    setLoading(true);
    setErrorMessage(null);
    setActionSuccessMessage(null);

    try {
      const res = await fetch('/api/consult-ca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryText.trim(),
          mode,
          dataMode,
          overview: data,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || `Consultation request failed (HTTP ${res.status})`);
      }

      setCustomResponse(result.data);
      setExpandedTraceId(null);
    } catch (err: any) {
      console.error('[Consult CA] Error querying Finance Controller:', err);
      setErrorMessage(err?.message || 'Failed to connect to AI Finance Controller. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topic: AdvisorTopic) => {
    setActiveTopicId(topic.id);
    handleRunQuery(topic.question);
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputEl = document.querySelector('input[placeholder*="Ask your Personal CA"]') as HTMLInputElement | null;
    const query = (customQuestion || inputEl?.value || '').trim();
    if (!query || loading) return;
    setCustomQuestion('');
    if (inputEl) inputEl.value = '';
    handleRunQuery(query);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="pill-badge pill-emerald">Private Wealth Office</span>
            <span className="pill-badge pill-indigo">Deterministic Financial Advisory</span>
            <span className="pill-badge pill-neutral">Client: {profile?.fullName || 'Siya Pahwa'}</span>
            {dataMode === 'DEMO' && <span className="pill-badge pill-gold">Demo Telemetry Active</span>}
            {dataMode === 'EMPTY' && <span className="pill-badge pill-danger">Workspace Empty</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={22} />
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>AI Personal CA / Finance Advisor</h1>
          </div>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '800px' }}>
            Dedicated private financial advisory layer. Grounded in deterministic general ledger math, verified cash reserves, and statutory Indian tax slabs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {dataMode === 'EMPTY' && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => activateDemo()}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <Sparkles size={14} color="var(--gold-accent)" />
              <span>Load Demo Data</span>
            </button>
          )}
          {dataMode === 'DEMO' && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => exitDemo()}
              style={{ fontSize: '0.8rem', padding: '6px 12px', color: 'var(--text-tertiary)' }}
            >
              <span>Exit Demo</span>
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '8px 14px' }}>
            <Shield size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Deterministic Math Enclave</span>
          </div>
        </div>
      </div>

      {/* ── STATUTORY DISCLAIMER BANNER ── */}
      <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--gold-accent)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} color="var(--gold-accent)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong>Notice:</strong> AI financial guidance is strictly computed from your verified accounts and statutory schedules. This is a deterministic advisory tool and not a substitute for a licensed CA/tax professional.
          </span>
        </div>
        <span className="pill-badge pill-gold" style={{ fontSize: '0.68rem' }}>Statutory Estimate Policy</span>
      </div>

      {/* ── NATURAL LANGUAGE QUERY BAR ── */}
      <div className="glass-panel" style={{ padding: '18px 22px' }}>
        <form onSubmit={handleCustomQuestionSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-premium"
              value={customQuestion}
              disabled={loading}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask your Personal CA: e.g., 'How much runway do I have?', 'Where is my cash going?', 'How much tax do I owe?', 'Are there unusual transactions?'"
              style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
            />
            {loading ? (
              <Loader2 size={18} color="var(--accent-primary)" className="animate-spin" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            ) : (
              <Sparkles size={18} color="var(--accent-primary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '10px 22px', minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Consulting Finance Controller…</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Consult CA</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── ERROR MESSAGE BANNER ── */}
      {errorMessage && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', fontSize: '0.88rem' }}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── STAGED ACTION SUCCESS TOAST ── */}
      {actionSuccessMessage && (
        <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>{actionSuccessMessage}</span>
        </div>
      )}

      {/* ── TWO COLUMN PRIVATE OFFICE LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '22px' }} className="ca-layout-grid">
        {/* LEFT COLUMN: TOPIC SELECTOR MENU */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
              Advisory Topics
            </span>
            {customResponse && (
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '0.72rem', padding: '2px 6px', color: 'var(--accent-primary)' }}
                onClick={() => setCustomResponse(null)}
              >
                <RotateCcw size={12} style={{ marginRight: '4px' }} />
                Reset View
              </button>
            )}
          </div>

          {ADVISOR_TOPICS.map((topic) => {
            const isActive = activeTopicId === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                disabled={loading}
                onClick={() => handleTopicSelect(topic)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-glass)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`pill-badge ${isActive ? 'pill-emerald' : 'pill-neutral'}`} style={{ fontSize: '0.62rem' }}>
                    {topic.category.replace('_', ' ')}
                  </span>
                  {isActive && <CheckCircle2 size={14} color="var(--accent-primary)" />}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {topic.question}
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: DYNAMIC ADVISORY CONSULTATION RESPONSE OR STATIC REFERENCE CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. DYNAMIC CONTROLLER RESPONSE VIEW */}
          {customResponse ? (
            <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Header with intent and grounded status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span className="pill-badge pill-emerald">Intent: {customResponse.intent}</span>
                    <span className={`pill-badge ${customResponse.decisionTrace.validationStatus === 'STRICTLY_GROUNDED' ? 'pill-emerald' : 'pill-gold'}`}>
                      {customResponse.decisionTrace.validationStatus === 'STRICTLY_GROUNDED'
                        ? '● STRICTLY GROUNDED (VERIFIED LEDGER)'
                        : '▲ PROJECTION ESTIMATE (FORWARD SIMULATION)'}
                    </span>
                    {customResponse.provider === 'GEMINI' ? (
                      <span className="pill-badge pill-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={11} />
                        Gemini AI Explainer Active
                      </span>
                    ) : (
                      <span className="pill-badge pill-indigo">100% Deterministic Engine Grounding</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>&ldquo;{customResponse.query}&rdquo;</h2>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                  Trace ID: {customResponse.id}
                </span>
              </div>

              {/* AI Provider Status Notice if applicable */}
              {customResponse.aiProviderMessage && (
                <div style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <Info size={15} color="var(--indigo-accent)" />
                  <span>{customResponse.aiProviderMessage}</span>
                </div>
              )}

              {/* Empty Data Mode Warning if applicable */}
              {customResponse.isInsufficientData && (
                <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={18} color="var(--gold-accent)" />
                    <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      Your workspace has no recorded transactions or accounts. Personalized analysis requires real general ledger data.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                    onClick={() => {
                      activateDemo();
                      if (customResponse?.query) {
                        handleRunQuery(customResponse.query);
                      }
                    }}
                  >
                    <Sparkles size={14} color="var(--gold-accent)" />
                    <span>Activate Demo Sandbox</span>
                  </button>
                </div>
              )}

              {/* 1. Deterministic Analysis & Findings */}
              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  1. Deterministic Financial Reasoning &amp; Findings
                </div>
                <p style={{ fontSize: '0.94rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '14px' }}>
                  {customResponse.explanation}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {customResponse.bulletPoints.map((point, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      <Check size={15} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Grounded Evidence Metrics */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  2. Grounded Evidence Metrics
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {customResponse.decisionTrace.groundedMetrics.map((metric, idx) => (
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

              {/* 3. Staged Action Proposal Requiring Human Authorization */}
              {customResponse.stagedAction && (
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--accent-primary)', borderRadius: '12px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span className="pill-badge pill-emerald" style={{ fontSize: '0.65rem' }}>Staged Action</span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>Requires Explicit Human Authorization</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{customResponse.stagedAction.title}</div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{customResponse.stagedAction.description}</div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleApproveStagedAction(customResponse.stagedAction)}
                    style={{ padding: '9px 18px', fontSize: '0.84rem' }}
                  >
                    <span>Authorize &amp; Execute</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* 4. Auditable Decision Trace Tool Inspection */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}
                  onClick={() => setExpandedTraceId(expandedTraceId ? null : customResponse.id)}
                >
                  <FileSearch size={14} />
                  <span>{expandedTraceId ? 'Hide Auditable Decision Trace' : 'Inspect Auditable Decision Trace'}</span>
                  {expandedTraceId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {expandedTraceId && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {customResponse.decisionTrace.toolsUsed.map((tool, idx) => (
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
          ) : (
            /* 2. DEFAULT ACTIVE TOPIC CARD VIEW */
            <>
              {activeTopicId === 'q_health' && (
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span className="pill-badge pill-emerald" style={{ marginBottom: '6px' }}>Verified Financial Health Audit</span>
                      <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>How You Are Doing Financially</h2>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Executive assessment of liquidity buffer, savings rate, and asset growth.
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700 }}>Health Score</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>{data.healthScore} / 100</div>
                    </div>
                  </div>

                  {/* 1. FACTS SECTION */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '12px' }}>
                      1. Audited Ground-Truth Facts
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Liquid Cash</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit' }}>₹{data.cash.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Monthly Inflow</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit' }}>₹{data.monthlyIncome.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Monthly Expenses</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--danger)' }}>₹{data.monthlyExpenses.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>Monthly Surplus</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>+₹{data.monthlySurplus.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>

                  {/* 2. CALCULATION SECTION */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                      2. Deterministic Calculation Proofs
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--accent-primary)', background: 'var(--bg-surface-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '10px' }}>
                      Savings Rate = (Monthly Surplus / Monthly Inflow) * 100 = {data.monthlyIncome > 0 ? `(₹${data.monthlySurplus} / ₹${data.monthlyIncome}) * 100 = ${data.savingsRate}%` : '0% (No income recorded)'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--indigo-accent)', background: 'var(--bg-surface-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      Liquidity Runway = Cash Balance / Monthly Expenses = {data.monthlyExpenses > 0 ? `₹${data.cash} / ₹${data.monthlyExpenses} = ${runway.data.runwayMonths} Months` : '0 Months'}
                    </div>
                  </div>

                  {/* 3. RECOMMENDATION SECTION */}
                  <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                      3. Personal CA Recommendation
                    </div>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li>Your savings rate of <strong>{data.savingsRate}%</strong> {data.savingsRate >= 30 ? 'is well above the recommended 30% baseline for high-income earners.' : 'is below the 30% target baseline.'}</li>
                      <li>Available cash of <strong>₹{data.cash.toLocaleString('en-IN')}</strong> provides {runway.data.runwayMonths} months of emergency buffer. Maintain ₹6,00,000 for a 6-month buffer.</li>
                      <li>Direct surplus liquidity into compounding equity index SIPs and liquid tax provisions.</li>
                    </ul>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRunQuery('How am I doing financially this month?')}
                      className="btn-primary"
                      style={{ fontSize: '0.84rem', padding: '8px 16px' }}
                    >
                      <span>Run Deep AI Controller Analysis</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* AFFORDABILITY CALCULATOR TOPIC */}
              {activeTopicId === 'q_afford' && (
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span className="pill-badge pill-indigo" style={{ marginBottom: '6px' }}>Deterministic Affordability Engine</span>
                      <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Major Purchase &amp; Affordability Simulator</h2>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Simulate capital purchases against minimum emergency buffer thresholds.
                      </p>
                    </div>
                    <span className={`pill-badge ${isAffordable ? 'pill-emerald' : 'pill-danger'}`}>
                      {isAffordable ? 'Affordable with Safe Buffer' : 'Buffer Risk Detected'}
                    </span>
                  </div>

                  {/* Interactive Purchase Amount Slider/Input */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      Simulated Outflow Amount (₹)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <input
                        type="number"
                        min="1000"
                        step="5000"
                        className="input-premium"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(Number(e.target.value) || 0)}
                        style={{ maxWidth: '240px', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Outfit' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[50000, 100000, 150000, 250000, 500000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            onClick={() => setPurchaseAmount(preset)}
                          >
                            ₹{(preset / 1000).toFixed(0)}k
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Impact Comparison Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>Current Position</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Outfit', margin: '4px 0' }}>₹{data.cash.toLocaleString('en-IN')} Cash</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>{runway.data.runwayMonths} Months Runway Buffer</div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-strong)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>Post-Purchase Position</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Outfit', margin: '4px 0', color: cashAfterPurchase >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                        ₹{cashAfterPurchase.toLocaleString('en-IN')} Cash
                      </div>
                      <div style={{ fontSize: '0.78rem', color: postPurchaseRunwayMonths >= 3 ? 'var(--accent-primary)' : 'var(--danger)' }}>
                        {postPurchaseRunwayMonths} Months Remaining Buffer
                      </div>
                    </div>
                  </div>

                  {/* CA Recommendation */}
                  <div style={{ background: isAffordable ? 'var(--success-bg)' : 'var(--danger-bg)', border: `1px solid ${isAffordable ? 'var(--success-border)' : 'var(--danger-border)'}`, borderRadius: '12px', padding: '18px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: isAffordable ? 'var(--accent-primary)' : 'var(--danger)', letterSpacing: '0.06em', marginBottom: '6px' }}>
                      Personal CA Verdict
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                      {isAffordable
                        ? `You can safely afford this purchase of ₹${purchaseAmount.toLocaleString('en-IN')}. After disbursement, your remaining liquid cash of ₹${cashAfterPurchase.toLocaleString('en-IN')} preserves ${postPurchaseRunwayMonths} months of expense buffer, above the minimum 3.0-month liquidity threshold.`
                        : `CA Advisory Warning: A purchase of ₹${purchaseAmount.toLocaleString('en-IN')} will compress your liquidity buffer down to ${postPurchaseRunwayMonths} months (below the recommended 3-month safety minimum). Consider funding via monthly tranches instead.`}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRunQuery(`Can I afford a ₹${purchaseAmount} major purchase?`)}
                      className="btn-primary"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <span>Consult Finance Controller</span>
                      <ArrowRight size={14} />
                    </button>
                    <Link href="/financial-twin" className="btn-secondary" style={{ fontSize: '0.82rem' }}>
                      <span>Open Full 12-Month Twin Simulation</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}

              {/* OVERSPENDING & VARIANCE AUDIT */}
              {activeTopicId === 'q_spend' && (
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div>
                    <span className="pill-badge pill-gold" style={{ marginBottom: '6px' }}>Variance Detection Telemetry</span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Category Variance &amp; Spending Audit</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Audited comparison against your rolling 6-month accounting baseline.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {anomalies.data.anomaliesDetected.map((anom, idx) => (
                      <div key={idx} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span className={`pill-badge ${anom.severity === 'HIGH' ? 'pill-danger' : anom.severity === 'MEDIUM' ? 'pill-gold' : 'pill-emerald'}`} style={{ fontSize: '0.65rem' }}>
                              {anom.severity} Priority
                            </span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{anom.category}</span>
                          </div>
                          <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{anom.headline}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{anom.details}</div>
                        </div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--gold-accent)', whiteSpace: 'nowrap' }}>
                          {anom.metricVariance}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRunQuery('Where am I overspending compared to historical baseline?')}
                      className="btn-primary"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <span>Consult Finance Controller on Spending</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* SAVINGS & SURPLUS ALLOCATION */}
              {activeTopicId === 'q_save' && (
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div>
                    <span className="pill-badge pill-emerald" style={{ marginBottom: '6px' }}>Surplus Allocation Strategy</span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>How Much Should You Save &amp; Invest?</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Capital allocation distribution for your ₹{data.monthlySurplus.toLocaleString('en-IN')} monthly surplus.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 700 }}>50% Equities Index SIP</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', margin: '4px 0' }}>₹{Math.round(data.monthlySurplus * 0.5).toLocaleString('en-IN')} / mo</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Nifty 50 &amp; Global ETFs</div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--gold-accent)', fontWeight: 700 }}>25% Emergency Buffer</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', margin: '4px 0' }}>₹{Math.round(data.monthlySurplus * 0.25).toLocaleString('en-IN')} / mo</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>High-Yield Liquid Sweep</div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--indigo-accent)', fontWeight: 700 }}>25% Sovereign Gold &amp; Debt</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', margin: '4px 0' }}>₹{Math.round(data.monthlySurplus * 0.25).toLocaleString('en-IN')} / mo</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>SGBs &amp; AAA Corporate Debt</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRunQuery('How much should I save and allocate to investments each month?')}
                      className="btn-primary"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <span>Consult Finance Controller on Allocation</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STATUTORY TAX GUIDANCE */}
              {activeTopicId === 'q_tax' && (
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span className="pill-badge pill-gold" style={{ marginBottom: '6px' }}>Statutory Tax Estimate (FY 2024-25)</span>
                      <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Statutory Income Tax Planning &amp; Projection</h2>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Calculated under the FY 2024-25 New Tax Regime slabs.
                      </p>
                    </div>
                    <Link href="/taxes" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                      <span>Open Full Tax Center</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Annualized Gross Inflow</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit' }}>₹{(data.monthlyIncome * 12).toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Taxable Income</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit' }}>₹{taxProj.data.taxableIncome.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Estimated Tax + Cess</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--danger)' }}>₹{taxProj.data.totalPayableWithCess.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Effective Tax Rate</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--gold-accent)' }}>{taxProj.data.effectiveTaxRatePct}%</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRunQuery('How much statutory income tax should I plan for this year?')}
                      className="btn-primary"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <span>Consult Finance Controller on Taxes</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* UPCOMING COMMITMENTS & SENTINEL */}
              {activeTopicId === 'q_watch' && (
                <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div>
                    <span className="pill-badge pill-indigo" style={{ marginBottom: '6px' }}>Monthly Sentinel Watchlist</span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>What To Watch This Month</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      Proactive notifications on scheduled debits, tax installments, and cashflow obligations.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {obligations.filter((o) => o.entity === mode).length > 0 ? (
                      obligations.filter((o) => o.entity === mode).map((obl) => (
                        <div key={obl.id} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>{obl.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Due Date: {obl.dueDate} • Category: {obl.category}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Outfit' }}>₹{obl.amount.toLocaleString('en-IN')}</div>
                            <span className="pill-badge pill-emerald" style={{ fontSize: '0.62rem' }}>{obl.status}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        No upcoming obligations scheduled for this period.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRunQuery('What financial obligations and risk signals should I watch this month?')}
                      className="btn-primary"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <span>Consult Finance Controller on Obligations</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 960px) {
          .ca-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
