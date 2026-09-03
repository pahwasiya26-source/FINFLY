'use client';

import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number; // ms
  format?: 'currency' | 'percentage' | 'number';
}

/**
 * Deterministic Indian Rupee (INR) currency formatter.
 * Formats numbers into standard Indian numbering notation (e.g. ₹0, ₹1,234, ₹1,23,456)
 * without locale-dependent non-breaking space (NBSP / NNBSP) discrepancies between SSR and client.
 */
export function formatINR(val: number): string {
  const rounded = Math.round(val);
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);

  const str = abs.toString();
  let formatted = '';
  if (str.length <= 3) {
    formatted = str;
  } else {
    const last3 = str.slice(-3);
    const rest = str.slice(0, -3);
    const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formatted = `${withCommas},${last3}`;
  }

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatDeterministicNumber(val: number): string {
  const rounded = Math.floor(val);
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);

  const str = abs.toString();
  let formatted = '';
  if (str.length <= 3) {
    formatted = str;
  } else {
    const last3 = str.slice(-3);
    const rest = str.slice(0, -3);
    const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formatted = `${withCommas},${last3}`;
  }

  return `${isNegative ? '-' : ''}${formatted}`;
}

export function AnimatedNumber({ value, duration = 1000, format = 'number' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(current);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formatValue = (val: number) => {
    if (format === 'currency') {
      return formatINR(val);
    }
    if (format === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    return formatDeterministicNumber(val);
  };

  return <span>{formatValue(displayValue)}</span>;
}
