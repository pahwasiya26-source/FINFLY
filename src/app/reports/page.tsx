'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { ModuleLandingScreen } from '../../components/ModuleLandingScreen';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  const { getCurrentData, mode } = useStore();
  const data = getCurrentData();

  return (
    <ModuleLandingScreen
      title="Financial Reports & Statements"
      subtitle="Audited Balance Sheets, Cash Flow statements, P&L summaries, and exportable reconciliation records."
      badge="Financial Reporting"
      icon={FileText}
      metrics={[
        { label: 'Net Position Asset Base', value: data.netPosition, format: 'currency', change: 'Current Period' },
        { label: 'Annualized Inflow', value: data.monthlyIncome * 12, format: 'currency' },
        { label: 'Annualized Outflows', value: data.monthlyExpenses * 12, format: 'currency' },
        { label: 'Audit Trail Health', value: '100%', change: 'Zero Gaps', positive: true },
      ]}
      features={[
        {
          title: 'Automated GAAP / IFRS Balance Sheet',
          description: 'Instant generation of audited balance sheet and capital statement reports matching Indian accounting standards.',
          status: 'Ready for Phase 2',
        },
        {
          title: 'Direct PDF / Excel / CSV Export Pipeline',
          description: 'One-click export of verified transaction workbooks with embedded formula cell references.',
          status: 'Telemetry Synced',
        },
        {
          title: 'Quarterly Board & Investor Pack',
          description: 'High-resolution visualizations of money flow, unit economics, and capital runway charts.',
          status: 'Ready for Phase 2',
        },
      ]}
    />
  );
}
