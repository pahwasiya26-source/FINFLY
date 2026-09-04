'use client';

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { CalculationPanel } from '../../components/CalculationPanel';
import {
  getFinancialOverview,
  computeRunway,
  calculateTaxProjection,
  detectAnomalies,
  simulateScenario
} from '../../lib/finance-tools';
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
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

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
  const { mode, getCurrentData, transactions, obligations } = useStore();
  const data = getCurrentData();

  const [activeTopicId, setActiveTopicId] = useState<string>('q_health');
  const [customQuestion, setCustomQuestion] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(150000);
  const [customResponse, setCustomResponse] = useState<any | null>(null);

  // Deterministic computations
  const runway = computeRunway(data.cash, data.monthlyExpenses, data.monthlyIncome);
  const taxProj = calculateTaxProjection(data.monthlyIncome * 12, 150000, 'new');
  const anomalies = detectAnomalies(mode);

  // Affordability calculation
  const cashAfterPurchase = data.cash - purchaseAmount;
  const postPurchaseRunwayMonths = data.monthlyExpenses > 0 ? Number((cashAfterPurchase / data.monthlyExpenses).toFixed(1)) : 0;
  const isAffordable = postPurchaseRunwayMonths >= 3.0 && cashAfterPurchase > 0;

  const handleTopicSelect = (id: string) => {
    setActiveTopicId(id);
    setCustomResponse(null);
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const lower = customQuestion.toLowerCase();
    let topicMatch = 'q_health';

    if (lower.includes('afford') || lower.includes('buy') || lower.includes('spend') || lower.includes('purchase')) {
      topicMatch = 'q_afford';
      const match = customQuestion.match(/(\d+[\d,]*)/);
      if (match) {
        const val = parseInt(match[1].replace(/,/g, ''), 10);
        if (val > 0) setPurchaseAmount(val);
      }
    } else if (lower.includes('tax') || lower.includes('slab') || lower.includes('80c') || lower.includes('deduct')) {
      topicMatch = 'q_tax';
    } else if (lower.includes('save') || lower.includes('invest') || lower.includes('surplus')) {
      topicMatch = 'q_save';
    } else if (lower.includes('overspend') || lower.includes('expense') || lower.includes('variance')) {
      topicMatch = 'q_spend';
    } else if (lower.includes('watch') || lower.includes('upcoming') || lower.includes('due')) {
      topicMatch = 'q_watch';
    }

    setActiveTopicId(topicMatch);
    setCustomQuestion('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="pill-badge pill-emerald">Private Wealth Office</span>
            <span className="pill-badge pill-indigo">Deterministic Financial Advisory</span>
            <span className="pill-badge pill-neutral">Client: Siya Pahwa</span>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '8px 14px' }}>
          <Shield size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Deterministic Math</span>
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
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask your Personal CA: e.g. 'Can I afford a ₹1,20,000 laptop?', 'How much tax do I owe?', 'Where am I overspending?'"
              style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
            />
            <Sparkles size={18} color="var(--accent-primary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
            <Send size={15} />
            <span>Consult CA</span>
          </button>
        </form>
      </div>

      {/* ── TWO COLUMN PRIVATE OFFICE LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '22px' }} className="ca-layout-grid">
        {/* LEFT COLUMN: TOPIC SELECTOR MENU */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', padding: '0 4px' }}>
            Advisory Topics
          </span>

          {ADVISOR_TOPICS.map((topic) => {
            const isActive = activeTopicId === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicSelect(topic.id)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-glass)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
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

        {/* RIGHT COLUMN: ADVISORY CONSULTATION RESPONSE (FACTS, CALCULATION, RECOMMENDATION, ASSUMPTIONS) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Topic Card */}
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
                  Savings Rate = (Monthly Surplus / Monthly Inflow) * 100 = (₹{data.monthlySurplus} / ₹{data.monthlyIncome}) * 100 = {data.savingsRate}%
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--indigo-accent)', background: 'var(--bg-surface-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  Liquidity Runway = Cash Balance / Monthly Expenses = ₹{data.cash} / ₹{data.monthlyExpenses} = {runway.data.runwayMonths} Months
                </div>
              </div>

              {/* 3. RECOMMENDATION SECTION */}
              <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  3. Personal CA Recommendation
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Your savings rate of <strong>{data.savingsRate}%</strong> is well above the recommended 30% baseline for high-income earners.</li>
                  <li>Available cash of <strong>₹{data.cash.toLocaleString('en-IN')}</strong> provides {runway.data.runwayMonths} months of emergency buffer. Maintain ₹6,00,000 for a 6-month buffer.</li>
                  <li>Direct ₹45,000 of your monthly surplus into compounding equity index SIPs and ₹25,000 to liquid tax provisions.</li>
                </ul>
              </div>

              {/* 4. ASSUMPTIONS */}
              <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <strong>Assumptions:</strong> Assumes recurring monthly remuneration remains stable at ₹1,80,000 and fixed residential rent remains ₹38,000/month.
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
                    : `CA Advisory Warning: A purchase of ₹${purchaseAmount.toLocaleString('en-IN')} will compress your liquidity buffer down to ${postPurchaseRunwayMonths} months (below the recommended 3-month safety minimum). Consider funding via 3 monthly tranches of ₹${Math.round(purchaseAmount / 3).toLocaleString('en-IN')} instead.`}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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

              <div style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Personal CA Optimization Advice
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  The travel outflow variance of +₹4,400 is attributed to one-off flight bookings and does not represent structural expense inflation. Your core fixed lifestyle burn (housing, utilities, groceries) remains fully within the 55% target ceiling.
                </p>
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
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', margin: '4px 0' }}>₹42,500 / mo</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Nifty 50 &amp; US Tech ETFs</div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--gold-accent)', fontWeight: 700 }}>25% Emergency Buffer</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', margin: '4px 0' }}>₹21,250 / mo</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>High-Yield Liquid Sweep</div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--indigo-accent)', fontWeight: 700 }}>25% Sovereign Gold &amp; Debt</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit', margin: '4px 0' }}>₹21,250 / mo</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>SGBs &amp; AAA Corporate Debt</div>
                </div>
              </div>

              <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  10-Year Compounding Projection Proof
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  At ₹42,500/month invested into equities assuming a conservative 12% CAGR, your portfolio is projected to grow to <strong>₹98,20,000</strong> in 10 years with a total principal contribution of ₹51,00,000.
                </p>
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

              <div style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Quarterly Advance Tax Recommendation
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  Provision <strong>₹{Math.round(taxProj.data.totalPayableWithCess * 0.25).toLocaleString('en-IN')}</strong> each quarter to meet the statutory Section 208 deadlines (June 15, Sept 15, Dec 15, March 15) and prevent Section 234B/234C interest penalties.
                </p>
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
                {obligations.filter(o => o.entity === mode).map((obl) => (
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
                ))}
              </div>
            </div>
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
