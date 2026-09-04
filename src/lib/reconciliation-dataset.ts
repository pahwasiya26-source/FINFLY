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
  // 1. Successful Match (Preserved original case)
  { id: 'pay_1A', type: 'payment', amount: 5000, currency: 'INR', status: 'captured', created_at: '2026-08-20T10:00:00Z', notes: { invoice: 'INV-001' } },
  // 2. Failed Payment (Preserved original case - no bank transaction expected)
  { id: 'pay_2B', type: 'payment', amount: 1500, currency: 'INR', status: 'failed', created_at: '2026-08-20T11:00:00Z' },
  // 3. Full Refund (Preserved original case)
  { id: 'rfnd_3C', type: 'refund', amount: 2000, currency: 'INR', status: 'processed', created_at: '2026-08-20T12:00:00Z', notes: { payment_id: 'pay_3C' } },
  // 4. Partial Refund (Preserved original case)
  { id: 'rfnd_4D', type: 'refund', amount: 500, currency: 'INR', status: 'processed', created_at: '2026-08-20T13:00:00Z', notes: { payment_id: 'pay_4D_full_was_1000' } },
  // 5. Amount Discrepancy: MDR / Fee variance (Preserved original case: gateway 4900 vs bank 4895)
  { id: 'setl_5E', type: 'settlement', amount: 4900, currency: 'INR', status: 'processed', created_at: '2026-08-21T09:00:00Z' },
  // 6. Duplicate Webhook: 2 callbacks for same payment ID (Preserved original case)
  { id: 'pay_6F', type: 'payment', amount: 3000, currency: 'INR', status: 'captured', created_at: '2026-08-21T10:00:00Z' },
  { id: 'pay_6F', type: 'payment', amount: 3000, currency: 'INR', status: 'captured', created_at: '2026-08-21T10:00:05Z' },
  // 7. Successful Match (Preserved original case)
  { id: 'pay_7G', type: 'payment', amount: 8000, currency: 'INR', status: 'captured', created_at: '2026-08-20T23:55:00Z' },

  // --- Expanded Synthetic Benchmark Batch (Records 8 to 60) ---
  // 8. Match
  { id: 'pay_8H', type: 'payment', amount: 1250, currency: 'INR', status: 'captured', created_at: '2026-08-21T11:15:00Z' },
  // 9. Match
  { id: 'pay_9J', type: 'payment', amount: 4200, currency: 'INR', status: 'captured', created_at: '2026-08-21T12:00:00Z', notes: { order: 'ORD-9012' } },
  // 10. Match
  { id: 'pay_10K', type: 'payment', amount: 6800, currency: 'INR', status: 'captured', created_at: '2026-08-21T13:30:00Z' },
  // 11. Match
  { id: 'rfnd_11L', type: 'refund', amount: 850, currency: 'INR', status: 'processed', created_at: '2026-08-21T14:10:00Z' },
  // 12. Match
  { id: 'pay_12M', type: 'payment', amount: 15400, currency: 'INR', status: 'captured', created_at: '2026-08-21T15:20:00Z', notes: { client: 'Enterprise A' } },
  // 13. Match
  { id: 'pay_13N', type: 'payment', amount: 2750, currency: 'INR', status: 'captured', created_at: '2026-08-21T16:45:00Z' },
  // 14. Match
  { id: 'pay_14P', type: 'payment', amount: 9300, currency: 'INR', status: 'captured', created_at: '2026-08-21T17:50:00Z' },
  // 15. Match
  { id: 'setl_15Q', type: 'settlement', amount: 31000, currency: 'INR', status: 'processed', created_at: '2026-08-22T08:30:00Z' },
  // 16. MDR Fee Variance #2 (12000 vs 11820 -> 180 MDR fee)
  { id: 'setl_16R', type: 'settlement', amount: 12000, currency: 'INR', status: 'processed', created_at: '2026-08-22T09:15:00Z' },
  // 17. Match
  { id: 'pay_17S', type: 'payment', amount: 3900, currency: 'INR', status: 'captured', created_at: '2026-08-22T10:00:00Z' },
  // 18. Match
  { id: 'pay_18T', type: 'payment', amount: 11200, currency: 'INR', status: 'captured', created_at: '2026-08-22T11:20:00Z' },
  // 19. Match
  { id: 'rfnd_19U', type: 'refund', amount: 1400, currency: 'INR', status: 'processed', created_at: '2026-08-22T12:05:00Z' },
  // 20. Missing in Bank #1 (Captured payment but no bank credit exists)
  { id: 'pay_20V', type: 'payment', amount: 7200, currency: 'INR', status: 'captured', created_at: '2026-08-22T13:40:00Z' },
  // 21. Match
  { id: 'pay_21W', type: 'payment', amount: 22000, currency: 'INR', status: 'captured', created_at: '2026-08-22T14:55:00Z' },
  // 22. Match
  { id: 'pay_22X', type: 'payment', amount: 5600, currency: 'INR', status: 'captured', created_at: '2026-08-22T16:10:00Z' },
  // 23. Match
  { id: 'pay_23Y', type: 'payment', amount: 1750, currency: 'INR', status: 'captured', created_at: '2026-08-22T17:25:00Z' },
  // 24. Match
  { id: 'setl_24Z', type: 'settlement', amount: 42000, currency: 'INR', status: 'processed', created_at: '2026-08-23T08:45:00Z' },
  // 25. Match
  { id: 'pay_25A', type: 'payment', amount: 8900, currency: 'INR', status: 'captured', created_at: '2026-08-23T09:30:00Z' },
  // 26. Match
  { id: 'pay_26B', type: 'payment', amount: 3400, currency: 'INR', status: 'captured', created_at: '2026-08-23T10:40:00Z' },
  // 27. Duplicate Webhook #2 (pay_27C sent twice by gateway retry)
  { id: 'pay_27C', type: 'payment', amount: 6500, currency: 'INR', status: 'captured', created_at: '2026-08-23T11:50:00Z' },
  { id: 'pay_27C', type: 'payment', amount: 6500, currency: 'INR', status: 'captured', created_at: '2026-08-23T11:50:04Z' },
  // 28. Match
  { id: 'rfnd_28D', type: 'refund', amount: 3100, currency: 'INR', status: 'processed', created_at: '2026-08-23T13:10:00Z' },
  // 29. Match
  { id: 'pay_29E', type: 'payment', amount: 13500, currency: 'INR', status: 'captured', created_at: '2026-08-23T14:20:00Z' },
  // 30. Match
  { id: 'pay_30F', type: 'payment', amount: 4600, currency: 'INR', status: 'captured', created_at: '2026-08-23T15:35:00Z' },
  // 31. Match
  { id: 'pay_31G', type: 'payment', amount: 19800, currency: 'INR', status: 'captured', created_at: '2026-08-23T16:50:00Z' },
  // 32. MDR Fee Variance #3 (25000 vs 24550 -> 450 MDR fee)
  { id: 'setl_32H', type: 'settlement', amount: 25000, currency: 'INR', status: 'processed', created_at: '2026-08-24T08:20:00Z' },
  // 33. Match
  { id: 'pay_33J', type: 'payment', amount: 2400, currency: 'INR', status: 'captured', created_at: '2026-08-24T09:40:00Z' },
  // 34. Failed Payment #2 (no bank transaction expected)
  { id: 'pay_34K', type: 'payment', amount: 9100, currency: 'INR', status: 'failed', created_at: '2026-08-24T10:15:00Z' },
  // 35. Match
  { id: 'pay_35L', type: 'payment', amount: 7800, currency: 'INR', status: 'captured', created_at: '2026-08-24T11:30:00Z' },
  // 36. Match
  { id: 'rfnd_36M', type: 'refund', amount: 950, currency: 'INR', status: 'processed', created_at: '2026-08-24T12:45:00Z' },
  // 37. Match
  { id: 'pay_37N', type: 'payment', amount: 16200, currency: 'INR', status: 'captured', created_at: '2026-08-24T14:00:00Z' },
  // 38. Match
  { id: 'pay_38P', type: 'payment', amount: 3700, currency: 'INR', status: 'captured', created_at: '2026-08-24T15:15:00Z' },
  // 39. Match
  { id: 'pay_39Q', type: 'payment', amount: 28500, currency: 'INR', status: 'captured', created_at: '2026-08-24T16:30:00Z' },
  // 40. Match
  { id: 'setl_40R', type: 'settlement', amount: 53000, currency: 'INR', status: 'processed', created_at: '2026-08-25T08:15:00Z' },
  // 41. Match
  { id: 'pay_41S', type: 'payment', amount: 6200, currency: 'INR', status: 'captured', created_at: '2026-08-25T09:25:00Z' },
  // 42. Match
  { id: 'pay_42T', type: 'payment', amount: 10500, currency: 'INR', status: 'captured', created_at: '2026-08-25T10:50:00Z' },
  // 43. Match
  { id: 'rfnd_43U', type: 'refund', amount: 2300, currency: 'INR', status: 'processed', created_at: '2026-08-25T12:10:00Z' },
  // 44. Missing in Bank #2 (Captured payment but no bank credit exists)
  { id: 'pay_44V', type: 'payment', amount: 16400, currency: 'INR', status: 'captured', created_at: '2026-08-25T13:35:00Z' },
  // 45. Match
  { id: 'pay_45W', type: 'payment', amount: 4100, currency: 'INR', status: 'captured', created_at: '2026-08-25T14:45:00Z' },
  // 46. Match
  { id: 'pay_46X', type: 'payment', amount: 18200, currency: 'INR', status: 'captured', created_at: '2026-08-25T16:00:00Z' },
  // 47. Match
  { id: 'pay_47Y', type: 'payment', amount: 2900, currency: 'INR', status: 'captured', created_at: '2026-08-25T17:15:00Z' },
  // 48. Match
  { id: 'setl_48Z', type: 'settlement', amount: 36000, currency: 'INR', status: 'processed', created_at: '2026-08-26T08:30:00Z' },
  // 49. Match
  { id: 'pay_49A', type: 'payment', amount: 8400, currency: 'INR', status: 'captured', created_at: '2026-08-26T09:45:00Z' },
  // 50. Match
  { id: 'pay_50B', type: 'payment', amount: 12800, currency: 'INR', status: 'captured', created_at: '2026-08-26T11:00:00Z' },
  // 51. Match
  { id: 'rfnd_51C', type: 'refund', amount: 1750, currency: 'INR', status: 'processed', created_at: '2026-08-26T12:20:00Z' },
  // 52. Match
  { id: 'pay_52D', type: 'payment', amount: 5300, currency: 'INR', status: 'captured', created_at: '2026-08-26T13:40:00Z' },
  // 53. Match
  { id: 'pay_53E', type: 'payment', amount: 21500, currency: 'INR', status: 'captured', created_at: '2026-08-26T15:00:00Z' },
  // 54. Match
  { id: 'pay_54F', type: 'payment', amount: 7600, currency: 'INR', status: 'captured', created_at: '2026-08-26T16:15:00Z' },
  // 55. Match
  { id: 'pay_55G', type: 'payment', amount: 3300, currency: 'INR', status: 'captured', created_at: '2026-08-26T17:30:00Z' },
  // 56. Match
  { id: 'setl_56H', type: 'settlement', amount: 47000, currency: 'INR', status: 'processed', created_at: '2026-08-27T08:40:00Z' },
  // 57. Match
  { id: 'pay_57J', type: 'payment', amount: 9700, currency: 'INR', status: 'captured', created_at: '2026-08-27T10:00:00Z' },
  // 58. Match
  { id: 'pay_58K', type: 'payment', amount: 14500, currency: 'INR', status: 'captured', created_at: '2026-08-27T11:30:00Z' },
];

export const syntheticBankTransactions: BankTransaction[] = [
  // Matches pay_1A (Preserved original case)
  { id: 'txn_101', amount: 5000, date: '2026-08-20T10:05:00Z', description: 'RAZORPAY SETTLEMENT INV-001' },
  // Matches rfnd_3C (Preserved original case)
  { id: 'txn_102', amount: -2000, date: '2026-08-20T12:30:00Z', description: 'RAZORPAY REFUND' },
  // Matches rfnd_4D (Preserved original case)
  { id: 'txn_103', amount: -500, date: '2026-08-20T13:45:00Z', description: 'RAZORPAY REFUND PARTIAL' },
  // Matches setl_5E but amount is slightly off (₹5 MDR fee - Preserved original case)
  { id: 'txn_104', amount: 4895, date: '2026-08-21T09:30:00Z', description: 'RAZORPAY SETTLEMENT' },
  // Matches pay_6F (Preserved original case - only 1 bank credit for duplicate webhook)
  { id: 'txn_105', amount: 3000, date: '2026-08-21T10:10:00Z', description: 'RAZORPAY SETTLEMENT' },
  // Missing Record: Bank shows 10000 INR received, no gateway match (Preserved original case)
  { id: 'txn_106', amount: 10000, date: '2026-08-21T11:00:00Z', description: 'RAZORPAY SETTLEMENT UNKNOWN' },
  // Matches pay_7G (Preserved original case)
  { id: 'txn_107', amount: 8000, date: '2026-08-25T10:00:00Z', description: 'RAZORPAY SETTLEMENT LATE' },

  // --- Expanded Synthetic Benchmark Bank Transactions (Txn 108 to 158) ---
  { id: 'txn_108', amount: 1250, date: '2026-08-21T11:30:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_109', amount: 4200, date: '2026-08-21T12:15:00Z', description: 'RAZORPAY SETTLEMENT ORD-9012' },
  { id: 'txn_110', amount: 6800, date: '2026-08-21T13:45:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_111', amount: -850, date: '2026-08-21T14:30:00Z', description: 'RAZORPAY REFUND' },
  { id: 'txn_112', amount: 15400, date: '2026-08-21T15:40:00Z', description: 'RAZORPAY SETTLEMENT ENTERPRISE A' },
  { id: 'txn_113', amount: 2750, date: '2026-08-21T17:00:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_114', amount: 9300, date: '2026-08-21T18:10:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_115', amount: 31000, date: '2026-08-22T08:50:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  // Matches setl_16R with MDR fee (12000 vs 11820 -> 180 fee)
  { id: 'txn_116', amount: 11820, date: '2026-08-22T09:35:00Z', description: 'RAZORPAY SETTLEMENT NET MDR' },
  { id: 'txn_117', amount: 3900, date: '2026-08-22T10:20:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_118', amount: 11200, date: '2026-08-22T11:45:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_119', amount: -1400, date: '2026-08-22T12:25:00Z', description: 'RAZORPAY REFUND' },
  { id: 'txn_120', amount: 22000, date: '2026-08-22T15:15:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  { id: 'txn_121', amount: 5600, date: '2026-08-22T16:30:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_122', amount: 1750, date: '2026-08-22T17:45:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_123', amount: 42000, date: '2026-08-23T09:00:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  { id: 'txn_124', amount: 8900, date: '2026-08-23T09:50:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_125', amount: 3400, date: '2026-08-23T11:00:00Z', description: 'RAZORPAY SETTLEMENT' },
  // Matches duplicate pay_27C (only 1 bank credit recorded for duplicate webhook)
  { id: 'txn_126', amount: 6500, date: '2026-08-23T12:05:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_127', amount: -3100, date: '2026-08-23T13:30:00Z', description: 'RAZORPAY REFUND' },
  { id: 'txn_128', amount: 13500, date: '2026-08-23T14:40:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_129', amount: 4600, date: '2026-08-23T15:55:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_130', amount: 19800, date: '2026-08-23T17:10:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  // Matches setl_32H with MDR fee (25000 vs 24550 -> 450 fee)
  { id: 'txn_131', amount: 24550, date: '2026-08-24T08:40:00Z', description: 'RAZORPAY SETTLEMENT NET MDR' },
  { id: 'txn_132', amount: 2400, date: '2026-08-24T10:00:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_133', amount: 7800, date: '2026-08-24T11:50:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_134', amount: -950, date: '2026-08-24T13:00:00Z', description: 'RAZORPAY REFUND' },
  { id: 'txn_135', amount: 16200, date: '2026-08-24T14:20:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_136', amount: 3700, date: '2026-08-24T15:35:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_137', amount: 28500, date: '2026-08-24T16:50:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  { id: 'txn_138', amount: 53000, date: '2026-08-25T08:35:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  { id: 'txn_139', amount: 6200, date: '2026-08-25T09:45:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_140', amount: 10500, date: '2026-08-25T11:10:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_141', amount: -2300, date: '2026-08-25T12:30:00Z', description: 'RAZORPAY REFUND' },
  // Unknown bank credit #2 (Direct NEFT without matching gateway transaction)
  { id: 'txn_142', amount: 18500, date: '2026-08-25T14:00:00Z', description: 'DIRECT NEFT INWARD - UNMAPPED CLIENT' },
  { id: 'txn_143', amount: 4100, date: '2026-08-25T15:05:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_144', amount: 18200, date: '2026-08-25T16:20:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  { id: 'txn_145', amount: 2900, date: '2026-08-25T17:35:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_146', amount: 36000, date: '2026-08-26T08:50:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  { id: 'txn_147', amount: 8400, date: '2026-08-26T10:05:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_148', amount: 12800, date: '2026-08-26T11:20:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_149', amount: -1750, date: '2026-08-26T12:40:00Z', description: 'RAZORPAY REFUND' },
  { id: 'txn_150', amount: 5300, date: '2026-08-26T14:00:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_151', amount: 21500, date: '2026-08-26T15:20:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  { id: 'txn_152', amount: 7600, date: '2026-08-26T16:35:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_153', amount: 3300, date: '2026-08-26T17:50:00Z', description: 'RAZORPAY SETTLEMENT' },
  // Unknown bank credit #3 (Direct bank interest credit)
  { id: 'txn_154', amount: 3250, date: '2026-08-26T18:15:00Z', description: 'MISC CR ADJ BANK INT' },
  { id: 'txn_155', amount: 47000, date: '2026-08-27T09:00:00Z', description: 'RAZORPAY NODAL SETTLEMENT' },
  { id: 'txn_156', amount: 9700, date: '2026-08-27T10:20:00Z', description: 'RAZORPAY SETTLEMENT' },
  { id: 'txn_157', amount: 14500, date: '2026-08-27T11:50:00Z', description: 'RAZORPAY SETTLEMENT' },
  // Unknown bank credit #4 (Direct UPI credit reversal)
  { id: 'txn_158', amount: 4750, date: '2026-08-27T14:00:00Z', description: 'DIRECT UPI CREDIT - REFUND REVERSAL' },
];
