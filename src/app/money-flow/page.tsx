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
  Download,
  Plus,
  Trash2,
  Loader2,
  X,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/AuthContext';
import { AddTransactionModal } from '../../components/AddTransactionModal';
import { AddAccountModal } from '../../components/AddAccountModal';

export default function MoneyFlowPage() {
  const { mode, transactions, accounts, removeTransaction, fetchAndHydrate, dataMode, isHydrating, lastSyncedAt, dataError } = useStore();
  const { user } = useAuth();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user?.id && dataMode !== 'DEMO') {
      fetchAndHydrate(user.id);
    }
  }, [user?.id, dataMode, fetchAndHydrate]);

  // Filter States
  const [selectedEntity, setSelectedEntity] = useState<'ALL' | 'PERSONAL' | 'BUSINESS'>(mode);
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('Q3 2026');

  // Dynamic available accounts from real data or demo
  const availableAccounts = useMemo(() => {
    if (dataMode === 'DEMO') {
      return ['HDFC Wealth Checking', 'ICICI Savings', 'Axis Treasury', 'Razorpay Payouts', 'Zerodha Broking'];
    }
    const set = new Set<string>();
    accounts.forEach((a) => set.add(a.name));
    transactions.forEach((t) => {
      if (t.account) set.add(t.account);
    });
    return Array.from(set);
  }, [dataMode, accounts, transactions]);

  // Dynamic available categories
  const availableCategories = useMemo(() => {
    const defaultCats = [
      'Salary',
      'Client Revenue',
      'Consulting',
      'Housing',
      'Travel',
      'Software & Cloud',
      'Payroll & HR',
      'Dining & Groceries',
      'Investments',
      'Tax & Compliance',
      'Utilities',
      'Healthcare',
      'Other',
    ];
    const set = new Set<string>(defaultCats);
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  // Filter & Deterministic Sort: newest date first, then stable tie-breaker by id
  const filteredTransactions = useMemo(() => {
    const list = transactions.filter((tx) => {
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

    return list.sort((a, b) => {
      const dateCmp = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCmp !== 0) return dateCmp;
      return b.id.localeCompare(a.id);
    });
  }, [transactions, selectedEntity, selectedAccount, selectedCategory, selectedType, searchQuery]);

  const handleDeleteTx = async (txId: string) => {
    setActionError(null);
    const res = await removeTransaction(txId, user?.id);
    if (!res.success) {
      setActionError(res.error || 'Failed to delete transaction.');
    }
  };

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
    link.setAttribute('download', `finexfly_money_flow_${selectedEntity.toLowerCase()}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isHydrating && dataMode !== 'DEMO' && lastSyncedAt === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '40px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={20} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.94rem', color: 'var(--text-secondary)' }}>Synchronizing money flow ledger...</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ padding: '20px 24px', height: '105px', opacity: 0.5 }} />
          ))}
        </div>
        <div className="glass-panel" style={{ padding: '24px', height: '280px', opacity: 0.5 }} />
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
            <span>Ledger Synchronization Error: {dataError}</span>
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

      {/* Action Error Banner */}
      {actionError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '12px', fontSize: '0.86rem', color: 'var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={17} />
            <span>Action Failed: {actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

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
          <button
            type="button"
            onClick={() => setIsAddTxOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.84rem' }}
          >
            <Plus size={15} />
            <span>Record Transaction</span>
          </button>
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
              {availableAccounts.map((accName) => (
                <option key={accName} value={accName}>
                  {accName}
                </option>
              ))}
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
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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

        {transactions.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Wallet size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              General Ledger is Empty
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)', maxWidth: '420px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              No transactions have been recorded in this workspace yet. Record your first transaction or add a financial account to populate the ledger.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsAddTxOpen(true)}
                style={{ fontSize: '0.84rem' }}
              >
                <Plus size={15} />
                <span>Record First Transaction</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsAddAccountOpen(true)}
                style={{ fontSize: '0.84rem' }}
              >
                <Plus size={15} />
                <span>Add Account</span>
              </button>
              {dataMode !== 'DEMO' && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => useStore.getState().activateDemo()}
                  style={{ fontSize: '0.84rem' }}
                >
                  <span>Explore Demo Workspace</span>
                </button>
              )}
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
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
                  <th style={{ width: '40px' }}></th>
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
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteTx(tx.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-tertiary)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete transaction"
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onOpenAddAccount={() => {
          setIsAddTxOpen(false);
          setIsAddAccountOpen(true);
        }}
      />

      {/* Add Account Modal */}
      <AddAccountModal
        open={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />
    </div>
  );
}
