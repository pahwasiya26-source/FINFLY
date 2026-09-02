'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { TransactionRecord } from '../../lib/mock-data';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import {
  ArrowLeftRight,
  Workflow,
  Layers,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
  Wallet,
  Building2,
  SlidersHorizontal,
  RefreshCw,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function MoneyFlowPage() {
  const { mode, transactions } = useStore();

  // Filter States
  const [selectedEntity, setSelectedEntity] = useState<'ALL' | 'PERSONAL' | 'BUSINESS'>(mode);
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('Q3 2026');

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Entity filter
      if (selectedEntity !== 'ALL' && tx.entity !== selectedEntity) return false;
      // Account filter
      if (selectedAccount !== 'ALL' && tx.account !== selectedAccount) return false;
      // Category filter
      if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) return false;
      // Type filter
      if (selectedType !== 'ALL' && tx.type !== selectedType) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchCat = tx.category.toLowerCase().includes(q);
        const matchAcc = tx.account.toLowerCase().includes(q);
        if (!matchDesc && !matchCat && !matchAcc) return false;
      }
      return true;
    });
  }, [transactions, selectedEntity, selectedAccount, selectedCategory, selectedType, searchQuery]);

  // Dynamically computed metrics based on active filtered transactions
  const totalInflow = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'INFLOW')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalOutflow = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'OUTFLOW')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netFlow = totalInflow - totalOutflow;
  const retentionPct = totalInflow > 0 ? Number(((netFlow / totalInflow) * 100).toFixed(1)) : 0;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number; type: 'INFLOW' | 'OUTFLOW' }> = {};
    filteredTransactions.forEach((t) => {
      if (!map[t.category]) map[t.category] = { total: 0, count: 0, type: t.type };
      map[t.category].total += t.amount;
      map[t.category].count += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Description', 'Category', 'Account', 'Type', 'Amount', 'Entity', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      `"${t.account}"`,
      t.type,
      t.amount,
      t.entity,
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finfly_money_flow_${selectedEntity.toLowerCase()}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pill-badge pill-emerald">Live Telemetry Pipeline</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>General Ledger Stream</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeftRight size={22} />
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Money Flow &amp; Ledger Analytics</h1>
          </div>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            End-to-end multi-entity capital routing, category attribution, and live transaction ledger.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleExportCSV} className="btn-secondary" style={{ fontSize: '0.84rem' }}>
            <Download size={15} />
            <span>Export Filtered CSV</span>
          </button>
          <Link href="/" className="btn-secondary" style={{ fontSize: '0.84rem' }}>
            Back to Command Center
          </Link>
        </div>
      </div>

      {/* ── DYNAMIC KPI STRIP (REACTIVE TO FILTERS) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Filtered Total Inflows
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            <AnimatedNumber value={totalInflow} format="currency" />
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
            {filteredTransactions.filter(t => t.type === 'INFLOW').length} Inflow Transactions
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Filtered Total Outflows
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--danger)', margin: '4px 0' }}>
            -₹{totalOutflow.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            {filteredTransactions.filter(t => t.type === 'OUTFLOW').length} Outflow Disbursals
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Net Operating Flow
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: netFlow >= 0 ? 'var(--accent-primary)' : 'var(--danger)', margin: '4px 0' }}>
            {netFlow >= 0 ? '+' : '-'}₹{Math.abs(netFlow).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            ● {retentionPct}% Retention Velocity
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Ledger Match Health
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
            100% Settled
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-primary)' }}>
            Zero Pending Reversals
          </div>
        </div>
      </div>

      {/* ── FILTER CONTROL BAR ── */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Interactive Ledger Filter Pipeline</h3>
          </div>

          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '0.78rem', padding: '4px 8px' }}
            onClick={() => {
              setSelectedEntity('ALL');
              setSelectedAccount('ALL');
              setSelectedCategory('ALL');
              setSelectedType('ALL');
              setSearchQuery('');
            }}
          >
            <RefreshCw size={13} />
            <span>Reset All Filters</span>
          </button>
        </div>

        {/* Filter Selectors Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* 1. Entity Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Entity Context
            </label>
            <select
              className="input-premium"
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value as any)}
              style={{ fontSize: '0.84rem' }}
            >
              <option value="ALL">All Entities (Personal + Business)</option>
              <option value="PERSONAL">Personal Wealth Only</option>
              <option value="BUSINESS">Corporate Enterprise Only</option>
            </select>
          </div>

          {/* 2. Account Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Bank / Gateway Account
            </label>
            <select
              className="input-premium"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              style={{ fontSize: '0.84rem' }}
            >
              <option value="ALL">All Financial Accounts</option>
              <option value="HDFC Wealth Checking">HDFC Wealth Checking</option>
              <option value="ICICI Savings">ICICI Savings</option>
              <option value="Axis Treasury">Axis Treasury</option>
              <option value="Razorpay Payouts">Razorpay Payouts</option>
              <option value="Zerodha Broking">Zerodha Broking</option>
            </select>
          </div>

          {/* 3. Category Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Category Attribution
            </label>
            <select
              className="input-premium"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ fontSize: '0.84rem' }}
            >
              <option value="ALL">All Categories</option>
              <option value="Salary">Salary Inflow</option>
              <option value="Client Revenue">Client Revenue</option>
              <option value="Housing">Housing &amp; Rent</option>
              <option value="Travel">Travel &amp; Flights</option>
              <option value="Software & Cloud">Software &amp; Cloud</option>
              <option value="Payroll & HR">Payroll &amp; HR</option>
              <option value="Dining & Groceries">Dining &amp; Groceries</option>
              <option value="Investments">Investments</option>
              <option value="Tax & Compliance">Tax &amp; Compliance</option>
            </select>
          </div>

          {/* 4. Type Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Flow Direction
            </label>
            <select
              className="input-premium"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              style={{ fontSize: '0.84rem' }}
            >
              <option value="ALL">Both Inflows &amp; Outflows</option>
              <option value="INFLOW">Inflows Only (+)</option>
              <option value="OUTFLOW">Outflows Only (-)</option>
            </select>
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input-premium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description, invoice IDs, or transaction tags..."
            style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
          />
          <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* ── CATEGORY ALLOCATION BREAKDOWN ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Category Outflow &amp; Inflow Attribution</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Click any category card to drill down into the transaction register</p>
          </div>
          <span className="pill-badge pill-neutral">{categoryBreakdown.length} Categories</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {categoryBreakdown.map(([catName, stats]) => {
            const isSelected = selectedCategory === catName;
            return (
              <div
                key={catName}
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '14px 16px',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)',
                }}
                onClick={() => setSelectedCategory(isSelected ? 'ALL' : catName)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{catName}</span>
                  <span className={`pill-badge ${stats.type === 'INFLOW' ? 'pill-emerald' : 'pill-danger'}`} style={{ fontSize: '0.62rem' }}>
                    {stats.type}
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', color: stats.type === 'INFLOW' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  ₹{stats.total.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {stats.count} transaction{stats.count > 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LIVE TRANSACTION REGISTER TABLE ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Live Transaction Ledger Register</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Showing {filteredTransactions.length} of {transactions.length} reconciled entries
            </p>
          </div>
          <span className="pill-badge pill-emerald">Zero Ledger Drift</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Filter size={32} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>No Transactions Match Active Filters</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', maxWidth: '400px', margin: '0 auto 16px auto' }}>
              Adjust your search keywords, entity context, or category selection above to view records.
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSelectedEntity('ALL');
                setSelectedAccount('ALL');
                setSelectedCategory('ALL');
                setSelectedType('ALL');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="fin-table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Account</th>
                  <th>Category</th>
                  <th>Entity</th>
                  <th>Direction</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{tx.date}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.description}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{tx.account}</td>
                    <td>
                      <span
                        className="pill-badge pill-neutral"
                        style={{ fontSize: '0.68rem', cursor: 'pointer' }}
                        onClick={() => setSelectedCategory(tx.category)}
                        title={`Filter by ${tx.category}`}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <span className="pill-badge pill-neutral" style={{ fontSize: '0.65rem' }}>
                        {tx.entity}
                      </span>
                    </td>
                    <td>
                      <span className={`pill-badge ${tx.type === 'INFLOW' ? 'pill-emerald' : 'pill-danger'}`} style={{ fontSize: '0.65rem' }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'Outfit', fontSize: '0.95rem', color: tx.type === 'INFLOW' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {tx.type === 'INFLOW' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="pill-badge pill-emerald" style={{ fontSize: '0.62rem' }}>
                        <CheckCircle2 size={11} />
                        <span>{tx.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
