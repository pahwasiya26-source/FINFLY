import test from 'node:test';
import assert from 'node:assert/strict';

import { DigitalTwinEngine } from '../src/lib/digital-twin-engine.ts';
import {
  getFinancialOverview,
  computeRunway,
  runReconciliationAudit,
  simulateScenario,
  detectAnomalies,
  calculateTaxProjection,
} from '../src/lib/finance-tools.ts';
import { FinanceControllerOrchestrator } from '../src/lib/finance-controller-orchestrator.ts';
import {
  personalData,
  businessData,
  sampleTransactions,
  sampleInvestments,
  sampleBusinessInvoices,
  sampleUpcomingObligations,
} from '../src/lib/mock-data.ts';
import { syntheticRazorpayRecords, syntheticBankTransactions } from '../src/lib/reconciliation-dataset.ts';

// -------------------------------------------------------------
// 1. Digital Twin Deterministic Engine Tests
// -------------------------------------------------------------
test('DigitalTwinEngine: Baseline simulation with 0 variables matches linear trajectory', () => {
  const initialState = {
    cashBalance: 100000,
    monthlyRevenue: 50000,
    monthlyExpenses: 30000, // net +20k/mo
  };

  const engine = new DigitalTwinEngine(initialState);
  const results = engine.simulate([], 12);

  assert.equal(results.length, 12);
  assert.equal(results[0].month, 1);
  assert.equal(results[0].cash, 120000); // 100k + (50k - 30k)
  assert.equal(results[11].month, 12);
  assert.equal(results[11].cash, 340000); // 100k + 12 * 20k
});

test('DigitalTwinEngine: Addition and Multiplier variables correctly modify cash and OPEX', () => {
  const initialState = {
    cashBalance: 200000,
    monthlyRevenue: 100000,
    monthlyExpenses: 80000,
  };

  const variables = [
    { id: 'v1', name: 'New Hire', type: 'addition', value: 20000, target: 'expense' }, // expenses = 100k
    { id: 'v2', name: 'Revenue Growth', type: 'multiplier', value: 1.1, target: 'revenue' }, // rev = 110k
  ];

  const engine = new DigitalTwinEngine(initialState);
  const results = engine.simulate(variables, 12);

  assert.equal(results[0].expenses, 100000);
  assert.equal(Math.round(results[0].revenue), 110000);
  assert.equal(Math.round(results[0].cash), 210000); // 200k + (110k - 100k)
  assert.equal(Math.round(results[11].cash), 320000); // 200k + 12 * 10k
});

// -------------------------------------------------------------
// 2. Financial Overview & Runway Computation Tests
// -------------------------------------------------------------
test('computeRunway: Correctly identifies surplus vs burn status', () => {
  // Test Surplus Mode
  const surplusRunway = computeRunway(450000, 95000, 180000);
  assert.equal(surplusRunway.success, true);
  assert.equal(surplusRunway.data.status, 'SURPLUS');
  assert.equal(surplusRunway.data.netBurnOrSurplus, 85000);
  assert.equal(surplusRunway.data.runwayMonths, 4.7); // 450000 / 95000 = 4.736 -> 4.7

  // Test Burn Mode
  const burnRunway = computeRunway(300000, 150000, 50000); // net burn = 100k
  assert.equal(burnRunway.data.status, 'RUNWAY_BUFFER');
  assert.equal(burnRunway.data.netBurnOrSurplus, -100000);
  assert.equal(burnRunway.data.runwayMonths, 3.0); // 300000 / 100000 = 3.0
});

test('getFinancialOverview: Returns accurate personal and business balance sheet records', () => {
  const personal = getFinancialOverview('PERSONAL');
  assert.equal(personal.data.cash, personalData.cash);
  assert.equal(personal.data.netPosition, personalData.netPosition);
  assert.equal(personal.data.savingsRate, personalData.savingsRate);

  const business = getFinancialOverview('BUSINESS');
  assert.equal(business.data.cash, businessData.cash);
  assert.equal(business.data.receivables, businessData.receivables);
  assert.equal(business.data.healthScore, businessData.healthScore);
});

// -------------------------------------------------------------
// 3. Reconciliation Two-Way Audit Engine Tests
// -------------------------------------------------------------
test('runReconciliationAudit: Matches synthetic ledger dataset with exact mathematical proofs', () => {
  const audit = runReconciliationAudit();
  assert.equal(audit.success, true);
  assert.equal(audit.data.totalGatewayRecords, syntheticRazorpayRecords.length);
  assert.equal(audit.data.totalBankTransactions, syntheticBankTransactions.length);
  assert.ok(audit.data.matchRatePct > 50);
  assert.ok(audit.data.discrepancies.length > 0);

  // Verify MDR fee discrepancy detection
  const mdrDiscrepancy = audit.data.discrepancies.find(d => d.type === 'MDR_FEE_VARIANCE');
  assert.ok(mdrDiscrepancy, 'MDR fee variance should be identified');
  assert.equal(mdrDiscrepancy.difference, 5); // 4900 vs 4895 = 5 INR

  // Verify Duplicate Webhook detection
  const duplicateDiscrepancy = audit.data.discrepancies.find(d => d.type === 'DUPLICATE_WEBHOOK');
  assert.ok(duplicateDiscrepancy, 'Duplicate webhook should be detected');
  assert.equal(duplicateDiscrepancy.id, 'pay_6F');
});

test('Reconciliation Benchmark: Verifies >=50 gateway records and >=50 evaluated entities', () => {
  const audit = runReconciliationAudit();
  assert.ok(audit.data.totalGatewayRecords >= 50, `Expected >= 50 gateway records, got ${audit.data.totalGatewayRecords}`);
  const totalEvaluated = audit.data.matchedCount + audit.data.discrepancyCount;
  assert.ok(totalEvaluated >= 50, `Expected >= 50 evaluated entities, got ${totalEvaluated}`);
  assert.equal(audit.data.totalGatewayRecords, 60);
  assert.equal(audit.data.totalBankTransactions, 58);
  assert.equal(totalEvaluated, 60);
});

test('Reconciliation Benchmark: Mathematical precision of match rate and honest exception disclosure', () => {
  const audit = runReconciliationAudit();
  const totalEvaluated = audit.data.matchedCount + audit.data.discrepancyCount;
  const expectedRate = Number(((audit.data.matchedCount / totalEvaluated) * 100).toFixed(1));
  assert.equal(audit.data.matchRatePct, expectedRate);
  assert.equal(audit.data.matchRatePct, 81.7);
  assert.equal(audit.data.matchedCount, 49);
  assert.equal(audit.data.discrepancyCount, 11);

  // Exceptions must not be hidden: discrepancyCount equals discrepancies array length
  assert.equal(audit.data.discrepancies.length, audit.data.discrepancyCount);

  // Verify all exception types are present
  const types = new Set(audit.data.discrepancies.map(d => d.type));
  assert.ok(types.has('MDR_FEE_VARIANCE'), 'MDR_FEE_VARIANCE must be present');
  assert.ok(types.has('DUPLICATE_WEBHOOK'), 'DUPLICATE_WEBHOOK must be present');
  assert.ok(types.has('MISSING_IN_BANK'), 'MISSING_IN_BANK must be present');
  assert.ok(types.has('UNKNOWN_BANK_CREDIT'), 'UNKNOWN_BANK_CREDIT must be present');

  // Verify preserved edge cases
  const setl5E = audit.data.discrepancies.find(d => d.id === 'setl_5E');
  assert.ok(setl5E);
  assert.equal(setl5E.difference, 5);

  const pay6F = audit.data.discrepancies.find(d => d.id === 'pay_6F');
  assert.ok(pay6F);
  assert.equal(pay6F.type, 'DUPLICATE_WEBHOOK');

  const txn106 = audit.data.discrepancies.find(d => d.id === 'txn_106');
  assert.ok(txn106);
  assert.equal(txn106.amount, 10000);
});

test('Reconciliation Benchmark: Deterministic reproducibility across repeated runs', () => {
  const run1 = runReconciliationAudit();
  const run2 = runReconciliationAudit();
  assert.deepEqual(run1.data.totalGatewayRecords, run2.data.totalGatewayRecords);
  assert.deepEqual(run1.data.totalBankTransactions, run2.data.totalBankTransactions);
  assert.deepEqual(run1.data.matchedCount, run2.data.matchedCount);
  assert.deepEqual(run1.data.discrepancyCount, run2.data.discrepancyCount);
  assert.deepEqual(run1.data.matchRatePct, run2.data.matchRatePct);
  assert.deepEqual(run1.data.discrepancies, run2.data.discrepancies);
});

// -------------------------------------------------------------
// 4. Statutory Tax Projection Slabs Test
// -------------------------------------------------------------
test('calculateTaxProjection: Correctly computes FY 2024-25 new regime slabs and Section 87A rebate', () => {
  // Test Section 87A rebate for income <= 7L
  const rebateIncome = calculateTaxProjection(650000, 0, 'new');
  assert.equal(rebateIncome.data.rebate87AApplied, true);
  assert.equal(rebateIncome.data.estimatedTaxLiability, 0);
  assert.equal(rebateIncome.data.totalPayableWithCess, 0);
  assert.equal(rebateIncome.isEstimate, true);

  // Test higher bracket income (e.g. 21.6L annual from 1.8L/mo)
  const highIncome = calculateTaxProjection(2160000, 0, 'new');
  assert.equal(highIncome.data.taxableIncome, 2085000); // 21.6L - 75k std deduction
  assert.ok(highIncome.data.totalPayableWithCess > 0);
  assert.ok(highIncome.data.effectiveTaxRatePct > 10);

  // Test Old Regime deductions
  const oldRegimeIncome = calculateTaxProjection(2160000, 150000 + 25000 + 120000, 'old');
  assert.equal(oldRegimeIncome.data.taxableIncome, 2160000 - 50000 - 295000);
  assert.ok(oldRegimeIncome.data.totalPayableWithCess > 0);
});

// -------------------------------------------------------------
// 5. AI Controller Orchestrator Grounding & Decision Trace Tests
// -------------------------------------------------------------
test('FinanceControllerOrchestrator: Generates strictly grounded Decision Traces without hallucinated metrics', async () => {
  const query = 'What is our current runway and liquidity buffer?';
  const response = await FinanceControllerOrchestrator.processQuery(query, 'BUSINESS');

  assert.ok(response.id.startsWith('trace_'));
  assert.equal(response.intent, 'Runway & Liquidity Buffer');
  assert.equal(response.decisionTrace.validationStatus, 'STRICTLY_GROUNDED');
  assert.ok(response.decisionTrace.toolsUsed.length >= 2);
  assert.ok(response.decisionTrace.groundedMetrics.length >= 2);
  assert.ok(response.stagedAction, 'Should offer safe staged proposal requiring human approval');
  assert.equal(response.stagedAction.requiresHumanApproval, true);
});

// -------------------------------------------------------------
// 6. Dataset Single Source of Truth & Affordability Integrity Tests
// -------------------------------------------------------------
test('Dataset & Personal CA: Transaction, investment, and invoice datasets maintain strict invariants', () => {
  assert.ok(sampleTransactions.length >= 8);
  assert.ok(sampleInvestments.length >= 4);
  assert.ok(sampleBusinessInvoices.length >= 4);
  assert.ok(sampleUpcomingObligations.length >= 4);

  // Verify Personal mode cash buffer supports major purchase threshold
  const purchaseAmount = 150000;
  const postPurchaseCash = personalData.cash - purchaseAmount;
  const postPurchaseRunway = postPurchaseCash / personalData.monthlyExpenses;
  assert.ok(postPurchaseCash > 0);
  assert.ok(postPurchaseRunway >= 3.0, 'Personal CA buffer remains safe for ₹1.5L purchase');
});
