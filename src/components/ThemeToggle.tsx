'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        style={{ 
          width: compact ? '84px' : '108px', 
          height: '32px', 
          background: 'var(--bg-surface-subtle)', 
          borderRadius: '999px',
          border: '1px solid var(--border-color)' 
        }} 
      />
    );
  }

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'system', label: 'Auto', icon: Monitor },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-color)',
        borderRadius: '999px',
        padding: '3px',
        position: 'relative',
        gap: '2px',
      }}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={`${opt.label} Theme`}
            onClick={() => setTheme(opt.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: compact ? '4px 7px' : '5px 9px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: isActive ? 'var(--bg-surface)' : 'transparent',
              boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
              outline: 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Icon size={14} strokeWidth={isActive ? 2.2 : 1.7} />
            {!compact && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
