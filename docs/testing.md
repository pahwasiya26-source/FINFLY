# FINFLY Testing & Verification Guide

## 1. Overview of Test Architecture

FINFLY employs a multi-tiered verification pipeline designed to ensure that no financial engine miscalculates, no route breaks, and no unauthorized data access occurs.

```
┌────────────────────────────────────────────────────────┐
│                   FINFLY Test Suite                    │
├────────────────────────────────────────────────────────┤
│ 1. Deterministic Math & Simulation Unit Tests          │
│ 2. AI Controller Grounding & Decision Trace Tests      │
│ 3. Supabase Client & Server Enclave Security Tests     │
│ 4. Route Health & Rendering Verification (20 Routes)   │
│ 5. TypeScript Static Typecheck (Strict Mode)           │
│ 6. Production Static Page Generation (Next.js Build)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Test Commands & Scripts

### Run All Unit & Security Tests
```bash
npm test
# Equivalent to: npx tsx --test tests/*.test.mjs
```

### Run Mathematical Proof Verification
```bash
npx tsx scripts/verify-financial-math.mjs
```

### Run TypeScript Strict Typecheck
```bash
npx tsc --noEmit
```

### Run Next.js Production Build Validation
```bash
npm run build
```

### Run HTTP Route Verification (Requires Dev Server running)
```bash
npm run dev
# In another terminal:
npm run verify
# Equivalent to: node scripts/verify-all.mjs
```

---

## 3. Test Suites & Coverage

### Suite 1: `tests/deterministic-engines.test.mjs`
- **`DigitalTwinEngine` Linear Trajectory**: Validates 12-month projections against pure linear math (`Cash + Months * Surplus`).
- **`DigitalTwinEngine` Non-Linear Levers**: Validates simultaneous addition and multiplier variable combinations.
- **`computeRunway`**: Validates surplus calculation (buffer months) vs net burn calculation (depletion runway).
- **`getFinancialOverview`**: Confirms personal and enterprise ground-truth figures.
- **`runReconciliationAudit`**: Validates two-way matching, 5 INR MDR fee discrepancy identification, and duplicate webhook capture.
- **`calculateTaxProjection`**: Validates FY 2024-25 Indian Income Tax slabs, Section 87A rebate for income <= 7L, and 4% cess.
- **`FinanceControllerOrchestrator`**: Validates that all AI responses produce strictly grounded `DecisionTraceEntry` structures.

### Suite 2: `tests/auth-security.test.mjs`
- **Unconfigured Fallback Verification**: Confirms client handles missing credentials safely without unhandled rejections.
- **Server Enclave Guard**: Validates that attempting to call `getSupabaseAdminClient()` in a simulated browser environment throws a security violation error.
- **Server Client Isolation**: Validates `getSupabaseServerClient()` handles missing env vars safely in development.
