# FINEXFLY System Architecture

## 1. Architectural Philosophy

FINEXFLY is built on a fundamental principle:
> **The AI plans, reasons about context, and explains. Deterministic code performs financial calculations.**

Large Language Models (LLMs) are statistical text generators, not arithmetic engines. In FINEXFLY, LLMs are never permitted to compute or invent financial numbers. All balance sheet aggregations, forward cash simulations, runway projections, and tax estimates originate from verifiable, pure TypeScript and SQL calculation engines.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                            │
│  - Next.js 16 App Router (React 19 + Turbopack)                        │
│  - Cinematic Glassmorphism Design System (globals.css Tokens)          │
│  - Interactive 3D Financial Nexus (Three.js / React Three Fiber)       │
│  - Personal / Business Dual-Ledger View Switcher                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   AI Finance Controller & Orchestrator                 │
│  - Intent Recognition (Query / Explain / Audit / Simulate / Tax)       │
│  - Deterministic Tool Invocations (Strict Read-Only)                   │
│  - Zero-Hallucination Grounding Validator                              │
│  - Immutable Append-Only Decision Trace Logger                         │
│  - Human-in-the-Loop Staged Proposals (No autonomous state mutation)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Deterministic Financial Computation                   │
│  - DigitalTwinEngine (12-Month Cashflow Trajectory Simulation)         │
│  - Two-Way Reconciliation Ledger Matcher (Razorpay vs Bank)            │
│  - Statutory Tax Projection Slab Calculator (FY 2024-25 Indian Slabs)  │
│  - Treasury Runway & Working Capital Equation Engine                   │
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

## 2. Core Modules & Engine Breakdown

### A. Financial Digital Twin (`DigitalTwinEngine`)
- **Location**: `src/lib/digital-twin-engine.ts`
- **Purpose**: Forward-looking, multi-period cashflow simulation.
- **Formulas**:
  - `Month(1).Cash = InitialCash + (AdjustedRevenue(1) - AdjustedExpenses(1)) + ImmediateCashAdjustments`
  - `Month(N).Cash = Month(N-1).Cash + (AdjustedRevenue(N) - AdjustedExpenses(N))`
- **Levers Supported**:
  - Variable Additions (e.g. `+₹50,000/mo` for new hire)
  - Variable Multipliers (e.g. `1.15x` for 15% revenue expansion)
  - Immediate Capital Infusions / Outflows (`target: 'cash'`)

### B. AI Finance Controller (`FinanceControllerOrchestrator`)
- **Location**: `src/lib/finance-controller-orchestrator.ts` & `src/lib/finance-tools.ts`
- **Purpose**: Natural-language query interface with cryptographic verification and zero hallucination.
- **Auditability**: Every query produces an immutable `DecisionTraceEntry` with trace ID, timestamp, intent classification, executed tool list, inputs, raw outputs, and formula bindings.
- **Read-Only Safety**: Any suggested action (e.g. loading a scenario into Digital Twin or approving a reconciliation match) is returned as a `stagedAction` requiring explicit human button authorization.

### C. Two-Way Reconciliation Engine
- **Location**: `src/lib/finance-tools.ts` (`runReconciliationAudit`) & `src/app/reconciliation/page.tsx`
- **Purpose**: Automated matching of payment gateway capture webhooks against bank credit settlements.
- **Discrepancy Detection**:
  - Exact match (`100% confidence`)
  - Amount variance / MDR fee deduction (`85% confidence`, flags 1-5% gateway transaction processing fees)
  - Duplicate webhook callbacks (identifies multiple gateway records for single bank credit)
  - Missing in bank (captured payment with no bank settlement)
  - Unrecognized bank deposit (bank credit with no gateway transaction)

### D. Dual Personal & Business Financial Matrices
- **Location**: `src/store/useStore.ts` & `src/lib/mock-data.ts`
- **Personal Mode**: Liquid cash, investments & fixed assets, car loans/liabilities, monthly savings velocity, emergency fund goal runway.
- **Business Mode**: Monthly enterprise revenue, OPEX burn rate, accounts receivable (DSO aging audit), accounts payable, working capital runway.

---

## 3. Directory Layout

```
FINFLY/
├── docs/                      # Technical Documentation
│   ├── architecture.md        # System design & mathematical specifications
│   ├── security.md            # Threat model, RLS policies, key management
│   ├── testing.md             # Automated test suite and verification runners
│   ├── decisions.md           # Architecture Decision Records (ADRs)
│   └── roadmap.md             # Future milestones and enterprise roadmap
├── public/                    # Static Assets (Logos, icons)
├── scripts/                   # Automated Verification & Inspection Runners
│   ├── verify-all.mjs         # HTTP Route verification script
│   └── verify-financial-math.mjs # Mathematical proof runner
├── src/
│   ├── app/                   # Next.js App Router Pages (20 Routes)
│   │   ├── finance-controller/# AI Controller Command Center
│   │   ├── financial-twin/    # Deterministic Digital Twin workspace
│   │   ├── reconciliation/    # Gateway & Bank Reconciliation
│   │   ├── money-flow/        # Monthly cash flow pipeline
│   │   ├── investments/       # Capital asset distribution
│   │   ├── business/          # Enterprise balance sheet
│   │   ├── taxes/             # Advance tax & statutory projections
│   │   ├── login/             # Supabase Authentication & Sign Up
│   │   ├── layout.tsx         # Global Root Layout with AuthProvider
│   │   └── page.tsx           # Main Command Center Dashboard
│   ├── components/            # Reusable UI & 3D Components
│   │   ├── AnimatedNumber.tsx # Eased counter animation
│   │   ├── AppShell.tsx       # Desktop sidebar & topbar navigation
│   │   ├── CalculationPanel.tsx # Interactive math proof popover
│   │   └── ThreeFinancialCore.tsx # Interactive 3D WebGL nexus
│   ├── lib/
│   │   ├── auth/              # AuthContext & user session listeners
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
