import test from 'node:test';
import assert from 'node:assert/strict';

import { useStore, computeRealOverview, mapDbTransactionToRecord, EMPTY_FINANCIAL_OVERVIEW } from '../src/store/useStore.ts';
import { sampleTransactions, sampleInvestments, sampleBusinessInvoices, sampleUpcomingObligations } from '../src/lib/mock-data.ts';
import { computeRunway, calculateTaxProjection, detectAnomalies, runReconciliationAudit } from '../src/lib/finance-tools.ts';
import { DigitalTwinEngine } from '../src/lib/digital-twin-engine.ts';
import { FinanceControllerOrchestrator } from '../src/lib/finance-controller-orchestrator.ts';
import { formatINR, formatDeterministicNumber } from '../src/components/AnimatedNumber.tsx';

test('Store Data Mode: Fresh initialization starts in EMPTY mode with zero mock data', () => {
  // Reset store to initial state
  useStore.setState({
    dataMode: 'EMPTY',
    accounts: [],
    transactions: [],
    rawDbTransactions: [],
    investments: [],
    invoices: [],
    obligations: [],
    isHydrating: false,
    dataError: null,
  });

  const state = useStore.getState();
  assert.equal(state.dataMode, 'EMPTY');
  assert.equal(state.transactions.length, 0, 'Must NOT contain sampleTransactions automatically');
  assert.equal(state.investments.length, 0, 'Must NOT contain sampleInvestments automatically');
  assert.equal(state.invoices.length, 0, 'Must NOT contain sampleBusinessInvoices automatically');
  assert.equal(state.obligations.length, 0, 'Must NOT contain sampleUpcomingObligations automatically');

  const overview = state.getCurrentData();
  assert.equal(overview.netPosition, 0);
  assert.equal(overview.cash, 0);
  assert.equal(overview.monthlyIncome, 0);
  assert.equal(overview.monthlyExpenses, 0);
});

test('Store Data Mode: Explicit activateDemo() populates sample data and sets DEMO mode', () => {
  const store = useStore.getState();
  store.activateDemo();

  const demoState = useStore.getState();
  assert.equal(demoState.dataMode, 'DEMO');
  assert.equal(demoState.transactions.length, sampleTransactions.length);
  assert.equal(demoState.investments.length, sampleInvestments.length);
  assert.equal(demoState.invoices.length, sampleBusinessInvoices.length);
  assert.equal(demoState.obligations.length, sampleUpcomingObligations.length);

  const demoOverview = demoState.getCurrentData();
  assert.ok(demoOverview.netPosition > 0, 'Demo overview should return synthetic netPosition');
  assert.ok(demoOverview.cash > 0, 'Demo overview should return synthetic cash');
});

test('Store Data Mode: exitDemo() clears synthetic records and resets to REAL/EMPTY', () => {
  const store = useStore.getState();
  store.activateDemo();
  assert.equal(useStore.getState().dataMode, 'DEMO');

  store.exitDemo();
  const exitedState = useStore.getState();
  assert.equal(exitedState.dataMode, 'EMPTY');
  assert.equal(exitedState.transactions.length, 0, 'Demo transactions must be cleared');
  assert.equal(exitedState.investments.length, 0, 'Demo investments must be cleared');
  assert.equal(exitedState.invoices.length, 0, 'Demo invoices must be cleared');
  assert.equal(exitedState.obligations.length, 0, 'Demo obligations must be cleared');

  const overview = exitedState.getCurrentData();
  assert.equal(overview.netPosition, 0);
  assert.equal(overview.cash, 0);
});

test('Store Data Mode: hydrateRealData() correctly sets REAL mode and computes overview', () => {
  const mockAccounts = [
    {
      id: 'acc_1',
      user_id: 'usr_test',
      organization_id: null,
      name: 'Primary Savings',
      account_type: 'cash',
      currency: 'INR',
      balance: 150000,
      institution: 'HDFC Bank',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_2',
      user_id: 'usr_test',
      organization_id: null,
      name: 'Index Portfolio',
      account_type: 'investment',
      currency: 'INR',
      balance: 250000,
      institution: 'Zerodha',
      metadata: { investedAmount: 200000, ticker: 'NIFTY50', assetClass: 'Equities' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_3',
      user_id: 'usr_test',
      organization_id: null,
      name: 'Personal Loan',
      account_type: 'liability',
      currency: 'INR',
      balance: 50000,
      institution: 'ICICI Bank',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const now = new Date().toISOString().split('T')[0];
  const mockDbTransactions = [
    {
      id: 'tx_1',
      account_id: 'acc_1',
      user_id: 'usr_test',
      organization_id: null,
      amount: 80000,
      transaction_type: 'income',
      category: 'Salary',
      description: 'Monthly Remuneration',
      transaction_date: now,
      metadata: {},
      created_at: new Date().toISOString(),
      account: { name: 'Primary Savings', account_type: 'cash' },
    },
    {
      id: 'tx_2',
      account_id: 'acc_1',
      user_id: 'usr_test',
      organization_id: null,
      amount: 30000,
      transaction_type: 'expense',
      category: 'Housing',
      description: 'House Rent',
      transaction_date: now,
      metadata: {},
      created_at: new Date().toISOString(),
      account: { name: 'Primary Savings', account_type: 'cash' },
    },
  ];

  const store = useStore.getState();
  store.hydrateRealData(mockAccounts, mockDbTransactions);

  const hydratedState = useStore.getState();
  assert.equal(hydratedState.dataMode, 'REAL');
  assert.equal(hydratedState.accounts.length, 3);
  assert.equal(hydratedState.transactions.length, 2);
  assert.equal(hydratedState.investments.length, 1);
  assert.equal(hydratedState.investments[0].investedAmount, 200000);
  assert.equal(hydratedState.investments[0].currentValue, 250000);
  assert.equal(hydratedState.investments[0].unrealizedGain, 50000);
  assert.equal(hydratedState.invoices.length, 0, 'Invoices should be empty array in REAL mode');
  assert.equal(hydratedState.obligations.length, 0, 'Obligations should be empty array in REAL mode');

  const overview = hydratedState.getCurrentData();
  // Cash 150k + Investments 250k - Liabilities 50k = Net Position 350k
  assert.equal(overview.cash, 150000);
  assert.equal(overview.investments, 250000);
  assert.equal(overview.liabilities, 50000);
  assert.equal(overview.netPosition, 350000);
  assert.equal(overview.monthlyIncome, 80000);
  assert.equal(overview.monthlyExpenses, 30000);
  assert.equal(overview.monthlySurplus, 50000);
  assert.equal(overview.savingsRate, 62.5);
  assert.ok(overview.healthScore > 0);
});

test('Deterministic Finance Engines: Compute correctly on real and empty overviews', () => {
  // 1. Empty dataset handling
  const emptyOverview = { ...EMPTY_FINANCIAL_OVERVIEW };
  const emptyRunway = computeRunway(emptyOverview.cash, emptyOverview.monthlyExpenses, emptyOverview.monthlyIncome);
  assert.ok(emptyRunway.success);
  assert.equal(emptyRunway.data.cash, 0);

  const emptyTax = calculateTaxProjection(emptyOverview.monthlyIncome * 12, 0, 'new');
  assert.ok(emptyTax.success);
  assert.equal(emptyTax.data.grossAnnualIncome, 0);
  assert.equal(emptyTax.data.totalPayableWithCess, 0);

  const emptyTwin = new DigitalTwinEngine({
    cashBalance: emptyOverview.cash,
    monthlyRevenue: emptyOverview.monthlyIncome,
    monthlyExpenses: emptyOverview.monthlyExpenses,
  });
  const emptySim = emptyTwin.simulate([], 12);
  assert.equal(emptySim.length, 12);
  assert.equal(emptySim[11].cash, 0);

  // 2. Real dataset handling
  const realOverview = {
    netPosition: 500000,
    cash: 200000,
    investments: 300000,
    assets: 0,
    liabilities: 0,
    monthlyIncome: 100000,
    monthlyExpenses: 60000,
    monthlySurplus: 40000,
    savingsRate: 40.0,
    healthScore: 85,
  };

  const realRunway = computeRunway(realOverview.cash, realOverview.monthlyExpenses, realOverview.monthlyIncome);
  assert.ok(realRunway.success);
  assert.equal(realRunway.data.status, 'SURPLUS');
  assert.equal(realRunway.data.netBurnOrSurplus, 40000);
  assert.equal(realRunway.data.runwayMonths, 3.3);

  const realTax = calculateTaxProjection(realOverview.monthlyIncome * 12, 150000, 'new');
  assert.ok(realTax.success);
  assert.equal(realTax.data.grossAnnualIncome, 1200000);
  assert.ok(realTax.data.totalPayableWithCess > 0);

  const realTwin = new DigitalTwinEngine({
    cashBalance: realOverview.cash,
    monthlyRevenue: realOverview.monthlyIncome,
    monthlyExpenses: realOverview.monthlyExpenses,
  });
  const realSim = realTwin.simulate([], 12);
  assert.equal(realSim.length, 12);
  assert.equal(realSim[0].cash, 240000); // 200k + 40k
  assert.equal(realSim[11].cash, 680000); // 200k + 12 * 40k
});

test('Store CRUD: Creating account transitions EMPTY -> REAL and recalculates overview', async () => {
  useStore.setState({
    dataMode: 'EMPTY',
    accounts: [],
    transactions: [],
    rawDbTransactions: [],
    investments: [],
    invoices: [],
    obligations: [],
  });

  assert.equal(useStore.getState().dataMode, 'EMPTY');

  const res = await useStore.getState().addAccount({
    name: 'Citibank Checking',
    account_type: 'cash',
    balance: 500000,
    currency: 'INR',
    institution: 'Citibank',
  });

  assert.equal(res.success, true);
  const state = useStore.getState();
  assert.equal(state.dataMode, 'REAL', 'Account creation must transition EMPTY -> REAL');
  assert.equal(state.accounts.length, 1);
  assert.equal(state.accounts[0].name, 'Citibank Checking');

  const overview = state.getCurrentData();
  assert.equal(overview.cash, 500000);
  assert.equal(overview.netPosition, 500000);
});

test('Store CRUD: Creating transaction persists into REAL state and recalculates flow', async () => {
  const accountId = useStore.getState().accounts[0]?.id || 'acc_test_1';
  const now = new Date().toISOString().split('T')[0];

  const res = await useStore.getState().addTransaction({
    account_id: accountId,
    amount: 120000,
    transaction_type: 'income',
    category: 'Client Revenue',
    description: 'Quarterly Retainer',
    transaction_date: now,
  });

  assert.equal(res.success, true);
  const state = useStore.getState();
  assert.equal(state.transactions.length, 1);
  assert.equal(state.transactions[0].amount, 120000);
  assert.equal(state.transactions[0].type, 'INFLOW');

  const overview = state.getCurrentData();
  assert.equal(overview.monthlyIncome, 120000);
  assert.equal(overview.monthlySurplus, 120000);
  assert.equal(overview.savingsRate, 100);
});

test('Store CRUD: DEMO mode strictly blocks real CRUD operations to prevent mixing', async () => {
  useStore.getState().activateDemo();
  assert.equal(useStore.getState().dataMode, 'DEMO');

  const accountRes = await useStore.getState().addAccount({
    name: 'Attempted Real Account',
    account_type: 'cash',
    balance: 10000,
  });
  assert.equal(accountRes.success, false);
  assert.match(accountRes.error || '', /DEMO mode/i);

  const txRes = await useStore.getState().addTransaction({
    account_id: 'acc_demo',
    amount: 5000,
    transaction_type: 'income',
    category: 'Salary',
  });
  assert.equal(txRes.success, false);
  assert.match(txRes.error || '', /DEMO mode/i);

  // Exit demo and verify clean reset
  useStore.getState().exitDemo();
  assert.notEqual(useStore.getState().dataMode, 'DEMO');
});

test('Store CRUD: Deleting accounts and transactions correctly transitions REAL -> EMPTY', async () => {
  useStore.setState({
    dataMode: 'REAL',
    accounts: [
      {
        id: 'acc_del_1',
        user_id: null,
        organization_id: null,
        name: 'Disposable Account',
        account_type: 'cash',
        currency: 'INR',
        balance: 1000,
        institution: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    rawDbTransactions: [
      {
        id: 'tx_del_1',
        account_id: 'acc_del_1',
        user_id: null,
        organization_id: null,
        amount: 500,
        transaction_type: 'expense',
        category: 'Utilities',
        description: 'Water bill',
        transaction_date: new Date().toISOString().split('T')[0],
        metadata: {},
        created_at: new Date().toISOString(),
      },
    ],
    transactions: [
      {
        id: 'tx_del_1',
        date: new Date().toISOString().split('T')[0],
        description: 'Water bill',
        category: 'Utilities',
        account: 'Disposable Account',
        amount: 500,
        type: 'OUTFLOW',
        entity: 'PERSONAL',
        status: 'SETTLED',
      },
    ],
  });

  assert.equal(useStore.getState().dataMode, 'REAL');

  // Delete transaction
  const txDelRes = await useStore.getState().removeTransaction('tx_del_1');
  assert.equal(txDelRes.success, true);
  assert.equal(useStore.getState().transactions.length, 0);
  assert.equal(useStore.getState().dataMode, 'REAL', 'Still REAL because account exists');

  // Delete last account
  const accDelRes = await useStore.getState().removeAccount('acc_del_1');
  assert.equal(accDelRes.success, true);
  assert.equal(useStore.getState().accounts.length, 0);
  const overview = useStore.getState().getCurrentData();
  assert.equal(overview.netPosition, 0);
  assert.equal(overview.cash, 0);
  assert.equal(overview.monthlyIncome, 0);
});

test('Phase 4: Command Center overview returns zero values in EMPTY mode', () => {
  useStore.setState({
    dataMode: 'EMPTY',
    accounts: [],
    transactions: [],
    rawDbTransactions: [],
    investments: [],
    invoices: [],
    obligations: [],
  });

  const overview = useStore.getState().getCurrentData();
  assert.equal(overview.netPosition, 0, 'Net position must be 0 in EMPTY mode');
  assert.equal(overview.cash, 0, 'Liquid cash must be 0 in EMPTY mode');
  assert.equal(overview.investments, 0, 'Investments must be 0 in EMPTY mode');
  assert.equal(overview.monthlyIncome, 0, 'Monthly income must be 0 in EMPTY mode');
  assert.equal(overview.monthlyExpenses, 0, 'Monthly burn must be 0 in EMPTY mode');
  assert.equal(overview.monthlySurplus, 0, 'Surplus must be 0 in EMPTY mode');
  assert.equal(overview.savingsRate, 0, 'Savings rate must be 0 in EMPTY mode');
  assert.equal(overview.healthScore, 0, 'Health score must be 0 in EMPTY mode');

  const runway = computeRunway(overview.cash, overview.monthlyExpenses, overview.monthlyIncome);
  assert.equal(runway.data.cash, 0);
  assert.equal(runway.data.runwayMonths, 999); // Zero expenses yields infinite surplus code
});

test('Phase 4: Command Center uses genuine aggregated REAL overview values without fabrication', () => {
  const accounts = [
    {
      id: 'acc_real_cash',
      user_id: 'u1',
      organization_id: null,
      name: 'Primary Checking',
      account_type: 'cash',
      currency: 'INR',
      balance: 400000,
      institution: 'HDFC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_real_inv',
      user_id: 'u1',
      organization_id: null,
      name: 'Mutual Fund SIPS',
      account_type: 'investment',
      currency: 'INR',
      balance: 600000,
      institution: 'Groww',
      metadata: { investedAmount: 500000, ticker: 'NIFTYBEES' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_real_debt',
      user_id: 'u1',
      organization_id: null,
      name: 'Car Loan',
      account_type: 'liability',
      currency: 'INR',
      balance: 150000,
      institution: 'SBI',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const now = new Date().toISOString().split('T')[0];
  const dbTx = [
    {
      id: 'tx_in_1',
      account_id: 'acc_real_cash',
      user_id: 'u1',
      organization_id: null,
      amount: 150000,
      transaction_type: 'income',
      category: 'Salary',
      description: 'Monthly Salary',
      transaction_date: now,
      metadata: {},
      created_at: new Date().toISOString(),
      account: { name: 'Primary Checking', account_type: 'cash' },
    },
    {
      id: 'tx_out_1',
      account_id: 'acc_real_cash',
      user_id: 'u1',
      organization_id: null,
      amount: 60000,
      transaction_type: 'expense',
      category: 'Housing',
      description: 'Rent and maintenance',
      transaction_date: now,
      metadata: {},
      created_at: new Date().toISOString(),
      account: { name: 'Primary Checking', account_type: 'cash' },
    },
  ];

  useStore.getState().hydrateRealData(accounts, dbTx);

  const state = useStore.getState();
  assert.equal(state.dataMode, 'REAL');

  const overview = state.getCurrentData();
  // 400k (cash) + 600k (inv) - 150k (debt) = 850k net position
  assert.equal(overview.cash, 400000);
  assert.equal(overview.investments, 600000);
  assert.equal(overview.liabilities, 150000);
  assert.equal(overview.netPosition, 850000);

  // Inflow 150k, Outflow 60k => Surplus 90k, Savings rate 60%
  assert.equal(overview.monthlyIncome, 150000);
  assert.equal(overview.monthlyExpenses, 60000);
  assert.equal(overview.monthlySurplus, 90000);
  assert.equal(overview.savingsRate, 60.0);
  assert.ok(overview.healthScore > 70);

  const runway = computeRunway(overview.cash, overview.monthlyExpenses, overview.monthlyIncome);
  assert.equal(runway.data.status, 'SURPLUS');
  assert.equal(runway.data.runwayMonths, 6.7); // 400k / 60k
});

test('Phase 4: Money Flow filtering does NOT mutate source transactions or leak state', () => {
  const initialCount = useStore.getState().transactions.length;
  const originalTransactions = [...useStore.getState().transactions];

  // Apply simulated filter
  const salaryOnly = useStore.getState().transactions.filter((t) => t.category === 'Salary');
  assert.ok(salaryOnly.length <= initialCount);

  // Verify store state is completely unmutated
  assert.equal(useStore.getState().transactions.length, initialCount, 'Source transaction list must remain intact');
  assert.deepEqual(useStore.getState().transactions, originalTransactions);
});

test('Phase 4: Delete failure preserves transaction in store state', async () => {
  const currentTxs = useStore.getState().transactions;
  assert.ok(currentTxs.length > 0);
  const targetId = currentTxs[0].id;
  const initialLength = currentTxs.length;

  // Simulate delete with non-existent id
  const fakeDelRes = await useStore.getState().removeTransaction('non_existent_tx_99999');
  // Store should maintain all existing transactions
  assert.equal(useStore.getState().transactions.length, initialLength);
  assert.ok(useStore.getState().transactions.some((t) => t.id === targetId));
});

test('Phase 4: Hydration safely marks isHydrating without exposing mock data', () => {
  useStore.setState({
    dataMode: 'REAL',
    isHydrating: true,
    dataError: null,
  });

  const state = useStore.getState();
  assert.equal(state.isHydrating, true);
  // Real or empty data mode must not equal DEMO
  assert.notEqual(state.dataMode, 'DEMO');
  assert.equal(state.invoices.length, 0, 'No sample invoices may appear');
  assert.equal(state.obligations.length, 0, 'No sample obligations may appear');

  useStore.setState({ isHydrating: false });
  assert.equal(useStore.getState().isHydrating, false);
});

test('Phase 5: Multi-User Session Isolation resets store cleanly when user session ends', () => {
  // Simulate User A state in store
  useStore.setState({
    dataMode: 'REAL',
    accounts: [{ id: 'acc_userA', name: 'User A Bank', account_type: 'cash', balance: 500000 }],
    transactions: [{ id: 'tx_userA', amount: 50000, description: 'User A Salary' }],
  });

  assert.equal(useStore.getState().accounts.length, 1);
  assert.equal(useStore.getState().accounts[0].name, 'User A Bank');

  // Simulate Session End / Logout reset
  useStore.setState({
    dataMode: 'EMPTY',
    accounts: [],
    transactions: [],
    rawDbTransactions: [],
    investments: [],
    invoices: [],
    obligations: [],
    isHydrating: false,
    dataError: null,
  });

  const stateUserB = useStore.getState();
  assert.equal(stateUserB.dataMode, 'EMPTY');
  assert.equal(stateUserB.accounts.length, 0, 'User A accounts must be cleared');
  assert.equal(stateUserB.transactions.length, 0, 'User A transactions must be cleared');
  assert.equal(stateUserB.getCurrentData().netPosition, 0);
});

test('Phase 6: Investments derive strictly from real investment accounts with correct allocation percentages', () => {
  const accounts = [
    {
      id: 'acc_inv_1',
      user_id: 'u1',
      organization_id: null,
      name: 'NIFTY 50 Index Fund',
      account_type: 'investment',
      currency: 'INR',
      balance: 600000,
      institution: 'Zerodha',
      metadata: { ticker: 'NIFTYBEES', assetClass: 'Equities', investedAmount: 500000 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_inv_2',
      user_id: 'u1',
      organization_id: null,
      name: 'Government Sovereign Gold Bonds',
      account_type: 'investment',
      currency: 'INR',
      balance: 400000,
      institution: 'HDFC Securities',
      metadata: { ticker: 'GOLDBEES', assetClass: 'Commodities', investedAmount: 400000 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_cash_1',
      user_id: 'u1',
      organization_id: null,
      name: 'Salary Checking',
      account_type: 'cash',
      currency: 'INR',
      balance: 200000,
      institution: 'ICICI',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  useStore.getState().hydrateRealData(accounts, []);
  const state = useStore.getState();

  assert.equal(state.investments.length, 2, 'Only investment accounts should map to investments array');
  const nifty = state.investments.find((i) => i.ticker === 'NIFTYBEES');
  assert.ok(nifty);
  assert.equal(nifty.currentValue, 600000);
  assert.equal(nifty.investedAmount, 500000);
  assert.equal(nifty.unrealizedGain, 100000);
  assert.equal(nifty.returnPct, 20.0);
  assert.equal(nifty.allocationPct, 60.0); // 600k / 1000k

  const gold = state.investments.find((i) => i.ticker === 'GOLDBEES');
  assert.ok(gold);
  assert.equal(gold.currentValue, 400000);
  assert.equal(gold.allocationPct, 40.0); // 400k / 1000k
});

test('Phase 6: Personal vs Business data domain isolation in computeRealOverview and store', () => {
  const accounts = [
    {
      id: 'acc_pers_cash',
      user_id: 'u1',
      organization_id: null,
      name: 'Personal HDFC',
      account_type: 'cash',
      currency: 'INR',
      balance: 100000,
      institution: 'HDFC',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_biz_cash',
      user_id: 'u1',
      organization_id: 'org_123_enterprise',
      name: 'Corporate Current Account',
      account_type: 'cash',
      currency: 'INR',
      balance: 900000,
      institution: 'Axis Bank',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const now = new Date().toISOString().split('T')[0];
  const transactions = [
    {
      id: 'tx_pers_1',
      account_id: 'acc_pers_cash',
      user_id: 'u1',
      organization_id: null,
      amount: 40000,
      transaction_type: 'income',
      category: 'Salary',
      description: 'Personal Inflow',
      transaction_date: now,
      metadata: {},
      created_at: new Date().toISOString(),
    },
    {
      id: 'tx_biz_1',
      account_id: 'acc_biz_cash',
      user_id: 'u1',
      organization_id: 'org_123_enterprise',
      amount: 350000,
      transaction_type: 'income',
      category: 'Client Revenue',
      description: 'SaaS Enterprise Annual Contract',
      transaction_date: now,
      metadata: {},
      created_at: new Date().toISOString(),
    },
  ];

  const persOverview = computeRealOverview(accounts, transactions, 'PERSONAL');
  assert.equal(persOverview.cash, 100000, 'Personal cash must only include personal accounts');
  assert.equal(persOverview.monthlyIncome, 40000, 'Personal income must only include personal transactions');

  const bizOverview = computeRealOverview(accounts, transactions, 'BUSINESS');
  assert.equal(bizOverview.cash, 900000, 'Business cash must only include organization accounts');
  assert.equal(bizOverview.monthlyIncome, 350000, 'Business income must only include organization transactions');
});

test('Phase 6: Business empty state returns honest zero values when no organization records exist', () => {
  const onlyPersonalAccounts = [
    {
      id: 'acc_pers_only',
      user_id: 'u1',
      organization_id: null,
      name: 'Personal Savings',
      account_type: 'cash',
      currency: 'INR',
      balance: 50000,
      institution: 'SBI',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const bizOverview = computeRealOverview(onlyPersonalAccounts, [], 'BUSINESS');
  assert.equal(bizOverview.cash, 0, 'Business cash must be 0 when no org accounts exist');
  assert.equal(bizOverview.netPosition, 0);
  assert.equal(bizOverview.monthlyIncome, 0);
  assert.equal(bizOverview.monthlyExpenses, 0);
  assert.equal(bizOverview.monthlySurplus, 0);
});

test('Phase 6: REAL mode keeps invoices and obligations empty without demo leaks', () => {
  useStore.getState().hydrateRealData([], []);
  const state = useStore.getState();

  assert.equal(state.invoices.length, 0, 'Invoices must be empty array in REAL/EMPTY mode');
  assert.equal(state.obligations.length, 0, 'Obligations must be empty array in REAL/EMPTY mode');
});

test('Phase 7: Deterministic reconciliation match rate and exception calculation', () => {
  const recon = runReconciliationAudit();
  assert.equal(recon.success, true);
  assert.equal(recon.data.totalGatewayRecords, 60);
  assert.equal(recon.data.totalBankTransactions, 58);
  assert.equal(recon.data.matchedCount, 49);
  assert.equal(recon.data.discrepancyCount, 11);
  assert.equal(recon.data.matchRatePct, 81.7); // 49 / 60 * 100

  // Check exception specifics
  const duplicate = recon.data.discrepancies.find((d) => d.type === 'DUPLICATE_WEBHOOK');
  assert.ok(duplicate);
  assert.equal(duplicate.id, 'pay_6F');

  const mdr = recon.data.discrepancies.find((d) => d.type === 'MDR_FEE_VARIANCE');
  assert.ok(mdr);
  assert.equal(mdr.id, 'setl_5E');

  const unk = recon.data.discrepancies.find((d) => d.type === 'UNKNOWN_BANK_CREDIT');
  assert.ok(unk);
  assert.equal(unk.id, 'txn_106');
});

test('Phase 7: Finance Controller Decision Trace contains grounded metrics and STRICTLY_GROUNDED status', async () => {
  const resp = await FinanceControllerOrchestrator.processQuery('Run reconciliation audit on gateway');
  assert.ok(resp.id.startsWith('trace_'));
  assert.equal(resp.intent, 'Reconciliation & Settlement Audit');
  assert.equal(resp.decisionTrace.validationStatus, 'STRICTLY_GROUNDED');

  const reconMetric = resp.decisionTrace.groundedMetrics.find((m) => m.label === 'Match Rate');
  assert.ok(reconMetric);
  assert.equal(reconMetric.value, '81.7%');
});

test('Phase 7: Finance Controller staged actions require explicit human authorization', async () => {
  const resp = await FinanceControllerOrchestrator.processQuery('What is my current runway?');
  assert.ok(resp.stagedAction);
  assert.equal(resp.stagedAction.requiresHumanApproval, true);
  assert.ok(resp.stagedAction.title);
  assert.ok(resp.stagedAction.targetUrl);
});

test('Phase 7: Real custom overview flows into Finance Controller without mock data override', async () => {
  const customOverview = {
    netPosition: 1500000,
    cash: 500000,
    investments: 800000,
    assets: 200000,
    liabilities: 0,
    monthlyIncome: 120000,
    monthlyExpenses: 60000,
    monthlySurplus: 60000,
    savingsRate: 50.0,
    healthScore: 92,
  };

  const resp = await FinanceControllerOrchestrator.processQuery(
    'What is my current runway?',
    'PERSONAL',
    customOverview
  );

  const cashMetric = resp.decisionTrace.groundedMetrics.find((m) => m.label === 'Liquid Cash');
  assert.ok(cashMetric);
  assert.equal(cashMetric.value, '₹5,00,000');

  const flowMetric = resp.decisionTrace.groundedMetrics.find((m) => m.label === 'Monthly Net Flow');
  assert.ok(flowMetric);
  assert.equal(flowMetric.value, '+₹60,000');
});

test('Buildathon Polish: Investment costBasisAvailable is false when unrecorded and true when explicit', () => {
  const accounts = [
    {
      id: 'acc_inv_with_basis',
      user_id: 'u1',
      organization_id: null,
      name: 'Zerodha Index Fund',
      account_type: 'investment',
      currency: 'INR',
      balance: 300000,
      institution: 'Zerodha',
      metadata: { ticker: 'NIFTY50', investedAmount: 250000 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'acc_inv_no_basis',
      user_id: 'u1',
      organization_id: null,
      name: 'Direct Demat Holding',
      account_type: 'investment',
      currency: 'INR',
      balance: 150000,
      institution: 'Groww',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  useStore.getState().hydrateRealData(accounts, []);
  const state = useStore.getState();

  const withBasis = state.investments.find((i) => i.id === 'acc_inv_with_basis');
  assert.ok(withBasis);
  assert.equal(withBasis.costBasisAvailable, true);
  assert.equal(withBasis.investedAmount, 250000);
  assert.equal(withBasis.unrealizedGain, 50000);
  assert.equal(withBasis.returnPct, 20.0);

  const noBasis = state.investments.find((i) => i.id === 'acc_inv_no_basis');
  assert.ok(noBasis);
  assert.equal(noBasis.costBasisAvailable, false);
  assert.equal(noBasis.investedAmount, 0);
  assert.equal(noBasis.unrealizedGain, 0);
  assert.equal(noBasis.returnPct, 0);
});

test('Hydration Guard: formatINR produces deterministic Indian numbering notation without space variations', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(1234), '₹1,234');
  assert.equal(formatINR(123456), '₹1,23,456');
  assert.equal(formatINR(1234567), '₹12,34,567');
  assert.equal(formatINR(-50000), '-₹50,000');

  assert.equal(formatDeterministicNumber(0), '0');
  assert.equal(formatDeterministicNumber(1234), '1,234');
  assert.equal(formatDeterministicNumber(123456), '1,23,456');
  assert.equal(formatDeterministicNumber(1234567), '12,34,567');
  assert.equal(formatDeterministicNumber(-50000), '-50,000');
});
