'use client';

export function MoneyFlowChart({ data }: { data: any }) {
  // A simple visual representation of money flow using flex layouts
  // Income -> Cash -> Split into Expenses, Investments, Savings

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px', 
      padding: '24px', 
      background: 'rgba(0,0,0,0.2)', 
      borderRadius: '16px',
      border: '1px dashed rgba(255,255,255,0.1)'
    }}>
      <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Money Flow Visualization</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Source */}
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', minWidth: '120px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Income</div>
          <div className="text-success" style={{ fontWeight: 'bold' }}>+₹{data.monthlyIncome.toLocaleString()}</div>
        </div>
        
        <div style={{ height: '2px', flex: 1, background: 'var(--success)', opacity: 0.5, position: 'relative' }}>
          <div style={{ position: 'absolute', right: 0, top: '-4px', width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%' }} />
        </div>

        {/* Node */}
        <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', minWidth: '120px', border: '1px solid var(--accent-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cash Buffer</div>
          <div style={{ fontWeight: 'bold' }}>₹{data.cash.toLocaleString()}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '32px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ height: '2px', width: '100%', background: 'var(--danger)', opacity: 0.5, position: 'relative' }}>
              <div style={{ position: 'absolute', right: 0, top: '-4px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ height: '2px', width: '100%', background: 'var(--accent-color)', opacity: 0.5, position: 'relative' }}>
              <div style={{ position: 'absolute', right: 0, top: '-4px', width: '10px', height: '10px', background: 'var(--accent-color)', borderRadius: '50%' }} />
            </div>
          </div>
        </div>

        {/* Sinks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', minWidth: '120px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expenses</div>
            <div className="text-danger" style={{ fontWeight: 'bold' }}>-₹{data.monthlyExpenses.toLocaleString()}</div>
          </div>
          <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', minWidth: '120px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Surplus / Savings</div>
            <div className="text-accent" style={{ fontWeight: 'bold' }}>₹{data.monthlySurplus.toLocaleString()}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
