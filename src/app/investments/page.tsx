'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { ModuleLandingScreen } from '../../components/ModuleLandingScreen';
import { TrendingUp } from 'lucide-react';

export default function InvestmentsPage() {
  const { getCurrentData } = useStore();
  const data = getCurrentData();

  return (
    <ModuleLandingScreen
      title="Investment Portfolio Matrix"
      subtitle="Multi-asset performance tracking, risk parity rebalancing, and compounding yield analysis."
      badge="Asset Management"
      icon={TrendingUp}
      metrics={[
        { label: 'Invested Capital', value: data.investments, format: 'currency', change: '+12.4% Annualized', positive: true },
        { label: 'Fixed Assets', value: data.assets, format: 'currency' },
        { label: 'Sharpe Ratio', value: '1.84', change: 'Low Volatility', positive: true },
        { label: 'Compounding Yield', value: '14.2%', format: 'percentage', change: '+6.1% vs Benchmark', positive: true },
      ]}
      features={[
        {
          title: 'Automated Portfolio Rebalancing',
          description: 'Continuous drift monitoring across Equities, Fixed Income, Gold, and Liquid Alternatives with zero capital gains drag.',
          status: 'Ready for Phase 2',
        },
        {
          title: 'Tax-Loss Harvesting Engine',
          description: 'Deterministic scanning for short-term and long-term capital loss offset opportunities prior to financial year end.',
          status: 'Telemetry Synced',
        },
        {
          title: 'Scenario Yield Stress Testing',
          description: 'Integration with the Financial Digital Twin to simulate inflation spikes and interest rate pivot outcomes.',
          status: 'Ready for Phase 2',
        },
      ]}
    />
  );
}
