-- ==========================================================
-- FINFLY Synthetic Data Seeder
-- Seeds initial ground-truth personal and enterprise ledgers
-- ==========================================================

DO $$
DECLARE
    demo_user_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
    demo_org_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
    p_cash_acc UUID := '10000000-0000-0000-0000-000000000001'::UUID;
    b_cash_acc UUID := '20000000-0000-0000-0000-000000000001'::UUID;
BEGIN
    -- 1. Insert Demo Profile
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        demo_user_id,
        'siya.pahwa@finfly.ai',
        'Siya Pahwa',
        'https://avatars.githubusercontent.com/u/1?v=4'
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;

    -- 2. Insert Demo Organization
    INSERT INTO public.organizations (id, name, slug)
    VALUES (
        demo_org_id,
        'FINFLY Technologies Inc.',
        'finfly-tech'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Organization Membership
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (
        demo_org_id,
        demo_user_id,
        'owner'
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE
    SET role = 'owner';

    -- 4. Insert Personal Financial Accounts (Matches personalData)
    INSERT INTO public.financial_accounts (id, user_id, organization_id, name, account_type, currency, balance, institution)
    VALUES
        (p_cash_acc, demo_user_id, NULL, 'HDFC Salary & Sweep Checking', 'cash', 'INR', 450000.00, 'HDFC Bank'),
        (gen_random_uuid(), demo_user_id, NULL, 'Zerodha Multi-Asset Portfolio', 'investment', 'INR', 1250000.00, 'Zerodha'),
        (gen_random_uuid(), demo_user_id, NULL, 'Primary Residential Property Equity', 'asset', 'INR', 2800000.00, 'Property Registry'),
        (gen_random_uuid(), demo_user_id, NULL, 'ICICI Vehicle & Secured Loan', 'liability', 'INR', 1000000.00, 'ICICI Bank')
    ON CONFLICT (id) DO NOTHING;

    -- 5. Insert Business Financial Accounts (Matches businessData)
    INSERT INTO public.financial_accounts (id, user_id, organization_id, name, account_type, currency, balance, institution)
    VALUES
        (b_cash_acc, NULL, demo_org_id, 'Kotak Main Operating Treasury', 'cash', 'INR', 3200000.00, 'Kotak Mahindra Bank'),
        (gen_random_uuid(), NULL, demo_org_id, 'Corporate Liquid Yield & Debt Fund', 'investment', 'INR', 5000000.00, 'SBI Mutual Fund'),
        (gen_random_uuid(), NULL, demo_org_id, 'IT Infrastructure & Equipment Assets', 'asset', 'INR', 8500000.00, 'Fixed Assets Ledger'),
        (gen_random_uuid(), NULL, demo_org_id, 'Enterprise Equipment Credit Facility', 'liability', 'INR', 4200000.00, 'Axis Bank')
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Synthetic Reconciliation Records
    INSERT INTO public.reconciliation_records (organization_id, gateway_record_id, gateway_amount, gateway_status, bank_transaction_id, bank_amount, match_status, confidence_score, discrepancy_note)
    VALUES
        (demo_org_id, 'pay_1A', 5000.00, 'captured', 'txn_101', 5000.00, 'MATCHED', 100.00, 'Exact settlement match found in bank ledger'),
        (demo_org_id, 'rfnd_3C', 2000.00, 'processed', 'txn_102', -2000.00, 'MATCHED', 100.00, 'Refund settled and debited correctly'),
        (demo_org_id, 'setl_5E', 4900.00, 'processed', 'txn_104', 4895.00, 'AMOUNT_DISCREPANCY', 85.00, 'Difference of ₹5 flagged as merchant discount fee (MDR)'),
        (demo_org_id, 'pay_6F', 3000.00, 'captured', 'txn_105', 3000.00, 'DUPLICATE', 75.00, 'Duplicate gateway callback received for single bank credit');

    -- 7. Insert Initial Decision Trace
    INSERT INTO public.decision_traces (trace_id, user_id, organization_id, query, intent, tools_used, validation_status, grounded_metrics)
    VALUES (
        'trace_init_001',
        demo_user_id,
        demo_org_id,
        'What is our enterprise runway buffer?',
        'RUNWAY_AND_LIQUIDITY_ANALYSIS',
        '[{"toolName": "computeRunway", "inputs": {"cash": 3200000, "monthlyExpenses": 850000, "monthlyIncome": 1200000}, "formula": "Buffer = Cash / Expenses", "source": "General Ledger"}]'::jsonb,
        'STRICTLY_GROUNDED',
        '[{"label": "Liquid Cash", "value": "₹32,00,000"}, {"label": "Runway Buffer", "value": "9.2 Months"}]'::jsonb
    );

END $$;
