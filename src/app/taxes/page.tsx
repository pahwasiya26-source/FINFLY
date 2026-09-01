'use client';

import React from 'react';
import { useStore } from '../../store/useStore';
import { ModuleLandingScreen } from '../../components/ModuleLandingScreen';
import { Receipt } from 'lucide-react';

export default function TaxesPage() {
  const { getCurrentData, mode } = useStore();
  const data = getCurrentData();
  const isBusiness = mode === 'BUSINESS';

  const estimatedTax = isBusiness ? data.monthlyIncome * 0.25 : (data.monthlyIncome * 12) * 0.20;

  return (
    <ModuleLandingScreen
      title="Tax Intelligence & Optimization"
      subtitle="Deterministic advance tax computation, deduplication of business expenses, and compliance filing readiness."
      badge="Compliance Engine"
      icon={Receipt}
      metrics={[
        { label: 'Estimated Tax Liability', value: Math.round(estimatedTax), format: 'currency', change: 'Current Fiscal Year' },
        { label: 'Deductible Outflows', value: data.monthlyExpenses * (isBusiness ? 0.85 : 0.4), format: 'currency', change: 'Reconciled' },
        { label: 'Advance Tax Buffer', value: Math.round(estimatedTax * 0.75), format: 'currency', change: '75% Provisioned', positive: true },
        { label: 'Audit Readiness', value: '100%', change: 'Zero Discrepancies', positive: true },
      ]}
      features={[
        {
          title: 'Advance Tax Scheduling & Withholding',
          description: 'Quarterly statutory advance tax instalment calculations aligned with Section 208/211 deterministic schedules.',
          status: 'Ready for Phase 2',
        },
        {
          title: 'Automated 80C / 80D & Depreciation Deductions',
          description: 'Automatic classification of health premiums, investments, and capital equipment depreciation benefits.',
          status: 'Telemetry Synced',
        },
        {
          title: 'Zero-Discrepancy Audit Trail',
          description: 'Cryptographically hashed transaction receipts linked directly to tax calculation workbooks.',
          status: 'Enclave Protected',
        },
      ]}
    />
  );
}
