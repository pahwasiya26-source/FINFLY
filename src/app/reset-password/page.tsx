'use client';

import React, { useState, useEffect, useId, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  TrendingUp,
  KeyRound,
} from 'lucide-react';
import { ThreeFinancialCore } from '../../components/ThreeFinancialCore';
import { useAuth } from '../../lib/auth/AuthContext';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '../../lib/supabase/client';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const urlMessage = searchParams.get('message');
  const code = searchParams.get('code');

  const { updatePassword, user, isLoading: authLoading } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);

  const newPasswordId = useId();
  const confirmPasswordId = useId();

  // Check if a recovery session or authenticated session is active
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const configured = isSupabaseConfigured();

    if (urlMessage || urlError) {
      setErrorMessage(urlMessage || 'The password reset link is invalid or has expired.');
    }

    if (!configured || !supabase) {
      // In local dev demo mode, recovery session is simulated as active
      setHasRecoverySession(true);
      return;
    }

    // 1. Detect if recovery tokens exist in URL hash fragment
    const hasHashRecovery =
      typeof window !== 'undefined' &&
      (window.location.hash.includes('access_token') ||
       window.location.hash.includes('type=recovery'));

    // 2. If code parameter exists in search params and session is not yet set, attempt client exchange
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (data?.session) {
          setHasRecoverySession(true);
        } else if (error) {
          console.warn('[FINEXFLY Reset Password] Client code exchange notice:', error.message);
        }
      });
    }

    // 3. Query current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasRecoverySession(true);
      } else if (!hasHashRecovery && !code) {
        // Only mark missing if no hash or query token is in flight
        setHasRecoverySession(false);
      }
    });

    // 4. Subscribe to auth state updates (e.g. detectSessionInUrl parsing hash fragment)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === 'PASSWORD_RECOVERY' ||
        (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION'))
      ) {
        setHasRecoverySession(true);
        setErrorMessage(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [code, urlError, urlMessage]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation: minimum length
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    // 2. Validation: match
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both fields match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to update password. Your reset link may have expired.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred while updating your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      {/* Card Icon */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'var(--accent-primary-subtle)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <KeyRound size={22} />
      </div>

      {/* Heading */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '6px',
            lineHeight: 1.15,
          }}
        >
          Create a new <span style={{ color: 'var(--accent-primary)' }}>password</span>
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Enter your new password below to update your FINEXFLY account credentials.
        </p>
      </div>

      {/* Success State */}
      {success ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              borderRadius: '12px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <CheckCircle2 size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Password updated
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Your password has been updated successfully. You can now sign in with your new credentials.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.94rem',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '8px',
            }}
          >
            <span>Continue to Sign In</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      ) : hasRecoverySession === false && isSupabaseConfigured() ? (
        /* Expired or Missing Session Notice */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            role="alert"
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: '12px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              fontSize: '0.86rem',
              color: 'var(--danger)',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Invalid or Expired Reset Link</div>
              <p style={{ margin: 0, lineHeight: 1.4 }}>
                {errorMessage || 'Your password reset session has expired or is invalid. Please request a new password reset link.'}
              </p>
            </div>
          </div>

          <Link
            href="/forgot-password"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.94rem',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Request New Reset Link</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        /* Reset Password Form */
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Error Notice */}
          {errorMessage && (
            <div
              role="alert"
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                color: 'var(--danger)',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* New Password */}
          <div>
            <label
              htmlFor={newPasswordId}
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
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id={newPasswordId}
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                className="input-premium"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
              />
              <Lock
                size={16}
                color="var(--text-tertiary)"
                style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
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
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor={confirmPasswordId}
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
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id={confirmPasswordId}
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                className="input-premium"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
              />
              <Lock
                size={16}
                color="var(--text-tertiary)"
                style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.94rem',
              fontWeight: 700,
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer Security Badge */}
      <div
        style={{
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.76rem',
          color: 'var(--text-tertiary)',
        }}
      >
        <Shield size={14} color="var(--accent-primary)" />
        <span>End-to-End Encrypted Supabase Auth</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        background: 'var(--bg-base)',
        position: 'relative',
      }}
      className="reset-password-root-grid"
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
        className="reset-password-left-col"
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

        {/* 3D Financial Core */}
        <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ThreeFinancialCore mode="login" height={320} interactive />
        </div>

        {/* Trust Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '4px' }}><Shield size={16} /></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Cryptographic</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Zero Plaintext Storage</div>
          </div>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'var(--indigo-accent)', marginBottom: '4px' }}><Cpu size={16} /></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Session Guard</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Single-Use Recovery</div>
          </div>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'var(--gold-accent)', marginBottom: '4px' }}><TrendingUp size={16} /></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Enclave Security</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Supabase Auth Protected</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RESET PASSWORD FORM CARD */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
        }}
      >
        <Suspense fallback={<div style={{ color: 'var(--text-tertiary)' }}>Loading password recovery...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>

      <style jsx>{`
        @media (max-width: 960px) {
          .reset-password-root-grid {
            grid-template-columns: 1fr !important;
          }
          .reset-password-left-col {
            display: none !important;
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
