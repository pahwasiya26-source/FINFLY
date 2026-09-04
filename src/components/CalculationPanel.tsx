'use client';

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface CalculationPanelProps {
  title: string;
  formula: string;
  inputs: { label: string; value: string }[];
  result: string;
}

export function CalculationPanel({ title, formula, inputs, result }: CalculationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ width: '100%' }}>
      {/* Proof Trigger Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-expanded={isOpen}
          title="View deterministic mathematical formula & inputs"
          aria-label={`View mathematical formula for ${title}`}
          style={{
            background: isOpen ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-elevated)',
            border: '1px solid',
            borderColor: isOpen ? 'var(--accent-primary)' : 'var(--border-subtle)',
            borderRadius: '6px',
            color: isOpen ? 'var(--accent-primary)' : 'var(--text-tertiary)',
            padding: '2px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.70rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          className="calc-proof-trigger"
        >
          <Info size={12} />
          <span>Proof</span>
          {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {/* Inline Expandable Proof Breakdown Section */}
      {isOpen && (
        <div
          role="region"
          aria-label={`${title} Proof Breakdown`}
          style={{
            marginTop: '10px',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Formula Proof
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.66rem',
                color: 'var(--accent-primary)',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={11} />
              <span>Grounded</span>
            </span>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 8px',
              borderRadius: '6px',
              fontSize: '0.70rem',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--accent-primary)',
              wordBreak: 'break-word',
            }}
          >
            {formula}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.74rem' }}>
            {inputs.map((input, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>{input.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{input.value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '2px 0' }} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: '0.76rem',
              }}
            >
              <span style={{ color: 'var(--text-primary)' }}>Deterministic Result</span>
              <span style={{ color: 'var(--accent-primary)' }}>{result}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
