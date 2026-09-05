'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Mail,
  ArrowRight,
  ArrowLeft,
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

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emailId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resetPasswordForEmail(trimmedEmail);
      if (res.success) {
        setSubmitted(true);
      } else {
        // Privacy: only display user-friendly message if rate limit or network error
        setErrorMessage(res.error || 'Unable to process password reset request. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        background: 'var(--bg-base)',
        position: 'relative',
      }}
      className="forgot-password-root-grid"
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
        className="forgot-password-left-col"
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
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Secure PKCE Tokens</div>
          </div>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'var(--indigo-accent)', marginBottom: '4px' }}><Cpu size={16} /></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Privacy First</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Anti-Enumeration Guard</div>
          </div>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
            <div style={{ color: 'var(--gold-accent)', marginBottom: '4px' }}><TrendingUp size={16} /></div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Enclave Security</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Supabase Auth Protected</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: FORGOT PASSWORD FORM CARD */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
          {/* Back link */}
          <div style={{ marginBottom: '24px' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.15s ease',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>

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
              Reset your <span style={{ color: 'var(--accent-primary)' }}>password</span>
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enter your email and we&apos;ll send you a secure password reset link.
            </p>
          </div>

          {/* Success State (Generic Privacy UX) */}
          {submitted ? (
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
                    Password Recovery Request Dispatched
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    If an active FINEXFLY account is registered for <strong>{email}</strong>, a single-use password recovery link has been generated and dispatched by Supabase Auth.
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-primary)' }}>Important Delivery Notes:</p>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Check your <strong>Spam / Junk</strong> folder if the link does not appear in your primary inbox within 60 seconds.</li>
                  <li>In accordance with cryptographic anti-enumeration standards, unregistered email addresses will not receive a message.</li>
                  <li>Password recovery links expire after single use or within the configured TTL.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.88rem' }}
                >
                  Try another email
                </button>

                <Link
                  href="/login"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.88rem',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Return to Sign In</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            /* Form */
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
                    autoComplete="email"
                    className="input-premium"
                    placeholder="name@example.com"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
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
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
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
            <span>Protected with Supabase PKCE Authentication</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 960px) {
          .forgot-password-root-grid {
            grid-template-columns: 1fr !important;
          }
          .forgot-password-left-col {
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
