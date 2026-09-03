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

export interface TransactionRecord {
  id: string;
  date: string;
  description: string;
  category: 'Salary' | 'Client Revenue' | 'Consulting' | 'Housing' | 'Travel' | 'Dining & Groceries' | 'Software & Cloud' | 'Payroll & HR' | 'Marketing' | 'Tax & Compliance' | 'Investments' | 'Utilities';
  account: 'HDFC Wealth Checking' | 'ICICI Savings' | 'Axis Treasury' | 'Razorpay Payouts' | 'Zerodha Broking';
  amount: number;
  type: 'INFLOW' | 'OUTFLOW';
  entity: 'PERSONAL' | 'BUSINESS';
  status: 'SETTLED' | 'PENDING' | 'FLAGGED';
}

export interface InvestmentAsset {
  id: string;
  name: string;
  ticker: string;
  assetClass: 'Equities' | 'Fixed Income' | 'Real Assets / Gold' | 'Liquid Cash / Overnight' | 'Alternatives';
  investedAmount: number;
  currentValue: number;
  unrealizedGain: number;
  returnPct: number;
  allocationPct: number;
  riskRating: 'Low' | 'Moderate' | 'High';
  targetAllocationPct: number;
  entity: 'PERSONAL' | 'BUSINESS';
  costBasisAvailable?: boolean;
}

export interface BusinessInvoice {
  id: string;
  counterparty: string;
  type: 'RECEIVABLE' | 'PAYABLE';
  amount: number;
  issueDate: string;
  dueDate: string;
  agingBucket: 'Current' | '1-30 Days' | '31-60 Days' | '60+ Days Overdue';
  status: 'PENDING' | 'PAID' | 'DISPUTED';
}

export interface UpcomingObligation {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: 'Advance Tax' | 'EMI / Debt Service' | 'Payroll' | 'Vendor Payables' | 'SIP Investment' | 'Insurance';
  status: 'PROVISIONED' | 'PENDING_APPROVAL' | 'SCHEDULED';
  entity: 'PERSONAL' | 'BUSINESS';
}

export const personalData: FinancialOverview = {
  netPosition: 3500000,
  cash: 450000,
  investments: 1250000,
  assets: 2800000,
  liabilities: 1000000, // Car loan / Secured mortgage
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
  liabilities: 4200000, // Equipment financing & venture debt
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

export const sampleTransactions: TransactionRecord[] = [
  // Personal Inflows & Outflows
  { id: 'txn_p_01', date: '2026-08-31', description: 'Tech Lead Monthly Remuneration', category: 'Salary', account: 'HDFC Wealth Checking', amount: 180000, type: 'INFLOW', entity: 'PERSONAL', status: 'SETTLED' },
  { id: 'txn_p_02', date: '2026-08-28', description: 'Apartment Residential Lease', category: 'Housing', account: 'HDFC Wealth Checking', amount: 38000, type: 'OUTFLOW', entity: 'PERSONAL', status: 'SETTLED' },
  { id: 'txn_p_03', date: '2026-08-25', description: 'International Conference Flight (Bengaluru-SFO)', category: 'Travel', account: 'ICICI Savings', amount: 28400, type: 'OUTFLOW', entity: 'PERSONAL', status: 'SETTLED' },
  { id: 'txn_p_04', date: '2026-08-22', description: 'Nifty 50 Index SIP Auto-Debit', category: 'Investments', account: 'Zerodha Broking', amount: 35000, type: 'OUTFLOW', entity: 'PERSONAL', status: 'SETTLED' },
  { id: 'txn_p_05', date: '2026-08-18', description: 'Whole Foods & Organic Groceries', category: 'Dining & Groceries', account: 'HDFC Wealth Checking', amount: 9200, type: 'OUTFLOW', entity: 'PERSONAL', status: 'SETTLED' },
  { id: 'txn_p_06', date: '2026-08-15', description: 'Vehicle Secured Loan EMI', category: 'Tax & Compliance', account: 'HDFC Wealth Checking', amount: 14500, type: 'OUTFLOW', entity: 'PERSONAL', status: 'SETTLED' },
  { id: 'txn_p_07', date: '2026-08-10', description: 'Advisory Retainer Fee Inflow', category: 'Consulting', account: 'ICICI Savings', amount: 45000, type: 'INFLOW', entity: 'PERSONAL', status: 'SETTLED' },
  { id: 'txn_p_08', date: '2026-08-05', description: 'High-Speed Fiber & Utilities', category: 'Utilities', account: 'HDFC Wealth Checking', amount: 4900, type: 'OUTFLOW', entity: 'PERSONAL', status: 'SETTLED' },

  // Business Inflows & Outflows
  { id: 'txn_b_01', date: '2026-08-30', description: 'Enterprise SaaS Annual License (Apex Global)', category: 'Client Revenue', account: 'Axis Treasury', amount: 750000, type: 'INFLOW', entity: 'BUSINESS', status: 'SETTLED' },
  { id: 'txn_b_02', date: '2026-08-28', description: 'Cloud Infrastructure & GPU Compute (AWS / Anthropic)', category: 'Software & Cloud', account: 'Axis Treasury', amount: 245000, type: 'OUTFLOW', entity: 'BUSINESS', status: 'SETTLED' },
  { id: 'txn_b_03', date: '2026-08-26', description: 'Monthly Core Engineering Payroll (14 Members)', category: 'Payroll & HR', account: 'Axis Treasury', amount: 420000, type: 'OUTFLOW', entity: 'BUSINESS', status: 'SETTLED' },
  { id: 'txn_b_04', date: '2026-08-24', description: 'Fintech Advisory Retainer (Stripe India Client)', category: 'Client Revenue', account: 'Razorpay Payouts', amount: 450000, type: 'INFLOW', entity: 'BUSINESS', status: 'SETTLED' },
  { id: 'txn_b_05', date: '2026-08-20', description: 'Razorpay Payment Gateway Settlement (INV-001)', category: 'Client Revenue', account: 'Axis Treasury', amount: 5000, type: 'INFLOW', entity: 'BUSINESS', status: 'SETTLED' },
  { id: 'txn_b_06', date: '2026-08-17', description: 'Legal Counsel & Statutory Audit Retainer', category: 'Tax & Compliance', account: 'Axis Treasury', amount: 65000, type: 'OUTFLOW', entity: 'BUSINESS', status: 'SETTLED' },
  { id: 'txn_b_07', date: '2026-08-12', description: 'Product Growth & Developer Marketing', category: 'Marketing', account: 'Axis Treasury', amount: 120000, type: 'OUTFLOW', entity: 'BUSINESS', status: 'SETTLED' },
  { id: 'txn_b_08', date: '2026-08-08', description: 'Overnight Treasury Sweep Interest', category: 'Client Revenue', account: 'Axis Treasury', amount: 18500, type: 'INFLOW', entity: 'BUSINESS', status: 'SETTLED' }
];

export const sampleInvestments: InvestmentAsset[] = [
  { id: 'inv_01', name: 'Nifty 50 Index Fund Direct', ticker: 'NIFTY50', assetClass: 'Equities', investedAmount: 450000, currentValue: 565000, unrealizedGain: 115000, returnPct: 25.5, allocationPct: 45.2, riskRating: 'Moderate', targetAllocationPct: 45, entity: 'PERSONAL' },
  { id: 'inv_02', name: 'Nasdaq 100 Tech ETF (Overseas)', ticker: 'QQQ-IN', assetClass: 'Equities', investedAmount: 250000, currentValue: 320000, unrealizedGain: 70000, returnPct: 28.0, allocationPct: 25.6, riskRating: 'High', targetAllocationPct: 25, entity: 'PERSONAL' },
  { id: 'inv_03', name: 'Sovereign Gold Bonds (RBI Tranche)', ticker: 'SGB-2028', assetClass: 'Real Assets / Gold', investedAmount: 180000, currentValue: 215000, unrealizedGain: 35000, returnPct: 19.4, allocationPct: 17.2, riskRating: 'Low', targetAllocationPct: 15, entity: 'PERSONAL' },
  { id: 'inv_04', name: 'AAA Corporate Bond Liquid Yield', ticker: 'CORP-DEBT', assetClass: 'Fixed Income', investedAmount: 120000, currentValue: 150000, unrealizedGain: 30000, returnPct: 25.0, allocationPct: 12.0, riskRating: 'Low', targetAllocationPct: 15, entity: 'PERSONAL' },

  // Business Treasury Portfolio
  { id: 'inv_biz_01', name: 'High-Yield Liquid Overnight Treasury Fund', ticker: 'TREASURY-LIQ', assetClass: 'Liquid Cash / Overnight', investedAmount: 2500000, currentValue: 2680000, unrealizedGain: 180000, returnPct: 7.2, allocationPct: 53.6, riskRating: 'Low', targetAllocationPct: 50, entity: 'BUSINESS' },
  { id: 'inv_biz_02', name: 'Short-Term Commercial Paper & T-Bills', ticker: 'TBILL-91D', assetClass: 'Fixed Income', investedAmount: 1500000, currentValue: 1590000, unrealizedGain: 90000, returnPct: 6.0, allocationPct: 31.8, riskRating: 'Low', targetAllocationPct: 35, entity: 'BUSINESS' },
  { id: 'inv_biz_03', name: 'Corporate Reserve Strategic Equity ETF', ticker: 'STRAT-EQUITY', assetClass: 'Equities', investedAmount: 600000, currentValue: 730000, unrealizedGain: 130000, returnPct: 21.6, allocationPct: 14.6, riskRating: 'Moderate', targetAllocationPct: 15, entity: 'BUSINESS' },
];

export const sampleBusinessInvoices: BusinessInvoice[] = [
  { id: 'INV-2026-801', counterparty: 'Apex Global Enterprises', type: 'RECEIVABLE', amount: 750000, issueDate: '2026-08-01', dueDate: '2026-08-31', agingBucket: 'Current', status: 'PAID' },
  { id: 'INV-2026-802', counterparty: 'Fintech Velocity Corp', type: 'RECEIVABLE', amount: 680000, issueDate: '2026-07-15', dueDate: '2026-08-15', agingBucket: '1-30 Days', status: 'PENDING' },
  { id: 'INV-2026-789', counterparty: 'Zephyr Analytics Inc', type: 'RECEIVABLE', amount: 420000, issueDate: '2026-06-10', dueDate: '2026-07-10', agingBucket: '60+ Days Overdue', status: 'DISPUTED' },
  { id: 'INV-2026-PAY1', counterparty: 'Amazon Web Services Cloud', type: 'PAYABLE', amount: 245000, issueDate: '2026-08-10', dueDate: '2026-09-05', agingBucket: 'Current', status: 'PENDING' },
  { id: 'INV-2026-PAY2', counterparty: 'Legal & Tax Auditors LLP', type: 'PAYABLE', amount: 110000, issueDate: '2026-08-01', dueDate: '2026-08-31', agingBucket: 'Current', status: 'PAID' },
  { id: 'INV-2026-PAY3', counterparty: 'Anthropic AI API Compute', type: 'PAYABLE', amount: 365000, issueDate: '2026-08-20', dueDate: '2026-09-10', agingBucket: 'Current', status: 'PENDING' },
];

export const sampleUpcomingObligations: UpcomingObligation[] = [
  { id: 'obl_01', title: 'Q2 Advance Tax Installment (45% Target)', amount: 145000, dueDate: '2026-09-15', category: 'Advance Tax', status: 'PROVISIONED', entity: 'PERSONAL' },
  { id: 'obl_02', title: 'Vehicle Secured Loan EMI', amount: 14500, dueDate: '2026-09-10', category: 'EMI / Debt Service', status: 'SCHEDULED', entity: 'PERSONAL' },
  { id: 'obl_03', title: 'Corporate Q2 Advance Tax Withholding', amount: 385000, dueDate: '2026-09-15', category: 'Advance Tax', status: 'PROVISIONED', entity: 'BUSINESS' },
  { id: 'obl_04', title: 'Engineering & Product Team Payroll', amount: 420000, dueDate: '2026-09-01', category: 'Payroll', status: 'PROVISIONED', entity: 'BUSINESS' },
  { id: 'obl_05', title: 'AWS Cloud Compute Enterprise Invoice', amount: 245000, dueDate: '2026-09-05', category: 'Vendor Payables', status: 'PENDING_APPROVAL', entity: 'BUSINESS' },
];
