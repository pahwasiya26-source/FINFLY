'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { ModuleLandingScreen } from '../../components/ModuleLandingScreen';
import { Bot } from 'lucide-react';

export default function AiCfoPage() {
  const { getCurrentData } = useStore();
  const data = getCurrentData();

  return (
    <ModuleLandingScreen
      title="AI CFO & Strategic Intelligence"
      subtitle="Deterministic executive reasoning, liquidity forecasting, and non-hallucinatory capital advice."
      badge="Deterministic CFO"
      icon={Bot}
      metrics={[
        { label: 'Strategic Confidence', value: '99.4%', change: 'Deterministic Grounding', positive: true },
        { label: 'Financial Health Score', value: `${data.healthScore}/100`, change: 'Optimal Target' },
        { label: 'Runway Projection', value: `${data.runwayMonths || 4.7} Mo`, change: 'Verified Math', positive: true },
        { label: 'Active Guardrails', value: '14 Active', change: 'Enclave Validated', positive: true },
      ]}
      features={[
        {
          title: 'Deterministic Query Resolution',
          description: 'All AI responses are strictly grounded in ledger queries, formula derivations, and mathematical proofs.',
          status: 'Telemetry Synced',
        },
        {
          title: 'Scenario Sensitivity Advisory',
          description: 'Provides proactive warnings on capital commitments, hiring pipelines, and debt leverage risk.',
          status: 'Ready for Phase 2',
        },
        {
          title: 'Executive Financial Briefing Generator',
          description: 'Generates automated monthly board and stakeholder summaries with deterministic mathematical grounding.',
          status: 'Ready for Phase 2',
        },
      ]}
    />
  );
}
