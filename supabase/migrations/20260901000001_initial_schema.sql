-- ==========================================================
-- FINFLY Schema Migration 001: Multi-Tenant Core Architecture
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organizations Table (Multi-Tenant Workspaces)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Organization Members Table (RBAC)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'auditor', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. Financial Accounts Table (Balance Sheet Ground Truth)
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'investment', 'asset', 'liability')),
    currency TEXT NOT NULL DEFAULT 'INR',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    institution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT account_ownership_check CHECK (
        (user_id IS NOT NULL AND organization_id IS NULL) OR
        (user_id IS NULL AND organization_id IS NOT NULL) OR
        (user_id IS NOT NULL AND organization_id IS NOT NULL)
    )
);

-- 5. Financial Transactions Table (General Ledger Inflows & Outflows)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer', 'settlement', 'refund')),
    category TEXT NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reconciliation Records Table (Gateway vs Bank Audit)
CREATE TABLE IF NOT EXISTS public.reconciliation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gateway_record_id TEXT NOT NULL,
    gateway_amount NUMERIC(15, 2) NOT NULL,
    gateway_status TEXT NOT NULL,
    bank_transaction_id TEXT,
    bank_amount NUMERIC(15, 2),
    match_status TEXT NOT NULL CHECK (match_status IN ('MATCHED', 'AMOUNT_DISCREPANCY', 'DUPLICATE', 'MISSING_IN_BANK', 'UNKNOWN_BANK_TXN')),
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    discrepancy_note TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Decision Traces Table (Immutable Audit Log)
CREATE TABLE IF NOT EXISTS public.decision_traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    intent TEXT NOT NULL,
    tools_used JSONB NOT NULL DEFAULT '[]'::jsonb,
    validation_status TEXT NOT NULL CHECK (validation_status IN ('STRICTLY_GROUNDED', 'PROJECTION_ESTIMATE')),
    grounded_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance & security filtering
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.financial_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_org ON public.financial_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_org ON public.reconciliation_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_decision_traces_user ON public.decision_traces(user_id);
