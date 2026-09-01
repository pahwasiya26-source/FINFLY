'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Eye, EyeOff, ArrowRight, Shield, CheckCircle2, Lock } from 'lucide-react';
import { ThreeFinancialCore } from '../../components/ThreeFinancialCore';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('siya.pahwa@finfly.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Smooth transition into dashboard
    setTimeout(() => {
      router.push('/');
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top right theme switcher */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '28px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <ThemeToggle />
      </div>

      {/* Responsive 2-Column Split */}
      <div
        className="login-container"
        style={{
          display: 'flex',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {/* ==========================================================
            LEFT COLUMN: CINEMATIC 3D VISUAL & BRAND EXPERIENCE
            ========================================================== */}
        <div
          className="login-visual-panel"
          style={{
            flex: '1.15',
            background: 'linear-gradient(145deg, var(--bg-surface-glass) 0%, var(--bg-surface-subtle) 100%)',
            borderRight: '1px solid var(--border-color)',
            padding: '48px 56px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Brand header */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px var(--accent-glow)',
                  color: '#ffffff',
                }}
              >
                <Sparkles size={20} strokeWidth={2.4} />
              </div>
              <span
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                }}
              >
                FINFLY
              </span>
            </div>
            <p
              style={{
                fontFamily: 'Outfit',
                fontSize: '1.25rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                letterSpacing: '-0.01em',
              }}
            >
              Your financial system. Understood.
            </p>
          </div>

          {/* Center: Interactive 3D Financial Nexus */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '20px 0',
            }}
          >
            <ThreeFinancialCore mode="login" height={380} interactive />

            {/* Floating Live Financial Nodes Indicator */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '12px',
              }}
            >
              <span className="pill-badge pill-emerald">
                ● Cash Buffer
              </span>
              <span className="pill-badge pill-gold">
                ● Investments
              </span>
              <span className="pill-badge pill-neutral">
                ● Goals
              </span>
              <span className="pill-badge pill-indigo">
                ● Growth Engine
              </span>
            </div>
          </div>

          {/* Bottom Security / Trust Statement */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: '16px',
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-color)',
              backdropFilter: 'var(--glass-blur)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'var(--accent-primary-subtle)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={16} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  SOC2 Type II & Zero-Knowledge Enclave
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                  Deterministic accounting engine — strictly non-hallucinatory
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <CheckCircle2 size={14} />
              Active
            </div>
          </div>
        </div>

        {/* ==========================================================
            RIGHT COLUMN: PREMIUM AUTHENTICATION AREA
            ========================================================== */}
        <div
          className="login-auth-panel"
          style={{
            flex: '0.95',
            padding: '48px 56px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <div style={{ width: '100%', maxWidth: '420px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)' }}>
                Sign in to continue to FINFLY AI Financial OS
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Identifier input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@company.com or +91 98765 43210"
                  className="input-premium"
                />
              </div>

              {/* Password input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset instructions sent to registered recovery channel.')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      color: 'var(--accent-primary)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter master password"
                    className="input-premium"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    accentColor: 'var(--accent-primary)',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                  }}
                />
                <label
                  htmlFor="rememberMe"
                  style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Keep this device trusted for 30 days
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '0.96rem',
                  letterSpacing: '0.01em',
                  marginTop: '6px',
                }}
              >
                {isLoading ? (
                  <span>Authenticating secure enclave...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                margin: '28px 0 22px 0',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                or continue with
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

            {/* OAuth Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
              <button
                type="button"
                onClick={handleSignIn}
                className="btn-secondary"
                style={{ padding: '11px', width: '100%' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleSignIn}
                className="btn-secondary"
                style={{ padding: '11px', width: '100%' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.66-.99 1.72-.85 2.74 1 .08 1.94-.49 2.56-1.24z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Create Account link */}
            <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              New to FINFLY?{' '}
              <Link
                href="/"
                style={{
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 960px) {
          .login-container {
            flex-direction: column !important;
          }
          .login-visual-panel {
            flex: none !important;
            padding: 40px 24px !important;
            min-height: 440px;
          }
          .login-auth-panel {
            flex: none !important;
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
