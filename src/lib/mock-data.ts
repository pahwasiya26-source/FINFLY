export interface FinancialOverview {
  // Core financial fields
  netPosition: number;
  cash: number;
  investments: number;
  assets: number;
  liabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  savingsRate: number; // percentage
  healthScore: number; // 0-100

  // Business-specific metrics (optional for personal, populated for business)
  revenue?: number;
  profit?: number;
  cashFlow?: number;
  receivables?: number;
  payables?: number;
  burnRate?: number;
  runwayMonths?: number;
  growthRateYoY?: number;
}

export const personalData: FinancialOverview = {
  netPosition: 3500000,
  cash: 450000,
  investments: 1250000,
  assets: 2800000,
  liabilities: 1000000, // e.g. Car loan
  monthlyIncome: 180000,
  monthlyExpenses: 95000,
  monthlySurplus: 85000,
  savingsRate: 47.2,
  healthScore: 88,
  growthRateYoY: 12.4,
  runwayMonths: 4.7,
};

export const businessData: FinancialOverview = {
  netPosition: 12500000,
  cash: 3200000,
  investments: 5000000,
  assets: 8500000,
  liabilities: 4200000, // e.g. Equipment financing
  monthlyIncome: 1200000, // Monthly Revenue
  monthlyExpenses: 850000, // Operating Expenses
  monthlySurplus: 350000, // Net Operating Profit
  savingsRate: 29.1,
  healthScore: 76,
  revenue: 1200000,
  profit: 350000,
  cashFlow: 290000,
  receivables: 1850000,
  payables: 720000,
  burnRate: 850000,
  runwayMonths: 9.2,
  growthRateYoY: 24.8,
};
