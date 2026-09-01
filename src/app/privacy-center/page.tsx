'use client';

import React from 'react';
import { ModuleLandingScreen } from '../../components/ModuleLandingScreen';
import { Lock } from 'lucide-react';

export default function PrivacyCenterPage() {
  return (
    <ModuleLandingScreen
      title="Privacy Center & Security Enclave"
      subtitle="Zero-knowledge architecture, bank-grade encryption, local execution guarantees, and audit trail controls."
      badge="Security & Compliance"
      icon={Lock}
      metrics={[
        { label: 'Enclave Cryptography', value: 'AES-256-GCM', change: 'Hardware Enclave', positive: true },
        { label: 'Zero-Knowledge Status', value: 'Active & Verified', change: 'No Data Leakage', positive: true },
        { label: 'Regulatory Compliance', value: 'SOC2 Type II', change: 'RBI Guidelines Compliant', positive: true },
        { label: 'Audit Log Retention', value: '7 Years Hashed', change: 'Tamper Proof' },
      ]}
      features={[
        {
          title: 'Zero-Knowledge Data Processing',
          description: 'Financial calculations and LLM prompt grounding are computed within isolated confidential enclaves.',
          status: 'Enclave Protected',
        },
        {
          title: 'Bank Feed Consent Management',
          description: 'Account Aggregator framework authorization revoking, consent duration monitoring, and token refresh.',
          status: 'Telemetry Synced',
        },
        {
          title: 'Tamper-Evident Immutable Audit Log',
          description: 'Every financial state transition and AI agent action is cryptographically signed and logged.',
          status: 'Ready for Phase 2',
        },
      ]}
    />
  );
}
