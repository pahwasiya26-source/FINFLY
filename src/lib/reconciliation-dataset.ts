export interface RazorpayRecord {
  id: string;
  type: 'payment' | 'refund' | 'settlement';
  amount: number;
  currency: string;
  status: 'captured' | 'failed' | 'processed' | 'created';
  created_at: string;
  notes?: Record<string, string>;
}

export interface BankTransaction {
  id: string;
  amount: number;
  date: string;
  description: string;
}

export const syntheticRazorpayRecords: RazorpayRecord[] = [
  // 1. Successful Match
  { id: 'pay_1A', type: 'payment', amount: 5000, currency: 'INR', status: 'captured', created_at: '2026-08-20T10:00:00Z', notes: { invoice: 'INV-001' } },
  // 2. Failed Payment (No bank transaction expected)
  { id: 'pay_2B', type: 'payment', amount: 1500, currency: 'INR', status: 'failed', created_at: '2026-08-20T11:00:00Z' },
  // 3. Full Refund
  { id: 'rfnd_3C', type: 'refund', amount: 2000, currency: 'INR', status: 'processed', created_at: '2026-08-20T12:00:00Z', notes: { payment_id: 'pay_3C' } },
  // 4. Partial Refund
  { id: 'rfnd_4D', type: 'refund', amount: 500, currency: 'INR', status: 'processed', created_at: '2026-08-20T13:00:00Z', notes: { payment_id: 'pay_4D_full_was_1000' } },
  // 5. Amount Discrepancy (e.g. MDR/Fee deducted before settlement but logged differently)
  { id: 'setl_5E', type: 'settlement', amount: 4900, currency: 'INR', status: 'processed', created_at: '2026-08-21T09:00:00Z' },
  // 6. Duplicate Record (Edge case)
  { id: 'pay_6F', type: 'payment', amount: 3000, currency: 'INR', status: 'captured', created_at: '2026-08-21T10:00:00Z' },
  { id: 'pay_6F', type: 'payment', amount: 3000, currency: 'INR', status: 'captured', created_at: '2026-08-21T10:00:05Z' }, // Duplicate ID sent by webhook twice
  // 7. Date Discrepancy (Payment on 20th, settled late on 25th)
  { id: 'pay_7G', type: 'payment', amount: 8000, currency: 'INR', status: 'captured', created_at: '2026-08-20T23:55:00Z' }
];

export const syntheticBankTransactions: BankTransaction[] = [
  // Matches pay_1A
  { id: 'txn_101', amount: 5000, date: '2026-08-20T10:05:00Z', description: 'RAZORPAY SETTLEMENT INV-001' },
  // Matches rfnd_3C
  { id: 'txn_102', amount: -2000, date: '2026-08-20T12:30:00Z', description: 'RAZORPAY REFUND' },
  // Matches rfnd_4D
  { id: 'txn_103', amount: -500, date: '2026-08-20T13:45:00Z', description: 'RAZORPAY REFUND PARTIAL' },
  // Matches setl_5E but amount is slightly off (e.g., bank fee)
  { id: 'txn_104', amount: 4895, date: '2026-08-21T09:30:00Z', description: 'RAZORPAY SETTLEMENT' },
  // Matches pay_6F (Only one bank txn for the duplicate)
  { id: 'txn_105', amount: 3000, date: '2026-08-21T10:10:00Z', description: 'RAZORPAY SETTLEMENT' },
  // Missing Record: Bank shows 10000 INR received, but no Razorpay record exists
  { id: 'txn_106', amount: 10000, date: '2026-08-21T11:00:00Z', description: 'RAZORPAY SETTLEMENT UNKNOWN' },
  // Matches pay_7G
  { id: 'txn_107', amount: 8000, date: '2026-08-25T10:00:00Z', description: 'RAZORPAY SETTLEMENT LATE' }
];
