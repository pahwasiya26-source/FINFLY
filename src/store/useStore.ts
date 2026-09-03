import { create } from 'zustand';
import {
  personalData,
  businessData,
  FinancialOverview,
  TransactionRecord,
  sampleTransactions,
  InvestmentAsset,
  sampleInvestments,
  BusinessInvoice,
  sampleBusinessInvoices,
  UpcomingObligation,
  sampleUpcomingObligations,
} from '../lib/mock-data';
import {
  DbAccount,
  DbTransaction,
  CreateAccountPayload,
  CreateTransactionPayload,
  fetchUserAccounts,
  fetchUserTransactions,
  createAccount,
  updateAccount as updateAccountQuery,
  deleteAccount,
  createTransaction,
  updateTransaction as updateTransactionQuery,
  deleteTransaction,
} from '../lib/supabase/queries';

// ────────────────────────────────────────────────────────────────────────────
// Data Mode Definition:
// 1. REAL  — Authenticated user's actual Supabase data (records exist)
// 2. DEMO  — Explicitly requested synthetic/sample buildathon dataset
// 3. EMPTY — Authenticated or fresh user with zero financial records
// ────────────────────────────────────────────────────────────────────────────
export type DataMode = 'REAL' | 'DEMO' | 'EMPTY';

export const EMPTY_FINANCIAL_OVERVIEW: FinancialOverview = {
  netPosition: 0,
  cash: 0,
  investments: 0,
  assets: 0,
  liabilities: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  monthlySurplus: 0,
  savingsRate: 0,
  healthScore: 0,
};

/**
 * Helper to map a Supabase DB transaction to the consumer TransactionRecord shape.
 */
export function mapDbTransactionToRecord(t: DbTransaction): TransactionRecord {
  const isInflow = t.transaction_type === 'income' || t.transaction_type === 'settlement';
  return {
    id: t.id,
    date: t.transaction_date,
    description: t.description || 'Transaction',
    category: (t.category as any) || 'Utilities',
    account: (t.account?.name as any) || 'Primary Account',
    amount: Number(t.amount),
    type: isInflow ? 'INFLOW' : 'OUTFLOW',
    entity: t.organization_id ? 'BUSINESS' : 'PERSONAL',
    status: 'SETTLED',
  };
}

/**
 * Helper to map financial_accounts with account_type='investment' to InvestmentAsset shape.
 */
export function mapAccountsToInvestments(accounts: DbAccount[]): InvestmentAsset[] {
  const invAccounts = accounts.filter((a) => a.account_type === 'investment');
  const totalVal = invAccounts.reduce((s, a) => s + Number(a.balance), 0);

  return invAccounts.map((a) => {
    const balance = Number(a.balance);
    const meta = (a.metadata as any) || {};
    const hasExplicitCostBasis =
      meta.investedAmount !== undefined &&
      meta.investedAmount !== null &&
      Number(meta.investedAmount) > 0;
    const invested = hasExplicitCostBasis ? Number(meta.investedAmount) : 0;
    const gain = hasExplicitCostBasis ? balance - invested : 0;
    const returnPct = hasExplicitCostBasis && invested > 0 ? Number(((gain / invested) * 100).toFixed(1)) : 0;
    const allocationPct = totalVal > 0 ? Number(((balance / totalVal) * 100).toFixed(1)) : 0;
    return {
      id: a.id,
      name: a.name,
      ticker: meta.ticker || a.name.slice(0, 6).toUpperCase(),
      assetClass: meta.assetClass || 'Equities',
      investedAmount: invested,
      currentValue: balance,
      unrealizedGain: gain,
      returnPct: returnPct,
      allocationPct: allocationPct,
      riskRating: meta.riskRating || 'Moderate',
      targetAllocationPct: meta.targetAllocationPct || 0,
      entity: a.organization_id ? 'BUSINESS' : 'PERSONAL',
      costBasisAvailable: hasExplicitCostBasis,
    };
  });
}

/**
 * Compute real FinancialOverview dynamically from accounts and transactions.
 */
export function computeRealOverview(
  accounts: DbAccount[],
  transactions: TransactionRecord[] | DbTransaction[],
  mode: 'PERSONAL' | 'BUSINESS'
): FinancialOverview {
  const relevantAccounts = accounts.filter((a) =>
    mode === 'BUSINESS' ? a.organization_id !== null : a.organization_id === null
  );

  if (relevantAccounts.length === 0 && transactions.length === 0) {
    return { ...EMPTY_FINANCIAL_OVERVIEW };
  }

  const cash = relevantAccounts
    .filter((a) => a.account_type === 'cash')
    .reduce((s, a) => s + Number(a.balance), 0);
  const investments = relevantAccounts
    .filter((a) => a.account_type === 'investment')
    .reduce((s, a) => s + Number(a.balance), 0);
  const assets = relevantAccounts
    .filter((a) => a.account_type === 'asset')
    .reduce((s, a) => s + Number(a.balance), 0);
  const liabilities = relevantAccounts
    .filter((a) => a.account_type === 'liability')
    .reduce((s, a) => s + Number(a.balance), 0);
  const netPosition = cash + investments + assets - liabilities;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const relevantTx = transactions.filter((t) => {
    const isBusiness = 'entity' in t ? t.entity === 'BUSINESS' : Boolean(t.organization_id);
    const matchesMode = mode === 'BUSINESS' ? isBusiness : !isBusiness;
    const date = 'date' in t ? t.date : t.transaction_date;
    return matchesMode && date >= monthStart;
  });

  const monthlyIncome = relevantTx
    .filter((t) => {
      if ('type' in t) return t.type === 'INFLOW';
      return t.transaction_type === 'income' || t.transaction_type === 'settlement';
    })
    .reduce((s, t) => s + Number(t.amount), 0);

  const monthlyExpenses = relevantTx
    .filter((t) => {
      if ('type' in t) return t.type === 'OUTFLOW';
      return t.transaction_type === 'expense';
    })
    .reduce((s, t) => s + Number(t.amount), 0);

  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const savingsRate =
    monthlyIncome > 0
      ? Number(((monthlySurplus / monthlyIncome) * 100).toFixed(1))
      : 0;

  let healthScore = 0;
  if (netPosition > 0) healthScore += 35;
  if (monthlySurplus >= 0) healthScore += 30;
  if (savingsRate >= 20) healthScore += 20;
  else if (savingsRate > 0) healthScore += 10;
  if (relevantAccounts.length > 0) healthScore += 15;

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
    revenue: mode === 'BUSINESS' ? monthlyIncome : undefined,
    profit: mode === 'BUSINESS' ? monthlySurplus : undefined,
    burnRate: mode === 'BUSINESS' ? monthlyExpenses : undefined,
  };
}

export interface AppState {
  // ── Mode & Synchronization State ──────────────────────────────────────────
  mode: 'PERSONAL' | 'BUSINESS';
  dataMode: DataMode;
  isHydrating: boolean;
  lastSyncedAt: string | null;
  dataError: string | null;

  // ── Financial Data Collections ────────────────────────────────────────────
  accounts: DbAccount[];
  transactions: TransactionRecord[];
  rawDbTransactions: DbTransaction[];
  investments: InvestmentAsset[];
  invoices: BusinessInvoice[];
  obligations: UpcomingObligation[];

  // ── Actions & Mode Toggles ────────────────────────────────────────────────
  setMode: (mode: 'PERSONAL' | 'BUSINESS') => void;
  toggleMode: () => void;
  setDataMode: (dataMode: DataMode) => void;

  // ── Demo & Hydration Controls ─────────────────────────────────────────────
  activateDemo: () => void;
  exitDemo: () => void;
  hydrateRealData: (accounts: DbAccount[], transactions: DbTransaction[]) => void;
  fetchAndHydrate: (userId: string) => Promise<void>;

  // ── Financial Overview Computed Accessor ──────────────────────────────────
  getCurrentData: () => FinancialOverview;

  // ── Real Account CRUD Actions (Persists to Supabase first) ─────────────────
  addAccount: (
    payload: CreateAccountPayload | DbAccount,
    userId?: string
  ) => Promise<{ success: boolean; error?: string; data?: DbAccount }>;

  updateAccount: (
    accountId: string,
    payload: Partial<CreateAccountPayload>,
    userId?: string
  ) => Promise<{ success: boolean; error?: string; data?: DbAccount }>;

  removeAccount: (
    accountId: string,
    userId?: string
  ) => Promise<{ success: boolean; error?: string }>;

  // ── Real Transaction CRUD Actions (Persists to Supabase first) ─────────────
  addTransaction: (
    payload: CreateTransactionPayload | TransactionRecord | DbTransaction,
    userId?: string
  ) => Promise<{ success: boolean; error?: string; data?: any }>;

  updateTransaction: (
    transactionId: string,
    payload: Partial<CreateTransactionPayload>,
    userId?: string
  ) => Promise<{ success: boolean; error?: string; data?: DbTransaction }>;

  removeTransaction: (
    transactionId: string,
    userId?: string
  ) => Promise<{ success: boolean; error?: string }>;

  // ── Reconciliation UI State ───────────────────────────────────────────────
  approvedReconciliations: Set<string>;
  approveReconciliation: (id: string) => void;
  rejectedReconciliations: Set<string>;
  rejectReconciliation: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // ── Initial State (Clean Defaults: No Mock Data Auto-Loaded) ──────────────
  mode: 'PERSONAL',
  dataMode: 'EMPTY', // Defaults to EMPTY; never auto-populates demo
  isHydrating: false,
  lastSyncedAt: null,
  dataError: null,

  accounts: [],
  transactions: [],
  rawDbTransactions: [],
  investments: [],
  invoices: [],
  obligations: [],

  // ── Mode Actions ──────────────────────────────────────────────────────────
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({
      mode: state.mode === 'PERSONAL' ? 'BUSINESS' : 'PERSONAL',
    })),
  setDataMode: (dataMode) => set({ dataMode }),

  // ── Explicit Demo Mode Activation ─────────────────────────────────────────
  activateDemo: () =>
    set({
      dataMode: 'DEMO',
      isHydrating: false,
      dataError: null,
      lastSyncedAt: new Date().toISOString(),
      transactions: sampleTransactions,
      investments: sampleInvestments,
      invoices: sampleBusinessInvoices,
      obligations: sampleUpcomingObligations,
    }),

  // ── Exit Demo Mode & Reset to Real/Empty ──────────────────────────────────
  exitDemo: () =>
    set((state) => {
      const hasReal = state.accounts.length > 0 || state.rawDbTransactions.length > 0;
      return {
        dataMode: hasReal ? 'REAL' : 'EMPTY',
        isHydrating: false,
        dataError: null,
        transactions: state.rawDbTransactions.map(mapDbTransactionToRecord),
        investments: mapAccountsToInvestments(state.accounts),
        invoices: [], // No DB invoices table in schema
        obligations: [], // No DB obligations table in schema
      };
    }),

  // ── Hydrate from Real Supabase Queries ────────────────────────────────────
  hydrateRealData: (accounts, dbTransactions) =>
    set(() => {
      const hasRecords = accounts.length > 0 || dbTransactions.length > 0;
      return {
        dataMode: hasRecords ? 'REAL' : 'EMPTY',
        isHydrating: false,
        lastSyncedAt: new Date().toISOString(),
        dataError: null,
        accounts,
        rawDbTransactions: dbTransactions,
        transactions: dbTransactions.map(mapDbTransactionToRecord),
        investments: mapAccountsToInvestments(accounts),
        invoices: [], // Unsupported in DB schema — cleanly represented as empty
        obligations: [], // Unsupported in DB schema — cleanly represented as empty
      };
    }),

  fetchAndHydrate: async (userId: string) => {
    set({ isHydrating: true, dataError: null });
    try {
      const [acctRes, txRes] = await Promise.all([
        fetchUserAccounts(userId),
        fetchUserTransactions(userId),
      ]);

      if (acctRes.error || txRes.error) {
        set({
          isHydrating: false,
          dataError: acctRes.error || txRes.error || 'Failed to fetch financial data',
        });
        return;
      }

      const accounts = acctRes.data ?? [];
      const dbTx = txRes.data ?? [];
      get().hydrateRealData(accounts, dbTx);
    } catch (err: any) {
      set({
        isHydrating: false,
        dataError: err?.message || 'Unexpected synchronization error',
      });
    }
  },

  // ── Dynamic Financial Overview Selector ───────────────────────────────────
  getCurrentData: () => {
    const { dataMode, mode, accounts, transactions } = get();
    if (dataMode === 'DEMO') {
      return mode === 'PERSONAL' ? personalData : businessData;
    }
    if (dataMode === 'EMPTY' || (accounts.length === 0 && transactions.length === 0)) {
      return { ...EMPTY_FINANCIAL_OVERVIEW };
    }
    return computeRealOverview(accounts, transactions, mode);
  },

  // ── Account CRUD Actions ──────────────────────────────────────────────────
  addAccount: async (accountOrPayload, userId) => {
    const { dataMode } = get();
    if (dataMode === 'DEMO') {
      return {
        success: false,
        error: 'Cannot create real accounts while in DEMO mode. Please exit demo mode first.',
      };
    }

    // 1. If an actual userId is provided, persist to Supabase first
    if (userId) {
      const payload = accountOrPayload as CreateAccountPayload;
      const { data: newAccount, error } = await createAccount(userId, payload);
      if (error || !newAccount) {
        return { success: false, error: error || 'Failed to create account in database' };
      }

      set((state) => {
        const updatedAccounts = [newAccount, ...state.accounts];
        return {
          accounts: updatedAccounts,
          investments: mapAccountsToInvestments(updatedAccounts),
          dataMode: 'REAL',
          lastSyncedAt: new Date().toISOString(),
        };
      });
      return { success: true, data: newAccount };
    }

    // 2. Direct/local addition (e.g. for offline testing)
    const acc: DbAccount = 'id' in accountOrPayload
      ? (accountOrPayload as DbAccount)
      : {
          id: `acc_local_${Date.now()}`,
          user_id: null,
          organization_id: accountOrPayload.organization_id ?? null,
          name: accountOrPayload.name,
          account_type: accountOrPayload.account_type,
          currency: accountOrPayload.currency || 'INR',
          balance: accountOrPayload.balance,
          institution: accountOrPayload.institution ?? null,
          metadata: accountOrPayload.metadata ?? {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

    set((state) => {
      const updatedAccounts = [acc, ...state.accounts];
      return {
        accounts: updatedAccounts,
        investments: mapAccountsToInvestments(updatedAccounts),
        dataMode: 'REAL',
        lastSyncedAt: new Date().toISOString(),
      };
    });
    return { success: true, data: acc };
  },

  updateAccount: async (accountId, payload, userId) => {
    const { dataMode } = get();
    if (dataMode === 'DEMO') {
      return { success: false, error: 'Cannot update real accounts in DEMO mode.' };
    }

    if (userId) {
      const { data: updated, error } = await updateAccountQuery(accountId, payload);
      if (error || !updated) {
        return { success: false, error: error || 'Failed to update account in database' };
      }

      set((state) => {
        const updatedAccounts = state.accounts.map((a) => (a.id === accountId ? updated : a));
        return {
          accounts: updatedAccounts,
          investments: mapAccountsToInvestments(updatedAccounts),
          lastSyncedAt: new Date().toISOString(),
        };
      });
      return { success: true, data: updated };
    }

    // Local update
    set((state) => {
      const updatedAccounts = state.accounts.map((a) => {
        if (a.id !== accountId) return a;
        return {
          ...a,
          ...payload,
          balance: payload.balance !== undefined ? payload.balance : a.balance,
          updated_at: new Date().toISOString(),
        };
      });
      return {
        accounts: updatedAccounts,
        investments: mapAccountsToInvestments(updatedAccounts),
        lastSyncedAt: new Date().toISOString(),
      };
    });
    return { success: true };
  },

  removeAccount: async (accountId, userId) => {
    const { dataMode } = get();
    if (dataMode === 'DEMO') {
      return { success: false, error: 'Cannot remove accounts in DEMO mode.' };
    }

    if (userId) {
      const { error } = await deleteAccount(accountId);
      if (error) {
        return { success: false, error };
      }
    }

    set((state) => {
      const remainingAccounts = state.accounts.filter((a) => a.id !== accountId);
      const remainingDbTx = state.rawDbTransactions.filter((t) => t.account_id !== accountId);
      const remainingTx = state.transactions.filter((t) => (t as any).account_id !== accountId);
      const hasRecords = remainingAccounts.length > 0 || remainingDbTx.length > 0;

      return {
        accounts: remainingAccounts,
        rawDbTransactions: remainingDbTx,
        transactions: remainingTx,
        investments: mapAccountsToInvestments(remainingAccounts),
        dataMode: hasRecords ? 'REAL' : 'EMPTY',
        lastSyncedAt: new Date().toISOString(),
      };
    });
    return { success: true };
  },

  // ── Transaction CRUD Actions ──────────────────────────────────────────────
  addTransaction: async (txOrPayload, userId) => {
    const { dataMode } = get();
    if (dataMode === 'DEMO') {
      return {
        success: false,
        error: 'Cannot create real transactions while in DEMO mode. Please exit demo mode first.',
      };
    }

    // 1. If an actual userId is provided, persist to Supabase first
    if (userId) {
      const payload = txOrPayload as CreateTransactionPayload;
      const { data: newTx, error } = await createTransaction(userId, payload);
      if (error || !newTx) {
        return { success: false, error: error || 'Failed to create transaction in database' };
      }

      set((state) => {
        const updatedRaw = [newTx, ...state.rawDbTransactions];
        const mappedRecord = mapDbTransactionToRecord(newTx);
        return {
          rawDbTransactions: updatedRaw,
          transactions: [mappedRecord, ...state.transactions],
          dataMode: 'REAL',
          lastSyncedAt: new Date().toISOString(),
        };
      });
      return { success: true, data: newTx };
    }

    // 2. Direct/local addition
    if ('amount' in txOrPayload && 'transaction_type' in txOrPayload) {
      const rawTx = txOrPayload as DbTransaction;
      const mapped = mapDbTransactionToRecord(rawTx);
      set((state) => ({
        rawDbTransactions: [rawTx, ...state.rawDbTransactions],
        transactions: [mapped, ...state.transactions],
        dataMode: 'REAL',
        lastSyncedAt: new Date().toISOString(),
      }));
      return { success: true, data: rawTx };
    }

    if ('amount' in txOrPayload && 'type' in txOrPayload) {
      const record = txOrPayload as TransactionRecord;
      set((state) => ({
        transactions: [record, ...state.transactions],
        dataMode: 'REAL',
        lastSyncedAt: new Date().toISOString(),
      }));
      return { success: true, data: record };
    }

    const payload = txOrPayload as CreateTransactionPayload;
    const localTx: DbTransaction = {
      id: `tx_local_${Date.now()}`,
      account_id: payload.account_id,
      user_id: null,
      organization_id: payload.organization_id ?? null,
      amount: payload.amount,
      transaction_type: payload.transaction_type,
      category: payload.category,
      description: payload.description ?? null,
      transaction_date: payload.transaction_date || new Date().toISOString().split('T')[0],
      metadata: {},
      created_at: new Date().toISOString(),
    };
    const mapped = mapDbTransactionToRecord(localTx);

    set((state) => ({
      rawDbTransactions: [localTx, ...state.rawDbTransactions],
      transactions: [mapped, ...state.transactions],
      dataMode: 'REAL',
      lastSyncedAt: new Date().toISOString(),
    }));
    return { success: true, data: localTx };
  },

  updateTransaction: async (transactionId, payload, userId) => {
    const { dataMode } = get();
    if (dataMode === 'DEMO') {
      return { success: false, error: 'Cannot update real transactions in DEMO mode.' };
    }

    if (userId) {
      const { data: updated, error } = await updateTransactionQuery(transactionId, payload);
      if (error || !updated) {
        return { success: false, error: error || 'Failed to update transaction in database' };
      }

      set((state) => {
        const updatedRaw = state.rawDbTransactions.map((t) => (t.id === transactionId ? updated : t));
        return {
          rawDbTransactions: updatedRaw,
          transactions: updatedRaw.map(mapDbTransactionToRecord),
          lastSyncedAt: new Date().toISOString(),
        };
      });
      return { success: true, data: updated };
    }

    // Local update
    set((state) => {
      const updatedRaw = state.rawDbTransactions.map((t) => {
        if (t.id !== transactionId) return t;
        return {
          ...t,
          ...payload,
        };
      });
      return {
        rawDbTransactions: updatedRaw,
        transactions: updatedRaw.map(mapDbTransactionToRecord),
        lastSyncedAt: new Date().toISOString(),
      };
    });
    return { success: true };
  },

  removeTransaction: async (transactionId, userId) => {
    const { dataMode } = get();
    if (dataMode === 'DEMO') {
      return { success: false, error: 'Cannot delete transactions in DEMO mode.' };
    }

    if (userId) {
      const { error } = await deleteTransaction(transactionId);
      if (error) {
        return { success: false, error };
      }
    }

    set((state) => {
      const remainingRaw = state.rawDbTransactions.filter((t) => t.id !== transactionId);
      const remainingTx = state.transactions.filter((t) => t.id !== transactionId);
      const hasRecords = state.accounts.length > 0 || remainingRaw.length > 0;

      return {
        rawDbTransactions: remainingRaw,
        transactions: remainingTx,
        dataMode: hasRecords ? 'REAL' : 'EMPTY',
        lastSyncedAt: new Date().toISOString(),
      };
    });
    return { success: true };
  },

  // ── Reconciliation Actions ────────────────────────────────────────────────
  approvedReconciliations: new Set<string>(),
  approveReconciliation: (id) =>
    set((state) => {
      const next = new Set(state.approvedReconciliations);
      next.add(id);
      const rej = new Set(state.rejectedReconciliations);
      rej.delete(id);
      return { approvedReconciliations: next, rejectedReconciliations: rej };
    }),
  rejectedReconciliations: new Set<string>(),
  rejectReconciliation: (id) =>
    set((state) => {
      const next = new Set(state.rejectedReconciliations);
      next.add(id);
      const app = new Set(state.approvedReconciliations);
      app.delete(id);
      return { rejectedReconciliations: next, approvedReconciliations: app };
    }),
}));
