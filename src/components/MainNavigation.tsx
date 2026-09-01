'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Briefcase,
  Receipt,
  Cpu,
  ShieldCheck,
  Bot,
  FileText,
  Boxes,
  Lock,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../lib/auth/AuthContext';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; color?: string }>;
  badge?: string;
}

export const navItems: NavItem[] = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Money Flow', href: '/money-flow', icon: ArrowLeftRight },
  { name: 'Investments', href: '/investments', icon: TrendingUp },
  { name: 'Business', href: '/business', icon: Briefcase },
  { name: 'Taxes', href: '/taxes', icon: Receipt },
  { name: 'Financial Twin', href: '/financial-twin', icon: Cpu, badge: 'Deterministic' },
  { name: 'Finance Controller', href: '/finance-controller', icon: ShieldCheck },
  { name: 'AI CFO', href: '/ai-cfo', icon: Bot, badge: 'Zero-Hallucination' },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'AI Agents', href: '/ai-agents', icon: Boxes },
  { name: 'Privacy Center', href: '/privacy-center', icon: Lock },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface MainNavigationProps {
  onNavigate?: () => void;
}

export function MainNavigation({ onNavigate }: MainNavigationProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  return (
    <aside
      style={{
        width: '272px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 18px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '0 8px 20px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link 
          href="/" 
          onClick={onNavigate}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px var(--accent-glow)',
              color: '#ffffff',
            }}
          >
            <Sparkles size={18} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                }}
              >
                FINFLY
              </span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  boxShadow: '0 0 8px var(--accent-primary)',
                }}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', letterSpacing: '0.02em', fontWeight: 500 }}>
              AI Financial OS
            </div>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          margin: '16px -8px',
          padding: '0 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            padding: '8px 12px 4px 12px',
          }}
        >
          Core Platform
        </div>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href)) ||
            (item.href === '/financial-twin' && pathname.startsWith('/digital-twin')) ||
            (item.href === '/finance-controller' && pathname.startsWith('/reconciliation')) ||
            (item.href === '/ai-agents' && pathname.startsWith('/agents')) ||
            (item.href === '/privacy-center' && pathname.startsWith('/privacy'));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                fontWeight: isActive ? 600 : 450,
                fontSize: '0.88rem',
                border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                <div
                  style={{
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} />
                </div>
                <span>{item.name}</span>
              </div>

              {item.badge ? (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: isActive ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-hover)',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight size={14} color="var(--text-tertiary)" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div
        style={{
          paddingTop: '14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Theme control row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            Appearance
          </span>
          <ThemeToggle compact />
        </div>

        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '12px',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #059669 100%)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {profile?.fullName
              ? profile.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'SP'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {profile?.fullName || 'Siya Pahwa'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
              ● {user ? 'Verified Enterprise' : 'Guest'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
