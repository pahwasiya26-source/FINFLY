'use client';

import React, { useState, useEffect, Suspense, useId, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
  User,
  Mail,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ThreeFinancialCore } from '../../components/ThreeFinancialCore';
import { useAuth } from '../../lib/auth/AuthContext';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

  const { user, isLoading: authLoading, signIn, signUp, error: authContextError, isDemoMode, clearError } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Bug 2, 3, 4 fix: never pre-fill email, password, or name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  // Bug 1 & 6 fix: track post-signup confirmation state
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState('');
  // Prevent duplicate submission races
  const submittingRef = useRef(false);

  const fullNameId = useId();
  const emailId = useId();
  const passwordId = useId();

  useEffect(() => {
    if (urlError === 'unconfigured_production') {
      setLocalError('Production authentication is unavailable. Please configure NEXT_PUBLIC_SUPABASE_URL.');
    }
  }, [urlError]);

  // Bug 5 fix: use AuthContext isLoading (authLoading) not local submit state
  // to guard the redirect — prevents double-push race conditions
  useEffect(() => {
    if (user && !authLoading && !confirmationSent) {
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, redirectUrl, confirmationSent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Bug 5 fix: guard with both ref (synchronous) and state to prevent any race
    if (isSubmitting || submittingRef.current) return;
    submittingRef.current = true;
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        const res = await signIn(email, password);
        if (res.success) {
          // onAuthStateChange in AuthContext will update user state;
          // the redirect useEffect above will fire automatically.
          // Do not push here to avoid double redirect.
        } else {
          setLocalError(res.error || 'Failed to sign in. Please check your credentials.');
        }
      } else {
        const res = await signUp(email, password, fullName);
        if (res.success) {
          if (res.requiresConfirmation) {
            // Bug 1 fix: do NOT redirect. Show confirmation UI instead.
            setConfirmedEmail(email);
            setConfirmationSent(true);
          }
          // If requiresConfirmation is false, AuthContext already has a session;
          // the redirect useEffect will fire automatically via user state change.
        } else {
          setLocalError(res.error || 'Failed to create account. Please try again.');
        }
      }
    } catch (err: any) {
      setLocalError(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const activeError = localError || authContextError;
  const isLoading = isSubmitting; // alias for JSX below (button disabled state)

  // Bug 6 fix: full confirmation-sent UI — shown after signup when email confirmation is required
  if (confirmationSent) {
    return (
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '16px',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={28} color="var(--accent-primary)" />
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}
            >
              Check your inbox
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We sent a confirmation link to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{confirmedEmail}</strong>.
              Click the link in the email to activate your account and sign in.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '0.81rem',
              color: 'var(--text-tertiary)',
              lineHeight: 1.5,
              width: '100%',
            }}
          >
            <strong style={{ color: 'var(--text-secondary)' }}>Didn&apos;t receive it?</strong> Check your spam or junk folder.
            The link expires after 24 hours.
          </div>

          <button
            type="button"
            className="btn-ghost"
            style={{ width: '100%', marginTop: '4px' }}
            onClick={() => {
              setConfirmationSent(false);
              setAuthMode('signin');
              setEmail(confirmedEmail);
              setPassword('');
              setLocalError(null);
              clearError();
            }}
          >
            Back to Sign In
          </button>
        </div>

        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.76rem',
            color: 'var(--text-tertiary)',
          }}
        >
          <Shield size={14} color="var(--accent-primary)" />
          <span>Your account is secured with Supabase Auth</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      {/* Headings */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '6px',
            lineHeight: 1.15,
          }}
        >
          {authMode === 'signin' ? (
            <>
              Welcome <span style={{ color: 'var(--accent-primary)' }}>back</span>
            </>
          ) : (
            <>
              Create your <span style={{ color: 'var(--accent-primary)' }}>account</span>
            </>
          )}
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          {authMode === 'signin'
            ? 'Sign in to access your financial intelligence operating system'
            : 'Start your deterministic financial intelligence workspace'}
        </p>
      </div>

      {/* FULL-WIDTH SEGMENTED AUTH SWITCH */}
      <div
        role="tablist"
        aria-label="Authentication Mode"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          padding: '4px',
          width: '100%',
          background: 'var(--bg-surface-subtle)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '22px',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'signin'}
          onClick={() => {
            setAuthMode('signin');
            setLocalError(null);
            clearError();
          }}
          className={authMode === 'signin' ? 'btn-primary' : 'btn-ghost'}
          style={{
            borderRadius: '9px',
            fontSize: '0.86rem',
            padding: '8px',
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={authMode === 'signup'}
          onClick={() => {
            setAuthMode('signup');
            setLocalError(null);
            clearError();
          }}
          className={authMode === 'signup' ? 'btn-primary' : 'btn-ghost'}
          style={{
            borderRadius: '9px',
            fontSize: '0.86rem',
            padding: '8px',
          }}
        >
          Create Account
        </button>
      </div>

      {/* ERROR NOTICE */}
      {activeError && (
        <div
          role="alert"
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.84rem',
            color: 'var(--danger)',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{activeError}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {authMode === 'signup' && (
          <div>
            <label
              htmlFor={fullNameId}
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id={fullNameId}
                type="text"
                required
                className="input-premium"
                placeholder="Siya Pahwa"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <User
                size={16}
                color="var(--text-tertiary)"
                style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor={emailId}
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id={emailId}
              type="email"
              required
              className="input-premium"
              placeholder="siya.pahwa@finfly.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
            <Mail
              size={16}
              color="var(--text-tertiary)"
              style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label
              htmlFor={passwordId}
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{
                fontSize: '0.78rem',
                color: 'var(--accent-primary)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              className="input-premium"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '38px', paddingRight: '40px' }}
            />
            <Lock
              size={16}
              color="var(--text-tertiary)"
              style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
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
                padding: '4px',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isLoading || authLoading}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '0.94rem',
            fontWeight: 700,
            marginTop: '8px',
          }}
        >
          {isLoading || authLoading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>{authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
            </>
          ) : (
            <>
              <span>{authMode === 'signin' ? 'Sign In to FINEXFLY' : 'Create Verified Workspace'}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* AUTH NAVIGATION UX */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.84rem',
            color: 'var(--text-tertiary)',
            marginTop: '6px',
          }}
        >
          {authMode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setLocalError(null);
                  clearError();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                }}
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              Need an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setLocalError(null);
                  clearError();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                }}
              >
                Create account
              </button>
            </span>
          )}
        </div>
      </form>

      {/* SECURITY FOOTER */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.76rem',
          color: 'var(--text-tertiary)',
        }}
      >
        <Shield size={14} color="var(--accent-primary)" />
        <span>Hardware Enclave Protected • Cryptographically Signed</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        background: 'var(--bg-base)',
      }}
      className="login-root-grid"
    >
      {/* LEFT COLUMN: BRANDING & 3D FINANCIAL CORE */}
      <div
        style={{
          background: 'var(--bg-surface-glass)',
          borderRight: '1px solid var(--border-color)',
          padding: '48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="login-left-col"
      >
        {/* Brand Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
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
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.04em' }}>
              FINEXFLY
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)' }}>
            Financial Intelligence Operating System
          </p>
        </div>

        {/* Medium-sized 3D Financial Core */}
        <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ThreeFinancialCore mode="login" height={320} interactive />
        </div>

        {/* Trust Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '4px' }}><Shield size={16} /></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Deterministic</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Deterministic Math</div>
          </div>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'var(--indigo-accent)', marginBottom: '4px' }}><Cpu size={16} /></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Digital Twin</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>12-Month Simulation</div>
          </div>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'var(--gold-accent)', marginBottom: '4px' }}><TrendingUp size={16} /></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Enclave Security</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Supabase RLS Protected</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: SPACIOUS AUTHENTICATION CARD */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
        }}
      >
        <Suspense fallback={<div style={{ color: 'var(--text-tertiary)' }}>Loading authentication...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>

      <style jsx>{`
        @media (max-width: 960px) {
          .login-root-grid {
            grid-template-columns: 1fr !important;
          }
          .login-left-col {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
