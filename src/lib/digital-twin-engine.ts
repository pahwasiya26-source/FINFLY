export interface FinancialState {
  cashBalance: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

export interface ScenarioVariable {
  id: string;
  name: string;
  type: 'addition' | 'multiplier';
  value: number;
  target: 'revenue' | 'expense' | 'cash';
}

export interface SimulationResult {
  month: number;
  cash: number;
  revenue: number;
  expenses: number;
}

/**
 * Deterministic Financial Simulation Engine
 * Core component of the Financial Digital Twin module.
 * No AI/LLM magic here - purely deterministic accounting math.
 */
export class DigitalTwinEngine {
  private initialState: FinancialState;

  constructor(initialState: FinancialState) {
    this.initialState = { ...initialState };
  }

  public simulate(variables: ScenarioVariable[], durationMonths: number = 12): SimulationResult[] {
    const results: SimulationResult[] = [];
    let currentCash = this.initialState.cashBalance;
    
    // Apply immediate cash changes
    variables.filter(v => v.target === 'cash' && v.type === 'addition').forEach(v => {
      currentCash += v.value;
    });

    for (let month = 1; month <= durationMonths; month++) {
      let currentRev = this.initialState.monthlyRevenue;
      let currentExp = this.initialState.monthlyExpenses;

      // Apply variables to revenue and expenses
      variables.forEach(v => {
        if (v.target === 'revenue') {
          if (v.type === 'addition') currentRev += v.value;
          if (v.type === 'multiplier') currentRev *= v.value;
        }
        if (v.target === 'expense') {
          if (v.type === 'addition') currentExp += v.value;
          if (v.type === 'multiplier') currentExp *= v.value;
        }
      });

      currentCash += (currentRev - currentExp);

      results.push({
        month,
        cash: currentCash,
        revenue: currentRev,
        expenses: currentExp
      });
    }

    return results;
  }
}
