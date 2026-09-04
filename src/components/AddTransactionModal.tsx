'use client';

import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../lib/auth/AuthContext';
import { CreateTransactionPayload, DbTransaction } from '../lib/supabase/queries';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (tx: DbTransaction) => void;
  onOpenAddAccount?: () => void;
}

const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income / Inflow', icon: <ArrowUpRight size={15} /> },
  { value: 'expense', label: 'Expense / Outflow', icon: <ArrowDownRight size={15} /> },
  { value: 'transfer', label: 'Transfer', icon: null },
  { value: 'settlement', label: 'Settlement', icon: null },
  { value: 'refund', label: 'Refund', icon: null },
] as const;

const STANDARD_CATEGORIES = [
  'Salary',
  'Client Revenue',
  'Consulting',
  'Housing',
  'Travel',
  'Dining & Groceries',
  'Software & Cloud',
  'Payroll & HR',
  'Marketing',
  'Tax & Compliance',
  'Investments',
  'Utilities',
  'Healthcare',
  'Other',
];

export function AddTransactionModal({
  open,
  onClose,
  onSuccess,
  onOpenAddAccount,
}: AddTransactionModalProps) {
  const { user } = useAuth();
  const accounts = useStore((state) => state.accounts);
  const addTransaction = useStore((state) => state.addTransaction);
  const dataMode = useStore((state) => state.dataMode);

  const today = new Date().toISOString().split('T')[0];
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [txType, setTxType] = useState<CreateTransactionPayload['transaction_type']>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(STANDARD_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [txDate, setTxDate] = useState(today);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select first account if not selected
  React.useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleClose = () => {
    setDescription('');
    setAmount('');
    setTxType('income');
    setCategory(STANDARD_CATEGORIES[0]);
    setTxDate(today);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountId) {
      setError('Please select an account.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    if (dataMode === 'DEMO') {
      setError('Real transactions cannot be created while DEMO mode is active. Please exit demo mode first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateTransactionPayload = {
      account_id: accountId,
      amount: numAmount,
      transaction_type: txType,
      category,
      description: description.trim(),
      transaction_date: txDate,
    };

    const res = await addTransaction(payload, user?.id);

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to record transaction.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      handleClose();
      if (onSuccess && res.data) {
        onSuccess(res.data);
      }
    }, 900);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Record Financial Transaction"
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '20px',
          padding: '32px 28px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Record Financial Transaction
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              Creates an immutable ledger record in your real database.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Empty Accounts State */}
        {accounts.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '24px 0', textAlign: 'center' }}>
            <AlertTriangle size={36} color="var(--warning)" />
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>No Financial Accounts Available</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '360px', lineHeight: 1.5 }}>
              Transactions must belong to a financial account. Please create an account before recording transactions.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '8px' }}
              onClick={() => {
                onClose();
                if (onOpenAddAccount) onOpenAddAccount();
              }}
            >
              Add First Account
            </button>
          </div>
        ) : success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0', textAlign: 'center' }}>
            <CheckCircle2 size={40} color="var(--accent-primary)" />
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Transaction Recorded</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Ledger and overview updated.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Transaction Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Flow Type
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {TRANSACTION_TYPES.map((tt) => (
                  <button
                    key={tt.value}
                    type="button"
                    onClick={() => setTxType(tt.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: txType === tt.value ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: txType === tt.value ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-subtle)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: txType === tt.value ? 700 : 500,
                      color: txType === tt.value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Selector */}
            <div>
              <label htmlFor="tx-account" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Account
              </label>
              <select
                id="tx-account"
                className="input-premium"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                style={{ cursor: 'pointer' }}
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.account_type.toUpperCase()} • ₹{Number(acc.balance).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label htmlFor="tx-amount" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Amount (₹)
                </label>
                <input
                  id="tx-amount"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  className="input-premium"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="tx-date" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Date
                </label>
                <input
                  id="tx-date"
                  type="date"
                  required
                  className="input-premium"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="tx-category" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Category
              </label>
              <select
                id="tx-category"
                className="input-premium"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {STANDARD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="tx-desc" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Description
              </label>
              <input
                id="tx-desc"
                type="text"
                required
                className="input-premium"
                placeholder="e.g. Monthly salary, AWS Server invoice, Client retainer"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--danger)' }}>
                <AlertTriangle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '0.92rem', fontWeight: 700, marginTop: '4px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Recording Transaction...</span>
                </>
              ) : (
                <span>Record Transaction</span>
              )}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
