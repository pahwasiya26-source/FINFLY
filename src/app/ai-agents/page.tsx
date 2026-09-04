'use client';

import React from 'react';
import { ModuleLandingScreen } from '../../components/ModuleLandingScreen';
import { Boxes } from 'lucide-react';

export default function AiAgentsPage() {
  return (
    <ModuleLandingScreen
      title="Autonomous Financial Agents"
      subtitle="Specialized autonomous AI agents for reconciliation, tax planning, expense auditing, and cash management."
      badge="Autonomous Fleet"
      icon={Boxes}
      metrics={[
        { label: 'Active Agent Fleet', value: '4 Specialized Agents', change: 'All Nominal', positive: true },
        { label: 'Autonomous Actions / Day', value: '142 Verified', change: '100% Policy Bound', positive: true },
        { label: 'Deterministic Guardrails', value: 'Strict Enclave', change: 'Deterministic Grounding' },
        { label: 'Human-in-the-Loop Threshold', value: '> ₹50,000', change: 'Approval Required' },
      ]}
      features={[
        {
          title: 'Reconciliation Agent',
          description: 'Continuously monitors banking settlement webhooks and resolves duplicate charges.',
          status: 'Telemetry Synced',
        },
        {
          title: 'Tax Optimization Agent',
          description: 'Calculates advance tax liabilities and books deductible category expenses in real-time.',
          status: 'Ready for Phase 2',
        },
        {
          title: 'Cashflow Sentinel Agent',
          description: 'Monitors liquidity thresholds and executes automated high-yield sweeps when balances exceed target.',
          status: 'Ready for Phase 2',
        },
      ]}
    />
  );
}
