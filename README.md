# FINEXFLY — AI Financial Operating System & Control Layer

> Traditional finance dashboards show you the past. Generic AI assistants can explain finance, but financial arithmetic needs a verifiable foundation.
>
> FINEXFLY combines deterministic financial calculations with grounded AI explanations, forward-looking simulation, and human-authorized staged actions.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-46%2F46%20Passing-brightgreen?style=flat-square)]()
[![Production Build](https://img.shields.io/badge/Build-24%2F24%20Routes-blue?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)]()
[![Live Demo](https://img.shields.io/badge/Demo-finexfly.vercel.app-purple?style=flat-square)](https://finexfly.vercel.app)

---

### 🚀 Try the Live Demo
**[Launch FINEXFLY Live Application (finexfly.vercel.app)](https://finexfly.vercel.app)**
*Instant evaluation — start in the honest EMPTY state and click **"Explore Demo Sandbox"** to evaluate all capabilities immediately with synthetic data.*

---

## 🧭 What FINEXFLY Is

**FINEXFLY** is an AI-powered financial operating system and control layer that unifies personal finance, business operations, investment tracking, cash flow intelligence, two-way reconciliation, forward scenario simulation, and AI-assisted decision support into a single, cohesive platform.

> **"FINEXFLY turns financial data into verified answers, forward-looking scenarios, and human-controlled financial decisions."**

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FRAGMENTED FINANCIAL DATA                         │
│     (Personal Accounts • Business Ledgers • Gateways • Investments)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FINEXFLY CONTROL LAYER                          │
│        (Unified Identity • Personal & Business Domain Isolation)        │
├────────────────────────────────────────────────────────────────────────┤
│  💼 Personal & Business Finance   │  📈 Investment Intelligence        │
│  💸 Money Flow & Transfer Audit   │  ⚖️ Deterministic Reconciliation   │
├────────────────────────────────────────────────────────────────────────┤
│                      DETERMINISTIC FINANCE ENGINES                     │
│   (Overview • Runway • Reconciliation • Digital Twin • Tax • Anomaly)  │
├────────────────────────────────────────────────────────────────────────┤
│                          AI FINANCE CONTROLLER                         │
│              (Natural Intent Routing • Auditable Decision Trace)        │
├────────────────────────────────────────────────────────────────────────┤
│                         FORWARD DIGITAL TWIN                           │
│                 (12-Month Deterministic Scenario Sandbox)               │
├────────────────────────────────────────────────────────────────────────┤
│                       HUMAN-CONTROLLED ACTIONS                         │
│               (Staged Action Queue • Operator Authorization)           │
└────────────────────────────────────────────────────────────────────────┘
```

FINEXFLY is not merely a transaction dashboard, an investment tracker, a reconciliation script, or a generic AI chatbot. It brings these components together into an auditable financial control system.

---

## 🎯 Problem, Solution & Innovation

### The Problem

> **"Managing money today is fragmented, reactive, and difficult to trust."**

#### A. Financial Data Is Scattered
Personal bank accounts, corporate operating accounts, payment gateway settlements, transaction streams, and investment portfolios typically live in separate, disconnected software silos. Users lack a unified control layer that synthesizes their complete financial position.

#### B. People See Transactions, Not Financial Health
Traditional dashboards display raw historical lists: account balances, transaction tables, and descriptive charts. But users make forward-looking decisions and need concrete answers to critical operational questions:
- *How long can I sustain current spending before depleting liquidity?*
- *What is our real operational burn rate?*
- *Where is capital accumulating and where is it leaking?*
- *How much liquid cash is truly unencumbered?*
- *What happens to month-12 runway if monthly expenses increase by 20%?*
- *Can the business afford a key executive hire next quarter?*
- *How is capital distributed across asset classes?*

> **"People don't have a data problem. They have a financial decision problem."**

#### C. Reconciliation Is Manual and Error-Prone
Payment gateway ledgers and bank settlement records routinely diverge due to:
- Missing settlements and unfulfilled payouts
- Duplicate webhook delivery retries
- Merchant Discount Rate (MDR) fee variances
- Direct unmapped bank credits and deposits
- Bank processing delays

Manual spreadsheet reconciliation is slow, tedious, prone to arithmetic mistakes, and lacks an auditable decision trail.

#### D. AI Creates a Trust Problem When It Calculates Finance Directly
Large Language Models excel at natural language processing, reasoning, contextual summarization, and human communication. However, **core financial arithmetic should not depend on probabilistic text generation.** Allowing an LLM to directly invent financial balances, match percentages, runway durations, or tax liabilities introduces severe risks of arithmetic drift. Users want AI-assisted explanation without letting the AI invent the financial numbers.

---

### The Solution

> **"FINEXFLY is an AI-powered financial operating system that brings personal, business, and investment finances into one intelligent control layer."**

```
User Query / Intent
        │
        ▼
Finance Controller Router
        │
        ▼
Deterministic Finance Tools ──▶ (Explicit TypeScript formulas outside LLM)
        │
        ▼
Verified Financial Outputs ──▶ (Calculated runway, balances, match rates)
        │
        ▼
AI Explanation + Decision Trace ──▶ (Grounded narrative & auditable trace)
        │
        ▼
Staged Action Proposal ──▶ (Queued recommendation)
        │
        ▼
Human Authorization ──▶ (Explicit user confirmation required)
```

#### 1. Personal Finance Management
- Track multi-account income, expenses, and liquid balances.
- Understand monthly net cash flow and recurring spending patterns.
- View unified personal net worth with domain-isolated personal records.

#### 2. Business Finance Management
- Monitor enterprise operating inflows and vendor outflows.
- Compute operational burn rate and working capital runway.
- Isolate organization-level data from personal finances via Supabase tenant structures.
- Surface actionable financial signals and working capital health indicators.

#### 3. Investment Intelligence
- Track multi-asset allocations (equities, mutual funds, gold, fixed deposits).
- Dynamic portfolio allocation percentages derived from active account balances.
- **Honest Cost Basis Disclosure**: When cost basis is recorded in account metadata (`investedAmount`), unrealized gain metrics are computed; when unrecorded, FINEXFLY explicitly states **"Cost basis unavailable"** rather than fabricating returns.

#### 4. Money Flow Intelligence
- Multi-dimensional transaction filtering across entities, accounts, and categories.
- Deterministic inflow/outflow aggregation from active ledger records.
- **Internal Transfer Handling**: Internal transfers between user accounts are categorized and excluded from new operational income calculations to prevent double-counting.

#### 5. Deterministic Reconciliation
- Evaluates gateway capture payloads against bank settlement telemetry.
- Programmatically identifies and classifies operational exceptions: MDR fee variances, duplicate webhook callbacks, missing bank deposits, and unrecognized bank credits.
- Operates on a verified 60-record synthetic benchmark modeled on Razorpay-style schemas.

#### 6. AI Finance Controller
- Natural language interface for queries such as: *"What is our runway and burn rate?"*
- Routes user intent to deterministic engines, grounded on verified financial outputs.
- Emits an **Auditable Decision Trace** documenting tools used, mathematical formulas, and validation status.

#### 7. Forward Digital Twin
- Deterministic 12-month scenario simulation sandbox.
- Tests what-if variables (revenue multipliers, cost additions, asset acquisitions) while preserving core accounting identities.
- Clearly framed as mathematical scenario simulation, not a guaranteed future forecast.

#### 8. Human-Authorized Staged Actions
- The AI Finance Controller stages proposed actions (e.g. updating scenario variables or reviewing reconciliation exceptions).
- Actions are never executed autonomously; explicit human operator authorization is required.

#### 9. REAL / DEMO / EMPTY Data Architecture
- **REAL**: User-authenticated live data backed by Supabase PostgreSQL and Row Level Security.
- **DEMO**: Explicitly activated sandbox for evaluation with synthetic benchmark datasets.
- **EMPTY**: Honest zero-data state displaying ₹0 balances with no fabricated placeholders.

---

### The Innovation

While the **Solution** defines *what* FINEXFLY does, the **Innovation** defines *why its architecture is structurally different*:

> **"Calculation and explanation are deliberately separated."**

```
Traditional AI Approach:
  User Query ─────────▶ [ Large Language Model ] ─────────▶ Financial Answer (Risk of arithmetic drift)

FINEXFLY Decoupled Architecture:
  User Query ─────────▶ [ Controller Router ]
                              │
                              ▼
                        [ Deterministic Engines ] ────────▶ Verified Numerical Truth
                              │
                              ▼
                        [ AI Explanation Layer ] ────────▶ Grounded Narrative + Decision Trace
                              │
                              ▼
                        [ Staged Action Queue ]  ────────▶ Human Authorization
```

#### Why This Separation Matters
1. **Deterministic financial calculations**: Financial formulas execute in audited TypeScript engines outside the LLM with explicit mathematical inputs.
2. **Grounded AI explanations**: The LLM receives pre-calculated metrics and synthesizes natural-language explanations strictly referencing verified outputs.
3. **Auditable Decision Traces**: Every response provides a transparent record of tools called, raw outputs, and grounding status (`STRICTLY_GROUNDED` vs. `PROJECTION_ESTIMATE`).
4. **Synthetic Razorpay-style reconciliation benchmark**: 60-record deterministic benchmark stress-tests two-way ledger verification against realistic operational edge cases.
5. **Human-authorized staged actions**: Financial operations are staged as proposals and require explicit operator confirmation before execution.
6. **REAL / DEMO / EMPTY data architecture**: Complete isolation between authenticated user data, sandbox demonstration telemetry, and honest zero-state ledgers.

---

## ⚙️ Deterministic Finance Engines

FINEXFLY implements six verified calculation modules in `src/lib/finance-tools.ts`:

### 1. Financial Overview (`getFinancialOverview`)
Aggregates cash, investment assets, fixed assets, and liabilities across personal and business scopes:
$$\text{Net Position} = \text{Cash} + \text{Investments} + \text{Assets} - \text{Liabilities}$$

### 2. Treasury Runway & Liquidity (`computeRunway`)
Computes working capital solvency based on verified monthly cash flow:
- When cash flow is positive ($\text{Inflow} \ge \text{Outflow}$):
  $$\text{Surplus Buffer (Months)} = \frac{\text{Liquid Cash}}{\text{Monthly Baseline Expenses}}$$
  *(Verified baseline: **Personal Buffer = 4.7 Months**, **Business Buffer = 3.8 Months**)*
- When operating at a deficit ($\text{Inflow} < \text{Outflow}$):
  $$\text{Runway (Months)} = \frac{\text{Liquid Cash}}{\text{Net Monthly Burn}}$$

### 3. Two-Way Reconciliation Audit (`runReconciliationAudit`)
Ingests gateway captures and bank settlement credits. Performs exact identifier matching, duplicate callback grouping, and 5% threshold variance checks for processor fees.

### 4. Digital Twin Forward Simulation (`simulateScenario` / `DigitalTwinEngine`)
Projects 12-month month-by-month cash trajectory under variable additions ($\Delta\text{Cash}$, $\Delta\text{Revenue}$, $\Delta\text{Expense}$) and multipliers ($\times\text{Revenue}$, $\times\text{OPEX}$) while strictly preserving accounting identities:
$$\text{Cash}_n = \text{Cash}_{n-1} + (\text{Revenue}_n - \text{Expenses}_n)$$

**Verified Linear Baseline Demonstration**:
- Initial Cash: **₹4,50,000**
- Monthly Net Movement: **+₹85,000 / month** (₹1,80,000 inflow − ₹95,000 outflow)
- Month 12 Balance: **₹14,70,000**
- Mathematical Proof: ₹4,50,000 + (12 × ₹85,000) = ₹14,70,000

### 5. Anomaly Detection (`detectAnomalies`)
Scans transactions for statistical variance spikes (e.g. category spending exceeding historical standard deviation thresholds) and tracks accounts receivable aging beyond 45 days.

### 6. Statutory Tax Projection (`calculateTaxProjection`)
Calculates statutory tax estimates under FY 2024-25 Indian Income Tax slabs:
- Incorporates ₹75,000 standard deduction (New Regime), Section 87A rebate (zero tax up to ₹7,00,000 taxable income), and 4% Health & Education Cess.
- **Verified Sample Calculation**:
  - Annual Gross: **₹21,60,000**
  - Standard Deduction: **₹75,000** $\to$ Taxable Base: **₹20,85,000**
  - Computed Tax + Cess: **₹3,28,120** (15.2% effective rate)
- Explicitly designated as `PROJECTION_ESTIMATE` (statutory estimate, not professional tax advice).

---

## 📊 50+ Record Deterministic Reconciliation Benchmark

FINEXFLY includes a deterministic synthetic Razorpay-style reconciliation benchmark that stress-tests two-way ledger verification.

Rather than forcing discrepancies into an artificial match, FINEXFLY classifies and surfaces every exception as a first-class financial signal:

| Metric | Result |
|---|---:|
| Gateway records | 60 |
| Bank settlement records | 58 |
| Evaluated entities | 60 |
| Matched pairs | 49 |
| Unresolved exceptions | 11 |
| **Deterministic match rate** | **81.7%** |

### Mathematical Definition
$$\text{Deterministic Match Rate} = \frac{\text{Matched Pairs}}{\text{Evaluated Entities}} \times 100 = \frac{49}{60} \times 100 = 81.7\%$$

> **"81.7% deterministic match rate across 60 evaluated gateway entities. The match rate is a reconciliation metric, not a universal accuracy claim."**

### Exception Breakdown

| Exception Category | Count | Operational Root Cause | Verified Code Example |
|---|---:|---|---|
| `MDR_FEE_VARIANCE` | 3 | Settlement amount is lower than captured amount due to payment processor Merchant Discount Rate deductions (within 5% threshold). | `setl_5E`: Gateway ₹4,900 vs bank ₹4,895 (₹5 MDR variance detected). |
| `DUPLICATE_WEBHOOK` | 2 | Gateway retry policies generated duplicate webhook callbacks for a single captured payment against one bank settlement credit. | `pay_6F`: Two gateway callbacks received against single bank credit. |
| `MISSING_IN_BANK` | 2 | Payment captured by gateway, but no corresponding settlement credit appears in bank records. | `pay_20V` & `pay_44V` captured with no bank deposit. |
| `UNKNOWN_BANK_CREDIT` | 4 | Direct bank credits (NEFT, UPI, interest) appearing on the bank statement with no corresponding gateway capture ID. | `txn_106`: Unrecognized ₹10,000 bank credit flagged for operator review. |
| **Total unresolved exceptions** | **11** | **Surfaced for human review** | — |

*(Note: 2 failed gateway captures, `pay_2B` and `pay_34K`, are excluded from settlement matching by the engine because failed attempts never produce bank deposits).*

### Why the Benchmark Matters
- **Batch processing at 50+ records**: Evaluates 60 gateway records and 58 bank settlements.
- **Deterministic matching**: Repeatable amount and identifier matching without heuristic drift.
- **Mathematical match-rate calculation**: Exact formulaic verification (`49 / 60 = 81.7%`).
- **Exception classification**: Programmatic categorization of MDR variances, duplicate callbacks, missing settlements, and unmapped bank credits.
- **Reproducible execution**: Produces identical summary structures across repeated browser and server test runs.

> **"The system does not simply display a reconciliation percentage. It exposes the underlying exceptions and their deterministic audit reasons."**

---

## 🔍 Razorpay Integration Status

> **"The current buildathon benchmark uses a deterministic synthetic dataset modeled on Razorpay-style gateway and settlement telemetry. It is not a claim of live Razorpay production API ingestion."**

### Current Implementation (Buildathon Scope)
- **Synthetic Razorpay-style gateway records**: Models Razorpay schema conventions (`id`, `amount`, `currency`, `status`, `notes`, `created_at`).
- **Synthetic bank settlement records**: Modeled after standard Indian banking statement credits and UTR settlement records.
- **Deterministic reconciliation engine**: Two-way matching algorithm comparing gateway capture payloads with bank settlement telemetry.
- **Exception classification**: Categorizes exact matches, fee deductions, duplicate webhooks, missing bank credits, and unrecognized deposits.
- **Batch benchmark**: Evaluates 60 gateway records against 58 bank records.
- **Audit findings**: Every reconciliation pair includes an auditable explanation of its classification.
- **Finance Controller grounding**: Reconciliation results are directly queryable via the AI Finance Controller with strict verification status.

### Future Integration Roadmap
- **Live Razorpay webhook ingestion**: Dedicated webhook receiver endpoint (`/api/webhooks/razorpay`).
- **Webhook signature verification**: Cryptographic HMAC-SHA256 verification using Razorpay webhook secret.
- **Persistent webhook/event storage**: Supabase PostgreSQL tables for incoming gateway events.
- **Live settlement ingestion**: Automated ingestion of Razorpay Settlement APIs and bank statement feeds.
- **Scheduled reconciliation**: Automated daily cron jobs comparing gateway events against bank statements.
- **Production reconciliation monitoring**: Automated alerts and escalation workflows for unresolved exceptions.

---

## 🛡️ Security & Trust Principles

FINEXFLY enforces strict architectural and data protection controls: Supabase authentication, Row Level Security (RLS), server-only service-role access, and personal/business tenant isolation.

1. **Deterministic Calculation, AI Explanation**: Core financial arithmetic is computed via audited TypeScript functions with explicit inputs. The AI model is strictly used to interpret and explain verified outputs.
2. **Strict Data Isolation (REAL / DEMO / EMPTY)**:
   - **REAL**: Authenticated user records persisted in Supabase PostgreSQL with strict RLS policies.
   - **DEMO**: Explicitly activated synthetic sandbox. Real database mutations are blocked in DEMO mode to prevent data contamination.
   - **EMPTY**: Honest zero-data state for new accounts with no fabricated placeholder numbers.
3. **Row Level Security (RLS)**: Personal records are scoped to `user_id = auth.uid()`, and business records require confirmed membership in `organization_members`.
4. **Server-Side Secret Protection**: Administrative tools (`getSupabaseAdminClient`) enforce server-only runtime checks (`assertServerEnvironment()`). Service-role keys are never exposed to browser bundles.
5. **Auditable Decision Traces**: Every AI response includes an auditable Decision Trace with tool execution details, formulas, and verification tags.
6. **Human Authorization**: Financial actions staged by the system require explicit human authorization before execution.
7. **Explicit Uncertainty**: Missing data remains explicitly unavailable (e.g. displaying *"Cost basis unavailable"* or returning zero values in EMPTY mode) rather than fabricating estimates.

*(Security Notice: FINEXFLY relies solely on verifiable architectural controls: Supabase authentication, Row Level Security (RLS), server-only service-role access, and personal/business tenant isolation, without unsubstantiated marketing buzzwords or uncertified compliance claims).*

---

## ⏱️ 3-Minute Judge Demo

Follow this recommended demonstration flow to evaluate FINEXFLY:

### 0:00 — Authentication & Protected Enclave
Navigate to [https://finexfly.vercel.app](https://finexfly.vercel.app). Observe protected route middleware redirecting unauthenticated requests to `/login`. Experience the authentication portal supporting Sign In, Account Creation, and Password Reset.

### 0:25 — Command Center & Data Mode Visibility
Start in the honest **EMPTY** state. Click **"Explore Demo Sandbox"** to explicitly activate **DEMO** mode. Observe the clear DEMO status badge, the personal/business toggle, and the 3D WebGL Financial Core.

### 0:50 — AI Finance Controller
Navigate to `/finance-controller`. Submit the query:
> *"What is our runway and burn rate?"*

Inspect the deterministic financial outputs (**Personal runway = 4.7 months**, net surplus +₹85,000/mo) and inspect the **Auditable Decision Trace** showing exact tool formulas, `STRICTLY_GROUNDED` status, and staged actions. *(If querying business finances, Business runway = 3.8 months).*

### 1:20 — 50+ Record Reconciliation Benchmark
Navigate to `/reconciliation`. Review the synthetic Razorpay-style benchmark:
- **60 gateway records** evaluated against **58 bank settlement records**
- **60 evaluated entities** producing **49 matched pairs**
- **11 surfaced exceptions**
- **81.7% deterministic match rate**

Inspect surfaced exception examples:
1. `setl_5E` (₹5 MDR fee variance)
2. `pay_6F` (duplicate webhook delivery)
3. `txn_106` (unrecognized ₹10,000 bank credit)

### 1:55 — Forward Digital Twin
Navigate to `/financial-twin`. Inspect the baseline vs. simulation trajectory. Review the verified mathematical demonstration:
**₹4,50,000 + (12 × ₹85,000) = ₹14,70,000**
Add an expense variable and observe the deterministic recalculation of Month 12 liquidity.

### 2:25 — Money Flow / Investments
Navigate to `/money-flow` to observe multi-dimensional ledger filtering and internal transfer handling. Navigate to `/investments` to view dynamic asset allocations and verify that missing cost basis displays **"Cost basis unavailable"** rather than fabricating returns.

### 2:45 — Human Authorization
Observe that financial actions staged by the Finance Controller require explicit operator confirmation before execution.

### 3:00 — Closing
> **"FINEXFLY doesn't let AI calculate your finances. Deterministic finance engines calculate the truth — AI explains what it means and what to do next."**

---

## 🛠️ Getting Started

### 1. Live Demo (Instant Evaluation)
**Try FINEXFLY instantly in your browser — no local setup required:**
- **Production URL**: [https://finexfly.vercel.app](https://finexfly.vercel.app)
- Start in the honest **EMPTY** state.
- Click **"Explore Demo Sandbox"** to activate the isolated evaluation environment.
- Evaluate the complete UI, financial tools, Decision Traces, and 60-record reconciliation benchmark without connecting personal accounts.

---

### 2. Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm** (or yarn / pnpm)

### 3. Installation
```bash
git clone https://github.com/pahwasiya26-source/FINFLY.git
cd FINFLY
npm install
```

### 4. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Server-only
```

> **Security Note**: `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client-side code or committed to version control. In Demo Sandbox mode, FINEXFLY allows full UI and engine testing without an external database.

### 5. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Product Routes

All routes confirmed and compiled during static production builds (`npm run build`):

| Route | Type | Description |
|---|---|---|
| `/` | Static | Executive Command Center Dashboard with 3D Financial Core |
| `/login` | Static | Authentication & User Registration Portal |
| `/finance-controller` | Static | AI Finance Controller with Auditable Decision Trace |
| `/reconciliation` | Static | Two-Way Reconciliation Audit (60-Record Benchmark) |
| `/financial-twin` | Static | 12-Month Deterministic Scenario Simulation Sandbox |
| `/money-flow` | Static | Monthly Inflow/Outflow Pipeline & Transaction Ledger |
| `/investments` | Static | Portfolio Allocation Matrix & Cost Basis Disclosures |
| `/business` | Static | Enterprise Operations, Burn Rate & Working Capital Hub |
| `/taxes` | Static | FY 2024-25 Indian Income Tax Projection Calculator |
| `/reports` | Static | Financial Variance & Executive Health Reports |
| `/personal-ca` | Static | Personal Wealth & Financial Planning Assistant |
| `/agents` | Static | Autonomous Agent Roster & Controller Status (alias `/ai-agents`) |
| `/privacy-center` | Static | Data Privacy, Governance & Consent Management (alias `/privacy`) |
| `/settings` | Static | User Profile, Organization & Preference Configuration |
| `/forgot-password` | Static | Password Recovery Request Interface |
| `/reset-password` | Static | Secure Password Reset & Token Confirmation |
| `/auth/callback` | Dynamic | Supabase Auth Code & Token Exchange Handler |
| `/digital-twin` | Static | Direct route alias for `/financial-twin` |
| `/ai-cfo` | Static | Direct route alias for `/finance-controller` |

---

## 🧪 Verification & Build Status

```bash
# 1. Run automated test suite (auth security, data mode store, deterministic engines)
npm test

# 2. Run standalone financial mathematics proof runner
node scripts/verify-financial-math.mjs

# 3. Run strict TypeScript compiler verification
npx tsc --noEmit

# 4. Run Next.js production build verification
npm run build
```

| Verification Layer | Command / Target | Status | Result |
|---|---|:---:|---|
| **Automated Tests** | `npm test` | **PASS** | **46 / 46 PASS (0 failures, 0 skipped)** across 3 test suites |
| **TypeScript Compilation** | `npx tsc --noEmit` | **PASS** | **0 compilation errors** |
| **Production Build** | `npm run build` | **PASS** | **24/24 routes generated successfully** |
| **Financial Proofs** | `node scripts/verify-financial-math.mjs` | **PASS** | 12-month Digital Twin linear trajectory verified (`₹4.5L + 12×₹85K = ₹14.7L`) |
| **Reconciliation Proof** | Built-in Engine Benchmark | **PASS** | **60 gateway / 58 bank / 60 evaluated / 49 matched / 11 exceptions (81.7% match rate)** |

*(Note: Automated testing covers unit tests, integration tests, mathematical assertions, typechecking, and production build validation. Automated browser E2E suites are not currently executed in CI).*

---

## ⚠️ Current Limitations

To maintain technical credibility, FINEXFLY explicitly discloses current system boundaries:

1. **Synthetic Reconciliation Benchmark**: The current 60-record reconciliation benchmark utilizes a deterministic synthetic dataset modeled on Razorpay-style payment and settlement structures. Live Razorpay webhook ingestion is on the production roadmap.
2. **Simulation vs. Forecasting**: Digital Twin outputs represent deterministic scenario calculations based on user-provided inputs, not guaranteed future financial outcomes.
3. **Tax Estimates**: The tax engine calculates statutory estimates based on FY 2024-25 Indian Income Tax slabs. Final tax obligations require verification with formal IT filing records and do not constitute professional tax advice.
4. **Human Authorization Requirement**: The system does not support autonomous capital allocation or direct bank mutations; all staged actions require human authorization.
5. **Testing Scope**: Automated testing covers unit, integration, math assertions, typechecking, and build validation; automated browser E2E test suites are not currently executed in CI.
6. **Invoice Persistence Scope**: In REAL mode, accounts and transactions persist to Supabase PostgreSQL; persistent database tables for commercial invoices are reserved for future schema migrations, currently displaying an honest empty state in REAL mode.

---

## 🚀 Product Roadmap

### Next (Phase 1)
- **Live Razorpay Webhook Ingestion**: Ingest live webhook events (`payment.captured`, `payment.failed`, `settlement.processed`).
- **Signature Verification**: Validate HMAC-SHA256 signatures using configured webhook secrets.
- **Settlement Ingestion**: Automated ingestion of settlement records and UTR mapping.
- **Automated Reconciliation Scheduling**: Background cron reconciliation comparing live gateway events against settlement telemetry.

### Then (Phase 2)
- **Financial Institution Integrations**: Ingestion of bank statement CSVs and Indian Account Aggregator feeds.
- **Richer Audit & Event History**: Persistent event logs tracking operator approvals, rejections, and dispute notes.
- **Expanded Forecasting**: Multi-scenario volatility modeling and stress testing.
- **Additional Business Finance Workflows**: Database-backed invoice management, vendor payouts, and receivables aging.

*(All roadmap items are future milestones).*

---

## 📄 License

MIT License. Copyright © 2026 FINEXFLY Technologies Inc.
