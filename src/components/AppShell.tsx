'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MainNavigation } from './MainNavigation';
import { ModeToggle } from './ModeToggle';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../lib/auth/AuthContext';
import { useStore } from '../store/useStore';
import { Menu, X, Shield, Lock } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { dataMode, fetchAndHydrate } = useStore();
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/auth/');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // App/Session-level data hydration — runs once when user session is active
  React.useEffect(() => {
    if (user?.id && dataMode !== 'DEMO') {
      fetchAndHydrate(user.id);
    }
  }, [user?.id, dataMode, fetchAndHydrate]);

  // If on authentication pages, render full screen without dashboard shell
  if (isAuthPage) {
    return <main style={{ minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>{children}</main>;
  }

  return (
    <div className="app-shell-root">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <MainNavigation />
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileNavOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <MainNavigation onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area with TopBar */}
      <div className="app-main-column">
        {/* Top Control Bar */}
        <header className="top-header-bar">
          {/* Left: Mobile trigger & System Status */}
          <div className="top-header-left">
            <button
              type="button"
              className="mobile-menu-btn"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* System Status Pill */}
            <div className="system-status-pill">
              <span className="status-dot" />
              <span className="status-text">
                Deterministic Engine Active
              </span>
            </div>

            <div className="system-enclave-badge">
              <Shield size={13} color="var(--accent-primary)" />
              <span>Hardware Enclave</span>
            </div>
          </div>

          {/* Right: Entity switcher, theme toggle, actions */}
          <div className="top-header-right">
            <ModeToggle />

            <div className="topbar-divider" />

            <ThemeToggle compact />

            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              className="topbar-lock-btn"
              title="Lock session and return to login"
            >
              <Lock size={13} />
              <span>Lock Workspace</span>
            </button>
          </div>
        </header>

        {/* Page Children with responsive padding */}
        <main className="main-content-scroll">
          {children}
        </main>
      </div>

      <style jsx>{`
        .app-shell-root {
          display: flex;
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          position: relative;
          overflow-x: hidden;
        }

        .desktop-sidebar {
          display: block;
          flex-shrink: 0;
          width: 272px;
          z-index: 70;
        }

        .mobile-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: var(--bg-overlay);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 95;
        }

        .mobile-drawer-content {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 280px;
          max-width: 85vw;
          z-index: 100;
        }

        .app-main-column {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 100vh;
          width: calc(100% - 272px);
          max-width: 100%;
        }

        .top-header-bar {
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-surface-glass);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 60;
          width: 100%;
          gap: 12px;
        }

        .top-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .mobile-menu-btn {
          display: none;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 6px;
          color: var(--text-primary);
          cursor: pointer;
          flex-shrink: 0;
        }

        .system-status-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 4px 11px;
          border-radius: 999px;
          background: var(--bg-surface-subtle);
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent-primary);
          box-shadow: 0 0 8px var(--accent-primary);
          flex-shrink: 0;
        }

        .status-text {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .system-enclave-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-tertiary);
          padding: 4px 9px;
          border-radius: 6px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          white-space: nowrap;
        }

        .top-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .topbar-divider {
          width: 1px;
          height: 20px;
          background: var(--border-color);
        }

        .topbar-lock-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface-subtle);
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .topbar-lock-btn:hover {
          background: var(--bg-surface-hover);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }

        .main-content-scroll {
          flex: 1 1 auto;
          width: 100%;
          min-width: 0;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 28px 36px;
        }

        @media (max-width: 1024px) {
          .desktop-sidebar {
            display: none !important;
          }
          .app-main-column {
            width: 100% !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .main-content-scroll {
            padding: 20px 18px;
          }
        }

        @media (max-width: 768px) {
          .top-header-bar {
            padding: 0 14px;
          }
          .system-enclave-badge {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .top-header-bar {
            padding: 0 12px;
          }
          .topbar-divider,
          .topbar-lock-btn,
          .system-status-pill,
          .system-enclave-badge {
            display: none !important;
          }
          .main-content-scroll {
            padding: 16px 12px;
          }
        }
      `}</style>
    </div>
  );
}
