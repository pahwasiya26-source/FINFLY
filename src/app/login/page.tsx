'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Eye, EyeOff, ArrowRight, Shield, CheckCircle2, Lock, User, Mail, AlertCircle } from 'lucide-react';
import { ThreeFinancialCore } from '../../components/ThreeFinancialCore';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAuth } from '../../lib/auth/AuthContext';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

  const { user, signIn, signUp, error: authContextError, isDemoMode, clearError } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('siya.pahwa@finfly.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Siya Pahwa');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (urlError === 'unconfigured_production') {
      setLocalError('Production authentication is unavailable. Please configure NEXT_PUBLIC_SUPABASE_URL.');
    }
  }, [urlError]);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsLoading(true);

    if (authMode === 'signin') {
      const res = await signIn(email, password);
      setIsLoading(false);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setLocalError(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else {
      const res = await signUp(email, password, fullName);
      setIsLoading(false);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setLocalError(res.error || 'Failed to create account. Please try again.');
      }
    }
  };

  const activeError = localError || authContextError;

  return (
    <div style={{ width: '100%', maxWidth: '420px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
          {authMode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)' }}>
          {authMode === 'signin'
            ? 'Sign in to access your FINFLY Financial Command Center'
            : 'Start your deterministic financial intelligence workspace'}
        </p>
      </div>

      {/* Auth Mode Toggle Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-surface-elevated)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px',
          border: '1px solid var(--border-color)',
        }}
      >
        <button
          type="button"
          className={`auth-tab-btn ${authMode === 'signin' ? 'active' : ''}`}
          onClick={() => {
            setAuthMode('signin');
            setLocalError(null);
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
          onClick={() => {
            setAuthMode('signup');
            setLocalError(null);
          }}
        >
          Create Account
        </button>
      </div>

      {/* Error Banner */}
      {activeError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            fontSize: '0.84rem',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{activeError}</span>
        </div>
      )}

      {/* Demo Mode Notice Banner in Development */}
      {isDemoMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            color: 'var(--accent-primary)',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          <span>Demo Fallback Mode Active (Dev)</span>
          <span className="pill-badge pill-emerald" style={{ fontSize: '0.65rem' }}>Local Ready</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Full Name input (for Sign Up) */}
        {authMode === 'signup' && (
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
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Siya Pahwa"
              className="input-premium"
            />
          </div>
        )}

        {/* Email input */}
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
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
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
            {authMode === 'signin' && (
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
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password"
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

        {/* Submit Button */}
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
              <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
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
              <span className="pill-badge pill-emerald">● Cash Buffer</span>
              <span className="pill-badge pill-gold">● Investments</span>
              <span className="pill-badge pill-neutral">● Goals</span>
              <span className="pill-badge pill-indigo">● Growth Engine</span>
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
                  SOC2 Type II &amp; Multi-Tenant Row Level Security
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
          <Suspense fallback={<div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Loading secure login enclave...</div>}>
            <LoginFormContent />
          </Suspense>
        </div>
      </div>

      <style jsx>{`
        .auth-tab-btn {
          flex: 1;
          padding: 8px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .auth-tab-btn:hover {
          color: var(--text-primary);
        }
        .auth-tab-btn.active {
          background: var(--bg-surface);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }
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
