import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { FinanceControllerOrchestrator } from '../../../lib/finance-controller-orchestrator';
import { personalData, businessData, FinancialOverview } from '../../../lib/mock-data';
import { computeRealOverview, mapDbTransactionToRecord } from '../../../store/useStore';
import { insertDecisionTrace } from '../../../lib/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isConfigured = Boolean(
      supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== 'https://your-project-id.supabase.co' &&
      supabaseUrl.startsWith('https://')
    );

    // 1. Authenticate Request
    let authenticatedUserId: string | null = null;
    let authUser: any = null;

    if (isConfigured) {
      const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Read-only in route handler auth check
          },
        },
      });

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (user && !authError) {
        authenticatedUserId = user.id;
        authUser = user;
      }
    }

    // Check development demo cookie fallback
    const hasDevSession = request.cookies
      .getAll()
      .some(
        (c) =>
          (c.name.startsWith('sb-') && c.name.includes('-auth-token')) ||
          c.name === 'finfly_session' ||
          c.name === 'sb-finfly-auth-token'
      );

    const isProduction = process.env.NODE_ENV === 'production';

    if (!authenticatedUserId && !hasDevSession) {
      if (isProduction) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Please sign in to consult Finance Controller.' },
          { status: 401 }
        );
      }
    }

    // 2. Parse & Validate Request Body
    const body = await request.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    const mode: 'PERSONAL' | 'BUSINESS' = body.mode === 'BUSINESS' ? 'BUSINESS' : 'PERSONAL';
    const clientDataMode: 'REAL' | 'DEMO' | 'EMPTY' = body.dataMode || (authenticatedUserId ? 'REAL' : 'DEMO');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required and cannot be empty.' },
        { status: 400 }
      );
    }

    // 3. Resolve Scoped Financial Data according to Data Mode & Tenant Isolation
    let effectiveOverview: FinancialOverview;
    let effectiveTransactions: any[] = [];
    let effectiveDataMode: 'REAL' | 'DEMO' | 'EMPTY' = clientDataMode;

    if (effectiveDataMode === 'DEMO') {
      // Strictly isolate synthetic sandbox
      effectiveOverview = mode === 'PERSONAL' ? personalData : businessData;
    } else if (effectiveDataMode === 'EMPTY') {
      // Strictly zero records
      effectiveOverview = {
        netPosition: 0,
        cash: 0,
        investments: 0,
        assets: 0,
        liabilities: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlySurplus: 0,
        savingsRate: 0,
        healthScore: 0,
      };
    } else {
      // REAL Mode: Scope data strictly to authenticated user
      if (authenticatedUserId && isConfigured) {
        const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        });

        // Fetch user-scoped accounts and transactions
        const [accountsRes, txRes] = await Promise.all([
          supabase.from('financial_accounts').select('*').eq('user_id', authenticatedUserId),
          supabase.from('transactions').select('*, account:financial_accounts(name)').eq('user_id', authenticatedUserId),
        ]);

        const dbAccounts = accountsRes.data || [];
        const dbTransactions = txRes.data || [];

        if (dbAccounts.length === 0 && dbTransactions.length === 0) {
          effectiveDataMode = 'EMPTY';
          effectiveOverview = {
            netPosition: 0,
            cash: 0,
            investments: 0,
            assets: 0,
            liabilities: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            monthlySurplus: 0,
            savingsRate: 0,
            healthScore: 0,
          };
        } else {
          const mappedTxns = dbTransactions.map(mapDbTransactionToRecord);
          effectiveTransactions = mappedTxns;
          effectiveOverview = computeRealOverview(dbAccounts, mappedTxns, mode);
        }
      } else {
        // Fallback to client-provided overview if authenticated dev mode, or demo
        effectiveOverview = body.overview || (mode === 'PERSONAL' ? personalData : businessData);
      }
    }

    // 4. Invoke Finance Controller Orchestrator
    const controllerResponse = await FinanceControllerOrchestrator.processQuery(
      query,
      mode,
      effectiveOverview,
      {
        dataMode: effectiveDataMode,
        transactions: effectiveTransactions,
        skipLLM: false,
      }
    );

    // 5. Asynchronous Audit Logging (Decision Trace) to Supabase for Authenticated Users
    if (authenticatedUserId && effectiveDataMode !== 'DEMO') {
      insertDecisionTrace({
        id: `dt_${Date.now()}`,
        trace_id: controllerResponse.id,
        user_id: authenticatedUserId,
        organization_id: null,
        query: controllerResponse.query,
        intent: controllerResponse.intent,
        tools_used: controllerResponse.decisionTrace.toolsUsed,
        validation_status: controllerResponse.decisionTrace.validationStatus,
        grounded_metrics: controllerResponse.decisionTrace.groundedMetrics,
        created_at: new Date().toISOString(),
      }).catch((err) => {
        console.warn('[Consult CA] Asynchronous Decision Trace audit logging error:', err?.message || err);
      });
    }

    // 6. Return Verified Controller Response
    return NextResponse.json({
      success: true,
      data: controllerResponse,
      dataMode: effectiveDataMode,
    });
  } catch (err: any) {
    console.error('[API /api/consult-ca] Server error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'An unexpected error occurred while consulting Finance Controller.',
      },
      { status: 500 }
    );
  }
}
