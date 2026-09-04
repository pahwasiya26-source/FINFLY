# FINEXFLY Security & Compliance Architecture

## 1. Security Core Principles

FINEXFLY is designed to handle sensitive personal and enterprise financial data. Security is not an afterthought; it is built into the architecture at the protocol level:

1. **Deterministic Mathematical Grounding**: Financial figures are never generated probabilistically by AI. All numbers are computed deterministically.
2. **Strict Multi-Tenant Row Level Security (RLS)**: PostgreSQL enforces complete isolation at the database layer. No user can access another user's personal accounts or an organization they do not belong to.
3. **No Service-Role Key in Browser**: The `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side enclaves with runtime environment assertions.
4. **Human-in-the-Loop Safeguards**: The AI Finance Controller is read-only. It cannot mutate ledgers, trigger payouts, or apply budget changes without explicit user authorization.
5. **Fail-Safe Production Mode**: If authentication or database configuration is missing in production, the application fails safely rather than granting unauthorized access.

---

## 2. Row Level Security (RLS) Policies

All core tables in `supabase/migrations/20260901000002_rls_policies.sql` have Row Level Security enabled:

```sql
-- Security Definer helper to check organization membership
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = target_org_id
          AND user_id = auth.uid()
    );
$$;
```

### Table Isolation Summary

| Table | Personal Data Policy | Organization Data Policy |
|---|---|---|
| `profiles` | `id = auth.uid()` | N/A |
| `organizations` | N/A | `is_org_member(id) = TRUE` |
| `organization_members` | N/A | `is_org_member(organization_id) = TRUE` |
| `financial_accounts` | `user_id = auth.uid() AND organization_id IS NULL` | `organization_id IS NOT NULL AND is_org_member(organization_id)` |
| `financial_transactions` | `user_id = auth.uid() AND organization_id IS NULL` | `organization_id IS NOT NULL AND is_org_member(organization_id)` |
| `reconciliation_records` | `user_id = auth.uid() AND organization_id IS NULL` | `organization_id IS NOT NULL AND is_org_member(organization_id)` |
| `decision_traces` | `user_id = auth.uid() AND organization_id IS NULL` | `organization_id IS NOT NULL AND is_org_member(organization_id)` |

---

## 3. Server vs Client Key Enclave

```
[Browser Client]
  └── NEXT_PUBLIC_SUPABASE_URL
  └── NEXT_PUBLIC_SUPABASE_ANON_KEY (Public JWT with RLS Enforcement)

[Server API / Route Handlers]
  └── getSupabaseServerClient(token) (Forwards user JWT to PostgreSQL)

[Server Admin Scripts / Workers]
  └── SUPABASE_SERVICE_ROLE_KEY (Privileged access, protected by assertServerEnvironment())
```

### Server Assertion Guard
```typescript
function assertServerEnvironment() {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[FINEXFLY Security Violation] Server-side Supabase client must never be initialized in the browser.'
    );
  }
}
```

---

## 4. AI Guardrails & Append-Only Decision Traces

Every interaction with the AI Finance Controller produces an immutable `DecisionTraceEntry`:
- **Grounded Verification**: All metrics must originate from an executed tool call.
- **Trace Contents**:
  - `traceId`: Cryptographically unique identifier
  - `timestamp`: ISO timestamp
  - `query`: Exact user input
  - `intent`: Classified financial intent
  - `toolsUsed`: Array of `{ toolName, inputs, outputs, formula, source }`
  - `validationStatus`: `STRICTLY_GROUNDED` or `PROJECTION_ESTIMATE`
  - `stagedAction`: Proposed action requiring human button click

---

## 5. Secret Management Checklist

- [x] `.env.local` is listed in `.gitignore` and never committed.
- [x] Only `.env.example` with dummy placeholders is committed to git.
- [x] No API keys, database connection strings, or service tokens exist in client-side code.
- [x] Automated test `tests/auth-security.test.mjs` verifies server enclave protection.
