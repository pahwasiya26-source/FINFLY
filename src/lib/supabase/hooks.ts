'use client';

/**
 * FINEXFLY React Data Hooks
 * Wraps Supabase queries with loading/error/data lifecycle.
 * All hooks respect the auth state from AuthContext.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  fetchUserAccounts,
  fetchUserTransactions,
  fetchUserOrganization,
  fetchUserReconciliationRecords,
  fetchUserDecisionTraces,
  DbAccount,
  DbTransaction,
  DbOrgMembership,
  DbReconciliationRecord,
  DbDecisionTrace,
} from './queries';
import { FinancialOverview } from '../mock-data';

// ────────────────────────────────────────────────────────────────────────────
// Derived FinancialSummary from real Supabase data
// ────────────────────────────────────────────────────────────────────────────

export interface FinancialSummary extends FinancialOverview {
  accounts: DbAccount[];
  transactions: DbTransaction[];
  hasRealData: boolean;
}

/**
 * Compute FinancialOverview from live DB accounts + transactions.
 * Uses the same field names as the mock FinancialOverview so all
 * existing deterministic engines (computeRunway, calculateTaxProjection,
 * detectAnomalies, simulateScenario) work unmodified.
 */
export function computeFinancialSummary(
  accounts: DbAccount[],
  transactions: DbTransaction[]
): FinancialSummary {
  // Balance Sheet
  const cash = accounts
    .filter((a) => a.account_type === 'cash')
    .reduce((s, a) => s + Number(a.balance), 0);
  const investments = accounts
    .filter((a) => a.account_type === 'investment')
    .reduce((s, a) => s + Number(a.balance), 0);
  const assets = accounts
    .filter((a) => a.account_type === 'asset')
    .reduce((s, a) => s + Number(a.balance), 0);
  const liabilities = accounts
    .filter((a) => a.account_type === 'liability')
    .reduce((s, a) => s + Number(a.balance), 0);
  const netPosition = cash + investments + assets - liabilities;

  // Current-month income / expense from transactions
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const currentMonthTx = transactions.filter((t) => t.transaction_date >= monthStart);

  const monthlyIncome = currentMonthTx
    .filter((t) => t.transaction_type === 'income' || t.transaction_type === 'settlement')
    .reduce((s, t) => s + Number(t.amount), 0);

  const monthlyExpenses = currentMonthTx
    .filter((t) => t.transaction_type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate =
    monthlyIncome > 0
      ? Number(((monthlySurplus / monthlyIncome) * 100).toFixed(1))
      : 0;

  // Simple health score (0-100)
  let healthScore = 0;
  if (netPosition > 0) healthScore += 35;
  if (monthlySurplus >= 0) healthScore += 30;
  if (savingsRate >= 20) healthScore += 20;
  else if (savingsRate > 0) healthScore += 10;
  if (accounts.length > 0) healthScore += 15;

  return {
    netPosition,
    cash,
    investments,
    assets,
    liabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    savingsRate,
    healthScore,
    accounts,
    transactions,
    hasRealData: accounts.length > 0,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 1. useUserAccounts — personal financial accounts from Supabase
// ────────────────────────────────────────────────────────────────────────────

export function useUserAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<DbAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setAccounts([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: qErr } = await fetchUserAccounts(user.id);
    if (qErr) setError(qErr);
    else setAccounts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { accounts, loading, error, refresh };
}

// ────────────────────────────────────────────────────────────────────────────
// 2. useUserTransactions — personal transactions from Supabase
// ────────────────────────────────────────────────────────────────────────────

export function useUserTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setTransactions([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: qErr } = await fetchUserTransactions(user.id);
    if (qErr) setError(qErr);
    else setTransactions(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { transactions, loading, error, refresh };
}

// ────────────────────────────────────────────────────────────────────────────
// 3. useUserReconciliationRecords — reconciliation audits from Supabase
// ────────────────────────────────────────────────────────────────────────────

export function useUserReconciliationRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<DbReconciliationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setRecords([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: qErr } = await fetchUserReconciliationRecords(user.id);
    if (qErr) setError(qErr);
    else setRecords(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, loading, error, refresh };
}

// ────────────────────────────────────────────────────────────────────────────
// 4. useUserDecisionTraces — AI controller audit log from Supabase
// ────────────────────────────────────────────────────────────────────────────

export function useUserDecisionTraces() {
  const { user } = useAuth();
  const [traces, setTraces] = useState<DbDecisionTrace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setTraces([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: qErr } = await fetchUserDecisionTraces(user.id);
    if (qErr) setError(qErr);
    else setTraces(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { traces, loading, error, refresh };
}

// ────────────────────────────────────────────────────────────────────────────
// 5. useFinancialSummary — combined accounts + transactions + computed metrics
// ────────────────────────────────────────────────────────────────────────────

export function useFinancialSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setSummary(null);
      return;
    }
    setLoading(true);
    setError(null);

    const [acctRes, txRes] = await Promise.all([
      fetchUserAccounts(user.id),
      fetchUserTransactions(user.id),
    ]);

    if (acctRes.error || txRes.error) {
      setError(acctRes.error || txRes.error || 'Unknown error');
      setLoading(false);
      return;
    }

    const accounts = acctRes.data ?? [];
    const transactions = txRes.data ?? [];
    setSummary(computeFinancialSummary(accounts, transactions));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, error, refresh };
}

// ────────────────────────────────────────────────────────────────────────────
// 6. useOrganization — business workspace membership
// ────────────────────────────────────────────────────────────────────────────

export function useOrganization() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<DbOrgMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setMembership(null);
      return;
    }
    fetchUserOrganization(user.id).then(({ data, error: qErr }) => {
      if (qErr) setError(qErr);
      else setMembership(data ?? null);
      setLoading(false);
    });
  }, [user]);

  return {
    organization: membership?.organization ?? null,
    role: membership?.role ?? null,
    loading,
    error,
  };
}
