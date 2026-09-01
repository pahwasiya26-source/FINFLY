import {
  getFinancialOverview,
  computeRunway,
  runReconciliationAudit,
  simulateScenario,
  detectAnomalies,
  calculateTaxProjection,
  ToolExecutionResult,
} from './finance-tools';
import { ScenarioVariable } from './digital-twin-engine';

export interface DecisionTraceEntry {
  traceId: string;
  timestamp: string;
  query: string;
  intent: string;
  toolsUsed: Array<{
    toolName: string;
    inputs: Record<string, any>;
    outputs: any;
    formula?: string;
    source: string;
    isEstimate?: boolean;
  }>;
  validationStatus: 'STRICTLY_GROUNDED' | 'PROJECTION_ESTIMATE';
  groundedMetrics: Array<{
    label: string;
    value: string;
    formula?: string;
    source: string;
    positive?: boolean;
  }>;
  stagedAction?: {
    id: string;
    title: string;
    description: string;
    type: 'NAVIGATE' | 'SIMULATE_IN_TWIN' | 'REVIEW_RECONCILIATION' | 'TAX_PLANNING';
    targetUrl?: string;
    payload?: any;
    requiresHumanApproval: boolean;
  };
}

export interface ControllerResponse {
  id: string;
  query: string;
  intent: string;
  explanation: string;
  bulletPoints: string[];
  decisionTrace: DecisionTraceEntry;
  stagedAction?: DecisionTraceEntry['stagedAction'];
  created_at: string;
}

export class FinanceControllerOrchestrator {
  /**
   * Process a natural language financial query through strictly deterministic tools.
   */
  public static async processQuery(
    query: string,
    currentMode: 'PERSONAL' | 'BUSINESS' = 'PERSONAL'
  ): Promise<ControllerResponse> {
    const lowerQuery = query.toLowerCase();
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = new Date().toISOString();

    // 1. Intent Detection
    if (lowerQuery.includes('runway') || lowerQuery.includes('burn') || lowerQuery.includes('cash buffer')) {
      return this.handleRunwayQuery(query, currentMode, traceId, timestamp);
    } else if (
      lowerQuery.includes('reconcil') ||
      lowerQuery.includes('gateway') ||
      lowerQuery.includes('bank match') ||
      lowerQuery.includes('discrepan') ||
      lowerQuery.includes('duplicate')
    ) {
      return this.handleReconciliationQuery(query, traceId, timestamp);
    } else if (
      lowerQuery.includes('simulate') ||
      lowerQuery.includes('what if') ||
      lowerQuery.includes('hire') ||
      lowerQuery.includes('scenario') ||
      lowerQuery.includes('spend') ||
      lowerQuery.includes('additional')
    ) {
      return this.handleScenarioQuery(query, currentMode, traceId, timestamp);
    } else if (
      lowerQuery.includes('tax') ||
      lowerQuery.includes('deduction') ||
      lowerQuery.includes('regime') ||
      lowerQuery.includes('87a')
    ) {
      return this.handleTaxQuery(query, currentMode, traceId, timestamp);
    } else if (
      lowerQuery.includes('anomal') ||
      lowerQuery.includes('variance') ||
      lowerQuery.includes('risk') ||
      lowerQuery.includes('trend') ||
      lowerQuery.includes('dso')
    ) {
      return this.handleAnomalyQuery(query, currentMode, traceId, timestamp);
    } else {
      return this.handleGeneralOverviewQuery(query, currentMode, traceId, timestamp);
    }
  }

  // -------------------------------------------------------------
  // Intent Handlers (All numbers populated strictly from tool data)
  // -------------------------------------------------------------

  private static handleRunwayQuery(
    query: string,
    mode: 'PERSONAL' | 'BUSINESS',
    traceId: string,
    timestamp: string
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode);
    const runwayTool = computeRunway(
      overviewTool.data.cash,
      overviewTool.data.monthlyExpenses,
      overviewTool.data.monthlyIncome
    );

    const isSurplus = runwayTool.data.netBurnOrSurplus >= 0;
    const runway = runwayTool.data.runwayMonths;

    const explanation = isSurplus
      ? `Your ${mode.toLowerCase()} financial structure operates at a healthy net surplus of ₹${runwayTool.data.netBurnOrSurplus.toLocaleString('en-IN')}/month. Available cash reserves of ₹${runwayTool.data.cash.toLocaleString('en-IN')} provide ${runway} months of baseline expense coverage buffer.`
      : `At a net monthly burn rate of ₹${Math.abs(runwayTool.data.netBurnOrSurplus).toLocaleString('en-IN')}, existing liquid cash reserves of ₹${runwayTool.data.cash.toLocaleString('en-IN')} sustain operations for ${runway} months without additional financing.`;

    const bulletPoints = [
      `Liquid Cash: ₹${runwayTool.data.cash.toLocaleString('en-IN')}`,
      `Monthly Inflow: ₹${runwayTool.data.monthlyIncome.toLocaleString('en-IN')}`,
      `Monthly Outflow: ₹${runwayTool.data.monthlyExpenses.toLocaleString('en-IN')}`,
      `Net Monthly Flow: ${isSurplus ? '+' : '-'}₹${Math.abs(runwayTool.data.netBurnOrSurplus).toLocaleString('en-IN')}`,
      `Runway Buffer: ${runway} Months (${runwayTool.data.status})`,
    ];

    const decisionTrace: DecisionTraceEntry = {
      traceId,
      timestamp,
      query,
      intent: 'RUNWAY_AND_LIQUIDITY_ANALYSIS',
      toolsUsed: [
        {
          toolName: overviewTool.toolName,
          inputs: overviewTool.inputs,
          outputs: overviewTool.data,
          formula: overviewTool.formula,
          source: overviewTool.source,
        },
        {
          toolName: runwayTool.toolName,
          inputs: runwayTool.inputs,
          outputs: runwayTool.data,
          formula: runwayTool.formula,
          source: runwayTool.source,
        },
      ],
      validationStatus: 'STRICTLY_GROUNDED',
      groundedMetrics: [
        { label: 'Liquid Cash', value: `₹${runwayTool.data.cash.toLocaleString('en-IN')}`, source: runwayTool.source },
        { label: 'Monthly Net Flow', value: `${isSurplus ? '+' : '-'}₹${Math.abs(runwayTool.data.netBurnOrSurplus).toLocaleString('en-IN')}`, source: runwayTool.source, positive: isSurplus },
        { label: 'Runway Buffer', value: `${runway} Months`, formula: runwayTool.formula, source: runwayTool.source, positive: runway >= 6 },
      ],
      stagedAction: {
        id: `act_${traceId}`,
        title: 'Run Stress-Test Simulation in Digital Twin',
        description: 'Model revenue reduction or expense acceleration against current liquidity.',
        type: 'SIMULATE_IN_TWIN',
        targetUrl: '/financial-twin',
        requiresHumanApproval: true,
      },
    };

    return {
      id: traceId,
      query,
      intent: 'Runway & Liquidity Buffer',
      explanation,
      bulletPoints,
      decisionTrace,
      stagedAction: decisionTrace.stagedAction,
      created_at: timestamp,
    };
  }

  private static handleReconciliationQuery(
    query: string,
    traceId: string,
    timestamp: string
  ): ControllerResponse {
    const auditTool = runReconciliationAudit();
    const data = auditTool.data;

    const explanation = `Deterministic two-way reconciliation processed ${data.totalGatewayRecords} gateway records against ${data.totalBankTransactions} bank settlement transactions. The overall automated match rate is ${data.matchRatePct}%, with ${data.discrepancyCount} exceptions requiring controller review.`;

    const bulletPoints = [
      `Automated Match Rate: ${data.matchRatePct}% (${data.matchedCount} verified pairs)`,
      `Total Discrepancies: ${data.discrepancyCount} items flagged`,
      `Duplicate Webhooks: ${data.duplicateCount} duplicate transaction ID(s)`,
      `Missing in Bank: ${data.missingInBankCount} captured payment(s) without bank credit`,
      `Unrecognized Bank Credits: ${data.unknownBankCount} transaction(s)`,
    ];

    const decisionTrace: DecisionTraceEntry = {
      traceId,
      timestamp,
      query,
      intent: 'RECONCILIATION_AUDIT',
      toolsUsed: [
        {
          toolName: auditTool.toolName,
          inputs: auditTool.inputs,
          outputs: auditTool.data,
          formula: auditTool.formula,
          source: auditTool.source,
        },
      ],
      validationStatus: 'STRICTLY_GROUNDED',
      groundedMetrics: [
        { label: 'Match Rate', value: `${data.matchRatePct}%`, formula: auditTool.formula, source: auditTool.source, positive: data.matchRatePct >= 90 },
        { label: 'Resolved Matches', value: `${data.matchedCount}`, source: auditTool.source },
        { label: 'Unresolved Exceptions', value: `${data.discrepancyCount}`, source: auditTool.source, positive: data.discrepancyCount === 0 },
      ],
      stagedAction: {
        id: `act_${traceId}`,
        title: 'Review Exceptions in Reconciliation Dashboard',
        description: 'Inspect duplicate webhooks, MDR variance, and approve valid ledger matches.',
        type: 'REVIEW_RECONCILIATION',
        targetUrl: '/reconciliation',
        requiresHumanApproval: true,
      },
    };

    return {
      id: traceId,
      query,
      intent: 'Reconciliation & Settlement Audit',
      explanation,
      bulletPoints,
      decisionTrace,
      stagedAction: decisionTrace.stagedAction,
      created_at: timestamp,
    };
  }

  private static handleScenarioQuery(
    query: string,
    mode: 'PERSONAL' | 'BUSINESS',
    traceId: string,
    timestamp: string
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode);
    
    // Parse numeric intent or apply sensible default simulation
    let expenseAddition = 50000;
    const match = query.match(/₹?\s*([\d,]+(\.\d+)?)\s*(k|l|lakh|thousand)?/i);
    if (match) {
      let val = parseFloat(match[1].replace(/,/g, ''));
      const unit = (match[3] || '').toLowerCase();
      if (unit === 'k' || unit === 'thousand') val *= 1000;
      if (unit === 'l' || unit === 'lakh') val *= 100000;
      if (val > 0) expenseAddition = val;
    }

    const variables: ScenarioVariable[] = [
      {
        id: 'sim_1',
        name: 'Simulated Outflow Adjustment',
        type: 'addition',
        value: expenseAddition,
        target: 'expense',
      },
    ];

    const simTool = simulateScenario(
      {
        cashBalance: overviewTool.data.cash,
        monthlyRevenue: overviewTool.data.monthlyIncome,
        monthlyExpenses: overviewTool.data.monthlyExpenses,
      },
      variables,
      12
    );

    const data = simTool.data;

    const explanation = `Simulating an additional outflow of ₹${expenseAddition.toLocaleString('en-IN')}/month over a 12-month trajectory: baseline month-12 cash is projected at ₹${data.baselineMonth12Cash.toLocaleString('en-IN')}, whereas with the additional expense it becomes ₹${data.simulatedMonth12Cash.toLocaleString('en-IN')} (a net impact of -₹${Math.abs(data.cashDelta).toLocaleString('en-IN')}).`;

    const bulletPoints = [
      `Applied Scenario Variable: +₹${expenseAddition.toLocaleString('en-IN')}/mo to Monthly Expenses`,
      `Baseline 12-Month Cash: ₹${data.baselineMonth12Cash.toLocaleString('en-IN')}`,
      `Simulated 12-Month Cash: ₹${data.simulatedMonth12Cash.toLocaleString('en-IN')}`,
      `Net Trajectory Delta: -₹${Math.abs(data.cashDelta).toLocaleString('en-IN')}`,
      `Terminal Status: ${data.simulatedMonth12Cash > 0 ? 'Solvent with positive cash buffer' : 'Deficit risk detected'}`,
    ];

    const decisionTrace: DecisionTraceEntry = {
      traceId,
      timestamp,
      query,
      intent: 'DIGITAL_TWIN_SCENARIO_SIMULATION',
      toolsUsed: [
        {
          toolName: overviewTool.toolName,
          inputs: overviewTool.inputs,
          outputs: overviewTool.data,
          source: overviewTool.source,
        },
        {
          toolName: simTool.toolName,
          inputs: simTool.inputs,
          outputs: simTool.data,
          formula: simTool.formula,
          source: simTool.source,
        },
      ],
      validationStatus: 'STRICTLY_GROUNDED',
      groundedMetrics: [
        { label: 'Baseline M12 Cash', value: `₹${data.baselineMonth12Cash.toLocaleString('en-IN')}`, source: simTool.source },
        { label: 'Simulated M12 Cash', value: `₹${data.simulatedMonth12Cash.toLocaleString('en-IN')}`, source: simTool.source, positive: data.simulatedMonth12Cash > 0 },
        { label: '12-Month Cash Delta', value: `-₹${Math.abs(data.cashDelta).toLocaleString('en-IN')}`, formula: simTool.formula, source: simTool.source, positive: false },
      ],
      stagedAction: {
        id: `act_${traceId}`,
        title: 'Open Scenario in Financial Digital Twin',
        description: 'View full 12-month graph, adjust levers, and compare side-by-side trajectories.',
        type: 'SIMULATE_IN_TWIN',
        targetUrl: '/financial-twin',
        payload: { variables },
        requiresHumanApproval: true,
      },
    };

    return {
      id: traceId,
      query,
      intent: 'Digital Twin Scenario Simulation',
      explanation,
      bulletPoints,
      decisionTrace,
      stagedAction: decisionTrace.stagedAction,
      created_at: timestamp,
    };
  }

  private static handleTaxQuery(
    query: string,
    mode: 'PERSONAL' | 'BUSINESS',
    traceId: string,
    timestamp: string
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode);
    const grossAnnual = overviewTool.data.monthlyIncome * 12;
    const taxTool = calculateTaxProjection(grossAnnual, 150000, 'new');
    const data = taxTool.data;

    const explanation = `Statutory Tax Projection (Estimate): For an annualized gross income of ₹${grossAnnual.toLocaleString('en-IN')} under the FY 2024-25 New Tax Regime, taxable income after standard deduction is ₹${data.taxableIncome.toLocaleString('en-IN')}. Estimated tax liability (including 4% cess) is ₹${data.totalPayableWithCess.toLocaleString('en-IN')} (effective tax rate: ${data.effectiveTaxRatePct}%).`;

    const bulletPoints = [
      `Gross Annualized Inflow: ₹${grossAnnual.toLocaleString('en-IN')}`,
      `Taxable Base (after ₹75,000 std deduction): ₹${data.taxableIncome.toLocaleString('en-IN')}`,
      `Calculated Slab Tax: ₹${data.estimatedTaxLiability.toLocaleString('en-IN')}`,
      `Health & Education Cess (4%): ₹${data.cess.toLocaleString('en-IN')}`,
      `Total Estimated Tax: ₹${data.totalPayableWithCess.toLocaleString('en-IN')} (${data.effectiveTaxRatePct}% effective)`,
      `Status: Statutory projection estimate (verification required with formal tax return)`,
    ];

    const decisionTrace: DecisionTraceEntry = {
      traceId,
      timestamp,
      query,
      intent: 'STATUTORY_TAX_PROJECTION',
      toolsUsed: [
        {
          toolName: taxTool.toolName,
          inputs: taxTool.inputs,
          outputs: taxTool.data,
          formula: taxTool.formula,
          source: taxTool.source,
          isEstimate: true,
        },
      ],
      validationStatus: 'PROJECTION_ESTIMATE',
      groundedMetrics: [
        { label: 'Annualized Gross', value: `₹${grossAnnual.toLocaleString('en-IN')}`, source: overviewTool.source },
        { label: 'Estimated Tax Payable', value: `₹${data.totalPayableWithCess.toLocaleString('en-IN')}`, formula: taxTool.formula, source: taxTool.source },
        { label: 'Effective Tax Rate', value: `${data.effectiveTaxRatePct}%`, source: taxTool.source },
      ],
      stagedAction: {
        id: `act_${traceId}`,
        title: 'Review Tax Planning Center',
        description: 'Explore advance tax schedules, regime comparisons, and deductible category limits.',
        type: 'TAX_PLANNING',
        targetUrl: '/taxes',
        requiresHumanApproval: true,
      },
    };

    return {
      id: traceId,
      query,
      intent: 'Tax Projection & Statutory Estimates',
      explanation,
      bulletPoints,
      decisionTrace,
      stagedAction: decisionTrace.stagedAction,
      created_at: timestamp,
    };
  }

  private static handleAnomalyQuery(
    query: string,
    mode: 'PERSONAL' | 'BUSINESS',
    traceId: string,
    timestamp: string
  ): ControllerResponse {
    const anomalyTool = detectAnomalies(mode);
    const data = anomalyTool.data;

    const explanation = `Variance & Anomaly Audit for ${mode.toLowerCase()} operations identified ${data.anomaliesDetected.length} active variance signal(s) evaluated against rolling 6-month accounting baselines.`;

    const bulletPoints = data.anomaliesDetected.map(
      (a) => `[${a.severity}] ${a.category}: ${a.headline} (${a.metricVariance}) — ${a.details}`
    );

    const decisionTrace: DecisionTraceEntry = {
      traceId,
      timestamp,
      query,
      intent: 'ANOMALY_AND_VARIANCE_DETECTION',
      toolsUsed: [
        {
          toolName: anomalyTool.toolName,
          inputs: anomalyTool.inputs,
          outputs: anomalyTool.data,
          formula: anomalyTool.formula,
          source: anomalyTool.source,
        },
      ],
      validationStatus: 'STRICTLY_GROUNDED',
      groundedMetrics: data.anomaliesDetected.map((a) => ({
        label: a.category,
        value: a.metricVariance,
        source: anomalyTool.source,
        positive: a.type === 'SAVINGS_VELOCITY',
      })),
      stagedAction: {
        id: `act_${traceId}`,
        title: 'Inspect General Ledger & Money Flow',
        description: 'Drill down into transaction categories and compare rolling quarterly averages.',
        type: 'NAVIGATE',
        targetUrl: '/money-flow',
        requiresHumanApproval: true,
      },
    };

    return {
      id: traceId,
      query,
      intent: 'Anomaly & Variance Audit',
      explanation,
      bulletPoints,
      decisionTrace,
      stagedAction: decisionTrace.stagedAction,
      created_at: timestamp,
    };
  }

  private static handleGeneralOverviewQuery(
    query: string,
    mode: 'PERSONAL' | 'BUSINESS',
    traceId: string,
    timestamp: string
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode);
    const data = overviewTool.data;

    const explanation = `General Financial Overview (${mode} Mode): Net financial position stands at ₹${data.netPosition.toLocaleString('en-IN')} with ₹${data.cash.toLocaleString('en-IN')} in liquid cash reserves, total liabilities of ₹${data.liabilities.toLocaleString('en-IN')}, and a monthly surplus of ₹${data.monthlySurplus.toLocaleString('en-IN')} (savings/retention rate: ${data.savingsRate}%). Overall Financial Health Index is calibrated at ${data.healthScore}/100.`;

    const bulletPoints = [
      `Net Financial Position: ₹${data.netPosition.toLocaleString('en-IN')}`,
      `Liquid Cash: ₹${data.cash.toLocaleString('en-IN')}`,
      `Investments & Fixed Assets: ₹${(data.investments + data.assets).toLocaleString('en-IN')}`,
      `Total Liabilities: ₹${data.liabilities.toLocaleString('en-IN')}`,
      `Monthly Net Surplus: ₹${data.monthlySurplus.toLocaleString('en-IN')} (Savings Rate: ${data.savingsRate}%)`,
      `Health Index Score: ${data.healthScore}/100 (Optimal)`,
    ];

    const decisionTrace: DecisionTraceEntry = {
      traceId,
      timestamp,
      query,
      intent: 'GENERAL_FINANCIAL_OVERVIEW',
      toolsUsed: [
        {
          toolName: overviewTool.toolName,
          inputs: overviewTool.inputs,
          outputs: overviewTool.data,
          formula: overviewTool.formula,
          source: overviewTool.source,
        },
      ],
      validationStatus: 'STRICTLY_GROUNDED',
      groundedMetrics: [
        { label: 'Net Position', value: `₹${data.netPosition.toLocaleString('en-IN')}`, formula: overviewTool.formula, source: overviewTool.source, positive: true },
        { label: 'Liquid Cash', value: `₹${data.cash.toLocaleString('en-IN')}`, source: overviewTool.source, positive: true },
        { label: 'Monthly Surplus', value: `₹${data.monthlySurplus.toLocaleString('en-IN')}`, source: overviewTool.source, positive: true },
        { label: 'Health Score', value: `${data.healthScore}/100`, source: overviewTool.source, positive: true },
      ],
    };

    return {
      id: traceId,
      query,
      intent: 'General Financial Overview',
      explanation,
      bulletPoints,
      decisionTrace,
      created_at: timestamp,
    };
  }
}
