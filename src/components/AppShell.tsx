'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MainNavigation } from './MainNavigation';
import { ModeToggle } from './ModeToggle';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../lib/auth/AuthContext';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const isLoginPage = pathname === '/login';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on login page, render full screen without dashboard shell
  if (isLoginPage) {
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
              title="Switch user or lock workspace"
            >
              <span>Lock / Sign Out</span>
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
        }

        .mobile-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: var(--bg-overlay);
          backdrop-filter: blur(8px);
          z-index: 90;
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
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 30;
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
          gap: 8px;
          padding: 5px 12px;
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
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .top-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
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
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface-subtle);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .main-content-scroll {
          flex: 1 1 auto;
          width: 100%;
          min-width: 0;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 32px 36px;
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
            padding: 24px 20px;
          }
        }

        @media (max-width: 640px) {
          .top-header-bar {
            padding: 0 12px;
          }
          .topbar-divider,
          .topbar-lock-btn,
          .system-status-pill {
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
