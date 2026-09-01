-- ==========================================================
-- FINFLY Schema Migration 002: Row Level Security (RLS) Policies
-- ==========================================================

-- Enable Row Level Security on all core financial tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_traces ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- Helper Security Functions
-- ----------------------------------------------------------

-- Check if authenticated user belongs to an organization
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

-- Check if authenticated user has admin/owner role in an organization
CREATE OR REPLACE FUNCTION public.is_org_admin(target_org_id UUID)
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
          AND role IN ('owner', 'admin')
    );
$$;

-- ----------------------------------------------------------
-- 1. Profiles Table Policies
-- ----------------------------------------------------------
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- ----------------------------------------------------------
-- 2. Organizations Table Policies
-- ----------------------------------------------------------
CREATE POLICY "Members can view their organizations"
    ON public.organizations FOR SELECT
    USING (public.is_org_member(id));

CREATE POLICY "Admins can update their organizations"
    ON public.organizations FOR UPDATE
    USING (public.is_org_admin(id));

-- ----------------------------------------------------------
-- 3. Organization Members Policies
-- ----------------------------------------------------------
CREATE POLICY "Members can view organization roster"
    ON public.organization_members FOR SELECT
    USING (public.is_org_member(organization_id));

CREATE POLICY "Admins can manage organization members"
    ON public.organization_members FOR ALL
    USING (public.is_org_admin(organization_id));

-- ----------------------------------------------------------
-- 4. Financial Accounts Policies (Personal vs Org Isolation)
-- ----------------------------------------------------------
CREATE POLICY "Users can access their personal or organizational accounts"
    ON public.financial_accounts FOR SELECT
    USING (
        (user_id = auth.uid() AND organization_id IS NULL) OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    );

CREATE POLICY "Users can modify their personal or organizational accounts"
    ON public.financial_accounts FOR ALL
    USING (
        (user_id = auth.uid() AND organization_id IS NULL) OR
        (organization_id IS NOT NULL AND public.is_org_admin(organization_id))
    );

-- ----------------------------------------------------------
-- 5. Financial Transactions Policies
-- ----------------------------------------------------------
CREATE POLICY "Users can view their personal or organizational transactions"
    ON public.financial_transactions FOR SELECT
    USING (
        (user_id = auth.uid() AND organization_id IS NULL) OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    );

CREATE POLICY "Users can insert/modify transactions"
    ON public.financial_transactions FOR ALL
    USING (
        (user_id = auth.uid() AND organization_id IS NULL) OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    );

-- ----------------------------------------------------------
-- 6. Reconciliation Records Policies
-- ----------------------------------------------------------
CREATE POLICY "Users can view reconciliation records"
    ON public.reconciliation_records FOR SELECT
    USING (
        (user_id = auth.uid() AND organization_id IS NULL) OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    );

CREATE POLICY "Users and auditors can update reconciliation records"
    ON public.reconciliation_records FOR UPDATE
    USING (
        (user_id = auth.uid() AND organization_id IS NULL) OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    );

-- ----------------------------------------------------------
-- 7. Decision Traces Policies (Immutable Audit Trail)
-- ----------------------------------------------------------
CREATE POLICY "Users can view their decision traces"
    ON public.decision_traces FOR SELECT
    USING (
        (user_id = auth.uid() AND organization_id IS NULL) OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    );

CREATE POLICY "Users can append decision traces"
    ON public.decision_traces FOR INSERT
    WITH CHECK (
        (user_id = auth.uid()) OR
        (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    );
