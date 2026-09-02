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
  sampleUpcomingObligations
} from '../lib/mock-data';

interface AppState {
  mode: 'PERSONAL' | 'BUSINESS';
  setMode: (mode: 'PERSONAL' | 'BUSINESS') => void;
  toggleMode: () => void;
  getCurrentData: () => FinancialOverview;
  transactions: TransactionRecord[];
  addTransaction: (tx: TransactionRecord) => void;
  investments: InvestmentAsset[];
  invoices: BusinessInvoice[];
  obligations: UpcomingObligation[];
  approvedReconciliations: Set<string>;
  approveReconciliation: (id: string) => void;
  rejectedReconciliations: Set<string>;
  rejectReconciliation: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  mode: 'PERSONAL',
  setMode: (mode) => set({ mode }),
  toggleMode: () => set((state) => ({ mode: state.mode === 'PERSONAL' ? 'BUSINESS' : 'PERSONAL' })),
  getCurrentData: () => {
    return get().mode === 'PERSONAL' ? personalData : businessData;
  },
  transactions: sampleTransactions,
  addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
  investments: sampleInvestments,
  invoices: sampleBusinessInvoices,
  obligations: sampleUpcomingObligations,
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
