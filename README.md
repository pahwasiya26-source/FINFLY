<div align="center">

# ⚡ FINFLY — AI Financial Operating System

**Deterministic Financial Intelligence, Forward Digital Twin & Enterprise Money Flow Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)]()

</div>

---

## 🎯 The Problem FINFLY Solves

Modern financial software suffers from two critical flaws:
1. **Generic Static Dashboards**: Backward-looking accounting software displays historical transactions but fails to provide forward-looking predictive simulation or intelligent reasoning.
2. **Hallucination-Prone AI Tools**: Generative AI assistants attempt to perform arithmetic probabilistically, resulting in fabricated numbers, inaccurate runway calculations, and dangerous financial advice.

**FINFLY resolves this with a decoupled architecture:**
> **The AI plans, reasons about context, and explains. Deterministic code performs all financial calculations.**

---

## 🚀 Key Features

- 🧠 **AI Finance Controller (`/finance-controller` & `/ai-cfo`)**: Natural-language financial intelligence that translates user queries into deterministic tool calls with verifiable, zero-hallucination Decision Traces.
- 🔮 **Financial Digital Twin (`/financial-twin`)**: 12-month deterministic cashflow simulation engine enabling interactive variable testing (hiring costs, revenue multipliers, capital additions).
- ⚖️ **Two-Way Reconciliation Engine (`/reconciliation`)**: Automated settlement matching between payment gateway telemetry (Razorpay) and bank credit statements, with MDR fee variance and duplicate detection.
- 🌊 **Money Flow Architecture (`/money-flow`)**: Real-time pipeline visualizer mapping monthly inflows, liquidity reserves, and capital allocation.
- 🏢 **Personal & Business Dual-Ledger View**: One-click toggle between Personal Wealth (savings rates, goals, liabilities) and Enterprise Operations (OPEX burn, accounts receivable aging, runway buffer).
- 🛡️ **Multi-Tenant Security & PostgreSQL RLS**: Data isolated at the database layer using Supabase Row Level Security policies.
- 🌐 **Cinematic 3D WebGL Interface**: High-performance Three.js financial nexus visualizing live capital dimensions.
- 🌓 **Atmospheric Theme Engine**: Dynamic Light & Dark themes with tailored glassmorphic tokens.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                            │
│  - Next.js 16 App Router (React 19 + Turbopack)                        │
│  - Custom Glassmorphism Design Tokens (globals.css)                    │
│  - Interactive 3D WebGL Nexus (Three.js / React Three Fiber)           │
│  - Personal / Business Dual-Mode Dynamic Switcher                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   AI Finance Controller & Orchestrator                 │
│  - Intent Classifier (Runway, Reconciliation, Scenario, Tax, Anomaly) │
│  - Deterministic Tool Invocations (Strict Read-Only)                   │
│  - Zero-Hallucination Grounding Validator                              │
│  - Immutable Append-Only Decision Trace Logger                         │
│  - Human-in-the-Loop Staged Proposals (No unauthorized mutations)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Deterministic Financial Computation                   │
│  - DigitalTwinEngine (12-Month Forward Cashflow Trajectory)            │
│  - Two-Way Reconciliation Ledger Matcher (Gateway vs Bank Statement)  │
│  - Statutory Tax Projection Slab Calculator (FY 2024-25 Indian Slabs)  │
│  - Working Capital Runway & Solvency Equations                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Backend & Persistence Foundation                     │
│  - Supabase (PostgreSQL 15+ with Row Level Security)                   │
│  - Multi-Tenant Isolation (Profiles, Organizations, Roster RBAC)       │
│  - Client/Server Enclaves (Strict Isolation of Service Role Keys)      │
│  - Development Demo Fallback Mode (Zero-Friction Local Testing)        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security, Authentication & Row Level Security (RLS)

FINFLY enforces bank-grade security guardrails:

1. **PostgreSQL Row Level Security**: All financial tables (`financial_accounts`, `financial_transactions`, `reconciliation_records`, `decision_traces`) require authentication.
   - **Personal accounts**: `user_id = auth.uid() AND organization_id IS NULL`
   - **Enterprise accounts**: `organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())`
2. **Client/Server Key Enclave**:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Safe for public browser use, governed by RLS.
   - `SUPABASE_SERVICE_ROLE_KEY`: Strictly confined to server-side administrative code, blocked from client bundle via runtime assertion guards (`assertServerEnvironment()`).
3. **Session Persistence**: Automated session refresh and route guards via `src/middleware.ts` and `src/lib/auth/AuthContext.tsx`.

---

## 📂 Project Structure

```
FINFLY/
├── docs/                      # Technical Documentation & ADRs
│   ├── architecture.md        # Mathematical specifications & architecture
│   ├── security.md            # Threat model, RLS policies, key management
│   ├── testing.md             # Automated test suite and verification runners
│   ├── decisions.md           # Architecture Decision Records (ADRs)
│   └── roadmap.md             # Completed foundations & future milestones
├── public/                    # Static Assets & Icons
├── scripts/                   # Verification Scripts
│   ├── verify-all.mjs         # Automated 20-route HTTP verification
│   └── verify-financial-math.mjs # Standalone mathematical proof runner
├── src/
│   ├── app/                   # Next.js 16 App Router Routes
│   │   ├── finance-controller/# AI Controller Command Center
│   │   ├── financial-twin/    # Deterministic Digital Twin workspace
│   │   ├── reconciliation/    # Two-Way Gateway vs Bank Reconciliation
│   │   ├── money-flow/        # Monthly cash flow pipeline
│   │   ├── investments/       # Asset allocation matrix
│   │   ├── business/          # Enterprise ledger
│   │   ├── taxes/             # Statutory tax projections
│   │   ├── login/             # Authentication & Sign Up
│   │   ├── layout.tsx         # Root Layout with AuthProvider
│   │   └── page.tsx           # Main Command Center Dashboard
│   ├── components/            # Reusable UI & 3D WebGL Components
│   ├── lib/
│   │   ├── auth/              # AuthContext & Session management
│   │   ├── supabase/          # Client & Server Supabase abstractions
│   │   ├── digital-twin-engine.ts # Deterministic simulation class
│   │   ├── finance-tools.ts   # Deterministic compute tools
│   │   ├── finance-controller-orchestrator.ts # Zero-hallucination agent
│   │   └── mock-data.ts       # Ground truth personal & business ledgers
│   ├── middleware.ts          # Route protection & session validation
│   └── store/                 # Zustand Global State
├── supabase/
│   ├── migrations/            # Version-controlled PostgreSQL SQL migrations
│   │   ├── 20260901000001_initial_schema.sql
│   │   └── 20260901000002_rls_policies.sql
│   └── seeds/                 # Ground-truth synthetic SQL seeder
│       └── seed_synthetic_data.sql
├── tests/                     # Automated Test Suites
│   ├── deterministic-engines.test.mjs # Math & engine tests
│   └── auth-security.test.mjs # Auth & enclave tests
├── .env.example               # Environment variable documentation
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ recommended
- **npm** or **yarn** / **pnpm**

### 2. Installation
```bash
git clone https://github.com/pahwasiya26-source/FINFLY.git
cd FINFLY
npm install
```

### 3. Environment Configuration
Copy the template to `.env.local`:
```bash
cp .env.example .env.local
```

> **Note**: In development mode (`NODE_ENV=development`), if Supabase keys are not set, FINFLY automatically activates **Demo Fallback Mode** (`siya.pahwa@finfly.ai`), allowing complete local evaluation of all UI components, simulations, and financial tools without configuring a remote database.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

FINFLY includes an automated test suite verifying mathematical engines, security enclaves, and route rendering:

```bash
# Run all unit and security tests
npm test

# Run deterministic mathematical proof verifier
npx tsx scripts/verify-financial-math.mjs

# Run strict TypeScript typecheck
npx tsc --noEmit

# Run production Next.js build validation
npm run build

# Run automated HTTP route health check (with dev server running)
npm run verify
```

---

## ⚠️ Current Limitations & Demo-Data Disclaimer

- **Synthetic Data**: The baseline balances, transactions, and reconciliation records in the current build are deterministic synthetic datasets designed for evaluation.
- **Tax Calculations**: Tax calculations are projections based on standard FY 2024-25 Indian Income Tax slabs (New vs Old regime) and should be verified with formal tax filing records.
- **Read-Only Agent Guardrails**: The AI Finance Controller operates in a strict read-only enclave. Actions (such as applying scenarios to the Digital Twin or approving a reconciliation item) are staged proposals requiring explicit user button authorization.

---

## 📄 License

MIT License. Copyright (c) 2026 FINFLY Technologies Inc.
