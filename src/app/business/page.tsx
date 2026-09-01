'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { ModuleLandingScreen } from '../../components/ModuleLandingScreen';
import { Briefcase } from 'lucide-react';

export default function BusinessPage() {
  const { getCurrentData } = useStore();
  const data = getCurrentData();

  return (
    <ModuleLandingScreen
      title="Enterprise Business Controller"
      subtitle="Corporate general ledger sync, working capital management, burn rate analytics, and invoice reconciliation."
      badge="Enterprise Operations"
      icon={Briefcase}
      metrics={[
        { label: 'Monthly Revenue', value: data.monthlyIncome, format: 'currency', change: '+18.2% QoQ', positive: true },
        { label: 'Operating Burn', value: data.monthlyExpenses, format: 'currency', change: '29.1% Gross Margin', positive: true },
        { label: 'Accounts Receivable', value: data.receivables || 1850000, format: 'currency', change: '48d DSO Avg' },
        { label: 'Cash Runway', value: `${data.runwayMonths || 9.2} Months`, change: 'Healthy Buffer', positive: true },
      ]}
      features={[
        {
          title: 'Automated Invoice Reconciliation',
          description: 'Two-way matching of purchase orders, vendor invoices, and banking settlement feeds with instant discrepancy flags.',
          status: 'Telemetry Synced',
        },
        {
          title: 'Working Capital & Vendor Optimization',
          description: 'Predictive cash outflow scheduling to maximize early-payment discounts without straining liquid buffers.',
          status: 'Ready for Phase 2',
        },
        {
          title: 'Multi-Entity Tax & Compliance Audit',
          description: 'GST, TDS, and corporate advance tax schedule computations updated in real-time as invoices are booked.',
          status: 'Ready for Phase 2',
        },
      ]}
    />
  );
}
