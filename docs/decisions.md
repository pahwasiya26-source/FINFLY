# FINEXFLY Architecture Decision Records (ADRs)

## ADR 001: Decoupling AI Reasoning from Deterministic Financial Computation

- **Status**: Accepted
- **Context**: LLMs generate text probabilistically and frequently make arithmetic errors (hallucinations) when performing multi-step financial math, compounding interest, or tax slab calculations.
- **Decision**: The LLM is strictly used as an intent parser, planner, and verbalizer. All calculations are executed by pure TypeScript/SQL engines (`DigitalTwinEngine`, `finance-tools.ts`).
- **Consequences**: Deterministic mathematical grounding. Every number presented in the UI or AI chat is backed by deterministic code and auditable proofs.

---

## ADR 002: Multi-Tenant Row Level Security with PostgreSQL & Supabase

- **Status**: Accepted
- **Context**: Financial platforms must strictly prevent data leakage between individual users and enterprise organizations.
- **Decision**: Implement PostgreSQL Row Level Security (RLS) policies on all tables (`profiles`, `organizations`, `financial_accounts`, `financial_transactions`, `reconciliation_records`, `decision_traces`) backed by `auth.uid()` and `is_org_member()` security functions.
- **Consequences**: Security is enforced at the database layer; application bugs cannot cause multi-tenant data leaks.

---

## ADR 003: Graceful Development Demo Fallback Mode

- **Status**: Accepted
- **Context**: Developers, evaluators, and reviewers need to inspect UI layouts, animations, and deterministic math without setting up a remote Supabase project immediately.
- **Decision**: If Supabase environment variables are absent in development mode (`process.env.NODE_ENV !== 'production'`), the app falls back to a verified local demo mode (`siya.pahwa@finexfly.ai`). In production mode, it fails safely.
- **Consequences**: Zero-friction developer onboarding while strictly protecting production deployments.

---

## ADR 004: Scoped CSS & Custom Design Tokens over Tailwind Utility Clutter

- **Status**: Accepted
- **Context**: FINEXFLY requires bespoke glassmorphic depth, atmospheric light layers, and high-frequency animations (3D Nexus, animated counters). Heavy utility frameworks introduce bloat and rigid styling constraints.
- **Decision**: Use scoped CSS and centralized design tokens in `globals.css` (`--bg-surface-glass`, `--accent-primary`, `--border-strong`, etc.).
- **Consequences**: Instant theme switching, lightweight bundle size, and tailored fintech visual aesthetics.

---

## ADR 005: Append-Only Structured Decision Traces vs Hidden Chain-of-Thought

- **Status**: Accepted
- **Context**: Financial regulators and users require transparent reasoning for automated financial advice, but raw LLM chain-of-thought dumps can be messy, ungrounded, or leak system prompts.
- **Decision**: Structure every reasoning output into an immutable `DecisionTraceEntry` containing: query, classified intent, deterministic tools invoked with inputs/outputs, validation status, and source ledgers.
- **Consequences**: Audit-compliant, transparent, and reproducible financial recommendations.
