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
import { FinancialOverview } from './mock-data';
import { geminiProvider } from './llm-provider';

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
  provider?: 'GEMINI' | 'DETERMINISTIC_LOCAL';
  aiProviderConfigured?: boolean;
  aiProviderMessage?: string;
  isInsufficientData?: boolean;
}

export class FinanceControllerOrchestrator {
  /**
   * Process a natural language financial query through strictly deterministic tools,
   * optionally augmented by server-side Gemini narrative explanation.
   */
  public static async processQuery(
    query: string,
    currentMode: 'PERSONAL' | 'BUSINESS' = 'PERSONAL',
    customOverview?: FinancialOverview,
    options?: {
      transactions?: any[];
      dataMode?: 'REAL' | 'DEMO' | 'EMPTY';
      skipLLM?: boolean;
    }
  ): Promise<ControllerResponse> {
    const lowerQuery = query.toLowerCase();
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = new Date().toISOString();

    // 0. Empty Data Mode Safety Gate: Never fabricate balances if user workspace has no records
    const isExplicitEmpty = options?.dataMode === 'EMPTY';
    const isZeroOverview = customOverview &&
      customOverview.cash === 0 &&
      customOverview.monthlyIncome === 0 &&
      customOverview.monthlyExpenses === 0 &&
      customOverview.netPosition === 0 &&
      (!options?.transactions || options.transactions.length === 0);

    if (isExplicitEmpty || isZeroOverview) {
      return this.handleEmptyDataQuery(query, currentMode, traceId, timestamp);
    }

    let response: ControllerResponse;

    // 1. Intent Detection with Precise Disambiguation
    if (
      lowerQuery.includes('reconcil') ||
      lowerQuery.includes('gateway') ||
      lowerQuery.includes('bank match') ||
      lowerQuery.includes('discrepan') ||
      lowerQuery.includes('duplicate') ||
      lowerQuery.includes('settlement')
    ) {
      response = this.handleReconciliationQuery(query, traceId, timestamp);
    } else if (
      lowerQuery.includes('tax') ||
      lowerQuery.includes('deduction') ||
      lowerQuery.includes('regime') ||
      lowerQuery.includes('87a') ||
      lowerQuery.includes('advance tax') ||
      lowerQuery.includes('slab')
    ) {
      response = this.handleTaxQuery(query, currentMode, traceId, timestamp, customOverview);
    } else if (
      lowerQuery.includes('runway') ||
      lowerQuery.includes('burn') ||
      lowerQuery.includes('cash buffer') ||
      lowerQuery.includes('how long')
    ) {
      response = this.handleRunwayQuery(query, currentMode, traceId, timestamp, customOverview);
    } else if (
      lowerQuery.includes('cash going') ||
      lowerQuery.includes('where is my cash') ||
      lowerQuery.includes('where does my money') ||
      lowerQuery.includes('overspend') ||
      lowerQuery.includes('spending breakdown') ||
      lowerQuery.includes('outflows')
    ) {
      response = this.handleSpendingAnalysisQuery(query, currentMode, traceId, timestamp, customOverview);
    } else if (
      lowerQuery.includes('unusual') ||
      lowerQuery.includes('anomal') ||
      lowerQuery.includes('variance') ||
      lowerQuery.includes('risk') ||
      lowerQuery.includes('irregular') ||
      lowerQuery.includes('dso')
    ) {
      response = this.handleAnomalyQuery(query, currentMode, traceId, timestamp);
    } else if (
      lowerQuery.includes('what happens if') ||
      lowerQuery.includes('increase') ||
      lowerQuery.includes('simulate') ||
      lowerQuery.includes('what if') ||
      lowerQuery.includes('hire') ||
      lowerQuery.includes('scenario') ||
      lowerQuery.includes('afford') ||
      lowerQuery.includes('purchase') ||
      lowerQuery.includes('additional')
    ) {
      response = this.handleScenarioQuery(query, currentMode, traceId, timestamp, customOverview);
    } else {
      // General financial position, health, and situation summary
      response = this.handleGeneralOverviewQuery(query, currentMode, traceId, timestamp, customOverview);
    }

    // 2. Server-side AI Provider (Gemini) Augmentation
    const isServer = typeof window === 'undefined';
    if (isServer && !options?.skipLLM) {
      try {
        if (geminiProvider.isConfigured()) {
          const aiContext = {
            query,
            intent: response.intent,
            validationStatus: response.decisionTrace.validationStatus,
            groundedMetrics: response.decisionTrace.groundedMetrics,
            deterministicSummary: response.explanation,
            deterministicBulletPoints: response.bulletPoints,
          };

          const aiExplanation = await geminiProvider.generateResponse(
            `Explain this financial assessment to the user based STRICTLY on the deterministic metrics provided. Do not hallucinate or change numbers.\nQuery: "${query}"`,
            aiContext
          );

          if (aiExplanation && aiExplanation.trim().length > 0) {
            response.explanation = aiExplanation;
            response.provider = 'GEMINI';
            response.aiProviderConfigured = true;
          }
        } else {
          response.provider = 'DETERMINISTIC_LOCAL';
          response.aiProviderConfigured = false;
          response.aiProviderMessage = 'AI service is not configured. Please configure the server-side AI provider (GEMINI_API_KEY).';
        }
      } catch (err: any) {
        console.warn('[FinanceControllerOrchestrator] AI provider enhancement failed, falling back to deterministic explanation:', err?.message || err);
        response.provider = 'DETERMINISTIC_LOCAL';
        response.aiProviderConfigured = true;
        response.aiProviderMessage = `AI provider temporarily unavailable (${err?.message || 'timeout'}). Deterministic engine output provided.`;
      }
    } else {
      response.provider = 'DETERMINISTIC_LOCAL';
      response.aiProviderConfigured = false;
    }

    return response;
  }

  // -------------------------------------------------------------
  // Intent Handlers (All numbers populated strictly from tool data)
  // -------------------------------------------------------------

  private static handleEmptyDataQuery(
    query: string,
    mode: 'PERSONAL' | 'BUSINESS',
    traceId: string,
    timestamp: string
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode, {
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
    });

    const explanation = `Your ${mode.toLowerCase()} workspace does not contain any recorded financial accounts or transactions. The Finance Controller cannot calculate personalized runway, burn rate, tax projections, or spending variances without verified general ledger data. Please add your financial accounts or record transactions in the Command Center to activate real-time deterministic intelligence.`;

    const bulletPoints = [
      `Liquid Cash: ₹0 (No accounts connected)`,
      `Monthly Inflow: ₹0`,
      `Monthly Outflow: ₹0`,
      `Telemetry Status: Insufficient Ledger Data`,
      `Action: Connect bank/investment accounts or record transactions in the Command Center`,
    ];

    const decisionTrace: DecisionTraceEntry = {
      traceId,
      timestamp,
      query,
      intent: 'INSUFFICIENT_DATA_GUIDANCE',
      toolsUsed: [
        {
          toolName: overviewTool.toolName,
          inputs: overviewTool.inputs,
          outputs: overviewTool.data,
          formula: overviewTool.formula,
          source: 'General Ledger Registry (Empty Workspace)',
        },
      ],
      validationStatus: 'STRICTLY_GROUNDED',
      groundedMetrics: [
        { label: 'Ledger Status', value: '0 Accounts / 0 Txns', source: 'Ledger Registry', positive: false },
        { label: 'Liquid Cash', value: '₹0', source: 'Treasury Balance' },
        { label: 'Runway Buffer', value: '0 Months', formula: '0 / 0', source: 'Runway Engine' },
      ],
      stagedAction: {
        id: `act_${traceId}`,
        title: 'Add Financial Account',
        description: 'Connect your first bank, savings, or investment account to activate deterministic telemetry.',
        type: 'NAVIGATE',
        targetUrl: '/',
        requiresHumanApproval: true,
      },
    };

    return {
      id: traceId,
      query,
      intent: 'Insufficient Ledger Data',
      explanation,
      bulletPoints,
      decisionTrace,
      stagedAction: decisionTrace.stagedAction,
      created_at: timestamp,
      isInsufficientData: true,
      provider: 'DETERMINISTIC_LOCAL',
    };
  }

  private static handleRunwayQuery(
    query: string,
    mode: 'PERSONAL' | 'BUSINESS',
    traceId: string,
    timestamp: string,
    customOverview?: FinancialOverview
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode, customOverview);
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

  private static handleSpendingAnalysisQuery(
    query: string,
    mode: 'PERSONAL' | 'BUSINESS',
    traceId: string,
    timestamp: string,
    customOverview?: FinancialOverview
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode, customOverview);
    const anomalyTool = detectAnomalies(mode);
    const data = overviewTool.data;

    const expenseRatio = data.monthlyIncome > 0
      ? Number(((data.monthlyExpenses / data.monthlyIncome) * 100).toFixed(1))
      : 0;

    const topVariances = anomalyTool.data.anomaliesDetected
      .filter((a) => a.type === 'EXPENSE_VARIANCE')
      .map((a) => `${a.category}: ${a.metricVariance} (${a.details})`);

    const varianceSummary = topVariances.length > 0
      ? topVariances.join('; ')
      : 'All expenditure lines remain strictly aligned with historical 6-month baselines.';

    const explanation = `Outflow & Cash Allocation Audit (${mode} Mode): Total monthly expenditure is ₹${data.monthlyExpenses.toLocaleString('en-IN')}, representing ${expenseRatio}% of total inflows. Net monthly surplus retained is ₹${data.monthlySurplus.toLocaleString('en-IN')} (${data.savingsRate}% savings rate). ${varianceSummary}`;

    const bulletPoints = [
      `Total Monthly Outflows: ₹${data.monthlyExpenses.toLocaleString('en-IN')}`,
      `Expense-to-Income Ratio: ${expenseRatio}%`,
      `Monthly Retained Surplus: ₹${data.monthlySurplus.toLocaleString('en-IN')} (${data.savingsRate}% rate)`,
      ...anomalyTool.data.anomaliesDetected.map((a) => `[${a.severity}] ${a.category}: ${a.headline} (${a.metricVariance})`),
    ];

    const decisionTrace: DecisionTraceEntry = {
      traceId,
      timestamp,
      query,
      intent: 'SPENDING_AND_OUTFLOW_ANALYSIS',
      toolsUsed: [
        {
          toolName: overviewTool.toolName,
          inputs: overviewTool.inputs,
          outputs: overviewTool.data,
          formula: overviewTool.formula,
          source: overviewTool.source,
        },
        {
          toolName: anomalyTool.toolName,
          inputs: anomalyTool.inputs,
          outputs: anomalyTool.data,
          formula: anomalyTool.formula,
          source: anomalyTool.source,
        },
      ],
      validationStatus: 'STRICTLY_GROUNDED',
      groundedMetrics: [
        { label: 'Monthly Outflows', value: `₹${data.monthlyExpenses.toLocaleString('en-IN')}`, source: overviewTool.source, positive: false },
        { label: 'Expense Ratio', value: `${expenseRatio}%`, formula: 'Expenses / Income * 100', source: overviewTool.source, positive: expenseRatio <= 60 },
        { label: 'Monthly Surplus', value: `₹${data.monthlySurplus.toLocaleString('en-IN')}`, source: overviewTool.source, positive: true },
        { label: 'Savings Rate', value: `${data.savingsRate}%`, source: overviewTool.source, positive: data.savingsRate >= 30 },
      ],
      stagedAction: {
        id: `act_${traceId}`,
        title: 'Inspect General Ledger Outflows in Money Flow',
        description: 'Drill down into category-level spending history and variance charts.',
        type: 'NAVIGATE',
        targetUrl: '/money-flow',
        requiresHumanApproval: true,
      },
    };

    return {
      id: traceId,
      query,
      intent: 'Spending & Outflow Audit',
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
    timestamp: string,
    customOverview?: FinancialOverview
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode, customOverview);

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
      validationStatus: 'PROJECTION_ESTIMATE',
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
    timestamp: string,
    customOverview?: FinancialOverview
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode, customOverview);
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
    timestamp: string,
    customOverview?: FinancialOverview
  ): ControllerResponse {
    const overviewTool = getFinancialOverview(mode, customOverview);
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
