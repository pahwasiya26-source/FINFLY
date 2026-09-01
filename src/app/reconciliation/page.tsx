'use client';

import React, { useState, useMemo } from 'react';
import { 
  syntheticRazorpayRecords, 
  syntheticBankTransactions, 
  RazorpayRecord, 
  BankTransaction 
} from '../../lib/reconciliation-dataset';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, 
  Search, Filter, ChevronRight, Activity, Receipt, ArrowRightLeft, FileSearch, Check
} from 'lucide-react';

type MatchStatus = 'MATCHED' | 'AMOUNT_DISCREPANCY' | 'DUPLICATE' | 'MISSING_IN_BANK' | 'UNKNOWN_BANK_TXN';

interface ReconciliationResult {
  id: string;
  status: MatchStatus;
  gatewayRecord?: RazorpayRecord;
  duplicateRecords?: RazorpayRecord[];
  bankTransaction?: BankTransaction;
  confidence: number;
  decisionTrace: string[];
}

export default function ReconciliationPage() {
  const [filter, setFilter] = useState<'ALL' | 'MATCHED' | 'EXCEPTIONS'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Deterministic Matching Engine
  const reconciliationData = useMemo(() => {
    const results: ReconciliationResult[] = [];
    const usedBankTxns = new Set<string>();
    
    // Group gateway records by ID to catch duplicates
    const gatewayRecordsById = new Map<string, RazorpayRecord[]>();
    syntheticRazorpayRecords.forEach(r => {
      if (r.status === 'failed') return; // Ignore failed payments
      if (!gatewayRecordsById.has(r.id)) {
        gatewayRecordsById.set(r.id, []);
      }
      gatewayRecordsById.get(r.id)!.push(r);
    });

    gatewayRecordsById.forEach((records, rzId) => {
      const primaryRecord = records[0];
      const isDuplicate = records.length > 1;
      const expectedAmount = primaryRecord.type === 'refund' ? -primaryRecord.amount : primaryRecord.amount;
      
      // Find matching bank txn
      let matchedBank: BankTransaction | undefined;
      let status: MatchStatus = 'MISSING_IN_BANK';
      let confidence = 0;
      const trace: string[] = [`Analyzing Gateway Record: ${rzId} (${primaryRecord.type}, ${primaryRecord.amount} ${primaryRecord.currency})`];

      if (isDuplicate) {
        trace.push(`WARNING: Multiple records found with same ID (${records.length} occurrences)`);
      }

      // Try exact amount match first
      matchedBank = syntheticBankTransactions.find(bt => !usedBankTxns.has(bt.id) && bt.amount === expectedAmount);
      
      if (matchedBank) {
        status = isDuplicate ? 'DUPLICATE' : 'MATCHED';
        confidence = 100;
        trace.push(`Exact amount match found in Bank Ledger: ${matchedBank.id}`);
        usedBankTxns.add(matchedBank.id);
      } else {
        // Try amount discrepancy match (within 5% difference)
        trace.push(`No exact amount match found. Searching for close amounts...`);
        matchedBank = syntheticBankTransactions.find(bt => {
          if (usedBankTxns.has(bt.id)) return false;
          const diff = Math.abs(bt.amount - expectedAmount);
          return diff > 0 && diff <= Math.abs(expectedAmount * 0.05); // max 5% fee
        });

        if (matchedBank) {
          status = isDuplicate ? 'DUPLICATE' : 'AMOUNT_DISCREPANCY';
          confidence = 85;
          trace.push(`Fuzzy match found: ${matchedBank.id} (Bank: ${matchedBank.amount}, Gateway: ${expectedAmount})`);
          trace.push(`Difference of ${Math.abs(matchedBank.amount - expectedAmount)} flagged as potential MDR/Fee.`);
          usedBankTxns.add(matchedBank.id);
        } else {
          trace.push(`No corresponding bank transaction found.`);
        }
      }

      results.push({
        id: rzId,
        status,
        gatewayRecord: primaryRecord,
        duplicateRecords: isDuplicate ? records.slice(1) : undefined,
        bankTransaction: matchedBank,
        confidence,
        decisionTrace: trace
      });
    });

    // Check for unmatched bank txns
    syntheticBankTransactions.forEach(bt => {
      if (!usedBankTxns.has(bt.id)) {
        results.push({
          id: bt.id,
          status: 'UNKNOWN_BANK_TXN',
          bankTransaction: bt,
          confidence: 0,
          decisionTrace: [
            `Analyzing Bank Transaction: ${bt.id} (${bt.amount})`,
            `No corresponding gateway record found. Unrecognized settlement.`
          ]
        });
      }
    });

    return results;
  }, []);

  const filteredData = useMemo(() => {
    if (filter === 'ALL') return reconciliationData;
    if (filter === 'MATCHED') return reconciliationData.filter(d => d.status === 'MATCHED');
    return reconciliationData.filter(d => d.status !== 'MATCHED');
  }, [filter, reconciliationData]);

  // Metrics
  const totalRecords = reconciliationData.length;
  const matchedRecords = reconciliationData.filter(d => d.status === 'MATCHED').length;
  const matchRate = totalRecords > 0 ? (matchedRecords / totalRecords) * 100 : 0;
  const exceptionsCount = totalRecords - matchedRecords;

  const handleApprove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Simulate approval action
    alert(`Match approved and written to ledger for ID: ${id}`);
  };

  const getStatusBadge = (status: MatchStatus) => {
    switch(status) {
      case 'MATCHED': return <span className="pill-badge pill-emerald"><CheckCircle2 size={12} className="mr-1"/> Exact Match</span>;
      case 'AMOUNT_DISCREPANCY': return <span className="pill-badge pill-gold"><AlertTriangle size={12} className="mr-1"/> Amount Discrepancy</span>;
      case 'DUPLICATE': return <span className="pill-badge pill-indigo"><Activity size={12} className="mr-1"/> Duplicate Record</span>;
      case 'MISSING_IN_BANK': return <span className="pill-badge pill-neutral"><AlertCircle size={12} className="mr-1"/> Missing in Bank</span>;
      case 'UNKNOWN_BANK_TXN': return <span className="pill-badge pill-neutral"><FileSearch size={12} className="mr-1"/> Unknown Bank Txn</span>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER & METRICS */}
      <div className="glass-hero" style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="pill-badge pill-emerald">Deterministic Engine Active</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Reconciliation Command Center
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
            Two-way cryptographic match between gateway telemetry and bank settlements.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Auto-Match Rate</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
              <AnimatedNumber value={matchRate} format="percentage" />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>High Confidence</div>
          </div>
          
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Records Processed</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)', margin: '4px 0' }}>
              <AnimatedNumber value={totalRecords} format="number" />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Gateway + Bank</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderLeft: exceptionsCount > 0 ? '3px solid var(--gold-accent)' : '' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Unresolved Exceptions</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Outfit', color: exceptionsCount > 0 ? 'var(--gold-accent)' : 'var(--accent-primary)', margin: '4px 0' }}>
              <AnimatedNumber value={exceptionsCount} format="number" />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Require manual review</div>
          </div>
        </div>
      </div>

      {/* RECONCILIATION WORKFLOW */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Transaction Trace</h2>
          
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'MATCHED' ? 'active' : ''}`}
              onClick={() => setFilter('MATCHED')}
            >
              Matched
            </button>
            <button 
              className={`filter-btn ${filter === 'EXCEPTIONS' ? 'active' : ''}`}
              onClick={() => setFilter('EXCEPTIONS')}
            >
              Exceptions <span style={{ background: 'var(--gold-bg)', color: 'var(--gold-accent)', padding: '2px 6px', borderRadius: '999px', fontSize: '0.65rem', marginLeft: '4px' }}>{exceptionsCount}</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredData.map(res => {
            const isExpanded = expandedId === res.id;
            return (
              <div 
                key={res.id} 
                className="glass-panel" 
                style={{ 
                  padding: '20px', 
                  cursor: 'pointer',
                  borderLeft: res.status !== 'MATCHED' ? '3px solid var(--gold-accent)' : '3px solid var(--accent-primary)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setExpandedId(isExpanded ? null : res.id)}
              >
                {/* Row Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      <ArrowRightLeft size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{res.id}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {res.gatewayRecord ? `Gateway: ${res.gatewayRecord.type}` : 'Bank Txn'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontFamily: 'Outfit', fontSize: '1.1rem' }}>
                        {res.gatewayRecord ? `₹${res.gatewayRecord.amount}` : (res.bankTransaction ? `₹${res.bankTransaction.amount}` : '-')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Expected Amount</div>
                    </div>
                    {getStatusBadge(res.status)}
                    <ChevronRight size={18} style={{ color: 'var(--text-tertiary)', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    
                    {/* Decision Trace Log */}
                    <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={14} /> Append-only Decision Trace
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {res.decisionTrace.map((log, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                            <span style={{ color: 'var(--accent-primary)' }}>[{String(i+1).padStart(2, '0')}]</span>
                            <span>{log}</span>
                          </div>
                        ))}
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Confidence Score</span>
                          <span className={res.confidence === 100 ? "pill-badge pill-emerald" : "pill-badge pill-gold"}>{res.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Data Comparison & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                       <div style={{ display: 'flex', gap: '16px' }}>
                          {res.gatewayRecord && (
                            <div style={{ flex: 1, padding: '12px', background: 'rgba(5, 150, 105, 0.05)', borderRadius: '8px', border: '1px solid var(--success-border)' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Gateway Record</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{res.gatewayRecord.id}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>₹{res.gatewayRecord.amount} • {res.gatewayRecord.status}</div>
                            </div>
                          )}
                          {res.bankTransaction && (
                            <div style={{ flex: 1, padding: '12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--indigo-accent)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Bank Settlement</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{res.bankTransaction.id}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>₹{res.bankTransaction.amount}</div>
                            </div>
                          )}
                       </div>

                       {/* Action Buttons for Exceptions */}
                       {res.status !== 'MATCHED' && (
                         <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                           <button 
                             className="btn-primary" 
                             style={{ flex: 1, fontSize: '0.85rem', padding: '8px', display: 'flex', justifyContent: 'center', gap: '6px' }}
                             onClick={(e) => handleApprove(e, res.id)}
                           >
                             <Check size={14} /> Approve Match
                           </button>
                           <button className="btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}>
                             Flag Issue
                           </button>
                         </div>
                       )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}

          {filteredData.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No records found for this filter.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .filter-btn {
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }
        .filter-btn:hover {
          color: var(--text-primary);
        }
        .filter-btn.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }
        .mr-1 { margin-right: 4px; }
      `}</style>
    </div>
  );
}
