'use client';

import React, { useState } from 'react';
import { X, Landmark, DollarSign, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../lib/auth/AuthContext';
import { CreateAccountPayload, DbAccount } from '../lib/supabase/queries';

interface AddAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (account: DbAccount) => void;
  defaultAccountType?: CreateAccountPayload['account_type'];
  defaultEntity?: 'PERSONAL' | 'BUSINESS';
}

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash / Checking / Savings', icon: '💵' },
  { value: 'investment', label: 'Investment / Brokerage', icon: '📈' },
  { value: 'asset', label: 'Fixed Asset / Property', icon: '🏠' },
  { value: 'liability', label: 'Liability / Loan / Credit', icon: '📋' },
] as const;

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD'];

export function AddAccountModal({
  open,
  onClose,
  onSuccess,
  defaultAccountType = 'cash',
  defaultEntity = 'PERSONAL',
}: AddAccountModalProps) {
  const { user } = useAuth();
  const addAccount = useStore((state) => state.addAccount);
  const dataMode = useStore((state) => state.dataMode);

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [accountType, setAccountType] = useState<CreateAccountPayload['account_type']>(defaultAccountType);
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [ticker, setTicker] = useState('');
  const [assetClass, setAssetClass] = useState('Equities');
  const [entity, setEntity] = useState<'PERSONAL' | 'BUSINESS'>(defaultEntity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      if (defaultAccountType) setAccountType(defaultAccountType);
      if (defaultEntity) setEntity(defaultEntity);
    }
  }, [open, defaultAccountType, defaultEntity]);

  const handleClose = () => {
    setName('');
    setInstitution('');
    setAccountType(defaultAccountType || 'cash');
    setBalance('');
    setCurrency('INR');
    setTicker('');
    setAssetClass('Equities');
    setEntity(defaultEntity || 'PERSONAL');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Account name is required.');
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance) || numBalance < 0) {
      setError('Please enter a valid balance (0 or greater).');
      return;
    }

    if (dataMode === 'DEMO') {
      setError('Real accounts cannot be created while DEMO mode is active. Please exit demo mode first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const metadata: Record<string, any> = {};
    if (accountType === 'investment') {
      if (ticker.trim()) metadata.ticker = ticker.trim().toUpperCase();
      if (assetClass) metadata.assetClass = assetClass;
      metadata.investedAmount = numBalance;
    }

    const payload: CreateAccountPayload = {
      name: name.trim(),
      institution: institution.trim() || undefined,
      account_type: accountType,
      balance: numBalance,
      currency,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    const res = await addAccount(payload, user?.id);

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to create account.');
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
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '20px',
          padding: '32px 28px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--accent-primary-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Landmark size={17} color="var(--accent-primary)" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Add Financial Account</h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              Saved securely to your personal workspace ledger.
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

        {/* Success Feedback */}
        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0', textAlign: 'center' }}>
            <CheckCircle2 size={40} color="var(--accent-primary)" />
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Account Created Successfully</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Ledger balance updated.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Account Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Account Classification
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {ACCOUNT_TYPES.map((at) => (
                  <button
                    key={at.value}
                    type="button"
                    onClick={() => setAccountType(at.value)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: accountType === at.value ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: accountType === at.value ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      fontWeight: accountType === at.value ? 700 : 500,
                      color: accountType === at.value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{at.icon}</span>
                    <span>{at.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label htmlFor="acc-name" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Account Name
              </label>
              <input
                id="acc-name"
                type="text"
                required
                className="input-premium"
                placeholder={accountType === 'cash' ? 'e.g. HDFC Wealth Checking' : accountType === 'investment' ? 'e.g. Zerodha Broking Portfolio' : 'e.g. Primary Residence or Vehicle Loan'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />
            </div>

            {/* Institution */}
            <div>
              <label htmlFor="acc-institution" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Financial Institution <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(Optional)</span>
              </label>
              <input
                id="acc-institution"
                type="text"
                className="input-premium"
                placeholder="e.g. HDFC Bank, ICICI, Zerodha, SBI"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                maxLength={80}
              />
            </div>

            {/* Investment Specific Fields */}
            {accountType === 'investment' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label htmlFor="acc-ticker" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Ticker / Symbol <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(Optional)</span>
                  </label>
                  <input
                    id="acc-ticker"
                    type="text"
                    className="input-premium"
                    placeholder="e.g. NIFTYBEES, AAPL, SENSEX"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    maxLength={15}
                  />
                </div>
                <div>
                  <label htmlFor="acc-asset-class" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Asset Class
                  </label>
                  <select
                    id="acc-asset-class"
                    className="input-premium"
                    value={assetClass}
                    onChange={(e) => setAssetClass(e.target.value)}
                  >
                    <option value="Equities">Equities / Index</option>
                    <option value="Mutual Funds">Mutual Funds</option>
                    <option value="Fixed Income">Fixed Income / Bonds</option>
                    <option value="Commodities">Commodities / Gold</option>
                    <option value="Crypto">Digital Assets / Crypto</option>
                  </select>
                </div>
              </div>
            )}

            {/* Balance & Currency */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: '10px' }}>
              <div>
                <label htmlFor="acc-balance" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {accountType === 'liability' ? 'Outstanding Debt' : 'Initial Balance'}
                </label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="acc-balance"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input-premium"
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="acc-currency" style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Currency
                </label>
                <select
                  id="acc-currency"
                  className="input-premium"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
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
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <span>Add Account</span>
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
