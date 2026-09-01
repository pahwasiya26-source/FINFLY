'use client';

import React from 'react';
import { ModuleLandingScreen } from '../../components/ModuleLandingScreen';
import { ShieldCheck } from 'lucide-react';
import { syntheticRazorpayRecords, syntheticBankTransactions } from '../../lib/reconciliation-dataset';

export default function FinanceControllerPage() {
  const totalRazorpay = syntheticRazorpayRecords.reduce((acc, r) => acc + (r.status === 'captured' ? r.amount : 0), 0);
  const totalBank = syntheticBankTransactions.reduce((acc, t) => acc + t.amount, 0);
  const discrepancyCount = 2; // e.g. MDR fee & missing record

  return (
    <ModuleLandingScreen
      title="Finance Controller & Reconciliation"
      subtitle="Automated ledger reconciliation, gateway settlement verification, and discrepancy detection."
      badge="Zero-Discrepancy"
      icon={ShieldCheck}
      metrics={[
        { label: 'Gateway Inflows', value: totalRazorpay, format: 'currency', change: '8 Records Logged' },
        { label: 'Bank Settlements', value: totalBank, format: 'currency', change: '7 Transactions' },
        { label: 'Variance Discrepancies', value: discrepancyCount, format: 'number', change: 'MDR / Unmatched Fee', positive: false },
        { label: 'Auto-Match Rate', value: '94.8%', change: 'Deterministic Accuracy', positive: true },
      ]}
      features={[
        {
          title: 'Two-Way Gateway vs Bank Settlement Audit',
          description: 'Automatic reconciliation between payment gateway capture events, refunds, and actual bank credits.',
          status: 'Telemetry Synced',
        },
        {
          title: 'MDR / Payment Processing Fee Extraction',
          description: 'Calculates exact merchant discount rates and identifies unrecorded banking transaction fees.',
          status: 'Ready for Phase 2',
        },
        {
          title: 'Duplicate & Missing Webhook Resolution',
          description: 'Identifies duplicated gateway callbacks and unmatched bank deposits with cryptographic idempotency checks.',
          status: 'Enclave Protected',
        },
      ]}
    />
  );
}
