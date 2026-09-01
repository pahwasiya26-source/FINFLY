'use client';

import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface CalculationPanelProps {
  title: string;
  formula: string;
  inputs: { label: string; value: string }[];
  result: string;
}

export function CalculationPanel({ title, formula, inputs, result }: CalculationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          color: 'var(--text-secondary)',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          cursor: 'pointer'
        }}
      >
        <Info size={14} />
        How was this calculated?
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 50,
          background: 'var(--bg-surface)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '16px',
          width: '280px',
          marginTop: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{title}</h4>
            <X size={16} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setIsOpen(false)} />
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            {formula}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            {inputs.map((input, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{input.label}</span>
                <span>{input.value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Result</span>
              <span className="text-accent">{result}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
