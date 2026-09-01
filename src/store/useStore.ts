import { create } from 'zustand';
import { personalData, businessData, FinancialOverview } from '../lib/mock-data';

interface AppState {
  mode: 'PERSONAL' | 'BUSINESS';
  toggleMode: () => void;
  getCurrentData: () => FinancialOverview;
}

export const useStore = create<AppState>((set, get) => ({
  mode: 'PERSONAL',
  toggleMode: () => set((state) => ({ mode: state.mode === 'PERSONAL' ? 'BUSINESS' : 'PERSONAL' })),
  getCurrentData: () => {
    return get().mode === 'PERSONAL' ? personalData : businessData;
  }
}));
