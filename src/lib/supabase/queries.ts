/**
 * FINEXFLY Supabase Query Functions
 * Pure async functions — no React, no hooks.
 * Uses the authenticated user's session and RLS policies as the security boundary.
 */
import { getSupabaseBrowserClient } from './client';

// ────────────────────────────────────────────────────────────────────────────
// Shared Database Models & Types
// ────────────────────────────────────────────────────────────────────────────

export interface DbProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DbOrganization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrgMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'auditor' | 'member';
  created_at: string;
  organization?: DbOrganization;
}

export interface DbAccount {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  name: string;
  account_type: 'cash' | 'investment' | 'asset' | 'liability';
  currency: string;
  balance: number;
  institution: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DbTransaction {
  id: string;
  account_id: string;
  user_id: string | null;
  organization_id: string | null;
  amount: number;
  transaction_type: 'income' | 'expense' | 'transfer' | 'settlement' | 'refund';
  category: string;
  description: string | null;
  transaction_date: string;
  metadata: Record<string, any>;
  created_at: string;
  account?: { name: string; account_type: string } | null;
}

export interface DbReconciliationRecord {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  gateway_record_id: string;
  gateway_amount: number;
  gateway_status: string;
  bank_transaction_id: string | null;
  bank_amount: number | null;
  match_status: 'MATCHED' | 'AMOUNT_DISCREPANCY' | 'DUPLICATE' | 'MISSING_IN_BANK' | 'UNKNOWN_BANK_TXN';
  confidence_score: number;
  discrepancy_note: string | null;
  approved_by: string | null;
  created_at: string;
}

export interface DbDecisionTrace {
  id?: string;
  trace_id: string;
  user_id: string | null;
  organization_id?: string | null;
  query: string;
  intent: string;
  tools_used: any[];
  validation_status: 'STRICTLY_GROUNDED' | 'PROJECTION_ESTIMATE';
  grounded_metrics: any[];
  created_at?: string;
}

export interface CreateAccountPayload {
  name: string;
  account_type: 'cash' | 'investment' | 'asset' | 'liability';
  balance: number;
  currency?: string;
  institution?: string;
  organization_id?: string | null;
  metadata?: Record<string, any>;
}

export interface CreateTransactionPayload {
  account_id: string;
  amount: number;
  transaction_type: 'income' | 'expense' | 'transfer' | 'settlement' | 'refund';
  category: string;
  description?: string;
  transaction_date?: string;
  organization_id?: string | null;
}

export interface QueryResult<T> {
  data: T | null;
  error: string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// 1. Profile Queries
// ────────────────────────────────────────────────────────────────────────────

export async function fetchUserProfile(userId: string): Promise<QueryResult<DbProfile>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: null };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as DbProfile | null, error: null };
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Financial Accounts Queries (Personal & Org Scoped)
// ────────────────────────────────────────────────────────────────────────────

export async function fetchUserAccounts(userId: string): Promise<QueryResult<DbAccount[]>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from('financial_accounts')
    .select('*')
    .eq('user_id', userId)
    .is('organization_id', null)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as DbAccount[], error: null };
}

export async function fetchOrganizationAccounts(orgId: string): Promise<QueryResult<DbAccount[]>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from('financial_accounts')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as DbAccount[], error: null };
}

export async function createAccount(
  userId: string,
  payload: CreateAccountPayload
): Promise<QueryResult<DbAccount>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  const { data, error } = await supabase
    .from('financial_accounts')
    .insert({
      user_id: payload.organization_id ? null : userId,
      organization_id: payload.organization_id ?? null,
      name: payload.name,
      account_type: payload.account_type,
      balance: payload.balance,
      currency: payload.currency || 'INR',
      institution: payload.institution ?? null,
      metadata: payload.metadata ?? {},
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DbAccount, error: null };
}

export async function updateAccount(
  accountId: string,
  payload: Partial<CreateAccountPayload>
): Promise<QueryResult<DbAccount>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  const updateFields: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.name !== undefined) updateFields.name = payload.name;
  if (payload.account_type !== undefined) updateFields.account_type = payload.account_type;
  if (payload.balance !== undefined) updateFields.balance = payload.balance;
  if (payload.currency !== undefined) updateFields.currency = payload.currency;
  if (payload.institution !== undefined) updateFields.institution = payload.institution;
  if (payload.metadata !== undefined) updateFields.metadata = payload.metadata;

  const { data, error } = await supabase
    .from('financial_accounts')
    .update(updateFields)
    .eq('id', accountId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DbAccount, error: null };
}

export async function updateAccountBalance(
  accountId: string,
  newBalance: number
): Promise<QueryResult<null>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  const { error } = await supabase
    .from('financial_accounts')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', accountId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function deleteAccount(accountId: string): Promise<QueryResult<null>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  const { error } = await supabase
    .from('financial_accounts')
    .delete()
    .eq('id', accountId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Financial Transactions Queries (Personal & Org Scoped)
// ────────────────────────────────────────────────────────────────────────────

export interface TransactionFilters {
  accountId?: string;
  transactionType?: 'income' | 'expense' | 'transfer' | 'settlement' | 'refund';
  category?: string;
  startDate?: string;
  endDate?: string;
}

export async function fetchUserTransactions(
  userId: string,
  filters?: TransactionFilters
): Promise<QueryResult<DbTransaction[]>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: [], error: null };

  let query = supabase
    .from('financial_transactions')
    .select('*, account:financial_accounts(name, account_type)')
    .eq('user_id', userId)
    .is('organization_id', null);

  if (filters?.accountId) query = query.eq('account_id', filters.accountId);
  if (filters?.transactionType) query = query.eq('transaction_type', filters.transactionType);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.startDate) query = query.gte('transaction_date', filters.startDate);
  if (filters?.endDate) query = query.lte('transaction_date', filters.endDate);

  const { data, error } = await query
    .order('transaction_date', { ascending: false })
    .limit(500);

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as DbTransaction[], error: null };
}

export async function fetchOrganizationTransactions(
  orgId: string
): Promise<QueryResult<DbTransaction[]>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from('financial_transactions')
    .select('*, account:financial_accounts(name, account_type)')
    .eq('organization_id', orgId)
    .order('transaction_date', { ascending: false })
    .limit(500);

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as DbTransaction[], error: null };
}

export async function createTransaction(
  userId: string,
  payload: CreateTransactionPayload
): Promise<QueryResult<DbTransaction>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  const { data, error } = await supabase
    .from('financial_transactions')
    .insert({
      user_id: payload.organization_id ? null : userId,
      organization_id: payload.organization_id ?? null,
      account_id: payload.account_id,
      amount: payload.amount,
      transaction_type: payload.transaction_type,
      category: payload.category,
      description: payload.description ?? null,
      transaction_date: payload.transaction_date || new Date().toISOString().split('T')[0],
      metadata: {},
    })
    .select('*, account:financial_accounts(name, account_type)')
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DbTransaction, error: null };
}

export async function updateTransaction(
  transactionId: string,
  payload: Partial<CreateTransactionPayload>
): Promise<QueryResult<DbTransaction>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  const updateFields: Record<string, any> = {};
  if (payload.account_id !== undefined) updateFields.account_id = payload.account_id;
  if (payload.amount !== undefined) updateFields.amount = payload.amount;
  if (payload.transaction_type !== undefined) updateFields.transaction_type = payload.transaction_type;
  if (payload.category !== undefined) updateFields.category = payload.category;
  if (payload.description !== undefined) updateFields.description = payload.description;
  if (payload.transaction_date !== undefined) updateFields.transaction_date = payload.transaction_date;

  const { data, error } = await supabase
    .from('financial_transactions')
    .update(updateFields)
    .eq('id', transactionId)
    .select('*, account:financial_accounts(name, account_type)')
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DbTransaction, error: null };
}

export async function deleteTransaction(transactionId: string): Promise<QueryResult<null>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  const { error } = await supabase
    .from('financial_transactions')
    .delete()
    .eq('id', transactionId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Reconciliation Records Queries
// ────────────────────────────────────────────────────────────────────────────

export async function fetchUserReconciliationRecords(
  userId: string
): Promise<QueryResult<DbReconciliationRecord[]>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from('reconciliation_records')
    .select('*')
    .eq('user_id', userId)
    .is('organization_id', null)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as DbReconciliationRecord[], error: null };
}

export async function fetchOrganizationReconciliationRecords(
  orgId: string
): Promise<QueryResult<DbReconciliationRecord[]>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from('reconciliation_records')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as DbReconciliationRecord[], error: null };
}

export async function insertReconciliationRecord(payload: {
  userId: string;
  organizationId?: string | null;
  gatewayRecordId: string;
  gatewayAmount: number;
  gatewayStatus: string;
  bankTransactionId?: string;
  bankAmount?: number;
  matchStatus: 'MATCHED' | 'AMOUNT_DISCREPANCY' | 'DUPLICATE' | 'MISSING_IN_BANK' | 'UNKNOWN_BANK_TXN';
  confidenceScore: number;
  discrepancyNote?: string;
}): Promise<QueryResult<DbReconciliationRecord>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  const { data, error } = await supabase
    .from('reconciliation_records')
    .insert({
      user_id: payload.organizationId ? null : payload.userId,
      organization_id: payload.organizationId ?? null,
      gateway_record_id: payload.gatewayRecordId,
      gateway_amount: payload.gatewayAmount,
      gateway_status: payload.gatewayStatus,
      bank_transaction_id: payload.bankTransactionId ?? null,
      bank_amount: payload.bankAmount ?? null,
      match_status: payload.matchStatus,
      confidence_score: payload.confidenceScore,
      discrepancy_note: payload.discrepancyNote ?? null,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as DbReconciliationRecord, error: null };
}

export async function updateReconciliationStatus(
  recordId: string,
  approvedByUserId: string,
  matchStatus?: 'MATCHED' | 'AMOUNT_DISCREPANCY' | 'DUPLICATE' | 'MISSING_IN_BANK' | 'UNKNOWN_BANK_TXN'
): Promise<QueryResult<null>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  const updatePayload: Record<string, any> = { approved_by: approvedByUserId };
  if (matchStatus) updatePayload.match_status = matchStatus;

  const { error } = await supabase
    .from('reconciliation_records')
    .update(updatePayload)
    .eq('id', recordId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

// ────────────────────────────────────────────────────────────────────────────
// 5. Decision Traces Queries (Immutable Audit Trail)
// ────────────────────────────────────────────────────────────────────────────

export async function fetchUserDecisionTraces(
  userId: string
): Promise<QueryResult<DbDecisionTrace[]>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: [], error: null };

  const { data, error } = await supabase
    .from('decision_traces')
    .select('*')
    .eq('user_id', userId)
    .is('organization_id', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as DbDecisionTrace[], error: null };
}

export async function insertDecisionTrace(
  trace: DbDecisionTrace
): Promise<QueryResult<null>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: null };

  const { error } = await supabase.from('decision_traces').insert({
    trace_id: trace.trace_id,
    user_id: trace.user_id,
    organization_id: trace.organization_id ?? null,
    query: trace.query,
    intent: trace.intent,
    tools_used: trace.tools_used,
    validation_status: trace.validation_status,
    grounded_metrics: trace.grounded_metrics,
  });

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

// ────────────────────────────────────────────────────────────────────────────
// 6. Organization & Workspace Queries
// ────────────────────────────────────────────────────────────────────────────

export async function fetchUserOrganization(
  userId: string
): Promise<QueryResult<DbOrgMembership | null>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: null };

  const { data, error } = await supabase
    .from('organization_members')
    .select('*, organization:organizations(*)')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as DbOrgMembership | null, error: null };
}

export async function createOrganizationWorkspace(
  userId: string,
  orgName: string,
  slug: string
): Promise<QueryResult<DbOrganization>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { data: null, error: 'Supabase is not configured.' };

  // 1. Create organization
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: orgName, slug })
    .select()
    .single();

  if (orgError) return { data: null, error: orgError.message };

  // 2. Add creator as owner member
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: orgData.id,
      user_id: userId,
      role: 'owner',
    });

  if (memberError) return { data: null, error: memberError.message };
  return { data: orgData as DbOrganization, error: null };
}
